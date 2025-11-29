import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateSession, updateSessionActivity } from '@/lib/auth/sessionManager';
import { logAuditEvent, getRequestMetadata } from '@/lib/security/auditLog';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tabSessionId = request.headers.get('x-tab-session');
    const { ipAddress, userAgent } = getRequestMetadata(request);

    if (!tabSessionId) {
      return NextResponse.json(
        { error: 'No session found', authenticated: false },
        { status: 401 }
      );
    }

    // Validate custom session
    const session = await validateSession(tabSessionId);
    if (!session) {
      await logAuditEvent({
        action: 'session_expired',
        details: { reason: 'invalid_or_expired_session' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: 'Session expired', authenticated: false },
        { status: 401 }
      );
    }

    // Validate Supabase session
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      await logAuditEvent({
        action: 'session_expired',
        details: { reason: 'supabase_session_invalid' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: 'Session expired', authenticated: false },
        { status: 401 }
      );
    }

    // Verify user ID matches session
    if (user.id !== session.userId) {
      await logAuditEvent({
        userId: user.id,
        action: 'unauthorized_access_attempt',
        details: { reason: 'user_id_mismatch' },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { error: 'Session mismatch', authenticated: false },
        { status: 401 }
      );
    }

    // Update session activity
    await updateSessionActivity(tabSessionId);

    // Get user profile for role information
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, password_change_required')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || null,
        passwordChangeRequired: profile?.password_change_required || false,
      },
      session: {
        expiresAt: session.expiresAt.toISOString(),
        lastActivityAt: session.lastActivityAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'An error occurred', authenticated: false },
      { status: 500 }
    );
  }
}
