import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { FactureDevisEditeur, ExempleFactureDevis } from "@/components/outils/FactureDevisEditeur";

const LU = "27 octobre 2026";

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

const FAQ: QuestionFaq[] = [
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
];

const SOURCES: Source[] = [
  { editeur: "Entreprendre Service Public", titre: "Devis obligatoire : activités concernées", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31144", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise (rubrique Devis)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (vérifié le 11 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: LU },
  { editeur: "Légifrance", titre: "Code de commerce, article R526-27 (dénomination « EI »)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045697814", lu: LU },
];

const GenerateurDevis = () => (
  <PageOutil
    href="/generateur-devis/"
    titre="Faire un devis en ligne gratuit : modèle de devis PDF"
    description="Faire un devis en ligne gratuit : lignes chiffrées, TVA par taux, frais de déplacement, acompte, validité et bon pour accord. Modèle de devis PDF sans compte."
    motsCles="faire un devis en ligne, modèle de devis pdf, générateur de devis gratuit, devis auto-entrepreneur, devis travaux"
    nomAppli="Générateur de devis PDF"
    categorieAppli="BusinessApplication"
    h1="Générateur de devis gratuit, avec bon pour accord"
    chapeau="Décrivez les travaux ou la prestation ligne par ligne : totaux HT, TVA et TTC, acompte et date de fin de validité se calculent seuls, et le PDF prévoit la signature du client. Tout est fait dans votre navigateur, rien n'est envoyé."
    faq={FAQ}
    sources={SOURCES}
  >
    <FactureDevisEditeur type="devis" exemple={EXEMPLE} />

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
        exigées.
      </p>
    </Section>

    <Section titre="Signature, acompte et suite du devis">
      <p>
        Le devis engage le professionnel dès que le client l'accepte ; le client, lui, n'est engagé qu'à sa
        signature, précédée de la mention manuscrite « bon pour accord » ou « bon pour travaux ». Le cadre
        d'acceptation du PDF porte aussi la phrase « Devis reçu avant l'exécution des travaux », qui garde la trace
        de la remise du devis avant le chantier, avec la date et la signature.
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
  </PageOutil>
);

export default GenerateurDevis;
