import React from 'react';
import { useGet } from '../hooks/useApi';
import { ALL_CATEGORIES, CATEGORY_ICONS, CAT_COLORS } from '../types';

interface GrowthData {
  child_name: string;
  age_str: string;
  monthly: Record<string, number>;
  weekly: Array<{ date: string; weekday: string; count: number; is_today: boolean }>;
  ranking: Array<{ play_name: string; count: number }>;
  total_month: number;
  top_cats: Array<[string, number]>;
  month_label: string;
}

const CAT_STYLE: Record<string, { bg: string; border: string; fill: string }> = {
  "探索": { bg: "#E8F4FD", border: "#85C1E9", fill: "#85C1E9" },
  "創造": { bg: "#FDE8EF", border: "#F4A0B5", fill: "#F4A0B5" },
  "会話": { bg: "#E6F8F3", border: "#7DCFB6", fill: "#7DCFB6" },
  "運動": { bg: "#F4EBF8", border: "#C39BD3", fill: "#C39BD3" },
  "感覚": { bg: "#FEFAE5", border: "#D4B800", fill: "#F9E784" },
  "協力": { bg: "#FEE9E5", border: "#F4846F", fill: "#F4846F" },
  "挑戦": { bg: "#EAFAF1", border: "#52BE80", fill: "#52BE80" },
};

export default function Growth() {
  const { data, loading } = useGet<GrowthData>('/growth_data');

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🌿</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  const topCat = data.top_cats[0];
  const weekTotal = data.weekly.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7DCFB6, #52BE80)', padding: '20px 20px 28px' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>{data.month_label}のきろく</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', marginTop: 4 }}>🌿 {data.child_name}ちゃんのせいちょう</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontWeight: 600 }}>{data.age_str}</div>
      </div>

      <div style={{ padding: '16px', marginTop: -8 }}>

        {/* Weekly calendar - stamp style */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            📅 <span>こんしゅうのきろく</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {data.weekly.map(day => (
              <div key={day.date} style={{
                flex: 1, textAlign: 'center', padding: '10px 4px',
                borderRadius: 14, transition: 'all 0.2s',
                background: day.is_today ? 'linear-gradient(135deg, var(--primary), #F4A0B5)'
                  : day.count > 0 ? 'var(--mint-light)' : 'var(--bg)',
                border: `2px solid ${day.is_today ? 'var(--primary)' : day.count > 0 ? 'var(--mint)' : 'var(--border)'}`,
                boxShadow: day.is_today ? '0 3px 10px rgba(244,132,111,0.35)' : 'none',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: day.is_today ? 'rgba(255,255,255,0.9)' : 'var(--text-light)' }}>{day.weekday}</div>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', margin: '6px auto 5px',
                  background: day.count > 0 ? (day.is_today ? 'white' : 'var(--mint)') : 'var(--border)',
                }} />
                <div style={{ fontSize: 12, fontWeight: 900, color: day.is_today ? 'white' : day.count > 0 ? 'var(--mint)' : 'var(--text-light)' }}>
                  {day.count > 0 ? day.count : '·'}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-mid)', textAlign: 'center', marginTop: 12, fontWeight: 700 }}>
            こんしゅうは <span style={{ color: 'var(--mint)', fontWeight: 900, fontSize: 16 }}>{weekTotal}かい</span> きろくしました！
          </div>
        </div>

        {/* Top highlight */}
        {topCat && topCat[1] > 0 ? (
          <div style={{
            borderRadius: 'var(--radius)', padding: '24px 20px', margin: '0 0 12px',
            background: 'linear-gradient(135deg, #FFF8EF, var(--primary-light))',
            border: '3px solid var(--primary)',
            boxShadow: '0 6px 20px rgba(244,132,111,0.18)',
            animation: 'fadeUp 0.4s ease 0.1s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                boxShadow: '0 4px 12px rgba(244,132,111,0.4)',
              }}>{CATEGORY_ICONS[topCat[0]]}</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 800 }}>今月いちばんおおかった！</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{topCat[0]}</div>
              </div>
            </div>
            <div style={{
              background: 'var(--primary)', color: 'white', borderRadius: 20,
              padding: '10px 16px', fontSize: 16, fontWeight: 900, textAlign: 'center',
              marginBottom: 12, boxShadow: '0 3px 10px rgba(244,132,111,0.4)',
            }}>🏆 {topCat[1]}かい たいけんしました！</div>
            <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 700, textAlign: 'center' }}>
              {data.child_name}ちゃんは{topCat[0]}のたいけんが<br />
              とても豊富です。すばらしいですよ 😊
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center', margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>きろくをはじめよう！</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', margin: '6px 0', fontWeight: 600 }}>あそびをきろくすると、せいちょうがみえてくるよ</div>
          </div>
        )}

        {/* Category stamp collection */}
        {data.total_month > 0 && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              🎪 <span>カテゴリべつのたいけん</span>
            </div>
            {ALL_CATEGORIES.map(cat => {
              const count = data.monthly[cat] || 0;
              const maxCount = data.top_cats[0]?.[1] || 1;
              const pct = Math.round(count / maxCount * 100);
              const st = CAT_STYLE[cat] || { bg: '#f5f5f5', border: '#ddd', fill: '#ddd' };
              return (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: st.bg, border: `2px solid ${st.border}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 900 }}>{cat}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: st.border }}>{count}かい</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--bg)', borderRadius: 5, overflow: 'hidden', border: `1px solid ${st.border}20` }}>
                        <div style={{
                          height: '100%', borderRadius: 5, background: st.fill,
                          width: pct + '%', transition: 'width 1.2s ease',
                          boxShadow: `0 1px 4px ${st.border}50`,
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Play ranking */}
        {data.ranking.length > 0 && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease 0.25s both' }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              🏆 <span>よくやったあそびTOP5</span>
            </div>
            {data.ranking.map((item, i) => (
              <div key={item.play_name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0', borderBottom: i < data.ranking.length - 1 ? '1.5px dashed var(--border)' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i < 3 ? 18 : 12, fontWeight: 900, flexShrink: 0,
                  background: i === 0 ? '#FFD700' : i === 1 ? '#C8C8C8' : i === 2 ? '#D4956A' : 'var(--bg)',
                  boxShadow: i < 3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{item.play_name}</div>
                <div style={{
                  background: 'var(--yellow-light)', border: '1.5px solid var(--yellow)',
                  borderRadius: 12, padding: '3px 10px', fontSize: 12, fontWeight: 900, color: '#8B7000',
                }}>{item.count}かい</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
