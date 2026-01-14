import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import ScrollToTop from "@/components/ScrollToTop";
import { useTheme } from "@/hooks/useTheme";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { useSessionTracker } from "@/hooks/useSessionTracker";
import { AuthProvider } from "@/integrations/supabase/auth";

// Lazy load PWA components for better initial bundle
const InstallPrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const UpdatePrompt = lazy(() => import("@/components/pwa/InstallPrompt").then(m => ({ default: m.UpdatePrompt })));
const OfflineIndicator = lazy(() => import("@/components/pwa/OfflineIndicator").then(m => ({ default: m.OfflineIndicator })));

// Lazy load pages for better initial bundle size
const OnboardingFlow = lazy(() => import("./pages/OnboardingFlow"));
const NewOnboardingFlow = lazy(() => import("./components/onboarding/NewOnboardingFlow"));
const PersonalPlan = lazy(() => import("./pages/PersonalPlan"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateHabit = lazy(() => import("./pages/CreateHabit"));
const EditHabit = lazy(() => import("./pages/EditHabit"));
const Progress = lazy(() => import("./pages/Progress"));
const Profile = lazy(() => import("./pages/Profile"));
const CancelSubscription = lazy(() => import("./pages/CancelSubscription"));
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
const DefinirSenha = lazy(() => import("./pages/DefinirSenha"));
const Welcome = lazy(() => import("./pages/Welcome"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminAudit = lazy(() => import("./pages/admin/Audit"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados frescos
      gcTime: 30 * 60 * 1000, // 30 minutos - manter no cache
      retry: (failureCount, error) => {
        // Não tentar novamente se estiver offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Evitar refetch excessivo
    },
    mutations: {
      retry: (failureCount) => {
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
    },
  },
});

const ThemeInitializer = () => {
  // Apenas para garantir que a classe de tema seja aplicada no carregamento
  useTheme();
  return null;
};

// Componente para inicializar sincronização offline
const OfflineSyncInitializer = () => {
  useOfflineSync();
  return null;
};

// Componente para lidar com navegação de notificações
const NotificationNavigationHandler = () => {
  useNotificationNavigation();
  return null;
};

// Componente para rastrear sessões de usuário (analytics)
const SessionTracker = () => {
  useSessionTracker();
  return null;
};

// Componente para prefetch de rotas mais acessadas quando browser estiver idle
const RoutePrefetcher = () => {
  useEffect(() => {
    const prefetchRoutes = () => {
      // Top 5 rotas mais acessadas - prefetch para cache do browser
      import("./pages/Dashboard");
      import("./pages/MyHabits");
      import("./pages/Progress");
      import("./pages/Calendar");
      import("./pages/CreateHabit");
    };

    if ("requestIdleCallback" in window) {
      // Usar requestIdleCallback se disponível (Chrome, Edge, modern browsers)
      requestIdleCallback(prefetchRoutes, { timeout: 2000 });
    } else {
      // Fallback para Safari e browsers antigos
      setTimeout(prefetchRoutes, 1000);
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/app">
        <ThemeInitializer />
        <ScrollToTop />
        {/* PWA Components */}
        <OfflineSyncInitializer />
        <NotificationNavigationHandler />
        <SessionTracker />
        <RoutePrefetcher />
        <Suspense fallback={null}>
          <OfflineIndicator />
          <UpdatePrompt />
          <InstallPrompt />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/thanks" element={<Thanks />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/definir-senha" element={<DefinirSenha />} />
            <Route path="/welcome" element={<Welcome />} />
            {/* Redirect old route for backward compatibility */}
            <Route path="/criar-senha" element={<Navigate to="/definir-senha" replace />} />

            <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/onboarding" element={<OnboardingFlow />} />
              <Route path="/onboarding-new" element={<NewOnboardingFlow />} />
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
              <Route path="/cancel-subscription" element={<CancelSubscription />} />
              <Route path="/bonus" element={<Bonus />} />
            </Route>

            {/* Admin routes - protected with adminOnly */}
            <Route element={<ProtectedRoute adminOnly><ProtectedLayout /></ProtectedRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/content" element={<AdminContent />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


