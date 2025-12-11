-- Sprint 3: Add pg_cron job for behavioral triggers (delayed, end_of_day, multiple_pending)
-- Runs hourly to check for triggers and send notifications

-- Schedule notification-trigger-scheduler to run every hour
SELECT cron.schedule(
  'notification-trigger-scheduler',
  '0 * * * *',  -- Every hour at :00
  $$
    SELECT
      net.http_post(
        concat(
          current_setting('app.settings.supabase_url'),
          '/functions/v1/notification-trigger-scheduler'
        ),
        '{}'::jsonb,
        jsonb_build_object(
          'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        'application/json'
      ) as request_id;
  $$
);
