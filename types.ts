
export enum HumanizationTone {
  NATURAL = 'natural',
  CASUAL = 'casual',
  PROFESSIONAL = 'professional',
  ACADEMIC = 'academic',
  CREATIVE = 'creative'
}

export enum Intensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum AppMode {
  STEALTH = 'stealth',
  MORPH = 'morph'
}

export interface HumanizationConfig {
  mode: AppMode;
  tone: HumanizationTone;
  intensity: Intensity;
  preserveStructure: boolean;
}

export interface HistoryItem {
  id: string;
  original: string;
  humanized: string;
  timestamp: number;
}
