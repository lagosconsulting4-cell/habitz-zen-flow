-- ============================================================================
-- DICEBEAR AVATAR CONFIG
-- ============================================================================
-- Adds avatar_config JSONB column to profiles for DiceBear avataaars style.
-- Replaces the legacy icon-based avatar system (avatars + user_avatars tables).
-- When avatar_config IS NULL, the app renders a default DiceBear avatar.

-- 1. Add avatar_config column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_config jsonb DEFAULT NULL;

COMMENT ON COLUMN public.profiles.avatar_config IS
  'DiceBear avataaars config JSON. When non-null, replaces legacy equipped_avatar_emoji.';

-- 2. RPC to save avatar config atomically
CREATE OR REPLACE FUNCTION public.save_avatar_config(
  p_user_id uuid,
  p_config jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET avatar_config = p_config,
      updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user_id %', p_user_id
      USING ERRCODE = 'invalid_parameter_value';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_avatar_config(uuid, jsonb) TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
