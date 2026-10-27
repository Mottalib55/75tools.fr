import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { lienAvisGoogle } from "@/lib/qr-formats";

const HREF = "/qr-code-avis-google/";
const TITRE =
  "QR code avis Google gratuit : lien et affiche à imprimer";
const DESCRIPTION =
  "QR code avis Google gratuit : collez le lien d'avis de votre fiche d'établissement ou son identifiant de lieu, puis imprimez l'affiche ou téléchargez le code.";

const FAQ: QuestionFaq[] = [
  {
    q: "Puis-je offrir un café ou une remise aux clients qui laissent un avis ?",
    r: "Non. Le règlement de Google Maps interdit d'offrir un avantage (paiement, remise, produit ou service gratuit) en échange d'un avis, et les avis ainsi obtenus sont supprimés. En France, la DGCCRF rappelle aussi aux consommateurs de se méfier des offres en contrepartie d'un avis positif. Demandez un avis sans contrepartie, à tous vos clients, et laissez-les libres de ce qu'ils écrivent.",
  },
  {
    q: "Je préfère ne montrer le code qu'aux clients contents, c'est permis ?",
    r: "Non. Google interdit explicitement de solliciter des avis positifs de façon sélective, ainsi que de décourager ou d'interdire les avis négatifs. Une affiche visible par tous, ou une demande faite à chaque client après son achat, respecte la règle. Un avis négatif traité avec une réponse polie et concrète rassure d'ailleurs souvent davantage qu'une série de notes parfaites.",
  },
  {
    q: "Le lien fabriqué à partir de l'identifiant de lieu est-il un lien officiel ?",
    r: "C'est un format d'adresse très utilisé, mais l'aide de la fiche d'établissement ne le présente pas : elle donne un lien à copier depuis votre fiche. Préférez donc ce lien fourni par Google. Si vous ne pouvez pas y accéder, l'identifiant de lieu dépanne ; l'outil construit alors l'adresse, et il vous suffit de scanner le code pour vérifier qu'il ouvre bien la fenêtre d'avis de votre établissement.",
  },
  {
    q: "Mes clients ont-ils besoin d'un compte Google pour laisser un avis ?",
    r: "Oui. D'après l'aide de la fiche d'établissement, il faut être connecté à un compte Google pour publier un avis ; ce compte peut être créé avec une adresse e-mail qui n'est pas une adresse Gmail. Un client sans compte arrivera sur une page de connexion après le scan : mentionnez-le si on vous pose la question, sans insister.",
  },
  {
    q: "Puis-je demander au client d'écrire son avis tout de suite, devant moi ?",
    r: "Le règlement de Google interdit d'obliger les clients à laisser une note ou à rédiger un avis sur place. Vous pouvez montrer l'affiche et dire que vous seriez content d'avoir son avis, mais le client doit rester libre de le faire plus tard, ou pas du tout. Remettre le code sur le ticket ou dans un e-mail de remerciement lui laisse le temps.",
  },
];

const SOURCES = [
  {
    editeur: "Aide Fiche d'établissement Google",
    titre: "Créer un lien ou un QR code pour demander des avis",
    url: "https://support.google.com/business/answer/16816815?hl=fr",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Aide Fiche d'établissement Google",
    titre: "Conseils pour obtenir plus d'avis",
    url: "https://support.google.com/business/answer/3474122?hl=fr",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Google, règles relatives au contenu",
    titre: "Contenus interdits et soumis à des restrictions (engagement artificiel, manipulation des notes)",
    url: "https://support.google.com/contributionpolicy/answer/7400114?hl=fr",
    lu: "27 octobre 2026",
  },
  {
    editeur: "economie.gouv.fr (DGCCRF)",
    titre: "Avis en ligne : attention aux faux commentaires !",
    url: "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/avis-en-ligne-attention-aux-faux-commentaires",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Google for Developers",
    titre: "Identifiants de lieu, avec l'outil de recherche d'ID de lieu",
    url: "https://developers.google.com/maps/documentation/places/web-service/place-id?hl=fr",
    lu: "27 octobre 2026",
  },
];

const QrCodeAvisGoogle = () => {
  const [saisie, setSaisie] = useState("");
  const [nom, setNom] = useState("Boulangerie Martin");
  const [svg, setSvg] = useState("");
  const res = useMemo(() => lienAvisGoogle(saisie), [saisie]);
  const lien = res.ok ? res.lien : "";

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="qr code avis google, générer qr code laisser un avis google, lien avis google, affiche avis google, place id avis"
      nomAppli="Générateur de QR code pour avis Google"
      h1="QR code pour recevoir des avis Google"
      chapeau="Collez le lien d'avis copié depuis votre fiche d'établissement Google, ou son identifiant de lieu : vous obtenez le QR code qui ouvre la fenêtre d'avis, et une petite affiche « Votre avis compte » prête à imprimer."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start print:hidden">
        <div className="order-first lg:order-last lg:sticky lg:top-4">
          <QrApercu
            texte={lien}
            nomFichier="qr-avis-google"
            id="qr-avis"
            vide="Collez votre lien d'avis."
            onRendu={(s) => setSvg(s)}
            actions={
              <Bouton secondaire onClick={() => window.print()} disabled={!svg}>
                Imprimer l'affiche
              </Bouton>
            }
          />
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Lien d'avis Google">
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Lien d'avis Google ou identifiant de lieu</span>
            <input
              id="champ-avis"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="https://g.page/r/…/review ou ChIJ…"
              className={classeChamp}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          {"erreur" in res && res.erreur && (
            <p role="status" className="text-sm text-amber-300">
              {"erreur" in res ? res.erreur : ""}
            </p>
          )}
          {res.ok && (
            <div className="rounded-lg border border-neutral-800 p-4 space-y-2 text-sm min-w-0">
              <p role="status" className="text-neutral-300">
                {res.remarque}
              </p>
              <p className="text-neutral-400">
                Adresse encodée : <span id="lien-avis" className="text-neutral-100 [overflow-wrap:anywhere]">{lien}</span>
              </p>
              <Bouton secondaire onClick={() => window.open(lien, "_blank", "noopener")}>
                Ouvrir le lien pour vérifier
              </Bouton>
            </div>
          )}
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Nom de l'établissement (sur l'affiche)</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} className={classeChamp} autoComplete="organization" />
          </label>
          <p className="text-sm text-neutral-500">
            L'affiche ne promet aucune contrepartie : Google interdit de récompenser un avis. Voir les règles plus bas.
          </p>
        </form>
      </div>

      {/* Affiche imprimée */}
      <div className="hidden print:block text-black">
        <div className="mx-auto mt-6 w-[14cm] border-2 border-black rounded-2xl p-10 text-center">
          <p className="text-4xl font-semibold">Votre avis compte</p>
          {nom && <p className="mt-2 text-xl [overflow-wrap:anywhere]">{nom}</p>}
          {svg && <div className="mx-auto mt-8 w-[8cm] [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />}
          <p className="mt-8 text-lg">Scannez ce code avec l'appareil photo de votre téléphone</p>
          <p className="text-lg">pour laisser un avis sur Google.</p>
          <p className="mt-4 text-base">Merci de votre visite.</p>
        </div>
      </div>

      <Section titre="Trouver le lien d'avis de votre fiche d'établissement">
        <p>
          L'aide Google décrit la marche à suivre, à faire depuis un navigateur sur ordinateur (le lien et le QR code
          d'avis ne se génèrent pas depuis un mobile) :
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>connectez-vous à votre fiche d'établissement sur business.google.com ;</li>
          <li>sélectionnez « Voir les avis », puis l'icône de partage à côté de « Recevoir plus d'avis » ;</li>
          <li>cliquez sur « Copier » pour copier le lien, et collez-le dans le champ ci-dessus.</li>
        </ol>
        <p>
          Google propose aussi, au même endroit, son propre QR code à enregistrer par un clic droit. Il fonctionne très
          bien. Cette page sert à aller plus loin : un SVG net pour l'imprimeur, des couleurs, et une affiche prête à
          poser au comptoir.
        </p>
        <p>
          <strong>Sans accès à la fiche</strong> (fiche gérée par une agence, accès perdu), l'identifiant de lieu
          dépanne. C'est une suite de caractères qui commence souvent par « ChIJ ». Google en publie un outil de recherche
          dans sa documentation pour développeurs : tapez le nom de l'établissement, copiez l'identifiant, collez-le
          ici. L'outil construit alors le lien{" "}
          <code className="text-sky-300 [overflow-wrap:anywhere]">https://search.google.com/local/writereview?placeid=…</code>,
          un format largement utilisé mais pas décrit dans l'aide de la fiche : scannez le code pour vérifier qu'il ouvre
          bien la fenêtre d'avis.
        </p>
      </Section>

      <Section titre="Demander des avis sans enfreindre les règles">
        <p>
          <strong>Ce que Google interdit.</strong> Le règlement des contenus de Google Maps qualifie d'engagement
          artificiel les avis payés, directement ou en nature, et les supprime. Il interdit aux marchands d'offrir des
          avantages (paiement, remises, produits ou services gratuits) en échange d'un avis, de solliciter des avis
          positifs de façon sélective, de déconseiller ou d'interdire les avis négatifs, et d'obliger les clients à
          laisser une note ou un avis sur place. Il autorise en revanche à demander ou encourager des avis qui reflètent
          une véritable expérience. L'aide de la fiche ajoute que les avis doivent refléter une expérience réellement
          vécue.
        </p>
        <p>
          <strong>Ce que dit la loi française.</strong> La DGCCRF rappelle que le code de la consommation interdit au
          professionnel de se présenter faussement comme un consommateur, de diffuser ou faire diffuser de faux avis, et
          de modifier des avis pour promouvoir ses produits. Ces faits constituent un délit de pratiques commerciales
          trompeuses, puni de deux ans d'emprisonnement et de 300 000 euros d'amende, montant qui peut être porté, selon les
          avantages tirés du délit, à 10 % du chiffre d'affaires moyen annuel ou à 50 % des dépenses engagées pour la
          pratique ; aider sciemment à les commettre est puni des mêmes peines (articles
          L. 121-2 à L. 121-4 du code de la consommation, cités par la DGCCRF).
        </p>
        <p>
          En pratique : une affiche visible par tous les clients, une phrase neutre (« Votre avis nous aide »), aucune
          contrepartie, et des réponses polies aux avis, y compris négatifs. C'est exactement ce que fait l'affiche
          proposée ici.
        </p>
      </Section>

      <Section titre="Où placer le QR code d'avis">
        <p>
          L'aide Google suggère plusieurs emplacements : sur les reçus, dans les e-mails de remerciement, en fin de
          conversation avec le client, ou imprimé et affiché dans le magasin. Un chevalet près de la caisse, une
          étiquette sur le sac ou la facture, un rappel en bas de votre devis fonctionnent bien : le client scanne quand
          il en a le temps.
        </p>
        <p>
          Imprimez l'affiche en A5 ou en A4 avec le bouton « Imprimer l'affiche » (choisissez « Enregistrer au format
          PDF » pour l'envoyer à un imprimeur). Pour un sac ou un ticket, téléchargez plutôt le SVG et placez-le dans
          votre maquette. Pour un lien vers votre site ou votre menu, le{" "}
          <Link to="/generateur-qr-code/">générateur de QR code</Link> fait le reste, et la{" "}
          <Link to="/qr-code-pdf/">page QR code PDF</Link> aide à partager une carte ou une plaquette.
        </p>
      </Section>
    </PageOutil>
  );
};

export default QrCodeAvisGoogle;
