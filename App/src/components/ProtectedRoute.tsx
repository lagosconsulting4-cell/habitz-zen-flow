import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { usePremium } from "@/hooks/usePremium";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Allow onboarding-new route to work without auth during development
  const isOnboardingNewRoute = location.pathname === "/onboarding-new";

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // Skip auth check for onboarding-new during development
    if (isOnboardingNewRoute) {
      setLoading(false);
      return;
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isOnboardingNewRoute]);

  const { isPremium, loading: premiumLoading } = usePremium(user?.id);

  if (loading || premiumLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow onboarding-new to be accessible without authentication during development
  if (isOnboardingNewRoute) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!isPremium) {
    // Redirect to external /bora page (outside /app basename)
    window.location.href = "/bora";
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


