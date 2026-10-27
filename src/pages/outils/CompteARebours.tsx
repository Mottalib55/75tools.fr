import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, Champ, QuestionFaq } from "@/components/outils/OutilLayout";
import { basculerPleinEcran } from "@/lib/temps";

const FAQ: QuestionFaq[] = [
  {
    q: "J'envoie le lien du compte à rebours à un ami à l'étranger : verra-t-il la même échéance ?",
    r: "Le lien contient la date et l'heure telles que vous les avez saisies, sans fuseau horaire : chaque personne qui l'ouvre voit le décompte jusqu'à cette heure-là chez elle. Pour un Nouvel An ou un anniversaire, c'est ce qu'on veut. Pour un événement à heure fixe dans le monde entier, un direct à 20 h à Paris par exemple, précisez l'heure de Paris dans le nom de l'événement.",
  },
  {
    q: "Le décompte tient-il compte du passage à l'heure d'hiver ou d'été ?",
    r: "Oui. La date visée est convertie en instant précis selon l'heure locale de votre appareil, changements d'heure compris. Un décompte jusqu'au 1er novembre qui traverse la nuit du passage à l'heure d'hiver affiche donc une heure de plus que la simple différence entre les deux horloges murales, ce qui correspond au temps réellement écoulé.",
  },
  {
    q: "Mon compte à rebours est-il enregistré quelque part ?",
    r: "Non, rien n'est enregistré sur un serveur. Le nom et la date vivent dans l'adresse de la page : ajoutez-la à vos favoris ou à l'écran d'accueil du téléphone pour retrouver le décompte, ou copiez le lien de partage. Si vous ouvrez la page sans ce lien, elle repart de l'exemple proposé par défaut.",
  },
];

const d2 = (n: number) => String(n).padStart(2, "0");
const isoLocal = (d: Date) => `${d.getFullYear()}-${d2(d.getMonth() + 1)}-${d2(d.getDate())}`;

/** Prochaine occurrence (dans le futur) d'un jour fixe de l'année, à minuit. */
function prochain(mois: number, jour: number, maintenant: Date) {
  let a = maintenant.getFullYear();
  if (new Date(a, mois - 1, jour) <= maintenant) a++;
  return new Date(a, mois - 1, jour);
}

const CompteARebours = () => {
  const [nom, setNom] = useState("Nouvel An 2027");
  const [date, setDate] = useState("2027-01-01");
  const [heure, setHeure] = useState("00:00");
  const [maintenant, setMaintenant] = useState<number | null>(null);
  const [etat, setEtat] = useState("");
  const cadre = useRef<HTMLDivElement>(null);

  // Paramètres de partage lus après le premier rendu (le HTML pré-rendu reste celui de l'exemple).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("date");
    if (d && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(d)) {
      setDate(d.slice(0, 10));
      setHeure(d.length > 10 ? d.slice(11, 16) : "00:00");
      setNom((p.get("titre") || "").slice(0, 80));
    }
    setMaintenant(Date.now());
    const id = window.setInterval(() => setMaintenant(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const cible = useMemo(() => {
    const [a, mo, j] = date.split("-").map(Number);
    const [h, mi] = (heure || "00:00").split(":").map(Number);
    const d = new Date(a, (mo || 1) - 1, j || 1, h || 0, mi || 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [date, heure]);

  const reste = cible && maintenant !== null ? cible.getTime() - maintenant : null;
  const passe = reste !== null && reste <= 0;
  const r = Math.max(0, reste ?? 0);
  const jours = Math.floor(r / 86_400_000);
  const heures = Math.floor((r % 86_400_000) / 3_600_000);
  const minutes = Math.floor((r % 3_600_000) / 60_000);
  const secondes = Math.floor((r % 60_000) / 1000);
  const pret = reste !== null;

  const presets = useMemo(() => {
    if (maintenant === null) return [];
    const m = new Date(maintenant);
    const noel = prochain(12, 25, m);
    const an = prochain(1, 1, m);
    return [
      { nom: `Noël ${noel.getFullYear()}`, date: isoLocal(noel) },
      { nom: `Nouvel An ${an.getFullYear()}`, date: isoLocal(an) },
      { nom: `Fête nationale ${prochain(7, 14, m).getFullYear()}`, date: isoLocal(prochain(7, 14, m)) },
    ];
  }, [maintenant]);

  const lien = () => {
    const u = new URL(window.location.href);
    u.search = "";
    u.searchParams.set("date", `${date}T${heure || "00:00"}`);
    if (nom.trim()) u.searchParams.set("titre", nom.trim());
    return u.toString();
  };

  const partager = async () => {
    const l = lien();
    window.history.replaceState(null, "", l);
    try {
      await navigator.clipboard.writeText(l);
      setEtat("Lien copié : il recrée ce compte à rebours chez la personne qui l'ouvre.");
    } catch {
      setEtat("Copie refusée : copiez l'adresse affichée dans la barre du navigateur.");
    }
  };

  const bloc = (v: number, l: string) => (
    <div className="flex flex-col items-center min-w-0">
      <span className="font-mono tabular-nums text-white text-4xl sm:text-6xl lg:text-7xl leading-none">{pret ? (l === "jours" ? v : d2(v)) : "--"}</span>
      <span className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-neutral-500">{l}</span>
    </div>
  );

  return (
    <PageOutil
      href="/compte-a-rebours/"
      titre="Compte à rebours en ligne : décompte jusqu'à une date"
      description="Compte à rebours en ligne gratuit jusqu'à une date et une heure : jours, heures, minutes et secondes restants, plein écran et lien à partager. Sans inscription."
      motsCles="compte à rebours en ligne, décompte jusqu'à une date, compte à rebours jours, countdown"
      faq={FAQ}
      nomAppli="Compte à rebours en ligne"
      h1="Compte à rebours jusqu'à une date"
      chapeau="Indiquez un événement, sa date et son heure : le décompte des jours, heures, minutes et secondes démarre aussitôt. Un lien permet de le partager tel quel."
      sources={[
        { editeur: "MDN Web Docs", titre: "Date : constructeur Date() (date et heure locales)", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Date/Date", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div
          ref={cadre}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 sm:p-10 flex flex-col items-center gap-6 [&:fullscreen]:bg-neutral-950 [&:fullscreen]:justify-center"
        >
          <p className="text-xl sm:text-2xl text-white text-center [overflow-wrap:anywhere]">{nom.trim() || "Mon événement"}</p>
          <div className="grid grid-cols-4 gap-3 sm:gap-8 w-full max-w-2xl" aria-hidden={!pret}>
            {bloc(jours, "jours")}
            {bloc(heures, "heures")}
            {bloc(minutes, "minutes")}
            {bloc(secondes, "secondes")}
          </div>
          <p role="status" aria-live="polite" className="text-center text-neutral-400 min-h-[1.5rem]">
            {!cible
              ? "Date invalide."
              : passe
              ? "C'est le moment ! L'échéance est atteinte."
              : cible.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Bouton onClick={partager}>Copier le lien de partage</Bouton>
            <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
              Plein écran
            </Bouton>
          </div>
          <p className="text-sm text-sky-300 min-h-[1.25rem] text-center">{etat}</p>
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Événement">
          <Champ label="Nom de l'événement" value={nom} onChange={(v) => setNom(v.slice(0, 80))} placeholder="Départ en vacances" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={classeChamp} />
            </label>
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Heure</span>
              <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={classeChamp} />
            </label>
          </div>
          {presets.length > 0 && (
            <div>
              <p className="text-sm text-neutral-300 mb-2">Dates toutes prêtes</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.nom}
                    type="button"
                    onClick={() => {
                      setNom(p.nom);
                      setDate(p.date);
                      setHeure("00:00");
                    }}
                    className="h-10 px-3 rounded-md border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 whitespace-nowrap"
                  >
                    {p.nom}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      <Section titre="Mode d'emploi">
        <p>
          Donnez un nom à l'événement (« Mariage de Léa », « Bac de français », « Départ pour Lisbonne »), puis sa date
          et son heure. Le décompte se met à jour quatre fois par seconde. Sans heure précise, laissez 00:00 : le
          compte à rebours vise le début de la journée. Les boutons de dates toutes prêtes calculent la prochaine
          occurrence de Noël, du Nouvel An et du 14 juillet.
        </p>
        <p>
          <strong>Copier le lien de partage</strong> met dans le presse-papiers une adresse qui contient le nom et la
          date : envoyée par message ou affichée sur un écran, elle recrée le même décompte. Le{" "}
          <strong>plein écran</strong> sert à le projeter pendant une soirée, une vente ou un lancement.
        </p>
      </Section>

      <Section titre="Compte à rebours, minuteur ou calcul de dates ?">
        <p>
          Le compte à rebours part d'une <strong>date</strong> : il dit combien de temps il reste avant un moment
          précis du calendrier, et peut s'étaler sur des mois. Le <Link to="/minuteur/">minuteur</Link> part d'une{" "}
          <strong>durée</strong> (10 minutes, 1 heure) et sonne à la fin : c'est l'outil de la cuisine ou de la classe.
          Pour savoir seulement combien de jours, ou de jours ouvrés, séparent deux dates, sans décompte en direct,
          le calcul du <Link to="/nombre-de-jours-entre-deux-dates/">nombre de jours entre deux dates</Link> donne le
          détail, jours fériés compris.
        </p>
      </Section>

      <Section titre="Comment le temps restant est calculé">
        <p>
          La date et l'heure saisies sont lues comme une heure locale de votre appareil, puis converties en un
          instant précis. Le temps restant est la différence entre cet instant et l'heure actuelle, découpée en jours
          de 24 heures, heures, minutes et secondes. Comme il est recalculé à chaque fois à partir de l'heure
          actuelle, le décompte ne dérive pas, même si l'onglet reste longtemps en arrière-plan.
        </p>
        <p>
          Les jours affichés sont des jours de 24 heures complets. À 23 h la veille d'un événement fixé à minuit, il
          reste donc 0 jour et 1 heure, et non « 1 jour » : c'est la lecture la plus exacte quand l'heure compte.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CompteARebours;
