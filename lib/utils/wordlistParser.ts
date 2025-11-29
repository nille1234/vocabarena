import { VocabCard } from '@/types/game';
import mammoth from 'mammoth';

export interface ParseResult {
  success: boolean;
  cards?: VocabCard[];
  error?: string;
}

export function parseCSV(content: string): ParseResult {
  try {
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      return { success: false, error: 'CSV file must contain at least a header row and one data row' };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const termIndex = header.indexOf('term');
    const definitionIndex = header.indexOf('definition');
    const germanTermIndex = header.indexOf('germanterm');

    if (termIndex === -1 || definitionIndex === -1) {
      return { success: false, error: 'CSV must contain "term" and "definition" columns' };
    }

    const cards: VocabCard[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 2) continue;

      const card: VocabCard = {
        id: `custom-${i}`,
        term: values[termIndex] || '',
        definition: values[definitionIndex] || '',
        orderIndex: i,
      };

      if (germanTermIndex !== -1 && values[germanTermIndex]) {
        card.germanTerm = values[germanTermIndex];
      }

      if (card.term && card.definition) {
        cards.push(card);
      }
    }

    if (cards.length === 0) {
      return { success: false, error: 'No valid vocabulary cards found in CSV' };
    }

    return { success: true, cards };
  } catch (error) {
    return { success: false, error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return { success: false, error: 'JSON must be an array of vocabulary cards' };
    }

    const cards: VocabCard[] = data.map((item, index) => {
      if (!item.term || !item.definition) {
        throw new Error(`Card at index ${index} is missing required fields (term, definition)`);
      }

      return {
        id: item.id || `custom-${index + 1}`,
        term: item.term,
        definition: item.definition,
        germanTerm: item.germanTerm,
        synonyms: item.synonyms,
        audioUrl: item.audioUrl,
        orderIndex: item.orderIndex || index + 1,
      };
    });

    if (cards.length === 0) {
      return { success: false, error: 'No valid vocabulary cards found in JSON' };
    }

    return { success: true, cards };
  } catch (error) {
    return { success: false, error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function parseDOCX(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { success: false, error: 'No content found in Word document' };
    }

    const cards: VocabCard[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Support multiple separators: – (en dash), - (hyphen with/without spaces), →, ->, =>, :
      // Order matters: try more specific patterns first (with spaces) before simple hyphen
      const separators = [' – ', ' - ', '->', '=>', '→', ':', ' -', '- ', '-'];
      let separator = '';
      let parts: string[] = [];
      
      for (const sep of separators) {
        if (line.includes(sep)) {
          separator = sep;
          // Split only on the first occurrence to handle cases where definition might contain the separator
          const index = line.indexOf(sep);
          if (index !== -1) {
            parts = [
              line.substring(0, index).trim(),
              line.substring(index + sep.length).trim()
            ];
          }
          break;
        }
      }
      
      if (parts.length < 2) {
        continue; // Skip lines that don't have the expected format
      }
      
      const term = parts[0];
      const definition = parts[1];
      
      if (term && definition) {
        cards.push({
          id: `custom-${i + 1}`,
          term,
          definition,
          orderIndex: i + 1,
        });
      }
    }
    
    if (cards.length === 0) {
      return { success: false, error: 'No valid vocabulary pairs found. Expected format: Term → Definition (one per line)' };
    }
    
    return { success: true, cards };
  } catch (error) {
    return { success: false, error: `Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function parsePastedText(content: string): ParseResult {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Please paste some vocabulary content' };
    }

    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { success: false, error: 'No content found' };
    }

    const cards: VocabCard[] = [];
    
    // Check if it looks like CSV format (has commas in first line)
    if (lines[0].includes(',') && lines[0].split(',').length >= 2) {
      // Try parsing as CSV
      const csvResult = parseCSV(content);
      if (csvResult.success) {
        return csvResult;
      }
    }
    
    // Otherwise, parse as simple line format with separators
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip if it looks like a header
      if (i === 0 && (line.toLowerCase().includes('term') || line.toLowerCase().includes('word'))) {
        continue;
      }
      
      // Support multiple separators: – (en dash), - (hyphen with/without spaces), →, ->, =>, :, |, tab
      // Order matters: try more specific patterns first (with spaces) before simple hyphen
      const separators = [' – ', ' - ', '->', '=>', '→', ':', ' -', '- ', '-', '|', '\t'];
      let separator = '';
      let parts: string[] = [];
      
      for (const sep of separators) {
        if (line.includes(sep)) {
          separator = sep;
          // Split only on the first occurrence to handle cases where definition might contain the separator
          const index = line.indexOf(sep);
          if (index !== -1) {
            parts = [
              line.substring(0, index).trim(),
              line.substring(index + sep.length).trim()
            ];
          }
          break;
        }
      }
      
      if (parts.length < 2) {
        continue; // Skip lines that don't have the expected format
      }
      
      const term = parts[0];
      const definition = parts[1];
      
      if (term && definition) {
        cards.push({
          id: `custom-${i + 1}`,
          term,
          definition,
          orderIndex: i + 1,
        });
      }
    }
    
    if (cards.length === 0) {
      return { success: false, error: 'No valid vocabulary pairs found. Expected format: Term → Definition (one per line)' };
    }
    
    return { success: true, cards };
  } catch (error) {
    return { success: false, error: `Failed to parse text: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export function parseWordlist(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    if (file.name.endsWith('.docx')) {
      // Handle .docx files separately
      parseDOCX(file).then(resolve);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        resolve(parseCSV(content));
      } else if (file.name.endsWith('.json')) {
        resolve(parseJSON(content));
      } else {
        resolve({ success: false, error: 'Unsupported file format. Please use .csv, .json, or .docx files' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };

    reader.readAsText(file);
  });
}
