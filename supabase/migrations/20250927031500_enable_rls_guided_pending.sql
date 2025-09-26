-- Enable RLS and policies for guided_days and pending_purchases
ALTER TABLE IF EXISTS public.guided_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_purchases ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'guided_days'
      AND policyname = 'Guided days are public read'
  ) THEN
    CREATE POLICY "Guided days are public read"
      ON public.guided_days
      FOR SELECT
      USING (true);
  END IF;
END
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pending_purchases'
      AND policyname = 'Pending purchases service role access'
  ) THEN
    CREATE POLICY "Pending purchases service role access"
      ON public.pending_purchases
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$ LANGUAGE plpgsql;