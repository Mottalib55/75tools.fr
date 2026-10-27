import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { Progression, Alerte, Segments } from "@/components/outils/PdfOutils";
import { analyserPlages, pagesUniques, messagePdfJs, estPdf, respirer } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { creerZip } from "@/lib/zip";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob } from "@/lib/fichiers";

const FAQ: QuestionFaq[] = [
  {
    q: "Quelle résolution choisir pour convertir un PDF en image ?",
    r: "72 dpi suffit pour un aperçu ou une vignette sur un site. 150 dpi convient à la plupart des usages : insérer une page dans une présentation, l'envoyer par messagerie, l'afficher en plein écran. 300 dpi est la résolution d'impression : une page A4 fait alors environ 2 480 × 3 508 pixels, avec des fichiers nettement plus lourds et une conversion plus longue.",
  },
  {
    q: "JPG ou PNG : lequel prendre pour mes pages ?",
    r: "Le JPG donne des fichiers légers et convient bien aux pages qui contiennent des photos ou des scans. Le PNG est sans perte : les textes fins, les tableaux et les schémas restent parfaitement nets, sans les petits halos que le JPG laisse autour des lettres, mais les fichiers sont plus lourds. Pour une page de texte à relire de près, préférez le PNG.",
  },
  {
    q: "Le texte de l'image obtenue peut-il être copié ?",
    r: "Non. L'image est une photographie de la page : le texte n'y est plus que des pixels. Pour copier du texte, ouvrez le PDF d'origine dans votre lecteur et sélectionnez-le. Pour transformer l'image en texte, il faudrait un logiciel de reconnaissance de caractères, ce que cet outil ne fait pas.",
  },
  {
    q: "Pourquoi une page sort-elle avec une résolution plus faible que celle demandée ?",
    r: "Pour les pages de très grand format, comme un plan ou une affiche, l'image à 300 dpi dépasserait la taille qu'un navigateur peut dessiner, surtout sur téléphone. L'outil limite alors chaque image à environ 16 millions de pixels et vous le signale sous la page concernée. Les pages au format A4 ou Lettre ne sont pas concernées, même à 300 dpi.",
  },
];

interface Rendu {
  page: number;
  blob: Blob;
  url: string;
  l: number;
  h: number;
  reduit: boolean;
}

const LIMITE_PIXELS = 16e6;

const PdfEnJpg = () => {
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
      if (!estPdf(o)) throw new Error(`« ${fi.name} » n'est pas un PDF (l'en-tête %PDF est absent).`);
      let doc;
      try {
        doc = await ouvrirPdf(o.slice());
      } catch (e) {
        throw new Error(messagePdfJs(e, `« ${fi.name} »`));
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

  const analyse = useMemo(() => analyserPlages(texte, nbPages || 1), [texte, nbPages]);
  const pages = texte.trim() === "" ? Array.from({ length: nbPages }, (_, i) => i + 1) : pagesUniques(analyse.plages);
  const base = fichier ? nomSansExtension(fichier.name) : "page";
  const ext = format === "jpg" ? "jpg" : "png";
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
        setProg({ texte: "Conversion des pages", fait: i, total: pages.length });
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
      setProg({ texte: "Terminé", fait: pages.length, total: pages.length });
    } catch (e) {
      setErreur(`La conversion a échoué : ${(e as Error).message}`);
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

  return (
    <PageOutil
      href="/pdf-en-jpg/"
      titre="Convertir PDF en JPG gratuit : chaque page en image en ligne"
      description="Convertir un PDF en JPG gratuitement : chaque page devient une image JPG ou PNG, en 72, 150 ou 300 dpi. Pages au choix, téléchargement page par page ou en ZIP."
      motsCles="convertir pdf en jpg, pdf en jpg, pdf en image gratuit, pdf en png, transformer pdf en image"
      nomAppli="Convertisseur PDF en JPG 75tools"
      h1="Convertir un PDF en images JPG ou PNG"
      chapeau="Ouvrez un PDF, choisissez la résolution, le format et les pages : chaque page devient une image, à télécharger une par une ou toutes ensemble dans une archive ZIP. Rien n'est envoyé."
      faq={FAQ}
    >
      <div className="space-y-5">
        {!fichier ? (
          <DepotFichiers accept=".pdf,application/pdf" onFichiers={ouvrir} libelle="Choisir un PDF" />
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
            <p className="min-w-0 [overflow-wrap:anywhere]">
              <span className="text-white">{fichier.name}</span>
              <span className="block text-sm text-neutral-400 tabular-nums">
                {formatOctets(fichier.size)} · {nbPages.toLocaleString("fr-FR")} page{nbPages > 1 ? "s" : ""}
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
              Changer de fichier
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <fieldset disabled={enCours} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            <div>
              <p className="text-sm text-neutral-300 mb-1">Résolution</p>
              <Segments
                nom="Résolution"
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
              <p className="text-sm text-neutral-300 mb-1">Format des images</p>
              <Segments
                nom="Format des images"
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
            <span className="block text-sm text-neutral-300 mb-1">Pages à convertir</span>
            <input
              type="text"
              inputMode="numeric"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="vide = toutes les pages ; par exemple 1-3, 5"
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

        {fichier && dpi === "300" && pages.length > 30 && (
          <p className="text-sm text-amber-200/90">
            {pages.length} pages à 300 dpi : la conversion peut être longue et occuper beaucoup de mémoire sur un
            téléphone.
          </p>
        )}

        <Bouton onClick={convertir} disabled={!fichier || enCours || !pages.length || (!!analyse.erreur && !!texte.trim())}>
          {enCours ? "Conversion en cours…" : `Convertir ${pages.length > 1 ? `${pages.length} pages` : "la page"}`}
        </Bouton>

        {enCours && <Progression {...prog} />}

        {rendus.length > 0 && !enCours && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 tabular-nums">
              {rendus.length.toLocaleString("fr-FR")} image{rendus.length > 1 ? "s" : ""} prête
              {rendus.length > 1 ? "s" : ""}, {formatOctets(total)} au total.
            </p>
            {rendus.length > 1 ? (
              <Bouton onClick={zip} disabled={zipPret}>
                {zipPret ? "Préparation de l'archive…" : "Tout télécharger (ZIP)"}
              </Bouton>
            ) : (
              <Bouton onClick={() => telecharger(nomPage(rendus[0]), rendus[0].blob)}>Télécharger l'image</Bouton>
            )}
          </div>
        )}

        {rendus.length > 0 && (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {rendus.map((r) => (
              <li key={r.page} className="rounded-lg border border-neutral-800 p-2 space-y-2 min-w-0">
                <img src={r.url} alt={`Page ${r.page}`} loading="lazy" className="w-full h-auto bg-white" />
                <p className="text-xs text-neutral-400 tabular-nums">
                  Page {r.page} · {r.l} × {r.h} px · {formatOctets(r.blob.size)}
                </p>
                {r.reduit && <p className="text-xs text-amber-200">Résolution réduite : page de très grand format.</p>}
                <button
                  type="button"
                  onClick={() => telecharger(nomPage(r), r.blob)}
                  className="w-full h-10 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500"
                >
                  Télécharger
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Section titre="Choisir la résolution et le format">
        <p>
          La résolution, en points par pouce (dpi), fixe le nombre de pixels de chaque image. À <strong>72 dpi</strong>,
          une page A4 donne environ 595 × 842 pixels : de quoi faire un aperçu ou une miniature. À{" "}
          <strong>150 dpi</strong>, environ 1 240 × 1 754 pixels : c'est net à l'écran, même en plein écran,
          et suffisant pour une diapositive ou un message. À <strong>300 dpi</strong>, environ 2 480 × 3 508
          pixels : la qualité d'impression, avec des fichiers quatre fois plus gros qu'à 150 dpi.
        </p>
        <p>
          Le <strong>JPG</strong> compresse avec une légère perte, très efficace sur les photos et les scans. Le{" "}
          <strong>PNG</strong> ne perd rien : idéal pour une page de texte, un tableau, un plan ou un schéma, dont
          les traits fins restent nets. Le fond des pages est blanc dans les deux cas, même si le PDF d'origine a un
          fond transparent.
        </p>
      </Section>

      <Section titre="Usages courants d'un PDF converti en image">
        <p>
          Beaucoup de services n'acceptent que des images : une photo de profil, un formulaire de dépôt qui ne
          prend que le JPG, une publication sur un réseau social, une conversation de messagerie où un PDF
          s'ouvrirait mal sur téléphone. Convertir la page utile en JPG règle le problème. C'est aussi le moyen
          le plus simple d'insérer une page de PDF dans un diaporama ou un document de traitement de texte.
        </p>
        <p>
          Indiquez les pages voulues comme dans un logiciel d'impression : « 1 » pour la couverture, « 2-4 » pour
          un passage, « 1, 3, 7- » pour un choix. Laissez le champ vide pour tout convertir. Chaque image se
          télécharge à part, ou toutes ensemble dans une archive ZIP dont les noms suivent l'ordre des pages
          (rapport-page-01.jpg, rapport-page-02.jpg…).
        </p>
        <p>
          Pour l'opération inverse, rassembler des photos dans un PDF, utilisez{" "}
          <Link to="/jpg-en-pdf/">JPG en PDF</Link>. Si vous voulez seulement alléger un PDF trop lourd sans le
          transformer en images séparées, l'outil pour <Link to="/compresser-pdf/">compresser un PDF</Link> est
          plus adapté.
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
          Un PDF qui demande un mot de passe à l'ouverture est refusé : ouvrez-le dans votre lecteur habituel et
          enregistrez une copie sans protection. Un PDF protégé seulement contre la modification ou l'impression
          s'ouvre en revanche normalement. Pour un long document en 300 dpi, convertissez par tranches de pages :
          votre appareil garde toutes les images en mémoire jusqu'au téléchargement.
        </p>
      </Section>
    </PageOutil>
  );
};

export default PdfEnJpg;
