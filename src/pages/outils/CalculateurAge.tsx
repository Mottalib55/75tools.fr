import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, ChampDate, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { Convention29, age, dateLongue, decompose, jour, lireDate, nomJour } from "@/lib/calculs-dates";
import { locale, type Langue } from "@/lib/langue";

const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je suis né un 29 février, quel jour ai-je un an de plus les autres années ?",
      r: "Les années non bissextiles, le 29 février n'existe pas et deux usages coexistent : fêter son anniversaire le 28 février, ou le 1er mars. L'outil propose les deux réglages quand la date de naissance est un 29 février (ou un 29, 30 ou 31 pour le décompte des mois). Par défaut, l'âge change le 1er mars. Les années bissextiles, comme 2028, l'anniversaire tombe bien le 29 février.",
    },
    {
      q: "Je veux mon âge à une date précise, pas aujourd'hui, c'est possible ?",
      r: "Oui. Remplacez la date de référence, réglée sur aujourd'hui à l'ouverture de la page, par la date voulue : la date d'un examen, d'un concours, d'une inscription, ou le 31 décembre de l'année si un règlement fixe l'âge à cette date. Tous les résultats, y compris le prochain anniversaire et le nombre de jours vécus, sont recalculés à partir de cette date de référence.",
    },
    {
      q: "Le nombre d'heures vécues est-il exact ?",
      r: "Non, c'est un ordre de grandeur : le nombre de jours multiplié par 24. L'outil ne connaît ni l'heure de votre naissance ni le fuseau horaire, et ne tient pas compte des changements d'heure. L'écart avec le vrai nombre d'heures reste inférieur à une journée. Les années, mois, semaines et jours, eux, sont des comptes exacts de jours du calendrier, années bissextiles comprises.",
    },
    {
      q: "Pourquoi l'âge en mois et jours change-t-il selon le mois ?",
      r: "Parce que les mois n'ont pas tous la même longueur. L'outil compte d'abord les mois entiers écoulés depuis votre date de naissance, de date à date (du 15 au 15), puis les jours restants. Né un 31 janvier, vous avez un mois de plus le 1er mars d'une année non bissextile, faute de 31 février, ou le 28 février si vous choisissez le réglage « dernier jour du mois ».",
    },
    {
      q: "À quelle date exacte devient-on majeur en France ?",
      r: "Le jour de ses 18 ans. L'article 414 du Code civil fixe la majorité à dix-huit ans accomplis : une personne née le 15 mars 2008 est majeure le 15 mars 2026, dès le matin. Saisissez la date de naissance et la date qui vous intéresse comme date de référence : si l'outil affiche 18 ans, 0 mois et 0 jour ou plus, la personne est majeure à cette date.",
    },
    {
      q: "Comment connaître l'âge d'un bébé en mois ou en semaines ?",
      r: "Saisissez sa date de naissance : l'outil affiche l'âge en mois entiers et en semaines entières, les deux mesures qu'utilisent les carnets de santé et les pédiatres jusqu'à deux ou trois ans. Un bébé né le 10 juin 2026 a 4 mois le 10 octobre 2026 et 19 semaines le 21 octobre. Pour un âge corrigé de prématuré, retranchez vous-même les semaines d'avance.",
    },
  ],
  en: [
    {
      q: "I was born on 29 February, when do I turn a year older in other years?",
      r: "In non-leap years 29 February does not exist and two customs coexist: celebrating on 28 February or on 1 March. When the date of birth is 29 February, the calculator offers both settings, and the same choice applies to month counts for people born on the 29th, 30th or 31st. By default the age changes on 1 March. In leap years, such as 2028, the birthday falls on 29 February.",
    },
    {
      q: "Can I get my age on a specific date rather than today?",
      r: "Yes. Replace the reference date, which is set to today when the page opens, with the date you need: an exam, a visa or residence permit application, a school enrolment, or 31 December of a given year when a rule sets the age on that date. Every result, including the next birthday and the number of days lived, is recalculated from that reference date.",
    },
    {
      q: "When exactly do you legally become an adult in France?",
      r: "On your 18th birthday. Article 414 of the French Code civil sets the age of majority at eighteen completed years, so someone born on 15 March 2008 is an adult in France from 15 March 2026. Enter the date of birth and the date you are interested in as the reference date: if the result shows 18 years, 0 months and 0 days or more, the person is of age on that date.",
    },
    {
      q: "Why does my age in months and days depend on the month?",
      r: "Because months have different lengths. The calculator first counts the whole months since your date of birth, date to date (the 15th to the 15th), then the days left over. If you were born on 31 January, you gain a month on 1 March in a non-leap year, since there is no 31 February, or on 28 February if you choose the last day of the month setting.",
    },
    {
      q: "Is the number of hours lived exact?",
      r: "No, it is an estimate: the number of days multiplied by 24. The calculator does not know your time of birth or time zone and ignores clock changes, so the gap with the true number of hours stays below one day. Years, months, weeks and days, on the other hand, are exact counts of calendar days, leap years included, and do not depend on the time.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Légifrance", titre: "Article 414 du Code civil (majorité à dix-huit ans accomplis)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006427400", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Loi n° 74-631 du 5 juillet 1974 fixant à dix-huit ans l'âge de la majorité", url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068482", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Article 641 du Code de procédure civile (délais exprimés en mois ou en années)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411002", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Légifrance", titre: "Article 414 du Code civil (age of majority: eighteen completed years)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006427400", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Loi n° 74-631 du 5 juillet 1974 fixant à dix-huit ans l'âge de la majorité (1974 law lowering majority to 18)", url: "https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068482", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Article 641 du Code de procédure civile (periods counted in months or years)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006411002", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Calculateur d'âge 75tools",
    motsCles: "calculateur d'âge, calculer son âge exact, quel âge ai-je, âge en jours, âge en mois, prochain anniversaire",
    pl: (n: number, [un, pl]: string[]) => `${n.toLocaleString("fr-FR")} ${Math.abs(n) >= 2 ? pl : un}`,
    an: ["an", "ans"],
    mois: ["mois", "mois"],
    jour: ["jour", "jours"],
    semaine: ["semaine", "semaines"],
    naissInc: "Date de naissance incomplète ou inexistante.",
    refInc: "Date de référence incomplète ou inexistante.",
    horsCal: "Les dates doivent être comprises entre 1600 et 2999.",
    avant: "La date de naissance est postérieure à la date de référence : aucun âge à calculer.",
    naissance: "Date de naissance",
    reference: "Âge à la date du",
    aujourdhui: "Aujourd'hui",
    conv29: "Anniversaire les années non bissextiles",
    convMois: "Quand ce jour n'existe pas dans un mois",
    convention: "Convention",
    c1mars: "Le 1er mars",
    c1suivant: "Le 1er suivant",
    c28: "Le 28 février",
    cDernier: "Le dernier jour",
    ageExact: "Âge exact",
    valeurAge: (a: string, m: string, j: string) => `${a}, ${m} et ${j}`,
    enMois: "En mois",
    enSemaines: "En semaines",
    enJours: "En jours",
    heures: "Heures (environ)",
    ne: "Vous êtes né(e) un",
    le: ", le",
    cestAujourdhui: "C'est aujourd'hui votre anniversaire :",
    prochain: "Prochain anniversaire :",
    dans: ", dans",
    pourVos: (x: string) => `, pour vos ${x}.`,
    enSem: (s: string, j: string) => `En semaines : ${s} et ${j}.`,
    formule: (b: string, r: string, mt: string, a: string, m: string, j: string, jt: string) =>
      `Du ${b} au ${r} : ${mt} entiers (soit ${a} et ${m}), puis ${j} ; écart total entre les deux dates : ${jt}.`,
    attente: "Saisissez une date de naissance pour voir l'âge exact.",
  },
  en: {
    nomAppli: "75tools age calculator",
    motsCles: "age calculator, exact age calculator, how old am i, age in days, age in months, next birthday",
    pl: (n: number, [un, pl]: string[]) => `${n.toLocaleString("en-GB")} ${Math.abs(n) === 1 ? un : pl}`,
    an: ["year", "years"],
    mois: ["month", "months"],
    jour: ["day", "days"],
    semaine: ["week", "weeks"],
    naissInc: "Date of birth incomplete or does not exist.",
    refInc: "Reference date incomplete or does not exist.",
    horsCal: "Dates must fall between 1600 and 2999.",
    avant: "The date of birth is after the reference date: there is no age to calculate.",
    naissance: "Date of birth",
    reference: "Age on",
    aujourdhui: "Today",
    conv29: "Birthday in non-leap years",
    convMois: "When that day does not exist in a month",
    convention: "Convention",
    c1mars: "1 March",
    c1suivant: "The 1st after",
    c28: "28 February",
    cDernier: "The last day",
    ageExact: "Exact age",
    valeurAge: (a: string, m: string, j: string) => `${a}, ${m} and ${j}`,
    enMois: "In months",
    enSemaines: "In weeks",
    enJours: "In days",
    heures: "Hours (approx.)",
    ne: "You were born on a",
    le: ",",
    cestAujourdhui: "Today is your birthday:",
    prochain: "Next birthday:",
    dans: ", in",
    pourVos: (x: string) => `, when you turn ${x}.`,
    enSem: (s: string, j: string) => `In weeks: ${s} and ${j}.`,
    formule: (b: string, r: string, mt: string, a: string, m: string, j: string, jt: string) =>
      `From ${b} to ${r}: ${mt} elapsed in full (that is ${a} and ${m}), then ${j}; total gap between the two dates: ${jt}.`,
    attente: "Enter a date of birth to see the exact age.",
  },
};

const CalculateurAge = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const loc = locale(lang);
  const n = (x: number) => x.toLocaleString(loc);
  const [naissance, setNaissance] = useState("1990-06-15");
  const [reference, setReference] = useState("2026-10-27");
  const [conv, setConv] = useState<Convention29>("1mars");
  useEffect(() => setReference(aujourdhui()), []);

  const msg: string[] = [];
  const b = lireDate(naissance);
  const r = lireDate(reference);
  if (b === null) msg.push(t.naissInc);
  if (r === null) msg.push(t.refInc);
  const horsCalendrier = (x: number | null) => x !== null && (decompose(x).a < 1600 || decompose(x).a > 2999);
  if (horsCalendrier(b) || horsCalendrier(r)) msg.push(t.horsCal);
  const avant = b !== null && r !== null && b > r;
  if (avant) msg.push(t.avant);
  const ok = b !== null && r !== null && !avant && !horsCalendrier(b) && !horsCalendrier(r);
  const a = ok ? age(b, r, conv) : null;
  const jourNaissance = b !== null ? decompose(b).j : 0;
  const date29 = b !== null && decompose(b).m === 2 && jourNaissance === 29;
  const blanc = "text-white";

  const outil = (
    <div id="age" className="min-w-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <ChampDate label={t.naissance} value={naissance} onChange={setNaissance} id="naissance" />
            <div className="min-w-0">
              <ChampDate label={t.reference} value={reference} onChange={setReference} id="reference" />
              <button type="button" onClick={() => setReference(aujourdhui())} className="mt-1 py-2 text-sm text-sky-300 underline underline-offset-4">
                {t.aujourdhui}
              </button>
            </div>
          </div>
          {jourNaissance >= 29 && (
            <div className="mt-3">
              <p className="text-sm text-neutral-300 mb-1">{date29 ? t.conv29 : t.convMois}</p>
              <Bascule
                libelle={t.convention}
                options={[
                  { v: "1mars" as const, l: date29 ? t.c1mars : t.c1suivant },
                  { v: "28fevrier" as const, l: date29 ? t.c28 : t.cDernier },
                ]}
                valeur={conv}
                onChange={setConv}
              />
            </div>
          )}
        </div>
        <div className="min-w-0" data-resultat>
          <Resultat libelle={t.ageExact} valeur={a ? t.valeurAge(t.pl(a.annees, t.an), t.pl(a.mois, t.mois), t.pl(a.jours, t.jour)) : "–"} id="res-age" />
          {a && b !== null ? (
            <ul className="mt-3 space-y-1 text-neutral-300">
              <li>
                {t.ne} <strong className={blanc}>{nomJour(decompose(b).js, lang)}</strong>
                {t.le} {dateLongue(b, false, lang)}.
              </li>
              <li id="res-anniversaire">
                {a.dansJours === 0 ? (
                  <>
                    {t.cestAujourdhui} <strong className={blanc}>{t.pl(a.ageAuProchain, t.an)}</strong>.
                  </>
                ) : (
                  <>
                    {t.prochain} <strong className={blanc}>{dateLongue(a.prochainAnniversaire, true, lang)}</strong>
                    {t.dans} <strong className={blanc}>{t.pl(a.dansJours, t.jour)}</strong>
                    {t.pourVos(t.pl(a.ageAuProchain, t.an))}
                  </>
                )}
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">{t.attente}</p>
          )}
        </div>
      </div>
      {a && b !== null && r !== null && (
        <>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Resultat libelle={t.enMois} valeur={n(a.moisTotal)} />
            <Resultat libelle={t.enSemaines} valeur={n(a.semaines)} />
            <Resultat libelle={t.enJours} valeur={n(a.joursTotal)} id="res-jours-total" />
            <Resultat libelle={t.heures} valeur={n(a.joursTotal * 24)} />
          </div>
          <p className="mt-3 text-sm text-neutral-300">{t.enSem(t.pl(a.semaines, t.semaine), t.pl(a.joursTotal % 7, t.jour))}</p>
          <Formule>
            {t.formule(
              dateLongue(b, false, lang),
              dateLongue(r, false, lang),
              t.pl(a.moisTotal, t.mois),
              t.pl(a.annees, t.an),
              t.pl(a.mois, t.mois),
              t.pl(a.jours, t.jour),
              t.pl(a.joursTotal, t.jour)
            )}
          </Formule>
        </>
      )}
      <Alertes messages={msg} />
    </div>
  );

  return (
    <PageOutil id="calculateur-age" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

/** Exemples au 27 octobre 2026, calculés par le même moteur que l'outil. */
const exemples = (lang: Langue) => {
  const t = T[lang];
  const ref = jour(2026, 10, 27);
  return [jour(1990, 6, 15), jour(2000, 1, 1), jour(2000, 2, 29), jour(2016, 10, 27)].map((b) => {
    const a = age(b, ref);
    return [dateLongue(b, false, lang), t.valeurAge(t.pl(a.annees, t.an), t.pl(a.mois, t.mois), t.pl(a.jours, t.jour)), a.joursTotal.toLocaleString(locale(lang))];
  });
};

const ContenuFr = () => (
  <>
    <Section titre="Calculer son âge exact en années, mois et jours">
      <p>
        Pour calculer un âge exact, comptez les mois entiers écoulés depuis la date de naissance, de date à date,
        regroupez-les par douze pour obtenir les années, puis ajoutez les jours restants jusqu'à la date du jour. Avec le
        calculateur d'âge, saisissez seulement la date de naissance : la date de référence se règle sur aujourd'hui, et
        l'âge s'affiche en années, mois et jours, puis au total en mois, en semaines et en jours, avec le jour de la
        semaine de la naissance et le compte à rebours jusqu'au prochain anniversaire. Une personne née le 15 juin 1990 a
        36 ans, 4 mois et 12 jours le 27 octobre 2026, soit 13 283 jours, et fêtera ses 37 ans 231 jours plus tard. La
        limite : l'outil compte en jours du calendrier et ignore l'heure de naissance, si bien que le nombre d'heures
        vécues n'est qu'un ordre de grandeur.
      </p>
    </Section>

    <Section titre="Comment l'âge exact est calculé">
      <p>
        L'outil compte d'abord les <strong>mois entiers</strong> écoulés, de date à date : né le 15 juin 1990, vous
        gagnez un mois chaque 15 du mois. Il regroupe ces mois par douze pour donner les années, puis compte les jours
        restants jusqu'à la date de référence. Le total en jours est une simple soustraction entre deux dates du
        calendrier, qui tient compte des années bissextiles. Les dates sont traitées sans heure, si bien que le
        changement d'heure de mars et d'octobre ne fausse aucun compte.
      </p>
      <Tableau entetes={["Naissance", "Âge au 27 octobre 2026", "Jours vécus"]} minW="26rem" lignes={exemples("fr")} />
    </Section>

    <Section titre="Né un 29 février : le cas particulier">
      <p>
        Le 29 février n'existe que les années bissextiles : celles divisibles par 4, sauf les années séculaires non
        divisibles par 400 (2000 était bissextile, 2100 ne le sera pas). Les trois autres années sur quatre, deux usages
        existent : le <strong>28 février</strong>, dernier jour du mois de naissance, ou le <strong>1er mars</strong>.
        Avec « 1er mars », une personne née le 29 février 2000 a 26 ans, 11 mois et 30 jours le 28 février 2027, puis 27
        ans le 1er mars ; avec « 28 février », elle a 27 ans dès le 28 février. Pour les délais exprimés en mois, le Code
        de procédure civile retient la seconde logique : à défaut de quantième identique, le délai expire le dernier jour
        du mois. Si un règlement doit trancher, c'est son texte qui s'applique.
      </p>
    </Section>

    <Section titre="À quoi sert un âge exact">
      <p>
        Un formulaire demande parfois l'âge à une date donnée : au 31 décembre de l'année d'un concours, au jour d'une
        inscription, à la date d'un départ. Changez la date de référence pour l'obtenir. Pour mesurer une durée entre deux
        dates quelconques, avec les jours ouvrés et les jours fériés, utilisez la page{" "}
        <Link to="/nombre-de-jours-entre-deux-dates/">nombre de jours entre deux dates</Link> ; pour suivre en continu les
        jours restants avant un anniversaire, le <Link to="/compte-a-rebours/">compte à rebours</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="How to calculate your exact age in years, months and days">
      <p>
        To calculate an exact age, count the whole months since the date of birth, date to date, group them by twelve to
        get the years, then add the days left until today. With this age calculator you only enter the date of birth:
        the reference date is set to today, and the age appears in years, months and days, then as a total in months,
        weeks and days, with the weekday you were born on and the countdown to your next birthday. Someone born on 15
        June 1990 is 36 years, 4 months and 12 days old on 27 October 2026, which is 13,283 days, and turns 37 in 231
        days. French forms ask for your date of birth as dd/mm/yyyy, the same order as in the UK. The main limit: the
        calculator counts calendar days and ignores the time of birth, so the hours lived are only an estimate.
      </p>
    </Section>

    <Section titre="How the calculator counts">
      <p>
        It first counts the <strong>whole months</strong> elapsed, date to date: born on 15 June 1990, you gain a month
        on the 15th of each month. Twelve months make a year, and the remaining days run to the reference date. The total
        in days is a plain subtraction between two calendar dates, leap years included. Dates have no time attached, so
        the switch to and from summer time in March and October never shifts a result.
      </p>
      <Tableau entetes={["Date of birth", "Age on 27 October 2026", "Days lived"]} minW="26rem" lignes={exemples("en")} />
    </Section>

    <Section titre="Born on 29 February, and age rules in France">
      <p>
        29 February only exists in leap years: years divisible by 4, except century years not divisible by 400 (2000
        was a leap year, 2100 will not be). In the other years you can count the birthday on <strong>28 February</strong>{" "}
        or on <strong>1 March</strong>; the calculator lets you choose. French procedural law counts periods in months the
        second way: when the same date does not exist, the period ends on the last day of the month.
      </p>
      <p>
        In France you become an adult (majeur) on your 18th birthday, under article 414 of the Code civil. Many French
        procedures set an age on a given date, such as 31 December of the year of an exam or the date an application is
        filed: change the reference date to get it. To measure any period with French working days and public holidays,
        use the <Link to="/en/days-between-dates/">days between dates calculator</Link>; to watch the days to a birthday
        tick down, use the <Link to="/en/countdown/">countdown</Link>.
      </p>
    </Section>
  </>
);

export default CalculateurAge;
