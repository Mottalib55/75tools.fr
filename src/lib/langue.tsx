/**
 * Langue de la page-outil courante (fr ou en). `PageOutil` la fournit à tout ce qu'il affiche ;
 * les composants partagés (dépôt de fichiers, aperçus, listes) la lisent avec `useLangue()` au lieu
 * de recevoir une prop de plus. La page elle-même reçoit `lang` de sa route (App.tsx) et le passe à
 * `PageOutil` : elle peut donc choisir ses propres textes avant le rendu.
 */
import { createContext, useContext } from "react";
import type { Langue } from "@/lib/outils";

export type { Langue };

export const LangueContext = createContext<Langue>("fr");

export const useLangue = () => useContext(LangueContext);

/** Locale Intl de la langue : en-GB pour l'anglais (lecteurs installés en France, dates jour/mois). */
export const locale = (l: Langue) => (l === "en" ? "en-GB" : "fr-FR");

/** Choisit un texte selon la langue : `tr(lang, "Bonjour", "Hello")`. */
export const tr = <T,>(l: Langue, fr: T, en: T): T => (l === "en" ? en : fr);

/** Même chose avec la langue du contexte : `const t = useTr(); t("Bonjour", "Hello")`. */
export const useTr = () => {
  const l = useLangue();
  return <T,>(fr: T, en: T): T => (l === "en" ? en : fr);
};

/** Nombre formaté dans la langue (séparateurs de milliers et décimale). */
export const nombre = (l: Langue, n: number, o?: Intl.NumberFormatOptions) => n.toLocaleString(locale(l), o);
