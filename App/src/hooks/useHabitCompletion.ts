import { useCallback, useRef } from "react";

interface CompletionOptions {
  enableHaptics?: boolean;
  enableSound?: boolean;
  onComplete?: () => void;
}

/**
 * Hook para gerenciar a experiência de gratificação ao completar um hábito
 * Inspirado no Apple Watch - minimalista e premium
 */
export const useHabitCompletion = (options: CompletionOptions = {}) => {
  const { enableHaptics = true, onComplete } = options;
  const isAnimatingRef = useRef(false);

  /**
   * Vibração sutil - padrão premium inspirado no Apple Watch
   * Sequência: pulso curto -> pausa -> pulso médio
   */
  const triggerHaptic = useCallback(() => {
    if (!enableHaptics) return;

    // Verifica se Vibration API está disponível
    if ("vibrate" in navigator) {
      // Padrão: [vibrar, pausa, vibrar] em ms
      // Mais sutil que vibração contínua
      navigator.vibrate([15, 50, 25]);
    }
  }, [enableHaptics]);

  /**
   * Trigger completo de gratificação
   * Coordena haptics + callbacks
   */
  const triggerCompletion = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    // Haptic feedback imediato
    triggerHaptic();

    // Callback após animação
    setTimeout(() => {
      onComplete?.();
      isAnimatingRef.current = false;
    }, 400);
  }, [triggerHaptic, onComplete]);

  /**
   * Trigger para desfazer (mais sutil)
   */
  const triggerUndo = useCallback(() => {
    if (enableHaptics && "vibrate" in navigator) {
      // Vibração única e curta para desfazer
      navigator.vibrate(10);
    }
  }, [enableHaptics]);

  return {
    triggerCompletion,
    triggerUndo,
    triggerHaptic,
  };
};

/**
 * Variantes de animação para Framer Motion
 * Usadas no CircularHabitCard para efeitos premium
 */
export const completionAnimationVariants = {
  // Animação do círculo interno (preenchimento)
  fillCircle: {
    initial: { scale: 0.85, opacity: 0 },
    completed: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }
    },
    exit: {
      scale: 0.85,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Animação do glow (brilho sutil)
  glow: {
    initial: { opacity: 0, scale: 0.8 },
    pulse: {
      opacity: [0, 0.6, 0],
      scale: [0.8, 1.15, 1.2],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },

  // Animação do ícone
  icon: {
    initial: { scale: 1 },
    completed: {
      scale: [1, 1.15, 1.05],
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  },

  // Animação do checkmark overlay
  checkmark: {
    initial: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          delay: 0.15
        },
        opacity: { duration: 0.1 }
      }
    }
  },

  // Ring completion pulse
  ringPulse: {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }
};

export default useHabitCompletion;
