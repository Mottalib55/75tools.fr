/**
 * Dix modèles de carte de visite par métier. Les coordonnées sont fictives (numéros en 06 12…,
 * domaine exemple.fr réservé). Les « mentions utiles » sont des conseils de contenu ; les seules
 * obligations affirmées sur la page sont celles citées avec leur source Service Public.
 */

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
