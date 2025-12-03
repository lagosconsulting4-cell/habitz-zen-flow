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
  // Cores adaptativas baseadas no tema com bom contraste
  const cardClass = isDarkMode
    ? "border-white/10 bg-white/5"
    : "border-slate-200 bg-lime-50"; // Fundo lime claro no light mode

  const iconClass = isDarkMode ? "text-lime-400" : "text-lime-600"; // Lime-600 visível no light
  const titleClass = isDarkMode ? "text-white/80" : "text-slate-700"; // Slate-700 para contraste
  const helpTextClass = isDarkMode ? "text-white/50" : "text-slate-500"; // Slate-500 para texto secundário

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
