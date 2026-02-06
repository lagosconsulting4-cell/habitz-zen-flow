import { motion } from "motion/react";
import { useQuiz } from "../QuizProvider";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { ContinueButton } from "../ContinueButton";

const PROGRESS_DATA = [
  { week: "Sem 1", consistency: 45 },
  { week: "Sem 2", consistency: 58 },
  { week: "Sem 4", consistency: 72 },
  { week: "Sem 8", consistency: 85 },
  { week: "Sem 12", consistency: 91 },
];

const chartConfig = {
  consistency: {
    label: "Consistência (%)",
    color: "hsl(84, 81%, 55%)", // Lime green
  },
};

export const PotentialChartStep = () => {
  const { trackChartView } = useTracking();

  useEffect(() => {
    trackChartView("progress");
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
          Seu potencial de consistência é alto quando o sistema joga a seu favor
        </h2>
        <p className="text-sm text-slate-400">
          Não é sobre ter força de vontade infinita. É sobre ter um método que não deixa você cair.
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
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart
              data={PROGRESS_DATA}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="consistencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(84, 81%, 55%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(84, 81%, 55%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`${value}%`, "Consistência"]}
              />
              <Area
                type="monotone"
                dataKey="consistency"
                stroke="hsl(84, 81%, 55%)"
                strokeWidth={3}
                fill="url(#consistencyGradient)"
              />
              <Line
                type="monotone"
                dataKey="consistency"
                stroke="hsl(84, 81%, 55%)"
                strokeWidth={3}
                dot={{ fill: "hsl(84, 81%, 55%)", r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Motivational Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="text-center mt-4 px-4"
      >
        <p className="text-base font-medium text-slate-300">
          Evolução média dos usuários do Bora
        </p>
        <p className="text-sm text-slate-400 mt-1">
          De 45% de consistência na primeira semana para 91% em 12 semanas
        </p>
        <div className="mt-4 p-4 bg-lime-500/10 border border-lime-500/20 rounded-lg">
          <p className="text-sm font-semibold text-lime-400">
            Não deixe isso virar uma bola de neve. Resolva isso enquanto ainda há tempo.
          </p>
        </div>
      </motion.div>

      <ContinueButton />
    </div>
  );
};
