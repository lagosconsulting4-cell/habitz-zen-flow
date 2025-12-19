import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAReturn {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<boolean>;
}

const detectStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
};

export function usePWA(): UsePWAReturn {
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  const [isAndroid] = useState(() => {
    if (typeof window === "undefined") return false;
    return /Android/.test(navigator.userAgent);
  });

  const [isStandalone, setIsStandalone] = useState(() => detectStandalone());
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => detectStandalone());

  // Listen to display-mode changes (important on iOS)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Capture beforeinstallprompt (Android/Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Re-verify install state when the tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsInstalled(detectStandalone());
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallPrompt(null);
        return true;
      }
    } catch (error) {
      console.error("[PWA] Failed to show install prompt:", error);
    }
    return false;
  }, [installPrompt]);

  return {
    isInstalled,
    isInstallable: !!installPrompt,
    isIOS,
    isAndroid,
    isStandalone,
    promptInstall,
  };
}
