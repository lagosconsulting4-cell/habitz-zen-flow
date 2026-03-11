import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "../OnboardingProvider";
import { Check, Calendar } from "lucide-react";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";

interface JourneyOption {
  id: string;
  slug: string;
  theme_slug: string;
  title: string;
}

export const CelebrationStep = () => {
  const { recommendedHabits, selectedHabitIds, submitOnboarding, isSubmitting, selectedJourneyIds } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const selectedHabits = recommendedHabits.filter((h) => selectedHabitIds.has(h.id));
  const habitCount = selectedHabits.length;

  // Fetch journeys from cache (same queryKey as JourneySelectionStep)
  const { data: allJourneys = [] } = useQuery<JourneyOption[]>({
    queryKey: ["journeys-l1-onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("id, slug, theme_slug, title, promise")
        .eq("level", 1)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as JourneyOption[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const selectedJourneys = allJourneys.filter((j) => selectedJourneyIds.has(j.id));

  // Sound + haptic on mount
  useEffect(() => {
    sounds.unlock();
    haptic.success();
  }, []);

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
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Check className="h-7 w-7 text-primary" strokeWidth={2.5} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-2xl font-bold mb-1"
        >
          Tudo pronto.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm text-muted-foreground mb-4"
        >
          Sua rotina foi configurada
        </motion.p>

        {/* Stats Row */}
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
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {selectedHabits[0]?.frequency_days?.length || 7}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Dias/sem</div>
          </div>
        </motion.div>

        {/* Selected journeys — visual commitment */}
        {selectedJourneys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-2 mb-4"
          >
            <p className="text-xs text-muted-foreground">Suas jornadas</p>
            <div className="flex justify-center gap-3">
              {selectedJourneys.map((journey) => {
                const theme = getJourneyTheme(journey.theme_slug);
                return (
                  <div
                    key={journey.id}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border min-w-[100px] max-w-[140px]"
                    style={{
                      borderColor: `${theme.color}33`,
                      backgroundColor: `${theme.color}0A`,
                    }}
                  >
                    <JourneyIllustration illustrationKey={journey.theme_slug} size="sm" />
                    <span className="text-xs font-medium text-foreground/80 text-center line-clamp-2">
                      {journey.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Loading message + Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
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
              className="h-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
