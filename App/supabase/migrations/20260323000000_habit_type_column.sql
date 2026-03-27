-- Add type column to distinguish reminders from habits
-- Reminders (frequency_type='once') expire after due_date
-- Habits (daily/fixed_days) are persistent

ALTER TABLE habits ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'habit';

-- Add check constraint (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'habits_type_check'
  ) THEN
    ALTER TABLE habits ADD CONSTRAINT habits_type_check CHECK (type IN ('habit', 'reminder'));
  END IF;
END $$;

-- Backfill: existing once-frequency entries are reminders
UPDATE habits SET type = 'reminder' WHERE frequency_type = 'once' AND type = 'habit';
