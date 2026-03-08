import { createClient } from '@/lib/supabase/client';
import { Class } from '@/types/game';

/**
 * Get all classes for the current teacher
 */
export async function getAllClasses(): Promise<Class[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    description: row.description,
    gradeLevel: row.grade_level,
    subject: row.subject,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
}

/**
 * Get a single class by ID
 */
export async function getClassById(classId: string): Promise<Class | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (error) {
    console.error('Error fetching class:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    teacherId: data.teacher_id,
    name: data.name,
    description: data.description,
    gradeLevel: data.grade_level,
    subject: data.subject,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

/**
 * Create a new class
 */
export async function createClass(classData: {
  name: string;
  description?: string;
  gradeLevel?: string;
  subject?: string;
}): Promise<Class> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('classes')
    .insert({
      teacher_id: user.id,
      name: classData.name,
      description: classData.description,
      grade_level: classData.gradeLevel,
      subject: classData.subject
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating class:', error);
    throw error;
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    name: data.name,
    description: data.description,
    gradeLevel: data.grade_level,
    subject: data.subject,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

/**
 * Update an existing class
 */
export async function updateClass(
  classId: string,
  updates: {
    name?: string;
    description?: string;
    gradeLevel?: string;
    subject?: string;
  }
): Promise<Class> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('classes')
    .update({
      name: updates.name,
      description: updates.description,
      grade_level: updates.gradeLevel,
      subject: updates.subject,
      updated_at: new Date().toISOString()
    })
    .eq('id', classId)
    .select()
    .single();

  if (error) {
    console.error('Error updating class:', error);
    throw error;
  }

  return {
    id: data.id,
    teacherId: data.teacher_id,
    name: data.name,
    description: data.description,
    gradeLevel: data.grade_level,
    subject: data.subject,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

/**
 * Delete a class
 */
export async function deleteClass(classId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId);

  if (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
}

/**
 * Get game links for a specific class
 */
export async function getGameLinksByClass(classId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('game_links')
    .select(`
      *,
      vocabulary_lists (
        id,
        name,
        description,
        language,
        difficulty_level,
        class_id
      )
    `)
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching class game links:', error);
    throw error;
  }

  // Map the data to include proper field names
  return (data || []).map((link: any) => ({
    id: link.id,
    code: link.code,
    name: link.name,
    listId: link.list_id,
    classId: link.class_id,
    enabledGames: link.enabled_games,
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
    isActive: link.is_active,
    createdAt: new Date(link.created_at),
    expiresAt: link.expires_at ? new Date(link.expires_at) : undefined,
    vocabularyList: link.vocabulary_lists ? {
      id: link.vocabulary_lists.id,
      name: link.vocabulary_lists.name,
      description: link.vocabulary_lists.description,
      language: link.vocabulary_lists.language,
      difficultyLevel: link.vocabulary_lists.difficulty_level,
      classId: link.vocabulary_lists.class_id,
      cards: [], // Cards not needed in list view
    } : undefined
  }));
}

/**
 * Get vocabulary lists for a specific class
 */
export async function getVocabularyListsByClass(classId: string) {
  const supabase = createClient();
  
  const { data: lists, error: listsError } = await supabase
    .from('vocabulary_lists')
    .select('*')
    .eq('class_id', classId)
    .order('name', { ascending: true });

  if (listsError) {
    console.error('Error fetching class vocabulary lists:', listsError);
    throw listsError;
  }

  if (!lists) return [];

  // Fetch cards for each list
  const listsWithCards = await Promise.all(
    lists.map(async (list: any) => {
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
          jeopardyCategory: card.jeopardy_category,
        })),
        createdAt: new Date(list.created_at),
        updatedAt: new Date(list.updated_at),
      };
    })
  );

  return listsWithCards.filter((list): list is NonNullable<typeof list> => list !== null);
}

/**
 * Get statistics for a class
 */
export async function getClassStats(classId: string) {
  const supabase = createClient();
  
  // Get game links count
  const { count: gameLinksCount } = await supabase
    .from('game_links')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);

  // Get vocabulary lists count
  const { count: vocabListsCount } = await supabase
    .from('vocabulary_lists')
    .select('*', { count: 'exact', head: true })
    .eq('class_id', classId);

  return {
    gameLinksCount: gameLinksCount || 0,
    vocabListsCount: vocabListsCount || 0
  };
}
