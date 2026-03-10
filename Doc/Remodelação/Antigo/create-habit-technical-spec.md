# Especificação Técnica: Remodelagem da Criação de Hábitos

**COMPLIANCE CONFIRMADO**: Este documento reutiliza componentes existentes e estende a arquitetura atual.

## Índice
1. [Análise das Telas de Referência](#1-análise-das-telas-de-referência)
2. [Arquitetura e Estrutura](#2-arquitetura-e-estrutura)
3. [Sistema de Ícones](#3-sistema-de-ícones)
4. [Categorias e Tasks](#4-categorias-e-tasks)
5. [Componentes UI](#5-componentes-ui)
6. [Fluxo de Navegação](#6-fluxo-de-navegação)
7. [Implementação](#7-implementação)

---

## 1. Análise das Telas de Referência

### Tela 1: "Add Task" (Listagem de Health Tasks)
**Localização**: Imagem 1 - Screenshot iPhone com header "Add Task"

#### Elementos Identificados:
- **Header**:
  - Fundo preto (--background dark)
  - Título "Add Task" centralizado
  - Botão "X" no canto superior esquerdo para fechar
  - 5 ícones de categoria na parte superior (checkmark, apple, cutlery, timer, prohibition)

- **Descrição**:
  - Texto: "Health tasks are linked to the Health app and are automatically marked as complete when new data is recorded."
  - Cor: text-muted-foreground
  - Tamanho: text-sm

- **Seção "CREATE A HEALTH TASK"**:
  - Label em uppercase com tracking wide
  - Lista de cards verticais com:
    - Ícone circular verde lima à esquerda (bg-[#A3E635] aproximadamente)
    - Título do hábito em branco
    - Chevron right à direita
    - Separação de 8-12px entre cards
    - Radius: 16px
    - Padding: 16px

- **Health Tasks Listadas**:
  1. ♥ Walk or Run
  2. 🚴 Cycle
  3. 🏊 Swim
  4. ⏱️ Mindful Minutes
  5. 🪜 Climb Flights
  6. ⭕ Activity Rings
  7. ⏰ Stand Hours
  8. 🏃 Exercise Minutes
  9. 🔥 Burn Active Energy

### Tela 2: "Confirm Task" (Detalhes do Walk 5,000 Steps)
**Localização**: Imagem 2 - Screenshot iPhone com "WALK 5,000 STEPS"

#### Elementos Identificados:
- **Header**:
  - Título "Confirm Task" centralizado
  - Botão voltar (chevron left) no canto superior esquerdo
  - Fundo escuro

- **Hero Section**:
  - Círculo grande com stroke cinza (track)
  - Ícone de pessoa caminhando no centro (branco)
  - Badge verde lima no canto inferior direito do círculo ("+")
  - Abaixo: "♥ WALK 5,000 STEPS" em verde lima (--primary ou custom green)

- **Alerta Health Integration**:
  - Ícone de coração vermelho à esquerda
  - Texto: "This task uses data from the Health app. Please grant Streaks permission if prompted."
  - Background: bg-muted/60
  - Padding: 12px
  - Radius: 12px

- **Campo Título**:
  - Label: "TITLE:" (uppercase, tracking wide)
  - Input: "Automatic" (texto placeholder/pre-filled)
  - Character counter: "0 / 18"
  - Background: bg-muted
  - Radius: 12px

- **Cards de Configuração** (3 cards):
  1. **Goal**:
     - Ícone gráfico verde lima
     - Título "Goal"
     - Valor à direita: "5,000 Steps >"
     - Chevron right

  2. **Task Days**:
     - Ícone calendário verde lima
     - Título "Task Days"
     - Valor à direita: "Every Day >"
     - Chevron right

  3. **Notifications**:
     - Ícone sino verde lima
     - Título "Notifications"
     - Chevron right (sem valor à direita)

- **CTA Button**:
  - Texto: "SAVE TASK"
  - Background: verde lima (#A3E635)
  - Cor do texto: preto/dark
  - Width: full
  - Height: 48-52px
  - Radius: 12px
  - Position: sticky bottom com padding 16px

---

## 2. Arquitetura e Estrutura

### 2.1 Reutilização de Código Existente

**Arquivo Base**: [CreateHabit.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx)

#### O que já está implementado e será REUTILIZADO:
- ✅ Estrutura de 3 steps (category → templates → details)
- ✅ Sistema de categorias com CATEGORY_DATA
- ✅ Sistema de ícones via HabitIcons.tsx
- ✅ Componentes UI: Button, Card, Input, Label
- ✅ AnimatePresence e motion para transições
- ✅ Hooks: useHabits, useHabitCatalog, useToast
- ✅ Validação de campos
- ✅ Estado de loading (isSaving)

#### O que será MODIFICADO:
1. **Popup Modal**: Transformar o container em modal fullscreen
2. **Header**: Simplificar para apenas "X" + título
3. **Ícones de Categoria**: Adicionar ícones nos top tabs (Step 1)
4. **Visual Identity**: Ajustar cores para verde lima (#A3E635) como primary
5. **Cards de Detalhes**: Redesenhar com ícones à esquerda + chevron à direita
6. **Hero Circle**: Adicionar circle stroke effect no Step 3

### 2.2 Estrutura de Modal

```tsx
// Estrutura atual (linha 793-804)
<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm">
  <div className="mt-4 w-full max-w-md overflow-hidden rounded-3xl bg-background shadow-[var(--shadow-strong)] animate-fade-in">
    {HeaderBar}
    <AnimatePresence mode="wait">
      {/* steps */}
    </AnimatePresence>
  </div>
</div>
```

**Ajuste necessário**: Adicionar `min-h-screen` e remover `mt-4` para fullscreen em mobile.

---

## 3. Sistema de Ícones

### 3.1 Ícones Existentes (HabitIcons.tsx)

**Arquivo**: [HabitIcons.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\components\icons\HabitIcons.tsx:1-127)

✅ **Ícones já implementados**:
- run (corrida/caminhada)
- cycle (pedalar)
- swim (nadar)
- stairs (subir escadas)
- meditate (meditação)
- journal (diário)
- gratitude (gratidão/coração)
- meal (refeição)
- water (água)
- no_fast_food (evitar fast food)
- sleep (sono/lua)
- no_screens (sem telas)
- plan (planejamento)
- deep_work (trabalho focado)
- call_family (ligar família)
- detox (detox digital)
- heart (coração)

### 3.2 Ícones Adicionais Necessários

Baseado na análise das telas de referência, precisamos adicionar:

1. **Activity Rings** (anéis de atividade)
2. **Stand Hours** (horas em pé)
3. **Exercise Minutes** (minutos de exercício)
4. **Burn Active Energy** (queimar energia)
5. **Mindful Minutes** (já existe como "meditate")
6. **Climb Flights** (já existe como "stairs")

#### Implementação de Novos Ícones

```tsx
// Adicionar em HabitIcons.tsx

export type HabitIconKey =
  | "run"
  | "cycle"
  | "swim"
  | "stairs"
  | "meditate"
  | "journal"
  | "gratitude"
  | "meal"
  | "water"
  | "no_fast_food"
  | "sleep"
  | "no_screens"
  | "plan"
  | "deep_work"
  | "call_family"
  | "detox"
  | "heart"
  | "activity_rings"     // NOVO
  | "stand_hours"        // NOVO
  | "exercise_minutes"   // NOVO
  | "burn_energy";       // NOVO

// Adicionar no objeto HabitIcons:
activity_rings: createIcon([
  <circle key="1" cx="12" cy="12" r="8" strokeWidth="2.5" />,
  <circle key="2" cx="12" cy="12" r="5" strokeWidth="2.5" />,
  <circle key="3" cx="12" cy="12" r="2" strokeWidth="2.5" />,
]),
stand_hours: createIcon([
  <path key="1" d="M12 2v4" />,
  <path key="2" d="M12 18v4" />,
  <circle key="3" cx="12" cy="12" r="4" />,
  <path key="4" d="M9 16l-3 3" />,
  <path key="5" d="M15 16l3 3" />,
]),
exercise_minutes: createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <path key="2" d="M12 6v6l4 2" />,
]),
burn_energy: createIcon([
  <path key="1" d="M8.5 14.5a2.5 2.5 0 0 0 0-5l5-5a2.5 2.5 0 0 1 0 5l-5 5Z" />,
  <path key="2" d="M16 16 12 20l-4-4" />,
]),
```

### 3.3 Paleta de Cores dos Ícones

Baseado na análise das telas de referência e identidade visual:

```css
/* Cor principal dos ícones (verde lima) */
--icon-primary: #A3E635; /* Verde lima vibrante */
--icon-primary-bg: rgba(163, 230, 53, 0.15); /* Background 15% opacity */

/* Cores secundárias por categoria */
--category-movement: #A3E635;  /* Verde lima */
--category-mind: #60A5FA;      /* Azul */
--category-nutrition: #FB923C; /* Laranja */
--category-sleep: #A78BFA;     /* Roxo */
--category-productivity: #FBBF24; /* Amarelo */
--category-personal: #F472B6;  /* Rosa */
```

**Consistência Visual**:
- Stroke width: 2.2px (já definido em HabitIcons.tsx:25)
- Rounded corners: strokeLinecap="round"
- Smooth joins: strokeLinejoin="round"
- Circle backgrounds: 44px diameter em mobile
- Padding interno: 12px

---

## 4. Categorias e Tasks

### 4.1 Estrutura de Categorias (6 Categorias)

**Referência**: Baseado em CATEGORY_DATA existente ([CreateHabit.tsx:40-130](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx:40-130))

#### Categoria 1: Movimento
```typescript
{
  id: "movement",
  name: "Movimento",
  description: "Caminhadas, corridas e mobilidade",
  iconKey: "run",
  colorToken: "#A3E635", // Verde lima
  tasks: [
    {
      id: "walk_run",
      name: "Walk or Run",
      iconKey: "run",
      default_goal_value: 5000,
      default_unit: "steps",
      default_frequency_type: "daily",
      auto_complete_source: "health", // Integração com Health App
    },
    {
      id: "cycle",
      name: "Cycle",
      iconKey: "cycle",
      default_goal_value: 5,
      default_unit: "km",
      default_frequency_type: "times_per_week",
      default_times_per_week: 3,
    },
    {
      id: "swim",
      name: "Swim",
      iconKey: "swim",
      default_goal_value: 30,
      default_unit: "minutes",
      default_frequency_type: "times_per_week",
      default_times_per_week: 2,
    },
    {
      id: "mindful_minutes",
      name: "Mindful Minutes",
      iconKey: "meditate",
      default_goal_value: 10,
      default_unit: "minutes",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "climb_flights",
      name: "Climb Flights",
      iconKey: "stairs",
      default_goal_value: 20,
      default_unit: "flights",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "activity_rings",
      name: "Activity Rings",
      iconKey: "activity_rings",
      default_unit: "none",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "stand_hours",
      name: "Stand Hours",
      iconKey: "stand_hours",
      default_goal_value: 12,
      default_unit: "hours",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "exercise_minutes",
      name: "Exercise Minutes",
      iconKey: "exercise_minutes",
      default_goal_value: 30,
      default_unit: "minutes",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "burn_energy",
      name: "Burn Active Energy",
      iconKey: "burn_energy",
      default_goal_value: 500,
      default_unit: "kcal",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
  ],
}
```

#### Categoria 2: Mente
```typescript
{
  id: "mind",
  name: "Mente",
  description: "Mindfulness, foco e clareza",
  iconKey: "meditate",
  colorToken: "#60A5FA", // Azul
  tasks: [
    {
      id: "meditate",
      name: "Meditate",
      iconKey: "meditate",
      default_goal_value: 10,
      default_unit: "minutes",
      default_frequency_type: "daily",
    },
    {
      id: "journal",
      name: "Journal",
      iconKey: "journal",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 3,
    },
    {
      id: "gratitude",
      name: "Gratitude Notes",
      iconKey: "gratitude",
      default_unit: "none",
      default_frequency_type: "daily",
    },
    {
      id: "read",
      name: "Read",
      iconKey: "journal", // Reutilizar ícone de journal
      default_goal_value: 20,
      default_unit: "minutes",
      default_frequency_type: "daily",
    },
  ],
}
```

#### Categoria 3: Nutrição
```typescript
{
  id: "nutrition",
  name: "Nutrição",
  description: "Alimentação equilibrada e hidratação",
  iconKey: "meal",
  colorToken: "#FB923C", // Laranja
  tasks: [
    {
      id: "healthy_meal",
      name: "Healthy Meal",
      iconKey: "meal",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 7,
    },
    {
      id: "drink_water",
      name: "Drink Water",
      iconKey: "water",
      default_goal_value: 8,
      default_unit: "glasses",
      default_frequency_type: "daily",
    },
    {
      id: "no_fast_food",
      name: "Avoid Fast Food",
      iconKey: "no_fast_food",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 5,
    },
    {
      id: "meal_prep",
      name: "Meal Prep",
      iconKey: "meal",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 2,
    },
  ],
}
```

#### Categoria 4: Sono/Recuperação
```typescript
{
  id: "sleep",
  name: "Sono",
  description: "Descanso e recuperação",
  iconKey: "sleep",
  colorToken: "#A78BFA", // Roxo
  tasks: [
    {
      id: "sleep_hours",
      name: "Sleep 8h",
      iconKey: "sleep",
      default_goal_value: 8,
      default_unit: "hours",
      default_frequency_type: "daily",
      auto_complete_source: "health",
    },
    {
      id: "no_screens_bed",
      name: "No screens before bed",
      iconKey: "no_screens",
      default_unit: "none",
      default_frequency_type: "daily",
    },
    {
      id: "bedtime_routine",
      name: "Bedtime Routine",
      iconKey: "sleep",
      default_unit: "none",
      default_frequency_type: "daily",
    },
  ],
}
```

#### Categoria 5: Produtividade
```typescript
{
  id: "productivity",
  name: "Produtividade",
  description: "Prioridades, foco e execução",
  iconKey: "plan",
  colorToken: "#FBBF24", // Amarelo
  tasks: [
    {
      id: "daily_plan",
      name: "Daily Plan",
      iconKey: "plan",
      default_unit: "none",
      default_frequency_type: "daily",
    },
    {
      id: "deep_work",
      name: "Deep Work",
      iconKey: "deep_work",
      default_goal_value: 60,
      default_unit: "minutes",
      default_frequency_type: "times_per_week",
      default_times_per_week: 4,
    },
    {
      id: "inbox_zero",
      name: "Inbox Zero",
      iconKey: "plan",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 5,
    },
  ],
}
```

#### Categoria 6: Pessoal/Social
```typescript
{
  id: "personal",
  name: "Pessoal",
  description: "Relacionamentos e bem-estar",
  iconKey: "heart",
  colorToken: "#F472B6", // Rosa
  tasks: [
    {
      id: "call_family",
      name: "Call Family",
      iconKey: "call_family",
      default_unit: "none",
      default_frequency_type: "times_per_week",
      default_times_per_week: 2,
    },
    {
      id: "digital_detox",
      name: "Digital Detox",
      iconKey: "detox",
      default_goal_value: 30,
      default_unit: "minutes",
      default_frequency_type: "daily",
    },
    {
      id: "quality_time",
      name: "Quality Time",
      iconKey: "heart",
      default_goal_value: 60,
      default_unit: "minutes",
      default_frequency_type: "times_per_week",
      default_times_per_week: 3,
    },
  ],
}
```

### 4.2 Mapeamento de Units

```typescript
type UnitType =
  | "none"          // Sem unidade (checkboxes simples)
  | "steps"         // Passos
  | "minutes"       // Minutos
  | "hours"         // Horas
  | "km"            // Quilômetros
  | "glasses"       // Copos (água)
  | "flights"       // Lances de escada
  | "kcal"          // Calorias
  | "custom";       // Customizado (usuário define)

// Labels para display
const UNIT_LABELS: Record<UnitType, string> = {
  none: "",
  steps: "Steps",
  minutes: "Minutes",
  hours: "Hours",
  km: "km",
  glasses: "Glasses",
  flights: "Flights",
  kcal: "kcal",
  custom: "",
};
```

---

## 5. Componentes UI

### 5.1 Componentes Shadcn UI Disponíveis

Baseado na lista de componentes Shadcn disponíveis, utilizaremos:

- ✅ **button**: Para CTAs e ações
- ✅ **card**: Para containers de categorias e tasks
- ✅ **input**: Para campos de texto
- ✅ **label**: Para labels de formulário
- ✅ **badge**: Para badges de auto-complete
- ✅ **dialog**: Base para modal (se necessário)
- ✅ **separator**: Para divisores sutis
- ✅ **switch**: Para toggles de notificações

### 5.2 Card de Categoria (Step 1)

**Referência**: [CreateHabit.tsx:458-476](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx:458-476)

```tsx
<button
  onClick={() => handleSelectCategory(cat)}
  className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card px-5 py-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
>
  <div
    className="flex h-14 w-14 items-center justify-center rounded-full"
    style={{ backgroundColor: `${cat.colorToken}20` }}
  >
    <Icon
      className="h-7 w-7"
      style={{ color: cat.colorToken }}
    />
  </div>
  <div>
    <p className="text-base font-semibold">{cat.name}</p>
    <p className="text-xs text-muted-foreground leading-relaxed">
      {cat.description}
    </p>
  </div>
</button>
```

**Mudanças em relação ao código atual**:
1. ✅ Aumentar padding de `px-4 py-4` para `px-5 py-5`
2. ✅ Aumentar tamanho do círculo de ícone de `h-12 w-12` para `h-14 w-14`
3. ✅ Aumentar tamanho do ícone de `h-5 w-5` para `h-7 w-7`
4. ✅ Usar cores dinâmicas via `style` com `colorToken`
5. ✅ Adicionar `leading-relaxed` na descrição

### 5.3 Card de Task (Step 2)

**Referência**: [CreateHabit.tsx:520-548](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx:520-548)

```tsx
<button
  onClick={() => handleSelectTemplate(tpl)}
  className={`flex items-center justify-between rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
    selectedTemplateId === tpl.id
      ? "border-primary bg-primary/10"
      : "border-border/60 bg-card"
  }`}
>
  <div className="flex items-center gap-3">
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: `${categoryColor}20` }}
    >
      <Icon
        className="h-6 w-6"
        style={{ color: categoryColor }}
      />
    </div>
    <div className="text-left">
      <p className="font-semibold text-base">{tpl.name}</p>
      {tpl.default_frequency_type && (
        <p className="text-xs text-muted-foreground">
          {renderFrequencyLabel(tpl)}
        </p>
      )}
    </div>
  </div>
  <ChevronRight className="h-5 w-5 text-muted-foreground" />
</button>
```

**Mudanças**:
1. ✅ Usar cor da categoria via `style` prop
2. ✅ Aumentar ícone de `h-5 w-5` para `h-6 w-6`
3. ✅ Adicionar subtítulo com frequência
4. ✅ Chevron right com tamanho `h-5 w-5`

### 5.4 Hero Circle (Step 3)

**Referência**: [CreateHabit.tsx:592-600](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx:592-600)

```tsx
<div className="flex flex-col items-center gap-4 py-6">
  {/* Outer circle with stroke */}
  <div className="relative flex h-32 w-32 items-center justify-center">
    {/* Gray track circle */}
    <div className="absolute inset-0 rounded-full border-[6px] border-muted" />

    {/* Colored progress arc */}
    <div
      className="absolute inset-0 rounded-full border-[6px] border-transparent"
      style={{
        borderTopColor: categoryColor,
        borderRightColor: categoryColor,
        transform: 'rotate(-90deg)',
      }}
    />

    {/* Icon container */}
    <div
      className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-inner"
      style={{
        backgroundColor: `${categoryColor}10`,
        borderColor: categoryColor,
        borderWidth: '2px'
      }}
    >
      <Icon
        className="h-10 w-10"
        style={{ color: categoryColor }}
      />
    </div>

    {/* Plus badge (optional for auto tasks) */}
    {isAutoTask && (
      <div
        className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
        style={{ backgroundColor: categoryColor }}
      >
        <span className="text-lg font-bold text-black">+</span>
      </div>
    )}
  </div>

  {/* Task title */}
  <div className="text-center">
    <p
      className="text-xl font-bold uppercase tracking-wider"
      style={{ color: categoryColor }}
    >
      {habitName || "NOME DO HÁBITO"}
    </p>
  </div>
</div>
```

**Elementos**:
1. ✅ Circle track cinza (border-muted)
2. ✅ Circle progress colorido (3/4 do círculo)
3. ✅ Ícone central grande (h-10 w-10)
4. ✅ Badge "+" para tasks automáticas
5. ✅ Título em uppercase com cor da categoria

### 5.5 Alert de Health Integration

```tsx
{isAutoTask && (
  <div className="mx-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
    <div className="flex-shrink-0">
      <svg
        className="h-5 w-5 text-red-600 dark:text-red-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM10 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      </svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900 dark:text-red-200">
        This task uses data from the Health app.
      </p>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300">
        Please grant Streaks permission if prompted.
      </p>
    </div>
  </div>
)}
```

### 5.6 Configuration Cards (Step 3)

**Referência**: [CreateHabit.tsx:612-654](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx:612-654)

```tsx
{/* Goal Card */}
<div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
  <button
    type="button"
    className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
    onClick={() => setExpandedCard('goal')}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <Icon
          className="h-6 w-6"
          style={{ color: categoryColor }}
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Goal
        </p>
        <p className="text-base font-semibold">
          {goalValue ? `${goalValue} ${UNIT_LABELS[unit]}` : "Set goal"}
        </p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </button>

  {/* Expanded content (opcional) */}
  {expandedCard === 'goal' && (
    <div className="border-t border-border/60 bg-muted/20 px-4 py-4">
      {/* Goal input fields */}
    </div>
  )}
</div>

{/* Task Days Card */}
<div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
  <button
    type="button"
    className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
    onClick={() => setExpandedCard('frequency')}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <CalendarIcon
          className="h-6 w-6"
          style={{ color: categoryColor }}
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Task Days
        </p>
        <p className="text-base font-semibold">
          {renderFrequencyLabel()}
        </p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </button>
</div>

{/* Notifications Card */}
<div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
  <button
    type="button"
    className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
    onClick={() => setExpandedCard('notifications')}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <BellIcon
          className="h-6 w-6"
          style={{ color: categoryColor }}
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Notifications
        </p>
        <p className="text-base font-semibold">
          {notificationsEnabled ? "Enabled" : "Disabled"}
        </p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
  </button>
</div>
```

**Características**:
1. ✅ Ícone circular à esquerda com cor da categoria
2. ✅ Label em uppercase (text-xs, tracking-wider)
3. ✅ Valor em font-semibold (text-base)
4. ✅ Chevron right à direita
5. ✅ Hover state com bg-muted/40
6. ✅ Conteúdo expansível (opcional)

### 5.7 CTA Button

```tsx
<div className="px-4 pb-6 pt-4">
  <Button
    className="h-14 w-full rounded-xl text-base font-bold uppercase tracking-wide shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
    style={{
      backgroundColor: categoryColor,
      color: '#000000', // Texto preto para contraste com verde lima
    }}
    disabled={!habitName.trim() || isSaving}
    onClick={handleSave}
  >
    {isSaving ? "SAVING..." : "SAVE TASK"}
  </Button>
</div>
```

**Características**:
1. ✅ Background com cor da categoria
2. ✅ Texto em uppercase e bold
3. ✅ Height: 56px (h-14)
4. ✅ Sombra forte (shadow-lg)
5. ✅ Hover scale effect
6. ✅ Texto preto para contraste

---

## 6. Fluxo de Navegação

### 6.1 Step 1: Categorias

**Layout**: Grid 2 colunas

```
+-------------------+-------------------+
|   🏃 Movimento     |   🧘 Mente         |
|   Caminhadas...    |   Mindfulness...   |
+-------------------+-------------------+
|   🍎 Nutrição      |   🌙 Sono          |
|   Alimentação...   |   Descanso...      |
+-------------------+-------------------+
|   ✅ Produtividade |   ❤️  Pessoal      |
|   Prioridades...   |   Relacionamentos..|
+-------------------+-------------------+
```

**Interação**:
- Tap em categoria → Navega para Step 2 (templates)
- Salva `selectedCategoryData`
- Atualiza `colorToken` para uso nos próximos steps

### 6.2 Step 2: Templates (Lista de Tasks)

**Header**: Pills horizontais com scroll das 6 categorias

```
🏃 Movimento  |  🧘 Mente  |  🍎 Nutrição  |  🌙 Sono  |  ✅ Produtividade  |  ❤️ Pessoal
```

**Body**: Lista vertical de tasks da categoria selecionada

```
+--------------------------------------------------+
| 🏃  Walk or Run                              >   |
|     Every day                                     |
+--------------------------------------------------+
| 🚴  Cycle                                     >   |
|     3x / week                                     |
+--------------------------------------------------+
| 🏊  Swim                                      >   |
|     2x / week                                     |
+--------------------------------------------------+
```

**Interação**:
- Tap em pill de categoria → Atualiza lista de tasks
- Tap em task → Navega para Step 3 (details)
- Preenche valores default (goal, frequency, etc.)

### 6.3 Step 3: Detalhes/Confirmar

**Layout**:
1. Hero Circle com ícone
2. Task title (editable)
3. Alert de Health Integration (se auto_complete_source === 'health')
4. Campo Título (opcional, pode estar no hero)
5. Card Goal
6. Card Task Days
7. Card Notifications
8. (Opcional) Card Ícone/Emoji
9. CTA Button "SAVE TASK"

**Interação**:
- Tap em cards → Expande inline ou abre sheet/modal
- Botão "SAVE TASK" → Valida e cria hábito
- Botão voltar → Retorna para Step 2

---

## 7. Implementação

### 7.1 Ordem de Implementação

**COMPLIANCE**: Todos os passos estendem código existente em [CreateHabit.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx)

#### Fase 1: Atualizar Sistema de Ícones
1. ✅ Adicionar novos ícones em [HabitIcons.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\components\icons\HabitIcons.tsx)
   - `activity_rings`
   - `stand_hours`
   - `exercise_minutes`
   - `burn_energy`

2. ✅ Adicionar propriedade `colorToken` personalizada em CATEGORY_DATA

#### Fase 2: Atualizar CATEGORY_DATA
1. ✅ Estender tasks em categoria "movement" (linhas 65-71)
   - Adicionar Activity Rings, Stand Hours, Exercise Minutes, Burn Energy
2. ✅ Adicionar `auto_complete_source: "health"` nas tasks apropriadas
3. ✅ Atualizar `colorToken` com cores específicas por categoria

#### Fase 3: Redesenhar Cards
1. ✅ Atualizar CategoryStep (linhas 447-478)
   - Aumentar tamanhos de ícones
   - Usar cores dinâmicas via `style` prop

2. ✅ Atualizar TemplateStep (linhas 480-578)
   - Adicionar pills horizontais de categorias no topo
   - Usar cores da categoria nos ícones

3. ✅ Redesenhar DetailsStep (linhas 581-789)
   - Criar Hero Circle component
   - Redesenhar configuration cards
   - Adicionar alert de Health Integration
   - Atualizar CTA button

#### Fase 4: Ajustes Finais
1. ✅ Remover campos irrelevantes (período do dia, emoji picker)
2. ✅ Simplificar validação de campos
3. ✅ Testar fluxo completo
4. ✅ Ajustar responsividade mobile

### 7.2 Checklist de Elementos a Remover

Com base na análise das telas de referência, os seguintes elementos devem ser **REMOVIDOS** ou **OCULTADOS**:

- ❌ **Seletor de Período do Dia** (Manhã/Tarde/Noite) - Linhas 22-26, 706-727
  - Não aparece nas telas de referência

- ❌ **Emoji Picker** - Linhas 730-759
  - Usar apenas ícones do sistema (HabitIcons)

- ❌ **Campo de Descrição** (se existir)
  - Manter apenas título

- ❌ **Alert de Auto-complete genérico** - Linhas 761-773
  - Substituir por alert específico de Health Integration

### 7.3 Pseudocódigo das Mudanças Principais

#### Atualizar Hero Section (Step 3)

```typescript
// ANTES (linha 592-609):
<Card className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-soft)]">
  <div className="flex flex-col items-center gap-3">
    <div className="relative flex h-26 w-26 items-center justify-center rounded-full bg-muted">
      <div className="absolute inset-0 rounded-full border-[6px] border-primary/35" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card text-primary shadow-inner shadow-[var(--shadow-soft)]">
        {/* ícone */}
      </div>
    </div>
    <Input value={habitName} ... />
  </div>
</Card>

// DEPOIS:
<div className="flex flex-col items-center gap-4 py-6">
  {/* Hero Circle */}
  <HeroCircle
    icon={selectedIconKey}
    color={selectedCategoryData?.colorToken}
    isAutoTask={selectedTemplateAuto}
  />

  {/* Task Title */}
  <div className="text-center px-4">
    <p
      className="text-xl font-bold uppercase tracking-wider"
      style={{ color: selectedCategoryData?.colorToken }}
    >
      {habitName || "TASK NAME"}
    </p>
  </div>
</div>

{/* Health Integration Alert */}
{selectedTemplateAuto && (
  <HealthIntegrationAlert />
)}

{/* Title Input (optional/hidden) */}
<div className="px-4">
  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
    TITLE:
  </Label>
  <Input
    value={habitName}
    onChange={(e) => setHabitName(e.target.value)}
    placeholder="Automatic"
    maxLength={18}
    className="rounded-xl"
  />
  <p className="mt-1 text-xs text-muted-foreground text-right">
    {habitName.length} / 18
  </p>
</div>
```

#### Criar Componente HeroCircle

```typescript
interface HeroCircleProps {
  icon: HabitIconKey | null;
  color: string;
  isAutoTask?: boolean;
}

const HeroCircle: React.FC<HeroCircleProps> = ({ icon, color, isAutoTask }) => {
  const Icon = icon ? getHabitIcon(icon) : null;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      {/* Gray track */}
      <div className="absolute inset-0 rounded-full border-[6px] border-muted" />

      {/* Colored arc (270deg) */}
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray="364 364"
          strokeDashoffset="91" // 25% gap (360 * 0.25 = 91)
          strokeLinecap="round"
        />
      </svg>

      {/* Icon container */}
      <div
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-inner"
        style={{
          backgroundColor: `${color}10`,
          borderColor: color,
          borderWidth: '2px',
          borderStyle: 'solid'
        }}
      >
        {Icon && (
          <Icon
            className="h-10 w-10"
            style={{ color }}
          />
        )}
      </div>

      {/* Plus badge */}
      {isAutoTask && (
        <div
          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: color }}
        >
          <span className="text-lg font-bold text-black">+</span>
        </div>
      )}
    </div>
  );
};
```

#### Criar Componente HealthIntegrationAlert

```typescript
const HealthIntegrationAlert: React.FC = () => (
  <div className="mx-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
    <div className="flex-shrink-0 mt-0.5">
      <Heart className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900 dark:text-red-200">
        This task uses data from the Health app.
      </p>
      <p className="mt-1 text-xs text-red-700 dark:text-red-300">
        Please grant Streaks permission if prompted.
      </p>
    </div>
  </div>
);
```

#### Atualizar Configuration Cards

```typescript
// ANTES: Cards com campos inline
<Card className="...">
  <button>...</button>
  <div className="border-t ...">
    {/* Campos inline */}
  </div>
</Card>

// DEPOIS: Cards colapsáveis ou navegáveis
interface ConfigCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  onClick: () => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({
  icon,
  label,
  value,
  color,
  onClick
}) => (
  <div className="mx-4 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
    <button
      type="button"
      className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-muted/40"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-base font-semibold">
            {value}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  </div>
);

// Uso:
<ConfigCard
  icon={<TargetIcon className="h-6 w-6" />}
  label="Goal"
  value={goalValue ? `${goalValue} ${UNIT_LABELS[unit]}` : "Set goal"}
  color={selectedCategoryData?.colorToken ?? "#A3E635"}
  onClick={() => openGoalSheet()}
/>

<ConfigCard
  icon={<CalendarIcon className="h-6 w-6" />}
  label="Task Days"
  value={renderFrequencyLabel()}
  color={selectedCategoryData?.colorToken ?? "#A3E635"}
  onClick={() => openFrequencySheet()}
/>

<ConfigCard
  icon={<BellIcon className="h-6 w-6" />}
  label="Notifications"
  value={notificationsEnabled ? "Enabled" : "Disabled"}
  color={selectedCategoryData?.colorToken ?? "#A3E635"}
  onClick={() => openNotificationsSheet()}
/>
```

### 7.4 Integração com Shadcn UI

Para expandir os campos de configuração, usar o componente **Sheet** do Shadcn UI:

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const [activeSheet, setActiveSheet] = useState<'goal' | 'frequency' | 'notifications' | null>(null);

// Goal Sheet
<Sheet open={activeSheet === 'goal'} onOpenChange={(open) => !open && setActiveSheet(null)}>
  <SheetContent side="bottom" className="rounded-t-3xl">
    <SheetHeader>
      <SheetTitle>Set Goal</SheetTitle>
    </SheetHeader>
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-3">
        <Input
          type="number"
          value={goalValue ?? ""}
          onChange={(e) => setGoalValue(Number(e.target.value))}
          className="flex-1 rounded-xl"
          placeholder="5000"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as any)}
          className="rounded-xl border px-4 py-2"
        >
          <option value="steps">Steps</option>
          <option value="minutes">Minutes</option>
          <option value="km">km</option>
          <option value="hours">Hours</option>
          <option value="none">None</option>
        </select>
      </div>
      <Button
        className="w-full"
        onClick={() => setActiveSheet(null)}
      >
        Done
      </Button>
    </div>
  </SheetContent>
</Sheet>
```

### 7.5 Cores Finais da Identidade Visual

Com base na análise das telas de referência:

```css
/* Primary color: Verde Lima (destaque principal) */
--color-primary-lime: #A3E635;
--color-primary-lime-bg: rgba(163, 230, 53, 0.15);
--color-primary-lime-hover: #8FD424;

/* Categoria: Movimento */
--category-movement: #A3E635; /* Verde lima */

/* Categoria: Mente */
--category-mind: #60A5FA; /* Azul claro */

/* Categoria: Nutrição */
--category-nutrition: #FB923C; /* Laranja */

/* Categoria: Sono */
--category-sleep: #A78BFA; /* Roxo/Lavanda */

/* Categoria: Produtividade */
--category-productivity: #FBBF24; /* Amarelo/Dourado */

/* Categoria: Pessoal */
--category-personal: #F472B6; /* Rosa */

/* Alert Health Integration */
--alert-health-bg: rgba(239, 68, 68, 0.1); /* Vermelho claro */
--alert-health-border: rgba(239, 68, 68, 0.3);
--alert-health-text: #991B1B; /* Vermelho escuro */
```

---

## 8. Resumo Executivo

### 8.1 O Que Será Mantido
✅ Estrutura de 3 steps (category → templates → details)
✅ Sistema de ícones HabitIcons.tsx (com adições)
✅ Componentes UI existentes (Button, Card, Input, Label)
✅ Hooks e lógica de negócio (useHabits, validações)
✅ Animações com AnimatePresence

### 8.2 O Que Será Removido
❌ Seletor de período do dia (Manhã/Tarde/Noite)
❌ Emoji picker (usar apenas ícones do sistema)
❌ Campos de descrição longa
❌ Alert genérico de auto-complete

### 8.3 O Que Será Adicionado
✅ 4 novos ícones (activity_rings, stand_hours, exercise_minutes, burn_energy)
✅ 9 novas tasks na categoria "Movimento"
✅ Hero Circle component com stroke colorido
✅ Health Integration Alert específico
✅ Configuration Cards colapsáveis
✅ Cores dinâmicas por categoria (6 cores diferentes)
✅ Pills horizontais de categorias no Step 2

### 8.4 Mudanças Visuais Principais
1. **Ícones maiores**: De h-5/w-5 para h-7/w-7 (categorias)
2. **Cores dinâmicas**: Cada categoria tem sua cor específica
3. **Hero Circle**: Efeito de stroke parcial (270deg) + badge "+"
4. **Cards simplificados**: Ícone + label + valor + chevron
5. **CTA Button**: Verde lima com texto preto (alto contraste)

### 8.5 Arquivos que Serão Modificados
1. ✏️ [HabitIcons.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\components\icons\HabitIcons.tsx) - Adicionar 4 novos ícones
2. ✏️ [CreateHabit.tsx](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\pages\CreateHabit.tsx) - Redesenhar UI
3. ✏️ [index.css](c:\Users\bruno\Documents\Black\Habitz\Prod\App\src\index.css) - Adicionar variáveis de cores

### 8.6 Novos Componentes a Criar
1. ➕ `HeroCircle.tsx` - Círculo com ícone e stroke colorido
2. ➕ `HealthIntegrationAlert.tsx` - Alert específico para tasks de Health
3. ➕ `ConfigCard.tsx` - Card de configuração reutilizável
4. ➕ (Opcional) `CategoryPill.tsx` - Pill de categoria horizontal

---

## 9. Próximos Passos

1. ✅ Revisar e aprovar este documento técnico
2. 🔨 Implementar fase 1: Atualizar HabitIcons.tsx
3. 🔨 Implementar fase 2: Atualizar CATEGORY_DATA
4. 🔨 Implementar fase 3: Criar novos componentes (HeroCircle, ConfigCard)
5. 🔨 Implementar fase 4: Redesenhar CreateHabit.tsx
6. ✅ Testar fluxo completo
7. 🎨 Ajustes finais de UI/UX

---

**Documento criado em**: 2024-11-24
**Versão**: 1.0
**Baseado em**: Análise de telas de referência (iPhone screenshots) e código existente
**Compliance**: ✅ Reutilização de código existente confirmada
