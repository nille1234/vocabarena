"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GapDropZoneProps {
  gapId: number;
  filledWord?: string;
  isCorrect?: boolean;
  showResult: boolean;
  onDrop: (gapId: number, word: string) => void;
  onRemove: (gapId: number) => void;
}

export function GapDropZone({
  gapId,
  filledWord,
  isCorrect,
  showResult,
  onDrop,
  onRemove,
}: GapDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const word = e.dataTransfer.getData("word");
    if (word) {
      onDrop(gapId, word);
    }
  };

  const getBackgroundColor = () => {
    if (showResult && filledWord) {
      return isCorrect
        ? "bg-green-100 dark:bg-green-900/30 border-green-500"
        : "bg-red-100 dark:bg-red-900/30 border-red-500";
    }
    if (filledWord) {
      return "bg-amber-100 dark:bg-amber-900/30 border-amber-500";
    }
    if (isDragOver) {
      return "bg-amber-200 dark:bg-amber-800/50 border-amber-400";
    }
    return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600";
  };

  return (
    <span
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md
        border-2 min-w-[70px] justify-center
        transition-all duration-200
        ${getBackgroundColor()}
        ${!filledWord && !showResult ? 'border-dashed' : ''}
      `}
    >
      <AnimatePresence mode="wait">
        {filledWord ? (
          <motion.span
            key={filledWord}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            <span className="font-medium text-sm">
              {filledWord}
            </span>
            {!showResult && (
              <button
                onClick={() => onRemove(gapId)}
                className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Remove word"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-400 dark:text-gray-500"
          >
            {gapId}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
