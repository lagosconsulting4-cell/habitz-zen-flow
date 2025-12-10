import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, DollarSign, Target, Calendar, Zap } from "lucide-react";

interface AnalyticsData {
  userStats: any;
  engagementStats: any;
  revenueStats: any;
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData>({
    userStats: null,
    engagementStats: null,
    revenueStats: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [userStats, engagementStats, revenueStats] = await Promise.all([
          supabase.from("admin_user_stats").select("*").single(),
          supabase.from("admin_engagement_metrics").select("*").single(),
          supabase.from("admin_revenue_metrics").select("*").single(),
        ]);

        setData({
          userStats: userStats.data,
          engagementStats: engagementStats.data,
          revenueStats: revenueStats.data,
        });
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Detailed metrics and insights</p>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{data.userStats?.total_users || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Target className="h-10 w-10 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Premium Users</p>
                <p className="text-3xl font-bold">{data.userStats?.premium_users || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {data.userStats?.total_users > 0
                    ? `${((data.userStats.premium_users / data.userStats.total_users) * 100).toFixed(1)}% conversion`
                    : "0% conversion"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Zap className="h-10 w-10 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active (7d)</p>
                <p className="text-3xl font-bold">{data.userStats?.active_7d || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {data.userStats?.total_users > 0
                    ? `${((data.userStats.active_7d / data.userStats.total_users) * 100).toFixed(1)}% retention`
                    : "0% retention"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Habits</p>
                <p className="text-3xl font-bold">{data.engagementStats?.total_habits || 0}</p>
                <p className="text-xs text-muted-foreground">
                  Avg {Number(data.engagementStats?.avg_habits_per_user || 0).toFixed(1)} per user
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completions (30d)</p>
                <p className="text-3xl font-bold">{data.engagementStats?.completions_30d || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {data.engagementStats?.completions_7d || 0} in last 7 days
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-indigo-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users Today</p>
                <p className="text-3xl font-bold">{data.engagementStats?.users_completed_today || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Revenue Metrics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  R$ {((data.revenueStats?.total_revenue_cents || 0) / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.revenueStats?.total_purchases || 0} purchases
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue (30d)</p>
                <p className="text-3xl font-bold">
                  R$ {((data.revenueStats?.revenue_30d_cents || 0) / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.revenueStats?.purchases_30d || 0} purchases
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Target className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Purchase</p>
                <p className="text-3xl font-bold">
                  R$ {((data.revenueStats?.avg_purchase_cents || 0) / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.revenueStats?.paying_users || 0} paying users
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
