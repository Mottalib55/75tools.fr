import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CreditCard, Zap } from "lucide-react";
import SEO, { ORGANISATION } from "@/components/SEO";
import { LIENS_SERVICE, type QuestionFaq, faqJsonLd } from "@/components/outils/OutilLayout";
import { LAST_UPDATED, displayDate } from "@/lib/last-updated";

/**
 * MyCard, la carte de visite numérique de 75tools (page en anglais seulement, comme l'application).
 * Premier écran : titre, une phrase, le bouton de création et l'exemple de carte (RECETTE §5).
 * La FAQ visible et les données FAQPage viennent de la même liste (RECETTE §7).
 */

const URL_PAGE = "https://75tools.fr/mycard/";
const TITRE = "Free Digital Business Card With a QR Code | MyCard";
const META =
  "Make a free digital business card in two minutes: one link and one QR code for your phone, email, website and social profiles, with a vCard contacts can save.";
const LU = "27 October 2026";

const FAQ: QuestionFaq[] = [
  {
    q: "Is MyCard really free?",
    r: "Yes. Creating, editing and sharing a MyCard costs nothing, with no trial period, no paid tier and no advertising on your card. You only need an email address and a password to create an account, because the card is published on its own web page and you need to be able to update it later. You can ask for the account and the card to be deleted at any time by writing to contact@75tools.fr.",
  },
  {
    q: "How do I share my digital business card?",
    r: "Each card has its own address, 75tools.fr/card/ followed by the username you choose. Send that link by email, text message or WhatsApp, add it to your email signature, or show the QR code generated in your dashboard: the other person scans it with their phone camera and the card opens in the browser, with no app to install on either side.",
  },
  {
    q: "Can people save my details straight to their contacts?",
    r: "Yes. The card has a button that downloads a vCard file (.vcf) built from your name, job title, company, phone, email and website. vCard is the standard contact format described in RFC 6350, which iPhone, Android, Outlook and Gmail can all import, so the contact lands in the address book in one tap instead of being typed by hand.",
  },
  {
    q: "What can I put on my card?",
    r: "Your name, photo, job title, company and a short description, then the contact details and profiles you want to show: phone, email, website, WhatsApp, Telegram, LinkedIn, X, Instagram, Facebook, TikTok, YouTube, Snapchat and GitHub. Each line can be switched on or off, so you can keep one card for work and hide the personal profiles you would rather not share.",
  },
  {
    q: "Who can see the statistics of my card?",
    r: "Only you, in your dashboard. MyCard counts views of the card, saved contacts and clicks on WhatsApp and LinkedIn, day by day. It never shows who visited: only the type of action, the date, the browser and the referring page are recorded, never a name or an email. The privacy page lists the data stored, the providers used and how long everything is kept, as required by the GDPR.",
  },
  {
    q: "Is a MyCard the same as an NFC business card?",
    r: "Not quite. An NFC card is a physical card with a chip that opens a link when it touches a phone. MyCard is the page that link can open: you can write your MyCard address on an NFC card or sticker, print its QR code on a paper card, or simply send the link. The free NFC test on 75tools helps you choose between NFC and a printed QR code.",
  },
];

const SOURCES = [
  { titre: "RFC 6350: vCard Format Specification", editeur: "IETF, RFC Editor", url: "https://www.rfc-editor.org/rfc/rfc6350" },
  { titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification", editeur: "ISO", url: "https://www.iso.org/standard/62021.html" },
  { titre: "GDPR developer's guide", editeur: "CNIL", url: "https://www.cnil.fr/en/gdpr-developers-guide" },
];

const ETAPES = [
  ["Create your account", "Email and password, nothing else. Choose the username that will appear in your card address."],
  ["Fill in your card", "Name, photo, job title, then the contact details and profiles you want to show, each with its own switch."],
  ["Share it", "Copy the link, download the QR code as a PNG, or write the link on an NFC card. Update it whenever you like."],
];

const MyCardLanding = () => {
  // Connexion, inscription et carte d'exemple sont des écrans d'application non pré-rendus : boutons, pas liens.
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 overflow-x-hidden">
      <SEO
        title={TITRE}
        exactTitle
        description={META}
        url={URL_PAGE}
        locale="en_US"
        type="website"
        imageAlt="MyCard, a free digital business card by 75tools"
        modifiedTime={LAST_UPDATED}
        jsonLd={[
          ORGANISATION,
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MyCard",
            url: URL_PAGE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "en",
            description: META,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            featureList: "Digital business card, QR code, vCard download, social profiles, view statistics",
            publisher: { "@id": ORGANISATION["@id"] },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            url: URL_PAGE,
            name: TITRE,
            inLanguage: "en",
            dateModified: LAST_UPDATED,
            publisher: { "@id": ORGANISATION["@id"] },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "75tools", item: "https://75tools.fr/en/" },
              { "@type": "ListItem", position: 2, name: "MyCard", item: URL_PAGE },
            ],
          },
          faqJsonLd(FAQ),
        ]}
      />

      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link to="/en/" className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">75tools</span>
          </Link>
          <button type="button" onClick={() => navigate("/login")} className="inline-flex items-center h-10 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
            Log in
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="pt-4 text-sm text-neutral-500">
          <Link to="/en/" className="hover:text-white">75tools</Link> <span aria-hidden="true">›</span> <span>MyCard</span>
        </nav>

        <section data-outil aria-label="Create your MyCard" className="grid gap-8 md:grid-cols-[minmax(0,1fr)_20rem] items-start pt-4 pb-10">
          <div>
            <h1 className="text-[1.9rem] leading-tight sm:text-5xl font-semibold text-white tracking-tight">
              Free digital business card
            </h1>
            <p className="mt-3 text-neutral-400 text-base sm:text-lg max-w-2xl">
              One link and one QR code for your phone, email, website and social profiles. Contacts save you in one tap.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-white text-neutral-950 font-semibold hover:bg-neutral-200"
              >
                Create my card for free <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => navigate("/card/demo")}
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-neutral-700 text-neutral-200 hover:border-neutral-500"
              >
                See an example card
              </button>
            </div>
            <p className="mt-3 text-sm text-neutral-500">No app to install, no fee, no advertising. Account needed to publish your card.</p>
          </div>

          <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-900/60" aria-label="Example of a MyCard">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center mb-3">
                <CreditCard className="w-8 h-8 text-neutral-300" aria-hidden="true" />
              </div>
              <p className="text-lg font-semibold text-white">Marie Martin</p>
              <p className="text-sm text-neutral-400">UX Designer · Paris</p>
              <ul className="mt-4 w-full space-y-2 text-sm">
                {["Save contact", "Phone", "Email", "LinkedIn"].map((x) => (
                  <li key={x} className="h-10 flex items-center justify-center rounded-lg border border-neutral-700 text-neutral-200">{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-800 pt-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">How MyCard works</h2>
          <div className="space-y-4 leading-relaxed">
            <p>
              A paper business card runs out, goes out of date the day you change jobs and ends up in a drawer before anyone types your
              number into a phone. MyCard replaces it with a page of your own at 75tools.fr/card/ followed by your username. On that page,
              visitors find your photo, your job title, your company and every way to reach you, from a phone call to a LinkedIn profile.
              A button downloads your details as a vCard file, the contact format standardised by the IETF in RFC 6350, so they arrive
              in the address book without a typing mistake. The QR code of the card follows the ISO/IEC 18004 standard and opens it from
              any phone camera. When your number or your job changes, you edit the card once and every link and QR code already shared
              shows the new details.
            </p>
            <ol className="grid gap-4 sm:grid-cols-3 list-none p-0">
              {ETAPES.map(([t, d], i) => (
                <li key={t} className="border border-neutral-800 rounded-lg p-4">
                  <p className="text-white font-medium">{i + 1}. {t}</p>
                  <p className="mt-1 text-sm text-neutral-400">{d}</p>
                </li>
              ))}
            </ol>
            <p>
              Related free tools: the <Link to="/en/vcard-qr-code/" className="text-sky-300 underline underline-offset-4">vCard QR code generator</Link> for
              a QR code without an account, the <Link to="/en/business-card-templates/" className="text-sky-300 underline underline-offset-4">business card templates</Link> to
              print a paper card that carries your MyCard QR code, and the <Link to="/en/nfc-business-card/" className="text-sky-300 underline underline-offset-4">NFC business card test</Link>.
            </p>
          </div>
        </section>

        <section id="faq" className="mt-14 border-t border-neutral-800 pt-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">Frequently asked questions</h2>
          <div className="divide-y divide-neutral-800 border-y border-neutral-800">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none flex justify-between gap-4 text-neutral-100 font-medium">
                  <span>{f.q}</span>
                  <span className="text-neutral-500 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-neutral-400 leading-relaxed">{f.r}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="sources" className="mt-14 border-t border-neutral-800 pt-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">Sources</h2>
          <ul className="space-y-2 text-sm text-neutral-400">
            {SOURCES.map((s) => (
              <li key={s.url}>
                {s.editeur}, <a href={s.url} rel="noopener nofollow" target="_blank" className="text-sky-300 underline underline-offset-4">{s.titre}</a>, page read on {LU}.
              </li>
            ))}
          </ul>
        </section>

        <aside className="author mt-14 border-t border-neutral-800 pt-6 text-sm text-neutral-500" data-author>
          <p>
            MyCard is built and maintained by Radif Partners, publisher of 75tools (<a href="/en/legal-notice/#method" className="underline underline-offset-4">our method</a>).
            Page updated on <time dateTime={LAST_UPDATED}>{displayDate(LAST_UPDATED, "en")}</time>.
          </p>
          <p className="mt-2">
            Information given for guidance only; it does not replace the advice of a professional for your own situation.
          </p>
        </aside>
      </main>

      <footer className="border-t border-neutral-800 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-neutral-500 space-y-2">
          <p>
            Page updated on <time dateTime={LAST_UPDATED}>{displayDate(LAST_UPDATED, "en")}</time>.
          </p>
          <p>
            <Link to="/en/" className="hover:text-neutral-300">75tools home</Link>
            {LIENS_SERVICE.en.map((l) => (
              <span key={l.href}>
                {" · "}
                <a href={l.href} className="hover:text-neutral-300">{l.texte}</a>
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MyCardLanding;
