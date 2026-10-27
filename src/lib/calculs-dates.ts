/**
 * Dates en jours entiers (nombre de jours depuis le 1er janvier 1970, en UTC) : aucune heure,
 * donc aucun piège d'heure d'été. Jours fériés de France métropolitaine (et Alsace-Moselle),
 * jours ouvrés et ouvrables, durées en années, mois et jours, âge exact.
 */

const MS_JOUR = 86400000;

export const JOURS_SEMAINE = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Jour (entier) d'une date du calendrier ; mois de 1 à 12. */
export const jour = (a: number, m: number, j: number): number => {
  const d = new Date(Date.UTC(2000, m - 1, j));
  d.setUTCFullYear(a); // évite le décalage des années 0 à 99
  return Math.round(d.getTime() / MS_JOUR);
};

/** Année, mois (1 à 12), jour du mois et jour de la semaine (0 = dimanche). */
export const decompose = (n: number) => {
  const d = new Date(n * MS_JOUR);
  return { a: d.getUTCFullYear(), m: d.getUTCMonth() + 1, j: d.getUTCDate(), js: d.getUTCDay() };
};

export const estBissextile = (a: number) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
export const joursDansMois = (a: number, m: number) => [31, estBissextile(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

/** Lit « AAAA-MM-JJ » (valeur d'un champ date) ; null si vide ou date inexistante. */
export const lireDate = (s: string): number | null => {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!r) return null;
  const a = +r[1], m = +r[2], j = +r[3];
  if (m < 1 || m > 12 || j < 1 || j > joursDansMois(a, m)) return null;
  return jour(a, m, j);
};

const deux = (x: number) => String(x).padStart(2, "0");
export const versIso = (n: number) => {
  const { a, m, j } = decompose(n);
  return `${String(a).padStart(4, "0")}-${deux(m)}-${deux(j)}`;
};

/** « vendredi 1er mai 2026 » */
export const dateLongue = (n: number, avecJour = true) => {
  const { a, m, j, js } = decompose(n);
  return `${avecJour ? JOURS_SEMAINE[js] + " " : ""}${j === 1 ? "1er" : j} ${MOIS[m - 1]} ${a}`;
};

/** Dimanche de Pâques (calendrier grégorien), algorithme de Meeus, Jones et Butcher. */
export const paques = (a: number): number => {
  const b = a % 19;
  const c = Math.floor(a / 100);
  const d = a % 100;
  const e = Math.floor(c / 4);
  const f = c % 4;
  const g = Math.floor((c + 8) / 25);
  const h = Math.floor((c - g + 1) / 3);
  const i = (19 * b + c - e - h + 15) % 30;
  const k = Math.floor(d / 4);
  const l = d % 4;
  const x = (32 + 2 * f + 2 * k - i - l) % 7;
  const y = Math.floor((b + 11 * i + 22 * x) / 451);
  const mois = Math.floor((i + x - 7 * y + 114) / 31);
  const j = ((i + x - 7 * y + 114) % 31) + 1;
  return jour(a, mois, j);
};

export interface Ferie {
  n: number;
  nom: string;
}

/** Jours fériés d'une année, dans l'ordre ; Alsace-Moselle ajoute le Vendredi saint et le 26 décembre. */
export const joursFeries = (a: number, alsaceMoselle = false): Ferie[] => {
  const p = paques(a);
  const l: Ferie[] = [
    { n: jour(a, 1, 1), nom: "Jour de l'An" },
    { n: p + 1, nom: "Lundi de Pâques" },
    { n: jour(a, 5, 1), nom: "Fête du Travail" },
    { n: jour(a, 5, 8), nom: "Victoire 1945" },
    { n: p + 39, nom: "Ascension" },
    { n: p + 50, nom: "Lundi de Pentecôte" },
    { n: jour(a, 7, 14), nom: "Fête nationale" },
    { n: jour(a, 8, 15), nom: "Assomption" },
    { n: jour(a, 11, 1), nom: "Toussaint" },
    { n: jour(a, 11, 11), nom: "Armistice 1918" },
    { n: jour(a, 12, 25), nom: "Noël" },
  ];
  if (alsaceMoselle) {
    l.push({ n: p - 2, nom: "Vendredi saint (Alsace-Moselle)" });
    l.push({ n: jour(a, 12, 26), nom: "Saint-Étienne, 26 décembre (Alsace-Moselle)" });
  }
  return l.sort((x, y) => x.n - y.n);
};

/** Fériés compris entre deux jours inclus. */
export const feriesEntre = (debut: number, fin: number, alsaceMoselle = false): Ferie[] => {
  const r: Ferie[] = [];
  for (let a = decompose(debut).a; a <= decompose(fin).a; a++) {
    for (const f of joursFeries(a, alsaceMoselle)) if (f.n >= debut && f.n <= fin) r.push(f);
  }
  return r;
};

export type TypeJour = "calendaire" | "ouvre" | "ouvrable";

/** Le jour compte-t-il ? Ouvré : lundi à vendredi non férié ; ouvrable : lundi à samedi non férié. */
const compte = (n: number, type: TypeJour, feries: Set<number>) => {
  if (type === "calendaire") return true;
  const js = decompose(n).js;
  if (js === 0) return false;
  if (js === 6 && type === "ouvre") return false;
  return !feries.has(n);
};

const ensembleFeries = (debut: number, fin: number, alsace: boolean) =>
  new Set(feriesEntre(debut, fin, alsace).map((f) => f.n));

/** Comptage sur la période [debut, fin], bornes incluses. */
export const compterJours = (debut: number, fin: number, alsaceMoselle = false) => {
  const feries = ensembleFeries(debut, fin, alsaceMoselle);
  let ouvres = 0, ouvrables = 0, samedis = 0, dimanches = 0;
  for (let n = debut; n <= fin; n++) {
    const js = decompose(n).js;
    if (js === 0) dimanches++;
    if (js === 6) samedis++;
    if (compte(n, "ouvre", feries)) ouvres++;
    if (compte(n, "ouvrable", feries)) ouvrables++;
  }
  return { calendaires: fin - debut + 1, ouvres, ouvrables, samedis, dimanches };
};

/**
 * Ajoute N jours (N négatif : retire). En jours ouvrés ou ouvrables, on avance jour par jour
 * en ne comptant que les jours qui comptent : le résultat est toujours un jour de ce type.
 */
export const ajouterJours = (depart: number, nb: number, type: TypeJour, alsaceMoselle = false): number => {
  if (type === "calendaire" || nb === 0) return depart + nb;
  const pas = nb > 0 ? 1 : -1;
  // marge large pour les fériés : au plus 2 × N + 20 jours
  const borne = depart + pas * (Math.abs(nb) * 2 + 20);
  const feries = ensembleFeries(Math.min(depart, borne), Math.max(depart, borne), alsaceMoselle);
  let n = depart, reste = Math.abs(nb);
  while (reste > 0) {
    n += pas;
    if (compte(n, type, feries)) reste--;
  }
  return n;
};

export type Convention29 = "1mars" | "28fevrier";

/**
 * Ajoute k mois à une date. Si le jour n'existe pas dans le mois d'arrivée (29 février d'une année
 * non bissextile, 31 d'un mois de 30 jours) : « 1mars » passe au 1er du mois suivant,
 * « 28fevrier » prend le dernier jour du mois.
 */
export const ajouterMois = (n: number, k: number, conv: Convention29 = "1mars"): number => {
  const { a, m, j } = decompose(n);
  const t = a * 12 + (m - 1) + k;
  const a2 = Math.floor(t / 12), m2 = (t % 12) + 1;
  const max = joursDansMois(a2, m2);
  if (j <= max) return jour(a2, m2, j);
  return conv === "28fevrier" ? jour(a2, m2, max) : jour(a2, m2, max) + 1;
};

/** Écart en années, mois et jours de debut à fin (fin ≥ debut). */
export const ecartAnneesMoisJours = (debut: number, fin: number, conv: Convention29 = "1mars") => {
  const d = decompose(debut), f = decompose(fin);
  let k = (f.a - d.a) * 12 + (f.m - d.m);
  while (k > 0 && ajouterMois(debut, k, conv) > fin) k--;
  while (ajouterMois(debut, k + 1, conv) <= fin) k++;
  return { annees: Math.floor(k / 12), mois: k % 12, jours: fin - ajouterMois(debut, k, conv), moisTotal: k };
};

/** Âge exact et prochain anniversaire. */
export const age = (naissance: number, reference: number, conv: Convention29 = "1mars") => {
  const e = ecartAnneesMoisJours(naissance, reference, conv);
  let prochainAge = e.annees;
  let anniv = ajouterMois(naissance, prochainAge * 12, conv);
  if (anniv < reference) {
    prochainAge++;
    anniv = ajouterMois(naissance, prochainAge * 12, conv);
  }
  return {
    ...e,
    joursTotal: reference - naissance,
    semaines: Math.floor((reference - naissance) / 7),
    prochainAnniversaire: anniv,
    ageAuProchain: prochainAge,
    dansJours: anniv - reference,
  };
};
