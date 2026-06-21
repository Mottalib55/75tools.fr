export type Language = "fr" | "en";

export const translations = {
  fr: {
    header: {
      toolsAvailable: "outils disponibles",
    },
    hero: {
      badge: "Nouveaux outils en préparation",
      title1: "Vos outils de",
      title2: "productivité",
      description: "Des solutions gratuites pour augmenter votre performance et éclairer vos décisions professionnelles.",
      subtitle: "Gratuit • Sans inscription • Accessible à tous",
    },
    tools: {
      mycard: {
        name: "MyCard",
        description: "Créez votre carte de visite digitale professionnelle. Partagez vos contacts et réseaux sociaux en un seul clic.",
      },
      netsalaire: {
        name: "NetSalaire",
        description: "Calculez instantanément votre salaire net à partir du brut. Simulez vos revenus avec précision.",
      },
      gymSquad: {
        name: "Gym Squad",
        description: "Coordonnez vos séances de sport avec votre équipe. Planifiez qui va à la salle et quand.",
      },
      seoDashboard: {
        name: "SEO Dashboard",
        description: "Tableau de bord SEO multi-sites. Suivez vos performances Google Search Console et Bing en temps réel.",
      },
      timeManagement: {
        name: "Gestion de Temps",
        description: "Optimisez votre productivité avec notre outil de gestion du temps intelligent.",
      },
      aiAssistant: {
        name: "Assistant IA",
        description: "Boostez votre efficacité avec notre assistant intelligent propulsé par l'IA.",
      },
      automation: {
        name: "Automatisation",
        description: "Automatisez vos tâches répétitives et gagnez un temps précieux chaque jour.",
      },
      accessTool: "Accéder à l'outil",
      comingSoon: "Bientôt",
    },
    footer: {
      copyright: "© 2025 75tools. Tous droits réservés.",
    },
  },
  en: {
    header: {
      toolsAvailable: "tools available",
    },
    hero: {
      badge: "New tools coming soon",
      title1: "Your",
      title2: "productivity tools",
      description: "Free solutions to boost your performance and inform your professional decisions.",
      subtitle: "Free • No signup • Accessible to all",
    },
    tools: {
      mycard: {
        name: "MyCard",
        description: "Create your professional digital business card. Share your contacts and social networks in one click.",
      },
      netsalaire: {
        name: "NetSalaire",
        description: "Instantly calculate your net salary from gross. Simulate your income with precision.",
      },
      gymSquad: {
        name: "Gym Squad",
        description: "Coordinate your gym sessions with your team. Plan who's going to the gym and when.",
      },
      seoDashboard: {
        name: "SEO Dashboard",
        description: "Multi-site SEO dashboard. Track your Google Search Console and Bing performance in real time.",
      },
      timeManagement: {
        name: "Time Management",
        description: "Optimize your productivity with our intelligent time management tool.",
      },
      aiAssistant: {
        name: "AI Assistant",
        description: "Boost your efficiency with our AI-powered intelligent assistant.",
      },
      automation: {
        name: "Automation",
        description: "Automate your repetitive tasks and save precious time every day.",
      },
      accessTool: "Access tool",
      comingSoon: "Soon",
    },
    footer: {
      copyright: "© 2025 75tools. All rights reserved.",
    },
  },
} as const;

export type Translations = typeof translations.fr;

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  const lang = browserLang.split("-")[0].toLowerCase();
  return lang === "fr" ? "fr" : "en";
}

export function getLanguageFromPath(pathname: string): Language | null {
  if (pathname.startsWith("/fr")) return "fr";
  if (pathname.startsWith("/en")) return "en";
  return null;
}
