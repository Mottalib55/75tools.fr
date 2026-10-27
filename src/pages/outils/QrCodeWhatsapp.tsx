import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeSelect, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, Bouton, QuestionFaq } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { PAYS_WHATSAPP, numeroInternational, lienWhatsapp } from "@/lib/qr-formats";

const HREF = "/qr-code-whatsapp/";
const TITRE = "QR code WhatsApp gratuit : lien wa.me et message prérempli";
const DESCRIPTION =
  "QR code WhatsApp gratuit : votre numéro mis au format international, un message prérempli, le lien wa.me à copier et son QR code en PNG ou SVG, sans compte.";

const FAQ: QuestionFaq[] = [
  {
    q: "Mon numéro commence par 06, qu'est-ce que je dois mettre dans le lien ?",
    r: "Le numéro au format international, sans le +, sans le 0 initial, sans espace ni tiret : 06 12 34 56 78 devient 33612345678, et le lien https://wa.me/33612345678. C'est la règle donnée par l'aide WhatsApp. L'outil fait la conversion tout seul selon l'indicatif choisi ; si vous tapez déjà +33 ou 0033, il garde votre indicatif.",
  },
  {
    q: "Les accents et les retours à la ligne de mon message passent-ils ?",
    r: "Oui. WhatsApp demande un message « encodé au format URL » : chaque caractère qui n'a pas sa place dans une adresse web est remplacé par un code, par exemple %C3%A9 pour é et %0A pour un retour à la ligne. L'outil fait cet encodage, et WhatsApp affiche le texte d'origine dans le champ de saisie. La personne peut le modifier avant d'appuyer sur Envoyer.",
  },
  {
    q: "La personne qui scanne le code voit-elle mon numéro de téléphone ?",
    r: "Oui. Le numéro est écrit en clair dans le lien, donc dans le QR code, et la discussion s'ouvre avec lui. N'affichez pas le code d'un numéro personnel dans un lieu public si vous ne voulez pas le diffuser. Pour une activité, utilisez plutôt un numéro dédié, par exemple celui de votre compte WhatsApp Business.",
  },
  {
    q: "Je peux changer le message prérempli après avoir imprimé le code ?",
    r: "Non, pas avec un lien wa.me : le message fait partie de l'adresse, il faut générer un nouveau code. La documentation de Meta pour la plateforme WhatsApp Business décrit des QR codes et liens courts dont le message prérempli, limité à 140 caractères, peut être modifié ou supprimé à tout moment. Ils se créent depuis l'API WhatsApp Business ou le gestionnaire d'entreprise de Meta, pas avec cet outil.",
  },
  {
    q: "Le lien wa.me fonctionne-t-il sur un ordinateur ?",
    r: "Oui. D'après l'aide WhatsApp, les liens de discussion fonctionnent sur téléphone et sur WhatsApp Web. Sur ordinateur, cliquez-le depuis un navigateur où WhatsApp Web est connecté pour que la discussion s'ouvre. Le QR code, lui, est pensé pour le téléphone : on le scanne avec l'appareil photo et la discussion s'ouvre dans l'application.",
  },
];

const SOURCES = [
  {
    editeur: "Pages d'aide WhatsApp",
    titre: "Comment utiliser les liens clic vers WhatsApp",
    url: "https://faq.whatsapp.com/5913398998672934/?locale=fr_FR",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Meta for Developers",
    titre: "QR Codes and Short Links (plateforme WhatsApp Business)",
    url: "https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes",
    lu: "27 octobre 2026",
  },
];

const QrCodeWhatsapp = () => {
  const [codePays, setCodePays] = useState("33");
  const [saisie, setSaisie] = useState("06 12 34 56 78");
  const [message, setMessage] = useState("Bonjour, je vous contacte au sujet de votre annonce.");
  const [copie, setCopie] = useState("");
  const pays = PAYS_WHATSAPP.find((p) => p.code === codePays) ?? PAYS_WHATSAPP[0];
  const { numero, remarque } = useMemo(() => numeroInternational(saisie, pays), [saisie, pays]);
  const lien = useMemo(() => {
    if (!numero && !message.trim()) return "";
    if (!numero && saisie.trim()) return "";
    return lienWhatsapp(numero, message);
  }, [numero, message, saisie]);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(lien);
      setCopie("Lien copié.");
    } catch {
      setCopie("La copie a été refusée par le navigateur : sélectionnez le lien et copiez-le à la main.");
    }
    setTimeout(() => setCopie(""), 4000);
  };

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="qr code whatsapp, créer lien whatsapp, lien wa.me, créer lien et qr code whatsapp, message prérempli whatsapp"
      nomAppli="Générateur de lien et de QR code WhatsApp"
      h1="Créer un lien et un QR code WhatsApp"
      chapeau="Indiquez votre numéro et, si vous voulez, un message de départ : vous obtenez le lien wa.me qui ouvre une discussion avec vous, et son QR code. Pas besoin que l'autre personne ait enregistré votre numéro."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div className="order-first lg:order-last lg:sticky lg:top-4">
          <QrApercu texte={lien} nomFichier={`qr-whatsapp-${numero || "message"}`} id="qr-whatsapp" vide="Saisissez votre numéro." />
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Lien WhatsApp">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Indicatif du pays</span>
              <select id="champ-pays" value={codePays} onChange={(e) => setCodePays(e.target.value)} className={classeSelect}>
                {PAYS_WHATSAPP.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Numéro WhatsApp</span>
              <input
                id="champ-numero"
                type="tel"
                inputMode="tel"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="06 12 34 56 78"
                className={classeChamp}
                autoComplete="tel"
              />
            </label>
          </div>
          {remarque && (
            <p role="status" className="text-sm text-neutral-400">
              {remarque}
            </p>
          )}
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">Message prérempli (facultatif)</span>
            <textarea
              id="champ-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={classeZoneTexte}
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Il s'affiche dans le champ de saisie ; la personne l'envoie ou le modifie. Sans numéro, le lien propose de
              choisir un contact à qui envoyer ce message.
            </span>
          </label>

          <div className="rounded-lg border border-neutral-800 p-4 space-y-3 min-w-0">
            <p className="text-sm text-neutral-400">Votre lien WhatsApp</p>
            <p id="lien-whatsapp" className="text-neutral-100 [overflow-wrap:anywhere] text-sm">
              {lien || "Le lien apparaîtra ici."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={copier} disabled={!lien}>
                Copier le lien
              </Bouton>
              <Bouton secondaire onClick={() => window.open(lien, "_blank", "noopener")} disabled={!lien}>
                Tester le lien
              </Bouton>
            </div>
            {copie && (
              <p role="status" className="text-sm text-sky-300">
                {copie}
              </p>
            )}
          </div>
        </form>
      </div>

      <Section titre="Comment est construit un lien wa.me">
        <p>
          L'aide WhatsApp décrit la fonction « Cliquer pour discuter » : un lien de la forme{" "}
          <code className="text-sky-300">https://wa.me/numéro</code> ouvre directement une discussion avec ce numéro,
          même s'il n'est pas dans les contacts de la personne, à condition qu'il corresponde à un compte WhatsApp
          actif. Le numéro s'écrit au format international complet, sans zéro initial, sans parenthèses et sans
          tirets.
        </p>
        <p>
          Pour ajouter un message de départ, on ajoute <code className="text-sky-300">?text=</code> suivi du message
          encodé au format URL. « Bonjour, je réserve une table » devient ainsi{" "}
          <code className="text-sky-300 [overflow-wrap:anywhere]">?text=Bonjour%2C%20je%20r%C3%A9serve%20une%20table</code>. Le
          lien <code className="text-sky-300">https://wa.me/?text=…</code>, sans numéro, ouvre la liste des contacts
          pour choisir à qui envoyer le message : pratique pour faire circuler une invitation ou une annonce.
        </p>
        <p>
          Le générateur convertit le numéro selon l'indicatif choisi. Pour la France et les départements d'outre-mer, le
          0 initial disparaît (0692 à La Réunion devient 262692). Pour les pays dont le numéro national ne commence pas
          par un 0 de préfixe, comme la Côte d'Ivoire, le Sénégal ou le Luxembourg, le numéro est repris tel quel après
          l'indicatif.
        </p>
        <p>
          Le lien ne fonctionne que si le numéro correspond à un compte WhatsApp actif, comme le précise l'aide
          WhatsApp. Et si la personne qui scanne n'utilise pas WhatsApp, le lien ne pourra pas ouvrir de discussion
          chez elle. Indiquez donc aussi votre numéro en clair à côté du code, pour qu'on puisse vous appeler
          ou vous écrire par SMS.
        </p>
      </Section>

      <Section titre="Où afficher votre QR code WhatsApp">
        <p>
          <strong>En vitrine ou au comptoir</strong>, pour prendre des commandes ou des rendez-vous : un message
          prérempli comme « Bonjour, je souhaite réserver pour… » guide la personne et vous fait gagner un échange.
        </p>
        <p>
          <strong>Sur une annonce</strong> (vente de voiture, location, petite annonce imprimée) : le code évite de
          recopier le numéro et le message rappelle de quelle annonce il s'agit, utile si vous en publiez plusieurs.
        </p>
        <p>
          <strong>Sur un flyer, une carte ou un devis</strong> : collez aussi le lien dans votre signature d'e-mail ou
          sur votre site, où il se clique directement. Pour une carte de visite complète, le{" "}
          <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> enregistre toutes vos coordonnées d'un coup.
        </p>
        <p>
          Avant d'imprimer, scannez le code avec un téléphone sur lequel WhatsApp est installé et vérifiez que la
          discussion s'ouvre avec le bon numéro et le bon message. Si vous avez un compte sur la plateforme WhatsApp
          Business, Meta propose aussi ses propres QR codes et liens courts, dont le message se modifie après coup ; la
          documentation de Meta recommande de ne pas en changer la couleur, pour préserver la lisibilité.
        </p>
      </Section>
    </PageOutil>
  );
};

export default QrCodeWhatsapp;
