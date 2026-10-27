import { ReactNode, useRef, useState } from "react";
import SEO from "@/components/SEO";
import {
  OutilLayout,
  EnTete,
  Faq,
  faqJsonLd,
  Sources,
  AutresOutils,
  QuestionFaq,
  Source,
} from "@/components/outils/OutilLayout";
import { cn } from "@/lib/utils";

/**
 * Gabarit complet d'une page-outil : SEO (titre exact, description, canonical, WebApplication
 * sans note + FAQPage tirée de la FAQ affichée), H1 et chapeau, puis l'outil et les sections
 * passés en enfants, puis FAQ, sources et renvois vers la même catégorie.
 */
export const PageOutil = ({
  href,
  titre,
  description,
  motsCles,
  nomAppli,
  categorieAppli = "UtilitiesApplication",
  h1,
  chapeau,
  faq,
  sources = [],
  children,
}: {
  href: string; // "/compresser-pdf/"
  titre: string; // <title>, 50 à 60 caractères, terme-clé d'abord
  description: string; // 150 à 160 caractères
  motsCles: string;
  nomAppli: string; // nom de l'application pour WebApplication
  categorieAppli?: string; // schema.org applicationCategory
  h1: string;
  chapeau: ReactNode;
  faq: QuestionFaq[];
  sources?: Source[];
  children: ReactNode;
}) => {
  const url = `https://75tools.fr${href}`;
  return (
    <OutilLayout>
      <SEO
        exactTitle
        title={titre}
        description={description}
        keywords={motsCles}
        url={url}
        locale="fr_FR"
        imageAlt={nomAppli}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: nomAppli,
            url,
            applicationCategory: categorieAppli,
            operatingSystem: "Navigateur web",
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            description,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: "75tools", url: "https://75tools.fr/" },
          },
          faqJsonLd(faq),
        ]}
      />
      <EnTete titre={h1} chapeau={chapeau} />
      {children}
      <Faq faq={faq} />
      {sources.length > 0 && <Sources sources={sources} />}
      <AutresOutils courant={href} />
    </OutilLayout>
  );
};

/** Classe commune des champs sombres (input, select, textarea), 48 px de haut pour les champs d'une ligne. */
export const classeChamp =
  "w-full h-12 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-400";
export const classeZoneTexte =
  "w-full rounded-md border border-neutral-700 bg-neutral-900 p-3 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-400";
/** Liste déroulante : flèche dessinée par le site, 2,5 rem de marge droite (RECETTE, contrôle 12). */
export const classeSelect =
  classeChamp +
  " appearance-none pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%23a3a3a3%22 stroke-width=%221.5%22/></svg>')] bg-no-repeat bg-[right_0.9rem_center]";

/** Phrase de confidentialité des outils qui ouvrent un fichier. */
export const NoteLocale = ({ className }: { className?: string }) => (
  <p className={cn("text-sm text-neutral-500", className)}>
    Vos fichiers restent sur votre appareil : ils sont traités par votre navigateur, rien n'est envoyé à un
    serveur.
  </p>
);

/** Zone de dépôt : glisser-déposer ou bouton de choix de fichiers. */
export const DepotFichiers = ({
  accept,
  multiple = false,
  onFichiers,
  libelle,
  aide,
}: {
  accept: string; // ".pdf,application/pdf"
  multiple?: boolean;
  onFichiers: (f: File[]) => void;
  libelle: string; // « Choisir des PDF »
  aide?: string; // « ou glissez-les ici »
}) => {
  const [survol, setSurvol] = useState(false);
  const champ = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setSurvol(true);
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSurvol(false);
        const f = Array.from(e.dataTransfer.files);
        if (f.length) onFichiers(multiple ? f : f.slice(0, 1));
      }}
      className={cn(
        "rounded-lg border-2 border-dashed px-4 py-8 sm:py-10 text-center transition-colors",
        survol ? "border-sky-400 bg-neutral-900" : "border-neutral-700"
      )}
    >
      <button
        type="button"
        onClick={() => champ.current?.click()}
        className="h-11 px-5 rounded-md text-sm font-medium bg-sky-400 text-neutral-950 hover:bg-sky-300"
      >
        {libelle}
      </button>
      <p className="mt-3 text-sm text-neutral-400">{aide ?? (multiple ? "ou glissez vos fichiers ici" : "ou glissez votre fichier ici")}</p>
      <input
        ref={champ}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = Array.from(e.target.files ?? []);
          if (f.length) onFichiers(f);
          e.target.value = "";
        }}
      />
      <NoteLocale className="mt-4" />
    </div>
  );
};
