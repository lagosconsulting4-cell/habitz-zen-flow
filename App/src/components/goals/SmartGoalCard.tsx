/**
 * SmartGoalCard - Wrapper inteligente que escolhe a variante correta
 *
 * Decide automaticamente qual componente renderizar baseado no config.level:
 * - "binary" → BinaryGoalCard (sem meta)
 * - "simple" → SimpleGoalCard (sugestões rápidas)
 * - "advanced" → AdvancedGoalCard (múltiplas unidades)
 *
 * Usage:
 * ```tsx
 * <SmartGoalCard
 *   habitId="meditate"
 *   value={goalValue}
 *   unit={unit}
 *   onChange={setGoalValue}
 *   onUnitChange={setUnit}
 * />
 * ```
 */

import React from "react";
import { getGoalConfig } from "@/data/habit-goal-configs";
import type { GoalUnit } from "@/data/habit-goal-configs";
import { BinaryGoalCard } from "./BinaryGoalCard";
import { SimpleGoalCard } from "./SimpleGoalCard";
import { AdvancedGoalCard } from "./AdvancedGoalCard";

interface SmartGoalCardProps {
  /** ID do hábito (ex: "meditate", "walk_run") */
  habitId: string;

  /** Valor atual da meta */
  value?: number;

  /** Unidade atual (obrigatório para advanced) */
  unit?: GoalUnit;

  /** Callback quando valor muda */
  onChange: (value: number | undefined) => void;

  /** Callback quando unidade muda (apenas para advanced) */
  onUnitChange?: (unit: GoalUnit) => void;
}

export const SmartGoalCard: React.FC<SmartGoalCardProps> = ({
  habitId,
  value,
  unit = "none",
  onChange,
  onUnitChange,
}) => {
  const config = getGoalConfig(habitId);

  // Se não tem config, não renderiza nada
  if (!config) {
    console.warn(`[SmartGoalCard] Config not found for habitId: ${habitId}`);
    return null;
  }

  // Binary: apenas mensagem informativa
  if (config.level === "binary") {
    return <BinaryGoalCard config={config} />;
  }

  // Simple: sugestões rápidas
  if (config.level === "simple") {
    return (
      <SimpleGoalCard
        config={config}
        habitId={habitId}
        value={value}
        onChange={onChange}
      />
    );
  }

  // Advanced: múltiplas unidades
  if (config.level === "advanced") {
    if (!onUnitChange) {
      console.error(`[SmartGoalCard] onUnitChange is required for advanced habit: ${habitId}`);
      return null;
    }

    return (
      <AdvancedGoalCard
        config={config}
        habitId={habitId}
        value={value}
        unit={unit}
        onChange={onChange}
        onUnitChange={onUnitChange}
      />
    );
  }

  // Fallback
  return null;
};
