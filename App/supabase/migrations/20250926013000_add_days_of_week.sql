-- Add days_of_week column to habits for weekly scheduling
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS days_of_week smallint[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}'::smallint[];

-- Ensure every value is between 0 (domingo) and 6 (sabado)
ALTER TABLE public.habits
  ADD CONSTRAINT habits_days_of_week_valid
  CHECK (
    array_length(days_of_week, 1) >= 1
    AND days_of_week <@ ARRAY[0,1,2,3,4,5,6]::smallint[]
  );
