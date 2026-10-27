import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { lienAvisGoogle } from "@/lib/qr-formats";
import { type Langue } from "@/lib/langue";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Puis-je offrir un café ou une remise aux clients qui laissent un avis ?",
      r: "Non. Le règlement de Google Maps interdit d'offrir un avantage (paiement, remise, produit ou service gratuit) en échange d'un avis, et les avis ainsi obtenus sont supprimés. En France, la DGCCRF rappelle aussi aux consommateurs de se méfier des offres en contrepartie d'un avis positif. Demandez un avis sans contrepartie, à tous vos clients, et laissez-les libres de ce qu'ils écrivent.",
    },
    {
      q: "Je préfère ne montrer le code qu'aux clients contents, c'est permis ?",
      r: "Non. Google interdit explicitement de solliciter des avis positifs de façon sélective, ainsi que de décourager ou d'interdire les avis négatifs. Une affiche visible par tous, ou une demande faite à chaque client après son achat, respecte la règle. Un avis négatif traité avec une réponse polie et concrète rassure d'ailleurs souvent davantage qu'une série de notes parfaites.",
    },
    {
      q: "Le lien fabriqué à partir de l'identifiant de lieu est-il un lien officiel ?",
      r: "C'est un format d'adresse très utilisé, mais l'aide de la fiche d'établissement ne le présente pas : elle donne un lien à copier depuis votre fiche. Préférez donc ce lien fourni par Google. Si vous ne pouvez pas y accéder, l'identifiant de lieu dépanne ; l'outil construit alors l'adresse, et il vous suffit de scanner le code pour vérifier qu'il ouvre bien la fenêtre d'avis de votre établissement.",
    },
    {
      q: "Mes clients ont-ils besoin d'un compte Google pour laisser un avis ?",
      r: "Oui. D'après l'aide de la fiche d'établissement, il faut être connecté à un compte Google pour publier un avis ; ce compte peut être créé avec une adresse e-mail qui n'est pas une adresse Gmail. Un client sans compte arrivera sur une page de connexion après le scan : mentionnez-le si on vous pose la question, sans insister.",
    },
    {
      q: "Puis-je demander au client d'écrire son avis tout de suite, devant moi ?",
      r: "Le règlement de Google interdit d'obliger les clients à laisser une note ou à rédiger un avis sur place. Vous pouvez montrer l'affiche et dire que vous seriez content d'avoir son avis, mais le client doit rester libre de le faire plus tard, ou pas du tout. Remettre le code sur le ticket ou dans un e-mail de remerciement lui laisse le temps.",
    },
    {
      q: "Mon QR code ouvre la fiche Google Maps mais pas la fenêtre d'avis, pourquoi ?",
      r: "Parce que le lien collé est un lien de partage de la fiche, du type maps.app.goo.gl, et non le lien d'avis. Il mène à la page de l'établissement, où le client doit encore chercher le bouton pour écrire un avis : beaucoup abandonnent. Récupérez le lien d'avis depuis votre fiche, sur ordinateur, avec « Recevoir plus d'avis » puis « Copier », et recréez le code.",
    },
  ],
  en: [
    {
      q: "Can I offer a free coffee or a discount in return for a Google review in France?",
      r: "No. Google's Maps content policy bans offering anything (payment, discounts, free goods or services) in exchange for a review and removes reviews obtained that way. French consumer law adds its own risk: the DGCCRF, the consumer protection authority, treats fake or bought reviews as a misleading commercial practice. Ask every customer, offer nothing in return and let them write what they want.",
    },
    {
      q: "Is it allowed to show the review QR code only to happy customers?",
      r: "No. Google explicitly bans selectively asking for positive reviews, and discouraging or forbidding negative ones. A poster that every customer can see, or a request made to everyone after a sale, stays within the rules. A negative review answered politely and concretely, in French if the customer wrote in French, often reassures readers more than a row of perfect scores.",
    },
    {
      q: "Do customers need a Google account to leave a review?",
      r: "Yes. According to Google Business Profile Help, posting a review requires being signed in to a Google account, which can be created with an email address that is not Gmail. A customer without an account lands on a sign-in page after scanning. Mention it if someone asks, without pushing; most smartphone users in France already have an account through Android or Gmail.",
    },
    {
      q: "Is a review link built from a Place ID an official Google link?",
      r: "It is a widely used address format, but Google Business Profile Help does not describe it: the help gives a link to copy from your profile. Prefer that one. If you cannot get into the profile, the Place ID is a workaround; the tool builds the address, and you only need to scan the code to check that it opens the review window for your business.",
    },
    {
      q: "My review QR code opens the business listing but not the review window, why?",
      r: "Because the link you pasted is a share link for the listing, such as maps.app.goo.gl, not the review link. It opens the business page, where customers still have to find the button to write a review, and many give up there. Get the review link from your profile on a computer, through \"Get more reviews\" then \"Copy\", and make the code again.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    {
      editeur: "Aide Fiche d'établissement Google",
      titre: "Créer un lien ou un QR code pour demander des avis",
      url: "https://support.google.com/business/answer/16816815?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Aide Fiche d'établissement Google",
      titre: "Conseils pour obtenir plus d'avis",
      url: "https://support.google.com/business/answer/3474122?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Aide Règlement relatif aux contenus ajoutés par les utilisateurs dans Maps",
      titre: "Contenus interdits et soumis à des restrictions",
      url: "https://support.google.com/contributionpolicy/answer/7400114?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "economie.gouv.fr (DGCCRF)",
      titre: "Avis en ligne : attention aux faux commentaires !",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/avis-en-ligne-attention-aux-faux-commentaires",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Google for Developers",
      titre: "ID de lieu, Places API (New)",
      url: "https://developers.google.com/maps/documentation/places/web-service/place-id?hl=fr",
      lu: "27 octobre 2026",
    },
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, Spécification de la symbologie de code à barres Code QR",
      url: "https://www.iso.org/fr/standard/62021.html",
      lu: "27 octobre 2026",
    },
  ],
  en: [
    {
      editeur: "Google Business Profile Help",
      titre: "Create a Google link or QR code to request reviews",
      url: "https://support.google.com/business/answer/16816815?hl=en",
      lu: "27 October 2026",
    },
    {
      editeur: "Google Business Profile Help",
      titre: "Tips to get more reviews",
      url: "https://support.google.com/business/answer/3474122?hl=en",
      lu: "27 October 2026",
    },
    {
      editeur: "Maps User Generated Content Policy Help",
      titre: "Prohibited & restricted content",
      url: "https://support.google.com/contributionpolicy/answer/7400114?hl=en",
      lu: "27 October 2026",
    },
    {
      editeur: "economie.gouv.fr (DGCCRF)",
      titre: "Avis en ligne : attention aux faux commentaires ! (Online reviews: beware of fake comments, in French)",
      url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/avis-en-ligne-attention-aux-faux-commentaires",
      lu: "27 October 2026",
    },
    {
      editeur: "Google for Developers",
      titre: "Place IDs, Places API (New)",
      url: "https://developers.google.com/maps/documentation/places/web-service/place-id",
      lu: "27 October 2026",
    },
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification",
      url: "https://www.iso.org/standard/62021.html",
      lu: "27 October 2026",
    },
  ],
};

type LangueAffiche = "fr" | "en" | "fr-en";

const AFFICHE = {
  fr: { titre: "Votre avis compte", l1: "Scannez ce code avec l'appareil photo de votre téléphone", l2: "pour laisser un avis sur Google.", merci: "Merci de votre visite." },
  en: { titre: "Your review matters", l1: "Scan this code with your phone camera", l2: "to leave a review on Google.", merci: "Thank you for your visit." },
};

const T = {
  fr: {
    nomAppli: "Générateur de QR code pour avis Google 75tools",
    motsCles: "qr code avis google, lien avis google, affiche avis google, générer qr code laisser un avis google, place id avis",
    form: "Lien d'avis Google",
    champ: "Lien d'avis Google ou identifiant de lieu",
    encodee: "Adresse encodée :",
    ouvrir: "Ouvrir le lien pour vérifier",
    nom: "Nom de l'établissement (sur l'affiche)",
    nomDefaut: "Boulangerie Martin",
    langue: "Langue de l'affiche",
    langues: { fr: "Français", en: "Anglais", "fr-en": "Français et anglais" } as Record<LangueAffiche, string>,
    note: "L'affiche ne promet aucune contrepartie : Google interdit de récompenser un avis. Voir les règles plus bas.",
    vide: "Collez votre lien d'avis.",
    imprimer: "Imprimer l'affiche",
    fichier: "qr-avis-google",
    afficheDefaut: "fr" as LangueAffiche,
  },
  en: {
    nomAppli: "75tools Google review QR code generator",
    motsCles: "google review qr code, google review link, google review poster, qr code for google reviews, place id review link",
    form: "Google review link",
    champ: "Google review link or Place ID",
    encodee: "Encoded address:",
    ouvrir: "Open the link to check",
    nom: "Business name (on the poster)",
    nomDefaut: "The Corner Café",
    langue: "Poster language",
    langues: { fr: "French", en: "English", "fr-en": "French and English" } as Record<LangueAffiche, string>,
    note: "The poster promises nothing in return: Google forbids rewarding reviews. See the rules below.",
    vide: "Paste your review link.",
    imprimer: "Print the poster",
    fichier: "google-review-qr",
    afficheDefaut: "fr-en" as LangueAffiche,
  },
};

const QrCodeAvisGoogle = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [saisie, setSaisie] = useState("");
  const [nom, setNom] = useState(t.nomDefaut);
  const [langueAffiche, setLangueAffiche] = useState<LangueAffiche>(t.afficheDefaut);
  const [svg, setSvg] = useState("");
  const res = useMemo(() => lienAvisGoogle(saisie, lang), [saisie, lang]);
  const lien = res.ok ? res.lien : "";
  const textes = langueAffiche === "fr-en" ? [AFFICHE.fr, AFFICHE.en] : [AFFICHE[langueAffiche]];

  const outil = (
    <>
      <form
        className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-rows-[auto_1fr] items-start print:hidden"
        onSubmit={(e) => e.preventDefault()}
        aria-label={t.form}
      >
        <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-1">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.champ}</span>
            <input
              id="champ-avis"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="https://g.page/r/…/review"
              className={classeChamp}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          {"erreur" in res && res.erreur && (
            <p role="status" className="text-sm text-amber-300">
              {res.erreur}
            </p>
          )}
          {res.ok && (
            <div className="rounded-lg border border-neutral-800 p-4 space-y-2 text-sm min-w-0">
              <p role="status" className="text-neutral-300">
                {res.remarque}
              </p>
              <p className="text-neutral-400">
                {t.encodee} <span id="lien-avis" className="text-neutral-100 [overflow-wrap:anywhere]">{lien}</span>
              </p>
              <Bouton secondaire onClick={() => window.open(lien, "_blank", "noopener")}>
                {t.ouvrir}
              </Bouton>
            </div>
          )}
        </div>

        <div data-resultat className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
          <QrApercu
            texte={lien}
            nomFichier={t.fichier}
            id="qr-avis"
            vide={t.vide}
            onRendu={(s) => setSvg(s)}
            actions={
              <Bouton secondaire onClick={() => window.print()} disabled={!svg}>
                {t.imprimer}
              </Bouton>
            }
          />
        </div>

        <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-2">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.nom}</span>
            <input id="champ-nom" value={nom} onChange={(e) => setNom(e.target.value)} className={classeChamp} autoComplete="organization" />
          </label>
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.langue}</span>
            <select
              id="champ-langue-affiche"
              value={langueAffiche}
              onChange={(e) => setLangueAffiche(e.target.value as LangueAffiche)}
              className={classeSelect}
            >
              {(["fr", "en", "fr-en"] as LangueAffiche[]).map((l) => (
                <option key={l} value={l}>
                  {t.langues[l]}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-neutral-500">{t.note}</p>
        </div>
      </form>

      {/* Affiche imprimée : seule visible à l'impression */}
      <div className="hidden print:block text-black">
        <div className="mx-auto mt-6 w-[14cm] border-2 border-black rounded-2xl p-10 text-center">
          {textes.map((x) => (
            <p key={x.titre} className="text-3xl font-semibold">
              {x.titre}
            </p>
          ))}
          {nom && <p className="mt-2 text-xl [overflow-wrap:anywhere]">{nom}</p>}
          {svg && <div className="mx-auto mt-8 w-[8cm] [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />}
          {textes.map((x) => (
            <div key={x.l1} className="mt-6 text-lg">
              <p>{x.l1}</p>
              <p>{x.l2}</p>
            </div>
          ))}
          <p className="mt-4 text-base">{textes.map((x) => x.merci).join(" ")}</p>
        </div>
      </div>
    </>
  );

  return (
    <PageOutil
      id="qr-code-avis-google"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="QR code avis Google : obtenir le bon lien et l'imprimer">
      <p>
        Un QR code avis Google ouvre directement la fenêtre où le client note votre établissement et écrit son avis, sans
        qu'il ait à chercher votre fiche sur Google Maps. Copiez le lien d'avis depuis votre fiche d'établissement (sur
        ordinateur : « Voir les avis », « Recevoir plus d'avis », puis « Copier »), collez-le dans le champ : l'outil
        vérifie qu'il mène bien chez Google, dessine le code et prépare une affiche « Votre avis compte » de 14 cm de
        large, en français, en anglais ou dans les deux langues. Un lien d'avis court du type
        https://g.page/r/…/review fait une quarantaine de caractères et donne un code de 29 × 29 modules, net même sur
        un ticket de caisse. La limite tient aux règles de Google et à la loi française : l'affiche doit être montrée à
        tous les clients et ne promettre aucune contrepartie.
      </p>
    </Section>

    <Section titre="Trouver le lien d'avis de votre fiche d'établissement">
      <p>
        L'aide Google précise que le lien et le QR code d'avis ne se génèrent, pour le moment, que dans un navigateur sur
        ordinateur, et non sur un appareil mobile. Connectez-vous à votre fiche, sélectionnez « Voir les avis » puis
        « Recevoir plus d'avis », et cliquez sur « Copier ». Google propose au même endroit son propre QR code, à
        enregistrer par un clic droit. Cette page sert à aller plus loin : un SVG net pour l'imprimeur, des couleurs et
        une affiche prête à poser au comptoir.
      </p>
      <p>
        <strong>Sans accès à la fiche</strong> (fiche gérée par une agence, accès perdu), l'identifiant de lieu dépanne.
        C'est une suite de caractères qui commence souvent par « ChIJ », que l'outil de recherche d'ID de lieu de la
        documentation Google pour développeurs retrouve à partir du nom de l'établissement. L'outil construit alors le
        lien <code className="text-sky-300 [overflow-wrap:anywhere]">https://search.google.com/local/writereview?placeid=…</code>,
        un format largement utilisé mais pas décrit dans l'aide de la fiche : scannez le code pour vérifier qu'il ouvre
        bien la fenêtre d'avis.
      </p>
    </Section>

    <Section titre="Demander des avis sans enfreindre les règles">
      <p>
        <strong>Ce que Google interdit.</strong> Le règlement des contenus de Google Maps qualifie d'engagement
        artificiel les avis payés, directement ou en nature. Il interdit aux marchands d'offrir des avantages en échange
        d'un avis, de solliciter des avis positifs de façon sélective, de décourager les avis négatifs et d'obliger les
        clients à laisser une note sur place. Il autorise en revanche à demander des avis qui reflètent une véritable
        expérience.
      </p>
      <p>
        <strong>Ce que dit la loi française.</strong> La DGCCRF rappelle que le code de la consommation interdit au
        professionnel de se présenter faussement comme un consommateur, d'affirmer que des avis viennent de clients sans
        avoir pris les mesures pour le vérifier, et de modifier des avis pour promouvoir ses produits. Ces faits
        constituent un délit de pratiques commerciales trompeuses, puni de deux ans d'emprisonnement et de 300 000 euros
        d'amende, montant qui peut être porté à 10 % du chiffre d'affaires moyen annuel ou à 50 % des dépenses engagées
        pour la pratique. Les particuliers recrutés pour poster de faux avis engagent aussi leur responsabilité pénale.
      </p>
      <p>
        En pratique : une affiche visible par tous, une phrase neutre, aucune contrepartie, et des réponses polies aux
        avis, y compris négatifs. C'est ce que fait l'affiche proposée ici.
      </p>
    </Section>

    <Section titre="Où placer le QR code d'avis">
      <p>
        L'aide Google suggère de l'indiquer sur les reçus et de l'imprimer pour l'afficher dans le magasin. Un chevalet
        près de la caisse, une étiquette sur le sac, un rappel en bas du devis ou de la facture fonctionnent bien : le
        client scanne quand il en a le temps. Pour un sac ou un ticket, téléchargez le SVG et placez-le dans votre
        maquette.
      </p>
      <p>
        Regardez votre affiche de temps en temps : des escrocs collent parfois leur propre QR code par-dessus un code
        légitime. Pour un lien vers votre carte ou votre plaquette, la <Link to="/qr-code-pdf/">page QR code PDF</Link>{" "}
        aide à partager le document, et le <Link to="/generateur-qr-code/">générateur de QR code</Link> crée un code vers
        votre site.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Google review QR code: get the right link and print it">
      <p>
        A Google review QR code opens the window where customers rate your business and write a review, so they do not
        have to search for your listing on Google Maps first. Copy the review link from your Google Business Profile
        (called fiche d'établissement in French; on a computer, go to "Read reviews", "Get more reviews", then "Copy"),
        paste it into the box: the tool checks that it really leads to Google, draws the code and prepares a 14 cm
        poster in French, English or both. A short review link such as https://g.page/r/…/review is about forty
        characters long and gives a code of 29 × 29 modules, sharp even on a till receipt. The limit comes from Google's
        rules and French law: the poster has to be shown to every customer and promise nothing in return.
      </p>
    </Section>

    <Section titre="Finding the review link of your Business Profile">
      <p>
        Google Business Profile Help states that, for now, review links and QR codes can only be generated in a browser
        on a computer, not on a mobile device. Sign in to your profile, open the reviews, choose "Get more reviews" and
        click "Copy". Google offers its own QR code in the same place, saved with a right click. This page adds an SVG
        for the print shop, colour options and a ready-made counter poster.
      </p>
      <p>
        <strong>No access to the profile?</strong> If an agency manages it or the login is lost, the Place ID is a
        workaround. It is a string that often starts with "ChIJ", which the Place ID finder in Google's developer
        documentation returns from the business name. The tool then builds{" "}
        <code className="text-sky-300 [overflow-wrap:anywhere]">https://search.google.com/local/writereview?placeid=…</code>,
        a widely used format that the profile help does not document: scan the code to check that it opens your review
        window.
      </p>
    </Section>

    <Section titre="Asking for reviews in France without breaking the rules">
      <p>
        <strong>Google's rules.</strong> The Maps content policy calls paid reviews, in cash or in kind, fake
        engagement. Businesses may not offer incentives for reviews, ask only satisfied customers, discourage negative
        reviews or require customers to leave a rating on the spot. Asking for honest reviews of a real experience is
        allowed.
      </p>
      <p>
        <strong>French law.</strong> The DGCCRF (Direction générale de la concurrence, de la consommation et de la
        répression des fraudes, the consumer protection authority) explains that the Code de la consommation forbids a
        business from posing as a consumer, from claiming that reviews come from real customers without checking it,
        and from editing reviews to promote its products. These are misleading commercial practices, punishable by two
        years' imprisonment and a fine of €300,000, which can rise to 10% of average annual turnover or 50% of what the
        practice cost. People recruited to post fake reviews are criminally liable too. This applies to any business
        trading in France, whatever the owner's nationality.
      </p>
      <p>
        In practice: a poster everyone can see, a neutral sentence, nothing offered in return, and polite answers to
        every review, negative ones included.
      </p>
    </Section>

    <Section titre="Where to put the review code">
      <p>
        Google suggests printing the link on receipts and displaying the QR code in your shop. A stand by the till, a
        sticker on the bag, a line at the bottom of a quote or invoice all work: customers scan when they have a minute.
        The bilingual poster suits places with tourists or international clients; for a bag or a receipt, download the
        SVG and drop it into your layout.
      </p>
      <p>
        Glance at the poster now and then, because scammers sometimes stick their own QR code over a genuine one. To
        share a menu or brochure, the <Link to="/en/pdf-qr-code/">PDF QR code page</Link> helps, and the{" "}
        <Link to="/en/qr-code-generator/">free QR code generator</Link> links to your website.
      </p>
    </Section>
  </>
);

export default QrCodeAvisGoogle;
