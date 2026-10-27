/**
 * Dix modèles de carte de visite par métier. Les coordonnées sont fictives (numéros en 06 12…,
 * domaine exemple.fr réservé). Les « mentions utiles » sont des conseils de contenu ; les seules
 * obligations affirmées sur la page sont celles citées avec leur source Service Public.
 */

import type { Langue } from "@/lib/outils";

export type Style = "sobre" | "bandeau" | "centre";

export interface Modele {
  id: string;
  metier: string;
  nom: string;
  titre: string;
  entreprise: string;
  lignes: string[];
  legal: string;
  couleur: string;
  style: Style;
  conseils: string[];
}

export const MODELES: Modele[] = [
  {
    id: "artisan",
    metier: "Artisan du bâtiment",
    nom: "Julien Morel",
    titre: "Plombier chauffagiste",
    entreprise: "Morel Plomberie",
    lignes: ["06 12 34 56 78", "contact@exemple.fr", "Interventions : Rennes et 30 km"],
    legal: "Julien Morel EI · Siren 000 000 000 · RNE",
    couleur: "#1d4ed8",
    style: "bandeau",
    conseils: [
      "Le métier en clair, dans les mots du client : « plombier chauffagiste » plutôt qu'un nom de société seul.",
      "La zone d'intervention, qui évite les appels hors secteur.",
      "Un seul numéro, celui qui répond pendant les chantiers.",
      "L'identification de l'entreprise (EI, Siren, RNE) si la carte sert à prospecter : voir la section sur les mentions.",
    ],
  },
  {
    id: "coach",
    metier: "Coach sportif",
    nom: "Inès Garnier",
    titre: "Coach sportive diplômée",
    entreprise: "Garnier Coaching",
    lignes: ["06 12 34 56 78", "exemple.fr/seances", "Domicile, parc, visio"],
    legal: "",
    couleur: "#0f766e",
    style: "sobre",
    conseils: [
      "Le lieu des séances (domicile, salle, extérieur, visio), première question des clients.",
      "Un lien direct vers la prise de rendez-vous plutôt que la page d'accueil du site.",
      "Le diplôme ou la carte professionnelle, si vous l'indiquez, tel qu'il est intitulé.",
    ],
  },
  {
    id: "immobilier",
    metier: "Agent immobilier",
    nom: "Thomas Lefèvre",
    titre: "Conseiller en transaction",
    entreprise: "Agence des Quais",
    lignes: ["06 12 34 56 78", "t.lefevre@exemple.fr", "8 quai Victor-Hugo, 33000 Bordeaux"],
    legal: "Carte professionnelle n° CPI 0000 0000 000 000 000",
    couleur: "#9a3412",
    style: "bandeau",
    conseils: [
      "L'adresse de l'agence : le client veut savoir où passer.",
      "Le numéro de carte professionnelle, que l'agence affiche déjà dans ses locaux.",
      "Pour un agent commercial indépendant, le nom du réseau et son propre statut, sans ambiguïté.",
    ],
  },
  {
    id: "consultant",
    metier: "Consultant",
    nom: "Claire Dubois",
    titre: "Consultante en organisation",
    entreprise: "Dubois Conseil",
    lignes: ["06 12 34 56 78", "claire@exemple.fr", "linkedin.com/in/exemple"],
    legal: "Dubois Conseil SAS au capital de 1 000 € · RCS Paris 000 000 000",
    couleur: "#111827",
    style: "sobre",
    conseils: [
      "Une spécialité précise plutôt que « conseil » seul.",
      "Le profil LinkedIn, souvent plus consulté que le site.",
      "Pour une société, la ligne d'identification (forme, capital, RCS) en petit au verso ou en bas.",
    ],
  },
  {
    id: "photographe",
    metier: "Photographe",
    nom: "Léa Fontaine",
    titre: "Photographe mariage et portrait",
    entreprise: "Léa Fontaine Photographie",
    lignes: ["06 12 34 56 78", "exemple.fr/portfolio", "@exemple"],
    legal: "",
    couleur: "#44403c",
    style: "centre",
    conseils: [
      "Le lien vers le portfolio : c'est lui qui vend.",
      "Le compte Instagram si c'est là que vous publiez vos séries.",
      "Une photo au verso, imprimée en 300 dpi au format exact avec fond perdu.",
    ],
  },
  {
    id: "avocat",
    metier: "Avocat",
    nom: "Maître Paul Renaud",
    titre: "Avocat au barreau de Lyon",
    entreprise: "Cabinet Renaud",
    lignes: ["04 78 00 00 00", "cabinet@exemple.fr", "15 rue de la République, 69002 Lyon"],
    legal: "",
    couleur: "#1e3a8a",
    style: "centre",
    conseils: [
      "Le barreau d'inscription, à côté du titre.",
      "Les domaines d'intervention si vous en avez, dans les termes de votre règlement professionnel : la communication des avocats est encadrée, renseignez-vous auprès de votre ordre.",
      "Le standard du cabinet plutôt qu'un portable personnel.",
    ],
  },
  {
    id: "restaurateur",
    metier: "Restaurateur",
    nom: "Le Comptoir de Marie",
    titre: "Cuisine de saison",
    entreprise: "Marie Lambert, cheffe",
    lignes: ["05 56 00 00 00", "exemple.fr/reserver", "Mar. au sam., 12 h-14 h et 19 h-22 h"],
    legal: "",
    couleur: "#7c2d12",
    style: "centre",
    conseils: [
      "Les jours et horaires d'ouverture : c'est ce que le client cherche en rentrant chez lui.",
      "Le lien de réservation ou le numéro qui répond pendant le service.",
      "L'adresse avec un repère (« face au marché ») si la rue est peu connue.",
    ],
  },
  {
    id: "infirmier",
    metier: "Infirmier libéral",
    nom: "Sophie Bernard",
    titre: "Infirmière libérale",
    entreprise: "Cabinet infirmier des Tilleuls",
    lignes: ["06 12 34 56 78", "Soins à domicile et au cabinet", "3 place des Tilleuls, 44000 Nantes"],
    legal: "",
    couleur: "#0e7490",
    style: "sobre",
    conseils: [
      "Le numéro de téléphone en gros : la carte sert surtout à appeler.",
      "Les modes de soins (domicile, cabinet) et le secteur couvert.",
      "Les règles de communication propres à la profession relèvent de l'Ordre national des infirmiers : vérifiez-les avant d'ajouter un slogan ou des tarifs.",
    ],
  },
  {
    id: "coiffure",
    metier: "Coiffeuse à domicile",
    nom: "Amandine Roux",
    titre: "Coiffeuse à domicile",
    entreprise: "Coiffure Amandine",
    lignes: ["06 12 34 56 78", "Sur rendez-vous, du lundi au samedi", "Toulouse et alentours"],
    legal: "Amandine Roux EI · Siren 000 000 000",
    couleur: "#9d174d",
    style: "bandeau",
    conseils: [
      "Le mode de prise de rendez-vous (téléphone, SMS, lien) écrit noir sur blanc.",
      "Le secteur couvert, pour une activité à domicile.",
      "Au verso, une carte de fidélité à tamponner si vous en proposez une.",
    ],
  },
  {
    id: "architecte",
    metier: "Architecte d'intérieur",
    nom: "Hugo Perrin",
    titre: "Architecte d'intérieur",
    entreprise: "Atelier Perrin",
    lignes: ["06 12 34 56 78", "hugo@exemple.fr", "exemple.fr/realisations"],
    legal: "",
    couleur: "#3f3f46",
    style: "sobre",
    conseils: [
      "Le lien vers les réalisations, avant la page de présentation.",
      "Une mise en page aérée : la carte elle-même montre votre goût.",
      "Le titre exact que vous portez, sans l'abréger : « architecte d'intérieur » et « architecte » ne désignent pas la même profession.",
    ],
  },
];

/**
 * Les mêmes dix modèles pour la page anglaise, écrite pour un anglophone installé en France : textes
 * de la carte et conseils en anglais, coordonnées fictives françaises, mentions françaises (EI, Siren,
 * RCS) gardées telles quelles puisqu'elles relèvent du droit français.
 */
export const MODELES_EN: Modele[] = [
  {
    id: "artisan", metier: "Building tradesperson", nom: "Julien Morel", titre: "Plumber and heating engineer",
    entreprise: "Morel Plomberie", lignes: ["06 12 34 56 78", "contact@example.com", "Call-outs: Rennes and 30 km"],
    legal: "Julien Morel EI · Siren 000 000 000 · RNE", couleur: "#1d4ed8", style: "bandeau",
    conseils: [
      "Your trade in the client's words, \"plumber and heating engineer\", not just a company name.",
      "The area you cover, which saves calls from too far away.",
      "One number only, the one you answer on site.",
      "Your French business identifiers (EI, SIREN, RNE) if the card is used to win clients: see the section on legal details.",
    ],
  },
  {
    id: "coach", metier: "Personal trainer", nom: "Inès Garnier", titre: "Qualified personal trainer",
    entreprise: "Garnier Coaching", lignes: ["06 12 34 56 78", "example.com/sessions", "Home, park or video"],
    legal: "", couleur: "#0f766e", style: "sobre",
    conseils: [
      "Where sessions take place (home, gym, outdoors, video), the first thing clients ask.",
      "A direct link to your booking page rather than your home page.",
      "Your qualification or professional card, if you mention it, exactly as it is titled.",
    ],
  },
  {
    id: "immobilier", metier: "Estate agent", nom: "Thomas Lefèvre", titre: "Sales negotiator",
    entreprise: "Agence des Quais", lignes: ["06 12 34 56 78", "t.lefevre@example.com", "8 quai Victor-Hugo, 33000 Bordeaux"],
    legal: "Carte professionnelle n° CPI 0000 0000 000 000 000", couleur: "#9a3412", style: "bandeau",
    conseils: [
      "The agency address: clients want to know where to drop by.",
      "The professional card number (carte professionnelle), which the agency already displays on its premises.",
      "For an independent agent, the network's name and your own status, with no ambiguity.",
    ],
  },
  {
    id: "consultant", metier: "Consultant", nom: "Claire Dubois", titre: "Organisation consultant",
    entreprise: "Dubois Conseil", lignes: ["06 12 34 56 78", "claire@example.com", "linkedin.com/in/example"],
    legal: "Dubois Conseil SAS au capital de 1 000 € · RCS Paris 000 000 000", couleur: "#111827", style: "sobre",
    conseils: [
      "A precise speciality rather than \"consulting\" alone.",
      "Your LinkedIn profile, often viewed more than your website.",
      "For a company, the identification line (legal form, share capital, RCS) in small print at the bottom or on the back.",
    ],
  },
  {
    id: "photographe", metier: "Photographer", nom: "Léa Fontaine", titre: "Wedding and portrait photographer",
    entreprise: "Léa Fontaine Photography", lignes: ["06 12 34 56 78", "example.com/portfolio", "@example"],
    legal: "", couleur: "#44403c", style: "centre",
    conseils: [
      "The link to your portfolio: that is what sells.",
      "Your Instagram handle if that is where you post your work.",
      "A photo on the back, printed at 300 dpi at the exact size with bleed.",
    ],
  },
  {
    id: "avocat", metier: "Lawyer", nom: "Maître Paul Renaud", titre: "Avocat au barreau de Lyon",
    entreprise: "Cabinet Renaud", lignes: ["04 78 00 00 00", "office@example.com", "15 rue de la République, 69002 Lyon"],
    legal: "", couleur: "#1e3a8a", style: "centre",
    conseils: [
      "The bar you are registered with, next to your title, in French as clients will expect it.",
      "Your areas of practice, if any, in the terms your professional rules allow: lawyers' communication is regulated, so check with your bar.",
      "The firm's switchboard rather than a personal mobile.",
    ],
  },
  {
    id: "restaurateur", metier: "Restaurant owner", nom: "Le Comptoir de Marie", titre: "Seasonal cooking",
    entreprise: "Marie Lambert, head chef", lignes: ["05 56 00 00 00", "example.com/book", "Tue to Sat, 12-2 pm and 7-10 pm"],
    legal: "", couleur: "#7c2d12", style: "centre",
    conseils: [
      "Opening days and hours: that is what guests look for once home.",
      "The booking link, or the number that is answered during service.",
      "The address with a landmark (\"opposite the market\") if the street is little known.",
    ],
  },
  {
    id: "infirmier", metier: "Self-employed nurse", nom: "Sophie Bernard", titre: "Infirmière libérale (registered nurse)",
    entreprise: "Cabinet infirmier des Tilleuls", lignes: ["06 12 34 56 78", "Home visits and practice care", "3 place des Tilleuls, 44000 Nantes"],
    legal: "", couleur: "#0e7490", style: "sobre",
    conseils: [
      "The phone number in large type: the card is mostly used to call.",
      "How you provide care (home visits, practice) and the area covered.",
      "Nurses' communication rules are set by the Ordre national des infirmiers: check them before adding a slogan or prices.",
    ],
  },
  {
    id: "coiffure", metier: "Mobile hairdresser", nom: "Amandine Roux", titre: "Mobile hairdresser",
    entreprise: "Coiffure Amandine", lignes: ["06 12 34 56 78", "By appointment, Monday to Saturday", "Toulouse and surroundings"],
    legal: "Amandine Roux EI · Siren 000 000 000", couleur: "#9d174d", style: "bandeau",
    conseils: [
      "How to book (phone, text, link), written in plain words.",
      "The area you cover, for a home-visit business.",
      "On the back, a loyalty card to stamp if you offer one.",
    ],
  },
  {
    id: "architecte", metier: "Interior designer", nom: "Hugo Perrin", titre: "Interior designer",
    entreprise: "Atelier Perrin", lignes: ["06 12 34 56 78", "hugo@example.com", "example.com/projects"],
    legal: "", couleur: "#3f3f46", style: "sobre",
    conseils: [
      "The link to your projects, before your about page.",
      "A spacious layout: the card itself shows your taste.",
      "Your exact title in full: in France, architecte d'intérieur and architecte do not name the same profession.",
    ],
  },
];

/** Les modèles dans la langue de la page. */
export const modeles = (lang: Langue = "fr"): Modele[] => (lang === "en" ? MODELES_EN : MODELES);
