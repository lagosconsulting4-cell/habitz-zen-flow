import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bell, Timer, Star, Clock, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { supabase } from "@/integrations/supabase/client";
import { IllustrationBell } from "../OnboardingIllustrations";
import { SelectionCard } from "@/components/onboarding/SelectionCard";

// ============================================================================
// OFFSET OPTIONS
// ============================================================================

interface OffsetOption {
  value: number;
  label: string;
  icon: ReactNode;
  description: string;
  recommended?: boolean;
}

const OFFSET_OPTIONS: OffsetOption[] = [
  { value: 0,  label: 'Na hora certa', icon: <Bell       size={20} className="text-amber-500"  />, description: 'Exatamente no horário do hábito' },
  { value: 5,  label: '5 min antes',   icon: <Timer      size={20} className="text-orange-400" />, description: 'Um aviso rápido' },
  { value: 10, label: '10 min antes',  icon: <Star       size={20} className="text-primary"    />, description: 'Recomendado', recommended: true },
  { value: 15, label: '15 min antes',  icon: <Clock      size={20} className="text-amber-400"  />, description: 'Tempo para se preparar' },
  { value: 30, label: '30 min antes',  icon: <AlarmClock size={20} className="text-amber-500"  />, description: 'Bastante antecedência' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const S14bReminderOffset = () => {
  const { nextStep } = useOnboardingV2();
  const { trackEvent } = useEventTracker();
  const [selected, setSelected] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Read current prefs first to avoid overwriting other fields
        const { data: progress } = await supabase
          .from("user_progress")
          .select("notification_preferences")
          .eq("user_id", user.id)
          .maybeSingle();

        const currentPrefs = progress?.notification_preferences ?? {};
        await supabase
          .from("user_progress")
          .upsert(
            { user_id: user.id, notification_preferences: { ...currentPrefs, reminder_offset_minutes: selected } },
            { onConflict: "user_id" }
          );
      }
      trackEvent("onboarding_v2_reminder_offset_set", { offset: selected }, "onboarding_v2");
    } catch {
      // Non-fatal — default of 10 is set by SQL backfill
    } finally {
      setIsSaving(false);
      nextStep();
    }
  };

  return (
    <div className="h-full flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Animated bell illustration */}
        <IllustrationBell />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Com quanto tempo de aviso?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-base text-muted-foreground leading-relaxed mb-6"
        >
          Com quanto tempo antes você quer ser avisado?
        </motion.p>

        {/* Selection cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="space-y-2"
        >
          {OFFSET_OPTIONS.map((opt, index) => (
            <div key={opt.value} className="relative">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.07, duration: 0.3 }}
              >
                <SelectionCard
                  id={`offset-${opt.value}`}
                  title={opt.label}
                  description={opt.description}
                  icon={opt.icon}
                  selected={selected === opt.value}
                  onClick={() => setSelected(opt.value)}
                  variant="compact"
                />
              </motion.div>
              {opt.recommended && (
                <span className="absolute top-1/2 -translate-y-1/2 right-9 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20 pointer-events-none z-10">
                  ★ ideal
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="max-w-md mx-auto w-full mt-6"
      >
        <div>
          <Button
            onClick={handleConfirm}
            disabled={isSaving || selected === null}
            size="lg"
            className="w-full rounded-xl"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
            ) : null}
            Continuar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
