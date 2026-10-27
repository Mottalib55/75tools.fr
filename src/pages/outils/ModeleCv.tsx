import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Printer, Trash2 } from "lucide-react";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Bouton, Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { CvFeuille } from "@/components/outils/CvApercu";
import {
  COULEURS_ACCENT,
  CV_EXEMPLE,
  CV_EXEMPLE_EN,
  CV_VIDE,
  Cv,
  Experience,
  Formation,
  LangueCv,
  LangueDoc,
  ModeleVisuel,
  ecrireBrouillon,
  effacerBrouillon,
  lireBrouillon,
  niveaux,
} from "@/lib/cv-modele";
import { locale, type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
    {
      q: "L'aperçu annonce deux pages alors que je débute : que retirer en premier ?",
      r: "Commencez par les tâches évidentes pour le poste (« accueil des clients » pour un vendeur), puis regroupez les petits jobs sur une seule ligne, raccourcissez le profil à trois lignes et limitez les compétences aux cinq qui collent à l'annonce. Le modèle classique à une colonne gagne aussi de la place sur les deux autres. L'indication sous l'aperçu passe à « une page A4 » dès que le CV tient.",
    },
    {
      q: "Si je ferme l'onglet, est-ce que je retrouve mon CV en revenant ?",
      r: "Oui, sur le même navigateur et le même appareil : le contenu est enregistré à chaque frappe dans le stockage local du navigateur, sans compte et sans envoi à un serveur. La photo n'y est pas gardée, il faudra la remettre. Sur un ordinateur partagé, cliquez sur « Tout effacer » avant de partir : le brouillon est alors supprimé de ce navigateur.",
    },
  ],
  en: [
    {
      q: "Should a CV for a job in France include a photo?",
      r: "It is not required, and many French recruiters no longer expect one. Under article L1221-6 of the Code du travail, an employer may only ask for information directly linked to the job, and physical appearance is one of the grounds of discrimination French law forbids. If you add a photo, use a recent, neutral one. Here it stays on your device and is not kept in the draft.",
    },
    {
      q: "How do I show my level of French on a CV?",
      r: "Use the CEFR scale (CECRL in French), from A1 to C2, which every European recruiter reads: B2 means you can hold a discussion and defend a view, C1 that you speak fluently and spontaneously. If you passed an official test such as DELF, DALF or TCF, add it after the level, for example « French: C1 (DALF C1, 2024) ». Avoid vague words such as « fluent » without a level.",
    },
    {
      q: "Should I send a French or an English CV to a company in France?",
      r: "Follow the job ad: an ad written in French expects a CV in French, while international companies and roles advertised in English accept an English CV. This tool lets you switch the section headings between English and French with one click; the content you type stays as you wrote it, so translate the job titles and achievements too when you switch to French.",
    },
    {
      q: "Will recruitment software be able to read my CV PDF?",
      r: "Yes. The PDF made by your browser's print function keeps real, selectable text, which applicant tracking systems can extract, unlike a CV saved as an image. For an online application form, choose the classic one-column layout: its reading order is the simplest, and its section headings are the ones these systems recognise in both English and French.",
    },
    {
      q: "Is my CV saved, and is my photo uploaded anywhere?",
      r: "Nothing is uploaded. The text is saved as you type in your browser's local storage, on this device only, so you find it again when you come back. The photo is read by your browser and never stored in that draft, so you add it again next time. On a shared computer, click « Clear all » before leaving to delete the draft.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Légifrance", titre: "Code du travail, article L1221-6 (informations demandées au candidat)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900845/", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Discrimination", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19448", lu: "27 octobre 2026" },
    { editeur: "Europass (Commission européenne)", titre: "Cadre européen commun de référence pour les langues (Common European Framework of Reference for Language skills)", url: "https://europass.europa.eu/fr/common-european-framework-reference-language-skills", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Légifrance", titre: "Code du travail, article L1221-6 (information an employer may ask a candidate)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006900845/", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Discrimination", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19448", lu: "27 October 2026" },
    { editeur: "Europass (European Commission)", titre: "Common European Framework of Reference for Language skills", url: "https://europass.europa.eu/en/common-european-framework-reference-language-skills", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Modèle de CV en ligne 75tools",
    motsCles: "modèle cv gratuit, créer un cv gratuit en ligne, générateur de cv pdf, cv pdf, modèle de cv",
    modele: "Modèle",
    modeleAria: "Modèle de CV",
    modeles: { classique: "Classique, une colonne", colonnes: "Deux colonnes", moderne: "Moderne, couleur" } as Record<ModeleVisuel, string>,
    langueCv: "Langue des rubriques",
    langues: { fr: "Français", en: "Anglais" } as Record<LangueDoc, string>,
    voirApercu: "Voir l'aperçu et enregistrer en PDF",
    accent: "Couleur d'accent",
    couleur: (c: string) => `Couleur ${c}`,
    autreCouleur: "Autre couleur",
    autre: "autre",
    contenu: "Contenu du CV",
    identite: "Identité et coordonnées",
    prenom: "Prénom",
    nom: "Nom",
    titre: "Titre du CV",
    titreEx: "Comptable confirmé",
    titreAide: "L'intitulé du poste visé, tel qu'il figure dans l'annonce.",
    telephone: "Téléphone",
    email: "E-mail",
    ville: "Ville",
    villeAide: "La ville suffit, l'adresse complète n'est pas utile.",
    lien: "Lien (LinkedIn, portfolio)",
    mobilite: "Permis, mobilité, disponibilité",
    mobiliteEx: "Permis B, disponible en janvier",
    changerPhoto: "Changer la photo",
    ajouterPhoto: "Ajouter une photo (facultatif)",
    retirerPhoto: "Retirer la photo",
    photoNote: "Lue par votre navigateur, jamais envoyée.",
    profil: "Profil",
    profilLabel: "Trois lignes sur vous",
    profilAide: (n: string) => `${n} caractères. Visez 250 à 400 : qui vous êtes, ce que vous savez faire, ce que vous cherchez.`,
    experiences: "Expériences",
    experience: "Expérience",
    ajoutExp: "Ajouter une expérience",
    poste: "Poste",
    employeur: "Employeur",
    lieu: "Lieu",
    debut: "Début",
    fin: "Fin",
    finEx: "aujourd'hui",
    realisations: "Réalisations (une par ligne)",
    realisationsAide: "Commencez par un verbe d'action et chiffrez quand c'est possible.",
    formations: "Formations",
    formation: "Formation",
    ajoutForm: "Ajouter une formation",
    diplome: "Diplôme ou formation",
    etablissement: "Établissement",
    details: "Détails (facultatif)",
    detailsEx: "Mention, spécialité, mémoire",
    annexes: "Compétences, langues et centres d'intérêt",
    competences: "Compétences (une par ligne)",
    competencesAide: "Reprenez les mots de l'annonce quand ils correspondent à ce que vous savez faire.",
    langue: "Langue",
    ajoutLangue: "Ajouter une langue",
    niveau: "Niveau (CECRL)",
    interets: "Centres d'intérêt",
    interetsAide: "Deux ou trois, précis : « trail, 3 courses par an » dit plus que « sport ».",
    monter: "Monter",
    descendre: "Descendre",
    supprimer: "Supprimer",
    pdf: "Enregistrer en PDF",
    exemple: "Exemple",
    effacer: "Tout effacer",
    aidePdf1: "Dans la fenêtre d'impression, choisissez la destination ",
    aidePdf2: "« Enregistrer au format PDF »",
    aidePdf3: " (sur Mac : menu « PDF » puis « Enregistrer au format PDF »). Laissez les marges par défaut ; si les couleurs manquent, cochez « Graphiques d'arrière-plan ».",
    attente: "L'aperçu ci-dessous se met à jour à chaque frappe.",
    brouillon: "Brouillon retrouvé dans ce navigateur.",
    pasImage: "Ce fichier n'est pas une image : choisissez un JPG, un PNG ou un WebP.",
    photoOk: "Photo ajoutée. Elle reste sur votre appareil et n'est pas gardée dans le brouillon.",
    photoKo: "Impossible de lire cette image.",
    exempleOk: "Exemple rechargé.",
    effaceOk: "CV vidé et brouillon effacé de ce navigateur.",
    deuxPages: "Le CV dépasse une page : il sera imprimé sur deux pages.",
    unePage: "Le CV tient sur une page A4.",
  },
  en: {
    nomAppli: "75tools online CV template",
    motsCles: "cv template free, cv template france, cv builder pdf, english cv for france, french cv template",
    modele: "Layout",
    modeleAria: "CV layout",
    modeles: { classique: "Classic, one column", colonnes: "Two columns", moderne: "Modern, colour" } as Record<ModeleVisuel, string>,
    langueCv: "Section headings in",
    langues: { fr: "French", en: "English" } as Record<LangueDoc, string>,
    voirApercu: "See the preview and save as PDF",
    accent: "Accent colour",
    couleur: (c: string) => `Colour ${c}`,
    autreCouleur: "Other colour",
    autre: "other",
    contenu: "CV content",
    identite: "Name and contact details",
    prenom: "First name",
    nom: "Last name",
    titre: "CV title",
    titreEx: "Senior accountant",
    titreAide: "The job title you are applying for, as written in the ad.",
    telephone: "Phone",
    email: "Email",
    ville: "Town",
    villeAide: "The town is enough; a full address is not needed.",
    lien: "Link (LinkedIn, portfolio)",
    mobilite: "Right to work, driving licence, availability",
    mobiliteEx: "EU citizen, available from January",
    changerPhoto: "Change photo",
    ajouterPhoto: "Add a photo (optional)",
    retirerPhoto: "Remove photo",
    photoNote: "Read by your browser, never uploaded.",
    profil: "Profile",
    profilLabel: "Three lines about you",
    profilAide: (n: string) => `${n} characters. Aim for 250 to 400: who you are, what you do well, what you are looking for.`,
    experiences: "Work experience",
    experience: "Job",
    ajoutExp: "Add a job",
    poste: "Job title",
    employeur: "Employer",
    lieu: "Location",
    debut: "Start",
    fin: "End",
    finEx: "present",
    realisations: "Achievements (one per line)",
    realisationsAide: "Start with an action verb and add a number where you can.",
    formations: "Education",
    formation: "Course",
    ajoutForm: "Add a course or degree",
    diplome: "Degree or course",
    etablissement: "School or university",
    details: "Details (optional)",
    detailsEx: "Grade, major, dissertation",
    annexes: "Skills, languages and interests",
    competences: "Skills (one per line)",
    competencesAide: "Reuse the words of the job ad when they match what you can do.",
    langue: "Language",
    ajoutLangue: "Add a language",
    niveau: "Level (CEFR)",
    interets: "Interests",
    interetsAide: "Two or three, specific: \"trail running, 3 races a year\" says more than \"sport\".",
    monter: "Move up",
    descendre: "Move down",
    supprimer: "Delete",
    pdf: "Save as PDF",
    exemple: "Example",
    effacer: "Clear all",
    aidePdf1: "In the print window, choose the destination ",
    aidePdf2: "\"Save as PDF\"",
    aidePdf3: " (on a Mac: the PDF menu, then Save as PDF). Keep the default margins; if colours are missing, tick \"Background graphics\".",
    attente: "The preview below updates as you type.",
    brouillon: "Draft restored from this browser.",
    pasImage: "This file is not an image: choose a JPG, PNG or WebP.",
    photoOk: "Photo added. It stays on your device and is not kept in the draft.",
    photoKo: "This image could not be read.",
    exempleOk: "Example reloaded.",
    effaceOk: "CV cleared and draft deleted from this browser.",
    deuxPages: "The CV is longer than one page: it will print on two pages.",
    unePage: "The CV fits on one A4 page.",
  },
};

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
function Liste<E extends { id: number }>({ items, setItems, nouveau, rendu, libelle, ajout, act }: {
  items: E[];
  setItems: (f: (x: E[]) => E[]) => void;
  nouveau: (id: number) => E;
  rendu: (item: E, maj: (k: keyof E, v: string) => void, i: number) => ReactNode;
  libelle: string;
  ajout: string;
  act: { monter: string; descendre: string; supprimer: string };
}) {
  const maj = (id: number) => (k: keyof E, v: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
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
                <BoutonIcone label={`${act.monter} : ${libelle.toLowerCase()} ${i + 1}`} disabled={i === 0} onClick={() => deplacer(i, -1)}>
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </BoutonIcone>
                <BoutonIcone label={`${act.descendre} : ${libelle.toLowerCase()} ${i + 1}`} disabled={i === items.length - 1} onClick={() => deplacer(i, 1)}>
                  <ArrowDown className="w-4 h-4" aria-hidden="true" />
                </BoutonIcone>
                <BoutonIcone label={`${act.supprimer} : ${libelle.toLowerCase()} ${i + 1}`} danger onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}>
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

const Choix = <V extends string>({ aria, valeur, options, onChange }: { aria: string; valeur: V; options: [V, string][]; onChange: (v: V) => void }) => (
  <div role="radiogroup" aria-label={aria} className="flex flex-wrap gap-2">
    {options.map(([v, l]) => (
      <button
        key={v}
        type="button"
        role="radio"
        aria-checked={valeur === v}
        onClick={() => onChange(v)}
        className={cn(
          "h-11 px-4 rounded-md text-sm border",
          valeur === v ? "border-sky-400 bg-sky-400/10 text-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
        )}
      >
        {l}
      </button>
    ))}
  </div>
);

/* ------------------------------------------------------------------ page */

const ModeleCv = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const exemple = lang === "en" ? CV_EXEMPLE_EN : CV_EXEMPLE;
  const [cv, setCv] = useState<Cv>(exemple);
  const [photo, setPhoto] = useState("");
  const [charge, setCharge] = useState(false);
  const [statut, setStatut] = useState("");
  const zone = useRef<HTMLDivElement>(null);
  const feuille = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState(0.5);
  const [hauteur, setHauteur] = useState(1123);
  const champPhoto = useRef<HTMLInputElement>(null);
  const langueCv: LangueDoc = cv.langueCv ?? lang;
  const act = { monter: t.monter, descendre: t.descendre, supprimer: t.supprimer };

  const maj = <K extends keyof Cv>(k: K) => (v: Cv[K]) => setCv((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const b = lireBrouillon(lang);
    if (b) {
      setCv(b);
      setStatut(t.brouillon);
    }
    setCharge(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (charge) ecrireBrouillon(cv, lang);
  }, [cv, charge, lang]);

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
      setStatut(t.pasImage);
      return;
    }
    const lecteur = new FileReader();
    lecteur.onload = () => {
      setPhoto(String(lecteur.result));
      setStatut(t.photoOk);
    };
    lecteur.onerror = () => setStatut(t.photoKo);
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

  const outil = (
    <>
      <style>{STYLE_IMPRESSION}</style>
      <div className="cv-outil grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] items-start">
        <div className="cv-ecran space-y-5 min-w-0">
          <Bloc titre={t.modele}>
            <Choix
              aria={t.modeleAria}
              valeur={cv.modele}
              onChange={(v) => maj("modele")(v)}
              options={(["classique", "colonnes", "moderne"] as ModeleVisuel[]).map((v) => [v, t.modeles[v]])}
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm text-neutral-300">{t.langueCv}</span>
              <Choix
                aria={t.langueCv}
                valeur={langueCv}
                onChange={(v) => maj("langueCv")(v)}
                options={(lang === "en" ? ["en", "fr"] : ["fr", "en"]).map((v) => [v as LangueDoc, t.langues[v as LangueDoc]])}
              />
            </div>
            <a href="#apercu-cv" className="xl:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
              {t.voirApercu}
            </a>
            {cv.modele !== "classique" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-neutral-300 mr-1">{t.accent}</span>
                {COULEURS_ACCENT.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={t.couleur(c)}
                    aria-pressed={cv.accent === c}
                    onClick={() => maj("accent")(c)}
                    className={cn("h-9 w-9 rounded-full border-2", cv.accent === c ? "border-white" : "border-transparent")}
                    style={{ background: c }}
                  />
                ))}
                <label className="inline-flex items-center gap-2 text-sm text-neutral-400">
                  <input type="color" value={cv.accent} onChange={(e) => maj("accent")(e.target.value)} className="h-9 w-12 bg-transparent" aria-label={t.autreCouleur} />
                  {t.autre}
                </label>
              </div>
            )}
          </Bloc>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label={t.contenu}>
            <Bloc titre={t.identite}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Champ2 label={t.prenom} name="prenom" value={cv.prenom} onChange={maj("prenom")} autoComplete="given-name" />
                <Champ2 label={t.nom} name="nom" value={cv.nom} onChange={maj("nom")} autoComplete="family-name" />
                <Champ2 label={t.titre} name="titre" value={cv.titre} onChange={maj("titre")} placeholder={t.titreEx} aide={t.titreAide} className="sm:col-span-2" />
                <Champ2 label={t.telephone} type="tel" value={cv.telephone} onChange={maj("telephone")} autoComplete="tel" />
                <Champ2 label={t.email} type="email" value={cv.email} onChange={maj("email")} autoComplete="email" />
                <Champ2 label={t.ville} value={cv.ville} onChange={maj("ville")} autoComplete="address-level2" aide={t.villeAide} />
                <Champ2 label={t.lien} value={cv.lien} onChange={maj("lien")} />
                <Champ2 label={t.mobilite} value={cv.mobilite} onChange={maj("mobilite")} placeholder={t.mobiliteEx} className="sm:col-span-2" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Bouton secondaire onClick={() => champPhoto.current?.click()}>
                  {photo ? t.changerPhoto : t.ajouterPhoto}
                </Bouton>
                {photo && (
                  <Bouton secondaire onClick={() => setPhoto("")}>
                    {t.retirerPhoto}
                  </Bouton>
                )}
                <input
                  ref={champPhoto}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden="true"
                  data-champ="photo"
                  onChange={(e) => {
                    choisirPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <span className="text-xs text-neutral-500">{t.photoNote}</span>
              </div>
            </Bloc>

            <Bloc titre={t.profil}>
              <Zone2
                label={t.profilLabel}
                name="profil"
                value={cv.profil}
                onChange={maj("profil")}
                lignes={4}
                aide={t.profilAide(cv.profil.length.toLocaleString(locale(lang)))}
              />
            </Bloc>

            <Bloc titre={t.experiences}>
              <Liste<Experience>
                items={cv.experiences}
                setItems={(f) => setCv((x) => ({ ...x, experiences: f(x.experiences) }))}
                nouveau={(id) => ({ id, poste: "", employeur: "", lieu: "", debut: "", fin: "", description: "" })}
                libelle={t.experience}
                ajout={t.ajoutExp}
                act={act}
                rendu={(e, m, i) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ2 label={t.poste} name={`poste-${i}`} value={e.poste} onChange={(v) => m("poste", v)} />
                    <Champ2 label={t.employeur} value={e.employeur} onChange={(v) => m("employeur", v)} />
                    <Champ2 label={t.lieu} value={e.lieu} onChange={(v) => m("lieu", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Champ2 label={t.debut} value={e.debut} onChange={(v) => m("debut", v)} placeholder="2022" />
                      <Champ2 label={t.fin} value={e.fin} onChange={(v) => m("fin", v)} placeholder={t.finEx} />
                    </div>
                    <div className="sm:col-span-2">
                      <Zone2 label={t.realisations} value={e.description} onChange={(v) => m("description", v)} lignes={3} aide={t.realisationsAide} />
                    </div>
                  </div>
                )}
              />
            </Bloc>

            <Bloc titre={t.formations}>
              <Liste<Formation>
                items={cv.formations}
                setItems={(f) => setCv((x) => ({ ...x, formations: f(x.formations) }))}
                nouveau={(id) => ({ id, diplome: "", etablissement: "", lieu: "", debut: "", fin: "", description: "" })}
                libelle={t.formation}
                ajout={t.ajoutForm}
                act={act}
                rendu={(f, m) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ2 label={t.diplome} value={f.diplome} onChange={(v) => m("diplome", v)} />
                    <Champ2 label={t.etablissement} value={f.etablissement} onChange={(v) => m("etablissement", v)} />
                    <Champ2 label={t.lieu} value={f.lieu} onChange={(v) => m("lieu", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Champ2 label={t.debut} value={f.debut} onChange={(v) => m("debut", v)} />
                      <Champ2 label={t.fin} value={f.fin} onChange={(v) => m("fin", v)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Zone2 label={t.details} value={f.description} onChange={(v) => m("description", v)} lignes={2} placeholder={t.detailsEx} />
                    </div>
                  </div>
                )}
              />
            </Bloc>

            <Bloc titre={t.annexes}>
              <Zone2 label={t.competences} name="competences" value={cv.competences} onChange={maj("competences")} lignes={5} aide={t.competencesAide} />
              <Liste<LangueCv>
                items={cv.langues}
                setItems={(f) => setCv((x) => ({ ...x, langues: f(x.langues) }))}
                nouveau={(id) => ({ id, langue: "", niveau: "B2" })}
                libelle={t.langue}
                ajout={t.ajoutLangue}
                act={act}
                rendu={(l, m) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Champ2 label={t.langue} value={l.langue} onChange={(v) => m("langue", v)} />
                    <label className="block min-w-0">
                      <span className="block text-sm text-neutral-300 mb-1">{t.niveau}</span>
                      <select value={l.niveau} onChange={(e) => m("niveau", e.target.value)} className={classeSelect}>
                        {niveaux(lang).map(([v, n]) => (
                          <option key={v} value={v}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              />
              <Zone2 label={t.interets} value={cv.interets} onChange={maj("interets")} lignes={2} aide={t.interetsAide} />
            </Bloc>
          </form>
        </div>

        <div id="apercu-cv" data-resultat className="cv-colonne xl:sticky xl:top-4 space-y-3 min-w-0 scroll-mt-4">
          <div className="cv-ecran rounded-lg border border-neutral-800 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={imprimer}>
                <span className="inline-flex items-center gap-2">
                  <Printer className="w-4 h-4" aria-hidden="true" /> {t.pdf}
                </span>
              </Bouton>
              <Bouton
                secondaire
                onClick={() => {
                  setCv(exemple);
                  setStatut(t.exempleOk);
                }}
              >
                {t.exemple}
              </Bouton>
              <Bouton
                secondaire
                onClick={() => {
                  effacerBrouillon(lang);
                  setCv({ ...CV_VIDE, langueCv: lang });
                  setPhoto("");
                  setStatut(t.effaceOk);
                }}
              >
                {t.effacer}
              </Bouton>
            </div>
            <p className="text-xs text-neutral-400">
              {t.aidePdf1}
              <strong className="text-neutral-200">{t.aidePdf2}</strong>
              {t.aidePdf3}
            </p>
            <p role="status" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
              {statut || t.attente}
            </p>
          </div>
          <div ref={zone} className="cv-zone w-full overflow-hidden rounded-md shadow-xl bg-white" style={{ height: Math.ceil(hauteur * echelle) }}>
            <div ref={feuille} className="cv-echelle origin-top-left w-[794px]" style={{ transform: `scale(${echelle})` }}>
              <CvFeuille cv={cv} photo={photo} />
            </div>
          </div>
          <p className="cv-ecran text-xs text-neutral-500">{hauteur > 1130 ? t.deuxPages : t.unePage}</p>
        </div>
      </div>
    </>
  );

  return (
    <PageOutil
      id="modele-cv"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="BusinessApplication"
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
    <Section titre="Modèle de CV gratuit : comment s'en servir">
      <p>
        Ce modèle de CV gratuit se remplit directement dans la page : choisissez une mise en page (classique à une
        colonne, deux colonnes ou moderne avec un bandeau de couleur), remplissez l'identité, le profil, les expériences,
        les formations, les compétences et les langues, et le CV se compose en direct sur une feuille A4 à côté du
        formulaire. Le bouton « Enregistrer en PDF » ouvre la fenêtre d'impression réglée pour une page A4 sans marges :
        choisissez « Enregistrer au format PDF » et vous obtenez un fichier de texte réel, lisible par les logiciels de
        recrutement. Exemple : un CV de quatre ans d'expérience avec deux postes, deux diplômes et trois langues tient sur
        une page, comme l'exemple chargé au départ. Les titres de rubriques peuvent passer en anglais pour une
        candidature à l'étranger. La limite : la photo n'est pas gardée dans le brouillon, et le brouillon ne vit que dans
        ce navigateur, sur cet appareil.
      </p>
    </Section>

    <Section titre="Rubriques, longueur et ordre">
      <p>
        Un recruteur parcourt d'abord le haut du CV : nom, <strong>intitulé du poste visé</strong> et coordonnées doivent
        se lire en un coup d'œil. Viennent ensuite un <strong>profil</strong> de trois lignes, puis les expériences de la
        plus récente à la plus ancienne, les formations, les compétences, les langues et, si elles disent quelque chose
        de vous, deux ou trois activités.
      </p>
      <p>
        <strong>Une page</strong> suffit en début de carrière et jusqu'à quelques années d'expérience ; au-delà, une
        deuxième page se justifie si elle contient des expériences utiles pour le poste. Pour un jeune diplômé, la
        formation peut passer avant l'expérience : utilisez les flèches pour réordonner. Chaque réalisation commence par
        un <strong>verbe d'action</strong> au passé (piloté, conçu, négocié, réduit, formé) et donne, quand c'est
        possible, un chiffre : « Organisé deux salons par an, budget de 40 000 € » en dit plus que « participation à
        l'organisation d'événements ».
      </p>
    </Section>

    <Section titre="Ce que vous n'êtes pas obligé d'écrire">
      <p>
        En France, la photo, l'âge ou la date de naissance, la nationalité et la situation de famille ne sont pas des
        rubriques obligatoires. L'article L1221-6 du Code du travail limite ce qu'un employeur peut demander : les
        informations demandées au candidat ne peuvent avoir pour finalité que d'apprécier sa capacité à occuper l'emploi
        proposé ou ses aptitudes professionnelles, et doivent présenter un lien direct et nécessaire avec cet emploi. En
        contrepartie, le candidat est tenu de répondre de bonne foi.
      </p>
      <p>
        L'âge, la situation de famille, la grossesse, l'apparence physique, l'origine, le lieu de résidence ou l'état de
        santé font partie des critères sur lesquels il est interdit de fonder une différence de traitement. Selon Service
        Public, l'auteur d'une discrimination risque jusqu'à 3 ans d'emprisonnement et 45 000 € d'amende, et une victime
        peut saisir gratuitement le Défenseur des droits, notamment au 3928. Indiquez la ville plutôt que l'adresse
        complète, et la mobilité ou le permis seulement s'ils servent le poste.
      </p>
    </Section>

    <Section titre="Trois mises en page, un même contenu">
      <p>
        Le <strong>classique</strong>, en une colonne et en caractères à empattement, convient aux dépôts en ligne et aux
        secteurs traditionnels ; le modèle <strong>deux colonnes</strong> range coordonnées, compétences et langues dans
        une barre latérale ; le <strong>moderne</strong> ouvre sur un bandeau de couleur, à choisir sobre. Les niveaux de
        langue suivent l'échelle européenne CECRL, de A1 (découverte) à C2 (maîtrise). Votre brouillon est enregistré
        automatiquement dans ce navigateur, sans la photo ; pour accompagner l'envoi, la{" "}
        <Link to="/signature-mail/">signature mail</Link> de 75tools complète bien la candidature, et si l'offre demande
        un PDF léger, vous pouvez <Link to="/compresser-pdf/">compresser le PDF</Link> obtenu.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Free CV template: how to use it">
      <p>
        This free CV template is filled in right on the page: pick a layout (classic one column, two columns, or modern
        with a colour band), fill in your name, profile, jobs, education, skills and languages, and the CV is laid out
        live on an A4 sheet next to the form. The section headings are in English by default; one click switches them
        to French when you apply to a French-speaking employer. The "Save as PDF" button opens your browser's print
        window set to one A4 page with no margins: choose "Save as PDF" and you get a file with real text that
        recruitment software can read. For example, a CV with six years of experience, two jobs, two degrees and three
        languages fits on one page, like the example loaded at the start. The limits: the photo is not kept in the
        draft, and the draft lives only in this browser, on this device.
      </p>
    </Section>

    <Section titre="Writing a CV for a job in France">
      <p>
        French recruiters read the top of the page first: name, the <strong>job title you are applying for</strong> and
        contact details should be clear at a glance. Then comes a three-line profile, your jobs from the most recent,
        education, skills, languages and, if they say something about you, two or three interests. One page is the norm
        early in a career; a second page is fine when it holds experience relevant to the job.
      </p>
      <p>
        Some habits differ from the UK or the US. A French CV often states the job title as a heading, lists languages
        with a level, and may mention a driving licence (« permis B ») when the job involves travel. You do not have to
        give your age, marital status, nationality or a photo: article L1221-6 of the Code du travail limits an
        employer's questions to what is directly linked to the job, and Service Public lists age, family situation and
        physical appearance among the grounds of discrimination French law forbids, punishable by up to 3 years in
        prison and a 45,000 euro fine. If you are not an EU citizen, a short line on your right to work (for example
        « titre de séjour salarié ») answers the recruiter's first question.
      </p>
    </Section>

    <Section titre="Languages, levels and the French version">
      <p>
        Give each language a level on the CEFR scale (called CECRL in France), from A1 to C2: B2 means you can hold a
        discussion and defend a view, C1 that you speak fluently and spontaneously. Add any official test after the
        level: DELF or DALF for French, IELTS or Cambridge for English. Recruiters in France read these levels far more
        easily than words such as "fluent" or "conversational".
      </p>
      <p>
        When you switch the headings to French, translate your own text too: job titles, achievements and the profile
        stay exactly as you typed them. Start each achievement with an action verb and a number (« Réduit de 28 % le coût
        par contact qualifié »). To send the CV, a professional{" "}
        <Link to="/en/email-signature/">email signature</Link> completes the application, and if a job portal limits the
        file size, you can <Link to="/en/compress-pdf/">compress the PDF</Link> before uploading it.
      </p>
    </Section>
  </>
);

export default ModeleCv;
