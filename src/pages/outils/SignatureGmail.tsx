import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { GenerateurSignature } from "@/components/outils/GenerateurSignature";
import { DonneesSignature } from "@/lib/signature";
import { locale, type Langue } from "@/lib/langue";

const LIMITE = 10000;

const EXEMPLE: Record<Langue, DonneesSignature> = {
  fr: {
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
  },
  en: {
    nom: "Sophie Bennett",
    poste: "Interior designer",
    entreprise: "Bennett Studio",
    telephone: "",
    mobile: "07 11 22 33 44",
    email: "sophie@example.com",
    site: "www.example.com",
    adresse: "",
    linkedin: "",
    lienLibelle: "Book a call",
    lienUrl: "www.example.com/book",
    couleur: "#be123c",
    photoUrl: "",
    logoUrl: "",
    mention: "",
  },
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Gmail refuse ma signature parce qu'elle est trop longue, que faire ?",
      r: "Une signature Gmail peut contenir jusqu'à 10 000 caractères, et une image insérée compte dans ce total. Le plus souvent, c'est un logo importé depuis l'ordinateur qui fait déborder : appelez-le plutôt par son adresse web, comme le fait ce générateur. Le compteur sous l'aperçu donne la longueur du code produit ; s'il approche la limite, retirez un lien ou passez en mise en page Compacte.",
    },
    {
      q: "Mon logo stocké sur Google Drive ne s'affiche pas chez mes destinataires, pourquoi ?",
      r: "Pour qu'une image de Drive apparaisse dans une signature, Google demande qu'elle soit partagée publiquement : Partager, puis sous « Obtenir le lien », « Tous les utilisateurs disposant du lien » avec le rôle Lecteur. Sur un compte professionnel limité aux images par adresse web, l'administrateur doit autoriser ce partage public, sinon le destinataire ne voit qu'un cadre vide.",
    },
    {
      q: "Sur l'application Gmail de mon téléphone, quelle signature est ajoutée ?",
      r: "Tant que vous n'avez pas créé de signature mobile, l'application ajoute la signature réglée sur ordinateur. Si vous activez la signature mobile, elle la remplace pour les messages envoyés depuis l'application : c'est un simple texte, à saisir dans les paramètres du compte. Sur iPhone et iPad, Google précise qu'il faut la régler pour chaque compte ajouté à l'application.",
    },
    {
      q: "Mon entreprise utilise Google Workspace, puis-je changer la signature imposée ?",
      r: "Cela dépend de ce que l'administrateur a mis en place. Une signature identique appliquée à tous par l'API Gmail reste modifiable par chaque utilisateur. En revanche, un pied de page ajouté par la console d'administration, dans les réglages de conformité de Gmail, s'ajoute à l'envoi : vous ne le voyez pas en rédigeant et vous ne pouvez ni le modifier ni le supprimer.",
    },
    {
      q: "Ma signature Gmail est cachée derrière trois petits points, comment l'afficher ?",
      r: "Google explique que la signature est séparée du corps du message par deux tirets et peut se retrouver masquée en bas d'un message envoyé. Pour l'afficher, descendez jusqu'en bas du message et cliquez sur « Afficher le contenu tronqué », les trois points. Ce repli ne change rien à ce que reçoit votre correspondant : la signature est bien envoyée avec chaque message.",
    },
    {
      q: "Des caractères bizarres apparaissent dans ma signature Gmail, d'où viennent-ils ?",
      r: "Google explique que certaines versions de Gmail ne prennent pas en charge le gras ou l'italique : la mise en forme se traduit alors par des caractères en trop. Dans Paramètres, section Signature, sélectionnez le texte et cliquez sur « Supprimer la mise en forme », puis recollez la signature. Si le mode texte brut est coché dans la fenêtre de rédaction, décochez-le d'abord.",
    },
  ],
  en: [
    {
      q: "Gmail says my signature is too long, what should I do?",
      r: "A Gmail signature can hold up to 10,000 characters, and an inserted image counts towards that total. The usual culprit is a logo uploaded from your computer: load it from its web address instead, as this generator does. The counter under the preview shows the length of the generated code; if it gets close to the limit, remove a link or switch to the Compact layout.",
    },
    {
      q: "My logo stored in Google Drive does not show for recipients, why?",
      r: "For a Drive image to appear in a signature, Google requires it to be shared publicly: Share, then under Get link, Anyone with the link, with the Viewer role. On a work or school account that can only add images from a URL, the administrator has to allow public sharing first; otherwise recipients only see an empty frame or a broken image icon.",
    },
    {
      q: "Which signature does the Gmail app on my phone add?",
      r: "Until you create a mobile signature, the app adds the one you set on your computer. Once you turn on Mobile Signature, it replaces it for emails sent from the app; it is plain text typed in the account settings. On iPhone and iPad, Google points out that you need to set it for each account added to the app, one by one.",
    },
    {
      q: "My employer uses Google Workspace, can I change the signature it sets?",
      r: "It depends on what the administrator set up. A signature pushed to everyone through the Gmail API can still be edited by each user. A footer added in the Admin console, under the Gmail Compliance settings, is appended when the email is sent: you do not see it while writing and you cannot edit or remove it, so leave those details out of yours.",
    },
    {
      q: "Strange extra characters appear in my Gmail signature, where do they come from?",
      r: "Google explains that some versions of Gmail do not support formatting such as bold or italics, which then shows up as extra characters. In Settings, Signature section, highlight the text and click Remove formatting, then paste the signature again. If Plain text mode is ticked in the compose window's More options menu, untick it first, or formatting will not stick.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail (ordinateur)", url: "https://support.google.com/mail/answer/8395?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail : téléphone et tablette Android", url: "https://support.google.com/mail/answer/8395?hl=fr&co=GENIE.Platform%3DAndroid", lu: "27 octobre 2026" },
    { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail : iPhone et iPad", url: "https://support.google.com/mail/answer/8395?hl=fr&co=GENIE.Platform%3DiOS", lu: "27 octobre 2026" },
    { editeur: "Aide Gmail (Google)", titre: "Résoudre les problèmes liés aux signatures Gmail", url: "https://support.google.com/mail/answer/11468381?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Aide Google Workspace", titre: "Configurer les signatures des utilisateurs Google Workspace dans Gmail", url: "https://knowledge.workspace.google.com/admin/gmail/set-up-google-workspace-user-signatures-in-gmail?hl=fr", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Gmail Help (Google)", titre: "Create a Gmail signature (computer)", url: "https://support.google.com/mail/answer/8395?hl=en", lu: "27 October 2026" },
    { editeur: "Gmail Help (Google)", titre: "Create a Gmail signature: Android phone and tablet", url: "https://support.google.com/mail/answer/8395?hl=en&co=GENIE.Platform%3DAndroid", lu: "27 October 2026" },
    { editeur: "Gmail Help (Google)", titre: "Create a Gmail signature: iPhone and iPad", url: "https://support.google.com/mail/answer/8395?hl=en&co=GENIE.Platform%3DiOS", lu: "27 October 2026" },
    { editeur: "Gmail Help (Google)", titre: "Troubleshoot issues with Gmail signatures", url: "https://support.google.com/mail/answer/11468381?hl=en", lu: "27 October 2026" },
    { editeur: "Google Workspace Help", titre: "Set up Google Workspace user signatures in Gmail", url: "https://knowledge.workspace.google.com/admin/gmail/set-up-google-workspace-user-signatures-in-gmail?hl=en", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de signature Gmail 75tools",
    motsCles: "créer une signature gmail, signature gmail, signature gmail avec logo, modèle de signature gmail, signature gmail mobile",
    copie: "Signature copiée. Dans Gmail, collez-la (Ctrl + V ou Cmd + V) dans le champ de la section Signature.",
    aide: "Mentions d'identification de l'entreprise (Siren, RCS, EI), si votre statut l'exige.",
    longueur: (n: string, max: string) => `Longueur du code : ${n} caractères sur ${max} admis par Gmail.`,
    trop: " C'est trop : retirez un lien ou choisissez la mise en page Compacte.",
    ok: " Gmail compte à sa façon, mais une signature bien en dessous passe sans erreur.",
  },
  en: {
    nomAppli: "75tools Gmail signature generator",
    motsCles: "gmail signature, gmail signature with logo, create gmail signature, gmail signature template, gmail mobile signature",
    copie: "Signature copied. In Gmail, paste it (Ctrl + V or Cmd + V) into the box in the Signature section.",
    aide: "French business identifiers (SIREN, RCS, EI) if your status requires them.",
    longueur: (n: string, max: string) => `Code length: ${n} characters out of the ${max} Gmail allows.`,
    trop: " That is too long: remove a link or pick the Compact layout.",
    ok: " Gmail counts in its own way, but a signature well below the limit goes through.",
  },
};

const SignatureGmail = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <GenerateurSignature
      key={lang}
      exemple={EXEMPLE[lang]}
      messageCopie={t.copie}
      aideMention={t.aide}
      sousApercu={({ html }) => {
        const n = html.length;
        const depasse = n > LIMITE;
        return (
          <p role="status" className={depasse ? "text-sm text-amber-300" : "text-sm text-neutral-400"}>
            {t.longueur(n.toLocaleString(locale(lang)), LIMITE.toLocaleString(locale(lang)))}
            {depasse ? t.trop : t.ok}
          </p>
        );
      }}
    />
  );
  return (
    <PageOutil
      id="signature-gmail"
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
    <Section titre="Créer une signature Gmail avec logo, pas à pas">
      <p>
        Pour créer une signature Gmail, remplissez vos coordonnées dans le générateur ci-dessus, collez l'adresse
        web de votre logo dans le champ Logo, puis cliquez sur « Copier la signature ». Dans Gmail, ouvrez
        Paramètres, « Voir tous les paramètres », section Signature, créez une signature et collez-la avec Ctrl + V
        avant d'enregistrer les modifications en bas de page. Le compteur sous l'aperçu indique la longueur du code :
        Google admet 10 000 caractères, image comprise, et une signature de cinq lignes avec un lien de rendez-vous
        en fait environ 1 700. Le logo n'est pas incorporé dans le code mais appelé par son adresse, ce qui garde
        la signature légère ; Google recommande une image de 70 à 100 pixels de haut et de 300 à 400 pixels de
        large. La limite : l'application Gmail du téléphone n'accepte qu'une signature en texte simple, sans logo,
        à saisir à part dans ses paramètres.
      </p>
    </Section>

    <Section id="installer-gmail" titre="Ajouter la signature dans Gmail sur ordinateur">
      <ol className="list-decimal pl-6 space-y-1">
        <li>Copiez la signature avec le bouton « Copier la signature ».</li>
        <li>Dans Gmail, cliquez en haut à droite sur Paramètres, puis sur « Voir tous les paramètres ».</li>
        <li>Dans l'onglet Général, descendez jusqu'à la section Signature et créez une nouvelle signature.</li>
        <li>Collez-la dans le champ (Ctrl + V, ou Cmd + V sur Mac), sans passer par un collage « texte brut ».</li>
        <li>Choisissez-la pour les nouveaux e-mails et pour les réponses, puis cliquez sur « Enregistrer les modifications » en bas de page.</li>
      </ol>
      <p>
        <strong>Plusieurs signatures.</strong> Gmail accepte plusieurs signatures : une complète pour les nouveaux
        messages, une courte pour les réponses, une en anglais. Pendant la rédaction, le bouton « Insérer une
        signature » en bas de la fenêtre permet d'en changer pour un message précis.
      </p>
      <p>
        <strong>Une signature par adresse.</strong> Si vous écrivez depuis d'autres adresses grâce à « Envoyer
        des e-mails en tant que », Gmail accepte une signature distincte pour chacune : choisissez l'adresse dans le
        menu déroulant placé au-dessus du champ Signature. Si ce menu manque, vérifiez dans l'onglet « Comptes et
        importation » que vos adresses figurent bien dans cette rubrique.
      </p>
    </Section>

    <Section titre="Signature Gmail avec logo : deux façons de faire">
      <p>
        <strong>Par l'adresse web de l'image, avec ce générateur.</strong> Mettez votre logo en ligne (sur votre
        site, par exemple) et collez son adresse https dans le champ Logo. La signature copiée n'embarque que
        l'adresse : elle reste légère, ce qui compte pour la limite de 10 000 caractères.
      </p>
      <p>
        <strong>Par l'éditeur de Gmail.</strong> Après avoir collé une signature sans logo, placez le curseur et
        utilisez le bouton d'insertion d'image de l'éditeur de signature : il propose une image de votre Drive, un
        fichier importé ou une adresse web. Si vous choisissez Drive, partagez l'image avec « Tous les
        utilisateurs disposant du lien », rôle Lecteur, sinon vos destinataires verront un cadre vide.
      </p>
      <p>
        Google fixe la taille maximale d'une image de signature à 100 pixels de haut et 1 000 pixels de large.
        Réduisez-la avant de l'importer, par exemple avec l'outil{" "}
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
      <h3>Comptes Google Workspace</h3>
      <p>
        Sur un compte professionnel, l'administrateur peut appliquer une même signature à tous par l'API Gmail ;
        chacun peut ensuite la modifier. Il peut aussi ajouter un pied de page à tous les messages sortants, depuis
        la console d'administration (Applications, Google Workspace, Gmail, Conformité) : ce texte, ajouté à
        l'envoi, n'est pas modifiable, et un changement peut mettre jusqu'à 24 heures à s'appliquer. Si votre
        signature répète les mentions de ce pied de page, retirez-les. Pour Outlook, voyez la page{" "}
        <Link to="/signature-outlook/">signature Outlook</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Create a Gmail signature with a logo, step by step">
      <p>
        To create a Gmail signature, fill in your details in the generator above, paste your logo's web address
        into the Logo field, then click Copy signature. In Gmail, open Settings, See all settings, scroll to the
        Signature section, create a signature, paste it with Ctrl + V and click Save Changes at the bottom of the
        page. The counter under the preview shows the code length: Google allows 10,000 characters, images
        included, and a five-line signature with a booking link comes to about 1,700. The logo is not embedded in
        the code but loaded from its address, which keeps the signature light; Google recommends an image 70 to
        100 pixels high and 300 to 400 pixels wide. The signature text is in English (Mobile, Office), with French
        numbers turned into +33 links. The main limit: the Gmail phone app only takes a plain-text signature, with
        no logo, set separately in its settings.
      </p>
    </Section>

    <Section id="install-gmail" titre="Adding the signature in Gmail on a computer">
      <ol className="list-decimal pl-6 space-y-1">
        <li>Copy the signature with the Copy signature button.</li>
        <li>In Gmail, click Settings at the top right, then See all settings.</li>
        <li>On the General tab, scroll down to the Signature section and create a new signature.</li>
        <li>Paste it into the box (Ctrl + V, or Cmd + V on a Mac), not with a plain-text paste.</li>
        <li>Choose it for new emails and for replies, then click Save Changes at the bottom of the page.</li>
      </ol>
      <p>
        <strong>Several signatures.</strong> Gmail accepts several signatures: a full one for new emails, a short
        one for replies, one in French for your French clients. While writing, the Insert signature button at the
        bottom of the window lets you switch for a single email.
      </p>
      <p>
        <strong>One signature per address.</strong> If you send from other addresses with the Send mail as
        feature, Gmail lets you set a different signature for each: pick the address in the drop-down menu above
        the signature box. If that menu is missing, check on the Accounts and Import tab that your addresses are
        listed under Send mail as.
      </p>
    </Section>

    <Section titre="Gmail signature with a logo: two ways to do it">
      <p>
        <strong>By the image's web address, with this generator.</strong> Put your logo online, on your own website
        for example, and paste its https address into the Logo field. The copied signature only carries the
        address, so it stays light, which matters for the 10,000-character limit.
      </p>
      <p>
        <strong>With Gmail's own editor.</strong> After pasting a signature without a logo, place the cursor and
        use the insert image button in the signature editor: it offers an image from Drive, an upload or a web
        address. If you pick Drive, share the image with Anyone with the link as Viewer, or recipients will see an
        empty frame.
      </p>
      <p>
        Google caps signature images at 100 pixels high and 1,000 pixels wide. Shrink yours before uploading it,
        for instance with the <Link to="/en/resize-image/">image resizer</Link>.
      </p>
    </Section>

    <Section titre="On your phone and in Google Workspace">
      <h3>Gmail app on Android</h3>
      <p>
        Tap Menu at the top left, scroll to the bottom and tap Settings, choose the account, then tap Mobile
        signature: type the text and tap OK. It is only added to emails sent from the app.
      </p>
      <h3>Gmail app on iPhone and iPad</h3>
      <p>
        Tap Menu, then Settings; under Compose and Reply, tap Signature settings, turn on Mobile Signature, type it,
        then tap Back to save. Repeat for each account in the app.
      </p>
      <h3>Google Workspace accounts</h3>
      <p>
        On a work account, the administrator can push the same signature to everyone through the Gmail API, and
        each person can then edit it. They can also append a footer to all outgoing emails from the Admin console
        (Apps, Google Workspace, Gmail, Compliance): that text is added on sending, cannot be edited, and a change
        can take up to 24 hours. If your signature repeats what that footer already says, remove it. For Outlook,
        see the <Link to="/en/outlook-signature/">Outlook signature</Link> page.
      </p>
    </Section>
  </>
);

export default SignatureGmail;
