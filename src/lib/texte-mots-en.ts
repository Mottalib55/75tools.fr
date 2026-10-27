/**
 * Liste de mots anglais courants (noms, adjectifs, verbes), composée pour 75tools, utilisée par le
 * générateur de phrases de passe de la page anglaise. Uniquement des lettres a-z en minuscules, de 3 à
 * 9 lettres, faciles à taper sur n'importe quel clavier. Les doublons éventuels sont retirés à l'usage :
 * l'entropie affichée est calculée sur la taille réelle de la liste dédoublonnée.
 */
export const MOTS_EN = `
able about above absent absorb accent accept access acid acorn across act action active actor adapt add adult
advice affair afford afraid after again agency agent agree ahead aim air airport aisle alarm album alert alien
alike alive alley allow almond alone along alpha already also alter always amazing amber amount amuse anchor
ancient angle animal ankle annual answer antique anvil anyone apart apple apricot april apron arch arctic area
arena argue arise arm armor army aroma around arrange arrest arrive arrow art artist ash aside ask asleep aspect
asset atlas atom attach attic attend audio august aunt author autumn avenue avocado avoid awake award aware away
awesome axis baby bacon badge bag bake baker balance balcony ball bamboo banana band banjo bank banner barley
barn barrel base basil basket bath battery bay beach beacon bead beam bean bear beard beat beaver become bed bee
beef before begin behave behind believe bell belong below belt bench bend benefit berry best better between
beyond bicycle big bike bird birth biscuit bishop bit bitter black blade blank blanket blast blaze blend bless
blind block bloom blossom blouse blue blur board boat body boil bold bolt bone bonus book boost boot border
borrow boss bottle bottom bounce bowl box brain branch brand brass brave bread break breeze brick bridge brief
bright bring brisk broad bronze brook broom brother brown brush bubble bucket budget buffalo build bulb bundle
bunny burger burst bus bush busy butter button buyer buzz cabin cable cactus cage cake call calm camel camera
camp canal candle candy canoe canvas canyon cap capital captain car caramel carbon card cargo carpet carrot
carry cart case cash castle casual cat catalog catch cattle cause cave cedar ceiling celery cell cellar cement
cereal chair chalk change channel chapter charge chart chase cheap check cheek cheese chef cherry chess chest
chicken chief child chimney chin chip choice choose chorus cider cinema circle circus citizen city civil claim
clap class clay clean clear clerk clever click client cliff climb clinic clip clock close cloth cloud clover
clown club clue coach coast coat cobalt cocoa coconut code coffee coin cold collar color column comet comfort
comic common compass complex concert confirm copper copy coral core corn corner cost cottage cotton couch
country couple course cousin cover cozy crab craft crane crash crater crayon cream credit creek crew cricket
crisp crop cross crowd crown crumb crunch crystal cube culture cup cupboard curious current curtain curve
cushion custom cycle daisy damp dance danger daring dark dash data date dawn day deal dealer debate decade
decide deck deer degree delay deliver demand denim dentist depart depth deputy desert design desk detail
device dial diamond diary diesel diet differ digital dinner direct dish display dive divide doctor document
dog dollar dolphin domain donkey door double dough dove down dozen draft dragon drama draw dream dress drift
drill drink drive drum dry duck dune during dust duty eager eagle early earn earth easel east easy echo
eclipse edge editor effort eight elbow elder elegant element elephant elevator eleven elite else embrace
emerald emotion empty enact end energy engine enjoy enough enter entire entry envelope equal equip era
erase escape essay estate evening event ever evident exact example excite exercise exist exit exotic expand
expect expert explain expose express extra eye fabric face fact factor fade fair faith fall false family
famous fancy far farm fashion fast father fault favor feather feature february fee feed feel fence festival
fetch fever few fiber fiction field fifteen fifty figure file film filter final find fine finger finish
fire firm first fish fit five flag flame flash flat flavor fleet flight float flock floor flour flower fluid
flute fly foam focus fog foil fold folk follow food foot forest forget fork form fort forum forward fossil
found fox frame fresh friday fridge friend frog front frost fruit fuel full fun funny future gadget galaxy
gallery game gap garage garden garlic gas gate gather gauge gear gentle genuine giant gift ginger giraffe
girl give glad glance glass glide globe glove glow glue goat gold golf good goose gorilla gospel govern gown
grab grace grade grain grant grape graph grass gravel gravity great green grid grill grocery group grow guard
guess guest guide guitar gulf habit hair half hall hammer hamster hand handle harbor hard harvest hat have
hawk hazel head health heart heat heavy hedge height hello helmet help hen herb hero hidden high hill hint hip
history hobby hockey hold holiday hollow home honey hood hook hope horizon horn horse hospital host hotel hour
house hover huge human humble humor hundred hungry hunt hurry husband hybrid ice icon idea ideal image impact
improve inch include income index indoor infant inform inner input insect inside inspire install intact into
invest invite iron island issue item ivory ivy jacket jaguar jam january jar jazz jeans jelly jewel job join
joke journal journey joy judge juice july jump june jungle junior jury just kangaroo keen keep kettle key kick
kid kind king kingdom kiss kit kitchen kite kitten kiwi knee knife knock know label labor lace ladder lady
lake lamp land lane language laptop large later laugh laundry lava lawn lawyer layer lazy leader leaf learn
leather leave lecture left legal legend lemon lend length lens leopard lesson letter level liberty library
license lid life lift light like limb limit linen lion lip liquid list little live lizard load loan lobster
local lock lodge logic lonely long loop lottery loud lounge love loyal lucky lumber lunar lunch luxury lyrics
machine magic magnet maid mail main major make mammal manage mango manual maple marble march margin marine
market marry mask mass master match material matter maximum meadow meal measure meat medal media melody melt
member memory mention menu mercy merge merit merry mesh message metal method middle midnight milk million
mimic mind minor minute miracle mirror misty mix mobile model modern modest moment monday money monkey month
mood moon moral more morning mosaic motion motor mountain mouse move movie much muffin mule multiply muscle
museum mushroom music must mutual myself mystery myth napkin narrow nation nature near neat neck need needle
neither nephew nerve nest net network neutral never news next nice niece night noble noise north nose notable
note nothing notice novel november number nurse nut oak oasis obey object oblige ocean october odor offer
office often oil okay olive olympic omit once onion online only open opera opinion option orange orbit
orchard order ordinary organ orient original orphan ostrich other outdoor outer output outside oval oven over
owl owner oxygen oyster ozone pact paddle page pair palace palm panda panel panic panther paper parade parent
park parrot party pass patch path patient patrol pattern pause pave peace peach peanut pear pebble pelican pen
pencil people pepper perfect permit person pet phone photo phrase piano picnic picture piece pig pigeon pill
pilot pink pioneer pipe pitch pizza place planet plastic plate play please pledge pluck plug plunge
poem poet point polar pole police pond pony pool popular portion position possible post potato pottery
poverty powder power practice praise predict prefer prepare present pretty prevent price pride primary print
priority prison private prize problem process produce profit program project promote proof property prosper
protect proud provide public pudding pull pulp pulse pumpkin punch pupil puppy purchase purity purpose purse
push puzzle pyramid quality quantum quarter question quick quiet quilt quiz quote rabbit raccoon race rack
radar radio rail rain raise rally ramp ranch random range rapid rare rate rather raven razor ready real reason
rebel rebuild recall receive recipe record recycle reduce reflect reform refuse region regret regular reject
relax release relief rely remain remember remind remove render renew rent reopen repair repeat replace report
require rescue resemble resist resource response result retire retreat return reunion reveal review reward
rhythm ribbon rice rich ride ridge right rigid ring ripple risk ritual rival river road roast robot
robust rocket romance roof rookie room rose rotate rough round route royal rubber rude rug rule run runway
rural saddle sadness safe sail salad salmon salon salt salute same sample sand satisfy saturday sauce sausage
save say scale scan scatter scene scheme school science scissors scorpion scout scrap screen script scrub sea
search season seat second secret section security seed seek segment select sell seminar senior sense
sentence series service session settle setup seven shadow shaft shallow share shed shell sheriff shield shift
shine ship shiver shoe shoot shop short shoulder shove shrimp shrug shuffle shy sibling sick side siege
sight sign silent silk silly silver similar simple since sing siren sister situate six size skate sketch ski
skill skin skirt skull slab slam sleep slender slice slide slight slim slogan slot slow slush small smart
smile smoke smooth snack snake snap sniff snow soap soccer social sock soda soft solar soldier solid solution
solve someone song soon sorry sort soul sound soup source south space spare spatial spawn speak special speed
spell spend sphere spice spider spike spin spirit split spoil sponsor spoon sport spot spray spread spring
spy square squeeze squirrel stable stadium staff stage stairs stamp stand start state stay steak steel stem
step stereo stick still sting stock stomach stone stool story stove strategy street strike strong struggle
student stuff stumble style subject submit subway success such sudden suffer sugar suggest suit summer sun
sunday sunny sunset super supply supreme sure surface surge surprise surround survey suspect sustain swallow
swamp swap swarm swear sweet swift swim swing switch sword symbol symptom syrup system table tackle tag tail
talent talk tank tape target task taste tattoo taxi teach team tell ten tenant tennis tent term test text
thank that theme then theory there they thing this thought three thrive throw thumb thunder thursday ticket
tide tiger tilt timber time tiny tip tired tissue title toast today toddler toe together toilet token
tomato tomorrow tone tongue tonight tool tooth top topic torch tornado tortoise toss total tourist toward
tower town toy track trade traffic tragic train transfer trap trash travel tray treat tree trend trial tribe
trick trigger trim trip trophy trouble truck true truly trumpet trust truth try tube tuesday tuition tulip
tumble tuna tunnel turkey turn turtle twelve twenty twice twin twist two type typical ugly umbrella unable
unaware uncle uncover under undo unfair unfold unhappy uniform unique unit universe unknown unlock until
unusual unveil update upgrade uphold upon upper upset urban usage use used useful useless usual utility
vacant vacuum vague valid valley valve van vanish vapor various vast vault vehicle velvet vendor venture venue
verb verify version very vessel veteran viable vibrant vicious victory video view village vintage violin
virtual virus visa visit visual vital vivid vocal voice volcano volume vote voyage wage wagon wait walk wall
walnut want warm warrior wash wasp waste water wave way wealth weapon wear weasel weather web wedding
wednesday weekend weird welcome west wet whale what wheat wheel when where whip whisper wide width wife wild
will win window wine wing wink winner winter wire wisdom wise wish witness wolf woman wonder wood wool word
work world worry worth wrap wreck wrestle wrist write wrong yard year yellow yogurt young youth zebra zero
zone zoo
acrobat admiral almanac ambush anthem apron arcade armadillo atrium avalanche backpack badger bagel ballad
bandit banquet barber bargain baron basin beetle beret bison blender blizzard bobcat bonfire bonnet bouquet
boxer bracelet breakfast brownie buckle bugle burrow butler cactus cadet calendar camper candle cannon
caravan cardigan carnival cashew cassette cavern cello chalet chamber chapel chariot cheetah chestnut chili
chipmunk chowder cinnamon clarinet cobra cocktail collie compost condor cookie cornet cottage cougar coyote
crayfish crescent croquet crouton cupcake custard cutlass dagger dahlia dandelion decoy denim dessert
dinosaur dolphin domino doorbell dragonfly driftwood dumpling dynamo earring eggplant elk emblem engine
falcon fennel ferret ferry fiddle firefly fjord flamingo flannel flapjack fountain freckle frigate fudge
gargoyle gazelle geyser glacier goblet gondola gopher granite griffin guava gumdrop hamlet hammock harmonica
harp hazelnut hedgehog heron hickory hippo hornet hummus husky iceberg igloo iguana inkwell jasmine javelin
jellyfish jigsaw juggler kayak kennel kernel kestrel ketchup keyboard koala ladle lagoon lantern lasagna
latch lavender lemonade lettuce lighthouse lilac limestone llama locket lollipop lynx macaroni magpie mammoth
mandolin mantis marmalade marsh marshal meadow meteor minnow mitten moccasin mongoose moose mortar moth
mustard mutton nectar nightowl noodle nugget nutmeg oatmeal octopus omelet opal orchid otter paddock pancake
papaya parsley parsnip peacock pecan pelican penguin peony pepper pickle pinecone pinwheel pistachio plum
poncho popcorn porcupine porridge possum pretzel puffin quail quartz quince radish raisin rattle reindeer
rhubarb robin rooster saffron salsa sapphire sardine satchel scarecrow scallop scooter seagull sequoia
shamrock sherbet skillet skylark sloth snorkel sparrow spinach sprocket starfish stork strudel sunflower
swan sycamore tadpole tamarind tangerine teapot thimble thistle thyme toucan trellis trolley truffle tugboat
turnip tuxedo unicorn urchin vanilla velcro walrus waffle warbler weevil whistle wigwam willow wombat
woodpecker wren yacht yak yodel zeppelin zigzag zucchini
`
  .trim()
  .split(/\s+/)
  .filter((m) => /^[a-z]{3,9}$/.test(m));

/** Liste sans doublon. */
export const listeMotsEn = (): string[] => [...new Set(MOTS_EN)];
