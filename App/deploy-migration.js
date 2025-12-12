const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://jbucnphyrziaxupdsnbn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWNucGh5cnppYXh1cGRzbmJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODcxODAwMCwiZXhwIjoyMDc0Mjk0MDAwfQ.pKIwL0WpNwNWeJk8GdunuJ76SbAFzZRg5V-nGwk2dtg';

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251211000000_admin_system.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('🚀 Deploying admin system migration...\n');
console.log('Migration file:', migrationPath);
console.log('SQL length:', sql.length, 'characters\n');

// Split SQL into individual statements (simple approach)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('Total statements to execute:', statements.length);
console.log('\n⏳ Executing migration...\n');

let successCount = 0;
let errorCount = 0;

// Execute statements sequentially
async function executeStatement(statement, index) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query: statement + ';'
    });

    const options = {
      hostname: 'jbucnphyrziaxupdsnbn.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          process.stdout.write('.');
          resolve({ success: true, index });
        } else {
          process.stdout.write('✗');
          reject({ success: false, index, status: res.statusCode, body, statement: statement.substring(0, 100) });
        }
      });
    });

    req.on('error', (e) => {
      process.stdout.write('✗');
      reject({ success: false, index, error: e.message, statement: statement.substring(0, 100) });
    });

    req.write(data);
    req.end();
  });
}

// Try alternative: use psql connection string approach
// Since exec_sql might not exist, we'll use direct SQL execution via REST API
async function executeMigration() {
  console.log('Note: Using direct Supabase SQL execution...\n');

  // Alternative: Execute the full SQL at once
  const data = JSON.stringify({
    query: sql
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'jbucnphyrziaxupdsnbn.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      }
    };

    // Actually, let's save the SQL to a temp file and instruct the user
    console.log('\n❌ Direct SQL execution via REST API is not available.');
    console.log('\n📋 Please execute the migration manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/sql/new');
    console.log('2. Copy the SQL from: App/supabase/migrations/20251211000000_admin_system.sql');
    console.log('3. Paste it in the SQL Editor');
    console.log('4. Click "RUN" or press Ctrl+Enter\n');

    reject({ manual: true });
  });
}

executeMigration().catch(err => {
  if (!err.manual) {
    console.error('Error:', err);
  }
  process.exit(err.manual ? 0 : 1);
});
