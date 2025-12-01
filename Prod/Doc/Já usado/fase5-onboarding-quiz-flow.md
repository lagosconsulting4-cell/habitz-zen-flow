# Fase 5: Implementação Completa - Onboarding e Quiz

## 📋 Visão Geral

Esta fase implementa o fluxo completo de onboarding e avaliação TDAH para novos usuários do Habitz, garantindo que:
1. Usuários passem pelo onboarding **apenas no primeiro acesso**
2. Dados do onboarding sejam **salvos no banco** para personalização futura
3. Quiz de avaliação TDAH esteja **acessível via Dashboard e menu**
4. Sistema rastreie **se o usuário já fez o quiz** para não mostrar repetidamente

---

## 🔄 Fluxo Completo do Usuário

```
┌─────────────────┐
│ Cadastro/Login  │
└────────┬────────┘
         │
         ▼
   ┌──────────────────────┐
   │ Verificar se completou│
   │     onboarding        │
   └──────┬───────────────┘
          │
     NÃO  │  SIM
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐  ┌──────────────┐
│Onboarding│  │ is_premium?  │
│(escolher │  └──────┬───────┘
│  áreas)  │         │
└────┬─────┘    SIM  │  NÃO
     │         ┌─────┴─────┐
     │         │           │
     └────────▶▼           ▼
           ┌─────────┐  ┌────────┐
           │Dashboard│  │Pricing │
           └────┬────┘  └────────┘
                │
                ▼
          ┌──────────────┐
          │ Fez o quiz?  │
          └──────┬───────┘
                 │
            NÃO  │  SIM
           ┌─────┴─────┐
           │           │
           ▼           ▼
      ┌─────────┐  ┌────────────┐
      │ Card:   │  │ Card não   │
      │"Faça    │  │ aparece    │
      │ Quiz"   │  │            │
      └─────────┘  └────────────┘
```

---

## 🗄️ Mudanças no Banco de Dados

### **1. Migration Criada**
**Arquivo:** `supabase/migrations/20250106000000_add_onboarding_tracking.sql`

### **2. Novos Campos na Tabela `profiles`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `has_completed_onboarding` | BOOLEAN | `true` se usuário completou onboarding |
| `onboarding_goals` | JSONB | Array com áreas escolhidas (ex: `["productivity", "mindset"]`) |
| `onboarding_completed_at` | TIMESTAMPTZ | Data/hora que completou onboarding |

### **3. Novo Campo na Tabela `assessment_responses`**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `completed_at` | TIMESTAMPTZ | Data/hora que finalizou o quiz |

### **4. Nova Função RPC**

```sql
complete_onboarding(p_user_id UUID, p_goals JSONB)
```
Marca onboarding como completo e salva as áreas de foco escolhidas.

### **5. Nova View**

```sql
CREATE VIEW user_progress_status
```
Mostra status consolidado do usuário (onboarding + quiz).

**Campos retornados:**
- `user_id`
- `display_name`
- `has_completed_onboarding`
- `onboarding_goals`
- `onboarding_completed_at`
- `completed_quizzes` (quantidade)
- `last_quiz_completed_at`
- `status` (enum: `needs_onboarding`, `needs_quiz`, `completed`)

---

## 💻 Mudanças no Frontend

### **1. Onboarding.tsx** (src/pages/Onboarding.tsx)

**Mudanças:**
- Importa `supabase` e `toast`
- Adiciona estado `isSaving` para feedback visual
- Função `handleNext()` agora é `async` e salva dados no Supabase
- Chama `supabase.rpc("complete_onboarding", ...)` ao finalizar
- Botão mostra "Salvando..." durante o processo

**Dados salvos:**
```typescript
{
  p_user_id: user.id,
  p_goals: ["productivity", "mindset", "fitness"] // exemplo
}
```

---

### **2. Auth.tsx** (src/pages/Auth.tsx)

**Mudanças:**
- `redirectAfterAuth()` agora busca `has_completed_onboarding` do perfil
- Se `has_completed_onboarding === false`, redireciona para `/onboarding`
- Caso contrário, segue fluxo normal (dashboard ou pricing)

**Query atualizada:**
```typescript
const { data } = await supabase
  .from("profiles")
  .select("is_premium, has_completed_onboarding")
  .eq("user_id", userId)
  .single();
```

**Lógica de redirect:**
```typescript
if (!data?.has_completed_onboarding) {
  navigate("/onboarding", { replace: true });
  return;
}
```

---

### **3. Dashboard.tsx** (src/pages/Dashboard.tsx)

**Mudanças:**

#### **a) Novo estado:**
```typescript
const [hasCompletedQuiz, setHasCompletedQuiz] = useState(true);
```

#### **b) Verificação no `useEffect`:**
```typescript
const { data: assessments } = await supabase
  .from("assessment_responses")
  .select("id, completed_at")
  .eq("user_id", user.id)
  .not("completed_at", "is", null)
  .limit(1);

setHasCompletedQuiz((assessments?.length ?? 0) > 0);
```

#### **c) Novo card (renderizado se `!hasCompletedQuiz`):**
```tsx
{!hasCompletedQuiz && (
  <Card className="mb-8 animate-slide-up bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
    <div className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🧠</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Faça sua Avaliação de TDAH
          </h3>
          <p className="text-gray-700 mb-4">
            Responda 5 minutos de perguntas e receba uma análise personalizada
            com mini-hábitos específicos para o seu perfil.
          </p>
          <Button onClick={() => navigate("/quiz")}>
            Começar Avaliação
          </Button>
        </div>
      </div>
    </div>
  </Card>
)}
```

---

### **4. nav.ts** (src/config/nav.ts)

**Mudanças:**
- Adicionado novo item no array `navItems`:

```typescript
{
  id: "quiz",
  label: "Avaliacao TDAH",
  path: "/quiz",
  icon: "brain",
  variant: "secondary",
  requiresAuth: true
}
```

**Posição:** Entre "Jornada" e "Meus Hábitos" no menu "Mais"

---

### **5. Quiz.tsx** (src/pages/Quiz.tsx)

**Mudanças:**
- Campo `completed_at` adicionado ao INSERT:

```typescript
const { data: assessment, error } = await supabase
  .from("assessment_responses")
  .insert({
    session_id: sessionId,
    user_id: user?.id || null,
    answers: answers,
    scores: scores,
    completed_at: new Date().toISOString() // ← NOVO
  })
  .select()
  .single();
```

Agora o sistema sabe **quando** o quiz foi completado.

---

## 🎯 Comportamentos Implementados

### **1. Onboarding no Primeiro Acesso**

✅ **Usuário novo se cadastra:**
- `has_completed_onboarding` = `false` (padrão)
- É redirecionado para `/onboarding`
- Escolhe áreas de foco (Produtividade, Físico, etc)
- Dados são salvos no banco
- `has_completed_onboarding` vira `true`
- Nunca mais vê o onboarding automaticamente

✅ **Usuário antigo faz login:**
- `has_completed_onboarding` = `true`
- Pula o onboarding
- Vai direto para dashboard ou pricing

---

### **2. Quiz Acessível no Dashboard**

✅ **Usuário nunca fez o quiz:**
- Dashboard mostra card roxo: "Faça sua Avaliação de TDAH"
- Clica em "Começar Avaliação" → vai para `/quiz`

✅ **Usuário já fez o quiz:**
- Card não aparece no dashboard
- Pode acessar o quiz pelo menu "Mais" se quiser refazer

---

### **3. Quiz Acessível no Menu**

✅ **Menu "Mais" (MoreMenu):**
- Item "Avaliação TDAH" sempre visível
- Permite que usuário refaça o quiz a qualquer momento
- Ícone: 🧠 (brain)

---

## 📊 Dados Coletados e Utilidade Futura

### **Onboarding Goals (onboarding_goals)**

**Formato:**
```json
["productivity", "mindset", "fitness", "learning", "wellness", "career"]
```

**Uso futuro:**
- Personalizar sugestões de hábitos baseado nas áreas escolhidas
- Dashboard pode priorizar conteúdo relevante para as áreas
- Biblioteca pode filtrar e-books por área de interesse
- Insights/Tips podem ser personalizados
- Métricas de progresso podem focar nas áreas escolhidas

**Exemplos:**

1. **Usuário escolheu "fitness" + "wellness":**
   - Sugerir hábitos: exercícios, alimentação, sono
   - Destacar e-books sobre saúde
   - Tips focados em energia e disposição

2. **Usuário escolheu "productivity" + "career":**
   - Sugerir hábitos: planejamento, networking, foco
   - Destacar e-books sobre organização
   - Tips focados em performance profissional

3. **Usuário escolheu "mindset" + "learning":**
   - Sugerir hábitos: meditação, leitura, cursos
   - Destacar e-books sobre autocrescimento
   - Tips focados em clareza mental

---

### **Quiz Completion Data (completed_at)**

**Uso futuro:**
- Exibir histórico de avaliações
- Comparar resultados ao longo do tempo
- Mostrar evolução do usuário
- Gamificação: badges por refazer avaliação após 30/60/90 dias

---

## 🔧 Como Aplicar no Supabase

### **Passo 1: Executar Migration**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase/migrations/20250106000000_add_onboarding_tracking.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**

---

### **Passo 2: Verificar Tabelas**

Execute para confirmar que os campos foram adicionados:

```sql
-- Verificar perfis
SELECT
  user_id,
  has_completed_onboarding,
  onboarding_goals,
  onboarding_completed_at
FROM profiles
LIMIT 5;

-- Verificar assessments
SELECT
  id,
  user_id,
  completed_at,
  created_at
FROM assessment_responses
LIMIT 5;
```

---

### **Passo 3: Testar a View**

```sql
SELECT * FROM user_progress_status
WHERE status = 'needs_onboarding';
```

Deve retornar usuários que ainda não completaram onboarding.

---

## 🧪 Testes Recomendados

### **Teste 1: Novo Usuário - Onboarding**

1. Criar nova conta
2. Verificar redirect para `/onboarding`
3. Escolher áreas de foco
4. Clicar em "Começar Jornada"
5. Verificar que foi salvo no banco:
   ```sql
   SELECT has_completed_onboarding, onboarding_goals
   FROM profiles WHERE user_id = '{USER_ID}';
   ```
6. Fazer logout e login novamente
7. Verificar que **não** vai para onboarding de novo

---

### **Teste 2: Quiz no Dashboard**

1. Login como usuário que nunca fez quiz
2. Verificar que Dashboard mostra card roxo "Faça sua Avaliação de TDAH"
3. Clicar em "Começar Avaliação"
4. Completar quiz
5. Voltar para Dashboard
6. Verificar que card **não aparece mais**

---

### **Teste 3: Quiz no Menu**

1. Abrir menu "Mais" (MoreMenu ou sidebar)
2. Verificar item "Avaliação TDAH" 🧠
3. Clicar no item
4. Verificar que abre `/quiz`

---

### **Teste 4: Refazer Quiz**

1. Usuário que já fez quiz uma vez
2. Acessar `/quiz` pelo menu
3. Completar quiz novamente
4. Verificar no banco que há **2 registros**:
   ```sql
   SELECT id, completed_at
   FROM assessment_responses
   WHERE user_id = '{USER_ID}'
   ORDER BY completed_at DESC;
   ```

---

## 📈 Métricas e Analytics

### **Eventos Rastreados**

| Evento | Quando Dispara | Dados |
|--------|----------------|-------|
| `onboarding_started` | Usuário chega na tela de onboarding | - |
| `onboarding_completed` | Usuário finaliza onboarding | `goals: string[]` |
| `quiz_started` | Usuário inicia quiz | - |
| `quiz_step_completed` | Cada etapa completada | `step: number` |
| `quiz_completed` | Quiz finalizado | `diagnosis_type`, `probability_score`, `has_email` |

### **Queries Úteis para Analytics**

#### **Taxa de conclusão do onboarding:**
```sql
SELECT
  COUNT(*) FILTER (WHERE has_completed_onboarding = true) * 100.0 / COUNT(*) as completion_rate
FROM profiles;
```

#### **Áreas mais escolhidas:**
```sql
SELECT
  jsonb_array_elements_text(onboarding_goals) as goal,
  COUNT(*) as count
FROM profiles
WHERE onboarding_goals IS NOT NULL
GROUP BY goal
ORDER BY count DESC;
```

#### **Usuários que fizeram o quiz:**
```sql
SELECT
  COUNT(DISTINCT user_id) as users_completed_quiz
FROM assessment_responses
WHERE completed_at IS NOT NULL;
```

#### **Taxa de usuários que refizeram o quiz:**
```sql
SELECT
  COUNT(*) FILTER (WHERE quiz_count > 1) * 100.0 / COUNT(*) as retake_rate
FROM (
  SELECT user_id, COUNT(*) as quiz_count
  FROM assessment_responses
  WHERE completed_at IS NOT NULL
  GROUP BY user_id
) subquery;
```

---

## 🚀 Próximos Passos (Futuro)

### **1. Personalização Baseada em Goals**

Implementar lógica para sugerir hábitos baseado nas áreas escolhidas:

```typescript
// src/lib/habitSuggestions.ts
export function getHabitsByGoals(goals: string[]) {
  const habitMap = {
    productivity: [
      "Planejar o dia em 5 minutos",
      "Técnica Pomodoro (25min foco)",
      "Revisar tarefas antes de dormir"
    ],
    fitness: [
      "Caminhada de 10 minutos",
      "2 séries de 5 flexões",
      "Alongamento ao acordar"
    ],
    // ...
  };

  return goals.flatMap(goal => habitMap[goal] || []);
}
```

---

### **2. Dashboard Personalizado**

Mostrar conteúdo relevante baseado em goals:

```tsx
{onboardingGoals.includes("mindset") && (
  <Card>
    <h3>📚 E-books Recomendados para Mentalidade</h3>
    <EbookList category="mindset" />
  </Card>
)}
```

---

### **3. Histórico de Avaliações**

Criar página `/historico-avaliacoes` mostrando:
- Todos os quizzes feitos pelo usuário
- Comparação de scores ao longo do tempo
- Gráfico de evolução
- Re-download de PDFs antigos

---

### **4. Gamificação**

- Badge: "Primeira Avaliação" 🏆
- Badge: "Reavaliação 30 dias" 🎯
- Badge: "Conhecimento Evolutivo" (fez 3+ quizzes) 🧠
- XP por completar onboarding
- XP por fazer/refazer quiz

---

## ✅ Checklist de Implementação

- [x] Criar migration com campos de onboarding e quiz tracking
- [x] Atualizar Onboarding.tsx para salvar no banco
- [x] Atualizar Auth.tsx para redirect condicional
- [x] Adicionar card de Quiz no Dashboard (condicional)
- [x] Adicionar Quiz ao menu de navegação
- [x] Atualizar Quiz.tsx para salvar completed_at
- [x] Criar documentação completa
- [ ] Executar migration no Supabase (você precisa fazer)
- [ ] Testar fluxo completo de novo usuário
- [ ] Testar quiz no dashboard
- [ ] Testar quiz no menu
- [ ] Monitorar analytics de onboarding e quiz

---

## 🎉 Resumo

**Implementado:**
- ✅ Onboarding **apenas no primeiro acesso**
- ✅ Dados salvos no banco para **personalização futura**
- ✅ Quiz acessível via **Dashboard** (se nunca fez)
- ✅ Quiz acessível via **menu "Mais"** (sempre)
- ✅ Sistema rastreia **quem já fez quiz**
- ✅ Timestamps de conclusão de onboarding e quiz

**Próximos passos para você:**
1. Executar a migration no Supabase
2. Testar o fluxo completo
3. Usar os dados de `onboarding_goals` para personalizar a experiência
