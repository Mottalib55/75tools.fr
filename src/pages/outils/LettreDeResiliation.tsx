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
import {
  TYPES,
  TypeContrat,
  DonneesResiliation,
  infosType,
  corpsLettre,
  objetLettre,
} from "@/lib/lettre-resiliation";

const LU = "27 octobre 2026";

const VIDE: DonneesResiliation = {
  type: "telecom",
  motif: "sans-engagement",
  prenomNom: "",
  adresse: "",
  codePostalVille: "",
  organisme: "",
  adresseOrganisme: "",
  codePostalVilleOrganisme: "",
  reference: "",
  ligne: "",
  precision: "",
  dateEvenement: "",
  dateEffet: "",
  lieu: "",
  date: "",
  recommande: true,
};

/** Champ complémentaire selon le contrat et le motif. */
const champPrecision = (type: TypeContrat, motif: string) => {
  if (type === "telecom" && motif === "legitime")
    return { label: "Motif légitime : l'événement en une ou deux phrases", placeholder: "J'ai été licencié le 3 septembre 2026.", long: true };
  if (type === "telecom" && motif === "modification")
    return { label: "Modification refusée (facultatif)", placeholder: "hausse du prix mensuel annoncée le 15 septembre", long: false };
  if (type === "auto" && motif === "situation")
    return { label: "Changement de situation", placeholder: "Je pars à la retraite.", long: true };
  if (type === "abonnement" || type === "autre")
    return { label: "Ce que vous résiliez", placeholder: "mon abonnement numérique au Journal de Lyon", long: false };
  if (type === "energie") return { label: "Adresse du logement concerné", placeholder: "4 rue Victor-Hugo, 69002 Lyon", long: false };
  return null;
};

const FAQ: QuestionFaq[] = [
  {
    q: "Je dois envoyer ma lettre de résiliation en recommandé, ou un e-mail suffit ?",
    r: "Cela dépend du contrat. Pour une assurance, Service Public liste plusieurs moyens admis : lettre simple, envoi en ligne si le contrat a été souscrit ou peut l'être en ligne, déclaration au siège ou chez l'agent, ou tout moyen prévu au contrat. Le recommandé avec avis de réception reste conseillé pour une box ou une salle de sport, parce qu'il date la réception sans discussion.",
  },
  {
    q: "J'ai souscrit mon abonnement sur internet, je peux résilier sans lettre ?",
    r: "Oui. Un contrat qui peut être conclu en ligne doit aussi pouvoir être résilié en ligne, par une fonction « résilier votre contrat » visible et accessible sans créer d'espace personnel. Vous indiquez votre identité, la référence du contrat et la date souhaitée, vous vérifiez un récapitulatif, puis vous confirmez. Le professionnel doit accuser réception et vous indiquer la date de fin.",
  },
  {
    q: "Je change d'assurance auto avant l'échéance, je dois écrire à mon ancien assureur ?",
    r: "Non, si votre contrat a plus d'un an. Service Public précise que, pour une assurance auto, vous n'avez pas le droit d'envoyer vous-même la demande : c'est le nouvel assureur qui s'en charge, pour que le véhicule ne reste jamais sans assurance. La résiliation prend effet un mois après la réception par l'ancien assureur. Ce modèle sert en revanche pour l'échéance annuelle ou un changement de situation.",
  },
  {
    q: "Mon opérateur me réclame des frais alors que je pars pour un motif légitime, que faire ?",
    r: "Rappelez par écrit le motif et joignez le justificatif : licenciement, hospitalisation de longue durée, déménagement dans une zone non couverte, handicap ou maladie empêchant d'utiliser le service. Si l'opérateur maintient sa position, adressez une réclamation écrite à son service client, puis saisissez le médiateur des communications électroniques, gratuit, avant d'envisager le tribunal.",
  },
];

const SOURCES: Source[] = [
  { editeur: "Service Public", titre: "Téléphone, internet ou télévision : résiliation du contrat (vérifié le 8 juin 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22486", lu: LU },
  { editeur: "Service Public", titre: "Assurance auto (véhicule à moteur) : résiliation du contrat (vérifié le 1er juillet 2023)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2659", lu: LU },
  { editeur: "Service Public", titre: "Assurance habitation : résiliation du contrat (vérifié le 1er juillet 2023)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F19083", lu: LU },
  { editeur: "Service Public", titre: "Couverture maladie complémentaire (mutuelle) (vérifié le 1er octobre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F20314", lu: LU },
  { editeur: "Service Public", titre: "Comment obtenir un contrat d'assurance emprunteur pour un crédit immobilier ? (vérifié le 20 mai 2025)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1671", lu: LU },
  { editeur: "Service Public", titre: "Peut-on résilier un contrat de prestation de services à tacite reconduction ? (vérifié le 20 mars 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F33991", lu: LU },
  { editeur: "Service Public", titre: "Comment choisir un fournisseur d'électricité ou de gaz ou en changer ? (vérifié le 25 septembre 2026)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F18116", lu: LU },
  { editeur: "Service Public Entreprendre", titre: "Résiliation « en 3 clics » : application et étapes (actualité du 7 juin 2023, mise à jour le 14 septembre 2023)", url: "https://entreprendre.service-public.gouv.fr/actualites/A16599", lu: LU },
  { editeur: "Service Public", titre: "Ce qui change en juin 2023 (actualité du 1er juin 2023)", url: "https://www.service-public.gouv.fr/particuliers/actualites/A16592", lu: LU },
];

const Gris = ({ v, repli }: { v: string; repli: string }) =>
  v.trim() ? <>{v.trim()}</> : <span className="text-neutral-400 print:text-neutral-500">{repli}</span>;

const LettreDeResiliation = () => {
  const [d, setD] = useState<DonneesResiliation>(VIDE);
  const maj = <K extends keyof DonneesResiliation>(k: K) => (v: DonneesResiliation[K]) => setD((x) => ({ ...x, [k]: v }));
  useDateDuJour((iso) => setD((x) => ({ ...x, date: x.date || iso })));

  const infos = infosType(d.type);
  const precision = champPrecision(d.type, d.motif);
  const genere = useMemo(() => corpsLettre(d, dateLongue), [d]);
  const { texte, retouche, modifier, reinitialiser } = useTexteRetouchable(genere);
  const objet = objetLettre(d);
  const lieuDate = `À ${d.lieu.trim() || "[ville]"}, le ${dateLongue(d.date) || "[date]"}`;

  const texteComplet = [
    [d.prenomNom || "[Vos prénom et nom]", d.adresse, d.codePostalVille].filter((x) => x.trim()).join("\n"),
    [d.organisme || "[Organisme]", d.adresseOrganisme, d.codePostalVilleOrganisme].filter((x) => x.trim()).join("\n"),
    lieuDate,
    d.recommande ? "Lettre recommandée avec avis de réception" : "",
    `Objet : ${objet}`,
    texte,
    d.prenomNom || "[Vos prénom et nom]",
  ]
    .filter(Boolean)
    .join("\n\n");

  const changerType = (t: TypeContrat) =>
    setD((x) => ({ ...x, type: t, motif: infosType(t).motifs[0].id, precision: "", dateEvenement: "" }));

  return (
    <PageOutil
      href="/lettre-de-resiliation/"
      titre="Lettre de résiliation : modèle gratuit à remplir en ligne"
      description="Lettre de résiliation gratuite : box, mobile, assurance, mutuelle, salle de sport ou abonnement. Motif, délai et date d'effet, puis impression ou PDF."
      motsCles="lettre de résiliation, modèle lettre de résiliation, résilier un abonnement, lettre type résiliation, résiliation assurance, résiliation box"
      nomAppli="Générateur de lettre de résiliation"
      h1="Lettre de résiliation : modèle à compléter"
      chapeau="Choisissez le type de contrat et le motif : la lettre se rédige au fil de la saisie, avec les règles de délai rappelées par Service Public. Retouchez-la si besoin, puis imprimez-la ou enregistrez-la en PDF."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start print:block">
        <form className="space-y-4 min-w-0 print:hidden" onSubmit={(e) => e.preventDefault()} aria-label="Votre contrat">
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">Type de contrat</span>
            <select className={classeSelect} value={d.type} onChange={(e) => changerType(e.target.value as TypeContrat)}>
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm text-neutral-300 mb-1">Motif</span>
            <select className={classeSelect} value={d.motif} onChange={(e) => maj("motif")(e.target.value)}>
              {infos.motifs.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom}
                </option>
              ))}
            </select>
          </label>
          <p role="status" className="text-sm text-neutral-400 border-l-2 border-sky-400 pl-3 leading-relaxed">
            {infos.repere}
          </p>
          {precision &&
            (precision.long ? (
              <label className="block">
                <span className="block text-sm text-neutral-300 mb-1">{precision.label}</span>
                <textarea
                  rows={3}
                  className={classeZoneTexte}
                  value={d.precision}
                  placeholder={precision.placeholder}
                  onChange={(e) => maj("precision")(e.target.value)}
                />
              </label>
            ) : (
              <Champ label={precision.label} value={d.precision} onChange={maj("precision")} placeholder={precision.placeholder} />
            ))}
          {(d.type === "emprunteur" || (d.type === "auto" && d.motif === "situation")) && (
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">
                {d.type === "emprunteur" ? "Date de l'accord de la banque" : "Date de l'événement"}
              </span>
              <input type="date" className={classeChamp} value={d.dateEvenement} onChange={(e) => maj("dateEvenement")(e.target.value)} />
            </label>
          )}

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
            <legend className="text-white font-medium mb-2">Vous</legend>
            <Champ label="Prénom et nom" value={d.prenomNom} onChange={maj("prenomNom")} autoComplete="name" />
            <Champ label="Adresse" value={d.adresse} onChange={maj("adresse")} autoComplete="street-address" />
            <Champ label="Code postal et ville" value={d.codePostalVille} onChange={maj("codePostalVille")} placeholder="69003 Lyon" />
            <Champ label={infos.libelleReference} value={d.reference} onChange={maj("reference")} />
            {d.type === "telecom" && (
              <Champ label="Numéro de ligne (facultatif)" value={d.ligne} onChange={maj("ligne")} placeholder="06 12 34 56 78" />
            )}
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
            <legend className="text-white font-medium mb-2">Destinataire</legend>
            <Champ label="Organisme" value={d.organisme} onChange={maj("organisme")} placeholder="Service résiliation de…" />
            <Champ label="Adresse" value={d.adresseOrganisme} onChange={maj("adresseOrganisme")} />
            <Champ label="Code postal et ville" value={d.codePostalVilleOrganisme} onChange={maj("codePostalVilleOrganisme")} />
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2 pt-2">
            <legend className="text-white font-medium mb-2">Envoi</legend>
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Date d'effet souhaitée (facultatif)</span>
              <input type="date" className={classeChamp} value={d.dateEffet} onChange={(e) => maj("dateEffet")(e.target.value)} />
            </label>
            <Champ label="Fait à" value={d.lieu} onChange={maj("lieu")} placeholder="Lyon" />
            <label className="block">
              <span className="block text-sm text-neutral-300 mb-1">Date de la lettre</span>
              <input type="date" className={classeChamp} value={d.date} onChange={(e) => maj("date")(e.target.value)} />
            </label>
            <label className="flex items-center gap-3 sm:pt-6 text-sm text-neutral-300">
              <input
                type="checkbox"
                className="w-5 h-5 accent-sky-400"
                checked={d.recommande}
                onChange={(e) => maj("recommande")(e.target.checked)}
              />
              Mention « recommandée avec avis de réception »
            </label>
          </fieldset>
        </form>

        <div className="space-y-4 min-w-0 lg:sticky lg:top-4">
          <LettreFeuille
            libelleTexte="Corps de la lettre de résiliation"
            haut={
              <>
                <div className="leading-snug">
                  <Gris v={d.prenomNom} repli="[Vos prénom et nom]" />
                  {d.adresse.trim() && <div>{d.adresse}</div>}
                  {d.codePostalVille.trim() && <div>{d.codePostalVille}</div>}
                  {d.reference.trim() && <div className="mt-1">{infos.libelleReference} : {d.reference}</div>}
                </div>
                <div className="mt-6 ml-auto w-full sm:w-1/2 leading-snug">
                  <Gris v={d.organisme} repli="[Organisme]" />
                  {d.adresseOrganisme.trim() && <div>{d.adresseOrganisme}</div>}
                  {d.codePostalVilleOrganisme.trim() && <div>{d.codePostalVilleOrganisme}</div>}
                </div>
                <p className="mt-6 sm:text-right">{lieuDate}</p>
                {d.recommande && <p className="mt-4 italic">Lettre recommandée avec avis de réception</p>}
                <p className="mt-4 mb-5 font-semibold">Objet : {objet}</p>
              </>
            }
            texte={texte}
            onTexte={modifier}
            bas={
              <div className="mt-8 ml-auto w-full sm:w-1/2 min-h-[6rem]">
                <Gris v={d.prenomNom} repli="[Vos prénom et nom]" />
                <p className="text-sm text-neutral-500 mt-1 print:hidden">Signature</p>
              </div>
            }
          />
          <ActionsLettre texteComplet={texteComplet} retouche={retouche} reinitialiser={reinitialiser} />
        </div>
      </div>

      <Section titre="Envoyer la résiliation : recommandé, espace client ou trois clics">
        <p>
          La lettre recommandée avec avis de réception n'est pas toujours obligatoire, mais elle reste le moyen le
          plus sûr de prouver la date à laquelle votre demande est arrivée : c'est cette date qui fait courir le
          délai de résiliation. Pour une assurance, Service Public admet aussi la lettre simple, la déclaration au
          siège de l'assureur ou chez son agent, l'envoi en ligne quand le contrat a été souscrit ou peut l'être en
          ligne, ou tout autre moyen prévu par le contrat.
        </p>
        <p>
          Depuis la loi du 16 août 2022 et son décret du 31 mai 2023, un contrat qui peut être conclu en ligne
          doit aussi pouvoir être résilié en ligne : opérateurs, fournisseurs d'énergie, salles de sport, presse en
          ligne, sites de rencontre et, depuis le 1er juin 2023, assurances et mutuelles. La fonction « résilier
          votre contrat » doit être visible, accessible sans créer d'espace personnel, et se dérouler en trois
          temps : vos informations (identité, référence du contrat, date souhaitée), un récapitulatif, puis la
          confirmation. Le professionnel doit ensuite accuser réception et vous indiquer la date de fin du contrat.
        </p>
        <p>
          Ce bouton évite la lettre, mais la lettre garde un intérêt quand le site ne propose pas la fonction ou
          quand vous voulez exposer un motif précis, comme un motif légitime auprès d'un opérateur.
        </p>
      </Section>

      <Section titre="Délais et date d'effet selon le contrat">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-800">
                <th className="py-2 pr-4 font-medium">Contrat</th>
                <th className="py-2 pr-4 font-medium">Quand résilier</th>
                <th className="py-2 font-medium">Effet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr>
                <td className="py-2 pr-4">Box, mobile, télévision</td>
                <td className="py-2 pr-4">À tout moment ; pendant l'engagement, frais possibles sauf motif légitime</td>
                <td className="py-2">10 jours au plus après réception, sauf date demandée</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Assurance auto</td>
                <td className="py-2 pr-4">À l'échéance ; à tout moment après un an, par le nouvel assureur</td>
                <td className="py-2">1 mois après réception (après un an)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Assurance habitation</td>
                <td className="py-2 pr-4">À tout moment après un an ; locataire : par le nouvel assureur</td>
                <td className="py-2">1 mois après réception</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Mutuelle individuelle</td>
                <td className="py-2 pr-4">À tout moment après un an d'adhésion</td>
                <td className="py-2">Selon les conditions générales</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Assurance emprunteur</td>
                <td className="py-2 pr-4">À tout moment, après accord de la banque sur le nouveau contrat</td>
                <td className="py-2">Banque : réponse sous 10 jours ouvrés</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Salle de sport, abonnement à reconduction tacite</td>
                <td className="py-2 pr-4">Avant la date limite de non-reconduction ; immédiatement si le rappel annuel manque</td>
                <td className="py-2">À la date anniversaire</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Électricité, gaz</td>
                <td className="py-2 pr-4">À tout moment, sans durée minimale</td>
                <td className="py-2">Automatique en cas de changement de fournisseur</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Ces repères résument les fiches de Service Public citées en bas de page. Votre contrat peut prévoir un
          délai plus court ou un moyen d'envoi supplémentaire : relisez ses conditions générales avant d'envoyer.
        </p>
      </Section>

      <Section titre="Avant d'envoyer : quatre vérifications">
        <p>
          <strong>Les références.</strong> Un numéro de contrat, de client ou d'adhérent permet au service de
          retrouver votre dossier sans échange supplémentaire. Pour une box ou un mobile, indiquez aussi le numéro de
          la ligne concernée si vous en avez plusieurs.
        </p>
        <p>
          <strong>La date d'effet.</strong> Laissez le champ vide pour une résiliation à la première date permise,
          ou indiquez une date plus tardive, par exemple le jour de votre déménagement. Pour un contrat à
          reconduction tacite, les sommes restent dues jusqu'à la date de fin, quelle que soit la date de votre
          demande : gardez donc votre prélèvement actif jusque-là.
        </p>
        <p>
          <strong>La preuve.</strong> Conservez une copie de la lettre, le bordereau du recommandé et l'avis de
          réception, ou la capture de l'accusé de réception en ligne. Demandez une confirmation écrite de la date
          d'effet : la lettre générée la réclame déjà.
        </p>
        <p>
          <strong>Le matériel.</strong> Une box, un décodeur ou une carte d'accès se rendent en général dans un délai
          fixé par le contrat ; le dépôt de garantie est remboursé après la restitution. Pour une attestation à
          joindre à un autre dossier, voyez aussi le modèle d'
          <Link to="/attestation-sur-l-honneur/">attestation sur l'honneur</Link>.
        </p>
      </Section>
    </PageOutil>
  );
};

export default LettreDeResiliation;
