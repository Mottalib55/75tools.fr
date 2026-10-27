/**
 * Archive ZIP minimale (méthode « stocké », sans compression) pour télécharger plusieurs
 * fichiers d'un coup : images JPG/PNG et PDF sont déjà compressés, les recompresser ne gagne
 * presque rien. Aucune dépendance, tout se fait dans le navigateur.
 */

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(d: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = TABLE[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export interface FichierZip {
  nom: string;
  donnees: Uint8Array | Blob;
}

export async function creerZip(fichiers: FichierZip[]): Promise<Blob> {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const central: Uint8Array[] = [];
  let decalage = 0;
  const maintenant = new Date();
  const heure = (maintenant.getHours() << 11) | (maintenant.getMinutes() << 5) | (maintenant.getSeconds() >> 1);
  const jour = ((maintenant.getFullYear() - 1980) << 9) | ((maintenant.getMonth() + 1) << 5) | maintenant.getDate();
  const vus = new Set<string>();

  for (const f of fichiers) {
    // Noms uniques dans l'archive : « page.jpg », « page-2.jpg »…
    let nom = f.nom;
    for (let i = 2; vus.has(nom); i++) nom = f.nom.replace(/(\.[^.]+)?$/, `-${i}$1`);
    vus.add(nom);
    const donnees = f.donnees instanceof Blob ? new Uint8Array(await f.donnees.arrayBuffer()) : f.donnees;
    const nomOctets = enc.encode(nom);
    const crc = crc32(donnees);

    const local = new Uint8Array(30 + nomOctets.length);
    const v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x0800, true); // noms en UTF-8
    v.setUint16(8, 0, true); // stocké
    v.setUint16(10, heure, true);
    v.setUint16(12, jour, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, donnees.length, true);
    v.setUint32(22, donnees.length, true);
    v.setUint16(26, nomOctets.length, true);
    local.set(nomOctets, 30);
    parts.push(local, donnees);

    const c = new Uint8Array(46 + nomOctets.length);
    const w = new DataView(c.buffer);
    w.setUint32(0, 0x02014b50, true);
    w.setUint16(4, 20, true);
    w.setUint16(6, 20, true);
    w.setUint16(8, 0x0800, true);
    w.setUint16(10, 0, true);
    w.setUint16(12, heure, true);
    w.setUint16(14, jour, true);
    w.setUint32(16, crc, true);
    w.setUint32(20, donnees.length, true);
    w.setUint32(24, donnees.length, true);
    w.setUint16(28, nomOctets.length, true);
    w.setUint32(42, decalage, true);
    c.set(nomOctets, 46);
    central.push(c);
    decalage += local.length + donnees.length;
  }

  const tailleCentral = central.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22);
  const e = new DataView(fin.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, central.length, true);
  e.setUint16(10, central.length, true);
  e.setUint32(12, tailleCentral, true);
  e.setUint32(16, decalage, true);
  return new Blob([...parts, ...central, fin], { type: "application/zip" });
}
