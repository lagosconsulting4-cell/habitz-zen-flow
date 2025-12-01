/**
 * LevelUpModal Component
 *
 * Premium modal shown when user levels up.
 * Uses shadcn Dialog with sophisticated animations.
 *
 * Features:
 * - Tier-based theming (Bronze, Prata, Ouro, Diamante)
 * - Animated level badge
 * - Unlock preview
 * - Celebration effects integration
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, Star, Lock, Unlock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLevelConfig, type LevelConfig } from "@/hooks/useGamification";
import { celebrations } from "@/lib/celebrations";

// ============================================
// TYPES
// ============================================

export interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromLevel: number;
  toLevel: number;
  totalXP: number;
  unlockedItems?: UnlockedItem[];
}

export interface UnlockedItem {
  type: "icon" | "widget" | "theme" | "meditation" | "template" | "journey";
  name: string;
  description: string;
  icon?: string;
}

// ============================================
// TIER COLORS
// ============================================

const TIER_THEMES = {
  bronze: {
    bg: "from-amber-950/90 to-amber-900/80",
    border: "border-amber-700/50",
    text: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]",
    badge: "from-amber-600 to-amber-500",
    particle: "bg-amber-400",
  },
  prata: {
    bg: "from-slate-900/90 to-slate-800/80",
    border: "border-slate-600/50",
    text: "text-slate-300",
    glow: "shadow-[0_0_30px_rgba(148,163,184,0.4)]",
    badge: "from-slate-500 to-slate-400",
    particle: "bg-slate-300",
  },
  ouro: {
    bg: "from-yellow-950/90 to-yellow-900/80",
    border: "border-yellow-600/50",
    text: "text-yellow-400",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.5)]",
    badge: "from-yellow-500 to-yellow-400",
    particle: "bg-yellow-300",
  },
  diamante: {
    bg: "from-cyan-950/90 to-cyan-900/80",
    border: "border-cyan-500/50",
    text: "text-cyan-300",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.5)]",
    badge: "from-cyan-500 via-blue-400 to-cyan-400",
    particle: "bg-cyan-300",
  },
};

// ============================================
// COMPONENT
// ============================================

export const LevelUpModal = ({
  isOpen,
  onClose,
  fromLevel,
  toLevel,
  totalXP,
  unlockedItems = [],
}: LevelUpModalProps) => {
  const [showContent, setShowContent] = useState(false);

  const levelConfig = getLevelConfig(toLevel);
  const theme = TIER_THEMES[levelConfig.tier];

  // Trigger celebration when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay before showing content for dramatic effect
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-md border-2 overflow-hidden",
          "bg-gradient-to-br",
          theme.bg,
          theme.border,
          theme.glow
        )}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, x: Math.random() * 100 - 50 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: -100,
                x: Math.random() * 100 - 50,
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className={cn("absolute w-2 h-2 rounded-full", theme.particle)}
              style={{
                left: `${(i * 100) / 8}%`,
                bottom: 0,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <DialogHeader className="items-center text-center space-y-4">
                {/* Trophy icon with glow */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className={cn(
                    "mx-auto w-20 h-20 rounded-full flex items-center justify-center",
                    `bg-gradient-to-br ${theme.badge}`,
                    theme.glow
                  )}
                >
                  <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>

                {/* Title */}
                <DialogTitle
                  className={cn(
                    "text-3xl font-bold uppercase tracking-wide",
                    theme.text
                  )}
                >
                  Subiu de Nível!
                </DialogTitle>

                {/* Level info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <DialogDescription className="text-base text-white/80">
                    Nível {fromLevel} → Nível {toLevel}
                  </DialogDescription>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles
                      className={cn("w-5 h-5", theme.text)}
                      strokeWidth={2}
                    />
                    <p className={cn("text-2xl font-bold", theme.text)}>
                      {levelConfig.name}
                    </p>
                    <Sparkles
                      className={cn("w-5 h-5", theme.text)}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-sm text-white/60">
                    {totalXP.toLocaleString()} XP Total
                  </p>
                </motion.div>
              </DialogHeader>

              {/* Unlocked items */}
              {unlockedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <Unlock className="w-4 h-4 text-white/80" />
                    <p className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                      Novos Desbloqueios
                    </p>
                  </div>
                  <div className="space-y-2">
                    {unlockedItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl",
                          "bg-white/5 border border-white/10",
                          "backdrop-blur-sm"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            "bg-white/10"
                          )}
                        >
                          {item.icon ? (
                            <span className="text-2xl">{item.icon}</span>
                          ) : (
                            <Star className="w-5 h-5 text-white/80" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-white/60">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <Button
                  onClick={onClose}
                  className={cn(
                    "w-full",
                    `bg-gradient-to-r ${theme.badge}`,
                    "text-white font-bold uppercase tracking-wide",
                    "hover:opacity-90 transition-opacity",
                    theme.glow
                  )}
                >
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LevelUpModal;
