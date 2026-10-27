import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Progression, Alerte, Segments, ChoixListe } from "@/components/outils/PdfOutils";
import { chargerPdfLib, messagePdfJs, respirer } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "J'ai compressé mon PDF et il est à peine plus léger, c'est normal ?",
      r: "Oui, avec le mode léger. Il réorganise la structure du fichier sans toucher aux images ni aux polices : sur un PDF déjà optimisé par Word ou un scanner, le gain se compte en kilo-octets. Ce qui pèse dans un PDF, ce sont presque toujours les images. Pour les réduire, passez au mode fort, qui transforme chaque page en image JPEG à la résolution choisie.",
    },
    {
      q: "Après la compression forte, je ne peux plus copier le texte du PDF, pourquoi ?",
      r: "Parce que chaque page a été photographiée, en quelque sorte : le fichier ne contient plus de texte, seulement une image par page. On ne peut donc plus sélectionner, copier ni rechercher un mot, et les liens cliquables disparaissent. Gardez l'original pour votre usage et n'envoyez la version compressée que là où seul l'aspect compte, comme une pièce justificative.",
    },
    {
      q: "Quelle résolution choisir pour un justificatif déposé sur un site administratif ?",
      r: "Commencez par 150 dpi et une qualité moyenne : une facture, un avis d'imposition ou une pièce d'identité scannée restent nets à l'écran et à l'impression. Si le fichier dépasse encore la limite indiquée par le site, descendez à 120 puis 96 dpi. En dessous, les petits caractères deviennent flous : vérifiez toujours le résultat avant de le déposer.",
    },
    {
      q: "Le PDF compressé est plus lourd que l'original, que faire ?",
      r: "Gardez l'original. Cela arrive avec un PDF de texte pur, produit par un traitement de texte : son contenu est déjà compact, et le remplacer par des images de pages l'alourdit. L'outil compare les deux poids et vous prévient dans ce cas. Pour réduire un tel fichier, retirez plutôt les pages inutiles avec l'outil de séparation.",
    },
    {
      q: "Mon PDF est protégé par un mot de passe, puis-je quand même le compresser ?",
      r: "Pas directement : un PDF chiffré ne peut pas être relu sans son mot de passe, et l'outil vous le signale dès le dépôt. Ouvrez-le dans votre lecteur habituel en saisissant le mot de passe, utilisez « Imprimer » puis « Enregistrer au format PDF » pour obtenir une copie sans protection, et compressez cette copie. Ne le faites que pour un document qui vous appartient.",
    },
    {
      q: "Compresser un PDF signé électroniquement annule-t-il la signature ?",
      r: "Oui. Une signature électronique scelle le contenu exact du fichier : la moindre réécriture, même sans perte, la rend invalide aux yeux d'un lecteur qui la vérifie. C'est vrai avec n'importe quel outil de compression. Envoyez donc le fichier signé tel quel, ou demandez à l'expéditeur une version plus légère avant signature si la taille pose problème.",
    },
  ],
  en: [
    {
      q: "I compressed my PDF and it is barely smaller, is that normal?",
      r: "Yes, with the light mode. It rewrites the file structure without touching images or fonts, so on a PDF already optimised by Word or a scanner the saving is only a few kilobytes. What makes a PDF heavy is almost always its images. To shrink those, switch to the strong mode, which turns every page into a JPEG image at the resolution you choose.",
    },
    {
      q: "Why can't I copy text from the PDF after strong compression?",
      r: "Because each page has, in effect, been photographed: the new file holds one image per page and no text layer. You can no longer select, copy or search words, and clickable links disappear. Keep the original for your own use and send the compressed copy only where appearance is all that matters, such as a supporting document for a French administrative file.",
    },
    {
      q: "What resolution should I use for a document uploaded to a French government website?",
      r: "Start with 150 dpi and medium quality: an invoice, an avis d'imposition (tax notice) or a scanned ID stays sharp on screen and on paper. If the file is still above the limit shown next to the upload button, go down to 120 then 96 dpi. Below that, small print such as a tax number or an IBAN turns blurry, so always check the result before sending it.",
    },
    {
      q: "The compressed PDF is larger than the original, what should I do?",
      r: "Keep the original. This happens with a text-only PDF exported from a word processor: its content is already compact, and replacing it with page images makes it heavier. The tool compares both sizes and warns you when this happens. To make such a file smaller, remove the pages you do not need with the split tool instead of compressing it.",
    },
    {
      q: "Does compressing a digitally signed PDF break the signature?",
      r: "Yes. A digital signature seals the exact content of the file, so any rewrite, even a lossless one, makes it fail when a reader checks it. That is true with every compression tool. Send the signed file as it is, or ask the sender for a lighter version before it is signed if the file size is a problem for the platform you are using.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 octobre 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), accès libre à la norme", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 octobre 2026" },
    { editeur: "W3C", titre: "JPEG File Interchange Format, version 1.02", url: "https://www.w3.org/Graphics/JPEG/jfif3.pdf", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 October 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), free access to the standard", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 October 2026" },
    { editeur: "W3C", titre: "JPEG File Interchange Format, version 1.02", url: "https://www.w3.org/Graphics/JPEG/jfif3.pdf", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Compresseur de PDF 75tools",
    motsCles: "compresser pdf, compresser pdf gratuit, réduire la taille d'un pdf, alléger un pdf, réduire poids pdf",
    choisir: "Choisir un PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Changer de fichier",
    niveau: "Niveau de compression",
    fort: "Fort : pages en images JPEG",
    leger: "Léger : sans perte",
    resolution: "Résolution des pages",
    dpi: ["72 dpi : le plus léger, lecture à l'écran", "96 dpi : léger", "120 dpi : équilibré", "150 dpi : net, impression correcte", "200 dpi : très net"],
    qualite: "Qualité JPEG",
    qualites: ["Basse (50 %)", "Moyenne (70 %)", "Haute (85 %)"],
    avertFort: "Avec ce mode, le texte du PDF résultant n'est plus sélectionnable ni copiable, et les liens ne sont plus cliquables : chaque page devient une image.",
    avertLeger: "Le fichier est relu puis réenregistré avec une structure plus compacte (flux d'objets). Texte, images et liens restent intacts, mais le gain est souvent faible.",
    bouton: "Compresser le PDF",
    enCours: "Compression en cours…",
    reecriture: "Réécriture du fichier",
    conversion: "Conversion des pages en images",
    assemblage: "Assemblage du PDF",
    echec: "La compression a échoué.",
    attente: "Le poids avant et après s'affichera ici, avec le bouton de téléchargement.",
    avant: "Avant",
    apres: "Après",
    gain: "Gain",
    plusLeger: (g: string) => `${g} % plus léger`,
    aucun: "aucun",
    pasPlusLeger: (a: string, b: string) => `Le résultat n'est pas plus léger que l'original (${a} contre ${b}) : gardez votre fichier d'origine.`,
    essayerFort: " Essayez le mode fort, qui réduit les images.",
    essayerBas: " Ce PDF contient surtout du texte, déjà compact ; essayez une résolution plus basse, ou retirez des pages.",
    quandMeme: "Télécharger quand même",
    telecharger: "Télécharger le PDF compressé",
    suffixe: "compresse",
  },
  en: {
    nomAppli: "75tools PDF compressor",
    motsCles: "compress pdf, compress pdf free, reduce pdf file size, make pdf smaller, shrink pdf",
    choisir: "Choose a PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Change file",
    niveau: "Compression level",
    fort: "Strong: pages as JPEG images",
    leger: "Light: lossless",
    resolution: "Page resolution",
    dpi: ["72 dpi: smallest, on-screen reading", "96 dpi: light", "120 dpi: balanced", "150 dpi: sharp, fine for printing", "200 dpi: very sharp"],
    qualite: "JPEG quality",
    qualites: ["Low (50%)", "Medium (70%)", "High (85%)"],
    avertFort: "With this mode, text in the new PDF can no longer be selected or copied and links stop being clickable: each page becomes an image.",
    avertLeger: "The file is read and saved again with a more compact structure (object streams). Text, images and links stay intact, but the saving is often small.",
    bouton: "Compress PDF",
    enCours: "Compressing…",
    reecriture: "Rewriting the file",
    conversion: "Turning pages into images",
    assemblage: "Building the PDF",
    echec: "Compression failed.",
    attente: "The size before and after will show here, with the download button.",
    avant: "Before",
    apres: "After",
    gain: "Saving",
    plusLeger: (g: string) => `${g}% smaller`,
    aucun: "none",
    pasPlusLeger: (a: string, b: string) => `The result is not smaller than the original (${a} versus ${b}): keep your original file.`,
    essayerFort: " Try the strong mode, which shrinks images.",
    essayerBas: " This PDF is mostly text, which is already compact; try a lower resolution, or remove pages.",
    quandMeme: "Download anyway",
    telecharger: "Download compressed PDF",
    suffixe: "compressed",
  },
};

type Mode = "leger" | "fort";

interface Resultat {
  blob: Blob;
  avant: number;
  apres: number;
  mode: Mode;
}

const CompresserPdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [fichier, setFichier] = useState<File | null>(null);
  const [octets, setOctets] = useState<Uint8Array | null>(null);
  const [nbPages, setNbPages] = useState(0);
  const [mode, setMode] = useState<Mode>("fort");
  const [dpi, setDpi] = useState("150");
  const [qualite, setQualite] = useState("0.7");
  const [enCours, setEnCours] = useState(false);
  const [prog, setProg] = useState({ texte: "", fait: 0, total: 0 });
  const [erreur, setErreur] = useState("");
  const [res, setRes] = useState<Resultat | null>(null);
  const oct = (n: number) => formatOctets(n, lang);

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setRes(null);
    setErreur("");
    setFichier(null);
    setOctets(null);
    try {
      const o = await lireOctets(fi);
      const doc = await chargerPdfLib(o, lang === "en" ? `"${fi.name}"` : `« ${fi.name} »`, lang);
      setNbPages(doc.getPageCount());
      setOctets(o);
      setFichier(fi);
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

  const compresser = async () => {
    if (!octets || !fichier) return;
    setEnCours(true);
    setErreur("");
    setRes(null);
    try {
      let sortie: Uint8Array;
      if (mode === "leger") {
        setProg({ texte: t.reecriture, fait: 0, total: 0 });
        await respirer();
        const doc = await PDFDocument.load(octets, { updateMetadata: false });
        sortie = await doc.save({ useObjectStreams: true });
      } else {
        const echelle = parseInt(dpi, 10) / 72;
        const q = parseFloat(qualite);
        let source;
        try {
          source = await ouvrirPdf(octets.slice());
        } catch (e) {
          throw new Error(messagePdfJs(e, lang === "en" ? `"${fichier.name}"` : `« ${fichier.name} »`, lang));
        }
        const neuf = await PDFDocument.create();
        const n = source.numPages;
        for (let p = 1; p <= n; p++) {
          setProg({ texte: t.conversion, fait: p - 1, total: n });
          await respirer();
          const page = await source.getPage(p);
          const vue = page.getViewport({ scale: 1 });
          // Les très grandes pages sont limitées à environ 16 millions de pixels (limite des navigateurs mobiles).
          const e = Math.min(echelle, Math.sqrt(16e6 / (vue.width * vue.height)));
          const canvas = await rendrePage(source, p, e);
          const jpg = await canvasVersBlob(canvas, "image/jpeg", q);
          canvas.width = canvas.height = 0;
          const img = await neuf.embedJpg(await lireOctets(jpg));
          const pg = neuf.addPage([vue.width, vue.height]);
          pg.drawImage(img, { x: 0, y: 0, width: vue.width, height: vue.height });
        }
        setProg({ texte: t.assemblage, fait: n, total: n });
        await respirer();
        await source.destroy();
        sortie = await neuf.save({ useObjectStreams: true });
      }
      setRes({ blob: new Blob([sortie], { type: "application/pdf" }), avant: octets.length, apres: sortie.length, mode });
    } catch (e) {
      setErreur((e as Error).message || t.echec);
    } finally {
      setEnCours(false);
    }
  };

  const gain = res ? Math.round((1 - res.apres / res.avant) * 100) : 0;
  const nomSortie = fichier ? `${nomSansExtension(fichier.name)}-${t.suffixe}.pdf` : `${t.suffixe}.pdf`;

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div className="space-y-5 min-w-0">
        {!fichier ? (
          <DepotFichiers accept=".pdf,application/pdf" onFichiers={ouvrir} libelle={t.choisir} />
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
            <p className="min-w-0 [overflow-wrap:anywhere]">
              <span className="text-white">{fichier.name}</span>
              <span className="block text-sm text-neutral-400 tabular-nums">
                {oct(fichier.size)} · {nbPages.toLocaleString(locale(lang))} {t.page(nbPages)}
              </span>
            </p>
            <Bouton
              secondaire
              disabled={enCours}
              onClick={() => {
                setFichier(null);
                setOctets(null);
                setRes(null);
              }}
            >
              {t.changer}
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <fieldset className="space-y-4" disabled={enCours}>
          <legend className="text-sm text-neutral-300 mb-2">{t.niveau}</legend>
          <Segments
            nom={t.niveau}
            valeur={mode}
            onChange={(v) => {
              setMode(v);
              setRes(null);
            }}
            options={[
              { v: "fort", l: t.fort },
              { v: "leger", l: t.leger },
            ]}
          />
          {mode === "fort" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <ChoixListe label={t.resolution} value={dpi} onChange={(v) => (setDpi(v), setRes(null))}>
                  {["72", "96", "120", "150", "200"].map((v, i) => (
                    <option key={v} value={v}>{t.dpi[i]}</option>
                  ))}
                </ChoixListe>
                <ChoixListe label={t.qualite} value={qualite} onChange={(v) => (setQualite(v), setRes(null))}>
                  {["0.5", "0.7", "0.85"].map((v, i) => (
                    <option key={v} value={v}>{t.qualites[i]}</option>
                  ))}
                </ChoixListe>
              </div>
              <p className="text-sm text-amber-200/90">{t.avertFort}</p>
            </>
          ) : (
            <p className="text-sm text-neutral-400">{t.avertLeger}</p>
          )}
        </fieldset>
      </div>

      <div data-resultat className="space-y-4 lg:sticky lg:top-4">
        <Bouton onClick={compresser} disabled={!fichier || enCours}>
          {enCours ? t.enCours : t.bouton}
        </Bouton>
        {enCours && <Progression {...prog} />}
        {!res && !enCours && <p className="text-sm text-neutral-500">{t.attente}</p>}
        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <div className="grid grid-cols-3 gap-3 tabular-nums">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">{t.avant}</p>
                <p className="text-lg text-white">{oct(res.avant)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">{t.apres}</p>
                <p className="text-lg text-white">{oct(res.apres)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">{t.gain}</p>
                <p className={gain > 0 ? "text-lg text-sky-300" : "text-lg text-amber-300"}>
                  {gain > 0 ? t.plusLeger(gain.toLocaleString(locale(lang))) : t.aucun}
                </p>
              </div>
            </div>
            {res.apres >= res.avant ? (
              <>
                <p className="text-amber-200">
                  {t.pasPlusLeger(oct(res.apres), oct(res.avant))}
                  {res.mode === "leger" ? t.essayerFort : t.essayerBas}
                </p>
                <Bouton secondaire onClick={() => telecharger(nomSortie, res.blob)}>
                  {t.quandMeme}
                </Bouton>
              </>
            ) : (
              <Bouton onClick={() => telecharger(nomSortie, res.blob)}>{t.telecharger}</Bouton>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="compresser-pdf"
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
    <Section titre="Compresser un PDF gratuitement : ce que fait l'outil">
      <p>
        Pour compresser un PDF gratuitement, déposez-le dans le cadre ci-dessus, choisissez le mode fort pour un scan
        ou un document plein de photos, ou le mode léger pour un PDF de texte, puis cliquez sur « Compresser le
        PDF » : le poids avant et après s'affiche aussitôt, avec le pourcentage gagné. En mode fort, chaque page est
        redessinée par votre navigateur à la résolution choisie (150 dpi par défaut), enregistrée en JPEG, puis
        replacée dans un nouveau PDF aux mêmes dimensions ; un dossier scanné de 8 Mo descend souvent sous 1 Mo. En
        mode léger, rien n'est perdu mais le gain reste faible. Le fichier n'est jamais envoyé : tout se passe sur
        votre appareil, ce qui compte pour un avis d'imposition ou un bulletin de salaire. Si le résultat n'est pas
        plus léger, l'outil vous le dit et vous conseille de garder l'original.
      </p>
    </Section>

    <Section titre="Léger ou fort : ce que fait chaque mode">
      <p>
        Un PDF est une boîte qui contient du texte, des polices, des dessins vectoriels et des images. Le texte et
        les dessins pèsent peu ; ce sont les images, surtout les pages scannées et les photos prises au téléphone,
        qui font grimper le poids à plusieurs mégaoctets. Les deux modes de l'outil agissent donc très
        différemment.
      </p>
      <p>
        <strong>Le mode léger</strong> relit le document et le réenregistre en regroupant ses objets internes
        dans des flux compressés. Rien n'est perdu : le texte reste sélectionnable, les liens et les champs de
        formulaire restent en place. En revanche, les images ne sont pas touchées : le gain va de zéro à quelques
        pour cent, davantage sur les vieux PDF produits par des logiciels peu soigneux.
      </p>
      <p>
        <strong>Le mode fort</strong> dessine chaque page dans votre navigateur à la résolution choisie,
        l'enregistre en JPEG avec la qualité choisie, puis reconstruit un PDF d'une image par page, aux mêmes
        dimensions. C'est très efficace sur un scan ou un PDF plein de photos haute définition. La contrepartie :
        le document ne contient plus de texte, seulement des images, donc plus de copier-coller, de recherche ni
        de liens. C'est le prix d'une forte réduction sans logiciel installé.
      </p>
    </Section>

    <Section titre="Envoyer un PDF par e-mail ou le déposer sur un site">
      <p>
        Les deux cas qui obligent le plus souvent à alléger un PDF sont la <strong>pièce jointe</strong> refusée
        parce que le message dépasse la taille admise par la messagerie, et le <strong>dépôt sur un site</strong>{" "}
        (démarche administrative, candidature, dossier de location, mutuelle) dont le formulaire refuse les
        fichiers au-delà d'un certain poids. La limite exacte est indiquée par le site lui-même, souvent à côté du
        bouton de dépôt : visez un fichier nettement en dessous, pour garder de la marge.
      </p>
      <p>
        Pour un justificatif, réglez le mode fort sur 150 dpi et une qualité moyenne : c'est en général lisible et
        plusieurs fois plus léger qu'un scan brut. Si ce n'est pas assez, descendez la résolution d'un cran, puis
        ouvrez le résultat et zoomez sur les petits caractères (numéro fiscal, IBAN, dates) avant de l'envoyer. Un
        justificatif illisible fait perdre plus de temps qu'un fichier un peu lourd.
      </p>
      <p>
        Si le document compte des pages inutiles (conditions générales, pages blanches, annexes), retirez-les
        d'abord avec l'outil pour <Link to="/separer-pdf/">séparer les pages d'un PDF</Link> : c'est le moyen le
        plus sûr d'alléger sans rien perdre en netteté. Et si vous devez réunir plusieurs justificatifs en un seul
        envoi, <Link to="/fusionner-pdf/">fusionnez-les</Link> puis compressez le fichier obtenu.
      </p>
    </Section>

    <Section titre="Confidentialité et limites">
      <p>
        Le fichier n'est pas envoyé : il est lu et transformé par votre navigateur, sur votre appareil. La
        contrepartie est que la vitesse dépend de votre machine : un PDF de cent pages en mode fort à 200 dpi peut
        prendre une minute sur un téléphone ancien. L'indicateur de progression affiche la page en cours.
      </p>
      <p>
        Un PDF protégé par un mot de passe ne peut pas être compressé ici tant qu'il n'est pas déverrouillé, et un
        PDF signé électroniquement perd la validité de sa signature dès qu'il est modifié, quel que soit l'outil :
        les questions plus bas expliquent quoi faire dans ces deux cas.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Compress a PDF for free: what the tool does">
      <p>
        To compress a PDF for free, drop it into the box above, pick the strong mode for a scan or a document full
        of photos, or the light mode for a text PDF, then click "Compress PDF": the size before and after appears at
        once, with the percentage saved. In strong mode, your browser redraws every page at the resolution you chose
        (150 dpi by default), saves it as a JPEG and places it back into a new PDF with the same page size; an 8 MB
        scanned file often drops below 1 MB. In light mode nothing is lost, but the saving stays small. The file is
        never uploaded: everything happens on your device, which matters when the document is a French tax notice,
        a payslip or a residence permit scan. If the result is not smaller, the tool tells you and suggests keeping
        the original.
      </p>
    </Section>

    <Section titre="Light or strong: what each mode does">
      <p>
        A PDF is a container for text, fonts, vector drawings and images. Text and drawings weigh very little; images,
        especially scanned pages and phone photos, are what push a file to several megabytes. That is why the two
        modes behave so differently.
      </p>
      <p>
        <strong>Light mode</strong> reads the document and saves it again, grouping its internal objects into
        compressed streams. Nothing is lost: text stays selectable, links and form fields stay in place. Images are
        not touched, though, so the saving ranges from zero to a few percent, a little more on old PDFs produced by
        careless software.
      </p>
      <p>
        <strong>Strong mode</strong> renders each page in your browser at the chosen resolution, saves it as a JPEG at
        the chosen quality and rebuilds a PDF with one image per page, at the same dimensions. It works very well on
        scans and photo-heavy PDFs. The trade-off is that the document no longer contains text, only images: no
        copy and paste, no search and no links.
      </p>
    </Section>

    <Section titre="Emailing a PDF or uploading it to a French website">
      <p>
        The two situations that most often force you to shrink a PDF are an <strong>email attachment</strong> rejected
        because the message is too large, and an <strong>upload form</strong> that refuses files above a certain size:
        a residence permit application on the ANEF portal, a CAF or CPAM file, a rental application on a letting
        platform, a job application. The exact limit is usually written next to the upload button; aim well below it
        to keep a margin.
      </p>
      <p>
        For a supporting document, set strong mode to 150 dpi and medium quality: it is usually readable and several
        times lighter than a raw scan. If that is not enough, lower the resolution by one step, then open the result
        and zoom in on small print (tax number, IBAN, dates) before sending it. An unreadable document costs more time
        than a slightly heavy one.
      </p>
      <p>
        If the document has pages you do not need (terms and conditions, blank pages, appendices), remove them first
        with the tool to <Link to="/en/split-pdf/">split a PDF</Link>: it is the safest way to save space without
        losing sharpness. To send several documents in one go, <Link to="/en/merge-pdf/">merge them</Link>, then
        compress the merged file.
      </p>
    </Section>

    <Section titre="Privacy and limits">
      <p>
        The file is not uploaded: your browser reads and transforms it on your device. The flip side is that speed
        depends on your machine: a hundred-page PDF in strong mode at 200 dpi can take a minute on an older phone. The
        progress bar shows the page being processed.
      </p>
      <p>
        A password-protected PDF cannot be compressed here until it is unlocked: open it in your usual reader with the
        password, use Print then Save as PDF to get an unprotected copy, and compress that copy. A digitally signed PDF
        loses its signature as soon as it is modified, whatever the tool, as the questions below explain.
      </p>
    </Section>
  </>
);

export default CompresserPdf;
