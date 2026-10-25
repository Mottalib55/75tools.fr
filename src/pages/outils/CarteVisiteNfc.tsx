import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  OutilLayout,
  EnTete,
  Section,
  Faq,
  faqJsonLd,
  Sources,
  AutresOutils,
  QuestionFaq,
} from "@/components/outils/OutilLayout";
import { cn } from "@/lib/utils";

const URL_PAGE = "https://75tools.fr/carte-de-visite-nfc/";
const TITRE = "Carte de visite NFC ou QR code : laquelle choisir en 2026 ?";
const DESCRIPTION =
  "Carte de visite NFC ou QR code : fonctionnement, compatibilité iPhone et Android, coût, limites. Un comparatif honnête et un test en 4 questions pour choisir.";

const FAQ: QuestionFaq[] = [
  {
    q: "Une carte de visite NFC fonctionne-t-elle avec tous les iPhone ?",
    r: "Apple indique que la lecture des puces NFC en arrière-plan, sans ouvrir d'application, est prise en charge à partir de l'iPhone XS. Il faut que l'iPhone soit en cours d'utilisation, écran allumé ; la lecture ne se fait pas pendant que l'appareil photo ou Apple Pay est ouvert, ni en mode avion. Sur un modèle plus ancien, le QR code imprimé sur la même carte prend le relais.",
  },
  {
    q: "Faut-il une application pour lire une carte de visite NFC ?",
    r: "Non, sur un iPhone XS ou plus récent, ni sur un téléphone Android équipé du NFC, à condition que le NFC soit activé dans les réglages : la documentation Android précise que l'appareil cherche les puces quand l'écran est déverrouillé. Le téléphone affiche alors une notification ou ouvre directement le lien enregistré dans la carte.",
  },
  {
    q: "Peut-on reprogrammer une carte NFC pour changer le lien ?",
    r: "Oui, tant que la puce n'a pas été verrouillée en écriture. Une application d'écriture NFC sur téléphone permet d'y enregistrer une nouvelle adresse. Certaines cartes vendues avec un service en ligne sont verrouillées : le lien ne peut alors être changé que chez le vendeur. Posez la question avant d'acheter.",
  },
  {
    q: "Que devient ma carte NFC si le service qui l'héberge ferme ?",
    r: "La puce contient en général une adresse web qui ouvre votre profil chez le vendeur. Si ce service s'arrête ou si l'abonnement n'est pas renouvelé, la carte ouvre une page vide ou une erreur. Pour éviter cela, choisissez une carte non verrouillée et faites-la pointer vers une adresse que vous maîtrisez : votre site, ou une carte en ligne dont vous gardez le lien.",
  },
  {
    q: "Quelqu'un peut-il lire ma carte NFC à mon insu ?",
    r: "Il faudrait approcher un téléphone à quelques centimètres de la carte : la documentation Android parle d'une distance de 4 cm ou moins. Et la puce ne contient que ce que vous voulez donner, en pratique un lien vers votre carte en ligne. Ce n'est pas une carte bancaire : il n'y a ni code ni donnée sensible à voler.",
  },
];

type Rep = Record<string, string>;

const QUESTIONS: { id: string; q: string; options: { v: string; l: string }[] }[] = [
  { id: "rencontre", q: "Où rencontrez-vous vos contacts ?", options: [{ v: "face", l: "Surtout en face à face" }, { v: "distance", l: "Aussi à distance (mail, visio, imprimés)" }] },
  { id: "budget", q: "Êtes-vous prêt à acheter un support ?", options: [{ v: "non", l: "Non, je veux du gratuit" }, { v: "oui", l: "Oui, une carte NFC" }] },
  { id: "change", q: "Vos coordonnées changent-elles ?", options: [{ v: "rarement", l: "Rarement" }, { v: "souvent", l: "Souvent, ou je veux ajouter des liens" }] },
  { id: "public", q: "Qui sont vos interlocuteurs ?", options: [{ v: "tous", l: "Tout public, téléphones de tous âges" }, { v: "pros", l: "Surtout des pros bien équipés" }] },
];

function recommander(r: Rep): { titre: string; raisons: string[]; liens: { href: string; l: string }[] } {
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
    r.change === "souvent"
      ? { href: "/mycard/", l: "Créer ma carte en ligne MyCard" }
      : { href: "/carte-de-visite-qr-code/", l: "Créer mon QR code vCard" },
    { href: "/modele-carte-de-visite/", l: "Préparer la carte papier" },
  ];
  if (nfc)
    return {
      titre: "Une carte NFC, avec le QR code imprimé dessus",
      raisons: [...raisons, "Faites imprimer le QR code sur la carte NFC : il prend le relais sur les téléphones sans NFC actif."],
      liens,
    };
  return { titre: r.change === "souvent" ? "Un QR code vers une carte en ligne" : "Un QR code, sans puce NFC", raisons, liens };
}

const CarteVisiteNfc = () => {
  const [rep, setRep] = useState<Rep>({});
  const complet = QUESTIONS.every((q) => rep[q.id]);
  const reco = complet ? recommander(rep) : null;

  return (
    <OutilLayout>
      <SEO
        exactTitle
        title={TITRE}
        description={DESCRIPTION}
        keywords="carte de visite nfc, carte nfc ou qr code, carte de visite connectée, carte de visite digitale"
        url={URL_PAGE}
        locale="fr_FR"
        type="article"
        imageAlt="Carte de visite NFC ou QR code : comparatif"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Test : carte de visite NFC ou QR code",
            url: URL_PAGE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Navigateur web",
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            description: DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: "75tools", url: "https://75tools.fr/" },
          },
          faqJsonLd(FAQ),
        ]}
      />

      <EnTete
        titre="Carte de visite NFC ou QR code : laquelle choisir ?"
        chapeau="Répondez à quatre questions pour savoir ce qui vous convient, puis lisez le comparatif : fonctionnement, compatibilité des téléphones, coût et limites de chaque solution."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        <div className="space-y-4" role="group" aria-label="Test en quatre questions">
          {QUESTIONS.map((q, i) => (
            <fieldset key={q.id}>
              <legend className="text-sm text-neutral-200 mb-1.5">
                {i + 1}. {q.q}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    aria-pressed={rep[q.id] === o.v}
                    onClick={() => setRep((x) => ({ ...x, [q.id]: o.v }))}
                    className={cn(
                      "min-h-[2.75rem] px-3 py-2 rounded-md border text-sm text-left",
                      rep[q.id] === o.v
                        ? "border-sky-400 bg-sky-400/10 text-white"
                        : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                    )}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div aria-live="polite" className="border-l-2 border-sky-400 bg-neutral-900 rounded-r-md p-5 lg:sticky lg:top-4">
          {reco ? (
            <>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Notre recommandation</p>
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
              <p className="text-xs uppercase tracking-wider text-neutral-500">Votre réponse</p>
              <p className="mt-1 text-neutral-300">
                Répondez aux {QUESTIONS.length} questions : la recommandation s'affiche ici, avec ses raisons.
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                En bref : le QR code est gratuit et lisible par presque tous les téléphones ; la carte NFC est plus
                rapide en face à face mais demande un support payant et un téléphone compatible.
              </p>
            </>
          )}
        </div>
      </div>

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
              <tr><td className="pr-4 text-neutral-200">iPhone</td><td className="pr-4">Sans application à partir de l'iPhone XS, écran allumé</td><td>Appareil photo intégré</td></tr>
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
          d'octets : de quoi enregistrer un lien, rarement plus. En pratique, presque toutes les cartes de visite
          NFC contiennent donc <strong>une adresse web</strong> qui ouvre un profil en ligne.
        </p>
        <p>
          Il y a une raison technique à cela, côté iPhone : la documentation d'Apple précise que la lecture en
          arrière-plan cherche un enregistrement de type lien (URI) dans la puce, et ouvre ce lien. Une fiche
          contact enregistrée directement dans la puce n'est pas traitée de la même façon. Le lien vers une carte
          en ligne est donc le contenu qui fonctionne sur iPhone comme sur Android.
        </p>
        <p>
          Les conditions de lecture comptent aussi. Sur iPhone, Apple indique que la lecture en arrière-plan n'a
          lieu que si l'iPhone est en cours d'utilisation, et pas quand l'appareil photo ou Apple Pay est ouvert, ni
          en mode avion. Sur Android, le téléphone cherche les puces quand l'écran est déverrouillé, si le NFC n'a
          pas été désactivé dans les réglages ; et tous les modèles n'ont pas de puce NFC. Ce sont autant de cas où
          votre interlocuteur approche son téléphone et où rien ne se passe : d'où l'intérêt d'imprimer aussi un QR
          code sur la carte.
        </p>
      </Section>

      <Section titre="Et le QR code, ses vrais avantages et ses limites">
        <p>
          Le QR code se lit avec l'appareil photo, intégré à l'iPhone et à la plupart des téléphones Android
          récents. Il ne coûte rien, s'imprime sur une carte classique, et peut contenir soit la fiche contact
          complète (<Link to="/carte-de-visite-qr-code/">QR code vCard</Link>, lisible sans connexion), soit un lien
          vers une carte en ligne comme <Link to="/mycard/">MyCard</Link>, modifiable après l'impression.
        </p>
        <p>
          Ses limites sont connues : il faut cadrer le code, ce qui prend quelques secondes de plus qu'un contact
          NFC ; un code trop petit ou trop dense se lit mal ; et un code vCard ne se met pas à jour. Pour un usage en
          face à face fréquent, une carte NFC avec le QR code imprimé au dos réunit les deux. Pour démarrer sans
          rien acheter, un QR code sur une{" "}
          <Link to="/modele-carte-de-visite/">carte de visite imprimée</Link> suffit.
        </p>
      </Section>

      <Faq faq={FAQ} />

      <Sources
        sources={[
          { editeur: "Apple Developer", titre: "Adding Support for Background Tag Reading (Core NFC)", url: "https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading", lu: "25 octobre 2026" },
          { editeur: "Android Developers", titre: "Présentation de la technologie NFC", url: "https://developer.android.com/develop/connectivity/nfc?hl=fr", lu: "25 octobre 2026" },
          { editeur: "Android Developers", titre: "Principes de base de la technologie NFC", url: "https://developer.android.com/develop/connectivity/nfc/nfc?hl=fr", lu: "25 octobre 2026" },
          { editeur: "Assistance Apple", titre: "Scanner un code QR avec la caméra de l'iPhone", url: "https://support.apple.com/fr-fr/guide/iphone/iphe8bda8762/ios", lu: "25 octobre 2026" },
        ]}
      />

      <AutresOutils courant="/carte-de-visite-nfc/" />
    </OutilLayout>
  );
};

export default CarteVisiteNfc;
