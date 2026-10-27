/**
 * Lettre de résiliation : types de contrat, motifs proposés et corps de lettre.
 * Les repères (délais, moyens) viennent des fiches Service Public citées sur la page
 * /lettre-de-resiliation/ ; ils sont rappelés à l'écran, pas inventés dans la lettre.
 */

export type TypeContrat =
  | "telecom"
  | "auto"
  | "habitation"
  | "sante"
  | "emprunteur"
  | "sport"
  | "abonnement"
  | "energie"
  | "autre";

export interface Motif {
  id: string;
  nom: string;
  en: string; // libellé de l'interface anglaise (la lettre reste en français)
}

export interface InfosType {
  id: TypeContrat;
  nom: string;
  /** Désignation dans la lettre : « mon contrat d'assurance habitation » */
  designation: string;
  libelleReference: string;
  motifs: Motif[];
  /** Objet de la lettre, sans la référence. */
  objet: string;
  /** Repère affiché à l'écran sous le choix du motif. */
  repere: string;
  /** Mêmes libellés pour l'interface anglaise (la lettre produite reste en français). */
  en: { nom: string; libelleReference: string; repere: string };
}

export const TYPES: InfosType[] = [
  {
    id: "telecom",
    objet: "Résiliation de mon abonnement",
    nom: "Box internet, mobile ou télévision",
    designation: "mon abonnement",
    libelleReference: "Numéro de client ou de contrat",
    motifs: [
      { id: "sans-engagement", nom: "Sans engagement, ou engagement terminé", en: "No minimum term, or term over" },
      { id: "engagement", nom: "Pendant la période d'engagement", en: "During the minimum term (période d'engagement)" },
      { id: "legitime", nom: "Motif légitime (licenciement, déménagement hors zone couverte…)", en: "Legitimate reason (redundancy, move outside the coverage area…)" },
      { id: "modification", nom: "Refus d'une modification du contrat par l'opérateur", en: "Refusing a contract change made by the operator" },
    ],
    repere:
      "Service Public : la résiliation prend généralement effet dans un délai maximal de 10 jours après réception de la demande, sauf date plus tardive demandée. Pour garder votre numéro, ne résiliez pas : demandez la portabilité au nouvel opérateur avec votre RIO (3179), il résilie pour vous.",
    en: {
      nom: "Internet box, mobile or TV",
      libelleReference: "Customer or contract number",
      repere:
        "Service Public: the cancellation usually takes effect within 10 days of the operator receiving it, unless you ask for a later date. To keep your phone number, do not cancel: give your RIO code (call 3179 for free) to the new operator, which cancels the old contract for you.",
    },
  },
  {
    id: "auto",
    objet: "Résiliation du contrat d'assurance automobile",
    nom: "Assurance auto ou moto",
    designation: "mon contrat d'assurance automobile",
    libelleReference: "Numéro de contrat (ou de sociétaire)",
    motifs: [
      { id: "echeance", nom: "À l'échéance annuelle", en: "At the annual renewal date" },
      { id: "situation", nom: "Changement de situation (domicile, situation matrimoniale, retraite…)", en: "Change of circumstances (new address, marriage, retirement…)" },
    ],
    repere:
      "Après la première année, Service Public indique que vous pouvez résilier à tout moment, avec effet un mois après réception ; mais pour une assurance auto obligatoire, c'est le nouvel assureur qui envoie la demande à l'ancien, et non vous. Ce modèle sert donc pour l'échéance annuelle ou un changement de situation (à notifier dans les trois mois suivant l'événement, avec un justificatif).",
    en: {
      nom: "Car or motorbike insurance",
      libelleReference: "Policy (or member) number",
      repere:
        "After the first year, Service Public says you can cancel at any time, effective one month after receipt (loi Hamon); but for compulsory car insurance the new insurer sends the request to the old one, not you. Use this letter for the annual renewal date or a change of circumstances (within three months of the event, with proof).",
    },
  },
  {
    id: "habitation",
    objet: "Résiliation du contrat d'assurance habitation",
    nom: "Assurance habitation",
    designation: "mon contrat d'assurance habitation",
    libelleReference: "Numéro de contrat",
    motifs: [
      { id: "un-an", nom: "Propriétaire : à tout moment après la première année", en: "Homeowner: at any time after the first year" },
      { id: "echeance", nom: "À l'échéance annuelle", en: "At the annual renewal date" },
    ],
    repere:
      "Après la première année, la résiliation prend effet un mois après réception par l'assureur (Service Public). Locataire : le logement doit rester assuré en permanence, c'est donc le nouvel assureur qui envoie la demande de résiliation à l'ancien ; propriétaire : vous pouvez l'envoyer vous-même.",
    en: {
      nom: "Home insurance",
      libelleReference: "Policy number",
      repere:
        "After the first year, cancellation takes effect one month after the insurer receives it (Service Public, loi Hamon). Tenants must stay insured at all times, so the new insurer sends the request for them; homeowners can send it themselves.",
    },
  },
  {
    id: "sante",
    objet: "Résiliation du contrat de complémentaire santé",
    nom: "Complémentaire santé (mutuelle) individuelle",
    designation: "mon contrat de complémentaire santé",
    libelleReference: "Numéro d'adhérent ou de contrat",
    motifs: [
      { id: "un-an", nom: "À tout moment après un an d'adhésion", en: "At any time after one year of cover" },
      { id: "echeance", nom: "À l'échéance annuelle", en: "At the annual renewal date" },
    ],
    repere:
      "Service Public : un contrat individuel peut être résilié à tout moment après un an d'engagement. Pour la forme de la demande, la fiche renvoie aux conditions générales du contrat : vérifiez-les. Une mutuelle d'entreprise obligatoire ne se résilie pas ainsi.",
    en: {
      nom: "Individual top-up health cover (mutuelle)",
      libelleReference: "Member or contract number",
      repere:
        "Service Public: an individual contract can be cancelled at any time after one year (résiliation infra-annuelle, in force since December 2020). Check the general terms for how to send it. A compulsory company scheme cannot be cancelled this way.",
    },
  },
  {
    id: "emprunteur",
    objet: "Résiliation du contrat d'assurance emprunteur",
    nom: "Assurance emprunteur (crédit immobilier)",
    designation: "mon contrat d'assurance emprunteur",
    libelleReference: "Numéro d'adhésion",
    motifs: [{ id: "substitution", nom: "Changement d'assureur accepté par la banque", en: "New insurer approved by the bank" }],
    repere:
      "Service Public : vous pouvez changer d'assureur à tout moment, mais obtenez d'abord l'accord de la banque sur le nouveau contrat (elle a 10 jours ouvrés pour répondre). Sans cet accord, ne résiliez pas l'ancien contrat.",
    en: {
      nom: "Mortgage insurance (assurance emprunteur)",
      libelleReference: "Membership number",
      repere:
        "Service Public: you can switch insurer at any time, but first get the bank's approval of the new policy (it has 10 working days to answer). Do not cancel the old policy without that approval.",
    },
  },
  {
    id: "sport",
    objet: "Résiliation de mon abonnement",
    nom: "Salle de sport",
    designation: "mon abonnement",
    libelleReference: "Numéro d'adhérent",
    motifs: [
      { id: "echeance", nom: "Non-reconduction à l'échéance", en: "No renewal at the end date" },
      { id: "sans-info", nom: "Reconduction sans information préalable", en: "Renewed without the required reminder" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)", en: "Other reason (explain it in the letter)" },
    ],
    repere:
      "Pour un contrat à reconduction tacite, le professionnel doit vous rappeler chaque année, entre trois mois et un mois avant la date limite, votre droit de ne pas reconduire ; sinon, vous pouvez résilier immédiatement et sans frais par lettre recommandée avec avis de réception (Service Public).",
    en: {
      nom: "Gym membership",
      libelleReference: "Member number",
      repere:
        "For a contract that renews automatically, the business must remind you in writing, between three months and one month before the deadline, of your right not to renew (loi Chatel, article L215-1 of the Code de la consommation). Without that reminder you can cancel at any time, free of charge.",
    },
  },
  {
    id: "abonnement",
    objet: "Résiliation de mon abonnement",
    nom: "Presse, streaming ou autre abonnement en ligne",
    designation: "mon abonnement",
    libelleReference: "Numéro d'abonné ou adresse e-mail du compte",
    motifs: [
      { id: "echeance", nom: "Non-reconduction à l'échéance", en: "No renewal at the end date" },
      { id: "sans-info", nom: "Reconduction sans information préalable", en: "Renewed without the required reminder" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)", en: "Other reason (explain it in the letter)" },
    ],
    repere:
      "Un abonnement souscrit en ligne doit pouvoir se résilier en ligne, par la fonction « résilier votre contrat » en trois clics. Si le contrat se renouvelle tacitement sans le rappel annuel obligatoire, vous pouvez résilier immédiatement et sans frais.",
    en: {
      nom: "Newspaper, streaming or other online subscription",
      libelleReference: "Subscriber number or account email",
      repere:
        "A subscription taken out online must be cancellable online, through a « résilier votre contrat » (cancel your contract) button in three clicks. If it renewed without the yearly reminder required by the loi Chatel, you can cancel at once, free of charge.",
    },
  },
  {
    id: "energie",
    objet: "Résiliation du contrat de fourniture d'énergie",
    nom: "Électricité ou gaz",
    designation: "mon contrat de fourniture d'énergie",
    libelleReference: "Numéro de client ou référence du point de livraison",
    motifs: [{ id: "fin", nom: "Fin de contrat sans changement de fournisseur (départ du logement…)", en: "Ending the contract without a new supplier (moving out…)" }],
    repere:
      "Si vous changez de fournisseur, n'écrivez pas : la résiliation de l'ancien contrat est automatique et gratuite, et il n'y a pas de durée minimale d'engagement (Service Public). Cette lettre sert quand vous arrêtez le contrat sans en souscrire un autre pour ce logement.",
    en: {
      nom: "Electricity or gas",
      libelleReference: "Customer number or meter point reference (PDL/PCE)",
      repere:
        "If you switch supplier, do not write: the old contract ends automatically and for free, and there is no minimum term (Service Public). Use this letter when you stop the contract without taking a new one for the home, for example when moving out.",
    },
  },
  {
    id: "autre",
    objet: "Résiliation de mon contrat",
    nom: "Autre contrat ou abonnement",
    designation: "mon contrat",
    libelleReference: "Numéro de contrat ou de client",
    motifs: [
      { id: "echeance", nom: "À l'échéance (non-reconduction)", en: "At the end date (no renewal)" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)", en: "Other reason (explain it in the letter)" },
    ],
    repere:
      "Vérifiez dans vos conditions générales le préavis et le moyen prévu (lettre recommandée, e-mail, espace client). Un contrat conclu en ligne doit pouvoir se résilier en ligne.",
    en: {
      nom: "Other contract or subscription",
      libelleReference: "Contract or customer number",
      repere:
        "Check the general terms for the notice period and the method required (registered letter, email, online account). A contract concluded online must be cancellable online.",
    },
  },
];

export const infosType = (t: TypeContrat) => TYPES.find((x) => x.id === t) ?? TYPES[0];

export interface DonneesResiliation {
  type: TypeContrat;
  motif: string;
  prenomNom: string;
  adresse: string;
  codePostalVille: string;
  organisme: string;
  adresseOrganisme: string;
  codePostalVilleOrganisme: string;
  reference: string;
  ligne: string; // numéro de ligne (télécom)
  precision: string; // motif légitime, événement, objet de l'abonnement…
  dateEvenement: string; // ISO : événement (situation) ou accord de la banque
  dateEffet: string; // ISO, facultatif : date souhaitée
  lieu: string;
  date: string; // ISO
  recommande: boolean;
}

const ou = (s: string, repli: string) => (s.trim() ? s.trim() : repli);

/**
 * Corps de la lettre, de « Madame, Monsieur » à la formule de politesse. La lettre est toujours rédigée
 * en français (c'est ce que l'organisme attend) ; seuls les repères entre crochets, à remplacer, suivent
 * la langue de l'interface.
 */
export function corpsLettre(d: DonneesResiliation, dateLongue: (iso: string) => string, lang: "fr" | "en" = "fr"): string {
  const t = infosType(d.type);
  const c = (fr: string, en: string) => (lang === "en" ? en : fr);
  const ref = d.reference.trim() ? ` n° ${d.reference.trim()}` : "";
  const ligne = d.type === "telecom" && d.ligne.trim() ? `, pour la ligne ${d.ligne.trim()}` : "";
  const quoi = d.type === "abonnement" || d.type === "autre" ? ou(d.precision, t.designation) : t.designation;
  const effet = dateLongue(d.dateEffet);
  const evt = dateLongue(d.dateEvenement);
  const p: string[] = ["Madame, Monsieur,"];

  const intro = (complement = "") =>
    `Par la présente, je vous informe de ma décision de résilier ${quoi}${ref}${ligne}${complement}.`;

  switch (`${d.type}:${d.motif}`) {
    case "telecom:sans-engagement":
      p.push(intro(), "Ce contrat n'est pas, ou plus, soumis à une période d'engagement : la résiliation ne doit donc entraîner aucun frais lié à l'engagement.");
      break;
    case "telecom:engagement":
      p.push(intro(), "Je résilie pendant la période d'engagement et je vous remercie de m'indiquer le montant exact des sommes restant dues, calculé selon les règles prévues au contrat.");
      break;
    case "telecom:legitime":
      p.push(
        intro(" pour motif légitime"),
        `${ou(d.precision, c("[Décrivez l'événement : licenciement, hospitalisation, déménagement dans une zone non couverte…]", "[Describe the event in French: redundancy, hospital stay, move to an area without coverage…]"))} Cet événement rend impossible la poursuite du contrat ; vous trouverez le justificatif ci-joint. Je vous demande en conséquence de ne facturer aucun frais de résiliation.`
      );
      break;
    case "telecom:modification":
      p.push(
        intro(),
        `Je refuse la modification de mon contrat que vous m'avez notifiée${ou(d.precision, "") ? ` (${d.precision.trim()})` : ""}. Je fais donc usage de mon droit de résilier sans frais à la suite d'une modification du contrat à votre initiative.`
      );
      break;
    case "auto:echeance":
    case "habitation:echeance":
    case "sante:echeance":
      p.push(intro(" à sa prochaine échéance annuelle"), "Je vous demande de ne pas le reconduire et de me confirmer la date à laquelle la résiliation prendra effet.");
      break;
    case "auto:situation":
      p.push(
        intro(" en raison d'un changement de situation"),
        `${ou(d.precision, c("[Précisez l'événement : déménagement, mariage, départ à la retraite…]", "[Describe the event in French: move, marriage, retirement…]"))}${evt ? ` Cet événement est intervenu le ${evt}.` : ""} Le risque garanti s'en trouve modifié ; vous trouverez le justificatif ci-joint. La résiliation prend effet un mois après la réception de cette notification.`
      );
      break;
    case "habitation:un-an":
    case "sante:un-an":
      p.push(
        intro(),
        "Ce contrat a été souscrit il y a plus d'un an : je fais usage de mon droit de le résilier à tout moment, sans frais ni pénalité. Je vous remercie de me rembourser la part de cotisation correspondant à la période postérieure à la date d'effet de la résiliation."
      );
      break;
    case "emprunteur:substitution":
      p.push(
        intro(),
        `Mon organisme prêteur a accepté${evt ? ` le ${evt}` : ""} la substitution de ce contrat par un nouveau contrat d'assurance emprunteur ; vous trouverez sa décision ci-jointe. Je vous remercie de me confirmer la date d'effet de la résiliation, qui doit coïncider avec la prise d'effet du nouveau contrat.`
      );
      break;
    case "sport:echeance":
    case "abonnement:echeance":
    case "autre:echeance":
      p.push(intro(), "Je vous demande de ne pas le reconduire à son échéance et de me confirmer la date à laquelle il prendra fin.");
      break;
    case "sport:sans-info":
    case "abonnement:sans-info":
      p.push(
        intro(" avec effet immédiat"),
        "Je n'ai pas reçu l'information écrite, que vous deviez m'adresser avant la date limite, sur mon droit de ne pas reconduire ce contrat. Je résilie donc sans frais, et je vous remercie de me rembourser, dans un délai de trente jours, les sommes correspondant à la période postérieure à la résiliation."
      );
      break;
    case "energie:fin":
      p.push(
        `Par la présente, je vous informe de ma décision de résilier ${quoi}${ref} pour le logement situé ${ou(d.precision, c("[adresse du logement]", "[address of the home]"))}.`,
        "Je vous remercie de me faire parvenir la facture de clôture établie d'après le relevé du compteur à la date d'effet."
      );
      break;
    default:
      p.push(intro(), ou(d.type === "abonnement" || d.type === "autre" ? "" : d.precision, c("[Précisez ici le motif de la résiliation si votre contrat l'exige.]", "[State the reason here, in French, if your contract requires one.]")));
  }

  if (effet) p.push(`Je souhaite que cette résiliation prenne effet le ${effet}, ou à défaut à la première date permise par le contrat.`);
  p.push("Je vous remercie de m'adresser une confirmation écrite de la résiliation et de sa date d'effet, ainsi que, le cas échéant, les modalités de restitution du matériel.");
  p.push("Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.");
  return p.join("\n\n");
}

export const objetLettre = (d: DonneesResiliation) => {
  const ref = d.reference.trim() ? ` n° ${d.reference.trim()}` : "";
  if ((d.type === "abonnement" || d.type === "autre") && d.precision.trim())
    return `Résiliation : ${d.precision.trim()}${ref}`;
  return `${infosType(d.type).objet}${ref}`;
};
