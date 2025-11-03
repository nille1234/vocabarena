/**
 * Audio Manager - Generates royalty-free sounds using Web Audio API
 */

class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
  }

  private ensureContext() {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('AudioContext not initialized');
    }
    // Resume context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Play a success sound (ascending tones)
   */
  playSuccess() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Play an error sound (descending tones)
   */
  playError() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.setValueAtTime(392.00, now); // G4
      oscillator.frequency.setValueAtTime(329.63, now + 0.15); // E4

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Play a tick sound (for timers)
   */
  playTick() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Play a celebration sound (for wins)
   */
  playCelebration() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain!);

        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.2, now + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);

        oscillator.start(now + index * 0.1);
        oscillator.stop(now + index * 0.1 + 0.3);
      });
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Play a falling/whoosh sound
   */
  playFall() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Play a climb/step up sound
   */
  playClimb() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.2);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  /**
   * Start background music (simple looping melody)
   */
  startBackgroundMusic(): () => void {
    if (this.isMuted) return () => {};
    
    try {
      this.ensureContext();
      const ctx = this.audioContext!;
      
      const bgGain = ctx.createGain();
      bgGain.gain.value = 0.05; // Very quiet background
      bgGain.connect(this.masterGain!);

      const melody = [523.25, 587.33, 659.25, 587.33]; // C5, D5, E5, D5
      let currentNote = 0;
      let isPlaying = true;

      const playNote = () => {
        if (!isPlaying) return;

        const oscillator = ctx.createOscillator();
        oscillator.connect(bgGain);
        oscillator.frequency.value = melody[currentNote];
        
        const now = ctx.currentTime;
        oscillator.start(now);
        oscillator.stop(now + 0.4);

        currentNote = (currentNote + 1) % melody.length;
        setTimeout(playNote, 500);
      };

      playNote();

      // Return stop function
      return () => {
        isPlaying = false;
      };
    } catch (error) {
      console.warn('Background music failed:', error);
      return () => {};
    }
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get mute status
   */
  getMuted() {
    return this.isMuted;
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

export default AudioManager;
