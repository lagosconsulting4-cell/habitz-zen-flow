-- Add support for one-time tasks (meetings, deliverables, etc.)
-- Extends existing habit_frequency_type enum with 'once' and adds due_date column

-- 1. Add 'once' to the existing frequency type enum
ALTER TYPE public.habit_frequency_type ADD VALUE IF NOT EXISTS 'once';

-- 2. Add due_date column for one-time tasks
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS due_date DATE;

-- 3. Update days_of_week constraint to allow empty array when frequency_type = 'once'
--    Uses ::text cast to avoid "unsafe use of new value" error when enum value
--    was added in the same transaction.
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS habits_days_of_week_valid;
ALTER TABLE public.habits ADD CONSTRAINT habits_days_of_week_valid CHECK (
  (frequency_type::text = 'once' AND due_date IS NOT NULL)
  OR (
    frequency_type::text != 'once'
    AND array_length(days_of_week, 1) >= 1
    AND days_of_week <@ ARRAY[0,1,2,3,4,5,6]::smallint[]
  )
);

-- 4. Ensure due_date only exists with frequency_type = 'once'
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS habits_due_date_requires_once;
ALTER TABLE public.habits ADD CONSTRAINT habits_due_date_requires_once
  CHECK (due_date IS NULL OR frequency_type::text = 'once');

-- 5. Partial index for efficient due_date lookups
CREATE INDEX IF NOT EXISTS idx_habits_due_date
  ON public.habits(due_date) WHERE due_date IS NOT NULL AND is_active = true;

-- 6. Seed default reminder_time for habits that don't have one
UPDATE public.habits
SET reminder_time = CASE period
  WHEN 'morning' THEN '07:00'::time
  WHEN 'afternoon' THEN '13:00'::time
  WHEN 'evening' THEN '19:00'::time
END
WHERE is_active = true AND reminder_time IS NULL;
