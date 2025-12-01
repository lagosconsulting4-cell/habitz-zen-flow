/**
 * BinaryGoalCard - Para hábitos sem meta numérica
 *
 * Usado para hábitos de confirmação simples (sim/não) como:
 * - Acordar Cedo
 * - Fazer a Cama
 * - Tomar Vitaminas
 *
 * Não renderiza card de meta, apenas exibe mensagem informativa.
 */

import React from "react";
import { Info } from "lucide-react";
import type { HabitGoalConfig } from "@/data/habit-goal-configs";

interface BinaryGoalCardProps {
  config: HabitGoalConfig;
  isDarkMode?: boolean;
}

export const BinaryGoalCard: React.FC<BinaryGoalCardProps> = ({ config, isDarkMode = true }) => {
  // Cores adaptativas baseadas no tema
  const cardClass = isDarkMode
    ? "border-white/10 bg-white/5"
    : "border-white/20 bg-black/10";

  const iconClass = isDarkMode ? "text-lime-400" : "text-white";
  const titleClass = isDarkMode ? "text-white/80" : "text-white";
  const helpTextClass = isDarkMode ? "text-white/50" : "text-white/70";

  return (
    <div className={`mx-4 rounded-2xl border px-4 py-4 ${cardClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Info className={`h-5 w-5 ${iconClass}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${titleClass}`}>
            Hábito de confirmação
          </p>
          {config.helpText && (
            <p className={`mt-1.5 text-xs leading-relaxed ${helpTextClass}`}>
              {config.helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
