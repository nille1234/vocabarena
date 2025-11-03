import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const _next = searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/teacher'

  // Log for debugging
  console.log('Confirmation request:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Successfully verified - redirect user to specified URL or teacher dashboard
      console.log('Email confirmed successfully, redirecting to:', next)
      redirect(next)
    } else {
      // Verification failed - redirect to error page with details
      console.error('Email confirmation error:', error)
      redirect(`/auth/error?error=${encodeURIComponent(error?.message || 'Verification failed')}`)
    }
  }

  // Missing required parameters
  console.error('Missing token_hash or type in confirmation request')
  redirect(`/auth/error?error=${encodeURIComponent('Invalid confirmation link. Please request a new confirmation email.')}`)
}
