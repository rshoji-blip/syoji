'use client';

import { useState, useEffect } from 'react';
import { GameState, GameAction, PlayerIdx } from '@/lib/memory-kingdom-game/types';
import {
  SET_DEFS, KINGDOM_LEVELS, SCORE_TO_GOLD, SET_TO_WOOD, SP_MAX,
} from '@/lib/memory-kingdom-game/constants';

interface Props {
  state: GameState;
  dispatch: (a: GameAction) => void;
}

function calcResources(player: import('@/lib/memory-kingdom-game/types').PlayerState) {
  const gold = Math.floor(player.score / SCORE_TO_GOLD);
  const wood = player.completedSets.length * SET_TO_WOOD;
  const magicStone = Math.max(0, SP_MAX - player.sp);
  const fame = player.idx === 0
    ? (/* determined later */ 0)
    : 0;
  const total = gold + wood + magicStone;
  const level = Math.max(1, Math.floor(total / 5) + 1);
  const levelInfo = KINGDOM_LEVELS.find(l => level >= l.minLevel && level <= l.maxLevel)
    ?? KINGDOM_LEVELS[KINGDOM_LEVELS.length - 1];
  return { gold, wood, magicStone, level, levelInfo };
}

const PLAYER_COLORS = ['#f97316', '#3b82f6'] as const;
const PLAYER_ICONS = ['⚔️', '🔮'] as const;

export default function ResultScreen({ state, dispatch }: Props) {
  const { players, winner } = state;
  const [phase, setPhase] = useState<'result' | 'kingdom'>('result');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const winnerPlayer = winner === 'draw' ? null : players[winner as PlayerIdx];
  const p0res = calcResources(players[0]);
  const p1res = calcResources(players[1]);

  if (phase === 'kingdom') {
    return <KingdomPhase players={players} p0res={p0res} p1res={p1res} dispatch={dispatch} />;
  }

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(175deg, #0a0a1a 0%, #1a0a35 50%, #0a1a0a 100%)' }}
    >
      {/* 勝利バナー */}
      <div
        className="pt-14 pb-6 flex flex-col items-center relative"
        style={{ background: 'linear-gradient(180deg, rgba(255,200,0,0.1) 0%, transparent 100%)' }}
      >
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 blur-3xl rounded-full"
          style={{ width: 200, height: 100, background: 'rgba(255,200,0,0.2)' }}
        />
        {winner === 'draw' ? (
          <>
            <p className="text-2xl mb-1">🤝</p>
            <h2 className="text-4xl font-black text-white">引き分け</h2>
          </>
        ) : (
          <>
            <p className="text-amber-300 text-xs tracking-[0.4em] mb-1">WINNER</p>
            <h2
              className="text-5xl font-black"
              style={{
                background: `linear-gradient(135deg, ${PLAYER_COLORS[winnerPlayer!.idx]}, #ffd700)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {winnerPlayer!.name}
            </h2>
            <p className="text-amber-300 text-2xl mt-1">👑 勝利！</p>
          </>
        )}
      </div>

      {/* スコア比較 */}
      <div
        className={`mx-5 rounded-2xl overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {players.map((p, i) => (
          <div
            key={p.idx}
            className="px-4 py-3 flex items-center justify-between"
            style={{
              background: i === 0 ? 'transparent' : undefined,
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{PLAYER_ICONS[i]}</span>
              <div>
                <p className="text-white font-bold text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">
                  セット {p.completedSets.length}コンプ・取得 {Math.floor(p.takenIds.length / 2)}ペア
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className="font-black text-2xl"
                style={{ color: PLAYER_COLORS[i] }}
              >
                {p.score.toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs">pt</p>
            </div>
          </div>
        ))}
      </div>

      {/* セット取得内訳 */}
      <div
        className={`mx-5 mt-4 rounded-2xl p-4 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-gray-400 text-xs mb-3 text-center">セット取得状況</p>
        <div className="grid grid-cols-5 gap-2">
          {SET_DEFS.map(def => {
            const p0 = players[0].completedSets.includes(def.type);
            const p1 = players[1].completedSets.includes(def.type);
            return (
              <div key={def.type} className="flex flex-col items-center gap-1">
                <span className="text-xl">{def.icon}</span>
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: p0 ? PLAYER_COLORS[0] : 'rgba(255,255,255,0.1)' }}
                    title={players[0].name}
                  />
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: p1 ? PLAYER_COLORS[1] : 'rgba(255,255,255,0.1)' }}
                    title={players[1].name}
                  />
                </div>
                <p className="text-[9px] text-gray-500 text-center leading-tight">{def.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 資源プレビュー */}
      <div
        className={`mx-5 mt-4 rounded-2xl p-4 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-gray-400 text-xs mb-3 text-center">王国獲得資源（プレビュー）</p>
        <div className="grid grid-cols-2 gap-3">
          {([p0res, p1res] as const).map((res, i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: `${PLAYER_COLORS[i]}11`, border: `1px solid ${PLAYER_COLORS[i]}33` }}
            >
              <p className="text-white text-xs font-bold mb-2">{players[i].name}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-yellow-300">💰 金貨</span>
                  <span className="text-white font-bold">+{res.gold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300">🪵 木材</span>
                  <span className="text-white font-bold">+{res.wood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">💎 魔力石</span>
                  <span className="text-white font-bold">+{res.magicStone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ボタン */}
      <div className="px-5 py-6 flex flex-col gap-3">
        <button
          onClick={() => setPhase('kingdom')}
          className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #166534)',
            boxShadow: '0 4px 24px rgba(34,197,94,0.4)',
          }}
        >
          🏰 王国を育てる
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #e55d2b, #c0392b)',
            boxShadow: '0 4px 24px rgba(229,93,43,0.4)',
          }}
        >
          ⚔️ もう一度プレイ
        </button>
      </div>
    </div>
  );
}

// ── 王国発展フェーズ ─────────────────────────────────────────────────────────

interface KingdomPhaseProps {
  players: GameState['players'];
  p0res: ReturnType<typeof calcResources>;
  p1res: ReturnType<typeof calcResources>;
  dispatch: (a: GameAction) => void;
}

function KingdomPhase({ players, p0res, p1res, dispatch }: KingdomPhaseProps) {
  const [animIdx, setAnimIdx] = useState(0);
  const resources = [p0res, p1res];

  useEffect(() => {
    if (animIdx < 2) {
      const t = setTimeout(() => setAnimIdx(a => a + 1), 600);
      return () => clearTimeout(t);
    }
  }, [animIdx]);

  return (
    <div
      className="w-full h-full flex flex-col overflow-y-auto"
      style={{ background: 'linear-gradient(175deg, #0a1a0a 0%, #0d2a0d 60%, #0a0a1a 100%)' }}
    >
      <div className="pt-14 pb-4 flex flex-col items-center">
        <p className="text-green-300 text-xs tracking-[0.3em] mb-1">KINGDOM GROWTH</p>
        <h2 className="text-white font-bold text-2xl">王国が成長した！</h2>
      </div>

      <div className="px-5 space-y-4">
        {players.map((player, i) => {
          const res = resources[i];
          const isVisible = animIdx > i;
          return (
            <div
              key={player.idx}
              className="rounded-2xl p-5 transition-all duration-700"
              style={{
                background: `${PLAYER_COLORS[i]}11`,
                border: `1.5px solid ${PLAYER_COLORS[i]}44`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                boxShadow: isVisible ? `0 0 24px ${PLAYER_COLORS[i]}22` : 'none',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{res.levelInfo.icon}</span>
                <div>
                  <p className="text-white font-bold">{player.name}</p>
                  <p className="font-black text-xl" style={{ color: PLAYER_COLORS[i] }}>
                    Lv.{res.level} {res.levelInfo.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: '💰', label: '金貨', value: res.gold, color: '#fbbf24' },
                  { icon: '🪵', label: '木材', value: res.wood, color: '#86efac' },
                  { icon: '💎', label: '魔力石', value: res.magicStone, color: '#c4b5fd' },
                ].map(r => (
                  <div
                    key={r.label}
                    className="rounded-xl py-2"
                    style={{ background: `${r.color}11`, border: `1px solid ${r.color}33` }}
                  >
                    <p className="text-lg">{r.icon}</p>
                    <p className="font-black text-sm" style={{ color: r.color }}>+{r.value}</p>
                    <p className="text-gray-400 text-[10px]">{r.label}</p>
                  </div>
                ))}
              </div>

              {player.completedSets.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-400 text-xs">完成セット：</span>
                  {player.completedSets.map(st => {
                    const def = SET_DEFS.find(s => s.type === st)!;
                    return (
                      <span
                        key={st}
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${def.color}22`, color: def.color, border: `1px solid ${def.color}44` }}
                      >
                        {def.icon} {def.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-8">
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #e55d2b, #c0392b)',
            boxShadow: '0 4px 24px rgba(229,93,43,0.4)',
          }}
        >
          ⚔️ 次の対戦へ
        </button>
      </div>
    </div>
  );
}
