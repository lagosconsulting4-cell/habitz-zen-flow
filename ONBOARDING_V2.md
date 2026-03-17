# ONBOARDING V2 — Contexto para Claude Code

## O que e este projeto
Onboarding principal do app Bora. **Em producao** desde 2026-03-16 na rota `/onboarding`.

## Arquitetura de rotas

| Rota | Componente | Status |
|------|-----------|--------|
| `/onboarding` | `OnboardingFlowV2` | **Producao** |
| `/onboarding-v2` | Redirect para `/onboarding` | Backward compat |
| `/onboarding-legacy` | `OnboardingFlow` (v0) | Arquivado |
| `/onboarding-legacy-new` | `NewOnboardingFlow` (v1) | Arquivado |

## Codigo fonte

| Camada | Localizacao |
|--------|-------------|
| Fluxo principal (v2) | `App/src/components/onboarding-v2/` |
| Legacy v1 (arquivado) | `App/src/components/onboarding/` |
| Legacy v0 (arquivado) | `App/src/pages/OnboardingFlow.tsx` |

## Documentacao de referencia
Todos os arquivos estao em: `Doc/Jornada/Nova xp onboarding/`

| Arquivo | Conteudo |
|---------|----------|
| `Doc1_Copy_Master_Onboarding.md` | Copy completo de todos os 21 steps |
| `Doc2_Matriz_Personalizacao_Rotina.md` | Logica de geracao de rotinas (7 camadas) |
| `Doc3_Logica_Recomendacao_Jornadas.md` | Algoritmo de score de jornadas (0-100) |
| `Doc4_Spec_Tecnico_Onboarding.md` | Blueprint tecnico completo de implementacao |
| `VALIDATION_REPORT.md` | Relatorio de validacao com screenshots e correcoes |

## Stack
- React + TypeScript + Vite
- Supabase (client em `App/src/integrations/supabase/client.ts`)
- Tailwind CSS
- Motion (`motion/react`)
- `@dnd-kit/core` + `@dnd-kit/sortable` (drag-and-drop em S9)
- Hooks: `usePWA`, `usePushNotifications`, `useGamification`, `useJourney`

## Tabelas Supabase relevantes
- `quiz_responses` — dados do quiz da landing page (lookup por email)
- `profiles` — perfil do usuario (`has_completed_onboarding`, `onboarding_version`, `onboarding_v2_data`)
- `habits` — habitos criados
- `journeys` — jornadas disponiveis
- `user_journey_state` — estado de jornadas do usuario
- `journey_recommendation_scores` — scores calculados no onboarding

## Estado do onboarding (fonte da verdade: OnboardingProviderV2)
Campos vindos do quiz (quiz_responses via useQuizData):
- name, objective, challenges[], energy_peak, time_available
- profession, age_range, years_promising, consistency_feeling

Campos coletados no onboarding (steps S4-S7):
- wakeSleepTime: { wake: string, sleep: string }
- weekendDiff: 'same' | 'different' | 'varies'
- lifeAreas: string[]
- habitExperience: 'never' | 'tried' | 'already_have'

## Fluxo de redirect

```
Login (Auth.tsx) → !has_completed_onboarding → /onboarding (v2)
Stripe (DefinirSenha.tsx) → /onboarding (v2)
/onboarding-v2 → redirect para /onboarding
```

## FASE ATUAL: Producao

## Checklist geral
- [x] Fase 1: Infraestrutura (migration + hooks + algoritmos + provider + rota)
- [x] Fase 2: Steps S0-S3 (Entrada e apresentacao)
- [x] Fase 3: Steps S4-S7 (Coleta enriquecida)
- [x] Fase 4: Steps S8-S10 (Rotina)
- [x] Fase 5: Steps S11-S12 (Jornadas)
- [x] Fase 6: Steps S13-S14 (Setup tecnico)
- [x] Fase 7: Steps S15-S20 (Tour + Celebracao + Submissao)
- [x] Fase 8: Integracao, testes e cutover
- [x] Fase 9: Validacao (VALIDATION_REPORT.md — 11 code fixes, 8 design fixes)
- [x] Fase 10: Migracao para producao (rota `/onboarding` promovida)
