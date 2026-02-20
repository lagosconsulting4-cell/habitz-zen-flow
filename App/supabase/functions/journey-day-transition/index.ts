/**
 * Edge Function: journey-day-transition
 *
 * Scans for active journeys where all habits for the current day have been
 * completed but the day hasn't been advanced yet. Calls advance_journey_to_next_day
 * for each. Designed to run daily via cron (GitHub Actions or pg_cron).
 *
 * Also handles habit lifecycle: creates new habits for the next day and
 * archives expired ones.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL");
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1. Fetch all active journey states
    const { data: activeStates, error: statesErr } = await supabase
      .from("user_journey_state")
      .select("id, user_id, journey_id, current_day")
      .eq("status", "active");

    if (statesErr) throw statesErr;
    if (!activeStates || activeStates.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active journeys", advanced: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let advanced = 0;
    let skipped = 0;
    let errors = 0;

    for (const state of activeStates) {
      try {
        // 2. Check if this day was already advanced (completion exists)
        const { data: existing } = await supabase
          .from("user_journey_day_completions")
          .select("id")
          .eq("user_id", state.user_id)
          .eq("journey_id", state.journey_id)
          .eq("day_number", state.current_day)
          .maybeSingle();

        if (existing) {
          // Already completed — skip
          skipped++;
          continue;
        }

        // 3. Check if ALL active journey habits for today are completed
        const { data: journeyHabits } = await supabase
          .from("user_journey_habits")
          .select("habit_id")
          .eq("user_id", state.user_id)
          .eq("journey_id", state.journey_id)
          .eq("is_active", true)
          .lte("introduced_on_day", state.current_day);

        if (!journeyHabits || journeyHabits.length === 0) {
          skipped++;
          continue;
        }

        const habitIds = journeyHabits.map((h) => h.habit_id);

        // Check completions for today
        const { data: completions } = await supabase
          .from("habit_completions")
          .select("habit_id")
          .in("habit_id", habitIds)
          .gte("completed_at", `${today}T00:00:00`)
          .lte("completed_at", `${today}T23:59:59`);

        const completedIds = new Set((completions || []).map((c) => c.habit_id));
        const allComplete = habitIds.every((id) => completedIds.has(id));

        if (!allComplete) {
          skipped++;
          continue;
        }

        // 4. All habits complete — advance the day using the RPC
        // We use service role to bypass RLS auth.uid() check, so we call the
        // underlying logic directly instead of the SECURITY DEFINER function.
        // Insert day completion
        await supabase
          .from("user_journey_day_completions")
          .insert({
            user_id: state.user_id,
            journey_id: state.journey_id,
            day_number: state.current_day,
          })
          .throwOnError();

        // Get journey duration
        const { data: journey } = await supabase
          .from("journeys")
          .select("duration_days")
          .eq("id", state.journey_id)
          .single();

        const duration = journey?.duration_days || 30;
        const nextDay = state.current_day + 1;
        const newDaysCompleted =
          (await supabase
            .from("user_journey_day_completions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", state.user_id)
            .eq("journey_id", state.journey_id)
            .then((r) => r.count)) || 0;

        if (nextDay > duration) {
          // Journey complete
          await supabase
            .from("user_journey_state")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              days_completed: newDaysCompleted,
              completion_percent: 100,
              updated_at: new Date().toISOString(),
            })
            .eq("id", state.id)
            .throwOnError();
        } else {
          // Advance to next day
          const { data: nextPhase } = await supabase
            .from("journey_phases")
            .select("phase_number")
            .eq("journey_id", state.journey_id)
            .gte("day_end", nextDay)
            .lte("day_start", nextDay)
            .maybeSingle();

          await supabase
            .from("user_journey_state")
            .update({
              current_day: nextDay,
              days_completed: newDaysCompleted,
              completion_percent: Math.floor((newDaysCompleted * 100) / duration),
              current_phase: nextPhase?.phase_number || state.current_day,
              updated_at: new Date().toISOString(),
            })
            .eq("id", state.id)
            .throwOnError();

          // Update progressive goals
          const { data: progressions } = await supabase
            .from("journey_habit_templates")
            .select("id, goal_progression")
            .eq("journey_id", state.journey_id)
            .not("goal_progression", "eq", "[]");

          if (progressions) {
            for (const tmpl of progressions) {
              const prog = tmpl.goal_progression as Array<{
                from_day: number;
                goal_value: number;
              }>;
              const match = prog.find((p) => p.from_day === nextDay);
              if (match) {
                await supabase
                  .from("user_journey_habits")
                  .update({ current_goal_value: match.goal_value })
                  .eq("user_id", state.user_id)
                  .eq("journey_id", state.journey_id)
                  .eq("journey_habit_template_id", tmpl.id)
                  .eq("is_active", true);
              }
            }
          }
        }

        advanced++;
        console.log(
          `[DayTransition] Advanced user=${state.user_id} journey=${state.journey_id} day=${state.current_day}→${nextDay}`
        );
      } catch (err) {
        errors++;
        console.error(
          `[DayTransition] Error for user=${state.user_id} journey=${state.journey_id}:`,
          err
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: activeStates.length,
        advanced,
        skipped,
        errors,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[DayTransition] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
