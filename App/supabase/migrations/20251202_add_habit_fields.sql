-- Migration: Add additional fields to habits table for richer data
-- Date: 2024-12-02
-- Description: Adds reminder_time, duration, priority, template_id, recommendation_score, and source

-- Add reminder_time for notification scheduling
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reminder_time TIME;

-- Add duration in minutes (how long the habit takes to complete)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Add priority for ordering habits (1-10, higher = more important)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5;

-- Add template_id to track which template the habit was created from
ALTER TABLE habits ADD COLUMN IF NOT EXISTS template_id TEXT;

-- Add recommendation_score from the algorithm (0-100)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS recommendation_score DECIMAL;

-- Add source to distinguish habit origin (onboarding, manual, import, etc)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Add comment for documentation
COMMENT ON COLUMN habits.reminder_time IS 'Time of day for habit reminder notification';
COMMENT ON COLUMN habits.duration_minutes IS 'Expected duration to complete the habit in minutes';
COMMENT ON COLUMN habits.priority IS 'Priority level 1-10, higher is more important';
COMMENT ON COLUMN habits.template_id IS 'Reference to the habit template used to create this habit';
COMMENT ON COLUMN habits.recommendation_score IS 'Algorithm score that determined this habit recommendation';
COMMENT ON COLUMN habits.source IS 'Origin of the habit: onboarding, manual, import';
