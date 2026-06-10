'use client';

import { useEffect, useState } from 'react';
import { SkillId } from '@/lib/memory-kingdom-game/types';
import { SKILL_DEFS } from '@/lib/memory-kingdom-game/constants';

const SKILL_META: Record<SkillId, { color: string; accent: string; bgFrom: string; bgTo: string }> = {
  scout:  { color: '#fbbf24', accent: '#fffbe6', bgFrom: '#78350f', bgTo: '#1c0a00' },
  seal:   { color: '#a855f7', accent: '#faf5ff', bgFrom: '#3b0764', bgTo: '#0a001c' },
  extra:  { color: '#22c55e', accent: '#f0fff4', bgFrom: '#052e16', bgTo: '#001a0a' },
  steal:  { color: '#ef4444', accent: '#fff0f0', bgFrom: '#450a0a', bgTo: '#1a0000' },
};

interface Props {
  skillId: SkillId;
  playerName: string;
  playerColor: string;
  onDone: () => void;
}

export default function SkillCutin({ skillId, playerName, playerColor, onDone }: Props) {
  const [gone, setGone] = useState(false);
  const def = SKILL_DEFS.find(s => s.id === skillId)!;
  const meta = SKILL_META[skillId];

  useEffect(() => {
    const t = setTimeout(() => {
      setGone(true);
      setTimeout(onDone, 200);
    }, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (gone) return null;

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden pointer-events-none"
      style={{ background: `linear-gradient(160deg, ${meta.bgFrom}cc, ${meta.bgTo}cc)` }}
    >
      {/* diagonal stripe background */}
      <div
        className="mk-cutin-bg absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            -55deg,
            transparent 0px,
            transparent 28px,
            ${meta.color}11 28px,
            ${meta.color}11 32px
          )`,
        }}
      />

      {/* main panel */}
      <div
        className="mk-cutin absolute"
        style={{
          top: '30%',
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: `linear-gradient(105deg, ${meta.bgFrom} 0%, ${meta.color}44 50%, ${meta.bgFrom} 100%)`,
          borderTop: `3px solid ${meta.color}`,
          borderBottom: `3px solid ${meta.color}`,
          boxShadow: `0 0 40px ${meta.color}88`,
        }}
      >
        {/* player name strip */}
        <p
          className="text-xs font-black tracking-[0.4em] mb-1 uppercase"
          style={{ color: playerColor }}
        >
          {playerName}
        </p>

        <div className="flex items-center gap-4">
          {/* skill icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{
              background: `${meta.color}22`,
              border: `2px solid ${meta.color}`,
              boxShadow: `0 0 20px ${meta.color}66`,
            }}
          >
            {def.icon}
          </div>

          <div>
            <p
              className="font-black text-3xl leading-none"
              style={{
                color: meta.accent,
                textShadow: `0 0 20px ${meta.color}, 0 2px 0 rgba(0,0,0,0.8)`,
              }}
            >
              {def.name}
            </p>
            <p
              className="text-xs mt-1 font-bold"
              style={{ color: `${meta.color}cc` }}
            >
              {def.desc}
            </p>
          </div>
        </div>
      </div>

      {/* corner accent lines */}
      <div
        className="absolute top-0 left-0 w-16 h-1"
        style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
      />
      <div
        className="absolute bottom-0 right-0 w-16 h-1"
        style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
      />
    </div>
  );
}
