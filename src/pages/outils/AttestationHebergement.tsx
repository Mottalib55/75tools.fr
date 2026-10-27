import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect } from "@/components/outils/PageOutil";
import { Section, Champ, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import {
  LettreFeuille,
  ActionsLettre,
  dateLongue,
  useDateDuJour,
  useTexteRetouchable,
} from "@/components/outils/LettreFeuille";
import type { Langue } from "@/lib/langue";

type Genre = "f" | "m";

interface Personne {
  genre: Genre;
  nom: string;
  naissance: string; // ISO
  lieuNaissance: string;
}

interface Donnees {
  hebergeant: Personne;
  heberge: Personne;
  depuis: string; // ISO
  adresse: string;
  complement: string;
  codePostal: string;
  commune: string;
  lieu: string;
  date: string;
}

const PERSONNE_VIDE: Personne = { genre: "f", nom: "", naissance: "", lieuNaissance: "" };

const VIDE: Donnees = {
  hebergeant: PERSONNE_VIDE,
  heberge: { ...PERSONNE_VIDE, genre: "m" },
  depuis: "",
  adresse: "",
  complement: "",
  codePostal: "",
  commune: "",
  lieu: "",
  date: "",
};

const e = (g: Genre) => (g === "f" ? "e" : "");
const val = (s: string, repli: string) => s.trim() || repli;

/** Repères entre crochets (à remplacer) dans la langue de l'interface ; l'attestation reste en français. */
const REPLIS = {
  fr: {
    hebergeant: "[prénom et nom de la personne qui héberge]",
    heberge: "[prénom et nom de la personne hébergée]",
    naissance: "[date de naissance]",
    lieuNaissance: "[lieu de naissance]",
    depuis: "[date de début de l'hébergement]",
    adresse: "[adresse du logement]",
    lieu: "[lieu]",
    date: "[date]",
  },
  en: {
    hebergeant: "[host's full name]",
    heberge: "[guest's full name]",
    naissance: "[date of birth]",
    lieuNaissance: "[place of birth]",
    depuis: "[date the stay started]",
    adresse: "[address of the home]",
    lieu: "[town]",
    date: "[date]",
  },
};

function texteAttestation(d: Donnees, lang: Langue): string {
  const r = REPLIS[lang];
  const h = d.hebergeant;
  const b = d.heberge;
  const adresse = [d.adresse, d.complement, [d.codePostal, d.commune].filter((x) => x.trim()).join(" ")]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");
  return (
    `Je soussigné${e(h.genre)} ${val(h.nom, r.hebergeant)}, ` +
    `né${e(h.genre)} le ${dateLongue(h.naissance) || r.naissance} à ${val(h.lieuNaissance, r.lieuNaissance)}, ` +
    `déclare sur l'honneur héberger à mon domicile ${val(b.nom, r.heberge)}, ` +
    `né${e(b.genre)} le ${dateLongue(b.naissance) || r.naissance} à ${val(b.lieuNaissance, r.lieuNaissance)}, ` +
    `depuis le ${dateLongue(d.depuis) || r.depuis}, à l'adresse suivante : ${adresse || r.adresse}.` +
    `\n\nJe joins à la présente attestation la copie de ma pièce d'identité et un justificatif de domicile à mon nom.`
  );
}

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "J'héberge mon fils majeur, quelles pièces lui donner pour sa carte d'identité ?",
      r: "Pour une carte d'identité ou un passeport, Service Public demande trois documents quand le demandeur habite chez un proche : la photocopie de la pièce d'identité de l'hébergeant, l'attestation d'hébergement originale, datée et signée, indiquant qu'il habite chez vous de manière stable ou depuis plus de trois mois, et un justificatif de domicile original de moins d'un an à votre nom. Aucun autre document ne doit être exigé.",
    },
    {
      q: "L'attestation d'hébergement doit-elle être manuscrite ?",
      r: "Non. Service Public propose lui-même un modèle à compléter en ligne, à imprimer puis à signer : seule la signature doit être faite à la main. Vous pouvez donc remplir ce modèle, l'imprimer et signer en bas. Gardez une copie signée : certains organismes conservent l'original, et une seconde démarche peut vous en redemander un.",
    },
    {
      q: "Quelle différence avec l'attestation d'accueil pour un visiteur étranger ?",
      r: "L'attestation d'hébergement justifie qu'une personne habite chez vous, pour ses démarches en France. L'attestation d'accueil est un formulaire officiel (Cerfa 10798) qu'une personne résidant en France demande à la mairie pour recevoir un étranger venu pour un court séjour, et qui sert à sa demande de visa. Service Public met en garde contre la confusion entre les deux.",
    },
    {
      q: "Est-ce que j'engage ma responsabilité en signant l'attestation ?",
      r: "Oui, sur l'exactitude de ce que vous déclarez. L'article 441-7 du Code pénal punit d'un an d'emprisonnement et de 15 000 euros d'amende le fait d'établir une attestation faisant état de faits matériellement inexacts, ou d'en faire usage. La peine monte à trois ans et 45 000 euros quand l'attestation vise notamment à obtenir un titre de séjour.",
    },
    {
      q: "La personne que j'héberge demande une carte de séjour : que dois-je lui fournir ?",
      r: "Selon Service Public, trois pièces : votre attestation d'hébergement datée et signée, la copie de votre carte d'identité ou de votre carte de séjour, et un justificatif de domicile à votre nom (facture d'énergie, de téléphone fixe ou d'internet, bail, acte de propriété) si l'adresse de votre pièce d'identité n'est plus à jour. Pour une carte de séjour, ce justificatif doit dater de moins de 6 mois.",
    },
    {
      q: "Mon attestation d'hébergement a un an, puis-je la réutiliser pour une nouvelle démarche ?",
      r: "Mieux vaut en établir une nouvelle. Le texte ne fixe pas de durée de validité, mais les justificatifs qui l'accompagnent en ont une : moins d'un an pour une carte d'identité ou un passeport, moins de 6 mois pour une carte de séjour. Une attestation datée du jour, avec la date réelle d'arrivée de la personne hébergée, évite un refus au guichet et prouve que la situation est toujours d'actualité.",
    },
  ],
  en: [
    {
      q: "Which documents go with a proof of accommodation for a French residence permit?",
      r: "Service Public lists three for a carte de séjour (residence permit): the attestation d'hébergement dated and signed by your host, a copy of the host's ID card or residence permit, and proof of address in the host's name, such as an energy, landline or internet bill, a lease or a title deed, if the address on the host's ID is out of date. That proof must be less than 6 months old.",
    },
    {
      q: "Can I write the attestation d'hébergement in English?",
      r: "No, keep it in French: it is read by a French prefecture, town hall or office, and the wording here follows the Service Public model. The form on this page is in English, but the attestation it produces stays in French. It does not need to be handwritten; only the signature must be done by hand, after printing. Keep a signed copy, because the original is often kept by the office.",
    },
    {
      q: "My adult son lives with me: what does he need for a French ID card or passport?",
      r: "Three documents, according to Service Public: a photocopy of your ID, the original attestation, dated and signed, stating that he has lived with you in a stable way or for more than three months, and an original proof of address in your name that is less than one year old. The page adds that no other document should be required by the town hall.",
    },
    {
      q: "Is this the same as the attestation d'accueil for a visitor's visa?",
      r: "No. The attestation d'hébergement proves that someone already lives with you, for their own procedures in France. The attestation d'accueil (form Cerfa 10798) is requested from the town hall by a resident of France who will host a foreign visitor for a short stay, and it supports the visitor's visa application. Service Public warns against confusing the two documents.",
    },
    {
      q: "What do I risk if the attestation is not true?",
      r: "Article 441-7 of the French Code pénal punishes making or using a certificate that states materially false facts with one year in prison and a 15,000 euro fine. It rises to three years and 45,000 euros when the aim is, among other things, to obtain a residence permit. The person who uses the false attestation faces the same penalties as the person who signed it.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service Public", titre: "Modèle de lettre : attestation d'hébergement (vérifié le 26 juin 2024)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHebergement", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Attestation d'hébergement (vérifié le 11 mai 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R39697", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Demande de carte d'identité ou de passeport : quel justificatif de domicile présenter ? (vérifié le 28 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14807", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Demande de carte de séjour : quel justificatif de domicile ? (vérifié le 5 août 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33052", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Code pénal, article 441-7", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service Public", titre: "Modèle de lettre : attestation d'hébergement (official model letter)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHebergement", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Attestation d'hébergement (proof of accommodation)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R39697", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Carte d'identité ou passeport : quel justificatif de domicile ? (proof of address for an ID card or passport)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14807", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Demande de carte de séjour : quel justificatif de domicile ? (proof of address for a residence permit)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33052", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Code pénal, article 441-7 (false certificates)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur d'attestation d'hébergement 75tools",
    motsCles: "attestation d'hébergement, modèle attestation d'hébergement, attestation hébergement gratuit, attestation d'hébergement pdf, justificatif de domicile hébergé",
    formulaire: "Informations de l'attestation",
    hebergeant: "Personne qui héberge",
    heberge: "Personne hébergée",
    nom: "Prénom et nom",
    accord: "Accord (soussigné, né)",
    feminin: "Féminin (née)",
    masculin: "Masculin (né)",
    naissance: "Date de naissance",
    lieuNaissance: "Lieu de naissance",
    lieuEx: "Casablanca (Maroc)",
    logement: "Logement",
    adresse: "Adresse",
    complement: "Complément (facultatif)",
    complementEx: "Bâtiment B, 3e étage",
    codePostal: "Code postal",
    commune: "Commune",
    depuis: "Hébergement depuis le",
    signature: "Signature",
    faitA: "Fait à",
    le: "Le",
    voir: "Voir l'attestation",
    francais: "",
    libelleTexte: "Texte de l'attestation d'hébergement",
    nomDocument: "l'attestation",
  },
  en: {
    nomAppli: "75tools proof of accommodation generator (attestation d'hébergement)",
    motsCles: "proof of accommodation france, attestation d'hébergement, attestation d'hébergement english, proof of address france host, hébergement letter",
    formulaire: "Attestation details",
    hebergeant: "Host (the person who provides the home)",
    heberge: "Guest (the person who lives there)",
    nom: "First and last name",
    accord: "Grammar (né / née)",
    feminin: "Female (née)",
    masculin: "Male (né)",
    naissance: "Date of birth",
    lieuNaissance: "Place of birth",
    lieuEx: "Leeds (Royaume-Uni)",
    logement: "Home",
    adresse: "Street address",
    complement: "Address line 2 (optional)",
    complementEx: "Bâtiment B, 3e étage",
    codePostal: "Postcode",
    commune: "Town",
    depuis: "Living there since",
    signature: "Signing",
    faitA: "Signed in (town)",
    le: "On",
    voir: "See the attestation",
    francais: "The attestation is written in French, as French offices expect. Write the place of birth as in your passport, with the country in French if you can.",
    libelleTexte: "Text of the attestation (in French)",
    nomDocument: "the attestation",
  },
};

type Textes = (typeof T)["fr"];

const BlocPersonne = ({ titre, p, onChange, t }: { titre: string; p: Personne; onChange: (p: Personne) => void; t: Textes }) => (
  <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
    <legend className="text-white font-medium mb-2">{titre}</legend>
    <Champ label={t.nom} value={p.nom} onChange={(v) => onChange({ ...p, nom: v })} />
    <label className="block min-w-0">
      <span className="block text-sm text-neutral-300 mb-1">{t.accord}</span>
      <select className={classeSelect} value={p.genre} onChange={(ev) => onChange({ ...p, genre: ev.target.value as Genre })}>
        <option value="f">{t.feminin}</option>
        <option value="m">{t.masculin}</option>
      </select>
    </label>
    <label className="block min-w-0">
      <span className="block text-sm text-neutral-300 mb-1">{t.naissance}</span>
      <input type="date" className={classeChamp} value={p.naissance} onChange={(ev) => onChange({ ...p, naissance: ev.target.value })} />
    </label>
    <Champ label={t.lieuNaissance} value={p.lieuNaissance} onChange={(v) => onChange({ ...p, lieuNaissance: v })} placeholder={t.lieuEx} />
  </fieldset>
);

const AttestationHebergement = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const r = REPLIS[lang];
  const [d, setD] = useState<Donnees>(VIDE);
  const maj = <K extends keyof Donnees>(k: K) => (v: Donnees[K]) => setD((x) => ({ ...x, [k]: v }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));
  const genere = useMemo(() => texteAttestation(d, lang), [d, lang]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const faitA = `Fait à ${d.lieu.trim() || r.lieu}, le ${dateLongue(d.date) || r.date}`;
  const signataire = d.hebergeant.nom.trim() || r.hebergeant;
  const texteComplet = ["ATTESTATION D'HÉBERGEMENT", texte, faitA, `Signature : ${signataire}`].join("\n\n");

  const outil = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
      <form className="space-y-4 min-w-0 print:hidden" onSubmit={(ev) => ev.preventDefault()} aria-label={t.formulaire}>
        <BlocPersonne titre={t.hebergeant} p={d.hebergeant} onChange={maj("hebergeant")} t={t} />
        {lang === "en" && <p className="text-sm text-amber-200/90">{t.francais}</p>}
        <a href="#attestation-hebergement" className="lg:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
          {t.voir}
        </a>
        <BlocPersonne titre={t.heberge} p={d.heberge} onChange={maj("heberge")} t={t} />
        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
          <legend className="text-white font-medium mb-2">{t.logement}</legend>
          <Champ label={t.adresse} value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
          <Champ label={t.complement} value={d.complement} onChange={maj("complement")} placeholder={t.complementEx} />
          <Champ label={t.codePostal} value={d.codePostal} onChange={maj("codePostal")} autoComplete="postal-code" />
          <Champ label={t.commune} value={d.commune} onChange={maj("commune")} />
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.depuis}</span>
            <input type="date" className={classeChamp} value={d.depuis} onChange={(ev) => maj("depuis")(ev.target.value)} />
          </label>
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
          <legend className="text-white font-medium mb-2">{t.signature}</legend>
          <Champ label={t.faitA} value={d.lieu} onChange={maj("lieu")} />
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.le}</span>
            <input type="date" className={classeChamp} value={d.date} onChange={(ev) => maj("date")(ev.target.value)} />
          </label>
        </fieldset>
      </form>

      <div data-resultat className="space-y-4 min-w-0 lg:sticky lg:top-4">
        <LettreFeuille
          id="attestation-hebergement"
          titre="Attestation d'hébergement"
          libelleTexte={t.libelleTexte}
          texte={texte}
          onTexte={modifier}
          bas={
            <>
              <p className="mt-8">{faitA}</p>
              <div className="mt-6 ml-auto w-full sm:w-1/2 min-h-[7rem]">
                <p>Signature</p>
                <p className="mt-16 print:mt-20">{signataire}</p>
              </div>
            </>
          }
        />
        <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} nomDocument={t.nomDocument} />
      </div>
    </div>
  );

  return (
    <PageOutil id="attestation-hebergement" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Attestation d'hébergement : le modèle gratuit, pas à pas">
      <p>
        Pour faire une attestation d'hébergement gratuite, remplissez l'identité de la personne qui héberge et celle de
        la personne hébergée (nom, date et lieu de naissance), l'adresse du logement et la date d'arrivée : le texte se
        rédige à côté selon la formule du modèle de Service Public, « Je soussigné… déclare sur l'honneur héberger à mon
        domicile… », avec le lieu, la date et la place de la signature. Imprimez-le ou enregistrez-le en PDF, signez à
        la main, puis joignez deux pièces : la copie de la pièce d'identité de l'hébergeant et un justificatif de
        domicile à son nom. Pour une carte d'identité, ce justificatif doit dater de moins d'un an et l'hébergement être
        stable ou durer depuis plus de trois mois ; pour une carte de séjour, il doit dater de moins de 6 mois. La
        limite : l'attestation ne vaut que si elle est exacte, et chaque démarche peut avoir sa propre liste de pièces.
      </p>
    </Section>

    <Section titre="Les pièces à joindre selon la démarche">
      <p>
        L'attestation seule ne suffit presque jamais : elle prouve ce que vous déclarez, les pièces jointes prouvent qui
        vous êtes et que vous habitez bien à cette adresse. Pour une carte d'identité ou un passeport, Service Public
        demande la photocopie de la pièce d'identité de l'hébergeant, l'attestation originale, datée et signée, et un
        justificatif de domicile original de moins d'un an au nom de l'hébergeant, en précisant qu'aucun autre document
        ne doit être exigé.
      </p>
      <p>
        Pour une carte de séjour, la liste est proche : attestation datée et signée, copie de la carte d'identité ou de
        la carte de séjour de l'hébergeant, et justificatif de domicile à son nom (facture d'énergie, de téléphone fixe
        ou d'internet, bail, acte de propriété) si l'adresse de sa pièce d'identité n'est plus à jour. Pour la carte
        grise ou le permis de conduire, Service Public renvoie à des fiches propres à chaque démarche : lisez celle de
        votre démarche avant de déposer le dossier. La CAF ou d'autres organismes peuvent aussi demander une
        attestation pour établir votre adresse : suivez alors la liste de pièces qu'ils indiquent.
      </p>
    </Section>

    <Section titre="Quand l'attestation d'hébergement est demandée">
      <p>
        Elle sert à toute personne qui doit justifier d'un domicile sans avoir de facture ni de bail à son nom : un
        jeune adulte qui vit chez ses parents, une personne hébergée par un ami après une séparation, un étudiant logé
        chez un proche, un ressortissant étranger arrivé chez de la famille. Indiquez la date réelle d'arrivée : pour
        une carte d'identité, l'administration attend un hébergement stable ou de plus de trois mois. Si un organisme
        demande une précision supplémentaire, ajoutez-la directement dans le texte de l'aperçu, qui reste modifiable.
      </p>
    </Section>

    <Section titre="Ce que vous risquez avec une fausse attestation">
      <p>
        Héberger quelqu'un « sur le papier » pour lui rendre service n'a rien d'anodin. L'article 441-7 du Code pénal
        punit d'un an d'emprisonnement et de 15 000 euros d'amende le fait d'établir une attestation qui fait état de
        faits matériellement inexacts, de falsifier une attestation exacte, ou d'utiliser une attestation inexacte ou
        falsifiée. Les peines passent à trois ans et 45 000 euros quand l'infraction vise à porter préjudice au Trésor
        public ou au patrimoine d'autrui, ou à obtenir un titre de séjour.
      </p>
      <p>
        La personne hébergée qui produit l'attestation peut donc être poursuivie au même titre que celle qui l'a
        signée. Si la situation change, ne réutilisez pas une ancienne attestation : établissez-en une nouvelle à la
        bonne date, ou aucune. Pour une déclaration d'un autre type, le générateur d'
        <Link to="/attestation-sur-l-honneur/">attestation sur l'honneur</Link> propose un texte libre, et pour
        mettre fin à un contrat lors d'un déménagement, la <Link to="/lettre-de-resiliation/">lettre de résiliation</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Proof of accommodation letter: how to fill it in">
      <p>
        A proof of accommodation letter, called an attestation d'hébergement in France, is a short statement signed by
        the person you live with to say that you live at their address. To make one here, fill in the host's and the
        guest's names, dates and places of birth, the address of the home and the date the stay started: the French text
        is written next to the form, following the Service Public model (« Je soussigné… déclare sur l'honneur héberger
        à mon domicile… »), with the place, the date and room for the signature. Print it or save it as a PDF, have the
        host sign it by hand, then attach a copy of the host's ID and a proof of address in the host's name. For a
        residence permit, that proof must be less than 6 months old; for a French ID card, less than one year. The limit
        is that each office keeps its own list of documents, so check it before you file.
      </p>
    </Section>

    <Section titre="When you need one in France">
      <p>
        Newcomers often live with family, a partner or a friend before having a lease or bills in their own name.
        French offices still ask for a justificatif de domicile (proof of address), and the attestation d'hébergement
        is how a host lends you theirs. The prefecture asks for it with a first carte de séjour (residence permit) or a
        renewal, the town hall with a French ID card or passport, the ANTS with a carte grise (vehicle registration)
        or a driving licence, and the CAF (family benefits office) or a bank may ask for it to record your address.
      </p>
      <p>
        For a residence permit, Service Public lists three documents when you are hosted by a private person: this
        attestation, dated and signed; a copy of the host's ID card or residence permit; and a proof of address in the
        host's name, such as an energy, landline or internet bill, a lease or a title deed, if the address on the host's
        ID is out of date. Give the real date you moved in: for an ID card, the office expects a stable stay or one that
        has lasted more than three months.
      </p>
    </Section>

    <Section titre="Why it stays in French, and what the host signs">
      <p>
        The tool writes the attestation in French because it is read by French staff and follows the official wording.
        « Je soussigné » means "I, the undersigned"; « déclare sur l'honneur » means "declare on my honour"; « Fait à…,
        le… » is the place and date of signing. The grammar changes with the signer: « soussignée, née » for a woman,
        « soussigné, né » for a man, which is why the form asks for it.
      </p>
      <p>
        By signing, the host vouches for the facts. Under article 441-7 of the French Code pénal, a false certificate
        can lead to one year in prison and a 15,000 euro fine, or three years and 45,000 euros when it is used to obtain
        a residence permit. If you also need a general statement, use the{" "}
        <Link to="/en/sworn-statement/">sworn statement template</Link>; to end a contract when you move, the{" "}
        <Link to="/en/cancellation-letter/">French cancellation letter</Link>.
      </p>
    </Section>
  </>
);

export default AttestationHebergement;
