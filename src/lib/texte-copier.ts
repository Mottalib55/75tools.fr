/** Copie dans le presse-papiers, avec repli pour les navigateurs sans API Clipboard (ou hors HTTPS). */
export const copierTexte = async (texte: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch {
    /* repli ci-dessous */
  }
  try {
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.setAttribute("readonly", "");
    zone.style.position = "fixed";
    zone.style.opacity = "0";
    document.body.appendChild(zone);
    zone.select();
    const ok = document.execCommand("copy");
    zone.remove();
    return ok;
  } catch {
    return false;
  }
};
