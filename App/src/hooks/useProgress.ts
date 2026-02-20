import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HabitRow {
  id: string;
  name: string;
  emoji: string | null;
  icon_key: string | null;
  category: string;
  unit?: "none" | "steps" | "minutes" | "km" | "custom" | null;
  goal_value?: number | null;
  frequency_type?: "fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily" | null;
  times_per_week?: number | null;
  times_per_month?: number | null;
  every_n_days?: number | null;
  days_of_week: number[];
  created_at: string;
  is_active: boolean;
}

interface CompletionRow {
  habit_id: string;
  completed_at: string;
  value?: number | null;
  completed_at_time?: string | null;
}

interface WeeklySeriesPoint {
  date: string;
  dayLabel: string;
  completed: number;
  scheduled: number;
}

interface HabitStreak {
  habitId: string;
  name: string;
  iconKey: string | null;
  streak: number;
  bestStreak: number;
  category: string;
}

export interface WeeklyInsight {
  thisWeekConsistency: number;
  lastWeekConsistency: number;
  delta: number;
  habitsOnTrack: number;
  habitsTotal: number;
  perfectDaysThisWeek: number;
  personalRecord: { name: string; streak: number } | null;
}

export interface HabitAttention {
  habitId: string;
  name: string;
  iconKey: string | null;
  category: string;
  daysSinceLastCompletion: number;
}

interface ProgressData {
  weeklySeries: WeeklySeriesPoint[];
  habitStreaks: HabitStreak[];
  heatmap: { date: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
  weeklyInsight: WeeklyInsight;
  habitsNeedingAttention: HabitAttention[];
}

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getWeekdayLabel = (date: Date) => {
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
};

const useProgress = () => {
  const queryClient = useQueryClient();

  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => addDays(today, -6), [today]);
  const streakRangeStart = useMemo(() => addDays(today, -90), [today]);

  const { data: habitsData, isLoading: habitsLoading } = useQuery({
    queryKey: ["progress-habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id, name, emoji, icon_key, category, days_of_week, created_at, is_active, unit, goal_value, frequency_type, times_per_week, times_per_month, every_n_days")
        .eq("is_active", true);

      if (error) throw error;
      return (data || []) as HabitRow[];
    },
  });

  const { data: completionsData, isLoading: completionsLoading } = useQuery({
    queryKey: ["progress-completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_at, value, completed_at_time")
        .gte("completed_at", formatDate(streakRangeStart))
        .lte("completed_at", formatDate(today));

      if (error) throw error;
      return (data || []) as CompletionRow[];
    },
  });

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["progress-completions"] });
    };

    window.addEventListener("habit:completion-changed", handler);
    return () => window.removeEventListener("habit:completion-changed", handler);
  }, [queryClient]);

  const loading = habitsLoading || completionsLoading;
  const habits = useMemo(() => habitsData ?? [], [habitsData]);
  const completions = useMemo(() => completionsData ?? [], [completionsData]);

  // Filter completions to only include active habits
  const activeHabitIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits]);
  const filteredCompletions = useMemo(
    () => completions.filter((c) => activeHabitIds.has(c.habit_id)),
    [completions, activeHabitIds]
  );

  const completionsByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    filteredCompletions.forEach((row) => {
      const set = map.get(row.completed_at) ?? new Set<string>();
      set.add(row.habit_id);
      map.set(row.completed_at, set);
    });
    return map;
  }, [filteredCompletions]);

  const weeklySeries: WeeklySeriesPoint[] = useMemo(() => {
    const result: WeeklySeriesPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const key = formatDate(date);
      const completed = completionsByDate.get(key)?.size ?? 0;
      const scheduled = habits.filter((habit) => {
        if (!habit.days_of_week.includes(date.getDay())) return false;
        return new Date(habit.created_at) <= date;
      }).length;

      result.push({
        date: key,
        dayLabel: getWeekdayLabel(date),
        completed,
        scheduled,
      });
    }
    return result;
  }, [weekStart, habits, completionsByDate]);

  const habitStreaks: HabitStreak[] = useMemo(() => {
    const streaks: HabitStreak[] = [];
    habits.forEach((habit) => {
      const habitDates: Date[] = [];
      const currentDate = new Date(streakRangeStart);
      while (currentDate <= today) {
        if (habit.days_of_week.includes(currentDate.getDay()) && new Date(habit.created_at) <= currentDate) {
          habitDates.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      let bestStreak = 0;
      let running = 0;

      habitDates.forEach((date) => {
        const key = formatDate(date);
        const completed = completionsByDate.get(key)?.has(habit.id) ?? false;
        if (completed) {
          running += 1;
          bestStreak = Math.max(bestStreak, running);
        } else {
          running = 0;
        }
      });

      const currentStreak = running;

      streaks.push({
        habitId: habit.id,
        name: habit.name,
        iconKey: habit.icon_key,
        streak: currentStreak,
        bestStreak,
        category: habit.category,
      });
    });

    return streaks.filter((s) => s.streak > 0).sort((a, b) => b.streak - a.streak);
  }, [habits, completionsByDate, streakRangeStart, today]);

  const heatmap = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = addDays(today, -i);
      const key = formatDate(d);
      const count = completionsByDate.get(key)?.size ?? 0;
      days.push({ date: key, count });
    }
    return days;
  }, [today, completionsByDate]);

  const dailyTrend = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 89; i >= 0; i -= 1) {
      const d = addDays(today, -i);
      const key = formatDate(d);
      const count = completionsByDate.get(key)?.size ?? 0;
      days.push({ date: key, count });
    }
    return days;
  }, [today, completionsByDate]);

  const weeklyInsight: WeeklyInsight = useMemo(() => {
    // This week
    const thisWeekCompleted = weeklySeries.reduce((sum, d) => sum + d.completed, 0);
    const thisWeekScheduled = weeklySeries.reduce((sum, d) => sum + d.scheduled, 0);
    const thisWeekConsistency = thisWeekScheduled > 0
      ? Math.round((thisWeekCompleted / thisWeekScheduled) * 100)
      : 0;

    // Last week
    const lastWeekStart = addDays(weekStart, -7);
    let lastWeekCompleted = 0;
    let lastWeekScheduled = 0;
    for (let i = 0; i < 7; i++) {
      const date = addDays(lastWeekStart, i);
      const key = formatDate(date);
      const completed = completionsByDate.get(key)?.size ?? 0;
      const scheduled = habits.filter((h) => {
        if (!h.days_of_week.includes(date.getDay())) return false;
        return new Date(h.created_at) <= date;
      }).length;
      lastWeekCompleted += completed;
      lastWeekScheduled += scheduled;
    }
    const lastWeekConsistency = lastWeekScheduled > 0
      ? Math.round((lastWeekCompleted / lastWeekScheduled) * 100)
      : 0;

    const delta = thisWeekConsistency - lastWeekConsistency;

    const habitsOnTrack = habitStreaks.filter((s) => s.streak > 0).length;
    const habitsTotal = habitStreaks.length;

    const perfectDaysThisWeek = weeklySeries.filter(
      (d) => d.scheduled > 0 && d.completed === d.scheduled
    ).length;

    const record = habitStreaks.find((s) => s.streak === s.bestStreak && s.streak > 1) || null;

    return {
      thisWeekConsistency,
      lastWeekConsistency,
      delta,
      habitsOnTrack,
      habitsTotal,
      perfectDaysThisWeek,
      personalRecord: record ? { name: record.name, streak: record.streak } : null,
    };
  }, [weeklySeries, weekStart, habits, completionsByDate, habitStreaks]);

  const habitsNeedingAttention: HabitAttention[] = useMemo(() => {
    const attention: HabitAttention[] = [];

    // Pre-build Map for O(1) lookup instead of O(n) .find()
    const streakMap = new Map(habitStreaks.map((s) => [s.habitId, s]));

    habits.forEach((habit) => {
      const streak = streakMap.get(habit.id);
      if (!streak || streak.streak > 0) return;

      // Check if habit had scheduled days in the last 7 days
      let hadScheduledDays = false;
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, -i);
        if (habit.days_of_week.includes(date.getDay()) && new Date(habit.created_at) <= date) {
          hadScheduledDays = true;
          break;
        }
      }
      if (!hadScheduledDays) return;

      // Find last completion
      let daysSince = -1;
      for (let i = 0; i <= 90; i++) {
        const date = addDays(today, -i);
        const key = formatDate(date);
        if (completionsByDate.get(key)?.has(habit.id)) {
          daysSince = i;
          break;
        }
      }

      attention.push({
        habitId: habit.id,
        name: habit.name,
        iconKey: habit.icon_key,
        category: habit.category,
        daysSinceLastCompletion: daysSince === -1 ? 999 : daysSince,
      });
    });

    return attention.sort((a, b) => b.daysSinceLastCompletion - a.daysSinceLastCompletion);
  }, [habits, habitStreaks, today, completionsByDate]);

  const data: ProgressData = {
    weeklySeries,
    habitStreaks,
    heatmap,
    dailyTrend,
    weeklyInsight,
    habitsNeedingAttention,
  };

  return {
    loading,
    ...data,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-habits"] });
      queryClient.invalidateQueries({ queryKey: ["progress-completions"] });
    },
  };
};

export default useProgress;
