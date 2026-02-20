-- ============================================
-- Journey Analytics Views for Admin Dashboard
-- ============================================

-- 1. Journey Overview: enrollments, completion rates per journey
CREATE OR REPLACE VIEW public.admin_journey_overview AS
SELECT
  j.id AS journey_id,
  j.title,
  j.slug,
  j.level,
  j.theme_slug,
  COUNT(ujs.id) AS total_enrollments,
  COUNT(ujs.id) FILTER (WHERE ujs.status = 'active') AS active_users,
  COUNT(ujs.id) FILTER (WHERE ujs.status = 'completed') AS completed_users,
  COUNT(ujs.id) FILTER (WHERE ujs.status = 'abandoned') AS abandoned_users,
  CASE
    WHEN COUNT(ujs.id) > 0
    THEN ROUND(COUNT(ujs.id) FILTER (WHERE ujs.status = 'completed') * 100.0 / COUNT(ujs.id), 1)
    ELSE 0
  END AS completion_rate,
  ROUND(AVG(ujs.days_completed) FILTER (WHERE ujs.status IN ('active', 'completed')), 1) AS avg_days_completed
FROM public.journeys j
LEFT JOIN public.user_journey_state ujs ON ujs.journey_id = j.id
GROUP BY j.id, j.title, j.slug, j.level, j.theme_slug
ORDER BY j.sort_order;

-- 2. Daily drop-off: how many users are on each day (identifies "The Cliff")
CREATE OR REPLACE VIEW public.admin_journey_dropoff AS
SELECT
  j.title AS journey_title,
  j.slug,
  ujs.current_day AS day_number,
  COUNT(*) AS users_on_day,
  CASE
    WHEN ujs.current_day BETWEEN 10 AND 14 THEN true
    ELSE false
  END AS is_cliff_zone
FROM public.user_journey_state ujs
JOIN public.journeys j ON j.id = ujs.journey_id
WHERE ujs.status = 'active'
GROUP BY j.title, j.slug, ujs.current_day
ORDER BY j.slug, ujs.current_day;

-- 3. Journey summary totals
CREATE OR REPLACE VIEW public.admin_journey_totals AS
SELECT
  COUNT(DISTINCT ujs.id) AS total_enrollments,
  COUNT(DISTINCT ujs.id) FILTER (WHERE ujs.status = 'active') AS active_journeys,
  COUNT(DISTINCT ujs.id) FILTER (WHERE ujs.status = 'completed') AS completed_journeys,
  COUNT(DISTINCT ujs.user_id) AS unique_users,
  CASE
    WHEN COUNT(ujs.id) > 0
    THEN ROUND(COUNT(ujs.id) FILTER (WHERE ujs.status = 'completed') * 100.0 / COUNT(ujs.id), 1)
    ELSE 0
  END AS overall_completion_rate
FROM public.user_journey_state ujs;
