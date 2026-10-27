import type { Langue } from "@/lib/outils";

/**
 * Comptages de texte en français et en anglais : mots, phrases, paragraphes, caractères (graphèmes),
 * octets UTF-8, SMS (GSM 7 bits / UCS-2) et décompte pondéré de X.
 * Fonctions pures, testées par un script Node (voir le compte rendu du lot « texte »).
 */

/* ---------- Mots ---------- */

const ESPACES_NUM = "[ \\u00A0\\u202F\\u2009]";
/** « 1 234 567,5 » → « 1234567,5 » : les espaces de milliers ne coupent pas un nombre. */
const RE_MILLIERS = new RegExp(`(^|[^\\p{N}.,])(\\p{N}{1,3})((?:${ESPACES_NUM}\\p{N}{3})+)(?!\\p{N})`, "gu");
export const fusionnerMilliers = (t: string) =>
  t.replace(RE_MILLIERS, (_m, p: string, a: string, b: string) => p + a + b.replace(/[ \u00A0\u202F\u2009]/g, ""));

/**
 * Un mot = une suite de lettres ou de chiffres. L'apostrophe et le trait d'union placés entre deux
 * lettres ne coupent pas (« aujourd'hui », « porte-monnaie », « l'homme » = 1 mot chacun) ; la
 * virgule ou le point entre deux chiffres non plus (« 1 234,5 », « 3.14 »).
 */
// Pas de lookbehind (Safari ancien) : le chiffre qui précède « , » ou « . » est consommé avec lui.
const RE_MOT =
  /(?:[\p{L}\p{N}\p{M}]*\p{N}[.,](?=\p{N}))*[\p{L}\p{N}\p{M}]+(?:['’\u2010\u2011-](?:[\p{L}\p{N}\p{M}]*\p{N}[.,](?=\p{N}))*[\p{L}\p{N}\p{M}]+)*/gu;

export const listeMots = (texte: string): string[] => fusionnerMilliers(texte).match(RE_MOT) ?? [];

export const compterMots = (texte: string) => listeMots(texte).length;

/** Élisions : « l'homme » compte pour deux mots dans ce second décompte, « aujourd'hui » reste un mot. */
const RE_ELISION = /^(?:l|d|j|m|n|s|t|c|qu|jusqu|lorsqu|puisqu|quoiqu)['’](?=[\p{L}])/iu;
export const compterMotsElisionsSeparees = (texte: string) =>
  listeMots(texte).reduce((n, m) => {
    let x = m;
    let k = 1;
    // « qu'aujourd'hui » : une élision au plus en tête de mot suffit en pratique.
    if (RE_ELISION.test(x)) {
      k = 2;
      x = x.replace(RE_ELISION, "");
    }
    return n + k;
  }, 0);

/* ---------- Phrases et paragraphes ---------- */

const ABREVIATIONS = new Set([
  "m", "mm", "mme", "mmes", "mlle", "mlles", "dr", "pr", "me", "mgr", "st", "ste", "cf", "ex", "p", "pp", "av",
  "apr", "j.-c", "n", "no", "vol", "chap", "fig", "éd", "env", "art", "al", "réf", "tél", "boul", "bd",
  // anglais : Mr. Smith, e.g. this, vs. that
  "mr", "mrs", "ms", "prof", "e.g", "i.e", "vs", "approx", "jr", "sr", "dept", "ft", "inc", "ltd",
]);

/** Phrases : fin sur . ! ? ou … suivis d'un espace ou de la fin du texte, hors abréviations courantes. */
export const listePhrases = (texte: string): string[] => {
  const phrases: string[] = [];
  const re = /[.!?…]+[»"”’)\]]*(?=\s|$)|\n+/g;
  let debut = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texte))) {
    const fin = m.index + m[0].length;
    if (m[0].startsWith(".") && m[0] === ".") {
      const avant = texte.slice(debut, m.index).match(/([\p{L}.-]+)$/u)?.[1] ?? "";
      const bas = avant.toLowerCase();
      // abréviation connue ou initiale (« J. Dupont ») : pas de fin de phrase
      if (ABREVIATIONS.has(bas) || /^\p{Lu}$/u.test(avant)) continue;
    }
    const p = texte.slice(debut, fin).trim();
    if (compterMots(p) > 0) phrases.push(p);
    debut = fin;
  }
  const reste = texte.slice(debut).trim();
  if (compterMots(reste) > 0) phrases.push(reste);
  return phrases;
};

/** Paragraphe = ligne non vide (un retour à la ligne termine un paragraphe, comme dans un traitement de texte). */
export const compterParagraphes = (texte: string) =>
  texte.split(/\r\n|\r|\n/).filter((l) => compterMots(l) > 0).length;

/* ---------- Mots fréquents ---------- */

/** Mots vides du français (articles, pronoms, prépositions, auxiliaires) écartés des mots fréquents. */
export const MOTS_VIDES = new Set(
  (
    "a à au aux avec ce ces cet cette c ça ci comme dans de des du d donc elle elles en entre est et été être " +
    "eu fait il ils je j l la le les leur leurs lui ma mais me même mes moi mon m n ne ni nos notre nous on ont " +
    "ou où par pas pour plus qu que qui quoi sa sans se ses si son sont sous sur s t ta te tes toi ton tu un une " +
    "vos votre vous y avait avoir ai as avons avez était étaient sera seront sont suis es sommes êtes fut " +
    "aussi alors ainsi après avant car chez dont lors puis tout tous toute toutes très bien peu cela celle " +
    "celui ceux celles autre autres encore déjà jamais toujours non oui tant leurs quand comment pourquoi " +
    "aujourd'hui ici là lorsque puisque quel quelle quels quelles sa se sur"
  ).split(" ")
);

/** Mots vides de l'anglais, ajoutés à ceux du français quand le texte est en anglais. */
export const MOTS_VIDES_EN = new Set(
  (
    "a an the and or but if then than so of to in on at by for from with without about into over under as is are " +
    "was were be been being am do does did done have has had having i me my mine you your yours he him his she her " +
    "hers it its we us our they them their this that these those there here what which who whom whose when where why " +
    "how not no nor yes all any both each few more most other some such only own same too very can could will would " +
    "shall should may might must just also up down out off again once don't it's i'm you're we're they're isn't " +
    "aren't wasn't weren't doesn't didn't can't won't i've you've let's that's there's"
  ).split(" ")
);

const formeLemme = (m: string) => m.toLowerCase().replace(/’/g, "'");

/** Retire l'élision de tête (« l'homme » → « homme ») pour regrouper les occurrences. */
const sansElision = (m: string) => m.replace(RE_ELISION, "");

/** Mots les plus fréquents, hors mots vides du français (et de l'anglais si `lang` vaut "en"). */
export const motsFrequents = (texte: string, n = 10, lang: Langue = "fr"): { mot: string; nb: number }[] => {
  const compte = new Map<string, number>();
  for (const brut of listeMots(texte)) {
    const forme = formeLemme(brut);
    if (lang === "en" && MOTS_VIDES_EN.has(forme)) continue;
    const m = lang === "en" ? forme : sansElision(forme);
    if (m.length < 2 || MOTS_VIDES.has(m) || /^[\p{N}.,]+$/u.test(m)) continue;
    compte.set(m, (compte.get(m) ?? 0) + 1);
  }
  return [...compte.entries()]
    .map(([mot, nb]) => ({ mot, nb }))
    .sort((a, b) => b.nb - a.nb || a.mot.localeCompare(b.mot, "fr"))
    .slice(0, n);
};

/** Mots les plus longs (en lettres), sans doublon. */
export const motsLongs = (texte: string, n = 5): string[] => {
  const vus = new Set<string>();
  return listeMots(texte)
    .map((m) => sansElision(formeLemme(m)))
    .filter((m) => !/^[\p{N}.,]+$/u.test(m) && !vus.has(m) && vus.add(m))
    .sort((a, b) => [...b].length - [...a].length || a.localeCompare(b, "fr"))
    .slice(0, n);
};

/* ---------- Caractères ---------- */

type Segmenteur = { segment: (t: string) => Iterable<{ segment: string }> };
let segmenteur: Segmenteur | null | undefined;
const obtenirSegmenteur = (): Segmenteur | null => {
  if (segmenteur !== undefined) return segmenteur;
  const I = (globalThis as unknown as { Intl?: { Segmenter?: new (l: string, o: object) => Segmenteur } }).Intl;
  segmenteur = I?.Segmenter ? new I.Segmenter("fr", { granularity: "grapheme" }) : null;
  return segmenteur;
};

/** Graphèmes : « é » écrit avec un accent combinant, un emoji famille ou un drapeau comptent pour 1. */
export const graphemes = (texte: string): string[] => {
  const s = obtenirSegmenteur();
  if (s) return Array.from(s.segment(texte), (x) => x.segment);
  // repli : points de code, en rattachant les marques combinantes et les liants d'emoji
  const out: string[] = [];
  for (const c of Array.from(texte)) {
    if (out.length && /[\p{M}‍️]/u.test(c)) out[out.length - 1] += c;
    else if (out.length && out[out.length - 1].endsWith("‍")) out[out.length - 1] += c;
    else out.push(c);
  }
  return out;
};

export const octetsUtf8 = (texte: string) => new TextEncoder().encode(texte).length;

export const compterLignes = (texte: string) => (texte === "" ? 0 : texte.split(/\r\n|\r|\n/).length);

/* ---------- SMS ---------- */

/** Jeu de base GSM 7 bits (3GPP TS 23.038), tel que le reproduit la documentation de Twilio. */
const GSM_BASE =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Table d'extension : chaque caractère occupe deux positions (caractère d'échappement + caractère). */
const GSM_EXT = "^{}\\[~]|€\f";

export interface InfoSms {
  codage: "GSM 7 bits" | "Unicode (UCS-2)";
  unites: number; // positions occupées (septets GSM ou unités UTF-16)
  segments: number;
  parSegment: number; // capacité d'un segment pour ce message
  restants: number; // positions restantes dans le dernier segment
  horsGsm: string[]; // caractères qui imposent l'Unicode
}

export const infoSms = (texte: string): InfoSms => {
  const horsGsm: string[] = [];
  let septets = 0;
  for (const c of Array.from(texte)) {
    if (GSM_BASE.includes(c)) septets += 1;
    else if (GSM_EXT.includes(c)) septets += 2;
    else if (!horsGsm.includes(c)) horsGsm.push(c);
  }
  if (horsGsm.length === 0) {
    const parSegment = septets <= 160 ? 160 : 153;
    const segments = septets === 0 ? 0 : Math.ceil(septets / parSegment);
    return { codage: "GSM 7 bits", unites: septets, segments, parSegment, restants: segments ? segments * parSegment - septets : 160, horsGsm };
  }
  const unites = texte.length; // UTF-16 : un emoji hors plan de base occupe deux unités
  const parSegment = unites <= 70 ? 70 : 67;
  const segments = Math.ceil(unites / parSegment);
  return { codage: "Unicode (UCS-2)", unites, segments, parSegment, restants: segments * parSegment - unites, horsGsm };
};

/* ---------- X (Twitter) : décompte pondéré ---------- */

/** Plages de poids 1 (docs.x.com « Counting characters » et configuration v3 de twitter-text), le reste pèse 2. */
const PLAGES_POIDS_1: [number, number][] = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];
const RE_URL = /\b(?:https?:\/\/|www\.)[^\s]+/giu;

export const compterX = (texte: string) => {
  let total = 0;
  const sansUrl = texte.replace(RE_URL, () => {
    total += 23;
    return "";
  });
  for (const g of graphemes(sansUrl)) {
    if (/\p{Extended_Pictographic}/u.test(g)) {
      total += 2;
      continue;
    }
    for (const c of Array.from(g)) {
      const cp = c.codePointAt(0) ?? 0;
      total += PLAGES_POIDS_1.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
    }
  }
  return total;
};

/* ---------- Synthèse ---------- */

/** Vitesses moyennes en français (Brysbaert, 2019, tableau 5) : lecture silencieuse et à voix haute. */
export const VITESSE_LECTURE = 214;
export const VITESSE_VOIX_HAUTE = 180;

/**
 * Vitesses par langue du texte (Brysbaert, 2019) : en anglais, 238 mots par minute en lecture
 * silencieuse d'un texte documentaire et 183 à voix haute (résumé de l'article).
 */
export const VITESSES: Record<Langue, { lecture: number; voix: number }> = {
  fr: { lecture: VITESSE_LECTURE, voix: VITESSE_VOIX_HAUTE },
  en: { lecture: 238, voix: 183 },
};

/** Durée en minutes → « 2 min 30 s », « 45 s », « 1 h 05 min » ; en anglais « 2 min 30 sec », « 1 hr 05 min ». */
export const formatDuree = (minutes: number, lang: Langue = "fr") => {
  const u = lang === "en" ? { s: "sec", h: "hr" } : { s: "s", h: "h" };
  const s = Math.round(minutes * 60);
  if (s === 0) return `0 ${u.s}`;
  if (s < 60) return `${s} ${u.s}`;
  const h = Math.floor(s / 3600);
  const mn = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h} ${u.h} ${String(mn).padStart(2, "0")} min`;
  return sec ? `${mn} min ${String(sec).padStart(2, "0")} ${u.s}` : `${mn} min`;
};

export const nombreFr = (n: number) => n.toLocaleString("fr-FR");
/** Nombre dans la langue de la page (1 234 en français, 1,234 en anglais). */
export const nombreLangue = (n: number, lang: Langue = "fr") => n.toLocaleString(lang === "en" ? "en-GB" : "fr-FR");
