'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useGameVocabulary } from '@/hooks/use-game-vocabulary';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { GameAccessGuard } from '@/components/game/GameAccessGuard';
import { JeopardyBoard } from '@/components/game/jeopardy/JeopardyBoard';
import { JeopardyQuestionModal } from '@/components/game/jeopardy/JeopardyQuestionModal';
import { JeopardyResultModal } from '@/components/game/jeopardy/JeopardyResultModal';
import { JeopardyPlayerSetup } from '@/components/game/jeopardy/JeopardyPlayerSetup';
import { JeopardyPlayerScores } from '@/components/game/jeopardy/JeopardyPlayerScores';
import { GameEndScreen } from '@/components/game/GameEndScreen';
import {
  createJeopardyBoard,
  checkJeopardyAnswer,
  calculateJeopardyScore,
  JeopardyQuestion,
} from '@/lib/utils/jeopardyHelpers';
import confetti from 'canvas-confetti';

export default function JeopardyPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  const { playKnown, playMiss, playVictory, isMuted, toggleMute } = useSoundEffects();

  // Game state
  const [categorizedVocabulary, setCategorizedVocabulary] = useState<typeof vocabulary>(null);
  const [categorizingAI, setCategorizingAI] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<{ name: string; score: number }[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [board, setBoard] = useState<{ categories: string[]; questions: JeopardyQuestion[][] } | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<JeopardyQuestion | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
    userAnswer: string;
    pointsEarned: number;
  } | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Settings
  const [answerMode, setAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [timeLimit, setTimeLimit] = useState(30); // seconds per question

  // Fetch game settings
  useEffect(() => {
    async function fetchGameSettings() {
      const { checkGameAccessClient } = await import('@/lib/supabase/gameAccess.client');
      const result = await checkGameAccessClient(gameCode);
      const mode = result.gameLink?.jeopardyAnswerMode || 'text-input';
      const limit = result.gameLink?.jeopardyTimeLimit || 30;
      setAnswerMode(mode);
      setTimeLimit(limit);
    }
    fetchGameSettings();
  }, [gameCode]);

  // AI Categorization effect
  useEffect(() => {
    async function categorizeVocabulary() {
      if (!vocabulary || vocabulary.length < 25) return;
      
      // Check if vocabulary already has categories
      const hasCategories = vocabulary.some(card => card.jeopardyCategory);
      
      if (hasCategories) {
        console.log('Using existing categories from vocabulary');
        setCategorizedVocabulary(vocabulary);
        return;
      }

      // Call AI to generate categories
      setCategorizingAI(true);
      try {
        console.log('Generating AI categories for', vocabulary.length, 'words...');
        
        const response = await fetch('/api/categorize-vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            words: vocabulary.map(card => ({
              term: card.term,
              definition: card.definition,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to categorize vocabulary');
        }

        const { assignments } = await response.json() as { assignments: Record<string, string> };
        
        // Apply categories to vocabulary
        const categorized = vocabulary.map(card => ({
          ...card,
          jeopardyCategory: assignments[card.term] || undefined,
        }));

        console.log('AI categorization complete!');
        console.log('Categories assigned:', Object.keys(
          categorized.reduce((acc, card) => {
            if (card.jeopardyCategory) acc[card.jeopardyCategory] = true;
            return acc;
          }, {} as Record<string, boolean>)
        ));
        
        setCategorizedVocabulary(categorized);
      } catch (error) {
        console.error('AI categorization failed, using fallback:', error);
        // Fall back to using vocabulary without categories (will use automatic categories)
        setCategorizedVocabulary(vocabulary);
      } finally {
        setCategorizingAI(false);
      }
    }

    categorizeVocabulary();
  }, [vocabulary]);

  // Initialize board
  useEffect(() => {
    if (categorizedVocabulary && categorizedVocabulary.length >= 25 && !board) {
      // Debug: Log vocabulary cards with categories
      console.log('=== JEOPARDY DEBUG ===');
      console.log('Total vocabulary cards:', categorizedVocabulary.length);
      console.log('Cards with jeopardyCategory:', categorizedVocabulary.filter(c => c.jeopardyCategory).length);
      console.log('Sample cards:', categorizedVocabulary.slice(0, 5).map(c => ({
        term: c.term,
        jeopardyCategory: c.jeopardyCategory
      })));
      
      const jeopardyBoard = createJeopardyBoard(categorizedVocabulary);
      console.log('Generated categories:', jeopardyBoard.categories.map(c => c.name));
      console.log('=== END DEBUG ===');
      
      setBoard({
        categories: jeopardyBoard.categories.map(c => c.name),
        questions: jeopardyBoard.questions,
      });
    }
  }, [categorizedVocabulary, board]);

  // Redirect if no vocabulary
  useEffect(() => {
    if (!loading && !vocabulary) {
      router.push('/');
    }
  }, [vocabulary, loading, router]);

  const handleQuestionSelect = (categoryIndex: number, questionIndex: number) => {
    if (!board) return;
    
    const question = board.questions[categoryIndex][questionIndex];
    if (question && !question.answered) {
      setSelectedQuestion(question);
    }
  };

  const handlePlayerSetup = (playerNames: string[], selectedTimeLimit: number) => {
    setPlayers(playerNames.map(name => ({ name, score: 0 })));
    setTimeLimit(selectedTimeLimit);
    setGameStarted(true);
  };

  const handleAnswer = (answer: string, timeTaken: number) => {
    if (!selectedQuestion || !board) return;

    // Check answer against definition (Danish translation) and synonyms
    const isCorrect = checkJeopardyAnswer(
      answer, 
      selectedQuestion.card.definition,
      selectedQuestion.card.synonyms
    );
    const pointsEarned = isCorrect 
      ? calculateJeopardyScore(selectedQuestion.value, timeTaken / 1000, timeLimit)
      : 0;

    // Play sound
    if (isCorrect) {
      playKnown();
    } else {
      playMiss();
    }

    // Update score and stats
    setQuestionsAnswered(prev => prev + 1);
    if (isCorrect) {
      // Update current player's score
      setPlayers(prev => prev.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: player.score + pointsEarned }
          : player
      ));
    }

    // Mark question as answered
    const updatedQuestions = board.questions.map((category, catIdx) =>
      category.map((q, qIdx) => {
        if (catIdx === board.questions.findIndex(cat => cat.includes(selectedQuestion)) &&
            qIdx === category.indexOf(selectedQuestion)) {
          return { ...q, answered: true };
        }
        return q;
      })
    );

    setBoard({ ...board, questions: updatedQuestions });

    // Show result
    setLastResult({
      isCorrect,
      correctAnswer: selectedQuestion.card.definition,
      userAnswer: answer,
      pointsEarned,
    });
    setShowResult(true);
    setSelectedQuestion(null);

    // Check if game is complete
    const allAnswered = updatedQuestions.every(category =>
      category.every(q => q.answered)
    );
    
    if (allAnswered) {
      setTimeout(() => {
        setIsGameComplete(true);
        playVictory();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#EAB308', '#F59E0B', '#D97706'],
        });
      }, 2500);
    } else if (!isCorrect) {
      // If incorrect, switch to next player after showing result
      // (will happen in handleContinue)
    }
  };

  const handleCloseQuestion = () => {
    setSelectedQuestion(null);
  };

  const handleContinue = () => {
    setShowResult(false);
    
    // Always switch to next player after each question
    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    
    setLastResult(null);
  };

  const handleRestart = () => {
    if (!categorizedVocabulary) return;
    
    const jeopardyBoard = createJeopardyBoard(categorizedVocabulary);
    setBoard({
      categories: jeopardyBoard.categories.map(c => c.name),
      questions: jeopardyBoard.questions,
    });
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setCurrentPlayerIndex(0);
    setQuestionsAnswered(0);
    setIsGameComplete(false);
    setSelectedQuestion(null);
    setShowResult(false);
    setLastResult(null);
  };

  const handleBackToLobby = () => {
    router.push(`/game/${gameCode}`);
  };

  if (loading || categorizingAI) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground">
              {loading ? 'Loading game...' : 'Generating AI categories...'}
            </p>
            {categorizingAI && (
              <p className="text-sm text-muted-foreground">
                This may take a few seconds
              </p>
            )}
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
            <p className="text-destructive">{error || 'Failed to load vocabulary'}</p>
            <Button onClick={handleBackToLobby} className="mt-4">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vocabulary.length < 25) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Not Enough Words</h1>
            <p className="text-muted-foreground mb-4">
              Jeopardy requires at least 25 vocabulary words to create a full board.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Current word count: {vocabulary.length}
            </p>
            <Button onClick={handleBackToLobby}>
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Initializing game board...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show player setup if game hasn't started
  if (!gameStarted) {
    return (
      <GameAccessGuard gameCode={gameCode} gameMode="jeopardy">
        <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-background">
          <JeopardyPlayerSetup onStart={handlePlayerSetup} />
        </div>
      </GameAccessGuard>
    );
  }

  return (
    <GameAccessGuard gameCode={gameCode} gameMode="jeopardy">
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-background">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBackToLobby} className="text-white hover:text-white/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lobby
            </Button>

            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
              💰 Jeopardy
            </h1>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Game
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Game Complete Screen */}
          {isGameComplete && (
            <GameEndScreen
              title="Game Complete!"
              score={Math.max(...players.map(p => p.score))}
              message={`Winner: ${players.reduce((a, b) => a.score > b.score ? a : b).name} with $${players.reduce((a, b) => a.score > b.score ? a : b).score.toLocaleString()}!`}
              onPlayAgain={handleRestart}
              onBackToMenu={handleBackToLobby}
            />
          )}

          {/* Active Game */}
          {!isGameComplete && (
            <div className="space-y-4">
              {/* Player Scores */}
              <JeopardyPlayerScores
                players={players}
                currentPlayerIndex={currentPlayerIndex}
              />

              {/* Game Board */}
              <JeopardyBoard
                categories={board.categories}
                questions={board.questions}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          )}

              {/* Question Modal */}
          {selectedQuestion && categorizedVocabulary && (
            <JeopardyQuestionModal
              question={selectedQuestion}
              allDefinitions={categorizedVocabulary.map(v => v.definition)}
              answerMode={answerMode}
              timeLimit={timeLimit}
              onAnswer={handleAnswer}
              onClose={handleCloseQuestion}
            />
          )}

          {/* Result Modal */}
          {showResult && lastResult && (
            <JeopardyResultModal
              isCorrect={lastResult.isCorrect}
              correctAnswer={lastResult.correctAnswer}
              userAnswer={lastResult.userAnswer}
              pointsEarned={lastResult.pointsEarned}
              currentPlayerName={players[currentPlayerIndex]?.name}
              onContinue={handleContinue}
            />
          )}
        </div>
      </div>
    </GameAccessGuard>
  );
}
