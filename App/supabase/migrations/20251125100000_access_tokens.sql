-- Access tokens for password setup and other token-based flows
-- Used by n8n workflow to create password setup links after purchase

CREATE TABLE IF NOT EXISTS public.access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'password_setup' CHECK (type IN ('password_setup', 'password_reset', 'email_verification')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS access_tokens_token_idx ON public.access_tokens (token);
CREATE INDEX IF NOT EXISTS access_tokens_email_idx ON public.access_tokens (lower(email));
CREATE INDEX IF NOT EXISTS access_tokens_expires_idx ON public.access_tokens (expires_at);

-- Enable RLS
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/update tokens (n8n workflow uses service role)
-- No select policy for regular users - token validation happens via Edge Function or service role

-- Function to validate and consume a token
CREATE OR REPLACE FUNCTION public.validate_access_token(p_token text)
RETURNS TABLE (
  is_valid boolean,
  token_email text,
  token_type text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_token_record access_tokens%ROWTYPE;
BEGIN
  -- Find the token
  SELECT * INTO v_token_record
  FROM access_tokens
  WHERE token = p_token;

  -- Token not found
  IF v_token_record.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::text, NULL::text, 'Token inválido ou não encontrado'::text;
    RETURN;
  END IF;

  -- Token already used
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, v_token_record.email, v_token_record.type, 'Este link já foi utilizado'::text;
    RETURN;
  END IF;

  -- Token expired
  IF v_token_record.expires_at < now() THEN
    RETURN QUERY SELECT false, v_token_record.email, v_token_record.type, 'Este link expirou'::text;
    RETURN;
  END IF;

  -- Token is valid
  RETURN QUERY SELECT true, v_token_record.email, v_token_record.type, NULL::text;
END;
$$;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION public.consume_access_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE access_tokens
  SET used_at = now()
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > now();

  RETURN FOUND;
END;
$$;

-- Grant execute on functions to anon and authenticated
GRANT EXECUTE ON FUNCTION public.validate_access_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_access_token(text) TO anon, authenticated;
