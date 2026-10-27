import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCUEIL, CATEGORIES, OUTILS, autreLangue, categorieDe, langueDe, outilsDe, type Langue } from "@/lib/outils";
import { useLangue, tr } from "@/lib/langue";
import { OUTILS_MAJ, displayDate } from "@/lib/last-updated";

/**
 * Gabarit commun des pages-outils, en français et en anglais. La liste des outils, leurs catégories
 * et leurs adresses dans les deux langues vivent dans src/lib/outils.ts (menu, pied de page, renvois).
 * Fond neutral-950 comme l'accueil, titres en serif, une seule couleur d'accent (sky).
 * Les couleurs sont posées sur chaque élément : la feuille globale fixe la couleur des
 * h1/h2/h3 et l'emporterait sur une couleur héritée (RECETTE §10.4).
 */

/** Liens du pied de page vers les pages de service (RECETTE §8.4 et §6.6 : légal, confidentialité, à propos, méthode). */
export const LIENS_SERVICE: Record<Langue, { href: string; texte: string }[]> = {
  fr: [
    { href: "/mentions-legales/#a-propos", texte: "À propos" },
    { href: "/mentions-legales/#methode", texte: "Méthode et sources" },
    { href: "/confidentialite/", texte: "Confidentialité" },
    { href: "/mentions-legales/", texte: "Mentions légales" },
  ],
  en: [
    { href: "/en/legal-notice/#about", texte: "About" },
    { href: "/en/legal-notice/#method", texte: "Method and sources" },
    { href: "/en/privacy/", texte: "Privacy" },
    { href: "/en/legal-notice/", texte: "Legal notice" },
  ],
};

/** Menu « Tous les outils » : les catégories et leurs outils, liens présents dans le HTML même fermé. */
const MenuOutils = ({ lang, actif }: { lang: Langue; actif: (href: string) => boolean }) => {
  const [ouvert, setOuvert] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOuvert(false), [pathname]);
  const libelle = tr(lang, "Tous les outils", "All tools");
  return (
    <>
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls="menu-outils"
        onClick={() => setOuvert((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500 whitespace-nowrap"
      >
        {ouvert ? <X className="w-4 h-4" aria-hidden="true" /> : <Menu className="w-4 h-4" aria-hidden="true" />}
        {libelle}
      </button>
      <nav
        id="menu-outils"
        aria-label={libelle}
        className={cn(
          "absolute left-0 right-0 top-full z-50 border-b border-neutral-800 bg-neutral-950 shadow-2xl",
          ouvert ? "block" : "hidden"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-h-[80vh] overflow-y-auto">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">{c.nom[lang]}</p>
              <ul className="space-y-1 text-sm">
                {outilsDe(c.id).map((o) => (
                  <li key={o.id}>
                    <Link
                      to={o[lang].href}
                      className={cn("hover:text-white", actif(o[lang].href) ? "text-white" : "text-neutral-300")}
                    >
                      {o[lang].court}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export const OutilLayout = ({ children, lang: langProp }: { children: ReactNode; lang?: Langue }) => {
  const { pathname } = useLocation();
  const lang = langProp ?? langueDe(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const actif = (href: string) => pathname === href || pathname + "/" === href;
  const cat = categorieDe(pathname);
  const categorie = CATEGORIES.find((c) => c.id === cat);
  const autre = autreLangue(pathname);

  return (
    <div className="min-h-screen bg-neutral-950 print:bg-white text-neutral-300 overflow-x-hidden">
      <header className="relative border-b border-neutral-800 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link to={ACCUEIL[lang]} className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">75tools</span>
          </Link>
          {categorie && (
            <Link
              to={`${ACCUEIL[lang]}#${categorie.id}`}
              className="hidden md:block mr-auto text-sm text-neutral-500 hover:text-white whitespace-nowrap"
            >
              {categorie.nom[lang]}
            </Link>
          )}
          <div className="flex items-center gap-2">
            {autre && (
              <Link
                to={autre}
                hrefLang={lang === "fr" ? "en" : "fr"}
                lang={lang === "fr" ? "en" : "fr"}
                className="inline-flex items-center h-10 px-3 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500 whitespace-nowrap"
                aria-label={lang === "fr" ? "English version" : "Version française"}
              >
                {lang === "fr" ? "EN" : "FR"}
              </Link>
            )}
            <MenuOutils lang={lang} actif={actif} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>

      <footer className="border-t border-neutral-800 mt-16 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-sm">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <div key={c.id}>
                <p className="text-neutral-200 font-medium mb-3">{c.nom[lang]}</p>
                <ul className="space-y-2">
                  {outilsDe(c.id).map((o) => (
                    <li key={o.id}>
                      <Link to={o[lang].href} className="text-neutral-400 hover:text-white underline-offset-4 hover:underline">
                        {o[lang].long}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-neutral-500 space-y-2">
            <p>
              {tr(lang, "Pages mises à jour le", "Pages updated on")} <time dateTime={OUTILS_MAJ}>{displayDate(OUTILS_MAJ, lang)}</time>.
            </p>
            <p>
              {tr(
                lang,
                "Ces outils fonctionnent dans votre navigateur : les textes, coordonnées et fichiers que vous y mettez ne sont ni envoyés ni enregistrés par 75tools.",
                "These tools run in your browser: the text, details and files you put in them are neither sent to nor stored by 75tools."
              )}
            </p>
            <p>
              <Link to={ACCUEIL[lang]} className="hover:text-neutral-300 underline-offset-4 hover:underline">
                {tr(lang, "Accueil 75tools", "75tools home")}
              </Link>
              {" · "}
              <Link to="/mycard/" className="hover:text-neutral-300 underline-offset-4 hover:underline">MyCard</Link>
              {LIENS_SERVICE[lang].map((l) => (
                <span key={l.href}>
                  {" · "}
                  <a href={l.href} className="hover:text-neutral-300 underline-offset-4 hover:underline">{l.texte}</a>
                </span>
              ))}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/** Titre de page et chapeau d'une ou deux lignes : l'outil suit immédiatement (premier écran, RECETTE §5). */
export const EnTete = ({ titre, chapeau, ariane }: { titre: string; chapeau: ReactNode; ariane?: ReactNode }) => (
  <div className="pt-4 pb-4 sm:pt-6 sm:pb-5 print:hidden">
    {ariane}
    <h1 className="text-[1.6rem] leading-tight sm:text-4xl font-semibold text-white tracking-tight [overflow-wrap:break-word]">
      {titre}
    </h1>
    <p className="mt-2 text-neutral-400 text-[0.95rem] sm:text-base leading-snug sm:leading-relaxed max-w-4xl">{chapeau}</p>
  </div>
);

export const Section = ({ id, titre, children }: { id?: string; titre: string; children: ReactNode }) => (
  <section id={id} className="mt-14 border-t border-neutral-800 pt-8 print:hidden">
    <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">{titre}</h2>
    <div className="space-y-4 leading-relaxed text-neutral-300 [&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-4 [&_h3]:text-white [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_strong]:text-neutral-100">
      {children}
    </div>
  </section>
);

export interface QuestionFaq {
  q: string;
  r: string;
}

/** FAQ visible (details natifs, réponse dans le HTML) et données FAQPage produites par la même liste. */
export const faqJsonLd = (faq: QuestionFaq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.r },
  })),
});

export const Faq = ({ faq }: { faq: QuestionFaq[] }) => {
  const lang = useLangue();
  return (
    <Section id="faq" titre={tr(lang, "Questions fréquentes", "Frequently asked questions")}>
      <div className="divide-y divide-neutral-800 border-y border-neutral-800">
        {faq.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between gap-4 text-neutral-100 font-medium">
              <span>{f.q}</span>
              <span className="text-neutral-500 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-neutral-400 leading-relaxed">{f.r}</p>
          </details>
        ))}
      </div>
    </Section>
  );
};

export interface Source {
  titre: string;
  editeur: string;
  url: string;
  lu: string; // date de lecture, en toutes lettres dans la langue de la page (« 27 octobre 2026 », « 27 October 2026 »)
}

export const Sources = ({ sources }: { sources: Source[] }) => {
  const lang = useLangue();
  return (
    <Section id="sources" titre="Sources">
      <ul className="space-y-2 text-sm text-neutral-400">
        {sources.map((s) => (
          <li key={s.url}>
            {s.editeur}, <a href={s.url} rel="noopener nofollow" target="_blank">{s.titre}</a>
            {tr(lang, `, page lue le ${s.lu}.`, `, page read on ${s.lu}.`)}
          </li>
        ))}
      </ul>
    </Section>
  );
};

/** Renvois vers les autres outils de la même catégorie, sauf la page courante. */
export const AutresOutils = ({ courant }: { courant: string }) => {
  const lang = useLangue();
  const cat = categorieDe(courant);
  const voisins = OUTILS.filter((o) => o.categorie === cat && o.fr.href !== courant && o.en.href !== courant);
  const categorie = CATEGORIES.find((c) => c.id === cat);
  return (
    <Section
      titre={
        categorie
          ? tr(lang, `Autres outils : ${categorie.nom.fr.toLowerCase()}`, `More tools: ${categorie.nom.en.toLowerCase()}`)
          : tr(lang, "Les autres outils", "More tools")
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {voisins.map((o) => (
          <li key={o.id}>
            <Link to={o[lang].href} className="block h-full border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
              <span className="block text-neutral-100">{o[lang].long}</span>
              <span className="block text-sm text-neutral-500 mt-1">{o[lang].carte}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to={ACCUEIL[lang]} className="block h-full border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
            <span className="block text-neutral-100">{tr(lang, "Tous les outils 75tools", "All 75tools tools")}</span>
            <span className="block text-sm text-neutral-500 mt-1">
              {tr(lang, "PDF, images, QR codes, documents, calculs, minuteur et texte.", "PDF, images, QR codes, documents, calculators, timer and text.")}
            </span>
          </Link>
        </li>
      </ul>
    </Section>
  );
};

/** Champ de saisie sombre, 48 px de haut (RECETTE §10.3). */
export const Champ = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  aide,
  autoComplete,
  name,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  aide?: string;
  autoComplete?: string;
  name?: string;
}) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-400"
    />
    {aide && <span className="block text-xs text-neutral-500 mt-1">{aide}</span>}
  </label>
);

export const Bouton = ({
  children,
  onClick,
  secondaire = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondaire?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-11 px-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
      secondaire
        ? "border border-neutral-700 text-neutral-200 hover:border-neutral-500"
        : "bg-sky-400 text-neutral-950 hover:bg-sky-300"
    )}
  >
    {children}
  </button>
);
