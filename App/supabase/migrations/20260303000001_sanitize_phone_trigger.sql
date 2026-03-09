-- Trigger to auto-sanitize phone numbers on INSERT/UPDATE
-- Removes all non-digit characters (whitespace, \r\n, +, -, parentheses, etc.)
-- Sets phone to NULL if result has fewer than 10 digits

CREATE OR REPLACE FUNCTION sanitize_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone IS NOT NULL THEN
    -- Remove all non-digit characters
    NEW.phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
    -- If result is empty or too short, set to NULL
    IF length(NEW.phone) < 10 THEN
      NEW.phone := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
DROP TRIGGER IF EXISTS trg_sanitize_phone ON profiles;
CREATE TRIGGER trg_sanitize_phone
  BEFORE INSERT OR UPDATE OF phone ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_phone();

-- Clean up any existing dirty data
UPDATE profiles
SET phone = regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone IS NOT NULL AND phone ~ '[^0-9]';

-- Set phones that became too short to NULL
UPDATE profiles
SET phone = NULL
WHERE phone IS NOT NULL AND length(phone) < 10;
