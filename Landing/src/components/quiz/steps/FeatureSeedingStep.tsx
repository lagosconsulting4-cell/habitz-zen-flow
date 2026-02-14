import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ContinueButton } from "../ContinueButton";

const FEATURE_OPTIONS = [
    { value: "estrutura", label: "Estrutura e rotina", emoji: "📋" },
    { value: "motivacao", label: "Motivação diária", emoji: "🔥" },
    { value: "cobranca", label: "Alguém pra cobrar", emoji: "🤝" },
    { value: "plano", label: "Um plano claro", emoji: "🗺️" },
    { value: "tempo", label: "Tempo", emoji: "⏰" },
];

export const FeatureSeedingStep = () => {
    const { featureNeeds, toggleFeatureNeed } = useQuiz();

    return (
        <div className="flex flex-col items-center">
            {/* Headline */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-6 px-4"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    O que mais <span className="text-lime-400">falta</span> na sua vida?
                </h2>
                <p className="text-sm text-slate-400">Selecione quantas quiser</p>
            </motion.div>

            {/* Options */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-full max-w-md space-y-3"
            >
                {FEATURE_OPTIONS.map((option, index) => {
                    const isSelected = featureNeeds.includes(option.value);
                    return (
                        <motion.button
                            key={option.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + index * 0.05, duration: 0.2 }}
                            onClick={() => toggleFeatureNeed(option.value)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isSelected
                                    ? "bg-lime-500/10 border-lime-500/40 shadow-[0_0_15px_rgba(132,204,22,0.15)]"
                                    : "bg-[#121214] border-white/10 hover:border-white/20"
                                }`}
                        >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className={`text-base font-medium ${isSelected ? "text-white" : "text-slate-300"}`}>
                                {option.label}
                            </span>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-auto w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center"
                                >
                                    <span className="text-slate-900 text-sm font-bold">✓</span>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            <ContinueButton disabled={featureNeeds.length === 0} />
        </div>
    );
};
