import { Episode } from '@/types';

export interface Genre {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
}

export const GENRES: Genre[] = [
  {
    id: 'food',
    label: '食べ物・料理',
    emoji: '🍎',
    keywords: [
      // Japanese
      '料理', '食べ', 'ドーナツ', 'レモネード', 'バーガー', 'チョコ', 'アイス', 'ケーキ',
      'クッキー', 'パン', 'スープ', 'ランチ', 'ジュース', 'リンゴ', '果物', 'お菓子',
      // English
      'cook', 'food', 'donut', 'lemonade', 'burger', 'candy', 'cake', 'bak',
      'pizza', 'ice cream', 'lunch', 'dinner', 'breakfast', 'recipe', 'chef',
      'fruit', 'apple', 'lemon', 'restaurant', 'jam', 'soup', 'peeling',
    ],
  },
  {
    id: 'animals',
    label: '動物',
    emoji: '🐾',
    keywords: [
      // Japanese
      '動物', '犬', '猫', '鳥', '魚', 'ウサギ', 'アヒル', 'カエル', 'カメ', 'コオロギ',
      'ミツバチ', 'ゾウ', 'ハト', 'リス', 'ビーバー', 'うなぎ', 'オタマジャクシ', 'ペット',
      'どうぶつえん', 'ワンちゃん', '動物園',
      // English
      'animal', 'dog', 'cat', 'bird', 'fish', 'bunny', 'rabbit', 'duck', 'frog',
      'turtle', 'bee', 'bear', 'elephant', 'pigeon', 'squirrel', 'beaver', 'eel',
      'tadpole', 'pet', 'zoo', 'hundley', 'charkie', 'jumpy', 'farm',
    ],
  },
  {
    id: 'vehicles',
    label: 'のりもの・たび',
    emoji: '🚀',
    keywords: [
      // Japanese
      '飛行機', 'ロケット', 'ボート', 'バス', '電車', '船', '車', 'イカダ', 'スキー',
      'ハワイ', '旅行', '宇宙', '列車', 'えきちょう',
      // English
      'rocket', 'kite', 'boat', 'train', 'bus', 'plane', 'car', 'raft', 'ski',
      'vacation', 'space', 'station', 'ride', 'trip', 'balloon', 'truck', 'ferry',
      'lighthouse',
    ],
  },
  {
    id: 'science',
    label: 'かがく・はっけん',
    emoji: '🔬',
    keywords: [
      // Japanese
      '星', '数字', '時計', '発明', '実験', '地図', '洪水', 'ポンプ', '信号', '鍵',
      '橋', '建築', 'アーキテクト',
      // English
      'star', 'number', 'clock', 'invention', 'experiment', 'map', 'flood', 'pump',
      'light', 'order', 'key', 'bridge', 'architect', 'sound', 'invisible', 'poles',
      'discover', 'science', 'engineer', 'build', 'balance', 'gravity',
    ],
  },
  {
    id: 'sports',
    label: 'スポーツ・あそび',
    emoji: '⚽',
    keywords: [
      // Japanese
      'ゴルフ', 'ローラー', 'マラソン', 'スポーツ', 'レース', 'ゲーム', 'かくれんぼ',
      'アスレチック', 'スケート', 'サッカー',
      // English
      'golf', 'roller', 'race', 'sport', 'game', 'trophy', 'score', 'dive',
      'swim', 'run', 'jump', 'hide', 'seek', 'skate', 'soccer', 'baseball',
      'hike', 'climb',
    ],
  },
  {
    id: 'music',
    label: 'おんがく・げいじゅつ',
    emoji: '🎵',
    keywords: [
      // Japanese
      '音楽', 'ミュージシャン', 'アート', 'ダンス', 'えいが', 'えんそう', '劇', '舞台',
      // English
      'music', 'musician', 'art', 'dance', 'band', 'song', 'perform', 'stage',
      'stagehand', 'show', 'paint', 'draw', 'picture', 'magic', 'magician',
    ],
  },
  {
    id: 'nature',
    label: 'しぜん・かんきょう',
    emoji: '🌿',
    keywords: [
      // Japanese
      'はな', '花', '木', '森', '公園', 'キャンプ', 'どんぐり', 'ゴミ', '川', '海',
      '砂', '土', '雨', '雪', '氷', '冬', '庭', '種', 'はたけ',
      // English
      'flower', 'tree', 'forest', 'park', 'camp', 'acorn', 'trash', 'recycle',
      'river', 'ocean', 'sand', 'dirt', 'snow', 'winter', 'garden', 'seed',
      'grow', 'plant', 'compost', 'nature', 'environment', 'farm',
    ],
  },
  {
    id: 'work',
    label: 'おしごと',
    emoji: '💼',
    keywords: [
      // Japanese
      'おしごと', 'はたらく', 'ドアマン', 'えきちょう', 'やくわり', 'お手伝い',
      'たすける', 'しんぶん', 'グロサリー', 'スーパー', '配達', 'レスキュー',
      // English
      'job', 'work', 'door monkey', 'station master', 'grocer', 'helper',
      'stain remover', 'deliver', 'rescue', 'chef', 'assistant', 'janitor',
      'plumber', 'doorman', 'master', 'takes a job',
    ],
  },
  {
    id: 'emotions',
    label: 'こわい・きもち',
    emoji: '😨',
    keywords: [
      // Japanese
      'こわい', 'びっくり', '病気', 'びょうき', 'くらやみ', 'おばけ', 'まよう',
      'おどろく', 'かなしい', 'なみだ', 'さびしい', '迷子', 'ないしょ', 'うそ',
      // English
      'scary', 'afraid', 'sick', 'dark', 'ghost', 'fear', 'lost', 'worry',
      'creature', 'scare', 'fever', 'night', 'winded', 'trouble', 'uh oh',
    ],
  },
  {
    id: 'events',
    label: 'イベント・きせつ',
    emoji: '🎉',
    keywords: [
      // Japanese
      '誕生日', 'パーティー', 'クリスマス', 'ハロウィン', 'お祭り', '運動会', 'パレード',
      'きせつ', '夏', '冬', 'お正月', 'バレンタイン', '父の日', '展覧会',
      // English
      'birthday', 'party', 'christmas', 'halloween', 'festival', 'parade',
      'holiday', 'fair', 'carnival', 'celebration', 'father', 'valentine',
      'quints', 'surprise',
    ],
  },
];

export function getEpisodeGenres(episode: Episode): string[] {
  const text = (episode.title + ' ' + (episode.description ?? '')).toLowerCase();
  return GENRES
    .filter((g) => g.keywords.some((kw) => text.includes(kw.toLowerCase())))
    .map((g) => g.id);
}

export function filterByGenre(episodes: Episode[], genreId: string): Episode[] {
  if (!genreId) return episodes;
  return episodes.filter((ep) => getEpisodeGenres(ep).includes(genreId));
}

export function getGenreEpisodeCount(episodes: Episode[]): Record<string, number> {
  const counts: Record<string, number> = {};
  GENRES.forEach((g) => {
    counts[g.id] = episodes.filter((ep) => getEpisodeGenres(ep).includes(g.id)).length;
  });
  return counts;
}
