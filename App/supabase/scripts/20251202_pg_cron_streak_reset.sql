-- Schedule automatic streak reset at midnight UTC daily
-- This job calls update_streak() for all users to reset expired streaks

SELECT cron.schedule(
  'reset-expired-streaks-daily',
  '0 0 * * *',  -- Every day at 00:00 UTC
  $$
    WITH streak_updates AS (
      SELECT update_streak(user_id) FROM auth.users
    )
    SELECT COUNT(*) as updated_count FROM streak_updates;
  $$
);
