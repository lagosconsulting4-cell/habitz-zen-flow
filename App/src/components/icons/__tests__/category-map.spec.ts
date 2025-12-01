import { describe, it, expect } from "vitest";

import { CATEGORY_DATA } from "@/pages/CreateHabit";
import { CATEGORY_ICON_MAP, HabitIcons, DEFAULT_HABIT_ICON } from "@/components/icons/HabitIcons";

describe("CATEGORY_ICON_MAP coverage", () => {
  const categoryIds = new Set(CATEGORY_DATA.map((c) => c.id));
  it("mapeia todas as categorias principais", () => {
    categoryIds.forEach((id) => {
      expect(CATEGORY_ICON_MAP[id], `Categoria ${id} precisa de fallback`).toBeDefined();
    });
  });

  it("usa apenas ícones registrados", () => {
    Object.entries(CATEGORY_ICON_MAP).forEach(([key, iconKey]) => {
      expect(
        iconKey === DEFAULT_HABIT_ICON || HabitIcons[iconKey as keyof typeof HabitIcons],
        `Categoria ${key} aponta para ícone inexistente (${iconKey})`
      ).toBeTruthy();
    });
  });
});
