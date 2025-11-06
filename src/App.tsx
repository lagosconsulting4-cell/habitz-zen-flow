import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Quiz from "./pages/Quiz";
import Analysis from "./pages/Analysis";
import PersonalPlan from "./pages/PersonalPlan";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CreateHabit from "./pages/CreateHabit";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Meditation from "./pages/Meditation";
import BooksHub from "./pages/BooksHub";
import Tips from "./pages/Tips";
import GuidedJourney from "./pages/GuidedJourney";
import Auth from "./pages/Auth";
import Calendar from "./pages/Calendar";
import Pricing from "./pages/Pricing";
import Thanks from "./pages/Thanks";
import Cancel from "./pages/Cancel";
import MyHabits from "./pages/MyHabits";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/analise" element={<Analysis />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/cancel" element={<Cancel />} />

          <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/plano" element={<PersonalPlan />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateHabit />} />
            <Route path="/habits" element={<MyHabits />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/meditation" element={<Meditation />} />
            <Route path="/books" element={<BooksHub />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/guided" element={<GuidedJourney />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


