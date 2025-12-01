# FASE 10: Redesign do Onboarding - Brainstorm Completo

## 📋 Resumo Executivo

**Promessa Principal**: Entregar uma rotina personalizada pronta ao usuário
**Resultado Esperado**: Ao sair do onboarding, o usuário tem hábitos já configurados na Dashboard
**Experiência**: Fluida, simples, eficiente e premium

---

## 🔍 Análise do Estado Atual

### Problemas Identificados

1. **Gap Crítico**: Onboarding coleta dados mas NÃO cria hábitos
   - Usuário termina onboarding com Dashboard vazia
   - Dados coletados não são usados para recomendar nada

2. **Fluxo Atual (5 passos)**:
   - Step 1: About You (idade, diagnóstico TDAH, medicação)
   - Step 2: Challenges (desafios do dia-a-dia)
   - Step 3: Feelings (sentimentos/emoções)
   - Step 4: Preferences (período de energia)
   - Step 5: Stay Updated (notificações)

3. **Dados Coletados Não Utilizados**:
   - `energy_period`: morning/afternoon/evening → deveria definir período dos hábitos
   - `challenges`: procrastinação, foco, etc → deveria recomendar hábitos específicos
   - `onboarding_goals`: campo existe mas nunca é preenchido

4. **Premium Wall Bug**: Usuário precisa ser premium ANTES do onboarding

### Recursos Disponíveis

1. **60+ Templates de Hábitos** em 5 categorias:
   - Produtividade (12 hábitos)
   - Saúde/Fitness (15 hábitos)
   - Alimentação (10 hábitos)
   - Tempo/Rotina (8 hábitos)
   - Evitar (15 hábitos)

2. **API de Criação**: `createHabit()` em useHabits.tsx

3. **UI Components**:
   - Embla Carousel (swipe entre telas)
   - motion/react animations
   - LevelUpModal (reveal premium)
   - Glass morphism + gradients
   - Celebration system (particles, glow)

---

## 🎯 Proposta de Novo Fluxo (REVISADA)

### Conceito: "Jornada de Descoberta → Rotina Pronta"

O novo onboarding guia o usuário através de uma jornada de auto-descoberta que naturalmente resulta em uma rotina personalizada. Cada passo coleta informações E já mostra preview da rotina sendo construída.

### Princípios de UX
- **Esforço mental reduzido**: Perguntas simples, uma por tela, respostas visuais (cards, não texto)
- **Feedback constante**: Barra de progresso animada, micro-celebrações a cada resposta
- **Sensação de personalização**: "Estamos criando algo único para você"
- **Motion premium**: Transições suaves, elementos que respondem ao toque

---

## 📋 PERGUNTAS DE COLETA (6-8 perguntas)

### Dados Demográficos

| # | Pergunta | Opções | Impacto na Rotina |
|---|----------|--------|-------------------|
| 1 | **Faixa etária** | 18-24 / 25-34 / 35-44 / 45-54 / 55+ | Tom das mensagens, complexidade |
| 2 | **Situação profissional** | CLT / Autônomo / Empresário / Estudante / Aposentado | Horários disponíveis, stress |
| 3 | **Horário de trabalho** | Manhã (6-14h) / Comercial (8-18h) / Tarde/Noite (14-22h) / Flexível / Não trabalho | Janela de tempo para hábitos |

### Preferências Pessoais

| # | Pergunta | Opções | Impacto na Rotina |
|---|----------|--------|-------------------|
| 4 | **Momento de maior energia** | Manhã / Tarde / Noite | Período dos hábitos principais |
| 5 | **Quanto tempo disponível/dia?** | 15min / 30min / 1h / 2h+ | Quantidade e duração dos hábitos |
| 6 | **Seu maior objetivo agora** | Produtividade / Saúde / Bem-estar mental / Organização / Eliminar vícios | Categoria principal de hábitos |

### Desafios e Contexto

| # | Pergunta | Opções | Impacto na Rotina |
|---|----------|--------|-------------------|
| 7 | **Maiores desafios** | Procrastinar / Falta de foco / Esquecimentos / Cansaço / Ansiedade (multi) | Hábitos específicos para combater |
| 8 | **Dias da semana preferidos** | Seg-Sex / Seg-Dom / Personalizado | Frequência dos hábitos |

---

## 🧠 LÓGICA DE RECOMENDAÇÃO (Detalhada)

### Algoritmo em 4 Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 1: OBJETIVO PRINCIPAL (define 40% dos hábitos)          │
├─────────────────────────────────────────────────────────────────┤
│  Produtividade → Planejar dia, Pomodoro, Revisar objetivos      │
│  Saúde        → Exercício, Beber água, Alongar                  │
│  Bem-estar    → Meditar, Journaling, Gratidão                   │
│  Organização  → Rotina matinal, Organizar espaço, Listas        │
│  Eliminar     → Limite telas, Não procrastinar, Sono regulado   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 2: DESAFIOS (adiciona 30% - hábitos de suporte)         │
├─────────────────────────────────────────────────────────────────┤
│  Procrastinar  → Timer pomodoro, Regra dos 2min, Bloquear apps  │
│  Falta foco    → Meditação, Deep work, Ambiente limpo           │
│  Esquecimentos → Checklist diário, Revisar planos               │
│  Cansaço       → Sono 8h, Pausas, Exercício leve                │
│  Ansiedade     → Respiração, Journaling, Limitar notícias       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 3: TEMPO DISPONÍVEL (filtra quantidade)                 │
├─────────────────────────────────────────────────────────────────┤
│  15min/dia  → Máx 3 hábitos simples (binários)                  │
│  30min/dia  → Máx 5 hábitos (mix simples + curtos)              │
│  1h/dia     → Máx 7 hábitos (inclui 1-2 com timer)              │
│  2h+/dia    → Máx 10 hábitos (rotina completa)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 4: HORÁRIO DE TRABALHO (ajusta período)                 │
├─────────────────────────────────────────────────────────────────┤
│  Manhã (6-14h)     → Hábitos produtivos à tarde/noite           │
│  Comercial (8-18h) → Hábitos divididos manhã cedo + noite       │
│  Tarde/Noite       → Hábitos principais pela manhã              │
│  Flexível          → Usa "momento de energia" como guia         │
└─────────────────────────────────────────────────────────────────┘
```

### Exemplo de Cálculo

**Input do usuário:**
- Situação: CLT Comercial (8-18h)
- Energia: Manhã
- Tempo disponível: 30min
- Objetivo: Produtividade
- Desafios: Procrastinar, Falta de foco

**Output da recomendação:**
```
MANHÃ (antes do trabalho):
├── 06:30 - Acordar no horário ☀️
├── 06:45 - Planejar o dia (10min) 📋
└── 07:00 - Meditar (5min) 🧘

NOITE (após trabalho):
├── 19:00 - Revisar objetivos 🎯
└── 22:00 - Journaling (10min) ✍️

Total: 5 hábitos | ~30min/dia | Seg-Sex
```

---

## 📱 PREVIEW DA ROTINA (UX/UI Detalhada)

### Estrutura da Tela

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar                          Passo 5 de 8                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 62%                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ✨ Sua Rotina Personalizada                  │
│             "Criamos isso especialmente para você"              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📅 DIAS DA SEMANA                                       │    │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐             │    │
│  │  │Seg│ │Ter│ │Qua│ │Qui│ │Sex│ │Sáb│ │Dom│             │    │
│  │  │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │ ✓ │ │   │ │   │             │    │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ☀️ MANHÃ                                                │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ ⏰ 06:30  │ ☀️ Acordar no horário          [✓]  │    │    │
│  │  │ ⏰ 06:45  │ 📋 Planejar o dia (10min)      [✓]  │    │    │
│  │  │ ⏰ 07:00  │ 🧘 Meditar (5min)              [✓]  │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  │                                                          │    │
│  │  🌙 NOITE                                               │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │ ⏰ 19:00  │ 🎯 Revisar objetivos           [✓]  │    │    │
│  │  │ ⏰ 22:00  │ ✍️ Journaling (10min)          [✓]  │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ➕ Adicionar mais hábitos                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│              [ Confirmar Rotina →  ]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Interações Disponíveis

1. **Toggle de dias da semana**: Tap nos dias para ativar/desativar
2. **Toggle de hábito**: Checkbox para incluir/excluir da rotina
3. **Ajustar horário**: Tap no horário abre time picker
4. **Reordenar**: Long press + drag para mudar ordem
5. **Adicionar hábito**: Abre catálogo de hábitos (mesmo do CreateHabit)
6. **Remover hábito**: Swipe left para deletar

### Sistema de Horários (Time Slots)

**Problema**: Não sabemos os horários exatos de cada pessoa.

**Solução**: Sistema de "janelas sugeridas" baseado no horário de trabalho:

```typescript
interface TimeSlots {
  morning_start: string;   // Horário que acorda
  morning_end: string;     // Horário que sai para trabalho
  evening_start: string;   // Horário que chega do trabalho
  evening_end: string;     // Horário que vai dormir
}

// Exemplo para CLT Comercial (8-18h):
const CLT_COMERCIAL: TimeSlots = {
  morning_start: "06:00",
  morning_end: "07:30",
  evening_start: "19:00",
  evening_end: "23:00"
};

// Distribuição automática dos hábitos nas janelas
function distributeHabits(habits: Habit[], slots: TimeSlots) {
  const morningHabits = habits.filter(h => h.period === 'morning');
  const eveningHabits = habits.filter(h => h.period === 'evening');

  // Espaça igualmente dentro da janela
  distributeInTimeWindow(morningHabits, slots.morning_start, slots.morning_end);
  distributeInTimeWindow(eveningHabits, slots.evening_start, slots.evening_end);
}
```

### Pergunta Adicional (Opcional)

Para personalizar melhor os horários, adicionar uma tela:

```
┌─────────────────────────────────────────────────────────────────┐
│  "Qual seu horário típico?"                                     │
│                                                                 │
│  Acordo às:     ┌─────────┐                                     │
│                 │  06:30  │  ← Time picker                      │
│                 └─────────┘                                     │
│                                                                 │
│  Durmo às:      ┌─────────┐                                     │
│                 │  23:00  │  ← Time picker                      │
│                 └─────────┘                                     │
│                                                                 │
│  (Valores pré-preenchidos baseado no horário de trabalho)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 CONFIGURAÇÃO DE DIAS (Seg-Sex vs Seg-Dom)

### Opções na Tela de Dias

```
┌─────────────────────────────────────────────────────────────────┐
│  "Quando você quer praticar seus hábitos?"                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🏢 Dias úteis (Seg-Sex)                            [•] │    │
│  │  "Foco durante a semana de trabalho"                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  📅 Todos os dias (Seg-Dom)                         [ ] │    │
│  │  "Consistência 7 dias por semana"                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ✏️ Personalizado                                    [ ] │    │
│  │  "Escolher dias específicos"                             │    │
│  │                                                          │    │
│  │  (expande se selecionado)                               │    │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐             │    │
│  │  │Seg│ │Ter│ │Qua│ │Qui│ │Sex│ │Sáb│ │Dom│             │    │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Lógica para Fins de Semana

Se usuário escolher Seg-Dom, podemos oferecer:
- "Manter mesma rotina"
- "Rotina leve no fim de semana" (menos hábitos, horários relaxados)

---

### Estrutura FINAL Proposta (10 Telas)

```
┌─────────────────────────────────────────────────────────────────┐
│  TELA 1: WELCOME                                                │
│  "Sua jornada de transformação começa agora"                    │
│  • Animação premium de entrada (logo + particles)               │
│  • Breve intro da proposta de valor                             │
│  • CTA: "Vamos criar sua rotina" →                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 2: FAIXA ETÁRIA                                           │
│  "Para personalizar, conte-nos sobre você"                      │
│  • Cards visuais com faixas:                                    │
│    - 18-24 | 25-34 | 35-44 | 45-54 | 55+                       │
│  • Single select                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 3: SITUAÇÃO PROFISSIONAL                                  │
│  "Qual sua rotina de trabalho?"                                 │
│  • Cards com ícones:                                            │
│    - 💼 CLT (empregado)                                         │
│    - 🏠 Autônomo/Freelancer                                     │
│    - 🏢 Empresário                                              │
│    - 📚 Estudante                                               │
│    - 🌴 Aposentado/Não trabalho                                 │
│  • Single select                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 4: HORÁRIO DE TRABALHO                                    │
│  "Em qual período você trabalha/estuda?"                        │
│  (Condicional: só aparece se não for aposentado)                │
│  • Cards visuais com sol/lua:                                   │
│    - ☀️ Manhã (6h-14h)                                          │
│    - 🌤️ Comercial (8h-18h)                                      │
│    - 🌙 Tarde/Noite (14h-22h)                                   │
│    - 🔄 Flexível                                                │
│  • Single select                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 5: TEMPO DISPONÍVEL                                       │
│  "Quanto tempo você pode dedicar por dia?"                      │
│  • Slider visual ou cards:                                      │
│    - ⚡ 15 minutos (rotina express)                             │
│    - ⏱️ 30 minutos (rotina equilibrada)                         │
│    - 🕐 1 hora (rotina completa)                                │
│    - 🕑 2+ horas (rotina avançada)                              │
│  • Single select                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 6: OBJETIVO PRINCIPAL                                     │
│  "O que você quer conquistar?"                                  │
│  • Cards visuais grandes com ilustração:                        │
│    - 🎯 Ser mais produtivo                                      │
│    - 💪 Melhorar saúde física                                   │
│    - 🧘 Ter mais equilíbrio mental                              │
│    - ⏰ Organizar minha rotina                                  │
│    - 🚫 Eliminar maus hábitos                                   │
│  • Single select (objetivo PRINCIPAL)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 7: SEUS DESAFIOS                                          │
│  "O que mais te atrapalha hoje?"                                │
│  • Cards com desafios (multi-select até 3):                     │
│    - 📱 Procrastinação                                          │
│    - 🧠 Falta de foco                                           │
│    - 📝 Esquecimentos                                           │
│    - 😴 Cansaço/Baixa energia                                   │
│    - 😰 Ansiedade/Estresse                                      │
│  • Multi-select (até 3)                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 8: DIAS DA SEMANA                                         │
│  "Quando você quer praticar?"                                   │
│  • 3 opções principais:                                         │
│    - 🏢 Dias úteis (Seg-Sex)                                    │
│    - 📅 Todos os dias (Seg-Dom)                                 │
│    - ✏️ Personalizado → expande seletor de dias                │
│  • Toggle visual para cada dia                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 9: PREVIEW DA ROTINA (KEY MOMENT!) ⭐                     │
│  "Sua rotina personalizada"                                     │
│  • Seletor de dias no topo (já preenchido)                      │
│  • Timeline visual dividida por período (Manhã/Noite)           │
│  • Cada hábito mostra:                                          │
│    - Horário sugerido (editável via tap)                        │
│    - Emoji + Nome                                               │
│    - Toggle checkbox para incluir/excluir                       │
│  • Swipe left para remover hábito                               │
│  • Botão "➕ Adicionar mais hábitos" (abre catálogo)            │
│  • CTA: "Confirmar Rotina"                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TELA 10: CELEBRATION / COMPLETE                                │
│  "Sua rotina está pronta! 🎉"                                   │
│  • Animação de celebração (confetti, glow, haptic)              │
│  • Resumo visual:                                               │
│    - "X hábitos criados"                                        │
│    - "Dias: Seg-Sex"                                            │
│    - "+50 XP de boas-vindas"                                    │
│  • Teaser de gamificação:                                       │
│    - "Complete hábitos → Ganhe XP → Suba de nível"              │
│    - Preview visual Bronze → Diamante                           │
│  • CTA: "Começar agora" → Dashboard                             │
│  • (Notificações: perguntar nessa tela ou após primeiro hábito) │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design & UI/UX (Premium)

### Padrões Visuais

1. **Background**: Gradiente radial escuro com noise sutil
2. **Cards**: Glass morphism com `backdrop-blur-xl` e borda glow
3. **Progress**: Barra animada com glow que pulsa
4. **Transições**: Slide + fade horizontal (Embla Carousel)
5. **Ilustrações**: Podem ser mockups/emojis enquanto não há arte final

### Componentes Base

```typescript
// Estrutura do Onboarding
<OnboardingProvider>
  <Carousel opts={{ watchDrag: false }}>
    <CarouselContent>
      {steps.map((step, i) => (
        <CarouselItem key={i}>
          <OnboardingStep step={step} />
        </CarouselItem>
      ))}
    </CarouselContent>
  </Carousel>

  <OnboardingProgress current={step} total={10} />
  <OnboardingNavigation onNext={next} onBack={back} />
</OnboardingProvider>
```

### Progress Indicator (Animado)

```typescript
// Barra de progresso com glow
<div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-lime-400 to-lime-500 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${(current / total) * 100}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
  <motion.div
    className="absolute inset-0 bg-lime-400/50 blur-sm"
    initial={{ width: 0 }}
    animate={{ width: `${(current / total) * 100}%` }}
  />
</div>
```

### Selection Cards (Com Feedback Tátil)

```typescript
// Card de seleção com animação premium
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  animate={selected ? {
    borderColor: "rgb(163, 230, 53)", // lime-400
    boxShadow: "0 0 20px rgba(163, 230, 53, 0.3)"
  } : {}}
  onClick={() => {
    haptics.selection(); // Feedback tátil
    onSelect(value);
  }}
  className={cn(
    "p-4 rounded-2xl border-2 backdrop-blur-xl",
    "bg-white/5 dark:bg-black/20",
    "transition-all duration-300",
    selected
      ? "border-lime-400 bg-lime-400/10"
      : "border-white/10 hover:border-white/20"
  )}
>
  <span className="text-3xl mb-2">{emoji}</span>
  <span className="font-semibold text-foreground">{label}</span>
  {description && (
    <span className="text-sm text-muted-foreground">{description}</span>
  )}
</motion.button>
```

### Animações por Tela

```typescript
// Animações de entrada (staggered)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// Uso
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.h1 variants={itemVariants}>Título</motion.h1>
  <motion.p variants={itemVariants}>Subtítulo</motion.p>
  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
    {options.map(opt => <SelectionCard key={opt.id} {...opt} />)}
  </motion.div>
</motion.div>
```

### Micro-Interações

| Ação | Animação | Haptic |
|------|----------|--------|
| Selecionar opção | Scale 0.98 + glow border | `selection()` |
| Avançar tela | Slide left + fade | `light()` |
| Voltar tela | Slide right | - |
| Completar seção | Check mark + pulse | `success()` |
| Preview rotina | Cards entram em stagger | `medium()` |
| Celebration final | Confetti + glow + counter | `success()` x3 |

### Transição Entre Telas

```typescript
// Slide horizontal suave (Embla)
const slideTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// Ou usando CSS
.carousel-item {
  transform: translateX(var(--offset));
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Celebration Final (Tela 10)

```typescript
// Confetti + animação de XP
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.6, ease: "backOut" }}
>
  <Confetti
    numberOfPieces={200}
    recycle={false}
    colors={["#A3E635", "#22C55E", "#FACC15"]}
  />

  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 0.3, type: "spring" }}
    className="text-6xl mb-4"
  >
    🎉
  </motion.div>

  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    Sua rotina está pronta!
  </motion.h1>

  {/* Counter de XP animado */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8 }}
    className="flex items-center gap-2 text-lime-400"
  >
    <Sparkles />
    <AnimatedCounter from={0} to={50} duration={1.5} />
    <span>XP de boas-vindas!</span>
  </motion.div>
</motion.div>
```

---

## 📱 Fluxo Técnico (Atualizado)

### Arquivos a Criar/Modificar

**Modificar:**
- `App/src/pages/OnboardingFlow.tsx` - Reescrever completamente

**Criar:**
- `App/src/data/onboardingConfig.ts` - Configurações e mapeamentos
- `App/src/hooks/useOnboarding.ts` - Estado e lógica de recomendação
- `App/src/components/onboarding/` - Componentes do onboarding:

```
App/src/components/onboarding/
├── index.ts                    # Re-exports
├── OnboardingProvider.tsx      # Context + estado global
├── OnboardingProgress.tsx      # Barra de progresso animada
├── OnboardingNavigation.tsx    # Botões Next/Back
├── SelectionCard.tsx           # Card de seleção reutilizável
├── steps/
│   ├── WelcomeStep.tsx
│   ├── AgeStep.tsx
│   ├── ProfessionStep.tsx
│   ├── WorkScheduleStep.tsx
│   ├── TimeAvailableStep.tsx
│   ├── ObjectiveStep.tsx
│   ├── ChallengesStep.tsx
│   ├── WeekDaysStep.tsx
│   ├── RoutinePreviewStep.tsx  # Tela mais complexa
│   └── CelebrationStep.tsx
└── routine-preview/
    ├── RoutineTimeline.tsx     # Timeline visual dos hábitos
    ├── HabitPreviewCard.tsx    # Card de cada hábito
    ├── TimePickerSheet.tsx     # Bottom sheet para editar horário
    └── AddHabitSheet.tsx       # Bottom sheet para adicionar hábito
```

### Schema do Estado (Expandido)

```typescript
interface OnboardingState {
  // Navegação
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;

  // Dados demográficos
  ageRange: '18-24' | '25-34' | '35-44' | '45-54' | '55+' | null;
  profession: 'clt' | 'freelancer' | 'entrepreneur' | 'student' | 'retired' | null;
  workSchedule: 'morning' | 'commercial' | 'evening' | 'flexible' | null;

  // Preferências
  timeAvailable: '15min' | '30min' | '1h' | '2h+' | null;
  objective: 'productivity' | 'health' | 'mental' | 'routine' | 'avoid' | null;
  challenges: string[];  // Até 3 seleções

  // Configuração da rotina
  weekDays: number[];    // [1,2,3,4,5] ou [0,1,2,3,4,5,6]
  weekDaysPreset: 'weekdays' | 'everyday' | 'custom';

  // Hábitos recomendados
  recommendedHabits: RecommendedHabit[];
  selectedHabitIds: Set<string>;

  // Status
  isGeneratingRoutine: boolean;
  isSubmitting: boolean;
}

interface RecommendedHabit {
  id: string;
  templateId: string;
  name: string;
  emoji: string;
  period: 'morning' | 'afternoon' | 'evening';
  suggestedTime: string;  // "06:30"
  duration?: number;      // Em minutos, se aplicável
  isSelected: boolean;
  order: number;
}
```

### Fluxo de Criação de Hábitos (Detalhado)

```typescript
// Hook: useOnboarding.ts
const completeOnboarding = async () => {
  setIsSubmitting(true);

  try {
    // 1. Filtrar apenas hábitos selecionados
    const habitsToCreate = state.recommendedHabits
      .filter(h => state.selectedHabitIds.has(h.id))
      .sort((a, b) => a.order - b.order);

    // 2. Criar cada hábito com horário personalizado
    for (const habit of habitsToCreate) {
      const template = getHabitTemplate(habit.templateId);

      await createHabit({
        name: template.name,
        emoji: template.emoji || "✨",
        category: template.category,
        period: habit.period,
        days_of_week: state.weekDays,
        frequency_type: template.default_frequency_type || "daily",
        goal_value: template.default_goal_value,
        unit: template.default_unit || "none",
        notification_pref: {
          reminder_enabled: true,
          reminder_time: habit.suggestedTime,
          sound: "default"
        }
      });
    }

    // 3. Salvar perfil com respostas do onboarding
    await updateProfile({
      onboarding_completed: true,
      age_range: state.ageRange,
      profession: state.profession,
      work_schedule: state.workSchedule,
      time_available: state.timeAvailable,
      primary_objective: state.objective,
      challenges: state.challenges,
      preferred_days: state.weekDays
    });

    // 4. Dar XP de boas-vindas
    if (userId) {
      await addXP({
        amount: 50,
        reason: "welcome_bonus",
        metadata: { source: "onboarding_complete" }
      });
    }

    // 5. Trigger celebração
    haptics.success();
    celebrations.onboardingComplete();

    // 6. Navegar para Dashboard
    navigate('/dashboard');

  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    toast.error("Erro ao criar rotina. Tente novamente.");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## ✅ Checklist de Implementação (Atualizado)

### Sprint 1: Estrutura Base (~2h)
- [ ] Criar `OnboardingProvider` com Context
- [ ] Criar `useOnboarding` hook com estado completo
- [ ] Implementar Carousel com Embla
- [ ] Criar `OnboardingProgress` animado
- [ ] Criar `OnboardingNavigation` (Next/Back)
- [ ] Criar `SelectionCard` reutilizável

### Sprint 2: Telas de Coleta (~3h)
- [ ] Tela 1: Welcome (animação de entrada)
- [ ] Tela 2: Faixa etária (cards)
- [ ] Tela 3: Situação profissional (cards)
- [ ] Tela 4: Horário de trabalho (condicional)
- [ ] Tela 5: Tempo disponível (cards)
- [ ] Tela 6: Objetivo principal (cards grandes)
- [ ] Tela 7: Desafios (multi-select)
- [ ] Tela 8: Dias da semana (preset + custom)

### Sprint 3: Algoritmo de Recomendação (~2h)
- [ ] Criar `onboardingConfig.ts` com mapeamentos
- [ ] Implementar `generateRoutine()` com 4 camadas
- [ ] Criar `getTimeSlots()` baseado no horário de trabalho
- [ ] Distribuir hábitos nas janelas de tempo

### Sprint 4: Preview da Rotina (~4h) ⭐
- [ ] Criar `RoutineTimeline` com períodos (Manhã/Noite)
- [ ] Criar `HabitPreviewCard` com toggle
- [ ] Criar `TimePickerSheet` para editar horário
- [ ] Criar `AddHabitSheet` (catálogo simplificado)
- [ ] Implementar drag-to-reorder
- [ ] Implementar swipe-to-delete

### Sprint 5: Finalização (~2h)
- [ ] Tela 10: Celebration (confetti + XP)
- [ ] Integrar `createHabit()` em batch
- [ ] Salvar respostas no perfil
- [ ] Dar XP de boas-vindas

### Sprint 6: Polish (~2h)
- [ ] Animações de entrada (staggered)
- [ ] Micro-interações (glow, scale)
- [ ] Haptic feedback em todas as ações
- [ ] Loading states
- [ ] Error handling
- [ ] Testes manuais do fluxo completo

**Total estimado: ~15h de desenvolvimento**

---

## 🎯 Métricas de Sucesso

1. **Completion Rate**: >85% dos usuários completam onboarding
2. **Habit Creation**: 100% dos usuários saem com ≥3 hábitos
3. **Time to Complete**: <3 minutos
4. **First Day Retention**: >60% completam pelo menos 1 hábito no D0

---

## 📝 Próximos Passos

1. Validar proposta com stakeholders
2. Criar mockups/wireframes detalhados
3. Implementar estrutura base (Carousel + State)
4. Desenvolver telas sequencialmente
5. Integrar criação de hábitos
6. Testar fluxo completo
7. Iterar baseado em feedback

---

*Documento criado em: 26/11/2024*
*Status: Brainstorm/Proposta*
