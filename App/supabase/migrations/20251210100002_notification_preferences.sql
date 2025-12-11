-- Migration: Add notification preferences to user_progress
-- Created: 2025-12-10
--
-- Adds JSONB column for per-user notification settings:
-- - daily_limit: max notifications per day (default 3)
-- - extra_for_streaks: additional notifications for users with streaks (default 2)
-- - delayed_reminder_hours: hours after reminder to send "delayed" notification (default 2)
-- - end_of_day_enabled: whether to send end-of-day reminders (default true)
-- - quiet_hours_start/end: optional quiet hours (null = disabled)

ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "daily_limit": 3,
  "extra_for_streaks": 2,
  "delayed_reminder_hours": 2,
  "end_of_day_enabled": true,
  "quiet_hours_start": null,
  "quiet_hours_end": null
}'::jsonb;

-- Index for querying specific notification preferences
CREATE INDEX IF NOT EXISTS idx_user_progress_notification_prefs
  ON public.user_progress USING gin (notification_preferences);

COMMENT ON COLUMN public.user_progress.notification_preferences IS 'Per-user notification settings: daily_limit, extra_for_streaks, delayed_reminder_hours, end_of_day_enabled, quiet_hours';
