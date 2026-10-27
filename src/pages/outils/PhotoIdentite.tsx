import { PointerEvent as PE, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { canvasVersBlob, nomSansExtension, telecharger } from "@/lib/fichiers";
import { ImageDecodee, decoderImage, fixerDpiJpeg, libererCanvas, nouveauCanvas } from "@/lib/image-lot";
import { locale, type Langue } from "@/lib/langue";

/** Format 35 × 45 mm imprimé à 300 points par pouce : 413 × 531 pixels. */
const L_MM = 35;
const H_MM = 45;
const DPI = 300;
const PX_MM = DPI / 25.4;
const L_PX = Math.round(L_MM * PX_MM); // 413
const H_PX = Math.round(H_MM * PX_MM); // 531
/** Gabarit : sommet du crâne vers 4,5 mm du haut, menton entre 32 et 36 mm plus bas (norme : 32 à 36 mm). */
const CRANE_MM = 4.5;
const MENTON_MIN = CRANE_MM + 32;
const MENTON_MAX = CRANE_MM + 36;
/** Planche 10 × 15 cm en paysage : 4 × 2 photos, 2 mm d'écart. */
const PL_L = 150;
const PL_H = 100;
const COLS = 4;
const RANGS = 2;
const ECART = 2;

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Je peux faire ma photo de passeport ou de carte d'identité moi-même avec cet outil ?",
      r: "Non. Pour la carte d'identité et le passeport, service-public.gouv.fr précise que la photo doit être prise par un professionnel habilité ou dans une cabine utilisant un système agréé. Une photo prise chez soi puis recadrée et imprimée n'est pas acceptée pour ces titres, même si elle respecte le format 35 × 45 mm. L'outil sert aux documents qui acceptent une photo libre.",
    },
    {
      q: "C'est quoi le code ePhoto demandé pour le permis de conduire ou le titre de séjour ?",
      r: "C'est le code d'une photo-signature numérique : la photo et votre signature sont enregistrées par un photographe habilité ou une cabine agréée, qui vous remet une planche portant ce code. Vous le saisissez dans la démarche en ligne et l'administration récupère la photo. Cet outil ne peut pas produire ce code ; un annuaire officiel des photographes et cabines agréés existe sur service-public.gouv.fr.",
    },
    {
      q: "Mon fond est blanc, la photo sera-t-elle refusée ?",
      r: "Pour un titre d'identité français, oui : la norme demande un fond uni et clair, bleu ou gris clair par exemple, et interdit le fond blanc. Pour un autre usage, carte de club, badge ou dossier d'inscription, c'est la consigne de l'organisme qui compte ; beaucoup acceptent le blanc. Photographiez-vous de préférence devant un mur gris clair ou bleu pâle, sans ombre derrière la tête.",
    },
    {
      q: "Comment imprimer la planche au bon format en borne ou en ligne ?",
      r: "Téléchargez la planche 10 × 15 cm et commandez un tirage au format 10 × 15, sans recadrage ni ajustement automatique, avec l'option « taille réelle » ou « remplir sans rogner » si elle existe. La planche contient huit photos de 35 × 45 mm avec des traits de coupe. Mesurez une photo à la règle à la réception : elle doit faire exactement 3,5 cm sur 4,5 cm.",
    },
    {
      q: "Je porte des lunettes, dois-je les enlever pour la photo ?",
      r: "Les lunettes sont facultatives selon service-public.gouv.fr. Si vous les gardez, la monture ne doit pas être épaisse ni cacher les yeux, les verres ne doivent être ni teintés ni colorés, et aucun reflet ne doit apparaître. En pratique, les reflets du flash ou d'une fenêtre sont la cause de refus la plus fréquente : les retirer évite le problème.",
    },
    {
      q: "Un formulaire en ligne me demande une photo d'identité en fichier, quelle taille envoyer ?",
      r: "Le bouton « Photo seule » produit un JPEG de 413 × 531 pixels, soit 35 × 45 mm à 300 points par pouce, qui pèse en général moins de 150 ko : la plupart des formulaires d'inscription, d'abonnement de transport ou de badge l'acceptent tel quel. Si le site impose d'autres dimensions en pixels ou un poids maximal, ajustez le fichier avec l'outil de redimensionnement avant de l'envoyer.",
    },
  ],
  en: [
    {
      q: "Can I use this photo for my titre de séjour (residence permit) application?",
      r: "Not for an online application. On the ANEF portal, service-public.gouv.fr asks for the code of an e-photo, printed on the photo sheet by an approved photographer or photo booth. A photo taken at home, even cropped exactly to 35 × 45 mm, cannot give you that code. Use this tool for documents that accept a plain photo, such as a transport pass, a university card or a sports licence.",
    },
    {
      q: "What is the e-photo code, and where do I get one in France?",
      r: "It is a digital photo-and-signature code. An approved photographer or a booth with an approved system takes your photo and signature and prints a sheet carrying the code, which you type into the online procedure. The administration then fetches the photo itself. France Titres (ANTS) and service-public.gouv.fr both list approved photographers and booths. Expect to pay the usual booth price of a few euros, and keep the sheet until your application is processed.",
    },
    {
      q: "My home-country passport photos are 2 × 2 inches, will France accept them?",
      r: "No. French documents use 35 × 45 mm, with a face measuring 32 to 36 mm from chin to crown, while a United States or Indian passport photo is 51 × 51 mm. You can recrop a digital copy here for a document that accepts a plain photo. For a residence permit, a driving licence exchange or a French passport after naturalisation, you need an approved booth or photographer instead.",
    },
    {
      q: "Is a white background allowed on a French ID photo?",
      r: "No. For French identity documents, service-public.gouv.fr requires a plain, light background, such as light blue or light grey, and states that white is forbidden. Other organisations, like a gym, a school or an employer badge, set their own rule and often accept white. If you take the photo yourself, stand a little away from a pale grey or blue wall so no shadow falls behind your head.",
    },
    {
      q: "How do I print the 10 × 15 cm sheet at a photo kiosk in France?",
      r: "Download the sheet and order a standard 10 × 15 cm print, the French equivalent of a 4 × 6 inch print, at a supermarket kiosk or online lab. Turn off automatic cropping or choose \"fit\" or \"actual size\" if offered. The sheet holds eight 35 × 45 mm photos with cut lines. Check one with a ruler when it arrives: it must measure exactly 3.5 by 4.5 cm.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service-public.gouv.fr", titre: "Quelle photo fournir pour un titre d'identité (passeport, carte d'identité...) ?", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10619", lu: "27 octobre 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Trouver les coordonnées des photographes habilités et des cabines agréées", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R62705", lu: "27 octobre 2026" },
    { editeur: "France Titres (ANTS)", titre: "Géolocaliser les photographes habilités", url: "https://passeport.ants.gouv.fr/services/geolocaliser-les-photographes-habilites", lu: "27 octobre 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Demander en ligne un nouveau permis de conduire en cas de fin de validité", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R49276", lu: "27 octobre 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Carte de séjour « vie privée et familiale » d'un étranger en France", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2209", lu: "27 octobre 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Carte Vitale", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F265", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service-public.gouv.fr", titre: "Quelle photo fournir pour un titre d'identité (passeport, carte d'identité...) ? (Which photo for an identity document)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10619", lu: "27 October 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Trouver les coordonnées des photographes habilités et des cabines agréées (Find approved photographers and booths)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R62705", lu: "27 October 2026" },
    { editeur: "France Titres (ANTS)", titre: "Géolocaliser les photographes habilités (Map of approved photographers)", url: "https://passeport.ants.gouv.fr/services/geolocaliser-les-photographes-habilites", lu: "27 October 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Carte de séjour « vie privée et familiale » d'un étranger en France (Residence permit, private and family life)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2209", lu: "27 October 2026" },
    { editeur: "Service-public.gouv.fr", titre: "Échange de permis de conduire obtenu hors Europe (UE/EEE) - installation en France (Exchanging a non-EU driving licence)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1460", lu: "27 October 2026" },
  ],
};

/** Textes de l'interface, dans les deux langues. */
const T = {
  fr: {
    nomAppli: "Recadrage de photo d'identité 35 × 45 mm",
    motsCles: "photo d'identité en ligne, photo identité 35x45, faire une photo d'identité, recadrer photo passeport, planche photo identité 10x15, format photo identité",
    choisir: "Choisir une photo",
    ouverture: "Ouverture de la photo…",
    illisible: "Photo illisible.",
    floue: "Photo de faible définition : le tirage risque d'être flou. Utilisez de préférence la photo d'origine du téléphone.",
    canvas: "Aperçu de la photo d'identité, faites glisser pour la déplacer",
    legende: "Ligne rose du haut : sommet du crâne (sans les cheveux). Bande rose : le menton doit y tomber. Faites glisser la photo avec la souris ou le doigt.",
    zoom: "Zoom",
    pct: (n: string) => `${n} %`,
    redresser: "Redresser",
    deplacer: "Déplacer :",
    haut: "Vers le haut",
    bas: "Vers le bas",
    gauche: "Vers la gauche",
    droite: "Vers la droite",
    recentrer: "Recentrer",
    gabarit: "Afficher le gabarit du visage (il n'apparaît pas sur la photo)",
    planche: "Planche 10 × 15 cm (8 photos)",
    seule: "Photo seule 35 × 45 mm",
    autre: "Autre photo",
    attente: "Ouvrez une photo : vous la cadrez sur le gabarit, puis vous téléchargez ici la planche de huit photos à tirer en 10 × 15 cm ou la photo seule de 413 × 531 pixels.",
    pret: "Alignez le visage sur le gabarit, puis téléchargez.",
    avertTitre: "À savoir :",
    avert: "carte d'identité, passeport, permis de conduire et titre de séjour en ligne exigent une photo d'un photographe habilité ou d'une cabine agréée (code e-photo). Cet outil sert aux documents qui acceptent une photo libre.",
    normes: [
      "Visage de face, regard vers l'objectif, bouche fermée, expression neutre.",
      "Tête nue, oreilles et yeux dégagés, aucune ombre sur le visage ni sur le fond.",
      "Fond uni et clair, pas blanc pour un titre d'identité.",
      "Photo de moins de 6 mois, nette, en couleurs.",
    ],
    textePlanche: "Tirage 10 × 15 cm sans recadrage · photos de 35 × 45 mm · découper le long des traits",
    fichierSeule: "identite-35x45",
    fichierPlanche: "planche-10x15",
  },
  en: {
    nomAppli: "75tools 35 × 45 mm ID photo cropper",
    motsCles: "passport photo online, french id photo 35x45, residence permit photo france, id photo print sheet 10x15, passport photo size france",
    choisir: "Choose a photo",
    ouverture: "Opening the photo…",
    illisible: "This browser cannot read the photo. For an iPhone HEIC photo, convert it first with the HEIC to JPG tool.",
    floue: "Low-resolution photo: the print may look blurry. Use the original photo from your phone if you can.",
    canvas: "ID photo preview, drag to move it",
    legende: "Top pink line: top of the head (not the hair). Pink band: the chin must fall inside it. Drag the photo with the mouse or your finger.",
    zoom: "Zoom",
    pct: (n: string) => `${n}%`,
    redresser: "Straighten",
    deplacer: "Move:",
    haut: "Up",
    bas: "Down",
    gauche: "Left",
    droite: "Right",
    recentrer: "Recentre",
    gabarit: "Show the face guide (it does not appear on the photo)",
    planche: "10 × 15 cm sheet (8 photos)",
    seule: "Single 35 × 45 mm photo",
    autre: "Another photo",
    attente: "Open a photo: you line it up with the guide, then download here a sheet of eight photos to print at 10 × 15 cm, or a single 413 × 531 pixel photo.",
    pret: "Line the face up with the guide, then download.",
    avertTitre: "Before you start:",
    avert: "French ID cards, passports, driving licences and online residence permit applications need a photo from an approved photographer or booth (e-photo code). This tool is for documents that accept a plain photo.",
    normes: [
      "Face the camera, eyes on the lens, mouth closed, neutral expression.",
      "No hat, ears and eyes visible, no shadow on the face or background.",
      "Plain light background, not white for a French ID document.",
      "Taken less than 6 months ago, sharp, in colour.",
    ],
    textePlanche: "Print at 10 × 15 cm (4 × 6 in) without cropping · 35 × 45 mm photos · cut along the lines",
    fichierSeule: "id-photo-35x45",
    fichierPlanche: "print-sheet-10x15",
  },
};

const PhotoIdentite = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [nom, setNom] = useState("photo");
  const [pret, setPret] = useState(false);
  const [zoom, setZoom] = useState(100); // % de la taille « remplit le cadre »
  const [rotation, setRotation] = useState(0); // degrés
  const [centre, setCentre] = useState({ x: L_MM / 2, y: H_MM / 2 }); // centre de l'image, en mm dans le cadre
  const [gabarit, setGabarit] = useState(true);
  const [statut, setStatut] = useState("");
  const [base, setBase] = useState(1); // mm par pixel source quand zoom = 100 %

  const img = useRef<ImageDecodee | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const glisse = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => img.current?.liberer(), []);

  /** Dessine la photo recadrée dans un contexte dont l'unité est le millimètre. */
  const dessiner = useCallback(
    (ctx: CanvasRenderingContext2D, pxParMm: number, ox = 0, oy = 0) => {
      const i = img.current;
      if (!i) return;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.beginPath();
      ctx.rect(0, 0, L_MM * pxParMm, H_MM * pxParMm);
      ctx.clip();
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(0, 0, L_MM * pxParMm, H_MM * pxParMm);
      ctx.scale(pxParMm, pxParMm);
      ctx.translate(centre.x, centre.y);
      ctx.rotate((rotation * Math.PI) / 180);
      const z = base * (zoom / 100);
      ctx.scale(z, z);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(i.source, -i.largeur / 2, -i.hauteur / 2);
      ctx.restore();
    },
    [centre, rotation, zoom, base]
  );

  useEffect(() => {
    const c = canvas.current;
    if (!pret || !c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    dessiner(ctx, PX_MM);
  }, [pret, dessiner]);

  const ouvrir = async (fichiers: File[]) => {
    const f = fichiers[0];
    if (!f) return;
    setStatut(t.ouverture);
    try {
      const i = await decoderImage(f);
      img.current?.liberer();
      img.current = i;
      setBase(Math.max(L_MM / i.largeur, H_MM / i.hauteur));
      setZoom(100);
      setRotation(0);
      setCentre({ x: L_MM / 2, y: H_MM / 2 });
      setNom(nomSansExtension(f.name));
      setPret(true);
      setStatut(Math.min(i.largeur, i.hauteur) < 600 ? t.floue : "");
    } catch (e) {
      // Les messages de la bibliothèque d'images sont en français : la page anglaise affiche le sien.
      setStatut(lang === "en" ? t.illisible : e instanceof Error ? e.message : t.illisible);
    }
  };

  const mmParPxEcran = () => {
    const c = canvas.current!;
    return L_MM / c.getBoundingClientRect().width;
  };
  const appui = (e: PE<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    glisse.current = { x: e.clientX, y: e.clientY };
  };
  const deplacement = (e: PE<HTMLCanvasElement>) => {
    if (!glisse.current) return;
    const k = mmParPxEcran();
    const dx = (e.clientX - glisse.current.x) * k;
    const dy = (e.clientY - glisse.current.y) * k;
    glisse.current = { x: e.clientX, y: e.clientY };
    setCentre((c) => ({ x: c.x + dx, y: c.y + dy }));
  };
  const relache = () => {
    glisse.current = null;
  };
  const decaler = (dx: number, dy: number) => setCentre((c) => ({ x: c.x + dx, y: c.y + dy }));

  const photoSeule = async () => {
    const c = nouveauCanvas(L_PX, H_PX);
    dessiner(c.getContext("2d")!, L_PX / L_MM);
    const blob = await fixerDpiJpeg(await canvasVersBlob(c, "image/jpeg", 0.95), DPI);
    libererCanvas(c);
    telecharger(`${nom}-${t.fichierSeule}.jpg`, blob);
  };

  const planche = async () => {
    const W = Math.round(PL_L * PX_MM); // 1772
    const H = Math.round(PL_H * PX_MM); // 1181
    const c = nouveauCanvas(W, H);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    const gl = (PL_L - (COLS * L_MM + (COLS - 1) * ECART)) / 2;
    const gh = (PL_H - (RANGS * H_MM + (RANGS - 1) * ECART)) / 2;
    for (let r = 0; r < RANGS; r++)
      for (let k = 0; k < COLS; k++) {
        const x = (gl + k * (L_MM + ECART)) * PX_MM;
        const y = (gh + r * (H_MM + ECART)) * PX_MM;
        dessiner(ctx, PX_MM, x, y);
        // trait de coupe : filet gris juste autour de la photo
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 1.5, y - 1.5, L_MM * PX_MM + 3, H_MM * PX_MM + 3);
      }
    ctx.fillStyle = "#6b7280";
    ctx.font = `${Math.round(1.6 * PX_MM)}px sans-serif`;
    ctx.fillText(t.textePlanche, gl * PX_MM, H - 0.9 * PX_MM);
    const blob = await fixerDpiJpeg(await canvasVersBlob(c, "image/jpeg", 0.95), DPI);
    libererCanvas(c);
    telecharger(`${nom}-${t.fichierPlanche}.jpg`, blob);
  };

  const curseur = (id: string, libelle: string, valeur: number, min: number, max: number, pas: number, set: (v: number) => void, affichage: string) => (
    <label className="block min-w-0" htmlFor={id}>
      <span className="flex justify-between text-sm text-neutral-300">
        <span>{libelle}</span>
        <span className="tabular-nums text-neutral-100">{affichage}</span>
      </span>
      <input id={id} type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => set(Number(e.target.value))} className="w-full h-10 accent-sky-400" />
    </label>
  );

  const fleche = (libelle: string, dx: number, dy: number, symbole: string) => (
    <button
      type="button"
      aria-label={libelle}
      onClick={() => decaler(dx, dy)}
      className="h-11 w-11 rounded-md border border-neutral-700 text-neutral-200 hover:border-neutral-500"
    >
      {symbole}
    </button>
  );

  const outil = (
    <div id="photo-outil" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] items-start">
      <div className="min-w-0 space-y-3">
        {!pret ? (
          <DepotFichiers accept="image/*" onFichiers={ouvrir} libelle={t.choisir} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] items-start">
            <div className="min-w-0 space-y-2">
              <div className="relative w-full max-w-[16rem] mx-auto sm:mx-0 aspect-[35/45] rounded-md overflow-hidden border border-neutral-700">
                <canvas
                  ref={canvas}
                  id="photo-canvas"
                  width={L_PX}
                  height={H_PX}
                  aria-label={t.canvas}
                  onPointerDown={appui}
                  onPointerMove={deplacement}
                  onPointerUp={relache}
                  onPointerCancel={relache}
                  className="absolute inset-0 w-full h-full touch-none cursor-move"
                />
                {gabarit && (
                  <svg viewBox={`0 0 ${L_MM} ${H_MM}`} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                    <ellipse
                      cx={L_MM / 2}
                      cy={(CRANE_MM + (MENTON_MIN + MENTON_MAX) / 2) / 2}
                      rx={11}
                      ry={((MENTON_MIN + MENTON_MAX) / 2 - CRANE_MM) / 2}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={0.3}
                      strokeDasharray="1 0.8"
                    />
                    <line x1={L_MM / 2} x2={L_MM / 2} y1={0} y2={H_MM} stroke="#38bdf8" strokeWidth={0.15} strokeDasharray="0.6 0.6" />
                    <line x1={4} x2={L_MM - 4} y1={CRANE_MM} y2={CRANE_MM} stroke="#f472b6" strokeWidth={0.25} />
                    <rect x={0} y={MENTON_MIN} width={L_MM} height={MENTON_MAX - MENTON_MIN} fill="#f472b6" fillOpacity={0.14} />
                    <line x1={0} x2={L_MM} y1={MENTON_MIN} y2={MENTON_MIN} stroke="#f472b6" strokeWidth={0.2} strokeDasharray="0.8 0.6" />
                    <line x1={0} x2={L_MM} y1={MENTON_MAX} y2={MENTON_MAX} stroke="#f472b6" strokeWidth={0.2} strokeDasharray="0.8 0.6" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-neutral-500 max-w-[16rem]">{t.legende}</p>
            </div>

            <div className="min-w-0 space-y-4">
              {curseur("photo-zoom", t.zoom, zoom, 100, 500, 1, setZoom, t.pct(zoom.toLocaleString(locale(lang))))}
              {curseur("photo-rotation", t.redresser, rotation, -15, 15, 0.5, setRotation, `${rotation.toLocaleString(locale(lang))}°`)}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-400 mr-1">{t.deplacer}</span>
                {fleche(t.haut, 0, -0.5, "↑")}
                {fleche(t.bas, 0, 0.5, "↓")}
                {fleche(t.gauche, -0.5, 0, "←")}
                {fleche(t.droite, 0.5, 0, "→")}
                <Bouton
                  secondaire
                  onClick={() => {
                    setCentre({ x: L_MM / 2, y: H_MM / 2 });
                    setZoom(100);
                    setRotation(0);
                  }}
                >
                  {t.recentrer}
                </Bouton>
              </div>
              <label className="flex items-center gap-3 text-sm text-neutral-300">
                <input type="checkbox" checked={gabarit} onChange={(e) => setGabarit(e.target.checked)} className="w-5 h-5 accent-sky-400 shrink-0" />
                {t.gabarit}
              </label>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                {t.normes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <p role="status" aria-live="polite" className="text-sm text-amber-300 empty:hidden">
          {statut}
        </p>
      </div>

      <div data-resultat className="min-w-0 space-y-3 lg:sticky lg:top-4">
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={planche} disabled={!pret}>
            {t.planche}
          </Bouton>
          <Bouton secondaire onClick={photoSeule} disabled={!pret}>
            {t.seule}
          </Bouton>
        </div>
        <p className="text-sm text-neutral-500">{pret ? t.pret : t.attente}</p>
        {pret && (
          <Bouton
            secondaire
            onClick={() => {
              img.current?.liberer();
              img.current = null;
              setPret(false);
              setStatut("");
            }}
          >
            {t.autre}
          </Bouton>
        )}
        <p className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-3 py-2.5 text-sm text-neutral-200">
          <strong className="text-amber-200">{t.avertTitre}</strong> {t.avert}
        </p>
      </div>
    </div>
  );

  return (
    <PageOutil
      id="photo-identite"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="MultimediaApplication"
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
    <Section titre="Photo d'identité en ligne : ce que fait l'outil, et pour quels documents">
      <p>
        Pour faire une photo d'identité en ligne au format 35 × 45 mm, ouvrez une photo prise de face devant un mur
        clair, réglez le zoom pour que le sommet du crâne touche la ligne rose du haut et que le menton tombe dans la
        bande rose, puis téléchargez la planche de huit photos à faire tirer en 10 × 15 cm, ou la photo seule de
        413 × 531 pixels pour un formulaire en ligne. Le gabarit applique la règle officielle : un visage de 32 à
        36 mm du menton au sommet du crâne, soit 70 à 80 % de la hauteur. Un tirage 10 × 15 coûte quelques
        centimes en borne, bien moins qu'une série en cabine. La photo reste sur votre appareil. La limite est
        réglementaire, pas technique : la carte d'identité, le passeport, le permis de conduire et le titre de
        séjour demandé en ligne exigent une photo faite par un photographe habilité ou une cabine agréée, avec un
        code e-photo que cet outil ne peut pas délivrer.
      </p>
    </Section>

    <Section titre="Pour quels documents une photo faite soi-même convient">
      <p>
        C'est la question à régler avant tout, car le format 35 × 45 mm ne suffit pas à rendre une photo recevable.
        D'après service-public.gouv.fr, pour la <strong>carte nationale d'identité et le passeport</strong>, « la
        photo doit être prise par un professionnel habilité ou dans une cabine utilisant un système agréé » : une
        photo faite chez soi, même parfaitement cadrée, n'est pas acceptée. Le <strong>permis de conduire</strong>{" "}
        demandé en ligne sur le site de l'ANTS réclame une photo-signature numérique ; la démarche propose aussi un
        formulaire papier de photo et signature à envoyer par courrier. Pour un <strong>titre de séjour</strong>{" "}
        demandé en ligne, il faut indiquer le code de la e-photo, « fourni par le photographe ou la cabine agréée sur
        la planche photo ». À l'inverse, la <strong>carte Vitale</strong> commandée dans l'application de
        l'Assurance Maladie se fait avec un selfie pris au téléphone.
      </p>
      <p>
        Restent les nombreux cas où une photo d'identité libre est demandée : carte de transport, badge d'entreprise
        ou d'école, carte d'étudiant, licence sportive, adhésion à une association, dossier d'inscription ou de
        candidature. C'est pour ceux-là que l'outil est utile : il évite de payer une cabine pour une photo que
        personne ne contrôlera à la norme. Pour les autres, l'annuaire officiel cité en sources donne les
        photographes et cabines agréés les plus proches.
      </p>
    </Section>

    <Section titre="Les normes de la photo d'identité">
      <p>
        Même pour un usage libre, suivre les normes des titres d'identité garantit une photo acceptée presque
        partout. Service-public.gouv.fr les détaille. Le format est de 3,5 cm de large sur 4,5 cm de haut, et le
        visage mesure entre 3,2 et 3,6 cm du bas du menton au sommet du crâne, cheveux exclus. Le fond est uni et
        clair, bleu ou gris clair par exemple : le fond blanc est interdit. La tête est nue, droite et face à
        l'objectif, le regard fixe, l'expression neutre et la bouche fermée ; visage et oreilles sont dégagés, les
        yeux ouverts et visibles, une frange étant admise si elle ne couvre pas les yeux.
      </p>
      <p>
        Les lunettes sont facultatives : monture fine qui ne masque pas les yeux, verres ni teintés ni colorés, sans
        reflet. La photo doit être nette, sans pliure ni trace, ni surexposée ni sous-exposée, sans ombre, en
        couleurs de préférence, et dater de moins de 6 mois. La position du sommet du crâne à 4,5 mm du bord, dans
        le gabarit, est un repère pratique pour centrer le visage, pas une cote imposée par la page officielle.
      </p>
    </Section>

    <Section titre="Prendre la photo et la faire tirer">
      <p>
        Demandez à quelqu'un de vous photographier à 1,5 m environ, appareil à hauteur des yeux, devant un mur gris
        clair ou bleu pâle. Placez-vous face à une fenêtre pour une lumière douce et égale, sans flash, un peu écarté
        du mur pour qu'aucune ombre ne se dessine derrière la tête. Gardez la photo d'origine du téléphone : une
        image recompressée par une messagerie peut devenir floue une fois imprimée.
      </p>
      <p>
        La photo seule fait 413 × 531 pixels, soit 35 × 45 mm à 300 points par pouce, la résolution écrite dans le
        fichier. La planche 10 × 15 cm contient huit photos séparées par des traits de coupe : commandez-la en borne
        ou sur un site de tirage, sans recadrage automatique, puis découpez aux ciseaux ou au massicot. Pour une
        version numérique plus légère, voyez <Link to="/redimensionner-image/">redimensionner une image</Link> ; pour
        un fond trop chargé, essayez d'abord de <Link to="/supprimer-fond-image/">détourer l'image</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A 35 × 45 mm passport and ID photo online: what it is good for in France">
      <p>
        To make a passport and ID photo online at the French 35 × 45 mm size, open a photo taken face-on in front of
        a light wall, zoom until the top of the head touches the top pink line and the chin falls inside the pink
        band, then download a sheet of eight photos to print at 10 × 15 cm, or a single 413 × 531 pixel photo for an
        online form. The guide follows the official rule: a face of 32 to 36 mm from chin to crown, which is 70 to
        80% of the height. A 10 × 15 print costs a few cents at a supermarket kiosk, far less than a booth
        session, and the photo stays on your device. The main limit is legal, not technical: if you live in France as
        a foreign national, your residence permit (titre de séjour) applied for online, a driving licence exchange
        and a French passport after naturalisation all need a photo from an approved photographer or booth, with an
        e-photo code this tool cannot produce.
      </p>
    </Section>

    <Section titre="When a home-made photo is accepted, and when it is not">
      <p>
        Sort this out first, because the right size alone does not make a photo acceptable. According to
        service-public.gouv.fr, for a French <strong>identity card or passport</strong> the photo must be taken by an
        approved professional or in a booth using a system approved by the Ministry of the Interior. For a{" "}
        <strong>residence permit</strong> requested on the ANEF portal (the online platform for foreign nationals),
        you enter the code of an e-photo, printed on the photo sheet by the photographer or booth. Exchanging a{" "}
        <strong>driving licence</strong> obtained outside the EU, done online with France Titres (ANTS), also asks for
        a digital photo and signature code; if you cannot get one, the procedure offers a paper photo-signature form
        to post. Approved booths are found in many supermarkets, stations and town centres, and the ANTS map in the
        sources lists them.
      </p>
      <p>
        Many other places ask for a plain ID photo with no code: a Navigo transport pass in Paris, a university or
        school card, a work badge, a gym or sports club membership, a library card, an application file. That is
        where this tool saves a trip to the booth. Your home country's consulate sets its own rules for your
        national passport, often a different size, so check them separately.
      </p>
    </Section>

    <Section titre="French ID photo rules in brief">
      <p>
        Following the French identity-document standard gives you a photo accepted almost everywhere. The photo is
        3.5 cm wide and 4.5 cm high; the face measures 3.2 to 3.6 cm from the bottom of the chin to the top of the
        head, hair excluded. The background is plain and light, such as light blue or light grey, and never white.
        Your head is bare, straight and facing the camera, with a neutral expression, mouth closed, eyes open and
        visible, ears and face uncovered. Glasses are optional; if you keep them, no thick frame, no tinted lenses
        and no reflections. The photo must be sharp, evenly lit, preferably in colour and less than 6 months old.
      </p>
    </Section>

    <Section titre="Taking the photo and printing it">
      <p>
        Ask someone to take the picture from about 1.5 m, camera at eye level, in front of a pale grey or blue wall.
        Face a window for soft, even light, with no flash, and stand a little away from the wall so no shadow falls
        behind your head. Keep the original file from the phone: an image squeezed by a messaging app can print
        blurry.
      </p>
      <p>
        The single photo is 413 × 531 pixels, which is 35 × 45 mm at 300 dots per inch, the resolution stored in the
        file. The 10 × 15 cm sheet holds eight photos with cut lines: order it at a kiosk or from an online lab with
        automatic cropping turned off, then cut with scissors. For a lighter digital copy, use{" "}
        <Link to="/en/resize-image/">resize an image</Link>; if the background is too busy, try to{" "}
        <Link to="/en/remove-background/">remove the background</Link> first.
      </p>
    </Section>
  </>
);

export default PhotoIdentite;
