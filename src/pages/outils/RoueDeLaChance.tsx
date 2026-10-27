import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { entierAleatoire, basculerPleinEcran, creerAudio } from "@/lib/temps";

const FAQ: QuestionFaq[] = [
  {
    q: "La roue s'arrête-t-elle vraiment au hasard, ou l'animation influence-t-elle le résultat ?",
    r: "Le résultat est tiré avant que la roue ne commence à tourner, par le générateur cryptographique du navigateur, avec la même probabilité pour chaque part. L'animation calcule ensuite une rotation qui s'arrête sur la part tirée, à un endroit lui-même choisi au hasard dans cette part. Ni la vitesse de votre clic, ni le moment où vous appuyez ne changent quoi que ce soit au résultat.",
  },
  {
    q: "Combien de choix peut-on mettre sur la roue ?",
    r: "De 2 à 100. Au-delà d'une trentaine de parts, les textes deviennent petits : raccourcissez-les (un prénom, un numéro) ou passez par le tirage au sort en liste, plus lisible pour un grand nombre de participants. Les textes trop longs pour leur part sont coupés à l'affichage, mais le résultat annoncé sous la roue reste complet.",
  },
  {
    q: "Comment donner plus de chances à un choix ?",
    r: "Écrivez-le plusieurs fois dans la liste : un choix présent trois fois occupe trois parts et a trois fois plus de chances de sortir. C'est la façon la plus transparente de pondérer, puisque tout le monde voit sur la roue la place que prend chaque choix. Pour un tirage équitable, vérifiez au contraire qu'aucun nom n'est en double.",
  },
  {
    q: "Peut-on utiliser la roue sur un écran de projection ou en direct ?",
    r: "Oui. Le bouton Plein écran agrandit la roue sur tout l'écran, idéal pour un vidéoprojecteur en classe, une animation de stand ou un direct sur les réseaux sociaux. Le son de cliquet, facultatif, rythme le ralentissement. La barre d'espace relance la roue quand le curseur n'est pas dans la liste.",
  },
];

const PRESETS: { nom: string; liste: string }[] = [
  { nom: "Oui ou non", liste: "Oui\nNon" },
  { nom: "Chiffres de 1 à 10", liste: Array.from({ length: 10 }, (_, i) => String(i + 1)).join("\n") },
  { nom: "Jours de la semaine", liste: "Lundi\nMardi\nMercredi\nJeudi\nVendredi\nSamedi\nDimanche" },
  { nom: "Repas du soir", liste: "Pâtes\nPizza\nSalade composée\nSoupe\nCrêpes\nRiz sauté\nGratin\nOmelette" },
];

const COULEURS = ["#7dd3fc", "#fcd34d", "#86efac", "#fda4af", "#c4b5fd", "#5eead4", "#fdba74", "#a5b4fc"];
const TOUR = Math.PI * 2;

const RoueDeLaChance = () => {
  const [texte, setTexte] = useState("Camille\nLéo\nInès\nHugo\nChloé\nNathan");
  const [angle, setAngle] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [gagnant, setGagnant] = useState<string | null>(null);
  const [retirer, setRetirer] = useState(false);
  const [son, setSon] = useState(true);
  const [alerte, setAlerte] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const cadre = useRef<HTMLDivElement>(null);
  const anim = useRef(0);
  const audio = useRef<AudioContext | null>(null);

  const choix = useMemo(
    () =>
      texte
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 100),
    [texte]
  );
  const nbLignes = texte.split(/\r?\n/).filter((l) => l.trim()).length;

  // Dessin de la roue
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const T = c.width;
    const R = T / 2 - 8;
    ctx.clearRect(0, 0, T, T);
    ctx.save();
    ctx.translate(T / 2, T / 2);
    const n = Math.max(choix.length, 1);
    const seg = TOUR / n;
    const taille = Math.max(14, Math.min(40, 360 / Math.sqrt(n * 4)));
    for (let i = 0; i < n; i++) {
      const debut = angle + i * seg - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, debut, debut + seg);
      ctx.closePath();
      ctx.fillStyle = choix.length ? COULEURS[(i % COULEURS.length + (n % COULEURS.length === 1 && i === n - 1 ? 1 : 0)) % COULEURS.length] : "#262626";
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (!choix[i]) continue;
      ctx.save();
      ctx.rotate(debut + seg / 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.font = `600 ${taille}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const max = R * 0.78;
      let t = choix[i];
      if (ctx.measureText(t).width > max) {
        while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
        t += "…";
      }
      ctx.fillText(t, R - 18, 0);
      ctx.restore();
    }
    // moyeu
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.09, 0, TOUR);
    ctx.fillStyle = "#0a0a0a";
    ctx.fill();
    ctx.restore();
    // flèche en haut
    ctx.beginPath();
    ctx.moveTo(T / 2 - 22, 2);
    ctx.lineTo(T / 2 + 22, 2);
    ctx.lineTo(T / 2, 50);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [angle, choix]);

  useEffect(
    () => () => {
      cancelAnimationFrame(anim.current);
      audio.current?.close().catch(() => {});
    },
    []
  );

  const clic = () => {
    const a = audio.current;
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "square";
    o.frequency.value = 1400;
    g.gain.setValueAtTime(0.05, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.03);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.04);
  };

  const lancer = () => {
    if (tourne) return;
    if (choix.length < 2) {
      setAlerte("Il faut au moins deux choix, un par ligne.");
      return;
    }
    setAlerte(nbLignes > 100 ? "Seuls les 100 premiers choix sont sur la roue." : "");
    if (son) {
      if (!audio.current) audio.current = creerAudio();
      audio.current?.resume().catch(() => {});
    }
    const n = choix.length;
    const seg = TOUR / n;
    // 1. Le résultat est tiré d'abord, au hasard cryptographique.
    const w = entierAleatoire(n);
    const position = 0.1 + (entierAleatoire(1000) / 1000) * 0.8; // endroit dans la part, loin des bords
    // 2. L'animation vise une rotation qui amène cette part sous la flèche.
    const cible = (((-(w + position) * seg) % TOUR) + TOUR) % TOUR;
    const depart = angle;
    const base = ((depart % TOUR) + TOUR) % TOUR;
    let delta = cible - base;
    if (delta < 0) delta += TOUR;
    const tours = 5 + entierAleatoire(3);
    const total = delta + tours * TOUR;
    const duree = 5200;
    const t0 = performance.now();
    let dernierSeg = Math.floor((depart / seg));
    setTourne(true);
    setGagnant(null);
    const pas = (t: number) => {
      const p = Math.min(1, (t - t0) / duree);
      const e = 1 - Math.pow(1 - p, 4); // ralentissement progressif
      const a = depart + total * e;
      setAngle(a);
      const s = Math.floor(a / seg);
      if (son && s !== dernierSeg) {
        dernierSeg = s;
        clic();
      }
      if (p < 1) anim.current = requestAnimationFrame(pas);
      else {
        setTourne(false);
        setAngle(base + total - Math.floor((base + total) / TOUR) * TOUR);
        setGagnant(choix[w]);
        if (retirer) {
          let fait = false;
          setTexte((tx) =>
            tx
              .split(/\r?\n/)
              .filter((l) => {
                if (!fait && l.trim() === choix[w]) {
                  fait = true;
                  return false;
                }
                return true;
              })
              .join("\n")
          );
        }
      }
    };
    anim.current = requestAnimationFrame(pas);
  };

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button")) return;
      if (e.code === "Space") {
        e.preventDefault();
        lancer();
      }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  });

  return (
    <PageOutil
      href="/roue-de-la-chance/"
      titre="Roue de la chance en ligne : faites tourner vos choix"
      description="Roue de la chance gratuite : écrivez vos choix (prénoms, gages, repas, oui ou non), faites tourner la roue et laissez le hasard décider. Sans inscription."
      motsCles="roue de la chance, roue de tirage au sort, roue aléatoire, roue en ligne, tourner la roue"
      faq={FAQ}
      nomAppli="Roue de la chance"
      categorieAppli="GameApplication"
      h1="Roue de la chance en ligne"
      chapeau="Écrivez vos choix, un par ligne, puis faites tourner la roue : elle ralentit et s'arrête sur une part tirée au hasard. Prénoms, gages, repas, questions : tout ce qui se tire au sort."
      sources={[
        { editeur: "MDN Web Docs", titre: "Crypto: getRandomValues() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div ref={cadre} className="flex flex-col items-center gap-4 rounded-xl [&:fullscreen]:bg-neutral-950 [&:fullscreen]:justify-center [&:fullscreen]:p-6">
          <canvas
            ref={canvas}
            width={800}
            height={800}
            role="img"
            aria-label={`Roue de ${choix.length} choix`}
            onClick={lancer}
            className="w-full max-w-[34rem] aspect-square cursor-pointer [:fullscreen_&]:max-w-[80vh]"
          />
          <p aria-live="polite" className="text-2xl sm:text-3xl font-semibold text-white text-center min-h-[2.5rem] [overflow-wrap:anywhere]">
            {tourne ? "La roue tourne…" : gagnant ? gagnant : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Bouton onClick={lancer} disabled={tourne}>
              Tourner la roue
            </Bouton>
            <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
              Plein écran
            </Bouton>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">Choix, un par ligne (2 à 100)</span>
            <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={10} disabled={tourne} className={classeZoneTexte + " resize-y"} />
            <span className="block text-xs text-neutral-500 mt-1">{choix.length} part{choix.length > 1 ? "s" : ""} sur la roue.</span>
          </label>
          <p role="status" className="text-sm text-amber-300 min-h-[1.25rem]">
            {alerte}
          </p>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={retirer} onChange={(e) => setRetirer(e.target.checked)} className="w-4 h-4 accent-sky-400" />
            Retirer le choix tiré après chaque tour
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" checked={son} onChange={(e) => setSon(e.target.checked)} className="w-4 h-4 accent-sky-400" />
            Son de cliquet
          </label>
          <div>
            <p className="text-sm text-neutral-300 mb-2">Roues toutes prêtes</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.nom}
                  type="button"
                  disabled={tourne}
                  onClick={() => {
                    setTexte(p.liste);
                    setGagnant(null);
                  }}
                  className="h-10 px-3 rounded-md border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 whitespace-nowrap"
                >
                  {p.nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Section titre="Mode d'emploi">
        <p>
          Remplacez les prénoms d'exemple par vos propres choix, un par ligne : la roue se redessine à chaque frappe,
          avec une part par ligne. Cliquez sur <strong>Tourner la roue</strong>, sur la roue elle-même, ou appuyez sur
          la barre d'espace. Après quelques secondes de ralentissement, la flèche blanche du haut désigne le résultat,
          qui s'affiche aussi en toutes lettres sous la roue.
        </p>
        <p>
          Pour enchaîner les tirages sans repasser deux fois sur le même choix (ordre de passage, distribution de
          rôles), cochez <strong>Retirer le choix tiré</strong> : la part disparaît après chaque tour. Les roues toutes
          prêtes remplissent la liste d'un clic : oui ou non, chiffres de 1 à 10, jours de la semaine, idées de repas.
        </p>
      </Section>

      <Section titre="Idées de roues">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>En classe</strong> : le prénom de l'élève interrogé, le thème de l'exposé, la question de révision,
            la récompense de fin de semaine.
          </li>
          <li>
            <strong>En soirée</strong> : action ou vérité, gages, le prochain qui choisit la musique, le jeu de société
            de la soirée.
          </li>
          <li>
            <strong>Au quotidien</strong> : le repas du soir, le film à regarder, la sortie du week-end, la personne de
            corvée.
          </li>
          <li>
            <strong>Sur un stand ou en boutique</strong> : une animation de remise ou de petit cadeau, projetée en plein
            écran. Si l'opération est un jeu promotionnel, son règlement s'applique.
          </li>
        </ul>
        <p>
          Avec une longue liste de participants, ou pour tirer plusieurs gagnants d'un coup, le{" "}
          <Link to="/tirage-au-sort/">tirage au sort en liste</Link> est plus pratique : il tire autant de noms que
          voulu, forme des équipes et garde un historique horodaté.
        </p>
      </Section>

      <Section titre="Une roue honnête : le hasard d'abord, l'animation ensuite">
        <p>
          Sur une vraie roue de foire, c'est la force du lancer et les frottements qui décident. À l'écran, une roue
          dont l'arrêt dépendrait de la durée du clic ou de la vitesse de l'ordinateur ne serait pas équitable. Ici, le
          choix gagnant est tiré <strong>avant</strong> que la roue ne bouge, par le générateur de nombres aléatoires
          cryptographique du navigateur (crypto.getRandomValues), chaque part ayant exactement la même probabilité.
        </p>
        <p>
          L'animation est calculée ensuite : cinq à sept tours complets, puis un ralentissement qui amène la part
          gagnante sous la flèche, à un endroit lui-même tiré au hasard dans la part pour que l'arrêt ne soit pas
          toujours au centre. La roue ne fait que montrer un résultat déjà décidé, sans pouvoir le modifier.
        </p>
      </Section>
    </PageOutil>
  );
};

export default RoueDeLaChance;
