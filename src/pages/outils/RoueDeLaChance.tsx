import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { entierAleatoire, basculerPleinEcran, creerAudio } from "@/lib/temps";
import { type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "La roue s'arrête-t-elle vraiment au hasard, ou l'animation influence-t-elle le résultat ?",
      r: "Le résultat est tiré avant que la roue ne commence à tourner, par le générateur cryptographique du navigateur, avec la même probabilité pour chaque part. L'animation calcule ensuite une rotation qui s'arrête sur la part tirée, à un endroit lui-même choisi au hasard dans cette part. Ni la vitesse de votre clic, ni le moment où vous appuyez ne changent quoi que ce soit au résultat.",
    },
    {
      q: "Combien de choix peut-on mettre sur la roue ?",
      r: "De 2 à 100. Au-delà d'une trentaine de parts, les textes deviennent petits : raccourcissez-les (un prénom, un numéro) ou passez par le tirage au sort en liste, plus lisible pour un grand nombre de participants. Les textes trop longs pour leur part sont coupés à l'affichage, mais le résultat annoncé au-dessus de la roue reste complet.",
    },
    {
      q: "Comment donner plus de chances à un choix ?",
      r: "Écrivez-le plusieurs fois dans la liste : un choix présent trois fois occupe trois parts et a trois fois plus de chances de sortir. C'est la façon la plus transparente de pondérer, puisque tout le monde voit sur la roue la place que prend chaque choix. Pour un tirage équitable, vérifiez au contraire qu'aucun nom n'est en double avant de lancer.",
    },
    {
      q: "Peut-on utiliser la roue sur un écran de projection ou en direct ?",
      r: "Oui. Le bouton Plein écran agrandit la roue sur tout l'écran, idéal pour un vidéoprojecteur en classe, une animation de stand ou un direct sur les réseaux sociaux. Le son de cliquet, que l'on coupe d'un clic, rythme le ralentissement. La barre d'espace relance la roue quand le curseur n'est pas dans la liste des choix.",
    },
    {
      q: "La roue fonctionne-t-elle sur téléphone sans installer d'application ?",
      r: "Oui, dans le navigateur du téléphone, Safari comme Chrome. Touchez la roue ou le bouton pour la lancer ; elle tourne pendant un peu plus de 5 secondes. Sur iPhone, le plein écran n'est pas autorisé pour une page web : tournez l'appareil à l'horizontale pour agrandir la roue. Si le cliquet reste muet, vérifiez que le bouton de mode silencieux n'est pas activé.",
    },
    {
      q: "Pourquoi la flèche ne s'arrête-t-elle jamais pile sur la ligne entre deux parts ?",
      r: "Parce que le point d'arrêt est tiré entre 10 % et 90 % de la largeur de la part gagnante. Ainsi, personne ne peut contester un arrêt « sur la ligne » : la flèche désigne toujours clairement une seule part, et le nom tiré s'affiche aussi en toutes lettres au-dessus de la roue. Le point d'arrêt varie d'un lancer à l'autre, pour que la roue ne s'immobilise pas toujours au centre.",
    },
  ],
  en: [
    {
      q: "Does the wheel really stop at random, or does the animation affect the result?",
      r: "The result is drawn before the wheel starts turning, by the browser's cryptographic generator, with the same probability for every slice. The animation then works out a spin that stops on that slice, at a spot also picked at random within it. Neither the speed of your click nor the moment you press makes any difference to the outcome, so nobody can learn to aim.",
    },
    {
      q: "How many choices can I put on the wheel?",
      r: "From 2 to 100. Beyond about thirty slices the text gets small, so shorten it (a first name, a number) or use the random name picker instead, which is easier to read for a long list of entrants. Text too long for its slice is cut off on the wheel, but the result shown above the wheel is always written out in full.",
    },
    {
      q: "How do I give one choice a better chance?",
      r: "Write it several times in the list: a choice that appears three times takes three slices and is three times as likely to come up. It is the most transparent way to weight a draw, because everyone can see on the wheel how much room each choice takes. For a fair draw, check the opposite before spinning: that no name appears twice.",
    },
    {
      q: "Can I show the wheel on a projector or during a live stream?",
      r: "Yes. Full screen enlarges the wheel to fill the screen, ideal for a classroom projector, a stand at a fair or a live stream on social media. The ticking sound, which you can switch off in one click, marks the slowdown. The space bar spins the wheel again whenever the cursor is not inside the list of choices.",
    },
    {
      q: "Why does the pointer never stop exactly on the line between two slices?",
      r: "Because the stopping point is drawn between 10% and 90% of the width of the winning slice. That way nobody can argue about a stop on the line: the pointer always clearly shows a single slice, and the result is also written out above the wheel. The stopping point changes from one spin to the next, so the wheel does not always stop in the middle of a slice.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "W3C", titre: "Web Cryptography Level 2, méthode getRandomValues", url: "https://www.w3.org/TR/webcrypto/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, The canvas element (dessin de la roue)", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Web Audio API, version 1.1 (son de cliquet)", url: "https://www.w3.org/TR/webaudio/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard (plein écran)", url: "https://fullscreen.spec.whatwg.org/", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "W3C", titre: "Web Cryptography Level 2, getRandomValues method", url: "https://www.w3.org/TR/webcrypto/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, The canvas element", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Web Audio API 1.1", url: "https://www.w3.org/TR/webaudio/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard", url: "https://fullscreen.spec.whatwg.org/", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Roue de la chance 75tools",
    motsCles: "roue de la chance, roue de tirage au sort, roue aléatoire, roue en ligne, tourner la roue",
    exemple: "Camille\nLéo\nInès\nHugo\nChloé\nNathan",
    presets: [
      { nom: "Oui ou non", liste: "Oui\nNon" },
      { nom: "Chiffres de 1 à 10", liste: Array.from({ length: 10 }, (_, i) => String(i + 1)).join("\n") },
      { nom: "Jours de la semaine", liste: "Lundi\nMardi\nMercredi\nJeudi\nVendredi\nSamedi\nDimanche" },
      { nom: "Repas du soir", liste: "Pâtes\nPizza\nSalade composée\nSoupe\nCrêpes\nRiz sauté\nGratin\nOmelette" },
    ],
    deuxChoix: "Il faut au moins deux choix, un par ligne.",
    cent: "Seuls les 100 premiers choix sont sur la roue.",
    roue: (n: number) => `Roue de ${n} choix`,
    tourne: "La roue tourne…",
    attente: "Le choix tiré s'affichera ici.",
    lancer: "Tourner la roue",
    son: "Son",
    pleinEcran: "Plein écran",
    liste: "Choix, un par ligne (2 à 100)",
    parts: (n: number) => `${n} part${n > 1 ? "s" : ""} sur la roue.`,
    retirer: "Retirer le choix tiré après chaque tour",
    pretes: "Roues toutes prêtes",
  },
  en: {
    nomAppli: "75tools spin the wheel",
    motsCles: "spin the wheel, random wheel, wheel spinner, wheel of names, decision wheel",
    exemple: "Emma\nOliver\nCamille\nNoah\nChloé\nJames",
    presets: [
      { nom: "Yes or no", liste: "Yes\nNo" },
      { nom: "Numbers 1 to 10", liste: Array.from({ length: 10 }, (_, i) => String(i + 1)).join("\n") },
      { nom: "Days of the week", liste: "Monday\nTuesday\nWednesday\nThursday\nFriday\nSaturday\nSunday" },
      { nom: "Dinner ideas", liste: "Pasta\nPizza\nSalad\nSoup\nCrêpes\nFried rice\nGratin\nOmelette" },
    ],
    deuxChoix: "You need at least two choices, one per line.",
    cent: "Only the first 100 choices are on the wheel.",
    roue: (n: number) => `Wheel with ${n} choices`,
    tourne: "Spinning…",
    attente: "The choice drawn will show here.",
    lancer: "Spin the wheel",
    son: "Sound",
    pleinEcran: "Full screen",
    liste: "Choices, one per line (2 to 100)",
    parts: (n: number) => `${n} slice${n > 1 ? "s" : ""} on the wheel.`,
    retirer: "Remove the choice drawn after each spin",
    pretes: "Ready-made wheels",
  },
};

const COULEURS = ["#7dd3fc", "#fcd34d", "#86efac", "#fda4af", "#c4b5fd", "#5eead4", "#fdba74", "#a5b4fc"];
const TOUR = Math.PI * 2;

const RoueDeLaChance = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [texte, setTexte] = useState(t.exemple);
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
    const L = c.width;
    const R = L / 2 - 8;
    ctx.clearRect(0, 0, L, L);
    ctx.save();
    ctx.translate(L / 2, L / 2);
    const n = Math.max(choix.length, 1);
    const seg = TOUR / n;
    const taille = Math.max(14, Math.min(40, 360 / Math.sqrt(n * 4)));
    for (let i = 0; i < n; i++) {
      const debut = angle + i * seg - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, debut, debut + seg);
      ctx.closePath();
      // Deux parts voisines ne prennent jamais la même couleur, y compris la dernière et la première.
      ctx.fillStyle = choix.length ? COULEURS[((i % COULEURS.length) + (n % COULEURS.length === 1 && i === n - 1 ? 1 : 0)) % COULEURS.length] : "#262626";
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
      let tx = choix[i];
      if (ctx.measureText(tx).width > max) {
        while (tx.length > 1 && ctx.measureText(tx + "…").width > max) tx = tx.slice(0, -1);
        tx += "…";
      }
      ctx.fillText(tx, R - 18, 0);
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
    ctx.moveTo(L / 2 - 22, 2);
    ctx.lineTo(L / 2 + 22, 2);
    ctx.lineTo(L / 2, 50);
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
      setAlerte(t.deuxChoix);
      return;
    }
    setAlerte(nbLignes > 100 ? t.cent : "");
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
    let dernierSeg = Math.floor(depart / seg);
    setTourne(true);
    setGagnant(null);
    const pas = (now: number) => {
      const p = Math.min(1, (now - t0) / duree);
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

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
      <div ref={cadre} className="flex flex-col items-center gap-3 rounded-xl [&:fullscreen]:bg-neutral-950 [&:fullscreen]:justify-center [&:fullscreen]:p-6">
        <div className="flex flex-wrap justify-center gap-2">
          <Bouton onClick={lancer} disabled={tourne}>
            {t.lancer}
          </Bouton>
          <button
            type="button"
            aria-pressed={son}
            onClick={() => setSon((v) => !v)}
            className={cn(
              "h-11 px-4 rounded-md border text-sm font-medium whitespace-nowrap",
              son ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-400 line-through"
            )}
          >
            {t.son}
          </button>
          <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
            {t.pleinEcran}
          </Bouton>
        </div>
        <p
          data-resultat
          aria-live="polite"
          className={cn(
            "text-center min-h-[2.25rem] [overflow-wrap:anywhere]",
            gagnant && !tourne ? "text-2xl sm:text-3xl font-semibold text-white" : "text-base text-neutral-500 pt-1.5"
          )}
        >
          {tourne ? t.tourne : gagnant ? gagnant : t.attente}
        </p>
        {alerte && (
          <p role="status" className="text-sm text-amber-300 text-center">
            {alerte}
          </p>
        )}
        <canvas
          ref={canvas}
          width={800}
          height={800}
          role="img"
          aria-label={t.roue(choix.length)}
          onClick={lancer}
          className="w-full max-w-[34rem] lg:max-w-[min(34rem,calc(100vh-25rem))] aspect-square cursor-pointer [:fullscreen_&]:max-w-[80vh]"
        />
      </div>

      <div className="space-y-4 min-w-0">
        <label className="block">
          <span className="block text-sm text-neutral-300 mb-1">{t.liste}</span>
          <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={8} disabled={tourne} className={classeZoneTexte + " resize-y"} />
          <span className="block text-xs text-neutral-500 mt-1">{t.parts(choix.length)}</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={retirer} onChange={(e) => setRetirer(e.target.checked)} className="w-4 h-4 accent-sky-400" />
          {t.retirer}
        </label>
        <div>
          <p className="text-sm text-neutral-300 mb-2">{t.pretes}</p>
          <div className="flex flex-wrap gap-2">
            {t.presets.map((p) => (
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
  );

  return (
    <PageOutil
      id="roue-de-la-chance"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="GameApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Une roue de la chance en ligne, avec vos propres choix">
      <p>
        Cette roue de la chance en ligne se lance d'un clic sur « Tourner la roue », d'une touche sur la roue elle-même
        ou de la barre d'espace : elle fait cinq à sept tours, ralentit pendant un peu plus de 5 secondes, puis la
        flèche blanche du haut désigne une part, dont le texte s'affiche aussi en toutes lettres au-dessus de la roue.
        Pour y mettre vos choix, remplacez les six prénoms d'exemple dans la liste de droite, un choix par ligne, de 2 à
        100 : la roue se redessine à chaque frappe. Exemple : avec 8 idées de repas, chaque part a exactement 1 chance
        sur 8 de sortir, quelle que soit sa place sur la roue. Le résultat est tiré avant que la roue ne bouge, par le
        générateur cryptographique du navigateur, et l'animation ne fait que le montrer. Limite : au-delà d'une
        trentaine de parts, les textes deviennent petits ; le tirage en liste est alors plus lisible.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Remplacez les prénoms d'exemple par vos propres choix, un par ligne : la roue se redessine avec une part par
        ligne. Cliquez sur <strong>Tourner la roue</strong>, sur la roue elle-même, ou appuyez sur la barre d'espace.
        Le bouton <strong>Son</strong> active ou coupe le cliquet qui accompagne le ralentissement.
      </p>
      <p>
        Pour enchaîner les tirages sans repasser deux fois sur le même choix (ordre de passage, distribution de rôles),
        cochez <strong>Retirer le choix tiré</strong> : la part disparaît après chaque tour. Les roues toutes prêtes
        remplissent la liste d'un clic : oui ou non, chiffres de 1 à 10, jours de la semaine, idées de repas.
      </p>
    </Section>

    <Section titre="Idées de roues">
      <p>
        <strong>En classe</strong>, la roue désigne l'élève interrogé, le thème de l'exposé, la question de révision ou
        la récompense de fin de semaine. <strong>En soirée</strong>, elle tire l'action ou la vérité, le gage, la
        personne qui choisit la musique ou le jeu de société. <strong>Au quotidien</strong>, elle tranche le repas du
        soir, le film à regarder, la sortie du week-end ou la personne de corvée.
      </p>
      <p>
        <strong>Sur un stand ou en boutique</strong>, projetée en plein écran, elle anime une remise ou un petit cadeau ;
        si l'opération est un jeu promotionnel, son règlement s'applique. Avec une longue liste de participants, ou
        pour tirer plusieurs gagnants d'un coup, le <Link to="/tirage-au-sort/">tirage au sort en liste</Link> est plus
        pratique : il tire autant de noms que voulu, forme des équipes et garde un historique horodaté.
      </p>
    </Section>

    <Section titre="Une roue honnête : le hasard d'abord, l'animation ensuite">
      <p>
        Sur une vraie roue de foire, c'est la force du lancer et les frottements qui décident. À l'écran, une roue dont
        l'arrêt dépendrait de la durée du clic ou de la vitesse de l'ordinateur ne serait pas équitable. Ici, le choix
        gagnant est tiré <strong>avant</strong> que la roue ne bouge, par le générateur de nombres aléatoires
        cryptographique du navigateur (crypto.getRandomValues), chaque part ayant exactement la même probabilité.
      </p>
      <p>
        L'animation est calculée ensuite : cinq à sept tours complets, puis un ralentissement qui amène la part
        gagnante sous la flèche, à un endroit lui-même tiré au hasard dans la part pour que l'arrêt ne soit pas
        toujours au centre. La roue ne fait que montrer un résultat déjà décidé, sans pouvoir le modifier.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Spin the wheel online, with your own choices">
      <p>
        To spin the wheel, click Spin the wheel, tap the wheel itself or press the space bar: it turns five to seven
        times, slows down for just over 5 seconds, and the white pointer at the top lands on a slice, whose text is
        also written out above the wheel. To use your own choices, replace the six sample names in the list on the
        right, one choice per line, from 2 to 100, and the wheel redraws as you type. For example, with 8 dinner ideas
        each slice has exactly a 1 in 8 chance of coming up, wherever it sits on the wheel. The result is drawn before
        the wheel moves, by the browser's cryptographic generator, and the animation only reveals it. The limit: beyond
        about thirty slices the text gets small, and a list-based draw is easier to read.
      </p>
    </Section>

    <Section titre="How to use it">
      <p>
        Replace the sample names with your own choices, one per line: the wheel redraws with one slice per line. Click{" "}
        <strong>Spin the wheel</strong>, click the wheel itself or press the space bar. The <strong>Sound</strong>{" "}
        button turns the ticking that goes with the slowdown on or off.
      </p>
      <p>
        To run several spins without landing on the same choice twice (running order, handing out roles), tick{" "}
        <strong>Remove the choice drawn</strong>: its slice disappears after each spin. The ready-made wheels fill the
        list in one click: yes or no, numbers 1 to 10, days of the week, dinner ideas.
      </p>
    </Section>

    <Section titre="Wheel ideas">
      <p>
        <strong>At school</strong>, the wheel picks the pupil who answers, the topic of a presentation, a revision
        question or the end-of-week reward, which works well in a bilingual class practising French vocabulary.{" "}
        <strong>At a party</strong>, it chooses truth or dare, a forfeit, who picks the music or which board game to
        play. <strong>Day to day</strong>, it settles dinner, the film to watch, the weekend outing or whose turn it is
        for the chores.
      </p>
      <p>
        <strong>On a stand or in a shop</strong>, shown full screen, it can run a discount or small-gift game; in
        France, a promotional game is subject to its published rules. With a long list of entrants, or to draw several
        winners at once, the <Link to="/en/random-name-picker/">random name picker</Link> is more practical: it draws
        as many names as you need, forms teams and keeps a timed history.
      </p>
    </Section>

    <Section titre="A fair wheel: chance first, animation second">
      <p>
        On a real fairground wheel, the strength of the spin and friction decide. On screen, a wheel whose stopping
        point depended on how long you held the click or how fast the computer is would not be fair. Here the winning
        choice is drawn <strong>before</strong> the wheel moves, by the browser's cryptographic random number generator
        (crypto.getRandomValues), with exactly the same probability for every slice.
      </p>
      <p>
        The animation is worked out afterwards: five to seven full turns, then a slowdown that brings the winning slice
        under the pointer, at a spot within the slice that is itself drawn at random, so the wheel does not always stop
        in the middle. The wheel only shows a result that has already been decided and cannot change it.
      </p>
    </Section>
  </>
);

export default RoueDeLaChance;
