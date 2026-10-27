import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { formatRestant, basculerPleinEcran, sonner, creerAudio } from "@/lib/temps";
import { type Langue } from "@/lib/langue";
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

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "La sonnerie se déclenche-t-elle si je regarde un autre onglet ?",
      r: "Oui. Au démarrage, la sonnerie est programmée dans le moteur audio du navigateur pour l'heure exacte de fin, au lieu d'attendre qu'une minuterie de la page la déclenche : les navigateurs ralentissent ces minuteries dans les onglets en arrière-plan, pas l'audio programmé. Laissez l'onglet ouvert et le son de l'ordinateur actif. Sur téléphone, verrouiller l'écran peut suspendre le son : la page demande au système de garder l'écran allumé quand c'est possible.",
    },
    {
      q: "Pourquoi aucun son ne sort alors que le minuteur est terminé ?",
      r: "Vérifiez d'abord le volume de l'appareil, le mode silencieux du téléphone (sur iPhone, le bouton latéral coupe aussi le son des pages web) et le curseur de volume de la page. Les navigateurs interdisent aussi à une page de jouer un son avant le premier clic : c'est pourquoi la sonnerie est préparée au moment où vous appuyez sur Démarrer. Le bouton « Tester le son » permet de vérifier avant un long décompte.",
    },
    {
      q: "Comment faire la méthode Pomodoro avec ce minuteur ?",
      r: "Lancez 25 minutes de travail sans interruption, puis 5 minutes de pause, et recommencez ; après quatre séries, faites une pause plus longue de 15 à 30 minutes. Les boutons 25 min et 5 min sont là pour ça. Notez à chaque sonnerie ce que vous avez avancé : c'est ce bilan régulier, plus que la durée exacte, qui rend la méthode utile.",
    },
    {
      q: "Puis-je régler un minuteur de plus d'une heure ?",
      r: "Oui, jusqu'à 23 heures 59 minutes 59 secondes avec les champs heures, minutes et secondes ; une valeur trop grande est ramenée au maximum et la page vous le signale. Pour un événement à une date précise, demain ou dans trois semaines, utilisez plutôt le compte à rebours : on y indique la date et l'heure visées, et il affiche les jours restants.",
    },
    {
      q: "Comment voir le temps restant sans rester sur la page du minuteur ?",
      r: "Regardez le titre de l'onglet : il affiche le temps restant, par exemple « 09:41 · Minuteur », puis « Terminé » à zéro. Il reste lisible quand vous travaillez dans un autre onglet du même navigateur. Cochez aussi « Notification à la fin » : si vous l'autorisez, le système affiche un message au moment de la sonnerie, même quand le navigateur est réduit ou que le son est coupé.",
    },
    {
      q: "Combien de temps dure la sonnerie et comment l'arrêter ?",
      r: "Environ 3 secondes : trois séries de trois bips aigus à 880 hertz, générées par le navigateur sans fichier son. Elle s'arrête d'elle-même ; pour la couper avant, appuyez sur « Réinitialiser ». Le volume se règle avec le curseur, de 0 à 100 %, avant le départ ou pendant le décompte pour la prochaine sonnerie. Le cadre passe aussi à l'orange, ce qui prévient sans bruit.",
    },
  ],
  en: [
    {
      q: "Will the alarm ring if I am looking at another tab?",
      r: "Yes. When you press Start, the alarm is scheduled in the browser's audio engine for the exact end time, instead of waiting for a page timer to trigger it: browsers slow down page timers in background tabs, but not scheduled audio. Keep the tab open and your computer sound on. On a phone, locking the screen can suspend sound, so the page asks the system to keep the screen awake when it can.",
    },
    {
      q: "The timer finished but I heard nothing, what went wrong?",
      r: "Check the device volume first, then silent mode on your phone (on an iPhone the side switch also mutes web pages) and the volume slider on the page. Browsers also refuse to play sound before your first click, which is why the alarm is prepared at the moment you press Start. Use Test sound before a long countdown to make sure you will hear it.",
    },
    {
      q: "How do I use this timer for the Pomodoro technique?",
      r: "Run 25 minutes of focused work, then a 5-minute break, and repeat; after four rounds, take a longer break of 15 to 30 minutes. The 25 min and 5 min buttons are there for that. Write down what you got done at each alarm: that regular check, more than the exact duration, is what makes the method work for remote or freelance work.",
    },
    {
      q: "Can I set a timer longer than one hour?",
      r: "Yes, up to 23 hours 59 minutes 59 seconds with the hours, minutes and seconds fields; a value that is too high is capped and the page tells you. For an event on a set date, tomorrow or in three weeks, use the countdown instead: you enter the target date and time, and it shows the days left and gives you a link to share.",
    },
    {
      q: "How long does the alarm last and how do I stop it?",
      r: "About 3 seconds: three series of three high beeps at 880 hertz, generated by the browser without any sound file. It stops on its own; to cut it short, press Reset. The slider sets the volume from 0 to 100%, before starting or during the countdown for the next alarm. The frame also turns orange, which tells you the time is up without any noise.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "WHATWG", titre: "HTML Standard, Timers (minuteries des pages web)", url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Web Audio API, version 1.1 (son programmé du navigateur)", url: "https://www.w3.org/TR/webaudio/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Screen Wake Lock API (garder l'écran allumé)", url: "https://www.w3.org/TR/screen-wake-lock/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "Notifications API Standard", url: "https://notifications.spec.whatwg.org/", lu: "27 octobre 2026" },
    { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "WHATWG", titre: "HTML Standard, Timers", url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Web Audio API 1.1", url: "https://www.w3.org/TR/webaudio/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Screen Wake Lock API", url: "https://www.w3.org/TR/screen-wake-lock/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "Notifications API Standard", url: "https://notifications.spec.whatwg.org/", lu: "27 October 2026" },
    { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Minuteur en ligne 75tools",
    motsCles: "minuteur en ligne, minuteur 10 minutes, timer en ligne gratuit, minuteur avec sonnerie, minuteur pomodoro",
    max: { h: "23 heures au plus", m: "59 minutes au plus", s: "59 secondes au plus" },
    ramenee: (n: string) => `Valeur ramenée : ${n}.`,
    indiquer: "Indiquez une durée avant de démarrer.",
    notifTitre: "Minuteur terminé",
    notifCorps: (d: string) => `${d} écoulées.`,
    onglet: "Minuteur",
    termineOnglet: "Terminé",
    pasNotif: "Ce navigateur ne propose pas les notifications.",
    notifRefus: "Notifications refusées : la sonnerie et le titre de l'onglet préviendront quand même.",
    notifOk: "Une notification s'affichera à la fin du décompte.",
    restant: "Temps restant",
    ecoule: "Temps écoulé !",
    enCours: "En cours",
    enPause: "En pause",
    pause: "Pause",
    reprendre: "Reprendre",
    demarrer: "Démarrer",
    reinit: "Réinitialiser",
    pleinEcran: "Plein écran",
    courantes: "Durées courantes",
    libre: "Durée libre",
    heures: "Heures",
    minutes: "Minutes",
    secondes: "Secondes",
    volume: "Volume",
    tester: "Tester le son",
    pasSon: "Le son n'est pas disponible dans ce navigateur.",
    notif: "Notification à la fin (si le navigateur l'autorise)",
  },
  en: {
    nomAppli: "75tools online timer",
    motsCles: "online timer, 10 minute timer, timer with alarm, free online timer, pomodoro timer",
    max: { h: "23 hours max", m: "59 minutes max", s: "59 seconds max" },
    ramenee: (n: string) => `Value capped: ${n}.`,
    indiquer: "Enter a duration before starting.",
    notifTitre: "Timer finished",
    notifCorps: (d: string) => `${d} elapsed.`,
    onglet: "Timer",
    termineOnglet: "Done",
    pasNotif: "This browser does not support notifications.",
    notifRefus: "Notifications blocked: the alarm and the tab title will still let you know.",
    notifOk: "A notification will show when the countdown ends.",
    restant: "Time left",
    ecoule: "Time's up!",
    enCours: "Running",
    enPause: "Paused",
    pause: "Pause",
    reprendre: "Resume",
    demarrer: "Start",
    reinit: "Reset",
    pleinEcran: "Full screen",
    courantes: "Common durations",
    libre: "Custom duration",
    heures: "Hours",
    minutes: "Minutes",
    secondes: "Seconds",
    volume: "Volume",
    tester: "Test sound",
    pasSon: "Sound is not available in this browser.",
    notif: "Notification at the end (if your browser allows it)",
  },
};

const nombre = (s: string) => {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const Minuteur = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
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
    if (H > 23) { H = 23; notes.push(t.max.h); }
    if (M > 59) { M = 59; notes.push(t.max.m); }
    if (S > 59) { S = 59; notes.push(t.max.s); }
    setAlerte(notes.length ? t.ramenee(notes.join(", ")) : "");
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
    libererEcran();
    setFin(null);
    setDuree(s * 1000);
    setRestantPause(s * 1000);
    setRestant(s * 1000);
    setTermine(false);
  };

  const demarrer = () => {
    const base = termine || restantPause <= 0 ? duree : restantPause;
    if (base <= 0) {
      setAlerte(t.indiquer);
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
            new Notification(t.notifTitre, { body: t.notifCorps(formatRestant(duree)) });
          } catch {
            /* notifications indisponibles */
          }
        }
      } else setRestant(r);
    };
    tic();
    const id = window.setInterval(tic, 200);
    return () => window.clearInterval(id);
  }, [fin, notif, duree, t]);

  // Temps restant dans le titre de l'onglet
  useEffect(() => {
    if (!titreOrigine.current) titreOrigine.current = document.title;
    if (enMarche) document.title = `${formatRestant(restant)} · ${t.onglet}`;
    else if (termine) document.title = `${t.termineOnglet} · ${t.onglet}`;
    else if (titreOrigine.current) document.title = titreOrigine.current;
  }, [enMarche, termine, restant, t]);

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
      setEtat(t.pasNotif);
      setNotif(false);
      return;
    }
    const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (p !== "granted") {
      setEtat(t.notifRefus);
      setNotif(false);
    } else setEtat(t.notifOk);
  };

  const progression = duree > 0 ? 1 - restant / duree : 0;
  const enPause = !enMarche && restant < duree && restant > 0;

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
      <div
        ref={cadre}
        className={cn(
          "rounded-xl border bg-neutral-900 px-3 py-5 sm:p-8 flex flex-col items-center justify-center gap-4 [&:fullscreen]:bg-neutral-950",
          termine ? "border-amber-400" : "border-neutral-800"
        )}
      >
        <p data-resultat className="font-mono tabular-nums text-white text-[3.5rem] leading-none sm:text-7xl lg:text-8xl tracking-tight" aria-label={t.restant}>
          {formatRestant(restant)}
        </p>
        <div className="w-full max-w-md h-1.5 rounded-full bg-neutral-800 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, Math.max(0, progression * 100))}%` }} />
        </div>
        <p role="status" aria-live="polite" className={cn("text-lg min-h-[1.75rem]", termine ? "text-amber-300" : "text-neutral-500")}>
          {termine ? t.ecoule : enMarche ? t.enCours : enPause ? t.enPause : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {enMarche ? <Bouton onClick={pause}>{t.pause}</Bouton> : <Bouton onClick={demarrer}>{enPause ? t.reprendre : t.demarrer}</Bouton>}
          <Bouton secondaire onClick={reinitialiser}>
            {t.reinit}
          </Bouton>
          <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
            {t.pleinEcran}
          </Bouton>
        </div>
      </div>

      <div className="space-y-5 min-w-0">
        <div>
          <p className="text-sm text-neutral-300 mb-2">{t.courantes}</p>
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
          <legend className="text-sm text-neutral-300 mb-2">{t.libre}</legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: t.heures, v: h, set: setH, k: "h" },
              { l: t.minutes, v: m, set: setM, k: "m" },
              { l: t.secondes, v: sec, set: setSec, k: "s" },
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
            <span className="whitespace-nowrap">{t.volume}</span>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-sky-400" />
          </label>
          <Bouton
            secondaire
            onClick={() => {
              const c = ctx();
              if (c) sonner(c, volume, 1);
              else setEtat(t.pasSon);
            }}
          >
            {t.tester}
          </Bouton>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={notif} onChange={(e) => demanderNotif(e.target.checked)} className="w-4 h-4 accent-sky-400" />
            {t.notif}
          </label>
          <p role="status" className="text-sm text-sky-300 min-h-[1.25rem]">
            {etat}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PageOutil id="minuteur" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Un minuteur en ligne avec sonnerie, prêt à lancer">
      <p>
        Ce minuteur en ligne est réglé sur 10 minutes dès l'ouverture : appuyez sur « Démarrer » et le temps restant
        s'affiche en grand, avec une barre de progression et le décompte dans le titre de l'onglet. Pour une autre
        durée, touchez l'un des neuf boutons (de 1 minute à 1 heure) ou tapez heures, minutes et secondes dans les
        champs de durée libre, jusqu'à 23 h 59 min 59 s. À zéro, trois séries de bips retentissent pendant environ
        3 secondes et le cadre passe à l'orange. Exemple : un œuf à la coque demande 3 minutes, une séance Pomodoro
        25 minutes ; un clic suffit dans les deux cas. La sonnerie est confiée au moteur audio du navigateur dès le
        départ, si bien qu'elle tombe à l'heure même quand l'onglet est en arrière-plan. Sa limite : un téléphone
        verrouillé ou en mode silencieux peut la rendre muette, d'où le bouton « Tester le son ».
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Touchez une <strong>durée courante</strong> (1, 3, 5, 10, 15, 20, 25, 30 minutes ou 1 heure) ou tapez une{" "}
        <strong>durée libre</strong> en heures, minutes et secondes, puis <strong>Démarrer</strong>. La barre bleue
        montre la part écoulée, le titre de l'onglet affiche le temps restant : on le voit même en travaillant dans un
        autre onglet. <strong>Pause</strong> garde le temps restant, <strong>Réinitialiser</strong> revient à la durée
        choisie et coupe la sonnerie si elle retentit.
      </p>
      <p>
        Cochez la notification pour être prévenu aussi par le système, utile quand le son est coupé. Essayez le son
        avant un long décompte : les navigateurs n'autorisent une page à jouer un son qu'après une action de votre
        part, comme un clic. Le <strong>plein écran</strong> agrandit les chiffres pour les lire depuis l'autre bout
        d'une pièce.
      </p>
    </Section>

    <Section titre="Des usages, des durées">
      <p>
        <strong>En cuisine</strong>, 3 minutes pour un œuf à la coque, 10 minutes pour des pâtes, le temps de repos
        d'une pâte : le plein écran rend les chiffres lisibles depuis le plan de travail. <strong>En classe et en
        réunion</strong>, 5 ou 10 minutes pour un exercice, un tour de parole ou un vote, projetés au tableau pour que
        chacun voie le temps restant. <strong>Pour travailler concentré</strong>, la méthode Pomodoro alterne
        25 minutes de travail et 5 minutes de pause.
      </p>
      <p>
        <strong>En sport</strong>, le minuteur cadre la récupération, le gainage ou les étirements. Pour mesurer une
        durée qui n'est pas fixée d'avance, un tour de piste par exemple, prenez le{" "}
        <Link to="/chronometre/">chronomètre en ligne avec tours</Link>. Pour un rendez-vous daté plutôt qu'une durée
        (un départ, un examen, la fin d'une promotion), le <Link to="/compte-a-rebours/">compte à rebours jusqu'à une
        date</Link> calcule les jours, heures et minutes restants.
      </p>
    </Section>

    <Section titre="Pourquoi ce minuteur reste juste en arrière-plan">
      <p>
        Les navigateurs ralentissent les pages qu'on ne regarde pas. Chrome documente une limitation forte : après cinq
        minutes d'onglet masqué et silencieux, certaines minuteries de la page ne s'exécutent plus qu'une fois par
        minute. Un minuteur qui attendrait ce signal pour sonner pourrait donc sonner jusqu'à une minute en retard.
      </p>
      <p>
        Ici, deux précautions. Le temps restant est toujours recalculé à partir de l'<strong>heure de fin</strong>{" "}
        fixée au démarrage, jamais en décomptant les secondes une par une. Et la sonnerie est confiée dès le démarrage
        au <strong>moteur audio</strong> du navigateur (Web Audio), programmée pour l'instant exact de la fin. Sur un
        téléphone, la page demande aussi au système de garder l'écran allumé (Screen Wake Lock) quand il le permet, car
        un écran verrouillé peut suspendre le son.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="An online timer with an alarm, ready to start">
      <p>
        This online timer is set to 10 minutes as soon as the page opens: press Start and the time left appears in
        large digits, with a progress bar and the countdown in the tab title. For another duration, tap one of the nine
        buttons (from 1 minute to 1 hour) or type hours, minutes and seconds in the custom fields, up to 23 h 59 min
        59 s. At zero, three series of beeps ring for about 3 seconds and the frame turns orange. For example, a
        soft-boiled egg takes 3 minutes and a Pomodoro work session 25 minutes; either is one click away. The alarm is
        handed to the browser's audio engine at the start, so it rings on time even when the tab is in the background.
        The main limit: a locked phone or one on silent can keep it quiet, which is why there is a Test sound button.
      </p>
    </Section>

    <Section titre="How to use it">
      <p>
        Tap a <strong>common duration</strong> (1, 3, 5, 10, 15, 20, 25 or 30 minutes, or 1 hour) or type a{" "}
        <strong>custom duration</strong> in hours, minutes and seconds, then press <strong>Start</strong>. The blue bar
        shows how much time has gone, and the tab title shows the time left, so you can keep an eye on it from another
        tab. <strong>Pause</strong> keeps the remaining time, and <strong>Reset</strong> goes back to the chosen
        duration and silences the alarm if it is ringing.
      </p>
      <p>
        Tick the notification box to get a system alert as well, useful when the sound is off. Test the sound before a
        long countdown: browsers only let a page play sound after you act on it, with a click for instance.{" "}
        <strong>Full screen</strong> enlarges the digits so you can read them from across the room.
      </p>
    </Section>

    <Section titre="Durations for everyday use">
      <p>
        <strong>In the kitchen</strong>, 3 minutes for a soft-boiled egg, 10 minutes for pasta, resting time for a
        dough: full screen keeps the digits readable from the worktop. <strong>In class or in meetings</strong>, 5 or
        10 minutes for an exercise, a speaking turn or a vote, shown on the projector so everyone sees the time left.
        This works well for teachers at international schools and for language exchange evenings. <strong>For focused
        work</strong>, the Pomodoro technique alternates 25 minutes of work and 5 minutes of rest.
      </p>
      <p>
        <strong>For exercise</strong>, the timer sets rest periods, planks or stretches. To measure a duration that is
        not fixed in advance, such as a lap of the track, use the{" "}
        <Link to="/en/stopwatch/">online stopwatch with laps</Link>. For a dated event rather than a duration (a flight,
        an exam, the end of a sale), the <Link to="/en/countdown/">countdown to a date</Link> works out the days, hours
        and minutes left.
      </p>
    </Section>

    <Section titre="Why this timer stays accurate in the background">
      <p>
        Browsers slow down pages you are not looking at. Chrome documents a strong limit: after five minutes in a
        hidden and silent tab, some page timers run only once a minute. A timer that waited for that signal before
        ringing could therefore be up to a minute late.
      </p>
      <p>
        Two safeguards prevent that here. The time left is always worked out from the <strong>end time</strong> set at
        the start, never by counting seconds down one by one. And the alarm is handed at the start to the browser's{" "}
        <strong>audio engine</strong> (Web Audio), scheduled for the exact end moment. On a phone, the page also asks
        the system to keep the screen on (Screen Wake Lock) when it allows it, because a locked screen can suspend
        sound.
      </p>
    </Section>
  </>
);

export default Minuteur;
