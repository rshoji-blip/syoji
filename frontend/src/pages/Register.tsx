import React, { useState } from 'react';
import { apiPost } from '../hooks/useApi';

interface Props { onDone: () => void; }

export default function Register({ onDone }: Props) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthdate) return;
    setSaving(true);
    await apiPost('/register_child', { name, birthdate });
    onDone();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #F4A0B5, #C39BD3)', padding: '32px 20px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12, animation: 'bounce 1s ease infinite' }}>👶</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>そよじへようこそ！</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: 700 }}>
          お子さんのじょうほうをおしえてね
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1 }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', border: '2px solid var(--border)', animation: 'fadeUp 0.4s ease both' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>
                👦 お名前
              </label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="はなこ" required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 18,
                  border: '2.5px solid var(--border)', borderRadius: 16,
                  outline: 'none', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text)',
                  background: 'var(--bg)',
                }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>
                🎂 生年月日
              </label>
              <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)}
                required
                style={{
                  width: '100%', padding: '14px 16px', fontSize: 18,
                  border: '2.5px solid var(--border)', borderRadius: 16,
                  outline: 'none', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text)',
                  background: 'var(--bg)',
                }} />
            </div>
            <button type="submit" disabled={saving} style={{
              width: '100%', padding: 16, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--primary), #F4A0B5)',
              color: 'white', border: 'none', fontSize: 17, fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,132,111,0.4)',
            }}>🌱 スタートする！</button>
          </form>
        </div>
      </div>
    </div>
  );
}
