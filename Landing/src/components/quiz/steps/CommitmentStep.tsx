import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Fingerprint, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useQuiz } from "../QuizProvider";

const CommitmentStep: React.FC = () => {
    const { nextStep, name } = useQuiz();

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center gap-8 py-4">

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                    Última etapa.
                </h2>
                <p className="text-slate-400">
                    O protocolo exato usado para destravar sua rotina está pronto.
                </p>
            </div>

            {/* Contract Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full bg-[#121214] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
            >
                {/* Holographic effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-transparent pointer-events-none" />

                <div className="flex flex-col items-center gap-6 relative z-10">

                    <div className="w-20 h-20 rounded-full bg-[#0A0A0B] border border-white/10 flex items-center justify-center shadow-inner">
                        <Fingerprint className="w-10 h-10 text-lime-500 animate-pulse" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                            "Eu, <strong className="text-white border-b border-lime-500/50">{name || "Futuro Pró"}</strong>, me comprometo a seguir o sistema BORA por 7 dias para recalibrar minha dopamina e assumir o controle da minha rotina."
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                        <ShieldCheck size={14} className="text-lime-500" />
                        Protocolo Verificado
                    </div>

                </div>
            </motion.div>

            {/* Action */}
            <div className="w-full space-y-4">
                <Button
                    onClick={nextStep}
                    className="w-full bg-white text-slate-900 hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98] h-16 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 group"
                >
                    <Fingerprint className="w-6 h-6 mr-3 text-slate-600 group-hover:text-slate-900 transition-colors" />
                    ASSINAR E ACESSAR
                </Button>
                <p className="flex items-center justify-center gap-1 text-xs text-slate-600">
                    <Lock size={10} />
                    Acesso seguro e criptografado
                </p>
            </div>

        </div>
    );
};

export default CommitmentStep;
