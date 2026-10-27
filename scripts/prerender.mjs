#!/usr/bin/env node
/**
 * prerender.mjs — une vraie page HTML par route publique (RECETTE §15).
 *
 * L'application est servie en coquille vide : Google ne voyait que « 75tools s'affiche avec
 * JavaScript », et /fr, /en, /mycard n'existaient que par la page 404 de GitHub Pages
 * (constat du 2026-10-25). Après `vite build`, ce script ouvre chaque route dans Chrome sans
 * interface et écrit le document rendu dans dist/<route>/index.html : texte, titre,
 * description et canonical propres à la page.
 *
 * Les balises posées par react-helmet (data-rh) remplacent celles de la coquille du même nom,
 * pour ne laisser qu'un titre, une description et un canonical par page. L'application garde
 * createRoot : au chargement, React remplace ce HTML par le même rendu.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const ROUTES = ['/', '/fr', '/en', '/mycard',
  // Pages-outils : même liste que src/lib/outils.ts (contrôle : scripts/check-outils.mjs)
  '/compresser-pdf',
  '/fusionner-pdf',
  '/separer-pdf',
  '/jpg-en-pdf',
  '/pdf-en-jpg',
  '/signer-pdf',
  '/heic-en-jpg',
  '/png-en-jpg',
  '/webp-en-jpg',
  '/redimensionner-image',
  '/supprimer-fond-image',
  '/photo-identite',
  '/creer-un-logo',
  '/generateur-qr-code',
  '/qr-code-wifi',
  '/qr-code-pdf',
  '/qr-code-whatsapp',
  '/qr-code-avis-google',
  '/lire-qr-code',
  '/generateur-facture',
  '/generateur-devis',
  '/modele-cv',
  '/lettre-de-resiliation',
  '/attestation-hebergement',
  '/attestation-sur-l-honneur',
  '/signature-mail',
  '/signature-outlook',
  '/signature-gmail',
  '/carte-de-visite-qr-code',
  '/modele-carte-de-visite',
  '/carte-de-visite-nfc',
  '/calculer-un-pourcentage',
  '/calcul-ht-ttc',
  '/calcul-marge-commerciale',
  '/nombre-de-jours-entre-deux-dates',
  '/calculateur-age',
  '/chronometre',
  '/minuteur',
  '/compte-a-rebours',
  '/tirage-au-sort',
  '/roue-de-la-chance',
  '/compteur-de-mots',
  '/compteur-de-caracteres',
  '/generateur-mot-de-passe',
  '/generateur-lorem-ipsum',
  '/test-vitesse-de-frappe'];
const dist = resolve(process.argv[2] || 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };
const coquille = await readFile(join(dist, 'index.html'), 'utf8');

// Serveur statique : fichier exact, sinon la coquille (routes de l'application).
const server = createServer(async (req, res) => {
  const p = join(dist, decodeURIComponent(req.url.split('?')[0]));
  try {
    if ((await stat(p)).isFile()) {
      res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
      return res.end(await readFile(p));
    }
  } catch {}
  res.writeHead(200, { 'content-type': TYPES['.html'] });
  res.end(coquille);
});
await new Promise((ok) => server.listen(0, ok));
const base = `http://localhost:${server.address().port}`;

// Chrome du système : macOS en local, /usr/bin/google-chrome sur les machines GitHub Actions.
const chrome = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome']
  .find((c) => c && existsSync(c));
const browser = await chromium.launch({ executablePath: chrome });
const context = await browser.newContext({ locale: 'fr-FR' });
// Pas de mesure d'audience ni d'appel à la base pendant le rendu.
await context.route(/googletagmanager|google-analytics|clarity\.ms|supabase\.co/, (r) => r.abort());

for (const route of ROUTES) {
  const page = await context.newPage();
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('#root h1', { timeout: 15000 });
  const html = await page.evaluate(() => {
    const cle = (el) => el.tagName === 'TITLE' ? 'title'
      : el.getAttribute('name') ? 'name:' + el.getAttribute('name')
      : el.getAttribute('property') ? 'property:' + el.getAttribute('property')
      : el.tagName === 'LINK' && el.rel === 'canonical' ? 'canonical' : null;
    const helmet = new Set([...document.head.querySelectorAll('[data-rh]')].map(cle).filter(Boolean));
    for (const el of document.head.querySelectorAll('title, meta, link[rel="canonical"]')) {
      if (!el.hasAttribute('data-rh') && helmet.has(cle(el))) el.remove();
    }
    return '<!doctype html>\n' + document.documentElement.outerHTML;
  });
  const dossier = join(dist, route);
  await mkdir(dossier, { recursive: true });
  await writeFile(join(dossier, 'index.html'), html);
  console.log(`prerender: ${route} (${Math.round(html.length / 1024)} Ko)`);
  await page.close();
}
await browser.close();
server.close();
