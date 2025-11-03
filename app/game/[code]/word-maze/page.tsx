"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, MapPin } from "lucide-react";
import { generateMultipleChoice } from "@/lib/utils/questionGenerator";
import { getAudioManager } from "@/lib/utils/audioManager";
import { generateMazePath } from "@/lib/utils/questionGenerator";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import { VocabCard } from "@/types/game";
import confetti from "canvas-confetti";

type Question = {
  question: string;
  correctAnswer: string;
  options: string[];
};

export default function WordMazePage() {
  const router = useRouter();
  const params = useParams();
  const vocabulary = useGameVocabulary();

  const [mazeData] = useState(() => {
    const path = generateMazePath(10);
    console.log('Maze generated:', path);
    return path;
  });
  const [currentPosition, setCurrentPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);

  const audioManager = getAudioManager();

  // Check if current position is a checkpoint
  const isCheckpoint = mazeData.checkpoints.includes(currentPosition);
  const isAtEnd = currentPosition >= mazeData.path.length - 1;

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    const availableCards = (vocabulary || []).filter(
      (card: VocabCard) => !usedCards.has(card.id)
    );

    if (availableCards.length === 0) {
      setUsedCards(new Set());
      return generateNewQuestion();
    }

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    const questionType = Math.random() > 0.5 ? 'term-to-def' : 'def-to-term';
    const question = generateMultipleChoice(randomCard, vocabulary || [], questionType);

    setCurrentQuestion(question);
    setUsedCards(prev => new Set(Array.from(prev).concat(randomCard.id)));
    setFeedback(null);
  }, [usedCards, vocabulary]);

  // Show question at checkpoints or start
  useEffect(() => {
    if ((isCheckpoint || currentPosition === 0) && !isAtEnd && !showQuestion) {
      setShowQuestion(true);
      generateNewQuestion();
    }
  }, [currentPosition, isCheckpoint, isAtEnd, showQuestion, generateNewQuestion]);

  // Check if game is complete
  useEffect(() => {
    if (isAtEnd && !isGameOver) {
      setIsGameOver(true);
      if (!isMuted) audioManager.playCelebration();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isAtEnd, isGameOver, isMuted, audioManager]);

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion || feedback) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      setFeedback('correct');
      if (!isMuted) audioManager.playSuccess();
      
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#34D399'],
      });

      // Move forward after brief delay
      setTimeout(() => {
        setShowQuestion(false);
        setCurrentPosition(prev => prev + 1);
      }, 1000);
    } else {
      setFeedback('wrong');
      if (!isMuted) audioManager.playError();
      
      // Try again after delay
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    window.location.reload();
  };

  const accuracy = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;
  const progress = (currentPosition / (mazeData.path.length - 1)) * 100;

  if (isGameOver) {
    return (
      <GameEndScreen
        title="You Made It Through the Maze!"
        score={score}
        accuracy={accuracy}
        message="Congratulations! You navigated through all the checkpoints!"
        onPlayAgain={handlePlayAgain}
        onBackToMenu={() => router.push(`/game/${params.code}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/game/${params.code}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>

          <div className="flex items-center gap-4">
            <ScoreDisplay score={score} accuracy={accuracy} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMuted(!isMuted);
                audioManager.toggleMute();
              }}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">🧩 Word Maze</h1>
          <p className="text-muted-foreground">
            Navigate through the maze by answering questions at checkpoints
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Position {currentPosition + 1} / {mazeData.path.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Maze Visualization */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-8 gap-2">
                {mazeData.path.map((cell, index) => {
                  const isCurrentPos = index === currentPosition;
                  const isPassed = index < currentPosition;
                  const isCheckpointCell = mazeData.checkpoints.includes(index);
                  const isFinish = index === mazeData.path.length - 1;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`
                        aspect-square rounded-lg border-2 flex items-center justify-center text-lg font-bold
                        transition-all duration-300
                        ${isCurrentPos 
                          ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg' 
                          : isPassed
                          ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                          : isCheckpointCell
                          ? 'bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300'
                          : isFinish
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                          : 'bg-background border-border text-muted-foreground'
                        }
                      `}
                    >
                      {isFinish ? '🏆' : isCheckpointCell ? '🚪' : isCurrentPos ? '👤' : isPassed ? '✓' : index + 1}
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary border-2 border-primary" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500/20 border-2 border-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center">
                    🚪
                  </div>
                  <span>Checkpoint</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                    🏆
                  </div>
                  <span>Finish</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <div className="max-w-2xl mx-auto">
          {!showQuestion && currentPosition > 0 ? (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-8 pb-6 text-center">
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Moving Through the Maze...</h2>
                <p className="text-muted-foreground mb-6">
                  Next checkpoint in {mazeData.checkpoints.find(cp => cp > currentPosition) 
                    ? mazeData.checkpoints.find(cp => cp > currentPosition)! - currentPosition 
                    : mazeData.path.length - currentPosition} steps
                </p>
                <Button
                  onClick={() => {
                    setCurrentPosition(prev => prev + 1);
                  }}
                  size="lg"
                >
                  Continue Forward
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.question}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
                    <CardContent className="pt-8 pb-6">
                      {/* Checkpoint indicator */}
                      <div className="text-center mb-6">
                        <div className="inline-block bg-orange-500/20 border-2 border-orange-500 rounded-full px-4 py-2 mb-4">
                          <span className="text-orange-500 font-bold">🚪 Checkpoint</span>
                        </div>
                      </div>

                      {/* Question */}
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">
                          {currentQuestion.question}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Answer correctly to unlock the path forward
                        </p>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Button
                              variant="outline"
                              className={`
                                w-full h-auto py-6 text-lg transition-all
                                ${feedback === 'correct' && option === currentQuestion.correctAnswer
                                  ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                                  : feedback === 'wrong' && option === currentQuestion.correctAnswer
                                  ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                                  : feedback === 'wrong' && option !== currentQuestion.correctAnswer
                                  ? 'opacity-50'
                                  : 'hover:bg-primary/10 hover:border-primary'
                                }
                              `}
                              onClick={() => handleAnswer(option)}
                              disabled={!!feedback}
                            >
                              {option}
                            </Button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Feedback */}
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`
                            mt-6 text-center text-lg font-semibold
                            ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}
                          `}
                        >
                          {feedback === 'correct' ? '✓ Correct! Path unlocked!' : '✗ Wrong! Try again'}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
