import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface TemporalData {
  date?: string;
  week_start?: string;
  total_leads: number;
  completed: number;
  contacted: number;
  converted: number;
  conversion_rate: number;
}

interface LeadsTemporalChartProps {
  daily: TemporalData[] | null;
  weekly: TemporalData[] | null;
  loading?: boolean;
}

export const LeadsTemporalChart = ({ daily, weekly, loading }: LeadsTemporalChartProps) => {
  const isMobile = useIsMobile();

  // Responsive chart configuration
  const volumeHeight = isMobile ? 220 : 300;
  const conversionHeight = isMobile ? 180 : 200;
  const xAxisConfig = {
    fontSize: isMobile ? 10 : 12,
    angle: -45,
    textAnchor: "end" as const,
    height: 60,
    interval: isMobile ? 2 : 0,
  };

  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Tendências Temporais</h3>
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  const dailyChartData = daily?.map((item) => ({
    date: format(new Date(item.date!), "dd/MM", { locale: ptBR }),
    "Total Leads": item.total_leads,
    Completados: item.completed,
    Contactados: item.contacted,
    Convertidos: item.converted,
    "Taxa (%)": item.conversion_rate,
  }));

  const weeklyChartData = weekly?.map((item) => ({
    date: format(new Date(item.week_start!), "dd/MM", { locale: ptBR }),
    "Total Leads": item.total_leads,
    Completados: item.completed,
    Contactados: item.contacted,
    Convertidos: item.converted,
    "Taxa (%)": item.conversion_rate,
  }));

  const renderChart = (data: typeof dailyChartData) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Volume Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 sm:mb-4">Volume de Leads</h4>
          <ResponsiveContainer width="100%" height={volumeHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: xAxisConfig.fontSize }}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                height={xAxisConfig.height}
                interval={xAxisConfig.interval}
              />
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: isMobile ? "11px" : "12px" }} />
              <Line
                type="monotone"
                dataKey="Total Leads"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
              />
              <Line
                type="monotone"
                dataKey="Completados"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
              />
              <Line
                type="monotone"
                dataKey="Contactados"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
              />
              <Line
                type="monotone"
                dataKey="Convertidos"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3 sm:mb-4">Taxa de Conversão (%)</h4>
          <ResponsiveContainer width="100%" height={conversionHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: xAxisConfig.fontSize }}
                angle={xAxisConfig.angle}
                textAnchor={xAxisConfig.textAnchor}
                height={xAxisConfig.height}
                interval={xAxisConfig.interval}
              />
              <YAxis domain={[0, "auto"]} tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value) => `${value}%`}
              />
              <Line
                type="monotone"
                dataKey="Taxa (%)"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: isMobile ? 4 : 5, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Tendências Temporais</h3>
      <Tabs defaultValue={isMobile ? "weekly" : "daily"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="text-xs sm:text-sm">
            {isMobile ? "90 Dias" : "Últimos 90 Dias"}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">
            {isMobile ? "26 Semanas" : "Últimas 26 Semanas"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 sm:mt-6">
          {renderChart(dailyChartData)}
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 sm:mt-6">
          {renderChart(weeklyChartData)}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
