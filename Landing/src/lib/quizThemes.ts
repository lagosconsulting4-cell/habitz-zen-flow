export type QuizTheme = "jade" | "aurora" | "chama" | "gelo";

export interface ThemeConfig {
  id: QuizTheme;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
  primaryDark: string;
  glow: string;
  cssClass: string;
  gradient: string;
}

export const QUIZ_THEMES: ThemeConfig[] = [
  {
    id: "jade",
    name: "Jade",
    emoji: "🍃",
    description: "Objetivo. Confiante.",
    primaryColor: "#a3e635",
    primaryDark: "#84cc16",
    glow: "rgba(163, 230, 53, 0.35)",
    cssClass: "quiz-theme-jade",
    gradient: "from-lime-500 to-lime-700",
  },
  {
    id: "aurora",
    name: "Aurora",
    emoji: "🔮",
    description: "Criativo. Profundo.",
    primaryColor: "#a78bfa",
    primaryDark: "#8b5cf6",
    glow: "rgba(167, 139, 250, 0.35)",
    cssClass: "quiz-theme-aurora",
    gradient: "from-violet-400 to-violet-700",
  },
  {
    id: "chama",
    name: "Chama",
    emoji: "🔥",
    description: "Intenso. Ousado.",
    primaryColor: "#fb923c",
    primaryDark: "#f97316",
    glow: "rgba(251, 146, 60, 0.35)",
    cssClass: "quiz-theme-chama",
    gradient: "from-orange-400 to-orange-700",
  },
  {
    id: "gelo",
    name: "Gelo",
    emoji: "❄️",
    description: "Focado. Sereno.",
    primaryColor: "#22d3ee",
    primaryDark: "#06b6d4",
    glow: "rgba(34, 211, 238, 0.35)",
    cssClass: "quiz-theme-gelo",
    gradient: "from-cyan-400 to-cyan-700",
  },
];

export const getThemeConfig = (id: QuizTheme): ThemeConfig =>
  QUIZ_THEMES.find((t) => t.id === id) ?? QUIZ_THEMES[0];
