-- Verification script for 20260118000000_fix_auth_critical_blockers

-- 1. Check if functions exist
SELECT
  'Functions Check' as category,
  proname as name,
  CASE
    WHEN proname IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM pg_proc
WHERE proname IN ('current_user_is_admin', 'get_user_id_by_email');

-- 2. Check RLS policies
SELECT
  'RLS Policies Check' as category,
  tablename,
  policyname,
  cmd,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events')
  AND policyname LIKE '%insert%';

-- 3. Check RLS is enabled
SELECT
  'RLS Enabled Check' as category,
  tablename,
  CASE
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_cohorts', 'sessions', 'events');
