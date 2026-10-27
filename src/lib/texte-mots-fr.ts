/**
 * Liste de mots français courants (noms, adjectifs, verbes), composée pour 75tools, utilisée par
 * le générateur de phrases de passe et le faux texte. Les doublons éventuels sont retirés à l'usage.
 */
export const MOTS_FR = `
abeille abri absolu accord achat acier acteur action adresse affiche agneau aigle aiguille aile aimant air
album algue allée alliance allumette alpage amande ambre ami amour ampoule ananas ancre ange angle animal anneau
année antenne appel appareil appui aquarium arbre arc arche ardoise argent argile arme armoire arrosoir art
artiste asperge assiette astre atelier atlas atome atout aube auberge aurore auteur autobus automne autruche
avenir avenue averse avion avis avoine azur bagage bague baguette baie baignoire balai balcon baleine balle
ballon bambou banane banc bandeau banjo banque barque barrage bassin bateau bâton batterie baume bavard beauté
bélier berceau berger besace bétail beurre biche bijou bille biscuit bison blason blé bleuet bocal bois boisson
boîte bol bonbon bonnet bord bosquet botte bouche bougie bouleau boussole bouteille bouton branche bras brebis
brindille brioche brise brosse brouillard bruit brume buffet buisson bulle bureau cabane cabine câble cacao
cactus cadeau cadran cahier caillou caisse calcul calme camion campagne canal canard canapé canoë cantine
capitaine caramel caravane carnet carotte carré carte carton cascade casque castor cave cèdre ceinture céleri
cerceau cerf cerise cerveau chaîne chaise chaleur chambre chameau champ chandail chanson chant chapeau charbon
chariot chat château chaton chaussette chemin cheminée chemise chêne chenille cheval cheveu chèvre chien
chiffre chocolat chorale chou ciel cigale cigogne cinéma cirque citron citrouille clairière clarinette classe
clavier clé climat cloche clou coccinelle cocon coeur coffre colline colombe comète commode compas comptoir
concert concombre confiture copain coquille corbeau corde cornet corps costume côte coton couleur couloir
coupe cour courage courant course couronne cousin coussin couteau cratère crayon crème crêpe creux crocodile
croissant cuillère cuir cuisine cygne cyprès dahlia dauphin dé décor défi délice dentelle désert dessert dessin
destin devinette diamant dictée dinde disque doigt domaine domino dragon drapeau dune durée eau échelle écho
éclair école écorce écran écrin écureuil édifice effort élan éléphant élève émeraude encre énigme épice épine
éponge équipe érable escalier escargot espace espoir essai étable étage étang étoile étude éventail évier
fable façade facteur faisan falaise famille fanfare farine faucon fauteuil fenêtre fer ferme feuille feutre
fève ficelle figue fil filet flamant flamme flèche fleur fleuve flocon flûte foin fontaine forêt forge fougère
fourmi fraise framboise frégate frelon frêne fromage fruit fumée fusée galet galop gant garage gare gâteau
gazelle gazon gel genou gilet girafe glace gland globe gomme gorge goutte graine grange grenier grenouille
griffe grille grotte groupe guépard guide guitare habit hache haie hamac hameau hamster harpe hérisson héron
hibou hirondelle histoire hiver homard horizon horloge hublot huile huître île image impasse indice insecte
iris ivoire jade jambe jardin jeton jeu jonquille journal journée joyau jument jungle jupe jus kangourou képi
kiwi koala lac lacet laine lait laitue lama lampe lance lanterne lapin laurier lavande légume lettre levier
lézard lien lierre lilas limace lime lin lion lisière lit livre loge loisir losange loup loupe lueur lumière
lune lutin lynx machine maïs maison manège manteau marais marbre marché marée marelle marguerite marmotte
marron masque matin mélodie melon menthe mer merle mésange métal météo meuble midi miel miette mimosa
miroir mistral moineau moisson montagne montre morceau mot moteur mouette moulin mousse mouton muguet mur
muraille musée musique myrtille nageoire nappe navire neige nénuphar nid noisette noix nom nombre note nuage
nuit oasis océan odeur oeil oeuf oie oiseau olive ombre oncle opéra orage orange orchestre oreille orge orgue
ortie os otarie ourson outil ouvrage pagaie paille pain palais palmier panier panda papillon paquet parapluie
parc parfum passage pastèque pâte patin paume pavé paysage pêche pédale peigne peinture pelle pelouse péniche
pensée pépin perle perroquet persil phare piano pic pied pierre pigeon pilote pin pinceau pingouin pique pirate
piscine piste placard plage plaine planète plante plateau plume pluie poche poème poids poignée point poire
poisson poivre pollen pomme pompe pont port portail porte potager poterie pouce poule poupée prairie prune
puits pull puzzle pyjama quai quartier quille racine radeau radis raisin rame rampe rangée rapide raquette
rayon récolte récit refuge regard renard requin réseau rideau rivage rivière riz robe robot rocher roi roman
ronce rose roseau roue ruban ruche rue ruisseau sable sabot sac safran saison salade salon sandale sapin
sardine satin sauge saule savon scène seau secret seigle sel semaine sentier serpent serre sifflet signal
silence singe sirop ski soleil sommet son sorbet souffle soupe source sourire souris stade statue sucre
sureau tableau tablier tabouret tache taille tambour tapis tasse taupe taureau temps tente terrain terre tête
thé théâtre thym tigre timbre tiroir tissu toile toit tomate tonneau torche tortue toupie tour tournesol
train trait trajet tramway trésor tribu tricot trompette tronc trophée troupeau tulipe tunnel tuyau vague
vallée valse vapeur vase veau vélo velours vent verger vernis verre veste vigne village ville violon vitrail
vitre voile voilier voisin voiture volcan voyage wagon yaourt zèbre zeste
agile aimable aisé ample ancien argenté aride habile blanc bleu bon bref brillant brun calme carré certain
charmant chaud clair complet content court créatif curieux digne discret divers doré doux droit drôle élégant
énorme entier épais étroit exact facile fameux fertile fidèle fier fin fort frais franc gai géant gentil
grand gris gros habile haut heureux humble immense jaune jeune joli joyeux juste large léger lent libre lisse
long lourd loyal magique malin mauve mince moderne mou muet neuf noble noir nouveau orange ovale pâle paisible
parfait pareil patient petit plat plein poli précis profond propre prudent pur rapide rare ravi réel riche
rigolo robuste rond rose rouge rusé sage sain salé secret serein simple sobre solide sombre souple stable
subtil sucré superbe sûr tendre tiède timide tranquille triste utile vaste vert vif violet vrai
aider aimer allumer amener apprendre arroser attraper avancer bâtir boire bouger briller bricoler cacher
calculer camper chanter chercher choisir classer coller compter conduire construire courir couper créer
cueillir cuisiner danser décorer découvrir dessiner deviner dormir écouter écrire envoyer explorer fabriquer
fermer finir flotter gagner garder glisser goûter grandir grimper guider imaginer inventer jardiner jongler
jouer lancer laver lire marcher mesurer monter nager noter observer offrir ouvrir parler partager peindre
penser planter plier porter préparer promener ranger réparer respirer rêver rire rouler sauter semer siffler
skier sourire tailler tirer tisser tourner tracer travailler trier trouver valser venir visiter voler voyager
abricot accordéon acrobate agenda agrafe aiglon airelle alouette alphabet amiral ancêtre anémone anis antilope
appétit aquarelle araignée arbuste archipel arène armure arpent artichaut asile aspic athlète attelage aubépine
aubergine audace avalanche aviron azalée badge baladin balise banquise baobab baril barrière basilic
bassine bataille baudet bécasse belette bergamote bermuda betterave bibelot bicyclette bidon billard biscotte
blaireau bobine bocage bolide bonheur bonsaï bosse bouquet bourdon bourgeon boutique bracelet brigade brocante
brochet brouette bruyère bûche butte cabas cachette cadet cafetière cageot cagoule caille calèche calepin
calice camarade camélia camée canari canif canot cantate cape carafe caravelle cargo carillon carlingue carpe
carrefour cartable casserole castagne catamaran cavalier cédille cellier cendre cerfeuil chaland chalet
chalumeau chamois chantier chapelle charade charnière charpente chasse chaudron chausson chevalet chevreuil
chicorée chignon chimère chiot ciboulette cigare cil cintre ciseau citadelle civet clairon clapier clocher
clôture cobalt cocotte colibri collier colonne comédie compote concours condor console contrée copeau coquelicot
corail cordage corniche corsaire cortège cosmos coteau cottage coucou coude coulis courgette coyote crabe
crevette cristal croquis crosse cumulus curseur dalle damier datte débarras dédale degré dentiste dépôt
diadème dindon diorama dirigeable docteur dolmen donjon dossier douane dragée duvet ébène écharpe éclat
écluse écrou écurie édredon égout élastique embarcadère émail enclume endive engin entrepôt épagneul épaule
épervier équerre escabeau escadre esquif estuaire étal étau étendard étui faïence fanal farandole fenouil
festin feuillage fiacre filature flacon flambeau flanelle fléau florin foulard fourche fourneau frisson
fronton furet fuseau gaine galaxie galion gamelle garenne gaufre gavotte geai gecko gingembre girouette glacier
glycine goéland gondole gouffre goujon gourde gouvernail gradin granit gravier grelot grillon griotte grizzli
guéridon guirlande gymnase hangar haricot harmonica havre hélice herbier hermine hêtre hockey houblon houle
hyène iceberg igloo infante jaguar jarre jasmin javelot jockey jonc jongleur judo kayak kimono kiosque lagune
landau lanière larme lasso latte lavoir layette lecteur levure libellule licorne lièvre limonade linotte
liseron litière loutre luciole luge lustre luth macaron madeleine magnolia maillet maillon malle mammouth
mandarine mangue manivelle mansarde marin marmite marteau mascotte massif matelas mazurka médaille méduse
mélèze menhir mercure merlan meunier micro migrateur minaret minuit mirabelle moellon molaire mollusque
monocle mosaïque moufle moustique muscade musette nacelle nacre narval navet nectar nougat novice nymphe
obélisque ocre oignon ombrelle onyx opale orchidée origami orme ouragan ourlet ovni pagode palette palissade
pampa panache panorama paon papaye paravent parchemin parquet passoire pastel patio patte pavot pelage
pélican pendule pépite perche pergola pétale pétrin peuplier phoque piment pinson pipeline piolet pistache
piton pivoine placette planeur platane plongeon pluvier pochette podium poivron polder pommier poney portique
potiron poulie prisme proue pupitre python quartz quenouille quetzal quiche radar rafale raifort rainette
rameau rapace ratatouille raton récif régate renne réglisse remous renfort rhubarbe ricochet risotto rivet
rodéo romarin roquette rotonde roulotte rubis rugby sablier safari salamandre salicorne sanglier saphir sarbacane
satellite saumon sauterelle scarabée scooter sculpture séquoia sextant sillon silo silex skate sloop socle
solfège sonnette sorbier soucoupe soufflet sphinx spirale squelette steppe stylo sumac surf tamaris tambourin
tandem tanière tarte tartine taverne téléphérique tempête terrasse thon tilleul tipi toboggan toucan toundra
tourelle tourteau tracteur traîneau tremplin triangle tricycle tringle tromblon trottoir truffe truite turban
ukulélé vaisseau vanille varan vasque velcro ventouse véranda verveine vestibule viaduc vigie vignoble
violette viorne vipère voilage volière vortex wapiti xylophone yacht yourte zénith zinc zodiaque
`
  .trim()
  .split(/\s+/);

/** Retire accents et ligatures : « fenêtre » → « fenetre », « coeur » reste « coeur ». */
export const sansAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE");

/** Liste sans doublon, avec ou sans accents. */
export const listeMotsFr = (accents: boolean): string[] => {
  const src = accents ? MOTS_FR : MOTS_FR.map(sansAccents);
  return [...new Set(src)];
};
