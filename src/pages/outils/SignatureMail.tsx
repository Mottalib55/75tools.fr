import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  OutilLayout,
  EnTete,
  Section,
  Faq,
  faqJsonLd,
  Sources,
  AutresOutils,
  Champ,
  Bouton,
  QuestionFaq,
} from "@/components/outils/OutilLayout";
import {
  construireSignature,
  signatureTexte,
  DISPOSITIONS,
  Disposition,
  DonneesSignature,
} from "@/lib/signature";
import { cn } from "@/lib/utils";

const URL_PAGE = "https://75tools.fr/signature-mail/";
const TITRE = "Signature mail gratuite : générateur pour Gmail et Outlook";
const DESCRIPTION =
  "Signature mail professionnelle gratuite : nom, poste, photo, liens, couleur, aperçu en direct, copie en un clic pour Gmail, Outlook et Apple Mail. Sans compte.";

const EXEMPLE: DonneesSignature = {
  nom: "Camille Martin",
  poste: "Consultante en recrutement",
  entreprise: "Atelier Martin",
  telephone: "",
  mobile: "06 12 34 56 78",
  email: "camille@exemple.fr",
  site: "www.exemple.fr",
  adresse: "",
  linkedin: "",
  lienLibelle: "",
  lienUrl: "",
  couleur: "#1f6feb",
  photoUrl: "",
  logoUrl: "",
  mention: "",
};

const COULEURS = ["#1f6feb", "#0f766e", "#b45309", "#be123c", "#6d28d9", "#111111"];

const FAQ: QuestionFaq[] = [
  {
    q: "Pourquoi ma signature perd sa mise en forme quand je la colle dans Gmail ?",
    r: "Le plus souvent, elle a été collée en texte brut : raccourci Ctrl + Maj + V (Cmd + Maj + V sur Mac), ou copie faite depuis le code HTML au lieu de l'aperçu. Utilisez le bouton « Copier la signature », puis collez avec Ctrl + V (Cmd + V) dans le champ Signature de Gmail. Si le navigateur refuse la copie riche, sélectionnez l'aperçu à la souris et copiez-le : c'est la même mise en forme.",
  },
  {
    q: "Mon logo ne s'affiche pas chez certains destinataires, que faire ?",
    r: "Une image de signature est chargée depuis son adresse au moment où le message est lu. Outlook pour Windows bloque souvent le téléchargement des images tant que l'expéditeur n'est pas approuvé. L'adresse doit commencer par https:// et rester en ligne. Gardez donc toutes vos coordonnées en texte : la signature reste lisible même quand l'image est masquée.",
  },
  {
    q: "Puis-je utiliser une image de ma signature entière, par exemple un visuel fait sur Canva ?",
    r: "C'est possible mais déconseillé. Quand les images sont bloquées, le destinataire ne voit qu'un cadre vide ; le numéro de téléphone et l'adresse e-mail ne sont ni cliquables ni copiables ; et une image lourde alourdit chaque message. Une signature en texte, avec au plus une photo ou un logo, reste lisible partout.",
  },
  {
    q: "Comment avoir une signature pour les nouveaux messages et une autre pour les réponses ?",
    r: "Créez deux signatures, par exemple la complète et une version Compacte faite avec ce générateur. Dans Gmail, les réglages de la section Signature permettent de choisir une signature par défaut pour les nouveaux e-mails et une pour les réponses et transferts. Dans le nouvel Outlook et Outlook sur le web, deux listes jouent le même rôle sous Paramètres, Comptes, Signatures.",
  },
  {
    q: "Mes coordonnées sont-elles envoyées à 75tools ?",
    r: "Non. La signature est construite dans votre navigateur, à partir de ce que vous tapez, et rien n'est transmis ni enregistré sur un serveur. Si vous fermez la page, les champs se vident. Seules la photo et le logo sont chargés depuis l'adresse que vous indiquez, par votre navigateur puis par celui de vos destinataires.",
  },
];

const SignatureMail = () => {
  const [d, setD] = useState<DonneesSignature>(EXEMPLE);
  const [disp, setDisp] = useState<Disposition>("classique");
  const [etat, setEtat] = useState("");
  const apercu = useRef<HTMLDivElement>(null);
  const html = useMemo(() => construireSignature(d, disp), [d, disp]);
  const maj = (k: keyof DonneesSignature) => (v: string) => setD((x) => ({ ...x, [k]: v }));

  const copierParSelection = () => {
    const el = apercu.current;
    if (!el) return false;
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(el);
    sel?.removeAllRanges();
    sel?.addRange(r);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    sel?.removeAllRanges();
    return ok;
  };

  const copier = async () => {
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error("ClipboardItem");
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([signatureTexte(d)], { type: "text/plain" }),
        }),
      ]);
      setEtat("Signature copiée. Collez-la (Ctrl + V ou Cmd + V) dans le champ Signature de votre messagerie.");
    } catch {
      setEtat(
        copierParSelection()
          ? "Signature copiée. Collez-la (Ctrl + V ou Cmd + V) dans le champ Signature de votre messagerie."
          : "Votre navigateur a refusé la copie : sélectionnez l'aperçu à la souris, puis copiez-le."
      );
    }
  };

  const copierCode = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setEtat("Code HTML copié. À coller dans un outil qui accepte du HTML (Thunderbird, outil de signature d'entreprise).");
    } catch {
      setEtat("Votre navigateur a refusé la copie du code.");
    }
  };

  return (
    <OutilLayout>
      <SEO
        exactTitle
        title={TITRE}
        description={DESCRIPTION}
        keywords="signature mail, signature outlook, générateur signature mail, signature mail gmail, signature email professionnelle"
        url={URL_PAGE}
        locale="fr_FR"
        imageAlt="Générateur de signature mail gratuit de 75tools"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Générateur de signature mail",
            url: URL_PAGE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Navigateur web",
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            description: DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: "75tools", url: "https://75tools.fr/" },
          },
          faqJsonLd(FAQ),
        ]}
      />

      <EnTete
        titre="Générateur de signature mail gratuit"
        chapeau="Remplissez vos coordonnées, choisissez une mise en page, puis copiez la signature : elle se colle telle quelle dans Gmail, Outlook ou Apple Mail. Tout se passe dans votre navigateur."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
        {/* Aperçu et copie : en premier sur téléphone */}
        <div className="order-first lg:order-last lg:sticky lg:top-4 space-y-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mise en page">
            {DISPOSITIONS.map((x) => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={disp === x.id}
                title={x.detail}
                onClick={() => setDisp(x.id)}
                className={cn(
                  "h-9 px-3 rounded-md text-sm border whitespace-nowrap",
                  disp === x.id
                    ? "border-sky-400 text-white bg-neutral-900"
                    : "border-neutral-700 text-neutral-400 hover:text-white"
                )}
              >
                {x.nom}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-white p-4 sm:p-6 overflow-x-auto">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-3 select-none" aria-hidden="true">
              Aperçu dans un e-mail
            </p>
            <div ref={apercu} id="apercu-signature" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={copier}>Copier la signature</Bouton>
            <Bouton secondaire onClick={copierCode}>
              Copier le code HTML
            </Bouton>
          </div>
          <p id="etat-copie" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
            {etat}
          </p>
        </div>

        {/* Formulaire */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()} aria-label="Vos coordonnées">
          <div className="grid gap-4 sm:grid-cols-2">
            <Champ label="Prénom et nom" value={d.nom} onChange={maj("nom")} autoComplete="name" />
            <Champ label="Poste" value={d.poste} onChange={maj("poste")} autoComplete="organization-title" />
            <Champ label="Entreprise" value={d.entreprise} onChange={maj("entreprise")} autoComplete="organization" />
            <Champ label="E-mail" type="email" value={d.email} onChange={maj("email")} autoComplete="email" />
            <Champ label="Mobile" type="tel" value={d.mobile} onChange={maj("mobile")} autoComplete="tel" />
            <Champ label="Téléphone fixe" type="tel" value={d.telephone} onChange={maj("telephone")} />
            <Champ label="Site web" value={d.site} onChange={maj("site")} placeholder="www.votre-site.fr" />
            <Champ label="Adresse (facultatif)" value={d.adresse} onChange={maj("adresse")} placeholder="12 rue des Lilas, 69003 Lyon" />
            <Champ label="Profil LinkedIn" value={d.linkedin} onChange={maj("linkedin")} placeholder="linkedin.com/in/..." />
            <Champ label="Autre lien : adresse" value={d.lienUrl} onChange={maj("lienUrl")} placeholder="Prise de rendez-vous, portfolio…" />
            <Champ label="Autre lien : texte affiché" value={d.lienLibelle} onChange={maj("lienLibelle")} placeholder="Prendre rendez-vous" />
            <Champ
              label="Photo : adresse de l'image"
              value={d.photoUrl}
              onChange={maj("photoUrl")}
              placeholder="https://…/photo.jpg"
              aide="Image déjà en ligne, carrée de préférence."
            />
            <Champ
              label="Logo : adresse de l'image"
              value={d.logoUrl}
              onChange={maj("logoUrl")}
              placeholder="https://…/logo.png"
              aide="Utilisé à gauche si pas de photo, ou dessous."
            />
            <div>
              <span className="block text-sm text-neutral-300 mb-1">Couleur</span>
              <div className="flex items-center gap-2 h-12">
                {COULEURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Couleur ${c}`}
                    onClick={() => maj("couleur")(c)}
                    className={cn("w-8 h-8 rounded-full border-2", d.couleur === c ? "border-white" : "border-transparent")}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color"
                  aria-label="Autre couleur"
                  value={d.couleur}
                  onChange={(e) => maj("couleur")(e.target.value)}
                  className="w-10 h-8 bg-transparent border-0 p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <Champ
            label="Ligne légale (facultatif)"
            value={d.mention}
            onChange={maj("mention")}
            placeholder="Atelier Martin EI · Siren 000 000 000 · RCS Lyon"
            aide="Mentions d'identification de l'entreprise, voir plus bas."
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Bouton onClick={copier}>Copier la signature</Bouton>
            <Bouton secondaire onClick={() => setD({ ...EXEMPLE, nom: "", poste: "", entreprise: "", mobile: "", email: "", site: "" })}>
              Vider les champs
            </Bouton>
          </div>
        </form>
      </div>

      <Section id="installer" titre="Installer la signature, messagerie par messagerie">
        <p>
          Copiez d'abord la signature avec le bouton ci-dessus. La copie emporte la mise en forme : il suffit
          ensuite de la coller dans la zone de signature de votre messagerie, avec Ctrl + V sur Windows ou Cmd + V
          sur Mac.
        </p>
        <h3>Gmail (ordinateur)</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Ouvrez Gmail, cliquez sur la roue dentée en haut à droite, puis sur « Voir tous les paramètres ».</li>
          <li>Dans l'onglet Général, descendez jusqu'à la section « Signature » et cliquez sur « Créer ».</li>
          <li>Donnez un nom à la signature, puis collez-la dans le champ qui s'ouvre.</li>
          <li>Choisissez-la comme signature par défaut pour les nouveaux e-mails et, si vous le voulez, pour les réponses.</li>
          <li>Tout en bas de la page, cliquez sur « Enregistrer les modifications ».</li>
        </ol>
        <p>
          Google limite une signature à 10 000 caractères, image comprise : c'est pourquoi ce générateur appelle
          la photo et le logo par leur adresse au lieu de les insérer dans le code.
        </p>
        <h3>Nouvel Outlook pour Windows et Outlook sur le web</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Ouvrez les Paramètres (roue dentée), puis Comptes et Signatures.</li>
          <li>Choisissez le compte si vous en avez plusieurs, sélectionnez « Ajouter une signature » et nommez-la.</li>
          <li>Collez la signature dans la zone d'édition.</li>
          <li>Choisissez-la pour les nouveaux messages et pour les réponses et transferts, puis enregistrez.</li>
        </ol>
        <h3>Outlook classique pour Windows (Microsoft 365, Outlook 2021, 2024)</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Menu Fichier, puis Options, puis Courrier, puis le bouton « Signatures… ».</li>
          <li>Cliquez sur « Nouveau », nommez la signature et collez-la dans le cadre « Modifier la signature ».</li>
          <li>À droite, sous « Choisir la signature par défaut », sélectionnez-la pour les nouveaux messages et les réponses, puis OK.</li>
        </ol>
        <p>
          Outlook classique télécharge rarement les images d'un expéditeur inconnu sans confirmation : c'est
          normal, et la signature reste lisible parce que tout le texte est du vrai texte.
        </p>
        <h3>Apple Mail sur Mac</h3>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Dans Mail, menu Mail, puis Réglages, puis l'onglet Signatures.</li>
          <li>Sélectionnez le compte dans la colonne de gauche, cliquez sur le bouton + et nommez la signature.</li>
          <li>Décochez « Toujours utiliser ma police par défaut des messages », sinon Mail retire la mise en forme.</li>
          <li>Collez la signature dans la colonne de droite. Elle est enregistrée aussitôt.</li>
        </ol>
        <p>
          Les marches à suivre ci-dessus suivent l'aide officielle de chaque éditeur, citée en bas de page ; les
          intitulés de menu peuvent changer d'une version à l'autre.
        </p>
      </Section>

      <Section titre="Ce que contient une bonne signature professionnelle">
        <p>
          Une signature sert à être rappelé, pas à décorer. Quatre à six lignes suffisent : <strong>nom</strong>,{" "}
          <strong>poste et entreprise</strong>, <strong>un numéro de téléphone</strong> qu'on peut toucher depuis un
          téléphone, <strong>l'adresse du site</strong>, et au plus un lien utile, comme une page de prise de
          rendez-vous ou un profil LinkedIn. Le reste (citation, bannière, cinq icônes de réseaux) dilue
          l'information et s'affiche mal sur un petit écran.
        </p>
        <p>
          Écrivez le numéro tel que vous le diriez au téléphone (06 12 34 56 78) : le générateur crée en coulisse
          un lien au format international (+33 6…), que les téléphones savent composer depuis l'étranger. La
          couleur ne s'applique qu'au nom, aux liens et au filet, pour rester lisible sur un fond clair comme
          sombre.
        </p>
        <p>
          Pour la photo ou le logo, utilisez une image <strong>déjà en ligne</strong>, à une adresse en https : la
          page de votre site, un hébergement d'images, ou la photo de votre profil{" "}
          <Link to="/mycard/">MyCard</Link>. Une image de 160 × 160 pixels pour la photo, ou d'environ 280 pixels de
          large pour un logo, s'affiche nettement sur les écrans haute définition à la taille réduite de la
          signature.
        </p>
      </Section>

      <Section titre="Faut-il des mentions légales dans un e-mail professionnel ?">
        <p>
          Service Public range les « courriers (papier ou emails commerciaux) » parmi les documents commerciaux
          d'une entreprise, qui doivent comporter des mentions obligatoires. La fiche ne dresse pas de liste propre
          à l'e-mail ; pour les documents publicitaires d'une société, elle cite le numéro Siren, la mention RCS
          suivie de la ville du greffe (activité commerciale) ou la mention RNE (activité artisanale, libérale ou
          agricole), le lieu du siège et, pour une SARL, une SAS ou une SA, le montant du capital.
        </p>
        <p>
          Pour un entrepreneur individuel, micro-entrepreneur compris, Service Public rappelle depuis le
          nouveau statut de mai 2022 que le nom doit être précédé ou suivi de « entrepreneur individuel » ou
          « EI » sur les documents commerciaux, correspondances comprises. Le champ « Ligne légale » sert à cela :
          par exemple « Camille Martin EI · Siren 000 000 000 ». En cas de doute sur votre situation, la fiche de
          Service Public correspondant à votre statut fait foi.
        </p>
      </Section>

      <Faq faq={FAQ} />

      <Sources
        sources={[
          { editeur: "Aide Gmail (Google)", titre: "Créer une signature Gmail", url: "https://support.google.com/mail/answer/8395?hl=fr", lu: "25 octobre 2026" },
          { editeur: "Support Microsoft", titre: "Comment ajouter et modifier une signature électronique dans Outlook", url: "https://support.microsoft.com/fr-fr/outlook/mail/how-to-add-and-change-an-email-signature-in-outlook", lu: "25 octobre 2026" },
          { editeur: "Assistance Apple", titre: "Créer et utiliser des signatures d'e-mail dans Mail sur Mac", url: "https://support.apple.com/fr-fr/guide/mail/mail11943/mac", lu: "25 octobre 2026" },
          { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société (vérifié le 8 décembre 2025)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "25 octobre 2026" },
          { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux (actualité du 30 juin 2022)", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "25 octobre 2026" },
        ]}
      />

      <AutresOutils courant="/signature-mail/" />
    </OutilLayout>
  );
};

export default SignatureMail;
