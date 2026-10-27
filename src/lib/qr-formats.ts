/**
 * Contenus des QR codes spécialisés (wifi, WhatsApp, avis Google, lien vers un PDF) et
 * reconnaissance du type d'un contenu décodé. Fonctions pures, testables hors navigateur.
 * Les fonctions qui produisent un message prennent un paramètre `lang` facultatif ("fr" par défaut).
 */
import type { Langue } from "@/lib/langue";

const tx = (lang: Langue, fr: string, en: string) => (lang === "en" ? en : fr);

/* ---------- Wifi (format « WIFI: » décrit par ZXing, Barcode Contents) ---------- */

export type SecuriteWifi = "WPA" | "WEP" | "nopass";

/** Échappe \ ; , " : par une barre oblique inverse, comme le demande la spécification ZXing. */
export const echapperWifi = (s: string) => s.replace(/([\\;,":])/g, "\\$1");

export function contenuWifi(o: { ssid: string; motDePasse: string; securite: SecuriteWifi; masque: boolean }): string {
  let t = `WIFI:T:${o.securite};S:${echapperWifi(o.ssid)};`;
  if (o.securite !== "nopass") t += `P:${echapperWifi(o.motDePasse)};`;
  if (o.masque) t += "H:true;";
  return t + ";";
}

/** Lecture inverse d'un contenu WIFI:, en respectant les échappements. */
export function lireWifi(t: string): { ssid: string; motDePasse: string; securite: string; masque: boolean } | null {
  if (!/^WIFI:/i.test(t)) return null;
  const champs: Record<string, string> = {};
  let i = 5;
  while (i < t.length) {
    let cle = "";
    while (i < t.length && t[i] !== ":" && t[i] !== ";") cle += t[i++];
    if (t[i] !== ":") {
      i++;
      continue;
    }
    i++;
    let val = "";
    while (i < t.length && t[i] !== ";") {
      if (t[i] === "\\" && i + 1 < t.length) {
        val += t[i + 1];
        i += 2;
      } else val += t[i++];
    }
    i++;
    if (cle) champs[cle.toUpperCase()] = val;
  }
  if (!("S" in champs)) return null;
  return { ssid: champs.S, motDePasse: champs.P ?? "", securite: champs.T || "nopass", masque: champs.H === "true" };
}

/* ---------- WhatsApp (liens wa.me, FAQ « Cliquer pour discuter ») ---------- */

export interface Pays {
  code: string; // indicatif sans +
  nom: string;
  nomEn: string;
  zeroInitial: boolean; // le 0 national est retiré au format international
}

export const PAYS_WHATSAPP: Pays[] = [
  { code: "33", nom: "France métropolitaine (+33)", nomEn: "Metropolitan France (+33)", zeroInitial: true },
  { code: "262", nom: "La Réunion, Mayotte (+262)", nomEn: "Réunion, Mayotte (+262)", zeroInitial: true },
  { code: "590", nom: "Guadeloupe (+590)", nomEn: "Guadeloupe (+590)", zeroInitial: true },
  { code: "596", nom: "Martinique (+596)", nomEn: "Martinique (+596)", zeroInitial: true },
  { code: "594", nom: "Guyane (+594)", nomEn: "French Guiana (+594)", zeroInitial: true },
  { code: "32", nom: "Belgique (+32)", nomEn: "Belgium (+32)", zeroInitial: true },
  { code: "41", nom: "Suisse (+41)", nomEn: "Switzerland (+41)", zeroInitial: true },
  { code: "352", nom: "Luxembourg (+352)", nomEn: "Luxembourg (+352)", zeroInitial: false },
  { code: "1", nom: "Canada, États-Unis (+1)", nomEn: "Canada, United States (+1)", zeroInitial: false },
  { code: "212", nom: "Maroc (+212)", nomEn: "Morocco (+212)", zeroInitial: true },
  { code: "213", nom: "Algérie (+213)", nomEn: "Algeria (+213)", zeroInitial: true },
  { code: "216", nom: "Tunisie (+216)", nomEn: "Tunisia (+216)", zeroInitial: false },
  { code: "221", nom: "Sénégal (+221)", nomEn: "Senegal (+221)", zeroInitial: false },
  { code: "225", nom: "Côte d'Ivoire (+225)", nomEn: "Côte d'Ivoire (+225)", zeroInitial: false },
  { code: "44", nom: "Royaume-Uni (+44)", nomEn: "United Kingdom (+44)", zeroInitial: true },
  { code: "353", nom: "Irlande (+353)", nomEn: "Ireland (+353)", zeroInitial: true },
  { code: "49", nom: "Allemagne (+49)", nomEn: "Germany (+49)", zeroInitial: true },
  { code: "34", nom: "Espagne (+34)", nomEn: "Spain (+34)", zeroInitial: false },
  { code: "351", nom: "Portugal (+351)", nomEn: "Portugal (+351)", zeroInitial: false },
];

/**
 * « 06 12 34 56 78 » + France → « 33612345678 ». Un numéro saisi avec + ou 00 garde son indicatif.
 * Renvoie aussi une remarque quand la saisie a été transformée ou paraît incomplète.
 */
export function numeroInternational(saisie: string, pays: Pays, lang: Langue = "fr"): { numero: string; remarque: string } {
  const brut = saisie.trim();
  if (!brut) return { numero: "", remarque: "" };
  const chiffres = brut.replace(/[^\d+]/g, "");
  if (/[a-z]/i.test(brut)) return { numero: "", remarque: tx(lang, "Le numéro ne doit contenir que des chiffres.", "The number must contain digits only.") };
  let n: string;
  let remarque = "";
  if (chiffres.startsWith("+")) n = chiffres.slice(1).replace(/\+/g, "");
  else if (chiffres.startsWith("00")) n = chiffres.slice(2);
  else {
    let national = chiffres.replace(/\+/g, "");
    if (pays.zeroInitial && national.startsWith("0")) national = national.slice(1);
    n = pays.code + national;
    remarque = tx(
      lang,
      `Converti au format international : indicatif ${pays.code}${pays.zeroInitial ? ", sans le 0 initial" : ""}.`,
      `Converted to international format: country code ${pays.code}${pays.zeroInitial ? ", leading 0 removed" : ""}.`
    );
  }
  if (n.length < 8) remarque = tx(lang, "Le numéro paraît incomplet.", "The number looks incomplete.");
  else if (n.length > 15)
    remarque = tx(
      lang,
      "Le numéro paraît trop long : un numéro international compte au plus 15 chiffres.",
      "The number looks too long: an international number has at most 15 digits."
    );
  return { numero: n, remarque };
}

export function lienWhatsapp(numero: string, message: string): string {
  const base = `https://wa.me/${numero}`;
  const m = message.trim() ? message : "";
  return m ? `${base}?text=${encodeURIComponent(m)}` : base;
}

/* ---------- Avis Google ---------- */

const HOTES_GOOGLE = /(^|\.)(g\.page|google\.[a-z.]+|goo\.gl|maps\.app\.goo\.gl)$/i;

export type ResultatAvis =
  | { ok: true; lien: string; remarque: string; mode: "lien" | "placeid" }
  | { ok: false; erreur: string };

export function lienAvisGoogle(saisie: string, lang: Langue = "fr"): ResultatAvis {
  const s = saisie.trim();
  if (!s) return { ok: false, erreur: "" };
  // Identifiant de lieu seul (souvent « ChIJ… »)
  if (/^[A-Za-z0-9_-]{20,}$/.test(s) && !/^https?/i.test(s)) {
    return {
      ok: true,
      mode: "placeid",
      lien: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(s)}`,
      remarque: tx(
        lang,
        "Lien construit à partir de l'identifiant de lieu. Scannez-le pour vérifier qu'il ouvre bien la fenêtre d'avis de votre établissement.",
        "Link built from the Place ID. Scan it to check that it opens the review window of your business."
      ),
    };
  }
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return { ok: false, erreur: tx(lang, "Ce n'est ni une adresse web ni un identifiant de lieu.", "This is neither a web address nor a Place ID.") };
  }
  if (!HOTES_GOOGLE.test(u.hostname)) {
    return {
      ok: false,
      erreur: tx(
        lang,
        `L'adresse mène à ${u.hostname}, pas à Google. Collez le lien copié depuis votre fiche d'établissement.`,
        `This address leads to ${u.hostname}, not to Google. Paste the link copied from your Business Profile.`
      ),
    };
  }
  if (u.protocol === "http:") u.protocol = "https:";
  const placeid = u.searchParams.get("placeid");
  let remarque = tx(lang, "Lien Google reconnu.", "Google link recognised.");
  if (/^maps\.app\.goo\.gl$/i.test(u.hostname) || /\/maps\//.test(u.pathname)) {
    remarque = tx(
      lang,
      "Ce lien ressemble à un lien de partage Google Maps : il ouvre la fiche, pas forcément la fenêtre d'avis. Préférez le lien d'avis copié depuis votre fiche d'établissement.",
      "This looks like a Google Maps share link: it opens the listing, not necessarily the review window. Prefer the review link copied from your Business Profile."
    );
  } else if (/writereview/.test(u.pathname) && placeid) {
    remarque = tx(lang, "Lien d'avis avec identifiant de lieu reconnu.", "Review link with a Place ID recognised.");
  } else if (/^g\.page$/i.test(u.hostname) && /\/review/.test(u.pathname)) {
    remarque = tx(lang, "Lien d'avis fourni par Google reconnu.", "Review link supplied by Google recognised.");
  }
  return { ok: true, mode: "lien", lien: u.toString(), remarque };
}

/* ---------- Lien vers un PDF ---------- */

export type ServicePdf = "drive" | "dropbox" | "onedrive" | "transfert" | "site";

export interface AnalysePdf {
  ok: boolean;
  lien: string; // adresse normalisée (https)
  erreur?: string;
  alertes: string[];
  service?: ServicePdf;
  hote?: string;
  pdf?: boolean; // l'adresse finit par .pdf
  dropboxMode?: "dl0" | "dl1" | "raw1" | "aucun";
}

export function analyserLienPdf(saisie: string, lang: Langue = "fr"): AnalysePdf {
  const s = saisie.trim();
  const alertes: string[] = [];
  if (!s) return { ok: false, lien: "", alertes };
  if (/^(file:|[a-z]:\\|\/Users\/|\/home\/|~\/)/i.test(s)) {
    return {
      ok: false,
      lien: "",
      alertes,
      erreur: tx(
        lang,
        "C'est l'emplacement du fichier sur votre ordinateur : un téléphone ne peut pas l'ouvrir. Mettez d'abord le PDF en ligne, puis collez son lien de partage.",
        "This is where the file sits on your computer: a phone cannot open it. Put the PDF online first, then paste its sharing link."
      ),
    };
  }
  let u: URL;
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return { ok: false, lien: "", alertes, erreur: tx(lang, "Cette adresse n'est pas valide.", "This address is not valid.") };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return { ok: false, lien: "", alertes, erreur: tx(lang, "L'adresse doit commencer par https://.", "The address must start with https://.") };
  }
  if (!u.hostname.includes(".")) {
    return { ok: false, lien: "", alertes, erreur: tx(lang, "Le nom de domaine paraît incomplet.", "The domain name looks incomplete.") };
  }
  if (u.protocol === "http:") {
    alertes.push(
      tx(
        lang,
        "L'adresse commençait par http:// : elle a été passée en https://. Vérifiez qu'elle s'ouvre toujours, sinon le navigateur du téléphone affichera un avertissement.",
        "The address started with http://: it has been switched to https://. Check that it still opens, otherwise the phone's browser will show a warning."
      )
    );
    u.protocol = "https:";
  }
  const h = u.hostname.toLowerCase();
  let service: ServicePdf = "site";
  if (/(^|\.)drive\.google\.com$|(^|\.)docs\.google\.com$/.test(h)) service = "drive";
  else if (/(^|\.)dropbox\.com$|(^|\.)db\.tt$/.test(h)) service = "dropbox";
  else if (/(^|\.)onedrive\.live\.com$|(^|\.)1drv\.ms$|\.sharepoint\.com$/.test(h)) service = "onedrive";
  else if (/(^|\.)(wetransfer\.com|we\.tl|smash\.gg|fromsmash\.com|swisstransfer\.com|grosfichiers\.com)$/.test(h)) service = "transfert";
  const pdf = /\.pdf$/i.test(u.pathname);
  let dropboxMode: AnalysePdf["dropboxMode"];
  if (service === "dropbox") {
    if (u.searchParams.get("raw") === "1") dropboxMode = "raw1";
    else if (u.searchParams.get("dl") === "1") dropboxMode = "dl1";
    else if (u.searchParams.get("dl") === "0") dropboxMode = "dl0";
    else dropboxMode = "aucun";
  }
  if (service === "drive" && /\/edit/.test(u.pathname)) {
    alertes.push(
      tx(
        lang,
        "Le lien se termine par /edit : c'est l'adresse de modification. Vérifiez que le rôle donné aux visiteurs est « Lecteur ».",
        "The link ends in /edit: that is the editing address. Check that visitors are given the Viewer role."
      )
    );
  }
  if (service === "transfert") {
    alertes.push(
      tx(
        lang,
        "Les services d'envoi de fichiers donnent en général des liens à durée limitée : une fois le lien expiré, le QR code imprimé ne mènera plus à rien. Hébergez plutôt le PDF sur un espace de stockage ou sur votre site.",
        "File transfer services usually give links that expire: once the link is dead, the printed QR code leads nowhere. Host the PDF on a cloud drive or on your website instead."
      )
    );
  }
  return { ok: true, lien: u.toString(), alertes, service, hote: h, pdf, dropboxMode };
}

/** Change le paramètre d'affichage d'un lien Dropbox (dl=0, dl=1 ou raw=1). */
export function modeDropbox(lien: string, mode: "dl0" | "dl1" | "raw1"): string {
  const u = new URL(lien);
  u.searchParams.delete("dl");
  u.searchParams.delete("raw");
  if (mode === "raw1") u.searchParams.set("raw", "1");
  else u.searchParams.set("dl", mode === "dl1" ? "1" : "0");
  return u.toString();
}

/* ---------- Reconnaissance du contenu d'un QR code lu ---------- */

export type TypeContenu =
  | { type: "lien"; url: URL }
  | { type: "whatsapp"; url: URL; numero: string; message: string }
  | { type: "wifi"; ssid: string; motDePasse: string; securite: string; masque: boolean }
  | { type: "vcard"; nom: string }
  | { type: "email"; adresse: string }
  | { type: "telephone"; numero: string }
  | { type: "sms"; numero: string }
  | { type: "geo"; coordonnees: string }
  | { type: "otp" }
  | { type: "texte" };

export function reconnaitre(t: string): TypeContenu {
  const s = t.trim();
  const wifi = lireWifi(s);
  if (wifi) return { type: "wifi", ...wifi };
  if (/^BEGIN:VCARD/i.test(s)) {
    const fn = s.match(/^FN(?:;[^:\r\n]*)?:(.*)$/im);
    return { type: "vcard", nom: fn ? fn[1].replace(/\\([,;\\])/g, "$1").trim() : "" };
  }
  if (/^MECARD:/i.test(s)) {
    const n = s.match(/N:([^;]*)/i);
    return { type: "vcard", nom: n ? n[1].replace(/,/g, " ").trim() : "" };
  }
  if (/^mailto:/i.test(s)) return { type: "email", adresse: decodeURIComponent(s.slice(7).split("?")[0]) };
  if (/^tel:/i.test(s)) return { type: "telephone", numero: s.slice(4) };
  if (/^(sms|smsto):/i.test(s)) return { type: "sms", numero: s.replace(/^(sms|smsto):/i, "").split(/[:?]/)[0] };
  if (/^geo:/i.test(s)) return { type: "geo", coordonnees: s.slice(4).split("?")[0] };
  if (/^otpauth:/i.test(s)) return { type: "otp" };
  if (/^https?:\/\/\S+$/i.test(s)) {
    try {
      const url = new URL(s);
      const h = url.hostname.toLowerCase();
      if (h === "wa.me" || h === "api.whatsapp.com" || h === "whatsapp.com" || h === "www.whatsapp.com") {
        const numero = h === "wa.me" ? url.pathname.replace(/\//g, "") : url.searchParams.get("phone") ?? "";
        return { type: "whatsapp", url, numero, message: url.searchParams.get("text") ?? "" };
      }
      return { type: "lien", url };
    } catch {
      return { type: "texte" };
    }
  }
  return { type: "texte" };
}

/** Domaine enregistrable approximatif : « www.paiement.exemple.fr » → « exemple.fr ». */
export function domainePrincipal(hote: string): string {
  const p = hote.toLowerCase().replace(/\.$/, "").split(".");
  if (p.length <= 2) return p.join(".");
  const doubles = /^(co|com|gouv|org|net|ac|gov|asso|nom)$/;
  if (doubles.test(p[p.length - 2]) && p[p.length - 1].length === 2) return p.slice(-3).join(".");
  return p.slice(-2).join(".");
}
