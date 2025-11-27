/**
 * Minimalist Streak Toast - Sprint 3.1.4
 *
 * Simple, premium toast notification for streak milestones (3, 7, 30 days).
 * Appears at the bottom center, auto-dismisses after 3 seconds.
 * Uses Framer Motion for smooth animations.
 */

import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

export interface StreakToastProps {
  streakDays: number;
  show: boolean;
  onClose: () => void;
}

// Milestone messages
const MILESTONE_MESSAGES: Record<number, string> = {
  3: "Três dias seguidos! 🔥",
  7: "Uma semana completa! 🎯",
  30: "30 dias de consistência! 💎",
};

// Milestone colors
const MILESTONE_COLORS: Record<number, string> = {
  3: "from-orange-500 to-red-500",
  7: "from-purple-500 to-pink-500",
  30: "from-yellow-500 to-amber-500",
};

export const StreakToast = ({ streakDays, show, onClose }: StreakToastProps) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const message = MILESTONE_MESSAGES[streakDays] || `${streakDays} dias seguidos!`;
  const colorClasses = MILESTONE_COLORS[streakDays] || "from-primary to-primary/80";

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <div
              className={`
                flex items-center gap-3 px-6 py-4 rounded-2xl
                bg-gradient-to-r ${colorClasses}
                text-white font-bold text-base
                shadow-lg shadow-black/20
                backdrop-blur-sm
              `}
            >
              <Flame className="w-6 h-6 animate-pulse" />
              <span>{message}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
