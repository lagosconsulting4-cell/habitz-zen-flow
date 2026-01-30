import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, User, TrendingUp } from "lucide-react";
import { useQuiz } from "../QuizProvider";

// Persona Database - More tangible and specific
const personas = {
    productivity: {
        name: "André",
        age: "27",
        role: "Analista de TI",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        pain: "Trabalhava 10h/dia e não via resultado",
        gain: "Promoção + R$ 2.500 de aumento",
        stat: "3x mais produtivo",
        timeline: "Em 45 dias",
        detail: "Conseguiu entregar 3 projetos que estavam travados há meses"
    },
    health: {
        name: "Beatriz",
        age: "24",
        role: "Estudante de Medicina",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        pain: "Sedentária, 8kg acima do peso",
        gain: "Perdeu 7kg + rotina de treino fixa",
        stat: "4x por semana na academia",
        timeline: "Em 2 meses",
        detail: "Treina às 6h da manhã sem despertador, virou automático"
    },
    routine: {
        name: "Lucas",
        age: "29",
        role: "Designer Freelancer",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
        pain: "Caos total, prazos estourados",
        gain: "Dobrou faturamento (R$ 8k → R$ 16k)",
        stat: "100% dos prazos cumpridos",
        timeline: "Em 60 dias",
        detail: "Conseguiu pegar 3 clientes novos sem sobrecarregar"
    },
    default: {
        name: "Júlia",
        age: "26",
        role: "Analista Júnior",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        pain: "Ansiedade e procrastinação crônica",
        gain: "Passou em concurso público",
        stat: "2h de estudo focado/dia",
        timeline: "Em 90 dias",
        detail: "Estudou todo dia sem falhar, mesmo trabalhando 8h"
    }
};

const SimilarityMatchStep: React.FC = () => {
    const { nextStep, objective, name } = useQuiz();
    const [showCards, setShowCards] = useState(false);

    // Simple logic to pick persona based on Objective
    const getPersona = () => {
        if (!objective) return personas.default;
        // Direct mapping to persona keys
        if (objective === "productivity") return personas.productivity;
        if (objective === "health") return personas.health;
        if (objective === "routine") return personas.routine;
        return personas.default;
    };

    const persona = getPersona();

    useEffect(() => {
        // Small delay to simulate "Finding match"
        const timer = setTimeout(() => setShowCards(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (!showCards) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-4 border-lime-500/30 border-t-lime-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white">Buscando casos similares...</h3>
                <p className="text-slate-500">Cruzando com base nos seus gargalos</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">

            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-mono tracking-wider mb-2">
                    <Check size={12} />
                    MATCH ENCONTRADO (94%)
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Você não está sozinho.
                </h2>
                <p className="text-slate-400 text-sm">
                    Encontramos o caso do <strong>{persona.name}</strong>, que tinha o mesmo perfil que o seu.
                </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 gap-3 relative">

                {/* Connector Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1A1A1C] border border-white/10 flex items-center justify-center z-10 shadow-xl">
                    <ArrowRight size={14} className="text-white" />
                </div>

                {/* User Card (Pain) */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex flex-col items-center text-center"
                >
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
                        <User size={20} />
                    </div>
                    <p className="text-white font-bold text-sm mb-1">Você (Hoje)</p>
                    <div className="text-xs text-red-300 font-medium bg-red-500/10 px-2 py-1 rounded-md">
                        {persona.pain}
                    </div>
                </motion.div>

                {/* Persona Card (Gain) */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-lime-500/5 border border-lime-500/20 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-lime-500/5 animate-pulse" />
                    <img
                        src={persona.image}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full border-2 border-lime-500 object-cover mb-3 relative z-10"
                    />
                    <p className="text-white font-bold text-sm mb-1 relative z-10">{persona.name}</p>
                    <div className="text-xs text-lime-300 font-bold bg-lime-500/10 px-2 py-1 rounded-md relative z-10">
                        {persona.gain}
                    </div>
                </motion.div>

            </div>


            {/* Result Stats - More detailed */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#121214] border border-white/5 rounded-xl p-4 space-y-3"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="text-lime-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Transformação Real</p>
                        <p className="text-white font-bold text-base">{persona.stat}</p>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                    <p className="text-xs text-slate-400 mb-1">
                        <span className="text-lime-400 font-bold">{persona.timeline}</span> {persona.name} conseguiu:
                    </p>
                    <p className="text-sm text-white font-medium">
                        {persona.detail}
                    </p>
                </div>
            </motion.div>


            {/* CTA */}
            <Button
                onClick={nextStep}
                className="w-full bg-lime-400 hover:bg-lime-500 text-slate-900 h-14 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
            >
                Descobrir o Segredo do {persona.name}
                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

        </div>
    );
};

export default SimilarityMatchStep;
