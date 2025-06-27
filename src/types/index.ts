export type LearningModes = 'grammar' | 'creativity' | 'minimal';

export interface Feedback {
  type: 'grammar' | 'spelling' | 'style' | 'creativity';
  message: string;
  suggestion?: string;
  position?: { start: number; end: number };
}

export interface GrammarIssue {
  text: string;
  position: { start: number; end: number };
  type: 'grammar' | 'spelling' | 'punctuation';
  suggestion: string;
  confidence: number;
}

export interface CreativePrompt {
  id: string;
  type: 'continuation' | 'twist' | 'character' | 'setting' | 'dialogue';
  prompt: string;
  context?: string;
}

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}