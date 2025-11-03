"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GameTimerProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  onTick?: (timeLeft: number) => void;
  isRunning?: boolean;
  showWarning?: boolean;
  warningThreshold?: number; // seconds
}

export function GameTimer({
  initialTime,
  onTimeUp,
  onTick,
  isRunning = true,
  showWarning = true,
  warningThreshold = 10,
}: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        
        if (onTick) {
          onTick(newTime);
        }

        if (newTime <= 0) {
          clearInterval(interval);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, onTick]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = showWarning && timeLeft <= warningThreshold && timeLeft > 0;
  const isTimeUp = timeLeft === 0;

  return (
    <Badge
      variant={isTimeUp ? "destructive" : isWarning ? "default" : "secondary"}
      className={`
        flex items-center gap-2 px-4 py-2 text-lg font-bold
        ${isWarning ? 'animate-pulse bg-orange-500 text-white' : ''}
        ${isTimeUp ? 'bg-red-500 text-white' : ''}
      `}
    >
      <Timer className="h-5 w-5" />
      <span>{formatTime(timeLeft)}</span>
    </Badge>
  );
}
