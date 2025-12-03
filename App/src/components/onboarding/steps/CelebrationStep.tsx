import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { Check, TrendingUp, Calendar } from "lucide-react";

export const CelebrationStep = () => {
  const { recommendedHabits, selectedHabitIds, submitOnboarding, isSubmitting } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const selectedHabits = recommendedHabits.filter((h) => selectedHabitIds.has(h.id));
  const habitCount = selectedHabits.length;

  // Auto-submit on mount
  useEffect(() => {
    const submit = async () => {
      if (!submitted) {
        setSubmitted(true);
        await submitOnboarding();
      }
    };

    const timer = setTimeout(submit, 1500);
    return () => clearTimeout(timer);
  }, [submitOnboarding, submitted]);

  // Progress bar animation
  useEffect(() => {
    const duration = 3000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 100 / steps;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Content */}
      <div className="text-center max-w-sm">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg shadow-green-500/30"
        >
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-green-500 to-blue-500 bg-clip-text text-transparent"
        >
          Parabéns!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm text-muted-foreground mb-4"
        >
          Sua rotina personalizada está pronta
        </motion.p>

        {/* Stats Row - Horizontal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex justify-center gap-4 mb-4"
        >
          {/* Habits Created */}
          <div className="bg-card border border-border rounded-xl px-4 py-3 min-w-[80px]">
            <div className="text-2xl font-bold text-primary">{habitCount}</div>
            <div className="text-xs text-muted-foreground">Hábitos</div>
          </div>

          {/* Days per Week */}
          <div className="bg-card border border-border rounded-xl px-4 py-3 min-w-[80px]">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {selectedHabits[0]?.frequency_days?.length || 7}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Dias/sem</div>
          </div>

          {/* Trend */}
          <div className="bg-card border border-border rounded-xl px-4 py-3 min-w-[80px]">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">+</span>
            </div>
            <div className="text-xs text-muted-foreground">Progresso</div>
          </div>
        </motion.div>

        {/* Loading message + Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground mb-2">
            {isSubmitting ? "Criando seus hábitos..." : "Redirecionando..."}
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-[200px] mx-auto h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary via-green-500 to-blue-500"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
