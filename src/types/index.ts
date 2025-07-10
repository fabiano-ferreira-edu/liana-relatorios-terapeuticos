export interface SessionData {
  therapistName: string;
  clientName: string;
  sessionDate: string;
  sessionTime: string;
  selectedFrequencies: number[];
}

export interface Frequency {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
}

export interface CoverSettings {
  backgroundImage: string;
  backgroundType: string;
}

export interface AppConfig {
  introductionText: string;
  frequencies: Frequency[];
  coverSettings?: CoverSettings;
}