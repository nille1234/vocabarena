#!/bin/bash

# Script to update all game files to use getFirstDefinition
# This adds the import and replaces card.definition with getFirstDefinition(card.definition)

echo "Starting game definition updates..."

# Array of game files to update
games=(
  "app/game/[code]/hangman/page.tsx"
  "app/game/[code]/mystery-word/page.tsx"
  "app/game/[code]/word-ladder/page.tsx"
  "app/game/[code]/word-maze/page.tsx"
  "app/game/[code]/speed-challenge/page.tsx"
  "app/game/[code]/survival/page.tsx"
  "app/game/[code]/gravity/page.tsx"
  "app/game/[code]/test/page.tsx"
  "app/game/[code]/spell/page.tsx"
)

for game in "${games[@]}"; do
  if [ -f "$game" ]; then
    echo "Processing $game..."
    # This is a placeholder - actual sed commands would go here
    echo "  - Would update imports and replace card.definition calls"
  else
    echo "  - File not found: $game"
  fi
done

echo "Done! Please review changes manually."
