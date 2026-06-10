import {
  doc, getDoc, updateDoc, onSnapshot, setDoc, runTransaction,
} from 'firebase/firestore';
import { db } from './config';
import { GameState, SkillId, PlayerIdx } from '@/lib/memory-kingdom-game/types';

export const ROOMS_COL = 'mk_rooms';
const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2時間

// ─── 型定義 ────────────────────────────────────────────────────────────────

export interface RoomPlayer {
  sessionId: string;
  name: string;
  skills: SkillId[];
  playerIdx: PlayerIdx;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomData {
  code: string;
  status: RoomStatus;
  createdAt: number;
  expiresAt: number;
  hostSessionId: string;
  /** キー: sessionId */
  players: Record<string, RoomPlayer>;
  gameState: GameState | null;
  lastUpdatedBy: string;
  lastUpdatedAt: number;
}

// ─── ユーティリティ ────────────────────────────────────────────────────────

/** undefined を再帰的に null に変換（Firestore はundefinedを拒否する） */
function sanitize(v: unknown): unknown {
  if (v === undefined) return null;
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    out[k] = sanitize(val);
  }
  return out;
}

function generateCode(): string {
  // 紛らわしい文字（0/O, 1/I）を除いた6桁英数字
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'mk-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ─── ルーム操作 ────────────────────────────────────────────────────────────

/** ルームを作成し、6桁ルームコードを返す */
export async function createRoom(
  sessionId: string,
  playerName: string,
  skills: SkillId[],
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    const ref = doc(db, ROOMS_COL, code);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const now = Date.now();
      const room: RoomData = {
        code,
        status: 'waiting',
        createdAt: now,
        expiresAt: now + EXPIRY_MS,
        hostSessionId: sessionId,
        players: {
          [sessionId]: { sessionId, name: playerName, skills, playerIdx: 0 },
        },
        gameState: null,
        lastUpdatedBy: sessionId,
        lastUpdatedAt: now,
      };
      await setDoc(ref, sanitize(room) as RoomData);
      return code;
    }
  }
  throw new Error('ルームコードの生成に失敗しました');
}

/** ルームに参加する */
export async function joinRoom(
  code: string,
  sessionId: string,
  playerName: string,
  skills: SkillId[],
): Promise<RoomData> {
  const ref = doc(db, ROOMS_COL, code.toUpperCase());

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('ルームが見つかりません');

    const room = snap.data() as RoomData;
    if (room.status !== 'waiting') throw new Error('このルームはすでに開始されています');

    // すでに参加済みの場合はそのまま返す
    if (room.players[sessionId]) return room;

    const count = Object.keys(room.players).length;
    if (count >= 2) throw new Error('ルームが満員です（2/2）');

    const now = Date.now();
    const updated: Partial<RoomData> = {
      players: {
        ...room.players,
        [sessionId]: { sessionId, name: playerName, skills, playerIdx: 1 },
      },
      lastUpdatedBy: sessionId,
      lastUpdatedAt: now,
    };
    tx.update(ref, sanitize(updated) as Record<string, unknown>);
    return { ...room, ...updated } as RoomData;
  });

  return result;
}

/** ゲーム開始（ホストのみ） */
export async function startGameInRoom(
  code: string,
  sessionId: string,
  gameState: GameState,
): Promise<void> {
  const ref = doc(db, ROOMS_COL, code);
  await updateDoc(ref, sanitize({
    status: 'playing',
    gameState,
    lastUpdatedBy: sessionId,
    lastUpdatedAt: Date.now(),
  }) as Record<string, unknown>);
}

/** ゲーム状態を更新 */
export async function updateGameState(
  code: string,
  sessionId: string,
  gameState: GameState,
): Promise<void> {
  const ref = doc(db, ROOMS_COL, code);
  await updateDoc(ref, sanitize({
    gameState,
    status: gameState.phase === 'game_over' ? 'finished' : undefined,
    lastUpdatedBy: sessionId,
    lastUpdatedAt: Date.now(),
  }) as Record<string, unknown>);
}

/** ルームを再初期化してリマッチ */
export async function rematchRoom(
  code: string,
  sessionId: string,
): Promise<void> {
  const ref = doc(db, ROOMS_COL, code);
  await updateDoc(ref, sanitize({
    status: 'waiting',
    gameState: null,
    lastUpdatedBy: sessionId,
    lastUpdatedAt: Date.now(),
  }) as Record<string, unknown>);
}

/** ルームをリアルタイムで購読 */
export function subscribeToRoom(
  code: string,
  onData: (room: RoomData) => void,
  onError: (err: Error) => void,
): () => void {
  const ref = doc(db, ROOMS_COL, code);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) onData(snap.data() as RoomData);
  }, onError);
}
