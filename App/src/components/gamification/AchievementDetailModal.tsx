import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { useGamification, type Achievement } from "@/hooks/useGamification";
import { ShareAchievement } from "./ShareAchievement";
import { getAchievementIcon } from "./AchievementIcons";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface AchievementDetailModalProps {
  achievementId: string;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TIER_COLORS = {
  common: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    badge: "bg-gray-500 text-white",
    label: "Comum",
  },
  uncommon: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    badge: "bg-green-500 text-white",
    label: "Incomum",
  },
  rare: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    badge: "bg-blue-500 text-white",
    label: "Raro",
  },
  epic: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    badge: "bg-purple-500 text-white",
    label: "Épico",
  },
  legendary: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500 text-white",
    label: "Lendário",
  },
};

const CATEGORY_LABELS = {
  habits: "Hábitos",
  streaks: "Sequências",
  levels: "Níveis",
  special: "Especiais",
};

function getAchievementTypeLabel(conditionType: string): string {
  const labels: Record<string, string> = {
    habit_count: "Hábitos Completados",
    streak_days: "Dias de Sequência",
    perfect_days: "Dias Perfeitos",
    level_reached: "Nível Alcançado",
  };
  return labels[conditionType] || conditionType;
}

export function AchievementDetailModal({
  achievementId,
  userId,
  isOpen,
  onClose,
}: AchievementDetailModalProps) {
  const {
    achievementsCatalog,
    userAchievements,
    progress,
    getAchievementProgress,
    gemsBalance,
  } = useGamification(userId);

  const achievement = useMemo(
    () => achievementsCatalog.find((a) => a.id === achievementId),
    [achievementsCatalog, achievementId]
  );

  const userAchievement = useMemo(
    () => userAchievements.find((ua) => ua.achievement_id === achievementId),
    [userAchievements, achievementId]
  );

  const progressData = useMemo(
    () => getAchievementProgress(achievementId),
    [achievementId, getAchievementProgress]
  );

  const unlocked = !!userAchievement;
  const isSecret = achievement?.is_secret && !unlocked;

  const tierColors = achievement ? TIER_COLORS[achievement.tier] : TIER_COLORS.common;

  if (!achievement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isSecret ? "Conquista Secreta" : achievement.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Badge */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={cn(
                "w-32 h-32 rounded-2xl flex items-center justify-center mb-4",
                "border-2",
                tierColors.bg,
                tierColors.border,
                !unlocked && "grayscale opacity-50"
              )}
            >
              {isSecret ? (
                <span className="text-6xl">❓</span>
              ) : (
                (() => {
                  const IconComponent = getAchievementIcon(achievement.id as any);
                  if (!IconComponent) return null;
                  return <IconComponent width={48} height={48} />;
                })()
              )}
            </div>

            {unlocked && (
              <Badge variant="default" className="mb-3 gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Desbloqueada
              </Badge>
            )}

            <Badge className={tierColors.badge}>
              {tierColors.label}
            </Badge>
          </div>

          {/* Description and Details */}
          {!isSecret && (
            <div className="space-y-3 text-center">
              <p className="text-muted-foreground">{achievement.description}</p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Card className="p-3 text-center bg-secondary/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    {CATEGORY_LABELS[achievement.category as keyof typeof CATEGORY_LABELS]}
                  </p>
                  <p className="text-sm font-bold">{achievement.category}</p>
                </Card>

                {achievement.gem_reward > 0 && (
                  <Card className="p-3 text-center bg-purple-500/10">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recompensa
                    </p>
                    <p className="text-sm font-bold text-purple-600">
                      +{achievement.gem_reward}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar (if not unlocked) */}
          {!unlocked && !isSecret && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Progresso</span>
                <span className="text-muted-foreground">
                  {progressData.current} / {progressData.target}
                </span>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {getAchievementTypeLabel(achievement.condition_type)}
              </p>
            </div>
          )}

          {/* Status for unlocked */}
          {unlocked && !isSecret && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-sm text-green-700 font-semibold">
                ✓ Conquistada em{" "}
                {new Date(userAchievement.unlocked_at).toLocaleDateString("pt-BR")}
              </p>
              {achievement.gem_reward > 0 && (
                <p className="text-xs text-green-600/80 mt-1">
                  +{achievement.gem_reward} gems recebidas
                </p>
              )}
            </div>
          )}

          {/* Secret message for locked secrets */}
          {isSecret && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm font-semibold text-amber-700">
                🔒 Conquista Secreta
              </p>
              <p className="text-xs text-amber-600/80">
                Continue jogando para descobrir como desbloquear esta conquista
              </p>
            </div>
          )}

          {/* Share Buttons */}
          {unlocked && !isSecret && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground text-center">
                Compartilhar Conquista
              </p>
              <ShareAchievement
                achievement={achievement}
                userStats={{
                  level: progress?.current_level || 0,
                  streak: progress?.current_streak || 0,
                  gems: gemsBalance,
                }}
                size="sm"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AchievementDetailModal;
