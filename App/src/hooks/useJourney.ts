/**
 * useJourney — Main hook for the Journeys system
 *
 * Follows patterns from useGuided.ts and useHabits.tsx:
 * - React Query for data fetching / caching
 * - Mutations for state changes
 * - Supabase RPC for complex operations
 */

import { useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";

// ============================================
// TYPES
// ============================================

export interface Journey {
  id: string;
  slug: string;
  theme_slug: string;
  title: string;
  subtitle: string | null;
  promise: string | null;
  description: string | null;
  level: number;
  duration_days: number;
  illustration_key: string;
  cover_image_url: string | null;
  target_audience: string | null;
  expected_result: string | null;
  prerequisite_journey_slug: string | null;
  prerequisite_min_percent: number | null;
  tags: string[];
  is_active: boolean;
  sort_order: number;
}

export interface JourneyPhase {
  id: string;
  journey_id: string;
  phase_number: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  day_start: number;
  day_end: number;
  badge_illustration_key: string | null;
  badge_name: string | null;
}

export interface JourneyDay {
  id: string;
  journey_id: string;
  phase_id: string;
  day_number: number;
  title: string;
  card_content: string;
  motivational_note: string | null;
  is_rest_day: boolean;
  is_review_day: boolean;
  is_cliff_day: boolean;
  estimated_minutes: number | null;
}

export interface JourneyHabitTemplate {
  id: string;
  journey_id: string;
  name: string;
  emoji: string;
  illustration_key: string | null;
  category: string;
  period: string;
  tracking_type: string;
  unit: string;
  initial_goal_value: number | null;
  start_day: number;
  end_day: number | null;
  frequency_type: string;
  days_of_week: number[];
  goal_progression: Array<{ from_day: number; goal_value: number }>;
  canonical_key: string | null;
  sort_order: number;
}

export interface UserJourneyState {
  id: string;
  user_id: string;
  journey_id: string;
  started_at: string;
  current_day: number;
  current_phase: number;
  status: "active" | "paused" | "completed" | "abandoned";
  days_completed: number;
  completion_percent: number;
  completed_at: string | null;
  paused_at: string | null;
  updated_at: string;
}

export interface UserJourneyHabit {
  id: string;
  user_id: string;
  journey_id: string;
  habit_id: string;
  journey_habit_template_id: string | null;
  canonical_key: string | null;
  introduced_on_day: number;
  expires_on_day: number | null;
  current_goal_value: number | null;
  is_active: boolean;
}

export interface JourneyWithState extends Journey {
  userState: UserJourneyState | null;
}

// ============================================
// CANONICAL KEY → ICON MAPPING
// ============================================

/** Maps canonical_key from journey_habit_templates to valid HabitIconKey values */
export const CANONICAL_TO_ICON: Record<string, string> = {
  // Digital Detox
  screen_time_tracking: "social_media",
  focus_mode: "focus",
  digital_curfew: "no_screens",
  grayscale_mode: "no_screens",
  phone_free_morning: "no_screens",
  analog_activity: "leisure",
  weekly_review: "review",
  notification_cleanup: "checklist",
  offline_block: "pause",
  app_limits: "ban",
  digital_sabbath: "detox",
  // Own Your Mornings
  bed_making: "make_bed",
  morning_hydration: "water",
  morning_sunlight: "sunrise",
  deep_breathing: "meditate",
  morning_journaling: "journal",
  morning_meditation: "meditate",
  cold_exposure: "activity_rings",
  caffeine_delay: "breakfast",
  morning_reading: "book",
  evening_protocol: "sleep",
  // Gym
  gym_workout: "strength",
  gym_pack_bag: "checklist",
  gym_hydration: "water",
  post_workout_meal: "meal",
  gym_schedule_week: "plan",
  gym_workout_log: "journal",
  active_recovery: "stretch",
  protein_goal: "protein",
  recovery_sleep: "sleep",
  // Focus Protocol
  deep_work_session: "deep_work",
  daily_task_1: "target",
  bedtime_tracking: "sleep",
  phone_free_block: "no_screens",
  focused_reading: "book",
  time_blocking: "clock",
  active_recall: "study",
  spaced_repetition: "study",
  weekly_focus_review: "review",
  // Finances
  expense_tracking: "checklist",
  mindful_spending: "pause",
  financial_check: "review",
  pay_yourself_first: "target",
  latte_factor: "breakfast",
  weekly_budget: "plan",
  savings_automation: "target",
  emergency_fund_tracker: "target",
  weekly_financial_review: "review",
};

// ============================================
// HOOKS
// ============================================

/**
 * List all journeys with user's state for each
 */
export const useJourneys = () => {
  const { user } = useAuth();

  const { data: journeys = [], isLoading: journeysLoading } = useQuery({
    queryKey: ["journeys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as Journey[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: userStates = [], isLoading: statesLoading } = useQuery({
    queryKey: ["user-journey-states", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_journey_state")
        .select("*");
      if (error) throw error;
      return (data || []) as UserJourneyState[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000, // discard cached data quickly so remount gets fresh data
  });

  // Fetch completed journey slugs for L2 unlock check
  // Defensive: treat completion_percent >= 100 as complete even if status stuck on "active"
  const completedSlugs = useMemo(() => {
    const completedIds = userStates
      .filter((s) =>
        (s.status === "completed" && s.completion_percent >= 80) ||
        s.completion_percent >= 100
      )
      .map((s) => s.journey_id);
    return journeys
      .filter((j) => completedIds.includes(j.id))
      .map((j) => j.slug);
  }, [userStates, journeys]);

  const journeysWithState: JourneyWithState[] = useMemo(() => {
    return journeys.map((j) => ({
      ...j,
      userState: userStates.find((s) => s.journey_id === j.id) || null,
    }));
  }, [journeys, userStates]);

  // Self-healing: fix inconsistent states where percent >= 100 but status stuck
  const healingRef = useRef<Set<string>>(new Set());
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const inconsistent = userStates.filter(
      (s) => s.completion_percent >= 100 && s.status !== "completed"
    );
    if (inconsistent.length === 0) return;

    for (const state of inconsistent) {
      if (healingRef.current.has(state.id)) continue;
      healingRef.current.add(state.id);

      supabase
        .from("user_journey_state")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["user-journey-states"] });
          queryClient.invalidateQueries({ queryKey: ["user-journey-states-active"] });
        });
    }
  }, [userStates, user, queryClient]);

  const isL2Unlocked = useCallback(
    (journey: Journey): boolean => {
      if (journey.level === 1) return true;
      if (!journey.prerequisite_journey_slug) return true;
      return completedSlugs.includes(journey.prerequisite_journey_slug);
    },
    [completedSlugs]
  );

  return {
    journeys: journeysWithState,
    loading: journeysLoading || statesLoading,
    isL2Unlocked,
  };
};

/**
 * Get active journeys for the current user
 */
export const useActiveJourneys = () => {
  const { user } = useAuth();

  const { data: activeStates = [], isLoading } = useQuery({
    queryKey: ["user-journey-states-active", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_journey_state")
        .select("*, journeys(*)")
        .eq("status", "active");
      if (error) throw error;
      return (data || []) as Array<UserJourneyState & { journeys: Journey }>;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  return { activeStates, loading: isLoading };
};

/**
 * Detailed view of a single journey — single query with JOINs for static data
 */
export const useJourneyDetail = (slug: string) => {
  const { user } = useAuth();

  // Single query fetches journey + phases + days + templates in 1 RTT
  const { data: journeyBundle, isLoading: journeyLoading } = useQuery({
    queryKey: ["journey-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("*, journey_phases(*), journey_days(*), journey_habit_templates(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Journey & {
        journey_phases: JourneyPhase[];
        journey_days: JourneyDay[];
        journey_habit_templates: JourneyHabitTemplate[];
      };
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const journey = journeyBundle ? {
    id: journeyBundle.id,
    slug: journeyBundle.slug,
    theme_slug: journeyBundle.theme_slug,
    title: journeyBundle.title,
    subtitle: journeyBundle.subtitle,
    promise: journeyBundle.promise,
    description: journeyBundle.description,
    level: journeyBundle.level,
    duration_days: journeyBundle.duration_days,
    illustration_key: journeyBundle.illustration_key,
    cover_image_url: journeyBundle.cover_image_url,
    target_audience: journeyBundle.target_audience,
    expected_result: journeyBundle.expected_result,
    prerequisite_journey_slug: journeyBundle.prerequisite_journey_slug,
    prerequisite_min_percent: journeyBundle.prerequisite_min_percent,
    tags: journeyBundle.tags,
    is_active: journeyBundle.is_active,
    sort_order: journeyBundle.sort_order,
  } as Journey : undefined;

  const phases = useMemo(() =>
    (journeyBundle?.journey_phases || [])
      .sort((a, b) => a.phase_number - b.phase_number) as JourneyPhase[],
    [journeyBundle]
  );
  const days = useMemo(() =>
    (journeyBundle?.journey_days || [])
      .sort((a, b) => a.day_number - b.day_number) as JourneyDay[],
    [journeyBundle]
  );
  const habitTemplates = useMemo(() =>
    (journeyBundle?.journey_habit_templates || [])
      .sort((a, b) => a.sort_order - b.sort_order) as JourneyHabitTemplate[],
    [journeyBundle]
  );

  // User-scoped queries still depend on journey id (but run in parallel, not waterfall)
  const { data: userState } = useQuery({
    queryKey: ["user-journey-state", user?.id, journey?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_journey_state")
        .select("*")
        .eq("journey_id", journey!.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserJourneyState | null;
    },
    enabled: !!user && !!journey?.id,
    staleTime: 60 * 1000,
  });

  const { data: dayCompletions = [] } = useQuery({
    queryKey: ["user-journey-day-completions", user?.id, journey?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_journey_day_completions")
        .select("day_number")
        .eq("journey_id", journey!.id);
      if (error) throw error;
      return (data || []).map((d: { day_number: number }) => d.day_number);
    },
    enabled: !!user && !!journey?.id,
    staleTime: 60 * 1000,
  });

  return {
    journey,
    phases,
    days,
    habitTemplates,
    userState: userState || null,
    dayCompletions,
    loading: journeyLoading,
  };
};

/**
 * Content for a single day
 * Accepts optional journeyId to skip the slug→id lookup (use cached value)
 */
export const useJourneyDay = (slug: string, dayNumber: number, journeyId?: string) => {
  const { data: day, isLoading } = useQuery({
    queryKey: ["journey-day", slug, dayNumber],
    queryFn: async () => {
      let jId = journeyId;
      if (!jId) {
        // Fallback: look up journey id from slug
        const { data: journey, error: jErr } = await supabase
          .from("journeys")
          .select("id")
          .eq("slug", slug)
          .single();
        if (jErr) throw jErr;
        jId = journey.id;
      }

      const { data, error } = await supabase
        .from("journey_days")
        .select("*")
        .eq("journey_id", jId)
        .eq("day_number", dayNumber)
        .single();
      if (error) throw error;
      return data as JourneyDay;
    },
    enabled: !!slug && dayNumber > 0,
    staleTime: 5 * 60 * 1000,
  });

  return { day, loading: isLoading };
};

/**
 * Get journey habits linked to the user for a specific journey
 */
export const useJourneyHabits = (journeyId: string | undefined) => {
  const { user } = useAuth();

  const { data: journeyHabits = [], isLoading } = useQuery({
    queryKey: ["user-journey-habits", user?.id, journeyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_journey_habits")
        .select("*")
        .eq("journey_id", journeyId!)
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as UserJourneyHabit[];
    },
    enabled: !!user && !!journeyId,
    staleTime: 60 * 1000,
  });

  return { journeyHabits, loading: isLoading };
};

/**
 * Get ALL active journey habits across every active journey (single query).
 * Used by Dashboard to support multi-journey display.
 */
export const useAllActiveJourneyHabits = () => {
  const { user } = useAuth();
  const { activeStates } = useActiveJourneys();

  const activeJourneyIds = useMemo(
    () => activeStates.map((s) => s.journey_id),
    [activeStates]
  );

  const { data: allJourneyHabits = [], isLoading } = useQuery({
    queryKey: ["user-journey-habits-all", user?.id, activeJourneyIds],
    queryFn: async () => {
      if (activeJourneyIds.length === 0) return [];
      const { data, error } = await supabase
        .from("user_journey_habits")
        .select("*")
        .in("journey_id", activeJourneyIds)
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as UserJourneyHabit[];
    },
    enabled: !!user && activeJourneyIds.length > 0,
    staleTime: 60 * 1000,
  });

  return { allJourneyHabits, activeStates, loading: isLoading };
};

/**
 * Fire-and-forget journey notification via Edge Function
 */
const sendJourneyNotification = async (payload: {
  type: string;
  userId: string;
  journeyTitle?: string;
  currentDay?: number;
  habitName?: string;
  phaseName?: string;
  badgeName?: string;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.functions.invoke("send-journey-notification", {
      body: payload,
    });
  } catch {
    // Notifications are best-effort — never block the main flow
  }
};

/**
 * All journey actions (mutations)
 */
export const useJourneyActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.refetchQueries({ queryKey: ["user-journey-states-active"] });
    queryClient.invalidateQueries({ queryKey: ["user-journey-states"] });
    queryClient.invalidateQueries({ queryKey: ["user-journey-state"] });
    queryClient.invalidateQueries({ queryKey: ["user-journey-habits"] });
    queryClient.invalidateQueries({ queryKey: ["user-journey-habits-all"] });
    queryClient.invalidateQueries({ queryKey: ["user-journey-day-completions"] });
    queryClient.invalidateQueries({ queryKey: ["habits", user?.id] });
  }, [queryClient, user?.id]);

  /**
   * Start a journey: create state + create Day 1 habits
   */
  const startJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      if (!user) throw new Error("Not authenticated");

      // 0. Clean up previous journey state if restarting (abandoned/completed)
      const { data: existingState } = await supabase
        .from("user_journey_state")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("journey_id", journeyId)
        .maybeSingle();

      if (existingState) {
        if (existingState.status === "active") {
          throw new Error("Journey already active");
        }
        await supabase
          .from("user_journey_state")
          .delete()
          .eq("id", existingState.id);
      }

      // 0b. Deactivate old journey habit links for this journey
      await supabase
        .from("user_journey_habits")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("journey_id", journeyId);

      // 1. Create user_journey_state
      const { error: stateErr } = await supabase
        .from("user_journey_state")
        .insert({
          user_id: user.id,
          journey_id: journeyId,
          status: "active",
          current_day: 1,
          current_phase: 1,
          days_completed: 0,
          completion_percent: 0,
        });
      if (stateErr) throw stateErr;

      // 2. Get Day 1 habit templates
      const { data: templates, error: tErr } = await supabase
        .from("journey_habit_templates")
        .select("*")
        .eq("journey_id", journeyId)
        .lte("start_day", 1);
      if (tErr) throw tErr;

      // 3. Get existing journey habits for dedup (across ALL active journeys)
      const { data: rawExistingHabits } = await supabase
        .from("user_journey_habits")
        .select("canonical_key, habit_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .not("canonical_key", "is", null);

      // 3b. Verify linked habits still exist (clean up orphans)
      let validExistingHabits = rawExistingHabits || [];
      if (validExistingHabits.length > 0) {
        const habitIds = validExistingHabits.map((h: { habit_id: string }) => h.habit_id);
        const { data: livingHabits } = await supabase
          .from("habits")
          .select("id")
          .in("id", habitIds)
          .eq("is_active", true);
        const livingIds = new Set((livingHabits || []).map((h: { id: string }) => h.id));

        // Mark orphans inactive
        const orphanIds = habitIds.filter((id: string) => !livingIds.has(id));
        if (orphanIds.length > 0) {
          await supabase
            .from("user_journey_habits")
            .update({ is_active: false })
            .eq("user_id", user.id)
            .in("habit_id", orphanIds);
        }

        validExistingHabits = validExistingHabits.filter((h: { habit_id: string }) => livingIds.has(h.habit_id));
      }

      const existingCanonicalKeys = new Set(
        validExistingHabits.map((h: { canonical_key: string | null }) => h.canonical_key)
      );

      // 4. Separate templates into reusable (dedup) vs new
      const reusableLinks: Array<Record<string, unknown>> = [];
      const newHabitInserts: Array<Record<string, unknown>> = [];
      const newHabitTemplateMap: Array<{ template: typeof templates[0]; insertIndex: number }> = [];

      const periodToReminder: Record<string, string> = {
        morning: "08:00",
        afternoon: "14:00",
        evening: "20:00",
      };

      for (const template of templates || []) {
        // Check canonical_key dedup
        if (template.canonical_key && existingCanonicalKeys.has(template.canonical_key)) {
          const existing = validExistingHabits.find(
            (h: { canonical_key: string | null }) => h.canonical_key === template.canonical_key
          );
          if (existing) {
            reusableLinks.push({
              user_id: user.id,
              journey_id: journeyId,
              habit_id: existing.habit_id,
              journey_habit_template_id: template.id,
              canonical_key: template.canonical_key,
              introduced_on_day: template.start_day,
              expires_on_day: template.end_day,
              current_goal_value: template.initial_goal_value,
              is_active: true,
            });
            continue;
          }
        }

        // Build batch insert for new habit
        const isOneTime = template.frequency_type === "one_time";
        const resolvedIcon = (template.canonical_key && CANONICAL_TO_ICON[template.canonical_key]) || null;
        const habitInsert: Record<string, unknown> = {
          user_id: user.id,
          name: template.name,
          emoji: template.emoji || "📋",
          icon_key: resolvedIcon,
          category: template.category,
          period: template.period,
          days_of_week: template.days_of_week,
          streak: 0,
          is_active: true,
          source: "journey",
          template_id: template.id,
          frequency_type: isOneTime ? "once" : template.frequency_type === "daily" ? "daily" : "fixed_days",
          unit: template.unit === "none" ? null : template.unit === "minutes" ? "minutes" : "custom",
          goal_value: template.initial_goal_value,
          reminder_time: periodToReminder[template.period] || "08:00",
          notification_pref: { reminder_enabled: true, reminder_time: periodToReminder[template.period] || "08:00" },
        };
        if (isOneTime) {
          habitInsert.due_date = new Date().toISOString().split("T")[0];
        }
        newHabitTemplateMap.push({ template, insertIndex: newHabitInserts.length });
        newHabitInserts.push(habitInsert);
      }

      // Batch insert all reusable links in 1 request
      if (reusableLinks.length > 0) {
        await supabase.from("user_journey_habits").insert(reusableLinks);
      }

      // Batch insert all new habits in 1 request
      const createdHabits: Array<{ habitId: string; templateId: string }> = [];
      if (newHabitInserts.length > 0) {
        const { data: newHabits, error: hErr } = await supabase
          .from("habits")
          .insert(newHabitInserts)
          .select("id");
        if (hErr) throw hErr;

        // Batch insert all journey habit links in 1 request
        const newLinks = (newHabits || []).map((habit: { id: string }, idx: number) => {
          const { template } = newHabitTemplateMap[idx];
          createdHabits.push({ habitId: habit.id, templateId: template.id });
          return {
            user_id: user.id,
            journey_id: journeyId,
            habit_id: habit.id,
            journey_habit_template_id: template.id,
            canonical_key: template.canonical_key,
            introduced_on_day: template.start_day,
            expires_on_day: template.end_day,
            current_goal_value: template.initial_goal_value,
            is_active: true,
          };
        });
        if (newLinks.length > 0) {
          await supabase.from("user_journey_habits").insert(newLinks);
        }
      }

      return { journeyId, createdHabits };
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  /**
   * Complete a day — called when all habits for the day are done
   */
  const completeDayMutation = useMutation({
    mutationFn: async ({
      journeyId,
    }: {
      journeyId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Call RPC to advance to next day
      const { data, error } = await supabase.rpc("advance_journey_to_next_day", {
        p_user_id: user.id,
        p_journey_id: journeyId,
      });

      if (error) throw error;

      const result = data as {
        next_day: number;
        new_habits: Array<{
          id: string;
          name: string;
          emoji: string;
          category: string;
          period: string;
          tracking_type: string;
          unit: string;
          initial_goal_value: number | null;
          frequency_type: string;
          days_of_week: number[];
          canonical_key: string | null;
        }>;
        phase_completed: boolean;
        phase_badge_name: string | null;
        journey_completed: boolean;
        days_completed: number;
        completion_percent: number;
      };

      // Create new habits returned by the RPC
      if (result.new_habits.length > 0) {
        // Check existing canonical keys for dedup
        const { data: rawCompleteHabits } = await supabase
          .from("user_journey_habits")
          .select("canonical_key, habit_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .not("canonical_key", "is", null);

        // Verify linked habits still exist (clean up orphans)
        let validCompleteHabits = rawCompleteHabits || [];
        if (validCompleteHabits.length > 0) {
          const cHabitIds = validCompleteHabits.map((h: { habit_id: string }) => h.habit_id);
          const { data: cLiving } = await supabase
            .from("habits")
            .select("id")
            .in("id", cHabitIds)
            .eq("is_active", true);
          const cLivingIds = new Set((cLiving || []).map((h: { id: string }) => h.id));

          const cOrphanIds = cHabitIds.filter((id: string) => !cLivingIds.has(id));
          if (cOrphanIds.length > 0) {
            await supabase
              .from("user_journey_habits")
              .update({ is_active: false })
              .eq("user_id", user.id)
              .in("habit_id", cOrphanIds);
          }
          validCompleteHabits = validCompleteHabits.filter((h: { habit_id: string }) => cLivingIds.has(h.habit_id));
        }

        const existingCanonicalKeys = new Set(
          validCompleteHabits.map((h: { canonical_key: string | null }) => h.canonical_key)
        );

        // Separate into reusable (dedup) vs new
        const cdReusableLinks: Array<Record<string, unknown>> = [];
        const cdNewInserts: Array<Record<string, unknown>> = [];
        const cdTemplateMap: Array<typeof result.new_habits[0]> = [];

        for (const template of result.new_habits) {
          if (template.canonical_key && existingCanonicalKeys.has(template.canonical_key)) {
            const existing = validCompleteHabits.find(
              (h: { canonical_key: string | null }) => h.canonical_key === template.canonical_key
            );
            if (existing) {
              cdReusableLinks.push({
                user_id: user.id,
                journey_id: journeyId,
                habit_id: existing.habit_id,
                journey_habit_template_id: template.id,
                canonical_key: template.canonical_key,
                introduced_on_day: result.next_day,
                current_goal_value: template.initial_goal_value,
                is_active: true,
              });
              continue;
            }
          }

          const isOneTimeHabit = template.frequency_type === "one_time";
          const resolvedNewIcon = (template.canonical_key && CANONICAL_TO_ICON[template.canonical_key]) || null;
          const newHabitInsert: Record<string, unknown> = {
            user_id: user.id,
            name: template.name,
            emoji: template.emoji || "📋",
            icon_key: resolvedNewIcon,
            category: template.category,
            period: template.period,
            days_of_week: template.days_of_week,
            streak: 0,
            is_active: true,
            source: "journey",
            template_id: template.id,
            frequency_type: isOneTimeHabit ? "once" : template.frequency_type === "daily" ? "daily" : "fixed_days",
            unit: template.unit === "none" ? null : template.unit === "minutes" ? "minutes" : "custom",
            goal_value: template.initial_goal_value,
          };
          if (isOneTimeHabit) {
            newHabitInsert.due_date = new Date().toISOString().split("T")[0];
          }
          cdTemplateMap.push(template);
          cdNewInserts.push(newHabitInsert);
        }

        // Batch insert reusable links
        if (cdReusableLinks.length > 0) {
          await supabase.from("user_journey_habits").insert(cdReusableLinks);
        }

        // Batch insert new habits + their links
        if (cdNewInserts.length > 0) {
          const { data: cdNewHabits, error: hErr } = await supabase
            .from("habits")
            .insert(cdNewInserts)
            .select("id");

          if (!hErr && cdNewHabits) {
            const cdNewLinks = cdNewHabits.map((habit: { id: string }, idx: number) => ({
              user_id: user.id,
              journey_id: journeyId,
              habit_id: habit.id,
              journey_habit_template_id: cdTemplateMap[idx].id,
              canonical_key: cdTemplateMap[idx].canonical_key,
              introduced_on_day: result.next_day,
              current_goal_value: cdTemplateMap[idx].initial_goal_value,
              is_active: true,
            }));
            if (cdNewLinks.length > 0) {
              await supabase.from("user_journey_habits").insert(cdNewLinks);
            }
          }
        }
      }

      // Archive expired habits
      const { data: expiredHabits } = await supabase
        .from("user_journey_habits")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("journey_id", journeyId)
        .eq("is_active", true)
        .not("expires_on_day", "is", null)
        .lt("expires_on_day", result.next_day);

      if (expiredHabits && expiredHabits.length > 0) {
        const expiredIds = expiredHabits.map((h: { habit_id: string }) => h.habit_id);
        await supabase
          .from("habits")
          .update({ is_active: false })
          .in("id", expiredIds);
        await supabase
          .from("user_journey_habits")
          .update({ is_active: false })
          .eq("user_id", user.id)
          .eq("journey_id", journeyId)
          .in("habit_id", expiredIds);
      }

      // Fire notifications (best-effort, non-blocking)
      const { data: journeyInfo } = await supabase
        .from("journeys")
        .select("title")
        .eq("id", journeyId)
        .single();
      const jTitle = journeyInfo?.title || "";

      if (result.phase_completed && result.phase_badge_name) {
        sendJourneyNotification({
          type: "phase_complete",
          userId: user.id,
          journeyTitle: jTitle,
          currentDay: result.next_day - 1,
          badgeName: result.phase_badge_name,
        });
      }
      if (result.new_habits.length > 0) {
        sendJourneyNotification({
          type: "new_habit",
          userId: user.id,
          journeyTitle: jTitle,
          habitName: result.new_habits[0].name,
        });
      }
      if (result.next_day >= 10 && result.next_day <= 14 && !result.journey_completed) {
        sendJourneyNotification({
          type: "cliff_support",
          userId: user.id,
          journeyTitle: jTitle,
          currentDay: result.next_day,
        });
      }

      return result;
    },
    onSuccess: (result, { journeyId }) => {
      // Optimistic update: atualiza cache imediatamente para feedback visual
      if (result) {
        queryClient.setQueryData(
          ["user-journey-states-active", user?.id],
          (old: Array<UserJourneyState & { journeys: Journey }> | undefined) => {
            if (!old) return old;
            return old.map((s) =>
              s.journey_id === journeyId
                ? {
                    ...s,
                    current_day: result.journey_completed ? s.current_day : result.next_day,
                    days_completed: result.days_completed,
                    completion_percent: result.completion_percent,
                    status: result.journey_completed ? ("completed" as const) : s.status,
                  }
                : s
            );
          }
        );
      }
      invalidateAll();
    },
  });

  /**
   * Pause a journey
   */
  const pauseJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_journey_state")
        .update({ status: "paused", paused_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("journey_id", journeyId);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(),
  });

  /**
   * Resume a paused journey
   */
  const resumeJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_journey_state")
        .update({ status: "active", paused_at: null, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("journey_id", journeyId)
        .eq("status", "paused"); // Guard: only resume paused journeys, never revert completed
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(),
  });

  /**
   * Abandon a journey
   */
  const abandonJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_journey_state")
        .update({ status: "abandoned", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("journey_id", journeyId);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(),
  });

  /**
   * Graduation: keep selected habits, archive the rest
   */
  const keepHabitsMutation = useMutation({
    mutationFn: async ({
      journeyId,
      habitIdsToKeep,
    }: {
      journeyId: string;
      habitIdsToKeep: string[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Get all habits from this journey
      const { data: allJourneyHabits } = await supabase
        .from("user_journey_habits")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("journey_id", journeyId)
        .eq("is_active", true);

      const allIds = (allJourneyHabits || []).map((h: { habit_id: string }) => h.habit_id);
      const toArchive = allIds.filter((id: string) => !habitIdsToKeep.includes(id));

      // Archive non-kept habits
      if (toArchive.length > 0) {
        await supabase
          .from("habits")
          .update({ is_active: false })
          .in("id", toArchive);
      }

      // Convert kept habits to personal
      if (habitIdsToKeep.length > 0) {
        await supabase
          .from("habits")
          .update({ source: "personal" })
          .in("id", habitIdsToKeep);
      }

      // Deactivate all journey habit links
      await supabase
        .from("user_journey_habits")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("journey_id", journeyId);
    },
    onSuccess: () => invalidateAll(),
  });

  /**
   * Adopt a single journey habit into the user's personal routine
   * Reuses the same pattern as keepHabitsMutation but for one habit at a time
   */
  const adoptHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("habits")
        .update({ source: "personal" })
        .eq("id", habitId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAll(),
  });

  return {
    startJourney: (journeyId: string) => startJourneyMutation.mutateAsync(journeyId),
    completeDay: (journeyId: string) => completeDayMutation.mutateAsync({ journeyId }),
    pauseJourney: (journeyId: string) => pauseJourneyMutation.mutateAsync(journeyId),
    resumeJourney: (journeyId: string) => resumeJourneyMutation.mutateAsync(journeyId),
    abandonJourney: (journeyId: string) => abandonJourneyMutation.mutateAsync(journeyId),
    keepHabits: (journeyId: string, habitIdsToKeep: string[]) =>
      keepHabitsMutation.mutateAsync({ journeyId, habitIdsToKeep }),
    adoptHabit: (habitId: string) => adoptHabitMutation.mutateAsync(habitId),
    isStarting: startJourneyMutation.isPending,
    isCompleting: completeDayMutation.isPending,
  };
};
