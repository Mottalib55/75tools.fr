import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Progression, Alerte, ListeOrdonnable } from "@/components/outils/PdfOutils";
import { chargerPdfLib, nouvelId, respirer } from "@/lib/pdf-outils";
import { telecharger, nomSansExtension, formatOctets, lireOctets } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Dans quel ordre les PDF sont-ils assemblés ?",
      r: "Dans l'ordre de la liste, de haut en bas : le premier fichier donne les premières pages du document final. Les fichiers s'ajoutent dans l'ordre où vous les choisissez ; changez-le ensuite avec les flèches monter et descendre, ou en glissant une ligne à la souris sur ordinateur. Le numéro affiché à gauche de chaque fichier indique sa place.",
    },
    {
      q: "Un de mes PDF est refusé car protégé, comment faire ?",
      r: "Un PDF chiffré ne peut pas être recopié dans un autre document sans son mot de passe. Ouvrez-le dans votre lecteur PDF habituel en saisissant le mot de passe, puis utilisez Imprimer et choisissez « Enregistrer au format PDF » : vous obtenez une copie sans protection, que vous pouvez ajouter à la liste. Les autres fichiers de la liste ne sont pas concernés.",
    },
    {
      q: "Les liens, signets et formulaires sont-ils conservés après la fusion ?",
      r: "Le contenu de chaque page est recopié à l'identique : texte, images, polices et liens vers des sites web restent en place. En revanche, la table des signets de chaque fichier d'origine n'est pas reprise, et les champs de formulaire peuvent perdre leur fonctionnement. Remplissez donc les formulaires avant de fusionner, et vérifiez le document final.",
    },
    {
      q: "Peut-on fusionner seulement certaines pages de chaque PDF ?",
      r: "Pas directement ici : chaque fichier est ajouté en entier. Pour ne garder que certaines pages, passez d'abord le fichier dans l'outil de séparation, qui extrait les pages voulues en un nouveau PDF, puis ajoutez ce PDF réduit à la fusion. Les deux outils fonctionnent dans votre navigateur, sans envoi, et l'opération prend quelques secondes.",
    },
    {
      q: "Le PDF fusionné pèse-t-il plus lourd que la somme des fichiers ?",
      r: "Presque jamais. Les pages sont recopiées sans recompression, donc le fichier final pèse à peu près la somme des originaux, parfois un peu moins grâce à une structure plus compacte. Trois justificatifs de 400 Ko donnent environ 1,2 Mo. Si le résultat dépasse la limite du site où vous le déposez, compressez-le ensuite en mode fort à 150 dpi.",
    },
    {
      q: "Puis-je ajouter une photo de document à la fusion ?",
      r: "Pas telle quelle : seuls les fichiers PDF sont acceptés dans la liste. Convertissez d'abord la photo (JPG, PNG ou WebP) avec l'outil JPG en PDF, en format A4, puis ajoutez le PDF obtenu ici et placez-le au bon rang. Cela marche aussi pour un recto et un verso de carte d'identité photographiés séparément : deux images, un PDF, puis la fusion.",
    },
  ],
  en: [
    {
      q: "In what order are the PDF files combined?",
      r: "In the order of the list, from top to bottom: the first file gives the first pages of the final document. Files are added in the order you pick them; change it afterwards with the up and down arrows, or by dragging a row with the mouse on a computer. The number on the left of each file shows its position.",
    },
    {
      q: "One of my PDFs is rejected because it is protected, what can I do?",
      r: "An encrypted PDF cannot be copied into another document without its password. Open it in your usual PDF reader with the password, then use Print and choose Save as PDF: you get an unprotected copy that you can add to the list. The other files in the list are not affected, and you should only do this with your own documents.",
    },
    {
      q: "Are links, bookmarks and form fields kept after merging?",
      r: "The content of each page is copied exactly: text, images, fonts and links to websites stay in place. The bookmark panel of each original file is not carried over, though, and form fields may stop working. Fill in forms such as a French CERFA before merging, then open the merged file and check that every page is there.",
    },
    {
      q: "Can I merge only some pages of each PDF?",
      r: "Not directly here: each file is added in full. To keep only certain pages, run the file through the split tool first, which extracts the pages you want into a new PDF, then add that shorter PDF to the merge. Both tools run in your browser with no upload, and the whole operation takes a few seconds.",
    },
    {
      q: "Is the merged PDF heavier than the original files put together?",
      r: "Almost never. Pages are copied without recompression, so the final file weighs roughly the sum of the originals, sometimes slightly less thanks to a more compact structure. Three 400 KB documents give about 1.2 MB. If the result is above the limit of the portal you upload it to, compress it afterwards in strong mode at 150 dpi.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 octobre 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), accès libre à la norme", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Combiner des fichiers PDF dans Aperçu sur Mac", url: "https://support.apple.com/fr-fr/guide/preview/prvw43696/mac", lu: "27 octobre 2026" },
    { editeur: "Service-Public.fr", titre: "Futur locataire d'un logement privé : justificatifs à donner au propriétaire", url: "https://www.service-public.fr/particuliers/vosdroits/F1169", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 October 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), free access to the standard", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Combine PDFs in Preview on Mac", url: "https://support.apple.com/en-gb/guide/preview/prvw43696/mac", lu: "27 October 2026" },
    { editeur: "Service-Public.fr", titre: "Futur locataire d'un logement privé : justificatifs à donner au propriétaire (documents a landlord may ask a future tenant for)", url: "https://www.service-public.fr/particuliers/vosdroits/F1169", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Fusion de PDF 75tools",
    motsCles: "fusionner pdf, fusionner pdf gratuit, assembler des pdf en ligne, combiner plusieurs pdf en un, regrouper pdf",
    choisir: "Choisir des PDF",
    ajouter: "Ajouter d'autres PDF",
    aide: "ou glissez vos fichiers ici, ils s'ajoutent à la fin de la liste",
    ceFichier: "Ce fichier",
    lecture: "Lecture des fichiers…",
    pages: (n: string, k: number) => `${n} page${k > 1 ? "s" : ""}`,
    bilan: (f: string, nf: number, p: string, np: number) =>
      `${f} fichier${nf > 1 ? "s" : ""} à assembler, ${p} page${np > 1 ? "s" : ""} au total.`,
    ignores: (n: number) =>
      n > 1
        ? ` ${n} fichiers illisibles seront ignorés : retirez-les ou remplacez-les.`
        : " 1 fichier illisible sera ignoré : retirez-le ou remplacez-le.",
    ajout: (nom: string) => `Ajout de « ${nom} »`,
    enregistrement: "Enregistrement",
    echec: (m: string) => `La fusion a échoué : ${m}`,
    bouton: "Fusionner les PDF",
    enCours: "Fusion en cours…",
    vider: "Vider la liste",
    unSeul: "Ajoutez au moins un deuxième PDF pour lancer la fusion.",
    attente: "Ajoutez au moins deux PDF : le nombre de pages et le poids du document assemblé s'afficheront ici, avec le bouton de téléchargement.",
    pret: (p: string, o: string) => `Document assemblé : ${p} pages, ${o}.`,
    telecharger: "Télécharger le PDF fusionné",
    suffixe: "fusion",
  },
  en: {
    nomAppli: "75tools PDF merger",
    motsCles: "merge pdf, merge pdf free, combine pdf files, join pdf online, combine several pdf into one",
    choisir: "Choose PDF files",
    ajouter: "Add more PDFs",
    aide: "or drop your files here, they are added to the end of the list",
    ceFichier: "This file",
    lecture: "Reading the files…",
    pages: (n: string, k: number) => `${n} page${k > 1 ? "s" : ""}`,
    bilan: (f: string, nf: number, p: string, np: number) =>
      `${f} file${nf > 1 ? "s" : ""} to merge, ${p} page${np > 1 ? "s" : ""} in total.`,
    ignores: (n: number) =>
      n > 1
        ? ` ${n} unreadable files will be skipped: remove or replace them.`
        : " 1 unreadable file will be skipped: remove or replace it.",
    ajout: (nom: string) => `Adding "${nom}"`,
    enregistrement: "Saving",
    echec: (m: string) => `Merging failed: ${m}`,
    bouton: "Merge PDFs",
    enCours: "Merging…",
    vider: "Clear the list",
    unSeul: "Add at least a second PDF to start merging.",
    attente: "Add at least two PDFs: the page count and size of the merged document will show here, with the download button.",
    pret: (p: string, o: string) => `Merged document: ${p} pages, ${o}.`,
    telecharger: "Download merged PDF",
    suffixe: "merged",
  },
};

interface Element {
  id: string;
  fichier: File;
  octets: Uint8Array | null;
  pages: number;
  erreur: string;
}

const FusionnerPdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [liste, setListe] = useState<Element[]>([]);
  const [analyse, setAnalyse] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [prog, setProg] = useState({ texte: "", fait: 0, total: 0 });
  const [erreur, setErreur] = useState("");
  const [res, setRes] = useState<{ blob: Blob; pages: number } | null>(null);

  const ajouter = async (fichiers: File[]) => {
    setRes(null);
    setErreur("");
    setAnalyse(true);
    const nouveaux: Element[] = [];
    for (const f of fichiers) {
      const el: Element = { id: nouvelId(), fichier: f, octets: null, pages: 0, erreur: "" };
      try {
        const o = await lireOctets(f);
        const d = await chargerPdfLib(o, t.ceFichier, lang);
        el.octets = o;
        el.pages = d.getPageCount();
      } catch (e) {
        el.erreur = (e as Error).message;
      }
      nouveaux.push(el);
    }
    setListe((l) => [...l, ...nouveaux]);
    setAnalyse(false);
  };

  const valides = liste.filter((e) => !e.erreur);
  const total = valides.reduce((s, e) => s + e.pages, 0);
  const enErreur = liste.length - valides.length;

  const fusionner = async () => {
    setEnCours(true);
    setErreur("");
    setRes(null);
    try {
      const sortie = await PDFDocument.create();
      for (let i = 0; i < valides.length; i++) {
        const e = valides[i];
        setProg({ texte: t.ajout(e.fichier.name), fait: i, total: valides.length });
        await respirer();
        const src = await PDFDocument.load(e.octets!, { updateMetadata: false });
        const pages = await sortie.copyPages(src, src.getPageIndices());
        pages.forEach((p) => sortie.addPage(p));
      }
      setProg({ texte: t.enregistrement, fait: valides.length, total: valides.length });
      await respirer();
      const o = await sortie.save({ useObjectStreams: true });
      setRes({ blob: new Blob([o], { type: "application/pdf" }), pages: sortie.getPageCount() });
    } catch (e) {
      setErreur(t.echec((e as Error).message));
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = valides[0] ? `${nomSansExtension(valides[0].fichier.name)}-${t.suffixe}.pdf` : `${t.suffixe}.pdf`;

  const outil = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div className="space-y-5 min-w-0">
        <DepotFichiers
          accept=".pdf,application/pdf"
          multiple
          onFichiers={ajouter}
          libelle={liste.length ? t.ajouter : t.choisir}
          aide={t.aide}
        />
        {analyse && <p role="status" className="text-sm text-neutral-400">{t.lecture}</p>}

        {liste.length > 0 && (
          <>
            <ListeOrdonnable
              elements={liste}
              onChange={(l) => {
                setListe(l);
                setRes(null);
              }}
              desactive={enCours}
              libelle={(e) => e.fichier.name}
              rendu={(e) => (
                <div className="min-w-0">
                  <p className="text-neutral-100 text-sm truncate" title={e.fichier.name}>
                    {e.fichier.name}
                  </p>
                  {e.erreur ? (
                    <p className="text-xs text-red-300 [overflow-wrap:anywhere]">{e.erreur}</p>
                  ) : (
                    <p className="text-xs text-neutral-500 tabular-nums">
                      {t.pages(nb(e.pages), e.pages)} · {formatOctets(e.fichier.size, lang)}
                    </p>
                  )}
                </div>
              )}
            />
            <p className="text-sm text-neutral-400 tabular-nums" role="status">
              {t.bilan(nb(valides.length), valides.length, nb(total), total)}
              {enErreur > 0 && t.ignores(enErreur)}
            </p>
          </>
        )}
      </div>

      <div data-resultat className="space-y-4 lg:sticky lg:top-4">
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={fusionner} disabled={valides.length < 2 || enCours || analyse}>
            {enCours ? t.enCours : t.bouton}
          </Bouton>
          {liste.length > 0 && (
            <Bouton
              secondaire
              disabled={enCours}
              onClick={() => {
                setListe([]);
                setRes(null);
              }}
            >
              {t.vider}
            </Bouton>
          )}
        </div>
        {erreur && <Alerte>{erreur}</Alerte>}
        {enCours && <Progression {...prog} />}
        {!res && !enCours && (
          <p className="text-sm text-neutral-500">{liste.length === 1 ? t.unSeul : t.attente}</p>
        )}
        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 tabular-nums">{t.pret(nb(res.pages), formatOctets(res.blob.size, lang))}</p>
            <Bouton onClick={() => telecharger(nomSortie, res.blob)}>{t.telecharger}</Bouton>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="fusionner-pdf"
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
    <Section titre="Fusionner des PDF gratuitement, en pratique">
      <p>
        Pour fusionner des PDF gratuitement, choisissez vos fichiers dans le cadre ci-dessus (Ctrl ou Cmd + clic
        pour en prendre plusieurs d'un coup), rangez-les avec les flèches dans l'ordre où ils doivent se lire, puis
        cliquez sur « Fusionner les PDF » : un seul document se télécharge, avec toutes les pages à la suite. Le
        nombre de pages de chaque fichier s'affiche dès l'ajout, et le total se met à jour à chaque changement.
        Exemple courant : une pièce d'identité (2 pages), trois bulletins de salaire (3 pages) et un avis
        d'imposition (4 pages) donnent un dossier de location de 9 pages, prêt à joindre. Les pages sont
        recopiées sans recompression, donc le texte reste sélectionnable et le poids final avoisine la somme des
        fichiers. Rien n'est envoyé : la fusion se fait dans votre navigateur. Seule limite réelle, un PDF protégé
        par mot de passe doit d'abord être déverrouillé.
      </p>
    </Section>

    <Section titre="Assembler des PDF en trois gestes">
      <p>
        <strong>1. Ajoutez vos fichiers.</strong> Choisissez-les en une fois ou en plusieurs fois : chaque ajout
        se place en fin de liste. L'outil lit chaque PDF et affiche son nombre de pages ; un fichier protégé ou
        abîmé est signalé en rouge et sera ignoré.
      </p>
      <p>
        <strong>2. Réglez l'ordre.</strong> Les flèches déplacent un fichier d'un cran vers le haut ou vers le
        bas, la croix le retire. Sur ordinateur, vous pouvez aussi saisir une ligne et la déposer à sa nouvelle
        place.
      </p>
      <p>
        <strong>3. Fusionnez et téléchargez.</strong> Le fichier final pèse à peu près la somme des fichiers
        d'origine ; s'il est trop lourd pour un envoi, passez-le ensuite dans l'outil pour{" "}
        <Link to="/compresser-pdf/">compresser un PDF</Link>.
      </p>
    </Section>

    <Section titre="Dossiers à constituer : quelques usages courants">
      <p>
        La fusion sert surtout quand un site ou un interlocuteur demande <strong>un seul fichier</strong> alors
        que vous avez plusieurs pièces : dossier de location (le propriétaire ne peut exiger que les justificatifs
        d'une liste fixée par décret), demande de remboursement (formulaire et factures), candidature (lettre, CV,
        diplômes), dossier d'inscription ou de subvention.
      </p>
      <p>
        Mettez les pièces dans l'ordre où la liste vous les demande : la personne qui instruit le dossier le lit
        de haut en bas. Si une pièce n'existe qu'en photo, convertissez-la d'abord avec l'outil{" "}
        <Link to="/jpg-en-pdf/">JPG en PDF</Link>, puis ajoutez le PDF obtenu ici. Donnez enfin au fichier final
        un nom parlant, par exemple « Dossier-location-Martin.pdf », plutôt que le nom proposé par défaut.
      </p>
    </Section>

    <Section titre="Ce qui est conservé, ce qui ne l'est pas">
      <p>
        Chaque page garde sa taille et son orientation d'origine : on peut donc mêler une page A4 portrait, une
        page paysage et un format lettre américain dans le même document. Le contenu des pages, dont les liens
        vers des adresses web, est recopié à l'identique. Les signets (la table des matières latérale des
        lecteurs PDF) et les pièces jointes intégrées aux PDF d'origine ne sont pas repris.
      </p>
      <p>
        Sur un téléphone, des centaines de pages scannées peuvent saturer la mémoire du navigateur ; dans ce cas,
        fusionnez par groupes, puis fusionnez les groupes entre eux. Un PDF signé électroniquement avec un
        certificat peut être ajouté, mais sa signature ne sera plus vérifiable dans le document fusionné : si le
        destinataire doit la contrôler, envoyez le fichier signé à part.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Merge PDF files for free, step by step">
      <p>
        To merge PDF files for free, choose your documents in the box above (Ctrl or Cmd + click to pick several at
        once), put them in reading order with the arrows, then click "Merge PDFs": a single document downloads,
        with every page in sequence. The page count of each file appears as soon as it is added, and the total
        updates with every change. A typical case in France: a passport (2 pages), your last three fiches de paie
        (payslips, 3 pages) and your avis d'imposition (tax notice, 4 pages) become one 9-page rental application,
        ready to attach. Pages are copied without recompression, so text stays selectable and the final size is
        close to the sum of the files. Nothing is uploaded: the merge runs in your browser. The one real limit is
        that a password-protected PDF has to be unlocked first.
      </p>
    </Section>

    <Section titre="How to combine PDFs in three moves">
      <p>
        <strong>1. Add your files.</strong> Pick them all at once or in several goes: each new file goes to the end
        of the list. The tool reads every PDF and shows its page count; a protected or damaged file is flagged in
        red and will be skipped.
      </p>
      <p>
        <strong>2. Set the order.</strong> The arrows move a file up or down one place, the cross removes it. On a
        computer you can also grab a row and drop it in its new position.
      </p>
      <p>
        <strong>3. Merge and download.</strong> The merged file weighs roughly what the originals weigh together; if
        it is too heavy for an email or an upload form, run it through the tool to{" "}
        <Link to="/en/compress-pdf/">compress a PDF</Link>.
      </p>
    </Section>

    <Section titre="French paperwork that asks for one single file">
      <p>
        Merging is mostly useful when a website or an office wants <strong>one file</strong> and you have several
        documents: a rental application (French law caps the list of documents a landlord may ask for, which
        Service-Public.fr publishes), a health insurance or mutuelle claim with its invoices, a job application with
        cover letter, CV and diplomas, a visa or titre de séjour (residence permit) renewal on the ANEF portal.
      </p>
      <p>
        Put the documents in the order the checklist gives them, since whoever reviews the file reads it top to
        bottom. If a document only exists as a photo, convert it first with the{" "}
        <Link to="/en/jpg-to-pdf/">JPG to PDF converter</Link>, then add the resulting PDF here. Finally, give the
        merged file a clear name, such as "Rental-application-Smith.pdf", rather than the default one.
      </p>
    </Section>

    <Section titre="What is kept and what is not">
      <p>
        Every page keeps its own size and orientation, so an A4 portrait page, a landscape page and a US Letter page
        can sit in the same document. Page content, including links to web addresses, is copied exactly. Bookmarks
        (the side table of contents in PDF readers) and files embedded inside the original PDFs are not carried
        over.
      </p>
      <p>
        On a phone, hundreds of scanned pages can fill the browser's memory; if that happens, merge in batches and
        then merge the batches. A PDF signed with a digital certificate can be added, but its signature can no longer
        be verified inside the merged document: if the recipient needs to check it, send the signed file separately.
      </p>
    </Section>
  </>
);

export default FusionnerPdf;
