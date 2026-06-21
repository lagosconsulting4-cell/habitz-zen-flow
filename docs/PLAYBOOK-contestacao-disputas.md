# Playbook — Contestação de cancelamentos / chargebacks (Habitz · Foquinha · Bora)

**Propósito:** processo repetível para, sempre que chegar um cancelamento/chargeback, sabermos **o que
investigar, onde olhar e o que escrever** para montar a contestação **provando consumo do produto**.

> **Privacidade:** este guia é genérico e versionado. As **evidências de cada caso** (com PII do cliente —
> nome, e-mail, telefone, conversas) ficam em `docs/disputa-<cliente>.md` / `docs/evidencia-<cliente>/`, que são
> **gitignored e NÃO vão para o GitHub**. Nunca commite dados de cliente.

> **Princípio:** provar, não afirmar. Todo argumento sai de um registro de produção com data/hora. Se o dado não
> sustenta o argumento, o argumento não entra.

---

## 1. Quando vale a pena (sinais de caso "ganhável")
Abrir contestação quando os dados mostram:
- Cliente **usou** o produto (onboarding completo, hábitos criados, conclusões, mensagens no WhatsApp).
- **Nunca** acionou suporte/cancelamento/reembolso antes do chargeback (`opted_out=false`, 0 mensagens de suporte).
- Serviço **entregue continuamente** (`notification_history`) até perto da data do cancelamento.
- Período de uso relevante (semanas+).

Se o cliente mal usou, ou pediu suporte e foi ignorado → caso fraco; repensar antes de gastar esforço.

## 2. Inputs necessários
Nome + e-mail do cliente · plataforma (Stripe/Hubla/Kirvano/Kiwify) · data/hora do cancelamento · valor cobrado.

## 3. Acesso aos dados (somente leitura)
- Supabase de produção, via REST API:
  `GET https://<PROJECT_REF>.supabase.co/rest/v1/<tabela>?...` com headers `apikey` + `Authorization: Bearer <service_role_key>`.
- Filtrar por `email` (ilike), depois `user_id`, depois `phone`.
- n8n (workflow da Foquinha) = corroboração opcional de entrega.
- ⚠️ **Segredos:** a `service_role_key` é altamente sensível. Use só na sessão, **nunca** commite, **nunca** cole
  em chat/e-mail. Se vazar, **rotacione imediatamente** no painel Supabase. (Anon key é publicável; service key não.)

## 4. Passo 0 — verificação crítica (ANTES de escrever)
Puxar `whatsapp_conversations.messages` e **escanear** por: `suporte, atendimento, cancelar/cancelamento,
reembolso, estorno, não reconheço, fraude, golpe, devolução, "dinheiro de volta"`. Ler a última interação.
Contar mensagens iniciadas pelo cliente.
- **0 ocorrências** → pilar "nunca pediu suporte" confirmado, pode afirmar.
- **Qualquer ocorrência** → avisar e reformular. Não escrever um doc que superafirma.

*(Cuidado com falso-positivo de substring — ex.: "se **prepar**ar" casa "parar". Conferir o contexto.)*

## 5. Investigação — tabelas (filtrar por `user_id`; `phone` no WhatsApp)

| Tabela | O que prova |
|---|---|
| `purchases` / `pending_purchases` | a compra: `provider`, `product_names`, `payment_method`, `status`, datas |
| `profiles` / `auth.users` | conta criada, premium, telefone |
| `events` | onboarding completo (`onboarding_v2_*`, `routine_generated`, `completed`) |
| `habits` | hábitos criados / ativos |
| `habit_completions` | conclusões (engajamento real) |
| `user_progress` | XP, `last_activity_date` |
| `whatsapp_conversations` | mensagens do cliente, `opted_out`, `last_interaction` |
| `notification_history` | mensagens de serviço entregues (contagem + breakdown por `context_type`) |
| `sessions`, `daily_checkins` | normalmente **vazias** p/ Foquinha (produto é WhatsApp, não app) |

**Token-aware:** nas tabelas grandes use contagem + amostra (não puxe linhas cruas); o log do WhatsApp puxa 1×.

## 6. Estrutura do documento de contestação
(1) Avaliação do caso · (2) Dados cliente/transação · (3) Linha do tempo (**BRT + UTC**) · (4) Evidências por
sistema · (5) Ausência de suporte/cancelamento · (6) Tabela-resumo de evidências · (7) Conclusão · (8) **Texto
pronto pra colar na plataforma** · (9) Anexo dados brutos · (10) Guia de prints · (11) Metodologia.

Formato atual preferido: **doc único PT-BR** pronto pra PDF. (Um precedente usou pasta multi-arquivo.)

## 7. Tailoring por plataforma
- **Stripe:** responder por categoria de dispute (fraud / subscription canceled / credit not processed); texto em inglês; conferir o descritor de fatura.
- **Hubla:** foco só em "prova de consumo"; PT-BR; pode ser **chargeback de cartão** OU **MED Pix** — conferir `payment_method` real.

## 8. Gotchas (verificados em campo)
- **Produto rotulado ≠ produto real.** O aviso pode dizer um produto/forma de pagamento e o registro mostrar
  outro (ex.: `product_names` e `payment_method` divergentes do aviso). **Sempre** conferir no banco antes de enquadrar.
- **`amount_cents` pode vir 0** (webhook não capturou o valor) → pegar o valor no painel da plataforma.
- **Fuso:** avisos chegam em **BRT (UTC−3)**; converter e rotular para não errar a linha do tempo.
- **Phone matching:** a plataforma pode ter o telefone em formato diferente do WhatsApp; casar por `user_id` quando possível.

## 9. Registro de cada caso
Para cada disputa, criar `docs/disputa-<cliente>.md` (gitignored) com o documento completo, e guardar prints/anexos
em `docs/evidencia-<cliente>/` (gitignored). **Não** versionar nada disso — contém PII.

## 10. Candidatos a automação (depois)
- **Script "1 e-mail → rascunho":** recebe o e-mail do cliente → roda as queries read-only do §5 → emite tabela-resumo + scan do Passo 0 + rascunho do doc.
- **Corrigir o webhook** para capturar `amount_cents` corretamente (elimina o gap recorrente do §8).
- **Disparo por evento** de chargeback (n8n) gerando o rascunho automaticamente para triagem.
