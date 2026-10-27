/** Modèle de CV : données, exemple fictif et brouillon local (localStorage, sans la photo). */

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
}

export const NIVEAUX_CECRL: [string, string][] = [
  ["Langue maternelle", "Langue maternelle"],
  ["C2", "C2, maîtrise"],
  ["C1", "C1, autonome"],
  ["B2", "B2, avancé"],
  ["B1", "B1, seuil"],
  ["A2", "A2, intermédiaire"],
  ["A1", "A1, découverte"],
];

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

const CLE = "75tools-cv-brouillon-v1";

export function lireBrouillon(): Cv | null {
  try {
    const s = localStorage.getItem(CLE);
    if (!s) return null;
    const v = JSON.parse(s);
    return v && typeof v === "object" ? { ...CV_VIDE, ...v } : null;
  } catch {
    return null;
  }
}

export function ecrireBrouillon(cv: Cv) {
  try {
    localStorage.setItem(CLE, JSON.stringify(cv));
  } catch {
    /* stockage indisponible */
  }
}

export function effacerBrouillon() {
  try {
    localStorage.removeItem(CLE);
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
