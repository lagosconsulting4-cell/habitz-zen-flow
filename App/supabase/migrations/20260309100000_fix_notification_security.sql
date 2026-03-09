-- Migration: Fix notification_history RLS + revoke anon analytics access
-- Created: 2026-03-09
--
-- Fix 1: The "Service role manages notification history" policy uses FOR ALL USING (true),
-- which allows any authenticated user to UPDATE/DELETE any row. Service role already
-- bypasses RLS, so this policy is unnecessary and dangerous.
--
-- Fix 2: Analytics views were granted SELECT to anon role, exposing notification data
-- to unauthenticated users.

-- Fix 1: Drop overly permissive policy
-- Service role (used by edge functions) bypasses RLS automatically.
-- The existing "Users can view own notification history" policy (FOR SELECT WHERE auth.uid() = user_id)
-- is sufficient for authenticated users.
DROP POLICY IF EXISTS "Service role manages notification history" ON public.notification_history;

-- Fix 2: Revoke anon access from analytics views
REVOKE SELECT ON notification_analytics FROM anon;
REVOKE SELECT ON notification_daily_summary FROM anon;
REVOKE SELECT ON notification_user_analytics FROM anon;
