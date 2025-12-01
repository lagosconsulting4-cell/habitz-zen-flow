/**
 * Script para Corrigir e Testar o Fluxo de Pagamento
 */

const SUPABASE_URL = 'https://jbucnphyrziaxupdsnbn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg';

const TEST_EMAIL = 'lagosconsulting4@gmail.com';

console.log('🔧 Correção e Teste do Fluxo de Pagamento\n');

async function getUserId(email) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=user_id&email=eq.${encodeURIComponent(email)}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });

  const data = await response.json();
  return data[0]?.user_id || null;
}

async function createPurchase(userId) {
  const purchase = {
    user_id: userId,
    provider: 'kirvano',
    provider_session_id: `test-${Date.now()}`,
    provider_payment_intent: `test-intent-${Date.now()}`,
    amount_cents: 9700,
    currency: 'BRL',
    status: 'paid'
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(purchase)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create purchase: ${error}`);
  }

  return response.json();
}

async function testCreatePassword(email, password) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-password-direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ email, password })
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

async function main() {
  console.log('PASSO 1: Buscar user_id');
  console.log('-'.repeat(60));

  const userId = await getUserId(TEST_EMAIL);

  if (!userId) {
    console.log(`❌ Usuário ${TEST_EMAIL} não encontrado!`);
    return;
  }

  console.log(`✅ User ID encontrado: ${userId}\n`);

  console.log('PASSO 2: Criar purchase de teste');
  console.log('-'.repeat(60));

  try {
    const purchase = await createPurchase(userId);
    console.log('✅ Purchase criada com sucesso!');
    console.log(`  - ID: ${purchase[0].id}`);
    console.log(`  - Status: ${purchase[0].status}`);
    console.log(`  - Valor: R$ ${(purchase[0].amount_cents / 100).toFixed(2)}\n`);
  } catch (error) {
    console.log(`❌ Erro ao criar purchase: ${error.message}\n`);
    return;
  }

  console.log('PASSO 3: Testar create-password-direct');
  console.log('-'.repeat(60));

  const result = await testCreatePassword(TEST_EMAIL, 'teste123456');

  console.log(`Status: ${result.status}`);
  console.log(`Sucesso: ${result.ok ? 'SIM' : 'NÃO'}`);
  console.log(`Resposta:`, JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('\n✅ TUDO FUNCIONANDO!');
    console.log('\n📧 Credenciais de teste:');
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Senha: teste123456`);
    console.log(`  Link: https://www.habitz.life/app/auth`);
  } else {
    console.log('\n❌ Ainda há problemas. Verifique os logs do Edge Function.');
  }
}

main().catch(error => {
  console.error('❌ ERRO:', error);
  process.exit(1);
});
