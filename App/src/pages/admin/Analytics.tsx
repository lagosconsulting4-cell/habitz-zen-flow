import { MetricCard } from "@/components/admin/MetricCard";
import { CohortTable } from "@/components/admin/CohortTable";
import { StreakDistribution } from "@/components/admin/StreakDistribution";
import { CompletionRateChart } from "@/components/admin/CompletionRateChart";
import { NotificationMetrics } from "@/components/admin/NotificationMetrics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LineChart as LineChartIcon, BarChart3, Users, Zap, TrendingUp, Target, DollarSign, Compass, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
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
    journeyTotals,
    journeyOverview,
    journeyDropoff,
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

      {/* Section 9: Journey Analytics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Journey Analytics</h2>

        {/* Journey Totals */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <MetricCard
            title="Total Enrollments"
            value={journeyTotals.data?.total_enrollments || 0}
            description={`${journeyTotals.data?.unique_users || 0} unique users`}
            icon={<Compass className="h-5 w-5" />}
            loading={journeyTotals.isLoading}
          />
          <MetricCard
            title="Active Journeys"
            value={journeyTotals.data?.active_journeys || 0}
            description="Currently in progress"
            icon={<TrendingUp className="h-5 w-5" />}
            loading={journeyTotals.isLoading}
          />
          <MetricCard
            title="Completed"
            value={journeyTotals.data?.completed_journeys || 0}
            description={`${journeyTotals.data?.overall_completion_rate || 0}% completion rate`}
            icon={<CheckCircle className="h-5 w-5" />}
            loading={journeyTotals.isLoading}
          />
          <MetricCard
            title="Completion Rate"
            value={`${journeyTotals.data?.overall_completion_rate || 0}%`}
            description="Overall journey completion"
            benchmark="Target: 40% good, 60% excellent"
            icon={<Target className="h-5 w-5" />}
            loading={journeyTotals.isLoading}
          />
        </div>

        {/* Per-Journey Breakdown */}
        {journeyOverview.data && journeyOverview.data.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Journey Performance</CardTitle>
              <CardDescription>Enrollment and completion by journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journeyOverview.data.map((j) => (
                  <div key={j.journey_id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {j.title} <span className="text-muted-foreground">L{j.level}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {j.total_enrollments} enrolled · {j.active_users} active · {j.completed_users} completed · {j.abandoned_users} abandoned
                        </p>
                      </div>
                      <span className="text-sm font-bold">{j.completion_rate}%</span>
                    </div>
                    <Progress value={Number(j.completion_rate)} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drop-off Chart (The Cliff detection) */}
        {journeyDropoff.data && journeyDropoff.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Drop-off by Day
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>
                Active users per day — days 10-14 highlighted as "The Cliff" zone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={journeyDropoff.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day_number" label={{ value: "Day", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Users", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name === "users_on_day" ? "Active users" : name]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Bar
                    dataKey="users_on_day"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    // Cliff zone bars get a different color
                    shape={(props: Record<string, unknown>) => {
                      const { x, y, width, height, payload } = props as {
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                        payload: { is_cliff_zone: boolean };
                      };
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={payload.is_cliff_zone ? "#f59e0b" : "#3b82f6"}
                          rx={4}
                          ry={4}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
