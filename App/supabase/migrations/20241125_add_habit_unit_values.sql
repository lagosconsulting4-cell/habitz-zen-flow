-- Add new values to habit_unit enum
ALTER TYPE habit_unit ADD VALUE IF NOT EXISTS 'hours';
ALTER TYPE habit_unit ADD VALUE IF NOT EXISTS 'pages';
ALTER TYPE habit_unit ADD VALUE IF NOT EXISTS 'liters';
