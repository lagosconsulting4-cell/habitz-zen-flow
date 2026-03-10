# Supabase Edge Function Logs via Management API

**Data:** 05/03/2026
**Objetivo:** Acessar logs de Edge Functions sem abrir o Dashboard

---

## O Problema

A Supabase CLI (testado na v2.75.0) **nao tem** comando `functions logs`. Os subcomandos disponiveis sao apenas: `delete`, `deploy`, `download`, `list`, `new`, `serve`.

Para ver logs de edge functions em producao, as opcoes sao:
1. **Dashboard** — requer login manual no browser (funciona, mas nao e automatizavel)
2. **Management API** — endpoint REST que aceita queries SQL sobre os logs (solucao documentada aqui)

---

## Solucao: Management API

### Endpoint

```
GET https://api.supabase.com/v1/projects/{ref}/analytics/endpoints/logs.all
```

Para o projeto Habitz:
```
GET https://api.supabase.com/v1/projects/jbucnphyrziaxupdsnbn/analytics/endpoints/logs.all
```

### Parametros (query string)

| Parametro | Obrigatorio | Descricao |
|-----------|-------------|-----------|
| `iso_timestamp_start` | Sim | Inicio do periodo (ISO 8601, ex: `2026-03-05T10:00:00Z`) |
| `iso_timestamp_end` | Sim | Fim do periodo (ISO 8601) |
| `sql` | Nao | Query SQL customizada (subset de BigQuery). Se omitido, retorna todos os `edge_logs` |

### Autenticacao

Header obrigatorio:
```
Authorization: Bearer sbp_xxxxx
```

O token e um **Personal Access Token (PAT)** do Supabase. Existem duas formas de obte-lo:

#### Opcao 1: Via CLI (ja configurado)

Quando voce roda `supabase login`, a CLI armazena o PAT no **Windows Credential Manager**:

- **Target:** `Supabase CLI:supabase`
- **User:** `supabase`
- **Tipo:** LegacyGeneric

Para verificar que existe:
```powershell
cmdkey /list
# Procure por: LegacyGeneric:target=Supabase CLI:supabase
```

#### Opcao 2: Gerar manualmente

1. Acesse https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Copie o token (comeca com `sbp_`)
4. Use diretamente no header `Authorization: Bearer sbp_...`

---

## Tabelas de Log Disponiveis

A Management API expoe tres tabelas de log via SQL:

| Tabela | Conteudo | Quando usar |
|--------|----------|-------------|
| `edge_logs` | Logs gerais da API (REST, Auth, Storage, Realtime) | Debug de chamadas REST, erros de auth |
| `function_edge_logs` | Invocacoes de Edge Functions (HTTP method, status, URL) | Ver quais functions foram chamadas e seus status codes |
| `function_logs` | **Console output** (console.log, console.error, console.warn) | **Debug de logica interna das functions** |

Para debug de edge functions, `function_logs` e a mais util — contem tudo que voce escreve com `console.log()` dentro da function.

---

## Queries SQL Uteis

### 1. Logs de console de uma edge function especifica

```sql
select id, timestamp, event_message
from function_logs
where event_message like '%hubla%'
order by timestamp desc
limit 50
```

Substitua `%hubla%` pelo nome/identificador da sua function.

### 2. Todas as invocacoes com status code

```sql
select id, timestamp, event_message
from function_edge_logs
where event_message like '%hubla-webhook%'
order by timestamp desc
limit 30
```

Retorna linhas como:
```
POST | 200 | https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/hubla-webhook
```

### 3. Buscar somente erros

```sql
select id, timestamp, event_message
from function_logs
where event_message like '%error%'
   or event_message like '%ERROR%'
   or event_message like '%fail%'
order by timestamp desc
limit 30
```

### 4. Logs gerais da API (REST/Auth)

```sql
select id, timestamp, event_message
from edge_logs
order by timestamp desc
limit 10
```

### 5. Invocacoes de uma function especifica por function_id

O `function_id` do hubla-webhook e `722efa1b-b76f-4e94-af39-3b59ff8a6333` (visivel via `supabase functions list`).

---

## Formato do Timestamp

Os timestamps retornados estao em **microseconds desde epoch** (nao milliseconds).

Para converter para data legivel:
- **JavaScript:** `new Date(timestamp / 1000)`
- **PowerShell:** `[DateTimeOffset]::FromUnixTimeMilliseconds([long]($timestamp / 1000))`
- **Python:** `datetime.fromtimestamp(timestamp / 1_000_000)`

---

## Script Existente: query_edge_logs.ps1

Temos um script PowerShell pronto em `App/scripts/query_edge_logs.ps1` que:

1. Extrai o PAT do Windows Credential Manager automaticamente
2. Monta a query SQL
3. Chama a Management API
4. Formata e exibe os logs no terminal

### Como rodar

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "App/scripts/query_edge_logs.ps1"
```

### Como adaptar para outra function

Edite a linha da query SQL no script. Por exemplo, para ver logs do `stripe-webhook`:

```sql
select id, timestamp, event_message
from function_logs
where event_message like '%stripe-webhook%'
order by timestamp desc
limit 100
```

Ou para ver todas as functions:

```sql
select id, timestamp, event_message
from function_logs
order by timestamp desc
limit 50
```

### Como funciona a extracao do token

O script usa a API nativa do Windows (`advapi32.dll CredReadW`) via P/Invoke em C# inline para ler o credential store. Isso e necessario porque o Go keyring (usado pela CLI) armazena no Windows Credential Manager, que nao e acessivel via `cmdkey` para leitura de senhas.

---

## Limitacoes

| Limitacao | Detalhe |
|-----------|---------|
| Janela maxima | 24 horas por consulta (use `iso_timestamp_start` e `iso_timestamp_end`) |
| Retencao | ~7 dias no plano Free/Pro |
| SQL | Subset de BigQuery — nem todas as funcoes SQL estao disponiveis |
| Colunas | Variam por tabela — use `select *` com `limit 1` para descobrir o schema |
| Rate limit | Nao documentado, mas evite queries muito frequentes |

---

## IDs das Edge Functions (Habitz)

Para referencia rapida (via `supabase functions list`):

| Function | ID |
|----------|----|
| hubla-webhook | `722efa1b-b76f-4e94-af39-3b59ff8a6333` |
| stripe-webhook | `8619755b-e24c-4848-9fec-83b0a1bac98c` |
| create-checkout | `de284bd2-b17e-4ed4-add3-aaaa80296fd0` |
| create-password-direct | `708e7aeb-3c07-483a-954d-3d82cc981ce9` |
| kiwify-webhook | `95d244ee-b193-4581-a015-03e40bfc0879` |
| kirvano-webhook | `f0706e9a-aeaf-42e1-be1d-9551c55458d9` |

---

## Exemplo Completo com curl

Se preferir usar curl em vez do script PowerShell:

```bash
# Defina o token (substitua pelo seu PAT)
TOKEN="sbp_seu_token_aqui"
REF="jbucnphyrziaxupdsnbn"

# Periodo: ultimas 2 horas
START=$(date -u -d '2 hours ago' '+%Y-%m-%dT%H:%M:%SZ')
END=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

# Query
SQL="select id, timestamp, event_message from function_logs where event_message like '%hubla%' order by timestamp desc limit 30"

curl -s -G "https://api.supabase.com/v1/projects/$REF/analytics/endpoints/logs.all" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "iso_timestamp_start=$START" \
  --data-urlencode "iso_timestamp_end=$END" \
  --data-urlencode "sql=$SQL" | jq '.result[] | {timestamp, event_message}'
```

> **Nota:** No Windows com Git Bash, `date -d` pode nao funcionar. Use o script PowerShell.
