import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { Smartphone, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useTracking } from "@/hooks/useTracking";

export const PWAInstallStep = () => {
  const { pwaInstalled, setPwaInstalled, setPwaInstallPromptShown, nextStep } = useQuiz();
  const { trackPWAPromptShown, trackPWAInstalled } = useTracking();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Track that PWA prompt was shown
    trackPWAPromptShown();
    setPwaInstallPromptShown(true);

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setPwaInstalled(true);
      setCanInstall(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [trackPWAPromptShown, setPwaInstallPromptShown, setPwaInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      trackPWAInstalled(false, "manual");
      // User needs to install manually
      alert("Para instalar: Clique no menu do navegador (⋮) > 'Instalar app' ou 'Adicionar à tela inicial'");
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      trackPWAInstalled(true, "prompt");
      setPwaInstalled(true);
      setCanInstall(false);
    } else {
      trackPWAInstalled(false, "prompt");
    }

    setDeferredPrompt(null);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          pwaInstalled ? "bg-green-100" : "bg-blue-100"
        }`}>
          {pwaInstalled ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <Smartphone className="w-10 h-10 text-blue-600" />
          )}
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-center mb-6 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          {pwaInstalled ? "App Instalado!" : "Instale o App Bora"}
        </h2>
        <p className="text-base text-slate-700">
          {pwaInstalled
            ? "Você já tem o Bora instalado no seu dispositivo!"
            : "Tenha acesso rápido e notificações para manter sua consistência"}
        </p>
      </motion.div>

      {/* Video Tutorial */}
      {!pwaInstalled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="w-full max-w-md mb-6"
        >
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
            {/* Placeholder for installation tutorial video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Download className="w-16 h-16 text-white mb-3 mx-auto opacity-80" />
                <p className="text-white text-sm font-medium px-4">
                  Tutorial de Instalação
                </p>
              </div>
            </div>
            {/* TODO: Add actual video embed showing installation steps */}
            {/* <iframe src="INSTALLATION_TUTORIAL_VIDEO_URL" ... /> */}
          </div>
        </motion.div>
      )}

      {/* Installation Steps */}
      {!pwaInstalled && !canInstall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="w-full max-w-md mb-6 px-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-900 mb-2">Como instalar:</h3>
            <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
              <li>Clique no menu do navegador (⋮)</li>
              <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
              <li>Confirme a instalação</li>
            </ol>
          </div>
        </motion.div>
      )}

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full max-w-md"
      >
        {pwaInstalled || !canInstall ? (
          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full h-14 text-lg font-bold bg-lime-500 hover:bg-lime-600 text-slate-900"
          >
            Pronto
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleInstall}
            className="w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="w-5 h-5 mr-2" />
            Instalar Agora
          </Button>
        )}
      </motion.div>
    </div>
  );
};
