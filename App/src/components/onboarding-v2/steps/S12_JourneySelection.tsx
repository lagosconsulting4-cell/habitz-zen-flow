import { useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { haptic } from "@/lib/haptics";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { getDominantCopy, getCompatibilityNote } from "../journeyConstants";

// ============================================================================
// TYPES
// ============================================================================

interface JourneyRow {
  id: string;
  slug: string;
  theme_slug: string;
  title: string;
  promise: string | null;
  description: string | null;
}

const MAX_JOURNEYS = 2;

// ============================================================================
// SKELETON (reused pattern from old JourneySelectionStep.tsx:94-109)
// ============================================================================

function SkeletonCards() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-full flex items-start gap-3 p-4 rounded-2xl border border-border/40">
          <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-4/5 rounded-sm" />
            <Skeleton className="h-3 w-full rounded-sm" />
            <div className="flex gap-2 mt-0.5">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export const S12JourneySelection = () => {
  const {
    journeyScores,
    journeyDominantSignals,
    journeyBadges,
    selectedJourneyIds,
    toggleJourney,
  } = useOnboardingV2();

  const reducedMotion = useReducedMotion();
  const selectionCount = selectedJourneyIds.size;
  const atLimit = selectionCount >= MAX_JOURNEYS;

  // ---- Fetch L1 journeys from Supabase ----
  // Pattern reused from old JourneySelectionStep.tsx:38-57
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["journeys-l1-onboarding-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("id, slug, theme_slug, title, promise, description")
        .eq("level", 1)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as JourneyRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ---- Sort by score descending ----
  const sorted = useMemo(() => {
    return [...journeys].sort((a, b) => {
      const scoreA = journeyScores[a.slug] || 0;
      const scoreB = journeyScores[b.slug] || 0;
      return scoreB - scoreA;
    });
  }, [journeys, journeyScores]);

  // ---- Badge set for O(1) lookup ----
  const badgeSet = useMemo(() => new Set(journeyBadges), [journeyBadges]);

  // ---- Get selected slugs for compatibility note ----
  const selectedSlugs = useMemo(() => {
    return Array.from(selectedJourneyIds);
  }, [selectedJourneyIds]);

  const compatNote = useMemo(() => {
    if (selectedSlugs.length !== 2) return null;
    return getCompatibilityNote(selectedSlugs[0], selectedSlugs[1]);
  }, [selectedSlugs]);

  // Derive blob colors from selected journeys
  const getColorBySlug = (slug: string): string | null => {
    const j = sorted.find((j) => j.slug === slug);
    return j ? getJourneyTheme(j.theme_slug).color : null;
  };
  const slugsArr = Array.from(selectedJourneyIds);
  const blobColor1 = getColorBySlug(slugsArr[0]) ?? null;
  const blobColor2 = getColorBySlug(slugsArr[1]) ?? null;

  return (
    <div className="h-full flex flex-col px-6 py-4 relative">
      {/* Background blobs — animated per selected journey color */}
      <motion.div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
        animate={{
          opacity: blobColor1 ? 0.22 : 0,
          backgroundColor: blobColor1 ?? 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ filter: 'blur(64px)' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        animate={{
          opacity: blobColor2 ? 0.18 : (blobColor1 ? 0.12 : 0),
          backgroundColor: blobColor2 ?? blobColor1 ?? 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ filter: 'blur(64px)' }}
      />

      {/* Centered content wrapper */}
      <div className="flex-1 flex flex-col justify-center min-h-0 max-w-md mx-auto w-full">

      {/* Header */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <h2 className="text-2xl font-bold text-foreground">
          Escolha sua missão.
        </h2>
      </motion.div>

      {/* Journey Cards */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="space-y-2.5 w-full"
      >
        {isLoading ? (
          <SkeletonCards />
        ) : (
          sorted.map((j, i) => {
            const selected = selectedJourneyIds.has(j.slug);
            const theme = getJourneyTheme(j.theme_slug);
            const isBadged = badgeSet.has(j.slug);
            const dominantCopy = getDominantCopy(j.slug, journeyDominantSignals[j.slug]);

            return (
              <motion.button
                key={j.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                animate={{
                  opacity: atLimit && !selected ? 0.45 : 1,
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
                onClick={() => {
                  haptic.light();
                  toggleJourney(j.slug);
                }}
                role="checkbox"
                aria-checked={selected}
                aria-label={`${j.title}${isBadged ? " - Recomendada para você" : ""}`}
                className={cn(
                  "w-full p-4 rounded-2xl text-left relative overflow-hidden",
                  "border transition-colors duration-300",
                )}
                style={{
                  background: selected
                    ? `linear-gradient(135deg, ${theme.color}18 0%, ${theme.color}08 100%)`
                    : "var(--card)",
                  borderColor: selected ? `${theme.color}66` : `${theme.color}26`,
                }}
              >
                {/* Top accent stripe */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
                  style={{ backgroundColor: theme.color }}
                />

                <div className="flex items-start gap-3 relative z-10">
                  {/* Icon */}
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

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                      {j.title}
                    </h3>

                    {/* Dynamic one-liner based on dominant signal */}
                    {dominantCopy && (
                      <p className="text-xs text-foreground/70 mt-0.5 line-clamp-1">
                        {dominantCopy}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Badge — only for recommended journeys */}
                      {isBadged && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${theme.color}1A`,
                            color: theme.color,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
                          }}
                        >
                          Recomendada para você
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: theme.color, opacity: 0.6 }}
                        />
                        <span className="text-[10px] text-muted-foreground/60">30 dias</span>
                      </div>
                    </div>
                  </div>

                  {/* Check indicator */}
                  {selected && (
                    <motion.div
                      initial={reducedMotion ? { scale: 1 } : { scale: 0 }}
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
              </motion.button>
            );
          })
        )}
      </motion.div>

      {/* Compatibility note — shown when exactly 2 selected */}
      <AnimatePresence>
        {compatNote && (
          <motion.div
            initial={reducedMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40 w-full"
          >
            <p className="text-xs text-muted-foreground text-center">
              {compatNote.copy}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      </div>{/* end centered wrapper */}
    </div>
  );
};
