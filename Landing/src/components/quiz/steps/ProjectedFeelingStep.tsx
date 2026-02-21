import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useQuiz } from "../QuizProvider";
import { ContinueButton } from "../ContinueButton";
import type { ProjectedFeeling } from "@/lib/quizConfig";

const SLIDER_STEPS: Array<{
  value: ProjectedFeeling;
  emoji: string;
  label: string;
}> = [
    { value: "sem_mudanca", emoji: "😐", label: "Igual" },
    { value: "muito_feliz", emoji: "🙂", label: "Melhor" },
    { value: "sem_insegurancas", emoji: "😊", label: "Muito melhor" },
    { value: "realizado", emoji: "😄", label: "Realizado" },
    { value: "transformado" as ProjectedFeeling, emoji: "🤩", label: "Transformado" },
  ];

export const ProjectedFeelingStep = () => {
  const { projectedFeeling, setProjectedFeeling, objective } = useQuiz();

  // Find current index
  const currentIndex = projectedFeeling
    ? SLIDER_STEPS.findIndex((s) => s.value === projectedFeeling)
    : -1;
  const [sliderValue, setSliderValue] = useState(currentIndex >= 0 ? currentIndex : 2);
  const [hasInteracted, setHasInteracted] = useState(currentIndex >= 0);

  const objectiveLabels: Record<string, string> = {
    productivity: "sendo mais produtivo",
    health: "com saúde física melhorada",
    routine: "mais organizado",
    avoid: "livre dos vícios",
    mental: "com qualidade de vida melhor",
  };

  const objectiveText = objective ? objectiveLabels[objective] || "seus objetivos alcançados" : "seus objetivos alcançados";

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    setHasInteracted(true);
    setProjectedFeeling(SLIDER_STEPS[val].value);
  };

  const current = SLIDER_STEPS[sliderValue];

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8 px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Se estivesse {objectiveText}, como se sentiria?
        </h2>
      </motion.div>

      {/* Imagination Prompt */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-slate-400 text-base text-center max-w-sm px-4 -mt-4 mb-6"
      >
        Imagine acordar amanhã já sentindo que está no caminho certo.
      </motion.p>

      {/* Current Emoji + Label */}
      <motion.div
        key={sliderValue}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center mb-8"
      >
        <span className="text-7xl block mb-3">{current.emoji}</span>
        <span className="text-xl font-bold text-white">{current.label}</span>
      </motion.div>

      {/* Slider */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-full max-w-md px-4"
      >
        <div className="relative">
          {/* Emoji labels at ends */}
          <div className="flex justify-between mb-3 px-1">
            <span className="text-2xl">{SLIDER_STEPS[0].emoji}</span>
            <span className="text-2xl">{SLIDER_STEPS[SLIDER_STEPS.length - 1].emoji}</span>
          </div>

          {/* Range input */}
          <input
            type="range"
            min={0}
            max={SLIDER_STEPS.length - 1}
            step={1}
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-8
              [&::-webkit-slider-thumb]:h-8
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-lime-400
              [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(163,230,53,0.5)]
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-lime-300
              [&::-moz-range-thumb]:w-8
              [&::-moz-range-thumb]:h-8
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-lime-400
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-lime-300"
            style={{
              background: `linear-gradient(to right, #84CC16 ${(sliderValue / (SLIDER_STEPS.length - 1)) * 100}%, rgba(255,255,255,0.1) ${(sliderValue / (SLIDER_STEPS.length - 1)) * 100}%)`,
            }}
          />

          {/* Labels below */}
          <div className="flex justify-between mt-2 px-1">
            <span className="text-xs text-slate-500">{SLIDER_STEPS[0].label}</span>
            <span className="text-xs text-slate-500">{SLIDER_STEPS[SLIDER_STEPS.length - 1].label}</span>
          </div>
        </div>
      </motion.div>

      <ContinueButton disabled={!hasInteracted} />
    </div>
  );
};
