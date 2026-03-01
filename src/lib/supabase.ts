import { createClient } from '@supabase/supabase-js';

// you can override the raw Supabase URL by providing a proxy URL, e.g.
// https://myapp.example/api/supabase-proxy.  This proxy will forward all
// requests to the real Supabase host on behalf of the client, which is useful
// when devices cannot resolve the direct Supabase domain.
// Always route Supabase traffic through our own serverless proxy by default.
// This ensures the app continues working even when the client network cannot
// resolve the real Supabase hostname (which happens on some school/firewall
// networks). The proxy simply forwards requests to Supabase, so there's no
// loss of functionality, just an extra hop on the same origin.
//
// You can override the URL by setting VITE_SUPABASE_PROXY_URL to a custom
// proxy (e.g. a dedicated subdomain) or, in rare cases, set it directly to the
// Supabase URL if you truly don't want to use the proxy.
// choose proxy or direct URL and ensure it is absolute; Supabase client
// rejects relative URLs so we construct the full host if needed.
function getSupabaseUrl() {
  let url = process.env.VITE_SUPABASE_PROXY_URL || '/api/supabase-proxy' ||
    'https://ngxptvwtklwalmkbnylq.supabase.co';

  // if url is relative, prefix with the current origin (browser) or localhost
  if (!/^https?:\/\//i.test(url)) {
    if (typeof window !== 'undefined' && window.location) {
      url = window.location.origin + url;
    } else {
      // during SSR/build we don't have a window; default to localhost
      url = 'http://localhost:5173' + url;
    }
  }
  return url;
}

const SUPABASE_URL = getSupabaseUrl();

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
