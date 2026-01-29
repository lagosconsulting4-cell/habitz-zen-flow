-- ============================================================================
-- LEADS ANALYTICS VIEWS MIGRATION
-- ============================================================================
-- Creates analytical views for leads dashboard
-- Follows pattern from 20251211000000_admin_system.sql:564-633

-- ============================================================================
-- 1. FUNNEL VIEW - Conversion funnel stages
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_funnel AS
SELECT
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE completed = true) AS completed_quiz,
  COUNT(*) FILTER (WHERE follow_up_status = 'contactado') AS contacted,
  COUNT(*) FILTER (WHERE follow_up_status = 'convertido') AS converted,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS customers,
  ROUND(
    (COUNT(*) FILTER (WHERE completed = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE follow_up_status = 'contactado')::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS contact_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses;

COMMENT ON VIEW public.admin_leads_funnel IS 'Conversion funnel metrics for leads dashboard';

-- ============================================================================
-- 2. DEMOGRAPHICS VIEWS - Segmentation by demographics
-- ============================================================================

-- By Age Range
CREATE OR REPLACE VIEW public.admin_leads_by_age AS
SELECT
  COALESCE(age_range, 'Não informado') AS age_range,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
GROUP BY age_range
ORDER BY total DESC;

COMMENT ON VIEW public.admin_leads_by_age IS 'Lead distribution by age range';

-- By Profession
CREATE OR REPLACE VIEW public.admin_leads_by_profession AS
SELECT
  COALESCE(profession, 'Não informado') AS profession,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
GROUP BY profession
ORDER BY total DESC;

COMMENT ON VIEW public.admin_leads_by_profession IS 'Lead distribution by profession';

-- By Objective
CREATE OR REPLACE VIEW public.admin_leads_by_objective AS
SELECT
  COALESCE(objective, 'Não informado') AS objective,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
GROUP BY objective
ORDER BY total DESC;

COMMENT ON VIEW public.admin_leads_by_objective IS 'Lead distribution by objective';

-- By Financial Range
CREATE OR REPLACE VIEW public.admin_leads_by_financial_range AS
SELECT
  COALESCE(financial_range, 'Não informado') AS financial_range,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
GROUP BY financial_range
ORDER BY total DESC;

COMMENT ON VIEW public.admin_leads_by_financial_range IS 'Lead distribution by financial range';

-- By Gender
CREATE OR REPLACE VIEW public.admin_leads_by_gender AS
SELECT
  COALESCE(gender, 'Não informado') AS gender,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
GROUP BY gender
ORDER BY total DESC;

COMMENT ON VIEW public.admin_leads_by_gender IS 'Lead distribution by gender';

-- ============================================================================
-- 3. UTM TRACKING VIEW - Marketing attribution
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_by_utm AS
SELECT
  COALESCE(utm_source, 'direct') AS utm_source,
  COALESCE(utm_medium, 'none') AS utm_medium,
  COALESCE(utm_campaign, 'none') AS utm_campaign,
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate,
  MIN(created_at) AS first_lead_date,
  MAX(created_at) AS last_lead_date
FROM public.quiz_responses
GROUP BY utm_source, utm_medium, utm_campaign
ORDER BY total_leads DESC;

COMMENT ON VIEW public.admin_leads_by_utm IS 'Lead attribution by UTM parameters';

-- ============================================================================
-- 4. TEMPORAL TRENDS VIEW - Leads over time
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_temporal AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE completed = true) AS completed,
  COUNT(*) FILTER (WHERE follow_up_status = 'contactado') AS contacted,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW public.admin_leads_temporal IS 'Daily lead metrics for last 90 days';

-- Weekly aggregation
CREATE OR REPLACE VIEW public.admin_leads_temporal_weekly AS
SELECT
  DATE_TRUNC('week', created_at)::date AS week_start,
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE completed = true) AS completed,
  COUNT(*) FILTER (WHERE follow_up_status = 'contactado') AS contacted,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
WHERE created_at >= CURRENT_DATE - INTERVAL '180 days'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week_start DESC;

COMMENT ON VIEW public.admin_leads_temporal_weekly IS 'Weekly lead metrics for last 180 days';

-- ============================================================================
-- 5. HEATMAP VIEW - Time-of-day and day-of-week analysis
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_heatmap AS
SELECT
  EXTRACT(DOW FROM created_at)::integer AS day_of_week, -- 0 = Sunday, 6 = Saturday
  EXTRACT(HOUR FROM created_at)::integer AS hour_of_day,
  COUNT(*) AS lead_count,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted_count,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY
  EXTRACT(DOW FROM created_at),
  EXTRACT(HOUR FROM created_at)
ORDER BY day_of_week, hour_of_day;

COMMENT ON VIEW public.admin_leads_heatmap IS 'Lead distribution by day of week and hour of day';

-- ============================================================================
-- 6. SOURCE PERFORMANCE VIEW - Aggregate by source
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_by_source AS
SELECT
  source,
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE completed = true) AS completed,
  COUNT(*) FILTER (WHERE follow_up_status != 'novo') AS followed_up,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate,
  MIN(created_at) AS first_lead_date,
  MAX(created_at) AS last_lead_date,
  COUNT(DISTINCT DATE(created_at)) AS active_days
FROM public.quiz_responses
GROUP BY source
ORDER BY total_leads DESC;

COMMENT ON VIEW public.admin_leads_by_source IS 'Lead performance metrics by source';

-- ============================================================================
-- 7. TOP CHALLENGES VIEW - Most common challenges
-- ============================================================================

CREATE OR REPLACE VIEW public.admin_leads_top_challenges AS
SELECT
  jsonb_array_elements_text(challenges) AS challenge,
  COUNT(*) AS lead_count,
  COUNT(*) FILTER (WHERE converted_to_customer = true) AS converted_count,
  ROUND(
    (COUNT(*) FILTER (WHERE converted_to_customer = true)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS conversion_rate
FROM public.quiz_responses
WHERE challenges IS NOT NULL AND jsonb_array_length(challenges) > 0
GROUP BY challenge
ORDER BY lead_count DESC
LIMIT 20;

COMMENT ON VIEW public.admin_leads_top_challenges IS 'Most frequently selected challenges';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
