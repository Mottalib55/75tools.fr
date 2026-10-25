/**
 * vCard 3.0 (RFC 2426) pour un QR code de carte de visite.
 * - Échappement des valeurs texte : \ , ; et retour à la ligne (§4 de la RFC).
 * - Lignes terminées par CRLF ; pas de pliage à 75 octets (recommandé, non obligatoire) :
 *   il couperait un caractère accentué et grossirait le QR code.
 * - Champs vides omis ; N est toujours présent (obligatoire en 3.0), FN aussi.
 */

export interface Contact {
  prenom: string;
  nom: string;
  entreprise: string;
  poste: string;
  mobile: string;
  telephone: string;
  email: string;
  site: string;
  rue: string;
  codePostal: string;
  ville: string;
  pays: string;
  note: string;
}

export const echapperVcard = (s: string) =>
  s
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

/** Numéro saisi « 06 12 34 56 78 » → « +33612345678 » ; autres formats gardés tels quels (chiffres et +). */
export const telInternational = (t: string) => {
  let n = t.replace(/[^\d+]/g, "");
  if (/^0\d{9}$/.test(n)) n = "+33" + n.slice(1);
  if (n.startsWith("00")) n = "+" + n.slice(2);
  return n;
};

const urlComplete = (u: string) => {
  const s = u.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
};

export function construireVcard(c: Contact): string {
  const e = echapperVcard;
  const l: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  l.push(`N:${e(c.nom)};${e(c.prenom)};;;`);
  const fn = [c.prenom.trim(), c.nom.trim()].filter(Boolean).join(" ") || c.entreprise.trim();
  l.push(`FN:${e(fn)}`);
  if (c.entreprise.trim()) l.push(`ORG:${e(c.entreprise)}`);
  if (c.poste.trim()) l.push(`TITLE:${e(c.poste)}`);
  if (c.mobile.trim()) l.push(`TEL;TYPE=CELL:${telInternational(c.mobile)}`);
  if (c.telephone.trim()) l.push(`TEL;TYPE=WORK,VOICE:${telInternational(c.telephone)}`);
  if (c.email.trim()) l.push(`EMAIL;TYPE=INTERNET:${c.email.trim()}`);
  if (c.site.trim()) l.push(`URL:${urlComplete(c.site)}`);
  if ([c.rue, c.codePostal, c.ville, c.pays].some((x) => x.trim())) {
    // ADR : boîte postale ; complément ; rue ; ville ; région ; code postal ; pays
    l.push(`ADR;TYPE=WORK:;;${e(c.rue)};${e(c.ville)};;${e(c.codePostal)};${e(c.pays)}`);
  }
  if (c.note.trim()) l.push(`NOTE:${e(c.note)}`);
  l.push("END:VCARD");
  return l.join("\r\n");
}

/** Taille en octets UTF-8 : c'est elle qui fixe la densité du QR code. */
export const octets = (s: string) => new TextEncoder().encode(s).length;
