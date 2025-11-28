import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PathPrefixProvider } from "@/contexts/PathPrefixContext";

// Lazy load all page components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Mirror = lazy(() => import("./pages/Mirror"));
const Offer = lazy(() => import("./pages/Offer"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Direct flow components (A/B variant) - lazy loaded
const DirectIndex = lazy(() => import("./pages/direct/DirectIndex"));
const DirectQuiz = lazy(() => import("./pages/direct/DirectQuiz"));
const DirectMirror = lazy(() => import("./pages/direct/DirectMirror"));
const DirectOffer = lazy(() => import("./pages/direct/DirectOffer"));

// Bora landing page - single page optimized for conversion
const BoraLanding = lazy(() => import("./pages/bora/BoraLanding"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-muted-foreground text-sm">Carregando...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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

            {/* Bora Landing Page - Single page optimized for conversion */}
            <Route
              path="/bora"
              element={
                <PathPrefixProvider prefix="/bora">
                  <BoraLanding />
                </PathPrefixProvider>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
