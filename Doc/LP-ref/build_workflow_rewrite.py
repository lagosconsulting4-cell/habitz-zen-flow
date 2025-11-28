import json
from uuid import uuid4

SUPABASE_URL = "https://llxkhcgmbumqedrdarmr.supabase.co"

normalize_code = """
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

classify_code = """
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

format_plan_code = """
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

detect_confirmation_code = """
const text = ($json.text || '').toLowerCase();
const confirmations = ['feito', 'concluí', 'conclui', 'finalizei', 'done', 'ok', 'deu certo', 'terminei'];
const isConfirmation = confirmations.some((word) => text.includes(word));
return [{ json: { ...$json, is_confirmation: isConfirmation } }];
""".strip()

build_context_code = """
const user = $item(0).$node['Detect Confirmation'].json.user || {};
const habits = $item(0).$node['Fetch Active Habits'].json;
const logs = $item(0).$node['Fetch Today Progress'].json;
const history = $item(0).$node['Fetch Conversation History'].json;
return [{ json: { ...$item(0).$node['Detect Confirmation'].json, user, habits, logs, history } }];
""".strip()

filter_reminder_code = """
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

prompt_plan = """Você é um coach de desenvolvimento pessoal. Considere os dados do usuário abaixo e gere um plano de 3 hábitos para construir e até 2 hábitos para abandonar. Responda em JSON seguindo o formato {
  \"summary\": string,
  \"habits\": [
    {
      \"name\": string,
      \"type\": \"good\"|\"bad\",
      \"frequency\": string,
      \"reminder_times\": [string],
      \"guidance\": string
    }
  ]
}.

Dados do usuário: {{ JSON.stringify($item(0).$node['Update Step 4 Response'].json[0] ?? $item(0).$node['Update Step 4 Response'].json) }}""".strip()

agent_prompt = """Você é um assistente de desenvolvimento pessoal amigável, motivador e direto. Use o contexto fornecido para responder a mensagem do usuário. Seja acolhedor, reconheça avanços e proponha ações específicas.

Contexto do usuário: {{ JSON.stringify($json.user) }}
Hábitos ativos: {{ JSON.stringify($json.habits) }}
Progresso de hoje: {{ JSON.stringify($json.logs) }}
Histórico recente: {{ JSON.stringify($json.history) }}

Mensagem do usuário: {{$json.text}}""".strip()

nodes = []

def supabase_http_node(node_id, name, method, path, position, query_params=None, body_expr=None):
    parameters = {
        "method": method,
        "url": f"{SUPABASE_URL}{path}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "responseFormat": "json"
    }
    if query_params:
        parameters["sendQuery"] = True
        parameters["specifyQuery"] = "keypair"
        parameters["queryParameters"] = {"parameters": query_params}
    if body_expr is not None:
        parameters["sendBody"] = True
        parameters["contentType"] = "json"
        parameters["specifyBody"] = "json"
        parameters["jsonBody"] = body_expr
    return {
        "id": node_id,
        "name": name,
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.2,
        "position": position,
        "parameters": parameters
    }

nodes.append({
    "id": "1",
    "name": "WhatsApp Trigger",
    "type": "n8n-nodes-base.whatsAppBusinessCloudTrigger",
    "typeVersion": 1,
    "position": [-1600, -200],
    "parameters": {"events": ["messages"]}
})

nodes.append({
    "id": "2",
    "name": "Normalize Incoming",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [-1420, -200],
    "parameters": {"functionCode": normalize_code}
})

nodes.append(supabase_http_node(
    "3",
    "Supabase Get User",
    "GET",
    "/rest/v1/users",
    [-1240, -200],
    [
        {"name": "phone", "value": "={{'eq.' + $item(0).$node['Normalize Incoming'].json.phone}}"},
        {"name": "select", "value": "*"},
        {"name": "limit", "value": "1"}
    ]
))

nodes.append({
    "id": "4",
    "name": "Classify User",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [-1060, -200],
    "parameters": {"functionCode": classify_code}
})

nodes.append({
    "id": "5",
    "name": "Route User",
    "type": "n8n-nodes-base.switch",
    "typeVersion": 2,
    "position": [-880, -200],
    "parameters": {
        "value1": "={{$json.user_status}}",
        "rules": [
            {"operation": "equal", "value2": "new"},
            {"operation": "equal", "value2": "onboarding"},
            {"operation": "equal", "value2": "active"}
        ]
    }
})

nodes.append(supabase_http_node(
    "6",
    "Create User Record",
    "POST",
    "/rest/v1/users",
    [-700, -380],
    body_expr='={{ {"phone": $json.phone, "name": $json.profile_name || null, "onboarding_step": 1, "onboarding_completed": false, "timezone": "America/Sao_Paulo"} }}'
))

nodes.append({
    "id": "7",
    "name": "Send Step 1 Prompt",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [-520, -380],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$item(0).$node['Normalize Incoming'].json.phone}}",
        "text": "Olá! Eu sou o seu assistente de desenvolvimento pessoal. Para começarmos, me conte quais são os 3 hábitos que você quer construir ou melhorar na sua vida."
    }
})

nodes.append({
    "id": "8",
    "name": "Switch Onboarding Step",
    "type": "n8n-nodes-base.switch",
    "typeVersion": 2,
    "position": [-700, -40],
    "parameters": {
        "value1": "={{$json.user?.onboarding_step ?? $json.onboarding_step ?? 0}}",
        "rules": [
            {"operation": "equal", "value2": 1},
            {"operation": "equal", "value2": 2},
            {"operation": "equal", "value2": 3},
            {"operation": "equal", "value2": 4},
            {"operation": "equal", "value2": 5}
        ]
    }
})

nodes.append(supabase_http_node(
    "9",
    "Update Step 1 Response",
    "PATCH",
    "/rest/v1/users",
    [-520, -200],
    [{"name": "phone", "value": "={{'eq.' + $json.phone}}"}],
    body_expr='={{ {"goals": {"raw": $json.text}, "onboarding_step": 2} }}'
))

nodes.append({
    "id": "10",
    "name": "Send Step 2 Prompt",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [-340, -200],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$json.phone}}",
        "text": "Ótimo! Agora me conta: existe algum hábito ou vício que está te atrapalhando e que você quer deixar para trás?"
    }
})

nodes.append(supabase_http_node(
    "11",
    "Update Step 2 Response",
    "PATCH",
    "/rest/v1/users",
    [-520, -40],
    [{"name": "phone", "value": "={{'eq.' + $json.phone}}"}],
    body_expr='={{ {"bad_habits": {"raw": $json.text}, "onboarding_step": 3} }}'
))

nodes.append({
    "id": "12",
    "name": "Send Step 3 Prompt",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [-340, -40],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$json.phone}}",
        "text": "Perfeito! Para adaptar o plano, como você classificaria sua situação financeira atual? (baixa / média / alta)"
    }
})

nodes.append(supabase_http_node(
    "13",
    "Update Step 3 Response",
    "PATCH",
    "/rest/v1/users",
    [-520, 120],
    [{"name": "phone", "value": "={{'eq.' + $json.phone}}"}],
    body_expr='={{ {"financial_situation": $json.text, "onboarding_step": 4} }}'
))

nodes.append({
    "id": "14",
    "name": "Send Step 4 Prompt",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [-340, 120],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$json.phone}}",
        "text": "Show! Agora me diz: quais são seus horários mais livres durante a semana? Pode ser algo como 'manhã 6h-8h, noite 19h-21h'."
    }
})

nodes.append(supabase_http_node(
    "15",
    "Update Step 4 Response",
    "PATCH",
    "/rest/v1/users",
    [-520, 280],
    [{"name": "phone", "value": "={{'eq.' + $json.phone}}"}],
    body_expr='={{ {"available_times": {"raw": $json.text}, "onboarding_step": 5} }}'
))

nodes.append({
    "id": "16",
    "name": "Generate Personalized Plan",
    "type": "n8n-nodes-langchain.chatOpenAi",
    "typeVersion": 1,
    "position": [-340, 280],
    "parameters": {
        "promptType": "define",
        "prompt": prompt_plan
    }
})

nodes.append({
    "id": "17",
    "name": "Format Plan Output",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [-160, 280],
    "parameters": {"functionCode": format_plan_code}
})

nodes.append(supabase_http_node(
    "18",
    "Insert Habits",
    "POST",
    "/rest/v1/habits",
    [20, 280],
    body_expr='={{ $json.habits }}'
))

nodes.append(supabase_http_node(
    "19",
    "Complete Onboarding",
    "PATCH",
    "/rest/v1/users",
    [200, 280],
    [{"name": "phone", "value": "={{'eq.' + ($item(0).$node['Update Step 4 Response'].json[0]?.phone ?? $item(0).$node['Normalize Incoming'].json.phone)}}"}],
    body_expr='={{ {"onboarding_completed": true, "onboarding_step": 6} }}'
))

nodes.append({
    "id": "20",
    "name": "Send Plan Summary",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [380, 280],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$item(0).$node['Normalize Incoming'].json.phone}}",
        "text": "Plano pronto! Aqui está o seu resumo: {{$item(0).$node['Format Plan Output'].json.plan_summary}}. Vou te lembrar nos horários combinados para cada hábito."
    }
})

nodes.append({
    "id": "21",
    "name": "Detect Confirmation",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [-700, 300],
    "parameters": {"functionCode": detect_confirmation_code}
})

nodes.append({
    "id": "22",
    "name": "IF Confirmation",
    "type": "n8n-nodes-base.if",
    "typeVersion": 2,
    "position": [-520, 300],
    "parameters": {"conditions": {"boolean": [{"value1": "={{$json.is_confirmation}}"}]}}
})

nodes.append(supabase_http_node(
    "23",
    "Fetch Pending Habit",
    "GET",
    "/rest/v1/habits",
    [-340, 220],
    [
        {"name": "user_id", "value": "={{'eq.' + $json.user.id}}"},
        {"name": "is_active", "value": "eq.true"},
        {"name": "select", "value": "id,name,user_id"},
        {"name": "limit", "value": "1"}
    ]
))

nodes.append(supabase_http_node(
    "24",
    "Upsert Habit Log",
    "POST",
    "/rest/v1/habit_logs",
    [-160, 220],
    body_expr='={{ [{"habit_id": ($json[0]?.id ?? $json.id), "user_id": ($json[0]?.user_id ?? $json.user_id ?? $item(0).$node['Detect Confirmation'].json.user.id), "completed": true, "date": (new Date()).toISOString().slice(0,10), "completed_at": (new Date()).toISOString()}] }}'
))

nodes.append({
    "id": "25",
    "name": "Send Celebration",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [20, 220],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$item(0).$node['Normalize Incoming'].json.phone}}",
        "text": "Sensacional! Registro marcado aqui. Continue firme! Se quiser ajustar algo, é só me falar."
    }
})

nodes.append(supabase_http_node(
    "26",
    "Fetch Active Habits",
    "GET",
    "/rest/v1/habits",
    [-340, 420],
    [
        {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
        {"name": "is_active", "value": "eq.true"},
        {"name": "select", "value": "id,name,type,frequency,reminder_times"}
    ]
))

nodes.append(supabase_http_node(
    "27",
    "Fetch Today Progress",
    "GET",
    "/rest/v1/habit_logs",
    [-160, 420],
    [
        {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
        {"name": "date", "value": "={{'eq.' + $now.toFormat('yyyy-LL-dd')}}"}
    ]
))

nodes.append(supabase_http_node(
    "28",
    "Fetch Conversation History",
    "GET",
    "/rest/v1/conversations",
    [20, 420],
    [
        {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
        {"name": "order", "value": "timestamp.desc"},
        {"name": "limit", "value": "10"}
    ]
))

nodes.append({
    "id": "29",
    "name": "Build Agent Context",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [200, 420],
    "parameters": {"functionCode": build_context_code}
})

nodes.append({
    "id": "30",
    "name": "AI Agent Reply",
    "type": "n8n-nodes-langchain.agentTools",
    "typeVersion": 1,
    "position": [380, 420],
    "parameters": {
        "promptType": "define",
        "prompt": agent_prompt
    }
})

nodes.append({
    "id": "31",
    "name": "Send AI Reply",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [560, 420],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$item(0).$node['Normalize Incoming'].json.phone}}",
        "text": "={{$json.output || $json.text || 'Estou aqui com você. Vamos nessa!'}}"
    }
})

nodes.append({
    "id": "32",
    "name": "Reminder Cron",
    "type": "n8n-nodes-base.cron",
    "typeVersion": 1,
    "position": [-1600, 120],
    "parameters": {
        "triggerTimes": {
            "item": [
                {"mode": "everyX", "unit": "minutes", "value": 10}
            ]
        }
    }
})

nodes.append(supabase_http_node(
    "33",
    "Fetch Reminder Candidates",
    "GET",
    "/rest/v1/habits",
    [-1420, 120],
    [
        {"name": "is_active", "value": "eq.true"},
        {"name": "select", "value": "id,name,reminder_times,user_id,users(name,phone,timezone)"}
    ]
))

nodes.append({
    "id": "34",
    "name": "Filter Reminder Window",
    "type": "n8n-nodes-base.function",
    "typeVersion": 2,
    "position": [-1240, 120],
    "parameters": {"functionCode": filter_reminder_code}
})

nodes.append({
    "id": "35",
    "name": "Send Reminder",
    "type": "n8n-nodes-base.whatsAppBusinessCloud",
    "typeVersion": 1,
    "position": [-1060, 120],
    "parameters": {
        "operation": "sendMessage",
        "messageType": "text",
        "recipientPhoneNumber": "={{$json.phone}}",
        "text": "Oi {{$json.user_name}}! Hora do seu {{$json.habit_name}}. Cada passo conta!"
    }
})

connections = {
    "WhatsApp Trigger": {"main": [[{"node": "Normalize Incoming", "type": "main", "index": 0}]]},
    "Normalize Incoming": {"main": [[{"node": "Supabase Get User", "type": "main", "index": 0}]]},
    "Supabase Get User": {"main": [[{"node": "Classify User", "type": "main", "index": 0}]]},
    "Classify User": {"main": [[{"node": "Route User", "type": "main", "index": 0}]]},
    "Route User": {
        "main": [
            [{"node": "Create User Record", "type": "main", "index": 0}],
            [{"node": "Switch Onboarding Step", "type": "main", "index": 0}],
            [{"node": "Detect Confirmation", "type": "main", "index": 0}]
        ]
    },
    "Create User Record": {"main": [[{"node": "Send Step 1 Prompt", "type": "main", "index": 0}]]},
    "Switch Onboarding Step": {
        "main": [
            [{"node": "Update Step 1 Response", "type": "main", "index": 0}],
            [{"node": "Update Step 2 Response", "type": "main", "index": 0}],
            [{"node": "Update Step 3 Response", "type": "main", "index": 0}],
            [{"node": "Update Step 4 Response", "type": "main", "index": 0}],
            [{"node": "Generate Personalized Plan", "type": "main", "index": 0}]
        ]
    },
    "Update Step 1 Response": {"main": [[{"node": "Send Step 2 Prompt", "type": "main", "index": 0}]]},
    "Update Step 2 Response": {"main": [[{"node": "Send Step 3 Prompt", "type": "main", "index": 0}]]},
    "Update Step 3 Response": {"main": [[{"node": "Send Step 4 Prompt", "type": "main", "index": 0}]]},
    "Update Step 4 Response": {"main": [[{"node": "Generate Personalized Plan", "type": "main", "index": 0}]]},
    "Generate Personalized Plan": {"main": [[{"node": "Format Plan Output", "type": "main", "index": 0}]]},
    "Format Plan Output": {"main": [[{"node": "Insert Habits", "type": "main", "index": 0}]]},
    "Insert Habits": {"main": [[{"node": "Complete Onboarding", "type": "main", "index": 0}]]},
    "Complete Onboarding": {"main": [[{"node": "Send Plan Summary", "type": "main", "index": 0}]]},
    "Detect Confirmation": {"main": [[{"node": "IF Confirmation", "type": "main", "index": 0}]]},
    "IF Confirmation": {
        "main": [
            [{"node": "Fetch Pending Habit", "type": "main", "index": 0}],
            [{"node": "Fetch Active Habits", "type": "main", "index": 0}]
        ]
    },
    "Fetch Pending Habit": {"main": [[{"node": "Upsert Habit Log", "type": "main", "index": 0}]]},
    "Upsert Habit Log": {"main": [[{"node": "Send Celebration", "type": "main", "index": 0}]]},
    "Fetch Active Habits": {"main": [[{"node": "Fetch Today Progress", "type": "main", "index": 0}]]},
    "Fetch Today Progress": {"main": [[{"node": "Fetch Conversation History", "type": "main", "index": 0}]]},
    "Fetch Conversation History": {"main": [[{"node": "Build Agent Context", "type": "main", "index": 0}]]},
    "Build Agent Context": {"main": [[{"node": "AI Agent Reply", "type": "main", "index": 0}]]},
    "AI Agent Reply": {"main": [[{"node": "Send AI Reply", "type": "main", "index": 0}]]},
    "Reminder Cron": {"main": [[{"node": "Fetch Reminder Candidates", "type": "main", "index": 0}]]},
    "Fetch Reminder Candidates": {"main": [[{"node": "Filter Reminder Window", "type": "main", "index": 0}]]},
    "Filter Reminder Window": {"main": [[{"node": "Send Reminder", "type": "main", "index": 0}]]}
}

workflow = {
    "name": "Assistente Desenvolvimento Pessoal MVP",
    "versionId": str(uuid4()),
    "nodes": nodes,
    "connections": connections,
    "settings": {"executionOrder": "v1"}
}

with open(r"C:\\Users\\bruno\\Documents\\Trendly\\Claude Code\\Foquinha Ai\\Docs\\Codex\\assistente_dev_pessoal_workflow.json", "w", encoding="utf-8") as f:
    json.dump(workflow, f, ensure_ascii=False, indent=2)
