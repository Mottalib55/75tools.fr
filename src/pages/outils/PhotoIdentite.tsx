import { PointerEvent as PE, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, DepotFichiers } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { canvasVersBlob, nomSansExtension, telecharger } from "@/lib/fichiers";
import { ImageDecodee, decoderImage, fixerDpiJpeg, libererCanvas, nouveauCanvas } from "@/lib/image-lot";

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

const FAQ: QuestionFaq[] = [
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
];

const PhotoIdentite = () => {
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
    setStatut("Ouverture de la photo…");
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
      setStatut(
        Math.min(i.largeur, i.hauteur) < 600
          ? "Photo de faible définition : le tirage risque d'être flou. Utilisez de préférence la photo d'origine du téléphone."
          : ""
      );
    } catch (e) {
      setStatut(e instanceof Error ? e.message : "Photo illisible.");
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
    telecharger(`${nom}-identite-35x45.jpg`, blob);
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
    ctx.fillText("Tirage 10 × 15 cm sans recadrage · photos de 35 × 45 mm · découper le long des traits", gl * PX_MM, H - 0.9 * PX_MM);
    const blob = await fixerDpiJpeg(await canvasVersBlob(c, "image/jpeg", 0.95), DPI);
    libererCanvas(c);
    telecharger(`${nom}-planche-10x15.jpg`, blob);
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

  return (
    <PageOutil
      href="/photo-identite/"
      titre="Photo d'identité en ligne : recadrage 35 x 45 mm et planche"
      description="Photo d'identité en ligne : recadrez au format 35 x 45 mm avec un gabarit de visage, puis téléchargez la photo ou une planche 10 x 15 à faire tirer. Gratuit."
      motsCles="photo d'identité en ligne, photo identité 35x45, faire une photo d'identité, recadrer photo passeport, planche photo identité 10x15, format photo identité"
      nomAppli="Recadrage de photo d'identité 35 × 45 mm"
      h1="Recadrer une photo d'identité au format 35 × 45 mm"
      chapeau="Placez votre visage dans le gabarit, puis téléchargez une photo de 413 × 531 pixels (300 dpi) ou une planche de huit photos à tirer en 10 × 15 cm. À lire avant : ce format ne suffit pas pour tous les documents."
      faq={FAQ}
      sources={[
        {
          editeur: "Service-public.gouv.fr",
          titre: "Quelle photo fournir pour un titre d'identité (passeport, carte d'identité...) ? (vérifié le 8 octobre 2026)",
          url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F10619",
          lu: "27 octobre 2026",
        },
        {
          editeur: "Service-public.gouv.fr",
          titre: "Demander en ligne un nouveau permis de conduire en cas de fin de validité",
          url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R49276",
          lu: "27 octobre 2026",
        },
        {
          editeur: "Service-public.gouv.fr",
          titre: "Carte de séjour « vie privée et familiale » d'un étranger en France",
          url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2209",
          lu: "27 octobre 2026",
        },
        {
          editeur: "Service-public.gouv.fr",
          titre: "Trouver les coordonnées des photographes habilités et des cabines agréées",
          url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R62705",
          lu: "27 octobre 2026",
        },
        {
          editeur: "Service-public.gouv.fr",
          titre: "Carte Vitale (vérifié le 29 août 2026)",
          url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F265",
          lu: "27 octobre 2026",
        },
      ]}
    >
      <p className="rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-sm text-neutral-200 mb-5">
        <strong className="text-amber-200">À savoir :</strong> pour la carte d'identité et le passeport, la photo doit
        être prise par un photographe habilité ou une cabine agréée ; le permis de conduire et le titre de séjour
        demandés en ligne exigent un code ePhoto, que cet outil ne délivre pas. Il sert aux documents qui acceptent une
        photo libre (détails plus bas).
      </p>

      <div id="photo-outil" className="space-y-4">
        {!pret && <DepotFichiers accept="image/*" onFichiers={ouvrir} libelle="Choisir une photo" />}
        <p role="status" aria-live="polite" className="text-sm text-amber-300 empty:hidden">
          {statut}
        </p>

        {pret && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] items-start">
            <div className="min-w-0 space-y-2">
              <div className="relative w-full max-w-[20rem] mx-auto md:mx-0 aspect-[35/45] rounded-md overflow-hidden border border-neutral-700">
                <canvas
                  ref={canvas}
                  id="photo-canvas"
                  width={L_PX}
                  height={H_PX}
                  aria-label="Aperçu de la photo d'identité, faites glisser pour la déplacer"
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
              <p className="text-xs text-neutral-500 max-w-[20rem]">
                Ligne rose du haut : sommet du crâne (sans les cheveux). Bande rose : le menton doit y tomber. Faites
                glisser la photo avec la souris ou le doigt.
              </p>
            </div>

            <div className="min-w-0 space-y-4">
              {curseur("photo-zoom", "Zoom", zoom, 100, 500, 1, setZoom, `${zoom} %`)}
              {curseur("photo-rotation", "Redresser", rotation, -15, 15, 0.5, setRotation, `${rotation.toLocaleString("fr-FR")}°`)}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-400 mr-1">Déplacer :</span>
                {fleche("Vers le haut", 0, -0.5, "↑")}
                {fleche("Vers le bas", 0, 0.5, "↓")}
                {fleche("Vers la gauche", -0.5, 0, "←")}
                {fleche("Vers la droite", 0.5, 0, "→")}
                <Bouton secondaire onClick={() => { setCentre({ x: L_MM / 2, y: H_MM / 2 }); setZoom(100); setRotation(0); }}>
                  Recentrer
                </Bouton>
              </div>
              <label className="flex items-center gap-3 text-sm text-neutral-300">
                <input type="checkbox" checked={gabarit} onChange={(e) => setGabarit(e.target.checked)} className="w-5 h-5 accent-sky-400" />
                Afficher le gabarit du visage (il n'apparaît pas sur la photo)
              </label>
              <div className="flex flex-wrap gap-2">
                <Bouton onClick={planche}>Planche 10 × 15 cm (8 photos)</Bouton>
                <Bouton secondaire onClick={photoSeule}>
                  Photo seule 35 × 45 mm
                </Bouton>
                <Bouton
                  secondaire
                  onClick={() => {
                    img.current?.liberer();
                    img.current = null;
                    setPret(false);
                    setStatut("");
                  }}
                >
                  Autre photo
                </Bouton>
              </div>
              <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1">
                <li>Visage de face, regard vers l'objectif, bouche fermée, expression neutre.</li>
                <li>Tête nue, oreilles et yeux dégagés, aucune ombre sur le visage ni sur le fond.</li>
                <li>Fond uni et clair, pas blanc pour un titre d'identité.</li>
                <li>Photo de moins de 6 mois, nette, en couleurs.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Section titre="Pour quels documents une photo faite soi-même convient">
        <p>
          C'est la question à régler avant tout, car le format 35 × 45 mm ne suffit pas à rendre une photo
          recevable. D'après service-public.gouv.fr :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Carte nationale d'identité et passeport</strong> : « la photo doit être prise par un
            professionnel habilité ou dans une cabine utilisant un système agréé ». Une photo faite chez soi, même
            parfaitement cadrée, n'est pas acceptée.
          </li>
          <li>
            <strong>Permis de conduire</strong> (démarche en ligne sur le site de l'ANTS) : la démarche demande une
            photo-signature numérique. Le site propose aussi, à la fin, un formulaire de dépôt de photo et
            signature à envoyer par courrier.
          </li>
          <li>
            <strong>Titre de séjour demandé en ligne</strong> : il faut indiquer le code de la e-photo, « fourni par
            le photographe ou la cabine agréée sur la planche photo ».
          </li>
          <li>
            <strong>Carte Vitale</strong> commandée dans l'application de l'Assurance Maladie : service-public.gouv.fr
            indique qu'on peut se prendre en selfie depuis le téléphone, sans passer par un photographe.
          </li>
        </ul>
        <p>
          Restent les nombreux cas où une photo d'identité « libre » est demandée : carte de transport, badge
          d'entreprise ou d'école, licence sportive, adhésion à une association, dossier d'inscription,
          candidature. C'est pour ceux-là que l'outil est utile : il évite de payer une cabine pour une photo que
          personne ne contrôlera à la norme. L'annuaire officiel des photographes habilités et cabines agréées,
          cité en sources, permet de trouver les plus proches pour les autres cas.
        </p>
      </Section>

      <Section titre="Les normes de la photo d'identité">
        <p>
          Même pour un usage libre, suivre les normes des titres d'identité garantit une photo acceptée presque
          partout. Service-public.gouv.fr les détaille (page vérifiée le 8 octobre 2026) :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Format</strong> : 3,5 cm de large sur 4,5 cm de haut.</li>
          <li>
            <strong>Taille du visage</strong> : entre 3,2 et 3,6 cm du bas du menton au sommet du crâne, cheveux
            exclus, soit 70 à 80 % de la hauteur de la photo.
          </li>
          <li><strong>Fond</strong> : uni et clair, bleu ou gris clair par exemple ; le fond blanc est interdit.</li>
          <li>
            <strong>Pose</strong> : tête nue, droite, face à l'objectif ; regard fixe, expression neutre, bouche
            fermée ; visage et oreilles dégagés, yeux ouverts et visibles. Une frange est admise si elle ne couvre
            pas les yeux.
          </li>
          <li>
            <strong>Lunettes</strong> : facultatives ; monture fine qui ne masque pas les yeux, verres ni teintés ni
            colorés, sans reflet.
          </li>
          <li>
            <strong>Qualité</strong> : photo nette, sans pliure ni trace, ni surexposée ni sous-exposée, sans ombre ;
            la couleur est fortement recommandée.
          </li>
          <li><strong>Ancienneté</strong> : moins de 6 mois.</li>
        </ul>
        <p>
          Le gabarit de l'outil applique la règle des 32 à 36 mm : la ligne du haut marque le sommet du crâne, la
          bande rose la zone où doit tomber le menton. La position du sommet du crâne, à 4,5 mm du bord, est un
          repère pratique pour centrer le visage, pas une cote imposée par la page officielle.
        </p>
      </Section>

      <Section titre="Prendre la photo et la faire tirer">
        <p>
          Demandez à quelqu'un de vous photographier à 1,5 m environ, appareil à hauteur des yeux, devant un mur
          gris clair ou bleu pâle. Placez-vous face à une fenêtre pour une lumière douce et égale, sans flash, et
          un peu écarté du mur pour qu'aucune ombre ne se dessine derrière la tête. Gardez la photo d'origine du
          téléphone : une image recompressée par une messagerie peut devenir floue une fois imprimée.
        </p>
        <p>
          Dans l'outil, réglez le zoom pour que le sommet du crâne touche la ligne du haut et que le menton tombe
          dans la bande rose, puis centrez le nez sur l'axe vertical. Le bouton « Redresser » corrige une tête
          légèrement penchée. La photo seule fait 413 × 531 pixels, soit 35 × 45 mm à 300 points par pouce, la
          résolution écrite dans le fichier.
        </p>
        <p>
          La planche 10 × 15 cm, au format standard des tirages photo, contient huit photos séparées par des
          traits de coupe. Commandez-la en borne ou sur un site de tirage, sans recadrage automatique, puis
          découpez aux ciseaux ou au massicot. Pour une simple version numérique plus légère, voyez{" "}
          <Link to="/redimensionner-image/">redimensionner une image</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default PhotoIdentite;
