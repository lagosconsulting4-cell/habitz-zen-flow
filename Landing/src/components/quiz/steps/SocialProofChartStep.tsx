import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const COMPARISON_DATA = [
  {
    approach: "Abordagem Padrão",
    successRate: 18,
    fill: "hsl(var(--muted))",
  },
  {
    approach: "Com Suporte Bora",
    successRate: 94,
    fill: "hsl(84, 81%, 55%)", // Lime green
  },
];

const chartConfig = {
  successRate: {
    label: "Taxa de Sucesso (%)",
  },
};

export const SocialProofChartStep = () => {
  const { trackChartView } = useTracking();

  useEffect(() => {
    trackChartView("comparison");
  }, [trackChartView]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Quem tem um plano personalizado consegue alcançar 5x mais seus objetivos
        </h2>
        <p className="text-sm text-slate-400">
          Estudos mostram que uma rotina personalizada aumenta drasticamente sua taxa de sucesso
        </p>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center justify-center px-4"
      >
        <div className="w-full max-w-lg">
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart
              data={COMPARISON_DATA.map(d => ({ ...d, fill: d.approach.includes("Bora") ? "hsl(84, 81%, 55%)" : "rgba(255,255,255,0.1)" }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="approach"
                angle={-15}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8" }} />
              <ChartTooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={<ChartTooltipContent className="bg-[#1A1A1C] border-white/10 text-white" />}
                formatter={(value) => [`${value}%`, "Taxa de Sucesso"]}
              />
              <Bar dataKey="successRate" radius={[8, 8, 0, 0]} maxBarSize={120} />
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
