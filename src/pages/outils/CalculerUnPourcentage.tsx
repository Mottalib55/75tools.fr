import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
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

const signe = (n: number, dec = 2) => (n > 0 ? "+" : "") + fmt(n, dec);
const MANQUE = "Saisissez les deux nombres pour voir le résultat.";

const FAQ: QuestionFaq[] = [
  {
    q: "Un article baisse de 20 % puis remonte de 20 %, je retrouve le prix de départ ?",
    r: "Non, vous perdez 4 %. La baisse s'applique au prix de départ, la hausse au prix déjà baissé, plus petit : 100 € deviennent 80 €, puis 80 € plus 20 % donnent 96 €. Les pourcentages successifs se multiplient, ils ne s'additionnent pas : 0,8 × 1,2 = 0,96. Pour revenir à 100 € après une baisse de 20 %, il faut une hausse de 25 %. Le calcul « Hausses ou baisses successives » de la page fait l'opération pour vous.",
  },
  {
    q: "Je connais le prix soldé et le pourcentage de remise, comment retrouver le prix d'origine ?",
    r: "Divisez le prix soldé par le coefficient de la remise, ne rajoutez pas le pourcentage. Pour un article à 42 € après 30 % de remise : 42 ÷ (1 − 0,30) = 42 ÷ 0,70 = 60 €. Ajouter 30 % à 42 € donnerait 54,60 €, ce qui est faux, car les 30 % portaient sur 60 € et non sur 42 €. C'est le calcul « Valeur de départ avant une hausse ou une remise ».",
  },
  {
    q: "Le taux passe de 3 % à 4 %, c'est une hausse de 1 % ou de 33 % ?",
    r: "Les deux formulations circulent, mais une seule est exacte si l'on dit « pour cent ». Le taux gagne 1 point de pourcentage (4 − 3), ce qui représente une hausse relative de 33,33 % (1 ÷ 3 × 100). Dire « le taux augmente de 1 % » laisserait croire qu'il passe à 3,03 %. Pour un taux d'intérêt, de chômage ou de TVA, parlez de points pour l'écart et de pourcentage pour la variation relative.",
  },
  {
    q: "Comment convertir ma note sur 20 en pourcentage, ou un pourcentage en note sur 20 ?",
    r: "Divisez la note par 20 puis multipliez par 100 : 14 sur 20 donne 14 ÷ 20 × 100 = 70 %. Dans l'autre sens, multipliez le pourcentage par 20 puis divisez par 100 : 85 % correspondent à 17 sur 20. Le même principe vaut pour une note sur 10 ou sur 40 : remplacez 20 par le barème. Le calcul « X représente quel pourcentage de Y » le fait avec la note en X et le barème en Y.",
  },
  {
    q: "Puis-je saisir des nombres à virgule ou avec des espaces entre les milliers ?",
    r: "Oui. Les champs acceptent la virgule comme le point pour les décimales, et ignorent les espaces, le signe % et le signe € : « 1 250,50 » est lu comme 1 250,5. Le résultat est arrondi à deux décimales à l'affichage, mais le calcul garde toute la précision. Un nombre négatif se saisit avec le signe moins, utile pour une évolution de perte à perte.",
  },
];

/** X % de Y */
const BlocPourcentageDe = () => {
  const [x, setX] = useState("20");
  const [y, setY] = useState("59,90");
  const nx = lireNombre(x), ny = lireNombre(y);
  const ok = nx !== null && ny !== null;
  const r = ok ? pourcentageDe(nx, ny) : 0;
  return (
    <BlocCalcul titre="Combien font X % de Y ?" id="pourcentage-de">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label="Pourcentage X" value={x} onChange={setX} suffixe="%" />
        <ChampNombre label="Nombre Y" value={y} onChange={setY} />
      </div>
      <div className="mt-4">
        <Resultat libelle={ok ? `${fmt(nx)} % de ${fmt(ny)}` : "Résultat"} valeur={ok ? fmt(r, 4) : "–"} id="res-pourcentage-de" />
      </div>
      {ok && (
        <Formule>
          {fmt(nx, 4)} ÷ 100 × {fmt(ny, 4)} = {fmt(r, 4)}
        </Formule>
      )}
      <Alertes messages={ok ? [] : [MANQUE]} />
    </BlocCalcul>
  );
};

/** X est quel % de Y */
const BlocPart = () => {
  const [x, setX] = useState("15");
  const [y, setY] = useState("20");
  const nx = lireNombre(x), ny = lireNombre(y);
  const ok = nx !== null && ny !== null;
  const r = ok ? partEnPourcentage(nx, ny) : null;
  const msg = !ok ? [MANQUE] : r === null ? ["Y vaut 0 : on ne peut pas exprimer une part de zéro. Saisissez un total différent de 0."] : [];
  return (
    <BlocCalcul titre="X représente quel pourcentage de Y ?" id="part">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label="Partie X" value={x} onChange={setX} />
        <ChampNombre label="Total Y" value={y} onChange={setY} />
      </div>
      <div className="mt-4">
        <Resultat libelle={ok ? `${fmt(nx)} sur ${fmt(ny)}` : "Résultat"} valeur={r !== null ? `${fmt(r)} %` : "–"} id="res-part" />
      </div>
      {r !== null && (
        <Formule>
          {fmt(nx, 4)} ÷ {fmt(ny, 4)} × 100 = {fmt(r, 4)} %
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Évolution de A à B */
const BlocEvolution = () => {
  const [a, setA] = useState("2 000");
  const [b, setB] = useState("2 100");
  const na = lireNombre(a), nb = lireNombre(b);
  const ok = na !== null && nb !== null;
  const r = ok ? evolution(na, nb) : null;
  const msg = !ok ? [MANQUE] : r === null ? ["La valeur de départ vaut 0 : une évolution en pourcentage depuis zéro n'a pas de sens."] : [];
  if (ok && na < 0 && r !== null) msg.push("Valeur de départ négative : l'évolution est rapportée à sa valeur absolue.");
  return (
    <BlocCalcul titre="Évolution en % de A à B" id="evolution">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label="Valeur de départ A" value={a} onChange={setA} />
        <ChampNombre label="Valeur d'arrivée B" value={b} onChange={setB} />
      </div>
      <div className="mt-4">
        <Resultat
          libelle={r === null ? "Évolution" : r >= 0 ? "Hausse" : "Baisse"}
          valeur={r !== null ? `${signe(r)} %` : "–"}
          id="res-evolution"
        />
      </div>
      {r !== null && (
        <Formule>
          ({fmt(nb, 4)} − {fmt(na, 4)}) ÷ {fmt(Math.abs(na), 4)} × 100 = {signe(r, 4)} %, soit un coefficient multiplicateur de{" "}
          {fmt(nb / na, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Augmenter ou diminuer Y de X % */
const BlocAppliquer = () => {
  const [y, setY] = useState("2 000");
  const [x, setX] = useState("3");
  const [sens, setSens] = useState<1 | -1>(1);
  const ny = lireNombre(y), nxBrut = lireNombre(x);
  const msg: string[] = [];
  let nx = nxBrut;
  if (nx !== null && nx < 0) {
    msg.push("Pourcentage négatif ramené à sa valeur positive : choisissez le sens avec les boutons.");
    nx = -nx;
  }
  if (nx !== null && sens === -1 && nx > 100) {
    msg.push(`Une baisse ne peut pas dépasser 100 % : ${fmt(nxBrut!)} % ramené à 100 %.`);
    nx = 100;
  }
  const ok = ny !== null && nx !== null;
  if (!ok) msg.push(MANQUE);
  const r = ok ? appliquerTaux(ny, nx, sens) : 0;
  return (
    <BlocCalcul titre="Augmenter ou diminuer un nombre de X %" id="appliquer">
      <Bascule
        libelle="Sens"
        options={[{ v: 1 as const, l: "Augmenter" }, { v: -1 as const, l: "Diminuer" }]}
        valeur={sens}
        onChange={setSens}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label="Nombre de départ" value={y} onChange={setY} />
        <ChampNombre label="Pourcentage" value={x} onChange={setX} suffixe="%" />
      </div>
      <div className="mt-4">
        <Resultat libelle={sens === 1 ? "Après la hausse" : "Après la baisse"} valeur={ok ? fmt(r, 4) : "–"} id="res-appliquer" />
      </div>
      {ok && (
        <Formule>
          {fmt(ny, 4)} × (1 {sens === 1 ? "+" : "−"} {fmt(nx, 4)} ÷ 100) = {fmt(ny, 4)} × {fmt(1 + (sens * nx) / 100, 6)} ={" "}
          {fmt(r, 4)}, soit un écart de {signe(r - ny, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Valeur de départ avant hausse ou remise */
const BlocDepart = () => {
  const [f, setF] = useState("42");
  const [x, setX] = useState("30");
  const [sens, setSens] = useState<1 | -1>(-1);
  const nf = lireNombre(f), nxBrut = lireNombre(x);
  const msg: string[] = [];
  let nx = nxBrut;
  if (nx !== null && nx < 0) {
    msg.push("Pourcentage négatif ramené à sa valeur positive : choisissez le sens avec les boutons.");
    nx = -nx;
  }
  if (nx !== null && sens === -1 && nx >= 100) {
    msg.push(`Après une remise de ${fmt(nxBrut!)} %, il ne reste rien : on ne peut pas remonter au prix de départ. Valeur ramenée à 99 %.`);
    nx = 99;
  }
  const ok = nf !== null && nx !== null;
  if (!ok) msg.push(MANQUE);
  const r = ok ? valeurDeDepart(nf, nx, sens) : null;
  const coef = ok ? 1 + (sens * nx) / 100 : 1;
  return (
    <BlocCalcul titre="Valeur de départ avant une hausse ou une remise" id="depart">
      <Bascule
        libelle="Ce qui s'est passé"
        options={[{ v: -1 as const, l: "Après remise" }, { v: 1 as const, l: "Après hausse" }]}
        valeur={sens}
        onChange={setSens}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <ChampNombre label="Valeur finale" value={f} onChange={setF} />
        <ChampNombre label={sens === -1 ? "Remise" : "Hausse"} value={x} onChange={setX} suffixe="%" />
      </div>
      <div className="mt-4">
        <Resultat libelle="Valeur de départ" valeur={r !== null ? fmt(r, 4) : "–"} id="res-depart" />
      </div>
      {r !== null && (
        <Formule>
          {fmt(nf, 4)} ÷ (1 {sens === 1 ? "+" : "−"} {fmt(nx, 4)} ÷ 100) = {fmt(nf, 4)} ÷ {fmt(coef, 6)} = {fmt(r, 4)}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

/** Points de pourcentage */
const BlocPoints = () => {
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const na = lireNombre(a), nb = lireNombre(b);
  const ok = na !== null && nb !== null;
  const rel = ok ? evolution(na, nb) : null;
  const msg = !ok ? [MANQUE] : rel === null ? ["Le taux de départ vaut 0 % : l'écart en points existe, la variation relative non."] : [];
  return (
    <BlocCalcul titre="Points de pourcentage ou pourcentage ?" id="points">
      <div className="grid grid-cols-2 gap-3">
        <ChampNombre label="Taux de départ" value={a} onChange={setA} suffixe="%" />
        <ChampNombre label="Taux d'arrivée" value={b} onChange={setB} suffixe="%" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Resultat libelle="Écart" valeur={ok ? `${signe(nb - na)} pt` : "–"} id="res-points" />
        <Resultat libelle="Variation relative" valeur={rel !== null ? `${signe(rel)} %` : "–"} />
      </div>
      {ok && (
        <Formule>
          {fmt(nb, 4)} − {fmt(na, 4)} = {signe(nb - na, 4)} point{Math.abs(nb - na) >= 2 ? "s" : ""}
          {rel !== null && (
            <>
              {" "}; ({fmt(nb, 4)} − {fmt(na, 4)}) ÷ {fmt(Math.abs(na), 4)} × 100 = {signe(rel, 4)} %
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
  const [t, setT] = useState(["10", "-10", "", ""]);
  const msg: string[] = [];
  const lus = t.map((v) => (v.trim() === "" ? null : lireNombre(v)));
  if (t.some((v, i) => v.trim() !== "" && lus[i] === null)) msg.push("Un des taux n'est pas un nombre : il est ignoré.");
  const taux = lus
    .filter((v): v is number => v !== null)
    .map((v) => {
      if (v < -100) {
        msg.push(`Une baisse de ${fmt(v)} % est impossible : ramenée à −100 %.`);
        return -100;
      }
      return v;
    });
  const r = taux.length ? evolutionsSuccessives(taux) : null;
  if (!taux.length) msg.push("Saisissez au moins un taux, positif pour une hausse, négatif pour une baisse.");
  return (
    <BlocCalcul titre="Hausses ou baisses successives" id="successives" className="md:col-span-2">
      <p className="text-sm text-neutral-400 mb-3">Une hausse en positif (10), une baisse en négatif (−10). Les cases vides sont ignorées.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {t.map((v, i) => (
          <ChampNombre
            key={i}
            label={`Étape ${i + 1}`}
            value={v}
            onChange={(nv) => setT((ts) => ts.map((x, j) => (j === i ? nv : x)))}
            suffixe="%"
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Resultat libelle="Évolution globale" valeur={r ? `${signe(r.global)} %` : "–"} id="res-successives" />
        <Resultat libelle="Taux moyen par étape" valeur={r && r.moyen !== null ? `${signe(r.moyen)} %` : "–"} />
      </div>
      {r && (
        <Formule>
          {taux.map((x) => `(1 ${x < 0 ? "−" : "+"} ${fmt(Math.abs(x), 4)} ÷ 100)`).join(" × ")} = {fmt(r.coef, 6)}, soit{" "}
          {signe(r.global, 4)} %
          {r.moyen !== null && taux.length > 1 && (
            <>
              {" "}; taux moyen : {fmt(r.coef, 6)}^(1/{taux.length}) − 1 = {signe(r.moyen, 4)} %
            </>
          )}
        </Formule>
      )}
      <Alertes messages={msg} />
    </BlocCalcul>
  );
};

const CalculerUnPourcentage = () => (
  <PageOutil
    href="/calculer-un-pourcentage/"
    titre="Pourcentage : calculer un pourcentage en ligne, gratuit"
    description="Calculer un pourcentage en ligne : X % d'un nombre, part en %, évolution, hausse ou remise, prix avant soldes et hausses successives, avec la formule détaillée."
    motsCles="calculer un pourcentage, calculateur de pourcentage, comment calculer un pourcentage d'un nombre, calcul pourcentage, évolution en pourcentage"
    nomAppli="Calculateur de pourcentage"
    h1="Calculer un pourcentage"
    chapeau="Sept calculs sur la même page : pourcentage d'un nombre, part, évolution, hausse ou remise, valeur de départ, points de pourcentage et hausses successives. Le résultat et la formule, avec vos nombres, se mettent à jour pendant la saisie."
    faq={FAQ}
  >
    <div className="grid gap-4 md:grid-cols-2 items-start">
      <BlocPourcentageDe />
      <BlocPart />
      <BlocEvolution />
      <BlocAppliquer />
      <BlocDepart />
      <BlocPoints />
      <BlocSuccessives />
    </div>

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
          ["X % de Y", "X ÷ 100 × Y", "20 % de 59,90 = 11,98"],
          ["X est quel % de Y", "X ÷ Y × 100", "15 sur 20 = 75 %"],
          ["Évolution de A à B", "(B − A) ÷ A × 100", "2 000 → 2 100 = +5 %"],
          ["Y augmenté de X %", "Y × (1 + X ÷ 100)", "2 000 + 3 % = 2 060"],
          ["Y diminué de X %", "Y × (1 − X ÷ 100)", "59,90 − 30 % = 41,93"],
          ["Avant une remise de X %", "Valeur finale ÷ (1 − X ÷ 100)", "42 ÷ 0,70 = 60"],
          ["Deux évolutions", "(1 + t1) × (1 + t2) − 1", "+10 % puis −10 % = −1 %"],
        ]}
      />
    </Section>

    <Section titre="Trois exemples de la vie courante">
      <h3>Les soldes : remise et prix d'origine</h3>
      <p>
        Une veste affichée 59,90 € est soldée à −30 %. La remise vaut 30 ÷ 100 × 59,90 = 17,97 €, et le prix soldé
        59,90 × 0,70 = 41,93 €. Lors d'une seconde démarque de 20 % sur le prix déjà soldé, le prix tombe à 41,93 × 0,80
        = 33,54 € : la remise totale est de 44 %, pas de 50 %. Le calcul des évolutions successives le montre en
        saisissant −30 et −20.
      </p>
      <h3>L'augmentation de salaire</h3>
      <p>
        Un salaire brut de 2 000 € passe à 2 100 € : l'évolution est (2 100 − 2 000) ÷ 2 000 × 100 = +5 %. Si l'on
        vous propose 3 % cette année et 3 % l'an prochain, le salaire est multiplié par 1,03 × 1,03 = 1,0609 : +6,09 %
        sur deux ans. Pour savoir si une hausse compense l'inflation, comparez les coefficients plutôt que de
        soustraire les pourcentages ; l'écart est faible pour de petits taux, mais il grandit avec eux. Pour passer
        d'un montant hors taxes à un montant toutes taxes, la page <Link to="/calcul-ht-ttc/">HT TTC</Link> applique
        les taux de TVA en vigueur.
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
        1 ÷ 3 = +33,33 %. Les deux chiffres sont justes, mais ils ne répondent pas à la même question, et les
        confondre fait passer une petite hausse pour une grande, ou l'inverse.
      </p>
      <p>
        Les évolutions successives se <strong>multiplient</strong>. Une hausse de 10 % suivie d'une baisse de 10 %
        donne 1,10 × 0,90 = 0,99 : on a perdu 1 %. Le taux moyen par étape, affiché par l'outil, est le taux unique
        qui, répété autant de fois, mène au même résultat ; c'est lui qu'on utilise pour parler d'une progression
        « en moyenne par an ». Il se calcule avec une racine : coefficient global puissance un sur le nombre
        d'étapes, moins 1.
      </p>
      <p>
        Enfin, un pourcentage dépend toujours de sa base. Une baisse de 50 % suivie d'une hausse de 50 % ne ramène
        pas au point de départ (0,5 × 1,5 = 0,75), et pour effacer une baisse de 50 % il faut une hausse de 100 %.
        Pour les calculs de prix de vente, la même confusion de base sépare le taux de marge du taux de marque,
        détaillés sur la page <Link to="/calcul-marge-commerciale/">marge commerciale</Link>.
      </p>
    </Section>
  </PageOutil>
);

export default CalculerUnPourcentage;
