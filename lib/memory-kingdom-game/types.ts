export type CardSetType = 'knight' | 'merchant' | 'mage' | 'farmer' | 'temple';
export type PlayerIdx = 0 | 1;
export type SkillId = 'scout' | 'seal' | 'extra' | 'steal';

export type GamePhase =
  | 'setup'
  | 'playing'       // 1枚目待ち
  | 'awaiting'      // 1枚目選択済み、2枚目待ち
  | 'resolving'     // 両方公開、判定タイマー中
  | 'set_bonus'     // セットコンプリートポップアップ表示中
  | 'scout_target'  // 偵察の対象選択待ち
  | 'steal_target'  // 強奪の対象選択待ち
  | 'mage_reveal'   // 魔法使の塔ボーナス：4枚一時公開中
  | 'game_over';

export interface Card {
  id: number;
  setType: CardSetType;
  pairId: number;       // 0-9、同じpairIdの2枚がペア
  revealed: boolean;    // 現在表向き
  taken: boolean;       // 取得済み
  takenBy: PlayerIdx | null;
  scouted: boolean;     // 偵察スキルで一時公開中
}

export interface PlayerState {
  idx: PlayerIdx;
  name: string;
  score: number;
  sp: number;                   // 0〜5
  skills: SkillId[];            // 選択した3枚
  takenIds: number[];           // 取得カードのid
  completedSets: CardSetType[];
  farmerBonus: boolean;         // 農民ボーナス：ペア得点+30%
  skipNextTurn: boolean;        // 騎士団ボーナス：次ターンスキップ
  extraTurn: boolean;           // 連続行動スキル：追加ターン
  memorySealed: boolean;        // 記憶封印：次ターンのめくり時間を短縮
}

export interface GameState {
  phase: GamePhase;
  cards: Card[];
  players: [PlayerState, PlayerState];
  currentPlayer: PlayerIdx;
  flippedIds: number[];                         // このターンにめくったカード（最大2枚）
  consecutiveMatches: number;                   // このターンの連続取得数（最大3）
  pendingBonus: { player: PlayerIdx; setType: CardSetType } | null;
  mageRevealIds: number[];                      // 魔法使塔ボーナスで公開するカードids
  log: LogEntry[];
  winner: PlayerIdx | 'draw' | null;
}

export interface LogEntry {
  id: number;
  text: string;
  type: 'match' | 'miss' | 'skill' | 'bonus' | 'system';
}

export type GameAction =
  | { type: 'START'; p1Name: string; p2Name: string; p1Skills: SkillId[]; p2Skills: SkillId[] }
  | { type: 'FLIP'; cardId: number }
  | { type: 'RESOLVE' }
  | { type: 'CLOSE_BONUS' }
  | { type: 'USE_SKILL'; skillId: SkillId }
  | { type: 'SCOUT_PICK'; cardId: number }
  | { type: 'CLEAR_SCOUT'; cardId: number }
  | { type: 'STEAL_PICK'; cardId: number }
  | { type: 'END_MAGE' }
  | { type: 'RESET' };
