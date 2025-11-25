-- Seed initial habit categories and templates for catalog

-- Ensure slug is unique for conflict target
CREATE UNIQUE INDEX IF NOT EXISTS habit_templates_slug_key ON public.habit_templates(slug);

WITH ins AS (
  INSERT INTO public.habit_categories (name, icon_key, color, sort_order)
  VALUES
    ('Health', 'heart', '#2ecc71', 1),
    ('Fitness', 'run', '#1abc9c', 2),
    ('Mindfulness', 'meditate', '#9b59b6', 3),
    ('Nutrition', 'banana', '#f39c12', 4),
    ('Productivity', 'check', '#3498db', 5)
  ON CONFLICT (name) DO NOTHING
  RETURNING id, name
),
cat AS (
  SELECT jsonb_object_agg(name, id) AS mapping
  FROM (
    SELECT name, id FROM ins
    UNION
    SELECT name, id FROM habit_categories WHERE name IN ('Health','Fitness','Mindfulness','Nutrition','Productivity')
  ) s
)
INSERT INTO public.habit_templates (
  category_id,
  name,
  slug,
  icon_key,
  color,
  default_unit,
  default_goal_value,
  default_frequency_type,
  default_days_of_week,
  default_times_per_week,
  default_times_per_month,
  default_every_n_days,
  default_notifications,
  auto_complete_source
)
SELECT
  (mapping ->> category_name)::uuid,
  name,
  slug,
  icon_key,
  color,
  default_unit::public.habit_unit,
  default_goal_value,
  default_frequency_type::public.habit_frequency_type,
  default_days_of_week,
  default_times_per_week::int2,
  default_times_per_month::int2,
  default_every_n_days::int2,
  default_notifications,
  auto_complete_source::public.habit_auto_complete_source
FROM cat,
(
  VALUES
    -- Health
    ('Health', 'Walk or Run', 'walk-or-run', 'run', '#1abc9c', 'steps', 5000, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL::int2, NULL::int2, NULL::int2, '{"reminder": "auto"}'::jsonb, 'health'),
    ('Health', 'Mindful Minutes', 'mindful-minutes', 'meditate', '#9b59b6', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL::int2, NULL::int2, NULL::int2, '{"reminder": "auto"}'::jsonb, 'manual'),
    ('Health', 'Drink Water', 'drink-water', 'water', '#3498db', 'custom', 8, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL::int2, NULL::int2, NULL::int2, '{"reminder": "custom"}'::jsonb, 'manual'),
    -- Fitness
    ('Fitness', 'Exercise Minutes', 'exercise-minutes', 'dumbbell', '#16a085', 'minutes', 30, 'times_per_week', NULL::int2[], 4::int2, NULL::int2, NULL::int2, '{"reminder": "auto"}'::jsonb, 'manual'),
    ('Fitness', 'Cycle', 'cycle', 'bike', '#1abc9c', 'km', 5, 'times_per_week', NULL::int2[], 3::int2, NULL::int2, NULL::int2, '{"reminder": "custom"}'::jsonb, 'manual'),
    -- Mindfulness
    ('Mindfulness', 'Journal', 'journal', 'journal', '#9b59b6', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL::int2, NULL::int2, NULL::int2, '{"reminder": "custom"}'::jsonb, 'manual'),
    -- Nutrition
    ('Nutrition', 'Eat a Healthy Meal', 'healthy-meal', 'carrot', '#f39c12', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL::int2, NULL::int2, NULL::int2, '{"reminder": "auto"}'::jsonb, 'manual'),
    -- Productivity
    ('Productivity', 'Focus Session', 'focus-session', 'focus', '#3498db', 'minutes', 25, 'times_per_week', NULL::int2[], 14::int2, NULL::int2, NULL::int2, '{"reminder": "custom"}'::jsonb, 'manual')
) AS tpl(category_name, name, slug, icon_key, color, default_unit, default_goal_value, default_frequency_type, default_days_of_week, default_times_per_week, default_times_per_month, default_every_n_days, default_notifications, auto_complete_source)
WHERE (mapping ->> category_name) IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.habit_templates t WHERE t.slug = tpl.slug);
