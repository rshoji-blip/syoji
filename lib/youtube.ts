// Known YouTube video IDs for specific episodes, keyed by episode title
const YOUTUBE_IDS: Record<string, string> = {
  // Season 1
  'たこたこ、あがれ！': 'eWJf6luWxl8',
  '名探偵ジョージ': '8m9NPQplnRg',
  'コオロギに参った': 'L_Qc4D6b6A0',
  'ワンちゃん大好き': 'JcJcH4BOxts',
  'オタマジャクシはカエルの子': 'dtfpEVTpmuE',
  '料理はサイコー': '8eQXXPzCiO8',
  'イカダにのって': 'CA9mvMnPLHw',
  'ポッポ時計': '97xY5o_Fi_U',
  'ドーナツこわい': 'gF4m7sCQ-4c',
  'ほしいっぱい': 'AgblP8bi0dM',
  'すてきなカラーチョコ': 'tqqoti27g-g',
  'ミツバチ、ブンブン': 'FIIR5kEJUyY',
  'おやすみジョージ': '1gG6HCHkH4I',
  'スパイ大作戦': 'vKtDkVJSug4',
  'ちいさいいけのさかな': 'XurJyyUy7fw',
  '冬ものがたり': 'PzTWZcM-UwU',
  // Season 2
  'オリをやぶれ': 'bVuTpSP0Js8',
  'ユニークだぞう': 'UcbFUTpOs1U',
  'くっさーい！': 'bZ1cyBd2M8M',
  '洪水だぁー': '02DEYKISpNI',
  'ゼロ ワン スリー あれ？': 'KXsq54En6fs',
  'やった・ピッタシ！': 't9KjbHsEioA',
  '春よこい': 'ws40GAUNkz0',
  // Season 3
  'さあ、何こだ？': 'JTQev0e1saM',
  'まっかっか': 'VLTOxnHbfX0',
  // Season 4+
  'ダブル・ハンドリー': 'QItbRa11r9M',
  'イエローパイレーツ': 'rdPcIynFcl8',
  'むいて、むいて、むいて': '-u5bJtzvSPI',
  'わっ、とんでる！': '0_T7KsH5OPQ',
  // Season 7
  'とんでとんで': 'eTk5jlCMx3E',
  'オー・マイ・ホーム': 'RmhPK4RB36w',
  'フルフルぼし': 'sDdbz742fs8',
  'かぜにのって': '3ihT22ou2kk',
  // Various seasons
  'ドラゴンダンス': 'Bu_hD9Yz0LI',
  'あした天気になあれ': 'EQ8qTPpEUwU',
  'バレンタインデー': 'dpUiaOTSG58',
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

export function getThumbnailUrl(title: string): string | null {
  const id = getYouTubeId(title);
  if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  return null;
}

export function hasDirectVideo(title: string): boolean {
  return title in YOUTUBE_IDS;
}
