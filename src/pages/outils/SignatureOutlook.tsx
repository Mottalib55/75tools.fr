import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { GenerateurSignature } from "@/components/outils/GenerateurSignature";
import { DonneesSignature, echapper } from "@/lib/signature";
import { telecharger } from "@/lib/fichiers";
import type { Langue } from "@/lib/langue";

const EXEMPLE: Record<Langue, DonneesSignature> = {
  fr: {
    nom: "Julien Lefèvre",
    poste: "Responsable commercial",
    entreprise: "Lefèvre Équipements",
    telephone: "04 72 00 00 00",
    mobile: "06 98 76 54 32",
    email: "julien.lefevre@exemple.fr",
    site: "www.exemple.fr",
    adresse: "",
    linkedin: "",
    lienLibelle: "",
    lienUrl: "",
    couleur: "#0f766e",
    photoUrl: "",
    logoUrl: "",
    mention: "",
  },
  en: {
    nom: "James Walker",
    poste: "Sales manager",
    entreprise: "Walker Equipment",
    telephone: "04 72 00 00 00",
    mobile: "06 98 76 54 32",
    email: "james.walker@example.com",
    site: "www.example.com",
    adresse: "",
    linkedin: "",
    lienLibelle: "",
    lienUrl: "",
    couleur: "#0f766e",
    photoUrl: "",
    logoUrl: "",
    mention: "",
  },
};

/** Nom de fichier sans accent ni espace : « Julien-Lefevre.htm ». */
const nomFichier = (nom: string) =>
  (nom.trim() || "signature")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + ".htm";

/** Page HTML complète, en UTF-8, telle qu'Outlook classique la lit dans son dossier Signatures. */
const documentHtm = (html: string, titre: string, lang: Langue) =>
  `<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<title>${echapper(titre)}</title>\n</head>\n<body>\n${html}\n</body>\n</html>\n`;

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "J'ai créé ma signature dans Outlook classique, mais elle n'est pas dans le message ouvert, pourquoi ?",
      r: "C'est le fonctionnement prévu : Microsoft précise qu'Outlook classique n'ajoute pas une nouvelle signature au message déjà ouvert. Insérez-la à la main pour ce message, avec le bouton Signature de l'onglet Message. Les messages suivants la recevront automatiquement si vous l'avez choisie dans « Nouveaux messages » et « Réponses/transferts ».",
    },
    {
      q: "Je n'ai pas de menu Fichier dans mon Outlook, quelle marche à suivre prendre ?",
      r: "Sans menu Fichier, vous êtes sur le nouvel Outlook pour Windows ou sur Outlook dans le navigateur : la signature se règle par la roue dentée Paramètres, puis Comptes et Signatures. Le chemin Fichier, Options, Courrier, Signatures appartient à Outlook classique, la version de bureau fournie avec Microsoft 365, Outlook 2021 ou 2024. Sur Mac, passez par le menu Outlook, puis Paramètres.",
    },
    {
      q: "Ma signature Outlook n'apparaît pas sur mon iPhone, faut-il la recréer ?",
      r: "Oui. L'application Outlook pour iOS et Android a sa propre signature, réglée dans ses Paramètres, rubrique Signature ; par défaut, elle affiche « Obtenir Outlook pour iOS » ou « pour Android ». Remplacez ce texte par une version courte : nom, poste et numéro de téléphone. La mise en page Compacte du générateur donne exactement ces lignes, à recopier.",
    },
    {
      q: "Mon logo arrive en pièce jointe chez certains correspondants, comment l'éviter ?",
      r: "Microsoft signale que les balises VML dans une signature peuvent faire apparaître des éléments en pièces jointes au lieu d'images incluses. Le code de ce générateur n'en contient pas : le logo est appelé par son adresse https. Si le problème persiste, vérifiez que l'adresse de l'image est publique et qu'elle ne pointe pas vers un fichier de votre ordinateur.",
    },
    {
      q: "Je change d'ordinateur, ma signature Outlook classique va-t-elle suivre ?",
      r: "Pas forcément. Microsoft indique que les signatures « sur cet appareil » sont stockées localement et peuvent manquer sur un autre poste ; seules celles gérées par le compte Microsoft suivent, quand c'est disponible. Gardez le fichier .htm téléchargé ici : copié dans le dossier Signatures du nouvel ordinateur, il réinstalle la même signature en deux minutes, sans rien retaper.",
    },
    {
      q: "Le fichier .htm s'ouvre dans mon navigateur au lieu d'Outlook, est-ce normal ?",
      r: "Oui : c'est une page web, et un double-clic l'ouvre dans le navigateur. Il ne faut pas l'ouvrir, mais le copier dans le dossier %APPDATA%\\Microsoft\\Signatures, Outlook classique fermé. Au redémarrage, la signature apparaît dans la fenêtre Signatures sous le nom du fichier. Le nouvel Outlook et Outlook sur le web ne lisent pas ce dossier : collez-y la signature copiée.",
    },
  ],
  en: [
    {
      q: "I created my signature in classic Outlook but it is missing from the open message, why?",
      r: "That is how it works: Microsoft says classic Outlook does not add a new signature to the message you opened to create it. Add it by hand to that one message with the Signature button on the Message tab. Every later message gets it automatically if you chose it under New messages and Replies/forwards in the Signatures window.",
    },
    {
      q: "My Outlook has no File menu, which steps should I follow?",
      r: "Without a File menu you are on new Outlook for Windows or Outlook on the web: the signature lives under Settings (gear icon), Accounts, Signatures. The File, Options, Mail, Signatures path belongs to classic Outlook, the desktop app that comes with Microsoft 365, Outlook 2021 or 2024. On a Mac, use the Outlook menu, then Settings, then Signatures under Mail.",
    },
    {
      q: "Why does the Outlook app on my phone still say Get Outlook for iOS?",
      r: "Because the mobile app keeps its own signature, separate from the desktop one, and that line is its default. Open the app's Settings, tap Signature and replace the text with a short version: name, job title and phone number. The Compact layout of this generator gives exactly those lines to retype. The same applies on Android, where the default reads Get Outlook for Android.",
    },
    {
      q: "Why does my logo arrive as an attachment for some people?",
      r: "Microsoft notes that VML tags in a signature can make elements show up as attachments instead of inline pictures. The code from this generator contains none: the logo is loaded from its https address. If the problem persists, check that the image address is public and does not point to a file on your own computer or an intranet server.",
    },
    {
      q: "The .htm file opens in my browser instead of Outlook, is that normal?",
      r: "Yes: it is a web page, so double-clicking opens it in the browser. Do not open it; copy it into the %APPDATA%\\Microsoft\\Signatures folder while classic Outlook is closed. When Outlook restarts, the signature appears in the Signatures window under the file's name. New Outlook and Outlook on the web do not read that folder: paste the copied signature there instead.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Support Microsoft", titre: "Comment ajouter et modifier une signature électronique dans Outlook", url: "https://support.microsoft.com/fr-fr/office/comment-ajouter-et-modifier-une-signature-%C3%A9lectronique-dans-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2", lu: "27 octobre 2026" },
    { editeur: "Support Microsoft", titre: "Créer, insérer ou modifier une signature dans Outlook pour Mac", url: "https://support.microsoft.com/fr-fr/office/cr%C3%A9er-ins%C3%A9rer-ou-modifier-une-signature-dans-outlook-pour-mac-f4d21492-0956-4429-95ad-2769745b539c", lu: "27 octobre 2026" },
    { editeur: "Support Microsoft", titre: "Utiliser un lecteur d'écran pour ajouter une signature dans Outlook (sections iOS et Android)", url: "https://support.microsoft.com/fr-fr/accessibility/outlook/use-a-screen-reader-to-add-a-signature-in-outlook", lu: "27 octobre 2026" },
    { editeur: "Support Microsoft", titre: "Bloquer ou débloquer le téléchargement automatique d'images dans les messages e-mail Outlook classiques", url: "https://support.microsoft.com/fr-fr/outlook/block-or-unblock-automatic-picture-downloads-in-classic-outlook-email-messages", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Microsoft Support", titre: "How to add and change an email signature in Outlook", url: "https://support.microsoft.com/en-us/office/create-and-add-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Create, insert, or change a signature in Outlook for Mac", url: "https://support.microsoft.com/en-us/office/create-insert-or-change-a-signature-in-outlook-for-mac-f4d21492-0956-4429-95ad-2769745b539c", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Use a screen reader to add a signature in Outlook (iOS and Android tabs)", url: "https://support.microsoft.com/en-us/accessibility/outlook/use-a-screen-reader-to-add-a-signature-in-outlook", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Block or unblock automatic picture downloads in classic Outlook email messages", url: "https://support.microsoft.com/en-us/outlook/block-or-unblock-automatic-picture-downloads-in-classic-outlook-email-messages", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de signature Outlook 75tools",
    motsCles: "créer une signature outlook, signature outlook, modèle de signature outlook, signature outlook 365, signature outlook classique",
    copie: "Signature copiée. Dans Outlook, collez-la (Ctrl + V ou Cmd + V) dans la zone d'édition de la signature.",
    aide: "Mentions d'identification de l'entreprise (Siren, RCS, EI), si votre statut l'exige.",
    bouton: "Télécharger le fichier .htm",
    telecharge: (nom: string) => `Fichier ${nom} téléchargé : voyez plus bas comment l'ajouter à Outlook classique.`,
  },
  en: {
    nomAppli: "75tools Outlook signature generator",
    motsCles: "outlook signature, create outlook signature, outlook signature template, outlook 365 signature, classic outlook signature",
    copie: "Signature copied. In Outlook, paste it (Ctrl + V or Cmd + V) into the signature editing box.",
    aide: "French business identifiers (SIREN, RCS, EI) if your status requires them.",
    bouton: "Download .htm file",
    telecharge: (nom: string) => `${nom} downloaded: see below how to add it to classic Outlook.`,
  },
};

const SignatureOutlook = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <GenerateurSignature
      key={lang}
      exemple={EXEMPLE[lang]}
      messageCopie={t.copie}
      aideMention={t.aide}
      boutonsApercu={({ html, donnees, signaler }) => (
        <Bouton
          secondaire
          onClick={() => {
            const nom = nomFichier(donnees.nom);
            telecharger(nom, new Blob([documentHtm(html, donnees.nom || "Signature", lang)], { type: "text/html;charset=utf-8" }));
            signaler(t.telecharge(nom));
          }}
        >
          {t.bouton}
        </Bouton>
      )}
    />
  );
  return (
    <PageOutil
      id="signature-outlook"
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
    <Section titre="Créer une signature Outlook en copiant-collant">
      <p>
        Pour créer une signature Outlook, remplissez vos coordonnées dans le générateur ci-dessus, choisissez une
        mise en page, cliquez sur « Copier la signature », puis collez-la dans Outlook : dans le nouvel Outlook et
        sur le web, par Paramètres, Comptes, Signatures ; dans Outlook classique, par Fichier, Options, Courrier,
        Signatures. Le code produit n'utilise que des tableaux et des styles en ligne, sans balises VML ni image
        incorporée, ce qui évite le logo transformé en pièce jointe signalé par Microsoft. Pour Outlook classique,
        le bouton « Télécharger le fichier .htm » donne en plus une page autonome, à déposer dans le dossier
        Signatures pour installer la même signature sur trois ou dix postes. Exemple : un commercial avec fixe,
        mobile, e-mail et site obtient une signature de quatre lignes en moins d'une minute. La limite : la
        signature ne se synchronise pas entre Outlook classique, Outlook sur le web et l'application mobile, qu'il
        faut régler chacun à part.
      </p>
    </Section>

    <Section id="installer-outlook" titre="Installer la signature dans chaque version d'Outlook">
      <p>
        Outlook existe en cinq variantes qui ne rangent pas la signature au même endroit. Repérez la vôtre, collez
        la signature copiée ci-dessus, puis choisissez quand elle s'ajoute : aux nouveaux messages, aux réponses et
        transferts, ou aux deux.
      </p>
      <h3>Nouvel Outlook pour Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Cliquez sur la roue dentée Paramètres, puis sur Comptes et Signatures (« Signatures de comptes » dans certaines versions).</li>
        <li>Si plusieurs comptes sont ajoutés, choisissez celui qui recevra la signature.</li>
        <li>Sélectionnez « Ajoutez une signature », donnez-lui un nom distinct et collez-la dans la zone d'édition.</li>
        <li>Cochez les cases du bas pour l'appliquer aux nouveaux messages, aux réponses et transferts, puis Enregistrer.</li>
      </ol>
      <h3>Outlook sur le web et Outlook.com</h3>
      <p>
        Même chemin dans le navigateur : Paramètres en haut de la page, Comptes, Signatures, « Ajoutez une
        signature ». Microsoft précise que si vous utilisez à la fois Outlook sur votre PC et Outlook sur le web,
        il faut créer la signature dans les deux.
      </p>
      <h3>Outlook classique pour Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>
          Ouvrez Fichier, Options, Courrier, puis le bouton Signatures (ou, dans un nouveau message, onglet Message,
          Signature, Signatures).
        </li>
        <li>Dans « Compte de messagerie », choisissez le compte : chaque compte peut avoir sa propre signature.</li>
        <li>Cliquez sur Nouveau, nommez la signature et collez-la dans le cadre « Modifier la signature ».</li>
        <li>
          Sous « Choisir une signature par défaut », sélectionnez-la dans Nouveaux messages et, si vous le voulez,
          dans Réponses/transferts, puis OK.
        </li>
      </ol>
      <h3>Outlook pour Mac</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Menu Outlook, Paramètres, puis Signatures sous Courrier.</li>
        <li>Cliquez sur le bouton Ajouter (+), nommez la signature et collez-la dans l'Éditeur de signature.</li>
        <li>
          Sous « Définir la signature par défaut », choisissez le compte, puis réglez « Pour les nouveaux messages »
          et « Pour les réponses ou les transferts ». Recommencez pour chaque compte.
        </li>
      </ol>
      <p>
        Microsoft indique que la prise en charge de l'ancien Outlook pour Mac prend fin en octobre 2026 : si vos
        menus ne correspondent pas, mettez Outlook à jour.
      </p>
      <h3>Outlook pour iPhone, iPad et Android</h3>
      <p>
        L'application a sa propre signature, sans lien avec celle du PC : par défaut, elle ajoute « Obtenir Outlook
        pour iOS » ou « Obtenir Outlook pour Android » à vos messages. Remplacez-la dans les Paramètres de
        l'application, rubrique Signature. L'éditeur y est pensé pour du texte : tapez une version courte, nom,
        poste et téléphone, celle que donne la mise en page Compacte.
      </p>
    </Section>

    <Section titre="Outlook classique : ajouter la signature par le fichier .htm">
      <p>
        Le bouton « Télécharger le fichier .htm » enregistre la signature sous forme de page HTML autonome, en
        UTF-8, avec le même code que la copie. C'est utile quand le copier-coller perd la mise en forme, ou pour
        installer la même signature sur plusieurs postes. Outlook classique range les signatures « sur cet
        appareil » dans un dossier local de votre profil Windows, que l'on ouvre en tapant{" "}
        <code className="text-neutral-100 [overflow-wrap:anywhere]">%APPDATA%\Microsoft\Signatures</code> dans la
        barre d'adresse de l'Explorateur de fichiers.
      </p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Fermez Outlook classique.</li>
        <li>Copiez le fichier .htm téléchargé dans ce dossier ; son nom devient celui de la signature.</li>
        <li>Rouvrez Outlook, puis la fenêtre Signatures : la signature apparaît dans la liste.</li>
        <li>Choisissez-la comme signature par défaut, comme ci-dessus.</li>
      </ol>
      <p>
        Cette méthode n'est pas décrite dans l'article de Microsoft, qui recommande de coller la signature dans
        l'éditeur ; elle ne vaut que pour Outlook classique. Si le dossier n'existe pas, créez d'abord une
        signature quelconque dans Outlook : il sera créé.
      </p>
    </Section>

    <Section titre="Synchronisation, images bloquées et réponses">
      <p>
        <strong>Les images bloquées.</strong> Outlook classique est réglé par défaut pour ne pas télécharger
        automatiquement les images venues d'internet : votre logo s'affiche chez un nouveau correspondant seulement
        quand il clique sur « Télécharger les images » ou vous ajoute à ses expéditeurs approuvés. C'est pourquoi le
        générateur écrit nom, téléphone et e-mail en vrai texte : la signature reste complète même sans le logo.
      </p>
      <p>
        <strong>Une signature plus courte pour les réponses.</strong> Créez la signature complète, puis une
        seconde en mise en page Compacte, et associez-la aux réponses : un fil de discussion reste lisible au lieu
        d'empiler dix fois votre bloc complet. Pour Gmail, la marche à suivre est sur la page{" "}
        <Link to="/signature-gmail/">signature Gmail</Link> ; pour Apple Mail, sur la page{" "}
        <Link to="/signature-mail/">signature mail</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Create an Outlook signature by copy and paste">
      <p>
        To create an Outlook signature, fill in your details in the generator above, pick a layout, click Copy
        signature and paste it into Outlook: in new Outlook and on the web, through Settings, Accounts, Signatures;
        in classic Outlook, through File, Options, Mail, Signatures. The code uses only tables and inline styles,
        with no VML tags and no embedded image, which avoids the logo-as-attachment problem Microsoft describes. For
        classic Outlook, the Download .htm file button also gives you a standalone page to drop into the Signatures
        folder, handy to install the same signature on three or ten PCs. Example: a sales manager with an office
        line, a mobile, an email and a website gets a four-line signature in under a minute, with English labels
        (Office, Mobile). The main limit: the signature does not sync between classic Outlook, Outlook on the web
        and the mobile app, so each one has to be set separately.
      </p>
    </Section>

    <Section id="install-outlook" titre="Installing the signature in each version of Outlook">
      <p>
        Outlook comes in five flavours that keep the signature in different places. Find yours, paste the
        signature you copied above, then choose when it is added: to new messages, to replies and forwards, or
        both. The steps use the English menu names; if your work PC in France runs Outlook in French, the same
        menus read Paramètres, Comptes, Signatures, or Fichier, Options, Courrier, Signatures in classic Outlook.
      </p>
      <h3>New Outlook for Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Select Settings (the gear icon), then Accounts &gt; Signatures.</li>
        <li>If you have more than one account, select the one the signature is for.</li>
        <li>Select Add signature, give it a distinct name and paste it into the editing box.</li>
        <li>Use the checkboxes at the bottom to apply it to new messages and to replies and forwards, then Save.</li>
      </ol>
      <h3>Outlook on the web and Outlook.com</h3>
      <p>
        Same path in the browser: Settings at the top of the page, Accounts &gt; Signatures, Add signature. Microsoft
        notes that if you use both Outlook on your PC and Outlook on the web, you need to create the signature in
        both.
      </p>
      <h3>Classic Outlook for Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Go to File &gt; Options &gt; Mail &gt; Signatures (or, in a new message, Message &gt; Signature &gt; Signatures).</li>
        <li>In the E-mail account drop-down box, choose the account: each account can have its own signature.</li>
        <li>Under Select signature to edit, choose New, name the signature and paste it into the Edit signature box.</li>
        <li>Under Choose default signature, select it in New messages and, if you wish, in Replies/forwards, then OK.</li>
      </ol>
      <h3>Outlook for Mac</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>On the Outlook menu, select Settings, then Signatures under Mail.</li>
        <li>Select the + button, type a name and paste the signature into the Signature editor.</li>
        <li>
          Under Set default signature, choose the account, then set For new messages and For replies or forwards.
          Repeat for each account.
        </li>
      </ol>
      <p>
        Microsoft says support for legacy Outlook for Mac ends in October 2026: if your menus look different,
        update Outlook.
      </p>
      <h3>Outlook for iPhone, iPad and Android</h3>
      <p>
        The app has its own signature, unrelated to the desktop one: by default it adds Get Outlook for iOS or Get
        Outlook for Android to your messages. Replace it in the app's Settings, under Signature. The editor is
        built for plain text, so type a short version with your name, job title and phone number, the one the
        Compact layout shows.
      </p>
    </Section>

    <Section titre="Classic Outlook: adding the signature with the .htm file">
      <p>
        The Download .htm file button saves the signature as a standalone UTF-8 HTML page with the same code as the
        copy. It helps when copy and paste loses the formatting, or to install the same signature on several PCs.
        Classic Outlook keeps signatures stored on this device in a local folder of your Windows profile, which you
        open by typing <code className="text-neutral-100 [overflow-wrap:anywhere]">%APPDATA%\Microsoft\Signatures</code>{" "}
        in the File Explorer address bar.
      </p>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Close classic Outlook.</li>
        <li>Copy the downloaded .htm file into that folder; its name becomes the signature's name.</li>
        <li>Reopen Outlook, then the Signatures window: the signature is in the list.</li>
        <li>Set it as your default signature, as above.</li>
      </ol>
      <p>
        Microsoft's article does not describe this method and recommends pasting into the editor; it only works
        for classic Outlook. If the folder does not exist, create any signature in Outlook first and it will appear.
      </p>
    </Section>

    <Section titre="Blocked pictures, replies and French business details">
      <p>
        <strong>Blocked pictures.</strong> Classic Outlook does not download internet pictures automatically by
        default: a new contact only sees your logo after clicking to download pictures or adding you to their safe
        senders. That is why your name, phone and email are real text in the generated signature.
      </p>
      <p>
        <strong>A shorter signature for replies.</strong> Create the full signature, then a second one with the
        Compact layout, and assign it to replies so a long thread does not repeat your full block ten times. If your
        business is registered in France, the Legal line field holds the SIREN and EI details French rules expect;
        the <Link to="/en/email-signature/">email signature generator</Link> page explains them, and the{" "}
        <Link to="/en/gmail-signature/">Gmail signature</Link> page covers Gmail.
      </p>
    </Section>
  </>
);

export default SignatureOutlook;
