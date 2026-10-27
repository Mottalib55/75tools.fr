import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import { fmt, fmtEuro, htVersTtc, lireNombre, recapitulatifTva, ttcVersHt } from "@/lib/calculs-nombres";

const TAUX = [20, 10, 8.5, 5.5, 2.1];
const LU = "27 octobre 2026";

const FAQ: QuestionFaq[] = [
  {
    q: "Pour retrouver le HT, je peux retirer 20 % du prix TTC ?",
    r: "Non, c'est l'erreur la plus courante. Les 20 % portent sur le prix hors taxes, pas sur le TTC. Pour 120 € TTC, retirer 20 % donne 96 €, alors que le vrai prix HT est 120 ÷ 1,20 = 100 €. Il faut donc diviser par 1 + le taux : 1,20 pour 20 %, 1,10 pour 10 %, 1,055 pour 5,5 %, 1,021 pour 2,1 %. Le mode « TTC → HT » de l'outil applique cette division.",
  },
  {
    q: "Ma facture a plusieurs lignes, la TVA se calcule ligne par ligne ou sur le total ?",
    r: "Le tableau de l'outil additionne d'abord les montants HT par taux, puis calcule la TVA de chaque taux sur ce total, arrondie au centime. Calculer et arrondir la TVA ligne par ligne peut donner un ou deux centimes d'écart sur le total. Si votre logiciel de facturation procède autrement, l'écart vient de là et non d'une erreur. Pour établir la facture elle-même, utilisez le générateur de facture du site.",
  },
  {
    q: "Je vends en Guadeloupe, en Martinique ou à La Réunion, quel taux choisir ?",
    r: "Le taux normal y est de 8,5 % au lieu de 20 %, et de nombreux biens et services à taux réduit en métropole y passent à 2,1 %, d'après les fiches de Service Public Entreprendre. Choisissez le bouton 8,5 % ou 2,1 %, ou saisissez le taux dans le champ libre. La Corse a aussi des taux propres pour certaines activités, par exemple 2,1 % pour l'hébergement hôtelier. Vérifiez la fiche de votre secteur.",
  },
  {
    q: "Pourquoi le TTC recalculé à partir du HT diffère parfois d'un centime de mon prix ?",
    r: "Parce que le HT obtenu par division est arrondi au centime. Un prix de 9,99 € TTC à 20 % donne 8,325 € HT, affiché 8,33 € ; en repartant de 8,33 € HT, on retrouve 8,33 + 1,67 = 10,00 €. Quand le prix de référence est le TTC (commerce de détail), l'outil calcule la TVA comme la différence TTC − HT, pour que les deux montants retombent exactement sur votre prix affiché.",
  },
];

/** Choix du taux : boutons courants et champ libre. */
const ChoixTaux = ({ taux, setTaux, libre, setLibre }: { taux: number | "libre"; setTaux: (t: number | "libre") => void; libre: string; setLibre: (v: string) => void }) => (
  <div>
    <p className="text-sm text-neutral-300 mb-1">Taux de TVA</p>
    <Bascule
      libelle="Taux de TVA"
      options={[...TAUX.map((t) => ({ v: t as number | "libre", l: `${fmt(t)} %` })), { v: "libre", l: "Autre" }]}
      valeur={taux}
      onChange={setTaux}
    />
    {taux === "libre" && (
      <div className="mt-3 max-w-[12rem]">
        <ChampNombre label="Taux libre" value={libre} onChange={setLibre} suffixe="%" />
      </div>
    )}
  </div>
);

const lireTaux = (taux: number | "libre", libre: string, msg: string[]): number | null => {
  if (taux !== "libre") return taux;
  const n = lireNombre(libre);
  if (n === null) {
    msg.push("Saisissez un taux de TVA.");
    return null;
  }
  if (n < 0) {
    msg.push(`Taux négatif ramené à 0 %.`);
    return 0;
  }
  if (n > 100) {
    msg.push(`Un taux de ${fmt(n)} % n'existe pas : ramené à 100 %.`);
    return 100;
  }
  return n;
};

const Convertisseur = () => {
  const [sens, setSens] = useState<"ht" | "ttc">("ht");
  const [montant, setMontant] = useState("100");
  const [taux, setTaux] = useState<number | "libre">(20);
  const [libre, setLibre] = useState("");
  const msg: string[] = [];
  const t = lireTaux(taux, libre, msg);
  let m = lireNombre(montant);
  if (montant.trim() !== "" && m === null) msg.push("Le montant n'est pas un nombre.");
  if (montant.trim() === "") msg.push("Saisissez un montant.");
  if (m !== null && m < 0) {
    msg.push("Montant négatif ramené à sa valeur positive.");
    m = -m;
  }
  if (m !== null && m > 1e12) {
    msg.push("Montant ramené à 1 000 milliards d'euros.");
    m = 1e12;
  }
  const r = m !== null && t !== null ? (sens === "ht" ? htVersTtc(m, t) : ttcVersHt(m, t)) : null;
  return (
    <BlocCalcul titre="Convertir HT et TTC" id="convertir">
      <div className="space-y-4">
        <Bascule
          libelle="Sens du calcul"
          options={[{ v: "ht" as const, l: "HT → TTC" }, { v: "ttc" as const, l: "TTC → HT" }]}
          valeur={sens}
          onChange={setSens}
        />
        <div className="max-w-sm">
          <ChampNombre label={sens === "ht" ? "Montant hors taxes (HT)" : "Montant toutes taxes comprises (TTC)"} value={montant} onChange={setMontant} suffixe="€" id="montant" />
        </div>
        <ChoixTaux taux={taux} setTaux={setTaux} libre={libre} setLibre={setLibre} />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Resultat libelle="HT" valeur={r ? fmtEuro(r.ht) : "–"} id="res-ht" />
        <Resultat libelle="TVA" valeur={r ? fmtEuro(r.tva) : "–"} id="res-tva" />
        <Resultat libelle="TTC" valeur={r ? fmtEuro(r.ttc) : "–"} id="res-ttc" />
      </div>
      {r && t !== null && (
        <Formule>
          {sens === "ht" ? (
            <>
              TVA = {fmt(r.ht)} × {fmt(t, 4)} ÷ 100 = {fmt((r.ht * t) / 100, 4)}, arrondi à {fmtEuro(r.tva)} ; TTC = {fmt(r.ht)} + {fmt(r.tva)} ={" "}
              {fmtEuro(r.ttc)}
            </>
          ) : (
            <>
              HT = {fmt(r.ttc)} ÷ (1 + {fmt(t, 4)} ÷ 100) = {fmt(r.ttc)} ÷ {fmt(1 + t / 100, 5)} = {fmt(r.ttc / (1 + t / 100), 4)}, arrondi à {fmtEuro(r.ht)} ;
              TVA = {fmt(r.ttc)} − {fmt(r.ht)} = {fmtEuro(r.tva)}
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
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: 1, libelle: "Séance de conseil", quantite: "2", prix: "150", taux: "20" },
    { id: 2, libelle: "Places de concert", quantite: "3", prix: "18,96", taux: "5.5" },
  ]);
  const [suivant, setSuivant] = useState(3);
  const maj = (id: number, k: keyof Ligne, v: string) => setLignes((ls) => ls.map((l) => (l.id === id ? { ...l, [k]: v } : l)));
  const msg: string[] = [];
  const valides = lignes.map((l, i) => {
    let q = lireNombre(l.quantite);
    let p = lireNombre(l.prix);
    if ((l.quantite.trim() && q === null) || (l.prix.trim() && p === null)) msg.push(`Ligne ${i + 1} : quantité ou prix illisible, compté comme 0.`);
    if (q !== null && q < 0) {
      msg.push(`Ligne ${i + 1} : quantité négative ramenée à 0.`);
      q = 0;
    }
    if (p !== null && p < 0) {
      msg.push(`Ligne ${i + 1} : prix négatif ramené à 0.`);
      p = 0;
    }
    return { quantite: q ?? 0, prixHt: p ?? 0, taux: Number(l.taux) };
  });
  const r = recapitulatifTva(valides);
  return (
    <BlocCalcul titre="Plusieurs lignes (facultatif)" id="lignes">
      <p className="text-sm text-neutral-400 mb-3">Prix unitaires hors taxes. La TVA est calculée par taux sur le total HT de ce taux.</p>
      <div className="space-y-3">
        {lignes.map((l, i) => (
          <div key={l.id} className="grid gap-2 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[minmax(0,2fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] items-end border-b border-neutral-800 pb-3 sm:border-0 sm:pb-0">
            <label className="block min-w-0 col-span-2 sm:col-span-1">
              <span className="block text-xs text-neutral-400 mb-1">Désignation {i + 1}</span>
              <input value={l.libelle} onChange={(e) => maj(l.id, "libelle", e.target.value)} className={classeChamp} />
            </label>
            <ChampNombre label={<span className="text-xs text-neutral-400">Quantité</span>} value={l.quantite} onChange={(v) => maj(l.id, "quantite", v)} />
            <ChampNombre label={<span className="text-xs text-neutral-400">Prix unitaire HT</span>} value={l.prix} onChange={(v) => maj(l.id, "prix", v)} suffixe="€" />
            <label className="block min-w-0">
              <span className="block text-xs text-neutral-400 mb-1">Taux</span>
              <select value={l.taux} onChange={(e) => maj(l.id, "taux", e.target.value)} className={classeSelect}>
                {TAUX.map((t) => (
                  <option key={t} value={String(t)}>
                    {fmt(t)} %
                  </option>
                ))}
                <option value="0">0 %</option>
              </select>
            </label>
            <div className="flex items-end justify-between gap-2 sm:justify-end">
              <span className="sm:hidden text-sm text-neutral-300 tabular-nums">{fmtEuro(r.montants[i])} HT</span>
              <button
                type="button"
                aria-label={`Supprimer la ligne ${i + 1}`}
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
            <Plus className="w-4 h-4" aria-hidden="true" /> Ajouter une ligne
          </span>
        </Bouton>
      </div>
      <div className="mt-5">
        <Tableau
          entetes={["Taux", "Base HT", "TVA"]}
          minW="18rem"
          lignes={[
            ...r.detail.map((d) => [`${fmt(d.taux)} %`, fmtEuro(d.base), fmtEuro(d.tva)]),
            [<strong key="t">Total</strong>, <strong key="h">{fmtEuro(r.totalHt)}</strong>, <strong key="v">{fmtEuro(r.totalTva)}</strong>],
          ]}
        />
        <p className="mt-3 text-lg text-white tabular-nums" id="res-total-ttc">
          Total TTC : <strong>{fmtEuro(r.totalTtc)}</strong>
        </p>
      </div>
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const CalculHtTtc = () => (
  <PageOutil
    href="/calcul-ht-ttc/"
    titre="HT TTC : calcul de la TVA en ligne, gratuit et immédiat"
    description="Calcul HT TTC en ligne : passez du HT au TTC ou du TTC au HT à 20 %, 10 %, 5,5 % ou 2,1 %, montant de TVA arrondi au centime et total sur plusieurs lignes."
    motsCles="calcul ht ttc, convertir ttc en ht, calcul tva en ligne, prix hors taxes, montant tva"
    nomAppli="Calcul HT TTC et TVA"
    categorieAppli="FinanceApplication"
    h1="Calcul HT TTC et montant de TVA"
    chapeau="Saisissez un prix hors taxes ou toutes taxes comprises, choisissez le taux : le HT, la TVA et le TTC s'affichent au centime près, avec le calcul détaillé. Un tableau facultatif totalise plusieurs lignes à des taux différents."
    faq={FAQ}
    sources={[
      { editeur: "Service Public Entreprendre", titre: "Comment calculer un prix hors taxes à partir d'un prix toutes taxes comprises ?", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F24271", lu: LU },
      { editeur: "Service Public Entreprendre", titre: "Taux de TVA dans le secteur de l'hygiène et de la santé", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23567", lu: LU },
      { editeur: "Service Public Entreprendre", titre: "Taux de TVA pour les travaux de rénovation d'un logement", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23568", lu: LU },
      { editeur: "Service Public Entreprendre", titre: "Taux de TVA dans le secteur de l'hébergement et de l'hôtellerie", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37288", lu: LU },
      { editeur: "Service Public Entreprendre", titre: "Taux de TVA dans le secteur des loisirs (culture, sport, etc.)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37605", lu: LU },
    ]}
  >
    <div className="grid gap-4 lg:grid-cols-2 items-start">
      <Convertisseur />
      <TableauLignes />
    </div>

    <Section titre="Les formules HT, TVA et TTC">
      <p>
        Le prix hors taxes (HT) est le prix sans la taxe sur la valeur ajoutée ; le prix toutes taxes comprises (TTC)
        est celui que paie le client final. La TVA se calcule toujours <strong>sur le HT</strong> :
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>TVA = HT × taux ÷ 100</li>
        <li>TTC = HT × (1 + taux ÷ 100), par exemple HT × 1,20 à 20 %</li>
        <li>HT = TTC ÷ (1 + taux ÷ 100), par exemple TTC ÷ 1,20 à 20 %</li>
      </ul>
      <p>
        La fiche de Service Public Entreprendre sur le passage du TTC au HT donne l'exemple d'un prix de 50 € TTC :
        41,67 € HT à 20 %, 45,45 € à 10 %, 46,08 € à 8,5 %, 47,39 € à 5,5 % et 48,97 € à 2,1 %. Elle précise que le
        résultat s'exprime avec deux chiffres après la virgule : 41,669 € s'arrondit à 41,67 €. L'outil retrouve ces
        valeurs.
      </p>
      <h3>Comment l'outil arrondit</h3>
      <p>
        Chaque montant affiché est arrondi au centime, la moitié vers le haut (0,005 devient 0,01). Dans le sens HT
        vers TTC, la TVA est arrondie puis ajoutée au HT. Dans le sens TTC vers HT, le HT est arrondi et la TVA est la
        différence entre le TTC et le HT, pour que HT + TVA retombe exactement sur le prix saisi. La formule affichée
        sous le résultat montre la valeur avant arrondi.
      </p>
    </Section>

    <Section titre="Quel taux pour quel produit : exemples">
      <p>
        Les exemples ci-dessous viennent des fiches sectorielles de Service Public Entreprendre lues le {LU}. Ils
        concernent la France métropolitaine ; chaque taux réduit a ses conditions, à vérifier dans la fiche de votre
        secteur avant de facturer.
      </p>
      <Tableau
        entetes={["Taux", "Exemples (métropole)"]}
        minW="30rem"
        lignes={[
          ["20 %", "Cosmétiques et produits d'hygiène (savon, shampoing), jeux de société, accès aux installations sportives, chaudières à énergie fossile. C'est le taux normal, qui s'applique aux prestations non listées ailleurs."],
          ["10 %", "Hébergement hôtelier et campings classés, travaux d'amélioration ou d'entretien d'un logement achevé depuis plus de 2 ans, médicaments non remboursés, expositions culturelles."],
          ["5,5 %", "Travaux de rénovation énergétique d'un logement, protections hygiéniques féminines et préservatifs, spectacles vivants, parcs zoologiques, rencontres sportives, logement et nourriture en maison de retraite."],
          ["2,1 %", "Médicaments remboursés par la Sécurité sociale, préparations magistrales, certains produits sanguins."],
        ]}
      />
      <h3>Outre-mer et Corse</h3>
      <p>
        En Guadeloupe, en Martinique et à La Réunion, le taux normal est de <strong>8,5 %</strong>, et de nombreux
        biens et services taxés à 5,5 % ou 10 % en métropole y sont à <strong>2,1 %</strong> : hébergement hôtelier,
        travaux de rénovation, protections hygiéniques. La Corse garde le taux normal de 20 % mais applique des taux
        particuliers à certaines activités, par exemple 2,1 % pour l'hébergement hôtelier et les campings classés.
        L'outil propose le bouton 8,5 % et un champ libre pour tout autre taux. Les règles de la Guyane et de
        Mayotte ne sont pas couvertes par cette page.
      </p>
    </Section>

    <Section titre="Cas pratiques">
      <p>
        <strong>Vous êtes artisan</strong> et rédigez un devis de rénovation pour un logement de plus de 2 ans : saisissez
        chaque poste dans le tableau, en séparant les travaux d'isolation (5,5 %) des autres travaux (10 %). Le
        récapitulatif donne la base et la TVA de chaque taux, comme sur la facture. Pour mettre le devis en forme,
        passez ensuite au <Link to="/generateur-devis/">générateur de devis</Link>.
      </p>
      <p>
        <strong>Vous êtes commerçant</strong> et fixez vos prix en TTC : le mode TTC vers HT vous donne le chiffre
        d'affaires hors taxes et la TVA collectée sur chaque vente. Pour aller du prix d'achat au prix de vente,
        la page <Link to="/calcul-marge-commerciale/">marge commerciale</Link> calcule le taux de marge, le taux de
        marque et le prix TTC conseillé.
      </p>
      <p>
        <strong>Vous êtes particulier</strong> et comparez un devis HT et un prix TTC : convertissez l'un dans l'autre
        avant de comparer. Un devis de 1 000 € HT pour des travaux d'amélioration à 10 % revient à 1 100 € TTC, le
        même devis à 20 % à 1 200 € TTC.
      </p>
    </Section>
  </PageOutil>
);

export default CalculHtTtc;
