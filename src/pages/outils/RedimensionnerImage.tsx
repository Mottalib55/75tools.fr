import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { formatOctets, nomSansExtension } from "@/lib/fichiers";
import {
  EXTENSION,
  FormatSortie,
  decoderImage,
  encoder,
  libererCanvas,
  lireNombre,
  redimensionner,
  viserPoids,
} from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

type Mode = "dimensions" | "pourcentage" | "poids";
type ChoixFormat = "identique" | FormatSortie;

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le formulaire de ma démarche refuse ma photo car elle dépasse 1 Mo, comment faire ?",
      r: "Choisissez le mode « Poids max. (Ko) », indiquez par exemple 900 Ko pour garder une marge, et déposez la photo. L'outil cherche la meilleure qualité JPEG qui tient sous ce poids, puis réduit les dimensions si cela ne suffit pas. Le poids obtenu s'affiche avant le téléchargement. Une photo de téléphone de plusieurs mégaoctets passe ainsi sous 1 Mo en restant très lisible pour un justificatif.",
    },
    {
      q: "Je veux réduire la taille d'une photo sans qu'elle soit floue, c'est possible ?",
      r: "Oui, tant que la nouvelle taille correspond à l'usage. Une photo réduite à 1 600 pixels de large reste nette sur un écran d'ordinateur et pèse beaucoup moins. Le flou apparaît quand on agrandit ensuite une image trop petite, ou quand la qualité JPEG descend très bas. Préférez réduire les dimensions plutôt que de descendre la qualité sous 70 %.",
    },
    {
      q: "Pourquoi ma photo est-elle déformée après redimensionnement ailleurs, et pas ici ?",
      r: "Une image se déforme quand on impose à la fois une largeur et une hauteur qui ne respectent pas son rapport d'origine. Ici, les proportions sont toujours gardées : si vous indiquez les deux, l'image est réduite pour tenir dans ce cadre, sans étirement ni recadrage. Pour obtenir un format imposé, comme un carré, il faut recadrer l'image avant de la réduire.",
    },
    {
      q: "Quelle taille en pixels pour une image de site web ou un envoi par e-mail ?",
      r: "Pour une image en pleine largeur d'un site, 1 600 à 2 000 pixels de large suffisent, entre 150 et 400 Ko en JPEG. Pour une illustration dans un article, 1 000 à 1 200 pixels. Pour un e-mail, 1 280 à 1 600 pixels de large permettent de voir la photo confortablement sans saturer la boîte du destinataire. Une photo de téléphone en fait souvent 4 000.",
    },
    {
      q: "Le mode poids maximal marche-t-il avec un PNG ?",
      r: "Non : le PNG compresse sans perte, son poids dépend du contenu et ne se règle pas avec un curseur de qualité. Le mode poids maximal produit donc un JPEG, ou un WebP si vous le choisissez. Si votre image a de la transparence, elle reçoit la couleur de fond choisie. Pour garder un PNG plus léger, réduisez plutôt ses dimensions en pixels.",
    },
    {
      q: "Combien de pixels faut-il pour imprimer une photo en 10 × 15 cm ?",
      r: "Visez 300 points par pouce, la résolution habituelle des tirages photo : un 10 × 15 cm demande alors 1 181 × 1 772 pixels, puisqu'un pouce vaut 2,54 cm. À 200 points par pouce, 787 × 1 181 pixels donnent encore un tirage correct vu à distance de lecture. Une photo de téléphone dépasse largement ces valeurs : réduisez-la sans crainte, mais pas en dessous si vous comptez l'imprimer.",
    },
  ],
  en: [
    {
      q: "A French government portal rejects my photo for being over 1 MB, what should I do?",
      r: "Pick the Max size (KB) mode, enter about 900 KB to keep a margin, then drop the photo. The tool looks for the best JPEG quality that fits under that size and only shrinks the dimensions if quality alone is not enough. The final size is shown before you save it. A phone photo of several megabytes usually ends up well under 1 MB and still perfectly readable.",
    },
    {
      q: "Can I shrink a photo without it turning blurry?",
      r: "Yes, as long as the new size matches how the picture will be viewed. A photo reduced to 1,600 pixels wide stays sharp on a laptop screen and weighs far less. Blur comes from enlarging a picture that is too small, or from pushing JPEG quality very low. When you need a lighter file, cut the dimensions first and keep quality above 70%.",
    },
    {
      q: "Why do other resizers stretch my photos when this one does not?",
      r: "A picture gets distorted when both a width and a height are forced without respecting its original ratio. Here the proportions are always kept: if you enter both values, the image is scaled down to fit inside that box, with no stretching and no cropping. If you need an exact shape such as a square, crop the image first and resize it afterwards.",
    },
    {
      q: "What pixel width works for a website image or an email attachment?",
      r: "For a full-width website banner, 1,600 to 2,000 pixels wide is plenty, around 150 to 400 KB as JPEG. For an image inside an article, 1,000 to 1,200 pixels. For email, 1,280 to 1,600 pixels wide lets the recipient view the photo comfortably without filling their inbox. A recent phone photo is often 4,000 pixels wide, far more than any of these uses need.",
    },
    {
      q: "Does the maximum size mode work with PNG files?",
      r: "Not as PNG output. PNG is lossless, so its size depends on the content and cannot be tuned with a quality setting. The maximum size mode therefore produces a JPEG, or a WebP if you choose it, and transparent areas receive the background colour you pick. To keep a lighter PNG with its transparency, reduce its width and height in pixels instead.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "WHATWG", titre: "HTML Standard, section 4.12.5 : l'élément canvas (drawImage, toBlob)", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, compression numérique des images fixes à tons continus (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 octobre 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649.html", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "WHATWG", titre: "HTML Standard, section 4.12.5: the canvas element (drawImage, toBlob)", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, Digital compression and coding of continuous-tone still images (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 October 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649.html", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Redimensionner et compresser une image, 75tools",
    motsCles: "redimensionner image en ligne, réduire la taille d'une photo, compresser image en ligne, réduire poids photo, redimensionner photo, image en ko",
    choisir: "Choisir des images",
    aide: "ou glissez-les ici (JPG, PNG, WebP)",
    attente: "Les images réduites s'afficheront ici, avec les dimensions avant et après et le poids obtenu.",
    action: "Redimensionner",
    zip: "images-redimensionnees.zip",
    ko: "Ko",
    modeReduction: "Mode de réduction",
    pixels: "Pixels",
    pourcentage: "Pourcentage",
    poids: "Poids max. (Ko)",
    largeurMax: "Largeur max. (px)",
    hauteurMax: "Hauteur max. (px)",
    aideDims: "Laissez un champ vide pour qu'il suive les proportions. Avec les deux, l'image tient dans le cadre, sans déformation.",
    tailleDe: "Taille en % de l'original",
    aidePct: "50 % divise la largeur et la hauteur par deux, et le nombre de pixels par quatre.",
    poidsMax: "Poids maximal (Ko)",
    aidePoids: "1 Mo = 1 024 Ko. Gardez une petite marge sous la limite demandée.",
    formatProduit: "Format produit",
    jpgPartout: "JPG (accepté partout)",
    webpLeger: "WebP (plus léger, pour un site)",
    identique: "Identique à l'original",
    agrandir: "Autoriser l'agrandissement (déconseillé : l'image devient floue)",
    largeur: "Largeur",
    hauteur: "Hauteur",
    indiquer: "Indiquez une largeur, une hauteur ou les deux.",
    qualiteDe: (q: number) => `qualité ${q} %`,
    nonAtteint: (o: string) => ` · objectif de ${o} non atteint`,
  },
  en: {
    nomAppli: "75tools image resizer and compressor",
    motsCles: "resize image online, reduce photo size, compress image online, reduce image file size, resize photo, image size in kb",
    choisir: "Choose images",
    aide: "or drop them here (JPG, PNG, WebP)",
    attente: "Resized images will appear here, with the dimensions before and after and the resulting file size.",
    action: "Resize",
    zip: "resized-images.zip",
    ko: "KB",
    modeReduction: "Resize mode",
    pixels: "Pixels",
    pourcentage: "Percentage",
    poids: "Max size (KB)",
    largeurMax: "Max width (px)",
    hauteurMax: "Max height (px)",
    aideDims: "Leave a field empty and it follows the proportions. With both, the image fits inside the box without distortion.",
    tailleDe: "Size as % of the original",
    aidePct: "50% halves the width and the height, and divides the number of pixels by four.",
    poidsMax: "Maximum file size (KB)",
    aidePoids: "1 MB = 1,024 KB. Keep a small margin below the limit you were given.",
    formatProduit: "Output format",
    jpgPartout: "JPG (accepted everywhere)",
    webpLeger: "WebP (lighter, for a website)",
    identique: "Same as the original",
    agrandir: "Allow enlarging (not recommended: the image turns blurry)",
    largeur: "Width",
    hauteur: "Height",
    indiquer: "Enter a width, a height or both.",
    qualiteDe: (q: number) => `quality ${q}%`,
    nonAtteint: (o: string) => ` · target of ${o} not reached`,
  },
};

const Redimensionner = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const sep = lang === "en" ? ": " : " : ";
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [mode, setMode] = useState<Mode>("dimensions");
  const [largeur, setLargeur] = useState("1600");
  const [hauteur, setHauteur] = useState("");
  const [agrandir, setAgrandir] = useState(false);
  const [pourcent, setPourcent] = useState("50");
  const [poidsKo, setPoidsKo] = useState("500");
  const [format, setFormat] = useState<ChoixFormat>("identique");
  const [formatPoids, setFormatPoids] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [qualite, setQualite] = useState(85);
  const [fond, setFond] = useState("#ffffff");

  const l = lireNombre(largeur, 1, 20000, "px", lang);
  const h = lireNombre(hauteur, 1, 20000, "px", lang);
  const p = lireNombre(pourcent, 1, agrandir ? 400 : 100, "%", lang);
  const k = lireNombre(poidsKo, 10, 50000, t.ko, lang);
  const messages = [
    mode === "dimensions" && l.message && `${t.largeur}${sep}${l.message}`,
    mode === "dimensions" && h.message && `${t.hauteur}${sep}${h.message}`,
    mode === "dimensions" && !l.valeur && !h.valeur && t.indiquer,
    mode === "pourcentage" && p.message,
    mode === "poids" && k.message,
  ].filter(Boolean) as string[];

  const formatDe = (f: File): FormatSortie => {
    if (format !== "identique") return format;
    if (f.type === "image/png") return "image/png";
    if (f.type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  /** Dimensions de sortie, proportions gardées. */
  const cible = (lo: number, ho: number) => {
    let r = 1;
    if (mode === "pourcentage") r = (p.valeur ?? 100) / 100;
    else {
      const rl = l.valeur ? l.valeur / lo : Infinity;
      const rh = h.valeur ? h.valeur / ho : Infinity;
      r = Math.min(rl, rh);
      if (!isFinite(r)) r = 1;
      if (!agrandir) r = Math.min(r, 1);
    }
    return { largeur: Math.max(1, Math.round(lo * r)), hauteur: Math.max(1, Math.round(ho * r)) };
  };

  const traiter = async (f: File) => {
    const base = nomSansExtension(f.name);
    if (mode === "poids") {
      const cibleOctets = (k.valeur ?? 500) * 1024;
      const r = await viserPoids(f, cibleOctets, formatPoids, fond, undefined, undefined, lang);
      const detail = `${nb(r.largeur)} × ${nb(r.hauteur)} px, ${t.qualiteDe(Math.round(r.qualite * 100))}${
        r.atteint ? "" : t.nonAtteint(formatOctets(cibleOctets, lang))
      }`;
      return { blob: r.blob, nom: `${base}.${EXTENSION[formatPoids]}`, detail };
    }
    const type = formatDe(f);
    const img = await decoderImage(f, lang);
    try {
      const d = cible(img.largeur, img.hauteur);
      const c = redimensionner(img.source, img.largeur, img.hauteur, d.largeur, d.hauteur, type === "image/jpeg" ? fond : undefined);
      try {
        const blob = await encoder(c, type, qualite / 100);
        return {
          blob,
          nom: `${base}.${EXTENSION[type]}`,
          detail: `${nb(img.largeur)} × ${nb(img.hauteur)} → ${nb(c.width)} × ${nb(c.height)} px`,
        };
      } finally {
        libererCanvas(c);
      }
    } finally {
      img.liberer();
    }
  };

  const cle = [mode, l.valeur, h.valeur, agrandir, p.valeur, k.valeur, format, formatPoids, qualite, fond].join("|");
  const sortieJpeg = mode === "poids" ? formatPoids === "image/jpeg" : format === "image/jpeg";
  const avecQualite = mode !== "poids" && format !== "image/png";

  const boutonMode = (m: Mode, nom: string) => (
    <button
      key={m}
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => setMode(m)}
      className={`h-12 px-2 rounded-md border text-sm ${mode === m ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
    >
      {nom}
    </button>
  );

  const champ = (id: string, libelle: string, valeur: string, set: (v: string) => void, aide?: string) => (
    <label className="block min-w-0" htmlFor={id}>
      <span className="block text-sm text-neutral-300 mb-1">{libelle}</span>
      <input id={id} type="text" inputMode="decimal" value={valeur} onChange={(e) => set(e.target.value)} className={classeChamp} />
      {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
    </label>
  );

  const outil = (
    <ImageLot
      idPrefixe="redim"
      accept="image/*,.heic,.heif"
      libelleDepot={t.choisir}
      aideDepot={t.aide}
      attente={t.attente}
      cle={cle}
      traiter={traiter}
      libelleAction={t.action}
      nomZip={t.zip}
      reglages={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.modeReduction}>
            {boutonMode("dimensions", t.pixels)}
            {boutonMode("pourcentage", t.pourcentage)}
            {boutonMode("poids", t.poids)}
          </div>

          {mode === "dimensions" && (
            <div className="grid gap-4 grid-cols-2">
              {champ("redim-largeur", t.largeurMax, largeur, setLargeur)}
              {champ("redim-hauteur", t.hauteurMax, hauteur, setHauteur)}
              <p className="col-span-2 text-xs text-neutral-500 -mt-2">{t.aideDims}</p>
            </div>
          )}
          {mode === "pourcentage" && (
            <div className="grid gap-4 sm:grid-cols-2">{champ("redim-pourcent", t.tailleDe, pourcent, setPourcent, t.aidePct)}</div>
          )}
          {mode === "poids" && (
            <div className="grid gap-4 sm:grid-cols-2 items-start">
              {champ("redim-poids", t.poidsMax, poidsKo, setPoidsKo, t.aidePoids)}
              <label className="block min-w-0" htmlFor="redim-format-poids">
                <span className="block text-sm text-neutral-300 mb-1">{t.formatProduit}</span>
                <select
                  id="redim-format-poids"
                  value={formatPoids}
                  onChange={(e) => setFormatPoids(e.target.value as "image/jpeg" | "image/webp")}
                  className={classeSelect}
                >
                  <option value="image/jpeg">{t.jpgPartout}</option>
                  <option value="image/webp">{t.webpLeger}</option>
                </select>
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 items-start">
            {mode !== "poids" && (
              <label className="block min-w-0" htmlFor="redim-format">
                <span className="block text-sm text-neutral-300 mb-1">{t.formatProduit}</span>
                <select id="redim-format" value={format} onChange={(e) => setFormat(e.target.value as ChoixFormat)} className={classeSelect}>
                  <option value="identique">{t.identique}</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </label>
            )}
            {avecQualite && <ReglageQualite id="redim-qualite" valeur={qualite} onChange={setQualite} />}
            {sortieJpeg && <ReglageFond valeur={fond} onChange={setFond} />}
            {mode !== "poids" && (
              <label className="flex items-center gap-3 min-h-12 text-sm text-neutral-300">
                <input type="checkbox" checked={agrandir} onChange={(e) => setAgrandir(e.target.checked)} className="w-5 h-5 accent-sky-400" />
                {t.agrandir}
              </label>
            )}
          </div>
          <p role="status" aria-live="polite" className="text-sm text-amber-300 empty:hidden">
            {messages.join(" ")}
          </p>
        </div>
      }
    />
  );

  return (
    <PageOutil
      id="redimensionner-image"
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
    <Section titre="Redimensionner une image en ligne : comment ça marche">
      <p>
        Pour redimensionner une image en ligne, choisissez un mode (pixels, pourcentage ou poids maximal en Ko),
        réglez la valeur, 1 600 pixels de large par défaut, puis déposez vos photos : chacune est réduite dans votre
        navigateur, proportions gardées, et la zone de résultat affiche les dimensions avant et après, le poids
        obtenu et un bouton pour l'enregistrer. Exemple courant : une photo de téléphone de 4 032 × 3 024 pixels et
        3,5 Mo devient un JPG de 1 600 × 1 200 pixels de quelques centaines de Ko, parfait pour un e-mail. Face à un
        formulaire limité à 1 Mo, le mode poids maximal cherche la meilleure qualité qui tient sous la limite, puis
        réduit les dimensions s'il le faut. Limite à connaître : réduire est sans risque, mais agrandir une petite
        image ne lui ajoute aucun détail, d'où l'option désactivée par défaut.
      </p>
    </Section>

    <Section titre="Trois façons de réduire une image">
      <h3>En pixels</h3>
      <p>
        C'est le réglage le plus courant : vous indiquez la largeur voulue, par exemple 1 600 pixels, et la hauteur
        suit pour garder les proportions. Avec une largeur et une hauteur, l'image est réduite jusqu'à tenir dans ce
        cadre. Par défaut, une image déjà plus petite que la cible n'est pas agrandie : agrandir n'ajoute aucun
        détail, cela ne fait qu'étaler les pixels.
      </p>
      <h3>En pourcentage</h3>
      <p>
        Pratique pour un lot de photos de tailles différentes que l'on veut toutes réduire de la même façon. À 50 %,
        largeur et hauteur sont divisées par deux, donc l'image compte quatre fois moins de pixels, et son poids
        baisse en général dans une proportion proche.
      </p>
      <h3>Jusqu'à un poids maximal en Ko</h3>
      <p>
        Le mode le plus utile face à un formulaire qui affiche « fichier trop volumineux, 1 Mo maximum ». Vous donnez
        le poids à ne pas dépasser ; l'outil encode la photo en JPEG à plusieurs niveaux de qualité, par dichotomie
        (il coupe l'intervalle en deux à chaque essai), pour trouver la meilleure qualité qui tient sous la limite.
        Si même une qualité de 55 % dépasse encore, il réduit les dimensions et recommence. Le détail affiché indique
        la qualité et la taille retenues, et prévient si l'objectif n'a pas pu être atteint.
      </p>
    </Section>

    <Section titre="Cas pratiques">
      <p>
        <strong>Démarche administrative, candidature, dossier de location</strong> : les plateformes limitent
        souvent chaque pièce jointe à quelques centaines de Ko ou à 1 ou 2 Mo. Prenez le mode poids maximal, avec
        10 % de marge sous la limite.
      </p>
      <p>
        <strong>Envoi par e-mail</strong> : dix photos de téléphone dépassent vite la limite d'une messagerie.
        Réduites à 1 600 pixels de large en JPG à 85 %, elles tiennent dans un seul message, regroupées dans un ZIP.
      </p>
      <p>
        <strong>Site web, boutique en ligne, blog</strong> : une image de 4 000 pixels ralentit la page pour rien.
        Visez la largeur réelle d'affichage (souvent 1 200 à 2 000 pixels) et le format WebP, plus léger à qualité
        égale. Pour une annonce ou un réseau social, envoyer une image déjà à la bonne taille évite une double perte
        de qualité, car ces plateformes recompressent de toute façon.
      </p>
    </Section>

    <Section titre="Une réduction de qualité, image par image">
      <p>
        Réduire une photo de 4 000 à 800 pixels d'un seul coup produit des contours crénelés et un effet de moirage
        sur les motifs fins. L'outil procède par réductions successives de moitié, chacune avec le lissage de
        meilleure qualité du navigateur, puis fait le dernier pas à la taille exacte : le résultat reste net.
      </p>
      <p>
        Les photos sont traitées une par une pour ne pas saturer la mémoire, même avec des images de 12 mégapixels
        ou plus, et l'orientation enregistrée par le téléphone est appliquée. Les métadonnées (date, appareil,
        position GPS) ne sont pas recopiées : c'est aussi une façon de ne pas diffuser le lieu de la prise de vue.
        Pour changer de format sans toucher à la taille, voyez <Link to="/png-en-jpg/">PNG en JPG</Link> ou{" "}
        <Link to="/heic-en-jpg/">HEIC en JPG</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Resize an image online: how it works">
      <p>
        To resize an image online, choose a mode (pixels, percentage or maximum size in KB), set the value, 1,600
        pixels wide by default, then drop your photos: your browser scales each one down with its proportions intact,
        and the result area shows the dimensions before and after, the new file size and a Save button. A typical
        case: a 4,032 × 3,024 pixel phone photo of 3.5 MB becomes a 1,600 × 1,200 pixel JPG of a few hundred KB,
        ideal for an email. When an upload form caps files at 1 MB, the maximum size mode searches for the best
        quality that fits under the cap and reduces the dimensions only if it has to. One limit to know: shrinking
        is safe, but enlarging a small image adds no detail, which is why that option is off by default.
      </p>
    </Section>

    <Section titre="Upload limits on French online services">
      <p>
        Living in France means uploading a lot of documents: proof of address for the préfecture, payslips for a
        rental application, a scanned ID for your bank, a photo of a medical receipt for your mutuelle (top-up health
        insurance). Each portal sets its own limit per file, usually shown next to the upload button, and an
        unchanged phone photo often exceeds it. Set the Max size mode to about 10% under the stated limit: for a
        1 MB cap, enter 900 KB. The tool encodes the photo at several JPEG quality levels, halving the search range
        each time, and keeps the best one that fits. If even 55% quality is too heavy, it shrinks the dimensions and
        tries again, and the line in the result list tells you if the target could not be met.
      </p>
    </Section>

    <Section titre="Choosing pixels or a percentage">
      <p>
        Pixels is the everyday setting: enter the width you want and the height follows. Enter both and the image is
        scaled to fit inside that box. A picture already smaller than the target is left as it is unless you allow
        enlarging. Percentage is handy for a batch of photos of mixed sizes that should all shrink the same way: at
        50%, width and height are halved, so the image holds four times fewer pixels and the file usually shrinks in
        a similar proportion.
      </p>
      <p>
        As a guide, 1,280 to 1,600 pixels wide suits email, 1,600 to 2,000 a full-width website banner, and 1,181 ×
        1,772 pixels a 10 × 15 cm print at 300 dots per inch. A WebP output is lighter still for a website, while
        JPG remains the safe choice for any form.
      </p>
    </Section>

    <Section titre="Sharp results and private files">
      <p>
        Shrinking a 4,000-pixel photo to 800 pixels in one step creates jagged edges and moiré on fine patterns. The
        tool halves the image repeatedly with the browser's highest smoothing setting, then makes the last step to
        the exact size, so the result stays clean. Files are processed one at a time to spare memory, the
        orientation recorded by the phone is applied, and metadata such as GPS position is not copied, so the
        resized photo no longer reveals where it was taken. Nothing is uploaded.
      </p>
      <p>
        To change the format without touching the size, use <Link to="/en/png-to-jpg/">PNG to JPG</Link> or, for
        iPhone pictures, <Link to="/en/heic-to-jpg/">HEIC to JPG</Link>.
      </p>
    </Section>
  </>
);

export default Redimensionner;
