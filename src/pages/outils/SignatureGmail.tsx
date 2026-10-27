import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { GenerateurSignature } from "@/components/outils/GenerateurSignature";
import { DonneesSignature } from "@/lib/signature";

const LU = "27 octobre 2026";
const LIMITE = 10000;

const EXEMPLE: DonneesSignature = {
  nom: "Sophie Bernard",
  poste: "Architecte d'intérieur",
  entreprise: "Studio Bernard",
  telephone: "",
  mobile: "07 11 22 33 44",
  email: "sophie@exemple.fr",
  site: "www.exemple.fr",
  adresse: "",
  linkedin: "",
  lienLibelle: "Prendre rendez-vous",
  lienUrl: "www.exemple.fr/rendez-vous",
  couleur: "#be123c",
  photoUrl: "",
  logoUrl: "",
  mention: "",
};

const FAQ: QuestionFaq[] = [
  {
    q: "Gmail refuse ma signature parce qu'elle est trop longue, que faire ?",
    r: "Une signature Gmail peut contenir jusqu'à 10 000 caractères, et une image insérée compte dans ce total. Le plus souvent, c'est un logo importé depuis l'ordinateur qui fait déborder : appelez-le plutôt par son adresse web, comme le fait ce générateur. Le compteur sous l'aperçu donne la longueur du code produit ; s'il approche la limite, retirez un lien ou passez en mise en page Compacte.",
  },
  {
    q: "Mon logo stocké sur Google Drive ne s'affiche pas chez mes destinataires, pourquoi ?",
    r: "Pour qu'une image de Drive apparaisse dans une signature, Google demande qu'elle soit partagée publiquement : Partager, puis sous « Obtenir le lien », « Tous les utilisateurs disposant du lien » avec le rôle Lecteur. L'image disparaît aussi si le fichier, ou le document Google qui la contient, est supprimé. Sur un compte professionnel, l'administrateur doit parfois autoriser ce partage.",
  },
  {
    q: "Sur l'application Gmail de mon téléphone, quelle signature est ajoutée ?",
    r: "Tant que vous n'avez pas créé de signature mobile, l'application ajoute la signature réglée sur ordinateur. Si vous activez la signature mobile, elle la remplace pour les messages envoyés depuis l'application : c'est un simple texte, à saisir dans les paramètres du compte. Sur iPhone et iPad, Google précise qu'il faut la régler pour chaque compte ajouté à l'application.",
  },
  {
    q: "Mon entreprise utilise Google Workspace, puis-je changer la signature imposée ?",
    r: "Cela dépend de ce que l'administrateur a mis en place. Une signature identique appliquée à tous par l'API Gmail reste modifiable par chaque utilisateur. En revanche, un pied de page ajouté par la console d'administration, dans les réglages de conformité de Gmail, s'ajoute à l'envoi : vous ne le voyez pas en rédigeant et vous ne pouvez ni le modifier ni le supprimer.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail (ordinateur)", url: "https://support.google.com/mail/answer/8395?hl=fr", lu: LU },
  { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail : téléphone et tablette Android", url: "https://support.google.com/mail/answer/8395?hl=fr&co=GENIE.Platform%3DAndroid", lu: LU },
  { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail : iPhone et iPad", url: "https://support.google.com/mail/answer/8395?hl=fr&co=GENIE.Platform%3DiOS", lu: LU },
  { editeur: "Aide Gmail (Google)", titre: "Résoudre les problèmes liés aux signatures Gmail", url: "https://support.google.com/mail/answer/11468381?hl=fr", lu: LU },
  { editeur: "Aide Google Workspace", titre: "Configurer les signatures des utilisateurs Google Workspace dans Gmail", url: "https://knowledge.workspace.google.com/admin/gmail/set-up-google-workspace-user-signatures-in-gmail?hl=fr", lu: LU },
];

const SignatureGmail = () => (
  <PageOutil
    href="/signature-gmail/"
    titre="Signature Gmail avec logo : générateur gratuit en ligne"
    description="Signature Gmail gratuite avec logo, liens et couleur : générez-la, collez-la dans Gmail, réglez la version mobile et restez sous la limite de caractères."
    motsCles="signature gmail, créer une signature gmail, signature gmail avec logo, modèle de signature gmail, signature gmail mobile, signature google workspace"
    nomAppli="Générateur de signature Gmail"
    categorieAppli="BusinessApplication"
    h1="Créer une signature Gmail"
    chapeau="Remplissez vos coordonnées, ajoutez votre logo par son adresse web, puis copiez la signature dans les paramètres de Gmail. Le compteur vérifie qu'elle reste sous la limite de 10 000 caractères fixée par Google."
    faq={FAQ}
    sources={SOURCES}
  >
    <GenerateurSignature
      exemple={EXEMPLE}
      messageCopie="Signature copiée. Dans Gmail, collez-la (Ctrl + V ou Cmd + V) dans le champ de la section Signature."
      aideMention="Mentions d'identification de l'entreprise (Siren, RCS, EI), si votre statut l'exige."
      sousApercu={({ html }) => {
        const n = html.length;
        const depasse = n > LIMITE;
        return (
          <p role="status" className={depasse ? "text-sm text-amber-300" : "text-sm text-neutral-400"}>
            Longueur du code : {n.toLocaleString("fr-FR")} caractères sur {LIMITE.toLocaleString("fr-FR")} admis par
            Gmail.
            {depasse
              ? " C'est trop : retirez un lien ou choisissez la mise en page Compacte."
              : " Gmail compte à sa façon, mais une signature bien en dessous passe sans erreur."}
          </p>
        );
      }}
    />

    <Section id="installer-gmail" titre="Ajouter la signature dans Gmail sur ordinateur">
      <ol className="list-decimal pl-6 space-y-1">
        <li>Copiez la signature avec le bouton « Copier la signature ».</li>
        <li>Dans Gmail, cliquez en haut à droite sur Paramètres, puis sur « Voir tous les paramètres ».</li>
        <li>Dans l'onglet Général, descendez jusqu'à la section Signature et créez une nouvelle signature.</li>
        <li>Collez-la dans le champ (Ctrl + V, ou Cmd + V sur Mac), sans passer par un collage « texte brut ».</li>
        <li>Choisissez-la pour les nouveaux e-mails et pour les réponses, puis cliquez sur « Enregistrer les modifications » en bas de page.</li>
      </ol>
      <p>
        <strong>Plusieurs signatures.</strong> Gmail accepte plusieurs signatures : par exemple une complète
        pour les nouveaux messages, une courte pour les réponses, une en anglais. Pendant la rédaction, le bouton « Insérer
        une signature » de la barre d'outils permet d'en changer pour un message précis.
      </p>
      <p>
        <strong>Une signature par adresse.</strong> Si vous écrivez depuis d'autres adresses grâce à « Envoyer
        des e-mails en tant que », Gmail accepte une signature distincte pour chacune : choisissez l'adresse dans le
        menu déroulant placé au-dessus du champ Signature. Si ce menu manque, vérifiez dans l'onglet « Comptes et
        importation » que vos adresses figurent bien dans cette rubrique.
      </p>
      <p>
        <strong>Signature au-dessus de la citation.</strong> Dans une longue conversation, la signature se place
        par défaut sous le message cité. Sous le champ Signature, une case permet de l'insérer avant le texte cité
        dans les réponses, en supprimant la ligne « -- » qui la précède.
      </p>
    </Section>

    <Section titre="Signature Gmail avec logo : deux façons de faire">
      <p>
        <strong>Par l'adresse web de l'image, avec ce générateur.</strong> Mettez votre logo en ligne (sur votre
        site, par exemple) et collez son adresse https dans le champ Logo. La signature copiée n'embarque que
        l'adresse : elle reste légère, ce qui compte pour la limite de 10 000 caractères, dans laquelle Google
        inclut les images.
      </p>
      <p>
        <strong>Par l'éditeur de Gmail.</strong> Après avoir collé une signature sans logo, placez le curseur et
        utilisez le bouton d'insertion d'image de l'éditeur de signature : il propose une image de votre Drive, un
        fichier importé ou une adresse web. Si vous choisissez Drive, partagez l'image avec « Tous les
        utilisateurs disposant du lien », rôle Lecteur, sinon vos destinataires verront un cadre vide.
      </p>
      <p>
        Pour la taille, l'aide Gmail recommande une image de 70 à 100 pixels de haut et de 300 à 400 pixels de
        large. Une image trop lourde provoque l'erreur de longueur ou s'affiche mal : réduisez-la avant de
        l'importer, par exemple avec l'outil{" "}
        <Link to="/redimensionner-image/">redimensionner une image</Link>.
      </p>
    </Section>

    <Section titre="Sur téléphone et dans Google Workspace">
      <h3>Application Gmail sur Android</h3>
      <p>
        Menu en haut à gauche, Paramètres tout en bas, choisissez le compte, puis « Signature mobile » : tapez le
        texte et validez. Cette signature ne s'ajoute qu'aux messages envoyés depuis l'application.
      </p>
      <h3>Application Gmail sur iPhone et iPad</h3>
      <p>
        Menu, Paramètres, rubrique « Rédiger et répondre », « Paramètres de signature » : activez « Signature
        mobile », écrivez-la, puis revenez en arrière pour enregistrer. À refaire pour chaque compte de
        l'application.
      </p>
      <p>
        Dans les deux cas, la signature mobile est du texte simple, sans logo ni mise en forme. Sans signature
        mobile, l'application reprend celle de l'ordinateur ; en créer une courte (nom, fonction, numéro) évite
        un bloc chargé en bas d'un message écrit en deux lignes.
      </p>
      <h3>Comptes Google Workspace</h3>
      <p>
        Sur un compte professionnel, l'administrateur peut appliquer une même signature à tous les utilisateurs
        par l'API Gmail ; chacun peut ensuite la modifier. Il peut aussi ajouter un pied de page à tous les
        messages sortants, depuis la console d'administration (Applications, Google Workspace, Gmail,
        Conformité) : ce texte, ajouté à l'envoi, n'est pas modifiable par les utilisateurs, et un changement peut
        mettre jusqu'à 24 heures à s'appliquer. Si votre signature personnelle répète les mentions de ce pied de
        page, retirez-les. Pour Outlook, voyez la page <Link to="/signature-outlook/">signature Outlook</Link>.
      </p>
    </Section>
  </PageOutil>
);

export default SignatureGmail;
