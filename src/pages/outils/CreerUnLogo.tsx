import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Code,
  Coffee,
  Dumbbell,
  Flower2,
  Hammer,
  Heart,
  House,
  Leaf,
  LucideIcon,
  Mountain,
  Music,
  Paintbrush,
  PawPrint,
  Rocket,
  Scissors,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Utensils,
  Wrench,
} from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { canvasVersBlob, telecharger } from "@/lib/fichiers";
import { libererCanvas, nouveauCanvas } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

/** Icônes proposées : identifiant, nom français, nom anglais, composant. */
const ICONES: [string, string, string, LucideIcon][] = [
  ["feuille", "Feuille", "Leaf", Leaf],
  ["fleur", "Fleur", "Flower", Flower2],
  ["soleil", "Soleil", "Sun", Sun],
  ["montagne", "Montagne", "Mountain", Mountain],
  ["maison", "Maison", "House", House],
  ["outil", "Clé", "Spanner", Wrench],
  ["marteau", "Marteau", "Hammer", Hammer],
  ["pinceau", "Pinceau", "Paintbrush", Paintbrush],
  ["ciseaux", "Ciseaux", "Scissors", Scissors],
  ["cafe", "Café", "Coffee", Coffee],
  ["couverts", "Couverts", "Cutlery", Utensils],
  ["coeur", "Cœur", "Heart", Heart],
  ["etoile", "Étoile", "Star", Star],
  ["etincelles", "Étincelles", "Sparkles", Sparkles],
  ["appareil", "Appareil photo", "Camera", Camera],
  ["musique", "Musique", "Music", Music],
  ["sport", "Haltère", "Dumbbell", Dumbbell],
  ["sante", "Stéthoscope", "Stethoscope", Stethoscope],
  ["livre", "Livre", "Book", BookOpen],
  ["code", "Code", "Code", Code],
  ["sac", "Boutique", "Shop", ShoppingBag],
  ["voiture", "Voiture", "Car", Car],
  ["patte", "Patte", "Paw", PawPrint],
  ["fusee", "Fusée", "Rocket", Rocket],
  ["mallette", "Mallette", "Briefcase", Briefcase],
];

/** Polices : valeur CSS, libellé français, libellé anglais. */
const POLICES: [string, string, string][] = [
  ["'Playfair Display', Georgia, serif", "Playfair Display (serif élégante)", "Playfair Display (elegant serif)"],
  ["Inter, Arial, sans-serif", "Inter (sans serif moderne)", "Inter (modern sans serif)"],
  ["Georgia, 'Times New Roman', serif", "Georgia (système)", "Georgia (system)"],
  ["'Times New Roman', Times, serif", "Times New Roman (système)", "Times New Roman (system)"],
  ["Arial, Helvetica, sans-serif", "Arial / Helvetica (système)", "Arial / Helvetica (system)"],
  ["Verdana, Geneva, sans-serif", "Verdana (système)", "Verdana (system)"],
  ["'Trebuchet MS', Arial, sans-serif", "Trebuchet MS (système)", "Trebuchet MS (system)"],
  ["'Courier New', Courier, monospace", "Courier New (système)", "Courier New (system)"],
];

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le logo créé ici m'appartient-il, puis-je l'utiliser pour mon entreprise ?",
      r: "Vous pouvez l'utiliser librement, y compris pour une activité commerciale : les icônes viennent de la bibliothèque libre Lucide (licence ISC) et Inter comme Playfair Display sont des polices libres. En revanche, une icône aussi répandue ne vous donne pas d'exclusivité : un concurrent peut utiliser la même. Si vous voulez protéger votre logo comme marque, faites-le retravailler pour qu'il soit distinctif avant de le déposer.",
    },
    {
      q: "Faut-il déposer mon logo à l'INPI avant de l'utiliser ?",
      r: "Ce n'est pas obligatoire pour s'en servir, mais c'est le dépôt qui protège la marque. Avant toute chose, vérifiez qu'elle n'empiète pas sur une marque existante : l'INPI met à disposition une base de recherche des marques françaises, européennes et internationales, qui ne donne qu'une recherche à l'identique, et recommande une recherche de similarités par ses documentalistes avant de déposer.",
    },
    {
      q: "SVG ou PNG, quel fichier donner à l'imprimeur ou au graphiste ?",
      r: "Le SVG est vectoriel : il reste net à toute taille et se modifie dans Inkscape ou Illustrator. Mais il nomme la police au lieu de la contenir ; ouvrez-le sur un poste où elle est installée, sinon une police de remplacement s'affiche. Le PNG est une image figée qui s'ouvre partout, avec la police d'origine ; prenez 3 000 pixels de large pour l'impression et 1 000 pour le web.",
    },
    {
      q: "Mon logo est illisible en favicon, que changer ?",
      r: "Un favicon s'affiche en 16 ou 32 pixels : le nom complet y devient une ligne grise. Utilisez seulement l'icône ou le monogramme, avec le bouton « Icône carrée 512 px », et vérifiez les aperçus en petit sous le logo. Évitez les icônes trop détaillées et augmentez l'épaisseur du trait. Un contraste fort entre l'icône et le fond compte plus que la couleur exacte.",
    },
    {
      q: "Quelle largeur de PNG choisir pour imprimer mon logo sur une enseigne ou un flyer ?",
      r: "Comptez 300 pixels par pouce, soit environ 118 pixels par centimètre imprimé. Un logo de 8 cm de large sur un flyer demande donc près de 950 pixels, et le PNG de 3 000 pixels couvre 25 cm de large en pleine qualité. Pour une enseigne ou une bâche de plus d'un mètre, donnez plutôt le SVG à l'imprimeur, qui l'agrandit sans perte.",
    },
    {
      q: "Je ferme la page, mon logo sera-t-il conservé pour le modifier plus tard ?",
      r: "Non. Rien n'est enregistré, ni sur un serveur ni dans un compte : c'est ce qui permet de s'en servir sans inscription. Notez vos réglages (police, icône, codes couleur en hexadécimal affichés par le sélecteur) et gardez le fichier SVG, qui reste modifiable dans Inkscape, logiciel libre. Vous pourrez ainsi refaire ou ajuster le logo en deux minutes.",
    },
  ],
  en: [
    {
      q: "Can I use the logo for my business in France, and is it really mine?",
      r: "You can use it freely, including for a commercial activity run as a micro-entreprise (sole trader): the icons come from the open-source Lucide library (ISC licence) and Inter and Playfair Display are free fonts. A common library icon gives you no exclusivity, though: a competitor may use the same one. If you want to protect the logo as a trademark, have it reworked into something distinctive before filing it.",
    },
    {
      q: "Do I need to register my logo with the INPI before using it?",
      r: "No, the INPI (the French intellectual property office) is not a step you must take to use a logo, but filing it there is what protects it as a trademark. First check that it does not clash with an existing mark: the INPI database covers French, EU and international trademarks, but only finds identical marks. Before filing, the INPI recommends a similarity search by its own research staff.",
    },
    {
      q: "Should I send the printer an SVG or a PNG file?",
      r: "The SVG is a vector file: it stays sharp at any size and can be edited in Inkscape or Illustrator, but it names the font instead of embedding it, so open it on a computer where that font is installed. The PNG is a fixed image that opens anywhere with the original font. Choose 3,000 pixels wide for print and 1,000 pixels for the web.",
    },
    {
      q: "What do I use as a favicon if the full logo is unreadable at that size?",
      r: "A favicon is shown at 16 or 32 pixels, where a full name turns into a grey line. Use only the icon or the monogram with the \"512 px square icon\" button, and check the small previews under the logo. Google asks for a square favicon of at least 8 × 8 pixels and recommends larger than 48 × 48, so 512 pixels leaves plenty of margin.",
    },
    {
      q: "Will my logo be saved if I close the page?",
      r: "No. Nothing is stored on a server or in an account, which is why no sign-up is needed. Write down your settings (font, icon and the hex colour codes shown by the colour picker) and keep the SVG file, which you can still edit in Inkscape, a free program. That way you can rebuild or tweak the logo in a couple of minutes.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "INPI", titre: "Rechercher une marque (base marques)", url: "https://www.inpi.fr/ressources/propriete-intellectuelle/rechercher-une-marque-base-marques", lu: "27 octobre 2026" },
    { editeur: "INPI", titre: "Disponibilité d'une marque, d'un logo, d'un nom de société, d'un nom de domaine", url: "https://www.inpi.fr/services-et-prestations-domaine/disponibilite-dune-marque-dun-logo-dun-nom-de-societe-dun-nom-de", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Scalable Vector Graphics (SVG) 2", url: "https://www.w3.org/TR/SVG2/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 octobre 2026" },
    { editeur: "Google Search Central", titre: "Définir le favicon du site Web pour les résultats de recherche", url: "https://developers.google.com/search/docs/appearance/favicon-in-search", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "INPI", titre: "Rechercher une marque, base marques (Search the trademark database)", url: "https://www.inpi.fr/ressources/propriete-intellectuelle/rechercher-une-marque-base-marques", lu: "27 October 2026" },
    { editeur: "INPI", titre: "Disponibilité d'une marque, d'un logo, d'un nom de société, d'un nom de domaine (Availability checks)", url: "https://www.inpi.fr/services-et-prestations-domaine/disponibilite-dune-marque-dun-logo-dun-nom-de-societe-dun-nom-de", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Scalable Vector Graphics (SVG) 2", url: "https://www.w3.org/TR/SVG2/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 October 2026" },
    { editeur: "Google Search Central", titre: "Define a favicon to show in search results", url: "https://developers.google.com/search/docs/appearance/favicon-in-search", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Générateur de logo 75tools",
    motsCles: "créer un logo gratuit, générateur de logo en ligne, faire un logo, logo gratuit, créer logo entreprise, logo png transparent",
    nomDefaut: "Atelier Lumen",
    accrocheDefaut: "Céramique artisanale",
    vide: "Votre nom",
    nom: "Nom",
    accroche: "Accroche (facultatif)",
    apercu: "Aperçu du logo",
    petits: "Aperçu en petit : 48 px, 16 px et logo réduit",
    petitsTexte: "En petit : icône à 48 et 16 pixels, logo à 160 pixels de large.",
    carre: "Icône carrée 512 px",
    largeur: "Largeur du PNG",
    largeurs: ["(web, réseaux)", "(polyvalent)", "(impression)", "(grand format)"],
    fondFichier: "Fond du fichier",
    transparent: "Transparent",
    couleur: "Couleur",
    disposition: "Disposition",
    dispositions: { gauche: "Icône à gauche", dessus: "Icône au-dessus", monogramme: "Monogramme" },
    icone: "Icône",
    police: "Police",
    gras: "Nom en gras",
    capitales: "Accroche en capitales",
    mono: "Version noir et blanc",
    cNom: "Nom",
    cIcone: "Icône",
    cCercle: "Cercle",
    cAccroche: "Accroche",
    trait: "Épaisseur du trait de l'icône",
    noteSvg: "Le SVG nomme la police sans l'inclure : ouvrez-le sur un poste où elle est installée (Inter et Playfair Display sont libres et gratuites), sinon prenez le PNG.",
    prefixeIcone: "icone",
  },
  en: {
    nomAppli: "75tools logo maker",
    motsCles: "free logo maker, logo generator online, create a logo free, business logo, transparent png logo, svg logo",
    nomDefaut: "Lumen Studio",
    accrocheDefaut: "Handmade ceramics",
    vide: "Your name",
    nom: "Name",
    accroche: "Tagline (optional)",
    apercu: "Logo preview",
    petits: "Small previews: 48 px, 16 px and reduced logo",
    petitsTexte: "Small sizes: icon at 48 and 16 pixels, logo 160 pixels wide.",
    carre: "512 px square icon",
    largeur: "PNG width",
    largeurs: ["(web, social media)", "(all-purpose)", "(print)", "(large format)"],
    fondFichier: "File background",
    transparent: "Transparent",
    couleur: "Colour",
    disposition: "Layout",
    dispositions: { gauche: "Icon on the left", dessus: "Icon on top", monogramme: "Monogram" },
    icone: "Icon",
    police: "Font",
    gras: "Bold name",
    capitales: "Tagline in capitals",
    mono: "Black and white version",
    cNom: "Name",
    cIcone: "Icon",
    cCercle: "Circle",
    cAccroche: "Tagline",
    trait: "Icon stroke width",
    noteSvg: "The SVG names the font without embedding it: open it on a computer where the font is installed (Inter and Playfair Display are free), or use the PNG.",
    prefixeIcone: "icon",
  },
};

type Disposition = "gauche" | "dessus" | "monogramme";

type Element =
  | { t: "texte"; x: number; y: number; taille: number; graisse: number; police: string; couleur: string; texte: string; ancre: "start" | "middle" }
  | { t: "icone"; x: number; y: number; taille: number }
  | { t: "cercle"; cx: number; cy: number; r: number; couleur: string };

interface Reglages {
  nom: string;
  accroche: string;
  police: string;
  gras: boolean;
  capitales: boolean;
  disposition: Disposition;
  cTexte: string;
  cIcone: string;
  cAccroche: string;
  trait: number;
  mono: boolean;
}


const initiales = (nom: string) =>
  nom
    .trim()
    .split(/[\s\-']+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0])
    .join("")
    .toUpperCase() || "A";

/** Mise en page en unités abstraites (corps du nom = 100), commune au canvas et au SVG. */
function mettreEnPage(ctx: CanvasRenderingContext2D, r: Reglages, vide = "Votre nom") {
  const N = 100;
  const T = 34;
  const gN = r.gras ? 600 : 400;
  const nom = r.nom.trim() || vide;
  const acc = r.capitales ? r.accroche.trim().toUpperCase() : r.accroche.trim();
  const cT = r.mono ? "#000000" : r.cTexte;
  const cI = r.mono ? "#000000" : r.cIcone;
  const cA = r.mono ? "#000000" : r.cAccroche;
  const mesure = (texte: string, taille: number, g: number) => {
    ctx.font = `${g} ${taille}px ${r.police}`;
    const m = ctx.measureText(texte);
    return { l: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent };
  };
  const mN = mesure(nom, N, gN);
  const mA = acc ? mesure(acc, T, 400) : { l: 0, asc: 0, desc: 0 };
  const els: Element[] = [];
  const texte = (t: string, x: number, y: number, taille: number, g: number, couleur: string, ancre: "start" | "middle") =>
    els.push({ t: "texte", x, y, taille, graisse: g, police: r.police, couleur, texte: t, ancre });
  const hNom = 0.74 * N; // hauteur visuelle d'une capitale, pour un alignement stable
  const ecartAcc = 0.32 * N;
  const hBloc = hNom + (acc ? ecartAcc + 0.72 * T : 0) + 0.2 * N;
  let l = 0;
  let h = 0;

  if (r.disposition === "gauche") {
    const I = Math.max(1.15 * N, hBloc);
    const G = 0.3 * N;
    els.push({ t: "icone", x: 0, y: 0, taille: I });
    const y0 = (I - (hNom + (acc ? ecartAcc + 0.72 * T : 0))) / 2;
    texte(nom, I + G, y0 + hNom, N, gN, cT, "start");
    if (acc) texte(acc, I + G + 2, y0 + hNom + ecartAcc + 0.72 * T, T, 400, cA, "start");
    l = I + G + Math.max(mN.l, mA.l + 2);
    h = I;
  } else {
    const largeurTexte = Math.max(mN.l, mA.l);
    const D = r.disposition === "dessus" ? 1.4 * N : 1.7 * N;
    l = Math.max(D, largeurTexte);
    const cx = l / 2;
    if (r.disposition === "dessus") els.push({ t: "icone", x: cx - D / 2, y: 0, taille: D });
    else {
      els.push({ t: "cercle", cx, cy: D / 2, r: D / 2, couleur: cI });
      const ini = initiales(nom);
      const mI = mesure(ini, 0.72 * N, 600);
      texte(ini, cx, D / 2 + (mI.asc - mI.desc) / 2, 0.72 * N, 600, "#ffffff", "middle");
    }
    const yNom = D + 0.32 * N + hNom;
    texte(nom, cx, yNom, N, gN, cT, "middle");
    h = yNom + 0.22 * N;
    if (acc) {
      texte(acc, cx, yNom + ecartAcc + 0.72 * T, T, 400, cA, "middle");
      h = yNom + ecartAcc + 0.72 * T + 0.3 * T;
    }
  }
  return { els, l, h, cI };
}

const echapper = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");


const CreerUnLogo = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [r, setR] = useState<Reglages>({
    nom: t.nomDefaut,
    accroche: t.accrocheDefaut,
    police: POLICES[0][0],
    gras: true,
    capitales: true,
    disposition: "gauche",
    cTexte: "#1f2937",
    cIcone: "#0e7490",
    cAccroche: "#6b7280",
    trait: 2,
    mono: false,
  });
  const [icone, setIcone] = useState("feuille");
  const [fond, setFond] = useState<"transparent" | "couleur">("transparent");
  const [cFond, setCFond] = useState("#ffffff");
  const [largeurPng, setLargeurPng] = useState(2000);
  const [policesPretes, setPolicesPretes] = useState(0);
  const [iconeImg, setIconeImg] = useState<HTMLImageElement | null>(null);

  const apercu = useRef<HTMLCanvasElement>(null);
  const petits = useRef<HTMLCanvasElement>(null);
  const cache = useRef<HTMLDivElement>(null);
  const maj = <K extends keyof Reglages>(k: K) => (v: Reglages[K]) => setR((x) => ({ ...x, [k]: v }));

  const couleurIcone = r.mono ? "#000000" : r.cIcone;
  const Icone = (ICONES.find((i) => i[0] === icone) ?? ICONES[0])[3];

  // Tracés de l'icône choisie, lus dans le rendu caché de lucide-react.
  const [traces, setTraces] = useState("");
  useEffect(() => {
    setTraces(cache.current?.querySelector("svg")?.innerHTML ?? "");
  }, [icone]);
  const svgIcone = useMemo(
    () =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${couleurIcone}" stroke-width="${r.trait}" stroke-linecap="round" stroke-linejoin="round">${traces}</svg>`,
    [traces, couleurIcone, r.trait]
  );
  useEffect(() => {
    if (!traces) return;
    let actif = true;
    const img = new Image();
    img.onload = () => actif && setIconeImg(img);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgIcone);
    return () => {
      actif = false;
    };
  }, [svgIcone, traces]);

  // Polices : on attend qu'elles soient chargées avant de mesurer et de dessiner.
  useEffect(() => {
    let actif = true;
    const g = r.gras ? 600 : 400;
    Promise.all([document.fonts.load(`${g} 100px ${r.police}`, r.nom), document.fonts.load(`400 34px ${r.police}`, r.accroche)])
      .catch(() => null)
      .then(() => document.fonts.ready)
      .then(() => actif && setPolicesPretes((n) => n + 1));
    return () => {
      actif = false;
    };
  }, [r.police, r.gras, r.nom, r.accroche]);

  /** Dessine le logo sur un canvas de la largeur voulue. */
  const rendre = (largeur: number, avecFond: boolean): HTMLCanvasElement => {
    const mesureCtx = nouveauCanvas(1, 1).getContext("2d")!;
    const m = mettreEnPage(mesureCtx, r, t.vide);
    const marge = 0.3 * 100;
    const lu = m.l + 2 * marge;
    const hu = m.h + 2 * marge;
    const k = largeur / lu;
    const c = nouveauCanvas(largeur, Math.round(hu * k));
    const ctx = c.getContext("2d")!;
    if (avecFond) {
      ctx.fillStyle = cFond;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.scale(k, k);
    ctx.translate(marge, marge);
    for (const e of m.els) {
      if (e.t === "texte") {
        ctx.font = `${e.graisse} ${e.taille}px ${e.police}`;
        ctx.fillStyle = e.couleur;
        ctx.textAlign = e.ancre === "middle" ? "center" : "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(e.texte, e.x, e.y);
      } else if (e.t === "cercle") {
        ctx.fillStyle = e.couleur;
        ctx.beginPath();
        ctx.arc(e.cx, e.cy, e.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (iconeImg) {
        ctx.drawImage(iconeImg, e.x, e.y, e.taille, e.taille);
      }
    }
    return c;
  };

  /** Icône seule (ou monogramme) dans un carré, pour favicon et photo de profil. */
  const rendreCarre = (cote: number, avecFond: boolean): HTMLCanvasElement => {
    const c = nouveauCanvas(cote, cote);
    const ctx = c.getContext("2d")!;
    if (avecFond) {
      ctx.fillStyle = cFond;
      ctx.fillRect(0, 0, cote, cote);
    }
    if (r.disposition === "monogramme") {
      ctx.fillStyle = couleurIcone;
      ctx.beginPath();
      ctx.arc(cote / 2, cote / 2, cote * 0.48, 0, Math.PI * 2);
      ctx.fill();
      const taille = cote * 0.42;
      ctx.font = `600 ${taille}px ${r.police}`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      const ini = initiales(r.nom);
      const mI = ctx.measureText(ini);
      ctx.fillText(ini, cote / 2, cote / 2 + (mI.actualBoundingBoxAscent - mI.actualBoundingBoxDescent) / 2);
    } else if (iconeImg) {
      const m = cote * 0.08;
      ctx.drawImage(iconeImg, m, m, cote - 2 * m, cote - 2 * m);
    }
    return c;
  };

  // Aperçu et vignettes en petit.
  useEffect(() => {
    const c = apercu.current;
    if (!c) return;
    const source = rendre(1200, fond === "couleur");
    c.width = source.width;
    c.height = source.height;
    c.getContext("2d")!.drawImage(source, 0, 0);
    libererCanvas(source);
    const p = petits.current;
    if (p) {
      const ctx = p.getContext("2d")!;
      ctx.clearRect(0, 0, p.width, p.height);
      ctx.fillStyle = fond === "couleur" ? cFond : "#ffffff";
      ctx.fillRect(0, 0, p.width, p.height);
      const g = rendreCarre(48, false);
      const s = rendreCarre(16, false);
      ctx.drawImage(g, 8, 8);
      ctx.drawImage(s, 72, 24);
      const tr = rendre(160, false);
      ctx.drawImage(tr, 104, Math.max(0, 32 - tr.height / 2));
      [g, s, tr].forEach(libererCanvas);
    }
  });

  const nomFichier =
    (r.nom.trim() || "logo")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "logo";

  const png = async () => {
    await document.fonts.ready;
    const c = rendre(largeurPng, fond === "couleur");
    telecharger(`logo-${nomFichier}-${largeurPng}px.png`, await canvasVersBlob(c, "image/png"));
    libererCanvas(c);
  };
  const carre = async () => {
    await document.fonts.ready;
    const c = rendreCarre(512, fond === "couleur");
    telecharger(`${t.prefixeIcone}-${nomFichier}-512px.png`, await canvasVersBlob(c, "image/png"));
    libererCanvas(c);
  };
  const svg = () => {
    const m = mettreEnPage(nouveauCanvas(1, 1).getContext("2d")!, r, t.vide);
    const marge = 30;
    const lu = Math.ceil(m.l + 2 * marge);
    const hu = Math.ceil(m.h + 2 * marge);
    const parties = m.els.map((e) => {
      if (e.t === "texte")
        return `<text x="${e.x.toFixed(2)}" y="${e.y.toFixed(2)}" font-family="${echapper(e.police)}" font-size="${e.taille}" font-weight="${e.graisse}" fill="${e.couleur}"${e.ancre === "middle" ? ' text-anchor="middle"' : ""}>${echapper(e.texte)}</text>`;
      if (e.t === "cercle") return `<circle cx="${e.cx.toFixed(2)}" cy="${e.cy.toFixed(2)}" r="${e.r.toFixed(2)}" fill="${e.couleur}"/>`;
      return `<svg x="${e.x.toFixed(2)}" y="${e.y.toFixed(2)}" width="${e.taille.toFixed(2)}" height="${e.taille.toFixed(2)}" viewBox="0 0 24 24" fill="none" stroke="${couleurIcone}" stroke-width="${r.trait}" stroke-linecap="round" stroke-linejoin="round">${traces}</svg>`;
    });
    const contenu = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${lu * 4}" height="${hu * 4}" viewBox="0 0 ${lu} ${hu}">
${fond === "couleur" ? `<rect width="100%" height="100%" fill="${cFond}"/>\n` : ""}<g transform="translate(${marge} ${marge})">
${parties.join("\n")}
</g>
</svg>
`;
    telecharger(`logo-${nomFichier}.svg`, new Blob([contenu], { type: "image/svg+xml" }));
  };

  const couleur = (id: string, libelle: string, valeur: string, set: (v: string) => void) => (
    <label htmlFor={id} className="flex items-center gap-3 h-12 px-3 rounded-md border border-neutral-700 text-sm text-neutral-300 cursor-pointer min-w-0">
      <input id={id} type="color" value={valeur} onChange={(e) => set(e.target.value)} className="w-12 h-12 bg-transparent shrink-0" />
      <span className="truncate">{libelle}</span>
    </label>
  );

  const outil = (
    <div id="logo-outil" className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] items-start" data-polices={policesPretes}>
      {/* Premiers champs : à droite sur ordinateur, en tête sur téléphone. */}
      <div className="min-w-0 space-y-4 lg:col-start-2 lg:row-start-1">
        <label className="block" htmlFor="logo-nom">
          <span className="block text-sm text-neutral-300 mb-1">{t.nom}</span>
          <input id="logo-nom" value={r.nom} maxLength={40} onChange={(e) => maj("nom")(e.target.value)} className={classeChamp} />
        </label>
        <label className="block" htmlFor="logo-accroche">
          <span className="block text-sm text-neutral-300 mb-1">{t.accroche}</span>
          <input id="logo-accroche" value={r.accroche} maxLength={60} onChange={(e) => maj("accroche")(e.target.value)} className={classeChamp} />
        </label>
      </div>

      {/* Aperçu et téléchargements : colonne de gauche sur ordinateur, juste sous les premiers champs sur téléphone. */}
      <div data-resultat className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
        <div
          className={`rounded-lg border border-neutral-800 p-4 sm:p-8 flex justify-center ${fond === "couleur" ? "" : "bg-white"}`}
          style={fond === "couleur" ? { background: cFond } : undefined}
        >
          <canvas ref={apercu} id="logo-apercu" aria-label={t.apercu} className="max-w-full h-auto max-h-60 lg:max-h-80 min-w-0" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
          <canvas ref={petits} width={280} height={64} className="rounded border border-neutral-800 shrink-0 max-w-full" aria-label={t.petits} />
          <p className="text-xs text-neutral-500 min-w-0 flex-1 basis-40">{t.petitsTexte}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={png}>PNG {nb(largeurPng)} px</Bouton>
          <Bouton secondaire onClick={svg}>
            SVG
          </Bouton>
          <Bouton secondaire onClick={carre}>
            {t.carre}
          </Bouton>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0" htmlFor="logo-largeur">
            <span className="block text-sm text-neutral-300 mb-1">{t.largeur}</span>
            <select id="logo-largeur" value={largeurPng} onChange={(e) => setLargeurPng(Number(e.target.value))} className={classeSelect}>
              {[1000, 2000, 3000, 5000].map((v, i) => (
                <option key={v} value={v}>
                  {nb(v)} px {t.largeurs[i]}
                </option>
              ))}
            </select>
          </label>
          <div className="min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.fondFichier}</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={fond === "transparent"}
                onClick={() => setFond("transparent")}
                className={`h-12 rounded-md border text-sm ${fond === "transparent" ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-300"}`}
              >
                {t.transparent}
              </button>
              {couleur("logo-fond", t.couleur, cFond, (v) => {
                setCFond(v);
                setFond("couleur");
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Autres réglages. */}
      <div className="min-w-0 space-y-4 lg:col-start-2 lg:row-start-2">
        <div>
          <span className="block text-sm text-neutral-300 mb-1">{t.disposition}</span>
          <div role="group" aria-label={t.disposition} className="grid grid-cols-3 gap-2">
            {(["gauche", "dessus", "monogramme"] as Disposition[]).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={r.disposition === v}
                onClick={() => maj("disposition")(v)}
                className={`h-12 px-1 rounded-md border text-xs min-[360px]:text-sm leading-tight hyphens-auto ${r.disposition === v ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
              >
                {t.dispositions[v]}
              </button>
            ))}
          </div>
        </div>

        {r.disposition !== "monogramme" && (
          <fieldset>
            <legend className="block text-sm text-neutral-300 mb-1">{t.icone}</legend>
            <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-5 gap-2">
              {ICONES.map(([id, fr, en, I]) => {
                const nomIcone = lang === "en" ? en : fr;
                return (
                  <button
                    key={id}
                    type="button"
                    title={nomIcone}
                    aria-label={nomIcone}
                    aria-pressed={icone === id}
                    onClick={() => setIcone(id)}
                    className={`h-12 rounded-md border grid place-items-center ${icone === id ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-400 hover:text-white"}`}
                  >
                    <I className="w-6 h-6" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <label className="block" htmlFor="logo-police">
          <span className="block text-sm text-neutral-300 mb-1">{t.police}</span>
          <select id="logo-police" value={r.police} onChange={(e) => maj("police")(e.target.value)} className={classeSelect}>
            {POLICES.map(([v, fr, en]) => (
              <option key={v} value={v}>
                {lang === "en" ? en : fr}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={r.gras} onChange={(e) => maj("gras")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
            {t.gras}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={r.capitales} onChange={(e) => maj("capitales")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
            {t.capitales}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={r.mono} onChange={(e) => maj("mono")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
            {t.mono}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
          {couleur("logo-c-texte", t.cNom, r.cTexte, maj("cTexte"))}
          {couleur("logo-c-icone", r.disposition === "monogramme" ? t.cCercle : t.cIcone, r.cIcone, maj("cIcone"))}
          {couleur("logo-c-accroche", t.cAccroche, r.cAccroche, maj("cAccroche"))}
        </div>

        {r.disposition !== "monogramme" && (
          <label className="block" htmlFor="logo-trait">
            <span className="flex justify-between text-sm text-neutral-300">
              <span>{t.trait}</span>
              <span className="tabular-nums text-neutral-100">{nb(r.trait)}</span>
            </span>
            <input id="logo-trait" type="range" min={1} max={3} step={0.25} value={r.trait} onChange={(e) => maj("trait")(Number(e.target.value))} className="w-full h-10 accent-sky-400" />
          </label>
        )}
        <p className="text-xs text-neutral-500">{t.noteSvg}</p>
      </div>

      <div ref={cache} className="hidden" aria-hidden="true">
        <Icone />
      </div>
    </div>
  );

  return (
    <PageOutil
      id="creer-un-logo"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="DesignApplication"
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
    <Section titre="Créer un logo gratuit en deux minutes, sans compte ni filigrane">
      <p>
        Pour créer un logo gratuit, tapez le nom de votre activité dans le premier champ, ajoutez une accroche si
        vous le souhaitez, choisissez une des 25 icônes ou un monogramme de vos initiales, une police et trois
        couleurs : l'aperçu se redessine à chaque réglage, avec ses versions en petit (48 et 16 pixels). Vous
        téléchargez ensuite un PNG transparent de 1 000 à 5 000 pixels de large, un SVG vectoriel modifiable ou une
        icône carrée de 512 pixels pour le favicon et la photo de profil. Un artisan, un indépendant ou une
        association obtient ainsi un logo utilisable sur une facture, une carte de visite ou un site en deux minutes,
        sans inscription, sans filigrane et sans que rien ne soit envoyé. La limite principale : c'est un logo
        typographique simple, bâti sur des icônes libres que d'autres peuvent utiliser ; il ne remplace pas le
        travail d'un graphiste si vous voulez un signe distinctif à déposer comme marque.
      </p>
    </Section>

    <Section titre="Ce que fait le générateur, et pour qui">
      <p>
        Le générateur assemble un <strong>logo typographique</strong> : le nom de votre activité dans une police
        choisie, une accroche facultative, et une icône simple ou un monogramme de vos initiales dans un cercle.
        C'est la forme de logo la plus courante chez les artisans, indépendants, commerces de proximité et
        associations, et la plus facile à décliner : en-tête de facture, carte de visite, enseigne, réseaux sociaux.
      </p>
      <p>
        Trois dispositions sont proposées. <strong>Icône à gauche</strong>, pour un logo horizontal qui tient dans
        un en-tête de site ou une signature d'e-mail. <strong>Icône au-dessus</strong>, plus compact et centré, adapté
        à une enseigne, un tampon ou une étiquette. <strong>Monogramme</strong>, deux initiales dans un cercle de
        couleur, qui sert aussi de photo de profil et de favicon. Les icônes viennent de la bibliothèque libre
        Lucide ; Inter et Playfair Display sont des polices libres, les autres sont celles de votre système.
      </p>
    </Section>

    <Section titre="Un logo qui fonctionne partout">
      <h3>Lisible en petit</h3>
      <p>
        Un logo passe la plupart de son temps en petit : coin d'un document, onglet du navigateur, photo de profil
        ronde de 40 pixels. Les vignettes sous l'aperçu montrent ce que devient le vôtre à 48 et 16 pixels. Si le nom
        n'est plus lisible à 160 pixels de large, raccourcissez l'accroche ou passez à une police sans serif.
      </p>
      <h3>Une icône pour le favicon</h3>
      <p>
        Le favicon, la petite image de l'onglet et des résultats de recherche, ne peut pas contenir un nom entier.
        Google demande un carré d'au moins 8 × 8 pixels et conseille plus de 48 × 48 : le bouton « Icône carrée
        512 px » exporte l'icône seule ou le monogramme à une taille confortable, que les outils de création de site
        réduisent ensuite.
      </p>
      <h3>Une déclinaison noir et blanc</h3>
      <p>
        Cochez « Version noir et blanc » pour vérifier que le logo tient sans couleur : tampon, gravure, impression
        économique, broderie à une couleur. S'il ne reste lisible que grâce au contraste entre deux couleurs
        proches, revoyez-les.
      </p>
    </Section>

    <Section titre="Avant d'en faire votre marque">
      <p>
        Un nom et un logo ne vous appartiennent vraiment qu'après un dépôt de marque, et ce dépôt n'a de valeur que si
        personne ne détient déjà des droits sur un signe proche. La base de recherche de l'INPI couvre les marques
        françaises, européennes et internationales, mais ne trouve que les marques identiques : l'INPI recommande,
        avant un dépôt, une recherche de similarités auprès de ses documentalistes.
      </p>
      <p>
        Pour utiliser le logo tout de suite, il trouve sa place dans une{" "}
        <Link to="/signature-mail/">signature mail</Link>, sur un{" "}
        <Link to="/generateur-facture/">modèle de facture</Link> ou une{" "}
        <Link to="/modele-carte-de-visite/">carte de visite</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A free logo maker for a small business in France">
      <p>
        This free logo maker builds a text and icon logo in about two minutes: type your business name in the first
        field, add a tagline if you like, pick one of 25 icons or a monogram of your initials, a font and three
        colours. The preview redraws with every change, together with small versions at 48 and 16 pixels. You then
        download a transparent PNG from 1,000 to 5,000 pixels wide, an editable SVG vector file, or a 512 pixel
        square icon for a favicon or profile picture. A freelancer registered as a micro-entrepreneur (France's
        simplified self-employed status), a tradesperson or an association gets a logo ready for a French invoice, a
        business card or a website, with no sign-up, no watermark and nothing uploaded. The main limit: it is a simple
        typographic logo built on open-source icons that others can use too, so it does not replace a designer if you
        want a distinctive sign to register as a trademark.
      </p>
    </Section>

    <Section titre="What the logo maker builds">
      <p>
        The tool puts together a <strong>typographic logo</strong>: your business name in the font you choose, an
        optional tagline, and either a simple icon or your initials in a coloured circle. It is the most common kind
        of logo among tradespeople, freelancers, local shops and associations, and the easiest to reuse on an invoice
        header, a business card, a shop sign or social media.
      </p>
      <p>
        There are three layouts. <strong>Icon on the left</strong> gives a horizontal logo for a website header or an
        email signature. <strong>Icon on top</strong> is more compact and centred, suited to a sign, a stamp or a
        label. <strong>Monogram</strong> places two initials in a coloured circle, which doubles as a profile picture
        and a favicon. The icons come from the open-source Lucide library; Inter and Playfair Display are free fonts,
        the others are the ones on your system.
      </p>
    </Section>

    <Section titre="A logo that works everywhere">
      <h3>Readable when small</h3>
      <p>
        A logo spends most of its life small: the corner of a document, a browser tab, a 40 pixel round profile
        picture. The thumbnails under the preview show yours at 48 and 16 pixels. If the name is no longer readable
        at 160 pixels wide, shorten the tagline or switch to a sans serif font.
      </p>
      <h3>An icon for the favicon</h3>
      <p>
        A favicon, the small image in the tab and in search results, cannot hold a whole name. Google asks for a
        square of at least 8 × 8 pixels and recommends more than 48 × 48, so the "512 px square icon" button exports
        the icon or monogram at a comfortable size that website builders then scale down.
      </p>
      <h3>A black and white version</h3>
      <p>
        Tick "Black and white version" to check that the logo works without colour: a rubber stamp, engraving,
        cheap printing or one-colour embroidery. If it only reads thanks to two close colours, rethink them.
      </p>
    </Section>

    <Section titre="Before it becomes your trademark">
      <p>
        In France, a name and a logo are only really yours once filed as a trademark with the INPI, the national
        intellectual property office, and that filing only holds if nobody already has rights to a similar sign. The
        INPI database covers French, EU and international trademarks but only finds identical ones; before filing,
        the INPI recommends a similarity search by its research staff.
      </p>
      <p>
        To use the logo straight away, add it to an <Link to="/en/email-signature/">email signature</Link>, a{" "}
        <Link to="/en/invoice-generator/">French invoice</Link> or a{" "}
        <Link to="/en/business-card-templates/">business card</Link>.
      </p>
    </Section>
  </>
);

export default CreerUnLogo;
