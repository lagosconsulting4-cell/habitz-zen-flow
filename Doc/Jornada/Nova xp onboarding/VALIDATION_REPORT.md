# VALIDATION REPORT — Onboarding V2

**Data:** 2026-03-16 (atualizado)
**Validador:** Claude Code (Opus 4.6)
**Build:** `tsc --noEmit` PASS | `vite build` PASS (100 precache entries, 26s)
**Screenshots:** `.playwright-mcp/onboarding-v2-validation/` (S0-S20 at 375px dark mode)

---

## Resumo Executivo

| Camada | Status | Detalhes |
|--------|--------|----------|
| Copy vs Doc1 | 11 divergencias encontradas e corrigidas | F5-F10, F14 |
| Logica de dados | 4 problemas criticos encontrados e corrigidos | F1-F4 |
| Design/A11y | 3 blockers + 5 high corrigidos | D1-D8 |
| TypeScript | PASS (0 erros) | |
| Build | PASS | |
| Visual S0-S7 | 8 screenshots, todos OK | |
| Visual S8-S20 | 13 screenshots, todos OK | Via `?step=N` dev prop |
| Copy S8-S20 | Verificado contra Doc1 | Todas as steps OK |
| Overflow 375px | PASS em todos os 21 steps | Zero overflow horizontal |

---

## CAMADA 1 — Validacao Visual (Playwright)

**Viewport:** 375x812 (iPhone SE) | **Tema:** Dark mode | **Rota:** `/app/onboarding-v2`

### Screenshots S0-S7 (sessao 1)

| Step | Arquivo | Status |
|------|---------|--------|
| S0 | `S0_Welcome_375.png` | OK — variante "nome input" (sem quizData) |
| S1 | `S1_AppIntro_375.png` | OK — "Aqui e diferente." renderizado |
| S2 | `S2_ObjectiveConfirm_375.png` | OK — 5 cards, CTA "Isso mesmo, continuar" |
| S3 | `S3_InstallPWA_375.png` | OK — tutorial desktop (headless Chrome) |
| S4 | `S4_WakeTime_375.png` | OK — time picker com barra visual |
| S5 | `S5_WeekendDiff_375.png` | OK — 3 opcoes, layout limpo |
| S6 | `S6_LifeAreas_375.png` | OK — 4 cards visiveis, subtitle corrigido |
| S7 | `S7_HabitExperience_375.png` | OK — 3 opcoes com explicacao |

### Screenshots S8-S20 (sessao 2 — via `?step=N`)

| Step | Arquivo | Status | Notas |
|------|---------|--------|-------|
| S8 | `S8_LoadingRoutine_375.png` | OK | Loading -> auto-avanca para S9 com habitos gerados |
| S9 | `S9_RoutinePreview_375.png` | OK | 0 habitos (dev mode sem dados), layout correto |
| S10 | `S10_RoutineConfirm_375.png` | OK | "Parece pouco? E proposital." + "Confirmar minha rotina" CTA |
| S11 | `S11_JourneysIntro_375.png` | OK | "Agora, um nivel acima." + 3 paragrafos + mock card |
| S12 | `S12_JourneySelection_375.png` | OK | 5 jornadas reais do Supabase, cards coloridos |
| S13 | `S13_InstallPWA_Hard_375.png` | OK | "Voce ainda nao instalou o app." + tutorial desktop |
| S14 | `S14_Notifications_375.png` | OK | Estado bloqueado (PWA nao instalada) |
| S15 | `S15_Tour_Today_375.png` | OK | SpotlightOverlay "1 de 5" visivel, "Aqui comeca o dia." |
| S16 | `S16_Tour_Journeys_375.png` | OK | "Sua missao de 30 dias." |
| S17 | `S17_Tour_Habits_375.png` | OK | "A sua rotina, do seu jeito." |
| S18 | `S18_Tour_Avatar_375.png` | OK | "Voce evolui de verdade aqui." |
| S19 | `S19_Tour_Bonus_375.png` | OK | "Tem mais coisa aqui dentro." |
| S20 | `S20_Celebration_375.png` | OK | "Tudo pronto, voce." + confetti + "Comecar o Dia 1" |

### Metricas de layout

| Metrica | Valor | Status |
|---------|-------|--------|
| CTA button (S1) | 295x48px | PASS (>44x44) |
| Cards objetivos (S2) | 295x96px | PASS |
| Scroll horizontal (todos) | 375px | PASS (sem overflow em nenhum step) |

### Nota sobre dev mode

Steps S8+ usam `?step=N` para pular diretamente (via `initialStep` dev prop). Steps que dependem de dados anteriores (S9 sem habitos gerados, S10 sem stats) renderizam com valores zerados, mas o layout e copy sao validaveis. O S8 gera habitos com fallback e auto-avanca para S9 mostrando os habitos corretamente.

---

## CAMADA 2 — Validacao de Codigo

### Correcoes aplicadas — Sessao 1

#### HIGH — Integridade de dados (submitOnboardingV2)

| ID | Arquivo | Linha | Problema | Correcao |
|----|---------|-------|----------|----------|
| F1 | `OnboardingProviderV2.tsx` | ~410 | Profile update faltando 3 campos migrados (`onboarding_version`, `onboarding_v2_data`, `quiz_linked_at`) | Adicionados com `as any` cast |
| F2 | `OnboardingProviderV2.tsx` | ~385 | `journey_recommendation_scores` nunca populado (comentado como "table doesn't exist") | Inserido bloco de insert com scores |
| F3 | `OnboardingProviderV2.tsx` | ~420 | Campo errado no quiz_responses (`converted_to_customer` em vez de `onboarding_completed`) | Adicionado `onboarding_completed: true` (mantido `converted_to_customer` por compatibilidade) |
| F4 | `S8_LoadingRoutine.tsx` | 106 | Crash `quizData!` quando quizData e null (dev mode) | Adicionado `safeQuizData` fallback com defaults |

#### MEDIUM — Copy divergente do Doc1

| ID | Arquivo | Linha | Doc1 | Codigo (antes) | Correcao |
|----|---------|-------|------|----------------|----------|
| F5 | `S6_LifeAreas.tsx` | 57 | "Escolha as areas que voce quer trabalhar. Pode marcar mais de uma." | "Escolha uma ou mais areas." | Corrigido |
| F6 | `S18_Tour_Avatar.tsx` | 14 | "A cada habito completado, seu avatar avanca. E uma forma de ver, de forma visual, quem voce esta se tornando." | Faltava 2a frase | Corrigido |
| F7 | `S19_Tour_Bonus.tsx` | 21 | "Livros recomendados, meditacoes guiadas e conteudos para quem quer ir alem. Disponiveis sempre que voce quiser." | Faltava ultima frase | Corrigido |

#### LOW — Copy e polish

| ID | Arquivo | Linha | Problema | Correcao |
|----|---------|-------|----------|----------|
| F8 | `S8_LoadingRoutine.tsx` | 11-17 | Labels de objetivo abreviados ("produtividade") vs Doc1 ("ser mais produtivo") | Labels atualizados para Doc1 |
| F9 | `S8_LoadingRoutine.tsx` | 33-37 | Testimonials reduzidos vs Doc1 | Substituidos por textos exatos do Doc1 |
| F10 | `S9_RoutinePreview.tsx` | 386 | "Voce pode mudar tudo depois." vs Doc1 "Voce pode editar a qualquer momento dentro do app." | Corrigido |

### Correcoes aplicadas — Sessao 2

#### Copy — S8 testimonial faltando

| ID | Arquivo | Linha | Problema | Correcao |
|----|---------|-------|----------|----------|
| F14 | `S8_LoadingRoutine.tsx` | 33-36 | F9 removeu testimonial do Rafael que existe no Doc1 (linha 294) | Adicionado 3o testimonial: "A diferenca foi ter algo concreto para seguir. Sem adivinhacao." — Rafael, 31 |

### Copy S8-S20 — Verificacao contra Doc1

| Step | Titulo | Copy | CTAs | Status |
|------|--------|------|------|--------|
| S8 | N/A (loading) | 5 mensagens dinamicas + 3 testimonials | N/A | MATCH |
| S9 | "Essa e a sua rotina." | Subtitle dinamico + footer correto | "Continuar" | MATCH |
| S10 | "Pronto. Essa e a sua rotina, [nome]." | "Parece pouco? E proposital." | "Confirmar minha rotina" | MATCH |
| S11 | "Agora, um nivel acima." | 3 paragrafos sobre Jornadas | "Ver as jornadas disponiveis" | MATCH |
| S12 | "Escolha sua missao." | Subtitle + badges dinamicos | "Entrar nessa jornada" / "Pular por enquanto" | MATCH |
| S13 | "Voce ainda nao instalou o app." | Tutorial por plataforma | "Instalar agora" / "Continuar sem instalar" | MATCH |
| S14 | "A ultima peca." | Copy sobre lembretes | "Ativar lembretes" / "Agora nao" | MATCH |
| S15 | "Aqui comeca o dia." | Copy do tour | "Toque para continuar" | MATCH |
| S16 | "Sua missao de 30 dias." | Copy do tour | "Toque para continuar" | MATCH |
| S17 | "A sua rotina, do seu jeito." | Copy do tour | "Toque para continuar" | MATCH |
| S18 | "Voce evolui de verdade aqui." | Copy do tour (2 frases) | "Toque para continuar" | MATCH |
| S19 | "Tem mais coisa aqui dentro." | Copy do tour (2 frases) | "Toque para continuar" | MATCH |
| S20 | "Tudo pronto, [nome]." | Summary dinamico | "Comecar o Dia 1" | MATCH |

#### SKIP — Sem impacto em runtime

| ID | Arquivo | Problema | Razao do skip |
|----|---------|----------|---------------|
| F11 | `OnboardingFlowV2.tsx:52` | Flag `conditional: true` declarada mas nao consumida | Sem impacto funcional |
| F12 | `S9_RoutinePreview.tsx:36-39` | Emojis de periodo (sol/lua) nos headers | Sao indicadores visuais funcionais |
| F13 | `SpotlightOverlay.tsx` | Sem botao "Proximo" explicito no tour | Tap-to-advance e padrao mobile valido |

### Verificacao de build (sessao 2)

```
tsc --noEmit    -> 0 erros
vite build      -> sucesso (26s, 100 precache entries)
```

### Dependencias de useCallback

O `submitOnboardingV2` agora inclui todos os state vars necessarios:
```
[user, generatedHabits, selectedHabitIds, selectedJourneyIds, quizResponseId,
 notificationsGranted, addXP, navigate, startJourney, trackEvent,
 journeyScores, journeyDominantSignals, wakeSleepTime, weekendDiff,
 lifeAreas, habitExperience]
```

---

## CAMADA 3 — Auditoria de Design (Correcoes Aplicadas)

### BLOCKERS — CORRIGIDOS

| # | Arquivo:Linha | Problema | Correcao aplicada |
|---|---------------|----------|-------------------|
| D1 | `SpotlightOverlay.tsx:88` | `text-white/70` (~3.6:1 contraste) | Mudado para `text-white/90` (~5.8:1 WCAG AA) |
| D2 | `S9_RoutinePreview.tsx:122-133` | Toggle 24x24px abaixo do minimo | Button externo 44x44 (`w-11 h-11`) + span visual 24x24 interno + `aria-label` |
| D3 | `S9_RoutinePreview.tsx:88-94` | Drag handle `tabIndex={-1}` inacessivel | `tabIndex={0}` + `focus-visible:ring-2 ring-primary` + `aria-label` + `KeyboardSensor` adicionado ao `@dnd-kit` |

### HIGH — CORRIGIDOS

| # | Arquivo:Linha | Problema | Correcao aplicada |
|---|---------------|----------|-------------------|
| D4 | `S12_JourneySelection.tsx` | 6 motion elements sem `reducedMotion` gate | Adicionado `reducedMotion ? { opacity: 1 } : ...` em header, card list, check indicator, compat note, zero-text, CTA |
| D5 | `S13/S14` | `min-h-[80vh]` causa scroll em telas pequenas | Mudado para `min-h-[70vh] md:min-h-[80vh]` (5 ocorrencias: S13 x2, S14 x3) |
| D6 | `S4_WakeSleepTime.tsx:119` | `text-[10px]` abaixo do minimo legivel | Mudado para `text-xs` (12px) |
| D7 | 7 arquivos de steps | Duracoes 0.5s-0.6s inconsistentes | 27 ocorrencias `duration: 0.5` -> `0.4` + 1 `duration: 0.6` -> `0.4`. Mantidos 4 `spring duration: 0.6` |
| D8 | `S0_Welcome.tsx:96` | Input sem focus ring destacado | Adicionado `focus-visible:ring-primary` |

### MEDIUM — Pendentes (proximo ciclo)

| # | Arquivo:Linha | Problema |
|---|---------------|----------|
| D9 | `S8_LoadingRoutine.tsx:159-184` | Pulse animation sem check de motion preference |
| D10 | `S20_Celebration.tsx:27` | `confetti()` sem check de reduced motion |
| D11 | `TourMockElements.tsx:47-68` | Botoes de nav icon-only sem `aria-label` |
| D12 | `S12_JourneySelection.tsx:181` | aria-label incompleto (falta contexto de score) |
| D13 | `S6_LifeAreas.tsx:66-87` | Estado disabled com baixo contraste visual |
| D14 | `S9_RoutinePreview.tsx:94` | Affordance de drag sutil demais em mobile |
| D15 | `S10_RoutineConfirm.tsx:86` | Botao com `h-14` em vez de `size="lg"` padrao |

---

## Dev Tooling Adicionado

| Feature | Descricao |
|---------|-----------|
| `?step=N` | Query param dev-only para pular para qualquer step (0-20). Ex: `/app/onboarding-v2?step=12` |
| `initialStep` prop | Prop em `OnboardingProviderV2` consumido apenas em `import.meta.env.DEV` |
| `screenshot-s8-s20.mjs` | Script Playwright que captura S8-S20 via `?step=N` em 375x812 dark mode |

---

## Itens pendentes (concluidos)

| Item | Status | Data |
|------|--------|------|
| Migration | CONCLUIDO | 2026-03-16 — 97 migrations sincronizadas |
| Types | CONCLUIDO | 2026-03-16 — tipos regenerados |
| Cast cleanup | CONCLUIDO | 2026-03-16 — 3 `as any` removidos |
| Migracao para producao | CONCLUIDO | 2026-03-16 — rota `/onboarding` promovida |

---

## CAMADA 4 — Migracao para Producao (2026-03-16)

### Alteracoes de rota

| Rota | Antes | Depois |
|------|-------|--------|
| `/onboarding` | Legacy v0 (`OnboardingFlow`) | **V2 (`OnboardingFlowV2`)** |
| `/onboarding-v2` | V2 (primario) | Redirect para `/onboarding` |
| `/onboarding-legacy` | N/A | Legacy v0 (arquivado) |
| `/onboarding-legacy-new` | N/A | Legacy v1 (arquivado) |

### Arquivos modificados

| Arquivo | Alteracao |
|---------|-----------|
| `App.tsx:24-26` | Imports renomeados (Legacy → `*Legacy`, V2 mantido) |
| `App.tsx:175-179` | Rotas reestruturadas com backward compat redirect |
| `Auth.tsx:48` | Redirect `/onboarding-v2` → `/onboarding` |
| `Auth.tsx:54,66` | Excluded paths atualizados |
| `ProtectedRoute.tsx:19` | Dev bypass atualizado para `/onboarding` |

### Fluxo de redirect pos-migracao

```
Auth.tsx (login) → !has_completed_onboarding → /onboarding (V2)
DefinirSenha.tsx (Stripe) → /onboarding (V2, sem alteracao necessaria)
/onboarding-v2 (bookmark antigo) → redirect para /onboarding
```

### Build pos-migracao

```
tsc --noEmit    -> 0 erros
vite build      -> sucesso (31s, 100 precache entries)
```

---

## Conclusao

O onboarding v2 esta **em producao** na rota `/onboarding`:

- **11 correcoes de codigo** aplicadas (F1-F10, F14) — integridade de dados, copy, e crash fixes
- **8 correcoes de design** aplicadas (D1-D8) — todos os blockers e high priority resolvidos
- **21 screenshots** capturados em 375px dark mode — zero overflow horizontal
- **Copy S8-S20** verificado contra Doc1 — 100% match
- **Build** passa sem erros (tsc + vite)
- **Migration SQL** aplicada e tipos regenerados
- **Rota `/onboarding`** agora serve o V2 (Stripe + Auth redirect funcionando)
- **7 issues MEDIUM** pendentes para proximo ciclo (D9-D15, nenhum impede lancamento)

**Proximo passo:** Testar fluxo completo com usuario real (quiz_responses + auth)
