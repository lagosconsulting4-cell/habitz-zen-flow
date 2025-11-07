-- Pending purchases by email (for guest checkout before signup)
CREATE TABLE IF NOT EXISTS public.pending_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  provider text DEFAULT 'kiwify',
  provider_session_id text,
  provider_payment_intent text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','paid','failed','refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pending_purchases_email_idx ON public.pending_purchases (lower(email));
CREATE INDEX IF NOT EXISTS pending_purchases_status_idx ON public.pending_purchases (status);

-- No RLS needed; table is only written by Edge Functions with service role.

-- When a new auth user is created, attach any pending paid purchases for the same email
CREATE OR REPLACE FUNCTION public.attach_pending_purchases_to_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text := lower(NEW.email);
BEGIN
  -- Insert rows into purchases for any pending entries with matching email
  INSERT INTO public.purchases (user_id, provider, provider_session_id, provider_payment_intent, amount_cents, currency, status)
  SELECT NEW.id, p.provider, p.provider_session_id, p.provider_payment_intent, p.amount_cents, p.currency, p.status
  FROM public.pending_purchases p
  WHERE lower(p.email) = v_email
  ON CONFLICT (provider_session_id) DO NOTHING;

  -- If any of them are paid, mark profile premium; existing trigger on purchases also handles it.

  -- Clean up the pending rows (optional)
  DELETE FROM public.pending_purchases WHERE lower(email) = v_email;

  RETURN NEW;
END;
$$;

-- Attach to the same lifecycle as profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_attach_pending ON auth.users;
CREATE TRIGGER on_auth_user_created_attach_pending
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.attach_pending_purchases_to_user();
