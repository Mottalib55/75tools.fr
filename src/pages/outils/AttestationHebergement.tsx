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

const LU = "27 octobre 2026";

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

function texteAttestation(d: Donnees): string {
  const h = d.hebergeant;
  const b = d.heberge;
  const adresse = [d.adresse, d.complement, [d.codePostal, d.commune].filter((x) => x.trim()).join(" ")]
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");
  return (
    `Je soussigné${e(h.genre)} ${val(h.nom, "[prénom et nom de la personne qui héberge]")}, ` +
    `né${e(h.genre)} le ${dateLongue(h.naissance) || "[date de naissance]"} à ${val(h.lieuNaissance, "[lieu de naissance]")}, ` +
    `déclare sur l'honneur héberger à mon domicile ${val(b.nom, "[prénom et nom de la personne hébergée]")}, ` +
    `né${e(b.genre)} le ${dateLongue(b.naissance) || "[date de naissance]"} à ${val(b.lieuNaissance, "[lieu de naissance]")}, ` +
    `depuis le ${dateLongue(d.depuis) || "[date de début de l'hébergement]"}, à l'adresse suivante : ${adresse || "[adresse du logement]"}.` +
    `\n\nJe joins à la présente attestation la copie de ma pièce d'identité et un justificatif de domicile à mon nom.`
  );
}

const FAQ: QuestionFaq[] = [
  {
    q: "J'héberge mon fils majeur, quelles pièces lui donner pour sa carte d'identité ?",
    r: "Pour une carte d'identité ou un passeport, Service Public demande trois documents quand le demandeur habite chez un proche : la photocopie de la pièce d'identité de l'hébergeant, l'attestation d'hébergement originale, datée et signée, indiquant qu'il habite chez vous de manière stable ou depuis plus de trois mois, et un justificatif de domicile original de moins d'un an à votre nom. La fiche précise qu'aucun autre document ne doit être exigé.",
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
    r: "Oui, sur l'exactitude de ce que vous déclarez. L'article 441-7 du Code pénal punit d'un an d'emprisonnement et de 15 000 euros d'amende le fait d'établir une attestation faisant état de faits matériellement inexacts, ou d'en faire usage. La peine monte à trois ans et 45 000 euros quand l'attestation vise notamment à obtenir un titre de séjour. L'usage d'une attestation inexacte est puni des mêmes peines.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Service Public", titre: "Modèle de lettre : attestation d'hébergement (vérifié le 26 juin 2024)", url: "https://www.service-public.gouv.fr/simulateur/calcul/AttestationHebergement", lu: LU },
  { editeur: "Service Public", titre: "Attestation d'hébergement (vérifié le 11 mai 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R39697", lu: LU },
  { editeur: "Service Public", titre: "Demande de carte d'identité ou de passeport : quel justificatif de domicile présenter ? (vérifié le 28 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14807", lu: LU },
  { editeur: "Légifrance", titre: "Code pénal, article 441-7 (version en vigueur depuis le 12 septembre 2018)", url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037398925", lu: LU },
];

const BlocPersonne = ({
  titre,
  p,
  onChange,
}: {
  titre: string;
  p: Personne;
  onChange: (p: Personne) => void;
}) => (
  <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
    <legend className="text-white font-medium mb-2">{titre}</legend>
    <Champ label="Prénom et nom" value={p.nom} onChange={(v) => onChange({ ...p, nom: v })} />
    <label className="block">
      <span className="block text-sm text-neutral-300 mb-1">Accord (soussigné, né)</span>
      <select className={classeSelect} value={p.genre} onChange={(ev) => onChange({ ...p, genre: ev.target.value as Genre })}>
        <option value="f">Féminin : soussignée, née</option>
        <option value="m">Masculin : soussigné, né</option>
      </select>
    </label>
    <label className="block">
      <span className="block text-sm text-neutral-300 mb-1">Date de naissance</span>
      <input type="date" className={classeChamp} value={p.naissance} onChange={(ev) => onChange({ ...p, naissance: ev.target.value })} />
    </label>
    <Champ
      label="Lieu de naissance"
      value={p.lieuNaissance}
      onChange={(v) => onChange({ ...p, lieuNaissance: v })}
      placeholder="Nantes, ou Casablanca (Maroc)"
    />
  </fieldset>
);

const AttestationHebergement = () => {
  const [d, setD] = useState<Donnees>(VIDE);
  const maj = <K extends keyof Donnees>(k: K) => (v: Donnees[K]) => setD((x) => ({ ...x, [k]: v }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));
  const genere = useMemo(() => texteAttestation(d), [d]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const faitA = `Fait à ${d.lieu.trim() || "[lieu]"}, le ${dateLongue(d.date) || "[date]"}`;
  const signataire = d.hebergeant.nom.trim() || "[prénom et nom de la personne qui héberge]";
  const texteComplet = ["ATTESTATION D'HÉBERGEMENT", texte, faitA, `Signature : ${signataire}`].join("\n\n");

  return (
    <PageOutil
      href="/attestation-hebergement/"
      titre="Attestation d'hébergement : modèle gratuit à imprimer"
      description="Attestation d'hébergement à remplir en ligne : hébergeant, hébergé, adresse et date d'arrivée, d'après le modèle de Service Public. Impression ou PDF, gratuit."
      motsCles="attestation d'hébergement, modèle attestation d'hébergement, attestation hébergement gratuit, attestation d'hébergement pdf, justificatif de domicile hébergé"
      nomAppli="Générateur d'attestation d'hébergement"
      h1="Attestation d'hébergement en ligne"
      chapeau="Remplissez l'identité de la personne qui héberge et de la personne hébergée : l'attestation reprend la formule du modèle de Service Public. Imprimez-la, signez-la à la main et joignez les deux pièces demandées."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
        <form className="space-y-4 min-w-0 print:hidden" onSubmit={(ev) => ev.preventDefault()} aria-label="Informations de l'attestation">
          <BlocPersonne titre="Personne qui héberge" p={d.hebergeant} onChange={maj("hebergeant")} />
          <BlocPersonne titre="Personne hébergée" p={d.heberge} onChange={maj("heberge")} />
          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">Logement</legend>
            <Champ label="Adresse" value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
            <Champ label="Complément (facultatif)" value={d.complement} onChange={maj("complement")} placeholder="Bâtiment B, 3e étage" />
            <Champ label="Code postal" value={d.codePostal} onChange={maj("codePostal")} autoComplete="postal-code" />
            <Champ label="Commune" value={d.commune} onChange={maj("commune")} />
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Hébergement depuis le</span>
              <input type="date" className={classeChamp} value={d.depuis} onChange={(ev) => maj("depuis")(ev.target.value)} />
            </label>
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2 min-w-0">
            <legend className="text-white font-medium mb-2">Signature</legend>
            <Champ label="Fait à" value={d.lieu} onChange={maj("lieu")} />
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Le</span>
              <input type="date" className={classeChamp} value={d.date} onChange={(ev) => maj("date")(ev.target.value)} />
            </label>
          </fieldset>
        </form>

        <div className="space-y-4 min-w-0 lg:sticky lg:top-4">
          <LettreFeuille
            titre="Attestation d'hébergement"
            libelleTexte="Texte de l'attestation d'hébergement"
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
          <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} nomDocument="l'attestation" />
        </div>
      </div>

      <Section titre="Les pièces à joindre à l'attestation">
        <p>
          L'attestation seule ne suffit presque jamais : elle prouve ce que vous déclarez, les pièces jointes
          prouvent qui vous êtes et que vous habitez bien à cette adresse. Pour une carte d'identité ou un
          passeport, la fiche de Service Public sur le justificatif de domicile liste exactement trois documents
          lorsque le demandeur vit chez un parent ou un ami :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>la photocopie de la pièce d'identité de la personne qui héberge ;</li>
          <li>
            l'attestation sur l'honneur de l'hébergement, en original, datée et signée, certifiant que la personne
            habite chez vous de manière stable ou depuis plus de trois mois ;
          </li>
          <li>un justificatif de domicile de moins d'un an au nom de la personne qui héberge, en original.</li>
        </ul>
        <p>
          Pour la carte grise, le permis de conduire ou une carte de séjour, Service Public renvoie à des fiches
          propres à chaque démarche ; la liste y est proche, mais lisez celle de votre démarche avant de déposer le
          dossier, en particulier la liste des justificatifs de domicile acceptés au nom de l'hébergeant.
        </p>
      </Section>

      <Section titre="Quand l'attestation d'hébergement est demandée">
        <p>
          Elle sert à toute personne qui doit justifier d'un domicile sans avoir de facture ni de bail à son nom :
          un jeune adulte qui vit chez ses parents, une personne hébergée par un ami après une séparation, un
          étudiant logé chez un proche. Les démarches qui la réclament le plus souvent sont la carte d'identité et
          le passeport, l'immatriculation d'un véhicule, l'inscription au permis de conduire, la demande de titre
          de séjour en préfecture ; d'autres organismes la demandent aussi pour ouvrir un dossier à votre adresse.
        </p>
        <p>
          Le texte généré reprend la formule du modèle de Service Public : identité et naissance des deux
          personnes, adresse du logement, date de début de l'hébergement, lieu et date de l'attestation. Indiquez la
          date réelle d'arrivée : pour une carte d'identité, l'administration attend un hébergement stable ou de plus
          de trois mois. Si un organisme demande une précision supplémentaire, ajoutez-la directement dans le texte
          de l'aperçu, qui reste modifiable.
        </p>
      </Section>

      <Section titre="Ce que vous risquez avec une fausse attestation">
        <p>
          Héberger quelqu'un « sur le papier » pour lui rendre service n'a rien d'anodin. L'article 441-7 du Code
          pénal punit d'un an d'emprisonnement et de 15 000 euros d'amende le fait d'établir une attestation qui
          fait état de faits matériellement inexacts, de falsifier une attestation exacte, ou d'utiliser une
          attestation inexacte ou falsifiée. Les peines passent à trois ans et 45 000 euros quand l'infraction vise
          à porter préjudice au Trésor public ou au patrimoine d'autrui, ou à obtenir un titre de séjour.
        </p>
        <p>
          La personne hébergée qui produit l'attestation peut donc être poursuivie au même titre que celle qui l'a
          signée. Si la situation change, par exemple si la personne quitte votre logement, ne réutilisez pas une
          ancienne attestation : établissez-en une nouvelle à la bonne date, ou aucune. Pour une déclaration d'un
          autre type, le générateur d'
          <Link to="/attestation-sur-l-honneur/">attestation sur l'honneur</Link> propose un texte libre.
        </p>
      </Section>
    </PageOutil>
  );
};

export default AttestationHebergement;
