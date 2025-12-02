import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitGlyph } from "@/components/icons/HabitGlyph";
import { HabitIcons, type HabitIconKey } from "@/components/icons/HabitIcons";
import type { RecommendedHabit } from "./OnboardingProvider";
import { cn } from "@/lib/utils";

interface CustomHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<RecommendedHabit, "id">) => void;
  weekDays: number[];
}

const CATEGORIES = [
  { value: "health", label: "Saúde" },
  { value: "mental", label: "Mindfulness" },
  { value: "productivity", label: "Produtividade" },
  { value: "routine", label: "Rotina" },
  { value: "avoid", label: "Evitar" },
];

const PERIODS = [
  { value: "morning" as const, label: "Manhã" },
  { value: "afternoon" as const, label: "Tarde" },
  { value: "evening" as const, label: "Noite" },
];

// Get all available icon keys
const ICON_KEYS = Object.keys(HabitIcons) as HabitIconKey[];

export const CustomHabitDialog = ({
  isOpen,
  onClose,
  onAdd,
  weekDays,
}: CustomHabitDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("health");
  const [iconKey, setIconKey] = useState<HabitIconKey>("activity_rings");
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">("morning");
  const [time, setTime] = useState("07:00");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAdd({
      template_id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      icon: "⭐",
      icon_key: iconKey,
      color: "bg-primary",
      period,
      suggested_time: time,
      frequency_days: weekDays,
      priority: 5,
      duration: 15,
      goal_value: 1,
      goal_unit: "none",
      frequency_type: "fixed_days",
    });

    // Reset form
    setName("");
    setCategory("health");
    setIconKey("activity_rings");
    setPeriod("morning");
    setTime("07:00");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 z-50 m-auto max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-card shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Criar Hábito Personalizado</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Hábito *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Praticar violão"
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ícone
                </label>
                <div className="flex gap-2">
                  <select
                    value={iconKey}
                    onChange={(e) => setIconKey(e.target.value as HabitIconKey)}
                    className="flex-1 px-4 py-2.5 rounded-xl border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  >
                    {ICON_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all",
                        category === cat.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Período do Dia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPeriod(p.value)}
                      className={cn(
                        "py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        period === p.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Horário Sugerido
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t bg-card">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 rounded-xl"
                disabled={!name.trim()}
              >
                Adicionar
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
