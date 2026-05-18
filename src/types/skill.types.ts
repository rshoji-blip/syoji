// スキルシステムの型定義

export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SkillEffectType =
  | 'hp_up'
  | 'speed_up'
  | 'fire_rate_up'
  | 'damage_up'
  | 'bullet_count_up'
  | 'crit_up'
  | 'shield_up'
  | 'spread_shot'
  | 'piercing_shot'
  | 'explosive_shot'
  | 'heal'
  | 'shield_regen';

export interface SkillEffect {
  type: SkillEffectType;
  value: number; // 増加量 or 倍率
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  rarity: SkillRarity;
  icon: string;       // emoji or asset key
  effects: SkillEffect[];
  maxStack: number;   // 最大取得回数
}

export interface AcquiredSkill {
  skill: Skill;
  stack: number; // 現在の取得回数
}
