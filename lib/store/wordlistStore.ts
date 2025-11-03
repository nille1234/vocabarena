"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabCard } from '@/types/game';
import { mentalHealthVocabulary } from '@/lib/data/vocabulary';

export interface VocabularySet {
  id: string;
  title: string;
  description: string;
  language: string;
  cards: VocabCard[];
  createdAt: Date;
}

interface WordlistStore {
  wordlists: VocabularySet[];
  initialized: boolean;
  addWordlist: (wordlist: Omit<VocabularySet, 'id' | 'createdAt'>) => void;
  removeWordlist: (id: string) => void;
  updateWordlist: (id: string, wordlist: Partial<VocabularySet>) => void;
  getWordlist: (id: string) => VocabularySet | undefined;
  getAllWordlists: () => VocabularySet[];
  initializeDefaultWordlist: () => void;
}

export const useWordlistStore = create<WordlistStore>()(
  persist(
    (set, get) => ({
      wordlists: [],
      initialized: false,
      
      initializeDefaultWordlist: () => {
        const state = get();
        
        // Migration: Check if old data structure exists (customWordlists)
        const rawState = localStorage.getItem('wordlist-storage');
        if (rawState) {
          try {
            const parsed = JSON.parse(rawState);
            // If old structure with customWordlists exists, migrate it
            if (parsed.state?.customWordlists && !parsed.state?.wordlists) {
              const migratedWordlists = parsed.state.customWordlists.map((wl: any) => ({
                ...wl,
                // Remove isCustom flag if it exists
                isCustom: undefined,
              }));
              
              set({
                wordlists: migratedWordlists,
                initialized: true,
              });
              return;
            }
          } catch (e) {
            console.error('Migration error:', e);
          }
        }
        
        // Normal initialization: add default wordlist if none exist
        if (!state.initialized && state.wordlists.length === 0) {
          const defaultWordlist: VocabularySet = {
            id: `wordlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: 'Mental Health Vocabulary',
            description: 'English to Danish mental health terms',
            language: 'en-da',
            cards: mentalHealthVocabulary,
            createdAt: new Date(),
          };
          
          set({
            wordlists: [defaultWordlist],
            initialized: true,
          });
        } else if (!state.initialized) {
          // Mark as initialized if wordlists already exist
          set({ initialized: true });
        }
      },
      
      addWordlist: (wordlist) => {
        const newWordlist: VocabularySet = {
          ...wordlist,
          id: `wordlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };
        
        set((state) => ({
          wordlists: [...state.wordlists, newWordlist],
        }));
      },
      
      removeWordlist: (id) => {
        set((state) => ({
          wordlists: state.wordlists.filter((w) => w.id !== id),
        }));
      },
      
      updateWordlist: (id, updates) => {
        set((state) => ({
          wordlists: state.wordlists.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },
      
      getWordlist: (id) => {
        return get().wordlists.find((w) => w.id === id);
      },
      
      getAllWordlists: () => {
        return get().wordlists;
      },
    }),
    {
      name: 'wordlist-storage',
    }
  )
);
