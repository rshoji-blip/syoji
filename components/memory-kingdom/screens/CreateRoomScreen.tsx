'use client';

import { useState } from 'react';
import { Screen } from '../MemoryKingdomApp';

interface Props {
  onNavigate: (s: Screen) => void;
  playerName: string;
  setPlayerName: (n: string) => void;
}

const SKILLS = [
  { id: 'scout',  name: '偵察',   sp: 1, icon: '🔍', desc: '好きなカード1枚を確認' },
  { id: 'seal',   name: '記憶封印', sp: 2, icon: '🌫️', desc: '相手の次ターンの記憶を封印' },
  { id: 'extra',  name: '連続行動', sp: 2, icon: '⚡', desc: 'もう一度ターンを得る' },
  { id: 'steal',  name: '強奪',   sp: 3, icon: '💀', desc: '相手のセットカードを1枚奪う' },
];

const THEMES = [
  { id: 'forest', name: '森林王国', icon: '🌲', color: '#1a472a' },
  { id: 'desert', name: '砂漠王国', icon: '🏜️', color: '#7d5a00' },
  { id: 'ice',    name: '氷原王国', icon: '❄️', color: '#1a3a5c' },
];

export default function CreateRoomScreen({ onNavigate, playerName, setPlayerName }: Props) {
  const [selected, setSelected] = useState<string[]>(['scout', 'extra', 'steal']);
  const [theme, setTheme] = useState('forest');

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(139,90,43,0.25) 0%, transparent 100%)' }}
      >
        <button
          onClick={() => onNavigate('title')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-amber-300"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <h2 className="text-white font-bold text-xl tracking-wide flex-1">ルーム作成</h2>
        <div className="text-2xl">🏰</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

        {/* プレイヤー名 */}
        <Section title="プレイヤー名" icon="👤">
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white font-bold text-base outline-none"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,200,80,0.2)' }}
            maxLength={12}
          />
        </Section>

        {/* 王国テーマ */}
        <Section title="王国テーマ" icon="🗺️">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95"
                style={{
                  background: theme === t.id
                    ? `linear-gradient(135deg, ${t.color}dd, ${t.color}88)`
                    : 'rgba(255,255,255,0.06)',
                  border: theme === t.id ? `2px solid rgba(255,200,80,0.6)` : '2px solid transparent',
                  boxShadow: theme === t.id ? `0 0 16px ${t.color}66` : 'none',
                }}
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs text-amber-200 font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* スキル選択 */}
        <Section title={`スキル選択 (${selected.length}/3)`} icon="✨">
          <p className="text-amber-500 text-xs mb-3">3枚選択 ・ 相手には非公開</p>
          <div className="space-y-2">
            {SKILLS.map(sk => {
              const isSelected = selected.includes(sk.id);
              const disabled = !isSelected && selected.length >= 3;
              return (
                <button
                  key={sk.id}
                  onClick={() => !disabled && toggle(sk.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-98 text-left"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(255,150,0,0.2), rgba(255,100,0,0.1))'
                      : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1.5px solid rgba(255,180,50,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <span className="text-2xl w-8 text-center">{sk.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{sk.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(100,200,255,0.15)', color: '#7dd3fc' }}
                      >
                        SP {sk.sp}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{sk.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(255,180,50,0.9)', color: '#1a0a00' }}>
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ルームID */}
        <Section title="ルームID" icon="🔑">
          <div className="flex items-center gap-3">
            <div
              className="flex-1 text-center py-3 rounded-xl font-black text-2xl tracking-[0.3em] text-amber-300"
              style={{ background: 'rgba(255,200,80,0.1)', border: '1px dashed rgba(255,200,80,0.4)' }}
            >
              8472
            </div>
            <button
              className="px-4 py-3 rounded-xl text-sm font-bold text-amber-300"
              style={{ background: 'rgba(255,200,80,0.12)', border: '1px solid rgba(255,200,80,0.3)' }}
            >
              コピー
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2 text-center">このIDを相手に共有してください</p>
        </Section>
      </div>

      {/* 作成ボタン */}
      <div className="px-5 pb-8 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => selected.length === 3 ? onNavigate('battle') : undefined}
          disabled={selected.length !== 3}
          className="w-full py-4 rounded-2xl font-black text-xl text-white tracking-wide transition-all active:scale-95"
          style={{
            background: selected.length === 3
              ? 'linear-gradient(135deg, #e55d2b 0%, #c0392b 100%)'
              : 'rgba(255,255,255,0.1)',
            boxShadow: selected.length === 3 ? '0 4px 24px rgba(229,93,43,0.5)' : 'none',
            color: selected.length === 3 ? 'white' : 'rgba(255,255,255,0.3)',
          }}
        >
          ⚔️ 対戦開始を待つ
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h3 className="text-amber-300 font-bold text-sm tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}
