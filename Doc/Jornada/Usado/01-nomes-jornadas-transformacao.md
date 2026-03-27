# 01 - Nomes de Jornadas: De Genericos para Transformacionais

## Problema

Os nomes atuais das jornadas sao **funcionais e descritivos**, mas nao comunicam transformacao. Eles descrevem a ATIVIDADE ("Detox de Dopamina", "Controle Total") em vez de comunicar QUEM o usuario vai se tornar. A landing page do Bora promete mudanca de vida, mas ao entrar no app e ver "Detox de Dopamina", o usuario sente que esta se inscrevendo num curso, nao iniciando uma transformacao pessoal.

### Comparacao com Referencia (Duolingo)
O Duolingo nao diz "Curso de Espanhol Basico". Diz "Comece sua jornada" e a cada licao o usuario SENTE progresso. Os nomes das jornadas do Bora precisam funcionar como uma promessa de identidade.

---

## Estado Atual

### Nomes L1 (Level 1)

| Slug | Titulo Atual | Subtitulo Atual | Promise |
|------|-------------|-----------------|---------|
| `digital-detox-l1` | "Detox de Dopamina" | "Resetar Minha Vida Digital" | "Reduza seu tempo de tela pela metade, durma 1 hora a mais..." |
| `own-mornings-l1` | "Domine Suas Manhas" | "Rotina Matinal de Elite" | "Construa uma rotina matinal que transforma suas manhas..." |
| `gym-l1` | "Do Sofa ao Shape" | "Primeiros 30 Dias na Academia" | "Saia da inercia e construa o habito de treinar..." |
| `focus-protocol-l1` | "Domine Sua Atencao" | "Protocolo de Foco" | "Recupere sua capacidade de concentracao profunda..." |
| `finances-l1` | "Controle Total" | "Financas Pessoais" | "Tome controle das suas financas em 30 dias..." |

### Nomes L2 (Level 2)

| Slug | Titulo Atual | Subtitulo Atual |
|------|-------------|-----------------|
| `digital-detox-l2` | "Digital Minimalism" | "Produtividade Intencional" |
| `own-mornings-l2` | "Own Your Mornings L2" | "Manha Avancada" |
| `gym-l2` | "Protocolo de Hipertrofia" | "Shape Avancado" |
| `focus-protocol-l2` | "Aprendizado Acelerado" | "Foco Avancado" |
| `finances-l2` | "Faca Seu Dinheiro Trabalhar" | "Financas Avancadas" |

### Onde os Nomes Aparecem
1. **JourneyHub.tsx** — Cards do catalogo (titulo + subtitulo + promise)
2. **JourneyDetail.tsx** — Header da pagina (titulo grande + subtitulo)
3. **JourneySelectionStep.tsx** — Onboarding (cards de selecao)
4. **DailyMissionCard.tsx** — Dashboard (referencia a jornada ativa)
5. **JourneyBadge.tsx** — Badges nos habit cards
6. **Notificacoes push** — Mensagens de lembrete

---

## Principios Psicologicos Aplicados

### 1. Identity-Based Change (James Clear)
> "O objetivo nao e ler um livro. O objetivo e se tornar um leitor."

Nomes devem referenciar QUEM voce se torna, nao O QUE voce faz.
- "Detox de Dopamina" (atividade) → "Eu Controlo a Tela" (identidade)

### 2. Loss Aversion (Kahneman)
> "A dor de perder e 2x mais forte que o prazer de ganhar."

Nomes que mostram o que esta PERDENDO por nao agir.
- "Controle Total" (neutro) → "Nunca Mais Quebrado" (perda evitada)

### 3. Aspiration Framing
> "As pessoas nao compram produtos. Compram versoes melhores de si mesmas."

Nomes que criam uma visao aspiracional.
- "Domine Suas Manhas" (imperativo generico) → "Manha de Elite" (exclusividade)

### 4. Concrete vs Abstract
> "Promessas concretas geram mais acao que abstratas."

Nomes concretos e visualizaveis.
- "Domine Sua Atencao" (abstrato) → "Foco Inabalavel" (concreto, visualizavel)

---

## Proposta de Novos Nomes

### L1 — Jornadas Nivel 1

#### Digital Detox L1
| Opcao | Nome | Subtitulo | Principio |
|-------|------|-----------|-----------|
| **A (Recomendada)** | **"Eu Controlo a Tela"** | "Reset de Dopamina em 30 Dias" | Identidade: EU sou o agente |
| B | "30 Dias Sem Coleira" | "Liberte-se da Tela" | Loss Aversion: coleira = submissao |
| C | "Reset de Dopamina" | "Recupere Seu Cerebro em 30 Dias" | Concreto: reset = reinicio claro |

**Justificativa da escolha A:** "Eu Controlo a Tela" coloca o usuario como protagonista. O pronome "Eu" cria commitment psicologico — ao selecionar essa jornada, ele esta dizendo para si mesmo "eu sou alguem que controla a tela". Isso ativa identity-based change.

#### Own Your Mornings L1
| Opcao | Nome | Subtitulo | Principio |
|-------|------|-----------|-----------|
| **A (Recomendada)** | **"Manha de Elite"** | "Sua Rotina Matinal Imbativel" | Aspiracao + exclusividade |
| B | "Acordo Como Rei" | "Domine Suas Primeiras Horas" | Identidade: rei = poderoso |
| C | "5h da Manha: Sua Vantagem" | "A Rotina Que Separa os Comuns dos Fora da Curva" | Concreto + exclusao social |

**Justificativa da escolha A:** "Manha de Elite" e curto, aspiracional e alinha com o subtitulo original "Rotina Matinal de Elite". Cria senso de pertencimento a um grupo exclusivo.

#### Gym L1
| Opcao | Nome | Subtitulo | Principio |
|-------|------|-----------|-----------|
| **A (Recomendada)** | **"Do Zero ao Treino"** | "Primeiros 30 Dias na Academia" | Relatable + Goal-Gradient |
| B | "Monstro de 30 Dias" | "Construa Seu Shape Do Zero" | Identidade: monstro = forte |
| C | "Corpo Que Impoe Respeito" | "Saia da Inercia em 30 Dias" | Aspiracao + respeito social |

**Justificativa da escolha A:** O publico-alvo sao homens que NAO treinam e sentem vergonha. "Monstro" e "Corpo Que Impoe Respeito" podem intimidar. "Do Zero ao Treino" e honesto, relatable e mostra que o ponto de partida e zero — sem julgamento.

#### Focus Protocol L1
| Opcao | Nome | Subtitulo | Principio |
|-------|------|-----------|-----------|
| **A (Recomendada)** | **"Foco Inabalavel"** | "Protocolo de Atencao Profunda" | Identidade + aspiracao |
| B | "30 Dias de Deep Work" | "Concentracao Que Ninguem Mais Tem" | Social proof + exclusao |
| C | "Sua Atencao, Sua Arma" | "Transforme Distracao em Produtividade" | Identidade + empoderamento |

**Justificativa da escolha A:** "Foco Inabalavel" e bold, memoravel e descreve um ESTADO de ser, nao uma atividade. O usuario que seleciona isso esta dizendo "eu quero ser alguem com foco inabalavel".

#### Finances L1
| Opcao | Nome | Subtitulo | Principio |
|-------|------|-----------|-----------|
| **A (Recomendada)** | **"Nunca Mais Quebrado"** | "Financas Pessoais em 30 Dias" | Loss Aversion direta |
| B | "Dinheiro no Bolso" | "Controle Financeiro Sem Planilha" | Endowment + concreto |
| C | "Mindset de Rico" | "Pense Como Quem Tem Dinheiro" | Identidade + aspiracao |

**Justificativa da escolha A:** "Nunca Mais Quebrado" ataca diretamente a DOR do publico-alvo. Loss aversion e o principio psicologico mais forte em decisoes financeiras. O nome cria um compromisso emocional: "nunca mais" = permanente.

### L2 — Jornadas Nivel 2

| Slug | Atual | Novo Nome | Novo Subtitulo | Acao |
|------|-------|-----------|----------------|------|
| `digital-detox-l2` | "Digital Minimalism" | **"Produtividade Intencional"** | (manter) | Renomear — "Digital Minimalism" e em ingles |
| `own-mornings-l2` | "Own Your Mornings L2" | **"Manha Avancada: Protocolo 5h"** | "Rotina Matinal Nivel 2" | Renomear — nome atual em ingles + generico |
| `gym-l2` | "Protocolo de Hipertrofia" | (manter) | (manter) | Ja e forte e tecnico — ideal para L2 |
| `focus-protocol-l2` | "Aprendizado Acelerado" | (manter) | (manter) | Ja e aspiracional — manter |
| `finances-l2` | "Faca Seu Dinheiro Trabalhar" | (manter) | (manter) | Ja e acao-orientado — manter |

---

## Implementacao

### Arquivo a Criar
`App/supabase/migrations/YYYYMMDD_rename_journeys.sql`

### SQL
```sql
-- Rename L1 journeys to transformation-focused names
UPDATE public.journeys
SET title = 'Eu Controlo a Tela', subtitle = 'Reset de Dopamina em 30 Dias'
WHERE slug = 'digital-detox-l1';

UPDATE public.journeys
SET title = 'Manhã de Elite', subtitle = 'Sua Rotina Matinal Imbatível'
WHERE slug = 'own-mornings-l1';

UPDATE public.journeys
SET title = 'Do Zero ao Treino', subtitle = 'Primeiros 30 Dias na Academia'
WHERE slug = 'gym-l1';

UPDATE public.journeys
SET title = 'Foco Inabalável', subtitle = 'Protocolo de Atenção Profunda'
WHERE slug = 'focus-protocol-l1';

UPDATE public.journeys
SET title = 'Nunca Mais Quebrado', subtitle = 'Finanças Pessoais em 30 Dias'
WHERE slug = 'finances-l1';

-- Rename L2 journeys that need Portuguese names
UPDATE public.journeys
SET title = 'Produtividade Intencional'
WHERE slug = 'digital-detox-l2';

UPDATE public.journeys
SET title = 'Manhã Avançada: Protocolo 5h', subtitle = 'Rotina Matinal Nível 2'
WHERE slug = 'own-mornings-l2';
```

### Impacto
- **Zero mudancas em codigo** — nomes vem do banco via queries existentes
- **Todos os touchpoints atualizam automaticamente** (Hub, Detail, Onboarding, Dashboard, Badges, Notificacoes)
- **Deploy:** `supabase db push` + app ja renderiza os novos nomes

### Verificacao
1. Rodar migration no Supabase
2. Abrir JourneyHub → verificar novos nomes nos cards
3. Abrir JourneyDetail de cada jornada → titulo e subtitulo corretos
4. Iniciar flow de onboarding → JourneySelectionStep mostra novos nomes
5. Dashboard com jornada ativa → DailyMissionCard mostra novo nome

---

## Metricas de Sucesso
- **Taxa de inicio de jornada** (onboarding): esperado +15-25% com nomes mais emocionais
- **Engajamento no JourneyHub**: esperado +10% em cliques nos cards
- **Retencao dia 1-3**: nomes com identity framing devem reduzir abandono precoce
