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

const LU = "27 octobre 2026";

type Objet = "libre" | "concubinage" | "celibat" | "diplome";
type Genre = "f" | "m";

const OBJETS: { id: Objet; nom: string; aide: string }[] = [
  {
    id: "libre",
    nom: "Texte libre",
    aide: "Écrivez les faits que vous attestez, de façon précise et datée. C'est la forme du modèle général de Service Public.",
  },
  {
    id: "concubinage",
    nom: "Vie commune (concubinage)",
    aide: "Quand la mairie ne délivre pas de certificat de vie commune, Service Public indique de présenter une déclaration sur l'honneur signée par les deux concubins.",
  },
  {
    id: "celibat",
    nom: "Célibat, pour un mariage en France",
    aide: "Pour un futur époux étranger dont le pays ne délivre pas de certificat de coutume, et seulement à défaut d'attestation des autorités puis d'un avocat ou juriste, Service Public demande une attestation sur l'honneur déclarant être majeur, célibataire et juridiquement capable. Renseignez-vous auprès de la mairie du mariage.",
  },
  {
    id: "diplome",
    nom: "Perte d'un diplôme (demande de duplicata)",
    aide: "Pour un diplôme de l'enseignement supérieur perdu, Service Public cite la déclaration sur l'honneur parmi les justificatifs acceptés par l'établissement qui l'a délivré, avec le dépôt de plainte ou la déclaration de sinistre.",
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

const e = (g: Genre) => (g === "f" ? "e" : "");
const v = (s: string, repli: string) => s.trim() || repli;

function identite(g: Genre, nom: string, naissance: string, lieu: string) {
  const n = dateLongue(naissance);
  const morceaux = [v(nom, "[prénom et nom]")];
  if (n || lieu.trim()) morceaux.push(`né${e(g)}${n ? ` le ${n}` : ""}${lieu.trim() ? ` à ${lieu.trim()}` : ""}`);
  return morceaux.join(", ");
}

function texteAttestation(d: Donnees): string {
  const adresse = [d.adresse, d.codePostalCommune].map((x) => x.trim()).filter(Boolean).join(", ") || "[adresse]";
  const moi = `Je soussigné${e(d.genre)} ${identite(d.genre, d.nom, d.naissance, d.lieuNaissance)}, demeurant ${adresse},`;
  const fin = "\n\nFait pour servir et valoir ce que de droit.";
  switch (d.objet) {
    case "concubinage": {
      const un = identite(d.genre, d.nom, d.naissance, d.lieuNaissance);
      return (
        `Nous soussignés ${un}${un.includes(", né") ? "," : ""} et ${identite(d.genre2, d.nom2, d.naissance2, d.lieuNaissance2)}, ` +
        `attestons sur l'honneur vivre en concubinage (union libre) et résider ensemble à l'adresse suivante : ${adresse}, ` +
        `depuis le ${dateLongue(d.depuis) || "[date du début de la vie commune]"}.` +
        fin
      );
    }
    case "celibat":
      return `${moi} atteste sur l'honneur être majeur${e(d.genre)}, célibataire et juridiquement capable de contracter mariage.${fin}`;
    case "diplome":
      return (
        `${moi} atteste sur l'honneur avoir perdu l'original de mon diplôme ${v(d.diplome, "[intitulé exact du diplôme]")}, ` +
        `délivré par ${v(d.etablissement, "[établissement]")} ${d.annee.trim() ? `en ${d.annee.trim()}` : "[année d'obtention]"}, ` +
        `et sollicite à ce titre la délivrance d'un duplicata.${fin}`
      );
    default:
      return `${moi} atteste sur l'honneur que ${v(d.faits, "[décrivez les faits que vous attestez]")}${fin}`;
  }
}

const FAQ: QuestionFaq[] = [
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
];

const SOURCES: Source[] = [
  { editeur: "Service Public", titre: "Modèle de lettre : attestation sur l'honneur (vérifié le 10 avril 2024)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHonneur", lu: LU },
  { editeur: "Service Public", titre: "Certificat de vie commune ou de concubinage (vérifié le 24 octobre 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1433", lu: LU },
  { editeur: "Service Public", titre: "Mariage en France (vérifié le 16 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F930", lu: LU },
  { editeur: "Service Public", titre: "Comment obtenir la copie d'un diplôme ? Diplôme d'enseignement supérieur (vérifié le 15 septembre 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F35841/1", lu: LU },
  { editeur: "Service Public", titre: "Modèle de lettre : déclaration de non-condamnation et de filiation", url: "https://www.service-public.gouv.fr/simulateur/calcul/DeclarationDeNonCondamnationEtDeFiliation", lu: LU },
  { editeur: "Légifrance", titre: "Code pénal, article 441-7 (version en vigueur depuis le 12 septembre 2018)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: LU },
];

const ChampDate = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="block text-sm text-neutral-300 mb-1">{label}</span>
    <input type="date" className={classeChamp} value={value} onChange={(ev) => onChange(ev.target.value)} />
  </label>
);

const ChoixGenre = ({ value, onChange }: { value: Genre; onChange: (g: Genre) => void }) => (
  <label className="block">
    <span className="block text-sm text-neutral-300 mb-1">Accord (soussigné, né)</span>
    <select className={classeSelect} value={value} onChange={(ev) => onChange(ev.target.value as Genre)}>
      <option value="f">Féminin</option>
      <option value="m">Masculin</option>
    </select>
  </label>
);

const AttestationSurLHonneur = () => {
  const [d, setD] = useState<Donnees>(VIDE);
  const maj = <K extends keyof Donnees>(k: K) => (val: Donnees[K]) => setD((x) => ({ ...x, [k]: val }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));
  const genere = useMemo(() => texteAttestation(d), [d]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const objet = OBJETS.find((o) => o.id === d.objet)!;
  const deux = d.objet === "concubinage";
  const faitA = `Fait à ${d.lieu.trim() || "[lieu]"}, le ${dateLongue(d.date) || "[date]"}`;
  const signataires = deux ? [v(d.nom, "[prénom et nom]"), v(d.nom2, "[prénom et nom]")] : [v(d.nom, "[prénom et nom]")];
  const titre = deux ? "Déclaration sur l'honneur de vie commune" : "Attestation sur l'honneur";
  const texteComplet = [titre.toUpperCase(), texte, faitA, ...signataires.map((s) => `Signature : ${s}`)].join("\n\n");

  return (
    <PageOutil
      href="/attestation-sur-l-honneur/"
      titre="Attestation sur l'honneur : modèle gratuit à remplir en PDF"
      description="Attestation sur l'honneur à remplir en ligne : texte libre ou modèle (vie commune, célibat, perte de diplôme). Texte modifiable, impression ou PDF gratuits."
      motsCles="attestation sur l'honneur, modèle attestation sur l'honneur, attestation sur l'honneur pdf, déclaration sur l'honneur, attestation de vie commune"
      nomAppli="Générateur d'attestation sur l'honneur"
      h1="Attestation sur l'honneur à remplir en ligne"
      chapeau="Choisissez un modèle ou écrivez vos propres faits : l'attestation suit la forme du modèle de Service Public. Retouchez le texte dans l'aperçu, imprimez-le ou enregistrez-le en PDF, puis signez à la main."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
        <form className="space-y-4 min-w-0 print:hidden" onSubmit={(ev) => ev.preventDefault()} aria-label="Contenu de l'attestation">
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">Modèle</span>
            <select className={classeSelect} value={d.objet} onChange={(ev) => maj("objet")(ev.target.value as Objet)}>
              {OBJETS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nom}
                </option>
              ))}
            </select>
          </label>
          <p role="status" className="text-sm text-neutral-400 border-l-2 border-sky-400 pl-3 leading-relaxed">
            {objet.aide}
          </p>

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">{deux ? "Première personne" : "Vous"}</legend>
            <Champ label="Prénom et nom" value={d.nom} onChange={maj("nom")} autoComplete="name" />
            <ChoixGenre value={d.genre} onChange={maj("genre")} />
            <ChampDate label="Date de naissance (facultatif)" value={d.naissance} onChange={maj("naissance")} />
            <Champ label="Lieu de naissance (facultatif)" value={d.lieuNaissance} onChange={maj("lieuNaissance")} />
          </fieldset>

          {deux && (
            <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
              <legend className="text-white font-medium mb-2">Seconde personne</legend>
              <Champ label="Prénom et nom" value={d.nom2} onChange={maj("nom2")} />
              <ChoixGenre value={d.genre2} onChange={maj("genre2")} />
              <ChampDate label="Date de naissance (facultatif)" value={d.naissance2} onChange={maj("naissance2")} />
              <Champ label="Lieu de naissance (facultatif)" value={d.lieuNaissance2} onChange={maj("lieuNaissance2")} />
            </fieldset>
          )}

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">{deux ? "Adresse commune" : "Adresse"}</legend>
            <Champ label="Adresse" value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
            <Champ label="Code postal et commune" value={d.codePostalCommune} onChange={maj("codePostalCommune")} placeholder="33000 Bordeaux" />
            {deux && <ChampDate label="Vie commune depuis le" value={d.depuis} onChange={maj("depuis")} />}
          </fieldset>

          {d.objet === "libre" && (
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Faits attestés (suite de « atteste sur l'honneur que… »)</span>
              <textarea
                rows={5}
                maxLength={2000}
                className={classeZoneTexte}
                value={d.faits}
                placeholder="je n'ai perçu aucun revenu d'activité entre le 1er janvier et le 30 juin 2026."
                onChange={(ev) => maj("faits")(ev.target.value)}
              />
              <span className="block text-xs text-neutral-500 mt-1">{d.faits.length.toLocaleString("fr-FR")} / 2 000 caractères</span>
            </label>
          )}

          {d.objet === "diplome" && (
            <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
              <legend className="text-white font-medium mb-2">Diplôme perdu</legend>
              <Champ label="Intitulé exact" value={d.diplome} onChange={maj("diplome")} placeholder="de licence de droit" />
              <Champ label="Établissement" value={d.etablissement} onChange={maj("etablissement")} placeholder="l'université de Bordeaux" />
              <Champ label="Année d'obtention" value={d.annee} onChange={maj("annee")} placeholder="2018" />
            </fieldset>
          )}

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">Signature</legend>
            <Champ label="Fait à" value={d.lieu} onChange={maj("lieu")} />
            <ChampDate label="Le" value={d.date} onChange={maj("date")} />
          </fieldset>
        </form>

        <div className="space-y-4 min-w-0 lg:sticky lg:top-4">
          <LettreFeuille
            titre={titre}
            libelleTexte="Texte de l'attestation sur l'honneur"
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
          <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} nomDocument="l'attestation" />
        </div>
      </div>

      <Section titre="Rédiger une attestation sur l'honneur qui sera acceptée">
        <p>
          Le modèle général de Service Public tient en quatre éléments : votre identité et votre adresse, la formule
          « atteste sur l'honneur que » suivie des faits, la mention « Fait pour servir et valoir ce que de droit »,
          puis le lieu, la date et la signature. Ce générateur reprend cette forme ; la date et le lieu de naissance
          sont facultatifs, mais beaucoup d'organismes les attendent pour identifier sans ambiguïté le signataire.
        </p>
        <p>
          Pour les faits, soyez précis et vérifiable : des dates plutôt que « depuis longtemps », un montant ou une
          période plutôt que « peu de revenus », l'adresse complète plutôt que la seule ville. Une phrase ou deux
          suffisent. N'attestez que ce que vous savez personnellement : une attestation sert à déclarer votre
          propre situation, pas à témoigner pour un tiers devant un tribunal, ce qui relève d'un autre formulaire
          (l'attestation de témoin, Cerfa 11527).
        </p>
      </Section>

      <Section titre="Les modèles proposés et la démarche qui va avec">
        <h3>Vie commune</h3>
        <p>
          Certains organismes demandent une preuve de concubinage pour accorder un droit ou un avantage. La mairie
          peut délivrer un certificat de vie commune, mais n'y est pas obligée ; elle peut demander des témoins
          majeurs sans lien de parenté avec le couple. À défaut, Service Public renvoie à la déclaration sur
          l'honneur signée par les deux concubins : le modèle prévoit les deux identités et deux signatures.
        </p>
        <h3>Célibat pour un mariage</h3>
        <p>
          Elle ne remplace pas le certificat de coutume ou de célibat. Service Public ne l'admet que pour un futur
          époux étranger dont le pays ne délivre pas de certificat de coutume, et lorsqu'aucune attestation des
          autorités ni d'un avocat ou d'un juriste ne peut être obtenue. La mairie du mariage reste seule juge des
          pièces de votre dossier.
        </p>
        <h3>Perte d'un diplôme</h3>
        <p>
          L'établissement d'enseignement supérieur qui a délivré le diplôme peut établir un duplicata, qui a la même
          valeur que l'original. Il demande un justificatif : récépissé de plainte en cas de vol, déclaration de
          sinistre de l'assurance, ou déclaration sur l'honneur. Chaque établissement fixe sa propre procédure :
          contactez sa scolarité avant d'envoyer l'attestation.
        </p>
        <h3>Et les autres cas</h3>
        <p>
          Pour héberger quelqu'un, utilisez plutôt le modèle dédié d'
          <Link to="/attestation-hebergement/">attestation d'hébergement</Link>, qui reprend les mentions attendues
          pour une carte d'identité. Pour une création d'entreprise, la déclaration de non-condamnation et de
          filiation a son propre modèle sur Service Public. Pour résilier un contrat, passez par la{" "}
          <Link to="/lettre-de-resiliation/">lettre de résiliation</Link>.
        </p>
      </Section>

      <Section titre="Signer, c'est engager sa responsabilité pénale">
        <p>
          L'attestation sur l'honneur repose sur la confiance : l'administration ne vérifie pas toujours sur le
          moment, mais elle peut contrôler ensuite. L'article 441-7 du Code pénal réprime trois comportements :
          rédiger une attestation qui fait état de faits matériellement inexacts, falsifier une attestation
          exacte, et utiliser une attestation inexacte ou falsifiée. La peine de base est d'un an d'emprisonnement
          et de 15 000 euros d'amende, portée à trois ans et 45 000 euros dans les cas aggravés prévus par le texte.
        </p>
        <p>
          L'infraction vise les faits « matériellement inexacts » : en cas de doute sur une date ou un montant,
          écrivez-le tel que vous le connaissez, avec ses limites (« à ma connaissance », « environ »), plutôt que
          de l'arrondir dans le sens qui vous arrange. Et si votre situation change, rédigez une nouvelle
          attestation datée du jour.
        </p>
      </Section>
    </PageOutil>
  );
};

export default AttestationSurLHonneur;
