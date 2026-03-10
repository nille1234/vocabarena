"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Trash2 } from "lucide-react";
import { parseWordlist } from "@/lib/utils/wordlistParser";
import { VocabCard } from "@/types/game";

interface VocabularyFileUploadProps {
  uploadedFile: File | null;
  onFileChange: (file: File | null) => void;
  onCardsChange: (cards: VocabCard[]) => void;
  onErrorChange: (error: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

export function VocabularyFileUpload({
  uploadedFile,
  onFileChange,
  onCardsChange,
  onErrorChange,
  onUploadingChange,
}: VocabularyFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onUploadingChange(true);
    onErrorChange("");
    onFileChange(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      onCardsChange(result.cards);
      onErrorChange("");
    } else {
      onErrorChange(result.error || 'Failed to parse file');
      onCardsChange([]);
    }

    onUploadingChange(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json') && !file.name.endsWith('.docx')) {
      onErrorChange('Supported formats: .csv, .json, .docx');
      return;
    }

    onUploadingChange(true);
    onErrorChange("");
    onFileChange(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      onCardsChange(result.cards);
      onErrorChange("");
    } else {
      onErrorChange(result.error || 'Failed to parse file');
      onCardsChange([]);
    }

    onUploadingChange(false);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    onCardsChange([]);
    onErrorChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Drop file here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supported: .csv, .json, .docx
        </p>
      </div>

      {uploadedFile && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
