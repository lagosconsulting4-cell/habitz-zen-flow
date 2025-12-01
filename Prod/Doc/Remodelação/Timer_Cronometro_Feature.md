# Feature: Cronômetro com Visualização Gamificada

## Visão Geral

Implementar um sistema de cronômetro para hábitos baseados em tempo (minutos/horas), substituindo o simples toggle por uma experiência imersiva e gamificada que aumenta o engajamento e valor percebido.

---

## Problema Atual

Quando o usuário clica em um hábito que tem meta de tempo (ex: "Meditar 10 min"), o comportamento atual é:
- Toggle simples (marca como completo)
- Não há verificação do tempo real
- Experiência idêntica a hábitos binários
- Perda de oportunidade de engajamento

---

## Solução Proposta

### Fluxo Principal

```
[Dashboard] → Clique no hábito com tempo
                    ↓
           [Timer Modal abre]
                    ↓
    [Visualização + Cronômetro + Controles]
                    ↓
         [Conclusão com celebração]
                    ↓
       [Retorno ao Dashboard atualizado]
```

---

## Identificação de Hábitos com Tempo

### Critério de Ativação
O Timer Modal deve abrir quando:
1. `habit.unit === "minutes"` OU `habit.unit === "hours"`
2. `habit.goal_value > 0`

### Hábitos Elegíveis (baseado em habit-goal-configs.ts)

| Categoria | Hábito ID | Unidade | Meta Padrão |
|-----------|-----------|---------|-------------|
| Produtividade | `plan_day` | minutes | 10 min |
| Produtividade | `review_goals` | minutes | 15 min |
| Produtividade | `journaling` | minutes | 10 min |
| Leitura | `read_books` | minutes/pages | 30 min |
| Saúde Mental | `meditate` | minutes | 10 min |
| Estudo | `study` | hours/minutes | 2h |
| Organização | `declutter` | minutes | 15 min |
| Exercício | `walk_run` | minutes | 30 min |
| Exercício | `workout` | minutes | 45 min |
| Exercício | `stretch` | minutes | 10 min |
| Exercício | `yoga` | minutes | 30 min |
| Exercício | `strength_training` | minutes | 45 min |
| Foco | `deep_work` | hours | 2h |
| Foco | `focus_session` | minutes | 25 min (Pomodoro) |
| Social | `family_time` | hours/minutes | 1h |
| Social | `leisure_activity` | minutes | 30 min |
| Digital | `limit_social_media` | minutes | 30 min |

---

## Design da Interface

### Timer Modal - Estrutura

```
┌─────────────────────────────────────────┐
│  ╳                    [Nome do Hábito]  │  ← Header
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐            │
│         │                 │            │
│         │   🌱 → 🌳       │            │  ← Visualização Animada
│         │   (Árvore)      │            │
│         │                 │            │
│         └─────────────────┘            │
│                                         │
│              12:34                      │  ← Tempo Restante
│            ═══════════                  │  ← Barra de Progresso
│                                         │
│    ┌──────┐  ┌──────┐  ┌──────┐       │
│    │ ⏸️   │  │ ▶️   │  │ ✓    │       │  ← Controles
│    │Pausa │  │Play  │  │Pular │       │
│    └──────┘  └──────┘  └──────┘       │
│                                         │
│         "Frase motivacional..."         │  ← Mensagem Contextual
│                                         │
└─────────────────────────────────────────┘
```

### Visualização Gamificada: Árvore da Vida

#### Conceito
Uma árvore que cresce conforme o tempo passa, representando o crescimento pessoal do usuário.

#### Estágios da Árvore (5 fases)

```
0%        25%       50%       75%       100%
 .         🌱        🌿        🌲        🌳
Semente  Broto    Planta    Árvore   Árvore
                  Jovem     Média    Completa
```

#### Detalhes Visuais por Estágio

1. **0-20% - Semente**
   - Solo com uma pequena semente
   - Cores: marrom terra, verde escuro sutil
   - Animação: pulso suave

2. **20-40% - Broto**
   - Pequeno broto saindo da terra
   - 2 folhas pequenas
   - Animação: balançando levemente

3. **40-60% - Planta Jovem**
   - Caule mais alto
   - 4-6 folhas
   - Pequenas flores começando
   - Animação: crescimento vertical

4. **60-80% - Árvore Média**
   - Tronco visível
   - Copa formada
   - Cores mais vibrantes
   - Animação: folhas balançando

5. **80-100% - Árvore Completa**
   - Árvore frondosa
   - Frutas/flores
   - Pássaros/borboletas ao redor
   - Animação: celebração com partículas

#### Paleta de Cores (Dark Mode)
```css
--tree-soil: #3D2914;
--tree-trunk: #5D4037;
--tree-leaves-start: #4CAF50;
--tree-leaves-end: #81C784;
--tree-flowers: #FF7043;
--tree-fruits: #FFC107;
--tree-glow: rgba(163, 230, 53, 0.3);
```

#### Paleta de Cores (Light Mode)
```css
--tree-soil: #5D4037;
--tree-trunk: #4E342E;
--tree-leaves-start: #66BB6A;
--tree-leaves-end: #A5D6A7;
--tree-flowers: #FF8A65;
--tree-fruits: #FFD54F;
--tree-glow: rgba(101, 163, 13, 0.3);
```

---

## Componentes React

### Estrutura de Arquivos

```
App/src/
├── components/
│   └── timer/
│       ├── TimerModal.tsx          # Modal principal
│       ├── TimerDisplay.tsx        # Display do cronômetro
│       ├── TimerControls.tsx       # Botões de controle
│       ├── TreeVisualization.tsx   # Árvore animada
│       ├── TimerProgressBar.tsx    # Barra de progresso
│       └── TimerCompletion.tsx     # Tela de conclusão
├── hooks/
│   └── useTimer.ts                 # Hook de lógica do timer
└── utils/
    └── timer-utils.ts              # Funções auxiliares
```

### TimerModal.tsx - Props Interface

```typescript
interface TimerModalProps {
  /** Hábito sendo executado */
  habit: Habit;

  /** Tempo alvo em segundos */
  targetTime: number;

  /** Se o modal está aberto */
  isOpen: boolean;

  /** Callback ao fechar */
  onClose: () => void;

  /** Callback ao completar */
  onComplete: (actualTime: number) => void;

  /** Callback ao pular */
  onSkip: () => void;

  /** Tema atual */
  isDarkMode?: boolean;
}
```

### useTimer.ts - Hook Interface

```typescript
interface UseTimerReturn {
  /** Tempo atual em segundos */
  currentTime: number;

  /** Se está rodando */
  isRunning: boolean;

  /** Progresso (0-100) */
  progress: number;

  /** Estágio da árvore (1-5) */
  treeStage: 1 | 2 | 3 | 4 | 5;

  /** Iniciar timer */
  start: () => void;

  /** Pausar timer */
  pause: () => void;

  /** Resetar timer */
  reset: () => void;

  /** Se completou */
  isCompleted: boolean;
}
```

---

## Estados do Timer

### State Machine

```
┌─────────────┐    start()    ┌─────────────┐
│   IDLE      │──────────────▶│   RUNNING   │
│  (inicial)  │               │             │
└─────────────┘               └──────┬──────┘
       ▲                             │
       │ reset()              pause()│
       │                             ▼
       │                      ┌─────────────┐
       │                      │   PAUSED    │
       └──────────────────────│             │
                              └─────────────┘
                                     │
                              complete│
                                     ▼
                              ┌─────────────┐
                              │  COMPLETED  │
                              │             │
                              └─────────────┘
```

### Estados

```typescript
type TimerState =
  | "idle"       // Não iniciado
  | "running"    // Em execução
  | "paused"     // Pausado
  | "completed"; // Finalizado
```

---

## Frases Motivacionais

### Por Categoria de Hábito

```typescript
const MOTIVATIONAL_QUOTES = {
  meditate: [
    "Cada respiração é um novo começo",
    "A paz está dentro de você",
    "Silêncio é onde a sabedoria nasce",
  ],
  study: [
    "Conhecimento é poder",
    "Cada minuto de estudo é um investimento",
    "Você está construindo seu futuro",
  ],
  exercise: [
    "Seu corpo é seu templo",
    "Força não vem do corpo, vem da vontade",
    "Cada gota de suor conta",
  ],
  productivity: [
    "Foco é a chave do sucesso",
    "Pequenos passos, grandes conquistas",
    "Disciplina liberta",
  ],
  default: [
    "Você está no caminho certo",
    "Consistência supera intensidade",
    "Cada segundo conta",
  ],
};
```

---

## Integração com Dashboard

### Modificação no CircularHabitCard

```typescript
// CircularHabitCard.tsx
const handleToggle = () => {
  // Verificar se é hábito com tempo
  const isTimedHabit = habit.unit === "minutes" || habit.unit === "hours";
  const hasGoal = habit.goal_value && habit.goal_value > 0;

  if (isTimedHabit && hasGoal && !completed) {
    // Abrir Timer Modal
    onOpenTimer(habit);
  } else {
    // Toggle normal
    onToggle();
  }
};
```

### Modificação no Dashboard

```typescript
// Dashboard.tsx
const [timerModalOpen, setTimerModalOpen] = useState(false);
const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

const handleOpenTimer = (habit: Habit) => {
  setTimerHabit(habit);
  setTimerModalOpen(true);
};

const handleTimerComplete = async (actualTime: number) => {
  if (timerHabit) {
    // Registrar conclusão com tempo real
    await toggleHabit(timerHabit.id, {
      actual_duration: actualTime,
      completed_via: "timer",
    });
    setTimerModalOpen(false);
    setTimerHabit(null);
    // Celebração
    confetti();
  }
};
```

---

## Animações

### Transições CSS

```css
/* Entrada do Modal */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Crescimento da Árvore */
@keyframes tree-grow {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
  }
}

/* Balanço das Folhas */
@keyframes leaves-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

/* Celebração de Conclusão */
@keyframes celebration {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Framer Motion Variants

```typescript
const treeVariants = {
  seed: { scale: 0.3, opacity: 0.5 },
  sprout: { scale: 0.5, opacity: 0.7 },
  plant: { scale: 0.7, opacity: 0.85 },
  tree: { scale: 0.9, opacity: 0.95 },
  full: { scale: 1, opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};
```

---

## Persistência de Dados

### Campos Adicionais na Tabela habit_completions

```sql
-- Adicionar colunas para tracking de tempo
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS
  actual_duration_seconds INTEGER DEFAULT NULL;

ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS
  completed_via TEXT DEFAULT 'toggle'
  CHECK (completed_via IN ('toggle', 'timer', 'auto'));

ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS
  timer_pauses INTEGER DEFAULT 0;
```

### Estrutura de Completion

```typescript
interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  progress: number;
  // Novos campos
  actual_duration_seconds?: number;
  completed_via: "toggle" | "timer" | "auto";
  timer_pauses?: number;
}
```

---

## Tela de Conclusão

### Design

```
┌─────────────────────────────────────────┐
│                                         │
│              🎉 🌳 🎉                   │
│                                         │
│          PARABÉNS!                      │
│                                         │
│    Você completou 10 minutos de         │
│           Meditação                     │
│                                         │
│    ┌─────────────────────────────┐     │
│    │  ⏱️ Tempo: 10:23            │     │
│    │  🔥 Sequência: 7 dias       │     │
│    │  🌱 Árvore: Nível 3         │     │
│    └─────────────────────────────┘     │
│                                         │
│    ┌─────────────────────────────┐     │
│    │      CONTINUAR              │     │
│    └─────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Confetti Animation

Usar biblioteca `canvas-confetti` para celebração:

```typescript
import confetti from 'canvas-confetti';

const celebrateCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#A3E635', '#84CC16', '#65A30D'],
  });
};
```

---

## Acessibilidade

### Requisitos

1. **Anúncios de Screen Reader**
   - Anunciar tempo restante a cada minuto
   - Anunciar mudanças de estado
   - Anunciar conclusão

2. **Controles de Teclado**
   - `Space`: Play/Pause
   - `Escape`: Fechar modal
   - `Enter`: Completar (quando disponível)

3. **Preferências de Movimento**
   - Respeitar `prefers-reduced-motion`
   - Reduzir/remover animações se necessário

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const animationProps = prefersReducedMotion
  ? { transition: { duration: 0 } }
  : { transition: { type: "spring", damping: 25 } };
```

---

## Funcionalidades Extras (Fase 2)

### 1. Sons Ambientes (Opcional)
- Sons de natureza durante meditação
- Música lo-fi para estudo
- Silêncio para foco profundo

### 2. Histórico de Sessões
- Ver todas as sessões de timer
- Estatísticas de tempo total por hábito
- Gráficos de consistência

### 3. Modos Especiais
- **Pomodoro Mode**: 25min trabalho + 5min pausa
- **Deep Work Mode**: Sem pausas permitidas
- **Flexible Mode**: Sem tempo mínimo

### 4. Gamificação Expandida
- Coleção de árvores (diferentes espécies)
- Floresta pessoal (todas as árvores cultivadas)
- Achievements ("Primeiro 1 hora", "Sequência de 7 dias")

---

## Checklist de Implementação

### Fase 1 - MVP
- [ ] Criar estrutura de componentes
- [ ] Implementar useTimer hook
- [ ] Criar TimerModal básico
- [ ] Criar TimerDisplay com countdown
- [ ] Criar TimerControls (play/pause/skip)
- [ ] Criar TreeVisualization com 5 estágios
- [ ] Integrar com CircularHabitCard
- [ ] Integrar com Dashboard
- [ ] Adicionar animações básicas
- [ ] Tela de conclusão com confetti
- [ ] Testar em dark/light mode
- [ ] Testes de acessibilidade

### Fase 2 - Melhorias
- [ ] Sons ambientes
- [ ] Histórico de sessões
- [ ] Modos especiais (Pomodoro)
- [ ] Coleção de árvores
- [ ] Achievements
- [ ] Migração de banco de dados

---

## Estimativa de Complexidade

| Componente | Complexidade | Estimativa |
|------------|--------------|------------|
| useTimer hook | Média | 2-3h |
| TimerModal | Alta | 4-5h |
| TreeVisualization | Alta | 5-6h |
| TimerControls | Baixa | 1-2h |
| TimerCompletion | Média | 2-3h |
| Integração Dashboard | Média | 2-3h |
| Animações | Alta | 4-5h |
| Testes | Média | 3-4h |
| **Total MVP** | - | **25-30h** |

---

## Referências de Design

### Inspirações
- **Forest App**: Gamificação com árvores
- **Calm App**: Interface minimalista de timer
- **Headspace**: Animações suaves e acolhedoras
- **Focus@Will**: Timer com progresso visual

### Bibliotecas Recomendadas
- `framer-motion`: Animações
- `canvas-confetti`: Celebração
- `lottie-react`: Animações vetoriais complexas (opcional)
- `react-circular-progressbar`: Progresso circular

---

## Notas Finais

### Por que uma Árvore?
1. **Metáfora poderosa**: Crescimento pessoal = crescimento natural
2. **Visual calmante**: Reduz ansiedade durante hábitos como meditação
3. **Senso de progresso**: Feedback visual constante
4. **Memorável**: Diferencia o app da concorrência
5. **Extensível**: Pode evoluir para floresta/coleção

### Alternativas Consideradas
- Círculo preenchendo (muito comum)
- Montanha sendo escalada (complexo demais)
- Água enchendo copo (limitado visualmente)
- Fogo queimando (não transmite calma)

A árvore foi escolhida por equilibrar simplicidade técnica com impacto emocional.

---

*Documento criado em: 25/11/2024*
*Última atualização: 25/11/2024*
*Autor: Claude Code Assistant*
