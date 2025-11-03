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
  updates: { name?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase
      .from('vocabulary_lists')
      .update(updates)
      .eq('id', listId);

    if (error) throw error;

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

// Game Links

export async function createGameLink(
  name: string,
  code: string,
  listId: string,
  enabledGames: GameMode[],
  crosswordWordCount?: number
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
