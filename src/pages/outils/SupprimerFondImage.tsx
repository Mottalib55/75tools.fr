import { PointerEvent as PE, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { canvasVersBlob, formatOctets, nomSansExtension, telecharger } from "@/lib/fichiers";
import { decoderImage, libererCanvas, nouveauCanvas, redimensionner } from "@/lib/image-lot";

/** Côté maximal de l'image de travail : au-delà, la retouche au pinceau devient lente sur mobile. */
const COTE_MAX = 3000;

type Outil = "pipette" | "gomme" | "restaurer";
type Apercu = "damier" | "blanc" | "noir";

const FAQ: QuestionFaq[] = [
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
];

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

const SupprimerFondImage = () => {
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
    setStatut("Ouverture de l'image…");
    try {
      const img = await decoderImage(f);
      try {
        const r = Math.min(1, COTE_MAX / Math.max(img.largeur, img.hauteur));
        const w = Math.round(img.largeur * r);
        const h = Math.round(img.hauteur * r);
        const t = redimensionner(img.source, img.largeur, img.hauteur, w, h);
        const data = t.getContext("2d")!.getImageData(0, 0, w, h);
        libererCanvas(t);
        orig.current = data;
        manuel.current = new Uint8Array(w * h);
        avantTrait.current = null;
        setPeutAnnuler(false);
        setRetouches(0);
        auto.current = null;
        setNom(nomSansExtension(f.name));
        setInfos(
          `${img.largeur.toLocaleString("fr-FR")} × ${img.hauteur.toLocaleString("fr-FR")} px, ${formatOctets(f.size)}` +
            (r < 1 ? ` · retouche à ${w.toLocaleString("fr-FR")} × ${h.toLocaleString("fr-FR")} px` : "")
        );
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
      setStatut(e instanceof Error ? e.message : "Image illisible.");
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
    const t = setTimeout(() => {
      if (!orig.current) return;
      auto.current = calculerAlpha(orig.current, couleur, tolerance, contigu, graine, adoucir);
      composer();
    }, 120);
    return () => clearTimeout(t);
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

  /** Image finale (avec recadrage éventuel au contenu), sur fond transparent ou coloré. */
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
    telecharger(`${nom || "image"}-sans-fond.${type === "image/png" ? "png" : "jpg"}`, blob);
  };

  const hex = "#" + couleur.map((v) => v.toString(16).padStart(2, "0")).join("");
  const fondApercu =
    apercu === "blanc"
      ? "bg-white"
      : apercu === "noir"
        ? "bg-black"
        : "bg-[length:20px_20px] bg-[conic-gradient(#d4d4d4_25%,#ffffff_0_50%,#d4d4d4_0_75%,#ffffff_0)]";

  const choix = <T extends string>(valeur: T, courant: T, set: (v: T) => void, libelle: string) => (
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
          {valeur}
          {unite}
        </span>
      </span>
      <input id={id} type="range" min={min} max={max} value={valeur} onChange={(e) => set(Number(e.target.value))} className="w-full h-10 accent-sky-400" />
    </label>
  );

  return (
    <PageOutil
      href="/supprimer-fond-image/"
      titre="Supprimer le fond d'une image gratuit : détourer en ligne"
      description="Supprimer le fond d'une image gratuitement : clic sur la couleur du fond, tolérance, gomme et pinceau de retouche, export PNG transparent. Sans envoi."
      motsCles="supprimer fond image gratuit, détourer une image en ligne, enlever l'arrière-plan d'une photo, fond transparent, png transparent, détourage"
      nomAppli="Supprimer le fond d'une image"
      h1="Détourer une image : supprimer un fond uni"
      chapeau="Pour un produit sur fond blanc, un logo, une signature scannée ou tout sujet sur fond uni : cliquez sur le fond, ajustez la tolérance, retouchez à la gomme, et téléchargez un PNG transparent."
      faq={FAQ}
    >
      <div id="fond-outil" className="space-y-4">
        {!taille && <DepotFichiers accept="image/*" onFichiers={ouvrir} libelle="Choisir une image" />}
        <p role="status" aria-live="polite" className="text-sm text-sky-300 empty:hidden">
          {statut}
        </p>

        {taille && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
            <div className="min-w-0 space-y-2">
              <div className={`rounded-lg border border-neutral-800 overflow-hidden flex justify-center ${fondApercu}`}>
                <canvas
                  ref={canvas}
                  id="fond-canvas"
                  aria-label="Aperçu de l'image détourée"
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
                <span className="text-sm text-neutral-400">Aperçu sur :</span>
                {choix<Apercu>("damier", apercu, setApercu, "Damier")}
                {choix<Apercu>("blanc", apercu, setApercu, "Blanc")}
                {choix<Apercu>("noir", apercu, setApercu, "Noir")}
              </div>
            </div>

            <div className="space-y-5 min-w-0">
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">Outil (clic ou doigt sur l'image)</p>
                <div className="grid grid-cols-3 gap-2">
                  {choix<Outil>("pipette", outil, setOutil, "Pipette")}
                  {choix<Outil>("gomme", outil, setOutil, "Gomme")}
                  {choix<Outil>("restaurer", outil, setOutil, "Restaurer")}
                </div>
                <p className="text-xs text-neutral-500">
                  {outil === "pipette"
                    ? "Cliquez sur le fond à retirer : sa couleur devient la référence."
                    : outil === "gomme"
                      ? "Effacez à la main ce qui reste du fond (ombre, reflet)."
                      : "Repeignez les parties du sujet effacées par erreur."}
                </p>
                {outil !== "pipette" && curseur("fond-pinceau", "Taille du pinceau", pinceau, 2, Math.max(40, Math.round(Math.max(taille.w, taille.h) / 6)), setPinceau, " px")}
              </div>

              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-md border border-neutral-600 shrink-0" style={{ background: hex }} aria-hidden="true" />
                <div className="text-sm min-w-0">
                  <p className="text-neutral-200">Couleur du fond : {hex}</p>
                  <button
                    type="button"
                    className="text-sky-300 underline underline-offset-4"
                    onClick={() => {
                      if (orig.current) setCouleur(couleurDesCoins(orig.current));
                      setGraine(null);
                    }}
                  >
                    Reprendre la couleur des coins
                  </button>
                </div>
              </div>

              {curseur("fond-tolerance", "Tolérance", tolerance, 0, 60, setTolerance, " %")}

              <fieldset className="space-y-2">
                <legend className="text-sm text-neutral-300 mb-1">Zone retirée</legend>
                <label className="flex items-start gap-3 text-sm">
                  <input type="radio" name="fond-mode" checked={contigu} onChange={() => setContigu(true)} className="mt-1 w-4 h-4 accent-sky-400" />
                  <span>
                    Fond contigu depuis les bords <span className="text-neutral-500">(épargne le sujet de même couleur)</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 text-sm">
                  <input type="radio" name="fond-mode" checked={!contigu} onChange={() => setContigu(false)} className="mt-1 w-4 h-4 accent-sky-400" />
                  <span>
                    Toute la couleur <span className="text-neutral-500">(intérieur des lettres, boucles d'une signature)</span>
                  </span>
                </label>
              </fieldset>

              {curseur("fond-adoucir", "Adoucissement du bord", adoucir, 0, 4, setAdoucir, " px")}

              <div className="flex flex-wrap gap-2">
                <Bouton secondaire onClick={annulerTrait} disabled={!peutAnnuler}>
                  Annuler le dernier trait
                </Bouton>
                <Bouton secondaire onClick={effacerRetouches} disabled={retouches === 0}>
                  Effacer les retouches
                </Bouton>
              </div>

              <label className="flex items-center gap-3 text-sm text-neutral-300">
                <input type="checkbox" checked={recadrer} onChange={(e) => setRecadrer(e.target.checked)} className="w-5 h-5 accent-sky-400" />
                Recadrer au contenu (retire les marges vides)
              </label>

              <div className="flex flex-wrap gap-2">
                <Bouton onClick={() => exporter("image/png")}>Télécharger le PNG transparent</Bouton>
                <Bouton secondaire onClick={() => exporter("image/jpeg")}>
                  JPG sur fond blanc
                </Bouton>
                <Bouton
                  secondaire
                  onClick={() => {
                    orig.current = null;
                    auto.current = null;
                    manuel.current = null;
                    avantTrait.current = null;
                    setTaille(null);
                    setStatut("");
                  }}
                >
                  Autre image
                </Bouton>
              </div>
            </div>
          </div>
        )}
      </div>

      <Section titre="Ce que l'outil réussit, et ce qu'il ne fait pas">
        <p>
          Cet outil détoure <strong>par la couleur</strong> : il rend transparents les pixels proches de la
          couleur du fond, dans la limite de la tolérance choisie. C'est rapide, précis et entièrement fait dans
          votre navigateur, à condition que le fond se distingue nettement du sujet. Il fonctionne très bien pour :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>un produit photographié sur fond blanc ou sur un fond de couleur unie ;</li>
          <li>un logo ou une icône sur fond uni, à rendre transparent pour le poser sur un site ou un document ;</li>
          <li>une signature ou un tampon scanné sur papier blanc ;</li>
          <li>une capture d'écran, un schéma, une illustration à fond plat ;</li>
          <li>une photo prise devant un mur, un drap ou un fond vert bien éclairés, avec quelques retouches.</li>
        </ul>
        <p>
          Il ne reconnaît pas ce qu'est le sujet. Il n'est donc pas fait pour une personne aux cheveux détachés,
          un animal à poils longs, un arbre, ni pour une photo prise dans la rue ou dans un salon, où le fond
          mêle des dizaines de couleurs. Ces cas demandent un détourage par intelligence artificielle : les
          modèles capables de le faire pèsent des dizaines de mégaoctets et tournent en général sur un serveur,
          ce qui suppose d'y envoyer votre photo. Ici, l'image ne quitte jamais votre appareil.
        </p>
      </Section>

      <Section titre="Mode d'emploi en quatre gestes">
        <p>
          <strong>1. Choisir la couleur du fond.</strong> À l'ouverture, l'outil prend la couleur qui revient le
          plus dans les coins de l'image, souvent celle du fond. Si le résultat ne convient pas, gardez la pipette
          et cliquez directement sur le fond.
        </p>
        <p>
          <strong>2. Régler la tolérance.</strong> Trop basse, des restes du fond subsistent, surtout là où la
          lumière varie ; trop haute, l'outil commence à manger le sujet. Montez par petites touches en regardant
          l'aperçu sur damier, puis vérifiez sur fond noir : c'est là que les liserés clairs se voient le mieux.
        </p>
        <p>
          <strong>3. Retoucher à la main.</strong> La gomme efface une ombre portée ou un reflet que la couleur
          seule ne distingue pas ; le pinceau « Restaurer » rend au sujet ce qui a été effacé à tort. Sur
          téléphone, le doigt fait office de pinceau.
        </p>
        <p>
          <strong>4. Télécharger.</strong> Le PNG garde la transparence ; « JPG sur fond blanc » donne une image
          à fond blanc pur, demandée par beaucoup de places de marché. L'image est travaillée jusqu'à 3 000 pixels
          de côté, largement assez pour un site ou un document ; pour l'alléger ensuite, utilisez{" "}
          <Link to="/redimensionner-image/">redimensionner une image</Link>.
        </p>
      </Section>

      <Section titre="Réussir la photo de départ">
        <p>
          Le résultat dépend surtout de la photo. Placez le sujet devant un fond uni et mat, éloigné de lui d'un
          mètre si possible pour éviter les ombres portées. Éclairez le fond de façon égale, à la lumière du jour
          près d'une fenêtre ou avec deux lampes de part et d'autre. Choisissez un fond d'une couleur absente du
          sujet : un fond blanc pour un objet sombre, un fond foncé ou coloré pour un objet blanc.
        </p>
        <p>
          Pour une signature, utilisez un stylo noir ou bleu foncé sur une feuille blanche, et photographiez-la
          bien à plat, sans ombre de la main ni du téléphone. Le PNG obtenu peut ensuite être posé sur un document
          avec <Link to="/signer-pdf/">signer un PDF</Link>, ou servir de base à un <Link to="/creer-un-logo/">logo</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default SupprimerFondImage;
