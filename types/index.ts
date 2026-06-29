export interface Episode {
  id: string;
  season: number;
  episode: string;
  title: string;
  date: string;
  thumbnail: string;
  description?: string;
  synopsis?: string;
  characters: string[];
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface Play {
  id: string;
  domain: string;
  domain_sub: string;
  name: string;
  age_min_months: number;
  age_max_months: number;
  location: string[];
  weather: string[];
  materials: string[];
  preparation: string[];
  overview: string;
  steps: string[];
  voice_guidance: string[];
  effects: string[];
  reference_url?: string;
}
