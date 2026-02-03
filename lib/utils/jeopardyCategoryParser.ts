/**
 * Parse ChatGPT-formatted category text into category assignments
 * 
 * Expected format:
 * Category 1: Thinking & Understanding
 * comprehend
 * conceive
 * grasp
 * 
 * Category 2: Expression & Communication
 * articulate
 * emphasise
 */

interface CategoryAssignment {
  [term: string]: string; // term -> category name
}

export function parseCategoryText(text: string, availableTerms: string[]): CategoryAssignment {
  const assignments: CategoryAssignment = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentCategory = '';
  
  for (const line of lines) {
    // Check if this is a category header
    // Formats: "Category 1: Name", "Category Name:", "Name:", or just "Name"
    const categoryMatch = line.match(/^(?:Category\s+\d+:\s*)?(.+?):\s*$/i) || 
                         line.match(/^(?:Category\s+\d+:\s*)?(.+)$/i);
    
    if (categoryMatch && !availableTerms.some(term => 
      term.toLowerCase() === line.toLowerCase()
    )) {
      // This looks like a category header
      currentCategory = categoryMatch[1].replace(/^Category\s+\d+:\s*/i, '').trim();
      continue;
    }
    
    // This is a word - assign it to current category
    if (currentCategory) {
      // Find matching term (case-insensitive)
      const matchingTerm = availableTerms.find(
        term => term.toLowerCase() === line.toLowerCase()
      );
      
      if (matchingTerm) {
        assignments[matchingTerm] = currentCategory;
      }
    }
  }
  
  return assignments;
}

/**
 * Validate that category assignments are suitable for Jeopardy
 * Returns error message if invalid, null if valid
 */
export function validateCategoryAssignments(
  assignments: CategoryAssignment,
  totalWords: number
): string | null {
  const categories = new Map<string, number>();
  
  // Count words per category
  for (const category of Object.values(assignments)) {
    categories.set(category, (categories.get(category) || 0) + 1);
  }
  
  // Check we have exactly 5 categories
  if (categories.size !== 5) {
    return `Need exactly 5 categories, found ${categories.size}`;
  }
  
  // Check each category has at least 3 words
  for (const [category, count] of Array.from(categories.entries())) {
    if (count < 3) {
      return `Category "${category}" has only ${count} words (minimum 3 required)`;
    }
  }
  
  // Check we've assigned enough words
  const assignedCount = Object.keys(assignments).length;
  if (assignedCount < Math.min(25, totalWords)) {
    return `Only ${assignedCount} words assigned (need at least ${Math.min(25, totalWords)})`;
  }
  
  return null;
}
