#!/usr/bin/env node
/**
 * sitemap.mjs — dist/sitemap.xml tiré du registre src/lib/outils.ts (RECETTE §13 et §18).
 *
 * Chaque page indexable y figure une fois, avec son `lastmod` réel et ses versions linguistiques
 * (xhtml:link hreflang fr, en, x-default), dans le même ordre que le menu. La racine (noindex),
 * les pages de compte, /gym et /card/… n'y sont pas.
 *
 * Dates : OUTILS_MAJ (pages-outils) et LAST_UPDATED (accueils) de src/lib/last-updated.ts ; pages
 * légales : la date « Dernière mise à jour » écrite dans leur fichier public/….
 *
 * Usage : node scripts/sitemap.mjs [dist]   (appelé par `npm run build`)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const SITE = 'https://75tools.fr';
const dist = resolve(process.argv[2] || 'dist');
const racine = new URL('..', import.meta.url).pathname;
const registre = await readFile(join(racine, 'src/lib/outils.ts'), 'utf8');
const maj = await readFile(join(racine, 'src/lib/last-updated.ts'), 'utf8');
const date = (nom) => maj.match(new RegExp(`${nom} = '(\\d{4}-\\d{2}-\\d{2})'`))[1];
const OUTILS_MAJ = date('OUTILS_MAJ');
const ACCUEIL_MAJ = date('LAST_UPDATED');

// Paires fr / en du registre, dans l'ordre : chaque entrée d'outil porte d'abord fr puis en.
const hrefs = [...registre.matchAll(/href: "(\/[^"]+\/)"/g)].map((m) => m[1]);
const paires = [];
for (let i = 0; i < hrefs.length; i += 2) paires.push({ fr: hrefs[i], en: hrefs[i + 1], lastmod: OUTILS_MAJ });
for (const p of paires) {
  if (p.fr.startsWith('/en/') || !p.en.startsWith('/en/')) throw new Error(`sitemap : paire inattendue ${p.fr} / ${p.en}`);
}

async function dateLegale(chemin) {
  const html = await readFile(join(racine, 'public', chemin, 'index.html'), 'utf8');
  const m = html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/);
  if (!m) throw new Error(`sitemap : pas de <time datetime> dans public${chemin}index.html`);
  return m[1];
}
const fixes = [
  { fr: '/fr/', en: '/en/', lastmod: ACCUEIL_MAJ },
  { fr: '/mentions-legales/', en: '/en/legal-notice/', lastmod: await dateLegale('/mentions-legales/') },
  { fr: '/confidentialite/', en: '/en/privacy/', lastmod: await dateLegale('/confidentialite/') },
];

const alt = (p) =>
  `    <xhtml:link rel="alternate" hreflang="fr" href="${SITE}${p.fr}"/>\n` +
  `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}${p.en}"/>\n` +
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${p.fr}"/>`;
const url = (loc, p) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n${alt(p)}\n  </url>`;

const blocs = [];
for (const p of [fixes[0], ...paires, fixes[1], fixes[2]]) blocs.push(url(p.fr, p), url(p.en, p));
blocs.splice(2, 0, `  <url>\n    <loc>${SITE}/mycard/</loc>\n    <lastmod>${ACCUEIL_MAJ}</lastmod>\n  </url>`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocs.join('\n')}
</urlset>
`;
await writeFile(join(dist, 'sitemap.xml'), xml);
console.log(`sitemap: ${blocs.length} adresses écrites dans dist/sitemap.xml`);
