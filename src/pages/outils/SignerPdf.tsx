import { KeyboardEvent, PointerEvent as PE, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, PDFFont, StandardFonts, degrees, rgb } from "pdf-lib";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { Alerte, Segments, ChoixListe } from "@/components/outils/PdfOutils";
import { chargerPdfLib, messagePdfJs } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { telecharger, nomSansExtension, formatOctets, lireOctets, chargerImage } from "@/lib/fichiers";
import { locale, useLangue, type Langue } from "@/lib/langue";

type DocJs = Awaited<ReturnType<typeof ouvrirPdf>>;

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Une signature ajoutée avec cet outil a-t-elle une valeur juridique ?",
      r: "C'est une signature électronique dite simple : une image de votre signature posée sur le document. Le règlement européen eIDAS interdit de lui refuser tout effet au seul motif qu'elle est électronique, mais elle ne prouve ni votre identité ni l'absence de modification ultérieure. En cas de contestation, c'est à celui qui s'en prévaut d'en démontrer la fiabilité devant le juge.",
    },
    {
      q: "Pour quels documents une signature dessinée suffit-elle ?",
      r: "Elle convient quand le risque de contestation est faible et que l'interlocuteur l'accepte : bon pour accord sur un devis, autorisation parentale de sortie, attestation demandée par un proche, bon de commande courant, retour d'un formulaire signé. Si votre interlocuteur exige une signature électronique avec certificat, ou si un texte impose un niveau de signature, cet outil ne convient pas.",
    },
    {
      q: "Quand faut-il passer par un prestataire de signature électronique qualifiée ?",
      r: "Quand l'enjeu justifie une preuve solide : contrat important, vente immobilière, prêt, engagement financier, réponse à un marché public, ou dès qu'un texte ou votre interlocuteur impose un niveau de signature. Seule la signature qualifiée a l'effet juridique d'une signature manuscrite et bénéficie, en France, d'une présomption de fiabilité. Les prestataires qualifiés figurent sur la liste de confiance publiée par l'ANSSI.",
    },
    {
      q: "Comment obtenir un fond transparent pour la signature importée ?",
      r: "Signez à l'encre noire sur une feuille blanche, photographiez-la bien éclairée et à plat, puis importez la photo en laissant cochée l'option qui rend le fond blanc transparent : les pixels clairs sont effacés et la signature se pose sans rectangle blanc sur les lignes du document. Un PNG déjà transparent est utilisé tel quel. Recadrez au plus près si une ombre persiste.",
    },
    {
      q: "Mon PDF portait déjà une signature électronique, puis-je y ajouter la mienne ici ?",
      r: "C'est déconseillé. Une signature électronique avancée ou qualifiée scelle le document : toute modification ultérieure, y compris l'ajout d'une image, est détectée et les lecteurs PDF signalent alors la signature comme invalide. L'outil vous prévient s'il repère une signature de ce type. Signez plutôt avec le service qui a fait signer la première personne.",
    },
    {
      q: "Faut-il écrire « Lu et approuvé » avant de signer ?",
      r: "La loi ne l'impose pas pour la plupart des documents : la mention est une habitude, et la signature seule exprime le consentement. Certains interlocuteurs la demandent pourtant, comme un bailleur, une école ou un client avec « Bon pour accord » sur un devis. Cochez alors la case mention : le texte est modifiable et se place au-dessus de la signature, en caractères tapés.",
    },
  ],
  en: [
    {
      q: "Is a signature added with this tool legally valid in France?",
      r: "It is what EU law calls a simple electronic signature: an image of your signature placed on the document. Under the eIDAS regulation it cannot be rejected as evidence just because it is electronic, but it proves neither who you are nor that the file was not changed afterwards. If it is disputed, the person relying on it has to convince a French judge it is reliable.",
    },
    {
      q: "What does « Lu et approuvé » mean, and do I need it?",
      r: "It means \"read and approved\". French landlords, schools and employers often ask for it above the signature, and quotes often carry « Bon pour accord » (agreed). The law does not require it for most documents: your signature alone shows consent. If someone asks for it, tick the mention box; the text stays in French because that is what the French recipient expects.",
    },
    {
      q: "Which documents is a drawn signature enough for?",
      r: "It works when the risk of a dispute is low and the other side accepts it: approving a quote, a school trip consent form, a statement for a relative, a routine order form, returning a signed form to your letting agency. If the recipient requires a certificate-based signature, or a rule sets a signature level, use a trust service provider instead of this tool.",
    },
    {
      q: "When do I need a qualified electronic signature provider?",
      r: "When the stakes call for solid proof: a major contract, a property sale, a loan, a guarantee, a public tender, or whenever a rule or the other party sets a signature level. Only a qualified signature has the legal effect of a handwritten one and enjoys, in France, a presumption of reliability. Qualified providers appear on the trusted list published by ANSSI, the French cybersecurity agency.",
    },
    {
      q: "How do I get a transparent background for an imported signature?",
      r: "Sign in black ink on white paper, take a flat, well-lit photo and import it with the option that makes the white background transparent left ticked: light pixels are removed and the signature sits on the document lines without a white box. A PNG that is already transparent is used as it is. Crop the photo tightly if a shadow remains.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Légifrance", titre: "Code civil, article 1367 (signature, signature électronique)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032042456", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Décret n° 2017-1416 du 28 septembre 2017 relatif à la signature électronique", url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035676246", lu: "27 octobre 2026" },
    { editeur: "EUR-Lex", titre: "Règlement (UE) n° 910/2014 dit eIDAS, articles 3, 25 et 26", url: "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32014R0910", lu: "27 octobre 2026" },
    { editeur: "ANSSI (cyber.gouv.fr)", titre: "Guide de sélection du niveau des signatures et des cachets électroniques", url: "https://cyber.gouv.fr/reglementation/reglementation-identite-confiance-numerique/securite-echanges-voie-electronique/reglement-eidas/selection-niveau-signatures-cachets-%C3%A9lectroniques/", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "La signature scannée n'est pas une preuve suffisante du consentement à une obligation", url: "https://entreprendre.service-public.gouv.fr/actualites/A17339", lu: "27 octobre 2026" },
    { editeur: "Ministère de l'Économie, Direction des affaires juridiques", titre: "Lettre de la DAJ : valeur juridique de la signature manuscrite scannée", url: "https://www.economie.gouv.fr/daj/lettre-de-la-daj-valeur-juridique-de-la-signature-manuscrite-scannee", lu: "27 octobre 2026" },
    { editeur: "France Num", titre: "La signature électronique : un outil devenu incontournable", url: "https://www.francenum.gouv.fr/guides-et-conseils/pilotage-de-lentreprise/dematerialisation-des-documents/la-signature", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Légifrance", titre: "Code civil, article 1367 (French Civil Code, signature and electronic signature)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032042456", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Décret n° 2017-1416 du 28 septembre 2017 relatif à la signature électronique (decree on electronic signatures)", url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035676246", lu: "27 October 2026" },
    { editeur: "EUR-Lex", titre: "Regulation (EU) No 910/2014 (eIDAS), Articles 3, 25 and 26", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014R0910", lu: "27 October 2026" },
    { editeur: "ANSSI (cyber.gouv.fr)", titre: "Guide de sélection du niveau des signatures et des cachets électroniques (choosing the level of electronic signatures and seals)", url: "https://cyber.gouv.fr/reglementation/reglementation-identite-confiance-numerique/securite-echanges-voie-electronique/reglement-eidas/selection-niveau-signatures-cachets-%C3%A9lectroniques/", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "La signature scannée n'est pas une preuve suffisante du consentement à une obligation (a scanned signature is not sufficient proof of consent)", url: "https://entreprendre.service-public.gouv.fr/actualites/A17339", lu: "27 October 2026" },
    { editeur: "Ministère de l'Économie, Direction des affaires juridiques", titre: "Lettre de la DAJ : valeur juridique de la signature manuscrite scannée (legal value of a scanned handwritten signature)", url: "https://www.economie.gouv.fr/daj/lettre-de-la-daj-valeur-juridique-de-la-signature-manuscrite-scannee", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Signature de PDF 75tools",
    motsCles: "ajouter une signature sur un pdf, signer un pdf en ligne gratuit, signature électronique pdf gratuite, signer pdf, signature pdf",
    choisirPdf: "Choisir le PDF à signer",
    nomCite: (n: string) => `« ${n} »`,
    lePdf: "Le PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Changer de fichier",
    dejaSigne:
      "Ce PDF semble déjà porter une signature électronique à certificat. Y ajouter une image modifie le fichier : les lecteurs PDF signaleront alors cette signature existante comme invalide.",
    etape1: "1. Votre signature",
    origine: "Origine de la signature",
    dessiner: "Dessiner",
    importer: "Importer une image",
    autreImage: "Choisir une autre image",
    uneImage: "Choisir une image",
    aideImage: "PNG à fond transparent conseillé, ou photo d'une signature sur papier blanc",
    fondTransparent: "Rendre le fond blanc transparent (pour une photo de signature sur papier)",
    sigImportee: "Signature importée",
    imageVide: "L'image importée semble vide après suppression du fond : décochez l'option de fond transparent.",
    imageIllisible: "Image illisible : utilisez un PNG ou un JPG.",
    etape2: "2. Placement et mentions",
    pageASigner: "Page à signer",
    pageN: (n: number) => `Page ${n}`,
    derniere: " (dernière)",
    taille: (n: number) => `Taille de la signature : ${n} % de la largeur de la page`,
    mention: "Mention au-dessus de la signature",
    texteMention: "Texte de la mention",
    mentionDefaut: "Lu et approuvé",
    aideMention: "",
    date: "Date sous la signature",
    texteDate: "Texte de la date",
    toutes: "Apposer aussi sur toutes les autres pages, au même endroit (paraphe de chaque page)",
    apercuImpossible: (m: string) => `Aperçu impossible : ${m}`,
    consigne: (n: number) => `Page ${n} : faites glisser la signature, ou touchez la page pour l'y amener.`,
    apercuAlt: (n: number) => `Aperçu de la page ${n}`,
    sigAria: "Signature : glissez-la ou déplacez-la avec les flèches du clavier",
    precedente: "Page précédente",
    suivante: "Page suivante",
    preparation: "Préparation de l'aperçu…",
    apercuIci: "L'aperçu de la page apparaîtra ici.",
    enCours: "Signature en cours…",
    signer: "Signer et préparer le PDF",
    attente: "Ouvrez un PDF, dessinez ou importez votre signature, placez-la sur l'aperçu : le PDF signé sera prêt ici.",
    dabord: "Dessinez ou importez d'abord votre signature.",
    echec: (m: string) => `La signature n'a pas pu être ajoutée : ${m}`,
    pret: (t: string) => `PDF signé prêt (${t}).`,
    telecharger: "Télécharger le PDF signé",
    suffixe: "signe",
    defautNom: "document",
    datePrefixe: "Le",
    // Pad
    zone: "Zone de signature : dessinez avec la souris, un stylet ou le doigt",
    signezIci: "Signez ici",
    epaisseur: "Épaisseur",
    epaisseurTrait: "Épaisseur du trait",
    fin: "Fin",
    moyen: "Moyen",
    epais: "Épais",
    encre: "Encre",
    couleurEncre: "Couleur de l'encre",
    noir: "Noir",
    bleu: "Bleu foncé",
    effacer: "Effacer",
    aideTrait: "L'épaisseur et la couleur s'appliquent aux traits suivants.",
  },
  en: {
    nomAppli: "75tools PDF signer",
    motsCles: "sign pdf, sign pdf online free, add signature to pdf, electronic signature pdf free, sign a pdf in france",
    choisirPdf: "Choose the PDF to sign",
    nomCite: (n: string) => `"${n}"`,
    lePdf: "The PDF",
    page: (n: number) => `page${n > 1 ? "s" : ""}`,
    changer: "Change file",
    dejaSigne:
      "This PDF seems to carry a certificate-based electronic signature already. Adding an image changes the file, so PDF readers will then flag that existing signature as invalid.",
    etape1: "1. Your signature",
    origine: "Signature source",
    dessiner: "Draw",
    importer: "Import an image",
    autreImage: "Choose another image",
    uneImage: "Choose an image",
    aideImage: "A PNG with a transparent background works best, or a photo of a signature on white paper",
    fondTransparent: "Make the white background transparent (for a photo of a signature on paper)",
    sigImportee: "Imported signature",
    imageVide: "The imported image looks empty once the background is removed: untick the transparent background option.",
    imageIllisible: "Unreadable image: use a PNG or a JPG.",
    etape2: "2. Position and wording",
    pageASigner: "Page to sign",
    pageN: (n: number) => `Page ${n}`,
    derniere: " (last)",
    taille: (n: number) => `Signature size: ${n}% of the page width`,
    mention: "Wording above the signature",
    texteMention: "Wording text",
    mentionDefaut: "Lu et approuvé",
    aideMention: "French for \"read and approved\", the wording French recipients expect. Edit it freely, e.g. « Bon pour accord » on a quote.",
    date: "Date below the signature",
    texteDate: "Date text",
    toutes: "Also place it on every other page, in the same spot (initialling each page)",
    apercuImpossible: (m: string) => `Preview failed: ${m}`,
    consigne: (n: number) => `Page ${n}: drag the signature, or tap the page to move it there.`,
    apercuAlt: (n: number) => `Preview of page ${n}`,
    sigAria: "Signature: drag it or move it with the arrow keys",
    precedente: "Previous page",
    suivante: "Next page",
    preparation: "Preparing the preview…",
    apercuIci: "The page preview will appear here.",
    enCours: "Signing…",
    signer: "Sign and prepare the PDF",
    attente: "Open a PDF, draw or import your signature and place it on the preview: the signed PDF will be ready here.",
    dabord: "Draw or import your signature first.",
    echec: (m: string) => `The signature could not be added: ${m}`,
    pret: (t: string) => `Signed PDF ready (${t}).`,
    telecharger: "Download the signed PDF",
    suffixe: "signed",
    defautNom: "document",
    datePrefixe: "Le",
    // Pad
    zone: "Signature pad: draw with a mouse, a stylus or your finger",
    signezIci: "Sign here",
    epaisseur: "Thickness",
    epaisseurTrait: "Line thickness",
    fin: "Thin",
    moyen: "Medium",
    epais: "Thick",
    encre: "Ink",
    couleurEncre: "Ink colour",
    noir: "Black",
    bleu: "Dark blue",
    effacer: "Clear",
    aideTrait: "Thickness and colour apply to the strokes that follow.",
  },
};

interface Signature {
  url: string;
  l: number;
  h: number;
}

/** Recadre une signature au plus près de son tracé (pixels non transparents) et la renvoie en PNG. */
function recadrer(c: HTMLCanvasElement): Signature | null {
  const ctx = c.getContext("2d")!;
  const { width: w, height: h } = c;
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w,
    y0 = h,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (d[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return null;
  const m = 6;
  x0 = Math.max(0, x0 - m);
  y0 = Math.max(0, y0 - m);
  x1 = Math.min(w - 1, x1 + m);
  y1 = Math.min(h - 1, y1 + m);
  const o = document.createElement("canvas");
  o.width = x1 - x0 + 1;
  o.height = y1 - y0 + 1;
  o.getContext("2d")!.drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  return { url: o.toDataURL("image/png"), l: o.width, h: o.height };
}

const NOIR = "#111111";
const BLEU = "#1e3a8a";

/** Zone de dessin de la signature (souris, stylet ou doigt). */
const Pad = ({ onSignature }: { onSignature: (s: Signature | null) => void }) => {
  const t = T[useLangue()];
  const ref = useRef<HTMLCanvasElement>(null);
  const [epaisseur, setEpaisseur] = useState("6");
  const [encre, setEncre] = useState(NOIR);
  const [vide, setVide] = useState(true);
  const trace = useRef<{ x: number; y: number }[] | null>(null);

  const point = (e: PE<HTMLCanvasElement>) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };
  const debut = (e: PE<HTMLCanvasElement>) => {
    e.preventDefault();
    ref.current!.setPointerCapture(e.pointerId);
    const p = point(e);
    trace.current = [p];
    const ctx = ref.current!.getContext("2d")!;
    ctx.fillStyle = encre;
    ctx.beginPath();
    ctx.arc(p.x, p.y, parseFloat(epaisseur) / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  const bouge = (e: PE<HTMLCanvasElement>) => {
    const tr = trace.current;
    if (!tr) return;
    const p = point(e);
    tr.push(p);
    const ctx = ref.current!.getContext("2d")!;
    ctx.strokeStyle = encre;
    ctx.lineWidth = parseFloat(epaisseur);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const n = tr.length;
    if (n < 3) {
      ctx.beginPath();
      ctx.moveTo(tr[0].x, tr[0].y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      return;
    }
    // Courbe lissée entre les milieux des segments successifs.
    const a = tr[n - 3],
      b = tr[n - 2];
    ctx.beginPath();
    ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
    ctx.quadraticCurveTo(b.x, b.y, (b.x + p.x) / 2, (b.y + p.y) / 2);
    ctx.stroke();
  };
  const fin = () => {
    if (!trace.current) return;
    trace.current = null;
    setVide(false);
    onSignature(recadrer(ref.current!));
  };
  const effacer = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setVide(true);
    onSignature(null);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg bg-white">
        <canvas
          ref={ref}
          width={1200}
          height={400}
          aria-label={t.zone}
          className="block w-full h-auto rounded-lg cursor-crosshair touch-none"
          onPointerDown={debut}
          onPointerMove={bouge}
          onPointerUp={fin}
          onPointerCancel={fin}
        />
        {vide && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-neutral-400 text-sm">{t.signezIci}</span>
        )}
        <span className="pointer-events-none absolute left-[6%] right-[6%] bottom-[22%] border-b border-neutral-300" />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-sm text-neutral-300 mb-1">{t.epaisseur}</p>
          <Segments
            nom={t.epaisseurTrait}
            valeur={epaisseur}
            onChange={setEpaisseur}
            options={[
              { v: "4", l: t.fin },
              { v: "6", l: t.moyen },
              { v: "10", l: t.epais },
            ]}
          />
        </div>
        <div>
          <p className="text-sm text-neutral-300 mb-1">{t.encre}</p>
          <Segments
            nom={t.couleurEncre}
            valeur={encre}
            onChange={setEncre}
            options={[
              { v: NOIR, l: t.noir },
              { v: BLEU, l: t.bleu },
            ]}
          />
        </div>
        <Bouton secondaire onClick={effacer}>
          {t.effacer}
        </Bouton>
      </div>
      <p className="text-xs text-neutral-500">{t.aideTrait}</p>
    </div>
  );
};

/** Retire les caractères que la police standard Helvetica (WinAnsi) ne sait pas écrire. */
function nettoyer(texte: string, police: PDFFont): string {
  let s = "";
  for (const ch of texte.replace(/[   ]/g, " ")) {
    try {
      police.encodeText(ch);
      s += ch;
    } catch {
      /* caractère non encodable : retiré */
    }
  }
  return s;
}

const TAILLE_TEXTE = 11; // points
const LH = 1.3; // interligne

/** Géométrie du groupe (mention, signature, date) en points, dans le repère de la page affichée. */
function geometrie(W: number, H: number, pos: { x: number; y: number }, largeur: number, sig: Signature, mention: boolean, date: boolean) {
  const sw = largeur * W;
  const sh = (sw * sig.h) / sig.l;
  const lh = TAILLE_TEXTE * LH;
  const left = pos.x * W;
  const top = pos.y * H;
  const imgTop = top + (mention ? lh : 0);
  const base = (ligneHaut: number) => ligneHaut + lh / 2 + 0.3465 * TAILLE_TEXTE;
  return {
    sw,
    sh,
    left,
    top,
    imgTop,
    hauteur: sh + lh * ((mention ? 1 : 0) + (date ? 1 : 0)),
    baseMention: base(top),
    baseDate: base(imgTop + sh),
  };
}

const SignerPdf = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [fichier, setFichier] = useState<File | null>(null);
  const [octets, setOctets] = useState<Uint8Array | null>(null);
  const [doc, setDoc] = useState<DocJs | null>(null);
  const [nbPages, setNbPages] = useState(0);
  const [pageNo, setPageNo] = useState(1);
  const [apercu, setApercu] = useState<{ url: string; W: number; H: number } | null>(null);
  const [dejaSigne, setDejaSigne] = useState(false);
  const [source, setSource] = useState<"dessiner" | "importer">("dessiner");
  const [sigDessin, setSigDessin] = useState<Signature | null>(null);
  const [sigImport, setSigImport] = useState<Signature | null>(null);
  const [fichierImport, setFichierImport] = useState<File | null>(null);
  const [fondTransparent, setFondTransparent] = useState(true);
  const [pos, setPos] = useState({ x: 0.55, y: 0.75 });
  const [largeur, setLargeur] = useState(25);
  const [mention, setMention] = useState(false);
  const [texteMention, setTexteMention] = useState(t.mentionDefaut);
  const [date, setDate] = useState(true);
  const [texteDate, setTexteDate] = useState("");
  const [toutes, setToutes] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [res, setRes] = useState<Blob | null>(null);
  const [cw, setCw] = useState(0);
  const conteneur = useRef<HTMLDivElement>(null);
  const glisse = useRef<{ x0: number; y0: number; px: number; py: number } | null>(null);

  const sig = source === "dessiner" ? sigDessin : sigImport;

  // La date posée sur le document suit l'usage français (« Le 27/10/2026 »), dans les deux langues.
  useEffect(() => {
    setTexteDate(`${t.datePrefixe} ${new Date().toLocaleDateString("fr-FR")}`);
  }, [t.datePrefixe]);

  useEffect(() => () => void doc?.destroy(), [doc]);

  // Aperçu de la page choisie.
  useEffect(() => {
    if (!doc) return;
    let annule = false;
    (async () => {
      try {
        const page = await doc.getPage(pageNo);
        const vue = page.getViewport({ scale: 1 });
        const c = await rendrePage(doc, pageNo, Math.min(2.5, 1100 / vue.width));
        const url = c.toDataURL("image/jpeg", 0.85);
        c.width = c.height = 0;
        if (!annule) setApercu({ url, W: vue.width, H: vue.height });
      } catch (e) {
        if (!annule) setErreur(t.apercuImpossible((e as Error).message));
      }
    })();
    return () => {
      annule = true;
    };
  }, [doc, pageNo, t]);

  useLayoutEffect(() => {
    const el = conteneur.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, [apercu !== null]);

  // Image importée : fond blanc rendu transparent si demandé, puis recadrage.
  useEffect(() => {
    if (!fichierImport) return;
    let annule = false;
    (async () => {
      try {
        const img = await chargerImage(fichierImport);
        const k = Math.min(1, 1500 / img.naturalWidth);
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k);
        c.height = Math.round(img.naturalHeight * k);
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        if (fondTransparent) {
          const d = ctx.getImageData(0, 0, c.width, c.height);
          const p = d.data;
          for (let i = 0; i < p.length; i += 4) {
            const l = Math.min(p[i], p[i + 1], p[i + 2]);
            // Au-dessus de 215 : fond effacé ; entre 160 et 215 : transition douce.
            if (l > 215) p[i + 3] = 0;
            else if (l > 160) p[i + 3] = Math.round((p[i + 3] * (215 - l)) / 55);
          }
          ctx.putImageData(d, 0, 0);
        }
        const s = recadrer(c);
        if (!annule) {
          setSigImport(s);
          if (!s) setErreur(t.imageVide);
        }
      } catch {
        if (!annule) setErreur(t.imageIllisible);
      }
    })();
    return () => {
      annule = true;
    };
  }, [fichierImport, fondTransparent, t]);

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setErreur("");
    setRes(null);
    setFichier(null);
    setDoc(null);
    setApercu(null);
    try {
      const o = await lireOctets(fi);
      await chargerPdfLib(o, t.nomCite(fi.name), lang);
      let d: DocJs;
      try {
        d = await ouvrirPdf(o.slice());
      } catch (e) {
        throw new Error(messagePdfJs(e, t.nomCite(fi.name), lang));
      }
      setDejaSigne(new TextDecoder("latin1").decode(o).includes("/ByteRange"));
      setOctets(o);
      setNbPages(d.numPages);
      setPageNo(d.numPages);
      setDoc(d);
      setFichier(fi);
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

  const g = apercu && sig ? geometrie(apercu.W, apercu.H, pos, largeur / 100, sig, mention, date) : null;
  const k = apercu && cw ? cw / apercu.W : 0; // pixels écran par point

  const borner = (x: number, y: number) => {
    if (!apercu || !g) return { x, y };
    return {
      x: Math.min(Math.max(0, x), Math.max(0, 1 - g.sw / apercu.W)),
      y: Math.min(Math.max(0, y), Math.max(0, 1 - g.hauteur / apercu.H)),
    };
  };

  // La largeur change : on garde le groupe dans la page.
  useEffect(() => {
    if (g) setPos((p) => borner(p.x, p.y));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largeur, mention, date, sig?.url, apercu?.W]);

  const surPage = (e: PE<HTMLDivElement>) => {
    if (!apercu || !g || e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    setPos(borner(fx - g.sw / apercu.W / 2, fy - g.hauteur / apercu.H / 2));
    setRes(null);
  };
  const saisir = (e: PE<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    glisse.current = { x0: e.clientX, y0: e.clientY, px: pos.x, py: pos.y };
  };
  const deplacer = (e: PE<HTMLDivElement>) => {
    const s = glisse.current;
    if (!s || !conteneur.current) return;
    const r = conteneur.current.getBoundingClientRect();
    setPos(borner(s.px + (e.clientX - s.x0) / r.width, s.py + (e.clientY - s.y0) / r.height));
    setRes(null);
  };
  const lacher = () => (glisse.current = null);
  const clavier = (e: KeyboardEvent<HTMLDivElement>) => {
    const pas = e.shiftKey ? 0.05 : 0.01;
    const d = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }[e.key];
    if (!d) return;
    e.preventDefault();
    setPos((p) => borner(p.x + d[0], p.y + d[1]));
    setRes(null);
  };

  const signer = async () => {
    if (!octets || !doc || !sig) return;
    setEnCours(true);
    setErreur("");
    setRes(null);
    try {
      const pdf: PDFDocument = await chargerPdfLib(octets, t.lePdf, lang);
      const image = await pdf.embedPng(sig.url);
      const police = await pdf.embedFont(StandardFonts.Helvetica);
      const lignes = {
        mention: mention ? nettoyer(texteMention.trim(), police) : "",
        date: date ? nettoyer(texteDate.trim(), police) : "",
      };
      const cibles = toutes ? Array.from({ length: nbPages }, (_, i) => i + 1) : [pageNo];
      for (const n of cibles) {
        const vue = (await doc.getPage(n)).getViewport({ scale: 1 });
        const gg = geometrie(vue.width, vue.height, pos, largeur / 100, sig, mention, date);
        const page = pdf.getPage(n - 1);
        // Passage du repère affiché (pdf.js, y vers le bas) au repère PDF, rotation de page comprise.
        const versPdf = (x: number, y: number) => vue.convertToPdfPoint(x, y) as number[];
        const poser = (x: number, y: number, larg: number) => {
          const [ax, ay] = versPdf(x, y);
          const [bx, by] = versPdf(x + larg, y);
          return { x: ax, y: ay, angle: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI };
        };
        const im = poser(gg.left, gg.imgTop + gg.sh, gg.sw);
        page.drawImage(image, { x: im.x, y: im.y, width: gg.sw, height: gg.sh, rotate: degrees(im.angle) });
        const ecrire = (texte: string, base: number) => {
          if (!texte) return;
          const p = poser(gg.left, base, 10);
          page.drawText(texte, {
            x: p.x,
            y: p.y,
            size: TAILLE_TEXTE,
            font: police,
            color: rgb(0.07, 0.07, 0.07),
            rotate: degrees(p.angle),
          });
        };
        ecrire(lignes.mention, gg.baseMention);
        ecrire(lignes.date, gg.baseDate);
      }
      const o = await pdf.save();
      setRes(new Blob([o], { type: "application/pdf" }));
    } catch (e) {
      setErreur(t.echec((e as Error).message));
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = `${fichier ? nomSansExtension(fichier.name) : t.defautNom}-${t.suffixe}.pdf`;

  const outil = (
    <div className="space-y-5">
      {!fichier ? (
        <DepotFichiers accept=".pdf,application/pdf" onFichiers={ouvrir} libelle={t.choisirPdf} />
      ) : (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
          <p className="min-w-0 [overflow-wrap:anywhere]">
            <span className="text-white">{fichier.name}</span>
            <span className="block text-sm text-neutral-400 tabular-nums">
              {formatOctets(fichier.size, lang)} · {nbPages.toLocaleString(locale(lang))} {t.page(nbPages)}
            </span>
          </p>
          <Bouton
            secondaire
            disabled={enCours}
            onClick={() => {
              setFichier(null);
              setDoc(null);
              setApercu(null);
              setOctets(null);
              setRes(null);
            }}
          >
            {t.changer}
          </Bouton>
        </div>
      )}

      {erreur && <Alerte>{erreur}</Alerte>}
      {dejaSigne && fichier && <Alerte ton="info">{t.dejaSigne}</Alerte>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start">
        <div className="space-y-5 min-w-0">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">{t.etape1}</h2>
            <Segments
              nom={t.origine}
              valeur={source}
              onChange={(v) => {
                setSource(v);
                setRes(null);
              }}
              options={[
                { v: "dessiner", l: t.dessiner },
                { v: "importer", l: t.importer },
              ]}
            />
          </div>
          <div className={source === "dessiner" ? "" : "hidden"}>
            <Pad
              onSignature={(s) => {
                setSigDessin(s);
                setRes(null);
              }}
            />
          </div>
          {source === "importer" && (
            <div className="space-y-3">
              <DepotFichiers
                accept="image/png,image/jpeg,image/webp"
                onFichiers={(f) => {
                  setErreur("");
                  setFichierImport(f[0]);
                  setRes(null);
                }}
                libelle={fichierImport ? t.autreImage : t.uneImage}
                aide={t.aideImage}
              />
              <label className="flex items-start gap-3 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-sky-400"
                  checked={fondTransparent}
                  onChange={(e) => setFondTransparent(e.target.checked)}
                />
                {t.fondTransparent}
              </label>
              {sigImport && (
                <div className="rounded-lg p-3 bg-[repeating-conic-gradient(#e5e5e5_0_25%,#ffffff_0_50%)] bg-[length:16px_16px]">
                  <img src={sigImport.url} alt={t.sigImportee} className="max-h-24 mx-auto" />
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">{t.etape2}</h2>
            <ChoixListe
              label={t.pageASigner}
              value={String(pageNo)}
              onChange={(v) => {
                setPageNo(parseInt(v, 10));
                setRes(null);
              }}
              disabled={!doc}
            >
              {Array.from({ length: nbPages || 1 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {t.pageN(i + 1)}
                  {i + 1 === nbPages && nbPages > 1 ? t.derniere : ""}
                </option>
              ))}
            </ChoixListe>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">{t.taille(largeur)}</span>
              <input
                type="range"
                min={8}
                max={60}
                value={largeur}
                onChange={(e) => {
                  setLargeur(parseInt(e.target.value, 10));
                  setRes(null);
                }}
                className="w-full accent-sky-400 h-8"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input type="checkbox" className="w-4 h-4 accent-sky-400" checked={mention} onChange={(e) => (setMention(e.target.checked), setRes(null))} />
              {t.mention}
            </label>
            {mention && (
              <div className="space-y-1">
                <input
                  type="text"
                  aria-label={t.texteMention}
                  value={texteMention}
                  onChange={(e) => (setTexteMention(e.target.value), setRes(null))}
                  className={classeChamp}
                />
                {t.aideMention && <p className="text-xs text-neutral-500">{t.aideMention}</p>}
              </div>
            )}
            <label className="flex items-center gap-3 text-sm text-neutral-300">
              <input type="checkbox" className="w-4 h-4 accent-sky-400" checked={date} onChange={(e) => (setDate(e.target.checked), setRes(null))} />
              {t.date}
            </label>
            {date && (
              <input
                type="text"
                aria-label={t.texteDate}
                value={texteDate}
                onChange={(e) => (setTexteDate(e.target.value), setRes(null))}
                className={classeChamp}
              />
            )}
            {nbPages > 1 && (
              <label className="flex items-start gap-3 text-sm text-neutral-300">
                <input type="checkbox" className="mt-1 w-4 h-4 accent-sky-400" checked={toutes} onChange={(e) => (setToutes(e.target.checked), setRes(null))} />
                {t.toutes}
              </label>
            )}
          </div>
        </div>

        <div data-resultat className="min-w-0 flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="space-y-3 order-last lg:order-first">
            <Bouton onClick={signer} disabled={!doc || !sig || enCours}>
              {enCours ? t.enCours : t.signer}
            </Bouton>
            {!res && !enCours && <p className="text-sm text-neutral-500">{fichier && !sig ? t.dabord : t.attente}</p>}
            {res && (
              <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
                <p className="text-neutral-200">{t.pret(formatOctets(res.size, lang))}</p>
                <Bouton onClick={() => telecharger(nomSortie, res)}>{t.telecharger}</Bouton>
              </div>
            )}
          </div>
          <div>
            {apercu ? (
              <>
                <p className="text-sm text-neutral-400 mb-2">{t.consigne(pageNo)}</p>
                <div
                  ref={conteneur}
                  onPointerDown={surPage}
                  className="relative w-full bg-white shadow-lg select-none touch-pan-y"
                  style={{ aspectRatio: `${apercu.W} / ${apercu.H}` }}
                >
                  <img src={apercu.url} alt={t.apercuAlt(pageNo)} className="absolute inset-0 w-full h-full pointer-events-none" draggable={false} />
                  {g && k > 0 && sig && (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={t.sigAria}
                      onPointerDown={saisir}
                      onPointerMove={deplacer}
                      onPointerUp={lacher}
                      onPointerCancel={lacher}
                      onKeyDown={clavier}
                      className="absolute cursor-move touch-none outline outline-1 outline-dashed outline-sky-500 focus:outline-2 focus:outline-sky-400"
                      style={{ left: g.left * k, top: g.top * k, width: g.sw * k, height: g.hauteur * k }}
                    >
                      {mention && (
                        <div
                          className="whitespace-nowrap text-[#111]"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: TAILLE_TEXTE * k, lineHeight: `${TAILLE_TEXTE * LH * k}px` }}
                        >
                          {texteMention}
                        </div>
                      )}
                      <img src={sig.url} alt="" draggable={false} className="block pointer-events-none" style={{ width: g.sw * k, height: g.sh * k }} />
                      {date && (
                        <div
                          className="whitespace-nowrap text-[#111]"
                          style={{ fontFamily: "Helvetica, Arial, sans-serif", fontSize: TAILLE_TEXTE * k, lineHeight: `${TAILLE_TEXTE * LH * k}px` }}
                        >
                          {texteDate}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {nbPages > 1 && (
                  <div className="flex items-center justify-between gap-2 mt-3">
                    <Bouton secondaire disabled={pageNo <= 1} onClick={() => (setPageNo((p) => p - 1), setRes(null))}>
                      {t.precedente}
                    </Bouton>
                    <span className="text-sm text-neutral-400 tabular-nums">
                      {pageNo} / {nbPages}
                    </span>
                    <Bouton secondaire disabled={pageNo >= nbPages} onClick={() => (setPageNo((p) => p + 1), setRes(null))}>
                      {t.suivante}
                    </Bouton>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-800 aspect-[210/297] max-h-[28rem] grid place-items-center text-sm text-neutral-500 p-6 text-center">
                {fichier ? t.preparation : t.apercuIci}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageOutil
      id="signer-pdf"
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
    <Section titre="Ajouter une signature sur un PDF en trois gestes">
      <p>
        Pour ajouter une signature sur un PDF, ouvrez le fichier dans le cadre ci-dessus, dessinez votre signature
        à la souris ou au doigt (ou importez la photo d'une signature sur papier blanc), puis faites-la glisser à sa
        place sur l'aperçu de la page : la dernière page est proposée par défaut, et la signature occupe 25 % de la
        largeur de la page, réglable de 8 à 60 %. Cochez la date, qui s'écrit « Le 27/10/2026 », et si besoin une
        mention comme « Lu et approuvé », puis cliquez sur « Signer et préparer le PDF » pour télécharger le
        document signé. Le fichier n'est envoyé nulle part. La limite à connaître : c'est une signature
        électronique simple au sens du règlement eIDAS, une image sans certificat, qui convient à un devis ou une
        autorisation mais pas à un acte où l'identité du signataire doit être prouvée.
      </p>
    </Section>

    <Section titre="Signature simple, avancée ou qualifiée : ce que fait cet outil">
      <p>
        Cet outil pose une <strong>image de votre signature</strong> sur le PDF. Au sens du règlement européen
        eIDAS (n° 910/2014), c'est une signature électronique : des données électroniques jointes au document,
        que le signataire utilise pour signer. Mais c'est le premier des niveaux distingués par l'ANSSI, celui
        qu'on appelle la signature <strong>simple</strong>.
      </p>
      <p>
        Elle n'est ni <strong>avancée</strong> ni <strong>qualifiée</strong>. Une signature avancée doit, selon
        l'article 26 du règlement, être liée au signataire de manière univoque, permettre de l'identifier, être
        créée avec des données qu'il contrôle seul, et rendre détectable toute modification ultérieure du document.
        Une signature qualifiée y ajoute un dispositif qualifié et un certificat qualifié, délivrés par un
        prestataire de confiance. Rien de tout cela ici : n'importe qui peut dessiner un paraphe, et le PDF peut
        encore être modifié sans laisser de trace.
      </p>
      <p>
        Ce que dit le droit : l'article 25 du règlement interdit de refuser une signature électronique comme
        preuve au seul motif qu'elle est électronique ou qu'elle n'est pas qualifiée, et seule la signature
        qualifiée a l'effet juridique d'une signature manuscrite. En France, l'article 1367 du Code civil demande
        « l'usage d'un procédé fiable d'identification garantissant son lien avec l'acte » ; le décret du
        28 septembre 2017 ne présume cette fiabilité que pour la signature qualifiée. Pour une signature simple,
        c'est à celui qui s'en prévaut de convaincre le juge.
      </p>
      <p>
        La jurisprudence récente invite à la prudence. Le 13 mars 2024, la Cour de cassation (chambre commerciale,
        n° 22-16.487) a jugé qu'une signature scannée ne permettait pas d'identifier son auteur ni de prouver son
        consentement, dans une affaire de promesse de vente. À l'inverse, le 14 décembre 2022 (n° 21-19.841), elle
        a admis la signature numérisée d'un gérant sur un contrat de travail, parce qu'il n'était pas contesté
        qu'elle était la sienne. Tout dépend donc de l'enjeu et du risque de contestation.
      </p>
    </Section>

    <Section titre="Quand cette signature suffit, quand il faut un prestataire">
      <p>
        <strong>Elle suffit généralement</strong> quand votre interlocuteur demande simplement un document
        « signé » et que le risque de litige est faible : bon pour accord sur un{" "}
        <Link to="/generateur-devis/">devis</Link>, autorisation parentale, attestation entre particuliers,
        formulaire à retourner, bon de commande courant, accusé de réception. C'est l'équivalent numérique de
        l'imprimer, la signer au stylo et la scanner, en plus propre.
      </p>
      <p>
        <strong>Passez par un prestataire de signature électronique</strong> (avancée, ou qualifiée) dès que
        l'enjeu est important : bail, vente, prêt, cautionnement, engagement d'un montant élevé, réponse à un
        marché public, ou chaque fois que votre interlocuteur ou un texte impose un niveau de signature. L'ANSSI
        recommande de choisir le niveau après une analyse de risque : probabilité et gravité d'un litige, portée
        du document, obligations réglementaires. Les prestataires qualifiés sont inscrits sur la liste nationale
        de confiance de l'ANSSI.
      </p>
      <p>
        Un acte authentique, enfin, tient son authenticité de la signature d'un officier public, comme un notaire
        (article 1367 du Code civil) : aucun outil en ligne ne la remplace. Si vous avez un doute sur la forme
        exigée, demandez-la à votre interlocuteur avant de signer.
      </p>
    </Section>

    <Section titre="Mode d'emploi et confidentialité">
      <p>
        <strong>Dessinez</strong> votre signature dans le cadre blanc, à la souris, au stylet ou au doigt sur
        téléphone ; « Effacer » permet de recommencer. Ou <strong>importez</strong> une image : un PNG à fond
        transparent, ou la photo d'une signature à l'encre noire sur papier blanc, dont le fond est effacé
        automatiquement. Sur l'aperçu, touchez la page pour y amener la signature, ou déplacez-la aux flèches du
        clavier. La case « toutes les autres pages » sert à parapher chaque page d'un contrat au même endroit.
      </p>
      <p>
        Le PDF et votre signature restent sur votre appareil : rien n'est envoyé, rien n'est conservé quand vous
        fermez la page. Gardez une copie du document signé et de l'échange (e-mail) qui montre à qui et quand
        vous l'avez transmis : en cas de doute sur une signature simple, ces éléments de contexte comptent. Si le
        fichier signé est trop lourd pour être envoyé, passez-le dans l'outil pour{" "}
        <Link to="/compresser-pdf/">compresser un PDF</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Sign a PDF online for free in three steps">
      <p>
        To sign a PDF online for free, open the file in the box above, draw your signature with a mouse or your
        finger (or import a photo of a signature on white paper), then drag it into place on the page preview: the
        last page is suggested by default, and the signature takes 25% of the page width, adjustable from 8 to 60%.
        Tick the date, written the French way as « Le 27/10/2026 », and if a French recipient asks for it the
        wording « Lu et approuvé » (read and approved), then press "Sign and prepare the PDF" to download the signed
        document. Nothing is uploaded. The main limit: under the EU eIDAS regulation this is a simple electronic
        signature, an image without a certificate, fine for a quote or a consent form but not for a deed where
        your identity must be proven.
      </p>
    </Section>

    <Section titre="Simple, advanced or qualified: what this signature is">
      <p>
        This tool places an <strong>image of your signature</strong> on the PDF. Under Regulation (EU) No 910/2014,
        known as eIDAS, that counts as an electronic signature: electronic data attached to the document and used by
        the signatory to sign. It is, however, the lowest level, the <strong>simple</strong> electronic signature.
      </p>
      <p>
        It is neither <strong>advanced</strong> nor <strong>qualified</strong>. An advanced signature must, under
        Article 26, be uniquely linked to the signatory, identify them, be created with data under their sole
        control, and make any later change to the document detectable. A qualified signature adds a qualified
        device and a qualified certificate issued by a trust service provider. None of that happens here: anyone
        can draw a scribble, and the PDF can still be edited without a trace.
      </p>
      <p>
        What the law says: Article 25 forbids rejecting an electronic signature as evidence solely because it is
        electronic or not qualified, and only a qualified signature has the effect of a handwritten one. In France,
        Article 1367 of the Code civil (Civil Code) requires "a reliable identification process guaranteeing its
        link with the deed", and a 2017 decree presumes that reliability only for qualified signatures. With a
        simple signature, the person relying on it has to convince the judge. In March 2024 the Cour de cassation,
        France's highest court, held, in a dispute over a promise to sell, that a scanned signature identified neither its author nor
        their consent.
      </p>
    </Section>

    <Section titre="When it is enough in France, and when it is not">
      <p>
        <strong>It is usually enough</strong> when the other party just wants a "signed" document and the risk of a
        dispute is low: approving a <Link to="/en/quote-generator/">quote</Link> with « Bon pour accord », a school
        trip consent form, a statement for a relative, a form returned to your letting agency or your mutuelle
        (top-up health insurer), a routine order. It is the digital version of printing, signing in pen and
        scanning, only cleaner.
      </p>
      <p>
        <strong>Use an electronic signature provider</strong> (advanced or qualified) when the stakes are high: a
        lease, a property sale, a loan, acting as guarantor (caution), a large commitment, a public tender, or
        whenever the other party or a rule sets a signature level. ANSSI, the French cybersecurity agency,
        recommends choosing the level after a risk analysis, and lists qualified providers on the national trusted
        list. A notarial deed (acte authentique) gets its force from the notaire's signature: no online tool
        replaces it.
      </p>
    </Section>

    <Section titre="How to use it, and privacy">
      <p>
        <strong>Draw</strong> your signature in the white box with a mouse, a stylus or your finger on a phone;
        "Clear" lets you start again. Or <strong>import</strong> an image: a transparent PNG, or a photo of a
        signature in black ink on white paper, whose background is removed automatically. On the preview, tap the
        page to move the signature there, or nudge it with the arrow keys. The "every other page" option initials
        each page of a contract in the same spot, as French contracts often require.
      </p>
      <p>
        The PDF and your signature stay on your device: nothing is sent, nothing is kept once you close the page.
        Keep a copy of the signed document and of the email showing who you sent it to and when; with a simple
        signature, that context matters. If the signed file is too heavy to send, run it through the tool to{" "}
        <Link to="/en/compress-pdf/">compress a PDF</Link>.
      </p>
    </Section>
  </>
);

export default SignerPdf;
