import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, Zap, ArrowRight } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const getTransformation = (primaryChallenge: string | null) => {
    const challenge = primaryChallenge || "Foco";

    if (challenge.includes("Procrastina") || challenge.includes("Começar")) {
        return {
            title: "Motor de Execução Ativa",
            code: "BORA_FLOW_ON",
            description: "O Bora cria micro-compromissos que liberam dopamina no início de cada tarefa, tornando a ação o caminho de menor resistência.",
            mainGain: "Execução no piloto automático",
            firstImprovement: "Primeiros 3 dias de uso",
            method: "Loops de recompensa imediata",
            level: 88,
        };
    }
    if (challenge.includes("Foco") || challenge.includes("Distra")) {
        return {
            title: "Sistema de Atenção Profunda",
            code: "BORA_FOCUS_PEAK",
            description: "O algoritmo do Bora cria blocos de foco calibrados ao seu ritmo biológico, eliminando o ruído mental automaticamente.",
            mainGain: "Foco de laser contínuo",
            firstImprovement: "Dentro de 5 dias de uso",
            method: "Sincronização com ritmo circadiano",
            level: 82,
        };
    }
    if (challenge.includes("Constância") || challenge.includes("Desiste")) {
        return {
            title: "Arquitetura de Hábito Permanente",
            code: "BORA_HABIT_LOCK",
            description: "O Bora substitui motivação por automação. Cada check-in reforça o circuito neural do hábito, tornando a consistência inevitável.",
            mainGain: "Consistência inabalável",
            firstImprovement: "Após a primeira semana",
            method: "Reforço de identidade progressivo",
            level: 79,
        };
    }

    return {
        title: "Calibração de Sistema Total",
        code: "BORA_SYSTEM_ON",
        description: "O Bora alinha sua biologia com seus objetivos, eliminando o atrito e transformando esforço em fluxo natural.",
        mainGain: "Evolução diária contínua",
        firstImprovement: "Nos primeiros 7 dias",
        method: "Otimização por IA adaptativa",
        level: 85,
    };
};

const TransformationStep: React.FC = () => {
    const { nextStep, primaryChallenge, name, gender } = useQuiz();

    const transformation = getTransformation(primaryChallenge);

    const avatarSrc = gender === "Feminino"
        ? "https://i.ibb.co/GQ416tfd/Gemini-Generated-Image-wjwqrnwjwqrnwjwq-removebg-preview.png"
        : "https://i.ibb.co/bMwPTcQv/Gemini-Generated-Image-w9p96jw9p96jw9p9-removebg-preview.png";

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">

            {/* Title */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                    {name ? `${name}, ` : ""}o seu potencial com o Bora
                </h2>
            </div>

            {/* Avatar com glow verde */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center -mb-4"
            >
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-lime-500/25 blur-2xl scale-125" />
                    <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="relative w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(163,230,53,0.35)]"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${name || 'User'}&size=200&background=84cc16&color=fff&bold=true`;
                        }}
                    />
                </div>
            </motion.div>

            {/* Potential Meter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#121214] border border-white/10 rounded-2xl p-6 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Potencial de evolução</p>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-lime-500/10 text-lime-400">
                        Alto
                    </span>
                </div>

                {/* Gradient reversed: red → lime, indicator on lime side */}
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-lime-500" />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all"
                        style={{ left: `${transformation.level}%`, transform: 'translate(-50%, -50%)' }}
                    />
                </div>
            </motion.div>

            {/* Transformation Card - GREEN */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-lime-500/5 border border-lime-500/20 rounded-2xl p-6 space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20">
                    <Star size={16} className="text-lime-400 fill-lime-400" />
                    <span className="text-lime-400 text-xs font-bold uppercase tracking-wider">
                        Alto Potencial
                    </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                    {transformation.description}
                </p>

                <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={16} className="text-lime-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Principal ganho:</p>
                            <p className="text-sm text-white font-medium">{transformation.mainGain}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center flex-shrink-0">
                            <Star size={16} className="text-lime-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Primeira melhora:</p>
                            <p className="text-sm text-white font-medium">{transformation.firstImprovement}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center flex-shrink-0">
                            <Zap size={16} className="text-lime-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Método de ativação:</p>
                            <p className="text-sm text-white font-medium">{transformation.method}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bridge Text */}
            <p className="text-center text-slate-400 text-sm px-4">
                Inclusive, já ajudamos alguém com{" "}
                <strong className="text-white">exatamente o mesmo perfil que o seu.</strong>
            </p>

            {/* CTA */}
            <Button
                onClick={nextStep}
                className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 h-14 rounded-xl font-bold text-base shadow-lg shadow-lime-500/20 transition-all"
            >
                Ver quem já conseguiu
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </div>
    );
};

export default TransformationStep;
