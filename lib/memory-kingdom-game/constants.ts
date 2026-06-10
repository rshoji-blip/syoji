import { CardSetType, SkillId } from './types';

export interface SetDef {
  type: CardSetType;
  name: string;
  icon: string;
  color: string;
  bonusName: string;
  bonusDesc: string;
}

export const SET_DEFS: SetDef[] = [
  {
    type: 'knight',
    name: '騎士団',
    icon: '⚔️',
    color: '#ef4444',
    bonusName: '剣士の進軍',
    bonusDesc: '相手の次ターンをスキップ',
  },
  {
    type: 'merchant',
    name: '商人ギルド',
    icon: '💰',
    color: '#f59e0b',
    bonusName: '黄金の取引',
    bonusDesc: '即時 +500pt',
  },
  {
    type: 'mage',
    name: '魔法使の塔',
    icon: '🔮',
    color: '#a855f7',
    bonusName: '呪文の嵐',
    bonusDesc: '裏向き4枚を3秒間公開',
  },
  {
    type: 'farmer',
    name: '農民の里',
    icon: '🌾',
    color: '#22c55e',
    bonusName: '収穫祭',
    bonusDesc: '以降のペア得点 +30%',
  },
  {
    type: 'temple',
    name: '神殿',
    icon: '⛩️',
    color: '#3b82f6',
    bonusName: '神の加護',
    bonusDesc: 'SPを最大値まで回復',
  },
];

export interface SkillDef {
  id: SkillId;
  name: string;
  icon: string;
  sp: number;
  desc: string;
}

export const SKILL_DEFS: SkillDef[] = [
  {
    id: 'scout',
    name: '偵察',
    icon: '🔍',
    sp: 1,
    desc: '好きなカード1枚を2秒確認',
  },
  {
    id: 'seal',
    name: '記憶封印',
    icon: '🌫️',
    sp: 2,
    desc: '相手の次ターン、めくり時間が極短に',
  },
  {
    id: 'extra',
    name: '連続行動',
    icon: '⚡',
    sp: 2,
    desc: 'ターン終了後、もう1回ターンを得る',
  },
  {
    id: 'steal',
    name: '強奪',
    icon: '💀',
    sp: 3,
    desc: '相手の取得カードを1枚奪う',
  },
];

export const SP_MAX = 5;
export const MAX_CONSECUTIVE = 3;

// consecutiveMatches（0始まり）に応じたスコア
export const MATCH_SCORES = [100, 150, 200] as const;

// セット完成ごとの王国変換
export const SET_TO_WOOD = 5;
export const SKILL_TO_MAGIC = 3;
export const SCORE_TO_GOLD = 100;

export const KINGDOM_LEVELS = [
  { minLevel: 1,  maxLevel: 5,  label: '村',    icon: '🛖' },
  { minLevel: 6,  maxLevel: 15, label: '砦',    icon: '🏯' },
  { minLevel: 16, maxLevel: 30, label: '城郭都市', icon: '🏰' },
  { minLevel: 31, maxLevel: 50, label: '大都市', icon: '🌆' },
  { minLevel: 51, maxLevel: 999, label: '帝都', icon: '👑' },
] as const;
