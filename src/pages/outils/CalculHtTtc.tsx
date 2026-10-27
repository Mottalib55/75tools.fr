import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { fmt, fmtEuro, htVersTtc, lireNombre, recapitulatifTva, ttcVersHt } from "@/lib/calculs-nombres";
import { useLangue, type Langue } from "@/lib/langue";

const TAUX = [20, 10, 8.5, 5.5, 2.1];

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Pour retrouver le HT, je peux retirer 20 % du prix TTC ?",
      r: "Non, c'est l'erreur la plus courante. Les 20 % portent sur le prix hors taxes, pas sur le TTC. Pour 120 € TTC, retirer 20 % donne 96 €, alors que le vrai prix HT est 120 ÷ 1,20 = 100 €. Il faut donc diviser par 1 + le taux : 1,20 pour 20 %, 1,10 pour 10 %, 1,055 pour 5,5 %, 1,021 pour 2,1 %. Le mode « TTC → HT » de l'outil applique cette division.",
    },
    {
      q: "Ma facture a plusieurs lignes, la TVA se calcule ligne par ligne ou sur le total ?",
      r: "Le tableau de l'outil additionne d'abord les montants HT par taux, puis calcule la TVA de chaque taux sur ce total, arrondie au centime. Calculer et arrondir la TVA ligne par ligne peut donner un ou deux centimes d'écart sur le total. Si votre logiciel de facturation procède autrement, l'écart vient de là et non d'une erreur de calcul de sa part ou de la vôtre.",
    },
    {
      q: "Je vends en Guadeloupe, en Martinique ou à La Réunion, quel taux choisir ?",
      r: "Le taux normal y est de 8,5 % au lieu de 20 %, et les biens et services à 5,5 % ou 10 % en métropole y passent en général à 2,1 %, d'après impots.gouv.fr. Choisissez le bouton 8,5 % ou 2,1 %, ou saisissez un autre taux dans le champ libre. La Guyane et Mayotte, où la TVA n'est provisoirement pas applicable, ne sont pas couvertes par cette page.",
    },
    {
      q: "Pourquoi le TTC recalculé à partir du HT diffère parfois d'un centime de mon prix ?",
      r: "Parce que le HT obtenu par division est arrondi au centime. Un prix de 9,99 € TTC à 20 % donne 8,325 € HT, affiché 8,33 € ; en repartant de 8,33 € HT, on retrouve 8,33 + 1,67 = 10,00 €. Quand le prix de référence est le TTC (commerce de détail), l'outil calcule la TVA comme la différence TTC − HT, pour que les deux montants retombent exactement sur votre prix affiché.",
    },
    {
      q: "Je suis micro-entrepreneur en franchise de TVA, quel montant mettre sur ma facture ?",
      r: "Votre prix HT est aussi le prix payé par le client : vous ne facturez aucune TVA et vous ne la récupérez pas sur vos achats. La facture porte la mention « TVA non applicable, article 293 B du CGI ». N'utilisez donc pas le mode HT → TTC pour vos ventes tant que vous restez sous les seuils de la franchise ; il reste utile pour lire le HT des factures de vos fournisseurs.",
    },
    {
      q: "Au restaurant, la TVA est de 10 % ou de 20 % sur l'addition ?",
      r: "Les deux peuvent figurer sur la même note. Les repas et boissons sans alcool servis sur place relèvent du taux de 10 %, les boissons alcooliques restent à 20 %. Pour retrouver la TVA d'une note de restaurant, saisissez chaque part TTC à son taux dans le tableau à plusieurs lignes, ou passez chaque montant en mode TTC → HT : la somme des deux TVA est celle à déclarer en frais professionnels.",
    },
  ],
  en: [
    {
      q: "Are prices in French shops shown with or without VAT?",
      r: "Prices shown to consumers in France are always TTC, toutes taxes comprises, meaning VAT included. HT prices, hors taxes, appear on quotes and invoices between businesses, on trade price lists and on some artisan quotes. When a tradesperson sends a devis (quote) in HT for work on your home, multiply by 1.10 or 1.20 depending on the rate shown to know what you will actually pay.",
    },
    {
      q: "How do I get the price before VAT from a TTC price?",
      r: "Divide by one plus the rate, never take 20% off. For €120 TTC at 20%, the HT price is 120 ÷ 1.20 = €100; removing 20% would give €96, which is wrong because the 20% was charged on €100. Use 1.10 for 10%, 1.055 for 5.5% and 1.021 for 2.1%. The TTC → HT mode of the calculator does this division and rounds to the cent.",
    },
    {
      q: "I am a micro-entrepreneur in France, do I charge VAT?",
      r: "Not while you stay under the thresholds of the franchise en base de TVA, the VAT exemption for small businesses. Your price is then charged without VAT, you cannot reclaim VAT on purchases, and every invoice must carry the line « TVA non applicable, article 293 B du CGI ». Once you go over the threshold, you start charging VAT at the rate that applies to your activity.",
    },
    {
      q: "Which VAT rate applies in Guadeloupe, Martinique or Réunion?",
      r: "The standard rate there is 8.5% instead of 20%, and goods and services taxed at 5.5% or 10% in mainland France generally fall to 2.1%, according to impots.gouv.fr. Pick the 8.5% or 2.1% button, or type any other rate in the free field. French Guiana and Mayotte, where VAT does not currently apply, are not covered by this calculator.",
    },
    {
      q: "Why does the TTC price sometimes come back one cent different?",
      r: "Because the HT price found by division is rounded to the cent. €9.99 TTC at 20% gives €8.325 HT, shown as €8.33; starting again from €8.33 HT you get 8.33 + 1.67 = €10.00. When the TTC price is the reference, as in a shop, the tool works out the VAT as TTC minus HT so that both amounts add up exactly to your displayed price.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "impots.gouv.fr", titre: "Fiscalité des entreprises (taux de TVA)", url: "https://www.impots.gouv.fr/international-professionnel/fiscalite-des-entreprises", lu: "27 octobre 2026" },
    { editeur: "impots.gouv.fr", titre: "Quels sont les différents taux de TVA applicables dans les DOM ?", url: "https://www.impots.gouv.fr/professionnel/questions/quels-sont-les-differents-taux-de-tva-applicables-dans-les-dom", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: "27 octobre 2026" },
    { editeur: "economie.gouv.fr", titre: "TVA : quels sont les taux de votre quotidien ?", url: "https://www.economie.gouv.fr/cedef/les-fiches-pratiques/quels-sont-les-taux-de-tva-en-vigueur-en-france-et-dans-lunion", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Taux de TVA dans le secteur de l'hygiène et de la santé", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23567", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Taux de TVA pour les travaux de rénovation d'un logement", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23568", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Taux de TVA dans le secteur de l'hébergement et de l'hôtellerie", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37288", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "impots.gouv.fr", titre: "Fiscalité des entreprises (business taxation, VAT rates)", url: "https://www.impots.gouv.fr/international-professionnel/fiscalite-des-entreprises", lu: "27 October 2026" },
    { editeur: "impots.gouv.fr", titre: "Quels sont les différents taux de TVA applicables dans les DOM ? (VAT rates in the overseas departments)", url: "https://www.impots.gouv.fr/professionnel/questions/quels-sont-les-differents-taux-de-tva-applicables-dans-les-dom", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ? (from TTC to HT)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: "27 October 2026" },
    { editeur: "economie.gouv.fr", titre: "TVA : quels sont les taux de votre quotidien ? (everyday VAT rates)", url: "https://www.economie.gouv.fr/cedef/les-fiches-pratiques/quels-sont-les-taux-de-tva-en-vigueur-en-france-et-dans-lunion", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Taux de TVA pour les travaux de rénovation d'un logement (VAT on home renovation work)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23568", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Calcul HT TTC et TVA 75tools",
    motsCles: "calcul ht ttc, convertir ttc en ht, calcul tva en ligne, prix hors taxes, montant tva",
    sep: " ; ",
    tauxTva: "Taux de TVA",
    autre: "Autre",
    tauxLibre: "Taux libre",
    pct: (s: string) => `${s} %`,
    saisirTaux: "Saisissez un taux de TVA.",
    tauxNeg: "Taux négatif ramené à 0 %.",
    tauxMax: (x: string) => `Un taux de ${x} % n'existe pas : ramené à 100 %.`,
    convertir: "Convertir HT et TTC",
    sens: "Sens du calcul",
    montantHt: "Montant hors taxes (HT)",
    montantTtc: "Montant toutes taxes comprises (TTC)",
    pasNombre: "Le montant n'est pas un nombre.",
    saisirMontant: "Saisissez un montant.",
    montantNeg: "Montant négatif ramené à sa valeur positive.",
    montantMax: "Montant ramené à 1 000 milliards d'euros.",
    ht: "HT",
    tva: "TVA",
    ttc: "TTC",
    arrondi: "arrondi à",
    lignesT: "Plusieurs lignes (facultatif)",
    lignesAide: "Prix unitaires hors taxes. La TVA est calculée par taux sur le total HT de ce taux.",
    l1: "Séance de conseil",
    l2: "Places de concert",
    illisible: (i: number) => `Ligne ${i} : quantité ou prix illisible, compté comme 0.`,
    qteNeg: (i: number) => `Ligne ${i} : quantité négative ramenée à 0.`,
    prixNeg: (i: number) => `Ligne ${i} : prix négatif ramené à 0.`,
    designation: (i: number) => `Désignation ${i}`,
    quantite: "Quantité",
    prixUnit: "Prix unitaire HT",
    taux: "Taux",
    supprimer: (i: number) => `Supprimer la ligne ${i}`,
    ajouter: "Ajouter une ligne",
    base: "Base HT",
    total: "Total",
    totalTtc: "Total TTC :",
  },
  en: {
    nomAppli: "75tools French VAT calculator",
    motsCles: "french vat calculator, vat calculator france, ht to ttc, ttc to ht, remove vat from price, add vat to price",
    sep: "; ",
    tauxTva: "VAT rate",
    autre: "Other",
    tauxLibre: "Custom rate",
    pct: (s: string) => `${s}%`,
    saisirTaux: "Enter a VAT rate.",
    tauxNeg: "Negative rate brought up to 0%.",
    tauxMax: (x: string) => `A ${x}% rate does not exist: brought down to 100%.`,
    convertir: "Convert between HT and TTC",
    sens: "Direction",
    montantHt: "Amount before VAT (HT)",
    montantTtc: "Amount including VAT (TTC)",
    pasNombre: "The amount is not a number.",
    saisirMontant: "Enter an amount.",
    montantNeg: "Negative amount turned positive.",
    montantMax: "Amount capped at €1 trillion.",
    ht: "HT (before VAT)",
    tva: "VAT",
    ttc: "TTC (incl. VAT)",
    arrondi: "rounded to",
    lignesT: "Several lines (optional)",
    lignesAide: "Unit prices before VAT. VAT is worked out per rate on the HT total for that rate.",
    l1: "Consulting session",
    l2: "Concert tickets",
    illisible: (i: number) => `Line ${i}: quantity or price unreadable, counted as 0.`,
    qteNeg: (i: number) => `Line ${i}: negative quantity brought up to 0.`,
    prixNeg: (i: number) => `Line ${i}: negative price brought up to 0.`,
    designation: (i: number) => `Description ${i}`,
    quantite: "Quantity",
    prixUnit: "Unit price HT",
    taux: "Rate",
    supprimer: (i: number) => `Delete line ${i}`,
    ajouter: "Add a line",
    base: "HT base",
    total: "Total",
    totalTtc: "Total TTC:",
  },
};

/** Langue, textes et formateurs du contexte. */
const useOutils = () => {
  const lang = useLangue();
  return {
    lang,
    t: T[lang],
    f: (n: number, d = 2) => fmt(n, d, lang),
    e: (n: number) => fmtEuro(n, lang),
    lire: (s: string) => lireNombre(s, lang),
  };
};

/** Choix du taux : boutons courants et champ libre. */
const ChoixTaux = ({ taux, setTaux, libre, setLibre }: { taux: number | "libre"; setTaux: (t: number | "libre") => void; libre: string; setLibre: (v: string) => void }) => {
  const { t, f } = useOutils();
  return (
    <div>
      <p className="text-sm text-neutral-300 mb-1">{t.tauxTva}</p>
      <Bascule
        libelle={t.tauxTva}
        options={[...TAUX.map((x) => ({ v: x as number | "libre", l: t.pct(f(x)) })), { v: "libre", l: t.autre }]}
        valeur={taux}
        onChange={setTaux}
      />
      {taux === "libre" && (
        <div className="mt-3 max-w-[12rem]">
          <ChampNombre label={t.tauxLibre} value={libre} onChange={setLibre} suffixe="%" id="taux-libre" />
        </div>
      )}
    </div>
  );
};

const Convertisseur = () => {
  const { t, f, e, lire } = useOutils();
  const [sens, setSens] = useState<"ht" | "ttc">("ht");
  const [montant, setMontant] = useState("100");
  const [taux, setTaux] = useState<number | "libre">(20);
  const [libre, setLibre] = useState("");
  const msg: string[] = [];
  let tx: number | null = taux === "libre" ? null : taux;
  if (taux === "libre") {
    const n = lire(libre);
    if (n === null) msg.push(t.saisirTaux);
    else if (n < 0) (msg.push(t.tauxNeg), (tx = 0));
    else if (n > 100) (msg.push(t.tauxMax(f(n))), (tx = 100));
    else tx = n;
  }
  let m = lire(montant);
  if (montant.trim() === "") msg.push(t.saisirMontant);
  else if (m === null) msg.push(t.pasNombre);
  if (m !== null && m < 0) {
    msg.push(t.montantNeg);
    m = -m;
  }
  if (m !== null && m > 1e12) {
    msg.push(t.montantMax);
    m = 1e12;
  }
  const r = m !== null && tx !== null ? (sens === "ht" ? htVersTtc(m, tx) : ttcVersHt(m, tx)) : null;
  return (
    <BlocCalcul titre={t.convertir} id="convertir">
      <div className="space-y-4">
        <Bascule libelle={t.sens} options={[{ v: "ht" as const, l: "HT → TTC" }, { v: "ttc" as const, l: "TTC → HT" }]} valeur={sens} onChange={setSens} />
        <div className="max-w-sm">
          <ChampNombre label={sens === "ht" ? t.montantHt : t.montantTtc} value={montant} onChange={setMontant} suffixe="€" id="montant" />
        </div>
        <ChoixTaux taux={taux} setTaux={setTaux} libre={libre} setLibre={setLibre} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3" data-resultat>
        <Resultat libelle={t.ht} valeur={r ? e(r.ht) : "–"} id="res-ht" />
        <Resultat libelle={t.tva} valeur={r ? e(r.tva) : "–"} id="res-tva" />
        <Resultat libelle={t.ttc} valeur={r ? e(r.ttc) : "–"} id="res-ttc" />
      </div>
      {r && tx !== null && (
        <Formule>
          {sens === "ht" ? (
            <>
              {t.tva} = {f(r.ht)} × {f(tx, 4)} ÷ 100 = {f((r.ht * tx) / 100, 4)}, {t.arrondi} {e(r.tva)}
              {t.sep}TTC = {f(r.ht)} + {f(r.tva)} = {e(r.ttc)}
            </>
          ) : (
            <>
              HT = {f(r.ttc)} ÷ (1 + {f(tx, 4)} ÷ 100) = {f(r.ttc)} ÷ {f(1 + tx / 100, 5)} = {f(r.ttc / (1 + tx / 100), 4)}, {t.arrondi} {e(r.ht)}
              {t.sep}
              {t.tva} = {f(r.ttc)} − {f(r.ht)} = {e(r.tva)}
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

interface Ligne {
  id: number;
  libelle: string;
  quantite: string;
  prix: string;
  taux: string;
}

const TableauLignes = () => {
  const { lang, t, f, e, lire } = useOutils();
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: 1, libelle: t.l1, quantite: "2", prix: "150", taux: "20" },
    { id: 2, libelle: t.l2, quantite: "3", prix: lang === "en" ? "18.96" : "18,96", taux: "5.5" },
  ]);
  const [suivant, setSuivant] = useState(3);
  const maj = (id: number, k: keyof Ligne, v: string) => setLignes((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));
  const msg: string[] = [];
  const valides = lignes.map((l, i) => {
    let q = lire(l.quantite);
    let p = lire(l.prix);
    if ((l.quantite.trim() && q === null) || (l.prix.trim() && p === null)) msg.push(t.illisible(i + 1));
    if (q !== null && q < 0) (msg.push(t.qteNeg(i + 1)), (q = 0));
    if (p !== null && p < 0) (msg.push(t.prixNeg(i + 1)), (p = 0));
    return { quantite: q ?? 0, prixHt: p ?? 0, taux: Number(l.taux) };
  });
  const r = recapitulatifTva(valides);
  return (
    <BlocCalcul titre={t.lignesT} id="lignes">
      <p className="text-sm text-neutral-400 mb-3">{t.lignesAide}</p>
      <div className="space-y-3">
        {lignes.map((l, i) => (
          <div
            key={l.id}
            className="grid gap-2 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(5.75rem,0.9fr)_auto] items-end border-b border-neutral-800 pb-3 sm:border-0 sm:pb-0"
          >
            <label className="block min-w-0 col-span-2 sm:col-span-1">
              <span className="block text-xs text-neutral-400 mb-1">{t.designation(i + 1)}</span>
              <input value={l.libelle} onChange={(ev) => maj(l.id, "libelle", ev.target.value)} className={classeChamp} />
            </label>
            <ChampNombre label={<span className="text-xs text-neutral-400">{t.quantite}</span>} value={l.quantite} onChange={(v) => maj(l.id, "quantite", v)} />
            <ChampNombre label={<span className="text-xs text-neutral-400">{t.prixUnit}</span>} value={l.prix} onChange={(v) => maj(l.id, "prix", v)} suffixe="€" />
            <label className="block min-w-0">
              <span className="block text-xs text-neutral-400 mb-1">{t.taux}</span>
              <select value={l.taux} onChange={(ev) => maj(l.id, "taux", ev.target.value)} className={classeSelect}>
                {TAUX.map((x) => (
                  <option key={x} value={String(x)}>
                    {t.pct(f(x))}
                  </option>
                ))}
                <option value="0">{t.pct("0")}</option>
              </select>
            </label>
            <div className="flex items-end justify-between gap-2 sm:justify-end">
              <span className="sm:hidden text-sm text-neutral-300 tabular-nums">{e(r.montants[i])} HT</span>
              <button
                type="button"
                aria-label={t.supprimer(i + 1)}
                onClick={() => setLignes((ls) => ls.filter((x) => x.id !== l.id))}
                className="h-12 w-12 grid place-items-center rounded-md border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Bouton
          secondaire
          onClick={() => {
            setLignes((ls) => [...ls, { id: suivant, libelle: "", quantite: "1", prix: "", taux: "20" }]);
            setSuivant((s) => s + 1);
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" aria-hidden="true" /> {t.ajouter}
          </span>
        </Bouton>
      </div>
      <div className="mt-5">
        <Tableau
          entetes={[t.taux, t.base, t.tva]}
          minW="18rem"
          lignes={[
            ...r.detail.map((d) => [t.pct(f(d.taux)), e(d.base), e(d.tva)]),
            [<strong key="t">{t.total}</strong>, <strong key="h">{e(r.totalHt)}</strong>, <strong key="v">{e(r.totalTva)}</strong>],
          ]}
        />
        <p className="mt-3 text-lg text-white tabular-nums" id="res-total-ttc">
          {t.totalTtc} <strong>{e(r.totalTtc)}</strong>
        </p>
      </div>
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const CalculHtTtc = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
      <Convertisseur />
      <TableauLignes />
    </div>
  );
  return (
    <PageOutil
      id="calcul-ht-ttc"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="FinanceApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Calcul HT TTC : la formule et l'exemple">
      <p>
        Le calcul HT TTC tient en une multiplication : le prix toutes taxes comprises vaut le prix hors taxes multiplié
        par 1 + le taux de TVA, soit 100 € HT × 1,20 = 120 € TTC au taux normal de 20 %, dont 20 € de TVA. Dans l'autre
        sens, on divise : 120 € TTC ÷ 1,20 = 100 € HT. Avec l'outil, choisissez le sens (HT → TTC ou TTC → HT), saisissez
        le montant et cliquez sur le taux : le HT, la TVA et le TTC s'affichent au centime, avec le calcul détaillé. Les
        taux proposés sont ceux publiés par impots.gouv.fr : 20 %, 10 %, 5,5 % et 2,1 % en métropole, 8,5 % pour le taux
        normal en Guadeloupe, en Martinique et à La Réunion. La limite principale : l'outil ne choisit pas le taux à
        votre place, et chaque taux réduit a ses conditions, à vérifier dans la fiche de votre secteur.
      </p>
    </Section>

    <Section titre="Les formules HT, TVA et TTC">
      <p>
        Le prix hors taxes (HT) est le prix sans la taxe sur la valeur ajoutée ; le prix toutes taxes comprises (TTC)
        est celui que paie le client final. La TVA se calcule toujours <strong>sur le HT</strong> : TVA = HT × taux ÷
        100, TTC = HT × (1 + taux ÷ 100) et HT = TTC ÷ (1 + taux ÷ 100).
      </p>
      <p>
        La fiche de Service Public Entreprendre sur le passage du TTC au HT donne l'exemple d'un prix de 50 € TTC :
        41,67 € HT à 20 %, 45,45 € à 10 %, 46,08 € à 8,5 %, 47,39 € à 5,5 % et 48,97 € à 2,1 %. Elle précise que le
        résultat s'exprime avec deux chiffres après la virgule. L'outil retrouve ces valeurs.
      </p>
      <h3>Comment l'outil arrondit</h3>
      <p>
        Chaque montant affiché est arrondi au centime, la moitié vers le haut (0,005 devient 0,01). Dans le sens HT
        vers TTC, la TVA est arrondie puis ajoutée au HT. Dans le sens TTC vers HT, le HT est arrondi et la TVA est la
        différence entre le TTC et le HT, pour que HT + TVA retombe exactement sur le prix saisi.
      </p>
    </Section>

    <Section titre="Quel taux pour quel produit : exemples">
      <p>
        Les exemples ci-dessous viennent d'impots.gouv.fr et des fiches sectorielles de Service Public Entreprendre lues
        le 27 octobre 2026. Ils concernent la France métropolitaine ; chaque taux réduit a ses conditions.
      </p>
      <Tableau
        entetes={["Taux", "Exemples (métropole)"]}
        minW="30rem"
        lignes={[
          ["20 %", "Taux normal : la plupart des biens et des services, cosmétiques, boissons alcooliques, installation d'une chaudière à énergie fossile depuis le 1er mars 2025."],
          ["10 %", "Restauration sur place (hors alcool), transport de voyageurs, hébergement hôtelier, travaux d'amélioration d'un logement achevé depuis plus de 2 ans."],
          ["5,5 %", "La plupart des produits alimentaires, livres, travaux de rénovation énergétique d'un logement, protections hygiéniques, billetterie de spectacles."],
          ["2,1 %", "Médicaments remboursés par la Sécurité sociale, publications de presse."],
        ]}
      />
      <h3>Outre-mer</h3>
      <p>
        En Guadeloupe, en Martinique et à La Réunion, le taux normal est de <strong>8,5 %</strong> et le taux réduit de{" "}
        <strong>2,1 %</strong> s'applique aux biens et services taxés à 5,5 % ou 10 % en métropole. L'outil propose les
        boutons 8,5 % et 2,1 %, et un champ libre pour tout autre taux.
      </p>
    </Section>

    <Section titre="Cas pratiques">
      <p>
        <strong>Vous êtes artisan</strong> et rédigez un devis de rénovation pour un logement de plus de 2 ans :
        saisissez chaque poste dans le tableau, en séparant les travaux d'isolation (5,5 %) des autres travaux (10 %).
        Le récapitulatif donne la base et la TVA de chaque taux. Pour mettre le devis en forme, passez au{" "}
        <Link to="/generateur-devis/">générateur de devis</Link>.
      </p>
      <p>
        <strong>Vous êtes commerçant</strong> et fixez vos prix en TTC : le mode TTC vers HT donne le chiffre d'affaires
        hors taxes et la TVA collectée sur chaque vente. Pour aller du prix d'achat au prix de vente, le{" "}
        <Link to="/calcul-marge-commerciale/">calcul de marge commerciale</Link> donne le taux de marge et le taux de
        marque.
      </p>
      <p>
        <strong>Vous êtes particulier</strong> et comparez un devis HT et un prix TTC : convertissez l'un dans l'autre
        avant de comparer. Un devis de 1 000 € HT pour des travaux d'amélioration à 10 % revient à 1 100 € TTC, le même
        devis à 20 % à 1 200 € TTC.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="French VAT calculator: HT, TTC and the formula">
      <p>
        This French VAT calculator converts between the two prices you see on every French quote and invoice: HT, hors
        taxes, the price before VAT, and TTC, toutes taxes comprises, the price including VAT. The formula is one
        multiplication: TTC = HT × (1 + rate), so €100 HT at the standard 20% rate is €120 TTC, of which €20 is VAT
        (TVA in French). Going back, you divide: €120 TTC ÷ 1.20 = €100 HT. Pick the direction, type the amount and tap
        the rate; HT, VAT and TTC appear to the cent with the working shown. The rates offered are those published by
        impots.gouv.fr, the French tax administration: 20%, 10%, 5.5% and 2.1% in mainland France, and 8.5% as the
        standard rate in Guadeloupe, Martinique and Réunion. The main limit: the calculator does not decide which rate
        applies to your product, and each reduced rate comes with conditions.
      </p>
    </Section>

    <Section titre="HT, TTC and VAT: how the amounts relate">
      <p>
        VAT is always charged <strong>on the HT price</strong>: VAT = HT × rate ÷ 100, TTC = HT × (1 + rate ÷ 100) and
        HT = TTC ÷ (1 + rate ÷ 100). Taking 20% off a TTC price is the classic mistake: from €120 TTC it gives €96,
        while the real HT price is €100.
      </p>
      <p>
        Every amount is rounded to the cent, half up. From HT to TTC, the VAT is rounded and added to the HT price. From
        TTC to HT, the HT price is rounded and the VAT is the difference, so HT plus VAT always lands exactly on the
        price you typed. Service Public Entreprendre, the official portal for businesses, gives the example of €50 TTC:
        €41.67 HT at 20%, €45.45 at 10%, €47.39 at 5.5% and €48.97 at 2.1%. The calculator returns the same figures.
      </p>
    </Section>

    <Section titre="Which rate applies: French examples">
      <Tableau
        entetes={["Rate", "Examples (mainland France)"]}
        minW="30rem"
        lignes={[
          ["20%", "Standard rate: most goods and services, cosmetics, alcoholic drinks, installing a fossil-fuel boiler since 1 March 2025."],
          ["10%", "Restaurant meals (not alcohol), passenger transport, hotels, improvement work on a home completed more than 2 years ago."],
          ["5.5%", "Most food products, books, energy-saving renovation of a home, feminine hygiene products, tickets for live shows."],
          ["2.1%", "Medicines reimbursed by the Sécurité sociale, press publications."],
        ]}
      />
      <p>
        For several items at different rates, such as a renovation quote mixing insulation at 5.5% and other work at
        10%, use the table under the converter: it groups the HT amounts by rate and works out the VAT for each rate,
        the way a French invoice shows it. To lay out the document itself, the{" "}
        <Link to="/en/quote-generator/">quote generator</Link> produces a devis in French, as French clients expect.
        To set a selling price from a cost price, the <Link to="/en/profit-margin-calculator/">profit margin calculator</Link>{" "}
        explains the French taux de marge and taux de marque.
      </p>
    </Section>
  </>
);

export default CalculHtTtc;
