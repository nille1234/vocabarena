"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { generateFillInBlank } from "@/lib/utils/questionGenerator";
import { getAudioManager } from "@/lib/utils/audioManager";
import { ScoreDisplay } from "@/components/game/ScoreDisplay";
import { GameEndScreen } from "@/components/game/GameEndScreen";
import confetti from "canvas-confetti";

type Question = {
  sentence: string;
  correctAnswer: string;
  options: string[];
};

export default function SentenceBuilderPage() {
  const router = useRouter();
  const params = useParams();

  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showCompleteSentence, setShowCompleteSentence] = useState(false);

  const audioManager = getAudioManager();
  const TOTAL_ROUNDS = 10;
  const { vocabulary, loading, error } = useGameVocabulary();

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
    const question = generateFillInBlank(randomCard, vocabulary || []);

    setCurrentQuestion(question);
    setUsedCards(prev => new Set(Array.from(prev).concat(randomCard.id)));
    setSelectedAnswer(null);
    setFeedback(null);
    setShowCompleteSentence(false);
  }, [vocabulary, usedCards]);

  // Initialize first question
  useEffect(() => {
    if (vocabulary && Array.isArray(vocabulary) && vocabulary.length > 0) {
      generateNewQuestion();
    }
  }, [vocabulary, generateNewQuestion]);

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    if (feedback || !currentQuestion) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;

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
    } else {
      setFeedback('wrong');
      if (!isMuted) audioManager.playError();
    }

    // Show complete sentence
    setShowCompleteSentence(true);
  };

  // Handle next round
  const handleNextRound = () => {
    if (currentRound >= TOTAL_ROUNDS) {
      setIsGameOver(true);
      if (!isMuted) audioManager.playCelebration();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentRound(prev => prev + 1);
      generateNewQuestion();
    }
  };

  // Handle play again
  const handlePlayAgain = () => {
    setCurrentRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setUsedCards(new Set());
    setIsGameOver(false);
    generateNewQuestion();
  };

  const accuracy = currentRound > 1 ? correctAnswers / (currentRound - 1) : 0;

  if (isGameOver) {
    return (
      <GameEndScreen
        title="Sentence Builder Complete!"
        score={score}
        accuracy={accuracy}
        message={`You completed ${correctAnswers} out of ${TOTAL_ROUNDS} sentences correctly!`}
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
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <span className="text-sm font-bold text-blue-500">
                {currentRound} / {TOTAL_ROUNDS}
              </span>
            </div>
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
          <h1 className="text-3xl font-heading font-bold mb-2">✍️ Sentence Builder</h1>
          <p className="text-muted-foreground">
            Complete the sentence with the correct word
          </p>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentRound}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="pt-8 pb-6">
                    {/* Sentence with blank */}
                    <div className="text-center mb-8">
                      <div className="text-xl md:text-2xl font-medium leading-relaxed mb-6">
                        {currentQuestion.sentence.split('______').map((part, index, array) => (
                          <span key={index}>
                            {part}
                            {index < array.length - 1 && (
                              <span className="inline-block mx-2">
                                {showCompleteSentence ? (
                                  <span className={`
                                    px-4 py-2 rounded-lg font-bold
                                    ${feedback === 'correct'
                                      ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                                      : 'bg-red-500/20 text-red-700 dark:text-red-300'
                                    }
                                  `}>
                                    {currentQuestion.correctAnswer}
                                  </span>
                                ) : (
                                  <span className="inline-block w-32 h-10 border-b-4 border-primary border-dashed" />
                                )}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {showCompleteSentence ? 'Complete sentence shown above' : 'Select the word that fits best'}
                      </p>
                    </div>

                    {/* Options */}
                    {!showCompleteSentence && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
                                w-full h-auto py-4 text-base transition-all
                                ${selectedAnswer === option
                                  ? 'bg-primary/20 border-primary scale-105'
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
                    )}

                    {/* Feedback and Next Button */}
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <p className={`
                          text-lg font-semibold mb-4
                          ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}
                        `}>
                          {feedback === 'correct' ? '✓ Correct! +10 points' : '✗ Wrong answer'}
                        </p>
                        
                        {showCompleteSentence && (
                          <Button onClick={handleNextRound} size="lg">
                            {currentRound >= TOTAL_ROUNDS ? 'View Results' : 'Next Sentence'}
                          </Button>
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
  );
}
