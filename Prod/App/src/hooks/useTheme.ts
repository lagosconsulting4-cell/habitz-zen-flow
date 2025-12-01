import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

/**
 * Centraliza o controle de tema (light/dark/system) adicionando a classe
 * correspondente no <html>. Fornece `resolvedTheme` para compatibilidade com
 * chamadas anteriores de `next-themes`.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem("theme", theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const next = mediaQuery.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(next);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [resolvedTheme, theme]);

  return { theme, resolvedTheme, setTheme };
}
