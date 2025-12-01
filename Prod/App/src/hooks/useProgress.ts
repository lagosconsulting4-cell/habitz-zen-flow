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

interface MonthlyStats {
  perfectDays: number;
  consistency: number;
  evaluatedDays: number;
  topCategory: string | null;
}

interface ProgressData {
  weeklySeries: WeeklySeriesPoint[];
  monthlyStats: MonthlyStats;
  habitStreaks: HabitStreak[];
  bestGlobalStreak: number;
  heatmap: { date: string; count: number }[];
  topHabits: { habitId: string; name: string; iconKey: string | null; completions: number; category: string }[];
  dailyTrend: { date: string; count: number }[];
  weekdayDist: { weekday: number; label: string; count: number }[];
  hourDist: { hour: number; count: number }[];
  totalCompletions: number;
  consistencyAllTime: number;
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
  const monthStart = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return d;
  }, [today]);
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

  const { data: completionsData, isLoading: completionsLoading, refetch: refetchCompletions } = useQuery({
    queryKey: ["progress-completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("habit_id, completed_at, value")
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

  const completionsByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    completions.forEach((row) => {
      const set = map.get(row.completed_at) ?? new Set<string>();
      set.add(row.habit_id);
      map.set(row.completed_at, set);
    });
    return map;
  }, [completions]);

  const completionsCountByHabit = useMemo(() => {
    const map = new Map<string, number>();
    completions.forEach((row) => {
      map.set(row.habit_id, (map.get(row.habit_id) ?? 0) + 1);
    });
    return map;
  }, [completions]);

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

  const monthlyStats: MonthlyStats = useMemo(() => {
    let perfectDays = 0;
    let consistencyAccumulator = 0;
    let evaluatedDays = 0;
    const categoryCounts = new Map<string, number>();

    const currentDate = new Date(monthStart);
    while (currentDate <= today) {
      const key = formatDate(currentDate);
      const scheduledHabits = habits.filter((habit) => {
        if (!habit.days_of_week.includes(currentDate.getDay())) return false;
        return new Date(habit.created_at) <= currentDate;
      });
      const scheduled = scheduledHabits.length;
      const completed = completionsByDate.get(key)?.size ?? 0;

      if (scheduled > 0) {
        evaluatedDays += 1;
        const ratio = completed / scheduled;
        consistencyAccumulator += ratio;
        if (completed === scheduled) {
          perfectDays += 1;
        }

        const completedHabitsIds = completionsByDate.get(key) ?? new Set<string>();
        scheduledHabits.forEach((habit) => {
          if (completedHabitsIds.has(habit.id)) {
            categoryCounts.set(habit.category, (categoryCounts.get(habit.category) ?? 0) + 1);
          }
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      perfectDays,
      consistency: evaluatedDays > 0 ? Math.round((consistencyAccumulator / evaluatedDays) * 100) : 0,
      evaluatedDays,
      topCategory,
    };
  }, [monthStart, today, habits, completionsByDate]);

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

      let currentStreak = 0;
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

      currentStreak = running;

      streaks.push({
        habitId: habit.id,
        name: habit.name,
        iconKey: habit.icon_key,
        streak: currentStreak,
        bestStreak,
        category: habit.category,
      });
    });

    return streaks.sort((a, b) => b.streak - a.streak);
  }, [habits, completionsByDate, streakRangeStart, today]);

  const bestGlobalStreak = habitStreaks.reduce((max, streak) => Math.max(max, streak.bestStreak), 0);

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

  const topHabits = useMemo(() => {
    return habits
      .map((h) => ({
        habitId: h.id,
        name: h.name,
        iconKey: h.icon_key,
        completions: completionsCountByHabit.get(h.id) ?? 0,
        category: h.category,
      }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);
  }, [habits, completionsCountByHabit]);

  const totalCompletions = completions.length;

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

  const weekdayDist = useMemo(() => {
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
    const counts = Array.from({ length: 7 }, () => 0);
    completions.forEach((row) => {
      const date = new Date(row.completed_at + "T00:00:00");
      counts[date.getDay()] += 1;
    });
    return counts.map((count, idx) => ({ weekday: idx, label: labels[idx], count }));
  }, [completions]);

  const hourDist = useMemo(() => {
    const buckets = Array.from({ length: 24 }, () => 0);
    completions.forEach((row) => {
      if (!row.completed_at_time) return;
      const [h] = row.completed_at_time.split(":").map((n) => Number(n));
      if (!Number.isNaN(h)) {
        buckets[h] += 1;
      }
    });
    return buckets.map((count, hour) => ({ hour, count }));
  }, [completions]);

  const consistencyAllTime = useMemo(() => {
    // Usando janela de 90 dias (streakRangeStart..today)
    let scheduledTotal = 0;
    let completedTotal = 0;
    const cursor = new Date(streakRangeStart);
    while (cursor <= today) {
      const key = formatDate(cursor);
      const scheduled = habits.filter((h) => h.days_of_week.includes(cursor.getDay()) && new Date(h.created_at) <= cursor).length;
      const completed = completionsByDate.get(key)?.size ?? 0;
      scheduledTotal += scheduled;
      completedTotal += completed;
      cursor.setDate(cursor.getDate() + 1);
    }
    if (scheduledTotal === 0) return 0;
    return Math.round((completedTotal / scheduledTotal) * 100);
  }, [habits, completionsByDate, streakRangeStart, today]);

  const data: ProgressData = {
    weeklySeries,
    monthlyStats,
    habitStreaks,
    bestGlobalStreak,
    heatmap,
    topHabits,
    dailyTrend,
    weekdayDist,
    hourDist,
    totalCompletions,
    consistencyAllTime,
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

