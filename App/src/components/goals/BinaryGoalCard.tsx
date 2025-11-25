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
}

export const BinaryGoalCard: React.FC<BinaryGoalCardProps> = ({ config }) => {
  return (
    <div className="mx-4 rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/80">
            Hábito de confirmação
          </p>
          {config.helpText && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {config.helpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
