-- ============================================================================
-- DEFAULT QUIET HOURS (22:00 - 07:00)
-- ============================================================================
-- Sets sensible quiet hours for all users who don't have them configured.
-- Prevents push notifications during sleeping hours (opt-out instead of opt-in).
-- Part of Phase 1 push notification retention improvements.

-- 1. Update existing users who have null quiet hours
UPDATE public.user_progress
SET notification_preferences = notification_preferences || '{"quiet_hours_start":"22:00","quiet_hours_end":"07:00"}'::jsonb
WHERE notification_preferences->>'quiet_hours_start' IS NULL
   OR notification_preferences->>'quiet_hours_end' IS NULL;

-- 2. Update column default so new users get quiet hours out-of-box
ALTER TABLE public.user_progress
  ALTER COLUMN notification_preferences SET DEFAULT '{
  "daily_limit": 3,
  "extra_for_streaks": 2,
  "delayed_reminder_hours": 2,
  "end_of_day_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00"
}'::jsonb;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
