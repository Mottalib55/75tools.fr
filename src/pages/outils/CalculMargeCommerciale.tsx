import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { BaseInverse, fmt, fmtEuro, htVersTtc, indicateursMarge, lireNombre, margeVersMarque, prixDeVente } from "@/lib/calculs-nombres";
import { useLangue, type Langue } from "@/lib/langue";

const TAUX_TVA = [20, 10, 5.5, 2.1, 0];

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Mon fournisseur parle de 50 % de marge, c'est le taux de marge ou le taux de marque ?",
      r: "Demandez-lui la base, car l'écart est grand. Un taux de marge de 50 % sur un article acheté 10 € HT donne un prix de vente de 15 € HT ; un taux de marque de 50 % donne 20 € HT. Le premier rapporte la marge au prix d'achat, le second au prix de vente. Dans la distribution et les réseaux de franchise, on parle souvent en taux de marque ou en coefficient, qui lève toute ambiguïté.",
    },
    {
      q: "J'applique un coefficient de 2, quel taux de marque cela fait-il ?",
      r: "Un coefficient de 2 sur le prix d'achat HT donne un taux de marge de 100 % et un taux de marque de 50 % : la moitié du prix de vente HT est de la marge. Si votre coefficient de 2 donne directement le prix TTC à partir de l'achat HT, la TVA est prise dedans et la marque réelle est plus faible : à 20 % de TVA, le prix HT ne vaut que 1,67 fois l'achat, soit 40 % de marque.",
    },
    {
      q: "Dois-je mettre les frais de port et les frais de douane dans le prix d'achat ?",
      r: "Oui, pour un calcul juste, le prix d'achat comprend les frais accessoires directement liés à la marchandise. L'Insee définit le coût d'achat des marchandises vendues avec les droits de douane, le transport, l'emballage et l'assurance. Les autres charges (loyer, salaires, publicité) ne s'y ajoutent pas : elles se couvrent avec la marge, qui doit donc être assez large pour les payer.",
    },
    {
      q: "Un taux de marque de 100 % est-il possible ?",
      r: "Non. Le taux de marque est la part de marge dans le prix de vente : à 100 %, le prix d'achat vaudrait zéro. Plus le taux de marque visé s'approche de 100 %, plus le prix de vente s'envole : 80 % de marque demandent un coefficient de 5, 90 % un coefficient de 10. L'outil ramène une valeur de 100 % ou plus à 99,99 % et le signale. Le taux de marge, lui, n'a pas de plafond.",
    },
    {
      q: "La marge se calcule-t-elle sur les prix HT ou sur les prix TTC ?",
      r: "Sur les prix hors taxes. La TVA encaissée sur une vente ne vous appartient pas : vous la reversez à l'État, après déduction de la TVA payée sur vos achats. Calculer une marge sur des prix TTC la gonfle de 20 % au taux normal. L'outil prend donc les deux prix en HT et ne se sert du taux de TVA que pour afficher le prix TTC à étiqueter en magasin.",
    },
    {
      q: "Si je fais une remise de 20 % sur mon prix de vente, combien de marge me reste-t-il ?",
      r: "Bien moins que 20 points en moins. Un article acheté 40 € HT et vendu 65 € HT dégage 25 € de marge, soit 38,46 % de marque. Remisé de 20 %, il est vendu 52 € HT et ne dégage plus que 12 € : la marge baisse de 52 % et le taux de marque tombe à 23,08 %. Saisissez le prix remisé dans le premier bloc pour vérifier avant de lancer une promotion.",
    },
  ],
  en: [
    {
      q: "What is the difference between taux de marge and taux de marque?",
      r: "Both divide the same margin by a different base. The taux de marge is the margin divided by the cost price, what English speakers call markup. The taux de marque is the margin divided by the selling price, the usual meaning of margin or gross margin percentage. Bought at €40 and sold at €65, the markup is 62.5% and the margin 38.46%, before VAT in both cases.",
    },
    {
      q: "My French supplier talks about a 50% margin, which one is it?",
      r: "Ask which base they use, because the gap is large. A 50% taux de marge on an item bought for €10 before VAT gives a selling price of €15; a 50% taux de marque gives €20. French retail chains and franchise networks often reason in taux de marque or in coefficient, the multiplier applied to cost, which removes any doubt about the base.",
    },
    {
      q: "I use a multiplier of 2 on my cost, what margin does that give?",
      r: "A coefficient of 2 on the cost before VAT is a 100% markup and a 50% margin: half the selling price before VAT is margin. If your multiplier of 2 produces the shelf price including VAT, the VAT sits inside it and the real margin is lower: at 20% VAT the price before tax is only 1.67 times the cost, which is a 40% margin.",
    },
    {
      q: "Should margin be calculated before or after French VAT?",
      r: "Before VAT, on HT prices. The VAT you collect on a sale is not yours: you pass it to the French tax office after deducting the VAT paid on your purchases. A margin worked out on TTC prices is inflated by 20% at the standard rate. The calculator takes both prices HT and uses the VAT rate only to show the TTC price you would display in a shop.",
    },
    {
      q: "Can a margin rate reach 100%?",
      r: "No. The taux de marque is the share of margin in the selling price, so 100% would mean the goods cost nothing. As the target margin approaches 100%, the price shoots up: 80% needs a multiplier of 5 and 90% a multiplier of 10. The calculator brings any value of 100% or more down to 99.99% and says so. Markup, on the other hand, has no ceiling.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Affichage des prix : règles à respecter", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F34344", lu: "27 octobre 2026" },
    { editeur: "impots.gouv.fr", titre: "Fiscalité des entreprises (taux de TVA)", url: "https://www.impots.gouv.fr/international-professionnel/fiscalite-des-entreprises", lu: "27 octobre 2026" },
    { editeur: "Insee", titre: "Marge commerciale (définition)", url: "https://www.insee.fr/fr/metadonnees/definition/c1774", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ? (from TTC to HT)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Affichage des prix : règles à respecter (price display rules)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F34344", lu: "27 October 2026" },
    { editeur: "impots.gouv.fr", titre: "Fiscalité des entreprises (business taxation, VAT rates)", url: "https://www.impots.gouv.fr/international-professionnel/fiscalite-des-entreprises", lu: "27 October 2026" },
    { editeur: "Insee", titre: "Marge commerciale (definition of trading margin)", url: "https://www.insee.fr/fr/metadonnees/definition/c1774", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Calcul de marge commerciale 75tools",
    motsCles: "calcul marge commerciale, calculer taux de marge et de marque, taux de marque, coefficient multiplicateur, prix de vente",
    sep: " ; ",
    pct: (s: string) => `${s} %`,
    tvaTtc: "TVA pour le prix TTC",
    tauxTva: "Taux de TVA",
    saisirAchat: "Saisissez le prix d'achat HT.",
    achatNombre: "Le prix d'achat n'est pas un nombre.",
    achatZero: "Le prix d'achat doit être supérieur à 0 : valeur ramenée à 0,01 €.",
    saisirVente: "Saisissez le prix de vente HT.",
    venteNombre: "Le prix de vente n'est pas un nombre.",
    venteZero: "Le prix de vente doit être supérieur à 0 : valeur ramenée à 0,01 €.",
    perte: "Le prix de vente est inférieur au prix d'achat : vous vendez à perte, la marge est négative.",
    t1: "Marge, taux de marge et taux de marque",
    achat: "Prix d'achat HT",
    vente: "Prix de vente HT",
    marge: "Marge commerciale HT",
    coef: "Coefficient multiplicateur",
    tauxMarge: "Taux de marge",
    tauxMarque: "Taux de marque",
    fMarge: "Marge",
    fTauxMarge: "taux de marge",
    fTauxMarque: "taux de marque",
    fCoef: "coefficient",
    fTtc: "prix TTC",
    t2: "Prix de vente à partir d'un objectif",
    objectif: "Objectif",
    oMarque: "Marque",
    oMarge: "Marge",
    oCoef: "Coefficient",
    vMarge: "Taux de marge visé",
    vMarque: "Taux de marque visé",
    vCoef: "Coefficient",
    saisirVise: "Saisissez la valeur visée.",
    viseNombre: "La valeur visée n'est pas un nombre.",
    marqueMax: (x: string) => `Un taux de marque de ${x} % est impossible (le prix d'achat serait nul) : ramené à 99,99 %.`,
    marqueNeg: "Taux de marque négatif ramené à 0 %.",
    margeNeg: "Taux de marge négatif ramené à 0 %.",
    coefNeg: "Le coefficient doit être positif : ramené à 1.",
    coefBas: "Un coefficient inférieur à 1 fait vendre à perte.",
    pvHt: "Prix de vente HT",
    pvSans: "Prix de vente (sans TVA)",
    pvTtc: (x: string) => `Prix de vente TTC (${x} %)`,
    resume: (m: string, a: string, b: string, c: string) => `Marge ${m} · taux de marge ${a} % · taux de marque ${b} % · coefficient ${c}`,
    eq: ["Taux de marge", "Taux de marque", "Coefficient", "Prix de vente HT"],
  },
  en: {
    nomAppli: "75tools profit margin calculator",
    motsCles: "profit margin calculator, markup calculator, margin vs markup, taux de marge, taux de marque, selling price calculator",
    sep: "; ",
    pct: (s: string) => `${s}%`,
    tvaTtc: "VAT for the price incl. VAT",
    tauxTva: "VAT rate",
    saisirAchat: "Enter the cost price before VAT.",
    achatNombre: "The cost price is not a number.",
    achatZero: "The cost price must be above 0: set to €0.01.",
    saisirVente: "Enter the selling price before VAT.",
    venteNombre: "The selling price is not a number.",
    venteZero: "The selling price must be above 0: set to €0.01.",
    perte: "The selling price is below the cost price: you are selling at a loss and the margin is negative.",
    t1: "Margin, markup and margin rate",
    achat: "Cost price before VAT (HT)",
    vente: "Selling price before VAT (HT)",
    marge: "Gross margin before VAT",
    coef: "Multiplier (coefficient)",
    tauxMarge: "Markup (taux de marge)",
    tauxMarque: "Margin rate (taux de marque)",
    fMarge: "Margin",
    fTauxMarge: "markup",
    fTauxMarque: "margin rate",
    fCoef: "multiplier",
    fTtc: "price incl. VAT",
    t2: "Selling price from a target",
    objectif: "Target",
    oMarque: "Margin",
    oMarge: "Markup",
    oCoef: "Multiplier",
    vMarge: "Target markup",
    vMarque: "Target margin rate",
    vCoef: "Multiplier",
    saisirVise: "Enter the target value.",
    viseNombre: "The target value is not a number.",
    marqueMax: (x: string) => `A ${x}% margin rate is impossible (the cost would be zero): brought down to 99.99%.`,
    marqueNeg: "Negative margin rate brought up to 0%.",
    margeNeg: "Negative markup brought up to 0%.",
    coefNeg: "The multiplier must be positive: set to 1.",
    coefBas: "A multiplier below 1 means selling at a loss.",
    pvHt: "Selling price before VAT",
    pvSans: "Selling price (no VAT)",
    pvTtc: (x: string) => `Price incl. VAT (${x}%)`,
    resume: (m: string, a: string, b: string, c: string) => `Margin ${m} · markup ${a}% · margin rate ${b}% · multiplier ${c}`,
    eq: ["Markup (taux de marge)", "Margin rate (taux de marque)", "Multiplier", "Selling price before VAT"],
  },
};

type Textes = (typeof T)["fr"];

/** Langue, textes et formateurs du contexte. */
const useOutils = () => {
  const lang = useLangue();
  return {
    lang,
    t: T[lang] as Textes,
    f: (n: number, d = 2) => fmt(n, d, lang),
    e: (n: number) => fmtEuro(n, lang),
    lire: (s: string) => lireNombre(s, lang),
  };
};

const ChoixTva = ({ tva, setTva }: { tva: number; setTva: (t: number) => void }) => {
  const { t, f } = useOutils();
  return (
    <div>
      <p className="text-sm text-neutral-300 mb-1">{t.tvaTtc}</p>
      <Bascule libelle={t.tauxTva} options={TAUX_TVA.map((x) => ({ v: x, l: t.pct(f(x)) }))} valeur={tva} onChange={setTva} />
    </div>
  );
};

const lireAchat = (s: string, msg: string[], t: Textes, lire: (s: string) => number | null): number | null => {
  const n = lire(s);
  if (s.trim() === "") return msg.push(t.saisirAchat), null;
  if (n === null) return msg.push(t.achatNombre), null;
  if (n <= 0) return msg.push(t.achatZero), 0.01;
  return n;
};

/** Indicateurs à partir des deux prix. */
const BlocIndicateurs = () => {
  const { t, f, e, lire } = useOutils();
  const [achat, setAchat] = useState("40");
  const [vente, setVente] = useState("65");
  const [tva, setTva] = useState(20);
  const msg: string[] = [];
  const a = lireAchat(achat, msg, t, lire);
  let v = lire(vente);
  if (vente.trim() === "") msg.push(t.saisirVente);
  else if (v === null) msg.push(t.venteNombre);
  else if (v <= 0) (msg.push(t.venteZero), (v = 0.01));
  const r = a !== null && v !== null ? indicateursMarge(a, v) : null;
  if (r && r.marge < 0) msg.push(t.perte);
  const ttc = v !== null ? htVersTtc(v, tva) : null;
  return (
    <BlocCalcul titre={t.t1} id="indicateurs">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label={t.achat} value={achat} onChange={setAchat} suffixe="€" id="achat" />
        <ChampNombre label={t.vente} value={vente} onChange={setVente} suffixe="€" id="vente" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4" data-resultat>
        <Resultat libelle={t.marge} valeur={r ? e(r.marge) : "–"} id="res-marge" />
        <Resultat libelle={t.coef} valeur={r && r.coefficient !== null ? f(r.coefficient, 4) : "–"} id="res-coef" />
        <Resultat libelle={t.tauxMarge} valeur={r && r.tauxMarge !== null ? t.pct(f(r.tauxMarge)) : "–"} id="res-taux-marge" />
        <Resultat libelle={t.tauxMarque} valeur={r && r.tauxMarque !== null ? t.pct(f(r.tauxMarque)) : "–"} id="res-taux-marque" />
      </div>
      <div className="mt-4">
        <ChoixTva tva={tva} setTva={setTva} />
      </div>
      {r && a !== null && v !== null && ttc && (
        <Formule>
          {t.fMarge} = {f(v)} − {f(a)} = {e(r.marge)}
          {t.sep}
          {t.fTauxMarge} = {f(r.marge)} ÷ {f(a)} × 100 = {t.pct(f(r.tauxMarge!, 4))}
          {t.sep}
          {t.fTauxMarque} = {f(r.marge)} ÷ {f(v)} × 100 = {t.pct(f(r.tauxMarque!, 4))}
          {t.sep}
          {t.fCoef} = {f(v)} ÷ {f(a)} = {f(r.coefficient!, 4)}
          {t.sep}
          {t.fTtc} = {f(v)} × {f(1 + tva / 100, 4)} = {e(ttc.ttc)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Prix de vente à partir d'un objectif. */
const BlocInverse = () => {
  const { t, f, e, lire } = useOutils();
  const [achat, setAchat] = useState("40");
  const [base, setBase] = useState<BaseInverse>("marque");
  const [valeur, setValeur] = useState("35");
  const [tva, setTva] = useState(20);
  const msg: string[] = [];
  const a = lireAchat(achat, msg, t, lire);
  let x = lire(valeur);
  if (valeur.trim() === "") msg.push(t.saisirVise);
  else if (x === null) msg.push(t.viseNombre);
  else if (base === "marque" && x >= 100) (msg.push(t.marqueMax(f(x))), (x = 99.99));
  else if (base === "marque" && x < 0) (msg.push(t.marqueNeg), (x = 0));
  else if (base === "marge" && x < 0) (msg.push(t.margeNeg), (x = 0));
  else if (base === "coefficient" && x <= 0) (msg.push(t.coefNeg), (x = 1));
  else if (base === "coefficient" && x < 1) msg.push(t.coefBas);
  const pv = a !== null && x !== null ? prixDeVente(a, base, x) : null;
  const r = pv !== null && a !== null ? indicateursMarge(a, pv) : null;
  const ttc = pv !== null ? htVersTtc(pv, tva) : null;
  const libelleBase = base === "marge" ? t.vMarge : base === "marque" ? t.vMarque : t.vCoef;
  return (
    <BlocCalcul titre={t.t2} id="inverse">
      <Bascule
        libelle={t.objectif}
        options={[
          { v: "marque" as const, l: t.oMarque },
          { v: "marge" as const, l: t.oMarge },
          { v: "coefficient" as const, l: t.oCoef },
        ]}
        valeur={base}
        onChange={setBase}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label={t.achat} value={achat} onChange={setAchat} suffixe="€" />
        <ChampNombre label={libelleBase} value={valeur} onChange={setValeur} suffixe={base === "coefficient" ? "×" : "%"} id="valeur-visee" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Resultat libelle={t.pvHt} valeur={pv !== null ? e(pv) : "–"} id="res-pv-ht" />
        <Resultat libelle={tva === 0 ? t.pvSans : t.pvTtc(f(tva))} valeur={ttc ? e(ttc.ttc) : "–"} id="res-pv-ttc" />
      </div>
      <div className="mt-4">
        <ChoixTva tva={tva} setTva={setTva} />
      </div>
      {r && <p className="mt-3 text-sm text-neutral-300 tabular-nums">{t.resume(e(r.marge), f(r.tauxMarge!), f(r.tauxMarque!), f(r.coefficient!, 4))}</p>}
      {pv !== null && a !== null && x !== null && (
        <Formule>
          {t.pvHt} = {f(a)}
          {base === "marge" && <> × (1 + {f(x, 4)} ÷ 100)</>}
          {base === "marque" && <> ÷ (1 − {f(x, 4)} ÷ 100) = {f(a)} ÷ {f(1 - x / 100, 6)}</>}
          {base === "coefficient" && <> × {f(x, 4)}</>} = {e(pv)}
          {tva > 0 && ttc && (
            <>
              {t.sep}
              {t.fTtc} = {f(ttc.ht)} × {f(1 + tva / 100, 4)} = {e(ttc.ttc)}
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const equivalences = (lang: Langue) =>
  [10, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200].map((tm) => [
    T[lang].pct(fmt(tm, 2, lang)),
    T[lang].pct(fmt(margeVersMarque(tm), 2, lang)),
    fmt(1 + tm / 100, 2, lang),
    fmtEuro(10 * (1 + tm / 100), lang),
  ]);

const CalculMargeCommerciale = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <BlocIndicateurs />
      <BlocInverse />
    </div>
  );
  return (
    <PageOutil
      id="calcul-marge-commerciale"
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
    <Section titre="Calcul de marge commerciale : la méthode">
      <p>
        Le calcul de marge commerciale part de deux prix hors taxes : la marge est le prix de vente HT moins le prix
        d'achat HT. Un article acheté 40 € HT et vendu 65 € HT dégage 25 € de marge. Cette marge s'exprime ensuite de
        trois façons, que l'outil affiche dès la saisie des deux prix : le taux de marge (25 ÷ 40 = 62,5 %), le taux de
        marque (25 ÷ 65 = 38,46 %) et le coefficient multiplicateur (65 ÷ 40 = 1,625). Le second bloc fait le chemin
        inverse : à partir d'un prix d'achat et d'un objectif (taux de marque, taux de marge ou coefficient), il donne
        le prix de vente HT et le prix TTC à afficher selon le taux de TVA choisi. La limite à connaître : l'outil
        calcule une marge commerciale, pas un bénéfice, car le loyer, les salaires et les autres charges restent à
        payer avec cette marge.
      </p>
    </Section>

    <Section titre="Taux de marge et taux de marque : la différence">
      <p>
        La <strong>marge commerciale</strong> est l'écart entre le prix de vente hors taxes et le coût d'achat hors taxes
        des marchandises vendues, selon la définition de l'Insee, qui inclut dans le coût d'achat les frais
        accessoires : droits de douane, transport, emballage, assurance. Le <strong>taux de marge</strong> rapporte la
        marge au prix d'achat : il dit combien on ajoute au coût. Le <strong>taux de marque</strong> la rapporte au
        prix de vente : il dit quelle part du prix revient au commerçant. Le <strong>coefficient</strong> est le
        nombre par lequel on multiplie le prix d'achat pour obtenir le prix de vente.
      </p>
      <p>
        Le taux de marque est toujours plus petit que le taux de marge pour une marge positive, parce qu'on divise la
        même marge par un nombre plus grand. On passe de l'un à l'autre sans connaître les prix : taux de marque = taux
        de marge ÷ (1 + taux de marge), et taux de marge = taux de marque ÷ (1 − taux de marque), les taux étant écrits
        en décimal.
      </p>
    </Section>

    <Section titre="Tableau d'équivalences">
      <p>Pour un article acheté 10 € HT, voici le prix de vente HT selon le taux de marge, avec le taux de marque et le coefficient correspondants.</p>
      <Tableau entetes={T.fr.eq} lignes={equivalences("fr")} minW="26rem" />
      <p>
        Un coefficient de 2 correspond à 100 % de marge et 50 % de marque, et un taux de marque de 60 % demande un
        coefficient de 2,5. Ce sont des ordres de grandeur arithmétiques, pas des normes : la marge suffisante dépend
        de vos charges, de votre secteur et de vos volumes.
      </p>
    </Section>

    <Section titre="Fixer un prix de vente pas à pas">
      <p>
        Calculez d'abord le prix d'achat complet : prix fournisseur HT, plus les frais de port, de douane et
        d'emballage ramenés à l'unité, moins les remises. Choisissez ensuite votre objectif en taux de marque ou en
        coefficient, à partir de ce que la marge doit payer ; le second bloc donne le prix de vente HT correspondant.
      </p>
      <p>
        Passez enfin au TTC avec le taux de TVA du produit. Le prix TTC est souvent arrondi à un prix psychologique
        (29,90 € plutôt que 30,24 €) : saisissez alors le prix HT obtenu après arrondi dans le premier bloc pour
        vérifier le taux de marque réel. Le <Link to="/calcul-ht-ttc/">calcul HT TTC</Link> fait la conversion inverse
        à partir d'un prix affiché, et la page pour <Link to="/calculer-un-pourcentage/">calculer un pourcentage</Link>{" "}
        aide pour les remises.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Profit margin calculator: markup and margin in French terms">
      <p>
        This profit margin calculator starts from two prices before VAT: the margin is the selling price minus the cost
        price. An item bought for €40 and sold for €65, both HT (hors taxes, before VAT), earns a €25 margin. The tool
        then shows that margin three ways as soon as you type the two prices: the markup, which French accountants call
        taux de marge and calculate on the cost price (25 ÷ 40 = 62.5%); the margin rate, called taux de marque and
        calculated on the selling price (25 ÷ 65 = 38.46%); and the multiplier, or coefficient (65 ÷ 40 = 1.625). The
        second block works backwards from a cost and a target to the selling price before VAT and the price including
        French VAT. The main limit: this is a trading margin, not a profit, since rent, wages and other costs are still
        paid out of it.
      </p>
    </Section>

    <Section titre="Taux de marge versus taux de marque">
      <p>
        The trap for English speakers working in France is vocabulary. In everyday English "margin" usually means the
        share of the selling price, which in French is the <strong>taux de marque</strong>. The French{" "}
        <strong>taux de marge</strong>, which sounds like "margin rate", is in fact a markup on cost. A French supplier,
        accountant or franchise contract quoting "50 % de marge" may mean either, so always check the base. The{" "}
        <strong>coefficient</strong>, the number you multiply the cost by, avoids the ambiguity: a coefficient of 2 is a
        100% markup and a 50% margin.
      </p>
      <p>
        You can convert one into the other without the prices: margin = markup ÷ (1 + markup), and markup = margin ÷
        (1 − margin), with rates written as decimals. Insee, the French statistics office, defines the trading margin
        on prices before VAT and includes customs duties, transport, packaging and insurance in the cost of goods sold.
      </p>
      <Tableau entetes={T.en.eq} lignes={equivalences("en")} minW="26rem" />
    </Section>

    <Section titre="Setting a selling price in France">
      <p>
        Start from the full cost per unit: supplier price before VAT, plus shipping, customs and packaging, minus
        discounts. Pick a target margin or multiplier from what the margin must pay for, and read the selling price
        before VAT in the second block. Then add VAT at the rate for your product; prices displayed to French consumers
        must include it. If you round the shelf price to €29.90, type the matching HT price in the first block to see
        the margin you really keep. The <Link to="/en/vat-calculator/">French VAT calculator</Link> converts a shelf
        price back to HT, and the <Link to="/en/percentage-calculator/">percentage calculator</Link> helps with
        discounts.
      </p>
    </Section>
  </>
);

export default CalculMargeCommerciale;
