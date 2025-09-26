import { useState, useEffect, useCallback } from "react";
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
  const { toast } = useToast();

  const fetchHabits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setHabits((data || []) as Habit[]);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar seus habitos",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchTodayCompletions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('completed_at', today);

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  }, []);

  const createHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'streak' | 'is_active'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .insert([{
          ...habitData,
          user_id: user.id,
          streak: 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      setHabits(prev => [...prev, data as Habit]);
      toast({
        title: "Sucesso!",
        description: "Habito criado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "Erro",
        description: "Nao foi possivel criar o habito",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleHabit = async (habitId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingCompletion = completions.find(c => c.habit_id === habitId);

      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) throw error;
        
        setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
        
        // Update streak
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          const newStreak = Math.max(0, habit.streak - 1);
          await updateHabitStreak(habitId, newStreak);
        }
      } else {
        // Add completion
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('habit_completions')
          .insert([{
            habit_id: habitId,
            user_id: user.id,
            completed_at: today
          }])
          .select()
          .single();

        if (error) throw error;
        
        setCompletions(prev => [...prev, data]);
        
        // Update streak
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          const newStreak = habit.streak + 1;
          await updateHabitStreak(habitId, newStreak);
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
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
        .from('habits')
        .update({ streak })
        .eq('id', habitId);

      if (error) throw error;
      
      setHabits(prev => 
        prev.map(habit => 
          habit.id === habitId ? { ...habit, streak } : habit
        )
      );
    } catch (error) {
      console.error('Error updating habit streak:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHabits(), fetchTodayCompletions()]);
      setLoading(false);
    };

    loadData();
  }, [fetchHabits, fetchTodayCompletions]);

  const getHabitCompletionStatus = (habitId: string) => {
    return completions.some(c => c.habit_id === habitId);
  };

  return {
    habits,
    loading,
    createHabit,
    toggleHabit,
    getHabitCompletionStatus,
    fetchHabits
  };
};
