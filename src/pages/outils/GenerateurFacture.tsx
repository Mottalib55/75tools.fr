import { Link } from "react-router-dom";
import { PageOutil } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { FactureDevisEditeur, ExempleFactureDevis } from "@/components/outils/FactureDevisEditeur";
import type { Langue } from "@/lib/langue";

/** Exemple prérempli : la facture reste rédigée en français dans les deux langues (document français). */
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

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
      q: "J'ai fait une erreur sur une facture déjà envoyée, puis-je la refaire avec le même numéro ?",
      r: "Non : une facture émise ne se supprime pas et son numéro ne se réutilise pas, sinon la séquence chronologique et continue est rompue. Établissez un avoir (facture négative) qui annule tout ou partie de la première, en citant son numéro, puis une nouvelle facture au numéro suivant. Le générateur ne fait pas d'avoir, mais il prépare la facture corrigée : gardez les lignes, corrigez-les et prenez le numéro suivant.",
    },
    {
      q: "Le générateur garde-t-il une copie de mes factures ?",
      r: "Non. Le PDF est calculé et téléchargé par votre navigateur ; rien ne part vers un serveur. Seuls l'émetteur et le dernier numéro utilisé peuvent être gardés dans le stockage local de ce navigateur, pour préremplir la facture suivante. Conservez vous-même vos PDF : les factures sont des pièces comptables à garder dix ans. Le bouton « Tout effacer » vide le formulaire et ce stockage local.",
    },
  ],
  en: [
    {
      q: "I am a micro-entrepreneur below the VAT threshold: what must my French invoice say?",
      r: "Your name followed by « EI » (entrepreneur individuel), your SIREN number and address, prices without VAT, and the sentence « TVA non applicable, art. 293 B du CGI », which tells your client that no VAT is charged under the French franchise en base. Tick the VAT exemption box in the generator: the VAT columns disappear and the sentence is printed under the total. No EU VAT number is needed in that case.",
    },
    {
      q: "Can I write my invoice in English for a client in France?",
      r: "Not on its own. The 1994 Toubon law makes French compulsory on invoices and receipts issued in France, and the tax office can ask for a French version during an audit. You may add an English translation next to the French text, but the French version is the one that counts. That is why this page has an English interface while the invoice it produces keeps French wording and legal mentions.",
    },
    {
      q: "Is a PDF invoice sent by email still valid after September 2026?",
      r: "Yes, until French e-invoicing applies to you. Since 1 September 2026 only large companies and mid-sized firms (ETI) must issue business-to-business invoices through an approved platform; small businesses and micro-entrepreneurs follow on 1 September 2027. Every business, however small, must already be able to receive e-invoices. After your date, a PDF sent by email will no longer be enough for business clients established in France.",
    },
    {
      q: "My client is a private individual: do I still add the €40 recovery fee?",
      r: "No. The fixed €40 compensation for recovery costs (indemnité forfaitaire pour frais de recouvrement) can only be claimed from a business client, so the generator prints it only when you choose Business. The late-payment penalty rate is still written. When you sell goods such as appliances, computers, toys or furniture to a private client, tick the box for the two-year legal conformity guarantee.",
    },
    {
      q: "Does the generator keep a copy of my invoices?",
      r: "No. Your browser calculates and downloads the PDF; nothing is sent to a server. Only your seller details and the last number used can be kept in this browser's local storage, to prefill the next invoice. Keep your PDFs yourself: invoices are accounting records that French law asks you to keep for ten years. The Clear everything button empties the form and that local storage.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (vérifié le 11 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Délais de paiement entre professionnels et pénalités de retard (vérifié le 7 août 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23211", lu: "27 octobre 2026" },
    { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: "27 octobre 2026" },
    { editeur: "economie.gouv.fr", titre: "Mentions obligatoires d'une facture : tout savoir", url: "https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir", lu: "27 octobre 2026" },
    { editeur: "impots.gouv.fr", titre: "À partir de quand suis-je concerné par la réforme de la facturation électronique ?", url: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation", lu: "27 octobre 2026" },
    { editeur: "impots.gouv.fr", titre: "Est-ce qu'une facture envoyée par mail est une facture électronique ?", url: "https://www.impots.gouv.fr/professionnel/questions/est-ce-quune-facture-envoyee-par-mail-est-une-facture-electronique", lu: "27 octobre 2026" },
    { editeur: "BOFiP-Impôts", titre: "BOI-RES-TVA-000253, dispositions transitoires liées à la codification de la TVA dans le code des impositions sur les biens et services (7 octobre 2026)", url: "https://bofip.impots.gouv.fr/bofip/14901-PGP.html/identifiant=BOI-RES-TVA-000253-20261007", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Code de commerce, article L441-9", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038414397", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Entreprendre Service Public", titre: "Mentions obligatoires sur une facture (mandatory invoice mentions, checked 11 August 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F31808", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Documents commerciaux d'une micro-entreprise (a micro-business's commercial documents)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Délais de paiement entre professionnels et pénalités de retard (B2B payment terms and late penalties, checked 7 August 2026)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23211", lu: "27 October 2026" },
    { editeur: "Entreprendre Service Public", titre: "Franchise en base de TVA (VAT exemption below the threshold)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F21746", lu: "27 October 2026" },
    { editeur: "economie.gouv.fr", titre: "Mentions obligatoires d'une facture : tout savoir (invoice mentions explained)", url: "https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir", lu: "27 October 2026" },
    { editeur: "impots.gouv.fr", titre: "À partir de quand suis-je concerné par la réforme de la facturation électronique ? (e-invoicing timetable)", url: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation", lu: "27 October 2026" },
    { editeur: "impots.gouv.fr", titre: "Est-ce qu'une facture envoyée par mail est une facture électronique ? (is an emailed invoice an e-invoice?)", url: "https://www.impots.gouv.fr/professionnel/questions/est-ce-quune-facture-envoyee-par-mail-est-une-facture-electronique", lu: "27 October 2026" },
    { editeur: "BOFiP-Impôts", titre: "BOI-RES-TVA-000253, transitional rules for moving VAT into the code des impositions sur les biens et services (7 October 2026)", url: "https://bofip.impots.gouv.fr/bofip/14901-PGP.html/identifiant=BOI-RES-TVA-000253-20261007", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Code de commerce, article L441-9 (French Commercial Code)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038414397", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de facture PDF 75tools",
    motsCles: "créer une facture en ligne, facture auto entrepreneur gratuite, générateur de facture gratuit, modèle de facture pdf, mentions obligatoires facture",
  },
  en: {
    nomAppli: "75tools French invoice generator",
    motsCles: "invoice generator france, french invoice template, micro-entrepreneur invoice, auto-entrepreneur invoice english, french invoice mandatory mentions",
  },
};

const GenerateurFacture = ({ lang = "fr" }: { lang?: Langue }) => (
  <PageOutil
    id="generateur-facture"
    lang={lang}
    motsCles={T[lang].motsCles}
    nomAppli={T[lang].nomAppli}
    categorieAppli="BusinessApplication"
    faq={FAQ[lang]}
    sources={SOURCES[lang]}
    outil={<FactureDevisEditeur type="facture" exemple={EXEMPLE} />}
  >
    {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
  </PageOutil>
);

const ContenuFr = () => (
  <>
    <Section titre="Créer une facture en ligne gratuite, en trois minutes">
      <p>
        Pour créer une facture en ligne gratuite, choisissez votre statut (micro-entrepreneur, entrepreneur
        individuel ou société), remplissez votre nom, votre SIREN et votre adresse, puis le client et les lignes :
        le total s'affiche à droite à chaque saisie et l'aperçu montre la facture telle qu'elle sera imprimée. Un
        clic sur « Télécharger la facture PDF » produit un fichier A4 prêt à envoyer. Avec l'exemple prérempli, un
        logo à 850 € et trois heures à 55 € donnent 1 015 € net à payer pour une micro-entrepreneuse en franchise ;
        le même travail facturé par une société à 20 % ferait 1 218 € TTC. Les mentions obligatoires (numéro
        chronologique, échéance, pénalités de retard, indemnité de 40 € pour un client professionnel, « TVA non
        applicable, art. 293 B du CGI ») s'ajoutent seules. La limite : ce PDF n'est pas une facture électronique ;
        il reste valable jusqu'au 31 août 2027 pour une PME ou une micro-entreprise.
      </p>
    </Section>

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
          art. 293 B du CGI ». Elle vaut pour toute entreprise sous les seuils, société comprise. Sans la mention,
          Service Public rappelle qu'un contrôle fiscal peut aboutir à un redressement.
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
        La réforme entre en vigueur en deux temps. Depuis le 1er septembre 2026, toutes les entreprises,
        micro-entreprises comprises, doivent pouvoir <strong>recevoir</strong> des factures électroniques, et les
        grandes entreprises et les ETI doivent aussi les <strong>émettre</strong> et transmettre leurs données à
        l'administration. À partir du 1er septembre 2027, l'émission électronique et la transmission des données
        deviennent obligatoires pour les PME et les micro-entreprises, franchisés en base de TVA compris.
      </p>
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
        total HT plus ces montants de TVA. Les taux proposés sont 20 %, 10 %, 5,5 %, 2,1 % et 0 %. Pour vérifier un
        prix isolé, le <Link to="/calcul-ht-ttc/">calcul HT TTC</Link> fait la conversion dans les deux sens.
      </p>
      <p>
        <strong>4. PDF.</strong> Le document est mis en page au format A4 ; si les lignes ne tiennent pas sur une
        page, le tableau continue sur la suivante avec ses en-têtes, et chaque page est numérotée. Pour un devis
        avant travaux, utilisez le <Link to="/generateur-devis/">générateur de devis</Link> : il ajoute la durée de
        validité et le bon pour accord.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="An invoice generator for France, ready in three minutes">
      <p>
        This invoice generator for France works in three steps: pick your status (micro-entrepreneur, sole trader
        known as EI, or company), enter your name, SIREN number and address, then the client and the lines. The
        total on the right updates as you type, and the preview shows the invoice exactly as it will print. Click
        "Download the invoice PDF" to get an A4 file ready to send. With the prefilled example, a logo at €850 plus
        three hours at €55 comes to €1,015 due for a micro-entrepreneur under the VAT exemption; the same work billed
        by a company at 20% VAT would be €1,218 including VAT. The French mandatory mentions are added for you:
        sequential number, due date, late-payment penalties, the €40 recovery fee for business clients and « TVA non
        applicable, art. 293 B du CGI ». The invoice itself stays in French, as French law requires. The main limit:
        this PDF is not an e-invoice, and it remains valid only until 31 August 2027 for a small business.
      </p>
    </Section>

    <Section titre="The French mentions the generator writes for you">
      <p>
        A French invoice (facture) must carry a fixed set of mentions, whether the client is a private individual or
        a business: issue date, a <strong>unique number</strong> from a chronological, unbroken sequence, the date
        of the sale or the end of the service, the identity of both parties, the client's purchase order number if
        there is one, each line in detail (quantity, precise description, unit price before VAT, VAT rate), totals
        before and after VAT, the payment date, early-payment discount terms, the late-payment penalty rate and, for
        a business client, the fixed €40 compensation for recovery costs.
      </p>
      <p>
        The tool adapts the document to your status. As a <strong>micro-entrepreneur or sole trader</strong>, your
        name is followed by « EI », which article R526-27 of the French Commercial Code requires on business
        documents. A <strong>company</strong> shows its name, legal form (SARL, SAS…), share capital and its trade
        register entry followed by the SIREN, for example « RCS Lyon 123 456 789 ».
      </p>
      <p>
        Under the <strong>franchise en base de TVA</strong>, the VAT exemption for businesses whose turnover stays
        below the thresholds (€85,000 for sales, €37,500 for services in 2026), prices carry no VAT and the invoice
        must say « TVA non applicable, art. 293 B du CGI ». It applies to any business under the thresholds,
        companies included. With <strong>reverse charge</strong> (autoliquidation), the business client accounts
        for the VAT and the invoice says « Autoliquidation ». Craft trades such as plumbers or builders also list
        their professional insurance: insurer and geographical cover.
      </p>
      <p>
        Late-payment penalties are due without any reminder. The default rate, 12.40%, is the European Central Bank
        refinancing rate on 1 July 2026 (2.40%) plus 10 points; it may not be lower than three times the French
        legal interest rate. When there is no early-payment discount, the invoice still has to say so: an empty field
        prints « Escompte pour paiement anticipé : néant ». The EU VAT number is not required on an invoice of €150
        or less before VAT. Missing mentions can cost up to €75,000 for an individual and €375,000 for a company
        under article L441-9 of the Commercial Code.
      </p>
    </Section>

    <Section titre="French e-invoicing: where things stand on 27 October 2026">
      <p>
        The reform arrives in two stages, according to impots.gouv.fr, the French tax office website. Since 1
        September 2026, every business, micro-entrepreneurs included, must be able to <strong>receive</strong>{" "}
        e-invoices, and large companies and mid-sized firms must also <strong>issue</strong> them and report their
        data. From 1 September 2027, issuing e-invoices and reporting data become compulsory for small businesses
        and micro-entrepreneurs, including those under the VAT exemption.
      </p>
      <p>
        Four new mentions come with the reform, on the same date as e-invoicing for your category: the business
        client's SIREN, the delivery address when it differs, the type of transactions (goods, services or both) and,
        where relevant, « Option pour le paiement de la taxe d'après les débits ». The generator already prints them,
        so your template is ready. A PDF sent by email is not an e-invoice in the sense of the reform; it stays valid
        until your own start date. Sales to private clients will not need e-invoices: you will report transaction
        data to the tax office instead (e-reporting), on the same timetable.
      </p>
      <p>
        From 1 January 2027, French VAT rules move from the code général des impôts (CGI) to a new code, the code des
        impositions sur les biens et services. The BOFiP guidance of 7 October 2026 says invoices may keep referring
        to the CGI until 30 June 2028, so « art. 293 B du CGI » can still be used.
      </p>
    </Section>

    <Section titre="How to use it and how totals are calculated">
      <p>
        Each line is rounded to the cent: quantity × unit price before VAT, minus any discount. The total before VAT
        is the sum of the lines. VAT is calculated <em>per rate</em> on the combined base of all lines at that rate,
        then rounded; the total including VAT is the total before VAT plus those amounts. The rates offered are 20%,
        10%, 5.5%, 2.1% and 0%. To check a single price, the <Link to="/en/vat-calculator/">French VAT
        calculator</Link> converts both ways.
      </p>
      <p>
        After each download the number used is remembered in your browser, and "Next invoice" proposes the following
        one (F-2026-007 becomes F-2026-008), clears the client and lines and keeps your details. Write line
        descriptions and payment terms in French, since they appear on the invoice as typed. For a price estimate
        before the work starts, use the <Link to="/en/quote-generator/">French quote (devis) generator</Link>,
        which adds a validity date and a box for the client's signature.
      </p>
    </Section>
  </>
);

export default GenerateurFacture;
