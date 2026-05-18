// 敵キャラクターのマスターデータ

export type EnemyType = 'mechdog' | 'dronebat' | 'ironbird' | 'tankbear' | 'cyberwolf'

export interface EnemyConfig {
  type: EnemyType
  hp: number
  speed: number
  damage: number       // プレイヤーへの接触ダメージ
  score: number
  size: number         // 当たり判定の半径
  color: number        // Phaser色 (0xRRGGBB)
  movePattern: 'straight' | 'zigzag' | 'charge' | 'orbit' | 'sniper'
  shootable: boolean   // 弾を撃つか
  shootInterval?: number
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  mechdog: {
    type: 'mechdog',
    hp: 40,
    speed: 120,
    damage: 15,
    score: 100,
    size: 18,
    color: 0xff6644,
    movePattern: 'zigzag',
    shootable: false,
  },
  dronebat: {
    type: 'dronebat',
    hp: 25,
    speed: 180,
    damage: 10,
    score: 80,
    size: 14,
    color: 0xaa44ff,
    movePattern: 'orbit',
    shootable: false,
  },
  ironbird: {
    type: 'ironbird',
    hp: 35,
    speed: 150,
    damage: 12,
    score: 120,
    size: 16,
    color: 0x4488ff,
    movePattern: 'straight',
    shootable: true,
    shootInterval: 2000,
  },
  tankbear: {
    type: 'tankbear',
    hp: 200,
    speed: 60,
    damage: 30,
    score: 400,
    size: 28,
    color: 0x888888,
    movePattern: 'charge',
    shootable: true,
    shootInterval: 3000,
  },
  cyberwolf: {
    type: 'cyberwolf',
    hp: 80,
    speed: 200,
    damage: 20,
    score: 250,
    size: 22,
    color: 0x00ffaa,
    movePattern: 'sniper',
    shootable: true,
    shootInterval: 2500,
  },
}
