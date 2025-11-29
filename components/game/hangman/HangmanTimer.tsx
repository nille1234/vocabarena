"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatTime } from "@/lib/utils/hangmanHelpers";

interface HangmanTimerProps {
  timeRemaining: number;
  timeLimit: number;
  isActive: boolean;
  onTimeExpired: () => void;
  isMuted: boolean;
}

export function HangmanTimer({
  timeRemaining,
  timeLimit,
  isActive,
  onTimeExpired,
  isMuted,
}: HangmanTimerProps) {
  // Calculate progress percentage
  const progress = (timeRemaining / timeLimit) * 100;
  
  // Determine color based on time remaining
  const getColor = () => {
    if (timeRemaining <= 10) return "text-red-500";
    if (timeRemaining <= 30) return "text-yellow-500";
    return "text-green-500";
  };
  
  const getProgressColor = () => {
    if (timeRemaining <= 10) return "stroke-red-500";
    if (timeRemaining <= 30) return "stroke-yellow-500";
    return "stroke-green-500";
  };

  // Handle time expiration
  useEffect(() => {
    if (isActive && timeRemaining === 0) {
      onTimeExpired();
    }
  }, [timeRemaining, isActive, onTimeExpired]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        {/* Background circle */}
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className={getProgressColor()}
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            strokeLinecap="round"
            initial={false}
            animate={{
              strokeDashoffset: `${2 * Math.PI * 28 * (1 - progress / 100)}`,
            }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>
        
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className={`h-5 w-5 ${getColor()}`} />
        </div>
      </div>
      
      {/* Time text */}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Time Left</span>
        <motion.span
          className={`text-2xl font-bold ${getColor()}`}
          animate={timeRemaining <= 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: timeRemaining <= 10 ? Infinity : 0 }}
        >
          {formatTime(timeRemaining)}
        </motion.span>
      </div>
    </div>
  );
}
