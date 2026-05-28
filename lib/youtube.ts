// Known YouTube video IDs for specific episodes, keyed by episode title
const YOUTUBE_IDS: Record<string, string> = {
  'ドーナツこわい': 'gF4m7sCQ-4c',
  'ほしいっぱい': 'AgblP8bi0dM',
  'すてきなカラーチョコ': 'tqqoti27g-g',
  'ミツバチ、ブンブン': 'FIIR5kEJUyY',
  'おやすみジョージ': '1gG6HCHkH4I',
  'スパイ大作戦': 'vKtDkVJSug4',
  'ちいさいいけのさかな': 'XurJyyUy7fw',
};

export function getYouTubeId(title: string): string | null {
  return YOUTUBE_IDS[title] ?? null;
}

export function getYouTubeUrl(title: string): string {
  const id = getYouTubeId(title);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  // Fallback: search YouTube for the episode title
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' おさるのジョージ')}`;
}

export function hasDirectVideo(title: string): boolean {
  return title in YOUTUBE_IDS;
}
