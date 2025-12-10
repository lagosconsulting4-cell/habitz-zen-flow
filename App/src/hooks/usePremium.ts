import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PremiumProfile {
  is_premium: boolean;
  premium_since: string | null;
}

export const usePremium = (userId?: string) => {
  const query = useQuery({
    queryKey: ["premium-profile", userId],
    queryFn: async (): Promise<PremiumProfile | null> => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium, premium_since")
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

  return {
    isPremium: query.data?.is_premium ?? null,
    premiumSince: query.data?.premium_since ?? null,
    loading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
};
