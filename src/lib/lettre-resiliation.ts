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
}

export const TYPES: InfosType[] = [
  {
    id: "telecom",
    objet: "Résiliation de mon abonnement",
    nom: "Box internet, mobile ou télévision",
    designation: "mon abonnement",
    libelleReference: "Numéro de client ou de contrat",
    motifs: [
      { id: "sans-engagement", nom: "Sans engagement, ou engagement terminé" },
      { id: "engagement", nom: "Pendant la période d'engagement" },
      { id: "legitime", nom: "Motif légitime (licenciement, déménagement hors zone couverte…)" },
      { id: "modification", nom: "Refus d'une modification du contrat par l'opérateur" },
    ],
    repere:
      "Service Public : la résiliation prend généralement effet dans un délai maximal de 10 jours après réception de la demande, sauf date plus tardive demandée. Pour garder votre numéro, ne résiliez pas : demandez la portabilité au nouvel opérateur avec votre RIO (3179), il résilie pour vous.",
  },
  {
    id: "auto",
    objet: "Résiliation du contrat d'assurance automobile",
    nom: "Assurance auto ou moto",
    designation: "mon contrat d'assurance automobile",
    libelleReference: "Numéro de contrat (ou de sociétaire)",
    motifs: [
      { id: "echeance", nom: "À l'échéance annuelle" },
      { id: "situation", nom: "Changement de situation (domicile, situation matrimoniale, retraite…)" },
    ],
    repere:
      "Après la première année, Service Public indique que vous pouvez résilier à tout moment, avec effet un mois après réception ; mais pour une assurance auto obligatoire, c'est le nouvel assureur qui envoie la demande à l'ancien, et non vous. Ce modèle sert donc pour l'échéance annuelle ou un changement de situation (à notifier dans les trois mois suivant l'événement, avec un justificatif).",
  },
  {
    id: "habitation",
    objet: "Résiliation du contrat d'assurance habitation",
    nom: "Assurance habitation",
    designation: "mon contrat d'assurance habitation",
    libelleReference: "Numéro de contrat",
    motifs: [
      { id: "un-an", nom: "Propriétaire : à tout moment après la première année" },
      { id: "echeance", nom: "À l'échéance annuelle" },
    ],
    repere:
      "Après la première année, la résiliation prend effet un mois après réception par l'assureur (Service Public). Locataire : le logement doit rester assuré en permanence, c'est donc le nouvel assureur qui envoie la demande de résiliation à l'ancien ; propriétaire : vous pouvez l'envoyer vous-même.",
  },
  {
    id: "sante",
    objet: "Résiliation du contrat de complémentaire santé",
    nom: "Complémentaire santé (mutuelle) individuelle",
    designation: "mon contrat de complémentaire santé",
    libelleReference: "Numéro d'adhérent ou de contrat",
    motifs: [
      { id: "un-an", nom: "À tout moment après un an d'adhésion" },
      { id: "echeance", nom: "À l'échéance annuelle" },
    ],
    repere:
      "Service Public : un contrat individuel peut être résilié à tout moment après un an d'engagement. Pour la forme de la demande, la fiche renvoie aux conditions générales du contrat : vérifiez-les. Une mutuelle d'entreprise obligatoire ne se résilie pas ainsi.",
  },
  {
    id: "emprunteur",
    objet: "Résiliation du contrat d'assurance emprunteur",
    nom: "Assurance emprunteur (crédit immobilier)",
    designation: "mon contrat d'assurance emprunteur",
    libelleReference: "Numéro d'adhésion",
    motifs: [{ id: "substitution", nom: "Changement d'assureur accepté par la banque" }],
    repere:
      "Service Public : vous pouvez changer d'assureur à tout moment, mais obtenez d'abord l'accord de la banque sur le nouveau contrat (elle a 10 jours ouvrés pour répondre). Sans cet accord, ne résiliez pas l'ancien contrat.",
  },
  {
    id: "sport",
    objet: "Résiliation de mon abonnement",
    nom: "Salle de sport",
    designation: "mon abonnement",
    libelleReference: "Numéro d'adhérent",
    motifs: [
      { id: "echeance", nom: "Non-reconduction à l'échéance" },
      { id: "sans-info", nom: "Reconduction sans information préalable" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)" },
    ],
    repere:
      "Pour un contrat à reconduction tacite, le professionnel doit vous rappeler chaque année, entre trois mois et un mois avant la date limite, votre droit de ne pas reconduire ; sinon, vous pouvez résilier immédiatement et sans frais par lettre recommandée avec avis de réception (Service Public).",
  },
  {
    id: "abonnement",
    objet: "Résiliation de mon abonnement",
    nom: "Presse, streaming ou autre abonnement en ligne",
    designation: "mon abonnement",
    libelleReference: "Numéro d'abonné ou adresse e-mail du compte",
    motifs: [
      { id: "echeance", nom: "Non-reconduction à l'échéance" },
      { id: "sans-info", nom: "Reconduction sans information préalable" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)" },
    ],
    repere:
      "Un abonnement souscrit en ligne doit pouvoir se résilier en ligne, par la fonction « résilier votre contrat » en trois clics. Si le contrat se renouvelle tacitement sans le rappel annuel obligatoire, vous pouvez résilier immédiatement et sans frais.",
  },
  {
    id: "energie",
    objet: "Résiliation du contrat de fourniture d'énergie",
    nom: "Électricité ou gaz",
    designation: "mon contrat de fourniture d'énergie",
    libelleReference: "Numéro de client ou référence du point de livraison",
    motifs: [{ id: "fin", nom: "Fin de contrat sans changement de fournisseur (départ du logement…)" }],
    repere:
      "Si vous changez de fournisseur, n'écrivez pas : la résiliation de l'ancien contrat est automatique et gratuite, et il n'y a pas de durée minimale d'engagement (Service Public). Cette lettre sert quand vous arrêtez le contrat sans en souscrire un autre pour ce logement.",
  },
  {
    id: "autre",
    objet: "Résiliation de mon contrat",
    nom: "Autre contrat ou abonnement",
    designation: "mon contrat",
    libelleReference: "Numéro de contrat ou de client",
    motifs: [
      { id: "echeance", nom: "À l'échéance (non-reconduction)" },
      { id: "libre", nom: "Autre motif (à préciser dans la lettre)" },
    ],
    repere:
      "Vérifiez dans vos conditions générales le préavis et le moyen prévu (lettre recommandée, e-mail, espace client). Un contrat conclu en ligne doit pouvoir se résilier en ligne.",
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

/** Corps de la lettre, de « Madame, Monsieur » à la formule de politesse. */
export function corpsLettre(d: DonneesResiliation, dateLongue: (iso: string) => string): string {
  const t = infosType(d.type);
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
        `${ou(d.precision, "[Décrivez l'événement : licenciement, hospitalisation, déménagement dans une zone non couverte…]")} Cet événement rend impossible la poursuite du contrat ; vous trouverez le justificatif ci-joint. Je vous demande en conséquence de ne facturer aucun frais de résiliation.`
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
        `${ou(d.precision, "[Précisez l'événement : déménagement, mariage, départ à la retraite…]")}${evt ? ` Cet événement est intervenu le ${evt}.` : ""} Le risque garanti s'en trouve modifié ; vous trouverez le justificatif ci-joint. La résiliation prend effet un mois après la réception de cette notification.`
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
        `Par la présente, je vous informe de ma décision de résilier ${quoi}${ref} pour le logement situé ${ou(d.precision, "[adresse du logement]")}.`,
        "Je vous remercie de me faire parvenir la facture de clôture établie d'après le relevé du compteur à la date d'effet."
      );
      break;
    default:
      p.push(intro(), ou(d.type === "abonnement" || d.type === "autre" ? "" : d.precision, "[Précisez ici le motif de la résiliation si votre contrat l'exige.]"));
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
