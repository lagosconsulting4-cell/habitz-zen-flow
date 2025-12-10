import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, DollarSign, FileText, ShieldCheck } from "lucide-react";

interface DashboardStats {
  userStats: {
    total_users: number;
    premium_users: number;
    active_today: number;
    active_7d: number;
  } | null;
  engagementStats: {
    total_habits: number;
    completions_today: number;
  } | null;
  revenueStats: {
    total_revenue_cents: number;
    purchases_today: number;
  } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    userStats: null,
    engagementStats: null,
    revenueStats: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Query the views created in migration
        const [userStats, engagementStats, revenueStats] = await Promise.all([
          supabase.from("admin_user_stats").select("*").single(),
          supabase.from("admin_engagement_metrics").select("*").single(),
          supabase.from("admin_revenue_metrics").select("*").single(),
        ]);

        setStats({
          userStats: userStats.data || null,
          engagementStats: engagementStats.data || null,
          revenueStats: revenueStats.data || null,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and quick actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.userStats?.total_users || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Today</p>
              <p className="text-2xl font-bold">{stats.userStats?.active_today || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Revenue Today</p>
              <p className="text-2xl font-bold">
                R$ {((stats.revenueStats?.revenue_today_cents || 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Completions Today</p>
              <p className="text-2xl font-bold">{stats.engagementStats?.completions_today || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/users">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">User Management</h3>
                <p className="text-sm text-muted-foreground">View and manage users</p>
              </div>
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/content">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Content Management</h3>
                <p className="text-sm text-muted-foreground">Manage meditations, tips, books</p>
              </div>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/analytics">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">View detailed metrics</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link to="/admin/audit">
          <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Audit Log</h3>
                <p className="text-sm text-muted-foreground">View admin actions</p>
              </div>
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
