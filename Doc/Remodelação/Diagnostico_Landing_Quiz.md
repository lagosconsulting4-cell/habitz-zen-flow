# Diagnóstico Completo - Landing Page Quiz Experience

**Data:** 2025-11-25
**Escopo:** Análise UX/UI do Quiz e Landing Page com foco em melhorias utilizando bibliotecas existentes

---

## 1. Resumo Executivo

### Problema Principal Identificado
Os **cards da seção "Sua rotina personalizada"** (página Offer.tsx) apresentam **baixo contraste** - texto branco/claro sobre fundo semi-transparente dificulta a leitura, especialmente em dispositivos com diferentes calibrações de tela.

### Bibliotecas Disponíveis (Subutilizadas)

| Biblioteca | Versão | Status de Uso | Potencial |
|------------|--------|---------------|-----------|
| motion/framer-motion | 12.23.24 | Parcial | Alto - Layout animations, gestures |
| shadcn/ui | v4 (54 componentes) | ~15 usados | Alto - Progress, Carousel, Tooltip |
| embla-carousel-react | 8.6.0 | Não usado | Alto - Swipe no quiz |
| vaul | 0.9.9 | Não usado | Médio - Drawers mobile |
| SiriOrb (smoothui) | Instalado | Não usado | Alto - Elemento decorativo |

---

## 2. Análise Detalhada por Página

### 2.1 Quiz.tsx - Página Principal do Quiz

**Referência:** `Landing/src/pages/Quiz.tsx`

#### Pontos Fortes
- AnimatePresence para transições entre perguntas
- Stagger animations nas opções
- Progress bar com gradiente
- Mid-quiz feedback screen (emotiva)

#### Problemas Identificados

| Severidade | Problema | Localização | Impacto |
|------------|----------|-------------|---------|
| ALTA | Cards com contraste insuficiente | `.quiz-option-card` (linha 342) | Acessibilidade |
| MÉDIA | Transições básicas entre perguntas | `AnimatePresence` (linha 299) | UX |
| MÉDIA | Sem swipe gestures em mobile | Todo o quiz | UX Mobile |
| BAIXA | Progress bar sem micro-animações | `progress-premium` (linha 272) | Polish |

#### Código Problemático - Quiz Option Card
```tsx
// Landing/src/pages/Quiz.tsx:341-345
<div className={`quiz-option-card ${isSelected ? "selected" : ""}`}>
```

```css
/* Landing/src/index.css:198-207 */
.quiz-option-card {
  @apply relative rounded-2xl border-2 border-border/30 bg-card/50 p-4;
  /* bg-card/50 = 50% opacidade, causa baixo contraste no dark mode */
}
```

### 2.2 Offer.tsx - Página de Oferta

**Referência:** `Landing/src/pages/Offer.tsx`

#### Problema Crítico (Mostrado na Imagem do Usuário)

**Seção:** "Sua rotina personalizada" (linhas 149-196)

```tsx
// Landing/src/pages/Offer.tsx:172-189
{routineItems.map((item, index) => {
  return (
    <motion.div
      className="feature-card"  // <-- Problema aqui
    >
```

```css
/* Landing/src/index.css:185-188 */
.feature-card {
  @apply relative overflow-hidden rounded-2xl border border-border/40 bg-card/90 p-6;
  /* bg-card/90 ainda permite que o background escuro "vaze" */
}
```

**Resultado Visual:**
- Dark mode: `--card: #0A0A0A` com 90% opacidade = quase preto
- Texto `text-foreground: #FFFFFF` sobre fundo semi-transparente
- Gradiente de fundo interfere na legibilidade

### 2.3 Mirror.tsx - Página de Espelho do Futuro

**Referência:** `Landing/src/pages/Mirror.tsx`

#### Análise
- Uso adequado de gradientes temáticos por cenário
- Glass cards bem implementados para emoções
- Progress dots interativos

#### Oportunidades
- Adicionar parallax nos backgrounds temáticos
- Micro-animações nos ícones de tempo
- Haptic feedback no mobile

---

## 3. Design System - Problemas de Contraste

### 3.1 Variáveis CSS Problemáticas

**Arquivo:** `Landing/src/index.css`

```css
/* Dark Mode - Análise de Contraste */
.dark {
  --background: #000000;      /* Preto puro */
  --card: #0A0A0A;            /* Quase preto */
  --foreground: #FFFFFF;      /* Branco */
  --muted-foreground: #A3A3A3; /* Cinza médio */
}
```

### 3.2 Classes com Baixo Contraste

| Classe | Definição | Problema |
|--------|-----------|----------|
| `.quiz-option-card` | `bg-card/50` | 50% opacidade muito baixa |
| `.feature-card` | `bg-card/90` | Ainda insuficiente com backdrop |
| `.glass-card` | `bg-card 80%` via color-mix | Transparência causa interferência |
| `.testimonial-card` | `bg-card/60` | Muito transparente |

### 3.3 Recomendação de Correção

```css
/* ANTES - Problemático */
.quiz-option-card {
  @apply bg-card/50 backdrop-blur-sm;
}

/* DEPOIS - Com contraste adequado */
.quiz-option-card {
  @apply bg-card backdrop-blur-md;
  /* OU */
  @apply bg-secondary/95 backdrop-blur-md;
  /* OU usar gradiente sólido */
  background: linear-gradient(
    135deg,
    hsl(var(--card)) 0%,
    hsl(var(--secondary)) 100%
  );
}
```

---

## 4. Componentes Shadcn Disponíveis (Não Utilizados)

### 4.1 Componentes de Alto Impacto para o Quiz

| Componente | Uso Potencial | Prioridade |
|------------|---------------|------------|
| `Progress` | Substituir progress-premium customizado | Alta |
| `Carousel` | Navegação swipe entre perguntas | Alta |
| `Tooltip` | Dicas contextuais nas opções | Média |
| `Drawer` (vaul) | Resultados em mobile | Média |
| `Skeleton` | Loading states | Baixa |
| `Tabs` | Indicador de progresso por seções | Média |

### 4.2 Blocos Shadcn v4 Relevantes

```
shadcn/blocks disponíveis:
- calendar-* (32 variantes) - Visualização de progresso
- login-* (5 variantes) - Inspiração para layouts
- sidebar-* (16 variantes) - Navegação
```

---

## 5. Motion/Framer-Motion - Oportunidades

### 5.1 Animações Atuais (useAnimations.ts)

**Arquivo:** `Landing/src/hooks/useAnimations.ts`

```typescript
// Animações existentes bem implementadas:
- springTransition (stiffness: 210, damping: 16)
- staggerContainer (staggerChildren: 0.1s)
- buttonHoverTap (scale: 1.05/0.95)
- cardHover (scale: 1.02, y: -4)
```

### 5.2 Animações Subutilizadas/Não Implementadas

| Feature | Status | Impacto |
|---------|--------|---------|
| Layout Animations | Não usado | Alto - Transições fluidas |
| Shared Layout | Não usado | Alto - Continuidade visual |
| Drag Gestures | Não usado | Alto - Swipe quiz |
| useScroll | Não usado | Médio - Parallax |
| useInView | Parcial | Médio - Reveal animations |
| AnimatePresence exitBeforeEnter | Parcial | Médio - Transições |

### 5.3 Implementações Sugeridas

```typescript
// 1. Drag para navegar entre perguntas
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(_, info) => {
    if (info.offset.x > 100) handlePrevious();
    if (info.offset.x < -100) handleNext();
  }}
>

// 2. Layout animations para opções selecionadas
<motion.div layout layoutId={`option-${index}`}>

// 3. Scroll-triggered parallax
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
```

---

## 6. SiriOrb - Componente Não Utilizado

**Arquivo:** `Landing/src/components/smoothui/siri-orb/index.tsx`

### Características
- Orb animado com gradientes cônicos
- Customizável (cores, tamanho, duração)
- Respeita `prefers-reduced-motion`
- Visual premium/imersivo

### Uso Sugerido no Quiz
```tsx
// Background decorativo na página do quiz
<SiriOrb
  size="400px"
  className="absolute -top-20 -right-20 opacity-30"
  colors={{
    bg: "oklch(10% 0.02 264)",
    c1: "oklch(75% 0.15 120)", // Verde lime
    c2: "oklch(70% 0.12 130)",
    c3: "oklch(65% 0.10 140)",
  }}
  animationDuration={30}
/>
```

---

## 7. Plano de Melhorias - Priorizado

### Fase 1: Correções Críticas (Contraste)

| Tarefa | Arquivo | Prioridade |
|--------|---------|------------|
| Corrigir `.quiz-option-card` contrast | `index.css:198-207` | P0 |
| Corrigir `.feature-card` contrast | `index.css:185-195` | P0 |
| Ajustar `.glass-card` opacidade | `index.css:172-182` | P1 |
| Revisar `.testimonial-card` | `index.css:210-213` | P1 |

### Fase 2: UX Enhancements

| Tarefa | Componente | Prioridade |
|--------|------------|------------|
| Implementar swipe gestures | Quiz.tsx | P1 |
| Adicionar Progress do shadcn | Quiz.tsx | P2 |
| Micro-animações na seleção | Quiz.tsx | P2 |
| Loading skeleton entre perguntas | Quiz.tsx | P3 |

### Fase 3: Visual Polish

| Tarefa | Componente | Prioridade |
|--------|------------|------------|
| Integrar SiriOrb como decoração | Quiz.tsx, Offer.tsx | P2 |
| Parallax no background | Mirror.tsx | P3 |
| Haptic feedback mobile | Todas | P3 |
| Confetti na conclusão | Quiz completion | P3 |

---

## 8. Código de Referência - Correções Propostas

### 8.1 Novo Quiz Option Card (Alto Contraste)

```css
/* Landing/src/index.css - Substituir linhas 198-207 */

.quiz-option-card {
  @apply relative rounded-2xl border-2 p-4;
  @apply transition-all duration-200 cursor-pointer;

  /* Background sólido com gradiente sutil */
  background: linear-gradient(
    135deg,
    hsl(var(--secondary)) 0%,
    hsl(var(--card)) 100%
  );
  border-color: hsl(var(--border) / 0.5);

  /* Hover state */
  &:hover {
    border-color: hsl(var(--primary) / 0.6);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px hsl(var(--primary) / 0.15);
  }

  /* Selected state */
  &.selected {
    border-color: hsl(var(--primary));
    background: linear-gradient(
      135deg,
      hsl(var(--primary) / 0.15) 0%,
      hsl(var(--primary) / 0.05) 100%
    );
    box-shadow:
      0 0 0 1px hsl(var(--primary) / 0.3),
      0 8px 25px -5px hsl(var(--primary) / 0.2);
  }
}
```

### 8.2 Feature Card com Contraste Melhorado

```css
/* Landing/src/index.css - Substituir linhas 185-195 */

.feature-card {
  @apply relative overflow-hidden rounded-2xl p-6;
  @apply transition-all duration-300;

  /* Background sólido */
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border) / 0.5);

  /* Gradient overlay interno */
  &::before {
    content: '';
    @apply absolute inset-0 pointer-events-none;
    background: linear-gradient(
      135deg,
      hsl(var(--primary) / 0.05) 0%,
      transparent 50%,
      hsl(var(--primary) / 0.03) 100%
    );
  }

  &:hover {
    border-color: hsl(var(--primary) / 0.5);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}
```

### 8.3 Quiz com Swipe Gestures

```tsx
// Landing/src/pages/Quiz.tsx - Adicionar drag gestures

import { motion, useAnimation, PanInfo } from "motion/react";

const Quiz = () => {
  const controls = useAnimation();

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && currentQuestion > 0) {
      // Swipe right - previous
      setCurrentQuestion(prev => prev - 1);
    } else if (info.offset.x < -threshold && hasAnswer) {
      // Swipe left - next
      handleNext();
    }
    controls.start({ x: 0 });
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {/* Question content */}
    </motion.div>
  );
};
```

---

## 9. Checklist de Implementação

### Pré-Requisitos
- [ ] Backup dos arquivos originais
- [ ] Ambiente de preview funcionando

### Fase 1 - Contraste (Urgente)
- [ ] Atualizar `.quiz-option-card` em `index.css`
- [ ] Atualizar `.feature-card` em `index.css`
- [ ] Atualizar `.glass-card` em `index.css`
- [ ] Testar em diferentes dispositivos
- [ ] Validar WCAG AA (4.5:1 ratio)

### Fase 2 - UX
- [ ] Implementar drag gestures no Quiz
- [ ] Substituir progress bar customizado por shadcn/Progress
- [ ] Adicionar Tooltip nas opções longas
- [ ] Melhorar transições AnimatePresence

### Fase 3 - Polish
- [ ] Integrar SiriOrb como elemento decorativo
- [ ] Adicionar micro-animações de feedback
- [ ] Implementar confetti na conclusão
- [ ] Testar acessibilidade completa

---

## 10. Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Contraste WCAG | ~3:1 | 4.5:1+ |
| Quiz completion rate | - | +15% |
| Time on page | - | +20% |
| Mobile UX score | - | 90+ |

---

## Conclusão

A Landing Page tem uma base sólida com design system bem estruturado e bibliotecas de alta qualidade instaladas. O problema principal é o **baixo contraste dos cards** causado pelo uso excessivo de transparências no dark mode.

As correções de contraste são **urgentes** para acessibilidade e legibilidade. As melhorias de UX com swipe gestures e motion avançado podem ser implementadas em paralelo para criar uma experiência mais **imersiva e premium**.

**Próximo Passo Recomendado:** Iniciar pela correção de contraste no `index.css`, seguido da implementação de swipe gestures no Quiz.

---

*Documento gerado por análise automatizada do código-fonte*
