import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Smartphone, Share, Plus, ChevronRight, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "../QuizProvider";
import { useTracking } from "@/hooks/useTracking";
import { usePWA } from "@/hooks/usePWA";

const IOSStep = ({ step, icon, text }: { step: number; icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-3 group">
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
      {step}
    </div>
    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
      {icon}
    </div>
    <span className="text-sm text-slate-300 font-medium">{text}</span>
  </div>
);

export const PWAInstallStep = () => {
  const { pwaInstalled, setPwaInstalled, setPwaInstallPromptShown, nextStep } = useQuiz();
  const { trackPWAPromptShown, trackPWAInstalled } = useTracking();
  const { isInstalled, isInstallable, isIOS, promptInstall } = usePWA();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackPWAPromptShown();
    setPwaInstallPromptShown(true);
  }, [trackPWAPromptShown, setPwaInstallPromptShown]);

  // Sincroniza estado global quando o app for instalado
  useEffect(() => {
    if (isInstalled && !pwaInstalled) {
      setPwaInstalled(true);
      trackPWAInstalled(true, "prompt");
    }
  }, [isInstalled, pwaInstalled, setPwaInstalled, trackPWAInstalled]);

  const handleInstall = async () => {
    setIsLoading(true);
    const success = await promptInstall();
    trackPWAInstalled(success, "prompt");
    if (success) {
      setPwaInstalled(true);
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    nextStep();
  };

  const showInstallCTA = isInstallable && !isIOS && !pwaInstalled;
  const alreadyInstalled = pwaInstalled || isInstalled;

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mt-2"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${alreadyInstalled ? "bg-green-100" : "bg-blue-100"
          }`}>
          {alreadyInstalled ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <Smartphone className="w-10 h-10 text-blue-600" />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="text-center px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {alreadyInstalled ? "App Instalado!" : "Instale o Bora"}
        </h2>
        <p className="text-base text-slate-400">
          Acesso rapido, push e offline direto da sua tela inicial.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1A1A1C] border border-white/10 rounded-2xl shadow-sm p-5 space-y-4">
          <div className="w-16 h-16 bg-lime-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-lime-500/10 border border-lime-500/20">
            <Download className="w-8 h-8 text-lime-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Instale o App para continuar
          </h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto text-base">
            Para garantir que você receba as notificações e o plano funcione corretamente.
          </p>
        </div>
      </motion.div>

      {
        !alreadyInstalled && (
          <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 bg-[#121214] mx-auto" style={{ maxWidth: "260px" }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-[9/19] object-contain"
            >
              <source src="/videos/install-tutorial.mp4" type="video/mp4" />
            </video>
          </div>
        )
      }

      {
        isIOS && !alreadyInstalled && (
          <div className="space-y-3 bg-[#1A1A1C] rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-1">Como instalar no iPhone</h3>
            <IOSStep step={1} icon={<Share className="w-4 h-4" />} text='Toque em "Compartilhar"' />
            <IOSStep step={2} icon={<Plus className="w-4 h-4" />} text='Selecione "Adicionar a Tela Inicial"' />
            <IOSStep step={3} icon={<ChevronRight className="w-4 h-4" />} text='Confirme em "Adicionar"' />
          </div>
        )
      }

      {
        !isIOS && !isInstallable && !alreadyInstalled && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
            <h3 className="font-semibold text-white mb-2">Nao apareceu o botao?</h3>
            <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
              <li>Abra o menu do navegador (tres pontos ...)</li>
              <li>Escolha "Instalar app" ou "Adicionar a tela inicial"</li>
              <li>Confirme a instalacao</li>
            </ol>
          </div>
        )
      }

      {
        showInstallCTA && (
          <Button
            onClick={handleInstall}
            disabled={isLoading}
            size="lg"
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-primary/90"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Instalando...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Instalar Agora
              </>
            )}
          </Button>
        )
      }


      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        className="w-full max-w-md"
      >
        <Button
          size="lg"
          onClick={handleContinue}
          className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900"
        >
          Pronto
        </Button>
      </motion.div>
    </div >
  );
};
