// ウェーブ設定データ - 10ウェーブ構成 + 無限ループ
import type { EnemyType } from './EnemyData'

export interface SpawnEntry {
  type: EnemyType
  count: number
  interval: number  // 出現間隔 (ms)
  delay: number     // このエントリの開始遅延 (ms)
}

export interface WaveConfig {
  wave: number
  name: string
  bgSpeed: number
  spawnGroups: SpawnEntry[]
  bossWave: boolean
}

export const WAVE_CONFIGS: WaveConfig[] = [
  // ── ACT 1: 初遭遇 ──────────────────────────────────────────────
  {
    wave: 1,
    name: 'Wave 1 - 機械犬の群れ',
    bgSpeed: 80,
    bossWave: false,
    spawnGroups: [
      { type: 'mechdog', count: 5, interval: 1200, delay: 500 },
    ],
  },
  {
    wave: 2,
    name: 'Wave 2 - ドローンの脅威',
    bgSpeed: 90,
    bossWave: false,
    spawnGroups: [
      { type: 'mechdog',  count: 4, interval: 1000, delay: 0 },
      { type: 'dronebat', count: 6, interval: 800,  delay: 2000 },
    ],
  },
  {
    wave: 3,
    name: 'Wave 3 - 鉄の猛禽',
    bgSpeed: 100,
    bossWave: false,
    spawnGroups: [
      { type: 'ironbird', count: 5, interval: 1500, delay: 0 },
      { type: 'dronebat', count: 4, interval: 1000, delay: 1000 },
    ],
  },
  {
    wave: 4,
    name: 'Wave 4 - サイバーウルフ',
    bgSpeed: 110,
    bossWave: false,
    spawnGroups: [
      { type: 'cyberwolf', count: 3, interval: 2000, delay: 0 },
      { type: 'mechdog',   count: 6, interval: 800,  delay: 1500 },
    ],
  },
  {
    wave: 5,
    name: '★ BOSS - 機甲クマ ★',
    bgSpeed: 120,
    bossWave: true,
    spawnGroups: [
      { type: 'tankbear', count: 1, interval: 0,   delay: 1000 },
      { type: 'dronebat', count: 8, interval: 600, delay: 3000 },
    ],
  },

  // ── ACT 2: 新たな脅威 ────────────────────────────────────────
  {
    wave: 6,
    name: 'Wave 6 - 地下からの侵攻',
    bgSpeed: 125,
    bossWave: false,
    spawnGroups: [
      { type: 'ironmole', count: 6, interval: 900,  delay: 0 },
      { type: 'mechdog',  count: 4, interval: 1000, delay: 2500 },
    ],
  },
  {
    wave: 7,
    name: 'Wave 7 - 泥棒アライグマ軍団',
    bgSpeed: 130,
    bossWave: false,
    spawnGroups: [
      { type: 'mechraccoon', count: 8, interval: 700, delay: 0 },
      { type: 'dronebat',    count: 5, interval: 900, delay: 1800 },
    ],
  },
  {
    wave: 8,
    name: 'Wave 8 - 鋼鉄の嵐',
    bgSpeed: 135,
    bossWave: false,
    spawnGroups: [
      { type: 'ironbird',    count: 4, interval: 1200, delay: 0 },
      { type: 'ironmole',    count: 4, interval: 1000, delay: 1000 },
      { type: 'mechraccoon', count: 4, interval: 800,  delay: 3000 },
    ],
  },
  {
    wave: 9,
    name: 'Wave 9 - 全軍総攻撃',
    bgSpeed: 145,
    bossWave: false,
    spawnGroups: [
      { type: 'cyberwolf',   count: 3, interval: 1800, delay: 0 },
      { type: 'ironmole',    count: 5, interval: 900,  delay: 1000 },
      { type: 'mechraccoon', count: 5, interval: 700,  delay: 2500 },
      { type: 'dronebat',    count: 6, interval: 600,  delay: 4000 },
    ],
  },
  {
    wave: 10,
    name: '★★ FINAL BOSS - 機甲クマ 覚醒 ★★',
    bgSpeed: 160,
    bossWave: true,
    spawnGroups: [
      { type: 'tankbear',    count: 1, interval: 0,   delay: 500 },
      { type: 'mechraccoon', count: 6, interval: 700, delay: 4000 },
      { type: 'ironmole',    count: 4, interval: 1000, delay: 6000 },
    ],
  },
]

export function getWaveConfig(wave: number): WaveConfig {
  if (wave <= WAVE_CONFIGS.length) {
    return WAVE_CONFIGS[wave - 1]
  }
  // 10ウェーブ以降: ループしながら難易度係数が上昇
  const cycle = Math.floor((wave - 1) / WAVE_CONFIGS.length)
  const base  = WAVE_CONFIGS[(wave - 1) % WAVE_CONFIGS.length]
  return {
    ...base,
    wave,
    name: `Wave ${wave}`,
    bgSpeed: Math.min(base.bgSpeed + cycle * 10, 220),
  }
}
