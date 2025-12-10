-- =====================================================
-- Advanced Analytics System Migration
-- =====================================================
-- Description: Complete analytics infrastructure with:
-- - Sessions & Events tracking
-- - User cohorts for retention analysis
-- - 12+ analytics views (DAU/MAU/WAU, retention, streaks, etc)
-- - Auto-cohort assignment trigger
-- - RLS policies for admin-only access
-- =====================================================

-- =====================================================
-- 1. TABLES
-- =====================================================

-- 1.1 Sessions Table
-- Tracks user session start/end times and duration
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  device_type text,
  platform text,
  app_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.sessions (user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions (session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_started ON public.sessions (user_id, started_at DESC);

-- RLS Policies for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.sessions;
CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
CREATE POLICY "Admins can view all sessions"
  ON public.sessions FOR SELECT
  USING (public.current_user_is_admin());

-- 1.2 Events Table
-- Tracks granular user events (habit_created, habit_completed, etc)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  event_properties jsonb DEFAULT '{}'::jsonb,
  screen text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  event_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.events (user_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_name_date ON public.events (event_name, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON public.events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.events (session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_properties ON public.events USING GIN (event_properties);

-- RLS Policies for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own events" ON public.events;
CREATE POLICY "Users can insert own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT
  USING (public.current_user_is_admin());

-- 1.3 User Cohorts Table
-- Tracks user cohort assignments for retention analysis
CREATE TABLE IF NOT EXISTS public.user_cohorts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  signup_cohort_week date NOT NULL,
  signup_cohort_month date NOT NULL,
  first_habit_date date,
  first_completion_date date,
  first_3day_streak_date date,
  first_7day_streak_date date,
  first_purchase_date date,
  acquisition_source text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for user_cohorts
CREATE INDEX IF NOT EXISTS idx_user_cohorts_week ON public.user_cohorts (signup_cohort_week);
CREATE INDEX IF NOT EXISTS idx_user_cohorts_month ON public.user_cohorts (signup_cohort_month);
CREATE INDEX IF NOT EXISTS idx_user_cohorts_source ON public.user_cohorts (acquisition_source);

-- RLS Policies for user_cohorts
ALTER TABLE public.user_cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all cohorts" ON public.user_cohorts;
CREATE POLICY "Admins can view all cohorts"
  ON public.user_cohorts FOR SELECT
  USING (public.current_user_is_admin());

-- 1.4 Add completed_at_time to habit_completions (for time-of-day analysis)
ALTER TABLE public.habit_completions
  ADD COLUMN IF NOT EXISTS completed_at_time time;

-- =====================================================
-- 2. ANALYTICS VIEWS
-- =====================================================

-- 2.1 North Star Metric View
-- "Weekly Active Users with ≥1 Completed Habit"
DROP VIEW IF EXISTS public.admin_north_star_metric;
CREATE OR REPLACE VIEW public.admin_north_star_metric AS
SELECT
  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= date_trunc('week', CURRENT_DATE)
      AND hc.completed_at < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
    THEN hc.user_id
  END) AS weekly_active_users_with_completion,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days'
      AND hc.completed_at < date_trunc('week', CURRENT_DATE)
    THEN hc.user_id
  END) AS last_week_active_users,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '6 days'
      AND hc.completed_at <= CURRENT_DATE
    THEN hc.user_id
  END) AS rolling_7d_active_users,

  ROUND(
    (COUNT(DISTINCT CASE WHEN hc.completed_at >= date_trunc('week', CURRENT_DATE) THEN hc.user_id END)::numeric -
     COUNT(DISTINCT CASE WHEN hc.completed_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days' AND hc.completed_at < date_trunc('week', CURRENT_DATE) THEN hc.user_id END)::numeric) /
    NULLIF(COUNT(DISTINCT CASE WHEN hc.completed_at >= date_trunc('week', CURRENT_DATE) - INTERVAL '7 days' AND hc.completed_at < date_trunc('week', CURRENT_DATE) THEN hc.user_id END), 0) * 100,
    2
  ) AS week_over_week_change_percent
FROM habit_completions hc;

-- 2.2 DAU/MAU/WAU View
-- Stickiness ratio and active user counts
DROP VIEW IF EXISTS public.admin_dau_mau_wau;
CREATE OR REPLACE VIEW public.admin_dau_mau_wau AS
SELECT
  COUNT(DISTINCT CASE
    WHEN hc.completed_at = CURRENT_DATE THEN hc.user_id
  END) AS dau,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '6 days'
      AND hc.completed_at <= CURRENT_DATE
    THEN hc.user_id
  END) AS wau,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '29 days'
      AND hc.completed_at <= CURRENT_DATE
    THEN hc.user_id
  END) AS mau,

  ROUND(
    COUNT(DISTINCT CASE WHEN hc.completed_at = CURRENT_DATE THEN hc.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT CASE WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '29 days' THEN hc.user_id END), 0) * 100,
    2
  ) AS stickiness_percent,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at = CURRENT_DATE - INTERVAL '1 day' THEN hc.user_id
  END) AS dau_yesterday,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '13 days'
      AND hc.completed_at <= CURRENT_DATE - INTERVAL '7 days'
    THEN hc.user_id
  END) AS wau_last_week,

  COUNT(DISTINCT CASE
    WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '59 days'
      AND hc.completed_at <= CURRENT_DATE - INTERVAL '30 days'
    THEN hc.user_id
  END) AS mau_last_month
FROM habit_completions hc;

-- 2.3 DAU Trend (30 days)
DROP VIEW IF EXISTS public.admin_dau_trend_30d;
CREATE OR REPLACE VIEW public.admin_dau_trend_30d AS
SELECT
  hc.completed_at AS date,
  COUNT(DISTINCT hc.user_id) AS dau
FROM habit_completions hc
WHERE hc.completed_at >= CURRENT_DATE - INTERVAL '29 days'
  AND hc.completed_at <= CURRENT_DATE
GROUP BY hc.completed_at
ORDER BY hc.completed_at ASC;

-- 2.4 Cohort Retention Analysis
-- D1, D7, D30 retention by signup week
DROP VIEW IF EXISTS public.admin_cohort_retention;
CREATE OR REPLACE VIEW public.admin_cohort_retention AS
SELECT
  uc.signup_cohort_week AS cohort_week,
  COUNT(DISTINCT uc.user_id) AS cohort_size,

  COUNT(DISTINCT CASE
    WHEN uc.first_completion_date IS NOT NULL
      AND uc.first_completion_date <= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '1 day'
    THEN uc.user_id
  END) AS day_1_retained,

  ROUND(
    COUNT(DISTINCT CASE WHEN uc.first_completion_date IS NOT NULL AND uc.first_completion_date <= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '1 day' THEN uc.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT uc.user_id), 0) * 100,
    2
  ) AS day_1_retention_percent,

  COUNT(DISTINCT CASE
    WHEN EXISTS (
      SELECT 1 FROM habit_completions hc
      WHERE hc.user_id = uc.user_id
        AND hc.completed_at >= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '7 days'
        AND hc.completed_at <= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '13 days'
    )
    THEN uc.user_id
  END) AS day_7_retained,

  ROUND(
    COUNT(DISTINCT CASE WHEN EXISTS (SELECT 1 FROM habit_completions hc WHERE hc.user_id = uc.user_id AND hc.completed_at BETWEEN (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '7 days' AND (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '13 days') THEN uc.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT uc.user_id), 0) * 100,
    2
  ) AS day_7_retention_percent,

  COUNT(DISTINCT CASE
    WHEN EXISTS (
      SELECT 1 FROM habit_completions hc
      WHERE hc.user_id = uc.user_id
        AND hc.completed_at >= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '30 days'
        AND hc.completed_at <= (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '36 days'
    )
    THEN uc.user_id
  END) AS day_30_retained,

  ROUND(
    COUNT(DISTINCT CASE WHEN EXISTS (SELECT 1 FROM habit_completions hc WHERE hc.user_id = uc.user_id AND hc.completed_at BETWEEN (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '30 days' AND (SELECT created_at::date FROM profiles WHERE user_id = uc.user_id) + INTERVAL '36 days') THEN uc.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT uc.user_id), 0) * 100,
    2
  ) AS day_30_retention_percent
FROM user_cohorts uc
WHERE uc.signup_cohort_week >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY uc.signup_cohort_week
ORDER BY uc.signup_cohort_week DESC;

-- 2.5 Streak Distribution
-- Breakdown of users by streak length
DROP VIEW IF EXISTS public.admin_streak_distribution;
CREATE OR REPLACE VIEW public.admin_streak_distribution AS
SELECT
  COUNT(CASE WHEN up.current_streak = 0 THEN 1 END) AS no_streak,
  COUNT(CASE WHEN up.current_streak BETWEEN 1 AND 6 THEN 1 END) AS streak_1_6,
  COUNT(CASE WHEN up.current_streak BETWEEN 7 AND 29 THEN 1 END) AS streak_7_29,
  COUNT(CASE WHEN up.current_streak BETWEEN 30 AND 99 THEN 1 END) AS streak_30_99,
  COUNT(CASE WHEN up.current_streak >= 100 THEN 1 END) AS streak_100_plus,

  ROUND(
    COUNT(CASE WHEN up.current_streak >= 7 THEN 1 END)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS percent_with_7plus_streak,

  ROUND(AVG(up.current_streak), 2) AS avg_streak,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY up.current_streak) AS median_streak
FROM user_progress up
WHERE up.last_activity_date >= CURRENT_DATE - INTERVAL '1 day';

-- 2.6 Completion Rates (30 days)
-- Daily completion rate percentages
DROP VIEW IF EXISTS public.admin_completion_rates_30d;
CREATE OR REPLACE VIEW public.admin_completion_rates_30d AS
WITH daily_scheduled AS (
  SELECT
    d.date,
    COUNT(DISTINCT h.id) AS total_scheduled_habits
  FROM generate_series(
    CURRENT_DATE - INTERVAL '29 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS d(date)
  CROSS JOIN habits h
  WHERE h.is_active = true
    AND h.created_at::date <= d.date
  GROUP BY d.date
),
daily_completions AS (
  SELECT
    hc.completed_at AS date,
    COUNT(hc.id) AS total_completions
  FROM habit_completions hc
  WHERE hc.completed_at >= CURRENT_DATE - INTERVAL '29 days'
    AND hc.completed_at <= CURRENT_DATE
  GROUP BY hc.completed_at
)
SELECT
  ds.date,
  ds.total_scheduled_habits,
  COALESCE(dc.total_completions, 0) AS total_completions,
  ROUND(
    COALESCE(dc.total_completions, 0)::numeric / NULLIF(ds.total_scheduled_habits, 0) * 100,
    2
  ) AS completion_rate_percent
FROM daily_scheduled ds
LEFT JOIN daily_completions dc ON ds.date = dc.date
ORDER BY ds.date ASC;

-- 2.7 Completion by Category
DROP VIEW IF EXISTS public.admin_completion_by_category;
CREATE OR REPLACE VIEW public.admin_completion_by_category AS
SELECT
  h.category,
  COUNT(hc.id) AS total_completions,
  COUNT(DISTINCT hc.user_id) AS unique_users,
  ROUND(
    COUNT(CASE WHEN hc.completed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) AS completion_rate_7d_percent
FROM habits h
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
WHERE h.is_active = true
  AND hc.completed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY h.category
ORDER BY total_completions DESC;

-- 2.8 Completion by Time of Day
DROP VIEW IF EXISTS public.admin_completion_by_time_of_day;
CREATE OR REPLACE VIEW public.admin_completion_by_time_of_day AS
SELECT
  EXTRACT(HOUR FROM hc.completed_at_time) AS hour,
  COUNT(hc.id) AS total_completions
FROM habit_completions hc
WHERE hc.completed_at >= CURRENT_DATE - INTERVAL '30 days'
  AND hc.completed_at_time IS NOT NULL
GROUP BY EXTRACT(HOUR FROM hc.completed_at_time)
ORDER BY hour;

-- 2.9 Session Metrics
DROP VIEW IF EXISTS public.admin_session_metrics;
CREATE OR REPLACE VIEW public.admin_session_metrics AS
SELECT
  COUNT(s.id) AS total_sessions,
  COUNT(DISTINCT s.user_id) AS unique_users,
  ROUND(AVG(s.duration_seconds), 2) AS avg_session_duration_seconds,
  ROUND(AVG(s.duration_seconds) / 60, 2) AS avg_session_duration_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.duration_seconds) AS median_session_duration_seconds,
  MAX(s.duration_seconds) AS max_session_duration_seconds,

  ROUND(COUNT(s.id)::numeric / NULLIF(COUNT(DISTINCT s.user_id), 0), 2) AS avg_sessions_per_user,

  COUNT(CASE WHEN s.device_type = 'mobile' THEN 1 END) AS mobile_sessions,
  COUNT(CASE WHEN s.device_type = 'desktop' THEN 1 END) AS desktop_sessions,
  COUNT(CASE WHEN s.device_type = 'tablet' THEN 1 END) AS tablet_sessions
FROM sessions s
WHERE s.session_date >= CURRENT_DATE - INTERVAL '30 days'
  AND s.ended_at IS NOT NULL;

-- 2.10 Update existing admin_user_stats view
-- Add perfect_days_total and avg_perfect_days_per_user
DROP VIEW IF EXISTS public.admin_user_stats;
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
  COUNT(DISTINCT p.user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN p.is_premium THEN p.user_id END) AS premium_users,
  COUNT(DISTINCT CASE WHEN p.is_admin THEN p.user_id END) AS admin_users,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE THEN p.user_id END) AS active_today,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '6 days' THEN p.user_id END) AS active_7d,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '29 days' THEN p.user_id END) AS active_30d,
  ROUND(AVG(up.current_streak) FILTER (WHERE up.current_streak > 0), 2) AS avg_streak,
  MAX(up.longest_streak) AS max_streak,

  SUM(up.perfect_days) AS perfect_days_total,
  ROUND(AVG(up.perfect_days), 2) AS avg_perfect_days_per_user
FROM profiles p
LEFT JOIN user_progress up ON p.user_id = up.user_id;

-- =====================================================
-- 3. FUNCTIONS
-- =====================================================

-- 3.1 Assign User to Cohort Function
CREATE OR REPLACE FUNCTION public.assign_user_to_cohort(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_signup_date date;
  v_first_habit_date date;
  v_first_completion_date date;
BEGIN
  -- Get user signup date
  SELECT created_at::date INTO v_signup_date
  FROM profiles
  WHERE user_id = p_user_id;

  -- Get first habit creation date
  SELECT MIN(created_at::date) INTO v_first_habit_date
  FROM habits
  WHERE user_id = p_user_id;

  -- Get first completion date
  SELECT MIN(completed_at) INTO v_first_completion_date
  FROM habit_completions
  WHERE user_id = p_user_id;

  -- Insert or update cohort assignment
  INSERT INTO user_cohorts (
    user_id,
    signup_cohort_week,
    signup_cohort_month,
    first_habit_date,
    first_completion_date
  ) VALUES (
    p_user_id,
    date_trunc('week', v_signup_date)::date,
    date_trunc('month', v_signup_date)::date,
    v_first_habit_date,
    v_first_completion_date
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_habit_date = COALESCE(EXCLUDED.first_habit_date, user_cohorts.first_habit_date),
    first_completion_date = COALESCE(EXCLUDED.first_completion_date, user_cohorts.first_completion_date);
END;
$$;

-- 3.2 Auto-assign Cohort Trigger Function
CREATE OR REPLACE FUNCTION public.auto_assign_cohort()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.assign_user_to_cohort(NEW.user_id);
  RETURN NEW;
END;
$$;

-- 3.3 Create Trigger for Auto-Cohort Assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_cohort ON public.profiles;
CREATE TRIGGER trigger_auto_assign_cohort
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_cohort();

-- =====================================================
-- 4. BACKFILL EXISTING USERS TO COHORTS
-- =====================================================
-- This will assign all existing users to cohorts
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT user_id FROM profiles WHERE user_id NOT IN (SELECT user_id FROM user_cohorts)
  LOOP
    PERFORM public.assign_user_to_cohort(user_record.user_id);
  END LOOP;
END $$;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Summary:
-- - 3 new tables: sessions, events, user_cohorts
-- - 1 new column: habit_completions.completed_at_time
-- - 10 analytics views created/updated
-- - 2 functions: assign_user_to_cohort, auto_assign_cohort
-- - 1 trigger: auto_assign_cohort on profiles INSERT
-- - All existing users backfilled into cohorts
-- =====================================================
