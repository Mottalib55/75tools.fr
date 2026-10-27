import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, PDFImage } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { Progression, Alerte, ListeOrdonnable, ChoixListe } from "@/components/outils/PdfOutils";
import { nouvelId, orientationJpeg, typeImage, respirer } from "@/lib/pdf-outils";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob, chargerImage } from "@/lib/fichiers";

const FAQ: QuestionFaq[] = [
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
];

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

const JpgEnPdf = () => {
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
        const t = typeImage(await lireOctets(f.slice(0, 16)));
        if (t === "autre") throw new Error("format non pris en charge (JPG, PNG ou WebP attendus)");
        const d = await decoder(f);
        el.largeur = d.l;
        el.hauteur = d.h;
        d.fermer();
      } catch (e) {
        el.erreur = `Image illisible : ${(e as Error).message || "format non pris en charge"}.`;
        if (/heic|heif/i.test(f.name) || /heic|heif/i.test(f.type))
          el.erreur = "Photo HEIC : convertissez-la d'abord avec l'outil HEIC en JPG.";
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
    const t = typeImage(o);
    const reduire = poids === "reduit" && Math.max(im.largeur, im.hauteur) > 2000;
    if (!reduire) {
      try {
        if (t === "jpg" && orientationJpeg(o) <= 1) return { image: await pdf.embedJpg(o), l: im.largeur, h: im.hauteur };
        if (t === "png") return { image: await pdf.embedPng(o), l: im.largeur, h: im.hauteur };
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
        setProg({ texte: "Ajout des images", fait: i, total: valides.length });
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
      setProg({ texte: "Enregistrement du PDF", fait: valides.length, total: valides.length });
      await respirer();
      const o = await pdf.save({ useObjectStreams: true });
      setRes(new Blob([o], { type: "application/pdf" }));
    } catch (e) {
      setErreur(`La création du PDF a échoué : ${(e as Error).message}`);
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = valides.length === 1 ? `${nomSansExtension(valides[0].fichier.name)}.pdf` : "images.pdf";
  const changer = (f: (v: string) => void) => (v: string) => {
    f(v);
    setRes(null);
  };

  return (
    <PageOutil
      href="/jpg-en-pdf/"
      titre="Convertir JPG en PDF gratuit : photos et images en un PDF"
      description="Convertir JPG en PDF gratuitement : une ou plusieurs photos (JPG, PNG, WebP) en un PDF, dans l'ordre voulu, en A4, Lettre ou taille de l'image. Aucun envoi."
      motsCles="convertir jpg en pdf, jpg en pdf, transformer une image en pdf, photo en pdf gratuit, png en pdf, image en pdf"
      nomAppli="Convertisseur JPG en PDF 75tools"
      h1="Convertir des JPG en PDF"
      chapeau="Ajoutez une ou plusieurs images, mettez-les dans l'ordre, choisissez le format de page et la marge : chaque image devient une page du PDF. L'orientation des photos de téléphone est respectée."
      faq={FAQ}
    >
      <div className="space-y-5">
        <DepotFichiers
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onFichiers={ajouter}
          libelle={images.length ? "Ajouter d'autres images" : "Choisir des images"}
          aide="JPG, PNG ou WebP ; ou glissez vos images ici"
        />
        {analyse && <p role="status" className="text-sm text-neutral-400">Lecture des images…</p>}

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
                      {e.largeur} × {e.hauteur} px · {formatOctets(e.fichier.size)}
                    </p>
                  )}
                </div>
              </div>
            )}
          />
        )}

        <fieldset disabled={enCours} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ChoixListe label="Format de page" value={format} onChange={changer((v) => setFormat(v as Format))}>
            <option value="a4">A4 (21 × 29,7 cm)</option>
            <option value="lettre">Lettre US (21,6 × 27,9 cm)</option>
            <option value="image">Taille de l'image</option>
          </ChoixListe>
          <ChoixListe
            label="Orientation"
            value={orientation}
            onChange={changer(setOrientation)}
            disabled={format === "image"}
          >
            <option value="auto">Selon chaque image</option>
            <option value="portrait">Portrait</option>
            <option value="paysage">Paysage</option>
          </ChoixListe>
          <ChoixListe label="Marge" value={marge} onChange={changer(setMarge)}>
            <option value="0">Aucune</option>
            <option value="5">Fine (5 mm)</option>
            <option value="10">Normale (10 mm)</option>
            <option value="20">Large (20 mm)</option>
          </ChoixListe>
          <ChoixListe label="Poids des photos" value={poids} onChange={changer(setPoids)}>
            <option value="original">Originales, sans perte</option>
            <option value="reduit">Réduites (2 000 px), plus léger</option>
          </ChoixListe>
        </fieldset>

        {erreur && <Alerte>{erreur}</Alerte>}

        <div className="flex flex-wrap gap-2">
          <Bouton onClick={creer} disabled={!valides.length || enCours || analyse}>
            {enCours ? "Création en cours…" : `Créer le PDF${valides.length > 1 ? ` (${valides.length} pages)` : ""}`}
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
              Vider la liste
            </Bouton>
          )}
        </div>

        {enCours && <Progression {...prog} />}

        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 tabular-nums">
              PDF prêt : {valides.length.toLocaleString("fr-FR")} page{valides.length > 1 ? "s" : ""},{" "}
              {formatOctets(res.size)}.
            </p>
            <Bouton onClick={() => telecharger(nomSortie, res)}>Télécharger le PDF</Bouton>
          </div>
        )}
      </div>

      <Section titre="Transformer une photo en PDF, pas à pas">
        <p>
          Ajoutez vos images : une seule pour un justificatif, plusieurs pour un document de plusieurs pages pris
          en photo (un bail, un relevé, un devis signé). Chacune devient une page, dans l'ordre de la liste ;
          déplacez-les avec les flèches, ou en glissant une ligne sur ordinateur. Une vignette permet de vérifier
          que les pages se suivent.
        </p>
        <p>
          Choisissez ensuite la mise en page. <strong>A4</strong> est le format attendu en France par les
          administrations et pour l'impression ; <strong>Lettre US</strong> sert pour un destinataire nord-américain.
          Avec <strong>Taille de l'image</strong>, la page épouse exactement la photo, sans bande blanche : c'est
          adapté à une lecture à l'écran, moins à l'impression. L'orientation « Selon chaque image » met en paysage
          les photos plus larges que hautes et en portrait les autres, page par page.
        </p>
        <p>
          La marge laisse un liseré blanc autour de l'image ; « Aucune » colle l'image aux bords. L'image n'est
          jamais déformée : elle est agrandie ou réduite pour tenir dans la page en gardant ses proportions, puis
          centrée.
        </p>
      </Section>

      <Section titre="Qualité, poids et orientation des photos">
        <p>
          En réglage « Originales », les fichiers JPG et PNG sont placés dans le PDF tels quels, octet pour octet :
          aucune perte de qualité, mais un PDF qui pèse à peu près la somme des photos. Une photo de téléphone
          récent pèse souvent plusieurs mégaoctets ; dix photos donnent un PDF trop lourd pour bien des
          formulaires en ligne. Le réglage « Réduites » ramène chaque photo à 2 000 pixels sur son plus grand côté,
          soit plus de 170 points par pouce sur une page A4 entière : c'est net à l'impression et bien plus
          léger.
        </p>
        <p>
          Les photos prises au téléphone contiennent souvent une indication d'orientation (EXIF) au lieu d'être
          réellement tournées. L'outil la lit et tourne l'image en conséquence, pour qu'aucune page n'arrive
          couchée. Les WebP sont convertis en JPEG sur fond blanc, car le format PDF n'accepte pas le WebP. Pour
          les photos HEIC d'iPhone, passez d'abord par l'outil <Link to="/heic-en-jpg/">HEIC en JPG</Link>.
        </p>
        <p>
          Pour l'opération inverse, sortir les pages d'un PDF en images, utilisez{" "}
          <Link to="/pdf-en-jpg/">PDF en JPG</Link>. Et pour ajouter ces pages à un PDF existant, créez le PDF ici
          puis <Link to="/fusionner-pdf/">fusionnez-le</Link> avec l'autre document.
        </p>
      </Section>

      <Section titre="Photographier un document pour en faire un PDF lisible">
        <p>
          Posez la feuille à plat sur une surface sombre et unie, à la lumière du jour plutôt que sous une lampe
          qui crée des reflets. Tenez le téléphone parallèle à la feuille, au-dessus de son centre, pour éviter
          l'effet de trapèze, et cadrez la page entière avec une petite marge. Désactivez le flash, qui écrase
          les contrastes et laisse une tache blanche sur le papier glacé.
        </p>
        <p>
          Vérifiez chaque photo en zoomant sur les petits caractères avant de créer le PDF : une photo floue le
          restera. Recadrez au besoin dans votre galerie, puis ajoutez les images ici dans l'ordre des pages. Le
          tout reste sur votre appareil : rien n'est envoyé à un serveur.
        </p>
      </Section>
    </PageOutil>
  );
};

export default JpgEnPdf;
