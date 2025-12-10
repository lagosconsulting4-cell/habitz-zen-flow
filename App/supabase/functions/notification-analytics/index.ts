import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface AnalyticsRequest {
  type: "dashboard" | "by_context" | "by_date" | "user_analytics" | "copy_variants";
  days?: number;
  context_type?: string;
}

interface AnalyticsResponse {
  success: boolean;
  type: string;
  data?: unknown;
  error?: string;
}

async function getAnalyticsDashboard(days: number = 7) {
  // Get overall metrics
  const { data: dailySummary } = await supabase
    .from("notification_daily_summary")
    .select("*")
    .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Get top performing copies
  const { data: topCopies } = await supabase
    .from("notification_analytics")
    .select("*")
    .gte("date_sent", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("open_rate_percent", { ascending: false })
    .limit(10);

  // Calculate aggregates
  const totalSent = dailySummary?.reduce((sum, d) => sum + (d.total_sent || 0), 0) || 0;
  const totalOpened = dailySummary?.reduce((sum, d) => sum + (d.total_opened || 0), 0) || 0;
  const totalCompleted = dailySummary?.reduce((sum, d) => sum + (d.direct_completions || 0), 0) || 0;

  return {
    period_days: days,
    summary: {
      total_sent: totalSent,
      total_opened: totalOpened,
      overall_open_rate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0,
      total_completed: totalCompleted,
      direct_completion_rate: totalSent > 0 ? ((totalCompleted / totalSent) * 100).toFixed(2) : 0,
    },
    daily_breakdown: dailySummary || [],
    top_performing_copies: topCopies || [],
  };
}

async function getAnalyticsByContext(context: string, days: number = 7) {
  const { data } = await supabase
    .from("notification_analytics")
    .select("*")
    .eq("context_type", context)
    .gte("date_sent", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("date_sent", { ascending: false });

  return {
    context_type: context,
    period_days: days,
    variants: data || [],
  };
}

async function getAnalyticsByDate(date: string) {
  const { data } = await supabase
    .from("notification_analytics")
    .select("*")
    .eq("date_sent", date)
    .order("open_rate_percent", { ascending: false });

  return {
    date,
    analytics: data || [],
  };
}

async function getUserAnalytics(days: number = 30) {
  const { data } = await supabase
    .from("notification_user_analytics")
    .select("*")
    .order("total_notifications", { ascending: false })
    .limit(50);

  return {
    period_days: days,
    top_users: data || [],
  };
}

async function getCopyVariantsComparison(days: number = 7) {
  const { data } = await supabase
    .from("notification_analytics")
    .select("*")
    .gte("date_sent", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("total_sent", { ascending: false });

  // Group by context and sort by performance
  const grouped: { [key: string]: unknown[] } = {};
  data?.forEach((row) => {
    if (!grouped[row.context_type]) {
      grouped[row.context_type] = [];
    }
    grouped[row.context_type].push(row);
  });

  return {
    period_days: days,
    by_context: grouped,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const request: AnalyticsRequest = await req.json();
    const { type, days = 7, context_type } = request;

    let result;

    switch (type) {
      case "dashboard":
        result = await getAnalyticsDashboard(days);
        break;

      case "by_context":
        if (!context_type) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "context_type is required for by_context query",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        result = await getAnalyticsByContext(context_type, days);
        break;

      case "by_date":
        if (!context_type) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "date is required for by_date query (use context_type field for date)",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        result = await getAnalyticsByDate(context_type);
        break;

      case "user_analytics":
        result = await getUserAnalytics(days);
        break;

      case "copy_variants":
        result = await getCopyVariantsComparison(days);
        break;

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown type: ${type}. Valid types: dashboard, by_context, by_date, user_analytics, copy_variants`,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
    }

    const response: AnalyticsResponse = {
      success: true,
      type,
      data: result,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
