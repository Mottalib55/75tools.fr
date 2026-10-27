import { ReactNode, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Bouton } from "@/components/outils/OutilLayout";
import { classeSelect } from "@/components/outils/PageOutil";
import { telecharger } from "@/lib/fichiers";
import { useLangue, locale, type Langue } from "@/lib/langue";

/**
 * Aperçu d'un QR code commun aux pages QR : réglages (couleurs, marge, correction, taille du PNG),
 * alerte de contraste, téléchargement PNG et SVG. Tout est calculé dans le navigateur (bibliothèque qrcode).
 * Bilingue : la langue vient de `useLangue()` (fournie par PageOutil) ; les fonctions exportées prennent
 * un paramètre `lang` facultatif, "fr" par défaut.
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

const T = {
  fr: {
    niveaux: {
      L: "L : environ 7 % (code le plus simple)",
      M: "M : environ 15 % (usage courant)",
      Q: "Q : environ 25 %",
      H: "H : environ 30 % (support abîmé, logo)",
    } as Record<NiveauCorrection, string>,
    inverse:
      "Couleurs inversées : les modules sont plus clairs que le fond. Beaucoup de lecteurs ne savent pas lire un code clair sur fond foncé.",
    contraste: (r: string) =>
      `Contraste insuffisant (rapport de ${r} sur 21) : le code risque de ne pas être lu, surtout imprimé ou sous un éclairage faible. Foncez les modules ou éclaircissez le fond.`,
    tropLong: "Trop de contenu pour un QR code : raccourcissez le texte ou baissez le niveau de correction.",
    impossible: "Impossible de générer le QR code.",
    vide: "Le QR code apparaîtra ici.",
    scanner: "Scannez l'écran avec l'appareil photo de votre téléphone pour vérifier.",
    stats: (o: string, m: number, mm: string) => `${o} octets · ${m} × ${m} modules · module de ${mm} mm si imprimé à 3 cm`,
    marge: (m: number) =>
      `Marge de ${m} module${m > 1 ? "s" : ""} : la norme en demande 4 autour du code. Gardez au moins cette marge vide à l'impression.`,
    png: "Télécharger en PNG",
    reglages: "Couleurs, marge, correction et taille",
    couleurModules: "Couleur des modules",
    couleurFond: "Couleur du fond",
    margeLib: "Marge (zone vide autour du code)",
    module: (m: number) => `${m} module${m > 1 ? "s" : ""}${m === 4 ? " (norme)" : ""}`,
    correction: "Correction d'erreur",
    taille: "Taille du PNG",
    tailles: ["600 × 600 px (écran, e-mail)", "1 200 × 1 200 px (impression jusqu'à 10 cm)", "2 400 × 2 400 px (affiche)"],
    retour: "Revenir au noir sur blanc",
    alt: "Aperçu du QR code",
  },
  en: {
    niveaux: {
      L: "L: about 7% (simplest code)",
      M: "M: about 15% (everyday use)",
      Q: "Q: about 25%",
      H: "H: about 30% (worn surface, logo)",
    } as Record<NiveauCorrection, string>,
    inverse:
      "Inverted colours: the modules are lighter than the background. Many readers cannot read a light code on a dark background.",
    contraste: (r: string) =>
      `Contrast too low (ratio of ${r} out of 21): the code may not scan, especially in print or in dim light. Darken the modules or lighten the background.`,
    tropLong: "Too much content for a QR code: shorten the text or lower the error correction level.",
    impossible: "The QR code could not be generated.",
    vide: "The QR code will appear here.",
    scanner: "Scan the screen with your phone camera to check it.",
    stats: (o: string, m: number, mm: string) => `${o} bytes · ${m} × ${m} modules · ${mm} mm per module if printed 3 cm wide`,
    marge: (m: number) =>
      `Margin of ${m} module${m > 1 ? "s" : ""}: the standard asks for 4 around the code. Keep at least that much blank space when printing.`,
    png: "Download PNG",
    reglages: "Colours, margin, error correction and size",
    couleurModules: "Module colour",
    couleurFond: "Background colour",
    margeLib: "Margin (blank zone around the code)",
    module: (m: number) => `${m} module${m > 1 ? "s" : ""}${m === 4 ? " (standard)" : ""}`,
    correction: "Error correction",
    taille: "PNG size",
    tailles: ["600 × 600 px (screen, email)", "1,200 × 1,200 px (print up to 10 cm)", "2,400 × 2,400 px (poster)"],
    retour: "Back to black on white",
    alt: "QR code preview",
  },
};

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
export function alerteCouleurs(sombre: string, clair: string, lang: Langue = "fr"): string {
  const r = rapportContraste(sombre, clair);
  if (luminance(sombre) > luminance(clair)) return T[lang].inverse;
  if (r < 4) return T[lang].contraste(r.toLocaleString(locale(lang), { maximumFractionDigits: 1 }));
  return "";
}

/** Calcule le SVG et le nombre de modules d'un contenu. */
export function useQrSvg(texte: string, r: ReglagesQr, lang: Langue = "fr") {
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
      setErreur(T[lang].tropLong);
      return;
    }
    QRCode.toString(texte, {
      type: "svg",
      errorCorrectionLevel: r.niveau,
      margin: r.marge,
      color: { dark: r.sombre, light: r.clair },
    })
      .then((s) => !annule && setSvg(s))
      .catch(() => !annule && setErreur(T[lang].impossible));
    return () => {
      annule = true;
    };
  }, [texte, r.niveau, r.marge, r.sombre, r.clair, lang]);
  return { svg, modules, erreur };
}

export const octetsUtf8 = (s: string) => new TextEncoder().encode(s).length;

export const QrApercu = ({
  texte,
  nomFichier,
  id = "qr-apercu",
  vide,
  niveauDefaut = "M",
  onRendu,
  children,
  actions,
}: {
  texte: string; // contenu encodé ; vide = pas de code
  nomFichier: string; // « qr-wifi-maison » (sans extension)
  id?: string;
  vide?: string; // phrase d'attente, dans la langue de la page
  niveauDefaut?: NiveauCorrection;
  onRendu?: (svg: string, r: ReglagesQr) => void;
  children?: ReactNode; // informations sous l'aperçu
  actions?: ReactNode; // boutons supplémentaires (impression…)
}) => {
  const lang = useLangue();
  const t = T[lang];
  const [r, setR] = useState<ReglagesQr>({ ...REGLAGES_QR, niveau: niveauDefaut });
  const { svg, modules, erreur } = useQrSvg(texte, r, lang);
  const alerte = useMemo(() => alerteCouleurs(r.sombre, r.clair, lang), [r.sombre, r.clair, lang]);
  const maj = <K extends keyof ReglagesQr>(k: K, v: ReglagesQr[K]) => setR((x) => ({ ...x, [k]: v }));
  const loc = locale(lang);

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

  const module3cm = modules ? (30 / (modules + 2 * r.marge)).toLocaleString(loc, { maximumFractionDigits: 2 }) : "";

  return (
    <div className="space-y-3 min-w-0 print:hidden">
      <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] lg:grid-cols-1 gap-4 items-start">
        <div
          className="rounded-lg p-2 aspect-square w-full max-w-[19rem] border border-neutral-800"
          style={{ background: svg ? r.clair : "#ffffff" }}
        >
          {svg ? (
            <div id={id} role="img" aria-label={t.alt} className="[&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="w-full h-full grid place-items-center text-neutral-500 text-sm text-center p-2">{erreur || vide || t.vide}</div>
          )}
        </div>
        <div className="space-y-2 text-sm min-w-0" aria-live="polite">
          <p className="text-neutral-200">{t.scanner}</p>
          {svg && (
            <p className="text-neutral-500 tabular-nums">{t.stats(octetsUtf8(texte).toLocaleString(loc), modules, module3cm)}</p>
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
              {t.marge(r.marge)}
            </p>
          )}
          {children}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={png} disabled={!svg}>
          {t.png}
        </Bouton>
        <Bouton secondaire onClick={svgDl} disabled={!svg}>
          SVG
        </Bouton>
        {actions}
      </div>
      <details className="text-sm border border-neutral-800 rounded-lg px-3 py-2">
        <summary className="cursor-pointer text-neutral-300 py-1">{t.reglages}</summary>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 mt-3 pb-1">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.couleurModules}</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={r.sombre}
                onChange={(e) => maj("sombre", e.target.value)}
                className="h-12 w-14 rounded-md border border-neutral-700 bg-neutral-900 p-1"
                aria-label={t.couleurModules}
              />
              <span className="text-neutral-400 tabular-nums">{r.sombre}</span>
            </span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.couleurFond}</span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={r.clair}
                onChange={(e) => maj("clair", e.target.value)}
                className="h-12 w-14 rounded-md border border-neutral-700 bg-neutral-900 p-1"
                aria-label={t.couleurFond}
              />
              <span className="text-neutral-400 tabular-nums">{r.clair}</span>
            </span>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.margeLib}</span>
            <select value={r.marge} onChange={(e) => maj("marge", Number(e.target.value))} className={classeSelect}>
              {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((m) => (
                <option key={m} value={m}>
                  {t.module(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.correction}</span>
            <select value={r.niveau} onChange={(e) => maj("niveau", e.target.value as NiveauCorrection)} className={classeSelect}>
              {(["L", "M", "Q", "H"] as NiveauCorrection[]).map((n) => (
                <option key={n} value={n}>
                  {t.niveaux[n]}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.taille}</span>
            <select value={r.taillePng} onChange={(e) => maj("taillePng", Number(e.target.value))} className={classeSelect}>
              {[600, 1200, 2400].map((v, i) => (
                <option key={v} value={v}>
                  {t.tailles[i]}
                </option>
              ))}
            </select>
          </label>
          <Bouton secondaire onClick={() => setR({ ...REGLAGES_QR, niveau: niveauDefaut })}>
            {t.retour}
          </Bouton>
        </div>
      </details>
    </div>
  );
};
