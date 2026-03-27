# 02 - Celebracoes Progressivas: Escalada Emocional por Marco

## Problema

Atualmente, completar o Dia 1 de uma jornada gera a **mesma celebracao** que completar o Dia 21. O modal `JourneyDayCompleteModal` mostra particulas flutuantes, a porcentagem de progresso e auto-dismiss em 6 segundos — independentemente de ser um dia comum ou um marco significativo. Isso desperidca os momentos de pico emocional (Peak-End Rule) e nao recompensa o esforco acumulado.

### O Que Falta vs Duolingo
Duolingo escala celebracoes dramaticamente: completar uma licao simples = check sutil; atingir streak de 7 dias = confetti + medalha + som; streak de 365 = animacao epica. O Bora precisa dessa escalada.

---

## Estado Atual

### Arquivo: `App/src/components/JourneyDayCompleteModal.tsx`
- **Auto-dismiss:** Timer de 6 segundos para TODOS os dias (linhas 59-64)
- **Excecao:** So nao auto-dismiss quando `journeyCompleted` ou `phaseCompleted` = true
- **Particulas:** 6 particulas flutuantes para todos os dias (linhas 79-101)
- **Som:** Nenhum som tocado diretamente no modal
- **Vibracao:** Nenhuma vibracao no modal
- **Conteudo:** Mostra dia atual/total, porcentagem, e nome da fase se `phaseCompleted`

### Arquivo: `App/src/lib/celebrations.ts` (408 linhas)
- **5 tipos de celebracao:** `habit-complete`, `level-up`, `streak-milestone`, `perfect-day`, `unlock`
- **Configs com intensidade variavel:** particulas (6-20), glow (20-40px), escala (1.04-1.08x)
- **Sistema de som integrado:** `sounds.complete()`, `sounds.levelUp()`, `sounds.streak()`, `sounds.dayComplete()`, `sounds.unlock()`
- **Sistema de haptics integrado:** `haptic.light()`, `haptic.medium()`, `haptic.heavy()`, `haptic.success()`, `haptic.double()`

### Arquivo: `App/src/lib/sounds.ts` (396 linhas)
- 5 sons disponiveis em `/App/public/sounds/`: complete.mp3, level-up.mp3, streak.mp3, day-complete.mp3, unlock.mp3
- Volumes individuais: complete(0.4), levelUp(0.6), streak(0.5), dayComplete(0.7), unlock(0.5)
- API: `sounds.complete()`, `sounds.levelUp()`, etc.

### Arquivo: `App/src/lib/haptics.ts` (120 linhas)
- 6 padroes: light(10ms), medium(25ms), heavy(50ms), success([10,50,10]ms), error([50,100,50]ms), double([15,30,15]ms)
- Respeita `prefers-reduced-motion` e preferences do usuario

---

## Proposta: Sistema de Marcos com Celebracao Escalada

### Marcos Identificados

| Dia | Marco | Significado | Intensidade |
|-----|-------|-------------|-------------|
| 1-6 | Dia comum | Construindo fundacao | Baixa (atual) |
| **7** | **1 Semana** | Primeiro marco psicologico | **Media** |
| **14** | **2 Semanas** | Zona de perigo superada (maioria desiste entre dia 10-14) | **Alta** |
| **21** | **3 Semanas** | Marco classico de formacao de habito | **Muito Alta** |
| **30** | **Graduacao** | Jornada completa | **Maxima** (ja existe JourneyGraduationModal) |
| Fase | **Transicao de Fase** | Nova etapa comeca | **Alta** (ja detectado via `phaseCompleted`) |

### Comportamento por Nivel de Intensidade

#### Baixa (Dias 1-6, padrao atual)
- Particulas: 6 flutuantes
- Som: `sounds.dayComplete()` (volume 0.7)
- Vibracao: `haptic.medium()` (25ms)
- Auto-dismiss: Sim, 6 segundos
- Visual: Progresso % + dia atual

#### Media (Dia 7 — 1 Semana)
- Particulas: **10** flutuantes com cores mais vibrantes
- Som: **`sounds.streak()`** (volume 0.5) — som de streak e mais celebratorio
- Vibracao: **`haptic.success()`** ([10ms, 50ms pause, 10ms])
- Auto-dismiss: **Nao** — usuario precisa clicar para fechar
- Visual: Badge **"1 SEMANA"** com glow do tema + mensagem motivacional
- Mensagem: "Primeira semana completa! Voce ja esta a frente de 80% das pessoas."

#### Alta (Dia 14 — 2 Semanas / Transicao de Fase)
- Particulas: **14** flutuantes
- Som: **`sounds.streak()`** (volume aumentado para 0.7)
- Vibracao: **`haptic.heavy()`** (50ms)
- Auto-dismiss: **Nao**
- Visual: Badge **"2 SEMANAS"** + subtitulo **"Zona de Perigo Superada"** + glow pulsante
- Mensagem: "A maioria desiste entre os dias 10-14. Voce nao desistiu."

#### Muito Alta (Dia 21 — 3 Semanas)
- Particulas: **20** flutuantes (maximo do sistema)
- Som: **`sounds.levelUp()`** (volume 0.6) — som de level up para marco maximo
- Vibracao: **`haptic.heavy()`** seguido de **`haptic.double()`** (sequencia)
- Auto-dismiss: **Nao**
- Visual: Badge **"3 SEMANAS — HABITO FORMADO"** + glow amplo + icone animado
- Mensagem: "21 dias. A ciencia diz que voce precisa de 66 para automatizar. Mas voce ja esta longe demais pra voltar."
- **Bonus:** Trigger `celebrations.streakMilestone()` do celebrations.ts para efeito extra

#### Maxima (Dia 30 — Graduacao)
- Ja implementado via `JourneyGraduationModal.tsx`
- Apenas garantir que som + vibracao tocam antes do redirect

---

## Implementacao Tecnica

### Mudancas em `JourneyDayCompleteModal.tsx`

#### 1. Definir marcos e configs (novo bloco no topo do componente)
```tsx
// Milestone detection and config
const MILESTONES: Record<number, {
  badge: string;
  subtitle: string;
  message: string;
  particleCount: number;
  soundFn: () => void;
  hapticFn: () => void;
}> = {
  7: {
    badge: "1 SEMANA",
    subtitle: "Primeira Semana Completa",
    message: "Voce ja esta a frente de 80% das pessoas.",
    particleCount: 10,
    soundFn: () => sounds.streak(),
    hapticFn: () => haptic.success(),
  },
  14: {
    badge: "2 SEMANAS",
    subtitle: "Zona de Perigo Superada",
    message: "A maioria desiste entre os dias 10-14. Voce nao desistiu.",
    particleCount: 14,
    soundFn: () => sounds.streak(),
    hapticFn: () => haptic.heavy(),
  },
  21: {
    badge: "3 SEMANAS",
    subtitle: "Habito Formado",
    message: "Voce ja esta longe demais pra voltar.",
    particleCount: 20,
    soundFn: () => sounds.levelUp(),
    hapticFn: () => { haptic.heavy(); setTimeout(() => haptic.double(), 200); },
  },
};

const milestone = MILESTONES[dayNumber];
const isMilestone = !!milestone;
```

#### 2. Alterar logica de auto-dismiss (linhas 59-64)
```tsx
// ANTES:
const shouldAutoDismiss = !journeyCompleted && !phaseCompleted;

// DEPOIS:
const shouldAutoDismiss = !journeyCompleted && !phaseCompleted && !isMilestone;
```

#### 3. Trigger som + vibracao no mount do modal
```tsx
useEffect(() => {
  if (milestone) {
    milestone.soundFn();
    milestone.hapticFn();
  } else if (!journeyCompleted && !phaseCompleted) {
    sounds.dayComplete();
    haptic.medium();
  }
}, [dayNumber]);
```

#### 4. Renderizar badge de marco (dentro do JSX, apos o progresso)
```tsx
{milestone && (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
    className="flex flex-col items-center gap-1 mt-3"
  >
    <div
      className="px-4 py-1.5 rounded-full text-sm font-bold"
      style={{
        backgroundColor: `${themeColor}20`,
        color: themeColor,
        boxShadow: `0 0 20px ${themeColor}30`,
      }}
    >
      {milestone.badge}
    </div>
    <p className="text-xs font-medium text-muted-foreground">
      {milestone.subtitle}
    </p>
    <p className="text-xs text-muted-foreground/70 text-center mt-1 max-w-[250px]">
      {milestone.message}
    </p>
  </motion.div>
)}
```

#### 5. Ajustar contagem de particulas
```tsx
// ANTES:
const particleCount = 6;

// DEPOIS:
const particleCount = milestone?.particleCount ?? (phaseCompleted ? 10 : 6);
```

### Mudancas em `celebrations.ts`

#### Adicionar tipo "journey-milestone" (opcional, para uso externo)
```tsx
// Linha 20-25, adicionar ao enum de tipos
export type CelebrationType =
  | "habit-complete"
  | "level-up"
  | "streak-milestone"
  | "perfect-day"
  | "unlock"
  | "journey-milestone"; // NOVO

// Linha 253-289, adicionar config default
"journey-milestone": {
  glow: { color: "theme", duration: 2000, size: 30 },
  scale: { size: 1.06, duration: 500 },
  particles: { count: 14, colors: ["theme"], duration: 2500 },
  sound: "streak",
  haptic: "heavy",
},
```

### Imports Necessarios
```tsx
// Em JourneyDayCompleteModal.tsx, adicionar:
import { sounds } from "@/lib/sounds";
import { haptic } from "@/lib/haptics";
```

---

## Verificacao

1. **Dia normal (1-6):** Modal aparece com 6 particulas, auto-dismiss em 6s, som dayComplete
2. **Dia 7:** Modal aparece com 10 particulas, badge "1 SEMANA", SEM auto-dismiss, som streak, vibracao success
3. **Dia 14:** 14 particulas, badge "2 SEMANAS — Zona de Perigo Superada", SEM auto-dismiss, vibracao heavy
4. **Dia 21:** 20 particulas, badge "3 SEMANAS — HABITO FORMADO", som levelUp, vibracao sequencial
5. **Dia 30:** Redireciona para JourneyGraduationModal (comportamento existente mantido)
6. **Fase completa:** Comportamento existente mantido + particulas aumentadas para 10
7. **Mobile:** Vibracoes perceptiveis no Android; iOS falha silenciosa (esperado)
8. **Preferencias:** Se som desabilitado, nao toca. Se haptic desabilitado, nao vibra.

---

## Metricas de Sucesso
- **Retencao dia 7→8:** Esperado +10% (marco cria compromisso de continuar)
- **Retencao dia 14→15:** Esperado +15% (validacao de "zona de perigo superada" motiva)
- **Completude de jornada (dia 30):** Esperado +20% (marcos intermediarios reduzem abandono)
- **NPS/sentimento:** Usuarios devem mencionar celebracoes como ponto positivo
