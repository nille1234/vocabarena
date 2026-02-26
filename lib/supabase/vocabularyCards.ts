import { createClient } from './client';

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
