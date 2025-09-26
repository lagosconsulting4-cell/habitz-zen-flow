import { useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GuidedDay {
  id: string;
  week: number;
  day: number;
  global_day: number;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  type: "action" | "reflection" | "challenge";
  audio_url: string | null;
}

interface GuidedState {
  started_at: string;
  last_completed_global_day: number;
}

interface DayStatus extends GuidedDay {
  status: "completed" | "available" | "locked";
  isToday: boolean;
}

interface UseGuidedReturn {
  weeks: Array<{ week: number; days: DayStatus[] }>;
  loading: boolean;
  progressPercent: number;
  state: GuidedState | null;
  completeDay: (globalDay: number) => Promise<void>;
  todayGlobalDay: number;
}

const useEnsureState = () => {
  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("guided_user_state")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        const { error: insertError } = await supabase
          .from("guided_user_state")
          .insert({ user_id: user.id });

        if (insertError) {
          throw insertError;
        }
      }
    },
  });
};

export const useGuided = (): UseGuidedReturn => {
  const queryClient = useQueryClient();
  const ensureStateMutation = useEnsureState();

  // Perform best-effort initialization without blocking the UI rendering
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureStateMutation.mutateAsync();
      } catch (err) {
        // Fail quietly: if state table is missing (404) or RLS blocks, don't freeze the UI
        console.warn("Guided state init failed", err);
      } finally {
        // nothing
      }
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally run once at mount; mutation ref is stable for this scope
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: daysData, isLoading: daysLoading } = useQuery<{ days: GuidedDay[] }>({
    queryKey: ["guided-days"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guided_days")
        .select("*")
        .order("global_day", { ascending: true });

      if (error) {
        throw error;
      }

      return { days: (data || []) as GuidedDay[] };
    },
    retry: 1,
  });

  const { data: stateData, isLoading: stateLoading } = useQuery<{ state: GuidedState | null }>({
    queryKey: ["guided-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guided_user_state")
        .select("started_at, last_completed_global_day")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { state: data as GuidedState | null };
    },
    retry: 1,
  });

  const { data: completionsData, isLoading: completionsLoading } = useQuery<{ completions: number[] }>({
    queryKey: ["guided-completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guided_day_completions")
        .select("global_day");

      if (error) {
        throw error;
      }

      return {
        completions: (data || []).map((item) => item.global_day),
      };
    },
    retry: 1,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (globalDay: number) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("guided_day_completions")
        .insert({ user_id: user.id, global_day: globalDay });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["guided-completions"] });
      await queryClient.invalidateQueries({ queryKey: ["guided-state"] });
    },
  });

  const days = daysData?.days ?? [];
  const state = stateData?.state ?? null;
  const completedDays = new Set(completionsData?.completions ?? []);

  const totalDays = days.length;

  let allowedByTime = 1;
  let lastCompleted = 0;
  let todayGlobalDay = 1;
  if (state) {
    lastCompleted = state.last_completed_global_day;
    const startedAt = new Date(state.started_at + "T00:00:00");
    const now = new Date();
    const diff = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
    allowedByTime = Math.max(1, diff + 1);
    todayGlobalDay = allowedByTime;
  }

  const unlockedMaxDay = Math.max(1, Math.min(allowedByTime, lastCompleted + 1));

  const weeksMap = new Map<number, DayStatus[]>();

  days.forEach((day) => {
    const status: DayStatus["status"] = completedDays.has(day.global_day)
      ? "completed"
      : day.global_day <= unlockedMaxDay
        ? "available"
        : "locked";

    const entry: DayStatus = {
      ...day,
      status,
      isToday: day.global_day === todayGlobalDay,
    };

    if (!weeksMap.has(day.week)) {
      weeksMap.set(day.week, []);
    }

    weeksMap.get(day.week)!.push(entry);
  });

  const weeks = Array.from(weeksMap.entries())
    .sort(([weekA], [weekB]) => weekA - weekB)
    .map(([week, weekDays]) => ({ week, days: weekDays }));

  const progressPercent = totalDays === 0
    ? 0
    : Math.min(100, Math.round((lastCompleted / totalDays) * 100));

  // Do not tie UI loading state to the ensureState mutation to avoid spinner locks
  const loading = daysLoading || stateLoading || completionsLoading;

  return {
    weeks,
    loading,
    progressPercent,
    state,
    completeDay: async (globalDay: number) => {
      await completeDayMutation.mutateAsync(globalDay);
    },
    todayGlobalDay,
  };
};
