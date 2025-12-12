-- ============================================
-- SCRIPT DE VERIFICAÇÃO DE MIGRATIONS
-- Execute essas queries no Supabase Dashboard SQL Editor
-- ============================================

-- ============================================
-- 1. VERIFICAR: 20251210100000_fix_cron_frequency.sql
-- ============================================
-- Verifica se cron jobs de notificação existem
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname IN (
  'habit-reminders-morning',
  'habit-reminders-afternoon',
  'habit-reminders-evening'
)
ORDER BY jobname;

-- Resultado esperado: 3 jobs com schedules corretos
-- morning: '0 11 * * *'  (8 AM Brazil)
-- afternoon: '0 17 * * *' (2 PM Brazil)
-- evening: '0 23 * * *' (8 PM Brazil)


-- ============================================
-- 2. VERIFICAR: 20251210100001_notification_history.sql
-- ============================================
-- Verifica se tabela notification_history existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'notification_history'
) AS notification_history_exists;

-- Verifica colunas da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_history'
ORDER BY ordinal_position;

-- Verifica indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notification_history';

-- Resultado esperado:
-- - Tabela existe (true)
-- - Colunas: id, user_id, habit_id, notification_type, context_type, sent_at, opened_at, etc
-- - 3+ indexes criados


-- ============================================
-- 3. VERIFICAR: 20251210100002_notification_preferences.sql
-- ============================================
-- Verifica se tabela notification_preferences existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'notification_preferences'
) AS notification_preferences_exists;

-- Verifica estrutura
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_preferences'
ORDER BY ordinal_position;

-- Verifica se há preferências criadas
SELECT COUNT(*) as total_preferences
FROM notification_preferences;

-- Resultado esperado:
-- - Tabela existe
-- - Colunas: user_id, morning_enabled, afternoon_enabled, evening_enabled, etc
-- - Pode ter 0 registros se nenhum usuário configurou ainda


-- ============================================
-- 4. VERIFICAR: 20251210100003_cron_trigger_scheduler.sql
-- ============================================
-- Verifica cron job de trigger scheduler
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'notification-trigger-scheduler';

-- Verifica se Edge Function existe (via metadata - não acessa função diretamente)
-- Nota: Edge Functions não aparecem em pg_catalog, verificar manualmente em:
-- https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/functions

-- Resultado esperado:
-- - 1 cron job ativo: 'notification-trigger-scheduler'
-- - Schedule: '0 * * * *' (hourly)


-- ============================================
-- 5. VERIFICAR: 20251211000000_admin_system.sql
-- ============================================
-- Verifica coluna is_admin em profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN ('is_admin', 'admin_since');

-- Verifica se tabela admin_audit_log existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'admin_audit_log'
) AS admin_audit_log_exists;

-- Verifica função current_user_is_admin
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'current_user_is_admin';

-- Verifica views de admin analytics
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'admin_%'
ORDER BY table_name;

-- Resultado esperado:
-- - Colunas is_admin e admin_since existem
-- - Tabela admin_audit_log existe
-- - Função current_user_is_admin existe
-- - 4+ views: admin_user_stats, admin_engagement_metrics, admin_revenue_metrics, admin_content_stats


-- ============================================
-- 6. VERIFICAR: 20251212000000_advanced_analytics.sql
-- ============================================
-- Verifica tabelas de analytics
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sessions', 'events', 'user_cohorts')
ORDER BY table_name;

-- Verifica views de analytics avançados
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'admin_%'
  AND table_name IN (
    'admin_north_star_metric',
    'admin_dau_mau_wau',
    'admin_dau_trend_30d',
    'admin_cohort_retention',
    'admin_streak_distribution',
    'admin_completion_rates_30d',
    'admin_completion_by_category',
    'admin_completion_by_time_of_day',
    'admin_session_metrics'
  )
ORDER BY table_name;

-- Verifica se função assign_user_to_cohort existe
SELECT proname, proargtypes::regtype[]
FROM pg_proc
WHERE proname = 'assign_user_to_cohort';

-- Verifica se trigger auto_assign_cohort existe
SELECT tgname, tgrelid::regclass, tgtype
FROM pg_trigger
WHERE tgname = 'trigger_auto_assign_cohort';

-- Verifica coluna completed_at_time em habit_completions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'habit_completions'
  AND column_name = 'completed_at_time';

-- Resultado esperado:
-- - 3 tabelas: sessions, events, user_cohorts
-- - 9 views de analytics avançados
-- - Função assign_user_to_cohort existe
-- - Trigger trigger_auto_assign_cohort existe
-- - Coluna completed_at_time existe


-- ============================================
-- 7. VERIFICAR: 20251213000000_pg_cron_streak_reset.sql
-- ============================================
-- Verifica cron job de reset de streaks
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'reset-expired-streaks-daily';

-- Verifica últimas execuções do cron (se já rodou)
SELECT
  runid,
  jobid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reset-expired-streaks-daily')
ORDER BY start_time DESC
LIMIT 5;

-- Resultado esperado:
-- - 1 cron job: 'reset-expired-streaks-daily'
-- - Schedule: '0 0 * * *' (midnight UTC)
-- - Active: true
-- - Se já rodou: job_run_details mostra execuções com status 'succeeded'


-- ============================================
-- RESUMO GERAL (QUERY ÚNICA)
-- ============================================
-- Execute esta query para ver tudo de uma vez:

SELECT 'TABLES' as category, table_name as name, 'exists' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('notification_history', 'notification_preferences', 'admin_audit_log', 'sessions', 'events', 'user_cohorts')

UNION ALL

SELECT 'VIEWS' as category, table_name as name, 'exists' as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'admin_%'

UNION ALL

SELECT 'FUNCTIONS' as category, proname as name, 'exists' as status
FROM pg_proc
WHERE proname IN ('current_user_is_admin', 'assign_user_to_cohort', 'update_streak')

UNION ALL

SELECT 'TRIGGERS' as category, tgname as name, 'exists on ' || tgrelid::regclass::text as status
FROM pg_trigger
WHERE tgname IN ('trigger_auto_assign_cohort')

UNION ALL

SELECT 'CRON_JOBS' as category, jobname as name, schedule as status
FROM cron.job
WHERE jobname IN (
  'habit-reminders-morning',
  'habit-reminders-afternoon',
  'habit-reminders-evening',
  'notification-trigger-scheduler',
  'reset-expired-streaks-daily'
)

ORDER BY category, name;


-- ============================================
-- CHECKLIST FINAL
-- ============================================
/*
✅ TUDO CORRETO SE:

TABLES (6 tabelas):
- notification_history
- notification_preferences
- admin_audit_log
- sessions
- events
- user_cohorts

VIEWS (13+ views começando com admin_):
- admin_user_stats
- admin_engagement_metrics
- admin_revenue_metrics
- admin_content_stats
- admin_north_star_metric
- admin_dau_mau_wau
- admin_dau_trend_30d
- admin_cohort_retention
- admin_streak_distribution
- admin_completion_rates_30d
- admin_completion_by_category
- admin_completion_by_time_of_day
- admin_session_metrics

FUNCTIONS (3 funções):
- current_user_is_admin
- assign_user_to_cohort
- update_streak

TRIGGERS (1 trigger):
- trigger_auto_assign_cohort (on profiles)

CRON_JOBS (5 cron jobs ativos):
- habit-reminders-morning (0 11 * * *)
- habit-reminders-afternoon (0 17 * * *)
- habit-reminders-evening (0 23 * * *)
- notification-trigger-scheduler (0 * * * *)
- reset-expired-streaks-daily (0 0 * * *)
*/
