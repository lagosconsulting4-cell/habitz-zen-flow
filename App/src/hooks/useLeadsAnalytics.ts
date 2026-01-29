import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLeadsAnalytics = () => {
  // Funnel view
  const funnel = useQuery({
    queryKey: ["leads-analytics-funnel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_funnel")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000, // 1 minute
  });

  // Demographics - Age
  const byAge = useQuery({
    queryKey: ["leads-analytics-by-age"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_age")
        .select("*")
        .order("total", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Demographics - Profession
  const byProfession = useQuery({
    queryKey: ["leads-analytics-by-profession"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_profession")
        .select("*")
        .order("total", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Demographics - Objective
  const byObjective = useQuery({
    queryKey: ["leads-analytics-by-objective"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_objective")
        .select("*")
        .order("total", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Demographics - Financial Range
  const byFinancialRange = useQuery({
    queryKey: ["leads-analytics-by-financial-range"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_financial_range")
        .select("*")
        .order("total", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Demographics - Gender
  const byGender = useQuery({
    queryKey: ["leads-analytics-by-gender"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_gender")
        .select("*")
        .order("total", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // UTM Tracking
  const byUTM = useQuery({
    queryKey: ["leads-analytics-by-utm"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_utm")
        .select("*")
        .order("total_leads", { ascending: false })
        .limit(20); // Top 20 UTM combinations
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Temporal - Daily
  const temporal = useQuery({
    queryKey: ["leads-analytics-temporal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_temporal")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Temporal - Weekly
  const temporalWeekly = useQuery({
    queryKey: ["leads-analytics-temporal-weekly"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_temporal_weekly")
        .select("*")
        .order("week_start", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Heatmap
  const heatmap = useQuery({
    queryKey: ["leads-analytics-heatmap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_heatmap")
        .select("*")
        .order("day_of_week", { ascending: true })
        .order("hour_of_day", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // By Source
  const bySource = useQuery({
    queryKey: ["leads-analytics-by-source"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_by_source")
        .select("*")
        .order("total_leads", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Top Challenges
  const topChallenges = useQuery({
    queryKey: ["leads-analytics-top-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_leads_top_challenges")
        .select("*")
        .order("lead_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  return {
    funnel,
    byAge,
    byProfession,
    byObjective,
    byFinancialRange,
    byGender,
    byUTM,
    temporal,
    temporalWeekly,
    heatmap,
    bySource,
    topChallenges,
  };
};
