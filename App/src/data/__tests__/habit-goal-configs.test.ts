/**
 * Testes para validação da estrutura de configuração de metas
 */

import {
  HABIT_GOAL_CONFIGS,
  getGoalConfig,
  hasNumericGoal,
  getUnitLabel,
  formatGoalValue,
  validateGoalValue,
  getConfigStats,
  type HabitGoalConfig,
} from "../habit-goal-configs";

describe("HABIT_GOAL_CONFIGS", () => {
  it("deve ter exatamente 44 configurações de hábitos", () => {
    const count = Object.keys(HABIT_GOAL_CONFIGS).length;
    expect(count).toBe(44);
  });

  it("todas as configs devem ter level e primaryUnit definidos", () => {
    Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
      expect(config.level).toBeDefined();
      expect(config.primaryUnit).toBeDefined();
      expect(["binary", "simple", "advanced"]).toContain(config.level);
    });
  });

  it("configs level=binary devem ter primaryUnit=none", () => {
    Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
      if (config.level === "binary") {
        expect(config.primaryUnit).toBe("none");
      }
    });
  });

  it("configs level=simple devem ter suggestions definidas", () => {
    Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
      if (config.level === "simple") {
        expect(config.suggestions).toBeDefined();
        expect(config.suggestions).toHaveLength(3);
        expect(config.defaultValue).toBeDefined();
      }
    });
  });

  it("configs level=advanced devem ter alternativeUnits", () => {
    Object.entries(HABIT_GOAL_CONFIGS).forEach(([id, config]) => {
      if (config.level === "advanced") {
        expect(config.alternativeUnits).toBeDefined();
        expect(config.alternativeUnits!.length).toBeGreaterThan(0);
      }
    });
  });
});

describe("getGoalConfig", () => {
  it("deve retornar config para hábito válido", () => {
    const config = getGoalConfig("meditate");
    expect(config).toBeDefined();
    expect(config?.level).toBe("simple");
    expect(config?.primaryUnit).toBe("minutes");
  });

  it("deve retornar undefined para hábito inexistente", () => {
    const config = getGoalConfig("nonexistent_habit");
    expect(config).toBeUndefined();
  });
});

describe("hasNumericGoal", () => {
  it("deve retornar false para hábitos binários", () => {
    expect(hasNumericGoal("wake_early")).toBe(false);
    expect(hasNumericGoal("make_bed")).toBe(false);
  });

  it("deve retornar true para hábitos com meta numérica", () => {
    expect(hasNumericGoal("meditate")).toBe(true);
    expect(hasNumericGoal("walk_run")).toBe(true);
  });
});

describe("getUnitLabel", () => {
  it("deve retornar labels padrão corretos", () => {
    expect(getUnitLabel("minutes")).toBe("min");
    expect(getUnitLabel("steps")).toBe("passos");
    expect(getUnitLabel("liters")).toBe("L");
    expect(getUnitLabel("pages")).toBe("páginas");
  });

  it("deve usar unitLabel customizado quando disponível", () => {
    const config = getGoalConfig("climb_stairs");
    expect(getUnitLabel("flights", config)).toBe("lances");
  });
});

describe("formatGoalValue", () => {
  it("deve formatar valores corretamente", () => {
    expect(formatGoalValue(10, "minutes")).toBe("10 min");
    expect(formatGoalValue(2, "liters")).toBe("2 L");
    expect(formatGoalValue(10000, "steps")).toBe("10000 passos");
  });

  it("deve retornar string vazia para unit=none", () => {
    expect(formatGoalValue(1, "none")).toBe("");
  });

  it("deve usar label customizado", () => {
    const config = getGoalConfig("eat_fruits");
    expect(formatGoalValue(3, "portions", config)).toBe("3 porções");
  });
});

describe("validateGoalValue", () => {
  it("deve validar valores dentro do range", () => {
    const result = validateGoalValue(10, "meditate");
    expect(result.isValid).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it("deve retornar warning para valores muito baixos", () => {
    const result = validateGoalValue(2, "meditate");
    expect(result.isValid).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it("deve retornar warning para valores muito altos", () => {
    const result = validateGoalValue(90, "meditate");
    expect(result.isValid).toBe(true);
    expect(result.warning).toBeDefined();
  });

  it("deve invalidar valores fora do range min/max", () => {
    const result = validateGoalValue(200, "meditate");
    expect(result.isValid).toBe(false);
    expect(result.warning).toBeDefined();
  });
});

describe("getConfigStats", () => {
  it("deve retornar estatísticas corretas", () => {
    const stats = getConfigStats();

    expect(stats.total).toBe(44);
    expect(stats.binary + stats.simple + stats.advanced).toBe(44);
    expect(stats.binary).toBeGreaterThan(0);
    expect(stats.simple).toBeGreaterThan(0);
    expect(stats.advanced).toBeGreaterThan(0);
  });

  it("deve contar features corretamente", () => {
    const stats = getConfigStats();

    expect(stats.withSuggestions).toBeGreaterThan(20); // maioria dos simple + advanced
    expect(stats.withHelpText).toBe(44); // todos devem ter
    expect(stats.withValidation).toBeGreaterThan(25); // maioria dos numéricos
  });
});

// Testes específicos para hábitos conhecidos
describe("Configurações Específicas", () => {
  describe("walk_run (advanced)", () => {
    const config = getGoalConfig("walk_run");

    it("deve ter configuração avançada com múltiplas unidades", () => {
      expect(config?.level).toBe("advanced");
      expect(config?.primaryUnit).toBe("steps");
      expect(config?.alternativeUnits).toContain("km");
      expect(config?.alternativeUnits).toContain("minutes");
    });

    it("deve ter valor padrão de 10000 passos", () => {
      expect(config?.defaultValue).toBe(10000);
    });
  });

  describe("meditate (simple)", () => {
    const config = getGoalConfig("meditate");

    it("deve ter configuração simples com 3 sugestões", () => {
      expect(config?.level).toBe("simple");
      expect(config?.suggestions).toEqual([5, 10, 20]);
    });

    it("deve ter validação com warnings", () => {
      expect(config?.validation?.warnBelow).toBe(3);
      expect(config?.validation?.warnAbove).toBe(60);
    });
  });

  describe("wake_early (binary)", () => {
    const config = getGoalConfig("wake_early");

    it("deve ser hábito binário sem meta numérica", () => {
      expect(config?.level).toBe("binary");
      expect(config?.primaryUnit).toBe("none");
      expect(config?.suggestions).toBeUndefined();
    });
  });

  describe("eat_fruits (custom label)", () => {
    const config = getGoalConfig("eat_fruits");

    it("deve ter label customizado 'porções'", () => {
      expect(config?.unitLabel).toBe("porções");
      expect(getUnitLabel("portions", config)).toBe("porções");
    });
  });
});
