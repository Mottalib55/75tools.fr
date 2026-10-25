import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import SEO from "@/components/SEO";
import {
  OutilLayout,
  EnTete,
  Section,
  Faq,
  faqJsonLd,
  Sources,
  AutresOutils,
  Champ,
  Bouton,
  QuestionFaq,
} from "@/components/outils/OutilLayout";
import { construireVcard, octets, Contact } from "@/lib/vcard";

const URL_PAGE = "https://75tools.fr/carte-de-visite-qr-code/";
const TITRE = "Carte de visite QR code : créez votre QR vCard gratuit";
const DESCRIPTION =
  "QR code de carte de visite gratuit : vos coordonnées en vCard, à scanner avec l'appareil photo pour créer le contact. Téléchargement PNG et SVG, sans compte.";

const EXEMPLE: Contact = {
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
};

const FAQ: QuestionFaq[] = [
  {
    q: "Le QR code vCard fonctionne-t-il sans connexion internet ?",
    r: "Oui. Les coordonnées sont écrites dans le dessin du QR code lui-même : le téléphone qui le scanne les lit directement et propose de créer le contact, sans ouvrir de page web. C'est l'avantage sur un QR code qui pointe vers une carte en ligne, qui demande une connexion au moment du scan.",
  },
  {
    q: "Puis-je modifier mes coordonnées après avoir imprimé le QR code ?",
    r: "Non. Un QR code vCard contient vos coordonnées telles qu'elles étaient au moment de sa création ; s'il change de numéro ou d'adresse, il faut générer un nouveau code et réimprimer. Si vos coordonnées changent souvent, préférez un QR code qui pointe vers une carte en ligne que vous mettez à jour, comme MyCard.",
  },
  {
    q: "Quelle taille donner au QR code sur une carte de visite ?",
    r: "Elle dépend de la quantité d'informations : plus la vCard est longue, plus le code a de modules et plus chaque module est petit à taille égale. Le générateur affiche la taille d'un module pour un code imprimé à 2 cm de côté. Gardez une marge blanche autour du code et faites toujours un essai imprimé à la taille réelle, scanné avec deux ou trois téléphones.",
  },
  {
    q: "Les accents et les caractères spéciaux passent-ils dans le contact ?",
    r: "Le texte est encodé en UTF-8, l'encodage que lisent les applications de contacts actuelles, et les virgules, points-virgules et barres obliques inverses sont échappés comme le demande la norme vCard 3.0. Un nom comme « Hélène Dupré-Lefèvre » ou une société « Martin, Fils & Cie » reste donc intact. Vérifiez quand même sur votre téléphone avant d'imprimer.",
  },
  {
    q: "Le QR code expire-t-il, ou dépend-il d'un abonnement ?",
    r: "Non. Le code est un simple dessin calculé dans votre navigateur à partir de vos coordonnées : il ne passe par aucun serveur de redirection, ne peut pas être désactivé et fonctionne aussi longtemps que l'image existe. Vous pouvez l'utiliser sur des cartes, des flyers ou une vitrine sans limite de durée ni de nombre de scans.",
  },
];

const telecharger = (nom: string, href: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const CarteVisiteQrCode = () => {
  const [c, setC] = useState<Contact>(EXEMPLE);
  const [svg, setSvg] = useState("");
  const [modules, setModules] = useState(0);
  const [erreur, setErreur] = useState("");
  const vcard = useMemo(() => construireVcard(c), [c]);
  const maj = (k: keyof Contact) => (v: string) => setC((x) => ({ ...x, [k]: v }));
  const fichier = ([c.prenom, c.nom].filter((x) => x.trim()).join("-") || "contact")
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
      setErreur("Trop d'informations pour un QR code lisible : raccourcissez la note ou l'adresse.");
      setSvg("");
      return;
    }
    QRCode.toString(vcard, { type: "svg", errorCorrectionLevel: "M", margin: 4, color: { dark: "#000000", light: "#ffffff" } })
      .then((s) => !annule && setSvg(s))
      .catch(() => !annule && setErreur("Impossible de générer le QR code."));
    return () => {
      annule = true;
    };
  }, [vcard]);

  const png = async () => {
    const url = await QRCode.toDataURL(vcard, { errorCorrectionLevel: "M", margin: 4, width: 1200 });
    telecharger(`qr-vcard-${fichier}.png`, url);
  };
  const svgDl = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    telecharger(`qr-vcard-${fichier}.svg`, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const vcf = () => {
    const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }));
    telecharger(`${fichier}.vcf`, url);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const taille = octets(vcard);
  const module2cm = modules ? (20 / (modules + 8)).toFixed(2).replace(".", ",") : "";

  return (
    <OutilLayout>
      <SEO
        exactTitle
        title={TITRE}
        description={DESCRIPTION}
        keywords="carte de visite qr code, qr code vcard, qr code contact, qr code carte de visite gratuit"
        url={URL_PAGE}
        locale="fr_FR"
        imageAlt="Générateur de QR code vCard pour carte de visite"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Générateur de QR code vCard",
            url: URL_PAGE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Navigateur web",
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            description: DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: "75tools", url: "https://75tools.fr/" },
          },
          faqJsonLd(FAQ),
        ]}
      />

      <EnTete
        titre="QR code de carte de visite (vCard)"
        chapeau="Saisissez vos coordonnées : le QR code se met à jour à chaque frappe. Scanné avec l'appareil photo d'un téléphone, il propose d'ajouter le contact. Rien n'est envoyé, le code est calculé dans votre navigateur."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div className="order-first lg:order-last lg:sticky lg:top-4 space-y-3">
          <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] lg:grid-cols-1 gap-4 items-start">
            <div className="bg-white rounded-lg p-2 aspect-square w-full max-w-[22rem]">
              {svg ? (
                <div id="qr-vcard" className="[&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
              ) : (
                <div className="w-full h-full grid place-items-center text-neutral-500 text-sm text-center p-2">
                  {erreur || "QR code"}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-200">
                Scannez l'écran avec l'appareil photo de votre téléphone pour vérifier.
              </p>
              <p className="text-neutral-500 tabular-nums">
                {taille} octets · {modules} × {modules} modules
                {module2cm && <> · module de {module2cm} mm si imprimé à 2 cm</>}
              </p>
              {erreur && <p className="text-amber-300">{erreur}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={png}>Télécharger en PNG</Bouton>
            <Bouton secondaire onClick={svgDl}>
              SVG
            </Bouton>
            <Bouton secondaire onClick={vcf}>
              Fichier .vcf
            </Bouton>
          </div>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Vos coordonnées">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ label="Prénom" value={c.prenom} onChange={maj("prenom")} autoComplete="given-name" />
            <Champ label="Nom" value={c.nom} onChange={maj("nom")} autoComplete="family-name" />
            <Champ label="Entreprise" value={c.entreprise} onChange={maj("entreprise")} autoComplete="organization" />
            <Champ label="Poste" value={c.poste} onChange={maj("poste")} autoComplete="organization-title" />
            <Champ label="Mobile" type="tel" value={c.mobile} onChange={maj("mobile")} autoComplete="tel" />
            <Champ label="Téléphone fixe" type="tel" value={c.telephone} onChange={maj("telephone")} />
            <Champ label="E-mail" type="email" value={c.email} onChange={maj("email")} autoComplete="email" />
            <Champ label="Site web" value={c.site} onChange={maj("site")} placeholder="www.votre-site.fr" />
            <Champ label="Rue" value={c.rue} onChange={maj("rue")} autoComplete="street-address" />
            <Champ label="Code postal" value={c.codePostal} onChange={maj("codePostal")} autoComplete="postal-code" />
            <Champ label="Ville" value={c.ville} onChange={maj("ville")} autoComplete="address-level2" />
            <Champ label="Pays" value={c.pays} onChange={maj("pays")} autoComplete="country-name" />
          </div>
          <Champ
            label="Note (facultatif)"
            value={c.note}
            onChange={maj("note")}
            placeholder="Rencontrés au salon de Lyon"
            aide="Chaque caractère ajouté densifie le QR code : restez bref."
          />
          <details className="text-sm">
            <summary className="cursor-pointer text-neutral-300">Voir le texte de la vCard encodée</summary>
            <pre id="texte-vcard" className="mt-2 whitespace-pre-wrap break-all bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-300 text-xs">
              {vcard}
            </pre>
          </details>
        </form>
      </div>

      <Section titre="QR vCard ou QR code vers une carte en ligne ?">
        <p>
          Il existe deux façons de mettre un QR code sur une carte de visite, et elles ne font pas la même chose.
        </p>
        <p>
          <strong>Le QR code vCard</strong>, celui de cette page, contient vos coordonnées elles-mêmes, au format
          vCard que comprennent les applications de contacts. Il marche hors connexion, ne dépend d'aucun service
          et ne s'éteint jamais. En contrepartie, il est figé : un changement de numéro oblige à réimprimer. Et plus
          vous y mettez d'informations, plus le dessin est dense, donc plus il doit être imprimé grand.
        </p>
        <p>
          <strong>Le QR code vers une carte en ligne</strong> ne contient qu'une adresse web, courte : le code
          reste simple et lisible même petit. La page ouverte peut montrer une photo, des liens, un bouton
          « Ajouter aux contacts », et vous la modifiez quand vous voulez sans toucher aux cartes déjà
          distribuées. Il faut en revanche une connexion au moment du scan, et la page doit rester en ligne.
          C'est ce que propose <Link to="/mycard/">MyCard</Link>, la carte de visite en ligne gratuite de 75tools.
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
          Sur iPhone, ouvrez l'appareil photo et cadrez le code affiché à l'écran : une bannière apparaît, un
          toucher ouvre la fiche du contact, à enregistrer. Sur Android, l'application Appareil photo de la plupart
          des modèles récents fait de même ; sinon, Google Lens lit le code. Vérifiez que le nom, la société, le
          numéro et l'adresse e-mail arrivent dans les bons champs.
        </p>
        <p>
          Faites ensuite un essai sur papier, à la taille prévue. Le générateur indique la taille d'un module (un
          petit carré du dessin) pour un code de 2 cm de côté marge comprise : plus il est petit, plus la mise au
          point est exigeante pour un téléphone ancien. Si le code devient trop dense, retirez la note, le
          téléphone fixe ou l'adresse postale, ou passez à un code qui pointe vers une carte en ligne.
        </p>
        <p>
          Pour l'imprimeur, préférez le <strong>SVG</strong> : c'est un dessin vectoriel, net à n'importe quelle
          taille. Le <strong>PNG</strong> fait 1 200 pixels de côté, assez pour une impression à 10 cm à 300 dpi.
          Gardez le code noir sur fond blanc avec sa marge blanche : un code clair sur fond foncé ou collé au bord
          d'un aplat de couleur n'est pas lu par tous les lecteurs. Le niveau de correction d'erreur est M, qui
          permet de reconstituer environ 15 % du code abîmé ou sali.
        </p>
      </Section>

      <Section titre="Ce que contient la vCard générée">
        <p>
          Le générateur écrit une vCard version 3.0, un format que lisent les carnets d'adresses de l'iPhone,
          d'Android, d'Outlook et de Gmail. Chaque ligne correspond à un champ : <strong>N</strong> (nom
          et prénom séparés, pour le tri), <strong>FN</strong> (nom affiché), <strong>ORG</strong> (entreprise),{" "}
          <strong>TITLE</strong> (poste), <strong>TEL</strong> (mobile et fixe, convertis au format international
          +33), <strong>EMAIL</strong>, <strong>URL</strong> et <strong>ADR</strong> (adresse, dans l'ordre rue,
          ville, région, code postal, pays).
        </p>
        <p>
          Les virgules, points-virgules et barres obliques inverses qui figurent dans vos textes sont précédés
          d'une barre oblique inverse, comme l'exige la norme : sans cela, « Martin, Fils & Cie » serait coupé en
          deux. Le bouton « Fichier .vcf » enregistre la même fiche, à joindre à un e-mail ou à importer dans un
          carnet d'adresses.
        </p>
      </Section>

      <Faq faq={FAQ} />

      <Sources
        sources={[
          { editeur: "IETF", titre: "RFC 2426, vCard MIME Directory Profile (version 3.0 de la norme vCard)", url: "https://www.rfc-editor.org/rfc/rfc2426", lu: "25 octobre 2026" },
          { editeur: "Assistance Apple", titre: "Scanner un code QR avec la caméra de l'iPhone", url: "https://support.apple.com/fr-fr/guide/iphone/iphe8bda8762/ios", lu: "25 octobre 2026" },
        ]}
      />

      <AutresOutils courant="/carte-de-visite-qr-code/" />
    </OutilLayout>
  );
};

export default CarteVisiteQrCode;
