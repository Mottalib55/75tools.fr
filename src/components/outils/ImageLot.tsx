import { ReactNode, useEffect, useRef, useState } from "react";
import { Bouton } from "@/components/outils/OutilLayout";
import { DepotFichiers } from "@/components/outils/PageOutil";
import { formatOctets, telecharger } from "@/lib/fichiers";
import { creerZip } from "@/lib/zip";
import { respirer } from "@/lib/image-lot";

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
  libelleAction = "Convertir",
  nomZip,
  avantTraitement,
  idPrefixe = "lot",
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
}) => {
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
        setProgression(`Image ${n} sur ${n + file.current.length} : ${el.fichier.name}`);
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
          const message = err instanceof Error && err.message ? err.message : "Image illisible";
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
    return p === 0 ? "poids inchangé" : p < 0 ? `${p.toLocaleString("fr-FR")} %` : `+${p.toLocaleString("fr-FR")} %`;
  };

  return (
    <div className="space-y-5" id={`${idPrefixe}-outil`}>
      <DepotFichiers accept={accept} multiple onFichiers={ajouter} libelle={libelleDepot} aide={aideDepot} />

      {reglages && <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">{reglages}</div>}

      {elements.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Bouton onClick={lancer} disabled={enCours || aFaire === 0}>
              {enCours ? "Traitement en cours…" : aFaire > 1 ? `${libelleAction} les ${aFaire} images` : libelleAction}
            </Bouton>
            {faits.length > 0 && (
              <Bouton secondaire onClick={toutTelecharger} disabled={enCours}>
                {faits.length > 1 ? `Tout télécharger (ZIP, ${faits.length} images)` : "Télécharger"}
              </Bouton>
            )}
            <Bouton secondaire onClick={vider} disabled={enCours}>
              Vider la liste
            </Bouton>
          </div>
          <p role="status" aria-live="polite" className="text-sm text-sky-300 min-h-[1.25rem] [overflow-wrap:anywhere]">
            {progression}
            {note && <span className="block text-neutral-400">{note}</span>}
          </p>
          {faits.length > 1 && (
            <p className="text-sm text-neutral-400 tabular-nums">
              Total : {formatOctets(totalAvant)} avant, {formatOctets(totalApres)} après ({ecart(totalAvant, totalApres)}).
            </p>
          )}
          <ul className="divide-y divide-neutral-800 border-y border-neutral-800" aria-label="Fichiers">
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
                    {formatOctets(e.fichier.size)}
                    {e.etat === "fait" && e.resultat && (
                      <>
                        {" → "}
                        <span className="text-neutral-200">{formatOctets(e.resultat.blob.size)}</span> (
                        {ecart(e.fichier.size, e.resultat.blob.size)})
                      </>
                    )}
                    {e.etat === "encours" && <span className="text-sky-300"> · en cours…</span>}
                    {e.etat === "attente" && <span> · à traiter</span>}
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
                      Enregistrer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => retirer(e.id)}
                    disabled={enCours}
                    aria-label={`Retirer ${e.fichier.name}`}
                    className="h-10 w-10 rounded-md text-neutral-400 hover:text-white disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
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
}) => (
  <label className="block min-w-0" htmlFor={id}>
    <span className="flex justify-between text-sm text-neutral-300 mb-1">
      <span>Qualité</span>
      <span className="tabular-nums text-neutral-100">{valeur} %</span>
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
      85 % convient à presque toutes les photos ; au-dessus de 92 %, le poids grimpe sans gain visible.
    </span>
  </label>
);

/** Couleur de fond qui remplace la transparence (le JPEG n'en a pas). */
export const ReglageFond = ({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) => (
  <div className="min-w-0">
    <span className="block text-sm text-neutral-300 mb-1">Fond des zones transparentes</span>
    <div className="flex flex-wrap items-center gap-2">
      {[
        ["#ffffff", "Blanc"],
        ["#000000", "Noir"],
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
        Autre couleur
      </label>
    </div>
  </div>
);
