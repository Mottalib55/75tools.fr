import { ReactNode, useEffect, useRef, useState } from "react";
import { Bouton } from "@/components/outils/OutilLayout";
import { DepotFichiers } from "@/components/outils/PageOutil";
import { formatOctets, telecharger } from "@/lib/fichiers";
import { creerZip } from "@/lib/zip";
import { respirer } from "@/lib/image-lot";
import { locale, useLangue } from "@/lib/langue";

/** Textes de l'interface du lot, dans les deux langues. */
const T = {
  fr: {
    convertir: "Convertir",
    progression: (n: number, total: number, nom: string) => `Image ${n} sur ${total} : ${nom}`,
    illisible: "Image illisible",
    inchange: "poids inchangé",
    pct: (p: string) => `${p} %`,
    enCours: "Traitement en cours…",
    lesN: (action: string, n: number) => `${action} les ${n} images`,
    toutZip: (n: number) => `Tout télécharger (ZIP, ${n} images)`,
    telecharger: "Télécharger",
    vider: "Vider la liste",
    total: (a: string, b: string, e: string) => `Total : ${a} avant, ${b} après (${e}).`,
    fichiers: "Fichiers",
    encoursEl: " · en cours…",
    attenteEl: " · à traiter",
    enregistrer: "Enregistrer",
    retirer: (nom: string) => `Retirer ${nom}`,
    attente: "Vos images converties s'afficheront ici, avec le poids avant et après et un bouton pour les enregistrer.",
  },
  en: {
    convertir: "Convert",
    progression: (n: number, total: number, nom: string) => `Image ${n} of ${total}: ${nom}`,
    illisible: "Unreadable image",
    inchange: "same size",
    pct: (p: string) => `${p}%`,
    enCours: "Processing…",
    lesN: (action: string, n: number) => `${action} ${n} images`,
    toutZip: (n: number) => `Download all (ZIP, ${n} images)`,
    telecharger: "Download",
    vider: "Clear the list",
    total: (a: string, b: string, e: string) => `Total: ${a} before, ${b} after (${e}).`,
    fichiers: "Files",
    encoursEl: " · processing…",
    attenteEl: " · waiting",
    enregistrer: "Save",
    retirer: (nom: string) => `Remove ${nom}`,
    attente: "Your converted images will appear here, with the size before and after and a button to save each one.",
  },
};

/**
 * Liste de fichiers image traités un par un (conversion, redimensionnement) : dépôt, réglages
 * fournis par la page, progression, poids avant et après, téléchargement un par un ou en ZIP.
 */

export interface ResultatImage {
  blob: Blob;
  nom: string; // nom du fichier produit
  detail?: string; // « 4 032 × 3 024 → 1 600 × 1 200 px, qualité 78 % »
}

interface Element {
  id: number;
  fichier: File;
  etat: "attente" | "encours" | "fait" | "erreur";
  resultat?: ResultatImage;
  apercu?: string; // URL d'objet du résultat
  message?: string;
}

export const ImageLot = ({
  accept,
  libelleDepot,
  aideDepot,
  reglages,
  cle,
  traiter,
  libelleAction,
  nomZip,
  avantTraitement,
  idPrefixe = "lot",
  attente,
}: {
  accept: string;
  libelleDepot: string;
  aideDepot?: string;
  reglages?: ReactNode;
  cle: string; // empreinte des réglages : quand elle change, les résultats sont à refaire
  traiter: (f: File) => Promise<ResultatImage>;
  libelleAction?: string;
  nomZip: string;
  avantTraitement?: (fichiers: File[]) => Promise<string | null>; // message d'attente éventuel
  idPrefixe?: string;
  attente?: string; // phrase affichée dans la zone de résultat avant le premier fichier
}) => {
  const lang = useLangue();
  const t = T[lang];
  const action = libelleAction ?? t.convertir;
  const oct = (n: number) => formatOctets(n, lang);
  const [elements, setElements] = useState<Element[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState("");
  const compteur = useRef(0);
  const urls = useRef<Set<string>>(new Set());

  // Libère les aperçus à la fermeture de la page.
  useEffect(
    () => () => {
      urls.current.forEach((u) => URL.revokeObjectURL(u));
      urls.current.clear();
    },
    []
  );

  const liberer = (u?: string) => {
    if (u) {
      URL.revokeObjectURL(u);
      urls.current.delete(u);
    }
  };

  // Réglages modifiés : les résultats ne correspondent plus.
  const cleTraitee = useRef(cle);
  useEffect(() => {
    if (cleTraitee.current === cle) return;
    cleTraitee.current = cle;
    setElements((els) =>
      els.map((e) => {
        if (e.etat !== "fait" && e.etat !== "erreur") return e;
        liberer(e.apercu);
        return { ...e, etat: "attente", resultat: undefined, apercu: undefined, message: undefined };
      })
    );
  }, [cle]);

  // File d'attente : les fichiers sont traités un par un, dans l'ordre, avec les réglages du moment.
  const traiterRef = useRef(traiter);
  traiterRef.current = traiter;
  const avantRef = useRef(avantTraitement);
  avantRef.current = avantTraitement;
  const file = useRef<Element[]>([]);
  const actif = useRef(false);
  const [note, setNote] = useState("");

  const demarrer = async () => {
    if (actif.current) return;
    actif.current = true;
    setEnCours(true);
    let n = 0;
    try {
      if (avantRef.current && file.current.length) {
        const m = await avantRef.current(file.current.map((e) => e.fichier));
        setNote(m ?? "");
      }
      while (file.current.length) {
        const el = file.current.shift()!;
        n++;
        setProgression(t.progression(n, n + file.current.length, el.fichier.name));
        setElements((els) => els.map((e) => (e.id === el.id ? { ...e, etat: "encours", message: undefined } : e)));
        await respirer();
        try {
          const r = await traiterRef.current(el.fichier);
          const apercu = URL.createObjectURL(r.blob);
          urls.current.add(apercu);
          setElements((els) => {
            if (!els.some((e) => e.id === el.id)) {
              liberer(apercu);
              return els;
            }
            return els.map((e) => (e.id === el.id ? { ...e, etat: "fait", resultat: r, apercu, message: undefined } : e));
          });
        } catch (err) {
          const message = err instanceof Error && err.message ? err.message : t.illisible;
          setElements((els) => els.map((e) => (e.id === el.id ? { ...e, etat: "erreur", message } : e)));
        }
      }
    } finally {
      actif.current = false;
      setEnCours(false);
      setProgression("");
      setNote("");
    }
  };

  /** Les fichiers ajoutés sont traités tout de suite avec les réglages en place. */
  const ajouter = (fichiers: File[]) => {
    const nouveaux: Element[] = fichiers.map((fichier) => ({ id: ++compteur.current, fichier, etat: "attente" }));
    setElements((els) => [...els, ...nouveaux]);
    file.current.push(...nouveaux);
    demarrer();
  };

  /** Bouton : relance les fichiers à refaire (réglages changés ou erreur). */
  const lancer = () => {
    const enFile = new Set(file.current.map((e) => e.id));
    file.current.push(...elements.filter((e) => (e.etat === "attente" || e.etat === "erreur") && !enFile.has(e.id)));
    demarrer();
  };

  const retirer = (id: number) => {
    file.current = file.current.filter((e) => e.id !== id);
    setElements((els) => {
      const e = els.find((x) => x.id === id);
      liberer(e?.apercu);
      return els.filter((x) => x.id !== id);
    });
  };

  const vider = () => {
    file.current = [];
    setElements((els) => {
      els.forEach((e) => liberer(e.apercu));
      return [];
    });
  };

  const faits = elements.filter((e) => e.etat === "fait" && e.resultat);
  const aFaire = elements.filter((e) => e.etat === "attente" || e.etat === "erreur").length;
  const totalAvant = faits.reduce((s, e) => s + e.fichier.size, 0);
  const totalApres = faits.reduce((s, e) => s + (e.resultat?.blob.size ?? 0), 0);

  const toutTelecharger = async () => {
    if (faits.length === 1) return telecharger(faits[0].resultat!.nom, faits[0].resultat!.blob);
    const zip = await creerZip(faits.map((e) => ({ nom: e.resultat!.nom, donnees: e.resultat!.blob })));
    telecharger(nomZip, zip);
  };

  const ecart = (avant: number, apres: number) => {
    if (!avant) return "";
    const p = Math.round(((apres - avant) / avant) * 100);
    return p === 0 ? t.inchange : p < 0 ? t.pct(p.toLocaleString(locale(lang))) : `+${t.pct(p.toLocaleString(locale(lang)))}`;
  };

  // Téléphone : dépôt, résultat, réglages (le résultat reste juste sous le bouton de dépôt).
  // Ordinateur : dépôt et réglages à gauche, résultat dans la colonne de droite.
  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:grid-rows-[auto_1fr] items-start"
      id={`${idPrefixe}-outil`}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <DepotFichiers accept={accept} multiple onFichiers={ajouter} libelle={libelleDepot} aide={aideDepot} />
      </div>

      <div data-resultat className="min-w-0 space-y-3 lg:col-start-2 lg:row-start-1 lg:row-span-2">
        {elements.length === 0 ? (
          <p className="rounded-lg border border-neutral-800 p-4 text-sm text-neutral-500">{attente ?? t.attente}</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Bouton onClick={lancer} disabled={enCours || aFaire === 0}>
                {enCours ? t.enCours : aFaire > 1 ? t.lesN(action, aFaire) : action}
              </Bouton>
              {faits.length > 0 && (
                <Bouton secondaire onClick={toutTelecharger} disabled={enCours}>
                  {faits.length > 1 ? t.toutZip(faits.length) : t.telecharger}
                </Bouton>
              )}
              <Bouton secondaire onClick={vider} disabled={enCours}>
                {t.vider}
              </Bouton>
            </div>
            <p role="status" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem] [overflow-wrap:anywhere]">
              {progression}
              {note && <span className="block text-neutral-400">{note}</span>}
            </p>
            {faits.length > 1 && (
              <p className="text-sm text-neutral-400 tabular-nums">
                {t.total(oct(totalAvant), oct(totalApres), ecart(totalAvant, totalApres))}
              </p>
            )}
            <ul className="divide-y divide-neutral-800 border-y border-neutral-800" aria-label={t.fichiers}>
              {elements.map((e) => (
                <li key={e.id} className="py-3 flex items-center gap-3 min-w-0" data-etat={e.etat}>
                  <div className="w-14 h-14 shrink-0 rounded bg-neutral-900 border border-neutral-800 overflow-hidden grid place-items-center bg-[length:12px_12px] bg-[conic-gradient(#262626_25%,#171717_0_50%,#262626_0_75%,#171717_0)]">
                    {e.apercu ? (
                      <img src={e.apercu} alt="" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[0.65rem] text-neutral-500 uppercase">
                        {e.fichier.name.split(".").pop()?.slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-neutral-100 truncate" title={e.fichier.name}>
                      {e.fichier.name}
                    </p>
                    <p className="text-neutral-500 tabular-nums [overflow-wrap:anywhere]">
                      {oct(e.fichier.size)}
                      {e.etat === "fait" && e.resultat && (
                        <>
                          {" → "}
                          <span className="text-neutral-200">{oct(e.resultat.blob.size)}</span> (
                          {ecart(e.fichier.size, e.resultat.blob.size)})
                        </>
                      )}
                      {e.etat === "encours" && <span className="text-sky-300">{t.encoursEl}</span>}
                      {e.etat === "attente" && <span>{t.attenteEl}</span>}
                    </p>
                    {e.etat === "fait" && e.resultat?.detail && (
                      <p className="text-neutral-500 text-xs [overflow-wrap:anywhere]">{e.resultat.detail}</p>
                    )}
                    {e.etat === "erreur" && <p className="text-amber-300 text-xs [overflow-wrap:anywhere]">{e.message}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {e.etat === "fait" && e.resultat && (
                      <button
                        type="button"
                        onClick={() => telecharger(e.resultat!.nom, e.resultat!.blob)}
                        className="h-10 px-3 rounded-md text-sm border border-neutral-700 text-neutral-200 hover:border-neutral-500"
                      >
                        {t.enregistrer}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => retirer(e.id)}
                      disabled={enCours}
                      aria-label={t.retirer(e.fichier.name)}
                      className="h-10 w-10 rounded-md text-neutral-400 hover:text-white disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {reglages && (
        <div className="min-w-0 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 lg:col-start-1 lg:row-start-2">
          {reglages}
        </div>
      )}
    </div>
  );
};

/** Curseur de qualité JPEG / WebP, en pourcentage. */
export const ReglageQualite = ({
  valeur,
  onChange,
  id = "qualite",
}: {
  valeur: number; // 10 à 100
  onChange: (v: number) => void;
  id?: string;
}) => {
  const en = useLangue() === "en";
  return (
  <label className="block min-w-0" htmlFor={id}>
    <span className="flex justify-between text-sm text-neutral-300 mb-1">
      <span>{en ? "Quality" : "Qualité"}</span>
      <span className="tabular-nums text-neutral-100">{en ? `${valeur}%` : `${valeur} %`}</span>
    </span>
    <input
      id={id}
      type="range"
      min={10}
      max={100}
      step={1}
      value={valeur}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-12 accent-sky-400"
    />
    <span className="block text-xs text-neutral-500">
      {en
        ? "85% suits almost every photo; above 92%, the file grows with no visible gain."
        : "85 % convient à presque toutes les photos ; au-dessus de 92 %, le poids grimpe sans gain visible."}
    </span>
  </label>
  );
};

/** Couleur de fond qui remplace la transparence (le JPEG n'en a pas). */
export const ReglageFond = ({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) => {
  const en = useLangue() === "en";
  return (
  <div className="min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">{en ? "Background for transparent areas" : "Fond des zones transparentes"}</span>
    <div className="flex flex-wrap items-center gap-2">
      {[
        ["#ffffff", en ? "White" : "Blanc"],
        ["#000000", en ? "Black" : "Noir"],
      ].map(([c, nom]) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={valeur.toLowerCase() === c}
          className={`h-12 px-3 rounded-md border text-sm ${valeur.toLowerCase() === c ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-300"}`}
        >
          <span className="inline-block w-4 h-4 rounded-sm border border-neutral-500 align-middle mr-2" style={{ background: c }} />
          {nom}
        </button>
      ))}
      <label className="h-12 px-3 rounded-md border border-neutral-700 text-sm text-neutral-300 inline-flex items-center gap-2 cursor-pointer">
        <input type="color" value={valeur} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 bg-transparent" />
        {en ? "Other colour" : "Autre couleur"}
      </label>
    </div>
  </div>
  );
};
