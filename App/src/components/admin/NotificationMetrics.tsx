import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NotificationMetrics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notification-analytics-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_daily_summary")
        .select("*")
        .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Performance (30 Days)</CardTitle>
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
          <CardTitle>Notification Performance (30 Days)</CardTitle>
          <CardDescription>No notification data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
        </CardContent>
      </Card>
    );
  }

  const aggregatedData = data.reduce((acc, item) => {
    const existing = acc.find((i) => i.context_type === item.context_type);
    if (existing) {
      existing.total_sent += item.total_sent || 0;
      existing.total_opened += item.total_opened || 0;
      existing.direct_completions += item.direct_completions || 0;
    } else {
      acc.push({
        context_type: item.context_type,
        total_sent: item.total_sent || 0,
        total_opened: item.total_opened || 0,
        direct_completions: item.direct_completions || 0,
      });
    }
    return acc;
  }, [] as any[]);

  const chartData = aggregatedData.map((item) => ({
    context: item.context_type,
    openRate: item.total_sent > 0 ? ((item.total_opened / item.total_sent) * 100).toFixed(1) : 0,
    completionRate: item.total_sent > 0 ? ((item.direct_completions / item.total_sent) * 100).toFixed(1) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Performance (30 Days)</CardTitle>
        <CardDescription>
          Open rate and completion rate by notification context
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="context" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate %" />
            <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
