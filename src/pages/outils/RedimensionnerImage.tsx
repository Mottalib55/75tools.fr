import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { formatOctets, nomSansExtension } from "@/lib/fichiers";
import {
  EXTENSION,
  FormatSortie,
  decoderImage,
  encoder,
  libererCanvas,
  lireNombre,
  redimensionner,
  viserPoids,
} from "@/lib/image-lot";

type Mode = "dimensions" | "pourcentage" | "poids";
type ChoixFormat = "identique" | FormatSortie;

const FAQ: QuestionFaq[] = [
  {
    q: "Le formulaire de ma démarche refuse ma photo car elle dépasse 1 Mo, comment faire ?",
    r: "Choisissez le mode « Poids maximal », indiquez par exemple 900 Ko pour garder une marge, et déposez la photo. L'outil cherche la meilleure qualité JPEG qui tient sous ce poids, puis réduit les dimensions si cela ne suffit pas. Le poids obtenu s'affiche avant le téléchargement. Une photo de téléphone de plusieurs mégaoctets passe ainsi sous 1 Mo en restant très lisible pour un justificatif.",
  },
  {
    q: "Je veux réduire la taille d'une photo sans qu'elle soit floue, c'est possible ?",
    r: "Oui, tant que la nouvelle taille correspond à l'usage. Une photo réduite à 1 600 pixels de large reste nette sur un écran d'ordinateur et pèse beaucoup moins. Le flou apparaît quand on agrandit ensuite une image trop petite, ou quand la qualité JPEG descend très bas. Préférez réduire les dimensions plutôt que de descendre la qualité sous 70 %.",
  },
  {
    q: "Pourquoi ma photo est-elle déformée après redimensionnement ailleurs, et pas ici ?",
    r: "Une image se déforme quand on impose à la fois une largeur et une hauteur qui ne respectent pas son rapport d'origine. Ici, les proportions sont toujours gardées : si vous indiquez les deux, l'image est réduite pour tenir dans ce cadre, sans étirement ni recadrage. Pour obtenir un format imposé, comme un carré, il faut recadrer l'image avant.",
  },
  {
    q: "Quelle taille en pixels pour une image de site web ou un envoi par e-mail ?",
    r: "Pour une image en pleine largeur d'un site, 1 600 à 2 000 pixels de large suffisent, entre 150 et 400 Ko en JPEG. Pour une illustration dans un article, 1 000 à 1 200 pixels. Pour un e-mail, 1 280 à 1 600 pixels de large permettent de voir la photo confortablement sans saturer la boîte du destinataire. Une photo de téléphone en fait souvent 4 000.",
  },
  {
    q: "Le mode poids maximal marche-t-il avec un PNG ?",
    r: "Non : le PNG compresse sans perte, son poids dépend du contenu et ne se règle pas avec un curseur de qualité. Le mode poids maximal produit donc un JPEG, ou un WebP si vous le choisissez. Si votre image a de la transparence, elle reçoit la couleur de fond choisie. Pour garder un PNG plus léger, réduisez plutôt ses dimensions en pixels.",
  },
];

const Redimensionner = () => {
  const [mode, setMode] = useState<Mode>("dimensions");
  const [largeur, setLargeur] = useState("1600");
  const [hauteur, setHauteur] = useState("");
  const [agrandir, setAgrandir] = useState(false);
  const [pourcent, setPourcent] = useState("50");
  const [poidsKo, setPoidsKo] = useState("500");
  const [format, setFormat] = useState<ChoixFormat>("identique");
  const [formatPoids, setFormatPoids] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [qualite, setQualite] = useState(85);
  const [fond, setFond] = useState("#ffffff");

  const l = lireNombre(largeur, 1, 20000, "px");
  const h = lireNombre(hauteur, 1, 20000, "px");
  const p = lireNombre(pourcent, 1, agrandir ? 400 : 100, "%");
  const k = lireNombre(poidsKo, 10, 50000, "Ko");
  const messages = [
    mode === "dimensions" && l.message && `Largeur : ${l.message}`,
    mode === "dimensions" && h.message && `Hauteur : ${h.message}`,
    mode === "dimensions" && !l.valeur && !h.valeur && "Indiquez une largeur, une hauteur ou les deux.",
    mode === "pourcentage" && p.message,
    mode === "poids" && k.message,
  ].filter(Boolean) as string[];

  const formatDe = (f: File): FormatSortie => {
    if (format !== "identique") return format;
    if (f.type === "image/png") return "image/png";
    if (f.type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  /** Dimensions de sortie, proportions gardées. */
  const cible = (lo: number, ho: number) => {
    let r = 1;
    if (mode === "pourcentage") r = (p.valeur ?? 100) / 100;
    else {
      const rl = l.valeur ? l.valeur / lo : Infinity;
      const rh = h.valeur ? h.valeur / ho : Infinity;
      r = Math.min(rl, rh);
      if (!isFinite(r)) r = 1;
      if (!agrandir) r = Math.min(r, 1);
    }
    return { largeur: Math.max(1, Math.round(lo * r)), hauteur: Math.max(1, Math.round(ho * r)) };
  };

  const traiter = async (f: File) => {
    const base = nomSansExtension(f.name);
    if (mode === "poids") {
      const cibleOctets = (k.valeur ?? 500) * 1024;
      const r = await viserPoids(f, cibleOctets, formatPoids, fond);
      const detail = `${r.largeur.toLocaleString("fr-FR")} × ${r.hauteur.toLocaleString("fr-FR")} px, qualité ${Math.round(r.qualite * 100)} %${
        r.atteint ? "" : ` · objectif de ${formatOctets(cibleOctets)} non atteint`
      }`;
      return { blob: r.blob, nom: `${base}.${EXTENSION[formatPoids]}`, detail };
    }
    const type = formatDe(f);
    const img = await decoderImage(f);
    try {
      const d = cible(img.largeur, img.hauteur);
      const c = redimensionner(img.source, img.largeur, img.hauteur, d.largeur, d.hauteur, type === "image/jpeg" ? fond : undefined);
      try {
        const blob = await encoder(c, type, qualite / 100);
        return {
          blob,
          nom: `${base}.${EXTENSION[type]}`,
          detail: `${img.largeur.toLocaleString("fr-FR")} × ${img.hauteur.toLocaleString("fr-FR")} → ${c.width.toLocaleString("fr-FR")} × ${c.height.toLocaleString("fr-FR")} px`,
        };
      } finally {
        libererCanvas(c);
      }
    } finally {
      img.liberer();
    }
  };

  const cle = [mode, l.valeur, h.valeur, agrandir, p.valeur, k.valeur, format, formatPoids, qualite, fond].join("|");
  const sortieJpeg = mode === "poids" ? formatPoids === "image/jpeg" : format === "image/jpeg";
  const avecQualite = mode !== "poids" && format !== "image/png";

  const boutonMode = (m: Mode, nom: string) => (
    <button
      key={m}
      type="button"
      role="radio"
      aria-checked={mode === m}
      onClick={() => setMode(m)}
      className={`h-12 px-2 rounded-md border text-sm ${mode === m ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
    >
      {nom}
    </button>
  );

  const champ = (id: string, libelle: string, valeur: string, set: (v: string) => void, aide?: string) => (
    <label className="block min-w-0" htmlFor={id}>
      <span className="block text-sm text-neutral-300 mb-1">{libelle}</span>
      <input id={id} type="text" inputMode="decimal" value={valeur} onChange={(e) => set(e.target.value)} className={classeChamp} />
      {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
    </label>
  );

  return (
    <PageOutil
      href="/redimensionner-image/"
      titre="Redimensionner une image en ligne : pixels, %, poids en Ko"
      description="Redimensionner une image en ligne gratuitement : largeur en pixels, pourcentage ou poids maximal en Ko pour un formulaire. Plusieurs photos, ZIP, sans envoi."
      motsCles="redimensionner image en ligne, réduire la taille d'une photo, compresser image en ligne, réduire poids photo, redimensionner photo, image en ko"
      nomAppli="Redimensionner et compresser une image"
      h1="Redimensionner et compresser une image"
      chapeau="Réduisez une ou plusieurs photos en pixels, en pourcentage, ou jusqu'à un poids maximal en Ko pour passer la limite d'un formulaire. Les proportions sont gardées et rien ne quitte votre appareil."
      faq={FAQ}
      sources={[
        {
          editeur: "MDN Web Docs (Mozilla)",
          titre: "HTMLCanvasElement : méthode toBlob()",
          url: "https://developer.mozilla.org/fr/docs/Web/API/HTMLCanvasElement/toBlob",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <ImageLot
        idPrefixe="redim"
        accept="image/*,.heic,.heif"
        libelleDepot="Choisir des images"
        aideDepot="ou glissez-les ici (JPG, PNG, WebP)"
        cle={cle}
        traiter={traiter}
        libelleAction="Redimensionner"
        nomZip="images-redimensionnees.zip"
        reglages={
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Mode de réduction">
              {boutonMode("dimensions", "Pixels")}
              {boutonMode("pourcentage", "Pourcentage")}
              {boutonMode("poids", "Poids max. (Ko)")}
            </div>

            {mode === "dimensions" && (
              <div className="grid gap-4 grid-cols-2">
                {champ("redim-largeur", "Largeur max. (px)", largeur, setLargeur)}
                {champ("redim-hauteur", "Hauteur max. (px)", hauteur, setHauteur)}
                <p className="col-span-2 text-xs text-neutral-500 -mt-2">
                  Laissez un champ vide pour qu'il suive les proportions. Avec les deux, l'image tient dans le cadre,
                  sans déformation.
                </p>
              </div>
            )}
            {mode === "pourcentage" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {champ("redim-pourcent", "Taille en % de l'original", pourcent, setPourcent, "50 % divise la largeur et la hauteur par deux, et le nombre de pixels par quatre.")}
              </div>
            )}
            {mode === "poids" && (
              <div className="grid gap-4 sm:grid-cols-2 items-start">
                {champ("redim-poids", "Poids maximal (Ko)", poidsKo, setPoidsKo, "1 Mo = 1 024 Ko. Gardez une petite marge sous la limite demandée.")}
                <label className="block min-w-0" htmlFor="redim-format-poids">
                  <span className="block text-sm text-neutral-300 mb-1">Format produit</span>
                  <select
                    id="redim-format-poids"
                    value={formatPoids}
                    onChange={(e) => setFormatPoids(e.target.value as "image/jpeg" | "image/webp")}
                    className={classeSelect}
                  >
                    <option value="image/jpeg">JPG (accepté partout)</option>
                    <option value="image/webp">WebP (plus léger, pour un site)</option>
                  </select>
                </label>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 items-start">
              {mode !== "poids" && (
                <label className="block min-w-0" htmlFor="redim-format">
                  <span className="block text-sm text-neutral-300 mb-1">Format produit</span>
                  <select id="redim-format" value={format} onChange={(e) => setFormat(e.target.value as ChoixFormat)} className={classeSelect}>
                    <option value="identique">Identique à l'original</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </label>
              )}
              {avecQualite && <ReglageQualite id="redim-qualite" valeur={qualite} onChange={setQualite} />}
              {sortieJpeg && <ReglageFond valeur={fond} onChange={setFond} />}
              {mode !== "poids" && (
                <label className="flex items-center gap-3 min-h-12 text-sm text-neutral-300">
                  <input type="checkbox" checked={agrandir} onChange={(e) => setAgrandir(e.target.checked)} className="w-5 h-5 accent-sky-400" />
                  Autoriser l'agrandissement (déconseillé : l'image devient floue)
                </label>
              )}
            </div>
            <p role="status" aria-live="polite" className="text-sm text-amber-300 empty:hidden">
              {messages.join(" ")}
            </p>
          </div>
        }
      />

      <Section titre="Trois façons de réduire une image">
        <h3>En pixels</h3>
        <p>
          C'est le réglage le plus courant : vous indiquez la largeur voulue, par exemple 1 600 pixels, et la
          hauteur suit pour garder les proportions. Avec une largeur et une hauteur, l'image est réduite jusqu'à
          tenir dans ce cadre. Par défaut, une image déjà plus petite que la cible n'est pas agrandie : agrandir
          n'ajoute aucun détail, cela ne fait qu'étaler les pixels.
        </p>
        <h3>En pourcentage</h3>
        <p>
          Pratique pour un lot de photos de tailles différentes que l'on veut toutes réduire de la même façon. À
          50 %, largeur et hauteur sont divisées par deux, donc l'image compte quatre fois moins de pixels, et son
          poids baisse en général dans une proportion proche.
        </p>
        <h3>Jusqu'à un poids maximal en Ko</h3>
        <p>
          Le mode le plus utile face à un formulaire qui affiche « fichier trop volumineux, 1 Mo maximum ». Vous
          donnez le poids à ne pas dépasser ; l'outil encode la photo en JPEG à plusieurs niveaux de qualité, par
          dichotomie (il coupe l'intervalle en deux à chaque essai), pour trouver la meilleure qualité qui tient
          sous la limite. Si même une qualité de 55 % dépasse encore, il réduit les dimensions et recommence. Le
          détail affiché indique la qualité et la taille retenues, et prévient si l'objectif n'a pas pu être
          atteint.
        </p>
      </Section>

      <Section titre="Cas pratiques">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Démarche administrative, candidature, dossier de location</strong> : les plateformes limitent
            souvent chaque pièce jointe à quelques centaines de Ko ou à 1 ou 2 Mo. Mode poids maximal, avec 10 % de
            marge sous la limite.
          </li>
          <li>
            <strong>Envoi par e-mail</strong> : dix photos de téléphone dépassent vite la limite d'une messagerie.
            Réduites à 1 600 pixels de large en JPG à 85 %, elles tiennent dans un seul message, regroupées dans un
            ZIP.
          </li>
          <li>
            <strong>Site web, boutique en ligne, blog</strong> : une image de 4 000 pixels ralentit la page pour
            rien. Visez la largeur réelle d'affichage (souvent 1 200 à 2 000 pixels) et le format WebP, plus léger
            à qualité égale.
          </li>
          <li>
            <strong>Annonce ou réseau social</strong> : les plateformes recompressent de toute façon ; envoyer une
            image déjà à la bonne taille évite une double perte de qualité.
          </li>
        </ul>
      </Section>

      <Section titre="Une réduction de qualité, image par image">
        <p>
          Réduire une photo de 4 000 à 800 pixels d'un seul coup produit des contours crénelés et un effet de
          moirage sur les motifs fins. L'outil procède par réductions successives de moitié, chacune avec le
          lissage de meilleure qualité du navigateur, puis fait le dernier pas à la taille exacte : le résultat
          reste net et propre.
        </p>
        <p>
          Les photos sont traitées une par une pour ne pas saturer la mémoire, même avec des images de 12
          mégapixels ou plus, et l'orientation enregistrée par le téléphone est appliquée. Les métadonnées (date,
          appareil, position GPS) ne sont pas recopiées : c'est aussi une façon de ne pas diffuser le lieu de la
          prise de vue. Pour changer de format sans toucher à la taille, voyez <Link to="/png-en-jpg/">PNG en
          JPG</Link> ou <Link to="/heic-en-jpg/">HEIC en JPG</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default Redimensionner;
