/**
 * Sound Effects System
 *
 * Provides audio feedback for gamification events and celebrations.
 * Supports volume control, muting, and user preferences.
 *
 * Sound files should be placed in /public/sounds/
 * Supported formats: MP3 (best compatibility), OGG, WAV
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Sound file paths (relative to /public/)
 * TODO: Add actual sound files to /public/sounds/
 */
const SOUND_PATHS = {
  complete: "/sounds/complete.mp3", // Habit completion (light, satisfying)
  levelUp: "/sounds/level-up.mp3", // Level up (triumphant, exciting)
  streak: "/sounds/streak.mp3", // Streak bonus (encouraging)
  dayComplete: "/sounds/day-complete.mp3", // Perfect day (celebratory)
  unlock: "/sounds/unlock.mp3", // Item unlocked (reward reveal)
} as const;

export type SoundType = keyof typeof SOUND_PATHS;

/**
 * Default volume for each sound type (0.0 - 1.0)
 */
const DEFAULT_VOLUMES: Record<SoundType, number> = {
  complete: 0.4,
  levelUp: 0.6,
  streak: 0.5,
  dayComplete: 0.7,
  unlock: 0.5,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Global sound settings
 */
let globalVolume = 1.0; // Master volume multiplier
let soundsEnabled = true; // Global mute

/**
 * Audio cache to avoid reloading sound files
 */
const audioCache = new Map<SoundType, HTMLAudioElement>();

/**
 * Check if Web Audio API is supported
 */
const isSupported = typeof Audio !== "undefined";

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Preload a sound file into cache
 * Call this during app initialization or when user enables sounds
 */
export const preloadSound = (type: SoundType): void => {
  if (!isSupported || audioCache.has(type)) return;

  try {
    const audio = new Audio(SOUND_PATHS[type]);
    audio.preload = "auto";
    audioCache.set(type, audio);
  } catch (error) {
    console.warn(`Failed to preload sound: ${type}`, error);
  }
};

/**
 * Preload all sounds
 */
export const preloadAllSounds = (): void => {
  Object.keys(SOUND_PATHS).forEach((type) => preloadSound(type as SoundType));
};

/**
 * Play a sound effect
 * @param type - Sound type to play
 * @param volumeOverride - Optional volume override (0.0 - 1.0)
 */
export const playSound = (type: SoundType, volumeOverride?: number): void => {
  if (!isSupported || !soundsEnabled) return;

  try {
    // Get or create audio element
    let audio = audioCache.get(type);

    if (!audio) {
      audio = new Audio(SOUND_PATHS[type]);
      audioCache.set(type, audio);
    }

    // Clone the audio element to allow overlapping plays
    const audioClone = audio.cloneNode() as HTMLAudioElement;

    // Set volume (specific volume * master volume)
    const baseVolume = volumeOverride ?? DEFAULT_VOLUMES[type];
    audioClone.volume = Math.max(0, Math.min(1, baseVolume * globalVolume));

    // Play with error handling
    const playPromise = audioClone.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Fail silently - don't break UX if audio fails
        console.debug(`Sound play failed: ${type}`, error);
      });
    }
  } catch (error) {
    console.debug(`Sound error: ${type}`, error);
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = (): void => {
  if (!isSupported) return;

  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};

// ============================================================================
// VOLUME CONTROL
// ============================================================================

/**
 * Set master volume (affects all sounds)
 * @param volume - Volume level (0.0 - 1.0)
 */
export const setVolume = (volume: number): void => {
  globalVolume = Math.max(0, Math.min(1, volume));
};

/**
 * Get current master volume
 */
export const getVolume = (): number => {
  return globalVolume;
};

/**
 * Mute all sounds
 */
export const mute = (): void => {
  soundsEnabled = false;
};

/**
 * Unmute all sounds
 */
export const unmute = (): void => {
  soundsEnabled = true;
};

/**
 * Toggle mute state
 */
export const toggleMute = (): boolean => {
  soundsEnabled = !soundsEnabled;
  return soundsEnabled;
};

/**
 * Check if sounds are enabled
 */
export const isSoundsEnabled = (): boolean => {
  return soundsEnabled;
};

// ============================================================================
// CONVENIENCE API
// ============================================================================

/**
 * Organized sound playback API
 */
export const sounds = {
  /**
   * Play habit completion sound
   */
  complete: (volume?: number) => playSound("complete", volume),

  /**
   * Play level up sound
   */
  levelUp: (volume?: number) => playSound("levelUp", volume),

  /**
   * Play streak bonus sound
   */
  streak: (volume?: number) => playSound("streak", volume),

  /**
   * Play perfect day sound
   */
  dayComplete: (volume?: number) => playSound("dayComplete", volume),

  /**
   * Play unlock reward sound
   */
  unlock: (volume?: number) => playSound("unlock", volume),

  /**
   * Play custom sound
   */
  play: playSound,
};

// ============================================================================
// CONDITIONAL PLAYBACK
// ============================================================================

/**
 * Play sound only if condition is true
 * @param type - Sound type
 * @param condition - Play only if true
 * @param volume - Optional volume override
 */
export const playSoundIf = (
  type: SoundType,
  condition = true,
  volume?: number
): void => {
  if (condition) {
    playSound(type, volume);
  }
};

/**
 * Wrap a function with sound effect
 * Sound plays after function executes
 */
export function withSound<T extends (...args: unknown[]) => unknown>(
  handler: T,
  soundType: SoundType,
  volume?: number
): T {
  return ((...args: Parameters<T>) => {
    const result = handler(...args);

    // If handler returns a promise, play sound after it resolves
    if (result instanceof Promise) {
      result.then(() => playSound(soundType, volume)).catch(() => {
        // Still play sound even if promise rejects
        playSound(soundType, volume);
      });
    } else {
      playSound(soundType, volume);
    }

    return result;
  }) as T;
}

// ============================================================================
// PERSISTENCE (Optional - connect to user preferences)
// ============================================================================

/**
 * Load sound preferences from localStorage
 * Call this during app initialization
 */
export const loadSoundPreferences = (): void => {
  try {
    const stored = localStorage.getItem("soundPreferences");
    if (stored) {
      const prefs = JSON.parse(stored);
      if (typeof prefs.volume === "number") {
        setVolume(prefs.volume);
      }
      if (typeof prefs.enabled === "boolean") {
        soundsEnabled = prefs.enabled;
      }
    }
  } catch (error) {
    console.warn("Failed to load sound preferences", error);
  }
};

/**
 * Save sound preferences to localStorage
 */
export const saveSoundPreferences = (): void => {
  try {
    const prefs = {
      volume: globalVolume,
      enabled: soundsEnabled,
    };
    localStorage.setItem("soundPreferences", JSON.stringify(prefs));
  } catch (error) {
    console.warn("Failed to save sound preferences", error);
  }
};

/**
 * Apply user preferences with persistence
 * @param enabled - Enable/disable sounds
 * @param volume - Master volume (0.0 - 1.0)
 */
export const setSoundPreferences = (
  enabled: boolean,
  volume: number
): void => {
  soundsEnabled = enabled;
  setVolume(volume);
  saveSoundPreferences();
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize sound system
 * Call this once during app startup
 */
export const initSounds = (): void => {
  if (!isSupported) {
    console.warn("Audio not supported in this browser");
    return;
  }

  // Load user preferences
  loadSoundPreferences();

  // Preload sounds on user interaction (to avoid autoplay restrictions)
  // We don't preload immediately to avoid blocking initial page load
  const preloadOnInteraction = () => {
    preloadAllSounds();
    // Remove listeners after first interaction
    document.removeEventListener("click", preloadOnInteraction);
    document.removeEventListener("touchstart", preloadOnInteraction);
  };

  document.addEventListener("click", preloadOnInteraction, { once: true });
  document.addEventListener("touchstart", preloadOnInteraction, { once: true });
};

// ============================================================================
// EXPORTS
// ============================================================================

export default sounds;

/**
 * Usage Examples:
 *
 * // Basic usage
 * import { sounds } from '@/lib/sounds';
 * sounds.complete(); // Play habit completion sound
 * sounds.levelUp(); // Play level up sound
 *
 * // With custom volume
 * sounds.complete(0.8); // Louder
 * sounds.complete(0.2); // Quieter
 *
 * // Direct playSound
 * import { playSound } from '@/lib/sounds';
 * playSound('streak', 0.5);
 *
 * // Conditional
 * import { playSoundIf } from '@/lib/sounds';
 * playSoundIf('complete', userWantsSound);
 *
 * // Wrap function
 * import { withSound } from '@/lib/sounds';
 * const handleComplete = withSound(() => {
 *   completeHabit();
 * }, 'complete');
 *
 * // Volume control
 * import { setVolume, mute, unmute } from '@/lib/sounds';
 * setVolume(0.5); // 50% volume
 * mute(); // Disable all sounds
 * unmute(); // Enable sounds
 *
 * // Initialize (in App.tsx or main entry)
 * import { initSounds } from '@/lib/sounds';
 * initSounds();
 */
