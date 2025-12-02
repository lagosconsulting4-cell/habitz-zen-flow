import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { Sparkles, Check, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { hideGamification } from "@/config/featureFlags";

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

    // Start submission after a brief delay to show the celebration screen
    const timer = setTimeout(submit, 1500);
    return () => clearTimeout(timer);
  }, [submitOnboarding, submitted]);

  // Progress bar animation
  useEffect(() => {
    const duration = 3000; // 3 seconds total
    const steps = 60; // 60 frames
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

  // Group habits by period for display
  const habitsByPeriod = selectedHabits.reduce(
    (acc, habit) => {
      acc[habit.period].push(habit);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] } as Record<string, typeof selectedHabits>
  );

  const periodLabels = {
    morning: "Manhã",
    afternoon: "Tarde",
    evening: "Noite",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] px-6 py-8 relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.1, 0],
              scale: [0, 2, 3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className={cn(
              "absolute rounded-full",
              i % 3 === 0 && "bg-primary",
              i % 3 === 1 && "bg-green-500",
              i % 3 === 2 && "bg-blue-500"
            )}
            style={{
              width: 200 + i * 50,
              height: 200 + i * 50,
              left: `${20 + i * 10}%`,
              top: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6 shadow-2xl shadow-green-500/50"
        >
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-green-500 to-blue-500 bg-clip-text text-transparent"
        >
          Parabéns!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-xl text-muted-foreground mb-8"
        >
          Sua rotina personalizada está pronta!
        </motion.p>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Habits Created */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <div className="text-4xl font-bold text-primary mb-2">{habitCount}</div>
            <div className="text-sm text-muted-foreground">Hábitos Criados</div>
          </div>

          {!hideGamification && (
            <>
              {/* XP Earned */}
              <div className="bg-card border-2 border-border rounded-2xl p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                  <div className="text-4xl font-bold text-yellow-500">50</div>
                </div>
                <div className="text-sm text-muted-foreground">XP Ganhos</div>
              </div>
            </>
          )}

          {/* Days per Week */}
          <div className="bg-card border-2 border-border rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div className="text-4xl font-bold text-green-500">
                {selectedHabits[0]?.frequency_days?.length || 7}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Dias por Semana</div>
          </div>
        </motion.div>

        {/* Habits Summary by Period */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-card/50 border border-border rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Seus Novos Hábitos:</h3>

          <div className="space-y-3 text-left">
            {Object.entries(habitsByPeriod).map(([period, habits]) => {
              if (habits.length === 0) return null;

              return (
                <div key={period} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      {periodLabels[period as keyof typeof periodLabels]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {habits.map((habit) => (
                        <div
                          key={habit.id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                        >
                          <span>{habit.icon}</span>
                          <span className="text-sm font-medium">{habit.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Loading message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center"
        >
          {isSubmitting ? (
            <p className="text-muted-foreground mb-4">
              Criando seus hábitos e preparando o dashboard...
            </p>
          ) : (
            <p className="text-muted-foreground mb-4">
              Redirecionando para o dashboard...
            </p>
          )}

          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary via-green-500 to-blue-500"
            />
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-sm text-muted-foreground mt-8 italic"
        >
Uma jornada de mil milhas começa com um único passo.
        </motion.p>
      </div>
    </div>
  );
};
