import { MetricCard } from "@/components/admin/MetricCard";
import { CohortTable } from "@/components/admin/CohortTable";
import { StreakDistribution } from "@/components/admin/StreakDistribution";
import { CompletionRateChart } from "@/components/admin/CompletionRateChart";
import { NotificationMetrics } from "@/components/admin/NotificationMetrics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LineChart as LineChartIcon, BarChart3, Users, Zap, TrendingUp, Target, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const AdminAnalytics = () => {
  const {
    northStar,
    dauMauWau,
    dauTrend,
    cohortRetention,
    streakDistribution,
    completionRates,
    completionByCategory,
    sessionMetrics,
    userStats,
  } = useAnalytics();

  const isLoadingAny =
    northStar.isLoading ||
    dauMauWau.isLoading ||
    dauTrend.isLoading ||
    cohortRetention.isLoading ||
    streakDistribution.isLoading ||
    completionRates.isLoading ||
    sessionMetrics.isLoading ||
    userStats.isLoading;

  if (isLoadingAny) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Professional metrics tracking with industry benchmarks
        </p>
      </div>

      {/* Section 1: Hero Metrics (North Star + Stickiness) */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="North Star Metric"
          value={northStar.data?.weekly_active_users_with_completion || 0}
          description="Weekly Active Users with ≥1 Completed Habit"
          change={northStar.data?.week_over_week_change_percent}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={northStar.isLoading}
        />
        <MetricCard
          title="Stickiness (DAU/MAU)"
          value={`${dauMauWau.data?.stickiness_percent || 0}%`}
          description={`DAU: ${dauMauWau.data?.dau || 0} | MAU: ${dauMauWau.data?.mau || 0}`}
          benchmark="Target: 20% good, 30% excellent"
          icon={<Zap className="h-5 w-5" />}
          loading={dauMauWau.isLoading}
        />
      </div>

      {/* Section 2: DAU Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users (30 Days)</CardTitle>
          <CardDescription>
            Users who completed at least 1 habit per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dauTrend.isLoading ? (
            <div className="h-64 animate-pulse rounded bg-gray-200" />
          ) : !dauTrend.data || dauTrend.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No DAU data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dauTrend.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
                />
                <Line
                  type="monotone"
                  dataKey="dau"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Section 3: User Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Users"
            value={userStats.data?.total_users || 0}
            description="All registered users"
            icon={<Users className="h-5 w-5" />}
            loading={userStats.isLoading}
          />
          <MetricCard
            title="Premium Users"
            value={userStats.data?.premium_users || 0}
            description={`${userStats.data?.total_users > 0 ? ((userStats.data.premium_users / userStats.data.total_users) * 100).toFixed(1) : 0}% conversion`}
            icon={<Target className="h-5 w-5" />}
            loading={userStats.isLoading}
          />
          <MetricCard
            title="Perfect Days"
            value={userStats.data?.perfect_days_total || 0}
            description={`Avg ${Number(userStats.data?.avg_perfect_days_per_user || 0).toFixed(1)} per user`}
            icon={<BarChart3 className="h-5 w-5" />}
            loading={userStats.isLoading}
          />
        </div>
      </div>

      {/* Section 4: Cohort Retention Table */}
      <CohortTable
        data={cohortRetention.data || []}
        loading={cohortRetention.isLoading}
      />

      {/* Section 5: Engagement Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <StreakDistribution
            data={streakDistribution.data}
            loading={streakDistribution.isLoading}
          />
          <CompletionRateChart
            data={completionRates.data || []}
            loading={completionRates.isLoading}
          />
        </div>
      </div>

      {/* Section 6: Notification Performance */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Notification Performance</h2>
        <NotificationMetrics />
      </div>

      {/* Section 7: Session Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Session Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Sessions (30d)"
            value={sessionMetrics.data?.total_sessions || 0}
            description={`${sessionMetrics.data?.unique_users || 0} unique users`}
            loading={sessionMetrics.isLoading}
          />
          <MetricCard
            title="Avg Session Duration"
            value={`${Number(sessionMetrics.data?.avg_session_duration_minutes || 0).toFixed(1)} min`}
            description="Average time per session"
            loading={sessionMetrics.isLoading}
          />
          <MetricCard
            title="Sessions per User"
            value={Number(sessionMetrics.data?.avg_sessions_per_user || 0).toFixed(1)}
            description="Average sessions per active user"
            loading={sessionMetrics.isLoading}
          />
        </div>
      </div>

      {/* Section 8: Completion by Category */}
      {completionByCategory.data && completionByCategory.data.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Completion by Category</h2>
          <Card>
            <CardHeader>
              <CardTitle>Top Categories (30 Days)</CardTitle>
              <CardDescription>Most completed habit categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionByCategory.data.slice(0, 5).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.unique_users} users
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{category.total_completions}</p>
                      <p className="text-sm text-muted-foreground">completions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
