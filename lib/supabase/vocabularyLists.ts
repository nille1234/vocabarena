import { createClient } from './client';
import { VocabularyList, VocabCard } from '@/types/game';

export async function createVocabularyList(
  name: string,
  cards: VocabCard[],
  description?: string,
  language?: 'english' | 'german'
): Promise<{ success: boolean; listId?: string; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    console.error('[createVocabularyList] Supabase client not initialized');
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('[createVocabularyList] User authentication failed:', userError);
      return { success: false, error: 'User not authenticated' };
    }

    console.log('[createVocabularyList] Creating list for user:', user.id);

    // Check user role to determine duplicate check scope
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[createVocabularyList] Error fetching user profile:', profileError);
      throw profileError;
    }

    const isSuperAdmin = profile?.role === 'super_admin';

    // Check if a vocabulary list with the same name already exists
    // For superadmins, check across all lists; for regular users, check only their own
    let existingListQuery = supabase
      .from('vocabulary_lists')
      .select('id, name')
      .eq('name', name);

    if (!isSuperAdmin) {
      existingListQuery = existingListQuery.eq('user_id', user.id);
    }

    const { data: existingList, error: checkError } = await existingListQuery.maybeSingle();

    if (checkError) {
      console.error('[createVocabularyList] Error checking existing list:', checkError);
      throw checkError;
    }

    if (existingList) {
      // List with same name exists, return the existing list ID
      console.log('[createVocabularyList] List already exists:', existingList.id);
      return { 
        success: true, 
        listId: existingList.id,
      };
    }

    // Create the vocabulary list
    console.log('[createVocabularyList] Inserting new list with data:', {
      name,
      description,
      language,
      user_id: user.id,
    });

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

    if (listError) {
      console.error('[createVocabularyList] Error creating list:', {
        error: listError,
        message: listError.message,
        details: listError.details,
        hint: listError.hint,
        code: listError.code,
      });
      throw listError;
    }

    console.log('[createVocabularyList] List created successfully:', listData.id);

    // Insert all vocabulary cards
    const cardsToInsert = cards.map((card) => ({
      list_id: listData.id,
      term: card.term,
      definition: card.definition,
      german_term: card.germanTerm,
      order_index: card.orderIndex,
    }));

    console.log('[createVocabularyList] Inserting', cardsToInsert.length, 'cards');

    const { error: cardsError } = await supabase
      .from('vocabulary_cards')
      .insert(cardsToInsert);

    if (cardsError) {
      console.error('[createVocabularyList] Error inserting cards:', {
        error: cardsError,
        message: cardsError.message,
        details: cardsError.details,
        hint: cardsError.hint,
        code: cardsError.code,
      });
      throw cardsError;
    }

    console.log('[createVocabularyList] Cards inserted successfully');
    return { success: true, listId: listData.id };
  } catch (error) {
    console.error('[createVocabularyList] Caught error:', error);
    if (error && typeof error === 'object') {
      console.error('[createVocabularyList] Error details:', {
        message: (error as any).message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
    }
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
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated:', userError);
      return [];
    }

    // Check user role to determine list visibility scope
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw profileError;
    }

    const isSuperAdmin = profile?.role === 'super_admin';

    // Build query - superadmins see all lists, regular users see only their own
    let listsQuery = supabase
      .from('vocabulary_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isSuperAdmin) {
      listsQuery = listsQuery.eq('user_id', user.id);
    }

    const { data: lists, error: listsError } = await listsQuery;

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
          difficultyLevel: list.difficulty_level,
          classId: list.class_id,
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
      difficultyLevel: list.difficulty_level,
      classId: list.class_id,
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
  updates: { 
    name?: string; 
    description?: string; 
    cards?: VocabCard[];
    classId?: string | null;
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Update list metadata if provided
    if (updates.name !== undefined || updates.description !== undefined || 
        updates.classId !== undefined || updates.difficultyLevel !== undefined) {
      const metadataUpdates: any = {};
      if (updates.name !== undefined) metadataUpdates.name = updates.name;
      if (updates.description !== undefined) metadataUpdates.description = updates.description;
      if (updates.classId !== undefined) metadataUpdates.class_id = updates.classId;
      if (updates.difficultyLevel !== undefined) metadataUpdates.difficulty_level = updates.difficultyLevel;

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

export async function getVocabularyListWords(listId: string): Promise<string[]> {
  const supabase = createClient();
  if (!supabase) return [];

  try {
    const { data: cards, error } = await supabase
      .from('vocabulary_cards')
      .select('term')
      .eq('list_id', listId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    if (!cards) return [];

    return cards.map((card: any) => card.term);
  } catch (error) {
    console.error('Error fetching vocabulary list words:', error);
    return [];
  }
}
