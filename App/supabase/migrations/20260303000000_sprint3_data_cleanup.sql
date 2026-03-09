-- Sprint 3: Data Cleanup
-- Fixes corrupted data from bugs #5 and #6

-- 3.1: Deactivate "once" habits with due_date in the past (they'll never trigger)
UPDATE habits
SET is_active = false, updated_at = NOW()
WHERE frequency_type = 'once'
  AND due_date < CURRENT_DATE
  AND is_active = true;

-- 3.2: Clean phone numbers with \r\n characters (bug #5)
UPDATE profiles
SET phone = TRIM(BOTH E'\r\n' FROM phone), updated_at = NOW()
WHERE phone LIKE E'%\r%' OR phone LIKE E'%\n%';

-- 3.3: Re-order whatsapp_conversations messages ASC + remove nulls
UPDATE public.whatsapp_conversations
SET messages = (
  SELECT COALESCE(
    jsonb_agg(elem ORDER BY (elem->>'timestamp')::timestamptz ASC),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(messages) elem
  WHERE elem IS NOT NULL
    AND elem->>'role' IS NOT NULL
    AND elem->>'content' IS NOT NULL
)
WHERE messages IS NOT NULL
  AND jsonb_array_length(messages) > 0;
