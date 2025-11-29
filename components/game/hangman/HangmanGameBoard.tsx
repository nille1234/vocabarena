"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { VocabCard } from "@/types/game";
import { getRevealedWord, checkLetter } from "@/lib/utils/questionGenerator";
import { getFirstDefinition } from "@/lib/utils/definitionParser";
import { getAlphabet, cleanTerm } from "@/lib/utils/hangmanHelpers";

interface HangmanGameBoardProps {
  currentCard: VocabCard;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  hintUsed: boolean;
  showHint: boolean;
  isRoundComplete: boolean;
  onLetterGuess: (letter: string) => void;
  onHint: () => void;
}

export function HangmanGameBoard({
  currentCard,
  guessedLetters,
  wrongGuesses,
  maxWrongGuesses,
  hintUsed,
  showHint,
  isRoundComplete,
  onLetterGuess,
  onHint,
}: HangmanGameBoardProps) {
  const cleanedTerm = cleanTerm(currentCard.term);
  const revealedWord = getRevealedWord(cleanedTerm, guessedLetters);
  const alphabet = getAlphabet(cleanedTerm);

  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-8 pb-6">
        {/* Lives indicator */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: maxWrongGuesses }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={{ scale: i < wrongGuesses ? 0.8 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < wrongGuesses
                    ? "bg-red-500/20 border-red-500"
                    : "bg-blue-500/20 border-blue-500"
                }`}
              >
                <Lightbulb
                  className={`h-5 w-5 ${
                    i < wrongGuesses ? "text-red-500" : "text-blue-500"
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {maxWrongGuesses - wrongGuesses} lives remaining
          </p>
        </div>

        {/* Clue */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Danish word (clue):</p>
          <h2 className="text-2xl font-bold mb-2">
            "{getFirstDefinition(currentCard.definition)}"
          </h2>

          {/* Hint button and display */}
          {!isRoundComplete && (
            <div className="mt-4">
              {!hintUsed ? (
                <Button variant="outline" size="sm" onClick={onHint} className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Use Hint (Costs 1 life)
                </Button>
              ) : (
                showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-blue-500 font-medium"
                  >
                    💡 First letter: {cleanedTerm[0].toUpperCase()}
                  </motion.div>
                )
              )}
            </div>
          )}
        </div>

        {/* Revealed Word */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 flex-wrap">
            {revealedWord.split("").map((char, index) => {
              // Don't render boxes for spaces or hyphens
              if (char === " " || char === "-") {
                return <div key={index} className="w-3" />;
              }

              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    w-12 h-16 flex items-center justify-center text-2xl font-bold
                    border-2 rounded-lg
                    ${
                      char === "_"
                        ? "border-border bg-background"
                        : "border-primary bg-primary/10"
                    }
                  `}
                >
                  {char === "_" ? "" : char.toUpperCase()}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alphabet */}
        {!isRoundComplete && (
          <div className="grid grid-cols-9 gap-2 mb-6">
            {alphabet.map((letter) => {
              const isGuessed = guessedLetters.includes(letter.toLowerCase());
              const isCorrect = isGuessed && checkLetter(cleanedTerm, letter);
              const isWrong = isGuessed && !checkLetter(cleanedTerm, letter);

              return (
                <Button
                  key={letter}
                  variant="outline"
                  size="sm"
                  onClick={() => onLetterGuess(letter)}
                  disabled={isGuessed}
                  className={`
                    ${
                      isCorrect
                        ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300"
                        : ""
                    }
                    ${
                      isWrong
                        ? "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 opacity-50"
                        : ""
                    }
                  `}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
