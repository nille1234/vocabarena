"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, AlertCircle, CheckCircle2, Trash2, Languages, ClipboardPaste } from "lucide-react";
import { parseWordlist, parsePastedText } from "@/lib/utils/wordlistParser";
import { VocabCard } from "@/types/game";
import { useRouter } from "next/navigation";
import { generateGameCode } from "@/lib/utils/gameLogic";
import { useGameStore } from "@/lib/store/gameStore";
import { GameSession } from "@/types/game";

interface CreateGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGameDialog({ open, onOpenChange }: CreateGameDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSession } = useGameStore();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedCards, setParsedCards] = useState<VocabCard[]>([]);
  const [parseError, setParseError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Game name
  const [gameName, setGameName] = useState("");
  
  // Paste vocabulary
  const [pastedText, setPastedText] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setParseError("");
    setUploadedFile(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      setParsedCards(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || t('createGame.parseError'));
      setParsedCards([]);
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json') && !file.name.endsWith('.docx')) {
      setParseError(t('createGame.supportedFormats'));
      return;
    }

    setIsUploading(true);
    setParseError("");
    setUploadedFile(file);

    const result = await parseWordlist(file);

    if (result.success && result.cards) {
      setParsedCards(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || t('createGame.parseError'));
      setParsedCards([]);
    }

    setIsUploading(false);
  };

  const handlePastedTextChange = (text: string) => {
    setPastedText(text);
    
    if (!text.trim()) {
      setParsedCards([]);
      setParseError("");
      return;
    }
    
    // Parse the pasted text
    const result = parsePastedText(text);
    
    if (result.success && result.cards) {
      setParsedCards(result.cards);
      setParseError("");
    } else {
      setParseError(result.error || "Failed to parse text");
      setParsedCards([]);
    }
  };

  const handleCreateGame = () => {
    if (parsedCards.length === 0) {
      setParseError("Please upload or paste vocabulary first");
      return;
    }

    // Create game session with vocabulary
    const code = generateGameCode();
    const newSession: GameSession = {
      id: `session-${code}`,
      code: code,
      name: gameName.trim() || `Game ${code}`, // Use provided name or default
      mode: 'flashcards',
      status: 'waiting',
      cards: parsedCards,
      settings: {
        cardCount: parsedCards.length,
        allowHints: true,
        playMusic: true,
        playSFX: true,
      },
    };
    
    setSession(newSession);
    
    // Reset form and navigate
    resetForm();
    onOpenChange(false);
    router.push(`/lobby/${code}`);
  };

  const resetForm = () => {
    setUploadedFile(null);
    setParsedCards([]);
    setParseError("");
    setPastedText("");
    setGameName("");
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedCards([]);
    setParseError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Create New Game</DialogTitle>
          <DialogDescription>
            Upload or paste your vocabulary to create a game session
          </DialogDescription>
        </DialogHeader>

        {/* Game Name Input */}
        <div className="space-y-2">
          <Label htmlFor="gameName">Game Name (Optional)</Label>
          <Input
            id="gameName"
            placeholder="e.g., Year 7 - Body Parts, Medical Vocabulary"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="text-base"
          />
          <p className="text-xs text-muted-foreground">
            Give your game a memorable name to find it easily later
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "paste")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="paste">
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Paste Text
              </TabsTrigger>
            </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-4">

              <div className="space-y-2">
                <Label>{t('createGame.uploadFile')}</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onDragOver={handleDragOver}
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
                    {t('createGame.dropFile')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('createGame.supportedFormats')}
                  </p>
                </div>
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
                    {t('createGame.successParsed')} {parsedCards.length} {t('createGame.vocabCards')}
                  </AlertDescription>
                </Alert>
              )}

              {parsedCards.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('createGame.preview')}</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parsedCards.slice(0, 5).map((card, index) => (
                      <Card key={index} className="border-border/50">
                        <CardContent className="pt-4 pb-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t('createGame.term')}:</span>{" "}
                              <span className="font-medium">{card.term}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('createGame.definition')}:</span>{" "}
                              <span className="font-medium">{card.definition}</span>
                            </div>
                            {card.germanTerm && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">{t('createGame.german')}:</span>{" "}
                                <span className="font-medium">{card.germanTerm}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>{t('createGame.csvFormat')}</strong> {t('createGame.csvFormatDesc')}
                  <br />
                  <strong>{t('createGame.jsonFormat')}</strong> {t('createGame.jsonFormatDesc')}
                  <br />
                  <strong>{t('createGame.docxFormat')}</strong> {t('createGame.docxFormatDesc')}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paste Vocabulary</Label>
                <Textarea
                  placeholder="Paste your vocabulary here. Format: Term - Definition (one per line)
Example:
haus - hus  (or haus-hus)
katze - kat
hund - hund"
                  value={pastedText}
                  onChange={(e) => handlePastedTextChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Supported separators: - (hyphen with or without spaces), → (arrow), -&gt;, =&gt;, : (colon), | (pipe), or tab
                </p>
              </div>

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
                    {t('createGame.successParsed')} {parsedCards.length} {t('createGame.vocabCards')}
                  </AlertDescription>
                </Alert>
              )}

              {parsedCards.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('createGame.preview')}</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parsedCards.slice(0, 5).map((card, index) => (
                      <Card key={index} className="border-border/50">
                        <CardContent className="pt-4 pb-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t('createGame.term')}:</span>{" "}
                              <span className="font-medium">{card.term}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('createGame.definition')}:</span>{" "}
                              <span className="font-medium">{card.definition}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Simple Format:</strong> One pair per line with separator (Term - Definition)
                  <br />
                  <strong>CSV Format:</strong> term,definition,germanTerm (with header row)
                  <br />
                  <strong>Example:</strong>
                  <br />
                  haus - hus
                  <br />
                  katze - kat
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateGame} disabled={isUploading || parsedCards.length === 0}>
            Create Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
