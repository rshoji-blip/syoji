'use client';

import { useState, useEffect } from 'react';
import { Screen } from '../MemoryKingdomApp';

interface Props { onNavigate: (s: Screen) => void; }

const SETS = [
  { id: 'knight',   name: '騎士団', icon: '⚔️',  color: '#c0392b' },
  { id: 'merchant', name: '商人',   icon: '💰',  color: '#d4ac0d' },
  { id: 'mage',     name: '魔法使', icon: '🔮',  color: '#8e44ad' },
  { id: 'farmer',   name: '農民',   icon: '🌾',  color: '#27ae60' },
  { id: 'temple',   name: '神殿',   icon: '⛩️', color: '#2980b9' },
];

const CARD_TYPES = [
  '⚔️','⚔️','💰','💰','🔮','🔮','🌾','🌾','⛩️','⛩️',
  '⚔️','⚔️','💰','💰','🔮','🔮','🌾','🌾','⛩️','⛩️',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type BluffState = 'idle' | 'shown' | 'resolved';

export default function BattleScreen({ onNavigate }: Props) {
  const [cards] = useState(() => shuffle(CARD_TYPES).map((icon, i) => ({ id: i, icon, revealed: false, taken: false })));
  const [cardState, setCardState] = useState(cards.map(c => ({ ...c })));
  const [myScore, setMyScore] = useState(850);
  const [oppScore] = useState(1100);
  const [mySP, setMySP] = useState(3);
  const [oppSP] = useState(4);
  const [time, setTime] = useState(267);
  const [myTurn] = useState(false);
  const [bluff, setBluff] = useState<BluffState>('shown');
  const [bluffText] = useState('騎士団はもう揃わないよ');
  const [setProgress] = useState([2, 4, 1, 3, 2]);
  const [inspectLeft] = useState(2);
  const [showSkillMenu, setShowSkillMenu] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(v => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const timeWarn = time < 60;

  const SKILLS = [
    { id: 'scout', name: '偵察', sp: 1, icon: '🔍' },
    { id: 'extra', name: '連続行動', sp: 2, icon: '⚡' },
    { id: 'steal', name: '強奪', sp: 3, icon: '💀' },
  ];

  return (
    <div
      className="w-full h-full flex flex-col select-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0b0f1a 0%, #131929 60%, #0d1117 100%)' }}
    >
      {/* 相手エリア */}
      <div
        className="px-4 pt-10 pb-3"
        style={{ background: 'linear-gradient(180deg, rgba(139,0,0,0.2) 0%, transparent 100%)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg,#8e44ad,#c0392b)' }}>
              🧙
            </div>
            <div>
              <p className="text-white font-bold text-sm">魔王プレイヤー</p>
              <p className="text-gray-400 text-xs">王国Lv.23</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-xl">{oppScore.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">pt</p>
          </div>
        </div>

        {/* 相手SP */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-gray-400 text-xs">SP</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-sm"
              style={{ background: i < oppSP ? '#7dd3fc' : 'rgba(255,255,255,0.1)' }} />
          ))}
          <span className="text-blue-300 text-xs ml-1 font-bold">相手が見えない伏せスキル 3枚</span>
        </div>

        {/* ブラフバブル */}
        {bluff === 'shown' && (
          <div
            className="relative rounded-2xl rounded-tl-none px-4 py-3 mb-1"
            style={{ background: 'rgba(200,50,50,0.25)', border: '1px solid rgba(220,80,80,0.4)' }}
          >
            <p className="text-white text-sm font-bold">💬 「{bluffText}」</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setBluff('resolved')}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white active:scale-95"
                style={{ background: 'rgba(41,128,185,0.6)' }}
              >
                信じる
              </button>
              <button
                onClick={() => setBluff('resolved')}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white active:scale-95"
                style={{ background: 'linear-gradient(135deg,#e55d2b,#c0392b)' }}
              >
                挑戦する ⚡
              </button>
            </div>
          </div>
        )}
      </div>

      {/* タイマー + セット進捗 */}
      <div className="px-4 py-2 flex items-center gap-3">
        <div
          className="px-3 py-1 rounded-full font-black text-base"
          style={{
            background: timeWarn ? 'rgba(229,93,43,0.3)' : 'rgba(255,255,255,0.08)',
            color: timeWarn ? '#ff6b35' : '#e2e8f0',
            border: timeWarn ? '1px solid rgba(229,93,43,0.5)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          ⏱ {timeStr}
        </div>
        <div className="flex-1 flex gap-1.5 justify-end">
          {SETS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-0.5">
              <span className="text-xs">{s.icon}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="w-1.5 h-2.5 rounded-sm"
                    style={{ background: j < setProgress[i] ? s.color : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* カード盤面 5×4 */}
      <div className="px-3 py-1 flex-1 flex items-center justify-center">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)', width: '100%' }}>
          {cardState.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => {
                if (card.taken || card.revealed) return;
                const updated = [...cardState];
                updated[idx] = { ...updated[idx], revealed: true };
                setCardState(updated);
                setTimeout(() => {
                  const u2 = [...cardState];
                  u2[idx] = { ...u2[idx], revealed: false };
                  setCardState(u2);
                }, 1400);
              }}
              className="aspect-[3/4] rounded-xl flex items-center justify-center text-xl font-bold transition-all active:scale-95"
              style={{
                background: card.taken
                  ? 'rgba(255,255,255,0.03)'
                  : card.revealed
                    ? 'linear-gradient(135deg,#2d1b69,#4a0e8f)'
                    : 'linear-gradient(135deg,#1e3a5f,#0d2137)',
                border: card.taken
                  ? '1px solid rgba(255,255,255,0.05)'
                  : card.revealed
                    ? '1.5px solid rgba(180,100,255,0.6)'
                    : '1.5px solid rgba(100,160,255,0.25)',
                boxShadow: card.revealed
                  ? '0 0 12px rgba(140,80,255,0.4)'
                  : 'none',
                opacity: card.taken ? 0.2 : 1,
              }}
            >
              {card.taken ? '' : card.revealed ? card.icon : '?'}
            </button>
          ))}
        </div>
      </div>

      {/* 自分エリア */}
      <div
        className="px-4 pt-3 pb-4"
        style={{ background: 'linear-gradient(0deg, rgba(139,90,43,0.2) 0%, transparent 100%)' }}
      >
        {/* 自分スコア + SP */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg,#e55d2b,#c0392b)' }}>
              ⚔️
            </div>
            <div>
              <p className="text-white font-bold text-sm">勇者プレイヤー</p>
              <p className="text-gray-400 text-xs">王国Lv.8</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-300 font-black text-xl">{myScore.toLocaleString()}</p>
            <p className="text-gray-400 text-xs">pt</p>
          </div>
        </div>

        {/* 自分SP */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-gray-400 text-xs">SP</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-sm transition-all"
              style={{ background: i < mySP ? '#fbbf24' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        {/* スキルボタン + インスペクト */}
        <div className="flex gap-2">
          {SKILLS.map(sk => {
            const canUse = mySP >= sk.sp;
            return (
              <button
                key={sk.id}
                onClick={() => {
                  if (!canUse) return;
                  setShowSkillMenu(false);
                  setMySP(p => p - sk.sp);
                }}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95"
                style={{
                  background: canUse
                    ? 'linear-gradient(135deg,rgba(255,150,0,0.2),rgba(255,80,0,0.1))'
                    : 'rgba(255,255,255,0.05)',
                  border: canUse ? '1.5px solid rgba(255,180,50,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                  opacity: canUse ? 1 : 0.45,
                }}
              >
                <span className="text-lg">{sk.icon}</span>
                <span className="text-white text-xs font-bold">{sk.name}</span>
                <span className="text-xs font-bold" style={{ color: '#7dd3fc' }}>SP{sk.sp}</span>
              </button>
            );
          })}
          <button
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-lg">👁</span>
            <span className="text-white text-xs font-bold">確認</span>
            <span className="text-xs" style={{ color: '#86efac' }}>残{inspectLeft}回</span>
          </button>
        </div>

        {/* ブラフ宣言ボタン */}
        <button
          className="w-full mt-2 py-2.5 rounded-xl font-bold text-sm text-amber-200 tracking-wide active:scale-95"
          style={{
            background: 'rgba(255,200,80,0.1)',
            border: '1px solid rgba(255,200,80,0.3)',
          }}
        >
          💬 ブラフ宣言
        </button>
      </div>
    </div>
  );
}
