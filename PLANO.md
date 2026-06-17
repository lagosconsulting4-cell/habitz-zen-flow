# PLANO — Bora (proposta priorizada · NÃO executar sem OK)

> Baseado em `DIAGNOSTICO.md`. Só inclui o que o diagnóstico sustenta com evidência.
> Princípio: **alinhar expectativa** + **revelar o que já existe** + **tornar o desktop um app de verdade**. Reuso > criação (espírito do `CLAUDE.md` do projeto).
## ✅ STATUS DE IMPLEMENTAÇÃO (2026-06-17) — builds verdes (App + Landing)

- **W0 — Honestidade de copy (funil):** feito. App-nativo removido (`Reembolsos`/`NPS`), faturamento/6kg/garantia trocados, stats fabricadas saíram com o reframe do arco, "diagnóstico"→"leitura", headline → "sua rotina já está pronta".
- **Reframe do arco (funil):** feito. 33→27 steps, 1 pico (identidade), sem chicote. Ver `Doc/NOVA COPY_BORA/ARCO_EMOCIONAL.md`.
- **W1 — "Como fazer" na Sessão:** feito. Migration aditiva `habits.description` (FILE — aplicar com `supabase db push`), grava o `description` do template (antes descartado) no onboarding, e a Sessão mostra tap "Como fazer" (fetch best-effort, tolerante se a coluna ainda não existir).
- **W2 — Revelar valor:** feito. `XPBar` renderizado (Dashboard + estado dia-1), fallback "Habitz"→"Bora", empty-state dia-1 menos anticlímax + mostra XP já ganho, "Analíticos & Insights"→"Sua evolução", "Ver Analiticos"→"Ver meu progresso".
- **W3 — Desktop:** feito (1ª camada, baixo risco). `NavigationBar` vira dock flutuante central no desktop (antes `md:hidden` = sem menu), conteúdo do Dashboard mais largo (`md:max-w-3xl`), crash do `AppSidebar` (`onOpenMore`) corrigido, manifest `orientation: any`.

### ⚠️ Pré-requisito p/ testar
Aplicar a migration **antes** de rodar o App (senão o insert/fetch da descrição falha): `cd App && supabase db push` (ou aplicar `App/supabase/migrations/20260617000000_habits_description.sql`). A migration ao banco de produção **não foi aplicada por mim** (bloqueada — você aplica).

### Deferido de propósito (maior risco — só com seu OK)
- **W1 continuidade "pular re-perguntas":** o onboarding coleta dados complementares (acordar/fim-de-semana/áreas) que o quiz não tem; objetivo já é pré-preenchido. Pouco a "pular" sem mexer no fluxo — deixei quieto.
- **W3 sidebar persistente real no desktop p/ as 5 telas swipeable:** exigiria mexer no carousel/sync (frágil). Fiz o dock como 1ª camada segura; sidebar é o próximo passo de polish.
- **Mov 3 "hábitos aparecem hoje":** mexer no agendamento (`fixed_days`) é arriscado; ataquei o anticlímax pelo empty-state + XP visível. O fix de scheduling fica p/ depois.

## Posicionamento-alvo (o norte de tudo)

**Bora = seu habit tracker pra virar a sua melhor versão.** Marca "Bora" mantida. Descritor honesto ("habit tracker web que você instala na tela inicial"), **sem perder** o ângulo aspiracional de identidade que já é o melhor ativo do funil ("seja a sua melhor versão" / "identidade > hábito"). Honesto **e** desejável — não um nem outro.

---

## Os movimentos (alto impacto / baixo esforço)

### Movimento 0 (⭐ CENTERPIECE) — Tirar o plano da sensação de "lista crua" — de forma SUTIL 🔴🔴
**Por quê:** dor central (fundador): *vender rotina personalizada ≠ entregar lista de hábitos; o Bora fala o "o quê" mas não o "como", e aí fica raso.* O "como" de verdade (adaptativo/integrado) é o **Rivo** — projeto extenso, **NÃO replicar aqui**.
**Restrição inegociável: SUTIL.** Bora é produto em transição; nada de virar engine de coaching.
**O quê (puro reuso — NÃO mexer no motor nem inventar engine):**
- **Surfacing do "como" que já existe** *(DECISÃO: na Sessão, atrás de um tap)*: o `description` dos templates (`generateRecommendationsV2.ts:85`) é ótimo, mas é descartado no insert (`OnboardingProviderV2.tsx:393-421` não passa `description`) e nunca exibido. Persistir o `description` no hábito e mostrá-lo como **tap "como fazer"** no card da **Sessão** (`SessionPage.tsx:471-525`, hoje renderiza só `habit.name` em `:520`). Fica contextual no momento de executar e **não polui** a lista minimalista do dashboard.
- **Continuidade quiz→app**: entregar o previsto e **pular re-perguntas** já respondidas no quiz (`useQuizData.ts` já lê tudo). Não refazer 17 passos.
- *(opcional, só se couber sutil)* micro "porque você disse {desafio}".
**O que NÃO fazer:** programa adaptativo, integrações, coaching = Rivo.
**Esforço:** baixo-médio, quase tudo reuso de conteúdo que já existe.

### Movimento 1 — Matar a "mentira do app nativo" e reposicionar o PWA como vantagem 🔴
**Por quê:** é o gerador #1 de "não é o que imaginei", e hoje o produto **reforça** a expectativa errada no próprio funil de retenção.
**O quê (copy/posicionamento, sem feature nova):**
- Remover/reescrever as promessas de app nativo: `Reembolsos.tsx:29` e `NPS.tsx:27-28` (parar de dizer "app nativo em aprovação / em breve você instala de verdade").
- Trocar "Instale o App / baixar o app" por **"Adicione o Bora à sua tela inicial"** (`PWAInstallStep.tsx:101`, FAQ `SubscriptionOffersStep.tsx:33`).
- **Subir** para o topo do funil e do onboarding o enquadramento honesto-premium que já existe enterrado no FAQ: *"O Bora vive no seu navegador — abre direto, sem loja de apps, atualiza sozinho e funciona offline. Salva na tela inicial em 10 segundos e usa como app."*
**Esforço:** baixo (texto + reordenar). **Mantém** marca e identidade.

### Movimento 2 — Revelar o que o app já tem (no dia 1) 🔴
**Por quê:** ataca "não me identifiquei" e a sensação de produto raso, sem construir nada — é só **mostrar o que já está pronto**.
**O quê:**
- **Renderizar o `XPBar`** (pronto em `XPBar.tsx:12`, hoje órfão) no Dashboard e/ou `/progress`. No dia 1 já há +75 XP do onboarding → progresso/nível visível na hora ("Bronze I → rumo a Bronze II").
- Levar a **linguagem de identidade do onboarding** (badges "Madrugador/Consistente" de `S8:70`; "você tem um sistema" de `S20`) para o hero do Dashboard e o `/progress`, hoje só métrica seca (`DashboardHeroSection.tsx`, `Progress.tsx:220`).
- Corrigir o fallback de marca **"Habitz" → "Bora"** (`DashboardHeroSection.tsx:40`).
**Esforço:** baixo (cabeamento + texto). Reusa componentes existentes.

### Movimento 3 — Garantir continuidade preview → hoje (sem anticlímax de dia 1) 🟠
**Por quê:** o usuário aprova a rotina no preview e pode cair numa tela vazia ("amanhã começa") logo após a celebração — quebra previsível que alimenta "confuso de primeira".
**O quê:**
- No dia da conclusão do onboarding, exibir os hábitos criados **independentemente** do `fixed_days`/dia da semana (ou ancorar `days_of_week` incluindo o dia atual). Causa em `useHabits.tsx:813` + templates restritos.
- Reescrever o estado vazio de dia 1 (`Dashboard.tsx:787-836`) para mostrar concretamente a semana / o primeiro passo de jornada, em vez de "hoje não tem nada".
**Esforço:** baixo-médio. **Validar** a frequência real antes (é HIPÓTESE quão comum é).

### Movimento 4 — Desktop = app de verdade (justifica o preço no PC) 🟠
**Por quê:** no desktop o Bora é "coluna de celular sem menu" — exatamente o "parece site" que motiva reembolso; e PC é onde o preço precisa parecer justificado.
**O quê (reusando o que existe):**
- Render alternativo em `md+`: **AppSidebar persistente** (já existe) + grid mais largo nas 5 telas swipeable (`SwipeableLayout`/`ProtectedLayout.tsx:25`, `Dashboard.tsx:777` `max-w-xl`).
- Corrigir o **crash do AppSidebar** sem `onOpenMore` (`ProtectedLayout.tsx:46` vs `AppSidebar.tsx:166`).
- Manifest: adicionar **screenshots `wide`** e relaxar `orientation` (`manifest.json:10,104`) → install prompt rico no Chrome desktop + educar instalação no PC (`InstallPrompt.tsx:26`).
- **(verificar)** navigation fallback offline no SW (`sw.ts`) p/ evitar tela branca em subrota — confirmar com teste offline antes.
**Esforço:** médio. Maior parte é reuso + CSS responsivo.

### Movimento 5 — Alinhar a oferta ao que o produto realmente cobra/entrega 🟡
**Por quê:** a inconsistência oferta × produto é fonte direta de "não é o que imaginei".
**Preço real (confirmado):** Mensal **R$29,90/mês** ou Anual **R$118,32 (12× R$9,86/mês)** — recorrente.
**O quê (copy):**
- **Suavizar a promessa de "plano personalizado"** *(DECISÃO do fundador)*: o paywall/quiz vendem um plano profundo/personalizado que o Bora (simples) não entrega. Calibrar `LockedRoutinePreview.tsx:184-188` e a headline do paywall ("seu plano personalizado está pronto") para vender **rotina simples do seu jeito + sistema que te faz executar + identidade** ("sua melhor versão"), em vez de programa adaptativo. **Manter desejo e identidade**, reduzir a promessa de profundidade. (Promessa de "personalização profunda" fica reservada ao Rivo.)
- **Remover** o upsell "Método Renda Secreta" (`MetodoRendaSecreta.tsx`, `MetodoRendaSecretaCombo.tsx` + link) — decisão do time, "não vendemos assim". Ajustar depoimentos de "faturamento 2x" (`BoraLanding.tsx:62`) para ganhos de consistência/energia/foco.
- **Apresentar o preço como ele é cobrado**: parar de usar "pagamento único / 1 ano" e a âncora fictícia "R$805" (`OfferSlide.tsx:94`). Âncora honesta = **R$29,90/mês avulso → R$9,86/mês no plano anual**. Manter "R$0,32/dia, menos que um café" (`SubscriptionOffersStep.tsx:189`) — já é ótimo.
- **Unificar o % de desconto** (hoje 72/88/50 coexistem; `SubscriptionOffersStep.tsx:170`, `OfferSlide.tsx:15`, `ExitIntentModal.tsx:79`).
- **Verificar bônus × banco**: copy promete "27 Dicas", "Programa 30 Dias", "Hub de Livros" etc.; banco tem `tips`=5, `books`=17, `guided_days`=28, `meditations`=10. Ajustar números da copy ao real (ou popular o conteúdo).
- Recalibrar o "diagnóstico": "Resumo do que encontramos / Detectado" → **"Seu padrão de rotina / Onde o Bora age primeiro"** (`DiagnosisStep.tsx:99-142`). Mantém o "feito pra mim" sem encenar triagem de saúde mental.
- Tom terapêutico anti-culpa de `COPY.md` pode ficar (combina com `DiagnosisStep`), mas **prometer rotina/hábito, não tratamento**.
**Esforço:** baixo (texto) + remoção de rotas do upsell.

---

## Preço — recomendação: **manter**

Não baixar. O valor real existe (motor de rotina + gamificação + jornadas + PWA offline). O problema é valor **invisível** e **mal enquadrado**, não valor inexistente. Os movimentos 1–4 aumentam o valor percebido (PWA premium, evolução/identidade visíveis, desktop bom) — é assim que se justifica o preço, não com desconto. Os "menos que um café / R$0,32 dia" e a garantia de 7 dias já dão a ancoragem certa.

---

## O que **NÃO** mexer (preservar)

- **Ângulo de identidade "seja a sua melhor versão" / "identidade > hábito"** — maior ativo de copy. Preservar e **espalhar** (não remover).
- **Motor de geração de rotina** (`generateRecommendationsV2.ts`) — está ótimo.
- **Gamificação e jornadas no backend** — prontas e boas; o trabalho é **revelar no front**, não reconstruir.
- **Service worker / offline core** (`sw.ts`, `useHabits.tsx`, `useOfflineSync.ts`) — sólido (só verificar o navigation fallback).
- **Estrutura do quiz longo** (33 steps, micro-compromissos) — boa; só calibrar copy pontual.
- **Marca "Bora"** e o checkout/UTM existentes.
- **Não super-investir** em recursos pesados novos: o nativo (Rivo) é o fix de longo prazo. Aqui só o "tapa de maior alavanca".

---

## Itens à parte (não dentro dos 5, mas registrar)

- **Segurança (RLS desabilitado)** em 8 tabelas, incl. dados sensíveis de suporte/whatsapp/pix. Tratar com políticas próprias — **não** habilitar RLS sem políticas (bloquearia acesso). Decisão sua.
- **Higiene de repo/DB**: limpar dados de teste e dependência órfã `three` (`package.json:81`, sem import) — cosmético, baixa prioridade.
- **Background sync com app fechado** usa anon key (`sw.ts:370`) — pode não persistir sob RLS (HIPÓTESE). Confiabilidade, não UI.

---

## Waves (implementar com seu OK em cada uma)

- **Wave 0 — Honestidade de copy (risco ~zero, só texto):** Mov. 1 (matar "app nativo") + Mov. 5 (**suavizar promessa "plano personalizado"**, remover Renda Secreta, âncora/desconto honestos, "diagnóstico"→"leitura") + fallback "Habitz"→"Bora". Ataca reembolso de imediato.
- **Wave 1 — Entregar o plano vendido (⭐ CENTERPIECE):** Mov. 0 (continuidade quiz→app, pular re-perguntas, personalização visível). Maior alavanca.
- **Wave 2 — Revelar valor/evolução/identidade:** Mov. 2 (renderizar XPBar, identidade no app) + Mov. 3 (dia-1 sem anticlímax, hábitos aparecem hoje).
- **Wave 3 — Desktop = app de verdade:** Mov. 4 (sidebar persistente + grid largo + fix do crash + manifest `wide`/orientation + instalação no PC).

**Visual do funil/paywall/quiz: NÃO mexer** — está ótimo (confirmado por prints).

---

**Parado aqui. Qual wave começamos?** Recomendo **Wave 0** já (texto, risco zero, derruba reembolso) enquanto desenhamos a **Wave 1** (a de maior alavanca). Nada de código sem seu OK por wave.
