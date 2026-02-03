"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function BlokusRulesBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Game Rules</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1 text-primary">🎯 Objective</h4>
                  <p className="text-muted-foreground">
                    Place all your pieces on the board. The player with the fewest squares remaining wins!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1 text-primary">📝 Vocabulary Questions</h4>
                  <p className="text-muted-foreground">
                    Answer a vocabulary question correctly to earn the right to place a piece. Wrong answers skip your turn.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1 text-primary">🧩 Placement Rules</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>First piece must touch your starting corner (Player 1: top-left, Player 2: bottom-right)</li>
                    <li>New pieces must touch corners of your existing pieces (diagonal)</li>
                    <li>Pieces cannot touch edges of your own color (only corners)</li>
                    <li>You can rotate and flip pieces before placing</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-1 text-primary">🏆 Scoring</h4>
                  <p className="text-muted-foreground">
                    Game ends when no player can place more pieces. Winner has the fewest squares left unplaced.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
