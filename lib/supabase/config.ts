// Supabase configuration
// These values are safe to expose in the browser as they are public API keys
// IMPORTANT: Always use environment variables - never hardcode credentials

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    const errorMessage = 'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
               process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    const errorMessage = 'Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.';
    console.error(errorMessage);
    throw new Error(errorMessage);
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
  // Lazy getters to ensure environment variables are accessed only when needed
  get url(): string {
    return getSupabaseUrl();
  },
  get anonKey(): string {
    return getSupabaseAnonKey();
  },
  get serviceRoleKey(): string {
    return getSupabaseServiceRoleKey();
  }
}
