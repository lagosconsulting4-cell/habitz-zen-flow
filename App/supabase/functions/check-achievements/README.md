# Achievement Detection Edge Function

Verifica automaticamente se usuários desbloquearam novas conquistas baseado em seus progressos.

## Como Funciona

1. **Trigger**: Executado a cada hora via Supabase Scheduler
2. **Lógica**:
   - Busca usuários com atividade nos últimos 24 horas
   - Para cada usuário, verifica todas as conquistas não-desbloqueadas
   - Se a condição for atendida (habit_count, streak_days, perfect_days, level_reached), desbloqueia
   - Gems são recompensadas automaticamente via função RPC `unlock_achievement()`

3. **Saída**: JSON com stats (quantos usuários, quantas conquistas desbloqueadas, erros)

## Deployment

### 1. Deploy Local (Desenvolvimento)

```bash
cd App/supabase
supabase functions deploy check-achievements
```

### 2. Configurar Schedule (Supabase Dashboard)

1. Ir para **Database** → **Cron Jobs** (ou **Functions** → **Scheduled**)
2. Criar novo scheduled job:
   - **Name**: `check-achievements-hourly`
   - **Schedule**: `0 * * * *` (todo hora no minuto 0)
   - **Function**: `check-achievements`
   - **Method**: `POST`
   - **Headers**: Adicionar `Authorization: Bearer <SUPABASE_ANON_KEY>`

### 3. Teste Manual

```bash
# Via cURL
curl -X POST https://<project-id>.supabase.co/functions/v1/check-achievements \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json"

# Ou via Supabase CLI
supabase functions invoke check-achievements
```

## Monitoramento

Logs aparecem em:
- Supabase Dashboard → Functions → Logs
- Função retorna JSON com:
  ```json
  {
    "success": true,
    "stats": {
      "activeUsers": 150,
      "achievements": 15,
      "unlockedCount": 5,
      "errorCount": 0
    },
    "unlocked": [
      { "userId": "...", "achievementId": "first_habit", "gemsRewarded": 50 }
    ]
  }
  ```

## Troubleshooting

### Erro: "SUPABASE_URL not found"
- Verificar que `.env.local` tem `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "User not found"
- Função usa SERVICE_ROLE_KEY para acesso total ao database
- RLS policies são ignoradas para funções edge

### Achievement não desbloqueia
- Verificar condição no banco (execute `SELECT * FROM achievements WHERE id = 'x'`)
- Verificar data em `user_progress` (last_activity_date)
- Executar query:
  ```sql
  SELECT total_habits_completed, current_streak, perfect_days, current_level
  FROM user_progress WHERE user_id = 'USER_ID';
  ```

## Configuração Alternativa com pg_cron

Se preferir usar PostgreSQL cron ao invés de Supabase Scheduler:

```sql
-- Executar a cada hora
SELECT cron.schedule(
  'check-achievements-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-id>.supabase.co/functions/v1/check-achievements',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <ANON_KEY>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

## Próximos Passos

1. Deploy no staging primeiro
2. Monitorar logs por 24 horas
3. Validar que achievements estão sendo desbloqueados
4. Deploy em produção
