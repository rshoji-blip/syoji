import { Episode } from '@/types';

export function hiraganaToKatakana(str: string): string {
  return str.replace(/[ぁ-ゖ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

export function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

export function normalizeString(str: string): string {
  return hiraganaToKatakana(str.toLowerCase());
}

export function filterEpisodes(episodes: Episode[], query: string): Episode[] {
  if (!query.trim()) return [];
  const normalizedQuery = normalizeString(query.trim());
  return episodes.filter((episode) =>
    episode.characters.some((character) =>
      normalizeString(character).includes(normalizedQuery)
    )
  );
}

export function getAllCharacters(episodes: Episode[]): string[] {
  const characterSet = new Set<string>();
  episodes.forEach((episode) => {
    episode.characters.forEach((char) => characterSet.add(char));
  });
  return Array.from(characterSet).sort();
}

export function getCharacterSuggestions(
  episodes: Episode[],
  query: string,
  limit = 6
): string[] {
  if (!query.trim()) return [];
  const normalizedQuery = normalizeString(query.trim());
  const allCharacters = getAllCharacters(episodes);
  return allCharacters
    .filter((char) => normalizeString(char).includes(normalizedQuery))
    .slice(0, limit);
}

export function getCharacterCounts(episodes: Episode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  episodes.forEach((episode) => {
    episode.characters.forEach((char) => {
      counts[char] = (counts[char] || 0) + 1;
    });
  });
  return counts;
}

export function getPopularCharacters(episodes: Episode[], limit = 8): string[] {
  const counts = getCharacterCounts(episodes);
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([char]) => char);
}
