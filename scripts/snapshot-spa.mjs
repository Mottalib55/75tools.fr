#!/usr/bin/env node
/**
 * snapshot-spa.mjs — HTML complet pour une application React monopage (RECETTE §15).
 *
 * Une application Vite + React Router sert une coquille vide : Bing et les outils de la
 * factory (check-trame, typo-nbsp…) ne voient que le texte de secours. Ce script ouvre
 * chaque page déjà écrite dans dist/ (une par route, avec son <head> propre) dans un
 * navigateur sans interface, attend que React ait rendu la page (un <h1> dans #root et plus
 * de requête en cours) et remplace le contenu de <div id="root"> par le rendu obtenu.
 *
 * Le <head> du fichier (titre, description, canonical, hreflang) est conservé ; seul #root
 * change. L'application garde createRoot : au chargement, React remplace ce HTML par le
 * même rendu — rien n'est hydraté, donc aucun risque d'écart d'hydratation.
 *
 * Usage : node snapshot-spa.mjs dist [--only /chemin/] [--concurrency 6]
 *         (Playwright doit être installé : `npx playwright install chromium`)
 */
import { createServer } from 'node:http';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(process.env.PLAYWRIGHT_DIR || '', 'playwright'))); }

const dist = resolve(process.argv[2] || 'dist');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const CONC = Number(process.argv.includes('--concurrency') ? process.argv[process.argv.indexOf('--concurrency') + 1] : 6);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };

// Serveur statique : fichier exact, sinon <chemin>/index.html, sinon la coquille (routes SPA).
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const tries = [join(dist, url), join(dist, url, 'index.html'), join(dist, 'index.html')];
  for (const p of tries) {
    try {
      if ((await stat(p)).isFile()) {
        res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
        return res.end(await readFile(p));
      }
    } catch {}
  }
  res.writeHead(404); res.end();
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const pages = [];
const walk = async (d) => {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'assets') await walk(p); } else if (e.name === 'index.html') pages.push(p);
  }
};
await walk(dist);

const browser = await chromium.launch();
let done = 0, failed = [];
const queue = pages.filter((p) => !only || p.endsWith(join(only, 'index.html')));
async function worker() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Pas de mesure d'audience pendant la capture
  await page.route(/googletagmanager|google-analytics|clarity\.ms/, (r) => r.abort());
  while (queue.length) {
    const file = queue.shift();
    const route = file.slice(dist.length).replace(/index\.html$/, '') || '/';
    // Page non indexable (admin, embed) : pas besoin de HTML complet
    if (/<meta[^>]+robots[^>]+noindex/i.test(await readFile(file, 'utf8'))) continue;
    try {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForSelector('#root h1', { timeout: 20000 });
      await page.waitForTimeout(300);
      const inner = await page.evaluate(() => document.getElementById('root').innerHTML);
      const lang = await page.evaluate(() => document.documentElement.lang);
      // Schémas ajoutés au <head> à l'exécution (useFAQSchema…) : recopiés s'ils manquent au fichier
      const lds = await page.evaluate(() => [...document.head.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent));
      let html = await readFile(file, 'utf8');
      const extra = lds.filter((t) => t && !html.includes(t)).map((t) => `<script type="application/ld+json">${t.replace(/</g, '\\u003c')}</script>`).join('');
      if (extra) html = html.replace('</head>', extra + '</head>');
      const a = html.indexOf('<div id="root">');
      const b = html.lastIndexOf('</div>', html.indexOf('</body>'));
      if (a < 0 || b < a) throw new Error('#root introuvable');
      html = html.slice(0, a) + '<div id="root">' + inner + html.slice(b);
      if (lang) html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
      // Le <title> posé par l'application (useSEO…) fait foi, typographie comprise
      const title = await page.evaluate(() => document.title);
      if (title) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`);
      await writeFile(file, html);
      done++;
    } catch (e) {
      failed.push(`${route} : ${e.message.split('\n')[0]}`);
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: CONC }, worker));
await browser.close();
server.close();
console.log(`snapshot-spa: ${done} page(s) rendue(s)${failed.length ? `, ${failed.length} échec(s) :\n  ` + failed.join('\n  ') : ''}`);
if (failed.length) process.exit(1);
