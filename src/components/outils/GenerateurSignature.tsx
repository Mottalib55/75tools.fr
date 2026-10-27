import { ReactNode, useMemo, useRef, useState } from "react";
import { Champ, Bouton } from "@/components/outils/OutilLayout";
import {
  construireSignature,
  signatureTexte,
  DISPOSITIONS,
  Disposition,
  DonneesSignature,
} from "@/lib/signature";
import { useLangue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const COULEURS = ["#1f6feb", "#0f766e", "#b45309", "#be123c", "#6d28d9", "#111111"];

/** Textes de l'interface du générateur, dans les deux langues (la langue vient de PageOutil). */
const T = {
  fr: {
    miseEnPage: "Mise en page",
    apercu: "Aperçu dans un e-mail",
    copier: "Copier la signature",
    copierCode: "Copier le code HTML",
    copie: "Signature copiée. Collez-la (Ctrl + V ou Cmd + V) dans le champ Signature de votre messagerie.",
    refus: "Votre navigateur a refusé la copie : sélectionnez l'aperçu à la souris, puis copiez-le.",
    codeCopie: "Code HTML copié. À coller dans un outil qui accepte du HTML (Thunderbird, outil de signature d'entreprise).",
    refusCode: "Votre navigateur a refusé la copie du code.",
    coordonnees: "Vos coordonnées",
    nom: "Prénom et nom",
    poste: "Poste",
    entreprise: "Entreprise",
    email: "E-mail",
    mobile: "Mobile",
    fixe: "Téléphone fixe",
    site: "Site web",
    sitePh: "www.votre-site.fr",
    adresse: "Adresse (facultatif)",
    adressePh: "12 rue des Lilas, 69003 Lyon",
    linkedin: "Profil LinkedIn",
    autreUrl: "Autre lien : adresse",
    autreUrlPh: "Prise de rendez-vous, portfolio…",
    autreTexte: "Autre lien : texte affiché",
    autreTextePh: "Prendre rendez-vous",
    photo: "Photo : adresse de l'image",
    photoAide: "Image déjà en ligne, carrée de préférence.",
    logo: "Logo : adresse de l'image",
    logoAide: "Utilisé à gauche si pas de photo, ou dessous.",
    couleur: "Couleur",
    couleurX: (c: string) => `Couleur ${c}`,
    autreCouleur: "Autre couleur",
    mention: "Ligne légale (facultatif)",
    mentionPh: "Atelier Martin EI · Siren 000 000 000 · RCS Lyon",
    mentionAide: "Mentions d'identification de l'entreprise, voir plus bas.",
    vider: "Vider les champs",
  },
  en: {
    miseEnPage: "Layout",
    apercu: "Preview in an email",
    copier: "Copy signature",
    copierCode: "Copy HTML code",
    copie: "Signature copied. Paste it (Ctrl + V or Cmd + V) into the signature box of your email app.",
    refus: "Your browser blocked the copy: select the preview with your mouse, then copy it.",
    codeCopie: "HTML code copied. Paste it into a tool that accepts HTML (Thunderbird, a company signature manager).",
    refusCode: "Your browser blocked copying the code.",
    coordonnees: "Your details",
    nom: "Full name",
    poste: "Job title",
    entreprise: "Company",
    email: "Email",
    mobile: "Mobile",
    fixe: "Office phone",
    site: "Website",
    sitePh: "www.your-site.com",
    adresse: "Address (optional)",
    adressePh: "12 rue des Lilas, 69003 Lyon",
    linkedin: "LinkedIn profile",
    autreUrl: "Other link: address",
    autreUrlPh: "Booking page, portfolio…",
    autreTexte: "Other link: text shown",
    autreTextePh: "Book a meeting",
    photo: "Photo: image address",
    photoAide: "An image already online, ideally square.",
    logo: "Logo: image address",
    logoAide: "Shown on the left if there is no photo, or below.",
    couleur: "Colour",
    couleurX: (c: string) => `Colour ${c}`,
    autreCouleur: "Other colour",
    mention: "Legal line (optional)",
    mentionPh: "Jane Smith EI · SIREN 000 000 000",
    mentionAide: "French business identifiers (SIREN, RCS, EI), see below.",
    vider: "Clear fields",
  },
};

export interface ContexteSignature {
  html: string;
  donnees: DonneesSignature;
  disposition: Disposition;
  /** Affiche un message dans la zone d'état (aria-live) sous les boutons. */
  signaler: (message: string) => void;
}

/**
 * Générateur de signature mail : formulaire, aperçu en direct (`data-resultat`), copie riche
 * (HTML + texte) et copie du code. Partagé par les pages signature mail, Outlook et Gmail, en
 * français et en anglais : la signature produite est écrite dans la langue de la page.
 * Mise en page : sur téléphone, les cinq premiers champs, puis l'aperçu, puis le reste du
 * formulaire ; sur ordinateur, le formulaire à gauche et l'aperçu fixe à droite.
 */
export const GenerateurSignature = ({
  exemple,
  dispositionInitiale = "classique",
  messageCopie,
  boutonsApercu,
  sousApercu,
  aideMention,
}: {
  exemple: DonneesSignature;
  dispositionInitiale?: Disposition;
  messageCopie?: string;
  /** Boutons ajoutés après « Copier le code HTML » (ex. téléchargement .htm). */
  boutonsApercu?: (ctx: ContexteSignature) => ReactNode;
  /** Bloc affiché sous la zone d'état de la copie (ex. compteur de caractères). */
  sousApercu?: (ctx: ContexteSignature) => ReactNode;
  /** Aide sous le champ « Ligne légale ». */
  aideMention?: string;
}) => {
  const lang = useLangue();
  const t = T[lang];
  const msgCopie = messageCopie ?? t.copie;
  const [d, setD] = useState<DonneesSignature>(exemple);
  const [disp, setDisp] = useState<Disposition>(dispositionInitiale);
  const [etat, setEtat] = useState("");
  const apercu = useRef<HTMLDivElement>(null);
  const html = useMemo(() => construireSignature(d, disp, lang), [d, disp, lang]);
  const maj = (k: keyof DonneesSignature) => (v: string) => setD((x) => ({ ...x, [k]: v }));
  const ctx: ContexteSignature = { html, donnees: d, disposition: disp, signaler: setEtat };

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
          "text/plain": new Blob([signatureTexte(d, lang)], { type: "text/plain" }),
        }),
      ]);
      setEtat(msgCopie);
    } catch {
      setEtat(copierParSelection() ? msgCopie : t.refus);
    }
  };

  const copierCode = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setEtat(t.codeCopie);
    } catch {
      setEtat(t.refusCode);
    }
  };

  return (
    <div className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start">
      {/* Premiers champs : en tête sur téléphone, en haut à gauche sur ordinateur */}
      <div className="grid gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-1">
        <Champ label={t.nom} value={d.nom} onChange={maj("nom")} autoComplete="name" />
        <Champ label={t.poste} value={d.poste} onChange={maj("poste")} autoComplete="organization-title" />
        <Champ label={t.entreprise} value={d.entreprise} onChange={maj("entreprise")} autoComplete="organization" />
        <Champ label={t.mobile} type="tel" value={d.mobile} onChange={maj("mobile")} autoComplete="tel" />
      </div>

      {/* Aperçu et copie : juste sous les premiers champs sur téléphone, colonne de droite sur ordinateur */}
      <div data-resultat className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4 space-y-3">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.miseEnPage}>
          {DISPOSITIONS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={disp === x.id}
              title={x.detail[lang]}
              onClick={() => setDisp(x.id)}
              className={cn(
                "h-9 px-3 rounded-md text-sm border whitespace-nowrap",
                disp === x.id
                  ? "border-sky-400 text-white bg-neutral-900"
                  : "border-neutral-700 text-neutral-400 hover:text-white"
              )}
            >
              {x.nom[lang]}
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-white p-4 sm:p-6 overflow-x-auto">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-3 select-none" aria-hidden="true">
            {t.apercu}
          </p>
          <div ref={apercu} id="apercu-signature" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={copier}>{t.copier}</Bouton>
          <Bouton secondaire onClick={copierCode}>
            {t.copierCode}
          </Bouton>
          {boutonsApercu?.(ctx)}
        </div>
        <p id="etat-copie" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
          {etat}
        </p>
        {sousApercu?.(ctx)}
      </div>

      {/* Suite du formulaire */}
      <form className="space-y-4 lg:col-start-1 lg:row-start-2" onSubmit={(e) => e.preventDefault()} aria-label={t.coordonnees}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label={t.email} type="email" value={d.email} onChange={maj("email")} autoComplete="email" />
          <Champ label={t.fixe} type="tel" value={d.telephone} onChange={maj("telephone")} />
          <Champ label={t.site} value={d.site} onChange={maj("site")} placeholder={t.sitePh} />
          <Champ label={t.adresse} value={d.adresse} onChange={maj("adresse")} placeholder={t.adressePh} />
          <Champ label={t.linkedin} value={d.linkedin} onChange={maj("linkedin")} placeholder="linkedin.com/in/..." />
          <Champ label={t.autreUrl} value={d.lienUrl} onChange={maj("lienUrl")} placeholder={t.autreUrlPh} />
          <Champ label={t.autreTexte} value={d.lienLibelle} onChange={maj("lienLibelle")} placeholder={t.autreTextePh} />
          <Champ label={t.photo} value={d.photoUrl} onChange={maj("photoUrl")} placeholder="https://…/photo.jpg" aide={t.photoAide} />
          <Champ label={t.logo} value={d.logoUrl} onChange={maj("logoUrl")} placeholder="https://…/logo.png" aide={t.logoAide} />
          <div>
            <span className="block text-sm text-neutral-300 mb-1">{t.couleur}</span>
            <div className="flex items-center gap-2 h-12">
              {COULEURS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={t.couleurX(c)}
                  onClick={() => maj("couleur")(c)}
                  className={cn("w-8 h-8 rounded-full border-2", d.couleur === c ? "border-white" : "border-transparent")}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                aria-label={t.autreCouleur}
                value={d.couleur}
                onChange={(e) => maj("couleur")(e.target.value)}
                className="w-12 h-12 bg-transparent border-0 p-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <Champ
          label={t.mention}
          value={d.mention}
          onChange={maj("mention")}
          placeholder={t.mentionPh}
          aide={aideMention ?? t.mentionAide}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <Bouton onClick={copier}>{t.copier}</Bouton>
          <Bouton
            secondaire
            onClick={() => setD({ ...exemple, nom: "", poste: "", entreprise: "", mobile: "", email: "", site: "", telephone: "", lienUrl: "", lienLibelle: "" })}
          >
            {t.vider}
          </Bouton>
        </div>
      </form>
    </div>
  );
};
