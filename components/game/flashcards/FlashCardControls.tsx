"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FlashCardControlsProps {
  onKnown: () => void;
  onReview: () => void;
  disabled: boolean;
}

export function FlashCardControls({ onKnown, onReview, disabled }: FlashCardControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: disabled ? 0.5 : 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-4 justify-center w-full max-w-2xl mx-auto"
    >
      <Button
        onClick={onReview}
        disabled={disabled}
        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all"
      >
        <XCircle className="mr-2 h-4 w-4" />
        I don't know this
      </Button>
      
      <Button
        onClick={onKnown}
        disabled={disabled}
        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        I know this
      </Button>
    </motion.div>
  );
}
