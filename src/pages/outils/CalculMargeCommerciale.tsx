import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import {
  BaseInverse,
  fmt,
  fmtEuro,
  htVersTtc,
  indicateursMarge,
  lireNombre,
  margeVersMarque,
  prixDeVente,
} from "@/lib/calculs-nombres";

const TAUX_TVA = [20, 10, 5.5, 2.1, 0];
const LU = "27 octobre 2026";

const FAQ: QuestionFaq[] = [
  {
    q: "Mon fournisseur parle de 50 % de marge, c'est le taux de marge ou le taux de marque ?",
    r: "Demandez-lui la base, car l'écart est grand. Un taux de marge de 50 % sur un article acheté 10 € HT donne un prix de vente de 15 € HT ; un taux de marque de 50 % donne 20 € HT. Le premier rapporte la marge au prix d'achat, le second au prix de vente. Dans la grande distribution et les réseaux de franchise, on parle souvent en taux de marque ou en coefficient ; le coefficient lève toute ambiguïté.",
  },
  {
    q: "J'applique un coefficient de 2, quel taux de marque cela fait-il ?",
    r: "Un coefficient de 2 sur le prix d'achat HT donne un taux de marge de 100 % et un taux de marque de 50 % : la moitié du prix de vente HT est de la marge. Si votre coefficient de 2 donne directement le prix TTC à partir de l'achat HT, la TVA est prise dedans et la marque réelle est plus faible : à 20 % de TVA, le prix HT ne vaut que 2 ÷ 1,2 = 1,67 fois l'achat, soit 40 % de marque.",
  },
  {
    q: "Dois-je mettre les frais de port et les frais de douane dans le prix d'achat ?",
    r: "Oui, pour un calcul juste, le prix d'achat comprend les frais accessoires directement liés à la marchandise. L'Insee définit d'ailleurs le coût d'achat des marchandises vendues avec les droits de douane, le transport, l'emballage et l'assurance. Les autres charges (loyer, salaires, publicité) ne s'y ajoutent pas : elles se couvrent avec la marge, qui doit donc être assez large pour les payer.",
  },
  {
    q: "Un taux de marque de 100 % est-il possible ?",
    r: "Non. Le taux de marque est la part de marge dans le prix de vente : à 100 %, le prix d'achat vaudrait zéro. Plus le taux de marque visé s'approche de 100 %, plus le prix de vente s'envole : 80 % de marque demandent un coefficient de 5, 90 % un coefficient de 10. L'outil ramène une valeur de 100 % ou plus à 99,99 % et le signale. Le taux de marge, lui, n'a pas de plafond.",
  },
];

const ChoixTva = ({ tva, setTva }: { tva: number; setTva: (t: number) => void }) => (
  <div>
    <p className="text-sm text-neutral-300 mb-1">TVA pour le prix TTC</p>
    <Bascule libelle="Taux de TVA" options={TAUX_TVA.map((t) => ({ v: t, l: t === 0 ? "0 %" : `${fmt(t)} %` }))} valeur={tva} onChange={setTva} />
  </div>
);

const lireAchat = (s: string, msg: string[]): number | null => {
  const n = lireNombre(s);
  if (s.trim() === "") {
    msg.push("Saisissez le prix d'achat HT.");
    return null;
  }
  if (n === null) {
    msg.push("Le prix d'achat n'est pas un nombre.");
    return null;
  }
  if (n <= 0) {
    msg.push("Le prix d'achat doit être supérieur à 0 : valeur ramenée à 0,01 €.");
    return 0.01;
  }
  return n;
};

/** Indicateurs à partir des deux prix. */
const BlocIndicateurs = () => {
  const [achat, setAchat] = useState("40");
  const [vente, setVente] = useState("65");
  const [tva, setTva] = useState(20);
  const msg: string[] = [];
  const a = lireAchat(achat, msg);
  let v = lireNombre(vente);
  if (vente.trim() === "") msg.push("Saisissez le prix de vente HT.");
  else if (v === null) msg.push("Le prix de vente n'est pas un nombre.");
  else if (v <= 0) {
    msg.push("Le prix de vente doit être supérieur à 0 : valeur ramenée à 0,01 €.");
    v = 0.01;
  }
  const ok = a !== null && v !== null;
  const r = ok ? indicateursMarge(a, v) : null;
  if (r && r.marge < 0) msg.push("Le prix de vente est inférieur au prix d'achat : vous vendez à perte, la marge est négative.");
  const ttc = ok ? htVersTtc(v, tva) : null;
  return (
    <BlocCalcul titre="Marge, taux de marge et taux de marque" id="indicateurs">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label="Prix d'achat HT" value={achat} onChange={setAchat} suffixe="€" id="achat" />
        <ChampNombre label="Prix de vente HT" value={vente} onChange={setVente} suffixe="€" id="vente" />
      </div>
      <div className="mt-4">
        <ChoixTva tva={tva} setTva={setTva} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Resultat libelle="Marge commerciale HT" valeur={r ? fmtEuro(r.marge) : "–"} id="res-marge" />
        <Resultat libelle="Coefficient multiplicateur" valeur={r && r.coefficient !== null ? fmt(r.coefficient, 4) : "–"} id="res-coef" />
        <Resultat libelle="Taux de marge" valeur={r && r.tauxMarge !== null ? `${fmt(r.tauxMarge)} %` : "–"} id="res-taux-marge" />
        <Resultat libelle="Taux de marque" valeur={r && r.tauxMarque !== null ? `${fmt(r.tauxMarque)} %` : "–"} id="res-taux-marque" />
      </div>
      {r && ok && ttc && (
        <Formule>
          Marge = {fmt(v)} − {fmt(a)} = {fmt(r.marge)} € ; taux de marge = {fmt(r.marge)} ÷ {fmt(a)} × 100 = {fmt(r.tauxMarge!, 4)} % ; taux de
          marque = {fmt(r.marge)} ÷ {fmt(v)} × 100 = {fmt(r.tauxMarque!, 4)} % ; coefficient = {fmt(v)} ÷ {fmt(a)} = {fmt(r.coefficient!, 4)} ; prix
          TTC = {fmt(v)} × {fmt(1 + tva / 100, 4)} = {fmtEuro(ttc.ttc)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Prix de vente à partir d'un objectif. */
const BlocInverse = () => {
  const [achat, setAchat] = useState("40");
  const [base, setBase] = useState<BaseInverse>("marque");
  const [valeur, setValeur] = useState("35");
  const [tva, setTva] = useState(20);
  const msg: string[] = [];
  const a = lireAchat(achat, msg);
  let x = lireNombre(valeur);
  if (valeur.trim() === "") msg.push("Saisissez la valeur visée.");
  else if (x === null) msg.push("La valeur visée n'est pas un nombre.");
  else if (base === "marque" && x >= 100) {
    msg.push(`Un taux de marque de ${fmt(x)} % est impossible (le prix d'achat serait nul) : ramené à 99,99 %.`);
    x = 99.99;
  } else if (base === "marque" && x < 0) {
    msg.push("Taux de marque négatif ramené à 0 %.");
    x = 0;
  } else if (base === "marge" && x < 0) {
    msg.push("Taux de marge négatif ramené à 0 %.");
    x = 0;
  } else if (base === "coefficient" && x <= 0) {
    msg.push("Le coefficient doit être positif : ramené à 1.");
    x = 1;
  } else if (base === "coefficient" && x < 1) msg.push("Un coefficient inférieur à 1 fait vendre à perte.");
  const pv = a !== null && x !== null ? prixDeVente(a, base, x) : null;
  const r = pv !== null && a !== null ? indicateursMarge(a, pv) : null;
  const ttc = pv !== null ? htVersTtc(pv, tva) : null;
  const libelleBase = base === "marge" ? "Taux de marge visé" : base === "marque" ? "Taux de marque visé" : "Coefficient";
  return (
    <BlocCalcul titre="Prix de vente à partir d'un objectif" id="inverse">
      <Bascule
        libelle="Objectif"
        options={[
          { v: "marque" as const, l: "Marque" },
          { v: "marge" as const, l: "Marge" },
          { v: "coefficient" as const, l: "Coefficient" },
        ]}
        valeur={base}
        onChange={setBase}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label="Prix d'achat HT" value={achat} onChange={setAchat} suffixe="€" />
        <ChampNombre label={libelleBase} value={valeur} onChange={setValeur} suffixe={base === "coefficient" ? "×" : "%"} id="valeur-visee" />
      </div>
      <div className="mt-4">
        <ChoixTva tva={tva} setTva={setTva} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Resultat libelle="Prix de vente HT" valeur={pv !== null ? fmtEuro(pv) : "–"} id="res-pv-ht" />
        <Resultat libelle={tva === 0 ? "Prix de vente (sans TVA)" : `Prix de vente TTC (${fmt(tva)} %)`} valeur={ttc ? fmtEuro(ttc.ttc) : "–"} id="res-pv-ttc" />
      </div>
      {r && (
        <p className="mt-3 text-sm text-neutral-300 tabular-nums">
          Marge {fmtEuro(r.marge)} · taux de marge {fmt(r.tauxMarge!)} % · taux de marque {fmt(r.tauxMarque!)} % · coefficient {fmt(r.coefficient!, 4)}
        </p>
      )}
      {pv !== null && a !== null && x !== null && (
        <Formule>
          {base === "marge" && (
            <>
              Prix de vente HT = {fmt(a)} × (1 + {fmt(x, 4)} ÷ 100) = {fmt(pv, 4)} €
            </>
          )}
          {base === "marque" && (
            <>
              Prix de vente HT = {fmt(a)} ÷ (1 − {fmt(x, 4)} ÷ 100) = {fmt(a)} ÷ {fmt(1 - x / 100, 6)} = {fmt(pv, 4)} €
            </>
          )}
          {base === "coefficient" && (
            <>
              Prix de vente HT = {fmt(a)} × {fmt(x, 4)} = {fmt(pv, 4)} €
            </>
          )}
          {tva > 0 && ttc && (
            <>
              {" "}; TTC = {fmt(ttc.ht)} × {fmt(1 + tva / 100, 4)} = {fmtEuro(ttc.ttc)}
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const EQUIVALENCES = [10, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200].map((tm) => [
  `${fmt(tm)} %`,
  `${fmt(margeVersMarque(tm), 2)} %`,
  fmt(1 + tm / 100, 2),
  fmtEuro(10 * (1 + tm / 100)),
]);

const CalculMargeCommerciale = () => (
  <PageOutil
    href="/calcul-marge-commerciale/"
    titre="Marge commerciale : taux de marge et de marque, gratuit"
    description="Marge commerciale en ligne : à partir des prix d'achat et de vente HT, obtenez la marge, le taux de marge, le taux de marque, le coefficient et le prix TTC."
    motsCles="calcul marge commerciale, calculer taux de marge et de marque, taux de marque, coefficient multiplicateur, prix de vente"
    nomAppli="Calcul de marge commerciale"
    categorieAppli="FinanceApplication"
    h1="Calcul de marge commerciale"
    chapeau="Entrez votre prix d'achat et votre prix de vente hors taxes : la marge, le taux de marge, le taux de marque et le coefficient s'affichent. Dans l'autre sens, partez d'un taux visé pour obtenir le prix de vente HT et TTC."
    faq={FAQ}
    sources={[
      { editeur: "Insee", titre: "Définition : marge commerciale", url: "https://www.insee.fr/fr/metadonnees/definition/c1774", lu: LU },
      { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: LU },
    ]}
  >
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <BlocIndicateurs />
      <BlocInverse />
    </div>

    <Section titre="Taux de marge et taux de marque : la différence">
      <p>
        La <strong>marge commerciale</strong> est l'écart entre le prix de vente hors taxes et le coût d'achat hors
        taxes des marchandises vendues. C'est la définition de l'Insee, qui précise que le coût d'achat comprend les
        frais accessoires : droits de douane, transport, emballage, assurance. Pour un seul article, elle se lit
        simplement : acheté 40 € HT, vendu 65 € HT, il dégage 25 € de marge.
      </p>
      <p>Cette marge s'exprime ensuite en pourcentage de deux façons, qui ne donnent pas le même chiffre :</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>taux de marge</strong> = marge ÷ prix d'achat HT × 100. Dans l'exemple : 25 ÷ 40 = 62,5 %. Il dit
          combien on ajoute au coût.
        </li>
        <li>
          <strong>taux de marque</strong> = marge ÷ prix de vente HT × 100. Dans l'exemple : 25 ÷ 65 = 38,46 %. Il dit
          quelle part du prix de vente revient au commerçant.
        </li>
        <li>
          <strong>coefficient multiplicateur</strong> = prix de vente HT ÷ prix d'achat HT. Dans l'exemple : 1,625. On
          multiplie le prix d'achat par ce nombre pour obtenir le prix de vente.
        </li>
      </ul>
      <p>
        Le taux de marque est toujours plus petit que le taux de marge (pour une marge positive), parce qu'on divise
        la même marge par un nombre plus grand. On passe de l'un à l'autre sans connaître les prix : taux de marque =
        taux de marge ÷ (1 + taux de marge), et taux de marge = taux de marque ÷ (1 − taux de marque), les taux
        étant écrits en décimal (0,625 et 0,3846). Les mots varient selon les métiers et les logiciels : avant de
        comparer deux chiffres, vérifiez toujours sur quelle base ils sont calculés.
      </p>
    </Section>

    <Section titre="Tableau d'équivalences">
      <p>Pour un article acheté 10 € HT, voici le prix de vente HT selon le taux de marge, avec le taux de marque et le coefficient correspondants.</p>
      <Tableau entetes={["Taux de marge", "Taux de marque", "Coefficient", "Prix de vente HT"]} lignes={EQUIVALENCES} minW="26rem" />
      <p>
        On y lit qu'un coefficient de 2 correspond à 100 % de marge et 50 % de marque, et qu'un taux de marque de
        60 % demande un coefficient de 2,5 (150 % de marge). Ce sont des ordres de grandeur arithmétiques, pas des
        normes : la marge suffisante dépend de vos charges, de votre secteur et de vos volumes.
      </p>
    </Section>

    <Section titre="Fixer un prix de vente pas à pas">
      <p>
        <strong>1. Calculez le prix d'achat complet</strong> : prix fournisseur HT, plus les frais de port, de douane
        et d'emballage ramenés à l'unité. Une remise fournisseur se déduit.
      </p>
      <p>
        <strong>2. Choisissez votre objectif</strong> en taux de marque ou en coefficient, à partir de ce que la
        marge doit payer (loyer, salaires, publicité, résultat). Le second bloc de l'outil donne le prix de vente HT
        correspondant.
      </p>
      <p>
        <strong>3. Passez au TTC</strong> en appliquant le taux de TVA du produit. Le prix TTC est souvent arrondi à
        un prix psychologique (29,90 € plutôt que 30,24 €) : saisissez alors le prix HT obtenu après arrondi dans le
        premier bloc pour vérifier le taux de marque réel. La page <Link to="/calcul-ht-ttc/">HT TTC</Link> fait la
        conversion inverse à partir d'un prix affiché.
      </p>
      <p>
        <strong>4. Vérifiez une promotion</strong> avant de la lancer : une remise de 20 % sur le prix de vente ne
        retire pas 20 points de marque. Avec un taux de marque de 38,46 %, une remise de 20 % ramène le prix de 65 €
        à 52 € HT et la marge de 25 € à 12 €, soit 23,08 % de marque. La page{" "}
        <Link to="/calculer-un-pourcentage/">pourcentage</Link> aide pour ces calculs de remise.
      </p>
    </Section>
  </PageOutil>
);

export default CalculMargeCommerciale;
