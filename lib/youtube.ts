// Known YouTube video IDs for specific episodes, keyed by episode title
const YOUTUBE_IDS: Record<string, string> = {
  // Season 1
  'たこたこ、あがれ！': 'eWJf6luWxl8',
  '名探偵ジョージ': '8m9NPQplnRg',
  '数字あわせ': 'ZD856tODCqk',
  'コオロギに参った': 'L_Qc4D6b6A0',
  'ワンちゃん大好き': 'JcJcH4BOxts',
  'オタマジャクシはカエルの子': 'dtfpEVTpmuE',
  '料理はサイコー': '8eQXXPzCiO8',
  'イカダにのって': 'CA9mvMnPLHw',
  'ポッポ時計': '97xY5o_Fi_U',
  'ポンプはおもい': '4O4WSBHToE0',
  'アヒルさん、いらっしゃい': 'DWAJ_2i5OTo',
  'ガラガラ、ドッカーン': 'YYmIsNNB9RI',
  '夜のどうぶつえん': 'vNCliUgO8kI',
  'ドクター・ジョージ': '56XGvmunDHE',
  'チャーキーとかくれんぼ': '4cL4NXoumwg',
  'えきちょうのジョージ': 'Rbs28gx6_uk',
  'ビーバーをたすけろ': 'VPjd02PPQPA',
  'レモネードはいかが？': 'JbYdq6MsxU4',
  '信号をまもろう': 'mqiFTe6UP44',
  'しんせつなハンドリー': 'gNDskNZpsqo',
  '白い世界へ': 'R_SB1L3I7SA',
  'ここほれワンワン': 'vKvexjeSQbU',
  'ねこちゃんどーこだ': 'B7_lceCkNUk',
  'ドーナツこわい': 'gF4m7sCQ-4c',
  'ほしいっぱい': 'AgblP8bi0dM',
  'すてきなカラーチョコ': 'tqqoti27g-g',
  'ミツバチ、ブンブン': 'FIIR5kEJUyY',
  'ジョージバーガー': 'vUVCgAksNwo',
  'おやすみジョージ': '1gG6HCHkH4I',
  'スパイ大作戦': 'vKtDkVJSug4',
  'ちいさいいけのさかな': 'XurJyyUy7fw',
  '冬ものがたり': 'PzTWZcM-UwU',
  'ハトさんのおうち': 'RpeGj1xVfpQ',
  'うきうきボート': '_H_OgosGyPI',
  'ウサギとかくれんぼ': 'sEiYgfhlNAM',
  'ドアマンはラクじゃない': 'P73tUqbW0SM',
  'たのしいキャンプ': 'ZOHjycW3Q-E',
  'ハワイへいこう': 'AvVV2cKQIX4',
  // Season 2
  'オリをやぶれ': 'bVuTpSP0Js8',
  'ユニークだぞう': 'UcbFUTpOs1U',
  'くっさーい！': 'bZ1cyBd2M8M',
  '宇宙でおしごと': 'R9Q7fieKxYI',
  '洪水だぁー': '02DEYKISpNI',
  'ゼロ ワン スリー あれ？': 'KXsq54En6fs',
  'やった・ピッタシ！': 't9KjbHsEioA',
  '春よこい': 'ws40GAUNkz0',
  'めいわくコレクション': 'qc55uLeqYVU',
  'カーテンあけて、しめて': 'LiiM-DCJiPI',
  'ゆかいなぼうし': 'nn61b7-3TUs',
  'おしごと、おしごと': 'HOCaJAU5ALQ',
  'そのゴミまったー！': 'h0ArvGrgmgs',
  'ゴロンゴロン': 'z3JGvWmzTzU',
  '見えなーい！': 'C7OiTFk-AOA',
  'チャリ～ン！': 'taqQVFyINds',
  'やった！ラッキー': 'UySM0V1_gsk',
  '妖精になりたい': 'HTCxd6QW-sc',
  'はしをわたろう': 'mW3-1s7MGlA',
  '右かな？左かな？': 'buo5OPnEAf0',
  'ゆきのくにへ': 'IFHG8H5wd58',
  // Season 3
  'さあ、何こだ？': 'JTQev0e1saM',
  'まっかっか': 'VLTOxnHbfX0',
  'にじのねっこ': '3rUfcxuY-fg',
  'やさいはオイシイ': 'DEVAC1xPnKE',
  'ミミズにょろにょろ（2）': 'PTEZ0GQJJA4',
  '船でぶらり旅': 'tfFdX9wJ32Q',
  // Season 4+
  'ダブル・ハンドリー': 'QItbRa11r9M',
  'イエローパイレーツ': 'rdPcIynFcl8',
  'むいて、むいて、むいて': '-u5bJtzvSPI',
  'わっ、とんでる！': '0_T7KsH5OPQ',
  'リサイクルはおまかせ': 'MJPEsE9UQAY',
  'はたらけはたらけ': 'QeXYk0EZZi4',
  'おっかげろー': 'QeXYk0EZZi4',
  'ひとりオペラ': '3IQR6lj0Hkk',
  'カンガルー ピョン！': 'VS_ng3hKDFY',
  'カメレオン': 'OA9xj-tpuaA',
  'ブタのおせわ': '9bD9LX0XLQE',
  'お泊り会': 'ja-B35RvWNo',
  'ビックリ・パーティー': 'TUVcFIhGwSM',
  'ニョッキをよろこばせろ': 'weWJSaB5cn0',
  'しぼりたてジュース': 'P1VbCfLBBh4',
  'チャーキーがっこうへいく': 'dENePyPQPl8',
  'えいがかんへいこう': '5ojxYCv2LG8',
  // Season 5
  'ジョージのアヒルのこ': '6WQBFacT6Oc',
  'ひつじかいジョージ': 'BtKE_7lwSDc',
  'おかあさんにありがとう': 'xMwtToD-TYE',
  // Season 6
  'サル・ウィ・ダンス': 'dhv7f7z_-UU',
  'えー！ブタを１００ぴき！': 'jolv_ZHvlqI',
  'ありりりりー！': 'cH5LJyfqZPE',
  'ニョッキアルデンテ': '5GRC1Mn4aEI',
  // Season 7
  'とんでとんで': 'eTk5jlCMx3E',
  'オー・マイ・ホーム': 'RmhPK4RB36w',
  'フルフルぼし': 'sDdbz742fs8',
  'かぜにのって': '3ihT22ou2kk',
  // Various seasons
  'ドラゴンダンス': 'Bu_hD9Yz0LI',
  'あした天気になあれ': 'EQ8qTPpEUwU',
  'バレンタインデー': 'dpUiaOTSG58',
  'ネス湖の怪獣': 'mOwZPG3QPnA',
  '夜の遊園地': 'dBdUHjHpw2M',
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
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return null;
}

export function hasDirectVideo(title: string): boolean {
  return title in YOUTUBE_IDS;
}
