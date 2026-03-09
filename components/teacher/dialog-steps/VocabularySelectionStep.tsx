"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ClipboardPaste,
  Search
} from "lucide-react";
import { parseWordlist, parsePastedText } from "@/lib/utils/wordlistParser";
import { VocabCard, VocabularyList } from "@/types/game";
import { getAllVocabularyLists, getVocabularyListCards } from "@/lib/supabase/vocabularyManagement";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface VocabularySelectionStepProps {
  vocabSource: 'new' | 'existing';
  onVocabSourceChange: (source: 'new' | 'existing') => void;
  
  // New vocabulary props
  vocabListName: string;
  onVocabListNameChange: (name: string) => void;
  vocabListDescription: string;
  onVocabListDescriptionChange: (description: string) => void;
  vocabListLanguage: 'english' | 'german';
  onVocabListLanguageChange: (language: 'english' | 'german') => void;
  parsedCards: VocabCard[];
  onParsedCardsChange: (cards: VocabCard[]) => void;
  
  // Existing vocabulary props
  selectedListId: string;
  onSelectedListIdChange: (id: string) => void;
  existingLists: VocabularyList[];
  onExistingListsChange: (lists: VocabularyList[]) => void;
  filterToListIds?: string[];
}

export function VocabularySelectionStep({
  vocabSource,
  onVocabSourceChange,
  vocabListName,
  onVocabListNameChange,
  vocabListDescription,
  onVocabListDescriptionChange,
  vocabListLanguage,
  onVocabListLanguageChange,
  parsedCards,
  onParsedCardsChange,
  selectedListId,
  onSelectedListIdChange,
  existingLists,
  onExistingListsChange,
  filterToListIds,
}: VocabularySelectionStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  useEffect(() => {
    if (vocabSource === 'existing') {
      loadExistingLists();
    }
  }, [vocabSource]);

  const loadExistingLists = async () => {
    setLoadingLists(true);
    try {
      const lists = await getAllVocabularyLists();
      onExistingListsChange(lists);
    } catch (error) {
      console.error('Error loading vocabulary lists:', error);
      toast.error('Failed to load vocabulary lists');
    } finally {
      setLoadingLists(false);
    }
  };

  const handleListToggle = (listId: string) => {
    setSelectedListIds(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const handleLoadSelectedLists = async () => {
    if (selectedListIds.length === 0) {
      toast.error('Please select at least one vocabulary list');
      return;
    }

    setIsLoadingWords(true);
    try {
      // Fetch full card data from all selected lists
      const allCards: VocabCard[] = [];
      for (const listId of selectedListIds) {
        const cards = await getVocabularyListCards(listId);
        allCards.push(...cards);
      }

      // Remove duplicates based on term (case-insensitive)
      const uniqueCardsMap = new Map<string, VocabCard>();
      allCards.forEach(card => {
        const key = card.term.trim().toLowerCase();
        if (!uniqueCardsMap.has(key)) {
          uniqueCardsMap.set(key, card);
        }
      });
      
      const uniqueCards = Array.from(uniqueCardsMap.values());
      
      // Randomize order
      const shuffled = uniqueCards.sort(() => Math.random() - 0.5);
      
      // Re-index the cards
      const reindexedCards: VocabCard[] = shuffled.map((card, index) => ({
        ...card,
        id: `temp-${index}`,
        orderIndex: index,
      }));

      onParsedCardsChange(reindexedCards);
      
      // Create pasted text format for display
      const pastedTextFormat = reindexedCards
        .map(card => `${card.term} - ${card.definition}`)
        .join('\n');
      setPastedText(pastedTextFormat);
      
      // Switch to the "Upload New" tab to show the combined words
      onVocabSourceChange('new');
      
      toast.success(`Loaded ${uniqueCards.length} unique words from ${selectedListIds.length} list(s)`);
    } catch (error) {
      console.error('Error loading vocabulary lists:', error);
      toast.error('Failed to load vocabulary lists');
    } finally {
      setIsLoadingWords(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedListIds([]);
  };

  // Apply class filter first, then search filter
  const filteredLists = existingLists
    .filter(list => {
      // If filterToListIds is provided, only show those lists
      if (filterToListIds && filterToListIds.length > 0) {
        return filterToListIds.includes(list.id);
      }
      return true;
    })
    .filter(list =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setParseError("");
    setUploadedFile(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      onParsedCardsChange(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || 'Failed to parse file');
      onParsedCardsChange([]);
    }

    setIsUploading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json') && !file.name.endsWith('.docx')) {
      setParseError('Supported formats: .csv, .json, .docx');
      return;
    }

    setIsUploading(true);
    setParseError("");
    setUploadedFile(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      onParsedCardsChange(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || 'Failed to parse file');
      onParsedCardsChange([]);
    }

    setIsUploading(false);
  };

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

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onParsedCardsChange([]);
    setParseError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={vocabSource} onValueChange={(v) => onVocabSourceChange(v as 'new' | 'existing')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Upload New</TabsTrigger>
          <TabsTrigger value="existing">Use Existing</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="existing" className="space-y-4 mt-4">
          {filterToListIds && filterToListIds.length > 0 && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                Showing {filteredLists.length} vocabulary list{filteredLists.length !== 1 ? 's' : ''} from this class
              </AlertDescription>
            </Alert>
          )}
          
          {loadingLists ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading vocabulary lists...</p>
            </div>
          ) : existingLists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vocabulary lists found. Create one first!</p>
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vocabulary lists match your search.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vocabulary lists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {selectedListIds.length > 0 && (
                  <Alert className="border-primary/50 bg-primary/5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>
                        {selectedListIds.length} list{selectedListIds.length !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearSelection}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleLoadSelectedLists}
                          disabled={isLoadingWords}
                        >
                          {isLoadingWords ? 'Loading...' : 'Load Selected Lists'}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-2">
                  {filteredLists.map((list) => (
                    <Card
                      key={list.id}
                      className={`cursor-pointer transition-all ${
                        selectedListIds.includes(list.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleListToggle(list.id)}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedListIds.includes(list.id)}
                            onCheckedChange={() => handleListToggle(list.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{list.name}</h4>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {list.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{list.cards.length} words</span>
                              {list.language && (
                                <span className="capitalize">{list.language}</span>
                              )}
                              <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
