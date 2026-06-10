'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, GamePhase } from '@/lib/memory-kingdom-game/types';
import { SET_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  card: Card;
  phase: GamePhase;
  isSelectable: boolean;
  isScoutTarget: boolean;
  isStealTarget: boolean;
  isMageRevealed: boolean;
  onClick: () => void;
}

export default function CardTile({
  card, phase, isSelectable, isScoutTarget, isStealTarget, isMageRevealed, onClick,
}: Props) {
  const setDef = SET_DEFS.find(s => s.type === card.setType)!;
  const isVisible = card.revealed || card.scouted || isMageRevealed;
  const [justMatched, setJustMatched] = useState(false);
  const prevTakenRef = useRef(card.taken);

  useEffect(() => {
    if (!prevTakenRef.current && card.taken) {
      setJustMatched(true);
      setTimeout(() => setJustMatched(false), 900);
    }
    prevTakenRef.current = card.taken;
  }, [card.taken]);

  if (card.taken) {
    return (
      <div
        className={`aspect-[3/4] rounded-lg${justMatched ? ' mk-card-glow' : ''}`}
        style={{
          background: justMatched ? `${setDef.color}22` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${justMatched ? setDef.color + '66' : 'rgba(255,255,255,0.06)'}`,
        }}
      />
    );
  }

  const glowColor = card.scouted
    ? 'rgba(250,204,21,0.6)'
    : isMageRevealed
      ? 'rgba(168,85,247,0.6)'
      : isScoutTarget
        ? 'rgba(250,204,21,0.4)'
        : isStealTarget
          ? 'rgba(239,68,68,0.5)'
          : isSelectable && !card.revealed
            ? 'rgba(147,197,253,0.25)'
            : 'transparent';

  const ringColor = card.scouted
    ? '#fbbf24'
    : isMageRevealed
      ? '#a855f7'
      : isScoutTarget
        ? 'rgba(250,204,21,0.7)'
        : isStealTarget
          ? 'rgba(239,68,68,0.7)'
          : card.revealed
            ? setDef.color
            : 'rgba(100,160,255,0.25)';

  return (
    <button
      onClick={onClick}
      disabled={!isSelectable && !isScoutTarget && !isStealTarget}
      className="aspect-[3/4] rounded-lg relative overflow-hidden transition-all duration-200 active:scale-95"
      style={{
        boxShadow: glowColor !== 'transparent' ? `0 0 12px ${glowColor}` : undefined,
        border: `1.5px solid ${ringColor}`,
        background: isVisible
          ? `linear-gradient(145deg, ${setDef.color}55, ${setDef.color}22)`
          : 'linear-gradient(145deg, #1e3a5f, #0d2137)',
        cursor: isSelectable || isScoutTarget || isStealTarget ? 'pointer' : 'default',
        transform: isSelectable ? 'translateY(-1px)' : undefined,
      }}
    >
      {/* カード表面 */}
      {isVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-xl sm:text-2xl leading-none">{setDef.icon}</span>
          <span
            className="text-[9px] font-bold leading-none px-1 py-0.5 rounded"
            style={{ color: setDef.color, background: `${setDef.color}22` }}
          >
            {setDef.name}
          </span>
          {card.scouted && (
            <span className="text-[8px] text-yellow-300 font-bold">👁偵察</span>
          )}
        </div>
      ) : (
        /* カード裏面 */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blue-900 opacity-40">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12zm0-9a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          {(isScoutTarget || isStealTarget) && (
            <div
              className="absolute inset-0 rounded-lg opacity-20"
              style={{ background: isStealTarget ? '#ef4444' : '#fbbf24' }}
            />
          )}
        </div>
      )}
    </button>
  );
}
