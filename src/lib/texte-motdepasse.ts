/**
 * Générateur de mots de passe et de phrases de passe : hasard de crypto.getRandomValues,
 * tirage sans biais (rejet), entropie exacte en bits.
 */
import { listeMotsFr } from "@/lib/texte-mots-fr";
import { listeMotsEn } from "@/lib/texte-mots-en";
import type { Langue } from "@/lib/langue";

export const JEUX = {
  minuscules: "abcdefghijklmnopqrstuvwxyz",
  majuscules: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  chiffres: "0123456789",
  symboles: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
} as const;
export type TypeCar = keyof typeof JEUX;

/** Caractères faciles à confondre à la lecture ou à la saisie. */
export const AMBIGUS = "0Oo1lI|'\"`";

/** Entier uniforme dans [0, n[ : rejet des tirages au-delà du plus grand multiple de n (pas de biais modulo). */
export const entierAleatoire = (n: number, source: (a: Uint32Array) => Uint32Array = (a) => crypto.getRandomValues(a)) => {
  if (n <= 0 || n > 2 ** 32) throw new Error("borne invalide");
  const limite = Math.floor(2 ** 32 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    source(buf);
    if (buf[0] < limite) return buf[0] % n;
  }
};

export const jeuxRetenus = (types: TypeCar[], exclureAmbigus: boolean) =>
  types.map((t) => ({
    type: t,
    car: [...JEUX[t]].filter((c) => !exclureAmbigus || !AMBIGUS.includes(c)).join(""),
  }));

export interface OptionsMdp {
  longueur: number;
  types: TypeCar[];
  exclureAmbigus: boolean;
  unDeChaque: boolean;
}

export const genererMotDePasse = (o: OptionsMdp, source?: (a: Uint32Array) => Uint32Array) => {
  const jeux = jeuxRetenus(o.types, o.exclureAmbigus).filter((j) => j.car.length > 0);
  if (!jeux.length) return "";
  const tous = jeux.map((j) => j.car).join("");
  // Tirage uniforme sur l'ensemble des mots de passe valides : on rejette ceux auxquels il manque un type.
  for (;;) {
    let s = "";
    for (let i = 0; i < o.longueur; i++) s += tous[entierAleatoire(tous.length, source)];
    if (!o.unDeChaque || o.longueur < jeux.length || jeux.every((j) => [...s].some((c) => j.car.includes(c)))) return s;
  }
};

/** log2 d'un BigInt positif, précis au centième de bit. */
export const log2Big = (x: bigint) => {
  if (x <= 0n) return 0;
  const bits = x.toString(2).length;
  if (bits <= 52) return Math.log2(Number(x));
  const decal = BigInt(bits - 52);
  return Math.log2(Number(x >> decal)) + Number(decal);
};

/**
 * Entropie exacte (bits) : log2 du nombre de mots de passe possibles. Avec « au moins un de chaque
 * type », on compte par inclusion-exclusion les chaînes qui contiennent chacun des types.
 */
export const entropieMotDePasse = (o: OptionsMdp) => {
  const tailles = jeuxRetenus(o.types, o.exclureAmbigus)
    .map((j) => j.car.length)
    .filter((n) => n > 0);
  if (!tailles.length || o.longueur <= 0) return 0;
  const total = tailles.reduce((a, b) => a + b, 0);
  const L = BigInt(o.longueur);
  if (!o.unDeChaque || o.longueur < tailles.length) return o.longueur * Math.log2(total);
  let n = 0n;
  const k = tailles.length;
  for (let masque = 0; masque < 1 << k; masque++) {
    let retire = 0;
    let bitsMasque = 0;
    for (let i = 0; i < k; i++)
      if (masque & (1 << i)) {
        retire += tailles[i];
        bitsMasque++;
      }
    const terme = BigInt(total - retire) ** L;
    n += bitsMasque % 2 ? -terme : terme;
  }
  return log2Big(n);
};

/* ---------- Phrases de passe ---------- */

export interface OptionsPhrase {
  nbMots: number;
  accents: boolean;
  separateur: string;
  majuscule: boolean; // première lettre de chaque mot en majuscule (n'ajoute pas d'entropie)
  chiffre: boolean; // un chiffre au hasard accolé à un mot tiré au hasard
  langue?: Langue; // langue des mots tirés : "fr" (défaut) ou "en"
}

/** Liste de mots de la phrase de passe : français (avec ou sans accents) ou anglais. */
export const listeMots = (langue: Langue = "fr", accents = false) => (langue === "en" ? listeMotsEn() : listeMotsFr(accents));

export const genererPhrase = (o: OptionsPhrase, source?: (a: Uint32Array) => Uint32Array) => {
  const liste = listeMots(o.langue, o.accents);
  const mots = Array.from({ length: o.nbMots }, () => liste[entierAleatoire(liste.length, source)]).map((m) =>
    o.majuscule ? m.charAt(0).toLocaleUpperCase(o.langue === "en" ? "en-GB" : "fr-FR") + m.slice(1) : m
  );
  if (o.chiffre && mots.length) {
    const i = entierAleatoire(mots.length, source);
    mots[i] += String(entierAleatoire(10, source));
  }
  return mots.join(o.separateur);
};

export const entropiePhrase = (o: OptionsPhrase) => {
  const n = listeMots(o.langue, o.accents).length;
  let e = o.nbMots * Math.log2(n);
  if (o.chiffre && o.nbMots > 0) e += Math.log2(10) + Math.log2(o.nbMots);
  return e;
};

/** Niveau indicatif selon le tableau 3 du guide de l'ANSSI (≈ 65, ≈ 85, ≥ 100 bits) et le seuil de 80 bits de la CNIL. */
export const niveau = (bits: number, lang: Langue = "fr") => {
  const en = lang === "en";
  return bits >= 100
    ? { libelle: en ? "Very strong" : "Très fort", detail: en ? "100 bits or more" : "100 bits ou plus", couleur: "bg-emerald-400" }
    : bits >= 80
      ? { libelle: en ? "Strong" : "Fort", detail: en ? "at least 80 bits, the CNIL minimum for a password used alone" : "au moins 80 bits, minimum CNIL pour un mot de passe seul", couleur: "bg-emerald-500" }
      : bits >= 65
        ? { libelle: en ? "Fair" : "Moyen", detail: en ? "between 65 and 80 bits" : "entre 65 et 80 bits", couleur: "bg-amber-400" }
        : { libelle: en ? "Weak" : "Faible", detail: en ? "under 65 bits" : "moins de 65 bits", couleur: "bg-red-500" };
};
