/**
 * Test de vitesse de frappe : textes français écrits pour 75tools (accents, ponctuation, majuscules,
 * sans caractère introuvable sur un clavier AZERTY : ni guillemets français, ni « œ », ni majuscule accentuée),
 * normalisation de la saisie et calcul des scores.
 */
import { sansAccents } from "@/lib/texte-mots-fr";

export const TEXTES_FRAPPE = [
  "Le marché du samedi commence tôt. Dès sept heures, les maraîchers installent leurs étals de légumes : poireaux, carottes, courges et pommes de terre encore couvertes de terre. Une odeur de pain chaud vient de la boulangerie d'en face. Les premiers clients arrivent avec leurs paniers, comparent les prix et discutent de la météo, qui s'annonce plus douce que prévu.",
  "Pour apprendre à taper sans regarder le clavier, il faut surtout de la régularité. Dix minutes par jour valent mieux qu'une heure le dimanche. Placez vos index sur les touches F et J, repérables au toucher grâce à leur petit relief, puis laissez chaque doigt revenir à sa place après chaque frappe. La vitesse viendra d'elle-même, la précision d'abord.",
  "Au bord du lac, le vent s'est levé vers midi. Les voiliers ont regagné le port les uns après les autres, voiles réduites, pendant que les mouettes tournaient au-dessus de la jetée. Sur la terrasse du café, on a rentré les parasols à la hâte. Une heure plus tard, le ciel était de nouveau bleu, comme si rien ne s'était passé.",
  "Merci pour votre message du 14 mars. Je vous confirme notre rendez-vous de jeudi à 10 h 30, dans nos bureaux du troisième étage. Pourriez-vous apporter le devis signé ainsi qu'une copie de votre pièce d'identité ? Si cet horaire ne vous convient plus, n'hésitez pas à me rappeler : nous trouverons sans difficulté un autre créneau dans la semaine.",
  "La recette est simple. Faites fondre 100 g de beurre avec 200 g de chocolat noir, puis ajoutez trois oeufs battus avec 150 g de sucre. Incorporez 50 g de farine, versez la pâte dans un moule beurré et laissez cuire vingt minutes à 180 degrés. Le gâteau doit rester fondant au centre : mieux vaut le sortir un peu trop tôt que trop tard.",
  "Le train de 18 h 12 a été retardé d'environ un quart d'heure. Les voyageurs patientent sur le quai, certains au téléphone, d'autres plongés dans un livre. Un enfant compte les wagons qui passent sur la voie d'à côté. Quand le train arrive enfin, chacun cherche sa voiture, sa place, puis s'installe avec le soulagement de rentrer chez soi.",
  "Une bonne bibliothèque ne se juge pas au nombre de ses livres. Ce qui compte, c'est la facilité avec laquelle on y trouve ce qu'on cherche, et le plaisir qu'on a à s'y perdre. Les bibliothécaires le savent bien : un classement clair, des tables de lecture éclairées et quelques conseils glissés au bon moment font plus que mille rayonnages.",
  "Il était une fois un vieux phare, planté sur un rocher au large de la Bretagne. Son gardien, un homme patient et un peu bougon, montait chaque soir les cent douze marches de l'escalier en colimaçon. Là-haut, il nettoyait la lentille, vérifiait la lampe et regardait la mer. Il disait que les tempêtes lui avaient tout appris, même la prudence.",
  "Avant de partir en randonnée, vérifiez la météo et prévenez un proche de votre itinéraire. Emportez de l'eau, un vêtement chaud, une carte et de quoi manger. En montagne, le temps change vite : un sentier facile le matin peut devenir glissant l'après-midi. Savoir faire demi-tour à temps fait partie des qualités d'un bon marcheur.",
  "Notre association organise sa fête annuelle le dimanche 8 juin, de 11 h à 18 h, dans le parc municipal. Au programme : jeux pour les enfants, concert de l'école de musique, vente de gâteaux et tournoi de pétanque. L'entrée est libre. Les bénévoles qui souhaitent aider au montage des stands peuvent se faire connaître auprès du secrétariat.",
];

/** Ordre de lecture des textes à partir d'une graine (mélange de Fisher-Yates). */
export const melanger = (graine: number) => {
  const idx = TEXTES_FRAPPE.map((_, i) => i);
  let a = graine >>> 0 || 1;
  for (let i = idx.length - 1; i > 0; i--) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    const j = a % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
};

/** Texte à taper : plusieurs passages à la suite, assez longs pour trois minutes à vive allure. */
export const texteDuTest = (ordre: number[], accents: boolean) => {
  const t = ordre.map((i) => TEXTES_FRAPPE[i]).join(" ");
  return accents ? t : sansAccents(t);
};

/** Ce qui se tape autrement selon l'appareil : apostrophe courbe, espaces insécables, guillemets. */
export const normaliserSaisie = (s: string) =>
  s
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[   ]/g, " ")
    .replace(/[“”«»]/g, '"')
    .replace(/\r\n?|\n/g, " ");

export interface Scores {
  minutes: number;
  frappes: number; // caractères tapés au total (corrections comprises)
  erreursCommises: number; // frappes fausses au moment où elles ont été tapées
  saisis: number; // caractères présents dans la saisie finale
  corrects: number; // caractères justes dans la saisie finale
  mpmBrut: number; // (caractères saisis / 5) / minutes
  mpmNet: number; // (caractères justes / 5) / minutes
  precision: number; // 1 - erreurs commises / frappes
}

export const calculerScores = (cible: string, saisie: string, frappes: number, erreursCommises: number, minutes: number): Scores => {
  let corrects = 0;
  for (let i = 0; i < saisie.length && i < cible.length; i++) if (saisie[i] === cible[i]) corrects++;
  const m = Math.max(minutes, 1 / 600);
  return {
    minutes,
    frappes,
    erreursCommises,
    saisis: saisie.length,
    corrects,
    mpmBrut: saisie.length / 5 / m,
    mpmNet: corrects / 5 / m,
    precision: frappes ? Math.max(0, 1 - erreursCommises / frappes) : 1,
  };
};
