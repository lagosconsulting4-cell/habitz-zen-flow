import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://jbucnphyrziaxupdsnbn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const sql = readFileSync('./supabase/migrations/20251213000000_pg_cron_streak_reset.sql', 'utf8');

    console.log('Applying migration to Supabase...');

    // Execute SQL usando RPC (se disponível) ou via SQL direto
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('SUCCESS: Migration applied!');
    console.log('Response:', data);

    // Verificar se cron job foi criado
    console.log('\nVerifying cron job creation...');
    const { data: cronJobs, error: cronError } = await supabase
      .from('cron.job')
      .select('*')
      .eq('jobname', 'reset-expired-streaks-daily');

    if (cronError) {
      console.error('Error verifying cron job:', cronError);
    } else {
      console.log('Cron job status:', cronJobs);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applyMigration();
