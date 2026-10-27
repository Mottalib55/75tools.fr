import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, QuestionFaq } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { cn } from "@/lib/utils";

const HREF = "/generateur-qr-code/";
const TITRE = "Générateur QR code gratuit : lien ou texte en PNG et SVG";
const DESCRIPTION =
  "Générateur de QR code gratuit et sans inscription : un lien ou un texte, couleurs, marge, correction L à H, en PNG ou SVG. Un QR statique qui n'expire jamais.";

const FAQ: QuestionFaq[] = [
  {
    q: "Le QR code que je crée ici va-t-il cesser de fonctionner un jour ?",
    r: "Non. Le code contient directement l'adresse ou le texte que vous avez saisi : aucun serveur de 75tools ne s'intercale entre le téléphone et la destination. Il n'a donc ni date d'expiration, ni compteur de scans, ni abonnement à renouveler. Il ne cessera de mener quelque part que si la page de destination elle-même disparaît ou change d'adresse.",
  },
  {
    q: "J'ai imprimé mes flyers et l'adresse de ma page a changé, je fais comment ?",
    r: "Le code imprimé pointe toujours vers l'ancienne adresse : il ne peut pas être modifié. La solution la plus simple est de mettre en place, sur votre site, une redirection de l'ancienne adresse vers la nouvelle. Pour les prochains supports, choisissez dès le départ une adresse stable, par exemple une page de votre site dont vous changez le contenu sans en changer l'adresse.",
  },
  {
    q: "Puis-je ajouter mon logo au centre du QR code ?",
    r: "Ce générateur ne le fait pas. Un logo posé au centre masque une partie des modules : le code ne reste lisible que grâce à la correction d'erreur, qui reconstitue environ 30 % des données au niveau H. Si vous ajoutez un logo vous-même dans un logiciel de dessin, choisissez le niveau H, gardez le logo petit, n'empiétez jamais sur les trois grands carrés des coins et testez avec plusieurs téléphones.",
  },
  {
    q: "Combien de caractères peut contenir un QR code ?",
    r: "Au maximum, d'après Denso Wave, l'inventeur du QR code : 7 089 chiffres, 4 296 caractères alphanumériques simples ou 2 953 octets de texte quelconque, au niveau de correction le plus bas. En pratique, un code aussi chargé devient très dense et difficile à lire. Un lien court ou quelques phrases donnent un code simple, lisible même imprimé petit.",
  },
  {
    q: "Ce que je tape dans le générateur est-il enregistré quelque part ?",
    r: "Non. Le dessin du QR code est calculé par votre navigateur, à partir du texte saisi, avec une bibliothèque chargée avec la page. Rien n'est envoyé à 75tools ni à un autre service, et rien n'est conservé quand vous fermez l'onglet. Vous pouvez donc y mettre une adresse interne ou un texte confidentiel sans qu'il quitte votre appareil.",
  },
];

const SOURCES = [
  {
    editeur: "Denso Wave (QRcode.com)",
    titre: "Error correction feature (niveaux de correction L, M, Q et H)",
    url: "https://www.qrcode.com/en/about/error_correction.html",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Denso Wave (QRcode.com)",
    titre: "Point for determining the code area (marge de quatre modules)",
    url: "https://www.qrcode.com/en/howto/code.html",
    lu: "27 octobre 2026",
  },
  {
    editeur: "Denso Wave (QRcode.com)",
    titre: "Standardization of QR Code (capacité maximale)",
    url: "https://www.qrcode.com/en/about/standards.html",
    lu: "27 octobre 2026",
  },
];

type Mode = "lien" | "texte";

const GenerateurQrCode = () => {
  const [mode, setMode] = useState<Mode>("lien");
  const [lien, setLien] = useState("https://www.exemple.fr/");
  const [texte, setTexte] = useState("");

  const { contenu, remarque } = useMemo(() => {
    if (mode === "texte") return { contenu: texte, remarque: "" };
    const s = lien.trim();
    if (!s) return { contenu: "", remarque: "" };
    const avecSchema = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
    try {
      const u = new URL(avecSchema);
      if ((u.protocol === "https:" || u.protocol === "http:") && !u.hostname.includes(".")) {
        return { contenu: avecSchema, remarque: "Le nom de domaine paraît incomplet : vérifiez l'adresse." };
      }
      return {
        contenu: avecSchema,
        remarque: avecSchema !== s ? "« https:// » a été ajouté devant l'adresse, sans quoi le téléphone la lirait comme du texte." : "",
      };
    } catch {
      return { contenu: s, remarque: "Ce n'est pas une adresse web valide : le code contiendra ce texte tel quel." };
    }
  }, [mode, lien, texte]);

  return (
    <PageOutil
      href={HREF}
      titre={TITRE}
      description={DESCRIPTION}
      motsCles="générateur qr code gratuit, créer un qr code gratuit, qr code generator en français, qr code sans inscription, qr code png svg"
      nomAppli="Générateur de QR code gratuit"
      h1="Créer un QR code gratuit, sans inscription"
      chapeau="Collez un lien ou tapez un texte : le QR code se met à jour à chaque frappe. Réglez les couleurs et la marge, puis téléchargez-le en PNG ou en SVG. Le code est calculé dans votre navigateur et ne passe par aucun serveur."
      faq={FAQ}
      sources={SOURCES}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
        <div className="order-first lg:order-last lg:sticky lg:top-4">
          <QrApercu texte={contenu} nomFichier="qr-code" id="qr-generateur" vide="Saisissez un lien ou un texte." />
        </div>

        <form className="space-y-4 min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="Contenu du QR code">
          <div role="radiogroup" aria-label="Type de contenu" className="inline-flex rounded-md border border-neutral-700 p-1">
            {(["lien", "texte"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "h-10 px-4 rounded text-sm font-medium",
                  mode === m ? "bg-sky-400 text-neutral-950" : "text-neutral-300 hover:text-white"
                )}
              >
                {m === "lien" ? "Lien" : "Texte"}
              </button>
            ))}
          </div>

          {mode === "lien" ? (
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Adresse web</span>
              <input
                id="champ-lien"
                type="url"
                inputMode="url"
                value={lien}
                onChange={(e) => setLien(e.target.value)}
                placeholder="https://www.votre-site.fr/page"
                className={classeChamp}
                autoComplete="url"
              />
            </label>
          ) : (
            <label className="block min-w-0">
              <span className="block text-sm text-neutral-300 mb-1">Texte</span>
              <textarea
                id="champ-texte"
                rows={6}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder="Code d'accès de la salle : 4521. Merci de refermer la porte."
                className={classeZoneTexte}
              />
              <span className="block text-xs text-neutral-500 mt-1">
                Le téléphone affichera ce texte tel quel, sans connexion. Plus il est long, plus le code est dense.
              </span>
            </label>
          )}
          {remarque && (
            <p role="status" className="text-sm text-amber-300">
              {remarque}
            </p>
          )}

          <div className="rounded-lg border border-neutral-800 p-4 text-sm text-neutral-400 space-y-2">
            <p className="text-neutral-200">Un besoin précis ? Ces générateurs préparent le bon format :</p>
            <ul className="grid gap-1 sm:grid-cols-2 [&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-4">
              <li><Link to="/qr-code-wifi/">QR code wifi</Link> : se connecter sans taper le mot de passe</li>
              <li><Link to="/qr-code-whatsapp/">QR code WhatsApp</Link> : ouvrir une discussion avec vous</li>
              <li><Link to="/qr-code-pdf/">QR code vers un PDF</Link> : menu, plaquette, notice</li>
              <li><Link to="/qr-code-avis-google/">QR code avis Google</Link> : la fenêtre d'avis de votre fiche</li>
              <li><Link to="/carte-de-visite-qr-code/">QR code vCard</Link> : enregistrer vos coordonnées</li>
              <li><Link to="/lire-qr-code/">Lire un QR code</Link> : vérifier ce que contient un code</li>
            </ul>
          </div>
        </form>
      </div>

      <Section titre="QR code statique ou dynamique : la vraie différence">
        <p>
          Le code créé ici est <strong>statique</strong> : il contient l'adresse elle-même, écrite dans le dessin. Le
          téléphone qui le scanne lit cette adresse et l'ouvre directement. Aucun intermédiaire, donc rien qui puisse
          expirer, être suspendu ou devenir payant au bout de quelques mois.
        </p>
        <p>
          Beaucoup de sites de « QR code gratuit » produisent en réalité des codes <strong>dynamiques</strong> : le
          dessin contient une adresse courte qui appartient au service, lequel redirige ensuite vers votre page. Cela
          permet de compter les scans et de changer la destination après impression, mais le code ne fonctionne que
          tant que le service le veut bien. À la fin d'un essai gratuit ou d'un abonnement, la redirection peut être
          coupée, et tous les supports imprimés mènent alors vers une page d'erreur ou une publicité.
        </p>
        <p>
          La contrepartie honnête du code statique : <strong>on ne peut pas changer sa destination</strong> une fois
          imprimé. Pour garder de la souplesse sans dépendre d'un tiers, faites pointer le code vers une page de votre
          propre site, dont vous modifiez le contenu à volonté, ou prévoyez une redirection sur votre site si l'adresse
          doit changer. Évitez aussi les raccourcisseurs de liens : ils recréent exactement la dépendance que le code
          statique évite.
        </p>
      </Section>

      <Section titre="Couleurs, marge et correction d'erreur : les bons réglages">
        <p>
          <strong>La couleur.</strong> Un lecteur de QR code cherche des modules foncés sur un fond clair. Vous pouvez
          prendre un bleu marine ou un bordeaux à la place du noir, à condition de garder un fort contraste avec le
          fond : le générateur affiche une alerte quand le contraste devient faible ou quand les couleurs sont
          inversées (code clair sur fond foncé), deux cas que beaucoup de téléphones lisent mal.
        </p>
        <p>
          <strong>La marge.</strong> Denso Wave, l'entreprise qui a inventé le QR code, demande une zone vide de quatre
          modules de large tout autour du symbole. C'est le réglage par défaut. La réduire fait gagner un peu de place,
          mais le code collé contre un texte ou un bord coloré devient plus difficile à repérer pour l'appareil photo.
        </p>
        <p>
          <strong>La correction d'erreur.</strong> Le QR code contient des données redondantes qui permettent de le lire
          même partiellement abîmé : environ 7 % au niveau L, 15 % au niveau M, 25 % au niveau Q et 30 % au niveau H.
          Plus le niveau est haut, plus le code a de modules à contenu égal. M convient à la plupart des usages ;
          choisissez Q ou H pour un support exposé (vitrine, extérieur, étiquette qui se frotte).
        </p>
        <p>
          <strong>Le format.</strong> Le SVG est un dessin vectoriel, net à toutes les tailles : c'est celui à donner à
          un imprimeur ou à placer dans un logiciel de mise en page. Le PNG convient pour un document bureautique, un
          e-mail ou un réseau social. Sous l'aperçu, la taille d'un module pour un code de 3 cm vous aide à juger si
          l'impression restera lisible.
        </p>
      </Section>

      <Section titre="Avant d'imprimer : trois vérifications">
        <p>
          Scannez le code affiché à l'écran avec deux téléphones différents et vérifiez que la page qui s'ouvre est la
          bonne, y compris sur les données mobiles, hors du wifi de l'entreprise. Imprimez ensuite un exemplaire à la
          taille réelle et refaites l'essai à la distance où les gens le scanneront : un code sur une affiche lue à deux
          mètres doit être bien plus grand qu'un code sur un ticket de caisse.
        </p>
        <p>
          Enfin, ajoutez une ligne de texte à côté du code (« Scannez pour voir le menu ») et, si possible, l'adresse
          en clair. Les personnes qui n'ont pas de lecteur, ou qui se méfient à juste titre des QR codes inconnus,
          pourront taper l'adresse elles-mêmes.
        </p>
      </Section>
    </PageOutil>
  );
};

export default GenerateurQrCode;
