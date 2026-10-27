import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section, Source } from "@/components/outils/OutilLayout";
import {
  OptionsMdp,
  OptionsPhrase,
  TypeCar,
  entropieMotDePasse,
  entropiePhrase,
  genererMotDePasse,
  genererPhrase,
  listeMots,
  niveau,
} from "@/lib/texte-motdepasse";
import { copierTexte } from "@/lib/texte-copier";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le mot de passe généré est-il envoyé ou gardé quelque part ?",
      r: "Non. Il est tiré dans votre navigateur avec crypto.getRandomValues, le générateur de hasard cryptographique de votre appareil, puis affiché. Aucune requête ne part vers un serveur, rien n'est enregistré, pas même dans le stockage local du navigateur. En rechargeant la page, il disparaît : copiez-le aussitôt dans votre gestionnaire de mots de passe ou dans le formulaire du site.",
    },
    {
      q: "Combien de caractères faut-il pour respecter la recommandation de la CNIL ?",
      r: "La CNIL demande 80 bits d'entropie pour un mot de passe utilisé seul. Avec les quatre types de caractères de ce générateur, qui propose 32 symboles, il faut 13 caractères ; sans symboles, 14 caractères mêlant minuscules, majuscules et chiffres suffisent. Le réglage par défaut, 16 caractères, donne environ 104 bits. La jauge sous le mot de passe indique le niveau atteint à chaque changement de réglage.",
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
      q: "Je confonds le 0 et le O en recopiant le mot de passe, comment l'éviter ?",
      r: "Cochez « Exclure les caractères ambigus ». Le chiffre 0 et la lettre O, le chiffre 1, la lettre l minuscule, le I majuscule et la barre verticale se confondent dans beaucoup de polices. Les exclure évite les erreurs quand le mot de passe doit être lu sur un écran puis tapé ailleurs, dicté ou recopié sur un papier. L'entropie baisse un peu, ce que la jauge montre ; ajoutez un caractère pour compenser.",
    },
    {
      q: "À quoi sert l'option « au moins un de chaque type » ?",
      r: "Beaucoup de sites exigent au moins une majuscule, un chiffre et un symbole. Avec l'option cochée, le générateur écarte les tirages qui n'en contiennent pas et en refait un, ce qui garde un tirage uniforme parmi les mots de passe conformes. L'entropie affichée en tient compte : elle est calculée sur le nombre exact de mots de passe qui respectent la règle, donc légèrement plus basse.",
    },
  ],
  en: [
    {
      q: "Is the generated password sent to a server or stored anywhere?",
      r: "No. It is drawn in your browser with crypto.getRandomValues, the cryptographic random number generator of your device, then displayed. No request leaves the page and nothing is saved, not even in the browser's local storage. Reload the page and it is gone, so copy it straight into your password manager or into the sign-up form of the website.",
    },
    {
      q: "How long must a password be to meet the French CNIL guidance?",
      r: "The CNIL, France's data protection authority, asks for 80 bits of entropy for a password used on its own. With the four character types of this generator, which offers 32 symbols, that means 13 characters; without symbols, 14 characters mixing lower case, upper case and digits are enough. The default setting, 16 characters, gives about 104 bits, as the gauge shows.",
    },
    {
      q: "A website rejects my special characters, what should I do?",
      r: "Some sites only accept part of the symbols, or cap the length. Untick Symbols and make the password longer to keep the same strength: without symbols, 14 characters mixing lower case, upper case and digits already reach the CNIL minimum. The gauge recalculates the entropy after every change, so aim for at least 80 bits before you copy it.",
    },
    {
      q: "Passphrase or random password for my password manager?",
      r: "Use a passphrase for the one secret you must remember, such as the master password of the manager or your computer session: eight random English words from this list give about 88 bits and are easy to picture as a little scene. For every other account, let the manager create and store a long random password that you will never have to type.",
    },
    {
      q: "Does adding capitals or a digit make my passphrase much stronger?",
      r: "Capitals at the start of every word add nothing, because an attacker who knows the rule simply applies it. The random digit adds about 6 bits: 3.3 for the digit itself and 3 for its position among eight words. One extra word adds about 11 bits, so lengthening the phrase does far more than decorating it. Keep the capitals and digit only when a website demands them.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "CNIL", titre: "Mots de passe : recommandations pour maîtriser sa sécurité (délibération n° 2022-100 du 21 juillet 2022)", url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite", lu: "27 octobre 2026" },
    { editeur: "ANSSI", titre: "Recommandations relatives à l'authentification multifacteur et aux mots de passe (guide ANSSI-PG-078)", url: "https://messervices.cyber.gouv.fr/guides/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe", lu: "27 octobre 2026" },
    { editeur: "Cybermalveillance.gouv.fr", titre: "Pourquoi et comment bien gérer ses mots de passe ?", url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "CNIL", titre: "Mots de passe : recommandations pour maîtriser sa sécurité (Passwords: recommendations to control your security, deliberation 2022-100)", url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite", lu: "27 October 2026" },
    { editeur: "ANSSI", titre: "Recommandations relatives à l'authentification multifacteur et aux mots de passe (Recommendations on multi-factor authentication and passwords, guide ANSSI-PG-078)", url: "https://messervices.cyber.gouv.fr/guides/recommandations-relatives-lauthentification-multifacteur-et-aux-mots-de-passe", lu: "27 October 2026" },
    { editeur: "Cybermalveillance.gouv.fr", titre: "Pourquoi et comment bien gérer ses mots de passe ? (Why and how to manage your passwords)", url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/mots-de-passe", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Générateur de mot de passe 75tools",
    motsCles: "générateur de mot de passe, créer un mot de passe sécurisé, mot de passe aléatoire fort, générateur de phrase de passe, mot de passe CNIL",
    typeSecret: "Type de secret",
    mdp: "Mot de passe",
    phrase: "Phrase de passe",
    votreMdp: "Votre mot de passe",
    votrePhrase: "Votre phrase de passe",
    cochezType: "Cochez au moins un type de caractères.",
    copier: "Copier",
    nouveau: "Nouveau tirage",
    entropie: "Entropie",
    autres: "Autres propositions",
    copierProp: (n: number) => `Copier la proposition ${n}`,
    copie: (i: number) => (i === 0 ? "Mot de passe copié." : `Proposition ${i + 1} copiée.`),
    copieImpossible: "Copie impossible : sélectionnez-le et copiez-le.",
    longueur: "Longueur (8 à 128 caractères)",
    longueurCurseur: "Longueur",
    longueurChamp: "Longueur en caractères",
    caracteres: "Caractères",
    types: { minuscules: "Minuscules", majuscules: "Majuscules", chiffres: "Chiffres", symboles: "Symboles" } as Record<TypeCar, string>,
    ambigus: "Exclure les caractères ambigus",
    unDeChaque: "Au moins un caractère de chaque type coché",
    nbMots: "Nombre de mots (3 à 20)",
    separateur: "Séparateur",
    separateurs: ["Tiret (-)", "Espace", "Point (.)", "Trait bas (_)", "Aucun"],
    majuscule: "Majuscule au début de chaque mot",
    chiffre: "Ajouter un chiffre",
    accents: "Garder les accents (é, è, ê, ç…)",
    langueMots: "Langue des mots",
    liste: (n: string, b: string) => `Mots tirés dans une liste de ${n} mots courants, soit ${b} bits par mot.`,
    unites: { car: "caractères", mots: "mots" },
    entier: (d: number, u: string) => `Saisissez un nombre entier ; ${d} ${u} en attendant.`,
    min: (m: number, u: string) => `Ramené à ${m} ${u}, le minimum.`,
    max: (m: number, u: string) => `Ramené à ${m} ${u}, le maximum.`,
  },
  en: {
    nomAppli: "75tools password generator",
    motsCles: "password generator, strong password generator, random password generator, passphrase generator, secure password",
    typeSecret: "Kind of secret",
    mdp: "Password",
    phrase: "Passphrase",
    votreMdp: "Your password",
    votrePhrase: "Your passphrase",
    cochezType: "Tick at least one character type.",
    copier: "Copy",
    nouveau: "Generate again",
    entropie: "Entropy",
    autres: "More suggestions",
    copierProp: (n: number) => `Copy suggestion ${n}`,
    copie: (i: number) => (i === 0 ? "Password copied." : `Suggestion ${i + 1} copied.`),
    copieImpossible: "Could not copy: select it and copy it by hand.",
    longueur: "Length (8 to 128 characters)",
    longueurCurseur: "Length",
    longueurChamp: "Length in characters",
    caracteres: "Characters",
    types: { minuscules: "Lower case", majuscules: "Upper case", chiffres: "Digits", symboles: "Symbols" } as Record<TypeCar, string>,
    ambigus: "Leave out look-alike characters",
    unDeChaque: "At least one character of each ticked type",
    nbMots: "Number of words (3 to 20)",
    separateur: "Separator",
    separateurs: ["Hyphen (-)", "Space", "Full stop (.)", "Underscore (_)", "None"],
    majuscule: "Capital letter at the start of each word",
    chiffre: "Add a digit",
    accents: "Keep French accents (é, è, ê, ç…)",
    langueMots: "Word language",
    liste: (n: string, b: string) => `Words drawn from a list of ${n} common words, that is ${b} bits per word.`,
    unites: { car: "characters", mots: "words" },
    entier: (d: number, u: string) => `Enter a whole number; using ${d} ${u} for now.`,
    min: (m: number, u: string) => `Raised to ${m} ${u}, the minimum.`,
    max: (m: number, u: string) => `Lowered to ${m} ${u}, the maximum.`,
  },
};

const EXEMPLES: Record<TypeCar, string> = { minuscules: "a-z", majuscules: "A-Z", chiffres: "0-9", symboles: "! # % & @ …" };
const ORDRE_TYPES: TypeCar[] = ["minuscules", "majuscules", "chiffres", "symboles"];
const SEPARATEURS = ["-", " ", ".", "_", ""];
const NB_PROPOSITIONS = 5;

type Textes = (typeof T)["fr"];

/** Champ entier borné : la valeur hors bornes est ramenée et signalée. */
const lireEntier = (s: string, min: number, max: number, defaut: number, unite: string, t: Textes) => {
  const n = parseInt(s.replace(/\s/g, ""), 10);
  if (s.trim() === "" || !Number.isFinite(n)) return { v: defaut, alerte: s.trim() === "" ? "" : t.entier(defaut, unite) };
  if (n < min) return { v: min, alerte: t.min(min, unite) };
  if (n > max) return { v: max, alerte: t.max(max, unite) };
  return { v: n, alerte: "" };
};

const Case = ({ coche, onChange, children }: { coche: boolean; onChange: (v: boolean) => void; children: ReactNode }) => (
  <label className="flex items-center gap-2 min-h-[2.75rem] cursor-pointer text-sm text-neutral-200">
    <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-sky-400 shrink-0" />
    <span>{children}</span>
  </label>
);

const GenerateurMotDePasse = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const loc = locale(lang);
  const [mode, setMode] = useState<"mdp" | "phrase">("mdp");
  const [longueurSaisie, setLongueurSaisie] = useState("16");
  const [types, setTypes] = useState<TypeCar[]>(["minuscules", "majuscules", "chiffres", "symboles"]);
  const [exclureAmbigus, setExclureAmbigus] = useState(false);
  const [unDeChaque, setUnDeChaque] = useState(true);
  const [nbMotsSaisie, setNbMotsSaisie] = useState("8");
  const [langueMots, setLangueMots] = useState<Langue>(lang);
  const [accents, setAccents] = useState(false);
  const [separateur, setSeparateur] = useState("-");
  const [majuscule, setMajuscule] = useState(true);
  const [chiffre, setChiffre] = useState(true);
  const [propositions, setPropositions] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const longueur = lireEntier(longueurSaisie, 8, 128, 16, t.unites.car, t);
  const nbMots = lireEntier(nbMotsSaisie, 3, 20, 8, t.unites.mots, t);

  const optMdp: OptionsMdp = useMemo(
    () => ({ longueur: longueur.v, types, exclureAmbigus, unDeChaque }),
    [longueur.v, types, exclureAmbigus, unDeChaque]
  );
  const optPhrase: OptionsPhrase = useMemo(
    () => ({ nbMots: nbMots.v, accents: langueMots === "fr" && accents, separateur, majuscule, chiffre, langue: langueMots }),
    [nbMots.v, accents, separateur, majuscule, chiffre, langueMots]
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
  const niv = niveau(bits, lang);
  const tailleListe = listeMots(langueMots, langueMots === "fr" && accents).length;

  const copier = async (s: string, i: number) => {
    const ok = await copierTexte(s);
    setMessage(ok ? t.copie(i) : t.copieImpossible);
  };

  const basculerType = (ty: TypeCar, v: boolean) =>
    setTypes((x) => (v ? ORDRE_TYPES.filter((k) => k === ty || x.includes(k)) : x.filter((k) => k !== ty)));

  const [principal, ...autres] = propositions;

  const outil = (
    <form
      className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr] items-start"
      onSubmit={(e) => e.preventDefault()}
      aria-label={t.typeSecret}
    >
      <div role="group" aria-label={t.typeSecret} className="inline-grid grid-cols-2 justify-self-start rounded-md border border-neutral-700 p-1 gap-1 lg:col-start-1 lg:row-start-1">
        {(["mdp", "phrase"] as const).map((m) => (
          <button
            key={m}
            aria-pressed={mode === m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "h-10 px-4 rounded text-sm font-medium",
              mode === m ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white"
            )}
          >
            {m === "mdp" ? t.mdp : t.phrase}
          </button>
        ))}
      </div>

      <div data-resultat className="min-w-0 space-y-4 lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <div className="rounded-lg border border-sky-400/40 bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400 mb-2">{mode === "mdp" ? t.votreMdp : t.votrePhrase}</p>
          <p
            id="mot-de-passe"
            className="font-mono text-xl sm:text-2xl text-white min-h-[2.25rem] [overflow-wrap:anywhere] select-all"
            translate="no"
          >
            {principal ?? (mode === "mdp" && !types.length ? "" : " ")}
          </p>
          {mode === "mdp" && !types.length && <p className="text-amber-300 text-sm">{t.cochezType}</p>}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Bouton onClick={() => principal && copier(principal, 0)} disabled={!principal}>
              <span className="inline-flex items-center gap-2"><Copy className="w-4 h-4" aria-hidden="true" />{t.copier}</span>
            </Bouton>
            <Bouton secondaire onClick={generer} disabled={mode === "mdp" && !types.length}>
              <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />{t.nouveau}</span>
            </Bouton>
            <span role="status" id="message-copie" className="text-sm text-neutral-400">{message}</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-neutral-300">
                {t.entropie}
                {lang === "fr" ? " : " : ": "}
                <strong id="entropie" className="text-white tabular-nums">{bits.toLocaleString(loc, { maximumFractionDigits: 1 })} bits</strong>
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
            <p className="text-sm text-neutral-400 mb-2">{t.autres}</p>
            <ul className="space-y-2">
              {autres.map((p, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-2 min-w-0">
                  <span className="font-mono text-sm sm:text-base text-neutral-100 flex-1 min-w-0 [overflow-wrap:anywhere]" translate="no">{p}</span>
                  <button
                    type="button"
                    onClick={() => copier(p, i + 1)}
                    className="shrink-0 h-10 w-10 grid place-items-center rounded border border-neutral-700 hover:border-neutral-500"
                    aria-label={t.copierProp(i + 2)}
                  >
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3 rounded-lg border border-neutral-800 p-4 lg:col-start-1 lg:row-start-2">
        {mode === "mdp" ? (
          <>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">{t.longueur}</span>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={Math.min(64, longueur.v)}
                  onChange={(e) => setLongueurSaisie(e.target.value)}
                  className="flex-1 min-w-0 accent-sky-400"
                  aria-label={t.longueurCurseur}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={longueurSaisie}
                  onChange={(e) => setLongueurSaisie(e.target.value)}
                  className={classeChamp + " !w-20 shrink-0 text-center"}
                  aria-label={t.longueurChamp}
                />
              </div>
            </label>
            <p role="status" className="text-xs text-amber-300 empty:hidden">{longueur.alerte}</p>
            <fieldset className="grid sm:grid-cols-2 gap-x-4">
              <legend className="text-sm text-neutral-300 mb-1">{t.caracteres}</legend>
              {ORDRE_TYPES.map((ty) => (
                <Case key={ty} coche={types.includes(ty)} onChange={(v) => basculerType(ty, v)}>
                  {t.types[ty]} <span className="text-neutral-500">{EXEMPLES[ty]}</span>
                </Case>
              ))}
            </fieldset>
            <Case coche={exclureAmbigus} onChange={setExclureAmbigus}>
              {t.ambigus} <span className="text-neutral-500 font-mono">0 O o 1 l I | ' " `</span>
            </Case>
            <Case coche={unDeChaque} onChange={setUnDeChaque}>
              {t.unDeChaque}
            </Case>
          </>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">{t.nbMots}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nbMotsSaisie}
                  onChange={(e) => setNbMotsSaisie(e.target.value)}
                  className={classeChamp}
                />
              </label>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">{t.separateur}</span>
                <select value={separateur} onChange={(e) => setSeparateur(e.target.value)} className={classeSelect}>
                  {SEPARATEURS.map((s, i) => (
                    <option key={i} value={s}>{t.separateurs[i]}</option>
                  ))}
                </select>
              </label>
            </div>
            <p role="status" className="text-xs text-amber-300 empty:hidden">{nbMots.alerte}</p>
            {lang === "en" && (
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">{t.langueMots}</span>
                <select value={langueMots} onChange={(e) => setLangueMots(e.target.value as Langue)} className={classeSelect}>
                  <option value="en">English</option>
                  <option value="fr">French (français)</option>
                </select>
              </label>
            )}
            <Case coche={majuscule} onChange={setMajuscule}>{t.majuscule}</Case>
            <Case coche={chiffre} onChange={setChiffre}>{t.chiffre}</Case>
            {langueMots === "fr" && <Case coche={accents} onChange={setAccents}>{t.accents}</Case>}
            <p className="text-xs text-neutral-500">
              {t.liste(tailleListe.toLocaleString(loc), Math.log2(tailleListe).toLocaleString(loc, { maximumFractionDigits: 1 }))}
            </p>
          </>
        )}
      </div>
    </form>
  );

  return (
    <PageOutil
      id="generateur-mot-de-passe"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="SecurityApplication"
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
    <Section titre="Générateur de mot de passe : un mot de passe fort en un clic">
      <p>
        Ce générateur de mot de passe affiche un mot de passe fort dès l'ouverture de la page : 16 caractères tirés au
        hasard parmi les minuscules, les majuscules, les chiffres et 32 symboles, soit environ 104 bits d'entropie,
        bien au-delà des 80 bits que la CNIL exige pour un mot de passe utilisé seul. Pour l'utiliser, réglez la
        longueur avec le curseur, décochez les symboles si le site les refuse, puis cliquez sur « Copier » et collez le
        résultat dans le formulaire ou dans votre gestionnaire de mots de passe. L'onglet « Phrase de passe » tire des
        mots français : 8 mots dans une liste de 1 553 donnent près de 85 bits et se retiennent mieux. La jauge indique
        le niveau atteint à chaque réglage. La limite : un mot de passe aléatoire ne se mémorise pas, il faut un
        gestionnaire pour le garder.
      </p>
    </Section>

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
        pour chaque service, un gestionnaire de mots de passe et la double authentification partout où elle est
        proposée.
      </p>
      <p>
        <strong>Avec ce générateur</strong>, les symboles sont les 32 signes de ponctuation du clavier
        américain standard (ASCII), moins que les 37 de l'exemple de la CNIL : 12 caractères de quatre types
        donnent environ 78 bits. Réglez donc 13 caractères ou plus. Le réglage par défaut, 16 caractères,
        dépasse 100 bits. Pour une phrase de passe, la liste compte 1 553 mots : il faut 8 mots pour passer
        80 bits, un de plus que l'équivalent donné par la CNIL, qui suppose une liste plus longue.
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
        passe. Une fuite de mot de passe ne suffit plus alors pour entrer. Ne réutilisez jamais un même mot de
        passe sur deux sites : la fuite d'un seul suffirait sinon à ouvrir les autres. Pour vérifier la longueur
        d'un texte, voyez le <Link to="/compteur-de-mots/">compteur de mots</Link> ; pour entraîner vos doigts
        avant de taper une longue phrase de passe, le <Link to="/test-vitesse-de-frappe/">test de vitesse de
        frappe</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Password generator: a strong password in one click">
      <p>
        This password generator shows a strong password as soon as the page opens: 16 characters drawn at random from
        lower case, upper case, digits and 32 symbols, about 104 bits of entropy, well above the 80 bits that the CNIL,
        France's data protection authority, requires for a password used on its own. To use it, set the length with the
        slider, untick Symbols if the website rejects them, then click Copy and paste the result into the sign-up form
        or your password manager. The Passphrase tab draws common English words instead: 8 words from a list of 2,138
        give about 88 bits and are much easier to remember and type. The gauge shows the level reached after every
        change. The main limit: a random password cannot be memorised, so you need a password manager to keep it.
      </p>
    </Section>

    <Section titre="What French authorities recommend, and what it means for you">
      <p>
        If you live or work in France, two public bodies set the reference. The <strong>CNIL</strong> (Commission
        nationale de l'informatique et des libertés, the data protection regulator) published deliberation 2022-100 on
        21 July 2022. For a password used alone, it sets a minimum of <strong>80 bits of entropy</strong> and gives
        equivalents: at least 12 characters with upper case, lower case, digits and special characters taken from a set
        of at least 37 signs; at least 14 characters with upper case, lower case and digits; or a passphrase of at least
        7 words. The threshold drops to 50 bits when the site limits the number of attempts.
      </p>
      <p>
        The <strong>ANSSI</strong> (Agence nationale de la sécurité des systèmes d'information, the national
        cybersecurity agency) links length and strength in its 2021 guide for a 90-character set: 9 to 11 characters for
        about 65 bits, 12 to 14 for about 85 bits, 15 or more for 100 bits and above. For passwords that never need to be
        remembered, it recommends a very long length, for example more than 20 characters, and it describes passphrases
        as a good alternative. Cybermalveillance.gouv.fr, the government victim support service, adds one password per
        account, a password manager and two-factor authentication wherever it is offered.
      </p>
      <p>
        <strong>With this generator</strong>, the symbols are the 32 punctuation signs of a standard US keyboard
        (ASCII), fewer than the 37 in the CNIL example, so 12 characters of four types give about 78 bits: choose 13 or
        more. For a passphrase, each word from the English list brings 11.1 bits, so 8 words pass 80 bits, one more than
        the CNIL equivalent, which assumes a longer dictionary. Use this on accounts that matter in France too: your
        impots.gouv.fr tax space, your ameli health insurance account or your bank.
      </p>
    </Section>

    <Section titre="Entropy in bits, explained">
      <p>
        Entropy counts how many passwords are possible with the same settings, expressed as a power of 2. A
        16-character password drawn from 94 signs can take 94<sup>16</sup> values, about 2<sup>105</sup>, so its entropy
        is 105 bits. Each extra bit doubles the number of guesses an attacker would need in the worst case. With the
        option "at least one of each type", the tool counts exactly the combinations that follow the rule, which removes
        a fraction of a bit.
      </p>
      <p>
        For a passphrase, each word adds log<sub>2</sub> of the list size; the digit adds its value and its position.
        A capital letter at the start of every word adds nothing because it is systematic. As the ANSSI points out, this
        sum only holds if every character or word is truly random: a sentence you make up, a quotation or a dictionary
        word with a few letters swapped is worth far less than the formula suggests.
      </p>
      <p>
        Randomness comes from <code>crypto.getRandomValues</code>, the browser's cryptographic generator, with
        rejection sampling so every character has exactly the same chance of coming out. Nothing is sent or stored, and
        the page keeps working offline once loaded.
      </p>
    </Section>

    <Section titre="Password managers and two-factor authentication">
      <p>
        Nobody remembers 16 random characters, and that is not the goal. A password manager keeps them encrypted and fills
        them in for you; you only remember the one secret that opens it, which is where an 8-word passphrase belongs.
        Then turn on two-factor authentication for email, banking and government accounts such as FranceConnect, so a
        leaked password is no longer enough to get in. Never reuse a password on two sites. To practise typing a long
        passphrase, try the <Link to="/en/typing-speed-test/">typing speed test</Link>, and to check the length of a text,
        use the <Link to="/en/word-counter/">word counter</Link>.
      </p>
    </Section>
  </>
);

export default GenerateurMotDePasse;
