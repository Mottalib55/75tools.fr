import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw } from "lucide-react";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Bouton, QuestionFaq, Section } from "@/components/outils/OutilLayout";
import { Unite, enHtml, genererLorem } from "@/lib/texte-lorem";
import { compterMots, nombreFr } from "@/lib/texte-comptage";
import { copierTexte } from "@/lib/texte-copier";
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
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
    r: "Cochez « Balises <p> » : chaque paragraphe est entouré de balises de paragraphe, prêtes à coller dans le code d'une page ou dans le mode HTML d'un éditeur comme WordPress. Sans cette option, les paragraphes sont séparés par une ligne vide, ce qui convient à un traitement de texte, à Figma, à InDesign ou à un champ de formulaire. Le bouton Copier prend le texte dans la forme affichée.",
  },
  {
    q: "Le faux texte en français est-il copié d'un livre ?",
    r: "Non. Les phrases sont assemblées au hasard à partir d'un vocabulaire et de modèles de phrases écrits pour 75tools : un sujet, un verbe, un complément, parfois une précision de temps ou de but. Le résultat est grammaticalement correct mais ne veut rien dire de précis. Il ne reprend aucun texte existant, vous pouvez donc l'utiliser librement dans vos maquettes.",
  },
];

const BORNES: Record<Unite, [number, number, number]> = {
  paragraphes: [1, 50, 3],
  phrases: [1, 300, 8],
  mots: [1, 5000, 100],
};

const GenerateurLoremIpsum = () => {
  const [unite, setUnite] = useState<Unite>("paragraphes");
  const [nombreSaisie, setNombreSaisie] = useState("3");
  const [langue, setLangue] = useState<"latin" | "francais">("latin");
  const [classique, setClassique] = useState(true);
  const [balises, setBalises] = useState(false);
  // Graine fixe au premier rendu (HTML pré-rendu identique) ; « Nouveau texte » en tire une autre.
  const [graine, setGraine] = useState(1);
  const [message, setMessage] = useState("");

  const [min, max, defaut] = BORNES[unite];
  const n = parseInt(nombreSaisie.replace(/\s/g, ""), 10);
  let nombre = defaut;
  let alerte = "";
  if (nombreSaisie.trim() !== "") {
    if (!Number.isFinite(n)) alerte = `Saisissez un nombre entier ; ${defaut} en attendant.`;
    else if (n < min) {
      nombre = min;
      alerte = `Ramené à ${min}, le minimum.`;
    } else if (n > max) {
      nombre = max;
      alerte = `Ramené à ${nombreFr(max)}, le maximum pour les ${unite}.`;
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
  };

  const nouveau = () => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    setGraine(a[0] || 2);
    setMessage("");
  };

  return (
    <PageOutil
      href="/generateur-lorem-ipsum/"
      titre="Générateur lorem ipsum : faux texte latin ou en français"
      description="Générateur lorem ipsum gratuit : paragraphes, phrases ou mots de faux texte, en latin classique ou en français, avec ou sans balises <p>, à copier en un clic."
      motsCles="générateur lorem ipsum, lorem ipsum français, faux texte, texte de remplissage, lorem ipsum dolor sit amet"
      nomAppli="Générateur lorem ipsum 75tools"
      categorieAppli="DesignApplication"
      h1="Générateur de lorem ipsum et de faux texte"
      chapeau="Choisissez un nombre de paragraphes, de phrases ou de mots, en latin de remplissage ou en faux texte français, puis copiez le résultat, brut ou entouré de balises <p>. Le texte est fabriqué dans votre navigateur."
      faq={FAQ}
      sources={[
        { editeur: "Wikipédia", titre: "Lorem ipsum", url: "https://fr.wikipedia.org/wiki/Lorem_ipsum", lu: "27 octobre 2026" },
        { editeur: "The Latin Library", titre: "Cicéron, De finibus bonorum et malorum, livre I", url: "https://www.thelatinlibrary.com/cicero/fin1.shtml", lu: "27 octobre 2026" },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] items-start">
        <form className="min-w-0 space-y-3 rounded-lg border border-neutral-800 p-4" onSubmit={(e) => e.preventDefault()} aria-label="Réglages du faux texte">
          <div>
            <span className="block text-sm text-neutral-300 mb-1">Langue</span>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-neutral-700 p-1">
              {(["latin", "francais"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={langue === l}
                  onClick={() => setLangue(l)}
                  className={cn("h-10 rounded text-sm font-medium", langue === l ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white")}
                >
                  {l === "latin" ? "Lorem ipsum" : "Français"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Nombre</span>
              <input
                type="text"
                inputMode="numeric"
                value={nombreSaisie}
                onChange={(e) => setNombreSaisie(e.target.value)}
                className={classeChamp}
              />
            </label>
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">De</span>
              <select value={unite} onChange={(e) => changerUnite(e.target.value as Unite)} className={classeSelect}>
                <option value="paragraphes">paragraphes</option>
                <option value="phrases">phrases</option>
                <option value="mots">mots</option>
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
            Commencer par « Lorem ipsum dolor sit amet »
          </label>
          <label className="flex items-center gap-2 min-h-[2.75rem] text-sm text-neutral-200 cursor-pointer">
            <input type="checkbox" checked={balises} onChange={(e) => setBalises(e.target.checked)} className="w-5 h-5 accent-sky-400 shrink-0" />
            Balises &lt;p&gt; autour des paragraphes
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            <Bouton onClick={async () => setMessage((await copierTexte(sortie)) ? "Texte copié." : "Copie impossible : sélectionnez le texte et copiez-le.")}>
              <span className="inline-flex items-center gap-2"><Copy className="w-4 h-4" aria-hidden="true" />Copier</span>
            </Bouton>
            <Bouton secondaire onClick={nouveau}>
              <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" aria-hidden="true" />Nouveau texte</span>
            </Bouton>
          </div>
          <p role="status" className="text-sm text-neutral-400 empty:hidden">{message}</p>
        </form>

        <div className="min-w-0">
          <p className="text-sm text-neutral-500 mb-2 tabular-nums">
            {nombreFr(nbMots)} mots · {nombreFr([...sortie].length)} caractères
          </p>
          {balises ? (
            <pre id="texte-lorem" className="whitespace-pre-wrap [overflow-wrap:anywhere] rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200 max-h-[32rem] overflow-y-auto">
              {sortie}
            </pre>
          ) : (
            <div id="texte-lorem" lang={langue === "latin" ? "la" : "fr"} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-3 text-neutral-200 leading-relaxed max-h-[32rem] overflow-y-auto [overflow-wrap:anywhere]">
              {paras.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <Section titre="D'où vient le lorem ipsum">
        <p>
          Le lorem ipsum vient d'un texte de Cicéron, le <em>De finibus bonorum et malorum</em> (« Des termes
          extrêmes des biens et des maux »), écrit en 45 av. J.-C. Le passage d'origine se trouve au livre I,
          paragraphe 32, où une phrase commence par « Neque porro quisquam est qui dolorem ipsum quia dolor sit
          amet, consectetur, adipisci velit… », c'est-à-dire, à peu près : personne n'aime la douleur pour
          elle-même. Le faux texte en garde des mots, mais coupés et remaniés : « lorem » n'est que la fin de
          « dolorem ».
        </p>
        <p>
          Le rapprochement avec Cicéron est dû au latiniste américain Richard McClintock. Il pense que le faux
          texte vient d'une édition de 1914 où « dolorem » était coupé en fin de page après « do », la page
          suivante commençant par « lorem ipsum ». La société britannique Letraset l'a utilisé pendant plusieurs
          décennies dans ses publicités, puis il a été intégré au logiciel de mise en page Aldus PageMaker en 1987,
          ce qui l'a installé dans les habitudes des graphistes. Son usage par les imprimeurs avant Letraset est
          souvent affirmé, sans preuve concrète.
        </p>
      </Section>

      <Section titre="Quand utiliser un faux texte, et quand s'en passer">
        <p>
          Le faux texte sert à juger une forme sans être distrait par le fond : choisir une police et un
          interlignage, régler la largeur d'une colonne, tester un gabarit de page, une carte, un modèle
          d'e-mail ou de <Link to="/modele-carte-de-visite/">carte de visite</Link>. Il permet aussi de remplir
          un prototype avant que les textes soient écrits, à condition que tout le monde sache qu'ils sont
          provisoires.
        </p>
        <p>
          Il devient un piège quand la maquette doit être validée. Un bloc de lorem ipsum de trois lignes ne dit
          rien d'un vrai titre qui en fait cinq, d'un nom de produit à rallonge ou d'un prix qui ne tient pas sur
          un bouton. Dès que les textes existent, même en brouillon, mettez-les dans la maquette : c'est sur du
          vrai contenu que se valident une page web, une affiche ou une plaquette. Avant la mise en ligne,
          cherchez « lorem » et « ipsum » dans le site : il en reste souvent un au fond d'une page oubliée.
        </p>
        <p>
          Pour vérifier la longueur des vrais textes qui remplaceront le faux, le{" "}
          <Link to="/compteur-de-mots/">compteur de mots</Link> et le{" "}
          <Link to="/compteur-de-caracteres/">compteur de caractères</Link> donnent les chiffres exacts.
        </p>
      </Section>
    </PageOutil>
  );
};

export default GenerateurLoremIpsum;
