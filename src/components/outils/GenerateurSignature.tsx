import { ReactNode, useMemo, useRef, useState } from "react";
import { Champ, Bouton } from "@/components/outils/OutilLayout";
import {
  construireSignature,
  signatureTexte,
  DISPOSITIONS,
  Disposition,
  DonneesSignature,
} from "@/lib/signature";
import { cn } from "@/lib/utils";

const COULEURS = ["#1f6feb", "#0f766e", "#b45309", "#be123c", "#6d28d9", "#111111"];

export interface ContexteSignature {
  html: string;
  donnees: DonneesSignature;
  disposition: Disposition;
  /** Affiche un message dans la zone d'état (aria-live) sous les boutons. */
  signaler: (message: string) => void;
}

/**
 * Générateur de signature mail : formulaire, aperçu en direct, copie riche (HTML + texte)
 * et copie du code. Partagé par /signature-mail/, /signature-outlook/ et /signature-gmail/.
 */
export const GenerateurSignature = ({
  exemple,
  dispositionInitiale = "classique",
  messageCopie = "Signature copiée. Collez-la (Ctrl + V ou Cmd + V) dans le champ Signature de votre messagerie.",
  boutonsApercu,
  sousApercu,
  aideMention = "Mentions d'identification de l'entreprise, voir plus bas.",
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
  const [d, setD] = useState<DonneesSignature>(exemple);
  const [disp, setDisp] = useState<Disposition>(dispositionInitiale);
  const [etat, setEtat] = useState("");
  const apercu = useRef<HTMLDivElement>(null);
  const html = useMemo(() => construireSignature(d, disp), [d, disp]);
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
          "text/plain": new Blob([signatureTexte(d)], { type: "text/plain" }),
        }),
      ]);
      setEtat(messageCopie);
    } catch {
      setEtat(
        copierParSelection()
          ? messageCopie
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
          {boutonsApercu?.(ctx)}
        </div>
        <p id="etat-copie" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem]">
          {etat}
        </p>
        {sousApercu?.(ctx)}
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
                className="w-12 h-12 bg-transparent border-0 p-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <Champ
          label="Ligne légale (facultatif)"
          value={d.mention}
          onChange={maj("mention")}
          placeholder="Atelier Martin EI · Siren 000 000 000 · RCS Lyon"
          aide={aideMention}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <Bouton onClick={copier}>Copier la signature</Bouton>
          <Bouton secondaire onClick={() => setD({ ...exemple, nom: "", poste: "", entreprise: "", mobile: "", email: "", site: "" })}>
            Vider les champs
          </Bouton>
        </div>
      </form>
    </div>
  );
};
