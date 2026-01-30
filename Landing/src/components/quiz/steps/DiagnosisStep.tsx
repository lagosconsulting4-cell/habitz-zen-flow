import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, Brain, ArrowRight } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const DiagnosisStep: React.FC = () => {
    const { nextStep, primaryChallenge, name } = useQuiz();

    // Map challenges to "Technical Diagnoses"
    const getDiagnosis = () => {
        const challenge = primaryChallenge || "Foco";

        if (challenge.includes("Procrastina") || challenge.includes("Começar")) {
            return {
                title: "Paralisia por Sobrecarga Cognitiva",
                code: "ERR_DOPAMINE_LOW",
                description: "Seu cérebro associa o início de tarefas a dor, bloqueando a liberação de dopamina antes mesmo de começar.",
                symptoms: ["Adia tarefas importantes", "Sente culpa constante", "Picos de energia seguidos de crash"]
            };
        }
        if (challenge.includes("Foco") || challenge.includes("Distra")) {
            return {
                title: "Déficit de Atenção Seletiva",
                code: "ERR_FOCUS_FRAGILE",
                description: "Seu sistema de filtragem de estímulos está enfraquecido, permitindo que micro-distrações quebrem seu fluxo profundo.",
                symptoms: ["Pula de tarefa em tarefa", "Esquece o que estava fazendo", "Cansaço mental extremo"]
            };
        }
        if (challenge.includes("Constância") || challenge.includes("Desiste")) {
            return {
                title: "Ciclo de Ruptura de Hábito",
                code: "ERR_CONSISTENCY_BREAK",
                description: "Você depende de motivação (recurso finito) em vez de automação comportamental (recurso infinito).",
                symptoms: ["Começa empolgado, para em 3 dias", "Autocobrança excessiva", "Sensação de estar estagnado"]
            };
        }

        // Default fallback
        return {
            title: "Desalinhamento Neuroquímico",
            code: "ERR_SYSTEM_FATIGUE",
            description: "Sua rotina atual está lutando contra sua biologia, gerando atrito desnecessário em cada tarefa.",
            symptoms: ["Baixa energia", "Resultados inconsistentes", "Frustração recorrente"]
        };
    };

    const diagnosis = getDiagnosis();

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">

            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono tracking-wider mb-2">
                    <AlertTriangle size={12} />
                    DIAGNÓSTICO CONCLUÍDO
                </div>
                <h2 className="text-2xl font-bold text-white">
                    Não é "preguiça". <br />
                    É um <span className="text-red-400">Erro de Sistema.</span>
                </h2>
            </div>

            {/* Diagnosis Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#121214] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group"
            >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] pointer-events-none" />

                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Identificado</p>
                            <p className="text-white font-mono font-bold text-sm">{diagnosis.code}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{diagnosis.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {diagnosis.description}
                </p>

                <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sintomas detectados:</p>
                    {diagnosis.symptoms.map((symptom, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {symptom}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Bridge Text */}
            <p className="text-center text-slate-400 text-sm px-4">
                Identificamos esse padrão em 92% dos perfis analisados. <br />
                <strong className="text-white">Mas existe uma exceção...</strong>
            </p>

            {/* CTA */}
            <Button
                onClick={nextStep}
                className="w-full bg-white text-slate-900 hover:bg-slate-200 h-14 rounded-xl font-bold text-base shadow-lg shadow-white/5 transition-all"
            >
                Ver quem venceu isso
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

        </div>
    );
};

export default DiagnosisStep;
