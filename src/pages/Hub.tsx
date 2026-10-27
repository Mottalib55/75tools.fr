import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import SEO from "@/components/SEO";
import { Faq, faqJsonLd, LIENS_SERVICE, QuestionFaq } from "@/components/outils/OutilLayout";
import { LangueContext, tr } from "@/lib/langue";
import { LAST_UPDATED, displayDate } from "@/lib/last-updated";
import { CATEGORIES, OUTILS, outilsDe, type Langue } from "@/lib/outils";

/**
 * Accueils /fr/ et /en/ : le sommaire des outils, groupés par catégorie (registre src/lib/outils.ts),
 * puis comment ils fonctionnent, les textes officiels sur lesquels ils s'appuient et une FAQ propre à
 * l'accueil. La grille porte `data-sommaire` : c'est une page d'orientation (RECETTE §9).
 * Aucun lien vers un autre site du portefeuille (RECETTE §6.5).
 */

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Les outils de 75tools sont-ils vraiment gratuits, sans version payante cachée ?",
      r: "Oui. Chaque outil s'utilise en entier sans payer ni créer de compte : pas de filigrane sur les PDF, pas de limite de fichiers par jour, pas de QR code qui expire au bout d'un mois. Le site ne vend ni abonnement ni option premium. Il mesure seulement son audience avec Google Analytics, comme le détaille la page confidentialité, pour savoir quels outils améliorer.",
    },
    {
      q: "Quand je dépose un PDF ou une photo, le fichier part-il sur un serveur ?",
      r: "Non. Les outils de PDF, d'image, de QR code et de texte tournent dans votre navigateur, avec des bibliothèques chargées sur la page : le fichier est lu et transformé sur votre appareil, puis téléchargé depuis votre appareil. Rien n'est envoyé ni conservé par 75tools. C'est ce qui permet de traiter un avis d'imposition ou une pièce d'identité sans la confier à un tiers.",
    },
    {
      q: "Est-ce que les outils fonctionnent sur un téléphone ou une tablette ?",
      r: "Oui, sur un navigateur récent : Safari sur iPhone et iPad, Chrome ou Samsung Internet sur Android. Les pages sont pensées pour un écran de 390 pixels de large, l'outil apparaît en haut. Les traitements lourds, comme compresser un PDF de cent pages en mode fort, prennent simplement plus de temps sur un téléphone ancien que sur un ordinateur, puisque tout se fait sur l'appareil.",
    },
    {
      q: "Qui publie 75tools et comment les outils sont-ils vérifiés ?",
      r: "75tools est édité par la société Radif Partners. Chaque outil est testé sur des cas connus avant sa mise en ligne : un PDF de plusieurs pages, une photo d'iPhone, une facture en franchise de TVA. Les règles françaises reprises par les documents (mentions de facture, taux de TVA, attestation d'hébergement) sont relues sur service-public.fr ou impots.gouv.fr, et la date de lecture figure sous chaque page.",
    },
    {
      q: "Puis-je utiliser une facture ou une attestation produite ici dans un cadre professionnel ?",
      r: "Oui, ce sont des documents ordinaires que vous complétez et dont vous restez responsable. Le générateur de facture ajoute les mentions obligatoires selon votre statut, mais c'est vous qui vérifiez les montants, le numéro et votre SIREN. Pour une situation particulière, comme une vente à l'étranger ou un régime de TVA spécifique, demandez confirmation à votre comptable ou au service des impôts.",
    },
    {
      q: "Un outil ne marche pas ou donne un résultat faux, comment le signaler ?",
      r: "Écrivez à contact@75tools.fr en indiquant l'adresse de la page, votre navigateur et, si possible, le fichier ou les valeurs qui posent problème, sans données personnelles. Les erreurs de calcul et les bugs d'affichage sur téléphone sont corrigés en priorité. Une règle française qui change, par exemple le calendrier de la facturation électronique, est mise à jour dès sa publication officielle.",
    },
  ],
  en: [
    {
      q: "Are the 75tools tools really free, with no hidden paid tier?",
      r: "Yes. Every tool works in full without paying or creating an account: no watermark on your PDFs, no daily file limit and no QR code that stops working after a month. The site sells no subscription and no premium option. It only measures its audience with Google Analytics, as explained on the privacy page, to know which tools to improve next.",
    },
    {
      q: "When I drop a PDF or a photo, is the file uploaded to a server?",
      r: "No. The PDF, image, QR code and text tools run inside your browser with libraries loaded on the page: the file is read and transformed on your own device, then downloaded from it. Nothing is sent to or kept by 75tools. That is why you can process a French tax notice, a payslip or an ID scan without handing it to a third party.",
    },
    {
      q: "Do the tools work on a phone or a tablet?",
      r: "Yes, in any recent browser: Safari on iPhone and iPad, Chrome or Samsung Internet on Android. Pages are designed for a 390-pixel-wide screen and the tool sits at the top. Heavy jobs, such as compressing a hundred-page PDF with the strong mode, simply take longer on an older phone than on a laptop, since all the work happens on your device.",
    },
    {
      q: "Why are some tools about French invoices, VAT or attestations?",
      r: "75tools is a French site, and its English pages are written for people who live or work in France: expats, cross-border workers and freelancers. The document tools follow French rules, such as the mandatory invoice mentions, the 20%, 10%, 5.5% and 2.1% VAT rates and the Service Public model of the attestation d'hébergement. The documents themselves stay in French, because that is what French offices expect.",
    },
    {
      q: "Who publishes 75tools and how are the tools checked?",
      r: "75tools is published by the French company Radif Partners. Each tool is tested on known cases before release: a multi-page PDF, an iPhone photo, an invoice under the VAT exemption. The French rules used by the documents are checked against service-public.fr or impots.gouv.fr, and the date we read each source is shown at the bottom of every page.",
    },
    {
      q: "A tool is broken or gives a wrong result, how do I report it?",
      r: "Email contact@75tools.fr with the page address, your browser and, if you can, the file or values that cause the problem, without personal data. Calculation errors and display bugs on phones are fixed first. When a French rule changes, for example the timetable of mandatory e-invoicing, the tool is updated as soon as the official text is published.",
    },
  ],
};

const TEXTES = {
  fr: {
    titre: "Outils gratuits en ligne : PDF, images, QR code | 75tools",
    meta: "Outils gratuits en ligne : PDF, images, QR codes, facture, devis, CV, pourcentage, minuteur et compteur de mots. Sans inscription, et rien n'est envoyé.",
    h1: "Outils gratuits en ligne",
    intro: `PDF, images, QR codes, documents, calculs, minuteur et texte : ${OUTILS.length} outils qui fonctionnent dans votre navigateur, sans inscription.`,
    categories: "Catégories",
    applications: "Applications 75tools",
    mycard: "Carte de visite en ligne MyCard : une page de contact à partager par lien ou QR code (en anglais).",
    commentTitre: "Comment fonctionnent ces outils",
    comment:
      "Tous les outils de 75tools travaillent dans votre navigateur. Quand vous compressez un PDF, convertissez une photo d'iPhone en JPG ou créez un QR code, le fichier est ouvert et transformé par votre appareil grâce à des bibliothèques chargées avec la page (pdf-lib et pdf.js pour les PDF, le canvas du navigateur pour les images), puis vous le téléchargez directement : il ne passe par aucun serveur et 75tools n'en garde aucune copie. Les documents (facture, devis, lettre de résiliation, attestations) suivent les règles françaises lues sur les sites officiels, avec la date de lecture indiquée en bas de chaque page. Les calculs (pourcentage, TVA, marge, jours entre deux dates) montrent leur formule pour que vous puissiez les refaire à la main. Chaque outil reste gratuit, sans compte et sans limite d'usage.",
    sourcesTitre: "Textes officiels utilisés",
    maj: "Mis à jour le",
    autre: { href: "/en/", texte: "English", code: "en" },
  },
  en: {
    titre: "Free Online Tools: PDF, Images, QR Codes, Invoices | 75tools",
    meta: "Free online tools that run in your browser: compress and merge PDFs, convert HEIC or WebP, QR codes, French invoices and VAT, timer and word counter. No upload.",
    h1: "Free online tools",
    intro: `PDF, images, QR codes, French documents, calculators, timer and text: ${OUTILS.length} tools that run in your browser, with no sign-up.`,
    categories: "Categories",
    applications: "75tools apps",
    mycard: "MyCard online business card: a contact page to share by link or QR code.",
    commentTitre: "How these tools work",
    comment:
      "Every 75tools tool runs inside your browser. When you compress a PDF, turn an iPhone photo into a JPG or create a QR code, your own device opens and transforms the file with libraries loaded alongside the page (pdf-lib and pdf.js for PDFs, the browser canvas for images), and you download the result straight away: it never goes through a server and 75tools keeps no copy. The document tools (invoice, quote, cancellation letter, attestations) follow French rules read on official websites, and the date we read them is shown at the bottom of each page; the documents stay in French because French offices expect them that way. Calculators (percentage, VAT, margin, days between dates) show their formula so you can check them by hand. Every tool is free, with no account and no usage limit.",
    sourcesTitre: "Official sources we rely on",
    maj: "Updated on",
    autre: { href: "/fr/", texte: "Français", code: "fr" },
  },
};

const SOURCES: Record<Langue, { titre: string; editeur: string; url: string }[]> = {
  fr: [
    { editeur: "Service Public", titre: "Facturation : mentions obligatoires", url: "https://entreprendre.service-public.fr/vosdroits/F31808" },
    { editeur: "impots.gouv.fr", titre: "Les taux de TVA en vigueur", url: "https://www.impots.gouv.fr/professionnel/questions/quels-sont-les-taux-de-tva-en-vigueur-en-france-et-dans-lunion-europeenne" },
    { editeur: "CNIL", titre: "Mots de passe : une recommandation pour maîtriser sa sécurité", url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite" },
    { editeur: "Service Public", titre: "Attestation d'hébergement", url: "https://www.service-public.fr/particuliers/vosdroits/R39697" },
  ],
  en: [
    { editeur: "Service Public", titre: "Facturation : mentions obligatoires (invoice mentions)", url: "https://entreprendre.service-public.fr/vosdroits/F31808" },
    { editeur: "impots.gouv.fr", titre: "Les taux de TVA en vigueur (VAT rates)", url: "https://www.impots.gouv.fr/professionnel/questions/quels-sont-les-taux-de-tva-en-vigueur-en-france-et-dans-lunion-europeenne" },
    { editeur: "CNIL", titre: "Mots de passe (password guidance)", url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite" },
    { editeur: "Service Public", titre: "Attestation d'hébergement (proof of accommodation)", url: "https://www.service-public.fr/particuliers/vosdroits/R39697" },
  ],
};

const Hub = ({ lang }: { lang: Langue }) => {
  const navigate = useNavigate();
  const t = TEXTES[lang];
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const url = `https://75tools.fr/${lang}/`;

  return (
    <LangueContext.Provider value={lang}>
      <div className="min-h-screen bg-neutral-950 text-neutral-300">
        <SEO
          exactTitle
          title={t.titre}
          description={t.meta}
          url={url}
          locale={lang === "fr" ? "fr_FR" : "en_US"}
          alternateLocale={lang === "fr" ? "en_US" : "fr_FR"}
          imageAlt={t.h1}
          alternates={[
            { hrefLang: "fr", href: "https://75tools.fr/fr/" },
            { hrefLang: "en", href: "https://75tools.fr/en/" },
            { hrefLang: "x-default", href: "https://75tools.fr/fr/" },
          ]}
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "75tools",
              url: "https://75tools.fr/",
              inLanguage: lang === "fr" ? "fr-FR" : "en-GB",
              publisher: { "@id": "https://75tools.fr/#organisation" },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              url,
              name: t.titre,
              inLanguage: lang === "fr" ? "fr-FR" : "en-GB",
              dateModified: LAST_UPDATED,
              author: { "@id": "https://75tools.fr/#organisation" },
            },
            faqJsonLd(FAQ[lang]),
          ]}
        />
        <header className="border-b border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
            <Link to={`/${lang}/`} className="flex items-center gap-2.5 whitespace-nowrap">
              <span className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-white">75tools</span>
            </Link>
            <nav aria-label={tr(lang, "Langue", "Language")}>
              <Link
                to={t.autre.href}
                hrefLang={t.autre.code}
                lang={t.autre.code}
                className="inline-flex items-center h-10 px-3 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500"
              >
                {t.autre.texte}
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-8">
          <section className="pt-8 pb-6">
            <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight tracking-tight">{t.h1}</h1>
            <p className="mt-3 text-neutral-400 text-base md:text-lg max-w-3xl leading-relaxed">{t.intro}</p>
            <nav aria-label={t.categories} className="mt-5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className="text-sm text-neutral-300 border border-neutral-800 hover:border-neutral-600 rounded-full px-3 py-1.5 whitespace-nowrap"
                >
                  {c.nom[lang]}
                </a>
              ))}
            </nav>
          </section>

          <div data-sommaire className="space-y-12">
            {CATEGORIES.map((c) => (
              <section key={c.id} id={c.id} className="scroll-mt-6">
                <h2 className="text-2xl font-semibold text-white tracking-tight">{c.nom[lang]}</h2>
                <p className="mt-1 text-neutral-500">{c.chapeau[lang]}</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {outilsDe(c.id).map((o) => (
                    <li key={o.id}>
                      <Link
                        to={o[lang].href}
                        className="block h-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 hover:border-neutral-600 transition-colors"
                      >
                        <span className="block text-white font-medium">{o[lang].long}</span>
                        <span className="block mt-1 text-sm text-neutral-400 leading-relaxed">{o[lang].carte}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section id="applications" className="scroll-mt-6">
              <h2 className="text-2xl font-semibold text-white tracking-tight">{t.applications}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <Link to="/mycard/" className="block h-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 hover:border-neutral-600 transition-colors">
                    <span className="block text-white font-medium">MyCard</span>
                    <span className="block mt-1 text-sm text-neutral-400 leading-relaxed">{t.mycard}</span>
                  </Link>
                </li>
                <li>
                  {/* Application à compte, non pré-rendue : bouton plutôt que lien, pour ne pas envoyer les robots vers une page sans HTML statique. */}
                  <button type="button" onClick={() => navigate("/gym")} className="block w-full text-left h-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 hover:border-neutral-600 transition-colors">
                    <span className="block text-white font-medium">Gym Squad</span>
                    <span className="block mt-1 text-sm text-neutral-400 leading-relaxed">
                      {tr(lang, "Planifier les séances de sport d'un groupe : qui va à la salle, et quand.", "Plan a group's gym sessions: who goes, and when.")}
                    </span>
                  </button>
                </li>
              </ul>
            </section>
          </div>

          <section className="mt-14 border-t border-neutral-800 pt-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">{t.commentTitre}</h2>
            <p className="leading-relaxed max-w-4xl">{t.comment}</p>
          </section>

          <section className="mt-14 border-t border-neutral-800 pt-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-5 tracking-tight">{t.sourcesTitre}</h2>
            <ul className="space-y-2 text-sm text-neutral-400">
              {SOURCES[lang].map((s) => (
                <li key={s.url}>
                  {s.editeur},{" "}
                  <a href={s.url} rel="noopener nofollow" target="_blank" className="text-sky-300 underline underline-offset-4">
                    {s.titre}
                  </a>
                  {tr(lang, ", page lue le 27 octobre 2026.", ", page read on 27 October 2026.")}
                </li>
              ))}
            </ul>
          </section>

          <Faq faq={FAQ[lang]} />

          <aside className="author mt-12 border-t border-neutral-800 pt-6 text-sm text-neutral-500 space-y-2" data-author>
            <p>
              {tr(
                lang,
                "75tools est édité par la société Radif Partners. Les résultats des outils sont donnés à titre indicatif et ne remplacent pas l'avis d'un professionnel.",
                "75tools is published by Radif Partners. Tool results are indicative and do not replace advice from a professional."
              )}
            </p>
          </aside>
        </main>

        <footer className="border-t border-neutral-800 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-neutral-500 text-sm space-y-2">
            <p>
              {t.maj} <time dateTime={LAST_UPDATED}>{displayDate(LAST_UPDATED, lang)}</time>
            </p>
            <p>
              {LIENS_SERVICE[lang].map((l, i) => (
                <span key={l.href}>
                  {i > 0 && " · "}
                  <a href={l.href} className="hover:text-neutral-300 underline-offset-4 hover:underline">{l.texte}</a>
                </span>
              ))}
              {" · "}
              <Link to="/mycard/" className="hover:text-neutral-300 underline-offset-4 hover:underline">MyCard</Link>
            </p>
            <p>© 2026 75tools · Radif Partners</p>
          </div>
        </footer>
      </div>
    </LangueContext.Provider>
  );
};

export default Hub;
