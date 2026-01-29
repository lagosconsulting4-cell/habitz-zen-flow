import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UTMData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  total_leads: number;
  converted: number;
  conversion_rate: number;
  first_lead_date: string;
  last_lead_date: string;
}

interface LeadsUTMTableProps {
  data: UTMData[] | null;
  loading?: boolean;
}

export const LeadsUTMTable = ({ data, loading }: LeadsUTMTableProps) => {
  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Performance por UTM</h3>
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4">Performance por UTM</h3>
        <div className="h-[300px] sm:h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados de UTM disponíveis</p>
        </div>
      </Card>
    );
  }

  const totalLeads = data.reduce((sum, row) => sum + row.total_leads, 0);
  const totalConverted = data.reduce((sum, row) => sum + row.converted, 0);
  const avgConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Performance por UTM</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total de Leads:</span>
            <span className="ml-2 font-semibold">{totalLeads}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Convertidos:</span>
            <span className="ml-2 font-semibold text-green-600">{totalConverted}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa Média:</span>
            <span className="ml-2 font-semibold">{avgConversionRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-semibold">Source</th>
              <th className="p-3 text-left font-semibold">Medium</th>
              <th className="p-3 text-left font-semibold">Campaign</th>
              <th className="p-3 text-right font-semibold">Leads</th>
              <th className="p-3 text-right font-semibold">Convertidos</th>
              <th className="p-3 text-right font-semibold">Taxa</th>
              <th className="p-3 text-left font-semibold">Período</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Badge variant="outline">{row.utm_source}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{row.utm_medium}</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="outline" className="max-w-[120px] sm:max-w-[200px] truncate">
                    {row.utm_campaign}
                  </Badge>
                </td>
                <td className="p-3 text-right font-medium">{row.total_leads}</td>
                <td className="p-3 text-right text-green-600 font-medium">{row.converted}</td>
                <td className="p-3 text-right">
                  <span
                    className={`font-semibold ${
                      row.conversion_rate >= avgConversionRate
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {row.conversion_rate}%
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {format(new Date(row.first_lead_date), "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(new Date(row.last_lead_date), "dd/MM/yy", { locale: ptBR })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          📊 Mostrando top 20 combinações de UTM por volume de leads.{" "}
          <span
            className={`font-semibold ${
              data.some((row) => row.conversion_rate > avgConversionRate * 1.5)
                ? "text-green-600"
                : ""
            }`}
          >
            {data.some((row) => row.conversion_rate > avgConversionRate * 1.5) &&
              "Destaque para campanhas com taxa 50% acima da média."}
          </span>
        </p>
      </div>
    </Card>
  );
};
