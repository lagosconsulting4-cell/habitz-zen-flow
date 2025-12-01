import { useState, useEffect, useCallback, useRef } from "react";

interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
}

/**
 * Hook for managing the Screen Wake Lock API
 *
 * Prevents the screen from turning off during important activities
 * like meditation sessions, timers, or video playback.
 *
 * The lock is automatically released when:
 * - The tab is hidden (user switches apps)
 * - The document is minimized
 * - release() is called
 * - The component unmounts
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Check if Wake Lock API is supported
  const isSupported =
    typeof navigator !== "undefined" && "wakeLock" in navigator;

  /**
   * Request a wake lock to keep the screen on
   */
  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("[WakeLock] API não suportada neste navegador");
      return false;
    }

    // Already have an active lock
    if (wakeLockRef.current) {
      return true;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setIsActive(true);

      // Listen for release events (e.g., tab hidden)
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
        setIsActive(false);
        console.log("[WakeLock] Liberado");
      });

      console.log("[WakeLock] Ativado - tela não desligará");
      return true;
    } catch (error) {
      // This can happen if:
      // - Document is not visible
      // - Battery saver is active
      // - Another error occurred
      console.warn("[WakeLock] Falha ao ativar:", error);
      wakeLockRef.current = null;
      setIsActive(false);
      return false;
    }
  }, [isSupported]);

  /**
   * Release the wake lock (allow screen to turn off)
   */
  const release = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
        console.log("[WakeLock] Liberado manualmente");
      } catch (error) {
        console.warn("[WakeLock] Erro ao liberar:", error);
      }
    }
  }, []);

  // Re-acquire wake lock when document becomes visible again
  useEffect(() => {
    if (!isSupported || !isActive) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        // Re-acquire the lock when tab becomes visible again
        await request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSupported, isActive, request]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    request,
    release,
  };
}

/**
 * Simple hook that automatically keeps screen on while mounted
 * Usage: useKeepAwake() at top of meditation component
 */
export function useKeepAwake(enabled = true) {
  const { request, release, isSupported } = useWakeLock();

  useEffect(() => {
    if (!enabled || !isSupported) return;

    request();

    return () => {
      release();
    };
  }, [enabled, isSupported, request, release]);
}

// Type declarations for Wake Lock API
interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: "screen";
  release(): Promise<void>;
}

interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

declare global {
  interface Navigator {
    wakeLock: WakeLock;
  }
}
