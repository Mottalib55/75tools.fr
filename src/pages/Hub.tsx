import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CreditCard,
  Calculator,
  Dumbbell,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Language, getTranslations, Translations } from "@/lib/i18n";
import SEO from "@/components/SEO";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
  available: boolean;
  area: string;
}

interface HubProps {
  lang: Language;
}

const Hub = ({ lang }: HubProps) => {
  const navigate = useNavigate();
  const t = getTranslations(lang);
  const otherLang = lang === "fr" ? "en" : "fr";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tools: Tool[] = [
    {
      id: "mycard",
      name: t.tools.mycard.name,
      description: t.tools.mycard.description,
      icon: <CreditCard className="h-5 w-5" />,
      href: "/mycard",
      available: true,
      area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    },
    {
      id: "netsalaire",
      name: t.tools.netsalaire.name,
      description: t.tools.netsalaire.description,
      icon: <Calculator className="h-5 w-5" />,
      href: "https://www.netsalaire.com",
      external: true,
      available: true,
      area: "md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]",
    },
    {
      id: "gym-squad",
      name: t.tools.gymSquad.name,
      description: t.tools.gymSquad.description,
      icon: <Dumbbell className="h-5 w-5" />,
      href: "/gym",
      available: true,
      area: "md:[grid-area:2/1/3/13] xl:[grid-area:1/9/2/13]",
    },
    {
      id: "coming-1",
      name: t.tools.timeManagement.name,
      description: t.tools.timeManagement.description,
      icon: <Clock className="h-5 w-5" />,
      available: false,
      area: "md:[grid-area:3/1/4/7] xl:[grid-area:2/1/3/5]",
    },
    {
      id: "coming-2",
      name: t.tools.aiAssistant.name,
      description: t.tools.aiAssistant.description,
      icon: <Sparkles className="h-5 w-5" />,
      available: false,
      area: "md:[grid-area:3/7/4/13] xl:[grid-area:2/5/3/9]",
    },
    {
      id: "coming-3",
      name: t.tools.automation.name,
      description: t.tools.automation.description,
      icon: <Zap className="h-5 w-5" />,
      available: false,
      area: "md:[grid-area:4/1/5/13] xl:[grid-area:2/9/3/13]",
    },
  ];

  const handleToolClick = (tool: Tool) => {
    if (!tool.available || !tool.href) return;

    if (tool.external) {
      window.open(tool.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(tool.href);
    }
  };

  const switchLanguage = () => {
    navigate(`/${otherLang}`);
  };

  const seoContent = lang === "fr" ? {
    title: "75tools - Outils de productivité gratuits | Carte de visite digitale & plus",
    description: "Des solutions 100% gratuites pour booster votre productivité. Créez votre carte de visite digitale MyCard avec QR code, calculez votre salaire net avec NetSalaire et découvrez nos autres outils professionnels.",
    keywords: "outils productivité gratuits, carte visite digitale, carte visite numérique, QR code professionnel, calculateur salaire net, MyCard, NetSalaire, 75tools, outils business, carte professionnelle en ligne",
    url: "https://75tools.fr/fr",
    locale: "fr_FR" as const,
    alternateLocale: "en_US" as const,
    alternateUrl: "https://75tools.fr/en",
  } : {
    title: "75tools - Free Productivity Tools | Digital Business Card & more",
    description: "100% free solutions to boost your productivity. Create your digital business card MyCard with QR code, calculate your net salary with NetSalaire and discover our other professional tools.",
    keywords: "free productivity tools, digital business card, digital vcard, professional QR code, salary calculator, MyCard, NetSalaire, 75tools, business tools, online professional card",
    url: "https://75tools.fr/en",
    locale: "en_US" as const,
    alternateLocale: "fr_FR" as const,
    alternateUrl: "https://75tools.fr/fr",
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <SEO
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        url={seoContent.url}
        locale={seoContent.locale}
        alternateLocale={seoContent.alternateLocale}
        alternateUrl={seoContent.alternateUrl}
        imageAlt={lang === "fr" ? "75tools - Hub d'outils de productivité gratuits" : "75tools - Free Productivity Tools Hub"}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "75tools",
            url: "https://75tools.fr",
            description: seoContent.description,
            inLanguage: lang === "fr" ? "fr-FR" : "en-US",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://75tools.fr/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MyCard",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "150",
            },
          },
        ]}
      />
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">75tools</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-2 text-sm text-neutral-400 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                3 {t.header.toolsAvailable}
              </span>
              {/* Language Switcher */}
              <button
                onClick={switchLanguage}
                className="inline-flex items-center gap-2 text-sm text-neutral-400 bg-neutral-900 hover:bg-neutral-800 px-3 py-2 rounded-full border border-neutral-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase font-medium">{otherLang}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-900 text-neutral-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-neutral-800">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            {t.hero.badge}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            {t.hero.title1}
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            {t.hero.description}
          </p>
          <p className="text-sm text-neutral-500">
            {t.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-4 lg:gap-5 xl:max-h-[38rem] xl:grid-rows-2 max-w-6xl mx-auto">
            {tools.map((tool) => (
              <GridItem
                key={tool.id}
                tool={tool}
                onClick={() => handleToolClick(tool)}
                t={t}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="container mx-auto px-6 text-center text-neutral-500 text-sm">
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

interface GridItemProps {
  tool: Tool;
  onClick: () => void;
  t: Translations;
}

const GridItem = ({ tool, onClick, t }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", tool.area)}>
      <div
        onClick={tool.available ? onClick : undefined}
        className={cn(
          "relative h-full rounded-[1.25rem] border-[0.75px] p-2 md:rounded-[1.5rem] md:p-3",
          tool.available
            ? "border-neutral-800 cursor-pointer"
            : "border-neutral-800/50"
        )}
      >
        {tool.available && (
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={3}
          />
        )}
        <div
          className={cn(
            "relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] p-6 shadow-sm md:p-6",
            tool.available
              ? "bg-neutral-900 border-neutral-800"
              : "bg-neutral-900/50 border-neutral-800/50"
          )}
        >
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            {/* Icon */}
            <div
              className={cn(
                "w-fit rounded-lg border-[0.75px] p-2.5",
                tool.available
                  ? "border-neutral-700 bg-neutral-800 text-white"
                  : "border-neutral-800 bg-neutral-800/50 text-neutral-600"
              )}
            >
              {tool.icon}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-xl leading-tight font-semibold tracking-tight md:text-2xl",
                    tool.available ? "text-white" : "text-neutral-600"
                  )}
                >
                  {tool.name}
                </h3>
                {!tool.available && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {t.tools.comingSoon}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed md:text-base",
                  tool.available ? "text-neutral-400" : "text-neutral-600"
                )}
              >
                {tool.description}
              </p>
            </div>

            {/* Action */}
            {tool.available && (
              <div className="flex items-center gap-1.5 text-blue-400 text-sm font-medium mt-2 group-hover:gap-2 transition-all">
                <span>{t.tools.accessTool}</span>
                {tool.external ? (
                  <ExternalLink className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default Hub;
