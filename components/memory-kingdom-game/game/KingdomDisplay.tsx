'use client';

import { PlayerState } from '@/lib/memory-kingdom-game/types';
import { KINGDOM_LEVELS, SCORE_TO_GOLD, SET_TO_WOOD, SKILL_TO_MAGIC } from '@/lib/memory-kingdom-game/constants';

interface Props {
  players: [PlayerState, PlayerState];
}

function calcKingdom(player: PlayerState) {
  const gold = Math.floor(player.score / SCORE_TO_GOLD);
  const wood = player.completedSets.length * SET_TO_WOOD;
  // スキル使用回数はStateに持たないのでSPから逆算（近似）
  const magicStone = Math.max(0, (5 - player.sp) * 1);
  const total = gold + wood + magicStone;
  const level = Math.max(1, Math.floor(total / 5) + 1);
  const levelInfo = KINGDOM_LEVELS.find(l => level >= l.minLevel && level <= l.maxLevel)
    ?? KINGDOM_LEVELS[KINGDOM_LEVELS.length - 1];
  return { gold, wood, magicStone, level, levelInfo };
}

const PLAYER_COLORS = ['#f97316', '#3b82f6'] as const;

export default function KingdomDisplay({ players }: Props) {
  return (
    <div className="flex gap-2 px-3 py-2">
      {players.map((player, i) => {
        const { gold, wood, magicStone, level, levelInfo } = calcKingdom(player);
        return (
          <div
            key={player.idx}
            className="flex-1 rounded-xl p-2"
            style={{
              background: `${PLAYER_COLORS[i]}0f`,
              border: `1px solid ${PLAYER_COLORS[i]}33`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl leading-none">{levelInfo.icon}</span>
              <div>
                <p className="text-white font-bold text-xs leading-none">{player.name}</p>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: PLAYER_COLORS[i] }}>
                  Lv.{level} {levelInfo.label}
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-[10px]">
              <span className="text-yellow-300">💰{gold}</span>
              <span className="text-green-300">🪵{wood}</span>
              <span className="text-purple-300">💎{magicStone}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
