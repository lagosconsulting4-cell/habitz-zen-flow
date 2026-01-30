import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const AGE_DISTRIBUTION_DATA = [
  { label: "18-24", percentage: 22, fill: "hsl(var(--chart-1))" },
  { label: "25-34", percentage: 35, fill: "hsl(var(--chart-2))" },
  { label: "35-44", percentage: 25, fill: "hsl(var(--chart-3))" },
  { label: "45-54", percentage: 12, fill: "hsl(var(--chart-4))" },
  { label: "55+", percentage: 6, fill: "hsl(var(--chart-5))" },
];

const chartConfig = {
  percentage: {
    label: "Usuários com consistência 6+ meses",
  },
};

export const FeedbackAgeChartStep = () => {
  const { ageRange } = useQuiz();
  const { trackChartView } = useTracking();

  // Highlight user's age range
  const chartData = AGE_DISTRIBUTION_DATA.map((item) => ({
    ...item,
    fill: item.label === ageRange ? "hsl(84, 81%, 55%)" : item.fill, // Lime for user's age
  }));

  useEffect(() => {
    trackChartView("age", ageRange || "unknown");
  }, [trackChartView, ageRange]);

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
          Nunca é tarde para construir a vida que você merece
        </h2>
        <p className="text-lg text-slate-300 mb-1">
          87% dos usuários do Bora com a sua idade mantém consistência por 6+ meses
        </p>
        <p className="text-sm text-slate-500">
          O segredo está na distribuição e construção de hábitos inteligentes
        </p>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex items-center justify-center px-4"
      >
        <div className="w-full max-w-2xl">
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
              data={chartData.map(d => ({ ...d, fill: d.label === ageRange ? "hsl(84, 81%, 55%)" : "rgba(255,255,255,0.1)" }))}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
            >
              <XAxis type="number" domain={[0, 40]} tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "#334155" }} />
              <YAxis dataKey="label" type="category" width={80} tick={{ fill: "#e2e8f0" }} />
              <ChartTooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={<ChartTooltipContent className="bg-[#1A1A1C] border-white/10 text-white" />}
                formatter={(value) => [`${value}%`, "Consistência"]}
              />
              <Bar dataKey="percentage" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Highlight Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center text-sm text-slate-500 mt-4 px-4"
      >
        {ageRange && (
          <span className="font-bold text-lime-400">
            Sua faixa etária ({ageRange} anos) está destacada em verde
          </span>
        )}
      </motion.p>

      <ContinueButton />
    </div>
  );
};
