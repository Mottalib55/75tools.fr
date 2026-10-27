import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, OUTILS, categorieDe, outilsDe } from "@/lib/outils";

/**
 * Gabarit commun des pages-outils françaises. La liste des outils et leurs catégories vivent
 * dans src/lib/outils.ts (menu, pied de page, renvois).
 * Fond neutral-950 comme l'accueil, titres en serif, une seule couleur d'accent (sky).
 * Les couleurs sont posées sur chaque élément : la feuille globale fixe la couleur des
 * h1/h2/h3 et l'emporterait sur une couleur héritée (RECETTE §10.4).
 */

/** Menu « Tous les outils » : les catégories et leurs outils, liens présents dans le HTML même fermé. */
const MenuOutils = ({ actif }: { actif: (href: string) => boolean }) => {
  const [ouvert, setOuvert] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOuvert(false), [pathname]);
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
        Tous les outils
      </button>
      <nav
        id="menu-outils"
        aria-label="Tous les outils"
        className={cn(
          "absolute left-0 right-0 top-full z-50 border-b border-neutral-800 bg-neutral-950 shadow-2xl",
          ouvert ? "block" : "hidden"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-h-[80vh] overflow-y-auto">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">{c.nom}</p>
              <ul className="space-y-1 text-sm">
                {outilsDe(c.id).map((o) => (
                  <li key={o.href}>
                    <Link
                      to={o.href}
                      className={cn("hover:text-white", actif(o.href) ? "text-white" : "text-neutral-300")}
                    >
                      {o.court}
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

export const OutilLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const actif = (href: string) => pathname === href || pathname + "/" === href;
  const cat = categorieDe(pathname.endsWith("/") ? pathname : pathname + "/");
  const categorie = CATEGORIES.find((c) => c.id === cat);

  return (
    <div className="min-h-screen bg-neutral-950 print:bg-white text-neutral-300 overflow-x-hidden">
      <header className="relative border-b border-neutral-800 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/fr/" className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">75tools</span>
          </Link>
          {categorie && (
            <Link
              to={`/fr/#${categorie.id}`}
              className="hidden md:block mr-auto text-sm text-neutral-500 hover:text-white whitespace-nowrap"
            >
              {categorie.nom}
            </Link>
          )}
          <MenuOutils actif={actif} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>

      <footer className="border-t border-neutral-800 mt-16 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 text-sm">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <div key={c.id}>
                <p className="text-neutral-200 font-medium mb-3">{c.nom}</p>
                <ul className="space-y-2">
                  {outilsDe(c.id).map((o) => (
                    <li key={o.href}>
                      <Link to={o.href} className="text-neutral-400 hover:text-white underline-offset-4 hover:underline">
                        {o.long}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-neutral-500 space-y-2">
            <p>
              Ces outils fonctionnent dans votre navigateur : les textes, coordonnées et fichiers que vous y mettez
              ne sont ni envoyés ni enregistrés par 75tools.
            </p>
            <p>
              <Link to="/fr/" className="hover:text-neutral-300 underline-offset-4 hover:underline">Accueil 75tools</Link>
              {" · "}
              <Link to="/mycard/" className="hover:text-neutral-300 underline-offset-4 hover:underline">MyCard</Link>
              {" · "}
              <a href="/confidentialite/" className="hover:text-neutral-300 underline-offset-4 hover:underline">Confidentialité</a>
              {" · "}
              <a href="/mentions-legales/" className="hover:text-neutral-300 underline-offset-4 hover:underline">Mentions légales</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/** Titre de page et chapeau : l'outil suit immédiatement (premier écran). */
export const EnTete = ({ titre, chapeau }: { titre: string; chapeau: ReactNode }) => (
  <div className="pt-6 pb-5 sm:pt-8 sm:pb-6 print:hidden">
    <h1 className="text-[1.75rem] leading-tight sm:text-4xl font-semibold text-white tracking-tight [overflow-wrap:break-word]">
      {titre}
    </h1>
    <p className="mt-2 text-neutral-400 text-[0.95rem] sm:text-base leading-relaxed max-w-4xl">{chapeau}</p>
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

export const Faq = ({ faq }: { faq: QuestionFaq[] }) => (
  <Section id="faq" titre="Questions fréquentes">
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

export interface Source {
  titre: string;
  editeur: string;
  url: string;
  lu: string; // date de lecture, en toutes lettres
}

export const Sources = ({ sources }: { sources: Source[] }) => (
  <Section id="sources" titre="Sources">
    <ul className="space-y-2 text-sm text-neutral-400">
      {sources.map((s) => (
        <li key={s.url}>
          {s.editeur}, <a href={s.url} rel="noopener" target="_blank">{s.titre}</a>, page lue le {s.lu}.
        </li>
      ))}
    </ul>
  </Section>
);

/** Renvois vers les autres outils de la même catégorie, sauf la page courante. */
export const AutresOutils = ({ courant }: { courant: string }) => {
  const cat = categorieDe(courant);
  const voisins = OUTILS.filter((o) => o.categorie === cat && o.href !== courant);
  const categorie = CATEGORIES.find((c) => c.id === cat);
  return (
    <Section titre={categorie ? `Autres outils : ${categorie.nom.toLowerCase()}` : "Les autres outils"}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {voisins.map((o) => (
          <li key={o.href}>
            <Link to={o.href} className="block h-full border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
              <span className="block text-neutral-100">{o.long}</span>
              <span className="block text-sm text-neutral-500 mt-1">{o.description}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/fr/" className="block h-full border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
            <span className="block text-neutral-100">Tous les outils 75tools</span>
            <span className="block text-sm text-neutral-500 mt-1">PDF, images, QR codes, documents, calculs, minuteur et texte.</span>
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
