-- Enable pg_cron extension (já deve estar habilitado, mas garantir)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop job if exists (idempotência - permite rodar migration múltiplas vezes)
SELECT cron.unschedule('reset-expired-streaks-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-expired-streaks-daily'
);

-- Schedule automatic streak reset at midnight UTC daily
-- This job calls update_streak() for all users to reset expired streaks
SELECT cron.schedule(
  'reset-expired-streaks-daily',
  '0 0 * * *',  -- Every day at 00:00 UTC (21:00 Brazil time)
  $$
    WITH streak_updates AS (
      SELECT update_streak(user_id) FROM auth.users
    )
    SELECT COUNT(*) as updated_count FROM streak_updates;
  $$
);

-- Verify job was created successfully
DO $$
DECLARE
  job_count integer;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM cron.job
  WHERE jobname = 'reset-expired-streaks-daily';

  IF job_count = 0 THEN
    RAISE EXCEPTION 'Failed to create cron job reset-expired-streaks-daily';
  END IF;

  RAISE NOTICE 'Cron job reset-expired-streaks-daily created successfully';
END $$;
