import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { entierAleatoire, melanger } from "@/lib/temps";
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
  {
    q: "Le tirage est-il vraiment aléatoire, ou peut-on le truquer ?",
    r: "Le hasard vient du générateur cryptographique du navigateur (crypto.getRandomValues), le même que pour créer des clés de chiffrement. Chaque nom a exactement la même probabilité d'être tiré : la méthode écarte les valeurs qui favoriseraient les premiers de la liste. Ni 75tools ni personne d'autre ne voit votre liste ni ne peut influencer le résultat, puisque tout se passe sur votre appareil.",
  },
  {
    q: "Un même prénom figure deux fois dans ma liste : est-ce un problème ?",
    r: "Un nom écrit deux fois a deux chances d'être tiré, comme deux billets dans un chapeau. C'est voulu si une personne a deux participations. Sinon, cochez « Ignorer les doublons » : les lignes identiques, sans tenir compte des majuscules ni des espaces en trop, ne comptent qu'une fois. Le compteur sous la liste indique combien de participants seront réellement pris en compte.",
  },
  {
    q: "Comment prouver aux participants d'un jeu que le tirage a été honnête ?",
    r: "Le plus simple est de tirer en public : en direct sur les réseaux sociaux, ou en partageant l'écran pendant une réunion, liste visible avant de cliquer. L'historique horodaté peut être copié et publié avec les résultats. Pour un jeu-concours commercial doté de lots, le règlement fixe les modalités du tirage : relisez-le et respectez-le, l'outil ne remplace pas ces obligations.",
  },
  {
    q: "Puis-je faire plusieurs tirages successifs sans retirer les gagnants à la main ?",
    r: "Oui : cochez « Retirer les gagnants de la liste ». Après chaque tirage, les noms tirés disparaissent de la zone de saisie, et le tirage suivant se fait parmi ceux qui restent. C'est utile pour un ordre de passage à l'oral, une tombola avec plusieurs lots tirés l'un après l'autre, ou une répartition de tâches.",
  },
];

type Mode = "gagnants" | "equipes" | "nombres";

interface Entree {
  heure: string;
  texte: string;
}

const EXEMPLE = "Camille\nLéo\nInès\nHugo\nChloé\nNathan\nJade\nLouis\nEmma\nGabriel";

const TirageAuSort = () => {
  const [liste, setListe] = useState(EXEMPLE);
  const [mode, setMode] = useState<Mode>("gagnants");
  const [nb, setNb] = useState("1");
  const [nbEquipes, setNbEquipes] = useState("2");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [nbNombres, setNbNombres] = useState("1");
  const [sansDoublon, setSansDoublon] = useState(true);
  const [ignorerDoublons, setIgnorerDoublons] = useState(true);
  const [retirer, setRetirer] = useState(false);
  const [resultat, setResultat] = useState<string[][] | null>(null);
  const [alerte, setAlerte] = useState("");
  const [historique, setHistorique] = useState<Entree[]>([]);
  const [etat, setEtat] = useState("");

  const participants = useMemo(() => {
    const lignes = liste
      .split(/\r?\n|\t|;/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!ignorerDoublons) return lignes;
    const vus = new Set<string>();
    return lignes.filter((l) => {
      const k = l.toLocaleLowerCase("fr-FR").replace(/\s+/g, " ");
      if (vus.has(k)) return false;
      vus.add(k);
      return true;
    });
  }, [liste, ignorerDoublons]);

  const entier = (s: string) => {
    const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
    return Number.isFinite(n) ? n : NaN;
  };

  const noter = (texte: string) =>
    setHistorique((h) => [{ heure: new Date().toLocaleTimeString("fr-FR"), texte }, ...h].slice(0, 50));

  const tirer = () => {
    setAlerte("");
    if (mode === "nombres") {
      let a = entier(min), b = entier(max), k = entier(nbNombres);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return setAlerte("Indiquez un minimum et un maximum.");
      if (a > b) [a, b] = [b, a];
      if (b - a > 1_000_000_000) return setAlerte("Écart trop grand : un milliard au plus entre le minimum et le maximum.");
      const etendue = b - a + 1;
      if (!Number.isFinite(k) || k < 1) k = 1;
      if (k > 1000) { k = 1000; setAlerte("Nombre de tirages ramené à 1 000."); }
      if (sansDoublon && k > etendue) { k = etendue; setAlerte(`Sans doublon, ${etendue} nombre(s) au plus entre ${a} et ${b}.`); }
      const tires: number[] = [];
      const vus = new Set<number>();
      while (tires.length < k) {
        const v = a + entierAleatoire(etendue);
        if (sansDoublon && vus.has(v)) continue;
        vus.add(v);
        tires.push(v);
      }
      const r = tires.map((v) => v.toLocaleString("fr-FR"));
      setResultat([r]);
      noter(`Nombres entre ${a} et ${b} : ${r.join(", ")}`);
      return;
    }
    if (participants.length < 2) return setAlerte("Il faut au moins deux participants, un par ligne.");
    if (mode === "equipes") {
      let e = entier(nbEquipes);
      if (!Number.isFinite(e) || e < 2) { e = 2; setAlerte("Deux équipes au moins."); }
      if (e > participants.length) { e = participants.length; setAlerte(`Ramené à ${e} équipes : une personne au moins par équipe.`); }
      const m = melanger(participants);
      const equipes: string[][] = Array.from({ length: e }, () => []);
      m.forEach((p, i) => equipes[i % e].push(p));
      setResultat(equipes);
      noter(equipes.map((q, i) => `Équipe ${i + 1} : ${q.join(", ")}`).join(" | "));
      return;
    }
    let k = entier(nb);
    if (!Number.isFinite(k) || k < 1) k = 1;
    if (k > participants.length) { k = participants.length; setAlerte(`Ramené à ${k} : il n'y a que ${k} participants.`); }
    const gagnants = melanger(participants).slice(0, k);
    setResultat([gagnants]);
    noter(`${k > 1 ? "Gagnants" : "Gagnant"} parmi ${participants.length} : ${gagnants.join(", ")}`);
    if (retirer) {
      const sortis = new Set(gagnants.map((g) => g.toLocaleLowerCase("fr-FR")));
      setListe(
        liste
          .split(/\r?\n/)
          .filter((l) => !sortis.has(l.trim().toLocaleLowerCase("fr-FR")))
          .join("\n")
      );
    }
  };

  const copierHistorique = async () => {
    try {
      await navigator.clipboard.writeText(historique.map((h) => `${h.heure} - ${h.texte}`).reverse().join("\n"));
      setEtat("Historique copié.");
    } catch {
      setEtat("Votre navigateur a refusé la copie.");
    }
  };

  const onglet = (m: Mode, l: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      onClick={() => {
        setMode(m);
        setResultat(null);
        setAlerte("");
      }}
      className={cn(
        "h-11 px-2 rounded-md border text-sm whitespace-nowrap",
        mode === m ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-400 hover:text-white"
      )}
    >
      {l}
    </button>
  );

  return (
    <PageOutil
      href="/tirage-au-sort/"
      titre="Tirage au sort en ligne gratuit : noms, gagnants, équipes"
      description="Tirage au sort en ligne gratuit : tirez un ou plusieurs gagnants parmi une liste de prénoms, formez des équipes ou tirez des nombres. Rien n'est envoyé."
      motsCles="tirage au sort en ligne, tirage au sort prénom, choisir un nom au hasard, tirage au sort gagnant, faire des équipes au hasard"
      faq={FAQ}
      nomAppli="Tirage au sort en ligne"
      h1="Tirage au sort en ligne"
      chapeau="Collez une liste de prénoms, un par ligne, puis tirez un ou plusieurs gagnants, répartissez la liste en équipes, ou tirez des nombres. Le hasard est calculé sur votre appareil."
      sources={[
        { editeur: "MDN Web Docs", titre: "Crypto: getRandomValues() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-4 min-w-0">
          <div role="group" aria-label="Type de tirage" className="grid grid-cols-3 gap-2">
            {onglet("gagnants", "Gagnants")}
            {onglet("equipes", "Équipes")}
            {onglet("nombres", "Nombres")}
          </div>
          {mode !== "nombres" ? (
            <>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">Participants, un par ligne</span>
                <textarea
                  value={liste}
                  onChange={(e) => setListe(e.target.value)}
                  rows={9}
                  className={classeZoneTexte + " resize-y"}
                  placeholder={"Camille\nLéo\nInès"}
                />
                <span className="block text-xs text-neutral-500 mt-1">
                  {participants.length} participant{participants.length > 1 ? "s" : ""} pris en compte. Une colonne copiée
                  depuis Excel se colle telle quelle.
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={ignorerDoublons} onChange={(e) => setIgnorerDoublons(e.target.checked)} className="w-4 h-4 accent-sky-400" />
                Ignorer les doublons
              </label>
              {mode === "gagnants" ? (
                <>
                  <label className="block max-w-[12rem]">
                    <span className="block text-sm text-neutral-300 mb-1">Nombre de gagnants</span>
                    <input type="text" inputMode="numeric" value={nb} onChange={(e) => setNb(e.target.value.replace(/\D/g, "").slice(0, 4))} className={classeChamp} />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-300">
                    <input type="checkbox" checked={retirer} onChange={(e) => setRetirer(e.target.checked)} className="w-4 h-4 accent-sky-400" />
                    Retirer les gagnants de la liste après le tirage
                  </label>
                </>
              ) : (
                <label className="block max-w-[12rem]">
                  <span className="block text-sm text-neutral-300 mb-1">Nombre d'équipes</span>
                  <input type="text" inputMode="numeric" value={nbEquipes} onChange={(e) => setNbEquipes(e.target.value.replace(/\D/g, "").slice(0, 3))} className={classeChamp} />
                </label>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Minimum", v: min, s: setMin },
                  { l: "Maximum", v: max, s: setMax },
                  { l: "Combien", v: nbNombres, s: setNbNombres },
                ].map((c) => (
                  <label key={c.l} className="block min-w-0">
                    <span className="block text-sm text-neutral-300 mb-1">{c.l}</span>
                    <input type="text" inputMode="numeric" value={c.v} onChange={(e) => c.s(e.target.value.replace(/[^\d-]/g, "").slice(0, 11))} className={classeChamp} />
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" checked={sansDoublon} onChange={(e) => setSansDoublon(e.target.checked)} className="w-4 h-4 accent-sky-400" />
                Sans doublon (chaque nombre une seule fois)
              </label>
            </>
          )}
          <Bouton onClick={tirer}>Lancer le tirage</Bouton>
          <p role="status" className="text-sm text-amber-300 min-h-[1.25rem]">
            {alerte}
          </p>
        </div>

        <div className="space-y-4 min-w-0">
          <div aria-live="polite" className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 min-h-[10rem]">
            {!resultat ? (
              <p className="text-neutral-500">Le résultat du tirage s'affichera ici.</p>
            ) : mode === "equipes" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {resultat.map((q, i) => (
                  <div key={i}>
                    <p className="text-sm uppercase tracking-wider text-neutral-500 mb-1">Équipe {i + 1}</p>
                    <ul className="text-white space-y-0.5">
                      {q.map((p, j) => (
                        <li key={j} className="[overflow-wrap:anywhere]">{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                  {mode === "nombres" ? "Nombres tirés" : resultat[0].length > 1 ? "Gagnants, dans l'ordre du tirage" : "Gagnant"}
                </p>
                <ol className={cn("text-white", resultat[0].length === 1 ? "text-4xl sm:text-5xl font-semibold" : "text-xl space-y-1 list-decimal pl-6")}>
                  {resultat[0].map((g, i) => (
                    <li key={i} className={cn("[overflow-wrap:anywhere]", resultat[0].length === 1 && "list-none")}>
                      {g}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
          {historique.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm text-neutral-300">Historique</p>
                <Bouton secondaire onClick={copierHistorique}>
                  Copier
                </Bouton>
              </div>
              <ul className="text-sm text-neutral-400 space-y-1 max-h-48 overflow-y-auto">
                {historique.map((h, i) => (
                  <li key={i} className="[overflow-wrap:anywhere]">
                    <span className="tabular-nums text-neutral-500">{h.heure}</span> {h.texte}
                  </li>
                ))}
              </ul>
              <p role="status" className="text-sm text-sky-300 min-h-[1.25rem] mt-1">
                {etat}
              </p>
            </div>
          )}
        </div>
      </div>

      <Section titre="Mode d'emploi">
        <p>
          <strong>Gagnants</strong> : collez les noms, un par ligne (une colonne copiée depuis un tableur fonctionne,
          les points-virgules aussi), indiquez le nombre de gagnants, puis lancez. Plusieurs gagnants sont listés dans
          l'ordre du tirage : le premier peut recevoir le premier lot. Avec « Retirer les gagnants », les noms tirés
          quittent la liste et le tirage suivant se fait parmi les autres.
        </p>
        <p>
          <strong>Équipes</strong> : la liste est mélangée puis distribuée tour à tour, comme des cartes. Les équipes
          ont donc le même effectif, à une personne près quand la division ne tombe pas juste. <strong>Nombres</strong>{" "}
          : un ou plusieurs nombres entiers entre un minimum et un maximum compris, avec ou sans doublon, pour un
          numéro de billet de tombola, un numéro de page ou un dé à cent faces.
        </p>
      </Section>

      <Section titre="Exemples d'usage">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>En classe</strong> : désigner l'élève qui passe au tableau, fixer l'ordre de passage des exposés
            (tirez autant de gagnants que d'élèves : l'ordre du tirage est l'ordre de passage), former des groupes de
            travail.
          </li>
          <li>
            <strong>Concours sur les réseaux sociaux</strong> : copiez la liste des participants, tirez en direct ou
            filmez l'écran, publiez l'historique.
          </li>
          <li>
            <strong>Entre amis ou en famille</strong> : qui fait la vaisselle, qui choisit le film, les équipes du
            match de foot. Pour une décision plus visuelle, la <Link to="/roue-de-la-chance/">roue de la chance</Link>{" "}
            fait tourner les choix à l'écran.
          </li>
          <li>
            <strong>Au travail</strong> : ordre de parole d'une réunion, attribution d'un lot de tâches, binômes
            d'entraide.
          </li>
        </ul>
      </Section>

      <Section titre="D'où vient le hasard">
        <p>
          Les tirages de cette page n'utilisent pas Math.random, le générateur rapide des pages web, mais
          crypto.getRandomValues, que la documentation MDN présente comme la source de valeurs aléatoires de qualité
          cryptographique du navigateur. Pour transformer un nombre aléatoire en position dans la liste, une méthode
          naïve (le reste d'une division) avantage très légèrement les premiers noms. Ici, les valeurs qui
          créeraient ce déséquilibre sont rejetées et tirées à nouveau : chaque participant a exactement la même
          probabilité.
        </p>
        <p>
          Le mélange de la liste suit l'algorithme de Fisher-Yates, qui produit chacun des ordres possibles avec la
          même probabilité. Les gagnants sont les premiers noms de cette liste mélangée, ce qui exclut qu'une même
          personne soit tirée deux fois dans un même tirage.
        </p>
      </Section>
    </PageOutil>
  );
};

export default TirageAuSort;
