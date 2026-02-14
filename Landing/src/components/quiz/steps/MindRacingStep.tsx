import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { cn } from "@/lib/utils";

const OPTIONS = [
    { value: "sim_toda_noite", label: "Sim, toda noite" },
    { value: "as_vezes", label: "Às vezes" },
    { value: "raramente", label: "Raramente" },
] as const;

export const MindRacingStep = () => {
    const { mindRacing, setMindRacing, nextStep } = useQuiz();

    return (
        <div className="flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Sua mente dispara quando você <span className="text-lime-400">deita pra dormir?</span>
                </h2>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="flex flex-col gap-3 max-w-md mx-auto w-full"
            >
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            setMindRacing(option.value);
                            setTimeout(() => nextStep(), 300);
                        }}
                        className={cn(
                            "w-full py-4 px-6 rounded-2xl border text-left font-medium transition-all duration-200",
                            mindRacing === option.value
                                ? "bg-lime-500/20 border-lime-500/50 text-lime-400"
                                : "bg-[#121214] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </motion.div>
        </div>
    );
};
