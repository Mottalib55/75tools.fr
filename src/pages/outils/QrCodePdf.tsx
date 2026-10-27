import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { analyserLienPdf, modeDropbox } from "@/lib/qr-formats";
import { cn } from "@/lib/utils";

const HREF = "/qr-code-pdf/";
const TITRE = "QR code PDF gratuit : un code qui ouvre votre document";
const DESCRIPTION =
  "QR code PDF gratuit : collez le lien de votre PDF en ligne (Google Drive, Dropbox, OneDrive ou votre site), vérifiez le partage et obtenez le code PNG ou SVG.";

const FAQ: QuestionFaq[] = [
  {
    q: "Pourquoi je ne peux pas mettre directement mon fichier PDF dans le QR code ?",
    r: "Parce qu'il n'y tient pas. D'après Denso Wave, l'inventeur du QR code, un code contient au maximum 2 953 octets de données quelconques, soit moins de 3 Ko, et déjà très dense à ce stade. Un PDF d'une page en pèse souvent des dizaines ou des centaines. Le QR code contient donc l'adresse du PDF en ligne, et c'est le téléphone qui va le chercher au moment du scan.",
  },
  {
    q: "Quand je scanne, j'arrive sur « Vous devez demander l'accès » : que faire ?",
    r: "Le fichier Google Drive est encore en accès limité : seules les personnes ajoutées une à une peuvent l'ouvrir. Dans Drive, cliquez sur Partager, puis sous « Accès général » choisissez « Tous les utilisateurs disposant du lien » avec le rôle Lecteur. Le lien ne change pas : le QR code déjà imprimé fonctionnera dès ce réglage fait. Pour OneDrive, le réglage équivalent est l'option « Tout le monde » des paramètres du lien.",
  },
  {
    q: "Je change de menu chaque saison, dois-je refaire le QR code à chaque fois ?",
    r: "Pas si l'adresse reste la même. Sur votre propre site, remplacez le fichier en gardant exactement le même nom, par exemple menu.pdf : le code imprimé ouvrira la nouvelle version. Sur un service de stockage, un nouveau fichier téléversé reçoit en général un nouveau lien ; vérifiez dans l'aide du service s'il permet de remplacer le contenu en conservant le lien, sinon il faudra un nouveau code.",
  },
  {
    q: "Mon lien Dropbox affiche une page Dropbox au lieu du PDF, c'est normal ?",
    r: "Oui, un lien de partage Dropbox ouvre d'abord une page d'aperçu. L'aide Dropbox indique deux variantes : remplacer dl=0 par dl=1 force le téléchargement du fichier, et utiliser raw=1 laisse le navigateur l'afficher directement. L'outil propose les trois versions d'un clic. Pour un menu consulté sur place, l'affichage direct est souvent le plus agréable ; testez-le sur votre téléphone.",
  },
  {
    q: "Je mets un QR code vers mon CV : n'importe qui pourra-t-il le lire ?",
    r: "Oui. Toute personne qui scanne le code, ou qui obtient le lien d'une autre façon, peut ouvrir le PDF, puisque le partage par lien ne demande pas de se connecter. N'y laissez donc que ce que vous accepteriez de voir circuler : retirez votre adresse postale ou votre date de naissance si elles ne sont pas utiles. Vous pourrez couper l'accès plus tard en désactivant le partage du fichier.",
  },
];

const SOURCES = [
  {
    editeur: "Aide Google Drive",
    titre: "Partager des fichiers et des dossiers dans Google Drive et gérer les accès",
    url: "https://support.google.com/drive/answer/2494822?hl=fr",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Aide de Dropbox",
    titre: "Comment forcer le téléchargement d'un lien Dropbox (dl=1 et raw=1)",
    url: "https://help.dropbox.com/fr-fr/share/force-download",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Support Microsoft",
    titre: "Partager des fichiers et des dossiers OneDrive",
    url: "https://support.microsoft.com/fr-fr/office/partager-des-fichiers-et-des-dossiers-onedrive-9fcc2f7d-de0c-4cec-93b0-a82024800c07",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Denso Wave (QRcode.com)",
    titre: "Standardization of QR Code (capacité maximale d'un QR code)",
    url: "https://www.qrcode.com/en/about/standards.html",
    lu: "27 octobre 2026",
  },
];

const CONSEILS: Record<string, { titre: string; etapes: string[] }> = {
  drive: {
    titre: "Lien Google Drive détecté",
    etapes: [
      "Dans Drive, sélectionnez le PDF puis cliquez sur Partager.",
      "Sous « Accès général », choisissez « Tous les utilisateurs disposant du lien » : ils pourront l'ouvrir sans compte Google.",
      "Laissez le rôle « Lecteur » : les visiteurs voient le fichier sans pouvoir le modifier.",
      "Cliquez sur « Copier le lien » et collez-le ici. Testez ensuite le QR code depuis un téléphone non connecté à votre compte.",
    ],
  },
  dropbox: {
    titre: "Lien Dropbox détecté",
    etapes: [
      "Le lien de partage ouvre d'abord une page d'aperçu Dropbox (dl=0).",
      "Choisissez ci-dessous l'affichage direct dans le navigateur (raw=1) ou le téléchargement forcé (dl=1), deux paramètres décrits par l'aide Dropbox.",
      "Scannez le résultat avec un téléphone pour vérifier ce qui s'ouvre.",
    ],
  },
  onedrive: {
    titre: "Lien OneDrive détecté",
    etapes: [
      "Sur onedrive.com, sélectionnez le PDF, puis l'icône Partager et « Copier le lien ».",
      "Ouvrez les paramètres du lien (icône d'engrenage) et choisissez « Tout le monde » pour que toute personne qui reçoit le lien puisse l'ouvrir.",
      "Désactivez « Autoriser la modification », activée par défaut d'après l'aide Microsoft, puis cliquez sur Appliquer.",
    ],
  },
  transfert: {
    titre: "Lien de service d'envoi de fichiers",
    etapes: [
      "Ces liens servent à transmettre un fichier à quelqu'un, pas à le publier durablement.",
      "Pour un QR code imprimé, déposez plutôt le PDF sur un espace de stockage (Drive, Dropbox, OneDrive) ou sur votre site.",
    ],
  },
  site: {
    titre: "Lien vers votre site",
    etapes: [
      "C'est la solution la plus durable : l'adresse ne dépend que de votre site.",
      "Pour mettre le document à jour sans changer de QR code, remplacez le fichier en gardant exactement le même nom.",
      "Vérifiez que l'adresse s'ouvre depuis un téléphone en données mobiles, hors du réseau de votre entreprise.",
    ],
  },
};

const QrCodePdf = () => {
  const [saisie, setSaisie] = useState("");
  const [modeDb, setModeDb] = useState<"" | "dl0" | "dl1" | "raw1">("");
  const a = useMemo(() => analyserLienPdf(saisie), [saisie]);
  const lienFinal = a.ok ? (a.service === "dropbox" && modeDb ? modeDropbox(a.lien, modeDb) : a.lien) : "";
  const conseil = a.ok && a.service ? CONSEILS[a.service] : null;
  const modeActuel = modeDb || (a.dropboxMode === "aucun" ? "" : a.dropboxMode);

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="qr code pdf, créer un qr code pour un pdf, qr code menu pdf, qr code google drive, qr code dropbox"
      nomAppli="Générateur de QR code vers un PDF"
      h1="Créer un QR code pour un PDF"
      chapeau="Un PDF ne tient pas dans un QR code : il faut qu'il soit en ligne, et le code contient son adresse. Collez le lien de partage de votre fichier, l'outil vérifie l'adresse, vous dit quel réglage de partage faire, puis crée le code."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div className="order-first lg:order-last lg:sticky lg:top-4">
          <QrApercu texte={lienFinal} nomFichier="qr-code-pdf" id="qr-pdf" vide="Collez le lien de votre PDF." />
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Lien du PDF">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Lien de partage du PDF</span>
            <input
              id="champ-lien-pdf"
              type="url"
              inputMode="url"
              value={saisie}
              onChange={(e) => {
                setSaisie(e.target.value);
                setModeDb("");
              }}
              placeholder="https://drive.google.com/file/d/…/view"
              className={classeChamp}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Google Drive, Dropbox, OneDrive ou l'adresse du PDF sur votre site.
            </span>
          </label>

          {a.erreur && (
            <p role="status" className="text-sm text-amber-300">
              {a.erreur}
            </p>
          )}
          {a.alertes.map((t) => (
            <p key={t} role="status" className="text-sm text-amber-300">
              {t}
            </p>
          ))}

          {a.ok && (
            <div id="analyse-pdf" className="rounded-lg border border-neutral-800 p-4 space-y-3 text-sm min-w-0">
              <p className="text-neutral-400">
                Adresse encodée :{" "}
                <span className="text-neutral-100 [overflow-wrap:anywhere]">{lienFinal}</span>
              </p>
              {conseil && (
                <>
                  <p className="text-white font-medium">{conseil.titre}</p>
                  <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
                    {conseil.etapes.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ol>
                </>
              )}
              {a.service === "dropbox" && (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Affichage du lien Dropbox">
                  {(
                    [
                      ["dl0", "Page d'aperçu (dl=0)"],
                      ["raw1", "Afficher le PDF (raw=1)"],
                      ["dl1", "Télécharger (dl=1)"],
                    ] as const
                  ).map(([m, l]) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={modeActuel === m}
                      onClick={() => setModeDb(m)}
                      className={cn(
                        "h-11 px-3 rounded-md text-sm border",
                        modeActuel === m ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              {a.service === "site" && !a.pdf && (
                <p className="text-neutral-400">
                  L'adresse ne se termine pas par .pdf : c'est peut-être une page qui présente le document, ce qui
                  convient aussi. Vérifiez simplement ce qui s'ouvre.
                </p>
              )}
              <Bouton secondaire onClick={() => window.open(lienFinal, "_blank", "noopener")}>
                Ouvrir le lien pour vérifier
              </Bouton>
            </div>
          )}
        </form>
      </div>

      <Section titre="Comment un QR code « ouvre » un PDF">
        <p>
          Un QR code ne transporte que quelques kilo-octets au mieux. Les sites qui promettent de « mettre votre PDF dans
          un QR code » font en réalité ce que fait cette page, en cachant une étape : ils hébergent votre fichier sur
          leurs serveurs et créent un code qui pointe vers leur adresse, souvent à travers une redirection qui ne
          fonctionne que tant que vous payez l'abonnement.
        </p>
        <p>
          Ici, le fichier reste chez vous ou sur votre espace de stockage, et le code contient directement son adresse.
          Il ne peut pas expirer de notre fait. En contrepartie, c'est à vous de garder le fichier en ligne, au même
          endroit, avec un partage ouvert : si vous le supprimez, le déplacez ou restreignez l'accès, le code mènera à
          une erreur.
        </p>
        <p>
          Trois conditions pour que ça marche au scan : une adresse en <strong>https://</strong>, un partage
          accessible <strong>sans connexion</strong> à un compte, et un lien <strong>sans date d'expiration</strong>.
          L'outil vérifie la première et rappelle les deux autres selon le service reconnu.
        </p>
        <p>
          Pensez aussi à la lecture sur téléphone : un PDF au format A4 s'affiche en petit sur un écran de poche. Pour un
          document consulté surtout sur mobile, une mise en page en une colonne, un texte assez gros et des images
          compressées rendent l'ouverture plus rapide et la lecture plus confortable, surtout avec une connexion
          moyenne.
        </p>
      </Section>

      <Section titre="Menu, plaquette, notice, CV : quel réglage pour quel usage">
        <p>
          <strong>Menu de restaurant.</strong> Le code se scanne à table, souvent avec une connexion moyenne : gardez un
          PDF léger (une à deux pages, images compressées) et préférez l'affichage direct à un téléchargement. Posez le
          code en grand sur un chevalet, avec l'adresse écrite en dessous, et gardez quelques menus papier pour ceux qui
          ne veulent pas scanner.
        </p>
        <p>
          <strong>Plaquette commerciale ou programme.</strong> Le code imprimé sur un flyer sera scanné pendant des mois :
          hébergez le PDF sur votre site, sous une adresse que vous ne changerez pas, et remplacez le fichier à chaque
          nouvelle édition en gardant son nom.
        </p>
        <p>
          <strong>Notice ou fiche technique.</strong> Sur un produit ou un appareil, choisissez le niveau de correction Q
          ou H dans les réglages : l'étiquette s'abîme, et ces niveaux permettent de lire un code partiellement
          effacé.
        </p>
        <p>
          <strong>CV.</strong> Un code dans un coin du CV papier peut mener à la version PDF complète ou à un
          portfolio. Pensez qu'il sera lisible par toute personne qui le scanne. Pour des coordonnées seulement, le{" "}
          <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> enregistre directement le contact, sans lien ; pour
          un simple lien vers une page, le <Link to="/generateur-qr-code/">générateur de QR code</Link> suffit.
        </p>
      </Section>
    </PageOutil>
  );
};

export default QrCodePdf;
