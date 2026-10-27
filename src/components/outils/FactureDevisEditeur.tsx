import { ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Bouton } from "@/components/outils/OutilLayout";
import { classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { telecharger } from "@/lib/fichiers";
import { cn } from "@/lib/utils";
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
  const verifier = () => {
    if (!value.trim()) return;
    const v = lireNombre(value);
    const fr = (n: number) => n.toLocaleString("fr-FR");
    if (!Number.isFinite(v)) {
      onChange("");
      signaler(`${label} : « ${value} » n'est pas un nombre, le champ a été vidé.`);
    } else if (v < min) {
      onChange(fr(min));
      signaler(`${label} : ${fr(v)} est en dessous du minimum, valeur ramenée à ${fr(min)}.`);
    } else if (v > max) {
      onChange(fr(max));
      signaler(`${label} : ${fr(v)} dépasse le maximum, valeur ramenée à ${fr(max)}.`);
    }
  };
  const id = useId();
  const v = lireNombre(value);
  const hors = value.trim() && Number.isFinite(v) && (v > max || v < min)
    ? `${v > max ? "Maximum" : "Minimum"} : ${(v > max ? max : min).toLocaleString("fr-FR")}, la valeur sera ramenée en quittant le champ.`
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

/* ------------------------------------------------------------------ éditeur */

export const FactureDevisEditeur = ({ type, exemple }: { type: TypeDocument; exemple: ExempleFactureDevis }) => {
  const [e, setE] = useState<Emetteur>(exemple.emetteur);
  const [c, setC] = useState<Client>(exemple.client);
  const [d, setD] = useState<Document>(() => documentInitial(type, exemple));
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
    if (!charge || !memoriser) return;
    const m = lireMemoire();
    ecrireMemoire({ ...m, emetteur: e });
  }, [e, memoriser, charge]);

  const t = useMemo(() => calculer(d, e), [d, e]);
  const points = alertes(d, e, c, t);

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
      telecharger(nomFichier(d, c), new Blob([octets], { type: "application/pdf" }));
      if (memoriser) {
        const m = lireMemoire();
        ecrireMemoire({ ...m, emetteur: e, dernier: { ...(m.dernier ?? {}), [type]: d.numero } });
      }
      setDernier(d.numero);
      setStatut(`PDF « ${nomFichier(d, c)} » créé${memoriser ? ` ; numéro ${d.numero} mémorisé comme dernier ${type === "facture" ? "numéro de facture" : "numéro de devis"}` : ""}.`);
    } catch (err) {
      setStatut("La création du PDF a échoué : " + (err instanceof Error ? err.message : String(err)));
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
    setStatut(`Nouveau document : numéro ${numeroSuivant(dernier || d.numero)}, client et lignes vidés, émetteur conservé.`);
  };

  const toutEffacer = () => {
    effacerMemoire();
    setMemoriser(false);
    setE({ ...EMETTEUR_VIDE });
    setC({ type: "particulier", nom: "", adresse: "", siren: "", tva: "", adresseLivraison: "" });
    setD((x) => ({ ...x, numero: `${prefixe(type)}-${aujourdhui().slice(0, 4)}-001`, bonCommande: "", lignes: [{ id: idSuivant.current++, designation: "", quantite: "1", unite: "u", prix: "", tva: 20, remise: "" }] }));
    setDernier("");
    setStatut("Tout est effacé : formulaire vidé et données retirées de ce navigateur. La mémorisation est désactivée.");
  };

  const estFacture = type === "facture";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] items-start">
      <form className="space-y-5 min-w-0" onSubmit={(ev) => ev.preventDefault()} aria-label={estFacture ? "Votre facture" : "Votre devis"}>
        <a href="#actions-document" className="xl:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500 !no-underline">
          Aller à l'aperçu et au téléchargement
        </a>
        <Bloc titre="Vous (émetteur)">
          <Choix
            nom="Forme de l'entreprise"
            valeur={e.forme}
            onChange={(v) => setE((x) => ({ ...x, forme: v, franchise: v === "societe" ? false : x.franchise }))}
            options={[
              ["micro", "Micro-entrepreneur"],
              ["ei", "Entrepreneur individuel"],
              ["societe", "Société"],
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte
              label={e.forme === "societe" ? "Dénomination sociale" : "Nom et prénom"}
              name="emetteur-nom"
              value={e.nom}
              onChange={majE("nom")}
              aide={e.forme !== "societe" ? "La mention « EI » est ajoutée après votre nom." : undefined}
            />
            {e.forme === "societe" ? (
              <div className="grid grid-cols-2 gap-3">
                <Texte label="Forme juridique" value={e.formeJuridique} onChange={majE("formeJuridique")} placeholder="SARL, SAS…" />
                <Nombre label="Capital social" value={e.capital} onChange={majE("capital")} min={0} max={1e12} signaler={signaler} suffixe="€" />
              </div>
            ) : (
              <Texte label="Téléphone" type="tel" value={e.telephone} onChange={majE("telephone")} autoComplete="tel" />
            )}
            <Texte label="SIREN" name="emetteur-siren" value={e.siren} onChange={majE("siren")} placeholder="123 456 789" aide="9 chiffres" />
            <Texte label="SIRET (facultatif)" value={e.siret} onChange={majE("siret")} placeholder="123 456 789 00012" aide="14 chiffres : SIREN + établissement" />
            <Zone label="Adresse" value={e.adresse} onChange={majE("adresse")} lignes={2} placeholder={"12 rue des Lilas\n69003 Lyon"} aide={e.forme === "societe" ? "Adresse du siège social" : undefined} />
            <Texte label="Immatriculation (RCS, RNE…)" value={e.registre} onChange={majE("registre")} placeholder={e.forme === "societe" ? "RCS Lyon" : "facultatif"} aide="Le SIREN est ajouté à la suite." />
            {!e.franchise && <Texte label="N° de TVA intracommunautaire" value={e.tva} onChange={majE("tva")} placeholder="FR 12 345678901" />}
            <Texte label="E-mail" type="email" value={e.email} onChange={majE("email")} autoComplete="email" />
            {e.forme === "societe" && <Texte label="Téléphone" type="tel" value={e.telephone} onChange={majE("telephone")} autoComplete="tel" />}
            <Texte label="IBAN (facultatif)" value={e.iban} onChange={majE("iban")} placeholder="FR76 …" />
          </div>
          {e.forme !== "societe" && (
            <Case
              name="franchise"
              label="Franchise en base de TVA (pas de TVA facturée)"
              checked={e.franchise}
              onChange={majE("franchise")}
              aide="Ajoute « TVA non applicable, art. 293 B du CGI » et retire les colonnes de TVA."
            />
          )}
          {!e.franchise && (
            <Case label="Option pour le paiement de la TVA d'après les débits" checked={e.optionDebits} onChange={majE("optionDebits")} aide="Seulement si vous avez choisi cette option auprès des impôts (prestations de services)." />
          )}
          <Zone label="Assurance professionnelle (activité artisanale)" value={e.assurance} onChange={majE("assurance")} lignes={2} placeholder="Assureur, coordonnées, couverture géographique" aide="Obligatoire pour une activité artisanale ; laissez vide sinon." />
          <Case
            label="Mémoriser l'émetteur et le dernier numéro dans ce navigateur"
            checked={memoriser}
            onChange={(v) => {
              setMemoriser(v);
              if (!v) effacerMemoire();
            }}
            aide="Stocké seulement sur cet appareil (stockage local du navigateur), jamais envoyé."
          />
        </Bloc>

        <Bloc titre="Client">
          <Choix
            nom="Type de client"
            valeur={c.type}
            onChange={(v) => setC((x) => ({ ...x, type: v }))}
            options={[
              ["particulier", "Particulier"],
              ["pro", "Professionnel"],
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte label={c.type === "pro" ? "Nom de l'entreprise" : "Nom et prénom"} name="client-nom" value={c.nom} onChange={majC("nom")} />
            {c.type === "pro" && <Texte label="SIREN du client" name="client-siren" value={c.siren} onChange={majC("siren")} placeholder="987 654 321" />}
            <Zone label="Adresse de facturation" name="client-adresse" value={c.adresse} onChange={majC("adresse")} lignes={2} />
            {c.type === "pro" && <Texte label="N° de TVA du client" value={c.tva} onChange={majC("tva")} aide="S'il est redevable de la TVA." />}
            {c.type === "pro" && (
              <Zone label="Adresse de livraison, si différente" value={c.adresseLivraison} onChange={majC("adresseLivraison")} lignes={2} />
            )}
          </div>
        </Bloc>

        <Bloc titre={estFacture ? "Facture" : "Devis"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Texte
              label={estFacture ? "Numéro de facture" : "Numéro de devis"}
              name="numero"
              value={d.numero}
              onChange={majD("numero")}
              aide={dernier ? `Dernier numéro utilisé ici : ${dernier}` : "Chronologique et continu, sans trou"}
            />
            <Texte label="Date d'émission" type="date" name="date-emission" value={d.dateEmission} onChange={majD("dateEmission")} />
            {estFacture ? (
              <>
                <Texte label="Date de la prestation" aide="Ou de la vente" type="date" value={d.dateVente} onChange={majD("dateVente")} />
                <Texte label="Date d'échéance" type="date" name="date-echeance" value={d.dateEcheance} onChange={majD("dateEcheance")} />
                <Texte label="N° de bon de commande" value={d.bonCommande} onChange={majD("bonCommande")} aide="Si le client en a émis un" />
              </>
            ) : (
              <>
                <Nombre label="Durée de validité" value={d.validiteJours} onChange={majD("validiteJours")} min={1} max={365} signaler={signaler} suffixe="jours" />
                <Texte label="Début prévu des travaux" type="date" value={d.dateDebut} onChange={majD("dateDebut")} />
                <Texte label="Durée estimée" value={d.duree} onChange={majD("duree")} placeholder="3 jours" />
                <Nombre label="Frais de déplacement HT" name="frais" value={d.fraisDeplacement} onChange={majD("fraisDeplacement")} min={0} max={100000} signaler={signaler} suffixe="€" />
              </>
            )}
            <Etiquette label="Nature des opérations">
              <select value={d.nature} onChange={(ev) => majD("nature")(ev.target.value as Document["nature"])} className={classeSelect}>
                <option value="services">Prestations de services</option>
                <option value="biens">Livraisons de biens</option>
                <option value="mixte">Biens et services</option>
              </select>
            </Etiquette>
          </div>
          {!estFacture && <Zone label="Lieu d'exécution" value={d.lieu} onChange={majD("lieu")} lignes={2} placeholder="Adresse du chantier, si différente" />}
        </Bloc>

        <Bloc titre="Lignes">
          <ol className="space-y-4">
            {d.lignes.map((l, i) => (
              <li key={l.id} className="rounded-md border border-neutral-800 p-3 space-y-3 ligne-doc">
                <div className="flex items-start gap-2">
                  <Zone
                    label={`Ligne ${i + 1} : désignation`}
                    name={`designation-${i}`}
                    value={l.designation}
                    onChange={majL(l.id, "designation")}
                    lignes={2}
                    className="flex-1"
                  />
                  <div className="flex flex-col gap-1 pt-6">
                    <button type="button" aria-label={`Monter la ligne ${i + 1}`} disabled={i === 0} onClick={() => deplacer(i, -1)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 disabled:opacity-30 hover:border-neutral-500">
                      <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={`Descendre la ligne ${i + 1}`} disabled={i === d.lignes.length - 1} onClick={() => deplacer(i, 1)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 disabled:opacity-30 hover:border-neutral-500">
                      <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={`Supprimer la ligne ${i + 1}`} onClick={() => supprimer(l.id)} className="h-9 w-9 grid place-items-center rounded border border-neutral-700 hover:border-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                  <Nombre label="Quantité" name={`quantite-${i}`} value={l.quantite} onChange={majL(l.id, "quantite")} min={0} max={1000000} signaler={signaler} />
                  <Texte label="Unité" value={l.unite} onChange={majL(l.id, "unite")} placeholder="h, jour, m²…" />
                  <Nombre label="Prix unitaire HT" name={`prix-${i}`} value={l.prix} onChange={majL(l.id, "prix")} min={0} max={10000000} signaler={signaler} suffixe="€" />
                  {e.franchise ? (
                    <Etiquette label="TVA">
                      <span className={cn(classeChamp, "flex items-center text-neutral-500")}>sans TVA</span>
                    </Etiquette>
                  ) : (
                    <Etiquette label="TVA">
                      <select name={`tva-${i}`} value={l.tva} onChange={(ev) => majL(l.id, "tva")(Number(ev.target.value))} className={classeSelect}>
                        {TAUX_TVA.map((x) => (
                          <option key={x} value={x}>
                            {taux(x)}
                          </option>
                        ))}
                      </select>
                    </Etiquette>
                  )}
                  <Nombre label="Remise" name={`remise-${i}`} value={l.remise} onChange={majL(l.id, "remise")} min={0} max={100} signaler={signaler} suffixe="%" />
                </div>
                <p className="text-sm text-neutral-400 text-right tabular-nums">
                  Total HT de la ligne : <span className="text-neutral-100">{montant(t.lignes.find((x) => x.ligne.id === l.id)?.totalHT ?? 0)}</span>
                </p>
              </li>
            ))}
          </ol>
          <Bouton secondaire onClick={ajouterLigne}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" aria-hidden="true" /> Ajouter une ligne
            </span>
          </Bouton>
        </Bloc>

        <Bloc titre="Paiement et mentions">
          <div className="grid gap-4 sm:grid-cols-2">
            <Texte
              label="Conditions de paiement"
              value={d.conditionsPaiement}
              onChange={majD("conditionsPaiement")}
              aide={estFacture ? "Moyen et délai : « virement à 30 jours », « à réception »…" : "Acompte, échéancier, moyen de paiement"}
            />
            {estFacture ? (
              <>
                <Nombre
                  label="Taux annuel des pénalités de retard"
                  name="penalites"
                  value={d.tauxPenalites}
                  onChange={majD("tauxPenalites")}
                  min={0}
                  max={100}
                  signaler={signaler}
                  suffixe="%"
                  aide="12,40 % = taux de la BCE au 1er juillet 2026 (2,40 %) + 10 points. Minimum : 3 fois le taux d'intérêt légal."
                />
                <Texte label="Escompte pour paiement anticipé" value={d.escompte} onChange={majD("escompte")} placeholder="néant" aide="Vide = « néant », la mention est écrite quand même." />
              </>
            ) : (
              <>
                <Nombre label="Acompte à la signature" name="acompte" value={d.acompte} onChange={majD("acompte")} min={0} max={100} signaler={signaler} suffixe="%" />
                <Case label="Devis gratuit" checked={d.devisGratuit} onChange={majD("devisGratuit")} aide="Décoché, la mention « Devis payant » est écrite." />
              </>
            )}
          </div>
          {c.type === "pro" && !e.franchise && (
            <Case
              label="Autoliquidation : la TVA est due par le client"
              checked={d.autoliquidation}
              onChange={majD("autoliquidation")}
              aide="Seulement quand c'est le client qui est redevable de la TVA. Ajoute la mention « Autoliquidation » et la TVA n'est pas facturée."
            />
          )}
          {estFacture && c.type === "particulier" && d.nature !== "services" && (
            <Case
              label="Biens couverts par la mention de garantie légale de conformité"
              checked={d.garantieConformite}
              onChange={majD("garantieConformite")}
              aide="Électroménager, informatique, téléphonie, jouets, articles de sport, meubles… : la facture à un particulier mentionne la garantie de deux ans."
            />
          )}
          <Zone label="Mentions complémentaires (une par ligne)" value={d.mentionsLibres} onChange={majD("mentionsLibres")} lignes={2} placeholder="Membre d'une association agréée, le règlement par chèque et carte bancaire est accepté" />
        </Bloc>
      </form>

      <div id="actions-document" className="xl:sticky xl:top-4 space-y-4 min-w-0 scroll-mt-4">
        <div className="rounded-lg border border-neutral-800 p-4 space-y-3">
          <p className="text-neutral-200 tabular-nums">
            {t.sansTVA ? (estFacture ? "Net à payer" : "Total") : "Total TTC"} : <strong className="text-white text-lg" id="total-ttc">{montant(t.totalTTC)}</strong>
            {!t.sansTVA && <span className="text-neutral-500 text-sm"> dont TVA {montant(t.totalTVA)}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={pdf} disabled={enCours}>
              {enCours ? "Création…" : estFacture ? "Télécharger la facture PDF" : "Télécharger le devis PDF"}
            </Bouton>
            <Bouton secondaire onClick={nouveau}>
              {estFacture ? "Facture suivante" : "Devis suivant"}
            </Bouton>
            <Bouton secondaire onClick={toutEffacer}>
              Tout effacer
            </Bouton>
          </div>
          <p role="status" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem] [overflow-wrap:anywhere]">
            {statut}
          </p>
          <p className="text-xs text-neutral-500">
            Le PDF est fabriqué par votre navigateur : ni vos coordonnées ni celles du client ne sont envoyées à 75tools.
          </p>
        </div>
        {points.length > 0 && (
          <div className="rounded-lg border border-amber-400/40 p-4 text-sm">
            <p className="text-amber-200 font-medium mb-2">À vérifier avant d'envoyer</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <Apercu d={d} e={e} c={c} />
      </div>
    </div>
  );
};
