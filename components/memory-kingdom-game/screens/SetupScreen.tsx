'use client';

import { useState } from 'react';
import { SkillId, GameAction } from '@/lib/memory-kingdom-game/types';
import { SKILL_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  dispatch: (a: GameAction) => void;
}

interface PlayerSetup {
  name: string;
  skills: SkillId[];
}

const PLAYER_COLORS = ['#f97316', '#3b82f6'] as const;
const PLAYER_LABELS = ['プレイヤー1', 'プレイヤー2'] as const;
const PLAYER_ICONS = ['⚔️', '🔮'] as const;

export default function SetupScreen({ dispatch }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0=intro 1=P1 setup 2=P2 setup
  const [p1, setP1] = useState<PlayerSetup>({ name: 'プレイヤー1', skills: [] });
  const [p2, setP2] = useState<PlayerSetup>({ name: 'プレイヤー2', skills: [] });

  const current = step === 1 ? p1 : p2;
  const setCurrent = step === 1 ? setP1 : setP2;
  const color = PLAYER_COLORS[step === 1 ? 0 : 1];

  function toggleSkill(id: SkillId) {
    const prev = current.skills;
    if (prev.includes(id)) {
      setCurrent({ ...current, skills: prev.filter(s => s !== id) });
    } else if (prev.length < 3) {
      setCurrent({ ...current, skills: [...prev, id] });
    }
  }

  function handleNext() {
    if (step === 0) { setStep(1); return; }
    if (step === 1 && p1.skills.length === 3) { setStep(2); return; }
    if (step === 2 && p2.skills.length === 3) {
      dispatch({
        type: 'START',
        p1Name: p1.name || 'プレイヤー1',
        p2Name: p2.name || 'プレイヤー2',
        p1Skills: p1.skills,
        p2Skills: p2.skills,
      });
    }
  }

  // ── イントロ画面 ─────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(175deg, #0b0c2a 0%, #1a1060 50%, #0d1a0a 100%)' }}
      >
        <div className="text-8xl mb-4" style={{ filter: 'drop-shadow(0 0 24px rgba(255,200,80,0.5))' }}>🏰</div>
        <h1
          className="text-5xl font-black tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffa500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Memory
        </h1>
        <h1
          className="text-6xl font-black tracking-widest -mt-1"
          style={{
            background: 'linear-gradient(135deg, #ffd700, #ffa500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Kingdom
        </h1>
        <p className="text-amber-400 text-sm tracking-widest mt-2 mb-8">記憶力だけでは勝てない</p>

        <div
          className="mx-6 p-4 rounded-2xl mb-8 space-y-2 text-sm text-gray-300"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,200,80,0.2)' }}
        >
          <p>🃏 20枚のカード（5セット×4枚）でペアを揃える</p>
          <p>✨ ペアを取るたびにスキルポイント獲得</p>
          <p>🏆 セット4枚コンプリートで特殊ボーナス！</p>
          <p>⚔️ スキルで相手の邪魔ができる</p>
          <p>🏰 勝利資源で王国を発展させよう</p>
        </div>

        <button
          onClick={handleNext}
          className="mx-6 w-[calc(100%-48px)] py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #e55d2b, #c0392b)',
            boxShadow: '0 4px 24px rgba(229,93,43,0.5)',
          }}
        >
          ゲームスタート
        </button>
      </div>
    );
  }

  // ── プレイヤー設定画面 ────────────────────────────────────────────────────
  const playerIdx = step - 1;
  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
    >
      <div
        className="px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: `linear-gradient(180deg, ${color}22 0%, transparent 100%)` }}
      >
        <span className="text-3xl">{PLAYER_ICONS[playerIdx]}</span>
        <div>
          <p className="text-gray-400 text-xs">プレイヤー {playerIdx + 1} の設定</p>
          <h2 className="text-white font-bold text-xl">{PLAYER_LABELS[playerIdx]}</h2>
        </div>
        <div className="ml-auto flex gap-1">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: i < step ? color : 'rgba(255,255,255,0.15)' }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-5 pb-4">
        {/* 名前入力 */}
        <div>
          <label className="text-sm font-bold mb-1.5 block" style={{ color }}>
            👤 名前
          </label>
          <input
            value={current.name}
            onChange={e => setCurrent({ ...current, name: e.target.value })}
            className="w-full rounded-xl px-4 py-3 text-white font-bold text-base outline-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${color}44`,
            }}
            maxLength={12}
          />
        </div>

        {/* スキル選択 */}
        <div>
          <label className="text-sm font-bold mb-1 block" style={{ color }}>
            ✨ スキル選択（{current.skills.length}/3）
          </label>
          <p className="text-gray-500 text-xs mb-3">3枚選択・相手には非公開</p>
          <div className="space-y-2">
            {SKILL_DEFS.map(def => {
              const selected = current.skills.includes(def.id);
              const disabled = !selected && current.skills.length >= 3;
              return (
                <button
                  key={def.id}
                  onClick={() => !disabled && toggleSkill(def.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: selected ? `${color}22` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${selected ? color + '88' : 'rgba(255,255,255,0.08)'}`,
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  <span className="text-2xl w-8 text-center">{def.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{def.name}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(100,200,255,0.12)', color: '#7dd3fc' }}
                      >
                        SP{def.sp}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{def.desc}</p>
                  </div>
                  {selected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: color, color: '#fff' }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleNext}
          disabled={current.skills.length !== 3}
          className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-all"
          style={{
            background: current.skills.length === 3
              ? `linear-gradient(135deg, ${color}, ${color}aa)`
              : 'rgba(255,255,255,0.08)',
            boxShadow: current.skills.length === 3 ? `0 4px 24px ${color}66` : 'none',
            color: current.skills.length === 3 ? 'white' : 'rgba(255,255,255,0.3)',
          }}
        >
          {step === 1 ? '次へ →（プレイヤー2の設定）' : 'ゲーム開始 ⚔️'}
        </button>
      </div>
    </div>
  );
}
