import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (client) {
    return client
  }

  // Access environment variables directly to avoid importing server-only config
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Validate environment variables are defined
  if (!supabaseUrl || !supabaseKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file.`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
  
  // Create client with session storage (not persistent across browser sessions)
  // This ensures users must log in every time they open the browser
  client = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
      autoRefreshToken: true,
      persistSession: true, // Persist only in session storage, not local storage
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
  
  return client
}
