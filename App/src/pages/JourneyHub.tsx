/**
 * JourneyHub — Catalog of all journeys + active journey progress
 * Route: /journeys
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, ChevronRight, Compass, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJourneys, type JourneyWithState } from "@/hooks/useJourney";
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";
import { JourneyHubSkeleton } from "@/components/ui/skeleton";

// ============================================
// Active Journey Card (featured top section)
// ============================================
const ActiveJourneyCard = ({ journey }: { journey: JourneyWithState }) => {
  const navigate = useNavigate();
  const state = journey.userState!;
  const percent = state.completion_percent;
  const theme = getJourneyTheme(journey.theme_slug);

  // Progress ring
  const ringSize = 56;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/journeys/${journey.slug}`)}
      className={cn(
        "w-full journey-card p-4 text-left relative",
        "border transition-all"
      )}
      style={{
        background: `${theme.headerGlow}, var(--card)`,
        borderColor: `${theme.color}33`,
        boxShadow: `0 4px 24px ${theme.color}1A`,
      }}
    >
      {/* Ambient pattern */}
      <div className="absolute inset-0 opacity-20 rounded-2xl pointer-events-none" style={{ background: theme.ambientPattern }} />
      {/* Breathing glow — uses opacity instead of boxShadow for GPU compositing */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none animate-breathe"
        style={{ boxShadow: `0 4px 24px ${theme.color}33` }}
      />
      <div className="flex items-center gap-4 relative z-10">
        {/* Progress ring */}
        <div className="relative flex-shrink-0">
          {/* Glow behind ring */}
          <div
            className="absolute inset-0 rounded-full blur-md"
            style={{ backgroundColor: `${theme.color}1A` }}
          />
          <svg width={ringSize} height={ringSize} className="transform -rotate-90 relative">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              fill="transparent"
              style={{ stroke: `${theme.color}26` }}
            />
            <motion.circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              strokeLinecap="round"
              style={{ stroke: theme.color }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">{percent}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">{journey.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dia {state.current_day} de {journey.duration_days} · Fase {state.current_phase}
          </p>
          <Button
            size="sm"
            className="mt-2 h-8 px-4 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: theme.color, color: '#fff' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/journeys/${journey.slug}/day/${state.current_day}`);
            }}
          >
            Continuar
          </Button>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      </div>
    </motion.button>
  );
};

// ============================================
// Journey Catalog Card
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
  const theme = getJourneyTheme(journey.theme_slug);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, type: "spring", stiffness: 300, damping: 30 }}
      whileHover={!isLocked ? { y: -2, scale: 1.01 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      onClick={() => !isLocked && navigate(`/journeys/${journey.slug}`)}
      disabled={isLocked}
      className={cn(
        "w-full journey-card p-4 text-left relative",
        "border",
        isLocked
          ? "opacity-50 cursor-not-allowed"
          : "transition-all"
      )}
      style={{
        background: isLocked ? 'var(--card)' : `${theme.headerGlow}, var(--card)`,
        borderColor: isLocked ? 'var(--border)' : `${theme.color}26`,
        boxShadow: isLocked ? undefined : `0 2px 16px ${theme.color}0D`,
      }}
    >
      {/* Top accent stripe */}
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ backgroundColor: isLocked ? 'var(--muted-foreground)' : theme.color }}
      />
      {/* Ambient pattern */}
      {!isLocked && (
        <div
          className="absolute inset-0 opacity-10 rounded-2xl pointer-events-none"
          style={{ background: theme.ambientPattern }}
        />
      )}
      <div className="flex items-center gap-3 relative z-10">
        <JourneyIllustration
          illustrationKey={journey.illustration_key}
          size="sm"
          className={isLocked ? "opacity-50" : ""}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground line-clamp-2">{journey.title}</h3>
          {journey.promise && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{journey.promise}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {journey.duration_days} dias
            </div>
            {journey.level === 2 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">L2</Badge>
            )}
            {journey.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Completed state */}
          {journey.userState?.status === "completed" && (
            <Badge
              className="mt-2 text-[10px] border-0"
              style={{ backgroundColor: `${theme.color}1A`, color: theme.color }}
            >
              Completada
            </Badge>
          )}
        </div>

        {isLocked ? (
          <Lock className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Locked overlay text */}
      {isLocked && (
        <p className="text-[10px] text-muted-foreground mt-1 ml-[52px]">
          Complete o Nivel 1 para desbloquear
        </p>
      )}
    </motion.button>
  );
};

// ============================================
// Main Component
// ============================================
const JourneyHub = () => {
  const { journeys, loading, isL2Unlocked } = useJourneys();

  const activeJourneys = useMemo(
    () => journeys.filter((j) => j.userState?.status === "active"),
    [journeys]
  );
  const catalogJourneys = useMemo(
    () => journeys.filter((j) => j.userState?.status !== "active"),
    [journeys]
  );

  // Group catalog by theme
  const themes = useMemo(
    () =>
      catalogJourneys.reduce<Record<string, JourneyWithState[]>>(
        (acc, j) => {
          if (!acc[j.theme_slug]) acc[j.theme_slug] = [];
          acc[j.theme_slug].push(j);
          return acc;
        },
        {}
      ),
    [catalogJourneys]
  );

  if (loading) {
    return <JourneyHubSkeleton />;
  }

  return (
    <div className="px-4 pt-6 pb-navbar space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jornadas</h1>
        <p className="text-sm text-muted-foreground mt-1 font-serif italic">
          Transformações guiadas de 30 dias
        </p>
      </div>

      {/* Active Journeys */}
      {activeJourneys.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Em andamento
          </h2>
          {activeJourneys.map((j) => (
            <ActiveJourneyCard key={j.id} journey={j} />
          ))}
        </section>
      )}

      {/* Journey Catalog */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {activeJourneys.length > 0 ? "Explorar" : "Escolha sua jornada"}
        </h2>
        <div className="space-y-3">
          {(() => {
            let globalIndex = 0;
            return Object.entries(themes).map(([, themeJourneys]) => {
              const sorted = [...themeJourneys].sort((a, b) => a.level - b.level);
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
            });
          })()}
        </div>
      </section>

      {/* Empty catalog state */}
      {journeys.length === 0 && (
        <div className="text-center py-12">
          <Compass className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma jornada disponivel no momento</p>
        </div>
      )}
    </div>
  );
};

export default JourneyHub;
