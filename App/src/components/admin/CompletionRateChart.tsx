import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface CompletionRateChartProps {
  data: Array<{
    date: string;
    completion_rate_percent: number;
  }>;
  loading?: boolean;
}

export const CompletionRateChart = ({ data, loading = false }: CompletionRateChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Completion Rate (30 Days)</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Completion Rate (30 Days)</CardTitle>
          <CardDescription>No completion data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No habit completions yet.</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    dateFormatted: format(new Date(item.date), "MMM d"),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Completion Rate (30 Days)</CardTitle>
        <CardDescription>
          Percentage of scheduled habits completed each day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateFormatted" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completion_rate_percent"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
