export type AudioLicense = 'CC0' | 'CC-BY 4.0' | 'CC-BY-SA 4.0';

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  license: AudioLicense;
  file: string;
  alt?: string; // .ogg fallback
  attributionUrl?: string;
}

export interface SoundEffect {
  id: string;
  file: string;
  alt?: string;
  license: AudioLicense;
}

export interface AudioManifest {
  music: AudioTrack[];
  sfx: SoundEffect[];
}

export interface AudioPreferences {
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  musicEnabled: boolean;
  sfxEnabled: boolean;
  focusMode: boolean;
}

export type SFXEvent = 
  | 'correct'
  | 'wrong'
  | 'streak_3'
  | 'streak_5'
  | 'streak_10'
  | 'countdown_tick'
  | 'countdown_final'
  | 'round_won'
  | 'badge_unlock'
  | 'gravity_fall'
  | 'gravity_miss'
  | 'button_click'
  | 'card_flip';
