import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import jsQR from "jsqr";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { chargerImage } from "@/lib/fichiers";
import { reconnaitre, domainePrincipal, TypeContenu } from "@/lib/qr-formats";

const HREF = "/lire-qr-code/";
const TITRE = "Lire un QR code en ligne : depuis une image ou la caméra";
const DESCRIPTION =
  "Lire un QR code en ligne : importez une image, collez une capture d'écran ou utilisez la caméra. Le lien ne s'ouvre jamais tout seul et rien n'est envoyé.";

const FAQ: QuestionFaq[] = [
  {
    q: "Je n'ai qu'une capture d'écran du QR code, ça suffit pour le lire ?",
    r: "Oui. Faites la capture, puis revenez sur cette page et appuyez sur Ctrl + V (Cmd + V sur Mac) : l'image collée est analysée aussitôt. Vous pouvez aussi enregistrer la capture et l'importer avec le bouton. C'est pratique pour un code reçu dans un e-mail ou affiché sur l'écran même où vous le consultez, qu'aucun appareil photo ne peut scanner.",
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
];

const SOURCES = [
  {
    editeur: "Cybermalveillance.gouv.fr",
    titre: "Le « quishing » : l'hameçonnage par QR code",
    url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/quishing-hameconnage-qr-code",
    lu: "27 octobre 2026",
  },
  {
    editeur: "economie.gouv.fr",
    titre: "Arnaque au QR code ou quishing : comment la reconnaître et que faire ?",
    url: "https://www.economie.gouv.fr/particuliers/numerique-et-cybersecurite/arnaque-au-qr-code-ou-quishing-comment-la-reconnaitre-et-que-faire",
    lu: "27 octobre 2026",
  },
  {
    editeur: "MDN Web Docs",
    titre: "MediaDevices.getUserMedia() (accès à la caméra avec autorisation)",
    url: "https://developer.mozilla.org/fr/docs/Web/API/MediaDevices/getUserMedia",
    lu: "27 octobre 2026",
  },
];

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

const LIBELLES: Record<TypeContenu["type"], string> = {
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
};

const Resultat = ({ texte }: { texte: string }) => {
  const t = reconnaitre(texte);
  const [voirMdp, setVoirMdp] = useState(false);
  const [copie, setCopie] = useState("");
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie("Contenu copié.");
    } catch {
      setCopie("Copie refusée par le navigateur : sélectionnez le texte à la main.");
    }
  };

  const alertesLien: string[] = [];
  if (t.type === "lien" || t.type === "whatsapp") {
    const u = t.url;
    if (u.protocol === "http:") alertesLien.push("Adresse en http, sans chiffrement : ne saisissez aucune donnée personnelle sur cette page.");
    if (/(^|\.)xn--/.test(u.hostname)) alertesLien.push("Le nom de domaine contient des caractères spéciaux (codage xn--) : il peut imiter visuellement un autre site.");
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname) || u.hostname.startsWith("[")) alertesLien.push("L'adresse est une adresse IP, pas un nom de domaine : c'est inhabituel pour un site officiel.");
    if (u.username || u.password) alertesLien.push("L'adresse contient un « @ » avant le domaine : la vraie destination est ce qui suit le @.");
    if (RACCOURCISSEURS.test(u.hostname)) alertesLien.push("Lien raccourci ou redirigé : la vraie destination est cachée derrière ce service.");
  }

  return (
    <div id="resultat-qr" data-type={t.type} className="rounded-lg border border-neutral-700 p-4 sm:p-5 space-y-4 min-w-0">
      <p className="text-xs uppercase tracking-wider text-sky-300">{LIBELLES[t.type]}</p>

      {(t.type === "lien" || t.type === "whatsapp") && (
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">Domaine</p>
          <p id="domaine-qr" className="text-2xl font-semibold text-white [overflow-wrap:anywhere]">
            {domainePrincipal(t.url.hostname)}
          </p>
          {t.url.hostname !== domainePrincipal(t.url.hostname) && (
            <p className="text-sm text-neutral-400 [overflow-wrap:anywhere]">Nom complet du serveur : {t.url.hostname}</p>
          )}
        </div>
      )}

      {t.type === "whatsapp" && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="text-neutral-400">Numéro</dt>
          <dd className="text-neutral-100">{t.numero ? `+${t.numero}` : "aucun (choix du contact)"}</dd>
          {t.message && (
            <>
              <dt className="text-neutral-400">Message</dt>
              <dd className="text-neutral-100 [overflow-wrap:anywhere] whitespace-pre-wrap">{t.message}</dd>
            </>
          )}
        </dl>
      )}

      {t.type === "wifi" && (
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
          <dt className="text-neutral-400">Réseau</dt>
          <dd id="wifi-ssid" className="text-neutral-100 [overflow-wrap:anywhere]">{t.ssid}</dd>
          <dt className="text-neutral-400">Sécurité</dt>
          <dd className="text-neutral-100">{t.securite === "nopass" ? "aucune" : t.securite}</dd>
          {t.motDePasse && (
            <>
              <dt className="text-neutral-400">Mot de passe</dt>
              <dd className="text-neutral-100 [overflow-wrap:anywhere]">
                <span id="wifi-mdp" className="font-mono">{voirMdp ? t.motDePasse : "•".repeat(Math.min(t.motDePasse.length, 16))}</span>{" "}
                <button type="button" onClick={() => setVoirMdp((v) => !v)} className="text-sky-300 underline underline-offset-4">
                  {voirMdp ? "masquer" : "afficher"}
                </button>
              </dd>
            </>
          )}
          {t.masque && (
            <>
              <dt className="text-neutral-400">Réseau masqué</dt>
              <dd className="text-neutral-100">oui</dd>
            </>
          )}
        </dl>
      )}

      {t.type === "vcard" && t.nom && <p className="text-lg text-white">{t.nom}</p>}
      {t.type === "email" && <p className="text-lg text-white [overflow-wrap:anywhere]">{t.adresse}</p>}
      {(t.type === "telephone" || t.type === "sms") && <p className="text-lg text-white">{t.numero}</p>}
      {t.type === "geo" && <p className="text-lg text-white">{t.coordonnees}</p>}
      {t.type === "otp" && (
        <p role="status" className="text-sm text-amber-300">
          Ce code contient une clé secrète qui sert à générer des codes de connexion. Ne l'ajoutez à une application
          d'authentification que si vous l'avez demandé vous-même sur le site concerné, et ne la transmettez à
          personne.
        </p>
      )}

      <div className="space-y-1">
        <p className="text-sm text-neutral-400">Contenu complet</p>
        <pre id="contenu-qr" className="whitespace-pre-wrap [overflow-wrap:anywhere] bg-neutral-900 border border-neutral-800 rounded-md p-3 text-neutral-200 text-sm max-h-72 overflow-y-auto">
          {t.type === "wifi" && !voirMdp && t.motDePasse ? texte.replace(t.motDePasse.replace(/([\\;,":])/g, "\\$1"), "••••••••") : texte}
        </pre>
      </div>

      {alertesLien.map((a) => (
        <p key={a} role="status" className="text-sm text-amber-300">
          {a}
        </p>
      ))}

      {(t.type === "lien" || t.type === "whatsapp") && (
        <div className="rounded-md border border-amber-300/40 bg-amber-300/5 p-3 text-sm text-neutral-300 space-y-1">
          <p className="text-amber-200 font-medium">Avant d'ouvrir ce lien</p>
          <p>
            Vérifiez que le domaine est bien celui du site attendu. Un QR code collé sur un parcmètre, une borne de
            recharge, un faux avis de contravention ou un courrier peut mener vers un faux site (« quishing »). Au
            moindre doute, n'ouvrez pas le lien et tapez vous-même l'adresse du site officiel.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Bouton onClick={copier}>Copier le contenu</Bouton>
        {(t.type === "lien" || t.type === "whatsapp") && (
          <a
            href={t.url.toString()}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center h-11 px-4 rounded-md text-sm font-medium border border-neutral-700 text-neutral-200 hover:border-neutral-500"
          >
            Ouvrir le lien
          </a>
        )}
      </div>
      {copie && (
        <p role="status" className="text-sm text-sky-300">
          {copie}
        </p>
      )}
    </div>
  );
};

const LireQrCode = () => {
  const [resultat, setResultat] = useState("");
  const [message, setMessage] = useState("");
  const [apercu, setApercu] = useState("");
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const boucle = useRef<number>(0);

  const arreterCamera = useCallback(() => {
    cancelAnimationFrame(boucle.current);
    flux.current?.getTracks().forEach((t) => t.stop());
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

  const lireFichier = useCallback(async (f: Blob) => {
    arreterCamera();
    setResultat("");
    setMessage("Analyse de l'image…");
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
        setMessage("Aucun QR code reconnu sur cette image. Recadrez autour du code, ou essayez une photo plus nette.");
      }
    } catch {
      setMessage("Cette image ne peut pas être ouverte par le navigateur. Essayez un fichier JPG ou PNG.");
    }
  }, [arreterCamera]);

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
        const type = it.types.find((t) => t.startsWith("image/"));
        if (type) {
          lireFichier(await it.getType(type));
          return;
        }
      }
      setMessage("Le presse-papiers ne contient pas d'image. Faites une capture d'écran du QR code, puis réessayez.");
    } catch {
      setMessage("Le navigateur n'autorise pas ce bouton : appuyez sur Ctrl + V (Cmd + V sur Mac) dans la page.");
    }
  };

  const demarrerCamera = async () => {
    setResultat("");
    setApercu("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Ce navigateur ne donne pas accès à la caméra. Importez plutôt une photo du QR code.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      flux.current = s;
      setCamera(true);
      setMessage("Cadrez le QR code dans l'image.");
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
      setMessage(
        nom === "NotAllowedError"
          ? "Accès à la caméra refusé. Autorisez-le dans les réglages du navigateur, ou importez une photo du QR code."
          : nom === "NotFoundError"
            ? "Aucune caméra trouvée sur cet appareil. Importez plutôt une image."
            : "Impossible d'ouvrir la caméra. Importez plutôt une photo du QR code."
      );
    }
  };

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="lire un qr code en ligne, scanner qr code depuis une image, lire qr code capture d'écran, décoder qr code, scanner qr code pc"
      nomAppli="Lecteur de QR code en ligne"
      h1="Scanner un QR code depuis une image ou la caméra"
      chapeau="Importez une photo, collez une capture d'écran ou utilisez la caméra de l'appareil : le contenu du QR code s'affiche, avec son type et, pour un lien, le domaine à vérifier. Aucun lien ne s'ouvre tout seul, et rien n'est envoyé."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-4 min-w-0">
          <DepotFichiers
            accept="image/*"
            onFichiers={(f) => lireFichier(f[0])}
            libelle="Choisir une image"
            aide="ou glissez-la ici, ou collez une capture avec Ctrl + V"
          />
          <div className="flex flex-wrap gap-2">
            {camera ? (
              <Bouton onClick={arreterCamera}>Arrêter la caméra</Bouton>
            ) : (
              <Bouton onClick={demarrerCamera}>Utiliser la caméra</Bouton>
            )}
            <Bouton secondaire onClick={collerBouton}>
              Coller une image
            </Bouton>
          </div>
          <video
            ref={video}
            playsInline
            muted
            className={camera ? "w-full max-h-[60vh] rounded-lg bg-black object-cover" : "hidden"}
            aria-label="Image de la caméra"
          />
          {apercu && !camera && (
            <img src={apercu} alt="Image analysée" className="max-h-56 max-w-full rounded-md border border-neutral-800 object-contain" />
          )}
        </div>

        <div className="min-w-0 space-y-3" aria-live="polite">
          {message && (
            <p id="message-lecture" role="status" className="text-sm text-neutral-300">
              {message}
            </p>
          )}
          {resultat ? (
            <Resultat key={resultat} texte={resultat} />
          ) : (
            !message && (
              <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-sm text-neutral-500">
                Le contenu du QR code s'affichera ici.
              </div>
            )
          )}
        </div>
      </div>

      <Section titre="Lire un QR code sans le scanner avec un téléphone">
        <p>
          Un QR code reçu par e-mail, affiché dans un PDF ou sur l'écran de votre ordinateur ne se scanne pas facilement
          : il faudrait un second appareil. Cette page le lit directement à partir d'une image. Trois façons de faire :
          importer un fichier (photo, capture, image enregistrée), coller une capture d'écran avec Ctrl + V ou Cmd + V,
          ou utiliser la caméra de l'ordinateur ou du téléphone.
        </p>
        <p>
          La lecture se fait dans votre navigateur. L'image est réduite à plusieurs tailles et entourée d'une marge
          blanche, ce qui aide pour les captures recadrées trop près du code ; les codes aux couleurs inversées (clairs
          sur fond foncé) sont aussi essayés. Avec la caméra, le navigateur vous demande l'autorisation, puis chaque
          image est analysée sur place jusqu'à ce qu'un code soit trouvé : la caméra s'arrête alors d'elle-même.
        </p>
        <p>
          Le contenu est ensuite reconnu : lien web, réseau wifi (nom, sécurité, mot de passe masqué par défaut), fiche
          contact, lien WhatsApp avec son numéro et son message, adresse e-mail, numéro de téléphone ou simple texte.
          Vous pouvez le copier d'un clic.
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
          outil n'ouvre jamais un lien de lui-même. Il met en avant le <strong>domaine</strong> (par exemple
          service-public.fr), signale une adresse sans chiffrement, un lien raccourci qui cache sa destination ou un
          domaine aux caractères trompeurs, et vous laisse décider.
        </p>
        <p>
          Si vous avez communiqué des informations bancaires après un scan, la page du ministère oriente vers 17Cyber
          pour un diagnostic et rappelle les moyens de porter plainte.
        </p>
      </Section>

      <Section titre="Et pour créer un QR code">
        <p>
          Les QR codes de 75tools sont tous statiques : ils contiennent directement l'adresse ou le texte, sans
          redirection par un serveur. Le <Link to="/generateur-qr-code/">générateur de QR code</Link> traite les liens
          et les textes ; des pages dédiées préparent un{" "}
          <Link to="/qr-code-wifi/">QR code wifi</Link>, un <Link to="/qr-code-whatsapp/">lien WhatsApp</Link> ou un{" "}
          <Link to="/qr-code-avis-google/">QR code d'avis Google</Link>. Vous pouvez relire ici chacun de ces codes
          pour vérifier ce qu'il contient avant de l'imprimer.
        </p>
      </Section>
    </PageOutil>
  );
};

export default LireQrCode;
