import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Bell, Smartphone } from "lucide-react";
import { IllustrationCheckmark } from "../OnboardingIllustrations";
import { Button } from "@/components/ui/button";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { usePWA } from "@/hooks/usePWA";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// ============================================================================
// COMPONENT
// ============================================================================

export const S14Notifications = () => {
  const { nextStep, prevStep, setNotificationsGranted, isPWAInstalled } = useOnboardingV2();
  const { trackEvent } = useEventTracker();
  const { isInstalled } = usePWA();
  const { isSupported, isSubscribed, isLoading, error, subscribe } = usePushNotifications();
  const [showSuccess, setShowSuccess] = useState(false);
  const hasAutoAdvanced = useRef(false);

  const pwaReady = isInstalled || isPWAInstalled;

  // Auto-advance if already subscribed
  useEffect(() => {
    if (isSubscribed && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      setNotificationsGranted(true);
      setShowSuccess(true);
      const timer = setTimeout(() => nextStep(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, setNotificationsGranted, nextStep]);

  const handleActivate = async () => {
    const success = await subscribe();
    if (success) {
      setNotificationsGranted(true);
      trackEvent("onboarding_v2_notifications_action", { action: "granted" }, "onboarding_v2");
      setShowSuccess(true);
      setTimeout(() => nextStep(), 1500);
    }
  };

  // ---- State (a): PWA not installed — blocked UI ----
  if (!pwaReady) {
    return (
      <div className="h-full flex flex-col px-6 py-8">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Para ativar os lembretes, você precisa instalar o app primeiro.
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed">
              As notificações só funcionam depois que o Bora estiver na sua tela inicial.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="space-y-3 max-w-md mx-auto w-full" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}>
          <Button
            onClick={() => prevStep()}
            size="lg"
            className="w-full rounded-xl"
          >
            <Smartphone className="w-5 h-5 mr-1" />
            Instalar o app agora
          </Button>

          <button
            onClick={() => {
              trackEvent("onboarding_v2_notifications_action", { action: "skipped_no_pwa" }, "onboarding_v2");
              nextStep();
            }}
            className="w-full text-sm text-muted-foreground/60 py-2 hover:text-muted-foreground transition-colors border border-border/40 rounded-xl"
          >
            Continuar sem notificações
          </button>
        </div>
      </div>
    );
  }

  // ---- State (c): Success animation ----
  if (showSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <IllustrationCheckmark />
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-2xl font-bold text-foreground"
        >
          Lembretes ativados!
        </motion.h2>
      </div>
    );
  }

  // ---- State (b): Normal — PWA installed, not yet subscribed ----
  return (
    <div className="h-full flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Bell icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-foreground mb-4"
        >
          A última peça.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-base text-muted-foreground leading-relaxed mb-8"
        >
          Quer que a gente te avise na hora certa de cada hábito? Quem ativa os lembretes mantém o hábito por muito mais tempo. É a diferença entre a primeira semana e o segundo mês.
        </motion.p>

        {/* Error display */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive mb-4"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="space-y-3 max-w-md mx-auto w-full"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
      >
        <Button
          onClick={handleActivate}
          disabled={isLoading || !isSupported}
          size="lg"
          className="w-full rounded-xl"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Ativando...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5 mr-1" />
              Ativar lembretes
            </>
          )}
        </Button>

        <button
          onClick={() => {
            trackEvent("onboarding_v2_notifications_action", { action: "skipped" }, "onboarding_v2");
            nextStep();
          }}
          className="w-full text-sm text-muted-foreground/60 py-2 hover:text-muted-foreground transition-colors border border-border/40 rounded-xl"
        >
          Agora não
        </button>

        {!isSupported && (
          <p className="text-xs text-muted-foreground/60 text-center">
            Notificações não suportadas neste navegador.
          </p>
        )}
      </motion.div>
    </div>
  );
};
