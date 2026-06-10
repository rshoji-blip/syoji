'use client';

import { PlayerState, PlayerIdx } from '@/lib/memory-kingdom-game/types';
import { SP_MAX, SET_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  player: PlayerState;
  isActive: boolean;
  side: 'top' | 'bottom';
}

const PLAYER_COLORS: Record<PlayerIdx, { bg: string; ring: string; spColor: string }> = {
  0: { bg: 'rgba(249,115,22,0.15)', ring: '#f97316', spColor: '#fbbf24' },
  1: { bg: 'rgba(59,130,246,0.15)', ring: '#3b82f6', spColor: '#93c5fd' },
};

export default function PlayerPanel({ player, isActive, side }: Props) {
  const colors = PLAYER_COLORS[player.idx];

  return (
    <div
      className="px-3 py-2 transition-all"
      style={{
        background: isActive ? colors.bg : 'rgba(255,255,255,0.03)',
        borderTop: side === 'bottom' ? `2px solid ${isActive ? colors.ring : 'transparent'}` : undefined,
        borderBottom: side === 'top' ? `2px solid ${isActive ? colors.ring : 'transparent'}` : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        {/* 名前・スコア */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${colors.ring}, ${colors.ring}88)`
                : 'rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            {player.idx + 1}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">{player.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {player.farmerBonus && (
                <span className="text-[9px] text-green-400 font-bold bg-green-900/30 px-1 rounded">🌾+30%</span>
              )}
              {player.extraTurn && (
                <span className="text-[9px] text-yellow-400 font-bold bg-yellow-900/30 px-1 rounded">⚡追加T</span>
              )}
              {player.skipNextTurn && (
                <span className="text-[9px] text-red-400 font-bold bg-red-900/30 px-1 rounded">⏭スキップ</span>
              )}
              {player.memorySealed && (
                <span className="text-[9px] text-purple-400 font-bold bg-purple-900/30 px-1 rounded">🌫封印</span>
              )}
            </div>
          </div>
        </div>

        {/* スコア */}
        <div className="text-right">
          <p
            className="font-black text-lg leading-none"
            style={{ color: isActive ? colors.ring : '#94a3b8' }}
          >
            {player.score.toLocaleString()}
          </p>
          <p className="text-gray-500 text-[10px]">pt</p>
        </div>
      </div>

      {/* SP + コンプリートセット */}
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[10px]">SP</span>
          {Array.from({ length: SP_MAX }).map((_, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-sm transition-all duration-300"
              style={{ background: i < player.sp ? colors.spColor : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <div className="flex items-center gap-0.5">
          {player.completedSets.map(st => {
            const def = SET_DEFS.find(s => s.type === st)!;
            return (
              <span key={st} className="text-xs" title={def.name}>{def.icon}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
