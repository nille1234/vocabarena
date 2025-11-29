import { NextRequest, NextResponse } from 'next/server';
import { validateGameAccess } from '@/lib/supabase/gameAccess.server';
import { GameMode } from '@/types/game';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const gameMode = searchParams.get('gameMode') as GameMode | null;

  if (!code) {
    return NextResponse.json(
      { error: 'Game code is required' },
      { status: 400 }
    );
  }

  const result = await validateGameAccess(code, gameMode || undefined);

  // Create response with no-cache headers
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (!result.allowed && result.error) {
    return NextResponse.json(result, { status: 403, headers });
  }

  return NextResponse.json(result, { headers });
}
