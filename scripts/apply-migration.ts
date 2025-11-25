/**
 * Script para aplicar migration de categorias manualmente
 * Executa o SQL diretamente no Supabase remoto
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuração (usar variáveis de ambiente)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkCurrentConstraint() {
  console.log('🔍 Verificando constraint atual...\n');

  const { data, error } = await supabase.rpc('check_constraint', {
    query: `
      SELECT
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conname = 'habits_category_check';
    `
  });

  if (error) {
    console.log('ℹ️  Não foi possível verificar via RPC. Tentando query direta...\n');
    return null;
  }

  return data;
}

async function applyMigration() {
  console.log('📋 Aplicando Migration: 20251124000000_update_habit_categories.sql\n');

  const migrationPath = join(__dirname, '..', 'App', 'supabase', 'migrations', '20251124000000_update_habit_categories.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('SQL a ser executado:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('');

  // Dividir SQL em comandos individuais
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  console.log(`Executando ${commands.length} comandos SQL...\n`);

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i] + ';';
    console.log(`[${i + 1}/${commands.length}] Executando comando...`);

    const { error } = await supabase.rpc('exec_sql', {
      query: command
    });

    if (error) {
      console.error(`❌ Erro no comando ${i + 1}:`, error.message);
      console.error('Comando:', command);

      // Tentar método alternativo com client direto
      console.log('Tentando método alternativo...');

      // Para este caso específico, vamos executar via REST API diretamente
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: command })
      });

      if (!response.ok) {
        console.error('❌ Método alternativo também falhou');
        process.exit(1);
      }
    } else {
      console.log(`✅ Comando ${i + 1} executado com sucesso`);
    }
  }

  console.log('\n✅ Migration aplicada com sucesso!\n');
}

async function verifyMigration() {
  console.log('🔍 Verificando aplicação da migration...\n');

  // Tentar criar um hábito de teste com categoria em inglês
  const testHabit = {
    title: 'Test Habit (Delete Me)',
    category: 'productivity', // Categoria em inglês
    goal_value: 10,
    unit: 'minutes',
    frequency_type: 'daily',
    selected_days: [1, 2, 3, 4, 5],
    user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
  };

  console.log('Tentando inserir hábito de teste com categoria em inglês...');

  const { data, error } = await supabase
    .from('habits')
    .insert(testHabit)
    .select()
    .single();

  if (error) {
    if (error.message.includes('category_check')) {
      console.log('❌ Constraint ainda não permite categoria em inglês');
      console.log('   Erro:', error.message);
      return false;
    } else if (error.message.includes('foreign key')) {
      console.log('✅ Constraint de categoria OK! (erro é FK de user_id, esperado)');
      return true;
    } else {
      console.log('⚠️  Erro inesperado:', error.message);
      return false;
    }
  }

  // Se chegou aqui, inseriu com sucesso
  console.log('✅ Hábito inserido com sucesso!');

  // Deletar hábito de teste
  if (data?.id) {
    await supabase.from('habits').delete().eq('id', data.id);
    console.log('🗑️  Hábito de teste deletado');
  }

  return true;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('   Migration Manager - Habit Categories');
  console.log('═'.repeat(60));
  console.log('');

  try {
    // Verificar constraint atual
    await checkCurrentConstraint();

    // Aplicar migration
    await applyMigration();

    // Verificar se funcionou
    const success = await verifyMigration();

    if (success) {
      console.log('');
      console.log('═'.repeat(60));
      console.log('✅ MIGRATION APLICADA E VERIFICADA COM SUCESSO!');
      console.log('═'.repeat(60));
      process.exit(0);
    } else {
      console.log('');
      console.log('═'.repeat(60));
      console.log('⚠️  MIGRATION APLICADA MAS VERIFICAÇÃO FALHOU');
      console.log('   Pode ser necessário aplicar manualmente via Dashboard');
      console.log('═'.repeat(60));
      process.exit(1);
    }
  } catch (error: any) {
    console.error('');
    console.error('═'.repeat(60));
    console.error('❌ ERRO DURANTE EXECUÇÃO');
    console.error('═'.repeat(60));
    console.error(error.message);
    console.error('');
    console.error('Para aplicar manualmente:');
    console.error('1. Acesse: https://supabase.com/dashboard');
    console.error('2. Vá para SQL Editor');
    console.error('3. Cole o conteúdo de:');
    console.error('   App/supabase/migrations/20251124000000_update_habit_categories.sql');
    console.error('4. Execute');
    process.exit(1);
  }
}

main();
