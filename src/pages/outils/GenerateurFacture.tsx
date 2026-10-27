import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { FactureDevisEditeur, ExempleFactureDevis } from "@/components/outils/FactureDevisEditeur";

const LU = "27 octobre 2026";

const EXEMPLE: ExempleFactureDevis = {
  emetteur: {
    forme: "micro",
    nom: "Camille Martin",
    formeJuridique: "",
    capital: "",
    siren: "912 345 678",
    siret: "",
    adresse: "12 rue des Lilas\n69003 Lyon",
    registre: "",
    tva: "",
    franchise: true,
    optionDebits: false,
    email: "camille@exemple.fr",
    telephone: "06 12 34 56 78",
    iban: "",
    assurance: "",
  },
  client: {
    type: "pro",
    nom: "Atelier Durand SARL",
    adresse: "8 avenue Jean Jaurès\n69007 Lyon",
    siren: "823 456 789",
    tva: "",
    adresseLivraison: "",
  },
  lignes: [
    { designation: "Création d'un logo et de sa charte graphique", quantite: "1", unite: "forfait", prix: "850", tva: 20, remise: "" },
    { designation: "Déclinaison sur carte de visite et papier à en-tête", quantite: "3", unite: "h", prix: "55", tva: 20, remise: "" },
  ],
};

const FAQ: QuestionFaq[] = [
  {
    q: "Je suis auto-entrepreneur sans TVA : que doit dire ma facture en plus ?",
    r: "Votre nom suivi de « EI » ou « entrepreneur individuel », votre SIREN et votre adresse, des prix hors taxes sans ligne de TVA, et la mention « TVA non applicable, art. 293 B du CGI ». Cochez « Franchise en base de TVA » dans le générateur : les colonnes de TVA disparaissent et la mention est écrite sous le total et dans les conditions. Le numéro de TVA intracommunautaire n'est alors pas demandé.",
  },
  {
    q: "Mon client est un particulier : faut-il quand même écrire l'indemnité de 40 € ?",
    r: "Non. L'indemnité forfaitaire de 40 € pour frais de recouvrement ne peut être réclamée qu'à un client professionnel ; le générateur ne l'écrit que si vous choisissez « Professionnel ». Le taux des pénalités de retard reste une mention générale. Pour certains biens vendus à un particulier (électroménager, informatique, jouets, meubles…), ajoutez la mention de la garantie légale de conformité de deux ans.",
  },
  {
    q: "Une facture en PDF envoyée par e-mail est-elle encore acceptée depuis septembre 2026 ?",
    r: "Oui tant que vous n'êtes pas soumis à l'émission électronique. Depuis le 1er septembre 2026, seules les grandes entreprises et les ETI doivent émettre leurs factures entre entreprises par une plateforme agréée ; les PME et micro-entreprises le devront au 1er septembre 2027. Un PDF n'est pas une facture électronique au sens de la réforme : passé votre date, vos factures à des professionnels établis en France devront passer par une plateforme.",
  },
  {
    q: "Ma facture fait moins de 150 € HT : le numéro de TVA est-il obligatoire ?",
    r: "Non. Pour une facture dont le total hors taxes est inférieur ou égal à 150 €, le numéro individuel de TVA du vendeur et celui du client professionnel ne sont pas exigés. Les autres mentions restent dues : numéro, dates, identité des deux parties, détail des lignes, totaux, échéance et conditions de retard. Le générateur ne vous signale l'absence de numéro de TVA qu'au-delà de 150 € HT.",
  },
  {
    q: "Le générateur garde-t-il une copie de mes factures ?",
    r: "Non. Le PDF est calculé et téléchargé par votre navigateur ; rien ne part vers un serveur. Seuls l'émetteur et le dernier numéro utilisé peuvent être gardés dans le stockage local de ce navigateur, pour préremplir la facture suivante. Conservez vous-même vos PDF : les factures sont des pièces comptables à garder dix ans. Le bouton « Tout effacer » vide le formulaire et ce stockage local.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (vérifié le 11 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Délais de paiement entre professionnels et pénalités de retard (vérifié le 7 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23211", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Comment se mettre en conformité avec l'obligation de facturation électronique ? (vérifié le 7 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F39785", lu: LU },
  { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: LU },
  { editeur: "economie.gouv.fr", titre: "Mentions obligatoires d'une facture : tout savoir", url: "https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir", lu: LU },
  { editeur: "impots.gouv.fr", titre: "À partir de quand suis-je concerné par la réforme de la facturation électronique ?", url: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation", lu: LU },
  { editeur: "impots.gouv.fr", titre: "Est-ce qu'une facture envoyée par mail est une facture électronique ?", url: "https://www.impots.gouv.fr/professionnel/questions/est-ce-quune-facture-envoyee-par-mail-est-une-facture-electronique", lu: LU },
  { editeur: "impots.gouv.fr", titre: "Franchisé en base, micro-entrepreneur ou auto-entrepreneur, suis-je concerné par la réforme ?", url: "https://www.impots.gouv.fr/professionnel/questions/franchise-en-base-micro-entrepreneur-ou-auto-entrepreneur-suis-je-concerne", lu: LU },
  { editeur: "impots.gouv.fr", titre: "Mes clients sont à la fois des entreprises et des particuliers : par quel dispositif suis-je concerné ?", url: "https://www.impots.gouv.fr/professionnel/questions/mes-clients-sont-la-fois-des-entreprises-et-des-particuliers-par-quel", lu: LU },
  { editeur: "BOFiP-Impôts", titre: "BOI-RES-TVA-000253, transfert de la TVA vers le code des impositions sur les biens et services (7 octobre 2026)", url: "https://bofip.impots.gouv.fr/bofip/14901-PGP.html/identifiant=BOI-RES-TVA-000253-20261007", lu: LU },
  { editeur: "Légifrance", titre: "Code de commerce, article L441-9", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038414397", lu: LU },
  { editeur: "Légifrance", titre: "Code de commerce, article R526-27 (dénomination « EI »)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045697814", lu: LU },
  { editeur: "Légifrance", titre: "Code général des impôts, annexe II, article 242 nonies A", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000050811276", lu: LU },
];

const GenerateurFacture = () => (
  <PageOutil
    href="/generateur-facture/"
    titre="Facture auto-entrepreneur gratuite : générateur PDF en ligne"
    description="Créer une facture en ligne gratuite : micro-entrepreneur, EI ou société, TVA par taux ou franchise 293 B, mentions obligatoires ajoutées, PDF sans inscription."
    motsCles="créer une facture en ligne, facture auto entrepreneur gratuite, générateur de facture gratuit, modèle de facture pdf, mentions obligatoires facture"
    nomAppli="Générateur de facture PDF"
    categorieAppli="BusinessApplication"
    h1="Créer une facture en ligne, mentions obligatoires comprises"
    chapeau="Remplissez l'émetteur, le client et les lignes : l'aperçu se met à jour, les totaux HT, la TVA par taux et le TTC sont calculés, et les mentions légales s'ajoutent selon votre cas. Le PDF est fabriqué dans votre navigateur, rien n'est envoyé."
    faq={FAQ}
    sources={SOURCES}
  >
    <FactureDevisEditeur type="facture" exemple={EXEMPLE} />

    <Section titre="Les mentions que le générateur écrit pour vous">
      <p>
        Une facture doit porter un ensemble de mentions, que le client soit un particulier ou un professionnel :
        date d'émission, <strong>numéro unique</strong> issu d'une séquence chronologique et continue, date de la
        vente ou de la fin de la prestation, identité du vendeur et du client, numéro du bon de commande s'il en
        existe un, détail de chaque ligne (quantité, désignation précise, prix unitaire hors taxes, taux de TVA),
        totaux HT et TTC, date de règlement, conditions d'escompte, taux des pénalités de retard et, pour un client
        professionnel, l'indemnité forfaitaire de 40 € pour frais de recouvrement.
      </p>
      <p>Le générateur adapte le document à votre situation :</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Entrepreneur individuel et micro-entrepreneur</strong> : votre nom est suivi de « EI », comme
          l'exige l'article R526-27 du Code de commerce pour les documents professionnels.
        </li>
        <li>
          <strong>Société</strong> : dénomination, forme juridique et capital social, immatriculation suivie du SIREN
          (« RCS Lyon 123 456 789 »).
        </li>
        <li>
          <strong>Franchise en base de TVA</strong> : prix hors taxes, aucune TVA, et la mention « TVA non applicable,
          art. 293 B du CGI ». Sans elle, Service Public rappelle qu'un contrôle fiscal peut aboutir à un redressement.
        </li>
        <li>
          <strong>Escompte</strong> : s'il n'y en a pas, la facture doit le dire ; le champ vide écrit « Escompte pour
          paiement anticipé : néant ».
        </li>
        <li>
          <strong>Pénalités de retard</strong> : elles sont dues sans rappel. Le taux proposé, 12,40 %, correspond au
          taux de refinancement de la BCE au 1er juillet 2026 (2,40 %) majoré de 10 points ; il ne peut pas être
          inférieur à trois fois le taux d'intérêt légal.
        </li>
        <li>
          <strong>Autoliquidation</strong> : quand c'est le client professionnel qui est redevable de la TVA, la
          facture porte « Autoliquidation » et ne facture pas la taxe.
        </li>
        <li>
          <strong>Activité artisanale</strong> : renseignez votre assurance professionnelle (assureur, couverture
          géographique), elle est reprise sur le PDF.
        </li>
      </ul>
      <p>
        Le numéro de TVA intracommunautaire n'est pas exigé pour une facture de 150 € HT ou moins. Une entreprise
        encore en cours d'immatriculation facture à son nom avec la mention « Siret en cours d'attribution » : tapez-la
        dans le champ SIRET. Côté sanctions, l'article L441-9 du Code de commerce prévoit pour un manquement aux règles
        de facturation une amende administrative pouvant atteindre 75 000 € pour une personne physique et 375 000 €
        pour une personne morale.
      </p>
    </Section>

    <Section titre="Facture électronique : où en est-on au 27 octobre 2026 ?">
      <p>
        La réforme entre en vigueur en deux temps, selon la taille de l'entreprise :
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Depuis le 1er septembre 2026</strong>, toutes les entreprises, micro-entreprises comprises, doivent
          pouvoir <strong>recevoir</strong> des factures électroniques ; les grandes entreprises et les ETI doivent
          aussi les <strong>émettre</strong> et transmettre leurs données à l'administration.
        </li>
        <li>
          <strong>À partir du 1er septembre 2027</strong>, l'émission électronique et la transmission des données
          deviennent obligatoires pour les PME et les micro-entreprises, franchisés en base de TVA compris.
        </li>
      </ul>
      <p>
        Quatre mentions s'ajoutent avec la réforme, à la même date que l'émission électronique pour votre catégorie
        d'entreprise : le <strong>SIREN du client</strong> professionnel, l'<strong>adresse de livraison</strong> si
        elle diffère de celle du client, la <strong>nature des opérations</strong> (livraisons de biens, prestations
        de services ou les deux) et, le cas échéant, « <strong>Option pour le paiement de la taxe d'après les
        débits</strong> ». Le générateur les écrit déjà, pour que votre modèle soit prêt le jour venu.
      </p>
      <p>
        Ce que cela change pour un PDF fait ici : selon impots.gouv.fr, un PDF envoyé par e-mail n'est pas une facture
        électronique, qui doit contenir des données structurées et passer par une plateforme agréée. Tant que vous
        n'êtes pas soumis à l'émission électronique, c'est-à-dire jusqu'au 31 août 2027 pour une PME ou une
        micro-entreprise, une facture PDF complète reste valable. Ensuite, elle ne suffira plus pour vos clients
        professionnels établis en France. Pour vos ventes à des particuliers, il n'y aura pas de facture
        électronique : vous transmettrez des données de transaction à l'administration (e-reporting), selon le même
        calendrier.
      </p>
      <p>
        Dernier point : à partir du 1er janvier 2027, les règles de TVA passent du code général des impôts au code
        des impositions sur les biens et services. D'après le BOFiP du 7 octobre 2026, les factures pourront encore
        renvoyer au code général des impôts jusqu'au 30 juin 2028 ; la mention « art. 293 B du CGI » reste donc
        utilisable.
      </p>
    </Section>

    <Section titre="Mode d'emploi et calculs">
      <p>
        <strong>1. Émetteur.</strong> Choisissez votre forme, puis remplissez nom, SIREN et adresse. Si la case de
        mémorisation est cochée, ces informations restent dans ce navigateur pour la prochaine facture.
      </p>
      <p>
        <strong>2. Numéro.</strong> Il doit suivre une séquence chronologique et continue, sans trou. Après chaque
        téléchargement, le numéro utilisé est mémorisé ; le bouton « Facture suivante » propose le numéro d'après
        (F-2026-007 devient F-2026-008), vide le client et les lignes, et garde l'émetteur.
      </p>
      <p>
        <strong>3. Lignes.</strong> Chaque montant est arrondi au centime <em>par ligne</em> : quantité × prix
        unitaire HT, moins la remise éventuelle. Le total HT est la somme des lignes. La TVA est calculée{" "}
        <em>par taux</em>, sur la base HT de toutes les lignes à ce taux, puis arrondie au centime ; le TTC est le
        total HT plus ces montants de TVA. Les taux proposés sont 20 %, 10 %, 5,5 %, 2,1 % et 0 %.
      </p>
      <p>
        <strong>4. PDF.</strong> Le document est mis en page au format A4 ; si les lignes ne tiennent pas sur une
        page, le tableau continue sur la suivante avec ses en-têtes, et chaque page est numérotée. Pour un devis
        avant travaux, utilisez le <Link to="/generateur-devis/">générateur de devis</Link> : il ajoute la durée de
        validité et le bon pour accord.
      </p>
    </Section>
  </PageOutil>
);

export default GenerateurFacture;
