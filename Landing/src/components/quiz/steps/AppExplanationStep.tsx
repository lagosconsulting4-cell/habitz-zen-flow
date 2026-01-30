import { motion } from "motion/react";
import { Brain, Zap, Clock, X, Check } from "lucide-react";
import { ContinueButton } from "../ContinueButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dopamine", label: "Otimização de Dopamina", icon: Zap },
  { id: "biology", label: "Ritmo Biológico", icon: Clock },
  { id: "mental-load", label: "Carga Mental Zero", icon: Brain },
];

export const AppExplanationStep = () => {
  const [activeTab, setActiveTab] = useState("dopamine");

  const tabContent = {
    dopamine: {
      title: "Seu cérebro precisa de vitórias rápidas",
      description: "A maioria das rotinas falha porque exige esforço antes da recompensa. O BORA inverte isso.",
      before: "Rotina comum: Esforço enorme → Nenhuma recompensa imediata → Cérebro desiste.",
      after: "Método BORA: Micro-vitória → Liberação de dopamina → Vontade de fazer mais.",
      image: "https://placehold.co/600x400/1e293b/a3e635?text=Dopamine+Loop",
    },
    biology: {
      title: "Pare de lutar contra seu relógio biológico",
      description: "Você tenta ser produtivo quando seu corpo pede descanso. Isso gera o ciclo de exaustão.",
      before: "Forçar produtividade às 14h (pico de cansaço natural).",
      after: "Tarefas de foca às 10h e tarefas automáticas às 14h.",
      image: "https://placehold.co/600x400/1e293b/a3e635?text=Bio+Rhythm",
    },
    "mental-load": {
      title: "Não gaste energia decidindo o que fazer",
      description: "Decidir cansa mais que fazer. Removemos o peso da decisão das suas costas.",
      before: "Acordar e pensar: 'O que tenho que fazer hoje?' (Gasta 20% da bateria mental).",
      after: "Acordar e executar o que já está pronto. (Foco total na ação).",
      image: "https://placehold.co/600x400/1e293b/a3e635?text=Zero+Decision",
    },
  };

  const content = tabContent[activeTab as keyof typeof tabContent];

  return (
    <div className="flex flex-col h-full">
      {/* Header with improved copy */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Não é mágica. <span className="text-lime-400">É neurociência aplicada.</span>
        </h2>
        <p className="text-sm text-slate-400">
          Entenda por que o método BORA funciona onde outros falharam.
        </p>
      </motion.div>

      {/* Modern Tabs */}
      <div className="flex flex-wrap justify-center mb-6 gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                isActive
                  ? "bg-lime-500/10 text-lime-400 border-lime-500/20 shadow-[0_0_15px_rgba(132,204,22,0.1)]"
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
              )}
            >
              <tab.icon className={cn("w-3 h-3", isActive ? "text-lime-400" : "text-slate-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Card with Glassmorphism */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 bg-[#121214] rounded-2xl p-5 border border-white/10 mb-6 flex flex-col sm:flex-row gap-6 shadow-xl"
      >
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-bold text-white leading-tight">
            {content.title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {content.description}
          </p>

          {/* Transformation Box - Before/After */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
              <div className="mt-0.5 bg-red-500/10 p-1 rounded-full text-red-500">
                <X className="w-3 h-3" strokeWidth={3} />
              </div>
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Como é hoje</span>
                <p className="text-xs text-red-300/80 mt-0.5 font-medium">
                  {content.before}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-lime-500/5 rounded-xl border border-lime-500/10 shadow-sm">
              <div className="mt-0.5 bg-lime-500/10 p-1 rounded-full text-lime-500">
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Com o BORA</span>
                <p className="text-xs text-lime-300/80 mt-0.5 font-medium">
                  {content.after}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
