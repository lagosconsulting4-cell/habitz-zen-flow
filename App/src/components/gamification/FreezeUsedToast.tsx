import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield } from "lucide-react";

interface FreezeUsedData {
  streakSaved: number;
}

/**
 * FreezeUsedToast Component
 *
 * Toast de notificação que aparece quando um Streak Freeze é consumido automaticamente
 * para proteger o streak do usuário.
 *
 * Ouve o evento customizado 'gamification:freeze-used' disparado pelo realtime listener.
 *
 * Usa: Framer Motion para animações
 *
 * Uso (colocar uma vez no App/Dashboard):
 * <FreezeUsedToast />
 */
export function FreezeUsedToast() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<FreezeUsedData | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const eventData = e.detail as { streakSaved?: number };
      setData({ streakSaved: eventData.streakSaved || 0 });
      setVisible(true);

      // Auto-esconder após 5 segundos
      const timeout = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timeout);
    };

    // Registrar listener para evento customizado
    window.addEventListener("gamification:freeze-used" as any, handler);

    return () => {
      window.removeEventListener("gamification:freeze-used" as any, handler);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && data && (
        <motion.div
          key="freeze-used-toast"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
          {/* Toast card com gradiente azul/cyan */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 shadow-2xl text-white overflow-hidden relative">
            {/* Background pattern subtle */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -ml-8 -mb-8" />
            </div>

            {/* Conteúdo do toast */}
            <div className="relative z-10">
              {/* Header com ícone e título */}
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 flex-shrink-0" />
                <p className="font-bold text-base">Streak Freeze Usado!</p>
              </div>

              {/* Mensagem descritiva */}
              <p className="text-sm leading-relaxed">
                Você não completou seus hábitos hoje, mas usamos 1 freeze para
                proteger seu streak de{" "}
                <strong className="text-white">{data.streakSaved} dias</strong>!
                ✨
              </p>

              {/* Mensagem de dica */}
              <p className="text-xs mt-2 opacity-90">
                Você tem mais freezes disponíveis. Volte amanhã!
              </p>
            </div>

            {/* Barra de progresso de dismissão */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FreezeUsedToast;
