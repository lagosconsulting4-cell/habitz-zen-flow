# 🔧 SPRINT 3 CRON MIGRATION - DEPLOYMENT INSTRUCTIONS

**Status**: Ready to deploy
**Migration**: `20251210100003_cron_trigger_scheduler.sql`
**Function**: `notification-trigger-scheduler` (already deployed v1)
**Cron Schedule**: Every hour at :00 (0 * * * *)

---

## QUICK START (2 Minutes)

### Step 1: Open Supabase Dashboard

1. Navigate to: https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn
2. Click: **SQL Editor**
3. Click: **New query**

### Step 2: Copy and Paste SQL

Copy the SQL below and paste into the query editor:

```sql
-- Sprint 3: Add pg_cron job for behavioral triggers
-- Runs hourly to check for triggers and send notifications

-- First, unschedule if exists (safe removal - handles if job doesn't exist)
DO $$
BEGIN
  BEGIN
    PERFORM cron.unschedule('notification-trigger-scheduler');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Job not found, skipping';
  END;
END $$;

-- Schedule notification-trigger-scheduler to run every hour at :00
SELECT cron.schedule(
  'notification-trigger-scheduler',
  '0 * * * *',
  $$
    SELECT
      net.http_post(
        concat(
          current_setting('app.settings.supabase_url'),
          '/functions/v1/notification-trigger-scheduler'
        ),
        '{}'::jsonb,
        jsonb_build_object(
          'Authorization', concat('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        'application/json'
      ) as request_id;
  $$
);
```

### Step 3: Execute

1. Click the **Play** button (Run query)
2. Wait for: **Query successful**

### Step 4: Verify

Execute this verification query:

```sql
SELECT jobid, jobname, schedule, last_start, last_successful_run
FROM cron.job
WHERE jobname LIKE 'notification%'
ORDER BY jobname;
```

**Expected Result**:
```
jobid │ jobname                        │ schedule    │ last_start       │ last_successful_run
──────┼────────────────────────────────┼─────────────┼──────────────────┼─────────────────────
103   │ habit-reminder-scheduler       │ */5 * * * * │ 2025-12-10 14:45 │ 2025-12-10 14:45
104   │ notification-trigger-scheduler │ 0 * * * *   │ 2025-12-10 15:00 │ 2025-12-10 15:00
```

✅ **SUCCESS**: Both cron jobs are running!

---

## WHAT THIS MIGRATION DOES

### Purpose
Schedules the `notification-trigger-scheduler` edge function to run **every hour** (at minute :00) to detect and send:
- **Delayed habits**: Habits not completed 2+ hours after scheduled time
- **Multiple pending**: Users with 3+ incomplete habits
- **End-of-day**: All pending habits after 22:00

### Schedule Breakdown
- `0 * * * *` = Every hour at minute 0
  - 00:00 → 01:00 → 02:00 → ... → 23:00 (24 times/day)
- Complements `habit-reminder-scheduler` which runs every 5 minutes (`*/5 * * * *`)

### Edge Function Called
- **URL**: `https://[YOUR_PROJECT].supabase.co/functions/v1/notification-trigger-scheduler`
- **Method**: POST
- **Auth**: Service role key (from Supabase settings)
- **Body**: `{}` (empty, triggers self-check logic)

---

## VERIFICATION STEPS

### Option A: SQL Query (Recommended)

```sql
-- Check if cron job was created
SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'notification-trigger-scheduler';

-- Check job execution history
SELECT jobid, jobname, last_start, last_successful_run, last_failed_run
FROM cron.job
WHERE jobname = 'notification-trigger-scheduler';

-- View cron logs (if available)
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'notification-trigger-scheduler')
ORDER BY start_time DESC
LIMIT 10;
```

### Option B: Manual Test at Next Hour

1. Wait for the top of the hour (e.g., 15:00:00)
2. Check Supabase edge function logs:
   - Dashboard → Functions → notification-trigger-scheduler → Logs
3. Should see requests coming in at each hour mark

### Option C: Dry Run Test (Immediate)

```bash
curl -X POST "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/notification-trigger-scheduler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg" \
  -d '{"dryRun": true, "testTime": "15:00"}'
```

---

## CRON JOBS AFTER THIS MIGRATION

After applying, you'll have **2 active cron jobs**:

| Job ID | Name | Schedule | What It Does |
|--------|------|----------|--------------|
| **103** | `habit-reminder-scheduler` | `*/5 * * * *` (every 5 min) | Time-based reminders (08:00, 14:00, 20:00) |
| **104** | `notification-trigger-scheduler` | `0 * * * *` (every hour) | Behavioral triggers (delayed, multiple pending, end-of-day) |

**Combined Effect**:
- **Every 5 minutes**: Check habits with scheduled reminder times
- **Every hour**: Check for behavioral triggers (overdue, pending pile-up, etc)

---

## ROLLBACK (If Needed)

To remove this cron job (rollback):

```sql
DO $$
BEGIN
  PERFORM cron.unschedule('notification-trigger-scheduler');
  RAISE NOTICE 'notification-trigger-scheduler removed';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Job not found or error occurred: %', SQLERRM;
END $$;
```

---

## NEXT STEPS

After successful deployment:

1. ✅ Migration applied
2. ⏳ **Run the 6-part testing suite** (see `TESTING-GUIDE-6-TESTS.md`)
3. 🎯 Monitor production for 24 hours
4. 🚀 If all tests pass, ready for Sprint 5 (complete button fix + analytics)

---

## TROUBLESHOOTING

### ❌ "Query failed: permission denied"
- **Cause**: Not logged in as admin or service role
- **Fix**: Ensure you're logged into Supabase as the project owner

### ❌ "SQL syntax error"
- **Cause**: Typo in copied SQL
- **Fix**: Copy the entire block again, ensure no missing backticks

### ❌ "Job not found" error
- **Cause**: Trying to unschedule a job that doesn't exist
- **Fix**: This is OK! The DO $$ block handles this with EXCEPTION WHEN OTHERS

### ❌ Job exists but not running
- **Cause**: Supabase app settings not configured correctly
- **Fix**: Check that your Supabase project has app settings with:
  - `app.settings.supabase_url` = your project URL
  - `app.settings.service_role_key` = your service role key

---

## DEFINITIONS

**pg_cron Schedule Format** (standard cron):
```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-7, 0 and 7 are Sunday)
│ │ │ │ │
0 * * * *  ← Every hour at minute 0
*/5 * * * * ← Every 5 minutes
```

**Behavioral Triggers**:
- **Delayed**: Habit not completed 2+ hours after `reminder_time`
- **Multiple Pending**: User has 3+ incomplete habits
- **End-of-day**: Pending habits detected after 22:00 (10 PM Brazil time)

---

**Last Updated**: 2025-12-10
**Created By**: Claude Code
**References**:
- Plan: `C:\Users\bruno\.claude\plans\fuzzy-hopping-river.md` (Sprint 3)
- Tests: `TESTING-GUIDE-6-TESTS.md` (comprehensive validation)
