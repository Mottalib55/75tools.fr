import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import type { Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Une carte de visite NFC fonctionne-t-elle avec tous les iPhone ?",
      r: "Apple indique que la lecture des puces NFC en arrière-plan, sans ouvrir d'application, est prise en charge à partir de l'iPhone XS. Il faut que l'iPhone soit en cours d'utilisation ; la lecture ne se fait pas pendant que l'appareil photo ou Apple Pay est ouvert, ni en mode avion. Sur un modèle plus ancien, le QR code imprimé sur la même carte prend le relais.",
    },
    {
      q: "Faut-il une application pour lire une carte de visite NFC ?",
      r: "Non, ni sur un iPhone XS ou plus récent, ni sur un téléphone Android équipé du NFC, à condition que le NFC soit activé dans les réglages : la documentation Android précise que l'appareil cherche les puces quand l'écran est déverrouillé. Le téléphone affiche alors une notification ou ouvre directement le lien enregistré dans la carte.",
    },
    {
      q: "Peut-on reprogrammer une carte NFC pour changer le lien ?",
      r: "Oui, tant que la puce n'a pas été verrouillée en écriture. Une application d'écriture NFC sur téléphone permet d'y enregistrer une nouvelle adresse en quelques secondes. Certaines cartes vendues avec un service en ligne sont verrouillées : le lien ne peut alors être changé que chez le vendeur, parfois contre un abonnement. Posez la question avant d'acheter.",
    },
    {
      q: "Que devient ma carte NFC si le service qui l'héberge ferme ?",
      r: "La puce contient en général une adresse web qui ouvre votre profil chez le vendeur. Si ce service s'arrête ou si l'abonnement n'est pas renouvelé, la carte ouvre une page vide ou une erreur. Pour éviter cela, choisissez une carte non verrouillée et faites-la pointer vers une adresse que vous maîtrisez : votre site, ou une carte en ligne dont vous gardez le lien.",
    },
    {
      q: "Quelqu'un peut-il lire ma carte NFC à mon insu ?",
      r: "Il faudrait approcher un téléphone à quelques centimètres de la carte : la documentation Android parle d'une distance de 4 cm ou moins. Et la puce ne contient que ce que vous voulez donner, en pratique un lien vers votre carte en ligne. Ce n'est pas une carte bancaire : il n'y a ni code ni donnée sensible à voler.",
    },
    {
      q: "Mon téléphone Android ne réagit pas quand j'approche la carte, que vérifier ?",
      r: "D'abord que le téléphone a une puce NFC : Google indique que si le réglage NFC n'existe pas, l'appareil n'en a pas. Ouvrez Paramètres, tapez « NFC » dans la recherche et activez-le. Déverrouillez l'écran, puis approchez la carte du dos du téléphone, souvent près de l'appareil photo, à moins de 4 cm. Si rien ne se passe, scannez le QR code imprimé.",
    },
  ],
  en: [
    {
      q: "Does an NFC business card work with every iPhone?",
      r: "Apple says background tag reading, without opening any app, is supported from the iPhone XS onwards. The iPhone has to be in use, and reading is paused while the camera or Apple Pay Wallet is open, or in airplane mode. On an older model, the QR code printed on the same card takes over, which is why we recommend printing both.",
    },
    {
      q: "Do people need an app to read my NFC card?",
      r: "No, not on an iPhone XS or later, nor on an Android phone with NFC, as long as NFC is switched on: the Android documentation says the device looks for tags when the screen is unlocked. The phone then shows a notification or opens the link stored in the card directly, usually your online profile.",
    },
    {
      q: "Can I reprogram an NFC card to change the link?",
      r: "Yes, as long as the chip has not been write-locked. An NFC writing app on a phone can store a new address in a few seconds. Some cards sold with an online service are locked, so the link can only be changed through the seller, sometimes for a subscription fee. Ask before you buy, especially if you might leave France and change numbers.",
    },
    {
      q: "What happens to my NFC card if the company hosting my profile shuts down?",
      r: "The chip usually holds a web address that opens your profile on the seller's platform. If that service closes or your subscription lapses, the card opens a blank page or an error. To avoid this, choose an unlocked card and point it to an address you control, such as your own website or a page whose link you keep.",
    },
    {
      q: "Can someone read my NFC card without me noticing?",
      r: "They would need to hold a phone within a few centimetres of the card: the Android documentation gives 4 cm or less. And the chip only holds what you chose to share, in practice a link to your online card. It is not a bank card, so there is no PIN and no sensitive data to steal from it.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Assistance Apple", titre: "Scanner un code QR avec la caméra de l'iPhone", url: "https://support.apple.com/fr-fr/guide/iphone/iphe8bda8762/ios", lu: "27 octobre 2026" },
    { editeur: "Aide Google Wallet", titre: "Activez la technologie NFC (communication en champ proche)", url: "https://support.google.com/wallet/answer/14186809?hl=fr", lu: "27 octobre 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2015, spécification de la symbologie QR Code", url: "https://www.iso.org/standard/62021.html", lu: "27 octobre 2026" },
    { editeur: "Apple Developer", titre: "Adding Support for Background Tag Reading (Core NFC)", url: "https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading", lu: "27 octobre 2026" },
    { editeur: "Android Developers", titre: "Near field communication (NFC) overview", url: "https://developer.android.com/develop/connectivity/nfc", lu: "27 octobre 2026" },
    { editeur: "Android Developers", titre: "Principes de base de la technologie NFC", url: "https://developer.android.com/develop/connectivity/nfc/nfc?hl=fr", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Apple Support", titre: "Scan a QR code with your iPhone camera", url: "https://support.apple.com/en-gb/guide/iphone/iphe8bda8762/ios", lu: "27 October 2026" },
    { editeur: "Google Wallet Help", titre: "Turn on near field communication (NFC)", url: "https://support.google.com/wallet/answer/14186809?hl=en", lu: "27 October 2026" },
    { editeur: "ISO", titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification", url: "https://www.iso.org/standard/62021.html", lu: "27 October 2026" },
    { editeur: "Apple Developer", titre: "Adding Support for Background Tag Reading (Core NFC)", url: "https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading", lu: "27 October 2026" },
    { editeur: "Android Developers", titre: "Near field communication (NFC) overview", url: "https://developer.android.com/develop/connectivity/nfc", lu: "27 October 2026" },
    { editeur: "Android Developers", titre: "NFC basics", url: "https://developer.android.com/develop/connectivity/nfc/nfc", lu: "27 October 2026" },
  ],
};

type Rep = Record<string, string>;
type Question = { id: string; q: string; options: { v: string; l: string }[] };
type Reco = { titre: string; raisons: string[]; liens: { href: string; l: string }[] };

const T = {
  fr: {
    nomAppli: "Test carte de visite NFC ou QR code 75tools",
    motsCles: "carte de visite nfc, carte nfc ou qr code, carte de visite connectée, carte de visite digitale, carte de visite qr code",
    questions: [
      { id: "rencontre", q: "Où rencontrez-vous vos contacts ?", options: [{ v: "face", l: "En face à face" }, { v: "distance", l: "Aussi à distance" }] },
      { id: "budget", q: "Êtes-vous prêt à acheter un support ?", options: [{ v: "non", l: "Non, gratuit" }, { v: "oui", l: "Oui, une carte NFC" }] },
      { id: "change", q: "Vos coordonnées changent-elles ?", options: [{ v: "rarement", l: "Rarement" }, { v: "souvent", l: "Souvent" }] },
      { id: "public", q: "Qui sont vos interlocuteurs ?", options: [{ v: "tous", l: "Tout public" }, { v: "pros", l: "Des pros équipés" }] },
    ] as Question[],
    test: "Test en quatre questions",
    reco: "Notre recommandation",
    reponse: "Votre réponse",
    attente: (n: number) => `Répondez aux ${n} questions : la recommandation s'affiche ici, avec ses raisons.`,
    bref: "En bref : le QR code est gratuit et lisible par presque tous les téléphones ; la carte NFC est plus rapide en face à face mais demande un support payant et un téléphone compatible.",
    recommander: (r: Rep): Reco => {
      const raisons: string[] = [];
      const nfc = r.budget === "oui" && r.rencontre === "face";
      if (r.budget === "non") raisons.push("Un QR code ne coûte rien à créer et s'imprime sur n'importe quelle carte.");
      if (r.rencontre === "distance") raisons.push("Un QR code se montre aussi dans un e-mail, une présentation ou une affiche ; la carte NFC ne marche qu'au contact.");
      if (r.public === "tous") raisons.push("Le QR code se lit avec l'appareil photo de presque tous les téléphones récents ; la lecture NFC sans application demande un iPhone XS ou plus récent, ou un Android avec le NFC activé.");
      if (nfc) raisons.push("En rendez-vous, approcher la carte du téléphone est le geste le plus rapide, sans cadrer de code.");
      if (r.change === "souvent")
        raisons.push("Comme vos coordonnées changent, le code (ou la puce) doit contenir un lien vers une carte en ligne que vous mettez à jour, pas la fiche contact elle-même.");
      else raisons.push("Vos coordonnées changent peu : un QR code vCard, qui contient le contact lui-même et marche sans connexion, convient.");
      const liens = [
        r.change === "souvent" ? { href: "/mycard/", l: "Créer ma carte en ligne MyCard" } : { href: "/carte-de-visite-qr-code/", l: "Créer mon QR code vCard" },
        { href: "/modele-carte-de-visite/", l: "Préparer la carte papier" },
      ];
      if (nfc)
        return {
          titre: "Une carte NFC, avec le QR code imprimé dessus",
          raisons: [...raisons, "Faites imprimer le QR code sur la carte NFC : il prend le relais sur les téléphones sans NFC actif."],
          liens,
        };
      return { titre: r.change === "souvent" ? "Un QR code vers une carte en ligne" : "Un QR code, sans puce NFC", raisons, liens };
    },
  },
  en: {
    nomAppli: "75tools NFC or QR code business card test",
    motsCles: "nfc business card, nfc or qr code business card, digital business card, smart business card, qr code business card",
    questions: [
      { id: "rencontre", q: "Where do you meet your contacts?", options: [{ v: "face", l: "Face to face" }, { v: "distance", l: "Also remotely" }] },
      { id: "budget", q: "Are you willing to buy a card?", options: [{ v: "non", l: "No, free only" }, { v: "oui", l: "Yes, an NFC card" }] },
      { id: "change", q: "Do your contact details change?", options: [{ v: "rarement", l: "Rarely" }, { v: "souvent", l: "Often" }] },
      { id: "public", q: "Who are the people you meet?", options: [{ v: "tous", l: "All kinds" }, { v: "pros", l: "Tech-savvy pros" }] },
    ] as Question[],
    test: "Four-question test",
    reco: "Our recommendation",
    reponse: "Your result",
    attente: (n: number) => `Answer the ${n} questions: the recommendation shows here, with the reasons.`,
    bref: "In short: a QR code is free and almost every phone can read it; an NFC card is faster face to face but costs money and needs a compatible phone.",
    recommander: (r: Rep): Reco => {
      const raisons: string[] = [];
      const nfc = r.budget === "oui" && r.rencontre === "face";
      if (r.budget === "non") raisons.push("A QR code costs nothing to create and prints on any card.");
      if (r.rencontre === "distance") raisons.push("A QR code also works in an email, a slide or a poster; an NFC card only works by touch.");
      if (r.public === "tous") raisons.push("Almost every recent phone camera reads a QR code; reading NFC without an app needs an iPhone XS or later, or an Android phone with NFC switched on.");
      if (nfc) raisons.push("In a meeting, tapping the card on a phone is the fastest gesture, with no code to frame.");
      if (r.change === "souvent")
        raisons.push("Since your details change, the code (or chip) should hold a link to an online profile you can update, not the contact card itself.");
      else raisons.push("Your details rarely change: a vCard QR code, which holds the contact itself and works offline, is a good fit.");
      const liens = [
        r.change === "souvent" ? { href: "/en/qr-code-generator/", l: "Make a QR code for my profile link" } : { href: "/en/vcard-qr-code/", l: "Create my vCard QR code" },
        { href: "/en/business-card-templates/", l: "Prepare the paper card" },
      ];
      if (nfc)
        return {
          titre: "An NFC card, with the QR code printed on it",
          raisons: [...raisons, "Have the QR code printed on the NFC card: it takes over on phones without NFC switched on."],
          liens,
        };
      return { titre: r.change === "souvent" ? "A QR code to an online profile" : "A QR code, no NFC chip", raisons, liens };
    },
  },
};

const CarteVisiteNfc = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [rep, setRep] = useState<Rep>({});
  const complet = t.questions.every((q) => rep[q.id]);
  const reco = complet ? t.recommander(rep) : null;

  const outil = (
    <div className="grid gap-5 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
      <div className="space-y-4" aria-label={t.test}>
        {t.questions.map((q, i) => (
          <div key={q.id} role="group" aria-labelledby={`q-${q.id}`}>
            <p id={`q-${q.id}`} className="text-sm text-neutral-200 mb-1.5">
              {i + 1}. {q.q}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={rep[q.id] === o.v}
                  onClick={() => setRep((x) => ({ ...x, [q.id]: o.v }))}
                  className={cn(
                    "min-h-11 min-w-0 px-3 py-2 rounded-md border text-sm text-center leading-snug [overflow-wrap:anywhere]",
                    rep[q.id] === o.v
                      ? "border-sky-400 bg-sky-400/10 text-white"
                      : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div data-resultat aria-live="polite" className="border-l-2 border-sky-400 bg-neutral-900 rounded-r-md p-5 lg:sticky lg:top-4">
        {reco ? (
          <>
            <p className="text-xs uppercase tracking-wider text-neutral-500">{t.reco}</p>
            <p id="recommandation" className="mt-1 text-xl font-semibold text-white">{reco.titre}</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300 list-disc pl-5">
              {reco.raisons.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {reco.liens.map((l) => (
                <Link key={l.href} to={l.href} className="text-sky-300 underline underline-offset-4">
                  {l.l}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wider text-neutral-500">{t.reponse}</p>
            <p className="mt-1 text-neutral-300">{t.attente(t.questions.length)}</p>
            <p className="mt-3 text-sm text-neutral-500">{t.bref}</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <PageOutil
      id="carte-de-visite-nfc"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="BusinessApplication"
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
    <Section titre="Carte de visite NFC ou QR code : la réponse courte">
      <p>
        Carte de visite NFC ou QR code : pour la plupart des indépendants, le QR code suffit, et la carte NFC ne
        vaut son prix que si vous rencontrez beaucoup de monde en face à face. Le test ci-dessus le tranche en
        quatre clics : lieu des rencontres, budget, fréquence des changements de coordonnées et équipement de vos
        interlocuteurs. Le QR code se crée gratuitement, s'imprime sur n'importe quelle carte et se lit avec
        l'appareil photo de presque tous les téléphones. La carte NFC s'ouvre d'un simple contact, à 4 cm ou moins
        selon la documentation Android, mais seulement sur un iPhone XS ou plus récent, ou sur un Android dont le
        NFC est activé, et elle s'achète, parfois avec un abonnement. Exemple : un agent immobilier qui remet dix
        cartes par jour en rendez-vous gagne du temps avec une carte NFC portant aussi un QR code ; un consultant
        qui prospecte par e-mail n'en tire rien. La limite de toute carte connectée : elle dépend du lien enregistré
        et du service qui l'héberge.
      </p>
    </Section>

    <Section titre="Le comparatif, point par point">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[36rem] align-top">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
              <th className="py-2 pr-4 font-medium"> </th>
              <th className="py-2 pr-4 font-medium">Carte NFC</th>
              <th className="py-2 font-medium">QR code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 [&_td]:py-2.5 [&_td]:align-top">
            <tr><td className="pr-4 text-neutral-200">Geste</td><td className="pr-4">Approcher la carte du téléphone</td><td>Ouvrir l'appareil photo et cadrer le code</td></tr>
            <tr><td className="pr-4 text-neutral-200">Distance</td><td className="pr-4">Quelques centimètres (4 cm ou moins selon Android)</td><td>Tant que le code est net à l'écran</td></tr>
            <tr><td className="pr-4 text-neutral-200">iPhone</td><td className="pr-4">Sans application à partir de l'iPhone XS, iPhone en cours d'utilisation</td><td>Appareil photo intégré</td></tr>
            <tr><td className="pr-4 text-neutral-200">Android</td><td className="pr-4">Si le téléphone a une puce NFC et qu'elle est activée</td><td>Appareil photo ou Google Lens</td></tr>
            <tr><td className="pr-4 text-neutral-200">Contenu habituel</td><td className="pr-4">Un lien vers une carte en ligne</td><td>Le contact lui-même (vCard) ou un lien</td></tr>
            <tr><td className="pr-4 text-neutral-200">À distance</td><td className="pr-4">Impossible</td><td>Oui : e-mail, visio, affiche, diapositive</td></tr>
            <tr><td className="pr-4 text-neutral-200">Coût</td><td className="pr-4">Achat du support, parfois un abonnement pour le profil</td><td>Gratuit à créer, imprimé sur une carte ordinaire</td></tr>
            <tr><td className="pr-4 text-neutral-200">Modifier après coup</td><td className="pr-4">Oui si la puce pointe vers un lien que vous gérez, ou si elle n'est pas verrouillée</td><td>Oui pour un lien ; non pour une vCard</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Nous n'indiquons pas de prix : ils varient beaucoup d'un vendeur à l'autre (matière de la carte,
        personnalisation, abonnement inclus ou non) et changent souvent. Comparez le prix total sur deux ou trois
        ans, abonnement compris, et vérifiez ce que devient la carte si vous arrêtez de payer.
      </p>
    </Section>

    <Section titre="Comment fonctionne une carte de visite NFC">
      <p>
        Une carte NFC contient une puce et une antenne, sans pile. C'est le téléphone qui l'alimente quand on
        l'approche, par son propre champ radio, à courte distance. La puce ne garde que quelques centaines
        d'octets : de quoi enregistrer un lien, rarement plus. En pratique, presque toutes les cartes de visite NFC
        contiennent donc <strong>une adresse web</strong> qui ouvre un profil en ligne.
      </p>
      <p>
        Il y a une raison technique à cela, côté iPhone : la documentation d'Apple précise que la lecture en
        arrière-plan cherche un enregistrement de type lien (URI) dans la puce, et ouvre ce lien. Le lien vers une
        carte en ligne est donc le contenu qui fonctionne sur iPhone comme sur Android.
      </p>
      <p>
        Les conditions de lecture comptent aussi. Sur iPhone, la lecture en arrière-plan n'a lieu que si l'iPhone
        est en cours d'utilisation, et pas quand l'appareil photo ou Apple Pay est ouvert, ni en mode avion. Sur
        Android, le téléphone cherche les puces quand l'écran est déverrouillé, si le NFC est activé ; et tous les
        modèles n'ont pas de puce NFC. Ce sont autant de cas où rien ne se passe : d'où l'intérêt d'imprimer aussi
        un QR code sur la carte.
      </p>
    </Section>

    <Section titre="Et le QR code, ses vrais avantages et ses limites">
      <p>
        Le QR code, défini par la norme ISO/IEC 18004, se lit avec l'appareil photo, intégré à l'iPhone et à la
        plupart des téléphones Android récents. Il ne coûte rien, s'imprime sur une carte classique, et peut
        contenir soit la fiche contact complète (<Link to="/carte-de-visite-qr-code/">QR code vCard</Link>, lisible
        sans connexion), soit un lien vers une carte en ligne comme <Link to="/mycard/">MyCard</Link>, modifiable
        après l'impression.
      </p>
      <p>
        Ses limites sont connues : il faut cadrer le code, ce qui prend quelques secondes de plus qu'un contact
        NFC ; un code trop petit ou trop dense se lit mal ; et un code vCard ne se met pas à jour. Pour démarrer
        sans rien acheter, un QR code sur une <Link to="/modele-carte-de-visite/">carte de visite imprimée</Link>{" "}
        suffit.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="NFC business card or QR code: the short answer">
      <p>
        NFC business card or QR code: for most freelancers and small businesses in France a QR code is enough, and
        an NFC card only pays off if you meet a lot of people face to face. The test above settles it in four
        clicks: where you meet people, budget, how often your details change and what phones your contacts carry.
        A QR code is free to create, prints on any card and is read by the camera of almost every phone. An NFC
        card opens with a simple tap, at 4 cm or less according to the Android documentation, but only on an
        iPhone XS or later or an Android phone with NFC switched on, and you have to buy it, sometimes with a
        subscription. Example: an estate agent handing out ten cards a day at viewings saves time with an NFC card
        that also carries a QR code; a consultant who prospects by email gains nothing. The limit of any smart
        card: it depends on the link stored in it and on the service hosting the profile.
      </p>
    </Section>

    <Section titre="The comparison, point by point">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[36rem] align-top">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
              <th className="py-2 pr-4 font-medium"> </th>
              <th className="py-2 pr-4 font-medium">NFC card</th>
              <th className="py-2 font-medium">QR code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 [&_td]:py-2.5 [&_td]:align-top">
            <tr><td className="pr-4 text-neutral-200">Gesture</td><td className="pr-4">Tap the card on the phone</td><td>Open the camera and frame the code</td></tr>
            <tr><td className="pr-4 text-neutral-200">Distance</td><td className="pr-4">A few centimetres (4 cm or less per Android)</td><td>As long as the code is sharp on screen</td></tr>
            <tr><td className="pr-4 text-neutral-200">iPhone</td><td className="pr-4">No app needed from iPhone XS, phone in use</td><td>Built-in Camera app</td></tr>
            <tr><td className="pr-4 text-neutral-200">Android</td><td className="pr-4">If the phone has NFC and it is switched on</td><td>Camera app or Google Lens</td></tr>
            <tr><td className="pr-4 text-neutral-200">Usual content</td><td className="pr-4">A link to an online profile</td><td>The contact itself (vCard) or a link</td></tr>
            <tr><td className="pr-4 text-neutral-200">Remote use</td><td className="pr-4">Impossible</td><td>Yes: email, video call, poster, slide</td></tr>
            <tr><td className="pr-4 text-neutral-200">Cost</td><td className="pr-4">Buying the card, sometimes a profile subscription</td><td>Free to create, printed on a normal card</td></tr>
            <tr><td className="pr-4 text-neutral-200">Edit later</td><td className="pr-4">Yes if the chip points to a link you manage, or is not locked</td><td>Yes for a link; no for a vCard</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        We do not quote prices: they vary widely between sellers (card material, custom design, subscription
        included or not) and change often. Compare the total cost over two or three years, subscription included,
        and check what happens to the card if you stop paying.
      </p>
    </Section>

    <Section titre="How an NFC business card works">
      <p>
        An NFC card holds a chip and an antenna, with no battery. The phone powers it through its own radio field
        when you bring them close together. The chip stores only a few hundred bytes, enough for a link and rarely
        more. In practice almost every NFC business card therefore holds <strong>a web address</strong> that opens
        an online profile.
      </p>
      <p>
        There is a technical reason on the iPhone side: Apple's documentation says background reading looks for a
        URI record on the chip and opens that link. A link to an online profile is therefore the content that works
        on iPhone and Android alike.
      </p>
      <p>
        Reading conditions matter too. On an iPhone, background reading only happens while the phone is in use, and
        not while the camera or Apple Pay Wallet is open, or in airplane mode. On Android, the phone looks for tags
        when the screen is unlocked and NFC is on, and not every model has an NFC chip; Google's help says to search
        for NFC in Settings and switch it on. In all those cases nothing happens, which is why a QR code on the card
        is worth printing too.
      </p>
    </Section>

    <Section titre="The QR code: real strengths and limits">
      <p>
        The QR code, defined by the ISO/IEC 18004 standard, is read by the camera built into iPhones and most recent
        Android phones. It is free, prints on an ordinary card, and can hold either the full contact card (a{" "}
        <Link to="/en/vcard-qr-code/">vCard QR code</Link>, readable offline) or a link to an online profile that
        you can edit after printing.
      </p>
      <p>
        Its limits are well known: you have to frame the code, which takes a few seconds longer than an NFC tap; a
        code that is too small or too dense reads poorly; and a vCard code cannot be updated. To start without
        buying anything, a QR code on a <Link to="/en/business-card-templates/">printed business card</Link> is
        enough.
      </p>
    </Section>
  </>
);

export default CarteVisiteNfc;
