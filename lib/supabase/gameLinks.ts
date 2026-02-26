import { createClient } from './client';
import { createAnonymousClient } from './anonymousClient';
import { GameLink, GameMode, VocabularyList } from '@/types/game';

export async function createGameLink(
  name: string,
  code: string,
  listId: string,
  enabledGames: GameMode[],
  crosswordWordCount?: number,
  othelloAnswerMode?: 'text-input' | 'multiple-choice',
  ticTacToeAnswerMode?: 'text-input' | 'multiple-choice',
  connectFourAnswerMode?: 'text-input' | 'multiple-choice',
  wordSearchWordCount?: number,
  wordSearchShowList?: boolean,
  gapFillGapCount?: number,
  gapFillSummaryLength?: number,
  jeopardyAnswerMode?: 'text-input' | 'multiple-choice',
  jeopardyTimeLimit?: number,
  requirePrerequisiteGames?: boolean,
  allowWordListDownload?: boolean,
  classId?: string | null
): Promise<{ success: boolean; linkId?: string; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('game_links')
      .insert({
        code,
        name,
        list_id: listId,
        enabled_games: enabledGames,
        crossword_word_count: crosswordWordCount,
        word_search_word_count: wordSearchWordCount,
        word_search_show_list: wordSearchShowList !== undefined ? wordSearchShowList : true,
        othello_answer_mode: othelloAnswerMode || 'text-input',
        tic_tac_toe_answer_mode: ticTacToeAnswerMode || 'text-input',
        connect_four_answer_mode: connectFourAnswerMode || 'text-input',
        jeopardy_answer_mode: jeopardyAnswerMode || 'text-input',
        jeopardy_time_limit: jeopardyTimeLimit || 30,
        gap_fill_gap_count: gapFillGapCount,
        gap_fill_summary_length: gapFillSummaryLength,
        require_prerequisite_games: requirePrerequisiteGames || false,
        allow_word_list_download: allowWordListDownload || false,
        is_active: true,
        user_id: user.id,
        class_id: classId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, linkId: data.id };
  } catch (error) {
    console.error('Error creating game link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAllGameLinks(): Promise<GameLink[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    // Get current user to filter by user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return [];
    }

    const { data: links, error } = await supabase
      .from('game_links')
      .select(`
        *,
        vocabulary_lists (
          id,
          name,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!links) return [];

    return links.map((link: any) => ({
      id: link.id,
      code: link.code,
      name: link.name,
      listId: link.list_id,
      vocabularyList: link.vocabulary_lists ? {
        id: link.vocabulary_lists.id,
        name: link.vocabulary_lists.name,
        description: link.vocabulary_lists.description,
        cards: [], // Cards not needed in list view
        createdAt: new Date(link.vocabulary_lists.created_at),
        updatedAt: new Date(link.vocabulary_lists.updated_at),
      } : undefined,
      enabledGames: link.enabled_games as GameMode[],
      crosswordWordCount: link.crossword_word_count,
      wordSearchWordCount: link.word_search_word_count,
      wordSearchShowList: link.word_search_show_list,
      othelloAnswerMode: link.othello_answer_mode,
      ticTacToeAnswerMode: link.tic_tac_toe_answer_mode,
      connectFourAnswerMode: link.connect_four_answer_mode,
      gapFillGapCount: link.gap_fill_gap_count,
      gapFillSummaryLength: link.gap_fill_summary_length,
      allowWordListDownload: link.allow_word_list_download,
      createdAt: new Date(link.created_at),
      expiresAt: link.expires_at ? new Date(link.expires_at) : undefined,
      isActive: link.is_active,
    }));
  } catch (error) {
    console.error('Error fetching game links:', error);
    return [];
  }
}

export async function getGameLinkByCode(code: string): Promise<GameLink | null> {
  // Use anonymous client for public access (students don't need to be authenticated)
  const supabase = createAnonymousClient();
  if (!supabase) return null;

  try {
    const { data: link, error } = await supabase
      .from('game_links')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    if (!link) return null;

    // Fetch the vocabulary list with cards using anonymous client
    const { data: list, error: listError } = await supabase
      .from('vocabulary_lists')
      .select('*')
      .eq('id', link.list_id)
      .single();

    if (listError) throw listError;

    const { data: cards, error: cardsError } = await supabase
      .from('vocabulary_cards')
      .select('*')
      .eq('list_id', link.list_id)
      .order('order_index', { ascending: true });

    if (cardsError) throw cardsError;

    const vocabularyList: VocabularyList | undefined = list ? {
      id: list.id,
      name: list.name,
      description: list.description,
      language: list.language,
      cards: cards.map((card: any) => ({
        id: card.id,
        term: card.term,
        definition: card.definition,
        germanTerm: card.german_term,
        orderIndex: card.order_index,
        jeopardyCategory: card.jeopardy_category,
      })),
      createdAt: new Date(list.created_at),
      updatedAt: new Date(list.updated_at),
    } : undefined;

    return {
      id: link.id,
      code: link.code,
      name: link.name,
      listId: link.list_id,
      vocabularyList,
      enabledGames: link.enabled_games as GameMode[],
      crosswordWordCount: link.crossword_word_count,
      wordSearchWordCount: link.word_search_word_count,
      wordSearchShowList: link.word_search_show_list,
      othelloAnswerMode: link.othello_answer_mode,
      ticTacToeAnswerMode: link.tic_tac_toe_answer_mode,
      connectFourAnswerMode: link.connect_four_answer_mode,
      jeopardyAnswerMode: link.jeopardy_answer_mode,
      jeopardyTimeLimit: link.jeopardy_time_limit,
      gapFillGapCount: link.gap_fill_gap_count,
      gapFillSummaryLength: link.gap_fill_summary_length,
      requirePrerequisiteGames: link.require_prerequisite_games,
      allowWordListDownload: link.allow_word_list_download,
      createdAt: new Date(link.created_at),
      expiresAt: link.expires_at ? new Date(link.expires_at) : undefined,
      isActive: link.is_active,
    } as any;
  } catch (error) {
    console.error('Error fetching game link:', error);
    return null;
  }
}

export async function updateGameLink(
  linkId: string,
  updates: {
    name?: string;
    enabledGames?: GameMode[];
    isActive?: boolean;
    expiresAt?: Date | null;
    crosswordWordCount?: number;
    wordSearchWordCount?: number;
    wordSearchShowList?: boolean;
    othelloAnswerMode?: 'text-input' | 'multiple-choice';
    ticTacToeAnswerMode?: 'text-input' | 'multiple-choice';
    connectFourAnswerMode?: 'text-input' | 'multiple-choice';
    jeopardyAnswerMode?: 'text-input' | 'multiple-choice';
    jeopardyTimeLimit?: number;
    gapFillGapCount?: number;
    gapFillSummaryLength?: number;
    requirePrerequisiteGames?: boolean;
    allowWordListDownload?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.enabledGames !== undefined) updateData.enabled_games = updates.enabledGames;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
    if (updates.crosswordWordCount !== undefined) updateData.crossword_word_count = updates.crosswordWordCount;
    if (updates.wordSearchWordCount !== undefined) updateData.word_search_word_count = updates.wordSearchWordCount;
    if (updates.wordSearchShowList !== undefined) updateData.word_search_show_list = updates.wordSearchShowList;
    if (updates.othelloAnswerMode !== undefined) updateData.othello_answer_mode = updates.othelloAnswerMode;
    if (updates.ticTacToeAnswerMode !== undefined) updateData.tic_tac_toe_answer_mode = updates.ticTacToeAnswerMode;
    if (updates.connectFourAnswerMode !== undefined) updateData.connect_four_answer_mode = updates.connectFourAnswerMode;
    if (updates.jeopardyAnswerMode !== undefined) updateData.jeopardy_answer_mode = updates.jeopardyAnswerMode;
    if (updates.jeopardyTimeLimit !== undefined) updateData.jeopardy_time_limit = updates.jeopardyTimeLimit;
    if (updates.gapFillGapCount !== undefined) updateData.gap_fill_gap_count = updates.gapFillGapCount;
    if (updates.gapFillSummaryLength !== undefined) updateData.gap_fill_summary_length = updates.gapFillSummaryLength;
    if (updates.requirePrerequisiteGames !== undefined) updateData.require_prerequisite_games = updates.requirePrerequisiteGames;
    if (updates.allowWordListDownload !== undefined) updateData.allow_word_list_download = updates.allowWordListDownload;

    const { error } = await supabase
      .from('game_links')
      .update(updateData)
      .eq('id', linkId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating game link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteGameLink(linkId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('game_links')
      .delete()
      .eq('id', linkId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting game link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
