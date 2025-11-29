#!/bin/bash

# Script to add GameAccessGuard to all game pages

GAME_DIRS=(
  "whack-a-mole"
  "crossword"
  "gravity"
  "hangman"
  "hex"
  "match"
  "memory"
  "othello"
  "tic-tac-toe"
  "word-finder"
)

for game in "${GAME_DIRS[@]}"; do
  FILE="app/game/[code]/$game/page.tsx"
  
  if [ -f "$FILE" ]; then
    echo "Processing $FILE..."
    
    # Check if GameAccessGuard is already imported
    if grep -q "GameAccessGuard" "$FILE"; then
      echo "  ✓ Already has GameAccessGuard"
      continue
    fi
    
    # Add import after the first set of imports (after 'use client' and React imports)
    # This is a placeholder - actual implementation would need manual updates
    echo "  → Needs manual update"
  else
    echo "  ✗ File not found: $FILE"
  fi
done

echo ""
echo "Script complete. Manual updates required for each game page."
