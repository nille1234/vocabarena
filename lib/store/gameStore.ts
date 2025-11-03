import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSession, VocabCard, GameMode, Attempt } from '@/types/game';

interface GameState {
  // All game sessions
  sessions: GameSession[];
  
  // Current session data
  session: GameSession | null;
  
  // Game progress
  currentCardIndex: number;
  attempts: Attempt[];
  
  // Actions
  addSession: (session: GameSession) => void;
  getAllSessions: () => GameSession[];
  getSessionByCode: (code: string) => GameSession | undefined;
  updateSessionName: (code: string, name: string) => void;
  setSession: (session: GameSession) => void;
  updateScore: (points: number) => void;
  updateStreak: (streak: number) => void;
  addAttempt: (attempt: Attempt) => void;
  nextCard: () => void;
  resetGame: () => void;
  startGame: () => void;
  endGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessions: [],
      session: null,
      currentCardIndex: 0,
      attempts: [],

      addSession: (session) =>
        set((state) => {
          // Check if session already exists, update it, otherwise add new
          const existingIndex = state.sessions.findIndex((s) => s.code === session.code);
          if (existingIndex >= 0) {
            const updatedSessions = [...state.sessions];
            updatedSessions[existingIndex] = session;
            return { sessions: updatedSessions };
          }
          return { sessions: [...state.sessions, session] };
        }),

      getAllSessions: () => get().sessions,

      getSessionByCode: (code) => get().sessions.find((s) => s.code === code),

      updateSessionName: (code, name) =>
        set((state) => {
          const updatedSessions = state.sessions.map((s) =>
            s.code === code ? { ...s, name } : s
          );
          const updatedSession = state.session?.code === code 
            ? { ...state.session, name }
            : state.session;
          return { sessions: updatedSessions, session: updatedSession };
        }),

      setSession: (session) => {
        set({ session });
        // Also update in sessions list
        get().addSession(session);
      },
      
      updateScore: (points) =>
        set((state) => {
          if (!state.session) return state;
          
          return {
            session: { 
              ...state.session, 
              score: (state.session.score || 0) + points 
            },
          };
        }),
      
      updateStreak: (streak) =>
        set((state) => {
          if (!state.session) return state;
          
          return {
            session: { ...state.session, streak },
          };
        }),
      
      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [...state.attempts, attempt],
        })),
      
      nextCard: () =>
        set((state) => ({
          currentCardIndex: state.currentCardIndex + 1,
        })),
      
      resetGame: () =>
        set({
          session: null,
          currentCardIndex: 0,
          attempts: [],
        }),
      
      startGame: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              status: 'active',
              startedAt: new Date(),
            },
          };
        }),
      
      endGame: () =>
        set((state) => {
          if (!state.session) return state;
          const updatedSession = {
            ...state.session,
            status: 'completed' as const,
            endedAt: new Date(),
          };
          // Update in sessions list
          get().addSession(updatedSession);
          return {
            session: updatedSession,
          };
        }),
    }),
    {
      name: 'game-storage',
    }
  )
);
