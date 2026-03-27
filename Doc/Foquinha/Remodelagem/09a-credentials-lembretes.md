# 09a CRITICO: Credentials Vazias no Generate AI Message

## Problema

O node `Generate AI Message` (`c9a620a4`) perdeu suas credentials durante o deploy do Fix #08. O campo `credentials` ficou `{}`. A chamada `httpRequestWithAuthentication('httpHeaderAuth', ...)` falha silenciosamente e **TODOS os lembretes mostram o fallback generico** em vez de mensagens AI personalizadas.

## Evidencia

### Mensagem que o usuario recebe (fallback):
```
Oi Bruno! Aqui e o Foquinha 🦊
Voce tem 1 tarefa(s) te esperando. Bora manter o ritmo? 💪

Quando fizer, me manda um FEITO aqui! ✅
```

### O que deveria receber (AI personalizada):
```
E ai, Bruno! 💧 Hora de se hidratar! Seu streak de 3 dias ta pedindo pra crescer.
Bora manter essa sequencia? Seu corpo agradece!

Fez? Manda um ✅ pra eu marcar!
```

### Causa raiz

O script `fix08_cta_lembretes.py` fez `PUT` no workflow com o payload:
```python
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],      # <- nodes perderam credentials
    "connections": wf["connections"],
    "settings": wf.get("settings", {}),
    "staticData": wf.get("staticData"),
}
```

O n8n nao preservou as credentials do node porque o `PUT` substituiu os nodes inteiros. O node original usava credencial `httpHeaderAuth` (ID: `4FAxHwqJ29eDwL6d`), mas o novo jsCode foi enviado sem o campo `credentials`.

### Investigacao

- **Node `c9a620a4`:** credentials = `{}` (vazio)
- **Node `64c237d1` (Call OpenAI API):** usa API key hardcoded — funciona normalmente
- **Workflow ativo:** sim (execucoes recentes com sucesso para chat, mas lembretes usam fallback)

## Solucao

Trocar o metodo de autenticacao para **API key hardcoded**, consistente com o node `Call OpenAI API` (`64c237d1`) que ja funciona assim. Isso elimina a dependencia de credentials do n8n e torna o node resiliente a futuros deploys via script.

### Por que NAO re-atachar a credential

1. Futuras atualizacoes via script podem apagar novamente
2. O padrao do workflow ja e hardcoded (node 64c237d1)
3. Menos pontos de falha

## Implementacao

### Arquivo: `App/scripts/fix09_fase1_credentials.py`

### Logica do script:

```
1. GET workflow agr9lH57zHvusH73
2. Encontrar node 64c237d1 (Call OpenAI API)
3. Extrair API key via regex: OPENAI_KEY = '([^']+)'
4. Encontrar node c9a620a4 (Generate AI Message)
5. Substituir jsCode para usar this.helpers.httpRequest com Authorization: Bearer
6. Manter o prompt com CTA do Fix #08
7. PUT workflow
8. Verificar: code contem Authorization, Bearer, Call-to-Action, FEITO
```

### Novo jsCode do node c9a620a4:

```javascript
const data = $json;
const periodLabel = $('Get BRT Time').item.json.periodLabel;
const OPENAI_KEY = '<extraido automaticamente do node 64c237d1>';

try {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: {
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'Voce e o Foquinha, um assistente de habitos fofo e motivacional (como o Duolingo, mas brasileiro). Seu tom e: animado, usa emojis, fala como amigo proximo. Voce envia um lembrete curto (30-80 palavras) sobre habitos pendentes. Nao use hashtags. Seja natural e varie as mensagens. Se houver streak, celebre. Se for tarefa unica (due_date), mencione que e hoje o dia.\n\nIMPORTANTE — Call-to-Action:\nAo final de CADA lembrete, inclua UMA chamada para acao simples e variada.\nO usuario pode responder para marcar o habito como concluido.\nVarie entre formas como:\n- "Quando fizer, me manda um FEITO aqui!"\n- "Me avisa quando completar, ta? ✅"\n- "Responde PRONTO quando terminar!"\n- "Fez? Manda um ✅ pra eu marcar!"\n- "Quando acabar, e so me dizer!"\nNAO repita a mesma frase em lembretes consecutivos. Seja criativo mas claro.\nO CTA deve ser a ULTIMA frase da mensagem, separado por uma quebra de linha.'
        },
        {
          role: 'user',
          content: `Mande um lembrete para ${data.display_name}. Periodo: ${periodLabel}. Habitos pendentes:\n${data.habits_text}`
        }
      ]
    },
    json: true
  });

  const aiMessage = response.choices[0].message.content;
  return { json: { ...data, ai_message: aiMessage } };

} catch (error) {
  const name = data.display_name || 'amigo';
  const count = data.habit_count || 1;
  const fox = String.fromCodePoint(0x1F98A);
  const muscle = String.fromCodePoint(0x1F4AA);
  const fallback = `Oi ${name}! Aqui e o Foquinha ${fox}\nVoce tem ${count} tarefa(s) te esperando. Bora manter o ritmo? ${muscle}\n\nQuando fizer, me manda um FEITO aqui!`;
  return { json: { ...data, ai_message: fallback } };
}
```

### Diferencas do codigo anterior:
| Antes | Depois |
|-------|--------|
| `this.helpers.httpRequestWithAuthentication.call(this, 'httpHeaderAuth', {...})` | `this.helpers.httpRequest({...headers: { Authorization: Bearer }})` |
| Depende de credential ID `4FAxHwqJ29eDwL6d` | Independente de credentials |
| Falha silenciosa se credential nao existe | Funciona enquanto a key for valida |

## Verificacao

1. **Imediata:** GET workflow → node `c9a620a4` → jsCode contem `Authorization`, `Bearer`, `FEITO`
2. **Funcional:** Aguardar proximo ciclo de lembretes → mensagem deve ser AI personalizada
3. **Fallback:** Se AI falhar (key invalida), fallback ainda funciona e contem CTA

## Nodes referenciados

| Node | ID | Funcao |
|------|----|--------|
| Generate AI Message | `c9a620a4-6536-4b53-94c2-9fee04bf2458` | Gera lembrete via OpenAI |
| Call OpenAI API | `64c237d1-dd50-41f1-bafa-55dd28c1a368` | Fonte da API key |

## Risco

**BAIXO** — Apenas troca o metodo de autenticacao. Mesmo modelo, mesmo prompt, mesma logica. A unica mudanca e como a API key e fornecida.
