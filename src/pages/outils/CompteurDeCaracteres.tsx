import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section, Source } from "@/components/outils/OutilLayout";
import { compterLignes, compterMots, compterX, graphemes, infoSms, nombreLangue, octetsUtf8 } from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";
import { type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Un emoji compte pour 1 caractère ici et pour 2 sur un autre site, pourquoi ?",
      r: "Beaucoup de compteurs mesurent la longueur interne de la chaîne en JavaScript, où un emoji occupe deux unités, et une famille ou un drapeau bien plus. Ce compteur découpe le texte comme on le lit, en graphèmes selon la norme Unicode UAX #29 : un emoji, un drapeau ou un « é » écrit avec un accent combinant comptent pour un. Les plateformes ont parfois leur propre règle : X compte chaque emoji pour deux.",
    },
    {
      q: "Mon SMS fait 120 caractères mais part en deux messages, comment est-ce possible ?",
      r: "Il contient sans doute un caractère absent de l'alphabet GSM 7 bits : un « ê », un « ç », un « œ », une apostrophe courbe ou un emoji. Le message entier passe alors en Unicode, limité à 70 caractères par SMS, et 67 par segment au-delà. Le compteur liste les caractères en cause : remplacez l'apostrophe courbe par une droite, ou « ê » par « e », pour revenir à 160.",
    },
    {
      q: "Quelle longueur donner à une meta description ?",
      r: "Google indique dans sa documentation qu'il n'y a pas de limite à la longueur d'une meta description, mais que l'extrait est tronqué dans les résultats si nécessaire, selon la largeur de l'écran. Il n'existe donc pas de nombre officiel de caractères. Placez l'information essentielle au début, pour qu'elle reste visible même si la fin est coupée, et rédigez une description propre à chaque page.",
    },
    {
      q: "Les retours à la ligne comptent-ils comme des caractères ?",
      r: "Oui : un retour à la ligne est un caractère dans le total avec espaces, comme l'espace ou la tabulation, et il est retiré du total sans espaces. C'est aussi ce que comptent la plupart des formulaires en ligne. Dans un SMS, il occupe une position de l'alphabet GSM. Le compteur affiche à part le nombre de lignes pour vérifier un texte découpé ligne par ligne.",
    },
    {
      q: "Un formulaire demande 1 500 caractères espaces compris, lequel des deux totaux regarder ?",
      r: "Le grand chiffre, « caractères, espaces compris » : il inclut lettres, ponctuation, espaces et retours à la ligne, comme le font les formulaires de candidature ou de demande de subvention. Inscrivez 1 500 dans le champ de limite en haut de l'outil : une jauge montre ce qu'il reste, puis le dépassement. Gardez une dizaine de caractères de marge, car certains sites comptent un retour à la ligne pour deux.",
    },
    {
      q: "Pourquoi le poids en octets dépasse-t-il le nombre de caractères ?",
      r: "Parce qu'en UTF-8, l'encodage du web défini par la norme Encoding du WHATWG, seuls les caractères de base (lettres sans accent, chiffres, ponctuation courante) tiennent sur 1 octet. Une lettre accentuée en prend 2, le signe euro 3 et un emoji au moins 4. Un texte français de 1 000 caractères pèse donc souvent 1 030 à 1 060 octets. Ce chiffre compte pour une base de données ou un champ limité en octets.",
    },
  ],
  en: [
    {
      q: "Why does an emoji count as 1 here but 2 on another site?",
      r: "Many counters measure the internal JavaScript string length, where one emoji takes two units and a family or a flag many more. This counter splits text the way you read it, into graphemes following the Unicode UAX #29 rules, so an emoji, a flag or an accented letter typed with a combining accent counts as one. Platforms may still apply their own rule: X counts every emoji as two.",
    },
    {
      q: "My French text message is short, so why is it billed as two SMS?",
      r: "It probably holds a character missing from the GSM 7-bit alphabet: ê, â, ç, œ, a curly apostrophe or an emoji. The whole message then switches to Unicode, which allows 70 characters in a single SMS and 67 per part beyond that. The counter lists the characters responsible: swap the curly apostrophe for a straight one, or ê for e, to get back to 160.",
    },
    {
      q: "A French application form allows 1,500 characters, spaces included: which total do I use?",
      r: "The large figure, characters with spaces: it includes letters, punctuation, spaces and line breaks, which is what French forms mean by espaces compris. Type 1,500 in the limit field at the top of the tool and a gauge shows what is left, then how far over you are. Keep about ten characters of margin, as some sites count a line break as two characters.",
    },
    {
      q: "Do line breaks count as characters?",
      r: "Yes. A line break is one character in the total with spaces, like a space or a tab, and it is removed from the total without spaces. Most online forms count it the same way. In a text message it takes one position of the GSM alphabet. The counter also shows the number of lines, which helps when a text has to fit line by line.",
    },
    {
      q: "Why is the size in bytes larger than the number of characters?",
      r: "Because in UTF-8, the web's encoding defined by the WHATWG Encoding Standard, only basic characters such as unaccented letters, digits and common punctuation fit in 1 byte. An accented letter takes 2, the euro sign 3 and an emoji at least 4. A French text of 1,000 characters therefore often weighs 1,030 to 1,060 bytes, which matters for a database field limited in bytes.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Unicode Consortium", titre: "UAX #29: Unicode Text Segmentation (découpage en graphèmes)", url: "https://www.unicode.org/reports/tr29/", lu: "27 octobre 2026" },
    { editeur: "WHATWG", titre: "Encoding Standard (encodage UTF-8)", url: "https://encoding.spec.whatwg.org/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Character encodings for beginners (les encodages de caractères expliqués)", url: "https://www.w3.org/International/questions/qa-what-is-encoding", lu: "27 octobre 2026" },
    { editeur: "Google Search Central", titre: "Comment rédiger des meta descriptions", url: "https://developers.google.com/search/docs/appearance/snippet?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Centre d'assistance X", titre: "Comment poster sur X", url: "https://help.x.com/fr/using-x/how-to-post", lu: "27 octobre 2026" },
    { editeur: "X Developer Platform", titre: "Counting characters (décompte pondéré des caractères)", url: "https://docs.x.com/fundamentals/counting-characters", lu: "27 octobre 2026" },
    { editeur: "Assistance LinkedIn", titre: "Publier et partager des nouvelles", url: "https://www.linkedin.com/help/linkedin/answer/a528176", lu: "27 octobre 2026" },
    { editeur: "Meta for Developers", titre: "Instagram Graph API, IG User Media (paramètre caption)", url: "https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Unicode Consortium", titre: "UAX #29: Unicode Text Segmentation", url: "https://www.unicode.org/reports/tr29/", lu: "27 October 2026" },
    { editeur: "WHATWG", titre: "Encoding Standard", url: "https://encoding.spec.whatwg.org/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Character encodings for beginners", url: "https://www.w3.org/International/questions/qa-what-is-encoding", lu: "27 October 2026" },
    { editeur: "Google Search Central", titre: "How to write meta descriptions", url: "https://developers.google.com/search/docs/appearance/snippet?hl=en", lu: "27 October 2026" },
    { editeur: "X Help Center", titre: "How to post", url: "https://help.x.com/en/using-x/how-to-post", lu: "27 October 2026" },
    { editeur: "X Developer Platform", titre: "Counting characters", url: "https://docs.x.com/fundamentals/counting-characters", lu: "27 October 2026" },
    { editeur: "LinkedIn Help", titre: "Post and share updates", url: "https://www.linkedin.com/help/linkedin/answer/a528176?lang=en", lu: "27 October 2026" },
    { editeur: "Meta for Developers", titre: "Instagram Graph API, IG User Media (caption parameter)", url: "https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Compteur de caractères 75tools",
    motsCles: "compteur de caractères, compter les caractères avec espaces, nombre de caractères d'un texte, compteur de caractères sans espaces, compteur sms",
    limite: "Limite à ne pas dépasser (facultatif)",
    votreTexte: "Votre texte",
    placeholder: "Collez ou tapez votre texte ici.",
    copier: "Copier le texte",
    copie: "Texte copié.",
    copieKo: "Copie impossible : sélectionnez le texte et copiez-le.",
    effacer: "Effacer",
    entier: "Saisissez un nombre entier de caractères, par exemple 1500.",
    min1: "La limite a été ramenée à 1 caractère.",
    max: "La limite a été ramenée à 10 000 000 de caractères.",
    avec: "Caractères, espaces compris",
    sans: "sans espaces",
    attente: "Le total s'affiche ici dès la première frappe.",
    votreLimite: "Votre limite",
    deTrop: (n: string) => `${n} de trop`,
    restent: (n: string) => `${n} restants`,
    espaces: "Espaces et retours",
    lignes: "Lignes",
    mots: "Mots",
    octets: "Octets (UTF-8)",
    utf16: (n: string) => `${n} unités UTF-16`,
    gsm: "GSM 7 bits",
    restantes: (n: number, nf: string, par: number) => `${nf} position${n > 1 ? "s" : ""} restante${n > 1 ? "s" : ""} dans le dernier (${par} par SMS)`,
    parSms: "160 caractères par SMS en GSM 7 bits",
    unicodeCause: "Passent le message en Unicode :",
    insecable: "espace insécable",
    tabulation: "tabulation",
    limites: [
      { nom: "Post X (décompte pondéré)", limite: 280, cle: "x" as const },
      { nom: "Légende Instagram", limite: 2200, cle: "g" as const },
      { nom: "Post LinkedIn", limite: 3000, cle: "g" as const },
    ],
  },
  en: {
    nomAppli: "75tools character counter",
    motsCles: "character counter, character count, count characters with spaces, characters without spaces, sms character counter",
    limite: "Limit not to exceed (optional)",
    votreTexte: "Your text",
    placeholder: "Paste or type your text here.",
    copier: "Copy text",
    copie: "Text copied.",
    copieKo: "Copy failed: select the text and copy it yourself.",
    effacer: "Clear",
    entier: "Enter a whole number of characters, for example 1500.",
    min1: "The limit was raised to 1 character.",
    max: "The limit was capped at 10,000,000 characters.",
    avec: "Characters, spaces included",
    sans: "without spaces",
    attente: "The total shows here from the first keystroke.",
    votreLimite: "Your limit",
    deTrop: (n: string) => `${n} over`,
    restent: (n: string) => `${n} left`,
    espaces: "Spaces and breaks",
    lignes: "Lines",
    mots: "Words",
    octets: "Bytes (UTF-8)",
    utf16: (n: string) => `${n} UTF-16 units`,
    gsm: "GSM 7-bit",
    restantes: (n: number, nf: string, par: number) => `${nf} position${n > 1 ? "s" : ""} left in the last one (${par} per SMS)`,
    parSms: "160 characters per SMS in GSM 7-bit",
    unicodeCause: "Switch the message to Unicode:",
    insecable: "non-breaking space",
    tabulation: "tab",
    limites: [
      { nom: "X post (weighted count)", limite: 280, cle: "x" as const },
      { nom: "Instagram caption", limite: 2200, cle: "g" as const },
      { nom: "LinkedIn post", limite: 3000, cle: "g" as const },
    ],
  },
};

const Jauge = ({ nom, valeur, limite, lang }: { nom: string; valeur: number; limite: number; lang: Langue }) => {
  const reste = limite - valeur;
  const nb = (n: number) => nombreLangue(n, lang);
  return (
    <div className="min-w-0">
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-neutral-300">{nom}</span>
        <span className={"tabular-nums " + (reste < 0 ? "text-red-300" : "text-neutral-400")}>
          {nb(valeur)} / {nb(limite)}
        </span>
      </div>
      <div className="h-2 mt-1 rounded bg-neutral-800 overflow-hidden" aria-hidden="true">
        <div className={"h-full " + (reste < 0 ? "bg-red-500" : "bg-sky-400")} style={{ width: `${Math.min(1, valeur / limite) * 100}%` }} />
      </div>
      {reste < 0 && <p className="text-xs text-red-300 mt-0.5">{T[lang].deTrop(nb(-reste))}</p>}
    </div>
  );
};

const Stat = ({ libelle, valeur, aide }: { libelle: string; valeur: string; aide?: string }) => (
  <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 min-w-0">
    <p className="text-xs text-neutral-500">{libelle}</p>
    <p className="text-lg font-semibold text-white tabular-nums [overflow-wrap:anywhere]">{valeur}</p>
    {aide && <p className="text-xs text-neutral-500">{aide}</p>}
  </div>
);

const CompteurDeCaracteres = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [texte, setTexte] = useState("");
  const [limiteSaisie, setLimiteSaisie] = useState("");
  const [copie, setCopie] = useState("");
  const d = useDeferredValue(texte);
  const nb = (n: number) => nombreLangue(n, lang);

  const r = useMemo(() => {
    const g = graphemes(d);
    return {
      car: g.length,
      sansEspaces: g.filter((c) => !/^\s+$/u.test(c)).length,
      espaces: g.filter((c) => /^\s+$/u.test(c)).length,
      lignes: compterLignes(d),
      octets: octetsUtf8(d),
      utf16: d.length,
      mots: compterMots(d),
      x: compterX(d),
      sms: infoSms(d),
    };
  }, [d]);

  const n = parseInt(limiteSaisie.replace(/[\s,.  ]/g, ""), 10);
  let alerte = "";
  let limite = 0;
  if (limiteSaisie.trim() !== "") {
    if (!Number.isFinite(n) || /[^\d\s,.  ]/.test(limiteSaisie)) alerte = t.entier;
    else if (n < 1) {
      limite = 1;
      alerte = t.min1;
    } else if (n > 10000000) {
      limite = 10000000;
      alerte = t.max;
    } else limite = n;
  }
  const codage = r.sms.codage === "GSM 7 bits" ? t.gsm : r.sms.codage;

  const outil = (
    <div className="grid gap-4 lg:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] items-start">
      <div className="min-w-0 space-y-3">
        <div>
          <label className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-neutral-300">{t.limite}</span>
            <input
              type="text"
              inputMode="numeric"
              value={limiteSaisie}
              onChange={(e) => setLimiteSaisie(e.target.value)}
              placeholder="1500"
              className={classeChamp + " !w-32 !h-10"}
            />
          </label>
          <p role="status" className="text-xs text-amber-300 mt-1 empty:hidden">{alerte}</p>
        </div>
        <label className="block">
          <span className="sr-only">{t.votreTexte}</span>
          <textarea
            id="texte-caracteres"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={7}
            placeholder={t.placeholder}
            className={classeZoneTexte + " min-h-[10rem] lg:min-h-[17rem] text-base leading-relaxed resize-y"}
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
          <p className="text-sm text-neutral-400">{t.avec}</p>
          <p id="nb-caracteres" className="text-4xl font-semibold text-white tabular-nums">{nb(r.car)}</p>
          <p className="text-sm text-neutral-300 mt-1">
            <span id="nb-sans-espaces" className="tabular-nums font-semibold text-white">{nb(r.sansEspaces)}</span> {t.sans}
          </p>
          {r.car === 0 && <p className="text-xs text-neutral-500 mt-1">{t.attente}</p>}
          {limite > 0 && (
            <div className="mt-2">
              <Jauge nom={t.votreLimite} valeur={r.car} limite={limite} lang={lang} />
              {r.car <= limite && <p className="text-xs text-neutral-400 mt-0.5">{t.restent(nb(limite - r.car))}</p>}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat libelle={t.espaces} valeur={nb(r.espaces)} />
          <Stat libelle={t.lignes} valeur={nb(r.lignes)} />
          <Stat libelle={t.mots} valeur={nb(r.mots)} />
          <Stat libelle={t.octets} valeur={nb(r.octets)} aide={t.utf16(nb(r.utf16))} />
        </div>
        <div className="rounded-lg border border-neutral-800 px-4 py-3 text-sm space-y-1">
          <p className="text-neutral-400">SMS</p>
          <p id="sms" className="text-white">
            <span className="text-lg font-semibold tabular-nums">{nb(r.sms.segments)}</span> SMS · {codage}
          </p>
          <p className="text-neutral-400 tabular-nums">
            {r.sms.segments ? t.restantes(r.sms.restants, nb(r.sms.restants), r.sms.parSegment) : t.parSms}
          </p>
          {r.sms.horsGsm.length > 0 && (
            <p className="text-amber-300 [overflow-wrap:anywhere]">
              {t.unicodeCause}{" "}
              {r.sms.horsGsm
                .slice(0, 12)
                .map((c) => (c === " " || c === " " ? t.insecable : c === "\t" ? t.tabulation : c))
                .join(" ")}
              {r.sms.horsGsm.length > 12 ? " …" : ""}
            </p>
          )}
        </div>
        <div className="rounded-lg border border-neutral-800 p-3 space-y-3">
          {t.limites.map((l) => (
            <Jauge key={l.nom} nom={l.nom} valeur={l.cle === "x" ? r.x : r.car} limite={l.limite} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PageOutil
      id="compteur-de-caracteres"
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
    <Section titre="Compteur de caractères avec et sans espaces">
      <p>
        Ce compteur de caractères donne, dès que vous collez ou tapez un texte, son nombre de caractères avec et sans
        espaces, affiché en grand dans le cadre de résultat, ainsi que ses lignes, ses mots, son poids en octets et le
        nombre de SMS qu'il occupe. Exemple : « Café à 3 € ! » compte 12 caractères espaces compris, 8 sans espaces, et
        pèse 16 octets en UTF-8, car « é », « à » et « € » prennent plus d'un octet. Inscrivez la limite d'un
        formulaire (1 500 caractères pour une lettre de candidature, par exemple) dans le champ en haut de l'outil :
        une jauge montre ce qu'il reste. Trois autres jauges suivent les limites de X (280), d'Instagram (2 200) et de
        LinkedIn (3 000). Tout est calculé dans votre navigateur. La limite principale : chaque plateforme peut compter
        emoji et retours à la ligne à sa façon, gardez une petite marge.
      </p>
    </Section>

    <Section titre="Avec ou sans espaces, et ce qu'est un caractère">
      <p>
        Le total <strong>avec espaces</strong> compte tout ce qui occupe une place : lettres, chiffres, ponctuation,
        espaces, tabulations et retours à la ligne. C'est le chiffre demandé par la plupart des formulaires et des
        réseaux sociaux. Le total <strong>sans espaces</strong> retire tous les blancs, y compris les espaces
        insécables et les retours à la ligne ; il sert surtout pour les traductions et certains travaux rédactionnels
        facturés au caractère.
      </p>
      <p>
        Le compteur compte les caractères comme on les voit à l'écran, en graphèmes, selon les règles de découpage du
        consortium Unicode (annexe UAX #29) appliquées par votre navigateur. Un « é » saisi comme une lettre suivie
        d'un accent combinant, un emoji composé (famille, couleur de peau) ou un drapeau comptent chacun pour un. Le
        poids en octets est celui du texte encodé en UTF-8 : une lettre sans accent pèse 1 octet, une lettre accentuée
        2, le signe euro 3 et un emoji au moins 4. Pour compter les mots plutôt que les signes, passez au{" "}
        <Link to="/compteur-de-mots/">compteur de mots et temps de lecture</Link>.
      </p>
    </Section>

    <Section titre="Limites de X, Instagram et LinkedIn">
      <p>
        <strong>X</strong> limite un post à 280 caractères pour un compte standard, mais tous ne pèsent pas autant :
        d'après sa documentation pour les développeurs, les lettres latines, la ponctuation et les symboles courants
        comptent pour 1, un emoji pour 2 quelle que soit sa complexité, un caractère chinois, japonais ou coréen pour 2,
        et toute adresse web pour 23, puisqu'elle est raccourcie par t.co. La jauge X applique ce décompte pondéré ; le
        total peut donc dépasser le nombre de caractères affiché à côté.
      </p>
      <p>
        <strong>LinkedIn</strong> indique dans son aide qu'un post peut contenir jusqu'à 3 000 caractères. Pour{" "}
        <strong>Instagram</strong>, la documentation de l'API de Meta fixe la légende à 2 200 caractères au plus, 30
        hashtags et 20 mentions. Ces deux jauges utilisent le nombre de caractères avec espaces ; la façon dont chaque
        application compte les emoji n'est pas publiée, gardez donc une petite marge.
      </p>
      <p>
        Pour la <strong>meta description</strong> d'une page web, Google écrit qu'il n'y a pas de limite de longueur
        et que l'extrait est tronqué au besoin selon l'appareil : les chiffres qui circulent sont des habitudes, pas
        une règle. C'est pourquoi la page n'affiche pas de jauge pour elle.
      </p>
    </Section>

    <Section titre="SMS : 160 caractères, ou 70 avec certains accents">
      <p>
        Un SMS classique utilise l'alphabet GSM 7 bits et contient 160 caractères. Au-delà, le message est découpé en
        segments de 153 caractères, car chaque segment garde quelques octets pour être recollé à l'arrivée. Si le
        texte contient un seul caractère hors de cet alphabet, tout le message passe en Unicode (UCS-2) : 70
        caractères pour un SMS seul, 67 par segment ensuite. Un emoji occupe alors deux positions.
      </p>
      <p>
        En français, l'alphabet GSM contient é, è, à, ù et ì, mais pas ê, â, î, ô, û, ë, ï, ç minuscule ni œ, ni
        l'apostrophe courbe que les téléphones et traitements de texte insèrent souvent à la place de l'apostrophe
        droite. Les signes €, [, ], {"{"}, {"}"}, \, ^, ~ et | sont dans une table d'extension et comptent pour deux.
        Le nombre de SMS facturés dépend ensuite de votre opérateur ou de votre plateforme d'envoi. Pour préparer un
        texte de démonstration de la bonne longueur, le{" "}
        <Link to="/generateur-lorem-ipsum/">générateur de faux texte lorem ipsum</Link> peut servir.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Character counter with and without spaces">
      <p>
        This character counter gives, as soon as you paste or type a text, its number of characters with and without
        spaces in large type in the result box, plus its lines, words, size in bytes and the number of text messages
        it fills. Example: "Café à 3 € !" counts 12 characters with spaces and 8 without, and weighs 16 bytes in UTF-8,
        because é, à and € each take more than one byte. Type the limit of a form in the field at the top of the tool,
        such as 1,500 characters for a French job application or a CAF online form, and a gauge shows what is left.
        Three more gauges follow the limits of X (280), Instagram (2,200) and LinkedIn (3,000). Everything is worked
        out in your browser. The main limit: each platform may count emoji and line breaks its own way, so keep a
        small margin.
      </p>
    </Section>

    <Section titre="With or without spaces, and what a character is">
      <p>
        The total <strong>with spaces</strong> counts everything that takes up room: letters, digits, punctuation,
        spaces, tabs and line breaks. It is the figure most forms and social networks ask for, and what French
        instructions mean by espaces compris. The total <strong>without spaces</strong> (sans espaces) removes every
        blank, non-breaking spaces and line breaks included; translators and copywriters paid per character in France
        often use it.
      </p>
      <p>
        The counter counts characters the way you see them, as graphemes, using the Unicode Consortium's segmentation
        rules (annex UAX #29) built into your browser. An é typed as a letter plus a combining accent, a compound emoji
        (family, skin tone) or a flag each count as one. The size in bytes is that of the text encoded in UTF-8: an
        unaccented letter weighs 1 byte, an accented letter 2, the euro sign 3 and an emoji at least 4. To count words
        and reading time instead, use the <Link to="/en/word-counter/">word counter with reading time</Link>.
      </p>
    </Section>

    <Section titre="Character limits on X, Instagram and LinkedIn">
      <p>
        <strong>X</strong> caps a post at 280 characters for a standard account, but not every character weighs the
        same: its developer documentation says Latin letters, punctuation and common symbols count as 1, any emoji as 2
        whatever its complexity, a Chinese, Japanese or Korean character as 2, and any web address as 23, since t.co
        shortens it. The X gauge applies this weighted count, so it can exceed the plain character total.
      </p>
      <p>
        <strong>LinkedIn</strong> states in its help centre that a post can hold up to 3,000 characters. For{" "}
        <strong>Instagram</strong>, Meta's API documentation sets a caption at 2,200 characters at most, with 30
        hashtags and 20 mentions. Both gauges use characters with spaces; how each app counts emoji is not published,
        so keep a margin. For a page's <strong>meta description</strong>, Google says there is no length limit and the
        snippet is cut as needed for the device, which is why there is no gauge for it.
      </p>
    </Section>

    <Section titre="Text messages in France: 160 characters, or 70 with some accents">
      <p>
        A standard SMS uses the GSM 7-bit alphabet and holds 160 characters. Beyond that, the message is split into
        parts of 153 characters, because each part keeps a few bytes to be stitched back together. If the text holds a
        single character outside that alphabet, the whole message switches to Unicode (UCS-2): 70 characters for one
        SMS, then 67 per part. An emoji then takes two positions.
      </p>
      <p>
        This matters when you text in French. The GSM alphabet includes é, è, à, ù and ì, but not ê, â, î, ô, û, ë, ï,
        a lower-case ç or œ, nor the curly apostrophe phones often insert instead of the straight one. The signs €, [,
        ], {"{"}, {"}"}, \, ^, ~ and | sit in an extension table and count as two. How many messages you pay for then
        depends on your French mobile operator or sending platform. To fill a mock-up with text of the right length,
        try the <Link to="/en/lorem-ipsum-generator/">lorem ipsum placeholder text generator</Link>.
      </p>
    </Section>
  </>
);

export default CompteurDeCaracteres;
