# Configurar Stripe Secrets no Supabase

## Via CLI (se preferir usar terminal)

```bash
# 1. Verificar secrets atuais
npx supabase secrets list --project-ref jbucnphyrziaxupdsnbn

# 2. Adicionar STRIPE_WEBHOOK_SECRET
npx supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_SEU_SECRET_AQUI" --project-ref jbucnphyrziaxupdsnbn

# 3. Verificar se STRIPE_SECRET_KEY existe
# Se não existir, adicionar:
npx supabase secrets set STRIPE_SECRET_KEY="sk_live_SEU_SECRET_AQUI" --project-ref jbucnphyrziaxupdsnbn

# 4. Listar novamente para confirmar
npx supabase secrets list --project-ref jbucnphyrziaxupdsnbn
```

## Secrets Necessários

| Secret | Onde Pegar | Usado Para |
|--------|-----------|------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys → Secret key | Autenticar requisições à API Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Endpoint → Signing secret | Validar webhooks do Stripe |

## Como Testar se Está Funcionando

Após configurar os secrets:

1. **Testar Webhook:**
   - No Stripe Dashboard → Developers → Webhooks
   - Clique no endpoint criado
   - Vá para aba "Send test webhook"
   - Envie um evento `checkout.session.completed`
   - Verifique os logs em "Recent deliveries"

2. **Verificar Logs do Supabase:**
   - Supabase Dashboard → Edge Functions → `stripe-webhook`
   - Verifique se há erros nos logs

3. **Teste Real (Modo Test):**
   - Use um dos payment links em modo test
   - Complete uma compra com cartão de teste: `4242 4242 4242 4242`
   - Verifique se o webhook foi chamado
   - Verifique se o registro foi criado na tabela `purchases`
   - Verifique se `profiles.is_premium` foi atualizado

## Troubleshooting

**Erro "Invalid signature":**
- Secret está incorreto
- Verifique se copiou o signing secret completo (começa com `whsec_`)

**Erro "Missing environment variables":**
- Secret não foi configurado corretamente
- Use `npx supabase secrets list` para verificar

**Webhook não é chamado:**
- Verifique a URL do endpoint no Stripe
- Certifique-se de que edge function está deployada
- Verifique firewall/CORS
