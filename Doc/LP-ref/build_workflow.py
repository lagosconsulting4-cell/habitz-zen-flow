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

nodes = [
    {
        "id": "1",
        "name": "WhatsApp Trigger",
        "type": "n8n-nodes-base.whatsAppBusinessCloudTrigger",
        "typeVersion": 1,
        "position": [-1600, -200],
        "parameters": {
            "events": ["messages"]
        }
    },
    {
        "id": "2",
        "name": "Normalize Incoming",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [-1420, -200],
        "parameters": {
            "functionCode": normalize_code
        }
    },
    {
        "id": "3",
        "name": "Supabase Get User",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-1240, -200],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + $item(0).$node['Normalize Incoming'].json.phone}}"},
                    {"name": "select", "value": "*"},
                    {"name": "limit", "value": "1"}
                ]
            }
        }
    },
    {
        "id": "4",
        "name": "Classify User",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [-1060, -200],
        "parameters": {
            "functionCode": classify_code
        }
    },
    {
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
    },
    {
        "id": "6",
        "name": "Create User Record",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-700, -380],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "POST",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ phone: $json.phone, name: $json.profile_name || null, onboarding_step: 1, onboarding_completed: false, timezone: 'America/Sao_Paulo' }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
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
    },
    {
        "id": "8",
        "name": "Switch Onboarding Step",
        "type": "n8n-nodes-base.switch",
        "typeVersion": 2,
        "position": [-700, -40],
        "parameters": {
            "value1": "={{$json.user?.onboarding_step ?? $json.onboarding_step ?? 0}}",
            "rules": [
                {"operation": "equal", "value2": "1"},
                {"operation": "equal", "value2": "2"},
                {"operation": "equal", "value2": "3"},
                {"operation": "equal", "value2": "4"},
                {"operation": "equal", "value2": "5"}
            ]
        }
    },
    {
        "id": "9",
        "name": "Update Step 1 Response",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-520, -200],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "PATCH",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ goals: { raw: $json.text }, onboarding_step: 2 }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + $json.phone}}"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
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
    },
    {
        "id": "11",
        "name": "Update Step 2 Response",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-520, -40],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "PATCH",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ bad_habits: { raw: $json.text }, onboarding_step: 3 }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + $json.phone}}"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
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
    },
    {
        "id": "13",
        "name": "Update Step 3 Response",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-520, 120],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "PATCH",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ financial_situation: $json.text, onboarding_step: 4 }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + $json.phone}}"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
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
    },
    {
        "id": "15",
        "name": "Update Step 4 Response",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-520, 280],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "PATCH",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ available_times: { raw: $json.text }, onboarding_step: 5 }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + $json.phone}}"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
        "id": "16",
        "name": "Generate Personalized Plan",
        "type": "n8n-nodes-langchain.chatOpenAi",
        "typeVersion": 1,
        "position": [-340, 280],
        "parameters": {
            "model": "gpt-4o-mini",
            "promptType": "define",
            "prompt": "Você é um coach de desenvolvimento pessoal. Considere os dados do usuário abaixo e gere um plano de 3 hábitos para construir e até 2 hábitos para abandonar. Responda em JSON seguindo o formato {\\n  \\\"summary\\\": string,\\n  \\\"habits\\\": [\\n    {\\n      \\\"name\\\": string,\\n      \\\"type\\\": \\\"good\\\"|\\\"bad\\\",\\n      \\\"frequency\\\": string,\\n      \\\"reminder_times\\\": [string],\\n      \\\"guidance\\\": string\\n    }\\n  ]\\n}.\\n\\nDados do usuário: {{ JSON.stringify($item(0).$node['Update Step 4 Response'].json[0] ?? $item(0).$node['Update Step 4 Response'].json) }}"
        }
    },
    {
        "id": "17",
        "name": "Format Plan Output",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [-160, 280],
        "parameters": {
            "functionCode": format_plan_code
        }
    },
    {
        "id": "18",
        "name": "Insert Habits",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [20, 280],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habits",
            "method": "POST",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify($json.habits) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "options": {
                "response": {"response": "json"}
            }
        }
    },
    {
        "id": "19",
        "name": "Complete Onboarding",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [200, 280],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/users",
            "method": "PATCH",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify({ onboarding_completed: true, onboarding_step: 6 }) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "return=representation"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "phone", "value": "={{'eq.' + ($item(0).$node['Update Step 4 Response'].json[0]?.phone ?? $item(0).$node['Normalize Incoming'].json.phone)}}"}
                ]
            },
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            }
        }
    },
    {
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
    },
    {
        "id": "21",
        "name": "Detect Confirmation",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [-700, 300],
        "parameters": {
            "functionCode": detect_confirmation_code
        }
    },
    {
        "id": "22",
        "name": "IF Confirmation",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2,
        "position": [-520, 300],
        "parameters": {
            "conditions": {
                "boolean": [
                    {"value1": "={{$json.is_confirmation}}"}
                ]
            }
        }
    },
    {
        "id": "23",
        "name": "Fetch Pending Habit",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-340, 220],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habits",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "user_id", "value": "={{'eq.' + $json.user.id}}"},
                    {"name": "is_active", "value": "eq.true"},
                    {"name": "select", "value": "id,name,user_id"},
                    {"name": "limit", "value": "1"}
                ]
            }
        }
    },
    {
        "id": "24",
        "name": "Upsert Habit Log",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-160, 220],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habit_logs",
            "method": "POST",
            "jsonParameters": True,
            "bodyParametersJson": "={{ JSON.stringify([{ habit_id: ($json[0]?.id ?? $json.id), user_id: ($json[0]?.user_id ?? $json.user_id ?? $item(0).$node['Detect Confirmation'].json.user.id), completed: true, date: (new Date()).toISOString().slice(0,10), completed_at: (new Date()).toISOString() }]) }}",
            "headerParametersUi": {
                "parameter": [
                    {"name": "Prefer", "value": "resolution=merge-duplicates"},
                    {"name": "Content-Type", "value": "application/json"}
                ]
            },
            "options": {
                "response": {"response": "json"}
            }
        }
    },
    {
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
    },
    {
        "id": "26",
        "name": "Fetch Active Habits",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-340, 420],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habits",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
                    {"name": "is_active", "value": "eq.true"},
                    {"name": "select", "value": "id,name,type,frequency,reminder_times"}
                ]
            }
        }
    },
    {
        "id": "27",
        "name": "Fetch Today Progress",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-160, 420],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habit_logs",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
                    {"name": "date", "value": "={{'eq.' + $now.toFormat('yyyy-LL-dd')}}"}
                ]
            }
        }
    },
    {
        "id": "28",
        "name": "Fetch Conversation History",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [20, 420],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/conversations",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "user_id", "value": "={{'eq.' + $item(0).$node['Detect Confirmation'].json.user.id}}"},
                    {"name": "order", "value": "timestamp.desc"},
                    {"name": "limit", "value": "10"}
                ]
            }
        }
    },
    {
        "id": "29",
        "name": "Build Agent Context",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [200, 420],
        "parameters": {
            "functionCode": build_agent_context_code
        }
    },
    {
        "id": "30",
        "name": "AI Agent Reply",
        "type": "n8n-nodes-langchain.agentTools",
        "typeVersion": 1,
        "position": [380, 420],
        "parameters": {
            "promptType": "define",
            "prompt": "Você é um assistente de desenvolvimento pessoal amigável, motivador e direto. Use o contexto fornecido para responder a mensagem do usuário. Seja acolhedor, reconheça avanços e proponha ações específicas. Contexto do usuário: {{ JSON.stringify($json.user) }}. Hábitos ativos: {{ JSON.stringify($json.habits) }}. Progresso de hoje: {{ JSON.stringify($json.logs) }}. Histórico recente: {{ JSON.stringify($json.history) }}. Mensagem do usuário: {{$json.text}}"
        }
    },
    {
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
    },
    {
        "id": "32",
        "name": "Reminder Cron",
        "type": "n8n-nodes-base.cron",
        "typeVersion": 1,
        "position": [-1600, 120],
        "parameters": {
            "triggerTimes": {
                "item": [
                    {"hour": 0, "minute": 5, "mode": "everyX", "every": 10}
                ]
            }
        }
    },
    {
        "id": "33",
        "name": "Fetch Reminder Candidates",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [-1420, 120],
        "parameters": {
            "authentication": "headerAuth",
            "url": "https://llxkhcgmbumqedrdarmr.supabase.co/rest/v1/habits",
            "options": {
                "response": {"response": "json"},
                "splitIntoItems": False
            },
            "queryParametersUi": {
                "parameter": [
                    {"name": "is_active", "value": "eq.true"},
                    {"name": "select", "value": "id,name,reminder_times,user_id,users(name,phone,timezone)"}
                ]
            }
        }
    },
    {
        "id": "34",
        "name": "Filter Reminder Window",
        "type": "n8n-nodes-base.function",
        "typeVersion": 2,
        "position": [-1240, 120],
        "parameters": {
            "functionCode": filter_reminder_code
        }
    },
    {
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
    }
]

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
