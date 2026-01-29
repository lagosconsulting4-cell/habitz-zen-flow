import { motion } from "motion/react";
import { Trophy, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, getLevelConfig } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";
import { FrozenIconEffect } from "@/components/gamification/FrozenIconEffect";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface XPBarProps {
  className?: string;
}

export const XPBar = ({ className }: XPBarProps) => {
  const { user } = useAuth();
  const [freezeUsedToday, setFreezeUsedToday] = useState(false);
  const {
    progress,
    currentLevelConfig,
    currentLevelProgress,
    xpToNextLevel,
    loading,
  } = useGamification(user?.id);

  // Verificar se freeze foi usado hoje
  useEffect(() => {
    if (!user?.id) return;

    const checkFreezeUsage = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("streak_freeze_events")
          .select("created_at")
          .eq("user_id", user.id)
          .eq("event_type", "used")
          .eq("source", "auto_protection")
          .gte("created_at", `${today}T00:00:00`)
          .single();

        setFreezeUsedToday(!!data && !error);
      } catch (error) {
        console.error("Error checking freeze usage:", error);
      }
    };

    checkFreezeUsage();

    // Escutar atualizações em tempo real
    const channel = supabase
      .channel(`freeze-usage-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "streak_freeze_events",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const event = payload.new as any;
          if (event.source === "auto_protection") {
            setFreezeUsedToday(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Don't show if loading or no progress
  if (loading || !progress) {
    return null;
  }

  // Get tier color
  const tierColors = {
    bronze: {
      bg: "from-amber-950/40 to-amber-900/30",
      border: "border-amber-700/30",
      text: "text-amber-400",
      glow: "shadow-amber-500/20",
      bar: "from-amber-600 to-amber-500",
    },
    prata: {
      bg: "from-slate-900/40 to-slate-800/30",
      border: "border-slate-600/30",
      text: "text-slate-300",
      glow: "shadow-slate-400/20",
      bar: "from-slate-500 to-slate-400",
    },
    ouro: {
      bg: "from-yellow-950/40 to-yellow-900/30",
      border: "border-yellow-600/30",
      text: "text-yellow-400",
      glow: "shadow-yellow-500/20",
      bar: "from-yellow-500 to-yellow-400",
    },
    diamante: {
      bg: "from-cyan-950/40 to-cyan-900/30",
      border: "border-cyan-500/30",
      text: "text-cyan-300",
      glow: "shadow-cyan-400/20",
      bar: "from-cyan-500 via-blue-400 to-cyan-400",
    },
  };

  const tierColor = tierColors[currentLevelConfig.tier];

  // Get next level config
  const nextLevelConfig = getLevelConfig(currentLevelConfig.level + 1);
  const isMaxLevel = currentLevelConfig.level === 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full rounded-2xl overflow-hidden",
        `bg-gradient-to-br ${tierColor.bg}`,
        `border ${tierColor.border}`,
        "backdrop-blur-sm",
        className
      )}
    >
      <div className="p-4">
        {/* Header - Level and XP */}
        <div className="flex items-center justify-between mb-3">
          {/* Level Badge */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg",
              `bg-gradient-to-br ${tierColor.bar}`,
              `shadow-lg ${tierColor.glow}`
            )}>
              <Trophy className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-wider", tierColor.text)}>
                {currentLevelConfig.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isMaxLevel ? "Nível Máximo" : `Rumo a ${nextLevelConfig.name}`}
              </p>
            </div>
          </div>

          {/* XP Counter */}
          <div className="flex items-center gap-1.5">
            <Zap className={cn("w-4 h-4", tierColor.text)} strokeWidth={2.5} />
            <div className="text-right">
              <p className={cn("text-sm font-bold", tierColor.text)}>
                {progress.total_xp.toLocaleString()} XP
              </p>
              {!isMaxLevel && (
                <p className="text-[10px] text-muted-foreground">
                  {xpToNextLevel} para próximo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isMaxLevel && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                Nível {currentLevelConfig.level}
              </span>
              <span className={tierColor.text}>
                {currentLevelProgress}%
              </span>
            </div>
            <div className="relative h-2 bg-black/20 dark:bg-black/40 rounded-full overflow-hidden">
              {/* Background shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

              {/* Progress fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelProgress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  `bg-gradient-to-r ${tierColor.bar}`,
                  `shadow-[0_0_12px_rgba(0,0,0,0.3)] ${tierColor.glow}`
                )}
              >
                {/* Inner glow */}
                <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent rounded-full" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Max Level Badge */}
        {isMaxLevel && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={cn(
              "mt-2 py-2 px-3 rounded-lg text-center",
              "bg-gradient-to-r from-white/10 to-white/5",
              "border border-white/10"
            )}
          >
            <p className={cn("text-xs font-bold", tierColor.text)}>
              ✨ Nível Máximo Alcançado ✨
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Continue conquistando hábitos!
            </p>
          </motion.div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-1">
              <FrozenIconEffect isFrozen={freezeUsedToday} size="sm">
                <Flame className="w-5 h-5 text-orange-500" />
              </FrozenIconEffect>
            </div>
            <p className="text-xs font-bold text-foreground">
              {progress.current_streak}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {freezeUsedToday ? "Protegido" : "Sequência"}
            </p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-foreground">
              {progress.perfect_days}
            </p>
            <p className="text-[10px] text-muted-foreground">Dias Perfeitos</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-foreground">
              {progress.total_habits_completed}
            </p>
            <p className="text-[10px] text-muted-foreground">Completos</p>
          </div>
        </div>
      </div>

      {/* Shimmer animation CSS */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default XPBar;
