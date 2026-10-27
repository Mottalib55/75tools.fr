import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { analyserLienPdf, modeDropbox, type ServicePdf } from "@/lib/qr-formats";
import { type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
    {
      q: "Mon PDF pèse 15 Mo, est-ce gênant pour un QR code ?",
      r: "Pas pour le code, qui ne contient que l'adresse : il a la même taille pour un fichier de 100 Ko ou de 15 Mo. C'est l'ouverture qui en souffre. Sur une connexion mobile moyenne, à table ou dans la rue, un fichier aussi lourd met de longues secondes à s'afficher et beaucoup abandonnent. Compressez-le avant de le mettre en ligne : un menu de deux pages tient souvent sous 1 Mo.",
    },
  ],
  en: [
    {
      q: "Why can't the PDF itself be stored inside the QR code?",
      r: "Because it does not fit. Denso Wave, the company that invented the QR code, gives a maximum of 2,953 bytes of arbitrary data, under 3 KB, and a code that full is already very dense. A one-page PDF usually weighs tens or hundreds of kilobytes. So the code holds the web address of your PDF, and the phone downloads the file when someone scans it.",
    },
    {
      q: "People who scan my code see \"You need access\" on Google Drive: what is wrong?",
      r: "The file is still restricted, so only people added one by one can open it. In Drive, click Share, then under General access choose \"Anyone with the link\" and keep the Viewer role. The link itself does not change, so a code you already printed starts working as soon as you save that setting. In OneDrive, the equivalent is the \"Anyone\" option in the link settings.",
    },
    {
      q: "Can I update my restaurant menu PDF without reprinting the QR code?",
      r: "Yes, as long as the address stays the same. On your own website, upload the new file under exactly the same name, for instance menu.pdf, and the printed code opens the new version. On a cloud drive, a newly uploaded file usually gets a new link, so check whether the service lets you replace a file's content while keeping its link; otherwise you will need a new code.",
    },
    {
      q: "My Dropbox link opens a Dropbox page instead of the PDF, how do I fix it?",
      r: "That preview page is normal for a Dropbox sharing link. Dropbox Help describes two variants: changing dl=0 to dl=1 forces a download, and raw=1 lets the browser display the file directly. The tool offers all three versions in one click. For a menu read at the table, the direct display is usually the most comfortable; test it on your own phone before printing.",
    },
    {
      q: "Is a PDF behind a QR code private?",
      r: "No. Anyone who scans the code, or gets hold of the link another way, can open the PDF, because link sharing needs no sign-in. Only publish what you would accept seeing passed around: a French landlord or employer does not need your passport scan or date of birth through a public link. You can cut access later by turning off sharing for the file.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, Spécification de la symbologie de code à barres Code QR",
      url: "https://www.iso.org/fr/standard/62021.html",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Aide Google Drive",
      titre: "Partager des fichiers et des dossiers dans Google Drive et gérer les accès",
      url: "https://support.google.com/drive/answer/2494822?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Support Microsoft",
      titre: "Partager des fichiers et des dossiers dans Microsoft OneDrive",
      url: "https://support.microsoft.com/fr-fr/office/partager-des-fichiers-et-des-dossiers-onedrive-9fcc2f7d-de0c-4cec-93b0-a82024800c07",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Aide de Dropbox",
      titre: "Comment forcer le téléchargement d'un lien Dropbox",
      url: "https://help.dropbox.com/fr-fr/share/force-download",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "QR Code Standardization (capacité maximale d'un QR code)",
      url: "https://www.qrcode.com/en/about/standards.html",
      lu: "27 octobre 2026",
    },
  ],
  en: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification",
      url: "https://www.iso.org/standard/62021.html",
      lu: "27 October 2026",
    },
    {
      editeur: "Google Drive Help",
      titre: "Share and manage access to files and folders in Google Drive",
      url: "https://support.google.com/drive/answer/2494822?hl=en",
      lu: "27 October 2026",
    },
    {
      editeur: "Microsoft Support",
      titre: "Share files and folders in Microsoft OneDrive",
      url: "https://support.microsoft.com/en-gb/office/share-onedrive-files-and-folders-9fcc2f7d-de0c-4cec-93b0-a82024800c07",
      lu: "27 October 2026",
    },
    {
      editeur: "Dropbox Help",
      titre: "How to force a Dropbox link to download",
      url: "https://help.dropbox.com/en-gb/share/force-download",
      lu: "27 October 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "QR Code Standardization",
      url: "https://www.qrcode.com/en/about/standards.html",
      lu: "27 October 2026",
    },
  ],
};

type Conseils = Record<ServicePdf, { titre: string; etapes: string[] }>;

const T = {
  fr: {
    nomAppli: "Générateur de QR code vers un PDF 75tools",
    motsCles: "qr code pdf, créer un qr code pour un pdf, qr code menu pdf, qr code google drive, qr code dropbox",
    form: "Lien du PDF",
    champ: "Lien de partage du PDF",
    aide: "Google Drive, Dropbox, OneDrive ou l'adresse du PDF sur votre site.",
    encodee: "Adresse encodée :",
    pasPdf:
      "L'adresse ne se termine pas par .pdf : c'est peut-être une page qui présente le document, ce qui convient aussi. Vérifiez simplement ce qui s'ouvre.",
    ouvrir: "Ouvrir le lien pour vérifier",
    groupeDropbox: "Affichage du lien Dropbox",
    dropbox: { dl0: "Page d'aperçu (dl=0)", raw1: "Afficher le PDF (raw=1)", dl1: "Télécharger (dl=1)" },
    vide: "Collez le lien de votre PDF.",
    fichier: "qr-code-pdf",
    conseils: {
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
          "Ouvrez les paramètres du lien et choisissez « Tout le monde » pour que toute personne qui reçoit le lien puisse l'ouvrir.",
          "Désactivez « Autoriser la modification », puis appliquez.",
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
    } as Conseils,
  },
  en: {
    nomAppli: "75tools PDF QR code generator",
    motsCles: "pdf qr code, make a qr code for a pdf, menu pdf qr code, google drive qr code, dropbox qr code",
    form: "PDF link",
    champ: "PDF sharing link",
    aide: "Google Drive, Dropbox, OneDrive or the PDF's address on your website.",
    encodee: "Encoded address:",
    pasPdf:
      "The address does not end in .pdf: it may be a page that presents the document, which works too. Just check what opens.",
    ouvrir: "Open the link to check",
    groupeDropbox: "Dropbox link display",
    dropbox: { dl0: "Preview page (dl=0)", raw1: "Show the PDF (raw=1)", dl1: "Download (dl=1)" },
    vide: "Paste your PDF link.",
    fichier: "pdf-qr-code",
    conseils: {
      drive: {
        titre: "Google Drive link detected",
        etapes: [
          "In Drive, select the PDF and click Share.",
          "Under General access, choose \"Anyone with the link\": people can open it without a Google account.",
          "Keep the Viewer role so visitors can see the file but not edit it.",
          "Click \"Copy link\" and paste it here. Then test the QR code from a phone that is not signed in to your account.",
        ],
      },
      dropbox: {
        titre: "Dropbox link detected",
        etapes: [
          "A sharing link first opens a Dropbox preview page (dl=0).",
          "Choose below between direct display in the browser (raw=1) and a forced download (dl=1), two settings described by Dropbox Help.",
          "Scan the result with a phone to check what opens.",
        ],
      },
      onedrive: {
        titre: "OneDrive link detected",
        etapes: [
          "On onedrive.com, select the PDF, then the Share icon and \"Copy link\".",
          "Open the link settings and choose \"Anyone\" so that whoever gets the link can open it.",
          "Turn off \"Allow editing\", then apply.",
        ],
      },
      transfert: {
        titre: "File transfer link",
        etapes: [
          "These links are meant to hand a file to someone, not to publish it for months.",
          "For a printed QR code, put the PDF on a cloud drive (Drive, Dropbox, OneDrive) or on your website instead.",
        ],
      },
      site: {
        titre: "Link to your website",
        etapes: [
          "This is the most durable option: the address depends only on your website.",
          "To update the document without changing the QR code, replace the file and keep exactly the same file name.",
          "Check that the address opens on a phone using mobile data, outside your office network.",
        ],
      },
    } as Conseils,
  },
};

const QrCodePdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [saisie, setSaisie] = useState("");
  const [modeDb, setModeDb] = useState<"" | "dl0" | "dl1" | "raw1">("");
  const a = useMemo(() => analyserLienPdf(saisie, lang), [saisie, lang]);
  const lienFinal = a.ok ? (a.service === "dropbox" && modeDb ? modeDropbox(a.lien, modeDb) : a.lien) : "";
  const conseil = a.ok && a.service ? t.conseils[a.service] : null;
  const modeActuel = modeDb || (a.dropboxMode === "aucun" ? "" : a.dropboxMode);

  const outil = (
    <form
      className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-rows-[auto_1fr] items-start"
      onSubmit={(e) => e.preventDefault()}
      aria-label={t.form}
    >
      <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-1">
        <label className="block min-w-0">
          <span className="block text-sm text-neutral-300 mb-1">{t.champ}</span>
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
          <span className="block text-xs text-neutral-500 mt-1">{t.aide}</span>
        </label>
        {a.erreur && (
          <p role="status" className="text-sm text-amber-300">
            {a.erreur}
          </p>
        )}
        {a.alertes.map((x) => (
          <p key={x} role="status" className="text-sm text-amber-300">
            {x}
          </p>
        ))}
      </div>

      <div data-resultat className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
        <QrApercu texte={lienFinal} nomFichier={t.fichier} id="qr-pdf" vide={t.vide} />
      </div>

      <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-2">
        {a.ok && (
          <div id="analyse-pdf" className="rounded-lg border border-neutral-800 p-4 space-y-3 text-sm min-w-0">
            <p className="text-neutral-400">
              {t.encodee} <span className="text-neutral-100 [overflow-wrap:anywhere]">{lienFinal}</span>
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
              <div className="flex flex-wrap gap-2" role="group" aria-label={t.groupeDropbox}>
                {(["dl0", "raw1", "dl1"] as const).map((m) => (
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
                    {t.dropbox[m]}
                  </button>
                ))}
              </div>
            )}
            {a.service === "site" && !a.pdf && <p className="text-neutral-400">{t.pasPdf}</p>}
            <Bouton secondaire onClick={() => window.open(lienFinal, "_blank", "noopener")}>
              {t.ouvrir}
            </Bouton>
          </div>
        )}
      </div>
    </form>
  );

  return (
    <PageOutil
      id="qr-code-pdf"
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
    <Section titre="Créer un QR code pour un PDF : la méthode qui ne dépend de personne">
      <p>
        Pour créer un QR code pour un PDF, il faut d'abord que le PDF soit en ligne : déposez-le sur Google Drive,
        Dropbox, OneDrive ou votre site, copiez son lien de partage et collez-le dans le champ ci-dessus. L'outil
        reconnaît le service, rappelle le réglage de partage à faire (« Tous les utilisateurs disposant du lien » sur
        Drive, par exemple) et dessine le code, prêt en PNG ou en SVG. Un lien Drive typique de 82 caractères donne un
        code de 37 × 37 modules au niveau M, qui reste net imprimé sur 3 cm. Le fichier lui-même ne passe jamais par
        75tools. La limite tient à cette architecture : le code contient une adresse, pas le document. Si vous supprimez
        le fichier, le déplacez ou restreignez son partage, tous les codes imprimés mèneront à une erreur.
      </p>
    </Section>

    <Section titre="Comment un QR code « ouvre » un PDF">
      <p>
        Un QR code ne transporte que quelques kilo-octets au mieux : la norme ISO/IEC 18004 fixe la taille maximale du
        symbole à 177 modules de côté. Les sites qui promettent de « mettre votre PDF dans un QR code » font en réalité
        ce que fait cette page, en cachant une étape : ils hébergent votre fichier sur leurs serveurs et créent un code
        qui pointe vers leur adresse, souvent à travers une redirection qui ne fonctionne que tant que vous payez.
      </p>
      <p>
        Ici, le fichier reste chez vous ou sur votre espace de stockage, et le code contient directement son adresse. Il
        ne peut pas expirer de notre fait. Trois conditions pour que ça marche au scan : une adresse en{" "}
        <strong>https://</strong>, un partage accessible <strong>sans connexion</strong> à un compte, et un lien{" "}
        <strong>sans date d'expiration</strong>. L'outil vérifie la première et rappelle les deux autres selon le
        service reconnu.
      </p>
      <p>
        Pensez aussi à la lecture sur téléphone : un PDF au format A4 s'affiche en petit sur un écran de poche. Une mise
        en page en une colonne, un texte assez gros et un fichier léger rendent l'ouverture plus rapide. Si le vôtre est
        lourd, passez-le d'abord dans l'outil pour <Link to="/compresser-pdf/">compresser un PDF</Link>.
      </p>
    </Section>

    <Section titre="Menu, plaquette, notice, CV : quel réglage pour quel usage">
      <p>
        <strong>Menu de restaurant.</strong> Le code se scanne à table, souvent avec une connexion moyenne : gardez un
        PDF d'une à deux pages et préférez l'affichage direct à un téléchargement. Posez le code en grand sur un
        chevalet, avec l'adresse écrite en dessous, et gardez quelques menus papier pour ceux qui ne veulent pas
        scanner.
      </p>
      <p>
        <strong>Plaquette commerciale ou programme.</strong> Le code imprimé sur un flyer sera scanné pendant des mois :
        hébergez le PDF sur votre site, sous une adresse que vous ne changerez pas, et remplacez le fichier à chaque
        nouvelle édition en gardant son nom.
      </p>
      <p>
        <strong>Notice ou fiche technique.</strong> Sur un produit ou un appareil, choisissez le niveau de correction Q
        ou H dans les réglages : l'étiquette s'abîme, et ces niveaux permettent de lire un code partiellement effacé.
      </p>
      <p>
        <strong>CV.</strong> Un code dans un coin du CV papier peut mener à la version complète ou à un portfolio.
        Pensez qu'il sera lisible par toute personne qui le scanne. Pour un simple lien vers une page web, le{" "}
        <Link to="/generateur-qr-code/">générateur de QR code</Link> suffit.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Create a QR code for a PDF without a paid hosting service">
      <p>
        To create a QR code for a PDF, the PDF first has to be online: upload it to Google Drive, Dropbox, OneDrive or
        your website, copy its sharing link and paste it into the box above. The tool recognises the service, reminds
        you of the sharing setting to change ("Anyone with the link" on Drive, for instance) and draws the code, ready
        as a PNG or an SVG. A typical 82-character Drive link gives a code of 37 × 37 modules at level M, still crisp
        when printed 3 cm wide. The file itself never goes through 75tools. The limit comes from that design: the code
        stores an address, not the document. Delete the file, move it or restrict its sharing, and every printed code
        leads to an error page.
      </p>
    </Section>

    <Section titre="Why a QR code points to a PDF rather than containing it">
      <p>
        A QR code carries a few kilobytes at most: the ISO/IEC 18004 standard caps the symbol at 177 modules per side.
        Sites that promise to "put your PDF in a QR code" do what this page does with one step hidden: they host your
        file on their servers and give you a code pointing at their address, often through a redirect that only keeps
        working while you pay the subscription.
      </p>
      <p>
        Here the file stays on your own storage and the code holds its direct address, so nothing on our side can make
        it expire. For a scan to work you need three things: an <strong>https://</strong> address, sharing that works{" "}
        <strong>without signing in</strong>, and a link <strong>with no expiry date</strong>. WeTransfer-style links fail
        the third test, and the tool warns you about them.
      </p>
      <p>
        Think about reading on a phone too. An A4 page shrinks to a small screen, and a heavy file crawls on 4G at a
        market stall. Run a large file through the <Link to="/en/compress-pdf/">PDF compressor</Link> before you upload
        it.
      </p>
    </Section>

    <Section titre="Menus, brochures, manuals and CVs in France">
      <p>
        <strong>Restaurant or café menu.</strong> Many French restaurants keep a QR code on the table
        next to the paper menu. Keep the PDF to one or two pages, prefer direct display to a download, print the address
        under the code and keep a few paper menus for guests who would rather not scan.
      </p>
      <p>
        <strong>Brochure or event programme.</strong> A flyer gets scanned for months, so host the PDF on your own site
        under an address you will not change, and replace the file with each new edition under the same name.
      </p>
      <p>
        <strong>Manual or data sheet.</strong> On a product or a machine, choose error correction level Q or H in the
        settings: labels get scratched, and those levels still scan with part of the code worn away.
      </p>
      <p>
        <strong>CV for a French employer.</strong> A small code in a corner of a printed CV can open a portfolio or an
        English version. Anyone holding the paper can open it, so leave out personal details you would not post online.
        For a plain web page, the <Link to="/en/qr-code-generator/">free QR code generator</Link> is enough.
      </p>
    </Section>
  </>
);

export default QrCodePdf;
