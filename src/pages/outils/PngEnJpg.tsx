import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
    {
      q: "Un site exige un JPG : puis-je simplement renommer mon fichier .png en .jpg ?",
      r: "Non. Changer l'extension ne modifie pas le contenu : le fichier reste un PNG déguisé. Beaucoup de formulaires lisent les premiers octets du fichier, sa signature, et le refusent alors comme « format non valide » ; d'autres l'acceptent, mais l'image s'affiche mal chez le destinataire. Une vraie conversion réencode les pixels en JPEG : c'est ce que fait cet outil, en quelques secondes et sans envoi.",
    },
    {
      q: "Combien de poids gagne-t-on en passant une photo PNG en JPG ?",
      r: "Sur une vraie photo, le gain est souvent spectaculaire : un PNG de 12 mégapixels dépasse fréquemment 15 Mo, alors que le même cliché en JPG à 85 % tient en général entre 2 et 5 Mo. Sur une capture d'écran ou un logo, au contraire, le gain peut être nul, voire négatif. L'outil affiche pour chaque image le poids avant et après, avec l'écart en pourcentage.",
    },
  ],
  en: [
    {
      q: "My PNG logo has a transparent background, what happens to it in JPG?",
      r: "JPEG cannot store transparency, so every transparent pixel has to receive a colour. White is the default, which suits a letter or a white web page. If the logo will sit on a coloured banner, pick that colour before converting. For a logo you will place on many different backgrounds, keep the PNG: transparency is the whole point of it.",
    },
    {
      q: "Why is the JPG sometimes larger than my PNG?",
      r: "It happens with images made of flat colour, text or thin lines, such as screenshots, diagrams and logos. PNG compresses those very well without losing anything, while JPEG, designed for photographs, adds small artefacts around edges and saves nothing. The tool shows both sizes for each file: when the JPG is heavier, keep the PNG for that image.",
    },
    {
      q: "The text in my screenshot looks fuzzy after converting, can I fix it?",
      r: "Raise the quality to 95% and convert again: the blur around letters fades, although the file grows. JPEG splits the picture into small blocks and smooths fine detail, which is exactly what text suffers from. If the form you are filling in accepts PNG, send the original screenshot instead; it stays perfectly sharp and is often lighter.",
    },
    {
      q: "Can I just rename image.png to image.jpg for a form that wants JPG?",
      r: "No. Renaming changes the label, not the content, so the file is still a PNG. Many upload forms, including French administrative portals, read the first bytes of the file and reject it as an invalid format; others accept it and the recipient sees an error. A real conversion re-encodes the pixels as JPEG, which this tool does in a few seconds without uploading anything.",
    },
    {
      q: "How much smaller will a PNG photo be once converted to JPG?",
      r: "For a real photograph, often five to ten times smaller: a 12-megapixel PNG commonly exceeds 15 MB, while the same picture as a JPG at 85% usually weighs 2 to 5 MB. For screenshots and logos the saving can be zero or even negative. Each line of the result list shows the size before, the size after and the difference as a percentage.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 15948:2004, Portable Network Graphics (PNG): Functional specification", url: "https://www.iso.org/standard/29581.html", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, compression numérique des images fixes à tons continus (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 15948:2004, Portable Network Graphics (PNG): Functional specification", url: "https://www.iso.org/standard/29581.html", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, Digital compression and coding of continuous-tone still images (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Convertisseur PNG en JPG 75tools",
    motsCles: "convertir png en jpg, png en jpg, png to jpg, convertisseur png jpg, png en jpeg",
    choisir: "Choisir des images PNG",
    attente: "Chaque JPG s'affichera ici avec le poids du PNG, celui du JPG et l'écart en pourcentage.",
    detail: (l: string, h: string, q: number) => `${l} × ${h} px, qualité ${q} %`,
    zip: "images-jpg.zip",
  },
  en: {
    nomAppli: "75tools PNG to JPG converter",
    motsCles: "png to jpg, convert png to jpg, png to jpeg, png jpg converter, change png to jpg",
    choisir: "Choose PNG images",
    attente: "Each JPG will appear here with the PNG size, the JPG size and the difference as a percentage.",
    detail: (l: string, h: string, q: number) => `${l} × ${h} px, quality ${q}%`,
    zip: "images-jpg.zip",
  },
};

const PngEnJpg = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [qualite, setQualite] = useState(88);
  const [fond, setFond] = useState("#ffffff");
  const nb = (n: number) => n.toLocaleString(locale(lang));

  const traiter = async (f: File) => {
    const r = await convertirImage(f, { type: "image/jpeg", qualite: qualite / 100, fond, lang });
    return { blob: r.blob, nom: `${nomSansExtension(f.name)}.jpg`, detail: t.detail(nb(r.largeur), nb(r.hauteur), qualite) };
  };

  const outil = (
    <ImageLot
      idPrefixe="png"
      accept=".png,image/png,image/*"
      libelleDepot={t.choisir}
      attente={t.attente}
      cle={`${qualite}|${fond}`}
      traiter={traiter}
      nomZip={t.zip}
      reglages={
        <div className="grid gap-4 sm:grid-cols-2 items-start">
          <ReglageFond valeur={fond} onChange={setFond} />
          <ReglageQualite valeur={qualite} onChange={setQualite} />
        </div>
      }
    />
  );

  return (
    <PageOutil
      id="png-en-jpg"
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
    <Section titre="Convertir PNG en JPG : ce que devient votre fichier">
      <p>
        Pour convertir PNG en JPG, choisissez d'abord la couleur qui remplacera la transparence (blanc par défaut)
        et la qualité (88 % par défaut), puis déposez vos images dans le cadre : chaque PNG est réencodé en JPEG par
        votre navigateur, et la zone de résultat affiche aussitôt le poids avant et après. Sur une photo, l'écart
        va souvent de cinq à dix fois : un export PNG de 18 Mo sorti d'un logiciel de retouche descend autour de
        3 Mo. Sur une capture d'écran pleine de texte, c'est l'inverse : le JPG peut peser plus lourd et brouiller
        les lettres, l'outil le montre et vous gardez alors le PNG. Les dimensions en pixels ne changent pas, aucun
        fichier n'est envoyé sur un serveur, et un bouton réunit tout le lot dans une archive ZIP. Seule vraie
        perte : la transparence, que le format JPEG ignore.
      </p>
    </Section>

    <Section titre="PNG ou JPG : deux formats pour deux usages">
      <p>
        Le <strong>PNG</strong> compresse sans perte : chaque pixel est restitué à l'identique, et il gère la
        transparence. Le <strong>JPEG</strong> (fichiers .jpg ou .jpeg) compresse avec perte : il élimine des
        détails que l'œil remarque peu, ce qui le rend bien plus léger pour une photo, mais il ne connaît pas la
        transparence.
      </p>
      <p>
        Une photo enregistrée en PNG est donc souvent inutilement lourde : plusieurs mégaoctets là où un JPG de
        qualité équivalente à l'œil en pèse une fraction. C'est le cas typique des photos exportées d'un logiciel de
        retouche, des images générées ou des photos passées par une capture d'écran. Les convertir en JPG les rend
        faciles à envoyer par e-mail, à publier ou à déposer sur un site qui limite le poids.
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
          <strong>Image que vous allez encore retoucher</strong> : chaque enregistrement en JPG ajoute une perte.
          Travaillez sur le PNG et exportez le JPG à la fin.
        </li>
      </ul>
      <p>
        Pour une photo, en revanche, le JPG est presque toujours le bon choix. En cas de doute, convertissez et
        regardez le poids affiché : si le JPG ne fait pas gagner de place, gardez le PNG.
      </p>
    </Section>

    <Section titre="Ce que devient la transparence">
      <p>
        Un PNG peut contenir des pixels entièrement transparents, mais aussi des pixels à demi transparents : c'est
        ce qui adoucit le contour d'un logo ou d'un texte détouré. Lors de la conversion, chaque pixel est posé sur
        la couleur de fond choisie et mélangé avec elle dans la proportion de sa transparence. Le bord reste ainsi
        lisse, mais il prend une teinte calculée pour ce fond précis.
      </p>
      <p>
        D'où ce conseil : choisissez la couleur de la page ou du support où l'image sera posée. Un logo converti sur
        fond blanc puis placé sur un bandeau gris laissera voir un fin liseré clair autour de ses lettres. Si la
        couleur du support peut changer, gardez le PNG transparent.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Réglez le fond et la qualité, puis déposez vos images : elles sont converties une par une, même s'il y en a
        plusieurs dizaines, sans figer la page. Chaque ligne montre le poids du PNG, celui du JPG et l'écart en
        pourcentage. Téléchargez les images une à une, ou toutes ensemble dans une archive ZIP. Si vous modifiez un
        réglage, relancez la conversion pour l'appliquer.
      </p>
      <p>
        Les dimensions ne changent pas. Pour réduire la taille en pixels ou viser un poids précis en Ko, passez par{" "}
        <Link to="/redimensionner-image/">l'outil pour redimensionner une image</Link>. Pour retirer un fond uni et
        obtenir au contraire un PNG transparent, voyez{" "}
        <Link to="/supprimer-fond-image/">supprimer le fond d'une image</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Convert PNG to JPG: what happens to your file">
      <p>
        To convert PNG to JPG, first pick the colour that will replace transparent areas (white by default) and the
        quality (88% by default), then drop your images into the box: your browser re-encodes each PNG as a JPEG and
        the result area shows the size before and after straight away. On a photograph the file typically shrinks
        five to ten times, so an 18 MB PNG exported from an editing app ends up around 3 MB. On a screenshot full of
        text the opposite can happen: the JPG may be heavier and the letters blurred, which the tool makes visible
        so you can keep the PNG. Pixel dimensions stay the same, no file is uploaded to a server, and one button
        bundles the whole batch into a ZIP. The only real loss is transparency, which JPEG does not support.
      </p>
    </Section>

    <Section titre="Where your PNG files come from">
      <p>
        Most people do not choose PNG; their tools choose it for them. A screenshot taken on a Mac with
        Shift-Command-4 is saved as PNG, and so is a capture made with the Windows Snipping Tool. Design apps export
        PNG by default, and many AI image generators deliver their pictures in PNG too. For a screenshot that is a
        sensible choice. For a photo, it means a file several times heavier than it needs to be.
      </p>
      <p>
        That weight becomes a problem when you email a set of flat photos to an estate agent, attach a scanned
        document to a message to the préfecture, or post pictures to a listing site such as Le Bon Coin. A
        conversion to JPG brings those files back to a size that mail servers and upload forms accept.
      </p>
    </Section>

    <Section titre="When PNG is the better file to keep">
      <p>
        Keep the PNG for logos and icons, which need a transparent background to sit on any colour and have crisp
        flat areas that JPEG handles badly. Keep it for screenshots of text, tables or software, where PNG keeps
        every letter sharp and is often lighter than a good JPG. Keep it for diagrams and line drawings for the same
        reasons, and for any image you are still editing, because every JPEG save loses a little more detail. For
        photographs, JPG is almost always the right format.
      </p>
    </Section>

    <Section titre="Transparency and the background colour">
      <p>
        A PNG can hold fully transparent pixels and also semi-transparent ones, which soften the edges of a logo or
        cut-out text. During conversion each pixel is laid on the background colour you picked and blended with it
        in proportion to its transparency. Edges stay smooth, but their tint is calculated for that background only.
        Convert a logo on white, place it on a grey banner, and a thin light halo will show around the letters. Pick
        the colour of the page where the image will appear, or keep the transparent PNG if that colour may change.
      </p>
    </Section>

    <Section titre="Next steps">
      <p>
        Dimensions are not changed here. To make the images smaller in pixels or to hit a precise size in KB for an
        upload form, use the tool to <Link to="/en/resize-image/">resize an image online</Link>. To go the other way
        and turn a plain background into transparency, see{" "}
        <Link to="/en/remove-background/">remove the background from an image</Link>.
      </p>
    </Section>
  </>
);

export default PngEnJpg;
