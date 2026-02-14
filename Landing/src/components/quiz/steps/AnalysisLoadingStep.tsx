import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const TESTIMONIALS = [
    {
        name: "João Vitor",
        role: "Estudante",
        quote: "Em 3 semanas já sentia a diferença na energia e foco.",
        avatar: "👨‍🎓",
    },
    {
        name: "Beatriz",
        role: "Analista",
        quote: "Consigo treinar, ler e ter tempo livre sem culpa.",
        avatar: "👩‍💼",
    },
    {
        name: "Lucas",
        role: "Freelancer",
        quote: "Minha rotina era um caos. Agora entrego tudo no prazo.",
        avatar: "👨‍💻",
    },
];

const TASKS = [
    "Conectando ao núcleo neural...",
    "Analisando padrões de resposta...",
    "Calculando densidade de foco...",
    "Identificando gargalos de dopamina...",
    "Comparando com 15.420 perfis...",
    "Gerando protocolo personalizado...",
];

const AnalysisLoadingStep: React.FC = () => {
    const { nextStep, name } = useQuiz();
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("");
    const [testimonialIndex, setTestimonialIndex] = useState(0);

    // Progress timer
    useEffect(() => {
        const duration = 6000;
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min(100, Math.round((currentStep / steps) * 100));
            setProgress(newProgress);

            const taskIndex = Math.min(
                TASKS.length - 1,
                Math.floor((newProgress / 100) * TASKS.length)
            );
            setCurrentTask(TASKS[taskIndex]);

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(nextStep, 800);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [nextStep]);

    // Testimonial rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const testimonial = TESTIMONIALS[testimonialIndex];

    return (
        <div className="w-full max-w-md mx-auto min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
            {/* Central Icon */}
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-lime-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-lime-500/10 rounded-full animate-pulse delay-75" />
                <div className="relative z-10 w-16 h-16 rounded-xl bg-[#0A0A0B] border border-lime-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                    <Brain className="w-8 h-8 text-lime-400 animate-pulse" />
                </div>
                <motion.div
                    className="absolute inset-[-10px] border border-lime-500/30 rounded-full border-t-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Status Text */}
            <motion.h2
                className="text-xl font-bold text-white mb-2"
                key={currentTask}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {currentTask}
            </motion.h2>

            <p className="text-slate-500 text-sm mb-6">
                Analisando perfil de <span className="text-lime-400 font-mono">{name || "Usuário"}</span>
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5">
                <motion.div
                    className="h-full bg-lime-500 shadow-[0_0_10px_rgba(163,230,53,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Testimonial Card (replaces terminal) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full bg-[#121214] border border-white/10 rounded-2xl p-5 text-left"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{testimonial.avatar}</span>
                        <div>
                            <p className="text-sm font-bold text-white">{testimonial.name}</p>
                            <p className="text-xs text-slate-500">{testimonial.role}</p>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-xs">★</span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-slate-300 italic">"{testimonial.quote}"</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AnalysisLoadingStep;
