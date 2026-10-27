import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section } from "@/components/outils/OutilLayout";
import {
  OptionsMdp,
  OptionsPhrase,
  TypeCar,
  entropieMotDePasse,
  entropiePhrase,
  genererMotDePasse,
  genererPhrase,
  niveau,
} from "@/lib/texte-motdepasse";
import { listeMotsFr } from "@/lib/texte-mots-fr";
import { copierTexte } from "@/lib/texte-copier";
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
  {
    q: "Le mot de passe généré est-il envoyé ou gardé quelque part ?",
    r: "Non. Il est tiré dans votre navigateur avec crypto.getRandomValues, le générateur de hasard cryptographique de votre appareil, puis affiché. Aucune requête ne part vers un serveur, rien n'est enregistré, pas même dans le stockage local du navigateur. En rechargeant la page, il disparaît : copiez-le aussitôt dans votre gestionnaire de mots de passe ou dans le formulaire du site.",
  },
  {
    q: "Je dois retenir ce mot de passe par cœur, mot de passe ou phrase de passe ?",
    r: "Pour un secret à mémoriser, comme le mot de passe principal d'un gestionnaire ou la session de votre ordinateur, la phrase de passe est plus facile : huit mots tirés au hasard dépassent 80 bits et se retiennent en imaginant une petite scène. Pour tous les autres comptes, laissez le gestionnaire créer et retenir un mot de passe aléatoire long, que vous n'aurez jamais à taper.",
  },
  {
    q: "Un site refuse mon mot de passe à cause des caractères spéciaux, que faire ?",
    r: "Certains sites n'acceptent qu'une partie des symboles, ou limitent la longueur. Décochez « Symboles » et allongez le mot de passe pour garder la même robustesse : sans symboles, 14 caractères mêlant minuscules, majuscules et chiffres atteignent déjà le niveau minimal de la CNIL. La jauge recalcule l'entropie à chaque changement, visez au moins 80 bits.",
  },
  {
    q: "Pourquoi exclure les caractères ambigus ?",
    r: "Le chiffre 0 et la lettre O, le chiffre 1, la lettre l minuscule, le I majuscule et la barre verticale se confondent dans beaucoup de polices. Les exclure évite les erreurs quand le mot de passe doit être lu sur un écran puis tapé ailleurs, dicté ou recopié sur un papier remis en main propre. L'entropie baisse un peu, ce que la jauge montre ; ajoutez un caractère pour compenser.",
  },
  {
    q: "À quoi sert l'option « au moins un de chaque type » ?",
    r: "Beaucoup de sites exigent au moins une majuscule, un chiffre et un symbole. Avec l'option cochée, le générateur écarte les tirages qui n'en contiennent pas et en refait un, ce qui garde un tirage uniforme parmi les mots de passe conformes. L'entropie affichée en tient compte : elle est calculée sur le nombre exact de mots de passe qui respectent la règle, donc légèrement plus basse.",
  },
];

const TYPES: { cle: TypeCar; libelle: string; exemple: string }[] = [
  { cle: "minuscules", libelle: "Minuscules", exemple: "a-z" },
  { cle: "majuscules", libelle: "Majuscules", exemple: "A-Z" },
  { cle: "chiffres", libelle: "Chiffres", exemple: "0-9" },
  { cle: "symboles", libelle: "Symboles", exemple: "! # % & @ …" },
];

const SEPARATEURS = [
  { v: "-", l: "Tiret (-)" },
  { v: " ", l: "Espace" },
  { v: ".", l: "Point (.)" },
  { v: "_", l: "Trait bas (_)" },
  { v: "", l: "Aucun" },
];

const NB_PROPOSITIONS = 5;

/** Champ entier borné : la valeur hors bornes est ramenée et signalée. */
const lireEntier = (s: string, min: number, max: number, defaut: number, unite: string) => {
  const n = parseInt(s.replace(/\s/g, ""), 10);
  if (s.trim() === "" || !Number.isFinite(n)) return { v: defaut, alerte: s.trim() === "" ? "" : `Saisissez un nombre entier ; ${defaut} ${unite} en attendant.` };
  if (n < min) return { v: min, alerte: `Ramené à ${min} ${unite}, le minimum.` };
  if (n > max) return { v: max, alerte: `Ramené à ${max} ${unite}, le maximum.` };
  return { v: n, alerte: "" };
};

const Case = ({ coche, onChange, children }: { coche: boolean; onChange: (v: boolean) => void; children: ReactNode }) => (
  <label className="flex items-center gap-2 min-h-[2.75rem] cursor-pointer text-sm text-neutral-200">
    <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-sky-400 shrink-0" />
    <span>{children}</span>
  </label>
);

const GenerateurMotDePasse = () => {
  const [mode, setMode] = useState<"mdp" | "phrase">("mdp");
  const [longueurSaisie, setLongueurSaisie] = useState("16");
  const [types, setTypes] = useState<TypeCar[]>(["minuscules", "majuscules", "chiffres", "symboles"]);
  const [exclureAmbigus, setExclureAmbigus] = useState(false);
  const [unDeChaque, setUnDeChaque] = useState(true);
  const [nbMotsSaisie, setNbMotsSaisie] = useState("8");
  const [accents, setAccents] = useState(false);
  const [separateur, setSeparateur] = useState("-");
  const [majuscule, setMajuscule] = useState(true);
  const [chiffre, setChiffre] = useState(true);
  const [propositions, setPropositions] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const longueur = lireEntier(longueurSaisie, 8, 128, 16, "caractères");
  const nbMots = lireEntier(nbMotsSaisie, 3, 20, 8, "mots");

  const optMdp: OptionsMdp = useMemo(
    () => ({ longueur: longueur.v, types, exclureAmbigus, unDeChaque }),
    [longueur.v, types, exclureAmbigus, unDeChaque]
  );
  const optPhrase: OptionsPhrase = useMemo(
    () => ({ nbMots: nbMots.v, accents, separateur, majuscule, chiffre }),
    [nbMots.v, accents, separateur, majuscule, chiffre]
  );

  const generer = useCallback(() => {
    if (mode === "mdp" && !types.length) {
      setPropositions([]);
      return;
    }
    setPropositions(
      Array.from({ length: NB_PROPOSITIONS }, () => (mode === "mdp" ? genererMotDePasse(optMdp) : genererPhrase(optPhrase)))
    );
    setMessage("");
  }, [mode, types.length, optMdp, optPhrase]);

  // Tirage après le rendu (le HTML pré-rendu ne contient aucun mot de passe), puis à chaque changement d'option.
  useEffect(() => {
    generer();
  }, [generer]);

  const bits = mode === "mdp" ? entropieMotDePasse(optMdp) : entropiePhrase(optPhrase);
  const niv = niveau(bits);
  const tailleListe = listeMotsFr(accents).length;

  const copier = async (s: string, i: number) => {
    const ok = await copierTexte(s);
    setMessage(ok ? (i === 0 ? "Mot de passe copié." : `Proposition ${i + 1} copiée.`) : "Copie impossible : sélectionnez-le et copiez-le.");
  };

  const basculerType = (t: TypeCar, v: boolean) =>
    setTypes((x) => (v ? TYPES.map((y) => y.cle).filter((k) => k === t || x.includes(k)) : x.filter((k) => k !== t)));

  const [principal, ...autres] = propositions;

  return (
    <PageOutil
      href="/generateur-mot-de-passe/"
      titre="Générateur de mot de passe sécurisé, gratuit et aléatoire"
      description="Générateur de mot de passe aléatoire et fort : longueur, symboles, phrase de passe en français, entropie en bits selon la CNIL et l'ANSSI. Rien n'est envoyé."
      motsCles="générateur de mot de passe, créer un mot de passe sécurisé, mot de passe aléatoire fort, générateur de phrase de passe, mot de passe CNIL"
      nomAppli="Générateur de mot de passe 75tools"
      categorieAppli="SecurityApplication"
      h1="Générateur de mot de passe aléatoire"
      chapeau="Choisissez un mot de passe aléatoire ou une phrase de passe faite de mots français, sa longueur et ses caractères : l'entropie en bits s'affiche et se compare aux seuils de la CNIL et de l'ANSSI. Le tirage se fait dans votre navigateur, rien n'est envoyé ni enregistré."
      faq={FAQ}
      sources={[
        { editeur: "CNIL", titre: "Mots de passe : une nouvelle recommandation pour maîtriser sa sécurité (délibération n° 2022-100 du 21 juillet 2022)", url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite", lu: "27 octobre 2026" },
        { editeur: "ANSSI", titre: "Recommandations relatives à l'authentification multifacteur et aux mots de passe (guide ANSSI-PG-078, octobre 2021)", url: "https://messervices.cyber.gouv.fr/guides/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe", lu: "27 octobre 2026" },
        { editeur: "Cybermalveillance.gouv.fr", titre: "Pourquoi et comment bien gérer ses mots de passe ?", url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div className="min-w-0 space-y-4">
          <div role="tablist" aria-label="Type de secret" className="inline-flex rounded-md border border-neutral-700 p-1 gap-1">
            {(["mdp", "phrase"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "h-10 px-4 rounded text-sm font-medium",
                  mode === m ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                {m === "mdp" ? "Mot de passe" : "Phrase de passe"}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-sky-400/40 bg-neutral-900 p-4">
            <p className="text-sm text-neutral-400 mb-2">{mode === "mdp" ? "Votre mot de passe" : "Votre phrase de passe"}</p>
            <p
              id="mot-de-passe"
              className="font-mono text-xl sm:text-2xl text-white min-h-[2.25rem] [overflow-wrap:anywhere] select-all"
              translate="no"
            >
              {principal ?? (mode === "mdp" && !types.length ? "" : " ")}
            </p>
            {mode === "mdp" && !types.length && <p className="text-amber-300 text-sm">Cochez au moins un type de caractères.</p>}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <Bouton onClick={() => principal && copier(principal, 0)} disabled={!principal}>
                <span className="inline-flex items-center gap-2"><Copy className="w-4 h-4" aria-hidden="true" />Copier</span>
              </Bouton>
              <Bouton secondaire onClick={generer} disabled={mode === "mdp" && !types.length}>
                <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />Nouveau tirage</span>
              </Bouton>
              <span role="status" className="text-sm text-neutral-400">{message}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-neutral-300">
                  Entropie : <strong id="entropie" className="text-white tabular-nums">{bits.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} bits</strong>
                </span>
                <span className="text-neutral-300">{niv.libelle}</span>
              </div>
              <div className="h-2 mt-1 rounded bg-neutral-800 overflow-hidden" aria-hidden="true">
                <div className={"h-full " + niv.couleur} style={{ width: `${Math.min(1, bits / 128) * 100}%` }} />
              </div>
              <p className="text-xs text-neutral-500 mt-1">{niv.detail}</p>
            </div>
          </div>

          {autres.length > 0 && (
            <div>
              <p className="text-sm text-neutral-400 mb-2">Autres propositions</p>
              <ul className="space-y-2">
                {autres.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-2 min-w-0">
                    <span className="font-mono text-sm sm:text-base text-neutral-100 flex-1 min-w-0 [overflow-wrap:anywhere]" translate="no">{p}</span>
                    <button
                      type="button"
                      onClick={() => copier(p, i + 1)}
                      className="shrink-0 h-10 w-10 grid place-items-center rounded border border-neutral-700 hover:border-neutral-500"
                      aria-label={`Copier la proposition ${i + 2}`}
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form className="min-w-0 space-y-3 rounded-lg border border-neutral-800 p-4" onSubmit={(e) => e.preventDefault()} aria-label="Réglages">
          {mode === "mdp" ? (
            <>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">Longueur (8 à 128 caractères)</span>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    min={8}
                    max={64}
                    value={Math.min(64, longueur.v)}
                    onChange={(e) => setLongueurSaisie(e.target.value)}
                    className="flex-1 min-w-0 accent-sky-400"
                    aria-label="Longueur"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={longueurSaisie}
                    onChange={(e) => setLongueurSaisie(e.target.value)}
                    className={classeChamp + " w-20 text-center"}
                    aria-label="Longueur en caractères"
                  />
                </div>
              </label>
              <p role="status" className="text-xs text-amber-300 empty:hidden">{longueur.alerte}</p>
              <fieldset>
                <legend className="text-sm text-neutral-300 mb-1">Caractères</legend>
                {TYPES.map((t) => (
                  <Case key={t.cle} coche={types.includes(t.cle)} onChange={(v) => basculerType(t.cle, v)}>
                    {t.libelle} <span className="text-neutral-500">{t.exemple}</span>
                  </Case>
                ))}
              </fieldset>
              <Case coche={exclureAmbigus} onChange={setExclureAmbigus}>
                Exclure les caractères ambigus <span className="text-neutral-500 font-mono">0 O o 1 l I | ' " `</span>
              </Case>
              <Case coche={unDeChaque} onChange={setUnDeChaque}>
                Au moins un caractère de chaque type coché
              </Case>
            </>
          ) : (
            <>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">Nombre de mots (3 à 20)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nbMotsSaisie}
                  onChange={(e) => setNbMotsSaisie(e.target.value)}
                  className={classeChamp}
                />
              </label>
              <p role="status" className="text-xs text-amber-300 empty:hidden">{nbMots.alerte}</p>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">Séparateur</span>
                <select value={separateur} onChange={(e) => setSeparateur(e.target.value)} className={classeSelect}>
                  {SEPARATEURS.map((s) => (
                    <option key={s.l} value={s.v}>{s.l}</option>
                  ))}
                </select>
              </label>
              <Case coche={majuscule} onChange={setMajuscule}>Majuscule au début de chaque mot</Case>
              <Case coche={chiffre} onChange={setChiffre}>Ajouter un chiffre</Case>
              <Case coche={accents} onChange={setAccents}>Garder les accents (é, è, ê, ç…)</Case>
              <p className="text-xs text-neutral-500">
                Mots tirés dans une liste de {tailleListe.toLocaleString("fr-FR")} mots courants, soit{" "}
                {Math.log2(tailleListe).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} bits par mot.
              </p>
            </>
          )}
        </form>
      </div>

      <Section titre="Ce que recommandent la CNIL, l'ANSSI et Cybermalveillance.gouv.fr">
        <p>
          La CNIL a publié sa recommandation sur les mots de passe par la délibération n° 2022-100 du
          21 juillet 2022. Pour un mot de passe utilisé seul, sans autre mesure de protection, elle fixe un
          niveau minimal de <strong>80 bits d'entropie</strong>. Elle en donne des équivalents : 12 caractères
          au moins avec majuscules, minuscules, chiffres et caractères spéciaux pris dans une liste d'au moins
          37 signes ; 14 caractères au moins avec majuscules, minuscules et chiffres ; ou une phrase de passe
          d'au moins 7 mots. Le seuil descend à 50 bits quand le site limite le nombre d'essais.
        </p>
        <p>
          Le guide de l'ANSSI sur l'authentification et les mots de passe (octobre 2021) relie longueur et
          robustesse pour un jeu de 90 caractères : entre 9 et 11 caractères pour environ 65 bits (sensibilité
          faible à moyenne), entre 12 et 14 pour environ 85 bits, au moins 15 pour 100 bits et plus. Pour les
          mots de passe qui n'ont pas à être mémorisés, il recommande une longueur très grande, par exemple
          plus de 20 caractères, et rappelle que les phrases de passe sont une bonne alternative.
        </p>
        <p>
          Cybermalveillance.gouv.fr conseille au moins 12 caractères de quatre types, un mot de passe différent
          pour chaque service, un gestionnaire de mots de passe (il cite KeePassXC, logiciel libre certifié par
          l'ANSSI dans sa version 2.7.9) et la double authentification partout où elle est proposée.
        </p>
        <p>
          <strong>Avec ce générateur</strong>, les symboles sont les 32 signes de ponctuation du clavier
          américain standard (ASCII), moins que les 37 de l'exemple de la CNIL : 12 caractères de quatre types
          donnent environ 78 bits. Réglez donc 13 caractères ou plus. Le réglage par défaut, 16 caractères,
          dépasse 100 bits. Pour une phrase de passe, la liste de mots compte un peu plus de 1 500 entrées :
          il faut 8 mots pour passer 80 bits.
        </p>
      </Section>

      <Section titre="L'entropie en bits, expliquée">
        <p>
          L'entropie mesure le nombre de mots de passe possibles avec les mêmes réglages, exprimé en puissance
          de 2. Un mot de passe de 16 caractères tiré parmi 94 signes peut prendre 94<sup>16</sup> valeurs, soit
          environ 2<sup>105</sup> : son entropie est de 105 bits. Chaque bit en plus double le nombre d'essais
          qu'un attaquant devrait faire dans le pire des cas. Avec l'option « au moins un de chaque type », le
          calcul compte exactement les combinaisons qui respectent la règle, ce qui retire une fraction de bit.
        </p>
        <p>
          Pour une phrase de passe, chaque mot apporte log<sub>2</sub> de la taille de la liste, environ 10,6 bits
          ici ; le chiffre ajouté apporte la valeur du chiffre et sa position. La majuscule en tête de chaque
          mot n'ajoute rien, puisqu'elle est systématique. Comme le souligne l'ANSSI, ce calcul ne vaut que si
          chaque caractère ou chaque mot est vraiment tiré au hasard : une phrase que vous inventez vous-même,
          une citation ou un mot du dictionnaire modifié valent beaucoup moins que ce que la formule promet.
        </p>
        <p>
          Le hasard vient de <code>crypto.getRandomValues</code>, le générateur cryptographique du navigateur.
          Chaque tirage écarte les valeurs qui fausseraient la répartition (méthode du rejet), si bien que chaque
          caractère a exactement la même probabilité de sortir. Rien n'est envoyé ni enregistré : la page
          fonctionne même hors connexion une fois chargée.
        </p>
      </Section>

      <Section titre="Gestionnaire de mots de passe et double authentification">
        <p>
          Un mot de passe de 16 caractères aléatoires ne se retient pas, et ce n'est pas le but. Le gestionnaire
          de mots de passe (l'ANSSI parle de coffre-fort) les garde chiffrés et les remplit à votre place ; vous
          ne retenez qu'un seul secret, celui qui l'ouvre. C'est là qu'une phrase de passe de 8 mots ou plus
          trouve sa place : longue, robuste et facile à taper.
        </p>
        <p>
          Activez ensuite la double authentification sur les comptes importants (messagerie, banque, impôts,
          réseaux sociaux) : un code reçu ou généré sur le téléphone, ou une clé de sécurité, en plus du mot de
          passe. Une fuite de mot de passe ne suffit plus alors pour entrer. Ne réutilisez jamais un même mot de passe sur
          deux sites : la fuite d'un seul suffirait sinon à ouvrir les autres. Pour d'autres outils de
          texte, voyez le <Link to="/compteur-de-mots/">compteur de mots</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default GenerateurMotDePasse;
