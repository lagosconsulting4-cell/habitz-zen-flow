import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, Target, Flame, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, type AchievementCategory } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";
import { AchievementBadge } from "./AchievementBadge";
import { AchievementDetailModal } from "./AchievementDetailModal";

interface AchievementsGridProps {
  userId?: string;
  className?: string;
}

const CATEGORY_CONFIG: Record<AchievementCategory | "all", { label: string; icon: React.ReactNode; color: string }> = {
  all: {
    label: "Todas",
    icon: <Trophy className="w-4 h-4" />,
    color: "text-foreground",
  },
  habits: {
    label: "Hábitos",
    icon: <Target className="w-4 h-4" />,
    color: "text-green-400",
  },
  streaks: {
    label: "Sequências",
    icon: <Flame className="w-4 h-4" />,
    color: "text-orange-400",
  },
  levels: {
    label: "Níveis",
    icon: <Star className="w-4 h-4" />,
    color: "text-yellow-400",
  },
  special: {
    label: "Especiais",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-purple-400",
  },
};

export const AchievementsGrid = ({ userId: propUserId, className }: AchievementsGridProps) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);

  const {
    achievementsCatalog,
    userAchievements,
    getAchievementProgress,
  } = useGamification(userId);

  const categories: (AchievementCategory | "all")[] = ["all", "habits", "streaks", "levels", "special"];

  const filteredAchievements = achievementsCatalog.filter((ach) =>
    selectedCategory === "all" || ach.category === selectedCategory
  );

  const unlockedCount = userAchievements.length;
  const totalCount = achievementsCatalog.length;

  // Calculate total gems earned from achievements
  const totalGemsEarned = userAchievements.reduce((sum, ua) => {
    const achievement = achievementsCatalog.find((a) => a.id === ua.achievement_id);
    return sum + (achievement?.gem_reward || 0);
  }, 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          {totalGemsEarned > 0 && (
            <div className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{totalGemsEarned} gems</span>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {Math.round((unlockedCount / totalCount) * 100)}% completo
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const isSelected = selectedCategory === category;

          // Count achievements in category
          const count = category === "all"
            ? achievementsCatalog.length
            : achievementsCatalog.filter((a) => a.category === category).length;

          const unlockedInCategory = category === "all"
            ? unlockedCount
            : userAchievements.filter((ua) => {
                const ach = achievementsCatalog.find((a) => a.id === ua.achievement_id);
                return ach?.category === category;
              }).length;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              )}
            >
              <span className={isSelected ? "" : config.color}>{config.icon}</span>
              <span>{config.label}</span>
              <span className="text-[10px] opacity-70">
                {unlockedInCategory}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <motion.div
        layout
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5 isolate"
      >
        {filteredAchievements.map((achievement) => {
          const userAch = userAchievements.find((ua) => ua.achievement_id === achievement.id);
          const progress = getAchievementProgress(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <AchievementBadge
                achievement={achievement}
                userAchievement={userAch}
                showProgress={true}
                currentProgress={progress.current}
                onClick={() => setSelectedAchievementId(achievement.id)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Nenhuma conquista nesta categoria.</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievementId && (
        <AchievementDetailModal
          achievementId={selectedAchievementId}
          userId={userId}
          isOpen={!!selectedAchievementId}
          onClose={() => setSelectedAchievementId(null)}
        />
      )}
    </div>
  );
};

export default AchievementsGrid;
