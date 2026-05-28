export interface Episode {
  id: string;
  season: number;
  episode: string;
  title: string;
  date: string;
  thumbnail: string;
  description?: string;
  characters: string[];
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export type Theme = 'light' | 'dark';
