import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Champ, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import {
  LettreFeuille,
  ActionsLettre,
  dateLongue,
  useDateDuJour,
  useTexteRetouchable,
} from "@/components/outils/LettreFeuille";
import { locale, type Langue } from "@/lib/langue";

type Objet = "libre" | "concubinage" | "celibat" | "diplome";
type Genre = "f" | "m";

const OBJETS: { id: Objet; nom: Record<Langue, string>; aide: Record<Langue, string> }[] = [
  {
    id: "libre",
    nom: { fr: "Texte libre", en: "Free text" },
    aide: {
      fr: "Écrivez les faits que vous attestez, de façon précise et datée. C'est la forme du modèle général de Service Public.",
      en: "Write the facts you are stating, precisely and with dates, in French. This follows the general Service Public model.",
    },
  },
  {
    id: "concubinage",
    nom: { fr: "Vie commune (concubinage)", en: "Living together (concubinage)" },
    aide: {
      fr: "Quand la mairie ne délivre pas de certificat de vie commune, Service Public indique de présenter une déclaration sur l'honneur signée par les deux concubins.",
      en: "When the town hall does not issue a certificat de vie commune (cohabitation certificate), Service Public says to give a sworn statement signed by both partners.",
    },
  },
  {
    id: "celibat",
    nom: { fr: "Célibat, pour un mariage en France", en: "Single status, to marry in France" },
    aide: {
      fr: "Pour un futur époux étranger dont le pays ne délivre pas de certificat de coutume, et seulement à défaut d'attestation des autorités puis d'un avocat ou juriste, Service Public demande une attestation sur l'honneur déclarant être majeur, célibataire et juridiquement capable. Renseignez-vous auprès de la mairie du mariage.",
      en: "For a foreign spouse-to-be whose country does not issue a certificat de coutume (certificate of custom law), and only when neither the authorities nor a lawyer can provide a statement, Service Public asks for a sworn statement of being an adult, single and legally capable. Ask the town hall where you marry.",
    },
  },
  {
    id: "diplome",
    nom: { fr: "Perte d'un diplôme (demande de duplicata)", en: "Lost diploma (request for a duplicate)" },
    aide: {
      fr: "Pour un diplôme de l'enseignement supérieur perdu, Service Public cite la déclaration sur l'honneur parmi les justificatifs acceptés par l'établissement qui l'a délivré, avec le dépôt de plainte ou la déclaration de sinistre.",
      en: "For a lost French university diploma, Service Public lists a sworn statement among the proofs the issuing institution accepts, with a police report or an insurance claim.",
    },
  },
];

interface Donnees {
  objet: Objet;
  genre: Genre;
  nom: string;
  naissance: string;
  lieuNaissance: string;
  adresse: string;
  codePostalCommune: string;
  faits: string;
  // concubinage
  genre2: Genre;
  nom2: string;
  naissance2: string;
  lieuNaissance2: string;
  depuis: string;
  // diplôme
  diplome: string;
  etablissement: string;
  annee: string;
  lieu: string;
  date: string;
}

const VIDE: Donnees = {
  objet: "libre",
  genre: "f",
  nom: "",
  naissance: "",
  lieuNaissance: "",
  adresse: "",
  codePostalCommune: "",
  faits: "",
  genre2: "m",
  nom2: "",
  naissance2: "",
  lieuNaissance2: "",
  depuis: "",
  diplome: "",
  etablissement: "",
  annee: "",
  lieu: "",
  date: "",
};

/** Repères entre crochets dans la langue de l'interface ; l'attestation reste en français. */
const REPLIS = {
  fr: {
    nom: "[prénom et nom]",
    adresse: "[adresse]",
    depuis: "[date du début de la vie commune]",
    diplome: "[intitulé exact du diplôme]",
    etablissement: "[établissement]",
    annee: "[année d'obtention]",
    faits: "[décrivez les faits que vous attestez]",
    lieu: "[lieu]",
    date: "[date]",
  },
  en: {
    nom: "[full name]",
    adresse: "[address]",
    depuis: "[date you started living together]",
    diplome: "[exact title of the diploma, in French]",
    etablissement: "[institution]",
    annee: "[year awarded]",
    faits: "[describe the facts, in French]",
    lieu: "[town]",
    date: "[date]",
  },
};

const e = (g: Genre) => (g === "f" ? "e" : "");
const v = (s: string, repli: string) => s.trim() || repli;

function identite(g: Genre, nom: string, naissance: string, lieu: string, repliNom: string) {
  const n = dateLongue(naissance);
  const morceaux = [v(nom, repliNom)];
  if (n || lieu.trim()) morceaux.push(`né${e(g)}${n ? ` le ${n}` : ""}${lieu.trim() ? ` à ${lieu.trim()}` : ""}`);
  return morceaux.join(", ");
}

function texteAttestation(d: Donnees, lang: Langue): string {
  const r = REPLIS[lang];
  const adresse = [d.adresse, d.codePostalCommune].map((x) => x.trim()).filter(Boolean).join(", ") || r.adresse;
  const moi = `Je soussigné${e(d.genre)} ${identite(d.genre, d.nom, d.naissance, d.lieuNaissance, r.nom)}, demeurant ${adresse},`;
  const fin = "\n\nFait pour servir et valoir ce que de droit.";
  switch (d.objet) {
    case "concubinage": {
      const un = identite(d.genre, d.nom, d.naissance, d.lieuNaissance, r.nom);
      return (
        `Nous soussignés ${un}${un.includes(", né") ? "," : ""} et ${identite(d.genre2, d.nom2, d.naissance2, d.lieuNaissance2, r.nom)}, ` +
        `attestons sur l'honneur vivre en concubinage (union libre) et résider ensemble à l'adresse suivante : ${adresse}, ` +
        `depuis le ${dateLongue(d.depuis) || r.depuis}.` +
        fin
      );
    }
    case "celibat":
      return `${moi} atteste sur l'honneur être majeur${e(d.genre)}, célibataire et juridiquement capable de contracter mariage.${fin}`;
    case "diplome":
      return (
        `${moi} atteste sur l'honneur avoir perdu l'original de mon diplôme ${v(d.diplome, r.diplome)}, ` +
        `délivré par ${v(d.etablissement, r.etablissement)} ${d.annee.trim() ? `en ${d.annee.trim()}` : r.annee}, ` +
        `et sollicite à ce titre la délivrance d'un duplicata.${fin}`
      );
    default:
      return `${moi} atteste sur l'honneur que ${v(d.faits, r.faits)}${fin}`;
  }
}

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Une attestation sur l'honneur tapée à l'ordinateur a-t-elle la même valeur qu'une manuscrite ?",
      r: "Oui, dans la plupart des démarches. Service Public publie lui-même un modèle d'attestation sur l'honneur à remplir en ligne, à télécharger en PDF puis à imprimer et signer. Ce qui engage, c'est votre signature manuscrite en bas du document et l'exactitude des faits. Un organisme peut toutefois imposer son propre formulaire : utilisez-le alors à la place d'un texte libre.",
    },
    {
      q: "Nous vivons en couple sans être mariés, qui doit signer la déclaration de vie commune ?",
      r: "Les deux. Service Public précise qu'en l'absence de certificat délivré par la mairie, il faut présenter aux organismes une déclaration sur l'honneur signée par les deux concubins. Le modèle « Vie commune » de cette page prévoit donc deux blocs de signature. Le certificat de mairie, quand la commune accepte de le délivrer, est gratuit, mais elle n'est pas obligée de le faire.",
    },
    {
      q: "Puis-je joindre mon attestation sur l'honneur à un dossier envoyé par e-mail ?",
      r: "Si l'organisme accepte les envois numériques, imprimez l'attestation, signez-la, puis scannez-la ou photographiez-la à plat, en entier et lisible. Vous pouvez aussi enregistrer la page en PDF, l'imprimer pour la signer et la numériser ensuite. Conservez l'original signé : il peut vous être demandé plus tard, par exemple lors d'un contrôle.",
    },
    {
      q: "Quelle peine pour une attestation sur l'honneur mensongère ?",
      r: "L'article 441-7 du Code pénal prévoit un an d'emprisonnement et 15 000 euros d'amende pour qui établit une attestation contenant des faits matériellement inexacts, la falsifie ou l'utilise. C'est trois ans et 45 000 euros si le but est de porter préjudice au Trésor public ou au patrimoine d'autrui, ou d'obtenir un titre de séjour. Une simple erreur de bonne foi se corrige par une nouvelle attestation.",
    },
    {
      q: "Mon futur époux est étranger et son pays ne délivre pas de certificat de coutume : une attestation suffit-elle ?",
      r: "Pas d'emblée. Service Public demande d'abord une attestation des autorités du pays qui confirme qu'il n'en délivre pas, et une attestation d'un avocat ou d'un juriste sur les règles du mariage dans ce pays. Ce n'est que si c'est impossible que l'attestation sur l'honneur d'être majeur, célibataire et juridiquement capable est admise. Un document en langue étrangère doit être traduit par un traducteur assermenté.",
    },
    {
      q: "On me demande de témoigner pour un procès : ce modèle convient-il ?",
      r: "Non. Une attestation destinée à un juge suit un formulaire à part, l'attestation de témoin (Cerfa 11527), qui rappelle les mentions exigées et les sanctions d'un faux témoignage, et à laquelle on joint la copie d'une pièce d'identité. Le modèle de cette page sert à déclarer votre propre situation auprès d'une administration, d'un organisme ou d'un établissement, pas à rapporter des faits dont vous avez été témoin.",
    },
  ],
  en: [
    {
      q: "Is a typed attestation sur l'honneur accepted in France, or must it be handwritten?",
      r: "Typed is fine for most procedures. Service Public itself offers an online model to fill in, download as a PDF, print and sign. What commits you is your handwritten signature at the bottom and the accuracy of the facts. Some offices impose their own form, though; in that case use their form instead of a free-text statement, even if it covers the same facts.",
    },
    {
      q: "Can I write my sworn statement in English for a French office?",
      r: "Write it in French. Service Public notes, for a wedding file, that any document in a foreign language must be translated by a sworn translator (traducteur assermenté), which costs time and money. That is why the form here is in English but the statement it produces stays in French. Keep the facts simple and dated; if you type free text, write it in plain French.",
    },
    {
      q: "We are an unmarried couple in France: how do we prove we live together?",
      r: "Ask your town hall for a certificat de vie commune (cohabitation certificate). It is free, but the town hall is not obliged to issue one and may ask for witnesses. If it refuses, Service Public says to give the organisation a sworn statement signed by both partners. Choose « Vie commune » in the tool: it adds the second person and two signature blocks.",
    },
    {
      q: "My country does not issue a certificat de coutume: can a sworn statement replace it for a French wedding?",
      r: "Only as a last resort. Service Public first asks for a statement from your country's authorities confirming they do not issue one, plus a statement from a lawyer on your country's marriage rules. If neither can be obtained, a sworn statement that you are an adult, single and legally capable of marrying is accepted. The town hall where you marry decides on the file.",
    },
    {
      q: "What happens if a sworn statement turns out to be false?",
      r: "Article 441-7 of the French Code pénal punishes making, falsifying or using a certificate with materially false facts by one year in prison and a 15,000 euro fine. The penalty rises to three years and 45,000 euros when the aim is to harm the public treasury or someone's assets, or to obtain a residence permit. An honest mistake is corrected by signing a new, dated statement.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service Public", titre: "Modèle de lettre : attestation sur l'honneur (vérifié le 10 avril 2024)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHonneur", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Certificat de vie commune ou de concubinage (vérifié le 24 octobre 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1433", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Mariage en France", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F930", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Comment obtenir la copie d'un diplôme ? Diplôme d'enseignement supérieur", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35841/1", lu: "27 octobre 2026" },
    { editeur: "Service Public", titre: "Modèle de lettre : déclaration de non-condamnation et de filiation", url: "https://www.service-public.gouv.fr/simulateur/calcul/DeclarationDeNonCondamnationEtDeFiliation", lu: "27 octobre 2026" },
    { editeur: "Légifrance", titre: "Code pénal, article 441-7", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service Public", titre: "Modèle de lettre : attestation sur l'honneur (official sworn statement model)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHonneur", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Certificat de vie commune ou de concubinage (cohabitation certificate)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1433", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Mariage en France (getting married in France)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F930", lu: "27 October 2026" },
    { editeur: "Service Public", titre: "Copie d'un diplôme d'enseignement supérieur (duplicate of a university diploma)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35841/1", lu: "27 October 2026" },
    { editeur: "Légifrance", titre: "Code pénal, article 441-7 (false certificates)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur d'attestation sur l'honneur 75tools",
    motsCles: "attestation sur l'honneur, modèle attestation sur l'honneur, attestation sur l'honneur pdf, déclaration sur l'honneur, attestation de vie commune",
    formulaire: "Contenu de l'attestation",
    modele: "Modèle",
    premiere: "Première personne",
    vous: "Vous",
    seconde: "Seconde personne",
    nom: "Prénom et nom",
    accord: "Accord (soussigné, né)",
    feminin: "Féminin",
    masculin: "Masculin",
    naissance: "Date de naissance (facultatif)",
    lieuNaissance: "Lieu de naissance (facultatif)",
    adresseCommune: "Adresse commune",
    adresseTitre: "Adresse",
    adresse: "Adresse",
    cpCommune: "Code postal et commune",
    depuis: "Vie commune depuis le",
    faits: "Faits attestés (suite de « atteste sur l'honneur que… »)",
    faitsEx: "je n'ai perçu aucun revenu d'activité entre le 1er janvier et le 30 juin 2026.",
    caracteres: "caractères",
    diplomePerdu: "Diplôme perdu",
    intitule: "Intitulé exact",
    etablissement: "Établissement",
    annee: "Année d'obtention",
    signature: "Signature",
    faitA: "Fait à",
    le: "Le",
    voir: "Voir l'attestation",
    francais: "",
    libelleTexte: "Texte de l'attestation sur l'honneur",
    nomDocument: "l'attestation",
  },
  en: {
    nomAppli: "75tools French sworn statement generator (attestation sur l'honneur)",
    motsCles: "sworn statement france, attestation sur l'honneur english, french sworn statement template, déclaration sur l'honneur, cohabitation certificate france",
    formulaire: "Statement details",
    modele: "Model",
    premiere: "First person",
    vous: "You",
    seconde: "Second person",
    nom: "First and last name",
    accord: "Grammar (né / née)",
    feminin: "Female",
    masculin: "Male",
    naissance: "Date of birth (optional)",
    lieuNaissance: "Place of birth (optional)",
    adresseCommune: "Shared address",
    adresseTitre: "Address",
    adresse: "Street address",
    cpCommune: "Postcode and town",
    depuis: "Living together since",
    faits: "Facts you state, in French (they follow « atteste sur l'honneur que… », I declare on my honour that…)",
    faitsEx: "je n'ai perçu aucun revenu d'activité entre le 1er janvier et le 30 juin 2026.",
    caracteres: "characters",
    diplomePerdu: "Lost diploma",
    intitule: "Exact title, in French",
    etablissement: "Institution",
    annee: "Year awarded",
    signature: "Signing",
    faitA: "Signed in (town)",
    le: "On",
    voir: "See the statement",
    francais: "The statement is written in French, as French offices expect; only the form is in English.",
    libelleTexte: "Text of the sworn statement (in French)",
    nomDocument: "the statement",
  },
};

type Textes = (typeof T)["fr"];

const ChampDate = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <input type="date" className={classeChamp} value={value} onChange={(ev) => onChange(ev.target.value)} />
  </label>
);

const ChoixGenre = ({ value, onChange, t }: { value: Genre; onChange: (g: Genre) => void; t: Textes }) => (
  <label className="block min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{t.accord}</span>
    <select className={classeSelect} value={value} onChange={(ev) => onChange(ev.target.value as Genre)}>
      <option value="f">{t.feminin}</option>
      <option value="m">{t.masculin}</option>
    </select>
  </label>
);

const AttestationSurLHonneur = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const r = REPLIS[lang];
  const [d, setD] = useState<Donnees>(VIDE);
  const maj = <K extends keyof Donnees>(k: K) => (val: Donnees[K]) => setD((x) => ({ ...x, [k]: val }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));
  const genere = useMemo(() => texteAttestation(d, lang), [d, lang]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const objet = OBJETS.find((o) => o.id === d.objet)!;
  const deux = d.objet === "concubinage";
  const faitA = `Fait à ${d.lieu.trim() || r.lieu}, le ${dateLongue(d.date) || r.date}`;
  const signataires = deux ? [v(d.nom, r.nom), v(d.nom2, r.nom)] : [v(d.nom, r.nom)];
  const titre = deux ? "Déclaration sur l'honneur de vie commune" : "Attestation sur l'honneur";
  const texteComplet = [titre.toUpperCase(), texte, faitA, ...signataires.map((s) => `Signature : ${s}`)].join("\n\n");

  const outil = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
      <form className="space-y-4 min-w-0 print:hidden" onSubmit={(ev) => ev.preventDefault()} aria-label={t.formulaire}>
        <label className="block">
          <span className="block text-sm text-neutral-300 mb-1">{t.modele}</span>
          <select className={classeSelect} value={d.objet} onChange={(ev) => maj("objet")(ev.target.value as Objet)}>
            {OBJETS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom[lang]}
              </option>
            ))}
          </select>
        </label>
        <p role="status" className="text-sm text-neutral-400 border-l-2 border-sky-400 pl-3 leading-relaxed">
          {objet.aide[lang]}
        </p>
        {lang === "en" && <p className="text-sm text-amber-200/90">{t.francais}</p>}
        <a href="#attestation-honneur" className="lg:hidden inline-flex items-center h-11 px-4 rounded-md border border-neutral-700 text-sm text-neutral-200 hover:border-neutral-500">
          {t.voir}
        </a>

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
          <legend className="text-white font-medium mb-2">{deux ? t.premiere : t.vous}</legend>
          <Champ label={t.nom} value={d.nom} onChange={maj("nom")} autoComplete="name" />
          <ChoixGenre value={d.genre} onChange={maj("genre")} t={t} />
          <ChampDate label={t.naissance} value={d.naissance} onChange={maj("naissance")} />
          <Champ label={t.lieuNaissance} value={d.lieuNaissance} onChange={maj("lieuNaissance")} />
        </fieldset>

        {deux && (
          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">{t.seconde}</legend>
            <Champ label={t.nom} value={d.nom2} onChange={maj("nom2")} />
            <ChoixGenre value={d.genre2} onChange={maj("genre2")} t={t} />
            <ChampDate label={t.naissance} value={d.naissance2} onChange={maj("naissance2")} />
            <Champ label={t.lieuNaissance} value={d.lieuNaissance2} onChange={maj("lieuNaissance2")} />
          </fieldset>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
          <legend className="text-white font-medium mb-2">{deux ? t.adresseCommune : t.adresseTitre}</legend>
          <Champ label={t.adresse} value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
          <Champ label={t.cpCommune} value={d.codePostalCommune} onChange={maj("codePostalCommune")} placeholder="33000 Bordeaux" />
          {deux && <ChampDate label={t.depuis} value={d.depuis} onChange={maj("depuis")} />}
        </fieldset>

        {d.objet === "libre" && (
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">{t.faits}</span>
            <textarea
              rows={5}
              maxLength={2000}
              lang="fr"
              className={classeZoneTexte}
              value={d.faits}
              placeholder={t.faitsEx}
              onChange={(ev) => maj("faits")(ev.target.value)}
            />
            <span className="block text-xs text-neutral-500 mt-1">
              {d.faits.length.toLocaleString(locale(lang))} / {(2000).toLocaleString(locale(lang))} {t.caracteres}
            </span>
          </label>
        )}

        {d.objet === "diplome" && (
          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">{t.diplomePerdu}</legend>
            <Champ label={t.intitule} value={d.diplome} onChange={maj("diplome")} placeholder="de licence de droit" />
            <Champ label={t.etablissement} value={d.etablissement} onChange={maj("etablissement")} placeholder="l'université de Bordeaux" />
            <Champ label={t.annee} value={d.annee} onChange={maj("annee")} placeholder="2018" />
          </fieldset>
        )}

        <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
          <legend className="text-white font-medium mb-2">{t.signature}</legend>
          <Champ label={t.faitA} value={d.lieu} onChange={maj("lieu")} />
          <ChampDate label={t.le} value={d.date} onChange={maj("date")} />
        </fieldset>
      </form>

      <div data-resultat className="space-y-4 min-w-0 lg:sticky lg:top-4">
        <LettreFeuille
          id="attestation-honneur"
          titre={titre}
          libelleTexte={t.libelleTexte}
          texte={texte}
          onTexte={modifier}
          bas={
            <>
              <p className="mt-8">{faitA}</p>
              <div className={deux ? "mt-6 grid grid-cols-2 gap-6" : "mt-6 ml-auto w-full sm:w-1/2"}>
                {signataires.map((s, i) => (
                  <div key={i} className="min-h-[7rem]">
                    <p>Signature</p>
                    <p className="mt-16 print:mt-20">{s}</p>
                  </div>
                ))}
              </div>
            </>
          }
        />
        <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} nomDocument={t.nomDocument} />
      </div>
    </div>
  );

  return (
    <PageOutil id="attestation-sur-l-honneur" lang={lang} motsCles={t.motsCles} nomAppli={t.nomAppli} faq={FAQ[lang]} sources={SOURCES[lang]} outil={outil}>
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Attestation sur l'honneur : remplir le modèle gratuit">
      <p>
        Pour rédiger une attestation sur l'honneur gratuite, choisissez un modèle (texte libre, vie commune, célibat pour
        un mariage, perte d'un diplôme), remplissez votre identité et votre adresse, puis les faits : le document se met
        en page à côté selon la forme du modèle de Service Public, « Je soussigné… atteste sur l'honneur que… », suivie de
        « Fait pour servir et valoir ce que de droit », du lieu, de la date et de la place de la signature. Le texte reste
        modifiable dans l'aperçu ; imprimez-le ou enregistrez-le en PDF, puis signez à la main. Exemple de faits précis :
        « je n'ai perçu aucun revenu d'activité entre le 1er janvier et le 30 juin 2026 », plutôt que « peu de revenus ».
        La zone de texte libre accepte 2 000 caractères, comme le modèle officiel. La limite : un organisme peut imposer
        son propre formulaire, et une attestation inexacte expose à un an d'emprisonnement et 15 000 euros d'amende.
      </p>
    </Section>

    <Section titre="Rédiger une attestation qui sera acceptée">
      <p>
        Le modèle général de Service Public tient en quatre éléments : votre identité et votre adresse, la formule
        « atteste sur l'honneur que » suivie des faits, la mention « Fait pour servir et valoir ce que de droit », puis le
        lieu, la date et la signature. La date et le lieu de naissance sont facultatifs, mais beaucoup d'organismes les
        attendent pour identifier sans ambiguïté le signataire.
      </p>
      <p>
        Pour les faits, soyez précis et vérifiable : des dates plutôt que « depuis longtemps », un montant ou une période
        plutôt qu'une appréciation, l'adresse complète plutôt que la seule ville. Une phrase ou deux suffisent.
        N'attestez que ce que vous savez personnellement : une attestation sert à déclarer votre propre situation, pas à
        témoigner pour un tiers devant un tribunal, ce qui relève de l'attestation de témoin (Cerfa 11527).
      </p>
    </Section>

    <Section titre="Les modèles proposés et la démarche qui va avec">
      <h3>Vie commune</h3>
      <p>
        Certains organismes demandent une preuve de concubinage pour accorder un droit ou un avantage. La mairie peut
        délivrer un certificat de vie commune, gratuit, mais n'y est pas obligée ; elle peut demander des témoins majeurs
        sans lien de parenté avec le couple. À défaut, Service Public renvoie à la déclaration sur l'honneur signée par
        les deux concubins : le modèle prévoit les deux identités et deux signatures.
      </p>
      <h3>Célibat pour un mariage</h3>
      <p>
        Elle ne remplace pas le certificat de coutume ou de célibat. Service Public ne l'admet que pour un futur époux
        étranger dont le pays ne délivre pas de certificat de coutume, et lorsqu'aucune attestation des autorités ni d'un
        avocat ou d'un juriste ne peut être obtenue. La mairie du mariage reste seule juge des pièces du dossier.
      </p>
      <h3>Perte d'un diplôme</h3>
      <p>
        L'établissement d'enseignement supérieur qui a délivré le diplôme peut établir un duplicata, qui a la même valeur
        que l'original. Il demande un justificatif : récépissé de plainte en cas de vol, déclaration de sinistre de
        l'assurance, ou déclaration sur l'honneur. Contactez sa scolarité avant d'envoyer l'attestation.
      </p>
      <h3>Et les autres cas</h3>
      <p>
        Pour héberger quelqu'un, utilisez le modèle dédié d'
        <Link to="/attestation-hebergement/">attestation d'hébergement</Link>, qui reprend les mentions attendues pour
        une carte d'identité ou une carte de séjour. Pour une création d'entreprise, la déclaration de non-condamnation
        et de filiation a son propre modèle sur Service Public. Pour résilier un contrat, passez par la{" "}
        <Link to="/lettre-de-resiliation/">lettre de résiliation</Link>.
      </p>
    </Section>

    <Section titre="Signer, c'est engager sa responsabilité pénale">
      <p>
        L'administration ne vérifie pas toujours sur le moment, mais elle peut contrôler ensuite. L'article 441-7 du Code
        pénal réprime le fait de rédiger une attestation qui fait état de faits matériellement inexacts, de falsifier une
        attestation exacte, et d'utiliser une attestation inexacte ou falsifiée. La peine est d'un an d'emprisonnement et
        de 15 000 euros d'amende, portée à trois ans et 45 000 euros dans les cas aggravés. En cas de doute sur une date
        ou un montant, écrivez-le tel que vous le connaissez (« à ma connaissance », « environ »), et si votre situation
        change, rédigez une nouvelle attestation datée du jour.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Sworn statement template: how to use it">
      <p>
        This sworn statement template produces a French attestation sur l'honneur, the signed declaration that French
        offices, banks, schools and town halls accept as proof of your own situation. Pick a model (free text, living
        together, single status for a wedding, lost diploma), fill in your identity and address, then the facts: the
        statement is laid out next to the form in French, following the Service Public model, « Je soussigné… atteste sur
        l'honneur que… » (I, the undersigned, declare on my honour that…), then « Fait pour servir et valoir ce que de
        droit » (made to serve as required by law), the place, the date and room for your signature. Print it or save it
        as a PDF and sign it by hand. Facts should be precise: « je n'ai perçu aucun revenu d'activité entre le 1er
        janvier et le 30 juin 2026 » (I earned no work income from 1 January to 30 June 2026) rather than "low income".
        The main limit is that some offices impose their own form, and a false statement is a criminal offence.
      </p>
    </Section>

    <Section titre="When a French office asks for an attestation sur l'honneur">
      <p>
        It is the default tool when no official certificate exists for your situation. Typical requests for people who
        have moved to France include declaring that you had no French income over a period, confirming that you live
        with a partner when the town hall does not issue a cohabitation certificate, declaring single status before a
        wedding when your country issues no certificat de coutume, or asking a university for a duplicate of a lost
        diploma. The statement must describe your own situation: evidence for a court case uses a separate form, the
        attestation de témoin (Cerfa 11527).
      </p>
      <p>
        Write the facts in French, even if your French is basic: short sentences with dates and amounts work best. The
        rest of the document, including the date written out in words, is produced in French for you. If the
        organisation sends you its own form, fill in that one instead.
      </p>
    </Section>

    <Section titre="The four models in more detail">
      <p>
        <strong>Living together (concubinage).</strong> French law calls an unmarried couple living together
        « concubins ». The town hall may issue a free certificate, but it does not have to; if it refuses, Service Public
        says to give a statement signed by both partners. The model adds the second person and two signature blocks.
      </p>
      <p>
        <strong>Single status.</strong> For a wedding in France, a foreign spouse-to-be normally gives a certificat de
        coutume from their embassy. The sworn statement is accepted only when neither the home authorities nor a lawyer
        can provide a statement. <strong>Lost diploma.</strong> The French university that awarded it can issue a
        duplicate with the same value as the original, and accepts a sworn statement among the proofs of loss.
      </p>
      <p>
        Signing commits you: under article 441-7 of the Code pénal, a false statement can lead to one year in prison and
        a 15,000 euro fine. To prove that someone lives with you, use the{" "}
        <Link to="/en/proof-of-accommodation/">proof of accommodation letter</Link>; to end a French contract, the{" "}
        <Link to="/en/cancellation-letter/">cancellation letter</Link>.
      </p>
    </Section>
  </>
);

export default AttestationSurLHonneur;
