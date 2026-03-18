import { useState, memo } from "react";
import { motion } from "motion/react";
import { Check, Share, MoreVertical, Smartphone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingV2 } from "../OnboardingProviderV2";
import { useEventTracker } from "@/hooks/useEventTracker";
import { usePWA } from "@/hooks/usePWA";

export const S3InstallPWASoft = memo(function S3InstallPWASoft() {
  const { nextStep, prevStep, setIsPWAInstalled } = useOnboardingV2();
  const { trackEvent } = useEventTracker();
  const { isInstalled, isIOS, isAndroid, isInstallable, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    if (success) {
      setIsPWAInstalled(true);
      trackEvent("onboarding_v2_pwa_soft_action", { action: "installed" }, "onboarding_v2");
    }
    setIsInstalling(false);
  };

  // --- Already installed state ---
  if (isInstalled) {
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
          className="text-2xl font-bold text-foreground mb-3"
        >
          Você já está com o app instalado.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6 w-full max-w-xs"
        >
          <Button onClick={nextStep} size="lg" className="w-full rounded-xl">
            Continuar
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- Not installed state ---
  return (
    <div className="h-full flex flex-col px-6 py-6">
      {/* Scroll area — mesmo padrão do S13 */}
      <div className="flex-1 min-h-0 overflow-y-auto max-w-md mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold text-foreground mb-4 text-center"
        >
          Uma coisa antes de continuar.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-base text-muted-foreground leading-relaxed mb-2 text-center"
        >
          Adicione o Bora à sua tela inicial para ter notificações e acesso rápido.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-base text-muted-foreground mb-6 text-center"
        >
          Leva menos de 30 segundos.
        </motion.p>

        {/* Vídeo — mesmo tamanho do S13 */}
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

        {/* Tutorial box — mesmo padrão do S13 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-8"
        >
          {isIOS ? (
            <div className="bg-muted/50 rounded-2xl p-5 border border-border/50 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Share className="w-4 h-4 text-primary" />
                Tutorial para iPhone/iPad
              </p>
              <p className="text-sm text-muted-foreground">
                Toque em <span className="font-medium text-foreground">Compartilhar</span> na barra do Safari, depois em{" "}
                <span className="font-medium text-foreground">&quot;Adicionar à Tela Início&quot;</span>.
              </p>
            </div>
          ) : isAndroid ? (
            <div className="bg-muted/50 rounded-2xl p-5 border border-border/50 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <MoreVertical className="w-4 h-4 text-primary" />
                Tutorial para Android
              </p>
              <p className="text-sm text-muted-foreground">
                Toque nos <span className="font-medium text-foreground">três pontinhos</span> do Chrome e selecione{" "}
                <span className="font-medium text-foreground">&quot;Adicionar à tela inicial&quot;</span>.
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
              <p className="text-sm text-muted-foreground">
                Abra este link no seu celular para instalar o app na tela inicial.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* CTAs — fora do scroll, ancorados ao bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="space-y-3 max-w-md mx-auto w-full pt-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
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

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={prevStep} onMouseDown={(e) => e.preventDefault()} className="h-10 w-10 shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <button
            onClick={() => {
              trackEvent("onboarding_v2_pwa_soft_action", { action: "skipped" }, "onboarding_v2");
              nextStep();
            }}
            className="flex-1 text-sm text-muted-foreground/60 py-2 hover:text-muted-foreground transition-colors border border-border/40 rounded-xl"
          >
            Fazer isso depois
          </button>
        </div>
      </motion.div>
    </div>
  );
});
