-- ============================================================================
-- LEADS FOLLOW-UP SYSTEM MIGRATION
-- ============================================================================
-- Adds follow-up tracking fields to quiz_responses table
-- Creates lead_interactions table for interaction history
-- Adds RLS policies for admin access
-- Follows patterns from 20251211000000_admin_system.sql and 20251223000000_create_quiz_responses.sql

-- ============================================================================
-- 1. EXTEND QUIZ_RESPONSES TABLE WITH FOLLOW-UP FIELDS
-- ============================================================================

ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS follow_up_status text DEFAULT 'novo' CHECK (
    follow_up_status IN ('novo', 'contactado', 'convertido', 'perdido')
  ),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS quiz_responses_follow_up_status_idx ON public.quiz_responses (follow_up_status);
CREATE INDEX IF NOT EXISTS quiz_responses_tags_idx ON public.quiz_responses USING GIN (tags);
CREATE INDEX IF NOT EXISTS quiz_responses_assigned_to_idx ON public.quiz_responses (assigned_to);

-- Add comments
COMMENT ON COLUMN public.quiz_responses.follow_up_status IS 'Status of follow-up: novo (new lead), contactado (contacted), convertido (converted to customer), perdido (lost)';
COMMENT ON COLUMN public.quiz_responses.notes IS 'Admin notes about the lead';
COMMENT ON COLUMN public.quiz_responses.tags IS 'Tags for categorizing and filtering leads';
COMMENT ON COLUMN public.quiz_responses.assigned_to IS 'Admin user assigned to follow up with this lead';

-- ============================================================================
-- 2. CREATE LEAD_INTERACTIONS TABLE
-- ============================================================================
-- Pattern: Similar to admin_audit_log from 20251211000000_admin_system.sql:31-56

CREATE TABLE IF NOT EXISTS public.lead_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which lead
  lead_id uuid NOT NULL REFERENCES public.quiz_responses(id) ON DELETE CASCADE,

  -- Who performed the interaction
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type of interaction
  type text NOT NULL CHECK (type IN (
    'note',           -- Admin added a note
    'call',           -- Phone call made
    'whatsapp',       -- WhatsApp message sent
    'email',          -- Email sent
    'status_change',  -- Status changed (novo -> contactado, etc.)
    'tag_added',      -- Tag added
    'tag_removed',    -- Tag removed
    'assigned'        -- Lead assigned to admin
  )),

  -- Content of the interaction
  content text,

  -- Additional metadata (old_status, new_status, etc.)
  metadata jsonb DEFAULT '{}'::jsonb,

  -- When
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS lead_interactions_lead_id_idx ON public.lead_interactions (lead_id);
CREATE INDEX IF NOT EXISTS lead_interactions_admin_user_id_idx ON public.lead_interactions (admin_user_id);
CREATE INDEX IF NOT EXISTS lead_interactions_created_at_idx ON public.lead_interactions (created_at DESC);
CREATE INDEX IF NOT EXISTS lead_interactions_type_idx ON public.lead_interactions (type);
CREATE INDEX IF NOT EXISTS lead_interactions_lead_date_idx ON public.lead_interactions (lead_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.lead_interactions IS 'Tracks all interactions with leads for follow-up history';

-- ============================================================================
-- 3. RLS POLICIES FOR ADMIN ACCESS TO QUIZ_RESPONSES
-- ============================================================================
-- Pattern: Follows 20251211000000_admin_system.sql:94-102

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Admins can view all quiz_responses" ON public.quiz_responses;
DROP POLICY IF EXISTS "Admins can update quiz_responses" ON public.quiz_responses;

-- Policy: Admins can view all quiz responses
CREATE POLICY "Admins can view all quiz_responses"
  ON public.quiz_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can update quiz responses (for follow-up actions)
CREATE POLICY "Admins can update quiz_responses"
  ON public.quiz_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 4. RLS POLICIES FOR LEAD_INTERACTIONS
-- ============================================================================

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Admins can view all lead_interactions" ON public.lead_interactions;
DROP POLICY IF EXISTS "Admins can insert lead_interactions" ON public.lead_interactions;

-- Policy: Admins can view all interactions
CREATE POLICY "Admins can view all lead_interactions"
  ON public.lead_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins can insert interactions
CREATE POLICY "Admins can insert lead_interactions"
  ON public.lead_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- 5. HELPER FUNCTIONS FOR LEAD MANAGEMENT
-- ============================================================================
-- Pattern: SECURITY DEFINER from 20251211000000_admin_system.sql:355-392

-- Function: Update lead status with automatic interaction logging
CREATE OR REPLACE FUNCTION public.update_lead_status(
  p_admin_id uuid,
  p_lead_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status text;
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Get current status
  SELECT follow_up_status INTO v_old_status
  FROM quiz_responses
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Lead not found';
    RETURN;
  END IF;

  -- Update status
  UPDATE quiz_responses
  SET
    follow_up_status = p_new_status,
    updated_at = now()
  WHERE id = p_lead_id;

  -- Log interaction
  INSERT INTO lead_interactions (
    lead_id, admin_user_id, type, content, metadata
  )
  VALUES (
    p_lead_id,
    p_admin_id,
    'status_change',
    p_note,
    jsonb_build_object('old_status', v_old_status, 'new_status', p_new_status)
  );

  RETURN QUERY SELECT true, 'Status updated successfully';
END;
$$;

COMMENT ON FUNCTION public.update_lead_status IS 'Updates lead status and logs interaction (admin only)';

-- Function: Add note to lead
CREATE OR REPLACE FUNCTION public.add_lead_note(
  p_admin_id uuid,
  p_lead_id uuid,
  p_note text
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Update notes field (append to existing notes)
  UPDATE quiz_responses
  SET
    notes = CASE
      WHEN notes IS NULL OR notes = '' THEN p_note
      ELSE notes || E'\n\n' || p_note
    END,
    updated_at = now()
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Lead not found';
    RETURN;
  END IF;

  -- Log interaction
  INSERT INTO lead_interactions (
    lead_id, admin_user_id, type, content
  )
  VALUES (
    p_lead_id,
    p_admin_id,
    'note',
    p_note
  );

  RETURN QUERY SELECT true, 'Note added successfully';
END;
$$;

COMMENT ON FUNCTION public.add_lead_note IS 'Adds a note to a lead and logs interaction (admin only)';

-- Function: Add tag to lead
CREATE OR REPLACE FUNCTION public.add_lead_tag(
  p_admin_id uuid,
  p_lead_id uuid,
  p_tag text
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Add tag (array_append handles duplicates)
  UPDATE quiz_responses
  SET
    tags = array_append(tags, p_tag),
    updated_at = now()
  WHERE id = p_lead_id
    AND NOT (tags @> ARRAY[p_tag]); -- Only add if not already present

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Lead not found or tag already exists';
    RETURN;
  END IF;

  -- Log interaction
  INSERT INTO lead_interactions (
    lead_id, admin_user_id, type, content
  )
  VALUES (
    p_lead_id,
    p_admin_id,
    'tag_added',
    p_tag
  );

  RETURN QUERY SELECT true, 'Tag added successfully';
END;
$$;

COMMENT ON FUNCTION public.add_lead_tag IS 'Adds a tag to a lead and logs interaction (admin only)';

-- Function: Remove tag from lead
CREATE OR REPLACE FUNCTION public.remove_lead_tag(
  p_admin_id uuid,
  p_lead_id uuid,
  p_tag text
)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin
  IF NOT is_user_admin(p_admin_id) THEN
    RETURN QUERY SELECT false, 'Not authorized: User is not an admin';
    RETURN;
  END IF;

  -- Remove tag
  UPDATE quiz_responses
  SET
    tags = array_remove(tags, p_tag),
    updated_at = now()
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Lead not found';
    RETURN;
  END IF;

  -- Log interaction
  INSERT INTO lead_interactions (
    lead_id, admin_user_id, type, content
  )
  VALUES (
    p_lead_id,
    p_admin_id,
    'tag_removed',
    p_tag
  );

  RETURN QUERY SELECT true, 'Tag removed successfully';
END;
$$;

COMMENT ON FUNCTION public.remove_lead_tag IS 'Removes a tag from a lead and logs interaction (admin only)';

-- ============================================================================
-- 6. ANALYTICS VIEW FOR LEADS SUMMARY
-- ============================================================================
-- Pattern: Similar to admin views from 20251211000000_admin_system.sql:569-631

CREATE OR REPLACE VIEW public.admin_leads_summary AS
SELECT
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE follow_up_status = 'novo') AS new_leads,
  COUNT(*) FILTER (WHERE follow_up_status = 'contactado') AS contacted_leads,
  COUNT(*) FILTER (WHERE follow_up_status = 'convertido') AS converted_leads,
  COUNT(*) FILTER (WHERE follow_up_status = 'perdido') AS lost_leads,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS customer_conversions,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate_percent,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS leads_today,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') AS leads_7d,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') AS leads_30d,
  COUNT(DISTINCT CASE WHEN utm_source IS NOT NULL THEN utm_source END) AS utm_sources_count,
  COUNT(DISTINCT CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN id END) AS leads_with_tags
FROM public.quiz_responses;

COMMENT ON VIEW public.admin_leads_summary IS 'Summary statistics for leads dashboard';

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.update_lead_status(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_lead_note(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_lead_tag(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_lead_tag(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
