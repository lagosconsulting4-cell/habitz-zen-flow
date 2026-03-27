# 05 - Sons e Vibracoes: Feedback Sensorial em Momentos-Chave

## Problema

O Bora tem um **sistema completo de som e haptics** (`sounds.ts` com 5 sons, `haptics.ts` com 6 padroes de vibracao) que esta **subutilizado**. Sons so tocam em celebracoes do `celebrations.ts` e haptics sao usados minimamente. Apps de sucesso como Duolingo usam feedback sensorial em CADA interacao significativa — o som de "ding" ao acertar, a vibracao ao completar, o fanfare ao atingir marcos. O Bora precisa dessa camada sensorial.

---

## Estado Atual

### Sistema de Som (`App/src/lib/sounds.ts`, 396 linhas)
**Sons disponiveis em `/App/public/sounds/`:**

| Som | Arquivo | Volume Default | Quando Usa Hoje |
|-----|---------|----------------|-----------------|
| `complete` | complete.mp3 | 0.4 | Via celebrations.habitComplete() |
| `levelUp` | level-up.mp3 | 0.6 | Via celebrations.levelUp() |
| `streak` | streak.mp3 | 0.5 | Via celebrations.streakMilestone() |
| `dayComplete` | day-complete.mp3 | 0.7 | Via celebrations.perfectDay() |
| `unlock` | unlock.mp3 | 0.5 | Via celebrations.unlock() |

**API:**
- `sounds.complete()` / `sounds.levelUp()` / etc.
- `sounds.playSoundIf(type, condition, volume)` — condicional
- `sounds.withSound(handler, soundType)` — wrapper
- `sounds.setVolume()` / `sounds.mute()` / `sounds.toggleMute()`

**Preferencias:** `localStorage habitz:preferences` → `soundEnabled`, `soundVolume`

### Sistema de Haptics (`App/src/lib/haptics.ts`, 120 linhas)
**Padroes disponiveis:**

| Padrao | Duracao | Quando Usa Hoje |
|--------|---------|-----------------|
| `haptic.light()` | [10ms] | journey pause |
| `haptic.medium()` | [25ms] | journey start/resume, celebrations |
| `haptic.heavy()` | [50ms] | level-up celebration |
| `haptic.success()` | [10ms, 50ms, 10ms] | Nao usado diretamente |
| `haptic.error()` | [50ms, 100ms, 50ms] | Nao usado |
| `haptic.double()` | [15ms, 30ms, 15ms] | Nao usado |
| `haptic.custom(pattern)` | Variavel | Nao usado |

**Nota:** iOS NAO suporta Vibration API. Calls falham silenciosamente. Funciona em Android.

### Celebrations.ts (`App/src/lib/celebrations.ts`, 408 linhas)
Orquestra som + haptic + visual (glow, particles, scale):
- `celebrations.habitComplete()` → complete + haptic.medium + glow
- `celebrations.levelUp()` → levelUp + haptic.heavy + glow + 20 particles
- `celebrations.streakMilestone()` → streak + haptic.heavy + glow + 12 particles
- `celebrations.perfectDay()` → dayComplete + haptic.heavy + glow + 20 particles
- `celebrations.unlock()` → unlock + haptic.medium + glow

---

## Proposta: Mapa de Feedback Sensorial

### Momentos que DEVEM ter feedback (e nao tem hoje)

| Momento | Onde Ocorre | Som | Vibracao | Visual |
|---------|-------------|-----|----------|--------|
| Completar habito individual | Dashboard.tsx toggle | `complete` | `success` | glow (ja tem) |
| Primeiro habito EVER | Dashboard.tsx toggle | `levelUp` | `heavy` | glow + 20 particles |
| Iniciar jornada | JourneyDetail.tsx | `unlock` | `success` | Nenhum extra |
| Abrir conteudo do dia | JourneyDayCard.tsx mount | Nenhum | `light` | Nenhum |
| Completar dia da jornada | JourneyDayCompleteModal | `dayComplete` | `medium` | particulas (ja tem) |
| Marco dia 7 | JourneyDayCompleteModal | `streak` | `success` | glow + badge |
| Marco dia 14 | JourneyDayCompleteModal | `streak` | `heavy` | glow + badge |
| Marco dia 21 | JourneyDayCompleteModal | `levelUp` | `heavy`+`double` | glow + badge + 20 particles |
| Conclusao de fase | JourneyDayCompleteModal | `levelUp` | `heavy` | glow (ja tem) |
| Graduacao (dia 30) | JourneyGraduationModal | `levelUp` | `heavy` | Modal (ja tem) |
| Selecionar jornada (onboarding) | JourneySelectionStep | Nenhum | `light` | check glow (ja tem) |
| Onboarding completo | CelebrationStep | `levelUp` | `heavy` | animacao (ja tem) |
| Level up | LevelUpModal | `levelUp` | `heavy` | Modal (ja tem) |
| Achievement desbloqueado | AchievementToast | `unlock` | `success` | toast (ja tem) |
| Streak record | StreakToast | `streak` | `double` | toast (ja tem) |
| Comprar streak freeze | FreezeShopModal | `unlock` | `medium` | Nenhum extra |

### Detalhamento por Arquivo

#### 1. Dashboard.tsx — Completar Habito
**Situacao atual:** `celebrations.habitComplete()` e chamado, que inclui som + haptic. VERIFICAR se esta realmente ativo — o `celebrate()` function verifica `isCelebrationsEnabled()` e `isSoundEnabled()` separadamente.

**Acao:** Confirmar que o flow completo funciona:
```tsx
// No handler de toggle, garantir:
if (completed) {
  celebrations.habitComplete(); // Ja inclui: sounds.complete() + haptic.medium() + glow
}
```

Se `celebrations.habitComplete()` ja e chamado e funciona, nao precisa mudar nada aqui. Apenas confirmar e documentar.

#### 2. JourneyDetail.tsx — Iniciar Jornada
**Situacao atual:** `haptic.medium()` no start (linha 41). Sem som.
```tsx
// ANTES:
const handleStart = async () => {
  haptic.medium();
  await startJourney(journeyId);
};

// DEPOIS:
const handleStart = async () => {
  sounds.unlock(); // Som de "desbloqueio" — nova jornada iniciada
  haptic.success(); // Vibracao de sucesso [10ms, 50ms, 10ms]
  await startJourney(journeyId);
};
```

#### 3. JourneyDayCard.tsx — Abrir Conteudo do Dia
**Situacao atual:** Nenhum feedback ao montar a pagina.
```tsx
// Adicionar no useEffect de mount:
useEffect(() => {
  haptic.light(); // Vibracao sutil ao abrir conteudo [10ms]
}, []);
```
**Nota:** Som ao abrir conteudo pode ser irritante. Apenas vibracao sutil.

#### 4. JourneyDayCompleteModal.tsx — Completar Dia + Marcos
Detalhado no documento 02 (Celebracoes Progressivas). Resumo:
- Dia normal: `sounds.dayComplete()` + `haptic.medium()`
- Dia 7: `sounds.streak()` + `haptic.success()`
- Dia 14: `sounds.streak()` + `haptic.heavy()`
- Dia 21: `sounds.levelUp()` + `haptic.heavy()` + `haptic.double()`

#### 5. JourneySelectionStep.tsx — Selecionar Jornada no Onboarding
**Situacao atual:** Nenhum feedback sensorial.
```tsx
// No handler de selecao de jornada:
const handleSelect = (journeyId: string) => {
  haptic.light(); // Vibracao sutil ao selecionar [10ms]
  // ... logica existente de toggle
};
```

#### 6. CelebrationStep.tsx — Onboarding Completo
**Situacao atual:** Nenhum feedback sensorial.
```tsx
// No useEffect de mount:
useEffect(() => {
  sounds.levelUp(); // Som epico — momento de transformacao
  haptic.heavy();   // Vibracao forte
}, []);
```

#### 7. AchievementToast.tsx / StreakToast.tsx
**Verificar:** Se os toasts ja chamam sons/haptics via celebrations system. Se nao, adicionar:
```tsx
// AchievementToast mount:
useEffect(() => {
  sounds.unlock();
  haptic.success();
}, []);

// StreakToast mount:
useEffect(() => {
  sounds.streak();
  haptic.double();
}, []);
```

---

## Sons Futuros (P2)

Para P2, considerar adicionar novos sons customizados:
- **`journey-start.mp3`** — som mais grandioso para iniciar jornada (em vez de reuso do `unlock`)
- **`milestone.mp3`** — som especifico para marcos (dia 7/14/21)
- **`tap.mp3`** — som sutil de toque para interacoes menores

Esses sons seriam adicionados em `/App/public/sounds/` e registrados em `SOUND_PATHS` no `sounds.ts`.

---

## Implementacao

### Arquivos a Modificar
1. `App/src/pages/Dashboard.tsx` — confirmar/ajustar feedback em completar habito
2. `App/src/pages/JourneyDetail.tsx` — som ao iniciar jornada
3. `App/src/pages/JourneyDayCard.tsx` — vibracao ao abrir dia
4. `App/src/components/JourneyDayCompleteModal.tsx` — som/vibracao por marco (ver doc 02)
5. `App/src/components/onboarding/steps/JourneySelectionStep.tsx` — vibracao ao selecionar
6. `App/src/components/onboarding/steps/CelebrationStep.tsx` — som/vibracao na celebracao

### Imports Necessarios (em cada arquivo que ainda nao tem)
```tsx
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";
```

---

## Verificacao

1. **Completar habito:** Som `complete` toca + vibracao no Android
2. **Iniciar jornada:** Som `unlock` toca + vibracao success
3. **Abrir conteudo do dia:** Vibracao light sutil
4. **Marco dia 7:** Som `streak` + vibracao success
5. **Marco dia 21:** Som `levelUp` + vibracao heavy+double sequencial
6. **Onboarding completo:** Som `levelUp` + vibracao heavy
7. **Som desabilitado:** Se `soundEnabled = false`, nenhum som toca
8. **Haptic desabilitado:** Se `hapticEnabled = false`, nenhuma vibracao
9. **iOS:** Sons funcionam, vibracoes falham silenciosamente (esperado)
10. **Volume:** Respeita `soundVolume` do preferences

---

## Metricas de Sucesso
- **Percepcao de qualidade:** Feedback sensorial e o que separa apps "profissionais" de "amadores"
- **Retencao:** Condicionamento pavloviano — som de completar cria associacao positiva
- **Engajamento:** Haptics aumentam satisfacao de interacoes tateis em ~20% (estudos UX)
