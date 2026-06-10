'use client';

import { useState } from 'react';
import { useMemoryKingdom } from '@/hooks/useMemoryKingdom';
import { useOnlineGame } from '@/hooks/useOnlineGame';
import ModeSelectScreen from './screens/ModeSelectScreen';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import OnlineLobbyScreen from './screens/OnlineLobbyScreen';
import OnlineWaitingScreen from './screens/OnlineWaitingScreen';

type AppMode = null | 'local' | 'online';

export default function GameContainer() {
  const [mode, setMode] = useState<AppMode>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 48,
          boxShadow: '0 0 0 8px #111827, 0 0 0 10px #1f2937, 0 32px 80px rgba(0,0,0,0.9)',
          flexShrink: 0,
        }}
      >
        {mode === null && (
          <ModeSelectScreen
            onSelectLocal={() => setMode('local')}
            onSelectOnline={() => setMode('online')}
          />
        )}
        {mode === 'local' && <LocalGame onBack={() => setMode(null)} />}
        {mode === 'online' && <OnlineGame onBack={() => setMode(null)} />}
      </div>
    </div>
  );
}

// ─── ローカルゲーム ────────────────────────────────────────────────────────

function LocalGame({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useMemoryKingdom();

  if (state.phase === 'setup') return <SetupScreen dispatch={dispatch} onBack={onBack} />;
  if (state.phase === 'game_over') return <ResultScreen state={state} dispatch={dispatch} />;
  return <GameScreen state={state} dispatch={dispatch} />;
}

// ─── オンラインゲーム ──────────────────────────────────────────────────────

function OnlineGame({ onBack }: { onBack: () => void }) {
  const online = useOnlineGame();

  const {
    onlinePhase, roomCode, roomData, gameState,
    myPlayerIdx, isMyTurn, isHost, opponentName, opponentConnected,
    error, loading,
    handleCreateRoom, handleJoinRoom, handleStartGame, handleRematch, handleLeave,
    dispatch,
  } = online;

  function handleBack() {
    handleLeave();
    onBack();
  }

  // ── ロビー（作成 / 参加） ────────────────────────────────────────────────
  if (onlinePhase === 'lobby') {
    return (
      <OnlineLobbyScreen
        loading={loading}
        error={error}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onBack={handleBack}
      />
    );
  }

  // ── 待機（相手待ち / ホスト待ち） ────────────────────────────────────────
  if (onlinePhase === 'waiting') {
    return (
      <OnlineWaitingScreen
        roomCode={roomCode}
        roomData={roomData}
        sessionId={online.sessionId}
        isHost={isHost}
        loading={loading}
        error={error}
        onStartGame={handleStartGame}
        onLeave={handleBack}
      />
    );
  }

  // ── 対戦中 ───────────────────────────────────────────────────────────────
  if (onlinePhase === 'playing' && gameState) {
    return (
      <div className="relative w-full h-full">
        <GameScreen
          state={gameState}
          dispatch={dispatch}
          myPlayerIdx={myPlayerIdx ?? undefined}
          isMyTurn={isMyTurn}
          opponentName={opponentName}
        />
        {/* 接続状態バッジ */}
        {!opponentConnected && (
          <div
            className="absolute top-14 inset-x-0 mx-6 py-2 px-4 rounded-xl text-center text-xs font-bold text-red-300 z-40"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            ⚠️ 相手との接続が不安定です
          </div>
        )}
      </div>
    );
  }

  // ── 終了 ─────────────────────────────────────────────────────────────────
  if ((onlinePhase === 'finished' || onlinePhase === 'playing') && gameState?.phase === 'game_over') {
    return (
      <OnlineResultScreen
        gameState={gameState}
        myPlayerIdx={myPlayerIdx}
        isHost={isHost}
        loading={loading}
        error={error}
        onRematch={handleRematch}
        onLeave={handleBack}
      />
    );
  }

  // ── ローディング ──────────────────────────────────────────────────────────
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-4"
      style={{ background: '#0d1117' }}
    >
      <div className="text-5xl">🌐</div>
      <p className="text-blue-300 font-bold">接続中...</p>
      {error && (
        <div
          className="mx-6 px-4 py-3 rounded-xl text-red-300 text-sm font-bold"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {error}
        </div>
      )}
      <button
        onClick={handleBack}
        className="px-6 py-2 rounded-xl text-gray-400 text-sm"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        戻る
      </button>
    </div>
  );
}

// ─── オンライン終了画面 ────────────────────────────────────────────────────

import { GameState, PlayerIdx } from '@/lib/memory-kingdom-game/types';
import { SET_DEFS, KINGDOM_LEVELS, SCORE_TO_GOLD, SET_TO_WOOD, SP_MAX } from '@/lib/memory-kingdom-game/constants';

function calcResources(player: GameState['players'][0]) {
  const gold = Math.floor(player.score / SCORE_TO_GOLD);
  const wood  = player.completedSets.length * SET_TO_WOOD;
  const magic = Math.max(0, SP_MAX - player.sp);
  const total = gold + wood + magic;
  const level = Math.max(1, Math.floor(total / 5) + 1);
  const levelInfo = KINGDOM_LEVELS.find(l => level >= l.minLevel && level <= l.maxLevel)
    ?? KINGDOM_LEVELS[KINGDOM_LEVELS.length - 1];
  return { gold, wood, magic, level, levelInfo };
}

const PLAYER_COLORS = ['#f97316', '#3b82f6'] as const;

function OnlineResultScreen({
  gameState, myPlayerIdx, isHost, loading, error, onRematch, onLeave,
}: {
  gameState: GameState;
  myPlayerIdx: PlayerIdx | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
  onRematch: () => void;
  onLeave: () => void;
}) {
  const { players, winner } = gameState;
  const myIdx = myPlayerIdx ?? 0;
  const oppIdx = myIdx === 0 ? 1 : 0;
  const myPlayer  = players[myIdx];
  const oppPlayer = players[oppIdx];
  const myRes  = calcResources(myPlayer);
  const oppRes = calcResources(oppPlayer);

  const resultText = winner === 'draw' ? '引き分け'
    : winner === myIdx ? '🎉 勝利！' : '😢 敗北...';
  const resultColor = winner === 'draw' ? '#94a3b8'
    : winner === myIdx ? '#fbbf24' : '#ef4444';

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(175deg, #0a0a1a 0%, #1a0a35 50%, #0a1a0a 100%)' }}
    >
      <div className="pt-14 pb-6 flex flex-col items-center">
        <h2
          className="text-5xl font-black"
          style={{ color: resultColor, filter: `drop-shadow(0 0 16px ${resultColor}66)` }}
        >
          {resultText}
        </h2>
      </div>

      {/* スコア */}
      <div className="mx-5 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {([myPlayer, oppPlayer] as const).map((p, i) => {
          const isMe = i === 0;
          return (
            <div key={p.idx} className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{isMe ? '👤' : '🧙'}</span>
                <div>
                  <p className="text-white font-bold text-sm">{p.name}{isMe ? '（あなた）' : ''}</p>
                  <p className="text-xs text-gray-400">
                    {p.completedSets.map(s => SET_DEFS.find(d => d.type === s)!.icon).join('')}
                    {' '}取得{Math.floor(p.takenIds.length / 2)}ペア
                  </p>
                </div>
              </div>
              <p className="font-black text-2xl" style={{ color: PLAYER_COLORS[p.idx] }}>
                {p.score.toLocaleString()}pt
              </p>
            </div>
          );
        })}
      </div>

      {/* 王国成長 */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        {([myRes, oppRes] as const).map((res, i) => (
          <div key={i} className="rounded-xl p-3"
            style={{ background: `${PLAYER_COLORS[i === 0 ? myIdx : oppIdx]}11`, border: `1px solid ${PLAYER_COLORS[i === 0 ? myIdx : oppIdx]}33` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-2xl">{res.levelInfo.icon}</span>
              <div>
                <p className="text-white text-xs font-bold">{i === 0 ? myPlayer.name : oppPlayer.name}</p>
                <p className="text-[10px]" style={{ color: PLAYER_COLORS[i === 0 ? myIdx : oppIdx] }}>Lv.{res.level}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-yellow-300">💰{res.gold}</span>
              <span className="text-green-300">🪵{res.wood}</span>
              <span className="text-purple-300">💎{res.magic}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mx-5 mt-3 px-4 py-2 rounded-xl text-red-300 text-xs font-bold"
          style={{ background: 'rgba(239,68,68,0.15)' }}>
          {error}
        </div>
      )}

      <div className="px-5 py-6 flex flex-col gap-3">
        {isHost && (
          <button
            onClick={onRematch}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95"
            style={{ background: 'linear-gradient(135deg,#2563eb,#1e3a8a)', boxShadow: '0 4px 24px rgba(37,99,235,0.4)' }}
          >
            {loading ? '⏳...' : '🔄 リマッチ（ホストが開始）'}
          </button>
        )}
        {!isHost && (
          <div className="w-full py-4 rounded-2xl text-center text-blue-300 text-sm font-bold"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)' }}>
            ホストのリマッチ待ち...
          </div>
        )}
        <button
          onClick={onLeave}
          className="w-full py-3 rounded-2xl text-sm font-bold text-gray-400 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          退出する
        </button>
      </div>
    </div>
  );
}
