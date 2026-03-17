import type { QuizData } from './useQuizData';

export interface JourneyScoreInput {
  quizData: QuizData;
  lifeAreas: string[];
  habitExperience: string;
  wakeSleepTime: { wake: string; sleep: string };
  confirmedObjective: string;
}

export interface JourneyScoreResult {
  scores: Record<string, number>;          // journeyId -> score 0-100
  dominantSignals: Record<string, string>; // journeyId -> sinal dominante para copy
  badges: string[];                        // journeyIds que recebem badge
}

const JOURNEY_IDS = [
  'own-mornings-l1',
  'gym-l1',
  'focus-protocol-l1',
  'finances-l1',
  'digital-detox-l1',
] as const;

export function calculateJourneyScores(input: JourneyScoreInput): JourneyScoreResult {
  const { quizData, lifeAreas, habitExperience, wakeSleepTime, confirmedObjective } = input;
  const challenges = quizData.challenges || [];
  const scores: Record<string, number> = {};
  const dominantSignals: Record<string, string> = {};

  // --- OWN MORNINGS L1 ---
  {
    const id = 'own-mornings-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'routine') { score += 30; signals.push({ key: 'routine_objective', pts: 30 }); }
    if (confirmedObjective === 'productivity') { score += 15; signals.push({ key: 'productivity_objective', pts: 15 }); }
    if (challenges.includes('focus')) { score += 15; signals.push({ key: 'focus_challenge', pts: 15 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (challenges.includes('tiredness')) { score += 15; signals.push({ key: 'tiredness_challenge', pts: 15 }); }
    if (quizData.energy_peak === 'morning') { score += 20; signals.push({ key: 'morning_energy', pts: 20 }); }
    if (wakeSleepTime.wake < '08:00') { score += 10; signals.push({ key: 'early_waker', pts: 10 }); }
    if (lifeAreas.includes('mind')) { score += 10; signals.push({ key: 'mind_area', pts: 10 }); }
    if (lifeAreas.includes('work')) { score += 10; signals.push({ key: 'work_area', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    if (habitExperience === 'never') { score += 15; signals.push({ key: 'never_habit', pts: 15 }); }
    if (quizData.consistency_feeling === 'avoiding') { score += 10; signals.push({ key: 'avoiding_feeling', pts: 10 }); }
    // Negative signals
    if (quizData.energy_peak === 'evening') score -= 15;
    if (wakeSleepTime.wake >= '10:00') score -= 10;
    if (confirmedObjective === 'health') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // --- GYM L1 ---
  {
    const id = 'gym-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'health') { score += 35; signals.push({ key: 'health_objective', pts: 35 }); }
    if (lifeAreas.includes('physical')) { score += 25; signals.push({ key: 'physical_area', pts: 25 }); }
    if (challenges.includes('motivation')) { score += 20; signals.push({ key: 'motivation_challenge', pts: 20 }); }
    if (challenges.includes('tiredness')) { score += 15; signals.push({ key: 'tiredness_challenge', pts: 15 }); }
    if (confirmedObjective === 'avoid') { score += 10; signals.push({ key: 'avoid_objective', pts: 10 }); }
    if (habitExperience === 'never') { score += 10; signals.push({ key: 'never_habit', pts: 10 }); }
    if (habitExperience === 'tried') { score += 15; signals.push({ key: 'tried_habit', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 10; signals.push({ key: 'young_age', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    if (quizData.consistency_feeling === 'frustrated') { score += 10; signals.push({ key: 'frustrated_feeling', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'mental') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'mind') score -= 10;
    if (habitExperience === 'already_have') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // --- FOCUS PROTOCOL L1 ---
  {
    const id = 'focus-protocol-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (challenges.includes('focus')) { score += 30; signals.push({ key: 'focus_challenge', pts: 30 }); }
    if (challenges.includes('procrastination')) { score += 25; signals.push({ key: 'procrastination_challenge', pts: 25 }); }
    if (confirmedObjective === 'productivity') { score += 20; signals.push({ key: 'productivity_objective', pts: 20 }); }
    if (confirmedObjective === 'avoid') { score += 15; signals.push({ key: 'avoid_objective', pts: 15 }); }
    if (lifeAreas.includes('work')) { score += 15; signals.push({ key: 'work_area', pts: 15 }); }
    if (quizData.profession === 'student') { score += 15; signals.push({ key: 'student', pts: 15 }); }
    if (['freelancer', 'entrepreneur'].includes(quizData.profession || '')) { score += 10; signals.push({ key: 'independent_work', pts: 10 }); }
    if (habitExperience === 'tried') { score += 10; signals.push({ key: 'tried_habit', pts: 10 }); }
    if (challenges.includes('forgetfulness')) { score += 10; signals.push({ key: 'forgetfulness_challenge', pts: 10 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 5; signals.push({ key: 'young_age', pts: 5 }); }
    if (quizData.consistency_feeling === 'resigned') { score += 10; signals.push({ key: 'resigned_feeling', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'relationships') score -= 15;
    if (quizData.energy_peak === 'afternoon') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // --- FINANCES L1 ---
  {
    const id = 'finances-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'routine') { score += 20; signals.push({ key: 'routine_objective', pts: 20 }); }
    if (confirmedObjective === 'productivity') { score += 15; signals.push({ key: 'productivity_objective', pts: 15 }); }
    if (confirmedObjective === 'avoid') { score += 20; signals.push({ key: 'avoid_objective', pts: 20 }); }
    if (challenges.includes('forgetfulness')) { score += 15; signals.push({ key: 'forgetfulness_challenge', pts: 15 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (lifeAreas.includes('work')) { score += 15; signals.push({ key: 'work_area', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 20; signals.push({ key: 'young_age', pts: 20 }); }
    if (quizData.profession === 'student') { score += 10; signals.push({ key: 'student', pts: 10 }); }
    if (quizData.profession === 'employed') { score += 10; signals.push({ key: 'employed', pts: 10 }); }
    if (habitExperience === 'never') { score += 10; signals.push({ key: 'never_habit', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 15;
    if (confirmedObjective === 'mental') score -= 10;
    if (['45-54', '55+'].includes(quizData.age_range || '')) score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // --- DIGITAL DETOX L1 ---
  {
    const id = 'digital-detox-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'avoid') { score += 35; signals.push({ key: 'avoid_objective', pts: 35 }); }
    if (challenges.includes('focus')) { score += 20; signals.push({ key: 'focus_challenge', pts: 20 }); }
    if (challenges.includes('motivation')) { score += 15; signals.push({ key: 'motivation_challenge', pts: 15 }); }
    if (challenges.includes('anxiety')) { score += 20; signals.push({ key: 'anxiety_challenge', pts: 20 }); }
    if (confirmedObjective === 'mental') { score += 15; signals.push({ key: 'mental_objective', pts: 15 }); }
    if (lifeAreas.includes('mind')) { score += 15; signals.push({ key: 'mind_area', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 10; signals.push({ key: 'young_age', pts: 10 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (quizData.consistency_feeling === 'avoiding') { score += 15; signals.push({ key: 'avoiding_feeling', pts: 15 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'physical') score -= 10;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // --- DETERMINE BADGES ---
  const BADGE_THRESHOLD = 65;
  let badges = JOURNEY_IDS.filter(id => scores[id] >= BADGE_THRESHOLD);

  // Se nenhuma atingiu 65, pega as 2 de maior score
  if (badges.length === 0) {
    badges = [...JOURNEY_IDS]
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 2);
  }

  // Maximo de 2 badges
  if (badges.length > 2) {
    badges = [...badges]
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 2);
  }

  return { scores, dominantSignals, badges };
}
