import { useState } from "react";
import { Link } from "react-router-dom";
import { PageOutil, classeSelect } from "@/components/outils/PageOutil";
import { Section, Champ, Bouton, QuestionFaq, Source } from "@/components/outils/OutilLayout";
import { modeles, Modele, Style } from "@/lib/modeles-carte";
import type { Langue } from "@/lib/langue";
import { cn } from "@/lib/utils";

const FAQ: Record<Langue, QuestionFaq[]> = {
  fr: [
    {
      q: "Quelle est la taille standard d'une carte de visite en France ?",
      r: "Le format proposé par défaut par les imprimeurs en France est 85 × 55 mm. Il est proche de celui d'une carte bancaire (85,60 × 53,98 mm), si bien qu'il entre dans les mêmes porte-cartes. Le format américain, 3,5 × 2 pouces (88,9 × 50,8 mm), est plus long et plus étroit : ne mélangez pas les deux gabarits quand vous préparez le fichier.",
    },
    {
      q: "Qu'est-ce que le fond perdu, et faut-il le prévoir ?",
      r: "C'est une bordure de 3 mm en général, ajoutée tout autour du format, où l'on prolonge le fond ou l'image. Les cartes sont coupées par paquets et la lame peut dévier d'un millimètre : sans fond perdu, un liseré blanc apparaît sur le bord. Pour une carte de 85 × 55 mm, le fichier mesure donc 91 × 61 mm. Une carte à fond blanc n'en a pas besoin.",
    },
    {
      q: "Puis-je imprimer mes cartes de visite moi-même avec une imprimante de bureau ?",
      r: "Oui, avec la planche de ce modèle : dix cartes sur une feuille A4, avec des traits de coupe. Utilisez un papier cartonné accepté par votre imprimante, dont le grammage maximal figure dans sa notice, réglez l'impression à 100 % sans « ajuster à la page », puis coupez au cutter et à la règle. Pour un grand nombre de cartes, un imprimeur reste plus net.",
    },
    {
      q: "Quelles mentions mettre sur la carte de visite d'un auto-entrepreneur ?",
      r: "Service Public ne cite pas la carte de visite, mais demande qu'un entrepreneur individuel fasse précéder ou suivre son nom de « EI » ou « entrepreneur individuel » sur ses documents commerciaux, et que ses documents publicitaires portent le numéro Siren et la mention RCS ou RNE. Si la carte sert à prospecter, ajoutez cette ligne en petit, par exemple « Amandine Roux EI · Siren 000 000 000 ».",
    },
    {
      q: "Faut-il mettre un QR code sur sa carte de visite ?",
      r: "C'est utile si la personne doit pouvoir enregistrer vos coordonnées sans les recopier. Un QR code vCard contient le contact lui-même et marche sans connexion ; un QR code vers une carte en ligne peut être mis à jour après l'impression. Le générateur de QR code vCard de 75tools produit un fichier SVG à placer au verso, avec sa marge blanche autour.",
    },
    {
      q: "Comment obtenir un PDF de ma planche de cartes pour l'envoyer à un imprimeur ?",
      r: "Cliquez sur « Imprimer ou enregistrer en PDF », puis choisissez « Enregistrer au format PDF » comme imprimante, format A4, échelle 100 %, marges aucune. Vous obtenez une page de dix cartes de 85 × 55 mm, texte vectoriel compris. Pour un imprimeur professionnel, demandez-lui plutôt son gabarit à l'unité avec 3 mm de fond perdu : la planche est faite pour la découpe à la main.",
    },
  ],
  en: [
    {
      q: "What is the standard business card size in France?",
      r: "French printers default to 85 × 55 mm. That is close to a bank card (85.60 × 53.98 mm), so it fits the same card holders. The UK size is the same 85 × 55 mm, while the US size, 3.5 × 2 inches (88.9 × 50.8 mm), is longer and narrower: do not mix the two templates when you prepare a file for a French printer.",
    },
    {
      q: "What is bleed, and do I need it?",
      r: "Bleed is a margin, usually 3 mm, added all around the card where the background or image continues. Cards are cut in stacks and the blade can drift by a millimetre: without bleed, a thin white line shows on the edge. For an 85 × 55 mm card the file is therefore 91 × 61 mm. A card with a plain white background does not need it.",
    },
    {
      q: "Can I print the cards myself on an office printer?",
      r: "Yes, with the sheet this page prints: ten cards on one A4 page, with dashed cut lines. Use card stock your printer accepts (the maximum paper weight is in its manual), print at 100% without fit to page, then cut with a craft knife and a ruler. It is fine for a quick batch; for hundreds of cards a print shop gives cleaner edges.",
    },
    {
      q: "I am self-employed in France, which legal details go on my card?",
      r: "Service Public does not mention business cards, but a sole trader (entrepreneur individuel, including micro-entrepreneurs) must add EI or entrepreneur individuel next to their name on commercial documents, and advertising material must show the SIREN number and RCS or RNE registration. If you hand the card out to win clients, add that line in small print, for example Amandine Roux EI · Siren 000 000 000.",
    },
    {
      q: "How do I get a PDF of the sheet to send to a print shop?",
      r: "Click Print or save as PDF, then choose Save as PDF as the printer, A4 paper, 100% scale and no margins. You get one page with ten 85 × 55 mm cards, with vector text. A professional printer will usually prefer their own single-card template with 3 mm bleed, since this sheet is designed for cutting by hand.",
    },
  ],
};

const SOURCES: Record<Langue, Source[]> = {
  fr: [
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une micro-entreprise", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "27 octobre 2026" },
    { editeur: "Service Public Entreprendre", titre: "Devenir agent immobilier", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F32994", lu: "27 octobre 2026" },
  ],
  en: [
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société (commercial documents of a company)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une micro-entreprise (commercial documents of a micro-business)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux (new mandatory details for sole traders)", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "27 October 2026" },
    { editeur: "Service Public Entreprendre", titre: "Devenir agent immobilier (becoming an estate agent)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F32994", lu: "27 October 2026" },
  ],
};

const T = {
  fr: {
    nomAppli: "Modèles de carte de visite 75tools",
    motsCles: "modèle carte de visite, carte de visite à imprimer, modèle carte de visite gratuit, carte de visite artisan, format carte de visite",
    metier: "Métier",
    modele: (m: string) => `Modèle : ${m}`,
    texte: "Texte de la carte",
    nom: "Nom",
    titre: "Titre ou métier",
    entreprise: "Entreprise",
    ligne: (n: number) => `Ligne ${n}`,
    legal: "Ligne d'identification (petit texte)",
    legalAide: "EI, Siren, RCS ou RNE, capital pour une société : voir plus bas.",
    imprimer: "Imprimer ou enregistrer en PDF",
    style: "Style",
    styles: { sobre: "Sobre", bandeau: "Bandeau", centre: "Centré" } as Record<Style, string>,
    couleur: "Couleur",
    note: "Dans la fenêtre d'impression, choisissez « Enregistrer au format PDF » comme imprimante pour obtenir un fichier, et gardez l'échelle à 100 %.",
    apercu: "Aperçu de la carte, 85 × 55 mm",
  },
  en: {
    nomAppli: "75tools business card templates",
    motsCles: "business card template, printable business card, free business card template, business card size, business card for tradesmen",
    metier: "Trade",
    modele: (m: string) => `Template: ${m}`,
    texte: "Card text",
    nom: "Name",
    titre: "Title or trade",
    entreprise: "Company",
    ligne: (n: number) => `Line ${n}`,
    legal: "Identification line (small print)",
    legalAide: "French EI, SIREN, RCS or RNE, share capital for a company: see below.",
    imprimer: "Print or save as PDF",
    style: "Style",
    styles: { sobre: "Plain", bandeau: "Side band", centre: "Centred" } as Record<Style, string>,
    couleur: "Colour",
    note: "In the print dialog, choose Save as PDF as the printer to get a file, and keep the scale at 100%.",
    apercu: "Card preview, 85 × 55 mm",
  },
};

/** Carte au rapport 85:55 ; les tailles en cqw suivent la largeur, à l'écran comme à l'impression. */
const Carte = ({ m, className, label }: { m: Modele; className?: string; label?: string }) => {
  const s: Style = m.style;
  return (
    <div
      className={cn("carte-visite relative bg-white text-neutral-900 overflow-hidden [container-type:inline-size]", className)}
      style={{ aspectRatio: "85 / 55", fontFamily: "Arial, Helvetica, sans-serif" }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {s === "bandeau" && <div className="absolute left-0 top-0 bottom-0" style={{ width: "4.5cqw", background: m.couleur }} />}
      <div
        className={cn("absolute flex flex-col justify-between", s === "centre" ? "items-center text-center" : "")}
        style={{ inset: s === "bandeau" ? "7cqw 7cqw 6cqw 11.5cqw" : "7cqw 7cqw 6cqw 7cqw" }}
      >
        <div>
          <div style={{ fontSize: "6.2cqw", fontWeight: 700, color: s === "sobre" ? m.couleur : "#111", lineHeight: 1.15 }}>{m.nom}</div>
          <div style={{ fontSize: "3.9cqw", marginTop: "1.2cqw", color: "#333" }}>{m.titre}</div>
          {s === "centre" && <div style={{ width: "10cqw", height: "0.5cqw", background: m.couleur, margin: "2.6cqw auto 0" }} />}
          <div style={{ fontSize: "3.6cqw", marginTop: s === "centre" ? "2.4cqw" : "1cqw", color: m.couleur, fontWeight: 600 }}>{m.entreprise}</div>
        </div>
        <div style={{ fontSize: "3.6cqw", lineHeight: 1.45, color: "#222" }}>
          {m.lignes.filter((l) => l.trim()).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          {m.legal.trim() && <div style={{ fontSize: "2.5cqw", color: "#666", marginTop: "1.2cqw" }}>{m.legal}</div>}
        </div>
      </div>
    </div>
  );
};

const STYLES: Style[] = ["sobre", "bandeau", "centre"];

const ModeleCarteVisite = ({ lang = "fr" }: { lang?: Langue }) => {
  const t = T[lang];
  const liste = modeles(lang);
  const [m, setM] = useState<Modele>(liste[0]);
  const maj = (k: "nom" | "titre" | "entreprise" | "legal") => (v: string) => setM((x) => ({ ...x, [k]: v }));
  const majLigne = (i: number) => (v: string) =>
    setM((x) => {
      const lignes = [...x.lignes];
      while (lignes.length < 3) lignes.push("");
      lignes[i] = v;
      return { ...x, lignes };
    });

  const choisir = (id: string) => {
    const x = liste.find((y) => y.id === id);
    if (x) setM({ ...x, lignes: [...x.lignes] });
  };

  const outil = (
    <>
      {/* Planche d'impression : 10 cartes 85 × 55 mm sur A4, visible seulement à l'impression */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: #fff !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .planche { display: grid !important; grid-template-columns: 85mm 85mm; grid-auto-rows: 55mm;
            width: 210mm; height: 297mm; padding: 11mm 20mm; box-sizing: border-box; gap: 0; }
          .planche .carte-visite { width: 85mm; outline: 0.2mm dashed #bbb; outline-offset: -0.1mm;
            -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="planche hidden" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <Carte key={i} m={m} />
        ))}
      </div>

      <div className="grid gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start print:hidden">
        {/* Métier et premiers champs */}
        <form
          className="grid gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-1"
          onSubmit={(e) => e.preventDefault()}
          aria-label={t.texte}
        >
          <label className="block sm:col-span-2">
            <span className="block text-sm text-neutral-300 mb-1">{t.metier}</span>
            <select value={m.id} onChange={(e) => choisir(e.target.value)} className={classeSelect}>
              {liste.map((x) => (
                <option key={x.id} value={x.id}>
                  {t.modele(x.metier)}
                </option>
              ))}
            </select>
          </label>
          <Champ label={t.nom} value={m.nom} onChange={maj("nom")} />
          <Champ label={t.titre} value={m.titre} onChange={maj("titre")} />
        </form>

        {/* Aperçu, style et impression */}
        <div data-resultat className="space-y-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-4">
          <Carte m={m} label={t.apercu} className="w-full max-w-[30rem] rounded-sm ring-1 ring-neutral-700" />
          <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t.style}>
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={m.style === s}
                onClick={() => setM((x) => ({ ...x, style: s }))}
                className={cn(
                  "h-12 px-3 rounded-md text-sm border whitespace-nowrap",
                  m.style === s ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-400 hover:text-white"
                )}
              >
                {t.styles[s]}
              </button>
            ))}
            <input
              type="color"
              aria-label={t.couleur}
              value={m.couleur}
              onChange={(e) => setM((x) => ({ ...x, couleur: e.target.value }))}
              className="w-12 h-12 bg-transparent border-0 p-0 cursor-pointer"
            />
          </div>
          <Bouton onClick={() => window.print()}>{t.imprimer}</Bouton>
          <p className="text-xs text-neutral-500">{t.note}</p>
        </div>

        {/* Suite du texte */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-start-1 lg:row-start-2">
          <Champ label={t.entreprise} value={m.entreprise} onChange={maj("entreprise")} />
          <Champ label={t.ligne(1)} value={m.lignes[0] || ""} onChange={majLigne(0)} />
          <Champ label={t.ligne(2)} value={m.lignes[1] || ""} onChange={majLigne(1)} />
          <Champ label={t.ligne(3)} value={m.lignes[2] || ""} onChange={majLigne(2)} />
          <div className="sm:col-span-2">
            <Champ label={t.legal} value={m.legal} onChange={maj("legal")} aide={t.legalAide} />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <PageOutil
      id="modele-carte-de-visite"
      lang={lang}
      motsCles={t.motsCles}
      nomAppli={t.nomAppli}
      categorieAppli="DesignApplication"
      faq={FAQ[lang]}
      sources={SOURCES[lang]}
      outil={outil}
    >
      {lang === "fr" ? <ContenuFr choisir={choisir} /> : <ContenuEn choisir={choisir} />}
    </PageOutil>
  );
};

/** Les dix modèles, chacun avec ses conseils et un bouton qui le reprend dans l'outil. */
const Exemples = ({ lang, choisir, bouton }: { lang: Langue; choisir: (id: string) => void; bouton: string }) => (
  <div className="grid gap-8 md:grid-cols-2 pt-2">
    {modeles(lang).map((x) => (
      <article key={x.id} className="space-y-3">
        <h3 className="!mt-0">{x.metier}</h3>
        <Carte m={x} className="w-full max-w-[26rem] rounded-sm ring-1 ring-neutral-700" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-400">
          {x.conseils.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            choisir(x.id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-sm text-sky-300 underline underline-offset-4"
        >
          {bouton}
        </button>
      </article>
    ))}
  </div>
);

const ContenuFr = ({ choisir }: { choisir: (id: string) => void }) => (
  <>
    <Section titre="Un modèle de carte de visite par métier, prêt à imprimer">
      <p>
        Un modèle de carte de visite par métier vous évite la page blanche : choisissez votre activité dans la
        liste ci-dessus (artisan, coach, agent immobilier, avocat, restaurateur et cinq autres), remplacez le nom,
        les trois lignes de coordonnées et la ligne d'identification, puis cliquez sur « Imprimer ou enregistrer en
        PDF ». L'outil produit une planche A4 de dix cartes au format français de 85 × 55 mm, en deux colonnes et
        cinq rangées, avec un trait de coupe pointillé ; imprimée à 100 % sur un papier cartonné, elle donne dix
        cartes à découper au cutter. Chaque modèle reprend ce que les clients du métier cherchent en premier, par
        exemple la zone d'intervention pour un plombier ou les horaires pour un restaurant. Trois styles (Sobre,
        Bandeau, Centré) et une couleur au choix suffisent à l'adapter. La limite : la planche est faite pour une
        imprimante de bureau, sans fond perdu ; pour une commande chez un imprimeur, reprenez son gabarit.
      </p>
    </Section>

    <Section id="exemples" titre="Dix exemples, et ce que chaque métier doit y mettre">
      <p>
        Une carte de visite se lit en trois secondes : qui vous êtes, ce que vous faites, comment vous joindre. Les
        noms, numéros et adresses ci-dessous sont fictifs. Cliquez sur « Utiliser ce modèle » pour le reprendre dans
        l'outil.
      </p>
      <Exemples lang="fr" choisir={choisir} bouton="Utiliser ce modèle" />
    </Section>

    <Section id="format" titre="Format, fond perdu, résolution : les réglages pour l'imprimeur">
      <p>
        Le format fini courant en France est 85 × 55 mm, proche d'une carte bancaire. Les imprimeurs demandent en
        général 3 mm de fond perdu de chaque côté, soit un fichier de 91 × 61 mm, et une marge de sécurité de 3 à
        5 mm à l'intérieur du format fini pour qu'aucun texte ne soit coupé. Une photo doit être prévue à 300
        dpi : 85 mm font 3,35 pouces, et 3,35 × 300 donne 1 004 pixels ; 55 mm donnent 650 pixels, et 1 075 × 720
        pixels avec le fond perdu.
      </p>
      <p>
        Les couleurs passent du RVB de l'écran au CMJN de l'imprimeur : un bleu vif sort souvent plus terne,
        demandez une épreuve. Le fichier attendu est un PDF aux polices incorporées, où le texte reste vectoriel.
        Chaque imprimeur publie son gabarit : en cas d'écart avec ces chiffres, c'est le sien qui compte. La planche
        de cette page, elle, est centrée sur la feuille A4 (2 colonnes de 85 mm, 5 rangées de 55 mm) : imprimez à
        100 %, sans ajustement à la page.
      </p>
    </Section>

    <Section id="mentions" titre="Les mentions obligatoires selon votre statut">
      <p>
        Aucune fiche de Service Public ne nomme la carte de visite. En revanche, Service Public impose des mentions
        d'identification sur les <strong>documents publicitaires</strong>, imprimés compris, et sur les documents
        commerciaux en général. Une carte distribuée pour faire connaître son activité s'en rapproche : notre
        conseil est d'y porter ces mentions en petit.
      </p>
      <p>
        <strong>Société (SARL, SAS, SA…)</strong> : numéro Siren ; mention RCS suivie de la ville du greffe pour une
        activité commerciale, ou RNE pour une activité artisanale, libérale ou agricole ; lieu du siège ; capital
        pour une SARL ou une société par actions. <strong>Entrepreneur individuel et micro-entrepreneur</strong> :
        mêmes mentions d'identification, et depuis le 15 mai 2022 le nom précédé ou suivi de « EI » ou
        « entrepreneur individuel » ; Service Public indique une amende pouvant aller jusqu'à 750 € en cas
        d'absence.
      </p>
      <p>
        <strong>Professions réglementées</strong> : avocats, infirmiers, agents immobiliers ont des règles de
        communication propres, fixées par leur ordre ou leur réglementation ; vérifiez-les avant d'imprimer. Au
        verso, ajoutez un <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> qui enregistre le contact en un
        scan, et pour choisir entre puce et code, lisez le comparatif{" "}
        <Link to="/carte-de-visite-nfc/">carte de visite NFC ou QR code</Link>.
      </p>
    </Section>
  </>
);

const ContenuEn = ({ choisir }: { choisir: (id: string) => void }) => (
  <>
    <Section titre="A business card template for your trade, ready to print">
      <p>
        A business card template by trade saves you from the blank page: pick your line of work in the list above
        (tradesperson, personal trainer, estate agent, lawyer, restaurant owner and five more), replace the name,
        the three contact lines and the identification line, then click Print or save as PDF. The tool lays out an
        A4 sheet of ten cards at the standard French and UK size of 85 × 55 mm, in two columns and five rows with a
        dashed cut line; printed at 100% on card stock, it gives ten cards to cut with a craft knife. Each template
        puts first what that trade's clients look for, such as the call-out area for a plumber or opening hours for
        a restaurant. Three styles (Plain, Side band, Centred) and a colour picker are enough to make it yours. The
        main limit: the sheet is built for an office printer, with no bleed; for an order at a print shop, use
        their template instead.
      </p>
    </Section>

    <Section id="examples" titre="Ten examples, and what each trade should put on its card">
      <p>
        A business card is read in three seconds: who you are, what you do, how to reach you. The names, numbers and
        addresses below are made up, with French formats since the cards are meant for use in France. Click Use
        this template to load one into the tool.
      </p>
      <Exemples lang="en" choisir={choisir} bouton="Use this template" />
    </Section>

    <Section id="format" titre="Size, bleed and resolution: what the printer needs">
      <p>
        The usual finished size in France is 85 × 55 mm, close to a bank card. Printers generally ask for 3 mm of
        bleed on each side, so a 91 × 61 mm file, and a 3 to 5 mm safety margin inside the finished size so that no
        text gets trimmed. A photo should be prepared at 300 dpi: 85 mm is 3.35 inches, and 3.35 × 300 gives 1,004
        pixels; 55 mm gives 650 pixels, and 1,075 × 720 pixels with bleed.
      </p>
      <p>
        Colours shift from the screen's RGB to the printer's CMYK: a bright blue often comes out duller, so ask for
        a proof. The expected file is a PDF with embedded fonts, where text stays vector. Every printer publishes
        its own template, and theirs wins over these figures. This page's sheet is centred on A4 (2 columns of 85
        mm, 5 rows of 55 mm): print at 100%, without fit to page.
      </p>
    </Section>

    <Section id="legal" titre="French legal details on a business card">
      <p>
        No Service Public page mentions business cards as such. Service Public does, however, require
        identification details on <strong>advertising material</strong>, printed matter included, and on
        commercial documents in general. A card handed out to promote your business comes close, so our advice is
        to add these details in small print, in French, as French clients expect them.
      </p>
      <p>
        <strong>Company (SARL, SAS, SA)</strong>: SIREN number; RCS followed by the registry town for a trading
        business, or RNE for a craft, liberal or farming activity; registered office; share capital for a SARL or
        SAS. <strong>Sole trader and micro-entrepreneur</strong>: the same identifiers and, since 15 May 2022, EI or
        entrepreneur individuel before or after the name; Service Public mentions a fine of up to €750 if it is
        missing.
      </p>
      <p>
        <strong>Regulated professions</strong> such as lawyers, nurses and estate agents have their own
        communication rules set by their professional body; check them before printing. On the back, add a{" "}
        <Link to="/en/vcard-qr-code/">vCard QR code</Link> that saves your contact in one scan, and to choose
        between a chip and a code, read our <Link to="/en/nfc-business-card/">NFC business card or QR code</Link>{" "}
        comparison.
      </p>
    </Section>
  </>
);

export default ModeleCarteVisite;
