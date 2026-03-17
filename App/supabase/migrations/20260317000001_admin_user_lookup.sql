-- Admin function: search users by email, display_name, or UUID
-- Uses SECURITY DEFINER to access auth.users (otherwise restricted)
-- Only callable by authenticated users; admin-only pages enforce the rest via ProtectedRoute

CREATE OR REPLACE FUNCTION admin_find_user(search_term text)
RETURNS TABLE (user_id uuid, display_name text, email text, is_premium boolean)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    u.email,
    p.is_premium
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE
    u.email ILIKE '%' || search_term || '%'
    OR p.display_name ILIKE '%' || search_term || '%'
    OR p.user_id::text = search_term
  ORDER BY p.display_name
  LIMIT 8;
END;
$$;

REVOKE ALL ON FUNCTION admin_find_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_find_user(text) TO authenticated;
