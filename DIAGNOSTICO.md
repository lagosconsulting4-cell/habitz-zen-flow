# DIAGNÓSTICO — Bora (habit tracker web/PWA · Albor)

> Auditoria **read-only** (produto + funil). Nenhum arquivo de código foi alterado.
> Disciplina de evidência: **FATO** = lido diretamente no código/dado (com `arquivo:linha`); **HIPÓTESE** = inferência ou juízo de efeito não confirmado por execução.
> Escopo: funil `habitz.life/bora` + PWA/desktop + gap promessa↔produto. O app **nativo (Rivo)** é outro projeto e é o fix de longo prazo — fora deste diagnóstico.

---

## 0. Veredito em uma frase

**O Bora está melhor do que aparenta.** O motor do produto (rotina personalizada real, gamificação completa, jornadas, PWA com offline de verdade) está **construído e bom**. O que machuca não é produto fraco — é **(1)** o funil seta a expectativa errada (app nativo / diagnóstico clínico / renda); **(2)** o produto **esconde o que já tem** e **parece site no desktop**; e — a dor mais aguda, validada pelo fundador — **(3) vende um "plano personalizado pronto" e não entrega aquele plano** (descarta e refaz). A maior parte dos pain points se resolve **alinhando copy**, **entregando o plano que já foi vendido** e **revelando o que já existe** — não reescrevendo o que funciona.

> **Prints (2026-06-17) confirmam (FATO):** paywall e quiz estão **visualmente ótimos** (premium, coerentes) → **não mexer no visual**. Desktop é uma **coluna de celular centralizada, sem menu, num mar de preto** com botão flutuante → confirma "parece site, não app".

---

## 1. Método e ressalvas (importante para ler os números com honestidade)

- **Repo e Supabase estão bagunçados** (confirmado): há dados de teste no banco (reembolsos com texto "Testegggg", "bdbdjjdj"; compras "Teste Integração N8N"; múltiplos providers Hubla/Stripe/Kirvano/Greenn/manual). **Não tratei volume de DB como verdade** — usei apenas sinais qualitativos coerentes e repetidos.
- **N de reembolso/cancelamento é pequeno** (`auditoria_reembolsos`=7, `cancellation_feedback`=4, `refund_requests`=1). Servem como **sinal direcional**, não estatística.
- **Atenção a artefato de coleta**: "Esperava um app nativo (App Store/Play Store), não um app de navegador" é uma **opção pré-marcável** no fluxo de cancelamento (`Landing/src/pages/bora/Reembolsos.tsx:11`), não texto 100% espontâneo. Logo, a *frequência* dela é parcialmente induzida (**HIPÓTESE** sobre magnitude). O que é **FATO** é que o **tema** se confirma de forma independente no texto livre de usuários distintos: *"achei a interface confusa e não gostei do aplicativo ser como um site ao invés de app na apple store"* e *"não me identifiquei... achei confuso, de primeira"*.

---

## 2. O que JÁ FUNCIONA (não destruir)

| Área | Evidência | Por que é um ativo |
|---|---|---|
| **Ângulo de identidade ("seja sua melhor versão")** | `BoraLanding.tsx:193` H1 "Seja a sua melhor versão"; `HeroStep.tsx:58` "Vire a sua melhor versão"; `BoraLanding.tsx:39` "Identidade > Hábito"; CTA `:229` "Construir o meu novo eu" | É o ativo de copy mais valioso e **coeso** da marca. **FATO** |
| **Motor de rotina personalizada** | `generateRecommendationsV2.ts` (algoritmo 7 camadas, 61 templates, calibra por experiência/profissão/fim de semana) | Onboarding entrega plano real, não cosmético. **FATO** |
| **Gamificação completa** | XP (`xp_events`≈3.972 linhas; +75 XP no onboarding `OnboardingProviderV2.tsx:495`), níveis Bronze→Diamante (`useGamification.ts:179`), gems, avatares, achievements, streaks + freeze automático (`Dashboard.tsx:910`) | Camada de retenção/identidade pronta. **FATO** |
| **Jornadas integradas** | 10 jornadas / 40 fases / 300 dias; `DailyMissionCard.tsx:141` mostra conteúdo da jornada | Conteúdo guiado já cabeado no dia a dia. **FATO** |
| **PWA com offline real no núcleo** | completar hábito offline com optimistic UI + IndexedDB + fila (`useHabits.tsx:690`); SW estruturado (`sw.ts:14` precache, `:20-78` runtime cache só GET) | Diferencia "app" de "site". **FATO** |
| **Instalação iOS/Android + update flow** | passo-a-passo iOS + vídeo (`InstallPrompt.tsx:79-101`), `beforeinstallprompt` Android (`usePWA.ts:116`), update prompt (`usePWA.ts:186`) | Instalável e se atualiza sozinho. **FATO** |
| **Quiz longo bem arquitetado** | 33 steps com micro-compromissos, feedbacks intercalados, captura de dados só no fim (`QuizModal`/`steps/*`) | Boa sequência de comprometimento. **FATO** |
| **Ancoragem de valor honesta já presente** | "R$ 0,32 por dia • menos que um café" (`SubscriptionOffersStep.tsx:189`); garantia 7 dias clara (`:282`); FAQ que já explica o PWA (`:33` "Não! Funciona direto no navegador... salva na tela inicial e usa como app") | A honestidade já existe — só está enterrada no fim. **FATO** |

---

## 3. Causa-raiz dos pain points (reembolso + "não é o que imaginei")

A dor central é **gap de expectativa**, e ele é em grande parte **autoinfligido**:

### 3.0 ⭐ A DOR CENTRAL (validada pelo fundador): plano **vendido** ≠ plano **entregue** (FATO · severidade altíssima)
> *"Vendemos plano personalizado e não entregamos."* — fundador

- **A oferta vende um plano pronto e bloqueado**: `LockedRoutinePreview.tsx:184-188` "{N} hábitos criados para você! / Baseado no seu perfil, objetivos e desafios"; metade dos hábitos exibida e **metade bloqueada** (`:117-118`, `LockedHabitCard`) → "pague para desbloquear **seu** plano". O paywall (print) reforça: *"seu plano personalizado **está pronto** · Desbloqueie agora e comece ainda hoje"*.
- **Após a compra, o app NÃO entrega esse plano**: `useQuizData.ts:43-71` rebusca as respostas do quiz por email, mas o onboarding V2 **re-pergunta** gênero/acordar/fim-de-semana/áreas/experiência (print "Escolhe o seu gênero · usado para gerar a sua rotina personalizada") e roda um **gerador diferente** (`generateRecommendationsV2.ts`), produzindo `generatedHabits`. O `recommendedHabits` do quiz — o plano vendido — **não é entregue; é recomputado**. (**FATO**: dois geradores distintos + re-onboarding de 17 passos.)
- **O que aparece no dia 1 parece genérico**: print do dashboard é dominado pela jornada "Manhã de Elite" com hábitos como "Aulas de Tênis" / "Teste Rápido de Recuperação", que não conversam com um quiz de ansiedade/foco/procrastinação. (**HIPÓTESE** sobre o quanto destoa; **FATO** que o plano entregue ≠ o previsto.)
- **Unifica os dois temas de reembolso**: "não é o que imaginei / confuso de primeira" (pagou por *pronto*, refez tudo) **+** "não me identifiquei" (o entregue não conversa visivelmente com o que respondi).
- **Nuance honesta (não exagerar):** **existe** personalização real — `generateRecommendationsV2` usa as respostas. O problema **não é "zero personalização"**; é **continuidade quebrada** (vende plano A, entrega plano B depois de refazer) **+ personalização invisível** (sem "porque você disse X, aqui está Y"; o app fala métrica seca).
- **O gap mais profundo (fundador): "o quê" sem o "como".** Vender rotina personalizada ≠ entregar lista de hábitos. O usuário recebe "faça X" mas não "é assim que se faz X". E o irônico: **o "como" já existe e é bom** — campo `description` dos templates (ex. `generateRecommendationsV2.ts:85`) — mas é **descartado na criação do hábito** (`OnboardingProviderV2.tsx:393-421` não passa `description`) e **não aparece no card** (cards mostram só o nome; print confirma). Resolver o "como" de verdade (adaptativo, integrado) **é o Rivo — longo prazo, fora de escopo**. Em Bora, o tapa **sutil** é **surfacing do "como" que já existe** + continuidade — NUNCA replicar a engine do Rivo num produto em transição.

### 3.1 O funil promete o que o produto não é — e o produto **reforça** a mentira (FATO · severidade alta)
- O próprio fluxo de cancelamento diz que existe um **app nativo "em fase final de aprovação na App Store e Google Play"**:
  - `Reembolsos.tsx:29` — *"A versão nativa do Bora para **App Store e Google Play está em fase final de aprovação**. Se você cancelar agora, perde o preço de cofundador. Vale esperar mais 30 dias?"*
  - `NPS.tsx:27-28` — *"O app nativo do Bora está em aprovação final... **Em breve você instala de verdade.**"*
- Efeito: além de não corrigir a expectativa, **confirma** que o web app é um "provisório", fazendo o PWA parecer downgrade. (**FATO** o texto; **HIPÓTESE** o efeito.)
- Linguagem de "app/baixar/instalar o app" e mockups estilo loja espalhados pelo funil (`PWAInstallStep.tsx:101` "Instale o App para continuar"; `SubscriptionOffersStep.tsx:33` "Preciso baixar algum app?"; `BoraLanding.tsx:205` mockup "App Interface") reforçam a moldura de "aplicativo de loja". **FATO.**

### 3.2 Overpromise de "diagnóstico" e de transformação que um tracker não entrega (FATO · severidade média)
- `DiagnosisStep.tsx:99-142` encena triagem clínica ("Resumo do que encontramos", selo "**Detectado**", medidor "Nível de impacto 78–85%") sobre perguntas de ansiedade/insônia/ruminação (`MindRacingStep.tsx:23`). Cria expectativa de cuidado de saúde mental.
- Depoimentos/estatísticas sem lastro: "Faturamento dobrou em 3 meses" (`BoraLanding.tsx:62`), "89% mantêm hábitos por 3 meses" (`ScientificProofStep.tsx:6`), "37x melhor em 1 ano... o algoritmo garante" (`BoraLanding.tsx:48`).

### 3.3 Dissonância de posicionamento: upsell de "renda" (FATO · severidade alta) — **DECISÃO: REMOVER**
- `MetodoRendaSecreta.tsx:46` vende **"Método Renda Secreta"** (ganhar dinheiro postando fotos anônimas com IA / "Robô de Carrosséis") como upsell de quem comprou autodesenvolvimento. Corrói confiança e contribui para "não me identifiquei".
- **Confirmado pelo time: "não vendemos assim" → remover do funil do Bora** (`MetodoRendaSecreta.tsx`, `MetodoRendaSecretaCombo.tsx` e o link de upsell). Também ajustar depoimentos de "faturamento 2x" (`BoraLanding.tsx:62`) para ganhos de consistência/energia/foco.

### 3.4 Inconsistência **OFERTA × PRODUTO** (FATO · severidade média-alta)

**Preço real cobrado em produção (confirmado pelo time):** **Mensal R$29,90/mês** ou **Anual R$118,32 (12× R$9,86/mês)** — assinatura **recorrente**. Bate com o tracking `total_price: 118.32` em `SubscriptionOffersStep.tsx:88`.

| O que a OFERTA diz | O que o PRODUTO cobra/entrega | Risco |
|---|---|---|
| Âncora "De **R$805**" (`OfferSlide.tsx:12,94`) | Soma teórica de bônus — nunca foi preço praticado | Âncora não-verificável → desconfiança |
| "**R$47 pagamento único · 1 ano de acesso**" (`Doc/NOVA COPY_BORA/COPY.md`) | **Não implementado.** Cobrança é **recorrente** (R$29,90/mês ou 12× R$9,86) | Comprador espera 1× e é cobrado mensal → cancelamento/reembolso |
| "1 ano de acesso" / pagamento único (`OfferSlide.tsx`) | Assinatura recorrente | Mesmo gap acima |
| Descontos **72% / 88% / 50% / 94%** coexistindo (`SubscriptionOffersStep.tsx:170`, `OfferSlide.tsx:15`, `ExitIntentModal.tsx:79`, doc) | Um único preço real | Incoerência visível mina credibilidade |
| Bônus "**27 Dicas Práticas**" / "Programa 30 Dias" / "Hub de Livros" (`COPY.md`) | `tips`=5 linhas, `books`=17, `guided_days`=28, `meditations`=10 no banco | **VERIFICAR**: contagens podem não bater com a copy (ex. "27 dicas" vs 5) |

**Resumo:** o produto cobra assinatura recorrente honesta e barata (R$0,32/dia), mas a oferta a apresenta como pagamento único/1-ano com âncora fictícia e descontos divergentes. Alinhar a *apresentação* ao que é realmente cobrado remove uma fonte direta de "não é o que imaginei".

### 3.5 O produto **esconde o que já tem** no dia 1 (FATO · severidade alta — mas barato)
- **`XPBar` nunca é renderizado**: existe e está pronto (`XPBar.tsx:12`, "Rumo a {próximo nível}" `:96`), mas não há nenhum `<XPBar/>` no app (só skeleton/comentário). A barra de evolução de nível — gatilho clássico de retenção/identidade — está **construída e oculta**.
- **A identidade evapora ao logar**: forte no onboarding (`S20_Celebration` "Agora você tem um **sistema**", badges "Madrugador/Consistente" `S8:70`) e some no app, que passa a falar só métrica seca (`DashboardHeroSection.tsx`, `Progress.tsx:220` "Analíticos & Insights"). Bate com "não me identifiquei".
- **Anticlímax de dia 1**: depois da celebração, o Dashboard pode cair em estado vazio — "Hoje não tem hábitos agendados, mas amanhã começa" (`Dashboard.tsx:787-836`), porque hábitos do preview têm dias restritos (`fixed_days`, 41 de 61 templates) filtrados por dia da semana (`useHabits.tsx:813`). A promessa "comece hoje" pode falhar de forma previsível. (**FATO** que a divergência ocorre; **HIPÓTESE** a frequência.)
- **Fallback de marca errado**: primeira tela logada usa "Habitz" (nome antigo) como fallback de nome (`DashboardHeroSection.tsx:40`). **FATO.**

### 3.6 Desktop parece site, não app (FATO · severidade alta para % de tráfego desktop)
- Telas principais ficam numa **coluna estreita centralizada sem navegação**: `NavigationBar.tsx:61` (`md:hidden`), `Dashboard.tsx:777` (`max-w-xl mx-auto`), e a `AppSidebar` não aparece nas rotas swipeable (`ProtectedLayout.tsx:25`). No PC: faixa estreita num fundo vazio, sem menu → exatamente a percepção "site mobile esticado".
- Bug: `AppSidebar` é renderizada sem a prop obrigatória `onOpenMore` (`ProtectedLayout.tsx:46` vs `AppSidebar.tsx:166`) → "Descobrir mais" no desktop quebra.
- Sem navigation fallback offline no SW (`sw.ts` não registra `NavigationRoute`) → **HIPÓTESE**: F5/deep-link offline em subrota pode dar tela branca ("quebrou, é site").
- Manifest sem screenshots `wide` e `orientation: portrait-primary` (`manifest.json:10,104`) → install prompt rico do Chrome desktop não aparece.

---

## 4. Quanto é EXPECTATIVA (copy) vs PRODUTO (feature)

Juízo qualitativo (não estatística — N pequeno):

- **Maioria = expectativa, resolvível por copy/posicionamento**: "esperava app nativo / parece site", overpromise de diagnóstico clínico, upsell de renda, incoerências de oferta. **Inclui parar de reforçar a mentira do app nativo no próprio funil.**
- **Menor parte = produto, e barata**: o "produto" aqui é majoritariamente **revelar o que já existe** (XPBar, identidade no app, continuidade preview→hoje, fallback "Habitz") + **tornar o desktop um app de verdade** (reusando a sidebar já existente). **Não são features novas grandes.**
- **Fora de escopo (longo prazo / não investir agora)**: o app **nativo de fato (Rivo)**; bug de background-sync usando anon key (`sw.ts:370`, **HIPÓTESE** de que sync com app fechado falha sob RLS).

**Conclusão:** o reembolso/confusão é resolvível majoritariamente com **copy honesta + revelar valor existente + desktop**, sem destruir nada. Isso sustenta **manter o preço** (o valor real existe; ele só não está visível nem honestamente enquadrado).

---

## 5. Achado fora de escopo, mas que devo sinalizar — Segurança (FATO)

O advisor do Supabase reporta **RLS desabilitado** em 8 tabelas, incluindo `support_conversations`, `support_tickets`, `whatsapp_conversations`, `pix_transactions` — expostas à anon key (leitura/escrita por qualquer um com a chave pública). **Não apliquei correção** (habilitar RLS sem políticas bloqueia acesso). Recomendo tratar à parte com políticas adequadas. Relevante também para o ângulo "habit tracker honesto/confiável".

---

## 6. Matriz impacto × esforço (resumo)

| # | Movimento | Tipo | Impacto | Esforço |
|---|---|---|---|---|
| 1 | Matar "app nativo em aprovação" + reposicionar PWA como vantagem | copy/posicionamento | 🔴 alto | baixo |
| 2 | Revelar o que já existe (XPBar, identidade no app, fallback "Habitz") | produto (revelar) | 🔴 alto | baixo |
| 3 | Continuidade preview→hoje (não cair em tela vazia no dia 1) | produto | 🟠 alto | baixo-médio |
| 4 | Desktop = app de verdade (sidebar persistente + manifest wide + bug fix) | produto/PWA | 🟠 alto (desktop) | médio |
| 5 | Honestificar oferta (descontos, âncora, "diagnóstico"→"leitura", upsell renda) | copy/posicionamento | 🟡 médio | baixo |
| — | RLS / segurança (à parte) | segurança | risco | médio |

Detalhamento e o que **NÃO** mexer → ver `PLANO.md`.
