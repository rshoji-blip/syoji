import React, { useState } from 'react';
import { useGet, apiFormPost } from '../hooks/useApi';
import RadarChart from '../components/RadarChart';
import { CATEGORY_ICONS, ALL_CATEGORIES } from '../types';

interface HomeData {
  child_name: string;
  age_str: string;
  weather: { label: string; tag: string };
  plays: Array<{ id: string; name: string; dev_categories: string[]; style: string }>;
  category_counts: Record<string, number>;
  total_today: number;
  users: Array<{ name: string; age_str: string }>;
}

interface Props {
  onNavigate: (page: 'home' | 'record' | 'growth' | 'coach') => void;
  onPlayDetail: (id: string) => void;
}

const BG_COLORS = ['#EBF0FE', '#FEF3E2', '#E8F8EF'];
const PLAY_ICONS = ['🎯', '🌈', '⭐'];

export default function Home({ onNavigate, onPlayDetail }: Props) {
  const { data, loading, refetch } = useGet<HomeData>('/home');

  const switchChild = async (idx: number) => {
    await apiFormPost('/switch_child', { child_idx: String(idx) });
    refetch();
  };

  if (loading || !data) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
      <div>読み込み中…</div>
    </div>
  );

  return (
    <div style={{ padding: '0 16px 100px' }}>
      {/* Greeting */}
      <div style={{ padding: '20px 0 8px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>こんにちは！</div>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{data.child_name}ちゃんの今日</div>
      </div>

      {/* Child switcher */}
      {data.users.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0', marginBottom: 4 }}>
          {data.users.map((u, i) => (
            <button key={u.name} onClick={() => switchChild(i)} style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20,
              border: '2px solid var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: u.name === data.child_name ? 'var(--primary)' : 'white',
              color: u.name === data.child_name ? 'white' : 'var(--primary)',
            }}>{u.name} {u.age_str}</button>
          ))}
        </div>
      )}

      {/* Experience card */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius)', padding: 20,
        margin: '12px 0', boxShadow: 'var(--shadow)',
        animation: 'fadeUp 0.4s ease 0.1s both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>今日の発達経験</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
              {data.total_today > 0 ? `${data.total_today}回の経験を記録済み ✨` : 'まだ記録がありません'}
            </div>
          </div>
          <div style={{
            background: 'var(--secondary-light)', color: 'var(--secondary)',
            padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
          }}>{data.weather.label}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RadarChart counts={data.category_counts} />
        </div>

        {/* Category dots */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
          {ALL_CATEGORIES.map(cat => {
            const count = data.category_counts[cat] || 0;
            return (
              <div key={cat} style={{ flex: 1, minWidth: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  background: count > 0 ? 'var(--primary)' : 'var(--bg)',
                  border: count > 0 ? 'none' : '2px solid var(--border)',
                  boxShadow: count > 0 ? '0 2px 8px rgba(91,142,240,0.4)' : 'none',
                }}>{CATEGORY_ICONS[cat]}</div>
                <div style={{ fontSize: 10, textAlign: 'center', fontWeight: 700, color: count > 0 ? 'var(--primary)' : 'var(--text-light)' }}>
                  {cat}{count > 0 ? <><br />{count}回</> : ''}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => onNavigate('record')} style={{
          width: '100%', padding: 15, borderRadius: 'var(--radius-sm)',
          background: 'var(--primary)', color: 'white', border: 'none',
          fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>✏️ 今日の遊びを記録する</button>
      </div>

      {/* Suggested plays */}
      <div style={{ animation: 'fadeUp 0.4s ease 0.2s both' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.05em', margin: '20px 0 8px' }}>
          💡 今日のおすすめ遊び
        </div>
        {data.plays.map((play, i) => (
          <button key={play.id} onClick={() => onPlayDetail(play.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'white', borderRadius: 'var(--radius-sm)',
            padding: '14px 16px', margin: '8px 0',
            boxShadow: 'var(--shadow)', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, background: BG_COLORS[i],
            }}>{PLAY_ICONS[i]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{play.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                {play.dev_categories.slice(0, 2).map(c => CATEGORY_ICONS[c] + c).join(' · ')}
              </div>
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: 20 }}>›</div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
