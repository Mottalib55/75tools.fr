import { ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/outils/OutilLayout";
import { classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { telecharger } from "@/lib/fichiers";
import { cn } from "@/lib/utils";
import { locale, useLangue, type Langue } from "@/lib/langue";
import {
  Client,
  Document,
  Emetteur,
  Ligne,
  TAUX_TVA,
  TypeDocument,
  ajouterJours,
  alertes,
  aujourdhui,
  calculer,
  dateFr,
  effacerMemoire,
  ecrireMemoire,
  genererPdf,
  identiteClient,
  identiteEmetteur,
  lireMemoire,
  lireNombre,
  mentions,
  montant,
  nomEmetteur,
  nomFichier,
  numeroSuivant,
  taux,
} from "@/lib/facture-devis";

/* ------------------------------------------------------------------ petits champs */

const Etiquette = ({ label, aide, children, className }: { label: string; aide?: ReactNode; children: ReactNode; className?: string }) => (
  <label className={cn("block min-w-0", className)}>
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    {children}
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);

const Texte = ({ label, value, onChange, aide, placeholder, className, type = "text", autoComplete, name }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aide?: ReactNode;
  placeholder?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
  name?: string;
}) => (
  <Etiquette label={label} aide={aide} className={className}>
    <input type={type} name={name} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className={classeChamp} />
  </Etiquette>
);

const Zone = ({ label, value, onChange, aide, placeholder, lignes = 3, className, name }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aide?: ReactNode;
  placeholder?: string;
  lignes?: number;
  className?: string;
  name?: string;
}) => (
  <Etiquette label={label} aide={aide} className={className}>
    <textarea name={name} rows={lignes} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={classeZoneTexte} />
  </Etiquette>
);

/** Saisie numérique : le texte tapé est conservé tel quel ; hors bornes, la valeur est ramenée et signalée. */
const Nombre = ({ label, value, onChange, min, max, signaler, aide, suffixe, className, name }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  signaler: (m: string) => void;
  aide?: ReactNode;
  suffixe?: string;
  className?: string;
  name?: string;
}) => {
  const lang = useLangue();
  const en = lang === "en";
  const fmt = (n: number) => n.toLocaleString(locale(lang));
  const verifier = () => {
    if (!value.trim()) return;
    const v = lireNombre(value);
    if (!Number.isFinite(v)) {
      onChange("");
      signaler(en ? `${label}: "${value}" is not a number, the field was cleared.` : `${label} : « ${value} » n'est pas un nombre, le champ a été vidé.`);
    } else if (v < min) {
      onChange(fmt(min));
      signaler(en ? `${label}: ${fmt(v)} is below the minimum, set to ${fmt(min)}.` : `${label} : ${fmt(v)} est en dessous du minimum, valeur ramenée à ${fmt(min)}.`);
    } else if (v > max) {
      onChange(fmt(max));
      signaler(en ? `${label}: ${fmt(v)} is above the maximum, set to ${fmt(max)}.` : `${label} : ${fmt(v)} dépasse le maximum, valeur ramenée à ${fmt(max)}.`);
    }
  };
  const id = useId();
  const v = lireNombre(value);
  const borne = v > max ? max : min;
  const hors = value.trim() && Number.isFinite(v) && (v > max || v < min)
    ? en
      ? `${v > max ? "Maximum" : "Minimum"}: ${fmt(borne)}, the value will be adjusted when you leave the field.`
      : `${v > max ? "Maximum" : "Minimum"} : ${fmt(borne)}, la valeur sera ramenée en quittant le champ.`
    : "";
  return (
    <div className={cn("min-w-0", className)}>
      <Etiquette label={label} aide={aide}>
        <span className="relative block">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={verifier}
            className={cn(classeChamp, suffixe && "pr-10", "tabular-nums")}
          />
          {suffixe && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">{suffixe}</span>}
        </span>
      </Etiquette>
      {hors && (
        <span role="status" className="block text-xs text-amber-300 mt-1">
          {hors}
        </span>
      )}
    </div>
  );
};

const Case = ({ label, checked, onChange, aide, name }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; aide?: ReactNode; name?: string }) => (
  <label className="flex gap-3 items-start min-w-0 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-sky-400" />
    <span className="min-w-0">
      <span className="block text-sm text-neutral-200">{label}</span>
      {aide && <span className="block text-xs text-neutral-500 mt-0.5">{aide}</span>}
    </span>
  </label>
);

const Bloc = ({ titre, children }: { titre: string; children: ReactNode }) => (
  <fieldset className="border border-neutral-800 rounded-lg p-4 sm:p-5 min-w-0">
    <legend className="px-2 text-white font-semibold">{titre}</legend>
    <div className="space-y-4">{children}</div>
  </fieldset>
);

const Choix = <T extends string>({ valeur, options, onChange, nom }: { valeur: T; options: [T, string][]; onChange: (v: T) => void; nom: string }) => (
  <div role="radiogroup" aria-label={nom} className="flex flex-wrap gap-2">
    {options.map(([v, l]) => (
      <button
        key={v}
        type="button"
        role="radio"
        aria-checked={valeur === v}
        onClick={() => onChange(v)}
        className={cn(
          "h-11 px-4 rounded-md text-sm border transition-colors",
          valeur === v ? "border-sky-400 bg-sky-400/10 text-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
        )}
      >
        {l}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ données initiales */

export interface ExempleFactureDevis {
  emetteur: Emetteur;
  client: Client;
  lignes: Omit<Ligne, "id">[];
  document?: Partial<Document>;
}

const prefixe = (t: TypeDocument) => (t === "facture" ? "F" : "D");

function documentInitial(type: TypeDocument, ex: ExempleFactureDevis): Document {
  return {
    type,
    numero: `${prefixe(type)}-2026-001`,
    dateEmission: "",
    dateVente: "",
    dateEcheance: "",
    bonCommande: "",
    nature: "services",
    lignes: ex.lignes.map((l, i) => ({ ...l, id: i + 1 })),
    conditionsPaiement: type === "facture" ? "virement bancaire à 30 jours" : "30 % à la signature, solde à la fin des travaux, par virement",
    tauxPenalites: "12,40",
    escompte: "",
    autoliquidation: false,
    garantieConformite: false,
    mentionsLibres: "",
    validiteJours: "30",
    dateDebut: "",
    duree: "",
    lieu: "",
    fraisDeplacement: "",
    acompte: type === "devis" ? "30" : "",
    devisGratuit: true,
    ...ex.document,
  };
}

const EMETTEUR_VIDE: Emetteur = {
  forme: "micro",
  nom: "",
  formeJuridique: "",
  capital: "",
  siren: "",
  siret: "",
  adresse: "",
  registre: "",
  tva: "",
  franchise: true,
  optionDebits: false,
  email: "",
  telephone: "",
  iban: "",
  assurance: "",
};

/* ------------------------------------------------------------------ aperçu */

const Apercu = ({ d, e, c }: { d: Document; e: Emetteur; c: Client }) => {
  const t = calculer(d, e);
  const ms = mentions(d, e, c, t);
  const avecRemise = t.lignes.some((l) => l.remise > 0);
  const refs: [string, string][] = [[d.type === "facture" ? "N° de facture" : "N° de devis", d.numero || "[numéro]"], ["Date d'émission", dateFr(d.dateEmission) || "[date]"]];
  if (d.type === "facture") {
    if (d.dateVente) refs.push(["Date de la vente ou prestation", dateFr(d.dateVente)]);
    if (d.dateEcheance) refs.push(["Échéance", dateFr(d.dateEcheance)]);
    if (d.bonCommande.trim()) refs.push(["Bon de commande", d.bonCommande.trim()]);
  } else {
    const v = Math.round(lireNombre(d.validiteJours) || 0);
    if (v > 0 && d.dateEmission) refs.push(["Valable jusqu'au", dateFr(ajouterJours(d.dateEmission, v))]);
    if (d.dateDebut) refs.push(["Début prévu", dateFr(d.dateDebut)]);
    if (d.duree.trim()) refs.push(["Durée estimée", d.duree.trim()]);
  }
  return (
    <div id="apercu-document" className="bg-white text-neutral-900 rounded-md shadow-xl p-4 sm:p-6 text-[11px] sm:text-xs leading-snug [overflow-wrap:anywhere]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-bold">{nomEmetteur(e) || "Émetteur"}</p>
          {identiteEmetteur(e).map((l, i) => (
            <p key={i} className="text-neutral-600">{l}</p>
          ))}
        </div>
        <div className="text-right min-w-0">
          <p className="text-xl sm:text-2xl font-bold tracking-tight">{d.type === "facture" ? "FACTURE" : "DEVIS"}</p>
          {refs.map(([k, v]) => (
            <p key={k}>
              <span className="text-neutral-500">{k} </span>
              <strong>{v}</strong>
            </p>
          ))}
        </div>
      </div>
      <div className="mt-4 ml-auto sm:w-1/2 bg-neutral-100 rounded p-3">
        <p className="text-[10px] font-bold text-neutral-500">{d.type === "facture" ? "FACTURÉ À" : "CLIENT"}</p>
        <p className="font-bold text-sm">{c.nom || "Client"}</p>
        {identiteClient(c).map((l, i) => (
          <p key={i} className="text-neutral-600">{l}</p>
        ))}
        {c.type === "pro" && c.adresseLivraison.trim() && <p className="text-neutral-600">Livraison : {c.adresseLivraison.trim().replace(/\n+/g, ", ")}</p>}
        {d.type === "devis" && d.lieu.trim() && <p className="text-neutral-600">Lieu d'exécution : {d.lieu.trim().replace(/\n+/g, ", ")}</p>}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse">
          <thead>
            <tr className="bg-neutral-800 text-white text-left whitespace-nowrap">
              <th className="p-1.5 font-semibold">Désignation</th>
              <th className="p-1.5 font-semibold text-right">Qté</th>
              <th className="p-1.5 font-semibold">Unité</th>
              <th className="p-1.5 font-semibold text-right">PU HT</th>
              {avecRemise && <th className="p-1.5 font-semibold text-right">Remise</th>}
              {!t.sansTVA && <th className="p-1.5 font-semibold text-right">TVA</th>}
              <th className="p-1.5 font-semibold text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {t.lignes.map((l, i) => (
              <tr key={l.ligne.id + "-" + i} className={cn("border-b border-neutral-200", i % 2 === 1 && "bg-neutral-50")}>
                <td className="p-1.5 whitespace-pre-line">{l.ligne.designation || "-"}</td>
                <td className="p-1.5 text-right tabular-nums">{l.quantite.toLocaleString("fr-FR", { maximumFractionDigits: 3 })}</td>
                <td className="p-1.5 whitespace-nowrap">{l.ligne.unite}</td>
                <td className="p-1.5 text-right tabular-nums whitespace-nowrap">{montant(Math.round(l.prix * 100))}</td>
                {avecRemise && <td className="p-1.5 text-right">{l.remise ? taux(l.remise) : ""}</td>}
                {!t.sansTVA && <td className="p-1.5 text-right whitespace-nowrap">{taux(l.ligne.tva)}</td>}
                <td className="p-1.5 text-right tabular-nums whitespace-nowrap">{montant(l.totalHT)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-3">
        <p className="font-bold self-start">{e.franchise ? "TVA non applicable, art. 293 B du CGI" : ""}</p>
        <table className="ml-auto min-w-[14rem] tabular-nums">
          <tbody>
            <tr>
              <td className="py-0.5 pr-4 text-neutral-500">Total HT</td>
              <td className="py-0.5 text-right whitespace-nowrap">{montant(t.totalHT)}</td>
            </tr>
            {!t.sansTVA &&
              t.parTaux.map((p) => (
                <tr key={p.taux}>
                  <td className="py-0.5 pr-4 text-neutral-500">TVA {taux(p.taux)} sur {montant(p.base)}</td>
                  <td className="py-0.5 text-right whitespace-nowrap">{montant(p.tva)}</td>
                </tr>
              ))}
            {!t.sansTVA && (
              <tr>
                <td className="py-0.5 pr-4 text-neutral-500">Total TVA</td>
                <td className="py-0.5 text-right whitespace-nowrap">{montant(t.totalTVA)}</td>
              </tr>
            )}
            <tr className="bg-neutral-800 text-white font-bold">
              <td className="py-1 px-2">{t.sansTVA ? (d.type === "facture" ? "Net à payer" : "Total") : "Total TTC"}</td>
              <td className="py-1 px-2 text-right whitespace-nowrap" id="apercu-total">{montant(t.totalTTC)}</td>
            </tr>
            {d.type === "devis" && t.acompte > 0 && (
              <tr>
                <td className="py-0.5 pr-4 text-neutral-500">Acompte à la signature</td>
                <td className="py-0.5 text-right whitespace-nowrap">{montant(t.acompte)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-[10px] sm:text-[11px] space-y-0.5">
        <p className="font-bold text-neutral-500">CONDITIONS ET MENTIONS</p>
        {e.iban.trim() && <p>Règlement par virement : IBAN {e.iban.trim()}</p>}
        {ms.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
      {d.type === "devis" && (
        <div className="mt-4 border border-neutral-300 rounded p-3 min-h-[6rem]">
          <p className="text-[10px] font-bold text-neutral-500">ACCEPTATION DU CLIENT</p>
          <p>Devis reçu avant l'exécution des travaux.</p>
          <p>Mention manuscrite « Bon pour accord », date et signature du client :</p>
          <p className="mt-3 flex gap-16 text-neutral-500">
            <span>Date :</span>
            <span>Signature :</span>
          </p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ textes de l'interface */

/**
 * Textes de l'éditeur. L'interface suit la langue de la page ; le document produit (aperçu et PDF)
 * reste en français dans les deux cas, avec les mentions légales françaises.
 */
const T = {
  fr: {
    formulaire: (f: boolean) => (f ? "Votre facture" : "Votre devis"),
    allerApercu: "Aperçu et PDF, plus bas",
    vous: "Vous (émetteur)",
    forme: "Forme de l'entreprise",
    formes: { micro: "Micro-entrepreneur", ei: "Entrepreneur individuel", societe: "Société" },
    denomination: "Dénomination sociale",
    nomPrenom: "Nom et prénom",
    aideEI: "La mention « EI » est ajoutée après votre nom.",
    formeJuridique: "Forme juridique",
    formeJuridiquePh: "SARL, SAS…",
    capital: "Capital social",
    telephone: "Téléphone",
    siren: "SIREN",
    sirenAide: "9 chiffres",
    siret: "SIRET (facultatif)",
    siretAide: "14 chiffres : SIREN + établissement",
    adresse: "Adresse",
    adresseSiege: "Adresse du siège social",
    registre: "Immatriculation (RCS, RNE…)",
    registrePh: (soc: boolean) => (soc ? "RCS Lyon" : "facultatif"),
    registreAide: "Le SIREN est ajouté à la suite.",
    tvaIntra: "N° de TVA intracommunautaire",
    email: "E-mail",
    iban: "IBAN (facultatif)",
    franchise: "Franchise en base de TVA (pas de TVA facturée)",
    franchiseAide: "Ajoute « TVA non applicable, art. 293 B du CGI » et retire les colonnes de TVA.",
    debits: "Option pour le paiement de la TVA d'après les débits",
    debitsAide: "Seulement si vous avez choisi cette option auprès des impôts (prestations de services).",
    assurance: "Assurance professionnelle (activité artisanale)",
    assurancePh: "Assureur, coordonnées, couverture géographique",
    assuranceAide: "Obligatoire pour une activité artisanale ; laissez vide sinon.",
    memoriser: "Mémoriser l'émetteur et le dernier numéro dans ce navigateur",
    memoriserAide: "Stocké seulement sur cet appareil (stockage local du navigateur), jamais envoyé.",
    client: "Client",
    typeClient: "Type de client",
    particulier: "Particulier",
    pro: "Professionnel",
    nomEntreprise: "Nom de l'entreprise",
    sirenClient: "SIREN du client",
    adresseFact: "Adresse de facturation",
    tvaClient: "N° de TVA du client",
    tvaClientAide: "S'il est redevable de la TVA.",
    livraison: "Adresse de livraison, si différente",
    blocDoc: (f: boolean) => (f ? "Facture" : "Devis"),
    numero: (f: boolean) => (f ? "Numéro de facture" : "Numéro de devis"),
    dernier: (n: string) => `Dernier numéro utilisé ici : ${n}`,
    numeroAide: "Chronologique et continu, sans trou",
    dateEmission: "Date d'émission",
    datePrestation: "Date de la prestation",
    datePrestationAide: "Ou de la vente",
    dateEcheance: "Date d'échéance",
    bonCommande: "N° de bon de commande",
    bonCommandeAide: "Si le client en a émis un",
    validite: "Durée de validité",
    jours: "jours",
    debut: "Début prévu des travaux",
    duree: "Durée estimée",
    dureePh: "3 jours",
    frais: "Frais de déplacement HT",
    nature: "Nature des opérations",
    natures: { services: "Prestations de services", biens: "Livraisons de biens", mixte: "Biens et services" },
    lieu: "Lieu d'exécution",
    lieuPh: "Adresse du chantier, si différente",
    lignes: "Lignes",
    designation: (i: number) => `Ligne ${i} : désignation`,
    monter: (i: number) => `Monter la ligne ${i}`,
    descendre: (i: number) => `Descendre la ligne ${i}`,
    supprimer: (i: number) => `Supprimer la ligne ${i}`,
    quantite: "Quantité",
    unite: "Unité",
    unitePh: "h, jour, m²…",
    prix: "Prix unitaire HT",
    tva: "TVA",
    sansTva: "sans TVA",
    remise: "Remise",
    totalLigne: "Total HT de la ligne : ",
    ajouter: "Ajouter une ligne",
    paiement: "Paiement et mentions",
    conditions: "Conditions de paiement",
    conditionsAide: (f: boolean) => (f ? "Moyen et délai : « virement à 30 jours », « à réception »…" : "Acompte, échéancier, moyen de paiement"),
    penalites: "Taux annuel des pénalités de retard",
    penalitesAide: "12,40 % = taux de la BCE au 1er juillet 2026 (2,40 %) + 10 points. Minimum : 3 fois le taux d'intérêt légal.",
    escompte: "Escompte pour paiement anticipé",
    escomptePh: "néant",
    escompteAide: "Vide = « néant », la mention est écrite quand même.",
    acompte: "Acompte à la signature",
    gratuit: "Devis gratuit",
    gratuitAide: "Décoché, la mention « Devis payant » est écrite.",
    autoliq: "Autoliquidation : la TVA est due par le client",
    autoliqAide: "Seulement quand c'est le client qui est redevable de la TVA. Ajoute la mention « Autoliquidation » et la TVA n'est pas facturée.",
    garantie: "Biens couverts par la mention de garantie légale de conformité",
    garantieAide: "Électroménager, informatique, téléphonie, jouets, articles de sport, meubles… : la facture à un particulier mentionne la garantie de deux ans.",
    mentionsLibres: "Mentions complémentaires (une par ligne)",
    mentionsLibresPh: "Membre d'une association agréée, le règlement par chèque et carte bancaire est accepté",
    netAPayer: "Net à payer",
    total: "Total",
    totalTTC: "Total TTC",
    dontTVA: "dont TVA",
    creation: "Création…",
    telecharger: (f: boolean) => (f ? "Télécharger la facture PDF" : "Télécharger le devis PDF"),
    suivant: (f: boolean) => (f ? "Facture suivante" : "Devis suivant"),
    effacer: "Tout effacer",
    attente: "Le total se met à jour à chaque saisie ; l'aperçu du document est juste dessous.",
    langueDoc: "",
    confidentialite: "Le PDF est fabriqué par votre navigateur : ni vos coordonnées ni celles du client ne sont envoyées à 75tools.",
    aVerifier: "À vérifier avant d'envoyer",
    apercu: "",
    pdfCree: (nom: string, num: string, f: boolean, mem: boolean) =>
      `PDF « ${nom} » créé${mem ? ` ; numéro ${num} mémorisé comme dernier ${f ? "numéro de facture" : "numéro de devis"}` : ""}.`,
    pdfEchec: "La création du PDF a échoué : ",
    nouveau: (n: string) => `Nouveau document : numéro ${n}, client et lignes vidés, émetteur conservé.`,
    efface: "Tout est effacé : formulaire vidé et données retirées de ce navigateur. La mémorisation est désactivée.",
  },
  en: {
    formulaire: (f: boolean) => (f ? "Your invoice" : "Your quote"),
    allerApercu: "Preview and PDF, below",
    vous: "You (the seller, émetteur)",
    forme: "Business status",
    formes: { micro: "Micro-entrepreneur", ei: "Sole trader (EI)", societe: "Company (société)" },
    denomination: "Company name (dénomination sociale)",
    nomPrenom: "First name and surname",
    aideEI: "French law requires « EI » (entrepreneur individuel) after your name: it is added for you.",
    formeJuridique: "Legal form",
    formeJuridiquePh: "SARL, SAS…",
    capital: "Share capital",
    telephone: "Phone",
    siren: "SIREN number",
    sirenAide: "9-digit French business ID from INSEE",
    siret: "SIRET (optional)",
    siretAide: "14 digits: SIREN + establishment code",
    adresse: "Business address",
    adresseSiege: "Registered office address (siège social)",
    registre: "Registration (RCS, RNE…)",
    registrePh: (soc: boolean) => (soc ? "RCS Lyon" : "optional"),
    registreAide: "Your SIREN is added after it, as French invoices show it.",
    tvaIntra: "EU VAT number (n° de TVA intracommunautaire)",
    email: "Email",
    iban: "IBAN (optional)",
    franchise: "VAT exemption: franchise en base de TVA (no VAT charged)",
    franchiseAide: "For businesses under the French VAT threshold. Adds « TVA non applicable, art. 293 B du CGI » (VAT not applicable, article 293 B of the French tax code) and removes the VAT columns.",
    debits: "Option to pay VAT on invoicing (option pour les débits)",
    debitsAide: "Only if you chose this option with the French tax office (services).",
    assurance: "Professional insurance (craft trades, artisans)",
    assurancePh: "Insurer, contact details, geographical cover",
    assuranceAide: "Mandatory for a craft trade such as plumbing or building work; leave empty otherwise. Written in French on the document.",
    memoriser: "Remember the seller and the last number in this browser",
    memoriserAide: "Kept only on this device (browser local storage), never sent anywhere.",
    client: "Client",
    typeClient: "Client type",
    particulier: "Private individual",
    pro: "Business",
    nomEntreprise: "Company name",
    sirenClient: "Client's SIREN",
    adresseFact: "Billing address",
    tvaClient: "Client's VAT number",
    tvaClientAide: "If the client is registered for VAT.",
    livraison: "Delivery address, if different",
    blocDoc: (f: boolean) => (f ? "Invoice (facture)" : "Quote (devis)"),
    numero: (f: boolean) => (f ? "Invoice number" : "Quote number"),
    dernier: (n: string) => `Last number used here: ${n}`,
    numeroAide: "Chronological and continuous, with no gaps",
    dateEmission: "Issue date",
    datePrestation: "Date of service",
    datePrestationAide: "Or of the sale",
    dateEcheance: "Payment due date",
    bonCommande: "Purchase order number",
    bonCommandeAide: "If the client issued one",
    validite: "Validity period",
    jours: "days",
    debut: "Planned start of work",
    duree: "Estimated duration",
    dureePh: "3 jours",
    frais: "Travel costs excl. VAT",
    nature: "Type of transactions",
    natures: { services: "Services", biens: "Sale of goods", mixte: "Goods and services" },
    lieu: "Place of work (lieu d'exécution)",
    lieuPh: "Site address, if different",
    lignes: "Lines",
    designation: (i: number) => `Line ${i}: description (in French)`,
    monter: (i: number) => `Move line ${i} up`,
    descendre: (i: number) => `Move line ${i} down`,
    supprimer: (i: number) => `Delete line ${i}`,
    quantite: "Quantity",
    unite: "Unit",
    unitePh: "h, jour, m²…",
    prix: "Unit price excl. VAT",
    tva: "VAT",
    sansTva: "no VAT",
    remise: "Discount",
    totalLigne: "Line total excl. VAT: ",
    ajouter: "Add a line",
    paiement: "Payment and mentions",
    conditions: "Payment terms (in French)",
    conditionsAide: (f: boolean) => (f ? "Method and deadline, e.g. « virement à 30 jours » (bank transfer within 30 days)" : "Deposit, schedule, payment method"),
    penalites: "Annual late-payment penalty rate",
    penalitesAide: "Mandatory on French invoices. 12.40% = ECB rate on 1 July 2026 (2.40%) + 10 points. Minimum: 3 times the French legal interest rate.",
    escompte: "Early-payment discount (escompte)",
    escomptePh: "néant",
    escompteAide: "Empty = « néant » (none): French law still wants the line written.",
    acompte: "Deposit on signature",
    gratuit: "Free quote",
    gratuitAide: "Unticked, the quote says « Devis payant » (paid quote).",
    autoliq: "Reverse charge (autoliquidation): the client pays the VAT",
    autoliqAide: "Only when the client is liable for VAT. Adds « Autoliquidation » and no VAT is charged.",
    garantie: "Goods covered by the legal conformity guarantee",
    garantieAide: "Household appliances, computers, phones, toys, sports goods, furniture…: an invoice to a private client mentions the two-year guarantee.",
    mentionsLibres: "Extra mentions, in French (one per line)",
    mentionsLibresPh: "Membre d'une association agréée, le règlement par chèque et carte bancaire est accepté",
    netAPayer: "Amount due",
    total: "Total",
    totalTTC: "Total incl. VAT",
    dontTVA: "of which VAT",
    creation: "Creating…",
    telecharger: (f: boolean) => (f ? "Download the invoice PDF" : "Download the quote PDF"),
    suivant: (f: boolean) => (f ? "Next invoice" : "Next quote"),
    effacer: "Clear everything",
    attente: "The total updates as you type; the document preview is just below.",
    langueDoc: "The document itself is written in French with the French legal mentions, which is what French clients and the tax office (impots.gouv.fr) expect. This page explains each field in English.",
    confidentialite: "Your browser builds the PDF: neither your details nor your client's are sent to 75tools.",
    aVerifier: "Check before sending",
    apercu: "Preview of the French document",
    pdfCree: (nom: string, num: string, f: boolean, mem: boolean) =>
      `PDF "${nom}" created${mem ? `; number ${num} saved as the last ${f ? "invoice" : "quote"} number` : ""}.`,
    pdfEchec: "The PDF could not be created: ",
    nouveau: (n: string) => `New document: number ${n}, client and lines cleared, seller kept.`,
    efface: "Everything is cleared: form emptied and data removed from this browser. Remembering is now off.",
  },
};

/** Montant affiché dans l'interface (pas dans le document) : « 1 234,56 € » ou « €1,234.56 ». */
const montantUi = (c: number, lang: Langue) =>
  lang === "en" ? (c / 100).toLocaleString("en-GB", { style: "currency", currency: "EUR" }) : montant(c);

/* ------------------------------------------------------------------ éditeur */

export const FactureDevisEditeur = ({ type, exemple }: { type: TypeDocument; exemple: ExempleFactureDevis }) => {
  const lang = useLangue();
  const tx = T[lang];
  const [e, setE] = useState<Emetteur>(exemple.emetteur);
  const [c, setC] = useState<Client>(exemple.client);
  const [d, setD] = useState<Document>(() => {
    const doc = documentInitial(type, exemple);
    // Saisie anglaise : point décimal dans le champ (le document l'écrit à la française).
    return lang === "en" ? { ...doc, tauxPenalites: doc.tauxPenalites.replace(",", ".") } : doc;
  });
  const [memoriser, setMemoriser] = useState(true);
  const [charge, setCharge] = useState(false);
  const [statut, setStatut] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [dernier, setDernier] = useState("");
  const idSuivant = useRef(100);

  const majE = <K extends keyof Emetteur>(k: K) => (v: Emetteur[K]) => setE((x) => ({ ...x, [k]: v }));
  const majC = <K extends keyof Client>(k: K) => (v: Client[K]) => setC((x) => ({ ...x, [k]: v }));
  const majD = <K extends keyof Document>(k: K) => (v: Document[K]) => setD((x) => ({ ...x, [k]: v }));
  const majL = (id: number, k: keyof Ligne) => (v: string | number) =>
    setD((x) => ({ ...x, lignes: x.lignes.map((l) => (l.id === id ? { ...l, [k]: v } : l)) }));

  // Après le premier rendu : dates du jour, émetteur et numérotation mémorisés.
  useEffect(() => {
    const auj = aujourdhui();
    const m = lireMemoire();
    const der = m.dernier?.[type] ?? "";
    setDernier(der);
    if (m.emetteur) setE({ ...EMETTEUR_VIDE, ...m.emetteur });
    setD((x) => ({
      ...x,
      numero: der ? numeroSuivant(der) : `${prefixe(type)}-${auj.slice(0, 4)}-001`,
      dateEmission: auj,
      dateVente: type === "facture" ? auj : "",
      dateEcheance: type === "facture" ? ajouterJours(auj, 30) : "",
      dateDebut: type === "devis" ? ajouterJours(auj, 21) : "",
    }));
    setCharge(true);
  }, [type]);

  // Mémorise l'émetteur sur cet appareil, si la case est cochée.
  useEffect(() => {
    // L'exemple prérempli n'est jamais mémorisé : seul un émetteur saisi ou déjà mémorisé l'est
    // (sinon l'exemple de la facture réapparaissait comme émetteur sur la page du devis).
    if (!charge || !memoriser || e === exemple.emetteur) return;
    const m = lireMemoire();
    ecrireMemoire({ ...m, emetteur: e });
  }, [e, memoriser, charge, exemple.emetteur]);

  const t = useMemo(() => calculer(d, e), [d, e]);
  const points = alertes(d, e, c, t, lang);
  const mt = (x: number) => montantUi(x, lang);

  const signaler = (m: string) => setStatut(m);

  const ajouterLigne = () =>
    setD((x) => ({ ...x, lignes: [...x.lignes, { id: idSuivant.current++, designation: "", quantite: "1", unite: x.lignes[x.lignes.length - 1]?.unite || "u", prix: "", tva: x.lignes[x.lignes.length - 1]?.tva ?? 20, remise: "" }] }));
  const supprimer = (id: number) => setD((x) => ({ ...x, lignes: x.lignes.filter((l) => l.id !== id) }));
  const deplacer = (i: number, sens: -1 | 1) =>
    setD((x) => {
      const j = i + sens;
      if (j < 0 || j >= x.lignes.length) return x;
      const l = [...x.lignes];
      [l[i], l[j]] = [l[j], l[i]];
      return { ...x, lignes: l };
    });

  const pdf = async () => {
    setEnCours(true);
    try {
      const octets = await genererPdf(d, e, c);
      const nom = nomFichier(d, c, lang);
      telecharger(nom, new Blob([octets], { type: "application/pdf" }));
      if (memoriser) {
        const m = lireMemoire();
        ecrireMemoire({ ...m, emetteur: e, dernier: { ...(m.dernier ?? {}), [type]: d.numero } });
      }
      setDernier(d.numero);
      setStatut(tx.pdfCree(nom, d.numero, type === "facture", memoriser));
    } catch (err) {
      setStatut(tx.pdfEchec + (err instanceof Error ? err.message : String(err)));
    } finally {
      setEnCours(false);
    }
  };

  const nouveau = () => {
    const auj = aujourdhui();
    setC({ type: c.type, nom: "", adresse: "", siren: "", tva: "", adresseLivraison: "" });
    setD((x) => ({
      ...x,
      numero: numeroSuivant(dernier || x.numero),
      dateEmission: auj,
      dateVente: type === "facture" ? auj : "",
      dateEcheance: type === "facture" ? ajouterJours(auj, 30) : "",
      bonCommande: "",
      lignes: [{ id: idSuivant.current++, designation: "", quantite: "1", unite: "u", prix: "", tva: x.lignes[0]?.tva ?? 20, remise: "" }],
      lieu: "",
      fraisDeplacement: "",
    }));
    setStatut(tx.nouveau(numeroSuivant(dernier || d.numero)));
  };

  const toutEffacer = () => {
    effacerMemoire();
    setMemoriser(false);
    setE({ ...EMETTEUR_VIDE });
    setC({ type: "particulier", nom: "", adresse: "", siren: "", tva: "", adresseLivraison: "" });
    setD((x) => ({ ...x, numero: `${prefixe(type)}-${aujourdhui().slice(0, 4)}-001`, bonCommande: "", autoliquidation: false, lignes: [{ id: idSuivant.current++, designation: "", quantite: "1", unite: "u", prix: "", tva: 20, remise: "" }] }));
    setDernier("");
    setStatut(tx.efface);
  };

  const estFacture = type === "facture";
  const libelleTotal = t.sansTVA ? (estFacture ? tx.netAPayer : tx.total) : tx.totalTTC;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] items-start">
      <div role="group" className="space-y-5 min-w-0" aria-label={tx.formulaire(estFacture)}>
        <a
          href="#actions-document"
          className="xl:hidden flex flex-wrap items-center justify-between gap-x-3 gap-y-1 min-h-11 px-4 py-2 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500 !no-underline tabular-nums"
        >
          <span>
            {libelleTotal}
            {lang === "en" ? ": " : " : "}
            <strong className="text-white">{mt(t.totalTTC)}</strong>
          </span>
          <span className="text-sky-300">{tx.allerApercu}</span>
        </a>
        <Bloc titre={tx.vous}>
          <Choix
            nom={tx.forme}
            valeur={e.forme}
            onChange={(v) => setE((x) => ({ ...x, forme: v, franchise: v === "societe" ? false : x.franchise }))}
            options={[
              ["micro", tx.formes.micro],
              ["ei", tx.formes.ei],
              ["societe", tx.formes.societe],
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte
              label={e.forme === "societe" ? tx.denomination : tx.nomPrenom}
              name="emetteur-nom"
              value={e.nom}
              onChange={majE("nom")}
              aide={e.forme !== "societe" ? tx.aideEI : undefined}
            />
            {e.forme === "societe" ? (
              <div className="grid grid-cols-2 gap-3">
                <Texte label={tx.formeJuridique} value={e.formeJuridique} onChange={majE("formeJuridique")} placeholder={tx.formeJuridiquePh} />
                <Nombre label={tx.capital} value={e.capital} onChange={majE("capital")} min={0} max={1e12} signaler={signaler} suffixe="€" />
              </div>
            ) : (
              <Texte label={tx.telephone} type="tel" value={e.telephone} onChange={majE("telephone")} autoComplete="tel" />
            )}
            <Texte label={tx.siren} name="emetteur-siren" value={e.siren} onChange={majE("siren")} placeholder="123 456 789" aide={tx.sirenAide} />
            <Texte label={tx.siret} value={e.siret} onChange={majE("siret")} placeholder="123 456 789 00012" aide={tx.siretAide} />
            <Zone label={tx.adresse} value={e.adresse} onChange={majE("adresse")} lignes={2} placeholder={"12 rue des Lilas\n69003 Lyon"} aide={e.forme === "societe" ? tx.adresseSiege : undefined} />
            <Texte label={tx.registre} value={e.registre} onChange={majE("registre")} placeholder={tx.registrePh(e.forme === "societe")} aide={tx.registreAide} />
            {!e.franchise && <Texte label={tx.tvaIntra} value={e.tva} onChange={majE("tva")} placeholder="FR 12 345678901" />}
            <Texte label={tx.email} type="email" value={e.email} onChange={majE("email")} autoComplete="email" />
            {e.forme === "societe" && <Texte label={tx.telephone} type="tel" value={e.telephone} onChange={majE("telephone")} autoComplete="tel" />}
            <Texte label={tx.iban} value={e.iban} onChange={majE("iban")} placeholder="FR76 …" />
          </div>
          {/* La franchise en base vaut pour toute entreprise sous les seuils, société comprise (Service Public, F21746). */}
          <Case
            name="franchise"
            label={tx.franchise}
            checked={e.franchise}
            onChange={(v) => {
              majE("franchise")(v);
              if (v) setD((x) => ({ ...x, autoliquidation: false }));
            }}
            aide={tx.franchiseAide}
          />
          {!e.franchise && <Case label={tx.debits} checked={e.optionDebits} onChange={majE("optionDebits")} aide={tx.debitsAide} />}
          <Zone label={tx.assurance} value={e.assurance} onChange={majE("assurance")} lignes={2} placeholder={tx.assurancePh} aide={tx.assuranceAide} />
          <Case
            label={tx.memoriser}
            checked={memoriser}
            onChange={(v) => {
              setMemoriser(v);
              if (!v) effacerMemoire();
            }}
            aide={tx.memoriserAide}
          />
        </Bloc>

        <Bloc titre={tx.client}>
          <Choix
            nom={tx.typeClient}
            valeur={c.type}
            onChange={(v) => {
              setC((x) => ({ ...x, type: v }));
              // L'autoliquidation ne vaut que pour un client professionnel : on la retire pour un particulier.
              if (v === "particulier") setD((x) => ({ ...x, autoliquidation: false }));
            }}
            options={[
              ["particulier", tx.particulier],
              ["pro", tx.pro],
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte label={c.type === "pro" ? tx.nomEntreprise : tx.nomPrenom} name="client-nom" value={c.nom} onChange={majC("nom")} />
            {c.type === "pro" && <Texte label={tx.sirenClient} name="client-siren" value={c.siren} onChange={majC("siren")} placeholder="987 654 321" />}
            <Zone label={tx.adresseFact} name="client-adresse" value={c.adresse} onChange={majC("adresse")} lignes={2} />
            {c.type === "pro" && <Texte label={tx.tvaClient} value={c.tva} onChange={majC("tva")} aide={tx.tvaClientAide} />}
            {c.type === "pro" && <Zone label={tx.livraison} value={c.adresseLivraison} onChange={majC("adresseLivraison")} lignes={2} />}
          </div>
        </Bloc>

        <Bloc titre={tx.blocDoc(estFacture)}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Texte
              label={tx.numero(estFacture)}
              name="numero"
              value={d.numero}
              onChange={majD("numero")}
              aide={dernier ? tx.dernier(dernier) : tx.numeroAide}
            />
            <Texte label={tx.dateEmission} type="date" name="date-emission" value={d.dateEmission} onChange={majD("dateEmission")} />
            {estFacture ? (
              <>
                <Texte label={tx.datePrestation} aide={tx.datePrestationAide} type="date" value={d.dateVente} onChange={majD("dateVente")} />
                <Texte label={tx.dateEcheance} type="date" name="date-echeance" value={d.dateEcheance} onChange={majD("dateEcheance")} />
                <Texte label={tx.bonCommande} value={d.bonCommande} onChange={majD("bonCommande")} aide={tx.bonCommandeAide} />
              </>
            ) : (
              <>
                <Nombre label={tx.validite} value={d.validiteJours} onChange={majD("validiteJours")} min={1} max={365} signaler={signaler} suffixe={tx.jours} />
                <Texte label={tx.debut} type="date" value={d.dateDebut} onChange={majD("dateDebut")} />
                <Texte label={tx.duree} value={d.duree} onChange={majD("duree")} placeholder={tx.dureePh} />
                <Nombre label={tx.frais} name="frais" value={d.fraisDeplacement} onChange={majD("fraisDeplacement")} min={0} max={100000} signaler={signaler} suffixe="€" />
              </>
            )}
            <Etiquette label={tx.nature}>
              <select value={d.nature} onChange={(ev) => majD("nature")(ev.target.value as Document["nature"])} className={classeSelect}>
                <option value="services">{tx.natures.services}</option>
                <option value="biens">{tx.natures.biens}</option>
                <option value="mixte">{tx.natures.mixte}</option>
              </select>
            </Etiquette>
          </div>
          {!estFacture && <Zone label={tx.lieu} value={d.lieu} onChange={majD("lieu")} lignes={2} placeholder={tx.lieuPh} />}
        </Bloc>

        <Bloc titre={tx.lignes}>
          <ol className="space-y-4">
            {d.lignes.map((l, i) => (
              <li key={l.id} className="rounded-md border border-neutral-800 p-3 space-y-3 ligne-doc">
                <div className="flex items-start gap-2">
                  <Zone
                    label={tx.designation(i + 1)}
                    name={`designation-${i}`}
                    value={l.designation}
                    onChange={majL(l.id, "designation")}
                    lignes={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-1 pt-6">
                    <button type="button" aria-label={tx.monter(i + 1)} disabled={i === 0} onClick={() => deplacer(i, -1)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 disabled:opacity-30 hover:border-neutral-500">
                      <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={tx.descendre(i + 1)} disabled={i === d.lignes.length - 1} onClick={() => deplacer(i, 1)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 disabled:opacity-30 hover:border-neutral-500">
                      <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={tx.supprimer(i + 1)} onClick={() => supprimer(l.id)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 hover:border-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5 items-end">
                  <Nombre label={tx.quantite} name={`quantite-${i}`} value={l.quantite} onChange={majL(l.id, "quantite")} min={0} max={1000000} signaler={signaler} />
                  <Texte label={tx.unite} value={l.unite} onChange={majL(l.id, "unite")} placeholder={tx.unitePh} />
                  <Nombre label={tx.prix} name={`prix-${i}`} value={l.prix} onChange={majL(l.id, "prix")} min={0} max={10000000} signaler={signaler} suffixe="€" />
                  {e.franchise ? (
                    <Etiquette label={tx.tva}>
                      <span className={cn(classeChamp, "flex items-center text-neutral-500")}>{tx.sansTva}</span>
                    </Etiquette>
                  ) : (
                    <Etiquette label={tx.tva}>
                      <select name={`tva-${i}`} value={l.tva} onChange={(ev) => majL(l.id, "tva")(Number(ev.target.value))} className={classeSelect}>
                        {TAUX_TVA.map((x) => (
                          <option key={x} value={x}>
                            {lang === "en" ? `${x.toLocaleString("en-GB")}%` : taux(x)}
                          </option>
                        ))}
                      </select>
                    </Etiquette>
                  )}
                  <Nombre label={tx.remise} name={`remise-${i}`} value={l.remise} onChange={majL(l.id, "remise")} min={0} max={100} signaler={signaler} suffixe="%" />
                </div>
                <p className="text-sm text-neutral-400 text-right tabular-nums">
                  {tx.totalLigne}
                  <span className="text-neutral-100">{mt(t.lignes.find((x) => x.ligne.id === l.id)?.totalHT ?? 0)}</span>
                </p>
              </li>
            ))}
          </ol>
          <Bouton secondaire onClick={ajouterLigne}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" /> {tx.ajouter}
            </span>
          </Bouton>
        </Bloc>

        <Bloc titre={tx.paiement}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte label={tx.conditions} value={d.conditionsPaiement} onChange={majD("conditionsPaiement")} aide={tx.conditionsAide(estFacture)} />
            {estFacture ? (
              <>
                <Nombre
                  label={tx.penalites}
                  name="penalites"
                  value={d.tauxPenalites}
                  onChange={majD("tauxPenalites")}
                  min={0}
                  max={100}
                  signaler={signaler}
                  suffixe="%"
                  aide={tx.penalitesAide}
                />
                <Texte label={tx.escompte} value={d.escompte} onChange={majD("escompte")} placeholder={tx.escomptePh} aide={tx.escompteAide} />
              </>
            ) : (
              <>
                <Nombre label={tx.acompte} name="acompte" value={d.acompte} onChange={majD("acompte")} min={0} max={100} signaler={signaler} suffixe="%" />
                <Case label={tx.gratuit} checked={d.devisGratuit} onChange={majD("devisGratuit")} aide={tx.gratuitAide} />
              </>
            )}
          </div>
          {c.type === "pro" && !e.franchise && (
            <Case label={tx.autoliq} checked={d.autoliquidation} onChange={majD("autoliquidation")} aide={tx.autoliqAide} />
          )}
          {estFacture && c.type === "particulier" && d.nature !== "services" && (
            <Case label={tx.garantie} checked={d.garantieConformite} onChange={majD("garantieConformite")} aide={tx.garantieAide} />
          )}
          <Zone label={tx.mentionsLibres} value={d.mentionsLibres} onChange={majD("mentionsLibres")} lignes={2} placeholder={tx.mentionsLibresPh} />
        </Bloc>
      </div>

      <div id="actions-document" className="xl:sticky xl:top-4 space-y-4 min-w-0 scroll-mt-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
        <div data-resultat className="rounded-lg border border-neutral-800 p-4 space-y-3">
          <p className="text-neutral-200 tabular-nums" role="status" aria-live="polite">
            {libelleTotal}
            {lang === "en" ? ": " : " : "}
            <strong className="text-white text-lg" id="total-ttc">{mt(t.totalTTC)}</strong>
            {!t.sansTVA && <span className="text-neutral-500 text-sm"> {tx.dontTVA} {mt(t.totalTVA)}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={pdf} disabled={enCours}>
              {enCours ? tx.creation : tx.telecharger(estFacture)}
            </Bouton>
            <Bouton secondaire onClick={nouveau}>
              {tx.suivant(estFacture)}
            </Bouton>
            <Bouton secondaire onClick={toutEffacer}>
              {tx.effacer}
            </Bouton>
          </div>
          <p role="status" aria-live="polite" className="text-sm text-sky-300 [overflow-wrap:anywhere] empty:hidden">
            {statut}
          </p>
          {!statut && <p className="text-xs text-neutral-500">{tx.attente}</p>}
          {tx.langueDoc && <p className="text-xs text-amber-200/90">{tx.langueDoc}</p>}
          <p className="text-xs text-neutral-500">{tx.confidentialite}</p>
        </div>
        {points.length > 0 && (
          <div className="rounded-lg border border-amber-400/40 p-4 text-sm">
            <p className="text-amber-200 font-medium mb-2">{tx.aVerifier}</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        {tx.apercu && <p className="text-xs uppercase tracking-wider text-neutral-500">{tx.apercu}</p>}
        <div lang="fr">
          <Apercu d={d} e={e} c={c} />
        </div>
      </div>
    </div>
  );
};
