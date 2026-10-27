/**
 * Chargement paresseux de pdf.js (lecture et rendu des pages PDF) : la bibliothèque et son
 * worker ne sont téléchargés que par les pages qui ouvrent un PDF, jamais par l'accueil.
 * isEvalSupported: false par prudence (CVE-2024-4367, corrigée depuis la 4.2.67).
 */
import type * as PdfJs from "pdfjs-dist";

let promesse: Promise<typeof PdfJs> | null = null;

export function chargerPdfJs(): Promise<typeof PdfJs> {
  if (!promesse) {
    // Safari < 17.4 n'a pas Promise.withResolvers, dont pdf.js 4 se sert.
    const P = Promise as unknown as { withResolvers?: () => unknown };
    if (!P.withResolvers) {
      P.withResolvers = function () {
        let resolve: unknown, reject: unknown;
        const promise = new Promise((a, b) => {
          resolve = a;
          reject = b;
        });
        return { promise, resolve, reject };
      };
    }
    promesse = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return promesse;
}

/** Ouvre un PDF (octets) avec les options prudentes. */
export async function ouvrirPdf(octets: Uint8Array) {
  const pdfjs = await chargerPdfJs();
  return pdfjs.getDocument({ data: octets, isEvalSupported: false }).promise;
}

/** Rend une page dans un canvas à l'échelle donnée (1 = 72 dpi). */
export async function rendrePage(
  doc: Awaited<ReturnType<typeof ouvrirPdf>>,
  numero: number,
  echelle: number,
  fondBlanc = true
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(numero);
  const vue = page.getViewport({ scale: echelle });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(vue.width);
  canvas.height = Math.ceil(vue.height);
  const ctx = canvas.getContext("2d")!;
  if (fondBlanc) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({ canvasContext: ctx, viewport: vue }).promise;
  page.cleanup();
  return canvas;
}
