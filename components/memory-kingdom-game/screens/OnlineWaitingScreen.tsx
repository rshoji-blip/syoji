'use client';

import { useState, useEffect } from 'react';
import { RoomData } from '@/lib/firebase/roomService';

interface Props {
  roomCode: string;
  roomData: RoomData | null;
  sessionId: string;
  isHost: boolean;
  loading: boolean;
  error: string | null;
  onStartGame: () => void;
  onLeave: () => void;
}

export default function OnlineWaitingScreen({
  roomCode, roomData, sessionId, isHost, loading, error, onStartGame, onLeave,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState('');

  const players = Object.values(roomData?.players ?? {}).sort((a, b) => a.playerIdx - b.playerIdx);
  const opponentJoined = players.length >= 2;

  useEffect(() => {
    if (opponentJoined) return;
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(t);
  }, [opponentJoined]);

  async function copyCode() {
    await navigator.clipboard.writeText(roomCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #0d1117 0%, #0a0f1e 60%, #0d1117 100%)' }}
    >
      {/* ヘッダー */}
      <div className="w-full px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.2) 0%, transparent 100%)' }}>
        <button
          onClick={onLeave}
          className="w-9 h-9 rounded-full flex items-center justify-center text-blue-300 text-lg"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <div>
          <p className="text-gray-400 text-xs">オンライン対戦</p>
          <h2 className="text-white font-bold text-lg">ルーム待機中</h2>
        </div>
        <span className="ml-auto text-2xl">🌐</span>
      </div>

      {/* ルームコード */}
      <div className="mt-6 mx-5 w-[calc(100%-40px)]">
        <p className="text-gray-400 text-xs text-center mb-2">ルームコード（相手に共有）</p>
        <button
          onClick={copyCode}
          className="w-full py-5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-98"
          style={{
            background: 'rgba(255,200,80,0.1)',
            border: '2px dashed rgba(255,200,80,0.4)',
          }}
        >
          <span
            className="font-black tracking-[0.5em] text-4xl"
            style={{ color: '#fbbf24' }}
          >
            {roomCode}
          </span>
          <span className="text-amber-600 text-xs">
            {copied ? '✓ コピーしました！' : 'タップでコピー'}
          </span>
        </button>
      </div>

      {/* プレイヤー一覧 */}
      <div className="mt-6 mx-5 w-[calc(100%-40px)] space-y-2">
        <p className="text-gray-400 text-xs">参加プレイヤー</p>

        {[0, 1].map((idx) => {
          const p = players[idx];
          const isMe = p?.sessionId === sessionId;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: p
                  ? (isMe ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)')
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${p
                  ? (isMe ? 'rgba(249,115,22,0.4)' : 'rgba(59,130,246,0.4)')
                  : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                style={{
                  background: p
                    ? (isMe ? '#f97316' : '#3b82f6')
                    : 'rgba(255,255,255,0.1)',
                  color: 'white',
                }}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                {p ? (
                  <>
                    <p className="text-white font-bold text-sm leading-none">{p.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {isMe ? '（あなた）' : '参加済み'} · スキル{p.skills.length}枚選択
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">待機中{dots}</p>
                )}
              </div>
              {p && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ゲーム開始ボタン（ホストのみ・2人揃ったとき） */}
      <div className="mt-auto w-full px-5 pb-10 space-y-3">
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-red-300 text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!opponentJoined || loading}
            className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-all"
            style={{
              background: opponentJoined && !loading
                ? 'linear-gradient(135deg, #dc2626, #7f1d1d)'
                : 'rgba(255,255,255,0.08)',
              boxShadow: opponentJoined && !loading ? '0 4px 24px rgba(220,38,38,0.5)' : 'none',
              color: opponentJoined && !loading ? 'white' : 'rgba(255,255,255,0.3)',
            }}
          >
            {loading ? '⏳ 開始中...' : opponentJoined ? '⚔️ ゲーム開始！' : `相手を待っています${dots}`}
          </button>
        ) : (
          <div
            className="w-full py-4 rounded-2xl text-center font-bold text-blue-300"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            ホストがゲームを開始するまでお待ちください{dots}
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
