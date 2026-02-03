/**
 * Game Progress Tracking Utility
 * Manages student progress for prerequisite games (Match and Flashcards)
 * Uses Supabase database for persistent, per-user, per-game-link tracking
 */

import { createClient } from '@/lib/supabase/client';

export interface GameProgress {
  matchCompleted: boolean;
  flashcardsCompleted: boolean;
  completedAt: string | null;
}

/**
 * Get the game link ID from a game code
 */
async function getGameLinkId(gameCode: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('game_links')
    .select('id')
    .eq('code', gameCode)
    .single();

  if (error || !data) {
    console.error('Error fetching game link ID:', error);
    return null;
  }

  return data.id;
}

/**
 * Get progress for a specific game code
 * Returns progress from database for the current user
 */
export async function getProgress(gameCode: string): Promise<GameProgress> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      matchCompleted: false,
      flashcardsCompleted: false,
      completedAt: null,
    };
  }

  // Get game link ID
  const gameLinkId = await getGameLinkId(gameCode);
  if (!gameLinkId) {
    return {
      matchCompleted: false,
      flashcardsCompleted: false,
      completedAt: null,
    };
  }

  // Fetch progress from database
  const { data, error } = await supabase
    .from('game_prerequisite_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('game_link_id', gameLinkId)
    .single();

  if (error || !data) {
    // No progress yet
    return {
      matchCompleted: false,
      flashcardsCompleted: false,
      completedAt: null,
    };
  }

  return {
    matchCompleted: data.match_completed,
    flashcardsCompleted: data.flashcards_completed,
    completedAt: data.completed_at,
  };
}

/**
 * Mark Match game as completed
 */
export async function markMatchComplete(gameCode: string): Promise<void> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  // Get game link ID
  const gameLinkId = await getGameLinkId(gameCode);
  if (!gameLinkId) {
    console.error('No game link found');
    return;
  }

  // Upsert progress
  const { error } = await supabase
    .from('game_prerequisite_progress')
    .upsert({
      user_id: user.id,
      game_link_id: gameLinkId,
      match_completed: true,
    }, {
      onConflict: 'user_id,game_link_id',
    });

  if (error) {
    console.error('Error marking match complete:', error);
  }
}

/**
 * Mark Flashcards game as completed
 */
export async function markFlashcardsComplete(gameCode: string): Promise<void> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  // Get game link ID
  const gameLinkId = await getGameLinkId(gameCode);
  if (!gameLinkId) {
    console.error('No game link found');
    return;
  }

  // Upsert progress
  const { error } = await supabase
    .from('game_prerequisite_progress')
    .upsert({
      user_id: user.id,
      game_link_id: gameLinkId,
      flashcards_completed: true,
    }, {
      onConflict: 'user_id,game_link_id',
    });

  if (error) {
    console.error('Error marking flashcards complete:', error);
  }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use markFlashcardsComplete instead
 */
export async function incrementFlashcardsCount(gameCode: string): Promise<number> {
  await markFlashcardsComplete(gameCode);
  return 1;
}

/**
 * Check if all prerequisite games are completed
 * Match: completed once
 * Flashcards: completed once
 */
export async function arePrerequisitesComplete(gameCode: string): Promise<boolean> {
  const progress = await getProgress(gameCode);
  return progress.matchCompleted && progress.flashcardsCompleted;
}

/**
 * Reset progress for a game code (useful for testing)
 */
export async function resetProgress(gameCode: string): Promise<void> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found');
    return;
  }

  // Get game link ID
  const gameLinkId = await getGameLinkId(gameCode);
  if (!gameLinkId) {
    console.error('No game link found');
    return;
  }

  // Delete progress
  const { error } = await supabase
    .from('game_prerequisite_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('game_link_id', gameLinkId);

  if (error) {
    console.error('Error resetting progress:', error);
  }
}
