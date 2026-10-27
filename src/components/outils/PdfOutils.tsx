/** Éléments d'interface communs aux outils PDF : progression, alertes, liste réordonnable, vignettes. */
import { ReactNode, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { rendrePage, ouvrirPdf } from "@/lib/pdfjs";
import { cn } from "@/lib/utils";
import { classeSelect } from "@/components/outils/PageOutil";
import { useLangue, locale, tr } from "@/lib/langue";

type DocPdfJs = Awaited<ReturnType<typeof ouvrirPdf>>;

/** Barre de progression annoncée aux lecteurs d'écran. */
export const Progression = ({ texte, fait, total }: { texte: string; fait: number; total: number }) => {
  const lang = useLangue();
  return (
  <div role="status" aria-live="polite" className="space-y-2">
    <p className="text-sm text-neutral-300 tabular-nums">
      {texte} {total > 0 && `(${fait.toLocaleString(locale(lang))} ${tr(lang, "sur", "of")} ${total.toLocaleString(locale(lang))})`}
    </p>
    <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
      <div
        className="h-full bg-sky-400 transition-[width]"
        style={{ width: `${total > 0 ? Math.round((fait / total) * 100) : 0}%` }}
      />
    </div>
  </div>
  );
};

export const Alerte = ({ children, ton = "erreur" }: { children: ReactNode; ton?: "erreur" | "info" }) => (
  <div
    role={ton === "erreur" ? "alert" : "status"}
    className={cn(
      "rounded-md border px-4 py-3 text-sm [overflow-wrap:anywhere]",
      ton === "erreur" ? "border-red-400/40 bg-red-950/30 text-red-200" : "border-amber-400/40 bg-amber-950/20 text-amber-100"
    )}
  >
    {children}
  </div>
);

/** Liste réordonnable : boutons monter / descendre / retirer, et glisser-déposer à la souris. */
export function ListeOrdonnable<T extends { id: string }>({
  elements,
  onChange,
  rendu,
  libelle,
  desactive = false,
}: {
  elements: T[];
  onChange: (l: T[]) => void;
  rendu: (e: T, i: number) => ReactNode;
  libelle: (e: T) => string;
  desactive?: boolean;
}) {
  const lang = useLangue();
  const [saisi, setSaisi] = useState<number | null>(null);
  const [cible, setCible] = useState<number | null>(null);
  const bouger = (i: number, j: number) => {
    if (j < 0 || j >= elements.length || i === j) return;
    const l = [...elements];
    const [x] = l.splice(i, 1);
    l.splice(j, 0, x);
    onChange(l);
  };
  const btn =
    "w-10 h-10 shrink-0 grid place-items-center rounded-md border border-neutral-700 text-neutral-300 hover:border-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <ol className="space-y-2">
      {elements.map((e, i) => (
        <li
          key={e.id}
          draggable={!desactive}
          onDragStart={(ev) => {
            setSaisi(i);
            ev.dataTransfer.effectAllowed = "move";
            ev.dataTransfer.setData("text/plain", String(i));
          }}
          onDragOver={(ev) => {
            if (saisi === null) return;
            ev.preventDefault();
            setCible(i);
          }}
          onDragLeave={() => setCible((c) => (c === i ? null : c))}
          onDrop={(ev) => {
            if (saisi === null) return;
            ev.preventDefault();
            ev.stopPropagation();
            bouger(saisi, i);
            setSaisi(null);
            setCible(null);
          }}
          onDragEnd={() => {
            setSaisi(null);
            setCible(null);
          }}
          className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-lg border bg-neutral-900 p-2 sm:p-3 min-w-0",
            cible === i && saisi !== i ? "border-sky-400" : "border-neutral-800",
            saisi === i && "opacity-50"
          )}
        >
          <GripVertical className="hidden sm:block w-4 h-4 shrink-0 text-neutral-600 cursor-grab" aria-hidden="true" />
          <span className="w-6 shrink-0 text-center text-sm text-neutral-500 tabular-nums">{i + 1}</span>
          <div className="flex-1 min-w-0">{rendu(e, i)}</div>
          <button type="button" className={btn} disabled={desactive || i === 0} onClick={() => bouger(i, i - 1)} aria-label={`${tr(lang, "Monter", "Move up")} ${libelle(e)}`}>
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={btn}
            disabled={desactive || i === elements.length - 1}
            onClick={() => bouger(i, i + 1)}
            aria-label={`${tr(lang, "Descendre", "Move down")} ${libelle(e)}`}
          >
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={btn}
            disabled={desactive}
            onClick={() => onChange(elements.filter((x) => x.id !== e.id))}
            aria-label={`${tr(lang, "Retirer", "Remove")} ${libelle(e)}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ol>
  );
}

/**
 * Vignettes des pages d'un document pdf.js, rendues une à une (JPEG de faible taille).
 * Renvoie un tableau d'adresses indexé par numéro de page (1 = première).
 */
export function useVignettes(doc: DocPdfJs | null, nbPages: number, largeur = 160, maxPages = 200) {
  const [vignettes, setVignettes] = useState<string[]>([]);
  useEffect(() => {
    setVignettes([]);
    if (!doc) return;
    let annule = false;
    (async () => {
      const n = Math.min(nbPages, maxPages);
      for (let p = 1; p <= n && !annule; p++) {
        try {
          const page = await doc.getPage(p);
          const vue = page.getViewport({ scale: 1 });
          const c = await rendrePage(doc, p, largeur / vue.width);
          const url = c.toDataURL("image/jpeg", 0.7);
          c.width = c.height = 0;
          if (!annule)
            setVignettes((v) => {
              const w = [...v];
              w[p] = url;
              return w;
            });
        } catch {
          /* page illisible : pas de vignette */
        }
      }
    })();
    return () => {
      annule = true;
    };
  }, [doc, nbPages, largeur, maxPages]);
  return vignettes;
}

/** Groupe de boutons radio présenté en segments. */
export function Segments<V extends string>({
  nom,
  valeur,
  options,
  onChange,
  desactive = false,
}: {
  nom: string;
  valeur: V;
  options: { v: V; l: ReactNode }[];
  onChange: (v: V) => void;
  desactive?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={nom} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.v}
          className={cn(
            "min-h-11 px-3 py-2 rounded-md border text-sm cursor-pointer flex items-center",
            valeur === o.v ? "border-sky-400 bg-neutral-900 text-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500",
            desactive && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="radio"
            name={nom}
            value={o.v}
            checked={valeur === o.v}
            disabled={desactive}
            onChange={() => onChange(o.v)}
            className="sr-only"
          />
          {o.l}
        </label>
      ))}
    </div>
  );
}

/** Libellé + liste déroulante sombre. */
export const ChoixListe = ({
  label,
  value,
  onChange,
  children,
  disabled,
  aide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
  aide?: string;
}) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={classeSelect + " disabled:opacity-50"}
    >
      {children}
    </select>
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);
