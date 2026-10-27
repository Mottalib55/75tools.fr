import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { ImageLot, ReglageQualite } from "@/components/outils/ImageLot";
import { nomSansExtension } from "@/lib/fichiers";
import { convertirImage, estHeic, heicDejaCharge, heicVersJpeg } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je n'arrive pas à ouvrir un fichier HEIC sur mon PC Windows, que faire ?",
      r: "Windows n'ouvre pas le HEIC sans module complémentaire. Il faut installer deux extensions depuis le Microsoft Store, Extensions d'image HEIF (gratuite) et Extensions vidéo HEVC (payante), toutes deux nécessaires même pour des photos. Si vous ne voulez rien installer, déposez les fichiers sur cette page : ils sont convertis en JPG, un format que la visionneuse de photos, Word ou n'importe quel site acceptent.",
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
    {
      q: "Puis-je convertir d'un coup toutes les photos HEIC d'un album ?",
      r: "Oui. Sélectionnez-les toutes dans la fenêtre de choix, ou glissez-les ensemble sur la zone de dépôt : elles sont converties l'une après l'autre, sans nombre maximal fixé par l'outil, seule la mémoire de votre appareil compte. Quand il y en a plusieurs, le bouton « Tout télécharger » les réunit dans une archive ZIP que Windows et macOS ouvrent sans logiciel supplémentaire.",
    },
  ],
  en: [
    {
      q: "My Windows laptop won't open HEIC files, what do I need?",
      r: "Windows needs two add-ons from the Microsoft Store to show HEIC photos: HEIF Image Extensions, which is free, and HEVC Video Extensions, which is paid, and both are required even for still pictures. If you would rather not install anything, drop the files on this page: they come back as JPG, which the Photos app, Word and every upload form can open.",
    },
    {
      q: "Will converting my iPhone photos to JPG reduce their quality?",
      r: "Slightly, as with any JPEG encoding, but at 85% quality or more the difference cannot be seen. The JPG will usually be larger than the HEIC, because HEIC compresses more efficiently. Keep the HEIC originals in your photo library as the best copy, and convert only the pictures you need to send, print or upload.",
    },
    {
      q: "How do I make my iPhone take photos in JPG instead of HEIC?",
      r: "Open Settings, then Camera, then Formats, and pick Most Compatible instead of High Efficiency. New photos are then saved as JPEG and use more storage. Photos you already took stay in HEIC, so convert those here. The option only appears on iPhone models that can capture HEIF, which covers every model sold in recent years.",
    },
    {
      q: "Does the converted JPG keep the photo's location and date?",
      r: "No. The picture is decoded and saved again, and its metadata (date, camera, GPS position) is not copied into the JPG. That is useful before sending a photo to a landlord or posting it online, since it no longer reveals where it was taken. For a Live Photo, only the still image is converted; the short video part is left out.",
    },
    {
      q: "Why is the first HEIC file slower to convert in Chrome?",
      r: "Safari reads HEIC natively, but Chrome, Edge and Firefox do not. In those browsers the page downloads a HEIC decoder of about 1.3 MB when you convert the first file, then reuses it for the rest of the batch. The decoder runs on your device and the photo itself is never uploaded. After that, a 12-megapixel photo takes a few seconds.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Assistance Apple", titre: "Utilisation de fichiers multimédias HEIF ou HEVC sur les appareils Apple", url: "https://support.apple.com/fr-fr/116944", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Transfert de photos à partir de votre iPhone ou iPad", url: "https://support.apple.com/fr-fr/120267", lu: "27 octobre 2026" },
    { editeur: "Assistance Microsoft", titre: "Erreur de l'éditeur de vidéo de l'application Photos : impossible d'afficher ce type de fichier", url: "https://support.microsoft.com/fr-fr/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 23008-12:2022, Part 12: Image File Format (HEIF)", url: "https://www.iso.org/standard/83650.html", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Apple Support", titre: "Using HEIF or HEVC media on Apple devices", url: "https://support.apple.com/en-gb/116944", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Transfer photos from your iPhone or iPad", url: "https://support.apple.com/en-gb/120267", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Photos app Video Editor error: Can't view this file type", url: "https://support.microsoft.com/en-gb/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 23008-12:2022, Part 12: Image File Format (HEIF)", url: "https://www.iso.org/standard/83650.html", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Convertisseur HEIC en JPG 75tools",
    motsCles: "convertir heic en jpg, heic en jpg, ouvrir un fichier heic, heic to jpg, photo iphone heic, convertisseur heic",
    choisir: "Choisir des photos HEIC",
    aide: "ou glissez-les ici (HEIC, HEIF, et aussi JPG ou PNG)",
    attente: "Vos JPG s'afficheront ici, avec le poids avant et après et un bouton pour enregistrer chaque photo.",
    noteDecodeur:
      "Dans Chrome, Firefox et Edge, un décodeur HEIC d'environ 1,3 Mo est chargé à la première photo : le premier fichier est un peu plus long. Safari lit le HEIC sans ce module.",
    preparation: "Préparation de la conversion HEIC : le premier fichier peut prendre quelques secondes de plus.",
    pasImage: "Ce fichier n'est ni une photo HEIC ni une image lisible par le navigateur.",
    module: "Décodé par le module HEIC",
    pasCharge: "Le décodeur HEIC n'a pas pu être chargé : vérifiez votre connexion, puis relancez.",
    pasDecode:
      "Ce fichier HEIC n'a pas pu être décodé (fichier abîmé ou variante non prise en charge). Essayez avec Safari, qui lit le HEIC sans module.",
    zip: "photos-jpg.zip",
  },
  en: {
    nomAppli: "75tools HEIC to JPG converter",
    motsCles: "heic to jpg, convert heic to jpg, open heic file, iphone photo heic, heic converter, heic to jpeg",
    choisir: "Choose HEIC photos",
    aide: "or drop them here (HEIC, HEIF, and also JPG or PNG)",
    attente: "Your JPG files will appear here, with the size before and after and a button to save each photo.",
    noteDecodeur:
      "In Chrome, Firefox and Edge, a HEIC decoder of about 1.3 MB loads with the first photo, so the first file takes a little longer. Safari reads HEIC without it.",
    preparation: "Getting the HEIC decoder ready: the first file may take a few extra seconds.",
    pasImage: "This file is neither a HEIC photo nor an image the browser can read.",
    module: "Decoded by the HEIC module",
    pasCharge: "The HEIC decoder could not be loaded: check your connection, then try again.",
    pasDecode:
      "This HEIC file could not be decoded (damaged file or unsupported variant). Try Safari, which reads HEIC without the module.",
    zip: "photos-jpg.zip",
  },
};

const HeicEnJpg = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [qualite, setQualite] = useState(90);
  const nb = (n: number) => n.toLocaleString(locale(lang));

  const avantTraitement = async (fichiers: File[]) => {
    if (heicDejaCharge()) return null;
    for (const f of fichiers) if (await estHeic(f)) return t.preparation;
    return null;
  };

  const traiter = async (f: File) => {
    const nom = `${nomSansExtension(f.name)}.jpg`;
    try {
      // 1. Décodeur du navigateur (Safari lit le HEIC) ou fichier déjà lisible (JPG, PNG…).
      const r = await convertirImage(f, { type: "image/jpeg", qualite: qualite / 100, fond: "#ffffff", lang });
      return { blob: r.blob, nom, detail: `${nb(r.largeur)} × ${nb(r.hauteur)} px` };
    } catch {
      if (!(await estHeic(f))) throw new Error(t.pasImage);
    }
    // 2. Navigateur sans HEIC : décodeur chargé à la demande.
    try {
      const blob = await heicVersJpeg(f, qualite / 100);
      return { blob, nom, detail: t.module };
    } catch (e) {
      const brut = (e as { message?: string })?.message ?? "";
      if (/import|fetch|dynamically|chunk/i.test(brut)) throw new Error(t.pasCharge);
      throw new Error(t.pasDecode);
    }
  };

  const outil = (
    <ImageLot
      idPrefixe="heic"
      accept=".heic,.heif,.hif,image/heic,image/heif,image/*"
      libelleDepot={t.choisir}
      aideDepot={t.aide}
      attente={t.attente}
      cle={String(qualite)}
      traiter={traiter}
      avantTraitement={avantTraitement}
      nomZip={t.zip}
      reglages={
        <div className="grid gap-4 sm:grid-cols-2 items-start">
          <ReglageQualite valeur={qualite} onChange={setQualite} />
          <p className="text-sm text-neutral-400">{t.noteDecodeur}</p>
        </div>
      }
    />
  );

  return (
    <PageOutil
      id="heic-en-jpg"
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
    <Section titre="Convertir HEIC en JPG : la conversion pas à pas">
      <p>
        Pour convertir HEIC en JPG, déposez vos photos d'iPhone dans le cadre ci-dessus, ou touchez « Choisir des
        photos HEIC » depuis le téléphone : chaque fichier .heic est décodé puis réenregistré en JPEG à la qualité
        choisie (90 % par défaut), et le JPG apparaît dans la zone de résultat avec son poids et un bouton pour
        l'enregistrer. Une photo de 12 mégapixels prise par un iPhone récent pèse souvent de 1 à 3 Mo en HEIC, et
        un peu plus en JPG, car le JPEG compresse moins bien. Safari décode le HEIC tout seul ; Chrome, Edge et
        Firefox chargent d'abord un petit décodeur, ce qui ralentit seulement le premier fichier. Aucune photo
        n'est envoyée sur un serveur : tout se passe dans votre navigateur. La limite principale tient au format
        lui-même : quelques variantes récentes et rares du HEIC peuvent résister au décodeur, et un message vous le
        signale alors clairement.
      </p>
    </Section>

    <Section titre="HEIC, HEIF : pourquoi vos photos d'iPhone ne s'ouvrent pas partout">
      <p>
        Depuis iOS 11, l'iPhone enregistre ses photos au format <strong>HEIF</strong> (High Efficiency Image File
        Format), dans des fichiers à l'extension <strong>.heic</strong>. Apple explique que ce format compresse
        mieux que le JPEG : à qualité visuelle égale, une photo occupe moins de place, ce qui compte sur un
        téléphone qui en stocke des milliers.
      </p>
      <p>
        Le revers, c'est la compatibilité. Un Mac et un iPhone lisent le HEIC sans difficulté, mais Windows demande
        des extensions à installer depuis le Microsoft Store, beaucoup de sites de démarches, de formulaires de
        candidature ou de plateformes d'impression refusent le fichier, et certains logiciels anciens ne l'affichent
        pas du tout. Le JPG, lui, est lu par tous les appareils, tous les navigateurs et tous les logiciels depuis
        des décennies.
      </p>
      <p>
        Convertir en JPG ne change ni le cadrage ni les couleurs : la photo est décodée puis réenregistrée en JPEG
        à la qualité choisie. L'orientation (portrait ou paysage) est appliquée, et les métadonnées de position ne
        sont pas reprises dans le fichier produit.
      </p>
    </Section>

    <Section titre="Éviter le HEIC à la source : les réglages de l'iPhone">
      <p>Si vous convertissez souvent, deux réglages de l'iPhone, décrits par l'assistance Apple, évitent ce travail.</p>
      <h3>Enregistrer les nouvelles photos en JPEG</h3>
      <p>
        Dans <strong>Réglages &gt; Appareil photo &gt; Formats</strong>, choisissez{" "}
        <strong>« Le plus compatible »</strong>. Les photos sont alors enregistrées en JPEG (et les vidéos en
        H.264) au lieu de HEIF. Pour revenir au format plus économe, choisissez « Haute efficacité ». Les photos
        déjà prises ne sont pas converties : elles restent en HEIC.
      </p>
      <h3>Laisser l'iPhone convertir lors du transfert</h3>
      <p>
        Quand vous importez les photos par câble USB sur un Mac ou un PC, elles peuvent être converties
        automatiquement en JPEG. Si ce n'est pas le cas, ouvrez <strong>Réglages &gt; Apps &gt; Photos</strong>,
        tout en bas, rubrique « Transférer sur Mac ou PC » : l'option « Conserver les originaux » garde le HEIC,
        l'option « Automatique » convertit. De même, une photo partagée vers un appareil qui ne gère pas le HEIC
        peut être envoyée automatiquement en JPEG.
      </p>
      <p>
        Ces conversions automatiques ne servent à rien pour des photos déjà arrivées en HEIC sur votre ordinateur,
        dans un cloud ou dans un e-mail : c'est le cas que traite cette page.
      </p>
    </Section>

    <Section titre="Mode d'emploi et conseils">
      <p>
        Déposez vos photos, autant que vous voulez : elles sont converties l'une après l'autre pour ne pas bloquer
        la page, avec le poids avant et après pour chacune. Un bouton enregistre chaque JPG ; le bouton « Tout
        télécharger » les regroupe dans une archive ZIP quand il y en a plusieurs. Si vous changez la qualité après
        coup, relancez la conversion.
      </p>
      <p>
        Pour un envoi par e-mail ou un dépôt sur un site qui limite le poids, une photo d'iPhone de 12 mégapixels
        reste lourde même en JPG. Passez ensuite par l'outil{" "}
        <Link to="/redimensionner-image/">redimensionner une image</Link>, qui réduit les dimensions ou vise un poids
        en Ko. Pour assembler plusieurs photos dans un seul document, utilisez{" "}
        <Link to="/jpg-en-pdf/">la conversion de JPG en PDF</Link>.
      </p>
      <p>
        Limite honnête : le décodeur utilisé hors Safari lit la grande majorité des photos d'iPhone, mais certaines
        variantes récentes du format peuvent lui échapper. Dans ce cas, un message l'indique ; ouvrir la page dans
        Safari sur Mac ou iPhone règle le problème.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Convert HEIC to JPG: how the conversion works">
      <p>
        To convert HEIC to JPG, drop your iPhone photos into the box above, or tap "Choose HEIC photos" on your
        phone: each .heic file is decoded and saved again as a JPEG at the quality you set (90% by default), and the
        JPG appears in the result area with its size and a Save button. A 12-megapixel photo from a recent iPhone
        usually weighs 1 to 3 MB as HEIC and a little more as JPG, since JPEG compresses less efficiently. Safari
        decodes HEIC on its own; Chrome, Edge and Firefox first load a small decoder, which only slows down the first
        file. Nothing is uploaded to a server, so this is a safe way to handle photos of a passport, a payslip or a
        lease. The main limit is the format itself: a few rare, recent HEIC variants can defeat the decoder, and a
        clear message tells you when that happens.
      </p>
    </Section>

    <Section titre="Why French upload forms turn down iPhone photos">
      <p>
        Since iOS 11, iPhones store photos in HEIF, the High Efficiency Image File Format, inside files ending in
        .heic. Apple chose it because it takes noticeably less space than a JPEG for the same visual quality. On the
        phone and on a Mac, you never notice.
      </p>
      <p>
        You notice the day you have to upload a picture somewhere else. Many French online services, from the ANEF
        portal for a titre de séjour (residence permit) to your CAF (family benefits office) account, a letting
        agency's dossier or an employer's onboarding form, list the formats they accept next to the upload button,
        and that list is usually JPG, PNG and PDF. A .heic photo of your rental contract or proof of address is then
        rejected, or accepted but unreadable for the person who opens it. Converting it to JPG removes that friction
        before you start the procedure.
      </p>
    </Section>

    <Section titre="Opening HEIC on a Windows PC without converting">
      <p>
        If you mainly want to look at the photos on a Windows computer, Microsoft offers two add-ons in the
        Microsoft Store: HEIF Image Extensions, free, and HEVC Video Extensions, paid. Once both are installed, the
        Photos app shows HEIC files. That helps on your own machine, but the people and websites you send the files
        to will still need JPG, which is why converting the copies you share remains the simpler habit.
      </p>
    </Section>

    <Section titre="Stop your iPhone saving in HEIC">
      <p>
        Two settings described by Apple Support avoid the conversion altogether. In Settings, Camera, Formats,
        choose Most Compatible: new photos are saved as JPEG and new videos as H.264, at the cost of more storage.
        Photos taken before the change stay in HEIC.
      </p>
      <p>
        For transfers by USB cable, open Settings, Apps, Photos and scroll to "Transfer to Mac or PC". Automatic
        converts photos to a compatible format while they are copied; Keep Originals copies the HEIC files as they
        are. Neither setting helps with photos that already reached your inbox or cloud storage as HEIC: that is the
        case this page handles.
      </p>
    </Section>

    <Section titre="Tips for a batch of photos">
      <p>
        Drop as many photos as you like: they are processed one after another so the page stays responsive, and the
        "Download all" button bundles them into a single ZIP that Windows and macOS open without extra software. If
        you change the quality afterwards, press the convert button again to apply it.
      </p>
      <p>
        A full-size iPhone photo is often too heavy for an upload form even as a JPG. Follow up with the tool to{" "}
        <Link to="/en/resize-image/">resize an image to a maximum size in KB</Link>, and to put several pages of a
        document into one file, use <Link to="/en/jpg-to-pdf/">JPG to PDF</Link>.
      </p>
    </Section>
  </>
);

export default HeicEnJpg;
