// 敵キャラクターのマスターデータ
// 世界観: 機械化された動物たちが暴走した近未来SF

export type EnemyType =
  | 'mechdog'    // サイボーグ犬     - ジグザグ
  | 'dronebat'   // ドローンコウモリ  - 軌道回転
  | 'ironbird'   // 鉄鷹             - 直進・射撃
  | 'tankbear'   // 機甲クマ (BOSS)  - 突進・3フェーズ
  | 'cyberwolf'  // サイバーウルフ    - 狙撃
  | 'ironmole'   // 鉄モグラ         - 横断突撃
  | 'mechraccoon' // メカアライグマ   - 斜め高速

export interface EnemyConfig {
  type: EnemyType
  hp: number
  speed: number
  damage: number
  score: number
  size: number          // 当たり判定半径
  color: number         // テーマカラー
  movePattern: 'straight' | 'zigzag' | 'charge' | 'orbit' | 'sniper' | 'sidewind' | 'diagonal'
  shootable: boolean
  shootInterval?: number
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  // ── 犬型: 茶色のボディ、赤い機械眼 ──
  mechdog: {
    type: 'mechdog',
    hp: 40,
    speed: 120,
    damage: 15,
    score: 100,
    size: 18,
    color: 0xc87941,
    movePattern: 'zigzag',
    shootable: false,
  },

  // ── コウモリ型: 紫ボディ、大きな翼 ──
  dronebat: {
    type: 'dronebat',
    hp: 25,
    speed: 180,
    damage: 10,
    score: 80,
    size: 14,
    color: 0x7733aa,
    movePattern: 'orbit',
    shootable: false,
  },

  // ── 鷹型: 青い鋼鉄の羽、オレンジのくちばし ──
  ironbird: {
    type: 'ironbird',
    hp: 35,
    speed: 150,
    damage: 12,
    score: 120,
    size: 16,
    color: 0x4488ee,
    movePattern: 'straight',
    shootable: true,
    shootInterval: 2000,
  },

  // ── クマ型 BOSS: 巨大装甲、3フェーズ変身 ──
  tankbear: {
    type: 'tankbear',
    hp: 220,
    speed: 60,
    damage: 30,
    score: 500,
    size: 28,
    color: 0x888888,
    movePattern: 'charge',
    shootable: true,
    shootInterval: 3000,
  },

  // ── オオカミ型: ダークな装甲、サイバー眼 ──
  cyberwolf: {
    type: 'cyberwolf',
    hp: 80,
    speed: 200,
    damage: 20,
    score: 250,
    size: 22,
    color: 0x335544,
    movePattern: 'sniper',
    shootable: true,
    shootInterval: 2500,
  },

  // ── モグラ型: 画面端から横断突撃 ──
  ironmole: {
    type: 'ironmole',
    hp: 55,
    speed: 230,
    damage: 18,
    score: 160,
    size: 16,
    color: 0x885533,
    movePattern: 'sidewind',
    shootable: false,
  },

  // ── アライグマ型: 素早い斜め突撃・射撃 ──
  mechraccoon: {
    type: 'mechraccoon',
    hp: 30,
    speed: 260,
    damage: 12,
    score: 140,
    size: 13,
    color: 0x556677,
    movePattern: 'diagonal',
    shootable: true,
    shootInterval: 2800,
  },
}
