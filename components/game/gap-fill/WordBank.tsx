"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordBankProps {
  words: string[];
  usedWords: Set<string>;
  onShuffle: () => void;
}

export function WordBank({ words, usedWords, onShuffle }: WordBankProps) {
  const availableWords = words.filter(word => !usedWords.has(word));

  return (
    <Card className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Word Bank ({availableWords.length} remaining)
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShuffle}
          className="h-8 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
        >
          <Shuffle className="h-4 w-4 mr-1" />
          Shuffle
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => {
          const isUsed = usedWords.has(word);
          
          return (
            <div
              key={`${word}-${index}`}
              draggable={!isUsed}
              onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                if (!isUsed) {
                  e.dataTransfer.setData("word", word);
                  e.dataTransfer.effectAllowed = "move";
                }
              }}
              className={`
                px-3 py-2 rounded-lg font-medium text-sm
                ${isUsed 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-30' 
                  : 'bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 cursor-move shadow-sm hover:shadow-md border-2 border-amber-300 dark:border-amber-700'
                }
                transition-all duration-200
              `}
            >
              {word}
            </div>
          );
        })}
      </div>
      
      {availableWords.length === 0 && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
          All words have been used!
        </p>
      )}
    </Card>
  );
}
