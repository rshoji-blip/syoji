'use client';

import { useState, useEffect } from 'react';
import { Screen } from '../MemoryKingdomApp';

interface Props { onNavigate: (s: Screen) => void; }

const castleEmoji = '🏰';
const stars = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  top: `${Math.floor(Math.random() * 55)}%`,
  left: `${Math.floor(Math.random() * 100)}%`,
  size: Math.random() > 0.6 ? 'w-1.5 h-1.5' : 'w-1 h-1',
  delay: `${(Math.random() * 3).toFixed(1)}s`,
}));

export default function TitleScreen({ onNavigate }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center overflow-hidden select-none"
      style={{ background: 'linear-gradient(175deg, #0b0c2a 0%, #1a1060 45%, #2d1b69 100%)' }}
    >
      {/* 星空 */}
      {stars.map(s => (
        <div
          key={s.id}
          className={`absolute rounded-full bg-white ${s.size}`}
          style={{ top: s.top, left: s.left, animationDelay: s.delay, opacity: 0.7 }}
        />
      ))}

      {/* 雲・霧のシルエット */}
      <div className="absolute bottom-0 left-0 right-0 h-48"
        style={{ background: 'linear-gradient(to top, rgba(139,90,43,0.35) 0%, transparent 100%)' }} />

      {/* 王国シルエット */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center">
        <div className="text-9xl" style={{ filter: 'drop-shadow(0 0 32px rgba(255,200,80,0.5))' }}>
          {castleEmoji}
        </div>
      </div>

      {/* 光のオーラ */}
      <div
        className="absolute bottom-28 left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{ width: 220, height: 80, background: 'rgba(255,180,50,0.18)' }}
      />

      {/* タイトルロゴ */}
      <div className="mt-24 flex flex-col items-center z-10">
        <p className="text-amber-300 text-sm tracking-[0.4em] mb-1 font-light">王国発展型戦略神経衰弱</p>
        <h1
          className="text-5xl font-black tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 50%, #ff8800 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 2px 8px rgba(255,180,0,0.4))',
          }}
        >
          Memory
        </h1>
        <h1
          className="text-6xl font-black tracking-widest -mt-1"
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 12px rgba(255,180,0,0.5))',
          }}
        >
          Kingdom
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-px w-12 bg-amber-400 opacity-60" />
          <p className="text-amber-400 text-xs tracking-[0.3em]">記憶力だけでは勝てない</p>
          <div className="h-px w-12 bg-amber-400 opacity-60" />
        </div>
      </div>

      {/* メニュー */}
      <div className="absolute bottom-56 w-full flex flex-col items-center gap-3 z-10 px-8">
        <button
          onClick={() => onNavigate('create')}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white tracking-wide transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e55d2b 0%, #c0392b 100%)',
            boxShadow: '0 4px 20px rgba(229,93,43,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          ⚔️ ルームを作成
        </button>
        <button
          onClick={() => onNavigate('join')}
          className="w-full py-4 rounded-2xl font-bold text-lg text-white tracking-wide transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #2980b9 0%, #1a5276 100%)',
            boxShadow: '0 4px 20px rgba(41,128,185,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          🗺️ ルームに参加
        </button>
        <button
          className="w-full py-3 rounded-2xl font-bold text-base text-amber-200 tracking-wide transition-transform active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,200,80,0.3)',
          }}
        >
          👑 ランキング
        </button>
      </div>

      {/* バージョン */}
      <div className="absolute bottom-6 text-amber-600 text-xs tracking-widest z-10">
        ver 1.0.0
      </div>
    </div>
  );
}
