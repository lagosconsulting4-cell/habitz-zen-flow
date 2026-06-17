# Arco Emocional do Funil /bora — Diagnóstico + Reframe (simplificar)

## ✅ IMPLEMENTADO (2026-06-17) — build verde
Aplicado o reframe completo no fluxo primário (`QuizModal.tsx` + `QuizProvider.tsx` `totalSteps 33→27`):
- **6 steps cortados** (redundância de prova/dor): CycleAwareness, FeedbackAdapt, FeedbackAgeChart, SocialProofChart, PotentialChart, ScientificProof. *(arquivos preservados p/ A/B; só saíram do switch.)*
- **Culpa movida pro Ato 1** (YearsPromising → step 3) e **urgência movida pra perto da oferta** (step 21) → mata o chicote esperança→culpa→urgência.
- **Pico = identidade** (Transformation, step 19); **prova consolidada** em 1 beat (Testimonials, 16).
- **DiagnosisStep retonado** (anti-ansiedade): "Resumo do que encontramos"→"Sua leitura de rotina"; "Detectado"→"No seu radar"; "Nível de impacto"→"O que mais pesa na sua rotina hoje"; "Alto impacto"→"Foco principal".
- **Bônus:** os 3 stats fabricadas que estavam flagadas saíram junto (estavam em SocialProofChart "94/100", ScientificProof "89%", FeedbackAdapt "+87%").

**Por que 27 e não ~20:** os steps restantes são qualificação (alimentam a personalização) ou business-critical (email/telefone p/ recuperação WhatsApp). Cortar mais danificaria o produto/remarketing — não cortei sem seu OK. Visual/componentes intactos.

**Headline suavizada:** "seu plano personalizado está pronto" → **"sua rotina já está pronta"** (`SubscriptionOffersStep.tsx:143/145` + `CongratsStep.tsx:72`), mantendo o realce lime. Casa com a decisão de não vender profundidade que o Bora não entrega.

---


> Lente: emotional-arc-designer. Objetivo: **simplificar** o arco e reenquadrar pra "habit tracker web honesto + identidade (seja sua melhor versão)", sem perder desejo/conversão. Mantém componentes e visual (que estão bons) — muda **sequência, ritmo e 1-2 picos**. Não reescreve copy boa.

## Alvo humano (tráfego TikTok pago)
- **Emoção de entrada:** curioso + meio cético + **culpa/frustração de baixa intensidade** ("eu sempre prometo que vou mudar e não mantenho") + um tanto sobrecarregado.
- **Emoção de saída (pra pagar):** **calma confiança + autorreconhecimento + esperança crível** — "isso é simples, é sobre mim, eu consigo fazer". **NÃO** pânico/urgência fabricada.
- Decisão (matriz): entrada sobrecarregada → **simplificar, sequenciar, reduzir carga cognitiva**. Hoje faz o oposto.

## Arco ATUAL (33 steps) — onde sobrecarrega

| # | Step | Função emocional | Flag |
|---|---|---|---|
| 0 | Hero | aspiração ("vire sua melhor versão") | ✅ bom (entrada) |
| 1 | PainRecognition | dor (procrastinação) | ⚠️ |
| 2 | MindRacing | dor (ansiedade) | ⚠️ 3 dores seguidas |
| 3 | CycleAwareness | dor (ciclo tenta-falha) | ⚠️ redundante |
| 4 | Objective | qualificação | ✅ |
| 5 | TimeAvailable | qualificação | ✅ |
| 6 | FeedbackTime | alívio ("dá pra fazer") | ✅ (1º alívio) |
| 7 | EnergyPeak | qualificação | ✅ |
| 8 | Profession | qualificação | ✅ |
| 9 | FeedbackAdapt | alívio + prova (+87%) | ⚠️ prova nº2 |
| 10 | Age | qualificação | ✅ |
| 11 | FeedbackAgeChart | prova (chart) | 🔴 prova nº3 |
| 12 | Challenges | qualificação/dor | ✅ |
| 13 | Gender | qualificação | ✅ |
| 14 | SocialProofChart | prova ("94 de cada 100") | 🔴 prova nº4 |
| 15 | ConsistencyFeeling | dor/emoção | ⚠️ |
| 16 | ProjectedFeeling | esperança/projeção | ✅ (vira p/ cima) |
| 17 | Testimonials | prova social | 🔴 prova nº5 |
| 18 | YearsPromising | **culpa** ("há anos você promete") | 🔴 **chicote**: vem DEPOIS da esperança |
| 19 | Urgency | tensão/urgência | ⚠️ urgência cedo demais |
| 20 | PotentialChart | desejo (chart) | 🔴 prova nº6 |
| 21 | FeatureSeeding | valor/features | ✅ |
| 22 | ScientificProof | prova ("89%") | 🔴 prova nº7 |
| 23 | AppExplanation | clareza (o que é o app/PWA) | ✅ (honestidade — manter) |
| 24 | AnalysisLoading | antecipação | ✅ |
| 25 | Diagnosis | **clímax = "Detectado/78%"** | 🔴 pico no lugar errado + ansiedade encenada |
| 26 | Transformation | **identidade ("sua melhor versão")** | ✅ **deveria ser O pico** |
| 27 | SimilarityMatch | identificação/prova | ✅ (já honesto) |
| 28 | DataCollection | fricção (email) | ✅ necessário |
| 29 | Name | fricção leve | ✅ |
| 30 | Phone | fricção | ⚠️ avaliar necessidade |
| 31 | LoadingPlan | antecipação ("seu plano") | ✅ |
| 32 | SubscriptionOffers | **ação (oferta)** | ✅ exit |

**3 problemas centrais:**
1. **Prova demais** — 7 interlúdios de validação (6,9,11,14,17,20,22). Arousal constante = fadiga e memória fraca (Failure Mode 2). Bastam ~2.
2. **Chicote emocional** — esperança (16) → culpa (18) → urgência (19). Subir-descer-subir gera ceticismo. A culpa pertence ao **início** (reconhecimento), não depois da esperança.
3. **Pico no lugar errado** — o clímax virou o "diagnóstico clínico" (25, ansiedade encenada, fronteira ética). O pico deveria ser a **identidade** (26).

## Arco SIMPLIFICADO (alvo ~20 steps) — 4 atos

**Ato 1 — Reconhecimento "isso é sobre mim" (anti-culpa)**
Hero(0) → **1 dor combinada** (procrastinação+mente acelerada+ciclo, hoje 1/2/3) → **a culpa entra aqui** (YearsPromising movido p/ cá) com reframe imediato *"não é falta de força de vontade — é o método que faltava"*. Curiosidade + autorreconhecimento, sem martelar.

**Ato 2 — Personalização leve (montar o plano)**
Só as perguntas que o motor usa: Objective, Time, Energy, Profession, Age, Challenges, Gender, ConsistencyFeeling. **1 alívio** no meio (FeedbackTime/Adapt: "o sistema se adapta a você") + **AppExplanation** (honestidade PWA). Cortar os charts/proofs redundantes.

**Ato 3 — Prova consolidada (1 beat honesto)**
**Um** beat de prova social real (Testimonials já honesto) — não 7 telas. Sem stats fabricadas (ver flags).

**Ato 4 — Pico de identidade → oferta (exit calmo)**
AnalysisLoading(24) → **"leitura da sua rotina"** (Diagnosis suavizado, sem "Detectado/78%") → **PICO: Transformation "sua melhor versão"** (26) → SimilarityMatch(27) → coleta(28-30) → LoadingPlan(31) → **Oferta(32)**: "sua rotina está pronta, simples, R$0,32/dia". Sai em **confiança + pertencimento**, urgência só se honesta.

## Plano de execução (sequência/ritmo — não reescrever copy boa)

| Step atual | Ação | Motivo |
|---|---|---|
| 1,2,3 (3 dores) | **MERGE → 1-2** | tirar martelada de dor repetida |
| 18 YearsPromising | **MOVER p/ Ato 1** | culpa pertence ao reconhecimento, não pós-esperança (mata o chicote) |
| 11 FeedbackAgeChart | **CUT** | prova redundante (nº3) |
| 14 SocialProofChart | **CUT ou fundir** | prova redundante + stat fabricada |
| 20 PotentialChart | **CUT** | prova redundante (nº6) |
| 22 ScientificProof | **CUT ou fundir** | prova redundante + stat "89%" |
| 19 Urgency | **MOVER p/ perto da oferta** | urgência cedo = tensão sem payoff |
| 25 Diagnosis | **RETONE** | "Detectado/nível 78%" → "leitura da sua rotina" (tira ansiedade encenada) |
| 26 Transformation | **MANTER + virar o pico** | é a identidade — o clímax certo |
| 6/9 Feedback | **MANTER 1** | um respiro de alívio basta |
| 0,4,5,7,8,10,12,13,15,16,21,23,24,27,28,29,31,32 | **MANTER** | núcleo do arco/qualificação |
| 30 Phone | **AVALIAR** | fricção extra antes da oferta |

Resultado: **33 → ~20 steps**, um único pico (identidade), ritmo tensão→alívio→tensão→resolução, sem prova repetida nem chicote.

## O que NÃO mexer
- Visual/design dos steps (bonito), os componentes em si, a marca, o ângulo "melhor versão", a oferta honesta (R$0,32/dia, garantia 7 dias), AppExplanation (honestidade PWA).

## Nota ética
Suavizar o "diagnóstico" (25) não é só copy — é tirar **ansiedade encenada** ("Detectado", medidor 78%) de um público que chega com ansiedade. O método proíbe manufaturar pânico.

## ⚠️ Risco de conversão
Cortar steps mexe num funil pago que converte. Recomendo: aplicar **retone + reordenação (baixo risco)** primeiro; **os CUTs de steps idealmente via A/B** (variante "antigo" já existe no `App.tsx`).
