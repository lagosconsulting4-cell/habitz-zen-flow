import { cn } from "@/lib/utils";
import { Check, Flame, Sun, Moon } from "lucide-react";
import { HabitGlyph } from "@/components/icons/HabitGlyph";

interface ThemeMockupProps {
  theme: "light" | "dark";
  className?: string;
}

/**
 * Mini-dashboard renderizado em tempo real para preview de cada tema
 * Usa cores CSS variables para aplicar o tema correto
 */
export const ThemeMockup = ({ theme, className }: ThemeMockupProps) => {
  const isDark = theme === "dark";

  // Cores baseadas no tema
  const colors = {
    background: isDark ? "#000000" : "#FAFAFA",
    card: isDark ? "#0A0A0A" : "#FFFFFF",
    foreground: isDark ? "#FFFFFF" : "#1A1A1A",
    muted: isDark ? "#A3A3A3" : "#737373",
    border: isDark ? "#262626" : "#E5E5E5",
    primary: isDark ? "#A3E635" : "#65A30D",
    primaryForeground: isDark ? "#000000" : "#FFFFFF",
  };

  // Hábitos de exemplo com iconKey do HabitGlyph
  const mockHabits = [
    { iconKey: "sunrise", name: "Acordar cedo", color: "#F59E0B", completed: true },
    { iconKey: "droplets", name: "Beber água", color: "#3B82F6", completed: true },
    { iconKey: "active", name: "Exercício", color: "#EF4444", completed: false },
    { iconKey: "book-open", name: "Leitura", color: "#8B5CF6", completed: false },
  ];

  return (
    <div
      className={cn("rounded-2xl overflow-hidden shadow-xl", className)}
      style={{
        backgroundColor: colors.background,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-2">
          <img
            src="/favicon.svg"
            alt="Bora"
            className="w-8 h-8 rounded-lg"
          />
        </div>

        {/* Theme indicator */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: isDark ? "#262626" : "#F5F5F5" }}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5" style={{ color: colors.primary }} />
          ) : (
            <Sun className="w-3.5 h-3.5" style={{ color: colors.primary }} />
          )}
        </div>
      </div>

      {/* Progress section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium"
            style={{ color: colors.muted }}
          >
            Progresso de hoje
          </span>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
            <span
              className="text-xs font-bold"
              style={{ color: colors.foreground }}
            >
              7
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: isDark ? "#262626" : "#E5E5E5" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              backgroundColor: colors.primary,
              width: "50%",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span
            className="text-[10px]"
            style={{ color: colors.muted }}
          >
            2 de 4 hábitos
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: colors.primary }}
          >
            50%
          </span>
        </div>
      </div>

      {/* Habits list */}
      <div className="px-4 pb-4 space-y-2">
        {mockHabits.map((habit, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              <HabitGlyph
                iconKey={habit.iconKey}
                size="sm"
                tone="inherit"
                style={{ color: habit.color }}
              />
            </div>

            {/* Name */}
            <span
              className="flex-1 text-xs font-medium truncate"
              style={{ color: colors.foreground }}
            >
              {habit.name}
            </span>

            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: habit.completed ? colors.primary : "transparent",
                border: habit.completed ? "none" : `2px solid ${colors.border}`,
              }}
            >
              {habit.completed && (
                <Check
                  className="w-3 h-3"
                  style={{ color: colors.primaryForeground }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom label */}
      <div
        className="px-4 py-2 text-center"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <span
          className="text-[10px] uppercase tracking-wider font-medium"
          style={{ color: colors.muted }}
        >
          {isDark ? "Tema Escuro" : "Tema Claro"}
        </span>
      </div>
    </div>
  );
};

export default ThemeMockup;
