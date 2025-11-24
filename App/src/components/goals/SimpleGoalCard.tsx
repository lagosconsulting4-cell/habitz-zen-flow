/**
 * SimpleGoalCard - Meta com sugestões rápidas
 *
 * Usado para hábitos com meta única e sugestões predefinidas:
 * - Meditar (5/10/20 min)
 * - Ler (20/30/50 páginas)
 * - Alongamento (5/10/15 min)
 *
 * Features:
 * - Input numérico
 * - 3 botões de sugestão rápida
 * - Help text contextual
 * - Validação com warnings
 */

import React, { useEffect } from "react";
import { Target, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { HabitGoalConfig } from "@/data/habit-goal-configs";
import { getUnitLabel, formatGoalValue, validateGoalValue } from "@/data/habit-goal-configs";

interface SimpleGoalCardProps {
  config: HabitGoalConfig;
  habitId: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export const SimpleGoalCard: React.FC<SimpleGoalCardProps> = ({
  config,
  habitId,
  value,
  onChange,
}) => {
  const unitLabel = getUnitLabel(config.primaryUnit, config);
  const validation = value !== undefined ? validateGoalValue(value, habitId) : { isValid: true };

  // Auto-apply default value on mount if not set
  useEffect(() => {
    if (value === undefined && config.defaultValue !== undefined) {
      onChange(config.defaultValue);
    }
  }, []);

  const handleSuggestionClick = (suggestedValue: number) => {
    onChange(suggestedValue);
  };

  return (
    <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10">
            <Target className="h-6 w-6 text-lime-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              META
            </p>
            <p className="text-base font-semibold text-white">
              {value ? formatGoalValue(value, config.primaryUnit, config) : "Definir meta"}
            </p>
          </div>
        </div>
        {config.emoji && (
          <span className="text-2xl">{config.emoji}</span>
        )}
      </div>

      {/* Body */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
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
            className="w-full rounded-xl bg-black/30 border-white/10 text-white placeholder:text-white/30 focus:border-lime-400/50 pr-16"
            placeholder={`Ex: ${config.defaultValue || 10}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none">
            {unitLabel}
          </div>
        </div>

        {/* Suggestions */}
        {config.suggestions && (
          <div className="grid grid-cols-3 gap-2">
            {config.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
                  value === suggestion
                    ? "bg-lime-400 text-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
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
            <p className="text-xs text-white/60 leading-relaxed">
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
