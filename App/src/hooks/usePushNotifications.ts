import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePWA } from "./usePWA";

// VAPID public key - deve ser configurada nas variáveis de ambiente
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { swRegistration, isStandalone, isIOS } = usePWA();

  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar suporte
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC_KEY;

  // iOS só suporta push em PWA instalada (iOS 16.4+)
  const canUsePush = isSupported && (!isIOS || isStandalone);

  // Log de debug para diagnóstico de push notifications
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log("[Push] Estado do suporte:", {
      vapidKeyPresent: !!VAPID_PUBLIC_KEY,
      vapidKeyLength: VAPID_PUBLIC_KEY.length,
      hasServiceWorker: "serviceWorker" in navigator,
      hasPushManager: "PushManager" in window,
      hasNotification: "Notification" in window,
      isIOS,
      isStandalone,
      isSupported,
      canUsePush,
      permission: typeof Notification !== "undefined" ? Notification.permission : "undefined",
    });
  }, [isIOS, isStandalone, isSupported, canUsePush]);

  // Verificar se já está inscrito + sync silencioso com DB
  useEffect(() => {
    const checkSubscription = async () => {
      if (!swRegistration || !canUsePush) return;

      try {
        const subscription = await swRegistration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);

        // Se browser tem subscription mas DB pode estar desatualizado, re-sync silencioso
        if (subscription) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: existing } = await supabase
              .from("push_subscriptions")
              .select("id")
              .eq("endpoint", subscription.endpoint)
              .maybeSingle();

            if (!existing) {
              const json = subscription.toJSON();
              await supabase.from("push_subscriptions").upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: json.keys?.p256dh || "",
                auth: json.keys?.auth || "",
              }, { onConflict: "endpoint" });
              console.log("[Push] Re-synced subscription to DB");
            }
          }
        }
      } catch (err) {
        console.error("[Push] Erro ao verificar subscription:", err);
      }
    };

    checkSubscription();
  }, [swRegistration, canUsePush]);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!canUsePush) {
      setError("Push notifications não suportadas neste dispositivo");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        console.log("[Push] Permissão concedida");
        return true;
      } else if (result === "denied") {
        setError("Permissão negada. Você pode alterar nas configurações do navegador.");
        return false;
      } else {
        setError("Permissão não concedida");
        return false;
      }
    } catch (err) {
      console.error("[Push] Erro ao solicitar permissão:", err);
      setError("Erro ao solicitar permissão");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canUsePush]);

  // Inscrever-se para push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!swRegistration || !canUsePush) {
      setError("Service Worker não disponível");
      return false;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    setError(null);

    let subscription: PushSubscription | null = null;
    try {
      // Criar subscription
      subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log("[Push] Subscription criada");

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Extrair keys da subscription
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || "";
      const auth = subscriptionJson.keys?.auth || "";

      // Salvar no Supabase
      const { error: dbError } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        }, {
          onConflict: "endpoint",
        });

      if (dbError) {
        throw dbError;
      }

      setIsSubscribed(true);
      console.log("[Push] Subscription salva no servidor");
      return true;
    } catch (err) {
      // Clean up browser subscription if DB save failed (prevents orphaned state)
      if (subscription) {
        try { await subscription.unsubscribe(); } catch { /* ignore cleanup errors */ }
      }
      console.error("[Push] Erro ao inscrever:", err);
      setError("Erro ao ativar notificações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, canUsePush, permission, requestPermission]);

  // Cancelar inscrição
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!swRegistration) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await swRegistration.pushManager.getSubscription();

      if (subscription) {
        // Remover do Supabase
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        // Cancelar no navegador
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      console.log("[Push] Subscription cancelada");
      return true;
    } catch (err) {
      console.error("[Push] Erro ao cancelar inscrição:", err);
      setError("Erro ao desativar notificações");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration]);

  return {
    isSupported: canUsePush,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
