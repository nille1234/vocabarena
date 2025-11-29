"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VocabCard } from "@/types/game";
import { getQuestionTerm, isGermanCard } from "@/lib/store/languageStore";
import { getFirstDefinition } from "@/lib/utils/definitionParser";

interface HangmanRoundCompleteProps {
  isWordComplete: boolean;
  currentCard: VocabCard;
  correctLettersCount: number;
  roundsPlayed: number;
  onNextRound: () => void;
}

export function HangmanRoundComplete({
  isWordComplete,
  currentCard,
  correctLettersCount,
  roundsPlayed,
  onNextRound,
}: HangmanRoundCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      {isWordComplete ? (
        <>
          <p className="text-2xl font-bold text-green-500 mb-4">✓ Correct!</p>
          <div className="bg-background/50 rounded-lg p-4 mb-4">
            <p className="text-muted-foreground">
              <span className="font-bold">{getFirstDefinition(currentCard.definition)}</span>{" "}
              (Danish) = <span className="font-bold">{getQuestionTerm(currentCard)}</span> (
              {isGermanCard(currentCard) ? "German" : "English"})
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            +{correctLettersCount * 10} points (letters) + 50 points (completion) ={" "}
            {correctLettersCount * 10 + 50} total
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-red-500 mb-4">Out of Lives!</p>
          <div className="bg-background/50 rounded-lg p-4 mb-4">
            <p className="text-muted-foreground mb-2">
              The answer was: <span className="font-bold">{getQuestionTerm(currentCard)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold">{getFirstDefinition(currentCard.definition)}</span>{" "}
              (Danish) = <span className="font-bold">{getQuestionTerm(currentCard)}</span> (
              {isGermanCard(currentCard) ? "German" : "English"})
            </p>
          </div>
        </>
      )}

      <Button onClick={onNextRound} size="lg">
        {roundsPlayed >= 9 ? "View Results" : "Next Word"}
      </Button>
    </motion.div>
  );
}
