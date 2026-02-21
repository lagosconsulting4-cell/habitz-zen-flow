import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Brain, Zap, Calendar, ArrowRight } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const DiagnosisStep: React.FC = () => {
    const { nextStep, primaryChallenge, name, gender } = useQuiz();

    const getDiagnosis = () => {
        const challenge = primaryChallenge || "Foco";

        if (challenge.includes("Procrastina") || challenge.includes("Começar")) {
            return {
                title: "Paralisia por Sobrecarga Cognitiva",
                code: "ERR_DOPAMINE_LOW",
                description: "Seu cérebro associa o início de tarefas a dor, bloqueando a liberação de dopamina antes mesmo de começar.",
                mainDifficulty: "Lidar com Procrastinação",
                challengingPeriod: "Manhãs e início de tarefas",
                trigger: "Ansiedade antecipatória",
                level: 85,
            };
        }
        if (challenge.includes("Foco") || challenge.includes("Distra")) {
            return {
                title: "Déficit de Atenção Seletiva",
                code: "ERR_FOCUS_FRAGILE",
                description: "Seu sistema de filtragem de estímulos está enfraquecido, permitindo que micro-distrações quebrem seu fluxo profundo.",
                mainDifficulty: "Lidar com TDAH",
                challengingPeriod: "Período da tarde",
                trigger: "Distrações externas",
                level: 80,
            };
        }
        if (challenge.includes("Constância") || challenge.includes("Desiste")) {
            return {
                title: "Ciclo de Ruptura de Hábito",
                code: "ERR_CONSISTENCY_BREAK",
                description: "Você depende de motivação (recurso finito) em vez de automação comportamental (recurso infinito).",
                mainDifficulty: "Manter Consistência",
                challengingPeriod: "Após 3-5 dias",
                trigger: "Queda de motivação",
                level: 75,
            };
        }

        return {
            title: "Desalinhamento Neuroquímico",
            code: "ERR_SYSTEM_FATIGUE",
            description: "Sua rotina atual está lutando contra sua biologia, gerando atrito desnecessário em cada tarefa.",
            mainDifficulty: "Energia e Foco",
            challengingPeriod: "Final de semana e mudanças de rotina",
            trigger: "Sobrecarga cognitiva",
            level: 78,
        };
    };

    const diagnosis = getDiagnosis();

    const avatarSrc = gender === "Feminino"
        ? "/images/avatar-female.png"
        : "/images/avatar-male.png";

    const getLevelColor = (level: number) => {
        if (level >= 70) return "text-red-500";
        if (level >= 40) return "text-orange-500";
        return "text-lime-500";
    };

    const getLevelLabel = (level: number) => {
        if (level >= 70) return "Alto";
        if (level >= 40) return "Médio";
        return "Baixo";
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">

            {/* Title */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                    Resumo do seu Perfil de Bem-Estar
                </h2>
            </div>

            {/* Avatar */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center -mb-4"
            >
                <div className="relative">
                    <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="w-40 h-40 object-contain"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${name || 'User'}&size=200&background=84cc16&color=fff&bold=true`;
                        }}
                    />
                </div>
            </motion.div>

            {/* Level Meter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#121214] border border-white/10 rounded-2xl p-6 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Nível de efeitos negativos</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 ${getLevelColor(diagnosis.level)}`}>
                        {getLevelLabel(diagnosis.level)}
                    </span>
                </div>

                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-orange-500 to-red-500" />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all"
                        style={{ left: `${diagnosis.level}%`, transform: 'translate(-50%, -50%)' }}
                    />
                </div>
            </motion.div>

            {/* Diagnosis Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={16} className="text-red-400" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                        Nível {getLevelLabel(diagnosis.level)}
                    </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                    {diagnosis.description}
                </p>

                <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Brain size={16} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Principal dificuldade:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.mainDifficulty}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Calendar size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Período desafiador:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.challengingPeriod}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Gatilho:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.trigger}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <Button
                onClick={nextStep}
                className="w-full bg-white text-slate-900 hover:bg-slate-200 h-14 rounded-xl font-bold text-base shadow-lg shadow-white/5 transition-all"
            >
                Ver com o Bora
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </div>
    );
};

export default DiagnosisStep;
