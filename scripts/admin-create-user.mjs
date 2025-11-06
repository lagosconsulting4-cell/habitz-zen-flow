// scripts/admin-create-user.mjs
import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const args = Object.create(null);
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      if (v !== undefined) args[k] = v;
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) args[k] = argv[++i];
      else args[k] = true;
    }
  }
  return args;
}

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const args = parseArgs(process.argv);
const email = args.email || args.e;
const password = args.password || args.pw;
const displayName = args.name || 'Tester';
const premium = Boolean(args.premium || args.pro || args.p);
const price = Number(args.price ?? 4790);

if (!email || !password) {
  console.error('Usage: node scripts/admin-create-user.mjs --email user@example.com --password "Strong#123" [--name "Nome"] [--premium] [--price 4790]');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

try {
  // 1) Create user (admin)
  const { data: userResp, error: userErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });
  if (userErr) throw userErr;

  const user = userResp.user;
  if (!user) throw new Error('User not returned');
  console.log('User created:', { id: user.id, email: user.email });

  // 2) Ensure profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: insProfErr } = await supabase.from('profiles').insert({
      user_id: user.id,
      display_name: displayName,
      is_premium: false,
    });
    if (insProfErr) {
      console.warn('Warning: failed to insert profile (will continue):', insProfErr.message);
    } else {
      console.log('Profile inserted');
    }
  } else {
    console.log('Profile already exists');
  }

  // 3) Optionally mark premium
  if (premium) {
    // Preferred: insert a paid purchase to trigger your DB logic
    const { error: purchErr } = await supabase.from('purchases').insert({
      user_id: user.id,
      provider: 'manual',
      provider_reference: 'admin-script',
      amount: price,
      currency: 'BRL',
      status: 'paid',
    });
    if (purchErr) {
      console.warn('Warning: failed to insert purchase, will force profile premium:', purchErr.message);
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ is_premium: true, premium_since: new Date().toISOString() })
        .eq('user_id', user.id);
      if (updErr) throw updErr;
      console.log('Profile marked premium directly');
    } else {
      console.log('Purchase inserted (should mark profile premium via trigger)');
    }
  }

  console.log('\nDone. Credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
} catch (err) {
  console.error('Failed:', err);
  process.exit(1);
}
