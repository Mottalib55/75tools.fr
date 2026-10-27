import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Printer, Trash2 } from "lucide-react";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { CvFeuille } from "@/components/outils/CvApercu";
import {
  COULEURS_ACCENT,
  CV_EXEMPLE,
  CV_VIDE,
  Cv,
  Experience,
  Formation,
  Langue,
  ModeleVisuel,
  NIVEAUX_CECRL,
  ecrireBrouillon,
  effacerBrouillon,
  lireBrouillon,
} from "@/lib/cv-modele";
import { cn } from "@/lib/utils";

const LU = "27 octobre 2026";

const FAQ: QuestionFaq[] = [
  {
    q: "Je débute, mon CV tient sur une demi-page : je l'allonge comment ?",
    r: "Ne remplissez pas pour remplir. Détaillez plutôt ce que vous avez déjà : stages, alternance, jobs d'été, projets d'études, bénévolat ou responsabilités associatives sont de vraies expériences, à décrire avec un verbe d'action et un résultat. Ajoutez un profil de trois lignes qui dit ce que vous cherchez. Une page bien aérée vaut mieux qu'une page et demie diluée.",
  },
  {
    q: "Faut-il mettre une photo sur un CV en France ?",
    r: "Ce n'est pas obligatoire, et beaucoup de recruteurs ne l'attendent pas. L'employeur ne peut vous demander que des informations en lien direct et nécessaire avec le poste, et l'apparence physique fait partie des critères de discrimination interdits. Si vous en mettez une, choisissez une photo récente et neutre. Ici, elle reste sur votre appareil : elle n'est ni envoyée ni gardée dans le brouillon.",
  },
  {
    q: "Comment indiquer mon niveau d'anglais sans écrire « courant » ?",
    r: "Utilisez l'échelle européenne CECRL, de A1 à C2, que les recruteurs comprennent dans toute l'Europe : B1 permet de se débrouiller dans la plupart des situations de voyage, B2 de discuter avec un locuteur natif et de défendre un avis, C1 de s'exprimer spontanément et couramment. Si vous avez passé un test (TOEIC, IELTS, Cambridge), ajoutez le score dans la ligne de la langue.",
  },
  {
    q: "Mon CV PDF sera-t-il lu correctement par les logiciels de recrutement ?",
    r: "Le PDF produit par la fonction d'impression garde du vrai texte, sélectionnable, que les logiciels de tri de candidatures savent extraire, contrairement à un CV en image. Pour un dépôt sur un site de recrutement, préférez le modèle classique à une colonne : l'ordre de lecture y est le plus simple, et les intitulés de rubrique sont ceux que ces logiciels reconnaissent.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Légifrance", titre: "Code du travail, article L1221-6 (informations demandées au candidat)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900845/", lu: LU },
  { editeur: "Service Public", titre: "Discrimination (vérifié le 10 mars 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19448", lu: LU },
  { editeur: "Europass (Commission européenne)", titre: "Cadre européen commun de référence pour les langues : grille d'autoévaluation", url: "https://europass.europa.eu/fr/common-european-framework-reference-language-skills", lu: LU },
];

/* ------------------------------------------------------------------ champs */

const Champ2 = ({ label, value, onChange, placeholder, type = "text", className, name, aide, autoComplete }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  name?: string;
  aide?: string;
  autoComplete?: string;
}) => (
  <label className={cn("block min-w-0", className)}>
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <input type={type} name={name} value={value} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className={classeChamp} />
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);

const Zone2 = ({ label, value, onChange, placeholder, lignes = 3, aide, name }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  lignes?: number;
  aide?: string;
  name?: string;
}) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <textarea rows={lignes} name={name} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={classeZoneTexte} />
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);

const Bloc = ({ titre, children }: { titre: string; children: ReactNode }) => (
  <fieldset className="border border-neutral-800 rounded-lg p-4 sm:p-5 min-w-0">
    <legend className="px-2 text-white font-semibold">{titre}</legend>
    <div className="space-y-4">{children}</div>
  </fieldset>
);

const BoutonIcone = ({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; danger?: boolean }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={cn("h-9 w-9 grid place-items-center rounded border border-neutral-700 disabled:opacity-30", danger ? "hover:border-red-400 hover:text-red-300" : "hover:border-neutral-500")}
  >
    {children}
  </button>
);

/** Liste d'entrées réordonnables (expériences, formations, langues). */
function Liste<T extends { id: number }>({ items, setItems, nouveau, rendu, libelle, ajout }: {
  items: T[];
  setItems: (f: (x: T[]) => T[]) => void;
  nouveau: (id: number) => T;
  rendu: (item: T, maj: (k: keyof T, v: string) => void, i: number) => ReactNode;
  libelle: string;
  ajout: string;
}) {
  const maj = (id: number) => (k: keyof T, v: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const deplacer = (i: number, s: -1 | 1) =>
    setItems((xs) => {
      const j = i + s;
      if (j < 0 || j >= xs.length) return xs;
      const c = [...xs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  return (
    <>
      <ol className="space-y-4">
        {items.map((it, i) => (
          <li key={it.id} className="rounded-md border border-neutral-800 p-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm text-neutral-400">
                {libelle} {i + 1}
              </span>
              <span className="flex gap-1">
                <BoutonIcone label={`Monter : ${libelle.toLowerCase()} ${i + 1}`} disabled={i === 0} onClick={() => deplacer(i, -1)}>
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </BoutonIcone>
                <BoutonIcone label={`Descendre : ${libelle.toLowerCase()} ${i + 1}`} disabled={i === items.length - 1} onClick={() => deplacer(i, 1)}>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </BoutonIcone>
                <BoutonIcone label={`Supprimer : ${libelle.toLowerCase()} ${i + 1}`} danger onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}>
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </BoutonIcone>
              </span>
            </div>
            {rendu(it, maj(it.id), i)}
          </li>
        ))}
      </ol>
      <Bouton secondaire onClick={() => setItems((xs) => [...xs, nouveau(Math.max(0, ...xs.map((x) => x.id)) + 1)])}>
        <span className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4" aria-hidden="true" /> {ajout}
        </span>
      </Bouton>
    </>
  );
}

const MODELES: [ModeleVisuel, string][] = [
  ["classique", "Classique, une colonne"],
  ["colonnes", "Deux colonnes"],
  ["moderne", "Moderne, couleur"],
];

const STYLE_IMPRESSION = `
@media print {
  @page { size: A4; margin: 0; }
  html, body, #root { background: #fff !important; }
  main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
  .cv-ecran { display: none !important; }
  .cv-outil { display: block !important; }
  .cv-colonne { position: static !important; }
  .cv-zone { height: auto !important; overflow: visible !important; border: 0 !important; box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
  .cv-echelle { transform: none !important; }
  .cv-feuille { min-height: 1110px !important; }
  .cv-feuille, .cv-feuille * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cv-entree { break-inside: avoid; }
}`;

/* ------------------------------------------------------------------ page */

const ModeleCv = () => {
  const [cv, setCv] = useState<Cv>(CV_EXEMPLE);
  const [photo, setPhoto] = useState("");
  const [charge, setCharge] = useState(false);
  const [statut, setStatut] = useState("");
  const zone = useRef<HTMLDivElement>(null);
  const feuille = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState(0.5);
  const [hauteur, setHauteur] = useState(1123);
  const champPhoto = useRef<HTMLInputElement>(null);

  const maj = <K extends keyof Cv>(k: K) => (v: Cv[K]) => setCv((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const b = lireBrouillon();
    if (b) {
      setCv(b);
      setStatut("Brouillon retrouvé dans ce navigateur.");
    }
    setCharge(true);
  }, []);

  useEffect(() => {
    if (charge) ecrireBrouillon(cv);
  }, [cv, charge]);

  useEffect(() => {
    const z = zone.current;
    const f = feuille.current;
    if (!z || !f || typeof ResizeObserver === "undefined") return;
    const maj2 = () => {
      setEchelle(Math.min(1, z.clientWidth / 794));
      setHauteur(f.offsetHeight || 1123);
    };
    const ro = new ResizeObserver(maj2);
    ro.observe(z);
    ro.observe(f);
    maj2();
    return () => ro.disconnect();
  }, []);

  const choisirPhoto = (fichier?: File) => {
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setStatut("Ce fichier n'est pas une image : choisissez un JPG, un PNG ou un WebP.");
      return;
    }
    const lecteur = new FileReader();
    lecteur.onload = () => {
      setPhoto(String(lecteur.result));
      setStatut("Photo ajoutée. Elle reste sur votre appareil et n'est pas gardée dans le brouillon.");
    };
    lecteur.onerror = () => setStatut("Impossible de lire cette image.");
    lecteur.readAsDataURL(fichier);
  };

  const imprimer = () => {
    const ancien = document.title;
    const nom = [cv.prenom, cv.nom].map((x) => x.trim()).filter(Boolean).join(" ");
    document.title = nom ? `CV ${nom}` : "CV";
    const retablir = () => {
      document.title = ancien;
      window.removeEventListener("afterprint", retablir);
    };
    window.addEventListener("afterprint", retablir);
    window.print();
    setTimeout(retablir, 3000);
  };

  return (
    <PageOutil
      href="/modele-cv/"
      titre="Modèle CV gratuit : créer un CV en ligne, export PDF"
      description="Modèle CV gratuit en trois mises en page : remplissez expériences, formations, compétences et langues CECRL, photo facultative, puis enregistrez-le en PDF A4."
      motsCles="modèle cv gratuit, créer un cv gratuit en ligne, générateur de cv pdf, cv pdf, modèle de cv"
      nomAppli="Modèle de CV en ligne"
      categorieAppli="BusinessApplication"
      h1="Créer un CV gratuit en ligne, prêt à enregistrer en PDF"
      chapeau="Remplissez les rubriques, choisissez l'un des trois modèles et voyez le CV se composer en direct sur une page A4. Le brouillon reste dans votre navigateur ; la photo éventuelle n'est jamais envoyée."
      faq={FAQ}
      sources={SOURCES}
    >
      <style>{STYLE_IMPRESSION}</style>
      <div className="cv-outil grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] items-start">
        <div className="cv-ecran space-y-5 min-w-0">
          <Bloc titre="Modèle">
            <div role="radiogroup" aria-label="Modèle de CV" className="flex flex-wrap gap-2">
              {MODELES.map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={cv.modele === v}
                  onClick={() => maj("modele")(v)}
                  className={cn(
                    "h-11 px-4 rounded-md text-sm border",
                    cv.modele === v ? "border-sky-400 bg-sky-400/10 text-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <a href="#apercu-cv" className="xl:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
              Voir l'aperçu et enregistrer en PDF
            </a>
            {cv.modele !== "classique" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-300 mr-1">Couleur d'accent</span>
                {COULEURS_ACCENT.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Couleur ${c}`}
                    aria-pressed={cv.accent === c}
                    onClick={() => maj("accent")(c)}
                    className={cn("h-9 w-9 rounded-full border-2", cv.accent === c ? "border-white" : "border-transparent")}
                    style={{ background: c }}
                  />
                ))}
                <label className="inline-flex items-center gap-2 text-sm text-neutral-400">
                  <input type="color" value={cv.accent} onChange={(e) => maj("accent")(e.target.value)} className="h-9 w-12 bg-transparent" aria-label="Autre couleur" />
                  autre
                </label>
              </div>
            )}
          </Bloc>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Contenu du CV">
            <Bloc titre="Identité et coordonnées">
              <div className="grid gap-4 sm:grid-cols-2">
                <Champ2 label="Prénom" name="prenom" value={cv.prenom} onChange={maj("prenom")} autoComplete="given-name" />
                <Champ2 label="Nom" name="nom" value={cv.nom} onChange={maj("nom")} autoComplete="family-name" />
                <Champ2 label="Titre du CV" name="titre" value={cv.titre} onChange={maj("titre")} placeholder="Comptable confirmé" aide="L'intitulé du poste visé, tel qu'il figure dans l'annonce." className="sm:col-span-2" />
                <Champ2 label="Téléphone" type="tel" value={cv.telephone} onChange={maj("telephone")} autoComplete="tel" />
                <Champ2 label="E-mail" type="email" value={cv.email} onChange={maj("email")} autoComplete="email" />
                <Champ2 label="Ville" value={cv.ville} onChange={maj("ville")} autoComplete="address-level2" aide="La ville suffit, l'adresse complète n'est pas utile." />
                <Champ2 label="Lien (LinkedIn, portfolio)" value={cv.lien} onChange={maj("lien")} />
                <Champ2 label="Permis, mobilité, disponibilité" value={cv.mobilite} onChange={maj("mobilite")} placeholder="Permis B, disponible en janvier" className="sm:col-span-2" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Bouton secondaire onClick={() => champPhoto.current?.click()}>
                  {photo ? "Changer la photo" : "Ajouter une photo (facultatif)"}
                </Bouton>
                {photo && (
                  <Bouton secondaire onClick={() => setPhoto("")}>
                    Retirer la photo
                  </Bouton>
                )}
                <input ref={champPhoto} type="file" accept="image/*" className="hidden" tabIndex={-1} aria-hidden="true" data-champ="photo" onChange={(e) => { choisirPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                <span className="text-xs text-neutral-500">Lue par votre navigateur, jamais envoyée.</span>
              </div>
            </Bloc>

            <Bloc titre="Profil">
              <Zone2
                label="Trois lignes sur vous"
                name="profil"
                value={cv.profil}
                onChange={maj("profil")}
                lignes={4}
                aide={`${cv.profil.length} caractères. Visez 250 à 400 : qui vous êtes, ce que vous savez faire, ce que vous cherchez.`}
              />
            </Bloc>

            <Bloc titre="Expériences">
              <Liste<Experience>
                items={cv.experiences}
                setItems={(f) => setCv((x) => ({ ...x, experiences: f(x.experiences) }))}
                nouveau={(id) => ({ id, poste: "", employeur: "", lieu: "", debut: "", fin: "", description: "" })}
                libelle="Expérience"
                ajout="Ajouter une expérience"
                rendu={(e, m, i) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ2 label="Poste" name={`poste-${i}`} value={e.poste} onChange={(v) => m("poste", v)} />
                    <Champ2 label="Employeur" value={e.employeur} onChange={(v) => m("employeur", v)} />
                    <Champ2 label="Lieu" value={e.lieu} onChange={(v) => m("lieu", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Champ2 label="Début" value={e.debut} onChange={(v) => m("debut", v)} placeholder="2022" />
                      <Champ2 label="Fin" value={e.fin} onChange={(v) => m("fin", v)} placeholder="aujourd'hui" />
                    </div>
                    <div className="sm:col-span-2">
                      <Zone2 label="Réalisations (une par ligne)" value={e.description} onChange={(v) => m("description", v)} lignes={3} aide="Commencez par un verbe d'action et chiffrez quand c'est possible." />
                    </div>
                  </div>
                )}
              />
            </Bloc>

            <Bloc titre="Formations">
              <Liste<Formation>
                items={cv.formations}
                setItems={(f) => setCv((x) => ({ ...x, formations: f(x.formations) }))}
                nouveau={(id) => ({ id, diplome: "", etablissement: "", lieu: "", debut: "", fin: "", description: "" })}
                libelle="Formation"
                ajout="Ajouter une formation"
                rendu={(f, m) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ2 label="Diplôme ou formation" value={f.diplome} onChange={(v) => m("diplome", v)} />
                    <Champ2 label="Établissement" value={f.etablissement} onChange={(v) => m("etablissement", v)} />
                    <Champ2 label="Lieu" value={f.lieu} onChange={(v) => m("lieu", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Champ2 label="Début" value={f.debut} onChange={(v) => m("debut", v)} />
                      <Champ2 label="Fin" value={f.fin} onChange={(v) => m("fin", v)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Zone2 label="Détails (facultatif)" value={f.description} onChange={(v) => m("description", v)} lignes={2} placeholder="Mention, spécialité, mémoire" />
                    </div>
                  </div>
                )}
              />
            </Bloc>

            <Bloc titre="Compétences, langues et centres d'intérêt">
              <Zone2 label="Compétences (une par ligne)" name="competences" value={cv.competences} onChange={maj("competences")} lignes={5} aide="Reprenez les mots de l'annonce quand ils correspondent à ce que vous savez faire." />
              <Liste<Langue>
                items={cv.langues}
                setItems={(f) => setCv((x) => ({ ...x, langues: f(x.langues) }))}
                nouveau={(id) => ({ id, langue: "", niveau: "B2" })}
                libelle="Langue"
                ajout="Ajouter une langue"
                rendu={(l, m) => (
                  <div className="grid gap-3 grid-cols-2">
                    <Champ2 label="Langue" value={l.langue} onChange={(v) => m("langue", v)} />
                    <label className="block min-w-0">
                      <span className="block text-sm text-neutral-300 mb-1">Niveau (CECRL)</span>
                      <select value={l.niveau} onChange={(e) => m("niveau", e.target.value)} className={classeSelect}>
                        {NIVEAUX_CECRL.map(([v, t]) => (
                          <option key={v} value={v}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              />
              <Zone2 label="Centres d'intérêt" value={cv.interets} onChange={maj("interets")} lignes={2} aide="Deux ou trois, précis : « trail, 3 courses par an » dit plus que « sport »." />
            </Bloc>
          </form>
        </div>

        <div id="apercu-cv" className="cv-colonne xl:sticky xl:top-4 space-y-3 min-w-0 scroll-mt-4">
          <div className="cv-ecran rounded-lg border border-neutral-800 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={imprimer}>
                <span className="inline-flex items-center gap-2">
                  <Printer className="w-4 h-4" aria-hidden="true" /> Enregistrer en PDF
                </span>
              </Bouton>
              <Bouton
                secondaire
                onClick={() => {
                  setCv(CV_EXEMPLE);
                  setStatut("Exemple rechargé.");
                }}
              >
                Exemple
              </Bouton>
              <Bouton
                secondaire
                onClick={() => {
                  effacerBrouillon();
                  setCv(CV_VIDE);
                  setPhoto("");
                  setStatut("CV vidé et brouillon effacé de ce navigateur.");
                }}
              >
                Tout effacer
              </Bouton>
            </div>
            <p className="text-xs text-neutral-400">
              Dans la fenêtre d'impression, choisissez la destination <strong className="text-neutral-200">« Enregistrer au format PDF »</strong>{" "}
              (sur Mac : menu « PDF » puis « Enregistrer au format PDF »). Laissez les marges par défaut ; si les couleurs
              manquent, cochez « Graphiques d'arrière-plan ».
            </p>
            <p role="status" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
              {statut}
            </p>
          </div>
          <div ref={zone} className="cv-zone w-full overflow-hidden rounded-md shadow-xl bg-white" style={{ height: Math.ceil(hauteur * echelle) }}>
            <div ref={feuille} className="cv-echelle origin-top-left w-[794px]" style={{ transform: `scale(${echelle})` }}>
              <CvFeuille cv={cv} photo={photo} />
            </div>
          </div>
          <p className="cv-ecran text-xs text-neutral-500">
            {hauteur > 1130 ? "Le CV dépasse une page : il sera imprimé sur deux pages." : "Le CV tient sur une page A4."}
          </p>
        </div>
      </div>

      <Section titre="Rubriques, longueur et ordre">
        <p>
          Un recruteur parcourt d'abord le haut du CV : nom, <strong>intitulé du poste visé</strong> et coordonnées
          doivent se lire en un coup d'œil. Viennent ensuite un <strong>profil</strong> de trois lignes, puis les
          expériences de la plus récente à la plus ancienne, les formations, les compétences, les langues et, si
          elles disent quelque chose de vous, deux ou trois activités.
        </p>
        <p>
          <strong>Une page</strong> suffit en début de carrière et jusqu'à quelques années d'expérience ; au-delà,
          une deuxième page se justifie si elle contient des expériences utiles pour le poste. Si l'aperçu annonce
          deux pages pour un premier emploi, resserrez : supprimez les tâches évidentes, regroupez les petits jobs,
          raccourcissez le profil. Pour un jeune diplômé, la formation peut passer avant l'expérience : utilisez les
          flèches pour réordonner.
        </p>
        <p>
          Chaque réalisation commence par un <strong>verbe d'action</strong> au passé (piloté, conçu, négocié,
          réduit, formé, organisé, rédigé) et donne, quand c'est possible, un chiffre : un budget, un volume, un
          délai, un résultat. « Organisé deux salons par an, budget de 40 000 € » en dit plus que « participation à
          l'organisation d'événements ».
        </p>
      </Section>

      <Section titre="Ce que vous n'êtes pas obligé d'écrire">
        <p>
          En France, la photo, l'âge ou la date de naissance, la nationalité et la situation de famille ne sont pas
          des rubriques obligatoires. L'article L1221-6 du Code du travail limite ce qu'un employeur peut demander :
          les informations demandées au candidat ne peuvent avoir pour finalité que d'apprécier sa capacité à occuper
          l'emploi proposé ou ses aptitudes professionnelles, et doivent présenter un lien direct et nécessaire avec
          cet emploi. En contrepartie, le candidat est tenu de répondre de bonne foi.
        </p>
        <p>
          L'âge, la situation de famille, la grossesse, l'apparence physique, l'origine, le lieu de résidence ou
          l'état de santé font partie des critères sur lesquels il est interdit de fonder une différence de
          traitement. Selon Service Public, l'auteur d'une discrimination risque jusqu'à 3 ans d'emprisonnement et
          45 000 € d'amende, et une victime peut saisir gratuitement le Défenseur des droits, notamment au 3928.
        </p>
        <p>
          Indiquez la ville plutôt que l'adresse complète, et ajoutez la mobilité ou le permis seulement s'ils
          servent le poste (un commercial itinérant, un poste sur plusieurs sites).
        </p>
      </Section>

      <Section titre="Un PDF propre, lisible par les logiciels de recrutement">
        <p>
          Le bouton « Enregistrer en PDF » ouvre la fenêtre d'impression de votre navigateur, réglée pour une page A4
          sans marges ajoutées : seule la feuille du CV est imprimée, sans le site autour. Le PDF obtenu contient du
          vrai texte, que l'on peut sélectionner, copier, et que les logiciels de tri de candidatures savent lire. Un
          CV exporté en image ou en capture d'écran perd cette propriété.
        </p>
        <p>
          Les trois modèles reprennent le même contenu : le <strong>classique</strong>, en une colonne et en
          caractères à empattement, convient aux dépôts en ligne et aux secteurs traditionnels ; le modèle{" "}
          <strong>deux colonnes</strong> range coordonnées, compétences et langues dans une barre latérale ; le{" "}
          <strong>moderne</strong> ouvre sur un bandeau de couleur, à choisir sobre. Les niveaux de langue suivent
          l'échelle européenne CECRL, de A1 (découverte) à C2 (maîtrise). Votre brouillon est enregistré
          automatiquement dans ce navigateur, sans la photo ; pour un courrier d'accompagnement, la{" "}
          <Link to="/signature-mail/">signature mail</Link> de 75tools complète bien l'envoi.
        </p>
      </Section>
    </PageOutil>
  );
};

export default ModeleCv;
