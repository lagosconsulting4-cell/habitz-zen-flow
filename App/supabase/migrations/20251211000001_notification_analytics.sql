-- Sprint 5: Add analytics columns to notification_history table
-- Tracks notification opens, completions, and dismissals for A/B testing

-- Add analytics columns to notification_history
ALTER TABLE notification_history
ADD COLUMN opened_at TIMESTAMPTZ,
ADD COLUMN completed_from_notification BOOLEAN DEFAULT false,
ADD COLUMN dismissed_at TIMESTAMPTZ;

-- Create index for analytics queries
CREATE INDEX idx_notification_opened_at ON notification_history(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX idx_notification_completed_from ON notification_history(completed_from_notification) WHERE completed_from_notification = true;

-- Create view for analytics reporting
CREATE OR REPLACE VIEW notification_analytics AS
SELECT
  context_type,
  message_key,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
  ROUND(
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::numeric
    / COUNT(*) * 100,
    2
  ) as open_rate_percent,
  COUNT(CASE WHEN completed_from_notification = true THEN 1 END) as direct_completions,
  ROUND(
    COUNT(CASE WHEN completed_from_notification = true THEN 1 END)::numeric
    / COUNT(*) * 100,
    2
  ) as direct_completion_rate_percent,
  COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END) as dismissals,
  ROUND(
    COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END)::numeric
    / COUNT(*) * 100,
    2
  ) as dismissal_rate_percent,
  DATE(sent_at) as date_sent,
  MAX(sent_at) as last_sent
FROM notification_history
GROUP BY context_type, message_key, DATE(sent_at)
ORDER BY date_sent DESC, total_sent DESC;

-- Create a simpler daily summary view
CREATE OR REPLACE VIEW notification_daily_summary AS
SELECT
  DATE(sent_at) as date,
  context_type,
  COUNT(*) as total_sent,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
  COUNT(CASE WHEN completed_from_notification = true THEN 1 END) as direct_completions,
  COUNT(CASE WHEN dismissed_at IS NOT NULL THEN 1 END) as dismissals,
  COUNT(DISTINCT user_id) as unique_users
FROM notification_history
GROUP BY DATE(sent_at), context_type
ORDER BY date DESC, total_sent DESC;

-- Create a user-level analytics view (for personalization A/B tests)
CREATE OR REPLACE VIEW notification_user_analytics AS
SELECT
  user_id,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
  ROUND(
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::numeric
    / COUNT(*) * 100,
    2
  ) as user_open_rate_percent,
  COUNT(CASE WHEN completed_from_notification = true THEN 1 END) as direct_completions,
  MAX(sent_at) as last_notification_at,
  MIN(sent_at) as first_notification_at,
  COUNT(DISTINCT context_type) as unique_contexts_received
FROM notification_history
WHERE sent_at >= now() - interval '30 days'
GROUP BY user_id
ORDER BY total_notifications DESC;

-- Grant permissions for views
GRANT SELECT ON notification_analytics TO authenticated, anon;
GRANT SELECT ON notification_daily_summary TO authenticated, anon;
GRANT SELECT ON notification_user_analytics TO authenticated, anon;
