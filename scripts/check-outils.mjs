#!/usr/bin/env node
/**
 * check-outils.mjs — les pages-outils de src/lib/outils.ts sont-elles toutes servies ?
 *
 * Pour chaque adresse du registre : présente dans ROUTES (scripts/prerender.mjs), dans
 * public/sitemap.xml et dans App.tsx ; dist/<route>/index.html existe, avec un seul <title>,
 * une meta description, un canonical égal à https://75tools.fr<route>, un H1, et aucune
 * ébauche (« Ébauche. »). Compte aussi les pages HTML servies (RECETTE §3 : 100 au plus,
 * 404 exclue).
 *
 * Usage : node scripts/check-outils.mjs [dist]   — code 1 au moindre écart.
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.argv[2] || 'dist');
const racine = resolve(dist, '..');
const registre = await readFile(join(racine, 'src/lib/outils.ts'), 'utf8');
const hrefs = [...registre.matchAll(/href: "(\/[^"]+\/)"/g)].map((m) => m[1]);
const prerender = await readFile(join(racine, 'scripts/prerender.mjs'), 'utf8');
const sitemap = await readFile(join(racine, 'public/sitemap.xml'), 'utf8');
const app = await readFile(join(racine, 'src/App.tsx'), 'utf8');
const ecarts = [];

for (const h of hrefs) {
  const r = h.replace(/\/$/, '');
  if (!prerender.includes(`'${r}'`)) ecarts.push(`${h} : absent de ROUTES (prerender.mjs)`);
  if (!sitemap.includes(`<loc>https://75tools.fr${h}</loc>`)) ecarts.push(`${h} : absent du sitemap`);
  if (!app.includes(`path="${r}"`)) ecarts.push(`${h} : pas de route dans App.tsx`);
  const f = join(dist, r, 'index.html');
  if (!existsSync(f)) { ecarts.push(`${h} : ${f} absent (pré-rendu)`); continue; }
  const html = await readFile(f, 'utf8');
  const titres = [...html.matchAll(/<title[^>]*>([^<]*)<\/title>/g)];
  const desc = [...html.matchAll(/<meta[^>]+name="description"[^>]*>/g)];
  const canon = [...html.matchAll(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  if (titres.length !== 1) ecarts.push(`${h} : ${titres.length} balise(s) <title>`);
  if (desc.length !== 1) ecarts.push(`${h} : ${desc.length} meta description`);
  if (canon.length !== 1 || canon[0] !== `https://75tools.fr${h}`) ecarts.push(`${h} : canonical ${canon.join(', ') || 'absent'}`);
  if (!/<h1[\s>]/.test(html)) ecarts.push(`${h} : pas de H1`);
  if (html.includes('Ébauche.')) ecarts.push(`${h} : page encore à l'état d'ébauche`);
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
console.log(`check-outils : ${hrefs.length} pages-outils au registre, ${pages} pages HTML servies (plafond 100)`);
if (pages > 100) ecarts.push(`${pages} pages HTML servies, au-delà du plafond de 100 (RECETTE §3)`);
for (const e of ecarts) console.log('  ' + e);
if (ecarts.length) { console.log(`check-outils : ${ecarts.length} écart(s)`); process.exit(1); }
console.log('check-outils : OK');
