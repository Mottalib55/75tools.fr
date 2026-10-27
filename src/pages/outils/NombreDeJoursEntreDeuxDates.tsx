import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, Case, ChampDate, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { fmt, lireNombre } from "@/lib/calculs-nombres";
import {
  TypeJour,
  ajouterJours,
  compterJours,
  dateCourte,
  dateLongue,
  decompose,
  ecartAnneesMoisJours,
  feriesEntre,
  joursFeries,
  lireDate,
  paques,
} from "@/lib/calculs-dates";
import { locale, useLangue, type Langue } from "@/lib/langue";

const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Du 1er au 31 mai, ça fait 30 ou 31 jours ?",
      r: "Les deux réponses existent, selon ce qu'on compte. L'écart entre les deux dates est de 30 jours : c'est ce que donne une soustraction, comme pour une durée entre deux rendez-vous. Si le 31 mai est lui-même un jour compté (location, congé, séjour jour par jour), la période dure 31 jours. Cochez « Compter aussi le jour de fin » pour obtenir le second résultat : la case modifie aussi le décompte des jours ouvrés.",
    },
    {
      q: "Je travaille en Alsace ou en Moselle, quels jours fériés s'ajoutent ?",
      r: "Le Vendredi saint, deux jours avant Pâques, et le 26 décembre, lendemain de Noël. Service-public.fr précise que le Vendredi saint n'est férié que dans les communes ayant un temple protestant ou une église mixte. Cochez la case Alsace-Moselle : les deux jours sont retirés des jours ouvrés et ouvrables et apparaissent dans la liste des fériés de la période.",
    },
    {
      q: "Un jour férié qui tombe un samedi compte-t-il dans les jours ouvrables ?",
      r: "Il est retiré du décompte des jours ouvrables, puisqu'un jour férié n'est pas un jour ouvrable dans le calcul de l'outil. En jours ouvrés, il ne change rien : le samedi n'en fait déjà pas partie. Le 15 août 2026, par exemple, tombe un samedi : il fait perdre un jour ouvrable au mois d'août, mais aucun jour ouvré. La liste des fériés indique le jour de la semaine de chacun.",
    },
    {
      q: "Pourquoi l'année 2026 compte-t-elle 252 jours ouvrés ?",
      r: "L'année 2026 compte 261 jours du lundi au vendredi. Sur les onze jours fériés, neuf tombent en semaine (le 15 août est un samedi, la Toussaint un dimanche) : 261 − 9 = 252 jours ouvrés. Le nombre change chaque année avec la position des fériés dans la semaine. Saisissez le 1er janvier et le 31 décembre, case « jour de fin » cochée, pour obtenir le total d'une autre année.",
    },
    {
      q: "Un délai qui se termine un samedi ou un dimanche est-il prolongé ?",
      r: "Pour un délai de procédure, oui : l'article 642 du Code de procédure civile reporte l'échéance tombant un samedi, un dimanche ou un jour férié ou chômé au premier jour ouvrable suivant. Le jour de l'acte qui fait courir un délai en jours ne compte pas (article 641). D'autres délais, contractuels ou administratifs, ont leurs propres règles : vérifiez le texte qui fixe le vôtre avant de vous fier au calcul.",
    },
    {
      q: "Le lundi de Pentecôte est-il compté comme un jour ouvré ?",
      r: "Non, l'outil le traite comme un jour férié, ce qu'il est dans le Code du travail. Beaucoup d'entreprises en font pourtant la journée de solidarité, travaillée sans être payée en plus, et d'autres la placent un autre jour. Si vous travaillez ce lundi, ajoutez un jour au nombre de jours ouvrés affiché pour la période qui le contient, par exemple le 25 mai 2026.",
    },
  ],
  en: [
    {
      q: "What is the difference between jours ouvrés and jours ouvrables in France?",
      r: "Jours ouvrés are working days in the everyday sense: Monday to Friday, public holidays excluded. Jours ouvrables run from Monday to Saturday, again without public holidays, and still matter in French employment law: paid leave is often counted as 30 jours ouvrables a year, which equals 25 jours ouvrés. The calculator gives both counts for any period, alongside calendar days.",
    },
    {
      q: "From 1 to 31 May, is that 30 or 31 days?",
      r: "It depends on what you count. The gap between the two dates is 30 days, which is what a subtraction gives, like the time between two appointments. If 31 May is itself a day that counts, as in a rental, a holiday or a hotel stay, the period lasts 31 days. Tick the box that counts the end date to get the second figure; it also changes the working day count.",
    },
    {
      q: "Which extra public holidays apply in Alsace and Moselle?",
      r: "Good Friday, two days before Easter Sunday, and 26 December, the day after Christmas. These two holidays survive from local law in the Bas-Rhin, Haut-Rhin and Moselle departments; Service-public.fr notes that Good Friday is a holiday only in towns with a Protestant church or a shared church. Tick the Alsace-Moselle box and both days leave the working day counts.",
    },
    {
      q: "Why does 2026 have 252 working days in France?",
      r: "2026 has 261 weekdays from Monday to Friday. Of the eleven national public holidays, nine fall on a weekday, since 15 August is a Saturday and 1 November a Sunday, so 261 − 9 = 252 jours ouvrés. The figure moves every year with the position of the holidays. Enter 1 January and 31 December with the end date counted to get any other year.",
    },
    {
      q: "Is a French legal deadline extended when it ends on a weekend?",
      r: "For court procedure deadlines, yes: article 642 of the Code de procédure civile moves a deadline ending on a Saturday, Sunday or public holiday to the next working day, and article 641 says the starting day of a deadline in days is not counted. Contract and administrative deadlines can follow other rules, so check the text that sets yours before relying on the result.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service-public.fr", titre: "Jours fériés et ponts dans le secteur privé", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2405", lu: "27 octobre 2026" },
    { editeur: "Code du travail numérique", titre: "Jour ouvrable, jour ouvré, jour franc, jour calendaire : quelles sont les différences ?", url: "https://code.travail.gouv.fr/fiche-service-public/jour-ouvrable-jour-ouvre-jour-franc-jour-calendaire-quelles-differences", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Article 641 du Code de procédure civile", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411002", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Article 642 du Code de procédure civile", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411003", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service-public.fr", titre: "Jours fériés et ponts dans le secteur privé (public holidays in the private sector)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2405", lu: "27 October 2026" },
    { editeur: "Code du travail numérique", titre: "Jour ouvrable, jour ouvré, jour franc, jour calendaire : quelles sont les différences ? (types of days)", url: "https://code.travail.gouv.fr/fiche-service-public/jour-ouvrable-jour-ouvre-jour-franc-jour-calendaire-quelles-differences", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Article 641 du Code de procédure civile (how deadlines are counted)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411002", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Article 642 du Code de procédure civile (deadlines ending on a weekend)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411003", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Nombre de jours entre deux dates 75tools",
    motsCles: "nombre de jours entre deux dates, calculer le nombre de jours entre deux dates, combien de jours entre deux dates, jours ouvrés, jours ouvrables",
    pl: (n: number, mot: string, motPl = mot + "s") => `${n.toLocaleString("fr-FR")} ${Math.abs(n) >= 2 ? motPl : mot}`,
    jour: ["jour", "jours"],
    semaine: ["semaine", "semaines"],
    an: ["an", "ans"],
    samedi: ["samedi", "samedis"],
    dimanche: ["dimanche", "dimanches"],
    ferie: ["jour férié", "jours fériés"],
    debutInc: "Date de début incomplète ou inexistante.",
    finInc: "Date de fin incomplète ou inexistante.",
    inverse: "La date de fin précède la date de début : les deux dates ont été inversées pour le calcul.",
    trop: "Période de plus de 200 ans : les jours ouvrés et les fériés ne sont pas détaillés.",
    t1: "Nombre de jours entre deux dates",
    debut: "Date de début",
    fin: "Date de fin",
    aujourdhui: "Aujourd'hui",
    inclure: "Compter aussi le jour de fin (du premier au dernier jour inclus)",
    alsace: "Alsace-Moselle : ajouter le Vendredi saint et le 26 décembre",
    calendaires: "Jours calendaires",
    ouvres: "Jours ouvrés",
    ouvrables: "Jours ouvrables",
    soitSem: (s: string, j: string) => `Soit ${s} et ${j}`,
    soitMois: (m: string, j: string) => `Soit ${m} mois et ${j}`,
    ouAns: (a: string, m: string, j: string) => `, ou ${a}, ${m} mois et ${j}`,
    annees: (x: string, v: number) => `Soit environ ${x} ${v >= 2 ? "années" : "année"} de 365,25 jours`,
    dont: (s: string, d: string, f: string) => `Dont ${s}, ${d} et ${f}`,
    plusUn: (n: number) => ` + 1 (jour de fin compté) = ${n}`,
    periode: (a: string, b: string) => `Période comptée pour les jours ouvrés : du ${a} au ${b} inclus.`,
    vide: "Période vide : aucun jour ouvré.",
    feriesPeriode: "Jours fériés dans la période",
    weekend: "(week-end)",
    limite: "Liste limitée aux 60 premiers jours fériés.",
    departInc: "Date de départ incomplète ou inexistante.",
    saisirNb: "Saisissez un nombre de jours.",
    nbPasNombre: "Le nombre de jours n'est pas un nombre.",
    arrondi: (n: number) => `Nombre de jours arrondi à l'entier : ${n}.`,
    plafond: "Nombre de jours ramené à 36 500 (environ cent ans).",
    hors: "La date obtenue sort du calendrier pris en charge (1600 à 2999).",
    motType: { calendaire: ["jour calendaire", "jours calendaires"], ouvre: ["jour ouvré", "jours ouvrés"], ouvrable: ["jour ouvrable", "jours ouvrables"] },
    t2: "Date après (ou avant) N jours",
    depart: "Date de départ",
    nb: "Nombre de jours (négatif pour reculer)",
    typeJours: "Type de jours",
    tCal: "Calendaires",
    tOuv: "Ouvrés",
    tOuvr: "Ouvrables",
    alsaceCourt: "Alsace-Moselle",
    obtenue: "Date obtenue",
    noteType: (ouvre: boolean) =>
      ` (le jour de départ n'est pas compté ; seuls les jours ${ouvre ? "du lundi au vendredi" : "du lundi au samedi"} non fériés avancent le compte)`,
    soitCal: (x: string) => `, soit ${x} calendaires.`,
    attente: "Choisissez deux dates pour voir le nombre de jours.",
  },
  en: {
    nomAppli: "75tools days between dates calculator",
    motsCles: "days between dates, how many days between two dates, working days calculator france, jours ouvrés, jours ouvrables, french public holidays",
    pl: (n: number, mot: string, motPl = mot + "s") => `${n.toLocaleString("en-GB")} ${Math.abs(n) === 1 ? mot : motPl}`,
    jour: ["day", "days"],
    semaine: ["week", "weeks"],
    an: ["year", "years"],
    samedi: ["Saturday", "Saturdays"],
    dimanche: ["Sunday", "Sundays"],
    ferie: ["public holiday", "public holidays"],
    debutInc: "Start date incomplete or does not exist.",
    finInc: "End date incomplete or does not exist.",
    inverse: "The end date is before the start date: the two dates have been swapped for the calculation.",
    trop: "Period longer than 200 years: working days and holidays are not detailed.",
    t1: "Number of days between two dates",
    debut: "Start date",
    fin: "End date",
    aujourdhui: "Today",
    inclure: "Count the end date too (first to last day inclusive)",
    alsace: "Alsace-Moselle: add Good Friday and 26 December",
    calendaires: "Calendar days",
    ouvres: "Working days (ouvrés)",
    ouvrables: "Jours ouvrables (Mon–Sat)",
    soitSem: (s: string, j: string) => `That is ${s} and ${j}`,
    soitMois: (m: string, j: string) => `That is ${m} and ${j}`,
    ouAns: (a: string, m: string, j: string) => `, or ${a}, ${m} and ${j}`,
    annees: (x: string, v: number) => `About ${x} ${v === 1 ? "year" : "years"} of 365.25 days`,
    dont: (s: string, d: string, f: string) => `Including ${s}, ${d} and ${f}`,
    plusUn: (n: number) => ` + 1 (end date counted) = ${n}`,
    periode: (a: string, b: string) => `Period used for working days: ${a} to ${b} inclusive.`,
    vide: "Empty period: no working days.",
    feriesPeriode: "Public holidays in the period",
    weekend: "(weekend)",
    limite: "List limited to the first 60 public holidays.",
    departInc: "Start date incomplete or does not exist.",
    saisirNb: "Enter a number of days.",
    nbPasNombre: "The number of days is not a number.",
    arrondi: (n: number) => `Number of days rounded to a whole number: ${n}.`,
    plafond: "Number of days capped at 36,500 (about a hundred years).",
    hors: "The resulting date is outside the supported calendar (1600 to 2999).",
    motType: { calendaire: ["calendar day", "calendar days"], ouvre: ["working day", "working days"], ouvrable: ["jour ouvrable", "jours ouvrables"] },
    t2: "Date after (or before) N days",
    depart: "Start date",
    nb: "Number of days (negative to go back)",
    typeJours: "Type of days",
    tCal: "Calendar",
    tOuv: "Working",
    tOuvr: "Ouvrables",
    alsaceCourt: "Alsace-Moselle",
    obtenue: "Resulting date",
    noteType: (ouvre: boolean) =>
      ` (the start day is not counted; only non-holiday days from ${ouvre ? "Monday to Friday" : "Monday to Saturday"} move the count forward)`,
    soitCal: (x: string) => `, that is ${x} in calendar days.`,
    attente: "Pick two dates to see the number of days.",
  },
};

const useOutils = () => {
  const lang = useLangue();
  const t = T[lang];
  const p = (n: number, [un, plusieurs]: string[]) => t.pl(n, un, plusieurs);
  return { lang, t, p, loc: locale(lang) };
};

/** Écart entre deux dates. */
const BlocEcart = () => {
  const { lang, t, p, loc } = useOutils();
  const [debut, setDebut] = useState("2026-01-01");
  const [fin, setFin] = useState("2026-12-31");
  const [inclure, setInclure] = useState(true);
  const [alsace, setAlsace] = useState(false);
  const msg: string[] = [];
  let d1 = lireDate(debut), d2 = lireDate(fin);
  if (d1 === null) msg.push(t.debutInc);
  if (d2 === null) msg.push(t.finInc);
  if (d1 !== null && d2 !== null && d2 < d1) {
    msg.push(t.inverse);
    [d1, d2] = [d2, d1];
  }
  const ok = d1 !== null && d2 !== null;
  const nb = ok ? d2! - d1! + (inclure ? 1 : 0) : 0;
  const derniers = ok ? (inclure ? d2! : d2! - 1) : 0;
  const trop = ok && nb > 366 * 200;
  if (trop) msg.push(t.trop);
  const c = ok && !trop && derniers >= d1! ? compterJours(d1!, derniers, alsace) : null;
  const feries = ok && !trop && derniers >= d1! ? feriesEntre(d1!, derniers, alsace, lang) : [];
  const ecart = ok ? ecartAnneesMoisJours(d1!, d2! + (inclure ? 1 : 0)) : null;
  const lienJour = "mt-1 py-2 text-sm text-sky-300 underline underline-offset-4";
  return (
    <BlocCalcul titre={t.t1} id="ecart">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <ChampDate label={t.debut} value={debut} onChange={setDebut} id="debut" />
              <button type="button" onClick={() => setDebut(aujourdhui())} className={lienJour}>
                {t.aujourdhui}
              </button>
            </div>
            <div className="min-w-0">
              <ChampDate label={t.fin} value={fin} onChange={setFin} id="fin" />
              <button type="button" onClick={() => setFin(aujourdhui())} className={lienJour}>
                {t.aujourdhui}
              </button>
            </div>
          </div>
          <Case checked={inclure} onChange={setInclure}>
            {t.inclure}
          </Case>
          <Case checked={alsace} onChange={setAlsace}>
            {t.alsace}
          </Case>
        </div>
        <div className="min-w-0" data-resultat>
          <div className="grid grid-cols-3 gap-3">
            <Resultat libelle={t.calendaires} valeur={ok ? nb.toLocaleString(loc) : "–"} id="res-jours" />
            <Resultat libelle={t.ouvres} valeur={c ? c.ouvres.toLocaleString(loc) : ok && !trop ? "0" : "–"} id="res-ouvres" />
            <Resultat libelle={t.ouvrables} valeur={c ? c.ouvrables.toLocaleString(loc) : ok && !trop ? "0" : "–"} id="res-ouvrables" />
          </div>
          {ok && ecart ? (
            <ul className="mt-4 space-y-1 text-sm text-neutral-300 tabular-nums">
              <li>{t.soitSem(p(Math.floor(nb / 7), t.semaine), p(nb % 7, t.jour))}</li>
              <li>
                {t.soitMois(ecart.moisTotal.toLocaleString(loc) + (lang === "en" ? (ecart.moisTotal === 1 ? " month" : " months") : ""), p(ecart.jours, t.jour))}
                {ecart.annees > 0 &&
                  t.ouAns(p(ecart.annees, t.an), ecart.mois.toLocaleString(loc) + (lang === "en" ? (ecart.mois === 1 ? " month" : " months") : ""), p(ecart.jours, t.jour))}
              </li>
              <li>{t.annees(fmt(nb / 365.25, 2, lang), Number((nb / 365.25).toFixed(2)))}</li>
              {c && <li>{t.dont(p(c.samedis, t.samedi), p(c.dimanches, t.dimanche), p(feries.length, t.ferie))}</li>}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">{t.attente}</p>
          )}
        </div>
      </div>
      {ok && (
        <Formule>
          {dateCourte(d2!)} − {dateCourte(d1!)} = {p(d2! - d1!, t.jour)}
          {inclure ? t.plusUn(nb) : ""}.{" "}
          {derniers >= d1! ? t.periode(dateLongue(d1!, true, lang), dateLongue(derniers, true, lang)) : t.vide}
        </Formule>
      )}
      {feries.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-400 mb-2">{t.feriesPeriode}</p>
          <ul className="text-sm space-y-1 sm:columns-2 sm:gap-6" id="liste-feries">
            {feries.slice(0, 60).map((f) => {
              const js = decompose(f.n).js;
              return (
                <li key={f.n} className="flex flex-wrap gap-x-2 break-inside-avoid">
                  <span className="text-neutral-100">{dateLongue(f.n, true, lang)}</span>
                  <span className="text-neutral-400">{f.nom}</span>
                  {(js === 0 || js === 6) && <span className="text-neutral-500">{t.weekend}</span>}
                </li>
              );
            })}
          </ul>
          {feries.length > 60 && <p className="text-xs text-neutral-500 mt-1">{t.limite}</p>}
        </div>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Date + N jours. */
const BlocAjout = () => {
  const { lang, t, p } = useOutils();
  const [depart, setDepart] = useState("2026-04-30");
  const [n, setN] = useState("5");
  const [type, setType] = useState<TypeJour>("ouvre");
  const [alsace, setAlsace] = useState(false);
  useEffect(() => setDepart(aujourdhui()), []);
  const msg: string[] = [];
  const d = lireDate(depart);
  if (d === null) msg.push(t.departInc);
  let k = lireNombre(n, lang);
  if (n.trim() === "") msg.push(t.saisirNb);
  else if (k === null) msg.push(t.nbPasNombre);
  else {
    if (!Number.isInteger(k)) {
      msg.push(t.arrondi(Math.round(k)));
      k = Math.round(k);
    }
    if (Math.abs(k) > 36500) {
      msg.push(t.plafond);
      k = Math.sign(k) * 36500;
    }
  }
  const r = d !== null && k !== null ? ajouterJours(d, k, type, alsace) : null;
  const borne = r !== null && (decompose(r).a < 1600 || decompose(r).a > 2999);
  if (borne) msg.push(t.hors);
  return (
    <BlocCalcul titre={t.t2} id="ajout">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ChampDate label={t.depart} value={depart} onChange={setDepart} id="depart" />
            <ChampNombre label={t.nb} value={n} onChange={setN} id="nb-jours" />
          </div>
          <div className="mt-3">
            <Bascule
              libelle={t.typeJours}
              options={[
                { v: "calendaire" as const, l: t.tCal },
                { v: "ouvre" as const, l: t.tOuv },
                { v: "ouvrable" as const, l: t.tOuvr },
              ]}
              valeur={type}
              onChange={setType}
            />
            {type !== "calendaire" && (
              <Case checked={alsace} onChange={setAlsace}>
                {t.alsaceCourt}
              </Case>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <Resultat libelle={t.obtenue} valeur={r !== null && !borne ? dateLongue(r, true, lang) : "–"} id="res-date" />
          {r !== null && d !== null && k !== null && !borne && (
            <Formule>
              {dateLongue(d, true, lang)} {k >= 0 ? "+" : "−"} {p(Math.abs(k), t.motType[type])} = {dateLongue(r, true, lang)}
              {type !== "calendaire" && t.noteType(type === "ouvre")}
              {t.soitCal(p(Math.abs(r - d), t.jour))}
            </Formule>
          )}
        </div>
      </div>
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const feries2026_2027 = (lang: Langue) => {
  const [a, b] = [2026, 2027].map((x) => joursFeries(x, false, lang));
  return a.map((f, i) => [f.nom, dateLongue(f.n, true, lang), dateLongue(b[i].n, true, lang)]);
};

const NombreDeJoursEntreDeuxDates = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <div className="grid gap-4">
      <BlocEcart />
      <BlocAjout />
    </div>
  );
  return (
    <PageOutil id="nombre-de-jours-entre-deux-dates" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Calculer le nombre de jours entre deux dates">
      <p>
        Pour connaître le nombre de jours entre deux dates, soustrayez la date de début de la date de fin, puis ajoutez
        1 si le dernier jour compte aussi. Avec l'outil, choisissez les deux dates : les jours calendaires, les jours
        ouvrés (du lundi au vendredi) et les jours ouvrables (du lundi au samedi) s'affichent aussitôt, jours fériés
        français retirés. Du 1er janvier au 31 décembre 2026, jour de fin compté, on obtient 365 jours calendaires,
        252 jours ouvrés et 303 jours ouvrables ; du 1er au 31 mai sans compter le dernier jour, 30 jours. La durée est
        aussi donnée en semaines, en mois et en années, et le second bloc donne la date atteinte après un nombre de
        jours calendaires ou ouvrés. La limite : seuls les onze jours fériés nationaux et ceux d'Alsace-Moselle sont
        connus de l'outil, pas les ponts ni les jours de fermeture propres à une entreprise.
      </p>
    </Section>

    <Section titre="Calendaires, ouvrés, ouvrables : ce que compte l'outil">
      <p>
        Les <strong>jours calendaires</strong> sont tous les jours du calendrier, week-ends et fériés compris. Les{" "}
        <strong>jours ouvrés</strong> sont les jours du lundi au vendredi qui ne sont pas fériés ; les{" "}
        <strong>jours ouvrables</strong> vont du lundi au samedi, toujours hors jours fériés. Les deux décomptes portent
        sur la période affichée sous le résultat : du jour de début jusqu'à la veille de la date de fin, ou jusqu'à la
        date de fin incluse si la case est cochée. En mai 2026, du 1er au 31 inclus, on compte 17 jours ouvrés et 22
        jours ouvrables, car quatre fériés (1er, 8, 14 et 25 mai) tombent en semaine.
      </p>
      <p>
        Le second bloc avance jour par jour. En jours ouvrés, le jour de départ n'est pas compté et seuls les jours
        ouvrés font avancer le compteur : 5 jours ouvrés après le jeudi 30 avril 2026 mènent au lundi 11 mai, parce que
        les vendredis 1er et 8 mai sont fériés. Les dates sont traitées en jours entiers, sans heure : le changement
        d'heure ne décale aucun résultat. Pour compter des années, des mois et des jours depuis une naissance, le{" "}
        <Link to="/calculateur-age/">calculateur d'âge</Link> est plus direct.
      </p>
    </Section>

    <Section titre="Les jours fériés pris en compte">
      <p>
        L'outil retient les onze jours fériés de France métropolitaine listés par service-public.fr : 1er janvier, lundi
        de Pâques, 1er mai, 8 mai, Ascension, lundi de Pentecôte, 14 juillet, 15 août, 1er novembre, 11 novembre et 25
        décembre. En Alsace-Moselle s'ajoutent le Vendredi saint et le 26 décembre. Les fêtes mobiles dépendent de
        Pâques, calculé pour chaque année : l'Ascension tombe 39 jours après, le lundi de Pentecôte 50 jours après. Un
        jour férié n'est pas forcément chômé : seul le 1er mai l'est pour tous les salariés. Les jours fériés propres
        aux départements d'outre-mer ne sont pas pris en compte.
      </p>
      <Tableau entetes={["Jour férié", "2026", "2027"]} minW="26rem" lignes={feries2026_2027("fr")} />
      <p className="text-sm text-neutral-500">
        Pâques tombe le {dateLongue(paques(2026), false)} en 2026 et le {dateLongue(paques(2027), false)} en 2027.
      </p>
    </Section>

    <Section titre="Exemples d'usage">
      <p>
        Pour poser des congés, saisissez le premier et le dernier jour d'absence, case « jour de fin » cochée : les
        jours ouvrés correspondent aux jours de semaine posés, les jours ouvrables au décompte du lundi au samedi
        qu'utilisent encore certaines entreprises. Pour suivre une échéance, cliquez sur « Aujourd'hui » sous la date de
        début ; pour un affichage en continu, utilisez le <Link to="/compte-a-rebours/">compte à rebours</Link>. Pour
        une livraison annoncée en 10 jours ouvrés, le second bloc réglé sur « Ouvrés » donne la date prévue.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Counting the days between two dates in France">
      <p>
        To count the days between two dates, subtract the start date from the end date, then add 1 if the last day
        counts too. With this calculator, pick the two dates: calendar days, working days (jours ouvrés, Monday to
        Friday) and jours ouvrables (Monday to Saturday) appear at once, with French public holidays taken out. From 1
        January to 31 December 2026, end date included, you get 365 calendar days, 252 working days and 303 jours
        ouvrables; from 1 to 31 May without the last day, 30 days. The result is also shown in weeks, months and years,
        and the second block gives the date reached after a number of calendar or working days. The main limit: the
        tool knows the eleven national public holidays and the two extra ones in Alsace-Moselle, but not bridge days
        (ponts) or closures specific to your employer.
      </p>
    </Section>

    <Section titre="Jours ouvrés and jours ouvrables explained">
      <p>
        French payslips, employment contracts and leave rules use two kinds of working day. <strong>Jours ouvrés</strong>{" "}
        are the days the business normally works, usually Monday to Friday, public holidays excluded.{" "}
        <strong>Jours ouvrables</strong> are every day except Sunday and public holidays, so Monday to Saturday. Paid
        leave (congés payés) is traditionally counted as 2.5 jours ouvrables per month worked, 30 a year, which is the
        same five weeks as 25 jours ouvrés. A Saturday off therefore still uses up a jour ouvrable when you take a full
        week of leave.
      </p>
      <p>
        Both counts cover the period shown under the result: from the start date to the day before the end date, or to
        the end date itself when the box is ticked. In May 2026, from the 1st to the 31st inclusive, there are 17
        working days and 22 jours ouvrables, because four holidays (1, 8, 14 and 25 May) fall on weekdays. The second
        block moves day by day: 5 working days after Thursday 30 April 2026 is Monday 11 May, since Fridays 1 and 8 May
        are holidays. For an exact age in years, months and days, use the <Link to="/en/age-calculator/">age calculator</Link>.
      </p>
    </Section>

    <Section titre="French public holidays used by the calculator">
      <p>
        The eleven national holidays come from the list on Service-public.fr, the official French government portal.
        Easter Monday, Ascension Day (39 days after Easter) and Whit Monday (50 days after Easter) move every year. In
        Alsace and Moselle, Good Friday and 26 December are added. Only 1 May is a guaranteed day off for every
        employee; whether the others are worked depends on your collective agreement. Holidays specific to the overseas
        departments are not included. To watch a date approach live, try the <Link to="/en/countdown/">countdown</Link>.
      </p>
      <Tableau entetes={["Public holiday", "2026", "2027"]} minW="26rem" lignes={feries2026_2027("en")} />
      <p className="text-sm text-neutral-500">
        Easter Sunday falls on {dateLongue(paques(2026), false, "en")} in 2026 and on {dateLongue(paques(2027), false, "en")} in 2027.
      </p>
    </Section>
  </>
);

export default NombreDeJoursEntreDeuxDates;
