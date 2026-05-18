// ゲーム全体で使う型定義

export type GamePhase =
  | 'title'      // タイトル画面
  | 'playing'    // プレイ中
  | 'skillSelect' // スキル選択
  | 'result';    // リザルト画面

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  fireRate: number;       // 発射間隔 (ms)
  bulletDamage: number;   // 弾のダメージ
  bulletCount: number;    // 同時発射数
  bulletSpeed: number;    // 弾の速度
  critChance: number;     // クリティカル率 (0-1)
  critMultiplier: number; // クリティカル倍率
  shield: number;         // シールド値
  maxShield: number;
  dodgeSpeed: number;     // 回避速度
}

export interface GameResult {
  wave: number;
  killCount: number;
  score: number;
  playTime: number; // seconds
}

export interface Position {
  x: number;
  y: number;
}
