/**
 * JourneyGraduationModal — Shown on Day 30 completion
 * User selects which habits to keep. Follows LevelUpModal + JourneyDayCompleteModal patterns.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Check, Archive, Sparkles } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

interface GraduationHabit {
  habitId: string;
  name: string;
  emoji: string;
}

export interface JourneyGraduationModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyId: string;
  journeyTitle: string;
  journeyLevel: number;
  completionPercent: number;
  keepHabits: (journeyId: string, habitIdsToKeep: string[]) => Promise<void>;
  themeSlug?: string | null;
}

export const JourneyGraduationModal = ({
  isOpen,
  onClose,
  journeyId,
  journeyTitle,
  journeyLevel,
  completionPercent,
  keepHabits,
  themeSlug,
}: JourneyGraduationModalProps) => {
  const { user } = useAuth();
  const theme = getJourneyTheme(themeSlug);
  const [habits, setHabits] = useState<GraduationHabit[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const l2Unlocked = completionPercent >= 80;

  // Fetch journey habits when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchHabits = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_journey_habits")
        .select("habit_id, habits(name, emoji)")
        .eq("user_id", user.id)
        .eq("journey_id", journeyId)
        .eq("is_active", true);

      const mapped = (data || []).map((h: Record<string, unknown>) => ({
        habitId: h.habit_id as string,
        name: (h.habits as Record<string, string>)?.name || "",
        emoji: (h.habits as Record<string, string>)?.emoji || "📋",
      }));

      setHabits(mapped);
      // Default: all selected
      setSelectedIds(new Set(mapped.map((h: GraduationHabit) => h.habitId)));
      setLoading(false);
    };

    fetchHabits();
  }, [isOpen, user, journeyId]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
    setShowContent(false);
  }, [isOpen]);

  const toggleHabit = (habitId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) next.delete(habitId);
      else next.add(habitId);
      return next;
    });
  };

  const handleGraduate = async () => {
    setSubmitting(true);
    try {
      await keepHabits(journeyId, Array.from(selectedIds));
      onClose();
    } catch (err) {
      console.error("[Graduation] Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-sm border-2 overflow-hidden max-h-[85vh] overflow-y-auto",
          "bg-gradient-to-br from-zinc-900/95 to-zinc-950/95",
        )}
        style={{
          borderColor: `${theme.color}4D`,
          boxShadow: `0 0 30px ${theme.color}33`,
        }}
      >
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <DialogHeader className="items-center text-center space-y-3">
                {/* Graduation icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color}4D, ${theme.color}1A)`,
                    borderColor: `${theme.color}66`,
                    boxShadow: `0 0 20px ${theme.color}4D`,
                  }}
                >
                  <GraduationCap className="w-10 h-10" style={{ color: theme.color }} />
                </motion.div>

                <DialogTitle className="text-xl font-bold text-white">
                  Jornada Completa!
                </DialogTitle>

                <DialogDescription className="text-sm text-white/60">
                  {journeyTitle} — 30 dias
                </DialogDescription>

                {/* L2 unlock message */}
                {l2Unlocked && journeyLevel === 1 && (
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
                    <Sparkles className="w-4 h-4" style={{ color: theme.color }} />
                    <span className="text-sm font-semibold" style={{ color: theme.color }}>
                      Nível 2 desbloqueado!
                    </span>
                  </motion.div>
                )}
              </DialogHeader>

              {/* Habit selection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 space-y-2"
              >
                <p className="text-xs text-white/40 text-center mb-3">
                  Quais hábitos você quer manter?
                </p>

                {loading ? (
                  <div className="py-6 text-center text-white/30 text-sm">Carregando...</div>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {habits.map((habit, i) => {
                      const selected = selectedIds.has(habit.habitId);
                      return (
                        <motion.button
                          key={habit.habitId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          onClick={() => toggleHabit(habit.habitId)}
                          className={cn(
                            "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left",
                            !selected && "bg-white/5 border border-white/10 opacity-60"
                          )}
                          style={selected ? {
                            backgroundColor: `${theme.color}1A`,
                            border: `1px solid ${theme.color}33`,
                          } : undefined}
                        >
                          <span className="text-base">{habit.emoji}</span>
                          <span className="flex-1 text-sm text-white/80 truncate">
                            {habit.name}
                          </span>
                          {selected ? (
                            <Check className="w-4 h-4" style={{ color: theme.color }} />
                          ) : (
                            <Archive className="w-4 h-4 text-white/30" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-5 space-y-2"
              >
                <Button
                  onClick={handleGraduate}
                  disabled={submitting}
                  className="w-full font-bold text-white"
                  style={{ backgroundColor: theme.color }}
                >
                  {submitting
                    ? "Graduando..."
                    : `Graduar (${selectedIds.size}/${habits.length} hábitos)`}
                </Button>
                <p className="text-[10px] text-white/30 text-center">
                  Hábitos mantidos viram hábitos pessoais permanentes
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default JourneyGraduationModal;
