# Próximos Passos: Integração Stripe + Auto-Login

## Status Atual ✅

- ✅ PWAInstallStep removido do quiz (25 steps total agora)
- ✅ SubscriptionOffersStep implementado com planos mensal e anual
- ✅ Links de pagamento Stripe configurados:
  - Mensal (R$ 19,90): `https://buy.stripe.com/eVq14n6n216Wff29lG9oc01`
  - Anual (R$ 99,90): `https://buy.stripe.com/6oU3cv3aQ16Wd6UeG09oc00`
- ✅ Webhook Stripe já existe em: `App/supabase/functions/stripe-webhook/index.ts`
- ✅ Trigger automático de premium já configurado na tabela `purchases`

## Próximos Passos (Para Implementar)

### 1. Configurar Success URL no Stripe Dashboard

**O que fazer:**
- Acessar Stripe Dashboard → Payment Links
- Editar os dois links de pagamento (mensal e anual)
- Configurar `success_url` para: `https://habitz.life/app?session_id={CHECKOUT_SESSION_ID}`

**Por que:**
- Após pagamento bem-sucedido, usuário será redirecionado para o app (não mais para landing)
- O `session_id` permitirá identificar a sessão de checkout no app

### 2. Configurar Webhook Stripe

**O que fazer:**
- Acessar Stripe Dashboard → Developers → Webhooks
- Adicionar endpoint: `https://jbucnphyrziaxupdsnbn.supabase.co/functions/v1/stripe-webhook`
- Selecionar eventos:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

**Por que:**
- Webhook já existe e está configurado para liberar acesso premium
- Eventos selecionados cobrem todo ciclo de vida da assinatura

### 3. Implementar Auto-Login no App (habitz.life/app)

**Arquivos a modificar:**

#### `App/src/App.tsx` ou página de welcome
```typescript
// Detectar session_id na URL
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session_id');

if (sessionId) {
  // Buscar dados da sessão no backend
  const response = await fetch('/api/stripe/session-info', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  });

  const { email, userId } = await response.json();

  // Auto-login usando Supabase magic link ou token
  await supabase.auth.signInWithOtp({ email });

  // Redirecionar para onboarding
  navigate('/onboarding');
}
```

#### Criar Edge Function: `App/supabase/functions/stripe-session-info/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
});

serve(async (req) => {
  const { sessionId } = await req.json();

  // Buscar sessão do Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Buscar usuário no banco
  const { data: user } = await supabase
    .from('profiles')
    .select('user_id, email')
    .eq('email', session.customer_email)
    .single();

  return new Response(
    JSON.stringify({
      email: session.customer_email,
      userId: user?.user_id,
      status: session.payment_status
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

### 4. Persistir Progresso do Quiz (Opcional, mas Recomendado)

**Por que:**
- Se usuário abandona checkout e volta, não precisa refazer todo quiz
- Dados já coletados podem ser reutilizados

**Como:**
- Salvar respostas do quiz em `localStorage` durante preenchimento
- Ao retornar, verificar se há dados salvos e restaurar estado
- Limpar após conclusão da compra

**Arquivo a modificar:** `Landing/src/components/quiz/QuizProvider.tsx`
```typescript
// No useEffect, carregar dados salvos
useEffect(() => {
  const savedData = localStorage.getItem('quiz_progress');
  if (savedData) {
    const parsed = JSON.parse(savedData);
    // Restaurar todos os estados
    setObjective(parsed.objective);
    setTimeAvailable(parsed.timeAvailable);
    // ... etc
  }
}, []);

// Salvar progresso a cada mudança
useEffect(() => {
  localStorage.setItem('quiz_progress', JSON.stringify({
    objective,
    timeAvailable,
    energyPeak,
    // ... todos os estados
  }));
}, [objective, timeAvailable, energyPeak, /* ... */]);
```

### 5. Implementar PWA Install no App (Não na Landing)

**Por que:**
- Landing não tem manifest.json nem service worker
- App principal já tem infraestrutura PWA completa
- Usuário só deve ser incentivado a instalar após se tornar cliente

**Onde implementar:**
- Criar prompt de instalação em `App/src/components/PWAInstallPrompt.tsx`
- Mostrar após primeiro login bem-sucedido
- Usar `beforeinstallprompt` event do navegador

## Ordem de Implementação Recomendada

1. **Imediato (hoje):**
   - [ ] Configurar success_url nos payment links do Stripe
   - [ ] Configurar webhook no Stripe Dashboard

2. **Curto prazo (esta semana):**
   - [ ] Implementar auto-login no app com session_id
   - [ ] Criar edge function `stripe-session-info`
   - [ ] Testar fluxo completo: quiz → checkout → auto-login → app

3. **Médio prazo (próxima semana):**
   - [ ] Implementar persistência de progresso do quiz
   - [ ] Adicionar PWA install prompt no app
   - [ ] Implementar onboarding para novos usuários premium

## Fluxo Completo Final

1. **Usuário na Landing (habitz.life/bora):**
   - Preenche quiz (25 steps)
   - Chega em DataCollectionStep (step 23) → fornece email/nome/telefone
   - Vê SubscriptionOffersStep (step 24) → escolhe plano

2. **Checkout Stripe:**
   - Clica em plano → vai para Stripe Checkout
   - Preenche dados de pagamento
   - Confirma compra

3. **Após Pagamento:**
   - Stripe redireciona para: `habitz.life/app?session_id=xyz`
   - Webhook Stripe chama edge function → cria registro em `purchases`
   - Trigger PostgreSQL atualiza `profiles.is_premium = true`

4. **No App (habitz.life/app):**
   - Detecta `session_id` na URL
   - Busca dados da sessão via edge function
   - Faz auto-login com email do cliente
   - Mostra onboarding personalizado
   - Oferece instalação PWA (primeira vez)

## Arquivos de Referência

- **Webhook Stripe:** `App/supabase/functions/stripe-webhook/index.ts`
- **Trigger Premium:** `App/supabase/migrations/20250926001807_premium_billing.sql`
- **Quiz Provider:** `Landing/src/components/quiz/QuizProvider.tsx`
- **Subscription Offers:** `Landing/src/components/quiz/steps/SubscriptionOffersStep.tsx`

## Observações Importantes

- ✅ Não criar novos edge functions desnecessários (reutilizar webhook existente)
- ✅ Não duplicar lógica de premium (trigger já existe)
- ✅ Manter BuckPay/Kirvano webhooks para usuários antigos
- ✅ Testar fluxo completo em ambiente de desenvolvimento antes de produção

---

**Última atualização:** 2025-12-22
**Responsável:** Time de Desenvolvimento Habitz
