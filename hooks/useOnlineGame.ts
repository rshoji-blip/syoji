'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState, GameAction, PlayerIdx, SkillId,
} from '@/lib/memory-kingdom-game/types';
import { gameReducer, createInitialState } from '@/lib/memory-kingdom-game/gameLogic';
import {
  RoomData, getOrCreateSessionId,
  createRoom, joinRoom, startGameInRoom,
  updateGameState, rematchRoom, subscribeToRoom,
} from '@/lib/firebase/roomService';

export type OnlinePhase =
  | 'mode_select'      // ローカル or オンライン選択前
  | 'lobby'            // 作成 or 参加画面
  | 'waiting'          // 相手待ち or ホスト待ち
  | 'playing'          // 対戦中
  | 'finished';        // 終了

export interface UseOnlineGameReturn {
  sessionId: string;
  onlinePhase: OnlinePhase;
  roomCode: string;
  roomData: RoomData | null;
  gameState: GameState | null;
  myPlayerIdx: PlayerIdx | null;
  isMyTurn: boolean;
  isHost: boolean;
  opponentName: string;
  opponentConnected: boolean;
  error: string | null;
  loading: boolean;
  dispatch: (action: GameAction) => Promise<void>;
  handleCreateRoom: (name: string, skills: SkillId[]) => Promise<void>;
  handleJoinRoom:   (code: string, name: string, skills: SkillId[]) => Promise<void>;
  handleStartGame:  () => Promise<void>;
  handleRematch:    () => Promise<void>;
  handleLeave:      () => void;
}

export function useOnlineGame(): UseOnlineGameReturn {
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [onlinePhase, setOnlinePhase] = useState<OnlinePhase>('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── 派生値 ────────────────────────────────────────────────────────────────

  const myPlayer = roomData?.players[sessionId] ?? null;
  const myPlayerIdx: PlayerIdx | null = myPlayer?.playerIdx ?? null;
  const isHost = roomData?.hostSessionId === sessionId;

  const opponentEntry = Object.values(roomData?.players ?? {}).find(
    (p) => p.sessionId !== sessionId,
  ) ?? null;
  const opponentName = opponentEntry?.name ?? '相手';
  const opponentConnected = opponentEntry !== null;

  const isMyTurn =
    gameState !== null &&
    myPlayerIdx !== null &&
    gameState.currentPlayer === myPlayerIdx &&
    (gameState.phase !== 'game_over');

  // ─── Firebase 購読 ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!roomCode) return;
    const unsub = subscribeToRoom(
      roomCode,
      (room) => {
        setRoomData(room);
        if (room.gameState) {
          setGameState(room.gameState);
          if (room.status === 'playing' && onlinePhase !== 'playing') setOnlinePhase('playing');
          if (room.status === 'finished') setOnlinePhase('finished');
          if (room.status === 'waiting' && onlinePhase === 'finished') setOnlinePhase('waiting');
        }
      },
      (err) => setError(err.message),
    );
    return unsub;
  }, [roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── ゲームステート最新参照（タイマー内での安定アクセス用） ───────────────

  const gameStateRef = useRef<GameState | null>(null);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const isMyTurnRef = useRef(false);
  useEffect(() => { isMyTurnRef.current = isMyTurn; }, [isMyTurn]);

  // ─── タイマー効果（自分のターン中のみ実行） ──────────────────────────────

  // resolving → 1.3秒後に RESOLVE を Firebase へ書き込む
  useEffect(() => {
    if (!isMyTurn || gameState?.phase !== 'resolving') return;
    const sealed = gameState.players[gameState.currentPlayer].memorySealed;
    const delay = sealed ? 400 : 1300;
    const t = setTimeout(async () => {
      const latest = gameStateRef.current;
      if (!latest || latest.phase !== 'resolving' || !isMyTurnRef.current) return;
      const next = gameReducer(latest, { type: 'RESOLVE' });
      await updateGameState(roomCode, sessionId, next).catch((e) => setError(e.message));
    }, delay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, gameState?.phase, gameState?.flippedIds?.join(',')]);

  // mage_reveal → 3秒後に END_MAGE
  useEffect(() => {
    if (!isMyTurn || gameState?.phase !== 'mage_reveal') return;
    const t = setTimeout(async () => {
      const latest = gameStateRef.current;
      if (!latest || latest.phase !== 'mage_reveal' || !isMyTurnRef.current) return;
      const next = gameReducer(latest, { type: 'END_MAGE' });
      await updateGameState(roomCode, sessionId, next).catch((e) => setError(e.message));
    }, 3000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, gameState?.phase]);

  // 偵察 scouted → 2秒後に CLEAR_SCOUT
  useEffect(() => {
    if (!gameState) return;
    const scouted = gameState.cards.find((c) => c.scouted);
    if (!scouted || !isMyTurn) return;
    const t = setTimeout(async () => {
      const latest = gameStateRef.current;
      if (!latest) return;
      const still = latest.cards.find((c) => c.id === scouted.id && c.scouted);
      if (!still) return;
      const next = gameReducer(latest, { type: 'CLEAR_SCOUT', cardId: scouted.id });
      await updateGameState(roomCode, sessionId, next).catch((e) => setError(e.message));
    }, 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, gameState?.cards?.filter((c) => c.scouted).map((c) => c.id).join(',')]);

  // ─── アクション ────────────────────────────────────────────────────────────

  const dispatch = useCallback(async (action: GameAction) => {
    const latest = gameStateRef.current;
    if (!latest) return;

    // RESET はどちらのプレイヤーでも可（引き分け後など）
    if (action.type === 'RESET') {
      await rematchRoom(roomCode, sessionId).catch((e) => setError(e.message));
      return;
    }

    // ゲーム終了後は操作不可
    if (latest.phase === 'game_over') return;

    // 自分のターン以外は操作不可
    if (!isMyTurnRef.current) return;

    const next = gameReducer(latest, action);
    // UI の即時反映（楽観的更新）
    setGameState(next);
    await updateGameState(roomCode, sessionId, next).catch((e) => {
      setGameState(latest); // ロールバック
      setError(e.message);
    });
  }, [roomCode, sessionId]);

  // ─── ルーム操作 ────────────────────────────────────────────────────────────

  const handleCreateRoom = useCallback(async (name: string, skills: SkillId[]) => {
    setLoading(true);
    setError(null);
    try {
      const code = await createRoom(sessionId, name, skills);
      setRoomCode(code);
      setOnlinePhase('waiting');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleJoinRoom = useCallback(async (code: string, name: string, skills: SkillId[]) => {
    setLoading(true);
    setError(null);
    try {
      await joinRoom(code.toUpperCase(), sessionId, name, skills);
      setRoomCode(code.toUpperCase());
      setOnlinePhase('waiting');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleStartGame = useCallback(async () => {
    if (!roomData || !isHost) return;
    const playerList = Object.values(roomData.players).sort((a, b) => a.playerIdx - b.playerIdx);
    if (playerList.length < 2) { setError('相手が参加するまで待ってください'); return; }
    setLoading(true);
    setError(null);
    try {
      const p0 = playerList[0];
      const p1 = playerList[1];
      const initial = gameReducer(createInitialState(), {
        type: 'START',
        p1Name: p0.name,
        p2Name: p1.name,
        p1Skills: p0.skills,
        p2Skills: p1.skills,
      });
      await startGameInRoom(roomCode, sessionId, initial);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [roomData, isHost, roomCode, sessionId]);

  const handleRematch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await rematchRoom(roomCode, sessionId);
      setOnlinePhase('waiting');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [roomCode, sessionId]);

  const handleLeave = useCallback(() => {
    setRoomCode('');
    setRoomData(null);
    setGameState(null);
    setOnlinePhase('lobby');
    setError(null);
  }, []);

  return {
    sessionId,
    onlinePhase,
    roomCode,
    roomData,
    gameState,
    myPlayerIdx,
    isMyTurn,
    isHost,
    opponentName,
    opponentConnected,
    error,
    loading,
    dispatch,
    handleCreateRoom,
    handleJoinRoom,
    handleStartGame,
    handleRematch,
    handleLeave,
  };
}
