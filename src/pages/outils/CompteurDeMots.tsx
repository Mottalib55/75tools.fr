import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section, Source } from "@/components/outils/OutilLayout";
import {
  VITESSES,
  compterMots,
  compterMotsElisionsSeparees,
  compterParagraphes,
  formatDuree,
  graphemes,
  listePhrases,
  motsFrequents,
  motsLongs,
  nombreLangue,
} from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je trouve un mot de plus ou de moins que Word, qui a raison ?",
      r: "Aucun des deux n'a tort : l'écart vient de la règle choisie pour les cas limites. Les aides de Microsoft et de Google n'expliquent pas comment Word et Google Docs traitent apostrophes, traits d'union ou nombres à espaces. Ici, la règle est écrite sur la page. Si votre limite est contrôlée dans un logiciel précis, vérifiez le total final dans ce logiciel, en gardant une petite marge.",
    },
    {
      q: "« L'homme » compte pour un mot ou pour deux ?",
      r: "Pour un mot dans le total principal, car il est écrit d'un seul tenant, sans espace. Grammaticalement, « l' » est pourtant un article élidé : c'est pourquoi le compteur affiche aussi un second total où les élisions (l', d', j', qu', jusqu'…) comptent à part. « Aujourd'hui » reste un seul mot dans les deux totaux, car ce n'est pas une élision.",
    },
    {
      q: "Ma lettre de motivation est limitée à 300 mots, comment ne pas dépasser ?",
      r: "Inscrivez 300 dans le champ « Limite de mots » : la jauge indique ce qu'il reste, puis le dépassement en rouge. Collez le corps de la lettre seulement si la consigne ne compte ni l'en-tête ni la formule de politesse. Pour gagner des mots, supprimez d'abord les répétitions que montre la liste des mots fréquents, puis les adverbes et les tournures passives.",
    },
    {
      q: "Mon texte est-il envoyé quelque part pendant le comptage ?",
      r: "Non. Le comptage est fait par votre navigateur, sur votre appareil, à chaque frappe : aucun texte ne part vers un serveur et rien n'est enregistré. Vous pouvez donc y coller un mémoire inédit, un dossier de candidature ou un document confidentiel. En fermant l'onglet, le texte disparaît ; gardez-en une copie dans votre traitement de texte.",
    },
    {
      q: "Combien de temps faut-il pour lire un texte de 1 000 mots ?",
      r: "Environ 4 minutes 40 en lecture silencieuse et 5 minutes 33 à voix haute, pour un texte en français lu à la vitesse moyenne d'un adulte : 214 et 180 mots par minute selon la synthèse de Marc Brysbaert. En anglais, comptez plutôt 4 minutes 12, car on y lit environ 238 mots par minute. Un texte technique ou rempli de chiffres prend nettement plus longtemps.",
    },
    {
      q: "Je rédige en anglais, puis-je utiliser le même compteur ?",
      r: "Oui. Choisissez « Anglais » au-dessus de la zone de texte : le nombre de mots ne change pas, car « don't » ou « it's » comptent déjà pour un mot, mais le temps de lecture passe à 238 mots par minute en silence et 183 à voix haute, et les mots fréquents écartent les mots vides anglais (the, and, of). Le total qui sépare les élisions françaises disparaît, puisqu'il n'a plus de sens.",
    },
  ],
  en: [
    {
      q: "Does \"don't\" or \"it's\" count as one word or two?",
      r: "One. A contraction is written as a single unit with no space, so the main total counts \"don't\", \"it's\", \"we'll\" and \"o'clock\" as one word each, which is also how Word and Google Docs behave on ordinary text. The apostrophe, straight or curly, only joins letters on both sides; a quote mark at the start or end of a word is ignored.",
    },
    {
      q: "My word count is different from Word's, which one is right?",
      r: "Neither is wrong: the difference comes from edge cases. Microsoft and Google explain where to find the count but not how they treat hyphens, numbers written with spaces or symbols. This page states its rule openly. If a university, a journal or a French administrative form checks your limit with a given program, check the final figure there and keep a few words of margin.",
    },
    {
      q: "How long does it take to read 1,000 words aloud?",
      r: "About 5 minutes 28 seconds for an English text at 183 words per minute, the average oral reading rate in Marc Brysbaert's 2019 review of 77 studies. Silent reading is faster, around 4 minutes 12 at 238 words per minute. Treat both as floors for a speech: pauses, questions and slides add time, so rehearse once with a stopwatch to get your own pace.",
    },
    {
      q: "I write in French too, can I count a French text here?",
      r: "Yes. Pick \"French\" above the text box: the reading time switches to 214 words per minute silent and 180 aloud, the French figures in Brysbaert's table, and a second total appears where elisions such as l', d' or qu' count as separate words. That second figure helps when a French teacher or a jury counts \"l'homme\" as two words.",
    },
    {
      q: "Is my text sent anywhere while it is counted?",
      r: "No. Your browser does the counting on your device at every keystroke: nothing goes to a server and nothing is stored. You can paste an unpublished thesis, a cover letter for a French employer or a confidential report. When you close the tab the text is gone, so keep a copy in your word processor before you leave the page.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Unicode Consortium", titre: "UAX #29: Unicode Text Segmentation (découpage en mots et en phrases)", url: "https://www.unicode.org/reports/tr29/", lu: "27 octobre 2026" },
    { editeur: "Assistance Microsoft", titre: "Afficher les statistiques (nombre de mots dans Word)", url: "https://support.microsoft.com/fr-fr/office/afficher-le-nombre-de-mots-3c9e6a11-a04d-43b4-977c-563a0e0d5da3", lu: "27 octobre 2026" },
    { editeur: "Aide Éditeurs Google Docs", titre: "Compter le nombre de mots d'un document", url: "https://support.google.com/docs/answer/39003?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Journal of Memory and Language", titre: "Marc Brysbaert, How many words do we read per minute? A review and meta-analysis of reading rate (2019)", url: "https://doi.org/10.1016/j.jml.2019.104047", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Unicode Consortium", titre: "UAX #29: Unicode Text Segmentation", url: "https://www.unicode.org/reports/tr29/", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Show word count", url: "https://support.microsoft.com/en-us/office/show-word-count-3c9e6a11-a04d-43b4-977c-563a0e0d5da3", lu: "27 October 2026" },
    { editeur: "Google Docs Editors Help", titre: "Count the words in a document", url: "https://support.google.com/docs/answer/39003?hl=en", lu: "27 October 2026" },
    { editeur: "Journal of Memory and Language", titre: "Marc Brysbaert, How many words do we read per minute? A review and meta-analysis of reading rate (2019)", url: "https://doi.org/10.1016/j.jml.2019.104047", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Compteur de mots 75tools",
    motsCles: "compteur de mots, compter les mots d'un texte, combien de mots dans mon texte, nombre de mots, compteur de mots en ligne",
    langueTexte: "Langue du texte",
    fr: "Français",
    en: "Anglais",
    votreTexte: "Votre texte",
    placeholder: "Collez ou tapez votre texte ici.",
    copier: "Copier le texte",
    copie: "Texte copié.",
    copieKo: "Copie impossible : sélectionnez le texte et copiez-le.",
    effacer: "Effacer",
    mots: "Mots",
    attente: "Le nombre de mots s'affiche ici dès la première frappe.",
    elisions: (n: string) => `${n} en comptant les élisions à part (l', d', qu'…)`,
    car: "Caractères",
    espacesCompris: "espaces compris",
    sansEspaces: "Sans espaces",
    caracteres: "caractères",
    phrases: "Phrases",
    parPhrase: (n: string) => `${n} mots par phrase`,
    paragraphes: "Paragraphes",
    lecture: "Lecture silencieuse",
    voix: "Lecture à voix haute",
    parMinute: (n: number) => `${n} mots par minute`,
    limite: "Limite de mots (facultatif)",
    entier: "Saisissez un nombre entier de mots, par exemple 500.",
    min1: "La limite a été ramenée à 1 mot, la plus petite valeur possible.",
    max: "La limite a été ramenée à 1 000 000 de mots.",
    restants: (e: number, ef: string, lf: string) => `${ef} mot${e > 1 ? "s" : ""} restant${e > 1 ? "s" : ""} sur ${lf}`,
    deTrop: (e: number, ef: string, lf: string) => `${ef} mot${e > 1 ? "s" : ""} de trop (limite ${lf})`,
    frequents: "Mots les plus fréquents",
    frequentsVide: "Ils apparaîtront ici, hors mots vides (le, de, et, que…).",
    longs: "Mots les plus longs",
    longsVide: "Les cinq mots les plus longs de votre texte.",
    lettres: "lettres",
  },
  en: {
    nomAppli: "75tools word counter",
    motsCles: "word counter, word count, count words online, how many words, reading time calculator",
    langueTexte: "Text language",
    fr: "French",
    en: "English",
    votreTexte: "Your text",
    placeholder: "Paste or type your text here.",
    copier: "Copy text",
    copie: "Text copied.",
    copieKo: "Copy failed: select the text and copy it yourself.",
    effacer: "Clear",
    mots: "Words",
    attente: "The word count shows here from the first keystroke.",
    elisions: (n: string) => `${n} with French elisions split (l', d', qu'…)`,
    car: "Characters",
    espacesCompris: "with spaces",
    sansEspaces: "No spaces",
    caracteres: "characters",
    phrases: "Sentences",
    parPhrase: (n: string) => `${n} words per sentence`,
    paragraphes: "Paragraphs",
    lecture: "Silent reading",
    voix: "Reading aloud",
    parMinute: (n: number) => `${n} words per minute`,
    limite: "Word limit (optional)",
    entier: "Enter a whole number of words, for example 500.",
    min1: "The limit was raised to 1 word, the smallest possible value.",
    max: "The limit was capped at 1,000,000 words.",
    restants: (e: number, ef: string, lf: string) => `${ef} word${e > 1 ? "s" : ""} left out of ${lf}`,
    deTrop: (e: number, ef: string, lf: string) => `${ef} word${e > 1 ? "s" : ""} over (limit ${lf})`,
    frequents: "Most frequent words",
    frequentsVide: "They will show here, without filler words (the, of, and, le, de…).",
    longs: "Longest words",
    longsVide: "The five longest words in your text.",
    lettres: "letters",
  },
};

const Stat = ({ libelle, valeur, aide }: { libelle: string; valeur: string; aide?: string }) => (
  <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 min-w-0">
    <p className="text-xs text-neutral-500">{libelle}</p>
    <p className="text-lg font-semibold text-white tabular-nums [overflow-wrap:anywhere]">{valeur}</p>
    {aide && <p className="text-xs text-neutral-500">{aide}</p>}
  </div>
);

const CompteurDeMots = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [texte, setTexte] = useState("");
  const [langueTexte, setLangueTexte] = useState<Langue>(lang);
  const [limiteSaisie, setLimiteSaisie] = useState("");
  const [copie, setCopie] = useState("");
  const d = useDeferredValue(texte);
  const nb = (n: number) => nombreLangue(n, lang);
  const v = VITESSES[langueTexte];

  const r = useMemo(() => {
    const mots = compterMots(d);
    const g = graphemes(d);
    const phrases = listePhrases(d).length;
    return {
      mots,
      motsElisions: compterMotsElisionsSeparees(d),
      car: g.length,
      carSansEspaces: g.filter((c) => !/^\s+$/u.test(c)).length,
      phrases,
      paragraphes: compterParagraphes(d),
      moyenne: phrases ? mots / phrases : 0,
      frequents: motsFrequents(d, 10, langueTexte),
      longs: motsLongs(d, 5),
    };
  }, [d, langueTexte]);

  const limiteNombre = parseInt(limiteSaisie.replace(/[\s,.  ]/g, ""), 10);
  let alerteLimite = "";
  let limite = 0;
  if (limiteSaisie.trim() !== "") {
    if (!Number.isFinite(limiteNombre) || /[^\d\s,.  ]/.test(limiteSaisie)) alerteLimite = t.entier;
    else if (limiteNombre < 1) {
      limite = 1;
      alerteLimite = t.min1;
    } else if (limiteNombre > 1000000) {
      limite = 1000000;
      alerteLimite = t.max;
    } else limite = limiteNombre;
  }
  const ratio = limite ? Math.min(1, r.mots / limite) : 0;
  const ecart = limite - r.mots;

  const outil = (
    <>
      <div className="grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] items-start">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-neutral-300" id="langue-texte">{t.langueTexte}</span>
            <div className="inline-grid grid-cols-2 gap-1 rounded-md border border-neutral-700 p-1" role="group" aria-labelledby="langue-texte">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={langueTexte === l}
                  onClick={() => setLangueTexte(l)}
                  className={cn("h-9 px-3 rounded text-sm font-medium", langueTexte === l ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white")}
                >
                  {t[l]}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="sr-only">{t.votreTexte}</span>
            <textarea
              id="texte-a-compter"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              rows={8}
              spellCheck
              lang={langueTexte}
              placeholder={t.placeholder}
              className={classeZoneTexte + " min-h-[11rem] lg:min-h-[22rem] text-base leading-relaxed resize-y"}
            />
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <Bouton secondaire disabled={!texte} onClick={async () => setCopie((await copierTexte(texte)) ? t.copie : t.copieKo)}>
              {t.copier}
            </Bouton>
            <Bouton secondaire disabled={!texte} onClick={() => (setTexte(""), setCopie(""))}>
              {t.effacer}
            </Bouton>
            <span role="status" className="text-sm text-neutral-400">{copie}</span>
          </div>
        </div>

        <div className="min-w-0 space-y-3 lg:sticky lg:top-4">
          <div data-resultat aria-live="polite" className="rounded-lg border border-sky-400/40 bg-neutral-900 px-4 py-3">
            <p className="text-sm text-neutral-400">{t.mots}</p>
            <p id="nb-mots" className="text-4xl font-semibold text-white tabular-nums">{nb(r.mots)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {r.mots === 0 ? t.attente : langueTexte === "fr" ? t.elisions(nb(r.motsElisions)) : t.parMinute(v.lecture)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat libelle={t.car} valeur={nb(r.car)} aide={t.espacesCompris} />
            <Stat libelle={t.sansEspaces} valeur={nb(r.carSansEspaces)} aide={t.caracteres} />
            <Stat libelle={t.phrases} valeur={nb(r.phrases)} aide={r.phrases ? t.parPhrase(r.moyenne.toLocaleString(locale(lang), { maximumFractionDigits: 1 })) : undefined} />
            <Stat libelle={t.paragraphes} valeur={nb(r.paragraphes)} />
            <Stat libelle={t.lecture} valeur={formatDuree(r.mots / v.lecture, lang)} aide={t.parMinute(v.lecture)} />
            <Stat libelle={t.voix} valeur={formatDuree(r.mots / v.voix, lang)} aide={t.parMinute(v.voix)} />
          </div>
          <div>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">{t.limite}</span>
              <input
                type="text"
                inputMode="numeric"
                value={limiteSaisie}
                onChange={(e) => setLimiteSaisie(e.target.value)}
                placeholder="500"
                className={classeChamp}
              />
            </label>
            <p role="status" className="text-xs text-amber-300 mt-1 empty:hidden">{alerteLimite}</p>
            {limite > 0 && (
              <div className="mt-2">
                <div className="h-2 rounded bg-neutral-800 overflow-hidden" aria-hidden="true">
                  <div className={"h-full " + (ecart < 0 ? "bg-red-500" : "bg-sky-400")} style={{ width: `${ratio * 100}%` }} />
                </div>
                <p className={"text-sm mt-1 " + (ecart < 0 ? "text-red-300" : "text-neutral-400")}>
                  {ecart >= 0 ? t.restants(ecart, nb(ecart), nb(limite)) : t.deTrop(-ecart, nb(-ecart), nb(limite))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white mb-2">{t.frequents}</h2>
          {r.frequents.length ? (
            <ol className="space-y-1 text-sm">
              {r.frequents.map((f) => (
                <li key={f.mot} className="flex justify-between gap-3 border-b border-neutral-800 py-1">
                  <span className="[overflow-wrap:anywhere]">{f.mot}</span>
                  <span className="tabular-nums text-neutral-400">{nb(f.nb)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-500">{t.frequentsVide}</p>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white mb-2">{t.longs}</h2>
          {r.longs.length ? (
            <ul className="space-y-1 text-sm">
              {r.longs.map((m) => (
                <li key={m} className="flex justify-between gap-3 border-b border-neutral-800 py-1">
                  <span className="[overflow-wrap:anywhere]">{m}</span>
                  <span className="tabular-nums text-neutral-400">{nb([...m].length)} {t.lettres}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">{t.longsVide}</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <PageOutil
      id="compteur-de-mots"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
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
    <Section titre="Compteur de mots : combien de mots compte votre texte">
      <p>
        Ce compteur de mots donne le nombre de mots de votre texte dès que vous le collez ou le tapez dans la zone
        ci-dessus : le total s'affiche en grand dans le cadre de droite, avec les caractères avec et sans espaces, les
        phrases, les paragraphes et le temps de lecture. Exemple concret : « L'homme qu'on voit aujourd'hui porte un
        porte-monnaie de 1 234,5 euros. » compte 10 mots, et 12 si l'on sépare les élisions l' et qu'. Une lettre de
        motivation de 300 mots se lit en 1 min 24 s en silence. Inscrivez votre limite (300, 500, 1 000 mots) dans le
        champ prévu pour voir ce qu'il vous reste. Le comptage se fait dans votre navigateur et rien n'est envoyé. La
        limite principale tient aux cas litigieux, traits d'union et nombres à espaces, que Word ou Google Docs
        peuvent compter autrement : quelques mots d'écart sur une page sont normaux.
      </p>
    </Section>

    <Section titre="Comment le compteur compte les mots">
      <p>
        Un mot est ici une suite de lettres ou de chiffres, dans l'esprit des règles de découpage d'Unicode (annexe
        UAX #29). Les espaces et la ponctuation séparent les mots ; un signe isolé (tiret, deux-points, point
        d'exclamation, guillemet, emoji) ne compte pas. Trois signes ne coupent pas un mot quand ils sont placés entre
        deux lettres : l'apostrophe, droite ou courbe, le trait d'union et le trait d'union insécable. La virgule et le
        point ne coupent pas un nombre, et les espaces de milliers non plus : « 1 234,5 » reste un seul mot.
      </p>
      <p>
        Le total principal suit l'écriture : ce qui est attaché compte pour un, « porte-monnaie » comme
        « aujourd'hui ». Le second total sépare les élisions (l', d', j', m', n', s', t', c', qu', jusqu', lorsqu',
        puisqu', quoiqu'), plus proche de l'analyse grammaticale que certains enseignants appliquent. Les phrases se
        terminent par un point, un point d'exclamation, un point d'interrogation, des points de suspension ou un
        retour à la ligne, sauf après une abréviation courante (M., Mme, p., cf., av. J.-C.) ou une initiale. Un
        paragraphe est une ligne qui contient au moins un mot.
      </p>
      <p>
        <strong>Et Word, et Google Docs ?</strong> Leurs pages d'aide expliquent où trouver le nombre de mots (barre
        d'état de Word, menu Outils de Google Docs) mais ne disent pas comment sont traités apostrophes, traits d'union
        ou nombres avec espaces. Seule précision publiée : Google Docs exclut les en-têtes, pieds de page et notes de
        bas de page du total. Pour un nombre de signes précis, utilisez le{" "}
        <Link to="/compteur-de-caracteres/">compteur de caractères avec et sans espaces</Link>.
      </p>
    </Section>

    <Section titre="Temps de lecture et de parole : d'où viennent les vitesses">
      <p>
        Le temps de lecture divise le nombre de mots par une vitesse moyenne. Les chiffres retenus viennent de la
        synthèse de Marc Brysbaert (université de Gand), publiée en 2019 dans le Journal of Memory and Language, qui
        reprend 190 études. Pour le français, son tableau par langue donne en moyenne <strong>214 mots par minute en
        lecture silencieuse</strong> et <strong>180 mots par minute à voix haute</strong>. En anglais, la moyenne est
        de 238 mots par minute pour un texte documentaire et de 183 à voix haute : choisissez « Anglais » au-dessus du
        texte pour appliquer ces vitesses.
      </p>
      <p>
        Ces durées sont des moyennes, pas des promesses. Un texte technique, rempli de chiffres ou de termes rares, se
        lit plus lentement ; un récit simple plus vite. Pour un discours ou une soutenance, le temps à voix haute est
        un plancher : il ne compte ni les pauses, ni les respirations, ni les diapositives. Répétez à voix haute avec
        un <Link to="/chronometre/">chronomètre en ligne</Link> pour connaître votre propre vitesse.
      </p>
    </Section>

    <Section titre="Dissertation, mémoire, article : tenir une limite de mots">
      <p>
        Beaucoup de consignes s'expriment en mots : une lettre de motivation de 300 mots, une question de dossier
        d'école, un article de 800 mots, un résumé de mémoire de 250 mots. Lisez bien ce que la consigne inclut :
        titre, notes, citations, bibliographie et annexes sont parfois exclus du compte. Collez seulement la partie
        concernée.
      </p>
      <p>
        Pour raccourcir, la liste des mots les plus fréquents aide à repérer les répétitions ; la moyenne de mots par
        phrase signale des phrases trop longues, qui se relisent souvent mieux coupées en deux. Pour allonger un texte
        trop court, développez un exemple plutôt que de délayer. Enfin, si un formulaire en ligne compte lui-même,
        c'est son compteur qui fait foi : gardez quelques mots de marge.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Word counter: how many words are in your text">
      <p>
        This word counter gives the number of words in your text as soon as you paste or type it into the box above:
        the total shows in large type on the right, with characters with and without spaces, sentences, paragraphs and
        reading time. A concrete example: "I don't think it's ready. The cat's toy cost £12.50, didn't it? Yes." counts
        13 words and 3 sentences, because contractions such as "don't" and "it's" are single words and "12.50" is one
        number. A 500-word cover letter takes about 2 minutes 6 seconds to read silently at 238 words per minute. Type
        your limit (250, 500, 1,000 words) in the field provided to see how many words you have left. Everything is
        counted in your browser and nothing is uploaded. The main limit is edge cases, hyphens and numbers written
        with spaces, which Word or Google Docs may count differently: a few words of difference per page is normal.
      </p>
    </Section>

    <Section titre="How the counter decides what a word is">
      <p>
        A word here is a run of letters or digits, in the spirit of the Unicode word boundary rules (annex UAX #29).
        Spaces and punctuation separate words; a lone sign such as a dash, a colon, an exclamation mark, a quote mark
        or an emoji does not count. Three signs do not split a word when they sit between two letters: the apostrophe,
        straight or curly, the hyphen and the non-breaking hyphen. So "don't", "o'clock", "well-known" and
        "mother-in-law" are one word each. A comma or a full stop inside a number does not split it either, and nor
        does the thin space the French use for thousands: "1 234,5" stays one word.
      </p>
      <p>
        Sentences end with a full stop, an exclamation mark, a question mark, an ellipsis or a line break, except after
        a common abbreviation (Mr., Mrs., Dr., e.g., i.e., vs.) or an initial. A paragraph is any line holding at least
        one word. If you write in French as well, switch the text language to French: a second total then counts
        elisions such as l' or qu' as separate words, the way some French teachers do.
      </p>
      <p>
        <strong>What about Word and Google Docs?</strong> Their help pages explain where to find the count (the status
        bar in Word, the Tools menu in Google Docs) but not how they handle hyphens or numbers with spaces. The only
        documented detail is that Google Docs leaves headers, footers and footnotes out. For an exact number of
        characters, use the <Link to="/en/character-counter/">character counter with and without spaces</Link>.
      </p>
    </Section>

    <Section titre="Reading and speaking time: where the speeds come from">
      <p>
        Reading time divides the word count by an average speed. The figures come from Marc Brysbaert's 2019 review in
        the Journal of Memory and Language, which pooled 190 studies of silent reading. For English it gives an
        average of <strong>238 words per minute for non-fiction</strong> (260 for fiction, with most adults between 175
        and 300) and <strong>183 words per minute when reading aloud</strong>. For a French text, choose French above
        the box: the speeds drop to 214 and 180 words per minute, the French values in the same review.
      </p>
      <p>
        These are averages, not promises. A technical text full of figures reads more slowly, a simple story faster.
        For a speech, a job interview presentation or a viva, the aloud time is a minimum: pauses, breaths and slides
        come on top. Rehearse once with an <Link to="/en/stopwatch/">online stopwatch</Link> to learn your own pace.
      </p>
    </Section>

    <Section titre="Essays, applications and French forms: staying under a limit">
      <p>
        Word limits are everywhere: a 300-word personal statement, a 500-word cover letter for a French employer, a
        250-word abstract for a master's thesis at a French university, an 800-word article. Check what the brief
        includes: titles, footnotes, quotations, references and appendices are often left out of the count, so paste
        only the part that counts.
      </p>
      <p>
        To cut words, the list of most frequent words shows repetitions, and the average words per sentence flags
        sentences that read better split in two. To lengthen a short text, develop an example rather than padding it.
        If an online form counts words itself, its counter is the one that matters: keep a small margin.
      </p>
    </Section>
  </>
);

export default CompteurDeMots;
