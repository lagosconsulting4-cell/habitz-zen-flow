/**
 * XP Toast - Sprint 3.2
 *
 * Floating "+X XP" toast that appears when user gains XP.
 * Floats upward with fade animation (Duolingo-style).
 * Can be positioned relative to a specific element.
 */

import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export type XPToastType = "habit" | "streak" | "perfect_day";

export interface XPToastProps {
  xpAmount: number;
  show: boolean;
  onClose: () => void;
  /** Optional element ID to position the toast relative to */
  targetElementId?: string;
  /** Type of XP gain - affects color and icon */
  type?: XPToastType;
}

export const XPToast = ({
  xpAmount,
  show,
  onClose,
  targetElementId,
  type = "habit",
}: XPToastProps) => {
  const [visible, setVisible] = useState(show);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // If targetElementId is provided, position toast relative to it
      if (targetElementId) {
        const element = document.getElementById(targetElementId);
        if (element) {
          const rect = element.getBoundingClientRect();
          setPosition({
            top: rect.top + rect.height / 2,
            left: rect.left + rect.width / 2,
          });
        }
      }

      // Auto-dismiss after 1.2s (shorter, more elegant)
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, targetElementId]);

  // Color based on type - all lime/green palette (no purple)
  const getColorClasses = (xp: number, xpType: XPToastType) => {
    // Perfect day: golden accent
    if (xpType === "perfect_day") return "from-yellow-400 to-amber-500";

    // Streak bonus: brighter lime
    if (xpType === "streak") return "from-lime-300 to-lime-500";

    // Big bonus (streak_30): golden
    if (xp >= 50) return "from-yellow-400 to-amber-500";

    // All other XP: consistent lime green
    return "from-lime-400 to-lime-500";
  };

  const colorClasses = getColorClasses(xpAmount, type);

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={
            position
              ? {
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  transform: "translate(-50%, -50%)",
                }
              : {
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              y: { duration: 0.8, ease: "easeOut" },
            }}
          >
            <div
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                bg-gradient-to-r ${colorClasses}
                text-white font-bold text-sm
                shadow-lg shadow-black/30
              `}
            >
              <Sparkles className="w-4 h-4" />
              <span>+{xpAmount} XP</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
