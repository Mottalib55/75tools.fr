import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";

import Hub from "./pages/Hub";
import MyCardLanding from "./pages/MyCardLanding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PublicCard from "./pages/PublicCard";
import GymSquad from "./pages/GymSquad";
import SignatureMail from "./pages/outils/SignatureMail";
import CarteVisiteQrCode from "./pages/outils/CarteVisiteQrCode";
import ModeleCarteVisite from "./pages/outils/ModeleCarteVisite";
import CarteVisiteNfc from "./pages/outils/CarteVisiteNfc";
import NotFound from "./pages/NotFound";
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
            <Route path="/signature-mail" element={<SignatureMail />} />
            <Route path="/carte-de-visite-qr-code" element={<CarteVisiteQrCode />} />
            <Route path="/modele-carte-de-visite" element={<ModeleCarteVisite />} />
            <Route path="/carte-de-visite-nfc" element={<CarteVisiteNfc />} />

            {/* Gym Squad */}
            <Route path="/gym" element={<GymSquad />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
