/**
 * Date de mise à jour de l'accueil, affichée en pied de page en toutes lettres (RECETTE §8.4) :
 * celle du dernier commit qui a touché l'accueil (src/pages/Hub.tsx, 27 octobre 2026), jamais
 * inventée. À changer avec le contenu de l'accueil ; la même date figure dans index.html (<noscript>).
 */
export const LAST_UPDATED = '2026-10-27';

export function displayDate(iso: string, lang: 'fr' | 'en'): string {
  const s = new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return lang === 'fr' ? s.replace(/^1 /, '1er ') : s;
}
