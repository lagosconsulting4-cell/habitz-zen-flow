-- Remove old category constraint and add new one with updated categories
-- This fixes the issue where CreateHabit.tsx sends English category names
-- but the database only accepted Portuguese names

-- Drop the old constraint
ALTER TABLE public.habits DROP CONSTRAINT IF EXISTS habits_category_check;

-- Add new constraint with both old and new category values for compatibility
ALTER TABLE public.habits ADD CONSTRAINT habits_category_check
  CHECK (category IN (
    -- Old categories (Portuguese)
    'mente', 'corpo', 'estudo', 'carreira', 'relacionamento', 'financeiro', 'outro',
    -- New categories (English - matching CreateHabit.tsx)
    'productivity', 'fitness', 'nutrition', 'time_routine', 'avoid'
  ));

-- Add comment for documentation
COMMENT ON COLUMN public.habits.category IS 'Habit category. Accepts both old Portuguese names and new English names for compatibility';
