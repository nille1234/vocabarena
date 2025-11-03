#!/bin/bash

# Fix ALL game files that use useGameVocabulary incorrectly

files=(
  "app/game/[code]/flashcards/page.tsx"
  "app/game/[code]/mystery-word/page.tsx"
  "app/game/[code]/sentence-builder/page.tsx"
  "app/game/[code]/speed-challenge/page.tsx"
  "app/game/[code]/spell/page.tsx"
  "app/game/[code]/survival/page.tsx"
  "app/game/[code]/test/page.tsx"
  "app/game/[code]/word-ladder/page.tsx"
  "app/game/[code]/word-maze/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix the hook destructuring
    sed -i 's/const vocabulary = useGameVocabulary();/const { vocabulary, loading, error } = useGameVocabulary();/g' "$file"
    
    # Fix vocabulary checks - add Array.isArray
    sed -i 's/if (!vocabulary || vocabulary\.length === 0)/if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0)/g' "$file"
    sed -i 's/if (vocabulary && vocabulary\.length > 0)/if (vocabulary \&\& Array.isArray(vocabulary) \&\& vocabulary.length > 0)/g' "$file"
    sed -i 's/(vocabulary || \[\])\./((vocabulary \&\& Array.isArray(vocabulary) ? vocabulary : []))./g' "$file"
    
    echo "Fixed $file"
  else
    echo "Skipping $file (not found)"
  fi
done

echo "All files fixed!"
