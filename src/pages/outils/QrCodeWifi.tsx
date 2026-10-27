import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { contenuWifi, SecuriteWifi } from "@/lib/qr-formats";
import { type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Mon mot de passe wifi contient un point-virgule ou des deux-points, le code va-t-il marcher ?",
      r: "Oui. Dans le format WIFI:, le point-virgule sépare les champs et les deux-points séparent le nom du champ de sa valeur. Le générateur place donc une barre oblique inverse devant chaque point-virgule, virgule, deux-points, guillemet et barre oblique inverse de votre nom de réseau et de votre mot de passe. Le téléphone retire ces barres en lisant le code et retrouve le mot de passe exact.",
    },
    {
      q: "Ma box est en WPA3, quel type de sécurité dois-je choisir ?",
      r: "Choisissez « WPA, WPA2 ou WPA3 ». Le format décrit par ZXing ne connaît qu'une valeur WPA pour les réseaux protégés par un mot de passe partagé, et c'est elle que le téléphone utilise pour proposer la connexion. Si un appareil ancien n'arrive pas à rejoindre un réseau réglé en WPA3 seul, c'est une limite de l'appareil : le mode mixte WPA2 et WPA3 de la box règle en général le problème.",
    },
    {
      q: "Je veux que mes invités se connectent sans voir le mot de passe, c'est possible ?",
      r: "Pas vraiment. Le mot de passe est écrit en clair dans le QR code : n'importe quelle application de lecture, y compris l'outil Lire un QR code de 75tools, peut l'afficher. Le code évite de dicter ou de taper le mot de passe, il ne le cache pas. Si vous ne voulez pas le révéler, créez un réseau invité sur votre box, avec son propre mot de passe, et partagez celui-là.",
    },
    {
      q: "Si je change le mot de passe de ma box, la carte imprimée reste-t-elle valable ?",
      r: "Non. Le QR code contient le mot de passe tel qu'il était au moment de sa création : après un changement, le téléphone tentera de se connecter avec l'ancien et échouera. Il faut générer un nouveau code et réimprimer la carte. C'est l'occasion de vérifier aussi le nom du réseau, qui change parfois après un remplacement de box par l'opérateur.",
    },
    {
      q: "À quoi sert la case « réseau masqué » ?",
      r: "Un réseau masqué ne diffuse pas son nom : il n'apparaît pas dans la liste des réseaux du téléphone. Cocher la case ajoute H:true au code, ce qui indique au téléphone qu'il doit chercher ce réseau même s'il ne le voit pas. Si votre réseau apparaît normalement dans la liste wifi de votre téléphone, laissez la case décochée : l'option n'apporte rien et allonge le code.",
    },
    {
      q: "Quelle taille donner au QR code wifi sur la carte imprimée ?",
      r: "La carte place le code sur 7 cm de large. Pour un réseau et un mot de passe de longueur courante, le code compte 29 modules par côté, plus la marge : chaque module mesure alors près de 2 mm, ce qu'un téléphone lit à un mètre. Sur une étiquette collée sous la box, 3 cm suffisent pour un scan de près.",
    },
  ],
  en: [
    {
      q: "My wifi password has a semicolon or a colon in it, will the QR code still work?",
      r: "Yes. In the WIFI: format, semicolons separate the fields and colons separate a field name from its value, so the generator puts a backslash in front of every semicolon, comma, colon, double quote and backslash in your network name and password, as the format requires. The phone removes those backslashes when it reads the code and gets the exact password back.",
    },
    {
      q: "My French internet box (Livebox, Freebox, Bbox) uses WPA3, which option do I pick?",
      r: "Pick \"WPA, WPA2 or WPA3\". The WIFI: format documented by ZXing has a single WPA value for every network protected by a shared password, and phones use it for WPA3 too. If an older laptop or games console cannot join a WPA3-only network, switch the box to its mixed WPA2/WPA3 mode in the box settings: that is a device limit, not a QR code problem.",
    },
    {
      q: "Can my guests read the wifi password from the QR code?",
      r: "Yes, if they want to. The password is stored as plain text in the code, and any QR reader app, including the 75tools QR code reader, can display it. The code saves you spelling the password out; it does not hide it. For a holiday let or an office, turn on the guest network (réseau invité) of your box and share that one instead.",
    },
    {
      q: "My provider replaced the box: does the printed wifi card still work?",
      r: "Usually not. A new box from Orange, Free, SFR or Bouygues comes with a new network name and password printed on its label, and the old card still holds the old ones. Either set the new box to your previous name and password, or make a new code and reprint the card. Check the card with your own phone after any change.",
    },
    {
      q: "What does the hidden network option do?",
      r: "A hidden network does not broadcast its name, so it never appears in the phone's list of available networks. Ticking the option adds H:true to the code, which tells the phone to look for the network even though it cannot see it. If your network shows up normally in the wifi list, leave the box unticked: it adds nothing and makes the code longer.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, Spécification de la symbologie de code à barres Code QR",
      url: "https://www.iso.org/fr/standard/62021.html",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Assistance Apple",
      titre: "Scanner un code QR avec la caméra de l'iPhone",
      url: "https://support.apple.com/fr-fr/guide/iphone/iphe8bda8762/ios",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Aide Android (Google)",
      titre: "Se connecter à des réseaux Wi-Fi sur un appareil Android",
      url: "https://support.google.com/android/answer/9075847?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Wi-Fi Alliance",
      titre: "Security (WPA3, WPA2)",
      url: "https://www.wi-fi.org/discover-wi-fi/security",
      lu: "27 octobre 2026",
    },
    {
      editeur: "ZXing (GitHub)",
      titre: "Barcode Contents, section Wi-Fi Network config (format WIFI: et échappement)",
      url: "https://github.com/zxing/zxing/wiki/Barcode-Contents",
      lu: "27 octobre 2026",
    },
  ],
  en: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification",
      url: "https://www.iso.org/standard/62021.html",
      lu: "27 October 2026",
    },
    {
      editeur: "Apple Support",
      titre: "Scan a QR code with your iPhone camera",
      url: "https://support.apple.com/en-gb/guide/iphone/iphe8bda8762/ios",
      lu: "27 October 2026",
    },
    {
      editeur: "Android Help (Google)",
      titre: "Connect to Wi-Fi networks on your Android device",
      url: "https://support.google.com/android/answer/9075847?hl=en",
      lu: "27 October 2026",
    },
    {
      editeur: "Wi-Fi Alliance",
      titre: "Security (WPA3, WPA2)",
      url: "https://www.wi-fi.org/discover-wi-fi/security",
      lu: "27 October 2026",
    },
    {
      editeur: "ZXing (GitHub)",
      titre: "Barcode Contents, Wi-Fi Network config section",
      url: "https://github.com/zxing/zxing/wiki/Barcode-Contents",
      lu: "27 October 2026",
    },
  ],
};

type LangueCarte = "fr" | "en" | "fr-en";

const CARTE = {
  fr: { titre: "Wifi", scan: "Scannez avec l'appareil photo de votre téléphone pour vous connecter.", mdp: "Mot de passe :" },
  en: { titre: "Wi-Fi", scan: "Scan with your phone camera to connect.", mdp: "Password:" },
};

const T = {
  fr: {
    nomAppli: "Générateur de QR code wifi 75tools",
    motsCles: "générateur qr code wifi, qr code wifi, partager wifi par qr code, carte wifi à imprimer, qr code mot de passe wifi",
    form: "Réseau wifi",
    ssid: "Nom du réseau (SSID)",
    ssidDefaut: "Maison Martin",
    aideSsid: "Respectez exactement les majuscules, les espaces et la ponctuation.",
    securite: "Sécurité",
    wpa: "WPA, WPA2 ou WPA3 (courant)",
    wep: "WEP (ancien)",
    ouvert: "Aucun mot de passe (réseau ouvert)",
    mdp: "Mot de passe",
    afficher: "Afficher",
    masquer: "Masquer",
    masque: "Réseau masqué (son nom n'apparaît pas dans la liste wifi)",
    mdpCarte: "Écrire aussi le mot de passe sur la carte imprimée (pour les appareils sans appareil photo)",
    langueCarte: "Langue de la carte",
    langues: { fr: "Français", en: "Anglais", "fr-en": "Français et anglais" } as Record<LangueCarte, string>,
    alerteSsid: "Indiquez le nom du réseau (SSID), tel qu'il apparaît dans la liste wifi du téléphone.",
    alerteCourt: "Un mot de passe WPA compte au moins 8 caractères : vérifiez-le.",
    alerteVide: "Saisissez le mot de passe du réseau, ou choisissez « Aucun » pour un réseau ouvert.",
    voirTexte: "Voir le texte encodé dans le QR code",
    vide: "Indiquez le nom du réseau.",
    imprimer: "Imprimer la carte",
    fichier: "qr-wifi-",
    reseau: "reseau",
    carteDefaut: "fr" as LangueCarte,
  },
  en: {
    nomAppli: "75tools WiFi QR code generator",
    motsCles: "wifi qr code generator, wifi qr code, share wifi with qr code, printable wifi card, wifi password qr code",
    form: "Wifi network",
    ssid: "Network name (SSID)",
    ssidDefaut: "Home Wifi",
    aideSsid: "Match capitals, spaces and punctuation exactly.",
    securite: "Security",
    wpa: "WPA, WPA2 or WPA3 (usual)",
    wep: "WEP (old)",
    ouvert: "No password (open network)",
    mdp: "Password",
    afficher: "Show",
    masquer: "Hide",
    masque: "Hidden network (its name does not appear in the wifi list)",
    mdpCarte: "Also print the password on the card (for devices without a camera)",
    langueCarte: "Card language",
    langues: { fr: "French", en: "English", "fr-en": "French and English" } as Record<LangueCarte, string>,
    alerteSsid: "Enter the network name (SSID) exactly as it appears in the phone's wifi list.",
    alerteCourt: "A WPA password has at least 8 characters: check it.",
    alerteVide: "Enter the network password, or choose \"No password\" for an open network.",
    voirTexte: "Show the text encoded in the QR code",
    vide: "Enter the network name.",
    imprimer: "Print the card",
    fichier: "wifi-qr-",
    reseau: "network",
    carteDefaut: "fr-en" as LangueCarte,
  },
};

const QrCodeWifi = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [ssid, setSsid] = useState(t.ssidDefaut);
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [securite, setSecurite] = useState<SecuriteWifi>("WPA");
  const [masque, setMasque] = useState(false);
  const [mdpSurCarte, setMdpSurCarte] = useState(true);
  const [langueCarte, setLangueCarte] = useState<LangueCarte>(t.carteDefaut);
  const [svg, setSvg] = useState("");

  const contenu = useMemo(
    () => (ssid ? contenuWifi({ ssid, motDePasse: mdp, securite, masque }) : ""),
    [ssid, mdp, securite, masque]
  );
  const alerte = !ssid
    ? t.alerteSsid
    : securite === "WPA" && mdp && mdp.length < 8
      ? t.alerteCourt
      : securite !== "nopass" && !mdp
        ? t.alerteVide
        : "";
  const fichier =
    t.fichier +
    (ssid.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || t.reseau);
  const textesCarte = langueCarte === "fr-en" ? [CARTE.fr, CARTE.en] : [CARTE[langueCarte]];

  const outil = (
    <>
      <form
        className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-rows-[auto_1fr] items-start print:hidden"
        onSubmit={(e) => e.preventDefault()}
        aria-label={t.form}
      >
        <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-1">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.ssid}</span>
            <input
              id="champ-ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className={classeChamp}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="block text-xs text-neutral-500 mt-1">{t.aideSsid}</span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.securite}</span>
            <select
              id="champ-securite"
              value={securite}
              onChange={(e) => setSecurite(e.target.value as SecuriteWifi)}
              className={classeSelect}
            >
              <option value="WPA">{t.wpa}</option>
              <option value="WEP">{t.wep}</option>
              <option value="nopass">{t.ouvert}</option>
            </select>
          </label>
          {securite !== "nopass" && (
            <div className="min-w-0">
              <label htmlFor="champ-mdp" className="block text-sm text-neutral-300 mb-1">
                {t.mdp}
              </label>
              <div className="flex gap-2">
                <input
                  id="champ-mdp"
                  type={voir ? "text" : "password"}
                  value={mdp}
                  onChange={(e) => setMdp(e.target.value)}
                  className={classeChamp + " min-w-0"}
                  autoComplete="off"
                  spellCheck={false}
                />
                <Bouton secondaire onClick={() => setVoir((v) => !v)}>
                  {voir ? t.masquer : t.afficher}
                </Bouton>
              </div>
            </div>
          )}
          {alerte && (
            <p role="status" className="text-sm text-amber-300">
              {alerte}
            </p>
          )}
        </div>

        <div data-resultat className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
          <QrApercu
            texte={contenu}
            nomFichier={fichier}
            id="qr-wifi"
            vide={t.vide}
            onRendu={(s) => setSvg(s)}
            actions={
              <Bouton secondaire onClick={() => window.print()} disabled={!svg}>
                {t.imprimer}
              </Bouton>
            }
          />
        </div>

        <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-2">
          <label className="flex items-start gap-3 text-sm text-neutral-300">
            <input type="checkbox" checked={masque} onChange={(e) => setMasque(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-400" />
            <span>{t.masque}</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={mdpSurCarte}
              onChange={(e) => setMdpSurCarte(e.target.checked)}
              className="mt-1 h-4 w-4 accent-sky-400"
            />
            <span>{t.mdpCarte}</span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.langueCarte}</span>
            <select
              id="champ-langue-carte"
              value={langueCarte}
              onChange={(e) => setLangueCarte(e.target.value as LangueCarte)}
              className={classeSelect}
            >
              {(["fr", "en", "fr-en"] as LangueCarte[]).map((l) => (
                <option key={l} value={l}>
                  {t.langues[l]}
                </option>
              ))}
            </select>
          </label>
          <details className="text-sm">
            <summary className="cursor-pointer text-neutral-300">{t.voirTexte}</summary>
            <pre
              id="texte-wifi"
              className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-300 text-xs"
            >
              {contenu}
            </pre>
          </details>
        </div>
      </form>

      {/* Carte imprimée : seule visible à l'impression */}
      <div className="hidden print:block text-black">
        <div className="mx-auto mt-8 w-[12cm] border-2 border-black rounded-2xl p-8 text-center">
          <p className="text-3xl font-semibold">{textesCarte.map((c) => c.titre).join(" · ")}</p>
          <p className="mt-1 text-xl [overflow-wrap:anywhere]">{ssid}</p>
          {svg && <div className="mx-auto mt-6 w-[7cm] [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />}
          {textesCarte.map((c) => (
            <p key={c.scan} className="mt-4 text-base">
              {c.scan}
            </p>
          ))}
          {mdpSurCarte && securite !== "nopass" && mdp && (
            <p className="mt-4 text-base">
              {textesCarte.map((c) => c.mdp).join(" / ")}{" "}
              <span className="font-mono text-lg [overflow-wrap:anywhere]">{mdp}</span>
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <PageOutil
      id="qr-code-wifi"
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
    <Section titre="Générateur de QR code wifi : comment il fonctionne">
      <p>
        Ce générateur de QR code wifi transforme le nom de votre réseau et son mot de passe en un code que vos invités
        scannent avec l'appareil photo de leur téléphone pour se connecter, sans rien taper. Saisissez le nom du réseau
        (SSID) exactement comme il apparaît dans la liste wifi, choisissez la sécurité, tapez le mot de passe : le code
        s'affiche aussitôt, avec un bouton pour imprimer une carte de 12 cm de large. Exemple : le réseau « Maison
        Martin » protégé par le mot de passe « soleil-2026 » devient le texte WIFI:T:WPA;S:Maison
        Martin;P:soleil-2026;; soit 42 caractères et un code de 29 × 29 modules, lisible à un mètre sur la carte. La
        limite à connaître : le mot de passe figure en clair dans le code, et toute modification du mot de passe de la
        box rend la carte inutilisable.
      </p>
    </Section>

    <Section titre="Ce que contient un QR code wifi">
      <p>
        Un QR code wifi n'est qu'un court texte, dans un format proposé par le projet ZXing et repris par les
        téléphones. Le champ <strong>T</strong> donne le type de sécurité (WPA, WEP, ou nopass pour un réseau ouvert),{" "}
        <strong>S</strong> le nom du réseau, <strong>P</strong> le mot de passe, et <strong>H:true</strong> s'ajoute
        pour un réseau masqué. Les deux points-virgules finaux ferment le tout.
      </p>
      <p>
        Comme le point-virgule, la virgule, les deux-points, le guillemet et la barre oblique inverse ont un rôle dans
        ce format, ils sont précédés d'une barre oblique inverse quand ils figurent dans le nom ou le mot de passe. Un
        mot de passe comme <code className="text-sky-300">Café;2026:ok</code> devient ainsi{" "}
        <code className="text-sky-300">Café\;2026\:ok</code> dans le code. Le générateur s'en charge, et vous pouvez
        vérifier le texte exact en dépliant « Voir le texte encodé ». Le mot de passe ne quitte pas votre navigateur :
        il n'est ni envoyé ni enregistré par 75tools.
      </p>
      <p>
        Côté sécurité du réseau lui-même, la Wi-Fi Alliance indique que WPA3 est obligatoire pour les appareils
        certifiés Wi-Fi CERTIFIED et qu'il protège mieux contre les tentatives de devinette du mot de passe. Le QR code
        n'y change rien : choisissez « WPA, WPA2 ou WPA3 », la même valeur sert aux trois.
      </p>
    </Section>

    <Section titre="Se connecter en scannant, sur iPhone et sur Android">
      <p>
        <strong>Sur iPhone</strong>, l'aide Apple indique la marche à suivre : ouvrez l'app Caméra en mode Photo, cadrez le
        code puis touchez le lien qui apparaît en bas de l'écran. La commande de scan de code du centre de contrôle
        fonctionne aussi.
      </p>
      <p>
        <strong>Sur Android</strong>, l'appareil photo de la plupart des modèles lit les QR codes, et Google Lens prend
        le relais sinon. Android sait d'ailleurs produire lui-même ce type de code : l'aide Android explique qu'il suffit
        d'ouvrir Paramètres, Réseau et Internet, Internet, de toucher son réseau puis Partager. Le générateur reste utile
        pour une carte imprimée, posée dans une chambre d'hôte, une salle d'attente ou un bureau, qui fonctionne même
        quand vous n'êtes pas là.
      </p>
      <p>
        Les ordinateurs portables n'ont en général pas de lecteur de QR code : c'est pour eux que la carte peut aussi
        afficher le mot de passe en toutes lettres.
      </p>
    </Section>

    <Section titre="Une carte wifi pour vos invités ou vos clients">
      <p>
        Le bouton « Imprimer la carte » prépare une carte : « Wifi », le nom du réseau, le QR code de 7 cm et une ligne
        d'explication, avec le mot de passe en dessous si vous le souhaitez. Pour un gîte qui reçoit des touristes
        étrangers, choisissez une carte en français et en anglais. Dans la fenêtre d'impression, « Enregistrer au format
        PDF » permet de la garder ou de l'envoyer à un imprimeur.
      </p>
      <p>
        Dans un lieu ouvert au public, ne partagez pas le wifi de votre propre box : créez un réseau invité, isolé de vos
        ordinateurs et de vos imprimantes, et mettez celui-là sur la carte. Vous pourrez en changer le mot de passe sans
        toucher à votre réseau principal. Pour accompagner la carte, le{" "}
        <Link to="/generateur-qr-code/">générateur de QR code</Link> crée un code vers votre livret d'accueil en ligne.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="How this WiFi QR code generator works">
      <p>
        This WiFi QR code generator turns your network name and password into a code that guests scan with their phone
        camera to join, without typing anything. Enter the network name (SSID) exactly as it appears in the wifi list,
        pick the security type and type the password: the code appears at once, with a button to print a card 12 cm
        wide, in French, English or both. For example, a network called "Home Wifi" protected by "sunshine-2026" becomes
        the text WIFI:T:WPA;S:Home Wifi;P:sunshine-2026;; which is 40 characters and a code of 29 × 29 modules, easy to
        scan from a metre away on the card. The catch: the password sits in the code as plain text, and the card stops
        working the day you change the password of your box.
      </p>
    </Section>

    <Section titre="Your French internet box and its wifi details">
      <p>
        In France the router is called a "box" (la box internet) and comes from your provider: a Livebox from Orange, a
        Freebox from Free, a Bbox from Bouygues Telecom or an SFR box. The default network name and password are printed
        on a label underneath or on the back, often as a long random key. That is exactly the case where a QR code
        helps: nobody wants to dictate twenty characters to a visitor.
      </p>
      <p>
        Behind the code is a short piece of text in a format documented by the ZXing project and read by phone cameras.
        Field <strong>T</strong> is the security type (WPA, WEP or nopass for an open network), <strong>S</strong> the
        network name, <strong>P</strong> the password, and <strong>H:true</strong> marks a hidden network. Semicolons,
        commas, colons, double quotes and backslashes inside the name or password get a backslash in front of them; the
        tool does this for you, and "Show the text encoded" lets you check the result. Nothing you type leaves your
        browser.
      </p>
      <p>
        The Wi-Fi Alliance states that WPA3 is mandatory on Wi-Fi CERTIFIED devices and better resists password
        guessing. The QR code works the same way with WPA2 and WPA3, so the single "WPA" option covers both.
      </p>
    </Section>

    <Section titre="Joining by scanning on iPhone and Android">
      <p>
        <strong>On iPhone</strong>, Apple's guide is simple: open the Camera app in Photo mode, frame the code and tap the
        link that appears at the bottom of the screen. The Scan Code control in Control Centre works too. <strong>On Android</strong>, most camera apps read QR
        codes, and Google Lens covers the rest. Android can even show its own wifi QR code: Google's help explains that
        you open Settings, Network and internet, Internet, tap your network, then Share.
      </p>
      <p>
        A printed card still has the edge when you are not around: a holiday let (gîte or chambre d'hôtes), a waiting
        room, a coworking desk. Laptops rarely scan QR codes, which is why the card can also print the password in full.
      </p>
    </Section>

    <Section titre="A printed wifi card for guests and customers">
      <p>
        "Print the card" lays out the word Wi-Fi, the network name, a 7 cm code and one line of instructions, plus the
        password if you tick the option. For a rental that welcomes both French and international guests, the bilingual
        card avoids two versions. In the print dialog, "Save as PDF" keeps a copy or lets you send it to a print shop.
      </p>
      <p>
        If the place is open to the public, do not share your main network: turn on the guest network (réseau invité)
        in your box settings, which keeps visitors away from your computers and printer, and put that one on the card.
        To add a link to your online welcome booklet, use the <Link to="/en/qr-code-generator/">free QR code generator</Link>.
      </p>
    </Section>
  </>
);

export default QrCodeWifi;
