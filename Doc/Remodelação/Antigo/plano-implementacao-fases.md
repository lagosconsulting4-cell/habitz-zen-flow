# Plano de implementação por fases (Habitz remodelado focado em streaks)

Referência: `diagnostico-streaks-remodelacao.md`. Objetivo: migrar para experiência centrada em streaks, catálogo opinado, wizard completo e navegação simples.

## Visão geral das fases
1) Fundamentos e dados (schema, assets, providers).  
2) Navegação + Home em grid circular.  
3) Catálogo de hábitos + wizard + tela Confirm Task.  
4) Notificações/config globais.  
5) Streaks Dashboard/Métricas.  
6) Journaling e notas.  
7) Conteúdo secundário e limpeza (remover/disfarçar extras).  
8) QA, migrações, rollout gradual.

---

## Fase 1 – Fundamentos e dados
- **Schema Supabase**  
  - **Habits** (existe): adicionar campos `color`, `icon_key`, `unit` (enum none/steps/minutes/km/custom), `goal_value` (numeric), `frequency_type` (enum fixed_days/times_per_week/times_per_month/every_n_days/daily), `times_per_week`, `times_per_month`, `every_n_days`, `notification_pref` (jsonb), `auto_complete_source` (enum manual/health). Manter `days_of_week` para fixed_days.  
  - **Habit_completions** (existe): adicionar `value` (numeric) para progressos parciais, `completed_at_time` (time) para distribuição por horário, `note` (text) para journaling curto.  
  - **Habit_notifications** (nova): `id` uuid, `habit_id` fk, `type` (reminder/completed), `time` (time), `sound` (text), `time_sensitive` (bool), `channel` (opcional).  
  - **Habit_categories** (nova): `id` uuid, `name` text, `icon_key` text, `color` text, `sort_order` int.  
  - **Habit_templates** (nova): `id` uuid, `category_id` fk, `name`, `slug`, `icon_key`, `color`, `default_unit`, `default_goal_value`, `default_frequency_type`, `default_days_of_week` (_int2), `default_times_per_week`, `default_times_per_month`, `default_every_n_days`, `default_notifications` jsonb, `auto_complete_source` enum.  
  - **Seeds aplicados**: categorias (Health, Fitness, Mindfulness, Nutrition, Productivity) e templates base (walk/run, mindful minutes, drink water, exercise minutes, cycle, journal, healthy meal, focus session) com ícones/cores/metas/frequências; inseridos com check de existência (slug).
  - **Profiles**: já possui `is_premium`, onboarding. Sem alteração necessária agora.  
- **Conteúdo legado**: `program_modules`, `module_lessons`, `module_resources`, `guided_days`, `guided_day_completions`, `meditations`, `books`, `tips`, `quotes`, `daily_checkins`, `personal_plans`, `assessment_responses` etc. — manter, mas marcar como secundário na aplicação (não precisa schema change imediato).  
- **Compras**: `purchases`/`pending_purchases` — manter para premium check (já usado).  
- **Landing_events**: manter para telemetria; pode ser reutilizado para eventos do app.  
- **Newsletter/subscribers**: sem impacto no pivot de hábitos.
- **Assets de ícones**  
  - Criar set local (`src/assets/habit-icons/` ou `src/components/icons/habits.tsx`) e mapa `icon_key -> componente`.  
  - Paleta por hábito (cores sólidas/gradientes curtos).  
  - Fallback para emoji/custom upload (opcional).
- **Tema/Design System**  
  - Adotar o `index.css` com tokens OKLCH fornecidos (background/foreground, primary, muted, chart, sidebar etc.).  
  - Garantir que cores/raios/sombras influenciem os componentes shadcn e o grid circular (anel, hover, foco).  
  - Ajustar `tailwind.config` se necessário para ler as CSS variables; revisar contrastes em light/dark.
- **Providers**  
  - Garantir TanStack Query, toasts, haptics (web: vibração suave), motion.

## Fase 2 – Navegação + Home em grid circular
- **Bottom nav 3 ícones**: Config (esq), Menu hub (centro), Streaks (dir). Manter límpida, sem labels ou labels curtas.
- **Home “Hoje”**  
  - Grid 2x/3x de círculos: ícone custom + anel de progresso + badge de streak. Card “+ Add task” fixo.  
  - Estados: pendente (anel cinza), em progresso (percentual), concluído (anel cheio + check/glow), auto-complete (anel verde + ícone de origem), temporizado (ícone de play/tempo).  
  - Interação: tap curto marca/desmarca; tap longo abre painel rápido (streak, meta, nota, reminder). Undo rápido. Micro-delay anti-toque acidental.  
  - Ordenação: críticos/pendentes primeiro; opcional agrupamento por tipo.  
  - CTA “Hoje/Agenda”: toggle para ver próximos dias.
- **Refatorar layouts**: remover da home os blocos não essenciais (curso/meditação/citação).

## Fase 3 – Catálogo + Wizard + Confirm Task
- **Catálogo (tela Add Task)**  
  - Chips de categorias no topo; lista com ícones grandes e setas; search. Badges para “auto” (Health) vs “manual”.  
  - Templates puxados de `habit_templates` + assets locais por `icon_key`.  
  - Ação “Criar do zero” mantém caminho atual.
- **Wizard** (multi-step)  
  1) Escolher hábito pronto ou custom (categoria + ícone + cor).  
  2) Meta: valor/unidade (binário ou numérico). Quick presets (5k passos, 10 min).  
  3) Frequência: dias fixos; X/semana; X/mês; a cada N dias; diário.  
  4) Notificações: nenhum/auto/custom; som; time-sensitive; badge.  
  5) Resumo → Confirm Task.
- **Confirm Task (espelhar referência)**  
  - Header “Confirm Task” + back; fundo com cor/tema.  
  - Hero circular com ícone + tag do hábito em caps + ícone de source (health/manual).  
  - Aviso de integração visível se `auto_complete_source = health`.  
  - Campo título com placeholder “Automatic” e contador.  
  - Cards: Goal (valor + unidade), Task Days (resumo), Notifications (estado), opcional Day-long toggle.  
  - Botão fixo “Save Task”; tap em cada linha abre edição. Nada escondido.

## Fase 4 – Notificações e Config globais
- **Config (aba esquerda)**: conta, tema, sons padrão, idioma, backup/export, privacidade, ordenar grid, gerenciar catálogo local. **[parcial: prefs locais para notificações on/off, som padrão, ordenação do grid; tema stub]**  
- **Notificações por hábito**: UI dedicada (auto/custom times; som; time-sensitive; badge). Persistir no `notification_pref` ou tabela `habit_notifications`. **[entregue multi-horário no editor com validação/sons/time-sensitive; pendente entrega real/push]**  
- **Push/alarme**: se PWA, anotar limitações; preparar API/worker ou fallback para e-mail/SMS (planejar). **[pendente pós-fases]**

## Fase 5 – Streaks Dashboard/Métricas
- **Aba Streaks (dir)**  
  - Streak atual e melhor (global).  
  - Ranking de hábitos por streak.  
  - Heatmap 7/30 dias; barras diárias.  
  - Badges/achievements (7/30/100).  
  - “Quase quebrando”: hábitos pendentes hoje.  
  - CTA para marcar hábitos pendentes.

## Fase 6 – Journaling e notas
- Ao completar hábito, opcional nota curta (por hábito/data).  
- Campo `note` em `habit_completions`.  
- Mostrar notas recentes em painel do hábito ou histórico.

## Fase 7 – Conteúdo secundário e limpeza
- Mover/ocultar: curso TDAH, guided, citações, quick tips, biblioteca/meditação para aba “Conteúdo” ou seção bônus; fora da primeira dobra de Hoje/Streaks. **[entregue: seção /bonus com flags + guardas por módulo]**
- Manter “Add task” sempre visível. **[entregue: card fixo na Home e CTA no sidebar]**

## Fase 8 – QA e rollout
- Testes: criação/edição (todos os frequency types), toggle diário, undo, quick-add parcial, notas, notificações, métricas.  
- Migração de dados: script para preencher defaults (frequency_type, unit, goal_value etc.).  
- Feature flags para liberar catálogo/wizard novo aos poucos.  
- Checklist de compatibilidade mobile (tap targets, haptics, animação leve).

---

## Detalhes UX/UI-chave
  - Animações: pulse/glow ao completar, haptic curto; confete leve em metas atingidas.  
  - Micro delay para evitar toques acidentais; undo poptoast.  
  - Cores sólidas/gradientes curtos por hábito; ícone custom (local).  
  - Grid responsivo 2x/3x; card “Add a task” no grid.  
  - Tap longo para painel rápido (streak, meta, nota, reminder).

## Pendências técnicas para decidir
- Push real (PWA) vs. lembrete por e-mail/SMS; time-sensitive pode ser apenas preferência local.  
- Integrações Health: se não houver wrapper nativo, marcar como futura e manter caminho manual.  
- Timer de hábitos (ex.: 3 min brush): precisa de contador local + completion ao fim.

---

## Progresso atual
- Fase 1 sólida: migrações aplicadas (novos enums/campos em habits/habit_completions, tabelas habit_notifications/habit_categories/habit_templates) e seeds de categorias/templates.
- Tipos locais atualizados (`App/src/integrations/supabase/types.ts`) incluindo profiles premium/onboarding, guided_days/state/completions, landing_events.
- Catálogo integrado: `useHabitCatalog` + `CreateHabit` agora permite escolher templates, pré-preenche meta/frequência/cor/ícone e mantém criação custom.
- Edição avançada: `MyHabits` permite editar meta/unidade/frequência, cor/ícone, notificações básicas (notification_pref) e dias; validações inclusas.
- Home remodelada: Dashboard em grid circular de hábitos com agenda de dias, badge Auto para health, destaque para pendentes, filtro de concluídos, CTA Add task.
- Navegação alinhada ao plano: bottom nav simplificada (Config/Menu/Streaks), Home no drawer “Mais”; sidebar mostra essenciais (Home/Streaks/Hábitos) e agrupa extras.
- Pendências da fase 2/3 entregues: progresso parcial e animação de conclusão, pendência por horário/meta; notificações multi-horário com validação (habit_notifications); métricas com heatmap/ranking; paleta/ícones expandidos.
- Timers locais: contador para hábitos em minutos com pausa/retomada/persistência (localStorage), conclusão automática ao zerar.
- Journaling (Fase 6): nota curta ao concluir hábito na Home, salva em `habit_completions.note` e listagem diária exibida na Home.
- Conteúdo bônus centralizado: rota `/bonus` com flags por env (`VITE_SHOW_BONUS_*`) para exibir/ocultar módulos extras (plano, guided, meditação, livros, dicas) acessados pelo drawer “Mais”.
- Fase 5 concluída: métricas avançadas com heatmap, ranking, tendência diária (90d), distribuição por hora/dia da semana, totais e consistência all-time; visual alinhado ao app de referência.
- Fase 7 concluída: módulos TDAH/Guiado/Meditação/Books/Dicas protegidos por flags e redirecionados para `/bonus` quando ocultos; navegação principal permanece focada em Habits/Streaks/Add; card “Add task” sempre visível na grade e CTA no sidebar.
- Flags de conteúdo bônus centralizadas em `App/src/config/bonusFlags.ts`; páginas secundárias (`Meditation`, `BooksHub`, `Tips`, `GuidedJourney`, `PersonalPlan`) respeitam os flags e redirecionam para `/bonus` quando desativadas.

## Próximos passos imediatos
Todos os itens da fase 2/3 listados foram concluídos. Stubs pendentes para próxima fase (tagged):

- **Notificações/PWA** *(pendente)*: decidir estratégia de entrega real (push/email/SMS) e agendamento local; conectar `habit_notifications` a um worker/API ou fallback.
- **Health/auto-complete** *(pendente/futuro)*: planejar wrapper/integração; marcar como futura se não houver suporte nativo. Flag `VITE_HEALTH_ENABLED` criada.
- **Conteúdo secundário** *(pendente de decisão)*: avaliar se ocultar/flaggear bônus (curso, guided, livros, meditação) no “Mais” ou mantém como extra.
- **QA e rollout** *(pendente)*: testes de frequência/meta/notificações, heatmap/ranking e grid; flags para liberar gradualmente.
- **Timer de hábitos** *(entregue)*: contador local com pausa/retomada/persistência na Home já implementado.
- **Journaling** *(entregue)*: captura e exibição diária de notas ao concluir hábitos.

## Fase 4 – itens em andamento
- Preferências globais: notificações on/off, som padrão, ordenação do grid salvos em localStorage.
- Notificações por hábito: multi-horário no editor, validação de duplicados/limite, som e time-sensitive tratados; pendente entrega real (push/email/SMS).
- Timer local para hábitos em minutos com persistência e conclusão automática ao zerar.
- Conteúdo bônus centralizado em `/bonus` com flags `VITE_SHOW_BONUS_*` para ligar/desligar módulos extras.
- Stub de agendador: `useSchedulerStub` criado para conectar futura entrega (push/email/SMS) quando decidido.
