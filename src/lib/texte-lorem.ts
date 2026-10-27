/**
 * Faux texte : lorem ipsum (vocabulaire du lorem ipsum classique, phrases tirées au hasard) ou faux
 * texte en français construit à partir de modèles de phrases et d'un vocabulaire écrit pour 75tools.
 * Le tirage utilise un générateur à graine : même graine, même texte (rendu initial déterministe).
 */

export const DEBUT_LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const LATIN = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat
duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat
cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum integer nec odio praesent
libero sagittis mauris fusce nisl curabitur sodales ligula dignissim nunc tortor pellentesque nibh aenean quam
scelerisque cursus vestibulum morbi mattis felis porttitor accumsan donec pulvinar vitae pharetra lectus
tristique senectus netus malesuada fames turpis egestas proin sapien semper augue ornare viverra suspendisse
potenti etiam placerat orci phasellus metus maecenas risus urna mollis rhoncus arcu tincidunt eget nullam
lacinia massa eros feugiat ultrices posuere cubilia curae vivamus elementum congue quisque varius fringilla
ultricies sollicitudin hendrerit faucibus interdum dictum gravida condimentum imperdiet lobortis volutpat
convallis aliquet blandit auctor luctus neque sem venenatis vehicula bibendum`
  .trim()
  .split(/\s+/);

/** Générateur pseudo-aléatoire à graine (mulberry32), suffisant pour du faux texte. */
export const prng = (graine: number) => {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
type Hasard = () => number;
const pioche = <T,>(r: Hasard, l: readonly T[]) => l[Math.floor(r() * l.length)];
const entre = (r: Hasard, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const capitale = (s: string) => s.charAt(0).toLocaleUpperCase("fr-FR") + s.slice(1);

const phraseLatine = (r: Hasard) => {
  const n = entre(r, 6, 14);
  const mots: string[] = [];
  for (let i = 0; i < n; i++) {
    let m = pioche(r, LATIN);
    if (i === n - 1 || mots[mots.length - 1] === m) m = pioche(r, LATIN);
    mots.push(m);
    if (i > 2 && i < n - 2 && r() < 0.12) mots[mots.length - 1] += ",";
  }
  return capitale(mots.join(" ")) + ".";
};

/* ---------- Faux texte en français ---------- */

// Groupes nominaux déjà accordés (article compris), pour éviter les fautes d'accord.
const SUJETS = [
  "le projet", "la direction", "notre équipe", "ce document", "le comité", "la nouvelle version", "le service client",
  "chaque participant", "la page d'accueil", "le rapport annuel", "cette maquette", "le calendrier", "la réunion de lundi",
  "le responsable du site", "la boutique en ligne", "le formulaire", "l'atelier", "le premier chapitre", "la lettre d'information",
  "le budget prévisionnel", "l'association", "le jardin partagé", "la mairie", "le marché couvert", "l'équipe commerciale",
];
const VERBES = [
  "présente", "précise", "décrit", "rassemble", "met en avant", "prépare", "accompagne", "simplifie", "complète",
  "organise", "propose", "résume", "facilite", "détaille", "annonce", "améliore", "examine", "rappelle",
];
const COMPLEMENTS = [
  "les grandes étapes du chantier", "les horaires d'ouverture", "un calendrier plus souple", "les résultats du trimestre",
  "plusieurs pistes de travail", "les questions les plus fréquentes", "une offre adaptée à chacun", "les modalités d'inscription",
  "le parcours des visiteurs", "les besoins des habitants", "un plan d'action concret", "les tarifs de la saison",
  "les nouveautés de l'automne", "la liste des intervenants", "les conditions de livraison", "un exemple de mise en page",
  "les règles de fonctionnement", "un premier bilan", "les choix retenus", "l'essentiel en quelques lignes",
];
const CIRCONSTANCES = [
  "dès la semaine prochaine", "avant la fin du mois", "pour la rentrée", "dans un souci de clarté", "à titre d'exemple",
  "en accord avec les partenaires", "sans engagement", "au fil des saisons", "selon les disponibilités", "pour chaque quartier",
  "depuis le début de l'année", "avec l'aide des bénévoles", "à partir du printemps", "dans les meilleurs délais",
];
const LIENS = ["Par ailleurs,", "En outre,", "Ensuite,", "De plus,", "Enfin,", "Dans ce cadre,", "Pour l'instant,", "En pratique,"];
const SECONDES = [
  "afin que chacun puisse s'y retrouver", "pour que la lecture reste simple", "tout en laissant la place aux remarques",
  "ce qui permet d'avancer sereinement", "même si quelques points restent à préciser", "comme convenu lors de la dernière réunion",
  "sans changer l'organisation actuelle", "pour mieux répondre aux demandes",
];

const phraseFrancaise = (r: Hasard) => {
  const modele = entre(r, 0, 3);
  const s = pioche(r, SUJETS);
  const v = pioche(r, VERBES);
  const c = pioche(r, COMPLEMENTS);
  let p: string;
  if (modele === 0) p = `${s} ${v} ${c} ${pioche(r, CIRCONSTANCES)}`;
  else if (modele === 1) p = `${pioche(r, LIENS)} ${s} ${v} ${c}, ${pioche(r, SECONDES)}`;
  else if (modele === 2) p = `${capitale(pioche(r, CIRCONSTANCES))}, ${s} ${v} ${c}`;
  else p = `${s} ${v} ${c}`;
  return capitale(p) + ".";
};

export type Unite = "paragraphes" | "phrases" | "mots";
export interface OptionsLorem {
  unite: Unite;
  nombre: number;
  commencerClassique: boolean; // « Lorem ipsum dolor sit amet… » en tête (latin seulement)
  langue: "latin" | "francais";
  graine: number;
}

/** Renvoie une liste de paragraphes (un seul pour « phrases » et « mots »). */
export const genererLorem = (o: OptionsLorem): string[] => {
  const r = prng(o.graine);
  const latin = o.langue === "latin";
  const phrase = () => (latin ? phraseLatine(r) : phraseFrancaise(r));
  if (o.unite === "mots") {
    const vocab = latin ? LATIN : null;
    const mots: string[] = [];
    if (latin && o.commencerClassique) mots.push(..."lorem ipsum dolor sit amet".split(" "));
    while (mots.length < o.nombre) {
      if (vocab) mots.push(pioche(r, vocab));
      else mots.push(...phrase().replace(/[.,]/g, "").toLowerCase().split(" "));
    }
    const t = mots.slice(0, o.nombre).join(" ");
    return [capitale(t) + "."];
  }
  if (o.unite === "phrases") {
    const ph = Array.from({ length: o.nombre }, phrase);
    if (latin && o.commencerClassique && ph.length) ph[0] = DEBUT_LOREM;
    return [ph.join(" ")];
  }
  const paras = Array.from({ length: o.nombre }, () => Array.from({ length: entre(r, 4, 7) }, phrase));
  if (latin && o.commencerClassique && paras.length) paras[0][0] = DEBUT_LOREM;
  return paras.map((p) => p.join(" "));
};

export const enHtml = (paras: string[]) =>
  paras.map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("\n");
