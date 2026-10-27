/**
 * Traitement d'images dans le navigateur pour les outils « image » (conversion, redimensionnement,
 * poids cible). Tout passe par un canvas : rien n'est envoyé. Les fichiers sont traités un par un
 * par l'appelant pour ne pas saturer la mémoire avec des photos de 12 Mpx.
 */
import { canvasVersBlob, chargerImage } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

export type FormatSortie = "image/jpeg" | "image/png" | "image/webp";

export const EXTENSION: Record<FormatSortie, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface ImageDecodee {
  source: CanvasImageSource;
  largeur: number;
  hauteur: number;
  liberer: () => void;
}

/** Décode un fichier image avec le décodeur du navigateur (orientation EXIF appliquée). */
export async function decoderImage(f: Blob, lang: Langue = "fr"): Promise<ImageDecodee> {
  if (typeof createImageBitmap === "function") {
    try {
      const b = await createImageBitmap(f, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { source: b, largeur: b.width, hauteur: b.height, liberer: () => b.close() };
    } catch {
      // on essaie l'élément <img> ci-dessous (Safari lit parfois mieux le HEIC par ce chemin)
    }
  }
  const img = await chargerImage(f).catch(() => {
    throw new Error(
      lang === "en"
        ? "This browser cannot read the image. For an iPhone HEIC photo, use the HEIC to JPG page first."
        : "Image illisible par ce navigateur. Pour une photo HEIC d'iPhone, passez d'abord par la page HEIC en JPG."
    );
  });
  const url = img.src;
  return {
    source: img,
    largeur: img.naturalWidth,
    hauteur: img.naturalHeight,
    liberer: () => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      img.src = "";
    },
  };
}

/** Le fichier est-il un HEIC / HEIF (par type, extension ou signature « ftyp ») ? */
export async function estHeic(f: File): Promise<boolean> {
  if (/hei[cf]/i.test(f.type) || /\.(heic|heif|hif)$/i.test(f.name)) return true;
  try {
    const t = new Uint8Array(await f.slice(0, 16).arrayBuffer());
    const s = String.fromCharCode(...t.slice(4, 12));
    return /^ftyp(heic|heix|hevc|heim|heis|mif1|msf1)/.test(s);
  } catch {
    return false;
  }
}

let heic2anyCharge = false;
/** Indique si la bibliothèque HEIC a déjà été chargée (pour l'indicateur « premier fichier »). */
export const heicDejaCharge = () => heic2anyCharge;

/** Décodage HEIC de secours : heic2any, chargée seulement au moment où elle sert. */
export async function heicVersJpeg(f: Blob, qualite: number): Promise<Blob> {
  const mod = await import("heic2any");
  heic2anyCharge = true;
  const r = await mod.default({ blob: f, toType: "image/jpeg", quality: qualite });
  return Array.isArray(r) ? r[0] : r;
}

/** Crée un canvas ; `alpha: false` quand on va peindre un fond opaque. */
export function nouveauCanvas(l: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(l));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Vide un canvas pour rendre sa mémoire tout de suite (utile pour les grandes photos). */
export function libererCanvas(c: HTMLCanvasElement) {
  c.width = 0;
  c.height = 0;
}

/**
 * Redimensionne avec une bonne qualité : réductions successives par moitié tant que l'image fait
 * plus du double de la cible, puis un dernier passage en lissage « high ». Évite le crénelage
 * d'une réduction directe de 4 000 à 800 pixels.
 */
export function redimensionner(
  src: CanvasImageSource,
  largeurSrc: number,
  hauteurSrc: number,
  largeur: number,
  hauteur: number,
  fond?: string
): HTMLCanvasElement {
  largeur = Math.max(1, Math.round(largeur));
  hauteur = Math.max(1, Math.round(hauteur));
  let courant: CanvasImageSource = src;
  let lc = largeurSrc;
  let hc = hauteurSrc;
  const temporaires: HTMLCanvasElement[] = [];
  while (lc / 2 >= largeur * 1.0001 && hc / 2 >= hauteur * 1.0001 && lc > 2 && hc > 2) {
    const l2 = Math.round(lc / 2);
    const h2 = Math.round(hc / 2);
    const t = nouveauCanvas(l2, h2);
    const ctx = t.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(courant, 0, 0, lc, hc, 0, 0, l2, h2);
    temporaires.push(t);
    courant = t;
    lc = l2;
    hc = h2;
  }
  const fin = nouveauCanvas(largeur, hauteur);
  const ctx = fin.getContext("2d")!;
  if (fond) {
    ctx.fillStyle = fond;
    ctx.fillRect(0, 0, largeur, hauteur);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(courant, 0, 0, lc, hc, 0, 0, largeur, hauteur);
  temporaires.forEach(libererCanvas);
  return fin;
}

/** Encode un canvas ; pour le JPEG, le fond doit déjà être peint (sinon la transparence devient noire). */
export const encoder = (c: HTMLCanvasElement, type: FormatSortie, qualite: number) =>
  canvasVersBlob(c, type, type === "image/png" ? undefined : qualite);

/** Laisse le navigateur respirer entre deux fichiers (rafraîchir l'indicateur de progression). */
export const respirer = () => new Promise<void>((ok) => setTimeout(ok, 0));

export interface OptionsConversion {
  type: FormatSortie;
  qualite: number; // 0 à 1
  fond?: string; // couleur peinte sous l'image (transparence) ; obligatoire pour un JPEG
  largeur?: number;
  hauteur?: number;
  lang?: Langue; // langue des messages d'erreur, "fr" par défaut
}

/** Conversion simple d'un fichier : décodage, fond éventuel, redimensionnement éventuel, encodage. */
export async function convertirImage(f: Blob, o: OptionsConversion) {
  const img = await decoderImage(f, o.lang ?? "fr");
  try {
    const l = o.largeur ?? img.largeur;
    const h = o.hauteur ?? img.hauteur;
    const fond = o.fond ?? (o.type === "image/jpeg" ? "#ffffff" : undefined);
    const c = redimensionner(img.source, img.largeur, img.hauteur, l, h, fond);
    try {
      const blob = await encoder(c, o.type, o.qualite);
      return { blob, largeur: c.width, hauteur: c.height, largeurSource: img.largeur, hauteurSource: img.hauteur };
    } finally {
      libererCanvas(c);
    }
  } finally {
    img.liberer();
  }
}

/**
 * Atteindre un poids maximal : recherche de la qualité par dichotomie (JPEG ou WebP), puis, si
 * même la qualité plancher dépasse, réduction des dimensions et nouvelle recherche.
 */
export async function viserPoids(
  f: Blob,
  cibleOctets: number,
  type: "image/jpeg" | "image/webp",
  fond = "#ffffff",
  qualiteMin = 0.55,
  qualiteMax = 0.92,
  lang: Langue = "fr"
) {
  const img = await decoderImage(f, lang);
  try {
    let l = img.largeur;
    let h = img.hauteur;
    let meilleur: { blob: Blob; qualite: number; largeur: number; hauteur: number } | null = null;
    for (let essai = 0; essai < 12; essai++) {
      const c = redimensionner(img.source, img.largeur, img.hauteur, l, h, fond);
      try {
        let bas = qualiteMin;
        let haut = qualiteMax;
        // la qualité maximale suffit peut-être déjà
        const max = await encoder(c, type, haut);
        if (max.size <= cibleOctets) return { blob: max, qualite: haut, largeur: c.width, hauteur: c.height, atteint: true };
        const min = await encoder(c, type, bas);
        if (min.size <= cibleOctets) {
          let trouve = { blob: min, qualite: bas };
          for (let i = 0; i < 7; i++) {
            const q = (bas + haut) / 2;
            const b = await encoder(c, type, q);
            if (b.size <= cibleOctets) {
              trouve = { blob: b, qualite: q };
              bas = q;
            } else haut = q;
          }
          return { ...trouve, largeur: c.width, hauteur: c.height, atteint: true };
        }
        meilleur = { blob: min, qualite: bas, largeur: c.width, hauteur: c.height };
        // Trop lourd même à la qualité plancher : on réduit les dimensions en proportion du dépassement.
        const facteur = Math.min(0.9, Math.sqrt(cibleOctets / min.size) * 0.95);
        if (l * facteur < 16 || h * facteur < 16) break;
        l = Math.round(l * facteur);
        h = Math.round(h * facteur);
      } finally {
        libererCanvas(c);
      }
      await respirer();
    }
    return { ...meilleur!, atteint: false };
  } finally {
    img.liberer();
  }
}

/**
 * Écrit la résolution (points par pouce) dans l'en-tête JFIF d'un JPEG produit par le canvas,
 * pour que l'impression à « taille réelle » respecte les millimètres (photo d'identité).
 */
export async function fixerDpiJpeg(jpeg: Blob, dpi: number): Promise<Blob> {
  const o = new Uint8Array(await jpeg.arrayBuffer());
  const jfif = o[2] === 0xff && o[3] === 0xe0 && String.fromCharCode(o[6], o[7], o[8], o[9]) === "JFIF";
  if (!jfif) return jpeg;
  o[13] = 1; // unités : points par pouce
  o[14] = dpi >> 8;
  o[15] = dpi & 0xff;
  o[16] = dpi >> 8;
  o[17] = dpi & 0xff;
  return new Blob([o], { type: "image/jpeg" });
}

/**
 * Lit un nombre saisi (virgule acceptée) et le ramène dans les bornes. `message` explique la
 * correction, à afficher dans un élément role="status".
 */
export function lireNombre(saisie: string, min: number, max: number, unite = "", lang: Langue = "fr") {
  const n = parseFloat(saisie.replace(/\s/g, "").replace(",", "."));
  const en = lang === "en";
  if (saisie.trim() === "" || isNaN(n))
    return { valeur: null as number | null, message: saisie.trim() ? (en ? "Enter a number." : "Saisissez un nombre.") : "" };
  const u = unite ? ` ${unite}` : "";
  const nb = (x: number) => x.toLocaleString(locale(lang));
  if (n < min) return { valeur: min, message: en ? `Value raised to the minimum: ${nb(min)}${u}.` : `Valeur ramenée au minimum : ${nb(min)}${u}.` };
  if (n > max) return { valeur: max, message: en ? `Value lowered to the maximum: ${nb(max)}${u}.` : `Valeur ramenée au maximum : ${nb(max)}${u}.` };
  return { valeur: n, message: "" };
}
