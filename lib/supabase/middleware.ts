import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Access environment variables directly for edge runtime compatibility
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Get user and validate session
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Additional session validation - check if session exists and is valid
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/update-password',
    '/auth/confirm',
    '/auth/error',
    '/auth/sign-up-success',
    '/game',
    '/play',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/check',
    '/api/auth/refresh',
    '/api/invite-teacher',
    '/api/game-access'
  ]

  // Protected routes that MUST have authentication
  const protectedPaths = [
    '/teacher',
    '/protected'
  ]

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow access to homepage
  const isHomePage = request.nextUrl.pathname === '/'

  // STRICT: Protected routes MUST have valid authentication and active session
  if (isProtectedPath && (!user || error || !session)) {
    console.warn('Unauthorized access attempt to protected route:', request.nextUrl.pathname, {
      hasUser: !!user,
      hasError: !!error,
      hasSession: !!session
    });
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // For other routes (not explicitly public or protected), also require auth and session
  const isOtherRoute = !isPublicPath && !isProtectedPath && !isHomePage
  if (isOtherRoute && (!user || error || !session)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages to teacher dashboard
  const authPaths = ['/auth/login', '/auth/sign-up']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname === path
  )

  if (user && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/teacher'
    return NextResponse.redirect(url)
  }

  const isDevelopment = process.env.NODE_ENV !== 'production'

  // Add security headers to all responses
  // Note: X-Frame-Options conflicts with CSP frame-ancestors, so only set in production
  if (!isDevelopment) {
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  }
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  // Add Strict-Transport-Security for HTTPS (only in production)
  if (!isDevelopment) {
    supabaseResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  // Add Content-Security-Policy
  // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for development
  // In production, consider using nonces for inline scripts
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    isDevelopment ? "frame-ancestors 'self' https://*.henosia.com" : "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')
  
  supabaseResponse.headers.set('Content-Security-Policy', cspDirectives)

  // Add Cache-Control for authenticated pages
  if (!isPublicPath && !isHomePage) {
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
