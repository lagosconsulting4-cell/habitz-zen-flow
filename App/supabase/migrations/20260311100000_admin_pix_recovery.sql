-- ============================================================================
-- ADMIN: PIX RECOVERY - Open purchases management
-- ============================================================================
-- Views to identify Pix payments generated but never paid.
-- Combines data from purchases (logged-in users) and pending_purchases (guests).

-- ============================================================================
-- 1. TRACKING TABLE - Track which records have been exported
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pix_recovery_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL CHECK (source_table IN ('purchases', 'pending_purchases')),
  source_id uuid NOT NULL,
  exported_at timestamptz NOT NULL DEFAULT now(),
  exported_by uuid REFERENCES auth.users(id),
  campaign_name text DEFAULT 'manual_export',
  UNIQUE (source_table, source_id)
);

CREATE INDEX IF NOT EXISTS idx_pix_recovery_exports_source
  ON public.pix_recovery_exports (source_table, source_id);

ALTER TABLE public.pix_recovery_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pix recovery exports"
  ON public.pix_recovery_exports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 2. ADMIN POLICY - pending_purchases read access for admin view
-- ============================================================================

CREATE POLICY "Admins can view pending purchases"
  ON public.pending_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 3. VIEW - All open Pix purchases (UNION of purchases + pending_purchases)
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_pix_recovery AS

-- Part A: From purchases table (logged-in users who generated Pix)
SELECT
  p.id,
  'purchases'::text AS source_table,
  COALESCE(p.email, pr.email) AS email,
  pr.display_name AS name,
  pr.phone,
  p.product_names,
  p.provider,
  p.payment_method,
  p.amount_cents,
  p.currency,
  p.status,
  p.created_at,
  p.updated_at,
  pre.exported_at,
  CASE
    WHEN p.created_at >= NOW() - INTERVAL '24 hours' THEN 'fresh'
    WHEN p.created_at >= NOW() - INTERVAL '3 days' THEN 'recent'
    WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 'aging'
    ELSE 'stale'
  END AS urgency,
  CASE
    WHEN p.product_names ILIKE '%foquinha%' THEN 'Foquinha AI'
    WHEN p.product_names ILIKE '%bora%' THEN 'Bora App'
    WHEN p.product_names IS NULL AND p.provider = 'kiwify' THEN 'Bora App'
    ELSE COALESCE(p.product_names, 'Desconhecido')
  END AS product_label
FROM public.purchases p
LEFT JOIN public.profiles pr ON pr.user_id = p.user_id
LEFT JOIN public.pix_recovery_exports pre
  ON pre.source_table = 'purchases' AND pre.source_id = p.id
WHERE p.status = 'open'

UNION ALL

-- Part B: From pending_purchases table (guest checkout, no user account)
SELECT
  pp.id,
  'pending_purchases'::text AS source_table,
  pp.email,
  NULL::text AS name,
  NULL::text AS phone,
  pp.product_names,
  pp.provider,
  NULL::text AS payment_method,
  pp.amount_cents,
  pp.currency,
  pp.status,
  pp.created_at,
  pp.created_at AS updated_at,
  pre.exported_at,
  CASE
    WHEN pp.created_at >= NOW() - INTERVAL '24 hours' THEN 'fresh'
    WHEN pp.created_at >= NOW() - INTERVAL '3 days' THEN 'recent'
    WHEN pp.created_at >= NOW() - INTERVAL '7 days' THEN 'aging'
    ELSE 'stale'
  END AS urgency,
  CASE
    WHEN pp.product_names ILIKE '%foquinha%' THEN 'Foquinha AI'
    WHEN pp.product_names ILIKE '%bora%' THEN 'Bora App'
    ELSE COALESCE(pp.product_names, 'Desconhecido')
  END AS product_label
FROM public.pending_purchases pp
LEFT JOIN public.pix_recovery_exports pre
  ON pre.source_table = 'pending_purchases' AND pre.source_id = pp.id
WHERE pp.status = 'open'
  AND NOT EXISTS (
    SELECT 1 FROM public.purchases p2
    WHERE lower(p2.email) = lower(pp.email)
      AND p2.status = 'open'
  );

-- ============================================================================
-- 4. SUMMARY VIEW - Quick counts by product and urgency
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_pix_recovery_summary AS
SELECT
  COUNT(*)::int AS total_open,
  COUNT(*) FILTER (WHERE product_label = 'Bora App')::int AS bora_open,
  COUNT(*) FILTER (WHERE product_label = 'Foquinha AI')::int AS foquinha_open,
  COUNT(*) FILTER (WHERE product_label NOT IN ('Bora App', 'Foquinha AI'))::int AS other_open,
  COUNT(*) FILTER (WHERE urgency = 'fresh')::int AS fresh_count,
  COUNT(*) FILTER (WHERE urgency = 'recent')::int AS recent_count,
  COUNT(*) FILTER (WHERE urgency = 'aging')::int AS aging_count,
  COUNT(*) FILTER (WHERE urgency = 'stale')::int AS stale_count,
  COUNT(*) FILTER (WHERE exported_at IS NOT NULL)::int AS already_exported,
  COUNT(*) FILTER (WHERE exported_at IS NULL)::int AS not_exported,
  COALESCE(SUM(amount_cents), 0)::bigint AS total_amount_cents
FROM public.admin_pix_recovery;

-- ============================================================================
-- 5. RPC - Bulk mark as exported
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_pix_recovery_exported(
  p_ids uuid[],
  p_source_tables text[],
  p_campaign_name text DEFAULT 'manual_export'
)
RETURNS integer
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  affected integer := 0;
  i integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR i IN 1..array_length(p_ids, 1) LOOP
    INSERT INTO public.pix_recovery_exports (source_table, source_id, exported_by, campaign_name)
    VALUES (p_source_tables[i], p_ids[i], auth.uid(), p_campaign_name)
    ON CONFLICT (source_table, source_id) DO UPDATE SET
      exported_at = NOW(),
      exported_by = auth.uid(),
      campaign_name = p_campaign_name;
    affected := affected + 1;
  END LOOP;

  RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_pix_recovery_exported TO authenticated;

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

GRANT SELECT ON public.admin_pix_recovery TO authenticated;
GRANT SELECT ON public.admin_pix_recovery_summary TO authenticated;
