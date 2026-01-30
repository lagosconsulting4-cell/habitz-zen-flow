import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Brain, ScanLine, Laptop, Server, CheckCircle2 } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const AnalysisLoadingStep: React.FC = () => {
    const { nextStep, name } = useQuiz();
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("");
    const [logs, setLogs] = useState<string[]>([]);

    const tasks = [
        "Conectando ao núcleo neural...",
        "Analisando padrões de resposta...",
        "Calculando densidade de foco...",
        "Identificando gargalos de dopamina...",
        "Comparando com 15.420 perfis...",
        "Gerando protocolo personalizado...",
    ];

    useEffect(() => {
        // Total duration: 5 seconds for a "Heavy" feel
        const duration = 5000;
        const interval = 50;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min(100, Math.round((currentStep / steps) * 100));
            setProgress(newProgress);

            // Update tasks based on progress chunks
            const taskIndex = Math.min(
                tasks.length - 1,
                Math.floor((newProgress / 100) * tasks.length)
            );
            if (tasks[taskIndex] !== currentTask) {
                setCurrentTask(tasks[taskIndex]);
                setLogs((prev) => [...prev, `[OK] ${tasks[taskIndex]}`]);
            }

            if (currentStep >= steps) {
                clearInterval(timer);
                setTimeout(nextStep, 800); // Small pause at 100%
            }
        }, interval);

        return () => clearInterval(timer);
    }, [nextStep]);

    return (
        <div className="w-full max-w-md mx-auto min-h-[400px] flex flex-col items-center justify-center p-6 text-center">

            {/* Central Icon / Spinner */}
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                {/* Pulse Rings */}
                <div className="absolute inset-0 bg-lime-500/20 rounded-full animate-ping" />
                <div className="absolute inset-2 bg-lime-500/10 rounded-full animate-pulse delay-75" />

                {/* Core Icon */}
                <div className="relative z-10 w-16 h-16 rounded-xl bg-[#0A0A0B] border border-lime-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                    <Brain className="w-8 h-8 text-lime-400 animate-pulse" />
                </div>

                {/* Orbit */}
                <motion.div
                    className="absolute inset-[-10px] border border-lime-500/30 rounded-full border-t-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Main Status Text */}
            <motion.h2
                className="text-2xl font-bold text-white mb-2"
                key={currentTask}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {currentTask}
            </motion.h2>

            <p className="text-slate-500 text-sm mb-8">
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

            {/* Terminal Logs */}
            <div className="w-full bg-[#050505] border border-white/10 rounded-lg p-4 font-mono text-xs text-left h-32 overflow-hidden flex flex-col justify-end">
                {logs.slice(-4).map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lime-500/80 mb-1"
                    >
                        <span className="text-slate-600 mr-2">{new Date().toLocaleTimeString()}</span>
                        {log}
                    </motion.div>
                ))}
                <div className="flex items-center gap-1 text-lime-500 animate-pulse">
                    <span>_</span>
                </div>
            </div>

        </div>
    );
};

export default AnalysisLoadingStep;
