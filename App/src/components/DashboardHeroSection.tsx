import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";

interface DashboardHeroSectionProps {
  totalHabits: number;
  completedHabits: number;
  journeyTitle?: string;
  className?: string;
}

const GREETING_THRESHOLDS = [
  { min: 100, text: "Dia perfeito" },
  { min: 75, text: "Excelente trabalho" },
  { min: 50, text: "Bom progresso" },
  { min: 25, text: "Continue assim" },
  { min: 0, text: "Vamos comecar" },
];

function getGreeting(percent: number): string {
  return (
    GREETING_THRESHOLDS.find((t) => percent >= t.min)?.text || "Vamos comecar"
  );
}

export function DashboardHeroSection({
  totalHabits,
  completedHabits,
  journeyTitle,
  className,
}: DashboardHeroSectionProps) {
  const navigate = useNavigate();
  const { displayName } = useProfile();
  const percent =
    totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
  const remaining = totalHabits - completedHabits;
  const greeting = getGreeting(percent);
  const firstName = displayName?.split(" ")[0] || "Bora";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <div className="rounded-2xl bg-card border border-border/60 card-premium p-6">
        <div className="flex flex-col items-center text-center">
          {/* Progress Ring with glow */}
          <div className="relative mb-6">
            <div className="glow-primary rounded-full">
              <CircularProgress
                progress={percent}
                size={180}
                strokeWidth={12}
                trackColor="rgba(163, 230, 53, 0.12)"
                progressColor="#A3E635"
              >
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-foreground">
                    {percent}%
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Meta Diaria
                  </span>
                </div>
              </CircularProgress>
            </div>
          </div>

          {/* Greeting */}
          <h2 className="text-xl font-bold text-foreground mb-1">
            {greeting},{" "}
            <span className="text-primary">{firstName}.</span>
          </h2>

          {/* Context line */}
          {journeyTitle && remaining > 0 ? (
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Voce esta no caminho para completar sua jornada {journeyTitle}.{" "}
              {remaining} {remaining === 1 ? "habito restante" : "habitos restantes"}.
            </p>
          ) : remaining > 0 ? (
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              {remaining}{" "}
              {remaining === 1 ? "habito restante" : "habitos restantes"} para
              completar seu dia.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Todos os habitos concluidos. Voce arrasou!
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col items-center gap-2.5 mt-5 w-full max-w-[240px]">
            {remaining > 0 && (
              <Button
                onClick={() => navigate("/session")}
                className="w-full h-11 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-semibold text-sm border-0"
                style={{
                  boxShadow: "0 4px 20px rgba(163, 230, 53, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
                }}
              >
                Resumir Sessao
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate("/progress")}
              className="w-full h-10 rounded-full border-border/60 text-foreground font-medium text-sm hover:bg-accent/10"
            >
              Ver meu progresso
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
