"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VocabCard, GameMode, VocabularyList } from "@/types/game";
import { useRouter } from "next/navigation";
import { generateGameCode } from "@/lib/utils/gameLogic";
import { 
  createVocabularyList, 
  createGameLink 
} from "@/lib/supabase/vocabularyManagement";
import { toast } from "sonner";
import { StepIndicator } from "./dialog-steps/StepIndicator";
import { VocabularySelectionStep } from "./dialog-steps/VocabularySelectionStep";
import { GameSelectionStep } from "./dialog-steps/GameSelectionStep";
import { LinkConfigurationStep } from "./dialog-steps/LinkConfigurationStep";

interface CreateGameLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateGameLinkDialog({ open, onOpenChange, onSuccess }: CreateGameLinkDialogProps) {
  const router = useRouter();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<'vocabulary' | 'games' | 'link'>('vocabulary');
  
  // Vocabulary selection
  const [vocabSource, setVocabSource] = useState<'new' | 'existing'>('new');
  const [parsedCards, setParsedCards] = useState<VocabCard[]>([]);
  const [vocabListName, setVocabListName] = useState("");
  const [vocabListDescription, setVocabListDescription] = useState("");
  const [vocabListLanguage, setVocabListLanguage] = useState<'english' | 'german'>('english');
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [existingLists, setExistingLists] = useState<VocabularyList[]>([]);
  
  // Game selection
  const [selectedGames, setSelectedGames] = useState<GameMode[]>([]);
  const [crosswordWordCount, setCrosswordWordCount] = useState(10);
  const [wordSearchWordCount, setWordSearchWordCount] = useState(10);
  const [wordSearchShowList, setWordSearchShowList] = useState(true);
  const [othelloAnswerMode, setOthelloAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  const [ticTacToeAnswerMode, setTicTacToeAnswerMode] = useState<'text-input' | 'multiple-choice'>('text-input');
  
  // Link details
  const [linkName, setLinkName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  
  // Processing
  const [isCreating, setIsCreating] = useState(false);

  const handleNextStep = () => {
    if (currentStep === 'vocabulary') {
      // Validate vocabulary selection
      if (vocabSource === 'new') {
        if (parsedCards.length === 0) {
          toast.error('Please upload or paste vocabulary first');
          return;
        }
        if (!vocabListName.trim()) {
          toast.error('Please enter a name for the vocabulary list');
          return;
        }
      } else {
        if (!selectedListId) {
          toast.error('Please select a vocabulary list');
          return;
        }
      }
      setCurrentStep('games');
    } else if (currentStep === 'games') {
      if (selectedGames.length === 0) {
        toast.error('Please select at least one game');
        return;
      }
      setCurrentStep('link');
    }
  };

  const handleCreateLink = async () => {
    if (!linkName.trim()) {
      toast.error('Please enter a name for the game link');
      return;
    }

    setIsCreating(true);
    try {
      let listId = selectedListId;

      // If creating new vocabulary, save it first
      if (vocabSource === 'new') {
        const result = await createVocabularyList(
          vocabListName,
          parsedCards,
          vocabListDescription,
          vocabListLanguage
        );

        if (!result.success || !result.listId) {
          // Check if it's an authentication error
          if (result.error?.includes('JWT') || result.error?.includes('auth')) {
            throw new Error('Authentication error. Please refresh the page and try again.');
          }
          throw new Error(result.error || 'Failed to create vocabulary list');
        }

        listId = result.listId;
      }

      // Generate game code
      const code = generateGameCode();
      setGeneratedCode(code);

      // Create game link with game-specific settings
      const linkResult = await createGameLink(
        linkName,
        code,
        listId,
        selectedGames,
        selectedGames.includes('crossword') ? crosswordWordCount : undefined,
        othelloAnswerMode,
        ticTacToeAnswerMode,
        selectedGames.includes('word-search') ? wordSearchWordCount : undefined,
        selectedGames.includes('word-search') ? wordSearchShowList : undefined
      );

      if (!linkResult.success) {
        // Check if it's an authentication error
        if (linkResult.error?.includes('JWT') || linkResult.error?.includes('auth')) {
          throw new Error('Authentication error. Please refresh the page and try again.');
        }
        throw new Error(linkResult.error || 'Failed to create game link');
      }

      // Generate shareable link with full URL
      const link = `${window.location.origin}/play/${code}`;
      setGeneratedLink(link);

      toast.success('Game link created successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating game link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create game link');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('vocabulary');
    setVocabSource('new');
    setParsedCards([]);
    setVocabListName("");
    setVocabListDescription("");
    setVocabListLanguage('english');
    setSelectedListId("");
    setSelectedGames([]);
    setCrosswordWordCount(10);
    setWordSearchWordCount(10);
    setWordSearchShowList(true);
    setOthelloAnswerMode('text-input');
    setTicTacToeAnswerMode('text-input');
    setLinkName("");
    setGeneratedCode("");
    setGeneratedLink("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Get vocabulary name and word count for summary
  const getVocabularyName = () => {
    if (vocabSource === 'new') {
      return vocabListName;
    } else {
      return existingLists.find(l => l.id === selectedListId)?.name || '';
    }
  };

  const getWordCount = () => {
    if (vocabSource === 'new') {
      return parsedCards.length;
    } else {
      return existingLists.find(l => l.id === selectedListId)?.cards.length || 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Create Game Link</DialogTitle>
          <DialogDescription>
            {currentStep === 'vocabulary' && 'Choose or upload vocabulary'}
            {currentStep === 'games' && 'Select games for students'}
            {currentStep === 'link' && 'Configure and generate link'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step 1: Vocabulary Selection */}
        {currentStep === 'vocabulary' && (
          <VocabularySelectionStep
            vocabSource={vocabSource}
            onVocabSourceChange={setVocabSource}
            vocabListName={vocabListName}
            onVocabListNameChange={setVocabListName}
            vocabListDescription={vocabListDescription}
            onVocabListDescriptionChange={setVocabListDescription}
            vocabListLanguage={vocabListLanguage}
            onVocabListLanguageChange={setVocabListLanguage}
            parsedCards={parsedCards}
            onParsedCardsChange={setParsedCards}
            selectedListId={selectedListId}
            onSelectedListIdChange={setSelectedListId}
          />
        )}

        {/* Step 2: Game Selection */}
        {currentStep === 'games' && (
          <GameSelectionStep
            selectedGames={selectedGames}
            onSelectedGamesChange={setSelectedGames}
            crosswordWordCount={crosswordWordCount}
            onCrosswordWordCountChange={setCrosswordWordCount}
            wordSearchWordCount={wordSearchWordCount}
            onWordSearchWordCountChange={setWordSearchWordCount}
            wordSearchShowList={wordSearchShowList}
            onWordSearchShowListChange={setWordSearchShowList}
            othelloAnswerMode={othelloAnswerMode}
            onOthelloAnswerModeChange={setOthelloAnswerMode}
            ticTacToeAnswerMode={ticTacToeAnswerMode}
            onTicTacToeAnswerModeChange={setTicTacToeAnswerMode}
          />
        )}

        {/* Step 3: Link Configuration */}
        {currentStep === 'link' && (
          <LinkConfigurationStep
            linkName={linkName}
            onLinkNameChange={setLinkName}
            generatedCode={generatedCode}
            generatedLink={generatedLink}
            vocabularyName={getVocabularyName()}
            wordCount={getWordCount()}
            selectedGamesCount={selectedGames.length}
          />
        )}

        <DialogFooter className="flex gap-2">
          {currentStep !== 'vocabulary' && !generatedLink && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep === 'games' ? 'vocabulary' : 'games')}
            >
              Back
            </Button>
          )}
          
          {generatedLink ? (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          ) : currentStep === 'link' ? (
            <Button onClick={handleCreateLink} disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : 'Create Game Link'}
            </Button>
          ) : (
            <Button onClick={handleNextStep} className="w-full">
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
