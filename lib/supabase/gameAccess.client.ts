import { GameMode } from '@/types/game';

export interface GameAccessResult {
  allowed: boolean;
  enabledGames: GameMode[];
  gameLink?: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    othelloAnswerMode?: 'text-input' | 'multiple-choice';
    ticTacToeAnswerMode?: 'text-input' | 'multiple-choice';
    connectFourAnswerMode?: 'text-input' | 'multiple-choice';
    jeopardyAnswerMode?: 'text-input' | 'multiple-choice';
    jeopardyTimeLimit?: number;
    blokusAnswerMode?: 'text-input' | 'multiple-choice';
    blokusTimeLimit?: number;
    gapFillGapCount?: number;
    gapFillSummaryLength?: number;
  };
  error?: string;
}

/**
 * Client-side helper to check game access (uses API route)
 */
export async function checkGameAccessClient(
  code: string,
  gameMode?: GameMode
): Promise<GameAccessResult> {
  try {
    const params = new URLSearchParams({ code });
    if (gameMode) {
      params.append('gameMode', gameMode);
    }
    // Add timestamp to prevent caching
    params.append('_t', Date.now().toString());

    const response = await fetch(`/api/game-access?${params.toString()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      return {
        allowed: false,
        enabledGames: [],
        error: 'Failed to validate game access',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking game access:', error);
    return {
      allowed: false,
      enabledGames: [],
      error: 'Failed to validate game access',
    };
  }
}
