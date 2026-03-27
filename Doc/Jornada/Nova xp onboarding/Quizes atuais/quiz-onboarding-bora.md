# Quiz do Onboarding — App Bora

Documentacao de referencia do fluxo de onboarding dentro do app, apresentado a novos usuarios apos o signup.

---

## Visao Geral

- **Proposito**: Coletar dados do usuario para gerar uma rotina personalizada de habitos
- **Total de Steps**: 15 (0-14)
- **Rota**: `/onboarding-new` (protegida, requer autenticacao)
- **Output**: Cria habitos no banco, marca onboarding como completo, inicia jornadas selecionadas
- **Projeto**: `App/` (React + TypeScript + Vite)

---

## Arquivos Fonte

| Arquivo | Descricao |
|---------|-----------|
| `App/src/components/onboarding/NewOnboardingFlow.tsx` | Componente principal do fluxo |
| `App/src/components/onboarding/OnboardingProvider.tsx` | Context provider (estado + logica) |
| `App/src/components/onboarding/generateRecommendations.ts` | Algoritmo de recomendacao 4-camadas |
| `App/src/components/onboarding/onboardingConfig.ts` | 56 templates de habitos + mapeamentos |
| `App/src/components/onboarding/index.ts` | Barrel exports |
| `App/src/components/onboarding/steps/*.tsx` | 15 componentes de step |

---

## Fluxo Completo — 15 Steps

### Step 0: Welcome
- **Arquivo**: `steps/WelcomeStep.tsx`
- **Titulo**: "Bem-vindo ao Bora"
- **Subtitulo**: "Vamos criar uma rotina personalizada que funciona para voce"
- **Conteudo**: Icone Sparkles com efeito glow animado
- **Validacao**: Sempre valido (ponto de entrada)
- **Acao**: Botao para avancar

---

### Step 1: Tema (Theme)
- **Arquivo**: `steps/ThemeStep.tsx`
- **Pergunta**: "Escolha seu tema"
- **Tipo**: Selecao unica com slider comparativo interativo
- **Opcoes**:
  - Dark mode (icone Moon) — valor padrao
  - Light mode (icone Sun)
- **Visual**: Componente de comparacao arrastavel mostrando mockups light vs dark
- **Validacao**: Sempre valido (tem valor padrao "dark")
- **Efeito**: Sincroniza imediatamente com `useTheme()` para aplicar no sistema

---

### Step 2: Faixa Etaria (Age)
- **Arquivo**: `steps/AgeStep.tsx`
- **Pergunta**: "Qual sua faixa etaria?"
- **Subtitulo**: "Ajuda a recomendar habitos para seu momento de vida"
- **Tipo**: Selecao unica
- **Opcoes**:
  - 18-24 (GraduationCap)
  - 25-34 (Briefcase)
  - 35-44 (Home)
  - 45-54 (Star)
  - 55+ (Sparkles)
- **Validacao**: Obrigatorio

---

### Step 3: Situacao Profissional (Profession)
- **Arquivo**: `steps/ProfessionStep.tsx`
- **Pergunta**: "Sua situacao profissional?"
- **Subtitulo**: "Ajuda a entender sua disponibilidade de tempo"
- **Tipo**: Selecao unica
- **Opcoes**:
  - CLT (BadgeCheck)
  - Autonomo (Laptop)
  - Empresario (Building2)
  - Estudante (BookOpen)
  - Aposentado (Sunset)
- **Validacao**: Obrigatorio

---

### Step 4: Horario de Trabalho (Work Schedule)
- **Arquivo**: `steps/WorkScheduleStep.tsx`
- **Pergunta**: "Seu horario de trabalho?"
- **Subtitulo**: "Organizamos sua rotina nos horarios livres"
- **Tipo**: Selecao unica com faixa de horario
- **Opcoes**:
  - Manha (Sunrise) — 6h-14h
  - Comercial (Building2) — 8h-18h
  - Tarde/Noite (Moon) — 14h-22h
  - Flexivel (RefreshCw) — Varia
- **Validacao**: Obrigatorio
- **Impacto**: Define os time slots disponiveis (Layer 4 do algoritmo)

---

### Step 5: Pico de Energia (Energy Peak)
- **Arquivo**: `steps/EnergyPeakStep.tsx`
- **Pergunta**: "Quando voce tem mais energia?"
- **Subtitulo**: "Priorizamos atividades no seu melhor momento"
- **Tipo**: Selecao unica
- **Opcoes**:
  - Manha (Sun)
  - Tarde (CloudSun)
  - Noite (Moon)
- **Validacao**: Obrigatorio
- **Dica**: "Tarefas importantes serao sugeridas nesse periodo"
- **Impacto**: Layer 4 — prioriza habitos importantes no pico de energia

---

### Step 6: Tempo Disponivel (Time Available)
- **Arquivo**: `steps/TimeAvailableStep.tsx`
- **Pergunta**: "Quanto tempo por dia?"
- **Subtitulo**: "Define quantos habitos vamos recomendar"
- **Tipo**: Selecao unica
- **Opcoes (com estimativa de habitos)**:
  - 15 min (Zap) — ~3 habitos
  - 30 min (Timer) — ~5 habitos
  - 1 hora (Clock) — ~7 habitos
  - 2+ horas (CalendarClock) — ~10 habitos
- **Validacao**: Obrigatorio
- **Impacto**: Layer 3 — determina quantidade de habitos recomendados

---

### Step 7: Objetivo Principal (Objective)
- **Arquivo**: `steps/ObjectiveStep.tsx`
- **Pergunta**: "Qual seu principal objetivo?"
- **Subtitulo**: "Define 40% dos habitos recomendados"
- **Tipo**: Selecao unica
- **Opcoes**:
  - Produtividade (BarChart3)
  - Saude Fisica (Dumbbell)
  - Bem-estar (Heart)
  - Organizacao (CalendarDays)
  - Eliminar Vicios (ShieldX)
- **Validacao**: Obrigatorio
- **Impacto**: Layer 1 — 40% do peso na recomendacao

---

### Step 8: Desafios (Challenges)
- **Arquivo**: `steps/ChallengesStep.tsx`
- **Pergunta**: "Seus maiores desafios?"
- **Subtitulo**: "Selecione todos que se aplicam"
- **Tipo**: Selecao multipla (minimo 1)
- **Opcoes**:
  - Procrastinacao (Clock)
  - Foco (Target)
  - Esquecimento (Brain)
  - Cansaco (Moon)
  - Ansiedade (HeartPulse)
  - Motivacao (Flame)
- **Validacao**: Minimo 1 selecionado
- **Impacto**: Layer 2 — 30% do peso na recomendacao + determina jornadas recomendadas

---

### Step 9: Selecao de Jornadas (Journey Selection) — OPCIONAL
- **Arquivo**: `steps/JourneySelectionStep.tsx`
- **Pergunta**: "Escolha sua jornada"
- **Subtitulo**: "Transformacoes guiadas de 30 dias — escolha ate 2"
- **Tipo**: Selecao multipla — opcional, maximo 2
- **Fonte de Dados**: Tabela `journeys` no Supabase (apenas L1, ativos)
- **Features**:
  - Badge "Pra voce" em jornadas recomendadas baseado nos desafios
  - Ilustracao visual para cada jornada
  - Indicador de duracao (30 dias)
- **Validacao**: Opcional — pode pular
- **Mapeamento Desafio -> Jornada**:
  - procrastination -> focus-protocol-l1
  - focus -> focus-protocol-l1, digital-detox-l1
  - tiredness -> own-mornings-l1
  - anxiety -> digital-detox-l1
  - motivation -> gym-l1
  - forgetfulness -> finances-l1, own-mornings-l1

---

### Step 10: Dias da Semana (Week Days)
- **Arquivo**: `steps/WeekDaysStep.tsx`
- **Pergunta**: "Quais dias da semana?"
- **Subtitulo**: "Escolha quando manter seus habitos"
- **Tipo**: Preset + seletor customizado
- **Presets**:
  - Seg-Sex (Briefcase) — [1,2,3,4,5]
  - Todo dia (RefreshCw) — [0,1,2,3,4,5,6]
  - Custom (SlidersHorizontal) — seletor de 7 dias
- **Validacao**: Minimo 1 dia
- **Padrao**: Seg-Sex

---

### Step 11: Preview da Rotina (Routine Preview)
- **Arquivo**: `steps/RoutinePreviewStep.tsx`
- **Titulo**: "Sua Rotina Personalizada"
- **Descricao**: "Criamos X habitos baseados no seu perfil"
- **Features**:
  - Loading state enquanto gera (1.5s delay artificial)
  - Habitos agrupados por periodo (Manha/Tarde/Noite)
  - Cards de habito com icone, nome, horario sugerido, toggle
  - Maximo 5 habitos selecionaveis
  - Botao "Adicionar habito customizado"
  - Seletor de dia para preview
- **Validacao**: Minimo 3 habitos selecionados
- **Trigger**: Gera rotina usando algoritmo de 4 camadas ao chegar neste step

---

### Step 12: Horario de Silencio (Quiet Hours) — OPCIONAL
- **Arquivo**: `steps/QuietHoursStep.tsx`
- **Pergunta**: "Horario de Silencio"
- **Subtitulo**: "Quer definir um horario em que a Foquinha nao deve te mandar mensagens no WhatsApp?"
- **Tipo**: Toggle opcional com configuracao de horario
- **Escolha Inicial**:
  - "Sim, quero configurar"
  - "Nao, pode mandar sempre"
- **Se habilitado**: Pickers de horario inicio/fim (intervalos de 30min), padrao 22:00-07:00
- **Validacao**: Opcional
- **Persistencia**: Salvo em `user_progress.notification_preferences`

---

### Step 13: Notificacoes (Notification) — OPCIONAL
- **Arquivo**: `steps/NotificationStep.tsx`
- **Pergunta**: "Ativar Lembretes"
- **Subtitulo**: "Receba lembretes nos horarios certos para manter seus habitos"
- **Views por Plataforma**:
  - iOS sem PWA: "Instale o App Primeiro" (pede adicionar a tela inicial)
  - Browser sem suporte: "Notificacoes Indisponiveis"
  - Ja ativado: Checkmark verde + "Lembretes Ativados!"
  - Normal: Botao "Ativar Lembretes" via Web Push API
- **Validacao**: Opcional — pode pular com "Agora nao"
- **Auto-Avanco**: Apos subscricao bem-sucedida, avanca automaticamente em 1.5s

---

### Step 14: Celebracao e Submissao (Celebration)
- **Arquivo**: `steps/CelebrationStep.tsx`
- **Conteudo**: Tela final de celebracao
- **Visual**:
  - Icone check animado
  - "Tudo pronto." + "Sua rotina foi configurada"
  - Contagem de habitos e dias por semana
  - Preview de jornadas selecionadas
  - Barra de progresso animada (3s)
- **Auto-Submissao**: Submete dados apos 1.5s automaticamente
- **Som + Haptics**: `sounds.unlock()` + `haptic.success()`
- **Redirecionamento**: Jornada day 1 (se selecionou) ou `/dashboard`

---

## Algoritmo de Recomendacao (4 Camadas)

**Arquivo**: `App/src/components/onboarding/generateRecommendations.ts`
**Config**: `App/src/components/onboarding/onboardingConfig.ts`

### Layer 1: Objetivo (40% peso)
Mapeia objetivo principal para habitos core:
- productivity -> wake_early, plan_day, deep_work, inbox_zero...
- health -> exercise, drink_water, sleep_early...
- mental -> meditation, journaling, gratitude...
- routine -> make_bed, clean_space, meal_prep...
- avoid -> no_snooze, no_social_media, no_junk_food...

### Layer 2: Desafios (30% peso)
Mapeia desafios para habitos de suporte:
- procrastination -> pomodoro, plan_day, deep_work...
- focus -> meditation, digital_detox, deep_work...
- tiredness -> sleep_early, exercise, vitamins...

### Layer 3: Tempo Disponivel (quantidade)
- 15min -> 3 habitos
- 30min -> 5 habitos
- 1h -> 7 habitos
- 2h+ -> 10 habitos

### Layer 4: Horario de Trabalho + Pico de Energia
Atribui periodos (manha/tarde/noite) e horarios especificos baseado em:
- Slots livres do usuario (derivados do horario de trabalho)
- Pico de energia -> habitos importantes alocados neste periodo

---

## Armazenamento de Dados

### Tabelas escritas na submissao:

| Tabela | Dados |
|--------|-------|
| `habits` | Habitos selecionados com `source: "onboarding"`, category, period, emoji, icon_key, color, goal_value, unit, frequency, reminder_time, priority, template_id |
| `profiles` | `has_completed_onboarding: true`, `onboarding_completed_at` |
| `user_progress` | `notification_preferences` com quiet hours (se habilitado) |
| `user_journey_state` | Via `startJourney()` para cada jornada selecionada |

### Estado durante o onboarding:
- Gerenciado por `OnboardingProvider` (React Context)
- Dados persistem apenas durante a sessao
- Gravacao no Supabase apenas na submissao final (Step 14)

---

## Tipos Principais

```typescript
type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+"
type Profession = "clt" | "freelancer" | "entrepreneur" | "student" | "retired"
type WorkSchedule = "morning" | "commercial" | "evening" | "flexible"
type EnergyPeak = "morning" | "afternoon" | "evening"
type TimeAvailable = "15min" | "30min" | "1h" | "2h+"
type Objective = "productivity" | "health" | "mental" | "routine" | "avoid"
type WeekDaysPreset = "weekdays" | "everyday" | "custom"
type ThemePreference = "light" | "dark"
```

---

## Validacao por Step

| Step | Obrigatorio | Min | Max | Notas |
|------|-------------|-----|-----|-------|
| 0 Welcome | - | - | - | Entrada |
| 1 Theme | Sim | - | - | Default: "dark" |
| 2 Age | Sim | - | - | Single select |
| 3 Profession | Sim | - | - | Single select |
| 4 Work Schedule | Sim | - | - | Single select |
| 5 Energy Peak | Sim | - | - | Single select |
| 6 Time Available | Sim | - | - | Single select |
| 7 Objective | Sim | - | - | Single select |
| 8 Challenges | Sim | 1 | 6 | Multi select |
| 9 Journeys | Nao | 0 | 2 | Opcional |
| 10 Week Days | Sim | 1 | 7 | Min 1 dia |
| 11 Routine Preview | Sim | 3 | 5 | Gera rotina |
| 12 Quiet Hours | Nao | - | - | Opcional |
| 13 Notifications | Nao | - | - | Opcional |
| 14 Celebration | Auto | - | - | Submete automatico |

---

## Analytics

- `onboarding_started` — entrada no fluxo
- `onboarding_step_completed` — cada avanco de step
- `onboarding_completed` — submissao final (com has_email, challenges_count)
