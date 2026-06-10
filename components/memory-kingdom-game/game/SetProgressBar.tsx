'use client';

import { Card, PlayerState } from '@/lib/memory-kingdom-game/types';
import { SET_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  cards: Card[];
  players: [PlayerState, PlayerState];
}

export default function SetProgressBar({ cards, players }: Props) {
  return (
    <div className="flex justify-around px-3 py-1.5">
      {SET_DEFS.map(setDef => {
        const setCards = cards.filter(c => c.setType === setDef.type);
        const p0Count = setCards.filter(c => c.takenBy === 0).length;
        const p1Count = setCards.filter(c => c.takenBy === 1).length;
        const total = setCards.length; // 4

        return (
          <div key={setDef.type} className="flex flex-col items-center gap-0.5">
            <span className="text-sm leading-none">{setDef.icon}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: total }).map((_, i) => {
                let bg = 'rgba(255,255,255,0.1)';
                if (i < p0Count) bg = '#f97316';          // P1 = orange
                else if (i < p0Count + p1Count) bg = '#3b82f6'; // P2 = blue
                return (
                  <div
                    key={i}
                    className="w-2 h-3 rounded-sm transition-all"
                    style={{ background: bg }}
                  />
                );
              })}
            </div>
            {(players[0].completedSets.includes(setDef.type) || players[1].completedSets.includes(setDef.type)) && (
              <span className="text-[8px] font-bold" style={{
                color: players[0].completedSets.includes(setDef.type) ? '#f97316' : '#3b82f6',
              }}>
                COMP!
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
