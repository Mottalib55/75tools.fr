/**
 * Registre des pages-outils, en français et en anglais : une seule liste qui nourrit le menu, le pied
 * de page, les accueils /fr/ et /en/ (regroupés par catégories), les renvois « Autres outils », les
 * snippets (titre, description), le H1 et le chapeau de chaque page, les hreflang, les routes React
 * (App.tsx), le pré-rendu (scripts/prerender.mjs) et le sitemap (scripts/sitemap.mjs).
 *
 * Snippets (RECETTE §11) : titre de 50 à 60 caractères qui s'ouvre sur la requête la plus forte de la
 * page (Keyword Planner France du 2026-10-27, reports/enrichissement-2026-10-27/kp-brut/fr.txt), jamais
 * sur un mot d'outil (« Calcul », « Calculateur », « Calculator »), description de 150 à 160 caractères.
 * Le H1 reprend la requête principale ; le chapeau tient en une ou deux lignes pour que l'outil
 * apparaisse dès le premier écran (RECETTE §5). `scripts/check-snippets.py dist` le vérifie au build.
 */

export type Langue = "fr" | "en";

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
  nom: Record<Langue, string>;
  chapeau: Record<Langue, string>;
}

export const CATEGORIES: Categorie[] = [
  { id: "pdf", nom: { fr: "PDF", en: "PDF" }, chapeau: { fr: "Compresser, fusionner, séparer, convertir et signer, sans envoyer le fichier.", en: "Compress, merge, split, convert and sign, without uploading the file." } },
  { id: "image", nom: { fr: "Images et photos", en: "Images and photos" }, chapeau: { fr: "Convertir, redimensionner, détourer, photo d'identité et logo.", en: "Convert, resize, remove a background, ID photo and logo." } },
  { id: "qr", nom: { fr: "QR codes", en: "QR codes" }, chapeau: { fr: "Créer un QR code (lien, wifi, WhatsApp, avis Google) ou en lire un.", en: "Create a QR code (link, wifi, WhatsApp, Google reviews) or read one." } },
  { id: "documents", nom: { fr: "Documents et modèles", en: "Documents and templates" }, chapeau: { fr: "Facture, devis, CV, lettres et attestations, en PDF.", en: "French invoices, quotes, CVs, letters and statements, as PDF." } },
  { id: "signature", nom: { fr: "Signature mail et carte de visite", en: "Email signature and business card" }, chapeau: { fr: "Signature Gmail ou Outlook, carte de visite QR ou NFC.", en: "Gmail or Outlook signature, QR or NFC business card." } },
  { id: "calcul", nom: { fr: "Calculs", en: "Calculators" }, chapeau: { fr: "Pourcentage, TVA, marge, dates et âge.", en: "Percentages, French VAT, margin, dates and age." } },
  { id: "temps", nom: { fr: "Temps et tirage au sort", en: "Time and random draws" }, chapeau: { fr: "Chronomètre, minuteur, compte à rebours, tirage et roue.", en: "Stopwatch, timer, countdown, random picker and wheel." } },
  { id: "texte", nom: { fr: "Texte et clavier", en: "Text and keyboard" }, chapeau: { fr: "Compter les mots, générer un mot de passe, tester sa frappe.", en: "Count words, generate a password, test your typing." } },
];

/** Ce qu'une page affiche et déclare dans une langue. */
export interface FicheLangue {
  href: string; // adresse avec barre finale
  court: string; // libellé de menu
  long: string; // libellé de lien (pied de page, renvois)
  carte: string; // phrase de la carte sur l'accueil
  titre: string; // <title>, 50 à 60 caractères, requête en tête
  meta: string; // meta description, 150 à 160 caractères
  h1: string; // reprend la requête principale
  chapeau: string; // une ou deux lignes au-dessus de l'outil
}

export interface Outil {
  id: string; // identifiant stable (= adresse française sans barres)
  categorie: CategorieId;
  fr: FicheLangue;
  en: FicheLangue;
}

export const OUTILS: Outil[] = [
  // ───────────────────────── PDF
  {
    id: "compresser-pdf", categorie: "pdf",
    fr: { href: "/compresser-pdf/", court: "Compresser un PDF", long: "Compresser un PDF", carte: "Réduire le poids d'un PDF pour l'envoyer par e-mail ou le déposer en ligne.",
      titre: "Compresser PDF gratuit : réduire la taille d'un PDF en ligne",
      meta: "Compresser un PDF gratuitement : réduisez son poids pour l'envoyer par e-mail ou le déposer sur un site. Poids avant et après affichés, rien n'est envoyé.",
      h1: "Compresser un PDF gratuitement", chapeau: "Déposez le PDF, choisissez le niveau de compression et comparez le poids avant et après." },
    en: { href: "/en/compress-pdf/", court: "Compress PDF", long: "Compress a PDF", carte: "Shrink a PDF so it fits an email or an online upload form.",
      titre: "Compress PDF Free: Reduce PDF File Size Online, No Upload",
      meta: "Compress a PDF for free in your browser: shrink it for an email or an admin upload form, with the size before and after. The file never leaves your device.",
      h1: "Compress a PDF for free", chapeau: "Drop your PDF, pick a compression level and compare the file size before and after." },
  },
  {
    id: "fusionner-pdf", categorie: "pdf",
    fr: { href: "/fusionner-pdf/", court: "Fusionner des PDF", long: "Fusionner des PDF", carte: "Assembler plusieurs PDF en un seul, dans l'ordre choisi.",
      titre: "Fusionner PDF gratuit : assembler plusieurs PDF en un seul",
      meta: "Fusionner des PDF gratuitement : ajoutez vos fichiers, mettez-les dans l'ordre voulu et obtenez un seul PDF. Pages comptées, aucun envoi, sans inscription.",
      h1: "Fusionner des PDF gratuitement", chapeau: "Ajoutez vos PDF, rangez-les dans l'ordre voulu et téléchargez un seul fichier." },
    en: { href: "/en/merge-pdf/", court: "Merge PDF", long: "Merge PDF files", carte: "Combine several PDFs into one, in the order you choose.",
      titre: "Merge PDF Free: Combine Several PDF Files Into One Online",
      meta: "Merge PDF files for free: add your documents, drag them into the right order and download a single PDF. Page count shown, no upload, no sign-up, no watermark.",
      h1: "Merge PDF files for free", chapeau: "Add your PDFs, put them in the right order and download one single file." },
  },
  {
    id: "separer-pdf", categorie: "pdf",
    fr: { href: "/separer-pdf/", court: "Séparer un PDF", long: "Séparer les pages d'un PDF", carte: "Extraire des pages ou couper un PDF en plusieurs fichiers.",
      titre: "Séparer les pages d'un PDF : diviser un PDF en ligne gratuit",
      meta: "Séparer les pages d'un PDF : extrayez les pages choisies (1-3, 5, 8-10), un fichier par plage ou un par page en ZIP. Vignettes des pages, gratuit, aucun envoi.",
      h1: "Séparer les pages d'un PDF", chapeau: "Choisissez les pages à garder ou à découper, puis téléchargez un ou plusieurs PDF." },
    en: { href: "/en/split-pdf/", court: "Split PDF", long: "Split a PDF into pages", carte: "Extract pages or cut a PDF into several files.",
      titre: "Split PDF Free: Extract Pages or Separate a PDF Online",
      meta: "Split a PDF for free: extract the pages you need (1-3, 5, 8-10), one file per range or one per page in a ZIP. Page thumbnails, nothing uploaded, no sign-up.",
      h1: "Split a PDF and extract pages", chapeau: "Pick the pages to keep or cut, then download one or several PDF files." },
  },
  {
    id: "jpg-en-pdf", categorie: "pdf",
    fr: { href: "/jpg-en-pdf/", court: "JPG en PDF", long: "Convertir JPG en PDF", carte: "Transformer une ou plusieurs photos en un document PDF.",
      titre: "Convertir JPG en PDF gratuit : photos et images en un PDF",
      meta: "Convertir JPG en PDF gratuitement : une ou plusieurs photos (JPG, PNG, WebP) en un PDF, dans l'ordre voulu, en A4, Lettre ou taille de l'image. Aucun envoi.",
      h1: "Convertir JPG en PDF", chapeau: "Ajoutez vos photos, réglez le format de page et téléchargez un seul PDF." },
    en: { href: "/en/jpg-to-pdf/", court: "JPG to PDF", long: "Convert JPG to PDF", carte: "Turn one or several photos into a single PDF document.",
      titre: "JPG to PDF Free: Convert Photos and Images Into One PDF",
      meta: "Convert JPG to PDF for free: one or several photos (JPG, PNG, WebP) in one PDF, in the order you want, on A4, Letter or image size. Nothing is ever uploaded.",
      h1: "Convert JPG to PDF", chapeau: "Add your photos, choose the page size and download a single PDF." },
  },
  {
    id: "pdf-en-jpg", categorie: "pdf",
    fr: { href: "/pdf-en-jpg/", court: "PDF en JPG", long: "Convertir un PDF en JPG", carte: "Une image JPG ou PNG par page du PDF.",
      titre: "Convertir PDF en JPG gratuit : chaque page en image en ligne",
      meta: "Convertir un PDF en JPG gratuitement : chaque page devient une image JPG ou PNG, en 72, 150 ou 300 dpi. Pages au choix, téléchargement page par page ou en ZIP.",
      h1: "Convertir un PDF en JPG", chapeau: "Déposez le PDF, choisissez la résolution et récupérez une image par page." },
    en: { href: "/en/pdf-to-jpg/", court: "PDF to JPG", long: "Convert PDF to JPG", carte: "One JPG or PNG image per page of the PDF.",
      titre: "PDF to JPG Free: Convert Every PDF Page to an Image Online",
      meta: "Convert a PDF to JPG for free: each page becomes a JPG or PNG image at 72, 150 or 300 dpi. Choose the pages, download them one by one or as a ZIP, no upload.",
      h1: "Convert PDF to JPG", chapeau: "Drop the PDF, choose the resolution and get one image per page." },
  },
  {
    id: "signer-pdf", categorie: "pdf",
    fr: { href: "/signer-pdf/", court: "Signer un PDF", long: "Signer un PDF", carte: "Dessiner ou importer sa signature et la poser sur le document.",
      titre: "Ajouter une signature sur un PDF : signer en ligne gratuit",
      meta: "Ajouter une signature sur un PDF gratuitement : dessinez-la ou importez-la, placez-la sur la bonne page, ajoutez la date ou « Lu et approuvé ». Aucun envoi.",
      h1: "Ajouter une signature sur un PDF", chapeau: "Ouvrez le PDF, dessinez ou importez votre signature, posez-la puis téléchargez." },
    en: { href: "/en/sign-pdf/", court: "Sign PDF", long: "Sign a PDF", carte: "Draw or import your signature and place it on the document.",
      titre: "Sign PDF Free: Add Your Signature to a PDF Online, No Upload",
      meta: "Sign a PDF for free: draw or import your signature, place it on the right page, add the date or the French « Lu et approuvé » mention. Nothing is ever uploaded.",
      h1: "Sign a PDF online for free", chapeau: "Open the PDF, draw or import your signature, place it and download." },
  },
  // ───────────────────────── Images
  {
    id: "heic-en-jpg", categorie: "image",
    fr: { href: "/heic-en-jpg/", court: "HEIC en JPG", long: "Convertir HEIC en JPG", carte: "Ouvrir les photos d'iPhone au format HEIC et les passer en JPG.",
      titre: "Convertir HEIC en JPG gratuit : photos d'iPhone en ligne",
      meta: "Convertir HEIC en JPG en ligne et gratuit : déposez vos photos d'iPhone, réglez la qualité, récupérez des JPG ou un ZIP. Aucun envoi, tout reste sur l'appareil.",
      h1: "Convertir HEIC en JPG", chapeau: "Déposez vos photos d'iPhone et récupérez des JPG, une par une ou en ZIP." },
    en: { href: "/en/heic-to-jpg/", court: "HEIC to JPG", long: "Convert HEIC to JPG", carte: "Open iPhone HEIC photos and turn them into JPG.",
      titre: "HEIC to JPG Free: Convert iPhone Photos Online, No Upload",
      meta: "Convert HEIC to JPG for free: drop your iPhone photos, set the quality and get JPG files one by one or as a ZIP. No upload, everything stays on your device.",
      h1: "Convert HEIC to JPG", chapeau: "Drop your iPhone photos and get JPG files, one by one or as a ZIP." },
  },
  {
    id: "png-en-jpg", categorie: "image",
    fr: { href: "/png-en-jpg/", court: "PNG en JPG", long: "Convertir PNG en JPG", carte: "Convertir des PNG en JPG plus légers, avec couleur de fond au choix.",
      titre: "Convertir PNG en JPG gratuit : en ligne, couleur de fond",
      meta: "Convertir PNG en JPG en ligne et gratuit : plusieurs images à la fois, couleur de fond pour la transparence, qualité réglable, poids avant et après, ZIP.",
      h1: "Convertir PNG en JPG", chapeau: "Déposez vos PNG, choisissez la couleur de fond et la qualité, puis téléchargez." },
    en: { href: "/en/png-to-jpg/", court: "PNG to JPG", long: "Convert PNG to JPG", carte: "Turn PNG files into lighter JPGs, with the background colour you choose.",
      titre: "PNG to JPG Free: Convert Images Online With a Background",
      meta: "Convert PNG to JPG for free: several images at once, a background colour for transparent areas, adjustable quality, size before and after, ZIP download.",
      h1: "Convert PNG to JPG", chapeau: "Drop your PNG files, pick a background colour and quality, then download." },
  },
  {
    id: "webp-en-jpg", categorie: "image",
    fr: { href: "/webp-en-jpg/", court: "WebP en JPG ou PNG", long: "Convertir WebP en JPG ou PNG", carte: "Convertir les images WebP téléchargées du web en JPG ou PNG.",
      titre: "Convertir WebP en JPG ou PNG gratuit : en ligne, sans envoi",
      meta: "Convertir WebP en JPG ou en PNG en ligne et gratuit : déposez les images WebP enregistrées sur le web, choisissez le format, récupérez-les une à une ou en ZIP.",
      h1: "Convertir WebP en JPG ou PNG", chapeau: "Déposez vos images WebP, choisissez JPG ou PNG et téléchargez-les." },
    en: { href: "/en/webp-to-jpg/", court: "WebP to JPG or PNG", long: "Convert WebP to JPG or PNG", carte: "Convert WebP images saved from the web into JPG or PNG.",
      titre: "WebP to JPG Free: Convert WebP to JPG or PNG, No Upload",
      meta: "Convert WebP to JPG or PNG for free: drop the WebP images saved from websites, choose the format and download them one by one or as a ZIP. Nothing is uploaded.",
      h1: "Convert WebP to JPG or PNG", chapeau: "Drop your WebP images, choose JPG or PNG and download them." },
  },
  {
    id: "redimensionner-image", categorie: "image",
    fr: { href: "/redimensionner-image/", court: "Redimensionner une image", long: "Redimensionner et compresser une image", carte: "Changer la taille en pixels et réduire le poids d'une photo.",
      titre: "Redimensionner une image en ligne : pixels, %, poids en Ko",
      meta: "Redimensionner une image en ligne gratuitement : largeur en pixels, pourcentage ou poids maximal en Ko pour un formulaire. Plusieurs photos, ZIP, sans envoi.",
      h1: "Redimensionner une image en ligne", chapeau: "Déposez vos photos, indiquez la taille en pixels ou le poids maximal en Ko." },
    en: { href: "/en/resize-image/", court: "Resize image", long: "Resize and compress an image", carte: "Change the size in pixels and reduce the weight of a photo.",
      titre: "Resize Image Online Free: Pixels, Percent or Max Size in KB",
      meta: "Resize an image online for free: width in pixels, a percentage or a maximum size in KB for an upload form. Several photos at once, ZIP, nothing uploaded.",
      h1: "Resize an image online", chapeau: "Drop your photos and set the size in pixels or the maximum weight in KB." },
  },
  {
    id: "supprimer-fond-image", categorie: "image",
    fr: { href: "/supprimer-fond-image/", court: "Supprimer le fond", long: "Supprimer le fond d'une image", carte: "Rendre transparent un fond uni et retoucher à la gomme.",
      titre: "Détourer une image en ligne : supprimer le fond gratuitement",
      meta: "Détourer une image gratuitement : cliquez sur le fond pour l'effacer, réglez la tolérance, retouchez à la gomme et exportez un PNG transparent. Sans envoi.",
      h1: "Détourer une image en ligne", chapeau: "Ouvrez l'image, cliquez sur le fond à effacer, retouchez puis téléchargez le PNG." },
    en: { href: "/en/remove-background/", court: "Remove background", long: "Remove an image background", carte: "Make a plain background transparent and touch up with an eraser.",
      titre: "Remove Background From Image Free: Transparent PNG Online",
      meta: "Remove an image background for free: click the background to erase it, set the tolerance, touch up with the eraser and export a transparent PNG. No upload.",
      h1: "Remove the background from an image", chapeau: "Open the image, click the background to erase, touch up, then download the PNG." },
  },
  {
    id: "photo-identite", categorie: "image",
    fr: { href: "/photo-identite/", court: "Photo d'identité", long: "Photo d'identité 35 × 45 mm", carte: "Recadrer une photo au format 35 × 45 mm et l'imprimer en planche.",
      titre: "Photo d'identité en ligne : recadrage 35 x 45 mm et planche",
      meta: "Photo d'identité en ligne : recadrez au format 35 x 45 mm avec un gabarit de visage, puis téléchargez la photo ou une planche 10 x 15 à faire tirer. Gratuit.",
      h1: "Photo d'identité en ligne au format 35 × 45 mm", chapeau: "Ouvrez une photo, alignez le visage sur le gabarit et téléchargez la planche à tirer." },
    en: { href: "/en/passport-photo/", court: "ID photo", long: "French ID and passport photo 35 × 45 mm", carte: "Crop a photo to 35 × 45 mm and print it as a sheet.",
      titre: "Passport Photo Online: 35 x 45 mm French ID Photo, Free",
      meta: "Make a passport photo: crop to 35 x 45 mm with a face guide for French ID cards, passports and residence permits, then download a 10 x 15 print sheet. Free.",
      h1: "Passport and ID photo online, 35 × 45 mm", chapeau: "Open a photo, align the face with the guide and download the print sheet." },
  },
  {
    id: "creer-un-logo", categorie: "image",
    fr: { href: "/creer-un-logo/", court: "Créer un logo", long: "Créer un logo gratuit", carte: "Un logo texte et icône, exporté en SVG et en PNG.",
      titre: "Créer un logo gratuit en ligne : texte, icône, SVG et PNG",
      meta: "Créer un logo gratuit en ligne : nom, accroche, icône, police et couleurs, trois dispositions, export SVG et PNG transparent jusqu'à 5 000 px. Sans compte.",
      h1: "Créer un logo gratuit", chapeau: "Tapez le nom, choisissez une icône, une police et des couleurs, puis exportez." },
    en: { href: "/en/logo-maker/", court: "Logo maker", long: "Free logo maker", carte: "A text and icon logo, exported as SVG and PNG.",
      titre: "Logo Maker Free: Create a Text and Icon Logo, SVG and PNG",
      meta: "Free logo maker: name, tagline, icon, font and colours, three layouts, export SVG or transparent PNG up to 5,000 px. No account, no watermark, nothing uploaded.",
      h1: "Free logo maker", chapeau: "Type the name, pick an icon, a font and colours, then export." },
  },
  // ───────────────────────── QR codes
  {
    id: "generateur-qr-code", categorie: "qr",
    fr: { href: "/generateur-qr-code/", court: "Générateur de QR code", long: "Générateur de QR code gratuit", carte: "QR code d'un lien ou d'un texte, en PNG ou SVG, sans expiration.",
      titre: "Créer un QR code gratuit : générateur PNG et SVG sans limite",
      meta: "Créer un QR code gratuit et sans inscription : un lien ou un texte, couleurs, marge, correction L à H, en PNG ou SVG. Un QR code statique qui n'expire jamais.",
      h1: "Créer un QR code gratuit", chapeau: "Collez un lien ou un texte : le QR code s'affiche aussitôt, prêt à télécharger." },
    en: { href: "/en/qr-code-generator/", court: "QR code generator", long: "Free QR code generator", carte: "A QR code for a link or a text, as PNG or SVG, that never expires.",
      titre: "QR Code Generator Free: PNG and SVG, No Sign-up, No Expiry",
      meta: "Free QR code generator with no sign-up: a link or a text, colours, margin, error correction L to H, as PNG or SVG. A static QR code that never expires.",
      h1: "Free QR code generator", chapeau: "Paste a link or a text: the QR code appears at once, ready to download." },
  },
  {
    id: "qr-code-wifi", categorie: "qr",
    fr: { href: "/qr-code-wifi/", court: "QR code wifi", long: "QR code wifi", carte: "Partager le wifi sans dicter le mot de passe.",
      titre: "Générateur QR code wifi gratuit : le réseau en un seul scan",
      meta: "Générateur de QR code wifi gratuit : nom du réseau, mot de passe, WPA, WEP ou réseau ouvert, et une carte à imprimer. Vos invités se connectent sans rien taper.",
      h1: "Générateur de QR code wifi", chapeau: "Saisissez le nom du réseau et le mot de passe : le QR code et la carte s'affichent." },
    en: { href: "/en/wifi-qr-code/", court: "Wifi QR code", long: "Wifi QR code", carte: "Share your wifi without spelling out the password.",
      titre: "WiFi QR Code Generator Free: Share Your Network in One Scan",
      meta: "Free WiFi QR code generator: network name, password, WPA, WEP or open network, plus a card to print. Guests join by scanning with the camera, no typing.",
      h1: "WiFi QR code generator", chapeau: "Enter the network name and password: the QR code and the card appear." },
  },
  {
    id: "qr-code-pdf", categorie: "qr",
    fr: { href: "/qr-code-pdf/", court: "QR code PDF", long: "QR code vers un PDF", carte: "Un QR code qui ouvre votre PDF, menu ou plaquette.",
      titre: "QR code PDF gratuit : un code qui ouvre votre document",
      meta: "QR code PDF gratuit : collez le lien de votre PDF en ligne (Google Drive, Dropbox, OneDrive ou votre site), vérifiez le partage et obtenez le code PNG ou SVG.",
      h1: "Créer un QR code pour un PDF", chapeau: "Collez le lien de partage de votre PDF : le QR code s'affiche, prêt à imprimer." },
    en: { href: "/en/pdf-qr-code/", court: "PDF QR code", long: "QR code for a PDF", carte: "A QR code that opens your PDF, menu or brochure.",
      titre: "PDF QR Code Free: Make a QR Code That Opens Your Document",
      meta: "Make a PDF QR code for free: paste the link to your PDF online (Google Drive, Dropbox, OneDrive or your website), check the sharing setting and get PNG or SVG.",
      h1: "Create a QR code for a PDF", chapeau: "Paste your PDF's sharing link: the QR code appears, ready to print." },
  },
  {
    id: "qr-code-whatsapp", categorie: "qr",
    fr: { href: "/qr-code-whatsapp/", court: "QR code WhatsApp", long: "QR code et lien WhatsApp", carte: "Un lien wa.me et son QR code, avec message prérempli.",
      titre: "QR code WhatsApp gratuit : lien wa.me et message prérempli",
      meta: "QR code WhatsApp gratuit : votre numéro mis au format international, un message prérempli, le lien wa.me à copier et son QR code en PNG ou SVG, sans compte.",
      h1: "QR code WhatsApp et lien wa.me", chapeau: "Saisissez votre numéro et un message : le lien wa.me et son QR code s'affichent." },
    en: { href: "/en/whatsapp-qr-code/", court: "WhatsApp QR code", long: "WhatsApp QR code and link", carte: "A wa.me link and its QR code, with a pre-filled message.",
      titre: "WhatsApp QR Code Free: wa.me Link With a Pre-filled Message",
      meta: "Free WhatsApp QR code: your number in international format, a pre-filled message, the wa.me link to copy and its QR code as PNG or SVG. Nothing stored.",
      h1: "WhatsApp QR code and wa.me link", chapeau: "Enter your number and a message: the wa.me link and its QR code appear." },
  },
  {
    id: "qr-code-avis-google", categorie: "qr",
    fr: { href: "/qr-code-avis-google/", court: "QR code avis Google", long: "QR code pour avis Google", carte: "Le QR code qui ouvre directement la fenêtre d'avis de votre fiche.",
      titre: "QR code avis Google gratuit : lien et affiche à imprimer",
      meta: "QR code avis Google gratuit : collez le lien d'avis de votre fiche d'établissement ou son identifiant de lieu, puis imprimez l'affiche ou téléchargez le code.",
      h1: "QR code avis Google", chapeau: "Collez le lien d'avis de votre fiche Google : le QR code et l'affiche s'affichent." },
    en: { href: "/en/google-review-qr-code/", court: "Google review QR code", long: "Google review QR code", carte: "The QR code that opens the review window of your Business Profile.",
      titre: "Google Review QR Code Free: Review Link and Printable Poster",
      meta: "Free Google review QR code: paste the review link of your Business Profile or its Place ID, then print the counter poster or download the code as PNG or SVG.",
      h1: "Google review QR code", chapeau: "Paste your Google review link: the QR code and the poster appear." },
  },
  {
    id: "lire-qr-code", categorie: "qr",
    fr: { href: "/lire-qr-code/", court: "Lire un QR code", long: "Lire un QR code en ligne", carte: "Décoder un QR code depuis une image ou une capture d'écran.",
      titre: "Lire un QR code en ligne : depuis une image ou la caméra",
      meta: "Lire un QR code en ligne : importez une image, collez une capture d'écran ou utilisez la caméra. Le lien ne s'ouvre jamais tout seul et rien n'est envoyé.",
      h1: "Lire un QR code en ligne", chapeau: "Importez une image, collez une capture ou ouvrez la caméra : le contenu s'affiche." },
    en: { href: "/en/qr-code-reader/", court: "QR code reader", long: "Read a QR code online", carte: "Decode a QR code from an image or a screenshot.",
      titre: "QR Code Reader Online: Scan From an Image or Your Camera",
      meta: "Read a QR code online: upload an image, paste a screenshot or use your camera. The link never opens on its own, you see it first, and nothing is sent anywhere.",
      h1: "Read a QR code online", chapeau: "Upload an image, paste a screenshot or open the camera: the content appears." },
  },
  // ───────────────────────── Documents
  {
    id: "generateur-facture", categorie: "documents",
    fr: { href: "/generateur-facture/", court: "Facture", long: "Générateur de facture gratuit", carte: "Facture PDF avec les mentions obligatoires, micro-entrepreneur compris.",
      titre: "Créer une facture en ligne gratuite : PDF auto-entrepreneur",
      meta: "Créer une facture en ligne gratuite : micro-entrepreneur, EI ou société, TVA par taux ou franchise 293 B, mentions obligatoires ajoutées, PDF sans inscription.",
      h1: "Créer une facture en ligne gratuite", chapeau: "Remplissez vendeur, client et lignes : la facture se met en page, mentions comprises." },
    en: { href: "/en/invoice-generator/", court: "Invoice", long: "French invoice generator", carte: "A French-compliant PDF invoice, micro-entrepreneur included.",
      titre: "Invoice Generator France 2026: Free PDF With Legal Mentions",
      meta: "Free invoice generator for France: micro-entrepreneur, EI or company, VAT by rate or 293 B exemption, mandatory French mentions added, PDF with no sign-up.",
      h1: "Invoice generator for France", chapeau: "Fill in seller, client and lines: the invoice is laid out with the French mentions." },
  },
  {
    id: "generateur-devis", categorie: "documents",
    fr: { href: "/generateur-devis/", court: "Devis", long: "Générateur de devis gratuit", carte: "Devis PDF chiffré, avec durée de validité et bon pour accord.",
      titre: "Faire un devis en ligne gratuit : modèle de devis PDF 2026",
      meta: "Faire un devis en ligne gratuit : lignes chiffrées, TVA par taux, frais de déplacement, acompte, validité et bon pour accord. Modèle de devis PDF sans compte.",
      h1: "Faire un devis en ligne gratuit", chapeau: "Remplissez les lignes et les conditions : le devis se met en page, prêt en PDF." },
    en: { href: "/en/quote-generator/", court: "Quote", long: "French quote (devis) generator", carte: "A priced PDF quote with validity period and client approval box.",
      titre: "Quote Generator France: Free Devis Template as a PDF, 2026",
      meta: "Make a French quote (devis) online for free: priced lines, VAT by rate, travel costs, deposit, validity and « bon pour accord » approval box. PDF, no account.",
      h1: "Quote (devis) generator for France", chapeau: "Fill in the lines and terms: the devis is laid out, ready as a PDF." },
  },
  {
    id: "modele-cv", categorie: "documents",
    fr: { href: "/modele-cv/", court: "CV", long: "Modèle de CV gratuit", carte: "Remplir un CV clair et le télécharger en PDF.",
      titre: "Modèle CV gratuit : créer un CV en ligne, export PDF",
      meta: "Modèle CV gratuit en trois mises en page : remplissez expériences, formations, compétences et langues CECRL, photo facultative, puis enregistrez-le en PDF A4.",
      h1: "Modèle de CV gratuit à remplir en ligne", chapeau: "Choisissez une mise en page, remplissez les rubriques et enregistrez le CV en PDF." },
    en: { href: "/en/cv-template/", court: "CV", long: "Free CV template", carte: "Fill in a clear CV and download it as a PDF.",
      titre: "CV Template Free: Build a CV Online for France, PDF Export",
      meta: "Free CV template in three layouts for jobs in France: experience, education, skills and CEFR language levels, optional photo, then save it as an A4 PDF.",
      h1: "Free CV template to fill in online", chapeau: "Choose a layout, fill in the sections and save your CV as a PDF." },
  },
  {
    id: "lettre-de-resiliation", categorie: "documents",
    fr: { href: "/lettre-de-resiliation/", court: "Lettre de résiliation", long: "Lettre de résiliation", carte: "Résilier un abonnement, une assurance ou un contrat, lettre prête à envoyer.",
      titre: "Lettre de résiliation : modèle gratuit à remplir en ligne",
      meta: "Lettre de résiliation modèle gratuit : box, mobile, assurance, mutuelle, salle de sport ou abonnement. Motif, délai et date d'effet, puis impression ou PDF.",
      h1: "Lettre de résiliation : modèle gratuit", chapeau: "Choisissez le contrat, remplissez vos coordonnées : la lettre se rédige à côté." },
    en: { href: "/en/cancellation-letter/", court: "Cancellation letter", long: "French cancellation letter", carte: "Cancel a subscription, insurance or contract with a ready-to-send letter.",
      titre: "Cancellation Letter France: Free Template in French, 2026",
      meta: "Free French cancellation letter template: internet box, mobile, insurance, mutuelle, gym or subscription. Reason, notice and end date, then print or save a PDF.",
      h1: "Cancellation letter for a French contract", chapeau: "Pick the contract and fill in your details: the French letter is written next to it." },
  },
  {
    id: "attestation-hebergement", categorie: "documents",
    fr: { href: "/attestation-hebergement/", court: "Attestation d'hébergement", long: "Attestation d'hébergement", carte: "Attester qu'une personne habite chez vous, avec les pièces à joindre.",
      titre: "Attestation d'hébergement : modèle gratuit à imprimer",
      meta: "Attestation d'hébergement modèle gratuit à remplir en ligne : hébergeant, hébergé, adresse et date d'arrivée, d'après Service Public. Impression ou PDF.",
      h1: "Attestation d'hébergement : modèle gratuit", chapeau: "Remplissez hébergeant et hébergé : l'attestation se rédige, prête à imprimer." },
    en: { href: "/en/proof-of-accommodation/", court: "Proof of accommodation", long: "Attestation d'hébergement (proof of accommodation)", carte: "Certify that someone lives at your address, with the documents to attach.",
      titre: "Proof of Accommodation France: Attestation d'hébergement",
      meta: "Free proof of accommodation for France (attestation d'hébergement): host, guest, address and arrival date, per Service Public. Written in French, print or PDF.",
      h1: "Proof of accommodation letter (attestation d'hébergement)", chapeau: "Fill in host and guest: the French attestation is written, ready to print." },
  },
  {
    id: "attestation-sur-l-honneur", categorie: "documents",
    fr: { href: "/attestation-sur-l-honneur/", court: "Attestation sur l'honneur", long: "Attestation sur l'honneur", carte: "Texte libre, vie commune, célibat ou perte de diplôme, à imprimer en PDF.",
      titre: "Attestation sur l'honneur : modèle gratuit à remplir en PDF",
      meta: "Attestation sur l'honneur modèle gratuit à remplir : texte libre ou modèle (vie commune, célibat, perte de diplôme). Texte modifiable, impression ou PDF.",
      h1: "Attestation sur l'honneur : modèle gratuit", chapeau: "Choisissez un modèle ou écrivez librement : l'attestation se met en page." },
    en: { href: "/en/sworn-statement/", court: "Sworn statement", long: "Attestation sur l'honneur (sworn statement)", carte: "Free text, cohabitation, single status or lost diploma, printable as PDF.",
      titre: "Sworn Statement France: Attestation sur l'honneur Template",
      meta: "French sworn statement template (attestation sur l'honneur): free text or a model for cohabitation, single status or a lost diploma. Editable, print or PDF.",
      h1: "Sworn statement template (attestation sur l'honneur)", chapeau: "Pick a model or write freely: the French statement is laid out for you." },
  },
  // ───────────────────────── Signature et carte de visite
  {
    id: "signature-mail", categorie: "signature",
    fr: { href: "/signature-mail/", court: "Signature mail", long: "Générateur de signature mail", carte: "Signature mail gratuite, à copier dans Gmail, Outlook ou Apple Mail.",
      titre: "Signature mail gratuite : générateur pour Gmail et Outlook",
      meta: "Signature mail professionnelle gratuite : nom, poste, photo, liens, couleur, aperçu en direct, copie en un clic pour Gmail, Outlook et Apple Mail. Sans compte.",
      h1: "Signature mail gratuite", chapeau: "Remplissez vos coordonnées : l'aperçu se met à jour, copiez la signature en un clic." },
    en: { href: "/en/email-signature/", court: "Email signature", long: "Email signature generator", carte: "A free email signature to paste into Gmail, Outlook or Apple Mail.",
      titre: "Email Signature Generator Free: Gmail, Outlook, Apple Mail",
      meta: "Free professional email signature generator: name, title, photo, links, colour, live preview and one-click copy for Gmail, Outlook and Apple Mail. No account.",
      h1: "Free email signature generator", chapeau: "Fill in your details: the preview updates, then copy the signature in one click." },
  },
  {
    id: "signature-outlook", categorie: "signature",
    fr: { href: "/signature-outlook/", court: "Signature Outlook", long: "Signature Outlook", carte: "Créer sa signature et l'installer dans chaque version d'Outlook.",
      titre: "Créer une signature Outlook : modèle gratuit et installation",
      meta: "Créer une signature Outlook gratuite : générez-la, copiez-la ou téléchargez le .htm, puis installez-la dans le nouvel Outlook, Outlook classique, Mac ou mobile.",
      h1: "Créer une signature Outlook", chapeau: "Remplissez vos coordonnées, copiez la signature et suivez l'installation pour votre Outlook." },
    en: { href: "/en/outlook-signature/", court: "Outlook signature", long: "Outlook signature", carte: "Create your signature and install it in every version of Outlook.",
      titre: "Outlook Signature: Free Template and How to Install It",
      meta: "Create a free Outlook signature: generate it, copy it or download the .htm file, then install it in new Outlook, classic Outlook, Outlook for Mac or on mobile.",
      h1: "Create an Outlook signature", chapeau: "Fill in your details, copy the signature and follow the steps for your Outlook." },
  },
  {
    id: "signature-gmail", categorie: "signature",
    fr: { href: "/signature-gmail/", court: "Signature Gmail", long: "Signature Gmail", carte: "Une signature Gmail avec logo, sur ordinateur et sur mobile.",
      titre: "Créer une signature Gmail avec logo : générateur gratuit",
      meta: "Créer une signature Gmail avec logo, liens et couleur : générez-la, collez-la dans Gmail, réglez la version mobile et restez sous la limite de caractères.",
      h1: "Créer une signature Gmail", chapeau: "Remplissez vos coordonnées, copiez la signature et collez-la dans Gmail." },
    en: { href: "/en/gmail-signature/", court: "Gmail signature", long: "Gmail signature", carte: "A Gmail signature with a logo, on desktop and on mobile.",
      titre: "Gmail Signature With Logo: Free Generator, Copy and Paste",
      meta: "Create a free Gmail signature with a logo, links and colour: generate it, paste it into Gmail, set the mobile version and stay under the character limit.",
      h1: "Create a Gmail signature", chapeau: "Fill in your details, copy the signature and paste it into Gmail." },
  },
  {
    id: "carte-de-visite-qr-code", categorie: "signature",
    fr: { href: "/carte-de-visite-qr-code/", court: "QR vCard", long: "QR code de carte de visite (vCard)", carte: "Le QR code de votre carte de visite : on le scanne, le contact s'enregistre.",
      titre: "QR code vCard gratuit : carte de visite QR code en ligne",
      meta: "QR code vCard gratuit pour carte de visite : vos coordonnées au format vCard, à scanner avec l'appareil photo pour créer le contact. PNG et SVG, sans compte.",
      h1: "QR code vCard pour carte de visite", chapeau: "Remplissez vos coordonnées : le QR code vCard s'affiche, prêt à imprimer." },
    en: { href: "/en/vcard-qr-code/", court: "vCard QR code", long: "Business card QR code (vCard)", carte: "Your business card QR code: scan it and the contact is saved.",
      titre: "vCard QR Code Free: Business Card QR Code Generator Online",
      meta: "Free vCard QR code for your business card: your details in vCard format, scanned with any phone camera to save the contact. PNG and SVG download, no account.",
      h1: "vCard QR code for business cards", chapeau: "Fill in your details: the vCard QR code appears, ready to print." },
  },
  {
    id: "modele-carte-de-visite", categorie: "signature",
    fr: { href: "/modele-carte-de-visite/", court: "Modèles de carte", long: "Modèles de carte de visite à imprimer", carte: "Dix modèles par métier, à adapter puis imprimer en planche A4.",
      titre: "Modèle carte de visite : 10 exemples par métier à imprimer",
      meta: "Modèle de carte de visite gratuit pour artisan, coach, agent immobilier, avocat… Texte modifiable, planche A4 de 10 cartes 85 × 55 mm à imprimer ou en PDF.",
      h1: "Modèle de carte de visite par métier", chapeau: "Choisissez un métier, modifiez le texte et imprimez la planche de 10 cartes." },
    en: { href: "/en/business-card-templates/", court: "Card templates", long: "Printable business card templates", carte: "Ten templates by trade, to adapt and print on an A4 sheet.",
      titre: "Business Card Templates: 10 Free Designs by Trade to Print",
      meta: "Free business card templates for tradespeople, coaches, estate agents, lawyers and more. Editable text, A4 sheet of 10 cards at 85 x 55 mm to print or as PDF.",
      h1: "Business card templates by trade", chapeau: "Pick a trade, edit the text and print the sheet of 10 cards." },
  },
  {
    id: "carte-de-visite-nfc", categorie: "signature",
    fr: { href: "/carte-de-visite-nfc/", court: "Carte NFC ou QR", long: "Carte de visite NFC ou QR code", carte: "Comparatif et test en quatre questions pour choisir votre carte.",
      titre: "Carte de visite NFC ou QR code : laquelle choisir en 2026 ?",
      meta: "Carte de visite NFC ou QR code : fonctionnement, compatibilité iPhone et Android, coût, limites. Un comparatif honnête et un test en 4 questions pour choisir.",
      h1: "Carte de visite NFC ou QR code : laquelle choisir ?", chapeau: "Répondez à quatre questions : le test vous dit quelle carte vous convient." },
    en: { href: "/en/nfc-business-card/", court: "NFC or QR card", long: "NFC or QR code business card", carte: "Comparison and a four-question test to choose your card.",
      titre: "NFC Business Card or QR Code: Which One to Choose in 2026?",
      meta: "NFC business card or QR code: how each works, iPhone and Android support, cost and limits. An honest comparison and a four-question test to pick the right card.",
      h1: "NFC business card or QR code: which one?", chapeau: "Answer four questions: the test tells you which card suits you." },
  },
  // ───────────────────────── Calculs
  {
    id: "calculer-un-pourcentage", categorie: "calcul",
    fr: { href: "/calculer-un-pourcentage/", court: "Pourcentage", long: "Calculer un pourcentage", carte: "Pourcentage d'un nombre, évolution, part et hausse ou baisse.",
      titre: "Pourcentage : calculer un pourcentage en ligne, gratuit",
      meta: "Calculer un pourcentage en ligne : X % d'un nombre, part en %, évolution, hausse ou remise, prix avant soldes et hausses successives, avec la formule détaillée.",
      h1: "Calculer un pourcentage", chapeau: "Choisissez le calcul et saisissez vos nombres : le résultat et la formule s'affichent." },
    en: { href: "/en/percentage-calculator/", court: "Percentage", long: "Percentage calculator", carte: "Percent of a number, percentage change, share, increase or discount.",
      titre: "Percentage Calculator: Percent of a Number, Change, Discount",
      meta: "Free percentage calculator: X% of a number, what percent one number is of another, percent change, increase or discount, price before a sale, with the formula.",
      h1: "Percentage calculator", chapeau: "Pick the calculation and enter your numbers: the result and the formula appear." },
  },
  {
    id: "calcul-ht-ttc", categorie: "calcul",
    fr: { href: "/calcul-ht-ttc/", court: "HT et TTC", long: "Calcul HT TTC et TVA", carte: "Passer du HT au TTC et inversement, à 20 %, 10 %, 5,5 % ou 2,1 %.",
      titre: "HT TTC : calcul de la TVA en ligne, gratuit et immédiat",
      meta: "Calcul HT TTC en ligne : passez du HT au TTC ou du TTC au HT à 20 %, 10 %, 5,5 % ou 2,1 %, montant de TVA arrondi au centime et total sur plusieurs lignes.",
      h1: "Calcul HT TTC et TVA", chapeau: "Saisissez un montant HT ou TTC et le taux : les deux autres montants s'affichent." },
    en: { href: "/en/vat-calculator/", court: "VAT (HT/TTC)", long: "French VAT calculator (HT and TTC)", carte: "Go from HT to TTC and back, at 20%, 10%, 5.5% or 2.1%.",
      titre: "VAT Calculator France 2026: HT to TTC and TTC to HT, Free",
      meta: "French VAT calculator: convert HT (before tax) to TTC (tax included) and back at 20%, 10%, 5.5% or 2.1%, VAT rounded to the cent and totals over several lines.",
      h1: "French VAT calculator: HT and TTC", chapeau: "Enter an HT or TTC amount and the rate: the other two amounts appear." },
  },
  {
    id: "calcul-marge-commerciale", categorie: "calcul",
    fr: { href: "/calcul-marge-commerciale/", court: "Marge commerciale", long: "Calcul de marge commerciale", carte: "Marge, taux de marge, taux de marque et coefficient.",
      titre: "Marge commerciale : calcul du taux de marge et de marque",
      meta: "Calcul de marge commerciale : à partir des prix d'achat et de vente HT, obtenez la marge, le taux de marge, le taux de marque, le coefficient et le TTC.",
      h1: "Calcul de marge commerciale", chapeau: "Saisissez prix d'achat et prix de vente HT : marge, taux et coefficient s'affichent." },
    en: { href: "/en/profit-margin-calculator/", court: "Profit margin", long: "Profit margin calculator", carte: "Margin, markup rate, margin rate and multiplier.",
      titre: "Profit Margin Calculator: Markup, Margin Rate, Multiplier",
      meta: "Profit margin calculator: from cost and sale price before VAT, get the margin, markup (taux de marge), margin rate (taux de marque), multiplier and VAT price.",
      h1: "Profit margin calculator", chapeau: "Enter the cost and selling price before VAT: margin, rates and multiplier appear." },
  },
  {
    id: "nombre-de-jours-entre-deux-dates", categorie: "calcul",
    fr: { href: "/nombre-de-jours-entre-deux-dates/", court: "Jours entre deux dates", long: "Nombre de jours entre deux dates", carte: "Jours calendaires et ouvrés entre deux dates, ou date après N jours.",
      titre: "Nombre de jours entre deux dates : calcul gratuit en ligne",
      meta: "Nombre de jours entre deux dates : jours calendaires, ouvrés et ouvrables avec les jours fériés français, durée en semaines et en mois, et date après N jours.",
      h1: "Nombre de jours entre deux dates", chapeau: "Choisissez deux dates : jours calendaires, ouvrés et ouvrables s'affichent aussitôt." },
    en: { href: "/en/days-between-dates/", court: "Days between dates", long: "Days between two dates", carte: "Calendar and working days between two dates, or the date after N days.",
      titre: "Days Between Dates: Calendar and Working Days in France",
      meta: "Days between two dates: calendar days, working days (jours ouvrés) and jours ouvrables with French public holidays, weeks and months, or the date after N days.",
      h1: "Days between two dates", chapeau: "Pick two dates: calendar, working and business days appear at once." },
  },
  {
    id: "calculateur-age", categorie: "calcul",
    fr: { href: "/calculateur-age/", court: "Calculateur d'âge", long: "Calculateur d'âge exact", carte: "Âge en années, mois et jours, et prochain anniversaire.",
      titre: "Âge exact : calculateur d'âge en années, mois et jours",
      meta: "Calculateur d'âge gratuit : votre âge exact en années, mois et jours depuis la date de naissance, total en semaines et jours, jour de naissance et anniversaire.",
      h1: "Calculateur d'âge", chapeau: "Saisissez une date de naissance : l'âge exact et le prochain anniversaire s'affichent." },
    en: { href: "/en/age-calculator/", court: "Age calculator", long: "Exact age calculator", carte: "Age in years, months and days, and the next birthday.",
      titre: "Age Calculator: Exact Age in Years, Months and Days, Free",
      meta: "Free age calculator: your exact age in years, months and days from a date of birth, total in weeks and days, the weekday you were born and your next birthday.",
      h1: "Age calculator", chapeau: "Enter a date of birth: the exact age and the next birthday appear." },
  },
  // ───────────────────────── Temps et tirage au sort
  {
    id: "chronometre", categorie: "temps",
    fr: { href: "/chronometre/", court: "Chronomètre", long: "Chronomètre en ligne", carte: "Chronomètre au centième, avec tours.",
      titre: "Chronomètre en ligne gratuit : au centième, avec tours",
      meta: "Chronomètre en ligne gratuit au centième de seconde : départ, pause, temps au tour, meilleur tour, plein écran et raccourcis clavier. Juste en arrière-plan.",
      h1: "Chronomètre en ligne", chapeau: "Démarrez, mettez en pause, enregistrez des tours. Barre d'espace pour démarrer, T pour un tour." },
    en: { href: "/en/stopwatch/", court: "Stopwatch", long: "Online stopwatch", carte: "A stopwatch to the hundredth of a second, with laps.",
      titre: "Online Stopwatch Free: Hundredths of a Second, With Laps",
      meta: "Free online stopwatch to the hundredth of a second: start, pause, lap times, best lap, full screen and keyboard shortcuts. Stays accurate in a background tab.",
      h1: "Online stopwatch", chapeau: "Start, pause and record laps. Space bar to start, T for a lap." },
  },
  {
    id: "minuteur", categorie: "temps",
    fr: { href: "/minuteur/", court: "Minuteur", long: "Minuteur en ligne", carte: "Minuteur avec sonnerie : 1, 5, 10 minutes ou durée libre.",
      titre: "Minuteur en ligne gratuit : 10 minutes ou durée libre",
      meta: "Minuteur en ligne gratuit avec sonnerie : 1, 5, 10, 25 minutes ou durée libre, pause, plein écran, temps restant dans l'onglet. Juste même en arrière-plan.",
      h1: "Minuteur en ligne", chapeau: "Choisissez une durée et lancez : la sonnerie retentit à la fin, même onglet en arrière-plan." },
    en: { href: "/en/online-timer/", court: "Timer", long: "Online timer", carte: "A timer with an alarm: 1, 5, 10 minutes or any duration.",
      titre: "Online Timer Free: 10 Minutes or Any Duration, With Alarm",
      meta: "Free online timer with an alarm: 1, 5, 10 or 25 minutes or any duration, pause, full screen and time left in the tab title. Stays accurate in a background tab.",
      h1: "Online timer", chapeau: "Pick a duration and start: the alarm rings at the end, even in a background tab." },
  },
  {
    id: "compte-a-rebours", categorie: "temps",
    fr: { href: "/compte-a-rebours/", court: "Compte à rebours", long: "Compte à rebours jusqu'à une date", carte: "Jours, heures et minutes restants avant un événement.",
      titre: "Compte à rebours en ligne : décompte jusqu'à une date",
      meta: "Compte à rebours en ligne gratuit jusqu'à une date et une heure : jours, heures, minutes et secondes restants, plein écran et lien à partager. Sans inscription.",
      h1: "Compte à rebours en ligne", chapeau: "Choisissez la date et l'heure de l'événement : le décompte démarre aussitôt." },
    en: { href: "/en/countdown/", court: "Countdown", long: "Countdown to a date", carte: "Days, hours and minutes left before an event.",
      titre: "Countdown Timer Online: Days Until a Date, Free to Share",
      meta: "Free online countdown to any date and time: days, hours, minutes and seconds left, full screen and a link to share with friends. No sign-up, nothing stored.",
      h1: "Countdown to a date", chapeau: "Pick the event date and time: the countdown starts at once." },
  },
  {
    id: "tirage-au-sort", categorie: "temps",
    fr: { href: "/tirage-au-sort/", court: "Tirage au sort", long: "Tirage au sort en ligne", carte: "Tirer au sort des prénoms, des gagnants ou des équipes.",
      titre: "Tirage au sort en ligne gratuit : noms, gagnants, équipes",
      meta: "Tirage au sort en ligne gratuit : tirez un ou plusieurs gagnants parmi une liste de prénoms, formez des équipes ou tirez des nombres. Rien n'est envoyé.",
      h1: "Tirage au sort en ligne", chapeau: "Collez la liste des prénoms, choisissez le nombre de gagnants et tirez." },
    en: { href: "/en/random-name-picker/", court: "Random picker", long: "Random name picker", carte: "Draw names, winners or teams at random.",
      titre: "Random Name Picker Online: Draw Winners or Teams, Free",
      meta: "Free random name picker: draw one or several winners from a list of names, split people into teams or draw random numbers. Unbiased draw, nothing sent.",
      h1: "Random name picker", chapeau: "Paste the list of names, choose how many winners and draw." },
  },
  {
    id: "roue-de-la-chance", categorie: "temps",
    fr: { href: "/roue-de-la-chance/", court: "Roue de la chance", long: "Roue de la chance", carte: "Une roue à tourner avec vos propres choix.",
      titre: "Roue de la chance en ligne : faites tourner vos choix",
      meta: "Roue de la chance gratuite : écrivez vos choix (prénoms, gages, repas, oui ou non), faites tourner la roue et laissez le hasard décider. Sans inscription.",
      h1: "Roue de la chance en ligne", chapeau: "Écrivez vos choix, un par ligne, puis faites tourner la roue." },
    en: { href: "/en/spin-the-wheel/", court: "Spin the wheel", long: "Spin the wheel", carte: "A wheel to spin with your own choices.",
      titre: "Spin the Wheel Online: Random Wheel With Your Own Choices",
      meta: "Free spin the wheel: write your choices (names, dares, dinner ideas, yes or no), spin the wheel and let chance decide. Fair random result, no sign-up.",
      h1: "Spin the wheel", chapeau: "Write your choices, one per line, then spin the wheel." },
  },
  // ───────────────────────── Texte et clavier
  {
    id: "compteur-de-mots", categorie: "texte",
    fr: { href: "/compteur-de-mots/", court: "Compteur de mots", long: "Compteur de mots", carte: "Mots, phrases, paragraphes et temps de lecture d'un texte.",
      titre: "Compteur de mots gratuit : nombre de mots, lecture, phrases",
      meta: "Compteur de mots en ligne gratuit : collez votre texte pour obtenir mots, caractères, phrases, paragraphes, temps de lecture et mots répétés. Rien n'est envoyé.",
      h1: "Compteur de mots", chapeau: "Collez ou tapez votre texte : le nombre de mots s'affiche à mesure." },
    en: { href: "/en/word-counter/", court: "Word counter", long: "Word counter", carte: "Words, sentences, paragraphs and reading time of a text.",
      titre: "Word Counter Free: Words, Characters, Reading Time Online",
      meta: "Free word counter: paste your text to get words, characters, sentences, paragraphs, reading time and repeated words. Works in English and French, nothing sent.",
      h1: "Word counter", chapeau: "Paste or type your text: the word count updates as you go." },
  },
  {
    id: "compteur-de-caracteres", categorie: "texte",
    fr: { href: "/compteur-de-caracteres/", court: "Compteur de caractères", long: "Compteur de caractères", carte: "Caractères avec et sans espaces, limites des réseaux sociaux.",
      titre: "Compteur de caractères avec et sans espaces, gratuit",
      meta: "Compteur de caractères gratuit : avec et sans espaces, emoji comptés comme on les voit, lignes, octets, nombre de SMS et limites de X, Instagram et LinkedIn.",
      h1: "Compteur de caractères", chapeau: "Collez ou tapez votre texte : caractères avec et sans espaces s'affichent à mesure." },
    en: { href: "/en/character-counter/", court: "Character counter", long: "Character counter", carte: "Characters with and without spaces, social media limits.",
      titre: "Character Counter Free: With and Without Spaces, SMS, X",
      meta: "Free character counter: with and without spaces, emoji counted the way you see them, lines, bytes, number of SMS and the limits of X, Instagram and LinkedIn.",
      h1: "Character counter", chapeau: "Paste or type your text: characters with and without spaces update as you go." },
  },
  {
    id: "generateur-mot-de-passe", categorie: "texte",
    fr: { href: "/generateur-mot-de-passe/", court: "Mot de passe", long: "Générateur de mot de passe", carte: "Mot de passe ou phrase de passe aléatoire, et sa robustesse.",
      titre: "Générateur de mot de passe sécurisé, gratuit et aléatoire",
      meta: "Générateur de mot de passe aléatoire et fort : longueur, symboles, phrase de passe en français, entropie en bits selon la CNIL et l'ANSSI. Rien n'est envoyé.",
      h1: "Générateur de mot de passe", chapeau: "Un mot de passe fort est déjà prêt : réglez la longueur et copiez-le." },
    en: { href: "/en/password-generator/", court: "Password generator", long: "Password generator", carte: "A random password or passphrase, and how strong it is.",
      titre: "Password Generator Free: Strong, Random and Secure Passwords",
      meta: "Free strong password generator: length, symbols, passphrases, strength in bits of entropy measured against CNIL and ANSSI guidance. Made on your device.",
      h1: "Password generator", chapeau: "A strong password is ready: set the length and copy it." },
  },
  {
    id: "generateur-lorem-ipsum", categorie: "texte",
    fr: { href: "/generateur-lorem-ipsum/", court: "Lorem ipsum", long: "Générateur lorem ipsum", carte: "Faux texte en paragraphes, phrases ou mots, à copier.",
      titre: "Générateur lorem ipsum : faux texte latin ou en français",
      meta: "Générateur lorem ipsum gratuit : paragraphes, phrases ou mots de faux texte, en latin classique ou en français, avec ou sans balises <p>, à copier en un clic.",
      h1: "Générateur lorem ipsum", chapeau: "Choisissez la quantité et la langue du faux texte, puis copiez-le." },
    en: { href: "/en/lorem-ipsum-generator/", court: "Lorem ipsum", long: "Lorem ipsum generator", carte: "Placeholder text in paragraphs, sentences or words, to copy.",
      titre: "Lorem Ipsum Generator: Placeholder Text in Latin or English",
      meta: "Free lorem ipsum generator: paragraphs, sentences or words of placeholder text in classic Latin, English or French, with or without <p> tags, one-click copy.",
      h1: "Lorem ipsum generator", chapeau: "Choose the amount and language of the dummy text, then copy it." },
  },
  {
    id: "test-vitesse-de-frappe", categorie: "texte",
    fr: { href: "/test-vitesse-de-frappe/", court: "Test de frappe", long: "Test de vitesse de frappe", carte: "Mots par minute et précision sur un texte en français.",
      titre: "Test de vitesse de frappe en français : mots par minute",
      meta: "Test de vitesse de frappe en français : 1, 2 ou 3 minutes sur un texte avec accents, mots par minute bruts et nets, précision et erreurs surlignées en direct.",
      h1: "Test de vitesse de frappe", chapeau: "Choisissez la durée et commencez à taper : le chronomètre part à la première touche." },
    en: { href: "/en/typing-speed-test/", court: "Typing test", long: "Typing speed test", carte: "Words per minute and accuracy on an English or French text.",
      titre: "Typing Speed Test: Words Per Minute and Accuracy, Free",
      meta: "Free typing speed test: 1, 2 or 3 minutes on an English or French text, gross and net words per minute, accuracy and mistakes highlighted live as you type.",
      h1: "Typing speed test", chapeau: "Pick a duration and start typing: the timer starts on the first key." },
  },
];

/** Pages hors registre qui ont aussi deux versions (accueils, pages légales). */
export const PAGES_FIXES: { fr: string; en: string }[] = [
  { fr: "/fr/", en: "/en/" },
  { fr: "/mentions-legales/", en: "/en/legal-notice/" },
  { fr: "/confidentialite/", en: "/en/privacy/" },
];

export const ACCUEIL: Record<Langue, string> = { fr: "/fr/", en: "/en/" };

export const outilParId = (id: string) => OUTILS.find((o) => o.id === id);
export const outilDeChemin = (chemin: string) => {
  const c = chemin.endsWith("/") ? chemin : chemin + "/";
  return OUTILS.find((o) => o.fr.href === c || o.en.href === c);
};
export const outilsDe = (c: CategorieId) => OUTILS.filter((o) => o.categorie === c);
export const categorieDe = (chemin: string) => outilDeChemin(chemin)?.categorie;
export const langueDe = (chemin: string): Langue => (chemin.startsWith("/en/") || chemin === "/en" ? "en" : "fr");

/** Adresse de la même page dans l'autre langue (outil, accueil ou page légale). */
export const autreLangue = (chemin: string): string | undefined => {
  const c = chemin.endsWith("/") ? chemin : chemin + "/";
  const o = outilDeChemin(c);
  if (o) return o.fr.href === c ? o.en.href : o.fr.href;
  const f = PAGES_FIXES.find((p) => p.fr === c || p.en === c);
  if (f) return f.fr === c ? f.en : f.fr;
  return undefined;
};
