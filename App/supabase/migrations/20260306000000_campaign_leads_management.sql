-- ============================================================================
-- CAMPAIGN LEADS MANAGEMENT
-- ============================================================================
-- Adds tracking column, updates view, and creates RPC for campaign management.
-- Enables filtering, pagination, and email send tracking for unconverted leads.
-- Follows patterns from 20260132000000_leads_search_rpc.sql and
-- 20260305100000_campaign_unconverted_leads.sql

-- ============================================================================
-- 1. TRACKING COLUMN - Track when campaign emails were sent
-- ============================================================================

ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS last_campaign_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_quiz_responses_last_campaign
  ON public.quiz_responses (last_campaign_sent_at)
  WHERE last_campaign_sent_at IS NOT NULL;

-- ============================================================================
-- 2. UPDATED VIEW - Include last_campaign_sent_at for filtering
-- ============================================================================

-- Must DROP first because column order changed (last_campaign_sent_at added before lead_temperature)
-- Summary view depends on this view, so drop it first
DROP VIEW IF EXISTS public.admin_unconverted_leads_summary;
DROP VIEW IF EXISTS public.admin_unconverted_leads;

CREATE VIEW public.admin_unconverted_leads AS
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
  qr.last_campaign_sent_at,
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
  'Quiz leads who completed the quiz but never purchased. Deduplicated by email. Includes last_campaign_sent_at for tracking email dispatches.';

-- Recreate summary view (was dropped due to dependency)
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

-- Re-grant access (views were dropped and recreated)
GRANT SELECT ON public.admin_unconverted_leads TO authenticated;
GRANT SELECT ON public.admin_unconverted_leads_summary TO authenticated;

-- ============================================================================
-- 3. RPC - Bulk mark leads as emailed + log in communication_log
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_leads_emailed(
  p_lead_ids uuid[],
  p_campaign_name text DEFAULT 'manual_campaign'
)
RETURNS integer
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  affected integer;
BEGIN
  -- Update quiz_responses with campaign timestamp
  UPDATE public.quiz_responses
  SET last_campaign_sent_at = NOW(),
      updated_at = NOW()
  WHERE id = ANY(p_lead_ids);

  GET DIAGNOSTICS affected = ROW_COUNT;

  -- Log each email dispatch in communication_log
  INSERT INTO public.communication_log (email, journey, sequence_id, channel, sent_at)
  SELECT qr.email, 'abandoned_quiz', p_campaign_name, 'email', NOW()
  FROM public.quiz_responses qr
  WHERE qr.id = ANY(p_lead_ids);

  RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_leads_emailed TO authenticated;

COMMENT ON FUNCTION public.mark_leads_emailed IS
  'Marks quiz leads as emailed for campaign tracking. Updates last_campaign_sent_at and logs to communication_log.';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
