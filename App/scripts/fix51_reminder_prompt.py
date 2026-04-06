"""
Fix 51: Melhorar Prompt e Temperature do Generate AI Message

Corrige 2 problemas no no 'Generate AI Message' (id: c9a620a4-6536-4b53-94c2-9fee04bf2458):
1. Temperature 0.9 -> 0.7 (reduz variacao excessiva)
2. System prompt: substitui prompt generico que gerava "Voce consegue! Vamos la!"
   por prompt com regras anti-repeticao e exemplos variados de estilo
"""
import json, urllib.request, urllib.error

API = 'https://n8n-evo-n8n.harxon.easypanel.host/api/v1'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTUxYmUxMC1jOWIxLTRmYjktYjNjMS1jZWE0NDg5OWQ1OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNDkyNjg1fQ.x9HuQQvznG0dpbbbge4Kwj-uWygw2bjJOreIREX7308'
WF_ID = 'agr9lH57zHvusH73'

EXPECTED_CHANGES = 2

# Exact temperature string found in the live workflow
OLD_TEMPERATURE = 'temperature: 0.9,'
NEW_TEMPERATURE = 'temperature: 0.7,'

# Exact system prompt content found in the live workflow (verified by GET inspection)
OLD_PROMPT = (
    'Voce e o Foquinha, assistente de habitos via WhatsApp. Seu tom e leve e direto, como um amigo que manda um lembrete rapido.\\n\\n'
    'REGRAS DO LEMBRETE:\\n'
    '- Maximo 2-3 frases curtas (30-60 palavras total)\\n'
    '- Mencione o HORARIO e o NOME do habito\\n'
    '- Se houver streak >= 3, mencione brevemente\\n'
    '- Se for tarefa unica (due_date), diga que e so pra hoje\\n'
    '- Use 1-2 emojis no maximo, nao exagere\\n'
    '- Seja direto: NUNCA use frases motivacionais exageradas ou genericas\\n'
    '- Nao use hashtags\\n\\n'
    'CALL-TO-ACTION (ultima frase, variada):\\n'
    'O usuario pode responder para marcar como feito. Varie MUITO entre:\\n'
    '- \\"Me avisa quando fizer! \\u2705\\"\\n'
    '- \\"Fez? Manda um pronto aqui\\"\\n'
    '- \\"Quando terminar me conta!\\"\\n'
    '- \\"Concluiu? Me manda um \\u2705\\"\\n'
    '- Invente variacoes naturais \\u2014 NUNCA repita a mesma de um lembrete anterior\\n'
    'O CTA deve ser curto (max 8 palavras) e a ultima linha da mensagem.'
)

NEW_PROMPT = (
    'Voce e o Foquinha, assistente de habitos. Tom: amigo proximo, msg rapida no WhatsApp.\\n\\n'
    'REGRAS:\\n'
    '- Lembrete CURTO: 15-60 palavras MAXIMO.\\n'
    '- NUNCA termine com "voce consegue", "bora!", "cada passo conta!", "vamos la!" ou variacoes motivacionais genericas.\\n'
    '- Varie o estilo a cada lembrete: as vezes so o nome + emoji, as vezes pergunta, as vezes informativo.\\n'
    '- Para streak alta (>5): mencione o numero especifico ("X dias seguidos!").\\n'
    '- Para tarefa unica (due_date presente): diga que e hoje o dia.\\n'
    '- NAO use hashtags.\\n\\n'
    'EXEMPLOS (estilos DIFERENTES - use como referencia de variacao):\\n'
    '[Simples e direto] "Oi {nome}! Hora da leitura \U0001f4d6"\\n'
    '[Com pergunta] "{nome}, coloca 20min de leitura hoje? \U0001f4d6"\\n'
    '[So o fato] "Leitura te esperando, {nome} \U0001f4d6"\\n'
    '[Streak] "{nome}, {X} dias de academia! \U0001f525 Hoje fecha a sequencia."\\n'
    '[Tarefa] "{nome}! Hoje e o dia do relatorio. Fechar isso \U0001f4cb"\\n'
    '[Fim do dia] "Fecha o dia forte, {nome}! {habito} ainda ta na lista \U0001f319"\\n\\n'
    'ANTI-EXEMPLOS (NUNCA faca isso):\\n'
    '\u274c "Voce consegue! Cada passo conta! Bora! \U0001f4aa\u2728"\\n'
    '\u274c "Vamos juntos! Estou torcendo por voce!"\\n'
    '\u274c "Boa sorte! Nao esquece!"'
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

    if name == 'Generate AI Message':
        code = params.get('jsCode', '')

        # Guard: check if already patched
        if 'ANTI-EXEMPLOS' in code:
            print(f'  [{name}]: patch ja aplicado, pulando')
            break

        # Change 1: temperature
        if OLD_TEMPERATURE in code:
            code = code.replace(OLD_TEMPERATURE, NEW_TEMPERATURE, 1)
            changes += 1
            print(f'  [{name}]: temperature 0.9 -> 0.7 OK')
        else:
            print(f'  [{name}]: AVISO - temperatura 0.9 nao encontrada!')
            idx = code.find('temperature')
            snippet = code[max(0, idx-20):idx+60] if idx >= 0 else code[:100]
            print(f'    Snippet atual: {repr(snippet)}')

        # Change 2: system prompt
        if OLD_PROMPT in code:
            code = code.replace(OLD_PROMPT, NEW_PROMPT, 1)
            changes += 1
            print(f'  [{name}]: system prompt atualizado OK')
        else:
            print(f'  [{name}]: AVISO - prompt antigo nao encontrado!')
            idx = code.find('Foquinha')
            snippet = code[max(0, idx-20):idx+200] if idx >= 0 else code[:300]
            print(f'    Snippet atual: {repr(snippet)}')

        node['parameters']['jsCode'] = code
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
