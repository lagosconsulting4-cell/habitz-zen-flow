import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  // North Star Metric
  const northStar = useQuery({
    queryKey: ["analytics-north-star"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_north_star_metric")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // 1 minute for real-time feel
  });

  // DAU/MAU/WAU
  const dauMauWau = useQuery({
    queryKey: ["analytics-dau-mau-wau"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_dau_mau_wau")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // DAU Trend (30 days)
  const dauTrend = useQuery({
    queryKey: ["analytics-dau-trend"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_dau_trend_30d")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Cohort Retention
  const cohortRetention = useQuery({
    queryKey: ["analytics-cohort-retention"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_cohort_retention")
        .select("*")
        .order("cohort_week", { ascending: false })
        .limit(12); // Last 12 weeks
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Streak Distribution
  const streakDistribution = useQuery({
    queryKey: ["analytics-streak-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_streak_distribution")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Completion Rates (30 days)
  const completionRates = useQuery({
    queryKey: ["analytics-completion-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_completion_rates_30d")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Completion by Category
  const completionByCategory = useQuery({
    queryKey: ["analytics-completion-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_completion_by_category")
        .select("*")
        .order("total_completions", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Session Metrics
  const sessionMetrics = useQuery({
    queryKey: ["analytics-session-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_session_metrics")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // User Stats (existing view, for comparison)
  const userStats = useQuery({
    queryKey: ["analytics-user-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_user_stats")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Journey Totals
  const journeyTotals = useQuery({
    queryKey: ["analytics-journey-totals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_journey_totals")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Journey Overview (per journey)
  const journeyOverview = useQuery({
    queryKey: ["analytics-journey-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_journey_overview")
        .select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Journey Drop-off (active users by day)
  const journeyDropoff = useQuery({
    queryKey: ["analytics-journey-dropoff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_journey_dropoff")
        .select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  return {
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
  };
};
