import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import { CATEGORY_ICONS } from '../types';

interface Play {
  id: string; name: string; style: string; dev_categories: string[];
  materials: string[]; steps: string[]; effects: string[]; reference_url?: string; icon?: string;
}

interface Props { playId: string; childName: string; onBack: () => void; }

const CAT_COLORS: Record<string, { bg: string; border: string; img: string }> = {
  "探索": { bg: "#FFF3E0", border: "#FFB74D", img: "/static/images/icons/cat_explore.png" },
  "創造": { bg: "#FCE4EC", border: "#F48FB1", img: "/static/images/icons/cat_create.png" },
  "会話": { bg: "#E8F5E9", border: "#81C784", img: "/static/images/icons/cat_talk.png" },
  "運動": { bg: "#E3F2FD", border: "#64B5F6", img: "/static/images/icons/cat_sport.png" },
  "感覚": { bg: "#F3E5F5", border: "#CE93D8", img: "/static/images/icons/cat_sense.png" },
  "協力": { bg: "#E0F7FA", border: "#4DD0E1", img: "/static/images/icons/cat_coop.png" },
  "挑戦": { bg: "#FFF8E1", border: "#FFD54F", img: "/static/images/icons/cat_challenge.png" },
};

export default function PlayDetail({ playId, childName, onBack }: Props) {
  const { data, loading } = useGet<{ play: Play; child_name: string }>(`/play_data/${playId}`);
  const [toast, setToast] = useState('');

  const logPlay = async (fav: boolean) => {
    if (!data) return;
    await apiPost('/log', { play_id: data.play.id, play_name: data.play.name, favorite: fav });
    setToast(fav ? '⭐ お気に入りに追加！' : '✅ きろくしました！');
    setTimeout(() => setToast(''), 2500);
  };

  if (loading || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12 }}>
      <div style={{ fontSize: 40, animation: 'bounce 1s ease infinite' }}>🎮</div>
      <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 700 }}>よみこみ中…</div>
    </div>
  );

  const { play } = data;
  const mainCat = play.dev_categories[0];
  const heroColor = CAT_COLORS[mainCat] || { bg: '#FFF3E0', border: '#FFB74D', img: '' };

  return (
    <div style={{ paddingBottom: 140, animation: 'fadeUp 0.3s ease both' }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${heroColor.bg}, white)`,
        padding: '28px 20px', textAlign: 'center',
        borderBottom: `3px solid ${heroColor.border}40`,
      }}>
        <img src={play.icon || heroColor.img || ''} alt={play.name} style={{ width: 110, height: 110, objectFit: 'contain', marginBottom: 12, borderRadius: 16 }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{play.name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 }}>
          {play.dev_categories.map(cat => {
            const c = CAT_COLORS[cat] || { bg: '#f5f5f5', border: '#ddd' };
            return (
              <span key={cat} style={{ background: c.bg, border: `2px solid ${c.border}60`, color: c.border, padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 900 }}>
                {CATEGORY_ICONS[cat]}{cat}
              </span>
            );
          })}
          <span style={{ background: 'var(--yellow-light)', border: '2px solid var(--yellow)', color: '#8B7000', padding: '5px 12px', borderRadius: 14, fontSize: 12, fontWeight: 900 }}>
            {play.style}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Materials */}
        {play.materials.length > 0 && play.materials[0] !== 'なし' && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 18, margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>🧰 <span>ようい するもの</span></div>
            {play.materials.map(m => (
              <div key={m} style={{ padding: '8px 0', borderBottom: '1.5px dashed var(--border)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--primary)' }}>•</span> {m}
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 18, margin: '0 0 12px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>📋 <span>やりかた</span></div>
          {play.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < play.steps.length - 1 ? '1.5px dashed var(--border)' : 'none', alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), #F4A0B5)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900, marginTop: 1,
                boxShadow: '0 2px 6px rgba(244,132,111,0.35)',
              }}>{i + 1}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, flex: 1, fontWeight: 600 }}>{step}</div>
            </div>
          ))}
        </div>

        {/* Effects */}
        {play.effects.length > 0 && (
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 18, margin: '0 0 16px', boxShadow: 'var(--shadow)', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>🌱 <span>はったつへのこうか</span></div>
            {play.effects.map(e => (
              <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1.5px dashed var(--border)' }}>
                <span style={{ color: 'var(--mint)', fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <button onClick={() => logPlay(false)} style={{
          width: '100%', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 10,
          background: 'linear-gradient(135deg, var(--mint), #52BE80)',
          color: 'white', border: 'none', fontSize: 16, fontWeight: 900,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(125,207,182,0.4)',
        }}>✅ これやったよ！きろくする</button>

        <button onClick={() => logPlay(true)} style={{
          width: '100%', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 10,
          background: 'var(--yellow-light)', color: '#8B7000',
          border: '2.5px solid var(--yellow)', fontSize: 16, fontWeight: 900, cursor: 'pointer',
        }}>⭐ お気に入りに追加</button>

        {play.reference_url && (
          <a href={play.reference_url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 16, borderRadius: 'var(--radius-sm)',
            background: 'white', color: 'var(--text-mid)',
            border: '2.5px solid var(--border)', fontSize: 16, fontWeight: 900, textDecoration: 'none',
            marginBottom: 10,
          }}>🎬 どうがでみる</a>
        )}
        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(play.name + ' 子供 遊び')}`} target="_blank" rel="noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: 16, borderRadius: 'var(--radius-sm)',
          background: '#FFF0F0', color: '#CC0000',
          border: '2.5px solid #FFAAAA', fontSize: 15, fontWeight: 900, textDecoration: 'none',
        }}>▶️ 「{play.name}」をYouTubeで見る</a>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`,
        background: 'linear-gradient(135deg, var(--mint), #52BE80)', color: 'white',
        padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 900,
        opacity: toast ? 1 : 0, transition: 'all 0.3s',
        pointerEvents: 'none', whiteSpace: 'nowrap',
        boxShadow: '0 4px 16px rgba(125,207,182,0.5)', zIndex: 999,
      }}>{toast}</div>
    </div>
  );
}
