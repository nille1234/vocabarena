#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const gamesToUpdate = [
  'hangman',
  'word-maze',
  'word-ladder',
  'mystery-word',
  'survival',
  'speed-challenge',
  'falling-words',
  'match'
];

const updatePattern = {
  // Add useEffect import if not present
  addUseEffect: (content) => {
    if (content.includes('import { useState, useEffect }')) return content;
    if (content.includes('import { useState }')) {
      return content.replace(
        'import { useState } from "react";',
        'import { useState, useEffect } from "react";'
      );
    }
    return content;
  },

  // Replace vocabulary import
  replaceImport: (content) => {
    return content
      .replace(
        /import { mentalHealthVocabulary } from "@\/lib\/data\/vocabulary";?\n?/g,
        ''
      )
      .replace(
        /from "next\/navigation";\n/,
        'from "next/navigation";\nimport { useGameVocabulary } from "@/hooks/use-game-vocabulary";\n'
      );
  },

  // Add vocabulary hook and redirect
  addHookAndRedirect: (content) => {
    // Find the component function
    const componentMatch = content.match(/(export default function \w+\(\) \{[\s\S]*?const gameCode = params\.code as string;)/);
    if (!componentMatch) return content;

    const replacement = componentMatch[1] + `

  const vocabulary = useGameVocabulary();
  
  // Redirect to home if no vocabulary (game must be accessed via game link)
  useEffect(() => {
    if (!vocabulary) {
      router.push('/');
    }
  }, [vocabulary, router]);`;

    return content.replace(componentMatch[1], replacement);
  },

  // Replace vocabulary usage
  replaceVocabularyUsage: (content) => {
    return content
      .replace(
        /const \[cards\] = useState\(\(\) => shuffleArray\(mentalHealthVocabulary\)\);?/g,
        'const [cards] = useState(() => vocabulary ? shuffleArray(vocabulary) : []);'
      )
      .replace(
        /const \[cards\] = useState\(mentalHealthVocabulary\);?/g,
        'const [cards] = useState(() => vocabulary || []);'
      )
      .replace(
        /shuffleArray\(mentalHealthVocabulary\)/g,
        'vocabulary ? shuffleArray(vocabulary) : []'
      )
      .replace(
        /mentalHealthVocabulary/g,
        'vocabulary || []'
      );
  },

  // Add null check
  addNullCheck: (content) => {
    // Find where cards are first used (after state declarations)
    const match = content.match(/(const \[cards\][\s\S]*?;[\s\S]*?)(const currentCard|const progress|const isLastCard|const questions)/);
    if (!match) return content;

    const insertion = `

  // Show loading state while redirecting
  if (!vocabulary || cards.length === 0) {
    return null;
  }

  `;

    return content.replace(match[0], match[1] + insertion + match[2]);
  }
};

console.log('Starting batch update of game files...\n');

gamesToUpdate.forEach(game => {
  const filePath = path.join(__dirname, '..', 'app', 'game', '[code]', game, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${game}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply all transformations
    content = updatePattern.addUseEffect(content);
    content = updatePattern.replaceImport(content);
    content = updatePattern.addHookAndRedirect(content);
    content = updatePattern.replaceVocabularyUsage(content);
    content = updatePattern.addNullCheck(content);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${game}`);
  } catch (error) {
    console.log(`❌ Error updating ${game}:`, error.message);
  }
});

console.log('\n✨ Batch update complete!');
console.log('Please review the changes and test each game.');
