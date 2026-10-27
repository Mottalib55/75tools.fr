import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { formatChrono, basculerPleinEcran } from "@/lib/temps";
import { type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le chronomètre continue-t-il si je change d'onglet ou si l'écran se met en veille ?",
      r: "Oui. Le chronomètre enregistre l'heure de départ de l'appareil puis calcule l'écart à chaque affichage, au lieu d'ajouter des centièmes un par un : les minutes passées écran verrouillé sont comptées. Quand l'onglet est en arrière-plan, le navigateur ralentit l'affichage, mais au retour le temps affiché est juste. Si le téléphone ferme complètement la page pour libérer de la mémoire, la mesure est perdue : gardez la page ouverte.",
    },
    {
      q: "Le centième de seconde affiché est-il vraiment précis ?",
      r: "Le calcul part de l'heure de l'appareil, lue à la milliseconde, soit dix fois plus fin que le centième affiché. La limite est ailleurs : votre temps de réaction pour appuyer, de l'ordre de 0,15 à 0,25 seconde, et la fréquence de l'écran. Pour comparer deux tours ou suivre une séance, c'est largement suffisant ; pour un chronométrage officiel de compétition, on utilise des cellules ou un départ électronique.",
    },
    {
      q: "Comment enregistrer mes temps de tour pour les garder ?",
      r: "Le bouton « Copier les tours » place la liste dans le presse-papiers, au format tableau : une ligne par tour, avec le temps du tour et le temps cumulé, séparés par des tabulations. Collez-la dans un tableur (Excel, LibreOffice, Google Sheets) ou dans une note. Rien n'est conservé par le site : en fermant la page, les tours disparaissent.",
    },
    {
      q: "Puis-je piloter le chronomètre au clavier, sans souris ?",
      r: "Oui, tant que le curseur n'est pas dans un champ de saisie : la barre d'espace démarre et met en pause, la touche T enregistre un tour, la touche R remet à zéro quand le chronomètre est arrêté. C'est pratique sur un ordinateur posé à côté d'un tapis de course, ou pour chronométrer un oral en gardant les yeux sur l'orateur.",
    },
    {
      q: "Le chronomètre peut-il mesurer plus d'une heure d'affilée ?",
      r: "Oui. Passé 59 minutes et 59 secondes, l'affichage ajoute les heures devant les minutes (1:02:03,45) et continue sans limite pratique : une randonnée de 6 heures ou une épreuve de 24 heures se chronomètrent de la même façon. La seule condition est de laisser la page ouverte. Sur un téléphone, branchez-le si la mesure dure plusieurs heures, car un appareil qui s'éteint faute de batterie efface la mesure.",
    },
    {
      q: "Sur quelle définition de la seconde le chronomètre s'appuie-t-il ?",
      r: "Sur celle de l'horloge de votre appareil, elle-même recalée régulièrement par internet sur le temps atomique. Le Bureau international des poids et mesures (BIPM) définit la seconde par 9 192 631 770 oscillations de l'atome de césium 133. Entre deux synchronisations, l'horloge à quartz d'un téléphone ou d'un ordinateur peut dériver de l'ordre d'une seconde par jour, un écart sans effet sur une mesure de quelques minutes.",
    },
  ],
  en: [
    {
      q: "Does the stopwatch keep running if I switch tabs or my screen locks?",
      r: "Yes. It records the device clock at the start and works out the difference on every refresh, instead of adding hundredths one at a time, so minutes spent with the screen locked are counted. In a background tab the browser slows down the display, but the time shown is correct as soon as you come back. If the phone closes the page completely to free memory, the measurement is lost, so keep the page open.",
    },
    {
      q: "How accurate is the hundredth of a second shown on screen?",
      r: "The calculation uses the device clock, read to the millisecond, which is ten times finer than the hundredth displayed. The real limit is elsewhere: your reaction time when pressing the button, roughly 0.15 to 0.25 seconds, and the screen refresh rate. That is plenty for comparing laps or timing a training session; official race timing uses photocells or an electronic start instead.",
    },
    {
      q: "How do I save my lap times to a spreadsheet?",
      r: "Press Copy laps: the list goes to your clipboard as a table, one row per lap, with the lap time and the running total separated by tabs. Paste it into Excel, LibreOffice, Google Sheets or a note. Nothing is stored by the site, so the laps disappear when you close the page. Times use a decimal point, which English-language spreadsheets read as numbers straight away.",
    },
    {
      q: "Can I control the stopwatch from the keyboard?",
      r: "Yes, as long as the cursor is not in a text field: the space bar starts and pauses, T records a lap, and R resets once the stopwatch is stopped. It is handy on a laptop next to a treadmill, or when you time a presentation and want to keep your eyes on the speaker rather than on the mouse. The shortcuts are the same on Windows, macOS and Linux.",
    },
    {
      q: "Can the stopwatch time more than an hour?",
      r: "Yes. After 59 minutes and 59 seconds the display adds hours in front of the minutes (1:02:03.45) and keeps going with no practical limit, so a 6-hour hike or a 24-hour race is timed the same way. Just leave the page open. On a phone, plug it in for long sessions: a device that shuts down on a flat battery loses the measurement.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "BIPM", titre: "SI base unit: second (s), définition de la seconde", url: "https://www.bipm.org/en/si-base-units/second", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "High Resolution Time (horloge à la milliseconde des navigateurs)", url: "https://www.w3.org/TR/hr-time-3/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, Timers (minuteries des pages web)", url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard (plein écran)", url: "https://fullscreen.spec.whatwg.org/", lu: "27 octobre 2026" },
    { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "BIPM", titre: "SI base unit: second (s)", url: "https://www.bipm.org/en/si-base-units/second", lu: "27 October 2026" },
    { editeur: "W3C", titre: "High Resolution Time", url: "https://www.w3.org/TR/hr-time-3/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, Timers", url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard", url: "https://fullscreen.spec.whatwg.org/", lu: "27 October 2026" },
    { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Chronomètre en ligne 75tools",
    motsCles: "chronomètre en ligne, chronomètre gratuit, chrono en ligne, chronomètre avec tours",
    ecoule: "Temps écoulé",
    pause: "Pause",
    reprendre: "Reprendre",
    demarrer: "Démarrer",
    tour: "Tour",
    zero: "Remise à zéro",
    pleinEcran: "Plein écran",
    clavier: "Clavier : Espace (départ, pause) · T (tour) · R (remise à zéro)",
    tours: "Tours",
    copier: "Copier les tours",
    attente: "Les tours enregistrés s'afficheront ici, le plus récent en haut.",
    colTour: "Tour",
    colTemps: "Temps",
    colCumul: "Cumul",
    enteteCopie: "Tour\tTemps du tour\tCumul",
    meilleur: " (meilleur tour)",
    pire: " (tour le plus lent)",
    vert: "Vert",
    legende: " : tour le plus rapide · ",
    orange: "orange",
    legendeFin: " : le plus lent.",
    copie: "Tours copiés : collez-les dans un tableur ou une note.",
    refus: "Votre navigateur a refusé la copie.",
  },
  en: {
    nomAppli: "75tools online stopwatch",
    motsCles: "online stopwatch, stopwatch free, stopwatch with laps, online chronometer, lap timer",
    ecoule: "Elapsed time",
    pause: "Pause",
    reprendre: "Resume",
    demarrer: "Start",
    tour: "Lap",
    zero: "Reset",
    pleinEcran: "Full screen",
    clavier: "Keyboard: Space (start, pause) · T (lap) · R (reset)",
    tours: "Laps",
    copier: "Copy laps",
    attente: "Recorded laps will show here, the latest at the top.",
    colTour: "Lap",
    colTemps: "Time",
    colCumul: "Total",
    enteteCopie: "Lap\tLap time\tTotal",
    meilleur: " (fastest lap)",
    pire: " (slowest lap)",
    vert: "Green",
    legende: ": fastest lap · ",
    orange: "orange",
    legendeFin: ": slowest.",
    copie: "Laps copied: paste them into a spreadsheet or a note.",
    refus: "Your browser blocked the copy.",
  },
};

interface Tour {
  n: number;
  tour: number;
  cumul: number;
}

const Chronometre = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const f = (ms: number) => formatChrono(ms, lang);
  // depart : instant Date.now() (horloge système, qui continue pendant la veille) du dernier démarrage ; cumule : temps accumulé avant ce démarrage.
  const [enMarche, setEnMarche] = useState(false);
  const [cumule, setCumule] = useState(0);
  const [depart, setDepart] = useState(0);
  const [affiche, setAffiche] = useState(0);
  const [tours, setTours] = useState<Tour[]>([]);
  const [etat, setEtat] = useState("");
  const cadre = useRef<HTMLDivElement>(null);

  const ecoule = useCallback(() => (enMarche ? cumule + Date.now() - depart : cumule), [enMarche, cumule, depart]);

  useEffect(() => {
    if (!enMarche) {
      setAffiche(cumule);
      return;
    }
    let id = 0;
    const boucle = () => {
      setAffiche(cumule + Date.now() - depart);
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [enMarche, cumule, depart]);

  const demarrerPause = useCallback(() => {
    if (enMarche) {
      setCumule(cumule + Date.now() - depart);
      setEnMarche(false);
    } else {
      setDepart(Date.now());
      setEnMarche(true);
    }
  }, [enMarche, cumule, depart]);

  const tour = useCallback(() => {
    const e = ecoule();
    if (e <= 0) return;
    setTours((ts) => {
      const precedent = ts.length ? ts[0].cumul : 0;
      return [{ n: ts.length + 1, tour: e - precedent, cumul: e }, ...ts];
    });
  }, [ecoule]);

  const zero = useCallback(() => {
    if (enMarche) return;
    setCumule(0);
    setAffiche(0);
    setTours([]);
    setEtat("");
  }, [enMarche]);

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement;
      if (cible.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space") {
        e.preventDefault();
        demarrerPause();
      } else if (e.key === "t" || e.key === "T") tour();
      else if (e.key === "r" || e.key === "R") zero();
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [demarrerPause, tour, zero]);

  const meilleur = tours.length > 1 ? Math.min(...tours.map((x) => x.tour)) : -1;
  const pire = tours.length > 1 ? Math.max(...tours.map((x) => x.tour)) : -1;

  const copier = async () => {
    const lignes = [t.enteteCopie, ...[...tours].reverse().map((x) => `${x.n}\t${f(x.tour)}\t${f(x.cumul)}`)];
    try {
      await navigator.clipboard.writeText(lignes.join("\n"));
      setEtat(t.copie);
    } catch {
      setEtat(t.refus);
    }
  };

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
      <div
        ref={cadre}
        className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-5 sm:p-8 flex flex-col items-center justify-center gap-5 [&:fullscreen]:bg-neutral-950"
      >
        <p
          data-resultat
          className="font-mono tabular-nums text-white text-[3.25rem] leading-none sm:text-7xl lg:text-8xl tracking-tight"
          aria-label={t.ecoule}
        >
          {f(affiche)}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Bouton onClick={demarrerPause}>{enMarche ? t.pause : affiche > 0 ? t.reprendre : t.demarrer}</Bouton>
          <Bouton secondaire onClick={tour} disabled={!enMarche}>
            {t.tour}
          </Bouton>
          <Bouton secondaire onClick={zero} disabled={enMarche || affiche === 0}>
            {t.zero}
          </Bouton>
          <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
            {t.pleinEcran}
          </Bouton>
        </div>
        <p className="text-xs text-neutral-500 text-center">{t.clavier}</p>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">{t.tours}</h2>
          <Bouton secondaire onClick={copier} disabled={tours.length === 0}>
            {t.copier}
          </Bouton>
        </div>
        {tours.length === 0 ? (
          <p className="text-sm text-neutral-500">{t.attente}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-lg border border-neutral-800">
            <table className="w-full text-sm tabular-nums">
              <thead className="sticky top-0 bg-neutral-900">
                <tr className="text-left text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="py-2 px-3 font-medium">{t.colTour}</th>
                  <th className="py-2 px-3 font-medium">{t.colTemps}</th>
                  <th className="py-2 px-3 font-medium">{t.colCumul}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-mono">
                {tours.map((x) => (
                  <tr key={x.n} className={cn(x.tour === meilleur && "text-emerald-300", x.tour === pire && "text-amber-300")}>
                    <td className="py-2 px-3">{x.n}</td>
                    <td className="py-2 px-3">
                      {f(x.tour)}
                      {x.tour === meilleur && <span className="sr-only">{t.meilleur}</span>}
                      {x.tour === pire && <span className="sr-only">{t.pire}</span>}
                    </td>
                    <td className="py-2 px-3 text-neutral-400">{f(x.cumul)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tours.length > 1 && (
          <p className="text-xs text-neutral-500">
            <span className="text-emerald-300">{t.vert}</span>
            {t.legende}
            <span className="text-amber-300">{t.orange}</span>
            {t.legendeFin}
          </p>
        )}
        <p role="status" className="text-sm text-sky-300 min-h-[1.25rem]">
          {etat}
        </p>
      </div>
    </div>
  );

  return (
    <PageOutil id="chronometre" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Un chronomètre en ligne au centième, en un clic">
      <p>
        Ce chronomètre en ligne se lance d'un clic sur « Démarrer » ou d'un appui sur la barre d'espace : le temps
        défile aussitôt en minutes, secondes et centièmes, puis en heures au-delà de 59 minutes. Pendant la mesure,
        « Tour » (ou la touche T) enregistre un temps intermédiaire, et le tableau de droite donne la durée de chaque
        tour et le cumul depuis le départ. Exemple : sur une séance de 8 × 400 m, les huit tours s'alignent et le plus
        rapide passe en vert, le plus lent en orange, ce qui montre d'un coup d'œil si l'allure baisse. « Pause » fige
        le temps sans l'effacer, « Remise à zéro » repart de 00:00,00. La mesure reste juste si vous changez d'onglet
        ou si l'écran se verrouille, car elle repose sur l'horloge de l'appareil. Sa limite tient à vous : un appui au
        doigt ajoute 0,15 à 0,25 seconde de réaction, trop pour un chronométrage officiel.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Cliquez sur <strong>Démarrer</strong> : le temps défile en minutes, secondes et centièmes.{" "}
        <strong>Pause</strong> fige l'affichage sans rien effacer ; <strong>Reprendre</strong> repart du temps atteint.
        Pendant la course, <strong>Tour</strong> enregistre un temps intermédiaire : le tableau indique la durée de ce
        tour et le cumul, et colore le tour le plus rapide et le plus lent dès qu'il y en a deux.{" "}
        <strong>Remise à zéro</strong> n'est possible qu'à l'arrêt, pour éviter d'effacer une mesure par un clic
        malheureux. <strong>Copier les tours</strong> envoie la liste dans le presse-papiers, prête à coller dans un
        tableur.
      </p>
      <p>
        Le bouton <strong>Plein écran</strong> agrandit les chiffres pour les lire de loin, au fond d'une salle ou
        depuis un tapis de course. Touche Échap pour en sortir. Sur iPhone, Safari n'autorise le plein écran que pour
        les vidéos : tournez le téléphone à l'horizontale, les chiffres prennent alors toute la largeur.
      </p>
    </Section>

    <Section titre="À quoi sert un chronomètre au centième">
      <p>
        <strong>Sport et course à pied</strong> : fractionné sur piste (des tours de 400 m comparés entre eux),
        gainage, temps de récupération entre deux séries. Le temps au tour montre tout de suite si l'allure baisse.
      </p>
      <p>
        <strong>Oral, présentation, entretien</strong> : répéter un exposé de 10 minutes ou un pitch de 3 minutes, en
        marquant un tour à chaque partie pour savoir laquelle déborde. Pour une durée imposée, avec une sonnerie à la
        fin, le <Link to="/minuteur/">minuteur en ligne avec sonnerie</Link> est plus adapté : il décompte au lieu de
        compter.
      </p>
      <p>
        <strong>Expériences en classe, cuisine, jeux</strong> : temps de chute d'un objet, durée d'une réaction, manche
        d'un jeu de société. Pour un événement daté (un départ en vacances, un examen), le{" "}
        <Link to="/compte-a-rebours/">compte à rebours jusqu'à une date</Link> affiche les jours restants.
      </p>
    </Section>

    <Section titre="Comment le temps est mesuré">
      <p>
        Un chronomètre de page web qui ajouterait un centième toutes les 10 millisecondes dériverait vite : les
        navigateurs ralentissent les minuteries des onglets en arrière-plan ; Chrome, après cinq minutes d'onglet
        masqué et silencieux, ne les exécute plus qu'une fois par minute. Ce chronomètre fait autrement. Au départ, il
        note l'heure exacte de l'appareil, à la milliseconde. À chaque image affichée, il recalcule l'écart entre
        maintenant et cet instant, ajouté au temps accumulé avant la dernière pause. L'affichage peut sauter quand
        l'onglet revient au premier plan, mais le temps, lui, ne se perd pas.
      </p>
      <p>
        Pourquoi l'heure de l'appareil plutôt que l'horloge haute résolution des navigateurs (performance.now) ? Selon
        les systèmes, cette dernière peut s'arrêter pendant la mise en veille : un téléphone qui verrouille son écran
        perdrait les minutes de veille. L'heure de l'appareil, elle, avance toujours. Contrepartie : si l'heure de
        l'ordinateur est corrigée pendant la mesure (synchronisation réseau), le temps chronométré l'est d'autant ;
        c'est rare et de l'ordre de la seconde au plus.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="An online stopwatch to the hundredth, in one click">
      <p>
        This online stopwatch starts with one click on Start or a tap of the space bar: time runs straight away in
        minutes, seconds and hundredths, then in hours after 59 minutes. While it runs, Lap (or the T key) records a
        split, and the table on the right shows each lap time and the running total since the start. For example, on
        an 8 × 400 m interval session at a running track, the eight laps line up, the fastest turns green and the
        slowest orange, so you see at a glance whether your pace is dropping. Pause freezes the time without clearing
        it, and Reset goes back to 00:00.00. The reading stays correct if you switch tabs or your screen locks, because
        it relies on the device clock. The main limit is you: pressing with a finger adds 0.15 to 0.25 seconds of
        reaction time, which rules it out for official race timing.
      </p>
    </Section>

    <Section titre="How to use it">
      <p>
        Click <strong>Start</strong> and the time runs in minutes, seconds and hundredths. <strong>Pause</strong>{" "}
        freezes the display without clearing anything, and <strong>Resume</strong> carries on from there. During the
        run, <strong>Lap</strong> records a split: the table shows that lap's duration and the total, and highlights the
        fastest and slowest laps once there are two. <strong>Reset</strong> only works while the stopwatch is stopped,
        so a stray click cannot wipe a measurement. <strong>Copy laps</strong> puts the list on your clipboard, ready to
        paste into a spreadsheet.
      </p>
      <p>
        <strong>Full screen</strong> enlarges the digits so you can read them from the back of a room or from a
        treadmill; press Esc to leave. On an iPhone, Safari only allows full screen for videos: turn the phone sideways
        and the digits fill the width instead.
      </p>
    </Section>

    <Section titre="What people use it for">
      <p>
        <strong>Running and gym sessions</strong>: interval laps on a track, planks, rest between sets. The lap times
        show immediately when you start to slow down, whether you train at a municipal stadium or in a park.
      </p>
      <p>
        <strong>Presentations and interviews</strong>: rehearsing a 10-minute talk or a 3-minute pitch, recording a lap
        at each part to see which one runs over. That helps if you prepare an oral exam in French, such as the DELF or a
        naturalisation interview. When the duration is fixed and you want an alarm, the{" "}
        <Link to="/en/online-timer/">online timer with an alarm</Link> suits better, because it counts down.
      </p>
      <p>
        <strong>Classroom experiments, cooking and games</strong>: the time an object takes to fall, a reaction, a round
        of a board game. For a dated event such as a flight home or an exam, the{" "}
        <Link to="/en/countdown/">countdown to a date</Link> shows the days left.
      </p>
    </Section>

    <Section titre="How the time is measured">
      <p>
        A web stopwatch that added one hundredth every 10 milliseconds would soon drift: browsers slow down timers in
        background tabs, and Chrome, after five minutes in a hidden and silent tab, runs some of them only once a
        minute. This stopwatch works differently. At the start it notes the exact device time, to the millisecond. On
        every frame it recalculates the gap between now and that moment, plus the time banked before the last pause.
        The display may jump when the tab comes back to the front, but no time is lost.
      </p>
      <p>
        Why the device clock rather than the browser's high-resolution clock (performance.now)? On some systems that
        clock stops while the device sleeps, so a phone that locks its screen would lose those minutes. The device
        clock always moves on. The trade-off: if the computer clock is corrected during a measurement (network time
        sync), the timed result moves by the same amount, which is rare and at most around a second.
      </p>
    </Section>
  </>
);

export default Chronometre;
