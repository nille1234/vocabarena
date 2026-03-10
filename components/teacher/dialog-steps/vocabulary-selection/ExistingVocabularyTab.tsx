"use client";

import { useEffect, useState } from "react";
import { VocabularyList, VocabCard } from "@/types/game";
import { getAllVocabularyLists, getVocabularyListCards } from "@/lib/supabase/vocabularyManagement";
import { toast } from "sonner";
import { VocabularyListSelector } from "./VocabularyListSelector";

interface ExistingVocabularyTabProps {
  existingLists: VocabularyList[];
  onExistingListsChange: (lists: VocabularyList[]) => void;
  onParsedCardsChange: (cards: VocabCard[]) => void;
  onVocabSourceChange: (source: 'new' | 'existing') => void;
  filterToListIds?: string[];
  preSelectedListIds?: string[];
}

export function ExistingVocabularyTab({
  existingLists,
  onExistingListsChange,
  onParsedCardsChange,
  onVocabSourceChange,
  filterToListIds,
  preSelectedListIds,
}: ExistingVocabularyTabProps) {
  const [loadingLists, setLoadingLists] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  useEffect(() => {
    loadExistingLists();
  }, []);

  // Pre-select lists when provided
  useEffect(() => {
    if (preSelectedListIds && preSelectedListIds.length > 0) {
      setSelectedListIds(preSelectedListIds);
    }
  }, [preSelectedListIds]);

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

  if (loadingLists) {
    return (
      <div className="text-center py-8 mt-4">
        <p className="text-muted-foreground">Loading vocabulary lists...</p>
      </div>
    );
  }

  if (existingLists.length === 0) {
    return (
      <div className="text-center py-8 mt-4">
        <p className="text-muted-foreground">No vocabulary lists found. Create one first!</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <VocabularyListSelector
        lists={existingLists}
        selectedListIds={selectedListIds}
        onListToggle={handleListToggle}
        onLoadSelectedLists={handleLoadSelectedLists}
        onClearSelection={handleClearSelection}
        isLoadingWords={isLoadingWords}
        filterToListIds={filterToListIds}
      />
    </div>
  );
}
