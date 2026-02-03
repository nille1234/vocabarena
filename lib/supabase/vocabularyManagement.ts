import { createClient } from './client';
import { createAnonymousClient } from './anonymousClient';
import { VocabularyList, VocabCard, GameLink, GameMode } from '@/types/game';

// Vocabulary Lists

export async function createVocabularyList(
  name: string,
  cards: VocabCard[],
  description?: string,
  language?: 'english' | 'german'
): Promise<{ success: boolean; listId?: string; error?: string }> {
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

    // Check if a vocabulary list with the same name already exists for this user
    const { data: existingList, error: checkError } = await supabase
      .from('vocabulary_lists')
      .select('id, name')
      .eq('name', name)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingList) {
      // List with same name exists, return the existing list ID
      return { 
        success: true, 
        listId: existingList.id,
      };
    }

    // Create the vocabulary list
    const { data: listData, error: listError } = await supabase
      .from('vocabulary_lists')
      .insert({
        name,
        description,
        language,
        user_id: user.id,
      })
      .select()
      .single();

    if (listError) throw listError;

    // Insert all vocabulary cards
    const cardsToInsert = cards.map((card) => ({
      list_id: listData.id,
      term: card.term,
      definition: card.definition,
      german_term: card.germanTerm,
      order_index: card.orderIndex,
    }));

    const { error: cardsError } = await supabase
      .from('vocabulary_cards')
      .insert(cardsToInsert);

    if (cardsError) throw cardsError;

    return { success: true, listId: listData.id };
  } catch (error) {
    console.error('Error creating vocabulary list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAllVocabularyLists(): Promise<VocabularyList[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data: lists, error: listsError } = await supabase
      .from('vocabulary_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (listsError) throw listsError;
    if (!lists) return [];

    // Fetch cards for each list
    const listsWithCards = await Promise.all(
      lists.map(async (list: any): Promise<VocabularyList | null> => {
        const { data: cards, error: cardsError } = await supabase
          .from('vocabulary_cards')
          .select('*')
          .eq('list_id', list.id)
          .order('order_index', { ascending: true });

        if (cardsError) {
          console.error('Error fetching cards:', cardsError);
          return null;
        }

        return {
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
          })),
          createdAt: new Date(list.created_at),
          updatedAt: new Date(list.updated_at),
        } as VocabularyList;
      })
    );

    return listsWithCards.filter((list): list is VocabularyList => list !== null);
  } catch (error) {
    console.error('Error fetching vocabulary lists:', error);
    return [];
  }
}

export async function getVocabularyListById(listId: string): Promise<VocabularyList | null> {
  const supabase = createClient();
  if (!supabase) return null;

  try {
    const { data: list, error: listError } = await supabase
      .from('vocabulary_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (listError) throw listError;
    if (!list) return null;

    const { data: cards, error: cardsError } = await supabase
      .from('vocabulary_cards')
      .select('*')
      .eq('list_id', listId)
      .order('order_index', { ascending: true });

    if (cardsError) throw cardsError;

    return {
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
    };
  } catch (error) {
    console.error('Error fetching vocabulary list:', error);
    return null;
  }
}

export async function updateVocabularyList(
  listId: string,
  updates: { name?: string; description?: string; cards?: VocabCard[] }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Update list metadata if provided
    if (updates.name !== undefined || updates.description !== undefined) {
      const metadataUpdates: any = {};
      if (updates.name !== undefined) metadataUpdates.name = updates.name;
      if (updates.description !== undefined) metadataUpdates.description = updates.description;

      const { error } = await supabase
        .from('vocabulary_lists')
        .update(metadataUpdates)
        .eq('id', listId);

      if (error) throw error;
    }

    // Update cards if provided
    if (updates.cards !== undefined) {
      // Delete all existing cards for this list
      const { error: deleteError } = await supabase
        .from('vocabulary_cards')
        .delete()
        .eq('list_id', listId);

      if (deleteError) throw deleteError;

      // Insert new cards
      const cardsToInsert = updates.cards.map((card) => ({
        list_id: listId,
        term: card.term,
        definition: card.definition,
        german_term: card.germanTerm,
        order_index: card.orderIndex,
        jeopardy_category: card.jeopardyCategory,
      }));

      const { error: insertError } = await supabase
        .from('vocabulary_cards')
        .insert(cardsToInsert);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating vocabulary list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteVocabularyList(listId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Check if there are any active game links using this list
    const { data: links, error: linksError } = await supabase
      .from('game_links')
      .select('id')
      .eq('list_id', listId)
      .eq('is_active', true);

    if (linksError) throw linksError;

    if (links && links.length > 0) {
      return {
        success: false,
        error: 'Cannot delete vocabulary list with active game links. Please deactivate or delete the game links first.',
      };
    }

    // Delete the list (cards will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('vocabulary_lists')
      .delete()
      .eq('id', listId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting vocabulary list:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Vocabulary Card Management

export async function addVocabularyCard(
  listId: string,
  card: {
    term: string;
    definition: string;
    germanTerm?: string;
  }
): Promise<{ success: boolean; cardId?: string; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Get the current max order_index for this list
    const { data: maxCard, error: maxError } = await supabase
      .from('vocabulary_cards')
      .select('order_index')
      .eq('list_id', listId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxError) throw maxError;

    const nextOrderIndex = maxCard ? maxCard.order_index + 1 : 0;

    // Insert the new card
    const { data, error } = await supabase
      .from('vocabulary_cards')
      .insert({
        list_id: listId,
        term: card.term,
        definition: card.definition,
        german_term: card.germanTerm,
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, cardId: data.id };
  } catch (error) {
    console.error('Error adding vocabulary card:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateVocabularyCard(
  cardId: string,
  updates: {
    term?: string;
    definition?: string;
    germanTerm?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const updateData: any = {};
    if (updates.term !== undefined) updateData.term = updates.term;
    if (updates.definition !== undefined) updateData.definition = updates.definition;
    if (updates.germanTerm !== undefined) updateData.german_term = updates.germanTerm;

    const { error } = await supabase
      .from('vocabulary_cards')
      .update(updateData)
      .eq('id', cardId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating vocabulary card:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteVocabularyCard(
  cardId: string,
  listId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Check if deleting this card would leave less than 20 words
    const { data: cards, error: countError } = await supabase
      .from('vocabulary_cards')
      .select('id')
      .eq('list_id', listId);

    if (countError) throw countError;

    if (cards && cards.length <= 20) {
      return {
        success: false,
        error: 'Cannot delete card. Vocabulary lists must have at least 20 words.',
      };
    }

    // Delete the card
    const { error } = await supabase
      .from('vocabulary_cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;

    // Reorder remaining cards
    await reorderVocabularyCards(listId);

    return { success: true };
  } catch (error) {
    console.error('Error deleting vocabulary card:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function reorderVocabularyCards(listId: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  try {
    // Get all cards for this list ordered by current order_index
    const { data: cards, error: fetchError } = await supabase
      .from('vocabulary_cards')
      .select('id')
      .eq('list_id', listId)
      .order('order_index', { ascending: true });

    if (fetchError) throw fetchError;
    if (!cards) return;

    // Update each card with its new order_index
    for (let i = 0; i < cards.length; i++) {
      await supabase
        .from('vocabulary_cards')
        .update({ order_index: i })
        .eq('id', cards[i].id);
    }
  } catch (error) {
    console.error('Error reordering vocabulary cards:', error);
  }
}

// Game Links

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
  blokusAnswerMode?: 'text-input' | 'multiple-choice',
  blokusTimeLimit?: number | null,
  allowWordListDownload?: boolean
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
        blokus_answer_mode: blokusAnswerMode || 'text-input',
        blokus_time_limit: blokusTimeLimit,
        gap_fill_gap_count: gapFillGapCount,
        gap_fill_summary_length: gapFillSummaryLength,
        require_prerequisite_games: requirePrerequisiteGames || false,
        allow_word_list_download: allowWordListDownload || false,
        is_active: true,
        user_id: user.id,
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
      blokusAnswerMode: link.blokus_answer_mode,
      blokusTimeLimit: link.blokus_time_limit,
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
      blokusAnswerMode: link.blokus_answer_mode,
      blokusTimeLimit: link.blokus_time_limit,
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
    blokusAnswerMode?: 'text-input' | 'multiple-choice';
    blokusTimeLimit?: number | null;
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
    if (updates.blokusAnswerMode !== undefined) updateData.blokus_answer_mode = updates.blokusAnswerMode;
    if (updates.blokusTimeLimit !== undefined) updateData.blokus_time_limit = updates.blokusTimeLimit;
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
