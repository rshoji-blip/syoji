import React, { useState } from 'react';
import { apiPost } from '../hooks/useApi';

interface Props { onDone: () => void; }

export default function Register({ onDone }: Props) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthdate) return;
    setSaving(true);
    setError('');
    const res = await apiPost<{ ok: boolean; error?: string }>('/register_child', { name, birthdate });
    if (!res.ok && res.error === 'duplicate') {
      setError(`「${name}」ちゃんはすでに登録されています`);
      setSaving(false);
      return;
    }
    onDone();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー：父親への共感から始める */}
      <div style={{ background: 'linear-gradient(135deg, #7DCFB6, #85C1E9)', padding: '36px 24px 44px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🌱</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1.4 }}>
          「今日、何して遊ぼう…」<br />と迷ったことはありませんか？
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 12, fontWeight: 600, lineHeight: 1.7 }}>
          そよじは、お子さんの成長に合わせて<br />
          「今日試してほしい遊び」を提案します。<br />
          検索いらず。3秒で見つかります。
        </div>
      </div>

      {/* 3つの価値 */}
      <div style={{ padding: '20px 20px 0' }}>
        {[
          { icon: '🎯', title: '今に合った遊びを提案', desc: '月齢・成長バランスから自動でピックアップ' },
          { icon: '📊', title: '伸ばせる経験がひと目でわかる', desc: 'どんな力を育てられるかレーダーチャートで確認' },
          { icon: '✏️', title: '週2回の記録でOK', desc: '土日だけでOK。負担ゼロで続けられます' },
        ].map(item => (
          <div key={item.title} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px',
            marginBottom: 10, boxShadow: 'var(--shadow)', border: '2px solid var(--border)',
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2, fontWeight: 600 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 登録フォーム */}
      <div style={{ padding: '16px 20px 40px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', border: '2px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, textAlign: 'center' }}>
            まずお子さんを登録しましょう
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
                👦 お子さんの名前
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="はなこ" required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 18,
                  border: '2.5px solid var(--border)', borderRadius: 14,
                  outline: 'none', fontFamily: 'inherit', fontWeight: 700,
                  background: 'var(--bg)',
                }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 7 }}>
                🎂 生年月日
              </label>
              <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 18,
                  border: '2.5px solid var(--border)', borderRadius: 14,
                  outline: 'none', fontFamily: 'inherit', fontWeight: 700,
                  background: 'var(--bg)',
                }} />
            </div>
            {error && (
              <div style={{
                background: '#FEE9E5', border: '2px solid var(--primary)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                fontSize: 13, fontWeight: 700, color: 'var(--primary)',
              }}>⚠️ {error}</div>
            )}
            <button type="submit" disabled={saving} style={{
              width: '100%', padding: 16, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
              color: 'white', border: 'none', fontSize: 17, fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,132,111,0.4)',
            }}>🌱 はじめる</button>
          </form>
        </div>
      </div>
    </div>
  );
}
