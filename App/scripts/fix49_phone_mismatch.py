"""
Fix 49: Corrigir Phone Mismatch no Format DB Parameters

Root cause: O no 'Get/Create Conversation' retorna o registro com o phone no banco
(ex: 5594984175580, com o 9 digito BR), mas 'Format DB Parameters' repassa
data.phone = '559484175580' (phone do WhatsApp, sem o 9) para 'Save Conversation State',
que nunca encontra o registro para atualizar. 0 rows updated silenciosamente ->
historico nunca salvo -> bot sem memoria.

Fix:
1. Adicionar campo db_phone em Format DB Parameters, usando o phone retornado pelo
   no Get/Create Conversation (que e o phone real no banco).
2. Save Conversation State usa db_phone (com fallback para phone) no primeiro parametro.

Fix sistemico -- corrige o bug para TODOS os usuarios brasileiros com 9 digito.
"""
import json, urllib.request, urllib.error

API = 'https://n8n-evo-n8n.harxon.easypanel.host/api/v1'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308'
WF_ID = 'agr9lH57zHvusH73'

EXPECTED_CHANGES = 2

# The exact line to find in Format DB Parameters jsCode
FORMAT_ANCHOR = '    phone: data.phone,'

# The db_phone line to insert after FORMAT_ANCHOR.
# In the JS string the node name must be escaped as 'Get\/Create Conversation'
# because it is inside a JS expression inside a JSON string.
DB_PHONE_LINE = "    db_phone: ($('Get\\/Create Conversation').first().json.phone || data.phone),  // phone real no banco (pode diferir pelo 9o digito BR)"

# The exact queryReplacement to find in Save Conversation State
SAVE_OLD = (
    "={{ [$('Format DB Parameters').first().json.phone, "
    "$('Format DB Parameters').first().json.user_message, "
    "$('Format DB Parameters').first().json.assistant_message, "
    "$('Format DB Parameters').first().json.pending_action, "
    "$('Format DB Parameters').first().json.pending_data, "
    "$('Format DB Parameters').first().json.awaiting_input] }}"
)

# The replacement: first param uses db_phone with fallback
SAVE_NEW = (
    "={{ [($('Format DB Parameters').first().json.db_phone || $('Format DB Parameters').first().json.phone), "
    "$('Format DB Parameters').first().json.user_message, "
    "$('Format DB Parameters').first().json.assistant_message, "
    "$('Format DB Parameters').first().json.pending_action, "
    "$('Format DB Parameters').first().json.pending_data, "
    "$('Format DB Parameters').first().json.awaiting_input] }}"
)


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
        return {'error': e.code, 'body': e.read().decode('utf-8', errors='replace')[:500]}


print('Fetching workflow...')
wf = api('GET', f'/workflows/{WF_ID}')
if 'error' in wf:
    print(f'ERRO ao buscar workflow: {wf}')
    exit(1)

nodes = wf['nodes']
changes = 0

for node in nodes:
    name = node.get('name', '')
    params = node.get('parameters', {})

    # -------------------------------------------------------------------
    # Change 1: Format DB Parameters -- add db_phone field in jsCode
    # -------------------------------------------------------------------
    if name == 'Format DB Parameters':
        code = params.get('jsCode', '')
        if 'db_phone' in code:
            print(f'  [{name}]: db_phone ja existe, pulando')
        elif FORMAT_ANCHOR in code:
            new_code = code.replace(FORMAT_ANCHOR, FORMAT_ANCHOR + '\n' + DB_PHONE_LINE)
            node['parameters']['jsCode'] = new_code
            changes += 1
            print(f'  [{name}]: db_phone adicionado OK')
        else:
            print(f'  [{name}]: AVISO - ancora nao encontrada no jsCode')
            # Print a snippet to help diagnose
            idx = code.find('phone:')
            snippet = code[max(0, idx-20):idx+60] if idx >= 0 else code[:120]
            print(f'    Snippet: {repr(snippet)}')

    # -------------------------------------------------------------------
    # Change 2: Save Conversation State -- use db_phone as first param
    # -------------------------------------------------------------------
    elif name == 'Save Conversation State':
        # queryReplacement can be nested under 'options' or at top level
        options = params.get('options', {})
        qr = options.get('queryReplacement', '') or params.get('queryReplacement', '')

        if 'db_phone' in qr:
            print(f'  [{name}]: db_phone ja presente no queryReplacement, pulando')
        elif SAVE_OLD in qr:
            new_qr = qr.replace(SAVE_OLD, SAVE_NEW)
            if 'queryReplacement' in options:
                node['parameters']['options']['queryReplacement'] = new_qr
            else:
                node['parameters']['queryReplacement'] = new_qr
            changes += 1
            print(f'  [{name}]: queryReplacement atualizado com db_phone OK')
        else:
            print(f'  [{name}]: AVISO - queryReplacement nao encontrado ou diferente')
            print(f'    Atual (200 chars): {repr(qr[:200])}')

print(f'\nMudancas realizadas: {changes} (esperado: {EXPECTED_CHANGES})')

if changes != EXPECTED_CHANGES:
    print(f'ERRO: esperado {EXPECTED_CHANGES} mudancas, fez {changes}. Abortando deploy.')
    exit(1)

print('\nDeployando...')

r = api('POST', f'/workflows/{WF_ID}/deactivate')
print(f'  Deactivate: active={r.get("active", r)}')

payload = {
    'name': wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {})
}
r = api('PUT', f'/workflows/{WF_ID}', payload)
if 'id' in r:
    print(f'  PUT OK: updatedAt={r.get("updatedAt")}')
else:
    print(f'  ERRO no PUT: {r}')
    exit(1)

r = api('POST', f'/workflows/{WF_ID}/activate')
print(f'  Activate: active={r.get("active", r)}')

print('\nDeploy OK!')
