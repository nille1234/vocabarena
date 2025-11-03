"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { getRandomCards, shuffleArray } from "@/lib/utils/gameLogic";
import { generateMultipleChoice } from "@/lib/utils/questionGenerator";
import { getAudioManager } from "@/lib/utils/audioManager";
import { GameTimer } from "@/components/game/GameTimer";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import confetti from "canvas-confetti";

type Question = {
  question: string;
  correctAnswer: string;
  options: string[];
};

export default function SpeedChallengePage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.code as string;

  const { vocabulary, loading, error } = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const audioManager = getAudioManager();

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    const availableCards = ((vocabulary && Array.isArray(vocabulary) ? vocabulary : [])).filter(
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
  }, [usedCards]);

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // Handle answer selection
  const handleAnswer = (selectedAnswer: string) => {
    if (!currentQuestion || feedback) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setTotalAnswered(prev => prev + 1);

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
      setTimeLeft(prev => Math.min(prev + 1, 60)); // Add 1 second, max 60
      setFeedback('correct');
      if (!isMuted) audioManager.playSuccess();
      
      // Quick confetti for correct answer
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#34D399'],
      });
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setStreak(0);
      setFeedback('wrong');
      if (!isMuted) audioManager.playError();
    }

    // Move to next question after brief delay
    setTimeout(() => {
      generateNewQuestion();
    }, 800);
  };

  // Handle time up
  const handleTimeUp = () => {
    setIsGameOver(true);
    if (!isMuted) audioManager.playCelebration();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Handle play again
  const handlePlayAgain = () => {
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAnswered(0);
    setCorrectAnswers(0);
    setUsedCards(new Set());
    setIsGameOver(false);
    setFeedback(null);
    generateNewQuestion();
  };

  const accuracy = totalAnswered > 0 ? correctAnswers / totalAnswered : 0;

  if (isGameOver) {
    return (
      <GameEndScreen
        title="Speed Challenge Complete!"
        score={score}
        accuracy={accuracy}
        streak={bestStreak}
        timeElapsed={60}
        message={`You answered ${correctAnswers} out of ${totalAnswered} questions correctly!`}
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
              initialTime={timeLeft}
              onTimeUp={handleTimeUp}
              isRunning={!isGameOver}
              onTick={setTimeLeft}
            />
            <ScoreDisplay score={score} streak={streak} accuracy={accuracy} />
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
          <h1 className="text-3xl font-heading font-bold mb-2">⚡ Speed Challenge</h1>
          <p className="text-muted-foreground">
            Answer as many questions as you can! +10 points & +1 second for correct answers
          </p>
        </div>

        {/* Question Card */}
        <div className="max-w-2xl mx-auto">
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
                          mt-6 text-center text-lg font-semibold
                          ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}
                        `}
                      >
                        {feedback === 'correct' ? '✓ Correct! +10 points, +1 second' : '✗ Wrong! -5 points'}
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
  );
}
