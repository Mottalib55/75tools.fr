import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, Champ, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { basculerPleinEcran } from "@/lib/temps";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
      r: "Non, rien n'est enregistré sur un serveur. Le nom et la date vivent dans l'adresse de la page : ajoutez-la à vos favoris ou à l'écran d'accueil du téléphone pour retrouver le décompte, ou copiez le lien de partage. Si vous ouvrez la page sans ce lien, elle repart de l'exemple proposé par défaut, le prochain Nouvel An.",
    },
    {
      q: "Le décompte continue-t-il quand je ferme la page ?",
      r: "Il n'a pas besoin de tourner en votre absence. Le temps restant est recalculé à chaque ouverture à partir de l'heure actuelle de l'appareil et de la date visée : en rouvrant le lien de partage ou le favori trois jours plus tard, vous voyez aussitôt les bons chiffres. Seule condition, que l'horloge de l'appareil soit à l'heure, ce qui est le cas des téléphones et ordinateurs réglés en automatique.",
    },
    {
      q: "Pourquoi le compteur affiche-t-il 0 jour la veille de l'événement ?",
      r: "Parce qu'il compte des jours complets de 24 heures. À 23 h la veille d'un événement fixé à minuit, il reste 0 jour et 1 heure, et non 1 jour comme le dirait un calendrier. Pour un compte en jours de calendrier, sans heures, utilisez le calcul du nombre de jours entre deux dates, qui donne aussi les jours ouvrés et tient compte des jours fériés.",
    },
    {
      q: "Dans quel format la date est-elle écrite dans le lien de partage ?",
      r: "Au format de la norme ISO 8601 : année, mois, jour puis heure, par exemple 2027-01-01T00:00. Le champ de saisie, lui, suit les habitudes de votre navigateur, jj/mm/aaaa en français. Ce format international évite toute confusion : 03/04 veut dire 3 avril en France mais 4 mars aux États-Unis, alors que 2027-04-03 ne se lit que d'une seule façon.",
    },
  ],
  en: [
    {
      q: "I send the countdown link to family in another country: will they see the same deadline?",
      r: "The link holds the date and time exactly as you typed them, with no time zone, so each person who opens it counts down to that time where they are. For New Year or a birthday, that is what you want. For an event at a fixed moment worldwide, such as a video call at 8 pm Paris time with relatives in London or Toronto, add Paris time to the event name.",
    },
    {
      q: "Does the countdown handle the switch to summer or winter time?",
      r: "Yes. The target date is turned into a precise moment using your device's local time, clock changes included. In France the clocks go back on the last Sunday of October, so a countdown to 1 November that crosses that night shows one hour more than the plain difference between the two wall-clock times, which is the time that really passes.",
    },
    {
      q: "Is my countdown saved anywhere?",
      r: "No, nothing is stored on a server. The name and date live in the page address: bookmark it or add it to your phone's home screen to find the countdown again, or copy the share link. If you open the page without that link, it goes back to the default example, the next New Year. Nothing about you or your event is sent anywhere.",
    },
    {
      q: "Why does it say 0 days on the evening before the event?",
      r: "Because it counts full 24-hour days. At 11 pm on the eve of an event set for midnight, there are 0 days and 1 hour left, not 1 day as a calendar would say. For a count in calendar days without hours, use the days between dates calculator, which also gives working days and takes French public holidays into account.",
    },
    {
      q: "What date format does the share link use?",
      r: "The ISO 8601 format: year, month, day, then time, for example 2027-01-01T00:00. The input field follows your browser's settings, often day/month/year in the UK and France. The international format avoids mix-ups: 03/04 means 3 April in France and Britain but 4 March in the United States, whereas 2027-04-03 can only be read one way.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 8601, Date and time format (format des dates et heures)", url: "https://www.iso.org/iso-8601-date-and-time-format.html", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, The input element (champs date et heure)", url: "https://html.spec.whatwg.org/multipage/input.html", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "URL Standard (paramètres du lien de partage)", url: "https://url.spec.whatwg.org/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard (plein écran)", url: "https://fullscreen.spec.whatwg.org/", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 8601, Date and time format", url: "https://www.iso.org/iso-8601-date-and-time-format.html", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, The input element", url: "https://html.spec.whatwg.org/multipage/input.html", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "URL Standard", url: "https://url.spec.whatwg.org/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "Fullscreen API Standard", url: "https://fullscreen.spec.whatwg.org/", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Compte à rebours en ligne 75tools",
    motsCles: "compte à rebours en ligne, décompte jusqu'à une date, compte à rebours jours, countdown",
    nouvelAn: (a: number) => `Nouvel An ${a}`,
    noel: (a: number) => `Noël ${a}`,
    feteNationale: (a: number) => `Fête nationale ${a}`,
    unites: ["jours", "heures", "minutes", "secondes"],
    monEvenement: "Mon événement",
    invalide: "Date invalide.",
    atteint: "C'est le moment ! L'échéance est atteinte.",
    copier: "Copier le lien de partage",
    pleinEcran: "Plein écran",
    copie: "Lien copié : il recrée ce compte à rebours chez la personne qui l'ouvre.",
    refus: "Copie refusée : copiez l'adresse affichée dans la barre du navigateur.",
    evenement: "Événement",
    nom: "Nom de l'événement",
    exemple: "Départ en vacances",
    date: "Date",
    heure: "Heure",
    pretes: "Dates toutes prêtes",
  },
  en: {
    nomAppli: "75tools countdown to a date",
    motsCles: "countdown timer online, countdown to a date, days until, days left until, countdown clock",
    nouvelAn: (a: number) => `New Year ${a}`,
    noel: (a: number) => `Christmas ${a}`,
    feteNationale: (a: number) => `Bastille Day ${a}`,
    unites: ["days", "hours", "minutes", "seconds"],
    monEvenement: "My event",
    invalide: "Invalid date.",
    atteint: "It's time! The deadline has been reached.",
    copier: "Copy share link",
    pleinEcran: "Full screen",
    copie: "Link copied: it recreates this countdown for whoever opens it.",
    refus: "Copy blocked: copy the address shown in the browser bar.",
    evenement: "Event",
    nom: "Event name",
    exemple: "Holiday departure",
    date: "Date",
    heure: "Time",
    pretes: "Ready-made dates",
  },
};

const d2 = (n: number) => String(n).padStart(2, "0");
const isoLocal = (d: Date) => `${d.getFullYear()}-${d2(d.getMonth() + 1)}-${d2(d.getDate())}`;

/** Prochaine occurrence (dans le futur) d'un jour fixe de l'année, à minuit. */
function prochain(mois: number, jour: number, maintenant: Date) {
  let a = maintenant.getFullYear();
  if (new Date(a, mois - 1, jour) <= maintenant) a++;
  return new Date(a, mois - 1, jour);
}

const CompteARebours = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [nom, setNom] = useState(() => t.nouvelAn(prochain(1, 1, new Date()).getFullYear()));
  const [date, setDate] = useState(() => isoLocal(prochain(1, 1, new Date())));
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
      setNom((p.get("titre") || p.get("title") || "").slice(0, 80));
    }
    setMaintenant(Date.now());
    const id = window.setInterval(() => setMaintenant(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const cible = useMemo(() => {
    const [a, mo, j] = date.split("-").map(Number);
    const [h, mi] = (heure || "00:00").split(":").map(Number);
    if (!a || !mo || !j) return null;
    const d = new Date(a, mo - 1, j, h || 0, mi || 0, 0);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [date, heure]);

  const reste = cible && maintenant !== null ? cible.getTime() - maintenant : null;
  const passe = reste !== null && reste <= 0;
  const r = Math.max(0, reste ?? 0);
  const valeurs = [
    Math.floor(r / 86_400_000),
    Math.floor((r % 86_400_000) / 3_600_000),
    Math.floor((r % 3_600_000) / 60_000),
    Math.floor((r % 60_000) / 1000),
  ];
  const pret = reste !== null;

  const presets = useMemo(() => {
    if (maintenant === null) return [];
    const m = new Date(maintenant);
    const noel = prochain(12, 25, m);
    const an = prochain(1, 1, m);
    const fete = prochain(7, 14, m);
    return [
      { nom: t.noel(noel.getFullYear()), date: isoLocal(noel) },
      { nom: t.nouvelAn(an.getFullYear()), date: isoLocal(an) },
      { nom: t.feteNationale(fete.getFullYear()), date: isoLocal(fete) },
    ];
  }, [maintenant, t]);

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
      setEtat(t.copie);
    } catch {
      setEtat(t.refus);
    }
  };

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
      <div
        ref={cadre}
        data-resultat
        className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-5 sm:p-8 flex flex-col items-center gap-4 [&:fullscreen]:bg-neutral-950 [&:fullscreen]:justify-center"
      >
        <p className="text-xl sm:text-2xl text-white text-center [overflow-wrap:anywhere]">{nom.trim() || t.monEvenement}</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-8 w-full max-w-2xl" aria-hidden={!pret}>
          {valeurs.map((v, i) => (
            <div key={i} className="flex flex-col items-center min-w-0">
              <span className="font-mono tabular-nums text-white text-4xl sm:text-6xl lg:text-7xl leading-none">
                {pret ? (i === 0 ? v.toLocaleString(locale(lang)) : d2(v)) : "--"}
              </span>
              <span className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-neutral-500">{t.unites[i]}</span>
            </div>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-center text-neutral-400 min-h-[1.5rem]">
          {!cible
            ? t.invalide
            : passe
            ? t.atteint
            : cible.toLocaleString(locale(lang), { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Bouton onClick={partager}>{t.copier}</Bouton>
          <Bouton secondaire onClick={() => basculerPleinEcran(cadre.current)}>
            {t.pleinEcran}
          </Bouton>
        </div>
        {etat && <p className="text-sm text-sky-300 text-center">{etat}</p>}
      </div>

      <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label={t.evenement}>
        <Champ label={t.nom} value={nom} onChange={(v) => setNom(v.slice(0, 80))} placeholder={t.exemple} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.date}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={classeChamp} />
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.heure}</span>
            <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className={classeChamp} />
          </label>
        </div>
        {presets.length > 0 && (
          <div>
            <p className="text-sm text-neutral-300 mb-2">{t.pretes}</p>
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
  );

  return (
    <PageOutil id="compte-a-rebours" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Un compte à rebours en ligne jusqu'à la date de votre choix">
      <p>
        Ce compte à rebours en ligne affiche dès l'ouverture le temps restant avant le prochain Nouvel An, en jours,
        heures, minutes et secondes. Pour viser votre propre événement, écrivez son nom, choisissez sa date et son
        heure dans les champs de droite : le décompte se met à jour aussitôt, quatre fois par seconde. Exemple : le
        27 octobre à midi, il reste 65 jours et 12 heures avant le 1er janvier à minuit. Les boutons de dates toutes
        prêtes calculent la prochaine occurrence de Noël, du Nouvel An et du 14 juillet. « Copier le lien de partage »
        produit une adresse qui recrée le même décompte chez la personne qui l'ouvre, et le plein écran sert à le
        projeter. La limite principale tient au fuseau horaire : la date est lue à l'heure locale de chaque appareil,
        si bien qu'un ami à Montréal comptera jusqu'à minuit chez lui, pas chez vous.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Donnez un nom à l'événement (« Mariage de Léa », « Bac de français », « Départ pour Lisbonne »), puis sa date
        et son heure. Sans heure précise, laissez 00:00 : le compte à rebours vise le début de la journée. Le nom est
        limité à 80 caractères et s'affiche en tête du décompte.
      </p>
      <p>
        <strong>Copier le lien de partage</strong> met dans le presse-papiers une adresse qui contient le nom et la
        date : envoyée par message ou affichée sur un écran, elle recrée le même décompte. Le{" "}
        <strong>plein écran</strong> sert à le projeter pendant une soirée, une vente ou un lancement. Une fois
        l'échéance passée, la page l'annonce au lieu d'afficher des chiffres négatifs.
      </p>
    </Section>

    <Section titre="Compte à rebours, minuteur ou calcul de dates ?">
      <p>
        Le compte à rebours part d'une <strong>date</strong> : il dit combien de temps il reste avant un moment précis
        du calendrier, et peut s'étaler sur des mois. Le <Link to="/minuteur/">minuteur en ligne avec sonnerie</Link>{" "}
        part d'une <strong>durée</strong> (10 minutes, 1 heure) et sonne à la fin : c'est l'outil de la cuisine ou de
        la classe. Pour savoir seulement combien de jours, ou de jours ouvrés, séparent deux dates, sans décompte en
        direct, le calcul du <Link to="/nombre-de-jours-entre-deux-dates/">nombre de jours entre deux dates</Link>{" "}
        donne le détail, jours fériés compris.
      </p>
    </Section>

    <Section titre="Comment le temps restant est calculé">
      <p>
        La date et l'heure saisies sont lues comme une heure locale de votre appareil, puis converties en un instant
        précis. Le temps restant est la différence entre cet instant et l'heure actuelle, découpée en jours de
        24 heures, heures, minutes et secondes. Comme il est recalculé à chaque fois à partir de l'heure actuelle, le
        décompte ne dérive pas, même si l'onglet reste longtemps en arrière-plan.
      </p>
      <p>
        Les jours affichés sont des jours de 24 heures complets. À 23 h la veille d'un événement fixé à minuit, il
        reste donc 0 jour et 1 heure, et non « 1 jour » : c'est la lecture la plus exacte quand l'heure compte. Le
        changement d'heure de fin octobre ou de fin mars est intégré, puisque le calcul porte sur des instants et non
        sur les aiguilles de l'horloge.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A countdown to any date you choose">
      <p>
        This countdown to a date shows, as soon as it opens, the time left before the next New Year in days, hours,
        minutes and seconds. To count down to your own event, type its name and pick its date and time in the fields on
        the right: the countdown updates at once, four times a second. For example, on 27 October at noon there are
        65 days and 12 hours left until midnight on 1 January. The ready-made buttons find the next Christmas, New Year
        and Bastille Day (14 July, the French national holiday). Copy share link produces an address that rebuilds the
        same countdown for whoever opens it, and full screen lets you show it on a projector. The main limit is the
        time zone: the date is read in each device's local time, so a friend in London counts down to midnight there,
        one hour after Paris.
      </p>
    </Section>

    <Section titre="How to use it">
      <p>
        Give the event a name (Léa's wedding, the DELF exam, flight to Lisbon), then its date and time. If there is no
        set time, leave 00:00 and the countdown targets the start of that day. The name is limited to 80 characters and
        appears above the digits.
      </p>
      <p>
        <strong>Copy share link</strong> puts on your clipboard an address that holds the name and the date: sent by
        message or shown on a screen, it recreates the same countdown. <strong>Full screen</strong> is there to project
        it during a party, a sale or a launch. Once the deadline has passed, the page says so instead of showing
        negative numbers.
      </p>
    </Section>

    <Section titre="Countdown, timer or date calculator?">
      <p>
        The countdown starts from a <strong>date</strong>: it tells you how long is left before a precise moment in the
        calendar, and can run for months. The <Link to="/en/online-timer/">online timer with an alarm</Link> starts
        from a <strong>duration</strong> (10 minutes, 1 hour) and rings at the end, which suits cooking or a class. To
        know only how many days, or working days, lie between two dates without a live countdown, the{" "}
        <Link to="/en/days-between-dates/">days between two dates calculator</Link> gives the detail, French public
        holidays included.
      </p>
    </Section>

    <Section titre="How the time left is worked out">
      <p>
        The date and time you enter are read as your device's local time, then turned into a precise moment. The time
        left is the gap between that moment and now, split into 24-hour days, hours, minutes and seconds. Because it is
        recalculated from the current time every time, the countdown does not drift, even if the tab stays in the
        background for hours.
      </p>
      <p>
        The days shown are full 24-hour days. At 11 pm on the eve of an event set for midnight, there are 0 days and
        1 hour left, not one day: the most accurate reading when the hour matters. The clock change at the end of
        October or the end of March is built in, since the calculation works on moments in time and not on the hands
        of the clock.
      </p>
    </Section>
  </>
);

export default CompteARebours;
