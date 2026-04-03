import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PremiumProfile {
  is_premium: boolean;
  premium_since: string | null;
  phone: string | null;
  has_completed_onboarding: boolean | null;
  onboarding_completed_at: string | null;
}

export const usePremium = (userId?: string) => {
  const profileQuery = useQuery({
    queryKey: ["premium-profile", userId],
    queryFn: async (): Promise<PremiumProfile | null> => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium, premium_since, phone, has_completed_onboarding, onboarding_completed_at")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data as PremiumProfile;
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const productsQuery = useQuery({
    queryKey: ["user-products", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("purchases")
        .select("product_names")
        .eq("status", "paid");

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });

  // Derive product flags
  const purchases = productsQuery.data ?? [];
  const allNames = purchases
    .map((p) => p.product_names?.toLowerCase() ?? "")
    .join(",");
  const hasAnyProductName = purchases.some((p) => p.product_names != null);
  const hasPhone = Boolean(profileQuery.data?.phone);

  // Primary: product_names. Fallback: phone as proxy for Foquinha
  // (pre-04/Mar/2026 only Foquinha saved phone; after that both do,
  // but fallback only triggers when NO purchase has product_names set)
  const hasFoquinha =
    allNames.includes("foquinha") || (!hasAnyProductName && hasPhone);
  const hasBora =
    allNames.includes("bora") || allNames.includes("habitz premium");

  return {
    isPremium: profileQuery.data?.is_premium ?? null,
    premiumSince: profileQuery.data?.premium_since ?? null,
    hasCompletedOnboarding: profileQuery.data?.has_completed_onboarding ?? null,
    onboardingCompletedAt: profileQuery.data?.onboarding_completed_at ?? null,
    loading: profileQuery.isLoading,
    error: profileQuery.error,
    refresh: () => {
      profileQuery.refetch();
      productsQuery.refetch();
    },
    hasBora,
    hasFoquinha,
    hasBoth: hasBora && hasFoquinha,
    productsLoading: productsQuery.isLoading,
  };
};
