'use client';

import { useState } from 'react';
import { SkillId } from '@/lib/memory-kingdom-game/types';
import { SKILL_DEFS } from '@/lib/memory-kingdom-game/constants';

interface Props {
  loading: boolean;
  error: string | null;
  onCreateRoom: (name: string, skills: SkillId[]) => void;
  onJoinRoom:   (code: string, name: string, skills: SkillId[]) => void;
  onBack:       () => void;
}

type Tab = 'create' | 'join';

export default function OnlineLobbyScreen({ loading, error, onCreateRoom, onJoinRoom, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('create');
  const [name, setName] = useState('プレイヤー');
  const [skills, setSkills] = useState<SkillId[]>([]);
  const [joinCode, setJoinCode] = useState('');

  function toggleSkill(id: SkillId) {
    if (skills.includes(id)) {
      setSkills(skills.filter((s) => s !== id));
    } else if (skills.length < 3) {
      setSkills([...skills, id]);
    }
  }

  function handleSubmit() {
    if (skills.length !== 3) return;
    if (tab === 'create') {
      onCreateRoom(name || 'プレイヤー', skills);
    } else {
      if (joinCode.trim().length < 6) return;
      onJoinRoom(joinCode.trim(), name || 'プレイヤー', skills);
    }
  }

  const ready = skills.length === 3 && (tab === 'create' || joinCode.trim().length >= 6);

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.2) 0%, transparent 100%)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center text-blue-300 text-lg"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <div>
          <p className="text-gray-400 text-xs">オンライン対戦</p>
          <h2 className="text-white font-bold text-lg">ルーム設定</h2>
        </div>
        <span className="ml-auto text-2xl">🌐</span>
      </div>

      {/* タブ */}
      <div className="flex mx-5 mb-4 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {(['create', 'join'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-sm font-bold transition-all"
            style={{
              background: tab === t ? 'rgba(37,99,235,0.6)' : 'transparent',
              color: tab === t ? 'white' : '#64748b',
            }}
          >
            {t === 'create' ? '⚔️ ルーム作成' : '🗺️ ルーム参加'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
        {/* 名前 */}
        <Section title="プレイヤー名" icon="👤" color="#3b82f6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white font-bold text-base outline-none"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
            maxLength={12}
            placeholder="プレイヤー名を入力"
          />
        </Section>

        {/* ルームコード入力（参加タブのみ） */}
        {tab === 'join' && (
          <Section title="ルームコード（6桁）" icon="🔑" color="#3b82f6">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              className="w-full text-center text-3xl font-black tracking-[0.4em] py-4 rounded-xl outline-none text-amber-300"
              style={{
                background: 'rgba(255,200,80,0.08)',
                border: joinCode.length === 6
                  ? '2px solid rgba(255,200,80,0.6)'
                  : '2px solid rgba(255,255,255,0.1)',
                letterSpacing: '0.4em',
              }}
              placeholder="ABC123"
              maxLength={6}
            />
          </Section>
        )}

        {/* スキル選択 */}
        <Section title={`スキル選択 (${skills.length}/3)`} icon="✨" color="#3b82f6">
          <p className="text-blue-400 text-xs mb-3">3枚選択・相手には非公開</p>
          <div className="space-y-2">
            {SKILL_DEFS.map((def) => {
              const selected = skills.includes(def.id);
              const disabled = !selected && skills.length >= 3;
              return (
                <button
                  key={def.id}
                  onClick={() => !disabled && toggleSkill(def.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: selected ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${selected ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
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
                      style={{ background: '#3b82f6', color: '#fff' }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* エラー */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-red-300 text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="px-5 pb-8 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={handleSubmit}
          disabled={!ready || loading}
          className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-all"
          style={{
            background: ready && !loading
              ? 'linear-gradient(135deg, #2563eb, #1e3a8a)'
              : 'rgba(255,255,255,0.08)',
            boxShadow: ready && !loading ? '0 4px 24px rgba(37,99,235,0.5)' : 'none',
            color: ready && !loading ? 'white' : 'rgba(255,255,255,0.3)',
          }}
        >
          {loading
            ? '⏳ 処理中...'
            : tab === 'create'
              ? '⚔️ ルームを作成する'
              : '🗺️ ルームに参加する'}
        </button>
      </div>
    </div>
  );
}

function Section({
  title, icon, color, children,
}: {
  title: string; icon: string; color: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h3 className="font-bold text-sm" style={{ color }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
