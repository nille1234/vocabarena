import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface VocabWord {
  term: string;
  definition: string;
  germanTerm?: string;
}

/**
 * Detect the language of the vocabulary terms (English or German)
 */
function detectLanguage(vocabulary: VocabWord[]): 'English' | 'German' {
  // Check all terms, not just first 5
  const allTerms = vocabulary.map(v => v.term.toLowerCase()).join(' ');
  
  console.log('Language Detection Debug:', {
    sampleTerms: vocabulary.slice(0, 3).map(v => v.term),
    allTermsLength: allTerms.length
  });
  
  // German indicators - special characters
  const germanChars = ['ü', 'ö', 'ä', 'ß'];
  const hasGermanChars = germanChars.some(char => allTerms.includes(char));
  
  if (hasGermanChars) {
    console.log('Detected German via special characters');
    return 'German';
  }
  
  // Check for common German words and patterns
  const germanWords = ['der', 'die', 'das', 'und', 'ein', 'eine', 'ist', 'sind', 'nicht', 'auch', 'auf', 'für', 'mit', 'von', 'zu'];
  const germanWordCount = germanWords.filter(word => {
    // Use word boundaries to avoid false matches
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(allTerms);
  }).length;
  
  console.log('German word count:', germanWordCount);
  
  if (germanWordCount >= 2) {
    console.log('Detected German via common words');
    return 'German';
  }
  
  // Default to English
  console.log('Defaulting to English');
  return 'English';
}

export async function POST(request: NextRequest) {
  try {
    const { vocabulary, summaryLength } = await request.json();

    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
      return NextResponse.json(
        { error: 'Vocabulary array is required' },
        { status: 400 }
      );
    }

    // Auto-detect language from vocabulary terms
    const detectedLanguage = detectLanguage(vocabulary);

    // Create a prompt for generating a coherent summary
    const vocabList = vocabulary
      .map((v: VocabWord) => `- ${v.term} (${v.definition})`)
      .join('\n');

    const targetWords = summaryLength || 250;
    const lang = detectedLanguage;

    const prompt = `You are creating a gap-fill reading comprehension exercise for language learners. Write a coherent, natural-sounding text in ${lang} that incorporates the vocabulary words below.

Vocabulary words to include (with their meanings for context):
${vocabList}

INSTRUCTIONS:
1. Choose a topic or theme that naturally connects these vocabulary words
2. Write a flowing, coherent text of approximately ${targetWords} words in ${lang}
3. Use EACH vocabulary word from the list EXACTLY ONCE in a grammatically correct and contextually appropriate way
4. The text should read naturally - like a real article, story, or description
5. Focus on creating meaningful sentences where the vocabulary words fit logically
6. Do NOT force words into unnatural contexts
7. Do NOT write about the vocabulary words themselves
8. Do NOT add translations or explanations
9. Write ONLY in ${lang}

QUALITY CHECKLIST before submitting:
✓ Does the text have a clear topic/theme?
✓ Do all sentences flow naturally?
✓ Is each vocabulary word used in a contextually appropriate way?
✓ Would a native speaker find this text natural and coherent?
✓ Have you used EVERY vocabulary word from the list exactly once?

Write the text now:`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ${lang} language teacher creating engaging reading comprehension exercises. Create natural, flowing text that incorporates vocabulary words seamlessly.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: targetWords * 2, // Allow some buffer
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate summary from AI service' },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    const summary = data.choices[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json(
        { error: 'No summary generated' },
        { status: 500 }
      );
    }

    // Post-process to ensure each word appears exactly once
    let processedSummary = summary;
    const usedWords = new Set<string>();
    const missingWords: string[] = [];
    
    // First pass: Check which words are present and remove duplicates
    vocabulary.forEach((v: VocabWord) => {
      const term = v.term;
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = processedSummary.match(regex);
      
      if (!matches || matches.length === 0) {
        missingWords.push(term);
      } else if (matches.length > 1) {
        // Word appears multiple times - keep only the first occurrence
        console.log(`Removing duplicate occurrences of: ${term}`);
        let firstOccurrence = true;
        processedSummary = processedSummary.replace(regex, (match: string) => {
          if (firstOccurrence) {
            firstOccurrence = false;
            usedWords.add(term);
            return match; // Keep first occurrence
          }
          // Replace subsequent occurrences with a generic word
          return lang === 'German' ? 'etwas' : 'something';
        });
      } else {
        usedWords.add(term);
      }
    });

    // Second pass: Add missing words to the end of the text
    if (missingWords.length > 0) {
      console.log(`Adding missing words to text: ${missingWords.join(', ')}`);
      const additionalSentences = missingWords.map(word => {
        const vocabItem = vocabulary.find(v => v.term === word);
        if (lang === 'German') {
          return `Außerdem ist ${word} wichtig.`;
        } else {
          return `Additionally, ${word} is important.`;
        }
      }).join(' ');
      
      processedSummary = processedSummary + ' ' + additionalSentences;
    }

    console.log(`✅ Processed summary: ${vocabulary.length} words, each appearing exactly once`);

    return NextResponse.json({ 
      summary: processedSummary,
      wordsUsed: vocabulary.length,
      totalWords: vocabulary.length
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
