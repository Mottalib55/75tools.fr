import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { formatRestant, basculerPleinEcran, sonner, creerAudio } from "@/lib/temps";
import { cn } from "@/lib/utils";

const PRESETS = [
  { libelle: "1 min", s: 60 },
  { libelle: "3 min", s: 180 },
  { libelle: "5 min", s: 300 },
  { libelle: "10 min", s: 600 },
  { libelle: "15 min", s: 900 },
  { libelle: "20 min", s: 1200 },
  { libelle: "25 min", s: 1500 },
  { libelle: "30 min", s: 1800 },
  { libelle: "1 h", s: 3600 },
];

const FAQ: QuestionFaq[] = [
  {
    q: "La sonnerie se déclenche-t-elle si je regarde un autre onglet ?",
    r: "Oui. Au démarrage, la sonnerie est programmée dans le moteur audio du navigateur pour l'heure exacte de fin, au lieu d'attendre qu'une minuterie de la page la déclenche : les navigateurs ralentissent ces minuteries dans les onglets en arrière-plan, pas l'audio programmé. Laissez l'onglet ouvert et le son de l'ordinateur actif. Sur téléphone, verrouiller l'écran peut suspendre le son : gardez l'écran allumé, la page le demande d'ailleurs au système quand c'est possible.",
  },
  {
    q: "Pourquoi aucun son ne sort alors que le minuteur est terminé ?",
    r: "Vérifiez d'abord le volume de l'appareil, le mode silencieux du téléphone (sur iPhone, le bouton latéral coupe aussi le son des pages web) et le curseur de volume de la page. Les navigateurs interdisent aussi à une page de jouer un son avant le premier clic : c'est pourquoi la sonnerie est préparée au moment où vous appuyez sur Démarrer. Le bouton « Tester le son » permet de vérifier avant de lancer un long décompte.",
  },
  {
    q: "Comment faire la méthode Pomodoro avec ce minuteur ?",
    r: "Lancez 25 minutes de travail sans interruption, puis 5 minutes de pause, et recommencez ; après quatre séries, faites une pause plus longue de 15 à 30 minutes. Les boutons 25 min et 5 min sont là pour ça. Notez à chaque sonnerie ce que vous avez avancé : c'est ce bilan régulier, plus que la durée exacte, qui rend la méthode utile.",
  },
  {
    q: "Puis-je régler un minuteur de plus d'une heure ?",
    r: "Oui, jusqu'à 23 heures 59 minutes 59 secondes avec les champs heures, minutes et secondes. Pour un événement à une date précise, demain ou dans trois semaines, utilisez plutôt le compte à rebours : on y indique la date et l'heure visées, et il affiche les jours restants. Il peut aussi se partager par un lien.",
  },
];

const nombre = (s: string) => {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const Minuteur = () => {
  const [h, setH] = useState("0");
  const [m, setM] = useState("10");
  const [sec, setSec] = useState("0");
  const [alerte, setAlerte] = useState("");
  const [duree, setDuree] = useState(600_000);
  const [fin, setFin] = useState<number | null>(null); // heure de fin (Date.now) quand il tourne
  const [restantPause, setRestantPause] = useState(600_000);
  const [restant, setRestant] = useState(600_000);
  const [termine, setTermine] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [notif, setNotif] = useState(false);
  const [etat, setEtat] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const sortie = useRef<GainNode | null>(null);
  const verrou = useRef<{ release: () => Promise<void> } | null>(null);
  const cadre = useRef<HTMLDivElement>(null);
  const titreOrigine = useRef("");

  const enMarche = fin !== null;

  const ctx = () => {
    if (!audio.current) audio.current = creerAudio();
    audio.current?.resume().catch(() => {});
    return audio.current;
  };

  const annulerSon = () => {
    sortie.current?.disconnect();
    sortie.current = null;
  };

  const programmerSon = (dansMs: number) => {
    annulerSon();
    const c = ctx();
    if (!c) return;
    // Sonnerie programmée dans le moteur audio, pour l'heure exacte de fin : pas de dépendance aux minuteries.
    const g = c.createGain();
    g.connect(c.destination);
    sortie.current = g;
    try {
      sonner(c, volume, 3, dansMs / 1000, g);
    } catch {
      /* son indisponible */
    }
  };

  const garderEcran = async () => {
    try {
      const nav = navigator as unknown as { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock) verrou.current = await nav.wakeLock.request("screen");
    } catch {
      /* refusé : pas grave */
    }
  };
  const libererEcran = () => {
    verrou.current?.release().catch(() => {});
    verrou.current = null;
  };

  // Durée saisie → durée du minuteur (seulement à l'arrêt)
  const appliquerSaisie = (hh: string, mm: string, ss: string) => {
    let H = nombre(hh), M = nombre(mm), S = nombre(ss);
    const notes: string[] = [];
    if (H > 23) { H = 23; notes.push("23 heures au plus"); }
    if (M > 59) { M = 59; notes.push("59 minutes au plus"); }
    if (S > 59) { S = 59; notes.push("59 secondes au plus"); }
    setAlerte(notes.length ? `Valeur ramenée : ${notes.join(", ")}.` : "");
    const ms = (H * 3600 + M * 60 + S) * 1000;
    if (!enMarche) {
      setDuree(ms);
      setRestantPause(ms);
      setRestant(ms);
      setTermine(false);
    }
    return { H, M, S };
  };

  const choisirPreset = (s: number) => {
    const H = Math.floor(s / 3600), M = Math.floor((s % 3600) / 60), S = s % 60;
    setH(String(H)); setM(String(M)); setSec(String(S));
    setAlerte("");
    annulerSon();
    setFin(null);
    setDuree(s * 1000);
    setRestantPause(s * 1000);
    setRestant(s * 1000);
    setTermine(false);
  };

  const demarrer = () => {
    const base = termine || restantPause <= 0 ? duree : restantPause;
    if (base <= 0) {
      setAlerte("Indiquez une durée avant de démarrer.");
      return;
    }
    setTermine(false);
    setFin(Date.now() + base);
    programmerSon(base);
    garderEcran();
  };

  const pause = () => {
    if (fin === null) return;
    const r = Math.max(0, fin - Date.now());
    setRestantPause(r);
    setRestant(r);
    setFin(null);
    annulerSon();
    libererEcran();
  };

  const reinitialiser = () => {
    setFin(null);
    annulerSon();
    libererEcran();
    setRestantPause(duree);
    setRestant(duree);
    setTermine(false);
  };

  // Boucle d'affichage et détection de la fin
  useEffect(() => {
    if (fin === null) return;
    const tic = () => {
      const r = fin - Date.now();
      if (r <= 0) {
        setRestant(0);
        setRestantPause(0);
        setFin(null);
        setTermine(true);
        libererEcran();
        if (notif && typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("Minuteur terminé", { body: `${formatRestant(duree)} écoulées.` });
          } catch {
            /* notifications indisponibles */
          }
        }
      } else setRestant(r);
    };
    tic();
    const id = window.setInterval(tic, 200);
    return () => window.clearInterval(id);
  }, [fin, notif, duree]);

  // Temps restant dans le titre de l'onglet
  useEffect(() => {
    if (!titreOrigine.current) titreOrigine.current = document.title;
    if (enMarche) document.title = `${formatRestant(restant)} · Minuteur`;
    else if (termine) document.title = "Terminé · Minuteur";
    else if (titreOrigine.current) document.title = titreOrigine.current;
  }, [enMarche, termine, restant]);

  useEffect(
    () => () => {
      annulerSon();
      libererEcran();
      audio.current?.close().catch(() => {});
      if (titreOrigine.current) document.title = titreOrigine.current;
    },
    []
  );

  const demanderNotif = async (v: boolean) => {
    setNotif(v);
    if (!v) return;
    if (typeof Notification === "undefined") {
      setEtat("Ce navigateur ne propose pas les notifications.");
      setNotif(false);
      return;
    }
    const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (p !== "granted") {
      setEtat("Notifications refusées : la sonnerie et le titre de l'onglet préviendront quand même.");
      setNotif(false);
    } else setEtat("Une notification s'affichera à la fin du décompte.");
  };

  const progression = duree > 0 ? 1 - restant / duree : 0;

  return (
    <PageOutil
      href="/minuteur/"
      titre="Minuteur en ligne gratuit : 10 minutes ou durée libre"
      description="Minuteur en ligne gratuit avec sonnerie : 1, 5, 10, 25 minutes ou durée libre, pause, plein écran, temps restant dans l'onglet. Juste même en arrière-plan."
      motsCles="minuteur en ligne, minuteur 10 minutes, timer en ligne gratuit, minuteur avec sonnerie, minuteur pomodoro"
      faq={FAQ}
      nomAppli="Minuteur en ligne"
      h1="Minuteur en ligne avec sonnerie"
      chapeau="Choisissez une durée, démarrez : le temps restant s'affiche en grand et dans le titre de l'onglet, et une sonnerie retentit à la fin. Rien à installer, aucun son téléchargé."
      sources={[
        { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 octobre 2026" },
        { editeur: "MDN Web Docs", titre: "Autoplay guide for media and Web Audio APIs", url: "https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay", lu: "27 octobre 2026" },
        { editeur: "MDN Web Docs", titre: "Screen Wake Lock API", url: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div
          ref={cadre}
          className={cn(
            "rounded-xl border bg-neutral-900 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 [&:fullscreen]:bg-neutral-950",
            termine ? "border-amber-400" : "border-neutral-800"
          )}
        >
          <p className="font-mono tabular-nums text-white text-[3.5rem] leading-none sm:text-7xl lg:text-8xl tracking-tight" aria-label="Temps restant">
            {formatRestant(restant)}
          </p>
          <div className="w-full max-w-md h-1.5 rounded-full bg-neutral-800 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, Math.max(0, progression * 100))}%` }} />
          </div>
          <p role="status" aria-live="polite" className={cn("text-lg min-h-[1.75rem]", termine ? "text-amber-300" : "text-neutral-500")}>
            {termine ? "Temps écoulé !" : enMarche ? "En cours" : restant < duree && restant > 0 ? "En pause" : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {enMarche ? (
              <Bouton onClick={pause}>Pause</Bouton>
            ) : (
              <Bouton onClick={demarrer}>{restant < duree && restant > 0 ? "Reprendre" : "Démarrer"}</Bouton>
            )}
            <Bouton secondaire onClick={reinitialiser}>
              Réinitialiser
            </Bouton>
            <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
              Plein écran
            </Bouton>
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          <div>
            <p className="text-sm text-neutral-300 mb-2">Durées courantes</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.s}
                  type="button"
                  onClick={() => choisirPreset(p.s)}
                  aria-pressed={duree === p.s * 1000}
                  className={cn(
                    "h-11 rounded-md border text-sm whitespace-nowrap",
                    duree === p.s * 1000 ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  )}
                >
                  {p.libelle}
                </button>
              ))}
            </div>
          </div>
          <fieldset>
            <legend className="text-sm text-neutral-300 mb-2">Durée libre</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Heures", v: h, set: setH, k: "h" },
                { l: "Minutes", v: m, set: setM, k: "m" },
                { l: "Secondes", v: sec, set: setSec, k: "s" },
              ].map((c) => (
                <label key={c.k} className="block min-w-0">
                  <span className="block text-xs text-neutral-500 mb-1">{c.l}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={c.v}
                    disabled={enMarche}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                      c.set(v);
                      const r = appliquerSaisie(c.k === "h" ? v : h, c.k === "m" ? v : m, c.k === "s" ? v : sec);
                      if (c.k === "h" && nombre(v) !== r.H) c.set(String(r.H));
                      if (c.k === "m" && nombre(v) !== r.M) c.set(String(r.M));
                      if (c.k === "s" && nombre(v) !== r.S) c.set(String(r.S));
                    }}
                    className={classeChamp + " text-center tabular-nums disabled:opacity-50"}
                  />
                </label>
              ))}
            </div>
            <p role="status" className="text-sm text-amber-300 mt-1 min-h-[1.25rem]">
              {alerte}
            </p>
          </fieldset>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <span className="whitespace-nowrap">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Bouton
                secondaire
                onClick={() => {
                  const c = ctx();
                  if (c) sonner(c, volume, 1);
                  else setEtat("Le son n'est pas disponible dans ce navigateur.");
                }}
              >
                Tester le son
              </Bouton>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={notif} onChange={(e) => demanderNotif(e.target.checked)} className="w-4 h-4 accent-sky-400" />
              Notification à la fin (si le navigateur l'autorise)
            </label>
            <p role="status" className="text-sm text-sky-300 min-h-[1.25rem]">
              {etat}
            </p>
          </div>
        </div>
      </div>

      <Section titre="Mode d'emploi">
        <p>
          Touchez une <strong>durée courante</strong> (1, 3, 5, 10, 15, 20, 25, 30 minutes ou 1 heure) ou tapez une
          <strong> durée libre</strong> en heures, minutes et secondes, puis <strong>Démarrer</strong>. La barre
          bleue montre la part écoulée, le titre de l'onglet affiche le temps restant : on le voit même en travaillant
          dans une autre fenêtre. <strong>Pause</strong> garde le temps restant, <strong>Réinitialiser</strong> revient à
          la durée choisie.
        </p>
        <p>
          À zéro, trois séries de bips retentissent, le cadre passe à l'orange et le titre de l'onglet indique
          « Terminé ». Cochez la notification pour être prévenu aussi par le système, utile quand le son est coupé.
          Essayez le son avant un long décompte : les navigateurs n'autorisent une page à jouer un son qu'après une
          action de votre part, comme un clic.
        </p>
      </Section>

      <Section titre="Des usages, des durées">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Cuisine</strong> : 3 minutes pour un œuf à la coque, 10 minutes pour des pâtes, le temps de repos
            d'une pâte. Le plein écran rend les chiffres lisibles depuis le plan de travail.
          </li>
          <li>
            <strong>Classe et réunion</strong> : 5 ou 10 minutes pour un exercice, un tour de parole ou un vote, projetés
            au tableau en plein écran pour que chacun voie le temps restant.
          </li>
          <li>
            <strong>Travail concentré</strong> : la méthode Pomodoro alterne 25 minutes de travail et 5 minutes de
            pause.
          </li>
          <li>
            <strong>Sport</strong> : temps de récupération, gainage, étirements. Pour mesurer une durée qui n'est pas
            fixée d'avance, un tour de piste par exemple, prenez le <Link to="/chronometre/">chronomètre</Link>.
          </li>
        </ul>
        <p>
          Pour un rendez-vous daté plutôt qu'une durée (un départ, un examen, la fin d'une promotion), le{" "}
          <Link to="/compte-a-rebours/">compte à rebours</Link> calcule les jours, heures et minutes jusqu'à la date
          voulue.
        </p>
      </Section>

      <Section titre="Pourquoi ce minuteur reste juste en arrière-plan">
        <p>
          Les navigateurs ralentissent les pages qu'on ne regarde pas. Chrome documente une limitation forte : après
          cinq minutes d'onglet masqué et silencieux, certaines minuteries de la page ne s'exécutent plus qu'une fois
          par minute. Un minuteur qui attendrait ce signal pour sonner pourrait donc sonner jusqu'à une minute en
          retard.
        </p>
        <p>
          Ici, deux précautions. Le temps restant est toujours recalculé à partir de l'<strong>heure de fin</strong>{" "}
          fixée au démarrage, jamais en décomptant les secondes une par une. Et la sonnerie est confiée dès le
          démarrage au <strong>moteur audio</strong> du navigateur, programmée pour l'instant exact de la fin. Sur un
          téléphone, la page demande aussi au système de garder l'écran allumé (Screen Wake Lock) quand il le permet,
          car un écran verrouillé peut suspendre le son.
        </p>
      </Section>
    </PageOutil>
  );
};

export default Minuteur;
