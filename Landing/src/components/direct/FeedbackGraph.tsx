import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FeedbackGraphProps {
  onContinue: () => void;
}

// Comparison data: User (78%) vs Average Brazilian (42%) vs Healthy (20%)
const comparisonData = [
  {
    label: "VocÇ¦",
    value: 78,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/20",
    textColor: "text-red-400",
    status: "URGENTE",
    fillKey: "voce",
  },
  {
    label: "Brasileiro MÇ¸dio",
    value: 42,
    color: "from-yellow-500 to-orange-400",
    bgColor: "bg-yellow-500/20",
    textColor: "text-yellow-400",
    status: "ALERTA",
    fillKey: "brasil",
  },
  {
    label: "NÇðvel SaudÇ­vel",
    value: 20,
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/20",
    textColor: "text-green-400",
    status: "IDEAL",
    fillKey: "saudavel",
  },
];

const chartConfig = {
  value: {
    label: "NÇðvel de estresse",
  },
  voce: {
    label: "VocÇ¦",
    color: "hsl(8, 88%, 60%)",
  },
  brasil: {
    label: "Brasileiro MÇ¸dio",
    color: "hsl(32, 95%, 60%)",
  },
  saudavel: {
    label: "NÇðvel SaudÇ­vel",
    color: "hsl(142, 70%, 45%)",
  },
};

const chartData = comparisonData.map((item) => ({
  label: item.label,
  value: item.value,
  fillKey: item.fillKey,
}));

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
            <span className="font-semibold text-sm">AnÇ­lise Parcial</span>
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
            Veja como vocÇ¦ estÇ­ em relaÇõÇœo a outros brasileiros
          </motion.p>
        </div>

        {/* Animated comparison chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/40 bg-muted/20 p-4"
        >
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
              data={chartData}
              margin={{ top: 16, bottom: 8, left: 0, right: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.25 }}
                content={
                  <ChartTooltipContent
                    labelKey="label"
                    nameKey="label"
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between text-foreground">
                        <span className="text-xs font-medium">{name}</span>
                        <span className="font-mono font-semibold">{value}%</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                isAnimationActive
                animationDuration={900}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.label}
                    fill={`var(--color-${item.fillKey})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </motion.div>

        {/* Legend & status cards */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {comparisonData.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-border/40 bg-background/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full bg-gradient-to-r ${item.color}`}
                />
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      index === 0 ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.status === "IDEAL"
                      ? "Faixa segura"
                      : index === 0
                      ? "Seu nÇðvel atual"
                      : "ReferÇõÇœo nacional"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-base font-bold ${item.textColor}`}>
                  {item.value}%
                </span>
                <span
                  className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${item.bgColor} ${item.textColor}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Insight Card */}
        <motion.div
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                VocÇ¦ estÇ­ 36% acima da mÇ¸dia
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Seu nÇðvel de estresse mental Ç¸ significativamente maior que o
                brasileiro mÇ¸dio. Isso indica que sua mente estÇ­ operando em
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
          transition={{ delay: 1.2 }}
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
          transition={{ delay: 1.4 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
          >
            <span className="font-semibold">Continuar DiagnÇüstico</span>
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
