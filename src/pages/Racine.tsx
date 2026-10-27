import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { detectBrowserLanguage } from "@/lib/i18n";

/**
 * Racine du domaine (RECETTE §13) : une page, pas un sas. Elle porte noindex (les accueils indexés
 * sont /fr/ et /en/), le nom du site en titre, un canonical absolu et un lien en toutes lettres par
 * langue publiée, seul chemin vers l'autre langue quand le script ne s'exécute pas. Le visiteur est
 * ensuite envoyé vers la langue de son navigateur. Le pré-rendu (Chrome piloté, navigator.webdriver)
 * n'est pas redirigé : il enregistre cette page-ci.
 */
const Racine = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (navigator.webdriver) return;
    navigate(`/${detectBrowserLanguage()}/`, { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <SEO
        exactTitle
        title="75tools"
        description="75tools : outils gratuits en ligne (PDF, images, QR codes, documents, calculs) en français et en anglais. Free online tools in French and English."
        url="https://75tools.fr/"
        noindex
      />
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-white">75tools</h1>
        <p className="mt-4">Outils gratuits en ligne · Free online tools</p>
        <p className="mt-8 flex justify-center gap-4">
          <Link to="/fr/" hrefLang="fr" lang="fr" className="underline underline-offset-4 text-white">Français</Link>
          <Link to="/en/" hrefLang="en" lang="en" className="underline underline-offset-4 text-white">English</Link>
        </p>
      </main>
    </div>
  );
};

export default Racine;
