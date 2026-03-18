-- Remove daily_limit from all users' notification_preferences
-- This field was set in early migrations (default: 3) but is never enforced
-- by any scheduler. Removing it prevents accidental enforcement in the future.

UPDATE user_progress
SET notification_preferences = notification_preferences - 'daily_limit'
WHERE notification_preferences ? 'daily_limit';
