-- ============================================================================
-- Phase 5C.1: Notification History Retention & Indexes
--
-- Adds performance indexes for notification_history queries
-- and sets up pg_cron job for 90-day data retention cleanup.
-- ============================================================================

-- Index for retention cleanup queries (DELETE WHERE sent_at < ...)
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at
  ON public.notification_history(sent_at);

-- Index for notification_daily_summary and dedup queries
CREATE INDEX IF NOT EXISTS idx_notification_history_date_context
  ON public.notification_history(notification_date, context_type);

-- Index for per-user analytics and anti-burst queries
CREATE INDEX IF NOT EXISTS idx_notification_history_user_sent
  ON public.notification_history(user_id, sent_at DESC);

-- pg_cron: delete rows > 90 days (weekly, Sunday 4am UTC)
SELECT cron.schedule(
  'notification-history-cleanup',
  '0 4 * * 0',
  $$
  DELETE FROM public.notification_history
  WHERE sent_at < now() - interval '90 days';
  $$
);
