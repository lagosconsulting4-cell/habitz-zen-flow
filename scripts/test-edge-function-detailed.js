/**
 * Teste Detalhado do Edge Function create-password-direct
 */

const SUPABASE_URL = 'https://jbucnphyrziaxupdsnbn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg';

const TEST_EMAIL = 'lagosconsulting4@gmail.com';

async function testWithFullDetails(email, password) {
  console.log('🧪 Testando Edge Function com detalhes completos\n');
  console.log('Request:');
  console.log('-'.repeat(60));
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');

  const startTime = Date.now();

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-password-direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ email, password })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Response:');
    console.log('-'.repeat(60));
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Duration: ${duration}ms`);
    console.log('');

    console.log('Headers:');
    console.log('-'.repeat(60));
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log('');

    const text = await response.text();
    console.log('Body:');
    console.log('-'.repeat(60));
    console.log(text);
    console.log('');

    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:');
        console.log('-'.repeat(60));
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('(Resposta não é JSON válido)');
      }
    }

    return { status: response.status, ok: response.ok, body: text };
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return { error: error.message };
  }
}

async function verifyUserAndPurchase(email) {
  console.log(`\n🔍 Verificando usuário e purchase: ${email}`);
  console.log('-'.repeat(60));

  // Check profile
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&email=eq.${encodeURIComponent(email)}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });

  const profiles = await profileResponse.json();

  if (profiles.length > 0) {
    const profile = profiles[0];
    console.log('✅ Profile encontrado:');
    console.log(`  - user_id: ${profile.user_id}`);
    console.log(`  - email: ${profile.email}`);
    console.log(`  - display_name: ${profile.display_name}`);
    console.log('');

    // Check purchase
    const purchaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/purchases?select=*&user_id=eq.${profile.user_id}`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    const purchases = await purchaseResponse.json();

    if (purchases.length > 0) {
      console.log(`✅ ${purchases.length} purchase(s) encontrada(s):`);
      purchases.forEach((p, i) => {
        console.log(`  ${i + 1}. Status: ${p.status}, Valor: R$ ${(p.amount_cents / 100).toFixed(2)}`);
      });

      const paidPurchases = purchases.filter(p => p.status === 'paid');
      if (paidPurchases.length > 0) {
        console.log(`\n✅ ${paidPurchases.length} purchase(s) com status="paid"`);
      } else {
        console.log(`\n⚠️  Nenhuma purchase com status="paid"`);
      }
    } else {
      console.log('❌ Nenhuma purchase encontrada');
    }
  } else {
    console.log('❌ Profile não encontrado');
  }
}

async function main() {
  await verifyUserAndPurchase(TEST_EMAIL);
  console.log('\n' + '='.repeat(60) + '\n');
  await testWithFullDetails(TEST_EMAIL, 'teste123456');
}

main().catch(error => {
  console.error('❌ ERRO:', error);
  process.exit(1);
});
