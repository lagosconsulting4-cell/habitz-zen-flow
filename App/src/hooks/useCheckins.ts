import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEventGlobal } from "@/hooks/useEventTracker";

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  mood_level: number; // 1-5
  energy_level?: number | null;
  focus_level?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para gerenciar check-ins emocionais diários
 */
export const useCheckins = () => {
  const queryClient = useQueryClient();

  // Buscar check-in de hoje
  const { data: todayCheckin, isLoading } = useQuery({
    queryKey: ["today-checkin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("id, user_id, checkin_date, mood_level, energy_level, focus_level, notes, created_at, updated_at")
        .eq("user_id", user.id)
        .eq("checkin_date", today)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching today's checkin:", error);
        return null;
      }

      return data as DailyCheckin | null;
    },
    staleTime: 60 * 1000, // 1 minute - checkins don't change frequently
  });

  // Buscar últimos N check-ins
  const { data: recentCheckins } = useQuery({
    queryKey: ["recent-checkins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("id, user_id, checkin_date, mood_level, energy_level, focus_level")
        .eq("user_id", user.id)
        .order("checkin_date", { ascending: false })
        .limit(30); // Últimos 30 dias

      if (error) {
        console.error("Error fetching recent checkins:", error);
        return [];
      }

      return data as DailyCheckin[];
    },
    staleTime: 60 * 1000, // 1 minute - checkins don't change frequently
  });

  // Criar check-in
  const createCheckin = useMutation({
    mutationFn: async (moodLevel: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_checkins")
        .insert({
          user_id: user.id,
          checkin_date: today,
          mood_level: moodLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DailyCheckin;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["today-checkin"] });
      queryClient.invalidateQueries({ queryKey: ["recent-checkins"] });
      toast.success("Check-in registrado!");
      // Track checkin event for analytics
      trackEventGlobal("checkin_submitted", {
        mood_level: data.mood_level,
        checkin_date: data.checkin_date,
      });
    },
    onError: (error) => {
      console.error("Error creating checkin:", error);
      toast.error("Erro ao registrar check-in");
    },
  });

  // Atualizar check-in (caso usuário queira mudar)
  const updateCheckin = useMutation({
    mutationFn: async ({ id, moodLevel }: { id: string; moodLevel: number }) => {
      const { data, error } = await supabase
        .from("daily_checkins")
        .update({ mood_level: moodLevel })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DailyCheckin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-checkin"] });
      queryClient.invalidateQueries({ queryKey: ["recent-checkins"] });
      toast.success("Check-in atualizado!");
    },
    onError: (error) => {
      console.error("Error updating checkin:", error);
      toast.error("Erro ao atualizar check-in");
    },
  });

  // Calcular média de humor dos últimos N dias
  const getAverageMood = (days: number = 7): number | null => {
    if (!recentCheckins || recentCheckins.length === 0) return null;

    const relevantCheckins = recentCheckins.slice(0, days);
    const sum = relevantCheckins.reduce((acc, checkin) => acc + checkin.mood_level, 0);
    return Math.round((sum / relevantCheckins.length) * 10) / 10; // 1 casa decimal
  };

  // Contar total de check-ins
  const getTotalCheckins = (): number => {
    return recentCheckins?.length || 0;
  };

  // Verificar se já fez check-in hoje
  const hasCheckedInToday = (): boolean => {
    return !!todayCheckin;
  };

  return {
    // Dados
    todayCheckin,
    recentCheckins,
    isLoading,

    // Mutations
    createCheckin,
    updateCheckin,

    // Helpers
    hasCheckedInToday,
    getAverageMood,
    getTotalCheckins,
  };
};

/**
 * Retorna emoji baseado no nível de humor
 */
export const getMoodEmoji = (level: number): string => {
  switch (level) {
    case 1:
      return "😔"; // Péssimo
    case 2:
      return "😕"; // Ruim
    case 3:
      return "😐"; // Neutro
    case 4:
      return "🙂"; // Bom
    case 5:
      return "😊"; // Ótimo
    default:
      return "😐";
  }
};

/**
 * Retorna texto descritivo baseado no nível de humor
 */
export const getMoodLabel = (level: number): string => {
  switch (level) {
    case 1:
      return "Péssimo";
    case 2:
      return "Ruim";
    case 3:
      return "Neutro";
    case 4:
      return "Bom";
    case 5:
      return "Ótimo";
    default:
      return "Neutro";
  }
};
