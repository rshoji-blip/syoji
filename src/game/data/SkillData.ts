// スキルのマスターデータ
import type { Skill } from '../../types/skill.types'

export const SKILLS: Skill[] = [
  // ── Common ──────────────────────────────────────────────
  {
    id: 'hp_up_1',
    name: 'ナノリペア I',
    description: '最大HPを +25 増加',
    rarity: 'common',
    icon: '💚',
    effects: [{ type: 'hp_up', value: 25 }],
    maxStack: 5,
  },
  {
    id: 'speed_up_1',
    name: 'ブーストレッグ I',
    description: '移動速度を +30 増加',
    rarity: 'common',
    icon: '⚡',
    effects: [{ type: 'speed_up', value: 30 }],
    maxStack: 4,
  },
  {
    id: 'fire_rate_up_1',
    name: 'ラピッドファイア I',
    description: '発射間隔を 15% 短縮',
    rarity: 'common',
    icon: '🔥',
    effects: [{ type: 'fire_rate_up', value: 0.15 }],
    maxStack: 5,
  },
  {
    id: 'damage_up_1',
    name: 'パワーセル I',
    description: '弾ダメージを +8 増加',
    rarity: 'common',
    icon: '💥',
    effects: [{ type: 'damage_up', value: 8 }],
    maxStack: 5,
  },
  {
    id: 'heal_1',
    name: '緊急修復',
    description: 'HPを 30 回復',
    rarity: 'common',
    icon: '🩺',
    effects: [{ type: 'heal', value: 30 }],
    maxStack: 99,
  },

  // ── Rare ──────────────────────────────────────────────
  {
    id: 'bullet_count_up',
    name: 'マルチバレル',
    description: '同時発射数を +1',
    rarity: 'rare',
    icon: '🎯',
    effects: [{ type: 'bullet_count_up', value: 1 }],
    maxStack: 3,
  },
  {
    id: 'crit_up_1',
    name: 'クリティカルコア',
    description: 'クリティカル率を +10%',
    rarity: 'rare',
    icon: '⚔️',
    effects: [{ type: 'crit_up', value: 0.1 }],
    maxStack: 4,
  },
  {
    id: 'shield_up_1',
    name: 'エナジーシールド',
    description: 'シールドを 50 付与',
    rarity: 'rare',
    icon: '🛡️',
    effects: [{ type: 'shield_up', value: 50 }],
    maxStack: 4,
  },
  {
    id: 'spread_shot',
    name: 'スプレッドショット',
    description: '扇形に3方向同時発射',
    rarity: 'rare',
    icon: '🌟',
    effects: [{ type: 'spread_shot', value: 1 }],
    maxStack: 1,
  },

  // ── Epic ──────────────────────────────────────────────
  {
    id: 'piercing_shot',
    name: 'ピアシングレーザー',
    description: '弾が敵を貫通する',
    rarity: 'epic',
    icon: '🔵',
    effects: [{ type: 'piercing_shot', value: 1 }],
    maxStack: 1,
  },
  {
    id: 'explosive_shot',
    name: 'プラズマグレネード',
    description: '弾が爆発し範囲ダメージ',
    rarity: 'epic',
    icon: '💣',
    effects: [{ type: 'explosive_shot', value: 1 }],
    maxStack: 1,
  },

  // ── Legendary ──────────────────────────────────────────
  {
    id: 'shield_regen',
    name: '量子シールド再生',
    description: 'シールドが毎秒10自動回復',
    rarity: 'legendary',
    icon: '✨',
    effects: [{ type: 'shield_regen', value: 10 }],
    maxStack: 1,
  },
]

// レアリティごとの出現重み
export const RARITY_WEIGHTS = {
  common: 60,
  rare: 28,
  epic: 10,
  legendary: 2,
}
