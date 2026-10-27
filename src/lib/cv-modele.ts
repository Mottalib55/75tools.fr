/**
 * Modèle de CV : données, exemples fictifs (français et anglais) et brouillon local (localStorage, sans la
 * photo), un brouillon par langue d'interface. Le CV lui-même peut être rédigé en français ou en anglais
 * (`langueCv`), quelle que soit la langue de la page : un CV n'est pas un document administratif.
 */

/** Langue de l'interface ou du document. */
export type LangueDoc = "fr" | "en";

export type ModeleVisuel = "classique" | "colonnes" | "moderne";

export interface Experience {
  id: number;
  poste: string;
  employeur: string;
  lieu: string;
  debut: string;
  fin: string;
  description: string; // une réalisation par ligne
}

export interface Formation {
  id: number;
  diplome: string;
  etablissement: string;
  lieu: string;
  debut: string;
  fin: string;
  description: string;
}

export interface Langue {
  id: number;
  langue: string;
  niveau: string; // A1 … C2, ou « Langue maternelle »
}

export interface Cv {
  prenom: string;
  nom: string;
  titre: string;
  email: string;
  telephone: string;
  ville: string;
  lien: string;
  mobilite: string; // permis, mobilité, disponibilité
  profil: string;
  experiences: Experience[];
  formations: Formation[];
  competences: string; // une par ligne
  langues: Langue[];
  interets: string;
  modele: ModeleVisuel;
  accent: string;
  langueCv?: LangueDoc; // langue des titres de rubriques ; par défaut celle de la page
}

/** Alias explicite d'une ligne « langue parlée » (évite la confusion avec la langue de l'interface). */
export type LangueCv = Langue;

export const NIVEAUX_CECRL: [string, string][] = [
  ["Langue maternelle", "Langue maternelle"],
  ["C2", "C2, maîtrise"],
  ["C1", "C1, autonome"],
  ["B2", "B2, avancé"],
  ["B1", "B1, seuil"],
  ["A2", "A2, intermédiaire"],
  ["A1", "A1, découverte"],
];

export const NIVEAUX_CECRL_EN: [string, string][] = [
  ["Langue maternelle", "Native speaker"],
  ["C2", "C2, proficient"],
  ["C1", "C1, advanced"],
  ["B2", "B2, upper intermediate"],
  ["B1", "B1, intermediate"],
  ["A2", "A2, elementary"],
  ["A1", "A1, beginner"],
];

/** Niveaux CECRL (CEFR) dans la langue voulue ; la valeur enregistrée reste la même. */
export const niveaux = (l: LangueDoc = "fr") => (l === "en" ? NIVEAUX_CECRL_EN : NIVEAUX_CECRL);

export const COULEURS_ACCENT = ["#1d4ed8", "#0f766e", "#b45309", "#be123c", "#6d28d9", "#334155"];

export const CV_EXEMPLE: Cv = {
  prenom: "Léa",
  nom: "Moreau",
  titre: "Chargée de communication",
  email: "lea.moreau@exemple.fr",
  telephone: "06 23 45 67 89",
  ville: "Lyon",
  lien: "linkedin.com/in/lea-moreau-exemple",
  mobilite: "Permis B",
  profil:
    "Chargée de communication depuis quatre ans, en agence puis chez l'annonceur. J'écris, je planifie et je mesure : réseaux sociaux, lettres d'information, relations presse et événements. Je cherche un poste où piloter la communication d'une marque de bout en bout.",
  experiences: [
    {
      id: 1,
      poste: "Chargée de communication",
      employeur: "Maison Berthier, fabricant de mobilier",
      lieu: "Lyon",
      debut: "2023",
      fin: "aujourd'hui",
      description:
        "Piloté la refonte du site et de la lettre d'information (12 000 abonnés), taux d'ouverture passé de 24 % à 37 %\nOrganisé deux salons professionnels par an, budget de 40 000 €\nRédigé les communiqués de presse : 18 parutions en 2025 dans la presse spécialisée",
    },
    {
      id: 2,
      poste: "Chargée de projets digitaux",
      employeur: "Agence Rivages",
      lieu: "Villeurbanne",
      debut: "2021",
      fin: "2023",
      description:
        "Animé les réseaux sociaux de six clients (artisanat, tourisme, santé)\nConçu les calendriers éditoriaux et les rapports mensuels de performance\nFormé deux stagiaires à la rédaction web",
    },
  ],
  formations: [
    {
      id: 1,
      diplome: "Master Information et communication",
      etablissement: "Université Lumière Lyon 2",
      lieu: "Lyon",
      debut: "2019",
      fin: "2021",
      description: "Mémoire : la lettre d'information comme média de marque",
    },
    {
      id: 2,
      diplome: "Licence Lettres modernes",
      etablissement: "Université Jean Moulin Lyon 3",
      lieu: "Lyon",
      debut: "2016",
      fin: "2019",
      description: "",
    },
  ],
  competences: "Rédaction et relations presse\nRéseaux sociaux et publicité en ligne\nGestion de projet et de budget\nSuite Adobe (InDesign, Photoshop)\nOutils d'e-mailing et d'analyse d'audience",
  langues: [
    { id: 1, langue: "Français", niveau: "Langue maternelle" },
    { id: 2, langue: "Anglais", niveau: "C1" },
    { id: 3, langue: "Espagnol", niveau: "B1" },
  ],
  interets: "Course à pied (semi-marathon de Lyon), photographie argentique, bénévolat dans une association de lecture",
  modele: "colonnes",
  accent: "#0f766e",
};

export const CV_EXEMPLE_EN: Cv = {
  prenom: "Hannah",
  nom: "Walsh",
  titre: "Product Marketing Manager",
  email: "hannah.walsh@example.com",
  telephone: "+33 6 23 45 67 89",
  ville: "Paris",
  lien: "linkedin.com/in/hannah-walsh-example",
  mobilite: "EU citizen, right to work in France",
  profil:
    "Product marketer with six years in B2B software, the last two in Paris. I turn product features into launches, sales material and campaigns that sales teams actually use. Looking for a role leading product marketing for an international team.",
  experiences: [
    {
      id: 1,
      poste: "Product Marketing Manager",
      employeur: "Lumen Analytics, data software",
      lieu: "Paris",
      debut: "2024",
      fin: "present",
      description:
        "Led the launch of three product lines across France, Germany and the UK, 1,200 new trials in the first quarter\nWrote the sales playbook in English and French, used by a team of 40\nCut the cost per qualified lead by 28% by moving budget from trade shows to webinars",
    },
    {
      id: 2,
      poste: "Marketing Executive",
      employeur: "Northbridge Software",
      lieu: "Manchester",
      debut: "2020",
      fin: "2024",
      description:
        "Ran email and paid campaigns for two products, budget of £300,000 a year\nBuilt the monthly performance report for the leadership team\nCoached two graduates on copywriting",
    },
  ],
  formations: [
    {
      id: 1,
      diplome: "MSc Marketing",
      etablissement: "University of Leeds",
      lieu: "Leeds",
      debut: "2018",
      fin: "2019",
      description: "Dissertation: pricing pages and free-trial conversion",
    },
    {
      id: 2,
      diplome: "BA (Hons) French and Business",
      etablissement: "University of Bristol",
      lieu: "Bristol",
      debut: "2014",
      fin: "2018",
      description: "Year abroad at Sciences Po Lyon",
    },
  ],
  competences: "Product launches and positioning\nSales enablement\nEmail, paid search and LinkedIn campaigns\nHubSpot, Salesforce, Google Analytics\nPresenting to clients in English and French",
  langues: [
    { id: 1, langue: "English", niveau: "Langue maternelle" },
    { id: 2, langue: "French", niveau: "C1" },
    { id: 3, langue: "German", niveau: "A2" },
  ],
  interets: "Trail running (two races a year), volunteer English tutor with a Paris literacy charity",
  modele: "colonnes",
  accent: "#1d4ed8",
  langueCv: "en",
};

export const CV_VIDE: Cv = {
  prenom: "",
  nom: "",
  titre: "",
  email: "",
  telephone: "",
  ville: "",
  lien: "",
  mobilite: "",
  profil: "",
  experiences: [{ id: 1, poste: "", employeur: "", lieu: "", debut: "", fin: "", description: "" }],
  formations: [{ id: 1, diplome: "", etablissement: "", lieu: "", debut: "", fin: "", description: "" }],
  competences: "",
  langues: [{ id: 1, langue: "", niveau: "B2" }],
  interets: "",
  modele: "classique",
  accent: "#1d4ed8",
};

/** Un brouillon par langue d'interface (la clé française reste celle d'avant). */
const cle = (l: LangueDoc) => (l === "en" ? "75tools-cv-brouillon-en-v1" : "75tools-cv-brouillon-v1");

export function lireBrouillon(l: LangueDoc = "fr"): Cv | null {
  try {
    const s = localStorage.getItem(cle(l));
    if (!s) return null;
    const v = JSON.parse(s);
    return v && typeof v === "object" ? { ...CV_VIDE, ...v } : null;
  } catch {
    return null;
  }
}

export function ecrireBrouillon(cv: Cv, l: LangueDoc = "fr") {
  try {
    localStorage.setItem(cle(l), JSON.stringify(cv));
  } catch {
    /* stockage indisponible */
  }
}

export function effacerBrouillon(l: LangueDoc = "fr") {
  try {
    localStorage.removeItem(cle(l));
  } catch {
    /* rien */
  }
}

/** Lignes non vides d'un texte. */
export const lignes = (s: string) =>
  (s || "")
    .split("\n")
    .map((x) => x.replace(/^[\s•\-–*]+/, "").trim())
    .filter(Boolean);

/** « 2021 », « 2023 » → « 2021 – 2023 » ; une seule date → elle seule. */
export const periode = (a: string, b: string) => [a.trim(), b.trim()].filter(Boolean).join(" – ");
