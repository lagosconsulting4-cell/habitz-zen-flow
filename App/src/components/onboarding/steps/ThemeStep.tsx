import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useOnboarding } from "../OnboardingProvider";
import { useTheme } from "@/hooks/useTheme";
import { Compare } from "@/components/ui/compare";
import { ThemeMockup } from "../ThemeMockup";
import { Palette, Sun, Moon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark";

const THEME_OPTIONS: Array<{
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
  description: string;
}> = [
  {
    value: "dark",
    label: "Escuro",
    icon: Moon,
    description: "Confortável para os olhos",
  },
  {
    value: "light",
    label: "Claro",
    icon: Sun,
    description: "Visual clean e luminoso",
  },
];

export const ThemeStep = () => {
  const { themePreference, setThemePreference } = useOnboarding();
  const { setTheme, resolvedTheme } = useTheme();
  const [sliderPosition, setSliderPosition] = useState(50);

  // Sincronizar tema selecionado com o sistema
  // Aplica tema OPOSTO para criar contraste visual com o mockup
  useEffect(() => {
    if (themePreference) {
      setTheme(themePreference === "dark" ? "light" : "dark");
    }
  }, [themePreference, setTheme]);

  // Determinar tema baseado na posição do slider
  useEffect(() => {
    if (sliderPosition < 40) {
      // Mais para a esquerda = tema escuro
      if (themePreference !== "dark") {
        setThemePreference("dark");
      }
    } else if (sliderPosition > 60) {
      // Mais para a direita = tema claro
      if (themePreference !== "light") {
        setThemePreference("light");
      }
    }
  }, [sliderPosition, themePreference, setThemePreference]);

  const handleThemeSelect = (theme: ThemeOption) => {
    setThemePreference(theme);
    // Ajustar slider para refletir a escolha
    if (theme === "dark") {
      setSliderPosition(20);
    } else {
      setSliderPosition(80);
    }
  };

  return (
    <div className="flex flex-col min-h-[500px] px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Palette className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Escolha seu tema</h2>

        <p className="text-muted-foreground max-w-md mx-auto">
          Arraste para comparar ou selecione abaixo
        </p>
      </motion.div>

      {/* Compare Component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex justify-center mb-6"
      >
        <Compare
          firstContent={<ThemeMockup theme="dark" />}
          secondContent={<ThemeMockup theme="light" />}
          slideMode="drag"
          initialSliderPercentage={50}
          showHandlebar={true}
          className="w-full max-w-sm h-[320px] rounded-2xl border border-border shadow-lg"
          onSliderChange={setSliderPosition}
        />
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center text-sm text-muted-foreground mb-6"
      >
        ← Arraste para comparar os temas →
      </motion.p>

      {/* Theme Selection Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
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
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[100px]",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isSelected ? "bg-primary" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
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
