/**
 * Signature mail en HTML compatible messagerie : tableaux, styles en ligne, polices système,
 * aucune feuille externe ni image embarquée en base64 (Gmail et Outlook les refusent ou les
 * transforment en pièces jointes). Les images (photo, logo) sont appelées par leur adresse.
 */

import type { Langue } from "@/lib/outils";

export type Disposition = "classique" | "compacte" | "logo" | "filet";

export interface DonneesSignature {
  nom: string;
  poste: string;
  entreprise: string;
  telephone: string;
  mobile: string;
  email: string;
  site: string;
  adresse: string;
  linkedin: string;
  lienLibelle: string;
  lienUrl: string;
  couleur: string;
  photoUrl: string;
  logoUrl: string;
  mention: string;
}

export const DISPOSITIONS: { id: Disposition; nom: Record<Langue, string>; detail: Record<Langue, string> }[] = [
  { id: "classique", nom: { fr: "Classique", en: "Classic" }, detail: { fr: "photo ou logo à gauche, filet vertical", en: "photo or logo on the left, vertical rule" } },
  { id: "compacte", nom: { fr: "Compacte", en: "Compact" }, detail: { fr: "trois lignes, sans image", en: "three lines, no image" } },
  { id: "logo", nom: { fr: "Logo dessous", en: "Logo below" }, detail: { fr: "texte puis logo de l'entreprise", en: "text, then the company logo" } },
  { id: "filet", nom: { fr: "Filet de couleur", en: "Colour rule" }, detail: { fr: "filet horizontal au-dessus", en: "horizontal rule on top" } },
];

/** Libellés écrits dans la signature elle-même : en anglais sur la page anglaise. */
const LIBELLES: Record<Langue, { fixe: string; mobile: string }> = {
  fr: { fixe: "T", mobile: "M" },
  en: { fixe: "Office", mobile: "Mobile" },
};

const FONT = "font-family:Arial,Helvetica,sans-serif;";

export const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Ajoute https:// à une adresse saisie sans protocole ; refuse javascript: et data:. */
export const normaliserUrl = (u: string) => {
  const s = u.trim();
  if (!s) return "";
  if (/^(javascript|data|vbscript):/i.test(s)) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return "https://" + s.replace(/^\/+/, "");
};

/** Adresse affichée sans protocole ni barre finale : « www.exemple.fr ». */
const urlAffichee = (u: string) => u.replace(/^https?:\/\//i, "").replace(/\/$/, "");

/** tel: au format international si le numéro est français (06… → +336…). */
export const lienTel = (t: string) => {
  let n = t.replace(/[^\d+]/g, "");
  if (/^0\d{9}$/.test(n)) n = "+33" + n.slice(1);
  return "tel:" + n;
};

const couleurSure = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : "#1f6feb");

function lignesContact(d: DonneesSignature, c: string, sep: string, lang: Langue): string[] {
  const lib = LIBELLES[lang];
  const a = (href: string, txt: string) =>
    `<a href="${echapper(href)}" style="color:${c};text-decoration:none;">${echapper(txt)}</a>`;
  const out: string[] = [];
  const tels: string[] = [];
  if (d.telephone.trim()) tels.push(`<span style="color:#555555;">${lib.fixe}&nbsp;</span>${a(lienTel(d.telephone), d.telephone.trim())}`);
  if (d.mobile.trim()) tels.push(`<span style="color:#555555;">${lib.mobile}&nbsp;</span>${a(lienTel(d.mobile), d.mobile.trim())}`);
  if (tels.length) out.push(tels.join(sep));
  const web: string[] = [];
  if (d.email.trim()) web.push(a("mailto:" + d.email.trim(), d.email.trim()));
  const site = normaliserUrl(d.site);
  if (site) web.push(a(site, urlAffichee(site)));
  if (web.length) out.push(web.join(sep));
  if (d.adresse.trim()) out.push(`<span style="color:#555555;">${echapper(d.adresse.trim())}</span>`);
  const liens: string[] = [];
  const li = normaliserUrl(d.linkedin);
  if (li) liens.push(a(li, "LinkedIn"));
  const autre = normaliserUrl(d.lienUrl);
  if (autre) liens.push(a(autre, d.lienLibelle.trim() || urlAffichee(autre)));
  if (liens.length) out.push(liens.join(sep));
  return out;
}

const nomHtml = (d: DonneesSignature, c: string, taille = 16) =>
  d.nom.trim()
    ? `<span style="${FONT}font-size:${taille}px;font-weight:bold;color:${c};">${echapper(d.nom.trim())}</span>`
    : "";

const posteHtml = (d: DonneesSignature) => {
  const parts = [d.poste.trim(), d.entreprise.trim()].filter(Boolean).map(echapper);
  return parts.length ? `<span style="${FONT}font-size:13px;color:#333333;">${parts.join(" · ")}</span>` : "";
};

const mentionHtml = (d: DonneesSignature) =>
  d.mention.trim()
    ? `<tr><td style="${FONT}font-size:11px;line-height:15px;color:#777777;padding-top:8px;">${echapper(d.mention.trim())}</td></tr>`
    : "";

const img = (src: string, largeur: number, hauteur: number | null, alt: string, rond = false) =>
  `<img src="${echapper(src)}" width="${largeur}"${hauteur ? ` height="${hauteur}"` : ""} alt="${echapper(alt)}" style="display:block;border:0;outline:none;width:${largeur}px;${hauteur ? `height:${hauteur}px;` : "height:auto;"}${rond ? "border-radius:50%;" : ""}" />`;

const table = (inner: string) =>
  `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;${FONT}">${inner}</table>`;

const tr = (html: string, padTop = 0) =>
  html ? `<tr><td style="${FONT}font-size:13px;line-height:19px;color:#333333;${padTop ? `padding-top:${padTop}px;` : ""}">${html}</td></tr>` : "";

export function construireSignature(d: DonneesSignature, disp: Disposition, lang: Langue = "fr"): string {
  const c = couleurSure(d.couleur);
  const photo = normaliserUrl(d.photoUrl);
  const logo = normaliserUrl(d.logoUrl);
  const contacts = lignesContact(d, c, ' <span style="color:#bbbbbb;">|</span> ', lang);

  if (disp === "compacte") {
    const l1 = [nomHtml(d, c, 15), posteHtml(d)].filter(Boolean).join(' <span style="color:#bbbbbb;">|</span> ');
    return table(tr(l1) + contacts.map((l) => tr(l)).join("") + mentionHtml(d));
  }

  if (disp === "logo") {
    const corps = tr(nomHtml(d, c)) + tr(posteHtml(d)) + contacts.map((l, i) => tr(l, i === 0 ? 8 : 0)).join("");
    const logoRow = logo ? `<tr><td style="padding-top:12px;">${img(logo, 140, null, d.entreprise || "Logo")}</td></tr>` : "";
    return table(corps + logoRow + mentionHtml(d));
  }

  if (disp === "filet") {
    const filet = `<tr><td style="border-top:3px solid ${c};font-size:1px;line-height:1px;height:10px;">&nbsp;</td></tr>`;
    const corps = tr(nomHtml(d, "#111111")) + tr(posteHtml(d)) + contacts.map((l, i) => tr(l, i === 0 ? 8 : 0)).join("");
    return table(filet + corps + mentionHtml(d));
  }

  // classique : image à gauche (photo ronde, sinon logo), filet vertical, texte à droite
  const image = photo ? img(photo, 80, 80, d.nom || "Photo", true) : logo ? img(logo, 90, null, d.entreprise || "Logo") : "";
  const droite = table(tr(nomHtml(d, c)) + tr(posteHtml(d)) + contacts.map((l, i) => tr(l, i === 0 ? 8 : 0)).join(""));
  const ligne = image
    ? `<tr><td valign="top" style="padding-right:14px;">${image}</td><td valign="top" style="border-left:2px solid ${c};padding-left:14px;">${droite}</td></tr>`
    : `<tr><td valign="top" style="border-left:2px solid ${c};padding-left:14px;">${droite}</td></tr>`;
  const mention = d.mention.trim()
    ? `<tr><td colspan="2" style="${FONT}font-size:11px;line-height:15px;color:#777777;padding-top:10px;">${echapper(d.mention.trim())}</td></tr>`
    : "";
  return table(ligne + mention);
}

/** Version texte (repli quand la copie HTML est refusée, ou pour un client en texte brut). */
export function signatureTexte(d: DonneesSignature, lang: Langue = "fr"): string {
  const lib = LIBELLES[lang];
  const site = normaliserUrl(d.site);
  return [
    d.nom,
    [d.poste, d.entreprise].filter((x) => x.trim()).join(" · "),
    [d.telephone && lib.fixe + " " + d.telephone, d.mobile && lib.mobile + " " + d.mobile].filter(Boolean).join(" | "),
    [d.email, site && urlAffichee(site)].filter(Boolean).join(" | "),
    d.adresse,
    normaliserUrl(d.linkedin),
    normaliserUrl(d.lienUrl),
    d.mention,
  ]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join("\n");
}
