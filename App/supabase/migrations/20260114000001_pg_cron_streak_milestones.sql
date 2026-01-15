-- Migration: Populate user_cohorts streak milestone dates
-- This job runs daily to check if users have achieved streak milestones
-- and updates their first_3day_streak_date and first_7day_streak_date

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to update streak milestone dates for all users
CREATE OR REPLACE FUNCTION update_streak_milestones()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  max_streak INTEGER;
BEGIN
  -- Loop through all users in user_cohorts that have NULL milestone dates
  FOR user_record IN
    SELECT uc.user_id, uc.first_3day_streak_date, uc.first_7day_streak_date
    FROM user_cohorts uc
    WHERE uc.first_3day_streak_date IS NULL
       OR uc.first_7day_streak_date IS NULL
  LOOP
    -- Get the maximum current streak for this user across all habits
    SELECT COALESCE(MAX(h.streak), 0)
    INTO max_streak
    FROM habits h
    WHERE h.user_id = user_record.user_id
      AND h.is_active = true;

    -- Update first_3day_streak_date if user achieved 3+ day streak
    IF user_record.first_3day_streak_date IS NULL AND max_streak >= 3 THEN
      UPDATE user_cohorts
      SET first_3day_streak_date = CURRENT_DATE
      WHERE user_id = user_record.user_id;

      RAISE NOTICE 'User % achieved 3-day streak milestone', user_record.user_id;
    END IF;

    -- Update first_7day_streak_date if user achieved 7+ day streak
    IF user_record.first_7day_streak_date IS NULL AND max_streak >= 7 THEN
      UPDATE user_cohorts
      SET first_7day_streak_date = CURRENT_DATE
      WHERE user_id = user_record.user_id;

      RAISE NOTICE 'User % achieved 7-day streak milestone', user_record.user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_streak_milestones() TO service_role;

-- Drop existing job if exists (idempotency)
SELECT cron.unschedule('update-streak-milestones-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'update-streak-milestones-daily'
);

-- Schedule daily job at 01:00 UTC (22:00 Brazil time)
-- This runs after the streak reset job (00:00 UTC) to capture fresh data
SELECT cron.schedule(
  'update-streak-milestones-daily',
  '0 1 * * *',  -- Every day at 01:00 UTC
  $$SELECT update_streak_milestones();$$
);

-- Run the function once immediately to backfill existing data
SELECT update_streak_milestones();

-- Verify job was created
DO $$
DECLARE
  job_count integer;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM cron.job
  WHERE jobname = 'update-streak-milestones-daily';

  IF job_count = 0 THEN
    RAISE EXCEPTION 'Failed to create cron job update-streak-milestones-daily';
  END IF;

  RAISE NOTICE 'Cron job update-streak-milestones-daily created successfully';
END $$;
