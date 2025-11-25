# Dados Coletados no Onboarding - Habitz

**Data:** 2025-11-11
**Versão:** 2.0
**Objetivo:** Documentar todos os dados coletados durante o onboarding, seu propósito e uso.

---

## 📋 Índice

1. [Resumo](#resumo)
2. [Dados Demográficos](#dados-demográficos)
3. [Desafios e Dificuldades](#desafios-e-dificuldades)
4. [Estado Emocional](#estado-emocional)
5. [Preferências](#preferências)
6. [Contato](#contato)
7. [Metadados](#metadados)
8. [Privacidade e Segurança](#privacidade-e-segurança)

---

## 📊 Resumo

| Categoria | Campos | Obrigatórios | Opcionais |
|-----------|--------|--------------|-----------|
| Demográficos | 4 | 4 | 0 |
| Desafios | 2 | 1 | 1 |
| Estado Emocional | 5 | 0 (com default) | 5 |
| Preferências | 3 | 2 | 1 |
| Contato | 2 | 0 | 2 |
| **Total** | **16** | **7** | **9** |

---

## 👤 Dados Demográficos

### 1. Faixa Etária (`ageRange`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 1

**Opções:**
- `"13-17"` - 13 a 17 anos
- `"18-24"` - 18 a 24 anos
- `"25-34"` - 25 a 34 anos
- `"35-44"` - 35 a 44 anos
- `"45+"` - 45 anos ou mais

**Uso atual:**
- Segmentação demográfica
- Análise de público

**Uso futuro:**
- Recomendação de conteúdo adequado à idade
- Ajuste de linguagem e exemplos

---

### 2. Diagnóstico de TDAH (`hasDiagnosis`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 1

**Opções:**
- `"nao"` - Ainda não
- `"suspeito"` - Suspeito que sim
- `"sim"` - Sim, confirmadíssimo

**Uso atual:**
- Entender o público da plataforma
- Analytics sobre perfil dos usuários

**Uso futuro:**
- Personalizar tom das mensagens
- Sugerir recursos de diagnóstico oficial (para quem suspeita)
- Adaptar conteúdo educativo

---

### 3. Uso de Medicação (`usesMedication`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 1

**Opções:**
- `"nao"` - Não
- `"diariamente"` - Sim, diariamente
- `"especificos"` - Sim, em dias específicos

**Uso atual:**
- Compreender contexto do usuário
- Analytics

**Uso futuro:**
- Ajustar recomendações de horários (considerar efeito de medicação)
- Conteúdo sobre gerenciamento com/sem medicação

**⚠️ Privacidade:** Informação sensível - uso médico

---

### 4. Período de Maior Energia (`energyPeriod`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 1

**Opções:**
- `"manha"` - Manhã
- `"tarde"` - Tarde
- `"noite"` - Noite
- `"variavel"` - Variável

**Uso atual:**
- Analytics de padrões

**Uso futuro:**
- Sugerir horários ideais para hábitos
- Personalizar notificações/lembretes
- Recomendar hábitos adequados ao período

---

## 🎯 Desafios e Dificuldades

### 5. Desafios Principais (`challenges`)

**Tipo:** Array de Strings (múltipla escolha)
**Obrigatório:** Sim (mínimo 1)
**Etapa:** 2

**Opções:**
- `"Procrastinação"`
- `"Desorganização mental"`
- `"Desorganização física"`
- `"Falta de foco"`
- `"Impulsividade"`
- `"Sono/desgaste"`
- `"Relacionamentos/Comunicação"`
- `"Ansiedade/sobrecarga"`

**Uso atual:**
- Entender desafios mais comuns
- Analytics sobre padrões

**Uso futuro (prioritário):**
- **Sugestão de hábitos:** Recomendar hábitos específicos para cada desafio
- **Conteúdo personalizado:** Mostrar tips/livros relacionados aos desafios
- **Priorização:** Sugerir ordem de implementação de hábitos

**Exemplos de mapeamento:**
```
Procrastinação → Hábito: "Técnica Pomodoro de 5min"
Falta de foco → Hábito: "3 respirações profundas antes de tarefas"
Ansiedade/sobrecarga → Hábito: "Brain dump de 2min"
```

---

### 6. Desafio Específico (`specificChallenge`)

**Tipo:** String (texto livre, até ~500 caracteres)
**Obrigatório:** Não
**Etapa:** 2

**Uso atual:**
- Analytics qualitativo
- Entender nuances não capturadas nas opções

**Uso futuro:**
- Análise de sentimento
- Identificar novos desafios para adicionar às opções
- Possível chat/suporte personalizado

---

## 💭 Estado Emocional

Todos os campos de estado emocional são sliders de 1 a 5 com valor padrão 3.

### 7. Foco no Dia a Dia (`focusLevel`)

**Tipo:** Number (1-5)
**Obrigatório:** Não (default: 3)
**Etapa:** 3

**Escala:**
- 1 = Nenhum foco
- 5 = Muito focado

**Uso futuro:**
- Ajustar dificuldade inicial dos hábitos
- Recomendar técnicas de foco específicas

---

### 8. Motivação para Começar (`motivationLevel`)

**Tipo:** Number (1-5)
**Obrigatório:** Não (default: 3)
**Etapa:** 3

**Escala:**
- 1 = Nenhuma motivação
- 5 = Muita motivação

**Uso futuro:**
- Ajustar gamificação/recompensas
- Personalizar mensagens motivacionais
- Sugerir estratégias de motivação

---

### 9. Nível de Sobrecarga (`overloadLevel`)

**Tipo:** Number (1-5)
**Obrigatório:** Não (default: 3)
**Etapa:** 3

**Escala:**
- 1 = Nenhuma sobrecarga
- 5 = Muito sobrecarregado

**Uso futuro:**
- Ajustar número de hábitos sugeridos
- Recomendar mini-hábitos vs hábitos maiores
- Priorizar hábitos de autocuidado

---

### 10. Clareza de Objetivos (`clarityLevel`)

**Tipo:** Number (1-5)
**Obrigatório:** Não (default: 3)
**Etapa:** 3

**Escala:**
- 1 = Nenhuma clareza
- 5 = Muita clareza

**Uso futuro:**
- Recomendar exercícios de planejamento
- Ajustar onboarding de definição de metas
- Sugerir hábitos de organização/planejamento

---

### 11. Autoestima e Autoconfiança (`selfEsteemLevel`)

**Tipo:** Number (1-5)
**Obrigatório:** Não (default: 3)
**Etapa:** 3

**Escala:**
- 1 = Baixa autoestima
- 5 = Alta autoestima

**Uso futuro:**
- Personalizar tom das mensagens (mais encorajador)
- Ajustar dificuldade para evitar frustração
- Recomendar hábitos de autoconhecimento

---

## ⚙️ Preferências

### 12. Tempo Diário Disponível (`dailyTimeCommitment`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 4

**Opções:**
- `"5-10"` - 5 a 10 minutos
- `"10-20"` - 10 a 20 minutos
- `"20-30"` - 20 a 30 minutos
- `"30+"` - Mais de 30 minutos

**Uso futuro (prioritário):**
- **Sugestão de hábitos:** Recomendar apenas hábitos que cabem no tempo disponível
- **Alertas:** Avisar se usuário está criando hábitos além do tempo
- **Agrupamento:** Sugerir agrupamento de hábitos pequenos

---

### 13. Formatos Preferidos (`preferredFormats`)

**Tipo:** Array de Strings (múltipla escolha)
**Obrigatório:** Não
**Etapa:** 4

**Opções:**
- `"Vídeo curto"`
- `"Áudio guia"`
- `"Texto objetivo"`
- `"Checklist/Planilha"`

**Uso futuro (prioritário):**
- **Conteúdo personalizado:** Mostrar tips/meditações no formato preferido
- **Biblioteca:** Filtrar livros/recursos por formato
- **Notificações:** Ajustar tipo de conteúdo em emails

---

### 14. Ambiente de Prática (`environment`)

**Tipo:** String (select único)
**Obrigatório:** Sim
**Etapa:** 4

**Opções:**
- `"casa"` - Casa
- `"trabalho"` - Trabalho/Estudo
- `"externo"` - Espaço externo
- `"outro"` - Outro (especificar)

**Uso futuro:**
- Sugerir hábitos adequados ao ambiente
- Adaptar instruções (ex: "em casa" vs "no trabalho")

---

### 15. Ambiente Outro (`environmentOther`)

**Tipo:** String (texto livre)
**Obrigatório:** Condicional (se `environment === "outro"`)
**Etapa:** 4

**Uso futuro:**
- Analytics para identificar novos ambientes comuns
- Possível adição de novas opções

---

## 📧 Contato

### 16. Email (`email`)

**Tipo:** String (email válido)
**Obrigatório:** Não
**Etapa:** 5

**Uso atual:**
- Marketing e comunicação
- Envio de dicas/novidades

**⚠️ Privacidade:** Dados pessoais - requer consentimento

---

### 17. Consentimento para Emails (`consent`)

**Tipo:** Boolean
**Obrigatório:** Condicional (se `email` preenchido)
**Etapa:** 5

**Uso:**
- LGPD/GDPR compliance
- Autorização explícita para envio de emails

---

## 🔢 Metadados

Dados salvos automaticamente pelo sistema:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro de onboarding |
| `session_id` | UUID | ID da sessão de métricas do usuário |
| `user_id` | UUID | ID do usuário autenticado (FK para auth.users) |
| `completed_at` | Timestamp | Data/hora de conclusão do onboarding |
| `created_at` | Timestamp | Data/hora de criação do registro |

---

## 🔐 Privacidade e Segurança

### Dados Sensíveis

**Informações médicas:**
- `hasDiagnosis` (diagnóstico de TDAH)
- `usesMedication` (uso de medicação)

**Dados pessoais:**
- `email` (requer consentimento)
- `user_id` (vincula a conta)

### Armazenamento

- **Formato:** JSONB no campo `answers` da tabela `onboarding_responses`
- **Acesso:** Apenas usuário autenticado pode ver seus próprios dados
- **RLS (Row Level Security):** Ativo
  ```sql
  CREATE POLICY "Users can view their own onboarding responses"
  ON public.onboarding_responses
  FOR SELECT
  USING (auth.uid() = user_id);
  ```

### LGPD/GDPR Compliance

✅ **Consentimento explícito:** Checkbox para emails
✅ **Finalidade clara:** Informado no onboarding
✅ **Acesso restrito:** Apenas o próprio usuário
✅ **Direito ao esquecimento:** Possível deletar dados (a implementar)

---

## 📈 Analytics e Uso dos Dados

### Agregações Úteis

```sql
-- Desafios mais comuns
SELECT
  challenge,
  COUNT(*) as count
FROM onboarding_responses,
  jsonb_array_elements_text(answers->'challenges') as challenge
GROUP BY challenge
ORDER BY count DESC;

-- Distribuição de faixas etárias
SELECT
  answers->>'ageRange' as age_range,
  COUNT(*) as count
FROM onboarding_responses
GROUP BY age_range;

-- Média de níveis emocionais
SELECT
  AVG((answers->>'focusLevel')::int) as avg_focus,
  AVG((answers->>'motivationLevel')::int) as avg_motivation,
  AVG((answers->>'overloadLevel')::int) as avg_overload
FROM onboarding_responses;
```

---

## 🚀 Roadmap de Uso dos Dados

### Fase 1 (Imediata) ✅
- Coleta de dados
- Armazenamento seguro
- Analytics básico

### Fase 2 (Curto Prazo)
- Sugestão de hábitos baseada em `challenges`
- Filtragem de conteúdo por `preferredFormats`
- Ajuste de tempo de hábitos baseado em `dailyTimeCommitment`

### Fase 3 (Médio Prazo)
- Personalização de horários via `energyPeriod`
- Recomendação de dificuldade via níveis emocionais
- Conteúdo adaptado por `ageRange`

### Fase 4 (Longo Prazo)
- ML para prever hábitos com maior chance de sucesso
- Clustering de usuários por perfil
- Recomendações cross-usuário

---

## 📝 Exemplo de Dados Completos

```json
{
  "ageRange": "25-34",
  "hasDiagnosis": "suspeito",
  "usesMedication": "nao",
  "energyPeriod": "manha",
  "challenges": [
    "Procrastinação",
    "Falta de foco",
    "Ansiedade/sobrecarga"
  ],
  "specificChallenge": "Tenho dificuldade em começar projetos grandes, fico travado pensando em todas as etapas",
  "focusLevel": 2,
  "motivationLevel": 3,
  "overloadLevel": 4,
  "clarityLevel": 2,
  "selfEsteemLevel": 3,
  "dailyTimeCommitment": "10-20",
  "preferredFormats": [
    "Vídeo curto",
    "Checklist/Planilha"
  ],
  "environment": "casa",
  "environmentOther": null,
  "email": "usuario@exemplo.com",
  "consent": true
}
```

**Interpretação:**
- Adulto jovem, suspeita de TDAH, sem medicação
- Trabalha melhor de manhã
- Principais desafios: procrastinação, foco, ansiedade
- Níveis baixos de foco e clareza, alta sobrecarga
- Prefere conteúdo visual/prático, tem 10-20min/dia
- Pratica em casa

**Sugestões automáticas possíveis:**
1. Hábito: "Técnica Pomodoro de 5min" (foco + procrastinação)
2. Hábito: "Brain dump matinal" (ansiedade + clareza + manhã)
3. Conteúdo: Vídeos curtos sobre quebrar projetos grandes
4. Timing: Lembretes/notificações pela manhã

---

**Última atualização:** 2025-11-11
**Responsável:** Bruno (com assistência de Claude Code)
