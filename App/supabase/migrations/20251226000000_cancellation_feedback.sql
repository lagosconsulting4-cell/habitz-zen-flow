-- Create cancellation_feedback table to store user feedback when canceling subscriptions
CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for user lookups
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON public.cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_created_at ON public.cancellation_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own cancellation feedback"
  ON public.cancellation_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own feedback
CREATE POLICY "Users can read own cancellation feedback"
  ON public.cancellation_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can read all feedback
CREATE POLICY "Admins can read all cancellation feedback"
  ON public.cancellation_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add comment
COMMENT ON TABLE public.cancellation_feedback IS 'Stores user feedback and reasons when canceling subscriptions';
