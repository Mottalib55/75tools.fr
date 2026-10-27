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

/** 1 234 567 → « 1,2 Mo » (unités françaises : o, Ko, Mo). */
export function formatOctets(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} Ko`;
  return `${(n / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

export const canvasVersBlob = (c: HTMLCanvasElement, type = "image/jpeg", qualite = 0.92) =>
  new Promise<Blob>((ok, ko) => c.toBlob((b) => (b ? ok(b) : ko(new Error("Conversion impossible"))), type, qualite));

/** Charge une image (JPG, PNG, WebP, GIF, et HEIC sur Safari) dans un élément <img> décodé. */
export function chargerImage(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((ok, ko) => {
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => ko(new Error("Image illisible"));
    img.src = url;
  });
}

/** Lit un fichier en octets. */
export const lireOctets = (f: Blob) => f.arrayBuffer().then((b) => new Uint8Array(b));
