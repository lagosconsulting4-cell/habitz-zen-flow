import { motion } from "motion/react";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const BATTERY_SEGMENTS = 5;

const EnergyBattery = ({
  fillPercent,
  color,
  delay = 0,
}: {
  fillPercent: number;
  color: "gray" | "lime";
  delay?: number;
}) => {
  const filled = Math.round((fillPercent / 100) * BATTERY_SEGMENTS);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Battery outline */}
      <div className="relative flex flex-col-reverse gap-1.5 p-2 bg-slate-800 rounded-xl border border-white/10 w-16">
        {/* Battery nub */}
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-2 rounded-t-md ${color === "lime" ? "bg-lime-400" : "bg-slate-600"}`} />
        {Array.from({ length: BATTERY_SEGMENTS }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: i < filled ? 1 : 0.15,
              scaleY: 1,
            }}
            transition={{
              delay: delay + i * 0.1,
              duration: 0.3,
              ease: "easeOut",
            }}
            className={`h-5 rounded-md ${i < filled
              ? color === "lime"
                ? "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                : "bg-slate-500"
              : "bg-slate-700"
              }`}
          />
        ))}
      </div>
      <span className={`text-2xl font-black ${color === "lime" ? "text-lime-400" : "text-slate-500"}`}>
        {fillPercent}%
      </span>
    </div>
  );
};

export const SocialProofChartStep = () => {
  const { trackChartView } = useTracking();

  useEffect(() => {
    trackChartView("comparison");
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
          Quem tem um plano consegue{" "}
          <span className="text-lime-400">5x mais</span>
        </h2>
      </motion.div>

      {/* Energy Comparison */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-stretch justify-center gap-4"
      >
        {/* Without plan */}
        <div className="flex-1 bg-slate-800/60 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
          <span className="text-2xl">😩</span>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Sem plano</p>
          <EnergyBattery fillPercent={18} color="gray" delay={0.3} />
          <p className="text-xs text-slate-500 leading-relaxed">
            Tenta por 3 dias, desiste, tenta de novo...
          </p>
        </div>

        {/* VS */}
        <div className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-12 bg-white/10" />
            <span className="text-xs font-black text-slate-500 uppercase">vs</span>
            <div className="w-px h-12 bg-white/10" />
          </div>
        </div>

        {/* With Bora */}
        <div className="flex-1 bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
          <span className="text-2xl">🚀</span>
          <p className="text-xs text-lime-400 font-semibold uppercase tracking-wide">Com o Bora</p>
          <EnergyBattery fillPercent={94} color="lime" delay={0.5} />
          <p className="text-xs text-lime-400/80 leading-relaxed">
            Hábitos virando automáticos em semanas
          </p>
        </div>
      </motion.div>

      {/* Stat callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4 text-center"
      >
        <p className="text-sm text-white font-medium">
          💡 <span className="text-lime-400 font-black">94 de cada 100</span> usuários do Bora mantêm a rotina por mais de 3 meses
        </p>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
