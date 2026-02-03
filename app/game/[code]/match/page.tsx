"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Timer, Zap, RotateCcw, BookOpen, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { getRandomCards } from "@/lib/utils/gameLogic";
import { getFirstDefinition } from "@/lib/utils/definitionParser";
import confetti from "canvas-confetti";
import { shuffleArray } from "@/lib/utils/vocabularyShuffle";
import { markMatchComplete, getProgress, arePrerequisitesComplete } from "@/lib/utils/gameProgress";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type MatchPair = {
  id: string;
  term: string;
  definition: string;
  matched: boolean;
};

type WordProgress = {
  unseenWords: string[]; // IDs of words not yet shown
  correctWords: string[]; // IDs of words matched correctly on first try
  incorrectWords: string[]; // IDs of words that had at least one wrong match
};

function DraggableCard({ id, content, disabled }: { id: string; content: string; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: disabled ? 0 : 1, scale: disabled ? 0 : 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className={`${isDragging ? 'opacity-50' : ''} ${disabled ? 'pointer-events-none' : ''}`}
    >
      <Card
        className={`
          cursor-grab active:cursor-grabbing transition-all duration-300
          ${isDragging ? 'shadow-2xl scale-105' : 'hover:scale-105'}
          bg-blue-500/10 border-blue-500/50
        `}
      >
        <CardContent className="p-1.5 min-h-[48px] flex flex-col items-center justify-center">
          <Badge className="mb-0 text-[9px] bg-blue-500 hover:bg-blue-600 text-white px-1 py-0">
            Term
          </Badge>
          <p className="text-center font-medium text-[10px] leading-[1.2]">{content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DroppableCard({
  id,
  content,
  isOver,
  disabled,
}: {
  id: string;
  content: string;
  isOver: boolean;
  disabled: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: disabled ? 0 : 1, scale: disabled ? 0 : 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className={disabled ? 'pointer-events-none' : ''}
    >
      <Card
        className={`
          transition-all duration-300
          ${isOver ? 'border-green-500 bg-green-500/20 scale-105 shadow-lg' : 'border-purple-500/50 bg-purple-500/10'}
          ${disabled ? 'opacity-0' : ''}
        `}
      >
        <CardContent className="p-1.5 min-h-[48px] flex flex-col items-center justify-center">
          <Badge className="mb-0 text-[9px] bg-purple-500 hover:bg-purple-600 text-white px-1 py-0">
            Definition
          </Badge>
          <p className="text-center font-medium text-[10px] leading-[1.2]">{content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();

  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [allWordsCompleted, setAllWordsCompleted] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [progressInitialized, setProgressInitialized] = useState(false);
  const [hasCompletedAnyRound, setHasCompletedAnyRound] = useState(false);
  const [requirePrerequisiteGames, setRequirePrerequisiteGames] = useState(false);
  const [prerequisitesComplete, setPrerequisitesComplete] = useState(false);

  // Track which words have been attempted incorrectly in current round
  const [currentRoundErrors, setCurrentRoundErrors] = useState<Set<string>>(new Set());

  // Word progress tracking
  const [wordProgress, setWordProgress] = useState<WordProgress>({
    unseenWords: [],
    correctWords: [],
    incorrectWords: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Initialize word progress from vocabulary
  useEffect(() => {
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0 && !progressInitialized) {
      // Try to load progress from localStorage
      const storageKey = `match-progress-${gameCode}`;
      const savedProgress = localStorage.getItem(storageKey);
      
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          // Validate that saved IDs still exist in vocabulary
          const validIds = new Set(vocabulary.map(v => v.id));
          const validatedProgress = {
            unseenWords: parsed.unseenWords.filter((id: string) => validIds.has(id)),
            correctWords: parsed.correctWords.filter((id: string) => validIds.has(id)),
            incorrectWords: parsed.incorrectWords.filter((id: string) => validIds.has(id)),
          };
          setWordProgress(validatedProgress);
          setProgressInitialized(true);
        } catch (e) {
          // If parsing fails, initialize fresh
          setWordProgress({
            unseenWords: vocabulary.map(v => v.id),
            correctWords: [],
            incorrectWords: [],
          });
          setProgressInitialized(true);
        }
      } else {
        // Initialize with all words as unseen
        setWordProgress({
          unseenWords: vocabulary.map(v => v.id),
          correctWords: [],
          incorrectWords: [],
        });
        setProgressInitialized(true);
      }
    }
  }, [vocabulary, gameCode, progressInitialized]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (wordProgress.unseenWords.length > 0 || wordProgress.correctWords.length > 0 || wordProgress.incorrectWords.length > 0) {
      const storageKey = `match-progress-${gameCode}`;
      localStorage.setItem(storageKey, JSON.stringify(wordProgress));
    }
  }, [wordProgress, gameCode]);

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
        const { getProgress, arePrerequisitesComplete } = await import('@/lib/utils/gameProgress');
        const complete = await arePrerequisitesComplete(gameCode);
        const progressData = await getProgress(gameCode);
        console.log('Match - Checking prerequisites:', {
          gameCode,
          complete,
          progressData,
          requirePrerequisiteGames
        });
        setPrerequisitesComplete(complete);
      };
      checkPrerequisites();
    }
  }, [gameCode, wordProgress, requirePrerequisiteGames]);

  // Initialize pairs based on current mode
  const initializeRound = () => {
    if (!vocabulary || vocabulary.length === 0) return;

    let wordsToUse: any[] = [];

    // Determine which words to show
    if (wordProgress.unseenWords.length > 0) {
      // Show unseen words
      setIsReviewMode(false);
      const unseenVocab = vocabulary.filter(v => wordProgress.unseenWords.includes(v.id));
      wordsToUse = shuffleArray(unseenVocab).slice(0, Math.min(10, unseenVocab.length));
    } else if (wordProgress.incorrectWords.length > 0) {
      // All words seen, now review incorrect ones
      setIsReviewMode(true);
      const incorrectVocab = vocabulary.filter(v => wordProgress.incorrectWords.includes(v.id));
      wordsToUse = shuffleArray(incorrectVocab).slice(0, Math.min(10, incorrectVocab.length));
    } else {
      // All words completed
      if (hasCompletedAnyRound) {
        // User has completed at least one round in this session, show completion
        // Mark Match game as complete for prerequisite tracking
        const trackCompletion = async () => {
          console.log('🎯 Match COMPLETED - Tracking progress...');
          await markMatchComplete(gameCode);
          
          // Wait for database to update
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const progressData = await getProgress(gameCode);
          const complete = await arePrerequisitesComplete(gameCode);
          console.log('📊 After markMatchComplete:', {
            progressData,
            complete,
            gameCode
          });
          
          // Update state with fresh data
          setPrerequisitesComplete(complete);
          
          // Show completion screen after state is updated
          setAllWordsCompleted(true);
          
          if (complete) {
            toast.success('All games unlocked! 🎉');
          } else {
            toast.success('Match completed! ✓');
          }
        };
        trackCompletion();
        return;
      } else {
        // Fresh page load with saved progress showing all complete - reset and start a new round
        const freshProgress = {
          unseenWords: vocabulary.map(v => v.id),
          correctWords: [],
          incorrectWords: [],
        };
        setWordProgress(freshProgress);
        setIsReviewMode(false);
        const allVocab = vocabulary;
        wordsToUse = shuffleArray(allVocab).slice(0, Math.min(10, allVocab.length));
      }
    }

    const matchPairs: MatchPair[] = wordsToUse.map((card) => ({
      id: card.id,
      term: card.term,
      definition: getFirstDefinition(card.definition),
      matched: false,
    }));

    setPairs(matchPairs);
    setCurrentRoundErrors(new Set());
  };

  // Initialize first round
  useEffect(() => {
    if (vocabulary && vocabulary.length > 0 && pairs.length === 0 && !allWordsCompleted && progressInitialized) {
      initializeRound();
    }
  }, [vocabulary, wordProgress, pairs.length, allWordsCompleted, progressInitialized]);

  // Shuffle definitions separately for display (but keep terms in order)
  const [shuffledDefinitions, setShuffledDefinitions] = useState<MatchPair[]>([]);
  
  useEffect(() => {
    if (pairs.length > 0) {
      setShuffledDefinitions(shuffleArray([...pairs]));
    }
  }, [pairs]);

  useEffect(() => {
    if (!isComplete && pairs.length > 0) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isComplete, pairs.length]);

  useEffect(() => {
    const matchedCount = pairs.filter((p) => p.matched).length;
    if (pairs.length > 0 && matchedCount === pairs.length && !isComplete) {
      setIsComplete(true);
      setHasCompletedAnyRound(true); // Mark that at least one round has been completed
      
      // Update word progress
      const newProgress = { ...wordProgress };
      
      pairs.forEach(pair => {
        // Remove from unseen
        newProgress.unseenWords = newProgress.unseenWords.filter(id => id !== pair.id);
        
        if (currentRoundErrors.has(pair.id)) {
          // Had errors, add to incorrect if not already there
          if (!newProgress.incorrectWords.includes(pair.id)) {
            newProgress.incorrectWords.push(pair.id);
          }
          // Remove from correct if it was there
          newProgress.correctWords = newProgress.correctWords.filter(id => id !== pair.id);
        } else {
          // No errors in this round
          if (isReviewMode) {
            // In review mode, move from incorrect to correct
            newProgress.incorrectWords = newProgress.incorrectWords.filter(id => id !== pair.id);
            if (!newProgress.correctWords.includes(pair.id)) {
              newProgress.correctWords.push(pair.id);
            }
          } else {
            // First time seeing, add to correct
            if (!newProgress.correctWords.includes(pair.id)) {
              newProgress.correctWords.push(pair.id);
            }
          }
        }
      });
      
      setWordProgress(newProgress);
      
      // Celebratory sound - ascending victory melody
      setTimeout(() => playSound(523, 150), 0);
      setTimeout(() => playSound(659, 150), 150);
      setTimeout(() => playSound(784, 150), 300);
      setTimeout(() => playSound(1047, 300), 450);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });

      // Check if there are more words to learn (don't auto-advance if all complete)
      const hasMoreWords = newProgress.unseenWords.length > 0 || newProgress.incorrectWords.length > 0;
      if (hasMoreWords) {
        // Start countdown for auto-advance
        setAutoAdvanceCountdown(3);
      } else {
        // All words completed! Track completion
        const trackCompletion = async () => {
          console.log('🎯 Match COMPLETED - Tracking progress...');
          await markMatchComplete(gameCode);
          
          // Wait for database to update
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const progressData = await getProgress(gameCode);
          const complete = await arePrerequisitesComplete(gameCode);
          console.log('📊 After markMatchComplete:', {
            progressData,
            complete,
            gameCode
          });
          
          // Update state with fresh data
          setPrerequisitesComplete(complete);
          
          // Show completion screen after state is updated
          setAllWordsCompleted(true);
          
          if (complete) {
            toast.success('All games unlocked! 🎉');
          } else {
            toast.success('Match completed! ✓');
          }
        };
        trackCompletion();
      }
    }
  }, [pairs, isComplete, currentRoundErrors, wordProgress, isReviewMode, gameCode]);

  // Auto-advance countdown timer
  useEffect(() => {
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoAdvanceCountdown(autoAdvanceCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoAdvanceCountdown === 0) {
      // Countdown finished, advance to next round
      handleNextRound();
      setAutoAdvanceCountdown(null);
    }
  }, [autoAdvanceCountdown]);

  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number = 100) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      // Silently fail if audio context not available
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const draggedTermId = active.id as string;
    const droppedDefId = over.id as string;

    // Check if it's a correct match
    if (draggedTermId === droppedDefId) {
      // Correct match!
      setPairs((prev) =>
        prev.map((pair) =>
          pair.id === draggedTermId ? { ...pair, matched: true } : pair
        )
      );
      setScore((prev) => prev + 100);

      // Success sound and confetti
      playSound(600, 150);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#34D399', '#60A5FA'],
      });
    } else {
      // Wrong match - track this error
      setCurrentRoundErrors(prev => new Set([...Array.from(prev), draggedTermId]));
      playSound(200, 100);
    }
  };

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextRound = () => {
    setIsComplete(false);
    setActiveId(null);
    setOverId(null);
    setPairs([]);
    initializeRound();
  };

  const handleResetProgress = () => {
    if (vocabulary && vocabulary.length > 0) {
      const storageKey = `match-progress-${gameCode}`;
      localStorage.removeItem(storageKey);
      setWordProgress({
        unseenWords: vocabulary.map(v => v.id),
        correctWords: [],
        incorrectWords: [],
      });
      setIsComplete(false);
      setScore(0);
      setTimeElapsed(0);
      setActiveId(null);
      setOverId(null);
      setPairs([]);
      setAllWordsCompleted(false);
      setIsReviewMode(false);
      setHasCompletedAnyRound(false);
    }
  };

  const matchedCount = pairs.filter((p) => p.matched).length;
  const progress = pairs.length > 0 ? (matchedCount / pairs.length) * 100 : 0;
  const activePair = pairs.find((p) => p.id === activeId);

  const totalWords = vocabulary?.length || 0;
  const wordsCompleted = wordProgress.correctWords.length + wordProgress.incorrectWords.length;
  const overallProgress = totalWords > 0 ? (wordsCompleted / totalWords) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          {requirePrerequisiteGames && !prerequisitesComplete ? (
            <Button variant="ghost" onClick={() => router.push(`/game/${gameCode}/flashcards`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Flashcards
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push(`/game/${gameCode}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetProgress}
              title="Reset all progress and start fresh"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Progress
            </Button>

            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-primary">{formatTime(timeElapsed)}</span>
            </div>

            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1.5">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="font-bold text-sm text-secondary">{score}</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="max-w-6xl mx-auto mb-2">
          <Card className={isReviewMode ? "bg-orange-500/10 border-orange-500/30" : "bg-primary/5 border-primary/20"}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Overall Progress</span>
                  {isReviewMode && (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      Review Mode
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {wordsCompleted} / {totalWords} words completed
                </span>
              </div>
              <Progress value={overallProgress} className="h-2 mb-2" />
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    {wordProgress.correctWords.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Mastered</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-orange-600 font-semibold">
                    <XCircle className="h-4 w-4" />
                    {wordProgress.incorrectWords.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Need Review</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold">
                    <BookOpen className="h-4 w-4" />
                    {wordProgress.unseenWords.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Round Progress */}
        {!allWordsCompleted && pairs.length > 0 && (
          <div className="max-w-6xl mx-auto mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Current Round: {matchedCount} of {pairs.length} pairs matched
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Instructions */}
        {!allWordsCompleted && pairs.length > 0 && (
          <div className="max-w-6xl mx-auto mb-2">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-2 pb-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Drag the <span className="text-blue-500 font-semibold">terms</span> from the top and drop them on their matching{' '}
                  <span className="text-purple-500 font-semibold">Danish translations</span> below
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Words Completed Message */}
        {allWordsCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-20 w-20 text-primary mx-auto mb-4" />
                <h2 className="text-4xl font-heading font-bold mb-2">🎉 Congratulations!</h2>
                <p className="text-xl text-muted-foreground mb-4">
                  You've mastered all {totalWords} words!
                </p>

                {/* All Games Unlocked Message */}
                {requirePrerequisiteGames && prerequisitesComplete && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <Card className="border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="h-6 w-6 text-green-600" />
                          <h3 className="text-2xl font-bold text-green-600">
                            All Games Unlocked!
                          </h3>
                          <Sparkles className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-muted-foreground">
                          You've completed both prerequisite games. You can now play any game in the lobby!
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{wordProgress.correctWords.length}</div>
                      <div className="text-muted-foreground">Words Mastered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                      <div className="text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleResetProgress} size="lg">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (requirePrerequisiteGames && !prerequisitesComplete) {
                        router.push(`/game/${gameCode}/flashcards`);
                      } else {
                        router.push(`/game/${gameCode}`);
                      }
                    }}
                  >
                    {requirePrerequisiteGames && !prerequisitesComplete ? "Go to Flashcards" : 
                     requirePrerequisiteGames && prerequisitesComplete ? "Explore All Games" : 
                     "Back to Lobby"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Game Area */}
        {!allWordsCompleted && pairs.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              {/* Terms (Draggable) */}
              <div className="mb-2">
                <h3 className="text-xs font-semibold mb-1.5 text-center text-blue-500">
                  Terms (Drag these)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                  <AnimatePresence>
                    {pairs.map((pair) => (
                      <DraggableCard
                        key={`term-${pair.id}`}
                        id={pair.id}
                        content={pair.term}
                        disabled={pair.matched}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Definitions (Droppable) - Shuffled separately */}
              <div>
                <h3 className="text-xs font-semibold mb-1.5 text-center text-purple-500">
                  Danish Translations (Drop here)
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                  <AnimatePresence>
                    {shuffledDefinitions.map((pair) => (
                      <DroppableCard
                        key={`def-${pair.id}`}
                        id={pair.id}
                        content={pair.definition}
                        isOver={overId === pair.id}
                        disabled={pair.matched}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeId && activePair ? (
                  <Card className="cursor-grabbing shadow-2xl bg-blue-500/20 border-blue-500">
                    <CardContent className="p-4 min-h-[100px] flex flex-col items-center justify-center">
                      <Badge className="mb-2 text-xs bg-blue-500 text-white">Term</Badge>
                      <p className="text-center font-medium text-sm">{activePair.term}</p>
                    </CardContent>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Round Completion Message */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
                  <CardContent className="pt-6 text-center">
                    <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-heading font-bold mb-2">Round Complete!</h2>
                    <p className="text-muted-foreground mb-4">
                      You completed this round in {formatTime(timeElapsed)}
                    </p>
                    {wordProgress.unseenWords.length === 0 && wordProgress.incorrectWords.length === 0 ? (
                      <p className="text-lg font-semibold text-green-600 mb-4">
                        🎉 All words mastered! Great job!
                      </p>
                    ) : wordProgress.unseenWords.length === 0 && wordProgress.incorrectWords.length > 0 ? (
                      <p className="text-lg font-semibold text-orange-600 mb-4">
                        📚 You've seen all words! Now reviewing {wordProgress.incorrectWords.length} words that need practice.
                      </p>
                    ) : (
                      <p className="text-lg font-semibold text-blue-600 mb-4">
                        📖 {wordProgress.unseenWords.length} words remaining to learn
                      </p>
                    )}
                    {autoAdvanceCountdown !== null && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Next round starting in {autoAdvanceCountdown}...
                      </p>
                    )}
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => {
                          setAutoAdvanceCountdown(null);
                          handleNextRound();
                        }} 
                        size="lg"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {autoAdvanceCountdown !== null ? 'Start Now' : 'Next Round'}
                      </Button>
                      {requirePrerequisiteGames && !prerequisitesComplete ? (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => router.push(`/game/${gameCode}/flashcards`)}
                        >
                          Go to Flashcards
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => router.push(`/game/${gameCode}`)}
                        >
                          Back to Lobby
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
