/**
 * JourneyDayCompleteModal — Celebration popup when all habits for the day are completed
 * Follows pattern from LevelUpModal.tsx
 *
 * Milestone System:
 * - Days 7, 14, 21: escalated celebration — more particles, sound, haptic, no auto-dismiss
 * - All days: sound (dayComplete) + haptic (medium) on open
 * - Milestone badges use exclusive geometric design — no generic icons
 * - Architecture ready for commissioned artwork via milestone.artUrl
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
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";

// ============================================
// Milestone Configuration
// Days 7, 14, 21 — escalated celebration
// artUrl: slot for future commissioned artwork
// ============================================

interface MilestoneConfig {
  badge: string;
  subtitle: string;
  message: string;
  particleCount: number;
  soundFn: () => void;
  hapticFn: () => void;
  artUrl?: string; // future: custom illustration from Supabase Storage
}

const MILESTONES: Record<number, MilestoneConfig> = {
  7: {
    badge: "1 SEMANA",
    subtitle: "Primeira Semana Completa",
    message: "Você já está à frente de 80% das pessoas que começaram.",
    particleCount: 10,
    soundFn: () => sounds.streak(),
    hapticFn: () => haptic.success(),
  },
  14: {
    badge: "2 SEMANAS",
    subtitle: "Zona de Perigo Superada",
    message: "A maioria desiste entre os dias 10 e 14. Você não desistiu.",
    particleCount: 14,
    soundFn: () => sounds.streak(),
    hapticFn: () => haptic.heavy(),
  },
  21: {
    badge: "3 SEMANAS",
    subtitle: "Hábito Formado",
    message: "21 dias. Você já está longe demais para voltar.",
    particleCount: 20,
    soundFn: () => sounds.levelUp(),
    hapticFn: () => {
      haptic.heavy();
      setTimeout(() => haptic.double(), 200);
    },
  },
};

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

  // Milestone derived state
  const milestone = MILESTONES[dayNumber];
  const isMilestone = !!milestone;
  const particleCount = milestone?.particleCount ?? (phaseCompleted ? 10 : 6);

  // Milestone titles
  const milestoneTitle: Record<number, string> = {
    7: "1 Semana Concluída",
    14: "2 Semanas Concluídas",
    21: "21 Dias. Hábito Formado.",
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Auto-dismiss after 6 seconds — skipped for milestones, phase, and journey complete
  useEffect(() => {
    if (isOpen && !journeyCompleted && !phaseCompleted && !isMilestone) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, journeyCompleted, phaseCompleted, isMilestone, onClose]);

  // Sound + haptic on open
  useEffect(() => {
    if (!isOpen) return;
    if (journeyCompleted) return; // GraduationModal handles its own
    if (isMilestone) {
      milestone.soundFn();
      milestone.hapticFn();
    } else if (phaseCompleted) {
      sounds.levelUp();
      haptic.success();
    } else {
      sounds.dayComplete();
      haptic.medium();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-sm border-2 overflow-hidden text-white",
          "bg-gradient-to-br from-zinc-900/95 to-zinc-950/95"
        )}
        style={{
          borderColor: `${theme.color}4D`,
          boxShadow: `0 0 30px ${theme.color}33`,
        }}
      >
        {/* Floating particles — count escalates with milestone */}
        {isOpen && Array.from({ length: particleCount }).map((_, i) => (
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
              left: `${10 + (i * 80) / particleCount}%`,
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
                {/* Animated day number — milestone adds outer ping ring */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2 relative"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color}4D, ${theme.color}1A)`,
                    borderColor: `${theme.color}66`,
                    boxShadow: `0 0 20px ${theme.color}4D`,
                  }}
                >
                  {/* Pulse ring for milestone days */}
                  {isMilestone && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ backgroundColor: theme.color }}
                    />
                  )}
                  {phaseCompleted ? (
                    <Award className="w-10 h-10 relative z-10" style={{ color: theme.color }} />
                  ) : (
                    <span className="text-2xl font-bold relative z-10" style={{ color: theme.color }}>
                      {dayNumber}
                    </span>
                  )}
                </motion.div>

                {/* Title */}
                <DialogTitle className="text-xl font-bold text-white">
                  {journeyCompleted
                    ? "Jornada Completa!"
                    : phaseCompleted
                      ? "Fase Completa!"
                      : isMilestone
                        ? milestoneTitle[dayNumber]
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

                {/* Milestone badge — geometric design, no generic icons */}
                {isMilestone && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    {/* Geometric badge — slot for future commissioned artwork */}
                    <div
                      className="relative px-5 py-3 w-full"
                      style={{
                        border: `1px solid ${theme.color}50`,
                        borderRadius: "12px",
                        background: `linear-gradient(135deg, ${theme.color}15, ${theme.color}08)`,
                        boxShadow: `0 0 30px ${theme.color}20, inset 0 1px 0 ${theme.color}20`,
                      }}
                    >
                      {/* Corner accents */}
                      <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l"
                        style={{ borderColor: theme.color }} />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r"
                        style={{ borderColor: theme.color }} />
                      <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l"
                        style={{ borderColor: theme.color }} />
                      <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r"
                        style={{ borderColor: theme.color }} />

                      <p
                        className="text-[10px] tracking-[0.25em] uppercase text-center font-bold"
                        style={{ color: theme.color }}
                      >
                        {milestone.badge}
                      </p>
                      <p className="text-xs text-white/50 text-center mt-0.5">
                        {milestone.subtitle}
                      </p>
                    </div>

                    {/* Motivational message */}
                    <p className="text-xs text-white/40 text-center leading-relaxed max-w-[240px]">
                      {milestone.message}
                    </p>
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

              {/* Close button — shown for phase complete, journey complete, and milestones */}
              {(phaseCompleted || journeyCompleted || isMilestone) && (
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
                    {journeyCompleted
                      ? "Ver Graduação"
                      : isMilestone
                        ? "Continuar Jornada"
                        : "Continuar"}
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
