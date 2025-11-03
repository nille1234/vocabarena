#!/bin/bash

# Fix TypeScript errors in game files
# This script adds Array.isArray checks for vocabulary.length usage

files=(
  "app/game/[code]/gravity/page.tsx"
  "app/game/[code]/survival/page.tsx"
  "app/game/[code]/mystery-word/page.tsx"
  "app/game/[code]/sentence-builder/page.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Replace vocabulary.length with Array.isArray check
  sed -i 's/if (!vocabulary || vocabulary\.length === 0)/if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0)/g' "$file"
  sed -i 's/if (vocabulary && vocabulary\.length > 0)/if (vocabulary \&\& Array.isArray(vocabulary) \&\& vocabulary.length > 0)/g' "$file"
  sed -i 's/if (!vocabularyData || vocabulary\.length === 0)/if (!vocabularyData || !Array.isArray(vocabulary) || vocabulary.length === 0)/g' "$file"
  
  # Fix useGameVocabulary destructuring if needed
  sed -i 's/const vocabulary = useGameVocabulary();/const { vocabulary, loading, error } = useGameVocabulary();/g' "$file"
  
  echo "Fixed $file"
done

echo "All files fixed!"
