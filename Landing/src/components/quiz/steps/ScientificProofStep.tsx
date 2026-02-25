import { motion } from "motion/react";
import { ContinueButton } from "../ContinueButton";

const BENEFITS = [
  {
    emoji: "🏆",
    number: "89%",
    title: "Mantêm hábitos por 3 meses ou mais",
    sub: "Sem academia cara, sem dieta impossível",
    delay: 0.15,
  },
  {
    emoji: "⏱️",
    number: "8 min",
    title: "É tudo que você precisa por dia",
    sub: "Menos de um episódio de Reels",
    delay: 0.3,
  },
  {
    emoji: "😴",
    number: "1ª semana",
    title: "Já dormem melhor",
    sub: "Mais energia logo nos primeiros dias",
    delay: 0.45,
  },
];

export const ScientificProofStep = () => {
  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Subtle lime glow top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(132,204,22,0.12) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-5 py-16 text-center gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-lime-400">O que o Bora entrega</p>
          <h2 className="text-3xl font-black text-white leading-tight max-w-sm mx-auto">
            Resultados reais,{" "}
            <span className="text-lime-400">em semanas</span>
          </h2>
        </motion.div>

        {/* Benefit Cards */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {BENEFITS.map((b) => (
            <motion.div
              key={b.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: b.delay, duration: 0.4 }}
              className="flex items-center gap-4 bg-[#141416] border border-white/8 rounded-2xl p-4 text-left"
            >
              {/* Emoji circle */}
              <div className="w-14 h-14 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center flex-shrink-0 text-2xl">
                {b.emoji}
              </div>
              <div>
                <p className="text-2xl font-black text-lime-400 leading-none">{b.number}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{b.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{b.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <ContinueButton />
        </motion.div>
      </div>
    </div>
  );
};
