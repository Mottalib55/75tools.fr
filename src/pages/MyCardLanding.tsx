import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Users, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";

const MyCardLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Modern Digital Card",
      description: "Create an elegant digital business card in minutes.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Sharing",
      description: "Share your card via a simple link or QR code.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "All Your Networks",
      description: "Gather all your social networks in one place.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Free",
      description: "Create and manage your card for free, forever.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SEO
        title="MyCard - Free Digital Business Card | Create Yours in 30 Seconds"
        description="Create your free professional digital business card in 30 seconds. Share your contact info, social networks and generate a custom QR code. No complex signup, no hidden fees."
        keywords="free digital business card, digital vcard, online business card, professional qr code contact, free business card, MyCard, create business card, share contact, digital networking, modern business card"
        url="https://75tools.fr/mycard"
        type="website"
        imageAlt="MyCard - Create your free digital business card"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MyCard",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "Create your free professional digital business card in 30 seconds",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "150",
              bestRating: "5",
              worstRating: "1",
            },
            featureList: "QR Code, Contact sharing, Social networks, vCard, Custom design",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is MyCard really free?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, MyCard is 100% free. Create your digital business card with no hidden fees or subscription.",
                },
              },
              {
                "@type": "Question",
                name: "How do I share my digital business card?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Share your card via a unique link or QR code that you can download and print.",
                },
              },
            ],
          },
        ]}
      />
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-slate-900" />
            </div>
            <span onClick={() => navigate("/")} className="text-xl font-bold text-white cursor-pointer hover:text-slate-200 transition-colors">MyCard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition-colors"
            >
              Create my card
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            New: Add WhatsApp and Telegram
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              digital
            </span>{" "}
            business card
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Create a professional digital business card for free.
            Share your contact info and social networks in one click.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="group flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-100 transition-all hover:scale-105"
            >
              Create my card for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/card/demo")}
              className="text-slate-300 hover:text-white transition-colors font-medium px-8 py-4"
            >
              See an example →
            </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-20 max-w-sm mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform hover:scale-105 transition-transform duration-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-1">Marie Martin</h3>
              <p className="text-slate-400 text-sm mb-4">UX Designer · Paris</p>
              <p className="text-slate-300 text-sm mb-6">
                Passionate about design and user experience.
              </p>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to create your card?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Join thousands of users who already share their digital card.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-slate-100 transition-colors"
            >
              Get started now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <p>© 2026 MyCard by <span onClick={() => navigate("/")} className="text-blue-400 hover:text-blue-300 cursor-pointer">75tools</span>. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyCardLanding;
