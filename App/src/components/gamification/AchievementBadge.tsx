import { motion } from "motion/react";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Achievement, type UserAchievement, type AchievementTier } from "@/hooks/useGamification";
import { getAchievementIcon } from "./AchievementIcons";

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  currentProgress?: number;
  onClick?: () => void;
}

const TIER_COLORS: Record<AchievementTier, { gradient: string; glow: string; text: string }> = {
  common: {
    gradient: "from-gray-400 to-gray-500",
    glow: "shadow-gray-500/30",
    text: "text-gray-400",
  },
  uncommon: {
    gradient: "from-green-400 to-green-500",
    glow: "shadow-green-500/30",
    text: "text-green-400",
  },
  rare: {
    gradient: "from-blue-400 to-blue-500",
    glow: "shadow-blue-500/30",
    text: "text-blue-400",
  },
  epic: {
    gradient: "from-purple-400 to-purple-500",
    glow: "shadow-purple-500/30",
    text: "text-purple-400",
  },
  legendary: {
    gradient: "from-yellow-400 to-amber-500",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-400",
  },
};

export const AchievementBadge = ({
  achievement,
  userAchievement,
  size = "md",
  showProgress = false,
  currentProgress = 0,
  onClick,
}: AchievementBadgeProps) => {
  const unlocked = !!userAchievement;
  const isSecret = achievement.is_secret && !unlocked;
  const tierColors = TIER_COLORS[achievement.tier];

  const sizeClasses = {
    sm: "w-16 h-20 text-2xl",
    md: "w-20 h-24 text-3xl",
    lg: "w-24 h-28 text-4xl",
  };

  const progressPercentage = Math.min((currentProgress / achievement.condition_value) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl p-3 cursor-pointer overflow-hidden isolate",
        "transition-all border",
        unlocked
          ? `bg-gradient-to-br ${tierColors.gradient}/10 border-${achievement.tier === 'legendary' ? 'yellow' : achievement.tier === 'epic' ? 'purple' : achievement.tier === 'rare' ? 'blue' : 'gray'}-500/30`
          : "bg-muted/30 border-muted/50 grayscale-[50%] opacity-70",
        sizeClasses[size]
      )}
    >
      {/* Glow effect for unlocked */}
      {unlocked && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-30",
            `bg-gradient-to-br ${tierColors.gradient}`
          )}
        />
      )}

      {/* Tier Badge */}
      <div
        className={cn(
          "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
          `bg-gradient-to-r ${tierColors.gradient} text-white`
        )}
      >
        {achievement.tier[0]}
      </div>

      {/* Achievement Icon */}
      <div className="relative z-10 mb-1">
        {isSecret ? (
          <span className="text-3xl">❓</span>
        ) : (
          <div className={cn(!unlocked && "grayscale-[50%] opacity-70")}>
            {(() => {
              const IconComponent = getAchievementIcon(achievement.id as any);
              if (!IconComponent) return null;
              return <IconComponent width={32} height={32} />;
            })()}
          </div>
        )}
      </div>

      {/* Name */}
      {!isSecret && (
        <p className="text-[10px] font-medium text-center line-clamp-2 relative z-10 leading-tight">
          {achievement.name}
        </p>
      )}

      {/* Lock Indicator */}
      {!unlocked && !isSecret && (
        <Lock className="absolute top-1.5 left-1.5 w-3 h-3 text-muted-foreground" />
      )}

      {/* Gem Reward Badge */}
      {unlocked && achievement.gem_reward > 0 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-600 text-[8px] font-bold text-white">
          <Sparkles className="w-2 h-2" />
          {achievement.gem_reward}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && !unlocked && currentProgress > 0 && (
        <div className="absolute bottom-1 left-2 right-2 h-1 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn("h-full rounded-full", `bg-gradient-to-r ${tierColors.gradient}`)}
          />
        </div>
      )}
    </motion.div>
  );
};

export default AchievementBadge;
