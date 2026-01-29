import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, type Achievement } from "@/hooks/useGamification";
import { useAuth } from "@/integrations/supabase/auth";
import { getAchievementIcon } from "./AchievementIcons";

interface AchievementNotification {
  id: number;
  achievementId: string;
  gemsEarned: number;
}

interface AchievementToastProps {
  userId?: string;
}

export const AchievementToast = ({ userId: propUserId }: AchievementToastProps) => {
  const { user } = useAuth();
  const userId = propUserId || user?.id;
  const { achievementsCatalog } = useGamification(userId);

  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { achievementId, gemsEarned } = e.detail;
      const id = Date.now();

      setNotifications((prev) => [...prev, { id, achievementId, gemsEarned }]);

      // Auto-remove after animation (longer for achievements)
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    };

    window.addEventListener("gamification:achievement-unlocked" as any, handler);
    return () => window.removeEventListener("gamification:achievement-unlocked" as any, handler);
  }, []);

  const getAchievement = (id: string): Achievement | undefined => {
    return achievementsCatalog.find((a) => a.id === id);
  };

  const handleShare = (achievement: Achievement) => {
    const text = `Desbloqueei a conquista "${achievement.name}" no Habitz!\n${achievement.description}`;

    if (navigator.share) {
      navigator.share({
        title: "Nova Conquista no Habitz!",
        text,
        url: "https://habitz.app",
      });
    } else {
      navigator.clipboard.writeText(text + "\n\nhttps://habitz.app");
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const achievement = getAchievement(notification.achievementId);
          if (!achievement) return null;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "relative rounded-2xl shadow-2xl mb-3 overflow-hidden",
                "bg-gradient-to-br from-yellow-500/90 via-amber-500/90 to-orange-500/90",
                "backdrop-blur-md border border-yellow-400/30"
              )}
            >
              {/* Confetti Effect Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="absolute bottom-4 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              </div>

              <div className="relative p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-yellow-900">
                    <Trophy className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Nova Conquista!</span>
                  </div>
                  <button
                    onClick={() => handleShare(achievement)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors pointer-events-auto"
                  >
                    <Share2 className="w-4 h-4 text-yellow-900" />
                  </button>
                </div>

                {/* Achievement Info */}
                <div className="flex items-center gap-3">
                  <div>
                    {(() => {
                      const IconComponent = getAchievementIcon(achievement.id as any);
                      if (!IconComponent) return null;
                      return <IconComponent width={48} height={48} className="text-yellow-900" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-yellow-900 text-lg leading-tight">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-yellow-800/80 line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                {/* Gems Earned */}
                {notification.gemsEarned > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-3 py-2 rounded-lg bg-white/20">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                    <span className="text-sm font-bold text-purple-800">
                      +{notification.gemsEarned} gems
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-1 bg-yellow-900/30 origin-left"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToast;
