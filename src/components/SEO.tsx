import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  locale?: "fr_FR" | "en_US";
  alternateLocale?: "fr_FR" | "en_US";
  alternateUrl?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
  publishedTime?: string;
  modifiedTime?: string;
  appTitle?: string; // Custom title for "Add to Home Screen" on iOS
  exactTitle?: boolean; // titre servi tel quel, sans « | 75tools » (titres calibrés 50-60 caractères)
  /** hreflang complet (RECETTE §18) : chaque version, la page elle-même comprise, puis x-default. */
  alternates?: { hrefLang: string; href: string }[];
}

/**
 * L'éditeur, déclaré sur chaque page (RECETTE §8) : la société Radif Partners publie 75tools.
 * foundingDate : création du domaine 75tools.fr (registre AFNIC, 2026-01-11).
 */
export const ORGANISATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://75tools.fr/#organisation",
  name: "75tools",
  legalName: "Radif Partners",
  url: "https://75tools.fr/",
  logo: "https://75tools.fr/favicon.svg",
  email: "contact@75tools.fr",
  foundingDate: "2026-01-11",
  publishingPrinciples: "https://75tools.fr/mentions-legales/#methode",
  knowsAbout: [
    "PDF",
    "Conversion d'images",
    "QR code",
    "Facturation en France",
    "Signature électronique",
    "Calcul de TVA",
    "Outils web côté navigateur",
  ],
  description: "Outils gratuits en ligne qui fonctionnent dans le navigateur : PDF, images, QR codes, documents, calculs et texte.",
};

const SEO = ({
  title = "75tools - Outils de productivité gratuits",
  description = "Des solutions gratuites pour augmenter votre performance. Carte de visite digitale MyCard, calculateur salaire NetSalaire et plus d'outils professionnels.",
  keywords = "outils productivité, carte visite digitale, calculateur salaire, outils gratuits, MyCard, NetSalaire, 75tools, outils professionnels, business tools",
  url = "https://75tools.fr",
  image = "https://75tools.fr/og-image.png",
  imageAlt = "75tools - Hub d'outils de productivité gratuits",
  type = "website",
  locale = "fr_FR",
  alternateLocale,
  alternateUrl,
  noindex = false,
  jsonLd,
  publishedTime,
  modifiedTime,
  appTitle,
  exactTitle = false,
  alternates,
}: SEOProps) => {
  const fullTitle = exactTitle || title.includes("75tools") || title.includes("MyCard")
    ? title
    : `${title} | 75tools`;

  // Default Organization schema (always included)
  const organizationSchema = ORGANISATION;

  // Default WebSite schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "75tools",
    url: "https://75tools.fr",
    description: description,
    inLanguage: locale === "fr_FR" ? "fr-FR" : "en-US",
    publisher: {
      "@type": "Organization",
      name: "75tools",
    },
  };

  // Combine schemas
  const schemas = jsonLd
    ? (Array.isArray(jsonLd) ? [organizationSchema, ...jsonLd] : [organizationSchema, jsonLd])
    : [organizationSchema, websiteSchema];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="75tools" />
      <meta name="creator" content="75tools" />
      <meta name="publisher" content="75tools" />
      <link rel="canonical" href={url} />

      {/* Language */}
      <html lang={locale === "fr_FR" ? "fr" : "en"} />
      <meta httpEquiv="content-language" content={locale === "fr_FR" ? "fr" : "en"} />

      {/* Alternate Languages (hreflang) */}
      {alternates?.map((a) => (
        <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
      ))}
      {!alternates && alternateUrl && alternateLocale && (
        <>
          <link rel="alternate" hrefLang={locale === "fr_FR" ? "fr" : "en"} href={url} />
          <link rel="alternate" hrefLang={alternateLocale === "fr_FR" ? "fr" : "en"} href={alternateUrl} />
          <link rel="alternate" hrefLang="x-default" href={locale === "fr_FR" ? url : alternateUrl} />
        </>
      )}

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="75tools" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content={locale} />
      {alternateLocale && <meta property="og:locale:alternate" content={alternateLocale} />}

      {/* Article specific (for blog posts if needed) */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* Mobile & PWA */}
      <meta name="theme-color" content="#0a0a0a" />
      <meta name="msapplication-TileColor" content="#0a0a0a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={appTitle || "75tools"} />
      <meta name="application-name" content={appTitle || "75tools"} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />

      {/* Verification (add your own codes) */}
      {/* <meta name="google-site-verification" content="YOUR_CODE" /> */}
      {/* <meta name="msvalidate.01" content="YOUR_CODE" /> */}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemas)}
      </script>
    </Helmet>
  );
};

export default SEO;
