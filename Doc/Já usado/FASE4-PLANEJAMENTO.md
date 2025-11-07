# Fase 4 - Acompanhamento e Progresso TDAH - Planejamento Inteligente

## 🎯 Filosofia da Fase 4

**Não vamos duplicar o que já existe. Vamos COMPLEMENTAR de forma natural e focada no público TDAH.**

---

## 📊 O Que JÁ TEMOS (Resumo)

### ✅ Funcionalidades Existentes Fortes:

1. **Dashboard** - Métricas diárias, progresso do programa, hábitos organizados por período
2. **Progress.tsx** - Gráfico semanal, streaks, métricas mensais
3. **Calendar.tsx** - Visualização histórica, perfect days
4. **Streaks** - Sistema básico funcionando (por hábito e global)
5. **Program Progress** - Tracking de módulos/aulas do plano de 30 dias
6. **Dados Sólidos** - Tabela `habit_completions` eficiente

### ⚠️ O Que Está Faltando:

1. ❌ **Check-ins emocionais** - Nada relacionado ao estado mental/emocional do usuário
2. ❌ **Comparação com o plano** - Não há conexão entre hábitos e o plano de 30 dias
3. ❌ **Conquistas/Badges** - Zero gamificação visual
4. ❌ **Insights TDAH** - Nenhum insight específico para TDAH
5. ❌ **Tendências de longo prazo** - Só vê semana/mês atual

---

## 🧠 FASE 4 - Foco em TDAH, Não em Estatísticas Genéricas

### Princípios de Design:

1. **Simples, não massante** - Pessoas com TDAH precisam de clareza, não complexidade
2. **Actionable, não só informativo** - Cada insight deve sugerir uma ação
3. **Emocional, não só numérico** - TDAH é sobre regulação emocional
4. **Contextual, não isolado** - Conectar hábitos com o plano de 30 dias

---

## 🎨 Estrutura da Fase 4

### OPÇÃO A: Página Única "/progresso-tdah" (RECOMENDADO)

**Ideia:** Criar uma NOVA página focada em insights TDAH, sem mexer no Progress.tsx existente.

**Estrutura:**

```
/progresso-tdah
├── Seção 1: Check-in Emocional Rápido (diário)
├── Seção 2: Indicador de Aderência ao Plano (vs programa 30 dias)
├── Seção 3: Badges Conquistados (gamificação visual)
├── Seção 4: Insights TDAH Personalizados
└── Seção 5: Próximos Passos (call-to-action)
```

**Vantagens:**
- ✅ Não confunde com Progress.tsx (que é genérico)
- ✅ Experiência única para público TDAH
- ✅ Pode ser mais visual e menos "estatístico"
- ✅ Fácil de navegar

**Desvantagens:**
- ⚠️ Mais uma página no app (pode confundir iniciantes)

---

### OPÇÃO B: Expandir Dashboard (ALTERNATIVA)

**Ideia:** Adicionar cards específicos TDAH no Dashboard existente.

**O que adicionar:**

```
Dashboard.tsx (após o card de progresso do plano)
├── Card: Check-in Emocional (se ainda não fez hoje)
├── Card: Badges Recentes
└── Card: Insight TDAH do Dia
```

**Vantagens:**
- ✅ Tudo em um lugar
- ✅ Menos navegação para o usuário
- ✅ Mais simples

**Desvantagens:**
- ⚠️ Dashboard pode ficar muito longo
- ⚠️ Mistura conteúdo diário com conteúdo de acompanhamento

---

## 🔥 Minha Recomendação: HÍBRIDO

**Dashboard:** Check-in emocional + 1 badge recente + CTA para "/progresso-tdah"
**Nova Página (/progresso-tdah):** Visão completa de aderência, badges, insights

**Por quê?**
- Dashboard mantém foco no DIA (hábitos + check-in rápido)
- Página dedicada para análise mais profunda (quando usuário quiser)
- Não sobrecarrega nenhuma das páginas

---

## 🛠️ Implementação Detalhada - FASE 4

### 1️⃣ **Check-in Emocional Diário** 😊😐😔

**Tabela Nova:** `daily_checkins`

```sql
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  mood_level INT CHECK (mood_level BETWEEN 1 AND 5), -- 1=péssimo, 5=ótimo
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  focus_level INT CHECK (focus_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);
```

**UI no Dashboard:**

```tsx
{!todayCheckin && (
  <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="p-6">
      <h3 className="text-lg font-bold mb-2">Como você está hoje?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Um check-in rápido ajuda a entender seu progresso emocional
      </p>

      {/* 5 emojis clicáveis */}
      <div className="flex gap-3 justify-center">
        {[1, 2, 3, 4, 5].map(level => (
          <button onClick={() => submitCheckin(level)}>
            {getMoodEmoji(level)} {/* 😔 😕 😐 🙂 😊 */}
          </button>
        ))}
      </div>
    </div>
  </Card>
)}
```

**Quando aparece:**
- Apenas se o usuário NÃO fez check-in hoje
- Desaparece após clicar

**Dados coletados:**
- `mood_level` (obrigatório)
- `energy_level`, `focus_level` (opcional, em modal expandido)

---

### 2️⃣ **Indicador de Aderência ao Plano** 📈

**Conceito:** Mostrar se o usuário está "no ritmo" do plano de 30 dias.

**Lógica:**

```typescript
// Calcular aderência
const expectedWeek = Math.floor(daysSinceStart / 7) + 1; // Semana esperada
const currentWeek = getCurrentWeekFromLessons(userProgress); // Semana real

if (currentWeek >= expectedWeek) {
  status = "on-track"; // No ritmo ✅
} else if (currentWeek === expectedWeek - 1) {
  status = "slightly-behind"; // Um pouco atrasado ⚠️
} else {
  status = "behind"; // Atrasado 🔴
}
```

**UI em /progresso-tdah:**

```tsx
<Card>
  <div className="flex items-center gap-4">
    {status === "on-track" && <CheckCircle className="text-green-500" />}
    {status === "slightly-behind" && <Clock className="text-yellow-500" />}
    {status === "behind" && <AlertCircle className="text-red-500" />}

    <div>
      <h3 className="font-bold">
        {status === "on-track" && "Você está no ritmo! 🎉"}
        {status === "slightly-behind" && "Quase lá! Continue assim"}
        {status === "behind" && "Não desista! Vamos retomar"}
      </h3>
      <p className="text-sm text-gray-600">
        Você está na semana {currentWeek} de 4 do programa
      </p>
    </div>
  </div>
</Card>
```

**Benefício:** Dá contexto sobre o progresso SEM criar pressão negativa.

---

### 3️⃣ **Sistema de Badges (Gamificação Leve)** 🏆

**Tabela Nova:** `achievements`

```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY, -- "first-habit", "week-1-complete"
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji ou nome do ícone
  category TEXT, -- "habit", "program", "streak"
  requirement_type TEXT, -- "habit_count", "streak_days", "module_complete"
  requirement_value INT,
  sort_order INT
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**Badges Sugeridos (Simples, 8-10 badges):**

1. 🎯 **Primeiro Passo** - Criou primeiro hábito
2. 🔥 **Sequência de 3** - Manteve streak de 3 dias
3. ⚡ **Semana Completa** - Completou 7 dias seguidos
4. 📚 **Aprendiz** - Completou módulo 1 do programa
5. 💪 **Meio Caminho** - Completou 50% do programa (18 aulas)
6. 🏆 **Mestre TDAH** - Completou todos os 37 módulos
7. 🎨 **Explorador** - Criou hábitos em 3 categorias diferentes
8. 🌟 **Consistente** - Manteve 80%+ de conclusão por 7 dias

**UI - Card de Badges:**

```tsx
<div className="grid grid-cols-4 gap-4">
  {achievements.map(badge => (
    <div
      className={earned ? "opacity-100" : "opacity-30 grayscale"}
      key={badge.id}
    >
      <div className="text-4xl">{badge.icon}</div>
      <p className="text-xs text-center">{badge.title}</p>
    </div>
  ))}
</div>
```

**Quando mostrar:**
- Modal de celebração quando ganha novo badge
- Seção de badges em /progresso-tdah
- 1-2 badges recentes no Dashboard

---

### 4️⃣ **Insights TDAH Personalizados** 💡

**Conceito:** Gerar insights BASEADOS nos dados do usuário.

**Exemplos de Insights:**

| Padrão Detectado | Insight |
|------------------|---------|
| Usuário completa mais pela manhã | "Você é mais produtivo de manhã! Tente agendar tarefas importantes antes das 11h." |
| Streak baixo na categoria "Estudo" | "Hábitos de estudo podem ser difíceis com TDAH. Que tal começar com apenas 5 minutos?" |
| Check-in com energia baixa 3+ dias | "Você relatou baixa energia nos últimos dias. Considere adicionar um hábito de movimento leve." |
| Completou módulo sobre foco | "Você aprendeu sobre técnicas de foco! Aplique o Pomodoro em seus hábitos." |

**Lógica de Geração:**

```typescript
function generateInsights(userData) {
  const insights = [];

  // Análise por período
  const completionByPeriod = analyzeByPeriod(userData.completions);
  if (completionByPeriod.morning > 70) {
    insights.push({
      type: "time-pattern",
      message: "Você é mais produtivo de manhã!",
      suggestion: "Agende tarefas importantes antes das 11h"
    });
  }

  // Análise de energia
  const recentCheckins = userData.checkins.slice(-7);
  const avgEnergy = average(recentCheckins.map(c => c.energy_level));
  if (avgEnergy < 2.5) {
    insights.push({
      type: "energy-low",
      message: "Sua energia está baixa ultimamente",
      suggestion: "Considere adicionar um hábito de movimento leve"
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}
```

**UI:**

```tsx
<Card>
  <h3 className="font-bold mb-4">💡 Insights para Você</h3>
  {insights.map(insight => (
    <div className="p-4 bg-purple-50 rounded-lg mb-3">
      <p className="font-semibold">{insight.message}</p>
      <p className="text-sm text-gray-600 mt-1">{insight.suggestion}</p>
    </div>
  ))}
</Card>
```

---

### 5️⃣ **Comparação: Hábitos vs Plano** 🔗

**Conceito:** Conectar os hábitos criados com os objetivos do plano de 30 dias.

**Tabela Nova (Opcional):** `habit_plan_links`

```sql
CREATE TABLE habit_plan_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  module_id UUID REFERENCES program_modules(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**OU:** Adicionar campo `related_module_id` na tabela `habits`.

**UI:**

```tsx
<Card>
  <h3 className="font-bold mb-4">Seus Hábitos & O Plano</h3>

  {/* Hábitos conectados */}
  <div className="space-y-3">
    {habits.map(habit => (
      <div className="flex items-center justify-between">
        <div>
          <span>{habit.emoji} {habit.name}</span>
          {habit.relatedModule && (
            <span className="text-xs text-gray-500">
              → Relacionado ao {habit.relatedModule.title}
            </span>
          )}
        </div>
        <Badge>Alinhado ✅</Badge>
      </div>
    ))}
  </div>

  {/* Sugestões */}
  {suggestedHabits.length > 0 && (
    <div className="mt-6 pt-6 border-t">
      <p className="text-sm font-semibold mb-3">
        Baseado no seu progresso, sugerimos:
      </p>
      {suggestedHabits.map(habit => (
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {habit.name}
        </Button>
      ))}
    </div>
  )}
</Card>
```

---

## 📐 Arquitetura de Dados - Resumo

### Novas Tabelas:

1. **daily_checkins** - Check-ins emocionais
2. **achievements** - Definição de badges
3. **user_achievements** - Badges conquistados
4. **(Opcional) habit_plan_links** - Conectar hábitos com módulos

### Sem Mudanças:

- ✅ `habits` - Continua igual
- ✅ `habit_completions` - Continua igual
- ✅ `program_modules`, `module_lessons`, `module_progress` - Continuam iguais

---

## 🎨 Experiência do Usuário - Fluxo Completo

### Manhã (Dashboard):

1. Usuário abre app
2. **VÊ:** "Como você está hoje?" → Clica em emoji 🙂
3. **VÊ:** Lista de hábitos da manhã
4. **COMPLETA:** 2 de 3 hábitos
5. **VÊ:** Badge popup: "🔥 Você ganhou 'Sequência de 3'!"
6. **VÊ:** Card de progresso do plano: "15/37 aulas"

### Tarde (Explorando Progresso):

1. Usuário clica em "Progresso TDAH" na navegação
2. **VÊ:**
   - Aderência ao plano: "Você está no ritmo! ✅"
   - Badges conquistados: 3 de 8
   - Insight: "Você é mais produtivo de manhã!"
3. **AÇÃO:** Clica em badge não conquistado
4. **VÊ:** "Complete 50% do programa para ganhar 'Meio Caminho'"

---

## 🚀 Implementação - Prioridades

### ✅ Fase 4.1 - Essencial (MVP)

1. **Check-in emocional** (Dashboard + tabela daily_checkins)
2. **Indicador de aderência** (Comparar progresso real vs esperado)
3. **Sistema de badges básico** (5 badges + lógica de conquista)

### 🔄 Fase 4.2 - Complementar

4. **Página /progresso-tdah** completa
5. **Insights TDAH** (3-4 tipos de insights)
6. **Conexão hábitos-plano** (sugestões inteligentes)

---

## 🎯 Decisão Final: O Que Fazer?

**Minha recomendação:**

### Implementar FASE 4.1 (Essencial):

1. ✅ **Check-in Emocional** - Card no Dashboard
2. ✅ **Sistema de Badges** - 5 badges básicos + popup de conquista
3. ✅ **Indicador de Aderência** - Card simples no Dashboard

**Não fazer ainda:**
- ❌ Página /progresso-tdah completa (complexo demais para agora)
- ❌ Insights avançados (precisa de mais dados)
- ❌ Conexão hábitos-plano (requer refatoração)

**Por quê?**
- Mantém simplicidade
- Adiciona valor imediato (check-in + badges)
- Não sobrecarrega o usuário
- Fácil de testar e validar

---

## 📋 Próximos Passos - Decidir Juntos

**Perguntas para você:**

1. **Check-in emocional:** Você quer que apareça TODO DIA no Dashboard? Ou só quando o usuário quiser?
2. **Badges:** 5 badges básicos são suficientes ou quer mais?
3. **Aderência ao plano:** Mostrar no Dashboard ou só em outra página?
4. **Navegação:** Adicionar item "Progresso TDAH" no menu principal ou deixar dentro de "Progresso" atual?

---

**Aguardando sua decisão para começar a implementação! 🚀**
