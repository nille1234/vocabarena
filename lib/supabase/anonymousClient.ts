import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates an anonymous Supabase client for public access (e.g., students accessing game links)
 * This client doesn't require authentication and uses the anon key
 */
export function createAnonymousClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
