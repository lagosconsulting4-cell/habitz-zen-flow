import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

export function useProfile() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, is_admin")
        .eq("user_id", user.id)
        .single();
      return profile;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30s — profile updates should reflect quickly
    gcTime: 30 * 60 * 1000,
  });

  return {
    displayName: data?.display_name || null,
    isAdmin: data?.is_admin || false,
    loading: isLoading,
  };
}
