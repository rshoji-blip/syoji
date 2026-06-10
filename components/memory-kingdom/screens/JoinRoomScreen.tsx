'use client';

import { useState } from 'react';
import { Screen } from '../MemoryKingdomApp';

interface Props { onNavigate: (s: Screen) => void; }

const SKILLS = [
  { id: 'scout',  name: '偵察',   sp: 1, icon: '🔍', desc: '好きなカード1枚を確認' },
  { id: 'seal',   name: '記憶封印', sp: 2, icon: '🌫️', desc: '相手の次ターンの記憶を封印' },
  { id: 'extra',  name: '連続行動', sp: 2, icon: '⚡', desc: 'もう一度ターンを得る' },
  { id: 'steal',  name: '強奪',   sp: 3, icon: '💀', desc: '相手のセットカードを1枚奪う' },
];

export default function JoinRoomScreen({ onNavigate }: Props) {
  const [roomId, setRoomId] = useState('');
  const [selected, setSelected] = useState<string[]>(['scout', 'seal', 'extra']);
  const [joining, setJoining] = useState(false);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleJoin = () => {
    if (roomId.length < 4 || selected.length !== 3) return;
    setJoining(true);
    setTimeout(() => onNavigate('battle'), 1500);
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(41,128,185,0.25) 0%, transparent 100%)' }}
      >
        <button
          onClick={() => onNavigate('title')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-blue-300"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <h2 className="text-white font-bold text-xl tracking-wide flex-1">ルーム参加</h2>
        <div className="text-2xl">🗺️</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

        {/* ルームID入力 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>🔑</span>
            <h3 className="text-blue-300 font-bold text-sm tracking-wide">ルームID</h3>
          </div>
          <input
            value={roomId}
            onChange={e => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="4桁のIDを入力"
            className="w-full text-center text-3xl font-black tracking-[0.4em] py-4 rounded-xl outline-none text-amber-300"
            style={{
              background: 'rgba(255,200,80,0.08)',
              border: roomId.length === 4 ? '2px solid rgba(255,200,80,0.6)' : '2px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* スキル選択 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>✨</span>
            <h3 className="text-blue-300 font-bold text-sm tracking-wide">スキル選択 ({selected.length}/3)</h3>
          </div>
          <p className="text-blue-400 text-xs mb-3">3枚選択 ・ 相手には非公開</p>
          <div className="space-y-2">
            {SKILLS.map(sk => {
              const isSelected = selected.includes(sk.id);
              const disabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={sk.id}
                  onClick={() => !disabled && toggle(sk.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(41,128,185,0.25), rgba(26,82,118,0.2))'
                      : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1.5px solid rgba(100,180,255,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <span className="text-2xl w-8 text-center">{sk.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{sk.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(100,200,255,0.15)', color: '#7dd3fc' }}>
                        SP {sk.sp}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{sk.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(100,180,255,0.9)', color: '#001' }}>
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* マッチング中アニメ */}
        {joining && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-blue-400"
                  style={{ animation: `bounce 0.9s ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="text-blue-300 text-sm font-bold">マッチング中...</p>
          </div>
        )}
      </div>

      {/* 参加ボタン */}
      <div className="px-5 pb-8 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleJoin}
          disabled={roomId.length < 4 || selected.length !== 3 || joining}
          className="w-full py-4 rounded-2xl font-black text-xl text-white tracking-wide transition-all active:scale-95"
          style={{
            background: (roomId.length === 4 && selected.length === 3 && !joining)
              ? 'linear-gradient(135deg, #2980b9 0%, #1a5276 100%)'
              : 'rgba(255,255,255,0.1)',
            boxShadow: (roomId.length === 4 && selected.length === 3)
              ? '0 4px 24px rgba(41,128,185,0.5)' : 'none',
            color: (roomId.length === 4 && selected.length === 3 && !joining)
              ? 'white' : 'rgba(255,255,255,0.3)',
          }}
        >
          🗺️ ルームに参加する
        </button>
      </div>
    </div>
  );
}
