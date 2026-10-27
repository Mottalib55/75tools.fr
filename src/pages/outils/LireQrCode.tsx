import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsQR from "jsqr";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { chargerImage } from "@/lib/fichiers";
import { reconnaitre, domainePrincipal, TypeContenu } from "@/lib/qr-formats";
import { copierTexte } from "@/lib/texte-copier";
import { useLangue, type Langue } from "@/lib/langue";

const URL_QUISHING = "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/quishing-hameconnage-qr-code";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je n'ai qu'une capture d'écran du QR code, ça suffit pour le lire ?",
      r: "Oui. Faites la capture, puis revenez sur cette page et appuyez sur Ctrl + V (Cmd + V sur Mac) : l'image collée est analysée aussitôt. Vous pouvez aussi enregistrer la capture et l'importer avec le bouton. C'est pratique pour un code reçu dans un e-mail ou affiché sur l'écran même où vous le consultez, qu'aucun appareil photo ne peut scanner.",
    },
    {
      q: "Le QR code est dans un PDF, comment le lire sans l'imprimer ?",
      r: "Ouvrez le PDF, zoomez pour que le code occupe une bonne partie de l'écran, puis faites une capture de la zone : Windows + Maj + S sous Windows, Cmd + Maj + 4 sur Mac. Revenez ici et collez-la avec Ctrl + V ou Cmd + V. Un code affiché trop petit, sous 100 pixels de côté environ, peut ne pas être reconnu : agrandissez avant de capturer.",
    },
    {
      q: "Pourquoi l'outil n'ouvre-t-il pas le lien tout de suite, comme mon téléphone ?",
      r: "Parce que le principal risque d'un QR code est de mener vers un faux site. Cybermalveillance.gouv.fr conseille de toujours vérifier la vraisemblance du lien avant de le suivre et de s'abstenir au moindre doute. L'outil affiche donc d'abord l'adresse complète et son domaine, signale ce qui doit alerter, et ne l'ouvre que si vous cliquez vous-même sur le bouton.",
    },
    {
      q: "Comment savoir si l'adresse contenue dans un QR code est fiable ?",
      r: "Regardez le domaine, la partie juste avant le premier « / » : il doit être celui de l'organisme attendu, par exemple impots.gouv.fr et non impots-gouv.info. Méfiez-vous d'un lien raccourci qui cache sa destination, d'une adresse en http sans chiffrement, et de toute page qui demande ensuite vos coordonnées bancaires. Le ministère de l'Économie conseille aussi de vérifier qu'un QR code n'a pas été collé par-dessus un autre.",
    },
    {
      q: "L'image de ma caméra est-elle envoyée quelque part ?",
      r: "Non. Le navigateur vous demande d'abord l'autorisation d'utiliser la caméra ; ensuite, chaque image est analysée dans la page, par une bibliothèque de lecture de QR code qui tourne sur votre appareil. Rien n'est enregistré ni transmis. Dès qu'un code est lu, ou quand vous cliquez sur Arrêter, la caméra est coupée et son voyant s'éteint.",
    },
    {
      q: "Le QR code n'est pas reconnu, que puis-je essayer ?",
      r: "Recadrez l'image autour du code en gardant une petite marge blanche, évitez les reflets et le flou, et importez la photo d'origine plutôt qu'une miniature. L'outil essaie déjà plusieurs tailles et les couleurs inversées. Il ne lit que les QR codes : un code carré à motif différent (Data Matrix, Aztec) ou un code-barres classique ne sera pas reconnu.",
    },
  ],
  en: [
    {
      q: "I only have a screenshot of the QR code, is that enough to read it?",
      r: "Yes. Take the screenshot, come back to this page and press Ctrl + V (Cmd + V on a Mac): the pasted image is analysed straight away. You can also save the screenshot and upload it with the button. This is handy for a code received by email or shown on the very screen you are reading it on, which no camera can scan.",
    },
    {
      q: "Why doesn't the reader open the link straight away like my phone does?",
      r: "Because the main risk with a QR code is being sent to a fake website. Cybermalveillance.gouv.fr, the French government's cybercrime victim support service, advises checking that a link looks genuine before following it, and not opening it at the slightest doubt. The tool therefore shows the full address and its domain first, flags warning signs, and only opens it when you click.",
    },
    {
      q: "How can I tell whether the address in a French QR code is genuine?",
      r: "Look at the domain, the part just before the first \"/\": it must belong to the expected body, for example impots.gouv.fr and not impots-gouv.info. Be wary of a shortened link that hides its destination, of an http address without encryption, and of any page that then asks for card details. The French economy ministry also advises checking that a sticker has not been placed over the original code.",
    },
    {
      q: "Is my camera feed sent anywhere when I scan?",
      r: "No. The browser first asks for permission to use the camera; then every frame is analysed inside the page by a QR code library running on your device. Nothing is recorded or sent. As soon as a code is read, or when you click Stop camera, the camera is turned off and its indicator light goes out. You can also upload a photo instead of granting camera access.",
    },
    {
      q: "The QR code is not recognised, what can I try?",
      r: "Crop the image around the code while keeping a small white margin, avoid glare and blur, and upload the original photo rather than a thumbnail. The tool already tries several sizes and inverted colours. It only reads QR codes: a square code with a different pattern (Data Matrix, Aztec) or an ordinary barcode will not be recognised by this reader.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Cybermalveillance.gouv.fr", titre: "Le « quishing » : l'hameçonnage par QR code", url: URL_QUISHING, lu: "27 octobre 2026" },
    { editeur: "economie.gouv.fr", titre: "Arnaque au QR code ou quishing : comment la reconnaître et que faire ?", url: "https://www.economie.gouv.fr/particuliers/numerique-et-cybersecurite/arnaque-au-qr-code-ou-quishing-comment-la-reconnaitre-et-que-faire", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2024, QR code bar code symbology specification", url: "https://www.iso.org/standard/83389.html", lu: "27 octobre 2026" },
    { editeur: "MDN Web Docs", titre: "MediaDevices.getUserMedia() (accès à la caméra avec autorisation)", url: "https://developer.mozilla.org/fr/docs/Web/API/MediaDevices/getUserMedia", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Cybermalveillance.gouv.fr", titre: "Le « quishing » : l'hameçonnage par QR code (Quishing: phishing by QR code)", url: URL_QUISHING, lu: "27 October 2026" },
    { editeur: "economie.gouv.fr", titre: "Arnaque au QR code ou quishing : comment la reconnaître et que faire ? (QR code scams: how to spot them and what to do)", url: "https://www.economie.gouv.fr/particuliers/numerique-et-cybersecurite/arnaque-au-qr-code-ou-quishing-comment-la-reconnaitre-et-que-faire", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2024, QR code bar code symbology specification", url: "https://www.iso.org/standard/83389.html", lu: "27 October 2026" },
    { editeur: "MDN Web Docs", titre: "MediaDevices: getUserMedia() method (camera access with permission)", url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Lecteur de QR code en ligne 75tools",
    motsCles: "lire un qr code en ligne, scanner qr code depuis une image, lire qr code capture d'écran, décoder qr code, scanner qr code pc",
    types: {
      lien: "Lien web",
      whatsapp: "Lien WhatsApp",
      wifi: "Réseau wifi",
      vcard: "Fiche contact (vCard)",
      email: "Adresse e-mail",
      telephone: "Numéro de téléphone",
      sms: "SMS",
      geo: "Position géographique",
      otp: "Clé de double authentification",
      texte: "Texte",
    } as Record<TypeContenu["type"], string>,
    copie: "Contenu copié.",
    copieRefusee: "Copie refusée par le navigateur : sélectionnez le texte à la main.",
    http: "Adresse en http, sans chiffrement : ne saisissez aucune donnée personnelle sur cette page.",
    puny: "Le nom de domaine contient des caractères spéciaux (codage xn--) : il peut imiter visuellement un autre site.",
    ip: "L'adresse est une adresse IP, pas un nom de domaine : c'est inhabituel pour un site officiel.",
    arobase: "L'adresse contient un « @ » avant le domaine : la vraie destination est ce qui suit le @.",
    court: "Lien raccourci ou redirigé : la vraie destination est cachée derrière ce service.",
    domaine: "Domaine",
    serveur: "Nom complet du serveur :",
    numero: "Numéro",
    aucunNumero: "aucun (choix du contact)",
    message: "Message",
    reseau: "Réseau",
    securite: "Sécurité",
    aucune: "aucune",
    motDePasse: "Mot de passe",
    masquer: "masquer",
    afficher: "afficher",
    masque: "Réseau masqué",
    oui: "oui",
    otp: "Ce code contient une clé secrète qui sert à générer des codes de connexion. Ne l'ajoutez à une application d'authentification que si vous l'avez demandé vous-même sur le site concerné, et ne la transmettez à personne.",
    contenu: "Contenu complet",
    avant: "Avant d'ouvrir ce lien",
    quishing: "Vérifiez que le domaine est bien celui du site attendu. Un QR code collé sur un parcmètre, une borne de recharge, un faux avis de contravention ou un courrier peut mener vers un faux site : c'est le « quishing », signalé par",
    quishingFin: ". Au moindre doute, n'ouvrez pas le lien et tapez vous-même l'adresse du site officiel.",
    copier: "Copier le contenu",
    ouvrir: "Ouvrir le lien",
    analyse: "Analyse de l'image…",
    nonReconnu: "Aucun QR code reconnu sur cette image. Recadrez autour du code, ou essayez une photo plus nette.",
    illisible: "Cette image ne peut pas être ouverte par le navigateur. Essayez un fichier JPG ou PNG.",
    pasImage: "Le presse-papiers ne contient pas d'image. Faites une capture d'écran du QR code, puis réessayez.",
    collerRefuse: "Le navigateur n'autorise pas ce bouton : appuyez sur Ctrl + V (Cmd + V sur Mac) dans la page.",
    pasCamera: "Ce navigateur ne donne pas accès à la caméra. Importez plutôt une photo du QR code.",
    cadrez: "Cadrez le QR code dans l'image.",
    refus: "Accès à la caméra refusé. Autorisez-le dans les réglages du navigateur, ou importez une photo du QR code.",
    aucuneCamera: "Aucune caméra trouvée sur cet appareil. Importez plutôt une image.",
    echecCamera: "Impossible d'ouvrir la caméra. Importez plutôt une photo du QR code.",
    choisir: "Choisir une image",
    aide: "ou glissez-la ici, ou collez une capture avec Ctrl + V",
    arreter: "Arrêter la caméra",
    camera: "Utiliser la caméra",
    coller: "Coller une image",
    imageCamera: "Image de la caméra",
    imageAnalysee: "Image analysée",
    attente: "Le contenu du QR code s'affichera ici, avec son type et, pour un lien, le domaine à vérifier. Aucun lien ne s'ouvre tout seul.",
  },
  en: {
    nomAppli: "75tools online QR code reader",
    motsCles: "qr code reader online, scan qr code from image, read qr code from screenshot, decode qr code, scan qr code on pc",
    types: {
      lien: "Web link",
      whatsapp: "WhatsApp link",
      wifi: "Wifi network",
      vcard: "Contact card (vCard)",
      email: "Email address",
      telephone: "Phone number",
      sms: "Text message (SMS)",
      geo: "Location",
      otp: "Two-factor authentication key",
      texte: "Text",
    } as Record<TypeContenu["type"], string>,
    copie: "Content copied.",
    copieRefusee: "The browser blocked copying: select the text by hand.",
    http: "Plain http address, without encryption: do not enter any personal data on that page.",
    puny: "The domain name contains special characters (xn-- encoding): it may visually imitate another site.",
    ip: "The address is an IP address, not a domain name: unusual for an official website.",
    arobase: "The address contains an \"@\" before the domain: the real destination is what follows the @.",
    court: "Shortened or redirected link: the real destination is hidden behind this service.",
    domaine: "Domain",
    serveur: "Full server name:",
    numero: "Number",
    aucunNumero: "none (you pick the contact)",
    message: "Message",
    reseau: "Network",
    securite: "Security",
    aucune: "none",
    motDePasse: "Password",
    masquer: "hide",
    afficher: "show",
    masque: "Hidden network",
    oui: "yes",
    otp: "This code holds a secret key used to generate sign-in codes. Only add it to an authenticator app if you requested it yourself on the website concerned, and never pass it on to anyone.",
    contenu: "Full content",
    avant: "Before opening this link",
    quishing: "Check that the domain is the one you expect. A QR code stuck on a parking meter or an EV charging point, a fake parking fine or a letter can lead to a fake site: this is \"quishing\", flagged by",
    quishingFin: ". At the slightest doubt, do not open the link and type the official address yourself.",
    copier: "Copy content",
    ouvrir: "Open link",
    analyse: "Analysing the image…",
    nonReconnu: "No QR code found in this image. Crop around the code, or try a sharper photo.",
    illisible: "The browser cannot open this image. Try a JPG or PNG file.",
    pasImage: "The clipboard holds no image. Take a screenshot of the QR code, then try again.",
    collerRefuse: "The browser does not allow this button: press Ctrl + V (Cmd + V on a Mac) on the page.",
    pasCamera: "This browser gives no access to the camera. Upload a photo of the QR code instead.",
    cadrez: "Frame the QR code in the picture.",
    refus: "Camera access denied. Allow it in your browser settings, or upload a photo of the QR code.",
    aucuneCamera: "No camera found on this device. Upload an image instead.",
    echecCamera: "Could not open the camera. Upload a photo of the QR code instead.",
    choisir: "Choose an image",
    aide: "or drop it here, or paste a screenshot with Ctrl + V",
    arreter: "Stop camera",
    camera: "Use camera",
    coller: "Paste an image",
    imageCamera: "Camera feed",
    imageAnalysee: "Analysed image",
    attente: "The QR code content will show here, with its type and, for a link, the domain to check. No link ever opens on its own.",
  },
};

const RACCOURCISSEURS = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|tiny\.cc|rb\.gy|qrco\.de|qr\.page|l\.ead\.me|s\.id)$/i;

/** Essaie de lire un QR code sur une image à plusieurs échelles, avec une marge blanche ajoutée. */
function decoderImage(source: CanvasImageSource, largeur: number, hauteur: number): string | null {
  const max = Math.max(largeur, hauteur);
  const cibles = Array.from(new Set([Math.min(max, 1600), 1000, 700, 400].filter((c) => c <= Math.max(max, 400))));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  for (const cible of cibles) {
    const f = cible / max;
    const w = Math.max(1, Math.round(largeur * f));
    const h = Math.max(1, Math.round(hauteur * f));
    const marge = Math.round(Math.max(w, h) * 0.08);
    canvas.width = w + 2 * marge;
    canvas.height = h + 2 * marge;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, marge, marge, w, h);
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const r = jsQR(d.data, d.width, d.height, { inversionAttempts: "attemptBoth" });
    if (r && r.data) return r.data;
  }
  return null;
}

const Resultat = ({ texte }: { texte: string }) => {
  const t = T[useLangue()];
  const c = reconnaitre(texte);
  const [voirMdp, setVoirMdp] = useState(false);
  const [copie, setCopie] = useState("");
  const copier = async () => setCopie((await copierTexte(texte)) ? t.copie : t.copieRefusee);

  const alertesLien: string[] = [];
  if (c.type === "lien" || c.type === "whatsapp") {
    const u = c.url;
    if (u.protocol === "http:") alertesLien.push(t.http);
    if (/(^|\.)xn--/.test(u.hostname)) alertesLien.push(t.puny);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname) || u.hostname.startsWith("[")) alertesLien.push(t.ip);
    if (u.username || u.password) alertesLien.push(t.arobase);
    if (RACCOURCISSEURS.test(u.hostname)) alertesLien.push(t.court);
  }
  const estLien = c.type === "lien" || c.type === "whatsapp";

  return (
    <div id="resultat-qr" data-type={c.type} className="rounded-lg border border-neutral-700 p-4 sm:p-5 space-y-4 min-w-0">
      <p className="text-xs uppercase tracking-wider text-sky-300">{t.types[c.type]}</p>

      {estLien && (
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">{t.domaine}</p>
          <p id="domaine-qr" className="text-2xl font-semibold text-white [overflow-wrap:anywhere]">
            {domainePrincipal(c.url.hostname)}
          </p>
          {c.url.hostname !== domainePrincipal(c.url.hostname) && (
            <p className="text-sm text-neutral-400 [overflow-wrap:anywhere]">{t.serveur} {c.url.hostname}</p>
          )}
        </div>
      )}

      {c.type === "whatsapp" && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="text-neutral-400">{t.numero}</dt>
          <dd className="text-neutral-100">{c.numero ? `+${c.numero}` : t.aucunNumero}</dd>
          {c.message && (
            <>
              <dt className="text-neutral-400">{t.message}</dt>
              <dd className="text-neutral-100 [overflow-wrap:anywhere] whitespace-pre-wrap">{c.message}</dd>
            </>
          )}
        </dl>
      )}

      {c.type === "wifi" && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="text-neutral-400">{t.reseau}</dt>
          <dd id="wifi-ssid" className="text-neutral-100 [overflow-wrap:anywhere]">{c.ssid}</dd>
          <dt className="text-neutral-400">{t.securite}</dt>
          <dd className="text-neutral-100">{c.securite === "nopass" ? t.aucune : c.securite}</dd>
          {c.motDePasse && (
            <>
              <dt className="text-neutral-400">{t.motDePasse}</dt>
              <dd className="text-neutral-100 [overflow-wrap:anywhere]">
                <span id="wifi-mdp" className="font-mono">{voirMdp ? c.motDePasse : "•".repeat(Math.min(c.motDePasse.length, 16))}</span>{" "}
                <button type="button" onClick={() => setVoirMdp((v) => !v)} className="text-sky-300 underline underline-offset-4">
                  {voirMdp ? t.masquer : t.afficher}
                </button>
              </dd>
            </>
          )}
          {c.masque && (
            <>
              <dt className="text-neutral-400">{t.masque}</dt>
              <dd className="text-neutral-100">{t.oui}</dd>
            </>
          )}
        </dl>
      )}

      {c.type === "vcard" && c.nom && <p className="text-lg text-white">{c.nom}</p>}
      {c.type === "email" && <p className="text-lg text-white [overflow-wrap:anywhere]">{c.adresse}</p>}
      {(c.type === "telephone" || c.type === "sms") && <p className="text-lg text-white">{c.numero}</p>}
      {c.type === "geo" && <p className="text-lg text-white">{c.coordonnees}</p>}
      {c.type === "otp" && (
        <p role="status" className="text-sm text-amber-300">
          {t.otp}
        </p>
      )}

      <div className="space-y-1">
        <p className="text-sm text-neutral-400">{t.contenu}</p>
        <pre id="contenu-qr" className="whitespace-pre-wrap [overflow-wrap:anywhere] bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-200 text-sm max-h-72 overflow-y-auto">
          {c.type === "wifi" && !voirMdp && c.motDePasse ? texte.replace(c.motDePasse.replace(/([\\;,":])/g, "\\$1"), "••••••••") : texte}
        </pre>
      </div>

      {alertesLien.map((a) => (
        <p key={a} role="status" className="text-sm text-amber-300">
          {a}
        </p>
      ))}

      {estLien && (
        <div id="alerte-quishing" className="rounded-md border border-amber-300/40 bg-amber-300/5 p-3 text-sm text-neutral-300 space-y-1">
          <p className="text-amber-200 font-medium">{t.avant}</p>
          <p>
            {t.quishing}{" "}
            <a href={URL_QUISHING} target="_blank" rel="noopener nofollow" className="text-sky-300 underline underline-offset-4">
              Cybermalveillance.gouv.fr
            </a>
            {t.quishingFin}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Bouton onClick={copier}>{t.copier}</Bouton>
        {estLien && (
          <a
            href={c.url.toString()}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center h-11 px-4 rounded-md text-sm font-medium border border-neutral-700 text-neutral-200 hover:border-neutral-500"
          >
            {t.ouvrir}
          </a>
        )}
      </div>
      {copie && (
        <p role="status" id="message-copie" className="text-sm text-sky-300">
          {copie}
        </p>
      )}
    </div>
  );
};

const LireQrCode = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [resultat, setResultat] = useState("");
  const [message, setMessage] = useState("");
  const [apercu, setApercu] = useState("");
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const boucle = useRef<number>(0);

  const arreterCamera = useCallback(() => {
    cancelAnimationFrame(boucle.current);
    flux.current?.getTracks().forEach((tr) => tr.stop());
    flux.current = null;
    if (video.current) video.current.srcObject = null;
    setCamera(false);
  }, []);

  useEffect(() => arreterCamera, [arreterCamera]);
  useEffect(() => {
    const cache = () => document.hidden && flux.current && arreterCamera();
    document.addEventListener("visibilitychange", cache);
    return () => document.removeEventListener("visibilitychange", cache);
  }, [arreterCamera]);

  const lireFichier = useCallback(
    async (f: Blob) => {
      arreterCamera();
      setResultat("");
      setMessage(t.analyse);
      setApercu((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(f);
      });
      try {
        const img = await chargerImage(f);
        const r = decoderImage(img, img.naturalWidth, img.naturalHeight);
        if (r) {
          setResultat(r);
          setMessage("");
        } else {
          setMessage(t.nonReconnu);
        }
      } catch {
        setMessage(t.illisible);
      }
    },
    [arreterCamera, t]
  );

  // Ctrl+V / Cmd+V : image du presse-papiers
  useEffect(() => {
    const coller = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const f = item?.getAsFile();
      if (f) {
        e.preventDefault();
        lireFichier(f);
      }
    };
    window.addEventListener("paste", coller);
    return () => window.removeEventListener("paste", coller);
  }, [lireFichier]);

  const collerBouton = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const it of items) {
        const type = it.types.find((ty) => ty.startsWith("image/"));
        if (type) {
          lireFichier(await it.getType(type));
          return;
        }
      }
      setMessage(t.pasImage);
    } catch {
      setMessage(t.collerRefuse);
    }
  };

  const demarrerCamera = async () => {
    setResultat("");
    setApercu("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage(t.pasCamera);
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      flux.current = s;
      setCamera(true);
      setMessage(t.cadrez);
      const v = video.current!;
      v.srcObject = s;
      await v.play();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      let n = 0;
      const image = () => {
        if (!flux.current) return;
        if (v.readyState >= 2 && v.videoWidth) {
          const f = Math.min(1, 800 / Math.max(v.videoWidth, v.videoHeight));
          canvas.width = Math.round(v.videoWidth * f);
          canvas.height = Math.round(v.videoHeight * f);
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const r = jsQR(d.data, d.width, d.height, { inversionAttempts: n++ % 4 === 3 ? "onlyInvert" : "dontInvert" });
          if (r && r.data) {
            setResultat(r.data);
            setMessage("");
            arreterCamera();
            return;
          }
        }
        boucle.current = requestAnimationFrame(image);
      };
      boucle.current = requestAnimationFrame(image);
    } catch (e) {
      arreterCamera();
      const nom = (e as Error)?.name;
      setMessage(nom === "NotAllowedError" ? t.refus : nom === "NotFoundError" ? t.aucuneCamera : t.echecCamera);
    }
  };

  const outil = (
    <div className="grid gap-5 lg:gap-6 lg:grid-cols-2 items-start">
      <div className="space-y-4 min-w-0">
        <DepotFichiers accept="image/*" onFichiers={(f) => lireFichier(f[0])} libelle={t.choisir} aide={t.aide} />
        <div className="flex flex-wrap gap-2">
          {camera ? <Bouton onClick={arreterCamera}>{t.arreter}</Bouton> : <Bouton onClick={demarrerCamera}>{t.camera}</Bouton>}
          <Bouton secondaire onClick={collerBouton}>
            {t.coller}
          </Bouton>
        </div>
        <video
          ref={video}
          playsInline
          muted
          className={camera ? "w-full max-h-[60vh] rounded-lg bg-black object-cover" : "hidden"}
          aria-label={t.imageCamera}
        />
        {apercu && !camera && (
          <img src={apercu} alt={t.imageAnalysee} className="max-h-56 max-w-full rounded-md border border-neutral-800 object-contain" />
        )}
      </div>

      <div data-resultat className="min-w-0 space-y-3" aria-live="polite">
        {message && (
          <p id="message-lecture" role="status" className="text-sm text-neutral-300">
            {message}
          </p>
        )}
        {resultat ? (
          <Resultat key={resultat} texte={resultat} />
        ) : (
          !message && <div className="rounded-lg border border-dashed border-neutral-700 p-6 text-sm text-neutral-400">{t.attente}</div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="lire-qr-code"
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
    <Section titre="Lire un QR code en ligne, sans téléphone">
      <p>
        Pour lire un QR code en ligne, importez une image qui le contient, collez une capture d'écran avec Ctrl + V
        (Cmd + V sur Mac) ou ouvrez la caméra de l'appareil : le contenu décodé s'affiche à droite en moins d'une
        seconde, avec son type (lien, réseau wifi, fiche contact, texte). Pour un lien, l'outil met en avant le
        domaine, par exemple service-public.fr, et signale une adresse sans chiffrement, un lien raccourci ou un domaine
        aux caractères trompeurs. C'est utile pour un code reçu par e-mail ou dans un PDF, qu'aucun appareil photo ne
        peut scanner sur l'écran même où il s'affiche. Rien n'est envoyé : l'image est analysée par votre navigateur.
        La limite : seuls les QR codes sont lus, pas les codes Data Matrix, Aztec ni les codes-barres classiques.
      </p>
    </Section>

    <Section titre="Comment fonctionne la lecture">
      <p>
        Trois façons de donner le code à l'outil : importer un fichier (photo, capture, image enregistrée), coller une
        capture d'écran, ou utiliser la caméra de l'ordinateur ou du téléphone. L'image est réduite à plusieurs tailles
        et entourée d'une marge blanche, ce qui aide pour les captures recadrées trop près du code ; les codes aux
        couleurs inversées (clairs sur fond foncé) sont aussi essayés. Avec la caméra, le navigateur vous demande
        l'autorisation, puis chaque image est analysée sur place jusqu'à ce qu'un code soit trouvé : la caméra s'arrête
        alors d'elle-même.
      </p>
      <p>
        Le contenu est ensuite reconnu : lien web, réseau wifi (nom, sécurité, mot de passe masqué par défaut), fiche
        contact, lien WhatsApp avec son numéro et son message, adresse e-mail, numéro de téléphone, clé de double
        authentification ou simple texte. Vous pouvez le copier d'un clic. Le format lui-même est décrit par la norme
        ISO/IEC 18004, dont la dernière édition date de 2024.
      </p>
    </Section>

    <Section titre="Le « quishing » : vérifier avant d'ouvrir">
      <p>
        Cybermalveillance.gouv.fr appelle « quishing » l'hameçonnage par QR code. Le dispositif public cite des faux
        avis de contravention laissés sur les pare-brise, de faux avis de passage de La Poste, de faux QR codes collés
        sur des parcmètres ou des bornes de recharge de véhicules électriques. La menace reste marginale selon lui,
        mais réelle, parce qu'un lien caché dans un QR code ne se lit pas à l'œil nu : il peut mener vers un site
        frauduleux ou faire télécharger un virus. Son conseil : vérifier la vraisemblance du lien avant de le suivre,
        et s'abstenir au moindre doute.
      </p>
      <p>
        Le ministère de l'Économie ajoute deux réflexes : regarder si le QR code n'a pas été collé par-dessus un autre,
        et, après le scan, vérifier que l'adresse affichée correspond bien au site attendu. C'est pour cela que cet
        outil n'ouvre jamais un lien de lui-même. Il met en avant le <strong>domaine</strong>, signale ce qui doit
        alerter et vous laisse décider. Si vous avez communiqué des informations bancaires après un scan, la page du
        ministère oriente vers 17Cyber pour un diagnostic et rappelle les moyens de porter plainte.
      </p>
    </Section>

    <Section titre="Et pour créer un QR code">
      <p>
        Les QR codes de 75tools sont tous statiques : ils contiennent directement l'adresse ou le texte, sans
        redirection par un serveur. Le <Link to="/generateur-qr-code/">générateur de QR code</Link> traite les liens
        et les textes ; des pages dédiées préparent un <Link to="/qr-code-wifi/">QR code wifi</Link> ou un{" "}
        <Link to="/qr-code-whatsapp/">lien WhatsApp</Link>. Vous pouvez relire ici chacun de ces codes pour vérifier
        ce qu'il contient avant de l'imprimer.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Read a QR code online, without a phone">
      <p>
        To read a QR code online, upload an image that contains it, paste a screenshot with Ctrl + V (Cmd + V on a Mac)
        or open your device's camera: the decoded content appears on the right in under a second, with its type (link,
        wifi network, contact card, text). For a link, the tool highlights the domain, for example service-public.fr,
        and flags an address without encryption, a shortened link or a domain with misleading characters. It is useful
        for a code received by email or inside a PDF, which no camera can scan on the very screen that shows it.
        Nothing is uploaded: your browser analyses the image. The limit: it only reads QR codes, not Data Matrix, Aztec
        codes or ordinary barcodes.
      </p>
    </Section>

    <Section titre="How the reader works">
      <p>
        You can give the tool a code in three ways: upload a file (photo, screenshot, saved image), paste a screenshot,
        or use the camera of your computer or phone. The image is scaled to several sizes and given a white margin,
        which helps with screenshots cropped too tightly; light-on-dark codes are tried too. With the camera, the
        browser asks for permission, then each frame is analysed on your device until a code is found, and the camera
        switches itself off.
      </p>
      <p>
        The content is then identified: web link, wifi network (name, security, password hidden by default), contact
        card, WhatsApp link with its number and message, email address, phone number, two-factor authentication key or
        plain text. You can copy it in one click. The format itself is defined by the ISO/IEC 18004 standard, last
        revised in 2024.
      </p>
    </Section>

    <Section titre="Quishing in France: check before you open">
      <p>
        Cybermalveillance.gouv.fr, the French government's cybercrime victim support service, calls phishing by QR
        code "quishing". It lists fake parking fines left on windscreens, fake La Poste delivery notices in letterboxes,
        and fake QR codes stuck on parking meters or electric vehicle charging points. It describes the threat as still
        marginal but real, because a link hidden in a QR code cannot be read with the naked eye: it can lead to a
        fraudulent site or download malware. Its advice: check that the link looks genuine before following it, and do
        not open it at the slightest doubt.
      </p>
      <p>
        The French economy ministry adds two habits: check that the code has not been stuck over another one, and after
        scanning, make sure the address matches the site you expect. If you are new to France, remember that official
        sites end in .gouv.fr, and that a real parking fine is paid by typing amendes.gouv.fr yourself rather than
        through a code on a flyer. That is why this tool never opens a link by itself. If you gave card details after a
        scan, the ministry's page points to 17Cyber for help and explains how to file a complaint.
      </p>
    </Section>

    <Section titre="Making your own QR code">
      <p>
        All 75tools QR codes are static: they contain the address or text itself, with no redirect through a server.
        The <Link to="/en/qr-code-generator/">QR code generator</Link> handles links and text, and the{" "}
        <Link to="/en/wifi-qr-code/">wifi QR code</Link> page shares your network without spelling out the password.
        You can read any of these codes here to check what it contains before printing it.
      </p>
    </Section>
  </>
);

export default LireQrCode;
