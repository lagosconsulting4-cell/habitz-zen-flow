# Quiz da Landing Page — Bora

Documentacao de referencia do quiz de conversao na landing page, projetado para engajar visitantes e converter em assinantes.

---

## Visao Geral

- **Proposito**: Diagnostico comportamental + conversao para assinatura paga
- **Projeto**: `Landing/` (projeto separado — React + TypeScript + Vite)
- **Duas Versoes**:
  1. **Quiz Rapido** (`/quiz`) — 10 perguntas simples + scoring + oferta
  2. **Quiz Completo Bora** (`/bora`) — 33 steps com perguntas + feedbacks + persuasao + coleta de dados + oferta
- **Output**: Score de severidade, coleta de lead (email/nome/telefone), redirecionamento para checkout

---

## Arquivos Fonte

| Arquivo | Descricao |
|---------|-----------|
| `Landing/src/pages/Quiz.tsx` | Quiz rapido (10 perguntas) |
| `Landing/src/pages/bora/BoraQuizPage.tsx` | Entry point do quiz completo |
| `Landing/src/components/quiz/QuizModal.tsx` | Orquestrador dos 33 steps |
| `Landing/src/components/quiz/QuizProvider.tsx` | Context provider (estado + logica) |
| `Landing/src/components/quiz/steps/*.tsx` | ~45 componentes de step |
| `Landing/src/lib/quizScoring.ts` | Sistema de pontuacao (0-30) |
| `Landing/src/lib/quizConfig.ts` | Config de recomendacao + tipos |
| `Landing/src/lib/quizThemes.ts` | 4 temas de cor |

---

## VERSAO 1: Quiz Rapido (`/quiz`)

### Estrutura
- 10 perguntas de multipla escolha (4 opcoes cada)
- Tela de feedback motivacional no meio (apos pergunta 5)
- Tela de resultado com score
- Redirecionamento para SubscriptionOffersStep

### As 10 Perguntas

| # | Icone | Pergunta | Opcoes |
|---|-------|----------|--------|
| 1 | Target | "O que voce mais gostaria de melhorar na sua rotina agora?" | Consistencia / Energia / Organizar tempo / Reduzir procrastinacao |
| 2 | Clock | "Quanto tempo voce realmente tem disponivel no seu dia para cuidar de habitos?" | <10min / 10-30min / ~1h / >1h |
| 3 | Zap | "Como anda sua energia durante o dia?" | Sempre exausto / Instavel / Razoavel / Disposto |
| 4 | Heart | "Como voce se sente hoje em relacao a sua rotina?" | Cansado e perdido / Frustrado / Ok mas podia melhorar / Com vontade de ajustar |
| 5 | Construction | "O que realmente te impede de viver como voce quer?" | Falta disciplina / Paralisia / Falta tempo / Nada especifico |
| 6 | BarChart3 | "Quando voce cria uma meta, o que geralmente acontece?" | Desisto em 2 semanas / Perco energia rapido / Mantenho algumas / Geralmente atinjo |
| 7 | Compass | "Qual faixa de renda mais se aproxima da sua realidade atual?" | Ate R$2K / R$2K-R$5K / R$5K-R$10K / Acima R$10K |
| 8 | Brain | "Qual e a sua faixa etaria?" | 18-25 / 26-35 / 36-45 / 46+ |
| 9 | Sprout | "Voce ja tentou manter habitos antes?" | Varias vezes sem sucesso / Algumas com sucesso parcial / Poucas vezes / Nunca |
| 10 | Target | "O que voce espera encontrar ao final deste diagnostico?" | Clareza / Plano simples / Entender por que nao consigo / Todas acima |

### Tela de Feedback (entre pergunta 5 e 6)
- Icone Heart com fill
- Titulo: "Pouco tempo ja e suficiente"
- Texto: "Nao e sobre fazer tudo. E sobre fazer algo que caiba ate nos dias cansativos."
- Botao: "Continuar"

### Sistema de Pontuacao

**Arquivo**: `Landing/src/lib/quizScoring.ts`

- Cada pergunta: opcao 1 (pior) = 3pts, opcao 2 = 2pts, opcao 3 = 1pt, opcao 4 (melhor) = 0pts
- Score total: 0-30 pontos
- Niveis de severidade:
  - **0-10 = Leve** (verde) — "Voce ja tem bons habitos! Com um pouco mais de organizacao..."
  - **11-20 = Moderado** (amarelo) — "Voce tem potencial, mas precisa de um sistema..."
  - **21-30 = Severo** (vermelho) — "Sua rotina precisa de uma transformacao..."

### Tela de Resultado
- Trofeu animado com cor baseada na severidade
- Score X/30 com barra de progresso animada
- Mensagem: "Criamos um plano simples para voce"
- CTA: "Ver meu plano personalizado" -> SubscriptionOffersStep

### Features de UX
- Swipe gestures (esquerda = proxima, direita = anterior)
- Barra de progresso premium animada
- Tracking por pergunta (tempo, indice da resposta)
- Tracking de abandono no unmount
- Resultado salvo em `sessionStorage`

---

## VERSAO 2: Quiz Completo Bora (`/bora`)

### Estrutura
33 steps (0-32) organizados em blocos:
- Steps de pergunta (coleta de dados)
- Steps de feedback (reforco emocional/social proof)
- Deep bridge (analise + diagnostico personalizado)
- Coleta de dados pessoais (email, nome, telefone)
- Loading + oferta final

### Fluxo Completo — 33 Steps

#### BLOCO 1: Perguntas Iniciais (Steps 0-5)

| Step | Componente | Tipo | Pergunta/Conteudo |
|------|-----------|------|-------------------|
| 0 | HeroStep | Hero | "Vire a sua melhor versao" — CTA "Iniciar jornada" com imagem de fundo fullscreen |
| 1 | PainRecognitionStep | Pergunta | "Voce procrastina coisas importantes?" — Opcoes: Nunca / As vezes / Frequentemente / Sempre |
| 2 | MindRacingStep | Pergunta | "Sua mente dispara quando voce deita pra dormir?" — Opcoes: Sim toda noite / As vezes / Raramente |
| 3 | CycleAwarenessStep | Pergunta | "Voce ja tentou mudar e desistiu no meio?" — Opcoes: Sim varias / Uma ou duas / Na verdade nao |
| 4 | ObjectiveStep | Pergunta | Objetivo principal (productivity/health/mental/routine/avoid) |
| 5 | TimeAvailableStep | Pergunta | Tempo disponivel (5min/15min/30min/1h) |

#### BLOCO 2: Feedback + Perguntas (Steps 6-11)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 6 | FeedbackTimeStep | Feedback | "Perfeito. Com [X], o sistema ajusta tudo pra voce evoluir sem travar." + "Constancia > Intensidade" (typing animation) |
| 7 | EnergyPeakStep | Pergunta | Pico de energia (manha/tarde/noite) |
| 8 | ProfessionStep | Pergunta | Profissao (student/employed/entrepreneur/freelancer/other) |
| 9 | FeedbackAdaptStep | Feedback | "Fique Tranquilo! O sistema se adapta a sua realidade" — Social proof com avatars e "+87% dos [profissao] mantem habitos por 6+ meses" |
| 10 | AgeStep | Pergunta | Faixa etaria |
| 11 | FeedbackAgeChartStep | Feedback | Grafico de faixa etaria — social proof visual |

#### BLOCO 3: Desafios + Sentimentos (Steps 12-16)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 12 | ChallengesStep | Pergunta | Desafios (multi-select: Procrastinacao, Foco, Esquecimento, Cansaco, Ansiedade, Motivacao) |
| 13 | GenderStep | Pergunta | Genero (Masculino/Feminino/Outro/Prefiro nao dizer) |
| 14 | SocialProofChartStep | Feedback | Grafico de prova social — percentuais de melhoria |
| 15 | ConsistencyFeelingStep | Pergunta | "Sobre ter consistencia... como voce se sente?" — Opcoes: Frustrado / Evitando / Conformado / Determinado / Estou bem com isso |
| 16 | ProjectedFeelingStep | Pergunta | "Se estivesse [objetivo], como se sentiria?" — Slider de emoji: Igual -> Melhor -> Muito melhor -> Realizado -> Transformado |

#### BLOCO 4: Persuasao + Social Proof (Steps 17-23)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 17 | TestimonialsStep | Feedback | Carrossel de depoimentos |
| 18 | YearsPromisingStep | Pergunta | "Ha quanto tempo voce promete que vai mudar?" — Opcoes com emoji: <1 ano / 1-2 anos / 3-5 anos / 5+ anos |
| 19 | UrgencyStep | Feedback | Tela de urgencia — timer regressivo |
| 20 | PotentialChartStep | Feedback | Grafico de potencial — visualizacao de evolucao |
| 21 | FeatureSeedingStep | Pergunta | Apresentacao de features do app |
| 22 | ScientificProofStep | Feedback | Prova cientifica — dados e pesquisas |
| 23 | AppExplanationStep | Feedback | Explicacao de como o app funciona |

#### BLOCO 5: Deep Bridge — Analise Personalizada (Steps 24-27)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 24 | AnalysisLoadingStep | Loading | Animacao de analise (6s): "Montando seu roteiro..." / "Cruzando seus dados..." / "Calculando sua rota..." / "Adaptando para sua rotina..." / "Comparando com 15.420 perfis..." / "Gerando seu plano..." — com depoimentos rotativos |
| 25 | DiagnosisStep | Resultado | Diagnostico personalizado baseado no desafio principal — mostra: titulo, descricao, dificuldade principal, momento critico, gatilho, nivel de impacto (meter visual). Avatar muda por genero. |
| 26 | TransformationStep | Feedback | Showcase antes/depois — transformacao possivel |
| 27 | SimilarityMatchStep | Feedback | Match de similaridade com outros usuarios |

#### BLOCO 6: Coleta de Dados Pessoais (Steps 28-30)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 28 | DataCollectionStep | Input | Coleta de email |
| 29 | NameStep | Input | Coleta de nome |
| 30 | PhoneStep | Input | Coleta de telefone (WhatsApp) |

#### BLOCO 7: Loading + Oferta (Steps 31-32)

| Step | Componente | Tipo | Conteudo |
|------|-----------|------|----------|
| 31 | LoadingPlanStep | Loading | Animacao de geracao do plano personalizado |
| 32 | SubscriptionOffersStep | Oferta | Planos de assinatura (mensal/anual) via Stripe/Hubla — mockup do app, selos de confianca, FAQ |

---

## Diagnosticos Personalizados (Step 25)

Baseado no desafio principal do usuario:

| Desafio | Titulo | Descricao | Nivel |
|---------|--------|-----------|-------|
| Procrastinacao | "Voce fica travado na hora de comecar" | Sabe o que precisa fazer mas adia | 85% |
| Foco | "Voce perde o fio do raciocinio facil" | Celular e ambiente conspiram contra | 80% |
| Constancia | "Voce comeca com tudo e nao termina" | Semana 1 euforia, semana 2 some | 75% |
| Energia | "Voce acorda ja cansado" | Dia mal comeca e ja parece pesado | 78% |
| Default | "Sua rotina atual ta te pesando" | Poderia render mais, algo atrapalha | 78% |

---

## Temas de Cor

**Arquivo**: `Landing/src/lib/quizThemes.ts`

| Tema | Emoji | Descricao | Cor |
|------|-------|-----------|-----|
| Jade | ----- | Objetivo. Confiante. | Lime green |
| Aurora | ---- | Criativo. Profundo. | Violeta |
| Chama | ---- | Intenso. Ousado. | Laranja |
| Gelo | ----- | Focado. Sereno. | Ciano |

(Nota: ThemeSelectionStep esta temporariamente removido do fluxo)

---

## Armazenamento de Dados

### Banco de dados: tabela `quiz_responses`
**Migration**: `App/supabase/migrations/20251223000000_create_quiz_responses.sql`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Primary key |
| name | text | Nome do lead |
| email | text | Email do lead |
| phone | text | Telefone (WhatsApp) |
| age_range | text | Faixa etaria |
| profession | text | Profissao |
| gender | text | Genero |
| financial_range | text | Faixa de renda |
| energy_peak | text | Pico de energia |
| time_available | text | Tempo disponivel |
| objective | text | Objetivo principal |
| challenges | JSONB | Array de desafios |
| consistency_feeling | text | Sentimento sobre consistencia |
| projected_feeling | text | Sentimento projetado |
| years_promising | text | Ha quanto tempo promete mudar |
| recommended_habits | JSONB | Array de habitos recomendados |
| source | text | Default: 'landing_quiz' |
| utm_source, utm_medium, utm_campaign | text | Tracking UTM |
| completed | boolean | Quiz finalizado |
| converted_to_customer | boolean | Converteu em cliente |

### Session Storage (client-side)
- `bora_quiz_result` — resultado do quiz rapido (score, severity)
- `bora_quiz_answers` — respostas do quiz rapido

---

## Rotas

```
/quiz                    -> Quiz rapido (10 perguntas)
/bora                    -> Quiz completo (33 steps)
/bora/upsell             -> Upsell plano anual
/bora/downsell           -> Downsell plano mensal
/offer                   -> Pagina de oferta
/obrigado                -> Pagina de agradecimento pos-compra
```

---

## Fluxo de Conversao

```
Quiz Rapido (/quiz):
  10 perguntas -> Feedback mid -> Resultado (score) -> "Ver meu plano" -> SubscriptionOffersStep

Quiz Completo (/bora):
  Hero -> 23 steps (perguntas + feedbacks + persuasao)
  -> Deep Bridge (analise + diagnostico)
  -> Coleta (email + nome + telefone)
  -> Loading -> SubscriptionOffersStep

SubscriptionOffersStep:
  - Plano Mensal: R$ 9.86/mes (Stripe)
  - Plano Anual: R$ 118.32/ano (Hubla)
  -> Checkout externo -> /obrigado
```

---

## Visibilidade da Header

No quiz completo, a header (progress bar + back button + logo) fica oculta nos seguintes steps:
- Step 0 (Hero)
- Step 9 (FeedbackAdapt)
- Step 17 (Testimonials)
- Step 22 (ScientificProof)
- Step 23 (AppExplanation)
- Step 32 (SubscriptionOffers)

---

## Analytics / Tracking

- `quiz_answer` — resposta individual (step, pergunta, resposta, tempo)
- `quiz_abandoned` — abandono (ultimo step, tempo total)
- `quiz_mid_feedback_viewed` — tela de feedback mid-quiz
- `quiz_celebration_viewed` — tela de resultado (score, severity)
- `checkout_button_clicked` — CTA de checkout (plano, preco, provider)
- `quiz_modal_opened` / `quiz_modal_closed` — abertura/fechamento do modal
- PostHog para tracking de usuario
- UTM parameters passados para links de checkout
