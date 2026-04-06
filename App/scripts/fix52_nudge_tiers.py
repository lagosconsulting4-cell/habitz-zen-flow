"""
Fix 52: Nudge Tiers (Usuario Novo vs Ativo) — verify and redeploy.

Context: fix44_nudge_tiers.py already deployed tiered nudge logic to
agr9lH57zHvusH73. This script verifies the current state and re-applies
the canonical SQL + JS if needed, so the fix is idempotent.

New users (< 3 days OR < 3 completions): gentle/welcoming nudge
Active users: playful Duolingo-style nudge (existing behavior)

Targets: agr9lH57zHvusH73 (ACTIVE — chatbot_foquinha)
         Uv6dId5a1J9DtVc6 (INACTIVE — Foquinha WhatsApp Reminders)
         The inactive workflow has no 22h nudge nodes, so only main is patched.
"""
import json, urllib.request

API = 'https://n8n-evo-n8n.harxon.easypanel.host/api/v1'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308'
WF_MAIN_ID = 'agr9lH57zHvusH73'  # chatbot_foquinha (ACTIVE)
WF_NUDGE_ID = 'Uv6dId5a1J9DtVc6'  # Foquinha WhatsApp Reminders (INACTIVE — no nudge nodes)


def api(method, path, body=None):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8') if body else None
    req = urllib.request.Request(
        f'{API}{path}', data=data, method=method,
        headers={'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json'}
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'body': e.read().decode()[:300]}


# --- canonical SQL for Fetch 22h Inactive ---
CANONICAL_SQL = """SELECT p.user_id, p.phone, p.display_name, wc.last_user_message,
  EXTRACT(DAY FROM NOW() - p.created_at)::int AS account_age_days,
  (SELECT COUNT(*) FROM habit_completions hc WHERE hc.user_id = p.user_id)::int AS total_completions
FROM profiles p
JOIN whatsapp_conversations wc ON wc.user_id = p.user_id
WHERE p.phone IS NOT NULL AND p.phone != ''
  AND wc.last_user_message <= NOW() - INTERVAL '20 hours'
  AND wc.last_user_message > NOW() - INTERVAL '23 hours 30 minutes'
  AND EXISTS (
    SELECT 1 FROM habits h
    WHERE h.user_id = p.user_id AND h.is_active = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM notification_history nh
    WHERE nh.user_id = p.user_id
      AND nh.context_type = 'whatsapp_24h_nudge'
      AND nh.notification_date = $1::date
  )
  AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Sao_Paulo') BETWEEN 7 AND 22
  AND (wc.opted_out IS NOT TRUE)"""

# --- canonical JS for Generate Nudge ---
CANONICAL_JS = r"""// Generate 22h Nudge -- tiered by user maturity
// New users (< 3 days OR < 3 completions) get gentle nudges
// Active users get playful Duolingo-style nudges
const items = $input.all();
const results = [];
const seal = String.fromCodePoint(0x1F9AD); // seal emoji

// Gentle nudges for new users
const newUserNudges = [
  (n) => `Oi ${n}! ${seal} So passando pra ver se esta tudo bem. Qualquer duvida sobre como funciono, e so perguntar!`,
  (n) => `${n}, vi que voce criou seus lembretes! Se quiser ajustar alguma coisa, estou aqui ${seal}`,
  (n) => `Oi ${n}! Lembrete amigavel: pra eu continuar te enviando lembretes pelo WhatsApp, preciso que me mande uma mensagem de vez em quando. Um "oi" ja basta! ${seal}`,
  (n) => `${n}, tudo bem? ${seal} To aqui pra te ajudar a organizar seu dia! Se precisar de algo, e so chamar.`,
  (n) => `Oi ${n}! ${seal} Sabia que posso te lembrar de qualquer coisa? Reunioes, habitos, tarefas... e so me pedir! Manda um oi pra gente continuar conversando.`,
  (n) => `${n}, espero que esteja tudo bem! ${seal} Pra manter seus lembretes funcionando, preciso de uma mensagenzinha sua de vez em quando. Pode ser ate um emoji!`,
];

// Playful nudges for active users (existing behavior)
const activeUserNudges = [
  (n) => `Eiii ${n}! Ta me ignorando? ${seal} Se nao falar comigo hoje, vou ter que pausar seus lembretes...`,
  (n) => `${n}, sumiu! ${seal} Manda um oi pra eu continuar te ajudando amanha!`,
  (n) => `Foquinha carente aqui ${seal} Preciso de pelo menos um "oi" por dia pra continuar funcionando!`,
  (n) => `Psiu, ${n}! ${seal} Se nao me responder hoje, vou dormir e nao vou te lembrar de nada amanha...`,
  (n) => `${n}! To esperando... ${seal} Manda qualquer coisa pra eu saber que ta tudo bem!`,
  (n) => `Oi ${n}, sou eu de novo ${seal} Ultima chamada do dia! Sem resposta = sem lembrete amanha.`,
  (n) => `${seal} *cutuca* ${n}? Preciso de um sinal de vida pra continuar mandando seus lembretes!`,
  (n) => `${n}, cade voce? ${seal} Eu sei que voce ta ai... me responde vai!`,
  (n) => `Alooou ${n}! ${seal} Uma foquinha precisa de atencao, sabia? Me manda um oi!`,
  (n) => `${n}, vou contar ate 3... ${seal} Brincadeira! Mas seria legal um oi pra eu saber que posso continuar te ajudando.`,
  (n) => `To aqui sozinha, ${n}... ${seal} Um "oi" ja basta pra eu ficar feliz e continuar com seus lembretes!`,
  (n) => `${seal} ${n}, nao me abandona! Se falar comigo hoje, prometo ser a melhor assistente do mundo amanha.`,
];

for (const item of items) {
  // Fix #26: Guard against empty rows from Postgres alwaysOutputData
  if (!item.json.phone || !item.json.user_id) continue;

  const name = item.json.display_name || 'amigo(a)';
  const ageDays = item.json.account_age_days || 0;
  const completions = item.json.total_completions || 0;

  // New user: < 3 days old OR < 3 completions
  const isNewUser = ageDays < 3 || completions < 3;
  const pool = isNewUser ? newUserNudges : activeUserNudges;
  const idx = Math.floor(Math.random() * pool.length);
  const message = pool[idx](name);

  results.push({
    json: {
      user_id: item.json.user_id,
      phone: item.json.phone,
      display_name: name,
      message,
      message_type: '24h_nudge',
      tier: isNewUser ? 'new_user' : 'active_user'
    }
  });
}

return results;"""


def update_workflow(wf_id):
    print(f'\nFetching workflow {wf_id}...')
    req = urllib.request.Request(
        f'{API}/workflows/{wf_id}',
        headers={'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json'}
    )
    wf = json.loads(urllib.request.urlopen(req, timeout=30).read())
    print(f'  Name: {wf["name"]} (active={wf["active"]})')

    changes = 0
    for node in wf['nodes']:
        if node.get('name') == 'Fetch 22h Inactive':
            current = node['parameters'].get('query', '')
            if 'account_age_days' not in current or 'total_completions' not in current:
                node['parameters']['query'] = CANONICAL_SQL
                print('  M1: Fetch 22h Inactive SQL updated (was missing maturity fields)')
                changes += 1
            else:
                print('  M1: Fetch 22h Inactive SQL already correct (account_age_days + total_completions present)')

        if node.get('name') == 'Generate Nudge':
            current = node['parameters'].get('jsCode', '')
            if 'isNewUser' not in current or 'newUserNudges' not in current:
                node['parameters']['jsCode'] = CANONICAL_JS
                print('  M2: Generate Nudge updated (tiered logic was missing)')
                changes += 1
            else:
                print('  M2: Generate Nudge already has tiered logic (isNewUser + newUserNudges present)')

    if changes > 0:
        print(f'\n  Deploying {changes} change(s) to {wf_id}...')
        if wf.get('active'):
            r = api('POST', f'/workflows/{wf_id}/deactivate')
            print(f'  Deactivated: {r.get("active", r)}')

        payload = {
            'name': wf['name'],
            'nodes': wf['nodes'],
            'connections': wf['connections'],
            'settings': wf.get('settings', {}),
        }
        r = api('PUT', f'/workflows/{wf_id}', payload)
        print(f'  Updated: {r.get("updatedAt", r.get("error", "unknown"))}')

        if wf.get('active'):
            r = api('POST', f'/workflows/{wf_id}/activate')
            print(f'  Activated: {r.get("active", r)}')
        else:
            print('  Workflow is INACTIVE — not reactivating (intentional)')
    else:
        print('  No changes needed — already up to date.')

    return changes


def verify(wf_id):
    req = urllib.request.Request(
        f'{API}/workflows/{wf_id}',
        headers={'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json'}
    )
    wf = json.loads(urllib.request.urlopen(req, timeout=30).read())
    for node in wf['nodes']:
        if node['name'] in ('Fetch 22h Inactive', 'Generate Nudge'):
            code = node['parameters'].get('jsCode', '') or node['parameters'].get('query', '')
            has_age = 'account_age_days' in code
            has_comp = 'total_completions' in code
            has_new = 'isNewUser' in code or 'newUserNudges' in code
            print(f'  VERIFY {wf_id}/{node["name"]}: account_age={has_age}, '
                  f'total_completions={has_comp}, tiered={has_new}')


print('=== fix52: Nudge Tiers (Usuario Novo vs Ativo) ===')
print()

# Step 1: Check inactive workflow for nudge nodes
print('Checking inactive workflow (Uv6dId5a1J9DtVc6)...')
req = urllib.request.Request(
    f'{API}/workflows/{WF_NUDGE_ID}',
    headers={'X-N8N-API-KEY': KEY, 'Content-Type': 'application/json'}
)
wf_nudge = json.loads(urllib.request.urlopen(req, timeout=30).read())
nudge_nodes_in_inactive = [n['name'] for n in wf_nudge['nodes']
                            if any(k in n['name'].lower()
                                   for k in ['22h', 'nudge', 'inactive'])]
if nudge_nodes_in_inactive:
    print(f'  Found nudge nodes in inactive wf: {nudge_nodes_in_inactive}')
    update_workflow(WF_NUDGE_ID)
else:
    print('  No 22h nudge nodes in inactive workflow — skipping (not applicable).')

# Step 2: Patch main chatbot workflow
update_workflow(WF_MAIN_ID)

# Step 3: Verify
print('\n=== VERIFICATION ===')
verify(WF_MAIN_ID)

print('\nDone!')
