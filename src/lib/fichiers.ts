/** Petits utilitaires de fichiers partagés par les outils PDF et image (tout reste dans le navigateur). */

/** Déclenche le téléchargement d'un Blob ou d'une adresse data:/blob:. */
export function telecharger(nom: string, contenu: Blob | string) {
  const href = typeof contenu === "string" ? contenu : URL.createObjectURL(contenu);
  const a = document.createElement("a");
  a.href = href;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof contenu !== "string") setTimeout(() => URL.revokeObjectURL(href), 4000);
}

/** « vacances.HEIC » → « vacances ». */
export const nomSansExtension = (nom: string) => nom.replace(/\.[^.]+$/, "") || "fichier";

/** 1 234 567 → « 1,2 Mo » en français (o, Ko, Mo), « 1.2 MB » en anglais (B, KB, MB). */
export function formatOctets(n: number, lang: "fr" | "en" = "fr"): string {
  const loc = lang === "en" ? "en-GB" : "fr-FR";
  const [o, k, m] = lang === "en" ? ["B", "KB", "MB"] : ["o", "Ko", "Mo"];
  if (n < 1024) return `${n} ${o}`;
  if (n < 1024 * 1024) return `${(n / 1024).toLocaleString(loc, { maximumFractionDigits: 0 })} ${k}`;
  return `${(n / 1024 / 1024).toLocaleString(loc, { maximumFractionDigits: 1 })} ${m}`;
}

export const canvasVersBlob = (c: HTMLCanvasElement, type = "image/jpeg", qualite = 0.92) =>
  new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error("Conversion impossible / conversion failed"))), type, qualite));

/** Charge une image (JPG, PNG, WebP, GIF, et HEIC sur Safari) dans un élément <img> décodé. */
export function chargerImage(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ko(new Error("Image illisible / unreadable image"));
    img.src = url;
  });
}

/** Lit un fichier en octets. */
export const lireOctets = (f: Blob) => f.arrayBuffer().then((b) => new Uint8Array(b));
