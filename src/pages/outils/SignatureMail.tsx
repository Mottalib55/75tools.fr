import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { GenerateurSignature } from "@/components/outils/GenerateurSignature";
import { DonneesSignature } from "@/lib/signature";
import type { Langue } from "@/lib/langue";

const EXEMPLE: Record<Langue, DonneesSignature> = {
  fr: {
    nom: "Camille Martin",
    poste: "Consultante en recrutement",
    entreprise: "Atelier Martin",
    telephone: "",
    mobile: "06 12 34 56 78",
    email: "camille@exemple.fr",
    site: "www.exemple.fr",
    adresse: "",
    linkedin: "",
    lienLibelle: "",
    lienUrl: "",
    couleur: "#1f6feb",
    photoUrl: "",
    logoUrl: "",
    mention: "",
  },
  en: {
    nom: "Emma Clarke",
    poste: "Recruitment consultant",
    entreprise: "Clarke Talent",
    telephone: "",
    mobile: "06 12 34 56 78",
    email: "emma@example.com",
    site: "www.example.com",
    adresse: "",
    linkedin: "",
    lienLibelle: "",
    lienUrl: "",
    couleur: "#1f6feb",
    photoUrl: "",
    logoUrl: "",
    mention: "",
  },
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Pourquoi ma signature perd sa mise en forme quand je la colle dans Gmail ?",
      r: "Le plus souvent, elle a été collée en texte brut : raccourci Ctrl + Maj + V (Cmd + Maj + V sur Mac), ou copie faite depuis le code HTML au lieu de l'aperçu. Utilisez le bouton « Copier la signature », puis collez avec Ctrl + V (Cmd + V) dans le champ Signature de Gmail. Si le navigateur refuse la copie riche, sélectionnez l'aperçu à la souris et copiez-le : la mise en forme est la même.",
    },
    {
      q: "Mon logo ne s'affiche pas chez certains destinataires, que faire ?",
      r: "Une image de signature est chargée depuis son adresse au moment où le message est lu. Outlook classique pour Windows bloque par défaut le téléchargement des images tant que l'expéditeur n'est pas approuvé. L'adresse doit commencer par https:// et rester en ligne. Gardez donc toutes vos coordonnées en texte : la signature reste lisible même quand l'image est masquée.",
    },
    {
      q: "Puis-je utiliser une image de ma signature entière, par exemple un visuel fait sur Canva ?",
      r: "C'est possible mais déconseillé. Quand les images sont bloquées, le destinataire ne voit qu'un cadre vide ; le numéro de téléphone et l'adresse e-mail ne sont ni cliquables ni copiables ; et une image lourde alourdit chaque message. Une signature en texte, avec au plus une photo ou un logo, reste lisible partout, y compris sur un téléphone.",
    },
    {
      q: "Comment avoir une signature pour les nouveaux messages et une autre pour les réponses ?",
      r: "Créez deux signatures, par exemple la complète et une version Compacte faite avec ce générateur. Dans Gmail, la section Signature permet de choisir une signature par défaut pour les nouveaux e-mails et une pour les réponses et transferts. Dans le nouvel Outlook et Outlook sur le web, deux cases jouent le même rôle sous Paramètres, Comptes, Signatures.",
    },
    {
      q: "Mes coordonnées sont-elles envoyées à 75tools ?",
      r: "Non. La signature est construite dans votre navigateur, à partir de ce que vous tapez, et rien n'est transmis ni enregistré sur un serveur. Si vous fermez la page, les champs reviennent à l'exemple. Seules la photo et le logo sont chargés depuis l'adresse que vous indiquez, par votre navigateur puis par celui de vos destinataires.",
    },
    {
      q: "Quelle taille donner à la photo ou au logo de ma signature ?",
      r: "Le générateur affiche la photo à 80 × 80 pixels et le logo à 90 ou 140 pixels de large. Fournissez une image deux fois plus grande, 160 × 160 pixels pour une photo, pour qu'elle reste nette sur un écran haute définition. Pour Gmail, Google recommande une image de 70 à 100 pixels de haut et de 300 à 400 pixels de large au maximum.",
    },
  ],
  en: [
    {
      q: "Why does my signature lose its formatting when I paste it into Gmail?",
      r: "Usually because it was pasted as plain text, with Ctrl + Shift + V (Cmd + Shift + V on a Mac), or copied from the HTML code instead of the preview. Use the Copy signature button, then paste with Ctrl + V (Cmd + V) into the Signature box in Gmail. If your browser blocks rich copying, select the preview with the mouse and copy it: the formatting is identical.",
    },
    {
      q: "Some recipients do not see my logo, what can I do?",
      r: "A signature image is loaded from its web address when the message is opened. Classic Outlook for Windows blocks pictures by default until the sender is trusted. The address must start with https:// and stay online. That is why every detail in the generated signature is real text: it stays readable and clickable even when the image is hidden.",
    },
    {
      q: "My business is registered in France, which details belong in my email signature?",
      r: "Service Public lists business emails among the commercial documents that carry identification details. For a company that means the SIREN number, RCS or RNE registration, the registered office and, for a SARL or SAS, the share capital. A sole trader (entrepreneur individuel, including micro-entrepreneurs) adds EI next to their name. Put this on the Legal line field.",
    },
    {
      q: "Can I keep a long signature for new emails and a short one for replies?",
      r: "Yes. Create the full signature, then a second one with the Compact layout. In Gmail, the Signature section lets you pick one default for new emails and another for replies and forwards. In new Outlook and Outlook on the web, the checkboxes under Settings, Accounts, Signatures do the same, and classic Outlook has a Replies/forwards drop-down list.",
    },
    {
      q: "Is my contact information sent to 75tools?",
      r: "No. The signature is built in your browser from what you type, and nothing is sent to or stored on a server. If you close the page, the fields go back to the example. Only the photo and the logo are fetched from the address you enter, first by your browser and later by your recipients' email apps.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail", url: "https://support.google.com/mail/answer/8395?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Support Microsoft", titre: "Comment ajouter et modifier une signature électronique dans Outlook", url: "https://support.microsoft.com/fr-fr/outlook/mail/how-to-add-and-change-an-email-signature-in-outlook", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Modifier le texte et les signatures d'e-mail dans Mail sur Mac", url: "https://support.apple.com/fr-fr/guide/mail/mail11943/mac", lu: "27 octobre 2026" },
    { editeur: "Aide Gmail (Google)", titre: "Résoudre les problèmes liés aux signatures Gmail", url: "https://support.google.com/mail/answer/11468381?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Gmail Help (Google)", titre: "Create a Gmail signature", url: "https://support.google.com/mail/answer/8395?hl=en", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "How to add and change an email signature in Outlook", url: "https://support.microsoft.com/en-us/office/create-and-add-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Edit text and email signatures in Mail on Mac", url: "https://support.apple.com/en-gb/guide/mail/mail11943/mac", lu: "27 October 2026" },
    { editeur: "Gmail Help (Google)", titre: "Troubleshoot issues with Gmail signatures", url: "https://support.google.com/mail/answer/11468381?hl=en", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société (commercial documents of a company)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux (new mandatory details for sole traders)", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de signature mail 75tools",
    motsCles: "signature mail, signature mail gratuite, générateur signature mail, signature mail professionnelle, signature email gmail outlook",
  },
  en: {
    nomAppli: "75tools email signature generator",
    motsCles: "email signature generator, free email signature, professional email signature, gmail signature, outlook signature",
  },
};

const SignatureMail = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  return (
    <PageOutil
      id="signature-mail"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="BusinessApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={<GenerateurSignature key={lang} exemple={EXEMPLE[lang]} />}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Une signature mail gratuite en trois minutes">
      <p>
        Pour créer une signature mail gratuite, tapez votre nom, votre poste, votre entreprise et votre mobile dans
        le cadre ci-dessus : l'aperçu se met à jour à chaque lettre. Choisissez ensuite une des quatre mises en
        page (Classique, Compacte, Logo dessous, Filet de couleur), ajoutez si vous le voulez une photo ou un logo
        par son adresse web, puis cliquez sur « Copier la signature » et collez-la avec Ctrl + V dans Gmail,
        Outlook ou Apple Mail. Le code produit est fait de tableaux et de styles en ligne, le seul format que ces
        messageries affichent toutes de la même façon ; une signature type de cinq lignes pèse environ 1 500
        caractères, six fois moins que la limite de 10 000 caractères de Gmail. Un numéro saisi comme 06 12 34 56
        78 devient un lien +33 6 12 34 56 78, composable depuis l'étranger. La limite : les images restent
        hébergées ailleurs, et certaines messageries les masquent jusqu'à ce que le destinataire les autorise.
      </p>
    </Section>

    <Section id="installer" titre="Installer la signature, messagerie par messagerie">
      <p>
        La copie emporte la mise en forme : il suffit de la coller dans la zone de signature de votre messagerie,
        avec Ctrl + V sur Windows ou Cmd + V sur Mac. Les pages{" "}
        <Link to="/signature-outlook/">signature Outlook</Link> et <Link to="/signature-gmail/">signature Gmail</Link>{" "}
        détaillent les cas particuliers de chaque messagerie (fichier .htm, version mobile, limite de caractères).
      </p>
      <h3>Gmail sur ordinateur</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Ouvrez Gmail, cliquez sur Paramètres en haut à droite, puis sur « Voir tous les paramètres ».</li>
        <li>Dans l'onglet Général, descendez jusqu'à la section Signature et créez une nouvelle signature.</li>
        <li>Collez la signature dans le champ, puis choisissez-la pour les nouveaux e-mails et les réponses.</li>
        <li>Tout en bas de la page, cliquez sur « Enregistrer les modifications ».</li>
      </ol>
      <h3>Nouvel Outlook pour Windows et Outlook sur le web</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Ouvrez Paramètres (roue dentée), puis Comptes et Signatures (« Signatures de comptes » selon la version).</li>
        <li>Choisissez le compte si vous en avez plusieurs, sélectionnez « Ajoutez une signature » et nommez-la.</li>
        <li>Collez la signature dans la zone d'édition, cochez les cases des nouveaux messages et des réponses, puis Enregistrer.</li>
      </ol>
      <h3>Outlook classique pour Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Menu Fichier, Options, Courrier, puis le bouton Signatures.</li>
        <li>Cliquez sur Nouveau, nommez la signature et collez-la dans le cadre « Modifier la signature ».</li>
        <li>Sous « Choisir une signature par défaut », sélectionnez-la pour les nouveaux messages et les réponses, puis OK.</li>
      </ol>
      <h3>Apple Mail sur Mac</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Dans Mail, menu Mail, Réglages, puis l'onglet Signatures.</li>
        <li>Sélectionnez le compte dans la colonne de gauche, cliquez sur le bouton + et nommez la signature.</li>
        <li>Décochez « Toujours utiliser ma police par défaut des messages », sinon Mail retire la mise en forme.</li>
        <li>Collez la signature dans la colonne de droite : elle est enregistrée aussitôt.</li>
      </ol>
      <p>
        Ces marches à suivre reprennent l'aide officielle de chaque éditeur, citée en bas de page ; les intitulés
        de menu peuvent changer d'une version à l'autre.
      </p>
    </Section>

    <Section titre="Ce que contient une bonne signature professionnelle">
      <p>
        Une signature sert à être rappelé, pas à décorer. Quatre à six lignes suffisent : <strong>nom</strong>,{" "}
        <strong>poste et entreprise</strong>, <strong>un numéro de téléphone</strong> qu'on peut toucher depuis un
        téléphone, <strong>l'adresse du site</strong>, et au plus un lien utile, comme une page de prise de
        rendez-vous ou un profil LinkedIn. Le reste (citation, bannière, cinq icônes de réseaux) dilue
        l'information et s'affiche mal sur un petit écran.
      </p>
      <p>
        Écrivez le numéro tel que vous le diriez au téléphone : le générateur crée en coulisse un lien au format
        international, que les téléphones savent composer depuis l'étranger. La couleur ne s'applique qu'au nom,
        aux liens et au filet, pour rester lisible sur un fond clair comme sombre.
      </p>
      <p>
        Pour la photo ou le logo, utilisez une image <strong>déjà en ligne</strong>, à une adresse en https : une
        page de votre site, un hébergement d'images ou la photo de votre profil <Link to="/mycard/">MyCard</Link>.
        Pour remettre ces mêmes coordonnées sur papier, le{" "}
        <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> les enregistre dans un téléphone en un scan.
      </p>
    </Section>

    <Section titre="Faut-il des mentions légales dans un e-mail professionnel ?">
      <p>
        Service Public range les « courriers (papier ou emails commerciaux) » parmi les documents commerciaux
        d'une entreprise, qui doivent comporter des mentions obligatoires. Pour une société, la fiche cite le
        numéro Siren, la mention RCS suivie de la ville du greffe (activité commerciale) ou la mention RNE
        (activité artisanale, libérale ou agricole), le lieu du siège et, pour une SARL, une SAS ou une SA, le
        montant du capital.
      </p>
      <p>
        Pour un entrepreneur individuel, micro-entrepreneur compris, Service Public rappelle depuis le nouveau
        statut de mai 2022 que le nom doit être précédé ou suivi de « entrepreneur individuel » ou « EI » sur les
        documents commerciaux, correspondances comprises. Le champ « Ligne légale » sert à cela : par exemple
        « Camille Martin EI · Siren 000 000 000 ». En cas de doute, la fiche de Service Public correspondant à
        votre statut fait foi.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A free email signature in three minutes">
      <p>
        To make a free email signature, type your name, job title, company and mobile number in the box above: the
        preview updates with every keystroke. Pick one of the four layouts (Classic, Compact, Logo below, Colour
        rule), add a photo or a logo by its web address if you like, then click Copy signature and paste it with
        Ctrl + V into Gmail, Outlook or Apple Mail. The code uses tables and inline styles, the only format these
        email apps all display the same way; a typical five-line signature is about 1,500 characters, six times
        below Gmail's 10,000-character limit. The signature itself is written in English (Mobile, Office), and a
        French number typed as 06 12 34 56 78 becomes a +33 6 12 34 56 78 link that works from a UK or US phone.
        The main limit: images stay hosted elsewhere, and some email apps hide them until the recipient allows
        them.
      </p>
    </Section>

    <Section id="install" titre="Installing the signature in each email app">
      <p>
        The copy keeps the formatting, so you only need to paste it into the signature box with Ctrl + V on
        Windows or Cmd + V on a Mac. The <Link to="/en/outlook-signature/">Outlook signature</Link> and{" "}
        <Link to="/en/gmail-signature/">Gmail signature</Link> pages cover the details of each app (.htm file,
        mobile signature, character limit). The menu names below are the English ones.
      </p>
      <h3>Gmail on a computer</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Open Gmail, click Settings at the top right, then See all settings.</li>
        <li>On the General tab, scroll to the Signature section and create a new signature.</li>
        <li>Paste the signature into the box, then choose it as the default for new emails and for replies.</li>
        <li>At the bottom of the page, click Save Changes.</li>
      </ol>
      <h3>New Outlook for Windows and Outlook on the web</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Select Settings (the gear icon), then Accounts &gt; Signatures.</li>
        <li>If you have several accounts, pick one, select Add signature and give it a distinct name.</li>
        <li>Paste the signature into the editing box, tick the boxes for new messages and replies, then select Save.</li>
      </ol>
      <h3>Classic Outlook for Windows</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Go to File &gt; Options &gt; Mail &gt; Signatures.</li>
        <li>Choose New, name the signature and paste it into the Edit signature box.</li>
        <li>Under Choose default signature, select it for New messages and Replies/forwards, then OK.</li>
      </ol>
      <h3>Apple Mail on a Mac</h3>
      <ol className="list-decimal pl-6 space-y-1">
        <li>In Mail, choose Mail &gt; Settings, then click Signatures.</li>
        <li>Select the account in the left column, click the + button below the middle column and name the signature.</li>
        <li>Untick Always match my default message font, otherwise Mail strips the formatting.</li>
        <li>Paste the signature into the right column: it is saved straight away.</li>
      </ol>
      <p>
        These steps follow each vendor's official help, listed at the bottom of the page; menu names can shift
        slightly between versions.
      </p>
    </Section>

    <Section titre="What a good professional signature contains">
      <p>
        A signature exists so people can reach you, not to decorate the email. Four to six lines are enough:{" "}
        <strong>name</strong>, <strong>job title and company</strong>, <strong>one phone number</strong> that can
        be tapped on a phone, <strong>your website</strong> and at most one useful link, such as a booking page or
        your LinkedIn profile. Quotes, banners and a row of five social icons dilute the message and display
        poorly on a small screen.
      </p>
      <p>
        Type your number the way you would say it: the generator builds an international tel: link behind the
        scenes. The colour only applies to your name, links and rule, so the signature stays readable on light and
        dark backgrounds. For the photo or logo, use an image <strong>already online</strong> at an https address,
        for example on your own website.
      </p>
      <p>
        To put the same details on paper, the <Link to="/en/vcard-qr-code/">vCard QR code</Link> saves them to a
        phone contact in one scan.
      </p>
    </Section>

    <Section titre="Running a business in France: the legal line">
      <p>
        If your business is registered in France, French rules apply to your emails too. Service Public, the
        official business portal, counts commercial emails among the commercial documents that must carry
        identification details. For a company (SARL, SAS, SA) these are the SIREN number, the RCS registration
        followed by the court registry town for a trading business, or RNE for a craft, liberal or farming
        activity, the registered office and the share capital.
      </p>
      <p>
        Since the new sole-trader status of May 2022, an entrepreneur individuel, micro-entrepreneurs included,
        must add the words entrepreneur individuel or the initials EI before or after their name on commercial
        documents, letters and emails included. The Legal line field is there for this, for example
        "Emma Clarke EI · SIREN 000 000 000". These French identifiers stay in French: that is how clients and the
        administration expect to read them.
      </p>
    </Section>
  </>
);

export default SignatureMail;
