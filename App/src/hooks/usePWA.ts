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
    const detected = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log("[PWA] iOS detectado:", detected, "User Agent:", navigator.userAgent);
    return detected;
  });

  const [isAndroid] = useState(() => {
    if (typeof window === "undefined") return false;
    const detected = /Android/.test(navigator.userAgent);
    console.log("[PWA] Android detectado:", detected, "User Agent:", navigator.userAgent);
    return detected;
  });

  // Função para detectar se está instalado (standalone)
  const checkIsStandalone = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true ||
      document.referrer.includes("android-app://")
    );
  }, []);

  const [isStandalone, setIsStandalone] = useState(() => checkIsStandalone());

  // Atualizar isStandalone quando display-mode muda (importante para iOS)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleChange = () => {
      const current = checkIsStandalone();
      setIsStandalone(current);
      console.log("[PWA] isStandalone atualizado:", current);
    };

    // Verificar imediatamente (para casos onde o PWA foi instalado e aberto)
    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [checkIsStandalone]);

  // Estado do prompt de instalação
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => checkIsStandalone());

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
      console.log("[PWA] App disponível para instalação (beforeinstallprompt disparado)");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log("[PWA] App instalado com sucesso (appinstalled disparado)");
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

  // Detectar quando o app foi desinstalado e resetar o prompt
  useEffect(() => {
    const checkAndResetPrompt = () => {
      const isInstalledNow = checkIsStandalone();
      // Se não está mais em standalone, limpar o status de instalado
      // para que o beforeinstallprompt possa ser disparado novamente
      if (!isInstalledNow && installPrompt === null) {
        // Força re-emissão do beforeinstallprompt trigger
        console.log("[PWA] App foi desinstalado, aguardando novo prompt");
      }
    };

    // Verificar a cada 2 segundos se o estado de standalone mudou
    const interval = setInterval(checkAndResetPrompt, 2000);
    return () => clearInterval(interval);
  }, [checkIsStandalone, installPrompt]);

  // Detectar mudança de display-mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Re-detectar instalação quando usuário volta à aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Quando a aba fica visível, re-verificar se o app ainda está instalado
        const isStandaloneNow = checkIsStandalone();
        setIsInstalled(isStandaloneNow);
        console.log("[PWA] Re-verificado status de instalação:", isStandaloneNow);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkIsStandalone]);

  // Verificar periodicamente se o app foi desinstalado
  useEffect(() => {
    const interval = setInterval(() => {
      const isStandaloneNow = checkIsStandalone();
      setIsInstalled((prev) => {
        if (prev !== isStandaloneNow) {
          console.log("[PWA] Status de instalação mudou para:", isStandaloneNow);
          return isStandaloneNow;
        }
        return prev;
      });
    }, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, [checkIsStandalone]);

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

  // Log consolidado do estado PWA (executado em cada render)
  const isInstallableValue = !!installPrompt;
  useEffect(() => {
    console.log("[PWA] Estado Atual:", {
      isIOS,
      isAndroid,
      isStandalone,
      isInstalled,
      isInstallable: isInstallableValue,
      shouldShowInstallPrompt: isIOS || isInstallableValue,
      swRegistration: !!swRegistration,
    });
  }, [isIOS, isAndroid, isStandalone, isInstalled, isInstallableValue, swRegistration]);

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
