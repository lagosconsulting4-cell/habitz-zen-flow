# Doc 4 — Spec Técnico Completo: Novo Onboarding Bora
**Versão 1.0 — Março 2026**
**Stack: React + TypeScript + Vite | Supabase | Tailwind | Framer Motion**

---

## Visão Geral de Implementação

Este documento é o blueprint de implementação do novo onboarding. Pressupõe leitura prévia dos Docs 1, 2 e 3. Cada seção é acionável diretamente pelo dev.

### Arquivos a criar
```
App/src/components/onboarding-v2/
  OnboardingProviderV2.tsx         ← Context + state + lógica central
  OnboardingFlowV2.tsx             ← Orquestrador dos steps
  generateRecommendationsV2.ts     ← Algoritmo Doc 2 (7 camadas)
  calculateJourneyScores.ts        ← Algoritmo Doc 3 (score 0-100)
  useQuizData.ts                   ← Hook para lookup em quiz_responses
  steps/
    S0_Welcome.tsx
    S1_AppIntro.tsx
    S2_ObjectiveConfirm.tsx
    S3_InstallPWA_Soft.tsx
    S4_WakeSleeTime.tsx
    S5_WeekendDiff.tsx
    S6_LifeAreas.tsx
    S7_HabitExperience.tsx
    S8_LoadingRoutine.tsx
    S9_RoutinePreview.tsx
    S10_RoutineConfirm.tsx
    S11_JourneysIntro.tsx
    S12_JourneySelection.tsx
    S13_InstallPWA_Hard.tsx
    S14_Notifications.tsx
    S15_Tour_Today.tsx
    S16_Tour_Journeys.tsx
    S17_Tour_Habits.tsx
    S18_Tour_Avatar.tsx
    S19_Tour_Bonus.tsx
    S20_Celebration.tsx
  components/
    SpotlightOverlay.tsx           ← Componente do tour spotlight
    HabitCard.tsx                  ← Card de hábito no preview
    JourneyMatchCard.tsx           ← Card de jornada com score
    PWATutorial.tsx                ← Tutorial de instalação por plataforma
    RoutinePreviewTabs.tsx         ← Abas semana / fim de semana
```

### Arquivos a modificar
```
App/src/App.tsx                    ← Adicionar rota /onboarding-v2
App/src/pages/Welcome.tsx          ← Redirecionar novos usuários para /onboarding-v2
App/supabase/migrations/           ← Nova migration (ver Seção 2)
```

---

## 1. Migration de Banco de Dados

Criar arquivo: `App/supabase/migrations/20260316000000_onboarding_v2.sql`

```sql
-- Adicionar campo na tabela profiles para dados do novo onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_version text DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS quiz_linked_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_v2_data jsonb DEFAULT '{}'::jsonb;

-- Adicionar campos no quiz_responses para rastrear vínculo com usuário
ALTER TABLE public.quiz_responses
  ADD COLUMN IF NOT EXISTS linked_at timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Índice para lookup por email no onboarding
CREATE INDEX IF NOT EXISTS quiz_responses_email_lower_idx
  ON public.quiz_responses (lower(email));

-- Tabela de scores de jornadas (para uso futuro e dashboard)
CREATE TABLE IF NOT EXISTS public.journey_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  dominant_signal text,
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, journey_id)
);

ALTER TABLE public.journey_recommendation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journey scores"
  ON public.journey_recommendation_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey scores"
  ON public.journey_recommendation_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tabela de hábitos v2 com suporte a variantes semanais
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS habit_type text DEFAULT 'anchor',
  ADD COLUMN IF NOT EXISTS week_variation jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_version text DEFAULT 'v1';

-- habit_type: 'anchor' | 'directed' | 'rhythm' | 'support' | 'complement'
-- week_variation: { weekdays: {...}, weekend: {...} } quando diferente

COMMENT ON COLUMN public.habits.habit_type IS 'Tipo do hábito conforme Doc 2: anchor, directed, rhythm, support, complement';
COMMENT ON COLUMN public.habits.week_variation IS 'Variação de horário/duração entre dias úteis e fim de semana';
```

---

## 2. Hook: useQuizData

**Arquivo:** `App/src/components/onboarding-v2/useQuizData.ts`

**Responsabilidade:** Fazer lookup no `quiz_responses` pelo email do usuário autenticado e retornar os dados do quiz da landing page.

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';

export interface QuizData {
  name: string | null;
  email: string;
  phone: string | null;
  objective: string | null;
  challenges: string[];
  energy_peak: string | null;
  time_available: string | null;
  profession: string | null;
  age_range: string | null;
  gender: string | null;
  years_promising: string | null;
  consistency_feeling: string | null;
  projected_feeling: string | null;
}

export interface UseQuizDataResult {
  quizData: QuizData | null;
  isLoading: boolean;
  hasQuizData: boolean;
  quizResponseId: string | null;
}

export function useQuizData(): UseQuizDataResult {
  const { user } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizResponseId, setQuizResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    async function fetchQuizData() {
      try {
        // Busca pelo email (case-insensitive) e pega o mais recente
        const { data, error } = await supabase
          .from('quiz_responses')
          .select('*')
          .ilike('email', user!.email!)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setQuizData(null);
          return;
        }

        setQuizResponseId(data.id);
        setQuizData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          objective: data.objective,
          challenges: (data.challenges as string[]) || [],
          energy_peak: data.energy_peak,
          time_available: data.time_available,
          profession: data.profession,
          age_range: data.age_range,
          gender: data.gender,
          years_promising: data.years_promising,
          consistency_feeling: data.consistency_feeling,
          projected_feeling: data.projected_feeling,
        });

        // Vincular quiz_response ao user_id se ainda não estiver vinculado
        if (!data.user_id) {
          await supabase
            .from('quiz_responses')
            .update({ user_id: user!.id, linked_at: new Date().toISOString() })
            .eq('id', data.id);
        }
      } catch (err) {
        console.error('Failed to fetch quiz data:', err);
        setQuizData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizData();
  }, [user?.email]);

  return {
    quizData,
    isLoading,
    hasQuizData: quizData !== null,
    quizResponseId,
  };
}
```

---

## 3. OnboardingProviderV2 — Types e State

**Arquivo:** `App/src/components/onboarding-v2/OnboardingProviderV2.tsx`

### Types novos (adicionais ao OnboardingProvider existente)

```typescript
export type WeekendDiff = 'same' | 'different' | 'varies';
export type LifeArea = 'work' | 'physical' | 'mind' | 'relationships';
export type HabitExperience = 'never' | 'tried' | 'already_have';

export interface WakeSleeTime {
  wake: string;   // "HH:mm"
  sleep: string;  // "HH:mm"
}

export interface OnboardingV2State {
  // Step atual
  currentStep: number;
  totalSteps: 21;

  // Dados do quiz (vindos do Supabase via useQuizData)
  quizData: QuizData | null;
  isLoadingQuizData: boolean;

  // Dados coletados no onboarding (S4–S7)
  wakeSleepTime: WakeSleeTime;
  weekendDiff: WeekendDiff | null;
  lifeAreas: LifeArea[];
  habitExperience: HabitExperience | null;

  // Objetivo (pode ser confirmado/alterado no S2)
  confirmedObjective: string | null;

  // PWA
  isPWAInstalled: boolean;

  // Rotina gerada
  generatedHabits: RecommendedHabitV2[];
  selectedHabitIds: Set<string>;
  isGeneratingRoutine: boolean;

  // Jornadas
  journeyScores: Record<string, number>;       // journeyId → score 0-100
  journeyDominantSignals: Record<string, string>; // journeyId → sinal dominante
  selectedJourneyIds: Set<string>;

  // Notificações
  notificationsGranted: boolean;

  // Tour
  tourStep: number; // 0-4 dentro da fase tour

  // Submissão
  isSubmitting: boolean;
}
```

### Campos adicionais na interface RecommendedHabit

```typescript
export interface RecommendedHabitV2 {
  id: string;
  name: string;
  description: string;         // Novo: descrição do mecanismo
  category: string;
  habit_type: 'anchor' | 'directed' | 'rhythm' | 'support' | 'complement';
  icon: string;
  icon_key: string;
  color: string;
  period: 'morning' | 'afternoon' | 'evening';
  suggested_time: string;
  duration: number;            // minutos
  goal_value?: number;
  goal_unit?: string;
  frequency_type: 'fixed_days' | 'times_per_week' | 'daily';
  frequency_days: number[];
  priority: number;
  // Novo: variação de fim de semana
  weekend_time?: string;       // horário diferente no fim de semana
  weekend_duration?: number;   // duração diferente no fim de semana
  weekend_frequency_days?: number[]; // dias diferentes no fim de semana
  // Meta
  recommendation_score: number;
  recommendation_sources: string[];
  template_id?: string;
}
```

---

## 4. calculateJourneyScores — Algoritmo Doc 3

**Arquivo:** `App/src/components/onboarding-v2/calculateJourneyScores.ts`

```typescript
import { QuizData } from './useQuizData';

export interface JourneyScoreInput {
  quizData: QuizData;
  lifeAreas: string[];
  habitExperience: string;
  wakeSleepTime: { wake: string; sleep: string };
  confirmedObjective: string;
}

export interface JourneyScoreResult {
  scores: Record<string, number>;          // journeyId → score
  dominantSignals: Record<string, string>; // journeyId → sinal dominante para copy
  badges: string[];                        // journeyIds que recebem badge
}

const JOURNEY_IDS = [
  'own-mornings-l1',
  'gym-l1',
  'focus-protocol-l1',
  'finances-l1',
  'digital-detox-l1',
];

export function calculateJourneyScores(input: JourneyScoreInput): JourneyScoreResult {
  const { quizData, lifeAreas, habitExperience, wakeSleepTime, confirmedObjective } = input;
  const challenges = quizData.challenges || [];
  const scores: Record<string, number> = {};
  const dominantSignals: Record<string, string> = {};

  // ─── OWN MORNINGS L1 ───────────────────────────────────────────────────────
  {
    const id = 'own-mornings-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'routine') { score += 30; signals.push({ key: 'routine_objective', pts: 30 }); }
    if (confirmedObjective === 'productivity') { score += 15; signals.push({ key: 'productivity_objective', pts: 15 }); }
    if (challenges.includes('focus')) { score += 15; signals.push({ key: 'focus_challenge', pts: 15 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (challenges.includes('tiredness')) { score += 15; signals.push({ key: 'tiredness_challenge', pts: 15 }); }
    if (quizData.energy_peak === 'morning') { score += 20; signals.push({ key: 'morning_energy', pts: 20 }); }
    if (wakeSleepTime.wake < '08:00') { score += 10; signals.push({ key: 'early_waker', pts: 10 }); }
    if (lifeAreas.includes('mind')) { score += 10; signals.push({ key: 'mind_area', pts: 10 }); }
    if (lifeAreas.includes('work')) { score += 10; signals.push({ key: 'work_area', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    if (habitExperience === 'never') { score += 15; signals.push({ key: 'never_habit', pts: 15 }); }
    if (quizData.consistency_feeling === 'avoiding') { score += 10; signals.push({ key: 'avoiding_feeling', pts: 10 }); }
    // Negative signals
    if (quizData.energy_peak === 'evening') score -= 15;
    if (wakeSleepTime.wake >= '10:00') score -= 10;
    if (confirmedObjective === 'health') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // ─── GYM L1 ────────────────────────────────────────────────────────────────
  {
    const id = 'gym-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'health') { score += 35; signals.push({ key: 'health_objective', pts: 35 }); }
    if (lifeAreas.includes('physical')) { score += 25; signals.push({ key: 'physical_area', pts: 25 }); }
    if (challenges.includes('motivation')) { score += 20; signals.push({ key: 'motivation_challenge', pts: 20 }); }
    if (challenges.includes('tiredness')) { score += 15; signals.push({ key: 'tiredness_challenge', pts: 15 }); }
    if (confirmedObjective === 'avoid') { score += 10; signals.push({ key: 'avoid_objective', pts: 10 }); }
    if (habitExperience === 'never') { score += 10; signals.push({ key: 'never_habit', pts: 10 }); }
    if (habitExperience === 'tried') { score += 15; signals.push({ key: 'tried_habit', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 10; signals.push({ key: 'young_age', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    if (quizData.consistency_feeling === 'frustrated') { score += 10; signals.push({ key: 'frustrated_feeling', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'mental') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'mind') score -= 10;
    if (habitExperience === 'already_have') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // ─── FOCUS PROTOCOL L1 ─────────────────────────────────────────────────────
  {
    const id = 'focus-protocol-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (challenges.includes('focus')) { score += 30; signals.push({ key: 'focus_challenge', pts: 30 }); }
    if (challenges.includes('procrastination')) { score += 25; signals.push({ key: 'procrastination_challenge', pts: 25 }); }
    if (confirmedObjective === 'productivity') { score += 20; signals.push({ key: 'productivity_objective', pts: 20 }); }
    if (confirmedObjective === 'avoid') { score += 15; signals.push({ key: 'avoid_objective', pts: 15 }); }
    if (lifeAreas.includes('work')) { score += 15; signals.push({ key: 'work_area', pts: 15 }); }
    if (quizData.profession === 'student') { score += 15; signals.push({ key: 'student', pts: 15 }); }
    if (['freelancer', 'entrepreneur'].includes(quizData.profession || '')) { score += 10; signals.push({ key: 'independent_work', pts: 10 }); }
    if (habitExperience === 'tried') { score += 10; signals.push({ key: 'tried_habit', pts: 10 }); }
    if (challenges.includes('forgetfulness')) { score += 10; signals.push({ key: 'forgetfulness_challenge', pts: 10 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 5; signals.push({ key: 'young_age', pts: 5 }); }
    if (quizData.consistency_feeling === 'resigned') { score += 10; signals.push({ key: 'resigned_feeling', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'relationships') score -= 15;
    if (quizData.energy_peak === 'afternoon') score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // ─── FINANCES L1 ───────────────────────────────────────────────────────────
  {
    const id = 'finances-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'routine') { score += 20; signals.push({ key: 'routine_objective', pts: 20 }); }
    if (confirmedObjective === 'productivity') { score += 15; signals.push({ key: 'productivity_objective', pts: 15 }); }
    if (confirmedObjective === 'avoid') { score += 20; signals.push({ key: 'avoid_objective', pts: 20 }); }
    if (challenges.includes('forgetfulness')) { score += 15; signals.push({ key: 'forgetfulness_challenge', pts: 15 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (lifeAreas.includes('work')) { score += 15; signals.push({ key: 'work_area', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 20; signals.push({ key: 'young_age', pts: 20 }); }
    if (quizData.profession === 'student') { score += 10; signals.push({ key: 'student', pts: 10 }); }
    if (quizData.profession === 'employed') { score += 10; signals.push({ key: 'employed', pts: 10 }); }
    if (habitExperience === 'never') { score += 10; signals.push({ key: 'never_habit', pts: 10 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 15;
    if (confirmedObjective === 'mental') score -= 10;
    if (['45-54', '55+'].includes(quizData.age_range || '')) score -= 5;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // ─── DIGITAL DETOX L1 ──────────────────────────────────────────────────────
  {
    const id = 'digital-detox-l1';
    let score = 0;
    const signals: Array<{ key: string; pts: number }> = [];

    if (confirmedObjective === 'avoid') { score += 35; signals.push({ key: 'avoid_objective', pts: 35 }); }
    if (challenges.includes('focus')) { score += 20; signals.push({ key: 'focus_challenge', pts: 20 }); }
    if (challenges.includes('motivation')) { score += 15; signals.push({ key: 'motivation_challenge', pts: 15 }); }
    if (challenges.includes('anxiety')) { score += 20; signals.push({ key: 'anxiety_challenge', pts: 20 }); }
    if (confirmedObjective === 'mental') { score += 15; signals.push({ key: 'mental_objective', pts: 15 }); }
    if (lifeAreas.includes('mind')) { score += 15; signals.push({ key: 'mind_area', pts: 15 }); }
    if (['18-24', '25-34'].includes(quizData.age_range || '')) { score += 10; signals.push({ key: 'young_age', pts: 10 }); }
    if (challenges.includes('procrastination')) { score += 10; signals.push({ key: 'procrastination_challenge', pts: 10 }); }
    if (quizData.consistency_feeling === 'avoiding') { score += 15; signals.push({ key: 'avoiding_feeling', pts: 15 }); }
    if (['3-5years', '5+years'].includes(quizData.years_promising || '')) { score += 10; signals.push({ key: 'long_promising', pts: 10 }); }
    // Negative signals
    if (confirmedObjective === 'health') score -= 10;
    if (lifeAreas.length === 1 && lifeAreas[0] === 'physical') score -= 10;

    scores[id] = Math.max(0, Math.min(100, score));
    const dominant = signals.sort((a, b) => b.pts - a.pts)[0];
    dominantSignals[id] = dominant?.key || 'default';
  }

  // ─── DETERMINE BADGES ─────────────────────────────────────────────────────
  const BADGE_THRESHOLD = 65;
  let badges = JOURNEY_IDS.filter(id => scores[id] >= BADGE_THRESHOLD);

  // Se nenhuma atingiu 65, pega as 2 de maior score
  if (badges.length === 0) {
    badges = JOURNEY_IDS
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 2);
  }

  // Máximo de 2 badges
  if (badges.length > 2) {
    badges = badges
      .sort((a, b) => scores[b] - scores[a])
      .slice(0, 2);
  }

  return { scores, dominantSignals, badges };
}
```

---

## 5. Spec de Cada Step

### Convenções de notação

- **LEITURA** → dados lidos do Supabase ou do estado
- **ESCRITA** → dados gravados no Supabase ao avançar
- **CONDICIONAL** → condição para este step aparecer
- **ANIMAÇÃO** → spec de animação (Framer Motion)
- **VALIDAÇÃO** → o que bloqueia o botão Avançar

---

### S0 — Boas-vindas pelo Nome

**Componente:** `S0_Welcome.tsx`
**LEITURA:** `quizData.name` (via `useQuizData`)
**ESCRITA:** nenhuma
**CONDICIONAL:** sempre aparece (primeiro step)
**VALIDAÇÃO:** sempre válido — botão habilitado imediatamente

**UI:**
- Fullscreen, fundo escuro com partícula animada ou gradiente sutil
- Se `quizData.name` disponível: exibir "Oi, [nome]." como H1 bold
- Se não disponível: exibir input de nome (campo único, estilo minimal)
- Subtítulo: "Você chegou." (fixo)
- Copy de suporte abaixo: "Preparamos tudo para você. Vai levar só alguns minutos."
- Botão único fullwidth no rodapé: "Vamos lá"

**ANIMAÇÃO:**
```typescript
// Entrada: fade in com slide up sutil
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: 'easeOut' }}

// Título: stagger delay de 0.2s após o container aparecer
// Botão: aparece após 0.4s
```

**ESTADO:**
```typescript
// Se nome foi coletado aqui (fallback), salvar em:
setState({ collectedName: value })
// Será persistido no Supabase apenas na submissão final
```

---

### S1 — O que esperar

**Componente:** `S1_AppIntro.tsx`
**LEITURA:** nenhuma
**ESCRITA:** nenhuma
**VALIDAÇÃO:** sempre válido

**UI:**
- Fundo com ilustração sutil (não imagem pesada — pode ser SVG animado)
- Título: "Aqui é diferente."
- Copy em 3 parágrafos curtos (ver Doc 1, S1)
- Botão: "Entendi, continuar"

**ANIMAÇÃO:**
- Cada parágrafo entra com stagger de 0.15s após o anterior
- Botão aparece após todos os parágrafos (delay total ~0.6s)

---

### S2 — Confirmação do Objetivo

**Componente:** `S2_ObjectiveConfirm.tsx`
**LEITURA:** `quizData.objective`
**ESCRITA:** `state.confirmedObjective`
**VALIDAÇÃO:** `confirmedObjective !== null`

**UI:**
- Título dinâmico: "Você disse que quer [OBJETIVO_LABEL]."
- Subtítulo: "Ainda é isso que você está buscando?"
- Cards de objetivo: 5 opções, pré-selecionada a do quiz
- Copy abaixo dos cards: "Pode mudar. A gente ajusta tudo."
- Botão: "Isso mesmo, continuar"

**Mapeamento objective → label:**
```typescript
const OBJECTIVE_LABELS: Record<string, string> = {
  productivity: 'ser mais produtivo',
  health: 'cuidar do corpo',
  mental: 'ter mais equilíbrio',
  routine: 'criar uma rotina que funcione',
  avoid: 'parar com o que te trava',
};
```

**ANIMAÇÃO:**
- Card pré-selecionado: pulsa suavemente uma vez ao entrar (scale 1 → 1.03 → 1, duration 0.4s)
- Outros cards: fade in com stagger

---

### S3 — Instalar o App (Soft)

**Componente:** `S3_InstallPWA_Soft.tsx`
**LEITURA:** `usePWA().isInstalled` (hook existente)
**ESCRITA:** nenhuma
**CONDICIONAL:** sempre aparece, mas se `isInstalled === true`, exibir versão de confirmação
**VALIDAÇÃO:** sempre válido (pode pular)

**UI (não instalado):**
- Título: "Uma coisa antes de continuar."
- Copy curto (ver Doc 1, S3)
- Componente `<PWATutorial />`: detecta plataforma (iOS vs Android via UA) e exibe tutorial visual
- Botão primário: "Instalar agora" (chama `usePWA().promptInstall()`)
- Botão secundário (menor): "Fazer isso depois"

**UI (já instalado):**
- Check animado
- "Você já está com o app instalado."
- Botão único: "Continuar"

**Detecção de plataforma:**
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
const isAndroid = /Android/.test(navigator.userAgent);
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
```

---

### S4 — Horário de Acordar e Dormir

**Componente:** `S4_WakeSleepTime.tsx`
**LEITURA:** nenhuma (dados novos)
**ESCRITA:** `state.wakeSleepTime`
**VALIDAÇÃO:** ambos os campos preenchidos

**UI:**
- Título: "Como é o seu dia, no geral?"
- Subtítulo: "A gente vai encaixar os hábitos nos seus horários livres, não disputar com eles."
- Dois seletores de horário — estilo wheel picker ou slider visual de linha do tempo
- Label 1: "Você costuma acordar às..."
- Label 2: "E dormir por volta das..."
- Microcopy: "Não precisa ser exato. Uma estimativa já ajuda bastante."

**Implementação do seletor:**
```typescript
// Usar intervalos de 30 minutos
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2).toString().padStart(2, '0');
  const mins = i % 2 === 0 ? '00' : '30';
  return `${hours}:${mins}`;
});

// Default values
defaultWake = '07:00'
defaultSleep = '23:00'
```

---

### S5 — Dias Úteis vs Fim de Semana

**Componente:** `S5_WeekendDiff.tsx`
**LEITURA:** nenhuma
**ESCRITA:** `state.weekendDiff`
**VALIDAÇÃO:** `weekendDiff !== null`

**UI:**
- Título: "Seu fim de semana é parecido com a semana?"
- 3 cards de seleção única (ver Doc 1, S5)
- Copy de transição condicional: aparece abaixo dos cards após seleção, explica o que vai acontecer

**Lógica de transição:**
```typescript
// Após seleção, exibir microcopy com fade in:
if (value === 'different' || value === 'varies') {
  showMessage = "Ótimo. Vamos montar uma rotina diferente para cada período."
} else {
  showMessage = "Perfeito. Mesmos hábitos todos os dias — mais simples de manter."
}
```

---

### S6 — Áreas da Vida

**Componente:** `S6_LifeAreas.tsx`
**LEITURA:** nenhuma
**ESCRITA:** `state.lifeAreas`
**VALIDAÇÃO:** `lifeAreas.length >= 1`

**UI:**
- Título: "O que mais importa pra você agora?"
- Subtítulo: "Escolha as áreas que você quer trabalhar. Pode marcar mais de uma."
- 4 cards com ilustração + label (multi-select)
- Validação: mínimo 1, máximo 4
- Microcopy: "Esses dados ajudam a montar uma rotina que realmente caiba na sua vida."

**Cards:**
```typescript
const LIFE_AREA_OPTIONS = [
  { id: 'work', label: 'Trabalho e produtividade', description: 'Render mais, procrastinar menos.' },
  { id: 'physical', label: 'Saúde física', description: 'Movimento, sono e energia no dia a dia.' },
  { id: 'mind', label: 'Mente e emoções', description: 'Foco, calma e clareza mental.' },
  { id: 'relationships', label: 'Relacionamentos', description: 'Tempo de qualidade com quem importa.' },
];
```

---

### S7 — Experiência com Hábitos

**Componente:** `S7_HabitExperience.tsx`
**LEITURA:** nenhuma
**ESCRITA:** `state.habitExperience`
**VALIDAÇÃO:** `habitExperience !== null`

**UI:**
- Título: "Como você se relaciona com hábitos hoje?"
- 3 cards de seleção única (ver Doc 1, S7)
- Microcopy: "Não existe resposta errada. Isso só muda como a gente monta sua rotina."

**Após seleção — microcopy contextual:**
```typescript
if (value === 'never') {
  subtext = "Começamos com poucos hábitos. Consistência com 4 vale mais do que abandono com 10."
} else if (value === 'tried') {
  subtext = "A rotina foi montada para se sustentar nos dias ruins — não só nos bons."
} else {
  subtext = "Construímos em cima do que funciona e adicionamos o que faltava."
}
```

---

### S8 — Loading Personalizado

**Componente:** `S8_LoadingRoutine.tsx`
**LEITURA:** todos os dados coletados (quizData + state S4-S7)
**ESCRITA:** `state.generatedHabits` (via `generateRecommendationsV2`)
**VALIDAÇÃO:** automático — avança sozinho após geração

**UI:**
- Fullscreen, fundo escuro
- Animação central: anel giratório ou partículas convergindo
- Mensagens dinâmicas em sequência (fade in/out, 800ms cada):
  1. "Cruzando seu perfil..."
  2. "Mapeando seus horários livres..."
  3. "Separando semana do fim de semana..."
  4. `"Ajustando para ${OBJECTIVE_LABELS[confirmedObjective]}..."`
  5. "Sua rotina está pronta."
- Depoimentos rotativos ao fundo (menor, opacidade 0.4):

```typescript
const TESTIMONIALS = [
  { text: "Em 21 dias, os hábitos viraram automáticos.", author: "Mariana, 24" },
  { text: "A diferença foi ter algo concreto para seguir.", author: "Rafael, 31" },
  { text: "Nunca pensei que uma rotina de manhã fosse possível pra mim.", author: "Lucas, 28" },
];
```

**Lógica de execução:**
```typescript
useEffect(() => {
  // Inicia geração assim que o step é montado
  const generate = async () => {
    // Delay mínimo de 4s para UX (mesmo que a geração seja mais rápida)
    const [habits] = await Promise.all([
      generateRecommendationsV2({ quizData, lifeAreas, habitExperience, ... }),
      new Promise(resolve => setTimeout(resolve, 4000))
    ]);
    setState({ generatedHabits: habits });
    // Avança automaticamente após 500ms de "Sua rotina está pronta."
    setTimeout(() => nextStep(), 500);
  };
  generate();
}, []);
```

---

### S9 — Preview da Rotina

**Componente:** `S9_RoutinePreview.tsx`
**LEITURA:** `state.generatedHabits`, `state.weekendDiff`
**ESCRITA:** `state.selectedHabitIds`
**VALIDAÇÃO:** `selectedHabitIds.size >= 3`

**UI:**
- Título: "Essa é a sua rotina."
- Subtítulo dinâmico: `"Montamos ${habits.length} hábitos baseados no que você nos contou."`
- Se `weekendDiff !== 'same'`: exibir abas "Dias úteis" / "Fim de semana"
- Hábitos agrupados por período: Manhã / Tarde / Noite
- Cada card: ícone + nome + duração + horário + toggle (selecionar/remover)
- Cards são arrastáveis para reordenação (react-beautiful-dnd ou @dnd-kit/core)
- Microcopy rodapé: "Isso não é definitivo. Você pode editar a qualquer momento."

**Estrutura de card:**
```typescript
interface HabitCardProps {
  habit: RecommendedHabitV2;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onTimeChange: (id: string, time: string) => void;
}
```

**Limite:** máximo 8 hábitos selecionáveis (ajustado por `habitExperience`: never=4, tried=6, already_have=8)

---

### S10 — Confirmação da Rotina

**Componente:** `S10_RoutineConfirm.tsx`
**LEITURA:** `state.selectedHabitIds`, `state.generatedHabits`
**ESCRITA:** nenhuma (confirmação visual)
**VALIDAÇÃO:** sempre válido

**UI:**
- Título: `"Pronto. Essa é a sua rotina, ${name || ''}."` (nome do quiz ou coletado no S0)
- Resumo dinâmico:
  - X hábitos por dia
  - Y dias por semana
  - ~Z minutos no total (soma das durações)
- Copy central (ver Doc 1, S10)
- CTA: "Confirmar minha rotina"
- Link secundário: "Editar mais tarde"

**Cálculo do resumo:**
```typescript
const selectedHabits = generatedHabits.filter(h => selectedHabitIds.has(h.id));
const habitsPerDay = selectedHabits.length;
const daysPerWeek = [...new Set(selectedHabits.flatMap(h => h.frequency_days))].length;
const totalMinutes = selectedHabits.reduce((sum, h) => sum + (h.duration || 0), 0);
```

---

### S11 — O que são as Jornadas

**Componente:** `S11_JourneysIntro.tsx`
**LEITURA:** nenhuma
**ESCRITA:** nenhuma
**VALIDAÇÃO:** sempre válido

**UI:**
- Título: "Agora, um nível acima."
- Copy em 3 parágrafos (ver Doc 1, S11)
- Visual: card de jornada mockado com barra de progresso zerada, animado
- CTA: "Ver as jornadas disponíveis"

**ANIMAÇÃO:**
- Card de missão mockado: entra com slide up + fade, barra de progresso anima de 0% brevemente para simular que está esperando o usuário

---

### S12 — Seleção de Jornada

**Componente:** `S12_JourneySelection.tsx`
**LEITURA:** `state.journeyScores`, `state.journeyDominantSignals`, jornadas do Supabase
**ESCRITA:** `state.selectedJourneyIds`
**VALIDAÇÃO:** sempre válido (pode pular)

**UI:**
- Título: "Escolha sua missão."
- Subtítulo: "Selecionamos as mais indicadas para o seu perfil. Você pode entrar em até 2 ao mesmo tempo."
- Cards ordenados por score (maiores primeiro)
- Badge "Recomendada para você" nas jornadas com score ≥ 65 (ou as 2 de maior score)
- Copy dinâmico de uma linha por card (baseado no `dominantSignal`)
- Máximo 2 seleções simultâneas
- Microcopy ao selecionar 2: copy de compatibilidade (ver Doc 3)
- CTA se ≥1 selecionado: "Entrar nessa jornada"
- CTA se 0 selecionado: "Pular por enquanto"

**Fetch de jornadas:**
```typescript
const { data: journeys } = await supabase
  .from('journeys')
  .select('id, slug, name, description, level, illustration_url')
  .eq('level', 1)
  .eq('is_active', true)
  .order('order_index');
```

**Cálculo de scores executado antes do S12:**
```typescript
// No OnboardingProviderV2, calcular quando S7 é concluído:
const result = calculateJourneyScores({
  quizData,
  lifeAreas: state.lifeAreas,
  habitExperience: state.habitExperience,
  wakeSleepTime: state.wakeSleepTime,
  confirmedObjective: state.confirmedObjective,
});
setState({
  journeyScores: result.scores,
  journeyDominantSignals: result.dominantSignals,
});
```

---

### S13 — Instalar o App (Hard)

**Componente:** `S13_InstallPWA_Hard.tsx`
**LEITURA:** `usePWA().isInstalled`
**ESCRITA:** nenhuma
**CONDICIONAL:** aparece APENAS se `!isPWAInstalled`
**VALIDAÇÃO:** sempre válido (pode continuar sem instalar)

**UI (não instalado):**
- Fullscreen com fundo mais escuro / urgente
- Título: "Você ainda não instalou o app."
- Copy direto (ver Doc 1, S13)
- Tutorial `<PWATutorial />` (mesmo componente do S3, mas maior)
- Botão primário (destaque máximo): "Instalar agora"
- Botão secundário (muito pequeno, sem destaque visual): "Continuar sem instalar"

**UI (após instalação confirmada):**
- Transição automática: check animado → avança para S14

**Detecção de instalação confirmada:**
```typescript
// Escutar evento do PWA
window.addEventListener('appinstalled', () => {
  setState({ isPWAInstalled: true });
  setTimeout(() => nextStep(), 1500);
});
```

---

### S14 — Ativar Notificações

**Componente:** `S14_Notifications.tsx`
**LEITURA:** `usePWA().isInstalled`, `usePushNotifications()`
**ESCRITA:** `state.notificationsGranted`
**CONDICIONAL:** se `!isPWAInstalled`: exibir versão bloqueada
**VALIDAÇÃO:** sempre válido (pode pular)

**UI (PWA instalada, notificações não ativas):**
- Título: "A última peça."
- Copy (ver Doc 1, S14)
- Botão primário: "Ativar lembretes"
- Botão secundário: "Agora não"

**UI (PWA não instalada):**
- Título: "Para ativar os lembretes, você precisa instalar o app primeiro."
- Copy explicativo
- CTA: "Instalar o app agora" → volta para S13

**UI (já ativas):**
- Check animado + "Lembretes ativados!"
- Auto-avança após 1.5s

**Lógica de ativação:**
```typescript
// Usar hook existente usePushNotifications()
const { subscribe, isSubscribed } = usePushNotifications();

const handleActivate = async () => {
  const granted = await subscribe();
  if (granted) {
    setState({ notificationsGranted: true });
    setTimeout(() => nextStep(), 1500);
  }
};
```

---

### S15–S19 — Tour do App (Spotlight)

**Componente:** `SpotlightOverlay.tsx` (orquestrador)
**Steps individuais:** `S15_Tour_Today.tsx` ... `S19_Tour_Bonus.tsx`
**LEITURA:** nenhuma
**ESCRITA:** nenhuma
**VALIDAÇÃO:** sempre válido

**Implementação do Spotlight:**
```typescript
interface SpotlightConfig {
  targetSelector: string;  // CSS selector do elemento a iluminar
  title: string;
  copy: string;
  position: 'top' | 'bottom' | 'left' | 'right'; // posição do tooltip
}

// Configurações por tour step:
const TOUR_STEPS: SpotlightConfig[] = [
  {
    targetSelector: '[data-tour="today"]',        // S15: aba Hoje no nav
    title: 'Aqui começa o dia.',
    copy: 'Todos os seus hábitos do dia ficam aqui. Um toque para marcar como feito. Simples assim.',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="journeys"]',      // S16
    title: 'Sua missão de 30 dias.',
    copy: 'Cada dia da sua jornada tem hábitos específicos esperando por você. É aqui que você acompanha o progresso.',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="habits"]',        // S17
    title: 'A sua rotina, do seu jeito.',
    copy: 'Adicione, edite ou reorganize seus hábitos quando quiser. A rotina é sua, o Bora só ajuda a manter.',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="avatar"]',        // S18
    title: 'Você evolui de verdade aqui.',
    copy: 'A cada hábito completado, seu avatar avança.',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="bonus"]',         // S19
    title: 'Tem mais coisa aqui dentro.',
    copy: 'Livros recomendados, meditações guiadas e conteúdos para quem quer ir além.',
    position: 'top',
  },
];
```

**Estrutura do overlay:**
```typescript
// Fundo: rgba(0,0,0,0.85) fullscreen
// Recorte: posição e tamanho do target element + 8px padding
// Recorte implementado com CSS clip-path ou box-shadow gigante
// Tooltip: card flutuante com Framer Motion

// Toque fora da tooltip → avança para próximo spotlight
// Botão "Próximo" → avança
// Indicador: "1 de 5" no topo
```

**Adicionar `data-tour` attributes nos elementos existentes:**
```typescript
// NavigationBar.tsx → adicionar data-tour em cada ícone
// Profile.tsx → adicionar data-tour no avatar e na seção bônus
// MyHabits.tsx → adicionar data-tour no container principal
```

---

### S20 — Celebração

**Componente:** `S20_Celebration.tsx`
**LEITURA:** `state.selectedHabitIds`, `state.selectedJourneyIds`, `state.notificationsGranted`
**ESCRITA:** SUBMISSÃO COMPLETA → Supabase
**VALIDAÇÃO:** automático — submete e redireciona

**UI:**
- Animação de confetti (biblioteca: `canvas-confetti` ou `react-confetti`)
- Check animado (Framer Motion: scale 0 → 1 com spring)
- Título: `"Tudo pronto, ${name}."`
- Copy: "Sua rotina está criada. Sua jornada está ativa. Tudo o que falta agora é o primeiro hábito."
- Resumo dinâmico (apenas campos que foram configurados):
  - ✓ X hábitos criados
  - ✓ Jornada [nome] iniciada (se selecionou)
  - ✓ Lembretes ativados (se ativou)
- Barra de progresso animada: 0% → 100% em 3s
- CTA (aparece após 2s): "Começar o Dia 1"

**Submissão no Supabase:**
```typescript
// Executado neste step, não antes (para não bloquear a animação)
const submitOnboardingV2 = async () => {
  const selectedHabits = generatedHabits.filter(h => selectedHabitIds.has(h.id));

  // 1. Criar hábitos
  for (const habit of selectedHabits) {
    await supabase.from('habits').insert({
      user_id: user.id,
      name: habit.name,
      category: mapCategory(habit.category),
      period: habit.period,
      emoji: habit.icon,
      icon_key: habit.icon_key,
      color: habit.color,
      goal_value: habit.goal_value,
      unit: mapUnit(habit.goal_unit),
      frequency_type: habit.frequency_type,
      days_of_week: habit.frequency_days,
      reminder_time: habit.suggested_time,
      duration_minutes: habit.duration,
      priority: habit.priority,
      template_id: habit.template_id,
      recommendation_score: habit.recommendation_score,
      habit_type: habit.habit_type,
      week_variation: habit.weekend_time ? {
        weekdays: { time: habit.suggested_time, duration: habit.duration },
        weekend: { time: habit.weekend_time, duration: habit.weekend_duration }
      } : null,
      source: 'onboarding_v2',
      onboarding_version: 'v2',
      is_active: true,
    });
  }

  // 2. Salvar scores de jornada
  for (const [journeyId, score] of Object.entries(journeyScores)) {
    await supabase.from('journey_recommendation_scores').upsert({
      user_id: user.id,
      journey_id: journeyId,
      score,
      dominant_signal: journeyDominantSignals[journeyId],
      calculated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,journey_id' });
  }

  // 3. Iniciar jornadas selecionadas
  for (const journeyId of selectedJourneyIds) {
    await startJourney(journeyId);
  }

  // 4. Marcar perfil como onboarding completo
  await supabase.from('profiles').update({
    has_completed_onboarding: true,
    onboarding_completed_at: new Date().toISOString(),
    onboarding_version: 'v2',
    onboarding_v2_data: {
      confirmedObjective,
      lifeAreas,
      habitExperience,
      wakeSleepTime,
      weekendDiff,
      habitsCreated: selectedHabits.length,
      journeysStarted: [...selectedJourneyIds],
      notificationsGranted,
    },
    quiz_linked_at: new Date().toISOString(),
  }).eq('user_id', user.id);

  // 5. Marcar quiz_response como onboarding completo
  if (quizResponseId) {
    await supabase.from('quiz_responses')
      .update({ onboarding_completed: true })
      .eq('id', quizResponseId);
  }

  // 6. Award XP (usar hook existente useGamification)
  await addXP({ amount: 75, reason: 'onboarding_v2_complete' });

  // 7. Navegar
  if (selectedJourneyIds.size > 0) {
    const firstJourneyId = [...selectedJourneyIds][0];
    const { data } = await supabase
      .from('journeys')
      .select('slug')
      .eq('id', firstJourneyId)
      .single();
    navigate(data?.slug ? `/journeys/${data.slug}/day/1` : '/dashboard', { replace: true });
  } else {
    navigate('/dashboard', { replace: true });
  }
};
```

---

## 6. OnboardingFlowV2 — Orquestrador

**Arquivo:** `App/src/components/onboarding-v2/OnboardingFlowV2.tsx`

```typescript
// Estrutura principal
const STEPS = [
  { id: 'welcome',          component: S0_Welcome,          phase: 0 },
  { id: 'intro',            component: S1_AppIntro,         phase: 0 },
  { id: 'objective',        component: S2_ObjectiveConfirm, phase: 0 },
  { id: 'pwa-soft',         component: S3_InstallPWA_Soft,  phase: 0 },
  { id: 'wake-sleep',       component: S4_WakeSleepTime,    phase: 1 },
  { id: 'weekend',          component: S5_WeekendDiff,      phase: 1 },
  { id: 'life-areas',       component: S6_LifeAreas,        phase: 1 },
  { id: 'experience',       component: S7_HabitExperience,  phase: 1 },
  { id: 'loading',          component: S8_LoadingRoutine,   phase: 2 },
  { id: 'preview',          component: S9_RoutinePreview,   phase: 2 },
  { id: 'confirm',          component: S10_RoutineConfirm,  phase: 2 },
  { id: 'journeys-intro',   component: S11_JourneysIntro,   phase: 3 },
  { id: 'journey-select',   component: S12_JourneySelection, phase: 3 },
  { id: 'pwa-hard',         component: S13_InstallPWA_Hard, phase: 4, conditional: !isPWAInstalled },
  { id: 'notifications',    component: S14_Notifications,   phase: 4 },
  { id: 'tour-today',       component: S15_Tour_Today,      phase: 5 },
  { id: 'tour-journeys',    component: S16_Tour_Journeys,   phase: 5 },
  { id: 'tour-habits',      component: S17_Tour_Habits,     phase: 5 },
  { id: 'tour-avatar',      component: S18_Tour_Avatar,     phase: 5 },
  { id: 'tour-bonus',       component: S19_Tour_Bonus,      phase: 5 },
  { id: 'celebration',      component: S20_Celebration,     phase: 6 },
];
```

**Barra de progresso:**
```typescript
// Barra segmentada por fase (6 segmentos)
// Cada segmento fica completo quando todos os steps da fase são concluídos
// Não mostrar em: S0, S8 (loading), S15-S19 (tour), S20 (celebração)
const HIDE_PROGRESS_ON = ['welcome', 'loading', 'tour-today', 'tour-journeys', 'tour-habits', 'tour-avatar', 'tour-bonus', 'celebration'];
```

**Botão de voltar:**
```typescript
// Não mostrar em: S0, S8, S15-S19, S20
// S13 (PWA hard): mostrar mas voltar para S12 (journey selection), não S12
```

**Transição entre steps:**
```typescript
// Direção: próximo step → slide da direita; step anterior → slide da esquerda
const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '100%' : '-100%',
    opacity: 0
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? '-100%' : '100%',
    opacity: 0
  })
};
// transition: { duration: 0.3, ease: 'easeInOut' }
```

---

## 7. Rota e Redirecionamento

**Arquivo:** `App/src/App.tsx`

```typescript
// Adicionar rota
<Route path="/onboarding-v2" element={
  <OnboardingProviderV2>
    <OnboardingFlowV2 />
  </OnboardingProviderV2>
} />
```

**Arquivo:** `App/src/components/ProtectedRoute.tsx` (ou Welcome.tsx)

```typescript
// Após login/signup: verificar se onboarding foi completo
// Se not has_completed_onboarding → redirecionar para /onboarding-v2
// (não para /onboarding-new do fluxo antigo)

const { data: profile } = await supabase
  .from('profiles')
  .select('has_completed_onboarding, onboarding_version')
  .eq('user_id', user.id)
  .single();

if (!profile?.has_completed_onboarding) {
  navigate('/onboarding-v2', { replace: true });
}
```

---

## 8. Analytics — Eventos a Trackear

Usar o hook existente `useAnalytics` ou `useAppMetrics`.

| Evento | Quando | Propriedades |
|--------|--------|-------------|
| `onboarding_v2_started` | S0 montado | `has_quiz_data: bool` |
| `onboarding_v2_step_completed` | Cada nextStep() | `step_id: string, phase: number` |
| `onboarding_v2_objective_confirmed` | S2 confirmado | `objective: string, changed: bool` |
| `onboarding_v2_pwa_soft_action` | S3 | `action: 'installed' \| 'skipped'` |
| `onboarding_v2_routine_generated` | S8 completo | `habits_count: number, experience: string` |
| `onboarding_v2_habits_selected` | S10 confirmado | `count: number, weekend_diff: string` |
| `onboarding_v2_journey_selected` | S12 | `journey_ids: string[], scores: object` |
| `onboarding_v2_pwa_hard_action` | S13 | `action: 'installed' \| 'skipped'` |
| `onboarding_v2_notifications_action` | S14 | `action: 'granted' \| 'skipped'` |
| `onboarding_v2_tour_completed` | S19 finalizado | — |
| `onboarding_v2_completed` | S20 submissão OK | `habits_created: number, journeys: string[], notifications: bool` |
| `onboarding_v2_abandoned` | unmount com step < 20 | `last_step: string, phase: number` |

---

## 9. Dependências Necessárias

```bash
# Verificar se já existem no package.json, instalar se não
npm install canvas-confetti @types/canvas-confetti  # Celebração
npm install @dnd-kit/core @dnd-kit/sortable          # Drag & drop no preview da rotina
```

---

## 10. Checklist de Implementação

### Fase 1 — Infraestrutura
- [ ] Criar migration `20260316000000_onboarding_v2.sql` e aplicar
- [ ] Criar hook `useQuizData.ts`
- [ ] Criar `calculateJourneyScores.ts`
- [ ] Criar `generateRecommendationsV2.ts` (baseado no Doc 2)
- [ ] Criar `OnboardingProviderV2.tsx` com todo o state
- [ ] Criar `OnboardingFlowV2.tsx` com orquestração de steps
- [ ] Adicionar rota `/onboarding-v2` no App.tsx

### Fase 2 — Steps da Fase 0 (Entrada)
- [ ] S0_Welcome — lookup quiz_responses, coleta nome se ausente
- [ ] S1_AppIntro — copy estático com animações
- [ ] S2_ObjectiveConfirm — pré-seleção do quiz, 5 cards
- [ ] S3_InstallPWA_Soft — detecção de plataforma, tutorial

### Fase 3 — Steps da Fase 1 (Coleta)
- [ ] S4_WakeSleepTime — dois seletores de horário
- [ ] S5_WeekendDiff — 3 cards + microcopy condicional
- [ ] S6_LifeAreas — multi-select 4 cards
- [ ] S7_HabitExperience — 3 cards + microcopy pós-seleção

### Fase 4 — Steps da Fase 2 (Rotina)
- [ ] S8_LoadingRoutine — animação + geração real da rotina
- [ ] S9_RoutinePreview — cards com drag & drop + abas semana/fim de semana
- [ ] S10_RoutineConfirm — resumo + confirmação

### Fase 5 — Steps da Fase 3 (Jornadas)
- [ ] S11_JourneysIntro — copy + card mockado animado
- [ ] S12_JourneySelection — cards com scores + badge + copy dinâmico
- [ ] Cálculo de scores no contexto (trigger: S7 concluído)

### Fase 6 — Steps da Fase 4 (Setup)
- [ ] S13_InstallPWA_Hard — condicional se não instalado
- [ ] S14_Notifications — integração com usePushNotifications

### Fase 7 — Tour e Celebração
- [ ] SpotlightOverlay.tsx — componente reutilizável
- [ ] Adicionar data-tour attributes nos componentes existentes (NavigationBar, Profile, MyHabits)
- [ ] S15–S19 Tour steps (usar SpotlightOverlay)
- [ ] S20_Celebration — confetti + submissão + redirect

### Fase 8 — Integração e Testes
- [ ] Atualizar ProtectedRoute para redirecionar para /onboarding-v2
- [ ] Verificar que /onboarding-new (antigo) ainda funciona (manter para rollback)
- [ ] Testar fluxo completo com quiz_data disponível
- [ ] Testar fluxo completo sem quiz_data (fallback)
- [ ] Testar PWA já instalado (S3/S13 condicionais)
- [ ] Testar com habit_experience = 'never' (limite de 4 hábitos)
- [ ] Analytics: verificar todos os eventos disparando corretamente
