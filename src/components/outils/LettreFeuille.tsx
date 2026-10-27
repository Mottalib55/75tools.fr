import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bouton } from "@/components/outils/OutilLayout";

/**
 * Feuille A4 des lettres et attestations (résiliation, hébergement, sur l'honneur) :
 * blocs fixes en haut et en bas, corps modifiable à l'écran, impression seule de la feuille.
 * À l'impression, la zone de texte est remplacée par un bloc de texte (une textarea se coupe mal).
 */

/** Date du jour au format AAAA-MM-JJ, à appeler dans un useEffect (rendu initial déterministe). */
export const aujourdhuiIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** « 2026-10-27 » → « 27 octobre 2026 » ; chaîne vide si la date est absente ou invalide. */
export const dateLongue = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (isNaN(d.getTime())) return "";
  const txt = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return txt.replace(/^1 /, "1er ");
};

/** Remplit un champ date avec la date du jour au premier affichage (après le rendu). */
export const useDateDuJour = (setter: (iso: string) => void) => {
  useEffect(() => {
    setter(aujourdhuiIso());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/**
 * Texte généré depuis le formulaire, ou retouché à la main. Tant que la personne n'a pas retouché
 * le texte, il suit le formulaire ; après une retouche, il est figé jusqu'à « Revenir au texte généré ».
 */
export const useTexteRetouchable = (genere: string) => {
  const [retouche, setRetouche] = useState<string | null>(null);
  return {
    texte: retouche ?? genere,
    retouche: retouche !== null && retouche !== genere,
    modifier: (t: string) => setRetouche(t),
    reinitialiser: () => setRetouche(null),
  };
};

const ZoneAuto = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
  }, [value]);
  return (
    <textarea
      ref={ref}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck
      rows={8}
      className="print:hidden block w-full resize-none overflow-hidden bg-transparent text-neutral-900 leading-relaxed rounded-sm outline-none ring-1 ring-transparent hover:ring-neutral-300 focus:ring-sky-500 p-1 -m-1 [font:inherit]"
    />
  );
};

export const LettreFeuille = ({
  haut,
  titre,
  texte,
  onTexte,
  bas,
  libelleTexte = "Texte de la lettre",
}: {
  haut?: ReactNode;
  titre?: string;
  texte: string;
  onTexte: (t: string) => void;
  bas?: ReactNode;
  libelleTexte?: string;
}) => (
  <div className="feuille-lettre rounded-lg bg-white text-neutral-900 shadow-xl px-5 py-6 sm:px-10 sm:py-10 text-[0.95rem] sm:text-base leading-relaxed [overflow-wrap:anywhere] print:shadow-none print:rounded-none print:p-0 print:text-[11pt]">
    <style>{`@media print { @page { size: A4; margin: 18mm 20mm; } html, body { background: #fff !important; } }`}</style>
    {haut}
    {titre && <p className="text-center font-bold tracking-wide uppercase my-6 print:my-8">{titre}</p>}
    <ZoneAuto value={texte} onChange={onTexte} label={libelleTexte} />
    <div className="hidden print:block whitespace-pre-wrap">{texte}</div>
    {bas}
  </div>
);

/** Boutons et messages sous la feuille : copier le texte complet, imprimer ou enregistrer en PDF. */
export const ActionsLettre = ({
  texteComplet,
  retouche,
  reinitialiser,
  nomDocument = "la lettre",
}: {
  texteComplet: string;
  retouche: boolean;
  reinitialiser: () => void;
  nomDocument?: string;
}) => {
  const [etat, setEtat] = useState("");
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texteComplet);
      setEtat(`Texte copié : collez-le dans votre traitement de texte ou dans un e-mail.`);
    } catch {
      setEtat("Votre navigateur a refusé la copie : sélectionnez le texte à la souris, puis copiez-le.");
    }
  };
  return (
    <div className="print:hidden space-y-2">
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={() => window.print()}>Imprimer ou enregistrer en PDF</Bouton>
        <Bouton secondaire onClick={copier}>
          Copier le texte
        </Bouton>
        {retouche && (
          <Bouton secondaire onClick={reinitialiser}>
            Revenir au texte généré
          </Bouton>
        )}
      </div>
      <p className="text-sm text-neutral-500">
        Cliquez dans {nomDocument} pour la retoucher. Pour un PDF, choisissez « Enregistrer au format PDF » comme
        imprimante.
      </p>
      {retouche && (
        <p role="status" className="text-sm text-amber-300">
          Vous avez retouché le texte : les changements faits ensuite dans le formulaire ne s'y reportent plus.
        </p>
      )}
      <p aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
        {etat}
      </p>
    </div>
  );
};
