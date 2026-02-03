"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { VocabCard } from "@/types/game";

interface FlashCardProps {
  card: VocabCard;
  onFlip: () => void;
  isFlipped: boolean;
}

export function FlashCard({ card, onFlip, isFlipped }: FlashCardProps) {
  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        onClick={onFlip}
      >
        {/* Front of card */}
        <motion.div
          className="absolute w-full backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400 shadow-2xl min-h-[280px]">
            <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
              <Badge className="mb-6 text-sm bg-white/20 hover:bg-white/30 text-white border-white/30">
                Term
              </Badge>
              <h2 className="text-4xl font-bold text-white text-center mb-6">
                {card.term}
              </h2>
              <p className="text-white/80 text-sm text-center">
                Click to see definition
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back of card */}
        <motion.div
          className="w-full backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 shadow-2xl min-h-[280px]">
            <CardContent className="flex flex-col items-center justify-center p-8 min-h-[280px]">
              <Badge className="mb-6 text-sm bg-white/20 hover:bg-white/30 text-white border-white/30">
                Definition
              </Badge>
              <p className="text-2xl font-semibold text-white text-center mb-6 leading-relaxed">
                {card.definition}
              </p>
              <p className="text-white/80 text-sm text-center">
                Click to flip back
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
