import { PointerEvent as PE, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { canvasVersBlob, formatOctets, nomSansExtension, telecharger } from "@/lib/fichiers";
import { decoderImage, libererCanvas, nouveauCanvas, redimensionner } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

/** Côté maximal de l'image de travail : au-delà, la retouche au pinceau devient lente sur mobile. */
const COTE_MAX = 3000;

type Outil = "pipette" | "gomme" | "restaurer";
type Apercu = "damier" | "blanc" | "noir";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je vends sur une plateforme qui veut des photos produit sur fond blanc, l'outil convient ?",
      r: "Oui, si la photo a été prise sur un fond assez uni (papier, drap, mur clair) : l'outil retire ce fond en un clic sur sa couleur, puis le bouton « JPG sur fond blanc » produit une image au blanc pur. Les ombres portées et les reflets du produit sur le fond restent parfois : passez la gomme dessus. Pour un produit blanc sur fond blanc, baissez la tolérance et utilisez le mode depuis les bords.",
    },
    {
      q: "Pourquoi les cheveux ou la fourrure gardent-ils un liseré du fond ?",
      r: "Parce que l'outil décide pixel par pixel d'après la couleur : des mèches fines mêlées au fond ont une couleur intermédiaire, ni tout à fait fond ni tout à fait sujet. Il ne reconnaît pas une personne ou un animal, contrairement aux détoureurs à intelligence artificielle. L'adoucissement atténue le liseré, mais pour un portrait aux cheveux détachés sur un fond chargé, le résultat restera imparfait.",
    },
    {
      q: "Comment récupérer ma signature scannée sur fond transparent ?",
      r: "Scannez ou photographiez la signature à plat sur une feuille blanche, bien éclairée, puis déposez l'image. Choisissez le mode « toute la couleur », pour que l'intérieur des boucles devienne aussi transparent, et montez la tolérance jusqu'à ce que le grain du papier disparaisse. Activez « Recadrer au contenu » et téléchargez le PNG : il se pose ensuite sur un document, ou dans l'outil de signature de PDF.",
    },
    {
      q: "Quelle différence entre « fond contigu depuis les bords » et « toute la couleur » ?",
      r: "Le mode contigu part des bords de l'image et du point cliqué, et ne retire que la zone de fond d'un seul tenant : un sujet qui contient la même couleur que le fond, un t-shirt blanc sur fond blanc par exemple, est épargné. Le mode « toute la couleur » retire chaque pixel proche de la couleur choisie, où qu'il soit : idéal pour l'intérieur des lettres d'un logo ou des boucles d'une signature.",
    },
    {
      q: "J'ouvre le PNG et le fond apparaît noir ou blanc, la transparence est-elle perdue ?",
      r: "Non, c'est la visionneuse qui peint un fond derrière l'image : beaucoup affichent les zones transparentes en noir, en blanc ou en damier. Posez le PNG sur une page colorée d'un traitement de texte ou d'un site pour le vérifier. La transparence n'est perdue que si vous téléchargez le JPG, un format sans canal alpha, ou si une messagerie convertit le fichier en JPEG à l'envoi.",
    },
    {
      q: "Ma photo fait 4 000 pixels de large, pourquoi le PNG obtenu est-il plus petit ?",
      r: "L'outil travaille l'image à 3 000 pixels au plus sur son grand côté, pour que la gomme et le pinceau restent fluides, même sur un téléphone. La taille d'origine et la taille de travail s'affichent sous l'aperçu. 3 000 pixels suffisent pour une fiche produit, un site ou une impression A5 en bonne qualité. Pour une affiche, détourez plutôt l'image sur ordinateur dans un logiciel de retouche.",
    },
  ],
  en: [
    {
      q: "I sell on Leboncoin or Vinted, can I get product photos on a white background?",
      r: "Yes, as long as the photo was taken on a fairly plain surface such as paper, a sheet or a light wall. One click on that colour makes it transparent, then the \"JPG on white\" button gives a pure white background that listings and marketplaces like. Shadows cast by the object sometimes remain: brush them away with the eraser. For a white object on white, lower the tolerance and keep the edge mode.",
    },
    {
      q: "Why do hair and fur keep a halo of the old background?",
      r: "The tool decides pixel by pixel from colour alone. Fine strands mixed with the background have an in-between colour, neither quite background nor quite subject, and the tool does not recognise a person or an animal the way AI cut-out services do. The edge softening setting reduces the halo, but a portrait with loose hair in front of a busy room will never come out clean here.",
    },
    {
      q: "How do I turn a scanned signature into a transparent PNG for French paperwork?",
      r: "Sign on plain white paper with a dark pen, photograph it flat in good light and open the image. Choose \"Whole colour\" so the inside of the loops turns transparent too, and raise the tolerance until the paper grain disappears. Tick \"Crop to content\" and download the PNG. You can then place it on a lease, a quote or a sworn statement with the sign PDF tool.",
    },
    {
      q: "The PNG shows a black background when I open it, did the transparency get lost?",
      r: "No. The image viewer paints something behind transparent areas, often black, white or a checkerboard. Drop the PNG onto a coloured slide or web page to check. Transparency is only lost when you download the JPG, a format with no alpha channel, or when a messaging app converts the file to JPEG while sending it. Send the PNG as a file or by email instead.",
    },
    {
      q: "My photo is 4,000 pixels wide, why is the downloaded PNG smaller?",
      r: "The tool works on the image at 3,000 pixels on its long side at most, so the eraser and restore brush stay smooth even on a phone. The original size and the working size both appear under the preview. 3,000 pixels is plenty for a product listing, a website or an A5 print. For a poster, cut out the image in desktop photo-editing software instead.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, l'élément canvas (lecture et écriture des pixels)", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Compositing and Blending Level 1 (composition d'images avec transparence)", url: "https://www.w3.org/TR/compositing-1/", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "HTML Standard, the canvas element (reading and writing pixels)", url: "https://html.spec.whatwg.org/multipage/canvas.html", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Compositing and Blending Level 1", url: "https://www.w3.org/TR/compositing-1/", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Détourage d'image 75tools",
    motsCles: "détourer une image en ligne, supprimer fond image gratuit, enlever l'arrière-plan d'une photo, fond transparent, png transparent, détourage",
    choisir: "Choisir une image",
    ouverture: "Ouverture de l'image…",
    illisible: "Image illisible.",
    retouche: (l: string, h: string) => ` · retouche à ${l} × ${h} px`,
    canvas: "Aperçu de l'image détourée",
    apercuSur: "Aperçu sur :",
    damier: "Damier",
    blanc: "Blanc",
    noir: "Noir",
    outilTitre: "Outil (clic ou doigt sur l'image)",
    pipette: "Pipette",
    gomme: "Gomme",
    restaurer: "Restaurer",
    aidePipette: "Cliquez sur le fond à retirer : sa couleur devient la référence.",
    aideGomme: "Effacez à la main ce qui reste du fond (ombre, reflet).",
    aideRestaurer: "Repeignez les parties du sujet effacées par erreur.",
    pinceau: "Taille du pinceau",
    couleurFond: "Couleur du fond :",
    coins: "Reprendre la couleur des coins",
    tolerance: "Tolérance",
    pct: " %",
    zone: "Zone retirée",
    contigu: "Fond contigu depuis les bords",
    contiguAide: "(épargne le sujet de même couleur)",
    tout: "Toute la couleur",
    toutAide: "(intérieur des lettres, boucles d'une signature)",
    adoucir: "Adoucissement du bord",
    annuler: "Annuler le dernier trait",
    effacer: "Effacer les retouches",
    recadrer: "Recadrer au contenu (retire les marges vides)",
    png: "Télécharger le PNG transparent",
    jpg: "JPG sur fond blanc",
    autre: "Autre image",
    attente: "Ouvrez une image : le fond est retiré aussitôt, l'aperçu s'affiche à côté et les boutons de téléchargement ici (PNG transparent ou JPG sur fond blanc).",
    pret: "Fond retiré : vérifiez l'aperçu sur fond noir, retouchez si besoin, puis téléchargez.",
    suffixe: "sans-fond",
  },
  en: {
    nomAppli: "75tools background remover",
    motsCles: "remove background from image, remove background free, transparent background, transparent png, cut out image online",
    choisir: "Choose an image",
    ouverture: "Opening the image…",
    illisible: "This browser cannot read the image. For an iPhone HEIC photo, convert it first with the HEIC to JPG tool.",
    retouche: (l: string, h: string) => ` · edited at ${l} × ${h} px`,
    canvas: "Preview of the cut-out image",
    apercuSur: "Preview on:",
    damier: "Checkerboard",
    blanc: "White",
    noir: "Black",
    outilTitre: "Tool (click or finger on the image)",
    pipette: "Picker",
    gomme: "Eraser",
    restaurer: "Restore",
    aidePipette: "Click the background to remove: its colour becomes the reference.",
    aideGomme: "Erase by hand what is left of the background (shadow, reflection).",
    aideRestaurer: "Paint back the parts of the subject erased by mistake.",
    pinceau: "Brush size",
    couleurFond: "Background colour:",
    coins: "Use the corner colour again",
    tolerance: "Tolerance",
    pct: "%",
    zone: "Area removed",
    contigu: "Connected background from the edges",
    contiguAide: "(spares parts of the subject in the same colour)",
    tout: "Whole colour",
    toutAide: "(inside letters, loops of a signature)",
    adoucir: "Edge softening",
    annuler: "Undo last stroke",
    effacer: "Clear touch-ups",
    recadrer: "Crop to content (removes empty margins)",
    png: "Download transparent PNG",
    jpg: "JPG on white",
    autre: "Another image",
    attente: "Open an image: the background is removed at once, the preview appears alongside and the download buttons here (transparent PNG or JPG on white).",
    pret: "Background removed: check the preview on black, touch up if needed, then download.",
    suffixe: "no-background",
  },
};

/** Distance entre deux couleurs RVB (0 à 441). */
const dist = (d: Uint8ClampedArray, i: number, c: number[]) => {
  const r = d[i] - c[0];
  const g = d[i + 1] - c[1];
  const b = d[i + 2] - c[2];
  return Math.sqrt(r * r + g * g + b * b);
};

/** Couleur la plus représentée parmi les quatre coins. */
function couleurDesCoins(img: ImageData): number[] {
  const { width: w, height: h, data } = img;
  const coins = [0, w - 1, (h - 1) * w, h * w - 1].map((p) => [data[p * 4], data[p * 4 + 1], data[p * 4 + 2]]);
  let meilleur = coins[0];
  let score = -1;
  for (const c of coins) {
    const s = coins.filter((o) => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) < 40).length;
    if (s > score) {
      score = s;
      meilleur = c;
    }
  }
  return meilleur;
}

/** Flou de boîte séparable sur un masque 0..1 (rayon en pixels). */
function flouMasque(m: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r <= 0) return m;
  const tmp = new Float32Array(m.length);
  const out = new Float32Array(m.length);
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let s = 0;
    const o = y * w;
    for (let x = -r; x <= r; x++) s += m[o + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[o + x] = s / n;
      s += m[o + Math.min(w - 1, x + r + 1)] - m[o + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / n;
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/** Alpha automatique d'après la couleur du fond. */
function calculerAlpha(
  img: ImageData,
  couleur: number[],
  tolerance: number,
  contigu: boolean,
  graine: [number, number] | null,
  adoucir: number
): Uint8ClampedArray {
  const { width: w, height: h, data } = img;
  const n = w * h;
  const seuil = (tolerance / 100) * 441;
  const fond = new Uint8Array(n);
  if (!contigu) {
    for (let p = 0; p < n; p++) if (data[p * 4 + 3] < 8 || dist(data, p * 4, couleur) <= seuil) fond[p] = 1;
  } else {
    const pile = new Int32Array(n);
    let haut = 0;
    const essayer = (p: number) => {
      if (fond[p]) return;
      if (data[p * 4 + 3] < 8 || dist(data, p * 4, couleur) <= seuil) {
        fond[p] = 1;
        pile[haut++] = p;
      }
    };
    for (let x = 0; x < w; x++) {
      essayer(x);
      essayer((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      essayer(y * w);
      essayer(y * w + w - 1);
    }
    if (graine) essayer(graine[1] * w + graine[0]);
    while (haut > 0) {
      const p = pile[--haut];
      const x = p % w;
      if (x > 0) essayer(p - 1);
      if (x < w - 1) essayer(p + 1);
      if (p >= w) essayer(p - w);
      if (p < n - w) essayer(p + w);
    }
  }
  const alpha = new Uint8ClampedArray(n);
  if (adoucir > 0) {
    const m = new Float32Array(n);
    for (let p = 0; p < n; p++) m[p] = fond[p];
    const f = flouMasque(m, w, h, adoucir);
    for (let p = 0; p < n; p++) alpha[p] = fond[p] ? 0 : data[p * 4 + 3] * Math.min(1, 1.15 * (1 - f[p]));
  } else {
    for (let p = 0; p < n; p++) alpha[p] = fond[p] ? 0 : data[p * 4 + 3];
  }
  return alpha;
}

const SupprimerFondImage = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [nom, setNom] = useState("");
  const [infos, setInfos] = useState("");
  const [taille, setTaille] = useState<{ w: number; h: number } | null>(null);
  const [couleur, setCouleur] = useState<number[]>([255, 255, 255]);
  const [graine, setGraine] = useState<[number, number] | null>(null);
  const [tolerance, setTolerance] = useState(10);
  const [contigu, setContigu] = useState(true);
  const [adoucir, setAdoucir] = useState(1);
  const [outil, setOutil] = useState<Outil>("pipette");
  const [pinceau, setPinceau] = useState(30);
  const [apercu, setApercu] = useState<Apercu>("damier");
  const [recadrer, setRecadrer] = useState(false);
  const [statut, setStatut] = useState("");
  const [retouches, setRetouches] = useState(0);
  const [peutAnnuler, setPeutAnnuler] = useState(false);

  const canvas = useRef<HTMLCanvasElement>(null);
  const orig = useRef<ImageData | null>(null);
  const auto = useRef<Uint8ClampedArray | null>(null);
  const manuel = useRef<Uint8Array | null>(null); // 0 : automatique, 1 : effacé, 2 : restauré
  const avantTrait = useRef<Uint8Array | null>(null);
  const trait = useRef<{ x: number; y: number } | null>(null);

  /** Recompose l'image affichée (tout, ou seulement un rectangle). */
  const composer = useCallback((x0 = 0, y0 = 0, x1?: number, y1?: number) => {
    const o = orig.current;
    const a = auto.current;
    const m = manuel.current;
    const c = canvas.current;
    if (!o || !a || !m || !c) return;
    const w = o.width;
    x1 = Math.min(w, x1 ?? w);
    y1 = Math.min(o.height, y1 ?? o.height);
    x0 = Math.max(0, Math.floor(x0));
    y0 = Math.max(0, Math.floor(y0));
    const lw = Math.ceil(x1 - x0);
    const lh = Math.ceil(y1 - y0);
    if (lw <= 0 || lh <= 0) return;
    const sortie = new ImageData(lw, lh);
    const s = sortie.data;
    const d = o.data;
    for (let y = 0; y < lh; y++) {
      for (let x = 0; x < lw; x++) {
        const p = (y + y0) * w + x + x0;
        const i = p * 4;
        const j = (y * lw + x) * 4;
        s[j] = d[i];
        s[j + 1] = d[i + 1];
        s[j + 2] = d[i + 2];
        s[j + 3] = m[p] === 1 ? 0 : m[p] === 2 ? d[i + 3] : a[p];
      }
    }
    c.getContext("2d")!.putImageData(sortie, x0, y0);
  }, []);

  const ouvrir = async (fichiers: File[]) => {
    const f = fichiers[0];
    if (!f) return;
    setStatut(t.ouverture);
    try {
      const img = await decoderImage(f);
      try {
        const r = Math.min(1, COTE_MAX / Math.max(img.largeur, img.hauteur));
        const w = Math.round(img.largeur * r);
        const h = Math.round(img.hauteur * r);
        const c = redimensionner(img.source, img.largeur, img.hauteur, w, h);
        const data = c.getContext("2d")!.getImageData(0, 0, w, h);
        libererCanvas(c);
        orig.current = data;
        manuel.current = new Uint8Array(w * h);
        avantTrait.current = null;
        setPeutAnnuler(false);
        setRetouches(0);
        auto.current = null;
        setNom(nomSansExtension(f.name));
        setInfos(`${nb(img.largeur)} × ${nb(img.hauteur)} px, ${formatOctets(f.size, lang)}` + (r < 1 ? t.retouche(nb(w), nb(h)) : ""));
        setCouleur(couleurDesCoins(data));
        setGraine(null);
        setPinceau(Math.max(6, Math.round(Math.max(w, h) / 40)));
        setOutil("pipette");
        setTaille({ w, h });
        setStatut("");
      } finally {
        img.liberer();
      }
    } catch (e) {
      // Les messages de la bibliothèque d'images sont en français : la page anglaise affiche le sien.
      setStatut(lang === "en" ? t.illisible : e instanceof Error ? e.message : t.illisible);
    }
  };

  // Calcul du fond automatique quand un réglage change (léger délai pour suivre les curseurs).
  useEffect(() => {
    if (!taille || !orig.current) return;
    const c = canvas.current;
    if (c && (c.width !== taille.w || c.height !== taille.h)) {
      c.width = taille.w;
      c.height = taille.h;
    }
    const minuterie = setTimeout(() => {
      if (!orig.current) return;
      auto.current = calculerAlpha(orig.current, couleur, tolerance, contigu, graine, adoucir);
      composer();
    }, 120);
    return () => clearTimeout(minuterie);
  }, [taille, couleur, tolerance, contigu, graine, adoucir, composer]);

  const pointImage = (e: PE<HTMLCanvasElement>) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return {
      x: Math.min(c.width - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * c.width))),
      y: Math.min(c.height - 1, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * c.height))),
    };
  };

  const peindre = (x0: number, y0: number, x1: number, y1: number) => {
    const m = manuel.current;
    const o = orig.current;
    if (!m || !o) return;
    const w = o.width;
    const h = o.height;
    const r = pinceau / 2;
    const v = outil === "gomme" ? 1 : 2;
    const pas = Math.max(1, r / 3);
    const longueur = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(longueur / pas));
    for (let k = 0; k <= n; k++) {
      const cx = x0 + ((x1 - x0) * k) / n;
      const cy = y0 + ((y1 - y0) * k) / n;
      for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(h - 1, Math.ceil(cy + r)); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(w - 1, Math.ceil(cx + r)); x++)
          if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) m[y * w + x] = v;
    }
    composer(Math.min(x0, x1) - r - 1, Math.min(y0, y1) - r - 1, Math.max(x0, x1) + r + 2, Math.max(y0, y1) + r + 2);
  };

  const appui = (e: PE<HTMLCanvasElement>) => {
    if (!orig.current) return;
    const p = pointImage(e);
    if (outil === "pipette") {
      const d = orig.current.data;
      const i = (p.y * orig.current.width + p.x) * 4;
      setCouleur([d[i], d[i + 1], d[i + 2]]);
      setGraine([p.x, p.y]);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    avantTrait.current = manuel.current ? manuel.current.slice() : null;
    trait.current = p;
    peindre(p.x, p.y, p.x, p.y);
  };
  const deplacement = (e: PE<HTMLCanvasElement>) => {
    if (!trait.current) return;
    const p = pointImage(e);
    peindre(trait.current.x, trait.current.y, p.x, p.y);
    trait.current = p;
  };
  const relache = () => {
    if (!trait.current) return;
    trait.current = null;
    setRetouches((n) => n + 1);
    setPeutAnnuler(true);
  };

  const annulerTrait = () => {
    if (!avantTrait.current) return;
    manuel.current = avantTrait.current;
    avantTrait.current = null;
    setPeutAnnuler(false);
    composer();
  };
  const effacerRetouches = () => {
    if (!manuel.current) return;
    manuel.current.fill(0);
    avantTrait.current = null;
    setPeutAnnuler(false);
    setRetouches(0);
    composer();
  };

  /** Image finale (avec recadrage éventuel au contenu), sur fond transparent ou blanc. */
  const exporter = async (type: "image/png" | "image/jpeg") => {
    const c = canvas.current;
    if (!c || !orig.current) return;
    let x0 = 0;
    let y0 = 0;
    let x1 = c.width;
    let y1 = c.height;
    if (recadrer) {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let minX = c.width, minY = c.height, maxX = -1, maxY = -1;
      for (let y = 0; y < c.height; y++)
        for (let x = 0; x < c.width; x++)
          if (d[(y * c.width + x) * 4 + 3] > 8) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
      if (maxX >= 0) {
        x0 = minX;
        y0 = minY;
        x1 = maxX + 1;
        y1 = maxY + 1;
      }
    }
    const sortie = nouveauCanvas(x1 - x0, y1 - y0);
    const ctx = sortie.getContext("2d")!;
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sortie.width, sortie.height);
    }
    ctx.drawImage(c, x0, y0, x1 - x0, y1 - y0, 0, 0, sortie.width, sortie.height);
    const blob = await canvasVersBlob(sortie, type, 0.92);
    libererCanvas(sortie);
    telecharger(`${nom || "image"}-${t.suffixe}.${type === "image/png" ? "png" : "jpg"}`, blob);
  };

  const fermer = () => {
    orig.current = null;
    auto.current = null;
    manuel.current = null;
    avantTrait.current = null;
    setTaille(null);
    setStatut("");
  };

  const hex = "#" + couleur.map((v) => v.toString(16).padStart(2, "0")).join("");
  const fondApercu =
    apercu === "blanc"
      ? "bg-white"
      : apercu === "noir"
        ? "bg-black"
        : "bg-[length:20px_20px] bg-[conic-gradient(#d4d4d4_25%,#ffffff_0_50%,#d4d4d4_0_75%,#ffffff_0)]";

  const choix = <V extends string>(valeur: V, courant: V, set: (v: V) => void, libelle: string) => (
    <button
      type="button"
      aria-pressed={valeur === courant}
      onClick={() => set(valeur)}
      className={`h-12 px-3 rounded-md border text-sm ${valeur === courant ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
    >
      {libelle}
    </button>
  );

  const curseur = (id: string, libelle: string, valeur: number, min: number, max: number, set: (v: number) => void, unite = "") => (
    <label className="block min-w-0" htmlFor={id}>
      <span className="flex justify-between text-sm text-neutral-300">
        <span>{libelle}</span>
        <span className="tabular-nums text-neutral-100">
          {nb(valeur)}
          {unite}
        </span>
      </span>
      <input id={id} type="range" min={min} max={max} value={valeur} onChange={(e) => set(Number(e.target.value))} className="w-full h-10 accent-sky-400" />
    </label>
  );

  const reglages = taille && (
    <div className="space-y-5 min-w-0">
      <div className="space-y-2">
        <p className="text-sm text-neutral-300">{t.outilTitre}</p>
        <div className="grid grid-cols-3 gap-2">
          {choix<Outil>("pipette", outil, setOutil, t.pipette)}
          {choix<Outil>("gomme", outil, setOutil, t.gomme)}
          {choix<Outil>("restaurer", outil, setOutil, t.restaurer)}
        </div>
        <p className="text-xs text-neutral-500">
          {outil === "pipette" ? t.aidePipette : outil === "gomme" ? t.aideGomme : t.aideRestaurer}
        </p>
        {outil !== "pipette" && curseur("fond-pinceau", t.pinceau, pinceau, 2, Math.max(40, Math.round(Math.max(taille.w, taille.h) / 6)), setPinceau, " px")}
      </div>

      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-md border border-neutral-600 shrink-0" style={{ background: hex }} aria-hidden="true" />
        <div className="text-sm min-w-0">
          <p className="text-neutral-200">
            {t.couleurFond} {hex}
          </p>
          <button
            type="button"
            className="text-sky-300 underline underline-offset-4"
            onClick={() => {
              if (orig.current) setCouleur(couleurDesCoins(orig.current));
              setGraine(null);
            }}
          >
            {t.coins}
          </button>
        </div>
      </div>

      {curseur("fond-tolerance", t.tolerance, tolerance, 0, 60, setTolerance, t.pct)}

      <fieldset className="space-y-2">
        <legend className="text-sm text-neutral-300 mb-1">{t.zone}</legend>
        <label className="flex items-start gap-3 text-sm">
          <input type="radio" name="fond-mode" checked={contigu} onChange={() => setContigu(true)} className="mt-1 w-4 h-4 accent-sky-400" />
          <span>
            {t.contigu} <span className="text-neutral-500">{t.contiguAide}</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="radio" name="fond-mode" checked={!contigu} onChange={() => setContigu(false)} className="mt-1 w-4 h-4 accent-sky-400" />
          <span>
            {t.tout} <span className="text-neutral-500">{t.toutAide}</span>
          </span>
        </label>
      </fieldset>

      {curseur("fond-adoucir", t.adoucir, adoucir, 0, 4, setAdoucir, " px")}

      <div className="flex flex-wrap gap-2">
        <Bouton secondaire onClick={annulerTrait} disabled={!peutAnnuler}>
          {t.annuler}
        </Bouton>
        <Bouton secondaire onClick={effacerRetouches} disabled={retouches === 0}>
          {t.effacer}
        </Bouton>
      </div>
    </div>
  );

  const outilUi = (
    <div id="fond-outil" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div className="min-w-0 space-y-2">
        {!taille ? (
          <DepotFichiers accept="image/*" onFichiers={ouvrir} libelle={t.choisir} />
        ) : (
          <>
            <div className={`rounded-lg border border-neutral-800 overflow-hidden flex justify-center ${fondApercu}`}>
              <canvas
                ref={canvas}
                id="fond-canvas"
                aria-label={t.canvas}
                onPointerDown={appui}
                onPointerMove={deplacement}
                onPointerUp={relache}
                onPointerCancel={relache}
                className={`min-w-0 max-w-full max-h-[70vh] w-auto h-auto block ${outil === "pipette" ? "cursor-crosshair" : "cursor-cell touch-none"}`}
              />
            </div>
            <p className="text-xs text-neutral-500 [overflow-wrap:anywhere]">
              {nom} · {infos}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-neutral-400">{t.apercuSur}</span>
              {choix<Apercu>("damier", apercu, setApercu, t.damier)}
              {choix<Apercu>("blanc", apercu, setApercu, t.blanc)}
              {choix<Apercu>("noir", apercu, setApercu, t.noir)}
            </div>
          </>
        )}
        <p role="status" aria-live="polite" className="text-sm text-sky-300 empty:hidden">
          {statut}
        </p>
      </div>

      <div className="min-w-0 flex flex-col gap-5 lg:sticky lg:top-4">
        <div data-resultat className="space-y-3 order-last lg:order-first">
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={() => exporter("image/png")} disabled={!taille}>
              {t.png}
            </Bouton>
            <Bouton secondaire onClick={() => exporter("image/jpeg")} disabled={!taille}>
              {t.jpg}
            </Bouton>
          </div>
          {taille && (
            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input type="checkbox" checked={recadrer} onChange={(e) => setRecadrer(e.target.checked)} className="w-5 h-5 accent-sky-400" />
              {t.recadrer}
            </label>
          )}
          <p className="text-sm text-neutral-500">{taille ? t.pret : t.attente}</p>
          {taille && (
            <Bouton secondaire onClick={fermer}>
              {t.autre}
            </Bouton>
          )}
        </div>
        {reglages}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="supprimer-fond-image"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="MultimediaApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outilUi}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Détourer une image en ligne, sans logiciel ni envoi">
      <p>
        Pour détourer une image en ligne, déposez-la dans le cadre ci-dessus : l'outil prend la couleur la plus
        présente dans les coins, considère que c'est le fond et la rend transparente aussitôt, en partant des bords.
        Si le résultat ne convient pas, cliquez avec la pipette sur une autre zone du fond, montez la tolérance par
        petites touches (10 % par défaut, 20 à 30 % pour un fond inégalement éclairé), effacez à la gomme les ombres
        qui restent, puis téléchargez le PNG transparent ou un JPG sur fond blanc pur. Une photo de produit posée
        sur une feuille blanche se détoure ainsi en moins d'une minute, jusqu'à 3 000 pixels de côté. L'image ne
        quitte pas votre appareil : tout est calculé par votre navigateur. La limite principale tient à la méthode :
        l'outil détoure par la couleur et ne reconnaît pas le sujet, donc un portrait aux cheveux détachés devant
        un fond chargé ne sortira pas propre.
      </p>
    </Section>

    <Section titre="Ce que l'outil réussit, et ce qu'il ne fait pas">
      <p>
        Le détourage par la couleur rend transparents les pixels proches de la couleur du fond, dans la limite de la
        tolérance choisie. C'est rapide et précis dès que le fond se distingue nettement du sujet : un produit
        photographié sur fond blanc ou sur un fond uni, un logo ou une icône à poser sur un site, une signature ou un
        tampon scanné sur papier blanc, une capture d'écran, un schéma, une illustration à fond plat, ou encore une
        photo prise devant un mur, un drap ou un fond vert bien éclairés, avec quelques retouches.
      </p>
      <p>
        L'outil ne sait pas ce qu'est le sujet. Il n'est donc pas fait pour une personne aux cheveux détachés, un
        animal à poils longs, un arbre, ni pour une photo prise dans la rue ou dans un salon, où le fond mêle des
        dizaines de couleurs. Ces cas demandent un détourage par intelligence artificielle : les modèles capables de
        le faire pèsent des dizaines de mégaoctets et tournent en général sur un serveur, ce qui suppose d'y envoyer
        votre photo. Ici, l'image reste chez vous.
      </p>
    </Section>

    <Section titre="Mode d'emploi en quatre gestes">
      <p>
        <strong>1. Choisir la couleur du fond.</strong> À l'ouverture, l'outil prend la couleur qui revient le plus
        dans les coins de l'image, souvent celle du fond. Si ce n'est pas le cas, gardez la pipette et cliquez
        directement sur le fond.
      </p>
      <p>
        <strong>2. Régler la tolérance.</strong> Trop basse, des restes du fond subsistent, surtout là où la lumière
        varie ; trop haute, l'outil commence à manger le sujet. Montez par petites touches en regardant l'aperçu sur
        damier, puis vérifiez sur fond noir : c'est là que les liserés clairs se voient le mieux.
      </p>
      <p>
        <strong>3. Retoucher à la main.</strong> La gomme efface une ombre portée ou un reflet que la couleur seule ne
        distingue pas ; le pinceau « Restaurer » rend au sujet ce qui a été effacé à tort. Sur téléphone, le doigt
        fait office de pinceau, et « Annuler le dernier trait » rattrape un geste maladroit.
      </p>
      <p>
        <strong>4. Télécharger.</strong> Le PNG garde la transparence ; « JPG sur fond blanc » donne une image à fond
        blanc pur, demandée par beaucoup de places de marché. Pour alléger ensuite le fichier, passez par{" "}
        <Link to="/redimensionner-image/">redimensionner une image</Link>.
      </p>
    </Section>

    <Section titre="Réussir la photo de départ">
      <p>
        Le résultat dépend surtout de la photo. Placez le sujet devant un fond uni et mat, à un mètre de lui si
        possible pour éviter les ombres portées. Éclairez le fond de façon égale, à la lumière du jour près d'une
        fenêtre ou avec deux lampes de part et d'autre. Choisissez un fond d'une couleur absente du sujet : un fond
        blanc pour un objet sombre, un fond foncé ou coloré pour un objet blanc.
      </p>
      <p>
        Pour une signature, utilisez un stylo noir ou bleu foncé sur une feuille blanche et photographiez-la bien à
        plat, sans ombre de la main ni du téléphone. Le PNG obtenu se pose ensuite sur un document avec{" "}
        <Link to="/signer-pdf/">signer un PDF</Link>, ou sert de base à un <Link to="/creer-un-logo/">logo</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Remove the background from an image, with no upload">
      <p>
        To remove the background from an image, drop it into the box above: the tool takes the colour that appears
        most in the corners, treats it as the background and makes it transparent at once, working inwards from the
        edges. If the result is not right, click another part of the background with the picker, raise the tolerance
        step by step (10% by default, 20 to 30% for an unevenly lit background), brush away leftover shadows with the
        eraser, then download a transparent PNG or a JPG on pure white. A product photo taken on a sheet of white
        paper is done in under a minute, at up to 3,000 pixels on the long side. The image never leaves your device:
        your browser does all the work, which also means nothing is stored on a server. The main limit comes from the
        method: the tool works by colour and does not recognise the subject, so a portrait with loose hair in front
        of a busy room will not come out clean.
      </p>
    </Section>

    <Section titre="What it does well, and what it cannot do">
      <p>
        Colour-based cut-out turns pixels close to the background colour transparent, within the tolerance you set.
        It is quick and precise whenever the background stands apart from the subject: an item photographed on white
        or on a plain colour for a Leboncoin or Vinted listing, a logo or icon you want to place on a website, a
        signature or company stamp scanned on white paper, a screenshot or a flat illustration, or a photo taken in
        front of a well-lit wall, sheet or green screen, with a few touch-ups.
      </p>
      <p>
        The tool does not know what the subject is. It is not meant for a person with loose hair, a long-haired
        animal, a tree, or a street or living-room photo where the background mixes dozens of colours. Those cases
        need an AI cut-out: the models that can do it weigh tens of megabytes and usually run on a server, which
        means sending your photo there. Here, the image stays with you.
      </p>
    </Section>

    <Section titre="Four steps">
      <p>
        <strong>1. Pick the background colour.</strong> On opening, the tool uses the most common corner colour,
        usually the background. If it guessed wrong, keep the picker selected and click the background itself.
      </p>
      <p>
        <strong>2. Set the tolerance.</strong> Too low and patches of background remain, especially where the light
        changes; too high and the tool starts eating into the subject. Raise it a little at a time while watching the
        checkerboard preview, then check on black, where light halos show up best.
      </p>
      <p>
        <strong>3. Touch up by hand.</strong> The eraser removes a cast shadow or reflection that colour alone cannot
        separate; the Restore brush paints back what was removed by mistake. On a phone your finger is the brush, and
        "Undo last stroke" fixes a slip.
      </p>
      <p>
        <strong>4. Download.</strong> The PNG keeps the transparency; "JPG on white" gives a pure white background,
        which many marketplaces ask for. To make the file lighter afterwards, use{" "}
        <Link to="/en/resize-image/">resize an image</Link>.
      </p>
    </Section>

    <Section titre="Getting a good starting photo">
      <p>
        The result depends mostly on the photo. Put the subject in front of a plain, matt background, about a metre
        away from it if you can, to avoid cast shadows. Light the background evenly, with daylight near a window or
        two lamps on either side. Choose a background colour that the subject does not contain: white behind a dark
        object, dark or coloured behind a white one.
      </p>
      <p>
        For a signature, use a black or dark blue pen on white paper and photograph it flat, with no shadow from your
        hand or phone. The PNG can then go onto a French lease, quote or form with the{" "}
        <Link to="/en/sign-pdf/">sign PDF tool</Link>, or become the starting point of a{" "}
        <Link to="/en/logo-maker/">logo</Link>.
      </p>
    </Section>
  </>
);

export default SupprimerFondImage;
