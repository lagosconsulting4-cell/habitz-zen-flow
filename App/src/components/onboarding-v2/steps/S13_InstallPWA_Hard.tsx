import { useState, useEffect, useRef, memo } from "react";
import { motion } from "motion/react";
import { Check, Share, MoreVertical, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { usePWA } from "@/hooks/usePWA";

// ============================================================================
// COMPONENT
// ============================================================================

export const S13InstallPWAHard = memo(function S13InstallPWAHard() {
  const { nextStep, setIsPWAInstalled } = useOnboardingV2();
  const { trackEvent } = useEventTracker();
  const { isInstalled, isIOS, isAndroid, isInstallable, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasAutoAdvanced = useRef(false);

  // Auto-skip: if already installed on mount, advance immediately
  useEffect(() => {
    if (isInstalled && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      nextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mid-step detection: user installs while on S13
  useEffect(() => {
    if (isInstalled && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true;
      setIsPWAInstalled(true);
      setShowSuccess(true);
      const timer = setTimeout(() => nextStep(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, setIsPWAInstalled, nextStep]);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    if (success) {
      setIsPWAInstalled(true);
      trackEvent("onboarding_v2_pwa_hard_action", { action: "installed" }, "onboarding_v2");
    }
    setIsInstalling(false);
  };

  // --- Success state (after mid-step install) ---
  if (showSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Check size={40} strokeWidth={3} className="text-white" />
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-2xl font-bold text-foreground"
        >
          App instalado!
        </motion.h2>
      </div>
    );
  }

  // --- Not installed state (main render) ---
  return (
    <div className="h-full flex flex-col px-6 py-6 bg-muted/30">
      <div className="flex-1 min-h-0 overflow-y-auto max-w-md mx-auto w-full">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-foreground mb-4 text-center"
        >
          Instale o app para receber seus lembretes.
        </motion.h2>

        {/* Copy — more direct/urgent than S3 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-base text-muted-foreground leading-relaxed mb-2 text-center"
        >
          Sua rotina está pronta. Para receber o aviso na hora certa de cada hábito, instale o app na sua tela inicial.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-base text-muted-foreground font-medium mb-6 text-center"
        >
          Leva 30 segundos. Vale muito a pena.
        </motion.p>

        {/* Video Tutorial — reused from InstallPrompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-6"
        >
          <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-border/50 bg-muted/30 mx-auto" style={{ width: '180px', height: '330px' }}>
            <video autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover">
              <source src={`${import.meta.env.BASE_URL}videos/install-tutorial.mp4`} type="video/mp4" />
            </video>
          </div>
        </motion.div>

        {/* Platform-specific tutorial — same branching as S3, but LARGER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-8"
        >
          {isIOS ? (
            <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 space-y-3">
              <p className="text-base font-semibold text-foreground flex items-center gap-2">
                <Share className="w-5 h-5 text-primary" />
                Tutorial para iPhone/iPad
              </p>
              <p className="text-base text-muted-foreground">
                Toque em <span className="font-medium text-foreground">Compartilhar</span> na barra do Safari, depois em{" "}
                <span className="font-medium text-foreground">&quot;Adicionar à Tela Início&quot;</span>.
              </p>
            </div>
          ) : isAndroid ? (
            <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 space-y-3">
              <p className="text-base font-semibold text-foreground flex items-center gap-2">
                <MoreVertical className="w-5 h-5 text-primary" />
                Tutorial para Android
              </p>
              <p className="text-base text-muted-foreground">
                Toque nos <span className="font-medium text-foreground">três pontinhos</span> do Chrome e selecione{" "}
                <span className="font-medium text-foreground">&quot;Adicionar à tela inicial&quot;</span>.
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
              <p className="text-base text-muted-foreground">
                Abra este link no seu celular para instalar o app na tela inicial.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="space-y-3 max-w-md mx-auto w-full pt-4"
      >
        {isInstallable && (
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            size="lg"
            className="w-full rounded-xl"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Instalando...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-1" />
                Instalar agora
              </>
            )}
          </Button>
        )}

        {/* Very discrete skip button — per spec: text-sm, opacity-60 */}
        <button
          onClick={() => {
            trackEvent("onboarding_v2_pwa_hard_action", { action: "skipped" }, "onboarding_v2");
            nextStep();
          }}
          className="w-full text-sm text-muted-foreground/60 py-2 hover:text-muted-foreground transition-colors border border-border/40 rounded-xl"
        >
          Continuar sem instalar
        </button>
      </motion.div>
    </div>
  );
});
