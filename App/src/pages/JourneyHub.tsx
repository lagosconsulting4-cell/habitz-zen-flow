/**
 * JourneyHub — Premium catalog of all journeys + active journey progress
 * Route: /journeys
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ChevronRight, Compass, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourneys, type JourneyWithState } from "@/hooks/useJourney";
import { getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyHubSkeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";

// Mock engagement numbers per theme
const MOCK_USERS: Record<string, string> = {
  "digital-detox": "+12k",
  "own-mornings": "+8.5k",
  gym: "+15k",
  "focus-protocol": "+6.2k",
  finances: "+4.8k",
};

// Avatar photos per theme (2 unique faces each)
const BASE = import.meta.env.BASE_URL;
const MOCK_AVATARS: Record<string, [string, string]> = {
  "digital-detox": [`${BASE}images/avatars/a1.webp`, `${BASE}images/avatars/a2.webp`],
  "own-mornings": [`${BASE}images/avatars/a3.webp`, `${BASE}images/avatars/a4.webp`],
  gym: [`${BASE}images/avatars/a5.webp`, `${BASE}images/avatars/a6.webp`],
  "focus-protocol": [`${BASE}images/avatars/a2.webp`, `${BASE}images/avatars/a5.webp`],
  finances: [`${BASE}images/avatars/a4.webp`, `${BASE}images/avatars/a1.webp`],
};

// Level labels
const LEVEL_LABELS: Record<number, string> = {
  1: "INICIANTE",
  2: "AVANÇADO",
};

// Unique cover image per journey slug — NO repeats
const JOURNEY_COVERS: Record<string, string> = {
  // L1 journeys
  "digital-detox-l1": `${import.meta.env.BASE_URL}backgrounds/arte9.webp`,
  "own-mornings-l1": `${import.meta.env.BASE_URL}backgrounds/arte8.webp`,
  "gym-l1": `${import.meta.env.BASE_URL}backgrounds/arte11.webp`,
  "focus-protocol-l1": `${import.meta.env.BASE_URL}backgrounds/arte5.webp`,
  "finances-l1": `${import.meta.env.BASE_URL}backgrounds/arte2.webp`,
  // L2 journeys — each gets a different image
  "digital-detox-l2": `${import.meta.env.BASE_URL}backgrounds/arte1.webp`,
  "own-mornings-l2": `${import.meta.env.BASE_URL}backgrounds/arte3.webp`,
  "gym-l2": `${import.meta.env.BASE_URL}backgrounds/arte12.webp`,
  "focus-protocol-l2": `${import.meta.env.BASE_URL}backgrounds/arte7.webp`,
  "finances-l2": `${import.meta.env.BASE_URL}backgrounds/arte10.webp`,
};

function getJourneyCover(journey: JourneyWithState): string | undefined {
  return JOURNEY_COVERS[journey.slug] || getJourneyTheme(journey.theme_slug).backgroundImage || undefined;
}

// ============================================
// Active Journey Card — Image hero style
// ============================================
const ActiveJourneyCard = ({ journey }: { journey: JourneyWithState }) => {
  const navigate = useNavigate();
  const state = journey.userState!;
  const bgImage = getJourneyCover(journey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "rgb(20, 20, 20)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(163,230,53,0.04)",
      }}
    >
      {/* Image area (top) */}
      <div className="relative" style={{ height: 180 }}>
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Bottom fade into card bg */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgb(20,20,20) 0%, rgba(20,20,20,0) 30%)",
          }}
        />
      </div>

      {/* Content area (bottom) */}
      <div className="px-5 pb-5 pt-4">
        {/* Progress indicator */}
        <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
          DIA {state.current_day} DE {journey.duration_days}{" "}
          <span className="inline-block w-6 h-px bg-white/20 align-middle ml-2" />
        </p>
        {/* Title */}
        <h3 className="text-xl font-bold text-white leading-tight">
          {journey.title}
        </h3>
        {/* Description */}
        {journey.promise && (
          <p className="text-sm text-white/50 mt-1.5 line-clamp-2 leading-relaxed">
            {journey.promise}
          </p>
        )}
        {/* Continue button */}
        <button
          onClick={() =>
            navigate(`/journeys/${journey.slug}`)
          }
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)",
            color: "#000000",
            boxShadow:
              "0 0 24px rgba(163, 230, 53, 0.3), 0 4px 12px rgba(163, 230, 53, 0.2)",
          }}
        >
          CONTINUAR
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// Journey Catalog Card — Image + tags style
// ============================================
const JourneyCatalogCard = ({
  journey,
  isLocked,
  index,
}: {
  journey: JourneyWithState;
  isLocked: boolean;
  index: number;
}) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const theme = getJourneyTheme(journey.theme_slug);
  const bgImage = getJourneyCover(journey);
  const mockUsers = MOCK_USERS[journey.theme_slug] || "+1k";
  const isCompleted = journey.userState?.status === "completed";

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1 + index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={!isLocked ? { y: -2 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={() => !isLocked && navigate(`/journeys/${journey.slug}`)}
      disabled={isLocked}
      className={cn(
        "w-full text-left",
        isLocked ? "opacity-70 cursor-not-allowed" : "transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      )}
    >
      {/* Cover Image */}
      <div
        className="relative rounded-xl overflow-hidden mb-3"
        style={{ height: 160 }}
      >
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              isLocked && "blur-[2px]"
            )}
          />
        )}
        {/* Subtle gradient for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Duration badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            backgroundColor: "rgba(163, 230, 53, 0.9)",
            boxShadow: "0 2px 8px rgba(163, 230, 53, 0.3)",
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-black/40" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-black">
            {journey.duration_days} DIAS
          </span>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
              <Lock className="h-5 w-5 text-white/70" />
            </div>
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div
            className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${theme.color}E6`,
              color: "#FFFFFF",
            }}
          >
            Completa
          </div>
        )}
      </div>

      {/* Tags row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.06)",
            color: isDarkMode
              ? "rgba(255,255,255,0.7)"
              : "rgba(0,0,0,0.6)",
          }}
        >
          {LEVEL_LABELS[journey.level] || `NÍVEL ${journey.level}`}
        </span>
        {journey.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              color: isDarkMode
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.4)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-lg font-bold leading-tight",
          isDarkMode ? "text-white" : "text-gray-900"
        )}
      >
        {journey.title}
      </h3>

      {/* Locked subtitle */}
      {isLocked && (
        <p
          className="text-xs mt-1"
          style={{
            color: isDarkMode
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.4)",
          }}
        >
          Desbloqueie no Nível 2
        </p>
      )}

      {/* User row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {/* Mock avatar photos */}
          <div className="flex -space-x-1.5">
            {(MOCK_AVATARS[journey.theme_slug] || [`${BASE}images/avatars/a1.webp`, `${BASE}images/avatars/a2.webp`]).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-6 w-6 rounded-full border-2 object-cover"
                style={{ borderColor: isDarkMode ? "#000" : "#FFF" }}
              />
            ))}
          </div>
          <span
            className="text-xs font-medium"
            style={{
              color: isDarkMode
                ? "rgba(255,255,255,0.4)"
                : "rgba(0,0,0,0.4)",
            }}
          >
            {mockUsers}
          </span>
        </div>
        {isLocked ? (
          <Lock
            className="h-4 w-4"
            style={{
              color: isDarkMode
                ? "rgba(255,255,255,0.3)"
                : "rgba(0,0,0,0.3)",
            }}
          />
        ) : (
          <ChevronRight
            className="h-5 w-5"
            style={{ color: theme.color }}
          />
        )}
      </div>
    </motion.button>
  );
};

// ============================================
// Main Component
// ============================================
const JourneyHub = () => {
  const { journeys, loading, isL2Unlocked } = useJourneys();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const activeJourneys = useMemo(
    () => journeys.filter((j) => j.userState?.status === "active"),
    [journeys]
  );
  const catalogJourneys = useMemo(
    () => journeys.filter((j) => j.userState?.status !== "active"),
    [journeys]
  );

  if (loading) {
    return <JourneyHubSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="px-4 pb-navbar space-y-8 max-w-xl mx-auto w-full"
    >
      {/* Hero Section — image with text overlaid at bottom */}
      <div className="relative -mx-4 overflow-hidden flex flex-col justify-end" style={{ height: "52vh" }}>
        {/* Background image */}
        <img
          src={`${import.meta.env.BASE_URL}backgrounds/arte13.webp`}
          alt=""
          aria-hidden="true"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Top scrim for status bar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        {/* Bottom gradient for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0) 65%)"
              : "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0) 65%)",
          }}
        />
        {/* Content overlaid at bottom */}
        <div className="relative z-10 px-4 pb-4">
          {/* Curated badge */}
          <span
            className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(163, 230, 53, 0.15)"
                : "rgba(132, 204, 22, 0.12)",
              color: isDarkMode ? "#A3E635" : "#65A30D",
            }}
          >
            CURATED
          </span>
          {/* Heading */}
          <h1
            className={cn(
              "text-3xl font-bold leading-tight",
              isDarkMode ? "text-white" : "text-gray-900"
            )}
          >
            Jornadas{" "}
            <em className="font-bold italic">para você</em>
          </h1>
          {/* Subtitle */}
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{
              color: isDarkMode
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
            }}
          >
            Experiências imersivas de vários dias, feitas para transformar
            seus hábitos.
          </p>
        </div>
      </div>

      {/* Active Journeys */}
      {activeJourneys.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "text-lg font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              Em Andamento
            </h2>
            <span
              className="text-xs font-semibold"
              style={{ color: isDarkMode ? "#A3E635" : "#65A30D" }}
            >
              {activeJourneys.length} ativa
              {activeJourneys.length > 1 ? "s" : ""}
            </span>
          </div>
          {activeJourneys.map((j) => (
            <ActiveJourneyCard key={j.id} journey={j} />
          ))}
        </section>
      )}

      {/* Explore Catalog */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2
            className={cn(
              "text-lg font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}
          >
            Explorar
          </h2>
          <SlidersHorizontal
            className="h-5 w-5"
            style={{
              color: isDarkMode
                ? "rgba(255,255,255,0.4)"
                : "rgba(0,0,0,0.4)",
            }}
          />
        </div>
        <div className="space-y-8">
          {(() => {
            let globalIndex = 0;
            // Flatten all catalog journeys sorted by theme then level
            const sorted = [...catalogJourneys].sort((a, b) => {
              if (a.theme_slug !== b.theme_slug)
                return a.theme_slug.localeCompare(b.theme_slug);
              return a.level - b.level;
            });
            return sorted.map((j) => {
              const idx = globalIndex++;
              return (
                <JourneyCatalogCard
                  key={j.id}
                  journey={j}
                  isLocked={!isL2Unlocked(j)}
                  index={idx}
                />
              );
            });
          })()}
        </div>
      </section>

      {/* Empty state */}
      {journeys.length === 0 && (
        <div className="text-center py-12">
          <Compass className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhuma jornada disponível no momento
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default JourneyHub;
