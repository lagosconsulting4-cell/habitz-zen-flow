# Timer Feature - Implementação SVG da Árvore

## SVG Base da Árvore

### Estrutura do Componente

```tsx
// TreeVisualization.tsx

import { motion } from "framer-motion";
import { useMemo } from "react";

interface TreeVisualizationProps {
  /** Progresso de 0 a 100 */
  progress: number;
  /** Estágio atual (1-5) */
  stage: 1 | 2 | 3 | 4 | 5;
  /** Tema */
  isDarkMode?: boolean;
  /** Tamanho do container */
  size?: number;
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  progress,
  stage,
  isDarkMode = true,
  size = 200,
}) => {
  // Cores baseadas no tema
  const colors = useMemo(() => ({
    soil: isDarkMode ? "#3D2914" : "#5D4037",
    soilDark: isDarkMode ? "#2A1E0F" : "#3E2723",
    trunk: isDarkMode ? "#5D4037" : "#4E342E",
    trunkDark: isDarkMode ? "#4E342E" : "#3E2723",
    leavesLight: isDarkMode ? "#81C784" : "#A5D6A7",
    leavesDark: isDarkMode ? "#4CAF50" : "#66BB6A",
    flower: isDarkMode ? "#FF7043" : "#FF8A65",
    fruit: isDarkMode ? "#FFC107" : "#FFD54F",
    glow: isDarkMode ? "rgba(163, 230, 53, 0.3)" : "rgba(101, 163, 13, 0.3)",
  }), [isDarkMode]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: colors.glow }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* SVG Container */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative z-10"
      >
        {/* Render tree based on stage */}
        {stage === 1 && <SeedStage colors={colors} />}
        {stage === 2 && <SproutStage colors={colors} />}
        {stage === 3 && <PlantStage colors={colors} />}
        {stage === 4 && <TreeStage colors={colors} />}
        {stage === 5 && <FullTreeStage colors={colors} progress={progress} />}
      </svg>
    </div>
  );
};
```

---

## SVGs por Estágio

### Estágio 1: Semente (0-20%)

```tsx
const SeedStage: React.FC<{ colors: TreeColors }> = ({ colors }) => (
  <g>
    {/* Solo */}
    <ellipse
      cx="50"
      cy="85"
      rx="35"
      ry="8"
      fill={colors.soil}
    />

    {/* Textura do solo */}
    <ellipse
      cx="50"
      cy="85"
      rx="30"
      ry="5"
      fill={colors.soilDark}
      opacity="0.5"
    />

    {/* Semente */}
    <motion.ellipse
      cx="50"
      cy="78"
      rx="4"
      ry="3"
      fill={colors.trunk}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Pequena rachadura na semente (vida emergindo) */}
    <motion.path
      d="M 48 78 Q 50 76 52 78"
      stroke={colors.leavesLight}
      strokeWidth="0.5"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 1, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
  </g>
);
```

### Estágio 2: Broto (20-40%)

```tsx
const SproutStage: React.FC<{ colors: TreeColors }> = ({ colors }) => (
  <g>
    {/* Solo */}
    <ellipse cx="50" cy="85" rx="35" ry="8" fill={colors.soil} />
    <ellipse cx="50" cy="85" rx="30" ry="5" fill={colors.soilDark} opacity="0.5" />

    {/* Caule */}
    <motion.path
      d="M 50 82 L 50 70"
      stroke={colors.leavesLight}
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5 }}
    />

    {/* Folha esquerda */}
    <motion.path
      d="M 50 72 Q 42 68 44 75 Q 46 72 50 72"
      fill={colors.leavesLight}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
    />

    {/* Folha direita */}
    <motion.path
      d="M 50 72 Q 58 68 56 75 Q 54 72 50 72"
      fill={colors.leavesDark}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4 }}
    />

    {/* Animação de balanço */}
    <motion.g
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity }}
      style={{ transformOrigin: "50px 82px" }}
    >
      {/* Repetir folhas aqui para animação */}
    </motion.g>
  </g>
);
```

### Estágio 3: Planta Jovem (40-60%)

```tsx
const PlantStage: React.FC<{ colors: TreeColors }> = ({ colors }) => (
  <g>
    {/* Solo */}
    <ellipse cx="50" cy="85" rx="35" ry="8" fill={colors.soil} />

    {/* Caule principal */}
    <path
      d="M 50 82 L 50 55"
      stroke={colors.trunk}
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Ramos */}
    <path d="M 50 65 Q 40 60 38 65" stroke={colors.trunk} strokeWidth="2" fill="none" />
    <path d="M 50 65 Q 60 60 62 65" stroke={colors.trunk} strokeWidth="2" fill="none" />
    <path d="M 50 58 Q 42 53 40 58" stroke={colors.trunk} strokeWidth="1.5" fill="none" />
    <path d="M 50 58 Q 58 53 60 58" stroke={colors.trunk} strokeWidth="1.5" fill="none" />

    {/* Folhas (várias) */}
    <motion.g animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 4, repeat: Infinity }}>
      {/* Folha 1 */}
      <ellipse cx="36" cy="63" rx="6" ry="4" fill={colors.leavesLight} transform="rotate(-30 36 63)" />
      {/* Folha 2 */}
      <ellipse cx="64" cy="63" rx="6" ry="4" fill={colors.leavesDark} transform="rotate(30 64 63)" />
      {/* Folha 3 */}
      <ellipse cx="38" cy="56" rx="5" ry="3" fill={colors.leavesDark} transform="rotate(-20 38 56)" />
      {/* Folha 4 */}
      <ellipse cx="62" cy="56" rx="5" ry="3" fill={colors.leavesLight} transform="rotate(20 62 56)" />
      {/* Folha topo */}
      <ellipse cx="50" cy="50" rx="5" ry="4" fill={colors.leavesLight} />
    </motion.g>

    {/* Pequenas flores começando */}
    <motion.circle
      cx="50"
      cy="48"
      r="2"
      fill={colors.flower}
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </g>
);
```

### Estágio 4: Árvore Média (60-80%)

```tsx
const TreeStage: React.FC<{ colors: TreeColors }> = ({ colors }) => (
  <g>
    {/* Solo com grama */}
    <ellipse cx="50" cy="88" rx="40" ry="10" fill={colors.soil} />
    <path d="M 25 88 Q 27 82 29 88" stroke={colors.leavesLight} strokeWidth="1" fill="none" />
    <path d="M 70 88 Q 72 82 74 88" stroke={colors.leavesLight} strokeWidth="1" fill="none" />

    {/* Tronco */}
    <path
      d="M 46 88 L 48 60 L 50 45 L 52 60 L 54 88 Z"
      fill={colors.trunk}
    />

    {/* Textura do tronco */}
    <path d="M 49 70 L 51 70" stroke={colors.trunkDark} strokeWidth="0.5" />
    <path d="M 48 75 L 52 75" stroke={colors.trunkDark} strokeWidth="0.5" />

    {/* Copa da árvore */}
    <motion.g
      animate={{ rotate: [-1, 1, -1] }}
      transition={{ duration: 5, repeat: Infinity }}
      style={{ transformOrigin: "50px 50px" }}
    >
      {/* Copa principal */}
      <ellipse cx="50" cy="38" rx="25" ry="20" fill={colors.leavesLight} />
      <ellipse cx="42" cy="35" rx="15" ry="12" fill={colors.leavesDark} />
      <ellipse cx="58" cy="35" rx="15" ry="12" fill={colors.leavesDark} />
      <ellipse cx="50" cy="28" rx="12" ry="10" fill={colors.leavesLight} />

      {/* Detalhes da copa */}
      <circle cx="35" cy="40" r="8" fill={colors.leavesDark} opacity="0.7" />
      <circle cx="65" cy="40" r="8" fill={colors.leavesDark} opacity="0.7" />
    </motion.g>

    {/* Flores */}
    <circle cx="40" cy="30" r="2.5" fill={colors.flower} />
    <circle cx="60" cy="32" r="2.5" fill={colors.flower} />
    <circle cx="50" cy="25" r="2" fill={colors.flower} />
  </g>
);
```

### Estágio 5: Árvore Completa (80-100%)

```tsx
const FullTreeStage: React.FC<{ colors: TreeColors; progress: number }> = ({
  colors,
  progress
}) => {
  // Determinar se mostra frutas (progresso > 90%)
  const showFruits = progress >= 90;
  // Determinar se mostra pássaros (progresso === 100%)
  const showBirds = progress === 100;

  return (
    <g>
      {/* Solo rico */}
      <ellipse cx="50" cy="90" rx="45" ry="10" fill={colors.soil} />

      {/* Pequenas plantas ao redor */}
      <g opacity="0.8">
        <path d="M 20 90 Q 22 84 24 90" stroke={colors.leavesLight} strokeWidth="1.5" fill="none" />
        <path d="M 76 90 Q 78 84 80 90" stroke={colors.leavesLight} strokeWidth="1.5" fill="none" />
        <circle cx="15" cy="88" r="2" fill={colors.flower} opacity="0.6" />
        <circle cx="85" cy="88" r="2" fill={colors.flower} opacity="0.6" />
      </g>

      {/* Tronco robusto */}
      <path
        d="M 44 90 Q 46 70 48 50 L 50 35 L 52 50 Q 54 70 56 90 Z"
        fill={colors.trunk}
      />

      {/* Raízes visíveis */}
      <path d="M 44 90 Q 35 92 30 88" stroke={colors.trunk} strokeWidth="2" fill="none" />
      <path d="M 56 90 Q 65 92 70 88" stroke={colors.trunk} strokeWidth="2" fill="none" />

      {/* Copa frondosa - múltiplas camadas */}
      <motion.g
        animate={{ rotate: [-0.5, 0.5, -0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ transformOrigin: "50px 45px" }}
      >
        {/* Camada base */}
        <ellipse cx="50" cy="40" rx="35" ry="28" fill={colors.leavesDark} />

        {/* Camadas de detalhe */}
        <ellipse cx="35" cy="38" rx="18" ry="15" fill={colors.leavesLight} />
        <ellipse cx="65" cy="38" rx="18" ry="15" fill={colors.leavesLight} />
        <ellipse cx="50" cy="30" rx="20" ry="16" fill={colors.leavesDark} />
        <ellipse cx="50" cy="25" rx="15" ry="12" fill={colors.leavesLight} />

        {/* Textura da copa */}
        <circle cx="30" cy="42" r="10" fill={colors.leavesDark} opacity="0.5" />
        <circle cx="70" cy="42" r="10" fill={colors.leavesDark} opacity="0.5" />
        <circle cx="50" cy="20" r="8" fill={colors.leavesLight} opacity="0.7" />

        {/* Flores distribuídas */}
        <circle cx="35" cy="28" r="3" fill={colors.flower} />
        <circle cx="55" cy="22" r="2.5" fill={colors.flower} />
        <circle cx="68" cy="35" r="3" fill={colors.flower} />
        <circle cx="32" cy="42" r="2" fill={colors.flower} />
        <circle cx="45" cy="18" r="2.5" fill={colors.flower} />
      </motion.g>

      {/* Frutas (aparecem em 90%+) */}
      {showFruits && (
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <circle cx="40" cy="45" r="4" fill={colors.fruit} />
          <circle cx="60" cy="48" r="4" fill={colors.fruit} />
          <circle cx="50" cy="40" r="3.5" fill={colors.fruit} />
          <circle cx="35" cy="35" r="3" fill={colors.fruit} />
          <circle cx="65" cy="32" r="3" fill={colors.fruit} />
        </motion.g>
      )}

      {/* Pássaros/Borboletas (100%) */}
      {showBirds && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Pássaro 1 */}
          <motion.path
            d="M 75 25 Q 78 22 80 25 Q 78 23 75 25"
            fill={colors.flower}
            animate={{ x: [0, 3, 0], y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Pássaro 2 */}
          <motion.path
            d="M 20 30 Q 23 27 25 30 Q 23 28 20 30"
            fill={colors.fruit}
            animate={{ x: [0, -3, 0], y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />

          {/* Borboleta */}
          <motion.g
            animate={{
              x: [0, 10, 0, -10, 0],
              y: [0, -5, 0, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ellipse cx="85" cy="40" rx="2" ry="3" fill={colors.flower} />
            <ellipse cx="88" cy="40" rx="2" ry="3" fill={colors.flower} />
          </motion.g>
        </motion.g>
      )}

      {/* Partículas de brilho (100%) */}
      {showBirds && (
        <motion.g>
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={i}
              cx={30 + i * 10}
              cy={15 + (i % 2) * 5}
              r="1"
              fill={colors.fruit}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.g>
      )}
    </g>
  );
};
```

---

## Hook useTimer Completo

```tsx
// hooks/useTimer.ts

import { useState, useCallback, useEffect, useRef } from "react";

interface UseTimerOptions {
  /** Tempo alvo em segundos */
  targetSeconds: number;
  /** Callback quando completar */
  onComplete?: () => void;
  /** Callback a cada segundo */
  onTick?: (remainingSeconds: number) => void;
  /** Auto-start */
  autoStart?: boolean;
}

interface UseTimerReturn {
  /** Tempo restante em segundos */
  remainingSeconds: number;
  /** Tempo decorrido em segundos */
  elapsedSeconds: number;
  /** Se está rodando */
  isRunning: boolean;
  /** Se está pausado */
  isPaused: boolean;
  /** Se completou */
  isCompleted: boolean;
  /** Progresso (0-100) */
  progress: number;
  /** Estágio da árvore (1-5) */
  treeStage: 1 | 2 | 3 | 4 | 5;
  /** Iniciar timer */
  start: () => void;
  /** Pausar timer */
  pause: () => void;
  /** Continuar timer */
  resume: () => void;
  /** Resetar timer */
  reset: () => void;
  /** Tempo formatado (MM:SS) */
  formattedTime: string;
}

export function useTimer({
  targetSeconds,
  onComplete,
  onTick,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);

  // Calcular valores derivados
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const isCompleted = elapsedSeconds >= targetSeconds;
  const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

  // Calcular estágio da árvore
  const treeStage: 1 | 2 | 3 | 4 | 5 =
    progress < 20 ? 1 :
    progress < 40 ? 2 :
    progress < 60 ? 3 :
    progress < 80 ? 4 : 5;

  // Formatar tempo
  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  // Limpar interval
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Iniciar timer
  const start = useCallback(() => {
    if (isCompleted) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (pausedAtRef.current * 1000);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);

      setElapsedSeconds(elapsed);
      onTick?.(Math.max(0, targetSeconds - elapsed));

      if (elapsed >= targetSeconds) {
        clearTimer();
        setIsRunning(false);
        onComplete?.();
      }
    }, 100); // Atualizar a cada 100ms para precisão
  }, [targetSeconds, isCompleted, onTick, onComplete, clearTimer]);

  // Pausar timer
  const pause = useCallback(() => {
    if (!isRunning || isCompleted) return;

    clearTimer();
    setIsRunning(false);
    setIsPaused(true);
    pausedAtRef.current = elapsedSeconds;
  }, [isRunning, isCompleted, elapsedSeconds, clearTimer]);

  // Continuar timer
  const resume = useCallback(() => {
    if (isRunning || isCompleted) return;
    start();
  }, [isRunning, isCompleted, start]);

  // Resetar timer
  const reset = useCallback(() => {
    clearTimer();
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedAtRef.current = 0;
  }, [clearTimer]);

  // Cleanup no unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isRunning && !isCompleted) {
      start();
    }
  }, [autoStart, isRunning, isCompleted, start]);

  return {
    remainingSeconds,
    elapsedSeconds,
    isRunning,
    isPaused,
    isCompleted,
    progress,
    treeStage,
    start,
    pause,
    resume,
    reset,
    formattedTime,
  };
}
```

---

## Utilidades

```tsx
// utils/timer-utils.ts

/**
 * Converte segundos para formato MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Converte minutos para segundos
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Converte horas para segundos
 */
export function hoursToSeconds(hours: number): number {
  return hours * 3600;
}

/**
 * Verifica se um hábito é baseado em tempo
 */
export function isTimedHabit(habit: {
  unit?: string | null;
  goal_value?: number | null;
}): boolean {
  const timedUnits = ["minutes", "hours"];
  return (
    habit.unit !== undefined &&
    habit.unit !== null &&
    timedUnits.includes(habit.unit) &&
    habit.goal_value !== undefined &&
    habit.goal_value !== null &&
    habit.goal_value > 0
  );
}

/**
 * Obtém o tempo alvo em segundos para um hábito
 */
export function getTargetSeconds(habit: {
  unit?: string | null;
  goal_value?: number | null;
}): number {
  if (!habit.goal_value) return 0;

  switch (habit.unit) {
    case "minutes":
      return minutesToSeconds(habit.goal_value);
    case "hours":
      return hoursToSeconds(habit.goal_value);
    default:
      return 0;
  }
}

/**
 * Calcula o estágio da árvore baseado no progresso
 */
export function getTreeStage(progress: number): 1 | 2 | 3 | 4 | 5 {
  if (progress < 20) return 1;
  if (progress < 40) return 2;
  if (progress < 60) return 3;
  if (progress < 80) return 4;
  return 5;
}

/**
 * Obtém a categoria do hábito para frases motivacionais
 */
export function getHabitCategory(habitId: string): string {
  const categories: Record<string, string[]> = {
    meditate: ["meditate", "mindful_minutes", "yoga"],
    study: ["study", "read_books", "review_goals"],
    exercise: ["walk_run", "workout", "stretch", "strength_training", "swim", "cycle"],
    productivity: ["plan_day", "deep_work", "focus_session", "journaling"],
  };

  for (const [category, ids] of Object.entries(categories)) {
    if (ids.includes(habitId)) return category;
  }

  return "default";
}
```

---

## Frases Motivacionais

```tsx
// data/timer-quotes.ts

export const TIMER_QUOTES: Record<string, string[]> = {
  meditate: [
    "Cada respiração é um novo começo",
    "A paz está dentro de você",
    "Silêncio é onde a sabedoria nasce",
    "Esteja presente neste momento",
    "Sua mente merece este descanso",
  ],
  study: [
    "Conhecimento é poder",
    "Cada minuto de estudo é um investimento",
    "Você está construindo seu futuro",
    "A curiosidade é o início da sabedoria",
    "Grandes mentes nunca param de aprender",
  ],
  exercise: [
    "Seu corpo é seu templo",
    "Força não vem do corpo, vem da vontade",
    "Cada gota de suor conta",
    "Você é mais forte do que imagina",
    "O único treino ruim é o que não aconteceu",
  ],
  productivity: [
    "Foco é a chave do sucesso",
    "Pequenos passos, grandes conquistas",
    "Disciplina liberta",
    "Você está no controle do seu tempo",
    "Progresso, não perfeição",
  ],
  default: [
    "Você está no caminho certo",
    "Consistência supera intensidade",
    "Cada segundo conta",
    "Continue, você está indo bem",
    "Este momento é seu",
  ],
};

/**
 * Obtém uma frase aleatória para a categoria
 */
export function getRandomQuote(category: string): string {
  const quotes = TIMER_QUOTES[category] || TIMER_QUOTES.default;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
```

---

## Tipos TypeScript

```tsx
// types/timer.ts

export interface TreeColors {
  soil: string;
  soilDark: string;
  trunk: string;
  trunkDark: string;
  leavesLight: string;
  leavesDark: string;
  flower: string;
  fruit: string;
  glow: string;
}

export type TreeStage = 1 | 2 | 3 | 4 | 5;

export type TimerState = "idle" | "running" | "paused" | "completed";

export interface TimerSession {
  habitId: string;
  targetSeconds: number;
  actualSeconds: number;
  startedAt: string;
  completedAt?: string;
  pauseCount: number;
  completed: boolean;
}
```

---

## Instalação de Dependências

```bash
# Confetti para celebração
npm install canvas-confetti
npm install -D @types/canvas-confetti

# Framer Motion (provavelmente já instalado)
npm install framer-motion
```

---

## Próximos Passos

1. Criar os componentes na pasta `App/src/components/timer/`
2. Implementar o hook `useTimer`
3. Integrar com o `CircularHabitCard`
4. Testar em dark/light mode
5. Adicionar animações de celebração
6. Testes de acessibilidade

---

*Documento criado em: 25/11/2024*
