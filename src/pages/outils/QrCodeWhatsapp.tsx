import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { PAYS_WHATSAPP, numeroInternational, lienWhatsapp } from "@/lib/qr-formats";
import { type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Mon numéro commence par 06, qu'est-ce que je dois mettre dans le lien ?",
      r: "Le numéro au format international, sans le +, sans le 0 initial, sans espace ni tiret : 06 12 34 56 78 devient 33612345678, et le lien https://wa.me/33612345678. C'est la règle donnée par l'aide WhatsApp. L'outil fait la conversion tout seul selon l'indicatif choisi ; si vous tapez déjà +33 ou 0033, il garde votre indicatif.",
    },
    {
      q: "Les accents et les retours à la ligne de mon message passent-ils ?",
      r: "Oui. WhatsApp demande un message « encodé au format URL » : chaque caractère qui n'a pas sa place dans une adresse web est remplacé par un code, par exemple %C3%A9 pour é et %0A pour un retour à la ligne. L'outil fait cet encodage, et WhatsApp affiche le texte d'origine dans le champ de saisie. La personne peut le modifier avant d'appuyer sur Envoyer.",
    },
    {
      q: "La personne qui scanne le code voit-elle mon numéro de téléphone ?",
      r: "Oui. Le numéro est écrit en clair dans le lien, donc dans le QR code, et la discussion s'ouvre avec lui. N'affichez pas le code d'un numéro personnel dans un lieu public si vous ne voulez pas le diffuser. Pour une activité, utilisez plutôt un numéro dédié, par exemple celui de votre compte WhatsApp Business, que vous pourrez changer sans toucher à votre ligne privée.",
    },
    {
      q: "Je peux changer le message prérempli après avoir imprimé le code ?",
      r: "Non, pas avec un lien wa.me : le message fait partie de l'adresse, il faut générer un nouveau code. La documentation de Meta pour la plateforme WhatsApp Business décrit des QR codes et liens courts dont le message prérempli, limité à 140 caractères, peut être modifié ou supprimé à tout moment. Ils se créent depuis l'API WhatsApp Business ou le gestionnaire d'entreprise de Meta, pas avec cet outil.",
    },
    {
      q: "Le lien wa.me fonctionne-t-il sur un ordinateur ?",
      r: "Oui. D'après l'aide WhatsApp, les liens de discussion fonctionnent sur téléphone et sur WhatsApp Web. Sur ordinateur, cliquez-le depuis un navigateur où WhatsApp Web est connecté pour que la discussion s'ouvre. Le QR code, lui, est pensé pour le téléphone : on le scanne avec l'appareil photo et la discussion s'ouvre directement dans l'application, avec le message prérempli.",
    },
    {
      q: "Un client installé à l'étranger peut-il utiliser mon QR code WhatsApp ?",
      r: "Oui. Le lien contient votre numéro complet avec l'indicatif du pays, il fonctionne donc depuis n'importe quel pays, pourvu que la personne ait WhatsApp et une connexion Internet. C'est justement l'intérêt du format international exigé par WhatsApp : un 06 sans indicatif ne mènerait nulle part depuis la Belgique ou le Canada. Pour les numéros d'outre-mer, choisissez l'indicatif du département, par exemple 262 pour La Réunion.",
    },
  ],
  en: [
    {
      q: "I have a French mobile number starting with 06 or 07: what goes in the wa.me link?",
      r: "The number in full international format, with no plus sign, no leading zero, no spaces and no dashes: 06 12 34 56 78 becomes 33612345678 and the link https://wa.me/33612345678. That is the rule in WhatsApp Help. The tool converts it for you once France (+33) is selected, and if you type +33 or 0033 yourself it keeps that code as it is.",
    },
    {
      q: "My WhatsApp runs on a UK number but I live in France: which country code do I choose?",
      r: "The country of the number, not the country you live in. WhatsApp identifies you by the number your account was registered with, so a UK mobile such as 07700 900123 needs United Kingdom (+44) and becomes 447700900123 in the link, without the leading zero. Pick France (+33) only if your WhatsApp account uses a French SIM. Scan the code yourself to make sure the right chat opens.",
    },
    {
      q: "Will French accents and line breaks in my pre-filled message work?",
      r: "Yes. WhatsApp asks for a URL-encoded message, so every character that has no place in a web address is replaced by a code, for example %C3%A9 for é and %0A for a line break. The tool does the encoding, and WhatsApp shows the original text in the message box. The person can still edit it before pressing Send, so a bilingual greeting works fine.",
    },
    {
      q: "Can people who scan the code see my phone number?",
      r: "Yes. The number is written in plain text in the link, so in the QR code, and the chat opens with it. Do not display a code for your personal mobile in a public place unless you are happy to share it. For a business, use a separate number, for example one set up with the WhatsApp Business app, which you can change later without touching your private line.",
    },
    {
      q: "Can I change the pre-filled message after printing the code?",
      r: "Not with a wa.me link: the message is part of the address, so a new message means a new code. Meta's documentation for the WhatsApp Business Platform describes QR codes and short links whose pre-filled message, up to 140 characters, can be edited or deleted at any time. Those are created from the WhatsApp Business API or Meta's business tools, not with this generator.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    {
      editeur: "Pages d'aide WhatsApp",
      titre: "Comment utiliser les liens clic vers WhatsApp",
      url: "https://faq.whatsapp.com/5913398998672934/?locale=fr_FR",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Pages d'aide WhatsApp",
      titre: "Comment ajouter un numéro de téléphone international",
      url: "https://faq.whatsapp.com/640432094208718/?locale=fr_FR",
      lu: "27 octobre 2026",
    },
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, Spécification de la symbologie de code à barres Code QR",
      url: "https://www.iso.org/fr/standard/62021.html",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Meta for Developers",
      titre: "Codes QR et liens courts (plateforme WhatsApp Business)",
      url: "https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes",
      lu: "27 octobre 2026",
    },
  ],
  en: [
    {
      editeur: "WhatsApp Help Center",
      titre: "How to use click to chat",
      url: "https://faq.whatsapp.com/5913398998672934/?locale=en_US",
      lu: "27 October 2026",
    },
    {
      editeur: "WhatsApp Help Center",
      titre: "How to add an international phone number",
      url: "https://faq.whatsapp.com/640432094208718/?locale=en_US",
      lu: "27 October 2026",
    },
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification",
      url: "https://www.iso.org/standard/62021.html",
      lu: "27 October 2026",
    },
    {
      editeur: "Meta for Developers",
      titre: "QR codes and short links (WhatsApp Business Platform)",
      url: "https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes",
      lu: "27 October 2026",
    },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de lien et de QR code WhatsApp 75tools",
    motsCles: "qr code whatsapp, lien wa.me, créer un lien whatsapp, message prérempli whatsapp, qr code whatsapp business",
    form: "Lien WhatsApp",
    pays: "Indicatif du pays",
    numero: "Numéro WhatsApp",
    numeroDefaut: "06 12 34 56 78",
    message: "Message prérempli (facultatif)",
    messageDefaut: "Bonjour, je vous contacte au sujet de votre annonce.",
    aideMessage:
      "Il s'affiche dans le champ de saisie ; la personne l'envoie ou le modifie. Sans numéro, le lien propose de choisir un contact à qui envoyer ce message.",
    votreLien: "Votre lien WhatsApp",
    lienVide: "Le lien apparaîtra ici.",
    copier: "Copier le lien",
    tester: "Tester le lien",
    copie: "Lien copié.",
    refus: "La copie a été refusée par le navigateur : sélectionnez le lien et copiez-le à la main.",
    vide: "Saisissez votre numéro.",
    fichier: "qr-whatsapp-",
  },
  en: {
    nomAppli: "75tools WhatsApp link and QR code generator",
    motsCles: "whatsapp qr code, wa.me link, create whatsapp link, whatsapp pre-filled message, whatsapp business qr code",
    form: "WhatsApp link",
    pays: "Country code",
    numero: "WhatsApp number",
    numeroDefaut: "06 12 34 56 78",
    message: "Pre-filled message (optional)",
    messageDefaut: "Hello, I'm getting in touch about your listing.",
    aideMessage:
      "It appears in the message box; the person sends it or edits it. Without a number, the link lets them pick a contact to send the message to.",
    votreLien: "Your WhatsApp link",
    lienVide: "The link will appear here.",
    copier: "Copy link",
    tester: "Test the link",
    copie: "Link copied.",
    refus: "The browser blocked copying: select the link and copy it by hand.",
    vide: "Enter your number.",
    fichier: "whatsapp-qr-",
  },
};

const QrCodeWhatsapp = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [codePays, setCodePays] = useState("33");
  const [saisie, setSaisie] = useState(t.numeroDefaut);
  const [message, setMessage] = useState(t.messageDefaut);
  const [copie, setCopie] = useState("");
  const pays = PAYS_WHATSAPP.find((p) => p.code === codePays) ?? PAYS_WHATSAPP[0];
  const { numero, remarque } = useMemo(() => numeroInternational(saisie, pays, lang), [saisie, pays, lang]);
  const lien = useMemo(() => {
    if (!numero && !message.trim()) return "";
    if (!numero && saisie.trim()) return "";
    return lienWhatsapp(numero, message);
  }, [numero, message, saisie]);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie(t.copie);
    } catch {
      setCopie(t.refus);
    }
    setTimeout(() => setCopie(""), 4000);
  };

  const outil = (
    <form
      className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-rows-[auto_1fr] items-start"
      onSubmit={(e) => e.preventDefault()}
      aria-label={t.form}
    >
      <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.pays}</span>
            <select id="champ-pays" value={codePays} onChange={(e) => setCodePays(e.target.value)} className={classeSelect}>
              {PAYS_WHATSAPP.map((p) => (
                <option key={p.code} value={p.code}>
                  {lang === "en" ? p.nomEn : p.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.numero}</span>
            <input
              id="champ-numero"
              type="tel"
              inputMode="tel"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder={t.numeroDefaut}
              className={classeChamp}
              autoComplete="tel"
            />
          </label>
        </div>
        {remarque && (
          <p role="status" className="text-sm text-neutral-400">
            {remarque}
          </p>
        )}
      </div>

      <div data-resultat className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
        <QrApercu texte={lien} nomFichier={`${t.fichier}${numero || "message"}`} id="qr-whatsapp" vide={t.vide} />
      </div>

      <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-2">
        <label className="block min-w-0">
          <span className="block text-sm text-neutral-300 mb-1">{t.message}</span>
          <textarea
            id="champ-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={classeZoneTexte}
          />
          <span className="block text-xs text-neutral-500 mt-1">{t.aideMessage}</span>
        </label>

        <div className="rounded-lg border border-neutral-800 p-4 space-y-3 min-w-0">
          <p className="text-sm text-neutral-400">{t.votreLien}</p>
          <p id="lien-whatsapp" className="text-neutral-100 [overflow-wrap:anywhere] text-sm">
            {lien || t.lienVide}
          </p>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={copier} disabled={!lien}>
              {t.copier}
            </Bouton>
            <Bouton secondaire onClick={() => window.open(lien, "_blank", "noopener")} disabled={!lien}>
              {t.tester}
            </Bouton>
          </div>
          {copie && (
            <p role="status" className="text-sm text-sky-300">
              {copie}
            </p>
          )}
        </div>
      </div>
    </form>
  );

  return (
    <PageOutil
      id="qr-code-whatsapp"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
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
    <Section titre="QR code WhatsApp et lien wa.me : ce que fait l'outil">
      <p>
        Un QR code WhatsApp est l'image d'un lien wa.me : quand on le scanne, WhatsApp ouvre une discussion avec votre
        numéro, sans que la personne ait à l'enregistrer dans ses contacts. Choisissez l'indicatif du pays, tapez votre
        numéro tel que vous le connaissez, ajoutez si vous voulez un message de départ : l'outil met le numéro au format
        international, encode le message et affiche le lien à copier et son QR code. Exemple : 06 12 34 56 78 en France
        devient https://wa.me/33612345678, et avec le message « Bonjour » le lien passe à 38 caractères, soit un code
        de 29 × 29 modules. La limite : le numéro est lisible par quiconque scanne le code, et le message ne peut plus
        changer une fois le code imprimé. Le lien n'ouvre une discussion que si le numéro correspond à un compte
        WhatsApp actif.
      </p>
    </Section>

    <Section titre="Comment est construit un lien wa.me">
      <p>
        L'aide WhatsApp décrit la fonction « clic vers WhatsApp » : un lien de la forme{" "}
        <code className="text-sky-300">https://wa.me/numéro</code> ouvre directement une discussion avec ce numéro. Le
        numéro s'écrit au format international complet, sans zéro initial, sans parenthèses et sans tirets ; une autre
        page d'aide rappelle de retirer tout 0 en début de numéro.
      </p>
      <p>
        Pour ajouter un message de départ, on ajoute <code className="text-sky-300">?text=</code> suivi du message
        encodé au format URL. « Bonjour, je réserve une table » devient ainsi{" "}
        <code className="text-sky-300 [overflow-wrap:anywhere]">?text=Bonjour%2C%20je%20r%C3%A9serve%20une%20table</code>. Le
        lien <code className="text-sky-300">https://wa.me/?text=…</code>, sans numéro, ouvre la liste des contacts pour
        choisir à qui envoyer le message : pratique pour faire circuler une invitation.
      </p>
      <p>
        Le générateur convertit le numéro selon l'indicatif choisi. Pour la France et les départements d'outre-mer, le 0
        initial disparaît (0692 à La Réunion devient 262692). Pour les pays dont le numéro national ne commence pas par
        un 0 de préfixe, comme la Côte d'Ivoire, le Sénégal ou le Luxembourg, le numéro est repris tel quel après
        l'indicatif.
      </p>
    </Section>

    <Section titre="Où afficher votre QR code WhatsApp">
      <p>
        <strong>En vitrine ou au comptoir</strong>, pour prendre des commandes ou des rendez-vous : un message prérempli
        comme « Bonjour, je souhaite réserver pour… » guide la personne et vous fait gagner un échange.
      </p>
      <p>
        <strong>Sur une annonce</strong> (vente de voiture, location, petite annonce imprimée) : le code évite de
        recopier le numéro, et le message rappelle de quelle annonce il s'agit, utile si vous en publiez plusieurs.
      </p>
      <p>
        <strong>Sur un flyer, une carte ou un devis</strong> : collez aussi le lien dans votre signature d'e-mail ou sur
        votre site, où il se clique directement. Pour une carte de visite complète, le{" "}
        <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> enregistre toutes vos coordonnées d'un coup.
      </p>
      <p>
        Avant d'imprimer, scannez le code avec un téléphone sur lequel WhatsApp est installé et vérifiez que la
        discussion s'ouvre avec le bon numéro et le bon message. Indiquez aussi votre numéro en clair à côté du code,
        pour les personnes qui n'utilisent pas WhatsApp et préfèrent appeler ou écrire un SMS.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="WhatsApp QR code and wa.me link: what the tool does">
      <p>
        A WhatsApp QR code is a picture of a wa.me link: when someone scans it, WhatsApp opens a chat with your number
        without them having to save it as a contact. Pick the country code, type your number the way you usually write
        it, add an opening message if you like: the tool rewrites the number in international format, encodes the
        message and shows the link to copy alongside its QR code. For instance, the French mobile 06 12 34 56 78 becomes
        https://wa.me/33612345678, and with the message "Bonjour" the link grows to 38 characters, a code of 29 × 29
        modules. The limits: anyone who scans the code can read your number, the message is fixed once the code is
        printed, and the link only opens a chat if the number belongs to an active WhatsApp account.
      </p>
    </Section>

    <Section titre="French numbers, foreign numbers and the international format">
      <p>
        WhatsApp Help sets the rule: use <code className="text-sky-300">https://wa.me/number</code> with the full
        international number, leaving out any zero, brackets or dashes. French mobiles start with 06 or 07 when dialled
        inside France; in the link the 0 goes and 33 takes its place. The overseas départements have their own codes:
        262 for Réunion and Mayotte, 590 for Guadeloupe, 596 for Martinique, 594 for French Guiana.
      </p>
      <p>
        Many English speakers in France keep WhatsApp on the number they arrived with. A British, Irish or North American
        number keeps its own country code in the link, whatever your address: what matters is the number the WhatsApp
        account was created with. If you type the number with + or 00 at the start, the tool leaves your code untouched.
      </p>
      <p>
        An opening message is added with <code className="text-sky-300">?text=</code> followed by the URL-encoded text,
        so "Hello, I'd like to book" becomes{" "}
        <code className="text-sky-300 [overflow-wrap:anywhere]">?text=Hello%2C%20I&apos;d%20like%20to%20book</code>. A link
        without a number, <code className="text-sky-300">https://wa.me/?text=…</code>, lets people choose which contact
        to forward the message to, handy for a school parents' group or a local association.
      </p>
    </Section>

    <Section titre="Where a WhatsApp QR code earns its place">
      <p>
        <strong>Trades and services.</strong> Plumbers, English-speaking estate agents and tutors in France often take
        bookings on WhatsApp. A code on the van, the invoice or the flyer, with a message such as "Bonjour, je souhaite
        un devis" or its English twin, starts the conversation for the customer.
      </p>
      <p>
        <strong>Holiday lets and B&amp;Bs.</strong> A code in the welcome folder lets guests reach you during their stay
        without roaming calls; WhatsApp only needs a data connection or your wifi, which the{" "}
        <Link to="/en/wifi-qr-code/">wifi QR code</Link> shares in one scan.
      </p>
      <p>
        <strong>Classified ads.</strong> On a printed ad for a car or a flat, the pre-filled message tells you which ad
        the person is answering, useful when several run at once. Before printing anything, scan the code with a phone
        that has WhatsApp and check the number and message, and write your number in plain text next to the code for
        people who would rather call. For a full contact card, the <Link to="/en/vcard-qr-code/">vCard QR code</Link>{" "}
        saves all your details at once.
      </p>
    </Section>
  </>
);

export default QrCodeWhatsapp;
