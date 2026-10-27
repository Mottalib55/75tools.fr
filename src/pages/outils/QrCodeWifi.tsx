import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { contenuWifi, SecuriteWifi } from "@/lib/qr-formats";

const HREF = "/qr-code-wifi/";
const TITRE =
  "QR code wifi gratuit : partagez votre réseau en un scan";
const DESCRIPTION =
  "QR code wifi gratuit : nom du réseau, mot de passe, WPA, WEP ou réseau ouvert, et une carte à imprimer. Vos invités se connectent en scannant, sans rien taper.";

const FAQ: QuestionFaq[] = [
  {
    q: "Mon mot de passe wifi contient un point-virgule ou des deux-points, le code va-t-il marcher ?",
    r: "Oui. Dans le format WIFI:, le point-virgule sépare les champs et les deux-points séparent le nom du champ de sa valeur. Le générateur place donc une barre oblique inverse devant chaque point-virgule, virgule, deux-points, guillemet et barre oblique inverse de votre nom de réseau et de votre mot de passe, comme le prévoit la spécification. Le téléphone retire ces barres en lisant le code et retrouve le mot de passe exact.",
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
    r: "Un réseau masqué ne diffuse pas son nom : il n'apparaît pas dans la liste des réseaux du téléphone. Cocher la case ajoute H:true au code, ce qui indique au téléphone qu'il doit chercher ce réseau même s'il ne le voit pas. Si votre réseau est visible normalement, laissez la case décochée.",
  },
];

const SOURCES = [
  {
    editeur: "ZXing (GitHub)",
    titre: "Barcode Contents, section Wi-Fi Network config (format WIFI: et échappement)",
    url: "https://github.com/zxing/zxing/wiki/Barcode-Contents",
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
];

const QrCodeWifi = () => {
  const [ssid, setSsid] = useState("Maison Martin");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [securite, setSecurite] = useState<SecuriteWifi>("WPA");
  const [masque, setMasque] = useState(false);
  const [mdpSurCarte, setMdpSurCarte] = useState(true);
  const [svg, setSvg] = useState("");

  const contenu = useMemo(
    () => (ssid ? contenuWifi({ ssid, motDePasse: mdp, securite, masque }) : ""),
    [ssid, mdp, securite, masque]
  );
  const alerte =
    !ssid
      ? "Indiquez le nom du réseau (SSID), tel qu'il apparaît dans la liste wifi du téléphone."
      : securite === "WPA" && mdp && mdp.length < 8
        ? "Un mot de passe WPA compte au moins 8 caractères : vérifiez-le."
        : securite !== "nopass" && !mdp
          ? "Saisissez le mot de passe du réseau, ou choisissez « Aucun » pour un réseau ouvert."
          : "";
  const fichier =
    "qr-wifi-" +
    (ssid.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "reseau");

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="qr code wifi, générateur qr code wifi, partager wifi par qr code, carte wifi à imprimer, qr code mot de passe wifi"
      nomAppli="Générateur de QR code wifi"
      h1="Générateur de QR code wifi et carte à imprimer"
      chapeau="Saisissez le nom du réseau et le mot de passe : vos invités scannent le code avec l'appareil photo et se connectent sans rien taper. Le mot de passe ne quitte pas votre navigateur, aucun serveur ne le reçoit."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start print:hidden">
        <div className="order-first lg:order-last lg:sticky lg:top-4">
          <QrApercu
            texte={contenu}
            nomFichier={fichier}
            id="qr-wifi"
            vide="Indiquez le nom du réseau."
            onRendu={(s) => setSvg(s)}
            actions={
              <Bouton secondaire onClick={() => window.print()} disabled={!svg}>
                Imprimer la carte
              </Bouton>
            }
          />
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Réseau wifi">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Nom du réseau (SSID)</span>
            <input
              id="champ-ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className={classeChamp}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Respectez exactement les majuscules, les espaces et la ponctuation.
            </span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Sécurité</span>
            <select
              id="champ-securite"
              value={securite}
              onChange={(e) => setSecurite(e.target.value as SecuriteWifi)}
              className={classeSelect}
            >
              <option value="WPA">WPA, WPA2 ou WPA3 (cas le plus courant)</option>
              <option value="WEP">WEP (ancien)</option>
              <option value="nopass">Aucun mot de passe (réseau ouvert)</option>
            </select>
          </label>
          {securite !== "nopass" && (
            <div className="min-w-0">
              <label htmlFor="champ-mdp" className="block text-sm text-neutral-300 mb-1">
                Mot de passe
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
                  {voir ? "Masquer" : "Afficher"}
                </Bouton>
              </div>
            </div>
          )}
          <label className="flex items-start gap-3 text-sm text-neutral-300">
            <input type="checkbox" checked={masque} onChange={(e) => setMasque(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-400" />
            <span>Réseau masqué (son nom n'apparaît pas dans la liste wifi)</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={mdpSurCarte}
              onChange={(e) => setMdpSurCarte(e.target.checked)}
              className="mt-1 h-4 w-4 accent-sky-400"
            />
            <span>Écrire aussi le mot de passe sur la carte imprimée (pour les appareils sans appareil photo)</span>
          </label>
          {alerte && (
            <p role="status" className="text-sm text-amber-300">
              {alerte}
            </p>
          )}
          <details className="text-sm">
            <summary className="cursor-pointer text-neutral-300">Voir le texte encodé dans le QR code</summary>
            <pre id="texte-wifi" className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere] bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-300 text-xs">
              {contenu}
            </pre>
          </details>
        </form>
      </div>

      {/* Carte imprimée : seule visible à l'impression */}
      <div className="hidden print:block text-black">
        <div className="mx-auto mt-8 w-[12cm] border-2 border-black rounded-2xl p-8 text-center">
          <p className="text-3xl font-semibold">Wifi</p>
          <p className="mt-1 text-xl [overflow-wrap:anywhere]">{ssid}</p>
          {svg && <div className="mx-auto mt-6 w-[7cm] [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />}
          <p className="mt-6 text-base">Scannez avec l'appareil photo de votre téléphone pour vous connecter.</p>
          {mdpSurCarte && securite !== "nopass" && mdp && (
            <p className="mt-4 text-base">
              Mot de passe : <span className="font-mono text-lg [overflow-wrap:anywhere]">{mdp}</span>
            </p>
          )}
        </div>
      </div>

      <Section titre="Ce que contient un QR code wifi">
        <p>
          Un QR code wifi n'est qu'un court texte, dans un format proposé par le projet ZXing et repris par les
          téléphones : <code className="text-sky-300">WIFI:T:WPA;S:nom du réseau;P:mot de passe;;</code>. Le champ
          <strong> T</strong> donne le type de sécurité (WPA, WEP, ou nopass pour un réseau ouvert), <strong>S</strong> le
          nom du réseau, <strong>P</strong> le mot de passe, et <strong>H:true</strong> s'ajoute pour un réseau masqué.
          Les deux points-virgules finaux ferment le tout.
        </p>
        <p>
          Comme le point-virgule, la virgule, les deux-points, le guillemet et la barre oblique inverse ont un rôle dans
          ce format, la spécification demande de les faire précéder d'une barre oblique inverse quand ils figurent dans
          le nom ou le mot de passe. Un mot de passe comme <code className="text-sky-300">Café;2026:ok</code> devient
          ainsi <code className="text-sky-300">Café\;2026\:ok</code> dans le code. Le générateur s'en charge : vous
          pouvez vérifier le texte exact en dépliant « Voir le texte encodé ». Les lettres accentuées sont écrites en
          UTF-8.
        </p>
        <p>
          Le mot de passe y figure en clair. Le code ne protège donc rien : il évite seulement de le dicter ou de le
          recopier. Tout se passe dans votre navigateur, le mot de passe n'est ni envoyé ni enregistré par 75tools.
        </p>
      </Section>

      <Section titre="Se connecter en scannant, sur iPhone et sur Android">
        <p>
          <strong>Sur iPhone</strong>, l'aide Apple indique la marche à suivre : ouvrez l'app Caméra, cadrez le code
          en mode Photo, puis touchez ce qui s'affiche en bas de l'écran. Le scanner de codes du centre de contrôle
          fonctionne aussi. Faites l'essai avec votre propre téléphone avant d'imprimer la carte.
        </p>
        <p>
          <strong>Sur Android</strong>, l'appareil photo de la plupart des modèles lit les QR codes, et Google Lens prend
          le relais sinon. Android sait d'ailleurs produire lui-même ce type de code : l'aide Android explique qu'il
          suffit d'ouvrir Paramètres, Réseau et Internet, Internet, de toucher son réseau puis Partager pour afficher un
          QR code que l'autre personne scanne avec son appareil. L'aide précise que certaines de ces étapes ne
          s'appliquent qu'à Android 12 ou version ultérieure. Le générateur de cette page reste utile pour une carte
          imprimée, posée dans une chambre d'hôte, une salle d'attente ou un bureau.
        </p>
        <p>
          Les ordinateurs portables n'ont en général pas de lecteur de QR code : c'est pour eux que la carte peut
          aussi afficher le mot de passe en toutes lettres.
        </p>
      </Section>

      <Section titre="Une carte wifi pour vos invités ou vos clients">
        <p>
          Le bouton « Imprimer la carte » prépare une carte d'environ 12 cm de large : « Wifi », le nom du réseau, le
          QR code et une ligne d'explication, avec le mot de passe en dessous si vous le souhaitez. Dans la fenêtre
          d'impression, choisissez « Enregistrer au format PDF » pour la garder ou l'envoyer à un imprimeur.
        </p>
        <p>
          Dans un lieu ouvert au public (gîte, café, cabinet), ne partagez pas le wifi de votre propre box : créez un
          réseau invité, isolé de vos ordinateurs et de vos imprimantes, et mettez celui-là sur la carte. Vous pourrez
          en changer le mot de passe sans toucher à votre réseau principal. Pour accompagner la carte, le{" "}
          <Link to="/generateur-qr-code/">générateur de QR code</Link> crée aussi un code vers votre site ou votre
          livret d'accueil, et l'outil <Link to="/lire-qr-code/">Lire un QR code</Link> vous permet de vérifier ce que
          contient un code existant.
        </p>
      </Section>
    </PageOutil>
  );
};

export default QrCodeWifi;
