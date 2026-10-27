/**
 * Test de vitesse de frappe : textes français écrits pour 75tools (accents, ponctuation, majuscules,
 * sans caractère introuvable sur un clavier AZERTY : ni guillemets français, ni « œ », ni majuscule accentuée),
 * textes anglais écrits pour la page anglaise (caractères ASCII seulement, apostrophe droite),
 * normalisation de la saisie et calcul des scores.
 */
import { sansAccents } from "@/lib/texte-mots-fr";
import type { Langue } from "@/lib/langue";

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

/** Textes anglais : tous les caractères se tapent directement sur un clavier QWERTY britannique ou américain. */
export const TEXTES_FRAPPE_EN = [
  "The bakery on the corner opens at seven, and by ten past there is already a queue. People order a baguette, sometimes two, and a few croissants for the children. The baker knows most of them by name. On Sundays the line reaches the pharmacy next door, but nobody seems to mind waiting a little for bread that is still warm.",
  "Learning to type without looking at the keys takes patience more than talent. Ten minutes a day will do more than an hour once a week. Rest your index fingers on F and J, which have a small bump you can feel, and bring each finger back to its place after every stroke. Speed comes later; accuracy comes first.",
  "The storm arrived just after lunch. Within minutes the sky over the harbour turned grey, the wind picked up and the small boats rocked against the pontoon. Cafe owners rushed to fold their umbrellas while tourists ran for cover. An hour later the sun was out again, and the streets smelled of wet stone and salt.",
  "Thank you for your email of 14 March. I can confirm our meeting on Thursday at 10:30 in our office on the third floor. Could you please bring the signed quote and a copy of your passport? If that time no longer suits you, just give me a call and we will find another slot during the week.",
  "The recipe is simple. Melt 100 g of butter with 200 g of dark chocolate, then stir in three eggs beaten with 150 g of sugar. Fold in 50 g of flour, pour the mixture into a buttered tin and bake for twenty minutes at 180 degrees. The cake should stay soft in the middle, so take it out a little early rather than late.",
  "The 6:12 train was delayed by about a quarter of an hour. Passengers waited on the platform, some on the phone, others lost in a book. A small boy counted the carriages of a freight train rolling past on the next track. When the train finally pulled in, everyone looked for their coach and seat, glad to be heading home at last.",
  "A good library is not measured by the number of books on its shelves. What matters is how easily you find what you are looking for, and how pleasant it is to get lost there. Librarians know this well: a clear system, bright reading tables and a quiet word of advice at the right moment do more than a thousand shelves.",
  "Once upon a time an old lighthouse stood on a rock off the coast of Brittany. Its keeper, a patient and slightly grumpy man, climbed the one hundred and twelve steps of the spiral staircase every evening. At the top he cleaned the lens, checked the lamp and watched the sea. He used to say the storms had taught him everything, even caution.",
  "Before setting off on a hike, check the weather forecast and tell someone where you are going. Take water, a warm layer, a map and something to eat. In the mountains the weather can change quickly, and a path that was easy in the morning may be slippery by the afternoon. Knowing when to turn back is part of being a good walker.",
  "Our local association is holding its summer fair on Sunday 8 June, from 11 am to 6 pm, in the town park. There will be games for children, a concert by the music school, a cake stall and a petanque tournament. Entry is free. Volunteers who would like to help set up the stands are welcome to contact the office.",
];

/** Ordre de lecture des textes à partir d'une graine (mélange de Fisher-Yates). */
export const melanger = (graine: number, n = TEXTES_FRAPPE.length) => {
  const idx = Array.from({ length: n }, (_, i) => i);
  let a = graine >>> 0 || 1;
  for (let i = idx.length - 1; i > 0; i--) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    const j = a % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
};

/** Texte à taper : plusieurs passages à la suite, assez longs pour trois minutes à vive allure. */
export const texteDuTest = (ordre: number[], accents: boolean, langue: Langue = "fr") => {
  const textes = langue === "en" ? TEXTES_FRAPPE_EN : TEXTES_FRAPPE;
  const t = ordre.filter((i) => i < textes.length).map((i) => textes[i]).join(" ");
  return accents || langue === "en" ? t : sansAccents(t);
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
