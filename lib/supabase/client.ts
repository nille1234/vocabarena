import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

let client: SupabaseClient | null = null

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (client) {
    return client
  }

  const supabaseUrl = supabaseConfig.url
  const supabaseKey = supabaseConfig.anonKey
  
  // Create and cache the client
  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
