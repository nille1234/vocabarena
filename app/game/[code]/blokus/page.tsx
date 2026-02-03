"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, VolumeX, Trophy } from "lucide-react";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { GameAccessGuard } from "@/components/game/GameAccessGuard";
import { BlokusBoard } from "@/components/game/blokus/BlokusBoard";
import { BlokusPieceSelector } from "@/components/game/blokus/BlokusPieceSelector";
import { BlokusScoreCard } from "@/components/game/blokus/BlokusScoreCard";
import { BlokusPrompt } from "@/components/game/blokus/BlokusPrompt";
import { BlokusRulesBar } from "@/components/game/blokus/BlokusRulesBar";
import {
  createInitialGameState,
  getPieceById,
  rotatePiece,
  flipPiece,
  isValidPlacement,
  placePiece,
  checkGameOver,
  calculateScore,
  PieceShape,
  GameState,
} from "@/lib/utils/blokusHelpers";
import { VocabCard } from "@/types/game";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

type GamePhase = 'answering' | 'placing' | 'game-over';

export default function BlokusPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  const { playKnown, playMiss, playVictory, isMuted, toggleMute } = useSoundEffects();

  // Game state
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [gamePhase, setGamePhase] = useState<GamePhase>('answering');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
  // Piece selection
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [currentPiece, setCurrentPiece] = useState<PieceShape | null>(null);

  // Vocabulary management
  const [shuffledVocab, setShuffledVocab] = useState<VocabCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);

  // Game settings
  const [answerMode, setAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Fetch game settings
  useEffect(() => {
    async function fetchGameSettings() {
      const { checkGameAccessClient } = await import('@/lib/supabase/gameAccess.client');
      const result = await checkGameAccessClient(gameCode);
      const mode = result.gameLink?.blokusAnswerMode || 'text-input';
      const limit = result.gameLink?.blokusTimeLimit || null;
      setAnswerMode(mode);
      setTimeLimit(limit);
    }
    fetchGameSettings();
  }, [gameCode]);

  // Shuffle vocabulary on load
  useEffect(() => {
    if (vocabulary && vocabulary.length > 0) {
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
      setShuffledVocab(shuffled);
    }
  }, [vocabulary]);

  // Generate multiple choice options
  useEffect(() => {
    if (answerMode === 'multiple-choice' && shuffledVocab.length > 0 && currentCardIndex < shuffledVocab.length) {
      const currentCard = shuffledVocab[currentCardIndex];
      const correctAnswer = currentCard.definition;
      
      const wrongAnswers = shuffledVocab
        .filter(card => card.id !== currentCard.id)
        .map(card => card.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      setMultipleChoiceOptions(options);
    }
  }, [answerMode, shuffledVocab, currentCardIndex]);

  const currentCard = shuffledVocab[currentCardIndex];

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
      setTimeout(() => {
        setFeedback(null);
        switchPlayer();
        nextCard();
      }, 2000);
    }
  };

  const handleTimeUp = () => {
    setFeedback('incorrect');
    playMiss();
    setTimeout(() => {
      setFeedback(null);
      switchPlayer();
      nextCard();
    }, 2000);
  };

  const handlePieceSelect = (pieceId: string) => {
    setSelectedPieceId(pieceId);
    const piece = getPieceById(pieceId);
    setCurrentPiece(piece || null);
  };

  const handleRotate = () => {
    if (currentPiece) {
      setCurrentPiece(rotatePiece(currentPiece));
    }
  };

  const handleFlip = () => {
    if (currentPiece) {
      setCurrentPiece(flipPiece(currentPiece));
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (gamePhase !== 'placing' || !currentPiece || !selectedPieceId) return;

    const isFirstMove = gameState.currentPlayer === 1 
      ? gameState.firstMove.player1 
      : gameState.firstMove.player2;

    if (!isValidPlacement(gameState.board, currentPiece, { row, col }, gameState.currentPlayer, isFirstMove)) {
      return;
    }

    // Place the piece
    const newBoard = placePiece(gameState.board, currentPiece, { row, col }, gameState.currentPlayer);
    
    // Update player pieces
    const newGameState = { ...gameState };
    newGameState.board = newBoard;
    
    if (gameState.currentPlayer === 1) {
      newGameState.player1Pieces = {
        available: newGameState.player1Pieces.available.filter(id => id !== selectedPieceId),
        used: [...newGameState.player1Pieces.used, selectedPieceId],
      };
      newGameState.firstMove.player1 = false;
    } else {
      newGameState.player2Pieces = {
        available: newGameState.player2Pieces.available.filter(id => id !== selectedPieceId),
        used: [...newGameState.player2Pieces.used, selectedPieceId],
      };
      newGameState.firstMove.player2 = false;
    }

    setGameState(newGameState);
    setSelectedPieceId(null);
    setCurrentPiece(null);

    // Check game over
    const gameOverResult = checkGameOver(newGameState);
    if (gameOverResult.isOver) {
      setGamePhase('game-over');
      playVictory();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    } else {
      setFeedback(null);
      switchPlayer();
      nextCard();
    }
  };

  const switchPlayer = () => {
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
    }));
    setGamePhase('answering');
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => (prev + 1) % shuffledVocab.length);
  };

  const handleRestart = () => {
    setGameState(createInitialGameState());
    setGamePhase('answering');
    setFeedback(null);
    setSelectedPieceId(null);
    setCurrentPiece(null);
    setCurrentCardIndex(0);
    
    const shuffled = [...vocabulary!].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
  };

  const handleBackToLobby = () => {
    router.push(`/game/${gameCode}`);
  };

  const currentPlayerPieces = gameState.currentPlayer === 1 
    ? gameState.player1Pieces 
    : gameState.player2Pieces;

  const player1Score = calculateScore(gameState.player1Pieces);
  const player2Score = calculateScore(gameState.player2Pieces);

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

  const gameOverResult = checkGameOver(gameState);

  return (
    <GameAccessGuard gameCode={gameCode} gameMode="blokus">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={handleBackToLobby}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h1 className="text-lg font-bold">Blokus</h1>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </Button>
          </div>

          {/* Rules Bar */}
          <div className="mb-2">
            <BlokusRulesBar />
          </div>

          {/* Game Over Screen */}
          {gamePhase === 'game-over' && gameOverResult.isOver && (
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
                      {gameOverResult.winner === 1 && 'Player 1 Wins!'}
                      {gameOverResult.winner === 2 && 'Player 2 Wins!'}
                      {gameOverResult.winner === 'draw' && "It's a Draw!"}
                    </h2>
                    <p className="text-muted-foreground">
                      {gameOverResult.winner === 'draw' 
                        ? 'Both players have the same number of squares remaining'
                        : 'Fewest squares remaining!'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-blue-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Player 1</p>
                      <p className="text-2xl font-bold">{player1Score}</p>
                      <p className="text-xs text-muted-foreground">squares left</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Player 2</p>
                      <p className="text-2xl font-bold">{player2Score}</p>
                      <p className="text-xs text-muted-foreground">squares left</p>
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
            <div className="max-w-7xl mx-auto space-y-2">
              {/* Player Cards */}
              <div className="grid grid-cols-2 gap-2">
                <BlokusScoreCard
                  player={1}
                  isActive={gameState.currentPlayer === 1}
                  pieces={gameState.player1Pieces}
                  remainingSquares={player1Score}
                />
                <BlokusScoreCard
                  player={2}
                  isActive={gameState.currentPlayer === 2}
                  pieces={gameState.player2Pieces}
                  remainingSquares={player2Score}
                />
              </div>

              {/* Vocabulary Prompt */}
              {gamePhase === 'answering' && (
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <BlokusPrompt
                      currentCard={currentCard}
                      answerMode={answerMode}
                      multipleChoiceOptions={multipleChoiceOptions}
                      onSubmit={handleAnswerSubmit}
                      feedback={feedback}
                      disabled={false}
                      timeLimit={timeLimit}
                      onTimeUp={handleTimeUp}
                    />
                  </div>
                </div>
              )}

              {/* Game Board and Piece Selector */}
              {gamePhase === 'placing' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 flex justify-center">
                    <BlokusBoard
                      board={gameState.board}
                      selectedPiece={currentPiece}
                      currentPlayer={gameState.currentPlayer}
                      isFirstMove={
                        gameState.currentPlayer === 1
                          ? gameState.firstMove.player1
                          : gameState.firstMove.player2
                      }
                      onCellClick={handleCellClick}
                      disabled={false}
                    />
                  </div>
                  
                  <div>
                    <BlokusPieceSelector
                      availablePieces={currentPlayerPieces.available}
                      selectedPieceId={selectedPieceId}
                      onSelectPiece={handlePieceSelect}
                      currentPiece={currentPiece}
                      onRotate={handleRotate}
                      onFlip={handleFlip}
                      player={gameState.currentPlayer}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GameAccessGuard>
  );
}
