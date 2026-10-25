import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  OutilLayout,
  EnTete,
  Section,
  Faq,
  faqJsonLd,
  Sources,
  AutresOutils,
  Champ,
  Bouton,
  QuestionFaq,
} from "@/components/outils/OutilLayout";
import { MODELES, Modele, Style } from "@/lib/modeles-carte";
import { cn } from "@/lib/utils";

const URL_PAGE = "https://75tools.fr/modele-carte-de-visite/";
const TITRE = "Modèle carte de visite : 10 exemples par métier à imprimer";
const DESCRIPTION =
  "Modèle de carte de visite gratuit pour artisan, coach, agent immobilier, avocat… Texte modifiable, planche A4 de 10 cartes 85 × 55 mm à imprimer ou en PDF.";

const FAQ: QuestionFaq[] = [
  {
    q: "Quelle est la taille standard d'une carte de visite en France ?",
    r: "Le format proposé par défaut par les imprimeurs en France est 85 × 55 mm. Il est proche de celui d'une carte bancaire (85,60 × 53,98 mm), si bien qu'il entre dans les mêmes porte-cartes. Le format américain, 3,5 × 2 pouces (88,9 × 50,8 mm), est plus long et plus étroit : ne mélangez pas les deux gabarits quand vous préparez le fichier.",
  },
  {
    q: "Qu'est-ce que le fond perdu, et faut-il le prévoir ?",
    r: "C'est une bordure de 3 mm en général, ajoutée tout autour du format, où l'on prolonge le fond ou l'image. Les cartes sont coupées par paquets et la lame peut dévier d'un millimètre : sans fond perdu, un liseré blanc apparaît sur le bord. Pour une carte de 85 × 55 mm, le fichier mesure donc 91 × 61 mm. Une carte à fond blanc n'en a pas besoin, mais l'imprimeur peut quand même demander ce format.",
  },
  {
    q: "Puis-je imprimer mes cartes de visite moi-même avec une imprimante de bureau ?",
    r: "Oui, avec la planche de ce modèle : dix cartes sur une feuille A4, avec des traits de coupe. Utilisez un papier épais (cartonné) accepté par votre imprimante, dont le grammage maximal figure dans sa notice, réglez l'impression à 100 % sans « ajuster à la page », puis coupez au cutter et à la règle. Le rendu est correct pour un dépannage ; pour un grand nombre de cartes, un imprimeur reste plus net.",
  },
  {
    q: "Quelles mentions mettre sur la carte de visite d'un auto-entrepreneur ?",
    r: "Service Public ne cite pas la carte de visite, mais demande qu'un entrepreneur individuel fasse précéder ou suivre son nom de « EI » ou « entrepreneur individuel » sur ses documents commerciaux, et que ses documents publicitaires portent le numéro Siren et la mention RCS ou RNE. Si la carte sert à prospecter, la prudence est d'ajouter cette ligne en petit, par exemple « Amandine Roux EI · Siren 000 000 000 ».",
  },
  {
    q: "Faut-il mettre un QR code sur sa carte de visite ?",
    r: "C'est utile si la personne doit pouvoir enregistrer vos coordonnées sans les recopier. Un QR code vCard contient le contact lui-même et marche sans connexion ; un QR code vers une carte en ligne peut être mis à jour après l'impression. Le générateur de QR code vCard de 75tools produit un fichier SVG à placer au verso, avec sa marge blanche.",
  },
];

/** Carte au rapport 85:55 ; les tailles en cqw suivent la largeur, à l'écran comme à l'impression. */
const Carte = ({ m, className }: { m: Modele; className?: string }) => {
  const s: Style = m.style;
  return (
    <div
      className={cn("carte-visite relative bg-white text-neutral-900 overflow-hidden [container-type:inline-size]", className)}
      style={{ aspectRatio: "85 / 55", fontFamily: "Arial, Helvetica, sans-serif" }}
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

const STYLES: { id: Style; nom: string }[] = [
  { id: "sobre", nom: "Sobre" },
  { id: "bandeau", nom: "Bandeau" },
  { id: "centre", nom: "Centré" },
];

const ModeleCarteVisite = () => {
  const [m, setM] = useState<Modele>(MODELES[0]);
  const maj = (k: "nom" | "titre" | "entreprise" | "legal") => (v: string) => setM((x) => ({ ...x, [k]: v }));
  const majLigne = (i: number) => (v: string) =>
    setM((x) => {
      const lignes = [...x.lignes];
      while (lignes.length < 3) lignes.push("");
      lignes[i] = v;
      return { ...x, lignes };
    });

  const choisir = (id: string) => {
    const x = MODELES.find((y) => y.id === id);
    if (x) setM({ ...x, lignes: [...x.lignes] });
  };

  return (
    <OutilLayout>
      <SEO
        exactTitle
        title={TITRE}
        description={DESCRIPTION}
        keywords="modèle carte de visite, carte de visite à imprimer, modèle carte de visite gratuit, carte de visite artisan, format carte de visite"
        url={URL_PAGE}
        locale="fr_FR"
        imageAlt="Modèles de carte de visite par métier à imprimer"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Modèle de carte de visite à imprimer",
            url: URL_PAGE,
            applicationCategory: "DesignApplication",
            operatingSystem: "Navigateur web",
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            description: DESCRIPTION,
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: "75tools", url: "https://75tools.fr/" },
          },
          faqJsonLd(FAQ),
        ]}
      />

      {/* Planche d'impression : 10 cartes 85 × 55 mm sur A4, visible seulement à l'impression */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: #fff !important; }
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

      <EnTete
        titre="Modèles de carte de visite par métier"
        chapeau="Choisissez un métier, adaptez le texte, puis imprimez une planche de 10 cartes au format 85 × 55 mm ou enregistrez-la en PDF. Gratuit, sans compte."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start print:hidden">
        <div className="space-y-3 lg:order-last lg:sticky lg:top-4">
          <label className="block relative">
            <span className="sr-only">Métier</span>
            <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            <select
              value={m.id}
              onChange={(e) => choisir(e.target.value)}
              className="w-full h-12 rounded-md border border-neutral-700 bg-neutral-900 pl-3 pr-10 text-neutral-100 appearance-none truncate"
              aria-label="Métier"
            >
              {MODELES.map((x) => (
                <option key={x.id} value={x.id}>
                  Modèle : {x.metier}
                </option>
              ))}
            </select>
          </label>
          <Carte m={m} className="w-full max-w-[30rem] rounded-sm ring-1 ring-neutral-700" />
          <div className="flex flex-wrap items-center gap-2">
            <Bouton onClick={() => window.print()}>Imprimer ou enregistrer en PDF</Bouton>
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setM((x) => ({ ...x, style: s.id }))}
                aria-pressed={m.style === s.id}
                className={cn(
                  "h-9 px-3 rounded-md text-sm border whitespace-nowrap",
                  m.style === s.id ? "border-sky-400 text-white" : "border-neutral-700 text-neutral-400 hover:text-white"
                )}
              >
                {s.nom}
              </button>
            ))}
            <input
              type="color"
              aria-label="Couleur"
              value={m.couleur}
              onChange={(e) => setM((x) => ({ ...x, couleur: e.target.value }))}
              className="w-10 h-9 bg-transparent border-0 p-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-neutral-500">
            Dans la fenêtre d'impression, choisissez « Enregistrer au format PDF » comme imprimante pour obtenir un
            fichier, et gardez l'échelle à 100 %.
          </p>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Texte de la carte">
          <Champ label="Nom" value={m.nom} onChange={maj("nom")} />
          <Champ label="Titre ou métier" value={m.titre} onChange={maj("titre")} />
          <Champ label="Entreprise" value={m.entreprise} onChange={maj("entreprise")} />
          <Champ label="Ligne 1" value={m.lignes[0] || ""} onChange={majLigne(0)} />
          <Champ label="Ligne 2" value={m.lignes[1] || ""} onChange={majLigne(1)} />
          <Champ label="Ligne 3" value={m.lignes[2] || ""} onChange={majLigne(2)} />
          <div className="sm:col-span-2">
            <Champ label="Ligne d'identification (petit texte)" value={m.legal} onChange={maj("legal")} aide="EI, Siren, RCS ou RNE, capital pour une société : voir plus bas." />
          </div>
        </form>
      </div>

      <Section id="exemples" titre="Dix exemples, et ce que chaque métier doit y mettre">
        <p>
          Une carte de visite se lit en trois secondes : qui vous êtes, ce que vous faites, comment vous joindre.
          Les exemples ci-dessous partent de ce que les clients de chaque métier cherchent en premier. Les noms,
          numéros et adresses sont fictifs. Cliquez sur « Utiliser ce modèle » pour le reprendre dans l'outil.
        </p>
        <div className="grid gap-8 md:grid-cols-2 pt-2">
          {MODELES.map((x) => (
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
                Utiliser ce modèle
              </button>
            </article>
          ))}
        </div>
      </Section>

      <Section id="format" titre="Format, fond perdu, résolution : les réglages pour l'imprimeur">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[30rem] tabular-nums">
            <thead>
              <tr className="border-b border-neutral-700 text-left text-neutral-400 uppercase text-xs tracking-wider">
                <th className="py-2 pr-4 font-medium">Réglage</th>
                <th className="py-2 pr-4 font-medium">Valeur</th>
                <th className="py-2 font-medium">Pourquoi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 align-top">
              <tr><td className="py-2 pr-4 text-neutral-200">Format fini</td><td className="py-2 pr-4">85 × 55 mm</td><td className="py-2">Le format courant en France, proche d'une carte bancaire.</td></tr>
              <tr><td className="py-2 pr-4 text-neutral-200">Fond perdu</td><td className="py-2 pr-4">3 mm de chaque côté, soit un fichier de 91 × 61 mm</td><td className="py-2">Évite un liseré blanc si la coupe dévie.</td></tr>
              <tr><td className="py-2 pr-4 text-neutral-200">Marge de sécurité</td><td className="py-2 pr-4">3 à 5 mm à l'intérieur du format fini</td><td className="py-2">Aucun texte ne risque d'être coupé ; suivez le chiffre de votre imprimeur.</td></tr>
              <tr><td className="py-2 pr-4 text-neutral-200">Résolution</td><td className="py-2 pr-4">300 dpi : 1 004 × 650 px au format fini, 1 075 × 720 px avec fond perdu</td><td className="py-2">Une photo plus petite sera agrandie et paraîtra floue.</td></tr>
              <tr><td className="py-2 pr-4 text-neutral-200">Couleurs</td><td className="py-2 pr-4">CMJN pour l'imprimeur, RVB pour l'écran</td><td className="py-2">Un bleu vif à l'écran sort plus terne en CMJN : demandez une épreuve.</td></tr>
              <tr><td className="py-2 pr-4 text-neutral-200">Fichier</td><td className="py-2 pr-4">PDF, polices incorporées</td><td className="py-2">Le texte reste vectoriel, net à l'impression.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Les pixels se calculent ainsi : 85 mm font 3,35 pouces, et 3,35 × 300 donne 1 004 pixels ; 55 mm donnent
          650 pixels. Avec 3 mm de fond perdu de chaque côté (91 × 61 mm), on arrive à 1 075 × 720 pixels. Chaque
          imprimeur publie son propre gabarit : en cas d'écart avec ce tableau, c'est le sien qui compte.
        </p>
        <p>
          La planche de cette page est faite pour une impression de bureau : dix cartes sur une feuille A4 (2
          colonnes de 85 mm, 5 rangées de 55 mm), centrées, avec un trait de coupe pointillé. Imprimez à 100 %, sans
          ajustement à la page, sinon les cartes ne mesureront plus 85 × 55 mm.
        </p>
      </Section>

      <Section id="mentions" titre="Les mentions obligatoires selon votre statut">
        <p>
          Aucune fiche de Service Public ne nomme la carte de visite. En revanche, Service Public impose des
          mentions d'identification sur les <strong>documents publicitaires</strong>, imprimés compris (brochure,
          flyer, catalogue), et sur les documents commerciaux en général. Une carte distribuée pour faire connaître
          son activité s'en rapproche : notre conseil est d'y porter ces mentions en petit, au recto ou au verso.
        </p>
        <h3>Société (SARL, SAS, SA…)</h3>
        <p>
          Pour les documents publicitaires d'une société, Service Public liste : le numéro Siren ; la mention RCS
          suivie de la ville du greffe pour une activité commerciale, ou la mention RNE pour une activité
          artisanale, libérale ou agricole ; le lieu du siège social ; le montant du capital pour une SARL ou une
          société par actions ; et, le cas échéant, l'état de liquidation ou la location-gérance.
        </p>
        <h3>Entrepreneur individuel et micro-entrepreneur</h3>
        <p>
          Mêmes mentions d'identification (Siren, RCS ou RNE, lieu de domiciliation de l'entreprise), et depuis le
          nouveau statut entré en vigueur le 15 mai 2022, le nom doit être précédé ou suivi de « entrepreneur
          individuel » ou des initiales « EI » sur les documents commerciaux. Service Public indique une amende
          pouvant aller jusqu'à 750 € en cas d'absence de cette mention.
        </p>
        <h3>Professions réglementées</h3>
        <p>
          Avocats, infirmiers, agents immobiliers et autres professions encadrées ont des règles de communication
          propres, fixées par leur ordre ou leur réglementation. Elles ne sont pas résumées ici : vérifiez-les
          auprès de votre ordre ou de votre chambre avant d'imprimer. L'agent immobilier, par exemple, doit
          afficher dans ses locaux le numéro de sa carte professionnelle ; le reporter sur sa carte de visite est
          un usage courant.
        </p>
      </Section>

      <Section titre="Et la carte de visite digitale ?">
        <p>
          Une carte papier se perd dans un tiroir ; une carte numérique s'enregistre dans le téléphone. Les deux se
          complètent : ajoutez au verso un <Link to="/carte-de-visite-qr-code/">QR code vCard</Link> qui enregistre
          le contact en un scan, ou un QR code vers votre <Link to="/mycard/">carte en ligne MyCard</Link>, que vous
          pouvez modifier après l'impression. Pour choisir entre carte NFC et QR code, voyez notre{" "}
          <Link to="/carte-de-visite-nfc/">comparatif</Link>.
        </p>
      </Section>

      <Faq faq={FAQ} />

      <Sources
        sources={[
          { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une société (vérifié le 8 décembre 2025)", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F37371", lu: "25 octobre 2026" },
          { editeur: "Service Public Entreprendre", titre: "Documents commerciaux d'une micro-entreprise", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F36008", lu: "25 octobre 2026" },
          { editeur: "Service Public Entreprendre", titre: "Entrepreneurs individuels : de nouvelles mentions obligatoires sur les documents commerciaux (actualité du 30 juin 2022)", url: "https://entreprendre.service-public.gouv.fr/actualites/A15744", lu: "25 octobre 2026" },
          { editeur: "Service Public Entreprendre", titre: "Devenir agent immobilier", url: "https://entreprendre.service-public.gouv.fr/vosdroits/F32994", lu: "25 octobre 2026" },
        ]}
      />

      <AutresOutils courant="/modele-carte-de-visite/" />
    </OutilLayout>
  );
};

export default ModeleCarteVisite;
