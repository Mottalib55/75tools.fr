import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section, Source } from "@/components/outils/OutilLayout";
import { LangueLorem, Unite, enHtml, genererLorem } from "@/lib/texte-lorem";
import { compterMots, nombreLangue } from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";
import { type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Le lorem ipsum veut-il dire quelque chose en latin ?",
      r: "Pas vraiment. Il part d'un vrai passage de Cicéron, mais coupé en plein mot : « lorem » est la fin de « dolorem », la douleur. Les versions courantes mélangent ensuite des mots latins réels et des fragments déformés, sans grammaire suivie. Un latiniste y reconnaît des mots, pas un sens. C'est précisément ce qu'on attend d'un faux texte : avoir l'allure d'une langue sans détourner l'attention vers le contenu.",
    },
    {
      q: "Je prépare une maquette pour un client français, latin ou faux texte en français ?",
      r: "Le faux texte en français donne une image plus juste de la page finale : longueur des mots, accents, apostrophes et coupures de lignes ressemblent à ce que le site affichera. Le latin a l'avantage d'être reconnu tout de suite comme provisoire, ce qui évite qu'on le relise ou qu'on le publie par erreur. Pour une validation de mise en page, le français est en général plus parlant.",
    },
    {
      q: "Comment insérer le texte dans une page HTML ou un CMS ?",
      r: "Cochez l'option des balises de paragraphe : chaque paragraphe est entouré de balises de paragraphe, prêtes à coller dans le code d'une page ou dans le mode HTML d'un éditeur comme WordPress. Sans cette option, les paragraphes sont séparés par une ligne vide, ce qui convient à un traitement de texte, à Figma, à InDesign ou à un champ de formulaire. Le bouton Copier prend le texte dans la forme affichée.",
    },
    {
      q: "Le faux texte en français est-il copié d'un livre ?",
      r: "Non. Les phrases sont assemblées au hasard à partir d'un vocabulaire et de modèles de phrases écrits pour 75tools : un sujet, un verbe, un complément, parfois une précision de temps ou de but. Le résultat est grammaticalement correct mais ne veut rien dire de précis. Il ne reprend aucun texte existant, vous pouvez donc l'utiliser librement dans vos maquettes.",
    },
    {
      q: "Combien de paragraphes de lorem ipsum faut-il pour remplir une page A4 ?",
      r: "Comptez environ 5 paragraphes. Une page A4 en corps 11 ou 12 avec des marges normales contient de 400 à 500 mots, et un paragraphe généré ici en fait une soixantaine en moyenne, selon le tirage. Pour viser juste, choisissez plutôt « mots » et demandez 450 mots : le compteur au-dessus du texte affiche le total exact, caractères compris, avant que vous copiiez.",
    },
    {
      q: "Le faux texte peut-il gêner un lecteur d'écran sur un site en ligne ?",
      r: "Oui, s'il reste publié. Un lecteur d'écran lit le latin avec la voix de la langue de la page, ce qui donne une suite de sons incompréhensibles. Les règles d'accessibilité du W3C demandent de déclarer la langue d'un passage qui change de langue : l'aperçu de l'outil porte l'attribut lang=\"la\". Le mieux reste de remplacer tout faux texte avant la mise en ligne.",
    },
  ],
  en: [
    {
      q: "Does lorem ipsum actually mean anything in Latin?",
      r: "Not really. It starts from a real passage by Cicero but is cut mid-word: lorem is the end of dolorem, meaning pain. Common versions then mix real Latin words with distorted fragments and no consistent grammar. A Latin scholar spots words, not meaning. That is exactly what dummy text is for: it looks like a language without drawing attention to the content.",
    },
    {
      q: "Should I use Latin, English or French placeholder text for a French client's mock-up?",
      r: "French dummy text gives the truest picture of the final page: French words run longer than English ones, and accents, apostrophes and line breaks look the way the live site will. Latin is instantly recognised as temporary, so nobody proofreads or publishes it by mistake. English placeholder text suits a bilingual site or an English-speaking client. For layout sign-off, the language of the final copy is usually the safest choice.",
    },
    {
      q: "How do I paste the text into an HTML page or a CMS?",
      r: "Tick the paragraph tags option: every paragraph is wrapped in paragraph tags, ready to paste into a page's code or the HTML view of an editor such as WordPress. Without it, paragraphs are separated by a blank line, which suits a word processor, Figma, InDesign or a form field. The Copy button takes the text exactly as displayed, in either form.",
    },
    {
      q: "Is the English or French dummy text copied from a book?",
      r: "No. Sentences are put together at random from a vocabulary and sentence patterns written for 75tools: a subject, a verb, an object, sometimes a phrase of time or purpose. The result is grammatical but says nothing in particular, and it reuses no existing text, so you can use it freely in your mock-ups, slides and templates without worrying about copyright.",
    },
    {
      q: "How many paragraphs of lorem ipsum fill an A4 page?",
      r: "About 5 paragraphs. An A4 page set in 11 or 12 point type with normal margins holds 400 to 500 words, and a paragraph generated here averages about 60 words, depending on the draw. To be precise, choose words instead and ask for 450: the counter above the text shows the exact total, characters included, before you copy it.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "WHATWG", titre: "HTML Standard, 4.4.1 The p element (élément de paragraphe)", url: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Understanding Success Criterion 3.1.2: Language of Parts (WCAG, langue d'un passage)", url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Declaring language in HTML (déclarer la langue en HTML)", url: "https://www.w3.org/International/questions/qa-html-language-declarations", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Clipboard API and events (copie dans le presse-papiers)", url: "https://www.w3.org/TR/clipboard-apis/", lu: "27 octobre 2026" },
    { editeur: "The Latin Library", titre: "Cicéron, De finibus bonorum et malorum, livre I", url: "https://www.thelatinlibrary.com/cicero/fin1.shtml", lu: "27 octobre 2026" },
    { editeur: "Wikipédia", titre: "Lorem ipsum", url: "https://fr.wikipedia.org/wiki/Lorem_ipsum", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "WHATWG", titre: "HTML Standard, 4.4.1 The p element", url: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-p-element", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Understanding Success Criterion 3.1.2: Language of Parts", url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Declaring language in HTML", url: "https://www.w3.org/International/questions/qa-html-language-declarations", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Clipboard API and events", url: "https://www.w3.org/TR/clipboard-apis/", lu: "27 October 2026" },
    { editeur: "The Latin Library", titre: "Cicero, De finibus bonorum et malorum, book I", url: "https://www.thelatinlibrary.com/cicero/fin1.shtml", lu: "27 October 2026" },
    { editeur: "Wikipedia", titre: "Lorem ipsum", url: "https://en.wikipedia.org/wiki/Lorem_ipsum", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Générateur lorem ipsum 75tools",
    motsCles: "générateur lorem ipsum, lorem ipsum français, faux texte, texte de remplissage, lorem ipsum dolor sit amet",
    reglages: "Réglages du faux texte",
    langue: "Langue",
    langues: { latin: "Latin", francais: "Français", anglais: "Anglais" } as Record<LangueLorem, string>,
    nombre: "Nombre",
    de: "De",
    unites: { paragraphes: "paragraphes", phrases: "phrases", mots: "mots" } as Record<Unite, string>,
    entier: (d: string) => `Saisissez un nombre entier ; ${d} en attendant.`,
    min: (m: string) => `Ramené à ${m}, le minimum.`,
    max: (m: string, u: string) => `Ramené à ${m}, le maximum pour les ${u}.`,
    classique: "Commencer par « Lorem ipsum dolor sit amet »",
    balises: "Balises <p> autour des paragraphes",
    copier: "Copier",
    copie: "Texte copié.",
    copieKo: "Copie impossible : sélectionnez le texte et copiez-le.",
    nouveau: "Nouveau texte",
    compte: (m: string, c: string) => `${m} mots · ${c} caractères`,
  },
  en: {
    nomAppli: "75tools lorem ipsum generator",
    motsCles: "lorem ipsum generator, placeholder text, dummy text generator, filler text, lorem ipsum dolor sit amet",
    reglages: "Placeholder text settings",
    langue: "Language",
    langues: { latin: "Latin", francais: "French", anglais: "English" } as Record<LangueLorem, string>,
    nombre: "Number",
    de: "Of",
    unites: { paragraphes: "paragraphs", phrases: "sentences", mots: "words" } as Record<Unite, string>,
    entier: (d: string) => `Enter a whole number; using ${d} for now.`,
    min: (m: string) => `Set to ${m}, the minimum.`,
    max: (m: string, u: string) => `Capped at ${m}, the maximum for ${u}.`,
    classique: "Start with \"Lorem ipsum dolor sit amet\"",
    balises: "<p> tags around paragraphs",
    copier: "Copy",
    copie: "Text copied.",
    copieKo: "Copy failed: select the text and copy it yourself.",
    nouveau: "New text",
    compte: (m: string, c: string) => `${m} words · ${c} characters`,
  },
};

const BORNES: Record<Unite, [number, number, number]> = {
  paragraphes: [1, 50, 3],
  phrases: [1, 300, 8],
  mots: [1, 5000, 100],
};

const ATTR_LANG: Record<LangueLorem, string> = { latin: "la", francais: "fr", anglais: "en" };

const GenerateurLoremIpsum = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => nombreLangue(n, lang);
  const [unite, setUnite] = useState<Unite>("paragraphes");
  const [nombreSaisie, setNombreSaisie] = useState("3");
  const [langue, setLangue] = useState<LangueLorem>("latin");
  const [classique, setClassique] = useState(true);
  const [balises, setBalises] = useState(false);
  // Graine fixe au premier rendu (HTML pré-rendu identique) ; « Nouveau texte » en tire une autre.
  const [graine, setGraine] = useState(1);
  const [message, setMessage] = useState("");

  const [min, max, defaut] = BORNES[unite];
  const n = parseInt(nombreSaisie.replace(/[\s,.]/g, ""), 10);
  let nombre = defaut;
  let alerte = "";
  if (nombreSaisie.trim() !== "") {
    if (!Number.isFinite(n)) alerte = t.entier(nb(defaut));
    else if (n < min) {
      nombre = min;
      alerte = t.min(nb(min));
    } else if (n > max) {
      nombre = max;
      alerte = t.max(nb(max), t.unites[unite]);
    } else nombre = n;
  }

  const paras = useMemo(
    () => genererLorem({ unite, nombre, commencerClassique: classique, langue, graine }),
    [unite, nombre, classique, langue, graine]
  );
  const sortie = balises ? enHtml(paras) : paras.join("\n\n");
  const nbMots = useMemo(() => compterMots(paras.join(" ")), [paras]);

  const changerUnite = (u: Unite) => {
    setUnite(u);
    setNombreSaisie(String(BORNES[u][2]));
    setMessage("");
  };

  const nouveau = () => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    setGraine(a[0] || 2);
    setMessage("");
  };

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] items-start">
      <form className="min-w-0 space-y-3" onSubmit={(e) => e.preventDefault()} aria-label={t.reglages}>
        <div>
          <span className="block text-sm text-neutral-300 mb-1">{t.langue}</span>
          <div className="grid grid-cols-3 gap-1 rounded-md border border-neutral-700 p-1">
            {(["latin", "francais", "anglais"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={langue === l}
                onClick={() => (setLangue(l), setMessage(""))}
                className={cn("h-10 rounded text-sm font-medium", langue === l ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white")}
              >
                {t.langues[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.nombre}</span>
            <input
              type="text"
              inputMode="numeric"
              value={nombreSaisie}
              onChange={(e) => (setNombreSaisie(e.target.value), setMessage(""))}
              className={classeChamp}
            />
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.de}</span>
            <select value={unite} onChange={(e) => changerUnite(e.target.value as Unite)} className={classeSelect}>
              {(["paragraphes", "phrases", "mots"] as const).map((u) => (
                <option key={u} value={u}>{t.unites[u]}</option>
              ))}
            </select>
          </label>
        </div>
        <p role="status" className="text-xs text-amber-300 empty:hidden">{alerte}</p>
        <label className={cn("flex items-center gap-2 min-h-[2.75rem] text-sm", langue === "latin" ? "text-neutral-200 cursor-pointer" : "text-neutral-600")}>
          <input
            type="checkbox"
            checked={classique && langue === "latin"}
            disabled={langue !== "latin"}
            onChange={(e) => setClassique(e.target.checked)}
            className="w-5 h-5 accent-sky-400 shrink-0"
          />
          {t.classique}
        </label>
        <label className="flex items-center gap-2 min-h-[2.75rem] text-sm text-neutral-200 cursor-pointer">
          <input type="checkbox" checked={balises} onChange={(e) => setBalises(e.target.checked)} className="w-5 h-5 accent-sky-400 shrink-0" />
          {t.balises}
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <Bouton onClick={async () => setMessage((await copierTexte(sortie)) ? t.copie : t.copieKo)}>
            <span className="inline-flex items-center gap-2"><Copy className="w-4 h-4" aria-hidden="true" />{t.copier}</span>
          </Bouton>
          <Bouton secondaire onClick={nouveau}>
            <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />{t.nouveau}</span>
          </Bouton>
        </div>
        <p role="status" className="text-sm text-neutral-400 empty:hidden">{message}</p>
      </form>

      <div data-resultat aria-live="polite" className="min-w-0">
        <p id="compte-lorem" className="text-sm text-neutral-500 mb-2 tabular-nums">
          {t.compte(nb(nbMots), nb([...sortie].length))}
        </p>
        {balises ? (
          <pre id="texte-lorem" className="whitespace-pre-wrap [overflow-wrap:anywhere] rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200 max-h-[26rem] overflow-y-auto">
            {sortie}
          </pre>
        ) : (
          <div id="texte-lorem" lang={ATTR_LANG[langue]} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-3 text-neutral-200 leading-relaxed max-h-[26rem] overflow-y-auto [overflow-wrap:anywhere]">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="generateur-lorem-ipsum"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="DesignApplication"
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
    <Section titre="Générateur lorem ipsum : du faux texte en un clic">
      <p>
        Ce générateur lorem ipsum produit du faux texte prêt à copier : choisissez la langue (latin classique,
        français ou anglais), le nombre de paragraphes, de phrases ou de mots, puis cliquez sur « Copier ». Le texte
        apparaît aussitôt à droite, avec son nombre de mots et de caractères ; « Nouveau texte » en tire un autre.
        Par défaut, vous obtenez 3 paragraphes de 4 à 7 phrases, dont le premier commence par la formule « Lorem ipsum
        dolor sit amet, consectetur adipiscing elit. » Pour remplir une page A4, demandez environ 450 mots ; pour un
        bloc de carte ou de bannière, 2 ou 3 phrases suffisent. L'option « Balises &lt;p&gt; » entoure chaque
        paragraphe pour un collage direct dans le code HTML ou un CMS. Tout est fabriqué dans votre navigateur. La
        limite : ce texte n'a aucun sens, il ne remplace pas de vrais contenus pour valider une maquette.
      </p>
    </Section>

    <Section titre="D'où vient le lorem ipsum">
      <p>
        Le lorem ipsum vient d'un texte de Cicéron, le <em>De finibus bonorum et malorum</em> (« Des termes extrêmes
        des biens et des maux »), écrit en 45 av. J.-C. Le passage d'origine se trouve au livre I, paragraphe 32, où une
        phrase commence par « Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
        velit… », c'est-à-dire, à peu près : personne n'aime la douleur pour elle-même. Le faux texte en garde des mots,
        mais coupés et remaniés : « lorem » n'est que la fin de « dolorem ».
      </p>
      <p>
        Le rapprochement avec Cicéron est dû au latiniste américain Richard McClintock. Il pense que le faux texte
        vient d'une édition de 1914 où « dolorem » était coupé en fin de page après « do », la page suivante
        commençant par « lorem ipsum ». La société britannique Letraset l'a utilisé pendant plusieurs décennies dans
        ses feuilles de lettres transférables, puis il a été intégré au logiciel de mise en page Aldus PageMaker en
        1987, ce qui l'a installé dans les habitudes des graphistes. Son usage par les imprimeurs avant Letraset est
        souvent affirmé, sans preuve concrète.
      </p>
    </Section>

    <Section titre="Quand utiliser un faux texte, et quand s'en passer">
      <p>
        Le faux texte sert à juger une forme sans être distrait par le fond : choisir une police et un interlignage,
        régler la largeur d'une colonne, tester un gabarit de page, une carte, un modèle d'e-mail ou un{" "}
        <Link to="/modele-carte-de-visite/">modèle de carte de visite</Link>. Il permet aussi de remplir un prototype
        avant que les textes soient écrits, à condition que tout le monde sache qu'ils sont provisoires.
      </p>
      <p>
        Il devient un piège quand la maquette doit être validée. Un bloc de lorem ipsum de trois lignes ne dit rien
        d'un vrai titre qui en fait cinq, d'un nom de produit à rallonge ou d'un prix qui ne tient pas sur un bouton.
        Dès que les textes existent, même en brouillon, mettez-les dans la maquette. Avant la mise en ligne, cherchez
        « lorem » et « ipsum » dans le site : il en reste souvent un au fond d'une page oubliée. Pour vérifier la
        longueur des vrais textes qui remplaceront le faux, le <Link to="/compteur-de-mots/">compteur de mots</Link>{" "}
        et le <Link to="/compteur-de-caracteres/">compteur de caractères</Link> donnent les chiffres exacts.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Lorem ipsum generator: placeholder text in one click">
      <p>
        This lorem ipsum generator makes placeholder text ready to copy: pick the language (classic Latin, English or
        French), the number of paragraphs, sentences or words, then click Copy. The text appears at once on the right
        with its word and character count, and New text draws another one. By default you get 3 paragraphs of 4 to 7
        sentences, the first opening with the familiar "Lorem ipsum dolor sit amet, consectetur adipiscing elit." To
        fill an A4 page, ask for about 450 words; for a card or a banner, 2 or 3 sentences are enough. The &lt;p&gt;
        tags option wraps each paragraph so you can paste it straight into HTML or a CMS. Everything is generated in
        your browser. The limit: the text means nothing, so it cannot replace real copy when a layout has to be
        approved.
      </p>
    </Section>

    <Section titre="Where lorem ipsum comes from">
      <p>
        Lorem ipsum comes from a work by Cicero, <em>De finibus bonorum et malorum</em> (On the Ends of Good and Evil),
        written in 45 BC. The source passage sits in book I, section 32, where a sentence begins "Neque porro quisquam
        est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit…", roughly: nobody loves pain for its
        own sake. The dummy text keeps some of its words, cut and reshuffled: lorem is only the end of dolorem.
      </p>
      <p>
        The link to Cicero was made by the American Latin scholar Richard McClintock, who believes the text comes from
        a 1914 edition where dolorem was split across a page break after "do", the next page starting with "lorem
        ipsum". The British firm Letraset used it for decades on its dry-transfer lettering sheets, and in 1987 it was
        built into the Aldus PageMaker layout software, which made it a habit among designers. Claims that printers
        used it centuries earlier are common but unproven.
      </p>
    </Section>

    <Section titre="Latin, English or French dummy text, and when to drop it">
      <p>
        Placeholder text lets you judge form without being distracted by content: choosing a typeface and line
        spacing, setting a column width, testing a page template, an email layout or a{" "}
        <Link to="/en/business-card-templates/">business card template</Link>. If you design for French clients, the
        French option is worth using: French words run longer and carry accents and apostrophes, so a heading that
        fits in English may wrap onto a second line once translated. The English option suits a bilingual site or an
        English-speaking audience.
      </p>
      <p>
        Dummy text becomes a trap when a design must be signed off. Three lines of lorem ipsum say nothing about a real
        five-line title or a product name that will not fit on a button. As soon as real copy exists, even in draft,
        put it in. Before going live, search the site for "lorem" and "ipsum": one often survives on a forgotten page.
        To check the length of the real copy, the <Link to="/en/word-counter/">word counter</Link> and the{" "}
        <Link to="/en/character-counter/">character counter</Link> give exact figures.
      </p>
    </Section>
  </>
);

export default GenerateurLoremIpsum;
