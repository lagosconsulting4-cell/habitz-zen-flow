import { motion, useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "../OnboardingProvider";
import { cn } from "@/lib/utils";
import { Check, Star, Calendar } from "lucide-react";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { Skeleton } from "@/components/ui/skeleton";

/** Map challenge IDs → journey slugs for recommendation sorting */
const CHALLENGE_TO_JOURNEY: Record<string, string[]> = {
  procrastination: ["focus-protocol-l1"],
  focus: ["focus-protocol-l1", "digital-detox-l1"],
  tiredness: ["own-mornings-l1"],
  anxiety: ["digital-detox-l1"],
  motivation: ["gym-l1"],
  forgetfulness: ["finances-l1", "own-mornings-l1"],
};

interface JourneyOption {
  id: string;
  slug: string;
  theme_slug: string;
  title: string;
  promise: string | null;
  recommended: boolean;
}

export const JourneySelectionStep = () => {
  const { challenges, selectedJourneyIds, toggleJourney } = useOnboarding();
  const reducedMotion = useReducedMotion();

  // Fetch L1 journeys from DB
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["journeys-l1-onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("id, slug, theme_slug, title, promise")
        .eq("level", 1)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        slug: string;
        theme_slug: string;
        title: string;
        promise: string | null;
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build recommended slugs from challenges
  const recommendedSlugs = new Set<string>();
  for (const c of challenges) {
    for (const slug of CHALLENGE_TO_JOURNEY[c] || []) {
      recommendedSlugs.add(slug);
    }
  }

  // Sort: recommended first
  const sorted: JourneyOption[] = journeys
    .map((j) => ({ ...j, recommended: recommendedSlugs.has(j.slug) }))
    .sort((a, b) => (a.recommended === b.recommended ? 0 : a.recommended ? -1 : 1));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold mb-1">Escolha sua jornada</h2>
        <p className="text-sm text-muted-foreground font-serif italic">
          Transformações guiadas de 30 dias
        </p>
      </motion.div>

      {/* Journey Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-1 space-y-2.5 max-w-md mx-auto w-full"
      >
        {isLoading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full flex items-start gap-3 p-4 rounded-2xl border border-border/40">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-4/5 rounded-sm" />
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <div className="flex gap-2 mt-0.5">
                    <Skeleton className="h-3 w-12 rounded-full" />
                    <Skeleton className="h-3 w-14 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          sorted.map((j, i) => {
            const selected = selectedJourneyIds.has(j.id);
            const theme = getJourneyTheme(j.theme_slug);
            return (
              <motion.button
                key={j.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  borderColor: selected ? `${theme.color}66` : `${theme.color}26`,
                  boxShadow: selected
                    ? `0 4px 24px ${theme.color}33`
                    : `0 1px 8px ${theme.color}0D`,
                }}
                transition={{
                  delay: reducedMotion ? 0 : 0.1 + i * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  borderColor: { duration: 0.3 },
                  boxShadow: { duration: 0.3 },
                }}
                whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                onClick={() => toggleJourney(j.id)}
                role="checkbox"
                aria-checked={selected}
                aria-label={`${j.title}${j.recommended ? " - Recomendada para você" : ""}`}
                className={cn(
                  "w-full p-4 rounded-2xl text-left relative overflow-hidden",
                  "border transition-colors duration-300"
                )}
                style={{
                  background: selected
                    ? `linear-gradient(135deg, ${theme.color}18 0%, ${theme.color}08 100%)`
                    : `${theme.headerGlow}, var(--card)`,
                  borderColor: selected ? `${theme.color}66` : `${theme.color}26`,
                }}
              >
                {/* Ambient pattern layer */}
                <div
                  className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none"
                  style={{ background: theme.ambientPattern }}
                />

                {/* Top accent stripe */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
                  style={{ backgroundColor: theme.color }}
                />

                {/* Breathing glow when selected */}
                {selected && !reducedMotion && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none animate-breathe"
                    style={{ boxShadow: `0 4px 24px ${theme.color}33` }}
                  />
                )}

                {/* Content wrapper — above decorative layers */}
                <div className="flex items-start gap-3 relative z-10">
                  {/* Icon with scale animation */}
                  <motion.div
                    className="shrink-0"
                    animate={
                      reducedMotion
                        ? {}
                        : { scale: selected ? 1.05 : 1, opacity: selected ? 1 : 0.75 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <JourneyIllustration illustrationKey={j.theme_slug} size="sm" />
                  </motion.div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                      {j.title}
                    </h3>
                    {j.promise && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {j.promise}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {j.recommended && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${theme.color}1A`,
                            color: theme.color,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                          }}
                        >
                          <Star className="w-2.5 h-2.5" />
                          Pra você
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: theme.color, opacity: 0.6 }} />
                        <span className="text-[10px] text-muted-foreground/60">30 dias</span>
                      </div>
                    </div>
                  </div>

                  {/* Check */}
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                      style={{
                        backgroundColor: theme.color,
                        boxShadow: `0 0 8px ${theme.color}66`,
                      }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Decorative emoji */}
                <span
                  className="absolute bottom-1.5 right-2 text-lg opacity-[0.08] select-none pointer-events-none"
                  aria-hidden="true"
                >
                  {theme.decorGlyph}
                </span>
              </motion.button>
            );
          })
        )}
      </motion.div>

      {/* Counter */}
      <motion.p
        key={selectedJourneyIds.size}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center text-xs text-muted-foreground mt-3"
      >
        {selectedJourneyIds.size > 0
          ? `${selectedJourneyIds.size} ${selectedJourneyIds.size === 1 ? "jornada selecionada" : "jornadas selecionadas"}`
          : "Selecione uma ou mais, ou pule esta etapa"}
      </motion.p>
    </div>
  );
};
