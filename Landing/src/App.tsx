import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PathPrefixProvider } from "@/contexts/PathPrefixContext";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Mirror from "./pages/Mirror";
import Offer from "./pages/Offer";
import Obrigado from "./pages/Obrigado";
import NotFound from "./pages/NotFound";

// Direct flow components (A/B variant)
import DirectIndex from "./pages/direct/DirectIndex";
import DirectQuiz from "./pages/direct/DirectQuiz";
import DirectMirror from "./pages/direct/DirectMirror";
import DirectOffer from "./pages/direct/DirectOffer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Original Flow */}
          <Route
            path="/"
            element={
              <PathPrefixProvider prefix="">
                <Index />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/quiz"
            element={
              <PathPrefixProvider prefix="">
                <Quiz />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/mirror"
            element={
              <PathPrefixProvider prefix="">
                <Mirror />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/offer"
            element={
              <PathPrefixProvider prefix="">
                <Offer />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/obrigado"
            element={
              <PathPrefixProvider prefix="">
                <Obrigado />
              </PathPrefixProvider>
            }
          />

          {/* Direct Flow (A/B Variant) - New landing page with urgency messaging */}
          <Route
            path="/direct"
            element={
              <PathPrefixProvider prefix="/direct">
                <DirectIndex />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/direct/quiz"
            element={
              <PathPrefixProvider prefix="/direct">
                <DirectQuiz />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/direct/mirror"
            element={
              <PathPrefixProvider prefix="/direct">
                <DirectMirror />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/direct/offer"
            element={
              <PathPrefixProvider prefix="/direct">
                <DirectOffer />
              </PathPrefixProvider>
            }
          />
          <Route
            path="/direct/obrigado"
            element={
              <PathPrefixProvider prefix="/direct">
                <Obrigado />
              </PathPrefixProvider>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
