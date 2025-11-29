import { NextRequest, NextResponse } from 'next/server';
import { updateSessionActivity } from '@/lib/auth/sessionManager';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const tabSessionId = request.headers.get('x-tab-session');

    if (!tabSessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Update session activity timestamp
    await updateSessionActivity(tabSessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
