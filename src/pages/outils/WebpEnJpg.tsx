import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage, EXTENSION } from "@/lib/image-lot";

const FAQ: QuestionFaq[] = [
  {
    q: "J'ai enregistré une image depuis un site et c'est un fichier .webp, pourquoi ?",
    r: "Beaucoup de sites servent leurs images en WebP parce que le format est plus léger que le JPEG et le PNG à qualité égale : les pages se chargent plus vite. Quand vous faites « Enregistrer l'image sous », vous récupérez le fichier tel qu'il a été envoyé, donc en WebP, même si l'adresse se termine parfois par .jpg. Convertissez-le ici pour l'ouvrir dans n'importe quel logiciel.",
  },
  {
    q: "WebP en JPG ou WebP en PNG, lequel choisir ?",
    r: "JPG pour une photo : le fichier reste léger et s'ouvre partout. PNG pour un logo, une icône, une capture d'écran ou toute image avec de la transparence : le PNG garde les zones transparentes et les contours nets, sans nouvelle perte. Si vous hésitez, regardez si l'image a un fond transparent sur la vignette en damier ; si oui, prenez le PNG.",
  },
  {
    q: "Un WebP animé peut-il être converti ?",
    r: "Seule la première image de l'animation est convertie : ni le JPG ni le PNG ne savent contenir une animation. Pour garder le mouvement, il faudrait un GIF ou une vidéo, ce que cet outil ne produit pas. Pour une simple image fixe tirée d'une animation, la conversion convient très bien.",
  },
  {
    q: "La conversion de WebP en PNG fait-elle grossir le fichier ?",
    r: "Souvent, oui, et c'est normal : le PNG compresse sans perte et beaucoup moins fort que le WebP, surtout pour une photo. Un WebP de 150 Ko peut donner un PNG de plus d'un mégaoctet. Le poids avant et après est affiché pour chaque image ; si le fichier est trop lourd pour votre usage, choisissez la sortie JPG.",
  },
];

const WebpEnJpg = () => {
  const [sortie, setSortie] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [qualite, setQualite] = useState(90);
  const [fond, setFond] = useState("#ffffff");

  const traiter = async (f: File) => {
    const r = await convertirImage(f, {
      type: sortie,
      qualite: qualite / 100,
      fond: sortie === "image/jpeg" ? fond : undefined,
    });
    return {
      blob: r.blob,
      nom: `${nomSansExtension(f.name)}.${EXTENSION[sortie]}`,
      detail: `${r.largeur.toLocaleString("fr-FR")} × ${r.hauteur.toLocaleString("fr-FR")} px, ${sortie === "image/png" ? "PNG" : `JPG ${qualite} %`}`,
    };
  };

  return (
    <PageOutil
      href="/webp-en-jpg/"
      titre="Convertir WebP en JPG ou PNG gratuit : en ligne, sans envoi"
      description="Convertir WebP en JPG ou en PNG en ligne et gratuit : déposez les images WebP enregistrées sur le web, choisissez le format, récupérez-les une à une ou en ZIP."
      motsCles="convertir webp en jpg, webp en jpg, webp en png, convertir webp en png, ouvrir fichier webp, webp to jpg"
      nomAppli="Convertisseur WebP en JPG et PNG"
      h1="Convertir une image WebP en JPG ou en PNG"
      chapeau="Déposez vos fichiers .webp, choisissez JPG (photos) ou PNG (logos, transparence) : chaque image est convertie dans votre navigateur, puis téléchargée seule ou dans un ZIP."
      faq={FAQ}
      sources={[
        {
          editeur: "Google for Developers",
          titre: "Un format d'image pour le Web (WebP)",
          url: "https://developers.google.com/speed/webp?hl=fr",
          lu: "27 octobre 2026",
        },
        {
          editeur: "MDN Web Docs (Mozilla)",
          titre: "Guide des types et formats de fichiers d'images",
          url: "https://developer.mozilla.org/fr/docs/Web/Media/Guides/Formats/Image_types",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <ImageLot
        idPrefixe="webp"
        accept=".webp,image/webp,image/*"
        libelleDepot="Choisir des images WebP"
        cle={`${sortie}|${qualite}|${fond}`}
        traiter={traiter}
        nomZip={sortie === "image/png" ? "images-png.zip" : "images-jpg.zip"}
        reglages={
          <div className="grid gap-4 sm:grid-cols-2 items-start">
            <div className="min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Format de sortie</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Format de sortie">
                {(
                  [
                    ["image/jpeg", "JPG", "photos"],
                    ["image/png", "PNG", "transparence"],
                  ] as const
                ).map(([v, nom, aide]) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={sortie === v}
                    onClick={() => setSortie(v)}
                    className={`h-12 rounded-md border text-sm ${sortie === v ? "border-sky-400 text-white bg-neutral-900" : "border-neutral-700 text-neutral-300"}`}
                  >
                    {nom} <span className="text-neutral-500">· {aide}</span>
                  </button>
                ))}
              </div>
            </div>
            {sortie === "image/jpeg" ? (
              <>
                <ReglageQualite valeur={qualite} onChange={setQualite} />
                <ReglageFond valeur={fond} onChange={setFond} />
              </>
            ) : (
              <p className="text-sm text-neutral-400">
                Le PNG est sans perte : pas de réglage de qualité, et la transparence du WebP est conservée.
              </p>
            )}
          </div>
        }
      />

      <Section titre="Pourquoi tant d'images du web sont en WebP">
        <p>
          Le WebP est un format d'image créé par Google pour alléger les pages web. D'après Google, une image
          WebP sans perte est environ 26 % plus petite que le même PNG, et une image WebP avec perte 25 à 34 %
          plus petite qu'un JPEG de qualité comparable. Il gère aussi la transparence et l'animation. Pour un site,
          c'est autant de données en moins à charger, donc des pages plus rapides : c'est pourquoi les boutiques en
          ligne, les journaux, les réseaux sociaux et les outils de création de sites l'utilisent par défaut.
        </p>
        <p>
          Tous les navigateurs actuels l'affichent, ce qui explique que vous ne le remarquiez pas en naviguant. Le
          format se révèle au moment d'enregistrer l'image : le fichier téléchargé porte l'extension .webp, et
          certains logiciels refusent de l'ouvrir.
        </p>
      </Section>

      <Section titre="Les logiciels qui butent sur le WebP">
        <p>
          La situation s'améliore, mais le WebP reste mal accepté par une partie des logiciels et des services
          les plus courants :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>les anciennes versions de logiciels de bureautique et de retouche, qui ne le proposent pas à l'ouverture ou à l'insertion ;</li>
          <li>beaucoup de formulaires en ligne (démarches, candidatures, annonces) qui n'acceptent que JPG, PNG ou PDF ;</li>
          <li>les bornes et services d'impression photo, qui attendent en général du JPG ;</li>
          <li>certains logiciels de mise en page ou de montage vidéo, et les visionneuses d'images anciennes.</li>
        </ul>
        <p>
          Convertir en JPG ou en PNG règle tous ces cas : ce sont les deux formats d'image les plus universellement
          reconnus.
        </p>
      </Section>

      <Section titre="Regarder un WebP sans le convertir">
        <p>
          Pour simplement voir une image WebP, inutile de la convertir : glissez le fichier dans un onglet de votre
          navigateur, Chrome, Firefox, Edge ou Safari, qui l'affiche comme n'importe quelle image. La conversion
          devient nécessaire quand il faut transmettre le fichier : le joindre à un formulaire, l'insérer dans un
          document, le faire imprimer ou le retoucher dans un logiciel qui ne le lit pas.
        </p>
        <p>
          Le WebP existe en deux variantes, avec perte (comme le JPEG) et sans perte (comme le PNG). Rien ne les
          distingue dans le nom du fichier. Si l'image contient du texte, un schéma ou de la transparence, le PNG
          préserve le mieux ce que contient le WebP ; pour une photo, le JPG suffit et reste bien plus léger.
        </p>
      </Section>

      <Section titre="Mode d'emploi">
        <p>
          Choisissez le format de sortie, puis déposez un ou plusieurs fichiers WebP. En JPG, réglez la qualité
          (90 % par défaut) et la couleur qui remplacera une éventuelle transparence, blanc par défaut. En PNG,
          rien à régler : l'image est restituée telle quelle, transparence comprise. Les images sont traitées une
          par une, avec le poids avant et après ; un bouton les regroupe dans un ZIP.
        </p>
        <p>
          Gardez en tête que le WebP d'origine était souvent déjà compressé avec perte : le convertir ne récupère
          pas les détails disparus, il les recopie dans un format plus compatible. Pour une image trop grande,
          enchaînez avec <Link to="/redimensionner-image/">redimensionner une image</Link> ; pour des PNG
          à alléger, voyez <Link to="/png-en-jpg/">PNG en JPG</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default WebpEnJpg;
