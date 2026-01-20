-- =====================================================
-- FIX: Critical Auth Blockers - User Creation Failure
-- =====================================================
-- Problem: Stripe webhook failing with "Database error creating new user"
-- Root cause: Missing functions + RLS policies blocking INSERT
-- Date: 2026-01-18
-- Affected: lucaskeidson09@gmail.com (and all future Stripe customers)

-- =====================================================
-- STEP 1: Create missing current_user_is_admin() function
-- =====================================================
-- This function is used by RLS policies but was never created
-- Used in: 20251212000000_advanced_analytics.sql:53,86,115
--          20260114000000_communication_workflow.sql:60

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  );
$$;

COMMENT ON FUNCTION public.current_user_is_admin IS
'Returns true if current user has admin privileges. Used in RLS policies.';

-- =====================================================
-- STEP 2: Fix user_cohorts - Add INSERT policy
-- =====================================================
-- Problem: RLS enabled but no INSERT policy
-- Impact: Trigger auto_assign_cohort() blocked → user creation fails

DROP POLICY IF EXISTS "System can insert cohorts" ON public.user_cohorts;
CREATE POLICY "System can insert cohorts"
  ON public.user_cohorts FOR INSERT
  WITH CHECK (true);  -- Controlled by SECURITY DEFINER triggers

COMMENT ON POLICY "System can insert cohorts" ON public.user_cohorts IS
'Allows triggers (auto_assign_cohort) to insert cohort records during user creation';

-- =====================================================
-- STEP 3: Create get_user_id_by_email() RPC function
-- =====================================================
-- Used by stripe-webhook when user exists but profile is missing
-- Reference: stripe-webhook/index.ts:130

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM auth.users
  WHERE email = lower(p_email)
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_id_by_email IS
'Returns user_id from auth.users by email. Used by stripe-webhook for user lookup.';

-- =====================================================
-- STEP 4: Preventive - Add INSERT policies for sessions/events
-- =====================================================
-- Prevents similar RLS blocking issues in the future

-- Sessions: Users can insert their own sessions
DROP POLICY IF EXISTS "System can insert sessions" ON public.sessions;
CREATE POLICY "System can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

COMMENT ON POLICY "System can insert sessions" ON public.sessions IS
'Allows users to insert their own sessions. NULL check allows system inserts.';

-- Events: Users can insert their own events
DROP POLICY IF EXISTS "System can insert events" ON public.events;
CREATE POLICY "System can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

COMMENT ON POLICY "System can insert events" ON public.events IS
'Allows users to insert their own events. NULL check allows system inserts.';

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries after migration to verify:
--
-- 1. Check functions exist:
-- SELECT proname, prosrc FROM pg_proc
-- WHERE proname IN ('current_user_is_admin', 'get_user_id_by_email');
--
-- 2. Check policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies
-- WHERE tablename IN ('user_cohorts', 'sessions', 'events');
--
-- 3. Test user creation:
-- Use App/supabase/scripts/manual_user_creation_corrected.sql
