import { Card } from "@/components/ui/card";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import { useState } from "react";

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

// Mobile periods: group hours into 4 time periods
const MOBILE_PERIODS = [
  { label: "Madrugada", shortLabel: "Mad", hours: [0, 1, 2, 3, 4, 5] },
  { label: "Manhã", shortLabel: "Man", hours: [6, 7, 8, 9, 10, 11] },
  { label: "Tarde", shortLabel: "Tar", hours: [12, 13, 14, 15, 16, 17] },
  { label: "Noite", shortLabel: "Noi", hours: [18, 19, 20, 21, 22, 23] },
];

export const LeadsHeatmap = ({ data, loading }: LeadsHeatmapProps) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [selectedCell, setSelectedCell] = useState<{ day: number; hour?: number; period?: number } | null>(null);

  // Responsive configuration
  const cellSize = isMobile ? 20 : isTablet ? 24 : 30;
  const labelWidth = isMobile ? "40px" : "60px";

  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Heatmap - Horário × Dia da Semana</h3>
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Heatmap - Horário × Dia da Semana</h3>
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
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

  // Aggregate data for mobile periods
  const getDataForPeriod = (day: number, periodIndex: number) => {
    const period = MOBILE_PERIODS[periodIndex];
    const cellsInPeriod = period.hours.map(hour => getDataForCell(day, hour)).filter(Boolean);

    if (cellsInPeriod.length === 0) return null;

    const totalLeads = cellsInPeriod.reduce((sum, cell) => sum + (cell?.lead_count || 0), 0);
    const totalConverted = cellsInPeriod.reduce((sum, cell) => sum + (cell?.converted_count || 0), 0);

    return {
      lead_count: totalLeads,
      converted_count: totalConverted,
      conversion_rate: totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0,
    };
  };

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "bg-green-600";
    if (intensity > 0.5) return "bg-green-500";
    if (intensity > 0.25) return "bg-green-400";
    return "bg-green-300";
  };

  // Mobile view: render periods
  const renderMobileHeatmap = () => (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `${labelWidth} repeat(4, ${cellSize}px)` }}>
          {/* Header - Periods */}
          <div className="text-xs font-semibold text-center"></div>
          {MOBILE_PERIODS.map((period, i) => (
            <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
              {period.shortLabel}
            </div>
          ))}

          {/* Rows - Days */}
          {DAYS.map((day, dayIndex) => (
            <>
              <div
                key={`day-${dayIndex}`}
                className="text-[10px] font-semibold flex items-center justify-end pr-1"
              >
                {day}
              </div>
              {MOBILE_PERIODS.map((period, periodIndex) => {
                const cellData = getDataForPeriod(dayIndex, periodIndex);
                const count = cellData?.lead_count || 0;
                const conversionRate = cellData?.conversion_rate || 0;
                const isSelected = selectedCell?.day === dayIndex && selectedCell?.period === periodIndex;

                return (
                  <div
                    key={`cell-${dayIndex}-${periodIndex}`}
                    className={`h-5 rounded-sm ${getHeatColor(count)} ${isSelected ? 'ring-2 ring-primary' : ''} cursor-pointer transition-all`}
                    onClick={() => setSelectedCell({ day: dayIndex, period: periodIndex })}
                  />
                );
              })}
            </>
          ))}
        </div>

        {/* Selected cell info */}
        {selectedCell && selectedCell.period !== undefined && (
          <div className="mt-3 p-2 bg-muted rounded-md text-xs">
            <div className="font-semibold">
              {DAYS[selectedCell.day]} - {MOBILE_PERIODS[selectedCell.period].label}
            </div>
            <div className="text-muted-foreground">
              {getDataForPeriod(selectedCell.day, selectedCell.period)?.lead_count || 0} leads
              {(getDataForPeriod(selectedCell.day, selectedCell.period)?.lead_count || 0) > 0 && (
                <> ({getDataForPeriod(selectedCell.day, selectedCell.period)?.conversion_rate}% conversão)</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop view: render all 24 hours
  const renderDesktopHeatmap = () => (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `${labelWidth} repeat(24, ${cellSize}px)` }}>
          {/* Header - Hours */}
          <div className="text-xs font-semibold text-center"></div>
          {HOURS.map((hour, i) => (
            <div key={i} className="text-[10px] sm:text-xs text-center text-muted-foreground">
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
                const isSelected = selectedCell?.day === dayIndex && selectedCell?.hour === hourIndex;

                return (
                  <div
                    key={`cell-${dayIndex}-${hourIndex}`}
                    className={`h-6 sm:h-8 rounded-sm ${getHeatColor(count)} ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } cursor-pointer transition-all relative group`}
                    onClick={() => setSelectedCell({ day: dayIndex, hour: hourIndex })}
                    title={isMobile ? undefined : `${day} ${hourIndex}h: ${count} leads (${conversionRate}% conversão)`}
                  >
                    {/* Tooltip on hover (desktop only) */}
                    {!isMobile && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{day} às {hourIndex}h</div>
                        <div>{count} leads</div>
                        {count > 0 && <div>Taxa: {conversionRate}%</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>

        {/* Selected cell info (for tablet/mobile clicks) */}
        {selectedCell && selectedCell.hour !== undefined && (
          <div className="mt-3 p-2 bg-muted rounded-md text-xs sm:hidden">
            <div className="font-semibold">
              {DAYS[selectedCell.day]} às {selectedCell.hour}h
            </div>
            <div className="text-muted-foreground">
              {getDataForCell(selectedCell.day, selectedCell.hour)?.lead_count || 0} leads
              {(getDataForCell(selectedCell.day, selectedCell.hour)?.lead_count || 0) > 0 && (
                <> ({getDataForCell(selectedCell.day, selectedCell.hour)?.conversion_rate}% conversão)</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Heatmap - Horário × Dia da Semana</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isMobile
            ? "Distribuição de leads por período do dia (últimos 90 dias)"
            : "Distribuição de leads por dia da semana e hora do dia (últimos 90 dias)"}
        </p>
      </div>

      {isMobile ? renderMobileHeatmap() : renderDesktopHeatmap()}

      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
        <span className="text-muted-foreground font-semibold">Intensidade:</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 h-3 sm:h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <span className="text-muted-foreground">0</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 h-3 sm:h-4 bg-green-300 rounded"></div>
          <span className="text-muted-foreground">Baixo</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 h-3 sm:h-4 bg-green-400 rounded"></div>
          <span className="text-muted-foreground">Médio</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 h-3 sm:h-4 bg-green-500 rounded"></div>
          <span className="text-muted-foreground">Alto</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-4 sm:w-6 h-3 sm:h-4 bg-green-600 rounded"></div>
          <span className="text-muted-foreground">Muito Alto</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
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
    </Card>
  );
};
