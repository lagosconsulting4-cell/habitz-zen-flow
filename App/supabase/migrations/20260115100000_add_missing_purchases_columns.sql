-- =====================================================
-- Fix: Add missing columns to purchases table
-- =====================================================
-- The stripe-webhook Edge Function requires these columns
-- but they were not added in previous migrations.

-- Add email column for guest checkout tracking
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS email text;

-- Add trial_end_date for subscription trials
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz;

-- Add index on email for lookups
CREATE INDEX IF NOT EXISTS purchases_email_idx
  ON public.purchases (lower(email));

-- Comments
COMMENT ON COLUMN public.purchases.email IS 'Customer email (for purchases before user registration)';
COMMENT ON COLUMN public.purchases.trial_end_date IS 'End date of trial period for subscription';
