import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alertes, Bascule, BlocCalcul, ChampNombre, Formule, Resultat, Tableau } from "@/components/outils/CalculsUi";
import {
  appliquerTaux,
  evolution,
  evolutionsSuccessives,
  fmt,
  lireNombre,
  partEnPourcentage,
  pourcentageDe,
  valeurDeDepart,
} from "@/lib/calculs-nombres";
import { useLangue, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Un article baisse de 20 % puis remonte de 20 %, je retrouve le prix de départ ?",
      r: "Non, vous perdez 4 %. La baisse s'applique au prix de départ, la hausse au prix déjà baissé, plus petit : 100 € deviennent 80 €, puis 80 € plus 20 % donnent 96 €. Les pourcentages successifs se multiplient, ils ne s'additionnent pas : 0,8 × 1,2 = 0,96. Pour revenir à 100 € après une baisse de 20 %, il faut une hausse de 25 %.",
    },
    {
      q: "Je connais le prix soldé et le pourcentage de remise, comment retrouver le prix d'origine ?",
      r: "Divisez le prix soldé par le coefficient de la remise, ne rajoutez pas le pourcentage. Pour un article à 42 € après 30 % de remise : 42 ÷ (1 − 0,30) = 42 ÷ 0,70 = 60 €. Ajouter 30 % à 42 € donnerait 54,60 €, ce qui est faux, car les 30 % portaient sur 60 € et non sur 42 €. C'est le calcul « Valeur de départ avant une hausse ou une remise ».",
    },
    {
      q: "Le taux passe de 3 % à 4 %, c'est une hausse de 1 % ou de 33 % ?",
      r: "Le taux gagne 1 point de pourcentage (4 − 3), ce qui représente une hausse relative de 33,33 % (1 ÷ 3 × 100). Dire « le taux augmente de 1 % » laisserait croire qu'il passe à 3,03 %. Pour un taux d'intérêt, de chômage ou de TVA, parlez de points pour l'écart et de pourcentage pour la variation relative : le bloc « Points de pourcentage » donne les deux.",
    },
    {
      q: "Comment convertir ma note sur 20 en pourcentage, ou un pourcentage en note sur 20 ?",
      r: "Divisez la note par 20 puis multipliez par 100 : 14 sur 20 donne 14 ÷ 20 × 100 = 70 %. Dans l'autre sens, multipliez le pourcentage par 20 puis divisez par 100 : 85 % correspondent à 17 sur 20. Le même principe vaut pour une note sur 10 ou sur 40 : remplacez 20 par le barème. Le calcul « X représente quel pourcentage de Y » le fait avec la note en X.",
    },
    {
      q: "Puis-je saisir des nombres à virgule ou avec des espaces entre les milliers ?",
      r: "Oui. Les champs acceptent la virgule comme le point pour les décimales, et ignorent les espaces, le signe % et le signe € : « 1 250,50 » est lu comme 1 250,5. Le résultat est arrondi à quatre décimales au plus à l'affichage, mais le calcul garde toute la précision. Un nombre négatif se saisit avec le signe moins, utile pour une évolution de perte à perte.",
    },
    {
      q: "Comment trouver 15 % d'un montant de tête, sans calculatrice ?",
      r: "Passez par 10 %, qui s'obtient en décalant la virgule d'un rang : 10 % de 64 € font 6,40 €. La moitié donne 5 % (3,20 €), et la somme des deux 15 % (9,60 €). De la même façon, 20 % valent deux fois 10 %, 25 % un quart et 1 % un centième. Saisissez ensuite les deux nombres dans le premier bloc pour vérifier votre calcul mental.",
    },
  ],
  en: [
    {
      q: "A price drops 20% and then rises 20%, am I back where I started?",
      r: "No, you are 4% down. The drop applies to the starting price and the rise to the lower price: €100 becomes €80, then €80 plus 20% is €96. Successive percentages multiply rather than add up: 0.8 × 1.2 = 0.96. To get back to €100 after a 20% cut you need a 25% rise. The successive changes block shows this when you enter 20 and −20.",
    },
    {
      q: "A shop in France shows the sale price and the discount, how do I find the original price?",
      r: "Divide the sale price by what is left after the discount. An item at €42 after 30% off cost 42 ÷ 0.70 = €60 before the soldes. Adding 30% to €42 gives €54.60, which is wrong because the 30% was taken off €60. Since 2022, French shops must base the discount on the lowest price charged in the 30 days before the reduction.",
    },
    {
      q: "My French mortgage rate went from 3% to 4%, is that a 1% or a 33% rise?",
      r: "Both figures describe it, but they answer different questions. The rate gained 1 percentage point (4 − 3), which is a relative rise of 33.33% (1 ÷ 3 × 100). Saying the rate rose by 1% would suggest it moved to 3.03%. Banks and the press in France say « 1 point » for the gap; the points block on this page gives both numbers.",
    },
    {
      q: "How do I turn a French mark out of 20 into a percentage?",
      r: "Divide the mark by 20 and multiply by 100: 14 out of 20 is 14 ÷ 20 × 100 = 70%. The other way round, multiply the percentage by 20 and divide by 100: 85% is 17 out of 20. French schools and universities grade out of 20, and 10 out of 20 is the usual pass mark, so a 12 is a solid result rather than a weak one.",
    },
    {
      q: "Can I type numbers with a decimal point or a comma?",
      r: "Yes. The English page reads 1,250.50 as one thousand two hundred and fifty point five, and also accepts a decimal comma such as 2,5 the way French documents write it. Spaces, the % sign and the € sign are ignored. Results show up to four decimals with a decimal point, while the calculation keeps full precision behind the scenes.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service-public.fr", titre: "Soldes : règles à respecter", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F24037", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Affichage des prix : règles à respecter", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F34344", lu: "27 octobre 2026" },
    { editeur: "DGCCRF, economie.gouv.fr", titre: "Soldes 2022 : les nouvelles règles d'affichage des démarques et réductions de prix", url: "https://www.economie.gouv.fr/dgccrf/actualites-dgccrf/soldes-2022-les-nouvelles-regles-daffichage-des-demarques-et-reductions-de-prix", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service-public.fr", titre: "Soldes : règles à respecter (sales: the rules)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F24037", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Affichage des prix : règles à respecter (price display rules)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F34344", lu: "27 October 2026" },
    { editeur: "DGCCRF, economie.gouv.fr", titre: "Soldes 2022 : les nouvelles règles d'affichage des démarques et réductions de prix (new rules for showing reductions)", url: "https://www.economie.gouv.fr/dgccrf/actualites-dgccrf/soldes-2022-les-nouvelles-regles-daffichage-des-demarques-et-reductions-de-prix", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Calculateur de pourcentage 75tools",
    sep: " ; ",
    motsCles: "calculer un pourcentage, calculateur de pourcentage, comment calculer un pourcentage d'un nombre, calcul pourcentage, évolution en pourcentage",
    manque: "Saisissez les deux nombres pour voir le résultat.",
    resultat: "Résultat",
    pct: (s: string) => `${s} %`,
    t1: "Combien font X % de Y ?",
    x1: "Pourcentage X",
    y1: "Nombre Y",
    l1: (x: string, y: string) => `${x} % de ${y}`,
    t2: "X représente quel pourcentage de Y ?",
    x2: "Partie X",
    y2: "Total Y",
    l2: (x: string, y: string) => `${x} sur ${y}`,
    zero2: "Y vaut 0 : on ne peut pas exprimer une part de zéro. Saisissez un total différent de 0.",
    t3: "Évolution en % de A à B",
    a3: "Valeur de départ A",
    b3: "Valeur d'arrivée B",
    evol: "Évolution",
    hausse: "Hausse",
    baisse: "Baisse",
    zero3: "La valeur de départ vaut 0 : une évolution en pourcentage depuis zéro n'a pas de sens.",
    neg3: "Valeur de départ négative : l'évolution est rapportée à sa valeur absolue.",
    coef: "soit un coefficient multiplicateur de",
    t4: "Augmenter ou diminuer un nombre de X %",
    sens: "Sens",
    augmenter: "Augmenter",
    diminuer: "Diminuer",
    depart: "Nombre de départ",
    pourcentage: "Pourcentage",
    apresHausse: "Après la hausse",
    apresBaisse: "Après la baisse",
    ecart: "soit un écart de",
    negatif: "Pourcentage négatif ramené à sa valeur positive : choisissez le sens avec les boutons.",
    baisseMax: (x: string) => `Une baisse ne peut pas dépasser 100 % : ${x} % ramené à 100 %.`,
    t5: "Valeur de départ avant une hausse ou une remise",
    passe: "Ce qui s'est passé",
    apresRemise: "Après remise",
    apresHausseB: "Après hausse",
    finale: "Valeur finale",
    remise: "Remise",
    hausseL: "Hausse",
    valDepart: "Valeur de départ",
    remiseMax: (x: string) => `Après une remise de ${x} %, il ne reste rien : on ne peut pas remonter au prix de départ. Valeur ramenée à 99 %.`,
    t6: "Points de pourcentage ou pourcentage ?",
    tauxA: "Taux de départ",
    tauxB: "Taux d'arrivée",
    ecartPts: "Écart",
    varRel: "Variation relative",
    pt: "pt",
    points: (n: number) => (Math.abs(n) >= 2 ? "points" : "point"),
    zero6: "Le taux de départ vaut 0 % : l'écart en points existe, la variation relative non.",
    t7: "Hausses ou baisses successives",
    aide7: "Une hausse en positif (10), une baisse en négatif (−10). Les cases vides sont ignorées.",
    etape: (i: number) => `Étape ${i}`,
    illisible: "Un des taux n'est pas un nombre : il est ignoré.",
    impossible: (x: string) => `Une baisse de ${x} % est impossible : ramenée à −100 %.`,
    unTaux: "Saisissez au moins un taux, positif pour une hausse, négatif pour une baisse.",
    globale: "Évolution globale",
    moyen: "Taux moyen par étape",
    soit: "soit",
    moyenF: "taux moyen :",
  },
  en: {
    nomAppli: "75tools percentage calculator",
    sep: "; ",
    motsCles: "percentage calculator, percent of a number, percentage change calculator, percent increase, percent decrease, discount calculator",
    manque: "Enter both numbers to see the result.",
    resultat: "Result",
    pct: (s: string) => `${s}%`,
    t1: "What is X% of Y?",
    x1: "Percentage X",
    y1: "Number Y",
    l1: (x: string, y: string) => `${x}% of ${y}`,
    t2: "X is what percent of Y?",
    x2: "Part X",
    y2: "Total Y",
    l2: (x: string, y: string) => `${x} out of ${y}`,
    zero2: "Y is 0: a share of zero cannot be expressed. Enter a total other than 0.",
    t3: "Percentage change from A to B",
    a3: "Starting value A",
    b3: "Final value B",
    evol: "Change",
    hausse: "Increase",
    baisse: "Decrease",
    zero3: "The starting value is 0: a percentage change from zero has no meaning.",
    neg3: "Negative starting value: the change is measured against its absolute value.",
    coef: "a multiplier of",
    t4: "Increase or decrease a number by X%",
    sens: "Direction",
    augmenter: "Increase",
    diminuer: "Decrease",
    depart: "Starting number",
    pourcentage: "Percentage",
    apresHausse: "After the increase",
    apresBaisse: "After the decrease",
    ecart: "a difference of",
    negatif: "Negative percentage turned positive: choose the direction with the buttons.",
    baisseMax: (x: string) => `A decrease cannot exceed 100%: ${x}% brought down to 100%.`,
    t5: "Original value before an increase or a discount",
    passe: "What happened",
    apresRemise: "After a discount",
    apresHausseB: "After an increase",
    finale: "Final value",
    remise: "Discount",
    hausseL: "Increase",
    valDepart: "Original value",
    remiseMax: (x: string) => `After a ${x}% discount nothing is left, so the original price cannot be found. Value brought down to 99%.`,
    t6: "Percentage points or percent?",
    tauxA: "Starting rate",
    tauxB: "New rate",
    ecartPts: "Gap",
    varRel: "Relative change",
    pt: "pts",
    points: (n: number) => (Math.abs(n) === 1 ? "point" : "points"),
    zero6: "The starting rate is 0%: the gap in points exists, the relative change does not.",
    t7: "Successive increases or decreases",
    aide7: "An increase as a positive number (10), a decrease as a negative one (−10). Empty boxes are ignored.",
    etape: (i: number) => `Step ${i}`,
    illisible: "One of the rates is not a number: it is ignored.",
    impossible: (x: string) => `A ${x}% change is impossible: brought back to −100%.`,
    unTaux: "Enter at least one rate, positive for an increase, negative for a decrease.",
    globale: "Overall change",
    moyen: "Average rate per step",
    soit: "that is",
    moyenF: "average rate:",
  },
};

/** Langue, textes et formateurs du contexte. */
const useOutils = () => {
  const lang = useLangue();
  const f = (n: number, d = 2) => fmt(n, d, lang);
  const signe = (n: number, d = 2) => (n > 0 ? "+" : "") + f(n, d);
  const lire = (s: string) => lireNombre(s, lang);
  return { lang, t: T[lang], f, signe, lire };
};

/** X % de Y */
const BlocPourcentageDe = () => {
  const { t, f, lire } = useOutils();
  const [x, setX] = useState("20");
  const [y, setY] = useState("150");
  const nx = lire(x), ny = lire(y);
  const ok = nx !== null && ny !== null;
  const r = ok ? pourcentageDe(nx, ny) : 0;
  return (
    <BlocCalcul titre={t.t1} id="pourcentage-de">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label={t.x1} value={x} onChange={setX} suffixe="%" id="x-pourcentage" />
        <ChampNombre label={t.y1} value={y} onChange={setY} id="y-nombre" />
      </div>
      <div className="mt-4" data-resultat>
        <Resultat libelle={ok ? t.l1(f(nx), f(ny)) : t.resultat} valeur={ok ? f(r, 4) : "–"} id="res-pourcentage-de" />
      </div>
      {ok && (
        <Formule>
          {f(nx, 4)} ÷ 100 × {f(ny, 4)} = {f(r, 4)}
        </Formule>
      )}
      <Alertes messages={ok ? [] : [t.manque]} />
    </BlocCalcul>
  );
};

/** X est quel % de Y */
const BlocPart = () => {
  const { t, f, lire } = useOutils();
  const [x, setX] = useState("15");
  const [y, setY] = useState("20");
  const nx = lire(x), ny = lire(y);
  const ok = nx !== null && ny !== null;
  const r = ok ? partEnPourcentage(nx, ny) : null;
  const msg = !ok ? [t.manque] : r === null ? [t.zero2] : [];
  return (
    <BlocCalcul titre={t.t2} id="part">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label={t.x2} value={x} onChange={setX} />
        <ChampNombre label={t.y2} value={y} onChange={setY} />
      </div>
      <div className="mt-4">
        <Resultat libelle={ok ? t.l2(f(nx), f(ny)) : t.resultat} valeur={r !== null ? t.pct(f(r)) : "–"} id="res-part" />
      </div>
      {r !== null && (
        <Formule>
          {f(nx, 4)} ÷ {f(ny, 4)} × 100 = {t.pct(f(r, 4))}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Évolution de A à B */
const BlocEvolution = () => {
  const { t, f, signe, lire } = useOutils();
  const [a, setA] = useState("2000");
  const [b, setB] = useState("2100");
  const na = lire(a), nb = lire(b);
  const ok = na !== null && nb !== null;
  const r = ok ? evolution(na, nb) : null;
  const msg = !ok ? [t.manque] : r === null ? [t.zero3] : [];
  if (ok && na < 0 && r !== null) msg.push(t.neg3);
  return (
    <BlocCalcul titre={t.t3} id="evolution">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label={t.a3} value={a} onChange={setA} />
        <ChampNombre label={t.b3} value={b} onChange={setB} />
      </div>
      <div className="mt-4">
        <Resultat libelle={r === null ? t.evol : r >= 0 ? t.hausse : t.baisse} valeur={r !== null ? t.pct(signe(r)) : "–"} id="res-evolution" />
      </div>
      {r !== null && (
        <Formule>
          ({f(nb, 4)} − {f(na, 4)}) ÷ {f(Math.abs(na), 4)} × 100 = {t.pct(signe(r, 4))}, {t.coef} {f(nb / na, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Augmenter ou diminuer Y de X % */
const BlocAppliquer = () => {
  const { t, f, signe, lire } = useOutils();
  const [y, setY] = useState("2000");
  const [x, setX] = useState("3");
  const [sens, setSens] = useState<1 | -1>(1);
  const ny = lire(y), nxBrut = lire(x);
  const msg: string[] = [];
  let nx = nxBrut;
  if (nx !== null && nx < 0) {
    msg.push(t.negatif);
    nx = -nx;
  }
  if (nx !== null && sens === -1 && nx > 100) {
    msg.push(t.baisseMax(f(nx)));
    nx = 100;
  }
  const ok = ny !== null && nx !== null;
  if (!ok) msg.push(t.manque);
  const r = ok ? appliquerTaux(ny, nx, sens) : 0;
  return (
    <BlocCalcul titre={t.t4} id="appliquer">
      <Bascule libelle={t.sens} options={[{ v: 1 as const, l: t.augmenter }, { v: -1 as const, l: t.diminuer }]} valeur={sens} onChange={setSens} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label={t.depart} value={y} onChange={setY} />
        <ChampNombre label={t.pourcentage} value={x} onChange={setX} suffixe="%" />
      </div>
      <div className="mt-4">
        <Resultat libelle={sens === 1 ? t.apresHausse : t.apresBaisse} valeur={ok ? f(r, 4) : "–"} id="res-appliquer" />
      </div>
      {ok && (
        <Formule>
          {f(ny, 4)} × (1 {sens === 1 ? "+" : "−"} {f(nx, 4)} ÷ 100) = {f(ny, 4)} × {f(1 + (sens * nx) / 100, 6)} = {f(r, 4)}, {t.ecart}{" "}
          {signe(r - ny, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Valeur de départ avant hausse ou remise */
const BlocDepart = () => {
  const { t, f, lire } = useOutils();
  const [fin, setFin] = useState("42");
  const [x, setX] = useState("30");
  const [sens, setSens] = useState<1 | -1>(-1);
  const nf = lire(fin), nxBrut = lire(x);
  const msg: string[] = [];
  let nx = nxBrut;
  if (nx !== null && nx < 0) {
    msg.push(t.negatif);
    nx = -nx;
  }
  if (nx !== null && sens === -1 && nx >= 100) {
    msg.push(t.remiseMax(f(nx)));
    nx = 99;
  }
  const ok = nf !== null && nx !== null;
  if (!ok) msg.push(t.manque);
  const r = ok ? valeurDeDepart(nf, nx, sens) : null;
  const coef = ok ? 1 + (sens * nx) / 100 : 1;
  return (
    <BlocCalcul titre={t.t5} id="depart">
      <Bascule libelle={t.passe} options={[{ v: -1 as const, l: t.apresRemise }, { v: 1 as const, l: t.apresHausseB }]} valeur={sens} onChange={setSens} />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label={t.finale} value={fin} onChange={setFin} />
        <ChampNombre label={sens === -1 ? t.remise : t.hausseL} value={x} onChange={setX} suffixe="%" />
      </div>
      <div className="mt-4">
        <Resultat libelle={t.valDepart} valeur={r !== null ? f(r, 4) : "–"} id="res-depart" />
      </div>
      {r !== null && nf !== null && nx !== null && (
        <Formule>
          {f(nf, 4)} ÷ (1 {sens === 1 ? "+" : "−"} {f(nx, 4)} ÷ 100) = {f(nf, 4)} ÷ {f(coef, 6)} = {f(r, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Points de pourcentage */
const BlocPoints = () => {
  const { t, f, signe, lire } = useOutils();
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const na = lire(a), nb = lire(b);
  const ok = na !== null && nb !== null;
  const rel = ok ? evolution(na, nb) : null;
  const msg = !ok ? [t.manque] : rel === null ? [t.zero6] : [];
  return (
    <BlocCalcul titre={t.t6} id="points">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label={t.tauxA} value={a} onChange={setA} suffixe="%" />
        <ChampNombre label={t.tauxB} value={b} onChange={setB} suffixe="%" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Resultat libelle={t.ecartPts} valeur={ok ? `${signe(nb - na)} ${t.pt}` : "–"} id="res-points" />
        <Resultat libelle={t.varRel} valeur={rel !== null ? t.pct(signe(rel)) : "–"} />
      </div>
      {ok && (
        <Formule>
          {f(nb, 4)} − {f(na, 4)} = {signe(nb - na, 4)} {t.points(nb - na)}
          {rel !== null && (
            <>
              {t.sep}({f(nb, 4)} − {f(na, 4)}) ÷ {f(Math.abs(na), 4)} × 100 = {t.pct(signe(rel, 4))}
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Hausses successives */
const BlocSuccessives = () => {
  const { t, f, signe, lire } = useOutils();
  const [taux, setTaux] = useState(["10", "-10", "", ""]);
  const msg: string[] = [];
  const lus = taux.map((v) => (v.trim() === "" ? null : lire(v)));
  if (taux.some((v, i) => v.trim() !== "" && lus[i] === null)) msg.push(t.illisible);
  const valeurs = lus
    .filter((v): v is number => v !== null)
    .map((v) => {
      if (v < -100) {
        msg.push(t.impossible(f(v)));
        return -100;
      }
      return v;
    });
  const r = valeurs.length ? evolutionsSuccessives(valeurs) : null;
  if (!valeurs.length) msg.push(t.unTaux);
  return (
    <BlocCalcul titre={t.t7} id="successives" className="md:col-span-2">
      <p className="text-sm text-neutral-400 mb-3">{t.aide7}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {taux.map((v, i) => (
          <ChampNombre key={i} label={t.etape(i + 1)} value={v} onChange={(nv) => setTaux((ts) => ts.map((x, j) => (j === i ? nv : x)))} suffixe="%" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Resultat libelle={t.globale} valeur={r ? t.pct(signe(r.global)) : "–"} id="res-successives" />
        <Resultat libelle={t.moyen} valeur={r && r.moyen !== null ? t.pct(signe(r.moyen)) : "–"} />
      </div>
      {r && (
        <Formule>
          {valeurs.map((x) => `(1 ${x < 0 ? "−" : "+"} ${f(Math.abs(x), 4)} ÷ 100)`).join(" × ")} = {f(r.coef, 6)}, {t.soit} {t.pct(signe(r.global, 4))}
          {r.moyen !== null && valeurs.length > 1 && (
            <>
              {t.sep}{t.moyenF} {f(r.coef, 6)}^(1/{valeurs.length}) − 1 = {t.pct(signe(r.moyen, 4))}
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const CalculerUnPourcentage = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const outil = (
    <div className="grid gap-4 md:grid-cols-2 items-start">
      <BlocPourcentageDe />
      <BlocPart />
      <BlocEvolution />
      <BlocAppliquer />
      <BlocDepart />
      <BlocPoints />
      <BlocSuccessives />
    </div>
  );
  return (
    <PageOutil id="calculer-un-pourcentage" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Calculer un pourcentage d'un nombre : la méthode">
      <p>
        Pour calculer un pourcentage d'un nombre, divisez le pourcentage par 100 puis multipliez par le nombre : 20 %
        de 150 font 20 ÷ 100 × 150 = 30. Avec l'outil, saisissez 20 dans « Pourcentage X » et 150 dans « Nombre Y » du
        premier bloc ; le résultat s'affiche pendant la frappe, avec la formule posée sur vos propres nombres. Les six
        autres blocs couvrent les questions voisines : quelle part représente un nombre (15 sur 20 font 75 %),
        l'évolution entre deux valeurs (de 2 000 à 2 100, +5 %), une hausse ou une remise appliquée, le prix d'origine
        avant des soldes, l'écart en points entre deux taux et l'effet de plusieurs hausses successives. La limite à
        garder en tête : un pourcentage n'a de sens que rapporté à sa base, et deux pourcentages calculés sur des bases
        différentes ne s'additionnent pas.
      </p>
    </Section>

    <Section titre="Les formules d'un coup d'œil">
      <p>
        Un pourcentage est une fraction dont le dénominateur vaut 100 : 20 % signifie 20 pour 100, soit 0,20. Presque
        tous les calculs se ramènent à une multiplication ou à une division par un <strong>coefficient</strong>. Une
        hausse de 3 % multiplie par 1,03 ; une remise de 30 % multiplie par 0,70. Retenir ce coefficient évite la
        plupart des erreurs.
      </p>
      <Tableau
        entetes={["Question", "Formule", "Exemple"]}
        minW="34rem"
        lignes={[
          ["X % de Y", "X ÷ 100 × Y", "20 % de 150 = 30"],
          ["X est quel % de Y", "X ÷ Y × 100", "15 sur 20 = 75 %"],
          ["Évolution de A à B", "(B − A) ÷ A × 100", "2 000 → 2 100 = +5 %"],
          ["Y augmenté de X %", "Y × (1 + X ÷ 100)", "2 000 + 3 % = 2 060"],
          ["Y diminué de X %", "Y × (1 − X ÷ 100)", "59,90 − 30 % = 41,93"],
          ["Avant une remise de X %", "Valeur finale ÷ (1 − X ÷ 100)", "42 ÷ 0,70 = 60"],
        ]}
      />
    </Section>

    <Section titre="Trois exemples de la vie courante">
      <h3>Les soldes : remise et prix d'origine</h3>
      <p>
        Une veste affichée 59,90 € est soldée à −30 %. La remise vaut 30 ÷ 100 × 59,90 = 17,97 €, et le prix soldé
        59,90 × 0,70 = 41,93 €. Lors d'une seconde démarque de 20 % sur le prix déjà soldé, le prix tombe à 41,93 × 0,80
        = 33,54 € : la remise totale est de 44 %, pas de 50 %. Depuis 2022, le prix de référence d'une réduction est le
        prix le plus bas pratiqué dans les 30 jours qui la précèdent, d'après la DGCCRF.
      </p>
      <h3>L'augmentation de salaire</h3>
      <p>
        Un salaire brut de 2 000 € passe à 2 100 € : l'évolution est (2 100 − 2 000) ÷ 2 000 × 100 = +5 %. Si l'on
        vous propose 3 % cette année et 3 % l'an prochain, le salaire est multiplié par 1,03 × 1,03 = 1,0609 : +6,09 %
        sur deux ans. Pour passer d'un montant hors taxes à un montant toutes taxes, la page{" "}
        <Link to="/calcul-ht-ttc/">calcul HT TTC</Link> applique les taux de TVA en vigueur.
      </p>
      <h3>La note sur 20</h3>
      <p>
        Une copie notée 15 sur 20 représente 15 ÷ 20 × 100 = 75 % des points. Pour comparer avec un contrôle noté sur
        40, ramenez les deux en pourcentage : 26 sur 40 font 65 %. Pour convertir une note sur 40 en note sur 20,
        divisez par 2 ; plus généralement, multipliez le pourcentage par le nouveau barème puis divisez par 100.
      </p>
    </Section>

    <Section titre="Points de pourcentage et pourcentages successifs : les deux pièges">
      <p>
        Quand une grandeur est déjà un pourcentage (un taux d'intérêt, un taux de chômage, une part de marché), sa
        variation peut se dire de deux façons. L'<strong>écart en points</strong> est la simple soustraction : de 3 %
        à 4 %, le taux gagne 1 point. La <strong>variation relative</strong> rapporte cet écart au taux de départ :
        1 ÷ 3 = +33,33 %. Les deux chiffres sont justes, mais ils ne répondent pas à la même question.
      </p>
      <p>
        Les évolutions successives se <strong>multiplient</strong>. Une hausse de 10 % suivie d'une baisse de 10 %
        donne 1,10 × 0,90 = 0,99 : on a perdu 1 %. Le taux moyen par étape, affiché par l'outil, est le taux unique
        qui, répété autant de fois, mène au même résultat ; c'est lui qu'on utilise pour parler d'une progression
        « en moyenne par an ». Il se calcule avec une racine : coefficient global puissance un sur le nombre
        d'étapes, moins 1.
      </p>
      <p>
        Une baisse de 50 % suivie d'une hausse de 50 % ne ramène pas au point de départ (0,5 × 1,5 = 0,75), et pour
        effacer une baisse de 50 % il faut une hausse de 100 %. Pour les prix de vente, la même confusion de base
        sépare le taux de marge du taux de marque, détaillés sur la page{" "}
        <Link to="/calcul-marge-commerciale/">calcul de marge commerciale</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="How to work out a percentage of a number">
      <p>
        To work out a percentage of a number, divide the percentage by 100 and multiply by the number: 20% of 150 is
        20 ÷ 100 × 150 = 30. With this percentage calculator, type 20 in "Percentage X" and 150 in "Number Y" in the
        first block; the result appears as you type, with the formula written out using your own figures. The other
        six blocks answer the related questions: what share one number is of another (15 out of 20 is 75%), the
        percentage change between two values (2,000 to 2,100 is +5%), an increase or discount applied to a price, the
        original price before the French soldes, the gap in points between two rates and the effect of several
        changes in a row. The main limit to keep in mind is that a percentage only means something against its base,
        so two percentages taken from different bases cannot simply be added together.
      </p>
    </Section>

    <Section titre="The formulas at a glance">
      <p>
        A percentage is a fraction out of 100: 20% means 20 per hundred, or 0.20. Nearly every calculation comes down
        to multiplying or dividing by a <strong>multiplier</strong>. A 3% rise multiplies by 1.03; a 30% discount
        multiplies by 0.70. Thinking in multipliers avoids most mistakes, especially when changes follow each other.
      </p>
      <Tableau
        entetes={["Question", "Formula", "Example"]}
        minW="34rem"
        lignes={[
          ["X% of Y", "X ÷ 100 × Y", "20% of 150 = 30"],
          ["X is what % of Y", "X ÷ Y × 100", "15 out of 20 = 75%"],
          ["Change from A to B", "(B − A) ÷ A × 100", "2,000 → 2,100 = +5%"],
          ["Y increased by X%", "Y × (1 + X ÷ 100)", "2,000 + 3% = 2,060"],
          ["Y decreased by X%", "Y × (1 − X ÷ 100)", "59.90 − 30% = 41.93"],
          ["Before a discount of X%", "Final value ÷ (1 − X ÷ 100)", "42 ÷ 0.70 = 60"],
        ]}
      />
    </Section>

    <Section titre="Percentages you meet when living in France">
      <h3>Soldes and promotions</h3>
      <p>
        France has two official sales periods a year, the soldes in winter and summer, plus promotions the rest of the
        year. A jacket at €59.90 with 30% off costs 59.90 × 0.70 = €41.93. A second markdown of 20% on the sale price
        brings it to 41.93 × 0.80 = €33.54, a total discount of 44%, not 50%. Since 2022 the DGCCRF, the French consumer
        protection office, requires the crossed-out reference price to be the lowest price charged in the 30 days
        before the reduction.
      </p>
      <h3>Pay rises and payslips</h3>
      <p>
        A gross salary (salaire brut) of €2,000 a month rising to €2,100 is a change of +5%. Two rises of 3% in a row
        multiply pay by 1.03 × 1.03 = 1.0609, so +6.09% over two years. Invoices and quotes in France are often written
        HT (before VAT); the <Link to="/en/vat-calculator/">French VAT calculator</Link> turns HT into TTC at 20%, 10%,
        5.5% or 2.1%.
      </p>
      <h3>School marks out of 20</h3>
      <p>
        French schools mark out of 20. A 15 out of 20 is 15 ÷ 20 × 100 = 75% of the points, and 26 out of 40 is 65%.
        To compare marks on different scales, turn them into percentages first, then multiply by the new scale and
        divide by 100.
      </p>
    </Section>

    <Section titre="Percentage points and successive changes: two traps">
      <p>
        When the quantity is already a percentage (a mortgage rate, an unemployment rate, a VAT rate), its change can be
        described two ways. The <strong>gap in points</strong> is a plain subtraction: from 3% to 4% the rate gains 1
        point. The <strong>relative change</strong> divides that gap by the starting rate: 1 ÷ 3 = +33.33%. Both are
        correct, they just answer different questions.
      </p>
      <p>
        Successive changes <strong>multiply</strong>. A 10% rise followed by a 10% fall gives 1.10 × 0.90 = 0.99, a
        loss of 1%. The average rate per step shown by the tool is the single rate that, repeated, gives the same end
        result; it is the figure behind phrases such as "on average per year". For pricing, the same confusion of bases
        separates markup from margin, explained on the <Link to="/en/profit-margin-calculator/">profit margin calculator</Link>.
      </p>
    </Section>
  </>
);

export default CalculerUnPourcentage;
