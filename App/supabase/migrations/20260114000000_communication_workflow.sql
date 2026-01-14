-- =====================================================
-- Communication Workflow Migration
-- =====================================================
-- Description: Infrastructure for the communication workflow (régua de comunicação)
-- - communication_log table for tracking all communications
-- - Extensions to quiz_responses for email sequence tracking
-- - Extensions to purchases for trial and payment failure tracking
-- =====================================================

-- =====================================================
-- 1. COMMUNICATION LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.communication_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,

  -- Communication metadata
  journey text NOT NULL, -- 'abandoned_quiz', 'trial', 'active', 'payment_failed', 'churn'
  sequence_id text NOT NULL, -- 'quiz_15min', 'trial_day_3', 'payment_failed_1', etc.
  channel text NOT NULL DEFAULT 'email', -- 'email', 'push'

  -- Email specifics
  email_subject text,
  email_template_id text,

  -- Status tracking
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced boolean DEFAULT false,

  -- External references
  external_id text, -- Resend email ID, push notification ID, etc.

  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for communication_log
CREATE INDEX IF NOT EXISTS idx_comm_log_user ON public.communication_log(user_id);
CREATE INDEX IF NOT EXISTS idx_comm_log_email ON public.communication_log(email);
CREATE INDEX IF NOT EXISTS idx_comm_log_journey ON public.communication_log(journey, sequence_id);
CREATE INDEX IF NOT EXISTS idx_comm_log_sent ON public.communication_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_log_channel ON public.communication_log(channel);

-- RLS for communication_log
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
DROP POLICY IF EXISTS "Service role full access on communication_log" ON public.communication_log;
CREATE POLICY "Service role full access on communication_log"
  ON public.communication_log FOR ALL TO service_role USING (true);

-- Admins can view all
DROP POLICY IF EXISTS "Admins can view all communication_log" ON public.communication_log;
CREATE POLICY "Admins can view all communication_log"
  ON public.communication_log FOR SELECT TO authenticated
  USING (public.current_user_is_admin());

-- =====================================================
-- 2. EXTEND QUIZ_RESPONSES TABLE
-- =====================================================

-- Add columns for email sequence tracking
ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS last_email_sequence_id text,
  ADD COLUMN IF NOT EXISTS last_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_unsubscribed boolean DEFAULT false;

-- Index for finding leads that need follow-up
CREATE INDEX IF NOT EXISTS idx_quiz_responses_email_tracking
  ON public.quiz_responses(completed, converted_to_customer, last_email_sent_at)
  WHERE completed = true AND converted_to_customer = false;

-- =====================================================
-- 3. EXTEND PURCHASES TABLE
-- =====================================================

-- Add columns for trial and payment failure tracking
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS payment_failure_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_failure_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_recovered_at timestamptz;

-- Index for finding users in trial
CREATE INDEX IF NOT EXISTS idx_purchases_trial
  ON public.purchases(trial_end_date)
  WHERE trial_end_date IS NOT NULL AND status = 'paid';

-- Index for finding failed payments
CREATE INDEX IF NOT EXISTS idx_purchases_payment_failure
  ON public.purchases(last_payment_failure_at)
  WHERE payment_failure_count > 0;

-- =====================================================
-- 4. ANALYTICS VIEWS
-- =====================================================

-- View for communication metrics
DROP VIEW IF EXISTS public.admin_communication_metrics;
CREATE OR REPLACE VIEW public.admin_communication_metrics AS
SELECT
  journey,
  sequence_id,
  channel,
  COUNT(*) AS total_sent,
  COUNT(opened_at) AS total_opened,
  COUNT(clicked_at) AS total_clicked,
  COUNT(CASE WHEN bounced THEN 1 END) AS total_bounced,
  ROUND(COUNT(opened_at)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS open_rate,
  ROUND(COUNT(clicked_at)::numeric / NULLIF(COUNT(opened_at), 0) * 100, 2) AS click_rate,
  MIN(sent_at) AS first_sent,
  MAX(sent_at) AS last_sent
FROM public.communication_log
WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY journey, sequence_id, channel
ORDER BY journey, sequence_id;

-- View for abandoned quiz funnel
DROP VIEW IF EXISTS public.admin_abandoned_quiz_funnel;
CREATE OR REPLACE VIEW public.admin_abandoned_quiz_funnel AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_completed,
  COUNT(CASE WHEN converted_to_customer THEN 1 END) AS converted,
  COUNT(CASE WHEN NOT converted_to_customer AND last_email_sent_at IS NOT NULL THEN 1 END) AS received_emails,
  COUNT(CASE WHEN NOT converted_to_customer AND last_email_sent_at IS NULL THEN 1 END) AS no_follow_up,
  ROUND(COUNT(CASE WHEN converted_to_customer THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS conversion_rate
FROM public.quiz_responses
WHERE completed = true
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Summary:
-- - 1 new table: communication_log
-- - Extended quiz_responses with email tracking columns
-- - Extended purchases with trial/payment failure tracking
-- - 2 new analytics views
-- =====================================================
