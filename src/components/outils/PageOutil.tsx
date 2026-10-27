import { ReactNode, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import { ACCUEIL, CATEGORIES, outilParId, type Langue } from "@/lib/outils";
import { LangueContext, useLangue, tr } from "@/lib/langue";
import { OUTILS_MAJ, displayDate } from "@/lib/last-updated";
import { cn } from "@/lib/utils";

const SITE = "https://75tools.fr";

/**
 * Gabarit complet d'une page-outil, en français ou en anglais (RECETTE §5, §8, §11, §13, §18) :
 *   - titre, description, H1 et chapeau tirés du registre src/lib/outils.ts (snippets calibrés) ;
 *   - canonical, hreflang fr / en / x-default, WebApplication sans note, WebPage avec dateModified,
 *     fil d'Ariane visible et BreadcrumbList, FAQPage tirée de la FAQ affichée ;
 *   - l'outil (`outil`) juste sous le H1, dans un cadre `data-outil` : il se voit dès le premier écran ;
 *   - puis les sections passées en enfants, la FAQ, les sources, les renvois et l'encart éditeur
 *     (date de mise à jour en toutes lettres, avertissement).
 * La langue est fournie aux composants partagés par LangueContext (useLangue).
 */
export const PageOutil = ({
  id,
  lang = "fr",
  motsCles,
  nomAppli,
  categorieAppli = "UtilitiesApplication",
  faq,
  sources = [],
  outil,
  children,
}: {
  id: string; // identifiant du registre (= adresse française sans barres) : "compresser-pdf"
  lang?: Langue;
  motsCles: string;
  nomAppli: string; // nom de l'application pour WebApplication
  categorieAppli?: string; // schema.org applicationCategory
  faq: QuestionFaq[];
  sources?: Source[];
  outil: ReactNode; // l'outil lui-même, affiché sous le H1
  children?: ReactNode; // sections de contenu, après l'outil
}) => {
  const o = outilParId(id);
  if (!o) throw new Error(`PageOutil : « ${id} » absent de src/lib/outils.ts`);
  const f = o[lang];
  const url = `${SITE}${f.href}`;
  const categorie = CATEGORIES.find((c) => c.id === o.categorie)!;
  const inLanguage = lang === "en" ? "en-GB" : "fr-FR";
  const accueil = tr(lang, "Accueil", "Home");
  return (
    <LangueContext.Provider value={lang}>
      <OutilLayout lang={lang}>
        <SEO
          exactTitle
          title={f.titre}
          description={f.meta}
          keywords={motsCles}
          url={url}
          locale={lang === "en" ? "en_US" : "fr_FR"}
          alternateLocale={lang === "en" ? "fr_FR" : "en_US"}
          imageAlt={nomAppli}
          alternates={[
            { hrefLang: "fr", href: `${SITE}${o.fr.href}` },
            { hrefLang: "en", href: `${SITE}${o.en.href}` },
            { hrefLang: "x-default", href: `${SITE}${o.fr.href}` },
          ]}
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: nomAppli,
              url,
              applicationCategory: categorieAppli,
              operatingSystem: tr(lang, "Navigateur web", "Web browser"),
              inLanguage,
              isAccessibleForFree: true,
              description: f.meta,
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              publisher: { "@id": `${SITE}/#organisation` },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": `${url}#page`,
              url,
              name: f.titre,
              inLanguage,
              dateModified: OUTILS_MAJ,
              isPartOf: { "@type": "WebSite", name: "75tools", url: `${SITE}/` },
              author: { "@id": `${SITE}/#organisation` },
              publisher: { "@id": `${SITE}/#organisation` },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "75tools", item: `${SITE}${ACCUEIL[lang]}` },
                { "@type": "ListItem", position: 2, name: categorie.nom[lang], item: `${SITE}${ACCUEIL[lang]}#${categorie.id}` },
                { "@type": "ListItem", position: 3, name: f.h1, item: url },
              ],
            },
            faqJsonLd(faq),
          ]}
        />
        <EnTete
          titre={f.h1}
          chapeau={f.chapeau}
          ariane={
            <nav aria-label={tr(lang, "Fil d'Ariane", "Breadcrumb")} className="mb-1.5 text-xs text-neutral-500">
              <Link to={ACCUEIL[lang]} className="hover:text-neutral-300">{accueil}</Link>
              <span aria-hidden="true"> › </span>
              <Link to={`${ACCUEIL[lang]}#${categorie.id}`} className="hover:text-neutral-300">{categorie.nom[lang]}</Link>
            </nav>
          }
        />
        <section
          data-outil
          aria-label={f.h1}
          className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-3 sm:p-6 print:border-0 print:p-0 print:bg-white"
        >
          {outil}
        </section>
        {children}
        <Faq faq={faq} />
        {sources.length > 0 && <Sources sources={sources} />}
        <AutresOutils courant={f.href} />
        <aside className="author mt-12 border-t border-neutral-800 pt-6 text-sm text-neutral-500 space-y-2 print:hidden" data-author>
          <p>
            {tr(lang, "Outil conçu et tenu à jour par l'équipe de 75tools, édité par la société Radif Partners", "Tool built and maintained by the 75tools team, published by Radif Partners")}
            {" ("}
            <a href={tr(lang, "/mentions-legales/#methode", "/en/legal-notice/#method")} className="underline underline-offset-4 hover:text-neutral-300">
              {tr(lang, "notre méthode", "our method")}
            </a>
            {"). "}
            {tr(lang, "Mis à jour le", "Updated on")} <time dateTime={OUTILS_MAJ}>{displayDate(OUTILS_MAJ, lang)}</time>.
          </p>
          <p>
            {tr(
              lang,
              "Les résultats sont donnés à titre indicatif : relisez le document ou le chiffre obtenu avant de vous en servir. Ils ne remplacent pas l'avis d'un professionnel (comptable, juriste, administration).",
              "Results are indicative: check the document or figure you get before relying on it. They do not replace advice from a professional (accountant, lawyer, the administration)."
            )}
          </p>
        </aside>
      </OutilLayout>
    </LangueContext.Provider>
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
export const NoteLocale = ({ className }: { className?: string }) => {
  const lang = useLangue();
  return (
    <p className={cn("text-sm text-neutral-500", className)}>
      {tr(
        lang,
        "Vos fichiers restent sur votre appareil : ils sont traités par votre navigateur, rien n'est envoyé à un serveur.",
        "Your files stay on your device: your browser processes them and nothing is sent to a server."
      )}
    </p>
  );
};

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
  const lang = useLangue();
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
      <p className="mt-3 text-sm text-neutral-400">{aide ?? (multiple ? tr(lang, "ou glissez vos fichiers ici", "or drop your files here") : tr(lang, "ou glissez votre fichier ici", "or drop your file here"))}</p>
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
