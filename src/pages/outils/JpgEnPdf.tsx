import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, PDFImage } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Progression, Alerte, ListeOrdonnable, ChoixListe } from "@/components/outils/PdfOutils";
import { nouvelId, orientationJpeg, typeImage, respirer } from "@/lib/pdf-outils";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob, chargerImage } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Ma photo prise au téléphone apparaît couchée dans le PDF, pourquoi ?",
      r: "Les téléphones enregistrent souvent la photo dans le sens du capteur et notent à part, dans les données EXIF, qu'il faut la tourner à l'affichage. Certains convertisseurs ignorent cette indication. Ici, elle est lue et appliquée : la page reprend le sens que vous voyez dans votre galerie. Si une image reste mal orientée, c'est qu'elle a été enregistrée ainsi ; faites-la pivoter dans votre galerie avant de l'ajouter.",
    },
    {
      q: "Combien d'images puis-je mettre dans un seul PDF ?",
      r: "Il n'y a pas de limite fixée par l'outil, seulement celle de la mémoire de votre appareil. Quelques dizaines de photos passent sans difficulté sur un ordinateur comme sur un téléphone récent. Pour un très gros lot, l'option « Réduites » allège chaque photo et accélère la création ; vous pouvez aussi faire plusieurs PDF, puis les réunir avec l'outil de fusion.",
    },
    {
      q: "Le PDF obtenu est trop lourd pour être envoyé, comment l'alléger ?",
      r: "Choisissez « Réduites » dans le réglage du poids des photos avant de créer le PDF : chaque photo est ramenée à 2 000 pixels sur son plus grand côté, ce qui reste net sur une page A4 et divise souvent le poids par trois ou plus. Si ce n'est pas suffisant, passez le PDF obtenu dans l'outil de compression en mode fort.",
    },
    {
      q: "Puis-je convertir des images PNG ou WebP, et pas seulement des JPG ?",
      r: "Oui. Le JPG et le PNG sont intégrés tels quels, sans perte, la transparence du PNG comprise. Le WebP, format courant des images téléchargées sur le web, n'est pas accepté directement par le format PDF : il est d'abord converti en JPEG de bonne qualité dans votre navigateur, sur fond blanc. Le HEIC des iPhone doit d'abord passer par l'outil HEIC en JPG.",
    },
    {
      q: "Comment mettre le recto et le verso de ma carte d'identité dans un seul PDF ?",
      r: "Ajoutez les deux photos, recto en premier, puis choisissez le format A4 et l'orientation « Selon chaque image » : chaque face occupe une page, dans le bon sens. Vous obtenez un PDF de 2 pages, le format que demandent la plupart des formulaires en ligne. Recadrez chaque photo au ras de la carte avant de l'ajouter, pour que le texte soit grand et lisible.",
    },
    {
      q: "Quelle marge choisir pour imprimer le PDF sans couper l'image ?",
      r: "Prenez la marge normale de 10 mm ou plus. La plupart des imprimantes de bureau ne savent pas imprimer jusqu'au bord de la feuille et laissent 3 à 5 mm blancs : avec « Aucune », le bord de la photo risque d'être rogné. Pour un document lu seulement à l'écran, la marge nulle ou le format « Taille de l'image » conviennent.",
    },
  ],
  en: [
    {
      q: "My phone photo appears sideways in the PDF, why?",
      r: "Phones often save a photo in the sensor's direction and note separately, in the EXIF data, that it must be rotated for display. Some converters ignore that note. This one reads and applies it, so each page matches what you see in your gallery. If an image is still the wrong way round, it was saved that way: rotate it in your gallery before adding it.",
    },
    {
      q: "How many images can I put in a single PDF?",
      r: "The tool sets no limit, only your device's memory does. A few dozen photos work fine on a computer and on a recent phone. For a very large batch, the Reduced setting makes each photo lighter and speeds up the conversion; you can also build several PDFs and then join them with the merge tool, which also runs in your browser.",
    },
    {
      q: "The PDF is too heavy to upload, how do I make it lighter?",
      r: "Choose Reduced in the photo size setting before creating the PDF: each photo is scaled to 2,000 pixels on its longest side, which stays sharp on an A4 page and often divides the size by three or more. If the file is still above the limit of a French portal such as ANEF or your CAF account, run it through the compression tool in strong mode.",
    },
    {
      q: "Can I convert PNG or WebP images, not only JPG?",
      r: "Yes. JPG and PNG files are embedded as they are, without loss, PNG transparency included. WebP, common for images saved from the web, is not accepted by the PDF format itself, so your browser first converts it to a good-quality JPEG on a white background. iPhone HEIC photos must go through the HEIC to JPG tool first.",
    },
    {
      q: "How do I put both sides of my residence permit in one PDF?",
      r: "Add the two photos, front first, then choose A4 and the Match each image orientation: each side gets its own page, the right way up. You get a 2-page PDF, the format most French online forms expect for a titre de séjour or an ID card. Crop each photo close to the card first so the text is large and readable.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 216:2007, formats A et B du papier d'écriture et de certains imprimés", url: "https://www.iso.org/standard/36631.html", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, compression numérique des images fixes (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 15948:2004, Portable Network Graphics (PNG), spécification fonctionnelle", url: "https://www.iso.org/standard/29581.html", lu: "27 octobre 2026" },
    { editeur: "RFC Editor", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Utilisation de fichiers multimédias HEIF ou HEVC sur les appareils Apple", url: "https://support.apple.com/fr-fr/116944", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 216:2007, Writing paper and certain classes of printed matter, A and B series", url: "https://www.iso.org/standard/36631.html", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 10918-1:1994, Digital compression and coding of continuous-tone still images (JPEG)", url: "https://www.iso.org/standard/18902.html", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 15948:2004, Portable Network Graphics (PNG): Functional specification", url: "https://www.iso.org/standard/29581.html", lu: "27 October 2026" },
    { editeur: "RFC Editor", titre: "RFC 9649, WebP Image Format", url: "https://www.rfc-editor.org/rfc/rfc9649", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Using HEIF or HEVC media on Apple devices", url: "https://support.apple.com/en-us/116944", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Convertisseur JPG en PDF 75tools",
    motsCles: "convertir jpg en pdf, jpg en pdf, transformer une image en pdf, photo en pdf gratuit, png en pdf, image en pdf",
    choisir: "Choisir des images",
    ajouter: "Ajouter d'autres images",
    aide: "JPG, PNG ou WebP ; ou glissez vos images ici",
    lecture: "Lecture des images…",
    formatNon: "format non pris en charge (JPG, PNG ou WebP attendus)",
    illisible: (m: string) => `Image illisible : ${m}.`,
    heic: "Photo HEIC : convertissez-la d'abord avec l'outil HEIC en JPG.",
    format: "Format de page",
    formats: { a4: "A4 (21 × 29,7 cm)", lettre: "Lettre US (21,6 × 27,9 cm)", image: "Taille de l'image" },
    orientation: "Orientation",
    orientations: { auto: "Selon chaque image", portrait: "Portrait", paysage: "Paysage" },
    marge: "Marge",
    marges: { "0": "Aucune", "5": "Fine (5 mm)", "10": "Normale (10 mm)", "20": "Large (20 mm)" },
    poids: "Poids des photos",
    poidsOpt: { original: "Originales, sans perte", reduit: "Réduites (2 000 px), plus léger" },
    ajout: "Ajout des images",
    enregistrement: "Enregistrement du PDF",
    echec: (m: string) => `La création du PDF a échoué : ${m}`,
    bouton: (n: number) => `Créer le PDF${n > 1 ? ` (${n} pages)` : ""}`,
    enCours: "Création en cours…",
    vider: "Vider la liste",
    attente: "Ajoutez une ou plusieurs images : le nombre de pages et le poids du PDF s'afficheront ici, avec le bouton de téléchargement.",
    pret: (p: string, n: number, o: string) => `PDF prêt : ${p} page${n > 1 ? "s" : ""}, ${o}.`,
    telecharger: "Télécharger le PDF",
    nomDefaut: "images",
  },
  en: {
    nomAppli: "75tools JPG to PDF converter",
    motsCles: "jpg to pdf, convert jpg to pdf, image to pdf, photo to pdf free, png to pdf, combine images into pdf",
    choisir: "Choose images",
    ajouter: "Add more images",
    aide: "JPG, PNG or WebP; or drop your images here",
    lecture: "Reading the images…",
    formatNon: "unsupported format (JPG, PNG or WebP expected)",
    illisible: (m: string) => `Unreadable image: ${m}.`,
    heic: "HEIC photo: convert it first with the HEIC to JPG tool.",
    format: "Page size",
    formats: { a4: "A4 (210 × 297 mm)", lettre: "US Letter (8.5 × 11 in)", image: "Image size" },
    orientation: "Orientation",
    orientations: { auto: "Match each image", portrait: "Portrait", paysage: "Landscape" },
    marge: "Margin",
    marges: { "0": "None", "5": "Thin (5 mm)", "10": "Normal (10 mm)", "20": "Wide (20 mm)" },
    poids: "Photo size",
    poidsOpt: { original: "Original, lossless", reduit: "Reduced (2,000 px), lighter" },
    ajout: "Adding the images",
    enregistrement: "Saving the PDF",
    echec: (m: string) => `Creating the PDF failed: ${m}`,
    bouton: (n: number) => `Create PDF${n > 1 ? ` (${n} pages)` : ""}`,
    enCours: "Creating…",
    vider: "Clear the list",
    attente: "Add one or more images: the page count and size of the PDF will show here, with the download button.",
    pret: (p: string, n: number, o: string) => `PDF ready: ${p} page${n > 1 ? "s" : ""}, ${o}.`,
    telecharger: "Download PDF",
    nomDefaut: "images",
  },
};

interface Img {
  id: string;
  fichier: File;
  url: string;
  largeur: number;
  hauteur: number;
  erreur: string;
}

type Format = "a4" | "lettre" | "image";

const MM = 72 / 25.4;

/** Décode une image en respectant l'orientation EXIF (createImageBitmap, sinon <img> qui l'applique). */
async function decoder(f: Blob): Promise<{ source: CanvasImageSource; l: number; h: number; fermer: () => void }> {
  try {
    const b = await createImageBitmap(f, { imageOrientation: "from-image" } as ImageBitmapOptions);
    return { source: b, l: b.width, h: b.height, fermer: () => b.close() };
  } catch {
    const img = await chargerImage(f);
    return { source: img, l: img.naturalWidth, h: img.naturalHeight, fermer: () => URL.revokeObjectURL(img.src) };
  }
}

const JpgEnPdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [images, setImages] = useState<Img[]>([]);
  const [format, setFormat] = useState<Format>("a4");
  const [orientation, setOrientation] = useState("auto");
  const [marge, setMarge] = useState("10");
  const [poids, setPoids] = useState("original");
  const [analyse, setAnalyse] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [prog, setProg] = useState({ texte: "", fait: 0, total: 0 });
  const [erreur, setErreur] = useState("");
  const [res, setRes] = useState<Blob | null>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const ajouter = async (fichiers: File[]) => {
    setRes(null);
    setErreur("");
    setAnalyse(true);
    const nouvelles: Img[] = [];
    for (const f of fichiers) {
      const url = URL.createObjectURL(f);
      urls.current.push(url);
      const el: Img = { id: nouvelId(), fichier: f, url, largeur: 0, hauteur: 0, erreur: "" };
      try {
        const ty = typeImage(await lireOctets(f.slice(0, 16)));
        if (ty === "autre") throw new Error(t.formatNon);
        const d = await decoder(f);
        el.largeur = d.l;
        el.hauteur = d.h;
        d.fermer();
      } catch (e) {
        el.erreur = t.illisible((e as Error).message || t.formatNon);
        if (/heic|heif/i.test(f.name) || /heic|heif/i.test(f.type)) el.erreur = t.heic;
      }
      nouvelles.push(el);
    }
    setImages((l) => [...l, ...nouvelles]);
    setAnalyse(false);
  };

  const valides = images.filter((i) => !i.erreur);

  /** Intègre l'image dans le PDF : octets d'origine si possible, sinon passage par un canvas. */
  const integrer = async (pdf: PDFDocument, im: Img): Promise<{ image: PDFImage; l: number; h: number }> => {
    const o = await lireOctets(im.fichier);
    const ty = typeImage(o);
    const reduire = poids === "reduit" && Math.max(im.largeur, im.hauteur) > 2000;
    if (!reduire) {
      try {
        if (ty === "jpg" && orientationJpeg(o) <= 1) return { image: await pdf.embedJpg(o), l: im.largeur, h: im.hauteur };
        if (ty === "png") return { image: await pdf.embedPng(o), l: im.largeur, h: im.hauteur };
      } catch {
        /* variante non gérée par pdf-lib : on repasse par le canvas */
      }
    }
    const d = await decoder(im.fichier);
    const k = reduire ? 2000 / Math.max(d.l, d.h) : 1;
    const c = document.createElement("canvas");
    c.width = Math.round(d.l * k);
    c.height = Math.round(d.h * k);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(d.source, 0, 0, c.width, c.height);
    d.fermer();
    const b = await canvasVersBlob(c, "image/jpeg", reduire ? 0.85 : 0.92);
    const dims = { l: c.width, h: c.height };
    c.width = c.height = 0;
    return { image: await pdf.embedJpg(await lireOctets(b)), ...dims };
  };

  const creer = async () => {
    setEnCours(true);
    setErreur("");
    setRes(null);
    try {
      const pdf = await PDFDocument.create();
      const m = parseFloat(marge) * MM;
      for (let i = 0; i < valides.length; i++) {
        setProg({ texte: t.ajout, fait: i, total: valides.length });
        await respirer();
        const im = valides[i];
        const { image } = await integrer(pdf, im);
        // Taille « naturelle » de l'image : 96 pixels par pouce, soit 0,75 point par pixel.
        const nl = im.largeur * 0.75;
        const nh = im.hauteur * 0.75;
        let pl: number, ph: number;
        if (format === "image") {
          pl = nl + 2 * m;
          ph = nh + 2 * m;
        } else {
          const [a, b] = format === "a4" ? [595.28, 841.89] : [612, 792];
          const paysage = orientation === "paysage" || (orientation === "auto" && im.largeur > im.hauteur);
          [pl, ph] = paysage ? [b, a] : [a, b];
        }
        const page = pdf.addPage([pl, ph]);
        const zl = Math.max(pl - 2 * m, 1);
        const zh = Math.max(ph - 2 * m, 1);
        const k = format === "image" ? 1 : Math.min(zl / nl, zh / nh);
        const w = nl * k;
        const h = nh * k;
        page.drawImage(image, { x: (pl - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      setProg({ texte: t.enregistrement, fait: valides.length, total: valides.length });
      await respirer();
      const o = await pdf.save({ useObjectStreams: true });
      setRes(new Blob([o], { type: "application/pdf" }));
    } catch (e) {
      setErreur(t.echec((e as Error).message));
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = valides.length === 1 ? `${nomSansExtension(valides[0].fichier.name)}.pdf` : `${t.nomDefaut}.pdf`;
  const changer = (f: (v: string) => void) => (v: string) => {
    f(v);
    setRes(null);
  };

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div className="space-y-5 min-w-0">
        <DepotFichiers
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onFichiers={ajouter}
          libelle={images.length ? t.ajouter : t.choisir}
          aide={t.aide}
        />
        {analyse && <p role="status" className="text-sm text-neutral-400">{t.lecture}</p>}

        {images.length > 0 && (
          <ListeOrdonnable
            elements={images}
            onChange={(l) => {
              setImages(l);
              setRes(null);
            }}
            desactive={enCours}
            libelle={(e) => e.fichier.name}
            rendu={(e) => (
              <div className="flex items-center gap-3 min-w-0">
                <img src={e.url} alt="" className="w-12 h-12 shrink-0 object-contain bg-neutral-800 rounded" />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-100 truncate" title={e.fichier.name}>
                    {e.fichier.name}
                  </p>
                  {e.erreur ? (
                    <p className="text-xs text-red-300 [overflow-wrap:anywhere]">{e.erreur}</p>
                  ) : (
                    <p className="text-xs text-neutral-500 tabular-nums">
                      {nb(e.largeur)} × {nb(e.hauteur)} px · {formatOctets(e.fichier.size, lang)}
                    </p>
                  )}
                </div>
              </div>
            )}
          />
        )}

        <fieldset disabled={enCours} className="grid gap-4 sm:grid-cols-2">
          <ChoixListe label={t.format} value={format} onChange={changer((v) => setFormat(v as Format))}>
            <option value="a4">{t.formats.a4}</option>
            <option value="lettre">{t.formats.lettre}</option>
            <option value="image">{t.formats.image}</option>
          </ChoixListe>
          <ChoixListe label={t.orientation} value={orientation} onChange={changer(setOrientation)} disabled={format === "image"}>
            <option value="auto">{t.orientations.auto}</option>
            <option value="portrait">{t.orientations.portrait}</option>
            <option value="paysage">{t.orientations.paysage}</option>
          </ChoixListe>
          <ChoixListe label={t.marge} value={marge} onChange={changer(setMarge)}>
            <option value="0">{t.marges["0"]}</option>
            <option value="5">{t.marges["5"]}</option>
            <option value="10">{t.marges["10"]}</option>
            <option value="20">{t.marges["20"]}</option>
          </ChoixListe>
          <ChoixListe label={t.poids} value={poids} onChange={changer(setPoids)}>
            <option value="original">{t.poidsOpt.original}</option>
            <option value="reduit">{t.poidsOpt.reduit}</option>
          </ChoixListe>
        </fieldset>
      </div>

      <div data-resultat className="space-y-4 lg:sticky lg:top-4">
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={creer} disabled={!valides.length || enCours || analyse}>
            {enCours ? t.enCours : t.bouton(valides.length)}
          </Bouton>
          {images.length > 0 && (
            <Bouton
              secondaire
              disabled={enCours}
              onClick={() => {
                setImages([]);
                setRes(null);
              }}
            >
              {t.vider}
            </Bouton>
          )}
        </div>
        {erreur && <Alerte>{erreur}</Alerte>}
        {enCours && <Progression {...prog} />}
        {!res && !enCours && <p className="text-sm text-neutral-500">{t.attente}</p>}
        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 tabular-nums">{t.pret(nb(valides.length), valides.length, formatOctets(res.size, lang))}</p>
            <Bouton onClick={() => telecharger(nomSortie, res)}>{t.telecharger}</Bouton>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="jpg-en-pdf"
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
    <Section titre="Convertir JPG en PDF en moins d'une minute">
      <p>
        Pour convertir un JPG en PDF, ajoutez votre ou vos photos dans le cadre ci-dessus, rangez-les dans l'ordre
        des pages, gardez le format A4 avec une marge de 10 mm, puis cliquez sur « Créer le PDF » : chaque image
        devient une page, et le document se télécharge aussitôt. Le PNG et le WebP sont acceptés aussi. Exemple :
        les trois photos d'un bail prises au téléphone donnent un PDF A4 de 3 pages ; en réglage « Réduites »,
        trois photos de 4 Mo tombent souvent sous 2 Mo au total, assez pour la plupart des formulaires en ligne.
        L'orientation des photos de téléphone est lue et respectée, donc aucune page n'arrive couchée. Les images
        ne quittent pas votre appareil : la conversion se fait dans votre navigateur. Limite principale : une
        photo floue ou mal cadrée le restera dans le PDF, et les photos HEIC d'iPhone doivent d'abord être
        converties en JPG.
      </p>
    </Section>

    <Section titre="Transformer une photo en PDF, pas à pas">
      <p>
        Ajoutez vos images : une seule pour un justificatif, plusieurs pour un document de plusieurs pages pris
        en photo (un bail, un relevé, un devis signé). Chacune devient une page, dans l'ordre de la liste ;
        déplacez-les avec les flèches, ou en glissant une ligne sur ordinateur.
      </p>
      <p>
        Choisissez ensuite la mise en page. <strong>A4</strong> est le format attendu en France par les
        administrations et pour l'impression ; <strong>Lettre US</strong> sert pour un destinataire nord-américain.
        Avec <strong>Taille de l'image</strong>, la page épouse exactement la photo, sans bande blanche : c'est
        adapté à une lecture à l'écran, moins à l'impression. L'orientation « Selon chaque image » met en paysage
        les photos plus larges que hautes et en portrait les autres, page par page. L'image n'est jamais
        déformée : elle est agrandie ou réduite pour tenir dans la page en gardant ses proportions, puis centrée.
      </p>
    </Section>

    <Section titre="Qualité, poids et orientation des photos">
      <p>
        En réglage « Originales », les fichiers JPG et PNG sont placés dans le PDF tels quels, octet pour octet :
        aucune perte de qualité, mais un PDF qui pèse à peu près la somme des photos. Le réglage « Réduites »
        ramène chaque photo à 2 000 pixels sur son plus grand côté, soit plus de 170 points par pouce sur une page
        A4 entière : c'est net à l'impression et bien plus léger.
      </p>
      <p>
        Les WebP sont convertis en JPEG sur fond blanc, car le format PDF n'accepte pas le WebP. Pour les photos
        HEIC d'iPhone, passez d'abord par l'outil <Link to="/heic-en-jpg/">HEIC en JPG</Link>. Pour l'opération
        inverse, sortir les pages d'un PDF en images, utilisez <Link to="/pdf-en-jpg/">PDF en JPG</Link>. Et pour
        ajouter ces pages à un PDF existant, créez le PDF ici puis <Link to="/fusionner-pdf/">fusionnez-le</Link>{" "}
        avec l'autre document.
      </p>
    </Section>

    <Section titre="Photographier un document pour en faire un PDF lisible">
      <p>
        Posez la feuille à plat sur une surface sombre et unie, à la lumière du jour plutôt que sous une lampe
        qui crée des reflets. Tenez le téléphone parallèle à la feuille, au-dessus de son centre, pour éviter
        l'effet de trapèze, et désactivez le flash, qui laisse une tache blanche sur le papier glacé. Vérifiez
        chaque photo en zoomant sur les petits caractères avant de créer le PDF, et recadrez au besoin dans votre
        galerie.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Convert JPG to PDF in under a minute">
      <p>
        To convert a JPG to PDF, add your photo or photos in the box above, put them in page order, keep A4 with a
        10 mm margin, then click "Create PDF": each image becomes one page and the document downloads straight
        away. PNG and WebP files work too. Example: three phone photos of a French bail (lease) give a 3-page A4
        PDF; with the Reduced setting, three 4 MB photos often come to under 2 MB in total, small enough for most
        French upload forms such as the CAF or ANEF portals. The orientation stored by your phone is read and
        applied, so no page arrives sideways. Your images never leave your device: the conversion runs in your
        browser. The main limit: a blurry or badly framed photo stays that way in the PDF, and iPhone HEIC photos
        must be converted to JPG first.
      </p>
    </Section>

    <Section titre="Turning photos into a PDF, step by step">
      <p>
        Add your images: one for a single supporting document, several for a multi-page paper document you
        photographed (a lease, a bank statement, a signed quote). Each image becomes a page, in list order; move
        them with the arrows, or drag a row on a computer.
      </p>
      <p>
        Then pick the layout. <strong>A4</strong> is the size French offices expect and the one French printers
        use; <strong>US Letter</strong> is for a North American recipient. With <strong>Image size</strong>, the
        page fits the photo exactly with no white border, which suits on-screen reading more than printing. The
        Match each image orientation puts photos wider than tall in landscape and the others in portrait, page by
        page. The image is never distorted: it is scaled to fit the page while keeping its proportions, then
        centred.
      </p>
    </Section>

    <Section titre="Quality, file size and photo orientation">
      <p>
        With the Original setting, JPG and PNG files go into the PDF byte for byte: no quality loss, but the PDF
        weighs about as much as the photos together. The Reduced setting scales each photo to 2,000 pixels on its
        longest side, more than 170 dots per inch on a full A4 page: sharp when printed and much lighter.
      </p>
      <p>
        WebP images are converted to JPEG on a white background, because the PDF format does not accept WebP. For
        iPhone HEIC photos, use the <Link to="/en/heic-to-jpg/">HEIC to JPG converter</Link> first. To go the other
        way and turn PDF pages into images, use <Link to="/en/pdf-to-jpg/">PDF to JPG</Link>. To add these pages to
        an existing PDF, create the PDF here and then <Link to="/en/merge-pdf/">merge it</Link> with the other
        document.
      </p>
    </Section>

    <Section titre="Photographing a document so the PDF is readable">
      <p>
        Lay the sheet flat on a dark, plain surface, in daylight rather than under a lamp that causes glare. Hold
        the phone parallel to the sheet, above its centre, to avoid a keystone effect, and turn off the flash,
        which leaves a white spot on glossy paper. Zoom in on the small print of each photo before creating the
        PDF, and crop in your gallery if needed.
      </p>
    </Section>
  </>
);

export default JpgEnPdf;
