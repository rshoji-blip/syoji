import React from 'react';
import { useGet } from '../hooks/useApi';
import { RadarChart as RechartsRadar, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
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

export default function Growth() {
  const { data, loading } = useGet<GrowthData>('/growth_data');

  if (loading || !data) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
      <div>読み込み中…</div>
    </div>
  );

  const radarData = ALL_CATEGORIES.map(cat => ({
    cat: CATEGORY_ICONS[cat] + cat,
    value: data.monthly[cat] || 0,
  }));

  const topCat = data.top_cats[0];
  const weekTotal = data.weekly.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <div style={{ padding: '20px 0 4px', animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ fontSize: 14, color: 'var(--text-mid)' }}>{data.month_label}の記録</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{data.child_name}ちゃんの成長 🌱</div>
      </div>

      {/* Weekly calendar */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>📅 今週の記録</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {data.weekly.map(day => (
            <div key={day.date} style={{
              flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10,
              background: day.is_today ? 'var(--primary)' : 'white',
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: day.is_today ? 'rgba(255,255,255,0.8)' : 'var(--text-light)' }}>{day.weekday}</div>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', margin: '5px auto 4px',
                background: day.count > 0 ? (day.is_today ? 'white' : 'var(--primary)') : 'var(--border)',
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: day.is_today ? 'white' : 'var(--text-mid)' }}>
                {day.count > 0 ? day.count : '-'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center', marginTop: 10 }}>
          今週は合計 <strong style={{ color: 'var(--primary)' }}>{weekTotal}回</strong> の遊びを記録しました
        </div>
      </div>

      {/* Top highlight */}
      {topCat && topCat[1] > 0 ? (
        <div style={{
          borderRadius: 'var(--radius)', padding: 20, margin: '12px 0',
          background: 'linear-gradient(135deg, #5B8EF0, #7B9FF5)',
          color: 'white', boxShadow: 'var(--shadow-md)',
          animation: 'fadeUp 0.4s ease 0.15s both',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{CATEGORY_ICONS[topCat[0]]}</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>今月いちばん多かった経験</div>
          <div style={{ fontSize: 28, fontWeight: 800, margin: '4px 0' }}>{topCat[0]} {topCat[1]}回！</div>
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
            {data.child_name}ちゃんは{topCat[0]}の経験がとても豊富です。<br />
            子どもの好奇心をしっかり伸ばせていますよ 😊
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 24, textAlign: 'center', margin: '12px 0', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>今月の記録を始めよう</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', margin: '8px 0' }}>遊びを記録すると成長グラフが表示されます</div>
        </div>
      )}

      {/* Recharts radar */}
      {data.total_month > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)', animation: 'fadeUp 0.4s ease 0.2s both' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>🕸️ 今月の経験バランス</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsRadar data={radarData}>
              <PolarGrid stroke="#F0EDE8" />
              <PolarAngleAxis dataKey="cat" tick={{ fontSize: 11, fontWeight: 700 }} />
              <Radar dataKey="value" stroke="#5B8EF0" fill="#5B8EF0" fillOpacity={0.25} strokeWidth={2.5} dot={{ fill: '#5B8EF0', r: 4 }} />
            </RechartsRadar>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category bars */}
      {data.total_month > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)', animation: 'fadeUp 0.4s ease 0.25s both' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📊 カテゴリ別の経験</div>
          {ALL_CATEGORIES.map(cat => {
            const count = data.monthly[cat] || 0;
            const maxCount = data.top_cats[0]?.[1] || 1;
            const pct = Math.round(count / maxCount * 100);
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{CATEGORY_ICONS[cat]} {cat}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{count}回</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 5,
                    background: CAT_COLORS[cat],
                    width: pct + '%',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranking */}
      {data.ranking.length > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)', animation: 'fadeUp 0.4s ease 0.3s both' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>🏆 よくやった遊び TOP5</div>
          {data.ranking.map((item, i) => (
            <div key={item.play_name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, flexShrink: 0,
                background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--bg)',
                color: i === 0 ? '#7A6000' : i === 1 ? '#555' : i === 2 ? 'white' : 'var(--text-light)',
              }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.play_name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{item.count}回</div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
