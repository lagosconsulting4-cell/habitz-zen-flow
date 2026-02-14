import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, Clock, ChevronDown } from "lucide-react";
import { ContinueButton } from "../ContinueButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CONCEPTS = [
  {
    id: 0,
    icon: Zap,
    label: "Otimização de Dopamina",
    title: "Vitórias Rápidas",
    problem: "Esforço alto → Zero recompensa → Desiste",
    solution: "Micro-passo → Recompensa imediata → Continua",
  },
  {
    id: 1,
    icon: Clock,
    label: "Ritmo Biológico",
    title: "Sincronização Perfeita",
    problem: "Força foco no horário errado → Exaustão",
    solution: "Tarefa certa no horário certo → Energia",
  },
  {
    id: 2,
    icon: Brain,
    label: "Carga Mental Zero",
    title: "Decisão Zero",
    problem: "Acordar → Decidir o que fazer → Energia gasta",
    solution: "Acordar → Plano pronto → Apenas executar",
  },
];

export const AppExplanationStep = () => {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="relative w-full h-full min-h-[100dvh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/images/brain-bg.png"
          alt="Brain Background"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1920&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/80 via-[#0A0A0B]/90 to-[#0A0A0B]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 py-20">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black text-white mb-3 text-center max-w-4xl leading-tight"
        >
          Não é mágica. <span className="text-lime-400">É neurociência aplicada.</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg md:text-xl text-slate-400 mb-16 text-center"
        >
          Entenda por que o método BORA funciona onde outros falharam
        </motion.p>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-3xl mb-16 space-y-4"
        >
          {CONCEPTS.map((concept, index) => {
            const Icon = concept.icon;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className={cn(
                    "w-full px-6 py-5 rounded-2xl border-2 transition-all backdrop-blur-sm",
                    "flex items-center justify-between gap-4",
                    isOpen
                      ? "bg-lime-500/10 border-lime-500/30 shadow-[0_0_30px_rgba(163,230,53,0.2)]"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={cn("w-6 h-6", isOpen ? "text-lime-400" : "text-slate-400")} />
                    <div className="text-left">
                      <h3 className={cn("font-bold text-lg", isOpen ? "text-white" : "text-slate-300")}>
                        {concept.label}
                      </h3>
                      <p className="text-sm text-slate-400">{concept.title}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isOpen ? "rotate-180 text-lime-400" : "text-slate-400"
                    )}
                  />
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 px-6 pb-6 space-y-4">
                        {/* Como é hoje */}
                        <div className="bg-red-500/5 border-2 border-red-500/20 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">❌</span>
                            <h4 className="text-base font-bold text-red-400 uppercase tracking-wide">
                              Como é hoje
                            </h4>
                          </div>
                          <p className="text-slate-300 text-base leading-relaxed">
                            {concept.problem}
                          </p>
                        </div>

                        {/* Com o BORA */}
                        <div className="bg-lime-500/10 border-2 border-lime-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(163,230,53,0.15)]">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-lime-500/10 p-1.5">
                              <img
                                src="https://i.ibb.co/CstYtpdH/meditar.png"
                                alt="BORA Logo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <h4 className="text-base font-bold text-lime-400 uppercase tracking-wide">
                              Com o BORA
                            </h4>
                          </div>
                          <p className="text-white text-base leading-relaxed font-medium">
                            {concept.solution}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
