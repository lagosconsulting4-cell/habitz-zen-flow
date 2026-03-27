/**
 * JourneyDayCompleteModal — Celebration popup when all journey habits for the day are completed.
 *
 * Features:
 * - Journey cover image at the top with gradient fade
 * - Check circle with glow overlapping image/content boundary
 * - Milestone system (Days 7, 14, 21): escalated celebration, no auto-dismiss
 * - Phase/journey completion variants
 * - Sound + haptic on open
 * - Auto-dismiss after 6s for regular days
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Gem, Share2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getJourneyTheme } from "@/components/JourneyIllustration";
import { GEM_VALUES } from "@/hooks/useGamification";
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";

// ============================================
// Milestone Configuration
// ============================================

interface MilestoneConfig {
  badge: string;
  subtitle: string;
  message: string;
  particleCount: number;
  soundFn: () => void;
  hapticFn: () => void;
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

// ============================================
// Component
// ============================================

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
  const theme = getJourneyTheme(themeSlug);

  const milestone = MILESTONES[dayNumber];
  const isMilestone = !!milestone;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Auto-dismiss after 6s — skipped for milestones, phase, and journey complete
  useEffect(() => {
    if (isOpen && !journeyCompleted && !phaseCompleted && !isMilestone) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, journeyCompleted, phaseCompleted, isMilestone, onClose]);

  // Sound + haptic on open
  useEffect(() => {
    if (!isOpen) return;
    if (journeyCompleted) return;
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

  if (!isOpen) return null;

  const title = journeyCompleted
    ? "Jornada Completa!"
    : phaseCompleted
      ? "Fase Completa!"
      : `${journeyTitle} Completa!`;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {/* Cover image area */}
          <div className="relative w-full h-48 overflow-hidden">
            {theme.backgroundImage ? (
              <img
                src={theme.backgroundImage}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `radial-gradient(ellipse at center, ${theme.color}40 0%, ${theme.color}10 50%, transparent 80%)`,
                }}
              />
            )}
            {/* Bottom gradient fade */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 30%, rgba(10,10,10,0.6) 60%, #0A0A0A 100%)",
              }}
            />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Check circle — overlaps image/content boundary */}
          <div className="relative flex justify-center" style={{ marginTop: "-36px" }}>
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="relative z-10 w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color}, ${theme.color}CC)`,
                    boxShadow: `0 0 30px ${theme.color}80, 0 0 60px ${theme.color}40, 0 4px 20px rgba(0,0,0,0.4)`,
                  }}
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content area */}
          <div className="px-6 pb-6 pt-3">
            <AnimatePresence mode="wait">
              {showContent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-white mt-2"
                  >
                    {title}
                  </motion.h2>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-white/50 mt-2 max-w-[280px] leading-relaxed"
                  >
                    Você concluiu todos os hábitos desta jornada hoje.
                    {" "}Sua consistência está em{" "}
                    <span className="font-bold" style={{ color: theme.color }}>
                      {dayNumber} dias
                    </span>.
                  </motion.p>

                  {/* Phase badge */}
                  {phaseCompleted && phaseBadgeName && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border mt-3"
                      style={{
                        backgroundColor: `${theme.color}15`,
                        borderColor: `${theme.color}33`,
                      }}
                    >
                      <Award className="w-4 h-4" style={{ color: theme.color }} />
                      <span className="text-sm font-semibold" style={{ color: theme.color }}>
                        {phaseBadgeName}
                      </span>
                    </motion.div>
                  )}

                  {/* Milestone badge */}
                  {isMilestone && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.45 }}
                      className="mt-3 px-5 py-2.5 rounded-xl border text-center"
                      style={{
                        borderColor: `${theme.color}50`,
                        background: `linear-gradient(135deg, ${theme.color}15, ${theme.color}08)`,
                      }}
                    >
                      <p
                        className="text-[10px] tracking-[0.25em] uppercase font-bold"
                        style={{ color: theme.color }}
                      >
                        {milestone.badge}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {milestone.subtitle}
                      </p>
                    </motion.div>
                  )}

                  {/* Gems reward chip */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-1 mt-5 px-6 py-3 rounded-2xl border border-white/5"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    <Gem className="w-5 h-5 text-lime-400" />
                    <p className="text-sm font-bold text-white">
                      +{GEM_VALUES.JOURNEY_DAY_COMPLETE} Gemas
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-white/40">
                      Recompensa
                    </p>
                  </motion.div>

                  {/* CTA buttons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="w-full mt-5 space-y-3"
                  >
                    <Button
                      onClick={onClose}
                      className="w-full h-12 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-sm border-0"
                      style={{
                        boxShadow:
                          "0 4px 24px rgba(163, 230, 53, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
                      }}
                    >
                      {journeyCompleted ? "Ver Graduação" : "Fechar"}
                    </Button>
                    <button
                      onClick={() => {
                        const text = `Completei todos os hábitos da ${journeyTitle} hoje! ${dayNumber} dias de consistência 🔥\n\n#Bora #Habitz`;
                        if (navigator.share) {
                          navigator.share({ text }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(text).catch(() => {});
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors py-2"
                    >
                      <Share2 size={12} />
                      Compartilhar Jornada
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default JourneyDayCompleteModal;
