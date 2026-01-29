import { Card } from "@/components/ui/card";

interface HeatmapData {
  day_of_week: number;
  hour_of_day: number;
  lead_count: number;
  converted_count: number;
  conversion_rate: number;
}

interface LeadsHeatmapProps {
  data: HeatmapData[] | null;
  loading?: boolean;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}h`);

export const LeadsHeatmap = ({ data, loading }: LeadsHeatmapProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Heatmap - Horário × Dia da Semana</h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Heatmap - Horário × Dia da Semana</h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </div>
      </Card>
    );
  }

  // Create matrix: rows = days, columns = hours
  const maxCount = Math.max(...data.map((d) => d.lead_count));

  const getDataForCell = (day: number, hour: number) => {
    return data.find((d) => d.day_of_week === day && d.hour_of_day === hour);
  };

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "bg-green-600";
    if (intensity > 0.5) return "bg-green-500";
    if (intensity > 0.25) return "bg-green-400";
    return "bg-green-300";
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Heatmap - Horário × Dia da Semana</h3>
        <p className="text-sm text-muted-foreground">
          Distribuição de leads por dia da semana e hora do dia (últimos 90 dias)
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(24, 30px)` }}>
            {/* Header - Hours */}
            <div className="text-xs font-semibold text-center"></div>
            {HOURS.map((hour, i) => (
              <div key={i} className="text-xs text-center text-muted-foreground">
                {i % 3 === 0 ? hour : ""}
              </div>
            ))}

            {/* Rows - Days */}
            {DAYS.map((day, dayIndex) => (
              <>
                <div
                  key={`day-${dayIndex}`}
                  className="text-xs font-semibold flex items-center justify-end pr-2"
                >
                  {day}
                </div>
                {Array.from({ length: 24 }, (_, hourIndex) => {
                  const cellData = getDataForCell(dayIndex, hourIndex);
                  const count = cellData?.lead_count || 0;
                  const conversionRate = cellData?.conversion_rate || 0;

                  return (
                    <div
                      key={`cell-${dayIndex}-${hourIndex}`}
                      className={`h-8 rounded-sm ${getHeatColor(count)} hover:ring-2 hover:ring-primary cursor-pointer transition-all relative group`}
                      title={`${day} ${hourIndex}h: ${count} leads (${conversionRate}% conversão)`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{day} às {hourIndex}h</div>
                        <div>{count} leads</div>
                        {count > 0 && <div>Taxa: {conversionRate}%</div>}
                      </div>
                    </div>
                  );
                })}
              </>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground font-semibold">Intensidade:</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <span className="text-muted-foreground">0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-green-300 rounded"></div>
              <span className="text-muted-foreground">Baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-green-400 rounded"></div>
              <span className="text-muted-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-green-500 rounded"></div>
              <span className="text-muted-foreground">Alto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-green-600 rounded"></div>
              <span className="text-muted-foreground">Muito Alto</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pico de leads:</span>
              <span className="ml-2 font-semibold">{maxCount} leads</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total de células:</span>
              <span className="ml-2 font-semibold">{data.length} com dados</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total de leads:</span>
              <span className="ml-2 font-semibold">{data.reduce((sum, d) => sum + d.lead_count, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
