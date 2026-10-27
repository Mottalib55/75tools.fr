import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Champ, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import {
  LettreFeuille,
  ActionsLettre,
  dateLongue,
  useDateDuJour,
  useTexteRetouchable,
} from "@/components/outils/LettreFeuille";
import {
  TYPES,
  TypeContrat,
  DonneesResiliation,
  infosType,
  corpsLettre,
  objetLettre,
} from "@/lib/lettre-resiliation";
import type { Langue } from "@/lib/langue";

const VIDE: DonneesResiliation = {
  type: "telecom",
  motif: "sans-engagement",
  prenomNom: "",
  adresse: "",
  codePostalVille: "",
  organisme: "",
  adresseOrganisme: "",
  codePostalVilleOrganisme: "",
  reference: "",
  ligne: "",
  precision: "",
  dateEvenement: "",
  dateEffet: "",
  lieu: "",
  date: "",
  recommande: true,
};

/** Champ complémentaire selon le contrat et le motif. */
const champPrecision = (type: TypeContrat, motif: string, lang: Langue) => {
  const en = lang === "en";
  if (type === "telecom" && motif === "legitime")
    return en
      ? { label: "Legitimate reason: the event in one or two sentences, in French", placeholder: "J'ai été licencié le 3 septembre 2026.", long: true }
      : { label: "Motif légitime : l'événement en une ou deux phrases", placeholder: "J'ai été licencié le 3 septembre 2026.", long: true };
  if (type === "telecom" && motif === "modification")
    return en
      ? { label: "Change you refuse (optional, in French)", placeholder: "hausse du prix mensuel annoncée le 15 septembre", long: false }
      : { label: "Modification refusée (facultatif)", placeholder: "hausse du prix mensuel annoncée le 15 septembre", long: false };
  if (type === "auto" && motif === "situation")
    return en
      ? { label: "Change of circumstances, in French", placeholder: "Je pars à la retraite.", long: true }
      : { label: "Changement de situation", placeholder: "Je pars à la retraite.", long: true };
  if (type === "abonnement" || type === "autre")
    return en
      ? { label: "What you are cancelling, in French", placeholder: "mon abonnement numérique au Journal de Lyon", long: false }
      : { label: "Ce que vous résiliez", placeholder: "mon abonnement numérique au Journal de Lyon", long: false };
  if (type === "energie")
    return en
      ? { label: "Address of the home concerned", placeholder: "4 rue Victor-Hugo, 69002 Lyon", long: false }
      : { label: "Adresse du logement concerné", placeholder: "4 rue Victor-Hugo, 69002 Lyon", long: false };
  return null;
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je dois envoyer ma lettre de résiliation en recommandé, ou un e-mail suffit ?",
      r: "Cela dépend du contrat. Pour une assurance, Service Public liste plusieurs moyens admis : lettre simple, envoi en ligne si le contrat a été souscrit ou peut l'être en ligne, déclaration au siège ou chez l'agent, ou tout moyen prévu au contrat. Le recommandé avec avis de réception reste conseillé pour une box ou une salle de sport, parce qu'il date la réception sans discussion.",
    },
    {
      q: "J'ai souscrit mon abonnement sur internet, je peux résilier sans lettre ?",
      r: "Oui. Un contrat qui peut être conclu en ligne doit aussi pouvoir être résilié en ligne, par une fonction « résilier votre contrat » visible et accessible sans créer d'espace personnel. Vous indiquez votre identité, la référence du contrat et la date souhaitée, vous vérifiez un récapitulatif, puis vous confirmez. Le professionnel doit accuser réception et vous indiquer la date de fin.",
    },
    {
      q: "Je change d'assurance auto avant l'échéance, je dois écrire à mon ancien assureur ?",
      r: "Non, si votre contrat a plus d'un an. Service Public précise que, pour une assurance auto, vous n'avez pas le droit d'envoyer vous-même la demande : c'est le nouvel assureur qui s'en charge, pour que le véhicule ne reste jamais sans assurance. La résiliation prend effet un mois après la réception par l'ancien assureur. Ce modèle sert en revanche pour l'échéance annuelle ou un changement de situation.",
    },
    {
      q: "Mon opérateur me réclame des frais alors que je pars pour un motif légitime, que faire ?",
      r: "Rappelez par écrit le motif et joignez le justificatif : licenciement, hospitalisation de longue durée, déménagement dans une zone non couverte, handicap ou maladie empêchant d'utiliser le service. Si l'opérateur maintient sa position, adressez une réclamation écrite à son service client, puis saisissez le médiateur des communications électroniques, gratuit, avant d'envisager le tribunal.",
    },
    {
      q: "Ma box a un engagement de 24 mois et je pars au bout de 8 mois : combien vais-je payer ?",
      r: "Selon Service Public, vous devez la totalité des mensualités jusqu'à la fin des 12 premiers mois, puis 25 % de celles qui restent au-delà. Avec un forfait à 30 € par mois, cela fait 4 × 30 = 120 €, plus 25 % de 12 × 30 €, soit 90 € : 210 € au total. Avec un engagement de 12 mois, tout le reste de la période est dû, sauf motif légitime.",
    },
    {
      q: "Ma salle de sport ne m'a pas prévenu avant de renouveler mon contrat, puis-je partir tout de suite ?",
      r: "Oui. L'article L215-1 du Code de la consommation, issu de la loi Chatel, oblige le professionnel à vous rappeler par écrit, entre trois mois et un mois avant la date limite, que vous pouvez refuser la reconduction. Sans ce rappel, vous pouvez résilier gratuitement à tout moment après la reconduction, et les sommes payées d'avance pour la suite doivent vous être remboursées sous trente jours.",
    },
  ],
  en: [
    {
      q: "Does my cancellation letter to a French company have to be in French?",
      r: "In practice, yes. Operators, insurers and gyms in France process letters in French, and a letter in English can be set aside or answered late. That is why this tool writes the letter in French while the form stays in English. Fill in names, numbers and dates; any free text you type (a reason, an event) is copied as is, so write those lines in simple French.",
    },
    {
      q: "What is a lettre recommandée avec accusé de réception, and do I need one?",
      r: "It is a registered letter with proof of delivery, sent from any La Poste office or online. The signed receipt proves the date the company received your letter, and that date starts the notice period. It is not always compulsory: an insurer must also accept an ordinary letter or an online request. It remains the safest choice for an internet box or a gym.",
    },
    {
      q: "I am leaving France: can I cancel my internet box before the end of a 24-month term?",
      r: "You can always cancel; the question is the fee. Service Public says that, without a legitimate reason, you pay every monthly fee up to month 12, then 25% of the fees left after that. Moving to an area the operator does not cover counts as a legitimate reason, so explain the move abroad in the letter, attach proof such as a new lease, and ask the operator to waive the fee.",
    },
    {
      q: "Can I cancel my French car insurance myself after the first year under the loi Hamon?",
      r: "Not yourself. The loi Hamon lets you cancel at any time after the first year, effective one month after receipt, but car insurance is compulsory: Service Public says the new insurer sends the cancellation to the old one so the car is never uninsured. Write your own letter only for the annual renewal date or a change of circumstances such as a move or retirement.",
    },
    {
      q: "Can I leave my French mutuelle in the middle of the year?",
      r: "Yes, once you have been covered for one year. This résiliation infra-annuelle (cancellation at any time after year one) applies to individual top-up health cover, and the mutuelle refunds the part of the premium paid for the period after the end date. A compulsory company scheme is different: you cannot cancel it with a letter, only through the exemptions your employer allows.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service Public", titre: "Téléphone, internet ou télévision : résiliation du contrat (vérifié le 8 juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22486", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Assurance auto (véhicule à moteur) : résiliation du contrat (vérifié le 1er juillet 2023)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2659", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Assurance habitation : résiliation du contrat (vérifié le 1er juillet 2023)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19083", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Couverture maladie complémentaire (mutuelle) (vérifié le 1er octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F20314", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Comment obtenir un contrat d'assurance emprunteur pour un crédit immobilier ?", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1671", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Peut-on résilier un contrat de prestation de services à tacite reconduction ?", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33991", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Comment choisir un fournisseur d'électricité ou de gaz ou en changer ?", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18116", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Code de la consommation, article L215-1 (information sur la reconduction tacite)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034072591", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Résiliation « en 3 clics » : application et étapes", url: "https://entreprendre.service-public.gouv.fr/actualites/A16599", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service Public", titre: "Téléphone, internet ou télévision : résiliation du contrat (phone, internet or TV: cancelling the contract)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22486", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Assurance auto : résiliation du contrat (cancelling car insurance)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2659", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Assurance habitation : résiliation du contrat (cancelling home insurance)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19083", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Couverture maladie complémentaire (mutuelle) (top-up health cover)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F20314", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Contrat d'assurance emprunteur pour un crédit immobilier (mortgage insurance)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1671", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Résilier un contrat de prestation de services à tacite reconduction (cancelling a contract that renews automatically)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33991", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Choisir un fournisseur d'électricité ou de gaz ou en changer (switching electricity or gas supplier)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18116", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Code de la consommation, article L215-1 (reminder before automatic renewal, loi Chatel)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034072591", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Résiliation « en 3 clics » (cancelling online in three clicks)", url: "https://entreprendre.service-public.gouv.fr/actualites/A16599", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues (la lettre produite reste en français). */
const T = {
  fr: {
    nomAppli: "Générateur de lettre de résiliation 75tools",
    motsCles: "lettre de résiliation, modèle lettre de résiliation, résilier un abonnement, lettre type résiliation, résiliation assurance, résiliation box",
    formulaire: "Votre contrat",
    type: "Type de contrat",
    motif: "Motif",
    voir: "Voir la lettre",
    dateAccord: "Date de l'accord de la banque",
    dateEvt: "Date de l'événement",
    vous: "Vous",
    nom: "Prénom et nom",
    adresse: "Adresse",
    cpVille: "Code postal et ville",
    ligne: "Numéro de ligne (facultatif)",
    destinataire: "Destinataire",
    organisme: "Organisme",
    organismeEx: "Service résiliation de…",
    envoi: "Envoi",
    dateEffet: "Date d'effet souhaitée (facultatif)",
    faitA: "Fait à",
    dateLettre: "Date de la lettre",
    recommande: "Mention « recommandée avec avis de réception »",
    francais: "",
    repliNom: "[Vos prénom et nom]",
    repliOrganisme: "[Organisme]",
    repliVille: "[ville]",
    repliDate: "[date]",
    signature: "Signature",
    libelleTexte: "Corps de la lettre de résiliation",
    nomDocument: "la lettre",
  },
  en: {
    nomAppli: "75tools French cancellation letter generator",
    motsCles: "cancellation letter france, french cancellation letter template, lettre de résiliation, cancel french contract, cancel subscription france",
    formulaire: "Your contract",
    type: "Type of contract",
    motif: "Reason",
    voir: "See the letter",
    dateAccord: "Date the bank approved the new policy",
    dateEvt: "Date of the event",
    vous: "You",
    nom: "First and last name",
    adresse: "Address",
    cpVille: "Postcode and town",
    ligne: "Phone line number (optional)",
    destinataire: "Recipient",
    organisme: "Company",
    organismeEx: "Service résiliation de…",
    envoi: "Sending",
    dateEffet: "Requested end date (optional)",
    faitA: "Written in (town)",
    dateLettre: "Date of the letter",
    recommande: "Add the line « Lettre recommandée avec avis de réception » (registered letter with proof of delivery)",
    francais: "The letter is written in French, as French companies expect. Type names, numbers and dates; any free text you add should be in French.",
    repliNom: "[Your full name]",
    repliOrganisme: "[Company]",
    repliVille: "[town]",
    repliDate: "[date]",
    signature: "Signature",
    libelleTexte: "Body of the cancellation letter (in French)",
    nomDocument: "the letter",
  },
};

const Gris = ({ v, repli }: { v: string; repli: string }) =>
  v.trim() ? <>{v.trim()}</> : <span className="text-neutral-400 print:text-neutral-500">{repli}</span>;

const LettreDeResiliation = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const en = lang === "en";
  const [d, setD] = useState<DonneesResiliation>(VIDE);
  const maj = <K extends keyof DonneesResiliation>(k: K) => (v: DonneesResiliation[K]) => setD((x) => ({ ...x, [k]: v }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));

  const infos = infosType(d.type);
  const precision = champPrecision(d.type, d.motif, lang);
  const genere = useMemo(() => corpsLettre(d, dateLongue, lang), [d, lang]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const objet = objetLettre(d);
  const lieuDate = `À ${d.lieu.trim() || t.repliVille}, le ${dateLongue(d.date) || t.repliDate}`;
  const libelleRef = en ? infos.en.libelleReference : infos.libelleReference;

  const texteComplet = [
    [d.prenomNom || t.repliNom, d.adresse, d.codePostalVille].filter((x) => x.trim()).join("\n"),
    [d.organisme || t.repliOrganisme, d.adresseOrganisme, d.codePostalVilleOrganisme].filter((x) => x.trim()).join("\n"),
    lieuDate,
    d.recommande ? "Lettre recommandée avec avis de réception" : "",
    `Objet : ${objet}`,
    texte,
    d.prenomNom || t.repliNom,
  ]
    .filter(Boolean)
    .join("\n\n");

  const changerType = (ty: TypeContrat) =>
    setD((x) => ({ ...x, type: ty, motif: infosType(ty).motifs[0].id, precision: "", dateEvenement: "" }));

  const outil = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
      <form className="space-y-4 min-w-0 print:hidden" onSubmit={(e) => e.preventDefault()} aria-label={t.formulaire}>
        <div className="grid gap-4">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.type}</span>
            <select className={classeSelect} value={d.type} onChange={(e) => changerType(e.target.value as TypeContrat)}>
              {TYPES.map((ty) => (
                <option key={ty.id} value={ty.id}>
                  {en ? ty.en.nom : ty.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.motif}</span>
            <select className={classeSelect} value={d.motif} onChange={(e) => maj("motif")(e.target.value)}>
              {infos.motifs.map((m) => (
                <option key={m.id} value={m.id}>
                  {en ? m.en : m.nom}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status" className="text-sm text-neutral-400 border-l-2 border-sky-400 pl-3 leading-relaxed">
          {en ? infos.en.repere : infos.repere}
        </p>
        {en && <p className="text-sm text-amber-200/90">{t.francais}</p>}
        <a href="#lettre-resiliation" className="lg:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
          {t.voir}
        </a>
        {precision &&
          (precision.long ? (
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">{precision.label}</span>
              <textarea
                rows={3}
                lang="fr"
                className={classeZoneTexte}
                value={d.precision}
                placeholder={precision.placeholder}
                onChange={(e) => maj("precision")(e.target.value)}
              />
            </label>
          ) : (
            <Champ label={precision.label} value={d.precision} onChange={maj("precision")} placeholder={precision.placeholder} />
          ))}
        {(d.type === "emprunteur" || (d.type === "auto" && d.motif === "situation")) && (
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">{d.type === "emprunteur" ? t.dateAccord : t.dateEvt}</span>
            <input type="date" className={classeChamp} value={d.dateEvenement} onChange={(e) => maj("dateEvenement")(e.target.value)} />
          </label>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
          <legend className="text-white font-medium mb-2">{t.vous}</legend>
          <Champ label={t.nom} value={d.prenomNom} onChange={maj("prenomNom")} autoComplete="name" />
          <Champ label={t.adresse} value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
          <Champ label={t.cpVille} value={d.codePostalVille} onChange={maj("codePostalVille")} placeholder="69003 Lyon" />
          <Champ label={libelleRef} value={d.reference} onChange={maj("reference")} />
          {d.type === "telecom" && <Champ label={t.ligne} value={d.ligne} onChange={maj("ligne")} placeholder="06 12 34 56 78" />}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
          <legend className="text-white font-medium mb-2">{t.destinataire}</legend>
          <Champ label={t.organisme} value={d.organisme} onChange={maj("organisme")} placeholder={t.organismeEx} />
          <Champ label={t.adresse} value={d.adresseOrganisme} onChange={maj("adresseOrganisme")} />
          <Champ label={t.cpVille} value={d.codePostalVilleOrganisme} onChange={maj("codePostalVilleOrganisme")} />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
          <legend className="text-white font-medium mb-2">{t.envoi}</legend>
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">{t.dateEffet}</span>
            <input type="date" className={classeChamp} value={d.dateEffet} onChange={(e) => maj("dateEffet")(e.target.value)} />
          </label>
          <Champ label={t.faitA} value={d.lieu} onChange={maj("lieu")} placeholder="Lyon" />
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">{t.dateLettre}</span>
            <input type="date" className={classeChamp} value={d.date} onChange={(e) => maj("date")(e.target.value)} />
          </label>
          <label className="flex items-center gap-3 sm:pt-6 text-sm text-neutral-300">
            <input type="checkbox" className="w-5 h-5 shrink-0 accent-sky-400" checked={d.recommande} onChange={(e) => maj("recommande")(e.target.checked)} />
            {t.recommande}
          </label>
        </fieldset>
      </form>

      <div data-resultat className="space-y-4 min-w-0 lg:sticky lg:top-4">
        <LettreFeuille
          id="lettre-resiliation"
          libelleTexte={t.libelleTexte}
          haut={
            <>
              <div className="leading-snug">
                <Gris v={d.prenomNom} repli={t.repliNom} />
                {d.adresse.trim() && <div>{d.adresse}</div>}
                {d.codePostalVille.trim() && <div>{d.codePostalVille}</div>}
                {d.reference.trim() && (
                  <div className="mt-1">
                    {infos.libelleReference} : {d.reference}
                  </div>
                )}
              </div>
              <div className="mt-6 ml-auto w-full sm:w-1/2 leading-snug">
                <Gris v={d.organisme} repli={t.repliOrganisme} />
                {d.adresseOrganisme.trim() && <div>{d.adresseOrganisme}</div>}
                {d.codePostalVilleOrganisme.trim() && <div>{d.codePostalVilleOrganisme}</div>}
              </div>
              <p className="mt-6 sm:text-right">{lieuDate}</p>
              {d.recommande && <p className="mt-4 italic">Lettre recommandée avec avis de réception</p>}
              <p className="mt-4 mb-5 font-semibold">Objet : {objet}</p>
            </>
          }
          texte={texte}
          onTexte={modifier}
          bas={
            <div className="mt-8 ml-auto w-full sm:w-1/2 min-h-[6rem]">
              <Gris v={d.prenomNom} repli={t.repliNom} />
              <p className="text-sm text-neutral-500 mt-1 print:hidden">{t.signature}</p>
            </div>
          }
        />
        <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} nomDocument={t.nomDocument} />
      </div>
    </div>
  );

  return (
    <PageOutil id="lettre-de-resiliation" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Lettre de résiliation : le modèle gratuit en pratique">
      <p>
        Cette lettre de résiliation se remplit en trois minutes : choisissez le type de contrat (box, mobile,
        assurance auto ou habitation, mutuelle, assurance emprunteur, salle de sport, abonnement en ligne, électricité
        ou gaz), puis le motif, et la lettre se rédige à côté avec l'objet, la référence du contrat, la date d'effet
        souhaitée et la demande de confirmation écrite. Remplissez vos coordonnées et celles de l'organisme, relisez le
        texte, qui reste modifiable, puis imprimez-le ou enregistrez-le en PDF et signez. Exemple : une box sans
        engagement résiliée le 3 novembre prend fin au plus tard 10 jours après la réception de la lettre, selon
        Service Public. La limite tient à votre contrat : ses conditions générales peuvent prévoir un préavis ou un
        moyen d'envoi particulier, et certains contrats, comme l'assurance auto après un an, se résilient par le
        nouvel assureur et non par vous.
      </p>
    </Section>

    <Section titre="Envoyer la résiliation : recommandé, espace client ou trois clics">
      <p>
        La lettre recommandée avec avis de réception n'est pas toujours obligatoire, mais elle reste le moyen le plus
        sûr de prouver la date à laquelle votre demande est arrivée : c'est cette date qui fait courir le délai de
        résiliation. Pour une assurance, Service Public admet aussi la lettre simple, la déclaration au siège de
        l'assureur ou chez son agent, l'envoi en ligne quand le contrat a été souscrit ou peut l'être en ligne, ou tout
        autre moyen prévu par le contrat.
      </p>
      <p>
        Depuis la loi du 16 août 2022 et ses décrets de 2023, un contrat qui peut être conclu en ligne doit aussi
        pouvoir être résilié en ligne : opérateurs, fournisseurs d'énergie, salles de sport, presse en ligne, sites de
        rencontre, assurances et mutuelles. La fonction « résilier votre contrat » se déroule en trois temps : vos
        informations (identité, référence du contrat, motif et date), un récapitulatif, puis la confirmation. Le
        professionnel doit ensuite accuser réception et vous indiquer la date de fin du contrat. La lettre garde son
        intérêt quand le site ne propose pas cette fonction ou quand vous voulez exposer un motif précis, comme un
        motif légitime auprès d'un opérateur.
      </p>
    </Section>

    <Section titre="Délais et date d'effet selon le contrat">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-sm border-collapse">
          <thead>
            <tr className="text-left text-neutral-400 border-b border-neutral-800">
              <th className="py-2 pr-4 font-medium">Contrat</th>
              <th className="py-2 pr-4 font-medium">Quand résilier</th>
              <th className="py-2 font-medium">Effet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            <tr>
              <td className="py-2 pr-4">Box, mobile, télévision</td>
              <td className="py-2 pr-4">À tout moment ; pendant l'engagement, frais possibles sauf motif légitime</td>
              <td className="py-2">10 jours au plus après réception, sauf date demandée</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Assurance auto</td>
              <td className="py-2 pr-4">À l'échéance ; à tout moment après un an, par le nouvel assureur</td>
              <td className="py-2">1 mois après réception (après un an)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Assurance habitation</td>
              <td className="py-2 pr-4">À tout moment après un an ; locataire : par le nouvel assureur</td>
              <td className="py-2">1 mois après réception</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Mutuelle individuelle</td>
              <td className="py-2 pr-4">À l'échéance, ou à tout moment après un an d'adhésion</td>
              <td className="py-2">Selon les conditions générales</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Assurance emprunteur</td>
              <td className="py-2 pr-4">À tout moment, après accord de la banque sur le nouveau contrat</td>
              <td className="py-2">Banque : réponse sous 10 jours ouvrés</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Salle de sport, abonnement à reconduction tacite</td>
              <td className="py-2 pr-4">Avant la date limite de non-reconduction ; à tout moment si le rappel annuel manque</td>
              <td className="py-2">À la date anniversaire</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Électricité, gaz</td>
              <td className="py-2 pr-4">À tout moment, sans durée minimale</td>
              <td className="py-2">Automatique en cas de changement de fournisseur</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Ces repères résument les fiches de Service Public citées en bas de page. Votre contrat peut prévoir un délai
        plus court ou un moyen d'envoi supplémentaire : relisez ses conditions générales avant d'envoyer.
      </p>
    </Section>

    <Section titre="Avant d'envoyer : quatre vérifications">
      <p>
        <strong>Les références.</strong> Un numéro de contrat, de client ou d'adhérent permet au service de retrouver
        votre dossier sans échange supplémentaire. Pour une box ou un mobile, indiquez aussi le numéro de la ligne
        concernée si vous en avez plusieurs.
      </p>
      <p>
        <strong>La date d'effet.</strong> Laissez le champ vide pour une résiliation à la première date permise, ou
        indiquez une date plus tardive, par exemple le jour de votre déménagement. Pour un contrat à reconduction
        tacite, les sommes restent dues jusqu'à la date de fin, quelle que soit la date de votre demande : gardez donc
        votre prélèvement actif jusque-là.
      </p>
      <p>
        <strong>La preuve.</strong> Conservez une copie de la lettre, le bordereau du recommandé et l'avis de réception,
        ou la capture de l'accusé de réception en ligne. La lettre générée réclame déjà une confirmation écrite de la
        date d'effet.
      </p>
      <p>
        <strong>Le matériel.</strong> Une box ou un décodeur se rendent dans les conditions prévues au contrat, en
        boutique, en point relais ou par la poste ; le dépôt de garantie doit être remboursé dans les 10 jours qui
        suivent la restitution. Pour une déclaration à joindre à un autre dossier, voyez le modèle d'
        <Link to="/attestation-sur-l-honneur/">attestation sur l'honneur</Link> ; pour justifier qu'un proche vit chez
        vous, l'<Link to="/attestation-hebergement/">attestation d'hébergement</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Cancellation letter for a French contract: how it works">
      <p>
        This cancellation letter for a French contract takes about three minutes: pick the type of contract (internet
        box, mobile, car or home insurance, mutuelle, mortgage insurance, gym, online subscription, electricity or gas),
        then the reason, and the letter is written next to the form in French, with the subject line, your contract
        number, the end date you want and a request for written confirmation. Add your details and the company's
        address, read the text, which you can still edit, then print it or save it as a PDF and sign it by hand. For
        example, an internet box with no minimum term cancelled on 3 November ends at the latest 10 days after the
        operator receives the letter, according to Service Public, the French government's official guide. The main
        limit is your own contract: its general terms may set a notice period or a specific way to send the request,
        and some contracts, such as car insurance after the first year, are cancelled by your new insurer, not by you.
      </p>
    </Section>

    <Section titre="Why the letter is in French, and the words you will meet">
      <p>
        French operators, insurers and gyms handle their mail in French, so the letter this tool produces stays in
        French even though the form is in English. The structure is the standard French one: your address top left, the
        company's address on the right, the place and date (« À Lyon, le 3 novembre 2026 »), the subject line (« Objet »),
        then the body ending with a formal closing sentence. Names, addresses and numbers can be typed as they are; if
        you add a reason in your own words, write it in plain French.
      </p>
      <p>
        A few terms come up again and again. A <strong>lettre recommandée avec accusé de réception</strong> (often
        shortened to LRAR, and called « avis de réception » on the La Poste form) is a registered letter whose signed
        receipt proves the date the company got it. The <strong>période d'engagement</strong> is the minimum term of a
        phone or internet contract, usually 12 or 24 months. The <strong>loi Chatel</strong> requires a business to
        remind you before a contract renews automatically; the <strong>loi Hamon</strong> lets you cancel most
        insurance at any time after the first year; and <strong>résiliation infra-annuelle</strong> is the same right
        applied to individual mutuelles (top-up health cover).
      </p>
    </Section>

    <Section titre="Notice periods and end dates by contract">
      <p>
        For an internet box, mobile or TV contract, the cancellation takes effect within 10 days of receipt unless you
        ask for a later date. During a 24-month term without a legitimate reason, you pay the remaining monthly fees up
        to month 12, then 25% of the fees after that. Car and home insurance end one month after the insurer receives
        the request once the first year is over; tenants and drivers switch through the new insurer so cover never
        stops. Mortgage insurance can be changed at any time, but only after the bank approves the new policy, which it
        must answer within 10 working days.
      </p>
      <p>
        For a gym or any contract that renews automatically, send the letter before the non-renewal deadline shown on
        the yearly reminder; if that reminder never came, you can leave at any time after the renewal, free of charge.
        Electricity and gas have no minimum term, and switching supplier cancels the old contract automatically.
      </p>
    </Section>

    <Section titre="Before you post it">
      <p>
        Check that the contract or customer number is right, keep a copy of the signed letter, the La Poste receipt and
        the proof of delivery, and keep paying until the end date the company confirms. Return any box or decoder as the
        contract says; the deposit must be refunded within 10 days of the return. If a French office also asks you for
        a signed statement, use the <Link to="/en/sworn-statement/">sworn statement template</Link>, and to prove that
        someone lives with you, the <Link to="/en/proof-of-accommodation/">proof of accommodation letter</Link>.
      </p>
    </Section>
  </>
);

export default LettreDeResiliation;
