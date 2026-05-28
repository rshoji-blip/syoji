import Fuse from 'fuse.js';
import { Episode } from '@/types';

// Kanji→kana + katakana loanword→English alternatives for common search terms
const QUERY_ALIASES: Record<string, string[]> = {
  '新聞': ['しんぶん', 'newspaper'],
  '電車': ['でんしゃ', 'train'],
  '料理': ['りょうり', 'cook'],
  '動物': ['どうぶつ', 'animal'],
  '友達': ['ともだち', 'friend'],
  '誕生日': ['たんじょうび', 'birthday'],
  '音楽': ['おんがく', 'music'],
  'レース': ['race', 'racer'],
  'スポーツ': ['sport'],
  'ピザ': ['pizza'],
  'アイス': ['ice cream'],
  'ロケット': ['rocket'],
  'バルーン': ['balloon'],
  'マジック': ['magic'],
  'ロボット': ['robot'],
  'コンサート': ['concert'],
  'パーティー': ['party'],
  'クリスマス': ['christmas'],
  'ハロウィン': ['halloween'],
};

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

export function getAllCharacters(episodes: Episode[]): string[] {
  const characterSet = new Set<string>();
  episodes.forEach((episode) => {
    episode.characters.forEach((char) => characterSet.add(char));
  });
  return Array.from(characterSet).sort();
}

type NormalizedChar = { original: string; normalized: string };

function buildNormalizedChars(episodes: Episode[]): NormalizedChar[] {
  return getAllCharacters(episodes).map((c) => ({
    original: c,
    normalized: normalizeString(c),
  }));
}

function fuzzyMatchCharacters(
  normalizedChars: NormalizedChar[],
  query: string
): Set<string> {
  const normalizedQuery = normalizeString(query.trim());
  const matched = new Set<string>();

  // Substring matches first (exact partial match)
  normalizedChars.forEach(({ original, normalized }) => {
    if (normalized.includes(normalizedQuery)) matched.add(original);
  });

  // Fuse.js fuzzy search on normalized names
  const fuse = new Fuse(normalizedChars, {
    keys: ['normalized'],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
  });
  fuse.search(normalizedQuery).forEach((r) => matched.add(r.item.original));

  return matched;
}

function getSearchQueries(query: string): string[] {
  const base = query.trim();
  const queries = new Set([normalizeString(base)]);
  const aliases = QUERY_ALIASES[base] ?? [];
  aliases.forEach((a) => queries.add(normalizeString(a)));
  return Array.from(queries);
}

function matchesKeyword(text: string, queries: string[]): boolean {
  const norm = normalizeString(text);
  return queries.some((q) => norm.includes(q));
}

export function filterEpisodes(episodes: Episode[], query: string): Episode[] {
  if (!query.trim()) return [];

  const queries = getSearchQueries(query);
  const normalizedChars = buildNormalizedChars(episodes);
  const matchedChars = fuzzyMatchCharacters(normalizedChars, query);

  const charMatches: Episode[] = [];
  const keywordMatches: Episode[] = [];

  for (const ep of episodes) {
    const byChar = ep.characters.some((c) => matchedChars.has(c));
    if (byChar) {
      charMatches.push(ep);
      continue;
    }
    const byTitle = matchesKeyword(ep.title, queries);
    const byDesc = ep.description ? matchesKeyword(ep.description, queries) : false;
    if (byTitle || byDesc) {
      keywordMatches.push(ep);
    }
  }

  return [...charMatches, ...keywordMatches];
}

export function getCharacterSuggestions(
  episodes: Episode[],
  query: string,
  limit = 6
): string[] {
  if (!query.trim()) return [];
  const normalizedChars = buildNormalizedChars(episodes);
  const matched = fuzzyMatchCharacters(normalizedChars, query);
  const normalizedQuery = normalizeString(query.trim());

  // Sort: substring matches first, then fuzzy-only
  const exact: string[] = [];
  const fuzzyOnly: string[] = [];
  normalizedChars.forEach(({ original, normalized }) => {
    if (!matched.has(original)) return;
    if (normalized.includes(normalizedQuery)) exact.push(original);
    else fuzzyOnly.push(original);
  });

  return [...exact, ...fuzzyOnly].slice(0, limit);
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
