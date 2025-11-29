import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { supabaseConfig } from './config'

export async function createClient() {
  const supabaseUrl = supabaseConfig.url
  const supabaseKey = supabaseConfig.anonKey
  
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client with service role privileges.
 * WARNING: This bypasses Row Level Security (RLS). Only use for system operations
 * like creating sessions, audit logs, and other administrative tasks.
 * Never use this for user-facing data operations.
 */
export function createServiceRoleClient() {
  const supabaseUrl = supabaseConfig.url
  const supabaseServiceRoleKey = supabaseConfig.serviceRoleKey

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
