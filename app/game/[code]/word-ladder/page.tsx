"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, TrendingUp, TrendingDown } from "lucide-react";
import { generateMultipleChoice } from "@/lib/utils/questionGenerator";
import { getAudioManager } from "@/lib/utils/audioManager";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import confetti from "canvas-confetti";

type Question = {
  question: string;
  correctAnswer: string;
  options: string[];
};

export default function WordLadderPage() {
  const router = useRouter();
  const params = useParams();
  const vocabulary = useGameVocabulary();

  const [currentRung, setCurrentRung] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  const audioManager = getAudioManager();
  const TOTAL_RUNGS = 10;

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    const availableCards = (vocabulary || []).filter(
      card => !usedCards.has(card.id)
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

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // Track time
  useEffect(() => {
    if (isGameOver) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver, startTime]);

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion || feedback) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + 10);
      setCurrentRung(prev => {
        const newRung = Math.min(prev + 1, TOTAL_RUNGS);
        if (newRung === TOTAL_RUNGS) {
          setIsGameOver(true);
          if (!isMuted) audioManager.playCelebration();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return newRung;
      });
      setFeedback('correct');
      if (!isMuted) audioManager.playClimb();
      
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { y: 0.7 },
        colors: ['#34D399'],
      });
    } else {
      setCurrentRung(prev => Math.max(0, prev - 1));
      setFeedback('wrong');
      if (!isMuted) audioManager.playFall();
    }

    // Move to next question after brief delay
    setTimeout(() => {
      if (currentRung < TOTAL_RUNGS) {
        generateNewQuestion();
      }
    }, 1000);
  };

  // Handle play again
  const handlePlayAgain = () => {
    window.location.reload();
  };

  const accuracy = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver) {
    return (
      <GameEndScreen
        title="You Reached the Top!"
        score={score}
        accuracy={accuracy}
        streak={correctAnswers}
        timeElapsed={timeElapsed}
        message={`Congratulations! You climbed all 10 rungs in ${formatTime(timeElapsed)}!`}
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
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <span className="text-sm font-bold text-blue-500">⏱️ {formatTime(timeElapsed)}</span>
            </div>
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
          <h1 className="text-3xl font-heading font-bold mb-2">🧗 Word Ladder</h1>
          <p className="text-muted-foreground">
            Climb to the top! Correct answers move you up, wrong answers move you down
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-[200px_1fr] gap-8">
          {/* Ladder Visual */}
          <div className="flex flex-col-reverse gap-2">
            {Array.from({ length: TOTAL_RUNGS }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  h-12 rounded-lg border-2 flex items-center justify-center font-bold
                  ${currentRung === index
                    ? 'bg-primary border-primary text-primary-foreground scale-110'
                    : currentRung > index
                    ? 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300'
                    : 'bg-background border-border'
                  }
                  transition-all duration-300
                `}
              >
                {index === TOTAL_RUNGS - 1 ? '🏆' : index + 1}
              </motion.div>
            ))}
          </div>

          {/* Question Card */}
          <div>
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.question}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="pt-8 pb-6">
                      {/* Progress */}
                      <div className="text-center mb-6">
                        <p className="text-sm text-muted-foreground mb-2">
                          Rung {currentRung} / {TOTAL_RUNGS}
                        </p>
                        <div className="w-full bg-border rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentRung / TOTAL_RUNGS) * 100}%` }}
                          />
                        </div>
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
                            mt-6 text-center text-lg font-semibold flex items-center justify-center gap-2
                            ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}
                          `}
                        >
                          {feedback === 'correct' ? (
                            <>
                              <TrendingUp className="h-5 w-5" />
                              Correct! Climbing up
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-5 w-5" />
                              Wrong! Slipping down
                            </>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
