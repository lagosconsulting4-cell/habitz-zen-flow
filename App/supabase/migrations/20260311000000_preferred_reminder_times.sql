-- Sprint 2: Preferred reminder times + backfill missing reminder_time

-- 1. Add preferred_reminder_times to existing users
UPDATE public.user_progress
SET notification_preferences = notification_preferences || '{
  "preferred_reminder_times": {
    "morning": "08:00",
    "afternoon": "14:00",
    "evening": "20:00"
  }
}'::jsonb
WHERE notification_preferences IS NOT NULL
  AND notification_preferences->>'preferred_reminder_times' IS NULL;

-- 2. Update column default for new users
ALTER TABLE public.user_progress
  ALTER COLUMN notification_preferences SET DEFAULT '{
    "daily_limit": 3,
    "extra_for_streaks": 2,
    "delayed_reminder_hours": 2,
    "end_of_day_enabled": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00",
    "preferred_reminder_times": {
      "morning": "08:00",
      "afternoon": "14:00",
      "evening": "20:00"
    }
  }'::jsonb;

-- 3. Backfill: fix journey habits after Day 1 with NULL reminder_time
UPDATE public.habits
SET
  reminder_time = (CASE period
    WHEN 'morning' THEN '08:00'
    WHEN 'afternoon' THEN '14:00'
    WHEN 'evening' THEN '20:00'
    ELSE '08:00'
  END)::time,
  notification_pref = jsonb_build_object(
    'reminder_enabled', true,
    'reminder_time', CASE period
      WHEN 'morning' THEN '08:00'
      WHEN 'afternoon' THEN '14:00'
      WHEN 'evening' THEN '20:00'
      ELSE '08:00'
    END
  )
WHERE source = 'journey'
  AND is_active = true
  AND reminder_time IS NULL;
