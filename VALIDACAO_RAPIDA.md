# ⚡ Validação Rápida (5 minutos)

**Execute estes 2 scripts no Supabase SQL Editor**:
`https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/sql/new`

---

## Script 1: Validação de Infraestrutura ✅

Copie e execute: [App/supabase/scripts/validate_fix.sql](App/supabase/scripts/validate_fix.sql)

**O que valida**:
- ✅ Funções: `current_user_is_admin()`, `get_user_id_by_email()`
- ✅ RLS Policies: user_cohorts, sessions, events
- ✅ Triggers: handle_new_user, auto_assign_cohort
- ✅ Clientes recuperados: Lucas, Samira

**Resultado esperado**:
```
✅ CHECK 1 PASSOU: 2 funções encontradas
✅ CHECK 2 PASSOU: 3 policies de INSERT encontradas
✅ CHECK 3 PASSOU: RLS habilitado em todas as tabelas
✅ CHECK 4 PASSOU: Função retornou UUID válido
✅ CHECK 5 PASSOU: Triggers críticos estão ativos
✅ CHECK 6 PASSOU: Clientes recuperados
🎉 VALIDAÇÃO COMPLETA: Sistema Operacional
```

**Se algo falhar**: A migration não foi aplicada corretamente.

---

## Script 2: Teste End-to-End 🧪

Copie e execute: [App/supabase/scripts/test_user_creation_flow.sql](App/supabase/scripts/test_user_creation_flow.sql)

**O que testa**:
- 🧪 Simula exatamente o fluxo do stripe-webhook
- 🧪 Cria usuário em auth.users (dispara triggers)
- 🧪 Verifica se profile foi criado automaticamente
- 🧪 Verifica se cohort foi criado automaticamente (ERA O BLOCKER)

**Resultado esperado**:
```
[✅] STEP 1 PASSOU: Usuário criado em auth.users
[✅] STEP 2 PASSOU: Profile criado automaticamente pelo trigger
[✅] STEP 3 PASSOU: Cohort criado automaticamente pelo trigger
    ✨ RLS policy "System can insert cohorts" está funcionando!
🎉 TESTE COMPLETO: PASSOU EM TODOS OS STEPS
🟢 SISTEMA OPERACIONAL
```

**Se STEP 3 falhar**:
```
[❌] STEP 3 FALHOU: Cohort NÃO foi criado pelo trigger!
🔴 PROBLEMA CRÍTICO: RLS bloqueando INSERT
```
→ Significa que a migration não foi aplicada. Execute:
```bash
cd App
npx supabase db push
```

---

## ✅ Critério de Sucesso

**Sistema está 100% validado quando**:

1. ✅ Script 1 retorna: `🎉 VALIDAÇÃO COMPLETA: Sistema Operacional`
2. ✅ Script 2 retorna: `🟢 SISTEMA OPERACIONAL`

**Quando isso acontecer**: Novos checkouts Stripe vão funcionar sem erros!

---

## 🎯 Validação Final (Opcional, mas Recomendado)

### Teste com Stripe Real

1. Acesse: https://dashboard.stripe.com/test/products
2. Crie um checkout de teste
3. Use cartão de teste: `4242 4242 4242 4242`
4. Complete o pagamento com um email novo (ex: `teste.final@habitz.com`)

**Monitore os logs**:
`https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/logs/edge-functions`

**Deve aparecer**:
```
Creating user account for: teste.final@habitz.com
✅ Auth user created: [uuid]
✅ Profile created with phone for new user: [uuid]
Purchase upserted for user [uuid], status: paid
```

**NÃO deve aparecer**:
```
Database error creating new user ❌
```

---

## 📁 Arquivos de Referência

- **Guia Completo**: [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md) (15 min)
- **Resumo do Fix**: [FIX_SUMMARY.md](FIX_SUMMARY.md)
- **Script de Validação**: [App/supabase/scripts/validate_fix.sql](App/supabase/scripts/validate_fix.sql)
- **Script de Teste**: [App/supabase/scripts/test_user_creation_flow.sql](App/supabase/scripts/test_user_creation_flow.sql)

---

## 🚨 Troubleshooting Rápido

### Problema: Script 1 retorna "CHECK X FALHOU"
**Solução**:
```bash
cd App
npx supabase db push
```

### Problema: Script 2 falha no STEP 3
**Causa**: RLS policy "System can insert cohorts" não existe
**Solução**:
```bash
cd App
npx supabase db push
```

### Problema: Stripe checkout ainda dá erro
**Causa**: Migration não foi aplicada
**Verificar**:
```bash
cd App
npx supabase migration list --linked | grep 20260120000000
```
Se não aparecer, force apply:
```bash
npx supabase db push
```

---

**Tempo Total**: 5-10 minutos
**Última Atualização**: 2026-01-20
