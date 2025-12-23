-- Migration: Add Stripe subscription support to purchases table
-- Date: 2025-12-22
-- Purpose: Track subscriptions and handle cancellations properly

-- Add fields for Stripe subscription tracking
ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_interval text CHECK (billing_interval IN ('month', 'year'));

-- Add index for faster subscription lookups
CREATE INDEX IF NOT EXISTS purchases_stripe_subscription_id_idx
  ON public.purchases (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS purchases_stripe_customer_id_idx
  ON public.purchases (stripe_customer_id);

-- Update trigger to handle premium activation AND deactivation
CREATE OR REPLACE FUNCTION public.handle_paid_purchase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Activate premium when status is 'paid'
  IF NEW.status = 'paid' THEN
    UPDATE public.profiles
    SET is_premium = true,
        premium_since = COALESCE(public.profiles.premium_since, now()),
        updated_at = now()
    WHERE public.profiles.user_id = NEW.user_id;

  -- Deactivate premium when status is 'refunded' or 'failed'
  -- BUT only if there are NO other active paid purchases for this user
  ELSIF NEW.status IN ('refunded', 'failed') THEN
    -- Check if user has any other active (paid) purchases
    IF NOT EXISTS (
      SELECT 1
      FROM public.purchases
      WHERE user_id = NEW.user_id
        AND status = 'paid'
        AND id != NEW.id
    ) THEN
      -- No other active purchases, deactivate premium
      UPDATE public.profiles
      SET is_premium = false,
          updated_at = now()
      WHERE public.profiles.user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger (already exists, but ensuring it uses updated function)
DROP TRIGGER IF EXISTS purchases_set_premium ON public.purchases;
CREATE TRIGGER purchases_set_premium
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paid_purchase();

-- Add comment for documentation
COMMENT ON COLUMN public.purchases.stripe_customer_id IS 'Stripe Customer ID (cus_...)';
COMMENT ON COLUMN public.purchases.stripe_subscription_id IS 'Stripe Subscription ID (sub_...)';
COMMENT ON COLUMN public.purchases.billing_interval IS 'Billing frequency: month or year';
