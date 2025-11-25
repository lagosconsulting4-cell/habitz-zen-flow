# Mapeamento Completo - Redesign Home Dashboard

**Data**: 2025-01-24
**Objetivo**: Transformar o Dashboard atual em um design minimalista circular inspirado na referência laranja

---

## 📸 Análise da Referência Visual

### Características Principais Identificadas:

1. **Layout & Estrutura**
   - Grid de 2 colunas
   - Cards circulares uniformes
   - Espaçamento consistente entre elementos
   - Barra de navegação inferior com 3 ícones

2. **Design dos Cards de Hábitos**
   - Círculos com borda grossa (stroke)
   - Ícone branco centralizado no círculo
   - Progresso circular ao redor (ring progress bar)
   - Nome do hábito abaixo do círculo
   - Indicadores sutis (streak, meta, tempo)
   - Estado completado: círculo preenchido com branco
   - Estado pendente: apenas borda circular

3. **Paleta de Cores**
   - Fundo: Laranja coral vibrante (#FF7B54 aproximadamente)
   - Círculos: Bordas marrom escuro (#5D4037)
   - Ícones: Branco puro (#FFFFFF)
   - Texto: Branco para títulos
   - Indicadores: Cores sutis (vermelho coração, números pequenos)

4. **Elementos de UI Específicos**
   - Progresso circular: Barra branca que cresce ao redor do círculo
   - Streak badge: Número pequeno no topo do círculo (ex: "18", "9")
   - Meta/tempo: Texto abaixo do nome (ex: "3:00")
   - Indicador de favorito: Ícone de coração vermelho
   - Botão "Add Task": Círculo com símbolo "+" branco

5. **Tipografia**
   - Fonte sans-serif bold
   - Texto em uppercase para os nomes
   - Tamanhos hierárquicos claros

---

## 🎯 Componentes Necessários

### 1. CircularHabitCard (NOVO - Componente Principal)

**Localização**: `App/src/components/CircularHabitCard.tsx` (já existe, precisa refatoração completa)

**Estrutura**:
```typescript
interface CircularHabitCardProps {
  habit: Habit;
  progress: number; // 0-100 para o ring progress
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  goalInfo?: string; // ex: "2.3 KM", "3:00"
  isFavorite?: boolean;
}
```

**Elementos Visuais**:
- Container principal: Flex column, centralizado
- SVG Circular Progress Ring
  - viewBox="0 0 120 120"
  - Círculo de fundo (stroke escuro, stroke-width: 8)
  - Círculo de progresso (stroke branco, stroke-width: 8)
  - strokeDasharray para animação do progresso
  - transform: rotate(-90deg) para começar do topo
- Círculo interno (quando completado)
  - Background branco com opacidade
  - Transição suave
- Ícone centralizado
  - Tamanho: 32x32px
  - Cor: sempre branco
  - Z-index acima do círculo
- Badge de Streak (topo do círculo)
  - Position: absolute, top: 0
  - Background: semi-transparente
  - Tamanho pequeno: 20x20px
  - Número centralizado
- Nome do hábito (abaixo)
  - Text-transform: uppercase
  - Font-weight: bold
  - Font-size: 12-14px
  - Color: branco
- Goal/Meta info (abaixo do nome)
  - Font-size: 10-11px
  - Color: branco com opacidade
  - Opcional

**Animações**:
- Hover: Scale 1.05
- Tap: Scale 0.95
- Completion: Ring progress fill + círculo interno aparece
- Pulsar sutil no streak badge

**Shadcn Components Utilizados**:
- `Progress` (adaptar para circular)
- Nenhum card/button tradicional - tudo custom

---

### 2. CircularProgressRing (Componente Auxiliar)

**Localização**: `App/src/components/ui/circular-progress.tsx` (CRIAR)

**Propósito**: Componente reutilizável para o ring de progresso

```typescript
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number; // default 120
  strokeWidth?: number; // default 8
  trackColor?: string; // cor da borda de fundo
  progressColor?: string; // cor da barra de progresso
  completed?: boolean; // se true, preenche o círculo interno
  children?: React.ReactNode; // ícone centralizado
}
```

**Implementação**:
- SVG com viewBox responsivo
- Cálculo de circumference: `2 * Math.PI * radius`
- strokeDasharray para progresso
- Animação com transition ou framer-motion
- Transform rotate para começar do topo

**Referência de Cálculo**:
```typescript
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const offset = circumference - (progress / 100) * circumference;
```

---

### 3. AddHabitCircle (Componente de Adição)

**Localização**: `App/src/components/AddHabitCircle.tsx` (CRIAR)

**Estrutura**:
- Mesmo tamanho dos CircularHabitCards
- Círculo com borda tracejada ou sólida
- Ícone "+" centralizado (grande, ~40px)
- Texto "ADD A TASK" abaixo
- Hover: Brightness aumenta
- Click: Navega para /create

---

### 4. Dashboard Refatorado

**Localização**: `App/src/pages/Dashboard.tsx` (REFATORAR COMPLETO)

**Mudanças Estruturais**:

#### Header (REMOVER ou SIMPLIFICAR)
- ❌ Remover saudação atual ("Bom dia, Habitz")
- ❌ Remover estatísticas complexas
- ✅ Manter apenas simples (opcional): Avatar pequeno no canto

#### Grid de Hábitos (REDESIGN COMPLETO)
```typescript
<div className="grid grid-cols-2 gap-6 px-4 py-8">
  {todayHabits.map((habit) => (
    <CircularHabitCard
      key={habit.id}
      habit={habit}
      progress={calculateProgress(habit)}
      completed={isCompletedToday(habit)}
      onToggle={() => toggleHabit(habit.id)}
      streakDays={habit.streak}
      goalInfo={formatGoalInfo(habit)}
      isFavorite={habit.is_favorite}
    />
  ))}
  <AddHabitCircle />
</div>
```

#### Cálculo de Progresso
- Se hábito tem meta numérica: `(currentValue / goalValue) * 100`
- Se hábito é binário: `completed ? 100 : 0`
- Se hábito tem múltiplos checks: `(checksToday / totalExpected) * 100`

#### Navegação (ATUALIZAR)
- Manter NavigationBar atual
- Atualizar ícones se necessário
- Garantir que combina com novo design

---

## 🎨 Sistema de Cores - Atualização

### Tema "Coral" (Novo tema para Dashboard)

Adicionar ao `App/src/index.css`:

```css
.theme-coral {
  --background: oklch(0.7350 0.1520 32.4610); /* #FF7B54 coral */
  --foreground: oklch(1 0 0); /* branco puro */
  --card: oklch(0.3850 0.0680 28.4520); /* #5D4037 marrom escuro */
  --card-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0); /* branco para progresso */
  --primary-foreground: oklch(0.7350 0.1520 32.4610); /* coral */
  --accent: oklch(0.5850 0.2140 22.3680); /* vermelho para coração */
  --muted: oklch(0.8500 0.1200 32.4610); /* coral claro */
  --muted-foreground: oklch(0.9500 0.0500 32.4610);
}
```

### Aplicação do Tema
- Dashboard deve adicionar classe `theme-coral` ao container principal
- Resto do app mantém tema padrão (light/dark)

---

## 📐 Layout & Espaçamento

### Grid Configuration
```css
.habits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem; /* 24px */
  padding: 2rem 1rem;
  max-width: 480px; /* para manter proporções em telas grandes */
  margin: 0 auto;
}
```

### Card Sizing
- Tamanho do círculo: 120px x 120px
- Stroke width: 8px
- Ícone: 32x32px
- Espaçamento interno: 16px

### Responsive Behavior
- Mobile (< 640px): 2 colunas, gap reduzido para 1rem
- Tablet: mantém 2 colunas
- Desktop: max-width 480px, centralizado

---

## 🎭 Ícones

### Sistema de Ícones Atual
**Manter**: `App/src/lib/habit-icons.tsx` e `App/src/components/icons/HabitIcons.tsx`

### Novos Ícones Necessários (lucide-react):
- ✅ `Cigarette` ou `Ban` para "Don't Smoke"
- ✅ `Dog` para "Walk the Dog"
- ✅ `Carrot` ou `Salad` para "Eat Healthy Meal"
- ✅ `Activity` ou `Footprints` para "Run 2.3 KM"
- ✅ `Brush` ou `Sparkles` para "Brush Your Teeth"
- ✅ `Plus` para "Add a Task"

### Renderização de Ícones
```typescript
const HabitIcon = ({ iconKey, size = 32 }: { iconKey: string, size?: number }) => {
  const Icon = getHabitIcon(iconKey);
  return Icon ? <Icon size={size} strokeWidth={2.5} /> : null;
};
```

---

## 🔄 Estados & Interações

### Estados do Card

#### 1. Pendente (Não Completado)
- Ring progress: Parcial ou 0%
- Círculo interno: Transparente
- Ícone: Branco
- Borda: Marrom escuro (#5D4037)

#### 2. Completado
- Ring progress: 100% preenchido
- Círculo interno: Branco preenchido (bg-white/80)
- Ícone: Branco (pode ter check sobreposto)
- Borda: Marrom escuro

#### 3. Hover
- Transform: scale(1.05)
- Transition: 200ms ease-out
- Cursor: pointer

#### 4. Press/Tap
- Transform: scale(0.95)
- Feedback tátil (se suportado)

### Animações de Transição

#### Ao Completar Hábito:
1. Ring progress anima de X% para 100% (300ms)
2. Círculo interno fade in com scale (200ms, delay 100ms)
3. Confete sutil ou pulse effect (opcional)
4. Streak badge atualiza com bounce animation

#### Ao Descompletar:
1. Círculo interno fade out (200ms)
2. Ring progress anima de 100% para 0% (300ms)

---

## 📊 Indicadores & Badges

### Streak Badge
**Posição**: Absolute, top: -8px, right: 8px (ou centralizado no topo)

**Design**:
- Background: bg-white/20 ou bg-card/60
- Border-radius: full
- Size: 24x24px
- Font-size: 11px
- Font-weight: bold
- Color: white
- Padding: 2px

**Exibição**:
- Mostrar apenas se streak > 0
- Número dentro do badge
- Animação pulse sutil

### Goal Info (Meta/Tempo)
**Posição**: Abaixo do nome do hábito

**Design**:
- Font-size: 10-11px
- Color: white/70
- Font-weight: medium
- Margin-top: 4px

**Conteúdo**:
- Se meta de distância: "2.3 KM"
- Se meta de tempo: "3:00" ou "10 min"
- Se meta de repetições: "0/10"
- Se meta de passos: "5,000 steps"

### Favorite Indicator
**Posição**: Absolute, top: -8px, left: 8px

**Design**:
- Ícone: Heart (lucide-react)
- Color: #EF4444 (vermelho)
- Size: 16x16px
- Background: white/80
- Border-radius: full
- Padding: 2px

---

## 🚀 Funcionalidades Mantidas

### Do Dashboard Atual (Manter)
✅ Lista de hábitos do dia atual filtrados
✅ Toggle de completado/não completado
✅ Cálculo de streak
✅ Navegação para criar novo hábito
✅ Navegação entre páginas (bottom nav)
✅ Pull to refresh (se implementado)

### Do Dashboard Atual (Remover)
❌ Saudação complexa com horário do dia
❌ Cards de estatísticas detalhadas
❌ Listagem em formato de lista
❌ Botões de ação complexos
❌ Filtros por período
❌ Gráficos de progresso na home

---

## 📝 Alterações por Arquivo

### 1. `App/src/pages/Dashboard.tsx`

**Mudanças**:
- Import CircularHabitCard, AddHabitCircle
- Import CircularProgressRing (se usado diretamente)
- Adicionar classe `theme-coral` ao container
- Substituir toda estrutura de layout atual por grid 2 colunas
- Remover Header complexo
- Remover seção de estatísticas
- Implementar lógica de cálculo de progresso
- Simplificar lógica de toggle
- Adicionar formatação de goalInfo

**Estrutura Nova**:
```tsx
const Dashboard = () => {
  const { habits, loading, toggleHabit } = useHabits();
  const todayHabits = useMemo(() => filterTodayHabits(habits), [habits]);

  const calculateProgress = (habit: Habit) => {
    // Lógica de cálculo
  };

  const formatGoalInfo = (habit: Habit) => {
    // Formatação de meta
  };

  return (
    <div className="min-h-screen theme-coral pb-20">
      {/* Header minimalista (opcional) */}

      {/* Grid de hábitos */}
      <div className="grid grid-cols-2 gap-6 px-4 py-8 max-w-md mx-auto">
        {todayHabits.map((habit) => (
          <CircularHabitCard
            key={habit.id}
            habit={habit}
            progress={calculateProgress(habit)}
            completed={isCompletedToday(habit)}
            onToggle={() => toggleHabit(habit.id)}
            streakDays={habit.streak}
            goalInfo={formatGoalInfo(habit)}
            isFavorite={habit.is_favorite}
          />
        ))}
        <AddHabitCircle />
      </div>

      <NavigationBar />
    </div>
  );
};
```

---

### 2. `App/src/components/CircularHabitCard.tsx` (REFATORAR)

**Mudanças Completas**:
- Redesign total do componente
- Adicionar SVG circular progress
- Implementar estados completed/pending
- Adicionar streak badge
- Adicionar goal info
- Adicionar favorite indicator
- Animações com framer-motion

**Estrutura Nova**:
```tsx
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { getHabitIcon } from "@/lib/habit-icons";
import { cn } from "@/lib/utils";

interface CircularHabitCardProps {
  habit: Habit;
  progress: number;
  completed: boolean;
  onToggle: () => void;
  streakDays?: number;
  goalInfo?: string;
  isFavorite?: boolean;
}

export const CircularHabitCard = ({
  habit,
  progress,
  completed,
  onToggle,
  streakDays,
  goalInfo,
  isFavorite
}: CircularHabitCardProps) => {
  const Icon = getHabitIcon(habit.icon_key);
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className="flex flex-col items-center gap-2 relative"
    >
      {/* Favorite indicator */}
      {isFavorite && (
        <div className="absolute -top-2 -left-2 bg-white/80 rounded-full p-1">
          <Heart size={14} fill="#EF4444" color="#EF4444" />
        </div>
      )}

      {/* Streak badge */}
      {streakDays && streakDays > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 right-2 bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-bold text-white"
        >
          {streakDays}
        </motion.div>
      )}

      {/* SVG Circular Progress */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-card"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-white transition-all duration-300"
            initial={false}
            animate={{ strokeDashoffset: offset }}
          />
        </svg>

        {/* Inner filled circle when completed */}
        <motion.div
          initial={false}
          animate={{
            opacity: completed ? 1 : 0,
            scale: completed ? 1 : 0.8
          }}
          className="absolute inset-0 m-2 bg-white/80 rounded-full"
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Icon && <Icon size={32} color="white" strokeWidth={2.5} />}
        </div>
      </div>

      {/* Habit name */}
      <div className="text-center">
        <p className="text-white font-bold text-xs uppercase tracking-wide">
          {habit.name}
        </p>
        {goalInfo && (
          <p className="text-white/70 text-[10px] font-medium mt-1">
            {goalInfo}
          </p>
        )}
      </div>
    </motion.button>
  );
};
```

---

### 3. `App/src/components/ui/circular-progress.tsx` (CRIAR)

**Propósito**: Componente reutilizável de progresso circular

```tsx
import { motion } from "framer-motion";

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export const CircularProgress = ({
  progress,
  size = 120,
  strokeWidth = 8,
  trackColor = "currentColor",
  progressColor = "white",
  className = "",
  children
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>

      {/* Children (icon, etc) */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
```

---

### 4. `App/src/components/AddHabitCircle.tsx` (CRIAR)

```tsx
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AddHabitCircle = () => {
  const navigate = useNavigate();
  const size = 120;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/create")}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="rounded-full border-4 border-card flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Plus size={48} color="white" strokeWidth={2.5} />
      </div>

      <p className="text-white font-bold text-xs uppercase tracking-wide">
        ADD A TASK
      </p>
    </motion.button>
  );
};
```

---

### 5. `App/src/index.css`

**Adicionar tema coral**:

```css
/* Tema Coral para Dashboard */
.theme-coral {
  --background: oklch(0.7350 0.1520 32.4610); /* #FF7B54 */
  --foreground: oklch(1 0 0);
  --card: oklch(0.3850 0.0680 28.4520); /* #5D4037 */
  --card-foreground: oklch(1 0 0);
  --primary: oklch(1 0 0);
  --primary-foreground: oklch(0.7350 0.1520 32.4610);
  --accent: oklch(0.5850 0.2140 22.3680); /* red heart */
  --muted: oklch(0.8500 0.1200 32.4610);
  --muted-foreground: oklch(0.9500 0.0500 32.4610);
}

/* Classes auxiliares para o design circular */
.habits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 2rem 1rem;
  max-width: 480px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .habits-grid {
    gap: 1rem;
    padding: 1.5rem 0.75rem;
  }
}
```

---

### 6. `App/src/lib/habit-icons.tsx` (ATUALIZAR)

**Adicionar novos ícones**:

```tsx
import {
  Heart,
  Activity,
  Dumbbell,
  Book,
  Target,
  Flame,
  Droplet,
  Apple,
  Bike,
  Run,
  Moon,
  Coffee,
  Brain,
  // Novos
  Cigarette,
  Ban,
  Dog,
  Carrot,
  Salad,
  Footprints,
  Brush,
  Sparkles,
  Plus
} from "lucide-react";

export const HABIT_ICONS = {
  // ... ícones existentes

  // Novos para referência
  cigarette: Cigarette,
  ban: Ban,
  dog: Dog,
  carrot: Carrot,
  salad: Salad,
  footprints: Footprints,
  brush: Brush,
  sparkles: Sparkles,
  plus: Plus,

  // Mapeamento de nomes descritivos
  'dont-smoke': Ban,
  'walk-dog': Dog,
  'healthy-meal': Carrot,
  'run': Footprints,
  'brush-teeth': Brush,
} as const;

export const getHabitIcon = (key?: string | null) => {
  if (!key) return Heart;
  return HABIT_ICONS[key as keyof typeof HABIT_ICONS] ?? Heart;
};
```

---

## 🧪 Lógica de Negócio

### Cálculo de Progresso

```typescript
const calculateProgress = (habit: Habit): number => {
  const today = new Date().toISOString().split('T')[0];

  // Verifica se foi completado hoje
  const completions = habit.completions?.filter(
    c => c.completed_at.startsWith(today)
  ) ?? [];

  if (completions.length === 0) return 0;

  // Se tem meta numérica
  if (habit.goal_value && habit.goal_value > 0) {
    const totalToday = completions.reduce((sum, c) => sum + (c.value ?? 0), 0);
    return Math.min((totalToday / habit.goal_value) * 100, 100);
  }

  // Se é binário (sim/não)
  if (completions.some(c => c.completed)) {
    return 100;
  }

  return 0;
};
```

### Formatação de Goal Info

```typescript
const formatGoalInfo = (habit: Habit): string | undefined => {
  if (!habit.goal_value) return undefined;

  switch (habit.unit) {
    case 'km':
      return `${habit.goal_value} KM`;
    case 'minutes':
      const hours = Math.floor(habit.goal_value / 60);
      const mins = habit.goal_value % 60;
      if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}`;
      return `${mins} min`;
    case 'steps':
      return `${habit.goal_value.toLocaleString()} steps`;
    case 'reps':
      return `${habit.goal_value} reps`;
    default:
      return `${habit.goal_value}`;
  }
};
```

### Verificação de Completado Hoje

```typescript
const isCompletedToday = (habit: Habit): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return habit.completions?.some(
    c => c.completed_at.startsWith(today) && c.completed
  ) ?? false;
};
```

---

## 🎬 Animações & Transições

### Animações com Framer Motion

**Instalação**:
```bash
npm install framer-motion
```

**Variantes de Animação**:

```typescript
// Para o card de hábito
const cardVariants = {
  idle: {
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Para o progresso circular
const progressVariants = {
  hidden: { strokeDashoffset: circumference },
  visible: (progress: number) => ({
    strokeDashoffset: circumference - (progress / 100) * circumference,
    transition: { duration: 0.3, ease: "easeOut" }
  })
};

// Para o círculo interno (completado)
const innerCircleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, delay: 0.1 }
  }
};

// Para o streak badge
const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};
```

---

## 📱 Comportamento Responsivo

### Breakpoints

```css
/* Mobile First */
.habits-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem 0.75rem;
}

/* Small screens (< 375px) */
@media (max-width: 374px) {
  .habits-grid {
    gap: 0.75rem;
    padding: 1rem 0.5rem;
  }

  /* Reduzir tamanho dos círculos */
  .circular-habit-card {
    --circle-size: 100px;
  }
}

/* Medium screens (>= 640px) */
@media (min-width: 640px) {
  .habits-grid {
    gap: 1.5rem;
    padding: 2rem 1rem;
    max-width: 480px;
  }
}

/* Large screens (>= 1024px) */
@media (min-width: 1024px) {
  .habits-grid {
    max-width: 500px;
    margin: 0 auto;
  }
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Setup & Componentes Base
- [ ] Criar `CircularProgress` component
- [ ] Criar `AddHabitCircle` component
- [ ] Adicionar tema coral ao CSS
- [ ] Atualizar `habit-icons.tsx` com novos ícones
- [ ] Instalar/verificar framer-motion

### Fase 2: Refatorar CircularHabitCard
- [ ] Redesign completo do componente
- [ ] Implementar SVG circular progress
- [ ] Adicionar estados de completed/pending
- [ ] Adicionar streak badge
- [ ] Adicionar goal info display
- [ ] Adicionar favorite indicator
- [ ] Implementar animações

### Fase 3: Refatorar Dashboard
- [ ] Aplicar tema coral
- [ ] Remover header/saudação complexa
- [ ] Remover seção de estatísticas
- [ ] Implementar novo grid layout
- [ ] Adicionar CircularHabitCard ao grid
- [ ] Implementar lógica de cálculo de progresso
- [ ] Implementar formatação de goalInfo
- [ ] Adicionar AddHabitCircle ao final do grid

### Fase 4: Lógica & Integrações
- [ ] Implementar `calculateProgress` function
- [ ] Implementar `formatGoalInfo` function
- [ ] Implementar `isCompletedToday` function
- [ ] Garantir toggle de hábito funciona
- [ ] Garantir navegação para /create funciona

### Fase 5: Testes & Refinamento
- [ ] Testar em diferentes tamanhos de tela
- [ ] Testar estados de loading
- [ ] Testar animações
- [ ] Testar com 0 hábitos
- [ ] Testar com muitos hábitos
- [ ] Ajustar espaçamentos
- [ ] Ajustar cores/contrastes
- [ ] Performance: otimizar re-renders

### Fase 6: Polimento Final
- [ ] Adicionar feedback tátil (vibração)
- [ ] Adicionar sons (opcional)
- [ ] Adicionar pull-to-refresh
- [ ] Garantir acessibilidade (ARIA labels)
- [ ] Documentar componentes
- [ ] Code review
- [ ] Deploy e testes em produção

---

## 🎯 Métricas de Sucesso

### Visual
- ✅ Design idêntico ou superior à referência
- ✅ Animações suaves (60fps)
- ✅ Tema de cores consistente
- ✅ Responsividade perfeita

### Funcional
- ✅ Toggle de hábitos funciona instantaneamente
- ✅ Progresso calcula corretamente
- ✅ Streak atualiza em tempo real
- ✅ Navegação sem bugs

### Performance
- ✅ First paint < 1s
- ✅ Interação responsiva < 100ms
- ✅ Animações sem jank
- ✅ Bundle size otimizado

---

## 🚨 Pontos de Atenção

### 1. Performance
- Evitar re-renders desnecessários
- Usar `useMemo` para cálculos pesados
- Otimizar SVG rendering
- Lazy load se necessário

### 2. Acessibilidade
- Adicionar `aria-label` nos botões
- Garantir contraste adequado
- Suporte a teclado
- Screen reader friendly

### 3. Estados de Erro
- Loading state durante fetch
- Empty state quando sem hábitos
- Error state se falha ao carregar
- Retry mechanism

### 4. Compatibilidade
- Testar em Safari (iOS)
- Testar em Chrome (Android)
- Garantir SVG funciona em todos navegadores
- Polyfills se necessário

---

## 📚 Referências Técnicas

### Bibliotecas Necessárias
- `framer-motion`: Animações
- `lucide-react`: Ícones (já instalado)
- `tailwindcss`: Estilos (já instalado)
- React 18+ (já instalado)

### Shadcn Components (Referência)
- Não usar Card tradicional
- Não usar Button tradicional
- Usar apenas primitivos (motion, SVG)

### Recursos Adicionais
- MDN: SVG Circle & Stroke
- Framer Motion Docs: Variants
- Tailwind: Custom Properties
- React: Performance Optimization

---

## 🎨 Palette de Cores Exata (HEX)

```
Coral Background: #FF7B54
Dark Brown Border: #5D4037
White Primary: #FFFFFF
White 80%: #FFFFFFCC
White 70%: #FFFFFFB3
White 20%: #FFFFFF33
Red Heart: #EF4444
```

---

## 📦 Estrutura de Arquivos Final

```
App/src/
├── components/
│   ├── CircularHabitCard.tsx         [REFATORADO]
│   ├── AddHabitCircle.tsx            [NOVO]
│   ├── ui/
│   │   └── circular-progress.tsx     [NOVO]
│   └── icons/
│       └── HabitIcons.tsx            [ATUALIZAR]
├── pages/
│   └── Dashboard.tsx                  [REFATORADO]
├── lib/
│   └── habit-icons.tsx                [ATUALIZAR]
├── hooks/
│   └── useHabits.tsx                  [MANTER]
├── index.css                          [ATUALIZAR]
└── App.tsx                            [MANTER]
```

---

## 🎬 Próximos Passos

1. **Revisão deste documento** com o time
2. **Aprovação do design** antes de começar
3. **Criar branch** `feature/circular-dashboard`
4. **Implementar Fase 1** (componentes base)
5. **Review incremental** a cada fase
6. **Testes** em diferentes dispositivos
7. **Deploy** para staging
8. **Feedback** dos usuários beta
9. **Ajustes finais**
10. **Deploy** para produção

---

**Documento criado em**: 2025-01-24
**Versão**: 1.0
**Status**: Pronto para implementação
