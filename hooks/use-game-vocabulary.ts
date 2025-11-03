import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";
import { getGameLinkByCode } from "@/lib/supabase/vocabularyManagement";
import { VocabCard } from "@/types/game";

/**
 * Custom hook to get vocabulary for a game.
 * First checks game store, then fetches from Supabase if needed.
 * This ensures games work even when accessed directly via URL.
 */
export function useGameVocabulary(): {
  vocabulary: VocabCard[] | null;
  loading: boolean;
  error: string | null;
} {
  const params = useParams();
  const code = params.code as string;
  const { session, setSession } = useGameStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have vocabulary in the store for this code, use it
    if (session?.code === code && session?.cards && session.cards.length > 0) {
      return;
    }

    // Otherwise, fetch from Supabase
    async function loadGameData() {
      if (!code) {
        setError('No game code provided');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const link = await getGameLinkByCode(code);
        
        if (!link) {
          setError('Game not found. Please check the code and try again.');
          return;
        }

        if (!link.isActive) {
          setError('This game is no longer active.');
          return;
        }

        if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
          setError('This game has expired.');
          return;
        }

        if (!link.vocabularyList || !link.vocabularyList.cards || link.vocabularyList.cards.length === 0) {
          setError('No vocabulary found for this game.');
          return;
        }

        // Store the vocabulary in the game store
        const gameSession: any = {
          id: `session-${code}`,
          code: code,
          name: link.name,
          mode: 'flashcards',
          status: 'waiting',
          cards: link.vocabularyList.cards,
          vocabularyList: link.vocabularyList,
          settings: {
            cardCount: link.vocabularyList.cards.length,
            crosswordWordCount: (link as any).crosswordWordCount || 10,
            allowHints: true,
            playMusic: true,
            playSFX: true,
          },
        };
        
        setSession(gameSession);
      } catch (err) {
        console.error('Error loading game data:', err);
        setError('Failed to load game. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadGameData();
  }, [code, session?.code, setSession]);

  // Return the vocabulary from the session if available
  const vocabulary = session?.code === code && session?.cards && session.cards.length > 0
    ? session.cards
    : null;

  return { vocabulary, loading, error };
}
