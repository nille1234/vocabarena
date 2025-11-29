/**
 * Word classification utility using basic heuristics
 * Categorizes words by their likely word class (noun, verb, adjective, etc.)
 */

export type WordClass = 'noun' | 'verb' | 'adjective' | 'adverb' | 'article' | 'short' | 'medium' | 'long' | 'unknown';

/**
 * Classify a word based on common patterns and endings
 */
export function classifyWord(word: string): WordClass {
  const lowerWord = word.toLowerCase().trim();
  
  // Articles and determiners
  const articles = ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
  if (articles.includes(lowerWord)) {
    return 'article';
  }
  
  // Adverbs (typically end in -ly)
  if (lowerWord.endsWith('ly') && lowerWord.length > 3) {
    return 'adverb';
  }
  
  // Adjectives
  const adjectiveEndings = ['ful', 'less', 'ous', 'ive', 'able', 'ible', 'al', 'ic', 'ish', 'y'];
  for (const ending of adjectiveEndings) {
    if (lowerWord.endsWith(ending) && lowerWord.length > ending.length + 2) {
      return 'adjective';
    }
  }
  
  // Verbs
  const verbEndings = ['ing', 'ed', 'en', 'ate', 'ify', 'ize', 'ise'];
  for (const ending of verbEndings) {
    if (lowerWord.endsWith(ending) && lowerWord.length > ending.length + 2) {
      return 'verb';
    }
  }
  
  // Nouns
  const nounEndings = ['tion', 'sion', 'ness', 'ment', 'ship', 'hood', 'er', 'or', 'ist', 'ism', 'ity', 'ty', 'ance', 'ence'];
  for (const ending of nounEndings) {
    if (lowerWord.endsWith(ending) && lowerWord.length > ending.length + 2) {
      return 'noun';
    }
  }
  
  // Capitalized words are likely nouns (proper nouns)
  if (word[0] === word[0].toUpperCase() && word.length > 1) {
    return 'noun';
  }
  
  // Fall back to length-based classification
  if (lowerWord.length <= 4) {
    return 'short';
  } else if (lowerWord.length <= 7) {
    return 'medium';
  } else {
    return 'long';
  }
}

/**
 * Get words from a list that match the same word class
 */
export function getWordsOfSameClass(
  targetWord: string,
  allWords: string[],
  excludeWord: string,
  count: number = 3
): string[] {
  const targetClass = classifyWord(targetWord);
  const matches: string[] = [];
  
  // Filter words that match the target class and aren't the excluded word
  const candidates = allWords.filter(word => {
    const normalized = word.toLowerCase().trim();
    const excludeNormalized = excludeWord.toLowerCase().trim();
    return normalized !== excludeNormalized && classifyWord(word) === targetClass;
  });
  
  // Shuffle candidates
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  
  // Take the requested count
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    matches.push(shuffled[i]);
  }
  
  return matches;
}

/**
 * Generate multiple choice options with word class matching
 * Falls back to random selection if not enough same-class words available
 */
export function generateMultipleChoiceOptions(
  correctAnswer: string,
  allPossibleAnswers: string[],
  count: number = 4
): string[] {
  // Always start with the correct answer
  const options: string[] = [correctAnswer];
  
  if (allPossibleAnswers.length < count - 1) {
    // Not enough wrong options, use what we have + correct answer
    const uniqueWrongAnswers = allPossibleAnswers.filter(
      word => word.toLowerCase().trim() !== correctAnswer.toLowerCase().trim()
    );
    options.push(...uniqueWrongAnswers);
    // Shuffle and return
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  }
  
  
  // Try to get same-class words
  const sameClassWords = getWordsOfSameClass(
    correctAnswer,
    allPossibleAnswers,
    correctAnswer,
    count - 1
  );
  
  options.push(...sameClassWords);
  
  // If we don't have enough same-class words, fill with random words
  if (options.length < count) {
    const remaining = allPossibleAnswers.filter(
      word => !options.includes(word) && word.toLowerCase() !== correctAnswer.toLowerCase()
    );
    
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const needed = count - options.length;
    
    for (let i = 0; i < Math.min(needed, shuffled.length); i++) {
      options.push(shuffled[i]);
    }
  }
  
  // Shuffle all options using Fisher-Yates algorithm for true randomization
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return options;
}
