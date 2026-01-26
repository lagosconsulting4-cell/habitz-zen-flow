import { motion } from "motion/react";
import { Shield, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, GEM_VALUES } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";

interface StreakFreezeCardProps {
  userId?: string;
  compact?: boolean;
  className?: string;
}

export const StreakFreezeCard = ({ userId: propUserId, compact = false, className }: StreakFreezeCardProps) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;

  const {
    availableFreezes,
    gemsBalance,
    progress,
    purchaseStreakFreeze,
    isPurchasingFreeze,
    useStreakFreeze,
    isUsingFreeze,
    canPurchaseFreeze,
  } = useGamification(userId);

  const FREEZE_COST = GEM_VALUES.STREAK_FREEZE_COST;
  const canBuy = canPurchaseFreeze();
  const hasFreeze = availableFreezes > 0;
  const currentStreak = progress?.current_streak || 0;

  const handlePurchase = async () => {
    try {
      await purchaseStreakFreeze();
    } catch (error: any) {
      console.error("Failed to purchase streak freeze:", error);
    }
  };

  const handleUseFreeze = async () => {
    try {
      await useStreakFreeze({ protectedDate: new Date().toISOString().split("T")[0] });
    } catch (error: any) {
      console.error("Failed to use streak freeze:", error);
    }
  };

  // Compact mode - just shows count
  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-blue-500/10 border border-blue-500/20",
          className
        )}
      >
        <Shield className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-400">{availableFreezes}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
        "border border-blue-500/20",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-3 rounded-xl bg-blue-500/20 shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base">Streak Freeze</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proteja sua sequência por 1 dia
                </p>
              </div>

              {/* Available Count */}
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-blue-400">{availableFreezes}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  disponíveis
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={!canBuy || isPurchasingFreeze}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  canBuy
                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                <Sparkles className="w-3.5 h-3.5" />
                <span>{FREEZE_COST}</span>
              </button>

              {/* Use Freeze Button (only show if streak > 0 and has freeze) */}
              {currentStreak > 0 && hasFreeze && (
                <button
                  onClick={handleUseFreeze}
                  disabled={isUsingFreeze}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Proteger Hoje</span>
                </button>
              )}
            </div>

            {/* Hint */}
            {!hasFreeze && currentStreak >= 7 && (
              <p className="text-xs text-yellow-500 mt-2">
                Sua sequência de {currentStreak} dias está desprotegida!
              </p>
            )}

            {/* Info */}
            <p className="text-[10px] text-muted-foreground mt-2">
              1 freeze grátis por mês. Use para proteger streaks importantes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakFreezeCard;
