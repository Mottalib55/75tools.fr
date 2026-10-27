import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { classeChamp } from "@/components/outils/PageOutil";

/**
 * Champ numérique : texte libre (le texte saisi reste la source de vérité, jamais réécrit), clavier
 * décimal ; la page lit le nombre avec lireNombre(texte, lang), qui accepte virgule et point.
 */
export const ChampNombre = ({
  label,
  value,
  onChange,
  suffixe,
  aide,
  placeholder,
  id,
}: {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  suffixe?: string;
  aide?: string;
  placeholder?: string;
  id?: string;
}) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <span className="relative block">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(classeChamp, "tabular-nums", suffixe && "pr-10")}
      />
      {suffixe && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">{suffixe}</span>
      )}
    </span>
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);

/** Champ date natif, 48 px. */
export const ChampDate = ({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <input
      id={id}
      type="date"
      value={value}
      min="1600-01-01"
      max="2999-12-31"
      onChange={(e) => onChange(e.target.value)}
      className={cn(classeChamp, "[color-scheme:dark]")}
    />
  </label>
);

/** Messages d'alerte (valeur ramenée, division par zéro…) : toujours présent, lu par les lecteurs d'écran. */
export const Alertes = ({ messages }: { messages: string[] }) => (
  <div role="status" aria-live="polite" className={cn(messages.length ? "mt-3" : "sr-only")}>
    {messages.map((m) => (
      <p key={m} className="text-sm text-amber-300">
        {m}
      </p>
    ))}
  </div>
);

/** Bloc d'un calcul : titre, champs, résultat et formule. */
export const BlocCalcul = ({
  titre,
  id,
  children,
  className,
}: {
  titre: string;
  id?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section id={id} aria-label={titre} className={cn("rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 min-w-0", className)}>
    <h2 className="text-lg font-semibold text-white mb-3">{titre}</h2>
    {children}
  </section>
);

/** Grand résultat avec son libellé. */
export const Resultat = ({ libelle, valeur, id }: { libelle: ReactNode; valeur: ReactNode; id?: string }) => (
  <div className="min-w-0">
    <p className="text-sm text-neutral-400">{libelle}</p>
    <p id={id} className="text-2xl sm:text-3xl font-semibold text-white tabular-nums [overflow-wrap:anywhere]">
      {valeur}
    </p>
  </div>
);

/** Formule posée avec les nombres saisis. */
export const Formule = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm text-neutral-300 tabular-nums [overflow-wrap:anywhere]">
    {children}
  </p>
);

/**
 * Boutons à bascule (choix d'un taux, d'un sens), sur une seule rangée. Au-delà de cinq options ou
 * avec des libellés longs, texte plus petit et marges réduites sur téléphone, pour qu'aucun libellé
 * ne déborde de son bouton à 320 px.
 */
export const Bascule = <T extends string | number>({
  options,
  valeur,
  onChange,
  libelle,
}: {
  options: { v: NoInfer<T>; l: string }[];
  valeur: T;
  onChange: (v: NoInfer<T>) => void;
  libelle: string;
}) => {
  const n = options.length;
  const serre = n > 5;
  const long = Math.max(...options.map((o) => o.l.length)) * n > 30;
  return (
    <div
      role="group"
      aria-label={libelle}
      className={cn("grid sm:gap-2", serre ? "gap-0.5" : "gap-1.5")}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          aria-pressed={o.v === valeur}
          onClick={() => onChange(o.v)}
          className={cn(
            "h-11 rounded-md sm:text-sm sm:px-1 border whitespace-nowrap min-w-0",
            serre ? "text-[11px] px-0" : long ? "text-xs px-1" : "text-[13px] px-1",
            o.v === valeur ? "border-sky-400 bg-sky-400 text-neutral-950 font-medium" : "border-neutral-700 text-neutral-200 hover:border-neutral-500"
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
};

/** Case à cocher lisible. */
export const Case = ({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) => (
  <label className="flex items-start gap-3 text-sm text-neutral-300 cursor-pointer min-h-11 py-2">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 accent-sky-400 shrink-0" />
    <span>{children}</span>
  </label>
);

/** Tableau à défilement horizontal propre. */
export const Tableau = ({ entetes, lignes, minW = "28rem" }: { entetes: ReactNode[]; lignes: ReactNode[][]; minW?: string }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm" style={{ minWidth: minW }}>
      <thead>
        <tr className="border-b border-neutral-700 text-left text-neutral-400 text-xs uppercase tracking-wider">
          {entetes.map((e, i) => (
            <th key={i} className="py-2 pr-4 font-medium">
              {e}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-800 tabular-nums">
        {lignes.map((l, i) => (
          <tr key={i}>
            {l.map((c, j) => (
              <td key={j} className={cn("py-2 pr-4", j === 0 && "text-neutral-400")}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
