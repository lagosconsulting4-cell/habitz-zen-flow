import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DemographicData {
  age_range?: string;
  profession?: string;
  objective?: string;
  financial_range?: string;
  gender?: string;
  total: number;
  converted: number;
  conversion_rate: number;
}

interface LeadsDemographicsProps {
  byAge: DemographicData[] | null;
  byProfession: DemographicData[] | null;
  byObjective: DemographicData[] | null;
  byFinancialRange: DemographicData[] | null;
  byGender: DemographicData[] | null;
  loading?: boolean;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#eab308", "#ef4444", "#14b8a6", "#f97316", "#ec4899"];

const DemographicChart = ({
  data,
  nameKey,
  title,
}: {
  data: DemographicData[] | null;
  nameKey: keyof DemographicData;
  title: string;
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Sem dados disponíveis</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item[nameKey] as string,
    value: item.total,
    converted: item.converted,
    conversionRate: item.conversion_rate,
  }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Distribuição por {title}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Conversion Rate */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Taxa de Conversão por {title}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "conversionRate") return `${value}%`;
                  return value;
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="conversionRate" fill="#22c55e" name="Taxa de Conversão (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-semibold">{title}</th>
              <th className="p-3 text-right font-semibold">Total</th>
              <th className="p-3 text-right font-semibold">Convertidos</th>
              <th className="p-3 text-right font-semibold">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 capitalize">{row.name}</td>
                <td className="p-3 text-right">{row.value}</td>
                <td className="p-3 text-right text-green-600">{row.converted}</td>
                <td className="p-3 text-right font-semibold">{row.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LeadsDemographics = ({
  byAge,
  byProfession,
  byObjective,
  byFinancialRange,
  byGender,
  loading,
}: LeadsDemographicsProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Segmentação Demográfica</h3>
        <div className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Segmentação Demográfica</h3>
      <Tabs defaultValue="age" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="age">Idade</TabsTrigger>
          <TabsTrigger value="profession">Profissão</TabsTrigger>
          <TabsTrigger value="objective">Objetivo</TabsTrigger>
          <TabsTrigger value="income">Renda</TabsTrigger>
          <TabsTrigger value="gender">Gênero</TabsTrigger>
        </TabsList>

        <TabsContent value="age" className="mt-6">
          <DemographicChart data={byAge} nameKey="age_range" title="Faixa Etária" />
        </TabsContent>

        <TabsContent value="profession" className="mt-6">
          <DemographicChart data={byProfession} nameKey="profession" title="Profissão" />
        </TabsContent>

        <TabsContent value="objective" className="mt-6">
          <DemographicChart data={byObjective} nameKey="objective" title="Objetivo" />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <DemographicChart data={byFinancialRange} nameKey="financial_range" title="Faixa Salarial" />
        </TabsContent>

        <TabsContent value="gender" className="mt-6">
          <DemographicChart data={byGender} nameKey="gender" title="Gênero" />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
