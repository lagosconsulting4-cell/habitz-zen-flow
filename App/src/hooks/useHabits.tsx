import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  addToSyncQueue,
  addCachedCompletion,
  deleteCachedCompletion,
  getCachedCompletionsByDate,
  cacheHabits,
  getCachedHabits,
  cacheCompletions,
  CachedHabit,
} from "@/lib/offline-db";

const emitProgressChange = (date?: string) => {
  window.dispatchEvent(
    new CustomEvent("habit:completion-changed", {
      detail: { date: date ?? new Date().toISOString().split("T")[0] },
    })
  );
};

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  period: "morning" | "afternoon" | "evening";
  streak: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  days_of_week: number[];
  // Novos campos do schema
  color?: string | null;
  icon_key?: string | null;
  unit?: "none" | "steps" | "minutes" | "km" | "custom" | null;
  goal_value?: number | null;
  frequency_type?: "fixed_days" | "times_per_week" | "times_per_month" | "every_n_days" | "daily" | null;
  times_per_week?: number | null;
  times_per_month?: number | null;
  every_n_days?: number | null;
  notification_pref?: HabitNotificationPref | null;
  auto_complete_source?: "manual" | "health" | null;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
  // Novos campos do schema
  value?: number | null;
  note?: string | null;
  completed_at_time?: string | null;
}

export interface HabitNotificationPref {
  reminder_enabled?: boolean;
  reminder_time?: string;
  sound?: string | null;
  time_sensitive?: boolean;
}

// Valid database enum values for habit_unit
type DatabaseHabitUnit = "none" | "steps" | "minutes" | "km" | "custom";

// Map unsupported unit values to valid database enum values
const mapUnitToDatabase = (unit?: string | null): DatabaseHabitUnit => {
  if (!unit || unit === "none") return "none";

  const validUnits: DatabaseHabitUnit[] = ["none", "steps", "minutes", "km", "custom"];
  if (validUnits.includes(unit as DatabaseHabitUnit)) {
    return unit as DatabaseHabitUnit;
  }

  // Map unsupported units to "custom"
  // These include: hours, pages, liters, etc.
  return "custom";
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [completionsDate, setCompletionsDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Debounce ref to prevent double-click race conditions
  const toggleInProgressRef = useRef<Set<string>>(new Set());

  const fetchHabits = useCallback(async () => {
    const isOnline = navigator.onLine;

    try {
      if (isOnline) {
        // ONLINE: Fetch from Supabase and cache
        const { data, error } = await supabase
          .from("habits")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        const habitsData = (data || []) as Habit[];
        setHabits(habitsData);

        // Cache habits for offline use
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && habitsData.length > 0) {
          await cacheHabits(
            habitsData.map((h) => ({
              id: h.id,
              user_id: h.user_id,
              name: h.name,
              emoji: h.emoji,
              category: h.category,
              period: h.period,
              streak: h.streak,
              is_active: h.is_active,
              created_at: h.created_at,
              updated_at: h.updated_at,
            }))
          );
        }
      } else {
        // OFFLINE: Load from IndexedDB cache
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const cached = await getCachedHabits(user.id);
          // Map cached habits to full Habit type
          const habitsData = cached.map((c: CachedHabit) => ({
            ...c,
            days_of_week: [0, 1, 2, 3, 4, 5, 6], // Default, will be synced when online
          })) as Habit[];
          setHabits(habitsData);
        }
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
      // Try loading from cache on error
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const cached = await getCachedHabits(user.id);
          const habitsData = cached.map((c: CachedHabit) => ({
            ...c,
            days_of_week: [0, 1, 2, 3, 4, 5, 6],
          })) as Habit[];
          setHabits(habitsData);
        }
      } catch {
        toast({
          title: "Erro",
          description: "Nao foi possivel carregar seus habitos",
          variant: "destructive",
        });
      }
    }
  // Intentionally no dependencies to keep function identity stable and
  // avoid re-triggering the initial load effect in a loop if `toast` changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCompletionsForDate = useCallback(async (date: string) => {
    const isOnline = navigator.onLine;

    try {
      if (isOnline) {
        // ONLINE: Fetch from Supabase
        const { data, error } = await supabase
          .from("habit_completions")
          .select("*")
          .eq("completed_at", date);

        if (error) throw error;
        setCompletions(data || []);
        setCompletionsDate(date);

        // Cache completions for offline use
        if (data && data.length > 0) {
          await cacheCompletions(
            data.map((c) => ({
              id: c.id,
              habit_id: c.habit_id,
              user_id: c.user_id,
              completed_at: c.completed_at,
              created_at: c.created_at,
            }))
          );
        }

        return data || [];
      } else {
        // OFFLINE: Load from IndexedDB cache
        const cachedCompletions = await getCachedCompletionsByDate(date);
        const mapped = cachedCompletions.map((c) => ({
          id: c.id,
          habit_id: c.habit_id,
          user_id: c.user_id,
          completed_at: c.completed_at,
          created_at: c.created_at,
        }));
        setCompletions(mapped);
        setCompletionsDate(date);
        return mapped;
      }
    } catch (error) {
      console.error("Error fetching completions:", error);
      // Fail gracefully: try loading from cache
      try {
        const cachedCompletions = await getCachedCompletionsByDate(date);
        const mapped = cachedCompletions.map((c) => ({
          id: c.id,
          habit_id: c.habit_id,
          user_id: c.user_id,
          completed_at: c.completed_at,
          created_at: c.created_at,
        }));
        setCompletions(mapped);
        setCompletionsDate(date);
        return mapped;
      } catch {
        setCompletions([]);
        setCompletionsDate(date);
        return [];
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      try {
        // Use settled to avoid hanging the UI if one query fails temporarily
        await Promise.allSettled([fetchHabits(), fetchCompletionsForDate(today)]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchHabits, fetchCompletionsForDate]);

  const createHabit = async (
    habitData: Omit<Habit, "id" | "user_id" | "created_at" | "updated_at" | "streak" | "is_active">
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("habits")
        .insert([
          {
            ...habitData,
            user_id: user.id,
            streak: 0,
            is_active: true,
            // Defaults for new schema fields if not provided
            color: habitData.color ?? null,
            icon_key: habitData.icon_key ?? null,
            // Map unsupported unit values (hours, pages, liters) to "custom"
            unit: mapUnitToDatabase(habitData.unit),
            goal_value: habitData.goal_value ?? null,
            frequency_type: habitData.frequency_type ?? "fixed_days",
            times_per_week: habitData.times_per_week ?? null,
            times_per_month: habitData.times_per_month ?? null,
            every_n_days: habitData.every_n_days ?? null,
            notification_pref: habitData.notification_pref ?? null,
            auto_complete_source: habitData.auto_complete_source ?? "manual",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setHabits((prev) => [...prev, data as Habit]);
      toast({
        title: "Sucesso!",
        description: "Habito criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel criar o habito",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateHabit = async (
    habitId: string,
    updates: Partial<Pick<Habit,
      "name" |
      "emoji" |
      "category" |
      "period" |
      "days_of_week" |
      "is_active" |
      "color" |
      "icon_key" |
      "unit" |
      "goal_value" |
      "frequency_type" |
      "times_per_week" |
      "times_per_month" |
      "every_n_days" |
      "notification_pref" |
      "auto_complete_source"
    >>
  ) => {
    try {
      // Map unit to valid database value if present
      const mappedUpdates = updates.unit !== undefined
        ? { ...updates, unit: mapUnitToDatabase(updates.unit) }
        : updates;

      const { data, error } = await supabase
        .from("habits")
        .update({ ...mappedUpdates })
        .eq("id", habitId)
        .select()
        .single();

      if (error) throw error;

      setHabits((prev) => prev.map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit)));
      return data as Habit;
    } catch (error) {
      console.error("Error updating habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o habito",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setHabitActive = async (habitId: string, isActive: boolean) => {
    await updateHabit(habitId, { is_active: isActive });
    await fetchHabits();
  };

  const archiveHabit = async (habitId: string) => {
    await setHabitActive(habitId, false);
    toast({
      title: "Habito arquivado",
      description: "Ele nao aparecera mais no dia a dia",
    });
  };

  const restoreHabit = async (habitId: string) => {
    await setHabitActive(habitId, true);
    toast({
      title: "Habito reativado",
      description: "Ele voltara a aparecer no seu dia a dia",
    });
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;

      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      toast({ title: "Habito removido" });
      emitProgressChange();
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel remover o habito",
        variant: "destructive",
      });
      throw error;
    }
  };

  const duplicateHabit = async (habitId: string) => {
    try {
      const original = habits.find((habit) => habit.id === habitId);
      if (!original) {
        throw new Error("Habit not found");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("habits")
        .insert([
          {
            name: `${original.name} (copia)`,
            emoji: original.emoji,
            category: original.category,
            period: original.period,
            days_of_week: original.days_of_week,
            user_id: user.id,
            streak: 0,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setHabits((prev) => [...prev, data as Habit]);
      toast({ title: "Habito duplicado" });
    } catch (error) {
      console.error("Error duplicating habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel duplicar o habito",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleHabit = async (habitId: string, date?: string) => {
    const targetDate = date ?? new Date().toISOString().split("T")[0];
    const toggleKey = `${habitId}-${targetDate}`;

    // Debounce: prevent double-clicks causing race conditions
    if (toggleInProgressRef.current.has(toggleKey)) {
      return; // Toggle already in progress for this habit/date
    }

    // Prevent toggling archived habits defensively
    const targetHabit = habits.find((h) => h.id === habitId);
    if (targetHabit && !targetHabit.is_active) {
      toast({ title: "Habito arquivado", description: "Reative o habito para marcá-lo como concluído.", variant: "destructive" });
      return;
    }

    // Mark toggle as in progress
    toggleInProgressRef.current.add(toggleKey);

    // Check if currently online
    const isOnline = navigator.onLine;

    // Check if completion exists locally first
    const existingCompletion = completions.find(
      (c) => c.habit_id === habitId && c.completed_at === targetDate
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (isOnline) {
        // ONLINE: Use atomic RPC for batched operation
        // Replaces 8+ sequential queries with 1 atomic operation
        const { data, error } = await supabase.rpc("complete_habit_atomic", {
          p_user_id: user.id,
          p_habit_id: habitId,
          p_completed_at: targetDate,
          p_xp_amount: 10,
          p_increment_streak: true,
        });

        if (error) throw error;

        // Update local state based on RPC response
        if (data && data.completion_id) {
          if (!existingCompletion) {
            // Adding completion
            const newCompletion: HabitCompletion = {
              id: data.completion_id,
              habit_id: habitId,
              user_id: user.id,
              completed_at: targetDate,
              created_at: new Date().toISOString(),
            };
            setCompletions((prev) => [...prev, newCompletion]);
          } else {
            // Removing completion
            setCompletions((prev) =>
              prev.filter((c) => c.id !== existingCompletion.id)
            );
          }

          // Update streak from RPC response
          if (data.new_streak !== undefined) {
            setHabits((prev) =>
              prev.map((h) =>
                h.id === habitId ? { ...h, streak: data.new_streak } : h
              )
            );
          }
        }
      } else {
        // OFFLINE: Optimistic UI + sync queue
        const tempId = crypto.randomUUID();

        if (existingCompletion) {
          // Remove completion optimistically
          setCompletions((prev) => prev.filter((c) => c.id !== existingCompletion.id));

          // Add to sync queue
          await addToSyncQueue({
            type: "delete_completion",
            payload: { id: existingCompletion.id },
          });

          // Update local IndexedDB cache
          await deleteCachedCompletion(existingCompletion.id);

          toast({
            title: "Marcado como pendente",
            description: "Sera sincronizado quando voltar online",
          });
        } else {
          // Create completion optimistically
          const newCompletion: HabitCompletion = {
            id: tempId,
            habit_id: habitId,
            user_id: user.id,
            completed_at: targetDate,
            created_at: new Date().toISOString(),
          };

          setCompletions((prev) => [...prev, newCompletion]);

          // Add to sync queue
          await addToSyncQueue({
            type: "create_completion",
            payload: {
              habit_id: habitId,
              user_id: user.id,
              completed_at: targetDate,
            },
          });

          // Update local IndexedDB cache
          await addCachedCompletion({
            id: tempId,
            habit_id: habitId,
            user_id: user.id,
            completed_at: targetDate,
            created_at: new Date().toISOString(),
          });

          toast({
            title: "Habito concluido!",
            description: "Sera sincronizado quando voltar online",
          });
        }
      }

      emitProgressChange(targetDate);

      const habit = habits.find((h) => h.id === habitId);
      const today = new Date().toISOString().split("T")[0];

      if (habit && targetDate === today && !isOnline) {
        // For offline: Calculate and update streak locally
        // For online: RPC already updated streak
        const increment = !existingCompletion;
        const newStreak = Math.max(0, habit.streak + (increment ? 1 : -1));
        setHabits((prev) =>
          prev.map((h) => (h.id === habitId ? { ...h, streak: newStreak } : h))
        );
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o habito",
        variant: "destructive",
      });
    } finally {
      // Always clean up the debounce lock
      toggleInProgressRef.current.delete(toggleKey);
    }
  };

  const updateHabitStreak = async (habitId: string, streak: number) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({ streak })
        .eq("id", habitId);

      if (error) throw error;

      setHabits((prev) =>
        prev.map((habit) => (habit.id === habitId ? { ...habit, streak } : habit))
      );
    } catch (error) {
      console.error("Error updating habit streak:", error);
    }
  };

  const getHabitsForDate = (date: Date) => {
    const weekday = date.getDay();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return habits.filter((habit) => {
      if (!habit.is_active) return false;

      const createdAt = new Date(habit.created_at);
      const createdDateOnly = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
      if (createdDateOnly > dateOnly) return false;

      const frequencyType = habit.frequency_type ?? "fixed_days";

      switch (frequencyType) {
        case "daily":
          // Show every day
          return true;

        case "fixed_days":
          // Check if today is in days_of_week
          return habit.days_of_week.includes(weekday);

        case "times_per_week":
          // Show every day - user decides when to complete N times per week
          // The UI/Dashboard can show progress like "2/3 this week"
          return true;

        case "times_per_month":
          // Show every day - user decides when to complete N times per month
          return true;

        case "every_n_days": {
          // Calculate if today is a day to show this habit
          const everyN = habit.every_n_days ?? 1;
          const daysSinceCreation = Math.floor(
            (dateOnly.getTime() - createdDateOnly.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceCreation % everyN === 0;
        }

        default:
          // Fallback to fixed_days behavior
          return habit.days_of_week.includes(weekday);
      }
    });
  };



  const getHabitCompletionStatus = (habitId: string, date?: string) => {
    const targetDate = date ?? completionsDate;
    if (!targetDate || completionsDate !== targetDate) {
      return false;
    }
    return completions.some((c) => c.habit_id === habitId);
  };

  // Optimistic update methods for immediate UI feedback
  const addCompletionOptimistic = useCallback((completion: HabitCompletion) => {
    setCompletions(prev => [...prev, completion]);
  }, []);

  const removeCompletionOptimistic = useCallback((habitId: string, date: string) => {
    setCompletions(prev =>
      prev.filter(c => !(c.habit_id === habitId && c.completed_at === date))
    );
  }, []);

  return {
    habits,
    loading,
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
    deleteHabit,
    duplicateHabit,
    toggleHabit,
    getHabitsForDate,
    getHabitCompletionStatus,
    fetchHabits,
    fetchCompletionsForDate,
    completions,
    completionsDate,
    addCompletionOptimistic,
    removeCompletionOptimistic,
    saveCompletionNote: async (habitId: string, date: string, note: string) => {
      try {
        const { error } = await supabase
          .from("habit_completions")
          .update({ note })
          .eq("habit_id", habitId)
          .eq("completed_at", date);
        if (error) throw error;
        await fetchCompletionsForDate(date);
        return true;
      } catch (err) {
        console.error("Erro ao salvar nota", err);
        return false;
      }
    },
  };
};


