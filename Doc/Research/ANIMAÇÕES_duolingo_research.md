# Animações estilo Duolingo em React PWA: guia completo de implementação

O Duolingo combina **Rive** (animações interativas) com **Lottie** (decorativas) para criar sua experiência distintiva. Para replicar isso em React PWA, a estratégia mais eficiente usa **Framer Motion** como base principal, **canvas-confetti** para celebrações, e **Lottie** ou **Rive** para personagens animados. Esta combinação oferece o melhor equilíbrio entre facilidade de implementação, performance mobile e resultado visual profissional.

O segredo do Duolingo está em três elementos: state machines para controlar transições de estados dos personagens, feedback visual imediato em cada interação, e animações "bold, bouncy, bright" que seguem princípios de gamificação. Com as bibliotecas certas, você pode replicar **90% dessa experiência** sem reinventar a roda.

---

## Stack tecnológico recomendado para cada tipo de animação

A escolha de biblioteca impacta diretamente o bundle size e performance mobile. Para PWAs, priorize opções leves com lazy loading.

| Tipo de Animação | Biblioteca Principal | Bundle Size | Alternativa |
|------------------|---------------------|-------------|-------------|
| Micro-interações (botões, hover) | Framer Motion | ~25kb (LazyMotion: ~5kb) | CSS Transitions |
| Transições de página | Framer Motion + AnimatePresence | Incluído | React Transition Group |
| Confetti/celebrações | canvas-confetti | **~6kb** | react-rewards (~5kb) |
| Personagens/mascotes | Lottie-react ou Rive | 80kb / 20kb | SVG animado |
| Animações complexas/timeline | GSAP | ~60kb | Framer Motion |

### Framer Motion: a escolha principal para UI

Framer Motion oferece a melhor developer experience para animações de UI em React. A API declarativa com `whileHover`, `whileTap` e `AnimatePresence` permite criar micro-interações em poucas linhas:

```jsx
import { motion } from "framer-motion";

// Botão estilo Duolingo com feedback tátil
const DuoButton = ({ children, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 5px 0 #4caf50" }}
    whileTap={{ scale: 0.95, boxShadow: "0 2px 0 #4caf50" }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    style={{
      background: "#58cc02",
      color: "white",
      padding: "15px 30px",
      borderRadius: "16px",
      border: "none",
      fontWeight: "bold"
    }}
    onClick={onClick}
  >
    {children}
  </motion.button>
);
```

Para otimizar o bundle em PWA, use o padrão **LazyMotion** que reduz o tamanho inicial de ~34kb para apenas **~5kb**:

```jsx
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";

const loadFeatures = () => import("./features.js").then(res => res.default);

function App() {
  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  );
}
```

---

## Celebrações com confetti: implementação simples e leve

O Duolingo usa celebrações visuais como reforço positivo em completar tarefas. A biblioteca **canvas-confetti** é a opção mais leve (**~6kb**) e oferece efeitos impressionantes sem dependências.

### Confetti básico para acertos

```jsx
import confetti from 'canvas-confetti';

// Explosão de confetti centralizada
const celebrateSuccess = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

// "Side cannons" para efeito mais dramático (estilo Duolingo)
const celebrateWithCannons = () => {
  const colors = ["#58cc02", "#ffc800", "#ff4b4b", "#1cb0f6"];
  const end = Date.now() + 2000;

  const frame = () => {
    if (Date.now() > end) return;
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors
    });
    requestAnimationFrame(frame);
  };
  frame();
};
```

### Alternativa: react-rewards para micro-celebrações

Para celebrações menores vinculadas a elementos específicos, **react-rewards** (~5kb) é ainda mais simples:

```jsx
import { useReward } from 'react-rewards';

const QuizButton = () => {
  const { reward, isAnimating } = useReward('rewardId', 'confetti');
  
  return (
    <button onClick={reward} disabled={isAnimating}>
      <span id="rewardId" />
      Verificar ✓
    </button>
  );
};
```

---

## Transições de página suaves com AnimatePresence

O Duolingo cria fluidez entre telas com transições que dão sensação de continuidade. Com Framer Motion e React Router, isso requer apenas um wrapper:

```jsx
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <HomePage />
          </motion.div>
        } />
        <Route path="/lesson" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <LessonPage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}
```

### Transição "cortina" estilo Duolingo

Para transições mais elaboradas com cor de fundo deslizando:

```jsx
const SlideTransition = () => (
  <>
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 0 }}
      exit={{ scaleY: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', inset: 0,
        background: '#58cc02',
        transformOrigin: 'bottom',
        zIndex: 100
      }}
    />
  </>
);
```

---

## Animações de personagens: Lottie vs Rive

O Duolingo migrou recentemente para **Rive** devido à performance superior e state machines interativas. Para PWAs, ambos funcionam bem, mas com trade-offs diferentes.

### Comparação de performance real

| Métrica | Lottie | Rive |
|---------|--------|------|
| File size típico | 181kb | **18kb** |
| GPU Memory | ~150MB | **2.6MB** |
| CPU usage | 91% | **32%** |
| Interatividade | Requer código | State machines nativas |

### Lottie: mais fácil de começar

Milhares de animações gratuitas disponíveis em [LottieFiles.com](https://lottiefiles.com). Ideal para celebrações e feedback visual:

```jsx
import Lottie from "lottie-react";
import successAnimation from "./success.json";

const SuccessFeedback = ({ show }) => {
  const lottieRef = useRef(null);
  
  useEffect(() => {
    if (show) lottieRef.current?.play();
  }, [show]);
  
  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={successAnimation}
      loop={false}
      autoplay={false}
      style={{ width: 150, height: 150 }}
    />
  );
};
```

**Otimização crítica:** Converta arquivos JSON para formato **.lottie** (dotLottie) que é até **80% menor**. Use o conversor em [lottiefiles.com/compress](https://lottiefiles.com/compress).

### Rive: melhor para personagens interativos

Se precisar de reações em tempo real (correto/incorreto, lip-sync), Rive é superior:

```jsx
import { useRive } from '@rive-app/react-canvas';

const MascotCharacter = ({ isCorrect }) => {
  const { rive, RiveComponent } = useRive({
    src: '/mascot.riv',
    stateMachines: 'MainState',
    autoplay: true,
  });
  
  useEffect(() => {
    if (rive) {
      const trigger = rive.stateMachineInputs('MainState')
        .find(i => i.name === (isCorrect ? 'Correct' : 'Incorrect'));
      trigger?.fire();
    }
  }, [isCorrect, rive]);
  
  return <RiveComponent style={{ width: 200, height: 200 }} />;
};
```

---

## Micro-interações essenciais para gamificação

### Shake animation para erros

```jsx
import { motion, useAnimation } from "framer-motion";

const ShakeableInput = ({ hasError }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    if (hasError) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }
  }, [hasError]);
  
  return (
    <motion.input
      animate={controls}
      style={{ borderColor: hasError ? '#ff4b4b' : '#e5e5e5' }}
    />
  );
};
```

### Checkmark animado para sucesso

```jsx
const AnimatedCheckmark = ({ show }) => (
  <motion.svg width="60" height="60" viewBox="0 0 50 50">
    <motion.path
      d="M14,27 L22,35 L37,16"
      fill="none"
      stroke="#58cc02"
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: show ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </motion.svg>
);
```

### Progress bar com animação suave

```jsx
const AnimatedProgress = ({ value }) => (
  <div style={{ background: '#e5e5e5', borderRadius: 10, overflow: 'hidden' }}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      style={{ height: 12, background: '#58cc02' }}
    />
  </div>
);
```

---

## Performance em PWA mobile: otimizações críticas

### Regra de ouro: anime apenas propriedades GPU-accelerated

Apenas **transform**, **opacity** e **filter** rodam na GPU. Evite animar width, height, margin, padding, top, left — causam reflow e destroem a performance.

```css
/* ✅ Bom - GPU accelerated */
.animated { transform: translateX(100px); opacity: 1; }

/* ❌ Ruim - Causa reflow */
.animated-bad { left: 100px; width: 200px; }
```

### Hook para adaptive loading em devices fracos

```jsx
function useDeviceCapabilities() {
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    const nav = navigator;
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;
    const connection = nav.connection?.effectiveType || '4g';
    
    setIsLowEnd(
      cores <= 2 || memory <= 2 || 
      ['slow-2g', '2g', '3g'].includes(connection)
    );
  }, []);
  
  return { isLowEnd };
}

// Uso: desabilitar animações complexas em devices fracos
const { isLowEnd } = useDeviceCapabilities();
const animationDuration = isLowEnd ? 0.1 : 0.3;
```

### Respeitar prefers-reduced-motion

```jsx
import { useReducedMotion } from "framer-motion";

const AnimatedCard = () => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ 
        opacity: 1,
        y: shouldReduceMotion ? 0 : 20 
      }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    />
  );
};
```

### Lazy loading de animações Lottie com Intersection Observer

```jsx
const LazyLottie = ({ src }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref}>
      {isVisible && <Lottie animationData={src} />}
    </div>
  );
};
```

---

## Ferramentas de design e recursos gratuitos

### Onde encontrar animações prontas

- **LottieFiles** (lottiefiles.com): Maior biblioteca com **milhares de animações gratuitas**, editor online, e conversor dotLottie
- **Rive Community** (rive.app/community): Animações interativas com state machines
- **Creattie** (creattie.com): Alternativa com curadoria de qualidade
- **IconScout Lottie** (iconscout.com/lotties): Ícones animados

### Criando animações customizadas

| Ferramenta | Formato de Saída | Curva de Aprendizado | Custo |
|------------|------------------|---------------------|-------|
| **After Effects + Bodymovin** | Lottie JSON | Alta | Pago (Adobe) |
| **Rive Editor** (web) | .riv | Média | Free tier generoso |
| **Figma + LottieFiles plugin** | Lottie JSON | Baixa | Free |
| **Canva** | GIF/Vídeo (não Lottie) | Muito baixa | Free tier |

### Editor Rive (recomendado para iniciantes)

O [Rive Editor](https://rive.app/) é gratuito e roda no browser. Permite criar animações com state machines sem código, exportando arquivos **10-15x menores** que Lottie equivalente.

---

## Repositórios GitHub de referência

Para estudar implementações completas estilo Duolingo:

- **sanidhyy/duolingo-clone** (430+ stars): Clone completo com Next.js 14, animações e Stripe
- **bryanjenningz/react-duolingo**: Interface pixel-perfect com TypeScript e Tailwind
- **Gamote/lottie-react**: Biblioteca Lottie recomendada para React

### Componentes UI prontos com animações

- **Magic UI** (magicui.design): Componentes de confetti, text animations, particles — instaláveis via shadcn
- **Hover.dev**: Botões animados estilo premium
- **Motion Primitives**: Componentes base para Framer Motion

---

## Estratégia de implementação recomendada

Para implementar animações estilo Duolingo em sua PWA React de forma **incremental e eficiente**:

1. **Semana 1 - Fundação**: Instale Framer Motion com LazyMotion. Adicione `whileHover` e `whileTap` em todos os botões. Isso já transforma a sensação do app com ~5kb adicionais.

2. **Semana 2 - Feedback visual**: Implemente canvas-confetti para celebrações de conclusão. Adicione shake animation para erros e checkmark animado para acertos.

3. **Semana 3 - Transições**: Configure AnimatePresence no router para transições de página suaves. Teste em mobile para garantir 60fps.

4. **Semana 4 - Personagens (opcional)**: Se precisar de mascote, comece com Lottie (mais fácil) usando animações do LottieFiles. Migre para Rive apenas se precisar de interatividade complexa.

O Duolingo levou anos para refinar suas animações. Com as bibliotecas certas, você pode alcançar **80% do resultado visual em 20% do tempo** focando nas micro-interações que mais impactam a experiência: feedback imediato, celebrações de conquistas, e transições fluidas.