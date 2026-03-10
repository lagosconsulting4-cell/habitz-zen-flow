-- ============================================================================
-- DISABLE QUIET HOURS
-- ============================================================================
-- Removes quiet_hours_start/end from notification preferences.
-- Quiet hours were conflicting with end-of-day reminders (22:00 trigger
-- fell inside 22:00-07:00 quiet window). Disabling unblocks the feature.
-- Edge function code kept intact for potential future reactivation.

-- 1. Strip quiet hours keys from all existing users
UPDATE public.user_progress
SET notification_preferences = notification_preferences - 'quiet_hours_start' - 'quiet_hours_end'
WHERE notification_preferences ? 'quiet_hours_start'
   OR notification_preferences ? 'quiet_hours_end';

-- 2. Update column default to no longer include quiet hours
ALTER TABLE public.user_progress
  ALTER COLUMN notification_preferences SET DEFAULT '{
  "daily_limit": 3,
  "extra_for_streaks": 2,
  "delayed_reminder_hours": 2,
  "end_of_day_enabled": true
}'::jsonb;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
