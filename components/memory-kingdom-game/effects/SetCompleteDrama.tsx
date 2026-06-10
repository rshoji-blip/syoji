'use client';

import { useEffect, useState } from 'react';
import { CardSetType, PlayerIdx } from '@/lib/memory-kingdom-game/types';
import { SET_DEFS } from '@/lib/memory-kingdom-game/constants';

const PARTICLE_COUNT = 16;
const PARTICLE_ANGLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => (i / PARTICLE_COUNT) * 360);

interface Props {
  setType: CardSetType;
  player: PlayerIdx;
  playerName: string;
  onClose: () => void;
}

export default function SetCompleteDrama({ setType, playerName, onClose }: Props) {
  const [showStamp, setShowStamp] = useState(false);
  const setDef = SET_DEFS.find(s => s.type === setType)!;

  useEffect(() => {
    const t1 = setTimeout(() => setShowStamp(true), 400);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      {/* radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${setDef.color}33 0%, transparent 65%)`,
        }}
      />

      {/* scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }}
      />

      {/* particles */}
      {PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const dist = 80 + (i % 3) * 30;
        const px = Math.round(Math.cos(rad) * dist);
        const py = Math.round(Math.sin(rad) * dist);
        return (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '48%',
              marginLeft: -4,
              marginTop: -4,
              background: i % 2 === 0 ? setDef.color : '#ffd700',
              ['--px' as string]: `${px}px`,
              ['--py' as string]: `${py}px`,
              animation: `particle-burst 0.8s ${0.1 + (i * 0.02)}s ease-out both`,
            }}
          />
        );
      })}

      {/* main card */}
      <div
        className="mk-set-flash mx-6 rounded-3xl p-6 text-center relative z-10 w-64"
        style={{
          background: `linear-gradient(145deg, #0d0d1a, ${setDef.color}22)`,
          border: `2px solid ${setDef.color}`,
          boxShadow: `0 0 60px ${setDef.color}55, inset 0 0 30px ${setDef.color}11`,
        }}
      >
        {/* set icon */}
        <div
          className="mk-set-icon text-7xl mb-3 inline-block"
          style={{ filter: `drop-shadow(0 0 20px ${setDef.color})` }}
        >
          {setDef.icon}
        </div>

        <p className="text-gray-300 text-xs tracking-[0.3em] mb-0.5 uppercase">Set Complete</p>
        <p
          className="font-black text-xl mb-2"
          style={{ color: setDef.color }}
        >
          {setDef.name}
        </p>

        {/* bonus stamp */}
        {showStamp && (
          <div
            className="mk-stamp inline-block px-4 py-2 rounded-2xl mb-2"
            style={{
              background: `${setDef.color}22`,
              border: `1.5px solid ${setDef.color}88`,
            }}
          >
            <p className="font-black text-lg text-white">{setDef.bonusName}</p>
            <p className="text-xs mt-0.5" style={{ color: `${setDef.color}dd` }}>{setDef.bonusDesc}</p>
          </div>
        )}

        <p className="text-gray-400 text-xs mt-2">{playerName} に発動</p>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl font-black text-white text-base active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${setDef.color}, ${setDef.color}88)`,
            boxShadow: `0 4px 20px ${setDef.color}66`,
          }}
        >
          OK！
        </button>
      </div>
    </div>
  );
}
