'use client';

import { useState, useCallback } from 'react';
import { MATCH_SCORES } from '@/lib/memory-kingdom-game/constants';

export interface FloatEntry {
  id: number;
  x: number;
  y: number;
  score: number;
  color: string;
}

interface Props {
  floats: FloatEntry[];
}

export function MatchEffect({ floats }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {floats.map(f => (
        <div key={f.id} className="absolute" style={{ left: f.x, top: f.y }}>
          {/* ring */}
          <div
            className="mk-ring-pulse absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              border: `3px solid ${f.color}`,
              boxShadow: `0 0 12px ${f.color}`,
            }}
          />
          {/* score float */}
          <div
            className="mk-score-float font-black text-lg whitespace-nowrap"
            style={{
              color: f.color,
              textShadow: `0 0 12px ${f.color}, 0 1px 0 rgba(0,0,0,0.9)`,
              transform: 'translateX(-50%)',
            }}
          >
            +{f.score}pt
          </div>
        </div>
      ))}
    </div>
  );
}

let _nextId = 0;

export function useMatchFloats() {
  const [floats, setFloats] = useState<FloatEntry[]>([]);

  const addFloat = useCallback((x: number, y: number, consecutive: number, playerIdx: number) => {
    const score = MATCH_SCORES[Math.min(consecutive, MATCH_SCORES.length - 1)];
    const color = playerIdx === 0 ? '#f97316' : '#3b82f6';
    const id = _nextId++;
    setFloats(prev => [...prev, { id, x, y, score, color }]);
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 1200);
  }, []);

  return { floats, addFloat };
}
