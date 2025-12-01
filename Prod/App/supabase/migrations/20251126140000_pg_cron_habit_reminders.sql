-- Migration: Setup pg_cron for habit reminder notifications
-- Created: 2025-11-26
--
-- This migration sets up scheduled jobs to send push notifications
-- for habit reminders at different times of the day.
--
-- IMPORTANT: pg_cron extension must be enabled in your Supabase project.
-- Go to Database > Extensions and enable pg_cron.
--
-- NOTE: You need to replace YOUR_SERVICE_ROLE_KEY with the actual key
-- from Supabase Dashboard > Settings > API > service_role key
-- NEVER commit the actual key to source control.

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (required for cron jobs)
GRANT USAGE ON SCHEMA cron TO postgres;

-- Morning habit reminders (8:00 AM Brazil time = 11:00 UTC)
-- Adjust the time based on your target timezone
SELECT cron.schedule(
  'habit-reminders-morning',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/habit-reminder-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"period": "morning"}'::jsonb
  );
  $$
);

-- Afternoon habit reminders (2:00 PM Brazil time = 17:00 UTC)
SELECT cron.schedule(
  'habit-reminders-afternoon',
  '0 17 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/habit-reminder-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"period": "afternoon"}'::jsonb
  );
  $$
);

-- Evening habit reminders (8:00 PM Brazil time = 23:00 UTC)
SELECT cron.schedule(
  'habit-reminders-evening',
  '0 23 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/habit-reminder-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{"period": "evening"}'::jsonb
  );
  $$
);

-- Comment on the jobs
COMMENT ON EXTENSION pg_cron IS 'Scheduled jobs for habit reminders';

-- View to check scheduled jobs
-- SELECT * FROM cron.job;

-- To manually trigger a job for testing:
-- SELECT net.http_post(
--   url := 'https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/habit-reminder-scheduler',
--   headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_KEY"}'::jsonb,
--   body := '{"period": "morning", "dryRun": true}'::jsonb
-- );

-- To delete a scheduled job:
-- SELECT cron.unschedule('habit-reminders-morning');
