# Estrutura do Onboarding - Habitz

**Data de criação:** 2025-11-11
**Versão:** 2.0 (pós-migração de Quiz/Diagnóstico)
**Status:** Ativo

---

## 📌 Visão Geral

O sistema de onboarding do Habitz é o primeiro contato que o usuário autenticado tem com a plataforma. Ele coleta informações essenciais sobre o usuário para personalizar a experiência, sem gerar diagnósticos ou análises.

### Objetivos do Onboarding

1. **Conhecer o usuário:** Coletar dados demográficos, desafios, sentimentos e preferências
2. **Personalização:** Usar os dados para adaptar a experiência no dashboard
3. **Obrigatoriedade:** Garantir que todos os usuários completem o onboarding antes de acessar o app
4. **Simplicidade:** Fluxo rápido e direto, sem complexidade de análise

---

## 🔄 Fluxo do Onboarding

```
[Usuário se autentica]
         ↓
[Sistema verifica has_completed_onboarding]
         ↓
   [false?] → Redireciona para /onboarding
         ↓
[Usuário completa 5 etapas]
         ↓
[Dados salvos em onboarding_responses]
         ↓
[Campo has_completed_onboarding = true]
         ↓
[Redireciona para /dashboard]
         ↓
[Acesso liberado ao resto do app]
```

---

## 📝 Etapas do Onboarding

### Etapa 1: Sobre Você

**Objetivo:** Conhecer informações demográficas e contexto do usuário

**Campos coletados:**
- **Faixa etária** (obrigatório)
  - Opções: 13-17, 18-24, 25-34, 35-44, 45+
- **Diagnóstico formal de TDAH** (obrigatório)
  - Opções: "Ainda não", "Suspeito que sim", "Sim, confirmadíssimo"
- **Uso de medicação** (obrigatório)
  - Opções: "Não", "Sim, diariamente", "Sim, em dias específicos"
- **Período de maior energia** (obrigatório)
  - Opções: Manhã, Tarde, Noite, Variável

**Validação:**
- Todos os campos são obrigatórios
- Se algum estiver vazio, exibe erro: "Por favor, responda todas as perguntas antes de continuar."

---

### Etapa 2: Desafios

**Objetivo:** Identificar os principais desafios do usuário no dia a dia

**Campos coletados:**
- **Desafios principais** (obrigatório, múltipla escolha)
  - Opções:
    1. Procrastinação
    2. Desorganização mental
    3. Desorganização física
    4. Falta de foco
    5. Impulsividade
    6. Sono/desgaste
    7. Relacionamentos/Comunicação
    8. Ansiedade/sobrecarga

- **Desafio específico** (opcional, texto livre)
  - Campo: Textarea
  - Placeholder: "Descreva aqui..."

**Validação:**
- Pelo menos 1 desafio deve ser selecionado
- Se nenhum selecionado, exibe erro: "Por favor, selecione pelo menos um desafio."

---

### Etapa 3: Sentimentos

**Objetivo:** Avaliar o estado emocional atual do usuário

**Campos coletados:**
Todos são sliders de 1 (Nada) a 5 (Muito), valor padrão = 3

1. **Foco no dia a dia** (1-5)
2. **Motivação para começar** (1-5)
3. **Nível de sobrecarga** (1-5)
4. **Clareza de objetivos** (1-5)
5. **Autoestima e autoconfiança** (1-5)

**Validação:**
- Nenhuma validação (todos têm valor padrão)

---

### Etapa 4: Preferências

**Objetivo:** Entender como o usuário prefere receber orientações

**Campos coletados:**
- **Tempo diário disponível** (obrigatório, radio)
  - Opções: 5-10min, 10-20min, 20-30min, 30+min

- **Formatos preferidos** (múltipla escolha, checkbox)
  - Opções:
    1. Vídeo curto
    2. Áudio guia
    3. Texto objetivo
    4. Checklist/Planilha

- **Ambiente de prática** (obrigatório, radio)
  - Opções: Casa, Trabalho/Estudo, Espaço externo, Outro
  - Se "Outro", exibe campo de texto para especificar

**Validação:**
- Nenhuma validação obrigatória além dos campos radio

---

### Etapa 5: Contato

**Objetivo:** Coletar email para comunicação (opcional)

**Campos coletados:**
- **Email** (opcional)
  - Tipo: email
  - Placeholder: "seu@email.com"

- **Consentimento** (condicional)
  - Só aparece se email for preenchido
  - Checkbox: "Autorizo o Habitz a enviar dicas e orientações por e-mail."
  - Se email preenchido e consentimento não marcado, exibe erro

**Validação:**
- Se email preenchido, consentimento é obrigatório

---

## 🗄️ Armazenamento de Dados

### Tabela: `onboarding_responses`

```sql
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Estrutura do campo `answers` (JSONB):**

```json
{
  "ageRange": "25-34",
  "hasDiagnosis": "suspeito",
  "usesMedication": "nao",
  "energyPeriod": "manha",
  "challenges": ["Procrastinação", "Falta de foco", "Ansiedade/sobrecarga"],
  "specificChallenge": "Dificuldade em começar tarefas grandes",
  "focusLevel": 3,
  "motivationLevel": 2,
  "overloadLevel": 4,
  "clarityLevel": 3,
  "selfEsteemLevel": 3,
  "dailyTimeCommitment": "10-20",
  "preferredFormats": ["Vídeo curto", "Checklist/Planilha"],
  "environment": "casa",
  "environmentOther": null,
  "email": "usuario@exemplo.com",
  "consent": true
}
```

### Tabela: `profiles`

Após conclusão do onboarding, atualiza os campos:

```sql
UPDATE profiles SET
  has_completed_onboarding = true,
  onboarding_completed_at = NOW()
WHERE user_id = <user_id>;
```

---

## 🎨 Interface do Usuário

### Barra de Progresso
- Exibe "Etapa X de 5"
- Barra de progresso visual (0-100%)
- Cálculo: `(currentStep / 5) * 100`

### Botões de Navegação
- **Voltar:** Aparece a partir da etapa 2
  - Ação: `setCurrentStep(currentStep - 1)`
  - Scroll para topo da página

- **Avançar:** Aparece nas etapas 1-4
  - Ação: Validar etapa → Avançar → Scroll para topo

- **Começar a usar o Habitz:** Etapa 5
  - Ação: Validar → Salvar dados → Redirecionar

### Aparência
- Background: Gradiente `from-purple-50 via-pink-50 to-orange-50`
- Card: Branco com padding responsivo
- Animações: Fade-in e slide-up

---

## 📊 Métricas e Eventos

### Eventos Rastreados

```typescript
// Quando usuário inicia o onboarding
track("onboarding_started");

// Ao completar cada etapa
track("onboarding_step_completed", {
  step: 1 | 2 | 3 | 4 | 5
});

// Ao finalizar todo o onboarding
track("onboarding_completed", {
  has_email: boolean,
  challenges_count: number
});
```

---

## 🔒 Proteção de Rotas

### Verificação de Onboarding

O sistema verifica `has_completed_onboarding` na tabela `profiles` antes de liberar acesso às rotas protegidas.

**Implementação sugerida** (no `ProtectedRoute`):

```typescript
useEffect(() => {
  const checkOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("user_id", user.id)
        .single();

      if (!profile?.has_completed_onboarding && location.pathname !== "/onboarding") {
        navigate("/onboarding");
      }
    }
  };

  checkOnboarding();
}, []);
```

---

## 🛠️ Arquivos Principais

### Componente Principal
- **Arquivo:** `App/src/pages/OnboardingFlow.tsx`
- **Export:** `OnboardingFlow` (componente React)
- **Responsabilidades:**
  - Gerenciar estado das 5 etapas
  - Validar respostas
  - Salvar dados no Supabase
  - Rastrear eventos de métricas

### Interface TypeScript

```typescript
interface OnboardingAnswers {
  ageRange?: string;
  hasDiagnosis?: string;
  usesMedication?: string;
  energyPeriod?: string;
  challenges?: string[];
  specificChallenge?: string;
  focusLevel?: number;
  motivationLevel?: number;
  overloadLevel?: number;
  clarityLevel?: number;
  selfEsteemLevel?: number;
  dailyTimeCommitment?: string;
  preferredFormats?: string[];
  environment?: string;
  environmentOther?: string;
  email?: string;
  consent?: boolean;
}
```

### Roteamento

```typescript
// App.tsx
<Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
  <Route path="/onboarding" element={<OnboardingFlow />} />
  {/* outras rotas protegidas */}
</Route>
```

---

## 🔄 Diferenças da Versão Anterior (Quiz)

| Aspecto | Antes (Quiz) | Agora (Onboarding) |
|---------|--------------|-------------------|
| **Nome** | Quiz / Avaliação TDAH | Onboarding |
| **Acesso** | Público (não autenticado) | Apenas autenticado |
| **Obrigatoriedade** | Opcional | Obrigatório |
| **Após conclusão** | `/analise` (diagnóstico) | `/dashboard` (direto) |
| **Cálculos** | Scores, tipo TDAH, probabilidade | Nenhum |
| **Tabela** | `assessment_responses` | `onboarding_responses` |
| **Navegação** | Item de menu "Avaliação TDAH" | Sem item de menu |
| **Sugestão de hábitos** | Sim, baseado em diagnóstico | Não |
| **PDF de análise** | Sim | Não |

---

## 📚 Uso dos Dados Coletados

### Atual
Os dados são salvos no Supabase mas ainda não são utilizados ativamente para personalização. Estão disponíveis para:
- Análise de comportamento dos usuários
- Futuras funcionalidades de personalização
- Segmentação para comunicação por email

### Planejado (Futuro)
- Sugestão de hábitos baseada em desafios selecionados
- Recomendação de conteúdo (livros, meditações, tips) baseado em preferências
- Ajuste de dificuldade/frequência de hábitos baseado em tempo disponível
- Personalização de horários sugeridos baseado em período de energia

---

## ✅ Checklist de Verificação

### Para Desenvolvedores
- [ ] Onboarding é obrigatório para novos usuários
- [ ] Usuários que já completaram não veem o onboarding novamente
- [ ] Dados são salvos corretamente em `onboarding_responses`
- [ ] Campo `has_completed_onboarding` é atualizado
- [ ] Redirecionamento funciona corretamente
- [ ] Validações de cada etapa funcionam
- [ ] Métricas são rastreadas corretamente
- [ ] Interface responsiva (mobile + desktop)

### Para QA
- [ ] Testar fluxo completo do onboarding
- [ ] Testar validações de cada campo
- [ ] Testar botões Voltar e Avançar
- [ ] Testar salvamento de dados
- [ ] Verificar comportamento em diferentes dispositivos
- [ ] Testar com e sem email
- [ ] Verificar scroll automático entre etapas

---

## 🔗 Arquivos Relacionados

- `App/src/pages/OnboardingFlow.tsx` - Componente principal
- `App/src/App.tsx` - Rotas
- `App/supabase/migrations/20251111140000_rename_quiz_to_onboarding.sql` - Migration
- `Doc/features/Onboarding/PLANO-MIGRACAO.md` - Plano de migração
- `Doc/features/Onboarding/DADOS-COLETADOS.md` - Detalhes dos dados

---

**Última atualização:** 2025-11-11
**Responsável:** Bruno (com assistência de Claude Code)
