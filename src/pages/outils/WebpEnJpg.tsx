import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageFond, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage, EXTENSION } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "J'ai enregistré une image depuis un site et c'est un fichier .webp, pourquoi ?",
      r: "Beaucoup de sites servent leurs images en WebP parce que le format est plus léger que le JPEG et le PNG à qualité égale : les pages se chargent plus vite. Quand vous faites « Enregistrer l'image sous », vous récupérez le fichier tel qu'il a été envoyé, donc en WebP. Convertissez-le ici pour l'ouvrir dans n'importe quel logiciel ou le joindre à un formulaire.",
    },
    {
      q: "WebP en JPG ou WebP en PNG, lequel choisir ?",
      r: "JPG pour une photo : le fichier reste léger et s'ouvre partout. PNG pour un logo, une icône, une capture d'écran ou toute image avec de la transparence : le PNG garde les zones transparentes et les contours nets, sans nouvelle perte. Si vous hésitez, regardez si l'image a un fond transparent sur la vignette en damier ; si oui, prenez le PNG.",
    },
    {
      q: "Un WebP animé peut-il être converti ?",
      r: "Seule la première image de l'animation est convertie : ni le JPG ni le PNG ne savent contenir une animation. Pour garder le mouvement, il faudrait un GIF ou une vidéo, ce que cet outil ne produit pas. Pour une simple image fixe tirée d'une animation, par exemple une vignette de produit, la conversion convient très bien.",
    },
    {
      q: "La conversion de WebP en PNG fait-elle grossir le fichier ?",
      r: "Souvent, oui, et c'est normal : le PNG compresse sans perte et beaucoup moins fort que le WebP, surtout pour une photo. Un WebP de 150 Ko peut donner un PNG de plus d'un mégaoctet. Le poids avant et après est affiché pour chaque image ; si le fichier est trop lourd pour votre usage, choisissez la sortie JPG.",
    },
    {
      q: "Mon image s'appelle .jpg mais un site la refuse, est-ce un WebP déguisé ?",
      r: "C'est possible. Certains sites envoient un WebP même quand l'adresse de l'image se termine par .jpg, et le navigateur peut l'enregistrer sous ce nom trompeur. Le fichier reste un WebP à l'intérieur, et un formulaire qui contrôle le contenu le refuse. Déposez-le ici tel quel : l'outil lit le contenu réel, pas l'extension, et produit un vrai JPG ou un vrai PNG.",
    },
    {
      q: "Convertir un WebP flou en JPG le rendra-t-il plus net ?",
      r: "Non. Un WebP très compressé a déjà perdu des détails, et la conversion recopie ce qui reste dans un autre format : le JPG sera aussi flou, un peu plus si la qualité est basse. Réglez la qualité à 90 % ou plus pour ne pas ajouter de perte, ou choisissez le PNG, sans perte. Pour une image nette, cherchez une version plus grande sur le site d'origine.",
    },
  ],
  en: [
    {
      q: "Why does Save image as give me a .webp file?",
      r: "Most large websites serve their pictures as WebP because, according to Google, it is 25 to 34% lighter than JPEG at comparable quality, so pages load faster. When you save an image, you get the file exactly as it was sent, which is WebP. Convert it here to open it in any program or attach it to a form that only lists JPG and PNG.",
    },
    {
      q: "Should I convert WebP to JPG or to PNG?",
      r: "JPG for photographs: the file stays light and opens everywhere. PNG for logos, icons, screenshots and anything with a transparent background, since PNG keeps transparency and sharp edges without adding loss. If the preview in the result list shows a checkerboard pattern behind the image, it has transparency and PNG is the better choice.",
    },
    {
      q: "Can an animated WebP be converted?",
      r: "Only its first frame. Neither JPG nor PNG can hold an animation, so the result is a still image taken from the start of the clip. To keep the movement you would need a GIF or a video file, which this tool does not create. For a product thumbnail or a sticker you just want as a picture, the conversion works well.",
    },
    {
      q: "My file ends in .jpg but a form says the format is invalid, could it be WebP?",
      r: "Quite likely. Some sites deliver WebP even when the image address ends in .jpg, and the browser may save it under that misleading name. The content is still WebP, and portals that check the first bytes of the file reject it. Drop it here as it is: the tool reads the real content, not the extension, and returns a genuine JPG or PNG.",
    },
    {
      q: "Why is the PNG so much heavier than the original WebP?",
      r: "Because PNG is lossless and compresses far less than WebP, especially for photographs. A 150 KB WebP photo can become a PNG of more than 1 MB. That is expected and does not mean anything went wrong. The size before and after is shown for every file; if the PNG is too heavy for an email or an upload limit, switch the output to JPG.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Google for Developers", titre: "Un format d'image pour le Web (WebP)", url: "https://developers.google.com/speed/webp?hl=fr", lu: "27 octobre 2026" },
    { editeur: "Google for Developers", titre: "Questions fréquentes sur WebP", url: "https://developers.google.com/speed/webp/faq?hl=fr", lu: "27 octobre 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649.html", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Google for Developers", titre: "An image format for the Web (WebP)", url: "https://developers.google.com/speed/webp?hl=en", lu: "27 October 2026" },
    { editeur: "Google for Developers", titre: "WebP Frequently Asked Questions", url: "https://developers.google.com/speed/webp/faq?hl=en", lu: "27 October 2026" },
    { editeur: "IETF (RFC Editor)", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649.html", lu: "27 October 2026" },
  ],
};

type Sortie = "image/jpeg" | "image/png";

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Convertisseur WebP en JPG et PNG 75tools",
    motsCles: "convertir webp en jpg, webp en jpg, webp en png, convertir webp en png, ouvrir fichier webp, webp to jpg",
    choisir: "Choisir des images WebP",
    attente: "Les images converties s'afficheront ici, en JPG ou en PNG selon votre choix, avec leur poids.",
    format: "Format de sortie",
    jpg: "photos",
    png: "transparence",
    notePng: "Le PNG est sans perte : pas de réglage de qualité, et la transparence du WebP est conservée.",
    detail: (l: string, h: string, s: Sortie, q: number) => `${l} × ${h} px, ${s === "image/png" ? "PNG" : `JPG ${q} %`}`,
    zip: (s: Sortie) => (s === "image/png" ? "images-png.zip" : "images-jpg.zip"),
  },
  en: {
    nomAppli: "75tools WebP to JPG and PNG converter",
    motsCles: "webp to jpg, convert webp to jpg, webp to png, convert webp to png, open webp file, webp converter",
    choisir: "Choose WebP images",
    attente: "Converted images will appear here, as JPG or PNG depending on your choice, with their size.",
    format: "Output format",
    jpg: "photos",
    png: "transparency",
    notePng: "PNG is lossless: there is no quality setting, and the WebP transparency is kept.",
    detail: (l: string, h: string, s: Sortie, q: number) => `${l} × ${h} px, ${s === "image/png" ? "PNG" : `JPG ${q}%`}`,
    zip: (s: Sortie) => (s === "image/png" ? "images-png.zip" : "images-jpg.zip"),
  },
};

const WebpEnJpg = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [sortie, setSortie] = useState<Sortie>("image/jpeg");
  const [qualite, setQualite] = useState(90);
  const [fond, setFond] = useState("#ffffff");
  const nb = (n: number) => n.toLocaleString(locale(lang));

  const traiter = async (f: File) => {
    const r = await convertirImage(f, {
      type: sortie,
      qualite: qualite / 100,
      fond: sortie === "image/jpeg" ? fond : undefined,
      lang,
    });
    return {
      blob: r.blob,
      nom: `${nomSansExtension(f.name)}.${EXTENSION[sortie]}`,
      detail: t.detail(nb(r.largeur), nb(r.hauteur), sortie, qualite),
    };
  };

  const outil = (
    <ImageLot
      idPrefixe="webp"
      accept=".webp,image/webp,image/*"
      libelleDepot={t.choisir}
      attente={t.attente}
      cle={`${sortie}|${qualite}|${fond}`}
      traiter={traiter}
      nomZip={t.zip(sortie)}
      reglages={
        <div className="grid gap-4 sm:grid-cols-2 items-start">
          <div className="min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.format}</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.format}>
              {(
                [
                  ["image/jpeg", "JPG", t.jpg],
                  ["image/png", "PNG", t.png],
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
            <p className="text-sm text-neutral-400">{t.notePng}</p>
          )}
        </div>
      }
    />
  );

  return (
    <PageOutil
      id="webp-en-jpg"
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
    <Section titre="Convertir WebP en JPG ou PNG : la réponse courte">
      <p>
        Pour convertir WebP en JPG ou en PNG, choisissez le format de sortie, JPG pour une photo, PNG pour un logo
        ou une image transparente, puis déposez vos fichiers .webp dans le cadre : le navigateur les décode, les
        réencode et la zone de résultat affiche chaque image convertie avec son poids. D'après Google, un WebP avec
        perte est 25 à 34 % plus léger qu'un JPEG de qualité comparable ; attendez-vous donc à un JPG un peu plus
        lourd que le fichier de départ, et à un PNG souvent plusieurs fois plus lourd. Une image animée ne garde que
        sa première image. Rien n'est envoyé : la conversion se fait sur votre appareil, et un bouton réunit le lot
        dans un ZIP. La limite à garder en tête : la conversion ne rend pas à l'image les détails perdus lors de sa
        compression d'origine.
      </p>
    </Section>

    <Section titre="Pourquoi tant d'images du web sont en WebP">
      <p>
        Le WebP est un format d'image créé par Google pour alléger les pages web. D'après Google, une image WebP sans
        perte est environ 26 % plus petite que le même PNG, et une image WebP avec perte 25 à 34 % plus petite qu'un
        JPEG de qualité comparable. Il gère aussi la transparence et l'animation. Pour un site, c'est autant de
        données en moins à charger : c'est pourquoi les boutiques en ligne, les journaux, les réseaux sociaux et les
        outils de création de sites l'utilisent par défaut.
      </p>
      <p>
        Tous les navigateurs actuels l'affichent, ce qui explique que vous ne le remarquiez pas en naviguant. Le
        format se révèle au moment d'enregistrer l'image : le fichier téléchargé porte l'extension .webp, et certains
        logiciels refusent de l'ouvrir.
      </p>
    </Section>

    <Section titre="Les logiciels qui butent sur le WebP">
      <p>
        La situation s'améliore, mais le WebP reste mal accepté par une partie des logiciels et des services les
        plus courants : les anciennes versions de logiciels de bureautique et de retouche, qui ne le proposent pas à
        l'ouverture ; beaucoup de formulaires en ligne (démarches, candidatures, annonces) qui n'acceptent que JPG,
        PNG ou PDF ; les bornes et services d'impression photo, qui attendent en général du JPG ; certains logiciels
        de mise en page ou de montage vidéo. Convertir en JPG ou en PNG règle tous ces cas : ce sont les deux formats
        d'image les plus universellement reconnus.
      </p>
    </Section>

    <Section titre="Regarder un WebP sans le convertir">
      <p>
        Pour simplement voir une image WebP, inutile de la convertir : glissez le fichier dans un onglet de votre
        navigateur, Chrome, Firefox, Edge ou Safari, qui l'affiche comme n'importe quelle image. La conversion devient
        nécessaire quand il faut transmettre le fichier : le joindre à un formulaire, l'insérer dans un document, le
        faire imprimer ou le retoucher dans un logiciel qui ne le lit pas.
      </p>
      <p>
        Le WebP existe en deux variantes, avec perte (comme le JPEG) et sans perte (comme le PNG). Rien ne les
        distingue dans le nom du fichier. Si l'image contient du texte, un schéma ou de la transparence, le PNG
        préserve le mieux ce que contient le WebP ; pour une photo, le JPG suffit et reste bien plus léger.
      </p>
    </Section>

    <Section titre="Mode d'emploi">
      <p>
        Choisissez le format de sortie, puis déposez un ou plusieurs fichiers WebP. En JPG, réglez la qualité (90 %
        par défaut) et la couleur qui remplacera une éventuelle transparence, blanc par défaut. En PNG, rien à
        régler : l'image est restituée telle quelle, transparence comprise. Les images sont traitées une par une,
        avec le poids avant et après ; un bouton les regroupe dans un ZIP.
      </p>
      <p>
        Pour une image trop grande, enchaînez avec <Link to="/redimensionner-image/">redimensionner une image</Link>{" "}
        ; pour des PNG à alléger, voyez <Link to="/png-en-jpg/">la conversion de PNG en JPG</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Convert WebP to JPG or PNG: the short answer">
      <p>
        To convert WebP to JPG or PNG, choose the output format, JPG for a photograph, PNG for a logo or an image
        with transparency, then drop your .webp files into the box: the browser decodes them, encodes them again and
        the result area lists each converted image with its size. Google states that lossy WebP files are 25 to 34%
        smaller than comparable JPEGs, so expect the JPG to be a little heavier than the file you started with, and
        a PNG to be several times heavier. Animated WebP files keep only their first frame. Nothing leaves your
        device, and one button gathers the batch into a ZIP. Keep one limit in mind: converting cannot bring back
        detail that the website's own compression already threw away.
      </p>
    </Section>

    <Section titre="Why pictures saved from websites end up as .webp">
      <p>
        Google designed WebP to make web pages lighter. Its figures: lossless WebP is about 26% smaller than the same
        PNG, and lossy WebP 25 to 34% smaller than a JPEG of similar quality. The format also handles transparency
        and animation. Shops, newspapers, social networks and website builders therefore serve it by default, and
        every current browser displays it, so you never notice while browsing. You notice when you save a picture
        of a flat from a letting site, a product photo or a map, and the file ends in .webp.
      </p>
    </Section>

    <Section titre="Software and forms that still refuse WebP">
      <p>
        Support has improved, yet older versions of office suites and photo editors still do not offer WebP in their
        Open or Insert dialogs. Photo printing kiosks and online print services generally expect JPG. Many upload
        forms, including French administrative portals and job or rental application platforms, list only JPG, PNG
        and PDF next to the upload button. Some page layout and video editing programs also skip the format. A JPG
        or PNG copy settles every one of these cases, because those two formats are read by practically everything.
      </p>
    </Section>

    <Section titre="JPG or PNG output: choosing well">
      <p>
        WebP comes in two flavours, lossy like JPEG and lossless like PNG, and the file name does not tell you which
        one you have. A simple rule works: if the image is a photograph, choose JPG and keep the quality at 90% or
        above so the conversion adds no visible loss; if it contains text, a diagram, a logo or transparent areas,
        choose PNG, which keeps every pixel of the WebP exactly. A transparent image converted to JPG receives the
        background colour you select, white by default.
      </p>
      <p>
        If you only want to look at a WebP, there is no need to convert it: drag it into a Chrome, Firefox, Edge or
        Safari tab and it displays like any other picture. Conversion matters when the file has to travel.
      </p>
    </Section>

    <Section titre="After the conversion">
      <p>
        Images downloaded from websites are often far larger than an upload form allows, or than an email needs. To
        cut them down to a width in pixels or a maximum size in KB, use the tool to{" "}
        <Link to="/en/resize-image/">resize an image online</Link>. If you also have heavy PNG files to lighten, the
        page to <Link to="/en/png-to-jpg/">convert PNG to JPG</Link> lets you choose the background for transparent
        areas.
      </p>
    </Section>
  </>
);

export default WebpEnJpg;
