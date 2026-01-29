import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";

interface LeadsFunnelProps {
  data: {
    total_leads: number;
    completed_quiz: number;
    contacted: number;
    converted: number;
    customers: number;
    completion_rate: number;
    contact_rate: number;
    conversion_rate: number;
  } | null;
  loading?: boolean;
}

export const LeadsFunnel = ({ data, loading }: LeadsFunnelProps) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Responsive chart configuration
  const chartHeight = isMobile ? 250 : 300;
  const chartMargin = isMobile
    ? { left: 60, right: 10, top: 10, bottom: 10 }
    : isTablet
    ? { left: 80, right: 15, top: 10, bottom: 10 }
    : { left: 100, right: 20, top: 10, bottom: 10 };

  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
        <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
        <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </div>
      </Card>
    );
  }

  const funnelData = [
    { stage: "Total Leads", value: data.total_leads, color: "#3b82f6" },
    { stage: "Quiz Completo", value: data.completed_quiz, color: "#8b5cf6" },
    { stage: "Contactados", value: data.contacted, color: "#eab308" },
    { stage: "Convertidos", value: data.converted, color: "#22c55e" },
    { stage: "Clientes", value: data.customers, color: "#10b981" },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Funil de Conversão</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Taxa de Completude:</span>
            <span className="ml-2 font-semibold">{data.completion_rate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa de Contato:</span>
            <span className="ml-2 font-semibold">{data.contact_rate}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa de Conversão:</span>
            <span className="ml-2 font-semibold text-green-600">{data.conversion_rate}%</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={funnelData} layout="vertical" margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="stage" width={isMobile ? 50 : isTablet ? 70 : 90} />
          <Tooltip
            formatter={(value) => value}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs text-center">
        {funnelData.map((stage, index) => {
          const dropOff =
            index > 0 ? ((funnelData[index - 1].value - stage.value) / funnelData[index - 1].value) * 100 : 0;
          return (
            <div key={stage.stage} className="space-y-1">
              <div className="font-semibold">{stage.value}</div>
              {index > 0 && dropOff > 0 && (
                <div className="text-red-500">↓ {dropOff.toFixed(1)}%</div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
