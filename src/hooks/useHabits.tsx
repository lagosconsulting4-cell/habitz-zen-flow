import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const emitProgressChange = (date?: string) => {
  window.dispatchEvent(
    new CustomEvent("habit:completion-changed", {
      detail: { date: date ?? new Date().toISOString().split("T")[0] },
    })
  );
};

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [completionsDate, setCompletionsDate] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchHabits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setHabits((data || []) as Habit[]);
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar seus habitos",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchCompletionsForDate = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("completed_at", date);

      if (error) throw error;
      setCompletions(data || []);
      setCompletionsDate(date);
      return data || [];
    } catch (error) {
      console.error("Error fetching completions:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      await Promise.all([fetchHabits(), fetchCompletionsForDate(today)]);
      setLoading(false);
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

  const toggleHabit = async (habitId: string, date?: string) => {
    const targetDate = date ?? new Date().toISOString().split("T")[0];

    try {
      const { data: existingCompletion, error: existingError } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("habit_id", habitId)
        .eq("completed_at", targetDate)
        .maybeSingle();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existingCompletion) {
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("id", existingCompletion.id);

        if (error) throw error;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("habit_completions")
          .insert([
            {
              habit_id: habitId,
              user_id: user.id,
              completed_at: targetDate,
            },
          ]);

        if (error) throw error;
      }

      await fetchCompletionsForDate(targetDate);
      emitProgressChange(targetDate);

      const habit = habits.find((h) => h.id === habitId);
      const today = new Date().toISOString().split("T")[0];

      if (habit && targetDate === today) {
        const increment = !existingCompletion;
        const newStreak = Math.max(0, habit.streak + (increment ? 1 : -1));
        await updateHabitStreak(habitId, newStreak);
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o habito",
        variant: "destructive",
      });
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
    return habits.filter((habit) => habit.days_of_week.includes(weekday));
  };

  const getHabitCompletionStatus = (habitId: string, date?: string) => {
    const targetDate = date ?? completionsDate;
    if (!targetDate || completionsDate !== targetDate) {
      return false;
    }
    return completions.some((c) => c.habit_id === habitId);
  };

  return {
    habits,
    loading,
    createHabit,
    toggleHabit,
    getHabitsForDate,
    getHabitCompletionStatus,
    fetchHabits,
    fetchCompletionsForDate,
    completions,
    completionsDate,
  };
};





