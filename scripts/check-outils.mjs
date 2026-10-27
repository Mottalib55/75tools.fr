#!/usr/bin/env node
/**
 * check-outils.mjs — les pages-outils de src/lib/outils.ts sont-elles toutes servies, dans les deux langues ?
 *
 * Pour chaque adresse du registre (française et anglaise) : présente dans dist/sitemap.xml ;
 * dist/<route>/index.html existe, avec un seul <title>, une meta description, un canonical égal à
 * https://75tools.fr<route>, les hreflang fr, en et x-default vers les deux versions, un seul H1,
 * le cadre de l'outil (`data-outil`), la bonne langue (<html lang>) et aucune ébauche (« Ébauche. »).
 * Compte aussi les pages HTML servies (RECETTE §3 : 100 au plus, 404 exclue).
 *
 * Usage : node scripts/check-outils.mjs [dist]   — code 1 au moindre écart.
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SITE = 'https://75tools.fr';
const dist = resolve(process.argv[2] || 'dist');
const racine = resolve(dist, '..');
const registre = await readFile(join(racine, 'src/lib/outils.ts'), 'utf8');
const hrefs = [...registre.matchAll(/href: "(\/[^"]+\/)"/g)].map((m) => m[1]);
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? await readFile(join(dist, 'sitemap.xml'), 'utf8') : '';
const ecarts = [];

for (let i = 0; i < hrefs.length; i += 2) {
  const paire = { fr: hrefs[i], en: hrefs[i + 1] };
  for (const lang of ['fr', 'en']) {
    const h = paire[lang];
    if (!sitemap.includes(`<loc>${SITE}${h}</loc>`)) ecarts.push(`${h} : absent du sitemap`);
    const f = join(dist, h, 'index.html');
    if (!existsSync(f)) { ecarts.push(`${h} : ${f} absent (pré-rendu)`); continue; }
    const html = await readFile(f, 'utf8');
    const titres = [...html.matchAll(/<title[^>]*>([^<]*)<\/title>/g)];
    const desc = [...html.matchAll(/<meta[^>]+name="description"[^>]*>/g)];
    const canon = [...html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    const alt = Object.fromEntries([...html.matchAll(/<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi)].map((m) => [m[1], m[2]]));
    if (titres.length !== 1) ecarts.push(`${h} : ${titres.length} balise(s) <title>`);
    if (desc.length !== 1) ecarts.push(`${h} : ${desc.length} meta description`);
    if (canon.length !== 1 || canon[0] !== `${SITE}${h}`) ecarts.push(`${h} : canonical ${canon.join(', ') || 'absent'}`);
    if (alt.fr !== `${SITE}${paire.fr}` || alt.en !== `${SITE}${paire.en}` || alt['x-default'] !== `${SITE}${paire.fr}`)
      ecarts.push(`${h} : hreflang incomplet (${JSON.stringify(alt)})`);
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) ecarts.push(`${h} : ${(html.match(/<h1[\s>]/g) || []).length} H1`);
    if (!/<main[^>]*>[\s\S]*data-outil/.test(html)) ecarts.push(`${h} : pas de cadre data-outil dans <main>`);
    if (!new RegExp(`<html[^>]*lang="${lang}`).test(html)) ecarts.push(`${h} : <html lang> n'est pas « ${lang} »`);
    if (html.includes('Ébauche.')) ecarts.push(`${h} : page encore à l'état d'ébauche`);
  }
}

// Pages HTML servies (404 exclue) : RECETTE §3, 100 au plus.
async function compter(d) {
  let n = 0;
  for (const e of await readdir(d, { withFileTypes: true })) {
    if (e.isDirectory()) n += await compter(join(d, e.name));
    else if (e.name.endsWith('.html') && e.name !== '404.html') n++;
  }
  return n;
}
const pages = await compter(dist);
console.log(`check-outils : ${hrefs.length / 2} outils × 2 langues au registre, ${pages} pages HTML servies (plafond 100)`);
if (pages > 100) ecarts.push(`${pages} pages HTML servies, au-delà du plafond de 100 (RECETTE §3)`);
for (const e of ecarts) console.log('  ' + e);
if (ecarts.length) { console.log(`check-outils : ${ecarts.length} écart(s)`); process.exit(1); }
console.log('check-outils : OK');
