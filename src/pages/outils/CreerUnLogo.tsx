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
import { Bouton, Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { canvasVersBlob, telecharger } from "@/lib/fichiers";
import { libererCanvas, nouveauCanvas } from "@/lib/image-lot";

const ICONES: [string, string, LucideIcon][] = [
  ["feuille", "Feuille", Leaf],
  ["fleur", "Fleur", Flower2],
  ["soleil", "Soleil", Sun],
  ["montagne", "Montagne", Mountain],
  ["maison", "Maison", House],
  ["outil", "Clé", Wrench],
  ["marteau", "Marteau", Hammer],
  ["pinceau", "Pinceau", Paintbrush],
  ["ciseaux", "Ciseaux", Scissors],
  ["cafe", "Café", Coffee],
  ["couverts", "Couverts", Utensils],
  ["coeur", "Cœur", Heart],
  ["etoile", "Étoile", Star],
  ["etincelles", "Étincelles", Sparkles],
  ["appareil", "Appareil photo", Camera],
  ["musique", "Musique", Music],
  ["sport", "Haltère", Dumbbell],
  ["sante", "Stéthoscope", Stethoscope],
  ["livre", "Livre", BookOpen],
  ["code", "Code", Code],
  ["sac", "Boutique", ShoppingBag],
  ["voiture", "Voiture", Car],
  ["patte", "Patte", PawPrint],
  ["fusee", "Fusée", Rocket],
  ["mallette", "Mallette", Briefcase],
];

const POLICES: [string, string][] = [
  ["'Playfair Display', Georgia, serif", "Playfair Display (serif élégante)"],
  ["Inter, Arial, sans-serif", "Inter (sans serif moderne)"],
  ["Georgia, 'Times New Roman', serif", "Georgia (système)"],
  ["'Times New Roman', Times, serif", "Times New Roman (système)"],
  ["Arial, Helvetica, sans-serif", "Arial / Helvetica (système)"],
  ["Verdana, Geneva, sans-serif", "Verdana (système)"],
  ["'Trebuchet MS', Arial, sans-serif", "Trebuchet MS (système)"],
  ["'Courier New', Courier, monospace", "Courier New (système)"],
];

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

const FAQ: QuestionFaq[] = [
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
];

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
function mettreEnPage(ctx: CanvasRenderingContext2D, r: Reglages) {
  const N = 100;
  const T = 34;
  const gN = r.gras ? 600 : 400;
  const nom = r.nom.trim() || "Votre nom";
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

const CreerUnLogo = () => {
  const [r, setR] = useState<Reglages>({
    nom: "Atelier Lumen",
    accroche: "Céramique artisanale",
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
  const Icone = (ICONES.find((i) => i[0] === icone) ?? ICONES[0])[2];

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
    const m = mettreEnPage(mesureCtx, r);
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
      const t = cote * 0.42;
      ctx.font = `600 ${t}px ${r.police}`;
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
      const t = rendre(160, false);
      ctx.drawImage(t, 104, Math.max(0, 32 - t.height / 2));
      [g, s, t].forEach(libererCanvas);
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
    telecharger(`icone-${nomFichier}-512px.png`, await canvasVersBlob(c, "image/png"));
    libererCanvas(c);
  };
  const svg = () => {
    const m = mettreEnPage(nouveauCanvas(1, 1).getContext("2d")!, r);
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

  return (
    <PageOutil
      href="/creer-un-logo/"
      titre="Créer un logo gratuit en ligne : texte, icône, SVG et PNG"
      description="Créer un logo gratuit en ligne : nom, accroche, icône, police et couleurs, trois dispositions, export SVG et PNG transparent jusqu'à 5 000 px. Sans compte."
      motsCles="créer un logo gratuit, générateur de logo en ligne, faire un logo, logo gratuit, créer logo entreprise, logo png transparent"
      nomAppli="Générateur de logo"
      categorieAppli="DesignApplication"
      h1="Créer un logo texte et icône"
      chapeau="Tapez le nom de votre activité, choisissez une icône, une police et des couleurs : le logo se dessine en direct, et vous le téléchargez en SVG ou en PNG transparent, sans filigrane."
      faq={FAQ}
      sources={[
        {
          editeur: "INPI",
          titre: "Rechercher une marque (base marques)",
          url: "https://www.inpi.fr/ressources/propriete-intellectuelle/rechercher-une-marque-base-marques",
          lu: "27 octobre 2026",
        },
        {
          editeur: "INPI",
          titre: "Disponibilité d'une marque, d'un logo, d'un nom de société, d'un nom de domaine",
          url: "https://www.inpi.fr/services-et-prestations-domaine/disponibilite-dune-marque-dun-logo-dun-nom-de-societe-dun-nom-de",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <div id="logo-outil" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] items-start" data-polices={policesPretes}>
        <div className="min-w-0 space-y-3 lg:sticky lg:top-4">
          <div
            className={`rounded-lg border border-neutral-800 p-4 sm:p-8 flex justify-center ${
              fond === "couleur" ? "" : "bg-white"
            }`}
            style={fond === "couleur" ? { background: cFond } : undefined}
          >
            <canvas ref={apercu} id="logo-apercu" aria-label="Aperçu du logo" className="max-w-full h-auto max-h-80 min-w-0" />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <canvas ref={petits} width={280} height={64} className="rounded border border-neutral-800 shrink-0 max-w-full" aria-label="Aperçu en petit : 48 px, 16 px et logo réduit" />
            <p className="text-xs text-neutral-500 min-w-0 flex-1 basis-40">En petit : icône à 48 et 16 pixels, logo à 160 pixels de large.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={png}>PNG {largeurPng.toLocaleString("fr-FR")} px</Bouton>
            <Bouton secondaire onClick={svg}>
              SVG
            </Bouton>
            <Bouton secondaire onClick={carre}>
              Icône carrée 512 px
            </Bouton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block min-w-0" htmlFor="logo-largeur">
              <span className="block text-sm text-neutral-300 mb-1">Largeur du PNG</span>
              <select id="logo-largeur" value={largeurPng} onChange={(e) => setLargeurPng(Number(e.target.value))} className={classeSelect}>
                <option value={1000}>1 000 px (web, réseaux)</option>
                <option value={2000}>2 000 px (polyvalent)</option>
                <option value={3000}>3 000 px (impression)</option>
                <option value={5000}>5 000 px (grand format)</option>
              </select>
            </label>
            <div className="min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Fond du fichier</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={fond === "transparent"}
                  onClick={() => setFond("transparent")}
                  className={`h-12 rounded-md border text-sm ${fond === "transparent" ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-300"}`}
                >
                  Transparent
                </button>
                {couleur("logo-fond", "Couleur", cFond, (v) => {
                  setCFond(v);
                  setFond("couleur");
                })}
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Réglages du logo">
          <label className="block" htmlFor="logo-nom">
            <span className="block text-sm text-neutral-300 mb-1">Nom</span>
            <input id="logo-nom" value={r.nom} maxLength={40} onChange={(e) => maj("nom")(e.target.value)} className={classeChamp} />
          </label>
          <label className="block" htmlFor="logo-accroche">
            <span className="block text-sm text-neutral-300 mb-1">Accroche (facultatif)</span>
            <input id="logo-accroche" value={r.accroche} maxLength={60} onChange={(e) => maj("accroche")(e.target.value)} className={classeChamp} />
          </label>

          <div>
            <span className="block text-sm text-neutral-300 mb-1">Disposition</span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["gauche", "Icône à gauche"],
                  ["dessus", "Icône au-dessus"],
                  ["monogramme", "Monogramme"],
                ] as [Disposition, string][]
              ).map(([v, nom]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={r.disposition === v}
                  onClick={() => maj("disposition")(v)}
                  className={`h-12 px-1 rounded-md border text-sm leading-tight ${r.disposition === v ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
                >
                  {nom}
                </button>
              ))}
            </div>
          </div>

          {r.disposition !== "monogramme" && (
            <fieldset>
              <legend className="block text-sm text-neutral-300 mb-1">Icône</legend>
              <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-5 gap-2">
                {ICONES.map(([id, nom, I]) => (
                  <button
                    key={id}
                    type="button"
                    title={nom}
                    aria-label={nom}
                    aria-pressed={icone === id}
                    onClick={() => setIcone(id)}
                    className={`h-12 rounded-md border grid place-items-center ${icone === id ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-400 hover:text-white"}`}
                  >
                    <I className="w-6 h-6" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label className="block" htmlFor="logo-police">
            <span className="block text-sm text-neutral-300 mb-1">Police</span>
            <select id="logo-police" value={r.police} onChange={(e) => maj("police")(e.target.value)} className={classeSelect}>
              {POLICES.map(([v, nom]) => (
                <option key={v} value={v}>
                  {nom}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={r.gras} onChange={(e) => maj("gras")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
              Nom en gras
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={r.capitales} onChange={(e) => maj("capitales")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
              Accroche en capitales
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={r.mono} onChange={(e) => maj("mono")(e.target.checked)} className="w-5 h-5 accent-sky-400" />
              Version noir et blanc
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
            {couleur("logo-c-texte", "Nom", r.cTexte, maj("cTexte"))}
            {couleur("logo-c-icone", r.disposition === "monogramme" ? "Cercle" : "Icône", r.cIcone, maj("cIcone"))}
            {couleur("logo-c-accroche", "Accroche", r.cAccroche, maj("cAccroche"))}
          </div>

          {r.disposition !== "monogramme" && (
            <label className="block" htmlFor="logo-trait">
              <span className="flex justify-between text-sm text-neutral-300">
                <span>Épaisseur du trait de l'icône</span>
                <span className="tabular-nums text-neutral-100">{r.trait.toLocaleString("fr-FR")}</span>
              </span>
              <input id="logo-trait" type="range" min={1} max={3} step={0.25} value={r.trait} onChange={(e) => maj("trait")(Number(e.target.value))} className="w-full h-10 accent-sky-400" />
            </label>
          )}
          <p className="text-xs text-neutral-500">
            Le SVG nomme la police sans l'inclure : ouvrez-le sur un poste où elle est installée (Inter et Playfair
            Display sont libres et gratuites), sinon prenez le PNG.
          </p>
        </form>
      </div>

      <div ref={cache} className="hidden" aria-hidden="true">
        <Icone />
      </div>

      <Section titre="Ce que fait le générateur, et pour qui">
        <p>
          Ce générateur assemble un <strong>logo typographique</strong> : le nom de votre activité dans une police
          choisie, une accroche facultative, et une icône simple ou un monogramme de vos initiales dans un cercle.
          C'est la forme de logo la plus courante chez les artisans, indépendants, commerces de proximité et
          associations, et la plus facile à décliner : en-tête de facture, carte de visite, enseigne, réseaux
          sociaux.
        </p>
        <p>
          Trois dispositions sont proposées. <strong>Icône à gauche</strong>, pour un logo horizontal qui tient
          dans un en-tête de site ou une signature d'e-mail. <strong>Icône au-dessus</strong>, plus compact et
          centré, adapté à une enseigne, un tampon ou une étiquette. <strong>Monogramme</strong>, deux initiales
          dans un cercle de couleur, qui sert aussi de photo de profil et de favicon.
        </p>
        <p>
          Les icônes viennent de la bibliothèque libre Lucide, utilisable dans un logo commercial. Les polices
          Inter et Playfair Display sont libres ; les autres sont celles de votre système. Rien n'est envoyé : le
          logo est dessiné dans votre navigateur et vous récupérez directement les fichiers.
        </p>
      </Section>

      <Section titre="Un logo qui fonctionne partout">
        <h3>Lisible en petit</h3>
        <p>
          Un logo passe la plupart de son temps en petit : coin d'un document, onglet du navigateur, photo de
          profil ronde de 40 pixels. Les vignettes sous l'aperçu montrent ce que devient le vôtre à 48 et 16
          pixels. Si le nom n'est plus lisible à 160 pixels de large, raccourcissez l'accroche ou passez à une
          police sans serif. Une police très fine ou très décorative perd vite ses détails.
        </p>
        <h3>Une icône pour le favicon</h3>
        <p>
          Le favicon, la petite image de l'onglet et des favoris, ne peut pas contenir un nom entier. Le bouton
          « Icône carrée 512 px » exporte l'icône seule ou le monogramme dans un carré, la taille demandée par la
          plupart des outils de création de site, qui la réduisent ensuite. Choisissez une icône à formes simples
          et un trait épais.
        </p>
        <h3>Une déclinaison noir et blanc</h3>
        <p>
          Cochez « Version noir et blanc » pour vérifier que le logo tient sans couleur : tampon, fax, gravure,
          impression économique, broderie à une couleur. S'il ne reste lisible que grâce au contraste entre deux
          couleurs proches, revoyez-les. Gardez aussi une version claire sur fond foncé, avec un nom blanc, pour
          les visuels sombres.
        </p>
      </Section>

      <Section titre="Avant d'en faire votre marque">
        <p>
          Un nom et un logo ne vous appartiennent vraiment qu'après un dépôt de marque, et ce dépôt n'a de valeur
          que si personne ne détient déjà des droits sur un signe proche. L'INPI met en ligne une base de
          recherche couvrant les marques françaises, européennes et internationales. Elle donne un premier niveau
          de vérification, à l'identique : l'INPI recommande, avant un dépôt, une recherche de similarités
          auprès de ses documentalistes, et propose une prestation de vérification
          de disponibilité d'une marque, d'un logo, d'un nom de société ou d'un nom de domaine.
        </p>
        <p>
          Gardez à l'esprit qu'une icône de bibliothèque libre n'est pas exclusive : d'autres peuvent l'utiliser.
          Pour un signe vraiment distinctif à protéger, faites retravailler le logo par un graphiste à partir de
          cette première version. Pour utiliser le logo tout de suite, il trouve sa place dans une{" "}
          <Link to="/signature-mail/">signature mail</Link>, sur un{" "}
          <Link to="/generateur-facture/">modèle de facture</Link> ou une{" "}
          <Link to="/modele-carte-de-visite/">carte de visite</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CreerUnLogo;
