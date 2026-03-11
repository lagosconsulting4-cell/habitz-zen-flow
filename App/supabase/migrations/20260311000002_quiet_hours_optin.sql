-- ============================================================================
-- RE-ENABLE QUIET HOURS AS OPT-IN
-- ============================================================================
-- Previous migration (20260311000001) disabled quiet hours because the
-- opt-out default of 22:00-07:00 conflicted with end-of-day reminders.
-- Now we re-enable the keys as null (opt-in): users configure in onboarding.
-- Existing users are NOT affected (they keep no quiet hours).
-- Only users who explicitly enable quiet hours in onboarding will have values.

ALTER TABLE public.user_progress
  ALTER COLUMN notification_preferences SET DEFAULT '{
  "daily_limit": 3,
  "extra_for_streaks": 2,
  "delayed_reminder_hours": 2,
  "end_of_day_enabled": true,
  "quiet_hours_start": null,
  "quiet_hours_end": null
}'::jsonb;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
