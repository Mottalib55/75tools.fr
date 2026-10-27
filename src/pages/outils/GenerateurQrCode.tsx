import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeChamp, classeZoneTexte } from "@/components/outils/PageOutil";
import { Section, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { QrApercu } from "@/components/outils/QrApercu";
import { type Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
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
      r: "Au maximum, pour la plus grande version (177 × 177 modules) au niveau de correction le plus bas : 7 089 chiffres, 4 296 caractères alphanumériques simples ou 2 953 octets de texte quelconque, d'après Denso Wave, l'inventeur du QR code. En pratique, un code aussi chargé devient très dense et difficile à lire. Un lien court ou quelques phrases donnent un code simple, lisible même imprimé petit.",
    },
    {
      q: "Ce que je tape dans le générateur est-il enregistré quelque part ?",
      r: "Non. Le dessin du QR code est calculé par votre navigateur, à partir du texte saisi, avec une bibliothèque chargée avec la page. Rien n'est envoyé à 75tools ni à un autre service, et rien n'est conservé quand vous fermez l'onglet. Vous pouvez donc y mettre une adresse interne ou un texte confidentiel sans qu'il quitte votre appareil.",
    },
    {
      q: "Le code se lit à l'écran mais pas une fois imprimé, d'où vient le problème ?",
      r: "Presque toujours de la taille ou de la marge. Un code de 2 cm porté par une longue adresse a des modules de moins d'un demi-millimètre, que l'appareil photo distingue mal. Imprimez-le plus grand, raccourcissez l'adresse, et laissez une bande blanche de quatre modules autour. Vérifiez aussi que l'imprimante n'a pas éclairci le noir ou bavé sur un papier poreux.",
    },
  ],
  en: [
    {
      q: "Will the QR code I make here stop working after a free trial?",
      r: "No. The code holds your web address or text directly: no 75tools server sits between the phone and the destination, so there is no trial period, no scan counter and no subscription to renew. It only stops leading somewhere if the destination page itself is deleted or moves. Many generators that rank for this search create redirect codes that do expire, which is why this distinction matters.",
    },
    {
      q: "Can I change where the QR code points after printing it?",
      r: "Not the code itself: the address is drawn into it. What you can change is the page it opens. Point the code at a page on your own website and update that page whenever you like, or set up a redirect on your site if the address has to move. Avoid link shorteners, which put a third party back between your printed code and your page.",
    },
    {
      q: "How small can I print a QR code on a flyer or business card?",
      r: "For a short link of about 25 characters, around 2 cm wide is a sensible minimum for a card read at arm's length; a poster read from two metres needs 15 to 20 cm. The preview tells you the size of one module when the code is printed 3 cm wide: below about half a millimetre per module, print bigger or use a shorter address.",
    },
    {
      q: "Is it safe to type a private link or text into this generator?",
      r: "Yes, as far as 75tools is concerned. The QR code is drawn by your browser with a library loaded with the page: what you type is not sent to any server and nothing is kept when you close the tab. Remember, though, that anyone who scans the printed code can read its content, so do not encode a password you would not show.",
    },
    {
      q: "Which file should I send to a printer in France, PNG or SVG?",
      r: "Send the SVG. It is a vector drawing that stays sharp at any size, from a sticker to an A1 poster, and French print shops (imprimeurs) and layout software such as InDesign, Canva or Affinity accept it. Keep the PNG for a Word document, an email or a social media post. The 1,200 pixel PNG is enough for a code printed up to about 10 cm wide.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, Spécification de la symbologie de code à barres Code QR",
      url: "https://www.iso.org/fr/standard/62021.html",
      lu: "27 octobre 2026",
    },
    {
      editeur: "economie.gouv.fr",
      titre: "Arnaque au QR code ou quishing : comment la reconnaître et que faire ?",
      url: "https://www.economie.gouv.fr/particuliers/numerique-et-cybersecurite/arnaque-au-qr-code-ou-quishing-comment-la-reconnaitre-et-que-faire",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Cybermalveillance.gouv.fr",
      titre: "Le « quishing » : l'hameçonnage par QR code",
      url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/quishing-hameconnage-qr-code",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "Error correction feature (niveaux de correction L, M, Q et H)",
      url: "https://www.qrcode.com/en/about/error_correction.html",
      lu: "27 octobre 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "QR Code Standardization (capacité maximale)",
      url: "https://www.qrcode.com/en/about/standards.html",
      lu: "27 octobre 2026",
    },
  ],
  en: [
    {
      editeur: "ISO",
      titre: "ISO/IEC 18004:2015, QR Code bar code symbology specification",
      url: "https://www.iso.org/standard/62021.html",
      lu: "27 October 2026",
    },
    {
      editeur: "economie.gouv.fr",
      titre: "Arnaque au QR code ou quishing : comment la reconnaître et que faire ? (QR code scams: how to spot them, in French)",
      url: "https://www.economie.gouv.fr/particuliers/numerique-et-cybersecurite/arnaque-au-qr-code-ou-quishing-comment-la-reconnaitre-et-que-faire",
      lu: "27 October 2026",
    },
    {
      editeur: "Cybermalveillance.gouv.fr",
      titre: "Le « quishing » : l'hameçonnage par QR code (QR code phishing, in French)",
      url: "https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/quishing-hameconnage-qr-code",
      lu: "27 October 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "Error correction feature",
      url: "https://www.qrcode.com/en/about/error_correction.html",
      lu: "27 October 2026",
    },
    {
      editeur: "Denso Wave (QRcode.com)",
      titre: "QR Code Standardization",
      url: "https://www.qrcode.com/en/about/standards.html",
      lu: "27 October 2026",
    },
  ],
};

const T = {
  fr: {
    nomAppli: "Générateur de QR code gratuit 75tools",
    motsCles: "créer un qr code gratuit, générateur qr code gratuit, qr code sans inscription, qr code png svg, qr code qui n'expire pas",
    form: "Contenu du QR code",
    type: "Type de contenu",
    lien: "Lien",
    texte: "Texte",
    adresse: "Adresse web",
    lienDefaut: "https://www.exemple.fr/",
    phLien: "https://www.votre-site.fr/page",
    lTexte: "Texte",
    phTexte: "Code d'accès de la salle : 4521. Merci de refermer la porte.",
    aideTexte: "Le téléphone affichera ce texte tel quel, sans connexion. Plus il est long, plus le code est dense.",
    aideLien: "Le code se met à jour à chaque frappe. Il contient l'adresse elle-même : il n'expire jamais.",
    incomplet: "Le nom de domaine paraît incomplet : vérifiez l'adresse.",
    https: "« https:// » a été ajouté devant l'adresse, sans quoi le téléphone la lirait comme du texte.",
    invalide: "Ce n'est pas une adresse web valide : le code contiendra ce texte tel quel.",
    vide: "Saisissez un lien ou un texte.",
    fichier: "qr-code",
  },
  en: {
    nomAppli: "75tools free QR code generator",
    motsCles: "free qr code generator, qr code generator no sign up, qr code that never expires, qr code png svg, make a qr code",
    form: "QR code content",
    type: "Content type",
    lien: "Link",
    texte: "Text",
    adresse: "Web address",
    lienDefaut: "https://www.example.com/",
    phLien: "https://www.your-site.com/page",
    lTexte: "Text",
    phTexte: "Meeting room door code: 4521. Please close the door behind you.",
    aideTexte: "The phone shows this text as it is, offline. The longer it is, the denser the code.",
    aideLien: "The code updates as you type. It holds the address itself, so it never expires.",
    incomplet: "The domain name looks incomplete: check the address.",
    https: "\"https://\" was added in front of the address, otherwise the phone would read it as plain text.",
    invalide: "This is not a valid web address: the code will hold this text as it is.",
    vide: "Enter a link or a text.",
    fichier: "qr-code",
  },
};

type Mode = "lien" | "texte";

const GenerateurQrCode = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const [mode, setMode] = useState<Mode>("lien");
  const [lien, setLien] = useState(t.lienDefaut);
  const [texte, setTexte] = useState("");

  const { contenu, remarque } = useMemo(() => {
    if (mode === "texte") return { contenu: texte, remarque: "" };
    const s = lien.trim();
    if (!s) return { contenu: "", remarque: "" };
    const avecSchema = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
    try {
      const u = new URL(avecSchema);
      if ((u.protocol === "https:" || u.protocol === "http:") && !u.hostname.includes(".")) {
        return { contenu: avecSchema, remarque: t.incomplet };
      }
      return { contenu: avecSchema, remarque: avecSchema !== s ? t.https : "" };
    } catch {
      return { contenu: s, remarque: t.invalide };
    }
  }, [mode, lien, texte, t]);

  const outil = (
    <form
      className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:grid-rows-[auto_1fr] items-start"
      onSubmit={(e) => e.preventDefault()}
      aria-label={t.form}
    >
      <div className="space-y-4 min-w-0 lg:col-start-1 lg:row-start-1">
        <div role="radiogroup" aria-label={t.type} className="inline-flex rounded-md border border-neutral-700 p-1">
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
              {m === "lien" ? t.lien : t.texte}
            </button>
          ))}
        </div>

        {mode === "lien" ? (
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.adresse}</span>
            <input
              id="champ-lien"
              type="url"
              inputMode="url"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              placeholder={t.phLien}
              className={classeChamp}
              autoComplete="url"
            />
            <span className="block text-xs text-neutral-500 mt-1">{t.aideLien}</span>
          </label>
        ) : (
          <label className="block min-w-0">
            <span className="block text-sm text-neutral-300 mb-1">{t.lTexte}</span>
            <textarea
              id="champ-texte"
              rows={6}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={t.phTexte}
              className={classeZoneTexte}
            />
            <span className="block text-xs text-neutral-500 mt-1">{t.aideTexte}</span>
          </label>
        )}
        {remarque && (
          <p role="status" className="text-sm text-amber-300">
            {remarque}
          </p>
        )}
      </div>

      <div data-resultat className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
        <QrApercu texte={contenu} nomFichier={t.fichier} id="qr-generateur" vide={t.vide} />
      </div>
    </form>
  );

  return (
    <PageOutil
      id="generateur-qr-code"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr /> : <ContenuEn />}
    </PageOutil>
  );
};

const ContenuFr = () => (
  <>
    <Section titre="Créer un QR code gratuit en trente secondes">
      <p>
        Pour créer un QR code gratuit, collez l'adresse de votre page dans le champ « Adresse web », ou passez sur
        « Texte » pour un message affiché sans connexion : le code se dessine aussitôt à côté, et deux boutons le
        téléchargent en PNG (1 200 pixels de côté par défaut) ou en SVG pour l'imprimeur. Aucune inscription, aucune
        limite de nombre ni de durée. Exemple concret : l'adresse https://www.exemple.fr/menu, longue de 27 caractères,
        donne au niveau de correction M un code de 29 × 29 modules ; imprimé sur 3 cm, chaque module mesure environ
        0,8 mm, ce qu'un téléphone lit sans peine à 30 cm. La limite principale tient au principe même du code
        statique : l'adresse est inscrite dans le dessin, on ne peut donc plus la changer après impression. Pour garder
        la main, faites pointer le code vers une page de votre propre site, dont vous modifierez le contenu.
      </p>
    </Section>

    <Section titre="QR code statique ou dynamique : la vraie différence">
      <p>
        Le code créé ici est <strong>statique</strong> : il contient l'adresse elle-même. Le téléphone qui le scanne lit
        cette adresse et l'ouvre directement. Aucun intermédiaire, donc rien qui puisse expirer, être suspendu ou
        devenir payant au bout de quelques mois.
      </p>
      <p>
        Beaucoup de sites de « QR code gratuit » produisent en réalité des codes <strong>dynamiques</strong> : le dessin
        contient une adresse courte qui appartient au service, lequel redirige ensuite vers votre page. Cela permet de
        compter les scans et de changer la destination après impression, mais le code ne fonctionne que tant que le
        service le veut bien. À la fin d'un essai gratuit, la redirection peut être coupée, et tous les supports
        imprimés mènent alors vers une page d'erreur ou une publicité. Évitez aussi les raccourcisseurs de liens : ils
        recréent exactement cette dépendance.
      </p>
    </Section>

    <Section titre="Couleurs, marge et correction d'erreur : les bons réglages">
      <p>
        Les réglages se trouvent sous l'aperçu. La norme internationale ISO/IEC 18004 décrit le symbole : des modules
        foncés sur un fond clair, une zone vide de quatre modules tout autour, et quatre niveaux de correction d'erreur.
        Chaque réglage a donc une raison d'être.
      </p>
      <p>
        <strong>La couleur.</strong> Un bleu marine ou un bordeaux peuvent remplacer le noir, à condition de garder un
        fort contraste avec le fond. Le générateur affiche une alerte quand le contraste devient faible ou quand les
        couleurs sont inversées (code clair sur fond foncé), deux cas que beaucoup de téléphones lisent mal.
      </p>
      <p>
        <strong>La marge.</strong> Les quatre modules vides sont le réglage par défaut. Les réduire fait gagner un peu
        de place, mais un code collé contre un texte ou un bord coloré devient plus difficile à repérer pour l'appareil
        photo.
      </p>
      <p>
        <strong>La correction d'erreur.</strong> Le code contient des données redondantes qui permettent de le lire
        même partiellement abîmé : environ 7 % au niveau L, 15 % au niveau M, 25 % au niveau Q et 30 % au niveau H.
        Plus le niveau est haut, plus le code a de modules à contenu égal. M convient à la plupart des usages ; Q ou H
        pour une vitrine, un extérieur ou une étiquette qui se frotte.
      </p>
      <p>
        <strong>Le format.</strong> Le SVG est un dessin vectoriel, net à toutes les tailles : c'est celui à donner à un
        imprimeur. Le PNG convient pour un document bureautique, un e-mail ou un réseau social.
      </p>
    </Section>

    <Section titre="Avant d'imprimer : vérifier, puis protéger ceux qui scannent">
      <p>
        Scannez le code affiché à l'écran avec deux téléphones différents et vérifiez que la page qui s'ouvre est la
        bonne, y compris en données mobiles, hors du wifi de l'entreprise. Imprimez ensuite un exemplaire à la taille
        réelle et refaites l'essai à la distance où les gens le scanneront : un code sur une affiche lue à deux mètres
        doit être bien plus grand qu'un code sur un ticket de caisse.
      </p>
      <p>
        Pensez aussi aux arnaques. Le ministère de l'Économie décrit le « quishing », l'hameçonnage par QR code : des
        escrocs collent leur propre code par-dessus un code légitime, sur un parcmètre, une borne de recharge, une
        affiche ou un menu de restaurant, et conseillent aux particuliers de vérifier l'adresse affichée après le scan.
        Facilitez-leur la tâche : écrivez l'adresse en clair sous le code, choisissez une adresse sur votre propre
        domaine plutôt qu'un lien raccourci illisible, et contrôlez de temps en temps vos affiches pour repérer un
        autocollant ajouté. L'outil <Link to="/lire-qr-code/">Lire un QR code</Link> montre le contenu d'un code sans
        ouvrir le lien.
      </p>
      <p>
        Pour un besoin précis, d'autres pages préparent le bon format : le{" "}
        <Link to="/qr-code-wifi/">QR code wifi</Link> connecte vos invités sans dicter le mot de passe, et le{" "}
        <Link to="/qr-code-whatsapp/">QR code WhatsApp</Link> ouvre une discussion avec vous.
      </p>
    </Section>
  </>
);

const ContenuEn = () => (
  <>
    <Section titre="Make a free QR code in thirty seconds">
      <p>
        This free QR code generator works as soon as you paste a web address into the "Web address" box, or switch to
        "Text" for a message that displays offline: the code is drawn next to it straight away, and two buttons save it
        as a PNG (1,200 pixels square by default) or as an SVG for your printer. No sign-up, no limit on how many codes
        you make or how long they last. A concrete example: https://www.example.com/menu, 28 characters long, gives a
        code of 29 × 29 modules at error correction level M; printed 3 cm wide, each module is about 0.8 mm, which any
        phone reads easily from 30 cm. The main limit comes with every static code: the address is written into the
        drawing, so it cannot be changed once printed. To keep control, point the code at a page on your own website
        and update that page instead.
      </p>
    </Section>

    <Section titre="Static or dynamic QR codes: why your code will not expire">
      <p>
        A code made here is <strong>static</strong>: the phone reads your address from the pattern and opens it, with
        nothing in between. Many "free" generators produce <strong>dynamic</strong> codes instead, which hold a short
        address owned by the service and redirect to your page. That lets them count scans, and lets them switch the
        redirect off when the free trial ends: every printed flyer then lands on an error page or an upsell screen.
        People running a gîte, a market stall or a micro-entreprise in France get caught by this regularly, often
        months after printing.
      </p>
      <p>
        If you need to change the destination later, keep the flexibility on your side: a page on your own domain, or a
        redirect you set up yourself. Link shorteners bring back the same third-party dependency, so leave them out.
      </p>
    </Section>

    <Section titre="Choosing colours, margin and error correction">
      <p>
        The settings sit under the preview. The international standard ISO/IEC 18004 defines the symbol as dark modules
        on a light background, surrounded by a quiet zone four modules wide, with four error correction levels. The
        defaults follow it.
      </p>
      <p>
        <strong>Colour.</strong> Navy or burgundy can replace black as long as the contrast with the background stays
        high. The tool warns you when contrast is low or when the colours are inverted (a light code on a dark
        background), which many phone cameras struggle with.
      </p>
      <p>
        <strong>Margin.</strong> Shrinking the quiet zone saves a few millimetres, but a code pressed against text or a
        coloured edge becomes harder for the camera to find.
      </p>
      <p>
        <strong>Error correction.</strong> Redundant data lets a damaged code still scan: roughly 7% can be recovered at
        level L, 15% at M, 25% at Q and 30% at H. Higher levels mean more modules for the same content. M suits most
        uses; pick Q or H for a shop window, an outdoor sign or a label that gets rubbed.
      </p>
      <p>
        <strong>File type.</strong> SVG is vector artwork that stays sharp at any size, the one to send to a print shop.
        PNG is fine for a Word file, an email or a social post.
      </p>
    </Section>

    <Section titre="Before printing: test it and protect the people who scan it">
      <p>
        Scan the on-screen code with two different phones, on mobile data rather than your office wifi, and check that
        the right page opens. Then print one copy at real size and test it from the distance people will stand at: a
        poster read from two metres needs a much bigger code than a till receipt.
      </p>
      <p>
        France has a name for QR code fraud, "quishing" (from QR code and phishing). The French Ministry of the Economy
        describes scammers sticking their own code over a genuine one on parking meters, EV charging points, posters
        and restaurant menus, and tells the public to check the address shown after scanning. Make that easy: print the
        address in plain text under the code, use an address on your own domain rather than an unreadable short link,
        and check your posters now and then for an added sticker. The <Link to="/en/qr-code-reader/">QR code reader</Link>{" "}
        shows what a code contains without opening the link.
      </p>
      <p>
        For specific needs, the <Link to="/en/wifi-qr-code/">wifi QR code generator</Link> lets guests join your network
        without typing the password, and the <Link to="/en/whatsapp-qr-code/">WhatsApp QR code</Link> opens a chat with
        you.
      </p>
    </Section>
  </>
);

export default GenerateurQrCode;
