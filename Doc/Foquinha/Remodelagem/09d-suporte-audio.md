# 09d MEDIO-ALTO: Suporte a Audio via Whisper

## Problema

Usuarios que enviam audios (voice notes) no WhatsApp recebem:
```
Opa! Por enquanto eu so entendo texto 🦊 Manda em texto que te ajudo!
```

Isso **rejeita** uma parcela significativa de usuarios brasileiros que preferem enviar audio a digitar — especialmente no contexto informal do WhatsApp.

## Evidencia

### Fluxo atual
- Node `Extract Data` detecta `messageType === 'audio'` e marca `isNonText: true`
- Node `Call OpenAI API` tem um **early return** que rejeita mensagens nao-texto:
  ```javascript
  if (ctx.isNonText === true) {
    return { json: { ...ctx, ai_response: "Opa! Por enquanto eu so entendo texto..." } };
  }
  ```
- Nao existe nenhum processamento de audio no workflow

### Impacto
- Usuarios que preferem audio abandonam a interacao
- Perda de engagement especialmente em mobile
- Feature esperada por usuarios que usam WhatsApp no dia a dia

## Pesquisa: Abordagem Tecnica

### WhatsApp Audio Format
- **Formato:** OGG container com codec Opus
- **Bitrate:** 16-32 kbps
- **Tamanho:** ~100-200 KB por minuto
- **Duracao maxima:** ~15 minutos

**Fonte:** [dBpoweramp Forum](https://forum.dbpoweramp.com/forum/dbpoweramp/music-converter/38478-whatsapp-voice-message-opus-ogg)

### OpenAI Whisper Compatibilidade
- Formatos aceitos: `flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm`
- **OGG e nativamente suportado** — ZERO conversao necessaria
- Limite de arquivo: 25 MB (voice notes de 15min = ~3 MB — bem dentro)
- Idioma: `pt` (Portuguese) melhora acuracia

### Meta Graph API — Download de Media
Processo em 2 etapas:

**Etapa 1: Obter URL de download**
```
GET https://graph.facebook.com/v21.0/{media_id}
Authorization: Bearer {WHATSAPP_TOKEN}
→ { "url": "https://lookaside.fbsbx.com/...", "mime_type": "audio/ogg; codecs=opus" }
```

**Etapa 2: Download do binario**
```
GET {url_da_etapa_1}
Authorization: Bearer {WHATSAPP_TOKEN}
→ binary audio data
```

**IMPORTANTE:** A URL de download expira em **5 minutos**.

**Fontes:**
- [Meta WhatsApp Cloud API - Media Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media/)
- [Download media via WhatsApp Cloud API (Medium)](https://medium.com/@shreyas.sreedhar/downloading-media-using-whatsapps-cloud-api-webhooks-and-uploading-it-to-aws-s3-bucket-via-nodejs-07c5cbae896f)

### n8n: Atalho built-in
O node `n8n-nodes-base.whatsApp` v1.1 tem operacao `mediaUrlGet` que faz a Etapa 1 automaticamente. So precisa passar o `media_id`.

### Templates de Referencia
| Template | Views | Descricao |
|----------|-------|-----------|
| [#3586 AI WhatsApp Chatbot (Text, Voice, Images, PDFs)](https://n8n.io/workflows/3586) | 71,396 | **Referencia principal** — mesmo padrao |
| [#6077 Transcribe WhatsApp audio via Groq](https://n8n.io/workflows/6077) | - | Alternativa com Groq (gratuito) |
| [#9440 WhatsApp + GPT-4o + Whisper + Redis](https://n8n.io/workflows/9440) | - | Com memoria de conversa |

### Custo
| Modelo | Preco/min | 50 audios/dia (30s) | Mensal (~1500) |
|--------|-----------|---------------------|----------------|
| Whisper-1 | $0.006 | $0.15/dia | ~$4.50/mes |
| GPT-4o-mini Transcribe | $0.003 | $0.075/dia | ~$2.25/mes |

Download de media via WhatsApp API: **gratuito**.

## Arquitetura da Solucao

### Ponto de insercao
Entre `Extract Data` e `Get User by Phone`:

```
Extract Data (5a4e85ae)
    │
    ▼
[NEW: Is Audio?] ─── FALSE ──→ Get User by Phone (existente)
    │
    TRUE
    ▼
[NEW: Get Audio URL] (WhatsApp mediaUrlGet)
    │
    ▼
[NEW: Download Audio] (HTTP Request)
    │
    ▼
[NEW: Transcribe Audio] (OpenAI Whisper)
    │
    ▼
[NEW: Set Transcribed Text] (Set node)
    │
    ▼
Get User by Phone (rejoin na mesma pipeline)
```

## Implementacao Detalhada

### Arquivo: `App/scripts/fix09_fase4_audio.py`

### Mudanca 1: Modificar "Extract Data" (5a4e85ae)

Adicionar extracao de `audioId`:

```javascript
// Adicionar na secao de extracao:
const audioId = (messageType === 'audio') ? (message.audio?.id || '') : '';

// Incluir no return:
return { json: { phone, text, messageId, timestamp, messageType, isNonText, audioId } };
```

### Novo node 1: "Is Audio?" (IF)

**ID:** `is-audio-node`
**Tipo:** `n8n-nodes-base.if` v2

```json
{
  "conditions": {
    "options": { "version": 2, "caseSensitive": true, "typeValidation": "strict" },
    "combinator": "and",
    "conditions": [{
      "operator": { "type": "string", "operation": "equals" },
      "leftValue": "={{ $json.messageType }}",
      "rightValue": "audio"
    }]
  }
}
```
- **Output TRUE** → Get Audio URL
- **Output FALSE** → Get User by Phone (existente)

### Novo node 2: "Get Audio URL" (WhatsApp)

**ID:** `get-audio-url-node`
**Tipo:** `n8n-nodes-base.whatsApp` v1.1

```json
{
  "resource": "media",
  "operation": "mediaUrlGet",
  "mediaGetId": "={{ $('Extract Data').item.json.audioId }}"
}
```
**Credentials:** `whatsAppApi` existente (Foquinha, id: `WhL02olkGLDl7rxR`)

### Novo node 3: "Download Audio" (HTTP Request)

**ID:** `download-audio-node`
**Tipo:** `n8n-nodes-base.httpRequest` v4.2

```json
{
  "url": "={{ $json.url }}",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth"
}
```

**Credencial necessaria:** `httpHeaderAuth` com:
- Header Name: `Authorization`
- Header Value: `Bearer <WHATSAPP_PERMANENT_TOKEN>`

**NOTA IMPORTANTE:** Esta credential pode precisar ser criada manualmente no n8n. Usa o mesmo token de acesso que o WhatsApp node ja usa.

**Alternativa (sem criar credential):** Usar Code node com `this.helpers.httpRequest`:
```javascript
const url = $json.url;
const TOKEN = '<WHATSAPP_TOKEN>';
const response = await this.helpers.httpRequest({
  method: 'GET',
  url,
  headers: { 'Authorization': `Bearer ${TOKEN}` },
  encoding: 'arraybuffer',
  returnFullResponse: true
});
return { json: { url }, binary: { data: { data: response.body, mimeType: 'audio/ogg' } } };
```

### Novo node 4: "Transcribe Audio" (OpenAI)

**ID:** `transcribe-audio-node`
**Tipo:** `@n8n/n8n-nodes-langchain.openAi` v1.8

```json
{
  "resource": "audio",
  "operation": "transcribe",
  "binaryPropertyName": "data",
  "options": {
    "language": "pt",
    "temperature": 0
  }
}
```
**Credentials:** `openAiApi` existente no workflow

**Output:** `{ "text": "transcricao do audio aqui" }`

### Novo node 5: "Set Transcribed Text" (Set)

**ID:** `set-transcribed-text-node`
**Tipo:** `n8n-nodes-base.set` v3.4

```json
{
  "mode": "manual",
  "assignments": {
    "assignments": [
      { "name": "text", "type": "string", "value": "={{ $json.text }}" },
      { "name": "phone", "type": "string", "value": "={{ $('Extract Data').item.json.phone }}" },
      { "name": "messageId", "type": "string", "value": "={{ $('Extract Data').item.json.messageId }}" },
      { "name": "timestamp", "type": "string", "value": "={{ $('Extract Data').item.json.timestamp }}" },
      { "name": "messageType", "type": "string", "value": "audio_transcribed" },
      { "name": "isNonText", "type": "boolean", "value": false },
      { "name": "audioId", "type": "string", "value": "" }
    ]
  }
}
```

### Mudanca 2: Modificar "Call OpenAI API" (64c237d1)

O early return para `isNonText` precisa aceitar audio transcrito:

```javascript
// ANTES:
if (ctx.isNonText === true) {
  return { json: { ...ctx, ai_response: "Opa! Por enquanto eu so entendo texto..." } };
}

// DEPOIS:
if (ctx.isNonText === true && ctx.messageType !== 'audio_transcribed') {
  const fox = String.fromCodePoint(0x1F98A);
  return { json: {
    ...ctx,
    ai_response: `Opa! Por enquanto eu entendo texto e audio ${fox} Manda em texto ou audio que te ajudo!`,
    intent: 'conversation',
    intent_data: {},
    new_state: { pending_action: null, pending_data: {}, awaiting_input: null }
  }};
}
```

### Reconectar fluxo

1. **Remover:** Extract Data → Get User by Phone
2. **Adicionar:** Extract Data → Is Audio?
3. **Adicionar:** Is Audio? (FALSE, output 1) → Get User by Phone
4. **Adicionar:** Is Audio? (TRUE, output 0) → Get Audio URL
5. **Adicionar:** Get Audio URL → Download Audio → Transcribe Audio → Set Transcribed Text → Get User by Phone

### Logica do script:

```
1. GET workflow agr9lH57zHvusH73
2. Modificar jsCode do Extract Data (adicionar audioId)
3. Adicionar 5 novos nodes com positions e IDs
4. Modificar jsCode do Call OpenAI API (aceitar audio_transcribed)
5. Rewire: remover Extract Data → Get User by Phone
6. Adicionar novas conexoes (7 conexoes)
7. PUT workflow
8. Verificar: 5 novos nodes existem, Extract Data contem audioId, Call OpenAI API contem audio_transcribed
```

## Consideracoes Tecnicas

### URL de download expira em 5 minutos
O n8n processa nodes sequencialmente. Entre Get Audio URL e Download Audio, leva <1 segundo. Sem risco.

### Whisper accuracy em portugues
Definir `language: "pt"` melhora significativamente a acuracia. Whisper tambem lida bem com ruido de fundo.

### Audios longos
Voice notes de ate 15 minutos geram transcricoes de ate ~3000 palavras. O GPT-4o-mini tem window de 128k tokens — sem problema. A resposta sera limitada pelo max_tokens.

### Mensagens que NAO sao audio (imagem, sticker, video)
Continuam rejeitadas com a mensagem atualizada: "entendo texto e audio". Para futuro: seguir o mesmo padrao com Vision API para imagens.

### Credential httpHeaderAuth
A forma mais limpa e criar uma credential `httpHeaderAuth` no n8n com o Bearer token do WhatsApp. Se nao for possivel via API, usar Code node com header hardcoded (alternativa documentada acima).

## Verificacao

1. **Audio curto (~5s):** Enviar audio simples → deve receber resposta como se fosse texto
2. **Audio com comando:** Enviar audio dizendo "me lembra de beber agua as 3 da tarde" → deve criar lembrete
3. **Audio com "feito":** Enviar audio dizendo "fiz" ou "feito" → deve marcar habito
4. **Imagem/sticker:** Enviar imagem → deve receber "entendo texto e audio"
5. **Save Conversation State:** Verificar que a transcricao e salva como conteudo da mensagem

## Nodes referenciados

| Node | ID | Funcao |
|------|----|--------|
| Extract Data | `5a4e85ae-9645-4b71-b194-560891148e0b` | Extrair dados da mensagem |
| Get User by Phone | `b3b38566-f814-4eab-a31c-d92fd7c3a39f` | Buscar usuario no DB |
| Call OpenAI API | `64c237d1-dd50-41f1-bafa-55dd28c1a368` | Processar mensagem |
| WhatsApp Trigger | `9cfd88cb-5cce-42d8-9d4c-800c6db4d917` | Receber mensagem |

## Risco

**MEDIO** — Adiciona 5 nodes e modifica 2 existentes. A bifurcacao (IF node) isola o fluxo de audio do fluxo de texto — se audio falhar, texto continua funcionando. O principal risco e a credential do httpHeaderAuth (pode precisar de setup manual no n8n).
