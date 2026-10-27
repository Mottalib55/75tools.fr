/**
 * Facture et devis : modèle de données, calculs (centimes entiers), mentions automatiques et PDF (pdf-lib).
 * Tout se passe dans le navigateur : rien n'est envoyé.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

export type TypeDocument = "facture" | "devis";
export type FormeEmetteur = "micro" | "ei" | "societe";
export type TypeClient = "particulier" | "pro";
export type Nature = "services" | "biens" | "mixte";

export const TAUX_TVA = [20, 10, 5.5, 2.1, 0] as const;

export interface Emetteur {
  forme: FormeEmetteur;
  nom: string; // nom et prénom (EI) ou dénomination sociale
  formeJuridique: string; // SARL, SAS… (société)
  capital: string; // montant du capital social (société)
  siren: string;
  siret: string;
  adresse: string;
  registre: string; // « RCS Lyon », « RNE », « RM 69 »
  tva: string; // numéro de TVA intracommunautaire
  franchise: boolean; // franchise en base de TVA
  optionDebits: boolean;
  email: string;
  telephone: string;
  iban: string;
  assurance: string; // artisans : assureur, garant, couverture géographique
}

export interface Client {
  type: TypeClient;
  nom: string;
  adresse: string;
  siren: string;
  tva: string;
  adresseLivraison: string;
}

export interface Ligne {
  id: number;
  designation: string;
  quantite: string;
  unite: string;
  prix: string; // prix unitaire HT
  tva: number;
  remise: string; // en %
}

export interface Document {
  type: TypeDocument;
  numero: string;
  dateEmission: string; // AAAA-MM-JJ
  dateVente: string; // facture : date de la vente ou de fin de prestation
  dateEcheance: string; // facture
  bonCommande: string;
  nature: Nature;
  lignes: Ligne[];
  conditionsPaiement: string;
  tauxPenalites: string;
  escompte: string;
  autoliquidation: boolean;
  garantieConformite: boolean;
  mentionsLibres: string;
  // devis
  validiteJours: string;
  dateDebut: string;
  duree: string;
  lieu: string;
  fraisDeplacement: string; // HT
  acompte: string; // % du TTC
  devisGratuit: boolean;
}

/* ------------------------------------------------------------------ nombres */

/** « 1 234,5 » ou « 1234.5 » → 1234.5 ; vide ou illisible → NaN. */
export function lireNombre(s: string): number {
  const t = (s ?? "").replace(/[\s  ]/g, "").replace(",", ".");
  if (t === "" || t === "-" || t === ".") return NaN;
  return /^-?\d*\.?\d*$/.test(t) ? Number(t) : NaN;
}

const n0 = (s: string) => {
  const v = lireNombre(s);
  return Number.isFinite(v) ? v : 0;
};

/** Arrondi au centime, en centimes entiers (évite les erreurs de virgule flottante). */
export const centimes = (euros: number) => arrondi(euros * 100);

/** Arrondi à l'entier le plus proche, demi vers le haut, après neutralisation des erreurs de virgule flottante. */
export const arrondi = (x: number) => Math.round(Math.round(x * 1000) / 1000);

/** 123456 centimes → « 1 234,56 € » ; insecable = true pour l'écran, false pour le PDF. */
export function montant(c: number, insecable = true): string {
  const t = (c / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esp = insecable ? " " : " ";
  return t.replace(/[\s  ]/g, esp) + esp + "€";
}

export const taux = (t: number) => t.toLocaleString("fr-FR") + " %";

/* ------------------------------------------------------------------ calculs */

export interface LigneCalculee {
  ligne: Ligne;
  quantite: number;
  prix: number;
  remise: number;
  totalHT: number; // centimes, arrondi par ligne
}

export interface Totaux {
  lignes: LigneCalculee[];
  totalHT: number;
  parTaux: { taux: number; base: number; tva: number }[];
  totalTVA: number;
  totalTTC: number;
  acompte: number;
  sansTVA: boolean; // franchise ou autoliquidation
}

export function lignesEffectives(d: Document): Ligne[] {
  const l = d.lignes.filter((x) => x.designation.trim() || n0(x.prix) !== 0);
  if (d.type === "devis" && n0(d.fraisDeplacement) > 0) {
    l.push({
      id: -1,
      designation: "Frais de déplacement",
      quantite: "1",
      unite: "forfait",
      prix: d.fraisDeplacement,
      tva: d.lignes[0]?.tva ?? 20,
      remise: "",
    });
  }
  return l;
}

export function calculer(d: Document, e: Emetteur): Totaux {
  const sansTVA = e.franchise || (d.autoliquidation && !e.franchise);
  const lignes = lignesEffectives(d).map((ligne) => {
    const quantite = n0(ligne.quantite);
    const prix = n0(ligne.prix);
    const remise = Math.min(100, Math.max(0, n0(ligne.remise)));
    return { ligne, quantite, prix, remise, totalHT: centimes(quantite * prix * (1 - remise / 100)) };
  });
  const totalHT = lignes.reduce((s, l) => s + l.totalHT, 0);
  const bases = new Map<number, number>();
  for (const l of lignes) {
    const t = sansTVA ? 0 : l.ligne.tva;
    bases.set(t, (bases.get(t) ?? 0) + l.totalHT);
  }
  const parTaux = [...bases.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([t, base]) => ({ taux: t, base, tva: arrondi((base * t) / 100) }));
  const totalTVA = parTaux.reduce((s, x) => s + x.tva, 0);
  const totalTTC = totalHT + totalTVA;
  const pct = Math.min(100, Math.max(0, n0(d.acompte)));
  return { lignes, totalHT, parTaux, totalTVA, totalTTC, acompte: d.type === "devis" ? arrondi((totalTTC * pct) / 100) : 0, sansTVA };
}

/* ------------------------------------------------------------------ textes */

export const dateFr = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

export function ajouterJours(iso: string, jours: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + jours));
  return d.toISOString().slice(0, 10);
}

export function aujourdhui(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** « F-2026-007 » → « F-2026-008 » (garde le nombre de chiffres). */
export function numeroSuivant(n: string): string {
  const m = /^(.*?)(\d+)(\D*)$/.exec(n.trim());
  if (!m) return n.trim() ? n.trim() + "-2" : "";
  const suiv = String(Number(m[2]) + 1).padStart(m[2].length, "0");
  return m[1] + suiv + m[3];
}

/** Nom de l'émetteur avec « EI » accolé pour un entrepreneur individuel (article R526-27 du Code de commerce). */
export function nomEmetteur(e: Emetteur): string {
  const nom = e.nom.trim();
  if (e.forme === "societe" || !nom) return nom;
  if (/\bEI\b|entrepreneur individuel/i.test(nom)) return nom;
  return `${nom} EI`;
}

const espaces = (s: string) => s.replace(/\s+/g, " ").trim();

/** Lignes d'identité de l'émetteur, dans l'ordre d'affichage. */
export function identiteEmetteur(e: Emetteur): string[] {
  const l: string[] = [];
  if (e.forme === "societe") {
    const fj = espaces(e.formeJuridique);
    const cap = n0(e.capital);
    if (fj || cap) l.push([fj, cap ? `au capital de ${montant(centimes(cap), false).replace(",00", "")}` : ""].filter(Boolean).join(" "));
  } else if (e.forme === "micro") {
    l.push("Entrepreneur individuel (micro-entrepreneur)");
  } else {
    l.push("Entrepreneur individuel");
  }
  for (const a of e.adresse.split("\n")) if (a.trim()) l.push(a.trim());
  const siren = espaces(e.siren);
  const siret = espaces(e.siret);
  const reg = espaces(e.registre);
  if (siret) l.push(`SIRET ${siret}`);
  else if (siren && !reg) l.push(`SIREN ${siren}`);
  if (reg) l.push(siren ? `${reg} ${siren}` : reg);
  if (!e.franchise && espaces(e.tva)) l.push(`N° TVA ${espaces(e.tva)}`);
  if (espaces(e.telephone)) l.push(`Tél. ${espaces(e.telephone)}`);
  if (espaces(e.email)) l.push(espaces(e.email));
  return l;
}

export function identiteClient(c: Client): string[] {
  const l: string[] = [];
  for (const a of c.adresse.split("\n")) if (a.trim()) l.push(a.trim());
  if (c.type === "pro") {
    if (espaces(c.siren)) l.push(`SIREN ${espaces(c.siren)}`);
    if (espaces(c.tva)) l.push(`N° TVA ${espaces(c.tva)}`);
  }
  return l;
}

export const LIBELLE_NATURE: Record<Nature, string> = {
  services: "prestations de services",
  biens: "livraisons de biens",
  mixte: "livraisons de biens et prestations de services",
};

/** Mentions de bas de document, selon le cas. */
export function mentions(d: Document, e: Emetteur, c: Client, t: Totaux): string[] {
  const m: string[] = [];
  if (e.franchise) m.push("TVA non applicable, art. 293 B du CGI");
  else if (d.autoliquidation && c.type === "pro") m.push("Autoliquidation");
  if (e.optionDebits && !e.franchise) m.push("Option pour le paiement de la taxe d'après les débits");
  m.push(`Nature des opérations : ${LIBELLE_NATURE[d.nature]}`);
  if (d.type === "facture") {
    if (espaces(d.conditionsPaiement)) m.push(`Conditions de paiement : ${espaces(d.conditionsPaiement)}`);
    const esc = espaces(d.escompte);
    m.push(`Escompte pour paiement anticipé : ${esc || "néant"}`);
    const tp = espaces(d.tauxPenalites);
    m.push(
      `En cas de retard de paiement, pénalités au taux annuel de ${tp ? tp.replace(/\s*%$/, "") + " %" : "[taux à préciser]"}, exigibles sans qu'un rappel soit nécessaire.`
    );
    if (c.type === "pro") m.push("Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €.");
    if (c.type === "particulier" && d.garantieConformite && d.nature !== "services")
      m.push("Les biens vendus bénéficient de la garantie légale de conformité d'une durée de deux ans.");
  } else {
    const v = Math.round(n0(d.validiteJours));
    if (v > 0) m.push(`Devis valable ${v} jours, jusqu'au ${dateFr(ajouterJours(d.dateEmission, v)) || "[date]"}.`);
    if (espaces(d.conditionsPaiement)) m.push(`Conditions de paiement : ${espaces(d.conditionsPaiement)}`);
    if (t.acompte > 0) m.push(`Acompte à la signature : ${montant(t.acompte, false)} (${n0(d.acompte).toLocaleString("fr-FR")} % du total TTC).`);
    m.push(d.devisGratuit ? "Devis gratuit." : "Devis payant.");
  }
  if (espaces(e.assurance)) m.push(`Assurance professionnelle : ${espaces(e.assurance)}`);
  for (const x of d.mentionsLibres.split("\n")) if (x.trim()) m.push(x.trim());
  return m;
}

/** Points à vérifier avant d'émettre (affichés sous l'aperçu, jamais bloquants). */
export function alertes(d: Document, e: Emetteur, c: Client, t: Totaux): string[] {
  const a: string[] = [];
  if (!e.nom.trim()) a.push("Indiquez le nom de l'émetteur.");
  if (!espaces(e.siren) && !espaces(e.siret)) a.push("Le numéro SIREN (ou SIRET) de l'émetteur est obligatoire. En cours d'immatriculation : « Siret en cours d'attribution ».");
  const sir = espaces(e.siren).replace(/\s/g, "");
  if (sir && !/^\d{9}$/.test(sir)) a.push("Un SIREN compte 9 chiffres.");
  const sirt = espaces(e.siret).replace(/\s/g, "");
  if (sirt && !/^\d{14}$/.test(sirt)) a.push("Un SIRET compte 14 chiffres.");
  if (e.forme === "societe" && (!espaces(e.formeJuridique) || !n0(e.capital))) a.push("Pour une société, indiquez la forme juridique et le capital social.");
  if (!e.franchise && !espaces(e.tva) && t.totalHT > 15000) a.push("Le numéro de TVA intracommunautaire est attendu au-delà de 150 € HT.");
  if (!e.adresse.trim()) a.push("Indiquez l'adresse de l'émetteur.");
  if (!c.nom.trim()) a.push("Indiquez le nom du client.");
  if (c.type === "particulier" && !c.adresse.trim()) a.push("L'adresse du client particulier figure sur la facture, sauf s'il s'y oppose.");
  if (c.type === "pro" && !espaces(c.siren)) a.push("Le SIREN du client professionnel devient obligatoire avec la facturation électronique.");
  if (!d.numero.trim()) a.push(d.type === "facture" ? "Le numéro de facture est obligatoire." : "Donnez un numéro au devis.");
  if (!t.lignes.length) a.push("Ajoutez au moins une ligne.");
  if (d.type === "facture" && !d.dateEcheance) a.push("Indiquez la date d'échéance du paiement.");
  if (d.type === "facture" && !espaces(d.tauxPenalites)) a.push("Le taux des pénalités de retard est une mention obligatoire.");
  if (d.autoliquidation && c.type === "pro" && !espaces(c.tva)) a.push("En autoliquidation, indiquez le numéro de TVA du client.");
  return a;
}

/* ------------------------------------------------------------------ PDF */

const A4 = { l: 595.28, h: 841.89 };
const MARGE = 46;
const NOIR = rgb(0.1, 0.1, 0.12);
const GRIS = rgb(0.38, 0.38, 0.42);
const FILET = rgb(0.82, 0.83, 0.86);
const FOND = rgb(0.95, 0.96, 0.97);

/** Rend un texte encodable en WinAnsi (Helvetica standard) : espaces spéciales, guillemets, caractères hors jeu. */
function nettoyeur(font: PDFFont) {
  const cache = new Map<string, string>();
  return (s: string) => {
    let out = "";
    for (const ch of (s ?? "").replace(/[     ]/g, " ").replace(/[​-‍﻿]/g, "").replace(/\t/g, " ")) {
      let r = cache.get(ch);
      if (r === undefined) {
        try {
          font.encodeText(ch);
          r = ch;
        } catch {
          const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
          try {
            font.encodeText(base);
            r = base || "?";
          } catch {
            r = "?";
          }
        }
        cache.set(ch, r);
      }
      out += r;
    }
    return out;
  };
}

/** Découpe un texte en lignes qui tiennent dans la largeur (coupe aussi les mots trop longs). */
function couper(texte: string, font: PDFFont, taille: number, largeur: number): string[] {
  const res: string[] = [];
  for (const para of texte.split("\n")) {
    const mots = para.split(" ");
    let cour = "";
    for (let mot of mots) {
      while (font.widthOfTextAtSize(mot, taille) > largeur && mot.length > 1) {
        let i = mot.length - 1;
        while (i > 1 && font.widthOfTextAtSize(mot.slice(0, i), taille) > largeur) i--;
        if (cour) {
          res.push(cour);
          cour = "";
        }
        res.push(mot.slice(0, i));
        mot = mot.slice(i);
      }
      const essai = cour ? cour + " " + mot : mot;
      if (font.widthOfTextAtSize(essai, taille) <= largeur) cour = essai;
      else {
        if (cour) res.push(cour);
        cour = mot;
      }
    }
    res.push(cour);
  }
  return res;
}

export async function genererPdf(d: Document, e: Emetteur, c: Client): Promise<Uint8Array> {
  const t = calculer(d, e);
  const pdf = await PDFDocument.create();
  const f = await pdf.embedFont(StandardFonts.Helvetica);
  const fb = await pdf.embedFont(StandardFonts.HelveticaBold);
  const net = nettoyeur(f);
  const titre = d.type === "facture" ? "FACTURE" : "DEVIS";
  pdf.setTitle(net(`${d.type === "facture" ? "Facture" : "Devis"} ${d.numero}`));
  pdf.setAuthor(net(nomEmetteur(e)));
  pdf.setCreator("75tools.fr");
  pdf.setProducer("75tools.fr (pdf-lib)");
  pdf.setLanguage("fr-FR");

  const pages: PDFPage[] = [];
  let page: PDFPage;
  let y = 0;
  const nouvellePage = () => {
    page = pdf.addPage([A4.l, A4.h]);
    pages.push(page);
    y = A4.h - MARGE;
  };
  const ecrire = (s: string, x: number, yy: number, o: { taille?: number; gras?: boolean; couleur?: ReturnType<typeof rgb>; droite?: boolean } = {}) => {
    const font = o.gras ? fb : f;
    const taille = o.taille ?? 9;
    const txt = net(s);
    const w = font.widthOfTextAtSize(txt, taille);
    page.drawText(txt, { x: o.droite ? x - w : x, y: yy, size: taille, font, color: o.couleur ?? NOIR });
  };
  const bloc = (lignes: string[], x: number, yy: number, largeur: number, taille = 9, gras = false, couleur = NOIR, interligne = 1.35) => {
    const font = gras ? fb : f;
    let yc = yy;
    for (const l of lignes)
      for (const s of couper(net(l), font, taille, largeur)) {
        page.drawText(s, { x, y: yc, size: taille, font, color: couleur });
        yc -= taille * interligne;
      }
    return yc;
  };

  nouvellePage();
  const larg = A4.l - 2 * MARGE;

  // En-tête : émetteur à gauche, titre et références à droite
  const xDroite = A4.l - MARGE;
  let yG = bloc([nomEmetteur(e) || "Émetteur"], MARGE, y - 4, larg * 0.55, 13, true);
  yG = bloc(identiteEmetteur(e), MARGE, yG - 2, larg * 0.55, 8.5, false, GRIS);
  ecrire(titre, xDroite, y - 10, { taille: 22, gras: true, droite: true });
  let yD = y - 30;
  const refs: [string, string][] = [[d.type === "facture" ? "N° de facture" : "N° de devis", d.numero || "[numéro]"]];
  refs.push(["Date d'émission", dateFr(d.dateEmission) || "[date]"]);
  if (d.type === "facture") {
    if (d.dateVente) refs.push(["Date de la vente ou prestation", dateFr(d.dateVente)]);
    if (d.dateEcheance) refs.push(["Échéance", dateFr(d.dateEcheance)]);
    if (d.bonCommande.trim()) refs.push(["Bon de commande", d.bonCommande.trim()]);
  } else {
    const v = Math.round(n0(d.validiteJours));
    if (v > 0 && d.dateEmission) refs.push(["Valable jusqu'au", dateFr(ajouterJours(d.dateEmission, v))]);
    if (d.dateDebut) refs.push(["Début prévu", dateFr(d.dateDebut)]);
    if (d.duree.trim()) refs.push(["Durée estimée", d.duree.trim()]);
  }
  for (const [k, v] of refs) {
    ecrire(k, xDroite - 92, yD, { taille: 8.5, couleur: GRIS, droite: true });
    ecrire(v, xDroite, yD, { taille: 8.5, gras: true, droite: true });
    yD -= 12.5;
  }

  // Client (cadre à droite)
  y = Math.min(yG, yD) - 14;
  const xc = MARGE + larg * 0.5;
  const lc = larg * 0.5;
  const lignesClient = identiteClient(c);
  const liv = c.type === "pro" && c.adresseLivraison.trim() ? ["Livraison : " + c.adresseLivraison.trim().replace(/\n+/g, ", ")] : [];
  const lieu = d.type === "devis" && d.lieu.trim() ? ["Lieu d'exécution : " + d.lieu.trim().replace(/\n+/g, ", ")] : [];
  const hClient =
    20 +
    couper(net(c.nom || "Client"), fb, 10.5, lc - 20).length * 14 +
    [...lignesClient, ...liv, ...lieu].reduce((s, l) => s + couper(net(l), f, 8.5, lc - 20).length * 11.5, 0) +
    6;
  page.drawRectangle({ x: xc, y: y - hClient, width: lc, height: hClient, color: FOND });
  ecrire(d.type === "facture" ? "FACTURÉ À" : "CLIENT", xc + 10, y - 12, { taille: 7, gras: true, couleur: GRIS });
  let yc = bloc([c.nom || "Client"], xc + 10, y - 26, lc - 20, 10.5, true, NOIR, 1.33);
  yc = bloc([...lignesClient, ...liv, ...lieu], xc + 10, yc + 2, lc - 20, 8.5, false, GRIS);
  y = y - hClient - 22;

  // Tableau des lignes
  const avecRemise = t.lignes.some((l) => l.remise > 0);
  const cols = t.sansTVA
    ? [
        { cle: "des", titre: "Désignation", l: avecRemise ? 216 : 262 },
        { cle: "qte", titre: "Qté", l: 46 },
        { cle: "uni", titre: "Unité", l: 50 },
        { cle: "pu", titre: "PU HT", l: 66 },
        ...(avecRemise ? [{ cle: "rem", titre: "Remise", l: 46 }] : []),
        { cle: "tot", titre: "Total HT", l: 0 },
      ]
    : [
        { cle: "des", titre: "Désignation", l: avecRemise ? 178 : 224 },
        { cle: "qte", titre: "Qté", l: 44 },
        { cle: "uni", titre: "Unité", l: 46 },
        { cle: "pu", titre: "PU HT", l: 64 },
        ...(avecRemise ? [{ cle: "rem", titre: "Remise", l: 46 }] : []),
        { cle: "tva", titre: "TVA", l: 38 },
        { cle: "tot", titre: "Total HT", l: 0 },
      ];
  const somme = cols.reduce((s, x) => s + x.l, 0);
  cols[cols.length - 1].l = larg - somme;
  const xs: number[] = [];
  let xx = MARGE;
  for (const col of cols) {
    xs.push(xx);
    xx += col.l;
  }
  const PAD = 5;
  const enteteTableau = () => {
    page.drawRectangle({ x: MARGE, y: y - 18, width: larg, height: 18, color: rgb(0.16, 0.17, 0.2) });
    cols.forEach((col, i) => {
      const droite = col.cle !== "des" && col.cle !== "uni";
      ecrire(col.titre, droite ? xs[i] + col.l - PAD : xs[i] + PAD, y - 12.5, { taille: 8, gras: true, couleur: rgb(1, 1, 1), droite });
    });
    y -= 18;
  };
  const BAS = MARGE + 28;
  enteteTableau();
  t.lignes.forEach((lc2, idx) => {
    const des = couper(net(lc2.ligne.designation || "-"), f, 8.8, cols[0].l - 2 * PAD);
    const h = Math.max(1, des.length) * 11.5 + 9;
    if (y - h < BAS) {
      nouvellePage();
      enteteTableau();
    }
    if (idx % 2 === 1) page.drawRectangle({ x: MARGE, y: y - h, width: larg, height: h, color: FOND });
    let yl = y - 13;
    for (const s of des) {
      page.drawText(s, { x: xs[0] + PAD, y: yl, size: 8.8, font: f, color: NOIR });
      yl -= 11.5;
    }
    const val: Record<string, string> = {
      qte: lc2.quantite.toLocaleString("fr-FR", { maximumFractionDigits: 3 }),
      uni: lc2.ligne.unite || "",
      pu: montant(centimes(lc2.prix), false),
      rem: lc2.remise ? taux(lc2.remise) : "",
      tva: taux(lc2.ligne.tva),
      tot: montant(lc2.totalHT, false),
    };
    cols.forEach((col, i) => {
      if (col.cle === "des") return;
      const droite = col.cle !== "uni";
      ecrire(val[col.cle], droite ? xs[i] + col.l - PAD : xs[i] + PAD, y - 13, { taille: 8.8, droite });
    });
    y -= h;
    page.drawLine({ start: { x: MARGE, y }, end: { x: MARGE + larg, y }, thickness: 0.5, color: FILET });
  });

  // Totaux
  const lignesTot: [string, string, boolean][] = [["Total HT", montant(t.totalHT, false), false]];
  if (!t.sansTVA) {
    for (const p of t.parTaux) lignesTot.push([`TVA ${taux(p.taux)} sur ${montant(p.base, false)}`, montant(p.tva, false), false]);
    lignesTot.push(["Total TVA", montant(t.totalTVA, false), false]);
    lignesTot.push(["Total TTC", montant(t.totalTTC, false), true]);
  } else {
    lignesTot.push([d.type === "facture" ? "Net à payer" : "Total", montant(t.totalTTC, false), true]);
  }
  if (d.type === "devis" && t.acompte > 0) lignesTot.push(["Acompte à la signature", montant(t.acompte, false), false]);
  const hTot = lignesTot.length * 15 + 12;
  if (y - hTot - 10 < BAS) nouvellePage();
  y -= 10;
  const xt = MARGE + larg * 0.48;
  let yt = y;
  for (const [k, v, fort] of lignesTot) {
    if (fort) {
      page.drawRectangle({ x: xt, y: yt - 17, width: MARGE + larg - xt, height: 19, color: rgb(0.16, 0.17, 0.2) });
      ecrire(k, xt + 8, yt - 11.5, { taille: 10, gras: true, couleur: rgb(1, 1, 1) });
      ecrire(v, MARGE + larg - 8, yt - 11.5, { taille: 10, gras: true, couleur: rgb(1, 1, 1), droite: true });
      yt -= 21;
    } else {
      ecrire(k, xt + 8, yt - 10, { taille: 8.8, couleur: GRIS });
      ecrire(v, MARGE + larg - 8, yt - 10, { taille: 8.8, droite: true });
      yt -= 15;
    }
  }
  if (t.sansTVA && e.franchise) {
    ecrire("TVA non applicable, art. 293 B du CGI", MARGE, y - 10, { taille: 8.5, gras: true });
  }
  y = yt - 16;

  // Mentions
  const ms = mentions(d, e, c, t);
  const iban = e.iban.trim() ? [`Règlement par virement : IBAN ${e.iban.trim()}`] : [];
  const tout = [...iban, ...ms];
  const hM = tout.reduce((s, l) => s + couper(net(l), f, 8, larg).length * 10.6, 0) + 16;
  if (y - hM < BAS) nouvellePage();
  ecrire("CONDITIONS ET MENTIONS", MARGE, y, { taille: 7, gras: true, couleur: GRIS });
  y = bloc(tout, MARGE, y - 13, larg, 8, false, NOIR, 1.32) - 6;

  // Devis : bon pour accord
  if (d.type === "devis") {
    const hS = 112;
    if (y - hS < BAS) nouvellePage();
    y -= 8;
    page.drawRectangle({ x: MARGE, y: y - hS, width: larg, height: hS, borderColor: FILET, borderWidth: 0.8 });
    ecrire("ACCEPTATION DU CLIENT", MARGE + 10, y - 15, { taille: 7, gras: true, couleur: GRIS });
    bloc(
      [
        "Devis reçu avant l'exécution des travaux.",
        "Mention manuscrite « Bon pour accord », date et signature du client :",
      ],
      MARGE + 10,
      y - 30,
      larg - 20,
      8.8
    );
    ecrire("Date :", MARGE + 10, y - 66, { taille: 8.8, couleur: GRIS });
    ecrire("Signature :", MARGE + larg * 0.45, y - 66, { taille: 8.8, couleur: GRIS });
    y -= hS + 10;
  }

  // Pieds de page
  const pied = net(
    [nomEmetteur(e), e.siret.trim() ? `SIRET ${espaces(e.siret)}` : e.siren.trim() ? `SIREN ${espaces(e.siren)}` : ""].filter(Boolean).join(" · ")
  );
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGE, y: MARGE + 10 }, end: { x: A4.l - MARGE, y: MARGE + 10 }, thickness: 0.5, color: FILET });
    p.drawText(pied.slice(0, 110), { x: MARGE, y: MARGE - 2, size: 7.5, font: f, color: GRIS });
    const num = `${d.type === "facture" ? "Facture" : "Devis"} ${net(d.numero)} · page ${i + 1} / ${pages.length}`;
    p.drawText(num, { x: A4.l - MARGE - f.widthOfTextAtSize(num, 7.5), y: MARGE - 2, size: 7.5, font: f, color: GRIS });
  });

  return pdf.save();
}

/* ------------------------------------------------------------------ mémoire locale */

const CLE = "75tools-facture-devis-v1";

export interface Memoire {
  emetteur?: Emetteur;
  dernier?: Partial<Record<TypeDocument, string>>;
}

export function lireMemoire(): Memoire {
  try {
    const s = localStorage.getItem(CLE);
    return s ? (JSON.parse(s) as Memoire) : {};
  } catch {
    return {};
  }
}

export function ecrireMemoire(m: Memoire) {
  try {
    localStorage.setItem(CLE, JSON.stringify(m));
  } catch {
    /* stockage indisponible : rien de grave */
  }
}

export function effacerMemoire() {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* rien */
  }
}

export const nomFichier = (d: Document, c: Client) =>
  `${d.type}-${(d.numero || "sans-numero") + (c.nom ? "-" + c.nom : "")}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() + ".pdf";
