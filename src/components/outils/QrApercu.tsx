import { ReactNode, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Bouton } from "@/components/outils/OutilLayout";
import { classeSelect } from "@/components/outils/PageOutil";
import { telecharger } from "@/lib/fichiers";

/**
 * Aperçu d'un QR code commun aux pages QR : réglages (couleurs, marge, correction, taille du PNG),
 * alerte de contraste, téléchargement PNG et SVG. Tout est calculé dans le navigateur (bibliothèque qrcode).
 */

export type NiveauCorrection = "L" | "M" | "Q" | "H";

export interface ReglagesQr {
  sombre: string;
  clair: string;
  marge: number; // en modules
  niveau: NiveauCorrection;
  taillePng: number; // côté du PNG en pixels
}

export const REGLAGES_QR: ReglagesQr = { sombre: "#000000", clair: "#ffffff", marge: 4, niveau: "M", taillePng: 1200 };

const NIVEAUX: { v: NiveauCorrection; l: string }[] = [
  { v: "L", l: "L : environ 7 % (code le plus simple)" },
  { v: "M", l: "M : environ 15 % (usage courant)" },
  { v: "Q", l: "Q : environ 25 %" },
  { v: "H", l: "H : environ 30 % (support abîmé, logo)" },
];

const luminance = (hex: string) => {
  const m = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Rapport de contraste (formule WCAG), de 1 à 21. */
export const rapportContraste = (a: string, b: string) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Alerte de couleurs, ou chaîne vide si les couleurs conviennent. */
export function alerteCouleurs(sombre: string, clair: string): string {
  const r = rapportContraste(sombre, clair);
  if (luminance(sombre) > luminance(clair)) {
    return "Couleurs inversées : les modules sont plus clairs que le fond. Beaucoup de lecteurs ne savent pas lire un code clair sur fond foncé.";
  }
  if (r < 4) {
    return `Contraste insuffisant (rapport de ${r.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} sur 21) : le code risque de ne pas être lu, surtout imprimé ou sous un éclairage faible. Foncez les modules ou éclaircissez le fond.`;
  }
  return "";
}

/** Calcule le SVG et le nombre de modules d'un contenu. */
export function useQrSvg(texte: string, r: ReglagesQr) {
  const [svg, setSvg] = useState("");
  const [modules, setModules] = useState(0);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    let annule = false;
    if (!texte) {
      setSvg("");
      setModules(0);
      setErreur("");
      return;
    }
    try {
      const qr = QRCode.create(texte, { errorCorrectionLevel: r.niveau });
      setModules(qr.modules.size);
      setErreur("");
    } catch {
      setSvg("");
      setModules(0);
      setErreur("Trop de contenu pour un QR code : raccourcissez le texte ou baissez le niveau de correction.");
      return;
    }
    QRCode.toString(texte, {
      type: "svg",
      errorCorrectionLevel: r.niveau,
      margin: r.marge,
      color: { dark: r.sombre, light: r.clair },
    })
      .then((s) => !annule && setSvg(s))
      .catch(() => !annule && setErreur("Impossible de générer le QR code."));
    return () => {
      annule = true;
    };
  }, [texte, r.niveau, r.marge, r.sombre, r.clair]);
  return { svg, modules, erreur };
}

export const octetsUtf8 = (s: string) => new TextEncoder().encode(s).length;

export const QrApercu = ({
  texte,
  nomFichier,
  id = "qr-apercu",
  vide = "Le QR code apparaîtra ici.",
  niveauDefaut = "M",
  onRendu,
  children,
  actions,
}: {
  texte: string; // contenu encodé ; vide = pas de code
  nomFichier: string; // « qr-wifi-maison » (sans extension)
  id?: string;
  vide?: string;
  niveauDefaut?: NiveauCorrection;
  onRendu?: (svg: string, r: ReglagesQr) => void;
  children?: ReactNode; // informations sous l'aperçu
  actions?: ReactNode; // boutons supplémentaires (impression…)
}) => {
  const [r, setR] = useState<ReglagesQr>({ ...REGLAGES_QR, niveau: niveauDefaut });
  const { svg, modules, erreur } = useQrSvg(texte, r);
  const alerte = useMemo(() => alerteCouleurs(r.sombre, r.clair), [r.sombre, r.clair]);
  const maj = <K extends keyof ReglagesQr>(k: K, v: ReglagesQr[K]) => setR((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    onRendu?.(svg, r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svg]);

  const png = async () => {
    const url = await QRCode.toDataURL(texte, {
      errorCorrectionLevel: r.niveau,
      margin: r.marge,
      width: r.taillePng,
      color: { dark: r.sombre, light: r.clair },
    });
    telecharger(`${nomFichier}.png`, url);
  };
  const svgDl = () => telecharger(`${nomFichier}.svg`, new Blob([svg], { type: "image/svg+xml" }));

  const module3cm = modules ? (30 / (modules + 2 * r.marge)).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : "";

  return (
    <div className="space-y-3 min-w-0 print:hidden">
      <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] lg:grid-cols-1 gap-4 items-start">
        <div
          className="rounded-lg p-2 aspect-square w-full max-w-[22rem] border border-neutral-800"
          style={{ background: svg ? r.clair : "#ffffff" }}
        >
          {svg ? (
            <div id={id} className="[&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="w-full h-full grid place-items-center text-neutral-500 text-sm text-center p-2">{erreur || vide}</div>
          )}
        </div>
        <div className="space-y-2 text-sm min-w-0">
          <p className="text-neutral-200">Scannez l'écran avec l'appareil photo de votre téléphone pour vérifier.</p>
          {svg && (
            <p className="text-neutral-500 tabular-nums">
              {octetsUtf8(texte).toLocaleString("fr-FR")} octets · {modules} × {modules} modules · module de {module3cm} mm
              si imprimé à 3 cm
            </p>
          )}
          {erreur && texte && (
            <p role="status" className="text-amber-300">
              {erreur}
            </p>
          )}
          {alerte && (
            <p role="status" className="text-amber-300">
              {alerte}
            </p>
          )}
          {r.marge < 4 && (
            <p role="status" className="text-amber-300">
              Marge de {r.marge} module{r.marge > 1 ? "s" : ""} : la norme en demande 4 autour du code. Gardez au moins cette
              marge vide à l'impression.
            </p>
          )}
          {children}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={png} disabled={!svg}>
          Télécharger en PNG
        </Bouton>
        <Bouton secondaire onClick={svgDl} disabled={!svg}>
          SVG
        </Bouton>
        {actions}
      </div>
      <details className="text-sm border border-neutral-800 rounded-lg px-3 py-2">
        <summary className="cursor-pointer text-neutral-300 py-1">Couleurs, marge, correction et taille</summary>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 mt-3 pb-1">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Couleur des modules</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={r.sombre}
                onChange={(e) => maj("sombre", e.target.value)}
                className="h-12 w-14 rounded-md border border-neutral-700 bg-neutral-900 p-1"
                aria-label="Couleur des modules"
              />
              <span className="text-neutral-400 tabular-nums">{r.sombre}</span>
            </span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Couleur du fond</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={r.clair}
                onChange={(e) => maj("clair", e.target.value)}
                className="h-12 w-14 rounded-md border border-neutral-700 bg-neutral-900 p-1"
                aria-label="Couleur du fond"
              />
              <span className="text-neutral-400 tabular-nums">{r.clair}</span>
            </span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Marge (zone vide autour du code)</span>
            <select value={r.marge} onChange={(e) => maj("marge", Number(e.target.value))} className={classeSelect}>
              {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((m) => (
                <option key={m} value={m}>
                  {m} module{m > 1 ? "s" : ""}
                  {m === 4 ? " (norme)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Correction d'erreur</span>
            <select value={r.niveau} onChange={(e) => maj("niveau", e.target.value as NiveauCorrection)} className={classeSelect}>
              {NIVEAUX.map((n) => (
                <option key={n.v} value={n.v}>
                  {n.l}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Taille du PNG</span>
            <select value={r.taillePng} onChange={(e) => maj("taillePng", Number(e.target.value))} className={classeSelect}>
              <option value={600}>600 × 600 px (écran, e-mail)</option>
              <option value={1200}>1 200 × 1 200 px (impression jusqu'à 10 cm)</option>
              <option value={2400}>2 400 × 2 400 px (affiche)</option>
            </select>
          </label>
          <Bouton secondaire onClick={() => setR({ ...REGLAGES_QR, niveau: niveauDefaut })}>
            Revenir au noir sur blanc
          </Bouton>
        </div>
      </details>
    </div>
  );
};
