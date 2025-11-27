import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, Users, AlertTriangle } from "lucide-react";

interface FeedbackGraphProps {
  onContinue: () => void;
}

// Comparison data: User (78%) vs Average Brazilian (42%) vs Healthy (20%)
const comparisonData = [
  {
    label: "Você",
    value: 78,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    status: "URGENTE",
  },
  {
    label: "Brasileiro Médio",
    value: 42,
    color: "from-yellow-500 to-orange-400",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    status: "ALERTA",
  },
  {
    label: "Nível Saudável",
    value: 20,
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    status: "IDEAL",
  },
];

const FeedbackGraph: React.FC<FeedbackGraphProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TrendingDown className="h-4 w-4" />
            <span className="font-semibold text-sm">Análise Parcial</span>
          </motion.div>

          <motion.h2
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Seu estresse comparado
          </motion.h2>

          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Veja como você está em relação a outros brasileiros
          </motion.p>
        </div>

        {/* Comparison Bars */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {comparisonData.map((item, index) => (
            <motion.div
              key={item.label}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.2 }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      index === 0 ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${item.textColor}`}>
                    {item.value}%
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${item.bgColor} ${item.textColor}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${item.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${item.value}%` }}
                  transition={{
                    delay: 0.8 + index * 0.2,
                    duration: 1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Insight Card */}
        <motion.div
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                Você está 36% acima da média
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Seu nível de estresse mental é significativamente maior que o
                brasileiro médio. Isso indica que sua mente está operando em
                estado de sobrecarga constante.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">4x</div>
            <div className="text-xs text-muted-foreground">
              Mais chances de burnout
            </div>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">58%</div>
            <div className="text-xs text-muted-foreground">
              Queda na produtividade
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
          >
            <span className="font-semibold">Continuar Diagnóstico</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Faltam apenas 5 perguntas para seu resultado completo
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeedbackGraph;
