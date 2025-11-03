"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Heart } from "lucide-react";
import { generateMultipleChoice } from "@/lib/utils/questionGenerator";
import { getAudioManager } from "@/lib/utils/audioManager";
import { GameTimer } from "@/components/game/GameTimer";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import { VocabCard } from "@/types/game";
import confetti from "canvas-confetti";

type Question = {
  question: string;
  correctAnswer: string;
  options: string[];
};

export default function SurvivalPage() {
  const router = useRouter();
  const params = useParams();
  const { vocabulary, loading, error } = useGameVocabulary();

  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timePerQuestion, setTimePerQuestion] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const audioManager = getAudioManager();

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    const availableCards = ((vocabulary && Array.isArray(vocabulary) ? vocabulary : [])).filter(
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
  }, [usedCards]);

  // Initialize first question
  useEffect(() => {
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0) {
      generateNewQuestion();
    }
  }, [vocabulary]);

  // Increase difficulty every 5 questions
  useEffect(() => {
    if (questionNumber > 1 && questionNumber % 5 === 0) {
      setTimePerQuestion(prev => Math.max(3, prev - 0.5));
    }
  }, [questionNumber]);

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion || feedback) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      setFeedback('correct');
      if (!isMuted) audioManager.playSuccess();
      
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#34D399'],
      });

      // Move to next question after brief delay
      setTimeout(() => {
        setQuestionNumber(prev => prev + 1);
        generateNewQuestion();
      }, 800);
    } else {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setIsGameOver(true);
        }
        return newLives;
      });
      setStreak(0);
      setFeedback('wrong');
      if (!isMuted) audioManager.playError();

      if (lives > 1) {
        // Move to next question after brief delay
        setTimeout(() => {
          setQuestionNumber(prev => prev + 1);
          generateNewQuestion();
        }, 1200);
      }
    }
  };

  // Handle timeout
  const handleTimeout = () => {
    if (feedback) return;

    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setIsGameOver(true);
      }
      return newLives;
    });
    setStreak(0);
    setFeedback('timeout');
    if (!isMuted) audioManager.playError();

    if (lives > 1) {
      setTimeout(() => {
        setQuestionNumber(prev => prev + 1);
        generateNewQuestion();
      }, 1200);
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    setLives(3);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionNumber(1);
    setTimePerQuestion(5);
    setUsedCards(new Set());
    setIsGameOver(false);
    setFeedback(null);
    setCorrectAnswers(0);
    generateNewQuestion();
  };

  const accuracy = questionNumber > 1 ? correctAnswers / (questionNumber - 1) : 0;

  if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No vocabulary available</p>
          <Button onClick={() => router.push(`/game/${params.code}`)}>
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GameEndScreen
        title="Game Over!"
        score={score}
        accuracy={accuracy}
        streak={bestStreak}
        message={`You survived ${questionNumber - 1} questions!`}
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
            <GameTimer
              key={questionNumber}
              initialTime={timePerQuestion}
              onTimeUp={handleTimeout}
              isRunning={!isGameOver && !feedback}
              showWarning={true}
              warningThreshold={2}
            />
            <ScoreDisplay score={score} streak={streak} lives={lives} />
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
          <h1 className="text-3xl font-heading font-bold mb-2">💥 Survival Mode</h1>
          <p className="text-muted-foreground">
            Answer before time runs out! Question #{questionNumber} • {timePerQuestion}s per question
          </p>
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={questionNumber}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`
                  border-2 transition-all
                  ${lives === 1 ? 'border-red-500 bg-red-500/5' : 'border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5'}
                `}>
                  <CardContent className="pt-8 pb-6">
                    {/* Lives indicator */}
                    <div className="flex justify-center gap-2 mb-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                          key={i}
                          className={`h-8 w-8 ${
                            i < lives
                              ? 'fill-red-500 text-red-500'
                              : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Question */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">
                        {currentQuestion.question}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Select the correct translation
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
                                : (feedback === 'wrong' || feedback === 'timeout') && option === currentQuestion.correctAnswer
                                ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                                : (feedback === 'wrong' || feedback === 'timeout') && option !== currentQuestion.correctAnswer
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
                        {feedback === 'correct' && '✓ Correct! +10 points'}
                        {feedback === 'wrong' && '✗ Wrong! -1 life'}
                        {feedback === 'timeout' && '⏱️ Time\'s up! -1 life'}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Difficulty indicator */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {timePerQuestion < 5 && (
                <span className="text-orange-500 font-semibold">
                  ⚠️ Difficulty increased! Faster responses required
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
