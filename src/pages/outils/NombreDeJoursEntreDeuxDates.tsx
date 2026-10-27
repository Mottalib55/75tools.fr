import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, Case, ChampDate, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { fmt, lireNombre } from "@/lib/calculs-nombres";
import {
  TypeJour,
  ajouterJours,
  compterJours,
  dateLongue,
  decompose,
  ecartAnneesMoisJours,
  feriesEntre,
  joursFeries,
  lireDate,
  paques,
  versIso,
} from "@/lib/calculs-dates";

const LU = "27 octobre 2026";
const pluriel = (n: number, mot: string) => `${n.toLocaleString("fr-FR")} ${mot}${Math.abs(n) >= 2 ? "s" : ""}`;
const aujourdhui = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FAQ: QuestionFaq[] = [
  {
    q: "Du 1er au 31 mai, ça fait 30 ou 31 jours ?",
    r: "Les deux réponses existent, selon ce qu'on compte. L'écart entre les deux dates est de 30 jours : c'est ce que donne une soustraction, comme pour une durée entre deux rendez-vous. Si le 31 mai est lui-même un jour compté (location, congé, séjour à l'hôtel jour par jour), la période dure 31 jours. Cochez « Compter aussi le jour de fin » pour obtenir le second résultat : la case modifie aussi le décompte des jours ouvrés.",
  },
  {
    q: "Je travaille en Alsace ou en Moselle, quels jours fériés s'ajoutent ?",
    r: "Le Vendredi saint, deux jours avant Pâques, et le 26 décembre, lendemain de Noël. Service-public.fr précise que le Vendredi saint n'est férié que dans les communes ayant un temple protestant ou une église mixte. Cochez la case Alsace-Moselle : les deux jours sont retirés des jours ouvrés et ouvrables et apparaissent dans la liste des fériés de la période.",
  },
  {
    q: "Un jour férié qui tombe un samedi compte-t-il dans les jours ouvrables ?",
    r: "Il est retiré du décompte des jours ouvrables, puisqu'un jour férié n'est pas un jour ouvrable dans le calcul de l'outil. En jours ouvrés, il ne change rien : le samedi n'en fait déjà pas partie. Le 15 août 2026, par exemple, tombe un samedi : il fait perdre un jour ouvrable au mois d'août, mais aucun jour ouvré. La liste des fériés de la période indique le jour de la semaine de chacun.",
  },
  {
    q: "Pourquoi l'année 2026 compte-t-elle 252 jours ouvrés ?",
    r: "L'année 2026 compte 261 jours du lundi au vendredi. Sur les onze jours fériés, neuf tombent en semaine (le 15 août est un samedi, la Toussaint un dimanche) : 261 − 9 = 252 jours ouvrés. Le nombre change chaque année avec la position des fériés dans la semaine. Saisissez le 1er janvier et le 31 décembre, case « jour de fin » cochée, pour obtenir le total d'une autre année.",
  },
];

/** Écart entre deux dates. */
const BlocEcart = () => {
  const [debut, setDebut] = useState("2026-05-01");
  const [fin, setFin] = useState("2026-05-31");
  const [inclure, setInclure] = useState(false);
  const [alsace, setAlsace] = useState(false);
  const msg: string[] = [];
  let d1 = lireDate(debut), d2 = lireDate(fin);
  if (d1 === null) msg.push("Date de début incomplète ou inexistante.");
  if (d2 === null) msg.push("Date de fin incomplète ou inexistante.");
  if (d1 !== null && d2 !== null && d2 < d1) {
    msg.push("La date de fin précède la date de début : les deux dates ont été inversées pour le calcul.");
    [d1, d2] = [d2, d1];
  }
  const ok = d1 !== null && d2 !== null;
  const nb = ok ? d2 - d1 + (inclure ? 1 : 0) : 0;
  // période comptée (bornes incluses) pour les jours ouvrés
  const derniers = ok ? (inclure ? d2 : d2 - 1) : 0;
  const trop = ok && nb > 366 * 200;
  if (trop) msg.push("Période de plus de 200 ans : les jours ouvrés et les fériés ne sont pas détaillés.");
  const c = ok && !trop && derniers >= d1 ? compterJours(d1, derniers, alsace) : null;
  const feries = ok && !trop && derniers >= d1 ? feriesEntre(d1, derniers, alsace) : [];
  const ecart = ok ? ecartAnneesMoisJours(d1, d2 + (inclure ? 1 : 0)) : null;
  return (
    <BlocCalcul titre="Nombre de jours entre deux dates" id="ecart">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="min-w-0">
          <ChampDate label="Date de début" value={debut} onChange={setDebut} id="debut" />
          <button type="button" onClick={() => setDebut(aujourdhui())} className="mt-1 py-2 text-sm text-sky-300 underline underline-offset-4">
            Aujourd'hui
          </button>
        </div>
        <div className="min-w-0">
          <ChampDate label="Date de fin" value={fin} onChange={setFin} id="fin" />
          <button type="button" onClick={() => setFin(aujourdhui())} className="mt-1 py-2 text-sm text-sky-300 underline underline-offset-4">
            Aujourd'hui
          </button>
        </div>
      </div>
      <div className="mt-2">
        <Case checked={inclure} onChange={setInclure}>
          Compter aussi le jour de fin (période du premier au dernier jour inclus)
        </Case>
        <Case checked={alsace} onChange={setAlsace}>
          Alsace-Moselle : ajouter le Vendredi saint et le 26 décembre
        </Case>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Resultat libelle="Jours calendaires" valeur={ok ? nb.toLocaleString("fr-FR") : "–"} id="res-jours" />
        <Resultat libelle="Jours ouvrés" valeur={c ? c.ouvres.toLocaleString("fr-FR") : ok && !trop ? "0" : "–"} id="res-ouvres" />
        <Resultat libelle="Jours ouvrables" valeur={c ? c.ouvrables.toLocaleString("fr-FR") : ok && !trop ? "0" : "–"} id="res-ouvrables" />
      </div>
      {ok && ecart && (
        <ul className="mt-4 space-y-1 text-sm text-neutral-300 tabular-nums">
          <li>
            Soit {pluriel(Math.floor(nb / 7), "semaine")} et {pluriel(nb % 7, "jour")}
          </li>
          <li>
            Soit {ecart.moisTotal.toLocaleString("fr-FR")} mois et {pluriel(ecart.jours, "jour")}
            {ecart.annees > 0 && (
              <>
                , ou {pluriel(ecart.annees, "an")}, {ecart.mois} mois et {pluriel(ecart.jours, "jour")}
              </>
            )}
          </li>
          <li>Soit environ {fmt(nb / 365.25, 2)} années de 365,25 jours</li>
          {c && (
            <li>
              Dont {pluriel(c.samedis, "samedi")}, {pluriel(c.dimanches, "dimanche")} et {pluriel(feries.length, "jour")} férié
              {feries.length >= 2 ? "s" : ""}
            </li>
          )}
        </ul>
      )}
      {ok && (
        <Formule>
          {versIso(d2).split("-").reverse().join("/")} − {versIso(d1).split("-").reverse().join("/")} = {d2 - d1} jour{d2 - d1 >= 2 ? "s" : ""}
          {inclure ? " + 1 (jour de fin compté) = " + nb : ""}.{" "}
          {derniers >= d1
            ? `Période comptée pour les jours ouvrés : du ${dateLongue(d1)} au ${dateLongue(derniers)} inclus.`
            : "Période vide : aucun jour ouvré."}
        </Formule>
      )}
      {feries.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-400 mb-2">Jours fériés dans la période</p>
          <ul className="text-sm space-y-1" id="liste-feries">
            {feries.slice(0, 60).map((f) => {
              const js = decompose(f.n).js;
              return (
                <li key={f.n} className="flex flex-wrap gap-x-2">
                  <span className="text-neutral-100">{dateLongue(f.n)}</span>
                  <span className="text-neutral-400">{f.nom}</span>
                  {(js === 0 || js === 6) && <span className="text-neutral-500">(week-end)</span>}
                </li>
              );
            })}
          </ul>
          {feries.length > 60 && <p className="text-xs text-neutral-500 mt-1">Liste limitée aux 60 premiers jours fériés.</p>}
        </div>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Date + N jours. */
const BlocAjout = () => {
  const [depart, setDepart] = useState("2026-04-30");
  const [n, setN] = useState("5");
  const [type, setType] = useState<TypeJour>("ouvre");
  const [alsace, setAlsace] = useState(false);
  useEffect(() => setDepart(aujourdhui()), []);
  const msg: string[] = [];
  const d = lireDate(depart);
  if (d === null) msg.push("Date de départ incomplète ou inexistante.");
  let k = lireNombre(n);
  if (n.trim() === "") msg.push("Saisissez un nombre de jours.");
  else if (k === null) msg.push("Le nombre de jours n'est pas un nombre.");
  else {
    if (!Number.isInteger(k)) {
      msg.push(`Nombre de jours arrondi à l'entier : ${Math.round(k)}.`);
      k = Math.round(k);
    }
    if (Math.abs(k) > 36500) {
      msg.push("Nombre de jours ramené à 36 500 (environ cent ans).");
      k = Math.sign(k) * 36500;
    }
  }
  const r = d !== null && k !== null ? ajouterJours(d, k, type, alsace) : null;
  const borne = r !== null && (decompose(r).a < 1600 || decompose(r).a > 2999);
  if (borne) msg.push("La date obtenue sort du calendrier pris en charge (1600 à 2999).");
  const mot = type === "calendaire" ? "jour calendaire" : type === "ouvre" ? "jour ouvré" : "jour ouvrable";
  return (
    <BlocCalcul titre="Date après (ou avant) N jours" id="ajout">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChampDate label="Date de départ" value={depart} onChange={setDepart} id="depart" />
        <ChampNombre label="Nombre de jours (négatif pour reculer)" value={n} onChange={setN} id="nb-jours" />
      </div>
      <div className="mt-3">
        <Bascule
          libelle="Type de jours"
          options={[
            { v: "calendaire" as const, l: "Calendaires" },
            { v: "ouvre" as const, l: "Ouvrés" },
            { v: "ouvrable" as const, l: "Ouvrables" },
          ]}
          valeur={type}
          onChange={setType}
        />
        {type !== "calendaire" && (
          <Case checked={alsace} onChange={setAlsace}>
            Alsace-Moselle
          </Case>
        )}
      </div>
      <div className="mt-4">
        <Resultat libelle="Date obtenue" valeur={r !== null && !borne ? dateLongue(r) : "–"} id="res-date" />
      </div>
      {r !== null && d !== null && k !== null && !borne && (
        <Formule>
          {dateLongue(d)} {k >= 0 ? "+" : "−"} {pluriel(Math.abs(k), mot)} = {dateLongue(r)}
          {type !== "calendaire" && " (le jour de départ n'est pas compté ; seuls les jours " + (type === "ouvre" ? "du lundi au vendredi" : "du lundi au samedi") + " non fériés avancent le compte)"}
          , soit {pluriel(Math.abs(r - d), "jour")} calendaire{Math.abs(r - d) >= 2 ? "s" : ""}.
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const FERIES_2026_2027 = [2026, 2027].map((a) => joursFeries(a));

const NombreDeJoursEntreDeuxDates = () => (
  <PageOutil
    href="/nombre-de-jours-entre-deux-dates/"
    titre="Nombre de jours entre deux dates : calcul gratuit en ligne"
    description="Nombre de jours entre deux dates : jours calendaires, ouvrés et ouvrables avec les jours fériés français, durée en semaines et en mois, et date après N jours."
    motsCles="nombre de jours entre deux dates, calculer le nombre de jours entre deux dates, combien de jours entre deux dates, jours ouvrés, jours ouvrables"
    nomAppli="Nombre de jours entre deux dates"
    h1="Nombre de jours entre deux dates"
    chapeau="Choisissez deux dates : le nombre de jours calendaires, de jours ouvrés et de jours ouvrables s'affiche, avec les jours fériés de la période. Le second outil donne la date obtenue après un nombre de jours, calendaires ou ouvrés."
    faq={FAQ}
    sources={[
      { editeur: "Service-public.fr", titre: "Jours fériés et ponts dans le secteur privé", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2405", lu: LU },
    ]}
  >
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
      <BlocEcart />
      <BlocAjout />
    </div>

    <Section titre="Calendaires, ouvrés, ouvrables : ce que compte l'outil">
      <p>
        Les <strong>jours calendaires</strong> sont tous les jours du calendrier, week-ends et fériés compris. Par
        défaut, l'outil donne l'écart entre les deux dates : du 1er au 31 mai, 30 jours. Cochez « Compter aussi le
        jour de fin » pour compter les deux dates comme des jours entiers : 31 jours.
      </p>
      <p>
        Les <strong>jours ouvrés</strong> sont les jours du lundi au vendredi qui ne sont pas fériés. Les{" "}
        <strong>jours ouvrables</strong> vont du lundi au samedi, toujours hors jours fériés. Les deux décomptes
        portent sur la période affichée sous le résultat : du jour de début jusqu'à la veille de la date de fin, ou
        jusqu'à la date de fin incluse si la case est cochée. En mai 2026, du 1er au 31 inclus, on compte 17 jours
        ouvrés et 22 jours ouvrables, car quatre fériés (1er, 8, 14 et 25 mai) tombent en semaine.
      </p>
      <p>
        Le second outil avance jour par jour. En jours ouvrés, le jour de départ n'est pas compté et seuls les jours
        ouvrés font avancer le compteur : 5 jours ouvrés après le jeudi 30 avril 2026 mènent au lundi 11 mai, parce
        que les vendredis 1er et 8 mai sont fériés. Un nombre négatif recule dans le temps. Les délais légaux ou
        contractuels ont souvent leurs propres règles (jour de départ, report d'une échéance tombant un samedi) :
        vérifiez le texte qui les fixe.
      </p>
      <p>
        Les dates sont traitées en jours entiers, sans heure : le passage à l'heure d'été ou d'hiver, qui fait des
        journées de 23 ou 25 heures, ne décale aucun résultat. Pour compter des années, des mois et des jours depuis
        une naissance, la page <Link to="/calculateur-age/">âge exact</Link> est plus directe.
      </p>
    </Section>

    <Section titre="Les jours fériés pris en compte">
      <p>
        L'outil retient les onze jours fériés de France métropolitaine listés par service-public.fr, qui renvoie
        aux articles L3133-1 à L3133-3 du Code du travail : 1er janvier, lundi de Pâques, 1er mai, 8 mai, Ascension,
        lundi de Pentecôte, 14 juillet, 15 août, 1er novembre, 11 novembre et 25 décembre. En Alsace-Moselle
        s'ajoutent le Vendredi saint (dans les communes ayant un temple protestant ou une église mixte) et le 26
        décembre.
      </p>
      <p>
        Les fêtes mobiles dépendent de Pâques, calculé pour chaque année par l'algorithme de Meeus, Jones et Butcher
        (calendrier grégorien) : le lundi de Pâques suit le dimanche de Pâques, l'Ascension tombe 39 jours après, le
        lundi de Pentecôte 50 jours après, le Vendredi saint 2 jours avant. Les règles actuelles sont appliquées à
        toutes les années, y compris passées. Un jour férié n'est pas forcément chômé : seul le 1er mai l'est pour
        tous les salariés, les autres dépendent de l'accord collectif ou de l'employeur. Les départements et régions
        d'outre-mer ont en plus un jour férié de commémoration de l'abolition de l'esclavage, à une date propre à
        chacun, non pris en compte ici.
      </p>
      <Tableau
        entetes={["Jour férié", "2026", "2027"]}
        minW="26rem"
        lignes={FERIES_2026_2027[0].map((f, i) => [f.nom, dateLongue(f.n), dateLongue(FERIES_2026_2027[1][i].n)])}
      />
      <p className="text-sm text-neutral-500">
        Pâques tombe le {dateLongue(paques(2026), false)} en 2026 et le {dateLongue(paques(2027), false)} en 2027.
      </p>
    </Section>

    <Section titre="Exemples d'usage">
      <p>
        <strong>Poser des congés</strong> : saisissez le premier et le dernier jour d'absence, case « jour de fin »
        cochée. Le nombre de jours ouvrés correspond aux jours de semaine posés ; le nombre de jours ouvrables, au
        décompte du lundi au samedi qu'utilisent encore certaines entreprises.
      </p>
      <p>
        <strong>Suivre un délai</strong> : combien de jours reste-t-il avant une échéance ? Cliquez sur
        « Aujourd'hui » sous la date de début et saisissez l'échéance en date de fin. Pour un compte à rebours
        affiché en continu, utilisez le <Link to="/compte-a-rebours/">compte à rebours</Link>.
      </p>
      <p>
        <strong>Prévoir une livraison</strong> : un fournisseur annonce un délai de 10 jours ouvrés ; le second outil,
        réglé sur « Ouvrés », donne la date de livraison prévue en sautant week-ends et jours fériés.
      </p>
    </Section>
  </PageOutil>
);

export default NombreDeJoursEntreDeuxDates;
