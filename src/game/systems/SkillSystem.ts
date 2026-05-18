// ウェーブクリア後のスキル選択システム

import { SKILLS, RARITY_WEIGHTS } from '../data/SkillData'
import type { Skill, SkillRarity } from '../../types/skill.types'
import { useGameStore } from '../../store/gameStore'

export class SkillSystem {
  // 3つのスキル候補をランダム選択
  static drawCandidates(): Skill[] {
    const { acquiredSkills } = useGameStore.getState()

    // 取得可能なスキルをフィルタ (maxStack制限)
    const available = SKILLS.filter((skill) => {
      const acquired = acquiredSkills.find((a) => a.skill.id === skill.id)
      if (!acquired) return true
      return acquired.stack < skill.maxStack
    })

    if (available.length === 0) return []

    const candidates: Skill[] = []
    const used = new Set<string>()

    for (let i = 0; i < Math.min(3, available.length); i++) {
      let skill: Skill | null = null

      // レアリティ重み付きランダム
      for (let attempt = 0; attempt < 30; attempt++) {
        const rarity = SkillSystem.rollRarity()
        const pool = available.filter(
          (s) => s.rarity === rarity && !used.has(s.id)
        )
        if (pool.length > 0) {
          skill = pool[Math.floor(Math.random() * pool.length)]
          break
        }
      }

      // フォールバック: なんでもいい
      if (!skill) {
        const fallback = available.find((s) => !used.has(s.id))
        if (!fallback) break
        skill = fallback
      }

      candidates.push(skill)
      used.add(skill.id)
    }

    return candidates
  }

  private static rollRarity(): SkillRarity {
    const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
    let roll = Math.random() * total

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
      roll -= weight
      if (roll <= 0) return rarity as SkillRarity
    }
    return 'common'
  }

  // スキル効果をプレイヤーステータスに適用
  static applySkill(skill: Skill): void {
    const store = useGameStore.getState()
    const stats = { ...store.playerStats }

    skill.effects.forEach((effect) => {
      switch (effect.type) {
        case 'hp_up':
          stats.maxHp += effect.value
          stats.hp = Math.min(stats.hp + effect.value, stats.maxHp)
          break
        case 'speed_up':
          stats.speed += effect.value
          break
        case 'fire_rate_up':
          // 発射間隔を短縮 (値は短縮率)
          stats.fireRate = Math.max(80, stats.fireRate * (1 - effect.value))
          break
        case 'damage_up':
          stats.bulletDamage += effect.value
          break
        case 'bullet_count_up':
          stats.bulletCount += effect.value
          break
        case 'crit_up':
          stats.critChance = Math.min(0.8, stats.critChance + effect.value)
          break
        case 'shield_up':
          stats.maxShield += effect.value
          stats.shield = Math.min(stats.shield + effect.value, stats.maxShield)
          break
        case 'heal':
          stats.hp = Math.min(stats.maxHp, stats.hp + effect.value)
          break
        case 'shield_regen':
          // シールド自動回復はゲームシーンで処理
          break
        case 'spread_shot':
        case 'piercing_shot':
        case 'explosive_shot':
          // これらはフラグとして管理 (bullet countに加算しない)
          break
      }
    })

    store.setPlayerStats(stats)
    store.acquireSkill(skill)
  }
}
