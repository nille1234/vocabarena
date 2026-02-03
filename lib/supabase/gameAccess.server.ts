import { createClient } from '@/lib/supabase/server';
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
 * Validates if a specific game mode is allowed for a given game code
 * This is the server-side validation that prevents unauthorized access
 * 
 * NOTE: This function uses next/headers and can only be used in Server Components or API routes
 */
export async function validateGameAccess(
  code: string,
  requestedGameMode?: GameMode
): Promise<GameAccessResult> {
  const supabase = await createClient();

  // Fetch the game link with its enabled games and answer modes
  const { data: gameLink, error } = await supabase
    .from('game_links')
    .select('id, code, name, is_active, enabled_games, othello_answer_mode, tic_tac_toe_answer_mode, connect_four_answer_mode, jeopardy_answer_mode, jeopardy_time_limit, blokus_answer_mode, blokus_time_limit, gap_fill_gap_count, gap_fill_summary_length')
    .eq('code', code)
    .single();

  if (error || !gameLink) {
    return {
      allowed: false,
      enabledGames: [],
      error: 'Game link not found',
    };
  }

  if (!gameLink.is_active) {
    return {
      allowed: false,
      enabledGames: [],
      gameLink: {
        id: gameLink.id,
        code: gameLink.code,
        name: gameLink.name,
        isActive: gameLink.is_active,
        othelloAnswerMode: gameLink.othello_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        ticTacToeAnswerMode: gameLink.tic_tac_toe_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        connectFourAnswerMode: gameLink.connect_four_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        jeopardyAnswerMode: gameLink.jeopardy_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        jeopardyTimeLimit: gameLink.jeopardy_time_limit,
        blokusAnswerMode: gameLink.blokus_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        blokusTimeLimit: gameLink.blokus_time_limit,
        gapFillGapCount: gameLink.gap_fill_gap_count,
        gapFillSummaryLength: gameLink.gap_fill_summary_length,
      },
      error: 'Game link is not active',
    };
  }

  const enabledGames = (gameLink.enabled_games || []) as GameMode[];

  // If no specific game mode is requested, just return the enabled games
  if (!requestedGameMode) {
    return {
      allowed: true,
      enabledGames,
      gameLink: {
        id: gameLink.id,
        code: gameLink.code,
        name: gameLink.name,
        isActive: gameLink.is_active,
        othelloAnswerMode: gameLink.othello_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        ticTacToeAnswerMode: gameLink.tic_tac_toe_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        connectFourAnswerMode: gameLink.connect_four_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        jeopardyAnswerMode: gameLink.jeopardy_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        jeopardyTimeLimit: gameLink.jeopardy_time_limit,
        blokusAnswerMode: gameLink.blokus_answer_mode as 'text-input' | 'multiple-choice' | undefined,
        blokusTimeLimit: gameLink.blokus_time_limit,
        gapFillGapCount: gameLink.gap_fill_gap_count,
        gapFillSummaryLength: gameLink.gap_fill_summary_length,
      },
    };
  }

  // Check if the requested game mode is in the enabled games list
  const isAllowed = enabledGames.includes(requestedGameMode);

  return {
    allowed: isAllowed,
    enabledGames,
    gameLink: {
      id: gameLink.id,
      code: gameLink.code,
      name: gameLink.name,
      isActive: gameLink.is_active,
      othelloAnswerMode: gameLink.othello_answer_mode as 'text-input' | 'multiple-choice' | undefined,
      ticTacToeAnswerMode: gameLink.tic_tac_toe_answer_mode as 'text-input' | 'multiple-choice' | undefined,
      connectFourAnswerMode: gameLink.connect_four_answer_mode as 'text-input' | 'multiple-choice' | undefined,
      jeopardyAnswerMode: gameLink.jeopardy_answer_mode as 'text-input' | 'multiple-choice' | undefined,
      jeopardyTimeLimit: gameLink.jeopardy_time_limit,
      blokusAnswerMode: gameLink.blokus_answer_mode as 'text-input' | 'multiple-choice' | undefined,
      blokusTimeLimit: gameLink.blokus_time_limit,
      gapFillGapCount: gameLink.gap_fill_gap_count,
      gapFillSummaryLength: gameLink.gap_fill_summary_length,
    },
    error: isAllowed ? undefined : 'This game mode is not enabled for this session',
  };
}
