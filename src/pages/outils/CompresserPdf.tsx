import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { Progression, Alerte, Segments, ChoixListe } from "@/components/outils/PdfOutils";
import { chargerPdfLib, messagePdfJs, respirer } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { telecharger, nomSansExtension, formatOctets, lireOctets, canvasVersBlob } from "@/lib/fichiers";

const FAQ: QuestionFaq[] = [
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
];

type Mode = "leger" | "fort";

interface Resultat {
  blob: Blob;
  avant: number;
  apres: number;
  mode: Mode;
}

const CompresserPdf = () => {
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

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setRes(null);
    setErreur("");
    setFichier(null);
    setOctets(null);
    try {
      const o = await lireOctets(fi);
      const doc = await chargerPdfLib(o, `« ${fi.name} »`);
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
        setProg({ texte: "Réécriture du fichier", fait: 0, total: 0 });
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
          throw new Error(messagePdfJs(e, `« ${fichier.name} »`));
        }
        const neuf = await PDFDocument.create();
        const n = source.numPages;
        for (let p = 1; p <= n; p++) {
          setProg({ texte: "Conversion des pages en images", fait: p - 1, total: n });
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
        setProg({ texte: "Assemblage du PDF", fait: n, total: n });
        await respirer();
        await source.destroy();
        sortie = await neuf.save({ useObjectStreams: true });
      }
      setRes({ blob: new Blob([sortie], { type: "application/pdf" }), avant: octets.length, apres: sortie.length, mode });
    } catch (e) {
      setErreur((e as Error).message || "La compression a échoué.");
    } finally {
      setEnCours(false);
    }
  };

  const gain = res ? Math.round((1 - res.apres / res.avant) * 100) : 0;
  const nomSortie = fichier ? `${nomSansExtension(fichier.name)}-compresse.pdf` : "compresse.pdf";

  return (
    <PageOutil
      href="/compresser-pdf/"
      titre="Compresser PDF gratuit : réduire la taille d'un PDF en ligne"
      description="Compresser un PDF gratuitement : réduisez son poids pour l'envoyer par e-mail ou le déposer sur un site. Poids avant et après affichés, rien n'est envoyé."
      motsCles="compresser pdf, compresser pdf gratuit, réduire la taille d'un pdf, alléger un pdf, réduire poids pdf"
      nomAppli="Compresseur de PDF 75tools"
      h1="Compresser un PDF et réduire sa taille"
      chapeau="Déposez votre PDF, choisissez la compression légère (sans perte) ou forte (pages converties en images), puis comparez les poids avant et après. Tout se passe dans votre navigateur."
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
                setRes(null);
              }}
            >
              Changer de fichier
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <fieldset className="space-y-4" disabled={enCours}>
          <legend className="text-sm text-neutral-300 mb-2">Niveau de compression</legend>
          <Segments
            nom="Niveau de compression"
            valeur={mode}
            onChange={(v) => {
              setMode(v);
              setRes(null);
            }}
            options={[
              { v: "fort", l: "Fort : pages en images JPEG" },
              { v: "leger", l: "Léger : sans perte" },
            ]}
          />
          {mode === "fort" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                <ChoixListe label="Résolution des pages" value={dpi} onChange={(v) => (setDpi(v), setRes(null))}>
                  <option value="72">72 dpi : le plus léger, lecture à l'écran</option>
                  <option value="96">96 dpi : léger</option>
                  <option value="120">120 dpi : équilibré</option>
                  <option value="150">150 dpi : net, impression correcte</option>
                  <option value="200">200 dpi : très net</option>
                </ChoixListe>
                <ChoixListe label="Qualité JPEG" value={qualite} onChange={(v) => (setQualite(v), setRes(null))}>
                  <option value="0.5">Basse (50 %)</option>
                  <option value="0.7">Moyenne (70 %)</option>
                  <option value="0.85">Haute (85 %)</option>
                </ChoixListe>
              </div>
              <p className="text-sm text-amber-200/90">
                Avec ce mode, le texte du PDF résultant n'est plus sélectionnable ni copiable, et les liens ne sont
                plus cliquables : chaque page devient une image.
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-400">
              Le fichier est relu puis réenregistré avec une structure plus compacte (flux d'objets). Texte, images et
              liens restent intacts, mais le gain est souvent faible.
            </p>
          )}
        </fieldset>

        <Bouton onClick={compresser} disabled={!fichier || enCours}>
          {enCours ? "Compression en cours…" : "Compresser le PDF"}
        </Bouton>

        {enCours && <Progression {...prog} />}

        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 tabular-nums">
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">Avant</p>
                <p className="text-xl text-white">{formatOctets(res.avant)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">Après</p>
                <p className="text-xl text-white">{formatOctets(res.apres)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-neutral-500">Gain</p>
                <p className={gain > 0 ? "text-xl text-sky-300" : "text-xl text-amber-300"}>
                  {gain > 0 ? `${gain.toLocaleString("fr-FR")} % plus léger` : "aucun"}
                </p>
              </div>
            </div>
            {res.apres >= res.avant ? (
              <>
                <p className="text-amber-200">
                  Le résultat n'est pas plus léger que l'original ({formatOctets(res.apres)} contre{" "}
                  {formatOctets(res.avant)}) : gardez votre fichier d'origine.
                  {res.mode === "leger"
                    ? " Essayez le mode fort, qui réduit les images."
                    : " Ce PDF contient surtout du texte, déjà compact ; essayez une résolution plus basse, ou retirez des pages."}
                </p>
                <Bouton secondaire onClick={() => telecharger(nomSortie, res.blob)}>
                  Télécharger quand même
                </Bouton>
              </>
            ) : (
              <Bouton onClick={() => telecharger(nomSortie, res.blob)}>Télécharger le PDF compressé</Bouton>
            )}
          </div>
        )}
      </div>

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
          Le fichier n'est pas envoyé : il est lu et transformé par votre navigateur, sur votre appareil, ce qui
          compte pour un avis d'imposition ou un bulletin de salaire. La contrepartie est que la vitesse dépend de
          votre machine : un PDF de cent pages en mode fort à 200 dpi peut prendre une minute sur un téléphone
          ancien. L'indicateur de progression affiche la page en cours.
        </p>
        <p>
          Un PDF protégé par un mot de passe ne peut pas être compressé ici : ouvrez-le dans votre lecteur
          habituel, enregistrez-en une copie sans protection, puis recommencez. Un PDF signé électroniquement perd
          la validité de sa signature dès qu'il est modifié, quel que soit l'outil : ne compressez jamais un
          document dont la signature doit rester vérifiable.
        </p>
      </Section>
    </PageOutil>
  );
};

export default CompresserPdf;
