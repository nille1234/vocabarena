"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX, Trophy, Users } from "lucide-react";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { GameAccessGuard } from "@/components/game/GameAccessGuard";
import { ConnectFourBoard } from "@/components/game/connect-four/ConnectFourBoard";
import { ConnectFourPlayerCard } from "@/components/game/connect-four/ConnectFourPlayerCard";
import { ConnectFourPrompt } from "@/components/game/connect-four/ConnectFourPrompt";
import {
  createEmptyBoard,
  dropDisc,
  checkGameStatus,
  getValidColumns,
  Board,
} from "@/lib/utils/connectFourHelpers";
import { VocabCard } from "@/types/game";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

type GamePhase = 'answering' | 'placing' | 'game-over';
type GameResult = 'player1-wins' | 'player2-wins' | 'draw' | null;

export default function ConnectFourPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  const { playKnown, playMiss, playVictory, isMuted, toggleMute } = useSoundEffects();

  // Game state
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gamePhase, setGamePhase] = useState<GamePhase>('answering');
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Player stats
  const [player1Discs, setPlayer1Discs] = useState(0);
  const [player2Discs, setPlayer2Discs] = useState(0);

  // Vocabulary management
  const [shuffledVocab, setShuffledVocab] = useState<VocabCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);

  // Get answer mode from game link
  const [answerMode, setAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');

  // Fetch game mode setting from teacher
  useEffect(() => {
    async function fetchGameMode() {
      const { checkGameAccessClient } = await import('@/lib/supabase/gameAccess.client');
      const result = await checkGameAccessClient(gameCode);
      const mode = result.gameLink?.connectFourAnswerMode || 'text-input';
      setAnswerMode(mode);
    }
    fetchGameMode();
  }, [gameCode]);

  // Shuffle vocabulary on load
  useEffect(() => {
    if (vocabulary && vocabulary.length > 0) {
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
      setShuffledVocab(shuffled);
    }
  }, [vocabulary]);

  // Generate multiple choice options when needed
  useEffect(() => {
    if (answerMode === 'multiple-choice' && shuffledVocab.length > 0 && currentCardIndex < shuffledVocab.length) {
      const currentCard = shuffledVocab[currentCardIndex];
      const correctAnswer = currentCard.definition;
      
      // Get 3 random wrong answers
      const wrongAnswers = shuffledVocab
        .filter(card => card.id !== currentCard.id)
        .map(card => card.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Combine and shuffle
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setMultipleChoiceOptions(options);
    }
  }, [answerMode, shuffledVocab, currentCardIndex]);

  const currentCard = shuffledVocab[currentCardIndex];
  const validColumns = useMemo(() => getValidColumns(board), [board]);

  // Redirect if no vocabulary
  useEffect(() => {
    if (!loading && !vocabulary) {
      router.push('/');
    }
  }, [vocabulary, loading, router]);

  const checkAnswer = (answer: string): boolean => {
    if (!currentCard) return false;
    
    const normalizedAnswer = answer.toLowerCase().trim();
    const correctAnswers = [
      currentCard.definition.toLowerCase().trim(),
      ...(currentCard.germanTerm ? [currentCard.germanTerm.toLowerCase().trim()] : []),
      ...(currentCard.synonyms || []).map(s => s.toLowerCase().trim()),
    ];
    
    return correctAnswers.includes(normalizedAnswer);
  };

  const handleAnswerSubmit = (answer: string) => {
    const isCorrect = checkAnswer(answer);
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      playKnown();
      setGamePhase('placing');
    } else {
      playMiss();
      // Wrong answer - skip turn after showing feedback
      setTimeout(() => {
        setFeedback(null);
        switchPlayer();
        nextCard();
      }, 2000);
    }
  };

  const handleColumnClick = (col: number) => {
    if (gamePhase !== 'placing') return;
    
    const result = dropDisc(board, col, currentPlayer);
    if (!result) return;
    
    setBoard(result.board);
    
    // Update disc count
    if (currentPlayer === 1) {
      setPlayer1Discs(prev => prev + 1);
    } else {
      setPlayer2Discs(prev => prev + 1);
    }
    
    // Check game status
    const status = checkGameStatus(result.board, result.row, col);
    
    if (status !== 'ongoing') {
      setGameResult(status);
      setGamePhase('game-over');
      
      if (status === 'player1-wins' || status === 'player2-wins') {
        playVictory();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: status === 'player1-wins' 
            ? ['#EF4444', '#DC2626', '#B91C1C']
            : ['#EAB308', '#CA8A04', '#A16207'],
        });
      }
    } else {
      // Continue game
      setFeedback(null);
      switchPlayer();
      nextCard();
    }
  };

  const switchPlayer = () => {
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    setGamePhase('answering');
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => (prev + 1) % shuffledVocab.length);
  };

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setGamePhase('answering');
    setGameResult(null);
    setFeedback(null);
    setPlayer1Discs(0);
    setPlayer2Discs(0);
    setCurrentCardIndex(0);
    
    // Re-shuffle vocabulary
    const shuffled = [...vocabulary!].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
  };

  const handleBackToLobby = () => {
    router.push(`/game/${gameCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !vocabulary || !currentCard) {
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
    <GameAccessGuard gameCode={gameCode} gameMode="connect-four">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handleBackToLobby}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">2 Players</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          </div>

          {/* Game Over Screen */}
          {gamePhase === 'game-over' && gameResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-2 border-primary">
                <CardContent className="pt-6 text-center space-y-6">
                  <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
                  
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {gameResult === 'player1-wins' && 'Player 1 Wins!'}
                      {gameResult === 'player2-wins' && 'Player 2 Wins!'}
                      {gameResult === 'draw' && "It's a Draw!"}
                    </h2>
                    <p className="text-muted-foreground">
                      {gameResult === 'draw' 
                        ? 'The board is full with no winner'
                        : 'Four in a row achieved!'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Player 1</p>
                      <p className="text-2xl font-bold">{player1Discs}</p>
                      <p className="text-xs text-muted-foreground">discs placed</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Player 2</p>
                      <p className="text-2xl font-bold">{player2Discs}</p>
                      <p className="text-xs text-muted-foreground">discs placed</p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleRestart} size="lg">
                      New Game
                    </Button>
                    <Button onClick={handleBackToLobby} variant="outline" size="lg">
                      Back to Lobby
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Active Game */}
          {gamePhase !== 'game-over' && (
            <div className="max-w-6xl mx-auto space-y-2">
              {/* Player Cards - More Compact */}
              <div className="grid grid-cols-2 gap-2">
                <ConnectFourPlayerCard
                  player={1}
                  isActive={currentPlayer === 1}
                  discsPlaced={player1Discs}
                />
                <ConnectFourPlayerCard
                  player={2}
                  isActive={currentPlayer === 2}
                  discsPlaced={player2Discs}
                />
              </div>

              {/* Translation Prompt */}
              <div className="flex justify-center">
                <ConnectFourPrompt
                  currentCard={currentCard}
                  answerMode={answerMode}
                  multipleChoiceOptions={multipleChoiceOptions}
                  onSubmit={handleAnswerSubmit}
                  feedback={feedback}
                  disabled={gamePhase === 'placing'}
                />
              </div>

              {/* Game Board */}
              <div className="flex justify-center">
                <ConnectFourBoard
                  board={board}
                  onColumnClick={handleColumnClick}
                  validColumns={validColumns}
                  disabled={gamePhase !== 'placing'}
                />
              </div>

              {/* Instructions */}
              {gamePhase === 'placing' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-xs text-muted-foreground">
                    Click a column to drop your disc ↑
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </GameAccessGuard>
  );
}
