/**
 * Tests for useGamification Hook
 *
 * Tests the gamification system's core functionality:
 * - XP values and constants
 * - Level configuration
 * - Level calculation from XP
 * - Progress within levels
 * - XP to next level calculation
 */

import { describe, it, expect } from 'vitest';
import {
  XP_VALUES,
  LEVEL_CONFIGS,
  getLevelConfig,
  getLevelConfigFromXP,
  getLevelProgress,
  getXPToNextLevel,
} from '../useGamification';

describe('useGamification', () => {
  // ===========================================================================
  // XP_VALUES Tests
  // ===========================================================================

  describe('XP_VALUES', () => {
    it('should have correct value for HABIT_COMPLETE', () => {
      expect(XP_VALUES.HABIT_COMPLETE).toBe(10);
    });

    it('should have correct value for STREAK_BONUS_3', () => {
      expect(XP_VALUES.STREAK_BONUS_3).toBe(5);
    });

    it('should have correct value for STREAK_BONUS_7', () => {
      expect(XP_VALUES.STREAK_BONUS_7).toBe(15);
    });

    it('should have correct value for STREAK_BONUS_30', () => {
      expect(XP_VALUES.STREAK_BONUS_30).toBe(50);
    });

    it('should have correct value for PERFECT_DAY', () => {
      expect(XP_VALUES.PERFECT_DAY).toBe(20);
    });

    it('should have 5 XP action types defined', () => {
      expect(Object.keys(XP_VALUES)).toHaveLength(5);
    });
  });

  // ===========================================================================
  // LEVEL_CONFIGS Tests
  // ===========================================================================

  describe('LEVEL_CONFIGS', () => {
    it('should have 10 levels defined', () => {
      expect(LEVEL_CONFIGS).toHaveLength(10);
    });

    it('should start at level 1 (Bronze I) with minXP 0', () => {
      expect(LEVEL_CONFIGS[0].level).toBe(1);
      expect(LEVEL_CONFIGS[0].name).toBe('Bronze I');
      expect(LEVEL_CONFIGS[0].minXP).toBe(0);
      expect(LEVEL_CONFIGS[0].tier).toBe('bronze');
    });

    it('should end at level 10 (Diamante) with minXP 15000', () => {
      expect(LEVEL_CONFIGS[9].level).toBe(10);
      expect(LEVEL_CONFIGS[9].name).toBe('Diamante');
      expect(LEVEL_CONFIGS[9].minXP).toBe(15000);
      expect(LEVEL_CONFIGS[9].tier).toBe('diamante');
    });

    it('should have bronze tier for levels 1-3', () => {
      expect(LEVEL_CONFIGS[0].tier).toBe('bronze');
      expect(LEVEL_CONFIGS[1].tier).toBe('bronze');
      expect(LEVEL_CONFIGS[2].tier).toBe('bronze');
    });

    it('should have prata tier for levels 4-6', () => {
      expect(LEVEL_CONFIGS[3].tier).toBe('prata');
      expect(LEVEL_CONFIGS[4].tier).toBe('prata');
      expect(LEVEL_CONFIGS[5].tier).toBe('prata');
    });

    it('should have ouro tier for levels 7-9', () => {
      expect(LEVEL_CONFIGS[6].tier).toBe('ouro');
      expect(LEVEL_CONFIGS[7].tier).toBe('ouro');
      expect(LEVEL_CONFIGS[8].tier).toBe('ouro');
    });

    it('should have diamante tier for level 10', () => {
      expect(LEVEL_CONFIGS[9].tier).toBe('diamante');
    });

    it('should have continuous XP ranges with no gaps', () => {
      for (let i = 0; i < LEVEL_CONFIGS.length - 1; i++) {
        const currentMax = LEVEL_CONFIGS[i].maxXP;
        const nextMin = LEVEL_CONFIGS[i + 1].minXP;
        expect(nextMin).toBe(currentMax + 1);
      }
    });
  });

  // ===========================================================================
  // getLevelConfig Tests
  // ===========================================================================

  describe('getLevelConfig', () => {
    it('should return correct config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.name).toBe('Bronze I');
      expect(config.minXP).toBe(0);
    });

    it('should return correct config for level 5', () => {
      const config = getLevelConfig(5);
      expect(config.name).toBe('Prata II');
      expect(config.tier).toBe('prata');
    });

    it('should return correct config for level 10', () => {
      const config = getLevelConfig(10);
      expect(config.name).toBe('Diamante');
      expect(config.tier).toBe('diamante');
    });

    it('should return level 1 config for invalid level (0)', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('should return level 1 config for invalid level (negative)', () => {
      const config = getLevelConfig(-5);
      expect(config.level).toBe(1);
    });
  });

  // ===========================================================================
  // getLevelConfigFromXP Tests
  // ===========================================================================

  describe('getLevelConfigFromXP', () => {
    it('should return level 1 for 0 XP', () => {
      const config = getLevelConfigFromXP(0);
      expect(config.level).toBe(1);
    });

    it('should return level 1 for 50 XP', () => {
      const config = getLevelConfigFromXP(50);
      expect(config.level).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      const config = getLevelConfigFromXP(100);
      expect(config.level).toBe(2);
    });

    it('should return level 2 for 499 XP (edge of level 2)', () => {
      const config = getLevelConfigFromXP(499);
      expect(config.level).toBe(2);
    });

    it('should return level 3 for 500 XP', () => {
      const config = getLevelConfigFromXP(500);
      expect(config.level).toBe(3);
    });

    it('should return level 10 for 15000 XP', () => {
      const config = getLevelConfigFromXP(15000);
      expect(config.level).toBe(10);
    });

    it('should return level 10 for very high XP (100000)', () => {
      const config = getLevelConfigFromXP(100000);
      expect(config.level).toBe(10);
    });
  });

  // ===========================================================================
  // getLevelProgress Tests
  // ===========================================================================

  describe('getLevelProgress', () => {
    it('should return 0% progress at start of level 1', () => {
      const progress = getLevelProgress(0);
      expect(progress).toBe(0);
    });

    it('should return ~50% progress at middle of level 1', () => {
      // Level 1: 0-99 (100 XP range)
      const progress = getLevelProgress(50);
      expect(progress).toBe(50);
    });

    it('should return ~99% progress near end of level 1', () => {
      const progress = getLevelProgress(99);
      expect(progress).toBe(99);
    });

    it('should return 0% at start of level 2', () => {
      const progress = getLevelProgress(100);
      expect(progress).toBe(0);
    });

    it('should return 100% for max level (Diamante)', () => {
      const progress = getLevelProgress(15000);
      expect(progress).toBe(100);
    });

    it('should return 100% for XP beyond max level', () => {
      const progress = getLevelProgress(50000);
      expect(progress).toBe(100);
    });
  });

  // ===========================================================================
  // getXPToNextLevel Tests
  // ===========================================================================

  describe('getXPToNextLevel', () => {
    it('should return 100 XP to next level at 0 XP', () => {
      const xpNeeded = getXPToNextLevel(0);
      expect(xpNeeded).toBe(100);
    });

    it('should return 50 XP to next level at 50 XP', () => {
      const xpNeeded = getXPToNextLevel(50);
      expect(xpNeeded).toBe(50);
    });

    it('should return 1 XP to next level at 99 XP', () => {
      const xpNeeded = getXPToNextLevel(99);
      expect(xpNeeded).toBe(1);
    });

    it('should return correct XP needed at start of level 2', () => {
      // Level 2: 100-499 (400 XP range)
      const xpNeeded = getXPToNextLevel(100);
      expect(xpNeeded).toBe(400);
    });

    it('should return 0 for max level (Diamante)', () => {
      const xpNeeded = getXPToNextLevel(15000);
      expect(xpNeeded).toBe(0);
    });

    it('should return 0 for XP beyond max level', () => {
      const xpNeeded = getXPToNextLevel(50000);
      expect(xpNeeded).toBe(0);
    });
  });

  // ===========================================================================
  // Integration Tests - XP Progression Scenarios
  // ===========================================================================

  describe('XP Progression Scenarios', () => {
    it('should progress from level 1 to level 2 after 10 habit completions', () => {
      // 10 habits * 10 XP = 100 XP = Level 2
      const totalXP = XP_VALUES.HABIT_COMPLETE * 10;
      const config = getLevelConfigFromXP(totalXP);
      expect(config.level).toBe(2);
    });

    it('should calculate correct XP for a week of perfect days', () => {
      // 7 days * (3 habits * 10 XP + 20 XP perfect day) = 7 * 50 = 350 XP
      const dailyXP = XP_VALUES.HABIT_COMPLETE * 3 + XP_VALUES.PERFECT_DAY;
      const weeklyXP = dailyXP * 7;
      expect(weeklyXP).toBe(350);

      const config = getLevelConfigFromXP(weeklyXP);
      expect(config.level).toBe(2); // 350 XP is in level 2 (100-499)
    });

    it('should calculate correct XP for achieving 7-day streak', () => {
      // 7 habits + streak bonus
      const totalXP = XP_VALUES.HABIT_COMPLETE * 7 + XP_VALUES.STREAK_BONUS_7;
      expect(totalXP).toBe(85);
    });

    it('should calculate correct XP for achieving 30-day streak', () => {
      // 30 habits + all streak bonuses (3, 7, 30)
      const totalXP =
        XP_VALUES.HABIT_COMPLETE * 30 +
        XP_VALUES.STREAK_BONUS_3 +
        XP_VALUES.STREAK_BONUS_7 +
        XP_VALUES.STREAK_BONUS_30;
      expect(totalXP).toBe(370); // 300 + 5 + 15 + 50
    });
  });
});
