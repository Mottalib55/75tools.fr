import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Progression, Alerte, Segments } from "@/components/outils/PdfOutils";
import { analyserPlages, pagesUniques, messagePdfJs, estPdf, respirer } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { creerZip } from "@/lib/zip";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Quelle résolution choisir pour convertir un PDF en image ?",
      r: "72 dpi suffit pour un aperçu ou une vignette sur un site. 150 dpi convient à la plupart des usages : insérer une page dans une présentation, l'envoyer par messagerie, l'afficher en plein écran. 300 dpi est la résolution d'impression : une page A4 fait alors environ 2 480 × 3 508 pixels, avec des fichiers nettement plus lourds et une conversion plus longue.",
    },
    {
      q: "JPG ou PNG : lequel prendre pour mes pages ?",
      r: "Le JPG donne des fichiers légers et convient bien aux pages qui contiennent des photos ou des scans. Le PNG est sans perte : les textes fins, les tableaux et les schémas restent parfaitement nets, sans les petits halos que le JPG laisse autour des lettres, mais les fichiers sont plus lourds. Pour une page de texte à relire de près, préférez le PNG.",
    },
    {
      q: "Comment convertir une seule page du PDF en JPG ?",
      r: "Tapez son numéro dans le champ « Pages à convertir », par exemple 3, puis cliquez sur le bouton : seule cette page est dessinée et vous obtenez une image unique, à télécharger directement sans archive ZIP. Pour quelques pages, séparez-les par des virgules (1, 4, 9) ou indiquez un intervalle (2-5). Laissez le champ vide pour convertir le document entier.",
    },
    {
      q: "Le texte de l'image obtenue peut-il être copié ?",
      r: "Non. L'image est une photographie de la page : le texte n'y est plus que des pixels. Pour copier du texte, ouvrez le PDF d'origine dans votre lecteur et sélectionnez-le. Pour transformer l'image en texte, il faudrait un logiciel de reconnaissance de caractères (OCR), ce que cet outil ne fait pas. Gardez donc toujours le PDF à côté des images.",
    },
    {
      q: "Pourquoi une page sort-elle avec une résolution plus faible que celle demandée ?",
      r: "Pour les pages de très grand format, comme un plan ou une affiche, l'image à 300 dpi dépasserait la taille qu'un navigateur peut dessiner, surtout sur téléphone. L'outil limite alors chaque image à environ 16 millions de pixels et vous le signale sous la page concernée. Les pages au format A4 ou Lettre ne sont pas concernées, même à 300 dpi.",
    },
    {
      q: "Le convertisseur refuse mon PDF verrouillé par un mot de passe, comment faire ?",
      r: "Un PDF chiffré à l'ouverture ne peut pas être dessiné sans sa clé, et l'outil ne demande pas de mot de passe. Ouvrez le fichier dans votre lecteur habituel en le saisissant, choisissez « Imprimer » puis « Enregistrer au format PDF », et déposez cette copie. Un PDF seulement protégé contre la modification ou la copie s'ouvre, lui, normalement.",
    },
  ],
  en: [
    {
      q: "Which resolution should I pick to turn a PDF into images?",
      r: "72 dpi is enough for a preview or a thumbnail on a website. 150 dpi suits most uses: a slide in a presentation, an image sent by WhatsApp or email, full-screen viewing. 300 dpi is print resolution: an A4 page then measures about 2,480 × 3,508 pixels, with much heavier files and a longer conversion, so keep it for documents you will print.",
    },
    {
      q: "Should I save my pages as JPG or PNG?",
      r: "JPG gives light files and works well for pages with photos or scans. PNG is lossless: fine text, tables and diagrams stay perfectly sharp, without the faint halos JPG leaves around letters, but files are heavier, often three to five times the size. For a page of small print you need to read closely, such as a French payslip, choose PNG.",
    },
    {
      q: "How do I convert just one page of the PDF?",
      r: "Type its number in the \"Pages to convert\" box, for example 3, then press the button: only that page is rendered and you get a single image to download directly, without a ZIP file. For a few pages, separate them with commas (1, 4, 9) or give a range (2-5). Leave the box empty to convert the whole document.",
    },
    {
      q: "Can I copy the text from the image I get?",
      r: "No. The image is a picture of the page: its text is just pixels. To copy text, open the original PDF in your reader and select it there. Turning an image back into text needs optical character recognition (OCR), which this tool does not do. Keep the PDF alongside the images, especially for an official French document you may need to quote.",
    },
    {
      q: "The converter rejects my password-protected PDF, what can I do?",
      r: "A PDF encrypted at opening cannot be rendered without its key, and the tool does not ask for passwords. Open the file in your usual reader with the password, choose Print then Save as PDF, and drop that copy here. A PDF that is only protected against editing or copying opens normally. Only do this with a document that belongs to you.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "JPEG File Interchange Format, version 1.02", url: "https://www.w3.org/Graphics/JPEG/jfif3.pdf", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 October 2026" },
    { editeur: "W3C", titre: "Portable Network Graphics (PNG) Specification (Third Edition)", url: "https://www.w3.org/TR/png-3/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "JPEG File Interchange Format, version 1.02", url: "https://www.w3.org/Graphics/JPEG/jfif3.pdf", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Convertisseur PDF en JPG 75tools",
    motsCles: "convertir pdf en jpg, pdf en jpg, pdf en image gratuit, pdf en png, transformer pdf en image",
    choisir: "Choisir un PDF",
    pasPdf: (n: string) => `« ${n} » n'est pas un PDF (l'en-tête %PDF est absent).`,
    nomCite: (n: string) => `« ${n} »`,
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Changer de fichier",
    resolution: "Résolution",
    format: "Format des images",
    pages: "Pages à convertir",
    exemple: "vide = toutes ; par exemple 1-3, 5",
    long: (n: number) => `${n} pages à 300 dpi : la conversion peut être longue et occuper beaucoup de mémoire sur un téléphone.`,
    enCours: "Conversion en cours…",
    convertir: (n: number) => (n > 1 ? `Convertir ${n} pages` : n === 1 ? "Convertir la page" : "Convertir en images"),
    conversion: "Conversion des pages",
    termine: "Terminé",
    echec: (m: string) => `La conversion a échoué : ${m}`,
    attente: "Le nombre d'images et leur poids s'afficheront ici, avec le bouton de téléchargement. Les aperçus apparaissent sous l'outil.",
    pretes: (n: string, plur: boolean, t: string) => `${n} image${plur ? "s" : ""} prête${plur ? "s" : ""}, ${t} au total.`,
    archive: "Préparation de l'archive…",
    toutZip: "Tout télécharger (ZIP)",
    uneImage: "Télécharger l'image",
    pageN: (n: number) => `Page ${n}`,
    reduit: "Résolution réduite : page de très grand format.",
    telecharger: "Télécharger",
  },
  en: {
    nomAppli: "75tools PDF to JPG converter",
    motsCles: "pdf to jpg, convert pdf to jpg, pdf to image free, pdf to png, convert pdf pages to images",
    choisir: "Choose a PDF",
    pasPdf: (n: string) => `"${n}" is not a PDF (the %PDF header is missing).`,
    nomCite: (n: string) => `"${n}"`,
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Change file",
    resolution: "Resolution",
    format: "Image format",
    pages: "Pages to convert",
    exemple: "empty = all; for example 1-3, 5",
    long: (n: number) => `${n} pages at 300 dpi: the conversion may take a while and use a lot of memory on a phone.`,
    enCours: "Converting…",
    convertir: (n: number) => (n > 1 ? `Convert ${n} pages` : n === 1 ? "Convert the page" : "Convert to images"),
    conversion: "Converting pages",
    termine: "Done",
    echec: (m: string) => `Conversion failed: ${m}`,
    attente: "The number of images and their size will show here, with the download button. Previews appear below the tool.",
    pretes: (n: string, plur: boolean, t: string) => `${n} image${plur ? "s" : ""} ready, ${t} in total.`,
    archive: "Preparing the archive…",
    toutZip: "Download all (ZIP)",
    uneImage: "Download the image",
    pageN: (n: number) => `Page ${n}`,
    reduit: "Resolution reduced: very large page.",
    telecharger: "Download",
  },
};

interface Rendu {
  page: number;
  blob: Blob;
  url: string;
  l: number;
  h: number;
  reduit: boolean;
}

const LIMITE_PIXELS = 16e6;

const PdfEnJpg = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [fichier, setFichier] = useState<File | null>(null);
  const [octets, setOctets] = useState<Uint8Array | null>(null);
  const [nbPages, setNbPages] = useState(0);
  const [dpi, setDpi] = useState("150");
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [texte, setTexte] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [prog, setProg] = useState({ texte: "", fait: 0, total: 0 });
  const [erreur, setErreur] = useState("");
  const [rendus, setRendus] = useState<Rendu[]>([]);
  const [zipPret, setZipPret] = useState(false);
  const urls = useRef<string[]>([]);
  const oct = (n: number) => formatOctets(n, lang);
  const nb = (n: number) => n.toLocaleString(locale(lang));

  const vider = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
    setRendus([]);
  };
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setErreur("");
    vider();
    setFichier(null);
    try {
      const o = await lireOctets(fi);
      if (!estPdf(o)) throw new Error(t.pasPdf(fi.name));
      let doc;
      try {
        doc = await ouvrirPdf(o.slice());
      } catch (e) {
        throw new Error(messagePdfJs(e, t.nomCite(fi.name), lang));
      }
      setNbPages(doc.numPages);
      await doc.destroy();
      setOctets(o);
      setFichier(fi);
      setTexte("");
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

  const analyse = useMemo(() => analyserPlages(texte, nbPages || 1, lang), [texte, nbPages, lang]);
  const pages = texte.trim() === "" ? Array.from({ length: nbPages }, (_, i) => i + 1) : pagesUniques(analyse.plages);
  const base = fichier ? nomSansExtension(fichier.name) : "page";
  const chiffres = Math.max(2, String(nbPages).length);
  const nomPage = (r: Rendu) => `${base}-page-${String(r.page).padStart(chiffres, "0")}.${r.blob.type === "image/png" ? "png" : "jpg"}`;

  const convertir = async () => {
    if (!octets || !pages.length) return;
    setEnCours(true);
    setErreur("");
    vider();
    let doc;
    try {
      doc = await ouvrirPdf(octets.slice());
      const echelle = parseInt(dpi, 10) / 72;
      const liste: Rendu[] = [];
      for (let i = 0; i < pages.length; i++) {
        setProg({ texte: t.conversion, fait: i, total: pages.length });
        await respirer();
        const p = pages[i];
        const vue = (await doc.getPage(p)).getViewport({ scale: 1 });
        const max = Math.sqrt(LIMITE_PIXELS / (vue.width * vue.height));
        const e = Math.min(echelle, max);
        const c = await rendrePage(doc, p, e);
        const blob = await canvasVersBlob(c, format === "jpg" ? "image/jpeg" : "image/png", 0.9);
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        liste.push({ page: p, blob, url, l: c.width, h: c.height, reduit: e < echelle });
        c.width = c.height = 0;
        setRendus([...liste]);
      }
      setProg({ texte: t.termine, fait: pages.length, total: pages.length });
    } catch (e) {
      setErreur(t.echec((e as Error).message));
    } finally {
      await doc?.destroy();
      setEnCours(false);
    }
  };

  const zip = async () => {
    setZipPret(true);
    try {
      const b = await creerZip(rendus.map((r) => ({ nom: nomPage(r), donnees: r.blob })));
      telecharger(`${base}-images.zip`, b);
    } finally {
      setZipPret(false);
    }
  };

  const total = rendus.reduce((s, r) => s + r.blob.size, 0);

  const outil = (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
        <div className="space-y-5 min-w-0">
          {!fichier ? (
            <DepotFichiers accept=".pdf,application/pdf" onFichiers={ouvrir} libelle={t.choisir} />
          ) : (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
              <p className="min-w-0 [overflow-wrap:anywhere]">
                <span className="text-white">{fichier.name}</span>
                <span className="block text-sm text-neutral-400 tabular-nums">
                  {oct(fichier.size)} · {nb(nbPages)} {t.page(nbPages)}
                </span>
              </p>
              <Bouton
                secondaire
                disabled={enCours}
                onClick={() => {
                  setFichier(null);
                  setOctets(null);
                  setNbPages(0);
                  vider();
                }}
              >
                {t.changer}
              </Bouton>
            </div>
          )}

          {erreur && <Alerte>{erreur}</Alerte>}

          <fieldset disabled={enCours} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-300 mb-1">{t.resolution}</p>
                <Segments
                  nom={t.resolution}
                  valeur={dpi}
                  onChange={setDpi}
                  options={[
                    { v: "72", l: "72 dpi" },
                    { v: "150", l: "150 dpi" },
                    { v: "300", l: "300 dpi" },
                  ]}
                />
              </div>
              <div>
                <p className="text-sm text-neutral-300 mb-1">{t.format}</p>
                <Segments
                  nom={t.format}
                  valeur={format}
                  onChange={(v) => setFormat(v as "jpg" | "png")}
                  options={[
                    { v: "jpg", l: "JPG" },
                    { v: "png", l: "PNG" },
                  ]}
                />
              </div>
            </div>
            <label className="block max-w-xl">
              <span className="block text-sm text-neutral-300 mb-1">{t.pages}</span>
              <input
                type="text"
                inputMode="numeric"
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder={t.exemple}
                className={classeChamp}
              />
            </label>
            {analyse.erreur && texte.trim() && <Alerte>{analyse.erreur}</Alerte>}
            {analyse.avertissements.length > 0 && fichier && texte.trim() && (
              <Alerte ton="info">
                {analyse.avertissements.map((a) => (
                  <span key={a} className="block">
                    {a}
                  </span>
                ))}
              </Alerte>
            )}
          </fieldset>
        </div>

        <div data-resultat className="space-y-4 lg:sticky lg:top-4">
          <Bouton onClick={convertir} disabled={!fichier || enCours || !pages.length || (!!analyse.erreur && !!texte.trim())}>
            {enCours ? t.enCours : t.convertir(pages.length)}
          </Bouton>
          {fichier && dpi === "300" && pages.length > 30 && <p className="text-sm text-amber-200/90">{t.long(pages.length)}</p>}
          {enCours && <Progression {...prog} />}
          {rendus.length === 0 && !enCours && <p className="text-sm text-neutral-500">{t.attente}</p>}
          {rendus.length > 0 && !enCours && (
            <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
              <p className="text-neutral-200 tabular-nums">{t.pretes(nb(rendus.length), rendus.length > 1, oct(total))}</p>
              {rendus.length > 1 ? (
                <Bouton onClick={zip} disabled={zipPret}>
                  {zipPret ? t.archive : t.toutZip}
                </Bouton>
              ) : (
                <Bouton onClick={() => telecharger(nomPage(rendus[0]), rendus[0].blob)}>{t.uneImage}</Bouton>
              )}
            </div>
          )}
        </div>
      </div>

      {rendus.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {rendus.map((r) => (
            <li key={r.page} className="rounded-lg border border-neutral-800 p-2 space-y-2 min-w-0">
              <img src={r.url} alt={t.pageN(r.page)} loading="lazy" className="w-full h-auto bg-white" />
              <p className="text-xs text-neutral-400 tabular-nums">
                {t.pageN(r.page)} · {nb(r.l)} × {nb(r.h)} px · {oct(r.blob.size)}
              </p>
              {r.reduit && <p className="text-xs text-amber-200">{t.reduit}</p>}
              <button
                type="button"
                onClick={() => telecharger(nomPage(r), r.blob)}
                className="w-full h-10 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500"
              >
                {t.telecharger}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <PageOutil
      id="pdf-en-jpg"
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
    <Section titre="Convertir un PDF en JPG : comment faire">
      <p>
        Pour convertir un PDF en JPG, déposez le fichier dans le cadre ci-dessus, choisissez la résolution (150 dpi
        par défaut), le format JPG ou PNG et, si besoin, les pages voulues, puis cliquez sur « Convertir » : chaque
        page devient une image distincte, affichée en aperçu avec ses dimensions et son poids. À 150 dpi, une page A4
        donne une image d'environ 1 240 × 1 754 pixels, nette en plein écran et légère à envoyer ; à 300 dpi, environ
        2 480 × 3 508 pixels, la qualité d'impression. Une seule page se télécharge directement, plusieurs pages
        partent ensemble dans une archive ZIP nommée d'après votre fichier. Tout est dessiné par votre navigateur,
        sans envoi à un serveur. La limite principale : l'image ne contient plus de texte sélectionnable, seulement
        des pixels, donc gardez le PDF d'origine.
      </p>
    </Section>

    <Section titre="Choisir la résolution et le format">
      <p>
        La résolution, en points par pouce (dpi), fixe le nombre de pixels de chaque image. À <strong>72 dpi</strong>,
        une page A4 donne environ 595 × 842 pixels : de quoi faire un aperçu ou une miniature. À{" "}
        <strong>150 dpi</strong>, c'est net à l'écran, même en plein écran, et suffisant pour une diapositive ou un
        message. À <strong>300 dpi</strong>, les fichiers sont quatre fois plus gros qu'à 150 dpi : réservez ce
        réglage à l'impression.
      </p>
      <p>
        Le <strong>JPG</strong> compresse avec une légère perte, très efficace sur les photos et les scans. Le{" "}
        <strong>PNG</strong> ne perd rien : idéal pour une page de texte, un tableau, un plan ou un schéma, dont les
        traits fins restent nets. Le fond des pages est blanc dans les deux cas, même si le PDF d'origine a un fond
        transparent.
      </p>
    </Section>

    <Section titre="Usages courants d'un PDF converti en image">
      <p>
        Beaucoup de services n'acceptent que des images : une photo de profil, un formulaire de dépôt qui ne prend
        que le JPG, une publication sur un réseau social, une conversation de messagerie où un PDF s'ouvrirait mal
        sur téléphone. Convertir la page utile en JPG règle le problème. C'est aussi le moyen le plus simple
        d'insérer une page de PDF dans un diaporama ou un document de traitement de texte.
      </p>
      <p>
        Indiquez les pages voulues comme dans un logiciel d'impression : « 1 » pour la couverture, « 2-4 » pour un
        passage, « 1, 3, 7- » pour un choix. Les noms des images suivent l'ordre des pages (rapport-page-01.jpg,
        rapport-page-02.jpg…), ce qui garde le classement dans votre dossier.
      </p>
      <p>
        Pour l'opération inverse, rassembler des photos dans un PDF, utilisez l'outil{" "}
        <Link to="/jpg-en-pdf/">JPG en PDF</Link>. Si vous voulez seulement alléger un PDF trop lourd sans le
        transformer en images séparées, l'outil pour <Link to="/compresser-pdf/">compresser un PDF</Link> est plus
        adapté.
      </p>
    </Section>

    <Section titre="Limites et confidentialité">
      <p>
        Les pages sont dessinées par votre navigateur, avec le même moteur d'affichage que la visionneuse PDF de
        Firefox : le fichier n'est envoyé à aucun serveur. Le rendu est fidèle pour l'immense majorité des
        documents ; une police très rare ou un effet graphique complexe peut toutefois s'afficher un peu
        différemment que dans un autre lecteur.
      </p>
      <p>
        Pour un long document en 300 dpi, convertissez par tranches de pages : votre appareil garde toutes les
        images en mémoire jusqu'au téléchargement, et un téléphone ancien peut ralentir au-delà d'une trentaine de
        pages.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Convert PDF to JPG: how it works">
      <p>
        To convert a PDF to JPG, drop the file into the box above, choose the resolution (150 dpi by default), JPG
        or PNG and, if you need, the pages you want, then press "Convert": every page becomes a separate image,
        shown as a preview with its dimensions and file size. At 150 dpi an A4 page gives an image of about 1,240 ×
        1,754 pixels, sharp on a full screen and light enough to send; at 300 dpi, about 2,480 × 3,508 pixels, which
        is print quality. A single page downloads directly, several pages come together in a ZIP file named after
        your PDF. Your browser does all the rendering, so a French tax notice or a payslip never leaves your device.
        The main limit: the image holds no selectable text, only pixels, so keep the original PDF.
      </p>
    </Section>

    <Section titre="Choosing the resolution and format">
      <p>
        Resolution, in dots per inch (dpi), sets the number of pixels in each image. At <strong>72 dpi</strong> an
        A4 page gives about 595 × 842 pixels: fine for a preview or a thumbnail. At <strong>150 dpi</strong> it is
        sharp on screen, even full screen, and enough for a slide or a message. At <strong>300 dpi</strong> files
        are four times larger than at 150 dpi, so keep that setting for printing.
      </p>
      <p>
        <strong>JPG</strong> compresses with a slight loss and works very well on photos and scans.{" "}
        <strong>PNG</strong> loses nothing: ideal for a page of text, a table, a floor plan or a diagram, whose fine
        lines stay crisp. Page backgrounds are white in both cases, even when the original PDF has a transparent
        background.
      </p>
    </Section>

    <Section titre="When you need a PDF page as an image">
      <p>
        Plenty of services only take images: some upload forms on French portals accept JPG but not PDF, a profile
        picture, a social media post, or a chat where a PDF opens badly on a phone. Turning the useful page into a
        JPG solves it. It is also the easiest way to drop a PDF page into a slide deck or a word-processing file.
      </p>
      <p>
        Pick pages the way you would in a print dialog: "1" for the cover, "2-4" for a section, "1, 3, 7-" for a
        selection. Image names follow page order (report-page-01.jpg, report-page-02.jpg and so on), so they stay
        sorted in your folder.
      </p>
      <p>
        For the reverse, gathering photos into one PDF, use <Link to="/en/jpg-to-pdf/">JPG to PDF</Link>. If you
        only want to make a heavy PDF lighter without splitting it into images, the tool to{" "}
        <Link to="/en/compress-pdf/">compress a PDF</Link> is a better fit.
      </p>
    </Section>

    <Section titre="Limits and privacy">
      <p>
        Pages are rendered by your browser with the same engine as the Firefox PDF viewer: the file is not sent to
        any server. Rendering is faithful for the vast majority of documents, though a very rare font or a complex
        graphic effect may look slightly different from another reader.
      </p>
      <p>
        For a long document at 300 dpi, convert it in batches of pages: your device keeps every image in memory
        until you download them, and an older phone can slow down beyond thirty or so pages.
      </p>
    </Section>
  </>
);

export default PdfEnJpg;
