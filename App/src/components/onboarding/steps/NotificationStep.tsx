import { useState } from "react";
import { motion } from "motion/react";
import { Bell, BellOff, Check, Smartphone } from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWA } from "@/hooks/usePWA";

export const NotificationStep = () => {
  const { nextStep } = useOnboarding();
  const { isSupported, isSubscribed, subscribe, isLoading } = usePushNotifications();
  const { isIOS, isStandalone } = usePWA();
  const [activated, setActivated] = useState(false);

  const handleActivate = async () => {
    const success = await subscribe();
    if (success) {
      setActivated(true);
      // Auto-advance after a brief celebration
      setTimeout(() => {
        nextStep();
      }, 1500);
    }
  };

  const handleSkip = () => {
    nextStep();
  };

  // iOS não instalado: mostrar mensagem especial
  if (isIOS && !isStandalone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Smartphone size={40} strokeWidth={2} className="text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold mb-3"
        >
          Instale o App Primeiro
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground max-w-sm mb-6"
        >
          Para receber lembretes no iPhone, adicione o Bora à tela inicial primeiro. Você pode ativar notificações depois nas configurações.
        </motion.p>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onClick={handleSkip}
          className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors"
        >
          Continuar
        </motion.button>
      </div>
    );
  }

  // Não suportado: pular silenciosamente
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
            <BellOff size={40} strokeWidth={2} className="text-muted-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-bold mb-3"
        >
          Notificações Indisponíveis
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground max-w-sm mb-6"
        >
          Seu dispositivo não suporta notificações push. Você ainda pode usar todos os outros recursos do app.
        </motion.p>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          onClick={handleSkip}
          className="px-8 py-3 bg-muted hover:bg-muted/80 rounded-xl font-semibold transition-colors"
        >
          Continuar
        </motion.button>
      </div>
    );
  }

  // Já ativado ou acabou de ativar
  if (isSubscribed || activated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-6"
        >
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Check size={40} strokeWidth={3} className="text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-2xl font-bold mb-3"
        >
          Lembretes Ativados!
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-muted-foreground max-w-sm"
        >
          Você receberá lembretes para manter seus hábitos em dia.
        </motion.p>
      </div>
    );
  }

  // Estado normal: solicitar permissão
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
      {/* Hero Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="mb-6"
      >
        <div className="relative">
          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Icon Container */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <Bell size={40} strokeWidth={2} className="text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold mb-3"
      >
        Ativar Lembretes
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground max-w-sm mb-6"
      >
        Receba lembretes nos horários certos para manter seus hábitos em dia e não perder sua sequência.
      </motion.p>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 space-y-2"
      >
        {[
          "Lembretes nos horários dos seus hábitos",
          "Motivação para manter sua sequência",
          "Desative quando quiser nas configurações",
        ].map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>{benefit}</span>
          </div>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={handleActivate}
          disabled={isLoading}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {isLoading ? "Ativando..." : "Ativar Lembretes"}
        </button>
        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="px-8 py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          Agora não
        </button>
      </motion.div>
    </div>
  );
};
