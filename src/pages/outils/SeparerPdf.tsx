import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Progression, Alerte, Segments, useVignettes } from "@/components/outils/PdfOutils";
import {
  chargerPdfLib,
  analyserPlages,
  pagesDe,
  pagesUniques,
  plagesEnTexte,
  respirer,
  Plage,
} from "@/lib/pdf-outils";
import { ouvrirPdf } from "@/lib/pdfjs";
import { creerZip } from "@/lib/zip";
import { telecharger, nomSansExtension, formatOctets, lireOctets } from "@/lib/fichiers";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Comment écrire les pages à extraire ?",
      r: "Séparez les pages ou les plages par des virgules : « 1-3, 5, 8-10 » donne les pages 1, 2, 3, 5, 8, 9 et 10. « 8- » va de la page 8 à la dernière, et « 5-3 » donne les pages 5, 4 et 3 dans cet ordre. Vous pouvez aussi cliquer sur les vignettes pour ajouter ou retirer une page : le champ se met à jour.",
    },
    {
      q: "Je veux un fichier par page, comment les récupérer ?",
      r: "Choisissez « Une page par fichier ». Laissez le champ des pages vide pour découper tout le document, ou indiquez seulement les pages voulues. Les fichiers sont réunis dans une archive ZIP, nommés avec le numéro de page (contrat-page-03.pdf…) pour rester triés. Double-cliquez sur l'archive : Windows et macOS l'ouvrent sans logiciel supplémentaire.",
    },
    {
      q: "La séparation abîme-t-elle la qualité des pages ?",
      r: "Non. Les pages sont recopiées telles quelles dans les nouveaux fichiers, sans être transformées en images ni recompressées : le texte reste sélectionnable, les images gardent leur définition. Un fichier extrait peut même peser presque autant que l'original s'il partage des polices ou des images avec les autres pages, car ces ressources sont recopiées avec lui.",
    },
    {
      q: "Le PDF d'origine est-il modifié ?",
      r: "Non. L'outil lit votre fichier et en fabrique de nouveaux ; l'original reste tel quel sur votre appareil. Pour retirer définitivement des pages d'un document, extrayez celles que vous gardez, vérifiez le résultat, puis remplacez vous-même l'ancien fichier par le nouveau. Rien n'est envoyé à un serveur pendant l'opération.",
    },
    {
      q: "La numérotation imprimée sur mon document ne correspond pas aux pages, laquelle suivre ?",
      r: "Suivez celle du fichier, qui commence toujours à 1 sur la première page, couverture comprise. Un rapport dont la page imprimée « 1 » est précédée d'une couverture et d'un sommaire commence en réalité à la page 3 du fichier. Le numéro écrit sous chaque vignette est celui à saisir dans le champ des pages.",
    },
    {
      q: "Comment retirer une seule page d'un PDF de 20 pages ?",
      r: "Gardez le mode « Les pages choisies en un PDF » et écrivez toutes les pages sauf celle à retirer : pour enlever la page 7, saisissez « 1-6, 8-20 ». Vous pouvez aussi écrire « 1-20 » puis cliquer sur la vignette 7 pour la désélectionner. Vous obtenez un PDF de 19 pages ; l'original reste intact.",
    },
  ],
  en: [
    {
      q: "How do I type the pages I want to extract?",
      r: "Separate pages or ranges with commas: 1-3, 5, 8-10 gives pages 1, 2, 3, 5, 8, 9 and 10. 8- runs from page 8 to the last one, and 5-3 gives pages 5, 4 and 3 in that order. You can also click the thumbnails to add or remove a page, and the field updates to match.",
    },
    {
      q: "I want one file per page, how do I get them?",
      r: "Choose One page per file. Leave the pages field empty to split the whole document, or type only the pages you need. The files are bundled in a ZIP archive and named with their page number (contract-page-03.pdf and so on) so they stay in order. Double-click the archive: Windows and macOS open it without extra software.",
    },
    {
      q: "Does splitting reduce the quality of the pages?",
      r: "No. Pages are copied as they are into the new files, without being turned into images or recompressed: text stays selectable and images keep their resolution. An extracted file can even weigh almost as much as the original when it shares fonts or images with the other pages, because those resources are copied along with it.",
    },
    {
      q: "The page numbers printed on my document do not match, which ones do I use?",
      r: "Use the file's own numbering, which always starts at 1 on the first page, cover included. A French annual report whose printed page 1 comes after a cover and a contents page actually starts on page 3 of the file. The number under each thumbnail is the one to type in the pages field.",
    },
    {
      q: "How do I remove a single page from a 20-page PDF?",
      r: "Keep the Selected pages in one PDF mode and type every page except the one to drop: to remove page 7, enter 1-6, 8-20. You can also type 1-20 and then click thumbnail 7 to deselect it. You get a 19-page PDF, and the original file on your device is left untouched.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 octobre 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), accès libre à la norme", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 octobre 2026" },
    { editeur: "Microsoft Support", titre: "Compresser et décompresser des fichiers", url: "https://support.microsoft.com/fr-fr/windows/compresser-et-d%C3%A9compresser-des-fichiers-zip-f6dde0a7-0fec-8294-e1d3-703ed85e7ebc", lu: "27 octobre 2026" },
    { editeur: "Assistance Apple", titre: "Compresser et décompresser des fichiers et dossiers sur Mac", url: "https://support.apple.com/fr-fr/guide/mac-help/mchlp2528/mac", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "ISO", titre: "ISO 32000-2:2020, Portable document format, Part 2: PDF 2.0", url: "https://www.iso.org/standard/75839.html", lu: "27 October 2026" },
    { editeur: "PDF Association", titre: "ISO 32000-2 (PDF 2.0), free access to the standard", url: "https://pdfa.org/resource/iso-32000-2/", lu: "27 October 2026" },
    { editeur: "Microsoft Support", titre: "Zip and unzip files", url: "https://support.microsoft.com/en-us/windows/zip-and-unzip-files-f6dde0a7-0fec-8294-e1d3-703ed85e7ebc", lu: "27 October 2026" },
    { editeur: "Apple Support", titre: "Zip and unzip files and folders on Mac", url: "https://support.apple.com/en-gb/guide/mac-help/mchlp2528/mac", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Séparation de PDF 75tools",
    motsCles: "séparer pdf, séparer les pages d'un pdf, diviser un pdf en ligne, extraire des pages pdf, découper pdf",
    choisir: "Choisir un PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Changer de fichier",
    question: "Que voulez-vous obtenir ?",
    modeNom: "Mode de séparation",
    extraire: "Les pages choisies en un PDF",
    plages: "Un PDF par plage",
    pages: "Une page par fichier",
    champ: "Pages",
    phToutes: "vide = toutes les pages",
    phExemple: "par exemple 1-3, 5, 8-10",
    aideChamp: "Virgule entre les plages ; « 8- » va jusqu'à la dernière page. Cliquez aussi sur les vignettes.",
    aucune: "Indiquez au moins une page.",
    bilan: (p: string, np: number, f: string, nf: number) =>
      `${p} page${np > 1 ? "s" : ""} retenue${np > 1 ? "s" : ""}, ${f} fichier${nf > 1 ? "s PDF, réunis dans une archive ZIP" : " PDF"}.`,
    creation: "Création des fichiers",
    archive: "Création de l'archive ZIP",
    echec: (m: string) => `La séparation a échoué : ${m}`,
    bouton: "Séparer le PDF",
    enCours: "Séparation en cours…",
    attente: "Ouvrez un PDF et indiquez les pages : le ou les fichiers obtenus s'afficheront ici, prêts à télécharger.",
    pretZip: (n: number, nom: string) => `${n} fichiers prêts dans ${nom}`,
    pret: (nom: string) => `Fichier prêt : ${nom}`,
    telZip: "Télécharger l'archive ZIP",
    telPdf: "Télécharger le PDF",
    cliquez: "Cliquez sur une page pour l'ajouter ou la retirer de la sélection",
    max300: " (vignettes des 300 premières pages)",
    pageAria: (p: number) => `Page ${p}`,
    sPage: "page",
    sPages: "pages",
    sExtrait: "extrait",
    sSepare: "separe",
  },
  en: {
    nomAppli: "75tools PDF splitter",
    motsCles: "split pdf, split pdf free, extract pages from pdf, separate pdf pages, divide pdf online",
    choisir: "Choose a PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Change file",
    question: "What do you want to get?",
    modeNom: "Split mode",
    extraire: "Selected pages in one PDF",
    plages: "One PDF per range",
    pages: "One page per file",
    champ: "Pages",
    phToutes: "empty = all pages",
    phExemple: "for example 1-3, 5, 8-10",
    aideChamp: "Commas between ranges; 8- runs to the last page. You can also click the thumbnails.",
    aucune: "Enter at least one page.",
    bilan: (p: string, np: number, f: string, nf: number) =>
      `${p} page${np > 1 ? "s" : ""} selected, ${f} PDF file${nf > 1 ? "s, bundled in a ZIP archive" : ""}.`,
    creation: "Creating the files",
    archive: "Building the ZIP archive",
    echec: (m: string) => `Splitting failed: ${m}`,
    bouton: "Split PDF",
    enCours: "Splitting…",
    attente: "Open a PDF and choose the pages: the resulting file or files will show here, ready to download.",
    pretZip: (n: number, nom: string) => `${n} files ready in ${nom}`,
    pret: (nom: string) => `File ready: ${nom}`,
    telZip: "Download ZIP archive",
    telPdf: "Download PDF",
    cliquez: "Click a page to add it to or remove it from the selection",
    max300: " (thumbnails of the first 300 pages)",
    pageAria: (p: number) => `Page ${p}`,
    sPage: "page",
    sPages: "pages",
    sExtrait: "extract",
    sSepare: "split",
  },
};

type Mode = "extraire" | "plages" | "pages";

const SeparerPdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const nb = (n: number) => n.toLocaleString(locale(lang));
  const [fichier, setFichier] = useState<File | null>(null);
  const [octets, setOctets] = useState<Uint8Array | null>(null);
  const [nbPages, setNbPages] = useState(0);
  const [docJs, setDocJs] = useState<Awaited<ReturnType<typeof ouvrirPdf>> | null>(null);
  const [texte, setTexte] = useState("");
  const [mode, setMode] = useState<Mode>("extraire");
  const [enCours, setEnCours] = useState(false);
  const [prog, setProg] = useState({ texte: "", fait: 0, total: 0 });
  const [erreur, setErreur] = useState("");
  const [res, setRes] = useState<{ blob: Blob; nom: string; nb: number } | null>(null);
  const vignettes = useVignettes(docJs, nbPages, 150, 300);

  useEffect(() => () => void docJs?.destroy(), [docJs]);

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setErreur("");
    setRes(null);
    setFichier(null);
    setDocJs(null);
    try {
      const o = await lireOctets(fi);
      const d = await chargerPdfLib(o, lang === "en" ? `"${fi.name}"` : `« ${fi.name} »`, lang);
      setNbPages(d.getPageCount());
      setOctets(o);
      setFichier(fi);
      setTexte("");
      ouvrirPdf(o.slice())
        .then(setDocJs)
        .catch(() => setDocJs(null)); // les vignettes sont un confort : pas d'erreur si elles échouent
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

  const analyse = useMemo(() => analyserPlages(texte, nbPages || 1, lang), [texte, nbPages, lang]);
  const toutes: Plage[] = nbPages ? [[1, nbPages]] : [];
  const plages = texte.trim() === "" && mode === "pages" ? toutes : analyse.plages;
  const choisies = useMemo(() => new Set(pagesUniques(analyse.plages)), [analyse]);

  const basculer = (p: number) => {
    const s = new Set(choisies);
    if (s.has(p)) s.delete(p);
    else s.add(p);
    setTexte(plagesEnTexte([...s]));
    setRes(null);
  };

  const base = fichier ? nomSansExtension(fichier.name) : "document";
  const chiffres = String(nbPages).length;
  const num = (n: number) => String(n).padStart(Math.max(2, chiffres), "0");

  const separer = async () => {
    if (!octets || !plages.length) return;
    setEnCours(true);
    setErreur("");
    setRes(null);
    try {
      const src = await PDFDocument.load(octets, { updateMetadata: false });
      const fabriquer = async (pages: number[]) => {
        const d = await PDFDocument.create();
        const copies = await d.copyPages(src, pages.map((p) => p - 1));
        copies.forEach((c) => d.addPage(c));
        return d.save({ useObjectStreams: true });
      };
      let lots: { nom: string; pages: number[] }[];
      if (mode === "extraire") {
        const p = pagesUniques(plages);
        lots = [{ nom: `${base}-${t.sPages}-${plagesEnTexte(p).replace(/, /g, "_")}.pdf`, pages: p }];
      } else if (mode === "plages") {
        lots = plages.map(([a, b]) => ({
          nom: a === b ? `${base}-${t.sPage}-${num(a)}.pdf` : `${base}-${t.sPages}-${num(a)}-${num(b)}.pdf`,
          pages: pagesDe([a, b]),
        }));
      } else {
        lots = pagesUniques(plages).map((p) => ({ nom: `${base}-${t.sPage}-${num(p)}.pdf`, pages: [p] }));
      }
      if (lots[0].nom.length > 120) lots[0].nom = `${base}-${t.sExtrait}.pdf`;
      const fichiers: { nom: string; donnees: Uint8Array }[] = [];
      for (let i = 0; i < lots.length; i++) {
        setProg({ texte: t.creation, fait: i, total: lots.length });
        await respirer();
        fichiers.push({ nom: lots[i].nom, donnees: await fabriquer(lots[i].pages) });
      }
      if (fichiers.length === 1) {
        setRes({ blob: new Blob([fichiers[0].donnees], { type: "application/pdf" }), nom: fichiers[0].nom, nb: 1 });
      } else {
        setProg({ texte: t.archive, fait: lots.length, total: lots.length });
        await respirer();
        setRes({ blob: await creerZip(fichiers), nom: `${base}-${t.sSepare}.zip`, nb: fichiers.length });
      }
    } catch (e) {
      setErreur(t.echec((e as Error).message));
    } finally {
      setEnCours(false);
    }
  };

  const nbSortie =
    mode === "extraire" ? (plages.length ? 1 : 0) : mode === "plages" ? plages.length : pagesUniques(plages).length;
  const nbRetenues = pagesUniques(plages).length;

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
                {formatOctets(fichier.size, lang)} · {nb(nbPages)} {t.page(nbPages)}
              </span>
            </p>
            <Bouton
              secondaire
              disabled={enCours}
              onClick={() => {
                setFichier(null);
                setOctets(null);
                setDocJs(null);
                setRes(null);
                setNbPages(0);
              }}
            >
              {t.changer}
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <fieldset className="space-y-4" disabled={enCours}>
          <legend className="text-sm text-neutral-300 mb-2">{t.question}</legend>
          <Segments
            nom={t.modeNom}
            valeur={mode}
            onChange={(v) => {
              setMode(v);
              setRes(null);
            }}
            options={[
              { v: "extraire", l: t.extraire },
              { v: "plages", l: t.plages },
              { v: "pages", l: t.pages },
            ]}
          />
          <div className="max-w-xl">
            <label htmlFor="pages-separer" className="block text-sm text-neutral-300 mb-1">
              {t.champ}
            </label>
            <input
              id="pages-separer"
              type="text"
              inputMode="numeric"
              value={texte}
              onChange={(e) => {
                setTexte(e.target.value);
                setRes(null);
              }}
              placeholder={mode === "pages" ? t.phToutes : t.phExemple}
              className={classeChamp}
              aria-describedby="aide-pages"
            />
            <span id="aide-pages" className="block text-xs text-neutral-500 mt-1">
              {t.aideChamp}
            </span>
          </div>
          {analyse.erreur && texte.trim() && <Alerte>{analyse.erreur}</Alerte>}
          {analyse.avertissements.length > 0 && fichier && (
            <Alerte ton="info">
              {analyse.avertissements.map((a) => (
                <span key={a} className="block">
                  {a}
                </span>
              ))}
            </Alerte>
          )}
        </fieldset>

        {fichier && nbPages > 0 && (
          <div>
            <p className="text-sm text-neutral-400 mb-2">
              {t.cliquez}
              {nbPages > 300 ? t.max300 : ""}.
            </p>
            <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: Math.min(nbPages, 300) }, (_, i) => i + 1).map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => basculer(p)}
                    aria-pressed={choisies.has(p)}
                    aria-label={t.pageAria(p)}
                    className={cn(
                      "w-full rounded-md border-2 p-1 bg-neutral-900 text-center",
                      choisies.has(p) ? "border-sky-400" : "border-neutral-800 hover:border-neutral-600"
                    )}
                  >
                    {vignettes[p] ? (
                      <img src={vignettes[p]} alt="" className="w-full h-auto bg-white" />
                    ) : (
                      <span className="block aspect-[3/4] bg-neutral-800 rounded-sm" />
                    )}
                    <span className={cn("block text-xs mt-1 tabular-nums", choisies.has(p) ? "text-sky-300" : "text-neutral-400")}>
                      {p}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div data-resultat className="space-y-4 lg:sticky lg:top-4">
        <Bouton onClick={separer} disabled={!fichier || enCours || nbSortie === 0 || !!analyse.erreur}>
          {enCours ? t.enCours : t.bouton}
        </Bouton>
        {fichier && (
          <p className="text-sm text-neutral-400 tabular-nums" role="status">
            {nbSortie === 0 ? t.aucune : t.bilan(nb(nbRetenues), nbRetenues, nb(nbSortie), nbSortie)}
          </p>
        )}
        {enCours && <Progression {...prog} />}
        {!res && !enCours && !fichier && <p className="text-sm text-neutral-500">{t.attente}</p>}
        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 [overflow-wrap:anywhere]">
              {res.nb > 1 ? t.pretZip(res.nb, res.nom) : t.pret(res.nom)} ({formatOctets(res.blob.size, lang)}).
            </p>
            <Bouton onClick={() => telecharger(res.nom, res.blob)}>{res.nb > 1 ? t.telZip : t.telPdf}</Bouton>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="separer-pdf"
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
    <Section titre="Séparer les pages d'un PDF : la réponse courte">
      <p>
        Pour séparer les pages d'un PDF, ouvrez le fichier dans le cadre ci-dessus, écrivez les pages voulues
        (par exemple « 1-3, 5, 8-10 ») ou cliquez sur leurs vignettes, choisissez ce que vous voulez obtenir,
        puis cliquez sur « Séparer le PDF ». Trois modes sont proposés : un seul PDF qui ne garde que les pages
        choisies, un PDF par plage, ou un PDF par page réunis dans une archive ZIP. Exemple : un relevé bancaire
        annuel de 24 pages dont vous ne devez fournir que les trois derniers mois devient, avec « 19-24 », un PDF
        de 6 pages. Les pages sont recopiées sans conversion, donc le texte reste sélectionnable et la netteté ne
        change pas. Le fichier n'est jamais envoyé : le découpage se fait dans votre navigateur. Limite à
        connaître : un PDF protégé par mot de passe doit d'abord être déverrouillé, et une signature électronique
        ne reste pas valable sur un extrait.
      </p>
    </Section>

    <Section titre="Trois façons de séparer un PDF">
      <p>
        <strong>Les pages choisies en un PDF</strong> : un seul fichier qui ne contient que les pages indiquées,
        dans l'ordre où vous les avez écrites. C'est le mode à utiliser pour ne transmettre que la page de
        signature d'un contrat, ou pour retirer les pages blanches et les annexes d'un document.
      </p>
      <p>
        <strong>Un PDF par plage</strong> : chaque plage séparée par une virgule devient un fichier. Avec
        « 1-4, 5-9, 10- », un dossier scanné d'un bloc redonne ses trois pièces : la pièce d'identité, les
        bulletins de salaire, l'avis d'imposition. Les fichiers arrivent dans une archive ZIP, et leur nom
        rappelle les pages qu'ils contiennent.
      </p>
      <p>
        <strong>Une page par fichier</strong> : chaque page devient un PDF indépendant, pratique pour un lot de
        factures scannées ensemble. Le numéro de page figure dans chaque nom de fichier, complété par des zéros
        (page-01, page-02…) pour que l'ordre soit respecté dans votre explorateur de fichiers.
      </p>
    </Section>

    <Section titre="Bien noter les plages de pages">
      <p>
        Une page qui n'existe pas n'est pas ignorée en silence : si vous écrivez « 10-15 » pour un document de
        12 pages, la plage est ramenée à 10-12 et un message vous le signale. Une plage entièrement hors du
        document est retirée, avec un message également. Les espaces ne comptent pas : « 1 - 3 » vaut « 1-3 ».
      </p>
      <p>
        Pour faire l'inverse, c'est-à-dire réunir plusieurs fichiers en un, utilisez l'outil pour{" "}
        <Link to="/fusionner-pdf/">fusionner des PDF</Link>. Et pour récupérer une page sous forme d'image, par
        exemple pour l'insérer dans une présentation, passez par <Link to="/pdf-en-jpg/">PDF en JPG</Link>.
      </p>
    </Section>

    <Section titre="Limites et confidentialité">
      <p>
        Le document n'est envoyé nulle part, ce qui compte pour un relevé bancaire, un dossier médical ou un
        contrat. Recopier des pages est rapide, même pour plusieurs centaines de pages ; seules les vignettes
        demandent un peu de temps, et elles s'affichent au fur et à mesure.
      </p>
      <p>
        Les signets et la table des matières de l'original ne sont pas repris dans les fichiers extraits, et une
        signature électronique à certificat porte sur le document entier : sur un extrait, elle n'est plus
        vérifiable. Envoyez le document signé complet si le destinataire doit la contrôler.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Split a PDF and extract pages: the short answer">
      <p>
        To split a PDF and extract pages, open the file in the box above, type the pages you want (for example
        1-3, 5, 8-10) or click their thumbnails, pick what you want to get, then click "Split PDF". There are three
        modes: one PDF that keeps only the selected pages, one PDF per range, or one PDF per page bundled in a ZIP
        archive. Example: a French bank sends a 24-page annual relevé de compte (statement) and your landlord or the
        préfecture only wants the last three months; typing 19-24 gives a 6-page PDF. Pages are copied without
        conversion, so text stays selectable and sharpness does not change. The file is never uploaded: splitting
        happens in your browser. Two limits to know: a password-protected PDF must be unlocked first, and a digital
        signature does not remain valid on an extract.
      </p>
    </Section>

    <Section titre="Three ways to split a PDF">
      <p>
        <strong>Selected pages in one PDF</strong>: a single file that holds only the pages you listed, in the order
        you typed them. Use it to send just the signature page of a contract, or to strip blank pages and appendices
        from a document.
      </p>
      <p>
        <strong>One PDF per range</strong>: each comma-separated range becomes its own file. With 1-4, 5-9, 10-, a
        file scanned in one go gives back its three parts: your ID, your fiches de paie (payslips) and your avis
        d'imposition (tax notice). The files come in a ZIP archive, and each name shows the pages it contains.
      </p>
      <p>
        <strong>One page per file</strong>: every page becomes a separate PDF, handy for a batch of invoices scanned
        together. The page number is in each file name, padded with zeros (page-01, page-02 and so on) so your file
        manager keeps them in order.
      </p>
    </Section>

    <Section titre="Getting page ranges right">
      <p>
        A page that does not exist is not silently ignored: if you type 10-15 for a 12-page document, the range is
        cut back to 10-12 and a message tells you so. A range entirely outside the document is removed, again with a
        message. Spaces do not matter: 1 - 3 is read as 1-3.
      </p>
      <p>
        To do the opposite and join several files into one, use the tool to{" "}
        <Link to="/en/merge-pdf/">merge PDF files</Link>. To get a page as an image, for a slide or a message, go
        through <Link to="/en/pdf-to-jpg/">PDF to JPG</Link>.
      </p>
    </Section>

    <Section titre="Limits and privacy">
      <p>
        The document is not sent anywhere, which matters for a bank statement, a medical file or an employment
        contract. Copying pages is fast, even for several hundred pages; only the thumbnails take a little time, and
        they appear one after another.
      </p>
      <p>
        Bookmarks and the table of contents of the original are not carried over to the extracted files, and a
        certificate-based signature covers the whole document: on an extract it can no longer be verified. Send the
        complete signed document if the recipient needs to check it.
      </p>
    </Section>
  </>
);

export default SeparerPdf;
