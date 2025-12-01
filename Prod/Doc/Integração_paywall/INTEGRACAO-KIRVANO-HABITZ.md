# Integração Kirvano ↔ Supabase ↔ Habitz

Este guia documenta, passo a passo, tudo o que foi necessário para colocar em produção o fluxo completo: Kirvano (pagamento aprovado) → Supabase (auth/purchases) → Landing `obrigado` → App Habitz. Ele serve como "caminho das pedras" para futuras integrações.

## Visão geral

1. **Webhook da Kirvano** recebe o payload `SALE_APPROVED`, cria/atualiza usuário no Supabase Auth e registra a compra.
2. **Página obrigado** permite que o cliente crie a senha chamando o edge function `create-password-direct`.
3. **App Habitz** autentica usando Supabase Auth assim que a senha é criada.

Todo o fluxo roda no projeto Supabase `jbucnphyrziaxupdsnbn`.

---

## Edge Function `kirvano-webhook`

Arquivo: `App/supabase/functions/kirvano-webhook/index.ts`

### Comportamento
- Loga todos os headers e body raw (para debug).
- Aceita somente eventos `SALE_APPROVED`.
- Normaliza email e busca usuário via `auth.admin.listUsers()` (sem filtro, alinhado ao projeto referência).
- Cria novo usuário, se necessário, com `email_confirm: true` e metadata (`kirvano_customer_id`).
- Envia email de reset (quando `SUPABASE_ANON_KEY` estiver setado).
- **Upsert em `purchases`** com colunas:
  - `user_id`, `provider`, `provider_session_id`, `provider_payment_intent`
  - `amount_cents`, `currency`, `status`
  - `email`, `product_names`, `payment_method`
- Responde JSON `{ success, user_id, is_new_user, sale_id, product }`.

### Configuração necessária
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `APP_URL` nos secrets.
- `verify_jwt = false` para a função (para aceitar chamadas da Kirvano sem headers de auth). Isso pode ser setado em `supabase/functions/kirvano-webhook/supabase.config.toml` ou globalmente em `supabase/config.toml`.
- **Schema**: a tabela `purchases` precisa ter as colunas extras usadas no upsert. Criamos a migration `App/supabase/migrations/20251110160000_add_columns_purchases.sql` que adiciona `email`, `product_names`, `payment_method` e o índice `purchases_email_idx`.

### Deploy
```
cd App
npx supabase functions deploy kirvano-webhook
```

### Teste manual (curl)
```bash
curl -X POST https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/kirvano-webhook \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{
        "event": "SALE_APPROVED",
        "sale_id": "test-123",
        "total_price": "R$ 97,00",
        "payment_method": "pix",
        "customer": { "email": "teste-webhook@habitz.life", "name": "Usuário Teste" },
        "products": [{ "name": "Habitz Premium" }]
      }'
```
Realizar pelo menos um curl sempre que ajustar a função para garantir que o runtime está aceitando chamadas anônimas.

---

## Edge Function `create-password-direct`

Arquivo: `App/supabase/functions/create-password-direct/index.ts`

### Comportamento (paridade com referência)
- Loga cada passo (`Request received`, email recebido, etc.).
- Valida email/senha (mínimo 6 caracteres, regex básico).
- Usa `auth.admin.listUsers()` para trazer todos os usuários e encontra o email manualmente (igual ao projeto referência).
- Consulta `purchases` (`status = 'paid'`). Se não houver compra ativa, retorna erro controlado.
- Atualiza senha via `auth.admin.updateUserById` com `email_confirm: true`.
- Retorna `{ success: true, message, user_id }` ou `{ success: false, error }` (HTTP 400 ou 500).

### Configuração necessária
- Mesmos secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- **verify_jwt = false** para permitir chamadas diretas da página obrigado. Adicionar em `supabase/functions/create-password-direct/supabase.config.toml`:
  ```toml
  [functions]
  verify_jwt = false
  ```
- Deploy:
  ```
  cd App
  npx supabase functions deploy create-password-direct
  ```

### Teste manual
```bash
curl -X POST https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/create-password-direct \
  -H "Content-Type: application/json" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{ "email": "teste-webhook@habitz.life", "password": "senha123" }'
```

---

## Página Obrigado (`Landing/obrigado.html` + `obrigado.js`)

- `data-password-endpoint` aponta para o edge function (`https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/create-password-direct`).
- `data-app-url` precisa ser o host do app (atual: `https://habitz.life/app`). O script adiciona `/auth` automaticamente.
- `obrigado.js` desabilita o botão durante submit, chama o endpoint e redireciona após sucesso. Mensagens de erro/sucesso já estão internacionalizadas.

### Ajustes importantes
- Qualquer alteração no host/app exige atualizar `data-app-url`.
- Para evitar 401 no fetch, garantir que `create-password-direct` está com `verify_jwt = false`.

---

## Banco de Dados / Triggers

- `handle_new_user` deve copiar email para `profiles.email` automaticamente. Conferir que trigger está ativo.
- `purchases` deve ter `status`, `provider`, `provider_session_id` e as colunas extras citadas.
- `profiles.email` precisa ser preenchido (já garantido pelo trigger).

### Diagnóstico SQL útil
```sql
SELECT
  u.email,
  p.email AS profile_email,
  pu.status,
  pu.amount_cents,
  pu.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN purchases pu ON pu.user_id = u.id
WHERE u.email = 'lagosconsulting4@gmail.com'
ORDER BY pu.created_at DESC;
```

---

## Deploy / CLI Workflow

1. **Linkar projeto**: `cd App && npx supabase link --project-ref jbucnphyrziaxupdsnbn` (usar senha do banco se solicitado).
2. **Deploy edge function**: `npx supabase functions deploy <nome>`.
3. **Aplicar migrations**: `npx supabase db push --include-all` (quando houver migrations novas).
4. **Testar** via curl com headers `apikey` e `Authorization` usando a anon key.

---

## Checklists rápidos

### Após alterar `kirvano-webhook`
- [ ] `verify_jwt = false` configurado
- [ ] Migration aplicada (colunas email/product/payment)
- [ ] `npx supabase functions deploy kirvano-webhook`
- [ ] curl de teste retornando `success: true`
- [ ] Kirvano apontando para `.../kirvano-webhook`

### Após alterar `create-password-direct`
- [ ] `verify_jwt = false`
- [ ] `npx supabase functions deploy create-password-direct`
- [ ] Página obrigado com `data-password-endpoint` atualizado e `data-app-url` correto
- [ ] curl de teste retornando `success: true`

### Suporte / Emergência
- Usar `Doc/Integração_paywall/ACESSO-EMERGENCIA.md` para criar usuários manualmente caso webhook falhe.

---

## Dicas finais

- Sempre que a Kirvano fizer "Testar integração", verifique os logs no Dashboard (Edge Functions → kirvano-webhook → Logs). Se aparecer 401, falta header; se aparecer erro SQL, conferir colunas.
- Para clientes específicos, use o script SQL "all-in-one" em `DIAGNOSTICO-COMPLETO.md` que recria usuário/profile/purchase.
- Documente qualquer novo campo adicionado em `purchases` ou novas integrações no mesmo arquivo para manter a paridade com o projeto referência.

