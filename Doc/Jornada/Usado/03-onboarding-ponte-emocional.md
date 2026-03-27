# 03 - Onboarding: Ponte Emocional entre Landing Page e App

## Problema

O onboarding atual e **funcional e inteligente** (14 passos adaptativos, recomendacao de habitos por IA), mas falta a ponte emocional com a landing page. O usuario chega do Bora com expectativa de "transformar sua vida" e encontra:

- Selecao de jornada: **"Escolha sua jornada"** (funcional, sem emocao)
- Celebracao final: **"Parabens! Sua rotina personalizada esta pronta"** (generico)

Essas sao as duas telas mais importantes do onboarding — a ESCOLHA (commitment) e o FINAL (peak-end). Ambas precisam carregar peso emocional.

---

## Estado Atual

### JourneySelectionStep.tsx (244 linhas)
**Caminho:** `App/src/components/onboarding/steps/JourneySelectionStep.tsx`

- **Header (linhas 79-84):**
  ```tsx
  <h2 className="text-2xl font-bold mb-1">Escolha sua jornada</h2>
  <p className="text-sm text-muted-foreground font-serif italic">
    Transformacoes guiadas de 30 dias — escolha ate 2
  </p>
  ```
- **Cards de jornada (linhas 110-222):**
  - Accent stripe no topo (cor do tema)
  - Icone com animacao de escala ao selecionar
  - Badge "Pra voce" para jornadas recomendadas (baseado em desafios)
  - Duracao "30 dias" ao lado do icone
  - Promise text: `text-xs text-muted-foreground` (MUITO pequeno e apagado)
  - Check glow quando selecionado
  - Contador "X jornadas selecionadas" no rodape

- **Recomendacao inteligente:** `CHALLENGE_JOURNEY_MAP` mapeia desafios do usuario → jornadas recomendadas (linhas 14-25)

### CelebrationStep.tsx (137 linhas)
**Caminho:** `App/src/components/onboarding/steps/CelebrationStep.tsx`

- **Titulo (linhas 67-77):**
  ```tsx
  <h1 className="text-3xl font-bold mb-2">Parabéns!</h1>
  <p className="text-base text-muted-foreground">
    Sua rotina personalizada está pronta
  </p>
  ```
- **Stats mostrados (linhas 81-110):**
  - Total de habitos criados
  - Dias por semana selecionados
  - Indicador de progresso generico
- **Animacoes:** Check animado com glow gradient, auto-submit apos 1.5s + progress bar
- **XP award:** 50 XP por completar onboarding

### Dados Disponiveis no Contexto do Onboarding
Via `useOnboarding()`:
- `selectedJourneyIds` — IDs das jornadas escolhidas (max 2)
- `challenges` — desafios que o usuario relatou
- `objectives` — objetivos selecionados
- `selectedDays` — dias da semana
- `createdHabits` — habitos que serao criados

---

## Proposta

### Parte A: JourneySelectionStep — "Quem Voce Quer Ser"

#### A1. Header com Linguagem de Identidade
```tsx
// ANTES:
<h2>Escolha sua jornada</h2>
<p>Transformacoes guiadas de 30 dias — escolha ate 2</p>

// DEPOIS:
<h2 className="text-2xl font-bold mb-1">
  Quem você quer ser em 30 dias?
</h2>
<p className="text-sm text-muted-foreground font-serif italic">
  Escolha sua transformação. Sem volta.
</p>
```
**Principio:** Identity-Based Change. A pergunta "quem voce quer SER" ativa reflexao sobre identidade, nao sobre atividades.

#### A2. Promise Text Mais Proeminente
```tsx
// ANTES (linha 177-179):
<p className="text-xs text-muted-foreground line-clamp-2">
  {journey.promise}
</p>

// DEPOIS:
<p className="text-sm text-foreground/80 font-medium line-clamp-2">
  {journey.promise}
</p>
```
**Principio:** A promessa e o principal motivador. Precisa ser legivel e impactante.

#### A3. Prova Social por Jornada
Adicionar abaixo do promise text:
```tsx
<p className="text-[10px] text-muted-foreground/60 mt-1">
  {getJourneySocialProof(journey.slug)} ja completaram
</p>

// Helper function (hardcoded MVP, depois RPC real)
const SOCIAL_PROOF: Record<string, string> = {
  "digital-detox-l1": "2.8K+ caras",
  "own-mornings-l1": "3.1K+ caras",
  "gym-l1": "4.2K+ caras",
  "focus-protocol-l1": "1.9K+ caras",
  "finances-l1": "2.4K+ caras",
};
```
**Principio:** Social Proof / Bandwagon Effect. Saber que milhares completaram reduz medo e cria FOMO.

#### A4. Badge "Pra voce" com Glow Mais Forte
O badge `recommended` ja existe (linhas 183-193). Adicionar glow pulsante:
```tsx
// Adicionar ao className do badge:
className="... animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.3)]"
```

### Parte B: CelebrationStep — "Sua Transformacao Comeca Agora"

#### B1. Titulo de Transformacao
```tsx
// ANTES:
<h1>Parabéns!</h1>
<p>Sua rotina personalizada está pronta</p>

// DEPOIS:
<h1 className="text-3xl font-bold mb-2">
  Sua transformação começa agora
</h1>
<p className="text-base text-muted-foreground">
  30 dias para se tornar quem você quer ser
</p>
```
**Principio:** Peak-End Rule. Este e o ULTIMO momento antes do app. Precisa ser memoravel e emocional.

#### B2. Mostrar Jornadas Selecionadas como Contrato Visual
Apos as stats, adicionar um bloco mostrando as jornadas escolhidas:
```tsx
// Usar JourneyIllustration (ja existe em App/src/components/JourneyIllustration.tsx)
import { JourneyIllustration, getJourneyTheme } from "@/components/JourneyIllustration";

// No render, apos stats:
{selectedJourneys.length > 0 && (
  <div className="flex items-center justify-center gap-4 mt-4">
    {selectedJourneys.map((journey) => (
      <motion.div
        key={journey.id}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.5 }}
        className="flex flex-col items-center gap-1"
      >
        <JourneyIllustration themeSlug={journey.theme_slug} size="md" />
        <p className="text-xs font-medium text-foreground/80 text-center max-w-[100px]">
          {journey.title}
        </p>
      </motion.div>
    ))}
  </div>
)}
```
**Principio:** Commitment & Consistency. Mostrar visualmente o que o usuario escolheu cria compromisso psicologico. E como assinar um contrato.

#### B3. Buscar Dados das Jornadas
O `selectedJourneyIds` ja esta disponivel via `useOnboarding()`. Precisamos buscar os dados das jornadas para mostrar titulo e tema:
```tsx
const { selectedJourneyIds } = useOnboarding();
const { data: journeys } = useJourneys(); // hook ja existe em useJourney.ts
const selectedJourneys = journeys?.filter(j => selectedJourneyIds.includes(j.id)) ?? [];
```

#### B4. Som e Vibracao na Celebracao
```tsx
useEffect(() => {
  sounds.levelUp(); // som de level up — momento epico
  haptic.heavy();   // vibracao forte
}, []);
```

---

## Implementacao

### Arquivos a Modificar
1. `App/src/components/onboarding/steps/JourneySelectionStep.tsx` — header + promise size + prova social
2. `App/src/components/onboarding/steps/CelebrationStep.tsx` — titulo + jornadas visuais + som/haptic

### Imports Necessarios
```tsx
// CelebrationStep.tsx:
import { JourneyIllustration } from "@/components/JourneyIllustration";
import { useJourneys } from "@/hooks/useJourney";
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";
```

### Dependencias de Dados
- `useOnboarding().selectedJourneyIds` — ja existe
- `useJourneys()` — hook ja existe em useJourney.ts
- `JourneyIllustration` — componente ja existe
- `sounds` / `haptic` — libs ja existem

---

## Verificacao

1. **JourneySelectionStep:**
   - Header mostra "Quem voce quer ser em 30 dias?"
   - Promise text e legivel (text-sm, nao text-xs)
   - Prova social aparece abaixo de cada card
   - Badge "Pra voce" tem glow sutil
2. **CelebrationStep:**
   - Titulo mostra "Sua transformacao comeca agora"
   - Icones das jornadas selecionadas aparecem com animacao spring
   - Som de level-up toca ao montar
   - Vibracao forte no mobile
3. **Flow completo:**
   - Onboarding do inicio ao fim sem erros
   - Transicao suave entre passos
4. **Mobile 375px:**
   - Cards de jornada nao fazem overflow
   - Icones na CelebrationStep cabem em tela pequena
5. **Sem jornada selecionada:**
   - Se usuario pular selecao, CelebrationStep nao mostra bloco de jornadas

---

## Metricas de Sucesso
- **Conversao de selecao de jornada:** Esperado +20% (copy emocional + prova social)
- **Completude do onboarding:** Manter ou melhorar (CelebrationStep mais impactante)
- **Retencao D1:** Esperado +10% (compromisso emocional mais forte)
- **Sentimento qualitativo:** Usuarios devem relatar "senti que ia mudar de verdade"
