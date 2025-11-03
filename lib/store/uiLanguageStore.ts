"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UILanguage = 'en' | 'de';

interface UILanguageStore {
  uiLanguage: UILanguage;
  setUILanguage: (language: UILanguage) => void;
  toggleUILanguage: () => void;
}

export const useUILanguageStore = create<UILanguageStore>()(
  persist(
    (set) => ({
      uiLanguage: 'en',
      setUILanguage: (language) => set({ uiLanguage: language }),
      toggleUILanguage: () =>
        set((state) => ({
          uiLanguage: state.uiLanguage === 'en' ? 'de' : 'en',
        })),
    }),
    {
      name: 'ui-language-storage',
    }
  )
);
