/**
 * Registre des pages-outils françaises : une seule liste qui nourrit le menu, le pied de page,
 * l'accueil /fr/ (regroupé par catégories) et les renvois « Les autres outils ».
 * Les routes React (App.tsx), le pré-rendu (scripts/prerender.mjs) et le sitemap
 * (public/sitemap.xml) doivent lister les mêmes adresses : `node scripts/check-outils.mjs`
 * le vérifie après le build.
 */

export type CategorieId =
  | "calcul"
  | "temps"
  | "texte"
  | "pdf"
  | "image"
  | "qr"
  | "documents"
  | "signature";

export interface Categorie {
  id: CategorieId;
  nom: string;
  chapeau: string;
}

export const CATEGORIES: Categorie[] = [
  { id: "pdf", nom: "PDF", chapeau: "Compresser, fusionner, séparer, convertir et signer, sans envoyer le fichier." },
  { id: "image", nom: "Images et photos", chapeau: "Convertir, redimensionner, détourer, photo d'identité et logo." },
  { id: "qr", nom: "QR codes", chapeau: "Créer un QR code (lien, wifi, WhatsApp, avis Google) ou en lire un." },
  { id: "documents", nom: "Documents et modèles", chapeau: "Facture, devis, CV, lettres et attestations, en PDF." },
  { id: "signature", nom: "Signature mail et carte de visite", chapeau: "Signature Gmail ou Outlook, carte de visite QR ou NFC." },
  { id: "calcul", nom: "Calculs", chapeau: "Pourcentage, TVA, marge, dates et âge." },
  { id: "temps", nom: "Temps et tirage au sort", chapeau: "Chronomètre, minuteur, compte à rebours, tirage et roue." },
  { id: "texte", nom: "Texte et clavier", chapeau: "Compter les mots, générer un mot de passe, tester sa frappe." },
];

export interface Outil {
  href: string; // adresse avec barre finale
  court: string; // libellé de menu
  long: string; // libellé de lien (pied de page, renvois)
  description: string; // phrase de la carte sur l'accueil
  categorie: CategorieId;
}

export const OUTILS: Outil[] = [
  // PDF
  { href: "/compresser-pdf/", court: "Compresser un PDF", long: "Compresser un PDF", description: "Réduire le poids d'un PDF pour l'envoyer par e-mail ou le déposer en ligne.", categorie: "pdf" },
  { href: "/fusionner-pdf/", court: "Fusionner des PDF", long: "Fusionner des PDF", description: "Assembler plusieurs PDF en un seul, dans l'ordre choisi.", categorie: "pdf" },
  { href: "/separer-pdf/", court: "Séparer un PDF", long: "Séparer les pages d'un PDF", description: "Extraire des pages ou couper un PDF en plusieurs fichiers.", categorie: "pdf" },
  { href: "/jpg-en-pdf/", court: "JPG en PDF", long: "Convertir JPG en PDF", description: "Transformer une ou plusieurs photos en un document PDF.", categorie: "pdf" },
  { href: "/pdf-en-jpg/", court: "PDF en JPG", long: "Convertir un PDF en JPG", description: "Une image JPG ou PNG par page du PDF.", categorie: "pdf" },
  { href: "/signer-pdf/", court: "Signer un PDF", long: "Signer un PDF", description: "Dessiner ou importer sa signature et la poser sur le document.", categorie: "pdf" },
  // Images
  { href: "/heic-en-jpg/", court: "HEIC en JPG", long: "Convertir HEIC en JPG", description: "Ouvrir les photos d'iPhone au format HEIC et les passer en JPG.", categorie: "image" },
  { href: "/png-en-jpg/", court: "PNG en JPG", long: "Convertir PNG en JPG", description: "Convertir des PNG en JPG plus légers, avec couleur de fond au choix.", categorie: "image" },
  { href: "/webp-en-jpg/", court: "WebP en JPG ou PNG", long: "Convertir WebP en JPG ou PNG", description: "Convertir les images WebP téléchargées du web en JPG ou PNG.", categorie: "image" },
  { href: "/redimensionner-image/", court: "Redimensionner une image", long: "Redimensionner et compresser une image", description: "Changer la taille en pixels et réduire le poids d'une photo.", categorie: "image" },
  { href: "/supprimer-fond-image/", court: "Supprimer le fond", long: "Supprimer le fond d'une image", description: "Rendre transparent un fond uni et retoucher à la gomme.", categorie: "image" },
  { href: "/photo-identite/", court: "Photo d'identité", long: "Photo d'identité 35 × 45 mm", description: "Recadrer une photo au format 35 × 45 mm et l'imprimer en planche.", categorie: "image" },
  { href: "/creer-un-logo/", court: "Créer un logo", long: "Créer un logo gratuit", description: "Un logo texte et icône, exporté en SVG et en PNG.", categorie: "image" },
  // QR codes
  { href: "/generateur-qr-code/", court: "Générateur de QR code", long: "Générateur de QR code gratuit", description: "QR code d'un lien ou d'un texte, en PNG ou SVG, sans expiration.", categorie: "qr" },
  { href: "/qr-code-wifi/", court: "QR code wifi", long: "QR code wifi", description: "Partager le wifi sans dicter le mot de passe.", categorie: "qr" },
  { href: "/qr-code-pdf/", court: "QR code PDF", long: "QR code vers un PDF", description: "Un QR code qui ouvre votre PDF, menu ou plaquette.", categorie: "qr" },
  { href: "/qr-code-whatsapp/", court: "QR code WhatsApp", long: "QR code et lien WhatsApp", description: "Un lien wa.me et son QR code, avec message prérempli.", categorie: "qr" },
  { href: "/qr-code-avis-google/", court: "QR code avis Google", long: "QR code pour avis Google", description: "Le QR code qui ouvre directement la fenêtre d'avis de votre fiche.", categorie: "qr" },
  { href: "/lire-qr-code/", court: "Lire un QR code", long: "Lire un QR code en ligne", description: "Décoder un QR code depuis une image ou une capture d'écran.", categorie: "qr" },
  // Documents
  { href: "/generateur-facture/", court: "Facture", long: "Générateur de facture gratuit", description: "Facture PDF avec les mentions obligatoires, micro-entrepreneur compris.", categorie: "documents" },
  { href: "/generateur-devis/", court: "Devis", long: "Générateur de devis gratuit", description: "Devis PDF chiffré, avec durée de validité et bon pour accord.", categorie: "documents" },
  { href: "/modele-cv/", court: "CV", long: "Modèle de CV gratuit", description: "Remplir un CV clair et le télécharger en PDF.", categorie: "documents" },
  { href: "/lettre-de-resiliation/", court: "Lettre de résiliation", long: "Lettre de résiliation", description: "Résilier un abonnement, une assurance ou un contrat, lettre prête à envoyer.", categorie: "documents" },
  { href: "/attestation-hebergement/", court: "Attestation d'hébergement", long: "Attestation d'hébergement", description: "Attester qu'une personne habite chez vous, avec les pièces à joindre.", categorie: "documents" },
  { href: "/attestation-sur-l-honneur/", court: "Attestation sur l'honneur", long: "Attestation sur l'honneur", description: "Texte libre, vie commune, célibat ou perte de diplôme, à imprimer en PDF.", categorie: "documents" },
  // Signature et carte de visite
  { href: "/signature-mail/", court: "Signature mail", long: "Générateur de signature mail", description: "Signature mail gratuite, à copier dans Gmail, Outlook ou Apple Mail.", categorie: "signature" },
  { href: "/signature-outlook/", court: "Signature Outlook", long: "Signature Outlook", description: "Créer sa signature et l'installer dans chaque version d'Outlook.", categorie: "signature" },
  { href: "/signature-gmail/", court: "Signature Gmail", long: "Signature Gmail", description: "Une signature Gmail avec logo, sur ordinateur et sur mobile.", categorie: "signature" },
  { href: "/carte-de-visite-qr-code/", court: "QR vCard", long: "QR code de carte de visite (vCard)", description: "Le QR code de votre carte de visite : on le scanne, le contact s'enregistre.", categorie: "signature" },
  { href: "/modele-carte-de-visite/", court: "Modèles de carte", long: "Modèles de carte de visite à imprimer", description: "Dix modèles par métier, à adapter puis imprimer en planche A4.", categorie: "signature" },
  { href: "/carte-de-visite-nfc/", court: "Carte NFC ou QR", long: "Carte de visite NFC ou QR code", description: "Comparatif et test en quatre questions pour choisir votre carte.", categorie: "signature" },
  // Calculs
  { href: "/calculer-un-pourcentage/", court: "Pourcentage", long: "Calculer un pourcentage", description: "Pourcentage d'un nombre, évolution, part et hausse ou baisse.", categorie: "calcul" },
  { href: "/calcul-ht-ttc/", court: "HT et TTC", long: "Calcul HT TTC et TVA", description: "Passer du HT au TTC et inversement, à 20 %, 10 %, 5,5 % ou 2,1 %.", categorie: "calcul" },
  { href: "/calcul-marge-commerciale/", court: "Marge commerciale", long: "Calcul de marge commerciale", description: "Marge, taux de marge, taux de marque et coefficient.", categorie: "calcul" },
  { href: "/nombre-de-jours-entre-deux-dates/", court: "Jours entre deux dates", long: "Nombre de jours entre deux dates", description: "Jours calendaires et ouvrés entre deux dates, ou date après N jours.", categorie: "calcul" },
  { href: "/calculateur-age/", court: "Calculateur d'âge", long: "Calculateur d'âge exact", description: "Âge en années, mois et jours, et prochain anniversaire.", categorie: "calcul" },
  // Temps et tirage au sort
  { href: "/chronometre/", court: "Chronomètre", long: "Chronomètre en ligne", description: "Chronomètre au centième, avec tours.", categorie: "temps" },
  { href: "/minuteur/", court: "Minuteur", long: "Minuteur en ligne", description: "Minuteur avec sonnerie : 1, 5, 10 minutes ou durée libre.", categorie: "temps" },
  { href: "/compte-a-rebours/", court: "Compte à rebours", long: "Compte à rebours jusqu'à une date", description: "Jours, heures et minutes restants avant un événement.", categorie: "temps" },
  { href: "/tirage-au-sort/", court: "Tirage au sort", long: "Tirage au sort en ligne", description: "Tirer au sort des prénoms, des gagnants ou des équipes.", categorie: "temps" },
  { href: "/roue-de-la-chance/", court: "Roue de la chance", long: "Roue de la chance", description: "Une roue à tourner avec vos propres choix.", categorie: "temps" },
  // Texte et clavier
  { href: "/compteur-de-mots/", court: "Compteur de mots", long: "Compteur de mots", description: "Mots, phrases, paragraphes et temps de lecture d'un texte.", categorie: "texte" },
  { href: "/compteur-de-caracteres/", court: "Compteur de caractères", long: "Compteur de caractères", description: "Caractères avec et sans espaces, limites des réseaux sociaux.", categorie: "texte" },
  { href: "/generateur-mot-de-passe/", court: "Mot de passe", long: "Générateur de mot de passe", description: "Mot de passe ou phrase de passe aléatoire, et sa robustesse.", categorie: "texte" },
  { href: "/generateur-lorem-ipsum/", court: "Lorem ipsum", long: "Générateur lorem ipsum", description: "Faux texte en paragraphes, phrases ou mots, à copier.", categorie: "texte" },
  { href: "/test-vitesse-de-frappe/", court: "Test de frappe", long: "Test de vitesse de frappe", description: "Mots par minute et précision sur un texte en français.", categorie: "texte" },
];

export const outilsDe = (c: CategorieId) => OUTILS.filter((o) => o.categorie === c);
export const categorieDe = (href: string) => OUTILS.find((o) => o.href === href)?.categorie;
