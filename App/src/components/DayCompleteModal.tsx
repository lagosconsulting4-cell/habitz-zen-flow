import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, Gem, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useProfile } from "@/hooks/useProfile";

interface DayCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  gemsAwarded: number;
}

export const DayCompleteModal = ({
  isOpen,
  onClose,
  streakDays,
  gemsAwarded,
}: DayCompleteModalProps) => {
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();
  const { displayName } = useProfile();
  const firstName = displayName?.split(" ")[0] || "";

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm mx-4 rounded-3xl px-6 py-8 flex flex-col items-center text-center overflow-hidden"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(163, 230, 53, 0.08) 0%, rgba(163, 230, 53, 0.03) 40%, transparent 70%)",
            }}
          />

          <AnimatePresence mode="wait">
            {showContent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 flex flex-col items-center text-center w-full"
              >
                {/* Progress circle with check */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                >
                  <CircularProgress
                    progress={100}
                    size={120}
                    strokeWidth={6}
                    trackColor="rgba(163, 230, 53, 0.15)"
                    progressColor="#A3E635"
                    glow={false}
                  >
                    <div className="w-14 h-14 rounded-full bg-lime-400/20 flex items-center justify-center">
                      <Check className="w-8 h-8 text-lime-400" strokeWidth={3} />
                    </div>
                  </CircularProgress>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm font-semibold text-lime-400 mt-2"
                  >
                    100%
                  </motion.p>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mt-5"
                >
                  Dia Concluído!
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-white/60 mt-2 max-w-[250px]"
                >
                  Você completou todos os seus hábitos hoje
                  {firstName ? `, ${firstName}` : ""}!
                </motion.p>

                {/* Info chips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-3 mt-6"
                >
                  {/* Gems chip */}
                  <div
                    className="flex items-center gap-3 rounded-2xl p-4 border border-white/5"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-lime-400/15 flex items-center justify-center">
                      <Gem className="w-5 h-5 text-lime-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">
                        Recompensa
                      </p>
                      <p className="text-sm font-bold text-white">
                        +{gemsAwarded} Gemas
                      </p>
                    </div>
                  </div>

                  {/* Streak chip */}
                  <div
                    className="flex items-center gap-3 rounded-2xl p-4 border border-white/5"
                    style={{ backgroundColor: "#1a1a1a" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-lime-400/15 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-lime-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase tracking-widest text-white/40">
                        Frequência
                      </p>
                      <p className="text-sm font-bold text-white">
                        Streak de {streakDays} Dias
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="w-full mt-6 space-y-3"
                >
                  <Button
                    onClick={onClose}
                    className="w-full h-14 rounded-full bg-gradient-to-b from-lime-300 to-lime-500 hover:from-lime-200 hover:to-lime-400 text-black font-bold text-base border-0"
                    style={{
                      boxShadow:
                        "0 4px 24px rgba(163, 230, 53, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    Fechar Dia
                  </Button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/app/progress");
                    }}
                    className="w-full text-xs uppercase tracking-widest text-white/40 hover:text-white/60 transition-colors py-2"
                  >
                    Ver Histórico
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default DayCompleteModal;
