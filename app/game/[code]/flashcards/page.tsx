"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shuffle, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { FlashCard } from "@/components/game/flashcards/FlashCard";
import { FlashCardControls } from "@/components/game/flashcards/FlashCardControls";
import { FlashCardProgress } from "@/components/game/flashcards/FlashCardProgress";
import { FlashCardStats } from "@/components/game/flashcards/FlashCardStats";
import {
  initializeProgress,
  getNextCard,
  markCardAsKnown,
  markCardForReview,
  loadProgress,
  saveProgress,
  resetProgress,
  shuffleCards,
  FlashCardProgress as ProgressType,
} from "@/lib/utils/flashcardHelpers";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { incrementFlashcardsCount, getProgress, arePrerequisitesComplete } from "@/lib/utils/gameProgress";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function FlashCardsPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  const { playFlip, playKnown, playReview, playVictory, isMuted, toggleMute } = useSoundEffects();

  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [cardCount, setCardCount] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [requirePrerequisiteGames, setRequirePrerequisiteGames] = useState(false);
  const [prerequisitesComplete, setPrerequisitesComplete] = useState(false);
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);

  // Redirect to home if no vocabulary
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  // Initialize or load progress
  useEffect(() => {
    if (vocabulary && vocabulary.length > 0 && !progress) {
      const savedProgress = loadProgress(gameCode);
      
      if (savedProgress) {
        // Validate saved progress against current vocabulary
        const validIds = new Set(vocabulary.map(v => v.id));
        const isValid = 
          savedProgress.unseenWords.every(id => validIds.has(id)) &&
          savedProgress.knownWords.every(id => validIds.has(id)) &&
          savedProgress.reviewWords.every(id => validIds.has(id));
        
        if (isValid) {
          setProgress(savedProgress);
        } else {
          // Invalid saved progress, start fresh
          const newProgress = initializeProgress(vocabulary);
          setProgress(newProgress);
          saveProgress(gameCode, newProgress);
        }
      } else {
        // No saved progress, initialize new
        const newProgress = initializeProgress(vocabulary);
        setProgress(newProgress);
        saveProgress(gameCode, newProgress);
      }
    }
  }, [vocabulary, gameCode, progress]);

  // Get next card when progress changes
  useEffect(() => {
    if (vocabulary && progress && !currentCard && !isComplete) {
      const nextCard = getNextCard(vocabulary, progress);
      if (nextCard) {
        setCurrentCard(nextCard);
        setIsFlipped(false);
        setCardCount(prev => prev + 1);
      } else {
        // Check if we actually completed cards in this session
        // Only show completion if cardCount > 0 (meaning we actually went through cards)
        if (cardCount > 0) {
          // All cards mastered!
          playVictory();
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#06B6D4', '#A855F7', '#22C55E'],
          });
          
          // Track completion for prerequisite games
          // Track completion for prerequisite games
          const trackCompletion = async () => {
            console.log('🎯 Flashcards COMPLETED - Tracking progress...');
            await incrementFlashcardsCount(gameCode);
            
            // Wait a brief moment for the database to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const progressData = await getProgress(gameCode);
            const complete = await arePrerequisitesComplete(gameCode);
            console.log('📊 After incrementFlashcardsCount:', {
              progressData,
              complete,
              gameCode
            });
            
            // Update all state with the fresh data
            setPrerequisitesComplete(complete);
            setMatchCompleted(progressData.matchCompleted);
            setFlashcardsCompleted(true); // Always true since we just completed
            
            // Show completion screen after state is updated
            setIsComplete(true);
            
            if (complete) {
              toast.success(`All games unlocked! 🎉`);
            } else {
              toast.success(`Flashcards completed! ✓`);
            }
          };
          
          trackCompletion();
        } else {
          // No cards were shown but progress shows complete
          // This means we loaded stale/completed progress
          // Reset and start fresh
          console.log('Resetting stale flashcard progress');
          resetProgress(gameCode);
          const newProgress = initializeProgress(vocabulary);
          setProgress(newProgress);
          saveProgress(gameCode, newProgress);
        }
      }
    }
  }, [vocabulary, progress, currentCard, playVictory, isComplete, cardCount, gameCode]);

  // Timer
  useEffect(() => {
    if (!isComplete && progress) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isComplete, progress]);

  // Save progress whenever it changes
  useEffect(() => {
    if (progress) {
      saveProgress(gameCode, progress);
    }
  }, [progress, gameCode]);

  // Fetch prerequisite setting and check progress
  useEffect(() => {
    async function fetchPrerequisiteStatus() {
      const supabase = createClient();
      const { data: gameLink } = await supabase
        .from('game_links')
        .select('require_prerequisite_games')
        .eq('code', gameCode)
        .single();
      
      if (gameLink) {
        setRequirePrerequisiteGames(gameLink.require_prerequisite_games || false);
      }
    }
    
    fetchPrerequisiteStatus();
  }, [gameCode]);

  // Check if prerequisites are complete
  useEffect(() => {
    if (gameCode) {
      const checkPrerequisites = async () => {
        const complete = await arePrerequisitesComplete(gameCode);
        const progressData = await getProgress(gameCode);
        console.log('Flashcards - Checking prerequisites:', {
          gameCode,
          complete,
          progressData,
          requirePrerequisiteGames
        });
        setPrerequisitesComplete(complete);
        setMatchCompleted(progressData.matchCompleted);
        setFlashcardsCompleted(progressData.flashcardsCompleted);
      };
      checkPrerequisites();
    }
  }, [gameCode, progress, requirePrerequisiteGames]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playFlip();
  };

  const handleKnown = () => {
    if (!currentCard || !progress) return;

    playKnown();
    const newProgress = markCardAsKnown(currentCard.id, progress);
    setProgress(newProgress);
    setCurrentCard(null);

    // Small confetti for success
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#22C55E', '#06B6D4'],
    });
  };

  const handleReview = () => {
    if (!currentCard || !progress) return;

    playReview();
    const newProgress = markCardForReview(currentCard.id, progress);
    setProgress(newProgress);
    setCurrentCard(null);
  };

  const handleShuffle = () => {
    if (!vocabulary || !progress) return;

    // Shuffle the unseen words
    const shuffledUnseen = shuffleCards(progress.unseenWords);
    const newProgress = {
      ...progress,
      unseenWords: shuffledUnseen,
    };
    setProgress(newProgress);
    setIsShuffled(true);
    
    // Reset current card to get a new one
    setCurrentCard(null);

    setTimeout(() => setIsShuffled(false), 2000);
  };

  const handleRestart = () => {
    if (!vocabulary) return;

    resetProgress(gameCode);
    const newProgress = initializeProgress(vocabulary);
    setProgress(newProgress);
    setCurrentCard(null);
    setIsFlipped(false);
    setTimeElapsed(0);
    setIsComplete(false);
    setCardCount(0);
  };

  const handleBackToLobby = () => {
    router.push(`/game/${gameCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !vocabulary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Failed to load vocabulary"}</p>
            <Button onClick={handleBackToLobby} className="mt-4">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {requirePrerequisiteGames && !prerequisitesComplete ? (
            <Button variant="ghost" onClick={() => router.push(`/game/${gameCode}/match`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Match
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleBackToLobby}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            {!isComplete && progress && progress.unseenWords.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShuffle}
                disabled={isShuffled}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                {isShuffled ? "Shuffled!" : "Shuffle"}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              title="Reset all progress and start over"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        {progress && !isComplete && (
          <div className="mb-4">
            <FlashCardProgress
              progress={progress}
              totalCards={vocabulary.length}
              currentCardIndex={cardCount}
              timeElapsed={timeElapsed}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {isComplete ? (
            <FlashCardStats
              totalCards={vocabulary.length}
              timeElapsed={timeElapsed}
              onRestart={handleRestart}
              onBackToLobby={handleBackToLobby}
              requirePrerequisiteGames={requirePrerequisiteGames}
              prerequisitesComplete={prerequisitesComplete}
              matchCompleted={matchCompleted}
              flashcardsCompleted={flashcardsCompleted}
              onGoToMatch={() => router.push(`/game/${gameCode}/match`)}
            />
          ) : (
            <AnimatePresence mode="wait">
              {currentCard && (
                <motion.div
                  key={currentCard.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Flash Card */}
                  <FlashCard
                    card={currentCard}
                    onFlip={handleFlip}
                    isFlipped={isFlipped}
                  />

                  {/* Controls - Only show when card is flipped */}
                  {isFlipped && (
                    <FlashCardControls
                      onKnown={handleKnown}
                      onReview={handleReview}
                      disabled={false}
                    />
                  )}

                  {/* Instruction when not flipped */}
                  {!isFlipped && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <p className="text-sm text-muted-foreground">
                        Click the card to see the definition
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
