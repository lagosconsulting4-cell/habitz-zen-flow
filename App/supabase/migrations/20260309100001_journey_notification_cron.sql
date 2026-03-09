-- Migration: Schedule journey-notification-scheduler via pg_cron
-- Created: 2026-03-09
--
-- Runs daily at 12:00 UTC (09:00 BRT) to send journey notifications
-- to users with active journeys who haven't opened the app.

SELECT cron.schedule(
  'journey-notification-scheduler',
  '0 12 * * *',
  $$
  SELECT
    net.http_post(
      concat(
        current_setting('app.settings.supabase_url'),
        '/functions/v1/journey-notification-scheduler'
      ),
      '{}',
      'application/json',
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
      )
    ) AS request_id;
  $$
);
