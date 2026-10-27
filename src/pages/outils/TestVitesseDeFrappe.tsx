import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { PageOutil, classeZoneTexte, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section, Source } from "@/components/outils/OutilLayout";
import { TEXTES_FRAPPE, calculerScores, melanger, normaliserSaisie, texteDuTest } from "@/lib/texte-frappe";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je tape vite mais je fais beaucoup de fautes, quel chiffre regarder ?",
      r: "Regardez les mots par minute nets et la précision, pas la vitesse brute. Le chiffre net ne compte que les caractères justes : une faute non corrigée ne rapporte rien. Si votre précision reste sous 95 %, ralentissez volontairement pendant quelques séances jusqu'à taper presque sans erreur ; la vitesse remonte ensuite d'elle-même, et vous perdez moins de temps à revenir en arrière pour corriger.",
    },
    {
      q: "Les accents et les majuscules me ralentissent, est-ce que ça compte comme une faute ?",
      r: "Oui : « e » à la place de « é » est une faute, comme une majuscule oubliée, car un texte français réel en contient partout. Si vous voulez d'abord travailler le placement des doigts, cochez « Sans accents » : le texte est le même, sans accents ni lettres spéciales. Revenez ensuite au texte complet, c'est lui qui mesure votre vitesse utile au quotidien.",
    },
    {
      q: "Mon ordinateur a un clavier QWERTY, puis-je passer le test en français ?",
      r: "Oui, mais les lettres accentuées n'ont pas de touche dédiée sur un clavier QWERTY américain ou britannique, ce qui vous ralentira. Cochez « Sans accents » pour mesurer la frappe pure, ou ajoutez la disposition française dans Windows (touche Windows + Espace pour basculer) ou dans les réglages du Mac. Comparez ensuite vos scores dans un même mode, sur la même durée, sans mélanger les deux claviers.",
    },
    {
      q: "Le score change beaucoup d'un essai à l'autre, lequel retenir ?",
      r: "Sur une minute, quelques hésitations suffisent à faire varier le score de 5 mots par minute ou plus. Pour une mesure stable, choisissez 3 minutes, faites trois essais d'affilée après un échauffement et gardez la moyenne des mots par minute nets. Notez aussi le mode utilisé, avec ou sans accents : un progrès se lit en comparant des essais faits dans les mêmes conditions, semaine après semaine.",
    },
    {
      q: "Le test fonctionne-t-il sur un téléphone ou une tablette ?",
      r: "Il fonctionne, mais le résultat n'est pas comparable à celui d'un clavier physique : le clavier tactile, la correction automatique et les suggestions de mots modifient ce que vous tapez. La page désactive la correction et les majuscules automatiques quand le navigateur le permet, sans garantie. Pour mesurer votre vitesse de dactylographie, passez par un ordinateur ou une tablette avec clavier.",
    },
    {
      q: "Pourquoi un mot vaut-il cinq frappes et pas un vrai mot du texte ?",
      r: "Parce que les mots n'ont pas tous la même longueur : taper « à » et taper « bibliothèque » ne demandent pas le même effort. La convention des tests de frappe compte un mot pour cinq caractères tapés, espaces et ponctuation compris. Elle rend les résultats comparables d'un texte à l'autre et d'un site à l'autre, en français comme en anglais.",
    },
  ],
  en: [
    {
      q: "I type fast but make lots of mistakes, which score matters?",
      r: "Look at net words per minute and accuracy, not the gross speed. The net figure only counts correct characters, so an uncorrected typo earns nothing. If your accuracy stays under 95%, slow down on purpose for a few sessions until you type almost without errors; speed then comes back on its own, and you lose less time going back to fix words.",
    },
    {
      q: "My laptop bought in France has an AZERTY keyboard, can I take the English test?",
      r: "Yes. The test counts the characters that reach the box, whatever the keyboard. On AZERTY, A and Q, Z and W swap places, M sits next to L and the full stop needs Shift, so expect a slower score at first. Either set Windows or macOS to the layout printed on your keys, or switch to a UK or US layout and learn it without looking at the keys.",
    },
    {
      q: "Can I practise on the French text from a QWERTY keyboard?",
      r: "Yes: choose French in the Text menu. A UK or US QWERTY keyboard has no key for é, è or ç, so tick No accents to keep the same French passage without accented letters. That is a good way to get used to French spelling before a job that involves writing emails in French. To type accents properly, add the French layout in your system settings.",
    },
    {
      q: "Why does a word count as five keystrokes rather than a real word?",
      r: "Because words differ in length: typing \"a\" and typing \"library\" take very different effort. Typing tests count one word for every five characters typed, spaces and punctuation included. This convention makes scores comparable from one text to another and from one site to another, in English as in French, so 250 characters in one minute is always 50 words per minute.",
    },
    {
      q: "Does the typing test work on a phone or a tablet?",
      r: "It works, but the result cannot be compared with a physical keyboard: the touch keyboard, autocorrect and word suggestions change what you type. The page turns off autocorrect and automatic capitals when the browser allows it, with no guarantee. To measure your real typing speed, use a computer or a tablet with a keyboard attached and take the 3-minute test.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Ministère de la Culture", titre: "Clavier informatique : une norme volontaire pour faciliter l'écriture du français (communiqué du 2 avril 2019)", url: "https://www.culture.gouv.fr/content/download/215728/2258780", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 9995-1:2009, Keyboard layouts for text and office systems, Part 1: General principles governing keyboard layouts", url: "https://www.iso.org/standard/51645.html", lu: "27 octobre 2026" },
    { editeur: "Microsoft", titre: "Gérer les paramètres de langue et de disposition du clavier/entrée dans Windows", url: "https://support.microsoft.com/fr-fr/windows/12a10cb4-8626-9b77-0ccb-5013e0c7c7a2", lu: "27 octobre 2026" },
    { editeur: "Apple", titre: "Écrire dans une autre langue sur Mac", url: "https://support.apple.com/fr-fr/guide/mac-help/mchlp1406/mac", lu: "27 octobre 2026" },
    { editeur: "Wikipedia", titre: "Words per minute", url: "https://en.wikipedia.org/wiki/Words_per_minute", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Ministère de la Culture", titre: "Clavier informatique : une norme volontaire pour faciliter l'écriture du français (Computer keyboard: a voluntary standard to make writing French easier, press release of 2 April 2019)", url: "https://www.culture.gouv.fr/content/download/215728/2258780", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 9995-1:2009, Keyboard layouts for text and office systems, Part 1: General principles governing keyboard layouts", url: "https://www.iso.org/standard/51645.html", lu: "27 October 2026" },
    { editeur: "Microsoft", titre: "Manage the language and keyboard/input layout settings in Windows", url: "https://support.microsoft.com/en-gb/windows/12a10cb4-8626-9b77-0ccb-5013e0c7c7a2", lu: "27 October 2026" },
    { editeur: "Apple", titre: "Write in another language on Mac", url: "https://support.apple.com/en-gb/guide/mac-help/mchlp1406/mac", lu: "27 October 2026" },
    { editeur: "Wikipedia", titre: "Words per minute", url: "https://en.wikipedia.org/wiki/Words_per_minute", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Test de vitesse de frappe 75tools",
    motsCles: "test de vitesse de frappe, test de dactylographie, apprendre à taper au clavier, mots par minute, vitesse de frappe clavier azerty",
    duree: "Durée du test",
    sansAccents: "Sans accents",
    texte: "Texte",
    nouveauTexte: "Nouveau texte",
    restant: "Temps restant",
    mpmNets: "Mots/min nets",
    precision: "Précision",
    attente: "Le score s'affiche ici pendant la frappe, puis en détail à la fin du temps.",
    enCours: "Test en cours : gardez les yeux sur le texte.",
    fini: "Test terminé : le détail est sous la zone de frappe.",
    votreFrappe: "Votre frappe",
    placeholder: "Cliquez ici et commencez à taper : le chronomètre démarre à la première touche.",
    placeholderFini: "Test terminé.",
    tactile: "Vous semblez utiliser un écran tactile : le test reste utilisable, mais le clavier virtuel et la correction automatique faussent le résultat.",
    resultat: "Résultat",
    mpmNetsLong: "mots par minute nets,",
    dePrecision: "de précision",
    brut: "Brut",
    motsMin: "mots/min",
    justes: "Caractères justes",
    sur: "sur",
    erreurs: "Erreurs commises",
    dureeLib: "Durée",
    recommencer: "Recommencer avec un autre texte",
    rienEnvoye: "Rien n'est envoyé : la frappe et le score restent dans votre navigateur.",
    pct: (x: string) => `${x} %`,
    cPrecision: "Votre précision est sous 95 % : ralentissez un peu, visez d'abord moins d'erreurs ; la vitesse suivra.",
    cNonCorrigees: (n: number) => `${n} erreur${n > 1 ? "s" : ""} non corrigée${n > 1 ? "s" : ""} : elles ne comptent pas dans les mots par minute nets.`,
    cBonne: "Bonne précision : refaites le test sur 3 minutes pour une mesure plus stable.",
    cSansAccents: "Vous avez tapé sans accents : refaites le test avec accents pour mesurer votre vitesse sur un vrai texte français.",
    cYeux: "Gardez les yeux sur le texte, pas sur le clavier, et revenez à la rangée de repos après chaque frappe.",
  },
  en: {
    nomAppli: "75tools typing speed test",
    motsCles: "typing speed test, typing test, words per minute test, wpm test, typing test english or french",
    duree: "Test duration",
    sansAccents: "No accents",
    texte: "Text",
    nouveauTexte: "New text",
    restant: "Time left",
    mpmNets: "Net WPM",
    precision: "Accuracy",
    attente: "Your score shows here as you type, then in detail when the time is up.",
    enCours: "Test running: keep your eyes on the text.",
    fini: "Test finished: the details are below the typing box.",
    votreFrappe: "Your typing",
    placeholder: "Click here and start typing: the timer starts on the first key.",
    placeholderFini: "Test finished.",
    tactile: "You seem to be on a touch screen: the test still works, but the on-screen keyboard and autocorrect skew the result.",
    resultat: "Result",
    mpmNetsLong: "net words per minute,",
    dePrecision: "accuracy",
    brut: "Gross",
    motsMin: "WPM",
    justes: "Correct characters",
    sur: "of",
    erreurs: "Mistakes made",
    dureeLib: "Duration",
    recommencer: "Try again with another text",
    rienEnvoye: "Nothing is sent: your typing and score stay in your browser.",
    pct: (x: string) => `${x}%`,
    cPrecision: "Your accuracy is below 95%: slow down a little and aim for fewer mistakes first; speed will follow.",
    cNonCorrigees: (n: number) => `${n} uncorrected mistake${n > 1 ? "s" : ""}: ${n > 1 ? "they do" : "it does"} not count towards net words per minute.`,
    cBonne: "Good accuracy: take the 3-minute test for a steadier measure.",
    cSansAccents: "You typed without accents: try again with accents to measure your speed on real French text.",
    cYeux: "Keep your eyes on the text, not on the keyboard, and return to the home row after each stroke.",
  },
};

const DUREES = [1, 2, 3];

const TestVitesseDeFrappe = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const loc = locale(lang);
  const [duree, setDuree] = useState(1);
  const [accents, setAccents] = useState(true);
  const [langueTexte, setLangueTexte] = useState<Langue>(lang);
  // Ordre fixe au rendu initial ; mélangé après montage et à chaque nouveau test.
  const [ordre, setOrdre] = useState<number[]>(() => TEXTES_FRAPPE.map((_, i) => i));
  const [saisie, setSaisie] = useState("");
  const [debut, setDebut] = useState<number | null>(null);
  const [maintenant, setMaintenant] = useState(0);
  const [fin, setFin] = useState<number | null>(null);
  const [frappes, setFrappes] = useState(0);
  const [erreursCommises, setErreursCommises] = useState(0);
  const [tactile, setTactile] = useState(false);
  const zoneTexte = useRef<HTMLDivElement>(null);
  const curseur = useRef<HTMLSpanElement>(null);
  const champ = useRef<HTMLTextAreaElement>(null);

  const avecAccents = langueTexte === "fr" && accents;
  const cible = useMemo(() => texteDuTest(ordre, avecAccents, langueTexte), [ordre, avecAccents, langueTexte]);
  const enCours = debut !== null && fin === null;
  const termine = fin !== null;

  const nouvelOrdre = () => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    setOrdre(melanger(a[0]));
  };

  useEffect(() => {
    nouvelOrdre();
    try {
      setTactile(window.matchMedia("(pointer: coarse)").matches);
    } catch {
      /* ignoré */
    }
  }, []);

  const reinitialiser = (nouveauTexte = true) => {
    setSaisie("");
    setDebut(null);
    setFin(null);
    setFrappes(0);
    setErreursCommises(0);
    setMaintenant(0);
    if (nouveauTexte) nouvelOrdre();
    setTimeout(() => champ.current?.focus(), 0);
  };

  // Chronomètre : rafraîchit l'affichage et termine le test à l'échéance.
  useEffect(() => {
    if (!enCours) return;
    const id = window.setInterval(() => {
      const n = performance.now();
      setMaintenant(n);
      if (debut !== null && n - debut >= duree * 60000) setFin(debut + duree * 60000);
    }, 200);
    return () => window.clearInterval(id);
  }, [enCours, debut, duree]);

  // Garde le curseur visible dans la zone du texte.
  useLayoutEffect(() => {
    const z = zoneTexte.current;
    const c = curseur.current;
    if (!z || !c) return;
    const haut = c.offsetTop - z.offsetTop;
    if (haut < z.scrollTop || haut > z.scrollTop + z.clientHeight - 48) z.scrollTop = Math.max(0, haut - 40);
  }, [saisie.length, cible]);

  const surSaisie = (brut: string) => {
    if (termine) return;
    const v = normaliserSaisie(brut).slice(0, cible.length);
    const n = performance.now();
    let d = debut;
    if (d === null && v.length > 0) {
      d = n;
      setDebut(n);
      setMaintenant(n);
    }
    if (v.length > saisie.length) {
      // nouvelles frappes : celles qui ne correspondent pas au texte sont des erreurs commises
      let nouvelles = 0;
      let fausses = 0;
      for (let i = saisie.length; i < v.length; i++) {
        nouvelles++;
        if (v[i] !== cible[i]) fausses++;
      }
      setFrappes((x) => x + nouvelles);
      setErreursCommises((x) => x + fausses);
    }
    setSaisie(v);
    if (d !== null && v.length === cible.length) setFin(n);
  };

  const ecoule = debut === null ? 0 : Math.min(duree * 60000, (fin ?? maintenant) - debut);
  const minutes = ecoule / 60000;
  const scores = calculerScores(cible, saisie, frappes, erreursCommises, minutes);
  const restant = Math.max(0, duree * 60 - Math.floor(ecoule / 1000));
  const nonCorrigees = scores.saisis - scores.corrects;
  const fmt = (x: number) => Math.round(x).toLocaleString(loc);
  const pct = (x: number) => t.pct((x * 100).toLocaleString(loc, { maximumFractionDigits: 1 }));

  // Rendu du texte : la partie déjà tapée est découpée caractère par caractère, le reste d'un bloc.
  const pos = saisie.length;

  const conseils: string[] = [];
  if (termine) {
    if (scores.precision < 0.95) conseils.push(t.cPrecision);
    if (nonCorrigees > 0) conseils.push(t.cNonCorrigees(nonCorrigees));
    if ((avecAccents || langueTexte === "en") && scores.precision >= 0.95) conseils.push(t.cBonne);
    if (!avecAccents && langueTexte === "fr") conseils.push(t.cSansAccents);
    conseils.push(t.cYeux);
  }

  const outil = (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div role="group" aria-label={t.duree} className="inline-flex rounded-md border border-neutral-700 p-1 gap-1">
          {DUREES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={duree === d}
              disabled={enCours}
              onClick={() => {
                setDuree(d);
                reinitialiser(false);
              }}
              className={cn(
                "h-10 px-3 rounded text-sm font-medium disabled:opacity-50",
                duree === d ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white"
              )}
            >
              {d} min
            </button>
          ))}
        </div>
        {lang === "en" && (
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <span>{t.texte}</span>
            <select
              id="langue-texte"
              value={langueTexte}
              disabled={enCours}
              onChange={(e) => {
                setLangueTexte(e.target.value as Langue);
                reinitialiser(false);
              }}
              className={classeSelect + " !w-auto !h-11"}
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </label>
        )}
        {langueTexte === "fr" && (
          <label className={cn("flex items-center gap-2 min-h-[2.75rem] text-sm", enCours ? "text-neutral-500" : "text-neutral-200 cursor-pointer")}>
            <input
              type="checkbox"
              checked={!accents}
              disabled={enCours}
              onChange={(e) => {
                setAccents(!e.target.checked);
                reinitialiser(false);
              }}
              className="w-5 h-5 accent-sky-400"
            />
            {t.sansAccents}
          </label>
        )}
        <Bouton secondaire onClick={() => reinitialiser(true)}>
          <span className="inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" aria-hidden="true" />{t.nouveauTexte}</span>
        </Bouton>
      </div>

      <div data-resultat className="max-w-xl space-y-1">
        <div className="grid grid-cols-3 gap-2" aria-live="off">
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">{t.restant}</p>
            <p id="temps-restant" className="text-xl font-semibold text-white tabular-nums">
              {Math.floor(restant / 60)}:{String(restant % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">{t.mpmNets}</p>
            <p id="mpm-direct" className="text-xl font-semibold text-white tabular-nums">{ecoule < 3000 && !termine ? "…" : fmt(scores.mpmNet)}</p>
          </div>
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">{t.precision}</p>
            <p className="text-xl font-semibold text-white tabular-nums">{pct(scores.precision)}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500">{termine ? t.fini : enCours ? t.enCours : t.attente}</p>
      </div>

      <div
        ref={zoneTexte}
        id="texte-modele"
        lang={langueTexte}
        translate="no"
        onClick={() => champ.current?.focus()}
        className="relative h-40 sm:h-44 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 font-mono text-[1.05rem] sm:text-lg leading-relaxed text-neutral-500 [overflow-wrap:anywhere] select-none"
      >
        {Array.from(saisie, (c, i) =>
          c === cible[i] ? (
            <span key={i} className="text-neutral-100">{cible[i]}</span>
          ) : (
            <span key={i} className={cn("bg-red-500/40 text-red-100 rounded-sm", cible[i] === " " && "underline decoration-red-400")}>
              {cible[i] === " " ? "·" : cible[i]}
            </span>
          )
        )}
        {pos < cible.length && (
          <span ref={curseur} className={cn("rounded-sm text-white", termine ? "" : "bg-sky-400/40")}>
            {cible[pos]}
          </span>
        )}
        <span>{cible.slice(pos + 1)}</span>
      </div>

      <label className="block">
        <span className="sr-only">{t.votreFrappe}</span>
        <textarea
          ref={champ}
          id="zone-frappe"
          value={saisie}
          onChange={(e) => surSaisie(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          disabled={termine}
          rows={3}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          placeholder={termine ? t.placeholderFini : t.placeholder}
          className={classeZoneTexte + " font-mono text-base resize-none disabled:opacity-60"}
        />
      </label>
      {tactile && <p className="text-sm text-amber-300">{t.tactile}</p>}

      {termine && (
        <div id="resultat" role="status" className="rounded-lg border border-sky-400/40 bg-neutral-900 p-4 space-y-3">
          <p className="text-white text-lg">
            {t.resultat}
            {lang === "fr" ? " : " : ": "}
            <strong id="mpm-final" className="text-3xl tabular-nums">{fmt(scores.mpmNet)}</strong> {t.mpmNetsLong} {pct(scores.precision)} {t.dePrecision}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <p><span className="block text-neutral-500">{t.brut}</span><span className="text-white tabular-nums">{fmt(scores.mpmBrut)} {t.motsMin}</span></p>
            <p><span className="block text-neutral-500">{t.justes}</span><span className="text-white tabular-nums">{fmt(scores.corrects)} {t.sur} {fmt(scores.saisis)}</span></p>
            <p><span className="block text-neutral-500">{t.erreurs}</span><span className="text-white tabular-nums">{fmt(scores.erreursCommises)}</span></p>
            <p><span className="block text-neutral-500">{t.dureeLib}</span><span className="text-white tabular-nums">{Math.round(minutes * 60)} s</span></p>
          </div>
          <ul className="list-disc pl-5 text-sm text-neutral-300 space-y-1">
            {conseils.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Bouton onClick={() => reinitialiser(true)}>{t.recommencer}</Bouton>
        </div>
      )}
      <p className="text-xs text-neutral-500">{t.rienEnvoye}</p>
    </div>
  );

  return (
    <PageOutil
      id="test-vitesse-de-frappe"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="EducationalApplication"
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
    <Section titre="Test de vitesse de frappe : mesurer ses mots par minute">
      <p>
        Ce test de vitesse de frappe mesure en 1, 2 ou 3 minutes combien de mots par minute vous tapez sur un vrai
        texte français, avec accents, majuscules et ponctuation. Choisissez la durée, cliquez dans la zone de saisie et
        recopiez le texte affiché : le chronomètre démarre à la première touche, chaque faute se surligne en rouge et le
        score se met à jour en direct. À la fin, vous obtenez les mots par minute bruts et nets, la précision et le
        nombre d'erreurs commises. Un mot compte pour cinq caractères : 250 caractères justes en une minute font
        50 mots par minute nets, au-dessus des 32,5 mesurés en moyenne chez des utilisateurs d'ordinateur qui recopient un texte. Limite à
        connaître : sur un téléphone, le clavier tactile et la correction automatique faussent la mesure.
      </p>
    </Section>

    <Section titre="Comment le score est calculé">
      <p>
        Les tests de frappe comptent la vitesse en <strong>mots par minute</strong>, mais un « mot » y est une
        unité fixe de <strong>cinq caractères</strong>, espaces et ponctuation compris. Taper 250 caractères
        en une minute, c'est donc 50 mots par minute, que le texte contienne des mots courts ou longs. Cette
        convention rend les scores comparables entre textes et entre langues.
      </p>
      <p>
        Le <strong>score brut</strong> divise par cinq tous les caractères présents dans votre saisie, puis par
        la durée. Le <strong>score net</strong> ne garde que les caractères justes, à leur place : c'est le
        chiffre à retenir. La <strong>précision</strong> rapporte les frappes fausses à toutes vos frappes,
        même celles que vous avez corrigées ensuite : effacer une faute la retire du texte, pas de la
        précision. Une lettre sans son accent, une majuscule oubliée ou une espace manquante comptent comme
        des erreurs, surlignées en rouge dans le texte (une espace fautive apparaît sous forme de point).
      </p>
      <p>
        Le test s'arrête à la fin du temps choisi ou quand le texte est entièrement tapé. Sur une minute, le
        score varie d'un essai à l'autre ; trois minutes donnent une mesure plus stable. La touche Entrée est
        sans effet et le collage est désactivé.
      </p>
    </Section>

    <Section titre="Apprendre à taper au clavier (AZERTY)">
      <h3>La position des doigts</h3>
      <p>
        Tout part de la <strong>rangée de repos</strong>, celle du milieu. Sur un clavier AZERTY, la main
        gauche se pose sur Q, S, D et F (auriculaire, annulaire, majeur, index), la main droite sur J, K, L et
        M (index, majeur, annulaire, auriculaire). Les pouces reposent sur la barre d'espace. Les touches F et J
        portent un petit relief, l'ergot, qui permet de retrouver la position sans regarder. Chaque doigt
        s'occupe d'une colonne, légèrement en biais : l'index gauche couvre aussi R, T, G, V et B, l'index droit
        Y, U, H, N et la virgule.
      </p>
      <p>
        Pour les majuscules, appuyez sur la touche Maj avec la main opposée à celle qui tape la lettre. Les
        accents courants sont sur la rangée des chiffres : é sur la touche 2, è sur le 7, ç sur le 9, à sur le
        0 ; ù se trouve à droite du M. L'accent circonflexe et le tréma sont des touches mortes, à droite du P :
        on les tape avant la voyelle. Les majuscules accentuées et le « œ » manquent sur l'AZERTY habituel ; c'est
        l'une des raisons pour lesquelles AFNOR a publié en 2019, à la demande du ministère de la Culture, une
        norme volontaire de clavier français (NF Z71-300), avec un AZERTY amélioré et la disposition BÉPO.
      </p>
      <h3>Des exercices progressifs</h3>
      <p>
        Commencez par la rangée de repos seule (« qsdf jklm », puis des syllabes comme « sql » ou « fdj », sans
        regarder), puis la rangée du haut et celle du bas, en revenant toujours à la rangée de repos. Passez ensuite
        à des mots courants, puis à des phrases avec majuscules et ponctuation, et terminez par les accents et les
        chiffres, avec ce test en mode « Sans accents » puis complet. Dix à quinze minutes par jour suffisent, avec un
        objectif de précision avant la vitesse. Pour suivre vos séances, un <Link to="/minuteur/">minuteur</Link>{" "}
        évite de regarder l'heure.
      </p>
      <h3>La posture</h3>
      <p>
        Asseyez-vous le dos droit, les pieds à plat, les avant-bras à peu près horizontaux et les poignets
        légèrement relevés au-dessus du clavier pendant la frappe. Le haut de l'écran se place vers la hauteur
        des yeux. Faites une courte pause régulièrement : la fatigue se traduit vite en erreurs.
      </p>
    </Section>

    <Section titre="Quelques repères de vitesse">
      <p>
        Les chiffres publiés concernent surtout l'anglais. Une étude de Karat et ses collègues (1999), citée
        par l'article « Words per minute » de Wikipédia en anglais, mesure 32,5 mots par minute en moyenne chez
        des utilisateurs d'ordinateur qui recopient un texte, et 19 quand ils le composent. La même page situe
        les dactylographes professionnels entre 43 et 80 mots par minute environ, et donne 36,2 mots par minute
        comme vitesse moyenne de frappe sur téléphone en 2019.
      </p>
      <p>
        En français, les accents à touche morte (ê, ë, î…), les majuscules et la ponctuation demandent des frappes
        en plus ; comparez-vous donc d'abord à vous-même, sur la même durée et dans le même mode. Pour mesurer la
        longueur d'un texte que vous avez écrit, utilisez le <Link to="/compteur-de-mots/">compteur de mots</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Typing speed test: measure your words per minute">
      <p>
        This typing speed test measures how many words per minute you type over 1, 2 or 3 minutes, on an English text
        or, if you choose it, on a French one. Pick the duration, click in the typing box and copy the text shown: the
        timer starts on the first key, each mistake turns red and the score updates live. At the end you get gross and
        net words per minute, accuracy and the number of mistakes made. A word counts as five characters, so 250
        correct characters in one minute make 50 net words per minute, above the 32.5
        measured on average among computer users copying a text. The main limit: on a phone, the touch keyboard and autocorrect distort the
        result, so use a physical keyboard for a fair measure.
      </p>
    </Section>

    <Section titre="How the score is calculated">
      <p>
        Typing tests count speed in <strong>words per minute</strong> (WPM), but a "word" is a fixed unit of{" "}
        <strong>five characters</strong>, spaces and punctuation included. The <strong>gross score</strong> divides
        every character in your typing by five, then by the time. The <strong>net score</strong> only keeps correct
        characters in the right place: that is the number to remember. <strong>Accuracy</strong> compares wrong
        keystrokes with all your keystrokes, including those you later fixed: deleting a typo removes it from the
        text, not from your accuracy. A missing capital or a missing space counts as an error, highlighted in red (a
        wrong space shows as a dot).
      </p>
      <p>
        The test stops when the time is up or when the whole text has been typed. Over one minute the score varies
        from one attempt to the next; three minutes give a steadier measure. The Enter key does nothing and pasting is
        disabled.
      </p>
    </Section>

    <Section titre="QWERTY or AZERTY: typing in France">
      <p>
        If you bought your computer in France, its keyboard is almost certainly <strong>AZERTY</strong>, named after
        the first six letters of its top row. Compared with the UK or US <strong>QWERTY</strong> layout, A and Q swap
        places, as do Z and W; M moves to the right of L; digits need Shift, and the full stop sits on the same key as
        the semicolon, with Shift. The upside is direct keys for é, è, ç, à and ù, plus dead keys for the circumflex and
        the umlaut. There is no single reference AZERTY: in 2019 AFNOR published, at the request of the French Ministry
        of Culture, a voluntary standard (NF Z71-300) with an improved AZERTY and the BÉPO layout.
      </p>
      <p>
        What matters for touch typing is that the layout set in your system matches the keys you learned. In Windows,
        add the layout under Time and language, then switch with the Windows key and Space; on a Mac, add it under
        Input Sources and switch from the input menu in the menu bar. If you write mostly in English, a UK or US layout
        on an AZERTY keyboard works, as long as you never look at the keys. To practise French emails, choose French in
        the Text menu, and tick No accents at first if your keyboard is QWERTY.
      </p>
    </Section>

    <Section titre="Getting faster, and some speed benchmarks">
      <p>
        Start from the <strong>home row</strong>: on QWERTY, left fingers on A, S, D and F, right fingers on J, K, L and
        the semicolon, thumbs on the space bar; F and J have a small bump you can feel. Ten to fifteen minutes a day,
        accuracy first, does more than an hour once a week. A <Link to="/en/online-timer/">timer</Link> keeps sessions
        short without looking at the clock.
      </p>
      <p>
        The Wikipedia article "Words per minute" cites a 1999 study by Karat and colleagues measuring an average of 32.5
        WPM among computer users copying a text, and 19 when composing. It places professional typists at roughly 43
        to 80 WPM, and gives 36.2 WPM as the average mobile typing speed in 2019. French text with accents usually
        comes out a little slower than English, so compare yourself with yourself, in the same language and mode. To
        count the words of a text you wrote, use the <Link to="/en/word-counter/">word counter</Link>.
      </p>
    </Section>
  </>
);

export default TestVitesseDeFrappe;
