# Nova Experiência de Onboarding — Plano Multi-Fase

> **Objetivo:** Transformar o onboarding do Bora em uma experiência visual premium, expressiva e única — com identidade artística própria, motion rico, componentes avançados e elementos visuais que criam emoção e confiança no usuário desde o primeiro segundo.

---

## Contexto Técnico

- **Stack:** React + TypeScript + Vite PWA, `motion/react` (Framer Motion v3)
- **Estilo:** Dark-first, primary `#A3E635` (lime), font Alexandria
- **Onboarding:** 22 steps (S0–S20 + S14b) em `App/src/components/onboarding-v2/`
- **Shell:** `OnboardingFlowV2.tsx` controla nav, progress e transições
- **Animações existentes:** `AnimatePresence` + `motion.div` com `easeInOut`
- **Classe CSS existente:** `.gradient-text` em `index.css` (gradient lime → accent, background-clip)
- **SelectionCard:** `App/src/components/onboarding/SelectionCard.tsx`
- **Progress bar:** `SegmentedProgressBar` dentro de `OnboardingFlowV2.tsx`

---

## Instruções para o Claude em Cada Fase

Ao iniciar cada fase, o Claude deve:

1. **Pesquisar na internet** referências visuais, bibliotecas e técnicas relevantes para a fase
2. **Usar MCP shadcn** (`mcp__shadcn__*`) para descobrir componentes aplicáveis
3. **Usar skills** disponíveis (ex: `frontend-design`, `example-skills:algorithmic-art`, `example-skills:canvas-design`)
4. **Criar SVGs inline** diretamente no código quando ilustrações são necessárias
5. **Buscar imagens** em Unsplash/Pexels via URL pública quando assets fotográficos se aplicam
6. **Criar animações** CSS ou via `motion/react` em vez de importar bibliotecas pesadas quando possível
7. **Verificar** com `tsc --noEmit` + `vite build` ao fim de cada fase

---

## FASE 1 — Polish Base

**Status:** Planejada em detalhe. Pronta para executar.
**Esforço:** ~2-3h | **Risco:** Baixo | **Dependências novas:** Nenhuma

### O que faz

Cinco melhorias visuais de alto impacto usando apenas o que já existe:

| Melhoria | Descrição |
|----------|-----------|
| Blobs ambiente | 2 divs posicionados por fase com `filter: blur(60px)`, 8-15% opacity, cross-fade ao mudar fase |
| Progress dots | Substituir barra segmentada por 6 dots animados (completed=lime, current=pulse+glow, future=muted) |
| Spring transitions | x: 100% → 60%, `easeInOut` → `spring(stiffness: 280, damping: 28)` |
| Glow cards | `ring-1 ring-primary/40` + `bg-gradient-to-br from-primary/[0.08]` + icon spring scale 1.1x |
| Gradient text | `.gradient-text` em "Bora", nome do usuário, "rotina", "nível", "pronto" |

### Arquivos

**Criar:**
- `App/src/components/onboarding-v2/OnboardingBlobBackground.tsx`

**Modificar:**
- `App/src/components/onboarding-v2/OnboardingFlowV2.tsx` — dots + blob + spring
- `App/src/components/onboarding/SelectionCard.tsx` — glow + gradient + icon spring
- `App/src/components/onboarding-v2/steps/S0_Welcome.tsx`
- `App/src/components/onboarding-v2/steps/S8_LoadingRoutine.tsx`
- `App/src/components/onboarding-v2/steps/S11_JourneysIntro.tsx`
- `App/src/components/onboarding-v2/steps/S20_Celebration.tsx`

### OnboardingBlobBackground — Especificação

```
PHASE_BLOBS:
  0 (welcome):     lime #A3E635 (12%) + lime-dark #84cc16 (8%)   — top-left + bottom-right
  1 (quiz):        amber #F59E0B (8%) + lime #A3E635 (6%)         — top-left + bottom-right
  2 (routine):     lime #A3E635 (10%) + green #4ade80 (7%)        — mid-left + top-right
  3 (journeys):    violet #8B5CF6 (10%) + lime #A3E635 (6%)       — top-left + bottom-right
  4 (install):     blue #3B82F6 (7%) + lime #A3E635 (5%)          — top-left + bottom-right
  5 (tour):        lime #A3E635 (5%) + lime #A3E635 (4%)          — minimal (overlay escurece)
  6 (celebration): green #22c55e (13%) + lime #A3E635 (10%)       — grandes, expansivos

Blob: border-radius 50%, filter blur(60px), pointer-events none
Container: motion.div key={phase}, cross-fade opacity 0→1 em 0.8s, zIndex 0
Step wrapper: relative z-10 (acima dos blobs)
```

### Progress Dots — Especificação

```
6 dots (NUM_PROGRESS_PHASES)
completed:  w-2 h-2 rounded-full bg-primary
current:    w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(163,230,53,0.7)]
            animate: scale [1, 1.25, 1], opacity [0.9, 1, 0.9], repeat Infinity 1.5s
future:     w-2 h-2 rounded-full bg-muted-foreground/30
```

### QA da Fase 1

- [ ] Blobs visíveis mas não distrativos em cada fase
- [ ] Dots corretos: completed sólido, current pulsando com glow, future apagado
- [ ] Transições spring (não linear) entre steps
- [ ] Cards: ring lime ao selecionar + ícone escala suavemente
- [ ] Gradient text em S0, S8, S11, S20
- [ ] Dark mode OK | Build sem erros TypeScript

---

## FASE 2 — Identidade Visual & Ilustrações

**Status:** Aguardando Fase 1
**Esforço:** ~4-6h | **Risco:** Médio | **Dependências novas:** Nenhuma (SVG inline)

### Objetivo

Cada step-chave ganha um elemento visual único — SVG, ilustração inline, ou imagem — que reforça o contexto emocional do momento. O resultado deve parecer "feito para o Bora", não genérico.

### Pesquisa que o Claude deve fazer ao iniciar esta fase

```
WebSearch: "onboarding illustrations minimalist dark mode svg 2024"
WebSearch: "habit tracker app illustrations premium ui"
WebSearch: "unsplash minimalist dark background lifestyle habit"
mcp__shadcn__search_items_in_registries: "illustration", "hero", "banner"
mcp__shadcn__list_items_in_registries: registry items relacionados a visual/decorativo
Skill: example-skills:frontend-design (para criar ilustrações temáticas)
Skill: example-skills:algorithmic-art (para arte geométrica/generativa inline)
```

### Steps prioritários para ilustrações

| Step | Momento | Tipo de Visual |
|------|---------|---------------|
| S0 Welcome | Primeiro contato | SVG abstrato animado: linhas convergindo para um ponto de luz (representa foco/clareza) |
| S1 Intro | Proposta de valor | 3 ícones SVG grandes com micro-animações: cérebro, coração, raio |
| S8 Loading | Rotina gerada | SVG de órbita/constelação de hábitos aparecendo um a um |
| S11 Journeys | Jornadas | Cards com gradiente temático por jornada (violet=meditação, amber=produtividade, etc.) |
| S20 Celebration | Conclusão | Confetti SVG + estrelas animadas em burst |

### Paleta de Cores por Jornada (para S11/S12)

```
Foco & Produtividade:  amber    #F59E0B → #D97706
Saúde & Bem-estar:     emerald  #10B981 → #059669
Equilíbrio Mental:     violet   #8B5CF6 → #7C3AED
Relacionamentos:       rose     #F43F5E → #E11D48
Aprendizado:           blue     #3B82F6 → #2563EB
```

### Técnicas SVG inline

```tsx
// Exemplo: ícone animado no S0
<motion.svg
  viewBox="0 0 100 100"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
>
  <motion.circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
  <motion.path d="M 30 50 Q 50 20 70 50" stroke="#A3E635" strokeWidth="2" fill="none" />
</motion.svg>
```

### QA da Fase 2

- [ ] Cada SVG é inline (zero assets externos obrigatórios)
- [ ] Imagens externas (se usadas) têm fallback gracioso
- [ ] Ilustrações respeitam dark mode (sem cores hardcoded brancas)
- [ ] Nenhum SVG causa layout shift (dimensões fixas)
- [ ] Build sem erros

---

## FASE 3 — Microinterações Avançadas

**Status:** Aguardando Fase 2
**Esforço:** ~4-5h | **Risco:** Médio | **Dependências novas:** Possível `canvas-confetti` (leve, ~4kb gzipped)

### Objetivo

Momentos de feedback visual que criam dopamina: confetti ao completar onboarding, checkmark que "desenha" animado, números que contam, shake em erros.

### Pesquisa que o Claude deve fazer ao iniciar esta fase

```
WebSearch: "framer motion celebration animation react 2024"
WebSearch: "canvas-confetti react lightweight confetti"
WebSearch: "animated checkmark svg framer motion draw"
WebSearch: "spring animation number counter react"
mcp__shadcn__search_items_in_registries: "confetti", "celebration", "progress", "counter"
npm info canvas-confetti (verificar tamanho e manutenção)
```

### Microinterações planejadas

| Componente | Onde | Técnica |
|-----------|------|---------|
| Confetti burst | S20 Celebration | `canvas-confetti` ou SVG partículas via `motion/react` |
| Checkmark animado | S14 Notifications (success) | SVG `pathLength` 0→1 com spring |
| Shake de erro | Qualquer validação falha | `motion.div` com keyframe `x: [0, -8, 8, -4, 4, 0]` |
| Progress count | S9 Routine Preview | Número de hábitos "contando" com `useSpring` do motion |
| Bounce checkmark | SelectionCard ao selecionar | `scale: [1, 1.3, 0.9, 1]` na sequência de seleção |
| Pulse no CTA | Botões principais (idle > 3s) | `animate={{ scale: [1, 1.02, 1] }}` loop suave |

### Confetti sem dependência externa (alternativa)

```tsx
// SVG confetti inline com motion/react — zero dep extra
const CONFETTI_COLORS = ['#A3E635', '#F59E0B', '#8B5CF6', '#3B82F6', '#F43F5E'];

function ConfettiPiece({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      style={{ position: 'absolute', top: -20, left: `${x}%`, width: 8, height: 8, borderRadius: 2, backgroundColor: color }}
      animate={{ y: ['0vh', '110vh'], rotate: [0, 360 * 3], opacity: [1, 1, 0] }}
      transition={{ duration: 2, delay, ease: 'easeIn' }}
    />
  );
}
```

### QA da Fase 3

- [ ] Confetti só dispara 1x (ref guard)
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Shake não quebra layout (transform only)
- [ ] Counter animado tem valor inicial correto
- [ ] Performance: nenhuma animação causa jank (60fps target)

---

## FASE 4 — Componentes Ricos

**Status:** Aguardando Fase 3
**Esforço:** ~5-7h | **Risco:** Alto (integração de componentes externos) | **Dependências novas:** TBD

### Objetivo

Substituir inputs e seletores genéricos por componentes específicos que elevam a experiência em steps funcionais críticos.

### Pesquisa que o Claude deve fazer ao iniciar esta fase

```
mcp__shadcn__search_items_in_registries: "time picker", "carousel", "slider", "command"
mcp__shadcn__list_items_in_registries: todos os itens disponíveis
mcp__shadcn__view_items_in_registries: ver os mais relevantes
WebSearch: "shadcn time picker component 2024"
WebSearch: "react native-like time picker scroll drum"
WebSearch: "framer motion carousel swipe react"
WebSearch: "embla carousel react shadcn"
npm info embla-carousel-react (já instalado? verificar package.json)
```

### Componentes planejados por step

| Step | Componente Atual | Upgrade Planejado |
|------|-----------------|-------------------|
| S4 Wake/Sleep | Dois selects simples | Drum picker estilo iOS (scroll infinito) — ou time input elegante |
| S12 Journey | Cards em grid fixo | Embla carousel horizontal com snap + indicadores |
| S9 Routine Preview | Lista DnD simples | Drag handles mais expressivos com feedback visual |
| S14b Reminder Offset | Radio buttons customizados | Slider horizontal animado com stops fixos |
| S6 Life Areas | Grid de tags | Toggle chips animados com stagger entry |

### Embla Carousel para S12 (se já instalado)

```tsx
// Verificar: cat App/package.json | grep embla
// Se presente: usar useEmblaCarousel hook
// Journey cards: snap obrigatório, loop desabilitado, indicadores de posição
```

### Drum Picker (sem dep extra)

```tsx
// Scroll virtual com snap usando CSS scroll-snap
// Lista de horas 00-23 e minutos 00/15/30/45
// Efeito 3D com perspectiva CSS: rotateX nas bordas
```

### QA da Fase 4

- [ ] Nenhuma dep nova não-verificada adicionada
- [ ] Componentes funcionam em touch (mobile-first)
- [ ] Fallback para inputs padrão se componente falhar
- [ ] Acessibilidade: todos os campos têm label e aria
- [ ] Build sem erros | Bundle size delta < 20kb gzipped

---

## FASE 5 — QA & Acessibilidade

**Status:** Aguardando Fase 4
**Esforço:** ~2-3h | **Risco:** Baixo | **Dependências novas:** Nenhuma

### Objetivo

Garantir que toda a experiência seja acessível, performática e consistente em dark/light mode, mobile/tablet/desktop, e com `prefers-reduced-motion`.

### Pesquisa que o Claude deve fazer ao iniciar esta fase

```
Skill: example-skills:webapp-testing (Playwright para captura de screenshots em múltiplos viewports)
WebSearch: "WCAG 2.1 AA color contrast checker tool"
WebSearch: "framer motion prefers-reduced-motion best practices"
```

### Checklist de QA

#### Acessibilidade
- [ ] Todos os blobs têm `aria-hidden="true"`
- [ ] Gradient text tem fallback de cor (não apenas via background-clip)
- [ ] Contraste de texto > 4.5:1 em dark e light mode
- [ ] Tab order correto em todos os 22 steps
- [ ] Focus rings visíveis em todos os elementos interativos

#### Motion & Performance
- [ ] `@media (prefers-reduced-motion: reduce)` aplicado onde relevante
- [ ] Nenhuma animação usa `left`/`top` (sempre `transform`)
- [ ] Blobs não causam repaint contínuo (verificar com DevTools Paint Flashing)
- [ ] `will-change: transform` nos elementos animados pesados

#### Responsividade
- [ ] 375px (iPhone SE) — conteúdo não cortado
- [ ] 390px (iPhone 14) — layout ideal
- [ ] 768px (tablet) — centralizado com max-width
- [ ] Light mode — blobs visíveis e harmoniosos (may need opacity reduction)

#### Dark/Light Mode
- [ ] Blob colors legíveis em light mode (reduzir opacity para ~50% dos valores dark)
- [ ] Gradient text visível em light mode
- [ ] Glow cards harmoniosos em light mode

#### Build final
- [ ] `tsc --noEmit` — zero erros
- [ ] `vite build` — zero warnings relevantes
- [ ] Bundle size delta documentado (vs antes das fases)

---

## Sequência Recomendada de Execução

```
Fase 1 → Verificar → Fase 2 → Verificar → Fase 3 → Verificar → Fase 4 → Verificar → Fase 5
```

Cada fase começa com pesquisa, termina com build + QA. Não pular etapas.

---

## Notas de Arquitetura

- Novos componentes visuais (blobs, confetti, ilustrações) devem ficar em `App/src/components/onboarding-v2/`
- Evitar criar novos arquivos se extensão de existente resolve
- Qualquer nova dependência npm deve ser justificada com: tamanho, manutenção, alternativas consideradas
- SVG inline é sempre preferível a asset estático ou biblioteca de ícones adicional
- Imagens da internet: usar apenas via URL pública com fallback; nunca baixar para o repositório sem necessidade

---

*Última atualização: 2026-03-17*
*Fases planejadas com base na sessão de brainstorming — decisões confirmadas pelo usuário.*
