import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const ROLLING_WINDOW_DAYS = 30;

interface HabitRow {
  id: string;
  is_active: boolean;
  days_of_week: number[];
}

interface CompletionRow {
  habit_id: string;
  completed_at: string;
}

interface ProfileRow {
  premium_since: string | null;
  created_at: string;
}

export interface ProfileInsights {
  activeHabits: number;
  daysUsing: number;
  consistency: number;
  windowDays: number;
  totalCompletions: number;
  expectedCompletions: number;
  sinceDate: string | null;
}

const countOccurrencesByWeekday = (windowDays: number) => {
  const occurrences = Array.from({ length: 7 }, () => 0);
  const today = new Date();
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);
  windowStart.setDate(today.getDate() - (windowDays - 1));

  for (let cursor = 0; cursor < windowDays; cursor += 1) {
    const date = new Date(windowStart);
    date.setDate(windowStart.getDate() + cursor);
    occurrences[date.getDay()] += 1;
  }

  return { occurrences, windowStart };
};

const calculateDaysUsing = (startIso: string | null): number => {
  if (!startIso) {
    return 0;
  }

  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) {
    return 0;
  }

  const today = new Date();
  const diffMs = today.setHours(0, 0, 0, 0) - startDate.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

const defaultInsights: ProfileInsights = {
  activeHabits: 0,
  daysUsing: 0,
  consistency: 0,
  windowDays: ROLLING_WINDOW_DAYS,
  totalCompletions: 0,
  expectedCompletions: 0,
  sinceDate: null,
};

export const useProfileInsights = (userId?: string) => {
  const query = useQuery({
    queryKey: ["profile-insights", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async (): Promise<ProfileInsights> => {
      if (!userId) {
        return defaultInsights;
      }

      const { occurrences, windowStart } = countOccurrencesByWeekday(ROLLING_WINDOW_DAYS);
      const windowStartIso = windowStart.toISOString().split("T")[0];

      const [profileResponse, habitsResponse, completionsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("premium_since, created_at")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("habits")
          .select("id, is_active, days_of_week")
          .eq("user_id", userId),
        supabase
          .from("habit_completions")
          .select("habit_id, completed_at")
          .eq("user_id", userId)
          .gte("completed_at", windowStartIso),
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (habitsResponse.error) throw habitsResponse.error;
      if (completionsResponse.error) throw completionsResponse.error;

      const profile = (profileResponse.data ?? null) as ProfileRow | null;
      const habits = (habitsResponse.data ?? []) as HabitRow[];
      const completions = (completionsResponse.data ?? []) as CompletionRow[];

      const activeHabits = habits.filter((habit) => habit.is_active).length;

      const expectedCompletions = habits.reduce((total, habit) => {
        if (!habit.is_active) return total;
        const habitExpectation = habit.days_of_week.reduce((sum, weekday) => {
          const occurrencesForDay = occurrences[weekday] ?? 0;
          return sum + occurrencesForDay;
        }, 0);
        return total + habitExpectation;
      }, 0);

      const totalCompletions = completions.length;
      const consistency = expectedCompletions > 0
        ? Math.min(100, Math.round((totalCompletions / expectedCompletions) * 100))
        : 0;

      const sinceDate = profile?.premium_since ?? profile?.created_at ?? null;
      const daysUsing = calculateDaysUsing(sinceDate);

      return {
        activeHabits,
        daysUsing,
        consistency,
        windowDays: ROLLING_WINDOW_DAYS,
        totalCompletions,
        expectedCompletions,
        sinceDate,
      };
    },
  });

  return {
    insights: query.data ?? defaultInsights,
    loading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
};
