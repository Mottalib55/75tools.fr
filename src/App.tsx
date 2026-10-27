import { lazy, Suspense, type ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";

import Hub from "./pages/Hub";
const MyCardLanding = lazy(() => import("./pages/MyCardLanding"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const PublicCard = lazy(() => import("./pages/PublicCard"));
const GymSquad = lazy(() => import("./pages/GymSquad"));
import NotFound from "./pages/NotFound";

// Pages-outils : un fichier JavaScript par page, chargé à la demande (l'accueil reste léger).
const CompresserPdf = lazy(() => import("./pages/outils/CompresserPdf"));
const FusionnerPdf = lazy(() => import("./pages/outils/FusionnerPdf"));
const SeparerPdf = lazy(() => import("./pages/outils/SeparerPdf"));
const JpgEnPdf = lazy(() => import("./pages/outils/JpgEnPdf"));
const PdfEnJpg = lazy(() => import("./pages/outils/PdfEnJpg"));
const SignerPdf = lazy(() => import("./pages/outils/SignerPdf"));
const HeicEnJpg = lazy(() => import("./pages/outils/HeicEnJpg"));
const PngEnJpg = lazy(() => import("./pages/outils/PngEnJpg"));
const WebpEnJpg = lazy(() => import("./pages/outils/WebpEnJpg"));
const RedimensionnerImage = lazy(() => import("./pages/outils/RedimensionnerImage"));
const SupprimerFondImage = lazy(() => import("./pages/outils/SupprimerFondImage"));
const PhotoIdentite = lazy(() => import("./pages/outils/PhotoIdentite"));
const CreerUnLogo = lazy(() => import("./pages/outils/CreerUnLogo"));
const GenerateurQrCode = lazy(() => import("./pages/outils/GenerateurQrCode"));
const QrCodeWifi = lazy(() => import("./pages/outils/QrCodeWifi"));
const QrCodePdf = lazy(() => import("./pages/outils/QrCodePdf"));
const QrCodeWhatsapp = lazy(() => import("./pages/outils/QrCodeWhatsapp"));
const QrCodeAvisGoogle = lazy(() => import("./pages/outils/QrCodeAvisGoogle"));
const LireQrCode = lazy(() => import("./pages/outils/LireQrCode"));
const GenerateurFacture = lazy(() => import("./pages/outils/GenerateurFacture"));
const GenerateurDevis = lazy(() => import("./pages/outils/GenerateurDevis"));
const ModeleCv = lazy(() => import("./pages/outils/ModeleCv"));
const LettreDeResiliation = lazy(() => import("./pages/outils/LettreDeResiliation"));
const AttestationHebergement = lazy(() => import("./pages/outils/AttestationHebergement"));
const AttestationSurLHonneur = lazy(() => import("./pages/outils/AttestationSurLHonneur"));
const SignatureMail = lazy(() => import("./pages/outils/SignatureMail"));
const SignatureOutlook = lazy(() => import("./pages/outils/SignatureOutlook"));
const SignatureGmail = lazy(() => import("./pages/outils/SignatureGmail"));
const CarteVisiteQrCode = lazy(() => import("./pages/outils/CarteVisiteQrCode"));
const ModeleCarteVisite = lazy(() => import("./pages/outils/ModeleCarteVisite"));
const CarteVisiteNfc = lazy(() => import("./pages/outils/CarteVisiteNfc"));
const CalculerUnPourcentage = lazy(() => import("./pages/outils/CalculerUnPourcentage"));
const CalculHtTtc = lazy(() => import("./pages/outils/CalculHtTtc"));
const CalculMargeCommerciale = lazy(() => import("./pages/outils/CalculMargeCommerciale"));
const NombreDeJoursEntreDeuxDates = lazy(() => import("./pages/outils/NombreDeJoursEntreDeuxDates"));
const CalculateurAge = lazy(() => import("./pages/outils/CalculateurAge"));
const Chronometre = lazy(() => import("./pages/outils/Chronometre"));
const Minuteur = lazy(() => import("./pages/outils/Minuteur"));
const CompteARebours = lazy(() => import("./pages/outils/CompteARebours"));
const TirageAuSort = lazy(() => import("./pages/outils/TirageAuSort"));
const RoueDeLaChance = lazy(() => import("./pages/outils/RoueDeLaChance"));
const CompteurDeMots = lazy(() => import("./pages/outils/CompteurDeMots"));
const CompteurDeCaracteres = lazy(() => import("./pages/outils/CompteurDeCaracteres"));
const GenerateurMotDePasse = lazy(() => import("./pages/outils/GenerateurMotDePasse"));
const GenerateurLoremIpsum = lazy(() => import("./pages/outils/GenerateurLoremIpsum"));
const TestVitesseDeFrappe = lazy(() => import("./pages/outils/TestVitesseDeFrappe"));
import { OUTILS, type Langue } from "@/lib/outils";
const Racine = lazy(() => import("./pages/Racine"));

/** Une page par outil ; la même sert les deux langues (prop `lang`). */
const PAGES: Record<string, ComponentType<{ lang?: Langue }>> = {
  "compresser-pdf": CompresserPdf,
  "fusionner-pdf": FusionnerPdf,
  "separer-pdf": SeparerPdf,
  "jpg-en-pdf": JpgEnPdf,
  "pdf-en-jpg": PdfEnJpg,
  "signer-pdf": SignerPdf,
  "heic-en-jpg": HeicEnJpg,
  "png-en-jpg": PngEnJpg,
  "webp-en-jpg": WebpEnJpg,
  "redimensionner-image": RedimensionnerImage,
  "supprimer-fond-image": SupprimerFondImage,
  "photo-identite": PhotoIdentite,
  "creer-un-logo": CreerUnLogo,
  "generateur-qr-code": GenerateurQrCode,
  "qr-code-wifi": QrCodeWifi,
  "qr-code-pdf": QrCodePdf,
  "qr-code-whatsapp": QrCodeWhatsapp,
  "qr-code-avis-google": QrCodeAvisGoogle,
  "lire-qr-code": LireQrCode,
  "generateur-facture": GenerateurFacture,
  "generateur-devis": GenerateurDevis,
  "modele-cv": ModeleCv,
  "lettre-de-resiliation": LettreDeResiliation,
  "attestation-hebergement": AttestationHebergement,
  "attestation-sur-l-honneur": AttestationSurLHonneur,
  "signature-mail": SignatureMail,
  "signature-outlook": SignatureOutlook,
  "signature-gmail": SignatureGmail,
  "carte-de-visite-qr-code": CarteVisiteQrCode,
  "modele-carte-de-visite": ModeleCarteVisite,
  "carte-de-visite-nfc": CarteVisiteNfc,
  "calculer-un-pourcentage": CalculerUnPourcentage,
  "calcul-ht-ttc": CalculHtTtc,
  "calcul-marge-commerciale": CalculMargeCommerciale,
  "nombre-de-jours-entre-deux-dates": NombreDeJoursEntreDeuxDates,
  "calculateur-age": CalculateurAge,
  "chronometre": Chronometre,
  "minuteur": Minuteur,
  "compte-a-rebours": CompteARebours,
  "tirage-au-sort": TirageAuSort,
  "roue-de-la-chance": RoueDeLaChance,
  "compteur-de-mots": CompteurDeMots,
  "compteur-de-caracteres": CompteurDeCaracteres,
  "generateur-mot-de-passe": GenerateurMotDePasse,
  "generateur-lorem-ipsum": GenerateurLoremIpsum,
  "test-vitesse-de-frappe": TestVitesseDeFrappe,
};

// Initialize React Query client
const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
          <Routes>
            {/* Racine : noindex, liens vers /fr/ et /en/, redirection selon la langue du navigateur (RECETTE §13) */}
            <Route path="/" element={<Racine />} />

            {/* French routes */}
            <Route path="/fr" element={<Hub lang="fr" />} />

            {/* English routes */}
            <Route path="/en" element={<Hub lang="en" />} />

            {/* MyCard routes */}
            <Route path="/mycard" element={<MyCardLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/card/:username" element={<PublicCard />} />

            {/* Pages-outils, en français et en anglais (registre src/lib/outils.ts, pré-rendues par scripts/prerender.mjs) */}
            {OUTILS.flatMap((o) => {
              const Page = PAGES[o.id];
              return [
                <Route key={o.fr.href} path={o.fr.href.slice(0, -1)} element={<Page lang="fr" />} />,
                <Route key={o.en.href} path={o.en.href.slice(0, -1)} element={<Page lang="en" />} />,
              ];
            })}

            {/* Gym Squad */}
            <Route path="/gym" element={<GymSquad />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
