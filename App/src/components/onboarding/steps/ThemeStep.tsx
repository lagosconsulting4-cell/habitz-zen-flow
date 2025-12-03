import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { useTheme } from "@/hooks/useTheme";
import { Compare } from "@/components/ui/compare";
import { ThemeMockup } from "../ThemeMockup";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark";

const THEME_OPTIONS: Array<{
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "light", label: "Claro", icon: Sun },
];

export const ThemeStep = () => {
  const { themePreference, setThemePreference } = useOnboarding();
  const { setTheme } = useTheme();
  const [sliderPosition, setSliderPosition] = useState(50);

  // Sincronizar tema selecionado com o sistema
  useEffect(() => {
    if (themePreference) {
      setTheme(themePreference);
    }
  }, [themePreference, setTheme]);

  // Determinar tema baseado na posição do slider
  useEffect(() => {
    if (sliderPosition < 40) {
      if (themePreference !== "dark") {
        setThemePreference("dark");
      }
    } else if (sliderPosition > 60) {
      if (themePreference !== "light") {
        setThemePreference("light");
      }
    }
  }, [sliderPosition, themePreference, setThemePreference]);

  const handleThemeSelect = (theme: ThemeOption) => {
    setThemePreference(theme);
    if (theme === "dark") {
      setSliderPosition(20);
    } else {
      setSliderPosition(80);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-3"
      >
        <h2 className="text-2xl font-bold mb-1">Escolha seu tema</h2>
        <p className="text-sm text-muted-foreground">
          Arraste para comparar
        </p>
      </motion.div>

      {/* Compare Component - Reduced height */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex justify-center mb-3"
      >
        <Compare
          firstContent={<ThemeMockup theme="light" />}
          secondContent={<ThemeMockup theme="dark" />}
          slideMode="drag"
          initialSliderPercentage={50}
          showHandlebar={true}
          className="w-full max-w-xs h-[200px] rounded-xl border border-border shadow-lg"
          onSliderChange={setSliderPosition}
        />
      </motion.div>

      {/* Theme Selection Buttons - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex justify-center gap-3"
      >
        {THEME_OPTIONS.map((option) => {
          const isSelected = themePreference === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              onClick={() => handleThemeSelect(option.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                "active:scale-95",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isSelected ? "bg-primary" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
