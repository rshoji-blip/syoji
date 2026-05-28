import { SearchHistoryItem } from '@/types';

const HISTORY_KEY = 'anime_search_history';
const MAX_HISTORY = 10;

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  const history = getSearchHistory();
  const filtered = history.filter((item) => item.query !== query.trim());
  const newHistory = [
    { query: query.trim(), timestamp: Date.now() },
    ...filtered,
  ].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  } catch {
    // ignore storage errors
  }
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore storage errors
  }
}
