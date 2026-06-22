import React, { useState } from 'react';
import { useGet, apiPost } from '../hooks/useApi';
import { CATEGORY_ICONS } from '../types';

interface Play {
  id: string;
  name: string;
  style: string;
  dev_categories: string[];
  materials: string[];
  steps: string[];
  effects: string[];
  reference_url?: string;
}

interface Props {
  playId: string;
  childName: string;
  onBack: () => void;
}

export default function PlayDetail({ playId, childName, onBack }: Props) {
  const { data, loading } = useGet<{ play: Play; child_name: string }>(`/play_data/${playId}`);
  const [toast, setToast] = useState('');

  const logPlay = async (fav: boolean) => {
    if (!data) return;
    await apiPost('/log', { play_id: data.play.id, play_name: data.play.name, favorite: fav });
    setToast(fav ? '⭐ お気に入りに追加しました！' : '✅ 記録しました！');
    setTimeout(() => setToast(''), 2500);
  };

  if (loading || !data) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 32 }}>🎮</div>
      <div style={{ color: 'var(--text-light)', marginTop: 12 }}>読み込み中…</div>
    </div>
  );

  const { play } = data;

  return (
    <div style={{ padding: '0 16px 100px', animation: 'fadeUp 0.3s ease both' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
        borderRadius: 'var(--radius)', padding: 24, margin: '12px 0', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎮</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{play.name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 10 }}>
          {play.dev_categories.map(cat => (
            <div key={cat} style={{ background: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              {CATEGORY_ICONS[cat]}{cat}
            </div>
          ))}
          <div style={{ background: 'var(--secondary-light)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'var(--secondary)' }}>
            {play.style}
          </div>
        </div>
      </div>

      {/* Materials */}
      {play.materials.length > 0 && play.materials[0] !== 'なし' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>🧰 用意するもの</div>
          {play.materials.map(m => (
            <div key={m} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>・{m}</div>
          ))}
        </div>
      )}

      {/* Steps */}
      <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>📋 やり方</div>
        {play.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, marginTop: 1,
            }}>{i + 1}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>{step}</div>
          </div>
        ))}
      </div>

      {/* Effects */}
      {play.effects.length > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 20, margin: '12px 0', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>🌱 発達への効果</div>
          {play.effects.map(e => (
            <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--accent)' }}>✓</span>
              <span style={{ fontSize: 14 }}>{e}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ paddingBottom: 16 }}>
        <button onClick={() => logPlay(false)} style={{ width: '100%', padding: 15, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
          ✅ これやったよ！
        </button>
        <button onClick={() => logPlay(true)} style={{ width: '100%', padding: 15, borderRadius: 'var(--radius-sm)', background: 'var(--secondary-light)', color: 'var(--secondary)', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
          ⭐ お気に入りに追加
        </button>
        {play.reference_url && (
          <a href={play.reference_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 15, borderRadius: 'var(--radius-sm)', background: 'var(--bg)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', fontSize: 16, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
            🎬 動画で見る
          </a>
        )}
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 20}px)`,
        background: 'var(--accent)', color: 'white', padding: '12px 24px', borderRadius: 24,
        fontSize: 14, fontWeight: 700, opacity: toast ? 1 : 0, transition: 'all 0.3s',
        pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-md)', zIndex: 999,
      }}>{toast}</div>

      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
