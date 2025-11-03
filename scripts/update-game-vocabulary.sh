#!/bin/bash

# Script to update all game pages to use the useGameVocabulary hook

# Array of game page files
games=(
  "app/game/[code]/hangman/page.tsx"
  "app/game/[code]/sentence-builder/page.tsx"
  "app/game/[code]/word-maze/page.tsx"
  "app/game/[code]/word-ladder/page.tsx"
  "app/game/[code]/mystery-word/page.tsx"
  "app/game/[code]/survival/page.tsx"
  "app/game/[code]/speed-challenge/page.tsx"
  "app/game/[code]/test/page.tsx"
  "app/game/[code]/falling-words/page.tsx"
  "app/game/[code]/gravity/page.tsx"
  "app/game/[code]/learn/page.tsx"
  "app/game/[code]/flashcards/page.tsx"
  "app/game/[code]/match/page.tsx"
)

echo "Updating game pages to use useGameVocabulary hook..."

for game in "${games[@]}"; do
  if [ -f "$game" ]; then
    echo "Processing $game..."
    
    # Add the import for useGameVocabulary if not already present
    if ! grep -q "useGameVocabulary" "$game"; then
      # Add import after other imports
      sed -i '/^import.*from.*$/a import { useGameVocabulary } from "@/hooks/use-game-vocabulary";' "$game"
    fi
    
    # Replace mentalHealthVocabulary usage with useGameVocabulary()
    # This is a simple replacement - manual review recommended
    sed -i 's/mentalHealthVocabulary/useGameVocabulary()/g' "$game"
    
    echo "✓ Updated $game"
  else
    echo "✗ File not found: $game"
  fi
done

echo ""
echo "Done! Please review the changes and test each game."
echo "Note: Some games may need manual adjustments depending on their structure."
