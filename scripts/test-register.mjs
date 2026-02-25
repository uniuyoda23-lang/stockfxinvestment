import { createClient } from '@supabase/supabase-js';

// Supabase config (matches src/lib/supabase.ts)
const SUPABASE_URL = 'https://ngxptvwtklwalmkbnylq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neHB0dnd0a2x3YWxta2JueWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODI3OTQsImV4cCI6MjA4NzI1ODc5NH0.jkarGZIw266L8doCzwcyAEkLjp7JujLM-COzeQ0J1SM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3] || 'TestPass123!';
  const name = process.argv[4] || (email ? email.split('@')[0] : 'Test User');

  if (!email) {
    console.error('Usage: node scripts/test-register.mjs <email> [password] [name]');
    process.exit(1);
  }

  console.log('Registering:', email);
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      process.exit(1);
    }

    console.log('Auth user created:', authData.user?.id);
    const userId = authData.user?.id;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ id: userId, email, name, balance: 0, createdAt: new Date().toISOString(), status: 'active', registrationStatus: 'verified' }])
      .select()
      .single();

    if (userError) {
      console.error('Error inserting user row:', userError);
      process.exit(1);
    }

    console.log('User row inserted:', userData);
    console.log('✅ Registration complete');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
