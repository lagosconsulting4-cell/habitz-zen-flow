import { motion } from "motion/react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const LEVELS = [
  { week: "Semana 1", label: "Init", xp: 45, icon: "🌱", unlocked: "Primeira manhã no horário" },
  { week: "Semana 2", label: "Lv. 2", xp: 62, icon: "⚡", unlocked: "Foco por 2h seguidas" },
  { week: "Semana 4", label: "Lv. 3", xp: 75, icon: "🔥", unlocked: "Rotina no piloto automático" },
  { week: "Semana 8", label: "Lv. 4", xp: 87, icon: "💪", unlocked: "Energia o dia todo" },
  { week: "Semana 12", label: "Máx.", xp: 94, icon: "🏆", unlocked: "Nova versão de você" },
];

export const PotentialChartStep = () => {
  const { trackChartView } = useTracking();

  useEffect(() => {
    trackChartView("progress");
  }, [trackChartView]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Você vai evoluir semana a semana
        </h2>
        <p className="text-sm text-slate-400">
          Não é força de vontade — é um sistema que te leva do zero ao resultado
        </p>
      </motion.div>

      {/* RPG Level progression */}
      <div className="flex flex-col gap-3">
        {LEVELS.map((level, index) => {
          const isFinal = index === LEVELS.length - 1;
          return (
            <motion.div
              key={level.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.35 }}
              className={`flex items-center gap-3 rounded-2xl p-3 border ${isFinal
                  ? "bg-lime-500/10 border-lime-500/40"
                  : "bg-white/5 border-white/8"
                }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isFinal ? "bg-lime-400/20" : "bg-slate-700"
                }`}>
                {level.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isFinal ? "text-lime-400" : "text-slate-500"}`}>
                      {level.label}
                    </span>
                    <span className="text-xs text-slate-600 ml-2">{level.week}</span>
                  </div>
                  <span className={`text-sm font-black ${isFinal ? "text-lime-400" : "text-slate-400"}`}>
                    {level.xp} XP
                  </span>
                </div>
                {/* XP Bar */}
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level.xp}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.65, ease: "easeOut" }}
                    className={`h-full rounded-full ${isFinal
                        ? "bg-gradient-to-r from-lime-500 to-lime-300"
                        : "bg-gradient-to-r from-slate-500 to-slate-400"
                      }`}
                  />
                </div>
                <p className={`text-xs truncate ${isFinal ? "text-lime-400/80" : "text-slate-500"}`}>
                  🔓 {level.unlocked}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="text-center"
      >
        <p className="text-xs text-slate-500">
          Evolução média dos usuários do Bora nas primeiras 12 semanas
        </p>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
