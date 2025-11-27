/**
 * Global Preferences Module
 *
 * Provides direct access to user preferences from localStorage.
 * Used by systems that need preferences outside of React context
 * (haptics, celebrations, sounds).
 */

const STORAGE_KEY = "habitz:preferences";

interface StoredPreferences {
  soundEnabled?: boolean;
  soundVolume?: number;
  hapticEnabled?: boolean;
  celebrationsEnabled?: boolean;
  notificationsEnabled?: boolean;
}

const defaults: Required<StoredPreferences> = {
  soundEnabled: true,
  soundVolume: 0.7,
  hapticEnabled: true,
  celebrationsEnabled: true,
  notificationsEnabled: true,
};

/**
 * Get a preference value directly from localStorage
 */
function getPreference<K extends keyof StoredPreferences>(
  key: K
): Required<StoredPreferences>[K] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults[key];
    const parsed = JSON.parse(raw) as StoredPreferences;
    return parsed[key] ?? defaults[key];
  } catch {
    return defaults[key];
  }
}

/**
 * Check if haptic feedback is enabled
 */
export const isHapticEnabled = (): boolean => getPreference("hapticEnabled");

/**
 * Check if celebrations (visual effects) are enabled
 */
export const isCelebrationsEnabled = (): boolean =>
  getPreference("celebrationsEnabled");

/**
 * Check if sounds are enabled
 */
export const isSoundEnabled = (): boolean => getPreference("soundEnabled");

/**
 * Get sound volume (0.0 - 1.0)
 */
export const getSoundVolume = (): number => getPreference("soundVolume");

/**
 * Check if notifications are enabled
 */
export const isNotificationsEnabled = (): boolean =>
  getPreference("notificationsEnabled");
