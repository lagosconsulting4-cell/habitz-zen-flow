/**
 * Unlockables Catalog - Sprint 3.3
 *
 * Defines all items that can be unlocked through gamification.
 * Types: icon, widget, meditation, template, journey
 */

export interface Unlockable {
  id: string;
  type: "icon" | "widget" | "meditation" | "template" | "journey";
  name: string;
  description: string;
  emoji?: string;
  preview?: string; // URL or emoji
}

// ============================================================================
// ICONS - Premium habit icons
// ============================================================================

export const UNLOCKABLE_ICONS: Unlockable[] = [
  {
    id: "star_premium",
    type: "icon",
    name: "Estrela Premium",
    description: "Ícone de estrela dourada para seus hábitos mais importantes",
    emoji: "⭐",
  },
  {
    id: "flame_gold",
    type: "icon",
    name: "Chama Dourada",
    description: "Representa sua determinação inabalável",
    emoji: "🔥",
  },
  {
    id: "diamond",
    type: "icon",
    name: "Diamante",
    description: "Para hábitos de valor inestimável",
    emoji: "💎",
  },
  {
    id: "trophy",
    type: "icon",
    name: "Troféu",
    description: "Celebre suas conquistas",
    emoji: "🏆",
  },
  {
    id: "rocket",
    type: "icon",
    name: "Foguete",
    description: "Acelere rumo aos seus objetivos",
    emoji: "🚀",
  },
  {
    id: "crown",
    type: "icon",
    name: "Coroa",
    description: "Você é realeza nos seus hábitos",
    emoji: "👑",
  },
  {
    id: "lightning",
    type: "icon",
    name: "Raio",
    description: "Energia e velocidade",
    emoji: "⚡",
  },
  {
    id: "heart_gold",
    type: "icon",
    name: "Coração Dourado",
    description: "Para hábitos do coração",
    emoji: "💛",
  },
];

// ============================================================================
// WIDGETS - Dashboard widgets (placeholder for future)
// ============================================================================

export const UNLOCKABLE_WIDGETS: Unlockable[] = [
  {
    id: "weekly_stats",
    type: "widget",
    name: "Estatísticas Semanais",
    description: "Widget com visão detalhada da sua semana",
  },
  {
    id: "streak_tracker",
    type: "widget",
    name: "Rastreador de Streaks",
    description: "Acompanhe todos os seus streaks em um só lugar",
  },
];

// ============================================================================
// MEDITATIONS - Guided meditations (placeholder for future)
// ============================================================================

export const UNLOCKABLE_MEDITATIONS: Unlockable[] = [
  {
    id: "focus_5min",
    type: "meditation",
    name: "Foco 5 Minutos",
    description: "Meditação guiada para melhorar concentração",
  },
  {
    id: "stress_relief",
    type: "meditation",
    name: "Alívio de Estresse",
    description: "Técnicas de respiração para relaxamento",
  },
  {
    id: "morning_energy",
    type: "meditation",
    name: "Energia Matinal",
    description: "Comece o dia com energia renovada",
  },
];

// ============================================================================
// TEMPLATES - Habit templates (placeholder for future)
// ============================================================================

export const UNLOCKABLE_TEMPLATES: Unlockable[] = [
  {
    id: "morning_routine",
    type: "template",
    name: "Rotina Matinal Completa",
    description: "Template com 5 hábitos para começar bem o dia",
  },
  {
    id: "productivity_boost",
    type: "template",
    name: "Impulso de Produtividade",
    description: "Hábitos otimizados para máxima produtividade",
  },
  {
    id: "wellness_plan",
    type: "template",
    name: "Plano de Bem-Estar",
    description: "Rotina completa de saúde física e mental",
  },
];

// ============================================================================
// JOURNEYS - Special challenge journeys (placeholder for future)
// ============================================================================

export const UNLOCKABLE_JOURNEYS: Unlockable[] = [
  {
    id: "consistency_master",
    type: "journey",
    name: "Mestre da Consistência",
    description: "Jornada de 30 dias focada em construir consistência",
  },
  {
    id: "morning_person",
    type: "journey",
    name: "Pessoa Matinal",
    description: "Transforme-se em uma pessoa matinal em 21 dias",
  },
];

// ============================================================================
// MASTER CATALOG - All unlockables
// ============================================================================

export const ALL_UNLOCKABLES: Unlockable[] = [
  ...UNLOCKABLE_ICONS,
  ...UNLOCKABLE_WIDGETS,
  ...UNLOCKABLE_MEDITATIONS,
  ...UNLOCKABLE_TEMPLATES,
  ...UNLOCKABLE_JOURNEYS,
];

/**
 * Get unlockable by ID
 */
export const getUnlockable = (id: string): Unlockable | undefined => {
  return ALL_UNLOCKABLES.find((item) => item.id === id);
};

/**
 * Get unlockables by type
 */
export const getUnlockablesByType = (
  type: "icon" | "widget" | "meditation" | "template" | "journey"
): Unlockable[] => {
  return ALL_UNLOCKABLES.filter((item) => item.type === type);
};
