import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
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
import { cn } from "@/lib/utils";

const FAQ: QuestionFaq[] = [
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
    r: "Non. L'outil lit votre fichier et en fabrique de nouveaux ; l'original reste tel quel sur votre appareil. Pour retirer définitivement des pages d'un document, extrayez celles que vous gardez, vérifiez le résultat, puis remplacez vous-même l'ancien fichier par le nouveau.",
  },
];

type Mode = "extraire" | "plages" | "pages";

const SeparerPdf = () => {
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
      const d = await chargerPdfLib(o, `« ${fi.name} »`);
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

  const analyse = useMemo(() => analyserPlages(texte, nbPages || 1), [texte, nbPages]);
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
        lots = [{ nom: `${base}-pages-${plagesEnTexte(p).replace(/, /g, "_")}.pdf`, pages: p }];
      } else if (mode === "plages") {
        lots = plages.map(([a, b]) => ({
          nom: a === b ? `${base}-page-${num(a)}.pdf` : `${base}-pages-${num(a)}-${num(b)}.pdf`,
          pages: pagesDe([a, b]),
        }));
      } else {
        lots = pagesUniques(plages).map((p) => ({ nom: `${base}-page-${num(p)}.pdf`, pages: [p] }));
      }
      if (lots[0].nom.length > 120) lots[0].nom = `${base}-extrait.pdf`;
      const fichiers: { nom: string; donnees: Uint8Array }[] = [];
      for (let i = 0; i < lots.length; i++) {
        setProg({ texte: "Création des fichiers", fait: i, total: lots.length });
        await respirer();
        fichiers.push({ nom: lots[i].nom, donnees: await fabriquer(lots[i].pages) });
      }
      if (fichiers.length === 1) {
        setRes({ blob: new Blob([fichiers[0].donnees], { type: "application/pdf" }), nom: fichiers[0].nom, nb: 1 });
      } else {
        setProg({ texte: "Création de l'archive ZIP", fait: lots.length, total: lots.length });
        await respirer();
        setRes({ blob: await creerZip(fichiers), nom: `${base}-separe.zip`, nb: fichiers.length });
      }
    } catch (e) {
      setErreur(`La séparation a échoué : ${(e as Error).message}`);
    } finally {
      setEnCours(false);
    }
  };

  const nbSortie =
    mode === "extraire" ? (plages.length ? 1 : 0) : mode === "plages" ? plages.length : pagesUniques(plages).length;

  return (
    <PageOutil
      href="/separer-pdf/"
      titre="Séparer les pages d'un PDF : diviser un PDF en ligne gratuit"
      description="Séparer les pages d'un PDF : extrayez les pages choisies (1-3, 5, 8-10), un fichier par plage ou un par page en ZIP. Vignettes des pages, gratuit, aucun envoi."
      motsCles="séparer pdf, séparer les pages d'un pdf, diviser un pdf en ligne, extraire des pages pdf, découper pdf"
      nomAppli="Séparation de PDF 75tools"
      h1="Séparer un PDF : extraire ou découper ses pages"
      chapeau="Ouvrez un PDF, indiquez les pages voulues ou cliquez sur leurs vignettes, puis choisissez : un seul PDF des pages choisies, un PDF par plage, ou un PDF par page. Rien n'est envoyé."
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
                setDocJs(null);
                setRes(null);
                setNbPages(0);
              }}
            >
              Changer de fichier
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <fieldset className="space-y-4" disabled={enCours}>
          <legend className="text-sm text-neutral-300 mb-2">Que voulez-vous obtenir ?</legend>
          <Segments
            nom="Mode de séparation"
            valeur={mode}
            onChange={(v) => {
              setMode(v);
              setRes(null);
            }}
            options={[
              { v: "extraire", l: "Les pages choisies en un PDF" },
              { v: "plages", l: "Un PDF par plage" },
              { v: "pages", l: "Une page par fichier" },
            ]}
          />
          <div className="max-w-xl">
            <label htmlFor="pages-separer" className="block text-sm text-neutral-300 mb-1">
              Pages
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
              placeholder={mode === "pages" ? "vide = toutes les pages" : "par exemple 1-3, 5, 8-10"}
              className={classeChamp}
              aria-describedby="aide-pages"
            />
            <span id="aide-pages" className="block text-xs text-neutral-500 mt-1">
              Virgule entre les plages ; « 8- » va jusqu'à la dernière page. Cliquez aussi sur les vignettes.
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

        {fichier && (
          <p className="text-sm text-neutral-400 tabular-nums" role="status">
            {nbSortie === 0
              ? "Indiquez au moins une page."
              : `${pagesUniques(plages).length.toLocaleString("fr-FR")} page(s) retenue(s), ${nbSortie.toLocaleString("fr-FR")} fichier${nbSortie > 1 ? "s PDF, réunis dans une archive ZIP" : " PDF"}.`}
          </p>
        )}

        <Bouton onClick={separer} disabled={!fichier || enCours || nbSortie === 0 || !!analyse.erreur}>
          {enCours ? "Séparation en cours…" : "Séparer le PDF"}
        </Bouton>

        {enCours && <Progression {...prog} />}

        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 [overflow-wrap:anywhere]">
              {res.nb > 1 ? `${res.nb} fichiers prêts dans ${res.nom}` : `Fichier prêt : ${res.nom}`} (
              {formatOctets(res.blob.size)}).
            </p>
            <Bouton onClick={() => telecharger(res.nom, res.blob)}>
              {res.nb > 1 ? "Télécharger l'archive ZIP" : "Télécharger le PDF"}
            </Bouton>
          </div>
        )}

        {fichier && nbPages > 0 && (
          <div>
            <p className="text-sm text-neutral-400 mb-2">
              Cliquez sur une page pour l'ajouter ou la retirer de la sélection
              {nbPages > 300 ? " (vignettes des 300 premières pages)" : ""}.
            </p>
            <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
              {Array.from({ length: Math.min(nbPages, 300) }, (_, i) => i + 1).map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => basculer(p)}
                    aria-pressed={choisies.has(p)}
                    aria-label={`Page ${p}`}
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

      <Section titre="Trois façons de séparer un PDF">
        <p>
          <strong>Les pages choisies en un PDF</strong> : vous obtenez un seul fichier qui ne contient que les
          pages indiquées, dans l'ordre où vous les avez écrites. C'est le mode à utiliser pour ne transmettre
          que la page de signature d'un contrat, les deux pages utiles d'un relevé, ou pour retirer d'un document
          les pages blanches et les annexes.
        </p>
        <p>
          <strong>Un PDF par plage</strong> : chaque plage séparée par une virgule devient un fichier. Avec
          « 1-4, 5-9, 10- », un dossier scanné d'un bloc redonne ses trois pièces : la pièce d'identité, les
          bulletins de salaire, l'avis d'imposition. Les fichiers sont réunis dans une archive ZIP, et leur nom
          rappelle les pages qu'ils contiennent.
        </p>
        <p>
          <strong>Une page par fichier</strong> : chaque page devient un PDF indépendant. Pratique pour un lot de
          factures scannées ensemble, ou pour un recueil de formulaires à remplir séparément. Le numéro de page
          figure dans chaque nom de fichier, complété par des zéros (page-01, page-02…) pour que l'ordre soit
          respecté dans votre explorateur de fichiers.
        </p>
      </Section>

      <Section titre="Bien noter les plages de pages">
        <p>
          Les numéros sont ceux des pages du fichier, la première étant la page 1, même si le document imprime une
          autre numérotation (une couverture non numérotée, des pages en chiffres romains). En cas de doute, fiez-vous
          aux vignettes : le numéro sous chacune est celui à écrire.
        </p>
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
          Le découpage se fait dans votre navigateur : le document n'est envoyé nulle part, ce qui compte pour un
          relevé bancaire, un dossier médical ou un contrat. La vitesse dépend de votre appareil, mais recopier
          des pages est rapide, même pour plusieurs centaines de pages ; seules les vignettes demandent un peu
          de temps, et elles s'affichent au fur et à mesure.
        </p>
        <p>
          Un PDF protégé par un mot de passe ne peut pas être découpé : ouvrez-le dans votre lecteur, enregistrez
          une copie sans protection, puis recommencez. Les signets et la table des matières de l'original ne sont
          pas repris dans les fichiers extraits, et une signature électronique à certificat ne reste pas valable
          sur un extrait : elle porte sur le document entier.
        </p>
      </Section>
    </PageOutil>
  );
};

export default SeparerPdf;
