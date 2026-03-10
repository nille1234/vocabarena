"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, ClipboardPaste } from "lucide-react";
import { VocabCard } from "@/types/game";
import { parsePastedText } from "@/lib/utils/wordlistParser";
import { VocabularyFileUpload } from "./VocabularyFileUpload";

interface NewVocabularyTabProps {
  vocabListName: string;
  onVocabListNameChange: (name: string) => void;
  vocabListDescription: string;
  onVocabListDescriptionChange: (description: string) => void;
  vocabListLanguage: 'english' | 'german';
  onVocabListLanguageChange: (language: 'english' | 'german') => void;
  parsedCards: VocabCard[];
  onParsedCardsChange: (cards: VocabCard[]) => void;
}

export function NewVocabularyTab({
  vocabListName,
  onVocabListNameChange,
  vocabListDescription,
  onVocabListDescriptionChange,
  vocabListLanguage,
  onVocabListLanguageChange,
  parsedCards,
  onParsedCardsChange,
}: NewVocabularyTabProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const handlePastedTextChange = (text: string) => {
    setPastedText(text);
    
    if (!text.trim()) {
      onParsedCardsChange([]);
      setParseError("");
      return;
    }
    
    const result = parsePastedText(text);
    
    if (result.success && result.cards) {
      onParsedCardsChange(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || "Failed to parse text");
      onParsedCardsChange([]);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="vocabListName">Vocabulary List Name *</Label>
        <Input
          id="vocabListName"
          placeholder="e.g., Medical Vocabulary - Week 5"
          value={vocabListName}
          onChange={(e) => onVocabListNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vocabListDescription">Description (Optional)</Label>
        <Textarea
          id="vocabListDescription"
          placeholder="Brief description of this vocabulary list"
          value={vocabListDescription}
          onChange={(e) => onVocabListDescriptionChange(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vocabListLanguage">Crossword Answer Language *</Label>
        <Select value={vocabListLanguage} onValueChange={(v) => onVocabListLanguageChange(v as 'english' | 'german')}>
          <SelectTrigger id="vocabListLanguage">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="german">German</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Language for crossword answers (clues will be in the same language)
        </p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="paste">
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4 mt-4">
          <VocabularyFileUpload
            uploadedFile={uploadedFile}
            onFileChange={setUploadedFile}
            onCardsChange={onParsedCardsChange}
            onErrorChange={setParseError}
            onUploadingChange={setIsUploading}
          />
        </TabsContent>

        <TabsContent value="paste" className="space-y-4 mt-4">
          <Textarea
            placeholder="Paste your vocabulary here. Format: Term - Definition (one per line)"
            value={pastedText}
            onChange={(e) => handlePastedTextChange(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </TabsContent>
      </Tabs>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {parsedCards.length > 0 && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Successfully parsed {parsedCards.length} vocabulary cards
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
