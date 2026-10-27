/**
 * Lecture et affichage des nombres à la française, et fonctions de calcul des pages
 * pourcentage, HT/TTC et marge commerciale. Fonctions pures, testées hors navigateur.
 */

/** Lit « 1 234,56 », « 1234.56 », « 12 % » ou « 40 € » ; null si vide ou illisible. */
export const lireNombre = (s: string): number | null => {
  if (s == null) return null;
  const t = String(s)
    .replace(/[\s  ]/g, "")
    .replace(/[%€]/g, "")
    .replace(",", ".");
  if (t === "" || t === "-" || t === "+" || t === ".") return null;
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** Arrondi au centième, moitié vers le haut (en valeur absolue), sans l'erreur binaire de 1,005. */
export const arrondi2 = (x: number): number => {
  const s = x < 0 ? -1 : 1;
  return (s * Math.round(Math.abs(x) * 100 + 1e-7)) / 100;
};

/** Nombre à la française, jusqu'à `dec` décimales (zéros inutiles retirés). */
export const fmt = (n: number, dec = 2): string => {
  if (!Number.isFinite(n)) return "–";
  const r = Number(n.toFixed(dec));
  return (Object.is(r, -0) ? 0 : r).toLocaleString("fr-FR", { maximumFractionDigits: dec });
};

/** Montant en euros, toujours deux décimales : « 1 234,50 € ». */
export const fmtEuro = (n: number): string => {
  if (!Number.isFinite(n)) return "–";
  const r = arrondi2(n);
  return (Object.is(r, -0) ? 0 : r).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
};

/** Pourcentage affiché : « 12,5 % ». */
export const fmtPct = (n: number, dec = 2): string => `${fmt(n, dec)} %`;

/* ---------- Pourcentages ---------- */

/** X % de Y. */
export const pourcentageDe = (x: number, y: number) => (x / 100) * y;
/** X représente quel pourcentage de Y (null si Y = 0). */
export const partEnPourcentage = (x: number, y: number) => (y === 0 ? null : (x / y) * 100);
/** Évolution en % de A vers B (null si A = 0). */
export const evolution = (a: number, b: number) => (a === 0 ? null : ((b - a) / Math.abs(a)) * 100);
/** Y augmenté (sens = 1) ou diminué (sens = -1) de X %. */
export const appliquerTaux = (y: number, x: number, sens: 1 | -1) => y * (1 + (sens * x) / 100);
/** Valeur de départ avant une hausse (sens = 1) ou une baisse (sens = -1) de X % (null si impossible). */
export const valeurDeDepart = (finale: number, x: number, sens: 1 | -1) => {
  const c = 1 + (sens * x) / 100;
  return c <= 0 ? null : finale / c;
};
/** Évolutions successives (en %, signées) : coefficient global, taux global, taux moyen par étape. */
export const evolutionsSuccessives = (taux: number[]) => {
  const coef = taux.reduce((c, t) => c * (1 + t / 100), 1);
  const moyen = taux.length && coef > 0 ? (Math.pow(coef, 1 / taux.length) - 1) * 100 : null;
  return { coef, global: (coef - 1) * 100, moyen };
};

/* ---------- TVA ---------- */

/** HT vers TTC : TVA arrondie au centime, TTC = HT + TVA. */
export const htVersTtc = (ht: number, taux: number) => {
  const h = arrondi2(ht);
  const tva = arrondi2((h * taux) / 100);
  return { ht: h, tva, ttc: arrondi2(h + tva) };
};

/** TTC vers HT : HT = TTC ÷ (1 + taux), arrondi au centime ; TVA = TTC − HT. */
export const ttcVersHt = (ttc: number, taux: number) => {
  const t = arrondi2(ttc);
  const ht = arrondi2(t / (1 + taux / 100));
  return { ht, tva: arrondi2(t - ht), ttc: t };
};

/** Montant de TVA seul à partir d'un TTC. */
export const tvaDansTtc = (ttc: number, taux: number) => ttcVersHt(ttc, taux).tva;

export interface LigneTva {
  quantite: number;
  prixHt: number;
  taux: number;
}

/** Récapitulatif d'une liste de lignes : total HT de chaque ligne arrondi, TVA calculée par taux sur le total du taux. */
export const recapitulatifTva = (lignes: LigneTva[]) => {
  const parTaux = new Map<number, number>();
  let totalHt = 0;
  const montants = lignes.map((l) => {
    const m = arrondi2(l.quantite * l.prixHt);
    totalHt = arrondi2(totalHt + m);
    parTaux.set(l.taux, arrondi2((parTaux.get(l.taux) ?? 0) + m));
    return m;
  });
  const detail = [...parTaux.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([taux, base]) => ({ taux, base, tva: arrondi2((base * taux) / 100) }));
  const totalTva = arrondi2(detail.reduce((s, d) => s + d.tva, 0));
  return { montants, detail, totalHt, totalTva, totalTtc: arrondi2(totalHt + totalTva) };
};

/* ---------- Marge commerciale ---------- */

/** À partir du prix d'achat HT et du prix de vente HT. */
export const indicateursMarge = (achat: number, vente: number) => {
  const marge = vente - achat;
  return {
    marge,
    tauxMarge: achat === 0 ? null : (marge / achat) * 100,
    tauxMarque: vente === 0 ? null : (marge / vente) * 100,
    coefficient: achat === 0 ? null : vente / achat,
  };
};

export type BaseInverse = "marge" | "marque" | "coefficient";

/** Prix de vente HT visé à partir d'un taux de marge, d'un taux de marque ou d'un coefficient (null si impossible). */
export const prixDeVente = (achat: number, base: BaseInverse, valeur: number): number | null => {
  if (base === "marge") return achat * (1 + valeur / 100);
  if (base === "marque") return valeur >= 100 ? null : achat / (1 - valeur / 100);
  return achat * valeur;
};

/** Taux de marque équivalent à un taux de marge, et inversement (en %). */
export const margeVersMarque = (tm: number) => (tm / (100 + tm)) * 100;
export const marqueVersMarge = (tq: number) => (tq >= 100 ? null : (tq / (100 - tq)) * 100);
