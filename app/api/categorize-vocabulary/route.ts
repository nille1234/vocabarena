import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VocabularyWord {
  term: string;
  definition: string;
}

interface CategoryAssignment {
  [term: string]: string; // term -> category name
}

export async function POST(request: NextRequest) {
  try {
    const { words } = await request.json() as { words: VocabularyWord[] };

    if (!words || words.length < 25) {
      return NextResponse.json(
        { error: 'At least 25 words are required for Jeopardy categorization' },
        { status: 400 }
      );
    }

    // Create a formatted list of words for the AI - only show terms for language detection
    const termsList = words.map(w => w.term).join(', ');
    const wordList = words.map(w => `${w.term}: ${w.definition}`).join('\n');

    const prompt = `You are organizing vocabulary words for a Jeopardy-style game. Create exactly 5 thematic categories that group these words meaningfully.

CRITICAL LANGUAGE DETECTION: 
Look at these vocabulary TERMS ONLY to detect the language: ${termsList}

Create category names in the SAME language as these terms:
- If terms are in English, use simple English category names (e.g., "Thinking", "Communication", "Travel", "Food", "Nature")
- If terms are in German, use simple German category names (e.g., "Denken", "Kommunikation", "Reisen", "Essen", "Natur")
- If terms are in Danish, use simple Danish category names (e.g., "Tænkning", "Kommunikation", "Rejser", "Mad", "Natur")
- IGNORE the definitions/translations when detecting language - only look at the terms!

Requirements:
- Create exactly 5 SINGLE-WORD category names that are simple and clear
- Each category name should be ONE WORD ONLY (no phrases like "Understanding & Insight")
- Each category MUST have at least 5 words (preferably 5-6 words per category)
- Distribute ALL words evenly across the 5 categories
- Try to balance the categories so each has roughly the same number of words
- Category names should be broad thematic concepts
- Avoid generic names like "Short" or "Easy"
- USE THE SAME LANGUAGE AS THE TERMS (not the definitions)

Vocabulary words (${words.length} total):
${wordList}

Return your response in this exact JSON format:
{
  "categories": {
    "CategoryName1": ["word1", "word2", "word3", "word4", "word5"],
    "CategoryName2": ["word6", "word7", "word8", "word9", "word10"],
    ...
  }
}

CRITICAL: 
- Each category name must be a SINGLE WORD
- Ensure each category has at least 5 words
- Only return the JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that organizes vocabulary words into thematic categories for educational games. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(responseText);
    
    // Convert to term -> category mapping
    const assignments: CategoryAssignment = {};
    
    for (const [categoryName, terms] of Object.entries(result.categories)) {
      const termArray = terms as string[];
      for (const term of termArray) {
        // Find the matching word (case-insensitive)
        const matchingWord = words.find(
          w => w.term.toLowerCase() === term.toLowerCase()
        );
        if (matchingWord) {
          assignments[matchingWord.term] = categoryName;
        }
      }
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error categorizing vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to categorize vocabulary' },
      { status: 500 }
    );
  }
}
