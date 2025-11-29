import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, recordLoginAttempt } from '@/lib/security/rateLimit';
import { logAuditEvent, getRequestMetadata } from '@/lib/security/auditLog';
import { createSession, generateTabSessionId } from '@/lib/auth/sessionManager';
import { generateCsrfToken } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, tabSessionId } = await request.json();
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimit = await checkLoginRateLimit(email, ipAddress);
    if (!rateLimit.allowed) {
      await logAuditEvent({
        action: 'login_failed',
        details: { email, reason: 'rate_limit_exceeded' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          remainingAttempts: rateLimit.remainingAttempts,
          resetAt: rateLimit.resetAt.toISOString(),
          requiresCaptcha: rateLimit.requiresCaptcha,
        },
        { status: 429 }
      );
    }

    // Attempt authentication with Supabase
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Record failed attempt
      await recordLoginAttempt(email, ipAddress, false);
      
      await logAuditEvent({
        action: 'login_failed',
        details: { email, reason: authError?.message || 'invalid_credentials' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          remainingAttempts: rateLimit.remainingAttempts - 1,
        },
        { status: 401 }
      );
    }

    // Record successful attempt
    await recordLoginAttempt(email, ipAddress, true);

    // Generate or use provided tab session ID
    const finalTabSessionId = tabSessionId || generateTabSessionId();

    // Create session in our custom session table
    const session = await createSession(
      authData.user.id,
      finalTabSessionId,
      ipAddress,
      userAgent
    );

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Log successful login
    await logAuditEvent({
      userId: authData.user.id,
      action: 'login_success',
      details: { email },
      ipAddress,
      userAgent,
    });

    // Return session data
    return NextResponse.json({
      success: true,
      tabSessionId: session.tabSessionId,
      csrfToken,
      expiresAt: session.expiresAt.toISOString(),
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
