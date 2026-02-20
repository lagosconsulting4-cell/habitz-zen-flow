/**
 * JourneyDayCompleteModal — Celebration popup when all habits for the day are completed
 * Follows pattern from LevelUpModal.tsx
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ArrowRight, Award } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getJourneyTheme } from "@/components/JourneyIllustration";

export interface JourneyDayCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  totalDays: number;
  journeyTitle: string;
  phaseCompleted?: boolean;
  phaseBadgeName?: string;
  journeyCompleted?: boolean;
  newHabitPreview?: string | null;
  themeSlug?: string | null;
}

export const JourneyDayCompleteModal = ({
  isOpen,
  onClose,
  dayNumber,
  totalDays,
  journeyTitle,
  phaseCompleted,
  phaseBadgeName,
  journeyCompleted,
  newHabitPreview,
  themeSlug,
}: JourneyDayCompleteModalProps) => {
  const [showContent, setShowContent] = useState(false);
  const percent = Math.round((dayNumber / totalDays) * 100);
  const theme = getJourneyTheme(themeSlug);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (isOpen && !journeyCompleted && !phaseCompleted) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, journeyCompleted, phaseCompleted, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-sm border-2 overflow-hidden",
          "bg-gradient-to-br from-zinc-900/95 to-zinc-950/95"
        )}
        style={{
          borderColor: `${theme.color}4D`,
          boxShadow: `0 0 30px ${theme.color}33`,
        }}
      >
        {/* Floating particles — pattern from LevelUpModal */}
        {isOpen && Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100, x: Math.random() * 60 - 30 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: -80,
              x: Math.random() * 60 - 30,
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: theme.color,
              left: `${10 + (i * 80) / 6}%`,
              bottom: 0,
            }}
          />
        ))}

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
                {/* Animated day number with glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color}4D, ${theme.color}1A)`,
                    borderColor: `${theme.color}66`,
                    boxShadow: `0 0 20px ${theme.color}4D`,
                  }}
                >
                  {phaseCompleted ? (
                    <Award className="w-10 h-10" style={{ color: theme.color }} />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: theme.color }}>{dayNumber}</span>
                  )}
                </motion.div>

                {/* Title */}
                <DialogTitle className="text-xl font-bold text-white">
                  {journeyCompleted
                    ? "Jornada Completa!"
                    : phaseCompleted
                      ? `Fase Completa!`
                      : `Dia ${dayNumber} Completo`}
                </DialogTitle>

                {/* Subtitle */}
                <DialogDescription className="text-sm text-white/60">
                  {journeyTitle}
                </DialogDescription>

                {/* Phase badge */}
                {phaseCompleted && phaseBadgeName && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                    style={{
                      backgroundColor: `${theme.color}1A`,
                      borderColor: `${theme.color}33`,
                    }}
                  >
                    <Award className="w-4 h-4" style={{ color: theme.color }} />
                    <span className="text-sm font-semibold" style={{ color: theme.color }}>
                      {phaseBadgeName}
                    </span>
                  </motion.div>
                )}

                {/* Progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full space-y-2"
                >
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Progresso</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: `${Math.max(0, percent - 4)}%` }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                  </div>
                </motion.div>

                {/* New habit preview */}
                {newHabitPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">
                        Amanhã
                      </p>
                      <p className="text-xs text-white/80">{newHabitPreview}</p>
                    </div>
                  </motion.div>
                )}
              </DialogHeader>

              {/* Close button (only for phase/journey complete) */}
              {(phaseCompleted || journeyCompleted) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6"
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {journeyCompleted ? "Ver Graduação" : "Continuar"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default JourneyDayCompleteModal;
