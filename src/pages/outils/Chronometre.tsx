import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { formatChrono, basculerPleinEcran } from "@/lib/temps";
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
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
];

interface Tour {
  n: number;
  tour: number;
  cumul: number;
}

const Chronometre = () => {
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
    const t = ecoule();
    if (t <= 0) return;
    setTours((ts) => {
      const precedent = ts.length ? ts[0].cumul : 0;
      return [{ n: ts.length + 1, tour: t - precedent, cumul: t }, ...ts];
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

  const meilleur = tours.length > 1 ? Math.min(...tours.map((t) => t.tour)) : -1;
  const pire = tours.length > 1 ? Math.max(...tours.map((t) => t.tour)) : -1;

  const copier = async () => {
    const lignes = ["Tour\tTemps du tour\tCumul", ...[...tours].reverse().map((t) => `${t.n}\t${formatChrono(t.tour)}\t${formatChrono(t.cumul)}`)];
    try {
      await navigator.clipboard.writeText(lignes.join("\n"));
      setEtat("Tours copiés : collez-les dans un tableur ou une note.");
    } catch {
      setEtat("Votre navigateur a refusé la copie.");
    }
  };

  return (
    <PageOutil
      href="/chronometre/"
      titre="Chronomètre en ligne gratuit : au centième, avec tours"
      description="Chronomètre en ligne gratuit au centième de seconde : départ, pause, temps au tour, meilleur tour, plein écran et raccourcis clavier. Juste en arrière-plan."
      motsCles="chronomètre en ligne, chronomètre gratuit, chrono en ligne, chronomètre avec tours"
      faq={FAQ}
      nomAppli="Chronomètre en ligne"
      h1="Chronomètre en ligne"
      sources={[
        { editeur: "Chrome for Developers", titre: "Heavy throttling of chained JS timers beginning in Chrome 88", url: "https://developer.chrome.com/blog/timer-throttling-in-chrome-88", lu: "27 octobre 2026" },
        { editeur: "MDN Web Docs", titre: "Performance: now() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Performance/now", lu: "27 octobre 2026" },
      ]}
      chapeau="Démarrez, mettez en pause, enregistrez des tours : le temps s'affiche au centième de seconde et reste juste même si vous changez d'onglet. Barre d'espace pour démarrer, T pour un tour."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div
          ref={cadre}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sm:p-10 flex flex-col items-center justify-center gap-6 [&:fullscreen]:bg-neutral-950"
        >
          <p
            className="font-mono tabular-nums text-white text-[3.25rem] leading-none sm:text-7xl lg:text-8xl tracking-tight"
            aria-label="Temps écoulé"
          >
            {formatChrono(affiche)}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Bouton onClick={demarrerPause}>{enMarche ? "Pause" : affiche > 0 ? "Reprendre" : "Démarrer"}</Bouton>
            <Bouton secondaire onClick={tour} disabled={!enMarche}>
              Tour
            </Bouton>
            <Bouton secondaire onClick={zero} disabled={enMarche || affiche === 0}>
              Remise à zéro
            </Bouton>
            <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
              Plein écran
            </Bouton>
          </div>
          <p className="text-xs text-neutral-500 text-center">Clavier : Espace (départ, pause) · T (tour) · R (remise à zéro)</p>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">Tours</h2>
            <Bouton secondaire onClick={copier} disabled={tours.length === 0}>
              Copier les tours
            </Bouton>
          </div>
          {tours.length === 0 ? (
            <p className="text-sm text-neutral-500">Les tours enregistrés s'afficheront ici, le plus récent en haut.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border border-neutral-800">
              <table className="w-full text-sm tabular-nums">
                <thead className="sticky top-0 bg-neutral-900">
                  <tr className="text-left text-neutral-400 text-xs uppercase tracking-wider">
                    <th className="py-2 px-3 font-medium">Tour</th>
                    <th className="py-2 px-3 font-medium">Temps</th>
                    <th className="py-2 px-3 font-medium">Cumul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 font-mono">
                  {tours.map((t) => (
                    <tr
                      key={t.n}
                      className={cn(
                        t.tour === meilleur && "text-emerald-300",
                        t.tour === pire && "text-amber-300"
                      )}
                    >
                      <td className="py-2 px-3">{t.n}</td>
                      <td className="py-2 px-3">
                        {formatChrono(t.tour)}
                        {t.tour === meilleur && <span className="sr-only"> (meilleur tour)</span>}
                        {t.tour === pire && <span className="sr-only"> (tour le plus lent)</span>}
                      </td>
                      <td className="py-2 px-3 text-neutral-400">{formatChrono(t.cumul)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tours.length > 1 && (
            <p className="text-xs text-neutral-500">
              <span className="text-emerald-300">Vert</span> : tour le plus rapide · <span className="text-amber-300">orange</span> : le plus lent.
            </p>
          )}
          <p role="status" className="text-sm text-sky-300 min-h-[1.25rem]">
            {etat}
          </p>
        </div>
      </div>

      <Section titre="Mode d'emploi">
        <p>
          Cliquez sur <strong>Démarrer</strong> : le temps défile en minutes, secondes et centièmes, puis en heures
          au-delà de 59 minutes. <strong>Pause</strong> fige l'affichage sans rien effacer ; <strong>Reprendre</strong>{" "}
          repart du temps atteint. Pendant la course, <strong>Tour</strong> enregistre un temps intermédiaire : le
          tableau indique la durée de ce tour et le cumul depuis le départ, et colore le tour le plus rapide et le plus
          lent dès qu'il y en a deux. <strong>Remise à zéro</strong> n'est possible qu'à l'arrêt, pour éviter d'effacer
          une mesure par un clic malheureux.
        </p>
        <p>
          Le bouton <strong>Plein écran</strong> agrandit les chiffres pour les lire de loin, au fond d'une salle ou
          depuis un tapis de course. Touche Échap pour en sortir. Sur iPhone, Safari n'autorise le plein écran que
          pour les vidéos : tournez le téléphone à l'horizontale, les chiffres prennent alors toute la largeur.
        </p>
      </Section>

      <Section titre="À quoi sert un chronomètre au centième">
        <p>
          <strong>Sport et course à pied</strong> : fractionné sur piste (des tours de 400 m comparés entre eux),
          gainage, temps de récupération entre deux séries. Le temps au tour montre tout de suite si l'allure baisse.
        </p>
        <p>
          <strong>Oral, présentation, entretien</strong> : répéter un exposé de 10 minutes ou un pitch de 3 minutes, en
          marquant un tour à chaque partie pour savoir laquelle déborde. Pour une durée imposée, avec une sonnerie à
          la fin, le <Link to="/minuteur/">minuteur</Link> est plus adapté : il décompte au lieu de compter.
        </p>
        <p>
          <strong>Expériences en classe, cuisine, jeux</strong> : temps de chute d'un objet, durée d'une réaction,
          manche d'un jeu de société. Pour un événement daté (un départ en vacances, un examen), le{" "}
          <Link to="/compte-a-rebours/">compte à rebours</Link> affiche les jours restants.
        </p>
      </Section>

      <Section titre="Comment le temps est mesuré">
        <p>
          Un chronomètre de page web qui ajouterait un centième toutes les 10 millisecondes dériverait vite : les
          navigateurs ralentissent les minuteries des onglets en arrière-plan ; Chrome, après cinq minutes d'onglet
          masqué et silencieux, ne les exécute plus qu'une fois par minute. Ce chronomètre fait autrement. Au départ, il note l'heure exacte de
          l'appareil, à la milliseconde. À chaque image affichée, il recalcule l'écart entre maintenant et cet
          instant, ajouté au temps accumulé avant la dernière pause. L'affichage peut sauter quand l'onglet revient
          au premier plan, mais le temps, lui, ne se perd pas.
        </p>
        <p>
          Pourquoi l'heure de l'appareil plutôt que l'horloge haute résolution des navigateurs (performance.now) ?
          D'après la documentation MDN, cette dernière ne continue de tourner pendant la mise en veille du système
          que sur Windows : un téléphone qui verrouille son écran perdrait les minutes de veille. L'heure de
          l'appareil, elle, avance toujours. Contrepartie : si l'heure de l'ordinateur est corrigée pendant la mesure
          (synchronisation réseau), le temps chronométré l'est d'autant ; c'est rare et de l'ordre de la seconde au
          plus.
        </p>
      </Section>
    </PageOutil>
  );
};

export default Chronometre;
