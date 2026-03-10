# Foquinha WhatsApp — Diagnostico de UX

Data da investigacao: 2026-03-10
Workflow: `agr9lH57zHvusH73` (chatbot_foquinha)
Pipeline de lembretes: Schedule Trigger (5min) -> Fetch Due Habits -> Generate AI -> Send

## Problemas Identificados

| # | Arquivo | Problema | Severidade | Status |
|---|---------|----------|-----------|--------|
| 1 | [01-habitos-nao-solicitados.md](01-habitos-nao-solicitados.md) | Habitos criados automaticamente sem pedido do usuario | P0 CRITICO | Pendente |
| 2 | [02-habitos-duplicados.md](02-habitos-duplicados.md) | Mesmo habito criado multiplas vezes | P1 ALTO | Pendente |
| 3 | [03-motivacao-repetitiva.md](03-motivacao-repetitiva.md) | Lembretes sempre terminam com "Voce consegue!" | P1 ALTO | Pendente |
| 4 | [04-produto-desconhecido.md](04-produto-desconhecido.md) | Foquinha nao sabe informar sobre o BORA/app | P1 ALTO | Pendente |
| 5 | [05-agrupamento-lembretes.md](05-agrupamento-lembretes.md) | Multiplos lembretes separados no mesmo periodo | P2 MEDIO | Pendente |
| 6 | [06-ratio-bot-usuario.md](06-ratio-bot-usuario.md) | Ratio de mensagens bot:usuario muito alto | P2 MEDIO | Pendente |
| 7 | [07-loop-engajamento.md](07-loop-engajamento.md) | Sem resumo diario, progresso semanal ou celebracoes | P2 MEDIO | Pendente |
| 8 | [08-cta-lembretes.md](08-cta-lembretes.md) | Lembretes sem call-to-action claro para marcar como feito | P2 MEDIO | Pendente |

## Contexto Tecnico

- **System prompt:** Node `64c237d1-dd50-41f1-bafa-55dd28c1a368` (~20k chars jsCode)
- **Reminder prompt:** Node `Generate AI Message` (30-80 palavras, gpt-4o-mini, temp 0.9)
- **Fetch Due Habits:** SQL CTE com habit_effective_times, dedup via notification_history
- **Schedule Trigger:** Roda a cada 5 minutos
- **Group by User:** Agrupa habitos por telefone, gera 1 mensagem por usuario por execucao
- **Tabelas:** whatsapp_conversations, habits, habit_completions, notification_history, profiles

## Notas Importantes

- Se o usuario PEDIU um lembrete em determinado horario, nao e problema enviar naquele horario
- O foco e em lembretes/habitos que o usuario NAO solicitou
- Cancelamento (ponto original 3 do diagnostico) foi descartado — quando o produto e cancelado, o usuario para de receber lembretes naturalmente
- Link de pagamento do BORA para upsell: https://pay.hub.la/TnHQjCqYzq0WsJmjh5fj
