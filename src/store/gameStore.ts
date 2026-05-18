// Zustandを使ったグローバル状態管理
// React UI ↔ Phaser ゲームエンジン間のブリッジ

import { create } from 'zustand'
import type { GamePhase, PlayerStats, GameResult } from '../types/game.types'
import type { Skill, AcquiredSkill } from '../types/skill.types'

interface GameState {
  // ゲームフェーズ
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  // プレイヤーステータス
  playerStats: PlayerStats
  setPlayerStats: (stats: Partial<PlayerStats>) => void

  // ウェーブ情報
  currentWave: number
  setCurrentWave: (wave: number) => void

  // スコア・キル数
  score: number
  addScore: (points: number) => void
  killCount: number
  addKill: () => void

  // スキル
  acquiredSkills: AcquiredSkill[]
  skillCandidates: Skill[]       // 選択肢として表示するスキル3つ
  setSkillCandidates: (skills: Skill[]) => void
  acquireSkill: (skill: Skill) => void

  // リザルト
  gameResult: GameResult | null
  setGameResult: (result: GameResult) => void

  // ゲームリセット
  resetGame: () => void

  // プレイ時間
  playStartTime: number
  setPlayStartTime: (time: number) => void

  // ボスHPバー (UIScene から参照)
  bossState: { hp: number; maxHp: number; phase: number } | null
  setBossState: (state: { hp: number; maxHp: number; phase: number } | null) => void

  // コンボ (UIScene から参照)
  comboCount: number
  comboMultiplier: number
  setCombo: (count: number, multiplier: number) => void
}

const DEFAULT_PLAYER_STATS: PlayerStats = {
  hp: 100,
  maxHp: 100,
  speed: 200,
  fireRate: 300,
  bulletDamage: 20,
  bulletCount: 1,
  bulletSpeed: 500,
  critChance: 0.05,
  critMultiplier: 2.0,
  shield: 0,
  maxShield: 0,
  dodgeSpeed: 400,
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'title',
  setPhase: (phase) => set({ phase }),

  playerStats: { ...DEFAULT_PLAYER_STATS },
  setPlayerStats: (stats) =>
    set((state) => ({ playerStats: { ...state.playerStats, ...stats } })),

  currentWave: 1,
  setCurrentWave: (wave) => set({ currentWave: wave }),

  score: 0,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  killCount: 0,
  addKill: () => set((state) => ({ killCount: state.killCount + 1 })),

  acquiredSkills: [],
  skillCandidates: [],
  setSkillCandidates: (skills) => set({ skillCandidates: skills }),
  acquireSkill: (skill) =>
    set((state) => {
      const existing = state.acquiredSkills.find((s) => s.skill.id === skill.id)
      if (existing) {
        // スタック増加
        return {
          acquiredSkills: state.acquiredSkills.map((s) =>
            s.skill.id === skill.id ? { ...s, stack: s.stack + 1 } : s
          ),
        }
      }
      return {
        acquiredSkills: [...state.acquiredSkills, { skill, stack: 1 }],
      }
    }),

  gameResult: null,
  setGameResult: (result) => set({ gameResult: result }),

  playStartTime: 0,
  setPlayStartTime: (time) => set({ playStartTime: time }),

  bossState: null,
  setBossState: (state) => set({ bossState: state }),

  comboCount: 0,
  comboMultiplier: 1.0,
  setCombo: (count, multiplier) => set({ comboCount: count, comboMultiplier: multiplier }),

  resetGame: () =>
    set({
      phase: 'title',
      playerStats: { ...DEFAULT_PLAYER_STATS },
      currentWave: 1,
      score: 0,
      killCount: 0,
      acquiredSkills: [],
      skillCandidates: [],
      gameResult: null,
      playStartTime: 0,
      bossState: null,
      comboCount: 0,
      comboMultiplier: 1.0,
    }),
}))
