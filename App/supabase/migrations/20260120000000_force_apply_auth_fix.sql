-- =====================================================
-- FORCE APPLY: Auth Fix (In case 20260118000000 didn't apply)
-- =====================================================
-- This migration forcefully creates the missing functions and policies
-- even if the previous migration shows as "applied" but didn't actually execute

-- =====================================================
-- STEP 1: Create missing current_user_is_admin() function (IDEMPOTENT)
-- =====================================================
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
'Returns true if current user has admin privileges. Used in RLS policies. (Force applied 2026-01-20)';

-- =====================================================
-- STEP 2: Create get_user_id_by_email() RPC function (IDEMPOTENT)
-- =====================================================
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
'Returns user_id from auth.users by email. Used by stripe-webhook. (Force applied 2026-01-20)';

-- =====================================================
-- STEP 3: Fix user_cohorts - Add INSERT policy (IDEMPOTENT)
-- =====================================================
DROP POLICY IF EXISTS "System can insert cohorts" ON public.user_cohorts;
CREATE POLICY "System can insert cohorts"
  ON public.user_cohorts FOR INSERT
  WITH CHECK (true);  -- Controlled by SECURITY DEFINER triggers

COMMENT ON POLICY "System can insert cohorts" ON public.user_cohorts IS
'Allows triggers (auto_assign_cohort) to insert cohort records during user creation. (Force applied 2026-01-20)';

-- =====================================================
-- STEP 4: Add INSERT policies for sessions/events (IDEMPOTENT)
-- =====================================================
DROP POLICY IF EXISTS "System can insert sessions" ON public.sessions;
CREATE POLICY "System can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

COMMENT ON POLICY "System can insert sessions" ON public.sessions IS
'Allows users to insert their own sessions. NULL check allows system inserts. (Force applied 2026-01-20)';

DROP POLICY IF EXISTS "System can insert events" ON public.events;
CREATE POLICY "System can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

COMMENT ON POLICY "System can insert events" ON public.events IS
'Allows users to insert their own events. NULL check allows system inserts. (Force applied 2026-01-20)';

-- =====================================================
-- VERIFICATION: Log success
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Auth fix forcefully applied. Functions and policies created.';
END
$$;
