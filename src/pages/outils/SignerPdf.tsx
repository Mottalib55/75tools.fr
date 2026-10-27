import { KeyboardEvent, PointerEvent as PE, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PDFDocument, PDFFont, StandardFonts, degrees, rgb } from "pdf-lib";
import { PageOutil, DepotFichiers, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { Alerte, Segments, ChoixListe } from "@/components/outils/PdfOutils";
import { chargerPdfLib, messagePdfJs } from "@/lib/pdf-outils";
import { ouvrirPdf, rendrePage } from "@/lib/pdfjs";
import { telecharger, nomSansExtension, formatOctets, lireOctets, chargerImage } from "@/lib/fichiers";
import { cn } from "@/lib/utils";

type DocJs = Awaited<ReturnType<typeof ouvrirPdf>>;

const FAQ: QuestionFaq[] = [
  {
    q: "Une signature ajoutée avec cet outil a-t-elle une valeur juridique ?",
    r: "C'est une signature électronique dite simple : une image de votre signature posée sur le document. Le règlement européen eIDAS interdit de lui refuser tout effet au seul motif qu'elle est électronique, mais elle ne prouve ni votre identité ni que le document n'a pas été modifié ensuite. En cas de contestation, c'est à celui qui s'en prévaut d'en démontrer la fiabilité. Pour un acte à fort enjeu, passez par un prestataire de signature avancée ou qualifiée.",
  },
  {
    q: "Pour quels documents une signature dessinée suffit-elle ?",
    r: "Elle convient quand le risque de contestation est faible et que l'interlocuteur l'accepte : bon pour accord sur un devis, autorisation parentale de sortie, attestation demandée par un proche, bon de commande courant, document interne d'entreprise, retour d'un formulaire signé. Si votre interlocuteur exige une signature électronique avec certificat, ou si le texte applicable impose un niveau de signature, cet outil ne convient pas.",
  },
  {
    q: "Quand faut-il passer par un prestataire de signature électronique qualifiée ?",
    r: "Quand l'enjeu justifie une preuve solide : contrat important, acte immobilier, engagement financier, réponse à un marché public, ou dès qu'un texte ou votre interlocuteur impose un niveau de signature. Seule la signature qualifiée a l'effet juridique d'une signature manuscrite et bénéficie, en France, d'une présomption de fiabilité. Les prestataires qualifiés figurent sur la liste de confiance publiée par l'ANSSI.",
  },
  {
    q: "Comment obtenir un fond transparent pour la signature importée ?",
    r: "Le plus simple est de signer à l'encre noire sur une feuille blanche, de la photographier bien éclairée et à plat, puis de l'importer en laissant cochée l'option qui rend le fond blanc transparent : les pixels clairs sont effacés et la signature se pose sans rectangle blanc sur les lignes du document. Un PNG déjà transparent est utilisé tel quel. Recadrez la photo au plus près si une ombre persiste.",
  },
  {
    q: "Mon PDF portait déjà une signature électronique, puis-je y ajouter la mienne ici ?",
    r: "C'est déconseillé. Une signature électronique avancée ou qualifiée scelle le document : toute modification ultérieure, y compris l'ajout d'une image, est détectée et les lecteurs PDF signalent alors la signature comme invalide. L'outil vous prévient s'il repère une signature de ce type. Dans ce cas, signez avec le service qui a fait signer la première personne, qui sait ajouter plusieurs signatures sans casser les précédentes.",
  },
];

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

const ENCRES = [
  { v: "#111111", l: "Noir" },
  { v: "#1e3a8a", l: "Bleu foncé" },
];

/** Zone de dessin de la signature (souris, stylet ou doigt). */
const Pad = ({ onSignature }: { onSignature: (s: Signature | null) => void }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [epaisseur, setEpaisseur] = useState("6");
  const [encre, setEncre] = useState(ENCRES[0].v);
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
    const t = trace.current;
    if (!t) return;
    const p = point(e);
    t.push(p);
    const ctx = ref.current!.getContext("2d")!;
    ctx.strokeStyle = encre;
    ctx.lineWidth = parseFloat(epaisseur);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const n = t.length;
    if (n < 3) {
      ctx.beginPath();
      ctx.moveTo(t[0].x, t[0].y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      return;
    }
    // Courbe lissée entre les milieux des segments successifs.
    const a = t[n - 3],
      b = t[n - 2];
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
          aria-label="Zone de signature : dessinez avec la souris, un stylet ou le doigt"
          className="block w-full h-auto rounded-lg cursor-crosshair touch-none"
          onPointerDown={debut}
          onPointerMove={bouge}
          onPointerUp={fin}
          onPointerCancel={fin}
        />
        {vide && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-neutral-400 text-sm">
            Signez ici
          </span>
        )}
        <span className="pointer-events-none absolute left-[6%] right-[6%] bottom-[22%] border-b border-neutral-300" />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-sm text-neutral-300 mb-1">Épaisseur</p>
          <Segments
            nom="Épaisseur du trait"
            valeur={epaisseur}
            onChange={setEpaisseur}
            options={[
              { v: "4", l: "Fin" },
              { v: "6", l: "Moyen" },
              { v: "10", l: "Épais" },
            ]}
          />
        </div>
        <div>
          <p className="text-sm text-neutral-300 mb-1">Encre</p>
          <Segments nom="Couleur de l'encre" valeur={encre} onChange={setEncre} options={ENCRES} />
        </div>
        <Bouton secondaire onClick={effacer}>
          Effacer
        </Bouton>
      </div>
      <p className="text-xs text-neutral-500">L'épaisseur et la couleur s'appliquent aux traits suivants.</p>
    </div>
  );
};

/** Retire les caractères que la police standard Helvetica (WinAnsi) ne sait pas écrire. */
function nettoyer(texte: string, police: PDFFont): string {
  let s = "";
  for (const ch of texte.replace(/[   ]/g, " ")) {
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

const SignerPdf = () => {
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
  const [texteMention, setTexteMention] = useState("Lu et approuvé");
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

  useEffect(() => {
    setTexteDate(`Le ${new Date().toLocaleDateString("fr-FR")}`);
  }, []);

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
        if (!annule) setErreur(`Aperçu impossible : ${(e as Error).message}`);
      }
    })();
    return () => {
      annule = true;
    };
  }, [doc, pageNo]);

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
          if (!s) setErreur("L'image importée semble vide après suppression du fond : décochez l'option de fond transparent.");
        }
      } catch {
        if (!annule) setErreur("Image illisible : utilisez un PNG ou un JPG.");
      }
    })();
    return () => {
      annule = true;
    };
  }, [fichierImport, fondTransparent]);

  const ouvrir = async (f: File[]) => {
    const fi = f[0];
    setErreur("");
    setRes(null);
    setFichier(null);
    setDoc(null);
    setApercu(null);
    try {
      const o = await lireOctets(fi);
      await chargerPdfLib(o, `« ${fi.name} »`);
      let d: DocJs;
      try {
        d = await ouvrirPdf(o.slice());
      } catch (e) {
        throw new Error(messagePdfJs(e, `« ${fi.name} »`));
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
      const pdf = await chargerPdfLib(octets, "Le PDF");
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
          const t = poser(gg.left, base, 10);
          page.drawText(texte, {
            x: t.x,
            y: t.y,
            size: TAILLE_TEXTE,
            font: police,
            color: rgb(0.07, 0.07, 0.07),
            rotate: degrees(t.angle),
          });
        };
        ecrire(lignes.mention, gg.baseMention);
        ecrire(lignes.date, gg.baseDate);
      }
      const o = await pdf.save();
      setRes(new Blob([o], { type: "application/pdf" }));
    } catch (e) {
      setErreur(`La signature n'a pas pu être ajoutée : ${(e as Error).message}`);
    } finally {
      setEnCours(false);
    }
  };

  const nomSortie = fichier ? `${nomSansExtension(fichier.name)}-signe.pdf` : "document-signe.pdf";

  return (
    <PageOutil
      href="/signer-pdf/"
      titre="Signer un PDF en ligne gratuit : ajouter votre signature"
      description="Signer un PDF gratuitement : dessinez votre signature ou importez-la, placez-la sur la page voulue, ajoutez la date ou « Lu et approuvé ». Aucun envoi."
      motsCles="signer un pdf en ligne gratuit, ajouter une signature sur un pdf, signature électronique pdf gratuite, signer pdf, signature pdf"
      nomAppli="Signature de PDF 75tools"
      h1="Signer un PDF : ajouter votre signature au document"
      chapeau="Ouvrez le PDF, dessinez votre signature (ou importez-en une image), puis placez-la sur la page en la faisant glisser. Il s'agit d'une signature simple, sans certificat : voyez plus bas quand elle suffit."
      faq={FAQ}
      sources={[
        { editeur: "Légifrance", titre: "Code civil, article 1367 (signature, signature électronique)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032042456", lu: "27 octobre 2026" },
        { editeur: "Légifrance", titre: "Décret n° 2017-1416 du 28 septembre 2017 relatif à la signature électronique", url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035676246", lu: "27 octobre 2026" },
        { editeur: "EUR-Lex", titre: "Règlement (UE) n° 910/2014 dit eIDAS, articles 3, 25 et 26", url: "https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32014R0910", lu: "27 octobre 2026" },
        { editeur: "ANSSI (cyber.gouv.fr)", titre: "Guide de sélection du niveau des signatures et des cachets électroniques", url: "https://cyber.gouv.fr/reglementation/reglementation-identite-confiance-numerique/securite-echanges-voie-electronique/reglement-eidas/selection-niveau-signatures-cachets-%C3%A9lectroniques/", lu: "27 octobre 2026" },
        { editeur: "Entreprendre Service Public", titre: "La signature scannée n'est pas une preuve suffisante du consentement à une obligation", url: "https://entreprendre.service-public.gouv.fr/actualites/A17339", lu: "27 octobre 2026" },
        { editeur: "Ministère de l'Économie, Direction des affaires juridiques", titre: "Lettre de la DAJ : valeur juridique de la signature manuscrite scannée", url: "https://www.economie.gouv.fr/daj/lettre-de-la-daj-valeur-juridique-de-la-signature-manuscrite-scannee", lu: "27 octobre 2026" },
        { editeur: "France Num", titre: "La signature électronique : un outil devenu incontournable", url: "https://www.francenum.gouv.fr/guides-et-conseils/pilotage-de-lentreprise/dematerialisation-des-documents/la-signature", lu: "27 octobre 2026" },
      ]}
    >
      <div className="space-y-6">
        {!fichier ? (
          <DepotFichiers accept=".pdf,application/pdf" onFichiers={ouvrir} libelle="Choisir le PDF à signer" />
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
                setDoc(null);
                setApercu(null);
                setOctets(null);
                setRes(null);
              }}
            >
              Changer de fichier
            </Bouton>
          </div>
        )}

        {erreur && <Alerte>{erreur}</Alerte>}
        {dejaSigne && fichier && (
          <Alerte ton="info">
            Ce PDF semble déjà porter une signature électronique à certificat. Y ajouter une image modifie le
            fichier : les lecteurs PDF signaleront alors cette signature existante comme invalide.
          </Alerte>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start">
          <div className="space-y-5 min-w-0">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">1. Votre signature</h2>
              <Segments
                nom="Origine de la signature"
                valeur={source}
                onChange={(v) => {
                  setSource(v);
                  setRes(null);
                }}
                options={[
                  { v: "dessiner", l: "Dessiner" },
                  { v: "importer", l: "Importer une image" },
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
                  libelle={fichierImport ? "Choisir une autre image" : "Choisir une image"}
                  aide="PNG à fond transparent conseillé, ou photo d'une signature sur papier blanc"
                />
                <label className="flex items-start gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-sky-400"
                    checked={fondTransparent}
                    onChange={(e) => setFondTransparent(e.target.checked)}
                  />
                  Rendre le fond blanc transparent (pour une photo de signature sur papier)
                </label>
                {sigImport && (
                  <div className="rounded-lg p-3 bg-[repeating-conic-gradient(#e5e5e5_0_25%,#ffffff_0_50%)] bg-[length:16px_16px]">
                    <img src={sigImport.url} alt="Signature importée" className="max-h-24 mx-auto" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">2. Placement et mentions</h2>
              <ChoixListe
                label="Page à signer"
                value={String(pageNo)}
                onChange={(v) => {
                  setPageNo(parseInt(v, 10));
                  setRes(null);
                }}
                disabled={!doc}
              >
                {Array.from({ length: nbPages || 1 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Page {i + 1}
                    {i + 1 === nbPages && nbPages > 1 ? " (dernière)" : ""}
                  </option>
                ))}
              </ChoixListe>
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">
                  Taille de la signature : {largeur} % de la largeur de la page
                </span>
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
                Mention au-dessus de la signature
              </label>
              {mention && (
                <input
                  type="text"
                  aria-label="Texte de la mention"
                  value={texteMention}
                  onChange={(e) => (setTexteMention(e.target.value), setRes(null))}
                  className={classeChamp}
                />
              )}
              <label className="flex items-center gap-3 text-sm text-neutral-300">
                <input type="checkbox" className="w-4 h-4 accent-sky-400" checked={date} onChange={(e) => (setDate(e.target.checked), setRes(null))} />
                Date sous la signature
              </label>
              {date && (
                <input
                  type="text"
                  aria-label="Texte de la date"
                  value={texteDate}
                  onChange={(e) => (setTexteDate(e.target.value), setRes(null))}
                  className={classeChamp}
                />
              )}
              {nbPages > 1 && (
                <label className="flex items-start gap-3 text-sm text-neutral-300">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-sky-400" checked={toutes} onChange={(e) => (setToutes(e.target.checked), setRes(null))} />
                  Apposer aussi sur toutes les autres pages, au même endroit (paraphe de chaque page)
                </label>
              )}
            </div>

          </div>

          <div className="min-w-0 lg:sticky lg:top-4 lg:row-span-2 lg:col-start-2 lg:row-start-1">
            {apercu ? (
              <>
                <p className="text-sm text-neutral-400 mb-2">
                  Page {pageNo} : faites glisser la signature, ou touchez la page pour l'y amener.
                </p>
                <div
                  ref={conteneur}
                  onPointerDown={surPage}
                  className="relative w-full bg-white shadow-lg select-none touch-pan-y"
                  style={{ aspectRatio: `${apercu.W} / ${apercu.H}` }}
                >
                  <img src={apercu.url} alt={`Aperçu de la page ${pageNo}`} className="absolute inset-0 w-full h-full pointer-events-none" draggable={false} />
                  {g && k > 0 && sig && (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Signature : glissez-la ou déplacez-la avec les flèches du clavier"
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
                      Page précédente
                    </Bouton>
                    <span className="text-sm text-neutral-400 tabular-nums">
                      {pageNo} / {nbPages}
                    </span>
                    <Bouton secondaire disabled={pageNo >= nbPages} onClick={() => (setPageNo((p) => p + 1), setRes(null))}>
                      Page suivante
                    </Bouton>
                  </div>
                )}
              </>
            ) : (
              <div className={cn("rounded-lg border border-dashed border-neutral-800 aspect-[210/297] max-h-[28rem] grid place-items-center text-sm text-neutral-500 p-6 text-center")}>
                {fichier ? "Préparation de l'aperçu…" : "L'aperçu de la page apparaîtra ici."}
              </div>
            )}
          </div>
            <div className="space-y-3 min-w-0 lg:col-start-1">
              <Bouton onClick={signer} disabled={!doc || !sig || enCours}>
                {enCours ? "Signature en cours…" : "Signer et préparer le PDF"}
              </Bouton>
              {!sig && fichier && (
                <p className="text-sm text-neutral-400">Dessinez ou importez d'abord votre signature.</p>
              )}
              {res && (
                <div className="rounded-lg border border-neutral-800 p-4 space-y-3" role="status" aria-live="polite">
                  <p className="text-neutral-200">PDF signé prêt ({formatOctets(res.size)}).</p>
                  <Bouton onClick={() => telecharger(nomSortie, res)}>Télécharger le PDF signé</Bouton>
                </div>
              )}
            </div>
        </div>
      </div>

      <Section titre="Signature simple, avancée ou qualifiée : ce que fait cet outil">
        <p>
          Cet outil pose une <strong>image de votre signature</strong> sur le PDF, éventuellement accompagnée
          d'une date et d'une mention comme « Lu et approuvé ». Au sens du règlement européen eIDAS (n° 910/2014),
          c'est une signature électronique : des données électroniques jointes au document, que le signataire
          utilise pour signer. Mais c'est le premier des quatre niveaux distingués par l'ANSSI, celui qu'on
          appelle la signature <strong>simple</strong>.
        </p>
        <p>
          Elle n'est ni <strong>avancée</strong> ni <strong>qualifiée</strong>. Une signature avancée doit, selon
          l'article 26 du règlement, être liée au signataire de manière univoque, permettre de l'identifier, être
          créée avec des données qu'il contrôle seul, et rendre détectable toute modification ultérieure du
          document. Une signature qualifiée y ajoute un dispositif qualifié et un certificat qualifié, délivrés
          par un prestataire de confiance. Rien de tout cela ici : n'importe qui peut dessiner un paraphe, et le
          PDF peut encore être modifié sans laisser de trace.
        </p>
        <p>
          Ce que dit le droit : l'article 25 du règlement interdit de refuser une signature électronique comme
          preuve au seul motif qu'elle est électronique ou qu'elle n'est pas qualifiée, et seule la signature
          qualifiée a l'effet juridique d'une signature manuscrite. En France, l'article 1367 du Code civil
          demande « l'usage d'un procédé fiable d'identification garantissant son lien avec l'acte » ; le décret
          du 28 septembre 2017 ne présume cette fiabilité que pour la signature qualifiée. Pour une signature
          simple, c'est à celui qui s'en prévaut de convaincre le juge.
        </p>
        <p>
          La jurisprudence récente invite à la prudence. Le 13 mars 2024, la Cour de cassation (chambre
          commerciale, n° 22-16.487) a jugé qu'une signature scannée ne permettait pas d'identifier son auteur ni
          de prouver son consentement, dans une affaire de promesse de vente. À l'inverse, le 14 décembre 2022
          (n° 21-19.841), elle a admis la signature numérisée d'un gérant sur un contrat de travail, parce qu'il
          n'était pas contesté qu'elle était la sienne. Tout dépend donc de l'enjeu et du risque de contestation.
        </p>
      </Section>

      <Section titre="Quand cette signature suffit, quand il faut un prestataire">
        <p>
          <strong>Elle suffit généralement</strong> quand votre interlocuteur demande simplement un document
          « signé » et que le risque de litige est faible : bon pour accord sur un{" "}
          <Link to="/generateur-devis/">devis</Link>, autorisation parentale, attestation entre particuliers,
          formulaire à retourner, bon de commande courant, note interne, accusé de réception. C'est l'équivalent
          numérique de l'imprimer, la signer au stylo et la scanner, en plus propre.
        </p>
        <p>
          <strong>Passez par un prestataire de signature électronique</strong> (avancée, ou qualifiée) dès que
          l'enjeu est important : bail, vente, prêt, cautionnement, engagement d'un montant
          élevé, réponse à un marché public, ou chaque fois que votre interlocuteur ou un texte impose un niveau
          de signature. L'ANSSI recommande de choisir le niveau après une analyse de risque : probabilité et
          gravité d'un litige, portée du document, obligations réglementaires. Les prestataires qualifiés sont
          inscrits sur la liste nationale de confiance de l'ANSSI.
        </p>
        <p>
          Un acte authentique, enfin, tient son authenticité de la signature d'un officier public, comme un
          notaire (article 1367 du Code civil) : aucun outil en ligne ne la remplace. Si vous avez un doute sur
          la forme exigée, demandez-la à votre interlocuteur avant de signer.
        </p>
      </Section>

      <Section titre="Mode d'emploi et confidentialité">
        <p>
          <strong>Dessinez</strong> votre signature dans le cadre blanc, à la souris, au stylet ou au doigt sur
          téléphone ; « Effacer » permet de recommencer. Ou <strong>importez</strong> une image : un PNG à fond
          transparent, ou la photo d'une signature à l'encre noire sur papier blanc, dont le fond est effacé
          automatiquement. Choisissez la page (la dernière est proposée par défaut), faites glisser la signature
          à sa place, réglez sa taille, puis ajoutez si besoin la date et une mention manuscrite tapée au clavier.
        </p>
        <p>
          Le PDF et votre signature restent sur votre appareil : rien n'est envoyé, rien n'est conservé quand
          vous fermez la page. Gardez une copie du document signé et, si possible, de l'échange (e-mail) qui
          montre à qui et quand vous l'avez transmis : en cas de doute sur une signature simple, ces éléments
          de contexte comptent. Pour envoyer le résultat, voyez aussi l'outil pour{" "}
          <Link to="/compresser-pdf/">compresser un PDF</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default SignerPdf;
