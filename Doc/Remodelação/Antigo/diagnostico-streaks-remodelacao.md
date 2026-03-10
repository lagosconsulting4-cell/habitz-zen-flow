# Diagnóstico do app referência (estilo Streaks) e recomendações para remodelação do Habitz

## Visão geral do app de referência
- Foco extremo em streaks e conclusão diária de hábitos, com visual de “cards circulares” e cores fortes por hábito.
- Dashboard principal é 100% orientado a ritmo diário: círculos mostram progresso do dia (completou ou não) e legenda com contagens/ícones. Fluxo rápido para marcar concluído.
- Páginas de métricas mostram streaks acumulados, taxa de sucesso all-time, total de completions, gráfico de evolução e distribuição por dia/horário.
- Criação de hábito é guiada em múltiplos passos: escolher tipo/categoria (saúde, alimentação, etc.), configurar meta (passos, minutos, vezes), definir dias (específicos, N por semana, N por mês, a cada X dias) e reminders/sons.
- Integrações automáticas (ex.: Health) marcam completions sem input manual para hábitos de saúde.
- Notifications por hábito: nenhum/automático/custom, sons custom, badge quando incompleto, toggle de “time sensitive”.
- Registro de nota/diário por hábito (ex.: “Today was a great day”), mantendo histórico textual simples.

## Fluxos identificados
1) **Home diária (grid de hábitos)**  
   - Cards circulares com barra de progresso (dia ou tarefa) e ícone do hábito. Toque marca como feito/desfeito.  
   - Ações rápidas: abrir config do hábito, editar, notificações.
2) **Adicionar hábito (wizard)**  
   - Escolha de categoria/tipo (ícones por tema).  
   - Definição de meta/unidade (ex.: passos, minutos, km, genérico).  
   - Frequência: dias específicos, X vezes/semana, X vezes/mês, a cada N dias.  
   - Notificações: nenhum/automático/custom, sons, sensibilidade, badge.  
   - Resumo/confirmar tarefa.
3) **Configurar lembretes por hábito**  
   - Seções: Reminders (auto/custom), Sounds, Badge (quando incompleto), Completed notification on/off.
4) **Métricas/stats**  
   - Melhor streak, % de sucesso all-time, total de completions, gráfico de evolução por dia, distribuição por dia da semana e horário.
5) **Journaling**  
   - Tela de nota diária por hábito (texto livre) vinculada à data.
6) **Integrações automáticas**  
   - Hábito pode ser alimentado por fonte externa (Health), dispensa input manual.

## Lacunas vs. Habitz atual
- **Home & foco em streak**: Hoje o dashboard prioriza cards listados por período e seções de conteúdo. Falta um grid hero que destaque streaks e progresso do dia por hábito.
- **Wizard de criação**: Nosso fluxo é uma tela única simples (nome/emoji/categoria/período/dias). Falta granularidade de frequência (vezes/semana, a cada N dias), meta/unidade e notificações dedicadas por hábito.
- **Notificações por hábito**: Não temos gerenciamento de reminders/sound/badge/time-sensitive no app.
- **Métricas ricas**: Temos progresso semanal/mensal, mas não trazemos “best streak” destacado por hábito, % all-time, distribuição por hora/dia, gráfico smooth dedicado por hábito.
- **Journaling por hábito**: Inexistente. Poderia ser uma nota rápida diária acoplada ao hábito.
- **Integração automática (Health)**: Não temos. Podemos planejar estrutura, mas viabilização depende de PWA/mobile wrapper; talvez substituir por webhooks/APIs simples ou manual-first.
- **Conteúdo extra**: Curso TDAH, citações diárias e biblioteca diluem foco. Para a promessa de “habit tracking + streaks”, devem sair ou ficar escondidos como bônus.

## Recomendações de remodelação (UX/UI e produto)
- **Reposicionar o app**: primeira dobra focada em “concluir hábitos e proteger streaks”. Remover da home: curso, dicas, citação. Mover para abas secundárias ou remover.
- **Nova Home (grid de hábitos)**  
  - Grid 2x/3x com círculos coloridos e ícone do hábito, progresso diário visível.  
  - Toque único para marcar/desmarcar; estado animado (pulse/check).  
  - Badge de streak atual e melhor streak no card.  
  - Aba/quebra para “Hoje” e “Agenda” (próximos dias).  
  - CTA “Novo hábito” flutuante.
- **Página de métricas**  
  - Resumo: best streak (global e por hábito), % all-time, completions totais.  
  - Gráficos: linha de evolução diária, barras por dia da semana, distribuição por hora (se coletarmos horário de conclusão).  
  - Top streaks e hábitos mais consistentes.
- **Wizard de criação de hábito (multi passo)**  
  1) Escolher ícone/cor/categoria.  
  2) Definir tipo/meta: “completar 1x”, ou meta numérica (ex.: passos, minutos, km, vezes). Campos: unidade, valor, contagem parcial do dia.  
  3) Frequência: dias fixos, X vezes/semana, X vezes/mês, a cada N dias, ou “meta diária” (todos os dias).  
  4) Notificações: nenhum/automático/custom times; som; badge; sensibilidade.  
  5) Resumo + salvar.
- **Edição rápida por hábito**: Acesso a “Goal”, “Task days”, “Notifications” imediato (como nas telas de confirmar task).
- **Notificações**: Modelar backend para reminders por hábito (até N horários). Mesmo que o push real dependa de PWA/native, guardar preferências agora.
- **Journaling**: Entrada de nota curta por dia/hábito (textarea simples). Pode aparecer como bottom sheet ao marcar hábito, opcional.
- **Desabilitar/ocultar conteúdos**:  
  - Curso TDAH e guided program: mover para aba “Conteúdo” secundária ou desligar enquanto foco é habit tracker.  
  - Citações/dicas: remover da Home; opcional como “Inspiração” em perfil/bônus.
- **Dados e feedback de streak**:  
  - Mostrar “dia de streak atual” e “melhor streak” no card e em destaque no topo.  
  - Quebrar streak apenas quando não cumprir nos dias programados (já temos days_of_week; adicionar regras para X vezes/semana).
- **Visual**:  
  - Paleta forte por hábito (cores sólidas ou gradientes curtos), cards redondos, menos vidro/blur.  
  - Ícones custom ao invés de emojis (podemos manter fallback emoji).  
  - Navegação inferior: tabs simples (Hoje, Métricas, Habits, Perfil/Config).

## Navegação inferior (3 ícones, simplicidade estilo referência)
- **Esquerda: Configurações** — conta, idioma/tema, notificações globais/sons, backup/export, privacidade; atalhos para ordenar grid e gerenciar catálogo local.
- **Centro: Menu/Selector** — abre um drawer/hub de seções (Hoje, Métricas/Streaks, Hábitos/Catálogo, Conteúdo bônus) ou um hub de ações (Adicionar hábito, Reordenar). Ícones grandes estilo “app switcher”.
- **Direita: Streaks** — tela dedicada: streak atual e melhor global, ranking de hábitos por streak, heatmap 7/30 dias, badges/achievements (7/30/100), “quase quebrando” (hábitos pendentes hoje), barras diárias compactas, CTA “proteger streak” para ir marcar hábitos.

## UX/UI de completar tarefas (círculos preenchendo)
- **Grid circular**: cada hábito é um círculo com ícone custom, anel e badge de streak; card “+ Add a task” sempre presente.
- **Interação**: tap curto marca/desmarca (binário) com animação/pulse e check; tap longo abre painel rápido (streak, meta, notas, reminder).
- **Estados**:  
  - Pendente: anel fino cinza.  
  - Em progresso (meta numérica): anel parcial conforme valor (ex.: 0/5000 passos → 60%). Quick-add (+10 min / +500 passos) ou input.  
  - Concluído: anel cheio com glow/check; streak badge atualizada.  
  - Auto-complete (Health): anel verde e ícone de origem; confete leve/haptic ao completar.  
  - Temporizado (ex.: brush teeth 3:00): ícone de play/tempo no card; progresso durante o timer.
- **Feedback**: vibração curta, confete leve; micro-delay para evitar toques acidentais. Undo rápido permitido.
- **Ordenação**: hábitos críticos/pendentes primeiro; agrupamentos por tipo (diário, health auto, temporizados) opcionais.

## Biblioteca de hábitos pré-definidos (categoria + ícone custom)
- A tela de “Add Task” do app referência mostra um catálogo opinado: cada categoria (saúde, alimentação, produtividade etc.) traz hábitos pré-definidos com ícones próprios e configuração já sugerida (metas, unidade, integração futura).
- Valor: reduz fricção na criação e garante consistência visual (ícones custom, não emojis). Também permite templates com metas padrão (ex.: “Walk or Run” 5.000 passos, “Mindful Minutes” 10 min).
- Recomendações:
  - Criar uma tabela Supabase `habit_templates` com campos: `id`, `category_id`, `name`, `slug`, `icon_key` (para mapear para um set de ícones custom), `color`, `default_unit` (steps/minutes/km/none), `default_goal_value`, `default_frequency_type`, `default_days_of_week`, `default_times_per_week`, `default_times_per_month`, `default_every_n_days`, `default_notifications` (JSON), `auto_complete_source` (enum health/manual/none).
  - Tabela de `habit_categories` com `id`, `name`, `icon_key`, `color`, `sort_order`.
  - No wizard, primeira etapa passa a ser “Escolher um hábito pronto” (catálogo). Oferecer também “Criar hábito do zero”. Ao selecionar template, pré-preencher os passos seguintes (meta, frequência, notificações) e permitir edição.
  - UI: chips de categorias no topo (como na tela), lista com ícones grandes e setas; search por nome; badges indicando integração automática (Health) ou manual.
  - Com isso, substituímos emojis genéricos por ícones específicos para hábitos mais comuns. Emojis ficam como fallback para hábitos custom.
- **Onde ficam os ícones?**  
  - Guardar somente `icon_key` no Supabase; a arte do ícone fica no app (bundle/local assets) para performance e consistência.  
  - Mapear `icon_key -> componente/asset` no código (ex.: `icons/habits.ts`). Isso evita latência, mantém qualidade e permite theming.  
  - Se precisar de atualização dinâmica, podemos versionar o set de ícones no bundle e, futuramente, opcionalmente buscar sprites remotos com cache. Hoje, priorizar assets locais.
- **Tela de confirmação idêntica à referência (Confirm Task)**  
  - Fundo com cor/tema do hábito; header com back e título “Confirm Task”.  
  - Hero circular com ícone próprio do hábito; tag com o nome em caixa alta (ex.: “WALK 5,000 STEPS”) e ícone de source (health/manual).  
  - Aviso de integração (ex.: “This task uses data from the Health app. Please grant permission if prompted.”) sempre visível quando `auto_complete_source = health`.  
  - Campo de título com placeholder “Automatic”, limite de caracteres (ex.: 18) e contador.  
  - Agrupadores em cards simples com setas:  
    - **Goal**: mostra valor + unidade (ex.: 5,000 Steps) com acesso à edição.  
    - **Task Days**: resumo (Every Day / Specific days / X per week / every N days).  
    - **Notifications**: leva para tela de reminders/sound/badge; mostra estado atual (auto/custom/none).  
    - (Opcional, se aplicável) **Day-Long Task** toggle em casos de tarefas que valem o dia inteiro.  
  - Botão primário fixo “Save Task” ao final.  
  - Interações: tocar em cada linha abre o passo correspondente (goal/days/notifications). Nada de multistep escondido; tudo revisável antes de salvar.

## Mapeamento técnico sugerido (Supabase)
- **Tabela habits (existente)**: acrescentar campos: `color`, `icon`, `unit` (steps/minutes/km/none), `goal_value` (number), `frequency_type` (fixed_days | times_per_week | times_per_month | every_n_days | daily), `times_per_week`, `times_per_month`, `every_n_days`, `notification_pref` (JSON), `auto_complete_source` (enum health/manual).  
- **Tabela habit_completions (existente)**: adicionar `value` (para registrar parciais), `completed_at_time` (hora) para distribuição por horário, `note` (texto curto).
- **Tabela habit_notifications** (nova opcional): horários personalizados por hábito e tipo (reminder/completed).
- **Novas tabelas para catálogo**: `habit_categories` e `habit_templates` conforme descritas acima, para suportar catálogo opinado com ícones custom e defaults de meta/frequência/notifications.

## O que cortar/mover do app atual
- Retirar da home: DailyQuote, QuickTips, Checkin emocional como bloco principal (pode ficar em perfil ou acessório).  
- Programa/curso/jornada guiada: retirar do fluxo premium principal ou mover para aba “Conteúdo”.  
- Biblioteca de livros e meditações: manter como bônus, fora da rota principal de tracking.

## Próximos passos práticos
1) Redesenhar Home em grid de hábitos com foco em streak e conclusão rápida.  
2) Implementar wizard de criação/edição com frequência avançada, meta e notificações.  
3) Reorganizar navegação: hoje/hábitos, métricas, (opcional) conteúdo, perfil.  
4) Ajustar modelo Supabase conforme acima e migrar UI para novos campos.  
5) Adicionar journaling simples por conclusão (nota opcional).  
6) Tracionar métricas novas: best streak por hábito/global, % all-time, distribuições por dia/horário.  
7) Esconder/retirar features periféricas (curso, citações, guiado) da experiência padrão de tracking.
