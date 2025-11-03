"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Clock, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { shuffleArray } from "@/lib/utils/gameLogic";
import confetti from "canvas-confetti";
import { useGameVocabulary } from "@/hooks/use-game-vocabulary";

type Question = {
  id: string;
  term: string;
  correctAnswer: string;
  options: string[];
  userAnswer?: string;
};

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;

  const vocabulary = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);

  const [questions] = useState<Question[]>(() => {
    if (!vocabulary) return [];
    const shuffled = shuffleArray(vocabulary).slice(0, 10);
    return shuffled.map(card => {
      // Get 3 random wrong answers
      const wrongAnswers = vocabulary
        .filter(c => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.definition);
      
      // Combine and shuffle all options
      const options = shuffleArray([card.definition, ...wrongAnswers]);
      
      return {
        id: card.id,
        term: card.term,
        correctAnswer: card.definition,
        options,
      };
    });
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Show loading state while redirecting
  if (!vocabulary || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setAnswers({ ...answers, [currentQuestion.id]: selectedAnswer });
    setShowResult(true);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#34D399'],
      });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60A5FA', '#A78BFA', '#34D399'],
      });
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const calculateResults = () => {
    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const incorrect = questions.length - correct;
    const percentage = Math.round((correct / questions.length) * 100);
    return { correct, incorrect, percentage };
  };

  if (isLastQuestion && showResult) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardContent className="pt-12 pb-12">
                <Trophy className="h-20 w-20 text-primary mx-auto mb-6" />
                <h2 className="text-4xl font-heading font-bold mb-4 text-center">
                  Test Complete!
                </h2>
                <p className="text-muted-foreground text-lg mb-8 text-center">
                  Here are your results
                </p>
                
                {/* Score Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - results.percentage / 100)}`}
                        className="text-primary transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary">{results.percentage}%</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="pt-6 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-4xl font-bold text-green-500 mb-1">
                        {results.correct}
                      </div>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="pt-6 text-center">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <div className="text-4xl font-bold text-red-500 mb-1">
                        {results.incorrect}
                      </div>
                      <p className="text-sm text-muted-foreground">Incorrect</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Message */}
                <Card className="border-border/50 bg-muted/20 mb-8">
                  <CardContent className="pt-6 text-center">
                    <p className="text-lg font-medium">
                      {results.percentage >= 90 ? "🌟 Outstanding! You're a vocabulary master!" :
                       results.percentage >= 70 ? "🎉 Great job! Keep up the good work!" :
                       results.percentage >= 50 ? "👍 Good effort! Practice makes perfect!" :
                       "💪 Keep practicing! You'll improve with time!"}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-center">
                  <Button size="lg" onClick={() => window.location.reload()}>
                    <Zap className="mr-2 h-5 w-5" />
                    Retake Test
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.push(`/lobby/${gameCode}`)}>
                    Back to Lobby
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.push(`/lobby/${gameCode}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lobby
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">
                {Object.keys(answers).length}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <Badge variant="secondary" className="mb-4">
                        Multiple Choice
                      </Badge>
                      <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                        {currentQuestion.term}
                      </h2>
                      <p className="text-muted-foreground">
                        Select the correct definition
                      </p>
                    </div>

                    {/* Options */}
                    <RadioGroup
                      value={selectedAnswer}
                      onValueChange={setSelectedAnswer}
                      disabled={showResult}
                      className="space-y-3"
                    >
                      {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const showCorrectness = showResult && (isSelected || isCorrect);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className={`
                                cursor-pointer transition-all duration-300
                                ${isSelected && !showResult ? 'border-primary bg-primary/10' : 'border-border'}
                                ${showResult && isCorrect ? 'border-green-500 bg-green-500/10' : ''}
                                ${showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-500/10' : ''}
                                ${!showResult ? 'hover:border-primary/50' : ''}
                              `}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <RadioGroupItem
                                    value={option}
                                    id={`option-${index}`}
                                    className="mt-1"
                                  />
                                  <Label
                                    htmlFor={`option-${index}`}
                                    className="flex-1 cursor-pointer text-base leading-relaxed"
                                  >
                                    {option}
                                  </Label>
                                  {showCorrectness && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                    >
                                      {isCorrect ? (
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                      ) : (
                                        <XCircle className="h-6 w-6 text-red-500" />
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </RadioGroup>

                    {/* Action Button */}
                    {!showResult ? (
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg"
                        onClick={handleSubmit}
                        disabled={!selectedAnswer}
                      >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Submit Answer
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button
                          size="lg"
                          className="w-full h-14 text-lg"
                          onClick={handleNext}
                        >
                          {isLastQuestion ? 'View Results' : 'Next Question'}
                          <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
