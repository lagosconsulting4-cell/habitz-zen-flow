import { useEffect, useCallback } from "react";
import { usePWA } from "./usePWA";

interface UseBadgeReturn {
  isSupported: boolean;
  setBadge: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
}

/**
 * Hook for managing the PWA app badge
 *
 * The Badging API allows web applications to set an app-wide badge,
 * typically shown on the app icon on the home screen or task bar.
 *
 * This is useful for showing pending habits count, unread notifications, etc.
 *
 * Note: Only works when the PWA is installed. Desktop support varies.
 */
export function useBadge(): UseBadgeReturn {
  const { isStandalone } = usePWA();

  // Check if Badging API is supported
  const isSupported =
    typeof navigator !== "undefined" &&
    "setAppBadge" in navigator &&
    isStandalone;

  /**
   * Set the badge count on the app icon
   * @param count - Number to display (0 to clear)
   */
  const setBadge = useCallback(
    async (count: number) => {
      if (!isSupported) return;

      try {
        if (count === 0) {
          await navigator.clearAppBadge?.();
        } else {
          await navigator.setAppBadge?.(count);
        }
      } catch (error) {
        // Badge API might fail silently or throw if not supported
        console.warn("[Badge] Falha ao definir badge:", error);
      }
    },
    [isSupported]
  );

  /**
   * Clear the badge from the app icon
   */
  const clearBadge = useCallback(async () => {
    if (!isSupported) return;

    try {
      await navigator.clearAppBadge?.();
    } catch (error) {
      console.warn("[Badge] Falha ao limpar badge:", error);
    }
  }, [isSupported]);

  // Clear badge when component unmounts (optional cleanup)
  useEffect(() => {
    return () => {
      // Optionally clear badge on unmount
      // clearBadge();
    };
  }, []);

  return {
    isSupported,
    setBadge,
    clearBadge,
  };
}

/**
 * Hook to automatically update badge based on pending habits
 * @param pendingCount - Number of habits pending for today
 */
export function useHabitsBadge(pendingCount: number) {
  const { setBadge, clearBadge, isSupported } = useBadge();

  useEffect(() => {
    if (!isSupported) return;

    if (pendingCount > 0) {
      setBadge(pendingCount);
    } else {
      clearBadge();
    }
  }, [pendingCount, setBadge, clearBadge, isSupported]);
}

// Type augmentation for Navigator to include Badge API
declare global {
  interface Navigator {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}
