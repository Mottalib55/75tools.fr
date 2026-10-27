import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section } from "@/components/outils/OutilLayout";
import {
  VITESSE_LECTURE,
  VITESSE_VOIX_HAUTE,
  compterMots,
  compterMotsElisionsSeparees,
  compterParagraphes,
  formatDuree,
  graphemes,
  listePhrases,
  motsFrequents,
  motsLongs,
  nombreFr,
} from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";

const FAQ: QuestionFaq[] = [
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
];

const Stat = ({ libelle, valeur, aide }: { libelle: string; valeur: string; aide?: string }) => (
  <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2 min-w-0">
    <p className="text-xs text-neutral-500">{libelle}</p>
    <p className="text-lg font-semibold text-white tabular-nums [overflow-wrap:anywhere]">{valeur}</p>
    {aide && <p className="text-xs text-neutral-500">{aide}</p>}
  </div>
);

const CompteurDeMots = () => {
  const [texte, setTexte] = useState("");
  const [limiteSaisie, setLimiteSaisie] = useState("");
  const [copie, setCopie] = useState("");
  const t = useDeferredValue(texte);

  const r = useMemo(() => {
    const mots = compterMots(t);
    const g = graphemes(t);
    const phrases = listePhrases(t).length;
    return {
      mots,
      motsElisions: compterMotsElisionsSeparees(t),
      car: g.length,
      carSansEspaces: g.filter((c) => !/^\s+$/u.test(c)).length,
      phrases,
      paragraphes: compterParagraphes(t),
      moyenne: phrases ? mots / phrases : 0,
      frequents: motsFrequents(t, 10),
      longs: motsLongs(t, 5),
    };
  }, [t]);

  const limiteNombre = parseInt(limiteSaisie.replace(/[\s  ]/g, ""), 10);
  let alerteLimite = "";
  let limite = 0;
  if (limiteSaisie.trim() !== "") {
    if (!Number.isFinite(limiteNombre) || /[^\d\s  ]/.test(limiteSaisie)) alerteLimite = "Saisissez un nombre entier de mots, par exemple 500.";
    else if (limiteNombre < 1) {
      limite = 1;
      alerteLimite = "La limite a été ramenée à 1 mot, la plus petite valeur possible.";
    } else if (limiteNombre > 1000000) {
      limite = 1000000;
      alerteLimite = "La limite a été ramenée à 1 000 000 de mots.";
    } else limite = limiteNombre;
  }
  const ratio = limite ? Math.min(1, r.mots / limite) : 0;
  const ecart = limite - r.mots;

  return (
    <PageOutil
      href="/compteur-de-mots/"
      titre="Compteur de mots gratuit : nombre de mots, lecture, phrases"
      description="Compteur de mots en ligne gratuit : collez votre texte pour obtenir mots, caractères, phrases, paragraphes, temps de lecture et mots répétés. Rien n'est envoyé."
      motsCles="compteur de mots, compter les mots d'un texte, combien de mots dans mon texte, nombre de mots, compteur de mots en ligne"
      nomAppli="Compteur de mots 75tools"
      h1="Compteur de mots en ligne"
      chapeau="Collez ou tapez votre texte : le nombre de mots, de caractères, de phrases et de paragraphes se met à jour à chaque frappe, avec le temps de lecture et les mots que vous répétez. Le comptage se fait dans votre navigateur, rien n'est envoyé."
      faq={FAQ}
      sources={[
        { editeur: "Assistance Microsoft", titre: "Afficher le nombre de mots (Word)", url: "https://support.microsoft.com/fr-fr/office/afficher-le-nombre-de-mots-3c9e6a11-a04d-43b4-977c-563a0e0d5da3", lu: "27 octobre 2026" },
        { editeur: "Aide Éditeurs Google Docs", titre: "Compter le nombre de mots d'un document", url: "https://support.google.com/docs/answer/39003?hl=fr", lu: "27 octobre 2026" },
        { editeur: "Journal of Memory and Language", titre: "Marc Brysbaert, How many words do we read per minute? A review and meta-analysis of reading rate (2019)", url: "https://doi.org/10.1016/j.jml.2019.104047", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] items-start">
        <div className="min-w-0 space-y-3">
          <label className="block">
            <span className="sr-only">Votre texte</span>
            <textarea
              id="texte-a-compter"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              rows={14}
              spellCheck
              placeholder="Collez ou tapez votre texte ici."
              className={classeZoneTexte + " min-h-[15rem] lg:min-h-[24rem] text-base leading-relaxed resize-y"}
            />
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <Bouton
              secondaire
              disabled={!texte}
              onClick={async () => setCopie((await copierTexte(texte)) ? "Texte copié." : "Copie impossible : sélectionnez le texte et copiez-le.")}
            >
              Copier le texte
            </Bouton>
            <Bouton secondaire disabled={!texte} onClick={() => setTexte("")}>
              Effacer
            </Bouton>
            <span role="status" className="text-sm text-neutral-400">{copie}</span>
          </div>
        </div>

        <div className="min-w-0 space-y-3 lg:sticky lg:top-4" aria-live="polite">
          <div className="rounded-lg border border-sky-400/40 bg-neutral-900 px-4 py-3">
            <p className="text-sm text-neutral-400">Mots</p>
            <p id="nb-mots" className="text-4xl font-semibold text-white tabular-nums">{nombreFr(r.mots)}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {nombreFr(r.motsElisions)} en comptant les élisions à part (l', d', qu'…)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat libelle="Caractères" valeur={nombreFr(r.car)} aide="espaces compris" />
            <Stat libelle="Sans espaces" valeur={nombreFr(r.carSansEspaces)} aide="caractères" />
            <Stat libelle="Phrases" valeur={nombreFr(r.phrases)} aide={r.phrases ? `${r.moyenne.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mots par phrase` : undefined} />
            <Stat libelle="Paragraphes" valeur={nombreFr(r.paragraphes)} />
            <Stat libelle="Lecture silencieuse" valeur={formatDuree(r.mots / VITESSE_LECTURE)} aide={`${VITESSE_LECTURE} mots par minute`} />
            <Stat libelle="Lecture à voix haute" valeur={formatDuree(r.mots / VITESSE_VOIX_HAUTE)} aide={`${VITESSE_VOIX_HAUTE} mots par minute`} />
          </div>
          <div>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Limite de mots (facultatif)</span>
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
                  {ecart >= 0
                    ? `${nombreFr(ecart)} mot${ecart > 1 ? "s" : ""} restant${ecart > 1 ? "s" : ""} sur ${nombreFr(limite)}`
                    : `${nombreFr(-ecart)} mot${-ecart > 1 ? "s" : ""} de trop (limite ${nombreFr(limite)})`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white mb-2">Mots les plus fréquents</h2>
          {r.frequents.length ? (
            <ol className="space-y-1 text-sm">
              {r.frequents.map((f) => (
                <li key={f.mot} className="flex justify-between gap-3 border-b border-neutral-800 py-1">
                  <span className="[overflow-wrap:anywhere]">{f.mot}</span>
                  <span className="tabular-nums text-neutral-400">{f.nb}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-500">Ils apparaîtront ici, hors mots vides (le, de, et, que…).</p>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white mb-2">Mots les plus longs</h2>
          {r.longs.length ? (
            <ul className="space-y-1 text-sm">
              {r.longs.map((m) => (
                <li key={m} className="flex justify-between gap-3 border-b border-neutral-800 py-1">
                  <span className="[overflow-wrap:anywhere]">{m}</span>
                  <span className="tabular-nums text-neutral-400">{[...m].length} lettres</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">Les cinq mots les plus longs de votre texte.</p>
          )}
        </div>
      </div>

      <Section titre="Comment le compteur compte les mots">
        <p>
          Un mot est ici une suite de lettres ou de chiffres. Les espaces et la ponctuation séparent les mots ;
          un signe isolé (tiret, deux-points, point d'exclamation, guillemet, emoji) ne compte pas. Trois signes
          ne coupent pas un mot quand ils sont placés entre deux lettres : l'apostrophe, droite ou courbe, le
          trait d'union et le trait d'union insécable. La virgule et le point ne coupent pas un nombre, et les
          espaces de milliers non plus.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[30rem]">
            <thead>
              <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
                <th className="py-2 pr-4 font-medium">Écrit</th>
                <th className="py-2 pr-4 font-medium">Total principal</th>
                <th className="py-2 font-medium">Élisions à part</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr><td className="py-2 pr-4">l'homme</td><td className="py-2 pr-4">1</td><td className="py-2">2</td></tr>
              <tr><td className="py-2 pr-4">aujourd'hui</td><td className="py-2 pr-4">1</td><td className="py-2">1</td></tr>
              <tr><td className="py-2 pr-4">porte-monnaie, c'est-à-dire</td><td className="py-2 pr-4">1 chacun</td><td className="py-2">1 et 2</td></tr>
              <tr><td className="py-2 pr-4">1 234,5 euros</td><td className="py-2 pr-4">2</td><td className="py-2">2</td></tr>
              <tr><td className="py-2 pr-4">« Oui ! », dit-elle.</td><td className="py-2 pr-4">2</td><td className="py-2">2</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Le total principal suit l'écriture : ce qui est attaché compte pour un. Le second total sépare les
          élisions (l', d', j', m', n', s', t', c', qu', jusqu', lorsqu', puisqu', quoiqu'), plus proche de
          l'analyse grammaticale. Les phrases se terminent par un point, un point d'exclamation, un point
          d'interrogation, des points de suspension ou un retour à la ligne, sauf après une abréviation courante
          (M., Mme, p., cf., av. J.-C.) ou une initiale. Un paragraphe est une ligne qui contient au moins un mot.
        </p>
        <p>
          <strong>Et Word, et Google Docs ?</strong> Leurs pages d'aide expliquent où trouver le nombre de mots
          (barre d'état de Word, menu Outils de Google Docs) mais ne disent pas comment sont traités apostrophes,
          traits d'union ou nombres avec espaces. Seule précision publiée : Google Docs exclut les en-têtes, pieds
          de page et notes de bas de page du total. D'un outil à l'autre, quelques mots d'écart sur une page sont
          donc normaux. Pour un nombre de caractères précis, utilisez le{" "}
          <Link to="/compteur-de-caracteres/">compteur de caractères</Link>.
        </p>
      </Section>

      <Section titre="Temps de lecture et de parole : d'où viennent les vitesses">
        <p>
          Le temps de lecture divise le nombre de mots par une vitesse moyenne. Les chiffres retenus viennent de
          la synthèse de Marc Brysbaert (université de Gand), publiée en 2019 dans le Journal of Memory and
          Language, qui reprend 190 études. Pour le français, son tableau par langue donne en moyenne{" "}
          <strong>214 mots par minute en lecture silencieuse</strong> et <strong>180 mots par minute à voix
          haute</strong>. En anglais, la moyenne est de 238 mots par minute pour un texte documentaire et 260
          pour un roman ; la plupart des adultes lisent un texte documentaire anglais entre 175 et 300 mots par
          minute.
        </p>
        <p>
          Ces durées sont des moyennes, pas des promesses. Un texte technique, rempli de chiffres ou de termes
          rares, se lit plus lentement ; un récit simple plus vite. Pour un discours ou une soutenance, le temps
          à voix haute est un plancher : il ne compte ni les pauses, ni les respirations, ni les diapositives.
          Répétez à voix haute avec un <Link to="/chronometre/">chronomètre</Link> pour avoir votre propre
          vitesse.
        </p>
      </Section>

      <Section titre="Dissertation, mémoire, article : tenir une limite de mots">
        <p>
          Beaucoup de consignes s'expriment en mots : une lettre de motivation de 300 mots, une question de
          dossier Parcoursup ou d'école limitée en caractères ou en mots, un article de 800 mots, un résumé de
          mémoire de 250 mots. Lisez bien ce que la consigne inclut : titre, notes, citations, bibliographie et
          annexes sont parfois exclus du compte. Collez seulement la partie concernée.
        </p>
        <p>
          Pour raccourcir, la liste des mots les plus fréquents aide à repérer les répétitions ; la moyenne de
          mots par phrase signale des phrases trop longues, qui se relisent souvent mieux coupées en deux. Pour allonger un texte trop court, développez un exemple plutôt que de délayer.
          Enfin, si un formulaire en ligne compte lui-même, c'est son compteur qui fait foi : gardez quelques mots
          de marge.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CompteurDeMots;
