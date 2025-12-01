/**
 * Level Rewards Mapping - Sprint 3.3
 *
 * Defines which items are unlocked at each level.
 * Used for automatic unlocking when user levels up.
 */

export interface LevelReward {
  level: number;
  unlocks: Array<{
    type: "icon" | "widget" | "meditation" | "template" | "journey";
    id: string;
  }>;
}

/**
 * Level 1-10 reward progression (Bronze → Diamante)
 *
 * Level 1 (Bronze I): Start
 * Level 2 (Bronze II): First premium icons
 * Level 3 (Bronze III): More icons
 * Level 4 (Prata I): Widget básico
 * Level 5 (Prata II): Meditação + ícones
 * Level 6 (Prata III): Template
 * Level 7 (Ouro I): Mais meditações
 * Level 8 (Ouro II): Todos templates
 * Level 9 (Ouro III): Widget avançado
 * Level 10 (Diamante): Jornada + tudo
 */
export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 1,
    unlocks: [], // No rewards at level 1 (starting level)
  },
  {
    level: 2,
    unlocks: [
      { type: "icon", id: "star_premium" },
      { type: "icon", id: "flame_gold" },
      { type: "icon", id: "heart_gold" },
    ],
  },
  {
    level: 3,
    unlocks: [
      { type: "icon", id: "diamond" },
      { type: "icon", id: "trophy" },
    ],
  },
  {
    level: 4,
    unlocks: [
      { type: "widget", id: "weekly_stats" },
      { type: "icon", id: "rocket" },
    ],
  },
  {
    level: 5,
    unlocks: [
      { type: "meditation", id: "focus_5min" },
      { type: "icon", id: "crown" },
      { type: "icon", id: "lightning" },
    ],
  },
  {
    level: 6,
    unlocks: [
      { type: "template", id: "morning_routine" },
    ],
  },
  {
    level: 7,
    unlocks: [
      { type: "meditation", id: "stress_relief" },
      { type: "meditation", id: "morning_energy" },
    ],
  },
  {
    level: 8,
    unlocks: [
      { type: "template", id: "productivity_boost" },
      { type: "template", id: "wellness_plan" },
    ],
  },
  {
    level: 9,
    unlocks: [
      { type: "widget", id: "streak_tracker" },
    ],
  },
  {
    level: 10,
    unlocks: [
      { type: "journey", id: "consistency_master" },
      { type: "journey", id: "morning_person" },
    ],
  },
];

/**
 * Get rewards for a specific level
 */
export const getRewardsForLevel = (level: number): LevelReward | undefined => {
  return LEVEL_REWARDS.find((reward) => reward.level === level);
};

/**
 * Get all unlocks up to a specific level
 * Useful for showing "you have unlocked X items so far"
 */
export const getAllUnlocksUpToLevel = (
  level: number
): Array<{ type: string; id: string }> => {
  return LEVEL_REWARDS.filter((reward) => reward.level <= level).flatMap(
    (reward) => reward.unlocks
  );
};

/**
 * Check if user should receive unlocks at this level
 */
export const hasRewardsAtLevel = (level: number): boolean => {
  const rewards = getRewardsForLevel(level);
  return rewards ? rewards.unlocks.length > 0 : false;
};
