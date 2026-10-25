import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gabarit commun des pages-outils françaises (signature mail, QR vCard, modèles, NFC).
 * Fond neutral-950 comme l'accueil, titres en serif, une seule couleur d'accent (sky).
 * Les couleurs sont posées sur chaque élément : la feuille globale fixe la couleur des
 * h1/h2/h3 et l'emporterait sur une couleur héritée (RECETTE §10.4).
 */

export const OUTILS = [
  { href: "/signature-mail/", court: "Signature mail", long: "Générateur de signature mail" },
  { href: "/carte-de-visite-qr-code/", court: "QR vCard", long: "QR code de carte de visite (vCard)" },
  { href: "/modele-carte-de-visite/", court: "Modèles", long: "Modèles de carte de visite à imprimer" },
  { href: "/carte-de-visite-nfc/", court: "NFC ou QR", long: "Carte de visite NFC ou QR code" },
];

export const OutilLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const actif = (href: string) => pathname === href || pathname + "/" === href;

  return (
    <div className="min-h-screen bg-neutral-950 print:bg-white text-neutral-300 overflow-x-hidden">
      <header className="border-b border-neutral-800 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/fr/" className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">75tools</span>
          </Link>
          <nav aria-label="Outils" className="hidden lg:flex items-center gap-1 text-sm">
            {OUTILS.map((o) => (
              <Link
                key={o.href}
                to={o.href}
                className={cn(
                  "whitespace-nowrap px-3 py-2 rounded-md transition-colors",
                  actif(o.href) ? "text-white bg-neutral-900" : "text-neutral-400 hover:text-white"
                )}
              >
                {o.court}
              </Link>
            ))}
            <Link to="/mycard/" className="whitespace-nowrap px-3 py-2 text-neutral-400 hover:text-white">
              MyCard
            </Link>
          </nav>
          <Link to="/fr/" className="lg:hidden whitespace-nowrap text-sm text-neutral-400 hover:text-white">
            Tous les outils
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">{children}</main>

      <footer className="border-t border-neutral-800 mt-16 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-neutral-200 font-medium mb-3">Outils pour la carte de visite et la signature</p>
            <ul className="space-y-2">
              {OUTILS.map((o) => (
                <li key={o.href}>
                  <Link to={o.href} className="text-neutral-400 hover:text-white underline-offset-4 hover:underline">
                    {o.long}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/mycard/" className="text-neutral-400 hover:text-white underline-offset-4 hover:underline">
                  MyCard, carte de visite en ligne
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-neutral-500 space-y-2">
            <p>
              Ces outils fonctionnent dans votre navigateur : les coordonnées saisies ne sont ni envoyées ni
              enregistrées par 75tools.
            </p>
            <p>
              <Link to="/fr/" className="hover:text-neutral-300 underline-offset-4 hover:underline">Accueil 75tools</Link>
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

/** Renvois vers les autres outils de la famille, sauf la page courante. */
export const AutresOutils = ({ courant }: { courant: string }) => (
  <Section titre="Les autres outils">
    <ul className="grid gap-3 sm:grid-cols-2">
      {OUTILS.filter((o) => o.href !== courant).map((o) => (
        <li key={o.href}>
          <Link to={o.href} className="block border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
            <span className="text-neutral-100">{o.long}</span>
          </Link>
        </li>
      ))}
      <li>
        <Link to="/mycard/" className="block border border-neutral-800 rounded-lg px-4 py-3 !no-underline hover:border-neutral-600">
          <span className="text-neutral-100">MyCard : votre carte de visite en ligne, avec son lien et son QR code</span>
        </Link>
      </li>
    </ul>
  </Section>
);

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
}: {
  children: ReactNode;
  onClick?: () => void;
  secondaire?: boolean;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    className={cn(
      "h-11 px-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
      secondaire
        ? "border border-neutral-700 text-neutral-200 hover:border-neutral-500"
        : "bg-sky-400 text-neutral-950 hover:bg-sky-300"
    )}
  >
    {children}
  </button>
);
