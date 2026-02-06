import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "../QuizProvider";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const ObjectionHandlingStep = () => {
    const { nextStep } = useQuiz();

    return (
        <div className="flex flex-col h-full justify-center max-w-xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <div className="inline-flex items-center justify-center p-3 bg-lime-500/10 rounded-full mb-2">
                    <ShieldCheck className="w-8 h-8 text-lime-400" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Por que funciona dessa vez?
                </h2>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                    <p className="text-slate-300 leading-relaxed">
                        A diferença é que o Bora não depende da sua <span className="text-lime-300 font-bold">força de vontade</span>.
                    </p>

                    <p className="text-slate-300 leading-relaxed">
                        Usamos <span className="text-white font-bold">Neurociência</span> para tornar a desistência mais difícil do que a ação. Sem promessas mágicas.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-400 text-sm md:text-base justify-center">
                        <CheckCircle2 className="w-5 h-5 text-lime-500 shrink-0" />
                        <span>Baseado em estudos científicos</span>
                    </div>
                </div>

                <div className="pt-6">
                    <Button
                        onClick={nextStep}
                        size="lg"
                        className="w-full bg-white hover:bg-slate-200 text-slate-900 text-lg py-7 rounded-xl font-bold shadow-lg shadow-white/5 transition-all"
                    >
                        Quero ver o meu Plano
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
