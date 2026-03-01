import { createClient } from '@supabase/supabase-js';

// you can override the raw Supabase URL by providing a proxy URL, e.g.
// https://myapp.example/api/supabase-proxy.  This proxy will forward all
// requests to the real Supabase host on behalf of the client, which is useful
// when devices cannot resolve the direct Supabase domain.
// During development we can route all Supabase requests through the local
// serverless proxy so we don't hit DNS issues and so developers don't have to
// remember to set an env var. In production the proxy URL is optional and will
// only be used if the env var is provided.
const SUPABASE_URL =
  (import.meta.env.DEV ? '/api/supabase-proxy' : undefined) ||
  process.env.VITE_SUPABASE_PROXY_URL ||
  'https://ngxptvwtklwalmkbnylq.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neHB0dnd0a2x3YWxta2JueWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODI3OTQsImV4cCI6MjA4NzI1ODc5NH0.jkarGZIw266L8doCzwcyAEkLjp7JujLM-COzeQ0J1SM';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Supabase (create tables if they don't exist)
export async function initializeSupabase() {
  console.log('🚀 Initializing Supabase...');
  
  try {
    // Test connection
    const { error } = await supabase.from('users').select('count');
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase initialization error:', err);
    return false;
  }
}
