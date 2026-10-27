import { useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument } from "pdf-lib";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { Progression, Alerte, ListeOrdonnable } from "@/components/outils/PdfOutils";
import { chargerPdfLib, nouvelId, respirer } from "@/lib/pdf-outils";
import { telecharger, nomSansExtension, formatOctets, lireOctets } from "@/lib/fichiers";

const FAQ: QuestionFaq[] = [
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
    r: "Pas directement ici : chaque fichier est ajouté en entier. Pour ne garder que certaines pages, passez d'abord le fichier dans l'outil de séparation, qui extrait les pages voulues en un nouveau PDF, puis ajoutez ce PDF réduit à la fusion. Les deux outils fonctionnent dans votre navigateur, sans envoi.",
  },
];

interface Element {
  id: string;
  fichier: File;
  octets: Uint8Array | null;
  pages: number;
  erreur: string;
}

const FusionnerPdf = () => {
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
        const d = await chargerPdfLib(o, "Ce fichier");
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
        setProg({ texte: `Ajout de « ${e.fichier.name} »`, fait: i, total: valides.length });
        await respirer();
        const src = await PDFDocument.load(e.octets!, { updateMetadata: false });
        const pages = await sortie.copyPages(src, src.getPageIndices());
        pages.forEach((p) => sortie.addPage(p));
      }
      setProg({ texte: "Enregistrement", fait: valides.length, total: valides.length });
      await respirer();
      const o = await sortie.save({ useObjectStreams: true });
      setRes({ blob: new Blob([o], { type: "application/pdf" }), pages: sortie.getPageCount() });
    } catch (e) {
      setErreur(`La fusion a échoué : ${(e as Error).message}`);
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = valides[0] ? `${nomSansExtension(valides[0].fichier.name)}-fusion.pdf` : "fusion.pdf";

  return (
    <PageOutil
      href="/fusionner-pdf/"
      titre="Fusionner PDF gratuit : assembler plusieurs PDF en un seul"
      description="Fusionner des PDF gratuitement : ajoutez vos fichiers, mettez-les dans l'ordre voulu et obtenez un seul PDF. Pages comptées, aucun envoi, sans inscription."
      motsCles="fusionner pdf, fusionner pdf gratuit, assembler des pdf en ligne, combiner plusieurs pdf en un, regrouper pdf"
      nomAppli="Fusion de PDF 75tools"
      h1="Fusionner des PDF en un seul fichier"
      chapeau="Ajoutez deux PDF ou plus, réglez leur ordre avec les flèches ou en les glissant, puis téléchargez le document assemblé. Les fichiers ne quittent pas votre appareil."
      faq={FAQ}
    >
      <div className="space-y-5">
        <DepotFichiers
          accept=".pdf,application/pdf"
          multiple
          onFichiers={ajouter}
          libelle={liste.length ? "Ajouter d'autres PDF" : "Choisir des PDF"}
          aide="ou glissez vos fichiers ici, ils s'ajoutent à la fin de la liste"
        />
        {analyse && <p role="status" className="text-sm text-neutral-400">Lecture des fichiers…</p>}

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
                      {e.pages.toLocaleString("fr-FR")} page{e.pages > 1 ? "s" : ""} · {formatOctets(e.fichier.size)}
                    </p>
                  )}
                </div>
              )}
            />
            <p className="text-sm text-neutral-400 tabular-nums" role="status">
              {valides.length.toLocaleString("fr-FR")} fichier{valides.length > 1 ? "s" : ""} à assembler,{" "}
              {total.toLocaleString("fr-FR")} page{total > 1 ? "s" : ""} au total.
              {enErreur > 0 &&
                ` ${enErreur} fichier${enErreur > 1 ? "s" : ""} illisible${enErreur > 1 ? "s" : ""} ser${enErreur > 1 ? "ont" : "a"} ignoré${enErreur > 1 ? "s" : ""} : retirez-le${enErreur > 1 ? "s" : ""} ou remplacez-le${enErreur > 1 ? "s" : ""}.`}
            </p>
          </>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}

        <div className="flex flex-wrap gap-2">
          <Bouton onClick={fusionner} disabled={valides.length < 2 || enCours || analyse}>
            {enCours ? "Fusion en cours…" : "Fusionner les PDF"}
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
              Vider la liste
            </Bouton>
          )}
        </div>
        {liste.length === 1 && !enCours && (
          <p className="text-sm text-neutral-400">Ajoutez au moins un deuxième PDF pour lancer la fusion.</p>
        )}

        {enCours && <Progression {...prog} />}

        {res && (
          <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
            <p className="text-neutral-200 tabular-nums">
              Document assemblé : {res.pages.toLocaleString("fr-FR")} pages, {formatOctets(res.blob.size)}.
            </p>
            <Bouton onClick={() => telecharger(nomSortie, res.blob)}>Télécharger le PDF fusionné</Bouton>
          </div>
        )}
      </div>

      <Section titre="Assembler des PDF en trois gestes">
        <p>
          <strong>1. Ajoutez vos fichiers.</strong> Choisissez-les en une fois (Ctrl ou Cmd + clic pour en
          sélectionner plusieurs) ou en plusieurs fois : chaque ajout se place en fin de liste. L'outil lit chaque
          PDF et affiche son nombre de pages ; un fichier protégé ou abîmé est signalé en rouge et sera ignoré.
        </p>
        <p>
          <strong>2. Réglez l'ordre.</strong> Les flèches déplacent un fichier d'un cran vers le haut ou vers le
          bas, la croix le retire. Sur ordinateur, vous pouvez aussi saisir une ligne et la déposer à sa nouvelle
          place. Le total de pages se met à jour à chaque changement.
        </p>
        <p>
          <strong>3. Fusionnez et téléchargez.</strong> Les pages sont recopiées telles quelles, sans
          recompression : le texte reste sélectionnable et la qualité des images ne change pas. Le fichier final
          pèse à peu près la somme des fichiers d'origine ; s'il est trop lourd pour un envoi, passez-le ensuite
          dans l'outil pour <Link to="/compresser-pdf/">compresser un PDF</Link>.
        </p>
      </Section>

      <Section titre="Dossiers à constituer : quelques usages courants">
        <p>
          La fusion sert surtout quand un site ou un interlocuteur demande <strong>un seul fichier</strong> alors
          que vous avez plusieurs pièces : dossier de location (pièce d'identité, trois derniers bulletins de
          salaire, avis d'imposition), demande de remboursement (formulaire et factures), candidature (lettre, CV,
          diplômes), dossier d'inscription ou de subvention.
        </p>
        <p>
          Mettez les pièces dans l'ordre où la liste vous les demande : la personne qui instruit le dossier le lit
          de haut en bas. Si une pièce n'existe qu'en photo, convertissez-la d'abord avec l'outil{" "}
          <Link to="/jpg-en-pdf/">JPG en PDF</Link>, puis ajoutez le PDF obtenu ici. Pensez enfin à donner au
          fichier final un nom parlant, par exemple « Dossier-location-Martin.pdf », plutôt que le nom proposé par
          défaut.
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
          Les fichiers restent sur votre appareil : la fusion se fait dans la mémoire de votre navigateur. Sur un
          téléphone, des centaines de pages scannées peuvent saturer cette mémoire ; dans ce cas, fusionnez par
          groupes, puis fusionnez les groupes entre eux.
        </p>
        <p>
          Un PDF signé électroniquement avec un certificat peut être ajouté, mais sa signature ne sera plus
          vérifiable dans le document fusionné : celle-ci protège le fichier d'origine tel qu'il était, pas ses
          pages recopiées ailleurs. Si le destinataire doit pouvoir contrôler cette signature, envoyez le fichier
          signé à part, à côté du document assemblé.
        </p>
      </Section>
    </PageOutil>
  );
};

export default FusionnerPdf;
