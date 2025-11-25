import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import ScrollToTop from "@/components/ScrollToTop";
import { useTheme } from "@/hooks/useTheme";

// Lazy load pages for better initial bundle size
const OnboardingFlow = lazy(() => import("./pages/OnboardingFlow"));
const PersonalPlan = lazy(() => import("./pages/PersonalPlan"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateHabit = lazy(() => import("./pages/CreateHabit"));
const EditHabit = lazy(() => import("./pages/EditHabit"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Meditation = lazy(() => import("./pages/Meditation"));
const BooksHub = lazy(() => import("./pages/BooksHub"));
const Tips = lazy(() => import("./pages/Tips"));
const GuidedJourney = lazy(() => import("./pages/GuidedJourney"));
const Auth = lazy(() => import("./pages/Auth"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Thanks = lazy(() => import("./pages/Thanks"));
const Cancel = lazy(() => import("./pages/Cancel"));
const MyHabits = lazy(() => import("./pages/MyHabits"));
const Bonus = lazy(() => import("./pages/Bonus"));
const Preview = lazy(() => import("./pages/Preview"));
// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient();

const ThemeInitializer = () => {
  // Apenas para garantir que a classe de tema seja aplicada no carregamento
  useTheme();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/app">
        <ThemeInitializer />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/preview" element={<Preview />} />

            <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/plano" element={<PersonalPlan />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateHabit />} />
              <Route path="/habits" element={<MyHabits />} />
              <Route path="/habits/edit/:id" element={<EditHabit />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/meditation" element={<Meditation />} />
              <Route path="/books" element={<BooksHub />} />
              <Route path="/tips" element={<Tips />} />
              <Route path="/guided" element={<GuidedJourney />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bonus" element={<Bonus />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


