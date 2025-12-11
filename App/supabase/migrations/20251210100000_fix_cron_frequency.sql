-- Migration: Fix pg_cron frequency for habit reminders
-- Created: 2025-12-10
--
-- Changes cron schedule from 3x/day to every 5 minutes
-- to properly support user-configured reminder times.
--
-- The habit-reminder-scheduler code already has 5-minute window logic,
-- but cron was only running at 8h, 14h, 20h Brazil time.

-- Remove old jobs if they exist (safe removal)
DO $$
BEGIN
  -- Try to unschedule old jobs, ignore if they don't exist
  BEGIN
    PERFORM cron.unschedule('habit-reminders-morning');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job habit-reminders-morning not found, skipping';
  END;

  BEGIN
    PERFORM cron.unschedule('habit-reminders-afternoon');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job habit-reminders-afternoon not found, skipping';
  END;

  BEGIN
    PERFORM cron.unschedule('habit-reminders-evening');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job habit-reminders-evening not found, skipping';
  END;

  -- Also remove if there's already a 5-minute scheduler
  BEGIN
    PERFORM cron.unschedule('habit-reminder-scheduler');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job habit-reminder-scheduler not found, skipping';
  END;
END $$;

-- Schedule to run every 5 minutes
-- This allows reminders at any user-configured time
SELECT cron.schedule(
  'habit-reminder-scheduler',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/habit-reminder-scheduler',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verification query (can be run manually):
-- SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'habit-reminder-scheduler';
