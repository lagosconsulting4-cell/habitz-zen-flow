import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminProfile {
  is_admin: boolean;
  admin_since: string | null;
}

export const useAdmin = (userId?: string) => {
  const query = useQuery({
    queryKey: ["admin-profile", userId],
    queryFn: async (): Promise<AdminProfile | null> => {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin, admin_since")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data as AdminProfile;
    },
    enabled: Boolean(userId),
    staleTime: 30_000, // 30 seconds (match usePremium.ts:30)
  });

  return {
    isAdmin: Boolean(query.data?.is_admin),
    adminSince: query.data?.admin_since ?? null,
    loading: query.isLoading,
    refresh: query.refetch,
  };
};
