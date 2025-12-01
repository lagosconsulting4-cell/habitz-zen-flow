import { useState, useEffect, useCallback } from "react";
import { registerSW } from "virtual:pwa-register";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface UsePWAReturn {
  // Estado de instalação
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;

  // Ações
  promptInstall: () => Promise<boolean>;

  // Estado de atualização
  needsUpdate: boolean;
  updateApp: () => void;

  // Service Worker
  swRegistration: ServiceWorkerRegistration | null;
}

export function usePWA(): UsePWAReturn {
  // Detectar plataforma
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  const [isAndroid] = useState(() => {
    if (typeof window === "undefined") return false;
    return /Android/.test(navigator.userAgent);
  });

  // Detectar se está instalado (standalone)
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true ||
      document.referrer.includes("android-app://")
    );
  });

  // Estado do prompt de instalação
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandalone);

  // Estado de atualização
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  // Service Worker registration
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Registrar Service Worker
  useEffect(() => {
    const updateCallback = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedsUpdate(true);
      },
      onOfflineReady() {
        console.log("[PWA] App pronto para uso offline");
      },
      onRegisteredSW(swUrl, registration) {
        console.log("[PWA] Service Worker registrado:", swUrl);
        if (registration) {
          setSwRegistration(registration);
        }
      },
      onRegisterError(error) {
        console.error("[PWA] Erro ao registrar Service Worker:", error);
      },
    });

    setUpdateSW(() => updateCallback);
  }, []);

  // Listener para beforeinstallprompt (Android/Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log("[PWA] App disponível para instalação");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log("[PWA] App instalado com sucesso");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Detectar mudança de display-mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Função para mostrar prompt de instalação
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log("[PWA] Prompt de instalação não disponível");
      return false;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("[PWA] Usuário aceitou a instalação");
        setInstallPrompt(null);
        return true;
      } else {
        console.log("[PWA] Usuário recusou a instalação");
        return false;
      }
    } catch (error) {
      console.error("[PWA] Erro ao mostrar prompt:", error);
      return false;
    }
  }, [installPrompt]);

  // Função para atualizar o app
  const updateApp = useCallback(() => {
    if (updateSW) {
      updateSW();
      setNeedsUpdate(false);
    }
  }, [updateSW]);

  return {
    isInstalled,
    isInstallable: !!installPrompt,
    isIOS,
    isAndroid,
    isStandalone,
    promptInstall,
    needsUpdate,
    updateApp,
    swRegistration,
  };
}

// Hook auxiliar para verificar se deve mostrar prompt iOS
export function useIOSInstallPrompt(): {
  shouldShow: boolean;
} {
  const { isIOS, isStandalone } = usePWA();

  // Mostrar sempre que for iOS e não estiver instalado
  const shouldShow = isIOS && !isStandalone;

  return { shouldShow };
}
