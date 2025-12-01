/**
 * AdvancedGoalCard - Meta com múltiplas unidades
 *
 * Usado para hábitos que podem ser medidos de diferentes formas:
 * - Caminhar (passos/km/minutos)
 * - Journaling (minutos/páginas)
 * - Estudar (horas/minutos)
 *
 * Features:
 * - Seletor de unidade (tabs)
 * - Input numérico
 * - 3 sugestões por unidade
 * - Help text contextual
 * - Validação
 */

import React, { useEffect } from "react";
import { Target, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { HabitGoalConfig, GoalUnit } from "@/data/habit-goal-configs";
import { getUnitLabel, formatGoalValue, validateGoalValue } from "@/data/habit-goal-configs";

interface AdvancedGoalCardProps {
  config: HabitGoalConfig;
  habitId: string;
  value: number | undefined;
  unit: GoalUnit;
  onChange: (value: number | undefined) => void;
  onUnitChange: (unit: GoalUnit) => void;
  isDarkMode?: boolean;
}

export const AdvancedGoalCard: React.FC<AdvancedGoalCardProps> = ({
  config,
  habitId,
  value,
  unit,
  onChange,
  onUnitChange,
  isDarkMode = true,
}) => {
  const currentUnit = unit || config.primaryUnit;
  const unitLabel = getUnitLabel(currentUnit, config);
  const validation = value !== undefined ? validateGoalValue(value, habitId) : { isValid: true };

  // Available units: primary + alternatives
  const availableUnits = [
    config.primaryUnit,
    ...(config.alternativeUnits || []),
  ];

  // Auto-apply default value on mount if not set
  useEffect(() => {
    if (value === undefined && config.defaultValue !== undefined) {
      onChange(config.defaultValue);
    }
    if (!unit || unit === "none") {
      onUnitChange(config.primaryUnit);
    }
  }, []);

  const handleSuggestionClick = (suggestedValue: number) => {
    onChange(suggestedValue);
  };

  const handleUnitChange = (newUnit: GoalUnit) => {
    onUnitChange(newUnit);
    // Reset value when changing unit
    if (config.defaultValue !== undefined) {
      onChange(config.defaultValue);
    }
  };

  // Cores adaptativas baseadas no tema
  const cardClass = isDarkMode
    ? "border-white/10 bg-white/5"
    : "border-white/20 bg-black/10";
  const iconBgClass = isDarkMode ? "bg-lime-400/10" : "bg-white/20";
  const iconClass = isDarkMode ? "text-lime-400" : "text-white";
  const labelClass = isDarkMode ? "text-white/40" : "text-white/70";
  const valueClass = isDarkMode ? "text-white" : "text-white";
  const borderClass = isDarkMode ? "border-white/10" : "border-white/20";
  const inputClass = isDarkMode
    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50"
    : "bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50";
  const unitLabelClass = isDarkMode ? "text-white/50" : "text-white/70";
  const buttonActiveClass = isDarkMode ? "bg-lime-400 text-black" : "bg-white text-primary";
  const buttonInactiveClass = isDarkMode
    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
    : "bg-black/10 text-white/80 hover:bg-black/15 hover:text-white";
  const helpTextClass = isDarkMode ? "text-white/50" : "text-white/70";

  return (
    <div className={`mx-4 overflow-hidden rounded-2xl border ${cardClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClass}`}>
            <Target className={`h-6 w-6 ${iconClass}`} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${labelClass}`}>
              META
            </p>
            <p className={`text-base font-semibold ${valueClass}`}>
              {value ? formatGoalValue(value, currentUnit, config) : "Definir meta"}
            </p>
          </div>
        </div>
        {config.emoji && (
          <span className="text-2xl">{config.emoji}</span>
        )}
      </div>

      {/* Body */}
      <div className={`border-t px-4 py-4 space-y-3 ${borderClass}`}>
        {/* Unit Selector */}
        {availableUnits.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {availableUnits.map((availableUnit) => {
              const isCurrentUnit = currentUnit === availableUnit;
              const label = getUnitLabel(availableUnit, config);

              return (
                <button
                  key={availableUnit}
                  type="button"
                  onClick={() => handleUnitChange(availableUnit)}
                  className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isCurrentUnit
                      ? buttonActiveClass
                      : buttonInactiveClass
                  }`}
                >
                  {label || availableUnit}
                </button>
              );
            })}
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <Input
            type="number"
            min={config.validation?.min || 0}
            max={config.validation?.max}
            value={value ?? ""}
            onChange={(e) =>
              onChange(e.target.value ? Number(e.target.value) : undefined)
            }
            className={`w-full rounded-xl pr-20 ${inputClass}`}
            placeholder={`Ex: ${config.defaultValue || 10}`}
          />
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${unitLabelClass}`}>
            {unitLabel}
          </div>
        </div>

        {/* Suggestions (specific to current unit) */}
        {config.suggestions && currentUnit === config.primaryUnit && (
          <div className="grid grid-cols-3 gap-2">
            {config.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                  value === suggestion
                    ? buttonActiveClass
                    : buttonInactiveClass
                }`}
              >
                {suggestion} {unitLabel}
              </button>
            ))}
          </div>
        )}

        {/* Help Text */}
        {config.helpText && (
          <div className="flex items-start gap-2 pt-1">
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-xs">💡</span>
            </div>
            <p className={`text-xs leading-relaxed ${helpTextClass}`}>
              {config.helpText}
            </p>
          </div>
        )}

        {/* Validation Warning */}
        {validation.warning && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200/90 leading-relaxed">
              {validation.warning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
