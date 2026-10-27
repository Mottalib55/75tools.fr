import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, Champ, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { construireVcard, octets, Contact } from "@/lib/vcard";
import { telecharger } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

const EXEMPLE: Record<Langue, Contact> = {
  fr: {
    prenom: "Camille",
    nom: "Martin",
    entreprise: "Atelier Martin",
    poste: "Consultante en recrutement",
    mobile: "06 12 34 56 78",
    telephone: "",
    email: "camille@exemple.fr",
    site: "www.exemple.fr",
    rue: "",
    codePostal: "",
    ville: "Lyon",
    pays: "France",
    note: "",
  },
  en: {
    prenom: "Emma",
    nom: "Clarke",
    entreprise: "Clarke Talent",
    poste: "Recruitment consultant",
    mobile: "06 12 34 56 78",
    telephone: "",
    email: "emma@example.com",
    site: "www.example.com",
    rue: "",
    codePostal: "",
    ville: "Lyon",
    pays: "France",
    note: "",
  },
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le QR code vCard fonctionne-t-il sans connexion internet ?",
      r: "Oui. Les coordonnées sont écrites dans le dessin du QR code lui-même : le téléphone qui le scanne les lit directement et propose de créer le contact, sans ouvrir de page web. C'est l'avantage sur un QR code qui pointe vers une carte en ligne, qui demande une connexion au moment du scan et un service qui reste en ligne.",
    },
    {
      q: "Puis-je modifier mes coordonnées après avoir imprimé le QR code ?",
      r: "Non. Un QR code vCard contient vos coordonnées telles qu'elles étaient au moment de sa création ; si vous changez de numéro ou d'adresse, il faut générer un nouveau code et réimprimer. Si vos coordonnées changent souvent, préférez un QR code qui pointe vers une carte en ligne que vous mettez à jour, comme MyCard.",
    },
    {
      q: "Quelle taille donner au QR code sur une carte de visite ?",
      r: "Elle dépend de la quantité d'informations : plus la vCard est longue, plus le code a de modules et plus chaque module est petit à taille égale. Le générateur affiche la taille d'un module pour un code imprimé à 2 cm de côté. Gardez une marge blanche autour du code et faites un essai imprimé à la taille réelle, scanné avec deux ou trois téléphones.",
    },
    {
      q: "Les accents et les caractères spéciaux passent-ils dans le contact ?",
      r: "Le texte est encodé en UTF-8, l'encodage que lisent les applications de contacts actuelles, et les virgules, points-virgules et barres obliques inverses sont échappés comme le demande la norme vCard 3.0. Un nom comme « Hélène Dupré-Lefèvre » ou une société « Martin, Fils & Cie » reste donc intact. Vérifiez quand même sur votre téléphone avant d'imprimer.",
    },
    {
      q: "Le QR code expire-t-il, ou dépend-il d'un abonnement ?",
      r: "Non. Le code est un simple dessin calculé dans votre navigateur à partir de vos coordonnées : il ne passe par aucun serveur de redirection, ne peut pas être désactivé et fonctionne aussi longtemps que l'image existe. Vous pouvez l'utiliser sur des cartes, des flyers ou une vitrine sans limite de durée ni de nombre de scans.",
    },
    {
      q: "PNG, SVG ou .vcf : quel fichier envoyer à mon imprimeur ?",
      r: "Le SVG, dessin vectoriel net à n'importe quelle taille : l'imprimeur le place sans perte sur la maquette. Le PNG de 1 200 pixels de côté suffit pour une impression jusqu'à 10 cm à 300 dpi, ou pour une présentation. Le fichier .vcf n'est pas une image : c'est la fiche contact elle-même, à joindre à un e-mail ou à importer dans un carnet d'adresses.",
    },
  ],
  en: [
    {
      q: "Does a vCard QR code work without an internet connection?",
      r: "Yes. Your details are written into the QR code pattern itself, so the phone that scans it reads them directly and offers to create the contact without opening any web page. That is the advantage over a QR code pointing to an online card, which needs a connection at the moment of scanning and a service that stays online.",
    },
    {
      q: "Can I change my details after printing the QR code?",
      r: "No. A vCard QR code holds your details as they were when you created it; if your number or address changes, you need to generate a new code and reprint. If your details change often, for example during a move to or from France, a QR code pointing to an online profile that you can update is a better fit.",
    },
    {
      q: "How big should the QR code be on a business card?",
      r: "It depends on how much you put in it: the longer the vCard, the more modules the code has and the smaller each module is at the same size. The generator shows the module size for a code printed 2 cm wide. Keep a white margin around the code and test a print at real size with two or three different phones.",
    },
    {
      q: "Will accents in French names and addresses survive the scan?",
      r: "Yes. The text is encoded in UTF-8, which current contact apps read, and commas, semicolons and backslashes are escaped as the vCard 3.0 standard requires. A name like Hélène Dupré-Lefèvre or a company called Martin, Fils & Cie comes through intact, and so does a French street address. Still, scan it with your own phone before printing.",
    },
    {
      q: "PNG, SVG or .vcf: which file should I send to the printer?",
      r: "The SVG, a vector drawing that stays sharp at any size, so the printer can place it on the layout without loss. The 1,200-pixel PNG is enough for printing up to 10 cm at 300 dpi or for a slide. The .vcf file is not an image: it is the contact card itself, to attach to an email or import into an address book.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "IETF (RFC Editor)", titre: "RFC 2426, vCard MIME Directory Profile (vCard 3.0)", url: "https://www.rfc-editor.org/rfc/rfc2426", lu: "27 octobre 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 6350, vCard Format Specification (vCard 4.0)", url: "https://www.rfc-editor.org/rfc/rfc6350", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2015, spécification de la symbologie QR Code", url: "https://www.iso.org/standard/62021.html", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Scanner un code QR avec la caméra de l'iPhone", url: "https://support.apple.com/fr-fr/guide/iphone/iphe8bda8762/ios", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "IETF (RFC Editor)", titre: "RFC 2426, vCard MIME Directory Profile (vCard 3.0)", url: "https://www.rfc-editor.org/rfc/rfc2426", lu: "27 October 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 6350, vCard Format Specification (vCard 4.0)", url: "https://www.rfc-editor.org/rfc/rfc6350", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification", url: "https://www.iso.org/standard/62021.html", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Scan a QR code with your iPhone camera", url: "https://support.apple.com/en-gb/guide/iphone/iphe8bda8762/ios", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de QR code vCard 75tools",
    motsCles: "qr code vcard, carte de visite qr code, qr code contact, qr code carte de visite gratuit, vcard qr code",
    trop: "Trop d'informations pour un QR code lisible : raccourcissez la note ou l'adresse.",
    impossible: "Impossible de générer le QR code.",
    scanner: "Scannez l'écran avec l'appareil photo de votre téléphone pour vérifier.",
    stats: (o: string, m: number) => `${o} octets · ${m} × ${m} modules`,
    module: (mm: string) => ` · module de ${mm} mm si imprimé à 2 cm`,
    png: "Télécharger en PNG",
    vcf: "Fichier .vcf",
    alt: "QR code vCard de vos coordonnées",
    coordonnees: "Vos coordonnées",
    prenom: "Prénom",
    nom: "Nom",
    entreprise: "Entreprise",
    poste: "Poste",
    mobile: "Mobile",
    fixe: "Téléphone fixe",
    email: "E-mail",
    site: "Site web",
    sitePh: "www.votre-site.fr",
    rue: "Rue",
    cp: "Code postal",
    ville: "Ville",
    pays: "Pays",
    note: "Note (facultatif)",
    notePh: "Rencontrés au salon de Lyon",
    noteAide: "Chaque caractère ajouté densifie le QR code : restez bref.",
    voir: "Voir le texte de la vCard encodée",
    prefixe: "qr-vcard",
    contact: "contact",
  },
  en: {
    nomAppli: "75tools vCard QR code generator",
    motsCles: "vcard qr code, business card qr code, contact qr code, free vcard qr code generator, qr code for business card",
    trop: "Too much information for a readable QR code: shorten the note or the address.",
    impossible: "The QR code could not be generated.",
    scanner: "Scan the screen with your phone camera to check it.",
    stats: (o: string, m: number) => `${o} bytes · ${m} × ${m} modules`,
    module: (mm: string) => ` · ${mm} mm modules if printed 2 cm wide`,
    png: "Download PNG",
    vcf: ".vcf file",
    alt: "vCard QR code with your details",
    coordonnees: "Your details",
    prenom: "First name",
    nom: "Last name",
    entreprise: "Company",
    poste: "Job title",
    mobile: "Mobile",
    fixe: "Office phone",
    email: "Email",
    site: "Website",
    sitePh: "www.your-site.com",
    rue: "Street",
    cp: "Postcode",
    ville: "City",
    pays: "Country",
    note: "Note (optional)",
    notePh: "Met at the Lyon trade fair",
    noteAide: "Every extra character makes the QR code denser: keep it short.",
    voir: "Show the encoded vCard text",
    prefixe: "vcard-qr",
    contact: "contact",
  },
};

const CarteVisiteQrCode = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [c, setC] = useState<Contact>(EXEMPLE[lang]);
  const [svg, setSvg] = useState("");
  const [modules, setModules] = useState(0);
  const [erreur, setErreur] = useState("");
  const vcard = useMemo(() => construireVcard(c), [c]);
  const maj = (k: keyof Contact) => (v: string) => setC((x) => ({ ...x, [k]: v }));
  const fichier = ([c.prenom, c.nom].filter((x) => x.trim()).join("-") || t.contact)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

  useEffect(() => {
    let annule = false;
    try {
      const qr = QRCode.create(vcard, { errorCorrectionLevel: "M" });
      setModules(qr.modules.size);
      setErreur("");
    } catch {
      setErreur(t.trop);
      setSvg("");
      return;
    }
    QRCode.toString(vcard, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: { dark: "#000000", light: "#ffffff" } })
      .then((s) => !annule && setSvg(s))
      .catch(() => !annule && setErreur(t.impossible));
    return () => {
      annule = true;
    };
  }, [vcard, t]);

  const png = async () => {
    const url = await QRCode.toDataURL(vcard, { errorCorrectionLevel: "M", margin: 4, width: 1200 });
    telecharger(`${t.prefixe}-${fichier}.png`, url);
  };
  const svgDl = () => telecharger(`${t.prefixe}-${fichier}.svg`, new Blob([svg], { type: "image/svg+xml" }));
  const vcf = () => telecharger(`${fichier}.vcf`, new Blob([vcard], { type: "text/vcard;charset=utf-8" }));

  const taille = octets(vcard);
  const module2cm = modules ? (20 / (modules + 8)).toLocaleString(locale(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  const outil = (
    <div className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div data-resultat className="order-first lg:order-last lg:sticky lg:top-4 space-y-3">
        <div className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] lg:grid-cols-1 gap-4 items-start">
          <div className="bg-white rounded-lg p-2 aspect-square w-full max-w-[20rem]">
            {svg ? (
              <div id="qr-vcard" role="img" aria-label={t.alt} className="[&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <div className="w-full h-full grid place-items-center text-neutral-500 text-sm text-center p-2">{erreur || "QR code"}</div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-neutral-200">{t.scanner}</p>
            <p className="text-neutral-500 tabular-nums">
              {t.stats(taille.toLocaleString(locale(lang)), modules)}
              {module2cm && t.module(module2cm)}
            </p>
            {erreur && <p className="text-amber-300" role="status">{erreur}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={png} disabled={!svg}>{t.png}</Bouton>
          <Bouton secondaire onClick={svgDl} disabled={!svg}>SVG</Bouton>
          <Bouton secondaire onClick={vcf}>{t.vcf}</Bouton>
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label={t.coordonnees}>
        <div className="grid gap-4 grid-cols-2">
          <Champ label={t.prenom} value={c.prenom} onChange={maj("prenom")} autoComplete="given-name" />
          <Champ label={t.nom} value={c.nom} onChange={maj("nom")} autoComplete="family-name" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label={t.entreprise} value={c.entreprise} onChange={maj("entreprise")} autoComplete="organization" />
          <Champ label={t.poste} value={c.poste} onChange={maj("poste")} autoComplete="organization-title" />
          <Champ label={t.mobile} type="tel" value={c.mobile} onChange={maj("mobile")} autoComplete="tel" />
          <Champ label={t.fixe} type="tel" value={c.telephone} onChange={maj("telephone")} />
          <Champ label={t.email} type="email" value={c.email} onChange={maj("email")} autoComplete="email" />
          <Champ label={t.site} value={c.site} onChange={maj("site")} placeholder={t.sitePh} />
          <Champ label={t.rue} value={c.rue} onChange={maj("rue")} autoComplete="street-address" />
          <Champ label={t.cp} value={c.codePostal} onChange={maj("codePostal")} autoComplete="postal-code" />
          <Champ label={t.ville} value={c.ville} onChange={maj("ville")} autoComplete="address-level2" />
          <Champ label={t.pays} value={c.pays} onChange={maj("pays")} autoComplete="country-name" />
        </div>
        <Champ label={t.note} value={c.note} onChange={maj("note")} placeholder={t.notePh} aide={t.noteAide} />
        <details className="text-sm">
          <summary className="cursor-pointer text-neutral-300">{t.voir}</summary>
          <pre id="texte-vcard" className="mt-2 whitespace-pre-wrap break-all bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-300 text-xs">
            {vcard}
          </pre>
        </details>
      </form>
    </div>
  );

  return (
    <PageOutil
      id="carte-de-visite-qr-code"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="BusinessApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Un QR code vCard pour votre carte de visite, en une minute">
      <p>
        Un QR code vCard pour carte de visite contient vos coordonnées elles-mêmes, au format vCard que lisent les
        carnets d'adresses : scanné avec l'appareil photo d'un iPhone ou d'un Android, il propose aussitôt
        d'enregistrer le contact, sans connexion. Pour le créer, tapez prénom, nom, entreprise, mobile et e-mail
        dans les champs ci-dessus : le code se redessine à chaque frappe, puis téléchargez-le en PNG de 1 200
        pixels ou en SVG pour l'imprimeur. Un contact type (nom, société, poste, mobile, e-mail, site, ville) pèse
        environ 250 octets et donne un code de 65 × 65 modules ; imprimé à 2 cm, chaque module ne mesure que
        0,27 mm, ce que le générateur calcule pour vous : visez plutôt 2,5 à 3 cm de côté. La limite principale : le code est figé, et un
        changement de numéro oblige à réimprimer les cartes. Ajoutez le moins de champs possible, car chaque
        caractère densifie le dessin.
      </p>
    </Section>

    <Section titre="QR vCard ou QR code vers une carte en ligne ?">
      <p>
        <strong>Le QR code vCard</strong>, celui de cette page, marche hors connexion, ne dépend d'aucun service
        et ne s'éteint jamais. En contrepartie, il est figé, et plus vous y mettez d'informations, plus le dessin
        est dense, donc plus il doit être imprimé grand.
      </p>
      <p>
        <strong>Le QR code vers une carte en ligne</strong> ne contient qu'une adresse web, courte : le code reste
        simple et lisible même petit. La page ouverte peut montrer une photo, des liens, un bouton « Ajouter aux
        contacts », et vous la modifiez sans toucher aux cartes déjà distribuées. Il faut en revanche une connexion
        au moment du scan. C'est ce que propose <Link to="/mycard/">MyCard</Link>, la carte de visite en ligne
        gratuite de 75tools. Pour trancher entre QR code et puce sans contact, voyez notre comparatif{" "}
        <Link to="/carte-de-visite-nfc/">carte de visite NFC ou QR code</Link>.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[32rem]">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
              <th className="py-2 pr-4 font-medium"> </th>
              <th className="py-2 pr-4 font-medium">QR vCard</th>
              <th className="py-2 font-medium">QR vers une carte en ligne</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            <tr><td className="py-2 pr-4 text-neutral-400">Connexion au scan</td><td className="py-2 pr-4">Inutile</td><td className="py-2">Nécessaire</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Modifier après impression</td><td className="py-2 pr-4">Impossible</td><td className="py-2">Oui, à tout moment</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Densité du code</td><td className="py-2 pr-4">Grandit avec les informations</td><td className="py-2">Faible, une adresse courte</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Photo, liens, réseaux</td><td className="py-2 pr-4">Texte seulement</td><td className="py-2">Oui</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Dépend d'un service</td><td className="py-2 pr-4">Non</td><td className="py-2">Oui, l'hébergeur de la page</td></tr>
          </tbody>
        </table>
      </div>
    </Section>

    <Section titre="Tester le QR code avant de l'imprimer">
      <p>
        Sur iPhone, ouvrez l'appareil photo et cadrez le code affiché à l'écran : une bannière apparaît, un toucher
        ouvre la fiche du contact, à enregistrer. Sur Android, l'application Appareil photo de la plupart des
        modèles récents fait de même ; sinon, Google Lens lit le code. Vérifiez que le nom, la société, le numéro et
        l'adresse e-mail arrivent dans les bons champs.
      </p>
      <p>
        Faites ensuite un essai sur papier, à la taille prévue. Si le code devient trop dense, retirez la note, le
        téléphone fixe ou l'adresse postale. Gardez le code noir sur fond blanc avec sa marge blanche : un code
        clair sur fond foncé n'est pas lu par tous les lecteurs. Le niveau de correction d'erreur est M, qui permet
        de reconstituer environ 15 % du code abîmé ou sali. Pour la carte elle-même, partez d'un de nos{" "}
        <Link to="/modele-carte-de-visite/">modèles de carte de visite</Link>.
      </p>
    </Section>

    <Section titre="Ce que contient la vCard générée">
      <p>
        Le générateur écrit une vCard version 3.0, un format que lisent les carnets d'adresses de l'iPhone,
        d'Android, d'Outlook et de Gmail. Chaque ligne correspond à un champ : <strong>N</strong> (nom et prénom
        séparés, pour le tri), <strong>FN</strong> (nom affiché), <strong>ORG</strong> (entreprise),{" "}
        <strong>TITLE</strong> (poste), <strong>TEL</strong> (mobile et fixe, convertis au format international
        +33), <strong>EMAIL</strong>, <strong>URL</strong> et <strong>ADR</strong> (adresse, dans l'ordre rue,
        ville, région, code postal, pays).
      </p>
      <p>
        Les virgules, points-virgules et barres obliques inverses de vos textes sont précédés d'une barre oblique
        inverse, comme l'exige la norme : sans cela, « Martin, Fils & Cie » serait coupé en deux. Le bouton
        « Fichier .vcf » enregistre la même fiche, à joindre à un e-mail ou à importer dans un carnet d'adresses.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A vCard QR code for your business card in one minute">
      <p>
        A vCard QR code for business cards holds your contact details themselves, in the vCard format that address
        books read: scanned with an iPhone or Android camera, it offers to save the contact straight away, with no
        internet connection. To make one, type your first and last name, company, mobile and email in the fields
        above: the code redraws with every keystroke, then download it as a 1,200-pixel PNG or as an SVG for the
        printer. A typical contact (name, company, job title, mobile, email, website, city) is about 250 bytes and
        gives a code of 65 × 65 modules; printed 2 cm wide, each module is only 0.27 mm, which the generator works
        out for you, so aim for 2.5 to 3 cm instead. A French mobile typed as 06 12 34 56 78 is stored as +33 6 12 34 56 78, so it
        dials correctly from a UK or US phone. The main limit: the code is frozen, and a new number means
        reprinting your cards.
      </p>
    </Section>

    <Section titre="vCard QR code or QR code to an online card?">
      <p>
        <strong>A vCard QR code</strong>, the kind this page makes, works offline, depends on no service and never
        expires. On the other hand it is frozen, and the more you put in it, the denser the pattern, so the larger
        it has to be printed.
      </p>
      <p>
        <strong>A QR code to an online card</strong> only holds a short web address, so the code stays simple and
        readable even when small. The page it opens can show a photo, links and an add-to-contacts button, and you
        can edit it without touching the cards you already handed out. It needs a connection when scanned, though,
        and the page has to stay online. To choose between a QR code and a contactless chip, read our{" "}
        <Link to="/en/nfc-business-card/">NFC business card or QR code</Link> comparison.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[32rem]">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
              <th className="py-2 pr-4 font-medium"> </th>
              <th className="py-2 pr-4 font-medium">vCard QR</th>
              <th className="py-2 font-medium">QR to an online card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            <tr><td className="py-2 pr-4 text-neutral-400">Connection when scanning</td><td className="py-2 pr-4">Not needed</td><td className="py-2">Needed</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Edit after printing</td><td className="py-2 pr-4">Impossible</td><td className="py-2">Yes, any time</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Code density</td><td className="py-2 pr-4">Grows with the details</td><td className="py-2">Low, a short address</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Photo, links, social</td><td className="py-2 pr-4">Text only</td><td className="py-2">Yes</td></tr>
            <tr><td className="py-2 pr-4 text-neutral-400">Depends on a service</td><td className="py-2 pr-4">No</td><td className="py-2">Yes, the page host</td></tr>
          </tbody>
        </table>
      </div>
    </Section>

    <Section titre="Test the QR code before printing">
      <p>
        On an iPhone, open the Camera and point it at the code on screen: a banner appears, and tapping it opens the
        contact card, ready to save. On Android, the Camera app of most recent models does the same; otherwise
        Google Lens reads the code. Check that the name, company, number and email land in the right fields.
      </p>
      <p>
        Then test a paper print at the planned size. If the code gets too dense, drop the note, the office number or
        the street address. Keep the code black on white with its white margin: a light code on a dark background
        is not read by every scanner. The error correction level is M, which can rebuild about 15% of a damaged or
        dirty code. For the card itself, start from one of our{" "}
        <Link to="/en/business-card-templates/">business card templates</Link>.
      </p>
    </Section>

    <Section titre="What the generated vCard contains">
      <p>
        The generator writes a version 3.0 vCard, a format read by the address books of iPhone, Android, Outlook
        and Gmail. Each line is a field: <strong>N</strong> (last and first name, for sorting), <strong>FN</strong>{" "}
        (display name), <strong>ORG</strong> (company), <strong>TITLE</strong> (job title), <strong>TEL</strong>{" "}
        (mobile and office, converted to the international +33 format when French), <strong>EMAIL</strong>,{" "}
        <strong>URL</strong> and <strong>ADR</strong> (address, in the order street, city, region, postcode,
        country).
      </p>
      <p>
        Commas, semicolons and backslashes in your text get a backslash in front, as the standard requires;
        without it, a company called Martin, Fils & Cie would be split in two. The .vcf file button saves the same
        card, to attach to an email or import into an address book.
      </p>
    </Section>
  </>
);

export default CarteVisiteQrCode;
