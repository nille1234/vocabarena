import { VocabCard } from '@/types/game';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';

export async function exportVocabularyToWord(
  vocabulary: VocabCard[],
  gameCode: string,
  gameMode: string
): Promise<void> {
  // Create table rows for vocabulary
  const tableRows = [
    // Header row
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'English', bold: true })] })],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Danish', bold: true })] })],
          width: { size: 50, type: WidthType.PERCENTAGE },
        }),
      ],
    }),
    // Data rows
    ...vocabulary.map(
      (card) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(card.term)],
            }),
            new TableCell({
              children: [new Paragraph(card.definition)],
            }),
          ],
        })
    ),
  ];

  // Create the document
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Vocabulary - Game ${gameCode}`,
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Game Mode: ${gameMode}`,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total Words: ${vocabulary.length}`,
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Table({
            rows: tableRows,
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      },
    ],
  });

  // Generate and download the file
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vocabulary-${gameCode}-${Date.now()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
