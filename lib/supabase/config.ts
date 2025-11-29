// Supabase configuration
// These values are safe to expose in the browser as they are public API keys
// IMPORTANT: Always use environment variables - never hardcode credentials

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    return '';
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    return '';
  }
  return key;
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    // Log warning but don't throw - service role key is optional
    // Only needed if using createServiceRoleClient() which bypasses RLS
    if (typeof window === 'undefined') {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set - service role operations will not be available');
    }
    return '';
  }
  return key;
}

export const supabaseConfig = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
  // Lazy getter to prevent client-side access attempts
  get serviceRoleKey(): string {
    return getSupabaseServiceRoleKey();
  }
}
