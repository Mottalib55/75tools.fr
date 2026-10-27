import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { GenerateurSignature } from "@/components/outils/GenerateurSignature";
import { DonneesSignature, echapper } from "@/lib/signature";
import { telecharger } from "@/lib/fichiers";

const LU = "27 octobre 2026";

const EXEMPLE: DonneesSignature = {
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
};

/** Nom de fichier sans accent ni espace : « Julien-Lefevre.htm ». */
const nomFichier = (nom: string) =>
  (nom.trim() || "signature")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + ".htm";

/** Page HTML complète, en UTF-8, telle qu'Outlook classique la lit dans son dossier Signatures. */
const documentHtm = (html: string, titre: string) =>
  `<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n<title>${echapper(titre)}</title>\n</head>\n<body>\n${html}\n</body>\n</html>\n`;

const FAQ: QuestionFaq[] = [
  {
    q: "J'ai créé ma signature dans Outlook classique, mais elle n'est pas dans le message ouvert, pourquoi ?",
    r: "C'est le fonctionnement prévu : Microsoft précise qu'Outlook classique n'ajoute pas une nouvelle signature au message déjà ouvert. Insérez-la à la main pour ce message, avec le bouton Signature de l'onglet Message. Les messages suivants la recevront automatiquement si vous l'avez choisie dans « Nouveaux messages » et « Réponses/transferts ».",
  },
  {
    q: "Je n'ai pas de menu Fichier dans mon Outlook, quelle marche à suivre prendre ?",
    r: "Sans menu Fichier, vous êtes sur le nouvel Outlook pour Windows ou sur Outlook dans le navigateur : la signature se règle par la roue dentée Paramètres, puis Signatures de comptes. Le menu Fichier, Options, Courrier, Signatures appartient à Outlook classique, la version de bureau fournie avec Microsoft 365, Outlook 2021 ou 2024. Sur Mac, passez par le menu Outlook, puis Paramètres.",
  },
  {
    q: "Ma signature Outlook n'apparaît pas sur mon iPhone, faut-il la recréer ?",
    r: "Oui. L'application Outlook pour iOS et Android a sa propre signature, réglée dans ses Paramètres, rubrique Signature ; par défaut, elle affiche « Obtenir Outlook pour iOS » ou « pour Android ». Remplacez ce texte par une version courte : nom, poste et numéro de téléphone. La mise en page Compacte du générateur donne exactement ces lignes, à recopier.",
  },
  {
    q: "Mon logo arrive en pièce jointe chez certains correspondants, comment l'éviter ?",
    r: "Microsoft signale que les balises VML dans une signature peuvent faire apparaître des éléments en pièces jointes au lieu d'images incluses. Le code de ce générateur n'en contient pas : le logo est appelé par son adresse https. Si le problème persiste, vérifiez que l'adresse de l'image est publique et qu'elle ne pointe pas vers un fichier de votre ordinateur.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Support Microsoft", titre: "Comment ajouter et modifier une signature électronique dans Outlook", url: "https://support.microsoft.com/fr-fr/office/comment-ajouter-et-modifier-une-signature-%C3%A9lectronique-dans-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2", lu: LU },
  { editeur: "Support Microsoft", titre: "Créer, insérer ou modifier une signature dans Outlook pour Mac", url: "https://support.microsoft.com/fr-fr/office/cr%C3%A9er-ins%C3%A9rer-ou-modifier-une-signature-dans-outlook-pour-mac-f4d21492-0956-4429-95ad-2769745b539c", lu: LU },
  { editeur: "Support Microsoft", titre: "Utiliser un lecteur d'écran pour ajouter une signature dans Outlook (sections iOS et Android)", url: "https://support.microsoft.com/fr-fr/accessibility/outlook/use-a-screen-reader-to-add-a-signature-in-outlook", lu: LU },
  { editeur: "Support Microsoft", titre: "Bloquer ou débloquer le téléchargement automatique d'images dans les messages e-mail Outlook classiques", url: "https://support.microsoft.com/fr-fr/outlook/block-or-unblock-automatic-picture-downloads-in-classic-outlook-email-messages", lu: LU },
];

const SignatureOutlook = () => (
  <PageOutil
    href="/signature-outlook/"
    titre="Signature Outlook : modèle gratuit à créer et installer"
    description="Signature Outlook gratuite : générez-la, copiez-la ou téléchargez le .htm, puis installez-la dans le nouvel Outlook, Outlook classique, Mac ou mobile."
    motsCles="signature outlook, créer une signature outlook, modèle de signature outlook, signature mail outlook html, signature outlook 365, signature outlook classique"
    nomAppli="Générateur de signature Outlook"
    categorieAppli="BusinessApplication"
    h1="Créer une signature Outlook"
    chapeau="Composez la signature, copiez-la, puis suivez la marche à suivre de votre version d'Outlook : nouvel Outlook, Outlook classique, Outlook sur le web, Mac ou mobile. Pour Outlook classique, vous pouvez aussi télécharger le fichier .htm."
    faq={FAQ}
    sources={SOURCES}
  >
    <GenerateurSignature
      exemple={EXEMPLE}
      messageCopie="Signature copiée. Dans Outlook, collez-la (Ctrl + V ou Cmd + V) dans la zone d'édition de la signature."
      aideMention="Mentions d'identification de l'entreprise (Siren, RCS, EI), si votre statut l'exige."
      boutonsApercu={({ html, donnees, signaler }) => (
        <Bouton
          secondaire
          onClick={() => {
            const nom = nomFichier(donnees.nom);
            telecharger(nom, new Blob([documentHtm(html, donnees.nom || "Signature")], { type: "text/html;charset=utf-8" }));
            signaler(`Fichier ${nom} téléchargé : voyez plus bas comment l'ajouter à Outlook classique.`);
          }}
        >
          Télécharger le fichier .htm
        </Bouton>
      )}
    />

    <Section id="installer-outlook" titre="Installer la signature dans chaque version d'Outlook">
      <p>
        Outlook existe en cinq variantes qui ne rangent pas la signature au même endroit. Repérez la vôtre, collez
        la signature copiée ci-dessus, puis choisissez quand elle s'ajoute : aux nouveaux messages, aux réponses et
        transferts, ou aux deux.
      </p>
      <h3>Nouvel Outlook pour Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Cliquez sur la roue dentée Paramètres, puis sur Signatures de comptes.</li>
        <li>Si plusieurs comptes sont ajoutés, choisissez celui qui recevra la signature.</li>
        <li>Sélectionnez « Ajoutez une signature », donnez-lui un nom distinct et collez-la dans la zone d'édition.</li>
        <li>Cochez les cases du bas pour l'appliquer aux nouveaux messages, aux réponses et transferts, puis Enregistrer.</li>
      </ol>
      <h3>Outlook sur le web et Outlook.com</h3>
      <p>
        Même chemin dans le navigateur : Paramètres en haut de la page, Signatures de comptes, « Ajoutez une
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
        l'éditeur ; elle ne vaut que pour Outlook classique. Le nouvel Outlook et Outlook sur le web gardent les
        signatures dans le compte et ne lisent pas ce dossier. Si le dossier n'existe pas, créez d'abord une
        signature quelconque dans Outlook : il sera créé.
      </p>
    </Section>

    <Section titre="Synchronisation, images bloquées et réponses">
      <p>
        <strong>Une signature par appareil, ou par compte.</strong> Dans Outlook classique, Microsoft avertit que
        les « signatures sur cet appareil » sont stockées localement et peuvent manquer sur un autre ordinateur.
        Pour retrouver la même signature partout où c'est possible, créez-la et gérez-la via votre compte
        Microsoft. En pratique, gardez le fichier .htm ou cette page sous la main pour la réinstaller en deux
        minutes sur un nouveau poste.
      </p>
      <p>
        <strong>Les images bloquées.</strong> Outlook classique est réglé par défaut pour ne pas télécharger
        automatiquement les images venues d'internet : votre logo s'affiche chez un nouveau correspondant seulement
        quand il clique sur « Télécharger les images » ou vous ajoute à ses expéditeurs approuvés. C'est pourquoi le
        générateur écrit nom, téléphone et e-mail en vrai texte : la signature reste complète même sans le logo.
      </p>
      <p>
        <strong>Une signature plus courte pour les réponses.</strong> Sur ordinateur, Outlook permet de choisir
        une signature différente pour les réponses et transferts. Créez la signature complète, puis une
        seconde en mise en page Compacte, et associez-la aux réponses : un fil de discussion reste lisible au lieu
        d'empiler dix fois votre bloc complet. Pour Gmail, la marche à suivre détaillée est sur la page{" "}
        <Link to="/signature-gmail/">signature Gmail</Link>.
      </p>
    </Section>
  </PageOutil>
);

export default SignatureOutlook;
