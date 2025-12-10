import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StreakDistributionProps {
  data: {
    no_streak: number;
    streak_1_6: number;
    streak_7_29: number;
    streak_30_99: number;
    streak_100_plus: number;
    percent_with_7plus_streak: number;
  };
  loading?: boolean;
}

export const StreakDistribution = ({ data, loading = false }: StreakDistributionProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Distribution</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak Distribution</CardTitle>
          <CardDescription>No streak data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active users yet.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { range: "0 days", count: data.no_streak, color: "#ef4444" },
    { range: "1-6 days", count: data.streak_1_6, color: "#f59e0b" },
    { range: "7-29 days", count: data.streak_7_29, color: "#10b981" },
    { range: "30-99 days", count: data.streak_30_99, color: "#3b82f6" },
    { range: "100+ days", count: data.streak_100_plus, color: "#8b5cf6" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Distribution</CardTitle>
        <CardDescription>
          {data.percent_with_7plus_streak}% of active users have 7+ day streaks (Duolingo benchmark: 50%+)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
