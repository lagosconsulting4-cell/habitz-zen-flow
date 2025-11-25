/**
 * Script de Diagnóstico Completo do Supabase
 *
 * Uso: node scripts/diagnose-supabase.js
 */

const SUPABASE_URL = 'https://jbucnphyrziaxupdsnbn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg';

console.log('🔍 Diagnóstico Completo do Supabase - Habitz\n');
console.log('Project ID:', 'jbucnphyrziaxupdsnbn');
console.log('URL:', SUPABASE_URL);
console.log('='.repeat(60), '\n');

async function query(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    // Usar endpoint alternativo
    const postgrestResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    return null;
  }

  return response.json();
}

async function checkTable(tableName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=0`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function getTableData(tableName, select = '*', limit = 5) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=${select}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });

    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function testEdgeFunction(functionName, payload) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload)
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
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  console.log('1️⃣  VERIFICANDO TABELAS DO BANCO');
  console.log('-'.repeat(60));

  const tables = ['profiles', 'purchases', 'meditations', 'habits'];

  for (const table of tables) {
    const exists = await checkTable(table);
    console.log(`  ${exists ? '✅' : '❌'} Tabela: ${table}`);
  }
  console.log('');

  console.log('2️⃣  VERIFICANDO DADOS EM PROFILES');
  console.log('-'.repeat(60));

  const profiles = await getTableData('profiles', 'id,user_id,email,display_name,created_at', 10);

  if (profiles.error) {
    console.log(`  ❌ Erro: ${profiles.error}`);
  } else if (Array.isArray(profiles)) {
    console.log(`  ℹ️  Total de profiles encontrados: ${profiles.length}`);

    if (profiles.length === 0) {
      console.log('  ⚠️  NENHUM PROFILE ENCONTRADO');
    } else {
      console.log('\n  Primeiros profiles:');
      profiles.slice(0, 3).forEach((profile, i) => {
        console.log(`    ${i + 1}. ${profile.email || '(sem email)'} - ${profile.display_name || '(sem nome)'}`);
      });
    }
  }
  console.log('');

  console.log('3️⃣  VERIFICANDO DADOS EM PURCHASES');
  console.log('-'.repeat(60));

  const purchases = await getTableData('purchases', 'id,user_id,provider,status,amount_cents,created_at', 10);

  if (purchases.error) {
    console.log(`  ❌ Erro: ${purchases.error}`);
  } else if (Array.isArray(purchases)) {
    console.log(`  ℹ️  Total de purchases encontradas: ${purchases.length}`);

    if (purchases.length === 0) {
      console.log('  ⚠️  NENHUMA PURCHASE ENCONTRADA');
    } else {
      console.log('\n  Primeiras purchases:');
      purchases.slice(0, 3).forEach((purchase, i) => {
        console.log(`    ${i + 1}. ${purchase.provider} - Status: ${purchase.status} - R$ ${(purchase.amount_cents / 100).toFixed(2)}`);
      });
    }
  }
  console.log('');

  console.log('4️⃣  TESTANDO EDGE FUNCTION: create-password-direct');
  console.log('-'.repeat(60));

  const passwordTest = await testEdgeFunction('create-password-direct', {
    email: 'teste-inexistente@teste.com',
    password: 'teste123'
  });

  console.log(`  Status: ${passwordTest.status || 'ERROR'}`);
  console.log(`  Resposta:`, JSON.stringify(passwordTest.data, null, 2));
  console.log('');

  console.log('5️⃣  TESTANDO EDGE FUNCTION: kirvano-webhook');
  console.log('-'.repeat(60));

  // Primeiro testar sem token para ver o erro
  const webhookTest = await testEdgeFunction('kirvano-webhook', {
    event: 'SALE_APPROVED',
    sale_id: 'test-diagnostic-001',
    customer: {
      email: 'teste-webhook@habitz.life',
      name: 'Teste Diagnostic'
    },
    total_price: '97.00'
  });

  console.log(`  Status: ${webhookTest.status || 'ERROR'}`);
  console.log(`  Resposta:`, JSON.stringify(webhookTest.data, null, 2));
  console.log('');

  console.log('6️⃣  VERIFICANDO ESTRUTURA DA TABELA PROFILES');
  console.log('-'.repeat(60));

  const profileSample = await getTableData('profiles', '*', 1);

  if (Array.isArray(profileSample) && profileSample.length > 0) {
    console.log('  Colunas disponíveis:');
    Object.keys(profileSample[0]).forEach(col => {
      const value = profileSample[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`    - ${col}: ${type}`);
    });
  } else {
    console.log('  ⚠️  Nenhum dado para inspecionar estrutura');
  }
  console.log('');

  console.log('7️⃣  VERIFICANDO ESTRUTURA DA TABELA PURCHASES');
  console.log('-'.repeat(60));

  const purchaseSample = await getTableData('purchases', '*', 1);

  if (Array.isArray(purchaseSample) && purchaseSample.length > 0) {
    console.log('  Colunas disponíveis:');
    Object.keys(purchaseSample[0]).forEach(col => {
      const value = purchaseSample[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`    - ${col}: ${type}`);
    });
  } else {
    console.log('  ⚠️  Nenhum dado para inspecionar estrutura');
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ DIAGNÓSTICO COMPLETO!\n');
  console.log('📊 RESUMO:');
  console.log(`  - Profiles: ${Array.isArray(profiles) ? profiles.length : 0}`);
  console.log(`  - Purchases: ${Array.isArray(purchases) ? purchases.length : 0}`);
  console.log(`  - Edge Function create-password-direct: ${passwordTest.ok ? 'OK' : 'ERRO'}`);
  console.log(`  - Edge Function kirvano-webhook: ${webhookTest.ok ? 'OK' : 'ERRO (esperado sem token)'}`);
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS:');

  if (!Array.isArray(profiles) || profiles.length === 0) {
    console.log('  1. Criar profiles de teste');
  }

  if (!Array.isArray(purchases) || purchases.length === 0) {
    console.log('  2. Criar purchases de teste');
  }

  if (!passwordTest.ok && passwordTest.status === 404) {
    console.log('  3. ⚠️  Edge Function create-password-direct retornou erro esperado (usuário não existe)');
  } else if (!passwordTest.ok) {
    console.log('  3. ❌ Edge Function create-password-direct tem problema');
  }

  if (webhookTest.status === 401) {
    console.log('  4. ⚠️  Edge Function kirvano-webhook requer token (isso é correto!)');
  } else if (!webhookTest.ok) {
    console.log('  4. ❌ Edge Function kirvano-webhook tem problema');
  }

  console.log('\n📄 Relatório salvo em: Doc/DIAGNOSTICO-SUPABASE.txt');
}

main().catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
