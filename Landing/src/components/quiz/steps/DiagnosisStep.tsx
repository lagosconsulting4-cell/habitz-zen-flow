import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, AlertTriangle, Zap, Target } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const DiagnosisStep: React.FC = () => {
    const { nextStep, primaryChallenge, name } = useQuiz();

    const getDiagnosis = () => {
        const challenge = primaryChallenge || "Foco";

        if (challenge.includes("Procrastina") || challenge.includes("Começar")) {
            return {
                title: "Você fica travado na hora de começar",
                description: "Você sabe o que precisa fazer, mas na hora H a cabeça trava e você adia. É mais comum do que parece — e tem solução.",
                mainDifficulty: "Sair do modo 'depois eu faço'",
                challengingPeriod: "Logo de manhã e início de tarefas",
                trigger: "Sensação de que a tarefa é grande demais",
                level: 85,
            };
        }
        if (challenge.includes("Foco") || challenge.includes("Distra")) {
            return {
                title: "Você perde o fio do raciocínio fácil",
                description: "Seu celular vira inimigo, o ambiente conspira contra você. Não é falta de vontade — é que seu cérebro não tem um escudo contra distração.",
                mainDifficulty: "Manter o foco sem depender de fone ou silêncio total",
                challengingPeriod: "Parte da tarde e noite",
                trigger: "Notificações e ambiente agitado",
                level: 80,
            };
        }
        if (challenge.includes("Constância") || challenge.includes("Desiste")) {
            return {
                title: "Você começa com tudo e não termina",
                description: "Na semana 1 é euforia. Na semana 2 já some. Não é fraqueza — é que sem um sistema, a motivação sozinha não sustenta ninguém.",
                mainDifficulty: "Passar da segunda semana sem desistir",
                challengingPeriod: "Após os primeiros 3-5 dias",
                trigger: "Motivação caindo no dia ruim",
                level: 75,
            };
        }
        if (challenge.includes("Energia") || challenge.includes("Cansaç")) {
            return {
                title: "Você acorda já cansado",
                description: "O dia mal começa e já parece pesado. Você tenta, mas o corpo não responde. Isso tem a ver com rotina — e dá pra resolver.",
                mainDifficulty: "Ter energia real do início ao fim do dia",
                challengingPeriod: "Manhã e após almoço",
                trigger: "Noite mal dormida e rotina sem ritmo",
                level: 78,
            };
        }

        return {
            title: "Sua rotina atual tá te pesando",
            description: "Você sente que poderia render muito mais, mas algo sempre atrapalha. A boa notícia: não é culpa sua — é o método que faltava.",
            mainDifficulty: "Energia e clareza mental",
            challengingPeriod: "Final de semana e mudança de rotina",
            trigger: "Excesso de tarefas sem prioridade clara",
            level: 78,
        };
    };

    const diagnosis = getDiagnosis();

    const getLevelLabel = (level: number) => {
        if (level >= 70) return "Alto impacto";
        if (level >= 40) return "Médio";
        return "Leve";
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-5">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-center"
            >
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Seu perfil, {name || "você"}
                </p>
                <h2 className="text-xl font-bold text-white">
                    Resumo do que encontramos
                </h2>
            </motion.div>

            {/* Impact meter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#121214] border border-white/10 rounded-2xl p-4 space-y-3"
            >
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Nível de impacto na sua rotina</p>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400">
                        {getLevelLabel(diagnosis.level)}
                    </span>
                </div>

                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-amber-400 to-red-500" />
                    <div
                        className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900"
                        style={{ left: `${diagnosis.level}%`, transform: "translate(-50%, -50%)" }}
                    />
                </div>

                <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Tranquilo</span>
                    <span>Moderado</span>
                    <span>Puxado</span>
                </div>
            </motion.div>

            {/* Diagnosis Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                        Detectado
                    </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                    {diagnosis.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                    {diagnosis.description}
                </p>

                <div className="space-y-3 pt-1">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <Target size={14} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Principal desafio:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.mainDifficulty}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Calendar size={14} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Momento mais crítico:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.challengingPeriod}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Zap size={14} className="text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">O que aciona:</p>
                            <p className="text-sm text-white font-medium">{diagnosis.trigger}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <Button
                    onClick={nextStep}
                    className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 h-14 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all"
                >
                    Ver como o Bora resolve isso
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </motion.div>
        </div>
    );
};

export default DiagnosisStep;
