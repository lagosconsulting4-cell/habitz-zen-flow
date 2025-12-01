import json
from uuid import uuid4

normalize_code = r"""
const entry = $json.entry?.[0]?.changes?.[0]?.value ?? {};
const message = entry.messages?.[0] ?? {};
const contact = entry.contacts?.[0] ?? {};
const text = message.text?.body ?? message.interactive?.text ?? message.button?.text ?? '';
const item = {
  phone: message.from || '',
  message_id: message.id || '',
  profile_name: contact.profile?.name || '',
  text,
  message_type: message.type || 'text',
  timestamp: message.timestamp || null,
  raw: $json
};
return [{ json: item }];
""".strip()

classify_code = r"""
const incoming = $item(0).$node['Normalize Incoming'].json;
const response = $json;
let user = null;
if (Array.isArray(response) && response.length > 0) {
  user = response[0];
} else if (response && Object.keys(response).length > 0) {
  user = response;
}
const onboardingStep = user?.onboarding_step ?? 0;
const status = user ? (user.onboarding_completed === true ? 'active' : 'onboarding') : 'new';
return [{ json: { ...incoming, user, user_status: status, onboarding_step: onboardingStep } }];
""".strip()

format_plan_code = r"""
const rawOutput = $json.text ?? $json.output ?? $json.response ?? '';
let parsed;
try {
  parsed = typeof rawOutput === 'string' ? JSON.parse(rawOutput) : rawOutput;
} catch (error) {
  throw new Error('Não foi possível interpretar o JSON do plano gerado pela IA. Ajuste o prompt ou revise a resposta do modelo.');
}
const userRow = $item(0).$node['Update Step 4 Response'].json;
const user = Array.isArray(userRow) ? userRow[0] : userRow;
const habits = (parsed?.habits ?? []).map((habit, index) => ({
  order: index + 1,
  name: habit.name,
  type: habit.type,
  frequency: habit.frequency,
  reminder_times: habit.reminder_times ?? [],
  guidance: habit.guidance ?? '',
  user_id: user?.id,
  completed: false
}));
return [{ json: { plan_summary: parsed?.summary ?? '', habits } }];
""".strip()

detect_confirmation_code = r"""
const text = ($json.text || '').toLowerCase();
const confirmations = ['feito', 'concluí', 'conclui', 'finalizei', 'done', 'ok', 'deu certo', 'terminei'];
const isConfirmation = confirmations.some((word) => text.includes(word));
return [{ json: { ...$json, is_confirmation: isConfirmation } }];
""".strip()

build_agent_context_code = r"""
const user = $item(0).$node['Detect Confirmation'].json.user || {};
const habits = $item(0).$node['Fetch Active Habits'].json;
const logs = $item(0).$node['Fetch Today Progress'].json;
const history = $item(0).$node['Fetch Conversation History'].json;
return [{ json: { ...$item(0).$node['Detect Confirmation'].json, user, habits, logs, history } }];
""".strip()

filter_reminder_code = r"""
const records = Array.isArray($json) ? $json : ($json.data || []);
const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
return records.flatMap((record) => {
  const tz = record.users?.timezone || 'America/Sao_Paulo';
  const formatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz });
  const [hourStr, minuteStr] = formatter.format(now).split(':');
  const current = `${pad(hourStr)}:${pad(minuteStr)}`;
  const reminders = record.reminder_times || [];
  if (reminders.includes(current)) {
    return [{ json: { user_id: record.user_id, habit_id: record.id, habit_name: record.name, phone: record.users?.phone, user_name: record.users?.name } }];
  }
  return [];
});
""".strip()

# The rest of nodes definition identical except cron

# Instead of rewriting entire script, load existing JSON, modify cron? but we will rebuild using same structure but updating Cron.

# For brevity, read existing JSON, modify Cron node (id 32) parameters.

with open(r"C:\\Users\\bruno\\Documents\\Trendly\\Claude Code\\Foquinha Ai\\Docs\\Codex\\assistente_dev_pessoal_workflow.json", "r", encoding="utf-8") as f:
    workflow = json.load(f)

for node in workflow["nodes"]:
    if node["id"] == "32":
        node["parameters"] = {
            "triggerTimes": {
                "item": [
                    {
                        "mode": "everyX",
                        "unit": "minutes",
                        "value": 10
                    }
                ]
            }
        }

workflow["versionId"] = str(uuid4())

with open(r"C:\\Users\\bruno\\Documents\\Trendly\\Claude Code\\Foquinha Ai\\Docs\\Codex\\assistente_dev_pessoal_workflow.json", "w", encoding="utf-8") as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)
