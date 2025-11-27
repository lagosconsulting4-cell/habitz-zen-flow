/**
 * Haptic Feedback Utilities
 *
 * Provides tactile feedback for mobile interactions.
 * Uses the Vibration API which is supported on Android and some other devices.
 * iOS does not support Vibration API but we call it anyway (it will be ignored).
 */

import { isHapticEnabled } from "./preferences";

// Verificar suporte
const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

// Check if haptic should trigger (supported + enabled in preferences)
const shouldVibrate = () => isSupported && isHapticEnabled();

/**
 * Haptic feedback patterns
 */
export const haptic = {
  /**
   * Light tap - for small interactions like checkbox toggles
   */
  light: () => {
    if (shouldVibrate()) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium tap - for button presses and selections
   */
  medium: () => {
    if (shouldVibrate()) {
      navigator.vibrate(25);
    }
  },

  /**
   * Heavy tap - for important confirmations
   */
  heavy: () => {
    if (shouldVibrate()) {
      navigator.vibrate(50);
    }
  },

  /**
   * Success pattern - for completing tasks
   */
  success: () => {
    if (shouldVibrate()) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error pattern - for errors or warnings
   */
  error: () => {
    if (shouldVibrate()) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Double tap - for selection or toggle
   */
  double: () => {
    if (shouldVibrate()) {
      navigator.vibrate([15, 30, 15]);
    }
  },

  /**
   * Custom vibration pattern
   * @param pattern - Array of vibration/pause durations in ms
   */
  custom: (pattern: number | number[]) => {
    if (shouldVibrate()) {
      navigator.vibrate(pattern);
    }
  },

  /**
   * Stop any ongoing vibration
   */
  stop: () => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  },
};

/**
 * Hook-style haptic trigger with condition
 * @param condition - Only trigger if true
 */
export function triggerHaptic(
  type: keyof Omit<typeof haptic, "custom" | "stop"> = "light",
  condition = true
) {
  if (condition && shouldVibrate()) {
    haptic[type]();
  }
}

/**
 * Wrap a click handler with haptic feedback
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  type: keyof Omit<typeof haptic, "custom" | "stop"> = "light"
): T {
  return ((...args: Parameters<T>) => {
    haptic[type]();
    return handler(...args);
  }) as T;
}
