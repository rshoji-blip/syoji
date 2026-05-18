// ウェーブ設定データ
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
  bgSpeed: number        // 背景スクロール速度
  spawnGroups: SpawnEntry[]
  bossWave: boolean
}

export const WAVE_CONFIGS: WaveConfig[] = [
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
      { type: 'mechdog', count: 4, interval: 1000, delay: 0 },
      { type: 'dronebat', count: 6, interval: 800, delay: 2000 },
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
      { type: 'mechdog', count: 6, interval: 800, delay: 1500 },
    ],
  },
  {
    wave: 5,
    name: 'BOSS WAVE - 機甲熊',
    bgSpeed: 120,
    bossWave: true,
    spawnGroups: [
      { type: 'tankbear', count: 1, interval: 0, delay: 1000 },
      { type: 'dronebat', count: 8, interval: 600, delay: 3000 },
    ],
  },
]

// ウェーブ5以降は繰り返し (難易度係数をかける)
export function getWaveConfig(wave: number): WaveConfig {
  if (wave <= WAVE_CONFIGS.length) {
    return WAVE_CONFIGS[wave - 1]
  }
  // 5ウェーブごとにループしつつ難易度上昇
  const base = WAVE_CONFIGS[(wave - 1) % WAVE_CONFIGS.length]
  return {
    ...base,
    wave,
    name: `Wave ${wave}`,
    bgSpeed: Math.min(base.bgSpeed + (wave - 5) * 5, 200),
  }
}
