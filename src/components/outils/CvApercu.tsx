import { CSSProperties, ReactNode } from "react";
import { Cv, NIVEAUX_CECRL, lignes, periode } from "@/lib/cv-modele";

/**
 * Feuille A4 du CV (210 × 297 mm), en trois modèles. Mise en page en pixels CSS (794 × 1123 px à 96 ppp),
 * pour un rendu identique à l'écran (réduit) et à l'impression (« Enregistrer au format PDF »).
 */

const libelleNiveau = (n: string) => NIVEAUX_CECRL.find(([v]) => v === n)?.[1] ?? n;

const Coordonnees = ({ cv, sep = " · " }: { cv: Cv; sep?: string }) => {
  const items = [cv.telephone, cv.email, cv.ville, cv.lien, cv.mobilite].map((x) => x.trim()).filter(Boolean);
  return <>{items.join(sep)}</>;
};

const Puces = ({ texte, couleur }: { texte: string; couleur?: string }) => {
  const l = lignes(texte);
  if (!l.length) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {l.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" style={{ color: couleur }} className="select-none">•</span>
          <span className="min-w-0">{x}</span>
        </li>
      ))}
    </ul>
  );
};

const Entrees = ({ cv, couleur, titreClasse }: { cv: Cv; couleur?: string; titreClasse?: string }) => {
  const exps = cv.experiences.filter((e) => e.poste.trim() || e.employeur.trim() || e.description.trim());
  const forms = cv.formations.filter((f) => f.diplome.trim() || f.etablissement.trim());
  const bloc = (titre: string, contenu: ReactNode) => (
    <div className="mt-5 cv-section">
      <p className={titreClasse} style={{ color: couleur, borderColor: couleur }}>
        {titre}
      </p>
      {contenu}
    </div>
  );
  return (
    <>
      {cv.profil.trim() && bloc("Profil", <p className="mt-1.5 whitespace-pre-line">{cv.profil.trim()}</p>)}
      {exps.length > 0 &&
        bloc(
          "Expérience professionnelle",
          exps.map((e) => (
            <div key={e.id} className="mt-2.5 cv-entree">
              <div className="flex justify-between gap-4 items-baseline">
                <p className="font-bold text-[14px]">{e.poste}</p>
                <p className="shrink-0 text-[12px] text-neutral-600">{periode(e.debut, e.fin)}</p>
              </div>
              <p className="text-neutral-700 italic">{[e.employeur, e.lieu].map((x) => x.trim()).filter(Boolean).join(", ")}</p>
              <Puces texte={e.description} couleur={couleur} />
            </div>
          ))
        )}
      {forms.length > 0 &&
        bloc(
          "Formation",
          forms.map((f) => (
            <div key={f.id} className="mt-2.5 cv-entree">
              <div className="flex justify-between gap-4 items-baseline">
                <p className="font-bold text-[14px]">{f.diplome}</p>
                <p className="shrink-0 text-[12px] text-neutral-600">{periode(f.debut, f.fin)}</p>
              </div>
              <p className="text-neutral-700 italic">{[f.etablissement, f.lieu].map((x) => x.trim()).filter(Boolean).join(", ")}</p>
              <Puces texte={f.description} couleur={couleur} />
            </div>
          ))
        )}
    </>
  );
};

const Annexes = ({ cv, couleur, titreClasse, enLigne = false }: { cv: Cv; couleur?: string; titreClasse?: string; enLigne?: boolean }) => {
  const comp = lignes(cv.competences);
  const langues = cv.langues.filter((l) => l.langue.trim());
  const bloc = (titre: string, contenu: ReactNode) => (
    <div className="mt-5 cv-section">
      <p className={titreClasse} style={{ color: couleur, borderColor: couleur }}>
        {titre}
      </p>
      {contenu}
    </div>
  );
  return (
    <>
      {comp.length > 0 &&
        bloc(
          "Compétences",
          enLigne ? (
            <p className="mt-1.5">{comp.join(" · ")}</p>
          ) : (
            <ul className="mt-1.5 space-y-0.5">
              {comp.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )
        )}
      {langues.length > 0 &&
        bloc(
          "Langues",
          enLigne ? (
            <p className="mt-1.5">{langues.map((l) => `${l.langue.trim()} (${libelleNiveau(l.niveau)})`).join(" · ")}</p>
          ) : (
            <ul className="mt-1.5 space-y-0.5">
              {langues.map((l) => (
                <li key={l.id}>
                  <span className="font-semibold">{l.langue}</span> : {libelleNiveau(l.niveau)}
                </li>
              ))}
            </ul>
          )
        )}
      {cv.interets.trim() && bloc("Centres d'intérêt", <p className="mt-1.5 whitespace-pre-line">{cv.interets.trim()}</p>)}
    </>
  );
};

const Photo = ({ src, rond = true, taille = 112 }: { src: string; rond?: boolean; taille?: number }) =>
  src ? (
    <img
      src={src}
      alt="Photo du candidat"
      width={taille}
      height={taille}
      className={rond ? "rounded-full object-cover" : "rounded object-cover"}
      style={{ width: taille, height: taille }}
    />
  ) : null;

export const CvFeuille = ({ cv, photo }: { cv: Cv; photo: string }) => {
  const nom = [cv.prenom, cv.nom].map((x) => x.trim()).filter(Boolean).join(" ") || "Prénom Nom";
  const base: CSSProperties = { width: 794, minHeight: 1123, fontVariantLigatures: "none" };

  if (cv.modele === "classique") {
    return (
      <div id="cv-feuille" style={{ ...base, fontFamily: "Georgia, 'Times New Roman', serif" }} className="cv-feuille bg-white text-neutral-900 text-[13px] leading-[1.45] px-[64px] py-[56px]">
        <div className="flex items-center gap-6 border-b-2 border-neutral-900 pb-4">
          <Photo src={photo} rond={false} taille={104} />
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[30px] leading-tight font-bold tracking-tight text-neutral-900">{nom}</p>
            {cv.titre.trim() && <p className="text-[16px] mt-1">{cv.titre}</p>}
            <p className="mt-2 text-[12px] text-neutral-700 [overflow-wrap:anywhere]">
              <Coordonnees cv={cv} />
            </p>
          </div>
        </div>
        <Entrees cv={cv} titreClasse="text-[13px] font-bold uppercase border-b border-neutral-400 pb-0.5 text-neutral-900" />
        <Annexes cv={cv} enLigne titreClasse="text-[13px] font-bold uppercase border-b border-neutral-400 pb-0.5 text-neutral-900" />
      </div>
    );
  }

  if (cv.modele === "colonnes") {
    return (
      <div id="cv-feuille" style={{ ...base, fontFamily: "'Helvetica Neue', Arial, sans-serif" }} className="cv-feuille bg-white text-neutral-900 text-[12.5px] leading-[1.45] flex">
        <div className="w-[255px] shrink-0 px-7 py-12 cv-barre" style={{ background: "#f1f3f5" }}>
          {photo && (
            <div className="mb-5 flex justify-center">
              <Photo src={photo} taille={128} />
            </div>
          )}
          <div className="cv-section">
            <p className="text-[12px] font-bold uppercase" style={{ color: cv.accent }}>
              Contact
            </p>
            <ul className="mt-1.5 space-y-1 [overflow-wrap:anywhere]">
              {[cv.telephone, cv.email, cv.ville, cv.lien, cv.mobilite]
                .map((x) => x.trim())
                .filter(Boolean)
                .map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
            </ul>
          </div>
          <Annexes cv={cv} titreClasse="text-[12px] font-bold uppercase" couleur={cv.accent} />
        </div>
        <div className="flex-1 min-w-0 px-9 py-12">
          <p className="text-[32px] leading-tight font-bold tracking-tight text-neutral-900">{nom}</p>
          {cv.titre.trim() && (
            <p className="text-[16px] mt-1 font-medium" style={{ color: cv.accent }}>
              {cv.titre}
            </p>
          )}
          <Entrees cv={cv} couleur={cv.accent} titreClasse="text-[12px] font-bold uppercase border-b pb-1" />
        </div>
      </div>
    );
  }

  return (
    <div id="cv-feuille" style={{ ...base, fontFamily: "'Helvetica Neue', Arial, sans-serif" }} className="cv-feuille bg-white text-neutral-900 text-[12.5px] leading-[1.45]">
      <div className="px-14 py-9 flex items-center gap-6 text-white cv-bandeau" style={{ background: cv.accent }}>
        <Photo src={photo} taille={110} />
        <div className="min-w-0">
          <p className="text-[32px] leading-tight font-bold tracking-tight text-white">{nom}</p>
          {cv.titre.trim() && <p className="text-[17px] mt-0.5">{cv.titre}</p>}
          <p className="mt-2 text-[12px] [overflow-wrap:anywhere]">
            <Coordonnees cv={cv} sep="  |  " />
          </p>
        </div>
      </div>
      <div className="px-14 pb-10 pt-2 grid grid-cols-[minmax(0,1fr)_200px] gap-10">
        <div className="min-w-0">
          <Entrees cv={cv} couleur={cv.accent} titreClasse="text-[13px] font-bold uppercase border-l-4 pl-2" />
        </div>
        <div className="min-w-0">
          <Annexes cv={cv} couleur={cv.accent} titreClasse="text-[13px] font-bold uppercase border-l-4 pl-2" />
        </div>
      </div>
    </div>
  );
};
