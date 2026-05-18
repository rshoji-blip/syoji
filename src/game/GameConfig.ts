// Phaser ゲームの基本設定

export const GAME_WIDTH = 390   // iPhone 14 基準
export const GAME_HEIGHT = 844

// 物理・ゲームプレイ定数
export const GAME_CONSTANTS = {
  PLAYER_START_Y: GAME_HEIGHT * 0.8,
  PLAYER_START_X: GAME_WIDTH / 2,

  // 弾の設定
  BULLET_LIFESPAN: 3000,   // ms
  MAX_BULLETS: 100,         // プール最大数

  // 敵の設定
  ENEMY_SPAWN_Y: -50,       // 画面上部の外
  MAX_ENEMIES: 30,

  // スクロール
  BG_LAYER_COUNT: 3,
  BG_PARALLAX_FACTORS: [0.3, 0.6, 1.0],

  // スコア
  WAVE_CLEAR_BONUS: 500,

  // エフェクト
  SCREEN_SHAKE_DURATION: 150,
  SCREEN_SHAKE_INTENSITY: 0.005,
} as const
