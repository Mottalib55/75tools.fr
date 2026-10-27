import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section } from "@/components/outils/OutilLayout";
import { compterLignes, compterMots, compterX, graphemes, infoSms, nombreFr, octetsUtf8 } from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";

const FAQ: QuestionFaq[] = [
  {
    q: "Un emoji compte pour 1 caractère ici et pour 2 sur un autre site, pourquoi ?",
    r: "Beaucoup de compteurs mesurent la longueur interne de la chaîne en JavaScript, où un emoji occupe deux unités, et une famille ou un drapeau bien plus. Ce compteur découpe le texte comme on le lit, en graphèmes : un emoji, un drapeau ou un « é » écrit avec un accent combinant comptent pour un. Les plateformes ont parfois leur propre règle : X compte chaque emoji pour deux.",
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
];

const LIMITES = [
  { nom: "Post X (décompte pondéré)", limite: 280, cle: "x" as const },
  { nom: "Légende Instagram", limite: 2200, cle: "g" as const },
  { nom: "Post LinkedIn", limite: 3000, cle: "g" as const },
];

const Jauge = ({ nom, valeur, limite }: { nom: string; valeur: number; limite: number }) => {
  const reste = limite - valeur;
  return (
    <div className="min-w-0">
      <div className="flex justify-between gap-2 text-sm">
        <span className="text-neutral-300">{nom}</span>
        <span className={"tabular-nums " + (reste < 0 ? "text-red-300" : "text-neutral-400")}>
          {nombreFr(valeur)} / {nombreFr(limite)}
        </span>
      </div>
      <div className="h-2 mt-1 rounded bg-neutral-800 overflow-hidden" aria-hidden="true">
        <div className={"h-full " + (reste < 0 ? "bg-red-500" : "bg-sky-400")} style={{ width: `${Math.min(1, valeur / limite) * 100}%` }} />
      </div>
      {reste < 0 && <p className="text-xs text-red-300 mt-0.5">{nombreFr(-reste)} de trop</p>}
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

const CompteurDeCaracteres = () => {
  const [texte, setTexte] = useState("");
  const [limiteSaisie, setLimiteSaisie] = useState("");
  const [copie, setCopie] = useState("");
  const t = useDeferredValue(texte);

  const r = useMemo(() => {
    const g = graphemes(t);
    return {
      car: g.length,
      sansEspaces: g.filter((c) => !/^\s+$/u.test(c)).length,
      espaces: g.filter((c) => /^\s+$/u.test(c)).length,
      lignes: compterLignes(t),
      octets: octetsUtf8(t),
      utf16: t.length,
      mots: compterMots(t),
      x: compterX(t),
      sms: infoSms(t),
    };
  }, [t]);

  const n = parseInt(limiteSaisie.replace(/[\s  ]/g, ""), 10);
  let alerte = "";
  let limite = 0;
  if (limiteSaisie.trim() !== "") {
    if (!Number.isFinite(n) || /[^\d\s  ]/.test(limiteSaisie)) alerte = "Saisissez un nombre entier de caractères, par exemple 1500.";
    else if (n < 1) {
      limite = 1;
      alerte = "La limite a été ramenée à 1 caractère.";
    } else if (n > 10000000) {
      limite = 10000000;
      alerte = "La limite a été ramenée à 10 000 000 de caractères.";
    } else limite = n;
  }

  return (
    <PageOutil
      href="/compteur-de-caracteres/"
      titre="Compteur de caractères avec et sans espaces, gratuit"
      description="Compteur de caractères gratuit : avec et sans espaces, emoji comptés comme on les voit, lignes, octets, nombre de SMS et limites de X, Instagram et LinkedIn."
      motsCles="compteur de caractères, compter les caractères avec espaces, nombre de caractères d'un texte, compteur de caractères sans espaces, compteur sms"
      nomAppli="Compteur de caractères 75tools"
      h1="Compteur de caractères en ligne"
      chapeau="Collez votre texte pour connaître son nombre de caractères avec et sans espaces, ses lignes, son poids en octets et le nombre de SMS qu'il occupe, avec des jauges pour les limites de X, Instagram et LinkedIn. Tout est calculé dans votre navigateur."
      faq={FAQ}
      sources={[
        { editeur: "X Developer Platform", titre: "Counting characters", url: "https://docs.x.com/fundamentals/counting-characters", lu: "27 octobre 2026" },
        { editeur: "Aide LinkedIn", titre: "Post and share updates", url: "https://www.linkedin.com/help/linkedin/answer/a528176", lu: "27 octobre 2026" },
        { editeur: "Meta for Developers", titre: "Instagram Graph API, IG User Media (paramètre caption)", url: "https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-user/media", lu: "27 octobre 2026" },
        { editeur: "Google Search Central", titre: "Contrôler vos extraits dans les résultats de recherche", url: "https://developers.google.com/search/docs/appearance/snippet?hl=fr", lu: "27 octobre 2026" },
        { editeur: "Twilio", titre: "How long can a message be?", url: "https://www.twilio.com/docs/glossary/what-sms-character-limit", lu: "27 octobre 2026" },
        { editeur: "X (Twitter), dépôt twitter-text", titre: "config/v3.json, plages de poids des caractères", url: "https://github.com/twitter/twitter-text/blob/master/config/v3.json", lu: "27 octobre 2026" },
        { editeur: "Wikipédia (en anglais)", titre: "Alphabet GSM 7 bits (norme 03.38) et table d'extension", url: "https://en.wikipedia.org/wiki/GSM_03.38", lu: "27 octobre 2026" },
        { editeur: "Twilio", titre: "What is GSM-7 character encoding?", url: "https://www.twilio.com/docs/glossary/what-is-gsm-7-character-encoding", lu: "27 octobre 2026" },
        { editeur: "MDN Web Docs", titre: "Intl.Segmenter", url: "https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] items-start">
        <div className="min-w-0 space-y-3">
          <label className="block">
            <span className="sr-only">Votre texte</span>
            <textarea
              id="texte-caracteres"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              rows={12}
              placeholder="Collez ou tapez votre texte ici."
              className={classeZoneTexte + " min-h-[13rem] lg:min-h-[22rem] text-base leading-relaxed resize-y"}
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
          <div className="rounded-lg border border-neutral-800 p-3 space-y-3">
            {LIMITES.map((l) => (
              <Jauge key={l.nom} nom={l.nom} valeur={l.cle === "x" ? r.x : r.car} limite={l.limite} />
            ))}
            <div>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">Votre limite (formulaire, annonce, résumé…)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={limiteSaisie}
                  onChange={(e) => setLimiteSaisie(e.target.value)}
                  placeholder="1500"
                  className={classeChamp}
                />
              </label>
              <p role="status" className="text-xs text-amber-300 mt-1 empty:hidden">{alerte}</p>
              {limite > 0 && <div className="mt-2"><Jauge nom="Caractères, espaces compris" valeur={r.car} limite={limite} /></div>}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-3 lg:sticky lg:top-4" aria-live="polite">
          <div className="rounded-lg border border-sky-400/40 bg-neutral-900 px-4 py-3">
            <p className="text-sm text-neutral-400">Caractères, espaces compris</p>
            <p id="nb-caracteres" className="text-4xl font-semibold text-white tabular-nums">{nombreFr(r.car)}</p>
            <p className="text-sm text-neutral-300 mt-1">
              <span id="nb-sans-espaces" className="tabular-nums font-semibold text-white">{nombreFr(r.sansEspaces)}</span> sans espaces
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat libelle="Espaces et retours" valeur={nombreFr(r.espaces)} />
            <Stat libelle="Lignes" valeur={nombreFr(r.lignes)} />
            <Stat libelle="Mots" valeur={nombreFr(r.mots)} />
            <Stat libelle="Octets (UTF-8)" valeur={nombreFr(r.octets)} aide={`${nombreFr(r.utf16)} unités UTF-16`} />
          </div>
          <div className="rounded-lg border border-neutral-800 px-4 py-3 text-sm space-y-1">
            <p className="text-neutral-400">SMS</p>
            <p id="sms" className="text-white">
              <span className="text-lg font-semibold tabular-nums">{r.sms.segments}</span> SMS · {r.sms.codage}
            </p>
            <p className="text-neutral-400 tabular-nums">
              {r.sms.segments
                ? `${nombreFr(r.sms.restants)} position${r.sms.restants > 1 ? "s" : ""} restante${r.sms.restants > 1 ? "s" : ""} dans le dernier (${r.sms.parSegment} par SMS)`
                : "160 caractères par SMS en GSM 7 bits"}
            </p>
            {r.sms.horsGsm.length > 0 && (
              <p className="text-amber-300 [overflow-wrap:anywhere]">
                Passent le message en Unicode : {r.sms.horsGsm.slice(0, 12).map((c) => (c === "\u00A0" || c === "\u202F" ? "espace insécable" : c === "\t" ? "tabulation" : c)).join(" ")}
                {r.sms.horsGsm.length > 12 ? " …" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <Section titre="Avec ou sans espaces, et ce qu'est un caractère">
        <p>
          Le total <strong>avec espaces</strong> compte tout ce qui occupe une place : lettres, chiffres,
          ponctuation, espaces, tabulations et retours à la ligne. C'est le chiffre demandé par la plupart des
          formulaires et des réseaux sociaux. Le total <strong>sans espaces</strong> retire tous les blancs, y
          compris les espaces insécables et les retours à la ligne ; il sert surtout pour les traductions et
          certains travaux rédactionnels facturés au caractère.
        </p>
        <p>
          Le compteur compte les caractères comme on les voit à l'écran, en graphèmes, grâce à la fonction de
          découpage du navigateur (Intl.Segmenter). Un « é » saisi comme une lettre suivie d'un accent
          combinant, un emoji composé (famille, couleur de peau) ou un drapeau comptent chacun pour un. Le poids
          en octets, lui, est celui du texte encodé en UTF-8 : une lettre sans accent pèse 1 octet, une lettre
          accentuée 2, le signe euro 3 et un emoji au moins 4. Pour compter les mots plutôt que les signes,
          passez au <Link to="/compteur-de-mots/">compteur de mots</Link>.
        </p>
      </Section>

      <Section titre="Limites de X, Instagram et LinkedIn">
        <p>
          <strong>X</strong> limite un post à 280 caractères, mais tous ne pèsent pas autant : d'après sa
          documentation pour les développeurs, les lettres latines, la ponctuation et les symboles courants
          comptent pour 1, un emoji pour 2 quelle que soit sa complexité, un caractère chinois, japonais ou
          coréen pour 2, et toute adresse web pour 23, puisqu'elle est raccourcie par t.co. La jauge X applique ce
          décompte pondéré ; le total peut donc dépasser le nombre de caractères affiché à côté.
        </p>
        <p>
          <strong>LinkedIn</strong> indique dans son aide qu'un post peut contenir jusqu'à 3 000 caractères.
          Pour <strong>Instagram</strong>, la documentation de l'API de Meta fixe la légende à 2 200 caractères au
          plus, 30 hashtags et 20 mentions. Ces deux jauges utilisent le nombre de caractères avec espaces ; la
          façon dont chaque application compte les emoji n'est pas publiée, gardez donc une petite marge.
        </p>
        <p>
          Pour la <strong>meta description</strong> d'une page web, Google écrit qu'il n'y a pas de limite de
          longueur et que l'extrait est tronqué au besoin selon l'appareil : les chiffres qui circulent sont des
          habitudes, pas une règle. C'est pourquoi la page n'affiche pas de jauge pour elle.
        </p>
      </Section>

      <Section titre="SMS : 160 caractères, ou 70 avec certains accents">
        <p>
          Un SMS classique utilise l'alphabet GSM 7 bits et contient 160 caractères. Au-delà, le message est
          découpé en segments de 153 caractères, car chaque segment garde quelques octets pour être recollé à
          l'arrivée. Si le texte contient un seul caractère hors de cet alphabet, tout le message passe en
          Unicode (UCS-2) : 70 caractères pour un SMS seul, 67 par segment ensuite. Un emoji occupe alors deux
          positions.
        </p>
        <p>
          En français, l'alphabet GSM contient é, è, à, ù et ì, mais pas ê, â, î, ô, û, ë, ï, ç minuscule ni
          œ, ni l'apostrophe courbe que les téléphones et traitements de texte insèrent souvent à la place de
          l'apostrophe droite. Les signes €, [, ], {"{"}, {"}"}, \, ^, ~ et | sont dans une table d'extension et
          comptent pour deux. Le nombre de SMS facturés dépend ensuite de votre opérateur ou de votre plateforme
          d'envoi.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CompteurDeCaracteres;
