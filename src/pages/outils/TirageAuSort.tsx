import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { entierAleatoire, melanger } from "@/lib/temps";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
      r: "Le plus simple est de tirer en public : en direct sur les réseaux sociaux, ou en partageant l'écran pendant une réunion, liste visible avant de cliquer. L'historique horodaté peut être copié et publié avec les résultats. Gardez aussi la liste complète des participants telle qu'elle était au moment du tirage, pour pouvoir répondre à une réclamation.",
    },
    {
      q: "Puis-je faire plusieurs tirages successifs sans retirer les gagnants à la main ?",
      r: "Oui : cochez « Retirer les gagnants de la liste ». Après chaque tirage, les noms tirés disparaissent de la zone de saisie, et le tirage suivant se fait parmi ceux qui restent. C'est utile pour une tombola avec plusieurs lots tirés l'un après l'autre, du dernier lot au premier, ou pour une répartition de tâches sur plusieurs semaines.",
    },
    {
      q: "Une entreprise peut-elle organiser un jeu-concours tiré au sort avec cet outil ?",
      r: "L'outil tire au sort équitablement, mais il ne remplace pas les règles du jeu. En France, l'article L121-20 du code de la consommation n'interdit les loteries publicitaires que si elles sont déloyales. En pratique, l'organisateur publie un règlement qui fixe les lots, les conditions de participation et le mode de tirage, souvent déposé chez un commissaire de justice. Respectez ce règlement à la lettre.",
    },
    {
      q: "Avec 25 élèves et 4 équipes, comment sont réparties les personnes en trop ?",
      r: "La liste est mélangée puis distribuée tour à tour, comme des cartes. Avec 25 élèves et 4 équipes, la première équipe reçoit 7 personnes et les trois autres 6 : l'écart ne dépasse jamais une personne. Qui tombe dans l'équipe la plus nombreuse dépend du mélange, donc du hasard. Pour des binômes, indiquez la moitié du nombre de participants comme nombre d'équipes.",
    },
  ],
  en: [
    {
      q: "Is the draw truly random, or could it be rigged?",
      r: "The randomness comes from the browser's cryptographic generator (crypto.getRandomValues), the same one used to create encryption keys. Every name has exactly the same chance: the method throws away values that would favour names at the top of the list. Neither 75tools nor anyone else sees your list or can influence the result, because everything happens on your device.",
    },
    {
      q: "The same name appears twice in my list, does that matter?",
      r: "A name written twice has two chances of being drawn, like two tickets in a hat. That is intended if someone has two entries. Otherwise tick Ignore duplicates: identical lines, regardless of capitals or extra spaces, then count once. The counter under the list shows how many participants will really be included, so you can check before you draw.",
    },
    {
      q: "Can a business in France run a prize draw with this picker?",
      r: "The picker draws fairly, but it does not replace the rules of the game. In France, article L121-20 of the code de la consommation (consumer code) only bans promotional lotteries when they are unfair. In practice the organiser publishes rules setting out the prizes, who may enter and how the draw works, often filed with a commissaire de justice (bailiff). Follow those rules to the letter.",
    },
    {
      q: "Can I run several draws in a row without removing winners by hand?",
      r: "Yes: tick Remove winners from the list. After each draw, the names drawn disappear from the text box and the next draw only uses those left. It is useful for a raffle with several prizes drawn one by one, from the smallest prize to the main one, or for sharing chores out over several weeks in a flatshare.",
    },
    {
      q: "With 25 pupils and 4 teams, where do the extra people go?",
      r: "The list is shuffled and then dealt out in turn, like cards. With 25 pupils and 4 teams, the first team gets 7 people and the other three get 6, so teams never differ by more than one person. Who lands in the larger team depends on the shuffle, in other words on chance. For pairs, enter half the number of participants as the number of teams.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "W3C", titre: "Web Cryptography Level 2, méthode getRandomValues", url: "https://www.w3.org/TR/webcrypto/", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Code de la consommation, section 9 : Loteries publicitaires (article L121-20)", url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032221007/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Clipboard API and events (copie de l'historique)", url: "https://www.w3.org/TR/clipboard-apis/", lu: "27 octobre 2026" },
    { editeur: "MDN Web Docs", titre: "Crypto: getRandomValues() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "W3C", titre: "Web Cryptography Level 2, getRandomValues method", url: "https://www.w3.org/TR/webcrypto/", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Code de la consommation, section 9 : Loteries publicitaires, article L121-20 (French consumer code, promotional lotteries)", url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032221007/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Clipboard API and events", url: "https://www.w3.org/TR/clipboard-apis/", lu: "27 October 2026" },
    { editeur: "MDN Web Docs", titre: "Crypto: getRandomValues() method", url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Tirage au sort en ligne 75tools",
    motsCles: "tirage au sort en ligne, tirage au sort prénom, choisir un nom au hasard, tirage au sort gagnant, faire des équipes au hasard",
    exemple: "Camille\nLéo\nInès\nHugo\nChloé\nNathan\nJade\nLouis\nEmma\nGabriel",
    placeholder: "Camille\nLéo\nInès",
    type: "Type de tirage",
    gagnants: "Gagnants",
    equipes: "Équipes",
    nombres: "Nombres",
    liste: "Participants, un par ligne",
    compte: (n: string, k: number) => `${n} participant${k > 1 ? "s" : ""} pris en compte. Une colonne copiée depuis Excel se colle telle quelle.`,
    ignorer: "Ignorer les doublons",
    nbGagnants: "Nombre de gagnants",
    retirer: "Retirer les gagnants de la liste après le tirage",
    nbEquipes: "Nombre d'équipes",
    min: "Minimum",
    max: "Maximum",
    combien: "Combien",
    sansDoublon: "Sans doublon (chaque nombre une seule fois)",
    lancer: "Lancer le tirage",
    attente: "Le résultat du tirage s'affichera ici, avec l'heure, dans l'historique.",
    equipe: (i: number) => `Équipe ${i}`,
    tires: "Nombres tirés",
    ordre: "Gagnants, dans l'ordre du tirage",
    gagnant: "Gagnant",
    historique: "Historique",
    copier: "Copier",
    copie: "Historique copié.",
    refus: "Votre navigateur a refusé la copie.",
    errMinMax: "Indiquez un minimum et un maximum.",
    errEcart: "Écart trop grand : un milliard au plus entre le minimum et le maximum.",
    errMille: "Nombre de tirages ramené à 1 000.",
    errEtendue: (e: string, a: string, b: string) => `Sans doublon, ${e} nombre(s) au plus entre ${a} et ${b}.`,
    histNombres: (a: string, b: string, r: string) => `Nombres entre ${a} et ${b} : ${r}`,
    errDeux: "Il faut au moins deux participants, un par ligne.",
    errEquipesMin: "Deux équipes au moins.",
    errEquipesMax: (e: number) => `Ramené à ${e} équipes : une personne au moins par équipe.`,
    histEquipe: (i: number, q: string) => `Équipe ${i} : ${q}`,
    errTrop: (k: number) => `Ramené à ${k} : il n'y a que ${k} participants.`,
    histGagnants: (k: number, n: number, g: string) => `${k > 1 ? "Gagnants" : "Gagnant"} parmi ${n} : ${g}`,
  },
  en: {
    nomAppli: "75tools random name picker",
    motsCles: "random name picker, random winner picker, pick a name at random, random team generator, random number picker",
    exemple: "Emma\nOliver\nCamille\nNoah\nChloé\nJames\nInès\nLucas\nSophie\nHugo",
    placeholder: "Emma\nOliver\nCamille",
    type: "Draw type",
    gagnants: "Winners",
    equipes: "Teams",
    nombres: "Numbers",
    liste: "Participants, one per line",
    compte: (n: string, k: number) => `${n} participant${k > 1 ? "s" : ""} included. A column copied from Excel pastes as it is.`,
    ignorer: "Ignore duplicates",
    nbGagnants: "Number of winners",
    retirer: "Remove winners from the list after the draw",
    nbEquipes: "Number of teams",
    min: "Minimum",
    max: "Maximum",
    combien: "How many",
    sansDoublon: "No repeats (each number once)",
    lancer: "Draw",
    attente: "The result of the draw will show here, and in the timed history.",
    equipe: (i: number) => `Team ${i}`,
    tires: "Numbers drawn",
    ordre: "Winners, in the order drawn",
    gagnant: "Winner",
    historique: "History",
    copier: "Copy",
    copie: "History copied.",
    refus: "Your browser blocked the copy.",
    errMinMax: "Enter a minimum and a maximum.",
    errEcart: "Range too wide: at most one billion between the minimum and the maximum.",
    errMille: "Number of draws capped at 1,000.",
    errEtendue: (e: string, a: string, b: string) => `With no repeats, at most ${e} number(s) between ${a} and ${b}.`,
    histNombres: (a: string, b: string, r: string) => `Numbers between ${a} and ${b}: ${r}`,
    errDeux: "You need at least two participants, one per line.",
    errEquipesMin: "At least two teams.",
    errEquipesMax: (e: number) => `Reduced to ${e} teams: at least one person per team.`,
    histEquipe: (i: number, q: string) => `Team ${i}: ${q}`,
    errTrop: (k: number) => `Reduced to ${k}: there are only ${k} participants.`,
    histGagnants: (k: number, n: number, g: string) => `${k > 1 ? "Winners" : "Winner"} out of ${n}: ${g}`,
  },
};

type Mode = "gagnants" | "equipes" | "nombres";

interface Entree {
  heure: string;
  texte: string;
}

const TirageAuSort = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const loc = locale(lang);
  const nb2 = (n: number) => n.toLocaleString(loc);
  const [liste, setListe] = useState(t.exemple);
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
  const zone = useRef<HTMLDivElement>(null);

  const participants = useMemo(() => {
    const lignes = liste
      .split(/\r?\n|\t|;/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!ignorerDoublons) return lignes;
    const vus = new Set<string>();
    return lignes.filter((l) => {
      const k = l.toLocaleLowerCase(loc).replace(/\s+/g, " ");
      if (vus.has(k)) return false;
      vus.add(k);
      return true;
    });
  }, [liste, ignorerDoublons, loc]);

  const entier = (s: string) => {
    const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
    return Number.isFinite(n) ? n : NaN;
  };

  const noter = (texte: string) => setHistorique((h) => [{ heure: new Date().toLocaleTimeString(loc), texte }, ...h].slice(0, 50));

  /** Sur téléphone, le résultat est sous les champs : on l'amène à l'écran s'il n'y est pas. */
  const montrer = () =>
    requestAnimationFrame(() => {
      const r = zone.current?.getBoundingClientRect();
      if (r && (r.top > window.innerHeight - 80 || r.bottom < 0)) zone.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

  const tirer = () => {
    setAlerte("");
    if (mode === "nombres") {
      let a = entier(min), b = entier(max), k = entier(nbNombres);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return setAlerte(t.errMinMax);
      if (a > b) [a, b] = [b, a];
      if (b - a > 1_000_000_000) return setAlerte(t.errEcart);
      const etendue = b - a + 1;
      if (!Number.isFinite(k) || k < 1) k = 1;
      if (k > 1000) { k = 1000; setAlerte(t.errMille); }
      if (sansDoublon && k > etendue) { k = etendue; setAlerte(t.errEtendue(nb2(etendue), nb2(a), nb2(b))); }
      const tires: number[] = [];
      const vus = new Set<number>();
      while (tires.length < k) {
        const v = a + entierAleatoire(etendue);
        if (sansDoublon && vus.has(v)) continue;
        vus.add(v);
        tires.push(v);
      }
      const r = tires.map(nb2);
      setResultat([r]);
      noter(t.histNombres(nb2(a), nb2(b), r.join(", ")));
      montrer();
      return;
    }
    if (participants.length < 2) return setAlerte(t.errDeux);
    if (mode === "equipes") {
      let e = entier(nbEquipes);
      if (!Number.isFinite(e) || e < 2) { e = 2; setAlerte(t.errEquipesMin); }
      if (e > participants.length) { e = participants.length; setAlerte(t.errEquipesMax(e)); }
      const m = melanger(participants);
      const equipes: string[][] = Array.from({ length: e }, () => []);
      m.forEach((p, i) => equipes[i % e].push(p));
      setResultat(equipes);
      noter(equipes.map((q, i) => t.histEquipe(i + 1, q.join(", "))).join(" | "));
      montrer();
      return;
    }
    let k = entier(nb);
    if (!Number.isFinite(k) || k < 1) k = 1;
    if (k > participants.length) { k = participants.length; setAlerte(t.errTrop(k)); }
    const gagnants = melanger(participants).slice(0, k);
    setResultat([gagnants]);
    noter(t.histGagnants(k, participants.length, gagnants.join(", ")));
    montrer();
    if (retirer) {
      const sortis = new Set(gagnants.map((g) => g.toLocaleLowerCase(loc)));
      setListe(
        liste
          .split(/\r?\n/)
          .filter((l) => !sortis.has(l.trim().toLocaleLowerCase(loc)))
          .join("\n")
      );
    }
  };

  const copierHistorique = async () => {
    try {
      await navigator.clipboard.writeText(historique.map((h) => `${h.heure} - ${h.texte}`).reverse().join("\n"));
      setEtat(t.copie);
    } catch {
      setEtat(t.refus);
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

  const outil = (
    <div className="grid gap-5 lg:grid-cols-2 items-start">
      <div className="space-y-4 min-w-0">
        <div role="group" aria-label={t.type} className="grid grid-cols-3 gap-2">
          {onglet("gagnants", t.gagnants)}
          {onglet("equipes", t.equipes)}
          {onglet("nombres", t.nombres)}
        </div>
        {mode !== "nombres" ? (
          <>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">{t.liste}</span>
              <textarea value={liste} onChange={(e) => setListe(e.target.value)} rows={6} className={classeZoneTexte + " resize-y"} placeholder={t.placeholder} />
              <span className="block text-xs text-neutral-500 mt-1">{t.compte(nb2(participants.length), participants.length)}</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={ignorerDoublons} onChange={(e) => setIgnorerDoublons(e.target.checked)} className="w-4 h-4 accent-sky-400" />
              {t.ignorer}
            </label>
            {mode === "gagnants" ? (
              <>
                <label className="block max-w-[12rem]">
                  <span className="block text-sm text-neutral-300 mb-1">{t.nbGagnants}</span>
                  <input type="text" inputMode="numeric" value={nb} onChange={(e) => setNb(e.target.value.replace(/\D/g, "").slice(0, 4))} className={classeChamp} />
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" checked={retirer} onChange={(e) => setRetirer(e.target.checked)} className="w-4 h-4 accent-sky-400" />
                  {t.retirer}
                </label>
              </>
            ) : (
              <label className="block max-w-[12rem]">
                <span className="block text-sm text-neutral-300 mb-1">{t.nbEquipes}</span>
                <input type="text" inputMode="numeric" value={nbEquipes} onChange={(e) => setNbEquipes(e.target.value.replace(/\D/g, "").slice(0, 3))} className={classeChamp} />
              </label>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: t.min, v: min, s: setMin },
                { l: t.max, v: max, s: setMax },
                { l: t.combien, v: nbNombres, s: setNbNombres },
              ].map((c) => (
                <label key={c.l} className="block min-w-0">
                  <span className="block text-sm text-neutral-300 mb-1">{c.l}</span>
                  <input type="text" inputMode="numeric" value={c.v} onChange={(e) => c.s(e.target.value.replace(/[^\d-]/g, "").slice(0, 11))} className={classeChamp} />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={sansDoublon} onChange={(e) => setSansDoublon(e.target.checked)} className="w-4 h-4 accent-sky-400" />
              {t.sansDoublon}
            </label>
          </>
        )}
        <Bouton onClick={tirer}>{t.lancer}</Bouton>
        {alerte && (
          <p role="status" className="text-sm text-amber-300">
            {alerte}
          </p>
        )}
      </div>

      <div className="space-y-4 min-w-0">
        <div ref={zone} data-resultat aria-live="polite" className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 min-h-[8rem] scroll-mt-4">
          {!resultat ? (
            <p className="text-neutral-500">{t.attente}</p>
          ) : mode === "equipes" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {resultat.map((q, i) => (
                <div key={i}>
                  <p className="text-sm uppercase tracking-wider text-neutral-500 mb-1">{t.equipe(i + 1)}</p>
                  <ul className="text-white space-y-0.5">
                    {q.map((p, j) => (
                      <li key={j} className="[overflow-wrap:anywhere]">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                {mode === "nombres" ? t.tires : resultat[0].length > 1 ? t.ordre : t.gagnant}
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
              <p className="text-sm text-neutral-300">{t.historique}</p>
              <Bouton secondaire onClick={copierHistorique}>
                {t.copier}
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
  );

  return (
    <PageOutil id="tirage-au-sort" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Faire un tirage au sort en ligne, équitable et sans inscription">
      <p>
        Pour un tirage au sort en ligne, collez la liste des noms dans le cadre, un par ligne (une colonne copiée
        depuis Excel ou Google Sheets fonctionne telle quelle), indiquez le nombre de gagnants, puis cliquez sur
        « Lancer le tirage » : les noms tirés s'affichent dans l'ordre du tirage et l'heure est notée dans
        l'historique. Exemple : parmi 10 prénoms, tirer 3 gagnants laisse à chacun exactement 3 chances sur 10 d'être
        désigné. Les onglets « Équipes » et « Nombres » répartissent la liste en groupes de même taille, à une
        personne près, ou tirent des nombres entiers entre un minimum et un maximum, avec ou sans doublon. Le hasard
        vient du générateur cryptographique du navigateur, et la liste ne quitte jamais votre appareil. La limite :
        l'outil tire équitablement mais ne garde aucune preuve hors de votre écran, d'où l'intérêt de tirer en
        public et de copier l'historique.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        <strong>Gagnants</strong> : collez les noms, un par ligne (les points-virgules et les tabulations séparent
        aussi), indiquez le nombre de gagnants, puis lancez. Plusieurs gagnants sont listés dans l'ordre du tirage :
        le premier peut recevoir le premier lot. Avec « Retirer les gagnants », les noms tirés quittent la liste et le
        tirage suivant se fait parmi les autres.
      </p>
      <p>
        <strong>Équipes</strong> : la liste est mélangée puis distribuée tour à tour, comme des cartes. Les équipes ont
        donc le même effectif, à une personne près quand la division ne tombe pas juste. <strong>Nombres</strong> : un
        ou plusieurs nombres entiers entre un minimum et un maximum compris, avec ou sans doublon, pour un numéro de
        billet de tombola, un numéro de page ou un dé à cent faces.
      </p>
    </Section>

    <Section titre="Exemples d'usage">
      <p>
        <strong>En classe</strong>, désigner l'élève qui passe au tableau, fixer l'ordre de passage des exposés (tirez
        autant de gagnants que d'élèves : l'ordre du tirage est l'ordre de passage) ou former des groupes de travail.{" "}
        <strong>Pour un concours sur les réseaux sociaux</strong>, copiez la liste des participants, tirez en direct ou
        filmez l'écran, puis publiez l'historique. <strong>Au travail</strong>, l'outil fixe l'ordre de parole d'une
        réunion, attribue un lot de tâches ou forme des binômes d'entraide.
      </p>
      <p>
        <strong>Entre amis ou en famille</strong>, il tranche qui fait la vaisselle, qui choisit le film ou comment se
        composent les équipes du match de foot. Pour une décision plus visuelle, la{" "}
        <Link to="/roue-de-la-chance/">roue de la chance à personnaliser</Link> fait tourner les choix à l'écran. Pour
        limiter un tirage dans le temps, par exemple une minute pour répondre, lancez le{" "}
        <Link to="/minuteur/">minuteur en ligne</Link> dans un autre onglet.
      </p>
    </Section>

    <Section titre="D'où vient le hasard">
      <p>
        Les tirages de cette page n'utilisent pas Math.random, le générateur rapide des pages web, mais
        crypto.getRandomValues, défini par la norme Web Cryptography du W3C comme la source de valeurs aléatoires de
        qualité cryptographique du navigateur. Pour transformer un nombre aléatoire en position dans la liste, une
        méthode naïve (le reste d'une division) avantage très légèrement les premiers noms. Ici, les valeurs qui
        créeraient ce déséquilibre sont rejetées et tirées à nouveau : chaque participant a exactement la même
        probabilité.
      </p>
      <p>
        Le mélange de la liste suit l'algorithme de Fisher-Yates, qui produit chacun des ordres possibles avec la même
        probabilité. Les gagnants sont les premiers noms de cette liste mélangée, ce qui exclut qu'une même personne
        soit tirée deux fois dans un même tirage.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A fair random name picker, with no sign-up">
      <p>
        To use this random name picker, paste the list of names into the box, one per line (a column copied from Excel
        or Google Sheets works as it is), choose how many winners, then click Draw: the names drawn appear in the order
        they came out and the time goes into the history. For example, drawing 3 winners from 10 names gives each
        person exactly a 3 in 10 chance. The Teams and Numbers tabs split the list into groups of the same size, give
        or take one person, or draw whole numbers between a minimum and a maximum, with or without repeats. The
        randomness comes from the browser's cryptographic generator and the list never leaves your device. The limit:
        the picker draws fairly but keeps no proof beyond your screen, so draw in public and copy the history if the
        result matters.
      </p>
    </Section>

    <Section titre="How to use it">
      <p>
        <strong>Winners</strong>: paste the names, one per line (semicolons and tabs also separate them), enter the
        number of winners and draw. Several winners are listed in the order drawn, so the first can get the first
        prize. With Remove winners ticked, the names drawn leave the list and the next draw uses the others.
      </p>
      <p>
        <strong>Teams</strong>: the list is shuffled and dealt out in turn, like cards, so teams have the same size,
        give or take one person when the numbers do not divide evenly. <strong>Numbers</strong>: one or more whole
        numbers between a minimum and a maximum, both included, with or without repeats, for a raffle ticket, a page
        number or a hundred-sided die.
      </p>
    </Section>

    <Section titre="Ways to use it">
      <p>
        <strong>At school</strong>, pick the pupil who answers next, set the order of presentations (draw as many
        winners as there are pupils: the order drawn is the running order) or form working groups. That suits teachers
        at international and bilingual schools as well as French state schools. <strong>For a social media
        giveaway</strong>, copy the list of entrants, draw live or record your screen, then post the history.{" "}
        <strong>At work</strong>, it sets the speaking order of a meeting, hands out tasks or forms buddy pairs.
      </p>
      <p>
        <strong>With friends or family</strong>, it decides who does the dishes, who chooses the film or how the
        football teams line up. For a more visual decision, the <Link to="/en/spin-the-wheel/">spin the wheel
        tool</Link> turns your choices on screen. To put a time limit on an answer, say one minute, start the{" "}
        <Link to="/en/online-timer/">online timer</Link> in another tab.
      </p>
    </Section>

    <Section titre="Where the randomness comes from">
      <p>
        These draws do not use Math.random, the fast generator found in web pages, but crypto.getRandomValues, defined
        by the W3C Web Cryptography standard as the browser's source of cryptographic-quality random values. Turning a
        random number into a position in the list with a naive method (the remainder of a division) slightly favours
        the first names. Here, values that would create that bias are thrown away and drawn again, so every participant
        has exactly the same probability.
      </p>
      <p>
        The list is shuffled with the Fisher-Yates algorithm, which produces every possible order with the same
        probability. The winners are the first names of the shuffled list, which rules out drawing the same person
        twice in a single draw.
      </p>
    </Section>
  </>
);

export default TirageAuSort;
