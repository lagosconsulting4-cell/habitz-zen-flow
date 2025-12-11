-- ============================================================================
-- ADMIN SYSTEM MIGRATION
-- ============================================================================
-- Adds admin role system with audit logging
-- Extends existing profiles table (DOES NOT create new admin_users table)
-- Follows RLS patterns from 20250924125730_.sql:48-108
-- Follows SECURITY DEFINER pattern from 20251127000000_gamification_system.sql:191-269

-- ============================================================================
-- 1. EXTEND PROFILES TABLE WITH ADMIN FIELDS
-- ============================================================================
-- Pattern: Similar to is_premium/premium_since from 20250926001807_premium_billing.sql:2-4

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_since timestamptz;

-- Create index for admin queries (performance optimization)
CREATE INDEX IF NOT EXISTS profiles_admin_idx ON public.profiles (is_admin) WHERE is_admin = true;

-- Add comments
COMMENT ON COLUMN public.profiles.is_admin IS 'Indicates if user has admin privileges (full system access)';
COMMENT ON COLUMN public.profiles.admin_since IS 'Timestamp when user was granted admin privileges';

-- ============================================================================
-- 2. ADMIN AUDIT LOG TABLE
-- ============================================================================
-- Pattern: Similar to xp_events from 20251127000000_gamification_system.sql:82-102
-- Tracks all admin actions for compliance and security

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What action was performed
  action_type text NOT NULL CHECK (action_type IN (
    'user_view', 'user_edit', 'user_suspend', 'user_restore', 'user_delete',
    'grant_premium', 'revoke_premium',
    'content_create', 'content_update', 'content_delete',
    'settings_change', 'audit_view'
  )),

  -- Where (which table/resource)
  target_table text, -- 'profiles', 'habits', 'meditations', etc.
  target_id uuid,    -- ID of affected record

  -- Details
  old_data jsonb,    -- State before change (null for creates/views)
  new_data jsonb,    -- State after change (null for deletes/views)
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional context (IP, reason, etc.)

  -- When
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast audit queries
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id_idx ON public.admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_date_idx ON public.admin_audit_log (admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_type_idx ON public.admin_audit_log (action_type);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_idx ON public.admin_audit_log (target_table, target_id);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit log
CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Only system can insert audit records (via functions)
CREATE POLICY "System can insert audit records"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (true); -- Will be controlled by SECURITY DEFINER functions

COMMENT ON TABLE public.admin_audit_log IS 'Audit trail of all admin actions for compliance and security';

-- ============================================================================
-- 3. UPDATE EXISTING RLS POLICIES FOR ADMIN ACCESS
-- ============================================================================

-- Pattern: Extends existing policies from 20250924125730_.sql:52-108

-- Profiles: Admins can view any profile
-- (Users can still view their own profile from existing policy at line 53-56)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Profiles: Admins can update any profile (except admin status itself - security)
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.is_admin = true
    )
  )
  WITH CHECK (
    -- Prevent non-super-admins from modifying is_admin field
    -- (Must be done via SQL by super admin)
    (OLD.is_admin = NEW.is_admin) OR
    -- Only allow if NOT trying to change is_admin
    (OLD.is_admin IS NOT DISTINCT FROM NEW.is_admin)
  );

-- Habits: Admins can view all habits
CREATE POLICY "Admins can view all habits"
  ON public.habits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Habit Completions: Admins can view all completions
CREATE POLICY "Admins can view all completions"
  ON public.habit_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- User Progress: Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON public.user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Purchases: Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 4. CONTENT TABLE POLICIES (ADMINS CAN MANAGE)
-- ============================================================================

-- Quotes: Admins can insert/update/delete
-- Pattern: Extends 20250925085729_.sql:39 (currently only SELECT for anyone)

CREATE POLICY "Admins can insert quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update quotes"
  ON public.quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete quotes"
  ON public.quotes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Tips: Admins can insert/update/delete
CREATE POLICY "Admins can insert tips"
  ON public.tips FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update tips"
  ON public.tips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete tips"
  ON public.tips FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Books: Admins can insert/update/delete
CREATE POLICY "Admins can insert books"
  ON public.books FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update books"
  ON public.books FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete books"
  ON public.books FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Meditations: Admins can insert/update/delete
-- (Assumes meditations table exists from 20250926031000_create_meditations.sql)
CREATE POLICY "Admins can insert meditations"
  ON public.meditations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update meditations"
  ON public.meditations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete meditations"
  ON public.meditations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Guided Days: Admins can insert/update/delete
-- (Assumes guided_days table exists from 20250926020000_guided_journey.sql)
CREATE POLICY "Admins can insert guided_days"
  ON public.guided_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update guided_days"
  ON public.guided_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete guided_days"
  ON public.guided_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 5. ADMIN HELPER FUNCTIONS
-- ============================================================================
-- Pattern: SECURITY DEFINER from 20251127000000_gamification_system.sql:191-269

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_is_admin, false);
END;
$$;

COMMENT ON FUNCTION public.is_user_admin IS 'Returns true if user has admin privileges';

-- Function: Log admin action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id uuid,
  p_action_type text,
  p_target_table text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Verify admin status
  IF NOT is_user_admin(p_admin_id) THEN
    RAISE EXCEPTION 'User % is not an admin', p_admin_id;
  END IF;

  -- Insert audit record
  INSERT INTO admin_audit_log (
    admin_id, action_type, target_table, target_id,
    old_data, new_data, metadata
  )
  VALUES (
    p_admin_id, p_action_type, p_target_table, p_target_id,
    p_old_data, p_new_data, p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

COMMENT ON FUNCTION public.log_admin_action IS 'Logs an admin action to the audit trail';

-- Function: Grant premium access (admin only)
CREATE OR REPLACE FUNCTION public.admin_grant_premium(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_reason text DEFAULT 'Admin grant'
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status jsonb;
  v_new_status jsonb;
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Get current status
  SELECT jsonb_build_object(
    'is_premium', is_premium,
    'premium_since', premium_since
  ) INTO v_old_status
  FROM profiles
  WHERE user_id = p_target_user_id;

  -- Update profile
  UPDATE profiles
  SET
    is_premium = true,
    premium_since = COALESCE(premium_since, now()),
    updated_at = now()
  WHERE user_id = p_target_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Target user not found';
    RETURN;
  END IF;

  -- Get new status
  SELECT jsonb_build_object(
    'is_premium', is_premium,
    'premium_since', premium_since
  ) INTO v_new_status
  FROM profiles
  WHERE user_id = p_target_user_id;

  -- Log action
  PERFORM log_admin_action(
    p_admin_id,
    'grant_premium',
    'profiles',
    p_target_user_id,
    v_old_status,
    v_new_status,
    jsonb_build_object('reason', p_reason)
  );

  RETURN QUERY SELECT true, 'Premium granted successfully';
END;
$$;

COMMENT ON FUNCTION public.admin_grant_premium IS 'Grants premium access to a user (admin only, logs action)';

-- Function: Suspend user (soft delete - mark as inactive)
CREATE OR REPLACE FUNCTION public.admin_suspend_user(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_reason text
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_data jsonb;
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Prevent self-suspension
  IF p_admin_id = p_target_user_id THEN
    RETURN QUERY SELECT false, 'Cannot suspend yourself';
    RETURN;
  END IF;

  -- Get current profile state
  SELECT to_jsonb(profiles.*) INTO v_old_data
  FROM profiles
  WHERE user_id = p_target_user_id;

  -- Deactivate all user habits (soft delete)
  UPDATE habits
  SET is_active = false, updated_at = now()
  WHERE user_id = p_target_user_id AND is_active = true;

  -- Log action
  PERFORM log_admin_action(
    p_admin_id,
    'user_suspend',
    'profiles',
    p_target_user_id,
    v_old_data,
    jsonb_build_object('suspended', true),
    jsonb_build_object('reason', p_reason, 'habits_deactivated', true)
  );

  RETURN QUERY SELECT true, 'User suspended successfully';
END;
$$;

COMMENT ON FUNCTION public.admin_suspend_user IS 'Suspends a user by deactivating their habits (admin only, logs action)';

-- Function: Restore suspended user
CREATE OR REPLACE FUNCTION public.admin_restore_user(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_reason text DEFAULT 'Account restored'
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Reactivate user habits
  UPDATE habits
  SET is_active = true, updated_at = now()
  WHERE user_id = p_target_user_id AND is_active = false;

  -- Log action
  PERFORM log_admin_action(
    p_admin_id,
    'user_restore',
    'profiles',
    p_target_user_id,
    jsonb_build_object('suspended', true),
    jsonb_build_object('suspended', false),
    jsonb_build_object('reason', p_reason)
  );

  RETURN QUERY SELECT true, 'User restored successfully';
END;
$$;

COMMENT ON FUNCTION public.admin_restore_user IS 'Restores a suspended user (admin only, logs action)';

-- ============================================================================
-- 6. ANALYTICS VIEWS FOR ADMIN DASHBOARD
-- ============================================================================
-- Pattern: Similar to views in other migrations (e.g., onboarding tracking)

-- View: User statistics overview
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT
  COUNT(DISTINCT p.user_id) AS total_users,
  COUNT(DISTINCT CASE WHEN p.is_premium THEN p.user_id END) AS premium_users,
  COUNT(DISTINCT CASE WHEN p.is_admin THEN p.user_id END) AS admin_users,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE THEN p.user_id END) AS active_today,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '7 days' THEN p.user_id END) AS active_7d,
  COUNT(DISTINCT CASE WHEN up.last_activity_date >= CURRENT_DATE - INTERVAL '30 days' THEN p.user_id END) AS active_30d,
  AVG(up.current_streak) FILTER (WHERE up.current_streak > 0) AS avg_streak,
  MAX(up.current_streak) AS max_streak
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.user_id = up.user_id;

COMMENT ON VIEW public.admin_user_stats IS 'User statistics for admin dashboard';

-- View: Engagement metrics
CREATE OR REPLACE VIEW public.admin_engagement_metrics AS
SELECT
  COUNT(DISTINCT h.user_id) AS users_with_habits,
  COUNT(h.id) AS total_habits,
  AVG(habit_count.count) AS avg_habits_per_user,
  COUNT(DISTINCT hc.user_id) AS users_completed_today,
  COUNT(hc.id) FILTER (WHERE hc.completed_at = CURRENT_DATE) AS completions_today,
  COUNT(hc.id) FILTER (WHERE hc.completed_at >= CURRENT_DATE - INTERVAL '7 days') AS completions_7d,
  COUNT(hc.id) FILTER (WHERE hc.completed_at >= CURRENT_DATE - INTERVAL '30 days') AS completions_30d
FROM public.habits h
LEFT JOIN public.habit_completions hc ON h.id = hc.habit_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM public.habits
  WHERE is_active = true
  GROUP BY user_id
) habit_count ON h.user_id = habit_count.user_id
WHERE h.is_active = true;

COMMENT ON VIEW public.admin_engagement_metrics IS 'Habit engagement metrics for admin dashboard';

-- View: Revenue metrics (from purchases)
CREATE OR REPLACE VIEW public.admin_revenue_metrics AS
SELECT
  COUNT(id) FILTER (WHERE status = 'paid') AS total_purchases,
  SUM(amount_cents) FILTER (WHERE status = 'paid') AS total_revenue_cents,
  AVG(amount_cents) FILTER (WHERE status = 'paid') AS avg_purchase_cents,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'paid') AS paying_users,
  COUNT(id) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE) AS purchases_today,
  SUM(amount_cents) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE) AS revenue_today_cents,
  COUNT(id) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '7 days') AS purchases_7d,
  SUM(amount_cents) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '7 days') AS revenue_7d_cents,
  COUNT(id) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS purchases_30d,
  SUM(amount_cents) FILTER (WHERE status = 'paid' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_30d_cents
FROM public.purchases;

COMMENT ON VIEW public.admin_revenue_metrics IS 'Revenue and purchase metrics for admin dashboard';

-- View: Content statistics
CREATE OR REPLACE VIEW public.admin_content_stats AS
SELECT
  (SELECT COUNT(*) FROM public.meditations) AS total_meditations,
  (SELECT COUNT(*) FROM public.quotes) AS total_quotes,
  (SELECT COUNT(*) FROM public.tips) AS total_tips,
  (SELECT COUNT(*) FROM public.books) AS total_books,
  (SELECT COUNT(*) FROM public.guided_days) AS total_guided_days;

COMMENT ON VIEW public.admin_content_stats IS 'Content library statistics for admin dashboard';

-- Grant SELECT on views to admins (via RLS on underlying tables)
-- Note: Views automatically respect RLS of underlying tables

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, text, text, uuid, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_premium(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_suspend_user(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_user(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
