import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getRewardsForLevel } from "@/data/levelRewards";
import { getLocalDateString } from "@/utils/date";
import { getUnlockable } from "@/data/unlockables";
import { toast } from "sonner";

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
// NEW GAMIFICATION TYPES (Gems, Avatars, Achievements, Freezes)
// ============================================================================

// GEMS
export interface UserGems {
  user_id: string;
  current_gems: number;
  lifetime_gems_earned: number;
  lifetime_gems_spent: number;
  created_at: string;
  updated_at: string;
}

export interface GemTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AddGemsResult {
  new_balance: number;
  transaction_id: string;
}

// AVATARS
export type AvatarTier = "common" | "rare" | "epic" | "legendary";

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  tier: AvatarTier;
  gem_cost: number | null;
  unlock_level: number | null;
  unlock_achievement_id: string | null;
  is_premium_exclusive: boolean;
  display_order: number;
  created_at: string;
}

export interface UserAvatar {
  user_id: string;
  avatar_id: string;
  is_equipped: boolean;
  unlocked_at: string;
  avatar?: Avatar; // Joined data
}

// ACHIEVEMENTS
export type AchievementCategory = "habits" | "streaks" | "levels" | "special";
export type AchievementTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  tier: AchievementTier;
  condition_type: string;
  condition_value: number;
  gem_reward: number;
  is_secret: boolean;
  display_order: number;
  created_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  progress_snapshot: Record<string, unknown>;
  unlocked_at: string;
  achievement?: Achievement; // Joined data
}

// STREAK FREEZES
export interface StreakFreezeInventory {
  user_id: string;
  available_freezes: number;
  total_freezes_earned: number;
  total_freezes_used: number;
  last_free_freeze_date: string;
  created_at: string;
  updated_at: string;
}

export interface StreakFreezeEvent {
  id: string;
  user_id: string;
  event_type: "earned" | "purchased" | "used";
  source: string;
  protected_date?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// GEM VALUES FOR ECONOMY
export const GEM_VALUES = {
  HABIT_COMPLETE: 10,
  STREAK_3_BONUS: 15,
  STREAK_7_BONUS: 50,
  STREAK_30_BONUS: 150,
  PERFECT_DAY: 20,
  LEVEL_UP_BASE: 25,
  STREAK_FREEZE_COST: 200,
} as const;

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
        .select("user_id, current_streak, longest_streak, total_habits_completed, current_level, total_xp")
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
        .select("id, user_id, unlock_type, unlock_id, unlocked_at")
        .eq("user_id", userId)
        .order("unlocked_at", { ascending: false });

      if (error) throw error;
      return (data || []) as UserUnlock[];
    },
    enabled: Boolean(userId),
    staleTime: 60_000, // Cache por 1 minuto
  });

  // ============================================================================
  // NEW QUERIES: Gems, Avatars, Achievements, Streak Freezes
  // ============================================================================

  // Query: User Gems
  const {
    data: gems,
    isLoading: gemsLoading,
    refetch: refetchGems,
  } = useQuery({
    queryKey: ["user-gems", userId],
    queryFn: async (): Promise<UserGems | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_gems")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as UserGems | null;
    },
    enabled: Boolean(userId),
    staleTime: 10_000, // 10 segundos - gems mudam frequentemente
  });

  // Query: Gem Transactions (últimas 50)
  const { data: gemTransactions } = useQuery({
    queryKey: ["gem-transactions", userId],
    queryFn: async (): Promise<GemTransaction[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("gem_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as GemTransaction[];
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  // Query: Avatars Catalog (público, cacheable por mais tempo)
  const { data: avatarsCatalog } = useQuery({
    queryKey: ["avatars-catalog"],
    queryFn: async (): Promise<Avatar[]> => {
      const { data, error } = await supabase
        .from("avatars")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data || []) as Avatar[];
    },
    staleTime: 300_000, // 5 minutos - catálogo muda raramente
  });

  // Query: User Avatars (desbloqueados)
  const {
    data: userAvatars,
    isLoading: userAvatarsLoading,
    refetch: refetchUserAvatars,
  } = useQuery({
    queryKey: ["user-avatars", userId],
    queryFn: async (): Promise<UserAvatar[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_avatars")
        .select("user_id, avatar_id, is_equipped, unlocked_at, avatar:avatars(*)")
        .eq("user_id", userId);

      if (error) throw error;
      return (data || []) as UserAvatar[];
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // Query: Achievements Catalog (público)
  const { data: achievementsCatalog } = useQuery({
    queryKey: ["achievements-catalog"],
    queryFn: async (): Promise<Achievement[]> => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return (data || []) as Achievement[];
    },
    staleTime: 300_000,
  });

  // Query: User Achievements (desbloqueados)
  const {
    data: userAchievements,
    isLoading: userAchievementsLoading,
    refetch: refetchUserAchievements,
  } = useQuery({
    queryKey: ["user-achievements", userId],
    queryFn: async (): Promise<UserAchievement[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select("user_id, achievement_id, progress_snapshot, unlocked_at, achievement:achievements(*)")
        .eq("user_id", userId);

      if (error) throw error;
      return (data || []) as UserAchievement[];
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  // Query: Streak Freezes Inventory
  const {
    data: streakFreezes,
    isLoading: streakFreezesLoading,
    refetch: refetchStreakFreezes,
  } = useQuery({
    queryKey: ["streak-freezes", userId],
    queryFn: async (): Promise<StreakFreezeInventory | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_streak_freezes")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as StreakFreezeInventory | null;
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  // Query: Weekly Freeze Purchases Tracking
  const { data: weeklyFreezePurchases } = useQuery({
    queryKey: ["weekly-freeze-purchases", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_streak_freezes")
        .select("weekly_purchases_count, last_purchase_week")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Calcular se ainda é a mesma semana (comparar apenas datas, ignorar horas)
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);

      // Normalizar para YYYY-MM-DD (comparação de strings evita problemas de timezone)
      const currentWeekStartString = currentWeekStart.toISOString().split('T')[0];
      const lastPurchaseWeekString = data?.last_purchase_week || null;

      const isSameWeek = lastPurchaseWeekString && lastPurchaseWeekString >= currentWeekStartString;

      return {
        count: isSameWeek ? (data?.weekly_purchases_count || 0) : 0,
        limit: 3,
        canPurchase: (isSameWeek ? (data?.weekly_purchases_count || 0) : 0) < 3
      };
    },
    enabled: Boolean(userId),
    staleTime: 0, // Refetch imediato após invalidação
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

  // ============================================================================
  // NEW MUTATIONS: Gems, Avatars, Achievements, Streak Freezes
  // ============================================================================

  // Mutation: Add Gems
  const addGemsMutation = useMutation({
    mutationFn: async ({
      amount,
      transactionType,
      relatedEntityType,
      relatedEntityId,
      metadata = {},
    }: {
      amount: number;
      transactionType: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      metadata?: Record<string, unknown>;
    }): Promise<AddGemsResult> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("add_gems", {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: transactionType,
        p_related_entity_type: relatedEntityType || null,
        p_related_entity_id: relatedEntityId || null,
        p_metadata: metadata,
      });

      if (error) throw error;

      const result = (data as AddGemsResult[] | null)?.[0];
      if (!result) throw new Error("No result from add_gems");

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });
      queryClient.invalidateQueries({ queryKey: ["gem-transactions", userId] });

      // Disparar evento de gems ganhas/gastas
      window.dispatchEvent(
        new CustomEvent("gamification:gems-changed", {
          detail: { userId, newBalance: result.new_balance },
        })
      );
    },
  });

  // Mutation: Purchase Avatar
  const purchaseAvatarMutation = useMutation({
    mutationFn: async ({ avatarId }: { avatarId: string }): Promise<boolean> => {
      if (!userId) throw new Error("User not authenticated");

      // 1. Encontrar o custo do avatar
      const avatar = avatarsCatalog?.find((a) => a.id === avatarId);
      if (!avatar) throw new Error("Avatar not found");
      if (!avatar.gem_cost) throw new Error("Avatar is not purchasable with gems");

      // 2. Verificar saldo
      const currentBalance = gems?.current_gems || 0;
      if (currentBalance < avatar.gem_cost) {
        throw new Error(`Insufficient gems. Need ${avatar.gem_cost}, have ${currentBalance}`);
      }

      // 3. Deduzir gems
      const { error: gemsError } = await supabase.rpc("add_gems", {
        p_user_id: userId,
        p_amount: -avatar.gem_cost,
        p_transaction_type: "purchase_avatar",
        p_related_entity_type: "avatar",
        p_related_entity_id: avatarId,
        p_metadata: { avatar_name: avatar.name, avatar_tier: avatar.tier },
      });

      if (gemsError) throw gemsError;

      // 4. Desbloquear avatar
      const { data, error: unlockError } = await supabase.rpc("unlock_avatar", {
        p_user_id: userId,
        p_avatar_id: avatarId,
        p_auto_equip: false,
      });

      if (unlockError) throw unlockError;

      return Boolean(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });
      queryClient.invalidateQueries({ queryKey: ["gem-transactions", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-avatars", userId] });

      // Disparar evento
      window.dispatchEvent(
        new CustomEvent("gamification:avatar-unlocked", {
          detail: { userId, avatarId: variables.avatarId },
        })
      );
    },
  });

  // Mutation: Equip Avatar
  const equipAvatarMutation = useMutation({
    mutationFn: async ({ avatarId }: { avatarId: string }): Promise<void> => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase.rpc("equip_avatar", {
        p_user_id: userId,
        p_avatar_id: avatarId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-avatars", userId] });
      // Perfil também tem o avatar equipado (denormalizado)
      queryClient.invalidateQueries({ queryKey: ["profiles", userId] });
    },
  });

  // Mutation: Unlock Achievement (manual - geralmente via Edge Function)
  const unlockAchievementMutation = useMutation({
    mutationFn: async ({
      achievementId,
      progressSnapshot,
    }: {
      achievementId: string;
      progressSnapshot: Record<string, unknown>;
    }): Promise<number> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("unlock_achievement", {
        p_user_id: userId,
        p_achievement_id: achievementId,
        p_progress_snapshot: progressSnapshot,
      });

      if (error) throw error;

      // Retorna gems ganhas
      return typeof data === "number" ? data : 0;
    },
    onSuccess: (gemsEarned, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });

      // Disparar evento
      window.dispatchEvent(
        new CustomEvent("gamification:achievement-unlocked", {
          detail: { userId, achievementId: variables.achievementId, gemsEarned },
        })
      );
    },
  });

  // Mutation: Purchase Streak Freeze
  const purchaseStreakFreezeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("purchase_streak_freeze_with_limit", {
        p_user_id: userId,
      });

      if (error) throw error;

      // Verificar se retornou erro de negócio
      if (data && !data.success) {
        throw new Error(data.message);
      }

      return data;
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });
        queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });
        queryClient.invalidateQueries({ queryKey: ["gem-transactions", userId] });
        queryClient.invalidateQueries({ queryKey: ["weekly-freeze-purchases", userId] });

        toast.success("Freeze comprado!", {
          description: `Você tem ${result.available_freezes} freezes disponíveis`,
          icon: "❄️",
        });

        window.dispatchEvent(
          new CustomEvent("gamification:freeze-purchased", { detail: { userId } })
        );
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("limite semanal") || error.message.includes("3 freezes")) {
        toast.error("Limite Semanal Atingido", {
          description: "Você já comprou 3 freezes esta semana. Volte na próxima!",
        });
      } else if (error.message.includes("gems") || error.message.includes("Faltam")) {
        toast.error("Gems Insuficientes", {
          description: error.message,
        });
      } else {
        toast.error("Erro na Compra", {
          description: "Tente novamente",
        });
      }
    },
  });

  // Mutation: Use Streak Freeze
  const useStreakFreezeMutation = useMutation({
    mutationFn: async ({ protectedDate }: { protectedDate?: string }): Promise<boolean> => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc("use_streak_freeze", {
        p_user_id: userId,
        p_protected_date: protectedDate || getLocalDateString(),
      });

      if (error) throw error;

      return Boolean(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });

      window.dispatchEvent(
        new CustomEvent("gamification:freeze-used", { detail: { userId } })
      );
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

  // Helper: Award XP for habit completion (ATUALIZADO: também dá gems)
  const awardHabitXP = async (habitId: string) => {
    // 1. Dar XP (existente)
    const xpResult = await addXPMutation.mutateAsync({
      amount: XP_VALUES.HABIT_COMPLETE,
      reason: "habit_complete",
      habitId,
    });

    // 2. NOVO: Dar gems (economia liberal: 10 gems por hábito)
    try {
      await addGemsMutation.mutateAsync({
        amount: GEM_VALUES.HABIT_COMPLETE,
        transactionType: "habit_complete",
        relatedEntityType: "habit",
        relatedEntityId: habitId,
      });
    } catch (error) {
      console.error("Failed to award gems for habit:", error);
    }

    return xpResult;
  };

  // Helper: Send streak milestone notification
  const sendStreakNotification = async (streakDays: number) => {
    const streakMilestones = [3, 7, 14, 30];
    if (!streakMilestones.includes(streakDays) || !userId) {
      return;
    }

    try {
      await supabase.functions.invoke("send-streak-notification", {
        body: { userId, milestone: streakDays },
      });
    } catch (error) {
      console.error(`Failed to send streak notification for ${streakDays} days:`, error);
    }
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
      const xpResult = await addXPMutation.mutateAsync({
        amount,
        reason,
        metadata: { streak_days: streakDays },
      });

      // Send streak milestone notification
      await sendStreakNotification(streakDays);

      return xpResult;
    }
  };

  // Helper: Award perfect day bonus
  const awardPerfectDayBonus = async () => {
    return addXPMutation.mutateAsync({
      amount: XP_VALUES.PERFECT_DAY,
      reason: "perfect_day",
    });
  };

  // ============================================================================
  // NEW HELPERS: Avatars, Achievements, Streak Freezes
  // ============================================================================

  // Helper: Get equipped avatar
  const equippedAvatar = userAvatars?.find((ua) => ua.is_equipped)?.avatar || null;

  // Helper: Check if avatar is unlocked
  const isAvatarUnlocked = (avatarId: string): boolean => {
    return (userAvatars || []).some((ua) => ua.avatar_id === avatarId);
  };

  // Helper: Check if can purchase avatar
  const canPurchaseAvatar = (avatarId: string): boolean => {
    const avatar = avatarsCatalog?.find((a) => a.id === avatarId);
    if (!avatar || !avatar.gem_cost) return false;
    if (isAvatarUnlocked(avatarId)) return false;
    return (gems?.current_gems || 0) >= avatar.gem_cost;
  };

  // Helper: Check if avatar can be unlocked by level
  const canUnlockAvatarByLevel = (avatarId: string): boolean => {
    const avatar = avatarsCatalog?.find((a) => a.id === avatarId);
    if (!avatar || !avatar.unlock_level || !progress) return false;
    if (isAvatarUnlocked(avatarId)) return false;
    return progress.current_level >= avatar.unlock_level;
  };

  // Helper: Check if achievement is unlocked
  const isAchievementUnlocked = (achievementId: string): boolean => {
    return (userAchievements || []).some((ua) => ua.achievement_id === achievementId);
  };

  // Helper: Get achievement progress
  const getAchievementProgress = (achievementId: string): { current: number; target: number; percentage: number } => {
    const achievement = achievementsCatalog?.find((a) => a.id === achievementId);
    if (!achievement || !progress) return { current: 0, target: 0, percentage: 0 };

    let current = 0;
    switch (achievement.condition_type) {
      case "habit_count":
        current = progress.total_habits_completed;
        break;
      case "streak_days":
        current = progress.current_streak;
        break;
      case "perfect_days":
        current = progress.perfect_days;
        break;
      case "level_reached":
        current = progress.current_level;
        break;
      default:
        current = 0;
    }

    return {
      current,
      target: achievement.condition_value,
      percentage: Math.min((current / achievement.condition_value) * 100, 100),
    };
  };

  // Helper: Check if has available freezes
  const hasAvailableFreezes = (): boolean => {
    return (streakFreezes?.available_freezes || 0) > 0;
  };

  // Helper: Check if can purchase freeze
  const canPurchaseFreeze = (): boolean => {
    return (gems?.current_gems || 0) >= GEM_VALUES.STREAK_FREEZE_COST;
  };

  // Helper: Award gems for streak milestone
  const awardStreakGemsBonus = async (streakDays: number) => {
    let amount = 0;

    if (streakDays === 3) {
      amount = GEM_VALUES.STREAK_3_BONUS;
    } else if (streakDays === 7) {
      amount = GEM_VALUES.STREAK_7_BONUS;
    } else if (streakDays === 30) {
      amount = GEM_VALUES.STREAK_30_BONUS;
    }

    if (amount > 0) {
      return addGemsMutation.mutateAsync({
        amount,
        transactionType: `streak_bonus_${streakDays}`,
        metadata: { streak_days: streakDays },
      });
    }
  };

  // Helper: Award gems for perfect day
  const awardPerfectDayGemsBonus = async () => {
    return addGemsMutation.mutateAsync({
      amount: GEM_VALUES.PERFECT_DAY,
      transactionType: "perfect_day",
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

  // ============================================================================
  // REALTIME LISTENER: Streak Freeze Events
  // ============================================================================
  // Listen for automatic freeze usage and dispatch UI events
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`freeze-events-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "streak_freeze_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const event = payload.new as any;

          // Se freeze foi usado automaticamente para proteger streak
          if (event.source === "auto_protection") {
            const streakSaved = event.metadata?.streak_saved || 0;

            // Dispatch evento customizado para UI (toast, efeito visual, etc)
            window.dispatchEvent(
              new CustomEvent("gamification:freeze-used", {
                detail: {
                  userId,
                  streakSaved,
                  autoConsumed: true,
                },
              })
            );

            // Invalidar queries para atualizar contadores
            queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });
            queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });
          }

          // Se freeze foi ganho (comprado ou mensal)
          if (event.event_type === "earned") {
            queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });
          }
        }
      )
      .subscribe();

    // Cleanup: Remover subscription ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Return hook interface
  return {
    // ========== EXISTING DATA ==========
    progress: progress || null,
    unlocks: unlocks || [],
    currentLevelConfig,
    currentLevelProgress,
    xpToNextLevel,

    // ========== NEW: GEMS DATA ==========
    gems: gems || null,
    gemsBalance: gems?.current_gems || 0,
    lifetimeGemsEarned: gems?.lifetime_gems_earned || 0,
    lifetimeGemsSpent: gems?.lifetime_gems_spent || 0,
    gemTransactions: gemTransactions || [],

    // ========== NEW: AVATARS DATA ==========
    avatarsCatalog: avatarsCatalog || [],
    userAvatars: userAvatars || [],
    equippedAvatar,

    // ========== NEW: ACHIEVEMENTS DATA ==========
    achievementsCatalog: achievementsCatalog || [],
    userAchievements: userAchievements || [],

    // ========== NEW: STREAK FREEZES DATA ==========
    streakFreezes: streakFreezes || null,
    availableFreezes: streakFreezes?.available_freezes || 0,
    totalFreezesEarned: streakFreezes?.total_freezes_earned || 0,
    totalFreezesUsed: streakFreezes?.total_freezes_used || 0,
    weeklyFreezePurchases: weeklyFreezePurchases || null,

    // ========== LOADING STATES ==========
    loading: progressLoading || unlocksLoading || gemsLoading || userAvatarsLoading || userAchievementsLoading || streakFreezesLoading,
    progressLoading,
    unlocksLoading,
    gemsLoading,
    userAvatarsLoading,
    userAchievementsLoading,
    streakFreezesLoading,

    // ========== ERRORS ==========
    error: progressError || unlocksError,

    // ========== EXISTING MUTATIONS ==========
    addXP: addXPMutation.mutateAsync,
    updateStreak: updateStreakMutation.mutateAsync,
    unlockItem: unlockItemMutation.mutateAsync,

    // ========== NEW: GEMS MUTATIONS ==========
    addGems: addGemsMutation.mutateAsync,
    isAddingGems: addGemsMutation.isPending,

    // ========== NEW: AVATARS MUTATIONS ==========
    purchaseAvatar: purchaseAvatarMutation.mutateAsync,
    isPurchasingAvatar: purchaseAvatarMutation.isPending,
    equipAvatar: equipAvatarMutation.mutateAsync,
    isEquippingAvatar: equipAvatarMutation.isPending,

    // ========== NEW: ACHIEVEMENTS MUTATIONS ==========
    unlockAchievement: unlockAchievementMutation.mutateAsync,
    isUnlockingAchievement: unlockAchievementMutation.isPending,

    // ========== NEW: STREAK FREEZES MUTATIONS ==========
    purchaseStreakFreeze: purchaseStreakFreezeMutation.mutateAsync,
    isPurchasingFreeze: purchaseStreakFreezeMutation.isPending,
    useStreakFreeze: useStreakFreezeMutation.mutateAsync,
    isUsingFreeze: useStreakFreezeMutation.isPending,

    // ========== MUTATION STATES ==========
    isAddingXP: addXPMutation.isPending,
    isUpdatingStreak: updateStreakMutation.isPending,
    isUnlockingItem: unlockItemMutation.isPending,

    // ========== EXISTING HELPERS ==========
    isUnlocked,
    getUnlocksByType,
    awardHabitXP,
    awardStreakBonus,
    awardPerfectDayBonus,

    // ========== NEW: AVATAR HELPERS ==========
    isAvatarUnlocked,
    canPurchaseAvatar,
    canUnlockAvatarByLevel,

    // ========== NEW: ACHIEVEMENT HELPERS ==========
    isAchievementUnlocked,
    getAchievementProgress,

    // ========== NEW: STREAK FREEZE HELPERS ==========
    hasAvailableFreezes,
    canPurchaseFreeze,

    // ========== NEW: GEM HELPERS ==========
    awardStreakGemsBonus,
    awardPerfectDayGemsBonus,

    // ========== REFETCH FUNCTIONS ==========
    refetchGems,
    refetchUserAvatars,
    refetchUserAchievements,
    refetchStreakFreezes,

    // ========== REFRESH ALL ==========
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-unlocks", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-gems", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-avatars", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements", userId] });
      queryClient.invalidateQueries({ queryKey: ["streak-freezes", userId] });
      queryClient.invalidateQueries({ queryKey: ["gem-transactions", userId] });
    },
  };
};

export default useGamification;
