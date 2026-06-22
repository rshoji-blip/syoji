import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
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

const CAT_COLORS: Record<string, { bg: string; border: string }> = {
  "探索": { bg: "#E8F4FD", border: "#85C1E9" },
  "創造": { bg: "#FDE8EF", border: "#F4A0B5" },
  "会話": { bg: "#E6F8F3", border: "#7DCFB6" },
  "運動": { bg: "#F4EBF8", border: "#C39BD3" },
  "感覚": { bg: "#FEFAE5", border: "#F9E784" },
  "協力": { bg: "#FEE9E5", border: "#F4846F" },
  "挑戦": { bg: "#EAFAF1", border: "#85D3A5" },
};

const PLAY_BG = ["#FEE9E5", "#E8F4FD", "#E6F8F3"];
const PLAY_BORDER = ["#F4846F", "#85C1E9", "#7DCFB6"];
const PLAY_ICONS = ["🎯", "🌈", "⭐"];

export default function Home({ onNavigate, onPlayDetail }: Props) {
  const { data, loading, refetch } = useGet<HomeData>('/home');
  const [switchingChild, setSwitchingChild] = useState(false);

  const switchChild = async (idx: number) => {
    setSwitchingChild(true);
    await apiPost('/switch_child', { child_idx: idx });
    await refetch();
    setSwitchingChild(false);
  };

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🌱</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth()+1}月${today.getDate()}日 (${["日","月","火","水","木","金","土"][today.getDay()]})`;

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* Date header - like the reference app */}
      <div style={{
        background: 'linear-gradient(135deg, #7DCFB6, #85C1E9)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{dateStr}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 2 }}>
            {data.child_name}ちゃんの今日 🌟
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{data.age_str}</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.25)', borderRadius: 16, padding: '8px 12px',
          textAlign: 'center', fontSize: 13, fontWeight: 800, color: 'white',
        }}>
          {data.weather.label}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Child switcher pills */}
        {data.users.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 0 4px', overflowX: 'auto' }}>
            {data.users.map((u, i) => (
              <button key={u.name} onClick={() => switchChild(i)} style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                border: `2.5px solid ${u.name === data.child_name ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: u.name === data.child_name ? 'var(--primary)' : 'white',
                color: u.name === data.child_name ? 'white' : 'var(--text-light)',
                boxShadow: u.name === data.child_name ? '0 3px 10px rgba(244,132,111,0.35)' : 'none',
              }}>{u.name} {u.age_str}</button>
            ))}
            <a href="/register" style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 20, border: '2.5px dashed var(--border)', fontSize: 13, fontWeight: 800, color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>＋</a>
          </div>
        )}

        {/* Today experience - stamp style */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>
              🎪 今日のたいけん
            </div>
            {data.total_today > 0 && (
              <div style={{
                background: 'var(--yellow)', color: 'var(--text)', padding: '4px 12px',
                borderRadius: 20, fontSize: 12, fontWeight: 900,
                boxShadow: '0 2px 6px rgba(249,231,132,0.5)',
              }}>✨ {data.total_today}かい！</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <RadarChart counts={data.category_counts} />
          </div>

          {/* Stamp grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
            {ALL_CATEGORIES.map(cat => {
              const count = data.category_counts[cat] || 0;
              const colors = CAT_COLORS[cat] || { bg: '#f5f5f5', border: '#ddd' };
              return (
                <div key={cat} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%', aspectRatio: '1', borderRadius: 16,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    background: count > 0 ? colors.bg : '#F8F5F2',
                    border: `2.5px solid ${count > 0 ? colors.border : '#E8E0D8'}`,
                    boxShadow: count > 0 ? `0 2px 8px ${colors.border}40` : 'none',
                    transform: count > 0 ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {CATEGORY_ICONS[cat]}
                    {count > 0 && (
                      <div style={{
                        position: 'absolute', top: 2, right: 4,
                        fontSize: 10, fontWeight: 900, color: colors.border,
                      }}>{count}</div>
                    )}
                    {count === 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', borderRadius: 14 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: count > 0 ? 'var(--text)' : 'var(--text-light)', marginTop: 4 }}>{cat}</div>
                </div>
              );
            })}
          </div>

          <button onClick={() => onNavigate('record')} style={{
            width: '100%', padding: 15, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
            color: 'white', border: 'none', fontSize: 16, fontWeight: 900,
            cursor: 'pointer', marginTop: 16,
            boxShadow: '0 4px 14px rgba(244,132,111,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>✏️ きろくする</button>
        </div>

        {/* Recommended plays - stamp cards */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: '20px 0 10px',
          }}>
            <span style={{ fontSize: 18 }}>💡</span> 今日のおすすめあそび
          </div>

          {data.plays.map((play, i) => (
            <button key={play.id} onClick={() => onPlayDetail(play.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white', borderRadius: 'var(--radius-sm)',
              padding: '14px 16px', margin: '8px 0',
              boxShadow: 'var(--shadow)', border: `2px solid ${PLAY_BORDER[i]}30`,
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'transform 0.15s',
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, background: PLAY_BG[i],
                border: `2.5px solid ${PLAY_BORDER[i]}50`,
              }}>{PLAY_ICONS[i]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>{play.name}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                  {play.dev_categories.slice(0, 2).map(c => (
                    <span key={c} style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: (CAT_COLORS[c] || { bg: '#f5f5f5' }).bg,
                      color: (CAT_COLORS[c] || { border: '#999' }).border,
                      border: `1.5px solid ${(CAT_COLORS[c] || { border: '#ddd' }).border}40`,
                    }}>{CATEGORY_ICONS[c]}{c}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: 22, fontWeight: 300 }}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
