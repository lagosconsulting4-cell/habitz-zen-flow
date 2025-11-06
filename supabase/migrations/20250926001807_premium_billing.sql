-- Add premium flags to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_since timestamptz;

-- Create purchases table to register lifetime payments
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text DEFAULT 'stripe',
  provider_session_id text,
  provider_payment_intent text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'failed', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Ensure useful indexes
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON public.purchases (user_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx ON public.purchases (status);

-- Enable RLS and policies so only owners can read
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their purchases" ON public.purchases;
CREATE POLICY "Users can view their purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their purchases" ON public.purchases;
CREATE POLICY "Users can update their purchases"
  ON public.purchases
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Keep updated_at in sync
DROP TRIGGER IF EXISTS update_purchases_updated_at ON public.purchases;
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- When a purchase is paid, mark the profile as premium
CREATE OR REPLACE FUNCTION public.handle_paid_purchase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    UPDATE public.profiles
    SET is_premium = true,
        premium_since = COALESCE(public.profiles.premium_since, now()),
        updated_at = now()
    WHERE public.profiles.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS purchases_set_premium ON public.purchases;
CREATE TRIGGER purchases_set_premium
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_paid_purchase();
