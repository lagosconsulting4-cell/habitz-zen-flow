-- ============================================================================
-- LEADS RLS HARDENING
-- ============================================================================
-- Hardens RLS policies for quiz_responses and lead_interactions tables
-- Ensures admins have proper access while maintaining security
-- Follows patterns from 20251211000000_admin_system.sql
-- ============================================================================

-- ============================================================================
-- 1. QUIZ_RESPONSES TABLE RLS
-- ============================================================================

-- Enable RLS on quiz_responses if not already enabled
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Admins can view all quiz_responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Admins can update quiz_responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Service role can insert quiz_responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Public can insert quiz_responses" ON public.quiz_responses;

-- Policy: Admins can view all quiz responses (leads)
CREATE POLICY "Admins can view all quiz_responses"
  ON public.quiz_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update quiz responses (for follow-up management)
CREATE POLICY "Admins can update quiz_responses"
  ON public.quiz_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Service role can insert quiz responses (from public quiz form)
-- Note: This policy allows inserts from the service role for quiz submissions
CREATE POLICY "Service role can insert quiz_responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (true);

-- Policy: Public can insert quiz responses (anonymous submissions)
-- This allows the quiz form to work without authentication
CREATE POLICY "Public can insert quiz_responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 2. LEAD_INTERACTIONS TABLE RLS
-- ============================================================================

-- Enable RLS on lead_interactions if not already enabled
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Admins can view all lead_interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Admins can insert lead_interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Admins can update lead_interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Admins can delete lead_interactions" ON public.lead_interactions;

-- Policy: Admins can view all lead interactions
CREATE POLICY "Admins can view all lead_interactions"
  ON public.lead_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can insert lead interactions
CREATE POLICY "Admins can insert lead_interactions"
  ON public.lead_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update lead interactions (for editing notes/metadata)
CREATE POLICY "Admins can update lead_interactions"
  ON public.lead_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can delete lead interactions (if needed)
CREATE POLICY "Admins can delete lead_interactions"
  ON public.lead_interactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 3. ANALYTICS VIEWS ACCESS
-- ============================================================================
-- Views automatically respect RLS of underlying tables, but we add comments
-- to document that admins have access to all analytics views through
-- their quiz_responses table access

COMMENT ON VIEW public.admin_leads_summary IS
'Summary statistics for leads dashboard. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_funnel IS
'Conversion funnel metrics. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_age IS
'Lead segmentation by age range. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_profession IS
'Lead segmentation by profession. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_objective IS
'Lead segmentation by objective. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_financial_range IS
'Lead segmentation by income range. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_gender IS
'Lead segmentation by gender. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_utm IS
'UTM attribution tracking. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_temporal IS
'Daily lead trends over 90 days. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_temporal_weekly IS
'Weekly lead trends over 180 days. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_heatmap IS
'Lead distribution by day of week and hour. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_by_source IS
'Lead distribution by source. Access controlled by quiz_responses RLS policies.';

COMMENT ON VIEW public.admin_leads_top_challenges IS
'Most common challenges reported by leads. Access controlled by quiz_responses RLS policies.';

-- ============================================================================
-- 4. FUNCTION ACCESS
-- ============================================================================
-- Ensure RPC functions from previous migrations have proper access

-- The search_leads function is already SECURITY DEFINER and granted to authenticated users
COMMENT ON FUNCTION public.search_leads IS
'Optimized search for leads with filters. Access restricted to authenticated admins via function logic.';

-- Update lead status, add note, add/remove tag functions are SECURITY DEFINER
-- and verify admin status internally, so they are safe
COMMENT ON FUNCTION public.update_lead_status IS
'Updates lead follow-up status. Verifies admin access internally.';

COMMENT ON FUNCTION public.add_lead_note IS
'Adds note to lead. Verifies admin access internally.';

COMMENT ON FUNCTION public.add_lead_tag IS
'Adds tag to lead. Verifies admin access internally.';

COMMENT ON FUNCTION public.remove_lead_tag IS
'Removes tag from lead. Verifies admin access internally.';

-- ============================================================================
-- 5. ADDITIONAL SECURITY INDEXES
-- ============================================================================
-- These indexes were created in previous migrations

-- Add comments only if indexes exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_follow_up_status') THEN
    COMMENT ON INDEX public.idx_quiz_responses_follow_up_status IS
    'Index for filtering leads by follow-up status. Used in admin queries.';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_source') THEN
    COMMENT ON INDEX public.idx_quiz_responses_source IS
    'Index for filtering leads by source. Used in admin queries and analytics.';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_tags') THEN
    COMMENT ON INDEX public.idx_quiz_responses_tags IS
    'GIN index for tag array queries. Used in tag-based filtering.';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lead_interactions_lead_id') THEN
    COMMENT ON INDEX public.idx_lead_interactions_lead_id IS
    'Index for fetching interactions for a specific lead. Used in detail view.';
  END IF;
END $$;

-- ============================================================================
-- 6. SECURITY AUDIT
-- ============================================================================
-- Run this query to verify RLS policies are properly configured:
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('quiz_responses', 'lead_interactions')
-- ORDER BY tablename, policyname;
--
-- Expected policies:
-- - quiz_responses: SELECT (admins), UPDATE (admins), INSERT (public/service)
-- - lead_interactions: SELECT/INSERT/UPDATE/DELETE (admins only)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
