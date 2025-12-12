# 🧪 COMPREHENSIVE NOTIFICATION TESTING GUIDE (6 Tests)

After applying the cron migration, execute these 6 tests sequentially to validate the entire notification system (Sprint 1-4 delivered).

---

## 📋 TEST SUMMARY

| Test | Trigger Type | Function | When | What to Test |
|------|--------------|----------|------|--------------|
| **1** | Time-based | habit-reminder-scheduler | 08:00 | Morning reminders firing |
| **2** | End-of-day | notification-trigger-scheduler | 22:00 | Pending habits at night |
| **3** | Delayed + Multiple | notification-trigger-scheduler | 15:00 | Overdue (2h+) + 3+ pending |
| **4** | Streak bonus | send-streak-notification | Any time | Milestones: 3/7/14/30 days |
| **5** | Database | SQL queries | Any time | notification_history populated |
| **6** | E2E app | Real app | Daily | Full user experience flow |

---

## TEST 1: TIME-BASED REMINDERS

**Purpose**: Verify morning reminders are sent at correct time window (05:00-12:00 Brazil time)

### Steps:

```bash
curl -X POST "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/habit-reminder-scheduler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg" \
  -d '{"dryRun": true, "testTime": "08:00"}'
```

### Expected Response:

```json
{
  "habitsChecked": 15-25,
  "habitsInWindow": 3-7,
  "pendingByUser": {
    "user-id-1": 2,
    "user-id-2": 1
  },
  "wouldNotify": [
    {
      "habit_id": "uuid1",
      "user_id": "uuid2",
      "title": "Eaí",
      "body": "Hora de completar seu hábito de leitura 📖",
      "context_type": "morning",
      "message_key": "morning_personalized_2"
    }
  ],
  "notificationsCount": 1-3
}
```

### ✅ Success Criteria:

- ✅ `habitsChecked` > 10
- ✅ `habitsInWindow` > 0 (1-3 expected at 08:00)
- ✅ `wouldNotify` array has at least 1 notification
- ✅ Each notification has: `title` (1 word), `body` (~8 words), `context_type`, `message_key`

---

## TEST 2: END-OF-DAY TRIGGERS

**Purpose**: Verify trigger scheduler detects pending habits at 22:00-23:59 (night reminder)

### Steps:

```bash
curl -X POST "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/notification-trigger-scheduler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg" \
  -d '{"dryRun": true, "testTime": "22:00"}'
```

### Expected Response:

```json
{
  "timestamp": "2025-12-10T22:00:00-03:00",
  "brazilTime": "22:00",
  "triggers": {
    "endOfDay": [
      {
        "user_id": "uuid1",
        "pending_habits_count": 3,
        "habits": ["Ler 10 páginas", "Meditação", "Água"],
        "would_send": true
      }
    ],
    "endOfDayCount": 8-15,
    "delayedHabits": [],
    "multiplePending": []
  },
  "totalTriggersActivated": 8-15
}
```

### ✅ Success Criteria:

- ✅ `endOfDayCount` > 5 (users with pending habits detected)
- ✅ Each `endOfDay` entry has: `user_id`, `pending_habits_count`, `habits` array
- ✅ `pending_habits_count` >= 1 for each user

---

## TEST 3: DELAYED + MULTIPLE PENDING

**Purpose**: Verify detection of overdue habits (2h+) and users with 3+ pending

### Steps:

```bash
curl -X POST "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/notification-trigger-scheduler" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg" \
  -d '{"dryRun": true, "testTime": "15:00"}'
```

### Expected Response:

```json
{
  "timestamp": "2025-12-10T15:00:00-03:00",
  "brazilTime": "15:00",
  "triggers": {
    "delayedHabits": [
      {
        "habit_id": "uuid1",
        "user_id": "uuid2",
        "habit_name": "Beber água",
        "reminder_time": "13:00",
        "hours_overdue": 2.5,
        "context_type": "delayed"
      }
    ],
    "delayedCount": 3-8,
    "multiplePending": [
      {
        "user_id": "uuid3",
        "pending_count": 4,
        "pending_habits": ["Ler", "Exercício", "Meditação", "Água"]
      }
    ],
    "multiplePendingCount": 1-3,
    "endOfDay": []
  },
  "totalTriggersActivated": 4-11
}
```

### ✅ Success Criteria:

- ✅ `delayedCount` > 0 (at least some overdue habits)
- ✅ `delayedHabits` have `hours_overdue` >= 2
- ✅ `multiplePendingCount` > 0 (users with 3+ pending detected)
- ✅ `multiplePending` users have `pending_count` >= 3

---

## TEST 4: STREAK NOTIFICATIONS

**Purpose**: Verify streak milestone notifications trigger on day 7, 14, 30

### Steps:

First, find your user ID from the app or database. Then:

```bash
curl -X POST "https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/send-streak-notification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg" \
  -d '{
    "userId": "YOUR_USER_ID_HERE",
    "milestone": 7
  }'
```

Test with milestones: `3`, `7`, `14`, `30`

### Expected Response:

```json
{
  "success": true,
  "sent": true,
  "userId": "uuid1",
  "milestone": 7,
  "habit": {
    "id": "uuid2",
    "name": "Correr 5km",
    "emoji": "🏃"
  },
  "message": {
    "key": "streak_7_personalized_1",
    "title": "Você!",
    "body": "7 dias de Correr 5km! Tá bombado demais! 🏃💪"
  },
  "notification_history_id": "uuid3",
  "logged": true
}
```

### ✅ Success Criteria:

- ✅ `success: true`
- ✅ `sent: true`
- ✅ `message.key` includes `streak_` + milestone number
- ✅ `message.title` is 1-2 words
- ✅ `message.body` contains habit emoji and ~8-12 words
- ✅ `notification_history_id` is UUID (logged to database)

---

## TEST 5: DATABASE VERIFICATION

**Purpose**: Verify notification_history is populated and message rotation works

Execute these SQL queries in **Supabase Dashboard > SQL Editor**:

### Query 5A: Overall Statistics

```sql
SELECT
  COUNT(*) as total_notifications,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT context_type) as context_types,
  COUNT(DISTINCT message_key) as unique_messages,
  COUNT(clicked_at) as notifications_opened
FROM notification_history
WHERE sent_at >= now() - interval '24 hours';
```

**Expected Result**:
- `total_notifications`: 10+ (notifications sent)
- `unique_users`: 3+ (multiple users received)
- `context_types`: 2+ (morning, delayed, etc)
- `unique_messages`: 3+ (message rotation working)
- `notifications_opened`: 0-5 (depends on user clicks)

### Query 5B: Message Rotation Check

```sql
SELECT DISTINCT
  context_type,
  message_key,
  COUNT(*) as times_sent
FROM notification_history
WHERE sent_at >= now() - interval '7 days'
GROUP BY context_type, message_key
ORDER BY context_type, times_sent DESC;
```

**Expected Result**:
```
context_type  │ message_key              │ times_sent
──────────────┼─────────────────────────┼──────────
morning       │ morning_personalized_2  │ 2
morning       │ morning_generic_1       │ 1
delayed       │ delayed_generic_3       │ 1
```

✅ **SUCCESS**: Different `message_key` values for same context = rotation working!

### Query 5C: Cron Jobs Status

```sql
SELECT
  jobid,
  jobname,
  schedule,
  last_start,
  last_successful_run,
  last_failed_run
FROM cron.job
WHERE jobname LIKE 'notification%' OR jobname LIKE 'habit%'
ORDER BY jobname;
```

**Expected Result**:
```
jobid │ jobname                        │ schedule    │ last_start │ last_successful_run
──────┼────────────────────────────────┼─────────────┼────────────┼─────────────────────
103   │ habit-reminder-scheduler       │ */5 * * * * │ 2 min ago  │ 2 min ago
104   │ notification-trigger-scheduler │ 0 * * * *   │ 1 hour ago │ 1 hour ago
```

✅ **SUCCESS**: Both jobs running on schedule!

---

## TEST 6: END-TO-END APP TEST

**Purpose**: Verify entire flow works in live app with real user experience

### Steps:

1. **Open Bora! app** on your phone/browser
2. **Enable push notifications** in browser/phone settings
3. **Leave app running** for 10 minutes or trigger manually
4. **Monitor incoming notifications** sequence:

### Expected Notification Sequence:

#### a) During configured habit times (e.g., 08:00)
```
Title: "Eaí"
Body: "Hora de Ler 10 páginas 📖"
Context: morning
Action: Opens app dashboard
```

#### b) If habit skipped for 2+ hours
```
Title: "Saudade"
Body: "Ainda falta Ler 10 páginas 📖 pra você!"
Context: delayed
Action: Reminds to complete
```

#### c) Between 15:00-18:00 with 3+ pending habits
```
Title: "Olha só"
Body: "Esse fila tá grande demais 👀 3 hábitos te esperando..."
Context: multiple_pending
Action: Shows all pending
```

#### d) After 22:00 with pending habits
```
Title: "Saudade"
Body: "Termina essas tarefas antes de dormir! 🌙 Boa noite!"
Context: end_of_day
Action: Final reminder
```

#### e) On 7th consecutive day of habit
```
Title: "Você!"
Body: "7 dias de sequência! Tá bombado demais! 💪🔥"
Context: streak_7
Action: Celebrates milestone
```

### ✅ Success Criteria:

- ✅ Notifications arrive at expected times
- ✅ Copy uses Duolingo-style tone ("Psiu", "Eaí", "Saudade")
- ✅ Each includes habit emoji and personalized content
- ✅ Clicking notification opens app correctly
- ✅ (Sprint 5): "Completar" button completes habit directly

---

## 🎯 FINAL VALIDATION CHECKLIST

After all 6 tests, verify:

- [ ] **Test 1**: Morning reminders firing at correct time ✅
- [ ] **Test 2**: End-of-day triggers detecting pending habits ✅
- [ ] **Test 3**: Delayed habits (2h+) and multiple pending (3+) detected ✅
- [ ] **Test 4**: Streak notifications for milestones 7, 14, 30 ✅
- [ ] **Test 5**: notification_history populated with message rotation ✅
- [ ] **Test 6**: Full app flow working with all trigger types ✅

---

## 🎉 NEXT STEPS

If **ALL 6 TESTS PASS**:

✅ **Notification System FULLY OPERATIONAL!**

Ready for:
- Sprint 5: Fix "Completar" button in Service Worker
- Sprint 5: Add analytics tracking (open rate, completion rate)
- Monitor production for 24-48 hours for edge cases
- Collect user feedback on copy tone and trigger frequency

---

## 📞 TROUBLESHOOTING

### No notifications being sent?
1. Check if cron jobs exist: `SELECT * FROM cron.job WHERE jobname LIKE 'notification%'`
2. Verify edge functions are deployed: `npx supabase functions list`
3. Check error logs: Supabase Dashboard > Functions > Logs

### Message rotation not working?
1. Check `notification_history` has entries: `SELECT COUNT(*) FROM notification_history WHERE sent_at >= now() - interval '1 day'`
2. Verify `selectCopy()` filtering by context: Look for different `message_key` values per context type

### Cron jobs not running?
1. Check database settings: `SELECT value FROM pg_settings WHERE name = 'shared_preload_libraries'` (should include 'pg_cron')
2. Verify Supabase app settings are configured with correct URL and service role key
