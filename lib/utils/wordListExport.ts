import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun, HeadingLevel, BorderStyle } from "docx";
import { VocabularyList, VocabCard } from "@/types/game";

/**
 * Generates a Word document from a vocabulary list
 * Tab-separated format: German term, English term, Danish definition
 */
export async function generateWordDocument(list: VocabularyList): Promise<Blob> {
  // Create simple paragraphs with tab-separated values (German, English, Danish)
  const wordParagraphs = list.cards.map(
    (card) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${card.germanTerm || ""}\t${card.term}\t${card.definition}`,
          }),
        ],
        spacing: { after: 0 },
      })
  );

  const doc = new Document({
    sections: [
      {
        children: wordParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Downloads a Word document
 */
export function downloadWordDocument(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies German or English words to clipboard (just the words, no translations)
 * If German terms are available, copies German words. Otherwise, copies English words.
 */
export async function copyGermanEnglishWords(cards: VocabCard[]): Promise<void> {
  // Check if any cards have German terms
  const hasGermanTerms = cards.some((card) => card.germanTerm && card.germanTerm.trim() !== "");
  
  let text: string;
  if (hasGermanTerms) {
    // Copy only German words (one per line)
    text = cards
      .filter((card) => card.germanTerm && card.germanTerm.trim() !== "")
      .map((card) => card.germanTerm)
      .join("\n");
  } else {
    // Fallback: Copy only English words (one per line)
    text = cards
      .map((card) => card.term)
      .join("\n");
  }

  if (text.trim() === "") {
    throw new Error("No words to copy");
  }

  await navigator.clipboard.writeText(text);
}

/**
 * Generates a Word document with only German or English words (no translations)
 * If German terms exist, uses them. Otherwise, uses English terms.
 */
export async function generateGermanEnglishWordDocument(list: VocabularyList): Promise<Blob> {
  // Check if any cards have German terms
  const hasGermanTerms = list.cards.some((card) => card.germanTerm && card.germanTerm.trim() !== "");
  
  // Create simple paragraphs with just the words (one per line)
  const wordParagraphs = list.cards
    .filter((card) => hasGermanTerms ? (card.germanTerm && card.germanTerm.trim() !== "") : true)
    .map((card) =>
      new Paragraph({
        text: hasGermanTerms ? card.germanTerm || "" : card.term,
        spacing: { after: 100 },
      })
    );

  const doc = new Document({
    sections: [
      {
        children: wordParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Copies the entire word list with all fields to clipboard
 */
export async function copyFullWordList(list: VocabularyList): Promise<void> {
  let text = `${list.name}\n`;
  text += `${"=".repeat(list.name.length)}\n\n`;
  
  if (list.description) {
    text += `${list.description}\n\n`;
  }
  
  text += `Total Words: ${list.cards.length}\n`;
  text += `Created: ${new Date(list.createdAt).toLocaleDateString()}\n\n`;
  text += "---\n\n";

  list.cards.forEach((card, index) => {
    text += `${index + 1}. ${card.term}\n`;
    text += `   Danish: ${card.definition}\n`;
    if (card.germanTerm) {
      text += `   German: ${card.germanTerm}\n`;
    }
    text += "\n";
  });

  await navigator.clipboard.writeText(text);
}

/**
 * Generates a student-friendly Word document with vocabulary translations
 * Format: German-Danish if German terms exist, otherwise English-Danish
 */
export async function generateStudentWordList(list: VocabularyList): Promise<Blob> {
  // Check if any cards have German terms
  const hasGermanTerms = list.cards.some((card) => card.germanTerm && card.germanTerm.trim() !== "");
  
  // Create header
  const headerText = hasGermanTerms ? "German → Danish" : "English → Danish";
  const header = new Paragraph({
    text: headerText,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });

  // Create title with list name
  const title = new Paragraph({
    text: list.name,
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  });

  // Create table with two columns
  const tableRows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: hasGermanTerms ? "German" : "English",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Danish",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    // Data rows
    ...list.cards.map(
      (card) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  text: hasGermanTerms ? (card.germanTerm || "") : card.term,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: card.definition,
                }),
              ],
            }),
          ],
        })
    ),
  ];

  const table = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  const doc = new Document({
    sections: [
      {
        children: [header, title, table],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
