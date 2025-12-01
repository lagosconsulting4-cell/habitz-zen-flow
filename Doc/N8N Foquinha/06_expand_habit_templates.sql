-- Expandir habit_templates para incluir todos os 43 templates do app
-- Executar após o seed inicial (0002_seed_habit_catalog.sql)
-- Autor: Claude Code Assistant
-- Data: 2025-12-01

-- 1. Adicionar categorias que faltam
INSERT INTO public.habit_categories (name, icon_key, color, sort_order)
VALUES
  ('Time & Routine', 'clock', '#e74c3c', 6),
  ('Avoid', 'ban', '#95a5a6', 7)
ON CONFLICT (name) DO NOTHING;

-- 2. Inserir todos os templates do app (43 no total)
WITH cat AS (
  SELECT jsonb_object_agg(name, id) AS mapping
  FROM habit_categories
)
INSERT INTO public.habit_templates (
  category_id, name, slug, icon_key, color,
  default_unit, default_goal_value, default_frequency_type,
  default_days_of_week, default_times_per_week, auto_complete_source
)
SELECT
  (mapping ->> category_name)::uuid, name, slug, icon_key, '#A3E635',
  default_unit::public.habit_unit, default_goal_value,
  default_frequency_type::public.habit_frequency_type,
  default_days_of_week, default_times_per_week::int2,
  auto_complete_source::public.habit_auto_complete_source
FROM cat,
(VALUES
  -- PRODUCTIVITY (10 templates)
  ('Productivity', 'Acordar Cedo', 'wake-early', 'sunrise', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Fazer a Cama', 'make-bed', 'make_bed', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Planejar o Dia', 'plan-day', 'plan', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Revisar Objetivos', 'review-goals', 'review', 'none', NULL, 'times_per_week', NULL::int2[], 1, 'manual'),
  ('Productivity', 'Journaling', 'journaling', 'journal', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Ler Livros', 'read-books', 'book', 'custom', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Meditar', 'meditate', 'meditate', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Estudar', 'study', 'study', 'custom', 1, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Organizar Ambiente', 'organize-space', 'organize', 'minutes', 15, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Productivity', 'Lista de Tarefas', 'task-list', 'checklist', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- FITNESS (14 templates)
  ('Fitness', 'Caminhar ou Correr', 'walk-run', 'run', 'steps', 10000, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Pedalar', 'cycle', 'cycle', 'minutes', 30, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Nadar', 'swim', 'swim', 'minutes', 30, 'times_per_week', NULL::int2[], 2, 'manual'),
  ('Fitness', 'Minutos Atenção Plena', 'mindful-min', 'meditate', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Subir Escadas', 'climb-stairs', 'stairs', 'custom', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Anéis de Atividade', 'activity-rings', 'activity_rings', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Horas em Pé', 'stand-hours', 'stand_hours', 'custom', 12, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Minutos de Exercício', 'exercise-min', 'exercise_minutes', 'minutes', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Queimar Calorias', 'burn-calories', 'burn_energy', 'custom', 500, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),
  ('Fitness', 'Alongamento', 'stretching', 'stretch', 'minutes', 10, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Fitness', 'Yoga', 'yoga', 'yoga', 'minutes', 20, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Treino de Força', 'strength-training', 'strength', 'minutes', 45, 'times_per_week', NULL::int2[], 3, 'manual'),
  ('Fitness', 'Beber Água', 'drink-water-fitness', 'water', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Fitness', 'Dormir 8 Horas', 'sleep-8h', 'sleep', 'custom', 8, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'health'),

  -- NUTRITION (8 templates)
  ('Nutrition', 'Café da Manhã Saudável', 'healthy-breakfast', 'breakfast', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Comer Frutas', 'eat-fruits', 'fruits', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Comer Vegetais', 'eat-vegetables', 'vegetables', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Beber 2L de Água', 'drink-water-2l', 'water', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Evitar Açúcar', 'avoid-sugar', 'no_sugar', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Preparar Refeições', 'meal-prep', 'meal', 'custom', 3, 'times_per_week', NULL::int2[], 1, 'manual'),
  ('Nutrition', 'Comer Proteína', 'eat-protein', 'protein', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Nutrition', 'Tomar Vitaminas', 'take-vitamins', 'vitamins', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- TIME & ROUTINE (5 templates)
  ('Time & Routine', 'Pomodoro', 'pomodoro', 'focus', 'custom', 4, 'times_per_week', NULL::int2[], 5, 'manual'),
  ('Time & Routine', 'Foco Profundo', 'deep-focus', 'deep_work', 'custom', 2, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Dormir no Horário', 'sleep-on-time', 'bed', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Acordar no Horário', 'wake-on-time', 'alarm', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Time & Routine', 'Tempo Sem Telas', 'screen-free', 'no_screens', 'custom', 1, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),

  -- AVOID (6 templates)
  ('Avoid', 'Não Fumar', 'no-smoking', 'no_smoke', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Comer Doces', 'no-sweets', 'no_sugar', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Limitar Redes Sociais', 'limit-social', 'social_media', 'minutes', 30, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Pular Refeições', 'no-skip-meals', 'no_skip_meals', 'custom', 3, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Dormir Tarde', 'no-late-sleep', 'no_late_sleep', 'none', NULL, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual'),
  ('Avoid', 'Não Ficar Sedentário', 'no-sedentary', 'active', 'custom', 8, 'daily', ARRAY[0,1,2,3,4,5,6]::int2[], NULL, 'manual')
) AS tpl(category_name, name, slug, icon_key, default_unit, default_goal_value, default_frequency_type, default_days_of_week, default_times_per_week, auto_complete_source)
WHERE (mapping ->> category_name) IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Verificação: Contar templates inseridos
SELECT COUNT(*) as total_templates FROM public.habit_templates;
