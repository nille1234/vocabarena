"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrosswordGrid } from "@/lib/utils/crosswordGenerator";
import { motion } from "framer-motion";

interface CrosswordAnswerKeyProps {
  crossword: CrosswordGrid;
  language?: 'english' | 'german';
}

export function CrosswordAnswerKey({ crossword, language }: CrosswordAnswerKeyProps) {
  const acrossWords = crossword.words.filter(w => w.direction === 'across');
  const downWords = crossword.words.filter(w => w.direction === 'down');

  return (
    <div className="space-y-6">
      {/* Crossword Grid with Answers */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Answer Key</span>
            {language && (
              <Badge variant="secondary" className="capitalize">
                {language}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div
              className="grid gap-0 border-2 border-gray-300 dark:border-gray-700"
              style={{
                gridTemplateColumns: `repeat(${crossword.cols}, minmax(0, 1fr))`,
              }}
            >
              {crossword.grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;

                  if (!cell) {
                    return (
                      <div
                        key={key}
                        className="w-10 h-10 bg-gray-800/50 dark:bg-gray-950/50"
                      />
                    );
                  }

                  return (
                    <div
                      key={key}
                      className="relative w-10 h-10 border border-gray-300 dark:border-gray-700 bg-green-50 dark:bg-green-900/20"
                    >
                      {cell.number && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-violet-600 dark:text-violet-400">
                          {cell.number}
                        </span>
                      )}
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100">
                        {cell.letter}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word List with Answers */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Across Words */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">→</span> Across
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acrossWords.map((word) => (
                <motion.div
                  key={word.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="font-bold text-violet-600 dark:text-violet-400 min-w-[1.5rem]">
                      {word.number}.
                    </span>
                    <span className="text-sm text-muted-foreground flex-1">
                      {word.clue}
                    </span>
                  </div>
                  <div className="ml-6">
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {word.word}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Down Words */}
        <Card className="border-none shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">↓</span> Down
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {downWords.map((word) => (
                <motion.div
                  key={word.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">
                      {word.number}.
                    </span>
                    <span className="text-sm text-muted-foreground flex-1">
                      {word.clue}
                    </span>
                  </div>
                  <div className="ml-6">
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      {word.word}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
