-- =====================================================
-- Fix: Add missing UNIQUE constraint for pending purchases trigger
-- =====================================================
-- The attach_pending_purchases_to_user() trigger uses ON CONFLICT (provider_session_id)
-- but the purchases table doesn't have a UNIQUE constraint on this column.
-- This causes "Database error creating new user" when any trigger on auth.users fails.

-- 1. Add UNIQUE constraint on provider_session_id (if not null)
-- Using a partial unique index to allow multiple NULL values
CREATE UNIQUE INDEX IF NOT EXISTS purchases_provider_session_id_unique_idx
  ON public.purchases (provider_session_id)
  WHERE provider_session_id IS NOT NULL;

-- 2. Also add unique index on stripe_subscription_id for the updated upsert logic
CREATE UNIQUE INDEX IF NOT EXISTS purchases_stripe_subscription_id_unique_idx
  ON public.purchases (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- 3. Update the attach_pending_purchases_to_user function to be more robust
CREATE OR REPLACE FUNCTION public.attach_pending_purchases_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text := lower(NEW.email);
BEGIN
  -- Insert rows into purchases for any pending entries with matching email
  -- Use a more robust conflict handling
  INSERT INTO public.purchases (user_id, provider, provider_session_id, provider_payment_intent, amount_cents, currency, status)
  SELECT NEW.id, p.provider, p.provider_session_id, p.provider_payment_intent, p.amount_cents, p.currency, p.status
  FROM public.pending_purchases p
  WHERE lower(p.email) = v_email
    AND p.provider_session_id IS NOT NULL
  ON CONFLICT (provider_session_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    updated_at = NOW();

  -- Clean up the pending rows
  DELETE FROM public.pending_purchases WHERE lower(email) = v_email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail user creation if pending purchase attach fails
    RAISE WARNING 'attach_pending_purchases_to_user failed for %: %', v_email, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.attach_pending_purchases_to_user IS
'Attaches pending purchases to newly created users. Includes error handling to prevent blocking user creation.';
