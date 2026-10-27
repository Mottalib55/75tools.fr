import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { FactureDevisEditeur, ExempleFactureDevis } from "@/components/outils/FactureDevisEditeur";
import type { Langue } from "@/lib/langue";

/** Exemple prérempli : le devis reste rédigé en français dans les deux langues (document français). */
const EXEMPLE: ExempleFactureDevis = {
  emetteur: {
    forme: "societe",
    nom: "Dupont Rénovation",
    formeJuridique: "SARL",
    capital: "8000",
    siren: "834 567 123",
    siret: "",
    adresse: "45 rue Garibaldi\n69006 Lyon",
    registre: "RCS Lyon",
    tva: "FR 47 834567123",
    franchise: false,
    optionDebits: false,
    email: "contact@exemple.fr",
    telephone: "04 72 00 00 00",
    iban: "",
    assurance: "Assurance décennale : Assureur Exemple, 1 place de la Bourse, 69002 Lyon ; couverture : France métropolitaine",
  },
  client: {
    type: "particulier",
    nom: "Mme Claire Bernard",
    adresse: "3 chemin des Vignes\n69130 Écully",
    siren: "",
    tva: "",
    adresseLivraison: "",
  },
  lignes: [
    { designation: "Dépose et évacuation de l'ancien lavabo", quantite: "1", unite: "forfait", prix: "120", tva: 20, remise: "" },
    { designation: "Meuble vasque 80 cm, mitigeur et siphon (fourniture)", quantite: "1", unite: "u", prix: "640", tva: 20, remise: "" },
    { designation: "Pose et raccordement, main-d'œuvre (taux horaire 52 € HT, soit 62,40 € TTC ; temps compté à la demi-heure)", quantite: "6", unite: "h", prix: "52", tva: 20, remise: "" },
  ],
  document: {
    nature: "mixte",
    lieu: "3 chemin des Vignes, 69130 Écully",
    duree: "1 jour",
    fraisDeplacement: "35",
    mentionsLibres: "Les pièces et appareils remplacés peuvent être conservés par le client s'il le souhaite.",
  },
};

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Mon client a signé le devis puis renonce : je garde l'acompte ou pas ?",
      r: "Tout dépend de la nature de la somme versée. Un acompte engage les deux parties : celle qui se retire peut devoir des dommages et intérêts. Des arrhes permettent au client de renoncer en les perdant, et au professionnel de renoncer en rendant le double. Si le devis ne précise rien, la somme est considérée comme des arrhes : écrivez donc « acompte » noir sur blanc dans les conditions de paiement.",
    },
    {
      q: "Je suis plombier, dois-je faire un devis même pour un petit dépannage ?",
      r: "La plomberie fait partie des travaux et dépannages du bâtiment et de l'équipement de la maison pour lesquels Service Public liste un devis préalable obligatoire, comme l'électricité, la serrurerie, la vitrerie ou le débouchage de canalisations. Sans devis remis au client, l'amende administrative peut aller jusqu'à 3 000 € pour un entrepreneur individuel et 15 000 € pour une société.",
    },
    {
      q: "Ai-je le droit de faire payer un devis ?",
      r: "Dans les travaux et dépannages du bâtiment, le devis peut être gratuit ou payant, mais il doit indiquer lequel et, s'il est payant, son coût. Pour le déménagement, la location de voiture, l'optique, les services à la personne ou les prestations funéraires, Service Public indique qu'il est gratuit. Le générateur écrit « Devis gratuit » par défaut ; décochez la case pour écrire « Devis payant » et ajoutez une ligne pour son prix.",
    },
    {
      q: "Combien de jours de validité mettre sur un devis ?",
      r: "Les fiches officielles demandent que la durée de validité de l'offre figure sur le devis, sans fixer de durée type : c'est à vous de la choisir selon la stabilité de vos prix et de votre planning. Le générateur propose 30 jours et calcule la date limite à partir de la date d'émission. Passé ce délai, vous pouvez refaire un devis aux nouveaux prix.",
    },
    {
      q: "Le client a signé, mais il veut ajouter des travaux : je modifie le devis ?",
      r: "Non, le devis accepté vaut accord sur ce qu'il décrit, et aucune des deux parties ne peut en changer seule le prix ou le contenu. Pour des travaux en plus, faites un devis complémentaire avec son propre numéro, que le client signe à son tour avec la mention « bon pour accord ». Dans le générateur, le bouton « Devis suivant » garde vos coordonnées et propose le numéro d'après.",
    },
    {
      q: "Auto-entrepreneur sans TVA, que mettre dans la colonne TVA du devis ?",
      r: "Rien : en franchise en base, le devis est chiffré hors taxes, sans taux ni montant de TVA, et porte la mention « TVA non applicable, art. 293 B du CGI ». Cochez la case de franchise dans le générateur, la colonne disparaît et la mention s'écrit seule. Si votre chiffre d'affaires dépasse le seuil majoré (41 250 € pour des services en 2026), la TVA devient due dès ce dépassement : refaites alors vos devis en cours.",
    },
  ],
  en: [
    {
      q: "My client signed the devis and then pulled out: can I keep the deposit?",
      r: "It depends on what the money was called. An acompte (deposit) binds both sides, and whoever backs out may owe damages. Arrhes let the client walk away by losing them, and let you withdraw by paying back twice the amount. When the quote says nothing, French law treats the payment as arrhes, so write « acompte » plainly in the payment terms before the client signs.",
    },
    {
      q: "Is a written quote compulsory for building and repair work in France?",
      r: "Yes for a list of home building and repair trades: plumbing, electrics, masonry, roofing, locksmithing, glazing, drain unblocking and more. Removals, car hire, medical optics, hearing aids, home services from €100 a month and funeral services also require one. Without a quote, the administrative fine can reach €3,000 for a sole trader and €15,000 for a company, according to Service Public.",
    },
    {
      q: "Am I allowed to charge for a quote in France?",
      r: "For building and repair work, a quote can be free or paid, but it must say which and, if paid, how much. For removals, car hire, optics, home services and funeral services, Service Public says the quote is free. The generator writes « Devis gratuit » (free quote) by default; untick the box to print « Devis payant » and add a line with its price.",
    },
    {
      q: "How long should a French quote stay valid?",
      r: "Official guidance asks for the validity period to appear on the devis but sets no standard length: choose it according to how stable your prices and schedule are. The generator suggests 30 days and works out the end date from the issue date. Once that date has passed, you can send a new quote at your current prices.",
    },
    {
      q: "I am a micro-entrepreneur without VAT: what goes in the VAT column of my quote?",
      r: "Nothing. Under the franchise en base de TVA, the quote shows prices without VAT, with no rate or VAT amount, and the sentence « TVA non applicable, art. 293 B du CGI ». Tick the VAT exemption box and the column disappears. If your turnover goes above the upper threshold (€41,250 for services in 2026), VAT is due from then on, so redo any open quotes.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Entreprendre Service Public", titre: "Devis obligatoire : activités concernées", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31144", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise (rubrique Devis)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (vérifié le 11 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Entreprendre Service Public", titre: "Devis obligatoire : activités concernées (when a quote is compulsory)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31144", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise (a micro-business's quotes and invoices)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (mandatory invoice mentions, checked 11 August 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA (VAT exemption below the threshold)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de devis PDF 75tools",
    motsCles: "faire un devis en ligne, modèle de devis pdf, générateur de devis gratuit, devis auto-entrepreneur, devis travaux",
  },
  en: {
    nomAppli: "75tools French quote (devis) generator",
    motsCles: "quote generator france, french devis template, devis in english, micro-entrepreneur quote, french building work quote",
  },
};

const GenerateurDevis = ({ lang = "fr" }: { lang?: Langue }) => (
  <PageOutil
    id="generateur-devis"
    lang={lang}
    motsCles={T[lang].motsCles}
    nomAppli={T[lang].nomAppli}
    categorieAppli="BusinessApplication"
    faq={FAQ[lang]}
    sources={SOURCES[lang]}
    outil={<FactureDevisEditeur type="devis" exemple={EXEMPLE} />}
  >
    {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
  </PageOutil>
);

const ContenuFr = () => (
  <>
    <Section titre="Faire un devis en ligne gratuit, prêt à signer">
      <p>
        Pour faire un devis en ligne gratuit, indiquez votre statut et vos coordonnées, le client, le lieu des
        travaux, puis décrivez la prestation ligne par ligne avec la quantité, l'unité et le prix hors taxes : le
        total TTC, l'acompte et la date de fin de validité se calculent pendant la saisie, et l'aperçu montre le
        devis tel qu'il sera imprimé, avec son cadre « Bon pour accord » pour la signature du client. L'exemple
        prérempli, un remplacement de lavabo par une SARL de plomberie, totalise 1 107 € HT avec 35 € de frais de
        déplacement, soit 1 328,40 € TTC à 20 %, et un acompte de 30 % de 398,52 € à la signature. Le devis est
        valable 30 jours par défaut ; le bouton « Télécharger le devis PDF » produit le fichier A4. La limite : le
        modèle suit la liste demandée pour les travaux du bâtiment ; un déménageur ou un opticien a des mentions
        propres à ajouter.
      </p>
    </Section>

    <Section titre="Quand le devis est-il obligatoire ?">
      <p>
        En dehors de certains secteurs, la loi n'impose pas de devis : il suffit d'informer le client avant la vente,
        par exemple par des conditions générales de vente. Service Public liste les activités où la remise d'un devis
        préalable est obligatoire :
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Travaux et dépannages du bâtiment et de l'équipement de la maison</strong> : maçonnerie,
          plomberie, électricité, menuiserie, serrurerie, couverture, étanchéité, isolation, peinture, plâtrerie,
          vitrerie, revêtements de sols et de murs, ramonage, génie climatique, débouchage de canalisations,
          dératisation, entretien des alarmes ou des extincteurs, entre autres ;
        </li>
        <li>
          <strong>Déménagement</strong>, et <strong>location de voiture</strong> de moins de 3,5 tonnes sans
          chauffeur ;
        </li>
        <li>
          <strong>Optique médicale</strong> et <strong>appareillage auditif</strong> ;
        </li>
        <li>
          <strong>Services à la personne</strong>, dès 100 € TTC par mois ; <strong>produits et services
          compensant la perte d'autonomie</strong>, dès 500 € TTC ou sur mesure ;
        </li>
        <li>
          <strong>Chirurgie esthétique</strong>, dès 300 € ou en cas d'anesthésie générale ;{" "}
          <strong>prestations funéraires</strong>.
        </li>
      </ul>
      <p>
        Dans ces cas, ne pas remettre de devis expose à une amende administrative pouvant aller jusqu'à 3 000 € pour
        une personne physique et 15 000 € pour une société. Le contenu exigé varie selon le secteur : un déménageur
        doit par exemple indiquer le volume du mobilier et les lieux de chargement et de livraison.
      </p>
    </Section>

    <Section titre="Ce que contient le devis généré">
      <p>
        Le modèle suit la liste demandée pour les travaux du bâtiment, la plus fréquente : date de rédaction, nom et
        adresse de l'entreprise, nom du client, <strong>lieu d'exécution</strong>, nature exacte des travaux,
        décompte détaillé en quantité et en prix de chaque prestation et produit (dénomination, prix unitaire, unité
        comme l'heure ou le mètre carré, quantité prévue), <strong>frais de déplacement</strong> s'il y en a, somme
        globale HT et TTC avec le taux de TVA, <strong>durée de validité</strong>, et la mention du devis gratuit
        ou payant.
      </p>
      <p>
        Deux points demandent votre attention. Le <strong>taux horaire de main-d'œuvre TTC</strong> et la façon de
        décompter le temps estimé doivent figurer : écrivez-les dans la désignation de la ligne de main-d'œuvre,
        comme dans l'exemple. Et le client doit être informé qu'il peut conserver les pièces, éléments ou appareils
        remplacés : la mention est prévue dans les mentions complémentaires.
      </p>
      <p>
        Comme sur une facture, un entrepreneur individuel fait suivre son nom de « EI », un franchisé en base écrit
        « TVA non applicable, art. 293 B du CGI », et un artisan dont le métier impose une assurance (la décennale
        d'un plombier, par exemple) indique l'assureur et la couverture géographique. Le générateur ajoute aussi la
        date de début prévue et la durée estimée des travaux, utiles pour le client même quand elles ne sont pas
        exigées. Les frais de déplacement deviennent une ligne du devis, au taux de TVA de la première ligne.
      </p>
    </Section>

    <Section titre="Signature, acompte et suite du devis">
      <p>
        Le devis engage le professionnel dès que le client l'accepte ; le client, lui, n'est engagé qu'à sa
        signature, précédée de la mention manuscrite « bon pour accord » ou « bon pour travaux ». Le cadre
        d'acceptation du PDF porte aussi la phrase « Devis reçu avant l'exécution des travaux », qui garde la trace
        de la remise du devis avant le chantier, avec la date et la signature. Pour un devis signé à distance, le
        client peut <Link to="/signer-pdf/">signer le PDF</Link> sans l'imprimer.
      </p>
      <p>
        L'acompte demandé à la signature est calculé en pourcentage du total TTC. Précisez bien qu'il s'agit d'un
        acompte : sans précision, la somme versée est traitée comme des arrhes, que le client peut abandonner pour se
        dédire. Si le devis est accepté à la suite d'un démarchage, le client dispose de 14 jours pour se rétracter,
        sauf pour les travaux et réparations d'urgence, comme une fuite d'eau.
      </p>
      <p>
        Les travaux terminés, reprenez les mêmes lignes dans le <Link to="/generateur-facture/">générateur de
        facture</Link>, qui ajoute numéro chronologique, échéance, pénalités de retard et, pour un client
        professionnel, l'indemnité de 40 € pour frais de recouvrement.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="A French quote generator, ready for the client's signature">
      <p>
        This quote (devis) generator for France takes your status and details, the client, the place of work and
        then each line with quantity, unit and price before VAT. The total including VAT, the deposit and the end of
        validity are worked out as you type, and the preview shows the devis as it will print, with a « Bon pour
        accord » box where the client signs. The prefilled example, a washbasin replacement by a plumbing SARL, comes
        to €1,107 before VAT including €35 of travel costs, so €1,328.40 with 20% VAT and a 30% deposit of €398.52 on
        signature. The quote is valid for 30 days by default, and "Download the quote PDF" produces the A4 file. The
        document stays in French with its French mentions, since that is what a French client signs. The main
        limit: the template follows the list required for building work; removal firms or opticians have extra
        mentions of their own.
      </p>
    </Section>

    <Section titre="When a quote is compulsory in France">
      <p>
        Outside certain trades, French law does not require a quote: informing the client before the sale, for
        example with terms and conditions, is enough. Service Public lists the activities where a written quote must
        be handed over first. The longest list covers building and repair work in the home: masonry, plumbing,
        electrics, joinery, locksmithing, roofing, waterproofing, insulation, painting, plastering, glazing, floor
        and wall coverings, chimney sweeping, heating and air conditioning, drain unblocking, pest control and the
        servicing of alarms or fire extinguishers, among others.
      </p>
      <p>
        Removals and car hire under 3.5 tonnes without a driver also need one, as do medical optics and hearing aids,
        home services from €100 including VAT a month, products and services for loss of autonomy from €500 or made
        to measure, cosmetic surgery from €300 or under general anaesthetic, and funeral services. In those cases,
        failing to provide a quote can lead to an administrative fine of up to €3,000 for an individual and €15,000
        for a company. The required content varies by trade: a removal firm must state the volume of furniture and
        the loading and delivery addresses, for example.
      </p>
    </Section>

    <Section titre="What the generated devis contains">
      <p>
        The template follows the list for building work, the most common case: date, business name and address,
        client name, <strong>place of work</strong> (lieu d'exécution), exact nature of the work, a detailed count of
        each service and product with unit price, unit (hour, square metre…) and quantity, <strong>travel
        costs</strong> if any, totals before and after VAT with the rate, the <strong>validity period</strong>, and
        whether the quote is free or paid.
      </p>
      <p>
        Two points need your attention. The <strong>hourly labour rate including VAT</strong> and how the estimated
        time is counted must appear: write them in the description of the labour line, as in the example. And the
        client must be told they may keep replaced parts and appliances: the example puts that sentence in the extra
        mentions. As on an invoice, a sole trader's name is followed by « EI », a business under the VAT exemption
        writes « TVA non applicable, art. 293 B du CGI », and a craft trade that requires insurance, such as a
        plumber's ten-year building cover (assurance décennale), states the insurer and geographical cover. Type
        descriptions in French: they are printed as written.
      </p>
    </Section>

    <Section titre="Signature, deposit and what comes next">
      <p>
        You are bound by the quote once the client accepts it; the client is bound only when signing, under the
        handwritten words « bon pour accord » or « bon pour travaux ». The acceptance box also carries « Devis reçu
        avant l'exécution des travaux » (quote received before the work), with date and signature. For a quote
        signed remotely, the client can <Link to="/en/sign-pdf/">sign the PDF online</Link> without printing it.
      </p>
      <p>
        The deposit is a percentage of the total including VAT. If the quote is accepted after doorstep selling, the
        client has 14 days to withdraw, except for urgent repairs such as a water leak. Once the work is done, copy
        the same lines into the <Link to="/en/invoice-generator/">French invoice generator</Link>, which adds the
        sequential number, due date, late-payment penalties and, for a business client, the €40 recovery fee.
      </p>
    </Section>
  </>
);

export default GenerateurDevis;
