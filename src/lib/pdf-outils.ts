/**
 * Fonctions communes des outils PDF (compresser, fusionner, séparer, convertir, signer) :
 * ouverture avec messages d'erreur lisibles, plages de pages « 1-3, 5, 8-10 ».
 * Tout reste dans le navigateur.
 */
import { PDFDocument } from "pdf-lib";

/** Vrai si l'en-tête « %PDF- » figure dans le premier kilo-octet (tolérance de la norme). */
export function estPdf(octets: Uint8Array): boolean {
  const n = Math.min(octets.length - 4, 1024);
  for (let i = 0; i < n; i++) {
    if (octets[i] === 0x25 && octets[i + 1] === 0x50 && octets[i + 2] === 0x44 && octets[i + 3] === 0x46) return true;
  }
  return false;
}

/** Ouvre un PDF avec pdf-lib ; lève une erreur au message lisible (pas un PDF, chiffré, abîmé). */
export async function chargerPdfLib(octets: Uint8Array, nom?: string, lang: "fr" | "en" = "fr"): Promise<PDFDocument> {
  const en = lang === "en";
  const n = nom ?? (en ? "This file" : "Ce fichier");
  if (!estPdf(octets)) throw new Error(en ? `${n} is not a PDF (the %PDF header is missing).` : `${n} n'est pas un PDF (l'en-tête %PDF est absent).`);
  try {
    return await PDFDocument.load(octets, { updateMetadata: false });
  } catch (e) {
    const m = String((e as Error)?.message ?? e);
    if (/encrypt/i.test(m))
      throw new Error(
        en
          ? `${n} is protected (encrypted, usually with a password): open it in your PDF reader, save an unprotected copy, then try again.`
          : `${n} est protégé (chiffré, souvent par un mot de passe) : ouvrez-le dans votre lecteur PDF, enregistrez-en une copie sans protection, puis réessayez.`
      );
    throw new Error(en ? `${n} looks damaged or incomplete: it could not be read.` : `${n} semble abîmé ou incomplet : il n'a pas pu être lu.`);
  }
}

/** Message lisible pour une erreur de pdf.js (getDocument). */
export function messagePdfJs(e: unknown, nom?: string, lang: "fr" | "en" = "fr"): string {
  const en = lang === "en";
  const f = nom ?? (en ? "This file" : "Ce fichier");
  const n = (e as { name?: string })?.name ?? "";
  if (n === "PasswordException")
    return en
      ? `${f} is password-protected: open it in your PDF reader, save a copy without the password, then try again.`
      : `${f} est protégé par un mot de passe : ouvrez-le dans votre lecteur PDF, enregistrez une copie sans mot de passe, puis réessayez.`;
  if (n === "InvalidPDFException") return en ? `${f} is not a valid PDF or it is damaged.` : `${f} n'est pas un PDF valide ou il est abîmé.`;
  return en ? `${f} could not be read: it may be damaged, incomplete or protected.` : `${f} n'a pas pu être lu : il est peut-être abîmé, incomplet ou protégé.`;
}

/** Laisse le navigateur afficher la progression entre deux pages lourdes. */
export const respirer = () => new Promise<void>((ok) => setTimeout(ok, 0));

export type Plage = [number, number];

export interface ResultatPlages {
  plages: Plage[];
  avertissements: string[];
  erreur: string;
}

/**
 * « 1-3, 5, 8-10 » → [[1,3],[5,5],[8,10]]. « 8- » va jusqu'à la fin, « 5-3 » donne 5, 4, 3.
 * Une page au-delà de la dernière est ramenée et signalée ; une plage entièrement hors du
 * document est retirée et signalée.
 */
export function analyserPlages(texte: string, max: number, lang: "fr" | "en" = "fr"): ResultatPlages {
  const en = lang === "en";
  const plages: Plage[] = [];
  const avertissements: string[] = [];
  const morceaux = texte
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .split(/[,;\s]+/)
    .map((m) => m.replace(/\s+/g, ""))
    .filter(Boolean);
  for (const m of morceaux) {
    const r = /^(\d+)(?:-(\d*))?$/.exec(m);
    if (!r) return { plages: [], avertissements, erreur: en ? `"${m}" is not understood: write for example 1-3, 5, 8-10.` : `« ${m} » n'est pas compris : écrivez par exemple 1-3, 5, 8-10.` };
    let a = parseInt(r[1], 10);
    let b = r[2] === undefined ? a : r[2] === "" ? max : parseInt(r[2], 10);
    if (a < 1) {
      avertissements.push(en ? "Page 0 does not exist: numbering starts at 1." : `La page 0 n'existe pas : la numérotation commence à 1.`);
      a = 1;
    }
    if (b < 1) b = 1;
    if (Math.min(a, b) > max) {
      avertissements.push(en ? `"${m}" is removed: the document only has ${max} page${max > 1 ? "s" : ""}.` : `« ${m} » est retiré : le document n'a que ${max} page${max > 1 ? "s" : ""}.`);
      continue;
    }
    if (a > max || b > max) {
      avertissements.push(en ? `"${m}" is cut back to page ${max}, the last page of the document.` : `« ${m} » est ramené à la page ${max}, la dernière du document.`);
      a = Math.min(a, max);
      b = Math.min(b, max);
    }
    plages.push([a, b]);
  }
  return { plages, avertissements, erreur: "" };
}

/** Pages d'une plage, dans l'ordre écrit (5-3 → 5, 4, 3). */
export function pagesDe([a, b]: Plage): number[] {
  const p: number[] = [];
  if (a <= b) for (let i = a; i <= b; i++) p.push(i);
  else for (let i = a; i >= b; i--) p.push(i);
  return p;
}

/** Pages de plusieurs plages, sans doublon, dans l'ordre d'apparition. */
export function pagesUniques(plages: Plage[]): number[] {
  const vues = new Set<number>();
  const p: number[] = [];
  for (const pl of plages) for (const n of pagesDe(pl)) if (!vues.has(n)) (vues.add(n), p.push(n));
  return p;
}

/** [1,2,3,5,8,9,10] → « 1-3, 5, 8-10 ». */
export function plagesEnTexte(pages: number[]): string {
  const t = [...new Set(pages)].sort((x, y) => x - y);
  const out: string[] = [];
  for (let i = 0; i < t.length; ) {
    let j = i;
    while (j + 1 < t.length && t[j + 1] === t[j] + 1) j++;
    out.push(j > i ? `${t[i]}-${t[j]}` : `${t[i]}`);
    i = j + 1;
  }
  return out.join(", ");
}

/** Nom de fichier sans caractères gênants : « Contrat été 2026 » → « Contrat-ete-2026 ». */
export function nomPropre(nom: string): string {
  return (
    nom
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "document"
  );
}

/** Identifiant stable pour les listes (pas de Math.random). */
let compteur = 0;
export const nouvelId = () => `f${++compteur}`;

/** Déplace l'élément i d'un cran (sens -1 ou +1) ou vers la position j. */
export function deplacer<T>(liste: T[], i: number, j: number): T[] {
  if (j < 0 || j >= liste.length || i === j) return liste;
  const l = [...liste];
  const [x] = l.splice(i, 1);
  l.splice(j, 0, x);
  return l;
}

/**
 * Orientation EXIF d'un JPEG (1 = droite, 3 = 180°, 6 = 90° horaire, 8 = 90° antihoraire…).
 * Renvoie 1 si l'information est absente ou si le fichier n'est pas un JPEG.
 */
export function orientationJpeg(o: Uint8Array): number {
  if (o[0] !== 0xff || o[1] !== 0xd8) return 1;
  let i = 2;
  while (i + 10 < o.length) {
    if (o[i] !== 0xff) return 1;
    const marqueur = o[i + 1];
    const long = (o[i + 2] << 8) | o[i + 3];
    if (marqueur === 0xe1 && o[i + 4] === 0x45 && o[i + 5] === 0x78 && o[i + 6] === 0x69 && o[i + 7] === 0x66) {
      const t = i + 10; // début de l'en-tête TIFF
      const le = o[t] === 0x49;
      const r16 = (p: number) => (le ? o[p] | (o[p + 1] << 8) : (o[p] << 8) | o[p + 1]);
      const r32 = (p: number) =>
        (le ? o[p] | (o[p + 1] << 8) | (o[p + 2] << 16) | (o[p + 3] << 24) : (o[p] << 24) | (o[p + 1] << 16) | (o[p + 2] << 8) | o[p + 3]) >>> 0;
      const ifd = t + r32(t + 4);
      if (ifd + 2 > o.length) return 1;
      const n = r16(ifd);
      for (let k = 0; k < n; k++) {
        const e = ifd + 2 + k * 12;
        if (e + 10 > o.length) return 1;
        if (r16(e) === 0x0112) return r16(e + 8) || 1;
      }
      return 1;
    }
    if (marqueur === 0xda || marqueur === 0xd9) return 1;
    i += 2 + long;
  }
  return 1;
}

/** Type d'image d'après les premiers octets. */
export function typeImage(o: Uint8Array): "jpg" | "png" | "webp" | "gif" | "autre" {
  if (o[0] === 0xff && o[1] === 0xd8) return "jpg";
  if (o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47) return "png";
  if (o[0] === 0x52 && o[1] === 0x49 && o[2] === 0x46 && o[3] === 0x46 && o[8] === 0x57 && o[9] === 0x45) return "webp";
  if (o[0] === 0x47 && o[1] === 0x49 && o[2] === 0x46) return "gif";
  return "autre";
}
