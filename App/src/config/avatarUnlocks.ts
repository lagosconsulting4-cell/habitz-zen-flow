// ============================================================================
// AVATAR UNLOCK CONFIG
// Streak-based unlock thresholds for avatar trait options.
// All logic is client-side — no new Supabase tables needed.
// Source of truth for longest_streak: user_progress.longest_streak
// ============================================================================

export const UNLOCK_TIERS = [0, 7, 14, 30, 60, 100] as const;
export type UnlockTier = typeof UNLOCK_TIERS[number];

// Maps traitKey → { optionValue → streakDaysRequired }
// Options not listed default to 0 (free).
// Colors are intentionally not included here (all free).
export const AVATAR_UNLOCKS: Record<string, Record<string, UnlockTier>> = {
  top: {
    // Free — basic styles
    shortFlat: 0, shortWaved: 0, shortCurly: 0, shortRound: 0,
    dreads01: 0, bob: 0, curly: 0, curvy: 0, fro: 0,
    // 7 days
    bun: 7, bigHair: 7, sides: 7, dreads: 7, shaggy: 7,
    // 14 days
    frizzle: 14, miaWallace: 14, froBand: 14, longButNotTooLong: 14,
    shaggyMullet: 14, theCaesar: 14, theCaesarAndSidePart: 14,
    // 30 days
    straight01: 30, straight02: 30, straightAndStrand: 30,
    dreads02: 30, shavedSides: 30, frida: 30,
    // 60 days — hats
    hat: 60, winterHat1: 60, winterHat02: 60, winterHat03: 60, winterHat04: 60,
    // 100 days — special
    hijab: 100, turban: 100,
  },
  eyes: {
    // Free
    default: 0, happy: 0, closed: 0, cry: 0,
    // 7 days
    wink: 7, winkWacky: 7,
    // 14 days
    eyeRoll: 14, side: 14,
    // 30 days
    hearts: 30, squint: 30,
    // 60 days
    surprised: 60, xDizzy: 60,
  },
  eyebrows: {
    // Free
    defaultNatural: 0, flatNatural: 0, default: 0,
    // 7 days
    raisedExcitedNatural: 7, raisedExcited: 7,
    // 14 days
    angryNatural: 14, angry: 14,
    frownNatural: 14, upDownNatural: 14, upDown: 14,
    // 30 days
    sadConcernedNatural: 30, sadConcerned: 30,
    // 60 days
    unibrowNatural: 60,
  },
  mouth: {
    // Free
    smile: 0, default: 0, eating: 0,
    // 7 days
    twinkle: 7, tongue: 7,
    // 14 days
    disbelief: 14, grimace: 14, serious: 14, sad: 14,
    // 30 days
    concerned: 30, screamOpen: 30,
    // 60 days
    vomit: 60,
  },
  clothing: {
    // Free
    hoodie: 0, shirtCrewNeck: 0, shirtScoopNeck: 0,
    // 7 days
    blazerAndShirt: 7, collarAndSweater: 7,
    // 14 days
    blazerAndSweater: 14, graphicShirt: 14,
    // 30 days
    overall: 30, shirtVNeck: 30,
  },
  facialHair: {
    // Free
    beardMedium: 0, beardMajestic: 0,
    // 7 days
    beardLight: 7,
    // 14 days
    moustacheFancy: 14, moustacheMagnum: 14,
  },
  accessories: {
    // Free
    prescription01: 0, prescription02: 0,
    // 7 days
    kurt: 7, round: 7,
    // 14 days
    sunglasses: 14, wayfarers: 14,
    // 30 days
    eyepatch: 30,
  },
  clothingGraphic: {
    bat: 0, bear: 0, diamond: 0, hola: 0,
    cumbia: 7, deer: 7, pizza: 7,
    resist: 14, skull: 14, skullOutline: 30,
  },
};

/** Returns the streak threshold for unlocking a given trait option (0 = free). */
export function getUnlockThreshold(trait: string, value: string): number {
  return AVATAR_UNLOCKS[trait]?.[value] ?? 0;
}

/** Returns true if the option is unlocked for the given streak. */
export function isUnlocked(trait: string, value: string, longestStreak: number): boolean {
  return longestStreak >= getUnlockThreshold(trait, value);
}
