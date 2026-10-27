import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampDate, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { Convention29, JOURS_SEMAINE, age, dateLongue, decompose, lireDate } from "@/lib/calculs-dates";

const n = (x: number) => x.toLocaleString("fr-FR");
const pl = (x: number, mot: string, motPl = mot + "s") => `${n(x)} ${Math.abs(x) >= 2 ? motPl : mot}`;
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FAQ: QuestionFaq[] = [
  {
    q: "Je suis né un 29 février, quel jour ai-je un an de plus les autres années ?",
    r: "Les années non bissextiles, le 29 février n'existe pas et deux usages coexistent : fêter son anniversaire le 28 février, ou le 1er mars, lendemain du 28 février. L'outil propose les deux réglages quand la date de naissance est un 29 février (ou un 29, 30 ou 31 pour le décompte des mois). Par défaut, l'âge change le 1er mars. Les années bissextiles, comme 2028, l'anniversaire tombe bien le 29 février.",
  },
  {
    q: "Je veux mon âge à une date précise, pas aujourd'hui, c'est possible ?",
    r: "Oui. Remplacez la date de référence, réglée sur aujourd'hui à l'ouverture de la page, par la date voulue : la date d'un examen, d'un concours, d'une inscription, ou le 31 décembre de l'année si un règlement fixe l'âge à cette date. Tous les résultats, y compris le prochain anniversaire, sont recalculés à partir de cette date de référence.",
  },
  {
    q: "Le nombre d'heures vécues est-il exact ?",
    r: "Non, c'est un ordre de grandeur : le nombre de jours multiplié par 24. L'outil ne connaît ni l'heure de votre naissance ni le fuseau horaire, et ne tient pas compte des changements d'heure. L'écart avec le vrai nombre d'heures reste inférieur à une journée. Les années, mois, semaines et jours, eux, sont des comptes exacts de jours du calendrier.",
  },
  {
    q: "Pourquoi l'âge en mois et jours change-t-il selon le mois ?",
    r: "Parce que les mois n'ont pas tous la même longueur. L'outil compte d'abord les mois entiers écoulés depuis votre date de naissance, de date à date (du 15 au 15), puis les jours restants. Né un 31 janvier, vous avez un mois de plus le 1er mars d'une année non bissextile, faute de 31 février, ou le 28 février si vous choisissez le réglage « dernier jour du mois ».",
  },
];

const CalculateurAge = () => {
  const [naissance, setNaissance] = useState("1990-06-15");
  const [reference, setReference] = useState("2026-10-27");
  const [conv, setConv] = useState<Convention29>("1mars");
  useEffect(() => setReference(aujourdhui()), []);

  const msg: string[] = [];
  const b = lireDate(naissance);
  const r = lireDate(reference);
  if (b === null) msg.push("Date de naissance incomplète ou inexistante.");
  if (r === null) msg.push("Date de référence incomplète ou inexistante.");
  const horsCalendrier = (x: number | null) => x !== null && (decompose(x).a < 1600 || decompose(x).a > 2999);
  if (horsCalendrier(b) || horsCalendrier(r)) msg.push("Les dates doivent être comprises entre 1600 et 2999.");
  const avant = b !== null && r !== null && b > r;
  if (avant) msg.push("La date de naissance est postérieure à la date de référence : aucun âge à calculer.");
  const ok = b !== null && r !== null && !avant && !horsCalendrier(b) && !horsCalendrier(r);
  const a = ok ? age(b, r, conv) : null;
  const jourNaissance = b !== null ? decompose(b).j : 0;
  const date29 = b !== null && decompose(b).m === 2 && jourNaissance === 29;

  return (
    <PageOutil
      href="/calculateur-age/"
      titre="Âge exact : calculez votre âge en années, mois et jours"
      description="Âge exact gratuit : votre âge en années, mois et jours depuis la date de naissance, total en semaines et en jours, jour de naissance et prochain anniversaire."
      motsCles="calculateur d'âge, calculer son âge exact, quel âge ai-je, âge en jours, âge en mois, prochain anniversaire"
      nomAppli="Calculateur d'âge exact"
      h1="Calculateur d'âge exact"
      chapeau="Saisissez votre date de naissance : l'âge s'affiche en années, mois et jours, puis en mois, semaines et jours au total, avec le jour de la semaine de votre naissance et le compte des jours avant le prochain anniversaire."
      faq={FAQ}
    >
      <BlocCalcul titre="Votre âge" id="age">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <ChampDate label="Date de naissance" value={naissance} onChange={setNaissance} id="naissance" />
          <div className="min-w-0">
            <ChampDate label="Âge à la date du" value={reference} onChange={setReference} id="reference" />
            <button type="button" onClick={() => setReference(aujourdhui())} className="mt-1 py-2 text-sm text-sky-300 underline underline-offset-4">
              Aujourd'hui
            </button>
          </div>
        </div>
        {jourNaissance >= 29 && (
          <div className="mt-4">
            <p className="text-sm text-neutral-300 mb-1">
              {date29 ? "Anniversaire les années non bissextiles" : "Quand ce jour n'existe pas dans un mois"}
            </p>
            <Bascule
              libelle="Convention"
              options={[
                { v: "1mars" as const, l: date29 ? "Le 1er mars" : "Le 1er suivant" },
                { v: "28fevrier" as const, l: date29 ? "Le 28 février" : "Le dernier jour" },
              ]}
              valeur={conv}
              onChange={setConv}
            />
          </div>
        )}

        <div className="mt-5">
          <Resultat
            libelle="Âge exact"
            valeur={a ? `${pl(a.annees, "an")}, ${n(a.mois)} mois et ${pl(a.jours, "jour")}` : "–"}
            id="res-age"
          />
        </div>
        {a && b !== null && r !== null && (
          <>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Resultat libelle="En mois" valeur={n(a.moisTotal)} />
              <Resultat libelle="En semaines" valeur={n(a.semaines)} />
              <Resultat libelle="En jours" valeur={n(a.joursTotal)} id="res-jours-total" />
              <Resultat libelle="Heures (environ)" valeur={n(a.joursTotal * 24)} />
            </div>
            <ul className="mt-5 space-y-2 text-neutral-300">
              <li>
                Vous êtes né(e) un <strong className="text-white">{JOURS_SEMAINE[decompose(b).js]}</strong>, le {dateLongue(b, false)}.
              </li>
              <li id="res-anniversaire">
                {a.dansJours === 0 ? (
                  <>
                    C'est aujourd'hui votre anniversaire : <strong className="text-white">{pl(a.ageAuProchain, "an")}</strong>.
                  </>
                ) : (
                  <>
                    Prochain anniversaire : <strong className="text-white">{dateLongue(a.prochainAnniversaire)}</strong>, dans{" "}
                    <strong className="text-white">{pl(a.dansJours, "jour")}</strong>, pour vos {pl(a.ageAuProchain, "an")}.
                  </>
                )}
              </li>
              <li>
                En semaines : {pl(a.semaines, "semaine")} et {pl(a.joursTotal % 7, "jour")}.
              </li>
            </ul>
            <Formule>
              Du {dateLongue(b, false)} au {dateLongue(r, false)} : {pl(a.moisTotal, "mois", "mois")} entiers (soit {pl(a.annees, "an")} et {n(a.mois)} mois),
              puis {pl(a.jours, "jour")} ; écart total entre les deux dates : {pl(a.joursTotal, "jour")}.
            </Formule>
          </>
        )}
        <Alertes messages={msg} />
      </BlocCalcul>

      <Section titre="Comment l'âge exact est calculé">
        <p>
          L'outil compte d'abord les <strong>mois entiers</strong> écoulés, de date à date : né le 15 juin 1990, vous
          gagnez un mois chaque 15 du mois. Il regroupe ces mois par douze pour donner les années, puis compte les
          jours restants jusqu'à la date de référence. C'est la façon dont on dit son âge dans la vie courante : « 36
          ans, 4 mois et 12 jours » au 27 octobre 2026 pour une naissance le 15 juin 1990.
        </p>
        <p>
          Le total en jours est une simple soustraction entre deux dates du calendrier, qui tient compte des années
          bissextiles (366 jours). Il est exact au jour près ; les semaines en découlent par division par 7. Les
          dates sont traitées sans heure, si bien que le changement d'heure de mars et d'octobre ne fausse aucun
          compte. Le premier affichage montre un exemple ; la date de référence passe ensuite à la date du jour de
          votre appareil.
        </p>
        <Tableau
          entetes={["Naissance", "Âge au 27 octobre 2026", "Jours vécus"]}
          minW="26rem"
          lignes={[
            ["15 juin 1990", "36 ans, 4 mois et 12 jours", "13 283"],
            ["1er janvier 2000", "26 ans, 9 mois et 26 jours", "9 796"],
            ["29 février 2000", "26 ans, 7 mois et 28 jours", "9 737"],
            ["27 octobre 2016", "10 ans, 0 mois et 0 jour", "3 652"],
          ]}
        />
      </Section>

      <Section titre="Né un 29 février : le cas particulier">
        <p>
          Le 29 février n'existe que les années bissextiles : celles divisibles par 4, sauf les années séculaires non
          divisibles par 400 (2000 était bissextile, 2100 ne le sera pas). Les trois autres années sur quatre, il faut
          choisir un jour pour l'anniversaire. Deux usages existent : le <strong>28 février</strong>, dernier jour du
          mois de naissance, ou le <strong>1er mars</strong>, premier jour où la date du 29 février est dépassée.
        </p>
        <p>
          Quand la date de naissance est un 29 février, l'outil affiche les deux réglages. Avec « 1er mars », une
          personne née le 29 février 2000 a 26 ans, 11 mois et 30 jours le 28 février 2027, puis 27 ans le 1er mars ;
          avec « 28 février », elle a 27 ans dès le 28 février. Le même réglage s'applique au décompte des mois pour
          les naissances un 29, 30 ou 31 : le mois suivant, quand ce jour manque, le mois entier est atteint le
          dernier jour du mois ou le 1er du mois suivant. Si un document officiel ou un règlement doit trancher, c'est
          son texte qui s'applique.
        </p>
      </Section>

      <Section titre="À quoi sert un âge exact">
        <p>
          Un formulaire demande parfois l'âge à une date donnée : au 31 décembre de l'année d'un concours, au jour
          d'une inscription, à la date d'un départ en voyage. Changez la date de référence pour l'obtenir. Pour un
          enfant, l'âge en mois reste la mesure usuelle jusqu'à deux ou trois ans ; l'outil le donne directement.
        </p>
        <p>
          Le compte des jours avant l'anniversaire aide à préparer une fête ou une surprise ; pour suivre ce délai en
          continu, le <Link to="/compte-a-rebours/">compte à rebours</Link> affiche les jours, heures et minutes
          restants. Pour mesurer une durée entre deux dates quelconques, avec les jours ouvrés et les jours fériés,
          utilisez la page <Link to="/nombre-de-jours-entre-deux-dates/">nombre de jours entre deux dates</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CalculateurAge;
