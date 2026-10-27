/** Utilitaires partagés par le chronomètre, le minuteur et le compte à rebours. */

const d2 = (n: number) => String(n).padStart(2, "0");

/** 3 723 456 ms → « 1:02:03,45 » ; sous une heure : « 02:03,45 ». */
export function formatChrono(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 10)); // centièmes
  const c = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000) % 60;
  const h = Math.floor(total / 360000);
  return h > 0 ? `${h}:${d2(m)}:${d2(s)},${d2(c)}` : `${d2(m)}:${d2(s)},${d2(c)}`;
}

/** Durée restante arrondie à la seconde supérieure : « 9:59 », « 1:00:00 ». */
export function formatRestant(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return h > 0 ? `${h}:${d2(m)}:${d2(s)}` : `${d2(m)}:${d2(s)}`;
}

/** Plein écran d'un élément, avec repli silencieux si le navigateur refuse. */
export async function basculerPleinEcran(el: HTMLElement | null) {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el?.requestFullscreen();
  } catch {
    /* plein écran refusé (iPhone : seulement pour les vidéos) */
  }
}

/** Sonnerie générée par Web Audio : trois séries de bips, sans fichier son. */
export function sonner(ctx: AudioContext, volume = 0.6, series = 3, decalageS = 0, destination: AudioNode = ctx.destination) {
  const t0 = ctx.currentTime + 0.05 + decalageS;
  for (let s = 0; s < series; s++) {
    for (let b = 0; b < 3; b++) {
      const debut = t0 + s * 1.2 + b * 0.22;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0, debut);
      gain.gain.linearRampToValueAtTime(volume, debut + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.18);
      osc.connect(gain).connect(destination);
      osc.start(debut);
      osc.stop(debut + 0.2);
    }
  }
}

export function creerAudio(): AudioContext | null {
  const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return C ? new C() : null;
}

/** Entier uniforme dans [0, n[ par crypto.getRandomValues, sans biais du modulo (rejet). */
export function entierAleatoire(n: number): number {
  if (n <= 0 || !Number.isFinite(n)) return 0;
  const max = 2 ** 32;
  const limite = max - (max % n);
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limite) return buf[0] % n;
  }
}

/** Mélange de Fisher-Yates avec entierAleatoire. */
export function melanger<T>(t: T[]): T[] {
  const a = [...t];
  for (let i = a.length - 1; i > 0; i--) {
    const j = entierAleatoire(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
