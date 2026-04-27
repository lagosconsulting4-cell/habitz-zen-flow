-- Add phone column to pending_purchases so that guest checkouts (currently kiwify)
-- can preserve the customer's phone until the user signs up. The
-- attach_pending_purchases_to_user trigger then backfills profiles.phone if it's NULL.
-- Without this, guest payers had no phone link to their WhatsApp until manual support fix.

ALTER TABLE public.pending_purchases ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS pending_purchases_phone_idx ON public.pending_purchases (phone);

CREATE OR REPLACE FUNCTION public.attach_pending_purchases_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text := lower(NEW.email);
  v_phone text;
BEGIN
  INSERT INTO public.purchases (user_id, provider, provider_session_id, provider_payment_intent, amount_cents, currency, status)
  SELECT NEW.id, p.provider, p.provider_session_id, p.provider_payment_intent, p.amount_cents, p.currency, p.status
  FROM public.pending_purchases p
  WHERE lower(p.email) = v_email
    AND p.provider_session_id IS NOT NULL
  ON CONFLICT (provider_session_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    updated_at = NOW();

  SELECT phone INTO v_phone
  FROM public.pending_purchases
  WHERE lower(email) = v_email
    AND phone IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_phone IS NOT NULL THEN
    UPDATE public.profiles
    SET phone = v_phone, updated_at = NOW()
    WHERE user_id = NEW.id
      AND phone IS NULL;
  END IF;

  DELETE FROM public.pending_purchases WHERE lower(email) = v_email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'attach_pending_purchases_to_user failed for %: %', v_email, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.attach_pending_purchases_to_user IS
'Attaches pending purchases to newly created users and backfills profiles.phone from the most recent pending row when profile has no phone yet.';
