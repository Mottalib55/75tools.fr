import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage, estHeic, heicDejaCharge, heicVersJpeg } from "@/lib/image-lot";

const FAQ: QuestionFaq[] = [
  {
    q: "Je n'arrive pas à ouvrir un fichier HEIC sur mon PC Windows, que faire ?",
    r: "Windows n'ouvre pas le HEIC sans module complémentaire. Microsoft indique qu'il faut installer deux extensions depuis le Microsoft Store, Extensions d'image HEIF (gratuite) et Extensions vidéo HEVC (payante), toutes deux nécessaires même pour des photos. Si vous ne voulez rien installer, déposez les fichiers sur cette page : ils sont convertis en JPG, un format que la visionneuse de photos, Word ou n'importe quel site acceptent.",
  },
  {
    q: "La conversion en JPG fait-elle perdre de la qualité à mes photos ?",
    r: "Un peu, comme toute compression JPEG, mais c'est invisible à l'œil à 85 % de qualité ou plus. Le fichier JPG sera en revanche plus lourd que le HEIC, parfois nettement, car le HEIC compresse mieux que le JPEG. Gardez vos originaux HEIC si vous voulez la meilleure version possible et convertissez seulement les copies à partager.",
  },
  {
    q: "Pourquoi le premier fichier met-il plus de temps à se convertir ?",
    r: "Safari sait lire le HEIC tout seul, mais Chrome, Firefox et Edge non. Dans ces navigateurs, la page télécharge un décodeur HEIC d'environ 1,3 Mo au moment de la première conversion, puis le garde pour les suivantes. Ce décodeur travaille sur votre appareil : la photo elle-même n'est jamais envoyée. Une photo de 12 mégapixels demande ensuite quelques secondes sur un ordinateur récent.",
  },
  {
    q: "Comment faire pour que mon iPhone enregistre directement en JPG ?",
    r: "Ouvrez Réglages, puis Appareil photo, puis Formats, et choisissez « Le plus compatible » au lieu de « Haute efficacité ». Les nouvelles photos seront alors enregistrées en JPEG, au prix d'un espace de stockage plus important. Les photos déjà prises restent en HEIC : convertissez-les ici. Ce réglage n'existe que sur les modèles capables d'enregistrer en HEIF.",
  },
  {
    q: "Une photo HEIC prise en mode Live Photo ou en rafale, ça marche ?",
    r: "Oui pour l'image fixe. Une Live Photo est rangée sur l'iPhone sous la forme d'une photo HEIC accompagnée d'une courte vidéo séparée : seule la photo est convertie, la partie animée est ignorée. Si un fichier HEIC contient plusieurs images, c'est la première qui est gardée. Les métadonnées (date, lieu GPS) ne sont pas recopiées dans le JPG, ce qui évite aussi de partager votre position.",
  },
];

const HeicEnJpg = () => {
  const [qualite, setQualite] = useState(90);

  const avantTraitement = async (fichiers: File[]) => {
    if (heicDejaCharge()) return null;
    for (const f of fichiers) if (await estHeic(f)) return "Préparation de la conversion HEIC : le premier fichier peut prendre quelques secondes de plus.";
    return null;
  };

  const traiter = async (f: File) => {
    const nom = `${nomSansExtension(f.name)}.jpg`;
    try {
      // 1. Décodeur du navigateur (Safari lit le HEIC) ou fichier déjà lisible (JPG, PNG…).
      const r = await convertirImage(f, { type: "image/jpeg", qualite: qualite / 100, fond: "#ffffff" });
      return { blob: r.blob, nom, detail: `${r.largeur.toLocaleString("fr-FR")} × ${r.hauteur.toLocaleString("fr-FR")} px` };
    } catch {
      if (!(await estHeic(f))) throw new Error("Ce fichier n'est ni une photo HEIC ni une image lisible par le navigateur.");
    }
    // 2. Navigateur sans HEIC : décodeur chargé à la demande.
    try {
      const blob = await heicVersJpeg(f, qualite / 100);
      return { blob, nom, detail: "Décodé par le module HEIC" };
    } catch (e) {
      const brut = (e as { message?: string })?.message ?? "";
      if (/import|fetch|dynamically|chunk/i.test(brut))
        throw new Error("Le décodeur HEIC n'a pas pu être chargé : vérifiez votre connexion, puis relancez.");
      throw new Error("Ce fichier HEIC n'a pas pu être décodé (fichier abîmé ou variante non prise en charge). Essayez avec Safari, qui lit le HEIC sans module.");
    }
  };

  return (
    <PageOutil
      href="/heic-en-jpg/"
      titre="Convertir HEIC en JPG gratuit : photos d'iPhone en ligne"
      description="Convertir HEIC en JPG en ligne et gratuit : déposez vos photos d'iPhone, réglez la qualité, récupérez des JPG ou un ZIP. Aucun envoi, tout reste sur l'appareil."
      motsCles="convertir heic en jpg, heic en jpg, ouvrir un fichier heic, heic to jpg, photo iphone heic, convertisseur heic"
      nomAppli="Convertisseur HEIC en JPG"
      h1="Convertir des photos HEIC en JPG"
      chapeau="Déposez une ou plusieurs photos HEIC (le format des iPhone) : elles sont converties en JPG, lisibles partout, une par une ou toutes ensemble dans un ZIP. La conversion se fait dans votre navigateur."
      faq={FAQ}
      sources={[
        {
          editeur: "Assistance Apple",
          titre: "Utilisation de fichiers multimédias HEIF ou HEVC sur les appareils Apple",
          url: "https://support.apple.com/fr-fr/116944",
          lu: "27 octobre 2026",
        },
        {
          editeur: "Assistance Microsoft",
          titre: "Erreur de l'éditeur de vidéo de l'application Photos : impossible d'afficher ce type de fichier",
          url: "https://support.microsoft.com/fr-fr/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <ImageLot
        idPrefixe="heic"
        accept=".heic,.heif,.hif,image/heic,image/heif,image/*"
        libelleDepot="Choisir des photos HEIC"
        aideDepot="ou glissez-les ici (HEIC, HEIF, et aussi JPG ou PNG)"
        cle={String(qualite)}
        traiter={traiter}
        avantTraitement={avantTraitement}
        nomZip="photos-jpg.zip"
        reglages={
          <div className="grid gap-4 sm:grid-cols-2 items-start">
            <ReglageQualite valeur={qualite} onChange={setQualite} />
            <p className="text-sm text-neutral-400">
              Dans Chrome, Firefox et Edge, un décodeur HEIC d'environ 1,3 Mo est chargé à la première photo : le
              premier fichier est un peu plus long. Safari lit le HEIC sans ce module.
            </p>
          </div>
        }
      />

      <Section titre="HEIC, HEIF : pourquoi vos photos d'iPhone ne s'ouvrent pas partout">
        <p>
          Depuis iOS 11, l'iPhone enregistre ses photos au format <strong>HEIF</strong> (High Efficiency Image
          File Format), dans des fichiers à l'extension <strong>.heic</strong>. Apple explique que ce format
          compresse mieux que le JPEG : à qualité visuelle égale, une photo occupe moins de place, ce qui compte
          sur un téléphone qui en stocke des milliers.
        </p>
        <p>
          Le revers, c'est la compatibilité. Un Mac et un iPhone lisent le HEIC sans difficulté, mais Windows
          demande des extensions à installer depuis le Microsoft Store, beaucoup de sites de démarches, de
          formulaires de candidature ou de plateformes d'impression refusent le fichier, et certains logiciels
          anciens ne l'affichent pas du tout. Le JPG, lui, est lu par tous les appareils, tous les navigateurs et
          tous les logiciels depuis des décennies.
        </p>
        <p>
          Convertir en JPG ne change ni le cadrage ni les couleurs : la photo est décodée puis réenregistrée en
          JPEG à la qualité choisie. L'orientation (portrait ou paysage) est appliquée, et les métadonnées de
          position ne sont pas reprises dans le fichier produit.
        </p>
      </Section>

      <Section titre="Éviter le HEIC à la source : les réglages de l'iPhone">
        <p>
          Si vous convertissez souvent, deux réglages de l'iPhone, décrits par l'assistance Apple, évitent ce
          travail.
        </p>
        <h3>Enregistrer les nouvelles photos en JPEG</h3>
        <p>
          Dans <strong>Réglages &gt; Appareil photo &gt; Formats</strong>, choisissez{" "}
          <strong>« Le plus compatible »</strong>. Les photos sont alors enregistrées en JPEG (et les vidéos en
          H.264) au lieu de HEIF. Pour revenir au format plus économe, choisissez « Haute efficacité ». Les
          photos déjà prises ne sont pas converties : elles restent en HEIC.
        </p>
        <h3>Laisser l'iPhone convertir lors du transfert</h3>
        <p>
          Quand vous importez les photos par câble USB dans Photos, Transfert d'images ou sur un PC, elles peuvent
          être converties automatiquement en JPEG. Si ce n'est pas le cas, vérifiez dans{" "}
          <strong>Réglages &gt; Apps &gt; Photos</strong>, tout en bas : l'option « Fichier d'origine » conserve
          le HEIC, c'est elle qui empêche la conversion. De même, une photo partagée par AirDrop, Messages ou
          e-mail vers un appareil qui ne gère pas le HEIC peut être envoyée automatiquement en JPEG.
        </p>
        <p>
          Ces conversions automatiques ne servent à rien pour des photos déjà arrivées en HEIC sur votre
          ordinateur, dans un cloud ou dans un e-mail : c'est le cas que traite cette page.
        </p>
      </Section>

      <Section titre="Mode d'emploi et conseils">
        <p>
          Déposez vos photos, autant que vous voulez : elles sont converties l'une après l'autre pour ne pas
          bloquer la page, avec le poids avant et après pour chacune. Un bouton télécharge chaque JPG ; le bouton
          « Tout télécharger » les regroupe dans une archive ZIP quand il y en a plusieurs. Si vous changez la
          qualité après coup, relancez la conversion.
        </p>
        <p>
          Pour un envoi par e-mail ou un dépôt sur un site qui limite le poids, une photo d'iPhone de 12
          mégapixels reste lourde même en JPG. Passez ensuite par l'outil{" "}
          <Link to="/redimensionner-image/">redimensionner une image</Link>, qui réduit les dimensions ou vise un
          poids en Ko. Pour assembler plusieurs photos dans un seul document, utilisez{" "}
          <Link to="/jpg-en-pdf/">JPG en PDF</Link>.
        </p>
        <p>
          Limite honnête : le décodeur utilisé hors Safari lit la grande majorité des photos d'iPhone, mais
          certaines variantes récentes du format peuvent lui échapper. Dans ce cas, un message l'indique ; ouvrir
          la page dans Safari sur Mac ou iPhone règle le problème.
        </p>
      </Section>
    </PageOutil>
  );
};

export default HeicEnJpg;
