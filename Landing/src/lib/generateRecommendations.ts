/**
 * Smart Habit Recommendation Algorithm - 4 Layers
 *
 * Adapted from App/src/components/onboarding/generateRecommendations.ts
 * This algorithm generates a personalized routine based on user responses.
 *
 * LAYER 1 (40%): Objective-based habits
 * LAYER 2 (30%): Challenge-based support habits
 * LAYER 3: Time-based quantity adjustment
 * LAYER 4: Schedule-based period assignment & time slots
 */

import type {
  Objective,
  TimeAvailable,
  WorkSchedule,
  EnergyPeak,
  RecommendedHabit,
} from "./quizConfig";

import {
  OBJECTIVE_HABITS,
  CHALLENGE_HABITS,
  TIME_QUANTITY,
  WORK_SCHEDULE_SLOTS,
  getHabitTemplate,
} from "./quizConfig";

interface RecommendationInput {
  objective: Objective;
  challenges: string[];
  timeAvailable: TimeAvailable;
  workSchedule: WorkSchedule;
  energyPeak: EnergyPeak;
  weekDays: number[];
}

interface ScoredHabit {
  habitId: string;
  score: number;
  sources: string[];
}

/**
 * Main recommendation function - orchestrates the 4 layers
 */
export function generateRecommendations(
  input: RecommendationInput
): RecommendedHabit[] {
  // LAYER 1: Score habits based on objective (40% weight)
  const objectiveScores = scoreObjectiveHabits(input.objective);

  // LAYER 2: Score habits based on challenges (30% weight)
  const challengeScores = scoreChallengeHabits(input.challenges);

  // Combine scores from layers 1 & 2
  const combinedScores = combineScores(objectiveScores, challengeScores);

  // LAYER 3: Determine target quantity based on time available
  const targetQuantity = determineQuantity(input.timeAvailable);

  // Select top habits based on combined scores
  const selectedHabitIds = selectTopHabits(combinedScores, targetQuantity);

  // LAYER 4: Assign periods, time slots, and create habit objects
  const recommendedHabits = assignScheduleAndCreateHabits(
    selectedHabitIds,
    input.workSchedule,
    input.energyPeak,
    input.weekDays,
    combinedScores
  );

  return recommendedHabits;
}

/**
 * LAYER 1: Score habits based on primary objective
 * Weight: 40% of total score
 */
function scoreObjectiveHabits(objective: Objective): Map<string, ScoredHabit> {
  const scores = new Map<string, ScoredHabit>();
  const habitIds = OBJECTIVE_HABITS[objective] || [];

  habitIds.forEach((habitId, index) => {
    // Higher priority habits (earlier in list) get higher scores
    // Score range: 40 to 30 (for 40% weight)
    const score = 40 - (index / habitIds.length) * 10;

    scores.set(habitId, {
      habitId,
      score,
      sources: [`objective:${objective}`],
    });
  });

  return scores;
}

/**
 * LAYER 2: Score habits based on selected challenges
 * Weight: 30% of total score (divided among challenges)
 */
function scoreChallengeHabits(challenges: string[]): Map<string, ScoredHabit> {
  const scores = new Map<string, ScoredHabit>();

  if (challenges.length === 0) {
    return scores;
  }

  // Each challenge contributes 30 / num_challenges points
  const scorePerChallenge = 30 / challenges.length;

  challenges.forEach((challenge) => {
    const habitIds = CHALLENGE_HABITS[challenge] || [];

    habitIds.forEach((habitId, index) => {
      // Higher priority habits get more score
      const score = scorePerChallenge * (1 - index / habitIds.length);

      const existing = scores.get(habitId);
      if (existing) {
        existing.score += score;
        existing.sources.push(`challenge:${challenge}`);
      } else {
        scores.set(habitId, {
          habitId,
          score,
          sources: [`challenge:${challenge}`],
        });
      }
    });
  });

  return scores;
}

/**
 * Combine scores from objective and challenge layers
 */
function combineScores(
  objectiveScores: Map<string, ScoredHabit>,
  challengeScores: Map<string, ScoredHabit>
): Map<string, ScoredHabit> {
  const combined = new Map<string, ScoredHabit>();

  // Add all objective scores
  objectiveScores.forEach((scored, habitId) => {
    combined.set(habitId, { ...scored });
  });

  // Add/merge challenge scores
  challengeScores.forEach((scored, habitId) => {
    const existing = combined.get(habitId);
    if (existing) {
      existing.score += scored.score;
      existing.sources.push(...scored.sources);
    } else {
      combined.set(habitId, { ...scored });
    }
  });

  return combined;
}

/**
 * LAYER 3: Determine target quantity based on time available
 */
function determineQuantity(timeAvailable: TimeAvailable): number {
  const range = TIME_QUANTITY[timeAvailable];
  // Use the max value from the range
  return range.max;
}

/**
 * Select top N habits based on scores
 */
function selectTopHabits(
  scores: Map<string, ScoredHabit>,
  quantity: number
): string[] {
  // Sort habits by score (descending)
  const sorted = Array.from(scores.values()).sort((a, b) => b.score - a.score);

  // Take top N
  return sorted.slice(0, quantity).map((scored) => scored.habitId);
}

/**
 * LAYER 4: Assign periods, time slots, and create habit objects
 */
function assignScheduleAndCreateHabits(
  habitIds: string[],
  workSchedule: WorkSchedule,
  energyPeak: EnergyPeak,
  weekDays: number[],
  scores: Map<string, ScoredHabit>
): RecommendedHabit[] {
  const timeSlots = WORK_SCHEDULE_SLOTS[workSchedule];

  // Group habits by preferred period
  const habitsByPeriod = groupHabitsByPeriod(habitIds);

  // Distribute habits across available periods
  const recommendedHabits: RecommendedHabit[] = [];

  // Assign morning habits
  if (timeSlots.morning && habitsByPeriod.morning.length > 0) {
    habitsByPeriod.morning.forEach((habitId) => {
      const habit = createRecommendedHabit(
        habitId,
        "morning",
        timeSlots.morning!,
        weekDays,
        scores.get(habitId)
      );
      if (habit) recommendedHabits.push(habit);
    });
  }

  // Assign afternoon habits
  if (timeSlots.afternoon && habitsByPeriod.afternoon.length > 0) {
    habitsByPeriod.afternoon.forEach((habitId) => {
      const habit = createRecommendedHabit(
        habitId,
        "afternoon",
        timeSlots.afternoon!,
        weekDays,
        scores.get(habitId)
      );
      if (habit) recommendedHabits.push(habit);
    });
  }

  // Assign evening habits
  if (timeSlots.evening && habitsByPeriod.evening.length > 0) {
    habitsByPeriod.evening.forEach((habitId) => {
      const habit = createRecommendedHabit(
        habitId,
        "evening",
        timeSlots.evening!,
        weekDays,
        scores.get(habitId)
      );
      if (habit) recommendedHabits.push(habit);
    });
  }

  // Assign "any" period habits to the user's energy peak period
  if (habitsByPeriod.any.length > 0) {
    const preferredPeriod = mapEnergyPeakToPeriod(energyPeak);
    const preferredSlot =
      timeSlots[preferredPeriod] || timeSlots.morning || timeSlots.afternoon || timeSlots.evening;

    habitsByPeriod.any.forEach((habitId) => {
      const habit = createRecommendedHabit(
        habitId,
        preferredPeriod,
        preferredSlot!,
        weekDays,
        scores.get(habitId)
      );
      if (habit) recommendedHabits.push(habit);
    });
  }

  return recommendedHabits;
}

/**
 * Group habits by their preferred period
 */
function groupHabitsByPeriod(habitIds: string[]): {
  morning: string[];
  afternoon: string[];
  evening: string[];
  any: string[];
} {
  const groups = {
    morning: [] as string[],
    afternoon: [] as string[],
    evening: [] as string[],
    any: [] as string[],
  };

  habitIds.forEach((habitId) => {
    const template = getHabitTemplate(habitId);
    if (!template) return;

    groups[template.preferredPeriod].push(habitId);
  });

  return groups;
}

/**
 * Map EnergyPeak to period
 */
function mapEnergyPeakToPeriod(
  energyPeak: EnergyPeak
): "morning" | "afternoon" | "evening" {
  const mapping: Record<EnergyPeak, "morning" | "afternoon" | "evening"> = {
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
  };

  return mapping[energyPeak];
}

/**
 * Create a RecommendedHabit object from template
 */
function createRecommendedHabit(
  habitId: string,
  period: "morning" | "afternoon" | "evening",
  timeSlot: { start: string; end: string },
  weekDays: number[],
  scoredHabit?: ScoredHabit
): RecommendedHabit | null {
  const template = getHabitTemplate(habitId);
  if (!template) return null;

  // Generate a suggested time within the time slot
  const suggestedTime = generateSuggestedTime(timeSlot.start, period);

  const recommendedHabit: RecommendedHabit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    template_id: template.id,
    name: template.name,
    category: template.category,
    icon: template.icon,
    icon_key: template.icon_key,
    color: template.color,
    period,
    suggested_time: suggestedTime,
    duration: template.defaultDuration || 5,
    goal_value: template.defaultGoalValue || 1,
    goal_unit: template.defaultUnit || "times",
    frequency_type: template.defaultFrequencyType || "fixed_days",
    frequency_days: weekDays,
    priority: template.priority,
    recommendation_score: scoredHabit?.score || 0,
    recommendation_sources: scoredHabit?.sources || [],
  };

  return recommendedHabit;
}

/**
 * Generate a suggested time within a time slot
 * Returns time in HH:MM format
 */
function generateSuggestedTime(
  slotStart: string,
  period: "morning" | "afternoon" | "evening"
): string {
  // Default suggested times for each period
  const defaultTimes: Record<string, string> = {
    morning: "07:00",
    afternoon: "14:00",
    evening: "20:00",
  };

  // If slot start is available, use it; otherwise use default
  return slotStart || defaultTimes[period];
}
