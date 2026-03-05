-- ============================================================================
-- CAMPAIGN: UNCONVERTED LEADS SELECTION
-- ============================================================================
-- Creates views to identify quiz leads who never purchased (Bora or Foquinha).
-- Also backfills the unreliable converted_to_customer flag.
-- Follows pattern from 20260131000000_leads_analytics_views.sql

-- ============================================================================
-- 1. PERFORMANCE INDEX - Normalize email lookups on quiz_responses
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quiz_responses_email_lower
  ON public.quiz_responses (lower(email));

-- ============================================================================
-- 2. BACKFILL - Fix converted_to_customer for leads who actually purchased
-- ============================================================================
-- The converted_to_customer flag was only updated manually via admin dashboard.
-- This backfill crosses quiz emails against paid purchases to fix the data.

UPDATE public.quiz_responses qr
SET
  converted_to_customer = true,
  follow_up_status = CASE
    WHEN follow_up_status IN ('novo', 'contactado') THEN 'convertido'
    ELSE follow_up_status
  END,
  updated_at = NOW()
WHERE qr.completed = true
  AND qr.converted_to_customer = false
  AND (
    -- Match by email in purchases
    EXISTS (
      SELECT 1 FROM public.purchases p
      WHERE lower(p.email) = lower(qr.email)
        AND p.status = 'paid'
    )
    -- Match by email in pending_purchases (guest checkout)
    OR EXISTS (
      SELECT 1 FROM public.pending_purchases pp
      WHERE lower(pp.email) = lower(qr.email)
        AND pp.status = 'paid'
    )
    -- Match by user_id (quiz respondent who later signed up and purchased)
    OR (
      qr.user_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.purchases p2
        WHERE p2.user_id = qr.user_id
          AND p2.status = 'paid'
      )
    )
  );

-- ============================================================================
-- 3. VIEW - Unconverted leads (deduplicated by email, most recent per email)
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_unconverted_leads AS
SELECT DISTINCT ON (lower(qr.email))
  qr.id,
  qr.name,
  qr.email,
  qr.phone,
  qr.objective,
  qr.age_range,
  qr.profession,
  qr.financial_range,
  qr.utm_source,
  qr.utm_medium,
  qr.utm_campaign,
  qr.source,
  qr.follow_up_status,
  qr.created_at,
  CASE
    WHEN qr.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'hot'
    WHEN qr.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 'warm'
    WHEN qr.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN 'cool'
    ELSE 'cold'
  END AS lead_temperature
FROM public.quiz_responses qr
WHERE qr.completed = true
  AND qr.follow_up_status != 'perdido'
  -- Exclude by email match in purchases table
  AND NOT EXISTS (
    SELECT 1 FROM public.purchases p
    WHERE lower(p.email) = lower(qr.email)
      AND p.status = 'paid'
  )
  -- Exclude by email match in pending_purchases table (guest checkout)
  AND NOT EXISTS (
    SELECT 1 FROM public.pending_purchases pp
    WHERE lower(pp.email) = lower(qr.email)
      AND pp.status = 'paid'
  )
  -- Exclude by user_id link (for quiz respondents who later signed up and purchased)
  AND NOT EXISTS (
    SELECT 1 FROM public.purchases p2
    WHERE p2.user_id = qr.user_id
      AND p2.status = 'paid'
      AND qr.user_id IS NOT NULL
  )
ORDER BY lower(qr.email), qr.created_at DESC;

COMMENT ON VIEW public.admin_unconverted_leads IS
  'Quiz leads who completed the quiz but never purchased. Deduplicated by email (most recent response). Excludes unsubscribed and lost leads.';

-- ============================================================================
-- 4. SUMMARY VIEW - Quick counts by lead temperature
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_unconverted_leads_summary AS
SELECT
  COUNT(*) AS total_unconverted,
  COUNT(*) FILTER (WHERE lead_temperature = 'hot') AS hot_leads,
  COUNT(*) FILTER (WHERE lead_temperature = 'warm') AS warm_leads,
  COUNT(*) FILTER (WHERE lead_temperature = 'cool') AS cool_leads,
  COUNT(*) FILTER (WHERE lead_temperature = 'cold') AS cold_leads
FROM public.admin_unconverted_leads;

COMMENT ON VIEW public.admin_unconverted_leads_summary IS
  'Summary counts of unconverted leads by temperature (hot=7d, warm=30d, cool=90d, cold=90d+)';

-- ============================================================================
-- 5. GRANTS - Follow pattern from 20260136000000_leads_views_rls.sql
-- ============================================================================

GRANT SELECT ON public.admin_unconverted_leads TO authenticated;
GRANT SELECT ON public.admin_unconverted_leads_summary TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
