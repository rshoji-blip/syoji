'use client';

import { useState, useEffect } from 'react';
import { Screen } from '../MemoryKingdomApp';

interface Props { onNavigate: (s: Screen) => void; }

const RESOURCES = [
  { icon: '💰', name: '金貨', amount: 32, color: '#fbbf24' },
  { icon: '🪵', name: '木材', amount: 15, color: '#86efac' },
  { icon: '💎', name: '魔力石', amount: 9,  color: '#a78bfa' },
  { icon: '⭐', name: '名声',  amount: 10, color: '#fde68a' },
];

const SCORE_DETAILS = [
  { label: 'ペア取得 × 9',  value: '+900pt', color: '#fff' },
  { label: '連続取得ボーナス', value: '+200pt', color: '#86efac' },
  { label: 'ブラフ成功',     value: '+80pt',  color: '#fbbf24' },
  { label: 'セットコンプ × 2', value: '+1000pt', color: '#f97316' },
];

export default function VictoryScreen({ onNavigate }: Props) {
  const [phase, setPhase] = useState<'result' | 'kingdom' | 'done'>('result');
  const [resVisible, setResVisible] = useState(false);
  const [kingdomLevel] = useState(8);
  const [newLevel] = useState(9);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [buildingAnim, setBuildingAnim] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setResVisible(true), 400);
    const t2 = setTimeout(() => setPhase('kingdom'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase === 'kingdom') {
      const t1 = setTimeout(() => setBuildingAnim(true), 300);
      const t2 = setTimeout(() => setShowLevelUp(true), 1500);
      const t3 = setTimeout(() => setPhase('done'), 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase]);

  if (phase === 'kingdom' || (phase === 'done' && showLevelUp)) {
    return <KingdomGrowthPhase
      buildingAnim={buildingAnim}
      showLevelUp={showLevelUp}
      level={kingdomLevel}
      newLevel={newLevel}
      phase={phase}
      onNavigate={onNavigate}
    />;
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center overflow-hidden"
      style={{ background: 'linear-gradient(175deg, #0a0a1a 0%, #1a0a35 50%, #0d1a0a 100%)' }}
    >
      {/* 光の演出 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 blur-3xl opacity-60"
        style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' }}
      />

      {/* 勝利バナー */}
      <div className="mt-20 flex flex-col items-center z-10">
        <p className="text-amber-300 text-sm tracking-[0.4em] mb-2">VICTORY</p>
        <div
          className="text-7xl font-black"
          style={{
            background: 'linear-gradient(135deg,#ffd700,#ff8c00,#ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.8))',
          }}
        >
          勝利！
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-px w-16 bg-amber-400 opacity-50" />
          <span className="text-4xl">👑</span>
          <div className="h-px w-16 bg-amber-400 opacity-50" />
        </div>
      </div>

      {/* スコアカード */}
      <div
        className="mx-5 mt-6 w-[calc(100%-40px)] rounded-2xl overflow-hidden z-10"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,200,80,0.2)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'rgba(255,200,80,0.1)' }}>
          <span className="text-amber-300 font-bold text-sm tracking-wide">最終スコア</span>
          <span className="text-white font-black text-2xl">2,180 pt</span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {SCORE_DETAILS.map(d => (
            <div key={d.label} className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">{d.label}</span>
              <span className="font-bold text-sm" style={{ color: d.color }}>{d.value}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 flex justify-between items-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-gray-400 text-xs">相手スコア</span>
          <span className="text-gray-300 font-bold">1,100 pt</span>
        </div>
      </div>

      {/* 獲得資源 */}
      <div
        className={`mx-5 mt-4 w-[calc(100%-40px)] rounded-2xl p-4 z-10 transition-all duration-700 ${resVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p className="text-gray-400 text-xs mb-3 text-center tracking-wide">獲得資源 → 王国へ</p>
        <div className="grid grid-cols-4 gap-2">
          {RESOURCES.map((r, i) => (
            <div key={r.name}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-500`}
              style={{
                background: `${r.color}14`,
                border: `1px solid ${r.color}33`,
                transitionDelay: `${i * 150}ms`,
                opacity: resVisible ? 1 : 0,
                transform: resVisible ? 'scale(1)' : 'scale(0.7)',
              }}
            >
              <span className="text-xl">{r.icon}</span>
              <span className="font-black text-sm" style={{ color: r.color }}>+{r.amount}</span>
              <span className="text-gray-400 text-xs">{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 王国成長ボタン */}
      <div className="absolute bottom-8 w-full px-5">
        <button
          onClick={() => setPhase('kingdom')}
          className="w-full py-4 rounded-2xl font-black text-lg text-white tracking-wide active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #27ae60 0%, #1e8449 100%)',
            boxShadow: '0 4px 24px rgba(39,174,96,0.5)',
          }}
        >
          🏰 王国を育てる →
        </button>
      </div>
    </div>
  );
}

function KingdomGrowthPhase({ buildingAnim, showLevelUp, level, newLevel, phase, onNavigate }: {
  buildingAnim: boolean;
  showLevelUp: boolean;
  level: number;
  newLevel: number;
  phase: string;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center overflow-hidden relative"
      style={{ background: 'linear-gradient(175deg, #0a1a0a 0%, #0d2a0d 50%, #0a0a1a 100%)' }}
    >
      {/* 王国アニメーション背景光 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 blur-3xl"
        style={{ width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(39,174,96,0.35) 0%, transparent 70%)' }} />

      <div className="mt-14 flex flex-col items-center z-10">
        <p className="text-green-300 text-sm tracking-[0.3em] mb-1">KINGDOM GROWTH</p>
        <p className="text-white font-bold text-xl">王国が成長した！</p>
      </div>

      {/* 王国ビジュアル */}
      <div className="relative mt-6 z-10">
        <div
          className="text-[120px] text-center transition-all duration-1000"
          style={{
            filter: buildingAnim ? 'drop-shadow(0 0 32px rgba(39,174,96,0.8))' : 'drop-shadow(0 0 8px rgba(39,174,96,0.2))',
            transform: buildingAnim ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          🏰
        </div>

        {/* 資源が降り注ぐ演出 */}
        {buildingAnim && (
          <div className="absolute inset-0 pointer-events-none">
            {['💰','🪵','💎','⭐','💰','🪵'].map((icon, i) => (
              <div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${15 + i * 14}%`,
                  top: '-20px',
                  animation: `fall${i % 3} 1.2s ${i * 0.15}s ease-in forwards`,
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* レベルアップ */}
      {showLevelUp && (
        <div className="mt-4 flex flex-col items-center gap-3 z-10">
          <div className="flex items-center gap-4">
            <div
              className="px-5 py-2 rounded-xl font-black text-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
            >
              Lv.{level}
            </div>
            <div className="text-2xl text-amber-400">→</div>
            <div
              className="px-5 py-2 rounded-xl font-black text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,200,80,0.3), rgba(255,140,0,0.2))',
                color: '#fbbf24',
                border: '2px solid rgba(255,200,80,0.5)',
                boxShadow: '0 0 20px rgba(255,200,80,0.4)',
              }}
            >
              Lv.{newLevel}
            </div>
          </div>
          <div
            className="px-6 py-3 rounded-2xl text-center"
            style={{
              background: 'rgba(39,174,96,0.15)',
              border: '1px solid rgba(39,174,96,0.4)',
            }}
          >
            <p className="text-green-300 text-sm font-bold">🎉 砦に昇格！</p>
            <p className="text-green-400 text-xs mt-0.5">インスペクト使用回数 +1 解放</p>
          </div>
        </div>
      )}

      {/* 建物一覧 */}
      {showLevelUp && (
        <div className="mx-5 mt-5 w-[calc(100%-40px)] z-10">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🏗️', name: '兵舎', status: '建設中', color: '#f97316' },
              { icon: '🏪', name: '市場', status: '完成',   color: '#22c55e' },
              { icon: '🔬', name: '研究所', status: '未建設', color: '#64748b' },
            ].map(b => (
              <div key={b.name}
                className="flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{
                  background: `${b.color}14`,
                  border: `1px solid ${b.color}33`,
                }}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-white text-xs font-bold">{b.name}</span>
                <span className="text-xs" style={{ color: b.color }}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ボタン */}
      {phase === 'done' && (
        <div className="absolute bottom-8 w-full px-5 flex flex-col gap-2 z-10">
          <button
            onClick={() => onNavigate('create')}
            className="w-full py-4 rounded-2xl font-black text-lg text-white tracking-wide active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #e55d2b 0%, #c0392b 100%)',
              boxShadow: '0 4px 24px rgba(229,93,43,0.5)',
            }}
          >
            ⚔️ もう一度対戦
          </button>
          <button
            onClick={() => onNavigate('title')}
            className="w-full py-3 rounded-2xl font-bold text-sm text-amber-200"
            style={{
              background: 'rgba(255,200,80,0.08)',
              border: '1px solid rgba(255,200,80,0.2)',
            }}
          >
            🏠 タイトルへ
          </button>
        </div>
      )}
    </div>
  );
}
