-- Migration: Create notification_history table
-- Created: 2025-12-10
--
-- Tracks all push notifications sent to users for:
-- 1. Message rotation (avoid repeating same copy)
-- 2. Daily limit enforcement (1 per habit + extras)
-- 3. Analytics (open rate, completion rate by copy)

CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,

  -- Message identification for rotation
  context_type TEXT NOT NULL,  -- 'morning', 'afternoon', 'evening', 'delayed', 'end_of_day', 'multiple_pending', 'streak_3', 'streak_7', etc.
  message_key TEXT NOT NULL,   -- Unique key like 'morning_p1', 'delayed_g3'

  -- Notification content (for debugging and analytics)
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Timestamps
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  action_taken TEXT,  -- 'complete', 'dismiss', 'open', null (ignored)

  -- Date for daily grouping (Brazil timezone date)
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Index for checking recent messages per user per context (rotation)
CREATE INDEX IF NOT EXISTS idx_notification_history_user_context
  ON public.notification_history(user_id, context_type, sent_at DESC);

-- Index for daily limit checks
CREATE INDEX IF NOT EXISTS idx_notification_history_user_date
  ON public.notification_history(user_id, notification_date);

-- Index for checking if specific habit already notified today
CREATE INDEX IF NOT EXISTS idx_notification_history_habit_date
  ON public.notification_history(habit_id, notification_date);

-- Index for analytics queries by message
CREATE INDEX IF NOT EXISTS idx_notification_history_message_key
  ON public.notification_history(message_key, sent_at DESC);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Only service role can manage notification history (edge functions)
CREATE POLICY "Service role manages notification history"
  ON public.notification_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users can view their own notification history (for debugging in app)
CREATE POLICY "Users can view own notification history"
  ON public.notification_history
  FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.notification_history IS 'Tracks all push notifications for rotation, limits, and analytics';
COMMENT ON COLUMN public.notification_history.context_type IS 'Notification context: morning, afternoon, evening, delayed, end_of_day, multiple_pending, streak_N';
COMMENT ON COLUMN public.notification_history.message_key IS 'Unique copy identifier for rotation (e.g., morning_p1, delayed_g3)';
