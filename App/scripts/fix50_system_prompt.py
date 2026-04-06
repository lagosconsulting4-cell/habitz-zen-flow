"""
Fix 50: System Prompt Completo (days_of_week + duplicatas + multi-horario + confirmacao)

Aplica 4 correcoes no system prompt do no 'Call OpenAI API' (id: 64c237d1-dd50-41f1-bafa-55dd28c1a368)
que corrigem erros nas criacoes de habitos:

1. days_of_week com mapeamento explicito + exemplos (evita off-by-one)
2. Regra DUPLICATAS estrita (evita confundir "Academia" com "Correr")
3. Limitacao de 1 horario por habito (evita mentira sobre multi-horarios)
4. Confirmacao obrigatoria para casos complexos
"""
import json, urllib.request, urllib.error

API = 'https://n8n-evo-n8n.harxon.easypanel.host/api/v1'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308'
WF_ID = 'agr9lH57zHvusH73'

EXPECTED_CHANGES = 1

# Exact text found in the live workflow (verified by GET inspection)
OLD_TEXT = '  - Dias especificos ("seg, qua, sex"): frequency_type:"fixed_days", days_of_week com numeros (0=dom..6=sab).` : \'\';'

NEW_TEXT = '''  - Dias especificos: frequency_type:"fixed_days", days_of_week conforme MAPEAMENTO OBRIGATORIO abaixo.
  MAPEAMENTO DIAS (NUNCA erre): 0=Domingo, 1=Segunda, 2=Terca, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sabado
  EXEMPLOS: "segunda"→[1], "terca"→[2], "quarta"→[3], "quinta"→[4], "sexta"→[5], "sabado"→[6], "domingo"→[0]
  "seg a sex"→[1,2,3,4,5] | "fim de semana"→[0,6] | "seg,qua,sex"→[1,3,5] | "todo dia"→[0,1,2,3,4,5,6]
  NUNCA use 0 para segunda! 0=DOMINGO.

  DUPLICATAS - REGRA ESTRITA:
  - So considere duplicata se o nome for IDENTICO (ex: "Correr" e "Correr").
  - "Academia" != "Correr", "Yoga" != "Meditar" — atividades diferentes NAO sao duplicatas!
  - Na duvida, CRIE. E melhor ter 2 similares do que perder um pedido.

  LIMITACAO - 1 HORARIO POR HABITO:
  O sistema suporta APENAS 1 reminder_time por habito.
  Se usuario pedir horarios diferentes em dias diferentes (ex: "seg 17h e sab 6h"):
  - EXPLIQUE: "Como os horarios sao diferentes, vou criar 2 lembretes separados!"
  - CRIE 2 habitos: "Correr (seg/qua)" reminder_time="17:00" days_of_week=[1,3] e "Correr (sab)" reminder_time="06:00" days_of_week=[6]
  - NUNCA diga que configurou 2 horarios no mesmo habito.

  CONFIRMACAO OBRIGATORIA quando:
  - Multiplos dias com horarios DIFERENTES na mesma mensagem
  - Mais de 1 atividade diferente na mesma mensagem
  Formato: "Vou criar assim:\\n[lista dos habitos]\\nTa certo?"` : '';'''


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

    if name == 'Call OpenAI API':
        code = params.get('jsCode', '')

        # Guard: check if already patched
        if 'MAPEAMENTO OBRIGATORIO' in code:
            print(f'  [{name}]: patch ja aplicado, pulando')
            break

        if OLD_TEXT in code:
            new_code = code.replace(OLD_TEXT, NEW_TEXT)
            node['parameters']['jsCode'] = new_code
            changes += 1
            print(f'  [{name}]: system prompt atualizado OK')
        else:
            print(f'  [{name}]: AVISO - texto antigo nao encontrado!')
            idx = code.find('days_of_week')
            snippet = code[max(0, idx-80):idx+200] if idx >= 0 else code[:200]
            print(f'    Snippet atual: {repr(snippet)}')
        break

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
