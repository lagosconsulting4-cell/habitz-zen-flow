-- Fix one-time journey habit templates that were incorrectly seeded as 'daily'
-- This corrects the notification_cleanup habit in Digital Detox L1
UPDATE public.journey_habit_templates
SET frequency_type = 'one_time'
WHERE canonical_key = 'notification_cleanup'
  AND start_day = end_day
  AND frequency_type = 'daily';
