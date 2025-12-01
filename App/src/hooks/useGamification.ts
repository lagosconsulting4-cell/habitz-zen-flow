import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getRewardsForLevel } from "@/data/levelRewards";
import { getUnlockable } from "@/data/unlockables";

// ============================================================================
// TYPES
// ============================================================================

export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  perfect_days: number;
  total_habits_completed: number;
  created_at: string;
  updated_at: string;
}

export interface UserUnlock {
  id: string;
  user_id: string;
  unlock_type: "icon" | "widget" | "meditation" | "template" | "journey";
  unlock_id: string;
  unlocked_at: string;
}

export interface AddXPResult {
  new_total_xp: number;
  new_level: number;
  leveled_up: boolean;
  previous_level: number;
}

export interface UpdateStreakResult {
  current_streak: number;
  is_new_record: boolean;
}

export interface LevelConfig {
  level: number;
  name: string;
  tier: "bronze" | "prata" | "ouro" | "diamante";
  minXP: number;
  maxXP: number;
}

// ============================================================================
// LEVEL CONFIGURATION
// ============================================================================

export const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, name: "Bronze I", tier: "bronze", minXP: 0, maxXP: 99 },
  { level: 2, name: "Bronze II", tier: "bronze", minXP: 100, maxXP: 499 },
  { level: 3, name: "Bronze III", tier: "bronze", minXP: 500, maxXP: 999 },
  { level: 4, name: "Prata I", tier: "prata", minXP: 1000, maxXP: 1999 },
  { level: 5, name: "Prata II", tier: "prata", minXP: 2000, maxXP: 3499 },
  { level: 6, name: "Prata III", tier: "prata", minXP: 3500, maxXP: 4999 },
  { level: 7, name: "Ouro I", tier: "ouro", minXP: 5000, maxXP: 8999 },
  { level: 8, name: "Ouro II", tier: "ouro", minXP: 9000, maxXP: 11999 },
  { level: 9, name: "Ouro III", tier: "ouro", minXP: 12000, maxXP: 14999 },
  { level: 10, name: "Diamante", tier: "diamante", minXP: 15000, maxXP: Infinity },
];

// XP por ação
export const XP_VALUES = {
  HABIT_COMPLETE: 10,
  STREAK_BONUS_3: 5, // Bônus ao atingir 3 dias seguidos
  STREAK_BONUS_7: 15, // Bônus ao atingir 7 dias seguidos
  STREAK_BONUS_30: 50, // Bônus ao atingir 30 dias seguidos
  PERFECT_DAY: 20, // Completar 100% dos hábitos do dia
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get level config for a given level number
 */
export const getLevelConfig = (level: number): LevelConfig => {
  return LEVEL_CONFIGS.find((cfg) => cfg.level === level) || LEVEL_CONFIGS[0];
};

/**
 * Get level config for a given XP amount
 */
export const getLevelConfigFromXP = (xp: number): LevelConfig => {
  return (
    LEVEL_CONFIGS.find((cfg) => xp >= cfg.minXP && xp <= cfg.maxXP) ||
    LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]
  );
};

/**
 * Calculate progress within current level (0-100%)
 */
export const getLevelProgress = (xp: number): number => {
  const config = getLevelConfigFromXP(xp);
  if (config.maxXP === Infinity) return 100;

  const range = config.maxXP - config.minXP + 1;
  const progress = xp - config.minXP;
  return Math.round((progress / range) * 100);
};

/**
 * Get XP needed to reach next level
 */
export const getXPToNextLevel = (xp: number): number => {
  const config = getLevelConfigFromXP(xp);
  if (config.maxXP === Infinity) return 0;
  return config.maxXP + 1 - xp;
};

// ============================================================================
// HOOK
// ============================================================================

export const useGamification = (userId?: string) => {
  const queryClient = useQueryClient();

  // Query: User Progress
  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: ["user-progress", userId],
    queryFn: async (): Promise<UserProgress | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserProgress | null;
    },
    enabled: Boolean(userId),
    staleTime: 30_000, // Cache por 30 segundos
  });

  // Query: User Unlocks
  const {
    data: unlocks,
    isLoading: unlocksLoading,
    error: unlocksError,
  } = useQuery({
    queryKey: ["user-unlocks", userId],
    queryFn: async (): Promise<UserUnlock[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_unlocks")
        .select("*")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      return (data || []) as UserUnlock[];
    },
    enabled: Boolean(userId),
    staleTime: 60_000, // Cache por 1 minuto
  });

  // Mutation: Add XP
  const addXPMutation = useMutation({
    mutationFn: async ({
      amount,
      reason,
      habitId,
      metadata,
    }: {
      amount: number;
      reason: string;
      habitId?: string;
      metadata?: Record<string, any>;
    }): Promise<AddXPResult> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("add_xp", {
        p_user_id: userId,
        p_amount: amount,
        p_reason: reason,
        p_habit_id: habitId || null,
        p_metadata: metadata || {},
      });

      if (error) throw error;

      // RPC retorna array com uma linha
      const result = (data as AddXPResult[] | null)?.[0];
      if (!result) throw new Error("No result from add_xp");

      return result;
    },
    onSuccess: async (result) => {
      // Invalidar cache de progresso
      queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });

      // Se subiu de nível, disparar evento customizado para animações
      if (result.leveled_up) {
        // Auto-unlock items for new level
        const rewards = getRewardsForLevel(result.new_level);
        const unlockedItems: Array<{
          type: "icon" | "widget" | "meditation" | "template" | "journey";
          id: string;
          name: string;
          description: string;
          icon?: string;
        }> = [];

        if (rewards && rewards.unlocks.length > 0 && userId) {
          for (const unlock of rewards.unlocks) {
            try {
              await supabase.rpc("unlock_item", {
                p_user_id: userId,
                p_unlock_type: unlock.type,
                p_unlock_id: unlock.id,
              });

              const unlockable = getUnlockable(unlock.id);
              if (unlockable) {
                unlockedItems.push({
                  type: unlock.type,
                  id: unlock.id,
                  name: unlockable.name,
                  description: unlockable.description,
                  icon: unlockable.emoji || unlockable.preview,
                });
              }
            } catch (error) {
              console.error(`Failed to unlock ${unlock.type}:${unlock.id}`, error);
            }
          }

          // Invalidar cache de unlocks
          queryClient.invalidateQueries({ queryKey: ["user-unlocks", userId] });
        }

        window.dispatchEvent(
          new CustomEvent("gamification:level-up", {
            detail: {
              fromLevel: result.previous_level,
              toLevel: result.new_level,
              totalXP: result.new_total_xp,
              unlockedItems, // Pass unlocked items to modal
            },
          })
        );
      }

      // Disparar evento de XP ganho
      window.dispatchEvent(
        new CustomEvent("gamification:xp-gained", {
          detail: {
            totalXP: result.new_total_xp,
            currentLevel: result.new_level,
          },
        })
      );
    },
  });

  // Mutation: Update Streak
  const updateStreakMutation = useMutation({
    mutationFn: async (): Promise<UpdateStreakResult> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("update_streak", {
        p_user_id: userId,
      });

      if (error) throw error;

      const result = (data as UpdateStreakResult[] | null)?.[0];
      if (!result) throw new Error("No result from update_streak");

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });

      // Se bateu recorde, disparar evento
      if (result.is_new_record) {
        window.dispatchEvent(
          new CustomEvent("gamification:streak-record", {
            detail: { streak: result.current_streak },
          })
        );
      }
    },
  });

  // Mutation: Unlock Item
  const unlockItemMutation = useMutation({
    mutationFn: async ({
      unlockType,
      unlockId,
    }: {
      unlockType: "icon" | "widget" | "meditation" | "template" | "journey";
      unlockId: string;
    }): Promise<boolean> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("unlock_item", {
        p_user_id: userId,
        p_unlock_type: unlockType,
        p_unlock_id: unlockId,
      });

      if (error) throw error;

      // Retorna true se desbloqueou (novo), false se já estava desbloqueado
      return Boolean(data);
    },
    onSuccess: (isNew, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-unlocks", userId] });

      // Se é novo desbloqueio, disparar evento
      if (isNew) {
        window.dispatchEvent(
          new CustomEvent("gamification:item-unlocked", {
            detail: {
              type: variables.unlockType,
              id: variables.unlockId,
            },
          })
        );
      }
    },
  });

  // Helper: Check if item is unlocked
  const isUnlocked = (
    unlockType: "icon" | "widget" | "meditation" | "template" | "journey",
    unlockId: string
  ): boolean => {
    return (unlocks || []).some(
      (unlock) => unlock.unlock_type === unlockType && unlock.unlock_id === unlockId
    );
  };

  // Helper: Get unlocks by type
  const getUnlocksByType = (
    unlockType: "icon" | "widget" | "meditation" | "template" | "journey"
  ): UserUnlock[] => {
    return (unlocks || []).filter((unlock) => unlock.unlock_type === unlockType);
  };

  // Helper: Award XP for habit completion
  const awardHabitXP = async (habitId: string) => {
    return addXPMutation.mutateAsync({
      amount: XP_VALUES.HABIT_COMPLETE,
      reason: "habit_complete",
      habitId,
    });
  };

  // Helper: Award streak bonus
  const awardStreakBonus = async (streakDays: number) => {
    let amount = 0;
    let reason = "";

    if (streakDays === 3) {
      amount = XP_VALUES.STREAK_BONUS_3;
      reason = "streak_bonus_3";
    } else if (streakDays === 7) {
      amount = XP_VALUES.STREAK_BONUS_7;
      reason = "streak_bonus_7";
    } else if (streakDays === 30) {
      amount = XP_VALUES.STREAK_BONUS_30;
      reason = "streak_bonus_30";
    }

    if (amount > 0) {
      return addXPMutation.mutateAsync({
        amount,
        reason,
        metadata: { streak_days: streakDays },
      });
    }
  };

  // Helper: Award perfect day bonus
  const awardPerfectDayBonus = async () => {
    return addXPMutation.mutateAsync({
      amount: XP_VALUES.PERFECT_DAY,
      reason: "perfect_day",
    });
  };

  // Helper: Get current level config
  const currentLevelConfig = progress
    ? getLevelConfig(progress.current_level)
    : LEVEL_CONFIGS[0];

  // Helper: Get progress in current level
  const currentLevelProgress = progress ? getLevelProgress(progress.total_xp) : 0;

  // Helper: Get XP to next level
  const xpToNextLevel = progress ? getXPToNextLevel(progress.total_xp) : 0;

  // Return hook interface
  return {
    // Data
    progress: progress || null,
    unlocks: unlocks || [],
    currentLevelConfig,
    currentLevelProgress,
    xpToNextLevel,

    // Loading states
    loading: progressLoading || unlocksLoading,
    progressLoading,
    unlocksLoading,

    // Errors
    error: progressError || unlocksError,

    // Mutations
    addXP: addXPMutation.mutateAsync,
    updateStreak: updateStreakMutation.mutateAsync,
    unlockItem: unlockItemMutation.mutateAsync,

    // Mutation states
    isAddingXP: addXPMutation.isPending,
    isUpdatingStreak: updateStreakMutation.isPending,
    isUnlockingItem: unlockItemMutation.isPending,

    // Helpers
    isUnlocked,
    getUnlocksByType,
    awardHabitXP,
    awardStreakBonus,
    awardPerfectDayBonus,

    // Refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-unlocks", userId] });
    },
  };
};

export default useGamification;
