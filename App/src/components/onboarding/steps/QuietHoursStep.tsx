import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Clock, ChevronDown } from "lucide-react";
import { useOnboarding } from "../OnboardingProvider";

// Generate time options in 30-min intervals (00:00, 00:30, 01:00, ...)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

export const QuietHoursStep = () => {
  const {
    nextStep,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
    setQuietHoursEnabled,
    setQuietHoursStart,
    setQuietHoursEnd,
  } = useOnboarding();

  const [showConfig, setShowConfig] = useState(quietHoursEnabled);

  const handleEnable = () => {
    setQuietHoursEnabled(true);
    setShowConfig(true);
  };

  const handleSkip = () => {
    setQuietHoursEnabled(false);
    nextStep();
  };

  const handleConfirm = () => {
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
      {/* Hero Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl"
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
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Moon size={40} strokeWidth={2} className="text-white" />
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
        Horário de Silêncio
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground max-w-sm mb-6"
      >
        Quer definir um horário em que a Foquinha <strong>não</strong> deve te mandar mensagens no WhatsApp?
      </motion.p>

      <AnimatePresence mode="wait">
        {!showConfig ? (
          /* Initial choice */
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <button
              onClick={handleEnable}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors"
            >
              Sim, quero configurar
            </button>
            <button
              onClick={handleSkip}
              className="px-8 py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Não, pode mandar sempre
            </button>
          </motion.div>
        ) : (
          /* Time configuration */
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5 w-full max-w-xs"
          >
            {/* Time pickers */}
            <div className="w-full space-y-3">
              <TimeSelect
                label="Início do silêncio"
                value={quietHoursStart}
                onChange={setQuietHoursStart}
              />
              <TimeSelect
                label="Fim do silêncio"
                value={quietHoursEnd}
                onChange={setQuietHoursEnd}
              />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
              <Clock size={16} className="shrink-0" />
              <span>
                Nenhuma mensagem entre <strong className="text-foreground">{quietHoursStart}</strong> e{" "}
                <strong className="text-foreground">{quietHoursEnd}</strong>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleConfirm}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowConfig(false);
                  setQuietHoursEnabled(false);
                }}
                className="px-8 py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================================
 * TimeSelect — styled select for time picking
 * ============================================================================ */

interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeSelect = ({ label, value, onChange }: TimeSelectProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-muted border border-border rounded-lg px-4 py-2.5 pr-9 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  </div>
);
