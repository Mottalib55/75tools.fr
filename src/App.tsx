import { lazy, Suspense } from "react";
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
import { detectBrowserLanguage } from "@/lib/i18n";

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
            {/* Language redirect */}
            <Route path="/" element={<Hub lang={detectBrowserLanguage()} />} />

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

            {/* Pages-outils françaises (pré-rendues, voir scripts/prerender.mjs) */}
            <Route path="/compresser-pdf" element={<CompresserPdf />} />
            <Route path="/fusionner-pdf" element={<FusionnerPdf />} />
            <Route path="/separer-pdf" element={<SeparerPdf />} />
            <Route path="/jpg-en-pdf" element={<JpgEnPdf />} />
            <Route path="/pdf-en-jpg" element={<PdfEnJpg />} />
            <Route path="/signer-pdf" element={<SignerPdf />} />
            <Route path="/heic-en-jpg" element={<HeicEnJpg />} />
            <Route path="/png-en-jpg" element={<PngEnJpg />} />
            <Route path="/webp-en-jpg" element={<WebpEnJpg />} />
            <Route path="/redimensionner-image" element={<RedimensionnerImage />} />
            <Route path="/supprimer-fond-image" element={<SupprimerFondImage />} />
            <Route path="/photo-identite" element={<PhotoIdentite />} />
            <Route path="/creer-un-logo" element={<CreerUnLogo />} />
            <Route path="/generateur-qr-code" element={<GenerateurQrCode />} />
            <Route path="/qr-code-wifi" element={<QrCodeWifi />} />
            <Route path="/qr-code-pdf" element={<QrCodePdf />} />
            <Route path="/qr-code-whatsapp" element={<QrCodeWhatsapp />} />
            <Route path="/qr-code-avis-google" element={<QrCodeAvisGoogle />} />
            <Route path="/lire-qr-code" element={<LireQrCode />} />
            <Route path="/generateur-facture" element={<GenerateurFacture />} />
            <Route path="/generateur-devis" element={<GenerateurDevis />} />
            <Route path="/modele-cv" element={<ModeleCv />} />
            <Route path="/lettre-de-resiliation" element={<LettreDeResiliation />} />
            <Route path="/attestation-hebergement" element={<AttestationHebergement />} />
            <Route path="/attestation-sur-l-honneur" element={<AttestationSurLHonneur />} />
            <Route path="/signature-mail" element={<SignatureMail />} />
            <Route path="/signature-outlook" element={<SignatureOutlook />} />
            <Route path="/signature-gmail" element={<SignatureGmail />} />
            <Route path="/carte-de-visite-qr-code" element={<CarteVisiteQrCode />} />
            <Route path="/modele-carte-de-visite" element={<ModeleCarteVisite />} />
            <Route path="/carte-de-visite-nfc" element={<CarteVisiteNfc />} />
            <Route path="/calculer-un-pourcentage" element={<CalculerUnPourcentage />} />
            <Route path="/calcul-ht-ttc" element={<CalculHtTtc />} />
            <Route path="/calcul-marge-commerciale" element={<CalculMargeCommerciale />} />
            <Route path="/nombre-de-jours-entre-deux-dates" element={<NombreDeJoursEntreDeuxDates />} />
            <Route path="/calculateur-age" element={<CalculateurAge />} />
            <Route path="/chronometre" element={<Chronometre />} />
            <Route path="/minuteur" element={<Minuteur />} />
            <Route path="/compte-a-rebours" element={<CompteARebours />} />
            <Route path="/tirage-au-sort" element={<TirageAuSort />} />
            <Route path="/roue-de-la-chance" element={<RoueDeLaChance />} />
            <Route path="/compteur-de-mots" element={<CompteurDeMots />} />
            <Route path="/compteur-de-caracteres" element={<CompteurDeCaracteres />} />
            <Route path="/generateur-mot-de-passe" element={<GenerateurMotDePasse />} />
            <Route path="/generateur-lorem-ipsum" element={<GenerateurLoremIpsum />} />
            <Route path="/test-vitesse-de-frappe" element={<TestVitesseDeFrappe />} />

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
