/**
 * Sistema de Metas Inteligentes por Hábito
 *
 * Este arquivo define configurações específicas de metas para cada hábito,
 * permitindo uma experiência personalizada e guidance clara para o usuário.
 *
 * @see Doc/Estrategia_Metas_Inteligentes.md para documentação completa
 */

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Unidades disponíveis para metas de hábitos
 */
export type GoalUnit =
  | "none"        // Hábito binário (sim/não)
  | "steps"       // Passos
  | "minutes"     // Minutos
  | "hours"       // Horas
  | "km"          // Quilômetros
  | "pages"       // Páginas
  | "liters"      // Litros
  | "portions"    // Porções (frutas, vegetais, proteína)
  | "flights"     // Lances de escada
  | "calories"    // Calorias
  | "pomodoros"   // Sessões Pomodoro
  | "breaks"      // Pausas
  | "meals"       // Refeições
  | "ml"          // Mililitros
  | "grams"       // Gramas
  | "custom";     // Valor customizado sem unidade específica

/**
 * Nível de complexidade da configuração de meta
 */
export type GoalLevel =
  | "binary"      // Apenas sim/não (sem meta numérica)
  | "simple"      // Meta com sugestões rápidas
  | "advanced";   // Múltiplas unidades com conversão

/**
 * Configuração completa de meta para um hábito
 */
export interface HabitGoalConfig {
  /** Nível de complexidade da UX */
  level: GoalLevel;

  /** Unidade principal */
  primaryUnit: GoalUnit;

  /** Unidades alternativas disponíveis (apenas para level=advanced) */
  alternativeUnits?: GoalUnit[];

  /** Valor padrão sugerido */
  defaultValue?: number;

  /** Sugestões rápidas (3 valores) */
  suggestions?: [number, number, number];

  /** Texto de ajuda contextual */
  helpText?: string;

  /** Label customizada para a unidade (ex: "porções" em vez de "custom") */
  unitLabel?: string;

  /** Ícone/emoji para contexto visual */
  emoji?: string;

  /** Validação de valores */
  validation?: {
    min: number;
    max: number;
    warnBelow?: number;    // Aviso se valor abaixo deste
    warnAbove?: number;    // Aviso se valor acima deste
    warningTextBelow?: string;
    warningTextAbove?: string;
  };
}

// ============================================================================
// CONFIGURAÇÕES POR HÁBITO
// ============================================================================

export const HABIT_GOAL_CONFIGS: Record<string, HabitGoalConfig> = {

  // ==========================================================================
  // PRODUTIVIDADE (10 hábitos)
  // ==========================================================================

  wake_early: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Estabeleça um horário fixo para acordar",
  },

  make_bed: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Comece o dia com uma pequena vitória",
  },

  plan_day: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 10,
    suggestions: [5, 10, 15],
    emoji: "📋",
    helpText: "Tempo recomendado: 5-15 minutos de planejamento diário",
    validation: {
      min: 1,
      max: 60,
      warnAbove: 30,
      warningTextAbove: "Mais de 30 minutos pode ser excessivo para planejamento diário",
    },
  },

  review_goals: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 15,
    suggestions: [10, 15, 30],
    emoji: "🎯",
    helpText: "Reflexão semanal profunda sobre objetivos",
    validation: {
      min: 5,
      max: 120,
    },
  },

  journaling: {
    level: "advanced",
    primaryUnit: "minutes",
    alternativeUnits: ["pages", "none"],
    defaultValue: 10,
    suggestions: [10, 20, 30],
    emoji: "📝",
    helpText: "Escrita reflexiva: 10-20 min ou 1-2 páginas",
    validation: {
      min: 1,
      max: 60,
    },
  },

  read_books: {
    level: "advanced",
    primaryUnit: "pages",
    alternativeUnits: ["minutes", "hours"],
    defaultValue: 30,
    suggestions: [20, 30, 50],
    emoji: "📚",
    helpText: "Meta popular: 20-50 páginas/dia (ou 30-60 minutos)",
    validation: {
      min: 1,
      max: 200,
      warnAbove: 100,
      warningTextAbove: "Mais de 100 páginas/dia é bem ambicioso!",
    },
  },

  meditate: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 10,
    suggestions: [5, 10, 20],
    emoji: "🧘",
    helpText: "Iniciantes: 5-10 min • Intermediário: 15-20 min • Avançado: 30+ min",
    validation: {
      min: 1,
      max: 120,
      warnBelow: 3,
      warnAbove: 60,
      warningTextBelow: "Menos de 3 minutos pode ser desafiador para meditação profunda",
      warningTextAbove: "Mais de 1 hora é para praticantes muito avançados",
    },
  },

  study: {
    level: "advanced",
    primaryUnit: "hours",
    alternativeUnits: ["minutes"],
    defaultValue: 1,
    suggestions: [1, 2, 3],
    emoji: "📖",
    helpText: "Estudo focado: 1-3 horas/dia em blocos de 45-90 minutos",
    validation: {
      min: 15,  // minutos
      max: 480, // 8 horas
      warnAbove: 240,
      warningTextAbove: "Mais de 4 horas pode causar fadiga mental",
    },
  },

  organize_space: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 15,
    suggestions: [10, 15, 30],
    emoji: "🧹",
    helpText: "Organização diária: 10-20 minutos mantém o ambiente limpo",
    validation: {
      min: 5,
      max: 120,
    },
  },

  task_list: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Planeje suas tarefas do dia pela manhã",
  },

  // ==========================================================================
  // SAÚDE/FITNESS (14 hábitos)
  // ==========================================================================

  walk_run: {
    level: "advanced",
    primaryUnit: "steps",
    alternativeUnits: ["km", "minutes"],
    defaultValue: 10000,
    suggestions: [7500, 10000, 15000],
    emoji: "🚶",
    helpText: "OMS recomenda 10,000 passos/dia (≈ 7 km ou 90 min)",
    validation: {
      min: 1000,
      max: 50000,
      warnBelow: 5000,
      warnAbove: 30000,
      warningTextBelow: "OMS recomenda mínimo de 7,000-10,000 passos",
      warningTextAbove: "Meta muito ambiciosa! Certifique-se de progredir gradualmente",
    },
  },

  cycle: {
    level: "advanced",
    primaryUnit: "minutes",
    alternativeUnits: ["km"],
    defaultValue: 30,
    suggestions: [20, 30, 45],
    emoji: "🚴",
    helpText: "Cardio moderado: 20-40 minutos por sessão",
    validation: {
      min: 10,
      max: 180,
    },
  },

  swim: {
    level: "advanced",
    primaryUnit: "minutes",
    alternativeUnits: ["km"],
    defaultValue: 30,
    suggestions: [20, 30, 45],
    emoji: "🏊",
    helpText: "Treino completo de corpo: 30-45 minutos",
    validation: {
      min: 10,
      max: 120,
    },
  },

  mindful_minutes: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 10,
    suggestions: [5, 10, 15],
    emoji: "🧠",
    helpText: "Apple Health: Minutos de Atenção Plena",
    validation: {
      min: 1,
      max: 60,
    },
  },

  climb_stairs: {
    level: "simple",
    primaryUnit: "flights",
    unitLabel: "lances",
    defaultValue: 10,
    suggestions: [5, 10, 20],
    emoji: "🪜",
    helpText: "Equivalente: 10-20 andares/dia • 1 lance ≈ 10-15 degraus",
    validation: {
      min: 1,
      max: 100,
    },
  },

  activity_rings: {
    level: "binary",
    primaryUnit: "none",
    emoji: "⭕",
    helpText: "Apple Watch: Fechar anéis Move, Exercise e Stand",
  },

  stand_hours: {
    level: "simple",
    primaryUnit: "custom",
    unitLabel: "horas",
    defaultValue: 12,
    suggestions: [8, 12, 14],
    emoji: "🕐",
    helpText: "Apple Health recomenda 12 horas em pé por dia",
    validation: {
      min: 1,
      max: 18,
    },
  },

  exercise_minutes: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 30,
    suggestions: [20, 30, 45],
    emoji: "💪",
    helpText: "Apple Health meta: 30 minutos de exercício/dia",
    validation: {
      min: 10,
      max: 180,
    },
  },

  burn_calories: {
    level: "simple",
    primaryUnit: "calories",
    unitLabel: "calorias",
    defaultValue: 500,
    suggestions: [300, 500, 700],
    emoji: "🔥",
    helpText: "Déficit saudável: 300-600 kcal/dia para perda de peso gradual",
    validation: {
      min: 100,
      max: 2000,
      warnAbove: 1000,
      warningTextAbove: "Déficit muito alto pode afetar metabolismo",
    },
  },

  stretching: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 10,
    suggestions: [5, 10, 15],
    emoji: "🤸",
    helpText: "Flexibilidade: 10-15 minutos diários",
    validation: {
      min: 5,
      max: 60,
    },
  },

  yoga: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 20,
    suggestions: [20, 30, 60],
    emoji: "🧘‍♀️",
    helpText: "Sessão curta: 20-30 min • Sessão longa: 60-90 min",
    validation: {
      min: 10,
      max: 180,
    },
  },

  strength_training: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 45,
    suggestions: [30, 45, 60],
    emoji: "🏋️",
    helpText: "Hipertrofia: 45-60 min, 3-4x/semana",
    validation: {
      min: 20,
      max: 120,
    },
  },

  drink_water: {
    level: "advanced",
    primaryUnit: "liters",
    alternativeUnits: ["ml"],
    defaultValue: 2,
    suggestions: [1.5, 2, 2.5],
    emoji: "💧",
    helpText: "Hidratação adequada: 2-3 litros/dia (8-12 copos)",
    validation: {
      min: 0.5,
      max: 5,
      warnAbove: 4,
      warningTextAbove: "Mais de 4 litros pode ser excessivo para maioria das pessoas",
    },
  },

  sleep_8h: {
    level: "simple",
    primaryUnit: "hours",
    defaultValue: 8,
    suggestions: [7, 8, 9],
    emoji: "😴",
    helpText: "Sono reparador: 7-9 horas/noite",
    validation: {
      min: 4,
      max: 12,
      warnBelow: 6,
      warnAbove: 10,
      warningTextBelow: "Menos de 6 horas afeta saúde e cognição",
      warningTextAbove: "Mais de 10 horas pode indicar problemas de saúde",
    },
  },

  // ==========================================================================
  // ALIMENTAÇÃO (9 hábitos)
  // ==========================================================================

  healthy_breakfast: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Café da manhã nutritivo para começar bem o dia",
  },

  eat_fruits: {
    level: "simple",
    primaryUnit: "portions",
    unitLabel: "porções",
    defaultValue: 2,
    suggestions: [2, 3, 4],
    emoji: "🍎",
    helpText: "Recomendado: 2-3 porções/dia • 1 porção ≈ 1 fruta média",
    validation: {
      min: 1,
      max: 10,
    },
  },

  eat_vegetables: {
    level: "simple",
    primaryUnit: "portions",
    unitLabel: "porções",
    defaultValue: 3,
    suggestions: [3, 4, 5],
    emoji: "🥗",
    helpText: "OMS: mínimo 400g = 5 porções/dia • 1 porção ≈ 80g",
    validation: {
      min: 1,
      max: 10,
    },
  },

  drink_water_2l: {
    level: "advanced",
    primaryUnit: "liters",
    alternativeUnits: ["ml"],
    defaultValue: 2,
    suggestions: [1.5, 2, 2.5],
    emoji: "💧",
    helpText: "Hidratação adequada: 2-3 litros/dia",
    validation: {
      min: 0.5,
      max: 5,
    },
  },

  avoid_sugar: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Evite açúcares adicionados e processados",
  },

  meal_prep: {
    level: "simple",
    primaryUnit: "meals",
    unitLabel: "refeições",
    defaultValue: 3,
    suggestions: [3, 5, 7],
    emoji: "🍱",
    helpText: "Meal prep semanal: 5-10 refeições preparadas",
    validation: {
      min: 1,
      max: 21,
    },
  },

  eat_protein: {
    level: "advanced",
    primaryUnit: "portions",
    unitLabel: "porções",
    alternativeUnits: ["grams"],
    defaultValue: 3,
    suggestions: [2, 3, 4],
    emoji: "🥩",
    helpText: "Distribuição: 20-30g por refeição (≈ 1 porção)",
    validation: {
      min: 1,
      max: 10,
    },
  },

  take_vitamins: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Suplementação conforme orientação médica",
  },

  avoid_fast_food: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Priorize alimentação caseira e nutritiva",
  },

  // ==========================================================================
  // TEMPO/ROTINA (8 hábitos)
  // ==========================================================================

  pomodoro: {
    level: "simple",
    primaryUnit: "pomodoros",
    unitLabel: "pomodoros",
    defaultValue: 4,
    suggestions: [4, 6, 8],
    emoji: "🍅",
    helpText: "Técnica Pomodoro: 25 min trabalho + 5 min pausa",
    validation: {
      min: 1,
      max: 16,
      warnAbove: 12,
      warningTextAbove: "Mais de 12 pomodoros (6 horas) pode causar fadiga",
    },
  },

  deep_focus: {
    level: "simple",
    primaryUnit: "hours",
    defaultValue: 2,
    suggestions: [1, 2, 3],
    emoji: "🎯",
    helpText: "Deep Work: blocos ininterruptos de 90-120 minutos",
    validation: {
      min: 0.5,
      max: 6,
      warnAbove: 4,
      warningTextAbove: "Mais de 4 horas de foco profundo é muito intenso",
    },
  },

  family_time: {
    level: "advanced",
    primaryUnit: "hours",
    alternativeUnits: ["minutes"],
    defaultValue: 1,
    suggestions: [1, 2, 3],
    emoji: "👨‍👩‍👧",
    helpText: "Tempo de qualidade com família • Qualidade > Quantidade",
    validation: {
      min: 15,  // minutos
      max: 480, // 8 horas
    },
  },

  leisure_time: {
    level: "advanced",
    primaryUnit: "minutes",
    alternativeUnits: ["hours"],
    defaultValue: 30,
    suggestions: [30, 60, 90],
    emoji: "🎮",
    helpText: "Descanso ativo: hobbies, jogos, lazer",
    validation: {
      min: 15,
      max: 240,
    },
  },

  sleep_on_time: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Estabeleça um horário fixo para dormir (ex: 22h-23h)",
  },

  wake_on_time: {
    level: "binary",
    primaryUnit: "none",
    helpText: "Mantenha consistência no horário de acordar",
  },

  regular_breaks: {
    level: "simple",
    primaryUnit: "breaks",
    unitLabel: "pausas",
    defaultValue: 8,
    suggestions: [6, 8, 10],
    emoji: "⏸️",
    helpText: "Regra 52/17: pausa de 5 min a cada hora trabalhada",
    validation: {
      min: 1,
      max: 20,
    },
  },

  screen_free_time: {
    level: "advanced",
    primaryUnit: "hours",
    alternativeUnits: ["minutes"],
    defaultValue: 1,
    suggestions: [1, 2, 3],
    emoji: "📵",
    helpText: "Digital detox: 1-2 horas antes de dormir",
    validation: {
      min: 15,  // minutos
      max: 480, // 8 horas
    },
  },

  // ==========================================================================
  // EVITAR (8 hábitos)
  // ==========================================================================

  no_smoking: {
    level: "binary",
    primaryUnit: "none",
    emoji: "🚭",
    helpText: "Abstinência total de cigarros e tabaco",
  },

  no_alcohol: {
    level: "binary",
    primaryUnit: "none",
    emoji: "🚫",
    helpText: "Evite consumo de bebidas alcoólicas",
  },

  no_sweets: {
    level: "binary",
    primaryUnit: "none",
    emoji: "🍫",
    helpText: "Abstenha-se de doces e sobremesas",
  },

  limit_social_media: {
    level: "simple",
    primaryUnit: "minutes",
    defaultValue: 30,
    suggestions: [30, 45, 60],
    emoji: "📱",
    helpText: "Uso consciente: máximo 30-60 min/dia",
    validation: {
      min: 10,
      max: 180,
      warnAbove: 90,
      warningTextAbove: "Mais de 90 minutos pode impactar produtividade",
    },
  },

  no_procrastination: {
    level: "binary",
    primaryUnit: "none",
    emoji: "✅",
    helpText: "Foco imediato em tarefas importantes",
  },

  no_skip_meals: {
    level: "simple",
    primaryUnit: "meals",
    unitLabel: "refeições",
    defaultValue: 3,
    suggestions: [3, 4, 5],
    emoji: "🍽️",
    helpText: "Mínimo: café, almoço, jantar • Ideal: + 2 lanches",
    validation: {
      min: 2,
      max: 6,
    },
  },

  no_late_sleep: {
    level: "binary",
    primaryUnit: "none",
    emoji: "🌙",
    helpText: "Dormir antes de 23h para sono reparador",
  },

  no_sedentary: {
    level: "simple",
    primaryUnit: "custom",
    unitLabel: "horas ativas",
    defaultValue: 8,
    suggestions: [6, 8, 10],
    emoji: "🚶‍♂️",
    helpText: "Manter-se ativo 8-12 horas/dia (levantar a cada hora)",
    validation: {
      min: 4,
      max: 16,
    },
  },
};

// ============================================================================
// FUNÇÕES HELPER
// ============================================================================

/**
 * Recupera a configuração de meta para um hábito específico
 * @param habitId ID do hábito (ex: "meditate", "walk_run")
 * @returns Configuração de meta ou undefined se não encontrado
 */
export function getGoalConfig(habitId: string): HabitGoalConfig | undefined {
  return HABIT_GOAL_CONFIGS[habitId];
}

/**
 * Verifica se um hábito tem meta numérica
 * @param habitId ID do hábito
 * @returns true se o hábito tem meta numérica (level !== "binary")
 */
export function hasNumericGoal(habitId: string): boolean {
  const config = getGoalConfig(habitId);
  return config?.level !== "binary";
}

/**
 * Retorna label formatada para exibição de unidade
 * @param unit Unidade da meta
 * @param config Configuração do hábito (para unitLabel customizada)
 * @returns Label formatada
 */
export function getUnitLabel(unit: GoalUnit, config?: HabitGoalConfig): string {
  // Se tem label customizada, usar
  if (config?.unitLabel) {
    return config.unitLabel;
  }

  // Mapeamento padrão
  const unitLabels: Record<GoalUnit, string> = {
    none: "",
    steps: "passos",
    minutes: "min",
    hours: "horas",
    km: "km",
    pages: "páginas",
    liters: "L",
    portions: "porções",
    flights: "lances",
    calories: "kcal",
    pomodoros: "pomodoros",
    breaks: "pausas",
    meals: "refeições",
    ml: "ml",
    grams: "g",
    custom: "un",
  };

  return unitLabels[unit] || "un";
}

/**
 * Formata valor com unidade para exibição
 * @param value Valor numérico
 * @param unit Unidade
 * @param config Configuração do hábito
 * @returns String formatada (ex: "10 min", "2 L", "5 porções")
 */
export function formatGoalValue(value: number, unit: GoalUnit, config?: HabitGoalConfig): string {
  if (unit === "none") return "";

  const label = getUnitLabel(unit, config);
  return `${value} ${label}`.trim();
}

/**
 * Valida se um valor está dentro do range recomendado
 * @param value Valor a validar
 * @param habitId ID do hábito
 * @returns { isValid, warning } objeto com resultado da validação
 */
export function validateGoalValue(
  value: number,
  habitId: string
): { isValid: boolean; warning?: string } {
  const config = getGoalConfig(habitId);

  if (!config?.validation) {
    return { isValid: true };
  }

  const { min, max, warnBelow, warnAbove, warningTextBelow, warningTextAbove } = config.validation;

  if (value < min || value > max) {
    return {
      isValid: false,
      warning: `Valor deve estar entre ${min} e ${max}`,
    };
  }

  if (warnBelow && value < warnBelow) {
    return {
      isValid: true,
      warning: warningTextBelow || `Valor abaixo do recomendado (${warnBelow})`,
    };
  }

  if (warnAbove && value > warnAbove) {
    return {
      isValid: true,
      warning: warningTextAbove || `Valor acima do recomendado (${warnAbove})`,
    };
  }

  return { isValid: true };
}

/**
 * Retorna estatísticas sobre as configurações
 * Útil para debugging e documentação
 */
export function getConfigStats() {
  const configs = Object.values(HABIT_GOAL_CONFIGS);

  return {
    total: configs.length,
    binary: configs.filter(c => c.level === "binary").length,
    simple: configs.filter(c => c.level === "simple").length,
    advanced: configs.filter(c => c.level === "advanced").length,
    withSuggestions: configs.filter(c => c.suggestions).length,
    withValidation: configs.filter(c => c.validation).length,
    withHelpText: configs.filter(c => c.helpText).length,
  };
}
