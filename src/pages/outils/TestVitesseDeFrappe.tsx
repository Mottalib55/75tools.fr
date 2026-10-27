import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { PageOutil, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section } from "@/components/outils/OutilLayout";
import { TEXTES_FRAPPE, calculerScores, melanger, normaliserSaisie, texteDuTest } from "@/lib/texte-frappe";
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
  {
    q: "Je tape vite mais je fais beaucoup de fautes, quel chiffre regarder ?",
    r: "Regardez les mots par minute nets et la précision, pas la vitesse brute. Le chiffre net ne compte que les caractères justes : une faute non corrigée ne rapporte rien. Si votre précision reste sous 95 %, ralentissez volontairement pendant quelques séances jusqu'à taper presque sans erreur ; la vitesse remonte ensuite d'elle-même, et vous perdez moins de temps à revenir en arrière pour corriger.",
  },
  {
    q: "Les accents et les majuscules me ralentissent, est-ce que ça compte comme une faute ?",
    r: "Oui : « e » à la place de « é » est une faute, comme une majuscule oubliée, car un texte français réel en contient partout. Si vous voulez d'abord travailler le placement des doigts, cochez « Sans accents » : le texte est le même, sans accents ni lettres spéciales. Revenez ensuite au texte complet, c'est lui qui mesure votre vitesse utile au quotidien.",
  },
  {
    q: "Le test fonctionne-t-il sur un téléphone ou une tablette ?",
    r: "Il fonctionne, mais le résultat n'est pas comparable à celui d'un clavier physique : le clavier tactile, la correction automatique et les suggestions de mots modifient ce que vous tapez. La page désactive la correction et les majuscules automatiques quand le navigateur le permet, sans garantie. Pour mesurer votre vitesse de dactylographie, passez par un ordinateur ou une tablette avec clavier.",
  },
  {
    q: "Pourquoi un mot vaut-il cinq frappes et pas un vrai mot du texte ?",
    r: "Parce que les mots n'ont pas tous la même longueur : taper « à » et taper « bibliothèque » ne demandent pas le même effort. La convention des tests de frappe compte un mot pour cinq caractères tapés, espaces et ponctuation compris. Elle rend les résultats comparables d'un texte à l'autre et d'un site à l'autre, en français comme en anglais.",
  },
];

const DUREES = [1, 2, 3];

const TestVitesseDeFrappe = () => {
  const [duree, setDuree] = useState(1);
  const [accents, setAccents] = useState(true);
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

  const cible = useMemo(() => texteDuTest(ordre, accents), [ordre, accents]);
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
      const t = performance.now();
      setMaintenant(t);
      if (debut !== null && t - debut >= duree * 60000) setFin(debut + duree * 60000);
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
    const t = performance.now();
    let d = debut;
    if (d === null && v.length > 0) {
      d = t;
      setDebut(t);
      setMaintenant(t);
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
    if (d !== null && v.length === cible.length) setFin(t);
  };

  const ecoule = debut === null ? 0 : Math.min(duree * 60000, (fin ?? maintenant) - debut);
  const minutes = ecoule / 60000;
  const scores = calculerScores(cible, saisie, frappes, erreursCommises, minutes);
  const restant = Math.max(0, duree * 60 - Math.floor(ecoule / 1000));
  const nonCorrigees = scores.saisis - scores.corrects;
  const fmt = (x: number) => Math.round(x).toLocaleString("fr-FR");
  const pct = (x: number) => (x * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %";

  // Rendu du texte : la partie déjà tapée est découpée caractère par caractère, le reste d'un bloc.
  const pos = saisie.length;

  const conseils: string[] = [];
  if (termine) {
    if (scores.precision < 0.95) conseils.push("Votre précision est sous 95 % : ralentissez un peu, visez d'abord moins d'erreurs ; la vitesse suivra.");
    if (nonCorrigees > 0) conseils.push(`${nonCorrigees} erreur${nonCorrigees > 1 ? "s" : ""} non corrigée${nonCorrigees > 1 ? "s" : ""} : elles ne comptent pas dans les mots par minute nets.`);
    if (accents && scores.precision >= 0.95) conseils.push("Bonne précision : refaites le test sur 3 minutes pour une mesure plus stable.");
    if (!accents) conseils.push("Vous avez tapé sans accents : refaites le test avec accents pour mesurer votre vitesse sur un vrai texte français.");
    conseils.push("Gardez les yeux sur le texte, pas sur le clavier, et revenez à la rangée de repos après chaque frappe.");
  }

  return (
    <PageOutil
      href="/test-vitesse-de-frappe/"
      titre="Test de vitesse de frappe en français : mots par minute"
      description="Test de vitesse de frappe en français : 1, 2 ou 3 minutes sur un texte avec accents, mots par minute bruts et nets, précision et erreurs surlignées en direct."
      motsCles="test de vitesse de frappe, test de dactylographie, apprendre à taper au clavier, mots par minute, vitesse de frappe clavier azerty"
      nomAppli="Test de vitesse de frappe 75tools"
      categorieAppli="EducationalApplication"
      h1="Test de vitesse de frappe au clavier"
      chapeau="Tapez le texte affiché : le chronomètre démarre à la première touche, les erreurs se surlignent en direct et le score s'affiche à la fin, en mots par minute et en précision. Les textes sont en français, avec accents, majuscules et ponctuation."
      faq={FAQ}
      sources={[
        { editeur: "Wikipedia", titre: "Words per minute", url: "https://en.wikipedia.org/wiki/Words_per_minute", lu: "27 octobre 2026" },
      ]}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div role="group" aria-label="Durée du test" className="inline-flex rounded-md border border-neutral-700 p-1 gap-1">
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
            Sans accents
          </label>
          <Bouton secondaire onClick={() => reinitialiser(true)}>
            <span className="inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" aria-hidden="true" />Nouveau texte</span>
          </Bouton>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xl" aria-live="off">
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">Temps restant</p>
            <p id="temps-restant" className="text-xl font-semibold text-white tabular-nums">
              {Math.floor(restant / 60)}:{String(restant % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">Mots/min nets</p>
            <p className="text-xl font-semibold text-white tabular-nums">{ecoule < 3000 && !termine ? "…" : fmt(scores.mpmNet)}</p>
          </div>
          <div className="rounded-md border border-neutral-800 px-3 py-2">
            <p className="text-xs text-neutral-500">Précision</p>
            <p className="text-xl font-semibold text-white tabular-nums">{pct(scores.precision)}</p>
          </div>
        </div>

        <div
          ref={zoneTexte}
          id="texte-modele"
          lang="fr"
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
          <span className="sr-only">Votre frappe</span>
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
            placeholder={termine ? "Test terminé." : "Cliquez ici et commencez à taper : le chronomètre démarre à la première touche."}
            className={classeZoneTexte + " font-mono text-base resize-none disabled:opacity-60"}
          />
        </label>
        {tactile && (
          <p className="text-sm text-amber-300">
            Vous semblez utiliser un écran tactile : le test reste utilisable, mais le clavier virtuel et la correction automatique faussent le résultat.
          </p>
        )}

        {termine && (
          <div id="resultat" role="status" className="rounded-lg border border-sky-400/40 bg-neutral-900 p-4 space-y-3">
            <p className="text-white text-lg">
              Résultat : <strong className="text-3xl tabular-nums">{fmt(scores.mpmNet)}</strong> mots par minute nets,{" "}
              {pct(scores.precision)} de précision
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <p><span className="block text-neutral-500">Brut</span><span className="text-white tabular-nums">{fmt(scores.mpmBrut)} mots/min</span></p>
              <p><span className="block text-neutral-500">Caractères justes</span><span className="text-white tabular-nums">{fmt(scores.corrects)} sur {fmt(scores.saisis)}</span></p>
              <p><span className="block text-neutral-500">Erreurs commises</span><span className="text-white tabular-nums">{fmt(scores.erreursCommises)}</span></p>
              <p><span className="block text-neutral-500">Durée</span><span className="text-white tabular-nums">{Math.round(minutes * 60)} s</span></p>
            </div>
            <ul className="list-disc pl-5 text-sm text-neutral-300 space-y-1">
              {conseils.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Bouton onClick={() => reinitialiser(true)}>Recommencer avec un autre texte</Bouton>
          </div>
        )}
        <p className="text-xs text-neutral-500">Rien n'est envoyé : la frappe et le score restent dans votre navigateur.</p>
      </div>

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
          on les tape avant la voyelle.
        </p>
        <h3>Des exercices progressifs</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>La rangée de repos seule : « qsdf jklm », puis des syllabes comme « sql », « fdj », sans regarder.</li>
          <li>La rangée du haut (A à P), puis celle du bas (W à N), en revenant toujours à la rangée de repos.</li>
          <li>Des mots courants, puis des phrases simples avec majuscules et ponctuation.</li>
          <li>Les accents et les chiffres, avec ce test en mode « Sans accents » puis complet.</li>
        </ol>
        <p>
          Dix à quinze minutes par jour suffisent, avec un objectif de précision avant la vitesse. Pour suivre
          vos séances, un <Link to="/minuteur/">minuteur</Link> évite de regarder l'heure.
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
          En français, les accents à touche morte (ê, ë, î…), les majuscules et la ponctuation demandent des frappes en plus ;
          comparez-vous donc d'abord à vous-même, sur la même durée et dans le même mode. Pour mesurer la
          longueur d'un texte que vous avez écrit, utilisez le{" "}
          <Link to="/compteur-de-mots/">compteur de mots</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default TestVitesseDeFrappe;
