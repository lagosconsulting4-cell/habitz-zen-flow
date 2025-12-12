# Diagnóstico das Push Notifications

## Contexto e arquitetura atual
1. O edge function [`habit-reminder-scheduler`](../../App/supabase/functions/habit-reminder-scheduler/index.ts) roda sob demanda (previsto para cada 5 minutos) e identifica, a partir da tabela `habits`, quais hábitos com `reminder_time` devem disparar um lembrete agora. Ele consulta `habit_completions` para evitar duplicidade e só mantém hábitos com `notification_pref.reminder_enabled != false`, com `days_of_week` compatível com o dia atual e ainda não concluídos.
2. Para cada hábito elegível cujo usuário possui inscrição ativa em `push_subscriptions`, o scheduler chama o edge function [`send-push-notification`](../../App/supabase/functions/send-push-notification/index.ts), passando o título, corpo e ações pré-definidos.
3. No cliente (PWA), o `Service Worker` [`App/src/sw.ts`](../../App/src/sw.ts) escuta o evento `push`, monta as ações que serão exibidas e aplica textos default caso a carga recebida não traga `title`, `body` ou `actions`.

> **Observação operacional:** A migration [`20251126140000_pg_cron_habit_reminders.sql`](../../App/supabase/migrations/20251126140000_pg_cron_habit_reminders.sql) agenda o `habit-reminder-scheduler` apenas 3x/dia (8h, 14h e 20h no fuso do Brasil). Já o código do scheduler trabalha com uma janela de 5 minutos (função `isTimeInWindow`). Se o cron realmente estiver ativo como no SQL, a janela de 5 minutos só é avaliada nesses três horários, deixando de cobrir lembretes configurados para outros horários.

## Mapeamento das copies e gatilhos

| # | Fluxo / Canal | Conteúdo exibido | Ações exibidas | Quando dispara | Fonte |
|---|---------------|------------------|----------------|----------------|-------|
| 1 | Lembrete individual de hábito (Edge Function -> Web Push) | **Título:** `${emojiSaudacao} ${saudacao}! Hora do seu hábito` (ex.: `🌅 Bom dia! Hora do seu hábito`).<br>**Corpo:** `${habit.emoji} ${habit.name} - Bora!` (ex.: `📖 Ler 10 páginas - Bora!`).<br>**Tag:** `habit-${habit.id}` para deduplicar. | `Completar` (`action: "complete"`) e `Depois` (`action: "dismiss"`). | Sempre que: (a) o job roda; (b) o `reminder_time` cai na janela de 5 min do horário atual (timezone Brasil -3); (c) o hábito está ativo, sem `reminder_enabled=false`, previsto para o dia (`days_of_week`), e não foi concluído hoje; (d) o usuário tem um registro em `push_subscriptions`. Um push é enviado **por hábito pendente**. | Scheduler: `App/supabase/functions/habit-reminder-scheduler/index.ts:250-323`.<br>Copy e ações: `App/supabase/functions/habit-reminder-scheduler/index.ts:286-309`. |
| 2 | Fallback do Service Worker ao receber um push sem payload completo | **Título:** `payload.title` ou `"Bora Hábitos"`.<br>**Corpo:** `payload.body` ou `"Você tem hábitos pendentes!"`.<br>**Ícones:** `/icons/icon-192.png` e `/icons/badge-72.png` como padrão. | `payload.actions` ou padrão: `Ver hábitos` (`action: "open"`) e `Depois` (`action: "dismiss"`). | Qualquer notificação que chegar ao usuário e não traga `title`, `body` ou `actions` no payload JSON. O fallback também será usado se criarmos futuros disparos sem definir esses campos. | `App/src/sw.ts:96-127`. |

Atualmente **apenas o fluxo #1 é fonte real de push**; o item #2 descreve o texto que o usuário verá se o payload for incompleto.

## Lógica detalhada do disparo principal (Lembrete de Hábito)

1. **Identificação do horário alvo** (`App/supabase/functions/habit-reminder-scheduler/index.ts:28-70`).
   - O horário atual é convertido para o fuso do Brasil (UTC-3).
   - A função `isTimeInWindow` verifica se o `reminder_time` (HH:mm) está entre `floor(min/5)*5` e `+4` minutos: ex., às 14:32 a janela cobre 14:30–14:34.
   - Há saudações dinâmicas: `Bom dia` (5h–11h59), `Boa tarde` (12h–17h59), `Boa noite` (18h–4h59), com os emojis 🌅/☀️/🌙 definidos em `getGreeting`.
2. **Filtragem de hábitos elegíveis** (`App/supabase/functions/habit-reminder-scheduler/index.ts:116-208`).
   - Query base: hábitos ativos com `reminder_time` e `is_active=true`.
   - Descarta se `notification_pref.reminder_enabled === false`.
   - Respeita `days_of_week`; se o array estiver vazio ou `null`, considera “todos os dias”.
   - Consulta `habit_completions` (campo `completed_at` = data ISO de hoje) e remove hábitos já concluídos.
3. **Checagem de inscrição em push** (`App/supabase/functions/habit-reminder-scheduler/index.ts:210-244`).
   - Busca `push_subscriptions` por `user_id` dos hábitos pendentes; apenas usuários com subscription recebem push.
4. **Montagem do payload e envio** (`App/supabase/functions/habit-reminder-scheduler/index.ts:260-323`).
   - Para cada hábito elegível, monta-se: `title`, `body`, `tag`, `actions` e `data` (`type: "habit-reminder"`, `habitId`, `habitName`, `url: "/app/dashboard"`).
   - Faz POST para `/functions/v1/send-push-notification`, que por sua vez pega todas as subscriptions do usuário e dispara via Web Push (`App/supabase/functions/send-push-notification/index.ts:347-454`).
   - Caso o push retorne `404/410`, a subscription é excluída.
5. **UX no cliente** (`App/src/sw.ts:96-155`).
   - O Service Worker exibe a notificação e, no clique, fecha a notificação e abre/foca `data.url` (default `/app/dashboard`). Apenas a ação `dismiss` possui tratamento especial (fecha sem abrir nada); `complete` ainda não possui handler dedicado, portanto o botão “Completar” abre o app como se fosse um clique normal.

## Diagnóstico e pontos de atenção
- **Copy limitada e repetitiva:** o título/body são iguais para todos os hábitos e não mencionam o horário configurado, progresso ou benefícios. Alterar essa copy exige mudar apenas o bloco `body: \
${habit.emoji} ...` no scheduler.
- **Botão “Completar” ainda não funciona:** apesar da action `complete`, o Service Worker só diferencia `dismiss`. Implementar lógica específica é necessário para que o CTA condiza com a copy.
- **Janela de 5 minutos x cron diário:** existe um desalinhamento entre o objetivo declarado (“verifica a cada 5 min”) e o cron provisionado (3 execuções diárias). Isso faz com que hábitos configurados para outros horários nunca recebam o push. Ajustar o cron é crucial para qualquer estratégia de copy.
- **Ausência de segmentação/contexto:** não há variação por tipo de hábito, nível de atraso, streak etc. O payload inclui somente `habitName` e `emoji`, então os dados necessários para enriquecer a copy ainda não existem.
- **Fallback genérico:** se, por algum motivo, o backend falhar em mandar `title/body`, o usuário receberá `"Bora Hábitos" / "Você tem hábitos pendentes!"` e botões `Ver hábitos`/`Depois`, o que gera inconsistência com a copy principal.

## Próximos passos sugeridos
1. Decidir novos textos para o fluxo principal e ajustar `habit-reminder-scheduler` (títulos, corpo e `actions`).
2. Atualizar o `Service Worker` para tratar `action === "complete"`, enviando mensagem ao app ou chamando um endpoint para realmente marcar o hábito.
3. Rever o agendamento no `pg_cron` para garantir execuções frequentes (idealmente a cada 5 min) ou alinhar o código para trabalhar com os três horários fixos.
4. Caso surjam novos fluxos de push (ex.: onboarding, metas perdidas), replicar este mapeamento e garantir que `payload.data` traga informações suficientes para personalização.
