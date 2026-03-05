-- =====================================================
-- Product Differentiation: Backfill + pending_purchases + trigger
-- =====================================================
-- Enables differentiating Bora App vs Foquinha AI users via purchases.product_names.
-- Hubla already saves product_names. Stripe was fixed (Task #15). Kiwify is inactive.

-- 1. Backfill existing Kiwify purchases (all are "Bora App" - only product sold via Kiwify)
UPDATE public.purchases
SET product_names = 'Bora App', updated_at = NOW()
WHERE provider = 'kiwify'
  AND product_names IS NULL;

-- NOTE: Stripe purchases with NULL product_names are NOT backfilled.
-- Stripe sells both Bora and Foquinha, so we can't determine retroactively.
-- The frontend hook uses profiles.phone as fallback for legacy users.

-- 2. Add product_names column to pending_purchases (for future integrations)
ALTER TABLE public.pending_purchases
  ADD COLUMN IF NOT EXISTS product_names text;

-- 3. Update trigger to transfer product_names from pending_purchases to purchases
CREATE OR REPLACE FUNCTION public.attach_pending_purchases_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text := lower(NEW.email);
BEGIN
  -- Insert rows into purchases for any pending entries with matching email
  INSERT INTO public.purchases (user_id, provider, provider_session_id, provider_payment_intent, amount_cents, currency, status, product_names)
  SELECT NEW.id, p.provider, p.provider_session_id, p.provider_payment_intent, p.amount_cents, p.currency, p.status, p.product_names
  FROM public.pending_purchases p
  WHERE lower(p.email) = v_email
    AND p.provider_session_id IS NOT NULL
  ON CONFLICT (provider_session_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    product_names = COALESCE(EXCLUDED.product_names, purchases.product_names),
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
'Attaches pending purchases to newly created users. Transfers product_names for product differentiation. Includes error handling to prevent blocking user creation.';
