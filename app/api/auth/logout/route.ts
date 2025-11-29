import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { invalidateSession } from '@/lib/auth/sessionManager';
import { logAuditEvent, getRequestMetadata } from '@/lib/security/auditLog';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const tabSessionId = request.headers.get('x-tab-session');
    const { ipAddress, userAgent } = getRequestMetadata(request);

    // Get current user before logging out
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Invalidate custom session if tab session ID provided
    if (tabSessionId) {
      await invalidateSession(tabSessionId);
    }

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Log logout event
    if (user) {
      await logAuditEvent({
        userId: user.id,
        action: 'logout',
        details: { email: user.email },
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
