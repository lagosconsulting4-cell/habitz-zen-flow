# P0 CRITICO: Habitos Criados Automaticamente Sem Pedido do Usuario

## Problema

Usuarios estao recebendo lembretes de habitos que NUNCA pediram. Esses habitos parecem vir de templates do BORA que foram auto-criados durante o onboarding, sem confirmacao explicita do usuario.

## Evidencias

### Matheus (...9522)
- 22 mensagens no historico, TODAS sao [LEMBRETE]
- ZERO mensagens do usuario no historico visivel
- Recebe lembretes de:
  - "deep work"
  - "modo aviao / nao perturbe"
  - "inbox zero"
  - "screen time diario"
  - "toque de recolher digital"
  - "modo foco"
  - "sessao Pomodoro"
  - "tarefa #1 do dia"
  - "revisao semanal"
  - "trabalho focado"
- Nenhum desses parece ter sido solicitado por ele

### Rafael (...4042)
- Recebe lembretes de:
  - "arrumar a cama"
  - "hidratar 500mL"
  - "luz solar / ar livre"
  - "manha sem celular"
  - "sessao de deep work"
  - "modo aviao / nao perturbe"
- Ele conversou sobre tarefas do DIA (multas, boletos, academia, mercado) — nao pediu habitos de produtividade

### Lucineide (...6989)
- Pediu explicitamente: oracao antes de dormir (23:30) e anticoncepcional (8:30)
- Mas tambem recebe lembretes de:
  - "protocolo noturno"
  - "preparar mochila"
  - "screen time"
  - "toque de recolher digital"
  - "revisao semanal"
  - "trabalho focado"
  - "sessao Pomodoro"
  - "foco unico"
  - "hidratar 500mL"
  - "luz solar / ar livre"
  - "manha sem celular"
  - "deep work"
  - "arrumar a cama"
  - "hidratacao no treino"

## Impacto

- Usuarios recebem 5-11 lembretes/dia de coisas que nao pediram
- Isso transforma a Foquinha em SPAM no WhatsApp pessoal
- Usuarios ficam irritados (Lucas: "Pode parar os lembretes de agua")
- Destroi a percepcao de valor do produto

## Causa Raiz (Hipotese)

Os habitos provavelmente sao criados em bloco durante o onboarding do BORA/Foquinha, usando templates pre-definidos. O sistema cria todos os habitos da jornada/template de uma vez, sem que o usuario tenha escolhido cada um individualmente.

**Investigar:**
1. Como os habitos sao criados no onboarding — ha bulk insert de templates?
2. Quantos habitos cada usuario tem (verificar na tabela `habits` filtrando por is_active=true)
3. Quais habitos tem `source = 'journey'` vs `source = 'manual'`
4. Se existe logica de "auto-criar habitos" no webhook de pos-compra ou no onboarding

## Arquivos para Investigar

- Webhook de pos-compra: `App/supabase/functions/hubla-webhook/index.ts`
- Fluxo de onboarding no n8n (se existir)
- Tabela `habits` — verificar quantos habitos ativos por usuario e sua `source`
- Tabela `habit_templates` — verificar quais templates existem
- Node "Create Habit" no workflow do chatbot

## Solucao Proposta

1. **Nunca criar habitos automaticamente sem confirmacao explicita do usuario**
2. Se o onboarding cria habitos em bloco, mudar para sugerir habitos que o usuario pode aceitar/rejeitar
3. Adicionar flag `user_requested = true/false` na tabela habits para distinguir
4. Desativar lembretes de habitos com `user_requested = false` ate que o usuario confirme

## Status

Pendente — requer investigacao de como os habitos estao sendo criados
