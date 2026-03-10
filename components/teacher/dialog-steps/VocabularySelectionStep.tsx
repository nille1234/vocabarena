"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VocabCard, VocabularyList } from "@/types/game";
import { NewVocabularyTab } from "./vocabulary-selection/NewVocabularyTab";
import { ExistingVocabularyTab } from "./vocabulary-selection/ExistingVocabularyTab";

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
  preSelectedListIds?: string[];
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
  preSelectedListIds,
}: VocabularySelectionStepProps) {
  return (
    <div className="space-y-4">
      <Tabs value={vocabSource} onValueChange={(v) => onVocabSourceChange(v as 'new' | 'existing')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">Upload New</TabsTrigger>
          <TabsTrigger value="existing">Use Existing</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <NewVocabularyTab
            vocabListName={vocabListName}
            onVocabListNameChange={onVocabListNameChange}
            vocabListDescription={vocabListDescription}
            onVocabListDescriptionChange={onVocabListDescriptionChange}
            vocabListLanguage={vocabListLanguage}
            onVocabListLanguageChange={onVocabListLanguageChange}
            parsedCards={parsedCards}
            onParsedCardsChange={onParsedCardsChange}
          />
        </TabsContent>

        <TabsContent value="existing">
          <ExistingVocabularyTab
            existingLists={existingLists}
            onExistingListsChange={onExistingListsChange}
            onParsedCardsChange={onParsedCardsChange}
            onVocabSourceChange={onVocabSourceChange}
            filterToListIds={filterToListIds}
            preSelectedListIds={preSelectedListIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
