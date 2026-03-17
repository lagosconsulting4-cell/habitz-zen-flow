-- ============================================================
-- quiz_responses: deduplication + upsert-by-email trigger
--
-- Problem: /bora (external landing page) does plain INSERTs, so
-- repeated quiz submissions create duplicate rows per email.
--
-- Solution (no external system changes needed):
--   1. Add submission_count column
--   2. Deduplicate existing rows (keep most recent, merge CRM fields)
--   3. Add UNIQUE INDEX on lower(email)
--   4. BEFORE INSERT trigger converts duplicate INSERTs → UPDATEs
-- ============================================================

-- ============================================================
-- STEP 1: Add submission_count column
-- ============================================================
ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS submission_count integer NOT NULL DEFAULT 1;

-- ============================================================
-- STEP 2: Deduplicate existing rows
-- For each email (case-insensitive):
--   - Keep the most recent row (by created_at)
--   - Merge CRM fields from ALL rows for that email
--   - Set submission_count = total rows for that email
--   - Delete all older rows
-- ============================================================

-- 2a. Update most-recent row per email with merged CRM data + count
WITH agg AS (
  SELECT
    lower(email)                                                                AS email_lower,
    COUNT(*)                                                                    AS total_count,
    BOOL_OR(converted_to_customer)                                              AS any_converted,
    BOOL_OR(onboarding_completed)                                               AS any_onboarded,
    (ARRAY_REMOVE(ARRAY_AGG(user_id ORDER BY linked_at NULLS LAST), NULL))[1]  AS merged_user_id,
    MAX(linked_at)                                                              AS max_linked_at
  FROM public.quiz_responses
  GROUP BY lower(email)
),
most_recent AS (
  SELECT DISTINCT ON (lower(email)) id
  FROM public.quiz_responses
  ORDER BY lower(email), created_at DESC
)
UPDATE public.quiz_responses qr
SET
  submission_count      = agg.total_count,
  converted_to_customer = agg.any_converted,
  onboarding_completed  = agg.any_onboarded,
  user_id               = agg.merged_user_id,
  linked_at             = agg.max_linked_at
FROM agg
JOIN most_recent mr ON true
WHERE lower(qr.email) = agg.email_lower
  AND qr.id = mr.id;

-- 2b. Delete all but the most-recent row per email
DELETE FROM public.quiz_responses
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY lower(email) ORDER BY created_at DESC) AS rn
    FROM public.quiz_responses
  ) ranked
  WHERE rn > 1
);

-- ============================================================
-- STEP 3: Replace non-unique lower(email) indexes with a UNIQUE one
-- (table is clean now — no duplicates remain)
-- ============================================================
DROP INDEX IF EXISTS public.quiz_responses_email_lower_idx;
DROP INDEX IF EXISTS public.idx_quiz_responses_email_lower;
DROP INDEX IF EXISTS public.quiz_responses_email_idx;

CREATE UNIQUE INDEX quiz_responses_email_unique
  ON public.quiz_responses (lower(email));

-- ============================================================
-- STEP 4: Trigger — converts duplicate INSERTs into UPDATEs
--
-- Fields OVERWRITTEN (new quiz answers):
--   name, phone, age_range, profession, work_schedule, gender,
--   financial_range, energy_peak, time_available, objective,
--   challenges, consistency_feeling, projected_feeling,
--   years_promising, week_days, week_days_preset,
--   recommended_habits, completed
--
-- Fields PRESERVED (CRM / onboarding / email system):
--   id, created_at, user_id, linked_at, converted_to_customer,
--   onboarding_completed, follow_up_status, notes, tags,
--   assigned_to, last_email_sequence_id, last_email_sent_at,
--   email_unsubscribed, last_campaign_sent_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.quiz_responses_upsert_fn()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.quiz_responses
    WHERE lower(email) = lower(NEW.email)
  ) THEN
    UPDATE public.quiz_responses SET
      name                = NEW.name,
      phone               = NEW.phone,
      age_range           = NEW.age_range,
      profession          = NEW.profession,
      work_schedule       = NEW.work_schedule,
      gender              = NEW.gender,
      financial_range     = NEW.financial_range,
      energy_peak         = NEW.energy_peak,
      time_available      = NEW.time_available,
      objective           = NEW.objective,
      challenges          = NEW.challenges,
      consistency_feeling = NEW.consistency_feeling,
      projected_feeling   = NEW.projected_feeling,
      years_promising     = NEW.years_promising,
      week_days           = NEW.week_days,
      week_days_preset    = NEW.week_days_preset,
      recommended_habits  = NEW.recommended_habits,
      completed           = NEW.completed,
      -- UTM: only overwrite if the new submission has a value
      source              = COALESCE(NEW.source, source),
      utm_source          = COALESCE(NEW.utm_source, utm_source),
      utm_medium          = COALESCE(NEW.utm_medium, utm_medium),
      utm_campaign        = COALESCE(NEW.utm_campaign, utm_campaign),
      -- Bookkeeping
      submission_count    = submission_count + 1,
      updated_at          = now()
    WHERE lower(email) = lower(NEW.email);

    RETURN NULL; -- Cancel the INSERT (row already updated above)
  END IF;

  RETURN NEW; -- New email — proceed with INSERT as normal
END;
$$;

CREATE TRIGGER quiz_responses_before_insert
  BEFORE INSERT ON public.quiz_responses
  FOR EACH ROW EXECUTE FUNCTION public.quiz_responses_upsert_fn();
