'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

interface SoundEffects {
  playWhack: () => void;
  playMiss: () => void;
  playCombo: () => void;
  playBeep: () => void;
  playVictory: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export function useSoundEffects(): SoundEffects {
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    oscillator.stop(ctx.currentTime + duration);
  }, [isMuted]);

  const playWhack = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    
    // Create a satisfying "whack" sound with multiple frequencies
    [800, 400, 200].forEach((freq, i) => {
      setTimeout(() => {
        playSound(freq, 0.1, 'square', 0.2);
      }, i * 30);
    });
  }, [isMuted, playSound]);

  const playMiss = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    
    // Descending tone for miss
    playSound(300, 0.2, 'sawtooth', 0.15);
    setTimeout(() => playSound(200, 0.2, 'sawtooth', 0.15), 100);
  }, [isMuted, playSound]);

  const playCombo = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    
    // Ascending celebratory tones
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        playSound(freq, 0.15, 'sine', 0.25);
      }, i * 80);
    });
  }, [isMuted, playSound]);

  const playBeep = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    
    // Short beep for countdown
    playSound(880, 0.1, 'sine', 0.2);
  }, [isMuted, playSound]);

  const playVictory = useCallback(() => {
    if (isMuted || !audioContextRef.current) return;
    
    // Victory fanfare
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        playSound(freq, 0.3, 'sine', 0.3);
      }, i * 150);
    });
  }, [isMuted, playSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playWhack,
    playMiss,
    playCombo,
    playBeep,
    playVictory,
    isMuted,
    toggleMute,
  };
}
