import {
  GameState, GameAction, Card, PlayerState, PlayerIdx,
  CardSetType, LogEntry,
} from './types';
import { SET_DEFS, SP_MAX, MATCH_SCORES, MAX_CONSECUTIVE } from './constants';

// ─── ユーティリティ ────────────────────────────────────────────────────────

let _logId = 0;
function log(text: string, type: LogEntry['type']): LogEntry {
  return { id: _logId++, text, type };
}

function opp(p: PlayerIdx): PlayerIdx {
  return p === 0 ? 1 : 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pushLog(entries: LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...entries].slice(0, 30);
}

// ─── 初期化 ────────────────────────────────────────────────────────────────

function createCards(): Card[] {
  const setTypes: CardSetType[] = ['knight', 'merchant', 'mage', 'farmer', 'temple'];
  const raw: Card[] = [];
  let id = 0;
  let pairId = 0;

  for (const setType of setTypes) {
    for (let p = 0; p < 2; p++) {          // セットあたり2ペア
      for (let c = 0; c < 2; c++) {        // ペアあたり2枚
        raw.push({ id: id++, setType, pairId, revealed: false, taken: false, takenBy: null, scouted: false });
      }
      pairId++;
    }
  }
  return shuffle(raw);
}

function createPlayer(idx: PlayerIdx, name: string, skills: string[]): PlayerState {
  return {
    idx,
    name,
    score: 0,
    sp: 0,
    skills: skills as PlayerState['skills'],
    takenIds: [],
    completedSets: [],
    farmerBonus: false,
    skipNextTurn: false,
    extraTurn: false,
    memorySealed: false,
  };
}

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    cards: [],
    players: [
      createPlayer(0, 'プレイヤー1', ['scout', 'extra', 'steal']),
      createPlayer(1, 'プレイヤー2', ['scout', 'seal', 'extra']),
    ],
    currentPlayer: 0,
    flippedIds: [],
    consecutiveMatches: 0,
    pendingBonus: null,
    mageRevealIds: [],
    log: [],
    winner: null,
  };
}

// ─── ターン遷移ヘルパー ────────────────────────────────────────────────────

function isGameOver(cards: Card[]): boolean {
  return cards.every(c => c.taken);
}

function determineWinner(players: [PlayerState, PlayerState]): PlayerIdx | 'draw' {
  if (players[0].score > players[1].score) return 0;
  if (players[1].score > players[0].score) return 1;
  return 'draw';
}

function clonePlayersPair(players: [PlayerState, PlayerState]): [PlayerState, PlayerState] {
  return [{ ...players[0] }, { ...players[1] }];
}

/**
 * ターン交代処理。extraTurn / skipNextTurn を考慮して次プレイヤーを決定し、
 * 必要なフラグをリセットした players を返す。
 */
function advanceTurn(
  players: [PlayerState, PlayerState],
  currentPlayer: PlayerIdx,
): { nextPlayer: PlayerIdx; players: [PlayerState, PlayerState] } {
  const ps = clonePlayersPair(players);
  const cp = currentPlayer;
  const np = opp(cp);

  if (ps[cp].extraTurn) {
    ps[cp].extraTurn = false;
    return { nextPlayer: cp, players: ps };
  }
  if (ps[np].skipNextTurn) {
    ps[np].skipNextTurn = false;
    return { nextPlayer: cp, players: ps };
  }
  return { nextPlayer: np, players: ps };
}

// ─── セット完成チェック ────────────────────────────────────────────────────

function checkSetCompletion(
  cards: Card[],
  playerIdx: PlayerIdx,
  setType: CardSetType,
): boolean {
  return cards.filter(c => c.setType === setType).every(c => c.takenBy === playerIdx);
}

// ─── 魔法使塔ボーナス：公開するカードを4枚選ぶ ─────────────────────────────

function pickMageRevealIds(cards: Card[]): number[] {
  const faceDown = cards.filter(c => !c.taken && !c.revealed && !c.scouted);
  return shuffle(faceDown).slice(0, 4).map(c => c.id);
}

// ─── スコア計算 ───────────────────────────────────────────────────────────

function calcScore(consecutiveMatches: number, farmerBonus: boolean): number {
  const base = MATCH_SCORES[Math.min(consecutiveMatches, MATCH_SCORES.length - 1)];
  return farmerBonus ? Math.floor(base * 1.3) : base;
}

// ─── メインリデューサー ────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ──────────────────────────────────────────── START
    case 'START': {
      return {
        ...state,
        phase: 'playing',
        cards: createCards(),
        players: [
          createPlayer(0, action.p1Name, action.p1Skills),
          createPlayer(1, action.p2Name, action.p2Skills),
        ],
        currentPlayer: 0,
        flippedIds: [],
        consecutiveMatches: 0,
        pendingBonus: null,
        mageRevealIds: [],
        log: [log('ゲーム開始！先攻はプレイヤー1', 'system')],
        winner: null,
      };
    }

    // ──────────────────────────────────────────── FLIP
    case 'FLIP': {
      if (state.phase !== 'playing' && state.phase !== 'awaiting') return state;
      const { cardId } = action;
      const card = state.cards.find(c => c.id === cardId);
      if (!card || card.taken || card.revealed || state.flippedIds.includes(cardId)) return state;

      const newCards = state.cards.map(c => c.id === cardId ? { ...c, revealed: true } : c);
      const newFlipped = [...state.flippedIds, cardId];

      if (newFlipped.length === 1) {
        return { ...state, cards: newCards, flippedIds: newFlipped, phase: 'awaiting' };
      }
      // 2枚めくった → resolving へ
      return { ...state, cards: newCards, flippedIds: newFlipped, phase: 'resolving' };
    }

    // ──────────────────────────────────────────── RESOLVE（タイマー後に呼ばれる）
    case 'RESOLVE': {
      if (state.phase !== 'resolving') return state;
      const [id1, id2] = state.flippedIds;
      const card1 = state.cards.find(c => c.id === id1)!;
      const card2 = state.cards.find(c => c.id === id2)!;
      const cp = state.currentPlayer;
      const currentP = state.players[cp];
      const isMatch = card1.pairId === card2.pairId;

      // ── ハズレ ─────────────────────────────────────────────────────────
      if (!isMatch) {
        const newCards = state.cards.map(c =>
          c.id === id1 || c.id === id2 ? { ...c, revealed: false } : c,
        );
        const ps = clonePlayersPair(state.players);
        ps[cp].memorySealed = false;

        const { nextPlayer, players: advPs } = advanceTurn(ps, cp);
        return {
          ...state,
          cards: newCards,
          players: advPs,
          currentPlayer: nextPlayer,
          flippedIds: [],
          consecutiveMatches: 0,
          phase: 'playing',
          log: pushLog(state.log, log(`${currentP.name}：ハズレ`, 'miss')),
        };
      }

      // ── ペア成立 ──────────────────────────────────────────────────────
      const pts = calcScore(state.consecutiveMatches, currentP.farmerBonus);
      const newCards = state.cards.map(c =>
        c.id === id1 || c.id === id2 ? { ...c, taken: true, revealed: false, takenBy: cp } : c,
      );
      const ps = clonePlayersPair(state.players);
      ps[cp] = {
        ...ps[cp],
        score: ps[cp].score + pts,
        sp: Math.min(ps[cp].sp + 1, SP_MAX),
        takenIds: [...ps[cp].takenIds, id1, id2],
        memorySealed: false,
      };

      const newConsecutive = state.consecutiveMatches + 1;
      const logText = `${ps[cp].name}：ペア取得！+${pts}pt${newConsecutive > 1 ? ` (${newConsecutive}連続)` : ''}`;

      // セット完成チェック
      const setType = card1.setType;
      const setJustCompleted =
        !ps[cp].completedSets.includes(setType) &&
        checkSetCompletion(newCards, cp, setType);

      if (setJustCompleted) {
        ps[cp].completedSets = [...ps[cp].completedSets, setType];
        return {
          ...state,
          cards: newCards,
          players: ps,
          flippedIds: [],
          consecutiveMatches: newConsecutive,
          pendingBonus: { player: cp, setType },
          phase: 'set_bonus',
          log: pushLog(state.log, log(logText, 'match')),
        };
      }

      // ゲーム終了チェック
      if (isGameOver(newCards)) {
        return {
          ...state,
          cards: newCards,
          players: ps,
          flippedIds: [],
          consecutiveMatches: newConsecutive,
          phase: 'game_over',
          winner: determineWinner(ps),
          log: pushLog(state.log, log(logText, 'match')),
        };
      }

      // まだ継続できる（3連続未満）
      if (newConsecutive < MAX_CONSECUTIVE) {
        return {
          ...state,
          cards: newCards,
          players: ps,
          flippedIds: [],
          consecutiveMatches: newConsecutive,
          phase: 'playing',
          log: pushLog(state.log, log(logText, 'match')),
        };
      }

      // 3連続到達 → ターン交代
      const { nextPlayer, players: advPs } = advanceTurn(ps, cp);
      return {
        ...state,
        cards: newCards,
        players: advPs,
        currentPlayer: nextPlayer,
        flippedIds: [],
        consecutiveMatches: 0,
        phase: 'playing',
        log: pushLog(state.log, log(logText + '（3連続）', 'match')),
      };
    }

    // ──────────────────────────────────────────── CLOSE_BONUS
    case 'CLOSE_BONUS': {
      if (!state.pendingBonus) return state;
      const { player: bPlayer, setType } = state.pendingBonus;
      const setDef = SET_DEFS.find(s => s.type === setType)!;
      const ps = clonePlayersPair(state.players);
      const cp = state.currentPlayer;
      const logText = `${ps[bPlayer].name}：${setDef.name}コンプリート！→ ${setDef.bonusName}`;

      switch (setType) {
        case 'knight':
          ps[opp(bPlayer)].skipNextTurn = true;
          break;
        case 'merchant':
          ps[bPlayer].score += 500;
          break;
        case 'mage': {
          const mageIds = pickMageRevealIds(state.cards);
          return {
            ...state,
            players: ps,
            pendingBonus: null,
            phase: 'mage_reveal',
            mageRevealIds: mageIds,
            log: pushLog(state.log, log(logText, 'bonus')),
          };
        }
        case 'farmer':
          ps[bPlayer].farmerBonus = true;
          break;
        case 'temple':
          ps[bPlayer].sp = SP_MAX;
          break;
      }

      if (isGameOver(state.cards)) {
        return {
          ...state,
          players: ps,
          pendingBonus: null,
          phase: 'game_over',
          winner: determineWinner(ps),
          log: pushLog(state.log, log(logText, 'bonus')),
        };
      }

      // ターン継続または交代
      if (state.consecutiveMatches < MAX_CONSECUTIVE) {
        return {
          ...state,
          players: ps,
          pendingBonus: null,
          phase: 'playing',
          log: pushLog(state.log, log(logText, 'bonus')),
        };
      }

      const { nextPlayer, players: advPs } = advanceTurn(ps, cp);
      return {
        ...state,
        players: advPs,
        currentPlayer: nextPlayer,
        pendingBonus: null,
        consecutiveMatches: 0,
        phase: 'playing',
        log: pushLog(state.log, log(logText, 'bonus')),
      };
    }

    // ──────────────────────────────────────────── END_MAGE
    case 'END_MAGE': {
      const cp = state.currentPlayer;
      const ps = clonePlayersPair(state.players);

      if (isGameOver(state.cards)) {
        return { ...state, players: ps, mageRevealIds: [], phase: 'game_over', winner: determineWinner(ps) };
      }
      if (state.consecutiveMatches < MAX_CONSECUTIVE) {
        return { ...state, mageRevealIds: [], phase: 'playing' };
      }
      const { nextPlayer, players: advPs } = advanceTurn(ps, cp);
      return {
        ...state,
        players: advPs,
        currentPlayer: nextPlayer,
        mageRevealIds: [],
        consecutiveMatches: 0,
        phase: 'playing',
      };
    }

    // ──────────────────────────────────────────── USE_SKILL
    case 'USE_SKILL': {
      const { skillId } = action;
      const cp = state.currentPlayer;
      const player = state.players[cp];
      if (!player.skills.includes(skillId)) return state;

      const spCost: Record<string, number> = { scout: 1, seal: 2, extra: 2, steal: 3 };
      const cost = spCost[skillId];
      if (player.sp < cost) return state;

      const ps = clonePlayersPair(state.players);
      ps[cp] = { ...ps[cp], sp: ps[cp].sp - cost };

      switch (skillId) {
        case 'scout':
          return {
            ...state, players: ps, phase: 'scout_target',
            log: pushLog(state.log, log(`${player.name}：偵察発動`, 'skill')),
          };
        case 'seal':
          ps[opp(cp)].memorySealed = true;
          return {
            ...state, players: ps,
            log: pushLog(state.log, log(`${player.name}：記憶封印発動`, 'skill')),
          };
        case 'extra':
          ps[cp].extraTurn = true;
          return {
            ...state, players: ps,
            log: pushLog(state.log, log(`${player.name}：連続行動発動`, 'skill')),
          };
        case 'steal':
          return {
            ...state, players: ps, phase: 'steal_target',
            log: pushLog(state.log, log(`${player.name}：強奪発動`, 'skill')),
          };
        default:
          return state;
      }
    }

    // ──────────────────────────────────────────── SCOUT_PICK
    case 'SCOUT_PICK': {
      const { cardId } = action;
      const card = state.cards.find(c => c.id === cardId);
      if (!card || card.taken || card.revealed) return { ...state, phase: 'playing' };
      const newCards = state.cards.map(c =>
        c.id === cardId ? { ...c, revealed: true, scouted: true } : c,
      );
      return { ...state, cards: newCards, phase: 'playing' };
    }

    // ──────────────────────────────────────────── CLEAR_SCOUT
    case 'CLEAR_SCOUT': {
      const newCards = state.cards.map(c =>
        c.id === action.cardId ? { ...c, revealed: false, scouted: false } : c,
      );
      return { ...state, cards: newCards };
    }

    // ──────────────────────────────────────────── STEAL_PICK
    case 'STEAL_PICK': {
      const { cardId } = action;
      const cp = state.currentPlayer;
      const card = state.cards.find(c => c.id === cardId);
      if (!card || !card.taken || card.takenBy !== opp(cp)) {
        return { ...state, phase: 'playing' };
      }

      const ps = clonePlayersPair(state.players);
      const oppIdx = opp(cp);
      const newCards = state.cards.map(c => c.id === cardId ? { ...c, takenBy: cp } : c);

      // 相手のセット完成を取り消す可能性
      const oppStillOwnsSet = newCards
        .filter(c => c.setType === card.setType)
        .every(c => c.takenBy === oppIdx);
      if (!oppStillOwnsSet) {
        ps[oppIdx].completedSets = ps[oppIdx].completedSets.filter(s => s !== card.setType);
      }

      ps[oppIdx].takenIds = ps[oppIdx].takenIds.filter(id => id !== cardId);
      ps[cp].takenIds = [...ps[cp].takenIds, cardId];

      // 自分のセット完成チェック
      const mySetComplete =
        !ps[cp].completedSets.includes(card.setType) &&
        checkSetCompletion(newCards, cp, card.setType);

      if (mySetComplete) {
        ps[cp].completedSets = [...ps[cp].completedSets, card.setType];
        return {
          ...state,
          cards: newCards,
          players: ps,
          pendingBonus: { player: cp, setType: card.setType },
          phase: 'set_bonus',
          log: pushLog(state.log, log(`${ps[cp].name}：強奪でセット完成！`, 'skill')),
        };
      }

      return {
        ...state,
        cards: newCards,
        players: ps,
        phase: 'playing',
        log: pushLog(state.log, log(`${ps[cp].name}：${ps[oppIdx].name}からカードを強奪！`, 'skill')),
      };
    }

    // ──────────────────────────────────────────── RESET
    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
