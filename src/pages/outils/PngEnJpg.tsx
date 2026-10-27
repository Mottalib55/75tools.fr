import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage } from "@/lib/image-lot";

const FAQ: QuestionFaq[] = [
  {
    q: "Mon logo PNG a un fond transparent, que devient-il en JPG ?",
    r: "Le JPG ne sait pas enregistrer la transparence : chaque pixel transparent doit recevoir une couleur. Par défaut, c'est le blanc, ce qui convient à un document ou une page blanche. Si le logo doit aller sur un fond coloré, choisissez cette couleur avant de convertir. Mais pour un logo qu'on posera sur des fonds différents, gardez plutôt le PNG d'origine : la transparence est justement son intérêt.",
  },
  {
    q: "Pourquoi mon fichier JPG est-il parfois plus lourd que le PNG ?",
    r: "Cela arrive avec les images faites de grands aplats de couleur, de texte ou de traits fins : captures d'écran, schémas, logos. Le PNG les compresse très bien sans rien perdre, alors que le JPG, conçu pour les photos, crée de petits défauts autour des contours et n'y gagne rien. L'outil affiche le poids avant et après : si le JPG pèse plus, gardez le PNG pour cette image.",
  },
  {
    q: "Quelle qualité JPG choisir pour un envoi par e-mail ou sur un site ?",
    r: "Entre 80 et 90 % pour une photo : la différence avec l'original ne se voit pas et le poids baisse nettement. En dessous de 70 %, des blocs et des halos apparaissent dans les dégradés, le ciel et autour des contours. Pour réduire encore le poids sans abîmer l'image, il vaut mieux diminuer ses dimensions en pixels qu'écraser la qualité.",
  },
  {
    q: "Je convertis une capture d'écran en JPG, le texte devient flou, c'est normal ?",
    r: "Oui. La compression JPEG découpe l'image en petits blocs et lisse les détails fins, ce qui brouille les lettres et fait apparaître des points autour du texte. Pour une capture d'écran destinée à être lue, gardez le PNG, ou montez la qualité à 95 % si un site exige absolument un JPG. Le problème ne se pose pas avec une photo.",
  },
];

const PngEnJpg = () => {
  const [qualite, setQualite] = useState(88);
  const [fond, setFond] = useState("#ffffff");

  const traiter = async (f: File) => {
    const r = await convertirImage(f, { type: "image/jpeg", qualite: qualite / 100, fond });
    return {
      blob: r.blob,
      nom: `${nomSansExtension(f.name)}.jpg`,
      detail: `${r.largeur.toLocaleString("fr-FR")} × ${r.hauteur.toLocaleString("fr-FR")} px, qualité ${qualite} %`,
    };
  };

  return (
    <PageOutil
      href="/png-en-jpg/"
      titre="Convertir PNG en JPG gratuit : en ligne, couleur de fond"
      description="Convertir PNG en JPG en ligne et gratuit : plusieurs images à la fois, couleur de fond pour la transparence, qualité réglable, poids avant et après, ZIP."
      motsCles="convertir png en jpg, png en jpg, png to jpg, convertisseur png jpg, png en jpeg"
      nomAppli="Convertisseur PNG en JPG"
      h1="Convertir des images PNG en JPG"
      chapeau="Déposez vos PNG : ils sont convertis en JPG, avec la couleur de votre choix à la place des zones transparentes et le poids avant et après pour chaque image. Tout se passe dans votre navigateur."
      faq={FAQ}
      sources={[
        {
          editeur: "MDN Web Docs (Mozilla)",
          titre: "Guide des types et formats de fichiers d'images",
          url: "https://developer.mozilla.org/fr/docs/Web/Media/Guides/Formats/Image_types",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <ImageLot
        idPrefixe="png"
        accept=".png,image/png,image/*"
        libelleDepot="Choisir des images PNG"
        cle={`${qualite}|${fond}`}
        traiter={traiter}
        nomZip="images-jpg.zip"
        reglages={
          <div className="grid gap-4 sm:grid-cols-2 items-start">
            <ReglageFond valeur={fond} onChange={setFond} />
            <ReglageQualite valeur={qualite} onChange={setQualite} />
          </div>
        }
      />

      <Section titre="PNG ou JPG : deux formats pour deux usages">
        <p>
          Le <strong>PNG</strong> compresse sans perte : chaque pixel est restitué à l'identique, et il gère la
          transparence. Le <strong>JPEG</strong> (fichiers .jpg ou .jpeg) compresse avec perte : il élimine des
          détails que l'œil remarque peu, ce qui le rend bien plus léger pour une photo, mais il ne connaît pas la
          transparence.
        </p>
        <p>
          Une photo enregistrée en PNG est donc souvent inutilement lourde : plusieurs mégaoctets là où un JPG de
          qualité équivalente à l'œil en pèse une fraction. C'est le cas typique des photos exportées d'un logiciel
          de retouche, des images générées ou des photos passées par une capture d'écran. Les convertir en JPG les
          rend faciles à envoyer par e-mail, à publier ou à déposer sur un site qui limite le poids.
        </p>
      </Section>

      <Section titre="Quand garder le PNG">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Logo, icône, pictogramme</strong> : ils ont besoin d'un fond transparent pour se poser sur
            n'importe quelle couleur, et leurs aplats nets supportent mal la compression JPEG.
          </li>
          <li>
            <strong>Capture d'écran</strong> avec du texte, un tableau ou une interface : le PNG garde les lettres
            nettes et pèse souvent moins qu'un JPG de bonne qualité.
          </li>
          <li>
            <strong>Schéma, graphique, dessin au trait</strong> : mêmes raisons, peu de couleurs et des contours
            francs.
          </li>
          <li>
            <strong>Image que vous allez encore retoucher</strong> : chaque enregistrement en JPG ajoute une
            perte. Travaillez sur le PNG et exportez le JPG à la fin.
          </li>
        </ul>
        <p>
          Pour une photo, en revanche, le JPG est presque toujours le bon choix. En cas de doute, convertissez et
          regardez le poids affiché : si le JPG ne fait pas gagner de place, gardez le PNG.
        </p>
      </Section>

      <Section titre="Ce que devient la transparence">
        <p>
          Un PNG peut contenir des pixels entièrement transparents, mais aussi des pixels à demi transparents :
          c'est ce qui adoucit le contour d'un logo ou d'un texte détouré. Lors de la conversion, chaque pixel est
          posé sur la couleur de fond choisie et mélangé avec elle dans la proportion de sa transparence. Le bord
          reste ainsi lisse, mais il prend une teinte calculée pour ce fond précis.
        </p>
        <p>
          D'où ce conseil : choisissez la couleur de la page ou du support où l'image sera posée. Un logo converti
          sur fond blanc puis placé sur un bandeau gris laissera voir un fin liseré clair autour de ses lettres. Si
          la couleur du support peut changer, gardez le PNG transparent.
        </p>
      </Section>

      <Section titre="Mode d'emploi">
        <p>
          Choisissez d'abord la couleur qui remplacera la transparence (blanc par défaut) et la qualité, puis
          déposez vos images : elles sont converties une par une, même s'il y en a plusieurs dizaines, sans figer
          la page. Chaque ligne montre le poids du PNG, celui du JPG et l'écart en pourcentage. Téléchargez les
          images une à une, ou toutes ensemble dans une archive ZIP. Si vous modifiez un réglage, relancez la
          conversion pour l'appliquer.
        </p>
        <p>
          Les dimensions ne changent pas. Pour réduire la taille en pixels ou viser un poids précis en Ko, passez
          par <Link to="/redimensionner-image/">redimensionner une image</Link>. Pour retirer un fond uni et
          obtenir au contraire un PNG transparent, voyez{" "}
          <Link to="/supprimer-fond-image/">supprimer le fond d'une image</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default PngEnJpg;
