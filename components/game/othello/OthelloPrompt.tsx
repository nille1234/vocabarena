import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TranslationPrompt {
  word: string;
  correctAnswer: string;
  choices?: string[];
}

interface OthelloPromptProps {
  show: boolean;
  prompt: TranslationPrompt | null;
  gameMode: 'text-input' | 'multiple-choice';
  userAnswer: string;
  selectedChoice: string | null;
  feedback: "correct" | "incorrect" | null;
  onAnswerChange: (answer: string) => void;
  onChoiceSelect: (choice: string) => void;
  onSubmit: () => void;
}

export function OthelloPrompt({
  show,
  prompt,
  gameMode,
  userAnswer,
  selectedChoice,
  feedback,
  onAnswerChange,
  onChoiceSelect,
  onSubmit,
}: OthelloPromptProps) {
  if (!show || !prompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-4 w-full"
        >
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-center">
              Translate to Danish
            </h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-4">
                {prompt.word}
              </p>
            </div>
            {gameMode === "multiple-choice" && prompt.choices ? (
              <div className="space-y-2">
                {prompt.choices.map((choice, index) => (
                  <Button
                    key={index}
                    variant={selectedChoice === choice ? "default" : "outline"}
                    className="w-full text-lg py-6"
                    onClick={() => onChoiceSelect(choice)}
                    disabled={feedback !== null}
                  >
                    {choice}
                  </Button>
                ))}
              </div>
            ) : (
              <Input
                value={userAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                placeholder="Type your answer..."
                className="text-lg"
                autoFocus
                disabled={feedback !== null}
              />
            )}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center p-4 rounded-lg ${
                  feedback === "correct"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                <p className="font-bold">
                  {feedback === "correct" ? "✓ Correct!" : "✗ Incorrect"}
                </p>
                {feedback === "incorrect" && (
                  <p className="text-sm mt-1">
                    Correct answers: {prompt.correctAnswer.split(/[\s,;]+/).filter(w => w.trim().length > 0).join(', ')}
                  </p>
                )}
              </motion.div>
            )}
            {!feedback && (
              <Button 
                onClick={onSubmit} 
                className="w-full"
                disabled={gameMode === "multiple-choice" && !selectedChoice}
              >
                Check Answer
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
